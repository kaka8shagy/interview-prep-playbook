/**
 * File: throttle.js
 * Description: Multiple implementations of throttle function with detailed explanations
 * 
 * Learning objectives:
 * - Understand throttle vs debounce differences
 * - Learn different throttling strategies
 * - See performance optimization techniques
 * 
 * Time Complexity: O(1) for each call
 * Space Complexity: O(1) per throttled function
 */

// =======================
// Approach 1: Basic Throttle (Leading Edge)
// =======================

/**
 * Basic throttle implementation - executes on leading edge
 * Ensures function is called at most once per wait period
 * 
 * Mental model: Think of throttle like a rate limiter - it controls
 * the frequency of execution, not the timing after activity stops
 */
function throttleBasic(func, wait) {
  // Track the last time the function was executed
  // This is the key difference from debounce - we track execution, not calls
  let lastRun = 0;
  
  return function throttled(...args) {
    const now = Date.now();
    
    // Check if enough time has passed since last execution
    // This prevents the function from running too frequently
    if (now - lastRun >= wait) {
      // Update last run time BEFORE executing to prevent race conditions
      lastRun = now;
      
      // Execute immediately - this is "leading edge" behavior
      return func.apply(this, args);
    }
    
    // If not enough time has passed, silently ignore the call
    // This is different from debounce which would reset the timer
  };
}

// =======================
// Approach 2: Throttle with Trailing Edge
// =======================

/**
 * Throttle with trailing edge execution
 * Ensures the last call in a burst is eventually executed
 * 
 * Use cases: Scroll handlers, mouse move events where you need
 * both regular updates AND final state capture
 */
function throttleTrailing(func, wait) {
  let timeout;
  let lastRun = 0;
  let lastArgs;
  let lastContext;
  
  return function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastContext = this;
    
    // Execute immediately if enough time has passed (leading edge)
    if (now - lastRun >= wait) {
      lastRun = now;
      return func.apply(this, args);
    }
    
    // Schedule trailing execution if not already scheduled
    if (!timeout) {
      timeout = setTimeout(() => {
        // Execute with the most recent arguments
        lastRun = Date.now();
        func.apply(lastContext, lastArgs);
        
        // Reset timeout reference
        timeout = null;
      }, wait - (now - lastRun));
    }
  };
}

// =======================
// Approach 3: Advanced Throttle with Options
// =======================

/**
 * Advanced throttle with leading/trailing options
 * Provides full control over execution timing
 * 
 * Options:
 * - leading: Execute on the leading edge (default: true)
 * - trailing: Execute on the trailing edge (default: false)
 */
function throttleAdvanced(func, wait, options = {}) {
  let timeout;
  let previous = 0;
  let result;
  
  // Default options
  const { leading = true, trailing = false } = options;
  
  // Helper function to execute the original function
  const later = function() {
    // Reset previous time for leading edge calculation
    previous = leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(this.context, this.args);
  };
  
  return function throttled(...args) {
    const now = Date.now();
    const context = this;
    
    // Initialize previous time on first call if leading is disabled
    if (!previous && leading === false) {
      previous = now;
    }
    
    // Calculate remaining time until next allowed execution
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      // Time to execute (leading edge or after wait period)
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout && trailing !== false) {
      // Schedule trailing execution
      timeout = setTimeout(() => {
        later.call({ context, args });
      }, remaining);
    }
    
    return result;
  };
}

// =======================
// Approach 4: Throttle with Cancel and Flush
// =======================

/**
 * Full-featured throttle with control methods
 * Similar to lodash throttle implementation
 */
