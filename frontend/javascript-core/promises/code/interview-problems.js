/**
 * File: interview-problems.js
 * Description: Common Promise interview questions with detailed solutions and explanations
 * Time Complexity: Varies by problem (noted per function)
 * Space Complexity: Varies by problem (noted per function)
 */

// Problem 1: Implement Promise.all from scratch
// Question: How would you implement Promise.all without using the built-in method?
// Time Complexity: O(n) where n is number of promises
// Space Complexity: O(n) for results array

function customPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Handle edge cases
    if (!Array.isArray(promises)) {
      return reject(new TypeError('customPromiseAll expects an array'));
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = new Array(promises.length); // Pre-allocate array to maintain order
    let completedCount = 0;
    
    // Process each promise
    promises.forEach((promise, index) => {
      // Wrap in Promise.resolve to handle non-promise values
      Promise.resolve(promise)
        .then(value => {
          results[index] = value; // Maintain original order
          completedCount++;
          
          // Check if all promises completed
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          // Reject immediately on first failure (fail-fast behavior)
          reject(error);
        });
    });
  });
}

// Test customPromiseAll
async function testCustomPromiseAll() {
  console.log('Testing custom Promise.all implementation:');
  
  try {
    // Test with successful promises
    const result1 = await customPromiseAll([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]);
    console.log('Success case:', result1); // [1, 2, 3]
    
    // Test with mixed values (non-promises)
    const result2 = await customPromiseAll([
      Promise.resolve('a'),
      'b', // Non-promise value
      Promise.resolve('c')
    ]);
    console.log('Mixed values:', result2); // ['a', 'b', 'c']
    
    // Test with rejection
    try {
      await customPromiseAll([
        Promise.resolve(1),
        Promise.reject(new Error('Failed')),
        Promise.resolve(3)
      ]);
    } catch (error) {
      console.log('Rejection caught:', error.message); // 'Failed'
    }
    
    // Test empty array
    const result3 = await customPromiseAll([]);
    console.log('Empty array:', result3); // []
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Problem 2: Implement Promise.race from scratch
// Question: Implement Promise.race that resolves/rejects with the first settled promise
function customPromiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('customPromiseRace expects an array'));
    }
    
    // Empty array results in a promise that never settles
    if (promises.length === 0) {
      return; // Promise remains pending forever
    }
    
    // Attach handlers to all promises
    // First one to settle (resolve or reject) wins
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)  // Forward resolution
        .catch(reject); // Forward rejection
    });
  });
}

// Problem 3: Implement Promise.allSettled from scratch
// Question: Create a version that waits for all promises but doesn't fail-fast
function customPromiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      throw new TypeError('customPromiseAllSettled expects an array');
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = new Array(promises.length);
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(
          // Success handler
          value => {
            results[index] = { status: 'fulfilled', value };
          },
          // Error handler
          reason => {
            results[index] = { status: 'rejected', reason };
          }
        )
        .finally(() => {
          completedCount++;
          
          // Resolve when all promises are settled (regardless of outcome)
          if (completedCount === promises.length) {
            resolve(results);
          }
        });
    });
  });
}

// Problem 4: Promise-based delay function with cancellation
// Question: Create a delay function that can be cancelled
function createCancellableDelay(ms) {
  let timeoutId;
  let cancelled = false;
  
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!cancelled) {
        resolve(`Completed after ${ms}ms`);
      }
    }, ms);
  });
  
  // Add cancellation method
  promise.cancel = () => {
    cancelled = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    console.log(`Delay of ${ms}ms was cancelled`);
  };
  
  return promise;
}

// Problem 5: Sequential Promise execution
// Question: Execute promises one after another, not in parallel
// Time Complexity: O(n * avg_promise_time) - sequential execution
async function executeSequentially(promiseFactories) {
  const results = [];
  
  // Method 1: Using for...of loop (most readable)
  for (const factory of promiseFactories) {
    try {
      const result = await factory();
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
      // Continue execution despite errors
    }
  }
  
  return results;
}

