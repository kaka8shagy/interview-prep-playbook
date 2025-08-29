/**
 * File: fundamentals.js
 * Topic: JavaScript Memory Management Fundamentals
 * 
 * This file explains the core concepts of JavaScript memory management including
 * garbage collection, memory lifecycle, and common memory patterns with extensive
 * commenting to understand how JavaScript handles memory allocation and cleanup.
 * Focus: Understanding memory allocation, garbage collection, and lifecycle patterns
 */

// ============================================================================
// MEMORY LIFECYCLE IN JAVASCRIPT
// ============================================================================

/**
 * JavaScript Memory Lifecycle Mental Model:
 * 
 * 1. ALLOCATION: Memory is allocated when variables, objects, functions are created
 * 2. USAGE: Memory is used when reading/writing to allocated memory
 * 3. RELEASE: Memory is released when no longer needed (garbage collection)
 * 
 * Key Insight: JavaScript uses automatic memory management - the garbage collector
 * automatically frees memory that is no longer reachable from the application.
 * Understanding this process is crucial for writing memory-efficient applications.
 */

console.log('=== JAVASCRIPT MEMORY MANAGEMENT FUNDAMENTALS ===\n');

function demonstrateMemoryLifecycle() {
    console.log('1. Memory Allocation and Lifecycle:');
    
    // PHASE 1: ALLOCATION - Memory allocated for various data types
    
    // Primitive values (stored on stack or optimized)
    const numberValue = 42;                    // Number: typically 8 bytes
    const stringValue = 'Hello, Memory!';      // String: varies by length and encoding
    const booleanValue = true;                 // Boolean: typically 1 bit/byte
    const undefinedValue = undefined;          // Undefined: special value
    const nullValue = null;                    // Null: special value
    
    console.log('  Primitive values allocated (stack/optimized storage)');
    
    // Reference values (stored on heap)
    const arrayValue = [1, 2, 3, 4, 5];       // Array: header + elements
    const objectValue = {                       // Object: property table + values
        name: 'JavaScript',
        version: 2023,
        features: ['async', 'generators', 'modules']
    };
    
    const functionValue = function(x, y) {     // Function: code + closure scope
        return x + y;
    };
    
    console.log('  Reference values allocated (heap storage)');
    
    // PHASE 2: USAGE - Memory accessed during execution
    
    // Reading from memory (accessing allocated values)
    const sum = numberValue + arrayValue.length;
    const greeting = `${stringValue} Version: ${objectValue.version}`;
    const result = functionValue(10, 20);
    
    console.log('  Memory usage examples:');
    console.log(`    Sum calculation: ${sum}`);
    console.log(`    String interpolation: ${greeting}`);
    console.log(`    Function execution: ${result}`);
    
    // Memory allocation during operations
    const newArray = arrayValue.map(x => x * 2);  // Allocates new array
    const newObject = { ...objectValue };         // Allocates new object
    
    console.log('  New allocations during operations:');
    console.log(`    Mapped array: [${newArray}]`);
    console.log(`    Copied object keys: [${Object.keys(newObject)}]`);
    
    // PHASE 3: RELEASE - Memory becomes eligible for garbage collection
    // When variables go out of scope, memory can be reclaimed
    
    /**
     * Memory Lifecycle Insights:
     * 
     * 1. Primitive values: Often stored in stack or optimized storage
     * 2. Objects/arrays: Stored in heap with garbage collection
     * 3. Functions: Code stored once, closures create heap allocations
     * 4. Scope exit: Local variables become unreachable and eligible for GC
     * 5. Reference counting: Objects with no references can be collected
     */
    
    return {
        memoryUsage: 'Variables will be GC\'d when function exits',
        allocatedTypes: ['primitives', 'objects', 'arrays', 'functions'],
        lifecycle: ['allocate', 'use', 'release']
    };
}

