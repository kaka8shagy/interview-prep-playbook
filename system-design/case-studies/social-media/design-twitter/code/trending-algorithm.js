/**
 * File: trending-algorithm.js
 * Description: Twitter's trending topics algorithm using sliding window and decay functions
 * 
 * Learning objectives:
 * - Understand how to identify viral/trending content in real-time
 * - Learn sliding window algorithms for time-series data
 * - See how to apply decay functions to weight recent content more heavily
 * - Understand velocity-based trending (rate of increase, not just volume)
 * 
 * Time Complexity: O(N log N) for sorting trends, O(1) for hashtag updates
 * Space Complexity: O(H * T) where H is hashtags and T is time windows
 */

const Redis = require('redis');

// Configuration for trending algorithm
const TRENDING_WINDOW_HOURS = 2; // Look at last 2 hours for trending
const TRENDING_UPDATE_INTERVAL = 5 * 60 * 1000; // Update every 5 minutes
const MIN_MENTIONS_FOR_TRENDING = 50; // Minimum mentions to be considered
const DECAY_FACTOR = 0.95; // How much to decay older mentions (95% = gentle decay)
const VELOCITY_WEIGHT = 0.6; // How much to weight velocity vs volume
const SPAM_THRESHOLD = 0.8; // Threshold for spam detection

class TrendingService {
  constructor() {
    this.redisClient = Redis.createClient();
    this.currentTrends = new Map(); // In-memory cache of current trends
    this.lastUpdate = new Date();
  }

  /**
   * Process a new tweet to extract hashtags and update trending counts
   * Called every time a new tweet is posted
   */
  async processTweetForTrending(tweet) {
    try {
      // Extract hashtags from tweet text
      const hashtags = this.extractHashtags(tweet.text);
      
      if (hashtags.length === 0) {
        return; // No hashtags to process
      }

      const timestamp = tweet.created_at;
      const userId = tweet.user_id;
      const tweetId = tweet.tweet_id;

      // Process each hashtag found in the tweet
      for (const hashtag of hashtags) {
        await this.incrementHashtagCount(hashtag, timestamp, userId, tweetId);
      }

      // Check if it's time to recalculate trending topics
      if (this.shouldUpdateTrending()) {
        await this.calculateTrendingTopics();
      }
    } catch (error) {
      console.error('Error processing tweet for trending:', error);
    }
  }

  /**
   * Extract hashtags from tweet text using regex
   * Returns array of hashtags in lowercase for case-insensitive matching
   */
  extractHashtags(text) {
    if (!text) return [];
    
    // Regex to match hashtags: # followed by alphanumeric characters
    // Supports international characters and underscores
    const hashtagRegex = /#[a-zA-Z0-9_\u00C0-\u017F\u4e00-\u9fff]+/g;
    const matches = text.match(hashtagRegex) || [];
    
    return matches
      .map(hashtag => hashtag.slice(1).toLowerCase()) // Remove # and lowercase
      .filter(hashtag => hashtag.length >= 2 && hashtag.length <= 100) // Valid length
      .slice(0, 10); // Limit hashtags per tweet to prevent spam
  }

  /**
   * Increment count for a hashtag in time-bucketed storage
   * Uses Redis sorted sets to track hashtag mentions over time
   */
  async incrementHashtagCount(hashtag, timestamp, userId, tweetId) {
    try {
      // Create time bucket (round to nearest 5 minutes for granularity)
      const timeBucket = this.roundToTimeBucket(timestamp, 5); // 5-minute buckets
      
      // Keys for Redis storage
      const hashtagTimeKey = `hashtag_time:${hashtag}`;
      const hashtagUsersKey = `hashtag_users:${hashtag}:${timeBucket}`;
      const globalCountKey = `hashtag_global:${timeBucket}`;

      // Store hashtag count with timestamp as score (for time-based queries)
      await this.redisClient.zadd(hashtagTimeKey, timeBucket, tweetId);
      
      // Track unique users mentioning this hashtag (spam detection)
      await this.redisClient.sadd(hashtagUsersKey, userId);
      
      // Track global hashtag activity for this time bucket
      await this.redisClient.zadd(globalCountKey, 1, hashtag);
      
      // Set expiration to clean up old data automatically
      const expirationTime = 7 * 24 * 60 * 60; // 7 days
      await this.redisClient.expire(hashtagTimeKey, expirationTime);
      await this.redisClient.expire(hashtagUsersKey, expirationTime);
      await this.redisClient.expire(globalCountKey, expirationTime);
      
    } catch (error) {
      console.error(`Error incrementing hashtag count for ${hashtag}:`, error);
    }
  }

