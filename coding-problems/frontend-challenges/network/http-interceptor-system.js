/**
 * HTTP Interceptor System - Request/Response Transformation and Retry Logic
 * 
 * A comprehensive HTTP client with interceptor architecture including:
 * - Request/response interceptors with transformation pipelines
 * - Intelligent retry mechanisms with exponential backoff
 * - Error handling and recovery strategies
 * - Authentication token management
 * - Multiple implementation approaches from basic to production-ready
 * 
 * Problem: Build a robust HTTP client that can handle complex network scenarios
 * 
 * Key Interview Points:
 * - Understanding HTTP protocol and status codes
 * - Interceptor pattern implementation (similar to middleware)
 * - Error handling strategies and retry logic
 * - Authentication flows and token management
 * - Performance optimization and request deduplication
 * 
 * Companies: All companies with web applications need robust HTTP handling
 * Frequency: High - Essential for modern web applications
 */

// ========================================================================================
// APPROACH 1: BASIC HTTP CLIENT - Simple fetch wrapper with interceptors
// ========================================================================================

/**
 * Basic HTTP client with request/response interceptor support
 * Mental model: Pipeline of functions that process requests and responses
 * 
 * Time Complexity: O(n) where n is number of interceptors per request
 * Space Complexity: O(1) for each request, O(n) for interceptor storage
 * 
 * Interview considerations:
 * - Why interceptors over direct fetch calls? (Cross-cutting concerns, DRY)
 * - How to handle async interceptors? (Promise chaining)
 * - What's the execution order of interceptors? (Request: FIFO, Response: LIFO)
 * - How to handle interceptor errors? (Fail fast vs continue)
 */
class BasicHttpClient {
  constructor(config = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      headers: config.headers || {},
      ...config
    };
    
