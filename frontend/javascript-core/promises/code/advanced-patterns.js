/**
 * File: advanced-patterns.js
 * Description: Advanced Promise patterns including async/await, combinators, and complex flows
 * Time Complexity: Varies by pattern (noted per function)
 * Space Complexity: O(n) for collection operations, O(1) for individual patterns
 */

// Async/Await - Syntactic Sugar Over Promises
// Makes asynchronous code look and behave more like synchronous code

class AsyncAwaitPatterns {
  // Basic async/await usage with error handling
  static async basicAsyncFunction() {
    console.log('Starting async function...');
    
    try {
      // await pauses function execution until promise resolves
      const result1 = await new Promise(resolve => {
        setTimeout(() => resolve('First result'), 500);
      });
      console.log('Got first result:', result1);
      
      // Sequential execution - second await waits for first to complete
      const result2 = await new Promise(resolve => {
        setTimeout(() => resolve('Second result'), 300);
      });
      console.log('Got second result:', result2);
      
      return { result1, result2 };
    } catch (error) {
      console.error('Error in async function:', error.message);
      throw error; // Re-throw to allow caller to handle
    }
  }
  
  // Parallel execution with async/await
  // Time Complexity: O(1) - all promises execute simultaneously
  static async parallelExecution() {
    console.log('Starting parallel execution...');
    
    // Start all promises simultaneously (don't await immediately)
    const promise1 = new Promise(resolve => {
      setTimeout(() => resolve('Parallel 1'), 500);
    });
    const promise2 = new Promise(resolve => {
      setTimeout(() => resolve('Parallel 2'), 300);
    });
    const promise3 = new Promise(resolve => {
      setTimeout(() => resolve('Parallel 3'), 400);
    });
    
    // Now await all together - they're already running
    const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);
    
    console.log('All parallel results:', { result1, result2, result3 });
    return { result1, result2, result3 };
  }
  
  // Mixed serial and parallel patterns
  static async mixedExecutionPattern() {
    console.log('Starting mixed execution pattern...');
    
    // Step 1: Get user data (required for next steps)
    const userData = await new Promise(resolve => {
      setTimeout(() => resolve({ id: 123, name: 'John' }), 200);
    });
    console.log('Got user data:', userData);
    
    // Step 2: Parallel fetch of user-dependent data
    const [profile, posts, followers] = await Promise.all([
      new Promise(resolve => {
        setTimeout(() => resolve({ bio: 'Developer', location: 'NYC' }), 300);
      }),
      new Promise(resolve => {
        setTimeout(() => resolve(['Post 1', 'Post 2']), 250);
      }),
      new Promise(resolve => {
        setTimeout(() => resolve(150), 400);
      })
    ]);
    
    // Step 3: Process combined data
    const summary = {
      user: userData,
      profile,
      postCount: posts.length,
      followerCount: followers
    };
    
    console.log('Combined data summary:', summary);
    return summary;
  }
  
  // Error handling patterns in async/await
  static async errorHandlingPatterns() {
    // Pattern 1: Try-catch for multiple operations
    try {
      const result1 = await this.maybeFailingOperation(0.7); // 70% success rate
      const result2 = await this.maybeFailingOperation(0.8); // 80% success rate
      return { success: true, results: [result1, result2] };
    } catch (error) {
      console.log('Operation failed:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  // Helper for error handling demo
  static async maybeFailingOperation(successRate) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < successRate) {
          resolve(`Success with rate ${successRate}`);
        } else {
          reject(new Error(`Failed with rate ${successRate}`));
        }
      }, 100);
    });
  }
}

// Advanced Promise Combinators
// Time Complexity: O(n) where n is number of promises
class PromiseCombinators {
  // Promise.all with individual error handling
  static async allWithIndividualErrorHandling(promises) {
    // Wrap each promise to catch individual errors
    const wrappedPromises = promises.map(async (promise, index) => {
      try {
        const result = await promise;
        return { success: true, result, index };
      } catch (error) {
        return { success: false, error: error.message, index };
      }
    });
    
    // All wrapped promises will resolve (never reject)
    const results = await Promise.all(wrappedPromises);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return {
      successful: successful.map(r => r.result),
      failed: failed.map(r => ({ index: r.index, error: r.error })),
      hasFailures: failed.length > 0
    };
  }
  
