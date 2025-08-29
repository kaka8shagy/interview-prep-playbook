/**
 * File: async-coordination.js
 * Description: Async task coordination patterns - series, parallel, and race implementations
 * 
 * Learning objectives:
 * - Master async task coordination patterns
 * - Understand concurrency vs parallelism concepts  
 * - Learn error handling strategies in async operations
 * 
 * Time Complexity: Varies by pattern - documented per function
 * Space Complexity: O(n) where n is number of tasks
 */

// =======================
// Approach 1: Series Execution (Sequential)
// =======================

/**
 * Execute async tasks one after another (sequential execution)
 * Each task waits for the previous one to complete
 * 
 * Time Complexity: O(sum of all task times)
 * Use cases: Tasks that depend on each other, rate limiting APIs
 */
async function asyncSeries(tasks) {
  // Input validation
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  const results = [];
  
  // Execute tasks sequentially using for...of
  // This ensures each task completes before starting the next
  for (const [index, task] of tasks.entries()) {
    try {
      // Each task can be a function or a promise
      const result = typeof task === 'function' ? await task() : await task;
      results.push({ index, status: 'fulfilled', value: result });
    } catch (error) {
      results.push({ index, status: 'rejected', reason: error });
      
      // By default, continue with remaining tasks
      // Set breakOnError: true to stop on first error
    }
  }
  
  return results;
}

/**
 * Series execution with enhanced error handling and control
 * Provides options for error handling, result transformation, and progress tracking
 */
async function asyncSeriesAdvanced(tasks, options = {}) {
  const {
    breakOnError = false,          // Stop execution on first error
    transform = null,              // Transform each result
    onProgress = null,             // Progress callback
    timeout = null,                // Timeout for each task
    concurrency = 1                // Allow limited concurrency
  } = options;
  
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  const results = [];
  const errors = [];
  
  // For true series (concurrency = 1), process sequentially
  if (concurrency === 1) {
    for (let i = 0; i < tasks.length; i++) {
      try {
        const task = tasks[i];
        
        // Apply timeout if specified
        let taskPromise = typeof task === 'function' ? task() : task;
        
        if (timeout) {
          taskPromise = Promise.race([
            taskPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Task ${i} timed out`)), timeout)
            )
          ]);
        }
        
        const result = await taskPromise;
        
        // Apply transform if provided
        const finalResult = transform ? transform(result, i) : result;
        results.push(finalResult);
        
        // Call progress callback
        if (onProgress) {
          onProgress({ completed: i + 1, total: tasks.length, result: finalResult });
        }
        
      } catch (error) {
        errors.push({ index: i, error });
        
        if (breakOnError) {
          throw new Error(`Task ${i} failed: ${error.message}`);
        }
        
        // Push undefined for failed tasks
        results.push(undefined);
      }
    }
  } else {
    // Limited concurrency - process in batches
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map((task, batchIndex) => {
          const actualIndex = i + batchIndex;
          let taskPromise = typeof task === 'function' ? task() : task;
          
          if (timeout) {
            taskPromise = Promise.race([
              taskPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Task ${actualIndex} timed out`)), timeout)
              )
            ]);
          }
          
          return taskPromise;
        })
      );
      
      // Process batch results
      batchResults.forEach((result, batchIndex) => {
        const actualIndex = i + batchIndex;
        
        if (result.status === 'fulfilled') {
          const finalResult = transform ? transform(result.value, actualIndex) : result.value;
          results.push(finalResult);
          
          if (onProgress) {
            onProgress({ completed: actualIndex + 1, total: tasks.length, result: finalResult });
          }
        } else {
          errors.push({ index: actualIndex, error: result.reason });
          results.push(undefined);
          
          if (breakOnError) {
            throw new Error(`Task ${actualIndex} failed: ${result.reason.message}`);
          }
        }
      });
    }
  }
  
  return { results, errors, success: errors.length === 0 };
}

// =======================
// Approach 2: Parallel Execution
// =======================