  /**
   * Calculate current trending topics using sliding window algorithm
   * This is the core algorithm that determines what's trending
   */
  async calculateTrendingTopics() {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - TRENDING_WINDOW_HOURS * 60 * 60 * 1000);
      
      // Get all hashtags mentioned in the trending window
      const hashtagCandidates = await this.getHashtagCandidates(windowStart, now);
      
      if (hashtagCandidates.length === 0) {
        return [];
      }

      // Calculate trending score for each hashtag
      const trendingScores = await Promise.all(
        hashtagCandidates.map(async (hashtag) => {
          const score = await this.calculateTrendingScore(hashtag, windowStart, now);
          return { hashtag, score };
        })
      );

      // Filter out hashtags that don't meet minimum criteria
      const validTrends = trendingScores.filter(trend => 
        trend.score.totalMentions >= MIN_MENTIONS_FOR_TRENDING &&
        trend.score.spamScore < SPAM_THRESHOLD
      );

      // Sort by trending score (combination of volume and velocity)
      validTrends.sort((a, b) => b.score.trendingScore - a.score.trendingScore);

      // Take top 50 trends and cache them
      const topTrends = validTrends.slice(0, 50);
      await this.cacheTrendingResults(topTrends);
      
      this.currentTrends = new Map(
        topTrends.map(trend => [trend.hashtag, trend.score])
      );
      
      this.lastUpdate = now;
      
