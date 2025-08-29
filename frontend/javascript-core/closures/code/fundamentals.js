/**
 * File: fundamentals.js
 * Topic: JavaScript Closures Fundamentals
 * 
 * This file explains the core concepts of JavaScript closures with extensive
 * commenting and practical examples. Closures are fundamental to understanding
 * JavaScript's function behavior and are crucial for advanced patterns.
 * Focus: Understanding closure mechanics, scope preservation, and mental models
 */

// ============================================================================
// CLOSURE MENTAL MODEL - Understanding What Closures Actually Are
// ============================================================================

/**
 * Closure Definition and Mental Model:
 * 
 * A closure is created when:
 * 1. A function is defined inside another function (nested function)
 * 2. The inner function references variables from the outer function's scope
 * 3. The inner function is made available outside the outer function
 * 
 * Key Insight: Closures "capture" or "close over" variables from their
 * lexical scope, maintaining access even after the outer function returns.
 * 
 * Mental Model: Think of closures as a "backpack" that functions carry
 * with them, containing all the variables they need from outer scopes.
 */

console.log('=== CLOSURE FUNDAMENTALS DEMONSTRATION ===\n');

function demonstrateBasicClosure() {
    console.log('1. Basic Closure Creation:');
    
    // Outer function with local variables
    function outerFunction(outerParam) {
        const outerVariable = 'I am from outer scope';
        let counter = 0;
        
        console.log('  Inside outerFunction, creating inner function...');
        
        // Inner function that "closes over" outer variables
        function innerFunction(innerParam) {
            // This function has access to:
            // 1. Its own parameters and variables
            // 2. Variables from outerFunction (closure)
            // 3. Global variables
            
            counter++; // Modifying outer scope variable
            
            const result = {
                innerParam: innerParam,
                outerParam: outerParam,
                outerVariable: outerVariable,
                counter: counter,
                message: `Called ${counter} times`
            };
            
            console.log('    Inner function executed:', result);
            return result;
        }
        
        console.log('  Returning inner function (closure created)...');
        return innerFunction; // Returning the function, not calling it
    }
    
    // Create a closure by calling outerFunction
    const myClosure = outerFunction('outer parameter');
    
    // The outer function has finished executing, but the closure
    // still has access to outerParam, outerVariable, and counter
    console.log('  Calling closure multiple times:');
    myClosure('first call');
    myClosure('second call');
    myClosure('third call');
    
    /**
     * Key Observations:
     * 1. counter persists between calls (not reset to 0)
     * 2. outerParam and outerVariable remain accessible
     * 3. Each call to outerFunction creates a NEW closure with separate variables
     */
    
    // Create another closure - it has its own separate variables
    const anotherClosure = outerFunction('different parameter');
    console.log('  New closure has separate state:');
    anotherClosure('independent call');
}

demonstrateBasicClosure();

// ============================================================================
// CLOSURE SCOPE PRESERVATION - Why Variables Stay Alive
// ============================================================================

/**
 * Scope Preservation Mechanics:
 * 
 * When a closure is created, JavaScript preserves the entire lexical
 * environment of the outer function. This includes:
 * - Parameters of the outer function
 * - Local variables declared in the outer function
 * - References to functions in the outer scope
 * 
 * Important: The closure maintains REFERENCES to these variables,
 * not copies. This means modifications affect the original variables.
 */

console.log('\n=== SCOPE PRESERVATION MECHANICS ===\n');

function demonstrateScopePreservation() {
    console.log('2. Scope Preservation and Variable References:');
    
    function createEnvironment() {
        // Variables that will be captured by closures
        let sharedState = { count: 0, data: [] };
        const config = { multiplier: 2, prefix: 'Item' };
        
        // Return multiple functions that share the same scope
        return {
            // Function 1: Modifies shared state
            increment: function() {
                sharedState.count++;
                console.log(`    Incremented count to: ${sharedState.count}`);
                return sharedState.count;
            },
            
            // Function 2: Reads shared state
            getCount: function() {
                console.log(`    Current count: ${sharedState.count}`);
                return sharedState.count;
            },
            
            // Function 3: Modifies and reads shared state
            addData: function(value) {
                const item = `${config.prefix}_${value * config.multiplier}`;
                sharedState.data.push(item);
                console.log(`    Added item: ${item}, total items: ${sharedState.data.length}`);
                return sharedState.data.length;
            },
            
            // Function 4: Returns snapshot of current state
            getSnapshot: function() {
                const snapshot = {
                    count: sharedState.count,
                    dataLength: sharedState.data.length,
                    lastItem: sharedState.data[sharedState.data.length - 1] || null,
                    config: { ...config } // Return copy of config
                };
                console.log('    State snapshot:', snapshot);
                return snapshot;
            }
        };
    }
    
    // Create environment with shared closure variables
    const environment = createEnvironment();
    
    // All methods operate on the same shared state
    environment.increment();         // count: 1
    environment.increment();         // count: 2
    environment.addData(5);         // adds "Item_10"
    environment.addData(3);         // adds "Item_6"
    environment.getCount();         // count: 2
    environment.getSnapshot();      // shows complete state
    
    // Demonstrate that another environment has separate state
    const separateEnvironment = createEnvironment();
    console.log('  Separate environment has its own state:');
    separateEnvironment.increment(); // count: 1 (separate from first environment)
    separateEnvironment.getSnapshot();
    
    /**
     * Key Insights:
     * 1. Multiple functions can share the same closure scope
     * 2. All functions sharing scope see the same variable changes
     * 3. Each call to createEnvironment() creates separate closure scopes
     * 4. Variables are preserved by reference, not by value
     */
}