/**
 * Execute async tasks in parallel (all at once)
 * All tasks start immediately, results collected when all complete
 * 
 * Time Complexity: O(max task time) - limited by slowest task
 * Use cases: Independent tasks, maximum throughput
 */
async function asyncParallel(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  // Convert tasks to promises and execute all simultaneously
  const promises = tasks.map((task, index) => {
    const promise = typeof task === 'function' ? task() : task;
    
    // Wrap each promise to capture index and handle errors
    return promise
      .then(result => ({ index, status: 'fulfilled', value: result }))
      .catch(error => ({ index, status: 'rejected', reason: error }));
  });
  
  // Wait for all promises to complete (either fulfilled or rejected)
  return Promise.all(promises);
}

/**
 * Controlled parallel execution with concurrency limiting
 * Prevents overwhelming system resources with too many concurrent operations
 */
async function asyncParallelLimited(tasks, concurrency = 3) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  if (concurrency < 1) {
    throw new Error('Concurrency must be at least 1');
  }
  
  const results = new Array(tasks.length);
  const executing = new Set();
  
  // Process all tasks with concurrency limit
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    // Create promise for this task
    const taskPromise = (async (index) => {
      try {
        const result = typeof task === 'function' ? await task() : await task;
        results[index] = { index, status: 'fulfilled', value: result };
      } catch (error) {
        results[index] = { index, status: 'rejected', reason: error };
      }
    })(i);
    
    executing.add(taskPromise);
    
    // Remove from executing set when done
    taskPromise.finally(() => executing.delete(taskPromise));
    
    // If we hit concurrency limit, wait for any task to complete
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  // Wait for all remaining tasks to complete
  await Promise.all(executing);
  
  return results;
}

// =======================
// Approach 3: Race Execution
// =======================

/**
 * Execute tasks in parallel but return as soon as first one completes
 * Useful for timeout patterns, redundant requests, or getting fastest result
 * 
 * Time Complexity: O(min task time) - limited by fastest task
 */
async function asyncRace(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  if (tasks.length === 0) {
    throw new Error('Cannot race empty array');
  }
  
  // Convert tasks to promises
  const promises = tasks.map((task, index) => {
    const promise = typeof task === 'function' ? task() : task;
    
    // Add index to result for identification
    return promise.then(
      result => ({ index, status: 'fulfilled', value: result }),
      error => Promise.reject({ index, status: 'rejected', reason: error })
    );
  });
  
  // Return first completed (fulfilled or rejected)
  return Promise.race(promises);
}

/**
 * Race with all results - get first success but continue others in background
 * Useful when you want the fastest result but also want all results eventually
 */
async function asyncRaceWithAll(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  const promises = tasks.map((task, index) => {
    const promise = typeof task === 'function' ? task() : task;
    return promise.then(
      result => ({ index, status: 'fulfilled', value: result }),
      error => ({ index, status: 'rejected', reason: error })
    );
  });
  
  // Get first result
  const firstResult = await Promise.race(promises);
  
  // Continue collecting all results in background
  const allResultsPromise = Promise.all(promises);
  
  return {
    first: firstResult,
    all: allResultsPromise // This can be awaited later if needed
  };
}

// =======================
// Approach 4: Advanced Coordination Patterns
// =======================

/**
 * Waterfall pattern - each task receives result from previous task
 * Like series but passes results between tasks
 */
async function asyncWaterfall(tasks, initialValue) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('Expected an array of tasks');
  }
  
  let result = initialValue;
  
  for (const [index, task] of tasks.entries()) {
    try {
      if (typeof task === 'function') {
        result = await task(result);
      } else {
        throw new Error(`Task at index ${index} must be a function for waterfall`);
      }
    } catch (error) {
      throw new Error(`Waterfall failed at task ${index}: ${error.message}`);
    }
  }
  
  return result;
}

/**
 * Map-Reduce pattern for async operations
 * Map phase processes all items in parallel, reduce phase combines results
 */
