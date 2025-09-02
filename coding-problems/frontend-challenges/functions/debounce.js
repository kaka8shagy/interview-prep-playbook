/**
 * File: debounce.js
 * Description: Multiple implementations of debounce function with detailed explanations
 * 
 * Learning objectives:
 * - Understand debounce vs throttle concepts
 * - Learn different implementation approaches
 * - See edge cases and optimizations
 * 
 * Time Complexity: O(1) for each call
 * Space Complexity: O(1) per debounced function
 */

// =======================
// Approach 1: Basic Debounce
// =======================

/**
 * Basic debounce implementation
 * Delays function execution until after wait milliseconds have elapsed
 * since the last time it was invoked
 * 
 * Mental model: Think of debounce like a bouncing ball - only execute
 * the function when the ball stops bouncing (no more calls)
 */
function debounceBasic(func, wait) {
  // Store timeout ID to clear previous timeouts
  // This is the key mechanism - each new call cancels the previous one
  let timeout;
  
  // Return a new function that wraps the original
  // This closure preserves access to 'timeout' and function parameters
  return function debounced(...args) {
    // Store 'this' context to preserve it in setTimeout
    // Arrow functions would lose the correct 'this' binding
    const context = this;
    
    // Clear any existing timeout to "reset the timer"
    // This is what makes it debounce - prevents premature execution
    clearTimeout(timeout);
    
    // Set new timeout to execute function after wait period
    // If another call comes in, this timeout gets cleared above
    timeout = setTimeout(() => {
      // Execute original function with preserved context and arguments
      // Using apply() to maintain proper 'this' binding
      func.apply(context, args);
    }, wait);
  };
}

// =======================
// Approach 2: Debounce with Immediate Option
// =======================

/**
 * Enhanced debounce with immediate execution option
 * If immediate=true, function executes on leading edge instead of trailing edge
 * 
 * Use cases: 
 * - immediate=false (default): Search suggestions, API calls
 * - immediate=true: Button clicks, form submissions
 */
function debounceWithImmediate(func, wait, immediate = false) {
  let timeout;
  
  return function debounced(...args) {
    const context = this;
    
    // Check if we should call function immediately
    // This happens when there's no pending timeout (first call or after wait period)
    const callNow = immediate && !timeout;
    
    // Clear existing timeout regardless of immediate setting
    clearTimeout(timeout);
    
    // Set timeout for trailing edge execution (if not immediate)
    // or to reset the immediate flag after wait period
    timeout = setTimeout(() => {
      // Reset timeout reference
      timeout = null;
      
      // Execute function on trailing edge only if not immediate
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
    
    // Execute immediately if conditions are met
    // This happens only once at the start of a burst of calls
    if (callNow) {
      func.apply(context, args);
    }
  };
}

// =======================
// Approach 3: Debounce with Cancel and Flush
// =======================

/**
 * Advanced debounce with cancel and flush capabilities
 * - cancel(): Cancels pending execution
 * - flush(): Immediately executes pending function
 * - pending(): Returns true if execution is pending
 * 
 * This approach provides full control over debounce behavior
 */
function debounceAdvanced(func, wait, immediate = false) {
  let timeout;
  let lastArgs;
  let lastThis;
  let result;
  let lastCallTime;
  
  // Helper function to check if we should call immediately
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    return lastCallTime === undefined || timeSinceLastCall >= wait;
  }
  
  // Helper function to execute the original function
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    
    // Reset state
    lastArgs = lastThis = undefined;
    result = func.apply(thisArg, args);
    return result;
  }
  
  // Main debounced function
  function debounced(...args) {
    const time = Date.now();
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    const isInvoking = shouldInvoke(time);
    
    if (isInvoking && timeout === undefined) {
      // First call or after wait period - handle immediate execution
      if (immediate) {
        result = invokeFunc(time);
      }
    }
    
    // Clear existing timeout and set new one
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      timeout = undefined;
      if (!immediate) {
        result = invokeFunc(Date.now());
      }
    }, wait);
    
    return result;
  }
  
  // Cancel pending execution
  debounced.cancel = function() {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = lastArgs = lastThis = undefined;
  };
  
  // Execute pending function immediately
  debounced.flush = function() {
    if (timeout !== undefined) {
      const result = invokeFunc(Date.now());
      debounced.cancel();
      return result;
    }
    return result;
  };
  
  // Check if execution is pending
  debounced.pending = function() {
    return timeout !== undefined;
  };
  
  return debounced;
}

