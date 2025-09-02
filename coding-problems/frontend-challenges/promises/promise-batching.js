/**
 * File: promise-batching.js
 * Description: Multiple implementations of promise batching and throttling for concurrent execution control
 * 
 * Learning objectives:
 * - Understand concurrency control patterns
 * - Learn batch processing and throttling strategies  
 * - See queue management and resource pooling
 * 
 * Time Complexity: O(n) where n is number of promises
 * Space Complexity: O(k) where k is batch/pool size
 */

// =======================
// Approach 1: Basic Promise Batching
// =======================

/**
 * Basic promise batching implementation
 * Processes promises in fixed-size batches sequentially
 * 
 * Mental model: Divide promises into chunks and process each chunk
 * before moving to the next, controlling memory and resource usage
 */
function batchPromises(promiseFactories, batchSize = 5) {
  return new Promise(async (resolve, reject) => {
    const results = [];
    
    try {
      // Process promises in batches
      for (let i = 0; i < promiseFactories.length; i += batchSize) {
        const batch = promiseFactories.slice(i, i + batchSize);
        
        // Execute current batch concurrently
        const batchPromises = batch.map(factory => 
          typeof factory === 'function' ? factory() : Promise.resolve(factory)
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(promiseFactories.length / batchSize)}`);
      }
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}

// =======================
// Approach 2: Promise Pool with Concurrency Control
// =======================

/**
 * Promise pool that maintains a fixed number of concurrent executions
 * More efficient than batching as it keeps the pipeline full
 */
class PromisePool {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.running = new Set();
    this.queue = [];
    this.results = [];
    this.errors = [];
  }
  
  // Add promise factory to the pool
  add(promiseFactory, index = null) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promiseFactory,
        resolve,
        reject,
        index: index !== null ? index : this.queue.length
      });
      
      this.process();
    });
  }
  
  // Add multiple promise factories
  addAll(promiseFactories) {
    const promises = promiseFactories.map((factory, index) => 
      this.add(factory, index)
    );
    
    return Promise.all(promises);
  }
  
  // Process the queue maintaining concurrency limit
  process() {
    // Start new promises if we have capacity and queued items
    while (this.running.size < this.concurrency && this.queue.length > 0) {
      const { promiseFactory, resolve, reject, index } = this.queue.shift();
      
      const promise = this.executePromise(promiseFactory, resolve, reject, index);
      this.running.add(promise);
      
      // Clean up when promise settles
      promise.finally(() => {
        this.running.delete(promise);
        this.process(); // Try to start more promises
      });
    }
  }
  
  // Execute a single promise with error handling
  async executePromise(promiseFactory, resolve, reject, index) {
    try {
      const result = await promiseFactory();
      this.results[index] = result;
      resolve(result);
    } catch (error) {
      this.errors[index] = error;
      reject(error);
    }
  }
  
  // Get current pool statistics
  getStats() {
    return {
      running: this.running.size,
      queued: this.queue.length,
      concurrency: this.concurrency,
      completed: this.results.filter(r => r !== undefined).length,
      failed: this.errors.filter(e => e !== undefined).length
    };
  }
  
  // Clear the pool
  clear() {
    this.queue = [];
    this.results = [];
    this.errors = [];
  }
}

// =======================
// Approach 3: Throttled Promise Execution
// =======================

/**
 * Promise throttling with rate limiting
 * Controls the rate of promise execution (e.g., API rate limits)
 */
class PromiseThrottler {
  constructor(requestsPerSecond = 5, burstSize = 10) {
    this.requestsPerSecond = requestsPerSecond;
    this.burstSize = burstSize;
    this.tokens = burstSize; // Current available tokens
    this.lastRefill = Date.now();
    this.queue = [];
    this.processing = false;
  }
  
  // Add promise to throttled execution
  throttle(promiseFactory) {
    return new Promise((resolve, reject) => {
      this.queue.push({ promiseFactory, resolve, reject });
      this.process();
    });
  }
  
  // Process the throttled queue
  async process() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      // Refill tokens based on elapsed time
      this.refillTokens();
      
      if (this.tokens < 1) {
        // Wait until we have tokens
        const waitTime = (1 - this.tokens) * (1000 / this.requestsPerSecond);
        await this.delay(waitTime);
        continue;
      }
      
      // Consume token and execute promise
      this.tokens--;
      const { promiseFactory, resolve, reject } = this.queue.shift();
      
      try {
        const result = await promiseFactory();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
  
  // Refill tokens based on time elapsed
  refillTokens() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.requestsPerSecond;
    
    this.tokens = Math.min(this.burstSize, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
  
  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Get current throttler state
  getState() {
    this.refillTokens();
    return {
      tokens: this.tokens,
      queued: this.queue.length,
      requestsPerSecond: this.requestsPerSecond,
      burstSize: this.burstSize
    };
  }
}

// =======================
// Approach 4: Advanced Batch Processor with Retry
// =======================

/**
 * Advanced batch processor with retry logic and error handling
 * Handles failures gracefully and provides detailed results
 */
class AdvancedBatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 5;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.continueOnError = options.continueOnError !== false;
    this.onBatchComplete = options.onBatchComplete || null;
    this.onProgress = options.onProgress || null;
  }
  
  // Process promises with advanced error handling
  async process(promiseFactories) {
    const totalItems = promiseFactories.length;
    const results = new Array(totalItems);
    const errors = new Array(totalItems);
    let completed = 0;
    let failed = 0;
    
    // Process in batches
    for (let i = 0; i < totalItems; i += this.batchSize) {
      const batchEnd = Math.min(i + this.batchSize, totalItems);
      const batch = promiseFactories.slice(i, batchEnd);
      
      console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(totalItems / this.batchSize)}`);
      
      // Process batch with retry logic
      const batchResults = await this.processBatch(batch, i);
      
      // Store results
      batchResults.forEach((result, index) => {
        const globalIndex = i + index;
        if (result.success) {
          results[globalIndex] = result.value;
          completed++;
        } else {
          errors[globalIndex] = result.error;
          failed++;
        }
      });
      
      // Report progress
      if (this.onProgress) {
        this.onProgress({
          completed,
          failed,
          total: totalItems,
          progress: (completed + failed) / totalItems
        });
      }
      
      // Report batch completion
      if (this.onBatchComplete) {
        this.onBatchComplete({
          batchIndex: Math.floor(i / this.batchSize),
          batchResults,
          totalCompleted: completed,
          totalFailed: failed
        });
      }
    }
    
    return {
      results,
      errors,
      stats: {
        total: totalItems,
        completed,
        failed,
        successRate: completed / totalItems
      }
    };
  }
  
  // Process a single batch with retry logic
  async processBatch(batch, startIndex) {
    const batchResults = [];
    
    for (let i = 0; i < batch.length; i++) {
      const promiseFactory = batch[i];
      let retries = 0;
      let success = false;
      let result = null;
      let error = null;
      
      // Retry logic
      while (retries <= this.maxRetries && !success) {
        try {
          result = await promiseFactory();
          success = true;
        } catch (err) {
          error = err;
          retries++;
          
          if (retries <= this.maxRetries) {
            console.log(`Retrying item ${startIndex + i} (attempt ${retries}/${this.maxRetries})`);
            await this.delay(this.retryDelay * retries); // Exponential backoff
          }
        }
      }
      
      batchResults.push({
        success,
        value: result,
        error: error,
        retries: retries - 1,
        index: startIndex + i
      });
      
      // Stop processing if error and not continuing on error
      if (!success && !this.continueOnError) {
        throw new Error(`Batch processing failed at item ${startIndex + i}: ${error.message}`);
      }
    }
    
    return batchResults;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =======================
// Approach 5: Streaming Promise Processor
// =======================

/**
 * Streaming processor for handling large datasets
 * Processes promises as they become available without waiting for batches
 */
class StreamingPromiseProcessor {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 5;
    this.highWaterMark = options.highWaterMark || 50;
    this.onData = options.onData || null;
    this.onError = options.onError || null;
    this.onEnd = options.onEnd || null;
    
    this.running = new Set();
    this.buffer = [];
    this.processed = 0;
    this.errors = 0;
    this.paused = false;
  }
  
  // Add promise to the stream
  write(promiseFactory) {
    if (this.buffer.length >= this.highWaterMark) {
      this.paused = true;
      return false; // Backpressure signal
    }
    
    this.buffer.push(promiseFactory);
    this.process();
    return true;
  }
  
  // Signal end of input
  end() {
    this.endCalled = true;
    this.checkCompletion();
  }
  
  // Process the stream
  process() {
    while (this.running.size < this.concurrency && this.buffer.length > 0) {
      const promiseFactory = this.buffer.shift();
      
      const promise = this.executePromise(promiseFactory);
      this.running.add(promise);
      
      promise.finally(() => {
        this.running.delete(promise);
        
        // Resume if we were paused due to backpressure
        if (this.paused && this.buffer.length < this.highWaterMark / 2) {
          this.paused = false;
        }
        
        this.process();
        this.checkCompletion();
      });
    }
  }
  
  // Execute a single promise
  async executePromise(promiseFactory) {
    try {
      const result = await promiseFactory();
      this.processed++;
      
      if (this.onData) {
        this.onData(result, this.processed - 1);
      }
    } catch (error) {
      this.errors++;
      
      if (this.onError) {
        this.onError(error, this.errors - 1);
      }
    }
  }
  
  // Check if processing is complete
  checkCompletion() {
    if (this.endCalled && this.running.size === 0 && this.buffer.length === 0) {
      if (this.onEnd) {
        this.onEnd({
          processed: this.processed,
          errors: this.errors,
          total: this.processed + this.errors
        });
      }
    }
  }
  
  // Get current stream state
  getState() {
    return {
      running: this.running.size,
      buffered: this.buffer.length,
      processed: this.processed,
      errors: this.errors,
      paused: this.paused,
      ended: this.endCalled || false
    };
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Promise Batching Examples ===');

// Mock promise factory
function createMockPromise(id, delay = Math.random() * 100 + 50, shouldFail = false) {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail && Math.random() < 0.1) {
        reject(new Error(`Task ${id} failed`));
      } else {
        resolve(`Task ${id} completed`);
      }
    }, delay);
  });
}