demonstrateScopePreservation();

// ============================================================================
// CLOSURE VARIABLE CAPTURE PATTERNS
// ============================================================================

/**
 * Variable Capture Timing:
 * 
 * Understanding WHEN variables are captured is crucial for avoiding bugs.
 * Variables are captured by reference at the time the closure is CREATED,
 * not when the closure is CALLED.
 */

console.log('\n=== VARIABLE CAPTURE PATTERNS ===\n');

function demonstrateVariableCapture() {
    console.log('3. Variable Capture Timing and Patterns:');
    
    // Pattern 1: Capturing loop variables (common bug source)
    function createFunctionsWithVar() {
        console.log('  Creating functions with var (buggy pattern):');
        const functions = [];
        
        for (var i = 0; i < 3; i++) {
            // Each function captures the SAME variable 'i'
            functions.push(function() {
                console.log(`    Function captures var i: ${i}`);
                return i;
            });
        }
        
        return functions;
    }
    
    // Execute functions created with var
    const varFunctions = createFunctionsWithVar();
    varFunctions.forEach((fn, index) => {
        fn(); // All print 3 because they capture the same 'i' variable
    });
    
    // Pattern 2: Fixed with let (each iteration gets new variable)
    function createFunctionsWithLet() {
        console.log('  Creating functions with let (correct pattern):');
        const functions = [];
        
        for (let j = 0; j < 3; j++) {
            // Each function captures a DIFFERENT variable 'j'
            functions.push(function() {
                console.log(`    Function captures let j: ${j}`);
                return j;
            });
        }
        
        return functions;
    }
    
    const letFunctions = createFunctionsWithLet();
    letFunctions.forEach((fn, index) => {
        fn(); // Each prints its captured value: 0, 1, 2
    });
    
    // Pattern 3: Manual closure creation (older fix for var issue)
    function createFunctionsWithClosure() {
        console.log('  Creating functions with manual closure (legacy pattern):');
        const functions = [];
        
        for (var k = 0; k < 3; k++) {
            // Create IIFE to capture current value of k
            functions.push((function(capturedValue) {
                return function() {
                    console.log(`    Function captures manual closure: ${capturedValue}`);
                    return capturedValue;
                };
            })(k)); // Immediately call with current k value
        }
        
        return functions;
    }
    
    const closureFunctions = createFunctionsWithClosure();
    closureFunctions.forEach((fn, index) => {
        fn(); // Each prints its captured value: 0, 1, 2
    });
    
    /**
     * Variable Capture Rules:
     * 1. var: Function-scoped, all closures in same function capture same variable
     * 2. let/const: Block-scoped, each block iteration creates new variable
     * 3. IIFE: Can manually create closure scope to capture specific values
     * 4. Capture happens at closure creation time, not execution time
     */
}

demonstrateVariableCapture();

// ============================================================================
// CLOSURE LIFECYCLE AND MEMORY MANAGEMENT
// ============================================================================

/**
 * Closure Lifecycle Understanding:
 * 
 * Closures have important implications for memory management:
 * 1. They keep outer scope variables alive (prevent garbage collection)
 * 2. They can create memory leaks if not properly managed
 * 3. They enable powerful patterns but require careful resource handling
 */

console.log('\n=== CLOSURE LIFECYCLE AND MEMORY MANAGEMENT ===\n');

