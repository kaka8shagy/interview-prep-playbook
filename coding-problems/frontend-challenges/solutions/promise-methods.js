/**
 * File: promise-methods.js
 * Description: Implementation of all Promise static methods (all, race, allSettled, any)
 * 
 * Learning objectives:
 * - Understand Promise concurrency patterns
 * - Learn different error handling strategies
 * - See proper async/await implementation patterns
 * 
 * Time Complexity: O(n) where n is number of promises
 * Space Complexity: O(n) for result storage
 */

// =======================
// Promise.all Implementation
// =======================

/**
 * Custom implementation of Promise.all
 * Resolves when all promises resolve, rejects on first rejection
 * 
 * Mental model: "All or nothing" - if any promise fails, the whole operation fails
 */
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Handle empty array case
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.all expects an iterable'));
      return;
    }
    
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results = new Array(promises.length);
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      // Ensure we're working with a promise
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completedCount++;
          
          // Check if all promises have completed
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          // First rejection immediately rejects the whole operation
          reject(error);
        });
    });
  });
}

// =======================
// Promise.race Implementation
// =======================

/**
 * Custom implementation of Promise.race
 * Resolves/rejects with the first promise that settles
 * 
 * Mental model: "First past the post" - first promise to finish wins
 */
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.race expects an iterable'));
      return;
    }
    
    if (promises.length === 0) {
      // Race with empty array never settles
      return;
    }
    
    promises.forEach(promise => {
      // The first promise to settle (resolve or reject) wins
      Promise.resolve(promise)
        .then(resolve) // Forward resolution
        .catch(reject); // Forward rejection
    });
  });
}

// =======================
// Promise.allSettled Implementation
// =======================

/**
 * Custom implementation of Promise.allSettled
 * Always resolves with array of settlement results (fulfilled/rejected)
 * 
 * Mental model: "Everyone gets a say" - wait for all promises regardless of outcome
 */
function promiseAllSettled(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.allSettled expects an iterable'));
      return;
    }
    
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results = new Array(promises.length);
    let settledCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          // Promise fulfilled
          results[index] = {
            status: 'fulfilled',
            value: value
          };
        })
        .catch(reason => {
          // Promise rejected
          results[index] = {
            status: 'rejected',
            reason: reason
          };
        })
        .finally(() => {
          settledCount++;
          
          // When all promises have settled, resolve with results
          if (settledCount === promises.length) {
            resolve(results);
          }
        });
    });
  });
}

// =======================
// Promise.any Implementation
// =======================

/**
 * Custom implementation of Promise.any
 * Resolves with first fulfilled promise, rejects only if all promises reject
 * 
 * Mental model: "Anyone can win" - first success wins, only fail if everyone fails
 */
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.any expects an iterable'));
      return;
    }
    
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }
    
    const errors = new Array(promises.length);
    let rejectedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          // First fulfillment wins immediately
          resolve(value);
        })
        .catch(reason => {
          errors[index] = reason;
          rejectedCount++;
          
          // Only reject if all promises have been rejected
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
}

// =======================
// Advanced Implementations with Timeout Support
// =======================

/**
 * Promise.all with timeout - rejects if not all promises resolve within timeout
 */
function promiseAllWithTimeout(promises, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise.all timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return promiseRace([promiseAll(promises), timeoutPromise]);
}

/**
 * Promise.race with timeout - provides default resolution if timeout exceeded
 */
function promiseRaceWithTimeout(promises, timeoutMs, defaultValue = null) {
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => {
      resolve(defaultValue);
    }, timeoutMs);
  });
  
  return promiseRace([...promises, timeoutPromise]);
}

// =======================
// Utility Promise Combinators
// =======================

/**
 * Promise.some - resolves when specified number of promises resolve
 */
