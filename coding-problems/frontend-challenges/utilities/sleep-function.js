/**
 * File: sleep-function.js
 * Description: Multiple implementations of sleep/delay functions for JavaScript
 * 
 * Learning objectives:
 * - Understand asynchronous delay patterns
 * - Learn Promise-based timing vs callbacks
 * - See practical applications in async workflows
 * 
 * Time Complexity: O(1) setup, O(n) wait time
 * Space Complexity: O(1)
 */

// =======================
// Approach 1: Basic Promise Sleep
// =======================

/**
 * Simple Promise-based sleep function
 * Returns a Promise that resolves after specified milliseconds
 * 
 * Mental model: Like setTimeout but returns a Promise
 * Most common and straightforward implementation
 */
function sleep(milliseconds) {
  // Input validation
  if (typeof milliseconds !== 'number' || milliseconds < 0) {
    return Promise.reject(new Error('Sleep duration must be a non-negative number'));
  }
  
  // Return a Promise that resolves after the delay
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

// =======================
// Approach 2: Sleep with Value Return
// =======================

/**
 * Sleep function that can return a value after the delay
 * Useful for chaining operations or returning computed results
 * 
 * Mental model: Delay + optional value return
 */
function sleepWithValue(milliseconds, value) {
  return new Promise(resolve => {
    setTimeout(() => {
      // Resolve with the provided value, or undefined if none
      resolve(value);
    }, milliseconds);
  });
}

// =======================
// Approach 3: Cancellable Sleep
// =======================

/**
 * Sleep function that can be cancelled before completion
 * Returns both a Promise and a cancel function
 * 
 * Mental model: setTimeout with manual cancellation capability
 * Useful for user interactions or condition changes
 */
function cancellableSleep(milliseconds) {
  let timeoutId;
  let isCancelled = false;
  
  const sleepPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        resolve();
      }
    }, milliseconds);
  });
  
  // Return both the promise and cancel function
  return {
    promise: sleepPromise,
    cancel: () => {
      if (!isCancelled) {
        isCancelled = true;
        clearTimeout(timeoutId);
        // Note: Promise remains pending (can't reject cancelled ones safely)
      }
    },
    isCancelled: () => isCancelled
  };
}

// =======================
// Approach 4: Sleep with Progress Callback
// =======================

/**
 * Sleep function that calls a progress callback during the wait
 * Useful for progress indicators or periodic updates
 * 
 * Mental model: setInterval during sleep for progress tracking
 */
function sleepWithProgress(milliseconds, progressCallback, progressInterval = 100) {
  return new Promise(resolve => {
    const startTime = Date.now();
    let progressTimer;
    
    // Set up progress reporting if callback provided
    if (typeof progressCallback === 'function') {
      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / milliseconds, 1);
        
        progressCallback({
          elapsed,
          remaining: Math.max(0, milliseconds - elapsed),
          progress: progress,
          percentage: Math.round(progress * 100)
        });
        
        // Stop progress updates when complete
        if (progress >= 1) {
          clearInterval(progressTimer);
        }
      }, progressInterval);
    }
    
    // Main sleep timer
    setTimeout(() => {
      if (progressTimer) {
        clearInterval(progressTimer);
        // Final progress callback
        if (typeof progressCallback === 'function') {
          progressCallback({
            elapsed: milliseconds,
            remaining: 0,
            progress: 1,
            percentage: 100
          });
        }
      }
      resolve();
    }, milliseconds);
  });
}

// =======================
// Approach 5: Adaptive Sleep (Performance-Aware)
// =======================

/**
 * Sleep function that adapts to system performance
 * Uses requestAnimationFrame for frame-aligned delays
 * Falls back to setTimeout for longer delays
 * 
 * Mental model: Choose optimal timing mechanism based on duration
 */
function adaptiveSleep(milliseconds) {
  // For very short delays, use requestAnimationFrame for better performance
  if (milliseconds < 50) {
    return new Promise(resolve => {
      const startTime = performance.now();
      
      function frame() {
        if (performance.now() - startTime >= milliseconds) {
          resolve();
        } else {
          requestAnimationFrame(frame);
        }
      }
      
      requestAnimationFrame(frame);
    });
  }
  
  // For longer delays, use regular setTimeout
  return sleep(milliseconds);
}

// =======================
// Approach 6: Sleep with Exponential Backoff
// =======================

/**
 * Sleep function for retry mechanisms with exponential backoff
 * Commonly used in API retry logic and error handling
 * 
 * Mental model: Progressively longer delays for subsequent retries
 */