  // Custom Promise.some - resolve when N promises succeed
  static async promiseSome(promises, count) {
    return new Promise((resolve, reject) => {
      if (count <= 0) {
        return resolve([]);
      }
      
      if (count > promises.length) {
        return reject(new Error(`Cannot get ${count} results from ${promises.length} promises`));
      }
      
      const results = [];
      const errors = [];
      let completed = 0;
      
      promises.forEach(async (promise, index) => {
        try {
          const result = await promise;
          results.push({ result, index });
          
          // Check if we have enough successful results
          if (results.length >= count) {
            resolve(results.map(r => r.result));
          }
        } catch (error) {
          errors.push({ error: error.message, index });
        }
        
        completed++;
        
        // Check if impossible to get enough successes
        const remaining = promises.length - completed;
        const neededSuccesses = count - results.length;
        
        if (remaining < neededSuccesses) {
          reject(new Error(`Cannot get ${count} successes. Only ${results.length} succeeded, ${remaining} remaining`));
        }
      });
    });
  }
  
  // Promise waterfall - sequential execution with result passing
  static async waterfall(functions) {
    let result;
    
    for (let i = 0; i < functions.length; i++) {
      const fn = functions[i];
      console.log(`Waterfall step ${i + 1}:`, result);
      
      // First function gets no arguments, subsequent get previous result
      result = await fn(result);
    }
    
    return result;
  }
  
  // Controlled concurrency - run promises with limited parallelism
  static async withConcurrency(promiseFactories, concurrencyLimit) {
    const results = [];
    const executing = [];
    
    for (let i = 0; i < promiseFactories.length; i++) {
      const factory = promiseFactories[i];
      
      // Create promise and add to results array at correct index
      const promise = factory().then(result => {
        results[i] = result;
        return result;
      });
      
      executing.push(promise);
      
      // If we've reached concurrency limit, wait for one to complete
      if (executing.length >= concurrencyLimit) {
        try {
          await Promise.race(executing);
        } catch (error) {
          // Handle error but continue with other promises
          console.error('Promise in concurrent batch failed:', error.message);
        }
        
        // Remove completed promises from executing array
        for (let j = executing.length - 1; j >= 0; j--) {
          if (await Promise.race([executing[j], Promise.resolve('pending')]) !== 'pending') {
            executing.splice(j, 1);
          }
        }
      }
    }
    
    // Wait for all remaining promises
    await Promise.all(executing);
    return results;
  }
}

// Promise Caching and Memoization Patterns
class PromiseCaching {
  constructor() {
    this.cache = new Map();
    this.pendingPromises = new Map(); // Prevent duplicate requests
  }
  
  // Memoize async function results
  memoizeAsync(fn, keyGenerator = (...args) => JSON.stringify(args)) {
    return async (...args) => {
      const key = keyGenerator(...args);
      
      // Return cached result if available
      if (this.cache.has(key)) {
        console.log(`Cache hit for key: ${key}`);
        return this.cache.get(key);
      }
      
      // If same request is already pending, return that promise
      if (this.pendingPromises.has(key)) {
        console.log(`Returning pending promise for key: ${key}`);
        return this.pendingPromises.get(key);
      }
      
      // Create new promise and cache it
      console.log(`Cache miss, creating new promise for key: ${key}`);
      const promise = fn(...args);
      this.pendingPromises.set(key, promise);
      
      try {
        const result = await promise;
        this.cache.set(key, result);
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      } finally {
        // Remove from pending promises
        this.pendingPromises.delete(key);
      }
    };
  }
  
  // Cache with TTL (Time To Live)
  memoizeAsyncWithTTL(fn, ttlMs = 60000, keyGenerator = (...args) => JSON.stringify(args)) {
    const cacheWithTimestamp = new Map();
    
    return async (...args) => {
      const key = keyGenerator(...args);
      const now = Date.now();
      
      // Check if we have a valid cached result
      if (cacheWithTimestamp.has(key)) {
        const { result, timestamp } = cacheWithTimestamp.get(key);
        
        if (now - timestamp < ttlMs) {
          console.log(`TTL cache hit for key: ${key}`);
          return result;
        } else {
          console.log(`TTL cache expired for key: ${key}`);
          cacheWithTimestamp.delete(key);
        }
      }
      
      // Execute function and cache result with timestamp
      console.log(`TTL cache miss, executing function for key: ${key}`);
      const result = await fn(...args);
      cacheWithTimestamp.set(key, { result, timestamp: now });
      
      return result;
    };
  }
  
  // Clear cache methods
  clearCache() {
    this.cache.clear();
    this.pendingPromises.clear();
  }
  
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingPromises.size
    };
  }
}

