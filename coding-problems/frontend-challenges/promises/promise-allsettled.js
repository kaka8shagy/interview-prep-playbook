/**
 * File: promise-allsettled.js
 * Description: Custom implementation of Promise.allSettled polyfill
 * 
 * Learning objectives:
 * - Understand "wait for all regardless of outcome" pattern
 * - Learn structured error collection and reporting
 * - See how to handle mixed success/failure scenarios
 * 
 * Time Complexity: O(n) where n is number of promises
 * Space Complexity: O(n) for result storage with status metadata
 */

/**
 * Custom implementation of Promise.allSettled
 * Always resolves with array of settlement results (fulfilled/rejected)
 * 
 * Mental model: "Everyone gets a say" - wait for all promises regardless of outcome
 * Useful when you need to know the outcome of all operations, even if some fail
 */
function promiseAllSettled(promises) {
  return new Promise((resolve, reject) => {
    // Input validation - ensure we have an iterable
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.allSettled expects an iterable'));
      return;
    }
    
    // Handle empty array case - immediately resolve with empty array
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    // Pre-allocate results array to maintain order
    const results = new Array(promises.length);
    let settledCount = 0;
    
    // Process each promise, capturing both success and failure outcomes
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          // Promise fulfilled - capture the value
          results[index] = {
            status: 'fulfilled',
            value: value
          };
        })
        .catch(reason => {
          // Promise rejected - capture the reason
          results[index] = {
            status: 'rejected',
            reason: reason
          };
        })
        .finally(() => {
          // Count settled promises regardless of outcome
          settledCount++;
          
          // When all promises have settled, resolve with complete results
          if (settledCount === promises.length) {
            resolve(results);
          }
        });
    });
  });
}

// =======================
// Usage Examples
// =======================

// Example 1: Mixed success and failure scenarios
async function mixedOutcomeExample() {
  const promises = [
    Promise.resolve('Success 1'),
    Promise.reject(new Error('Failed 1')),
    Promise.resolve('Success 2'),
    Promise.reject(new Error('Failed 2'))
  ];
  
  const results = await promiseAllSettled(promises);
  console.log('All settled results:', results);
  
  // Process results by status
  const successes = results.filter(r => r.status === 'fulfilled');
  const failures = results.filter(r => r.status === 'rejected');
  
  console.log(`${successes.length} succeeded, ${failures.length} failed`);
}

// Example 2: Real-world batch processing
async function batchApiCallsExample() {
  const userIds = [1, 2, 3, 4, 5];
  const userFetches = userIds.map(id => 
    fetch(`/api/users/${id}`).then(r => r.json())
  );
  
  const results = await promiseAllSettled(userFetches);
  
  const loadedUsers = [];
  const failedIds = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      loadedUsers.push(result.value);
    } else {
      failedIds.push(userIds[index]);
      console.error(`Failed to load user ${userIds[index]}:`, result.reason);
    }
  });
  
  console.log(`Loaded ${loadedUsers.length} users, ${failedIds.length} failed`);
  return { users: loadedUsers, failedIds };
}

// Export for use in other modules
module.exports = { 
  promiseAllSettled,
  mixedOutcomeExample,
  batchApiCallsExample
};