    // Interceptor arrays - order matters!
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }
  
  /**
   * Add request interceptor
   * Interceptors run in FIFO order (first added, first executed)
   */
  addRequestInterceptor(onFulfilled, onRejected) {
    const interceptor = {
      onFulfilled: onFulfilled || (config => config),
      onRejected: onRejected || (error => Promise.reject(error))
    };
    
    this.requestInterceptors.push(interceptor);
    
    // Return index for potential removal
    return this.requestInterceptors.length - 1;
  }
  
  /**
   * Add response interceptor
   * Interceptors run in LIFO order (last added, first executed)
   */
  addResponseInterceptor(onFulfilled, onRejected) {
    const interceptor = {
      onFulfilled: onFulfilled || (response => response),
      onRejected: onRejected || (error => Promise.reject(error))
    };
    
    this.responseInterceptors.unshift(interceptor); // Add to beginning
    
    // Return index for potential removal
    return 0;
  }
  
  /**
   * Remove request interceptor by index
   */
  removeRequestInterceptor(index) {
    if (index >= 0 && index < this.requestInterceptors.length) {
      this.requestInterceptors.splice(index, 1);
    }
  }
  
  /**
   * Remove response interceptor by index
   */
  removeResponseInterceptor(index) {
    if (index >= 0 && index < this.responseInterceptors.length) {
      this.responseInterceptors.splice(index, 1);
    }
  }
  
  /**
   * Process request through all request interceptors
   * Applies transformations in order
   */
  async processRequestInterceptors(config) {
    let processedConfig = config;
    
    for (const interceptor of this.requestInterceptors) {
      try {
        processedConfig = await interceptor.onFulfilled(processedConfig);
      } catch (error) {
        return interceptor.onRejected(error);
      }
    }
    
    return processedConfig;
  }
  
  /**
   * Process response through all response interceptors
   * Applies transformations in reverse order (LIFO)
   */
  async processResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      try {
        processedResponse = await interceptor.onFulfilled(processedResponse);
      } catch (error) {
        return interceptor.onRejected(error);
      }
    }
    
    return processedResponse;
  }
  
  /**
   * Process error through error interceptors
   * Allows for error recovery and transformation
   */
  async processErrorInterceptors(error) {
    let processedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      try {
        // Error interceptors can recover from errors
        const result = await interceptor.onRejected(processedError);
        if (result !== processedError) {
          return result; // Error was recovered/transformed
        }
      } catch (newError) {
        processedError = newError;
      }
    }
    
    throw processedError; // Re-throw if not recovered
  }
  
  /**
   * Main request method that orchestrates the entire flow
   * Processes request → makes HTTP call → processes response
   */
  async request(config) {
    try {
      // Step 1: Merge with default configuration
      const requestConfig = this.mergeConfig(config);
      
      // Step 2: Process through request interceptors
      const processedConfig = await this.processRequestInterceptors(requestConfig);
      
      // Step 3: Make the actual HTTP request
      const response = await this.makeRequest(processedConfig);
      
      // Step 4: Process through response interceptors
      const processedResponse = await this.processResponseInterceptors(response);
      
      return processedResponse;
      
    } catch (error) {
      // Handle errors through error interceptors
      return this.processErrorInterceptors(error);
    }
  }
  
  /**
   * Merge request config with defaults
   * Combines default settings with request-specific settings
   */
  mergeConfig(config) {
    const merged = {
      method: 'GET',
      headers: { ...this.config.headers },
      timeout: this.config.timeout,
      ...config
    };
    
    // Merge headers properly
    if (config.headers) {
      merged.headers = { ...merged.headers, ...config.headers };
    }
    
    // Build full URL
    if (merged.url && !merged.url.startsWith('http')) {
      merged.url = this.config.baseURL + merged.url;
    }
    
    return merged;
  }
  
  /**
   * Make the actual HTTP request using fetch API
   * Handles timeout and basic error scenarios
   */
  async makeRequest(config) {
    const { url, method, headers, body, timeout } = config;
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchOptions = {
        method: method.toUpperCase(),
        headers,
        signal: controller.signal
      };
      
      // Add body for non-GET requests
      if (body && method.toUpperCase() !== 'GET') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // Create enhanced response object
      return this.createResponseObject(response, config);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }
  
  /**
   * Create enhanced response object with additional metadata
   * Provides consistent response format across different scenarios
   */
  async createResponseObject(fetchResponse, requestConfig) {
    const response = {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: this.parseHeaders(fetchResponse.headers),
      config: requestConfig,
      ok: fetchResponse.ok
    };
    
    // Parse response body based on content type
    const contentType = response.headers['content-type'] || '';
    
    try {
      if (contentType.includes('application/json')) {
        response.data = await fetchResponse.json();
      } else if (contentType.includes('text/')) {
        response.data = await fetchResponse.text();
      } else {
        response.data = await fetchResponse.blob();
      }
    } catch (parseError) {
      response.data = null;
      response.parseError = parseError;
    }
    
    return response;
  }
  
  /**
   * Parse fetch headers into a plain object
   * Converts Headers object to regular object for easier manipulation
   */
  parseHeaders(headers) {
    const parsed = {};
    
    for (const [key, value] of headers.entries()) {
      parsed[key.toLowerCase()] = value;
    }
    
    return parsed;
  }
  
  /**
   * Convenience methods for different HTTP verbs
   * Provides intuitive API for common operations
   */
  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  }
  
  post(url, data, config = {}) {
    return this.request({ 
      ...config, 
      method: 'POST', 
      url, 
      body: data,
      headers: { 
        'Content-Type': 'application/json',
        ...config.headers 
      }
    });
  }
  
  put(url, data, config = {}) {
    return this.request({ 
      ...config, 
      method: 'PUT', 
      url, 
      body: data,
      headers: { 
        'Content-Type': 'application/json',
        ...config.headers 
      }
    });
  }
  
  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
  
  patch(url, data, config = {}) {
    return this.request({ 
      ...config, 
      method: 'PATCH', 
      url, 
      body: data,
      headers: { 
        'Content-Type': 'application/json',
        ...config.headers 
      }
    });
  }
}

// ========================================================================================
// APPROACH 2: RETRY MECHANISM - Smart retry with exponential backoff
// ========================================================================================

/**
 * Enhanced HTTP client with intelligent retry mechanism
 * Mental model: Resilient network requests with automatic recovery
 * 
 * Features:
 * - Exponential backoff with jitter
 * - Configurable retry conditions
 * - Circuit breaker pattern
 * - Request deduplication
 * - Network status awareness
 */
class RetryableHttpClient extends BasicHttpClient {
  constructor(config = {}) {
    super(config);
    
    this.retryConfig = {
      maxRetries: config.maxRetries || 3,
      initialDelay: config.initialDelay || 1000,
      maxDelay: config.maxDelay || 10000,
      backoffFactor: config.backoffFactor || 2,
      jitter: config.jitter !== false, // Add randomness to prevent thundering herd
      retryCondition: config.retryCondition || this.defaultRetryCondition.bind(this),
      ...config.retryConfig
    };
    
    // Circuit breaker state
    this.circuitBreaker = {
      failureCount: 0,
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,
      state: 'closed', // closed, open, half-open
      lastFailureTime: null
    };
    
    // Request deduplication
    this.pendingRequests = new Map();
    this.enableDeduplication = config.enableDeduplication !== false;
  }
  
