/**
 * File: array-push-events.js
 * Description: Create custom array implementation with event dispatching on push operations
 * 
 * Problem: Implement Array.push() polyfill with custom event system
 * Level: Medium
 * Asked at: Flipkart, Myntra
 * 
 * Learning objectives:
 * - Understand prototype manipulation and method overriding
 * - Learn event-driven programming patterns in JavaScript
 * - Practice observer pattern implementation
 * - Explore array mutation detection techniques
 * 
 * Time Complexity: O(1) for push operation, O(n) for event notification where n is number of listeners
 * Space Complexity: O(n) for storing event listeners
 */

// =======================
// Problem Statement
// =======================

/**
 * Create a custom array implementation or polyfill that:
 * 
 * 1. Extends native Array functionality
 * 2. Dispatches custom events when elements are pushed
 * 3. Allows multiple event listeners to be registered
 * 4. Provides detailed event information (added elements, new length, etc.)
 * 5. Supports event listener removal
 * 6. Maintains original Array.push() behavior and return value
 * 
 * Event details should include:
 * - Type of operation ('push')
 * - Added elements
 * - Previous length
 * - New length
 * - Timestamp of operation
 * 
 * Usage example:
 * const arr = new EventArray();
 * arr.addEventListener('push', (event) => console.log('Elements added:', event.addedElements));
 * arr.push(1, 2, 3); // Triggers event
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Custom EventArray class that dispatches events on push operations
 */
