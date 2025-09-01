/**
 * File: custom-promise.js
 * Description: Custom Promise implementation following the Promises/A+ specification
 * 
 * Learning objectives:
 * - Understand Promise internals and state management
 * - Learn async pattern implementation
 * - See thenable resolution and error handling
 * 
 * Time Complexity: O(1) for state transitions, O(n) for handler execution
 * Space Complexity: O(n) for storing handlers and values
 */

// =======================
// Approach 1: Basic Promise Implementation
// =======================

/**
 * Basic Promise implementation
 * Covers core functionality: constructor, then, catch, resolve/reject
 * 
 * Mental model: A Promise is a state machine with three states:
 * PENDING -> FULFILLED or PENDING -> REJECTED
 */
class BasicPromise {
  constructor(executor) {
    // Promise states
    this.state = 'PENDING';
    this.value = undefined;
    this.reason = undefined;
    
    // Handler queues for chaining
    this.onFulfilledHandlers = [];
    this.onRejectedHandlers = [];
    
    // Resolver functions
    const resolve = (value) => {
      if (this.state === 'PENDING') {
        this.state = 'FULFILLED';
        this.value = value;
        
        // Execute all queued fulfillment handlers
        this.onFulfilledHandlers.forEach(handler => {
          this.executeHandler(handler, value);
        });
        this.onFulfilledHandlers = [];
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'PENDING') {
        this.state = 'REJECTED';
        this.reason = reason;
        
        // Execute all queued rejection handlers
        this.onRejectedHandlers.forEach(handler => {
          this.executeHandler(handler, reason);
        });
        this.onRejectedHandlers = [];
      }
    };
    
    // Execute executor immediately
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  // Core then method
  then(onFulfilled, onRejected) {
    // Return new Promise for chaining
    return new BasicPromise((resolve, reject) => {
      const handleFulfilled = (value) => {
        if (typeof onFulfilled === 'function') {
          try {
            const result = onFulfilled(value);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(value); // Pass through
        }
      };
      
      const handleRejected = (reason) => {
        if (typeof onRejected === 'function') {
          try {
            const result = onRejected(reason);
            resolve(result); // Rejection handlers can recover
          } catch (error) {
            reject(error);
          }
        } else {
          reject(reason); // Pass through
        }
      };
      
      // Handle current state
      if (this.state === 'FULFILLED') {
        this.executeHandler(handleFulfilled, this.value);
      } else if (this.state === 'REJECTED') {
        this.executeHandler(handleRejected, this.reason);
      } else {
        // Still pending - queue handlers
        this.onFulfilledHandlers.push(handleFulfilled);
        this.onRejectedHandlers.push(handleRejected);
      }
    });
  }
  
  // Catch method (syntactic sugar for then(null, onRejected))
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  // Execute handler asynchronously (microtask simulation)
  executeHandler(handler, value) {
    setTimeout(() => handler(value), 0);
  }
  
  // Static resolve method
  static resolve(value) {
    return new BasicPromise((resolve) => resolve(value));
  }
  
  // Static reject method
  static reject(reason) {
    return new BasicPromise((_, reject) => reject(reason));
  }
}

// =======================
// Approach 2: Promise/A+ Compliant Implementation
// =======================

/**
 * Promise/A+ compliant implementation
 * Handles thenable resolution and proper async behavior
 */
class PromiseAPlus {
  constructor(executor) {
    this.state = 'PENDING';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledHandlers = [];
    this.onRejectedHandlers = [];
    
    const resolve = (value) => {
      if (this.state === 'PENDING') {
        this.resolvePromise(this, value, 
          (val) => this.fulfill(val),
          (err) => this.reject(err)
        );
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'PENDING') {
        this.reject(reason);
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  fulfill(value) {
    this.state = 'FULFILLED';
    this.value = value;
    this.executeHandlers();
  }
  
  reject(reason) {
    this.state = 'REJECTED';
    this.reason = reason;
    this.executeHandlers();
  }
  
  executeHandlers() {
    if (this.state === 'FULFILLED') {
      this.onFulfilledHandlers.forEach(handler => {
        this.runAsync(() => handler(this.value));
      });
    } else if (this.state === 'REJECTED') {
      this.onRejectedHandlers.forEach(handler => {
        this.runAsync(() => handler(this.reason));
      });
    }
    
    this.onFulfilledHandlers = [];
    this.onRejectedHandlers = [];
  }
  
  then(onFulfilled, onRejected) {
    return new PromiseAPlus((resolve, reject) => {
      const handleFulfillment = (value) => {
        if (typeof onFulfilled === 'function') {
          try {
            const x = onFulfilled(value);
            this.resolvePromise(this, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(value);
        }
      };
      
      const handleRejection = (reason) => {
        if (typeof onRejected === 'function') {
          try {
            const x = onRejected(reason);
            this.resolvePromise(this, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(reason);
        }
      };
      
      if (this.state === 'FULFILLED') {
        this.runAsync(() => handleFulfillment(this.value));
      } else if (this.state === 'REJECTED') {
        this.runAsync(() => handleRejection(this.reason));
      } else {
        this.onFulfilledHandlers.push(handleFulfillment);
        this.onRejectedHandlers.push(handleRejection);
      }
    });
  }
  
  // Promise resolution procedure (Promise/A+ 2.3)
  resolvePromise(promise, x, resolve, reject) {
    // 2.3.1: If promise and x refer to the same object, reject with TypeError
    if (promise === x) {
      reject(new TypeError('Circular reference'));
      return;
    }
    
    // 2.3.2: If x is a promise, adopt its state
    if (x instanceof PromiseAPlus) {
      if (x.state === 'PENDING') {
        x.then(resolve, reject);
      } else if (x.state === 'FULFILLED') {
        resolve(x.value);
      } else {
        reject(x.reason);
      }
      return;
    }
    
    // 2.3.3: If x is an object or function
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false;
      
      try {
        const then = x.then;
        
        // 2.3.3.3: If then is a function, call it as a method
        if (typeof then === 'function') {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise, y, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          // 2.3.3.4: If then is not a function, fulfill with x
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      // 2.3.4: If x is not an object or function, fulfill with x
      resolve(x);
    }
  }
  
  catch(onRejected) {
    return this.then(null, onRejected);
  }
  
  finally(callback) {
    return this.then(
      (value) => {
        return PromiseAPlus.resolve(callback()).then(() => value);
      },
      (reason) => {
        return PromiseAPlus.resolve(callback()).then(() => {
          throw reason;
        });
      }
    );
  }
  
  // Run function asynchronously (microtask simulation)
  runAsync(fn) {
    setTimeout(fn, 0);
  }
  
  // Static methods
  static resolve(value) {
    if (value instanceof PromiseAPlus) {
      return value;
    }
    return new PromiseAPlus((resolve) => resolve(value));
  }
  
  static reject(reason) {
    return new PromiseAPlus((_, reject) => reject(reason));
  }
}

// =======================
// Approach 3: Complete Promise with All Static Methods
// =======================

/**
 * Complete Promise implementation with all static methods
 * Includes all, race, allSettled, any methods
 */
class CompletePromise extends PromiseAPlus {
  // Promise.all implementation
  static all(promises) {
    return new CompletePromise((resolve, reject) => {
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
        CompletePromise.resolve(promise)
          .then(value => {
            results[index] = value;
            completedCount++;
            
            if (completedCount === promises.length) {
              resolve(results);
            }
          })
          .catch(reject);
      });
    });
  }
  
  // Promise.race implementation
  static race(promises) {
    return new CompletePromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError('Promise.race expects an iterable'));
        return;
      }
      
      if (promises.length === 0) {
        return; // Never settles
      }
      
      promises.forEach(promise => {
        CompletePromise.resolve(promise)
          .then(resolve)
          .catch(reject);
      });
    });
  }
  
  // Promise.allSettled implementation
  static allSettled(promises) {
    return new CompletePromise((resolve, reject) => {
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
        CompletePromise.resolve(promise)
          .then(value => {
            results[index] = { status: 'fulfilled', value };
          })
          .catch(reason => {
            results[index] = { status: 'rejected', reason };
          })
          .finally(() => {
            settledCount++;
            if (settledCount === promises.length) {
              resolve(results);
            }
          });
      });
    });
  }
  
  // Promise.any implementation
  static any(promises) {
    return new CompletePromise((resolve, reject) => {
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
        CompletePromise.resolve(promise)
          .then(resolve) // First fulfillment wins
          .catch(reason => {
            errors[index] = reason;
            rejectedCount++;
            
            if (rejectedCount === promises.length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          });
      });
    });
  }
}

// =======================
// Approach 4: Promise with Advanced Features
// =======================

/**
 * Promise with advanced features like timeout, retry, and cancellation
 */
class AdvancedPromise extends CompletePromise {
  constructor(executor) {
    super(executor);
    this._cancelled = false;
  }
  