function demonstrateClosureLifecycle() {
    console.log('4. Closure Lifecycle and Memory Management:');
    
    // Example of closure keeping variables alive
    function createDataProcessor() {
        // Large data structure that we want to process
        const largeData = new Array(1000).fill(0).map((_, i) => ({
            id: i,
            value: Math.random() * 100,
            timestamp: Date.now() + i
        }));
        
        console.log(`  Created large data array with ${largeData.length} items`);
        
        // Statistics that accumulate over time
        let processedCount = 0;
        let totalValue = 0;
        
        // Return processor function (creates closure)
        return {
            // Process a single item by ID
            processItem: function(id) {
                const item = largeData.find(item => item.id === id);
                if (!item) {
                    console.log(`    Item ${id} not found`);
                    return null;
                }
                
                processedCount++;
                totalValue += item.value;
                
                const result = {
                    ...item,
                    processed: true,
                    processedAt: Date.now()
                };
                
                console.log(`    Processed item ${id}: ${item.value.toFixed(2)}`);
                return result;
            },
            
            // Get processing statistics
            getStats: function() {
                const stats = {
                    totalItems: largeData.length,
                    processedCount: processedCount,
                    averageValue: processedCount > 0 ? totalValue / processedCount : 0,
                    completionPercent: (processedCount / largeData.length * 100).toFixed(1)
                };
                
                console.log('    Processing stats:', stats);
                return stats;
            },
            
            // Cleanup method to help with memory management
            cleanup: function() {
                // Clear references to large data
                largeData.length = 0; // Clear array contents
                processedCount = 0;
                totalValue = 0;
                
                console.log('    Cleanup completed - large data cleared');
            }
        };
    }
    
    // Use the data processor
    const processor = createDataProcessor();
    
    // Process some items
    processor.processItem(5);
    processor.processItem(15);
    processor.processItem(25);
    processor.getStats();
    
    // Cleanup when done (important for memory management)
    processor.cleanup();
    
    /**
     * Memory Management Best Practices:
     * 1. Be aware that closures keep outer scope alive
     * 2. Provide cleanup methods for closures with large data
     * 3. Null out references when no longer needed
     * 4. Consider WeakMap/WeakSet for automatic cleanup
     * 5. Be careful with DOM references in event handlers
     */
}

demonstrateClosureLifecycle();

// ============================================================================
// PRACTICAL CLOSURE APPLICATIONS
// ============================================================================

/**
 * Real-World Closure Patterns:
 * 
 * Closures enable several important JavaScript patterns:
 * 1. Data privacy and encapsulation
 * 2. Function factories and configuration
 * 3. Partial application and currying
 * 4. Module patterns and namespace creation
 */

console.log('\n=== PRACTICAL CLOSURE APPLICATIONS ===\n');

function demonstratePracticalApplications() {
    console.log('5. Practical Closure Applications:');
    
    // Application 1: Configuration-based function factory
    function createValidator(config) {
        const { minLength, maxLength, pattern, required } = config;
        
        console.log(`  Created validator with config:`, config);
        
        // Return customized validation function
        return function validateInput(input) {
            const errors = [];
            
            // Required check
            if (required && (!input || input.trim() === '')) {
                errors.push('Input is required');
            }
            
            if (input) {
                // Length checks
                if (minLength && input.length < minLength) {
                    errors.push(`Minimum length is ${minLength}`);
                }
                
                if (maxLength && input.length > maxLength) {
                    errors.push(`Maximum length is ${maxLength}`);
                }
                
                // Pattern check
                if (pattern && !pattern.test(input)) {
                    errors.push('Input format is invalid');
                }
            }
            
            const isValid = errors.length === 0;
            const result = { isValid, errors, input };
            
            console.log(`    Validation result for "${input}":`, result);
            return result;
        };
    }
    
    // Create different validators with different configurations
    const emailValidator = createValidator({
        minLength: 5,
        maxLength: 100,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true
    });
    
    const passwordValidator = createValidator({
        minLength: 8,
        maxLength: 50,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        required: true
    });
    
    // Use the validators
    emailValidator('user@example.com');
    emailValidator('invalid-email');
    passwordValidator('StrongPass123');
    passwordValidator('weak');
    
    // Application 2: Counter with encapsulated state
    function createCounter(initialValue = 0, step = 1) {
        let current = initialValue;
        
        console.log(`  Created counter starting at ${initialValue} with step ${step}`);
        
        return {
            // Increment and return new value
            next: function() {
                current += step;
                console.log(`    Counter incremented to: ${current}`);
                return current;
            },
            
            // Get current value without changing it
            current: function() {
                console.log(`    Current counter value: ${current}`);
                return current;
            },
            
            // Reset to initial value
            reset: function() {
                current = initialValue;
                console.log(`    Counter reset to: ${current}`);
                return current;
            },
            
            // Set custom value
            set: function(value) {
                current = value;
                console.log(`    Counter set to: ${current}`);
                return current;
            }
        };
    }
    
    // Create and use counters
    const regularCounter = createCounter();
    const skipCounter = createCounter(100, 5);
    
    console.log('  Regular counter:');
    regularCounter.next();
    regularCounter.next();
    regularCounter.current();
    
    console.log('  Skip counter:');
    skipCounter.next();
    skipCounter.next();
    skipCounter.current();
    
    /**
     * Practical Benefits of Closures:
     * 1. Data encapsulation - variables can't be accessed directly
     * 2. Configuration persistence - settings captured at creation time
     * 3. State maintenance - values persist between function calls
     * 4. Factory patterns - create specialized functions from general ones
     */
}

