/**
 * File: retry-strategies.js
 * Description: Retry patterns and backoff strategies for reliable systems
 * 
 * Learning objectives:
 * - Understand different retry patterns and their trade-offs
 * - Learn exponential backoff with jitter to prevent thundering herd
 * - See dead letter queue implementation for failed messages
 * - Understand retry budgets and circuit integration
 * 
 * Time Complexity: O(1) for retry logic, O(N) for exponential backoff calculation
 * Space Complexity: O(N) where N is the number of failed requests tracked
 */

const EventEmitter = require('events');

// Retry strategy constants and configurations
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000; // 1 second
const DEFAULT_MAX_DELAY = 30000; // 30 seconds
const DEFAULT_JITTER_FACTOR = 0.1; // 10% jitter
const DEFAULT_TIMEOUT = 5000; // 5 seconds per attempt

// Retry strategy types
const RETRY_STRATEGIES = {
  FIXED_DELAY: 'fixed_delay',
  LINEAR_BACKOFF: 'linear_backoff', 
  EXPONENTIAL_BACKOFF: 'exponential_backoff',
  EXPONENTIAL_BACKOFF_JITTER: 'exponential_backoff_jitter',
  CUSTOM: 'custom'
};

// Error classifications for retry decision making
const ERROR_TYPES = {
  TRANSIENT: 'transient',     // Temporary issues that can be retried
  PERMANENT: 'permanent',     // Errors that won't be fixed by retrying
  RATE_LIMITED: 'rate_limited', // Rate limit errors requiring backoff
  UNKNOWN: 'unknown'          // Uncertain errors
};

/**
 * Advanced Retry Manager with multiple backoff strategies and error handling
 * Provides resilient retry mechanisms for distributed system operations
 */
class RetryManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Core configuration
    this.maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;
    this.baseDelay = options.baseDelay || DEFAULT_BASE_DELAY;
    this.maxDelay = options.maxDelay || DEFAULT_MAX_DELAY;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.strategy = options.strategy || RETRY_STRATEGIES.EXPONENTIAL_BACKOFF_JITTER;
    
    // Jitter configuration for avoiding thundering herd
    this.jitterFactor = options.jitterFactor || DEFAULT_JITTER_FACTOR;
    this.jitterType = options.jitterType || 'uniform'; // 'uniform', 'normal', 'exponential'
    
    // Error classification and retry eligibility
    this.retryableErrors = options.retryableErrors || [
      'ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH',
      'RequestTimeoutError', 'ServiceUnavailableError', 'TooManyRequestsError'
    ];
    
    this.nonRetryableErrors = options.nonRetryableErrors || [
      'AuthenticationError', 'AuthorizationError', 'ValidationError',
      'BadRequestError', 'NotFoundError'
    ];
    
    // Advanced features
    this.enableCircuitBreakerIntegration = options.enableCircuitBreaker || false;
    this.enableDeadLetterQueue = options.enableDeadLetterQueue || true;
    this.retryBudget = options.retryBudget || null; // Limit total retries across all operations
    
    // State tracking
    this.activeRetries = new Map(); // Track ongoing retry attempts
    this.metrics = {
      totalAttempts: 0,
      successfulRetries: 0,
      permanentFailures: 0,
      exhaustedRetries: 0,
      averageRetryCount: 0
    };
    
    // Dead letter queue for permanently failed items
    this.deadLetterQueue = [];
    this.maxDeadLetterSize = options.maxDeadLetterSize || 1000;
    
    console.log(`RetryManager initialized with ${this.strategy} strategy`);
    console.log(`Configuration: maxRetries=${this.maxRetries}, baseDelay=${this.baseDelay}ms`);
  }

  /**
   * Execute operation with retry logic - main entry point
   * @param {Function} operation - Async function to execute
   * @param {Object} context - Context information for the operation
   * @param {Object} options - Override options for this specific operation
   */
  async executeWithRetry(operation, context = {}, options = {}) {
    const operationId = this.generateOperationId(context);
    const startTime = Date.now();
    
    // Merge global and operation-specific options
    const effectiveOptions = {
      maxRetries: options.maxRetries ?? this.maxRetries,
      strategy: options.strategy ?? this.strategy,
      timeout: options.timeout ?? this.timeout,
      ...options
    };
    
    console.log(`[${operationId}] Starting operation with retry strategy: ${effectiveOptions.strategy}`);
    
    let lastError = null;
    let attempt = 0;
    
    // Track this retry operation
    this.activeRetries.set(operationId, {
      startTime,
      attempt: 0,
      context,
      options: effectiveOptions
    });
    
    try {
      while (attempt <= effectiveOptions.maxRetries) {
        attempt++;
        this.metrics.totalAttempts++;
        this.activeRetries.get(operationId).attempt = attempt;
        
        try {
          console.log(`[${operationId}] Attempt ${attempt}/${effectiveOptions.maxRetries + 1}`);
          
          // Execute the operation with timeout protection
          const result = await this.executeWithTimeout(operation, effectiveOptions.timeout);
          
          // Success! Clean up and return result
          const duration = Date.now() - startTime;
          this.onRetrySuccess(operationId, attempt, duration);
          
          return result;
          
        } catch (error) {
          lastError = error;
          console.log(`[${operationId}] Attempt ${attempt} failed: ${error.message}`);
          
          // Classify the error to determine if we should retry
          const errorClassification = this.classifyError(error);
          
          if (errorClassification === ERROR_TYPES.PERMANENT) {
            console.log(`[${operationId}] Permanent error detected - stopping retries`);
            break;
          }
          
          if (attempt <= effectiveOptions.maxRetries) {
            // Calculate delay for next attempt
            const delay = this.calculateDelay(attempt, effectiveOptions, errorClassification);
            
            console.log(`[${operationId}] Waiting ${delay}ms before retry ${attempt + 1}`);
            
            // Emit retry event
            this.emit('retry_attempt', {
              operationId,
              attempt,
              error: error.message,
              delay,
              classification: errorClassification
            });
            
            // Wait before next attempt
            await this.delay(delay);
          }
        }
      }
      
      // All retries exhausted
      const duration = Date.now() - startTime;
      this.onRetryExhausted(operationId, attempt, duration, lastError, context);
      
      // Throw the last error
      throw lastError;
      
    } finally {
      // Clean up active retry tracking
      this.activeRetries.delete(operationId);
    }
  }

  /**
   * Execute operation with timeout protection
   */
  async executeWithTimeout(operation, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
      
      Promise.resolve(operation())
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Calculate delay for next retry attempt based on strategy
   */
  calculateDelay(attempt, options, errorClassification) {
    let delay;
    
    switch (options.strategy || this.strategy) {
      case RETRY_STRATEGIES.FIXED_DELAY:
        delay = this.baseDelay;
        break;
        
      case RETRY_STRATEGIES.LINEAR_BACKOFF:
        delay = this.baseDelay * attempt;
        break;
        
      case RETRY_STRATEGIES.EXPONENTIAL_BACKOFF:
        delay = this.baseDelay * Math.pow(2, attempt - 1);
        break;
        
      case RETRY_STRATEGIES.EXPONENTIAL_BACKOFF_JITTER:
        delay = this.baseDelay * Math.pow(2, attempt - 1);
        delay = this.addJitter(delay);
        break;
        
      default:
        // Custom strategy - use base delay as fallback
        delay = this.baseDelay;
        break;
    }
    
    // Apply special handling for rate limiting errors
    if (errorClassification === ERROR_TYPES.RATE_LIMITED) {
      delay = Math.max(delay, 5000); // Minimum 5 second delay for rate limits
    }
    
    // Cap the delay at maximum
    delay = Math.min(delay, this.maxDelay);
    
    return Math.round(delay);
  }

  /**
   * Add jitter to delay to prevent thundering herd problem
   */
  addJitter(delay) {
    const jitterAmount = delay * this.jitterFactor;
    
    switch (this.jitterType) {
      case 'uniform':
        // Uniform distribution: delay ± (jitterAmount/2)
        return delay + (Math.random() - 0.5) * jitterAmount;
        
      case 'normal':
        // Normal distribution approximation using Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return delay + (z0 * jitterAmount / 3); // Divide by 3 to keep within reasonable bounds
        
      case 'exponential':
        // Exponential distribution for jitter
        const lambda = 2 / jitterAmount;
        const exponentialJitter = -Math.log(Math.random()) / lambda;
        return delay + exponentialJitter;
        
      default:
        return delay;
    }
  }

  /**
   * Classify error to determine retry eligibility
   */
  classifyError(error) {
    const errorMessage = error.message || '';
    const errorCode = error.code || error.name || '';
    
    // Check for explicitly non-retryable errors
    if (this.nonRetryableErrors.some(pattern => 
        errorMessage.includes(pattern) || errorCode.includes(pattern))) {
      return ERROR_TYPES.PERMANENT;
    }
    
    // Check for rate limiting
    if (errorCode === 'TooManyRequestsError' || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('throttled')) {
      return ERROR_TYPES.RATE_LIMITED;
    }
    
    // Check for explicitly retryable errors
    if (this.retryableErrors.some(pattern => 
        errorMessage.includes(pattern) || errorCode.includes(pattern))) {
      return ERROR_TYPES.TRANSIENT;
    }
    
    // HTTP status code based classification
    if (error.statusCode) {
      const statusCode = error.statusCode;
      
      // Client errors (4xx) - mostly permanent
      if (statusCode >= 400 && statusCode < 500) {
        if (statusCode === 408 || statusCode === 429) { // Timeout, Rate Limited
          return statusCode === 429 ? ERROR_TYPES.RATE_LIMITED : ERROR_TYPES.TRANSIENT;
        }
        return ERROR_TYPES.PERMANENT;
      }
      
      // Server errors (5xx) - mostly transient
      if (statusCode >= 500) {
        return ERROR_TYPES.TRANSIENT;
      }
    }
    
    // Default to transient for unknown errors (conservative approach)
    return ERROR_TYPES.UNKNOWN;
  }

  /**
   * Handle successful retry completion
   */
  onRetrySuccess(operationId, attempts, duration) {
    console.log(`[${operationId}] SUCCESS after ${attempts} attempts in ${duration}ms`);
    
    if (attempts > 1) {
      this.metrics.successfulRetries++;
    }
    
    // Update average retry count
    this.updateAverageRetryCount(attempts);
    
    this.emit('retry_success', {
      operationId,
      attempts,
      duration,
      wasRetried: attempts > 1
    });
  }

  /**
   * Handle retry exhaustion (all attempts failed)
   */
  onRetryExhausted(operationId, attempts, duration, lastError, context) {
    console.log(`[${operationId}] EXHAUSTED after ${attempts} attempts in ${duration}ms`);
    console.log(`[${operationId}] Final error: ${lastError.message}`);
    
    this.metrics.exhaustedRetries++;
    this.updateAverageRetryCount(attempts);
    
    // Add to dead letter queue if enabled
    if (this.enableDeadLetterQueue) {
      this.addToDeadLetterQueue({
        operationId,
        context,
        attempts,
        duration,
        error: {
          message: lastError.message,
          code: lastError.code,
          statusCode: lastError.statusCode
        },
        timestamp: new Date().toISOString()
      });
    }
    
    this.emit('retry_exhausted', {
      operationId,
      attempts,
      duration,
      error: lastError.message,
      context
    });
  }

  /**
   * Add failed operation to dead letter queue
   */
  addToDeadLetterQueue(failedOperation) {
    this.deadLetterQueue.push(failedOperation);
    
    // Maintain queue size limit
    if (this.deadLetterQueue.length > this.maxDeadLetterSize) {
      const removed = this.deadLetterQueue.shift();
      console.log(`Dead letter queue full - removing oldest entry: ${removed.operationId}`);
    }
    
    console.log(`Added to dead letter queue: ${failedOperation.operationId} (queue size: ${this.deadLetterQueue.length})`);
    
    this.emit('dead_letter_queued', failedOperation);
  }

  // ========================
  // Specialized Retry Patterns
  // ========================

  /**
   * Retry with custom backoff function
   */
  async executeWithCustomBackoff(operation, backoffFunction, maxRetries, context = {}) {
    return this.executeWithRetry(operation, context, {
      maxRetries,
      strategy: RETRY_STRATEGIES.CUSTOM,
      calculateDelay: backoffFunction
    });
  }

  /**
   * Retry with circuit breaker integration
   */
  async executeWithCircuitBreaker(operation, circuitBreaker, context = {}) {
    if (!circuitBreaker) {
      throw new Error('Circuit breaker instance required');
    }
    
    const wrappedOperation = async () => {
      return await circuitBreaker.execute(operation);
    };
    
    return this.executeWithRetry(wrappedOperation, context, {
      maxRetries: Math.max(1, this.maxRetries - 1), // Reduce retries since CB handles failures
      enableCircuitBreaker: true
    });
  }

  /**
   * Batch retry - retry multiple operations with coordinated backoff
   */
  async executeBatchWithRetry(operations, context = {}) {
    const batchId = this.generateOperationId({ ...context, type: 'batch' });
    console.log(`[${batchId}] Starting batch retry for ${operations.length} operations`);
    
    const results = [];
    const errors = [];
    
    // Execute all operations with individual retry logic
    const promises = operations.map(async (operation, index) => {
      try {
        const result = await this.executeWithRetry(operation, {
          ...context,
          batchId,
          operationIndex: index
        });
        return { index, success: true, result };
      } catch (error) {
        return { index, success: false, error };
      }
    });
    
    const batchResults = await Promise.all(promises);
    
    // Separate successes and failures
    for (const result of batchResults) {
      if (result.success) {
        results[result.index] = result.result;
      } else {
        errors[result.index] = result.error;
      }
    }
    
    const successCount = results.filter(r => r !== undefined).length;
    const failureCount = errors.filter(e => e !== undefined).length;
    
    console.log(`[${batchId}] Batch completed: ${successCount} successes, ${failureCount} failures`);
    
    this.emit('batch_completed', {
      batchId,
      totalOperations: operations.length,
      successCount,
      failureCount,
      results,
      errors
    });
    
    return { results, errors, successCount, failureCount };
  }

  // ========================
  // Advanced Features
  // ========================

  /**
   * Retry with backpressure - reduce retry rate when system is under stress
   */
  async executeWithBackpressure(operation, context = {}) {
    const activeRetryCount = this.activeRetries.size;
    const backpressureThreshold = 10; // Max concurrent retries
    
    if (activeRetryCount > backpressureThreshold) {
      const backpressureDelay = Math.min(activeRetryCount * 100, 5000);
      console.log(`Backpressure detected - ${activeRetryCount} active retries, adding ${backpressureDelay}ms delay`);
      await this.delay(backpressureDelay);
    }
    
    return this.executeWithRetry(operation, context);
  }

  /**
   * Retry with priority queue - prioritize certain operations
   */
  async executeWithPriority(operation, priority = 'normal', context = {}) {
    const priorityWeights = { high: 0.5, normal: 1.0, low: 2.0 };
    const weight = priorityWeights[priority] || 1.0;
    
    return this.executeWithRetry(operation, { ...context, priority }, {
      baseDelay: Math.round(this.baseDelay * weight),
      maxRetries: priority === 'high' ? this.maxRetries + 1 : this.maxRetries
    });
  }

  // ========================
  // Dead Letter Queue Management
  // ========================

  /**
   * Get items from dead letter queue
   */
  getDeadLetterQueue(limit = null) {
    if (limit) {
      return this.deadLetterQueue.slice(-limit);
    }
    return [...this.deadLetterQueue];
  }

  /**
   * Retry items from dead letter queue
   */
  async retryFromDeadLetterQueue(filter = null, options = {}) {
    let itemsToRetry = this.deadLetterQueue;
    
    if (filter) {
      itemsToRetry = itemsToRetry.filter(filter);
    }
    
    console.log(`Retrying ${itemsToRetry.length} items from dead letter queue`);
    
    const retryResults = [];
    
    for (const item of itemsToRetry) {
      try {
        // Remove from dead letter queue before retry
        const index = this.deadLetterQueue.indexOf(item);
        if (index > -1) {
          this.deadLetterQueue.splice(index, 1);
        }
        
        // Reconstruct and retry the operation
        const result = await this.executeWithRetry(
          () => this.reconstructOperation(item),
          item.context,
          options
        );
        
        retryResults.push({ item, success: true, result });
        
      } catch (error) {
        retryResults.push({ item, success: false, error });
        // Item will be re-added to dead letter queue by retry logic
      }
    }
    
    const successCount = retryResults.filter(r => r.success).length;
    console.log(`Dead letter queue retry completed: ${successCount}/${itemsToRetry.length} succeeded`);
    
    return retryResults;
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue() {
    const clearedCount = this.deadLetterQueue.length;
    this.deadLetterQueue = [];
    console.log(`Cleared ${clearedCount} items from dead letter queue`);
    
    this.emit('dead_letter_cleared', { clearedCount });
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Generate unique operation ID for tracking
   */
  generateOperationId(context) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const contextId = context.id || context.name || 'op';
    return `${contextId}_${timestamp}_${random}`;
  }

  /**
   * Simple delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update running average of retry counts
   */
  updateAverageRetryCount(attempts) {
    const totalOps = this.metrics.successfulRetries + this.metrics.exhaustedRetries;
    if (totalOps > 0) {
      this.metrics.averageRetryCount = 
        ((this.metrics.averageRetryCount * (totalOps - 1)) + attempts) / totalOps;
    }
  }

  /**
   * Reconstruct operation from dead letter queue item (placeholder)
   */
  reconstructOperation(item) {
    // In a real implementation, this would reconstruct the original operation
    // For demo purposes, we'll simulate a simple operation
    throw new Error('Operation reconstruction not implemented');
  }

  /**
   * Get retry manager statistics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeRetries: this.activeRetries.size,
      deadLetterQueueSize: this.deadLetterQueue.length,
      configuration: {
        maxRetries: this.maxRetries,
        strategy: this.strategy,
        baseDelay: this.baseDelay,
        maxDelay: this.maxDelay
      }
    };
  }

  /**
   * Reset all metrics and queues
   */
  reset() {
    console.log('Resetting retry manager state');
    
    this.metrics = {
      totalAttempts: 0,
      successfulRetries: 0,
      permanentFailures: 0,
      exhaustedRetries: 0,
      averageRetryCount: 0
    };
    
    this.activeRetries.clear();
    this.deadLetterQueue = [];
    
    this.emit('retry_manager_reset');
  }
}

// ========================
// Specialized Retry Utilities
// ========================

/**
 * Retry decorator function for easy method decoration
 */
function withRetry(retryOptions = {}) {
  return function(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    const retryManager = new RetryManager(retryOptions);
    
    descriptor.value = async function(...args) {
      return retryManager.executeWithRetry(
        () => originalMethod.apply(this, args),
        { method: propertyName, class: target.constructor.name }
      );
    };
    
    return descriptor;
  };
}

/**
 * Simple retry function for one-off operations
 */
async function retry(operation, options = {}) {
  const retryManager = new RetryManager(options);
  return retryManager.executeWithRetry(operation, { type: 'simple_retry' });
}

// ========================
// Mock Services for Testing
// ========================

/**
 * Mock service that simulates various failure scenarios
 */
class UnreliableService {
  constructor(name, config = {}) {
    this.name = name;
    this.failureRate = config.failureRate || 0.3;
    this.transientFailureRate = config.transientFailureRate || 0.7; // Of failures, how many are transient
    this.requestCount = 0;
    this.isDown = false;
    this.downUntil = null;
  }
  
  async makeRequest(data) {
    this.requestCount++;
    
    // Check if service is temporarily down
    if (this.isDown && Date.now() < this.downUntil) {
      throw new Error(`${this.name} is temporarily unavailable`);
    } else if (this.isDown) {
      this.isDown = false;
      this.downUntil = null;
      console.log(`${this.name} recovered from outage`);
    }
    
    // Simulate random latency
    const latency = 50 + Math.random() * 200;
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Simulate failures
    if (Math.random() < this.failureRate) {
      if (Math.random() < this.transientFailureRate) {
        // Transient error
        const transientErrors = [
          'ECONNRESET',
          'ETIMEDOUT', 
          'ServiceUnavailableError',
          'RequestTimeoutError'
        ];
        const errorType = transientErrors[Math.floor(Math.random() * transientErrors.length)];
        throw new Error(errorType);
      } else {
        // Permanent error
        const permanentErrors = [
          'ValidationError',
          'AuthenticationError',
          'BadRequestError'
        ];
        const errorType = permanentErrors[Math.floor(Math.random() * permanentErrors.length)];
        throw new Error(errorType);
      }
    }
    
    // Success
    return {
      success: true,
      service: this.name,
      requestId: this.requestCount,
      data: data,
      processingTime: latency,
      timestamp: new Date().toISOString()
    };
  }
  
  // Simulate service outage
  simulateOutage(durationMs) {
    this.isDown = true;
    this.downUntil = Date.now() + durationMs;
    console.log(`${this.name} simulating outage for ${durationMs}ms`);
  }
  
  // Change failure rate
  setFailureRate(rate) {
    this.failureRate = rate;
    console.log(`${this.name} failure rate changed to ${(rate * 100).toFixed(1)}%`);
  }
}

// ========================
// Usage Examples and Testing
// ========================

/**
 * Demonstrate different retry strategies
 */
async function demonstrateRetryStrategies() {
  console.log('=== Retry Strategies Demonstration ===');
  
  const service = new UnreliableService('DemoService', { 
    failureRate: 0.6, // 60% failure rate
    transientFailureRate: 0.8 // 80% of failures are transient
  });
  
  // Test different retry strategies
  const strategies = [
    RETRY_STRATEGIES.FIXED_DELAY,
    RETRY_STRATEGIES.LINEAR_BACKOFF,
    RETRY_STRATEGIES.EXPONENTIAL_BACKOFF,
    RETRY_STRATEGIES.EXPONENTIAL_BACKOFF_JITTER
  ];
  
  for (const strategy of strategies) {
    console.log(`\n--- Testing ${strategy} ---`);
    
    const retryManager = new RetryManager({
      strategy: strategy,
      maxRetries: 4,
      baseDelay: 500,
      maxDelay: 10000
    });
    
    try {
      const result = await retryManager.executeWithRetry(
        () => service.makeRequest({ test: strategy }),
        { strategy: strategy }
      );
      
      console.log(`${strategy} SUCCESS:`, result.success);
      
    } catch (error) {
      console.log(`${strategy} FAILED:`, error.message);
    }
    
    console.log(`${strategy} metrics:`, retryManager.getMetrics());
  }
}

/**
 * Demonstrate batch retry operations
 */
async function demonstrateBatchRetry() {
  console.log('\n=== Batch Retry Demonstration ===');
  
  const service = new UnreliableService('BatchService', { failureRate: 0.4 });
  
  const retryManager = new RetryManager({
    strategy: RETRY_STRATEGIES.EXPONENTIAL_BACKOFF_JITTER,
    maxRetries: 3,
    baseDelay: 100
  });
  
  // Create batch of operations
  const operations = [];
  for (let i = 1; i <= 5; i++) {
    operations.push(() => service.makeRequest({ batchItem: i }));
  }
  
  const batchResult = await retryManager.executeBatchWithRetry(
    operations,
    { batchName: 'demo_batch' }
  );
  
  console.log(`Batch Results: ${batchResult.successCount}/${operations.length} succeeded`);
  console.log('Successful results:', batchResult.results.filter(r => r !== undefined).length);
  console.log('Failed operations:', batchResult.errors.filter(e => e !== undefined).length);
}

/**
 * Demonstrate dead letter queue functionality
 */
async function demonstrateDeadLetterQueue() {
  console.log('\n=== Dead Letter Queue Demonstration ===');
  
  const service = new UnreliableService('DLQService', { 
    failureRate: 0.9, // Very high failure rate
    transientFailureRate: 0.2 // Most failures are permanent
  });
  
  const retryManager = new RetryManager({
    strategy: RETRY_STRATEGIES.EXPONENTIAL_BACKOFF,
    maxRetries: 2,
    enableDeadLetterQueue: true
  });
  
  // Listen for dead letter queue events
  retryManager.on('dead_letter_queued', (item) => {
    console.log(`Added to DLQ: ${item.operationId} after ${item.attempts} attempts`);
  });
  
  // Try several operations that will likely fail
  const operations = [
    { id: 'op1', data: 'test1' },
    { id: 'op2', data: 'test2' },
    { id: 'op3', data: 'test3' }
  ];
  
  for (const op of operations) {
    try {
      await retryManager.executeWithRetry(
        () => service.makeRequest(op.data),
        { id: op.id }
      );
    } catch (error) {
      console.log(`Operation ${op.id} failed permanently: ${error.message}`);
    }
  }
  
  // Show dead letter queue contents
  const dlqItems = retryManager.getDeadLetterQueue();
  console.log(`\nDead Letter Queue contains ${dlqItems.length} items:`);
  dlqItems.forEach(item => {
    console.log(`- ${item.operationId}: ${item.error.message} (${item.attempts} attempts)`);
  });
  
  console.log('\nFinal metrics:', retryManager.getMetrics());
}

// Export for use in other modules
module.exports = { 
  RetryManager,
  RETRY_STRATEGIES,
  ERROR_TYPES,
  UnreliableService,
  withRetry,
  retry,
  demonstrateRetryStrategies,
  demonstrateBatchRetry,
  demonstrateDeadLetterQueue
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
  (async () => {
    await demonstrateRetryStrategies();
    await demonstrateBatchRetry();
    await demonstrateDeadLetterQueue();
  })().catch(console.error);
}