function throttleComplete(func, wait, options = {}) {
  let timeout;
  let previous = 0;
  let result;
  let lastArgs;
  let lastThis;
  
  const { leading = true, trailing = true } = options;
  
  // Helper to invoke the original function
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    previous = time;
    result = func.apply(thisArg, args);
    return result;
  }
  
  // Helper for trailing edge execution
  function trailingEdge(time) {
    timeout = undefined;
    
    // Only invoke if we have `lastArgs` which means func was called
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }
  
  // Helper to cancel trailing execution
  function cancel() {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    previous = 0;
    timeout = lastArgs = lastThis = undefined;
  }
  
  // Helper to immediately execute pending function
  function flush() {
    return timeout === undefined ? result : trailingEdge(Date.now());
  }
  
  // Check if execution is pending
  function pending() {
    return timeout !== undefined;
  }
  
  // Main throttled function
  function throttled(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    
    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(time);
      }
      if (trailing) {
        // Restart timer for trailing edge
        timeout = setTimeout(() => trailingEdge(Date.now()), wait);
        return leading ? invokeFunc(time) : result;
      }
    }
    
    if (timeout === undefined) {
      timeout = setTimeout(() => trailingEdge(Date.now()), wait);
    }
    
    return result;
  }
  
  // Helper functions for timing logic
  function shouldInvoke(time) {
    const timeSinceLastCall = time - previous;
    return (previous === 0) || (timeSinceLastCall >= wait) || (timeSinceLastCall < 0);
  }
  
  function leadingEdge(time) {
    previous = time;
    timeout = setTimeout(() => trailingEdge(Date.now()), wait);
    return leading ? invokeFunc(time) : result;
  }
  
  // Attach control methods
  throttled.cancel = cancel;
  throttled.flush = flush;
  throttled.pending = pending;
  
  return throttled;
}

// =======================
// Approach 5: RequestAnimationFrame Throttle
// =======================

/**
 * RAF-based throttle for smooth visual updates
 * Perfect for scroll, resize, and animation handlers
 * 
 * Automatically syncs with browser's refresh rate (~60fps)
 */
function throttleRAF(func) {
  let rafId;
  let lastArgs;
  let lastContext;
  
  return function throttled(...args) {
    lastArgs = args;
    lastContext = this;
    
    // Only schedule if not already scheduled
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        // Execute with most recent arguments
        func.apply(lastContext, lastArgs);
        
        // Reset for next frame
        rafId = null;
      });
    }
  };
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Throttle Example ===');
let scrollCount = 0;
const handleScroll = () => {
  console.log(`Scroll handler called ${++scrollCount}`);
};

const throttledScroll = throttleBasic(handleScroll, 100);

// Simulate rapid scroll events - should execute at most every 100ms
throttledScroll(); // Executes immediately
throttledScroll(); // Ignored (too soon)
throttledScroll(); // Ignored (too soon)

setTimeout(() => {
  throttledScroll(); // Executes (100ms+ passed)
  throttledScroll(); // Ignored (too soon)
}, 150);

console.log('\n=== Trailing Edge Throttle Example ===');
let inputCount = 0;
const handleInput = (value) => {
  console.log(`Input processed: ${value} (call ${++inputCount})`);
};

const throttledInput = throttleTrailing(handleInput, 300);

// Simulate rapid typing - first and last calls should execute
throttledInput('a'); // Executes immediately
throttledInput('ap'); // Scheduled for trailing
throttledInput('app'); // Updates trailing args
throttledInput('appl'); // Updates trailing args
throttledInput('apple'); // Updates trailing args - this will execute after 300ms

console.log('\n=== Advanced Throttle Example ===');
setTimeout(() => {
  const advancedThrottled = throttleAdvanced((msg) => {
    console.log(`Advanced throttle: ${msg}`);
  }, 200, { leading: true, trailing: true });
  
  // Test rapid calls
  advancedThrottled('First'); // Leading edge - executes immediately
  advancedThrottled('Second'); // Trailing edge - scheduled
  advancedThrottled('Third'); // Updates trailing
  advancedThrottled('Fourth'); // Updates trailing - will execute after delay
}, 1000);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Scroll position tracker
 * Update scroll position indicator without overwhelming the browser
 */
function createScrollTracker() {
  const updateScrollPosition = throttleRAF(() => {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    console.log(`Scroll position: ${scrollPercent.toFixed(1)}%`);
    
    // Update progress bar or scroll indicator
    // const progressBar = document.querySelector('.scroll-progress');
    // if (progressBar) {
    //   progressBar.style.width = `${scrollPercent}%`;
    // }
  });
  
  return updateScrollPosition;
}

/**
 * Use Case 2: Button click rate limiting
 * Prevent spam clicking on expensive operations
 */
function createRateLimitedAction(action, delay = 1000) {
  const throttledAction = throttleBasic(async (...args) => {
    try {
      console.log('Executing rate-limited action...');
      const result = await action(...args);
      console.log('Action completed successfully');
      return result;
    } catch (error) {
      console.error('Action failed:', error);
      throw error;
    }
  }, delay);
  
  return throttledAction;
}