// Test basic batching
async function testBasicBatching() {
  console.log('\n--- Testing Basic Batching ---');
  
  const tasks = Array.from({ length: 12 }, (_, i) => createMockPromise(i + 1));
  
  try {
    const results = await batchPromises(tasks, 3);
    console.log(`Completed ${results.length} tasks`);
  } catch (error) {
    console.log('Batching error:', error.message);
  }
}

// Test promise pool
async function testPromisePool() {
  console.log('\n--- Testing Promise Pool ---');
  
  const pool = new PromisePool(3);
  const tasks = Array.from({ length: 8 }, (_, i) => createMockPromise(i + 1, 200));
  
  console.log('Initial stats:', pool.getStats());
  
  try {
    await pool.addAll(tasks);
    console.log('Final stats:', pool.getStats());
  } catch (error) {
    console.log('Pool error:', error.message);
  }
}

// Test throttling
async function testThrottling() {
  console.log('\n--- Testing Promise Throttling ---');
  
  const throttler = new PromiseThrottler(3, 5); // 3 requests per second, burst of 5
  const tasks = Array.from({ length: 10 }, (_, i) => createMockPromise(i + 1, 50));
  
  const startTime = Date.now();
  
  const promises = tasks.map(task => throttler.throttle(task));
  await Promise.all(promises);
  
  const endTime = Date.now();
  console.log(`Throttled execution took ${endTime - startTime}ms`);
}

