/**
 * File: timeline-algorithm.js
 * Description: Twitter's hybrid timeline generation algorithm using push/pull models
 * 
 * Learning objectives:
 * - Understand the trade-offs between push (pre-computed) and pull (on-demand) models
 * - Learn how to handle different user types (celebrities vs regular users) efficiently
 * - See practical implementation of timeline fan-out and aggregation strategies
 * 
 * Time Complexity: 
 * - Push model: O(F) where F is follower count (expensive for celebrities)
 * - Pull model: O(N*log N) where N is number of following users (expensive at read time)
 * - Hybrid: O(F) for regular users, O(N*log N) for celebrities
 * 
 * Space Complexity: O(U*T) where U is users and T is cached tweets per user
 */

const Redis = require('redis');
const { v4: uuidv4 } = require('uuid');

// Configuration constants for celebrity threshold and cache settings
const CELEBRITY_THRESHOLD = 1000000; // Users with >1M followers are celebrities
const MEGA_CELEBRITY_THRESHOLD = 10000000; // Users with >10M followers 
const TIMELINE_CACHE_SIZE = 800; // Number of tweets to cache per user
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds
const ACTIVE_USER_THRESHOLD = 7; // Active if logged in within 7 days

class TimelineService {
  constructor() {
    this.redisClient = Redis.createClient();
    this.cassandraClient = null; // Would be initialized with Cassandra driver
    this.kafkaProducer = null; // Would be initialized with Kafka client
  }

