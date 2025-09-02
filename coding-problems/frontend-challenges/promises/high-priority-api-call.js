/**
 * File: high-priority-api-call.js
 * Description: Implementation of high priority API call system with queue management,
 *              retry mechanisms, and priority-based execution
 * 
 * Learning objectives:
 * - Understand priority queues and scheduling algorithms
 * - Learn request cancellation and queue management
 * - Implement retry mechanisms with exponential backoff
 * - Handle concurrent request limits and priority ordering
 * 
 * Real-world applications:
 * - Critical API calls (payment processing, authentication)
 * - Resource-constrained environments with request limits
 * - Background job processing with priority levels
 * - Network request optimization for mobile applications
 */

// =======================
// Approach 1: Basic Priority Queue Implementation
// =======================

/**
 * Basic high priority API call implementation using a simple priority queue
 * Uses arrays for queue management and setTimeout for scheduling
 * 
 * Time Complexity: O(n) for insertion, O(1) for extraction
 * Space Complexity: O(n) for storing queued requests
 */
function createBasicPriorityAPI() {
  // Priority queue to store requests (higher priority first)
  const requestQueue = [];
  // Track currently executing requests
  let activeRequests = 0;
  // Maximum concurrent requests allowed
  const MAX_CONCURRENT = 3;
  
  /**
   * Add a request to the priority queue
   * Higher priority values get executed first
   * 
   * @param {Function} apiCall - The API call function that returns a Promise
   * @param {Object} options - Configuration options
   * @param {number} options.priority - Priority level (higher = more important)
   * @param {number} options.timeout - Request timeout in milliseconds
   * @param {number} options.retries - Number of retry attempts
   * @returns {Promise} Promise that resolves with the API response
   */
  function makeHighPriorityCall(apiCall, options = {}) {
    const {
      priority = 0,
      timeout = 5000,
      retries = 3
    } = options;
    
    return new Promise((resolve, reject) => {
      const requestItem = {
        apiCall,
        priority,
        timeout,
        retries,
        resolve,
        reject,
        // Track creation time for debugging and metrics
        createdAt: Date.now()
      };
      
      // Insert request into queue maintaining priority order
      // Higher priority items go to the front
      let insertIndex = 0;
      while (insertIndex < requestQueue.length && 
             requestQueue[insertIndex].priority >= priority) {
        insertIndex++;
      }
      
      // Insert at the calculated position to maintain sort order
      requestQueue.splice(insertIndex, 0, requestItem);
      
      // Try to process requests immediately if we have capacity
      processQueue();
    });
  }
  
  /**
   * Process the request queue, executing requests based on priority
   * Maintains concurrency limits and handles request execution
   */
  function processQueue() {
    // Can't process if we're at max concurrency or queue is empty
    if (activeRequests >= MAX_CONCURRENT || requestQueue.length === 0) {
      return;
    }
    
    // Get the highest priority request (first in sorted queue)
    const request = requestQueue.shift();
    activeRequests++;
    
    // Execute the request with timeout and retry logic
    executeRequest(request)
      .then(result => {
        // Request succeeded, resolve the original promise
        request.resolve(result);
      })
      .catch(error => {
        // Request failed, reject the original promise
        request.reject(error);
      })
      .finally(() => {
        // Decrement active counter and try to process next request
        activeRequests--;
        // Use setTimeout to avoid stack overflow with recursive calls
        setTimeout(processQueue, 0);
      });
  }
  
  /**
   * Execute a single request with timeout and retry logic
   * Handles the actual API call execution with error recovery
   * 
   * @param {Object} request - Request object from the queue
   * @returns {Promise} Promise that resolves/rejects based on execution
   */
  async function executeRequest(request) {
    const { apiCall, timeout, retries } = request;
    let lastError;
    
    // Attempt the request with the specified number of retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create a timeout promise to race against the actual request
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
        
        // Race the API call against the timeout
        // This ensures requests don't hang indefinitely
        const result = await Promise.race([
          apiCall(),
          timeoutPromise
        ]);
        
        // If we get here, the request succeeded
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt < retries) {
          // Calculate exponential backoff delay
          // Starts at 100ms, doubles each time (100, 200, 400, 800...)
          const delay = Math.min(100 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retry attempts failed, throw the last error
    throw new Error(`Request failed after ${retries + 1} attempts: ${lastError.message}`);
  }
  
  /**
   * Get current queue statistics for monitoring
   * Useful for debugging and performance monitoring
   * 
   * @returns {Object} Queue statistics and metrics
   */
  function getQueueStats() {
    return {
      queueLength: requestQueue.length,
      activeRequests,
      maxConcurrent: MAX_CONCURRENT,
      // Get priority distribution for analysis
      priorityDistribution: requestQueue.reduce((acc, req) => {
        acc[req.priority] = (acc[req.priority] || 0) + 1;
        return acc;
      }, {}),
      // Calculate average wait time
      averageWaitTime: requestQueue.length > 0 
        ? requestQueue.reduce((sum, req) => sum + (Date.now() - req.createdAt), 0) / requestQueue.length 
        : 0
    };
  }
  
  return {
    makeHighPriorityCall,
    getQueueStats
  };
}

// =======================
// Approach 2: Advanced Priority API with Cancellation
// =======================

/**
 * Advanced implementation with request cancellation, priority groups,
 * and sophisticated queue management using a binary heap for efficiency
 * 
 * Time Complexity: O(log n) for insertion and extraction
 * Space Complexity: O(n) for storing queued requests
 */
function createAdvancedPriorityAPI() {
  // Use a Map to store priority groups for better organization
  const priorityGroups = new Map();
  // Track active requests by ID for cancellation
  const activeRequestsMap = new Map();
  // Global request counter for unique IDs
  let requestIdCounter = 0;
  let activeCount = 0;
  const MAX_CONCURRENT = 5;
  
  /**
   * Priority heap implementation for efficient queue management
   * Maintains requests in priority order with O(log n) operations
   */
  class PriorityHeap {
    constructor() {
      this.heap = [];
    }
    
    /**
     * Add item to heap maintaining heap property
     * Higher priority items bubble up to the top
     */
    push(item) {
      this.heap.push(item);
      this._heapifyUp(this.heap.length - 1);
    }
    
    /**
     * Remove and return highest priority item
     * Maintains heap property after removal
     */
    pop() {
      if (this.heap.length === 0) return null;
      if (this.heap.length === 1) return this.heap.pop();
      
      // Store the top item to return
      const top = this.heap[0];
      // Move last item to top and heapify down
      this.heap[0] = this.heap.pop();
      this._heapifyDown(0);
      
      return top;
    }
    
    /**
     * Check if heap is empty
     */
    isEmpty() {
      return this.heap.length === 0;
    }
    
    /**
     * Get current heap size
     */
    size() {
      return this.heap.length;
    }
    
    /**
     * Move item up the heap to maintain priority order
     * Used when inserting new items
     */
    _heapifyUp(index) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      // If we're at root or parent has higher priority, stop
      if (index === 0 || this.heap[parentIndex].priority >= this.heap[index].priority) {
        return;
      }
      
      // Swap with parent and continue up
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      this._heapifyUp(parentIndex);
    }
    
    /**
     * Move item down the heap to maintain priority order
     * Used when removing the top item
     */
    _heapifyDown(index) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let largest = index;
      
      // Find the child with highest priority
      if (leftChild < this.heap.length && 
          this.heap[leftChild].priority > this.heap[largest].priority) {
        largest = leftChild;
      }
      
      if (rightChild < this.heap.length && 
          this.heap[rightChild].priority > this.heap[largest].priority) {
        largest = rightChild;
      }
      
      // If a child has higher priority, swap and continue down
      if (largest !== index) {
        [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
        this._heapifyDown(largest);
      }
    }
  }
  
  // Initialize the priority heap
  const requestHeap = new PriorityHeap();
  
  /**
   * Make a high priority API call with advanced features
   * Supports cancellation, priority groups, and detailed configuration
   * 
   * @param {Function} apiCall - The API call function
   * @param {Object} options - Advanced configuration options
   * @returns {Object} Object with promise and cancel function
   */
  function makeHighPriorityCall(apiCall, options = {}) {
    const {
      priority = 0,
      timeout = 10000,
      retries = 3,
      group = 'default',
      onProgress = () => {},
      abortController = new AbortController()
    } = options;
    
    // Generate unique request ID
    const requestId = ++requestIdCounter;
    let isResolved = false;
    
    const requestPromise = new Promise((resolve, reject) => {
      const request = {
        id: requestId,
        apiCall,
        priority,
        timeout,
        retries,
        group,
        onProgress,
        abortController,
        resolve: (result) => {
          if (!isResolved) {
            isResolved = true;
            resolve(result);
          }
        },
        reject: (error) => {
          if (!isResolved) {
            isResolved = true;
            reject(error);
          }
        },
        createdAt: Date.now(),
        // Track which priority group this belongs to
        groupStats: priorityGroups.get(group) || { total: 0, completed: 0, failed: 0 }
      };
      
      // Update group statistics
      if (!priorityGroups.has(group)) {
        priorityGroups.set(group, { total: 0, completed: 0, failed: 0 });
      }
      priorityGroups.get(group).total++;
      
      // Add to the priority heap for efficient processing
      requestHeap.push(request);
      
      // Try to process immediately if possible
      processQueue();
    });
    
    /**
     * Cancel this specific request
     * Removes from queue or aborts if currently executing
     */
    const cancel = (reason = 'Request cancelled by user') => {
      if (isResolved) return false;
      
      // Signal abortion to any ongoing request
      abortController.abort();
      
      // Remove from active requests if it's currently executing
      if (activeRequestsMap.has(requestId)) {
        activeRequestsMap.delete(requestId);
        activeCount--;
      }
      
      // Mark as resolved to prevent later resolution
      isResolved = true;
      
      return true;
    };
    
    return {
      promise: requestPromise,
      cancel,
      id: requestId
    };
  }
  
  /**
   * Process the request queue with advanced scheduling
   * Handles priority-based execution with concurrency limits
   */
  async function processQueue() {
    // Process as many requests as concurrency allows
    while (activeCount < MAX_CONCURRENT && !requestHeap.isEmpty()) {
      const request = requestHeap.pop();
      
      // Skip if request was cancelled while in queue
      if (request.abortController.signal.aborted) {
        continue;
      }
      
      activeCount++;
      activeRequestsMap.set(request.id, request);
      
      // Execute request asynchronously to avoid blocking queue processing
      executeAdvancedRequest(request)
        .then(result => {
          // Update group statistics on success
          priorityGroups.get(request.group).completed++;
          request.resolve(result);
        })
        .catch(error => {
          // Update group statistics on failure
          priorityGroups.get(request.group).failed++;
          request.reject(error);
        })
        .finally(() => {
          // Clean up and try to process next request
          activeRequestsMap.delete(request.id);
          activeCount--;
          // Use setTimeout to prevent stack overflow
          setTimeout(processQueue, 0);
        });
    }
  }
  
  /**
   * Execute a request with advanced error handling and progress tracking
   * Supports abort signals and detailed progress reporting
   */
  async function executeAdvancedRequest(request) {
    const { apiCall, timeout, retries, onProgress, abortController } = request;
    let lastError;
    
    // Attempt request with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      // Check if request was cancelled before starting attempt
      if (abortController.signal.aborted) {
        throw new Error('Request aborted');
      }
      
      try {
        // Report progress for this attempt
        onProgress({
          attempt: attempt + 1,
          maxAttempts: retries + 1,
          phase: 'executing'
        });
        
        // Create timeout promise that respects abort signal
        const timeoutPromise = new Promise((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Request timeout'));
          }, timeout);
          
          // Clear timeout if request is aborted
          abortController.signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Request aborted'));
          });
        });
        
        // Execute the API call with abort signal support
        const apiPromise = apiCall(abortController.signal);
        
        // Race against timeout and abort
        const result = await Promise.race([apiPromise, timeoutPromise]);
        
        // Report success
        onProgress({
          attempt: attempt + 1,
          maxAttempts: retries + 1,
          phase: 'completed'
        });
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry if aborted or on last attempt
        if (abortController.signal.aborted || attempt === retries) {
          break;
        }
        
        // Report retry with backoff
        onProgress({
          attempt: attempt + 1,
          maxAttempts: retries + 1,
          phase: 'retrying',
          error: error.message
        });
        
        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = 200 * Math.pow(2, attempt);
        const jitter = Math.random() * baseDelay * 0.1; // 10% jitter
        const delay = Math.min(baseDelay + jitter, 10000);
        
        // Wait for backoff period, but respect abort signal
        await new Promise((resolve, reject) => {
          const delayId = setTimeout(resolve, delay);
          abortController.signal.addEventListener('abort', () => {
            clearTimeout(delayId);
            reject(new Error('Request aborted during backoff'));
          });
        });
      }
    }
    
    // All attempts failed
    throw new Error(`Request failed after ${retries + 1} attempts: ${lastError?.message || 'Unknown error'}`);
  }
  
  /**
   * Cancel all requests in a specific group
   * Useful for cleaning up related requests together
   */
  function cancelGroup(groupName, reason = 'Group cancelled') {
    const cancelled = [];
    
    // Cancel any requests currently in the heap
    // Note: This is inefficient but simple - in production, you'd want
    // a more sophisticated data structure for group-based operations
    const remainingRequests = [];
    
    while (!requestHeap.isEmpty()) {
      const request = requestHeap.pop();
      if (request.group === groupName) {
        request.abortController.abort();
        cancelled.push(request.id);
      } else {
        remainingRequests.push(request);
      }
    }
    
    // Rebuild heap with remaining requests
    remainingRequests.forEach(req => requestHeap.push(req));
    
    // Cancel active requests in the group
    for (const [id, request] of activeRequestsMap.entries()) {
      if (request.group === groupName) {
        request.abortController.abort();
        cancelled.push(id);
      }
    }
    
    return cancelled;
  }
  
  /**
   * Get comprehensive statistics about the API call system
   * Includes queue status, group metrics, and performance data
   */
  function getAdvancedStats() {
    const groupStats = {};
    for (const [group, stats] of priorityGroups.entries()) {
      groupStats[group] = {
        ...stats,
        successRate: stats.total > 0 ? stats.completed / stats.total : 0,
        failureRate: stats.total > 0 ? stats.failed / stats.total : 0
      };
    }
    
    return {
      queue: {
        length: requestHeap.size(),
        active: activeCount,
        maxConcurrent: MAX_CONCURRENT,
        utilizationRate: activeCount / MAX_CONCURRENT
      },
      groups: groupStats,
      performance: {
        totalRequests: requestIdCounter,
        averageWaitTime: calculateAverageWaitTime()
      }
    };
  }
  
  /**
   * Calculate average wait time for requests in queue
   * Useful for performance monitoring and optimization
   */
  function calculateAverageWaitTime() {
    if (requestHeap.isEmpty()) return 0;
    
    const now = Date.now();
    let totalWaitTime = 0;
    const requests = [...requestHeap.heap]; // Shallow copy to avoid modification
    
    requests.forEach(req => {
      totalWaitTime += now - req.createdAt;
    });
    
    return totalWaitTime / requests.length;
  }
  
  return {
    makeHighPriorityCall,
    cancelGroup,
    getAdvancedStats
  };
}

