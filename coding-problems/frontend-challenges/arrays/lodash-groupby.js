/**
 * File: lodash-groupby.js
 * Description: Implement Lodash groupBy functionality with advanced features
 * 
 * Problem: Create a comprehensive groupBy utility similar to Lodash's implementation
 * Level: Medium
 * Asked at: Atlassian, Shopify
 * 
 * Learning objectives:
 * - Understand functional programming patterns and data transformation
 * - Learn flexible key generation strategies and iteratee patterns
 * - Practice object manipulation and efficient grouping algorithms
 * - Explore advanced grouping scenarios and edge cases
 * 
 * Time Complexity: O(n) where n is the number of elements
 * Space Complexity: O(n) for storing grouped results
 */

// =======================
// Problem Statement
// =======================

/**
 * Implement a groupBy function that creates an object composed of keys generated 
 * from the results of running each element through an iteratee function. The 
 * corresponding value of each key is an array of elements responsible for 
 * generating the key.
 * 
 * Features to implement:
 * 1. Support for different iteratee types (function, string, object)
 * 2. Nested property path access (e.g., 'user.address.city')
 * 3. Multiple grouping criteria
 * 4. Custom key transformation functions
 * 5. Handling of complex data types and edge cases
 * 6. Performance optimizations for large datasets
 * 
 * Examples:
 * groupBy([6.1, 4.2, 6.3], Math.floor) // { '4': [4.2], '6': [6.1, 6.3] }
 * groupBy(['one', 'two', 'three'], 'length') // { '3': ['one', 'two'], '5': ['three'] }
 * groupBy(users, 'department.name') // Groups by nested property
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Groups elements of collection by the result of running each element through iteratee
 * 
 * @param {Array|Object} collection - The collection to iterate over
 * @param {Function|string|Object} iteratee - The iteratee to transform keys
 * @returns {Object} - Returns the composed aggregate object
 */
function groupBy(collection, iteratee) {
    // TODO: Implement the main groupBy function
    // 
    // Steps needed:
    // 1. Validate input parameters
    // 2. Convert iteratee to appropriate function format
    // 3. Iterate through collection elements
    // 4. Generate keys using iteratee
    // 5. Group elements by generated keys
    // 6. Return grouped object
    
    throw new Error('Implementation pending');
    
    /**
     * Internal helper to convert iteratee to function
     * 
     * @param {Function|string|Object} iteratee - The iteratee to convert
     * @returns {Function} - Converted iteratee function
     */
    function createIteratee(iteratee) {
        // TODO: Handle different iteratee types
        // 1. Function: return as-is
        // 2. String: create property accessor
        // 3. Object: create matcher function
        // 4. Array: create multi-property accessor
        
        return null;
    }
    
    /**
     * Internal helper to access nested object properties
     * 
     * @param {Object} obj - Object to access
     * @param {string} path - Property path (e.g., 'user.profile.name')
     * @returns {*} - Property value or undefined
     */
    function getNestedProperty(obj, path) {
        // TODO: Implement safe property access
        // Handle cases like:
        // - 'name' (simple property)
        // - 'user.name' (nested property)
        // - 'items[0].name' (array access)
        
        return undefined;
    }
}

// =======================
// Advanced Grouping Functions
// =======================

/**
 * TODO: Multi-level groupBy implementation
 * Groups by multiple criteria creating nested groups
 * 
 * @param {Array} collection - Collection to group
 * @param {...(Function|string)} iteratees - Multiple grouping criteria
 * @returns {Object} - Nested grouped object
 */
