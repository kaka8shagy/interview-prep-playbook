/**
 * File: fan-out-service.js
 * Description: Twitter's fan-out service for distributing tweets to follower timelines
 * 
 * Learning objectives:
 * - Understand the fan-out pattern for social media timeline distribution
 * - Learn how to handle high-throughput message distribution efficiently
 * - See practical implementations of queue-based processing with error handling
 * - Understand backpressure handling and circuit breaker patterns
 * 
 * Time Complexity: O(F) where F is the number of followers (parallelized)
 * Space Complexity: O(B) where B is the batch size for processing
 */

const EventEmitter = require('events');

// Configuration constants for fan-out processing
const BATCH_SIZE = 1000; // Process followers in batches
const MAX_CONCURRENT_BATCHES = 10; // Limit concurrent processing
const RETRY_ATTEMPTS = 3; // Number of retry attempts for failures
const RETRY_DELAY_MS = 1000; // Initial retry delay
const CIRCUIT_BREAKER_THRESHOLD = 10; // Failures before circuit opens
const CIRCUIT_BREAKER_TIMEOUT = 30000; // Time before trying to close circuit

class FanOutService extends EventEmitter {
  constructor(timelineService, queueService, redisClient) {
    super();
    this.timelineService = timelineService;
    this.queueService = queueService;
    this.redisClient = redisClient;
    
    // Circuit breaker state for handling service failures
    this.circuitBreaker = {
      isOpen: false,
      failures: 0,
      lastFailureTime: null
    };
    
    // Performance metrics
    this.metrics = {
      totalFanOuts: 0,
      successfulFanOuts: 0,
      failedFanOuts: 0,
      avgProcessingTime: 0
    };
  }

  /**
   * Main entry point for fan-out process
   * Orchestrates the distribution of a tweet to all relevant follower timelines
   */
  async fanOutTweet(tweet, userFollowerCount) {
    const startTime = Date.now();
    
    try {
      // Emit event for monitoring/analytics
      this.emit('fanout_started', { 
        tweetId: tweet.tweet_id, 
        userId: tweet.user_id,
        followerCount: userFollowerCount 
      });

      // Choose fan-out strategy based on follower count and system load
      const strategy = this.determineFanOutStrategy(userFollowerCount);
      
      let result;
      switch (strategy) {
        case 'immediate':
          result = await this.immediatesFanOut(tweet);
          break;
        case 'queued':
          result = await this.queuedFanOut(tweet);
          break;
        case 'hybrid':
          result = await this.hybridFanOut(tweet);
          break;
        default:
          throw new Error(`Unknown fan-out strategy: ${strategy}`);
      }

      // Update metrics
      this.updateMetrics('success', Date.now() - startTime);
      
      // Emit success event
      this.emit('fanout_completed', { 
        tweetId: tweet.tweet_id, 
        strategy,
        processingTime: Date.now() - startTime,
        ...result 
      });

      return result;
    } catch (error) {
      // Update metrics and emit error event
      this.updateMetrics('failure', Date.now() - startTime);
      this.emit('fanout_failed', { 
        tweetId: tweet.tweet_id,
        error: error.message,
        processingTime: Date.now() - startTime
      });
      
      console.error(`Fan-out failed for tweet ${tweet.tweet_id}:`, error);
      throw error;
    }
  }

  /**
   * Determine the best fan-out strategy based on follower count and system state
   * This adaptive approach optimizes performance based on current conditions
   */
  determineFanOutStrategy(followerCount) {
    // Check current system load and circuit breaker state
    const systemLoad = this.getCurrentSystemLoad();
    const isHighLoad = systemLoad > 0.8;
    
    if (this.circuitBreaker.isOpen) {
      return 'queued'; // Always queue when circuit is open
    }
    
    // Strategy decision matrix based on followers and system state
    if (followerCount < 1000 && !isHighLoad) {
      return 'immediate'; // Small follower count - process immediately
    } else if (followerCount < 100000) {
      return 'hybrid'; // Medium follower count - hybrid approach
    } else {
      return 'queued'; // Large follower count - always queue
    }
  }

