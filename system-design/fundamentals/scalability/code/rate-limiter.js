/**
 * File: rate-limiter.js
 * Description: Distributed rate limiting implementation with multiple algorithms
 * 
 * Learning objectives:
 * - Understand different rate limiting algorithms and their characteristics
 * - Learn distributed rate limiting challenges and Redis-based solutions
 * - See token bucket, sliding window, and fixed window implementations
 * - Understand burst handling and fairness considerations in rate limiting
 * 
 * Time Complexity: O(1) for token bucket, O(log N) for sliding window
 * Space Complexity: O(N) where N is the number of unique client identifiers
 */

const Redis = require('redis');
const crypto = require('crypto');

// Configuration constants for rate limiting behavior
const DEFAULT_WINDOW_SIZE = 60000; // 1 minute in milliseconds
const DEFAULT_MAX_REQUESTS = 100; // requests per window
const REDIS_KEY_PREFIX = 'rate_limit:';
const CLEANUP_INTERVAL = 300000; // 5 minutes cleanup interval

/**
 * Distributed Rate Limiter with multiple algorithm implementations
 * Supports token bucket, sliding window, and fixed window algorithms
 */
class RateLimiter {
  constructor(config = {}) {
    this.algorithm = config.algorithm || 'token-bucket';
    this.windowSize = config.windowSize || DEFAULT_WINDOW_SIZE;
    this.maxRequests = config.maxRequests || DEFAULT_MAX_REQUESTS;
    this.keyPrefix = config.keyPrefix || REDIS_KEY_PREFIX;
    
    // Redis client for distributed coordination
    this.redis = config.redis || null;
    this.useRedis = !!this.redis;
    
    // In-memory storage for single-instance deployments
    this.localStorage = new Map();
    
    // Token bucket specific configuration
    this.bucketSize = config.bucketSize || this.maxRequests;
    this.refillRate = config.refillRate || this.maxRequests / (this.windowSize / 1000);
    
    // Sliding window configuration
    this.slidingWindowSegments = config.slidingWindowSegments || 10;
    
    // Start cleanup process for in-memory storage
    if (!this.useRedis) {
      this.startCleanupProcess();
    }

    console.log(`Rate limiter initialized: ${this.algorithm}, ${this.maxRequests}/${this.windowSize}ms`);
  }

  /**
   * Check if a request should be allowed for a given client identifier
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  async checkLimit(clientId, requestWeight = 1) {
    const key = this.buildKey(clientId);
    
    switch (this.algorithm) {
      case 'token-bucket':
        return await this.checkTokenBucket(key, requestWeight);
      
      case 'sliding-window':
        return await this.checkSlidingWindow(key, requestWeight);
      
      case 'fixed-window':
        return await this.checkFixedWindow(key, requestWeight);
      
      case 'sliding-window-log':
        return await this.checkSlidingWindowLog(key, requestWeight);
        
      default:
        throw new Error(`Unknown algorithm: ${this.algorithm}`);
    }
  }

  /**
   * Token Bucket Algorithm Implementation
   * Allows burst requests up to bucket capacity, then refills at steady rate
   * Good for: APIs that need to allow occasional bursts while maintaining average rate
   */
  async checkTokenBucket(key, requestWeight) {
    const now = Date.now();
    
    if (this.useRedis) {
      return await this.checkTokenBucketRedis(key, requestWeight, now);
    } else {
      return this.checkTokenBucketLocal(key, requestWeight, now);
    }
  }