// Advanced Promise Flow Control
class PromiseFlowControl {
  // Circuit breaker pattern for promises
  static createCircuitBreaker(promiseFactory, options = {}) {
    const {
      failureThreshold = 5,    // Number of failures before opening circuit
      resetTimeout = 60000,    // Time before trying to close circuit
      monitoringPeriod = 60000 // Time window for failure counting
    } = options;
    
    let failures = [];
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    let lastFailureTime = null;
    
    return async (...args) => {
      const now = Date.now();
      
      // Clean old failures outside monitoring period
      failures = failures.filter(timestamp => now - timestamp < monitoringPeriod);
      
      // Check circuit state
      if (state === 'OPEN') {
        if (now - lastFailureTime > resetTimeout) {
          state = 'HALF_OPEN';
          console.log('Circuit breaker: Moving to HALF_OPEN state');
        } else {
          throw new Error('Circuit breaker is OPEN - request rejected');
        }
      }
      
      try {
        console.log(`Circuit breaker: Executing request (state: ${state})`);
        const result = await promiseFactory(...args);
        
        // Success - reset circuit if it was half-open
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = [];
          console.log('Circuit breaker: Reset to CLOSED state after success');
        }
        
        return result;
      } catch (error) {
        failures.push(now);
        lastFailureTime = now;
        
        // Check if we should open the circuit
        if (failures.length >= failureThreshold && state !== 'OPEN') {
          state = 'OPEN';
          console.log(`Circuit breaker: Opening circuit after ${failures.length} failures`);
        }
        
        throw error;
      }
    };
  }
  
  // Bulkhead pattern - isolate promise execution contexts
  static createBulkhead(maxConcurrent = 10) {
    let runningCount = 0;
    const queue = [];
    
    return async (promiseFactory) => {
      return new Promise((resolve, reject) => {
        const executeNext = async () => {
          if (runningCount >= maxConcurrent) {
            queue.push({ promiseFactory, resolve, reject });
            return;
          }
          
          runningCount++;
          console.log(`Bulkhead: Running ${runningCount}/${maxConcurrent} concurrent operations`);
          
          try {
            const result = await promiseFactory();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            runningCount--;
            
            // Process next item in queue
            if (queue.length > 0) {
              const next = queue.shift();
              executeNext.call(null, next.promiseFactory)
                .then(next.resolve)
                .catch(next.reject);
            }
          }
        };
        
        executeNext();
      });
    };
  }
}

// Example Usage and Testing
async function runAdvancedPatternsDemo() {
  console.log('=== Advanced Promise Patterns Demo ===\n');
  
  // 1. Async/Await patterns
  console.log('1. Async/Await Patterns:');
  await AsyncAwaitPatterns.basicAsyncFunction();
  await AsyncAwaitPatterns.parallelExecution();
  await AsyncAwaitPatterns.mixedExecutionPattern();
  
  // 2. Error handling
  console.log('\n2. Error Handling:');
  const errorResult = await AsyncAwaitPatterns.errorHandlingPatterns();
  console.log('Error handling result:', errorResult);
  
  // 3. Promise combinators
  console.log('\n3. Promise Combinators:');
  const testPromises = [
    Promise.resolve('Success 1'),
    Promise.reject(new Error('Failure 1')),
    Promise.resolve('Success 2'),
    new Promise(resolve => setTimeout(() => resolve('Delayed success'), 300))
  ];
  
  const allResults = await PromiseCombinators.allWithIndividualErrorHandling(testPromises);
  console.log('All with error handling:', allResults);
  
  // 4. Promise caching
  console.log('\n4. Promise Caching:');
  const cache = new PromiseCaching();
  const expensiveOperation = cache.memoizeAsync(async (input) => {
    console.log(`Computing expensive operation for: ${input}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Result for ${input}`;
  });
  
  await expensiveOperation('test1'); // Cache miss
  await expensiveOperation('test1'); // Cache hit
  await expensiveOperation('test2'); // Cache miss
  
  console.log('Cache stats:', cache.getCacheStats());
  
  // 5. Circuit breaker
  console.log('\n5. Circuit Breaker:');
  let callCount = 0;
  const unreliableService = async () => {
    callCount++;
    if (callCount <= 3) {
      throw new Error(`Service failure ${callCount}`);
    }
    return `Service success on call ${callCount}`;
  };
  
  const protectedService = PromiseFlowControl.createCircuitBreaker(unreliableService, {
    failureThreshold: 3,
    resetTimeout: 1000
  });
  
  // Test circuit breaker
  for (let i = 0; i < 6; i++) {
    try {
      const result = await protectedService();
      console.log(`Call ${i + 1}:`, result);
    } catch (error) {
      console.log(`Call ${i + 1} failed:`, error.message);
    }
    
    if (i === 3) {
      console.log('Waiting for circuit to reset...');
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }
  
  console.log('\n=== Advanced Patterns Demo Complete ===');
}

// Export for use in other modules
module.exports = {
  AsyncAwaitPatterns,
  PromiseCombinators,
  PromiseCaching,
  PromiseFlowControl,
  runAdvancedPatternsDemo
};