// Run tests
testBasicBatching();
testPromisePool();
testThrottling();

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Batch API Requests
 * Process large datasets by batching API requests
 */
function createAPIBatchProcessor(apiClient) {
  const processor = new AdvancedBatchProcessor({
    batchSize: 10,
    maxRetries: 3,
    retryDelay: 1000,
    continueOnError: true,
    onProgress: (progress) => {
      console.log(`API Progress: ${Math.round(progress.progress * 100)}% (${progress.completed}/${progress.total})`);
    }
  });
  
  return {
    // Process user data updates
    updateUsers: async (users) => {
      const updateFactories = users.map(user => 
        () => apiClient.updateUser(user.id, user.data)
      );
      
      return processor.process(updateFactories);
    },
    
    // Bulk data fetch
    fetchBulkData: async (ids) => {
      const fetchFactories = ids.map(id => 
        () => apiClient.fetchData(id)
      );
      
      return processor.process(fetchFactories);
    },
    
    // Process with custom batch size
    processCustom: async (promiseFactories, batchSize) => {
      const customProcessor = new AdvancedBatchProcessor({
        batchSize,
        maxRetries: 2,
        continueOnError: true
      });
      
      return customProcessor.process(promiseFactories);
    }
  };
}

/**
 * Use Case 2: File Processing Pipeline
 * Process files with controlled concurrency and error handling
 */