  // Cancel the promise
  cancel() {
    if (this.state === 'PENDING') {
      this._cancelled = true;
      this.reject(new Error('Promise was cancelled'));
    }
  }
  
  // Check if promise was cancelled
  isCancelled() {
    return this._cancelled;
  }
  
  // Static timeout method
  static timeout(promise, ms) {
    return new AdvancedPromise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Promise timed out after ${ms}ms`));
      }, ms);
      
      AdvancedPromise.resolve(promise)
        .then(value => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
  
  // Static delay method
  static delay(ms, value) {
    return new AdvancedPromise((resolve) => {
      setTimeout(() => resolve(value), ms);
    });
  }
  
  // Static retry method
  static retry(promiseFactory, maxAttempts = 3, delay = 1000) {
    return new AdvancedPromise((resolve, reject) => {
      let attempts = 0;
      
      function attempt() {
        attempts++;
        
        promiseFactory()
          .then(resolve)
          .catch(error => {
            if (attempts >= maxAttempts) {
              reject(error);
            } else {
              setTimeout(attempt, delay);
            }
          });
      }
      
      attempt();
    });
  }
  
  // Static promisify method
  static promisify(fn) {
    return function(...args) {
      return new AdvancedPromise((resolve, reject) => {
        fn(...args, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
  }
  
  // Static defer method (creates deferred object)
  static defer() {
    let resolve, reject;
    const promise = new AdvancedPromise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve, reject };
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Custom Promise Examples ===');

// Basic Promise usage
const basicPromise = new BasicPromise((resolve, reject) => {
  setTimeout(() => {
    if (Math.random() > 0.5) {
      resolve('Success!');
    } else {
      reject(new Error('Failed!'));
    }
  }, 100);
});

basicPromise
  .then(result => {
    console.log('Basic Promise result:', result);
    return result + ' -> Modified';
  })
  .then(modified => {
    console.log('Chained result:', modified);
  })
  .catch(error => {
    console.log('Basic Promise error:', error.message);
  });

// Promise/A+ compliance test
const thenableTest = new PromiseAPlus((resolve) => {
  resolve({
    then: (onFulfilled) => {
      setTimeout(() => onFulfilled('Thenable resolved!'), 50);
    }
  });
});

thenableTest.then(result => {
  console.log('Thenable result:', result);
});

// Complete Promise static methods test
const promises = [
  CompletePromise.resolve(1),
  CompletePromise.resolve(2),
  new CompletePromise((resolve) => setTimeout(() => resolve(3), 100))
];

CompletePromise.all(promises).then(results => {
  console.log('Promise.all results:', results);
});

CompletePromise.race(promises).then(result => {
  console.log('Promise.race result:', result);
});

// Advanced Promise features
AdvancedPromise.timeout(
  new AdvancedPromise((resolve) => setTimeout(() => resolve('Slow'), 200)),
  100
).catch(error => {
  console.log('Timeout error:', error.message);
});

AdvancedPromise.delay(150, 'Delayed value').then(value => {
  console.log('Delayed result:', value);
});

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: HTTP Request Promise Wrapper
 * Wrap callback-based HTTP requests in promises
 */
function createHTTPPromise() {
  // Mock HTTP request function with callback
  function httpRequest(url, callback) {
    setTimeout(() => {
      if (url.includes('error')) {
        callback(new Error('HTTP Error'), null);
      } else {
        callback(null, { status: 200, data: `Data from ${url}` });
      }
    }, Math.random() * 200 + 50);
  }
  
  // Promisify the HTTP request
  const promisifiedRequest = AdvancedPromise.promisify(httpRequest);
  
  return {
    get: (url) => promisifiedRequest(url),
    
    // Request with timeout
    getWithTimeout: (url, timeout = 5000) => {
      return AdvancedPromise.timeout(promisifiedRequest(url), timeout);
    },
    
    // Request with retry
    getWithRetry: (url, maxAttempts = 3) => {
      return AdvancedPromise.retry(() => promisifiedRequest(url), maxAttempts, 1000);
    }
  };
}

/**
 * Use Case 2: Database Transaction Promise
 * Handle database transactions with rollback capability
 */
function createDatabaseTransaction() {
  let transactionId = 0;
  
  function mockDBOperation(operation) {
    return new AdvancedPromise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.8) {
          reject(new Error(`DB operation failed: ${operation}`));
        } else {
          resolve(`${operation} completed`);
        }
      }, Math.random() * 100 + 50);
    });
  }
  
  return {
    async executeTransaction(operations) {
      const txId = ++transactionId;
      console.log(`Starting transaction ${txId}`);
      
      try {
        const results = [];
        
        // Execute operations in sequence
        for (const operation of operations) {
          const result = await mockDBOperation(operation);
          results.push(result);
        }
        
        console.log(`Transaction ${txId} committed`);
        return results;
      } catch (error) {
        console.log(`Transaction ${txId} rolled back:`, error.message);
        throw error;
      }
    },
    
    // Execute with timeout
    executeWithTimeout(operations, timeout = 10000) {
      return AdvancedPromise.timeout(
        this.executeTransaction(operations),
        timeout
      );
    }
  };
}

/**
 * Use Case 3: Promise-based State Machine
 * Manage complex state transitions with promises
 */
function createStateMachine(initialState = 'idle') {
  let currentState = initialState;
  const transitions = new Map();
  const statePromises = new Map();
  
  return {
    // Define state transition
    addTransition(from, to, handler) {
      if (!transitions.has(from)) {
        transitions.set(from, new Map());
      }
      transitions.get(from).set(to, handler);
    },
    
    // Transition to new state
    transition(newState, ...args) {
      return new AdvancedPromise((resolve, reject) => {
        const fromTransitions = transitions.get(currentState);
        
        if (!fromTransitions || !fromTransitions.has(newState)) {
          reject(new Error(`Invalid transition from ${currentState} to ${newState}`));
          return;
        }
        
        const handler = fromTransitions.get(newState);
        
        // Execute transition handler
        AdvancedPromise.resolve(handler(currentState, newState, ...args))
          .then(result => {
            currentState = newState;
            console.log(`State changed to: ${newState}`);
            
            // Resolve any pending state promises
            if (statePromises.has(newState)) {
              statePromises.get(newState).forEach(deferred => {
                deferred.resolve(result);
              });
              statePromises.delete(newState);
            }
            
            resolve(result);
          })
          .catch(reject);
      });
    },
    
    // Wait for specific state
    waitForState(state) {
      if (currentState === state) {
        return AdvancedPromise.resolve(currentState);
      }
      
      if (!statePromises.has(state)) {
        statePromises.set(state, []);
      }
      
      const deferred = AdvancedPromise.defer();
      statePromises.get(state).push(deferred);
      
      return deferred.promise;
    },
    
    getCurrentState() {
      return currentState;
    }
  };
}

/**
 * Use Case 4: Promise Pool for Concurrency Control
 * Control concurrent promise execution
 */
function createPromisePool(concurrency = 5) {
  const running = new Set();
  const queue = [];
  
  function runNext() {
    if (queue.length === 0 || running.size >= concurrency) {
      return;
    }
    
    const { promiseFactory, resolve, reject } = queue.shift();
    
    const promise = promiseFactory();
    running.add(promise);
    
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => {
        running.delete(promise);
        runNext();
      });
  }
  
  return {
    add(promiseFactory) {
      return new AdvancedPromise((resolve, reject) => {
        queue.push({ promiseFactory, resolve, reject });
        runNext();
      });
    },
    
    addAll(promiseFactories) {
      return AdvancedPromise.all(
        promiseFactories.map(factory => this.add(factory))
      );
    },
    
    getStats() {
      return {
        running: running.size,
        queued: queue.length,
        concurrency
      };
    }
  };
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===');
  
  // HTTP Promise wrapper
  const httpClient = createHTTPPromise();
  try {
    const response = await httpClient.getWithRetry('/api/users');
    console.log('HTTP response:', response.data);
  } catch (error) {
    console.log('HTTP error:', error.message);
  }
  
  // Database transaction
  const db = createDatabaseTransaction();
  try {
    const results = await db.executeWithTimeout(['CREATE', 'INSERT', 'UPDATE'], 5000);
    console.log('Transaction results:', results);
  } catch (error) {
    console.log('Transaction error:', error.message);
  }
  
  // State machine
  const stateMachine = createStateMachine();
  stateMachine.addTransition('idle', 'loading', () => {
    return new Promise(resolve => setTimeout(() => resolve('Loading complete'), 100));
  });
  
  stateMachine.addTransition('loading', 'ready', () => 'Ready state reached');
  
  try {
    await stateMachine.transition('loading');
    await stateMachine.transition('ready');
    console.log('Final state:', stateMachine.getCurrentState());
  } catch (error) {
    console.log('State machine error:', error.message);
  }
  
  // Promise pool
  const pool = createPromisePool(2);
  const tasks = Array.from({ length: 5 }, (_, i) => 
    () => AdvancedPromise.delay(100, `Task ${i + 1}`)
  );
  
  const poolResults = await pool.addAll(tasks);
  console.log('Pool results:', poolResults);
}, 1000);

// Export all implementations
module.exports = {
  BasicPromise,
  PromiseAPlus,
  CompletePromise,
  AdvancedPromise,
  createHTTPPromise,
  createDatabaseTransaction,
  createStateMachine,
  createPromisePool
};

/**
 * Key Interview Points:
 * 
 * 1. Promise States:
 *    - PENDING: Initial state, not fulfilled or rejected
 *    - FULFILLED: Operation completed successfully
 *    - REJECTED: Operation failed
 *    - State transitions are irreversible
 * 
 * 2. Promise/A+ Specification:
 *    - Thenable resolution procedure
 *    - Proper async execution (microtasks)
 *    - Chain-friendly return values
 *    - Error propagation rules
 * 
 * 3. Implementation Details:
 *    - Handler queuing for pending promises
 *    - Circular reference detection
 *    - Thenable vs promise distinction
 *    - Proper error handling and propagation
 * 
 * 4. Static Methods:
 *    - resolve/reject: Create resolved/rejected promises
 *    - all: Wait for all promises (fail-fast)
 *    - race: First to settle wins
 *    - allSettled: Wait for all, get all results
 *    - any: First to fulfill wins
 * 
 * 5. Advanced Features:
 *    - Cancellation and timeout support
 *    - Retry mechanisms with backoff
 *    - Promise pools for concurrency control
 *    - Promisification of callback APIs
 * 
 * 6. Real-world Applications:
 *    - HTTP request wrappers
 *    - Database transactions
 *    - State machines
 *    - Resource pooling
 *    - Event-driven programming
 */