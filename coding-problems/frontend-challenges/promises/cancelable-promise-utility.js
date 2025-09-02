/**
 * File: cancelable-promise-utility.js
 * Description: Comprehensive promise cancellation utility with advanced control features
 * 
 * Problem: Create a robust promise cancellation system with timeout and resource management
 * Level: Hard
 * Asked at: Meta, Amazon
 * 
 * Learning objectives:
 * - Understand promise lifecycle management and cancellation patterns
 * - Learn timeout handling and resource cleanup strategies
 * - Practice async state management and error propagation
 * - Explore AbortController integration and modern cancellation APIs
 * 
 * Time Complexity: O(1) for cancellation operations, O(n) for managing multiple promises
 * Space Complexity: O(n) for tracking active promises and cleanup handlers
 */

// =======================
// Problem Statement
// =======================

/**
 * Create a comprehensive promise cancellation utility that provides:
 * 
 * 1. Promise cancellation with proper cleanup
 * 2. Timeout management with configurable strategies
 * 3. Resource cleanup and memory leak prevention
 * 4. Cancellation token system similar to .NET/C#
 * 5. Promise composition with cancellation support
 * 6. Batch cancellation for multiple operations
 * 7. Integration with AbortController/AbortSignal
 * 8. Advanced error handling and state management
 * 
 * Features required:
 * - Create cancelable promises from regular promises
 * - Timeout handling with different timeout strategies
 * - Resource cleanup registration and execution
 * - Cancellation token creation and propagation
 * - Promise combinators (all, race, etc.) with cancellation
 * - Graceful vs forceful cancellation modes
 * - Cancellation reason tracking and error propagation
 * - Memory management for long-lived operations
 * 
 * Use cases:
 * - HTTP requests with timeout and cancellation
 * - File operations with progress and cancellation
 * - Long-running computations with user cancellation
 * - Resource management in async operations
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Cancellation token for coordinating cancellation across multiple operations
 */