function promiseSome(promises, count) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.some expects an iterable'));
      return;
    }
    
    if (count <= 0 || count > promises.length) {
      reject(new RangeError('Invalid count parameter'));
      return;
    }
    
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results = [];
    const errors = [];
    let settledCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results.push({ index, value });
          
          // Resolve when we have enough successful results
          if (results.length === count) {
            resolve(results.map(r => r.value));
          }
        })
        .catch(reason => {
          errors.push({ index, reason });
        })
        .finally(() => {
          settledCount++;
          
          // Check if it's impossible to get enough successes
          const remainingPromises = promises.length - settledCount;
          const neededSuccesses = count - results.length;
          
          if (neededSuccesses > remainingPromises) {
            reject(new AggregateError(
              errors.map(e => e.reason),
              `Cannot get ${count} successful results`
            ));
          }
        });
    });
  });
}

/**
 * Promise.map - applies async function to array with concurrency control
 */
function promiseMap(items, asyncFn, concurrency = Infinity) {
  if (concurrency <= 0) {
    throw new Error('Concurrency must be greater than 0');
  }
  
  if (concurrency >= items.length) {
    // No concurrency limit needed
    return promiseAll(items.map(asyncFn));
  }
  
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let nextIndex = 0;
    let completedCount = 0;
    let hasRejected = false;
    
    // Start initial batch
    const workers = Math.min(concurrency, items.length);
    for (let i = 0; i < workers; i++) {
      processNext();
    }
    
    function processNext() {
      if (hasRejected || nextIndex >= items.length) {
        return;
      }
      
      const currentIndex = nextIndex++;
      
      Promise.resolve(asyncFn(items[currentIndex], currentIndex))
        .then(result => {
          results[currentIndex] = result;
          completedCount++;
          
          if (completedCount === items.length) {
            resolve(results);
          } else {
            processNext(); // Process next item
          }
        })
        .catch(error => {
          hasRejected = true;
          reject(error);
        });
    }
  });
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Promise Methods Examples ===');

// Helper function to create test promises
function createTestPromise(value, delay, shouldReject = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) {
        reject(new Error(`Error: ${value}`));
      } else {
        resolve(value);
      }
    }, delay);
  });
}

// Test Promise.all
async function testPromiseAll() {
  console.log('\n--- Testing Promise.all ---');
  
  try {
    const promises = [
      createTestPromise('A', 100),
      createTestPromise('B', 50),
      createTestPromise('C', 150)
    ];
    
    const results = await promiseAll(promises);
    console.log('All resolved:', results); // ['A', 'B', 'C']
  } catch (error) {
    console.log('All rejected:', error.message);
  }
  
  // Test with rejection
  try {
    const promisesWithError = [
      createTestPromise('A', 100),
      createTestPromise('B', 50, true), // This will reject
      createTestPromise('C', 150)
    ];
    
    const results = await promiseAll(promisesWithError);
    console.log('All resolved (unexpected):', results);
  } catch (error) {
    console.log('All rejected (expected):', error.message);
  }
}

// Test Promise.race
async function testPromiseRace() {
  console.log('\n--- Testing Promise.race ---');
  
  const promises = [
    createTestPromise('Slow', 200),
    createTestPromise('Fast', 50),
    createTestPromise('Medium', 100)
  ];
  
  const winner = await promiseRace(promises);
  console.log('Race winner:', winner); // 'Fast'
}

// Test Promise.allSettled
async function testPromiseAllSettled() {
  console.log('\n--- Testing Promise.allSettled ---');
  
  const promises = [
    createTestPromise('Success', 100),
    createTestPromise('Failure', 50, true),
    createTestPromise('Another Success', 150)
  ];
  
  const results = await promiseAllSettled(promises);
  console.log('All settled results:', results);
}