  /**
   * Immediate fan-out: Process all followers synchronously in batches
   * Used for users with small follower counts when system load is low
   */
  async immediatesFanOut(tweet) {
    const startTime = Date.now();
    const followers = await this.getAllFollowers(tweet.user_id);
    
    if (followers.length === 0) {
      return { strategy: 'immediate', followersProcessed: 0, batchesProcessed: 0 };
    }

    // Process followers in batches to avoid overwhelming the system
    const batches = this.createBatches(followers, BATCH_SIZE);
    let successCount = 0;
    let errorCount = 0;

    // Limit concurrent batch processing to prevent resource exhaustion
    const semaphore = new Semaphore(MAX_CONCURRENT_BATCHES);

    const batchPromises = batches.map(async (batch, index) => {
      await semaphore.acquire();
      
      try {
        const result = await this.processBatch(tweet, batch, index);
        successCount += result.successCount;
        errorCount += result.errorCount;
        
        return result;
      } catch (error) {
        console.error(`Batch ${index} processing failed:`, error);
        errorCount += batch.length;
        throw error;
      } finally {
        semaphore.release();
      }
    });

    // Wait for all batches to complete
    await Promise.allSettled(batchPromises);

    return {
      strategy: 'immediate',
      followersProcessed: successCount,
      followersErrored: errorCount,
      batchesProcessed: batches.length,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Queued fan-out: Add fan-out job to message queue for async processing
   * Used for users with large follower counts or when system is under high load
   */
  async queuedFanOut(tweet) {
    const fanOutJob = {
      type: 'tweet_fanout',
      tweetId: tweet.tweet_id,
      userId: tweet.user_id,
      tweet: tweet,
      createdAt: new Date().toISOString(),
      priority: this.calculateJobPriority(tweet),
      retryCount: 0
    };

    // Add job to queue with appropriate priority and retry settings
    const jobId = await this.queueService.addJob('fanout_queue', fanOutJob, {
      priority: fanOutJob.priority,
      attempts: RETRY_ATTEMPTS,
      delay: 0, // Process immediately
      removeOnComplete: 10, // Keep last 10 completed jobs
      removeOnFail: 50 // Keep last 50 failed jobs for debugging
    });

    return {
      strategy: 'queued',
      jobId: jobId,
      queuedAt: new Date().toISOString()
    };
  }

  /**
   * Hybrid fan-out: Immediate processing for active users, queued for inactive
   * Optimizes for immediate delivery to engaged users while handling scale
   */
  async hybridFanOut(tweet) {
    const startTime = Date.now();
    const allFollowers = await this.getAllFollowers(tweet.user_id);
    
    if (allFollowers.length === 0) {
      return { strategy: 'hybrid', activeProcessed: 0, queuedForInactive: 0 };
    }

    // Separate active and inactive followers for different processing
    const { activeFollowers, inactiveFollowers } = 
      await this.categorizeFollowersByActivity(allFollowers);

    // Process active followers immediately for better user experience
    let activeProcessed = 0;
    if (activeFollowers.length > 0) {
      const activeResult = await this.processBatch(tweet, activeFollowers, 0);
      activeProcessed = activeResult.successCount;
    }

    // Queue processing for inactive followers to avoid blocking
    let queueJobId = null;
    if (inactiveFollowers.length > 0) {
      const queueResult = await this.queueFollowerBatch(tweet, inactiveFollowers);
      queueJobId = queueResult.jobId;
    }

    return {
      strategy: 'hybrid',
      activeProcessed: activeProcessed,
      queuedForInactive: inactiveFollowers.length,
      queueJobId: queueJobId,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Process a batch of followers by adding tweet to their timelines
   * Includes error handling and retry logic for individual failures
   */
  async processBatch(tweet, followerBatch, batchIndex) {
    const batchStartTime = Date.now();
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Check circuit breaker before processing
    if (this.shouldOpenCircuit()) {
      this.openCircuit();
      throw new Error('Circuit breaker opened due to high failure rate');
    }

    // Process each follower in the batch
    const followerPromises = followerBatch.map(async (followerId) => {
      let retryCount = 0;
      
      while (retryCount < RETRY_ATTEMPTS) {
        try {
          await this.addTweetToFollowerTimeline(tweet, followerId);
          successCount++;
          
          // Reset circuit breaker failures on success
          this.recordSuccess();
          return { followerId, success: true };
          
        } catch (error) {
          retryCount++;
          this.recordFailure();
          
          // If this is the last retry, record the error
          if (retryCount >= RETRY_ATTEMPTS) {
            errorCount++;
            errors.push({ followerId, error: error.message });
            
            console.error(`Failed to add tweet to timeline for user ${followerId} after ${RETRY_ATTEMPTS} attempts:`, error);
            return { followerId, success: false, error: error.message };
          }
          
          // Exponential backoff for retries
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount - 1);
          await this.sleep(delay);
        }
      }
    });

    // Wait for all follower updates to complete
    await Promise.allSettled(followerPromises);

    const batchProcessingTime = Date.now() - batchStartTime;
    
    // Log batch completion metrics
    console.log(`Batch ${batchIndex} completed: ${successCount} success, ${errorCount} errors in ${batchProcessingTime}ms`);

    return {
      batchIndex,
      successCount,
      errorCount,
      errors,
      processingTime: batchProcessingTime
    };
  }

  /**
   * Add tweet to a specific follower's timeline
   * This is the core operation that updates individual user timelines
   */
  async addTweetToFollowerTimeline(tweet, followerId) {
    // Check if follower is active to decide caching strategy
    const isActive = await this.isActiveFollower(followerId);
    
    if (isActive) {
      // Add to Redis cache for fast timeline retrieval
      await this.timelineService.addToTimelineCache(followerId, tweet);
    }
    
    // Always add to persistent storage (Cassandra) for durability
    await this.timelineService.addToTimelineDatabase(followerId, tweet);
    
    // Update follower's unread count for notification purposes
    await this.updateUnreadCount(followerId);
  }

  /**
   * Categorize followers into active and inactive based on recent activity
   * This optimization ensures active users get immediate updates
   */
  async categorizeFollowersByActivity(followers) {
    const active = [];
    const inactive = [];
    
    // Batch check activity status to minimize database calls
    const activityStatuses = await this.batchCheckUserActivity(followers);
    
    followers.forEach((followerId, index) => {
      if (activityStatuses[index]) {
        active.push(followerId);
      } else {
        inactive.push(followerId);
      }
    });
    
    return { activeFollowers: active, inactiveFollowers: inactive };
  }

  // ========================
  // Circuit Breaker Implementation
  // ========================

  recordSuccess() {
    // Reset failure count on successful operation
    this.circuitBreaker.failures = 0;
    
    // Close circuit if it was open and we've had a success
    if (this.circuitBreaker.isOpen) {
      this.closeCircuit();
    }
  }

  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
  }

  shouldOpenCircuit() {
    return this.circuitBreaker.failures >= CIRCUIT_BREAKER_THRESHOLD;
  }

  openCircuit() {
    this.circuitBreaker.isOpen = true;
    console.warn('Circuit breaker opened due to high failure rate');
    
    // Set timer to try closing circuit after timeout
    setTimeout(() => {
      this.tryCloseCircuit();
    }, CIRCUIT_BREAKER_TIMEOUT);
  }

  closeCircuit() {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failures = 0;
    console.info('Circuit breaker closed - service recovered');
  }

  tryCloseCircuit() {
    // Only close if we haven't had recent failures
    const timeSinceLastFailure = Date.now() - (this.circuitBreaker.lastFailureTime || 0);
    
    if (timeSinceLastFailure >= CIRCUIT_BREAKER_TIMEOUT) {
      this.closeCircuit();
    }
  }

  // ========================
  // Helper Methods
  // ========================

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  calculateJobPriority(tweet) {
    // Higher priority for tweets from verified users or those with high engagement
    let priority = 0;
    
    if (tweet.user?.verified) priority += 10;
    if (tweet.likes_count > 100) priority += 5;
    if (tweet.retweet_count > 50) priority += 5;
    
    return priority;
  }

  updateMetrics(result, processingTime) {
    this.metrics.totalFanOuts++;
    
    if (result === 'success') {
      this.metrics.successfulFanOuts++;
    } else {
      this.metrics.failedFanOuts++;
    }
    
    // Update rolling average processing time
    this.metrics.avgProcessingTime = 
      (this.metrics.avgProcessingTime + processingTime) / 2;
  }

  getCurrentSystemLoad() {
    // In a real implementation, this would check system metrics
    // For now, return a mock value based on current processing load
    const queueLength = this.metrics.totalFanOuts - this.metrics.successfulFanOuts - this.metrics.failedFanOuts;
    return Math.min(queueLength / 1000, 1.0); // Normalize to 0-1
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Mock methods - these would integrate with actual services
  async getAllFollowers(userId) { 
    // Would query PostgreSQL for all followers
    return [];
  }
  
  async isActiveFollower(followerId) { 
    // Would check Redis for recent activity
    return true;
  }
  
  async batchCheckUserActivity(userIds) { 
    // Would batch query user activity status
    return userIds.map(() => Math.random() > 0.3); // Mock: 70% active
  }
  
  async updateUnreadCount(userId) { 
    // Would increment unread count in Redis
  }
  
  async queueFollowerBatch(tweet, followers) {
    // Would add batch processing job to queue
    return { jobId: 'mock-job-id' };
  }
}

/**
 * Semaphore class to limit concurrent operations
 * Prevents overwhelming downstream services with too many parallel requests
 */
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentCount = 0;
    this.waitingQueue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.currentCount < this.maxConcurrency) {
        this.currentCount++;
        resolve();
      } else {
        this.waitingQueue.push(resolve);
      }
    });
  }

  release() {
    this.currentCount--;
    if (this.waitingQueue.length > 0) {
      const nextResolve = this.waitingQueue.shift();
      this.currentCount++;
      nextResolve();
    }
  }
}

// Export for use in other modules and testing
module.exports = { 
  FanOutService,
  Semaphore,
  BATCH_SIZE,
  MAX_CONCURRENT_BATCHES
};