function exponentialSleep(attempt, baseDelay = 1000, maxDelay = 30000, backoffFactor = 2) {
  // Calculate delay: baseDelay * (backoffFactor ^ attempt)
  const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  const finalDelay = delay + jitter;
  
  console.log(`Sleeping for ${Math.round(finalDelay)}ms (attempt ${attempt + 1})`);
  
  return sleep(finalDelay);
}

// =======================
// Approach 7: Conditional Sleep
// =======================

/**
 * Sleep function that waits for a condition to be true
 * Combines polling with delay for condition-based waiting
 * 
 * Mental model: Keep checking until condition is met or timeout
 */
function sleepUntil(condition, checkInterval = 100, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      // Check if condition is satisfied
      if (condition()) {
        resolve();
        return;
      }
      
      // Check for timeout
      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Condition not met within ${timeout}ms timeout`));
        return;
      }
      
      // Continue checking
      setTimeout(check, checkInterval);
    }
    
    // Start checking
    check();
  });
}

// =======================
// Utility Functions for Common Patterns
// =======================

/**
 * Sleep with automatic retry on failure
 * Useful for network operations or flaky operations
 */
async function sleepRetry(operation, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error; // Last attempt failed
      }
      
      console.log(`Attempt ${attempt + 1} failed, retrying after delay...`);
      await exponentialSleep(attempt, baseDelay);
    }
  }
}

/**
 * Sleep with rate limiting
 * Ensures minimum time between operations
 */
function createRateLimitedSleep(minimumInterval = 1000) {
  let lastCallTime = 0;
  
  return async function rateLimitedSleep() {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < minimumInterval) {
      const remainingDelay = minimumInterval - timeSinceLastCall;
      await sleep(remainingDelay);
    }
    
    lastCallTime = Date.now();
  };
}

// =======================
// Real-world Usage Examples
// =======================

// Example 1: API retry with exponential backoff
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempting to fetch ${url} (attempt ${attempt + 1})`);
      // Simulate API call
      if (Math.random() < 0.7) throw new Error('Network error');
      
      return { data: 'Success!', attempt: attempt + 1 };
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      await exponentialSleep(attempt);
    }
  }
}

// Example 2: Animation with frame-aligned delays
async function animateElement(element, steps = 60, duration = 1000) {
  const stepDelay = duration / steps;
  
  for (let step = 0; step < steps; step++) {
    // Update element (example: opacity fade)
    if (element && element.style) {
      element.style.opacity = (steps - step) / steps;
    }
    
    // Use adaptive sleep for smooth animation
    await adaptiveSleep(stepDelay);
  }
}

// Example 3: Waiting for DOM element to appear
async function waitForElement(selector, timeout = 5000) {
  return sleepUntil(
    () => document.querySelector(selector) !== null,
    100,
    timeout
  );
}

// =======================
// Testing and Demonstration
// =======================

async function demonstrateSleepFunctions() {
  console.log('\n=== Basic Sleep Demo ===');
  console.log('Starting sleep...');
  const start = Date.now();
  
  await sleep(1000);
  console.log(`Slept for ${Date.now() - start}ms`);
  
  console.log('\n=== Sleep with Value Demo ===');
  const result = await sleepWithValue(500, 'Hello after delay!');
  console.log('Received:', result);
  
  console.log('\n=== Cancellable Sleep Demo ===');
  const cancellable = cancellableSleep(2000);
  
  // Cancel after 1 second
  setTimeout(() => {
    console.log('Cancelling sleep...');
    cancellable.cancel();
  }, 1000);
  
  try {
    await cancellable.promise;
    console.log('Sleep completed');
  } catch (error) {
    console.log('Sleep was cancelled');
  }
  
  console.log('\n=== Progress Sleep Demo ===');
  await sleepWithProgress(2000, (progress) => {
    console.log(`Progress: ${progress.percentage}% (${progress.remaining}ms remaining)`);
  }, 500);
  
  console.log('\n=== Rate Limited Operations Demo ===');
  const rateLimitedOp = createRateLimitedSleep(1000);
  
  console.log('Rapid operations with rate limiting:');
  for (let i = 0; i < 3; i++) {
    const opStart = Date.now();
    await rateLimitedOp();
    console.log(`Operation ${i + 1} completed after ${Date.now() - opStart}ms`);
  }
}

// Uncomment to run demos
// demonstrateSleepFunctions().catch(console.error);

// Export for use in other modules
module.exports = {
  sleep,
  sleepWithValue,
  cancellableSleep,
  sleepWithProgress,
  adaptiveSleep,
  exponentialSleep,
  sleepUntil,
  sleepRetry,
  createRateLimitedSleep,
  // Utility examples
  fetchWithRetry,
  animateElement,
  waitForElement
};