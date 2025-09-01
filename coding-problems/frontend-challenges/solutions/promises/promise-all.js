/**
 * File: promise-all.js
 * Description: Custom implementation of Promise.all polyfill
 * 
 * Learning objectives:
 * - Understand "all or nothing" concurrency pattern
 * - Learn proper error handling in promise coordination
 * - See array result ordering preservation
 * 
 * Time Complexity: O(n) where n is number of promises
 * Space Complexity: O(n) for result storage
 */

/**
 * Custom implementation of Promise.all
 * Resolves when all promises resolve, rejects on first rejection
 * 
 * Mental model: "All or nothing" - if any promise fails, the whole operation fails
 * This is useful when you need ALL operations to succeed before proceeding
 */
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Input validation - ensure we have an iterable
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.all expects an iterable'));
      return;
    }
    
    // Handle empty array case - immediately resolve with empty array
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    // Pre-allocate results array to maintain order
    const results = new Array(promises.length);
    let completedCount = 0;
    
    // Process each promise, maintaining result order
    promises.forEach((promise, index) => {
      // Convert non-promises to promises for consistent handling
      Promise.resolve(promise)
        .then(value => {
          // Store result at the correct index to preserve order
          results[index] = value;
          completedCount++;
          
          // Check if all promises have completed successfully
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          // First rejection immediately rejects the whole operation
          // This implements the "fail fast" behavior
          reject(error);
        });
    });
  });
}

// =======================
// Usage Examples
// =======================

// Example 1: Basic usage with successful promises
async function basicExample() {
  const promise1 = Promise.resolve(3);
  const promise2 = Promise.resolve(42);
  const promise3 = Promise.resolve("hello");
  
  try {
    const results = await promiseAll([promise1, promise2, promise3]);
    console.log('All promises resolved:', results); // [3, 42, "hello"]
  } catch (error) {
    console.error('Promise.all failed:', error);
  }
}

// Example 2: Failure case - one promise rejects
async function failureExample() {
  const promise1 = Promise.resolve(1);
  const promise2 = Promise.reject(new Error('Failed!'));
  const promise3 = Promise.resolve(3);
  
  try {
    const results = await promiseAll([promise1, promise2, promise3]);
    console.log('Results:', results); // This won't execute
  } catch (error) {
    console.error('Promise.all failed:', error.message); // "Failed!"
  }
}

// Example 3: Real-world use case - API calls
async function apiExample() {
  const fetchUser = fetch('/api/user/1').then(r => r.json());
  const fetchPosts = fetch('/api/posts').then(r => r.json());
  const fetchComments = fetch('/api/comments').then(r => r.json());
  
  try {
    const [user, posts, comments] = await promiseAll([fetchUser, fetchPosts, fetchComments]);
    console.log('All data loaded:', { user, posts, comments });
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// Export for use in other modules
module.exports = { 
  promiseAll,
  basicExample,
  failureExample,
  apiExample
};