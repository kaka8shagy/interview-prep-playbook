/**
 * File: map-limit.js
 * Description: Concurrent processing with limited parallelism (mapLimit pattern)
 * 
 * Learning objectives:
 * - Control concurrency to prevent resource exhaustion
 * - Implement async iterators for large collections
 * - Balance performance vs resource usage
 * - Handle errors in concurrent operations
 * 
 * Time Complexity: O(n) where n is number of items
 * Space Complexity: O(limit) for concurrent operations
 */

// =======================
// Approach 1: Basic MapLimit
// =======================

/**
 * Basic mapLimit implementation
 * Processes array items concurrently with a specified concurrency limit
 * 
 * Mental model: Think of it like having a limited number of workers
 * processing tasks from a queue. When a worker finishes, it takes the next task.
 */
async function mapLimit(items, limit, asyncFn) {
  // Validate inputs
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }
  if (typeof limit !== 'number' || limit <= 0) {
    throw new TypeError('limit must be a positive number');
  }
  if (typeof asyncFn !== 'function') {
    throw new TypeError('asyncFn must be a function');
  }

  // Handle empty array
  if (items.length === 0) {
    return [];
  }

  // Initialize result array with same length as input
  const results = new Array(items.length);
  let currentIndex = 0;

  // Create worker function that processes items from the queue
  const worker = async () => {
    while (currentIndex < items.length) {
      // Get next item to process
      const index = currentIndex++;
      
      if (index >= items.length) {
        break;
      }

      try {
        // Process the item and store result at correct index
        // This preserves the original order of items
        results[index] = await asyncFn(items[index], index, items);
      } catch (error) {
        // Store error in results array - let caller handle error strategy
        results[index] = error;
      }
    }
  };

  // Create limited number of workers and run them concurrently
  // Each worker will process items until the queue is empty
  const workers = Array(Math.min(limit, items.length))
    .fill()
    .map(() => worker());

  // Wait for all workers to complete
  await Promise.all(workers);

  // Check if any results are errors and handle according to strategy
  const errorResults = results.filter(result => result instanceof Error);
  if (errorResults.length > 0) {
    // For basic version, throw first error encountered
    // More sophisticated versions might collect all errors
    throw errorResults[0];
  }

  return results;
}

// =======================
// Approach 2: MapLimit with Error Strategy
// =======================

/**
 * Enhanced mapLimit with configurable error handling strategies
 * Allows different approaches to handling errors in concurrent processing
 */
async function mapLimitWithErrorStrategy(items, limit, asyncFn, options = {}) {
  const {
    errorStrategy = 'fail-fast', // 'fail-fast', 'collect-errors', 'ignore-errors'
    onError = null, // Callback for individual errors
    onProgress = null // Progress callback
  } = options;

  if (items.length === 0) return [];

  const results = new Array(items.length);
  const errors = [];
  let currentIndex = 0;
  let completedCount = 0;

  const worker = async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      
      if (index >= items.length) break;

      try {
        results[index] = await asyncFn(items[index], index, items);
      } catch (error) {
        // Handle error according to strategy
        if (onError) {
          try {
            onError(error, items[index], index);
          } catch (callbackError) {
            console.error('Error in onError callback:', callbackError);
          }
        }

        switch (errorStrategy) {
          case 'fail-fast':
            // Stop all processing on first error
            throw error;
          
          case 'collect-errors':
            // Collect error but continue processing
            errors.push({ error, item: items[index], index });
            results[index] = error;
            break;
          
          case 'ignore-errors':
            // Skip errors, continue processing
            results[index] = undefined;
            break;
        }
      }

      // Report progress
      completedCount++;
      if (onProgress) {
        try {
          onProgress(completedCount, items.length, results[index], index);
        } catch (callbackError) {
          console.error('Error in onProgress callback:', callbackError);
        }
      }
    }
  };

  // Create and run workers
  const workers = Array(Math.min(limit, items.length)).fill().map(() => worker());

  try {
    await Promise.all(workers);
  } catch (error) {
    if (errorStrategy === 'fail-fast') {
      throw error;
    }
  }

  // Handle collected errors
  if (errorStrategy === 'collect-errors' && errors.length > 0) {
    const collectedError = new Error(`${errors.length} operations failed during mapLimit processing`);
    collectedError.errors = errors;
    collectedError.results = results;
    throw collectedError;
  }

  return results.filter(result => result !== undefined);
}