// Alternative implementation using reduce (functional approach)
function executeSequentiallyWithReduce(promiseFactories) {
  return promiseFactories.reduce(async (previousPromise, currentFactory) => {
    const results = await previousPromise;
    
    try {
      const result = await currentFactory();
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
    
    return results;
  }, Promise.resolve([]));
}

// Problem 6: Promise retry mechanism with exponential backoff
// Question: Implement a retry function that uses exponential backoff
async function retryWithExponentialBackoff(
  promiseFactory, 
  maxAttempts = 3, 
  baseDelay = 1000,
  maxDelay = 10000
) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Retry attempt ${attempt}/${maxAttempts}`);
      return await promiseFactory();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      // Don't delay after last attempt
      if (attempt < maxAttempts) {
        // Calculate exponential backoff with jitter
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
        const delay = Math.min(exponentialDelay + jitter, maxDelay);
        
        console.log(`Waiting ${Math.round(delay)}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`All ${maxAttempts} attempts failed. Last error: ${lastError.message}`);
}

// Problem 7: Promise-based semaphore (control concurrency)
// Question: Limit the number of concurrent operations
class PromiseSemaphore {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.currentCount = 0;
    this.waitingQueue = [];
  }
  
  // Acquire a permit (returns a promise that resolves when permit is available)
  async acquire() {
    return new Promise((resolve) => {
      if (this.currentCount < this.maxConcurrent) {
        this.currentCount++;
        console.log(`Permit acquired. Current: ${this.currentCount}/${this.maxConcurrent}`);
        resolve();
      } else {
        console.log(`No permits available. Queuing request. Queue length: ${this.waitingQueue.length + 1}`);
        this.waitingQueue.push(resolve);
      }
    });
  }
  
  // Release a permit
  release() {
    if (this.currentCount > 0) {
      this.currentCount--;
      console.log(`Permit released. Current: ${this.currentCount}/${this.maxConcurrent}`);
      
      // If there are waiting requests, resolve the next one
      if (this.waitingQueue.length > 0) {
        const nextResolve = this.waitingQueue.shift();
        this.currentCount++;
        console.log(`Permit granted from queue. Current: ${this.currentCount}/${this.maxConcurrent}`);
        nextResolve();
      }
    }
  }
  
  // Execute a function with semaphore protection
  async execute(fn) {
    await this.acquire();
    
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
  
  // Get current status
  getStatus() {
    return {
      maxConcurrent: this.maxConcurrent,
      currentCount: this.currentCount,
      queueLength: this.waitingQueue.length
    };
  }
}

// Problem 8: Promise timeout wrapper
// Question: Create a function that adds timeout to any promise
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

// Alternative implementation that cleans up timeout if original promise settles first
function withTimeoutCleanup(promise, timeoutMs) {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  // Clean up timeout when original promise settles
  promise.finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Problem 9: Promise-based queue processor
// Question: Process items from a queue with controlled concurrency
class PromiseQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = [];
  }
  
  // Add item to queue
  async add(promiseFactory) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promiseFactory,
        resolve,
        reject
      });
      
      this.process();
    });
  }
  
  // Process queue items
  async process() {
    if (this.running.length >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    const item = this.queue.shift();
    const promise = this.executeItem(item);
    
    this.running.push(promise);
    
    try {
      await promise;
    } finally {
      // Remove from running list
      const index = this.running.indexOf(promise);
      if (index !== -1) {
        this.running.splice(index, 1);
      }
      
      // Process next item
      this.process();
    }
  }
  
  async executeItem(item) {
    try {
      console.log(`Processing queue item. Queue: ${this.queue.length}, Running: ${this.running.length}`);
      const result = await item.promiseFactory();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
  }
  
  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      runningCount: this.running.length,
      concurrency: this.concurrency
    };
  }
}

// Problem 10: Promise debounce
// Question: Create a debounced version of an async function
function debouncePromise(fn, delay) {
  let timeoutId;
  let latestResolve;
  let latestReject;
  
  return function(...args) {
    return new Promise((resolve, reject) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        
        // Reject previous promise
        if (latestReject) {
          latestReject(new Error('Debounced - newer call made'));
        }
      }
      
      // Store latest resolve/reject
      latestResolve = resolve;
      latestReject = reject;
      
      // Set new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          latestResolve(result);
        } catch (error) {
          latestReject(error);
        }
      }, delay);
    });
  };
}

