/**
 * File: interview-promise-all.js
 * Description: Implement Promise.all from scratch - common interview question
 */

// Basic Promise.all implementation
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Handle empty array
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = new Array(promises.length);
    let completed = 0;
    
    promises.forEach((promise, index) => {
      // Wrap in Promise.resolve to handle non-promise values
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;
          
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          // Reject immediately on first error
          reject(error);
        });
    });
  });
}

// Promise.all with timeout
function promiseAllWithTimeout(promises, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout);
  });
  
  return Promise.race([
    promiseAll(promises),
    timeoutPromise
  ]);
}

// Promise.allSettled implementation
function promiseAllSettled(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      throw new TypeError('Argument must be an array');
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = new Array(promises.length);
    let completed = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(
          value => {
            results[index] = { status: 'fulfilled', value };
          },
          reason => {
            results[index] = { status: 'rejected', reason };
          }
        )
        .finally(() => {
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        });
    });
  });
}

// Promise.race implementation
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    // Empty array never settles
    if (promises.length === 0) {
      return;
    }
    
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(reject);
    });
  });
}

// Promise.any implementation
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    if (promises.length === 0) {
      return reject(new AggregateError([], 'No promises provided'));
    }
    
    const errors = new Array(promises.length);
    let rejectedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(error => {
          errors[index] = error;
          rejectedCount++;
          
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises rejected'));
          }
        });
    });
  });
}

// Advanced: Promise.all with concurrency limit
function promiseAllWithLimit(promises, limit) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    if (promises.length === 0) {
      return resolve([]);
    }
    
    const results = new Array(promises.length);
    let index = 0;
    let completed = 0;
    let rejected = false;
    
    function runNext() {
      if (rejected) return;
      
      if (index >= promises.length) {
        if (completed === promises.length) {
          resolve(results);
        }
        return;
      }
      
      const currentIndex = index++;
      Promise.resolve(promises[currentIndex])
        .then(value => {
          results[currentIndex] = value;
          completed++;
          runNext();
        })
        .catch(error => {
          rejected = true;
          reject(error);
        });
    }
    
    // Start initial batch
    const initialBatch = Math.min(limit, promises.length);
    for (let i = 0; i < initialBatch; i++) {
      runNext();
    }
  });
}

// Test helper functions
function createDelayedPromise(value, delay) {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
}

function createRejectedPromise(reason, delay) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(reason)), delay);
  });
}

// Test cases
async function runTests() {
  console.log('Testing promiseAll implementation:');
  
  try {
    // Test with successful promises
    const result1 = await promiseAll([
      createDelayedPromise('a', 100),
      createDelayedPromise('b', 200),
      createDelayedPromise('c', 150)
    ]);
    console.log('Success case:', result1); // ['a', 'b', 'c']
    
    // Test with mixed values
    const result2 = await promiseAll([
      Promise.resolve(1),
      2,
      createDelayedPromise(3, 100)
    ]);
    console.log('Mixed values:', result2); // [1, 2, 3]
    
    // Test with rejection
    try {
      await promiseAll([
        createDelayedPromise('a', 100),
        createRejectedPromise('failed', 50),
        createDelayedPromise('c', 150)
      ]);
    } catch (error) {
      console.log('Rejection caught:', error.message); // 'failed'
    }
    
    // Test empty array
    const result3 = await promiseAll([]);
    console.log('Empty array:', result3); // []
    
    // Test with concurrency limit
    console.log('\nTesting with concurrency limit:');
    const result4 = await promiseAllWithLimit([
      createDelayedPromise('a', 100),
      createDelayedPromise('b', 100),
      createDelayedPromise('c', 100),
      createDelayedPromise('d', 100),
      createDelayedPromise('e', 100)
    ], 2);
    console.log('Limited concurrency:', result4); // ['a', 'b', 'c', 'd', 'e']
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
runTests();

module.exports = {
  promiseAll,
  promiseAllWithTimeout,
  promiseAllSettled,
  promiseRace,
  promiseAny,
  promiseAllWithLimit
};