async function asyncMapReduce(items, mapFn, reduceFn, initialValue, concurrency = 3) {
  if (!Array.isArray(items)) {
    throw new TypeError('Expected an array of items');
  }
  
  // Map phase - process all items with limited concurrency
  const mapTasks = items.map(item => () => mapFn(item));
  const mapResults = await asyncParallelLimited(mapTasks, concurrency);
  
  // Extract successful results
  const successfulResults = mapResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
  
  // Reduce phase - combine results sequentially
  if (!reduceFn) {
    return successfulResults;
  }
  
  let accumulator = initialValue;
  
  for (const result of successfulResults) {
    accumulator = await reduceFn(accumulator, result);
  }
  
  return accumulator;
}

/**
 * Circuit breaker pattern for async operations
 * Prevents cascading failures by stopping execution after threshold failures
 */
class AsyncCircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  async execute(task) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await task();
      
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 3) {
          this.state = 'CLOSED';
          this.failureCount = 0;
        }
      }
      
      return result;
      
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }
      
      throw error;
    }
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Series Execution Examples ===');

// Create sample async tasks
const createTask = (name, delay, shouldFail = false) => {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`Task ${name} failed`));
      } else {
        resolve(`Task ${name} completed`);
      }
    }, delay);
  });
};

const seriesTasks = [
  createTask('A', 100),
  createTask('B', 200),
  createTask('C', 150)
];

asyncSeries(seriesTasks)
  .then(results => console.log('Series results:', results))
  .catch(error => console.error('Series error:', error));

console.log('\n=== Parallel Execution Examples ===');

const parallelTasks = [
  createTask('X', 300),
  createTask('Y', 100),
  createTask('Z', 200)
];

asyncParallel(parallelTasks)
  .then(results => console.log('Parallel results:', results))
  .catch(error => console.error('Parallel error:', error));

console.log('\n=== Race Execution Examples ===');

const raceTasks = [
  createTask('Fast', 100),
  createTask('Medium', 200),
  createTask('Slow', 300)
];

asyncRace(raceTasks)
  .then(result => console.log('Race winner:', result))
  .catch(error => console.error('Race error:', error));

console.log('\n=== Advanced Patterns ===');

// Waterfall example
const waterfallTasks = [
  (value) => Promise.resolve(value * 2),
  (value) => Promise.resolve(value + 10),
  (value) => Promise.resolve(value.toString())
];

asyncWaterfall(waterfallTasks, 5)
  .then(result => console.log('Waterfall result:', result)) // "20"
  .catch(error => console.error('Waterfall error:', error));

// Map-Reduce example
const numbers = [1, 2, 3, 4, 5];
const mapFn = async (num) => {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 50));
  return num * num;
};

const reduceFn = async (acc, value) => {
  return acc + value;
};

asyncMapReduce(numbers, mapFn, reduceFn, 0, 2)
  .then(result => console.log('Map-Reduce result:', result)) // Sum of squares
  .catch(error => console.error('Map-Reduce error:', error));

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: API data aggregation
 * Fetch data from multiple APIs and combine results
 */
async function aggregateUserData(userId) {
  const tasks = [
    () => fetchUserProfile(userId),
    () => fetchUserPosts(userId),
    () => fetchUserFriends(userId)
  ];
  
  // Use parallel execution for independent API calls
  const results = await asyncParallel(tasks);
  
  // Combine successful results
  const aggregatedData = {
    profile: null,
    posts: [],
    friends: []
  };
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      switch (index) {
        case 0: aggregatedData.profile = result.value; break;
        case 1: aggregatedData.posts = result.value; break;
        case 2: aggregatedData.friends = result.value; break;
      }
    }
  });
  
  return aggregatedData;
}

// Mock API functions
async function fetchUserProfile(userId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
}

async function fetchUserPosts(userId) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [`Post 1 by ${userId}`, `Post 2 by ${userId}`];
}

async function fetchUserFriends(userId) {
  await new Promise(resolve => setTimeout(resolve, 250));
  return [`Friend 1 of ${userId}`, `Friend 2 of ${userId}`];
}

/**
 * Use Case 2: Database migration with progress tracking
 * Process large datasets in batches with progress reporting
 */