function createFileProcessor() {
  // Mock file operations
  const mockFileOperations = {
    readFile: (filename) => new Promise(resolve => {
      setTimeout(() => resolve(`Content of ${filename}`), Math.random() * 100 + 50);
    }),
    
    processFile: (content) => new Promise(resolve => {
      setTimeout(() => resolve(`Processed: ${content}`), Math.random() * 200 + 100);
    }),
    
    saveFile: (filename, content) => new Promise(resolve => {
      setTimeout(() => resolve(`Saved ${filename}`), Math.random() * 150 + 75);
    })
  };
  
  const pool = new PromisePool(5); // Process 5 files concurrently
  
  return {
    // Process multiple files through the pipeline
    processFiles: async (filenames) => {
      const filePromises = filenames.map(filename => 
        () => this.processFile(filename)
      );
      
      return pool.addAll(filePromises);
    },
    
    // Process a single file through the full pipeline
    processFile: async (filename) => {
      try {
        console.log(`Starting processing of ${filename}`);
        
        // Read file
        const content = await mockFileOperations.readFile(filename);
        
        // Process content
        const processed = await mockFileOperations.processFile(content);
        
        // Save processed file
        const result = await mockFileOperations.saveFile(
          `processed_${filename}`, 
          processed
        );
        
        console.log(`Completed processing of ${filename}`);
        return result;
      } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
        throw error;
      }
    },
    
    // Get processing statistics
    getStats: () => pool.getStats()
  };
}

/**
 * Use Case 3: Database Migration with Batching
 * Migrate large datasets with controlled batch sizes
 */
function createMigrationTool() {
  return {
    // Migrate records in batches
    migrateRecords: async (records, transformer, targetTable) => {
      const processor = new AdvancedBatchProcessor({
        batchSize: 100,
        maxRetries: 2,
        retryDelay: 2000,
        onBatchComplete: (info) => {
          console.log(`Migrated batch ${info.batchIndex + 1}, ${info.totalCompleted} total records`);
        }
      });
      
      const migrationFactories = records.map(record => 
        async () => {
          // Transform record
          const transformed = await transformer(record);
          
          // Insert into target table
          return this.insertRecord(targetTable, transformed);
        }
      );
      
      return processor.process(migrationFactories);
    },
    
    // Mock record insertion
    insertRecord: async (table, record) => {
      // Simulate database insertion
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 25));
      
      if (Math.random() < 0.05) { // 5% failure rate
        throw new Error(`Failed to insert record into ${table}`);
      }
      
      return { id: Math.random().toString(36), table, inserted: true };
    },
    
    // Migrate with custom strategy
    migrateWithStrategy: async (records, strategy) => {
      switch (strategy.type) {
        case 'batch':
          return this.migrateRecords(records, strategy.transformer, strategy.targetTable);
          
        case 'stream':
          return this.streamMigration(records, strategy.transformer, strategy.targetTable);
          
        case 'throttled':
          return this.throttledMigration(records, strategy.transformer, strategy.targetTable);
          
        default:
          throw new Error(`Unknown migration strategy: ${strategy.type}`);
      }
    },
    
    // Streaming migration
    streamMigration: (records, transformer, targetTable) => {
      return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        
        const stream = new StreamingPromiseProcessor({
          concurrency: 10,
          highWaterMark: 50,
          onData: (result) => results.push(result),
          onError: (error) => errors.push(error),
          onEnd: (stats) => {
            resolve({ results, errors, stats });
          }
        });
        
        // Add all records to stream
        records.forEach(record => {
          stream.write(async () => {
            const transformed = await transformer(record);
            return this.insertRecord(targetTable, transformed);
          });
        });
        
        stream.end();
      });
    },
    
    // Throttled migration (for rate-limited APIs)
    throttledMigration: async (records, transformer, targetTable) => {
      const throttler = new PromiseThrottler(5, 20); // 5 per second, burst 20
      
      const promises = records.map(record => 
        throttler.throttle(async () => {
          const transformed = await transformer(record);
          return this.insertRecord(targetTable, transformed);
        })
      );
      
      return Promise.allSettled(promises);
    }
  };
}

/**
 * Use Case 4: Web Scraping with Rate Limiting
 * Scrape websites with respectful rate limiting
 */
