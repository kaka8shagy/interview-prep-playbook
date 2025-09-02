/**
 * File: map-with-limit.js
 * Description: Async map implementation with concurrency control and advanced features
 * 
 * Problem: Implement Promise.map with concurrency limiting and error handling
 * Level: Hard
 * Asked at: Netflix, Spotify
 * 
 * Learning objectives:
 * - Understand async concurrency control and resource management
 * - Learn semaphore-like patterns for limiting parallel operations
 * - Practice promise composition and error handling strategies
 * - Explore backpressure and queue management in async operations
 * 
 * Time Complexity: O(n) where n is the number of items to process
 * Space Complexity: O(limit + queue_size) for managing concurrent operations
 */

// =======================
// Problem Statement
// =======================

/**
 * Create an advanced async map function that processes items with controlled concurrency:
 * 
 * 1. Process array of items through async mapper function
 * 2. Limit the number of concurrent operations
 * 3. Maintain original array order in results
 * 4. Handle errors gracefully with different strategies
 * 5. Support progress tracking and cancellation
 * 6. Provide backpressure management
 * 7. Optimize for different use cases (speed vs memory)
 * 8. Support retry mechanisms for failed operations
 * 
 * Features required:
 * - Configurable concurrency limit
 * - Order preservation in results
 * - Multiple error handling strategies (fail-fast, collect-errors, ignore-errors)
 * - Progress callbacks and monitoring
 * - Cancellation support with cleanup
 * - Resource pooling for expensive operations
 * - Batch processing capabilities
 * - Performance metrics and optimization
 * 
 * Use cases:
 * - HTTP request batching with rate limiting
 * - File processing with I/O constraints
 * - Database operations with connection limits
 * - Image processing with memory constraints
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Advanced map function with concurrency limiting and comprehensive options
 * 
 * @param {Array} items - Array of items to process
 * @param {Function} mapper - Async function to apply to each item
 * @param {Object} options - Configuration options
 * @param {number} options.concurrency - Max concurrent operations (default: 10)
 * @param {string} options.errorStrategy - Error handling strategy ('fail-fast', 'collect', 'ignore')
 * @param {Function} options.onProgress - Progress callback function
 * @param {AbortSignal} options.signal - AbortSignal for cancellation
 * @param {number} options.retries - Max retries per item (default: 0)
 * @param {Function} options.retryDelay - Retry delay function
 * @param {boolean} options.preserveOrder - Whether to preserve result order (default: true)
 * @returns {Promise<Array>} - Promise resolving to array of results
 */
