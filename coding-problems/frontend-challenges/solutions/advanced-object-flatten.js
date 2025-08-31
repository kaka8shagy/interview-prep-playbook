/**
 * File: advanced-object-flatten.js
 * Description: Advanced object flattening with multiple strategies and custom key formatting
 * 
 * Problem: Implement advanced object flattening functionality
 * Level: Medium
 * Asked at: Razorpay, PhonePe
 * 
 * Learning objectives:
 * - Understand recursive object traversal patterns
 * - Learn different flattening strategies (dot notation, bracket notation)
 * - Practice handling complex nested structures with arrays and objects
 * - Implement custom key transformation logic
 * 
 * Time Complexity: O(n) where n is the total number of properties
 * Space Complexity: O(d) where d is the maximum depth of nesting
 */

// =======================
// Problem Statement
// =======================

/**
 * Create an advanced object flattening utility that can handle various scenarios:
 * 
 * 1. Flatten nested objects using dot notation (default)
 * 2. Support bracket notation for array indices
 * 3. Handle mixed object and array structures
 * 4. Provide custom key transformation options
 * 5. Support different separator characters
 * 6. Handle edge cases like circular references and null values
 * 
 * Example transformations:
 * Input: { a: { b: { c: 1 } }, d: [1, 2, { e: 3 }] }
 * Output (dot): { 'a.b.c': 1, 'd.0': 1, 'd.1': 2, 'd.2.e': 3 }
 * Output (bracket): { 'a[b][c]': 1, 'd[0]': 1, 'd[1]': 2, 'd[2][e]': 3 }
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Advanced object flattening function with configurable options
 * 
 * @param {Object} obj - The object to flatten
 * @param {Object} options - Configuration options
 * @param {string} options.separator - Key separator (default: '.')
 * @param {boolean} options.useBrackets - Use bracket notation for arrays (default: false)
 * @param {Function} options.keyTransform - Custom key transformation function
 * @param {number} options.maxDepth - Maximum depth to flatten (default: Infinity)
 * @returns {Object} - Flattened object
 */
function flattenObject(obj, options = {}) {
    // TODO: Implement the main flattening logic
    // 
    // Default options structure:
    // const defaultOptions = {
    //     separator: '.',
    //     useBrackets: false,
    //     keyTransform: null,
    //     maxDepth: Infinity,
    //     handleCircular: true
    // };
    
    throw new Error('Implementation pending');
    
    /**
     * Internal recursive flattening function
     * 
     * @param {*} current - Current value being processed
     * @param {string} prefix - Current key prefix
     * @param {number} depth - Current recursion depth
     * @param {Set} visited - Set to track circular references
     * @returns {Object} - Partial flattened result
     */
    function flattenRecursive(current, prefix = '', depth = 0, visited = new Set()) {
        // TODO: Implement recursive flattening logic
        // 1. Handle circular reference detection
        // 2. Check max depth limit
        // 3. Process different value types (object, array, primitive)
        // 4. Apply key transformation and formatting
        // 5. Merge results from recursive calls
        
        return {};
    }
    
    /**
     * Format key based on configuration options
     * 
     * @param {string} prefix - Current prefix
     * @param {string|number} key - Property key or array index
     * @param {boolean} isArrayIndex - Whether the key is an array index
     * @returns {string} - Formatted key
     */
    function formatKey(prefix, key, isArrayIndex) {
        // TODO: Implement key formatting logic
        // Handle different notation styles:
        // - Dot notation: 'a.b.c'
        // - Bracket notation: 'a[b][c]'
        // - Mixed notation: 'a.b[0].c'
        
        return '';
    }
}

/**
 * Utility function to unflatten a previously flattened object
 * 
 * @param {Object} flattened - Flattened object to restore
 * @param {string} separator - Key separator used during flattening
 * @returns {Object} - Restored nested object
 */
function unflattenObject(flattened, separator = '.') {
    // TODO: Implement unflatten logic
    // 1. Parse flattened keys back to nested structure
    // 2. Handle array reconstruction
    // 3. Preserve original data types
    
    throw new Error('Implementation pending');
}

// =======================
// Alternative Implementation Ideas
// =======================

/**
 * TODO: Lodash-style flatten implementation
 * - Support for custom iteratee functions
 * - Predicate-based flattening control
 */
function flattenWith(obj, iteratee) {
    // TODO: Implement lodash-style flattening
    throw new Error('Implementation pending');
}

/**
 * TODO: Performance-optimized implementation
 * - Use iterative approach instead of recursion for large objects
 * - Memory-efficient processing for deeply nested structures
 */