// =======================
// Approach 3: Real-world Implementation with Rate Limiting
// =======================

/**
 * Production-ready implementation with rate limiting, circuit breaker,
 * and comprehensive monitoring suitable for enterprise applications
 * 
 * Features:
 * - Rate limiting per endpoint and globally
 * - Circuit breaker pattern for failing services
 * - Request deduplication for identical calls
 * - Comprehensive metrics and monitoring
 * - Graceful degradation and fallback strategies
 */
function createProductionPriorityAPI(config = {}) {
  const {
    maxConcurrent = 10,
    rateLimitPerSecond = 100,
    circuitBreakerThreshold = 10,
    circuitBreakerTimeout = 30000,
    enableDeduplication = true,
    enableMetrics = true
  } = config;
  
  // Core system state
  const requestHeap = new PriorityHeap();
  const activeRequests = new Map();
  const rateLimiters = new Map();
  const circuitBreakers = new Map();
  const requestCache = new Map(); // For deduplication
  const metrics = new Map();
  
  let activeCount = 0;
  let requestIdCounter = 0;
  
  /**
   * Rate limiter implementation using token bucket algorithm
   * Provides smooth rate limiting with burst capacity
   */
  class RateLimiter {
    constructor(tokensPerSecond, burstCapacity = tokensPerSecond * 2) {
      this.tokensPerSecond = tokensPerSecond;
      this.burstCapacity = burstCapacity;
      this.tokens = burstCapacity;
      this.lastRefill = Date.now();
    }
    
    /**
     * Check if request can proceed based on available tokens
     * Refills tokens based on elapsed time
     */
    canProceed() {
      this.refillTokens();
      
      if (this.tokens >= 1) {
        this.tokens--;
        return true;
      }
      
      return false;
    }
    
    /**
     * Refill tokens based on elapsed time
     * Implements token bucket algorithm for smooth rate limiting
     */
    refillTokens() {
      const now = Date.now();
      const timePassed = (now - this.lastRefill) / 1000;
      const tokensToAdd = timePassed * this.tokensPerSecond;
      
      this.tokens = Math.min(this.burstCapacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
    
    /**
     * Get time until next token is available
     * Used for scheduling delayed retries
     */
    timeUntilNextToken() {
      if (this.tokens >= 1) return 0;
      
      const tokensNeeded = 1 - this.tokens;
      return (tokensNeeded / this.tokensPerSecond) * 1000;
    }
  }
  
  /**
   * Circuit breaker implementation for handling failing services
   * Prevents cascade failures by temporarily blocking requests to failing endpoints
   */
  class CircuitBreaker {
    constructor(threshold, timeout) {
      this.threshold = threshold;
      this.timeout = timeout;
      this.failures = 0;
      this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
      this.nextAttempt = 0;
    }
    
    /**
     * Check if request can proceed through circuit breaker
     * Implements circuit breaker state machine logic
     */
    canProceed() {
      const now = Date.now();
      
      switch (this.state) {
        case 'CLOSED':
          // Normal operation, allow request
          return true;
          
        case 'OPEN':
          // Circuit is open, check if we should try again
          if (now >= this.nextAttempt) {
            this.state = 'HALF_OPEN';
            return true;
          }
          return false;
          
        case 'HALF_OPEN':
          // Testing if service is back up, allow one request
          return true;
          
        default:
          return false;
      }
    }
    
    /**
     * Record successful request
     * Resets failure count and closes circuit if open
     */
    recordSuccess() {
      this.failures = 0;
      this.state = 'CLOSED';
    }
    
    /**
     * Record failed request
     * Opens circuit if failure threshold is exceeded
     */
    recordFailure() {
      this.failures++;
      
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.timeout;
      }
    }
    
    /**
     * Get current circuit breaker status
     * Useful for monitoring and debugging
     */
    getStatus() {
      return {
        state: this.state,
        failures: this.failures,
        threshold: this.threshold,
        nextAttempt: this.nextAttempt
      };
    }
  }
  
  // Initialize global rate limiter
  const globalRateLimiter = new RateLimiter(rateLimitPerSecond);
  
  /**
   * Create a cache key for request deduplication
   * Generates unique key based on function and arguments
   */
  function createCacheKey(apiCall, args) {
    if (!enableDeduplication) return null;
    
    // Create a simple hash of the function and arguments
    const functionStr = apiCall.toString();
    const argsStr = JSON.stringify(args || []);
    return `${functionStr.slice(0, 100)}_${argsStr}`;
  }
  
  /**
   * Production-ready high priority API call with comprehensive features
   * Supports all enterprise requirements including monitoring and resilience
   */
  function makeHighPriorityCall(apiCall, options = {}) {
    const {
      priority = 0,
      timeout = 15000,
      retries = 3,
      endpoint = 'default',
      args = [],
      onProgress = () => {},
      fallbackFn = null,
      enableCircuitBreaker = true,
      customRateLimit = null
    } = options;
    
    const requestId = ++requestIdCounter;
    const cacheKey = createCacheKey(apiCall, args);
    
    // Check for duplicate requests
    if (cacheKey && requestCache.has(cacheKey)) {
      // Return existing promise for identical request
      return requestCache.get(cacheKey);
    }
    
    const abortController = new AbortController();
    
    const requestPromise = new Promise(async (resolve, reject) => {
      try {
        // Initialize metrics for this endpoint
        if (enableMetrics && !metrics.has(endpoint)) {
          metrics.set(endpoint, {
            total: 0,
            success: 0,
            failed: 0,
            averageLatency: 0,
            lastUpdated: Date.now()
          });
        }
        
        // Get or create rate limiter for endpoint
        let rateLimiter = rateLimiters.get(endpoint);
        if (!rateLimiter) {
          const limit = customRateLimit || rateLimitPerSecond;
          rateLimiter = new RateLimiter(limit);
          rateLimiters.set(endpoint, rateLimiter);
        }
        
        // Get or create circuit breaker for endpoint
        let circuitBreaker = null;
        if (enableCircuitBreaker) {
          circuitBreaker = circuitBreakers.get(endpoint);
          if (!circuitBreaker) {
            circuitBreaker = new CircuitBreaker(circuitBreakerThreshold, circuitBreakerTimeout);
            circuitBreakers.set(endpoint, circuitBreaker);
          }
        }
        
        const request = {
          id: requestId,
          apiCall,
          args,
          priority,
          timeout,
          retries,
          endpoint,
          rateLimiter,
          circuitBreaker,
          onProgress,
          fallbackFn,
          abortController,
          resolve,
          reject,
          createdAt: Date.now(),
          cacheKey
        };
        
        // Add to priority queue
        requestHeap.push(request);
        
        // Update metrics
        if (enableMetrics) {
          metrics.get(endpoint).total++;
        }
        
        // Start processing
        processProductionQueue();
        
      } catch (error) {
        reject(error);
      }
    });
    
    // Cache the promise for deduplication
    if (cacheKey) {
      requestCache.set(cacheKey, {
        promise: requestPromise,
        cancel: () => abortController.abort()
      });
      
      // Clean up cache after request completes
      requestPromise.finally(() => {
        setTimeout(() => requestCache.delete(cacheKey), 1000);
      });
    }
    
    return {
      promise: requestPromise,
      cancel: () => abortController.abort(),
      id: requestId
    };
  }
  
  /**
   * Production queue processor with comprehensive checks
   * Handles rate limiting, circuit breaking, and graceful degradation
   */
  async function processProductionQueue() {
    while (activeCount < maxConcurrent && !requestHeap.isEmpty()) {
      const request = requestHeap.pop();
      
      // Skip cancelled requests
      if (request.abortController.signal.aborted) {
        continue;
      }
      
      // Check global rate limit
      if (!globalRateLimiter.canProceed()) {
        // Put request back and wait for next token
        requestHeap.push(request);
        const delay = globalRateLimiter.timeUntilNextToken();
        setTimeout(processProductionQueue, Math.min(delay, 1000));
        break;
      }
      
      // Check endpoint-specific rate limit
      if (!request.rateLimiter.canProceed()) {
        // Put request back and wait
        requestHeap.push(request);
        const delay = request.rateLimiter.timeUntilNextToken();
        setTimeout(processProductionQueue, Math.min(delay, 1000));
        break;
      }
      
      // Check circuit breaker
      if (request.circuitBreaker && !request.circuitBreaker.canProceed()) {
        // Circuit is open, try fallback or reject
        if (request.fallbackFn) {
          executeProductionRequest(request, request.fallbackFn);
        } else {
          request.reject(new Error(`Circuit breaker is open for endpoint: ${request.endpoint}`));
        }
        continue;
      }
      
      activeCount++;
      activeRequests.set(request.id, request);
      
      // Execute request
      executeProductionRequest(request);
    }
  }
  
  /**
   * Execute production request with comprehensive monitoring
   * Handles all error conditions and updates metrics appropriately
   */
  async function executeProductionRequest(request, customApiCall = null) {
    const startTime = Date.now();
    const { endpoint, apiCall, args, retries, circuitBreaker, onProgress } = request;
    const actualApiCall = customApiCall || apiCall;
    
    let lastError;
    
    try {
      // Attempt with retries
      for (let attempt = 0; attempt <= retries; attempt++) {
        if (request.abortController.signal.aborted) {
          throw new Error('Request aborted');
        }
        
        try {
          onProgress({
            attempt: attempt + 1,
            maxAttempts: retries + 1,
            phase: 'executing'
          });
          
          // Create timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
              reject(new Error('Request timeout'));
            }, request.timeout);
            
            request.abortController.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
            });
          });
          
          // Execute API call
          const result = await Promise.race([
            actualApiCall(...args, request.abortController.signal),
            timeoutPromise
          ]);
          
          // Update metrics on success
          const latency = Date.now() - startTime;
          updateMetrics(endpoint, true, latency);
          
          // Update circuit breaker
          if (circuitBreaker) {
            circuitBreaker.recordSuccess();
          }
          
          request.resolve(result);
          return;
          
        } catch (error) {
          lastError = error;
          
          if (request.abortController.signal.aborted || attempt === retries) {
            break;
          }
          
          // Exponential backoff with jitter
          const baseDelay = 300 * Math.pow(2, attempt);
          const jitter = Math.random() * baseDelay * 0.2;
          const delay = Math.min(baseDelay + jitter, 15000);
          
          onProgress({
            attempt: attempt + 1,
            maxAttempts: retries + 1,
            phase: 'retrying',
            error: error.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // All attempts failed
      throw lastError;
      
    } catch (error) {
      // Update metrics on failure
      const latency = Date.now() - startTime;
      updateMetrics(endpoint, false, latency);
      
      // Update circuit breaker
      if (circuitBreaker) {
        circuitBreaker.recordFailure();
      }
      
      request.reject(error);
      
    } finally {
      // Cleanup
      activeRequests.delete(request.id);
      activeCount--;
      
      // Continue processing queue
      setTimeout(processProductionQueue, 0);
    }
  }
  
  /**
   * Update metrics for monitoring and analysis
   * Maintains running averages and success rates
   */
  function updateMetrics(endpoint, success, latency) {
    if (!enableMetrics) return;
    
    const metric = metrics.get(endpoint);
    if (!metric) return;
    
    if (success) {
      metric.success++;
    } else {
      metric.failed++;
    }
    
    // Update average latency using exponential moving average
    const alpha = 0.1; // Smoothing factor
    metric.averageLatency = metric.averageLatency * (1 - alpha) + latency * alpha;
    metric.lastUpdated = Date.now();
  }
  
  /**
   * Get comprehensive production statistics
   * Includes all system metrics for monitoring dashboards
   */
  function getProductionStats() {
    const endpointStats = {};
    
    // Compile endpoint metrics
    for (const [endpoint, metric] of metrics.entries()) {
      const rateLimiter = rateLimiters.get(endpoint);
      const circuitBreaker = circuitBreakers.get(endpoint);
      
      endpointStats[endpoint] = {
        requests: {
          total: metric.total,
          success: metric.success,
          failed: metric.failed,
          successRate: metric.total > 0 ? metric.success / metric.total : 0
        },
        performance: {
          averageLatency: Math.round(metric.averageLatency),
          lastUpdated: metric.lastUpdated
        },
        rateLimiting: {
          tokensAvailable: Math.floor(rateLimiter?.tokens || 0),
          tokensPerSecond: rateLimiter?.tokensPerSecond || 0
        },
        circuitBreaker: circuitBreaker?.getStatus() || null
      };
    }
    
    return {
      system: {
        activeRequests: activeCount,
        maxConcurrent,
        queueLength: requestHeap.size(),
        utilizationRate: activeCount / maxConcurrent
      },
      rateLimiting: {
        globalTokens: Math.floor(globalRateLimiter.tokens),
        globalLimit: rateLimitPerSecond
      },
      endpoints: endpointStats,
      cache: {
        size: requestCache.size,
        enabled: enableDeduplication
      }
    };
  }
  
  return {
    makeHighPriorityCall,
    getProductionStats,
    // Utility methods for monitoring and management
    clearCache: () => requestCache.clear(),
    resetCircuitBreaker: (endpoint) => {
      const breaker = circuitBreakers.get(endpoint);
      if (breaker) {
        breaker.failures = 0;
        breaker.state = 'CLOSED';
      }
    },
    getEndpointHealth: (endpoint) => endpointStats[endpoint] || null
  };
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic usage for critical API calls
 * Demonstrates simple priority-based request handling
 */
function demonstrateBasicUsage() {
  console.log('=== Basic Priority API Usage ===\n');
  
  const basicAPI = createBasicPriorityAPI();
  
  // Simulate different API calls with varying priorities
  async function criticalUserAuth() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { userId: 123, token: 'auth-token' };
  }
  
  async function normalDataFetch() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { data: 'some data' };
  }
  
  async function lowPriorityAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { event: 'tracked' };
  }
  
  // Make requests with different priorities
  const requests = [
    // Low priority request submitted first
    basicAPI.makeHighPriorityCall(lowPriorityAnalytics, { priority: 1 }),
    // High priority request should jump ahead
    basicAPI.makeHighPriorityCall(criticalUserAuth, { priority: 10 }),
    // Medium priority request
    basicAPI.makeHighPriorityCall(normalDataFetch, { priority: 5 })
  ];
  
  // Execute and show results
  Promise.allSettled(requests).then(results => {
    console.log('Request results:', results);
    console.log('Queue stats:', basicAPI.getQueueStats());
  });
}