class CancellationToken {
    constructor(parentToken = null) {
        // TODO: Initialize cancellation token
        // this.isCancelled = false;
        // this.reason = null;
        // this.callbacks = [];
        // this.parentToken = parentToken;
        // this.children = new Set();
        // 
        // if (parentToken) {
        //     parentToken.children.add(this);
        //     if (parentToken.isCancelled) {
        //         this.cancel(parentToken.reason);
        //     }
        // }
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Check if cancellation has been requested
     * 
     * @returns {boolean} - Whether cancellation was requested
     */
    get cancelled() {
        // TODO: Return cancellation status
        // return this.isCancelled || (this.parentToken && this.parentToken.cancelled);
        throw new Error('Implementation pending');
    }
    
    /**
     * Register callback to be called when cancellation is requested
     * 
     * @param {Function} callback - Cancellation callback
     * @returns {Function} - Unregister function
     */
    onCancelled(callback) {
        // TODO: Register cancellation callback
        // 1. Add callback to callbacks array
        // 2. If already cancelled, call immediately
        // 3. Return unregister function
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Throw error if cancellation was requested
     * 
     * @throws {CancellationError} - If cancelled
     */
    throwIfCancelled() {
        // TODO: Throw cancellation error if cancelled
        // if (this.cancelled) {
        //     throw new CancellationError(this.reason);
        // }
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Cancel this token and all child tokens
     * 
     * @param {*} reason - Reason for cancellation
     */
    cancel(reason = 'Operation cancelled') {
        // TODO: Cancel token and propagate to children
        // 1. Set cancelled state
        // 2. Store cancellation reason
        // 3. Call all registered callbacks
        // 4. Cancel all child tokens
        // 5. Clean up resources
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Create a child token
     * 
     * @returns {CancellationToken} - New child token
     */
    createChild() {
        // TODO: Create child token linked to this parent
        return new CancellationToken(this);
    }
}

/**
 * Cancellation error thrown when operations are cancelled
 */
class CancellationError extends Error {
    constructor(reason = 'Operation cancelled') {
        // TODO: Initialize cancellation error
        // super(reason);
        // this.name = 'CancellationError';
        // this.cancelled = true;
        // this.reason = reason;
        
        throw new Error('Implementation pending');
    }
}

/**
 * Main cancelable promise utility class
 */
class CancelablePromise {
    constructor(executor, options = {}) {
        // TODO: Initialize cancelable promise
        // this.options = {
        //     timeout: options.timeout,
        //     timeoutMessage: options.timeoutMessage || 'Promise timed out',
        //     cleanupResources: options.cleanupResources || [],
        //     token: options.token,
        //     abortSignal: options.abortSignal
        // };
        // 
        // this.state = 'pending'; // 'pending', 'fulfilled', 'rejected', 'cancelled'
        // this.value = undefined;
        // this.reason = undefined;
        // this.cleanupHandlers = [];
        // this.timeoutId = null;
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Register cleanup handler
     * 
     * @param {Function} handler - Cleanup function to call on cancellation
     */
    onCleanup(handler) {
        // TODO: Register cleanup handler
        // this.cleanupHandlers.push(handler);
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Cancel the promise
     * 
     * @param {*} reason - Reason for cancellation
     */
    cancel(reason = 'Promise cancelled') {
        // TODO: Cancel promise and run cleanup
        // 1. Check if already resolved/cancelled
        // 2. Set cancelled state
        // 3. Clear timeout if set
        // 4. Run cleanup handlers
        // 5. Reject promise with CancellationError
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Check if promise is cancelled
     * 
     * @returns {boolean} - Whether promise is cancelled
     */
    isCancelled() {
        // TODO: Return cancellation status
        // return this.state === 'cancelled';
        throw new Error('Implementation pending');
    }
    
    /**
     * Convert to regular Promise
     * 
     * @returns {Promise} - Regular promise
     */
    toPromise() {
        // TODO: Return the underlying promise
        throw new Error('Implementation pending');
    }
    
    /**
     * Static method to create cancelable promise from regular promise
     * 
     * @param {Promise} promise - Promise to make cancelable
     * @param {Object} options - Cancellation options
     * @returns {CancelablePromise} - Cancelable version
     */
    static from(promise, options = {}) {
        // TODO: Wrap regular promise to make it cancelable
        // 1. Create cancelable promise wrapper
        // 2. Handle original promise resolution/rejection
        // 3. Support cancellation with cleanup
        // 4. Integrate with timeout and token systems
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Static method for promise.all with cancellation support
     * 
     * @param {Array} promises - Array of cancelable promises
     * @param {Object} options - Options including cancellation token
     * @returns {CancelablePromise} - Cancelable promise of all results
     */
    static all(promises, options = {}) {
        // TODO: Implement Promise.all with cancellation
        // 1. Create master cancelable promise
        // 2. Cancel all promises if one fails (or based on strategy)
        // 3. Support partial cancellation options
        // 4. Handle cleanup for all promises
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Static method for promise.race with cancellation support
     * 
     * @param {Array} promises - Array of cancelable promises
     * @param {Object} options - Options including cancellation token
     * @returns {CancelablePromise} - Cancelable promise of first result
     */
    static race(promises, options = {}) {
        // TODO: Implement Promise.race with cancellation
        // 1. Create master cancelable promise
        // 2. Cancel remaining promises when first resolves
        // 3. Handle cancellation propagation
        // 4. Manage cleanup for all promises
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Static method to create promise with timeout
     * 
     * @param {Promise} promise - Promise to add timeout to
     * @param {number} timeout - Timeout in milliseconds
     * @param {string} message - Timeout error message
     * @returns {CancelablePromise} - Promise with timeout
     */
    static withTimeout(promise, timeout, message = 'Operation timed out') {
        // TODO: Add timeout to promise
        // 1. Create timeout promise
        // 2. Race original promise with timeout
        // 3. Cancel based on which resolves first
        // 4. Cleanup timeout resources
        
        throw new Error('Implementation pending');
    }
}

// =======================
// Advanced Utilities
// =======================

/**
 * TODO: Promise batch processor with cancellation
 * Processes promises in batches with global cancellation support
 */
class CancelableBatchProcessor {
    constructor(options = {}) {
        // TODO: Initialize batch processor
        // this.concurrency = options.concurrency || 5;
        // this.batchSize = options.batchSize || 10;
        // this.token = options.token || new CancellationToken();
        // this.activePromises = new Set();
        // this.pendingBatches = [];
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Add promise to batch processor
     * 
     * @param {Function} promiseFactory - Function that creates promise
     * @returns {CancelablePromise} - Cancelable promise for the operation
     */
    add(promiseFactory) {
        // TODO: Add promise to processing queue
        throw new Error('Implementation pending');
    }
    
    /**
     * Process all batches
     * 
     * @returns {Promise} - Promise resolving when all batches complete
     */
    processAll() {
        // TODO: Process all batches with cancellation support
        throw new Error('Implementation pending');
    }
    
    /**
     * Cancel all active and pending operations
     */
    cancelAll() {
        // TODO: Cancel all operations
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Retry mechanism with cancellation support
 * Implements exponential backoff with cancellation
 */
class CancelableRetry {
    constructor(options = {}) {
        // TODO: Initialize retry mechanism
        // this.maxAttempts = options.maxAttempts || 3;
        // this.baseDelay = options.baseDelay || 1000;
        // this.maxDelay = options.maxDelay || 30000;
        // this.backoffFactor = options.backoffFactor || 2;
        // this.jitter = options.jitter || 0.1;
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Execute operation with retry and cancellation support
     * 
     * @param {Function} operation - Operation to retry
     * @param {CancellationToken} token - Cancellation token
     * @returns {CancelablePromise} - Promise for the operation
     */
    execute(operation, token) {
        // TODO: Execute with retry logic and cancellation
        throw new Error('Implementation pending');
    }
    
    /**
     * Calculate delay for retry attempt
     * 
     * @param {number} attempt - Attempt number (0-based)
     * @returns {number} - Delay in milliseconds
     */
    calculateDelay(attempt) {
        // TODO: Calculate retry delay with backoff and jitter
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Resource manager for async operations
 * Manages resources with automatic cleanup on cancellation
 */
class AsyncResourceManager {
    constructor() {
        // TODO: Initialize resource manager
        // this.resources = new Map();
        // this.cleanupHandlers = new Map();
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Acquire resource with automatic cleanup
     * 
     * @param {string} resourceId - Resource identifier
     * @param {Function} acquirer - Function to acquire resource
     * @param {Function} releaser - Function to release resource
     * @param {CancellationToken} token - Cancellation token
     * @returns {Promise} - Promise resolving to resource
     */
    async acquire(resourceId, acquirer, releaser, token) {
        // TODO: Acquire resource with cleanup registration
        throw new Error('Implementation pending');
    }
    
    /**
     * Release specific resource
     * 
     * @param {string} resourceId - Resource to release
     */
    async release(resourceId) {
        // TODO: Release specific resource
        throw new Error('Implementation pending');
    }
    
    /**
     * Release all resources
     */
    async releaseAll() {
        // TODO: Release all managed resources
        throw new Error('Implementation pending');
    }
}

// =======================
// Integration Utilities
// =======================

/**
 * TODO: AbortController integration utilities
 * Helper functions for working with AbortController/AbortSignal
 */
const AbortUtils = {
    /**
     * Create CancellationToken from AbortSignal
     */
    fromAbortSignal: (signal) => {
        // TODO: Create cancellation token from abort signal
        throw new Error('Implementation pending');
    },
    
    /**
     * Create AbortSignal from CancellationToken
     */
    toAbortSignal: (token) => {
        // TODO: Create abort signal from cancellation token
        throw new Error('Implementation pending');
    },
    
    /**
     * Combine multiple abort signals
     */
    combineSignals: (...signals) => {
        // TODO: Create combined abort signal
        throw new Error('Implementation pending');
    }
};

/**
 * TODO: Fetch API integration with enhanced cancellation
 * Enhanced fetch with timeout, retry, and advanced cancellation
 */
class CancelableFetch {
    constructor(options = {}) {
        // TODO: Initialize cancelable fetch utility
        throw new Error('Implementation pending');
    }
    
    /**
     * Enhanced fetch with cancellation support
     * 
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options with cancellation
     * @returns {CancelablePromise} - Cancelable fetch promise
     */
    fetch(url, options = {}) {
        // TODO: Implement enhanced fetch
        // 1. Create abort controller
        // 2. Set up timeout
        // 3. Handle retry logic
        // 4. Integrate with cancellation token
        // 5. Manage resource cleanup
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Batch multiple requests with cancellation
     * 
     * @param {Array} requests - Array of request configurations
     * @param {Object} options - Batch options
     * @returns {CancelablePromise} - Promise for all requests
     */
    batchFetch(requests, options = {}) {
        // TODO: Implement batch fetch with cancellation
        throw new Error('Implementation pending');
    }
}

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic cancellation token usage
console.log("=== Basic Cancellation Token Test ===");
const token = new CancellationToken();

token.onCancelled((reason) => {
    console.log("Cancellation detected:", reason);
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const operation1 = async () => {
    try {
        for (let i = 0; i < 10; i++) {
            token.throwIfCancelled();
            console.log(`Operation step ${i + 1}`);
            await delay(200);
        }
        console.log("Operation completed");
    } catch (error) {
        if (error instanceof CancellationError) {
            console.log("Operation was cancelled:", error.reason);
        } else {
            throw error;
        }
    }
};

operation1();

// Cancel after 1 second
setTimeout(() => {
    token.cancel("User requested cancellation");
}, 1000);

// Test Case 2: Cancelable promise with timeout
console.log("\n=== Cancelable Promise with Timeout Test ===");
const longRunningTask = new Promise((resolve) => {
    setTimeout(() => resolve("Task completed"), 3000);
});

const cancelableTask = CancelablePromise.withTimeout(
    longRunningTask, 
    1500, 
    "Task timed out after 1.5 seconds"
);

cancelableTask.toPromise()
    .then(result => console.log("Result:", result))
    .catch(error => {
        if (error instanceof CancellationError) {
            console.log("Task was cancelled:", error.reason);
        } else {
            console.log("Task failed:", error.message);
        }
    });

// Test Case 3: Promise.all with cancellation
console.log("\n=== Promise.all with Cancellation Test ===");
const createMockPromise = (id, duration) => {
    return CancelablePromise.from(
        new Promise((resolve, reject) => {
            const timer = setTimeout(() => resolve(`Task ${id} completed`), duration);
            return () => clearTimeout(timer);
        })
    );
};

const allPromises = [
    createMockPromise(1, 1000),
    createMockPromise(2, 2000),
    createMockPromise(3, 1500)
];

const allCancelable = CancelablePromise.all(allPromises);

allCancelable.toPromise()
    .then(results => console.log("All results:", results))
    .catch(error => console.log("All failed:", error.message));

// Cancel after 1.2 seconds
setTimeout(() => {
    allCancelable.cancel("Cancelled Promise.all");
}, 1200);

// Test Case 4: Resource cleanup on cancellation
console.log("\n=== Resource Cleanup Test ===");
const resourceManager = new AsyncResourceManager();
const resourceToken = new CancellationToken();

const resourceHeavyOperation = async () => {
    try {
        const resource1 = await resourceManager.acquire(
            'db-connection',
            () => ({ type: 'database', id: 'conn-1' }),
            (res) => console.log(`Closing ${res.type} ${res.id}`),
            resourceToken
        );
        
        const resource2 = await resourceManager.acquire(
            'file-handle',
            () => ({ type: 'file', id: 'file-1' }),
            (res) => console.log(`Closing ${res.type} ${res.id}`),
            resourceToken
        );
        
        console.log("Resources acquired:", resource1, resource2);
        
        // Simulate work
        await delay(2000);
        
        console.log("Resource operation completed");
    } catch (error) {
        if (error instanceof CancellationError) {
            console.log("Resource operation cancelled");
        } else {
            throw error;
        }
    } finally {
        await resourceManager.releaseAll();
    }
};

resourceHeavyOperation();

// Cancel after 1 second to test cleanup
setTimeout(() => {
    resourceToken.cancel("Resource operation timeout");
}, 1000);

// Test Case 5: Batch processor with cancellation
console.log("\n=== Batch Processor Test ===");
const batchProcessor = new CancelableBatchProcessor({
    concurrency: 2,
    batchSize: 3
});

// Add multiple tasks
for (let i = 1; i <= 10; i++) {
    batchProcessor.add(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Batch task ${i} completed`);
                resolve(`Result ${i}`);
            }, Math.random() * 1000);
        });
    });
}

const batchPromise = batchProcessor.processAll();

batchPromise
    .then(results => console.log("Batch processing completed:", results.length))
    .catch(error => console.log("Batch processing failed:", error.message));

// Cancel batch processing after 2 seconds
setTimeout(() => {
    console.log("Cancelling batch processing...");
    batchProcessor.cancelAll();
}, 2000);

// Test Case 6: Retry with cancellation
console.log("\n=== Retry with Cancellation Test ===");
const retryManager = new CancelableRetry({
    maxAttempts: 3,
    baseDelay: 500,
    backoffFactor: 2
});

let attemptCount = 0;
const failingOperation = () => {
    attemptCount++;
    console.log(`Attempt ${attemptCount}`);
    
    if (attemptCount < 3) {
        throw new Error(`Attempt ${attemptCount} failed`);
    }
    
    return `Success on attempt ${attemptCount}`;
};

const retryToken = new CancellationToken();
const retryPromise = retryManager.execute(failingOperation, retryToken);

retryPromise.toPromise()
    .then(result => console.log("Retry result:", result))
    .catch(error => console.log("Retry failed:", error.message));

// Test Case 7: Enhanced fetch with cancellation
console.log("\n=== Enhanced Fetch Test ===");
const fetchUtil = new CancelableFetch({
    timeout: 5000,
    retries: 2
});

// Mock fetch for testing (replace with real URL in actual use)
const mockFetch = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ 
                ok: true, 
                json: () => Promise.resolve({ message: "API response" }) 
            });
        }, 1000);
    });
};

const fetchPromise = fetchUtil.fetch('https://api.example.com/data', {
    method: 'GET',
    timeout: 2000
});

fetchPromise.toPromise()
    .then(response => response.json())
    .then(data => console.log("Fetch result:", data))
    .catch(error => console.log("Fetch failed:", error.message));

// Performance test
console.log("\n=== Performance Test ===");
const perfToken = new CancellationToken();
const startTime = performance.now();

// Create many cancelable operations
const operations = Array.from({ length: 1000 }, (_, i) => {
    return CancelablePromise.from(
        new Promise(resolve => setTimeout(() => resolve(i), Math.random() * 100))
    );
});

const perfAllPromise = CancelablePromise.all(operations);

perfAllPromise.toPromise()
    .then(results => {
        const endTime = performance.now();
        console.log(`Performance test: ${results.length} operations in ${endTime - startTime}ms`);
    })
    .catch(error => {
        const endTime = performance.now();
        console.log(`Performance test cancelled after ${endTime - startTime}ms: ${error.message}`);
    });

// Cancel some operations randomly for testing
setTimeout(() => {
    if (Math.random() > 0.5) {
        perfToken.cancel("Random performance test cancellation");
    }
}, 150);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Cancellation Patterns:
 *    - Cooperative vs preemptive cancellation
 *    - Cancellation token propagation strategies
 *    - Graceful vs forceful cancellation modes
 * 
 * 2. Resource Management:
 *    - Automatic cleanup on cancellation
 *    - Resource leak prevention strategies
 *    - Integration with try/finally patterns
 * 
 * 3. Promise Composition:
 *    - Cancellation in Promise.all/race scenarios
 *    - Partial cancellation strategies
 *    - Error propagation in composite operations
 * 
 * 4. Timeout Handling:
 *    - Different timeout strategies (absolute, sliding, adaptive)
 *    - Integration with cancellation systems
 *    - Performance implications of timeout management
 * 
 * 5. Integration with Web APIs:
 *    - AbortController/AbortSignal compatibility
 *    - Fetch API cancellation best practices
 *    - Web Worker and ServiceWorker integration
 * 
 * 6. Performance Considerations:
 *    - Memory overhead of cancellation infrastructure
 *    - Cleanup performance in large operation sets
 *    - Optimization strategies for high-throughput scenarios
 * 
 * 7. Error Handling:
 *    - Distinguishing cancellation from other errors
 *    - Error aggregation in batch operations
 *    - Debugging and logging cancellation events
 * 
 * 8. Real-world Applications:
 *    - User-initiated cancellation in UI applications
 *    - Request timeout and retry mechanisms
 *    - Background task management in web applications
 *    - Resource-constrained operation coordination
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CancellationToken,
        CancellationError,
        CancelablePromise,
        CancelableBatchProcessor,
        CancelableRetry,
        AsyncResourceManager,
        AbortUtils,
        CancelableFetch
    };
}