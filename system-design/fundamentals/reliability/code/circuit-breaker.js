/**
 * File: circuit-breaker.js
 * Description: Circuit breaker pattern implementation for fault tolerance
 * 
 * Learning objectives:
 * - Understand circuit breaker states and state transitions
 * - Learn failure detection and threshold management
 * - See integration with monitoring and alerting systems
 * - Understand graceful degradation and fallback strategies
 * 
 * Time Complexity: O(1) for all operations
 * Space Complexity: O(N) where N is the number of recent requests tracked
 */

const EventEmitter = require('events');

// Circuit breaker configuration constants
const DEFAULT_FAILURE_THRESHOLD = 5; // Number of failures before opening
const DEFAULT_RECOVERY_TIMEOUT = 60000; // 1 minute before attempting recovery
const DEFAULT_REQUEST_TIMEOUT = 30000; // 30 seconds for individual requests
const DEFAULT_MONITOR_WINDOW = 60000; // 1 minute window for failure rate calculation
const DEFAULT_MINIMUM_REQUESTS = 10; // Minimum requests before considering failure rate

// Circuit breaker states
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',     // Normal operation, requests pass through
  OPEN: 'OPEN',         // Failing fast, requests immediately rejected
  HALF_OPEN: 'HALF_OPEN' // Testing recovery, limited requests allowed
};

/**
 * Circuit Breaker Implementation with comprehensive state management
 * Provides fault tolerance through fail-fast behavior and automatic recovery
 */
class CircuitBreaker extends EventEmitter {
  constructor(serviceCall, options = {}) {
    super();
    
    if (typeof serviceCall !== 'function') {
      throw new Error('Service call must be a function');
    }
    
    // Core service function that the circuit breaker wraps
    this.serviceCall = serviceCall;
    this.serviceName = options.name || 'unknown-service';
    
    // Configuration parameters
    this.failureThreshold = options.failureThreshold || DEFAULT_FAILURE_THRESHOLD;
    this.recoveryTimeout = options.recoveryTimeout || DEFAULT_RECOVERY_TIMEOUT;
    this.requestTimeout = options.requestTimeout || DEFAULT_REQUEST_TIMEOUT;
    this.monitorWindow = options.monitorWindow || DEFAULT_MONITOR_WINDOW;
    this.minimumRequests = options.minimumRequests || DEFAULT_MINIMUM_REQUESTS;
    
    // State management
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenTestCount = 0;
    this.maxHalfOpenRequests = options.maxHalfOpenRequests || 3;
    
    // Request tracking for sliding window analysis
    this.requestHistory = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeoutRequests: 0,
      circuitOpenRejects: 0,
      averageResponseTime: 0,
      lastResetTime: Date.now()
    };
    
    // Fallback function for when circuit is open
    this.fallbackFunction = options.fallback || this.defaultFallback.bind(this);
    