// =======================
// Approach 3: Streaming MapLimit
// =======================

/**
 * Streaming version that processes items as they become available
 * Useful for processing large datasets that don't fit in memory
 */
class StreamingMapLimit {
  constructor(limit, asyncFn, options = {}) {
    this.limit = limit;
    this.asyncFn = asyncFn;
    this.options = {
      highWaterMark: 100, // Buffer size
      onResult: null, // Callback for each result
      onError: null,  // Error handler
      ...options
    };
    
    this.activeWorkers = 0;
    this.queue = [];
    this.results = [];
    this.errors = [];
    this.finished = false;
  }

  // Process a stream of items
  async processStream(itemStream) {
    return new Promise((resolve, reject) => {
      let streamEnded = false;
      let itemIndex = 0;

      // Handle stream data
      const processItem = async (item) => {
        if (this.activeWorkers < this.limit) {
          // Start processing immediately if workers are available
          this.processItemWithWorker(item, itemIndex++);
        } else {
          // Queue item for later processing
          this.queue.push({ item, index: itemIndex++ });
        }
      };

      // Handle stream end
      const handleStreamEnd = () => {
        streamEnded = true;
        if (this.activeWorkers === 0 && this.queue.length === 0) {
          this.finished = true;
          resolve({ results: this.results, errors: this.errors });
        }
      };

      // Process queued items
      const processQueue = () => {
        while (this.queue.length > 0 && this.activeWorkers < this.limit) {
          const { item, index } = this.queue.shift();
          this.processItemWithWorker(item, index);
        }

        if (streamEnded && this.activeWorkers === 0 && this.queue.length === 0) {
          this.finished = true;
          resolve({ results: this.results, errors: this.errors });
        }
      };

      // Process item with worker
      this.processItemWithWorker = async (item, index) => {
        this.activeWorkers++;

        try {
          const result = await this.asyncFn(item, index);
          
          if (this.options.onResult) {
            this.options.onResult(result, item, index);
          }
          
          this.results.push({ result, item, index });
        } catch (error) {
          if (this.options.onError) {
            this.options.onError(error, item, index);
          }
          
          this.errors.push({ error, item, index });
        } finally {
          this.activeWorkers--;
          processQueue();
        }
      };

      // Set up stream event handlers
      if (itemStream && typeof itemStream.on === 'function') {
        itemStream.on('data', processItem);
        itemStream.on('end', handleStreamEnd);
        itemStream.on('error', reject);
      } else if (Array.isArray(itemStream)) {
        // Handle array as stream
        itemStream.forEach(processItem);
        handleStreamEnd();
      } else {
        reject(new TypeError('itemStream must be a readable stream or array'));
      }
    });
  }

  // Get current processing statistics
  getStats() {
    return {
      activeWorkers: this.activeWorkers,
      queuedItems: this.queue.length,
      completedItems: this.results.length,
      errors: this.errors.length,
      finished: this.finished
    };
  }
}

// =======================
// Approach 4: Advanced MapLimit with Backpressure
// =======================

/**
 * Advanced implementation with backpressure handling and adaptive concurrency
 * Automatically adjusts concurrency based on processing speed and error rates
 */
class AdaptiveMapLimit {
  constructor(initialLimit, asyncFn, options = {}) {
    this.currentLimit = initialLimit;
    this.maxLimit = options.maxLimit || initialLimit * 2;
    this.minLimit = options.minLimit || 1;
    this.asyncFn = asyncFn;
    
    // Performance tracking
    this.processingTimes = [];
    this.errorCount = 0;
    this.successCount = 0;
    this.lastAdjustment = Date.now();
    
    // Configuration
    this.options = {
      adjustmentInterval: 5000, // How often to adjust concurrency
      errorThreshold: 0.1,      // Error rate threshold for reducing concurrency
      targetLatency: 1000,      // Target processing time per item
      ...options
    };
  }

