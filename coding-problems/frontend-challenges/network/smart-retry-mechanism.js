/**
 * File: smart-retry-mechanism.js
 * 
 * Challenge: Implement a comprehensive retry mechanism with:
 * - Exponential backoff with jitter for optimal retry timing
 * - Circuit breaker pattern to prevent cascading failures
 * - Intelligent failure classification (retryable vs non-retryable)
 * - Request deduplication and caching for efficiency
 * - Comprehensive error handling and recovery strategies
 * 
 * Interview Focus:
 * - Understanding distributed systems resilience patterns
 * - Network failure handling and recovery strategies
 * - Performance optimization under failure conditions
 * - API design for reliability and developer experience
 * 
 * Companies: Netflix, Stripe, Uber, AWS (high-reliability systems)
 * Difficulty: Medium-Hard
 */

/**
 * APPROACH 1: Basic Retry with Exponential Backoff
 * 
 * Simple retry mechanism that implements exponential backoff.
 * Good for understanding core concepts but lacks advanced features.
 * 
 * Time: O(r) where r is number of retries
 * Space: O(1) constant space usage
 */
class BasicRetryMechanism {
  constructor(options = {}) {
    // Configuration affects retry behavior and performance
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {Object} options - Override default retry options
   */
  async retry(fn, options = {}) {
    const config = { ...this, ...options };
    let lastError;
    
    // Attempt the function up to maxRetries + 1 times (initial + retries)
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Execute the function - if successful, return immediately
        const result = await fn(attempt);
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        // Formula: baseDelay * (backoffMultiplier ^ attempt)
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        
        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    // All retries exhausted, throw the last error
    throw new Error(`Max retries (${config.maxRetries}) exceeded. Last error: ${lastError.message}`);
  }

  /**
   * Promise-based sleep utility
   * Essential for implementing delays between retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * APPROACH 2: Advanced Retry with Circuit Breaker and Failure Classification
 * 
 * Production-ready retry mechanism with:
 * - Circuit breaker to prevent cascading failures
 * - Intelligent error classification
 * - Jitter to prevent thundering herd
 * - Request timeout handling
 * 
 * Time: O(r) for retries, O(1) for circuit breaker checks
 * Space: O(n) where n is number of tracked requests
 */
class AdvancedRetryMechanism {
  constructor(options = {}) {
    // Retry configuration
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitterFactor = options.jitterFactor || 0.1; // 10% jitter
    
    // Circuit breaker configuration
    this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5; // failures before opening
    this.circuitBreakerTimeout = options.circuitBreakerTimeout || 60000; // 1 minute
    this.circuitBreakerResetTimeout = options.circuitBreakerResetTimeout || 30000; // 30 seconds
    
    // Circuit breaker state
    this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Request timeout configuration
    this.defaultTimeout = options.defaultTimeout || 10000; // 10 seconds
    
    // Error classification rules
    this.retryableStatusCodes = new Set([408, 429, 500, 502, 503, 504]);
    this.nonRetryableStatusCodes = new Set([400, 401, 403, 404, 422]);
  }

  /**
   * Smart retry with circuit breaker and error classification
   */
  async retry(fn, options = {}) {
    const config = { ...this, ...options };
    
    // Check circuit breaker before attempting
    if (!this.canAttempt()) {
      throw new Error(`Circuit breaker is OPEN. Next attempt allowed at: ${new Date(this.nextAttemptTime)}`);
    }
    
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Add timeout wrapper to prevent hanging requests
        const result = await this.withTimeout(fn(attempt), config.defaultTimeout);
        
        // Success - reset circuit breaker
        this.onSuccess();
        return result;
      } catch (error) {
        lastError = error;
        
        // Classify error to determine if retry is appropriate
        if (!this.isRetryableError(error)) {
          // Non-retryable error - fail immediately and record failure
          this.onFailure();
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          this.onFailure();
          break;
        }
        
        // Calculate delay with jitter to prevent thundering herd
        const baseDelay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );
        
        // Add jitter: ±jitterFactor of the base delay
        const jitter = baseDelay * config.jitterFactor * (Math.random() * 2 - 1);
        const delay = Math.max(0, baseDelay + jitter);
        
        console.log(`Attempt ${attempt + 1} failed (${error.message}), retrying in ${Math.round(delay)}ms...`);
        
        await this.sleep(delay);
      }
    }
    