class EventArray extends Array {
    constructor(...args) {
        // TODO: Initialize the array and event system
        // super(...args);
        // this._eventListeners = new Map();
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Override push method to dispatch events
     * 
     * @param {...*} elements - Elements to add to the array
     * @returns {number} - New length of the array
     */
    push(...elements) {
        // TODO: Implement event-dispatching push
        // 1. Store previous state
        // 2. Call original push method
        // 3. Create event object with details
        // 4. Dispatch event to all listeners
        // 5. Return new length
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Add event listener for array operations
     * 
     * @param {string} eventType - Type of event to listen for ('push', 'pop', etc.)
     * @param {Function} listener - Callback function to execute
     */
    addEventListener(eventType, listener) {
        // TODO: Implement event listener registration
        // 1. Validate eventType and listener
        // 2. Initialize event type array if needed
        // 3. Add listener to appropriate collection
        // 4. Prevent duplicate listeners
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Remove event listener
     * 
     * @param {string} eventType - Type of event
     * @param {Function} listener - Listener to remove
     * @returns {boolean} - Whether listener was found and removed
     */
    removeEventListener(eventType, listener) {
        // TODO: Implement event listener removal
        // 1. Find listener in collection
        // 2. Remove if found
        // 3. Return success status
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to dispatch events to listeners
     * 
     * @param {string} eventType - Type of event
     * @param {Object} eventData - Event details
     */
    _dispatchEvent(eventType, eventData) {
        // TODO: Implement event dispatching
        // 1. Get listeners for event type
        // 2. Create complete event object
        // 3. Call each listener with event data
        // 4. Handle listener errors gracefully
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get all registered listeners for debugging
     * 
     * @returns {Object} - Map of event types to listener arrays
     */
    getEventListeners() {
        // TODO: Return copy of listeners for inspection
        throw new Error('Implementation pending');
    }
}

// =======================
// Alternative Polyfill Implementation
// =======================

/**
 * TODO: Global Array.prototype polyfill approach
 * - Extend Array.prototype instead of creating new class
 * - Add global event system for all arrays
 */
function polyfillArrayWithEvents() {
    // TODO: Implement prototype-based polyfill
    // const originalPush = Array.prototype.push;
    // 
    // Array.prototype.push = function(...elements) {
    //     // Event dispatching logic
    //     return originalPush.apply(this, elements);
    // };
    // 
    // Array.prototype.addEventListener = function(eventType, listener) {
    //     // Event listener management
    // };
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Proxy-based implementation
 * - Use Proxy to intercept array operations
 * - More comprehensive mutation detection
 */
function createProxyArray(initialArray = []) {
    // TODO: Implement proxy-based event array
    // return new Proxy(initialArray, {
    //     set(target, property, value) {
    //         // Intercept array modifications
    //     }
    // });
    
    throw new Error('Implementation pending');
}

// =======================
// Event System Utilities
// =======================

/**
 * TODO: Event object factory
 * - Standardize event object structure
 * - Add additional metadata
 */
function createArrayEvent(type, data) {
    // TODO: Create standardized event object
    // return {
    //     type,
    //     timestamp: Date.now(),
    //     target: data.array,
    //     ...data
    // };
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Batch event system
 * - Group multiple operations into single event
 * - Debounce rapid mutations
 */
class BatchedEventArray extends EventArray {
    constructor(...args) {
        // TODO: Add batching capability
        super(...args);
        throw new Error('Implementation pending');
    }
}

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic event dispatching
console.log("=== Basic Event Dispatching Test ===");
const arr1 = new EventArray();

arr1.addEventListener('push', (event) => {
    console.log('Push event:', {
        addedElements: event.addedElements,
        newLength: event.newLength,
        previousLength: event.previousLength
    });
});

console.log("Pushing elements: 1, 2, 3");
const newLength = arr1.push(1, 2, 3);
console.log("Returned length:", newLength);
console.log("Array contents:", [...arr1]);
// Expected: Event fired with addedElements: [1, 2, 3], newLength: 3, previousLength: 0

// Test Case 2: Multiple listeners
console.log("\n=== Multiple Listeners Test ===");
const arr2 = new EventArray();

const listener1 = (event) => console.log("Listener 1:", event.addedElements);
const listener2 = (event) => console.log("Listener 2: Array length is now", event.newLength);

arr2.addEventListener('push', listener1);
arr2.addEventListener('push', listener2);

arr2.push('a', 'b');
// Expected: Both listeners should fire

// Test Case 3: Event listener removal
console.log("\n=== Event Listener Removal Test ===");
const arr3 = new EventArray();

const tempListener = (event) => console.log("This should be removed");
arr3.addEventListener('push', tempListener);
arr3.removeEventListener('push', tempListener);

arr3.push('should not trigger removed listener');
// Expected: No event output

// Test Case 4: Multiple push operations
console.log("\n=== Multiple Push Operations Test ===");
const arr4 = new EventArray(10, 20);

let pushCount = 0;
arr4.addEventListener('push', (event) => {
    pushCount++;
    console.log(`Push #${pushCount}: Added ${event.addedElements.length} elements`);
});

arr4.push(30);
arr4.push(40, 50);
arr4.push(60, 70, 80, 90);
console.log("Total pushes:", pushCount);
console.log("Final array:", [...arr4]);

// Test Case 5: Error handling in listeners
console.log("\n=== Error Handling Test ===");
const arr5 = new EventArray();

arr5.addEventListener('push', (event) => {
    throw new Error("Listener error");
});

arr5.addEventListener('push', (event) => {
    console.log("This listener should still execute despite previous error");
});

try {
    arr5.push('test');
} catch (e) {
    console.log("Caught error:", e.message);
}

// Test Case 6: Event object structure validation
console.log("\n=== Event Object Structure Test ===");
const arr6 = new EventArray();

arr6.addEventListener('push', (event) => {
    console.log("Event structure:");
    console.log("- Type:", event.type);
    console.log("- Timestamp:", typeof event.timestamp);
    console.log("- Target:", event.target === arr6);
    console.log("- Added elements:", event.addedElements);
    console.log("- Previous length:", event.previousLength);
    console.log("- New length:", event.newLength);
});

arr6.push(100, 200, 300);

// Performance test
console.log("\n=== Performance Test ===");
const largeArr = new EventArray();
const startTime = performance.now();

// Add many listeners to test performance impact
for (let i = 0; i < 100; i++) {
    largeArr.addEventListener('push', () => {});
}

largeArr.push(...Array.from({length: 1000}, (_, i) => i));

const endTime = performance.now();
console.log(`Push with 100 listeners took ${endTime - startTime}ms`);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Implementation Approaches:
 *    - Class extension vs prototype modification vs Proxy
 *    - Trade-offs between different approaches
 *    - When to use each pattern
 * 
 * 2. Event System Design:
 *    - Observer pattern implementation
 *    - Event object structure and standardization
 *    - Memory management for event listeners
 * 
 * 3. Performance Considerations:
 *    - Impact of event dispatching on array operations
 *    - Optimization strategies for many listeners
 *    - Memory leaks prevention with proper cleanup
 * 
 * 4. Error Handling:
 *    - How to handle errors in event listeners
 *    - Should one failing listener stop others?
 *    - Graceful degradation strategies
 * 
 * 5. Edge Cases:
 *    - Handling inherited arrays
 *    - Duplicate listener prevention
 *    - Event listener removal edge cases
 * 
 * 6. Real-world Applications:
 *    - React-like state change detection
 *    - Data binding in MVC frameworks
 *    - Debugging and monitoring tools
 *    - Undo/redo functionality implementation
 * 
 * 7. Extensions:
 *    - Supporting other array methods (pop, shift, unshift)
 *    - Batch operation events
 *    - Conditional event dispatching
 *    - Event propagation control
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EventArray,
        polyfillArrayWithEvents,
        createProxyArray,
        createArrayEvent,
        BatchedEventArray
    };
}