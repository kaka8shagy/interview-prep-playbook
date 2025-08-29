/**
 * File: fundamentals.js
 * Description: Core Promise concepts, creation patterns, and state management
 * Time Complexity: O(1) for promise creation, varies for async operations
 * Space Complexity: O(1) per promise instance
 */

// The Promise Constructor and States
// Promises have three states: pending, fulfilled (resolved), rejected
// State transitions: pending -> fulfilled OR pending -> rejected (irreversible)

function demonstratePromiseStates() {
  // State 1: Pending - initial state, neither fulfilled nor rejected
  const pendingPromise = new Promise((resolve, reject) => {
    // This promise will remain pending forever
    console.log('Promise created - State: pending');
    // No resolve() or reject() called
  });
  
  // State 2: Fulfilled (resolved) - operation completed successfully
  const fulfilledPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Resolving promise...');
      resolve('Operation successful'); // Transition: pending -> fulfilled
    }, 1000);
  });
  
  // State 3: Rejected - operation failed
  const rejectedPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Rejecting promise...');
      reject(new Error('Operation failed')); // Transition: pending -> rejected
    }, 500);
  });
  
  return { pendingPromise, fulfilledPromise, rejectedPromise };
}

// Promise Executor Function Deep Dive
// The executor runs immediately and synchronously when Promise is created
function understandExecutor() {
  console.log('Before promise creation');
  
  const promise = new Promise((resolve, reject) => {
    console.log('Executor running synchronously!'); // This runs immediately
    
    // Resolve can be called with any value
    setTimeout(() => {
      const success = Math.random() > 0.3;
      
      if (success) {
        // Resolving with different data types
        resolve({
          data: 'Success result',
          timestamp: Date.now(),
          metadata: { attempts: 1 }
        });
      } else {
        // Always reject with Error objects for better stack traces
        reject(new Error('Random failure occurred'));
      }
    }, 100);
  });
  
  console.log('After promise creation, before handlers');
  
  // Handlers are always asynchronous, even if promise is already settled
  promise
    .then(result => {
      console.log('Success handler called asynchronously:', result);
      return result; // Return value becomes next promise's resolution value
    })
    .catch(error => {
      console.log('Error handler called asynchronously:', error.message);
      // Catching an error returns a resolved promise (error recovery)
      return { recovered: true, originalError: error.message };
    })
    .finally(() => {
      console.log('Finally always runs for cleanup');
    });
  
  console.log('After attaching handlers');
  return promise;
}

// Static Promise Methods - Creating Settled Promises
function demonstrateStaticMethods() {
  // Promise.resolve() - creates immediately fulfilled promise
  const immediateResolve = Promise.resolve('Immediate success');
  console.log('Immediate resolve created');
  
  // Promise.resolve() with thenable objects (objects with .then method)
  const thenable = {
    then: function(onResolve, onReject) {
      console.log('Thenable .then() called');
      setTimeout(() => onResolve('From thenable'), 100);
    }
  };
  
  const promiseFromThenable = Promise.resolve(thenable);
  // This unwraps the thenable into a proper Promise
  
  // Promise.reject() - creates immediately rejected promise
  const immediateReject = Promise.reject(new Error('Immediate failure'));
  console.log('Immediate reject created');
  
  // Demonstration of immediate handling
  immediateResolve.then(value => {
    console.log('Immediate resolve handled:', value);
  });
  
  promiseFromThenable.then(value => {
    console.log('Thenable converted to promise:', value);
  });
  
  immediateReject.catch(error => {
    console.log('Immediate reject handled:', error.message);
  });
  
  return { immediateResolve, promiseFromThenable, immediateReject };
}

// Promise Chaining - The Core of Promise Power
// Each .then() returns a new Promise, enabling chaining
function demonstratePromiseChaining() {
  console.log('Starting promise chain...');
  
  return Promise.resolve(1)
    .then(value => {
      console.log(`Step 1: Received ${value}`);
      // Return value becomes resolution value of next promise in chain
      return value * 2;
    })
    .then(value => {
      console.log(`Step 2: Received ${value}`);
      // Return a promise - next .then() waits for this promise
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(value + 10);
        }, 500);
      });
    })
    .then(value => {
      console.log(`Step 3: Received ${value} after async operation`);
      // Throw error to trigger error handling
      if (value > 10) {
        throw new Error(`Value ${value} is too large`);
      }
      return value;
    })
    .catch(error => {
      console.log(`Error caught in chain: ${error.message}`);
      // Recovery: return a value to continue the chain
      return { error: true, recovered: error.message, fallbackValue: 5 };
    })
    .then(result => {
      console.log('Chain continued after error recovery:', result);
      return result;
    })
    .finally(() => {
      console.log('Chain completed - finally block executed');
    });
}

// Error Propagation in Promise Chains
function demonstrateErrorPropagation() {
  // Errors propagate through the chain until caught
  return Promise.resolve('start')
    .then(value => {
      console.log('Step 1:', value);
      throw new Error('Error in step 1');
    })
    .then(value => {
      // This will be skipped due to error in previous step
      console.log('Step 2 (skipped):', value);
      return value + ' -> step 2';
    })
    .then(value => {
      // This will also be skipped
      console.log('Step 3 (skipped):', value);
      return value + ' -> step 3';
    })
    .catch(error => {
      console.log('Error caught after skipping steps:', error.message);
      // Return value to recover and continue chain
      return 'recovered value';
    })
    .then(value => {
      // This runs because previous catch recovered
      console.log('Step after recovery:', value);
      return value + ' -> continued';
    });
}