// Execute and demonstrate memory lifecycle
const lifecycleResult = demonstrateMemoryLifecycle();
console.log('  Lifecycle demonstration complete:', lifecycleResult.memoryUsage);

// ============================================================================
// GARBAGE COLLECTION MECHANISMS
// ============================================================================

/**
 * Garbage Collection (GC) Mental Model:
 * 
 * JavaScript uses several GC strategies:
 * 1. MARK-AND-SWEEP: Marks reachable objects, sweeps (deletes) unreachable ones
 * 2. GENERATIONAL GC: Young generation (frequent GC) vs old generation (less frequent)
 * 3. INCREMENTAL GC: Small GC work distributed across execution time
 * 4. REFERENCE COUNTING: Count references to objects (less common, has issues)
 * 
 * Understanding GC helps write code that works well with the collector.
 */

function demonstrateGarbageCollection() {
    console.log('\n2. Garbage Collection Mechanisms:');
    
    // Demonstrate reachability - the core concept of mark-and-sweep GC
    function createReachabilityExample() {
        // Root objects (always reachable)
        const globalReference = { type: 'global', id: 1 };
        
        // Local objects (reachable through stack)
        const localReference = { type: 'local', id: 2 };
        
        // Interconnected objects (reachable through other objects)
        const parent = { 
            type: 'parent', 
            id: 3,
            child: null 
        };
        
        const child = { 
            type: 'child', 
            id: 4,
            parent: parent  // Circular reference
        };
        
        parent.child = child; // Complete the circular reference
        
        console.log('  Created object graph with circular references:');
        console.log(`    Parent: ${parent.type}, Child: ${child.type}`);
        
        // Demonstration of reference management
        return {
            // These references keep objects reachable
            keepAlive: [globalReference, localReference],
            
            // This circular reference is handled by mark-and-sweep
            circularExample: { parent, child },
            
            // Function to break references manually if needed
            cleanup: function() {
                // Break circular references manually (usually unnecessary)
                parent.child = null;
                child.parent = null;
                console.log('    Circular references manually broken');
            }
        };
    }
    
    const reachabilityDemo = createReachabilityExample();
    console.log('  Objects created and referenced properly');
    
    // Demonstrate memory pressure simulation
    function simulateMemoryPressure() {
        console.log('  Simulating memory pressure (creating many objects):');
        
        const largeDataStructures = [];
        
        // Create memory pressure to potentially trigger GC
        for (let i = 0; i < 1000; i++) {
            // Create objects that will become unreachable
            const tempObject = {
                id: i,
                data: new Array(100).fill(Math.random()),
                metadata: {
                    created: Date.now(),
                    type: 'temporary',
                    references: new Set([i, i * 2, i * 3])
                }
            };
            
            // Only keep every 10th object (others become unreachable)
            if (i % 10 === 0) {
                largeDataStructures.push(tempObject);
            }
            
            // tempObject becomes unreachable after each iteration
            // (except for every 10th one stored in array)
        }
        
        console.log(`    Created 1000 temporary objects, kept ${largeDataStructures.length}`);
        console.log('    900 objects became unreachable and eligible for GC');
        
        return largeDataStructures;
    }
    
    const retainedObjects = simulateMemoryPressure();
    
    // Demonstrate weak references (if available)
    if (typeof WeakMap !== 'undefined') {
        console.log('  WeakMap demonstration (doesn\'t prevent GC):');
        
        const weakMapExample = new WeakMap();
        const keyObject = { id: 'weak-key' };
        
        // WeakMap entry doesn't prevent keyObject from being garbage collected
        weakMapExample.set(keyObject, { 
            metadata: 'This won\'t prevent keyObject from being GC\'d',
            timestamp: Date.now()
        });
        
        console.log('    WeakMap entry created - doesn\'t hold strong reference to key');
        
        // After keyObject goes out of scope, the WeakMap entry can be GC'd too
    }
    
    /**
     * Garbage Collection Insights:
     * 
     * 1. Mark-and-Sweep: Traverses from roots, marks reachable, deletes unreachable
     * 2. Generational GC: Young objects collected frequently, old objects less often
     * 3. Circular references: Handled automatically by modern GC (mark-and-sweep)
     * 4. Weak references: WeakMap/WeakSet don't prevent garbage collection
     * 5. Memory pressure: GC triggered when memory usage reaches thresholds
     */
    
    return {
        reachableObjects: retainedObjects.length,
        gcStrategy: 'mark-and-sweep with generational collection',
        circularRefsHandled: true
    };
}