// Comprehensive test suite
async function runInterviewProblemsDemo() {
  console.log('=== Promise Interview Problems Demo ===\n');
  
  // 1. Test custom Promise.all
  console.log('1. Custom Promise.all:');
  await testCustomPromiseAll();
  
  // 2. Test sequential execution
  console.log('\n2. Sequential Promise Execution:');
  const promiseFactories = [
    () => new Promise(resolve => setTimeout(() => resolve('First'), 200)),
    () => new Promise(resolve => setTimeout(() => resolve('Second'), 150)),
    () => new Promise((_, reject) => setTimeout(() => reject(new Error('Third failed')), 100)),
    () => new Promise(resolve => setTimeout(() => resolve('Fourth'), 300))
  ];
  
  const sequentialResults = await executeSequentially(promiseFactories);
  console.log('Sequential results:', sequentialResults);
  
  // 3. Test retry with exponential backoff
  console.log('\n3. Retry with Exponential Backoff:');
  let attemptCounter = 0;
  try {
    const result = await retryWithExponentialBackoff(() => {
      attemptCounter++;
      if (attemptCounter < 3) {
        throw new Error(`Attempt ${attemptCounter} failed`);
      }
      return `Success on attempt ${attemptCounter}`;
    }, 3, 500);
    console.log('Retry result:', result);
  } catch (error) {
    console.log('Retry failed:', error.message);
  }
  
  // 4. Test semaphore
  console.log('\n4. Promise Semaphore:');
  const semaphore = new PromiseSemaphore(2);
  
  // Create multiple concurrent operations
  const semaphoreOperations = Array(5).fill(0).map((_, index) => 
    semaphore.execute(async () => {
      console.log(`Operation ${index + 1} started`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Operation ${index + 1} completed`);
      return `Result ${index + 1}`;
    })
  );
  
  const semaphoreResults = await Promise.all(semaphoreOperations);
  console.log('Semaphore results:', semaphoreResults);
  
  // 5. Test timeout wrapper
  console.log('\n5. Promise Timeout:');
  try {
    const slowOperation = new Promise(resolve => setTimeout(() => resolve('Slow result'), 3000));
    const result = await withTimeoutCleanup(slowOperation, 1000);
    console.log('Timeout result:', result);
  } catch (error) {
    console.log('Timeout caught:', error.message);
  }
  
  // 6. Test promise queue
  console.log('\n6. Promise Queue:');
  const queue = new PromiseQueue(2);
  
  // Add multiple items to queue
  const queuePromises = Array(5).fill(0).map((_, index) =>
    queue.add(() => {
      console.log(`Queue item ${index + 1} processing`);
      return new Promise(resolve => 
        setTimeout(() => resolve(`Queue result ${index + 1}`), Math.random() * 1000 + 500)
      );
    })
  );
  
  const queueResults = await Promise.all(queuePromises);
  console.log('Queue results:', queueResults);
  
  // 7. Test debounced promise
  console.log('\n7. Debounced Promise:');
  const debouncedFunction = debouncePromise(async (input) => {
    console.log(`Processing debounced input: ${input}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return `Processed: ${input}`;
  }, 300);
  
  // Make multiple rapid calls - only last one should execute
  try {
    const promises = [
      debouncedFunction('call 1'),
      debouncedFunction('call 2'),
      debouncedFunction('call 3')
    ];
    
    const debouncedResults = await Promise.allSettled(promises);
    console.log('Debounced results:', debouncedResults);
  } catch (error) {
    console.log('Debounced error:', error.message);
  }
  
  console.log('\n=== Interview Problems Demo Complete ===');
}

// Export all functions for testing
module.exports = {
  customPromiseAll,
  customPromiseRace,
  customPromiseAllSettled,
  createCancellableDelay,
  executeSequentially,
  executeSequentiallyWithReduce,
  retryWithExponentialBackoff,
  PromiseSemaphore,
  withTimeout,
  withTimeoutCleanup,
  PromiseQueue,
  debouncePromise,
  runInterviewProblemsDemo
};