async function mapWithLimit(items, mapper, options = {}) {
    // TODO: Implement the main mapWithLimit function
    // 
    // Default options:
    // const defaultOptions = {
    //     concurrency: 10,
    //     errorStrategy: 'fail-fast', // 'fail-fast', 'collect', 'ignore'
    //     onProgress: null,
    //     signal: null,
    //     retries: 0,
    //     retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000),
    //     preserveOrder: true,
    //     timeout: null
    // };
    
    throw new Error('Implementation pending');
    
    /**
     * Internal semaphore for concurrency control
     */
    class Semaphore {
        constructor(permits) {
            // TODO: Implement semaphore for controlling concurrency
            // this.permits = permits;
            // this.waitQueue = [];
        }
        
        async acquire() {
            // TODO: Acquire a permit, wait if none available
            throw new Error('Implementation pending');
        }
        
        release() {
            // TODO: Release a permit and process waiting queue
            throw new Error('Implementation pending');
        }
        
        available() {
            // TODO: Return number of available permits
            return 0;
        }
    }
    
    /**
     * Internal task processor with error handling and retries
     */
    async function processItem(item, index, semaphore, results, errors) {
        // TODO: Process individual item with full error handling
        // 1. Acquire semaphore permit
        // 2. Execute mapper with retries
        // 3. Handle results and errors based on strategy
        // 4. Update progress if callback provided
        // 5. Release semaphore permit
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal retry mechanism
     */
    async function executeWithRetry(item, index, mapper, retries, retryDelay) {
        // TODO: Execute mapper with retry logic
        // 1. Try execution
        // 2. Handle failures with retry logic
        // 3. Apply retry delay between attempts
        // 4. Track attempt counts and errors
        
        throw new Error('Implementation pending');
    }
}

// =======================
// Specialized Variants
// =======================

/**
 * TODO: Streaming map with backpressure control
 * Processes items as a stream, handling backpressure automatically
 * 
 * @param {AsyncIterable} source - Source of items to process
 * @param {Function} mapper - Async mapper function
 * @param {Object} options - Configuration options
 * @returns {AsyncGenerator} - Async generator of results
 */
async function* mapWithLimitStream(source, mapper, options = {}) {
    // TODO: Implement streaming version with backpressure
    // 1. Process items as they arrive
    // 2. Handle backpressure by pausing source
    // 3. Yield results as they complete
    // 4. Maintain concurrency limits
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Batch map processor
 * Groups items into batches and processes each batch with concurrency control
 * 
 * @param {Array} items - Items to process
 * @param {Function} batchProcessor - Function that processes a batch of items
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} - Flattened results from all batches
 */
async function mapWithBatches(items, batchProcessor, options = {}) {
    // TODO: Implement batch processing
    // 1. Group items into batches
    // 2. Process batches with concurrency control
    // 3. Flatten results while preserving order
    // 4. Handle batch-level errors appropriately
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Prioritized map processor
 * Processes items based on priority, with higher priority items processed first
 * 
 * @param {Array} items - Items with priority information
 * @param {Function} mapper - Async mapper function
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} - Results in original order
 */
async function mapWithPriority(items, mapper, options = {}) {
    // TODO: Implement priority-based processing
    // 1. Sort items by priority while tracking original indices
    // 2. Process items in priority order
    // 3. Return results in original order
    // 4. Handle dynamic priority updates
    
    throw new Error('Implementation pending');
}

// =======================
// Resource Management Utilities
// =======================

/**
 * TODO: Resource pool for expensive operations
 * Manages a pool of reusable resources (connections, workers, etc.)
 */
class ResourcePool {
    constructor(createResource, destroyResource, options = {}) {
        // TODO: Initialize resource pool
        // this.createResource = createResource;
        // this.destroyResource = destroyResource;
        // this.maxSize = options.maxSize || 10;
        // this.minSize = options.minSize || 1;
        // this.available = [];
        // this.busy = new Set();
        // this.creating = 0;
        
        throw new Error('Implementation pending');
    }
    
    async acquire() {
        // TODO: Acquire a resource from the pool
        throw new Error('Implementation pending');
    }
    
    async release(resource) {
        // TODO: Release a resource back to the pool
        throw new Error('Implementation pending');
    }
    
    async destroy() {
        // TODO: Destroy all resources and cleanup
        throw new Error('Implementation pending');
    }
    
    getStats() {
        // TODO: Return pool statistics
        return {
            available: 0,
            busy: 0,
            total: 0
        };
    }
}

/**
 * TODO: Rate limiter for controlling request frequency
 * Implements token bucket algorithm for rate limiting
 */
class RateLimiter {
    constructor(tokensPerSecond, maxTokens) {
        // TODO: Initialize rate limiter
        // this.tokensPerSecond = tokensPerSecond;
        // this.maxTokens = maxTokens;
        // this.tokens = maxTokens;
        // this.lastRefill = Date.now();
        
        throw new Error('Implementation pending');
    }
    
    async acquire(tokens = 1) {
        // TODO: Acquire tokens, wait if not available
        throw new Error('Implementation pending');
    }
    
    _refillTokens() {
        // TODO: Refill tokens based on time elapsed
        throw new Error('Implementation pending');
    }
}

// =======================
// Error Handling Strategies
// =======================

/**
 * TODO: Error handling strategy implementations
 * Different approaches to handling errors during processing
 */
const ErrorStrategies = {
    /**
     * Fail fast - stop processing on first error
     */
    failFast: {
        handleError: (error, index, results, errors) => {
            // TODO: Implement fail-fast error handling
            throw error;
        },
        finalizeResults: (results, errors) => {
            // TODO: Return results or throw first error
            throw new Error('Implementation pending');
        }
    },
    
    /**
     * Collect errors - continue processing, collect all errors
     */
    collect: {
        handleError: (error, index, results, errors) => {
            // TODO: Collect error and continue processing
            throw new Error('Implementation pending');
        },
        finalizeResults: (results, errors) => {
            // TODO: Return results with error information
            throw new Error('Implementation pending');
        }
    },
    
    /**
     * Ignore errors - continue processing, ignore errors
     */
    ignore: {
        handleError: (error, index, results, errors) => {
            // TODO: Ignore error and continue
            throw new Error('Implementation pending');
        },
        finalizeResults: (results, errors) => {
            // TODO: Return successful results only
            throw new Error('Implementation pending');
        }
    }
};

// =======================
// Progress Tracking and Monitoring
// =======================

/**
 * TODO: Progress tracker for monitoring map operations
 * Provides detailed progress information and statistics
 */
class ProgressTracker {
    constructor(totalItems, onProgress) {
        // TODO: Initialize progress tracking
        // this.totalItems = totalItems;
        // this.onProgress = onProgress;
        // this.completed = 0;
        // this.failed = 0;
        // this.inProgress = 0;
        // this.startTime = Date.now();
        
        throw new Error('Implementation pending');
    }
    
    updateProgress(type, item, index, result, error) {
        // TODO: Update progress counters and call callback
        throw new Error('Implementation pending');
    }
    
    getStats() {
        // TODO: Return current statistics
        return {
            completed: 0,
            failed: 0,
            inProgress: 0,
            total: 0,
            percentage: 0,
            elapsedTime: 0,
            estimatedRemaining: 0
        };
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
// Test Case 1: Basic concurrency limiting
console.log("=== Basic Concurrency Limiting Test ===");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const basicItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const basicMapper = async (item) => {
    const processingTime = Math.random() * 1000;
    console.log(`Starting item ${item} (${processingTime.toFixed(0)}ms)`);
    await delay(processingTime);
    console.log(`Completed item ${item}`);
    return item * 2;
};

mapWithLimit(basicItems, basicMapper, { 
    concurrency: 3,
    onProgress: (progress) => {
        console.log(`Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%)`);
    }
}).then(results => {
    console.log("Basic test results:", results);
});

// Test Case 2: Error handling strategies
console.log("\n=== Error Handling Strategies Test ===");
const errorItems = [1, 2, 3, 4, 5];
const errorMapper = async (item) => {
    if (item === 3) {
        throw new Error(`Error processing item ${item}`);
    }
    return item * 10;
};

// Test fail-fast strategy
mapWithLimit(errorItems, errorMapper, { 
    concurrency: 2, 
    errorStrategy: 'fail-fast' 
}).catch(error => {
    console.log("Fail-fast error:", error.message);
});

// Test collect strategy
mapWithLimit(errorItems, errorMapper, { 
    concurrency: 2, 
    errorStrategy: 'collect' 
}).then(results => {
    console.log("Collect strategy results:", results);
}).catch(error => {
    console.log("Collect strategy error:", error);
});

// Test ignore strategy
mapWithLimit(errorItems, errorMapper, { 
    concurrency: 2, 
    errorStrategy: 'ignore' 
}).then(results => {
    console.log("Ignore strategy results:", results);
});

// Test Case 3: Retry mechanism
console.log("\n=== Retry Mechanism Test ===");
let attemptCounts = {};
const retryMapper = async (item) => {
    attemptCounts[item] = (attemptCounts[item] || 0) + 1;
    console.log(`Attempt ${attemptCounts[item]} for item ${item}`);
    
    if (attemptCounts[item] < 3 && item === 2) {
        throw new Error(`Temporary error for item ${item}`);
    }
    
    return item * 5;
};

mapWithLimit([1, 2, 3], retryMapper, { 
    concurrency: 2, 
    retries: 2,
    retryDelay: (attempt) => 200 * attempt
}).then(results => {
    console.log("Retry test results:", results);
    console.log("Attempt counts:", attemptCounts);
});

// Test Case 4: Cancellation support
console.log("\n=== Cancellation Test ===");
const abortController = new AbortController();
const cancelItems = Array.from({length: 20}, (_, i) => i + 1);
const cancelMapper = async (item, signal) => {
    for (let i = 0; i < 10; i++) {
        if (signal?.aborted) {
            throw new Error('Operation cancelled');
        }
        await delay(100);
    }
    return item;
};

const cancelPromise = mapWithLimit(cancelItems, cancelMapper, { 
    concurrency: 5, 
    signal: abortController.signal 
});

// Cancel after 2 seconds
setTimeout(() => {
    console.log("Cancelling operation...");
    abortController.abort();
}, 2000);

cancelPromise.catch(error => {
    console.log("Cancellation result:", error.message);
});

// Test Case 5: Batch processing
console.log("\n=== Batch Processing Test ===");
const batchItems = Array.from({length: 100}, (_, i) => i + 1);
const batchProcessor = async (batch) => {
    console.log(`Processing batch of ${batch.length} items: [${batch[0]}...${batch[batch.length-1]}]`);
    await delay(500);
    return batch.map(item => item * 3);
};

mapWithBatches(batchItems, batchProcessor, {
    batchSize: 10,
    concurrency: 3
}).then(results => {
    console.log(`Batch processing completed. Total results: ${results.length}`);
    console.log("First 10 results:", results.slice(0, 10));
});

// Test Case 6: Priority processing
console.log("\n=== Priority Processing Test ===");
const priorityItems = [
    { value: 'low1', priority: 1 },
    { value: 'high1', priority: 10 },
    { value: 'medium1', priority: 5 },
    { value: 'high2', priority: 10 },
    { value: 'low2', priority: 1 },
    { value: 'medium2', priority: 5 }
];

const priorityMapper = async (item) => {
    console.log(`Processing ${item.value} (priority: ${item.priority})`);
    await delay(200);
    return `${item.value}-processed`;
};

mapWithPriority(priorityItems, priorityMapper, { 
    concurrency: 2,
    priorityKey: 'priority' 
}).then(results => {
    console.log("Priority processing results:", results);
});

// Test Case 7: Resource pool usage
console.log("\n=== Resource Pool Test ===");
const pool = new ResourcePool(
    () => ({ id: Math.random(), created: Date.now() }),
    (resource) => console.log(`Destroying resource ${resource.id}`)
);

const poolItems = Array.from({length: 15}, (_, i) => i + 1);
const poolMapper = async (item) => {
    const resource = await pool.acquire();
    try {
        console.log(`Item ${item} using resource ${resource.id.toFixed(6)}`);
        await delay(300);
        return `${item}-${resource.id.toFixed(6)}`;
    } finally {
        await pool.release(resource);
    }
};

mapWithLimit(poolItems, poolMapper, { concurrency: 5 }).then(results => {
    console.log("Resource pool test completed");
    console.log("Pool stats:", pool.getStats());
    return pool.destroy();
});

// Performance test
console.log("\n=== Performance Test ===");
const perfItems = Array.from({length: 1000}, (_, i) => i);
const perfMapper = async (item) => {
    await delay(Math.random() * 10);
    return item * 2;
};

const perfStart = Date.now();
mapWithLimit(perfItems, perfMapper, { 
    concurrency: 50,
    preserveOrder: true
}).then(results => {
    const perfEnd = Date.now();
    console.log(`Performance test: processed 1000 items in ${perfEnd - perfStart}ms`);
    console.log(`Average: ${(perfEnd - perfStart) / 1000}ms per item`);
    console.log(`Results length: ${results.length}`);
});
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Concurrency Control:
 *    - Semaphore implementation for limiting parallel operations
 *    - Trade-offs between concurrency and resource usage
 *    - Backpressure handling in streaming scenarios
 * 
 * 2. Error Handling Strategies:
 *    - Fail-fast vs collect vs ignore error patterns
 *    - Retry mechanisms with exponential backoff
 *    - Circuit breaker patterns for unstable services
 * 
 * 3. Memory Management:
 *    - Order preservation vs memory efficiency
 *    - Streaming processing for large datasets
 *    - Resource pooling for expensive operations
 * 
 * 4. Performance Optimization:
 *    - Optimal concurrency levels for different scenarios
 *    - Batching strategies for improved throughput
 *    - Priority-based processing for critical items
 * 
 * 5. Real-world Applications:
 *    - HTTP request batching with rate limiting
 *    - File processing with I/O constraints
 *    - Database operations with connection pooling
 *    - Image/video processing with memory limits
 * 
 * 6. Advanced Features:
 *    - Cancellation and cleanup mechanisms
 *    - Progress tracking and monitoring
 *    - Dynamic concurrency adjustment
 *    - Integration with reactive programming patterns
 * 
 * 7. Testing and Reliability:
 *    - Testing async concurrency control
 *    - Handling race conditions and edge cases
 *    - Performance benchmarking and optimization
 *    - Error injection and fault tolerance testing
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mapWithLimit,
        mapWithLimitStream,
        mapWithBatches,
        mapWithPriority,
        ResourcePool,
        RateLimiter,
        ErrorStrategies,
        ProgressTracker
    };
}