  async process(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const results = new Array(items.length);
    let currentIndex = 0;

    // Adaptive worker that adjusts concurrency based on performance
    const adaptiveWorker = async () => {
      while (currentIndex < items.length) {
        const index = currentIndex++;
        if (index >= items.length) break;

        const startTime = Date.now();

        try {
          const result = await this.asyncFn(items[index], index, items);
          results[index] = result;
          
          this.successCount++;
          this.processingTimes.push(Date.now() - startTime);
          
          // Keep only recent processing times for analysis
          if (this.processingTimes.length > 100) {
            this.processingTimes = this.processingTimes.slice(-50);
          }
          
        } catch (error) {
          results[index] = error;
          this.errorCount++;
        }

        // Periodically adjust concurrency based on performance
        if (Date.now() - this.lastAdjustment > this.options.adjustmentInterval) {
          this.adjustConcurrency();
        }
      }
    };

    // Start with current limit workers
    let workers = Array(Math.min(this.currentLimit, items.length))
      .fill()
      .map(() => adaptiveWorker());

    await Promise.all(workers);
    
    return results;
  }

  // Adjust concurrency based on current performance metrics
  adjustConcurrency() {
    const totalOperations = this.successCount + this.errorCount;
    if (totalOperations < 10) return; // Need minimum data points

    const errorRate = this.errorCount / totalOperations;
    const avgProcessingTime = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;

    let newLimit = this.currentLimit;

    if (errorRate > this.options.errorThreshold) {
      // High error rate - reduce concurrency
      newLimit = Math.max(this.minLimit, Math.floor(this.currentLimit * 0.8));
    } else if (avgProcessingTime > this.options.targetLatency) {
      // Slow processing - reduce concurrency to avoid overload
      newLimit = Math.max(this.minLimit, Math.floor(this.currentLimit * 0.9));
    } else if (avgProcessingTime < this.options.targetLatency * 0.5 && errorRate < 0.05) {
      // Fast processing and low errors - increase concurrency
      newLimit = Math.min(this.maxLimit, Math.ceil(this.currentLimit * 1.1));
    }

    if (newLimit !== this.currentLimit) {
      console.log(`Adjusting concurrency: ${this.currentLimit} → ${newLimit} (errors: ${errorRate.toFixed(3)}, avg time: ${avgProcessingTime.toFixed(0)}ms)`);
      this.currentLimit = newLimit;
    }

    this.lastAdjustment = Date.now();
  }

  // Get current performance statistics
  getStats() {
    const totalOps = this.successCount + this.errorCount;
    return {
      currentLimit: this.currentLimit,
      successCount: this.successCount,
      errorCount: this.errorCount,
      errorRate: totalOps > 0 ? this.errorCount / totalOps : 0,
      avgProcessingTime: this.processingTimes.length > 0 
        ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length 
        : 0,
      recentProcessingTimes: this.processingTimes.slice(-10)
    };
  }

  // Reset statistics
  reset() {
    this.processingTimes = [];
    this.errorCount = 0;
    this.successCount = 0;
    this.lastAdjustment = Date.now();
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== MapLimit Examples ===\n');

// Mock async function that simulates API calls with varying delay and failure rate
function mockAsyncOperation(item, delay = null, failureRate = 0.1) {
  return new Promise((resolve, reject) => {
    const actualDelay = delay || Math.random() * 500 + 100;
    
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Error(`Failed to process item: ${item}`));
      } else {
        resolve(`Processed: ${item} (took ${actualDelay.toFixed(0)}ms)`);
      }
    }, actualDelay);
  });
}

