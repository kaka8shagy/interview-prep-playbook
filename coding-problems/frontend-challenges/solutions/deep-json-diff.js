/**
 * File: deep-json-diff.js
 * Description: Advanced JSON deep comparison and difference detection utility
 * 
 * Problem: Implement comprehensive JSON diff with change tracking and patch generation
 * Level: Hard
 * Asked at: GitHub, Figma
 * 
 * Learning objectives:
 * - Understand deep object comparison algorithms and optimization strategies
 * - Learn change detection patterns and diff representation formats
 * - Practice recursive traversal with complex data structure handling
 * - Explore patch generation and application mechanisms
 * 
 * Time Complexity: O(n) where n is the total number of properties in both objects
 * Space Complexity: O(d) where d is the maximum depth of nesting
 */

// =======================
// Problem Statement
// =======================

/**
 * Create a comprehensive JSON diff utility that provides:
 * 
 * 1. Deep comparison between two JSON objects/arrays
 * 2. Detailed change detection (added, removed, modified)
 * 3. Path-based change tracking for nested structures
 * 4. Multiple diff output formats (detailed, compact, patch)
 * 5. Patch generation and application capabilities
 * 6. Custom comparison functions for specific data types
 * 7. Performance optimization for large objects
 * 8. Configurable diff options and strategies
 * 
 * Advanced features:
 * - Array diff with intelligent matching (by ID, by position, by content)
 * - Circular reference detection and handling
 * - Custom equality functions for complex objects
 * - Diff visualization and formatting utilities
 * - Merge conflict detection and resolution
 * - Reversible patches for undo/redo functionality
 * - Performance monitoring and optimization
 * - Integration with version control patterns
 * 
 * Use cases:
 * - State management and change tracking
 * - API response comparison and validation
 * - Form data change detection
 * - Database record versioning
 * - Configuration management
 * - Real-time collaboration features
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Change types enumeration
 */
const ChangeType = {
    ADDED: 'added',
    REMOVED: 'removed',
    MODIFIED: 'modified',
    ARRAY_ITEM_ADDED: 'array_item_added',
    ARRAY_ITEM_REMOVED: 'array_item_removed',
    ARRAY_ITEM_MODIFIED: 'array_item_modified',
    ARRAY_ITEM_MOVED: 'array_item_moved'
};

/**
 * Main deep JSON diff utility class
 */