/**
 * Example 2: Advanced usage with cancellation and groups
 * Shows sophisticated request management and monitoring
 */
function demonstrateAdvancedUsage() {
  console.log('=== Advanced Priority API Usage ===\n');
  
  const advancedAPI = createAdvancedPriorityAPI();
  
  // Simulate API calls that support abort signals
  async function paymentProcessing(abortSignal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve({ paymentId: 'pay_123' }), 1000);
      
      abortSignal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Payment cancelled'));
      });
    });
  }
  
  async function userDataSync(abortSignal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve({ synced: true }), 800);
      
      abortSignal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Sync cancelled'));
      });
    });
  }
  
  // Make grouped requests with progress tracking
  const paymentRequest = advancedAPI.makeHighPriorityCall(paymentProcessing, {
    priority: 10,
    group: 'payments',
    timeout: 2000,
    onProgress: (progress) => {
      console.log('Payment progress:', progress);
    }
  });
  
  const syncRequest = advancedAPI.makeHighPriorityCall(userDataSync, {
    priority: 5,
    group: 'user-data',
    timeout: 1500,
    onProgress: (progress) => {
      console.log('Sync progress:', progress);
    }
  });
  
  // Cancel payment after 500ms to demonstrate cancellation
  setTimeout(() => {
    console.log('Cancelling payment request...');
    paymentRequest.cancel('User cancelled payment');
  }, 500);
  
  // Monitor results
  Promise.allSettled([paymentRequest.promise, syncRequest.promise])
    .then(results => {
      console.log('Advanced request results:', results);
      console.log('System stats:', advancedAPI.getAdvancedStats());
    });
}