// Example 1: Basic MapLimit
async function example1() {
  console.log('Example 1: Basic MapLimit');
  
  const items = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6', 'task7', 'task8'];
  const limit = 3;
  
  console.log(`Processing ${items.length} items with concurrency limit: ${limit}`);
  
  try {
    const startTime = Date.now();
    const results = await mapLimit(items, limit, (item) => mockAsyncOperation(item, 200, 0));
    const endTime = Date.now();
    
    console.log(`Completed in ${endTime - startTime}ms`);
    console.log('Results:', results.slice(0, 3), '... and', results.length - 3, 'more\n');
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }
}

// Example 2: Error Handling Strategies
async function example2() {
  console.log('Example 2: Error Handling Strategies');
  
  const items = Array.from({ length: 10 }, (_, i) => `item${i + 1}`);
  
  // Test different error strategies
  const strategies = ['fail-fast', 'collect-errors', 'ignore-errors'];
  
  for (const strategy of strategies) {
    console.log(`\nTesting ${strategy} strategy:`);
    
    try {
      const results = await mapLimitWithErrorStrategy(
        items, 
        3, 
        (item) => mockAsyncOperation(item, 100, 0.3), // 30% failure rate
        { 
          errorStrategy: strategy,
          onProgress: (completed, total) => {
            if (completed % 3 === 0 || completed === total) {
              console.log(`  Progress: ${completed}/${total}`);
            }
          }
        }
      );
      console.log(`  Success: ${results.length} results`);
    } catch (error) {
      if (error.errors) {
        console.log(`  Collected ${error.errors.length} errors`);
      } else {
        console.log(`  Failed fast: ${error.message}`);
      }
    }
  }
  console.log();
}

// Example 3: Streaming Processing
async function example3() {
  console.log('Example 3: Streaming Processing');
  
  const streamingProcessor = new StreamingMapLimit(
    2, // concurrency limit
    async (item, index) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      return `Stream processed: ${item} at index ${index}`;
    },
    {
      onResult: (result, item, index) => {
        console.log(`  Result ${index}: ${result}`);
      }
    }
  );
  
  // Simulate stream of items
  const streamItems = ['stream1', 'stream2', 'stream3', 'stream4', 'stream5'];
  
  try {
    const { results, errors } = await streamingProcessor.processStream(streamItems);
    console.log(`Stream processing completed: ${results.length} results, ${errors.length} errors\n`);
  } catch (error) {
    console.log('Stream processing failed:', error.message, '\n');
  }
}

// Run examples
example1()
  .then(() => example2())
  .then(() => example3())
  .catch(console.error);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Image Processing Pipeline
 * Process multiple images concurrently with limited resources
 */
class ImageProcessor {
  constructor(concurrencyLimit = 3) {
    this.limit = concurrencyLimit;
  }

  async processImages(imageUrls) {
    console.log(`\n=== Processing ${imageUrls.length} images (limit: ${this.limit}) ===`);
    
    return await mapLimitWithErrorStrategy(
      imageUrls,
      this.limit,
      async (url, index) => {
        // Simulate image processing steps
        console.log(`Starting image ${index + 1}: ${url}`);
        
        // Step 1: Download image
        await this.simulateStep('download', url, 300);
        
        // Step 2: Resize image
        await this.simulateStep('resize', url, 500);
        
        // Step 3: Apply filters
        await this.simulateStep('filter', url, 200);
        
        // Step 4: Save processed image
        await this.simulateStep('save', url, 100);
        
        console.log(`Completed image ${index + 1}: ${url}`);
        return {
          originalUrl: url,
          processedUrl: `processed_${url}`,
          operations: ['download', 'resize', 'filter', 'save'],
          processedAt: new Date().toISOString()
        };
      },
      {
        errorStrategy: 'collect-errors',
        onError: (error, item, index) => {
          console.log(`Image ${index + 1} failed: ${error.message}`);
        }
      }
    );
  }

  async simulateStep(stepName, url, baseTime) {
    const delay = baseTime + Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`${stepName} failed for ${url}`);
    }
  }
}

/**
 * Use Case 2: API Data Fetcher
 * Fetch data from multiple API endpoints with rate limiting
 */