// Common Promise Creation Patterns
class PromisePatterns {
  // Pattern 1: Wrapping callback-based APIs
  static promisify(callbackFunction) {
    return function(...args) {
      return new Promise((resolve, reject) => {
        // Add error-first callback as last argument
        callbackFunction(...args, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
  }
  
  // Pattern 2: Timeout utility
  static delay(milliseconds) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Delayed for ${milliseconds}ms`);
      }, milliseconds);
    });
  }
  
  // Pattern 3: Promise with timeout and cancellation
  static withTimeout(promise, timeoutMs) {
    // Create a timeout promise that rejects
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      // Clean up timeout if original promise settles first
      promise.finally(() => clearTimeout(timeoutId));
    });
    
    // Race between original promise and timeout
    return Promise.race([promise, timeoutPromise]);
  }
  
  // Pattern 4: Retry mechanism
  static async retry(promiseFactory, maxAttempts = 3, delayMs = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxAttempts}`);
        return await promiseFactory();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        // Don't delay after last attempt
        if (attempt < maxAttempts) {
          await this.delay(delayMs);
        }
      }
    }
    
    throw new Error(`All ${maxAttempts} attempts failed. Last error: ${lastError.message}`);
  }
  
  // Pattern 5: Promise with progress tracking
  static createProgressPromise(totalSteps) {
    let currentStep = 0;
    let progressCallback = null;
    
    const promise = new Promise((resolve) => {
      const interval = setInterval(() => {
        currentStep++;
        
        if (progressCallback) {
          progressCallback(currentStep, totalSteps);
        }
        
        if (currentStep >= totalSteps) {
          clearInterval(interval);
          resolve(`Completed ${totalSteps} steps`);
        }
      }, 100);
    });
    
    // Add progress tracking method to promise
    promise.onProgress = (callback) => {
      progressCallback = callback;
      return promise;
    };
    
    return promise;
  }
}

// Microtask Queue and Event Loop Understanding
function demonstrateMicrotaskQueue() {
  console.log('1: Synchronous start');
  
  // Macrotask (Timer)
  setTimeout(() => {
    console.log('4: setTimeout (macrotask)');
  }, 0);
  
  // Microtask (Promise)
  Promise.resolve().then(() => {
    console.log('3: Promise.then (microtask)');
  });
  
  console.log('2: Synchronous end');
  
  // Expected output:
  // 1: Synchronous start
  // 2: Synchronous end
  // 3: Promise.then (microtask)
  // 4: setTimeout (macrotask)
  
  // Explanation: Microtasks (promises) have higher priority than macrotasks (timers)
}

// Advanced Promise Composition
function demonstratePromiseComposition() {
  // Create multiple promises with different timing
  const fastPromise = PromisePatterns.delay(100).then(() => 'fast');
  const mediumPromise = PromisePatterns.delay(300).then(() => 'medium');
  const slowPromise = PromisePatterns.delay(500).then(() => 'slow');
  
  console.log('Starting promise composition demo...');
  
  // Sequential execution (one after another)
  const sequential = async () => {
    console.log('Sequential execution:');
    const result1 = await fastPromise;
    const result2 = await mediumPromise;
    const result3 = await slowPromise;
    console.log('Sequential results:', [result1, result2, result3]);
    return [result1, result2, result3];
  };
  
  // Parallel execution (all at once)
  const parallel = async () => {
    console.log('Parallel execution:');
    const results = await Promise.all([fastPromise, mediumPromise, slowPromise]);
    console.log('Parallel results:', results);
    return results;
  };
  
  return { sequential, parallel };
}

// Example Usage and Testing
async function runFundamentalsDemo() {
  console.log('=== Promise Fundamentals Demo ===\n');
  
  // 1. Demonstrate promise states
  console.log('1. Promise States:');
  demonstratePromiseStates();
  
  // 2. Executor function behavior
  console.log('\n2. Executor Function:');
  await understandExecutor();
  
  // 3. Static methods
  console.log('\n3. Static Methods:');
  demonstrateStaticMethods();
  
  // 4. Promise chaining
  console.log('\n4. Promise Chaining:');
  await demonstratePromiseChaining();
  
  // 5. Error propagation
  console.log('\n5. Error Propagation:');
  await demonstrateErrorPropagation();
  
  // 6. Microtask queue
  console.log('\n6. Microtask Queue:');
  demonstrateMicrotaskQueue();
  
  // 7. Promise patterns
  console.log('\n7. Promise Patterns:');
  
  // Delay pattern
  await PromisePatterns.delay(200);
  console.log('Delay completed');
  
  // Retry pattern
  let attemptCount = 0;
  try {
    await PromisePatterns.retry(() => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error(`Attempt ${attemptCount} failed`);
      }
      return Promise.resolve('Success on attempt 3');
    }, 3, 100);
  } catch (error) {
    console.log('Retry failed:', error.message);
  }
  
  // Progress pattern
  const progressPromise = PromisePatterns.createProgressPromise(5);
  progressPromise.onProgress((current, total) => {
    console.log(`Progress: ${current}/${total} (${Math.round(current/total*100)}%)`);
  });
  await progressPromise;
  
  console.log('\n=== Demo Complete ===');
}

// Export for use in other modules
module.exports = {
  demonstratePromiseStates,
  understandExecutor,
  demonstrateStaticMethods,
  demonstratePromiseChaining,
  demonstrateErrorPropagation,
  PromisePatterns,
  demonstrateMicrotaskQueue,
  demonstratePromiseComposition,
  runFundamentalsDemo
};