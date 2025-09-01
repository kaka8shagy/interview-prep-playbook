/**
 * File: promise-any.js
 * Description: Custom implementation of Promise.any polyfill
 * 
 * Learning objectives:
 * - Understand "first success wins" pattern
 * - Learn AggregateError handling for all-rejection cases
 * - See optimistic fallback strategies in action
 * 
 * Time Complexity: O(n) to set up, O(1) for first success
 * Space Complexity: O(n) for error collection in worst case
 */

/**
 * Custom implementation of Promise.any
 * Resolves with the first fulfilled promise, rejects only if all reject
 * 
 * Mental model: "First success wins, all must fail to fail"
 * Useful for optimistic operations with multiple fallback options
 */
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    // Input validation
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.any expects an iterable'));
      return;
    }
    
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }
    
    const errors = [];
    let rejectedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          // First success immediately resolves
          resolve(value);
        })
        .catch(error => {
          // Collect errors for potential AggregateError
          errors[index] = error;
          rejectedCount++;
          
          // Only reject if ALL promises have been rejected
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        });
    });
  });
}

// Polyfill AggregateError if not available (older environments)
if (typeof AggregateError === 'undefined') {
  global.AggregateError = class AggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.name = 'AggregateError';
      this.errors = errors;
    }
  };
}

// =======================
// Usage Examples
// =======================

// Example 1: First success wins
async function firstSuccessExample() {
  const promises = [
    Promise.reject(new Error('Failed 1')),
    Promise.resolve('Success!'),
    Promise.reject(new Error('Failed 2'))
  ];
  
  try {
    const result = await promiseAny(promises);
    console.log('First success:', result); // "Success!"
  } catch (error) {
    console.error('All failed:', error);
  }
}

// Example 2: Multiple API fallbacks
async function apiWithFallbacks() {
  const primaryAPI = fetch('/api/primary').then(r => r.json());
  const secondaryAPI = fetch('/api/secondary').then(r => r.json());  
  const tertiaryAPI = fetch('/api/tertiary').then(r => r.json());
  
  try {
    // Use whichever API responds successfully first
    const data = await promiseAny([primaryAPI, secondaryAPI, tertiaryAPI]);
    console.log('Got data from fastest working API:', data);
    return data;
  } catch (aggregateError) {
    console.error('All APIs failed:', aggregateError.errors);
    throw new Error('No API available');
  }
}

// Export for use in other modules
module.exports = { 
  promiseAny,
  firstSuccessExample,
  apiWithFallbacks
};