class APIDataFetcher {
  constructor(options = {}) {
    this.concurrencyLimit = options.concurrencyLimit || 5;
    this.retryLimit = options.retryLimit || 3;
    this.rateLimitDelay = options.rateLimitDelay || 100;
  }

  async fetchMultipleEndpoints(endpoints) {
    console.log(`\n=== Fetching from ${endpoints.length} API endpoints ===`);
    
    return await mapLimitWithErrorStrategy(
      endpoints,
      this.concurrencyLimit,
      async (endpoint, index) => {
        return await this.fetchWithRetry(endpoint, index);
      },
      {
        errorStrategy: 'collect-errors',
        onProgress: (completed, total, result, index) => {
          console.log(`API Progress: ${completed}/${total} endpoints completed`);
        },
        onError: (error, endpoint, index) => {
          console.log(`Endpoint ${index + 1} failed: ${endpoint} - ${error.message}`);
        }
      }
    );
  }

  async fetchWithRetry(endpoint, index, attempt = 1) {
    try {
      console.log(`Fetching endpoint ${index + 1}: ${endpoint} (attempt ${attempt})`);
      
      // Simulate API call with rate limiting
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
      
      // Mock API response
      const response = await this.mockAPICall(endpoint);
      
      return {
        endpoint,
        data: response,
        attempts: attempt,
        fetchedAt: new Date().toISOString()
      };
      
    } catch (error) {
      if (attempt < this.retryLimit) {
        console.log(`Retrying endpoint ${index + 1} (attempt ${attempt + 1})`);
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        return this.fetchWithRetry(endpoint, index, attempt + 1);
      } else {
        throw new Error(`Failed after ${this.retryLimit} attempts: ${error.message}`);
      }
    }
  }

  async mockAPICall(endpoint) {
    const delay = Math.random() * 300 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate various response scenarios
    const rand = Math.random();
    
    if (rand < 0.1) {
      throw new Error('Network timeout');
    } else if (rand < 0.15) {
      throw new Error('Rate limit exceeded');
    } else if (rand < 0.2) {
      throw new Error('Server error 500');
    }
    
    // Success response
    return {
      status: 'success',
      data: `Data from ${endpoint}`,
      timestamp: Date.now(),
      metadata: {
        responseTime: delay,
        version: '1.0'
      }
    };
  }
}

/**
 * Use Case 3: Database Batch Operations
 * Process database operations in batches with connection pooling
 */
class DatabaseBatchProcessor {
  constructor(connectionPool = 5) {
    this.poolSize = connectionPool;
    this.activeConnections = 0;
  }

  async processBatchOperations(operations) {
    console.log(`\n=== Processing ${operations.length} database operations ===`);
    
    const adaptiveProcessor = new AdaptiveMapLimit(
      this.poolSize,
      async (operation, index) => {
        return await this.executeOperation(operation, index);
      },
      {
        maxLimit: this.poolSize * 2,
        minLimit: 1,
        targetLatency: 500,
        errorThreshold: 0.15
      }
    );

    const results = await adaptiveProcessor.process(operations);
    
    console.log('Final stats:', adaptiveProcessor.getStats());
    
    return results.filter(result => !(result instanceof Error));
  }

  async executeOperation(operation, index) {
    const connectionId = Math.floor(Math.random() * this.poolSize) + 1;
    console.log(`Executing operation ${index + 1} on connection ${connectionId}: ${operation.type}`);
    
    try {
      // Acquire connection
      this.activeConnections++;
      
      // Simulate database operation
      const startTime = Date.now();
      await this.simulateDBOperation(operation);
      const duration = Date.now() - startTime;
      
      return {
        operation: operation.type,
        connectionId,
        duration,
        result: `Completed ${operation.type} operation`,
        recordsAffected: Math.floor(Math.random() * 100) + 1
      };
      
    } catch (error) {
      throw new Error(`DB operation failed: ${error.message}`);
    } finally {
      // Release connection
      this.activeConnections--;
    }
  }