class DeepJSONDiff {
    constructor(options = {}) {
        // TODO: Initialize diff utility with options
        // this.options = {
        //     // Comparison options
        //     ignoreCase: options.ignoreCase || false,
        //     ignoreWhitespace: options.ignoreWhitespace || false,
        //     ignoreArrayOrder: options.ignoreArrayOrder || false,
        //     
        //     // Array comparison strategy
        //     arrayDiffStrategy: options.arrayDiffStrategy || 'position', // 'position', 'id', 'content'
        //     arrayIdKey: options.arrayIdKey || 'id',
        //     
        //     // Performance options
        //     maxDepth: options.maxDepth || Infinity,
        //     detectCircular: options.detectCircular !== false,
        //     
        //     // Output options
        //     includeOriginalValues: options.includeOriginalValues !== false,
        //     generatePaths: options.generatePaths !== false,
        //     
        //     // Custom comparison functions
        //     customComparers: options.customComparers || new Map()
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Compare two objects and return detailed diff
     * 
     * @param {*} obj1 - First object to compare
     * @param {*} obj2 - Second object to compare
     * @param {string} basePath - Base path for nested comparisons
     * @returns {Object} - Detailed diff result
     */
    compare(obj1, obj2, basePath = '') {
        // TODO: Main comparison function
        // return {
        //     hasChanges: boolean,
        //     changes: ChangeInfo[],
        //     summary: {
        //         added: number,
        //         removed: number,
        //         modified: number,
        //         unchanged: number
        //     },
        //     paths: string[]
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Generate patch object that can be applied to transform obj1 to obj2
     * 
     * @param {*} obj1 - Source object
     * @param {*} obj2 - Target object
     * @returns {Object} - JSON patch compatible operations
     */
    generatePatch(obj1, obj2) {
        // TODO: Generate RFC 6902 JSON Patch compatible operations
        // return [
        //     { op: 'add', path: '/path', value: newValue },
        //     { op: 'remove', path: '/path' },
        //     { op: 'replace', path: '/path', value: newValue },
        //     { op: 'move', from: '/old/path', path: '/new/path' },
        //     { op: 'copy', from: '/source/path', path: '/target/path' },
        //     { op: 'test', path: '/path', value: expectedValue }
        // ];
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Apply patch to an object
     * 
     * @param {*} obj - Object to patch
     * @param {Array} patch - Array of patch operations
     * @returns {*} - Patched object (new instance)
     */
    applyPatch(obj, patch) {
        // TODO: Apply JSON patch operations to object
        // 1. Validate patch operations
        // 2. Apply operations in order
        // 3. Handle edge cases and errors
        // 4. Return new patched object
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Reverse a patch to create undo operations
     * 
     * @param {Array} patch - Original patch operations
     * @param {*} originalObject - Original object before patch
     * @returns {Array} - Reverse patch operations
     */
    reversePatch(patch, originalObject) {
        // TODO: Generate reverse patch for undo functionality
        // 1. Analyze each patch operation
        // 2. Generate inverse operations
        // 3. Handle order dependencies
        // 4. Return reverse patch array
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to compare primitive values
     * 
     * @param {*} val1 - First value
     * @param {*} val2 - Second value
     * @param {string} path - Current path
     * @returns {Object|null} - Change info or null if no change
     */
    _comparePrimitive(val1, val2, path) {
        // TODO: Compare primitive values with options
        // 1. Handle null/undefined cases
        // 2. Apply ignore options (case, whitespace)
        // 3. Use custom comparers if available
        // 4. Return change info or null
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to compare objects
     * 
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @param {string} path - Current path
     * @param {Set} visited - Visited objects for circular reference detection
     * @returns {Array} - Array of changes
     */
    _compareObjects(obj1, obj2, path, visited = new Set()) {
        // TODO: Compare object properties
        // 1. Handle circular reference detection
        // 2. Get all unique keys from both objects
        // 3. Compare each property recursively
        // 4. Track added, removed, and modified properties
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to compare arrays
     * 
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @param {string} path - Current path
     * @param {Set} visited - Visited objects for circular reference detection
     * @returns {Array} - Array of changes
     */
    _compareArrays(arr1, arr2, path, visited = new Set()) {
        // TODO: Compare arrays using configured strategy
        // 1. Choose comparison strategy (position, id, content)
        // 2. Handle different array lengths
        // 3. Detect moved, added, removed items
        // 4. Generate appropriate change objects
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method for position-based array comparison
     * 
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @param {string} path - Current path
     * @param {Set} visited - Visited objects
     * @returns {Array} - Array of changes
     */
    _compareArraysByPosition(arr1, arr2, path, visited) {
        // TODO: Compare arrays by index position
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method for ID-based array comparison
     * 
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @param {string} path - Current path
     * @param {Set} visited - Visited objects
     * @returns {Array} - Array of changes
     */
    _compareArraysById(arr1, arr2, path, visited) {
        // TODO: Compare arrays using ID field for matching
        // 1. Create ID maps for both arrays
        // 2. Find matching, added, and removed items
        // 3. Detect item modifications
        // 4. Handle moved items if order is ignored
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to create change info object
     * 
     * @param {string} type - Change type
     * @param {string} path - Property path
     * @param {*} oldValue - Original value
     * @param {*} newValue - New value
     * @param {Object} extra - Additional information
     * @returns {Object} - Change info object
     */
    _createChange(type, path, oldValue, newValue, extra = {}) {
        // TODO: Create standardized change object
        // return {
        //     type,
        //     path,
        //     oldValue: this.options.includeOriginalValues ? oldValue : undefined,
        //     newValue,
        //     timestamp: Date.now(),
        //     ...extra
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to check if value is object
     * 
     * @param {*} value - Value to check
     * @returns {boolean} - Whether value is object
     */
    _isObject(value) {
        // TODO: Check if value is plain object
        // return value !== null && typeof value === 'object' && !Array.isArray(value);
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to format path
     * 
     * @param {string} basePath - Base path
     * @param {string|number} key - Property key or array index
     * @returns {string} - Formatted path
     */
    _formatPath(basePath, key) {
        // TODO: Format path for nested properties
        // Handle array indices and object properties
        throw new Error('Implementation pending');
    }
}

// =======================
// Specialized Diff Utilities
// =======================

/**
 * TODO: Performance-optimized diff for large objects
 * Uses hashing and smart comparison strategies
 */
class FastJSONDiff extends DeepJSONDiff {
    constructor(options = {}) {
        // TODO: Initialize fast diff with performance optimizations
        // super(options);
        // this.enableHashing = options.enableHashing !== false;
        // this.hashCache = new Map();
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Generate hash for object to enable fast comparison
     * 
     * @param {*} obj - Object to hash
     * @returns {string} - Hash string
     */
    _generateHash(obj) {
        // TODO: Generate fast hash for object
        // 1. Handle different data types
        // 2. Create stable hash (same input = same hash)
        // 3. Cache hashes for performance
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Fast shallow comparison using hashes
     * 
     * @param {*} obj1 - First object
     * @param {*} obj2 - Second object
     * @returns {boolean} - Whether objects are potentially different
     */
    _fastCompare(obj1, obj2) {
        // TODO: Quick hash-based comparison
        // Return true if objects are definitely different
        // Return false if they might be the same (need deep comparison)
        
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Visual diff formatter for human-readable output
 * Formats diff results for display and debugging
 */
class DiffFormatter {
    constructor(options = {}) {
        // TODO: Initialize formatter
        // this.options = {
        //     colorize: options.colorize !== false,
        //     indent: options.indent || 2,
        //     maxLength: options.maxLength || 100,
        //     showTypes: options.showTypes || false
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Format diff results as human-readable text
     * 
     * @param {Object} diffResult - Diff result from DeepJSONDiff
     * @returns {string} - Formatted diff text
     */
    formatAsText(diffResult) {
        // TODO: Format as readable text
        // 1. Group changes by type
        // 2. Format each change with appropriate symbols
        // 3. Apply colorization if enabled
        // 4. Handle long values with truncation
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Format diff as HTML for web display
     * 
     * @param {Object} diffResult - Diff result
     * @returns {string} - HTML formatted diff
     */
    formatAsHTML(diffResult) {
        // TODO: Format as HTML with styling
        throw new Error('Implementation pending');
    }
    
    /**
     * Format diff as unified diff format
     * 
     * @param {Object} diffResult - Diff result
     * @param {string} filename1 - First file name
     * @param {string} filename2 - Second file name
     * @returns {string} - Unified diff format
     */
    formatAsUnifiedDiff(diffResult, filename1 = 'a', filename2 = 'b') {
        // TODO: Format as unified diff (like git diff)
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Merge utility for handling conflicts
 * Provides three-way merge capabilities
 */
class JSONMerger {
    constructor(options = {}) {
        // TODO: Initialize merger
        // this.conflictResolver = options.conflictResolver || 'manual';
        // this.mergeStrategy = options.mergeStrategy || 'deep';
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Perform three-way merge
     * 
     * @param {*} base - Common ancestor object
     * @param {*} ours - Our version
     * @param {*} theirs - Their version
     * @returns {Object} - Merge result with conflict information
     */
    threeWayMerge(base, ours, theirs) {
        // TODO: Implement three-way merge
        // return {
        //     merged: mergedObject,
        //     conflicts: conflictArray,
        //     hasConflicts: boolean
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Resolve conflicts using specified strategy
     * 
     * @param {Array} conflicts - Array of conflicts
     * @param {string} strategy - Resolution strategy
     * @returns {Array} - Resolved operations
     */
    resolveConflicts(conflicts, strategy = 'ours') {
        // TODO: Resolve conflicts using strategy
        // Strategies: 'ours', 'theirs', 'manual', 'custom'
        throw new Error('Implementation pending');
    }
}

// =======================
// Utility Functions
// =======================

/**
 * TODO: Path utilities for working with object paths
 */
const PathUtils = {
    /**
     * Parse path string into path segments
     */
    parse: (path) => {
        // TODO: Parse path string like '/a/b/0/c' into segments
        throw new Error('Implementation pending');
    },
    
    /**
     * Get value at path in object
     */
    get: (obj, path) => {
        // TODO: Get value at specified path
        throw new Error('Implementation pending');
    },
    
    /**
     * Set value at path in object
     */
    set: (obj, path, value) => {
        // TODO: Set value at specified path
        throw new Error('Implementation pending');
    },
    
    /**
     * Delete value at path in object
     */
    delete: (obj, path) => {
        // TODO: Delete value at specified path
        throw new Error('Implementation pending');
    },
    
    /**
     * Check if path exists in object
     */
    exists: (obj, path) => {
        // TODO: Check if path exists
        throw new Error('Implementation pending');
    }
};

/**
 * TODO: Type detection utilities
 */
const TypeUtils = {
    /**
     * Get detailed type information
     */
    getType: (value) => {
        // TODO: Get detailed type (null, array, object, string, etc.)
        throw new Error('Implementation pending');
    },
    
    /**
     * Check if values are same type
     */
    sameType: (val1, val2) => {
        // TODO: Check type compatibility
        throw new Error('Implementation pending');
    },
    
    /**
     * Check if value is primitive
     */
    isPrimitive: (value) => {
        // TODO: Check if value is primitive type
        throw new Error('Implementation pending');
    }
};

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic object comparison
console.log("=== Basic Object Comparison Test ===");
const differ = new DeepJSONDiff();

const obj1 = {
    name: 'Alice',
    age: 30,
    address: {
        street: '123 Main St',
        city: 'Boston',
        zip: '02101'
    },
    hobbies: ['reading', 'swimming']
};

const obj2 = {
    name: 'Alice',
    age: 31, // Changed
    address: {
        street: '456 Oak Ave', // Changed
        city: 'Boston',
        zip: '02101',
        country: 'USA' // Added
    },
    hobbies: ['reading', 'cycling'], // Modified array
    email: 'alice@example.com' // Added
};

const diff1 = differ.compare(obj1, obj2);
console.log("Basic diff result:");
console.log("Has changes:", diff1.hasChanges);
console.log("Summary:", diff1.summary);
console.log("Changes:", diff1.changes);

// Test Case 2: Array comparison strategies
console.log("\n=== Array Comparison Strategies Test ===");

const arr1 = [
    { id: 1, name: 'Item 1', value: 10 },
    { id: 2, name: 'Item 2', value: 20 },
    { id: 3, name: 'Item 3', value: 30 }
];

const arr2 = [
    { id: 1, name: 'Item 1 Updated', value: 10 }, // Modified
    { id: 3, name: 'Item 3', value: 35 }, // Modified and moved
    { id: 4, name: 'Item 4', value: 40 } // Added, id 2 removed
];

// Position-based comparison
const positionDiffer = new DeepJSONDiff({ arrayDiffStrategy: 'position' });
const positionDiff = positionDiffer.compare(arr1, arr2);
console.log("Position-based diff:", positionDiff.changes.length, "changes");

// ID-based comparison
const idDiffer = new DeepJSONDiff({ arrayDiffStrategy: 'id', arrayIdKey: 'id' });
const idDiff = idDiffer.compare(arr1, arr2);
console.log("ID-based diff:", idDiff.changes.length, "changes");

// Test Case 3: Patch generation and application
console.log("\n=== Patch Generation and Application Test ===");
const patcher = new DeepJSONDiff();

const original = {
    user: {
        name: 'John',
        preferences: {
            theme: 'dark',
            notifications: true
        }
    },
    settings: ['option1', 'option2']
};

const modified = {
    user: {
        name: 'John Doe', // Modified
        preferences: {
            theme: 'light', // Modified
            notifications: true,
            language: 'en' // Added
        }
    },
    settings: ['option1', 'option3'], // Modified array
    metadata: { version: 2 } // Added
};

const patch = patcher.generatePatch(original, modified);
console.log("Generated patch:", patch);

const patched = patcher.applyPatch(original, patch);
console.log("Patch applied successfully:", JSON.stringify(patched) === JSON.stringify(modified));

// Test reverse patch
const reversePatch = patcher.reversePatch(patch, original);
const restored = patcher.applyPatch(modified, reversePatch);
console.log("Reverse patch successful:", JSON.stringify(restored) === JSON.stringify(original));

// Test Case 4: Custom comparison functions
console.log("\n=== Custom Comparison Test ===");
const customComparers = new Map();

// Custom date comparer (ignore time, compare only date)
customComparers.set('Date', (date1, date2) => {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;
    return date1.toDateString() === date2.toDateString();
});

// Custom string comparer (case insensitive)
customComparers.set('string', (str1, str2) => {
    if (typeof str1 !== 'string' || typeof str2 !== 'string') return false;
    return str1.toLowerCase() === str2.toLowerCase();
});

const customDiffer = new DeepJSONDiff({ customComparers });

const obj3 = {
    name: 'ALICE',
    createdAt: new Date('2023-01-15T10:30:00Z')
};

const obj4 = {
    name: 'alice', // Different case
    createdAt: new Date('2023-01-15T15:45:00Z') // Same date, different time
};

const customDiff = customDiffer.compare(obj3, obj4);
console.log("Custom comparison result:", customDiff.hasChanges ? "Has changes" : "No changes");

// Test Case 5: Circular reference handling
console.log("\n=== Circular Reference Test ===");
const circularObj1 = { name: 'Object 1' };
circularObj1.self = circularObj1;

const circularObj2 = { name: 'Object 1' };
circularObj2.self = circularObj2;

const circularDiffer = new DeepJSONDiff({ detectCircular: true });
const circularDiff = circularDiffer.compare(circularObj1, circularObj2);
console.log("Circular reference handled:", !circularDiff.hasChanges);

// Test Case 6: Performance test with large objects
console.log("\n=== Performance Test ===");
const createLargeObject = (size) => {
    const obj = {};
    for (let i = 0; i < size; i++) {
        obj[`prop_${i}`] = {
            id: i,
            name: `Item ${i}`,
            data: Array.from({length: 10}, (_, j) => `value_${i}_${j}`),
            nested: {
                level1: {
                    level2: {
                        value: Math.random()
                    }
                }
            }
        };
    }
    return obj;
};

const largeObj1 = createLargeObject(1000);
const largeObj2 = JSON.parse(JSON.stringify(largeObj1));
// Make some changes
largeObj2.prop_500.name = 'Modified Item 500';
largeObj2.prop_750.data.push('new_value');
largeObj2.new_prop = { added: true };

const fastDiffer = new FastJSONDiff({ enableHashing: true });

console.time('Large object diff');
const largeDiff = fastDiffer.compare(largeObj1, largeObj2);
console.timeEnd('Large object diff');

console.log(`Found ${largeDiff.changes.length} changes in large objects`);
console.log("Summary:", largeDiff.summary);

// Test Case 7: Diff formatting
console.log("\n=== Diff Formatting Test ===");
const formatter = new DiffFormatter({ colorize: false, showTypes: true });

const formatTestObj1 = { a: 1, b: [1, 2, 3], c: { x: 'old' } };
const formatTestObj2 = { a: 2, b: [1, 2, 3, 4], c: { x: 'new', y: 'added' } };

const formatDiff = differ.compare(formatTestObj1, formatTestObj2);
const formattedText = formatter.formatAsText(formatDiff);
console.log("Formatted diff:");
console.log(formattedText);

// Test Case 8: Three-way merge
console.log("\n=== Three-way Merge Test ===");
const merger = new JSONMerger();

const base = {
    config: {
        timeout: 5000,
        retries: 3,
        features: ['feature1', 'feature2']
    }
};

const ours = {
    config: {
        timeout: 10000, // We changed this
        retries: 3,
        features: ['feature1', 'feature2', 'feature3'] // We added feature3
    }
};

const theirs = {
    config: {
        timeout: 5000,
        retries: 5, // They changed this
        features: ['feature1', 'feature2', 'feature4'] // They added feature4
    }
};

const mergeResult = merger.threeWayMerge(base, ours, theirs);
console.log("Merge has conflicts:", mergeResult.hasConflicts);
console.log("Conflicts:", mergeResult.conflicts?.length || 0);
console.log("Merged result:", mergeResult.merged);

// Memory usage test
console.log("\n=== Memory Usage Test ===");
const memoryTestStart = process.memoryUsage?.()?.heapUsed || 0;

// Create many diff operations
for (let i = 0; i < 100; i++) {
    const testObj1 = createLargeObject(50);
    const testObj2 = createLargeObject(50);
    testObj2[`modified_${i}`] = { change: i };
    
    differ.compare(testObj1, testObj2);
}

const memoryTestEnd = process.memoryUsage?.()?.heapUsed || 0;
console.log(`Memory usage: ${((memoryTestEnd - memoryTestStart) / 1024 / 1024).toFixed(2)} MB`);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Algorithm Complexity:
 *    - Deep traversal strategies and optimization
 *    - Circular reference detection and handling
 *    - Memory efficiency for large object comparison
 * 
 * 2. Array Comparison Strategies:
 *    - Position-based vs ID-based vs content-based matching
 *    - Handling array reordering and insertions
 *    - Performance implications of different strategies
 * 
 * 3. Change Representation:
 *    - Granular vs summary change reporting
 *    - Path-based change tracking for nested structures
 *    - Reversible patch generation for undo functionality
 * 
 * 4. Performance Optimization:
 *    - Hash-based fast comparison for large objects
 *    - Early termination strategies
 *    - Memory management and garbage collection
 * 
 * 5. Real-world Applications:
 *    - State management in frontend frameworks
 *    - API response validation and monitoring
 *    - Database record versioning and auditing
 *    - Real-time collaboration and conflict resolution
 * 
 * 6. Edge Cases:
 *    - Handling different data types and custom objects
 *    - Null/undefined value handling
 *    - Function and symbol comparison strategies
 * 
 * 7. Integration Patterns:
 *    - JSON Patch (RFC 6902) compatibility
 *    - Version control system integration
 *    - Event-driven change notification systems
 * 
 * 8. Testing and Validation:
 *    - Comprehensive test coverage for edge cases
 *    - Performance benchmarking with large datasets
 *    - Correctness validation with round-trip testing
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChangeType,
        DeepJSONDiff,
        FastJSONDiff,
        DiffFormatter,
        JSONMerger,
        PathUtils,
        TypeUtils
    };
}