function createWebScraper() {
  const throttler = new PromiseThrottler(2, 5); // 2 requests per second, burst 5
  
  // Mock scraping function
  const scrapeURL = async (url) => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    if (Math.random() < 0.1) {
      throw new Error(`Failed to scrape ${url}`);
    }
    
    return {
      url,
      title: `Title from ${url}`,
      content: `Content from ${url}`,
      timestamp: Date.now()
    };
  };
  
  return {
    // Scrape multiple URLs with rate limiting
    scrapeURLs: async (urls) => {
      console.log(`Starting to scrape ${urls.length} URLs`);
      
      const scrapePromises = urls.map(url => 
        throttler.throttle(() => scrapeURL(url))
      );
      
      const results = await Promise.allSettled(scrapePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');
      
      console.log(`Scraping completed: ${successful.length} successful, ${failed.length} failed`);
      
      return {
        successful: successful.map(r => r.value),
        failed: failed.map(r => r.reason),
        stats: {
          total: urls.length,
          successful: successful.length,
          failed: failed.length,
          successRate: successful.length / urls.length
        }
      };
    },
    
    // Get throttler state
    getThrottlerState: () => throttler.getState()
  };
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===');
  
  // Mock API client
  const mockAPIClient = {
    updateUser: (id, data) => new Promise(resolve => 
      setTimeout(() => resolve({ id, updated: true, data }), Math.random() * 100 + 50)
    ),
    fetchData: (id) => new Promise(resolve => 
      setTimeout(() => resolve({ id, data: `Data for ${id}` }), Math.random() * 200 + 100)
    )
  };
  
  // Test API batch processor
  const apiBatcher = createAPIBatchProcessor(mockAPIClient);
  const users = Array.from({ length: 25 }, (_, i) => ({ 
    id: i + 1, 
    data: { name: `User ${i + 1}`, updated: true } 
  }));
  
  try {
    const apiResult = await apiBatcher.updateUsers(users);
    console.log(`API batch result: ${apiResult.stats.completed}/${apiResult.stats.total} successful`);
  } catch (error) {
    console.log('API batch error:', error.message);
  }
  
  // Test file processor
  const fileProcessor = createFileProcessor();
  const filenames = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt'];
  
  try {
    await fileProcessor.processFiles(filenames);
    console.log('File processing stats:', fileProcessor.getStats());
  } catch (error) {
    console.log('File processing error:', error.message);
  }
  
  // Test web scraper
  const scraper = createWebScraper();
  const urls = [
    'https://example.com/page1',
    'https://example.com/page2', 
    'https://example.com/page3',
    'https://example.com/page4',
    'https://example.com/page5'
  ];
  
  const scrapeResult = await scraper.scrapeURLs(urls);
  console.log('Scraping results:', scrapeResult.stats);
  
}, 3000);

// Export all implementations
module.exports = {
  batchPromises,
  PromisePool,
  PromiseThrottler,
  AdvancedBatchProcessor,
  StreamingPromiseProcessor,
  createAPIBatchProcessor,
  createFileProcessor,
  createMigrationTool,
  createWebScraper
};

/**
 * Key Interview Points:
 * 
 * 1. Batching vs Pooling:
 *    - Batching: Process fixed groups sequentially
 *    - Pooling: Maintain constant concurrency level
 *    - Pooling is more efficient for continuous workloads
 * 
 * 2. Concurrency Control:
 *    - Prevents resource exhaustion (memory, connections)
 *    - Respects rate limits and API constraints
 *    - Improves system stability under load
 * 
 * 3. Error Handling Strategies:
 *    - Fail fast: Stop on first error
 *    - Continue on error: Process all, collect errors
 *    - Retry with backoff: Handle transient failures
 * 
 * 4. Backpressure Management:
 *    - Queue size limits to prevent memory issues
 *    - Pause/resume mechanisms for flow control
 *    - Buffer management in streaming scenarios
 * 
 * 5. Rate Limiting Techniques:
 *    - Token bucket algorithm for burst handling
 *    - Time-based throttling for API limits
 *    - Adaptive throttling based on response times
 * 
 * 6. Real-world Applications:
 *    - API request batching
 *    - File processing pipelines
 *    - Database migrations
 *    - Web scraping with rate limits
 *    - Image processing workflows
 * 
 * 7. Performance Considerations:
 *    - Memory usage with large queues
 *    - CPU utilization with high concurrency
 *    - Network resource management
 *    - Error recovery overhead
 */