  /**
   * Enhanced request method with retry logic
   * Orchestrates retry attempts and circuit breaker logic
   */
  async request(config) {
    // Check circuit breaker state
    if (this.circuitBreaker.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.circuitBreaker.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open - requests blocked');
      }
    }
    
    // Handle request deduplication
    if (this.enableDeduplication) {
      const requestKey = this.generateRequestKey(config);
      const existingRequest = this.pendingRequests.get(requestKey);
      
      if (existingRequest) {
        console.log('Deduplicating request:', requestKey);
        return existingRequest;
      }
      
      // Create new request promise and store it
      const requestPromise = this.executeRequestWithRetry(config);
      this.pendingRequests.set(requestKey, requestPromise);
      
      // Clean up after completion
      requestPromise.finally(() => {
        this.pendingRequests.delete(requestKey);
      });
      
      return requestPromise;
    }
    
    return this.executeRequestWithRetry(config);
  }
  
  /**
   * Execute request with retry logic
   * Implements exponential backoff and retry conditions
   */
  async executeRequestWithRetry(config) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await super.request(config);
        
        // Success - reset circuit breaker
        this.onRequestSuccess();
        
        return response;
        
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (attempt < this.retryConfig.maxRetries && 
            await this.retryConfig.retryCondition(error, attempt + 1)) {
          
          const delay = this.calculateRetryDelay(attempt);
          console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})`);
          
          await this.sleep(delay);
          continue;
        }
        
        // Max retries reached or non-retryable error
        this.onRequestFailure(error);
        throw error;
      }
    }
    
    throw lastError;
  }
  
  /**
   * Calculate retry delay with exponential backoff and jitter
   * Prevents thundering herd problem with randomized delays
   */
  calculateRetryDelay(attempt) {
    const baseDelay = this.retryConfig.initialDelay * 
                     Math.pow(this.retryConfig.backoffFactor, attempt);
    
    const delay = Math.min(baseDelay, this.retryConfig.maxDelay);
    
    // Add jitter to prevent synchronized retries
    if (this.retryConfig.jitter) {
      const jitterRange = delay * 0.1; // 10% jitter
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      return Math.max(0, delay + jitter);
    }
    
    return delay;
  }
  
  /**
   * Default retry condition - determines if error is retryable
   * Retries on network errors and specific HTTP status codes
   */
  defaultRetryCondition(error, attemptNumber) {
    // Don't retry client errors (4xx) except for specific cases
    if (error.response) {
      const status = error.response.status;
      
      // Retry on server errors (5xx) and specific 4xx codes
      const retryableStatuses = [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504  // Gateway Timeout
      ];
      
      return retryableStatuses.includes(status);
    }
    
    // Retry on network errors (no response)
    return true;
  }
  
  /**
   * Handle successful request
   * Resets circuit breaker on success
   */
  onRequestSuccess() {
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.state = 'closed';
    }
    
    this.circuitBreaker.failureCount = 0;
  }
  
  /**
   * Handle failed request
   * Updates circuit breaker state based on failures
   */
  onRequestFailure(error) {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
      this.circuitBreaker.state = 'open';
      console.warn('Circuit breaker opened due to repeated failures');
    }
  }
  
  /**
   * Check if circuit breaker should attempt reset
   * Allows gradual recovery after timeout period
   */
  shouldAttemptReset() {
    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
    return timeSinceLastFailure >= this.circuitBreaker.resetTimeout;
  }
  
  /**
   * Generate request key for deduplication
   * Creates unique identifier for similar requests
   */
  generateRequestKey(config) {
    const { method, url, body } = config;
    
    // Simple key generation - could be more sophisticated
    const bodyString = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyString}`;
  }
  
  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get circuit breaker status for monitoring
   */
  getCircuitBreakerStatus() {
    return { ...this.circuitBreaker };
  }
  
  /**
   * Reset circuit breaker manually
   * Useful for administrative recovery
   */
  resetCircuitBreaker() {
    this.circuitBreaker.state = 'closed';
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = null;
  }
}

// ========================================================================================
// APPROACH 3: PRODUCTION HTTP CLIENT - Enterprise features and authentication
// ========================================================================================

