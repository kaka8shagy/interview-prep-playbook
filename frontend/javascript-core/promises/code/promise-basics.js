/**
 * File: promise-basics.js
 * Description: Basic promise creation and usage patterns
 */

// Basic promise creation
const simplePromise = new Promise((resolve, reject) => {
  // Executor function runs immediately
  console.log('Executor running');
  
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      resolve('Operation successful');
    } else {
      reject(new Error('Operation failed'));
    }
  }, 1000);
});

// Promise that resolves
function createResolvedPromise(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 100);
  });
}

// Promise that rejects
function createRejectedPromise(reason) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(reason)), 100);
  });
}

// Promise with cleanup
function createPromiseWithCleanup() {
  let timeoutId;
  
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      resolve('Completed');
    }, 5000);
  });
  
  // Add cleanup method
  promise.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      console.log('Promise cancelled');
    }
  };
  
  return promise;
}

// Promise from callback-based function
function promisify(callbackFn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      callbackFn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

// Example: Convert setTimeout to promise
function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// Promise with multiple resolution paths
function complexPromise(condition) {
  return new Promise((resolve, reject) => {
    if (condition === 'immediate') {
      resolve('Immediate resolution');
    } else if (condition === 'delayed') {
      setTimeout(() => resolve('Delayed resolution'), 1000);
    } else if (condition === 'error') {
      reject(new Error('Condition error'));
    } else {
      // Async operation
      fetch('https://api.example.com/data')
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => reject(err));
    }
  });
}

// Static promise methods
const immediateResolve = Promise.resolve('Immediate value');
const immediateReject = Promise.reject(new Error('Immediate error'));

// Promise from thenable
const thenable = {
  then: function(resolve, reject) {
    setTimeout(() => resolve('Thenable resolved'), 100);
  }
};
const promiseFromThenable = Promise.resolve(thenable);

// Usage examples
console.log('Starting promise examples...');

// Handle simple promise
simplePromise
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error.message))
  .finally(() => console.log('Cleanup complete'));

// Chain multiple operations
delay(1000)
  .then(() => {
    console.log('After 1 second');
    return delay(1000);
  })
  .then(() => {
    console.log('After 2 seconds');
    return 'Done';
  })
  .then(result => console.log('Final result:', result));

// Demonstrate promise states
const pendingPromise = new Promise(() => {});
console.log('Pending promise:', pendingPromise); // Always pending

const fulfilledPromise = Promise.resolve('Fulfilled');
fulfilledPromise.then(val => console.log('Fulfilled with:', val));

const rejectedPromise = Promise.reject(new Error('Rejected'));
rejectedPromise.catch(err => console.log('Rejected with:', err.message));

module.exports = {
  createResolvedPromise,
  createRejectedPromise,
  createPromiseWithCleanup,
  promisify,
  delay,
  complexPromise
};