  /**
   * Post a new tweet - uses hybrid fan-out strategy
   * For regular users: immediate fan-out to all followers (push model)
   * For celebrities: selective fan-out + mark for pull-based retrieval
   */
  async postTweet(userId, tweetContent, mediaUrls = []) {
    try {
      // Step 1: Save tweet to database with generated UUID
      const tweetId = uuidv4();
      const tweet = {
        tweet_id: tweetId,
        user_id: userId,
        text: tweetContent,
        media_urls: mediaUrls,
        created_at: new Date(),
        likes_count: 0,
        retweet_count: 0
      };

      // Save to Cassandra for durability and scalability
      await this.saveTweetToDatabase(tweet);
      
      // Step 2: Get user's follower count to determine fan-out strategy
      const userInfo = await this.getUserInfo(userId);
      const followerCount = userInfo.followers_count;

      if (followerCount <= CELEBRITY_THRESHOLD) {
        // Regular user: Use push model - fan out to all followers
        await this.fanOutToAllFollowers(userId, tweet);
      } else if (followerCount <= MEGA_CELEBRITY_THRESHOLD) {
        // Celebrity: Hybrid approach - selective push + pull model
        await this.handleCelebrityTweet(userId, tweet, 'celebrity');
      } else {
        // Mega celebrity: Mostly pull model with minimal push
        await this.handleCelebrityTweet(userId, tweet, 'mega_celebrity');
      }

      // Step 3: Handle additional processing asynchronously
      await this.enqueueAsyncTasks(tweet);

      return tweetId;
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }

  /**
   * Fan-out tweet to all followers (Push Model)
   * This pre-computes timelines by pushing tweets to followers' cached timelines
   * Expensive for celebrities but provides fast timeline reads
   */
  async fanOutToAllFollowers(userId, tweet) {
    try {
      // Get all followers in batches to avoid memory issues
      const batchSize = 1000;
      let offset = 0;
      let hasMoreFollowers = true;

      while (hasMoreFollowers) {
        // Fetch followers in batches for memory efficiency
        const followers = await this.getFollowersBatch(userId, offset, batchSize);
        
        if (followers.length === 0) {
          hasMoreFollowers = false;
          break;
        }

        // Process each follower in parallel for better performance
        const fanOutPromises = followers.map(async (followerId) => {
          try {
            // Check if user is active - only cache for active users to save space
            const isActive = await this.isActiveUser(followerId);
            
            if (isActive) {
              // Add tweet to follower's cached timeline (Redis)
              await this.addToTimelineCache(followerId, tweet);
            }
            
            // Always add to persistent timeline storage (Cassandra)
            // This serves as fallback and for inactive users who become active
            await this.addToTimelineDatabase(followerId, tweet);
          } catch (error) {
            // Log error but don't fail entire fan-out for one user
            console.error(`Failed to fan out to user ${followerId}:`, error);
          }
        });

        // Execute all fan-out operations in parallel for this batch
        await Promise.allSettled(fanOutPromises);
        
        offset += batchSize;
      }
    } catch (error) {
      console.error('Error in fan-out process:', error);
      throw error;
    }
  }

  /**
   * Handle celebrity tweet with selective fan-out
   * Uses hybrid approach: push to most active followers, pull for others
   */
  async handleCelebrityTweet(userId, tweet, celebrityTier) {
    try {
      // Mark tweet for pull-based retrieval
      await this.markCelebrityTweet(userId, tweet, celebrityTier);

      if (celebrityTier === 'celebrity') {
        // For celebrities (1M-10M): Push to highly active followers only
        const activeFollowers = await this.getMostActiveFollowers(userId, 10000);
        await this.fanOutToSpecificUsers(activeFollowers, tweet);
      } else if (celebrityTier === 'mega_celebrity') {
        // For mega celebrities (>10M): Very selective push to super active users
        const superActiveFollowers = await this.getMostActiveFollowers(userId, 1000);
        await this.fanOutToSpecificUsers(superActiveFollowers, tweet);
      }

      // Notify recommendation service for trending calculation
      await this.notifyRecommendationService(tweet);
    } catch (error) {
      console.error('Error handling celebrity tweet:', error);
      throw error;
    }
  }

  /**
   * Generate home timeline for a user (Pull Model)
   * This aggregates tweets on-demand from users the person follows
   * More expensive at read time but saves on storage and handles celebrities well
   */
  async getHomeTimeline(userId, count = 20, maxId = null) {
    try {
      // Step 1: Try to get cached timeline first (fast path)
      const cachedTimeline = await this.getCachedTimeline(userId, count, maxId);
      if (cachedTimeline && cachedTimeline.length >= count) {
        return this.hydrateTweets(cachedTimeline.slice(0, count));
      }

      // Step 2: Generate timeline on-demand (slower path)
      return await this.generateTimelineOnDemand(userId, count, maxId);
    } catch (error) {
      console.error('Error getting home timeline:', error);
      throw error;
    }
  }

  /**
   * Generate timeline on-demand by aggregating from followed users
   * This method handles the complexity of merging regular users and celebrities
   */
  async generateTimelineOnDemand(userId, count, maxId) {
    try {
      // Step 1: Get list of users this person follows
      const following = await this.getUserFollowing(userId);
      
      if (following.length === 0) {
        return []; // No one to follow
      }

      // Step 2: Separate celebrities from regular users for different handling
      const celebrities = [];
      const regularUsers = [];

      for (const followedUserId of following) {
        const userInfo = await this.getUserInfo(followedUserId);
        if (userInfo.followers_count > CELEBRITY_THRESHOLD) {
          celebrities.push(followedUserId);
        } else {
          regularUsers.push(followedUserId);
        }
      }

      // Step 3: Get pre-computed timeline for regular users (cached data)
      let timelineTweets = [];
      if (regularUsers.length > 0) {
        timelineTweets = await this.getPrecomputedTimeline(userId, regularUsers, count * 2);
      }

      // Step 4: Merge in celebrity tweets on-the-fly (pull fresh data)
      if (celebrities.length > 0) {
        const celebrityTweets = await this.getCelebrityTweets(celebrities, maxId, count);
        timelineTweets = this.mergeTweetsByTime(timelineTweets, celebrityTweets);
      }

      // Step 5: Sort by timestamp and apply ranking algorithm if needed
      timelineTweets.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

      // Step 6: Cache the generated timeline for future requests
      await this.cacheGeneratedTimeline(userId, timelineTweets);

      // Step 7: Return hydrated tweets with full content
      return this.hydrateTweets(timelineTweets.slice(0, count));
    } catch (error) {
      console.error('Error generating timeline on-demand:', error);
      throw error;
    }
  }

  /**
   * Get recent tweets from celebrity users
   * Fetches fresh data since celebrity tweets aren't pre-computed in timelines
   */
  async getCelebrityTweets(celebrityUserIds, maxId, limit) {
    const celebrityTweets = [];
    
    // Get recent tweets from each celebrity (last 24 hours to stay fresh)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const celebrityId of celebrityUserIds) {
      try {
        // Fetch recent tweets from this celebrity
        const tweets = await this.getUserRecentTweets(celebrityId, since, limit);
        celebrityTweets.push(...tweets);
      } catch (error) {
        console.error(`Error fetching tweets from celebrity ${celebrityId}:`, error);
        // Continue with other celebrities even if one fails
      }
    }

    return celebrityTweets;
  }