/**
 * Production-ready HTTP client with enterprise features
 * Mental model: Battle-tested HTTP client for production applications
 * 
 * Features:
 * - Automatic authentication token management
 * - Request/response logging and monitoring
 * - Performance metrics collection
 * - Advanced error handling and recovery
 * - Caching and etag support
 * - Request cancellation
 * - Upload progress tracking
 */
class ProductionHttpClient extends RetryableHttpClient {
  constructor(config = {}) {
    super(config);
    
    // Authentication configuration
    this.auth = {
      tokenRefreshUrl: config.tokenRefreshUrl,
      getToken: config.getToken || (() => localStorage.getItem('auth_token')),
      setToken: config.setToken || ((token) => localStorage.setItem('auth_token', token)),
      refreshToken: config.refreshToken || (() => localStorage.getItem('refresh_token')),
      onAuthError: config.onAuthError || this.defaultAuthErrorHandler.bind(this),
      autoRefresh: config.autoRefresh !== false
    };
    
    // Request tracking and cancellation
    this.activeRequests = new Map();
    this.requestId = 0;
    
    // Performance monitoring
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowRequests: [], // Requests taking longer than threshold
      errorsByType: new Map()
    };
    
    // Response cache
    this.cache = new Map();
    this.cacheConfig = {
      enabled: config.enableCache !== false,
      maxAge: config.cacheMaxAge || 300000, // 5 minutes
      maxSize: config.cacheMaxSize || 100
    };
    