// Test Promise.any
async function testPromiseAny() {
  console.log('\n--- Testing Promise.any ---');
  
  try {
    const promises = [
      createTestPromise('First', 200, true), // Reject
      createTestPromise('Second', 100),      // Resolve (winner)
      createTestPromise('Third', 50, true)   // Reject
    ];
    
    const result = await promiseAny(promises);
    console.log('Any resolved:', result); // 'Second'
  } catch (error) {
    console.log('Any rejected:', error.message);
  }
  
  // Test all rejections
  try {
    const allRejectPromises = [
      createTestPromise('First', 50, true),
      createTestPromise('Second', 100, true),
      createTestPromise('Third', 150, true)
    ];
    
    const result = await promiseAny(allRejectPromises);
    console.log('Any resolved (unexpected):', result);
  } catch (error) {
    console.log('Any all rejected (expected):', error.message);
  }
}

// Run tests
testPromiseAll();
testPromiseRace();
testPromiseAllSettled();
testPromiseAny();

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: API Data Aggregation
 * Fetch data from multiple APIs with different strategies
 */
function createAPIAggregator() {
  // Simulate API calls
  const apis = {
    users: () => createTestPromise(['user1', 'user2'], 100),
    posts: () => createTestPromise(['post1', 'post2'], 200),
    comments: () => createTestPromise(['comment1'], 150),
    analytics: () => createTestPromise({ views: 1000 }, 300)
  };
  
  return {
    // Get all data - fail if any API fails
    getAllData: async () => {
      const promises = Object.values(apis).map(api => api());
      return promiseAll(promises);
    },
    
    // Get data with fallbacks - continue even if some APIs fail
    getDataWithFallbacks: async () => {
      const promises = Object.entries(apis).map(([name, api]) =>
        api().catch(error => ({ error: error.message, source: name }))
      );
      return promiseAll(promises);
    },
    
    // Get fastest response
    getFastestData: async () => {
      const promises = Object.values(apis).map(api => api());
      return promiseRace(promises);
    },
    
    // Get all responses regardless of success/failure
    getAllResponses: async () => {
      const promises = Object.entries(apis).map(([name, api]) =>
        api().then(data => ({ name, data, success: true }))
            .catch(error => ({ name, error: error.message, success: false }))
      );
      return promiseAll(promises);
    }
  };
}

/**
 * Use Case 2: Batch Processing with Concurrency Control
 * Process items in batches with controlled concurrency
 */
function createBatchProcessor() {
  return {
    // Process all items with concurrency limit
    processBatch: async (items, processor, concurrency = 3) => {
      return promiseMap(items, processor, concurrency);
    },
    
    // Process items but stop on first error
    processAllOrNothing: async (items, processor) => {
      const promises = items.map(processor);
      return promiseAll(promises);
    },
    
    // Process items and get partial results
    processWithPartialResults: async (items, processor, minSuccesses = 1) => {
      const promises = items.map((item, index) =>
        processor(item).catch(error => ({ error, index, item }))
      );
      
      const results = await promiseAll(promises);
      const successes = results.filter(r => !r.error);
      const failures = results.filter(r => r.error);
      
      if (successes.length < minSuccesses) {
        throw new Error(`Not enough successes: ${successes.length} < ${minSuccesses}`);
      }
      
      return { successes, failures };
    },
    
    // Process items in waves
    processInWaves: async (items, processor, waveSize = 5) => {
      const results = [];
      
      for (let i = 0; i < items.length; i += waveSize) {
        const wave = items.slice(i, i + waveSize);
        const wavePromises = wave.map(processor);
        const waveResults = await promiseAllSettled(wavePromises);
        results.push(...waveResults);
      }
      
      return results;
    }
  };
}

/**
 * Use Case 3: Service Health Checker
 * Check multiple services and determine overall system health
 */