const gcResult = demonstrateGarbageCollection();
console.log('  GC demonstration result:', gcResult);

// ============================================================================
// MEMORY ALLOCATION PATTERNS
// ============================================================================

/**
 * Common Memory Allocation Patterns:
 * 
 * Understanding how different coding patterns affect memory allocation
 * helps write more memory-efficient code and avoid common pitfalls.
 */

function demonstrateAllocationPatterns() {
    console.log('\n3. Memory Allocation Patterns:');
    
    // PATTERN 1: Object creation patterns
    console.log('  Object Creation Patterns:');
    
    // Literal syntax (common, efficient)
    const literalObject = {
        name: 'Literal',
        value: 42,
        method: function() { return this.value; }
    };
    
    // Constructor function (creates new instance each time)
    function ConstructorPattern(name, value) {
        this.name = name;
        this.value = value;
        this.method = function() { return this.value; }; // New function per instance!
    }
    
    const constructorObject = new ConstructorPattern('Constructor', 84);
    
    // Class syntax (syntactic sugar over constructor)
    class ClassPattern {
        constructor(name, value) {
            this.name = name;
            this.value = value;
        }
        
        method() { return this.value; } // Shared on prototype
    }
    
    const classObject = new ClassPattern('Class', 126);
    
    console.log('    Created objects using different patterns:');
    console.log(`      Literal: ${literalObject.name} = ${literalObject.value}`);
    console.log(`      Constructor: ${constructorObject.name} = ${constructorObject.value}`);
    console.log(`      Class: ${classObject.name} = ${classObject.value}`);
    
    // PATTERN 2: Array allocation patterns
    console.log('  Array Allocation Patterns:');
    
    // Pre-sized array (can be more efficient)
    const preSizedArray = new Array(1000).fill(0);
    
    // Dynamic growth array (reallocates as it grows)
    const dynamicArray = [];
    for (let i = 0; i < 1000; i++) {
        dynamicArray.push(i); // May cause multiple reallocations
    }
    
    // Array literal (efficient for known values)
    const literalArray = [1, 2, 3, 4, 5];
    
    console.log('    Array allocation comparison:');
    console.log(`      Pre-sized: ${preSizedArray.length} elements`);
    console.log(`      Dynamic: ${dynamicArray.length} elements`);
    console.log(`      Literal: ${literalArray.length} elements`);
    
    // PATTERN 3: String allocation patterns
    console.log('  String Allocation Patterns:');
    
    // String concatenation (creates intermediate strings)
    let concatenatedString = '';
    for (let i = 0; i < 5; i++) {
        concatenatedString += `Part ${i} `; // Creates new string each time
    }
    
    // Array join (more efficient for multiple parts)
    const parts = [];
    for (let i = 0; i < 5; i++) {
        parts.push(`Part ${i} `);
    }
    const joinedString = parts.join(''); // Single allocation
    
    // Template literals (efficient for known structure)
    const templateString = `Template with values: ${42}, ${true}, ${'text'}`;
    
    console.log('    String creation comparison:');
    console.log(`      Concatenated: "${concatenatedString.trim()}"`);
    console.log(`      Joined: "${joinedString.trim()}"`);
    console.log(`      Template: "${templateString}"`);
    
    // PATTERN 4: Function allocation patterns
    console.log('  Function Allocation Patterns:');
    
    // Function declarations (hoisted, single allocation)
    function declaredFunction(x) {
        return x * 2;
    }
    
    // Function expressions (allocated when reached)
    const expressionFunction = function(x) {
        return x * 3;
    };
    
    // Arrow functions (allocated when reached, lexical this)
    const arrowFunction = (x) => x * 4;
    
    // Method definitions (shared on prototype)
    const objectWithMethods = {
        multiplier: 5,
        regularMethod: function(x) {
            return x * this.multiplier;
        },
        arrowMethod: (x) => x * 6 // No access to 'this'
    };
    
    console.log('    Function pattern results:');
    console.log(`      Declared: ${declaredFunction(10)}`);
    console.log(`      Expression: ${expressionFunction(10)}`);
    console.log(`      Arrow: ${arrowFunction(10)}`);
    console.log(`      Method: ${objectWithMethods.regularMethod(10)}`);
    console.log(`      Arrow method: ${objectWithMethods.arrowMethod(10)}`);
    
    /**
     * Allocation Pattern Insights:
     * 
     * 1. Object literals: Efficient for single instances
     * 2. Classes: Method sharing via prototype saves memory
     * 3. Pre-sized arrays: Avoid reallocation overhead
     * 4. String joining: More efficient than concatenation for many parts
     * 5. Function declarations: Hoisted and allocated once
     * 6. Arrow functions: Concise but create new instances each time
     */
    
    return {
        efficientPatterns: ['object literals', 'class methods', 'pre-sized arrays', 'array join'],
        lessEfficientPatterns: ['constructor methods', 'string concatenation', 'repeated arrow functions'],
        recommendation: 'Choose patterns based on use case and performance requirements'
    };
}