function groupByMultiple(collection, ...iteratees) {
    // TODO: Implement multi-level grouping
    // Example: groupByMultiple(users, 'department', 'role')
    // Result: { 'Engineering': { 'Senior': [user1], 'Junior': [user2] } }
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Conditional groupBy with filtering
 * Groups elements but only includes those that pass a predicate
 * 
 * @param {Array} collection - Collection to group
 * @param {Function|string} iteratee - Grouping criteria
 * @param {Function} predicate - Filter predicate
 * @returns {Object} - Filtered grouped object
 */
function groupByIf(collection, iteratee, predicate) {
    // TODO: Implement conditional grouping
    // Only group elements that satisfy the predicate
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Counted groupBy
 * Groups elements and returns count instead of arrays
 * 
 * @param {Array} collection - Collection to group
 * @param {Function|string} iteratee - Grouping criteria
 * @returns {Object} - Object with keys and counts
 */
function countBy(collection, iteratee) {
    // TODO: Implement count-based grouping
    // Similar to groupBy but returns counts instead of element arrays
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Indexed groupBy
 * Groups elements with additional index information
 * 
 * @param {Array} collection - Collection to group
 * @param {Function|string} iteratee - Grouping criteria
 * @returns {Object} - Grouped object with index metadata
 */
function groupByWithIndex(collection, iteratee) {
    // TODO: Include original indices in grouped results
    // Useful for tracking element positions after grouping
    
    throw new Error('Implementation pending');
}

// =======================
// Utility Functions
// =======================

/**
 * TODO: Key transformation utilities
 * Functions to transform grouping keys
 */
const KeyTransformers = {
    /**
     * Convert keys to lowercase
     */
    lowercase: (key) => {
        // TODO: Implement lowercase transformation
        throw new Error('Implementation pending');
    },
    
    /**
     * Normalize numeric keys
     */
    numeric: (key) => {
        // TODO: Implement numeric normalization
        throw new Error('Implementation pending');
    },
    
    /**
     * Custom key formatter
     */
    custom: (formatter) => {
        // TODO: Return custom formatter function
        throw new Error('Implementation pending');
    }
};

/**
 * TODO: Collection type detection utilities
 * Helper functions to handle different collection types
 */
const CollectionUtils = {
    /**
     * Check if value is array-like
     */
    isArrayLike: (value) => {
        // TODO: Implement array-like detection
        throw new Error('Implementation pending');
    },
    
    /**
     * Convert collection to array for processing
     */
    toArray: (collection) => {
        // TODO: Convert various collection types to arrays
        throw new Error('Implementation pending');
    },
    
    /**
     * Get collection size
     */
    size: (collection) => {
        // TODO: Get size of different collection types
        throw new Error('Implementation pending');
    }
};

// =======================
// Performance Optimized Versions
// =======================

/**
 * TODO: Memory-efficient groupBy for large datasets
 * Uses streaming approach to handle large collections
 * 
 * @param {Iterable} collection - Large collection to group
 * @param {Function|string} iteratee - Grouping criteria
 * @param {Object} options - Performance options
 * @returns {Object} - Grouped results
 */
function groupByLarge(collection, iteratee, options = {}) {
    // TODO: Implement memory-efficient grouping
    // Consider:
    // - Streaming processing
    // - Memory usage limits
    // - Chunk-based processing
    // - Progress callbacks
    
    throw new Error('Implementation pending');
}

/**
 * TODO: Parallel groupBy using Web Workers (browser) or Worker Threads (Node.js)
 * Splits large collections across multiple workers
 * 
 * @param {Array} collection - Collection to group
 * @param {Function|string} iteratee - Grouping criteria
 * @param {number} workerCount - Number of workers to use
 * @returns {Promise<Object>} - Promise resolving to grouped results
 */
async function groupByParallel(collection, iteratee, workerCount = 4) {
    // TODO: Implement parallel grouping
    // 1. Split collection into chunks
    // 2. Process chunks in parallel workers
    // 3. Merge results from all workers
    
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
// Test Case 1: Basic function iteratee
console.log("=== Basic Function Iteratee Test ===");
const numbers = [6.1, 4.2, 6.3, 2.8, 1.9];
const grouped1 = groupBy(numbers, Math.floor);
console.log("Numbers grouped by Math.floor:", grouped1);
// Expected: { '1': [1.9], '2': [2.8], '4': [4.2], '6': [6.1, 6.3] }

// Test Case 2: String property iteratee
console.log("\n=== String Property Iteratee Test ===");
const words = ['one', 'two', 'three', 'four', 'five'];
const grouped2 = groupBy(words, 'length');
console.log("Words grouped by length:", grouped2);
// Expected: { '3': ['one', 'two'], '4': ['four', 'five'], '5': ['three'] }

// Test Case 3: Complex object grouping
console.log("\n=== Complex Object Grouping Test ===");
const users = [
    { id: 1, name: 'Alice', department: { name: 'Engineering', id: 1 }, role: 'Senior' },
    { id: 2, name: 'Bob', department: { name: 'Engineering', id: 1 }, role: 'Junior' },
    { id: 3, name: 'Carol', department: { name: 'Marketing', id: 2 }, role: 'Senior' },
    { id: 4, name: 'Dave', department: { name: 'Engineering', id: 1 }, role: 'Senior' },
    { id: 5, name: 'Eve', department: { name: 'Marketing', id: 2 }, role: 'Manager' }
];

const grouped3 = groupBy(users, 'department.name');
console.log("Users grouped by department:", grouped3);
// Expected: { 'Engineering': [Alice, Bob, Dave], 'Marketing': [Carol, Eve] }

const grouped4 = groupBy(users, user => `${user.department.name}-${user.role}`);
console.log("Users grouped by department-role:", grouped4);

// Test Case 4: Multi-level grouping
console.log("\n=== Multi-level Grouping Test ===");
const grouped5 = groupByMultiple(users, 'department.name', 'role');
console.log("Multi-level grouping:", grouped5);
// Expected nested structure by department then role

// Test Case 5: Count-based grouping
console.log("\n=== Count-based Grouping Test ===");
const grouped6 = countBy(users, 'department.name');
console.log("Department counts:", grouped6);
// Expected: { 'Engineering': 3, 'Marketing': 2 }

// Test Case 6: Array with mixed data types
console.log("\n=== Mixed Data Types Test ===");
const mixed = [1, '2', 3, '4', 5, null, undefined, true, false];
const grouped7 = groupBy(mixed, value => typeof value);
console.log("Mixed data grouped by type:", grouped7);
// Expected: groups by 'number', 'string', 'object', 'undefined', 'boolean'

// Test Case 7: Empty and edge cases
console.log("\n=== Edge Cases Test ===");
console.log("Empty array:", groupBy([], x => x));
console.log("Single element:", groupBy([42], x => x));
console.log("All same key:", groupBy([1, 1, 1], x => 'same'));

// Test Case 8: Complex nested properties
console.log("\n=== Complex Nested Properties Test ===");
const complexData = [
    { info: { address: { city: 'New York', country: 'USA' } }, tags: ['urgent'] },
    { info: { address: { city: 'London', country: 'UK' } }, tags: ['normal'] },
    { info: { address: { city: 'New York', country: 'USA' } }, tags: ['urgent', 'important'] },
    { info: { address: { city: 'Paris', country: 'France' } }, tags: [] }
];

const grouped8 = groupBy(complexData, 'info.address.city');
console.log("Complex nested grouping:", grouped8);

// Test Case 9: Performance test with large dataset
console.log("\n=== Performance Test ===");
const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    category: `category_${i % 10}`,
    value: Math.random() * 1000
}));

console.time('Large dataset grouping');
const groupedLarge = groupBy(largeDataset, 'category');
console.timeEnd('Large dataset grouping');
console.log(`Grouped ${largeDataset.length} items into ${Object.keys(groupedLarge).length} groups`);

// Test Case 10: Custom iteratee function
console.log("\n=== Custom Iteratee Function Test ===");
const scores = [
    { name: 'Alice', score: 95 },
    { name: 'Bob', score: 78 },
    { name: 'Carol', score: 88 },
    { name: 'Dave', score: 92 },
    { name: 'Eve', score: 65 }
];

const gradeBands = groupBy(scores, score => {
    if (score.score >= 90) return 'A';
    if (score.score >= 80) return 'B';
    if (score.score >= 70) return 'C';
    return 'D';
});
console.log("Scores grouped by grade bands:", gradeBands);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Iteratee Flexibility:
 *    - Supporting different iteratee types (function, string, object)
 *    - Nested property access strategies
 *    - Performance implications of different iteratee types
 * 
 * 2. Data Structure Choices:
 *    - Using objects vs Maps for grouping results
 *    - Memory considerations with large datasets
 *    - Key collision handling and type coercion
 * 
 * 3. Edge Case Handling:
 *    - null/undefined values in collection
 *    - Missing properties in nested access
 *    - Non-string keys and their serialization
 * 
 * 4. Performance Optimization:
 *    - Caching iteratee functions
 *    - Early termination strategies
 *    - Memory management for large collections
 * 
 * 5. Functional Programming Patterns:
 *    - Composition with other utility functions
 *    - Immutability considerations
 *    - Lazy evaluation possibilities
 * 
 * 6. Real-world Applications:
 *    - Data aggregation and reporting
 *    - UI component organization
 *    - Database query result processing
 *    - Analytics and metrics calculation
 * 
 * 7. Extension Points:
 *    - Custom key transformation functions
 *    - Streaming/chunked processing for huge datasets
 *    - Integration with reactive programming patterns
 *    - Multi-criteria grouping strategies
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        groupBy,
        groupByMultiple,
        groupByIf,
        countBy,
        groupByWithIndex,
        KeyTransformers,
        CollectionUtils,
        groupByLarge,
        groupByParallel
    };
}