demonstratePracticalApplications();

// ============================================================================
// CLOSURE DEBUGGING AND INSPECTION
// ============================================================================

/**
 * Debugging Closures:
 * 
 * Understanding how to debug and inspect closures is important for
 * development and troubleshooting closure-related issues.
 */

console.log('\n=== CLOSURE DEBUGGING TECHNIQUES ===\n');

function demonstrateClosureDebugging() {
    console.log('6. Closure Debugging Techniques:');
    
    // Create closure with various captured variables
    function createDebuggableClosure() {
        const constantValue = 'I am constant';
        let mutableValue = 'I can change';
        const objectValue = { prop1: 'value1', prop2: 'value2' };
        let counter = 0;
        
        return {
            // Method to inspect captured variables
            inspect: function() {
                const inspection = {
                    constantValue,
                    mutableValue,
                    objectValue: { ...objectValue },
                    counter,
                    timestamp: Date.now()
                };
                
                console.log('  Closure inspection:', inspection);
                return inspection;
            },
            
            // Method to modify captured variables
            modify: function(newMutableValue) {
                mutableValue = newMutableValue;
                counter++;
                objectValue.modified = true;
                objectValue.modificationCount = counter;
                
                console.log(`    Modified closure state: ${newMutableValue} (${counter})`);
            },
            
            // Method to test scope access
            testScope: function() {
                // Test what's accessible in this scope
                console.log('    Scope accessibility test:');
                console.log(`      constantValue: ${constantValue}`);
                console.log(`      mutableValue: ${mutableValue}`);
                console.log(`      objectValue.prop1: ${objectValue.prop1}`);
                console.log(`      counter: ${counter}`);
                
                // Test scope modification
                try {
                    eval('mutableValue = "modified via eval"');
                    console.log('      eval modification successful');
                } catch (error) {
                    console.log('      eval modification failed:', error.message);
                }
            }
        };
    }
    
    const debuggableClosure = createDebuggableClosure();
    
    // Debug closure at different points
    debuggableClosure.inspect();
    debuggableClosure.testScope();
    debuggableClosure.modify('new value');
    debuggableClosure.inspect();
    
    /**
     * Debugging Tips:
     * 1. Use browser dev tools to inspect closure scope
     * 2. Add inspection methods to closures during development
     * 3. Console.log variables to trace their values over time
     * 4. Be aware that closures can be inspected in debugger
     * 5. Use descriptive names for closure variables
     */
}

demonstrateClosureDebugging();

// Export fundamental closure utilities for learning and testing
module.exports = {
    // Basic closure creator for experimentation
    createClosure: function(outerValue) {
        return function(innerValue) {
            return {
                outer: outerValue,
                inner: innerValue,
                combined: outerValue + innerValue
            };
        };
    },
    
    // Closure scope analyzer
    analyzeClosure: function(closureFunction) {
        const analysis = {
            name: closureFunction.name || 'anonymous',
            length: closureFunction.length, // number of parameters
            toString: closureFunction.toString(),
            type: typeof closureFunction
        };
        
        return analysis;
    },
    
    // Memory leak detector helper
    createLeakDetector: function() {
        const createdClosures = new WeakSet();
        
        return {
            registerClosure: function(closure) {
                createdClosures.add(closure);
            },
            
            checkLeak: function(closure) {
                return createdClosures.has(closure);
            }
        };
    },
    
    // Closure performance tester
    testClosurePerformance: function(iterations = 100000) {
        // Test closure creation performance
        console.time('Closure creation');
        for (let i = 0; i < iterations; i++) {
            (function(x) {
                return function(y) {
                    return x + y;
                };
            })(i);
        }
        console.timeEnd('Closure creation');
        
        // Test closure execution performance
        const closure = (function(x) {
            return function(y) {
                return x + y;
            };
        })(42);
        
        console.time('Closure execution');
        for (let i = 0; i < iterations; i++) {
            closure(i);
        }
        console.timeEnd('Closure execution');
    }
};