function flattenIterative(obj, options = {}) {
    // TODO: Implement iterative version
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
// Test Case 1: Basic nested object
console.log("=== Basic Nested Object Test ===");
const obj1 = {
    a: {
        b: {
            c: 1,
            d: 2
        },
        e: 3
    },
    f: 4
};
console.log("Original:", obj1);
console.log("Flattened:", flattenObject(obj1));
// Expected: { 'a.b.c': 1, 'a.b.d': 2, 'a.e': 3, 'f': 4 }

// Test Case 2: Object with arrays
console.log("\n=== Object with Arrays Test ===");
const obj2 = {
    users: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
    ],
    settings: {
        theme: 'dark',
        notifications: ['email', 'sms']
    }
};
console.log("Original:", obj2);
console.log("Flattened (dot):", flattenObject(obj2));
console.log("Flattened (bracket):", flattenObject(obj2, { useBrackets: true }));
// Expected dot: { 'users.0.name': 'Alice', 'users.0.age': 30, ... }
// Expected bracket: { 'users[0][name]': 'Alice', 'users[0][age]': 30, ... }

// Test Case 3: Custom separator and key transform
console.log("\n=== Custom Options Test ===");
const obj3 = {
    user_profile: {
        personal_info: {
            first_name: 'John',
            last_name: 'Doe'
        }
    }
};
const customOptions = {
    separator: '_',
    keyTransform: (key) => key.toUpperCase()
};
console.log("Original:", obj3);
console.log("Flattened (custom):", flattenObject(obj3, customOptions));
// Expected: { 'USER_PROFILE_PERSONAL_INFO_FIRST_NAME': 'John', ... }

// Test Case 4: Max depth limitation
console.log("\n=== Max Depth Test ===");
const obj4 = {
    level1: {
        level2: {
            level3: {
                level4: 'deep value'
            }
        }
    }
};
console.log("Original:", obj4);
console.log("Flattened (depth 2):", flattenObject(obj4, { maxDepth: 2 }));
// Expected: { 'level1.level2': { level3: { level4: 'deep value' } } }

// Test Case 5: Edge cases
console.log("\n=== Edge Cases Test ===");
const obj5 = {
    nullValue: null,
    undefinedValue: undefined,
    emptyObject: {},
    emptyArray: [],
    zeroValue: 0,
    falseValue: false
};
console.log("Original:", obj5);
console.log("Flattened:", flattenObject(obj5));

// Test Case 6: Unflatten test
console.log("\n=== Unflatten Test ===");
const flattened = { 'a.b.c': 1, 'a.d': 2, 'e.0': 3, 'e.1': 4 };
console.log("Flattened:", flattened);
console.log("Unflattened:", unflattenObject(flattened));
// Expected: { a: { b: { c: 1 }, d: 2 }, e: [3, 4] }

// Performance test
console.log("\n=== Performance Test ===");
const largeObj = {};
for (let i = 0; i < 1000; i++) {
    largeObj[`key${i}`] = {
        nested: {
            value: i,
            array: [i, i * 2, i * 3]
        }
    };
}

console.time('Flatten Large Object');
const flattened_large = flattenObject(largeObj);
console.timeEnd('Flatten Large Object');
console.log(`Flattened keys: ${Object.keys(flattened_large).length}`);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Algorithm Design:
 *    - Recursive vs iterative approaches
 *    - How to handle different data types (objects, arrays, primitives)
 *    - Memory efficiency considerations for large objects
 * 
 * 2. Configuration Options:
 *    - Why provide different key formatting options?
 *    - Trade-offs between flexibility and simplicity
 *    - When to use bracket notation vs dot notation
 * 
 * 3. Edge Cases:
 *    - Circular reference detection and handling
 *    - Maximum depth protection against stack overflow
 *    - Handling special values (null, undefined, functions)
 * 
 * 4. Performance Considerations:
 *    - Time complexity analysis for different object structures
 *    - Memory usage optimization techniques
 *    - When to prefer iterative over recursive implementation
 * 
 * 5. Use Cases:
 *    - Form data serialization for HTTP requests
 *    - Database query parameter flattening
 *    - Configuration management systems
 *    - JSON transformation pipelines
 * 
 * 6. Extension Points:
 *    - How would you add support for custom data types?
 *    - Implementing partial flattening with predicate functions
 *    - Adding schema validation during flattening process
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        flattenObject,
        unflattenObject,
        flattenWith,
        flattenIterative
    };
}