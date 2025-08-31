/**
 * File: clear-all-timeouts.js
 * Description: Implement utility to clear all active timeouts and intervals globally
 * 
 * Problem: Create a function to clear all active timers in the JavaScript environment
 * Level: Medium
 * Asked at: PayPal, Adobe
 * 
 * Learning objectives:
 * - Understand JavaScript timer APIs and their internal mechanisms
 * - Learn timer ID management and tracking strategies
 * - Practice function interception and method override patterns
 * - Explore browser environment cleanup techniques
 * 
 * Time Complexity: O(n) where n is the number of active timers
 * Space Complexity: O(n) for storing timer references
 */

// =======================
// Problem Statement
// =======================

/**
 * Create a utility system that can:
 * 
 * 1. Track all active setTimeout and setInterval calls
 * 2. Provide a function to clear all active timers at once
 * 3. Support selective clearing by timer type or criteria
 * 4. Maintain original timer API behavior
 * 5. Handle edge cases like already cleared timers
 * 6. Provide timer statistics and monitoring capabilities
 * 
 * Requirements:
 * - Must work with existing code without modification
 * - Should not break normal timer functionality
 * - Support both setTimeout and setInterval
 * - Provide cleanup utilities for memory management
 * 
 * Use cases:
 * - Test environment cleanup
 * - Memory leak prevention
 * - Application shutdown procedures
 * - Development/debugging tools
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Timer management system that tracks and controls all active timers
 */