    console.log(`Circuit breaker initialized for ${this.serviceName}`);
    console.log(`Configuration: threshold=${this.failureThreshold}, timeout=${this.recoveryTimeout}ms`);
  }

  /**
   * Main execution method - wraps service call with circuit breaker logic
   * This is the primary interface that clients use to make protected calls
   */
  async execute(...args) {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    this.metrics.totalRequests++;
    
    try {
      // Check circuit state and decide whether to allow the request
      if (this.state === CIRCUIT_STATES.OPEN) {
        return await this.handleOpenCircuit(requestId);
      }
      
      if (this.state === CIRCUIT_STATES.HALF_OPEN) {
        return await this.handleHalfOpenCircuit(requestId, startTime, ...args);
      }
      
      // Circuit is CLOSED - proceed with normal execution
      return await this.handleClosedCircuit(requestId, startTime, ...args);
      
    } catch (error) {
      // This catch block handles unexpected errors in circuit breaker logic itself
      console.error(`Circuit breaker internal error for ${this.serviceName}:`, error);
      this.emit('circuit_breaker_error', { error, requestId, serviceName: this.serviceName });
      throw error;
    }
  }

  /**
   * Handle requests when circuit is in CLOSED state (normal operation)
   */
  async handleClosedCircuit(requestId, startTime, ...args) {
    try {
      console.log(`[${this.serviceName}] Request ${requestId}: Circuit CLOSED - executing normally`);
      
      // Execute the actual service call with timeout protection
      const result = await this.executeWithTimeout(() => this.serviceCall(...args));
      
      // Request succeeded - record success and update metrics
      this.onRequestSuccess(requestId, startTime);
      
      return result;
      
    } catch (error) {
      // Request failed - record failure and potentially open circuit
      this.onRequestFailure(requestId, startTime, error);
      throw error;
    }
  }

  /**
   * Handle requests when circuit is in OPEN state (fail-fast mode)
   */
  async handleOpenCircuit(requestId) {
    console.log(`[${this.serviceName}] Request ${requestId}: Circuit OPEN - failing fast`);
    
    // Check if enough time has passed to attempt recovery
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    
    if (timeSinceLastFailure >= this.recoveryTimeout) {
      console.log(`[${this.serviceName}] Recovery timeout reached - transitioning to HALF_OPEN`);
      this.transitionToHalfOpen();
      // Retry the request in HALF_OPEN state
      return await this.execute(...arguments);
    }
    
    // Still in recovery timeout - reject immediately with fallback
    this.metrics.circuitOpenRejects++;
    const fallbackResult = await this.fallbackFunction(new Error('Circuit breaker is OPEN'));
    
    this.emit('request_rejected', {
      requestId,
      serviceName: this.serviceName,
      reason: 'circuit_open',
      timeUntilRetry: this.recoveryTimeout - timeSinceLastFailure
    });
    
    return fallbackResult;
  }

  /**
   * Handle requests when circuit is in HALF_OPEN state (testing recovery)
   */
  async handleHalfOpenCircuit(requestId, startTime, ...args) {
    // Limit concurrent requests in HALF_OPEN state
    if (this.halfOpenTestCount >= this.maxHalfOpenRequests) {
      console.log(`[${this.serviceName}] Request ${requestId}: HALF_OPEN limit reached - failing fast`);
      this.metrics.circuitOpenRejects++;
      return await this.fallbackFunction(new Error('Circuit breaker in HALF_OPEN - test limit reached'));
    }
    
    this.halfOpenTestCount++;
    
    try {
      console.log(`[${this.serviceName}] Request ${requestId}: Circuit HALF_OPEN - testing recovery (${this.halfOpenTestCount}/${this.maxHalfOpenRequests})`);
      
      // Execute service call with timeout protection
      const result = await this.executeWithTimeout(() => this.serviceCall(...args));
      
      // Success in HALF_OPEN state - move towards CLOSED
      this.onHalfOpenSuccess(requestId, startTime);
      
      return result;
      
    } catch (error) {
      // Failure in HALF_OPEN state - return to OPEN
      this.onHalfOpenFailure(requestId, startTime, error);
      throw error;
    } finally {
      this.halfOpenTestCount--;
    }
  }

  /**
   * Execute service call with timeout protection
   * Prevents hanging requests from affecting circuit breaker state
   */
  async executeWithTimeout(serviceCall) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${this.requestTimeout}ms`));
      }, this.requestTimeout);
      
      serviceCall()
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
   * Handle successful request completion
   */
  onRequestSuccess(requestId, startTime) {
    const responseTime = Date.now() - startTime;
    
    console.log(`[${this.serviceName}] Request ${requestId}: SUCCESS (${responseTime}ms)`);
    
    // Update metrics
    this.metrics.successfulRequests++;
    this.updateAverageResponseTime(responseTime);
    
    // Record in request history for sliding window analysis
    this.recordRequest(true, responseTime);
    
    // Reset failure count on success (in CLOSED state)
    if (this.state === CIRCUIT_STATES.CLOSED) {
      this.failureCount = 0;
    }
    
    this.emit('request_success', {
      requestId,
      serviceName: this.serviceName,
      responseTime,
      state: this.state
    });
  }

  /**
   * Handle failed request - potentially triggering circuit to open
   */
  onRequestFailure(requestId, startTime, error) {
    const responseTime = Date.now() - startTime;
    
    console.log(`[${this.serviceName}] Request ${requestId}: FAILURE (${responseTime}ms) - ${error.message}`);
    
    // Update metrics based on error type
    if (error.message && error.message.includes('timeout')) {
      this.metrics.timeoutRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // Record in request history
    this.recordRequest(false, responseTime, error);
    
    // Increment failure count and check if we should open the circuit
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    // Evaluate if circuit should open based on failure count or rate
    if (this.shouldOpenCircuit()) {
      this.transitionToOpen();
    }
    
    this.emit('request_failure', {
      requestId,
      serviceName: this.serviceName,
      error: error.message,
      responseTime,
      failureCount: this.failureCount,
      state: this.state
    });
  }

  /**
   * Handle successful request in HALF_OPEN state
   */
  onHalfOpenSuccess(requestId, startTime) {
    const responseTime = Date.now() - startTime;
    
    console.log(`[${this.serviceName}] Request ${requestId}: HALF_OPEN SUCCESS - service recovering`);
    
    this.successCount++;
    this.metrics.successfulRequests++;
    this.updateAverageResponseTime(responseTime);
    this.recordRequest(true, responseTime);
    
    // If we've had enough successful requests, close the circuit
    if (this.successCount >= Math.ceil(this.maxHalfOpenRequests / 2)) {
      this.transitionToClosed();
    }
    
    this.emit('half_open_success', {
      requestId,
      serviceName: this.serviceName,
      responseTime,
      successCount: this.successCount
    });
  }

  /**
   * Handle failed request in HALF_OPEN state
   */
  onHalfOpenFailure(requestId, startTime, error) {
    const responseTime = Date.now() - startTime;
    
    console.log(`[${this.serviceName}] Request ${requestId}: HALF_OPEN FAILURE - returning to OPEN`);
    
    this.metrics.failedRequests++;
    this.recordRequest(false, responseTime, error);
    
    // Any failure in HALF_OPEN immediately returns to OPEN
    this.transitionToOpen();
    
    this.emit('half_open_failure', {
      requestId,
      serviceName: this.serviceName,
      error: error.message,
      responseTime
    });
  }

  // ========================
  // State Transition Methods
  // ========================

  /**
   * Transition circuit breaker to OPEN state
   */
  transitionToOpen() {
    const previousState = this.state;
    this.state = CIRCUIT_STATES.OPEN;
    this.lastFailureTime = Date.now();
    this.halfOpenTestCount = 0;
    this.successCount = 0;
    
    console.log(`[${this.serviceName}] Circuit breaker OPENED (${previousState} -> OPEN)`);
    console.log(`[${this.serviceName}] Failure count: ${this.failureCount}, Will retry in ${this.recoveryTimeout}ms`);
    
    this.emit('circuit_opened', {
      serviceName: this.serviceName,
      previousState,
      failureCount: this.failureCount,
      recoveryTimeout: this.recoveryTimeout
    });
  }

  /**
   * Transition circuit breaker to HALF_OPEN state
   */
  transitionToHalfOpen() {
    const previousState = this.state;
    this.state = CIRCUIT_STATES.HALF_OPEN;
    this.halfOpenTestCount = 0;
    this.successCount = 0;
    
    console.log(`[${this.serviceName}] Circuit breaker HALF_OPEN (${previousState} -> HALF_OPEN)`);
    console.log(`[${this.serviceName}] Testing recovery with up to ${this.maxHalfOpenRequests} requests`);
    
    this.emit('circuit_half_open', {
      serviceName: this.serviceName,
      previousState,
      maxTestRequests: this.maxHalfOpenRequests
    });
  }

  /**
   * Transition circuit breaker to CLOSED state
   */
  transitionToClosed() {
    const previousState = this.state;
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenTestCount = 0;
    this.lastFailureTime = null;
    
    console.log(`[${this.serviceName}] Circuit breaker CLOSED (${previousState} -> CLOSED)`);
    console.log(`[${this.serviceName}] Service recovered - normal operation resumed`);
    
    this.emit('circuit_closed', {
      serviceName: this.serviceName,
      previousState
    });
  }

  // ========================
  // Decision Logic Methods
  // ========================

  /**
   * Determine if circuit should open based on current failure conditions
   */
  shouldOpenCircuit() {
    // Simple threshold-based approach
    if (this.failureCount >= this.failureThreshold) {
      return true;
    }
    
    // Rate-based approach using sliding window
    const recentRequests = this.getRecentRequests();
    
    if (recentRequests.length >= this.minimumRequests) {
      const failureRate = recentRequests.filter(req => !req.success).length / recentRequests.length;
      const rateThreshold = 0.5; // 50% failure rate
      
      if (failureRate >= rateThreshold) {
        console.log(`[${this.serviceName}] High failure rate detected: ${(failureRate * 100).toFixed(1)}%`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get recent requests within the monitoring window
   */
  getRecentRequests() {
    const cutoffTime = Date.now() - this.monitorWindow;
    return this.requestHistory.filter(req => req.timestamp >= cutoffTime);
  }

  /**
   * Record request in sliding window history
   */
  recordRequest(success, responseTime, error = null) {
    const request = {
      timestamp: Date.now(),
      success: success,
      responseTime: responseTime,
      error: error ? error.message : null
    };
    
    this.requestHistory.push(request);
    
    // Clean up old requests beyond the monitoring window
    const cutoffTime = Date.now() - this.monitorWindow;
    this.requestHistory = this.requestHistory.filter(req => req.timestamp >= cutoffTime);
    
    // Limit history size to prevent memory leaks
    const maxHistorySize = 1000;
    if (this.requestHistory.length > maxHistorySize) {
      this.requestHistory = this.requestHistory.slice(-maxHistorySize);
    }
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update running average of response time
   */
  updateAverageResponseTime(responseTime) {
    const totalSuccessful = this.metrics.successfulRequests;
    this.metrics.averageResponseTime = 
      ((this.metrics.averageResponseTime * (totalSuccessful - 1)) + responseTime) / totalSuccessful;
  }

  /**
   * Default fallback function when no custom fallback is provided
   */
  async defaultFallback(error) {
    console.log(`[${this.serviceName}] Using default fallback due to: ${error.message}`);
    
    // Return a safe default response
    return {
      success: false,
      error: error.message,
      fallback: true,
      serviceName: this.serviceName,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get current circuit breaker status and metrics
   */
  getStatus() {
    const recentRequests = this.getRecentRequests();
    const recentFailureRate = recentRequests.length > 0 
      ? recentRequests.filter(req => !req.success).length / recentRequests.length 
      : 0;
    
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      configuration: {
        failureThreshold: this.failureThreshold,
        recoveryTimeout: this.recoveryTimeout,
        requestTimeout: this.requestTimeout,
        monitorWindow: this.monitorWindow
      },
      metrics: {
        ...this.metrics,
        recentFailureRate: (recentFailureRate * 100).toFixed(2) + '%',
        recentRequestCount: recentRequests.length,
        uptime: Date.now() - this.metrics.lastResetTime
      }
    };
  }

  /**
   * Reset circuit breaker to initial state
   * Useful for testing or administrative operations
   */
  reset() {
    console.log(`[${this.serviceName}] Circuit breaker reset to initial state`);
    
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.halfOpenTestCount = 0;
    this.requestHistory = [];
    
    // Reset metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeoutRequests: 0,
      circuitOpenRejects: 0,
      averageResponseTime: 0,
      lastResetTime: Date.now()
    };
    
    this.emit('circuit_reset', { serviceName: this.serviceName });
  }

  /**
   * Force circuit breaker to specific state (for testing)
   */
  forceState(state) {
    if (!Object.values(CIRCUIT_STATES).includes(state)) {
      throw new Error(`Invalid state: ${state}`);
    }
    
    console.log(`[${this.serviceName}] Forcing circuit breaker to ${state} state`);
    
    const previousState = this.state;
    this.state = state;
    
    if (state === CIRCUIT_STATES.OPEN) {
      this.lastFailureTime = Date.now();
    }
    
    this.emit('state_forced', {
      serviceName: this.serviceName,
      previousState,
      newState: state
    });
  }
}

// ========================
// Circuit Breaker Factory and Manager
// ========================

/**
 * Circuit Breaker Manager - manages multiple circuit breakers
 * Useful for microservices with many downstream dependencies
 */
class CircuitBreakerManager extends EventEmitter {
  constructor() {
    super();
    this.circuitBreakers = new Map();
    this.globalMetrics = {
      totalCircuitBreakers: 0,
      openCircuits: 0,
      halfOpenCircuits: 0,
      closedCircuits: 0
    };
  }

  /**
   * Create and register a new circuit breaker
   */
  createCircuitBreaker(serviceName, serviceCall, options = {}) {
    if (this.circuitBreakers.has(serviceName)) {
      throw new Error(`Circuit breaker for ${serviceName} already exists`);
    }
    
    const circuitBreaker = new CircuitBreaker(serviceCall, {
      name: serviceName,
      ...options
    });
    
    // Forward events from individual circuit breakers
    circuitBreaker.on('circuit_opened', (data) => {
      this.updateGlobalMetrics();
      this.emit('circuit_opened', data);
    });
    
    circuitBreaker.on('circuit_closed', (data) => {
      this.updateGlobalMetrics();
      this.emit('circuit_closed', data);
    });
    
    circuitBreaker.on('circuit_half_open', (data) => {
      this.updateGlobalMetrics();
      this.emit('circuit_half_open', data);
    });
    
    this.circuitBreakers.set(serviceName, circuitBreaker);
    this.updateGlobalMetrics();
    
    console.log(`Circuit breaker manager: Added circuit breaker for ${serviceName}`);
    
    return circuitBreaker;
  }

  /**
   * Get circuit breaker for a service
   */
  getCircuitBreaker(serviceName) {
    return this.circuitBreakers.get(serviceName);
  }

  /**
   * Execute call through managed circuit breaker
   */
  async execute(serviceName, ...args) {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (!circuitBreaker) {
      throw new Error(`No circuit breaker found for service: ${serviceName}`);
    }
    
    return await circuitBreaker.execute(...args);
  }

  /**
   * Update global metrics across all circuit breakers
   */
  updateGlobalMetrics() {
    this.globalMetrics = {
      totalCircuitBreakers: this.circuitBreakers.size,
      openCircuits: 0,
      halfOpenCircuits: 0,
      closedCircuits: 0
    };
    
    for (const [serviceName, cb] of this.circuitBreakers) {
      switch (cb.state) {
        case CIRCUIT_STATES.OPEN:
          this.globalMetrics.openCircuits++;
          break;
        case CIRCUIT_STATES.HALF_OPEN:
          this.globalMetrics.halfOpenCircuits++;
          break;
        case CIRCUIT_STATES.CLOSED:
          this.globalMetrics.closedCircuits++;
          break;
      }
    }
  }

  /**
   * Get status of all managed circuit breakers
   */
  getAllStatus() {
    const status = {
      globalMetrics: this.globalMetrics,
      circuitBreakers: {}
    };
    
    for (const [serviceName, cb] of this.circuitBreakers) {
      status.circuitBreakers[serviceName] = cb.getStatus();
    }
    
    return status;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    console.log('Resetting all circuit breakers');
    
    for (const [serviceName, cb] of this.circuitBreakers) {
      cb.reset();
    }
    
    this.updateGlobalMetrics();
    this.emit('all_circuits_reset');
  }
}

// ========================
// Usage Examples and Testing
// ========================

/**
 * Mock service function that simulates varying reliability
 */
class MockService {
  constructor(name, failureRate = 0.1) {
    this.name = name;
    this.failureRate = failureRate;
    this.requestCount = 0;
  }
  
  async call(data) {
    this.requestCount++;
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));
    
    // Simulate failures based on configured failure rate
    if (Math.random() < this.failureRate) {
      throw new Error(`${this.name} service error: Random failure ${this.requestCount}`);
    }
    
    return {
      success: true,
      service: this.name,
      data: data,
      requestId: this.requestCount,
      timestamp: new Date().toISOString()
    };
  }
  
  // Simulate service degradation
  degradeService(newFailureRate) {
    this.failureRate = newFailureRate;
    console.log(`${this.name} service degraded - failure rate: ${(newFailureRate * 100).toFixed(1)}%`);
  }
  
  // Simulate service recovery
  recoverService() {
    this.failureRate = 0.05; // Low failure rate
    console.log(`${this.name} service recovered - failure rate: 5%`);
  }
}

/**
 * Demonstrate circuit breaker behavior with different scenarios
 */
async function demonstrateCircuitBreaker() {
  console.log('=== Circuit Breaker Demonstration ===');
  
  // Create mock service with 10% failure rate
  const mockService = new MockService('UserService', 0.1);
  
  // Create circuit breaker with custom fallback
  const circuitBreaker = new CircuitBreaker(
    (data) => mockService.call(data),
    {
      name: 'UserService',
      failureThreshold: 3,
      recoveryTimeout: 5000, // 5 seconds for demo
      requestTimeout: 1000,
      fallback: async (error) => {
        return {
          success: false,
          fallback: true,
          message: 'Using cached user data',
          error: error.message
        };
      }
    }
  );
  
  // Add event listeners
  circuitBreaker.on('circuit_opened', (data) => {
    console.log(`🔴 Circuit OPENED for ${data.serviceName}`);
  });
  
  circuitBreaker.on('circuit_closed', (data) => {
    console.log(`🟢 Circuit CLOSED for ${data.serviceName}`);
  });
  
  circuitBreaker.on('circuit_half_open', (data) => {
    console.log(`🟡 Circuit HALF_OPEN for ${data.serviceName}`);
  });
  
  // Scenario 1: Normal operation
  console.log('\n--- Scenario 1: Normal Operation ---');
  for (let i = 1; i <= 5; i++) {
    try {
      const result = await circuitBreaker.execute({ userId: i });
      console.log(`Request ${i}: Success - ${result.success}`);
    } catch (error) {
      console.log(`Request ${i}: Error - ${error.message}`);
    }
  }
  
  // Scenario 2: Service degradation causing circuit to open
  console.log('\n--- Scenario 2: Service Degradation ---');
  mockService.degradeService(0.8); // 80% failure rate
  
  for (let i = 6; i <= 15; i++) {
    try {
      const result = await circuitBreaker.execute({ userId: i });
      console.log(`Request ${i}: ${result.fallback ? 'Fallback' : 'Success'} - ${result.success}`);
    } catch (error) {
      console.log(`Request ${i}: Error - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n--- Status After Degradation ---');
  console.log(JSON.stringify(circuitBreaker.getStatus(), null, 2));
  
  // Scenario 3: Wait for recovery timeout and service recovery
  console.log('\n--- Scenario 3: Recovery Testing ---');
  console.log('Waiting for recovery timeout...');
  await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for recovery timeout
  
  mockService.recoverService(); // Fix the service
  
  for (let i = 16; i <= 20; i++) {
    try {
      const result = await circuitBreaker.execute({ userId: i });
      console.log(`Request ${i}: ${result.fallback ? 'Fallback' : 'Success'} - ${result.success}`);
    } catch (error) {
      console.log(`Request ${i}: Error - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n--- Final Status ---');
  const finalStatus = circuitBreaker.getStatus();
  console.log(`State: ${finalStatus.state}`);
  console.log(`Total Requests: ${finalStatus.metrics.totalRequests}`);
  console.log(`Success Rate: ${((finalStatus.metrics.successfulRequests / finalStatus.metrics.totalRequests) * 100).toFixed(1)}%`);
  console.log(`Average Response Time: ${finalStatus.metrics.averageResponseTime.toFixed(2)}ms`);
}

/**
 * Demonstrate circuit breaker manager for multiple services
 */
async function demonstrateCircuitBreakerManager() {
  console.log('\n=== Circuit Breaker Manager Demonstration ===');
  
  const manager = new CircuitBreakerManager();
  
  // Create multiple services with different reliability characteristics
  const services = {
    userService: new MockService('UserService', 0.05),
    orderService: new MockService('OrderService', 0.15),
    paymentService: new MockService('PaymentService', 0.3)
  };
  
  // Register circuit breakers
  manager.createCircuitBreaker('userService', 
    (data) => services.userService.call(data),
    { failureThreshold: 5, recoveryTimeout: 3000 });
    
  manager.createCircuitBreaker('orderService', 
    (data) => services.orderService.call(data),
    { failureThreshold: 3, recoveryTimeout: 4000 });
    
  manager.createCircuitBreaker('paymentService', 
    (data) => services.paymentService.call(data),
    { failureThreshold: 2, recoveryTimeout: 5000 });
  
  // Monitor global events
  manager.on('circuit_opened', (data) => {
    console.log(`🔴 Manager: Circuit OPENED for ${data.serviceName}`);
  });
  
  // Simulate concurrent requests to all services
  const requests = [];
  for (let i = 1; i <= 10; i++) {
    requests.push(
      manager.execute('userService', { userId: i }).catch(e => ({ error: e.message })),
      manager.execute('orderService', { orderId: i }).catch(e => ({ error: e.message })),
      manager.execute('paymentService', { paymentId: i }).catch(e => ({ error: e.message }))
    );
  }
  
  const results = await Promise.all(requests);
  console.log(`\nCompleted ${results.length} requests across 3 services`);
  
  // Show global status
  const globalStatus = manager.getAllStatus();
  console.log('\n--- Global Circuit Breaker Status ---');
  console.log(`Total Circuit Breakers: ${globalStatus.globalMetrics.totalCircuitBreakers}`);
  console.log(`Open Circuits: ${globalStatus.globalMetrics.openCircuits}`);
  console.log(`Half-Open Circuits: ${globalStatus.globalMetrics.halfOpenCircuits}`);
  console.log(`Closed Circuits: ${globalStatus.globalMetrics.closedCircuits}`);
}

// Export for use in other modules and testing
module.exports = { 
  CircuitBreaker,
  CircuitBreakerManager,
  CIRCUIT_STATES,
  MockService,
  demonstrateCircuitBreaker,
  demonstrateCircuitBreakerManager
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
  (async () => {
    await demonstrateCircuitBreaker();
    await demonstrateCircuitBreakerManager();
  })().catch(console.error);
}