function createHealthChecker() {
  const services = [
    { name: 'database', check: () => createTestPromise('db-ok', 100) },
    { name: 'cache', check: () => createTestPromise('cache-ok', 50) },
    { name: 'api', check: () => createTestPromise('api-ok', 200) },
    { name: 'queue', check: () => createTestPromise('queue-ok', 150) }
  ];
  
  return {
    // All services must be healthy
    checkAllHealthy: async () => {
      const checks = services.map(s => s.check());
      await promiseAll(checks);
      return { status: 'healthy', timestamp: Date.now() };
    },
    
    // System is healthy if any critical service is up
    checkAnyHealthy: async (criticalServices = ['database', 'api']) => {
      const criticalChecks = services
        .filter(s => criticalServices.includes(s.name))
        .map(s => s.check());
      
      await promiseAny(criticalChecks);
      return { status: 'healthy', timestamp: Date.now() };
    },
    
    // Get detailed health report
    getDetailedHealth: async () => {
      const checks = services.map(s => 
        s.check()
          .then(result => ({ service: s.name, status: 'healthy', result }))
          .catch(error => ({ service: s.name, status: 'unhealthy', error: error.message }))
      );
      
      const results = await promiseAll(checks);
      const healthyCount = results.filter(r => r.status === 'healthy').length;
      
      return {
        overall: healthyCount >= services.length * 0.5 ? 'healthy' : 'unhealthy',
        services: results,
        healthyCount,
        totalCount: services.length,
        timestamp: Date.now()
      };
    },
    
    // Quick health check - return as soon as we know the status
    quickHealthCheck: async (timeout = 5000) => {
      const checks = services.map(s => s.check());
      
      try {
        await promiseRaceWithTimeout(checks, timeout, 'timeout');
        return { status: 'healthy', message: 'At least one service responded' };
      } catch (error) {
        return { status: 'unhealthy', message: 'No services responded in time' };
      }
    }
  };
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===');
  
  // API Aggregator
  const apiAgg = createAPIAggregator();
  try {
    const allData = await apiAgg.getAllData();
    console.log('API aggregation success:', allData.length, 'responses');
  } catch (error) {
    console.log('API aggregation failed:', error.message);
  }
  
  // Batch Processor
  const batchProcessor = createBatchProcessor();
  const items = [1, 2, 3, 4, 5];
  const processor = item => createTestPromise(`processed-${item}`, Math.random() * 100);
  
  try {
    const results = await batchProcessor.processBatch(items, processor, 2);
    console.log('Batch processing results:', results);
  } catch (error) {
    console.log('Batch processing failed:', error.message);
  }
  
  // Health Checker
  const healthChecker = createHealthChecker();
  try {
    const health = await healthChecker.getDetailedHealth();
    console.log('System health:', health.overall, `(${health.healthyCount}/${health.totalCount})`);
  } catch (error) {
    console.log('Health check failed:', error.message);
  }
}, 1000);

// Export all implementations
module.exports = {
  promiseAll,
  promiseRace,
  promiseAllSettled,
  promiseAny,
  promiseAllWithTimeout,
  promiseRaceWithTimeout,
  promiseSome,
  promiseMap,
  createAPIAggregator,
  createBatchProcessor,
  createHealthChecker
};

/**
 * Key Interview Points:
 * 
 * 1. Promise.all vs Promise.allSettled:
 *    - all: Fails fast on first rejection
 *    - allSettled: Always waits for all promises, never rejects
 * 
 * 2. Promise.race vs Promise.any:
 *    - race: First to settle (resolve OR reject) wins
 *    - any: First to resolve wins, only rejects if all reject
 * 
 * 3. Error Handling Strategies:
 *    - Fail fast: Promise.all, Promise.race (with rejection)
 *    - Partial success: Promise.allSettled, Promise.any
 *    - Custom handling: Wrapper promises with fallbacks
 * 
 * 4. Performance Considerations:
 *    - Concurrency control with Promise.map
 *    - Timeout handling to prevent hanging
 *    - Memory usage with large arrays of promises
 * 
 * 5. Real-world Patterns:
 *    - API aggregation with different strategies
 *    - Batch processing with controlled concurrency
 *    - Health checking systems
 *    - Retry mechanisms and circuit breakers
 */