// =======================
// Usage Examples and Test Cases
// =======================

// Example 1: Basic usage for search suggestions
console.log('\n=== Basic Debounce Example ===');
let searchCount = 0;
const searchAPI = (query) => {
  console.log(`API Call ${++searchCount}: ${query}`);
};

const debouncedSearch = debounceBasic(searchAPI, 300);

// Simulate rapid typing - only last call should execute
debouncedSearch('a');
debouncedSearch('ap');
debouncedSearch('app');
debouncedSearch('appl');
debouncedSearch('apple'); // Only this call will execute after 300ms

// Example 2: Button click with immediate execution
console.log('\n=== Immediate Debounce Example ===');
let clickCount = 0;
const handleSubmit = () => {
  console.log(`Form submitted ${++clickCount}`);
};

const debouncedSubmit = debounceWithImmediate(handleSubmit, 1000, true);

// Simulate rapid button clicks - only first click executes
debouncedSubmit(); // Executes immediately
debouncedSubmit(); // Ignored
debouncedSubmit(); // Ignored

// Example 3: Advanced usage with control methods
setTimeout(() => {
  console.log('\n=== Advanced Debounce Example ===');
  const advancedDebounced = debounceAdvanced((msg) => {
    console.log(`Advanced: ${msg}`);
  }, 500);
  
  advancedDebounced('First call');
  console.log('Pending?', advancedDebounced.pending()); // true
  
  // Cancel the pending execution
  advancedDebounced.cancel();
  console.log('Pending after cancel?', advancedDebounced.pending()); // false
  
  // New call and immediate flush
  advancedDebounced('Flushed call');
  advancedDebounced.flush(); // Executes immediately
}, 2000);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Window resize handler
 * Debounce expensive calculations during window resize
 */
function createResizeHandler() {
  const handleResize = debounceBasic(() => {
    // Expensive recalculations here
    console.log('Recalculating layout...', window.innerWidth, window.innerHeight);
  }, 250);
  
  return handleResize;
}

/**
 * Use Case 2: Auto-save functionality
 * Save document changes with debounce to avoid excessive API calls
 */
function createAutoSave() {
  const saveDocument = debounceAdvanced(async (content) => {
    try {
      // Simulate API call
      console.log('Saving document...', content.length, 'characters');
      // await api.saveDocument(content);
      console.log('Document saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, 2000);
  
  // Return object with save method and controls
  return {
    save: saveDocument,
    forceSave: () => saveDocument.flush(),
    cancelSave: () => saveDocument.cancel(),
    isPending: () => saveDocument.pending()
  };
}

/**
 * Use Case 3: API search with cleanup
 * Debounced search that cancels previous requests
 */
function createSmartSearch() {
  let currentRequest;
  
  const performSearch = debounceBasic(async (query) => {
    // Cancel previous request if it exists
    if (currentRequest) {
      currentRequest.abort();
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    currentRequest = controller;
    
    try {
      console.log(`Searching for: "${query}"`);
      // Simulate API call
      // const results = await fetch(`/api/search?q=${query}`, {
      //   signal: controller.signal
      // });
      console.log(`Found results for: "${query}"`);
      currentRequest = null;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`Search for "${query}" was cancelled`);
      } else {
        console.error('Search error:', error);
      }
    }
  }, 500);
  
  return performSearch;
}

// Export all implementations
module.exports = {
  debounceBasic,
  debounceWithImmediate,
  debounceAdvanced,
  createResizeHandler,
  createAutoSave,
  createSmartSearch
};

/**
 * Key Interview Points:
 * 
 * 1. Debounce vs Throttle:
 *    - Debounce: Execute after idle period
 *    - Throttle: Execute at regular intervals
 * 
 * 2. Common Implementation Issues:
 *    - Losing 'this' context (use regular functions, not arrows)
 *    - Not preserving arguments correctly
 *    - Memory leaks from not clearing timeouts
 * 
 * 3. Advanced Features:
 *    - Immediate execution option
 *    - Cancel/flush methods
 *    - Pending status check
 * 
 * 4. Real-world Considerations:
 *    - Cleanup on unmount/destruction
 *    - Request cancellation for API calls
 *    - Error handling in async functions
 */