const patternsResult = demonstrateAllocationPatterns();
console.log('  Allocation patterns analysis:', patternsResult.recommendation);

// ============================================================================
// MEMORY MONITORING AND DEBUGGING
// ============================================================================

/**
 * Memory Monitoring Techniques:
 * 
 * Tools and techniques for monitoring memory usage and identifying
 * memory-related issues in JavaScript applications.
 */

function demonstrateMemoryMonitoring() {
    console.log('\n4. Memory Monitoring and Debugging:');
    
    // Performance.memory API (available in some environments)
    if (typeof performance !== 'undefined' && performance.memory) {
        console.log('  Performance Memory API available:');
        
        const memory = performance.memory;
        console.log(`    Used JS Heap Size: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
        console.log(`    Total JS Heap Size: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
        console.log(`    JS Heap Size Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
        
        // Calculate memory usage percentage
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(1);
        console.log(`    Memory usage: ${usagePercent}% of limit`);
    } else {
        console.log('  Performance.memory not available in this environment');
    }
    
    // Manual memory tracking techniques
    console.log('  Manual Memory Tracking Techniques:');
    
    // Object counting technique
    class MemoryTracker {
        constructor() {
            this.allocations = new Map();
            this.totalAllocations = 0;
        }
        
        track(type, object) {
            const count = this.allocations.get(type) || 0;
            this.allocations.set(type, count + 1);
            this.totalAllocations++;
            
            // Add tracking metadata to object (if possible)
            if (typeof object === 'object' && object !== null) {
                object.__memoryTracker = {
                    type: type,
                    allocated: Date.now(),
                    id: this.totalAllocations
                };
            }
            
            console.log(`    Tracked ${type} allocation #${this.totalAllocations}`);
            return object;
        }
        
        getStats() {
            const stats = {
                totalAllocations: this.totalAllocations,
                typeBreakdown: Object.fromEntries(this.allocations),
                timestamp: new Date().toISOString()
            };
            
            console.log('    Memory tracking stats:', stats);
            return stats;
        }
        
        reset() {
            this.allocations.clear();
            this.totalAllocations = 0;
            console.log('    Memory tracker reset');
        }
    }
    
    // Use memory tracker
    const tracker = new MemoryTracker();
    
    // Track different types of allocations
    const trackedArray = tracker.track('array', [1, 2, 3, 4, 5]);
    const trackedObject = tracker.track('object', { name: 'tracked', value: 42 });
    const trackedFunction = tracker.track('function', function() { return 'tracked'; });
    
    // Get tracking statistics
    const stats = tracker.getStats();
    
    // Memory usage estimation techniques
    console.log('  Memory Usage Estimation:');
    
    function estimateObjectSize(obj) {
        let size = 0;
        
        function calculateSize(value, seen = new Set()) {
            if (seen.has(value)) return 0; // Avoid circular references
            seen.add(value);
            
            switch (typeof value) {
                case 'boolean':
                    return 4; // Approximate
                case 'number':
                    return 8; // 64-bit float
                case 'string':
                    return value.length * 2; // UTF-16
                case 'object':
                    if (value === null) return 4;
                    
                    let objSize = 24; // Object header approximation
                    
                    if (Array.isArray(value)) {
                        objSize += value.length * 8; // Array index overhead
                        for (const item of value) {
                            objSize += calculateSize(item, seen);
                        }
                    } else {
                        for (const [key, val] of Object.entries(value)) {
                            objSize += key.length * 2; // Property name
                            objSize += calculateSize(val, seen);
                        }
                    }
                    
                    return objSize;
                case 'function':
                    return value.toString().length * 2 + 100; // Code + overhead
                default:
                    return 4;
            }
        }
        
        return calculateSize(obj);
    }
    
    // Estimate sizes of our objects
    const arraySize = estimateObjectSize(trackedArray);
    const objectSize = estimateObjectSize(trackedObject);
    const functionSize = estimateObjectSize(trackedFunction);
    
    console.log('    Estimated object sizes:');
    console.log(`      Array: ~${arraySize} bytes`);
    console.log(`      Object: ~${objectSize} bytes`);
    console.log(`      Function: ~${functionSize} bytes`);
    
    /**
     * Memory Monitoring Insights:
     * 
     * 1. Performance.memory: Browser API for heap size information
     * 2. Manual tracking: Count allocations by type for analysis
     * 3. Size estimation: Rough calculations for memory planning
     * 4. Developer tools: Browser DevTools provide detailed memory profiling
     * 5. Production monitoring: Track memory trends over time
     * 
     * Browser DevTools Memory Tab Features:
     * - Heap snapshots: See all objects at a point in time
     * - Allocation timeline: Track memory over time
     * - Allocation sampling: Profile memory allocations
     */
    
    return {
        trackingEnabled: true,
        estimationAccuracy: 'rough approximation',
        recommendedTools: ['Chrome DevTools', 'Performance.memory API', 'Manual tracking']
    };
}

const monitoringResult = demonstrateMemoryMonitoring();
console.log('  Memory monitoring setup complete');

// Export memory management utilities for production use
module.exports = {
    // Memory lifecycle utilities
    trackAllocation: function(type, object) {
        if (typeof object === 'object' && object !== null) {
            object.__allocated = {
                type: type,
                timestamp: Date.now(),
                stackTrace: new Error().stack
            };
        }
        return object;
    },
    
    // Simple memory tracker
    createMemoryTracker: function() {
        const allocations = new Map();
        
        return {
            track: (type, object) => {
                const count = allocations.get(type) || 0;
                allocations.set(type, count + 1);
                return object;
            },
            
            getStats: () => Object.fromEntries(allocations),
            
            reset: () => allocations.clear()
        };
    },
    
    // Memory info getter
    getMemoryInfo: function() {
        if (typeof performance !== 'undefined' && performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                usagePercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
            };
        }
        return { available: false };
    },
    
    // Force garbage collection (if available)
    forceGC: function() {
        if (global && global.gc) {
            global.gc();
            return true;
        }
        return false;
    }
};