class TimerManager {
    constructor() {
        // TODO: Initialize timer tracking system
        // this.activeTimeouts = new Map();
        // this.activeIntervals = new Map();
        // this.originalSetTimeout = window.setTimeout;
        // this.originalSetInterval = window.setInterval;
        // this.originalClearTimeout = window.clearTimeout;
        // this.originalClearInterval = window.clearInterval;
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Initialize the timer management system by overriding native functions
     */
    init() {
        // TODO: Override native timer functions
        // 1. Store references to original functions
        // 2. Replace setTimeout with tracked version
        // 3. Replace setInterval with tracked version
        // 4. Replace clear functions to update tracking
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Restore original timer functions
     */
    restore() {
        // TODO: Restore original timer functionality
        // 1. Restore window.setTimeout
        // 2. Restore window.setInterval
        // 3. Restore window.clearTimeout
        // 4. Restore window.clearInterval
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Clear all active timeouts
     * 
     * @returns {number} - Number of timeouts cleared
     */
    clearAllTimeouts() {
        // TODO: Clear all tracked timeouts
        // 1. Iterate through active timeouts
        // 2. Call original clearTimeout for each
        // 3. Clear the tracking map
        // 4. Return count of cleared timeouts
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Clear all active intervals
     * 
     * @returns {number} - Number of intervals cleared
     */
    clearAllIntervals() {
        // TODO: Clear all tracked intervals
        // 1. Iterate through active intervals
        // 2. Call original clearInterval for each
        // 3. Clear the tracking map
        // 4. Return count of cleared intervals
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Clear all active timers (both timeouts and intervals)
     * 
     * @returns {Object} - Statistics about cleared timers
     */
    clearAll() {
        // TODO: Clear all timers and return statistics
        // const timeoutsCleared = this.clearAllTimeouts();
        // const intervalsCleared = this.clearAllIntervals();
        // return { timeoutsCleared, intervalsCleared, total: timeoutsCleared + intervalsCleared };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get statistics about active timers
     * 
     * @returns {Object} - Timer statistics
     */
    getStats() {
        // TODO: Return timer statistics
        // return {
        //     activeTimeouts: this.activeTimeouts.size,
        //     activeIntervals: this.activeIntervals.size,
        //     total: this.activeTimeouts.size + this.activeIntervals.size
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Clear timers based on filter criteria
     * 
     * @param {Function} filterFn - Function to determine which timers to clear
     * @returns {Object} - Statistics about cleared timers
     */
    clearFiltered(filterFn) {
        // TODO: Implement selective timer clearing
        // 1. Apply filter to timeout timers
        // 2. Apply filter to interval timers
        // 3. Clear matching timers
        // 4. Return statistics
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to create tracked setTimeout
     * 
     * @param {Function} callback - Timer callback
     * @param {number} delay - Timer delay
     * @param {...*} args - Additional arguments
     * @returns {number} - Timer ID
     */
    _createTrackedTimeout(callback, delay, ...args) {
        // TODO: Create timeout with tracking
        // 1. Generate or get timer ID
        // 2. Store timer metadata
        // 3. Call original setTimeout
        // 4. Set up auto-cleanup on execution
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to create tracked setInterval
     * 
     * @param {Function} callback - Timer callback
     * @param {number} delay - Timer delay
     * @param {...*} args - Additional arguments
     * @returns {number} - Timer ID
     */
    _createTrackedInterval(callback, delay, ...args) {
        // TODO: Create interval with tracking
        // 1. Generate or get timer ID
        // 2. Store timer metadata
        // 3. Call original setInterval
        // 4. Keep tracking until manually cleared
        
        throw new Error('Implementation pending');
    }
}

// =======================
// Functional Implementation
// =======================

/**
 * TODO: Functional approach without class
 * - Use closures to maintain state
 * - Provide simple API functions
 */
function createTimerManager() {
    // TODO: Implement functional timer manager
    // let activeTimeouts = new Map();
    // let activeIntervals = new Map();
    // 
    // return {
    //     init() { /* override functions */ },
    //     clearAll() { /* clear all timers */ },
    //     getStats() { /* return statistics */ }
    // };
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Simple global function approach
 * - Direct implementation without complex tracking
 * - Use brute force ID scanning
 */
function clearAllTimers() {
    // TODO: Brute force approach
    // Try to clear timer IDs in a reasonable range
    // This is less elegant but simpler for basic use cases
    
    throw new Error('Implementation pending');
}

// =======================
// Advanced Features
// =======================

/**
 * TODO: Timer lifecycle hooks
 * - Add callbacks for timer creation, execution, and clearing
 * - Useful for debugging and monitoring
 */
class AdvancedTimerManager extends TimerManager {
    constructor(options = {}) {
        // TODO: Add lifecycle hooks support
        // super();
        // this.onTimerCreate = options.onTimerCreate || (() => {});
        // this.onTimerExecute = options.onTimerExecute || (() => {});
        // this.onTimerClear = options.onTimerClear || (() => {});
        
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Timer debugging utilities
 * - Stack trace capture for timer creation
 * - Timer performance monitoring
 * - Memory usage tracking
 */
function createDebugTimerManager() {
    // TODO: Add debugging capabilities
    throw new Error('Implementation pending');
}

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic timeout clearing
console.log("=== Basic Timeout Clearing Test ===");
const manager = new TimerManager();
manager.init();

// Create some timeouts
const timeout1 = setTimeout(() => console.log("Timeout 1 executed"), 1000);
const timeout2 = setTimeout(() => console.log("Timeout 2 executed"), 2000);
const timeout3 = setTimeout(() => console.log("Timeout 3 executed"), 3000);

console.log("Created 3 timeouts");
console.log("Stats before clearing:", manager.getStats());

// Clear all timeouts
const cleared = manager.clearAllTimeouts();
console.log("Cleared timeouts:", cleared);
console.log("Stats after clearing:", manager.getStats());

// Wait to see if any timeouts execute (they shouldn't)
setTimeout(() => {
    console.log("Test completed - no timeouts should have executed above");
    manager.restore();
}, 4000);

// Test Case 2: Mixed timers clearing
console.log("\n=== Mixed Timers Test ===");
const manager2 = new TimerManager();
manager2.init();

// Create timeouts and intervals
setTimeout(() => console.log("Should not execute"), 1000);
setTimeout(() => console.log("Should not execute"), 2000);
const interval1 = setInterval(() => console.log("Interval 1"), 500);
const interval2 = setInterval(() => console.log("Interval 2"), 800);

console.log("Created 2 timeouts and 2 intervals");
console.log("Initial stats:", manager2.getStats());

// Let intervals run for a bit
setTimeout(() => {
    const clearStats = manager2.clearAll();
    console.log("Cleared all timers:", clearStats);
    console.log("Final stats:", manager2.getStats());
    manager2.restore();
}, 2500);

// Test Case 3: Selective clearing with filter
console.log("\n=== Selective Clearing Test ===");
const manager3 = new TimerManager();
manager3.init();

// Create timers with different delays
setTimeout(() => console.log("Short timeout (100ms)"), 100);
setTimeout(() => console.log("Medium timeout (1000ms)"), 1000);
setTimeout(() => console.log("Long timeout (2000ms)"), 2000);

// Clear only long-running timers (delay > 500ms)
setTimeout(() => {
    const cleared = manager3.clearFiltered((timerInfo) => {
        return timerInfo.delay > 500;
    });
    console.log("Cleared long-running timers:", cleared);
    manager3.restore();
}, 200);

// Test Case 4: Error handling
console.log("\n=== Error Handling Test ===");
const manager4 = new TimerManager();
manager4.init();

// Test clearing already cleared timer
const timeoutId = setTimeout(() => console.log("Should not execute"), 1000);
clearTimeout(timeoutId); // Clear manually first
const stats = manager4.clearAll(); // Should handle already cleared timer gracefully
console.log("Clear stats (should handle cleared timer):", stats);
manager4.restore();

// Test Case 5: Performance test
console.log("\n=== Performance Test ===");
const manager5 = new TimerManager();
manager5.init();

const startTime = performance.now();

// Create many timers
const timerIds = [];
for (let i = 0; i < 1000; i++) {
    timerIds.push(setTimeout(() => {}, i));
}

const createTime = performance.now();
console.log(`Created 1000 timers in ${createTime - startTime}ms`);

const clearStartTime = performance.now();
const clearStats = manager5.clearAll();
const clearTime = performance.now();

console.log(`Cleared ${clearStats.total} timers in ${clearTime - clearStartTime}ms`);
console.log("Final stats:", manager5.getStats());
manager5.restore();

// Test Case 6: Restoration test
console.log("\n=== Function Restoration Test ===");
const originalSetTimeout = window.setTimeout;
const manager6 = new TimerManager();

manager6.init();
console.log("Functions overridden:", window.setTimeout !== originalSetTimeout);

manager6.restore();
console.log("Functions restored:", window.setTimeout === originalSetTimeout);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Implementation Strategies:
 *    - Function interception vs. ID range scanning
 *    - Trade-offs between accuracy and complexity
 *    - Memory overhead of timer tracking
 * 
 * 2. Browser Compatibility:
 *    - Different timer ID generation strategies across browsers
 *    - Handling Node.js vs browser environments
 *    - Web Workers and timer isolation
 * 
 * 3. Edge Cases:
 *    - Already cleared timers
 *    - Nested timer creation within timer callbacks
 *    - Timer ID reuse and collision handling
 * 
 * 4. Performance Considerations:
 *    - Impact of timer tracking on application performance
 *    - Memory usage with large numbers of timers
 *    - Cleanup strategies for long-running applications
 * 
 * 5. Use Cases and Applications:
 *    - Test environment setup and teardown
 *    - Memory leak prevention in SPAs
 *    - Development and debugging tools
 *    - Application lifecycle management
 * 
 * 6. Alternative Approaches:
 *    - Brute force ID scanning (simpler but less efficient)
 *    - Proxy-based interception
 *    - WeakMap-based tracking for automatic cleanup
 * 
 * 7. Extensions and Enhancements:
 *    - Support for requestAnimationFrame
 *    - Timer grouping and namespace management
 *    - Timer performance monitoring and analytics
 *    - Integration with modern async patterns
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TimerManager,
        createTimerManager,
        clearAllTimers,
        AdvancedTimerManager,
        createDebugTimerManager
    };
}