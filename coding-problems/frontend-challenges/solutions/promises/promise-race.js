/**
 * File: promise-race.js
 * Description: Custom implementation of Promise.race polyfill
 * 
 * Learning objectives:
 * - Understand "first wins" concurrency pattern
 * - Learn how to handle competing async operations
 * - See timeout and cancellation patterns
 * 
 * Time Complexity: O(n) to set up listeners, then O(1) for first completion
 * Space Complexity: O(1) - no result accumulation needed
 */

/**
 * Custom implementation of Promise.race
 * Resolves/rejects with the first promise that settles
 * 
 * Mental model: "First past the post" - first promise to finish wins
 * Useful for timeouts, fallback strategies, or performance optimization
 */
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    // Input validation - ensure we have an iterable
    if (!Array.isArray(promises)) {
      reject(new TypeError('Promise.race expects an iterable'));
      return;
    }
    
    // Handle empty array case - promise never settles (hangs forever)
    // This matches native Promise.race behavior
    if (promises.length === 0) {
      return; // Never resolve or reject
    }
    
    // Set up listeners on all promises
    // The first one to settle (resolve OR reject) wins
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)  // Forward first resolution
        .catch(reject); // Forward first rejection
    });
  });
}

// =======================
// Usage Examples
// =======================

// Example 1: Basic race between fast and slow promises
async function basicRaceExample() {
  const fastPromise = new Promise(resolve => setTimeout(() => resolve('fast'), 100));
  const slowPromise = new Promise(resolve => setTimeout(() => resolve('slow'), 500));
  
  try {
    const winner = await promiseRace([fastPromise, slowPromise]);
    console.log('Winner:', winner); // "fast"
  } catch (error) {
    console.error('Race failed:', error);
  }
}

// Example 2: Timeout pattern using race
function withTimeout(promise, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  
  return promiseRace([promise, timeoutPromise]);
}

// Example 3: Real-world timeout usage
async function fetchWithTimeout() {
  const fetchData = fetch('/api/slow-endpoint').then(r => r.json());
  
  try {
    // Race between API call and 3-second timeout
    const result = await withTimeout(fetchData, 3000);
    console.log('Data loaded in time:', result);
  } catch (error) {
    if (error.message === 'Operation timed out') {
      console.log('API call was too slow, showing cached data');
    } else {
      console.error('Network error:', error);
    }
  }
}

// Example 4: Fallback strategy with multiple sources
async function fetchWithFallback() {
  const primaryAPI = fetch('/api/primary').then(r => r.json());
  const backupAPI = fetch('/api/backup').then(r => r.json());
  const cache = Promise.resolve(getCachedData());
  
  try {
    // First available data source wins
    const data = await promiseRace([primaryAPI, backupAPI, cache]);
    console.log('Data from fastest source:', data);
  } catch (error) {
    console.error('All sources failed:', error);
  }
}

function getCachedData() {
  return { cached: true, data: 'fallback data' };
}

// Export for use in other modules
module.exports = { 
  promiseRace,
  withTimeout,
  basicRaceExample,
  fetchWithTimeout,
  fetchWithFallback
};