      return topTrends.slice(0, 10); // Return top 10 for public API
    } catch (error) {
      console.error('Error calculating trending topics:', error);
      return [];
    }
  }

  /**
   * Calculate comprehensive trending score for a hashtag
   * Combines volume, velocity, and spam detection
   */
  async calculateTrendingScore(hashtag, windowStart, windowEnd) {
    try {
      // Get time-series data for this hashtag
      const mentionData = await this.getHashtagMentions(hashtag, windowStart, windowEnd);
      
      if (mentionData.length === 0) {
        return { totalMentions: 0, velocity: 0, trendingScore: 0, spamScore: 1 };
      }

      // Calculate basic metrics
      const totalMentions = mentionData.length;
      const uniqueUsers = await this.getUniqueUsersCount(hashtag, windowStart, windowEnd);
      
      // Calculate velocity (rate of change)
      const velocity = this.calculateVelocity(mentionData, windowStart, windowEnd);
      
      // Calculate spam score (high spam = low diversity of users)
      const spamScore = this.calculateSpamScore(totalMentions, uniqueUsers);
      
      // Apply time decay to give more weight to recent mentions
      const decayedVolume = this.applyTimeDecay(mentionData, windowEnd);
      
      // Combine volume and velocity with weighting
      const volumeScore = decayedVolume;
      const velocityScore = velocity * 100; // Scale velocity
      
      const trendingScore = (volumeScore * (1 - VELOCITY_WEIGHT)) + 
                           (velocityScore * VELOCITY_WEIGHT);

      return {
        totalMentions,
        uniqueUsers,
        velocity,
        spamScore,
        trendingScore: trendingScore * (1 - spamScore), // Penalize spam
        volumeScore,
        velocityScore
      };
    } catch (error) {
      console.error(`Error calculating trending score for ${hashtag}:`, error);
      return { totalMentions: 0, velocity: 0, trendingScore: 0, spamScore: 1 };
    }
  }

  /**
   * Calculate velocity - how fast mentions are increasing
   * This catches hashtags that are rapidly gaining momentum
   */
  calculateVelocity(mentionData, windowStart, windowEnd) {
    if (mentionData.length < 2) return 0;

    const windowDurationMinutes = (windowEnd - windowStart) / (1000 * 60);
    const halfPoint = new Date(windowStart.getTime() + windowDurationMinutes * 30 * 1000);
    
    // Split data into two halves of the time window
    const firstHalfMentions = mentionData.filter(mention => 
      mention.timestamp < halfPoint
    ).length;
    
    const secondHalfMentions = mentionData.filter(mention => 
      mention.timestamp >= halfPoint
    ).length;

    // Velocity = (recent mentions - older mentions) / older mentions
    // Handles division by zero and gives high velocity for new trends
    if (firstHalfMentions === 0) {
      return secondHalfMentions > 0 ? 1.0 : 0;
    }
    
    return (secondHalfMentions - firstHalfMentions) / firstHalfMentions;
  }

  /**
   * Apply exponential decay to give more weight to recent mentions
   * Recent mentions count more than older ones
   */
  applyTimeDecay(mentionData, currentTime) {
    let decayedSum = 0;
    
    for (const mention of mentionData) {
      // Calculate age in hours
      const ageHours = (currentTime - mention.timestamp) / (1000 * 60 * 60);
      
      // Apply exponential decay: more recent = higher weight
      const decayMultiplier = Math.pow(DECAY_FACTOR, ageHours);
      decayedSum += decayMultiplier;
    }
    
    return decayedSum;
  }

  /**
   * Calculate spam score based on user diversity
   * High spam = many tweets from few users
   * Low spam = tweets from many different users
   */
  calculateSpamScore(totalMentions, uniqueUsers) {
    if (uniqueUsers === 0 || totalMentions === 0) return 1; // Maximum spam score
    
    const userDiversityRatio = uniqueUsers / totalMentions;
    
    // If diversity ratio is very low (many tweets from few users), it's likely spam
    if (userDiversityRatio < 0.1) return 0.9; // High spam
    if (userDiversityRatio < 0.3) return 0.5; // Medium spam
    
    return Math.max(0, 1 - userDiversityRatio * 2); // Lower spam for diverse users
  }

  /**
   * Get current top trending topics (cached results)
   * This is called by the API to serve trending topics to users
   */
  async getCurrentTrending(count = 10, location = 'global') {
    // If cache is stale, refresh trending topics
    if (this.shouldUpdateTrending()) {
      await this.calculateTrendingTopics();
    }

    // Convert map to array and sort by score
    const trendingArray = Array.from(this.currentTrends.entries())
      .map(([hashtag, score]) => ({ hashtag, ...score }))
      .sort((a, b) => b.trendingScore - a.trendingScore);

    // Return requested number of trends
    return trendingArray.slice(0, count).map(trend => ({
      hashtag: trend.hashtag,
      trendingScore: Math.round(trend.trendingScore),
      totalMentions: trend.totalMentions,
      velocity: Math.round(trend.velocity * 100) / 100 // Round to 2 decimal places
    }));
  }

  // ========================
  // Helper Methods
  // ========================

  roundToTimeBucket(timestamp, intervalMinutes) {
    const time = new Date(timestamp);
    const minutes = Math.floor(time.getMinutes() / intervalMinutes) * intervalMinutes;
    time.setMinutes(minutes, 0, 0); // Round to nearest interval
    return time.getTime();
  }

  shouldUpdateTrending() {
    const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
    return timeSinceUpdate >= TRENDING_UPDATE_INTERVAL;
  }

  async getHashtagCandidates(windowStart, windowEnd) {
    // Get all hashtags that were mentioned in the time window
    // This would query Redis to get all hashtags with activity in the timeframe
    const startBucket = this.roundToTimeBucket(windowStart, 5);
    const endBucket = this.roundToTimeBucket(windowEnd, 5);
    
    const hashtags = new Set();
    
    // Iterate through time buckets to find all active hashtags
    for (let bucket = startBucket; bucket <= endBucket; bucket += 5 * 60 * 1000) {
      const bucketHashtags = await this.redisClient.zrange(`hashtag_global:${bucket}`, 0, -1);
      bucketHashtags.forEach(hashtag => hashtags.add(hashtag));
    }
    
    return Array.from(hashtags);
  }

  async getHashtagMentions(hashtag, windowStart, windowEnd) {
    const key = `hashtag_time:${hashtag}`;
    const mentions = await this.redisClient.zrangebyscore(
      key, 
      windowStart.getTime(), 
      windowEnd.getTime(),
      'WITHSCORES'
    );
    
    // Convert Redis response to structured data
    const mentionData = [];
    for (let i = 0; i < mentions.length; i += 2) {
      mentionData.push({
        tweetId: mentions[i],
        timestamp: new Date(parseInt(mentions[i + 1]))
      });
    }
    
    return mentionData;
  }

  async getUniqueUsersCount(hashtag, windowStart, windowEnd) {
    // Count unique users across all time buckets in the window
    const startBucket = this.roundToTimeBucket(windowStart, 5);
    const endBucket = this.roundToTimeBucket(windowEnd, 5);
    
    const allUsers = new Set();
    
    for (let bucket = startBucket; bucket <= endBucket; bucket += 5 * 60 * 1000) {
      const bucketUsers = await this.redisClient.smembers(`hashtag_users:${hashtag}:${bucket}`);
      bucketUsers.forEach(user => allUsers.add(user));
    }
    
    return allUsers.size;
  }

  async cacheTrendingResults(trends) {
    const cacheKey = 'trending_topics:current';
    const cacheData = JSON.stringify({
      trends,
      timestamp: Date.now()
    });
    
    await this.redisClient.setex(cacheKey, 300, cacheData); // Cache for 5 minutes
  }
}

// Export for use in other modules
module.exports = {
  TrendingService,
  TRENDING_WINDOW_HOURS,
  MIN_MENTIONS_FOR_TRENDING,
  VELOCITY_WEIGHT
};