async function migrateDatabase(records, batchSize = 100) {
  const batches = [];
  
  // Split records into batches
  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }
  
  // Process batches in series with progress tracking
  const results = await asyncSeriesAdvanced(
    batches.map(batch => () => processBatch(batch)),
    {
      onProgress: ({ completed, total, result }) => {
        const percentage = Math.round((completed / total) * 100);
        console.log(`Migration progress: ${percentage}% (${completed}/${total} batches)`);
      },
      timeout: 30000, // 30 second timeout per batch
      transform: (result, index) => ({
        batchIndex: index,
        recordsProcessed: result.length,
        timestamp: new Date()
      })
    }
  );
  
  return results;
}

async function processBatch(records) {
  // Simulate database processing
  await new Promise(resolve => setTimeout(resolve, 100 * records.length));
  return records.map(record => ({ ...record, migrated: true }));
}

/**
 * Use Case 3: Redundant request handling
 * Make same request to multiple servers, use fastest response
 */
async function fetchWithRedundancy(url, servers = ['server1.com', 'server2.com', 'server3.com']) {
  const tasks = servers.map(server => 
    () => fetch(`https://${server}${url}`).then(res => res.json())
  );
  
  // Race for fastest response, but continue others in background
  const raceResult = await asyncRaceWithAll(tasks);
  
  console.log(`Fastest response from server index: ${raceResult.first.index}`);
  
  // Optionally wait for all responses for caching/analysis
  raceResult.all.then(allResults => {
    console.log('All server responses received');
  });
  
  return raceResult.first.value;
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

aggregateUserData(123)
  .then(data => console.log('Aggregated user data:', data))
  .catch(error => console.error('Aggregation error:', error));

// Mock records for migration
const mockRecords = Array.from({ length: 50 }, (_, i) => ({ id: i, data: `Record ${i}` }));

migrateDatabase(mockRecords, 10)
  .then(result => console.log('Migration completed:', result.results.length, 'batches'))
  .catch(error => console.error('Migration error:', error));

// Circuit breaker example
const circuitBreaker = new AsyncCircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 5000
});

async function unreliableTask() {
  // 60% chance of failure
  if (Math.random() > 0.4) {
    throw new Error('Task failed');
  }
  return 'Success';
}

// Test circuit breaker
for (let i = 0; i < 10; i++) {
  setTimeout(async () => {
    try {
      const result = await circuitBreaker.execute(unreliableTask);
      console.log(`Attempt ${i + 1}: ${result}`);
    } catch (error) {
      console.log(`Attempt ${i + 1}: ${error.message}`);
    }
  }, i * 1000);
}

// Export all implementations
module.exports = {
  asyncSeries,
  asyncSeriesAdvanced,
  asyncParallel,
  asyncParallelLimited,
  asyncRace,
  asyncRaceWithAll,
  asyncWaterfall,
  asyncMapReduce,
  AsyncCircuitBreaker,
  aggregateUserData,
  migrateDatabase
};

/**
 * Key Interview Points:
 * 
 * 1. Coordination Patterns:
 *    - Series: Sequential execution, tasks depend on each other
 *    - Parallel: Maximum concurrency, independent tasks
 *    - Race: First result wins, redundancy/timeout scenarios
 *    - Waterfall: Data flows between tasks
 * 
 * 2. Error Handling Strategies:
 *    - Fail-fast: Stop on first error
 *    - Continue: Collect all results including errors
 *    - Circuit breaker: Prevent cascading failures
 *    - Retry with backoff: Handle transient failures
 * 
 * 3. Performance Considerations:
 *    - Concurrency limiting to prevent resource exhaustion
 *    - Batch processing for large datasets
 *    - Progress tracking for long operations
 *    - Timeout handling for hung operations
 * 
 * 4. Memory Management:
 *    - Streaming for large datasets
 *    - Cleanup of pending promises
 *    - Avoiding memory leaks in long-running operations
 * 
 * 5. Real-world Applications:
 *    - API aggregation and data fetching
 *    - Database migrations and bulk operations  
 *    - Redundant requests and failover
 *    - Rate limiting and backpressure handling
 */