    // Set up default interceptors
    this.setupDefaultInterceptors();
  }
  
  /**
   * Set up production-ready default interceptors
   * Configures auth, logging, metrics, and caching interceptors
   */
  setupDefaultInterceptors() {
    // Request interceptor for authentication
    this.addRequestInterceptor(async (config) => {
      // Add authentication token if available
      const token = this.auth.getToken();
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      
      // Add request ID for tracking
      config.requestId = ++this.requestId;
      config.requestStartTime = Date.now();
      
      // Log request (in development/debug mode)
      if (this.config.debug) {
        console.log(`[HTTP ${config.requestId}] ${config.method.toUpperCase()} ${config.url}`, config);
      }
      
      return config;
    });
    
    // Response interceptor for metrics and caching
    this.addResponseInterceptor(
      async (response) => {
        // Update performance metrics
        this.updateMetrics(response, true);
        
        // Cache successful GET responses
        if (this.cacheConfig.enabled && 
            response.config.method.toUpperCase() === 'GET' && 
            response.ok) {
          this.cacheResponse(response);
        }
        
        // Log response (in development/debug mode)
        if (this.config.debug) {
          const duration = Date.now() - response.config.requestStartTime;
          console.log(`[HTTP ${response.config.requestId}] ${response.status} (${duration}ms)`, response);
        }
        
        return response;
      },
      async (error) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          return this.handleAuthError(error);
        }
        
        // Update error metrics
        this.updateMetrics(error, false);
        
        // Log error
        if (this.config.debug) {
          console.error(`[HTTP ${error.config?.requestId}] Error:`, error);
        }
        
        throw error;
      }
    );
  }
  
  /**
   * Enhanced request method with caching and tracking
   * Adds production features on top of retry functionality
   */
  async request(config) {
    // Check cache for GET requests
    if (this.cacheConfig.enabled && 
        config.method?.toUpperCase() === 'GET') {
      const cachedResponse = this.getCachedResponse(config);
      if (cachedResponse) {
        console.log('Returning cached response for:', config.url);
        return cachedResponse;
      }
    }
    
    // Add to active requests for tracking/cancellation
    const requestKey = `${config.method || 'GET'}:${config.url}`;
    const abortController = new AbortController();
    
    this.activeRequests.set(requestKey, {
      controller: abortController,
      config,
      startTime: Date.now()
    });
    
    // Add abort signal to config
    config.signal = abortController.signal;
    
    try {
      const response = await super.request(config);
      return response;
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }
  
  /**
   * Handle authentication errors with automatic token refresh
   * Implements robust auth recovery flow
   */
  async handleAuthError(error) {
    if (!this.auth.autoRefresh || !this.auth.tokenRefreshUrl) {
      this.auth.onAuthError(error);
      throw error;
    }
    
    try {
      console.log('Attempting to refresh authentication token...');
      
      // Refresh the token
      const refreshToken = this.auth.refreshToken();
      const refreshResponse = await fetch(this.auth.tokenRefreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!refreshResponse.ok) {
        throw new Error('Token refresh failed');
      }
      
      const tokenData = await refreshResponse.json();
      this.auth.setToken(tokenData.access_token);
      
      // Retry the original request with new token
      const originalConfig = error.config;
      originalConfig.headers['Authorization'] = `Bearer ${tokenData.access_token}`;
      
      console.log('Token refreshed, retrying original request...');
      return this.request(originalConfig);
      
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      this.auth.onAuthError(error);
      throw error;
    }
  }
  
  /**
   * Default authentication error handler
   * Can be overridden for custom auth flows
   */
  defaultAuthErrorHandler(error) {
    console.warn('Authentication error - user needs to re-login');
    
    // Clear stored tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Redirect to login page (if in browser environment)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  
  /**
   * Cache successful responses
   * Implements simple LRU cache with TTL
   */
  cacheResponse(response) {
    const cacheKey = this.getCacheKey(response.config);
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, {
      response: this.cloneResponse(response),
      timestamp: Date.now()
    });
  }
  
  /**
   * Get cached response if available and fresh
   * Checks cache validity and returns response
   */
  getCachedResponse(config) {
    const cacheKey = this.getCacheKey(config);
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    // Check if cache entry is still valid
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheConfig.maxAge) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    // Move to end for LRU
    this.cache.delete(cacheKey);
    this.cache.set(cacheKey, cached);
    
    return this.cloneResponse(cached.response);
  }
  
  /**
   * Generate cache key for request
   */
  getCacheKey(config) {
    return `${config.method?.toUpperCase() || 'GET'}:${config.url}`;
  }
  
  /**
   * Clone response for caching
   * Creates deep copy to prevent mutation
   */
  cloneResponse(response) {
    return {
      ...response,
      data: JSON.parse(JSON.stringify(response.data)),
      headers: { ...response.headers }
    };
  }
  
  /**
   * Update performance metrics
   * Tracks request performance and error patterns
   */
  updateMetrics(responseOrError, isSuccess) {
    this.metrics.totalRequests++;
    
    if (isSuccess) {
      this.metrics.successfulRequests++;
      
      // Calculate response time
      const response = responseOrError;
      if (response.config && response.config.requestStartTime) {
        const duration = Date.now() - response.config.requestStartTime;
        
        // Update average response time
        const totalSuccessful = this.metrics.successfulRequests;
        this.metrics.averageResponseTime = (
          (this.metrics.averageResponseTime * (totalSuccessful - 1) + duration) / 
          totalSuccessful
        );
        
        // Track slow requests (over 2 seconds)
        if (duration > 2000) {
          this.metrics.slowRequests.push({
            url: response.config.url,
            method: response.config.method,
            duration,
            timestamp: Date.now()
          });
          
          // Keep only last 10 slow requests
          if (this.metrics.slowRequests.length > 10) {
            this.metrics.slowRequests.shift();
          }
        }
      }
    } else {
      this.metrics.failedRequests++;
      
      // Track error types
      const error = responseOrError;
      const errorType = error.response ? 
        `HTTP_${error.response.status}` : 
        error.code || 'NETWORK_ERROR';
      
      const currentCount = this.metrics.errorsByType.get(errorType) || 0;
      this.metrics.errorsByType.set(errorType, currentCount + 1);
    }
  }
  
  /**
   * Cancel all active requests
   * Useful for cleanup when navigating away from page
   */
  cancelAllRequests(reason = 'Request cancelled') {
    for (const [key, request] of this.activeRequests) {
      request.controller.abort();
      console.log(`Cancelled request: ${key}`);
    }
    
    this.activeRequests.clear();
  }
  
  /**
   * Cancel specific request by URL pattern
   * Selective request cancellation
   */
  cancelRequest(urlPattern) {
    for (const [key, request] of this.activeRequests) {
      if (request.config.url.includes(urlPattern)) {
        request.controller.abort();
        this.activeRequests.delete(key);
        console.log(`Cancelled request: ${key}`);
      }
    }
  }
  
  /**
   * Get performance metrics for monitoring
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 ? 
        this.metrics.successfulRequests / this.metrics.totalRequests : 0,
      errorsByType: Object.fromEntries(this.metrics.errorsByType),
      activeRequestCount: this.activeRequests.size,
      cacheSize: this.cache.size
    };
  }
  
  /**
   * Clear cache manually
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * Upload file with progress tracking
   * Specialized method for file uploads
   */
  async uploadFile(url, file, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && options.onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          options.onProgress(percentComplete, event.loaded, event.total);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            status: xhr.status,
            statusText: xhr.statusText,
            data: xhr.response,
            headers: this.parseXHRHeaders(xhr)
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });
      
      // Add auth header if available
      const token = this.auth.getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // Add custom headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional fields
      if (options.fields) {
        Object.entries(options.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      xhr.open('POST', url);
      xhr.send(formData);
    });
  }
  
  /**
   * Parse XHR response headers
   */
  parseXHRHeaders(xhr) {
    const headers = {};
    const headersString = xhr.getAllResponseHeaders();
    
    headersString.split('\r\n').forEach(line => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0].toLowerCase()] = parts[1];
      }
    });
    
    return headers;
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic HTTP client with interceptors
console.log('=== BASIC HTTP CLIENT EXAMPLE ===');