/**
 * Example 3: Production usage with comprehensive monitoring
 * Demonstrates enterprise-grade request management
 */
async function demonstrateProductionUsage() {
  console.log('=== Production Priority API Usage ===\n');
  
  const productionAPI = createProductionPriorityAPI({
    maxConcurrent: 3,
    rateLimitPerSecond: 5,
    circuitBreakerThreshold: 3,
    enableDeduplication: true,
    enableMetrics: true
  });
  
  // Simulate various API endpoints
  const apiEndpoints = {
    async userService(userId, abortSignal) {
      // Simulate occasional failures for circuit breaker demo
      if (Math.random() < 0.3) {
        throw new Error('User service temporarily unavailable');
      }
      await new Promise(resolve => setTimeout(resolve, 200));
      return { user: { id: userId, name: 'John Doe' } };
    },
    
    async paymentService(amount, abortSignal) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { transaction: { id: 'txn_123', amount } };
    },
    
    async analyticsService(event, abortSignal) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { tracked: true, event };
    }
  };
  
  // Fallback function for when circuit breaker is open
  function userServiceFallback(userId) {
    return { user: { id: userId, name: 'Cached User', cached: true } };
  }
  
  // Make various requests to demonstrate features
  const requests = [
    // High priority payment with fallback
    productionAPI.makeHighPriorityCall(apiEndpoints.paymentService, {
      priority: 10,
      endpoint: 'payment-api',
      args: [100],
      timeout: 2000,
      retries: 2,
      onProgress: (progress) => console.log('Payment:', progress)
    }),
    
    // User service with circuit breaker and fallback
    productionAPI.makeHighPriorityCall(apiEndpoints.userService, {
      priority: 8,
      endpoint: 'user-api',
      args: [123],
      fallbackFn: userServiceFallback,
      onProgress: (progress) => console.log('User:', progress)
    }),
    
    // Analytics (lowest priority)
    productionAPI.makeHighPriorityCall(apiEndpoints.analyticsService, {
      priority: 1,
      endpoint: 'analytics-api',
      args: ['page_view'],
      onProgress: (progress) => console.log('Analytics:', progress)
    }),
    
    // Duplicate user request (should be deduplicated)
    productionAPI.makeHighPriorityCall(apiEndpoints.userService, {
      priority: 7,
      endpoint: 'user-api',
      args: [123],
      fallbackFn: userServiceFallback
    })
  ];
  
  // Execute requests and monitor results
  const results = await Promise.allSettled(requests.map(r => r.promise));
  
  console.log('Production request results:');
  results.forEach((result, index) => {
    console.log(`Request ${index + 1}:`, result);
  });
  
  console.log('\nProduction system stats:');
  console.log(JSON.stringify(productionAPI.getProductionStats(), null, 2));
}

// Export all implementations and examples
module.exports = {
  createBasicPriorityAPI,
  createAdvancedPriorityAPI,
  createProductionPriorityAPI,
  demonstrateBasicUsage,
  demonstrateAdvancedUsage,
  demonstrateProductionUsage
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('High Priority API Call Implementations\n');
  console.log('This module demonstrates three approaches to implementing');
  console.log('high priority API call systems with queue management.\n');
  
  demonstrateBasicUsage();
  
  setTimeout(() => {
    demonstrateAdvancedUsage();
  }, 2000);
  
  setTimeout(async () => {
    await demonstrateProductionUsage();
  }, 4000);
}