    throw new Error(`Max retries (${config.maxRetries}) exceeded. Last error: ${lastError.message}`);
  }

  /**
   * Circuit breaker logic - prevents cascading failures
   * Key pattern for building resilient distributed systems
   */
  canAttempt() {
    const now = Date.now();
    
    switch (this.circuitState) {
      case 'CLOSED':
        // Normal operation - allow all requests
        return true;
        
      case 'OPEN':
        // Circuit is open - check if we should transition to half-open
        if (now >= this.nextAttemptTime) {
          this.circuitState = 'HALF_OPEN';
          console.log('Circuit breaker transitioning to HALF_OPEN');
          return true;
        }
        return false;
        
      case 'HALF_OPEN':
        // Allow one request to test if service has recovered
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Handle successful request - reset circuit breaker if needed
   */
  onSuccess() {
    if (this.circuitState === 'HALF_OPEN') {
      // Service has recovered - close the circuit
      this.circuitState = 'CLOSED';
      this.failureCount = 0;
      console.log('Circuit breaker CLOSED - service recovered');
    }
  }

  /**
   * Handle failed request - update circuit breaker state
   */
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.circuitState === 'HALF_OPEN') {
      // Half-open test failed - reopen circuit
      this.circuitState = 'OPEN';
      this.nextAttemptTime = this.lastFailureTime + this.circuitBreakerTimeout;
      console.log('Circuit breaker reopened after half-open failure');
    } else if (this.failureCount >= this.circuitBreakerThreshold) {
      // Threshold exceeded - open circuit
      this.circuitState = 'OPEN';
      this.nextAttemptTime = this.lastFailureTime + this.circuitBreakerTimeout;
      console.log(`Circuit breaker OPENED after ${this.failureCount} failures`);
    }
  }

  /**
   * Intelligent error classification
   * Determines whether an error is worth retrying
   */
  isRetryableError(error) {
    // Network errors are usually retryable
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }
    
    // HTTP status code classification
    if (error.status || error.response?.status) {
      const status = error.status || error.response.status;
      
      // Explicitly non-retryable errors
      if (this.nonRetryableStatusCodes.has(status)) {
        return false;
      }
      
      // Explicitly retryable errors
      if (this.retryableStatusCodes.has(status)) {
        return true;
      }
    }
    
    // Timeout errors are retryable
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return true;
    }
    
    // Default: retry unknown errors (conservative approach)
    return true;
  }

  /**
   * Add timeout to prevent hanging requests
   * Critical for preventing resource exhaustion
   */
  withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current circuit breaker status
   * Useful for monitoring and debugging
   */
  getStatus() {
    return {
      circuitState: this.circuitState,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  /**
   * Reset circuit breaker manually
   * Useful for testing or manual recovery
   */
  reset() {
    this.circuitState = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }
}

/**
 * APPROACH 3: Production Smart Retry with Request Deduplication and Caching
 * 
 * Enterprise-grade retry mechanism with:
 * - Request deduplication to prevent duplicate work
 * - Intelligent caching for failed requests
 * - Metrics collection and monitoring
 * - Adaptive retry strategies based on historical data
 * 
 * Time: O(r) for retries, O(1) for deduplication checks
 * Space: O(n + m) where n = cached requests, m = pending requests
 */
class ProductionSmartRetry extends AdvancedRetryMechanism {
  constructor(options = {}) {
    super(options);
    
    // Request deduplication
    this.pendingRequests = new Map(); // Key: request signature, Value: Promise
    this.requestCache = new Map(); // Simple LRU-style cache
    this.maxCacheSize = options.maxCacheSize || 1000;
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    
    // Metrics collection
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      circuitBreakerTrips: 0,
      deduplicatedRequests: 0,
      cacheHits: 0,
      averageRetryCount: 0
    };
    
    // Adaptive retry configuration
    this.adaptiveRetry = options.adaptiveRetry || false;
    this.successRateThreshold = options.successRateThreshold || 0.8; // 80%
    
    // Cleanup timer for cache management
    this.cleanupTimer = setInterval(() => this.cleanupCache(), 60000); // Every minute
  }

  /**
   * Smart retry with deduplication and caching
   */
  async retry(fn, options = {}) {
    const config = { ...this, ...options };
    const requestKey = this.generateRequestKey(fn, options);
    
    this.metrics.totalRequests++;
    
    // Check for duplicate in-flight requests
    if (this.pendingRequests.has(requestKey)) {
      this.metrics.deduplicatedRequests++;
      console.log('Deduplicating request:', requestKey);
      return await this.pendingRequests.get(requestKey);
    }
    
    // Check cache for recent failed requests
    const cachedResult = this.getFromCache(requestKey);
    if (cachedResult) {
      this.metrics.cacheHits++;
      if (cachedResult.success) {
        this.metrics.successfulRequests++;
        return cachedResult.data;
      } else {
        // Don't retry recently failed requests immediately
        throw new Error(`Request recently failed: ${cachedResult.error}`);
      }
    }
    
    // Adapt retry strategy based on historical success rate
    if (this.adaptiveRetry) {
      config.maxRetries = this.calculateAdaptiveRetries();
    }
    
    // Create retry promise and track it
    const retryPromise = this.executeRetryWithMetrics(fn, config, requestKey);
    this.pendingRequests.set(requestKey, retryPromise);
    
    try {
      const result = await retryPromise;
      
      // Cache successful result
      this.addToCache(requestKey, { success: true, data: result, timestamp: Date.now() });
      this.metrics.successfulRequests++;
      
      return result;
    } catch (error) {
      // Cache failed result to prevent immediate retry
      this.addToCache(requestKey, { success: false, error: error.message, timestamp: Date.now() });
      this.metrics.failedRequests++;
      throw error;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * Execute retry with comprehensive metrics collection
   */
  async executeRetryWithMetrics(fn, config, requestKey) {
    let retryCount = 0;
    const startTime = Date.now();
    
    try {
      // Use parent retry logic but track metrics
      const originalOnFailure = this.onFailure.bind(this);
      this.onFailure = () => {
        originalOnFailure();
        if (this.circuitState === 'OPEN') {
          this.metrics.circuitBreakerTrips++;
        }
      };
      
      return await super.retry((attempt) => {
        if (attempt > 0) {
          retryCount++;
        }
        return fn(attempt);
      }, config);
    } finally {
      // Update retry metrics
      if (retryCount > 0) {
        this.metrics.retriedRequests++;
        const currentAvg = this.metrics.averageRetryCount;
        const totalRetried = this.metrics.retriedRequests;
        this.metrics.averageRetryCount = ((currentAvg * (totalRetried - 1)) + retryCount) / totalRetried;
      }
      
      const duration = Date.now() - startTime;
      console.log(`Request ${requestKey} completed in ${duration}ms with ${retryCount} retries`);
    }
  }

  /**
   * Generate unique key for request deduplication
   * Uses function signature and options to create identifier
   */
  generateRequestKey(fn, options) {
    // Create a simple hash based on function string and options
    // In production, you might use a more sophisticated approach
    const fnString = fn.toString();
    const optionsString = JSON.stringify(options, Object.keys(options).sort());
    return `${fnString.length}:${optionsString}`;
  }

  /**
   * Simple LRU-style cache management
   */
  addToCache(key, value) {
    // Remove oldest entries if cache is full
    if (this.requestCache.size >= this.maxCacheSize) {
      const oldestKey = this.requestCache.keys().next().value;
      this.requestCache.delete(oldestKey);
    }
    
    this.requestCache.set(key, value);
  }

  getFromCache(key) {
    const cached = this.requestCache.get(key);
    if (!cached) return null;
    
    // Check if cached result has expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.requestCache.delete(key);
      return null;
    }
    
    return cached;
  }

  /**
   * Cleanup expired cache entries
   * Prevents memory leaks in long-running applications
   */
  cleanupCache() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, value] of this.requestCache) {
      if (now - value.timestamp > this.cacheTimeout) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.requestCache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Adaptive retry calculation based on historical success rate
   * Reduces retries when success rate is low to prevent waste
   */
  calculateAdaptiveRetries() {
    const totalRequests = this.metrics.totalRequests;
    if (totalRequests < 10) {
      // Not enough data - use default
      return this.maxRetries;
    }
    
    const successRate = this.metrics.successfulRequests / totalRequests;
    
    if (successRate >= this.successRateThreshold) {
      // High success rate - use full retries
      return this.maxRetries;
    } else if (successRate >= 0.5) {
      // Medium success rate - reduce retries
      return Math.max(1, Math.floor(this.maxRetries * 0.7));
    } else {
      // Low success rate - minimal retries
      return Math.max(1, Math.floor(this.maxRetries * 0.3));
    }
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const totalRequests = this.metrics.totalRequests;
    return {
      ...this.metrics,
      successRate: totalRequests > 0 ? this.metrics.successfulRequests / totalRequests : 0,
      failureRate: totalRequests > 0 ? this.metrics.failedRequests / totalRequests : 0,
      retryRate: totalRequests > 0 ? this.metrics.retriedRequests / totalRequests : 0,
      cacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      circuitBreakerStatus: this.getStatus()
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      circuitBreakerTrips: 0,
      deduplicatedRequests: 0,
      cacheHits: 0,
      averageRetryCount: 0
    };
  }

  /**
   * Enhanced cleanup with cache and timer management
   */
  destroy() {
    super.reset();
    this.requestCache.clear();
    this.pendingRequests.clear();
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// =============================================================================
// EXAMPLE USAGE AND TESTING
// =============================================================================

/**
 * Example 1: Basic API retry with exponential backoff
 * Common use case: Retry failed HTTP requests
 */
async function exampleBasicRetry() {
  const retryMechanism = new BasicRetryMechanism({
    maxRetries: 3,
    baseDelay: 1000,
    backoffMultiplier: 2
  });

  // Simulate unreliable API call
  const unreliableApiCall = async (attempt) => {
    console.log(`API call attempt ${attempt + 1}`);
    
    // Simulate random failure (70% failure rate)
    if (Math.random() < 0.7) {
      throw new Error('API temporarily unavailable');
    }
    
    return { data: 'API response data', timestamp: Date.now() };
  };

  try {
    const result = await retryMechanism.retry(unreliableApiCall);
    console.log('Success:', result);
  } catch (error) {
    console.error('All retries failed:', error.message);
  }
}

/**
 * Example 2: Advanced retry with circuit breaker
 * Use case: Protecting against cascading failures in microservices
 */
async function exampleAdvancedRetry() {
  const retryMechanism = new AdvancedRetryMechanism({
    maxRetries: 5,
    baseDelay: 500,
    circuitBreakerThreshold: 3,
    circuitBreakerTimeout: 10000 // 10 seconds
  });

  // Simulate service that becomes unavailable
  let callCount = 0;
  const flakeyService = async (attempt) => {
    callCount++;
    console.log(`Service call ${callCount}, attempt ${attempt + 1}`);
    
    // Simulate service degradation - starts failing after 5 calls
    if (callCount > 5) {
      throw new Error('Service is down');
    }
    
    return { data: `Service response ${callCount}` };
  };

  // Make multiple calls to trigger circuit breaker
  for (let i = 0; i < 10; i++) {
    try {
      const result = await retryMechanism.retry(flakeyService);
      console.log(`Call ${i + 1} success:`, result);
    } catch (error) {
      console.error(`Call ${i + 1} failed:`, error.message);
    }
    
    console.log('Circuit breaker status:', retryMechanism.getStatus());
    
    // Wait between calls
    await retryMechanism.sleep(2000);
  }
}

/**
 * Example 3: Production usage with deduplication and metrics
 * Use case: High-traffic application with request optimization
 */
async function exampleProductionRetry() {
  const smartRetry = new ProductionSmartRetry({
    maxRetries: 3,
    adaptiveRetry: true,
    maxCacheSize: 100,
    cacheTimeout: 30000 // 30 seconds
  });

  // Simulate expensive API call
  const expensiveApiCall = async (attempt) => {
    console.log(`Expensive API call attempt ${attempt + 1}`);
    
    // Simulate processing delay
    await smartRetry.sleep(1000);
    
    // Simulate occasional failure
    if (Math.random() < 0.3) {
      throw new Error('API rate limit exceeded');
    }
    
    return { 
      data: 'Expensive computation result',
      computedAt: Date.now()
    };
  };

  // Make multiple identical calls to demonstrate deduplication
  const promises = Array(5).fill().map(() => 
    smartRetry.retry(expensiveApiCall).catch(err => ({ error: err.message }))
  );

  const results = await Promise.all(promises);
  console.log('Results:', results);
  console.log('Metrics:', smartRetry.getMetrics());

  // Cleanup
  smartRetry.destroy();
}

// =============================================================================
// INTERVIEW QUESTIONS AND FOLLOW-UPS
// =============================================================================

/**
 * Common Interview Questions:
 * 
 * Q1: "How would you handle transient network failures in a web app?"
 * A: Implement exponential backoff retry with error classification.
 * 
 * Q2: "What's the difference between exponential backoff and linear backoff?"
 * A: Exponential grows delay exponentially (1s, 2s, 4s, 8s), linear adds constant delay (1s, 2s, 3s, 4s).
 *    Exponential prevents thundering herd and reduces server load.
 * 
 * Q3: "How do you prevent your retry mechanism from making things worse?"
 * A: Circuit breaker pattern, intelligent error classification, jitter, request deduplication.
 * 
 * Q4: "What's a circuit breaker and why is it important?"
 * A: Prevents cascading failures by stopping requests to failing services.
 *    Three states: CLOSED (normal), OPEN (blocking), HALF_OPEN (testing).
 * 
 * Q5: "How would you implement request deduplication?"
 * A: Create unique keys from request parameters, track pending requests,
 *    return same promise for identical requests.
 * 
 * Follow-up Questions:
 * - "How would you test this retry logic?"
 * - "What metrics would you track for retry behavior?"
 * - "How would you handle retry in a React component?"
 * - "What's the difference between retry and circuit breaker patterns?"
 * - "How would you implement retries for GraphQL mutations vs queries?"
 */

// Export for testing and real-world usage
module.exports = {
  BasicRetryMechanism,
  AdvancedRetryMechanism,
  ProductionSmartRetry,
  
  // Example functions for demonstration
  exampleBasicRetry,
  exampleAdvancedRetry,
  exampleProductionRetry
};