const basicClient = new BasicHttpClient({
  baseURL: 'https://api.example.com',
  headers: {
    'User-Agent': 'MyApp/1.0.0'
  }
});

// Add logging interceptor
basicClient.addRequestInterceptor((config) => {
  console.log(`Making request: ${config.method} ${config.url}`);
  return config;
});

basicClient.addResponseInterceptor((response) => {
  console.log(`Response received: ${response.status}`);
  return response;
});

// Example request (would work in browser environment)
// basicClient.get('/users/1').then(response => {
//   console.log('User data:', response.data);
// });

// Example 2: Retryable client with circuit breaker
console.log('\n=== RETRYABLE HTTP CLIENT EXAMPLE ===');

const retryClient = new RetryableHttpClient({
  baseURL: 'https://api.example.com',
  maxRetries: 3,
  initialDelay: 500,
  backoffFactor: 2,
  failureThreshold: 3,
  enableDeduplication: true
});

// Custom retry condition
retryClient.retryConfig.retryCondition = (error, attemptNumber) => {
  console.log(`Retry condition check: attempt ${attemptNumber}`);
  
  if (error.response) {
    // Retry on server errors and rate limits
    return error.response.status >= 500 || error.response.status === 429;
  }
  
  // Retry on network errors
  return true;
};

console.log('Circuit breaker status:', retryClient.getCircuitBreakerStatus());

// Example 3: Production client with full features
console.log('\n=== PRODUCTION HTTP CLIENT EXAMPLE ===');

const prodClient = new ProductionHttpClient({
  baseURL: 'https://api.example.com',
  debug: true,
  enableCache: true,
  cacheMaxAge: 60000, // 1 minute
  tokenRefreshUrl: 'https://api.example.com/auth/refresh',
  getToken: () => 'mock_token',
  setToken: (token) => console.log('New token set:', token),
  refreshToken: () => 'mock_refresh_token',
  onAuthError: (error) => console.log('Auth error:', error.message)
});

// Simulate some requests for metrics
setTimeout(() => {
  console.log('Production client metrics:', prodClient.getMetrics());
}, 1000);

// Export for use in other modules
module.exports = {
  BasicHttpClient,
  RetryableHttpClient,
  ProductionHttpClient
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. HTTP Protocol Understanding:
   - Status codes and their meanings (1xx, 2xx, 3xx, 4xx, 5xx)
   - Headers and their purposes (Content-Type, Authorization, Cache-Control)
   - Methods and idempotency (GET, POST, PUT, DELETE, PATCH)
   - CORS and preflight requests

2. Interceptor Pattern:
   - Middleware vs interceptor concepts
   - Order of execution and chain of responsibility
   - Error handling in interceptor chains
   - Use cases: logging, authentication, transformation

3. Error Handling Strategies:
   - Retry logic and exponential backoff
   - Circuit breaker pattern implementation
   - Graceful degradation and fallback strategies
   - User experience during network failures

4. Performance Optimization:
   - Request deduplication techniques
   - Response caching strategies (ETags, Cache-Control)
   - Connection pooling and keep-alive
   - Request prioritization and queuing

5. Security Considerations:
   - Authentication token management
   - CSRF protection in requests
   - Request/response sanitization
   - Timeout handling for security

6. Production Concerns:
   - Monitoring and metrics collection
   - Request cancellation and cleanup
   - Memory management in long-running apps
   - Integration with error reporting services

Common Follow-up Questions:
- How would you implement request/response logging?
- What's your approach to handling file uploads with progress tracking?
- How do you test HTTP interceptors and error scenarios?
- What are the trade-offs between axios and fetch API?
- How would you implement request batching?
- How do you handle authentication in microservices architecture?
- What's your strategy for handling offline scenarios?
- How would you implement request prioritization?
- How do you prevent request waterfalls in applications?
- What metrics would you track for HTTP client performance?
*/