/**
 * Use Case 3: API call throttling with backoff
 * Limit API calls while preserving the most recent request
 */
function createAPIThrottler(apiCall, minInterval = 1000) {
  let lastCallTime = 0;
  let pendingCall = null;
  
  return async function throttledAPI(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall >= minInterval) {
      // Can execute immediately
      lastCallTime = now;
      return apiCall(...args);
    } else {
      // Need to wait - cancel pending call and schedule new one
      if (pendingCall) {
        clearTimeout(pendingCall);
      }
      
      return new Promise((resolve, reject) => {
        const delay = minInterval - timeSinceLastCall;
        
        pendingCall = setTimeout(async () => {
          try {
            lastCallTime = Date.now();
            const result = await apiCall(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingCall = null;
          }
        }, delay);
      });
    }
  };
}

/**
 * Use Case 4: Mouse movement handler with cleanup
 * Track mouse position with throttling and cleanup
 */
function createMouseTracker() {
  let isTracking = false;
  
  const handleMouseMove = throttleRAF((event) => {
    console.log(`Mouse position: ${event.clientX}, ${event.clientY}`);
    
    // Update cursor followers or tooltips
    // updateCursorEffects(event.clientX, event.clientY);
  });
  
  const startTracking = () => {
    if (!isTracking) {
      isTracking = true;
      document.addEventListener('mousemove', handleMouseMove);
    }
  };
  
  const stopTracking = () => {
    if (isTracking) {
      isTracking = false;
      document.removeEventListener('mousemove', handleMouseMove);
      
      // Cancel any pending RAF if using throttleRAF with cancel method
      if (handleMouseMove.cancel) {
        handleMouseMove.cancel();
      }
    }
  };
  
  return { startTracking, stopTracking };
}

// =======================
// Performance Comparison Demo
// =======================

/**
 * Function to demonstrate performance differences between
 * throttle strategies for different use cases
 */
function performanceDemo() {
  console.log('\n=== Performance Comparison ===');
  
  let basicCount = 0;
  let rafCount = 0;
  let trailingCount = 0;
  
  const basicThrottle = throttleBasic(() => basicCount++, 16); // ~60fps
  const rafThrottle = throttleRAF(() => rafCount++);
  const trailingThrottle = throttleTrailing(() => trailingCount++, 16);
  
  // Simulate 1000 rapid calls
  for (let i = 0; i < 1000; i++) {
    basicThrottle();
    rafThrottle();
    trailingThrottle();
  }
  
  setTimeout(() => {
    console.log('After 1000 rapid calls:');
    console.log(`Basic throttle executions: ${basicCount}`);
    console.log(`RAF throttle executions: ${rafCount}`);
    console.log(`Trailing throttle executions: ${trailingCount}`);
  }, 100);
}

// Run performance demo
setTimeout(performanceDemo, 3000);

// Export all implementations
module.exports = {
  throttleBasic,
  throttleTrailing,
  throttleAdvanced,
  throttleComplete,
  throttleRAF,
  createScrollTracker,
  createRateLimitedAction,
  createAPIThrottler,
  createMouseTracker,
  performanceDemo
};

/**
 * Key Interview Points:
 * 
 * 1. Throttle vs Debounce:
 *    - Throttle: Limits execution frequency (rate limiting)
 *    - Debounce: Delays execution until idle period
 *    - Throttle maintains regular intervals, debounce resets on each call
 * 
 * 2. Leading vs Trailing Edge:
 *    - Leading: Execute immediately on first call
 *    - Trailing: Execute after wait period with latest args
 *    - Both: Combine for comprehensive coverage
 * 
 * 3. requestAnimationFrame vs setTimeout:
 *    - RAF: Syncs with display refresh rate, better for visual updates
 *    - setTimeout: Precise timing control, good for non-visual operations
 * 
 * 4. Memory Management:
 *    - Clear timeouts on cancel/cleanup
 *    - Remove event listeners when component unmounts
 *    - Use WeakMap for instance-specific throttling
 * 
 * 5. Edge Cases:
 *    - Rapid successive calls
 *    - Long idle periods
 *    - Clock adjustments (Date.now() vs performance.now())
 *    - Context preservation in async operations
 */