  async simulateDBOperation(operation) {
    // Simulate different operation types with varying complexity
    const operationTimes = {
      'SELECT': 100,
      'INSERT': 200,
      'UPDATE': 250,
      'DELETE': 150,
      'CREATE': 500,
      'DROP': 300
    };
    
    const baseTime = operationTimes[operation.type] || 200;
    const actualTime = baseTime + Math.random() * 200;
    
    await new Promise(resolve => setTimeout(resolve, actualTime));
    
    // Simulate occasional database errors
    if (Math.random() < 0.08) { // 8% error rate
      const errors = ['Connection timeout', 'Lock wait timeout', 'Constraint violation', 'Out of disk space'];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }
  }
}

// Test real-world examples
setTimeout(async () => {
  try {
    // Image Processing Example
    const imageProcessor = new ImageProcessor(2);
    const imageUrls = [
      'image1.jpg', 'image2.png', 'image3.gif', 
      'image4.jpg', 'image5.png'
    ];
    
    const processedImages = await imageProcessor.processImages(imageUrls);
    console.log(`Image processing completed: ${processedImages.length} successful`);
    
    // API Data Fetching Example
    const apiFetcher = new APIDataFetcher({ concurrencyLimit: 3 });
    const endpoints = [
      '/api/users', '/api/posts', '/api/comments',
      '/api/analytics', '/api/notifications', '/api/settings'
    ];
    
    const apiResults = await apiFetcher.fetchMultipleEndpoints(endpoints);
    console.log(`API fetching completed: ${apiResults.length} successful`);
    
    // Database Batch Processing Example
    const dbProcessor = new DatabaseBatchProcessor(3);
    const dbOperations = [
      { type: 'SELECT', query: 'SELECT * FROM users' },
      { type: 'INSERT', query: 'INSERT INTO posts...' },
      { type: 'UPDATE', query: 'UPDATE users SET...' },
      { type: 'DELETE', query: 'DELETE FROM logs...' },
      { type: 'SELECT', query: 'SELECT * FROM posts' },
      { type: 'UPDATE', query: 'UPDATE posts SET...' },
      { type: 'INSERT', query: 'INSERT INTO comments...' }
    ];
    
    const dbResults = await dbProcessor.processBatchOperations(dbOperations);
    console.log(`Database operations completed: ${dbResults.length} successful`);
    
  } catch (error) {
    console.error('Real-world example failed:', error);
  }
}, 5000);

// Export all implementations
module.exports = {
  mapLimit,
  mapLimitWithErrorStrategy,
  StreamingMapLimit,
  AdaptiveMapLimit,
  ImageProcessor,
  APIDataFetcher,
  DatabaseBatchProcessor
};

/**
 * Key Interview Points:
 * 
 * 1. Concurrency Control:
 *    - Why limit concurrency (resource constraints, rate limiting, backpressure)
 *    - Worker pool pattern vs semaphore pattern
 *    - Order preservation in concurrent processing
 * 
 * 2. Error Handling Strategies:
 *    - Fail-fast: Stop on first error (good for critical operations)
 *    - Collect errors: Continue processing, collect all errors
 *    - Ignore errors: Skip failed items, continue with successful ones
 * 
 * 3. Memory Management:
 *    - Streaming vs batch processing for large datasets
 *    - Backpressure handling to prevent memory exhaustion
 *    - Result storage strategies (in-memory vs streaming)
 * 
 * 4. Performance Optimization:
 *    - Adaptive concurrency based on system performance
 *    - Queue management and work distribution
 *    - Connection pooling and resource reuse
 * 
 * 5. Real-world Applications:
 *    - API rate limiting compliance
 *    - Database connection pooling
 *    - File/image processing pipelines
 *    - Web scraping with politeness
 *    - Batch ETL operations
 * 
 * 6. Trade-offs:
 *    - Higher concurrency = faster processing but more resource usage
 *    - Lower concurrency = slower processing but more stable
 *    - Memory usage vs processing speed
 *    - Complexity vs maintainability
 */