  /**
   * Merge two arrays of tweets by timestamp while maintaining chronological order
   * Used to combine pre-computed timeline with fresh celebrity tweets
   */
  mergeTweetsByTime(precomputedTweets, celebrityTweets) {
    const merged = [];
    let i = 0, j = 0;

    // Merge sort algorithm to maintain chronological order
    while (i < precomputedTweets.length && j < celebrityTweets.length) {
      const tweet1 = precomputedTweets[i];
      const tweet2 = celebrityTweets[j];
      
      if (tweet1.created_at.getTime() >= tweet2.created_at.getTime()) {
        merged.push(tweet1);
        i++;
      } else {
        merged.push(tweet2);
        j++;
      }
    }

    // Add remaining tweets from both arrays
    while (i < precomputedTweets.length) {
      merged.push(precomputedTweets[i++]);
    }
    
    while (j < celebrityTweets.length) {
      merged.push(celebrityTweets[j++]);
    }

    return merged;
  }

  // ========================
  // Helper Methods
  // ========================

  async addToTimelineCache(userId, tweet) {
    const cacheKey = `home_timeline:${userId}`;
    const tweetData = JSON.stringify({
      tweet_id: tweet.tweet_id,
      created_at: tweet.created_at,
      user_id: tweet.user_id
    });

    // Add to Redis sorted set with timestamp as score for chronological ordering
    await this.redisClient.zadd(cacheKey, tweet.created_at.getTime(), tweetData);
    
    // Trim to keep only most recent tweets (prevent unbounded growth)
    await this.redisClient.zremrangebyrank(cacheKey, 0, -(TIMELINE_CACHE_SIZE + 1));
    
    // Set expiration to prevent stale data
    await this.redisClient.expire(cacheKey, CACHE_TTL);
  }

  async getCachedTimeline(userId, count, maxId) {
    const cacheKey = `home_timeline:${userId}`;
    
    // Get tweets from Redis sorted set in reverse chronological order
    const tweets = await this.redisClient.zrevrange(cacheKey, 0, count - 1);
    
    return tweets.map(tweetJson => JSON.parse(tweetJson));
  }

  async isActiveUser(userId) {
    // Check if user has been active within the threshold period
    const lastSeen = await this.getUserLastSeen(userId);
    const activeThreshold = new Date(Date.now() - ACTIVE_USER_THRESHOLD * 24 * 60 * 60 * 1000);
    
    return lastSeen && lastSeen > activeThreshold;
  }

  async getMostActiveFollowers(userId, limit) {
    // Get followers sorted by recent activity/engagement
    // This could use factors like: recent login, tweet frequency, engagement rate
    return await this.queryActiveFollowers(userId, limit);
  }

  /**
   * Hydrate tweet IDs with full tweet content and user information
   * This step fetches the actual tweet text, user details, media, etc.
   */
  async hydrateTweets(tweetReferences) {
    if (!tweetReferences.length) return [];

    const tweetIds = tweetReferences.map(ref => ref.tweet_id);
    
    // Batch fetch all tweet details to minimize database calls
    const tweets = await this.getTweetsByIds(tweetIds);
    
    // Also fetch user information for each tweet author
    const userIds = [...new Set(tweets.map(tweet => tweet.user_id))];
    const users = await this.getUsersByIds(userIds);
    const userMap = new Map(users.map(user => [user.user_id, user]));

    // Combine tweet content with user information
    return tweets.map(tweet => ({
      ...tweet,
      user: userMap.get(tweet.user_id)
    }));
  }

  // Placeholder methods - these would integrate with actual database/cache clients
  async saveTweetToDatabase(tweet) { /* Cassandra insert */ }
  async getUserInfo(userId) { /* PostgreSQL query */ }
  async getFollowersBatch(userId, offset, limit) { /* PostgreSQL query */ }
  async addToTimelineDatabase(userId, tweet) { /* Cassandra insert */ }
  async getUserFollowing(userId) { /* PostgreSQL query */ }
  async getUserRecentTweets(userId, since, limit) { /* Cassandra query */ }
  async getTweetsByIds(tweetIds) { /* Cassandra batch query */ }
  async getUsersByIds(userIds) { /* PostgreSQL batch query */ }
}

// Export for use in other modules and testing
module.exports = { 
  TimelineService,
  CELEBRITY_THRESHOLD,
  TIMELINE_CACHE_SIZE
};