  /**
   * Local token bucket implementation for single-instance deployments
   * Maintains token bucket state in memory with atomic operations
   */
  checkTokenBucketLocal(key, requestWeight, now) {
    let bucket = this.localStorage.get(key);
    
    if (!bucket) {
      // Initialize new bucket with full capacity
      bucket = {
        tokens: this.bucketSize,
        lastRefill: now
      };
    }
    
    // Calculate tokens to add based on time elapsed
    const timePassed = (now - bucket.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;
    
    // Refill bucket up to capacity
    bucket.tokens = Math.min(this.bucketSize, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    // Check if request can be served
    if (bucket.tokens >= requestWeight) {
      bucket.tokens -= requestWeight;
      this.localStorage.set(key, bucket);
      
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + ((this.bucketSize - bucket.tokens) / this.refillRate) * 1000,
        retryAfter: null
      };
    } else {
      // Request denied - calculate when enough tokens will be available
      const tokensNeeded = requestWeight - bucket.tokens;
      const timeToWait = (tokensNeeded / this.refillRate) * 1000;
      
      this.localStorage.set(key, bucket);
      
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + timeToWait,
        retryAfter: Math.ceil(timeToWait / 1000)
      };
    }
  }

  /**
   * Redis-based token bucket for distributed deployments
   * Uses Lua script for atomic token bucket operations
   */
  async checkTokenBucketRedis(key, requestWeight, now) {
    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local request_weight = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      
      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now
      
      -- Calculate refill
      local time_passed = (now - last_refill) / 1000
      tokens = math.min(capacity, tokens + (time_passed * refill_rate))
      
      if tokens >= request_weight then
        tokens = tokens - request_weight
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 3600) -- 1 hour TTL
        return {1, math.floor(tokens), now + ((capacity - tokens) / refill_rate) * 1000}
      else
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 3600)
        local tokens_needed = request_weight - tokens
        local time_to_wait = (tokens_needed / refill_rate) * 1000
        return {0, math.floor(tokens), now + time_to_wait, math.ceil(time_to_wait / 1000)}
      end
    `;

    const result = await this.redis.eval(
      luaScript, 1, key,
      this.bucketSize, this.refillRate, requestWeight, now
    );

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2],
      retryAfter: result[3] || null
    };
  }

  /**
   * Sliding Window Algorithm Implementation
   * Maintains precise request rate over a moving time window
   * Good for: Smooth rate limiting without fixed window boundary effects
   */
  async checkSlidingWindow(key, requestWeight) {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    if (this.useRedis) {
      return await this.checkSlidingWindowRedis(key, requestWeight, now, windowStart);
    } else {
      return this.checkSlidingWindowLocal(key, requestWeight, now, windowStart);
    }
  }

  /**
   * Local sliding window implementation using segmented counters
   * Divides the window into segments for memory efficiency
   */
  checkSlidingWindowLocal(key, requestWeight, now, windowStart) {
    let windowData = this.localStorage.get(key);
    
    if (!windowData) {
      windowData = {
        segments: new Array(this.slidingWindowSegments).fill(0),
        segmentDuration: this.windowSize / this.slidingWindowSegments,
        lastUpdate: now
      };
    }
    
    // Clean up old segments based on time progression
    this.updateSlidingWindowSegments(windowData, now);
    
    // Calculate current request count in window
    const currentCount = windowData.segments.reduce((sum, count) => sum + count, 0);
    
    if (currentCount + requestWeight <= this.maxRequests) {
      // Request allowed - add to current segment
      const currentSegment = Math.floor((now % this.windowSize) / windowData.segmentDuration);
      windowData.segments[currentSegment] += requestWeight;
      windowData.lastUpdate = now;
      
      this.localStorage.set(key, windowData);
      
      return {
        allowed: true,
        remaining: this.maxRequests - currentCount - requestWeight,
        resetTime: windowStart + this.windowSize,
        retryAfter: null
      };
    } else {
      // Request denied
      this.localStorage.set(key, windowData);
      
      return {
        allowed: false,
        remaining: this.maxRequests - currentCount,
        resetTime: this.calculateNextAvailableTime(windowData, now),
        retryAfter: Math.ceil((this.calculateNextAvailableTime(windowData, now) - now) / 1000)
      };
    }
  }

  /**
   * Redis-based sliding window using sorted sets
   * Stores individual request timestamps for precise counting
   */
  async checkSlidingWindowRedis(key, requestWeight, now, windowStart) {
    const luaScript = `
      local key = KEYS[1]
      local window_start = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local max_requests = tonumber(ARGV[3])
      local request_weight = tonumber(ARGV[4])
      
      -- Remove old entries outside the window
      redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)
      
      -- Count current requests in window
      local current_count = redis.call('ZCARD', key)
      
      if current_count + request_weight <= max_requests then
        -- Add new request timestamp
        for i = 1, request_weight do
          redis.call('ZADD', key, now, now .. ':' .. i)
        end
        redis.call('EXPIRE', key, 3600) -- 1 hour TTL
        return {1, max_requests - current_count - request_weight, window_start + ARGV[5]}
      else
        redis.call('EXPIRE', key, 3600)
        -- Find when the oldest request will expire
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local next_available = oldest[2] and (tonumber(oldest[2]) + ARGV[5]) or (now + 1000)
        return {0, max_requests - current_count, next_available, math.ceil((next_available - now) / 1000)}
      end
    `;

    const result = await this.redis.eval(
      luaScript, 1, key,
      windowStart, now, this.maxRequests, requestWeight, this.windowSize
    );

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2],
      retryAfter: result[3] || null
    };
  }

  /**
   * Fixed Window Algorithm Implementation
   * Simple counter that resets at fixed intervals
   * Good for: Simple implementation, predictable resource usage
   */
  async checkFixedWindow(key, requestWeight) {
    const now = Date.now();
    const windowStart = Math.floor(now / this.windowSize) * this.windowSize;
    const windowKey = `${key}:${windowStart}`;
    
    if (this.useRedis) {
      return await this.checkFixedWindowRedis(windowKey, requestWeight, windowStart);
    } else {
      return this.checkFixedWindowLocal(windowKey, requestWeight, windowStart);
    }
  }

  /**
   * Local fixed window implementation with automatic cleanup
   */
  checkFixedWindowLocal(windowKey, requestWeight, windowStart) {
    const currentCount = this.localStorage.get(windowKey) || 0;
    
    if (currentCount + requestWeight <= this.maxRequests) {
      this.localStorage.set(windowKey, currentCount + requestWeight);
      
      return {
        allowed: true,
        remaining: this.maxRequests - currentCount - requestWeight,
        resetTime: windowStart + this.windowSize,
        retryAfter: null
      };
    } else {
      return {
        allowed: false,
        remaining: this.maxRequests - currentCount,
        resetTime: windowStart + this.windowSize,
        retryAfter: Math.ceil((windowStart + this.windowSize - Date.now()) / 1000)
      };
    }
  }

  /**
   * Redis-based fixed window using atomic increment
   */
  async checkFixedWindowRedis(windowKey, requestWeight, windowStart) {
    const luaScript = `
      local key = KEYS[1]
      local max_requests = tonumber(ARGV[1])
      local request_weight = tonumber(ARGV[2])
      local window_end = tonumber(ARGV[3])
      
      local current = redis.call('GET', key)
      current = current and tonumber(current) or 0
      
      if current + request_weight <= max_requests then
        redis.call('INCRBY', key, request_weight)
        redis.call('EXPIREAT', key, math.floor(window_end / 1000))
        return {1, max_requests - current - request_weight, window_end}
      else
        return {0, max_requests - current, window_end, math.ceil((window_end - ARGV[4]) / 1000)}
      end
    `;

    const result = await this.redis.eval(
      luaScript, 1, windowKey,
      this.maxRequests, requestWeight, windowStart + this.windowSize, Date.now()
    );

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetTime: result[2],
      retryAfter: result[3] || null
    };
  }

  /**
   * Sliding Window Log Algorithm Implementation
   * Maintains exact timestamps of all requests for precise rate limiting
   * Most accurate but highest memory usage
   */
  async checkSlidingWindowLog(key, requestWeight) {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    if (this.useRedis) {
      // Already implemented in sliding window Redis version
      return await this.checkSlidingWindowRedis(key, requestWeight, now, windowStart);
    } else {
      return this.checkSlidingWindowLogLocal(key, requestWeight, now, windowStart);
    }
  }

  /**
   * Local sliding window log with exact timestamp tracking
   */
  checkSlidingWindowLogLocal(key, requestWeight, now, windowStart) {
    let requestLog = this.localStorage.get(key) || [];
    
    // Remove requests outside the current window
    requestLog = requestLog.filter(timestamp => timestamp > windowStart);
    
    if (requestLog.length + requestWeight <= this.maxRequests) {
      // Add new request timestamps
      for (let i = 0; i < requestWeight; i++) {
        requestLog.push(now);
      }
      
      this.localStorage.set(key, requestLog);
      
      return {
        allowed: true,
        remaining: this.maxRequests - requestLog.length,
        resetTime: requestLog.length > 0 ? Math.min(...requestLog) + this.windowSize : now + this.windowSize,
        retryAfter: null
      };
    } else {
      this.localStorage.set(key, requestLog);
      
      // Calculate when the oldest request will expire
      const oldestRequest = Math.min(...requestLog);
      const nextAvailable = oldestRequest + this.windowSize;
      
      return {
        allowed: false,
        remaining: this.maxRequests - requestLog.length,
        resetTime: nextAvailable,
        retryAfter: Math.ceil((nextAvailable - now) / 1000)
      };
    }
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Update sliding window segments by rotating old data out
   */
  updateSlidingWindowSegments(windowData, now) {
    const segmentsPassed = Math.floor((now - windowData.lastUpdate) / windowData.segmentDuration);
    
    if (segmentsPassed > 0) {
      // Rotate segments - move data and zero out old segments
      const segmentsToRotate = Math.min(segmentsPassed, this.slidingWindowSegments);
      
      for (let i = 0; i < segmentsToRotate; i++) {
        windowData.segments.shift(); // Remove oldest
        windowData.segments.push(0); // Add new empty segment
      }
      
      windowData.lastUpdate = now;
    }
  }

  /**
   * Calculate when next request slot will be available
   */
  calculateNextAvailableTime(windowData, now) {
    // Find the oldest non-zero segment and calculate its expiration
    const segmentDuration = windowData.segmentDuration;
    const currentTime = now;
    
    for (let i = 0; i < this.slidingWindowSegments; i++) {
      if (windowData.segments[i] > 0) {
        const segmentStartTime = currentTime - ((this.slidingWindowSegments - i) * segmentDuration);
        return segmentStartTime + this.windowSize;
      }
    }
    
    return now + 1000; // Default to 1 second if no active segments
  }

  /**
   * Build storage key for client identifier
   */
  buildKey(clientId) {
    return `${this.keyPrefix}${clientId}`;
  }

  /**
   * Start cleanup process for in-memory storage
   * Removes expired entries to prevent memory leaks
   */
  startCleanupProcess() {
    setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL);
  }

  /**
   * Clean up expired entries from local storage
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - (this.windowSize * 2); // Keep extra buffer for safety
    
    for (const [key, value] of this.localStorage.entries()) {
      if (Array.isArray(value)) {
        // Sliding window log cleanup
        const filteredLog = value.filter(timestamp => timestamp > cutoff);
        if (filteredLog.length === 0) {
          this.localStorage.delete(key);
        } else if (filteredLog.length !== value.length) {
          this.localStorage.set(key, filteredLog);
        }
      } else if (typeof value === 'object' && value.lastUpdate) {
        // Token bucket or sliding window segments cleanup
        if (value.lastUpdate < cutoff) {
          this.localStorage.delete(key);
        }
      } else if (typeof value === 'number') {
        // Fixed window cleanup - check if key represents old window
        const windowStart = parseInt(key.split(':').pop());
        if (windowStart && windowStart < cutoff) {
          this.localStorage.delete(key);
        }
      }
    }
    
    console.log(`Rate limiter cleanup completed. Active keys: ${this.localStorage.size}`);
  }

  /**
   * Get current rate limiter statistics
   */
  getStats() {
    return {
      algorithm: this.algorithm,
      windowSize: this.windowSize,
      maxRequests: this.maxRequests,
      activeKeys: this.useRedis ? 'N/A (Redis)' : this.localStorage.size,
      bucketSize: this.bucketSize,
      refillRate: this.refillRate,
      slidingWindowSegments: this.slidingWindowSegments
    };
  }

  /**
   * Reset rate limit for a specific client
   * Useful for testing or administrative override
   */
  async reset(clientId) {
    const key = this.buildKey(clientId);
    
    if (this.useRedis) {
      await this.redis.del(key);
    } else {
      this.localStorage.delete(key);
      // Also clean up fixed window entries
      for (const storageKey of this.localStorage.keys()) {
        if (storageKey.startsWith(key)) {
          this.localStorage.delete(storageKey);
        }
      }
    }
    
    console.log(`Rate limit reset for client: ${clientId}`);
  }

  /**
   * Shutdown rate limiter and cleanup resources
   */
  shutdown() {
    console.log('Rate limiter shutting down...');
    
    if (this.redis) {
      this.redis.disconnect();
    }
    
    this.localStorage.clear();
  }
}

// ========================
// Usage Examples and Testing
// ========================

/**
 * Example usage demonstrating different rate limiting scenarios
 */
async function demonstrateRateLimiting() {
  console.log('=== Rate Limiter Demonstration ===');
  
  // Token bucket for burst-friendly API
  const tokenBucketLimiter = new RateLimiter({
    algorithm: 'token-bucket',
    maxRequests: 10,
    windowSize: 60000, // 1 minute
    bucketSize: 15, // Allow burst up to 15 requests
    refillRate: 10 / 60 // 10 requests per minute
  });

  console.log('\n--- Token Bucket (Burst Friendly) ---');
  for (let i = 1; i <= 20; i++) {
    const result = await tokenBucketLimiter.checkLimit('user123');
    console.log(`Request ${i}: ${result.allowed ? 'ALLOWED' : 'DENIED'} (remaining: ${result.remaining})`);
    
    if (!result.allowed) {
      console.log(`Rate limit exceeded. Retry after ${result.retryAfter} seconds`);
      break;
    }
  }

  // Sliding window for smooth rate limiting
  const slidingWindowLimiter = new RateLimiter({
    algorithm: 'sliding-window',
    maxRequests: 5,
    windowSize: 10000 // 10 seconds
  });

  console.log('\n--- Sliding Window (Smooth Rate) ---');
  for (let i = 1; i <= 8; i++) {
    const result = await slidingWindowLimiter.checkLimit('user456');
    console.log(`Request ${i}: ${result.allowed ? 'ALLOWED' : 'DENIED'} (remaining: ${result.remaining})`);
    
    // Simulate some delay between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Fixed window for simple rate limiting
  const fixedWindowLimiter = new RateLimiter({
    algorithm: 'fixed-window',
    maxRequests: 3,
    windowSize: 5000 // 5 seconds
  });

  console.log('\n--- Fixed Window (Simple) ---');
  for (let i = 1; i <= 6; i++) {
    const result = await fixedWindowLimiter.checkLimit('user789');
    console.log(`Request ${i}: ${result.allowed ? 'ALLOWED' : 'DENIED'} (remaining: ${result.remaining})`);
  }

  // Wait for window reset
  console.log('Waiting for window reset...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  const afterReset = await fixedWindowLimiter.checkLimit('user789');
  console.log(`After reset: ${afterReset.allowed ? 'ALLOWED' : 'DENIED'} (remaining: ${afterReset.remaining})`);
}

// Export for use in other modules and testing
module.exports = { 
  RateLimiter,
  DEFAULT_WINDOW_SIZE,
  DEFAULT_MAX_REQUESTS,
  demonstrateRateLimiting
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateRateLimiting().catch(console.error);
}