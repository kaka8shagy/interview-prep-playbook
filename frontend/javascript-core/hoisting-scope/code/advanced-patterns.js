/**
 * File: advanced-patterns.js
 * Topic: Advanced Hoisting and Scope Patterns
 * 
 * This file covers complex hoisting behaviors, advanced scope patterns,
 * and edge cases that commonly appear in interviews and real-world code.
 * Focus: Complex interactions, edge cases, and advanced scope manipulation
 */

// ============================================================================
// FUNCTION HOISTING vs VARIABLE HOISTING INTERACTIONS
// ============================================================================

/**
 * When Function Declarations and Variable Declarations Collide:
 * 
 * The hoisting priority order is:
 * 1. Function declarations (hoisted with full definition)
 * 2. Variable declarations (hoisted with undefined initialization)
 * 3. Variable assignments (happen during execution phase)
 * 
 * This creates complex interactions that are frequently tested in interviews.
 */

console.log('=== FUNCTION vs VARIABLE HOISTING CONFLICTS ===\n');

function demonstrateHoistingConflicts() {
    console.log('1. Function and Variable Name Conflicts:');
    
    // What gets logged here? The function or undefined?
    console.log('Before any declarations, foo is:', typeof foo, foo?.toString?.().slice(0, 50));
    
    // Variable declaration with the same name as function
    var foo = 'I am a variable';
    
    console.log('After variable assignment, foo is:', typeof foo, foo);
    
    // Function declaration with the same name
    function foo() {
        return 'I am a function';
    }
    
    console.log('After function declaration, foo is:', typeof foo, foo);
    
    /**
     * Execution Order Explanation:
     * 
     * Compilation Phase:
     * 1. function foo() declaration is hoisted - foo becomes the function
     * 2. var foo declaration is processed but ignored (foo already exists)
     * 
     * Execution Phase:
     * 1. console.log shows function (from compilation phase)
     * 2. foo = 'I am a variable' - reassigns foo to string
     * 3. function foo() {} - ignored during execution (already processed)
     * 4. Final foo is the string value
     */
}

demonstrateHoistingConflicts();

// Advanced example: Multiple declarations with the same name
function complexHoistingScenario() {
    console.log('\n2. Complex Multiple Declaration Scenario:');
    
    console.log('Initial state of complexVar:', typeof complexVar, complexVar?.name || complexVar);
    
    var complexVar = 'First assignment';
    console.log('After first assignment:', complexVar);
    
    function complexVar() {
        return 'Function declaration';
    }
    
    console.log('After function declaration:', typeof complexVar, complexVar);
    
    var complexVar = 'Second assignment';
    console.log('After second assignment:', complexVar);
    
    function complexVar() {
        return 'Second function declaration';
    }
    
    console.log('Final state:', typeof complexVar, complexVar);
    
    /**
     * Key Insight: Function declarations always win during the compilation phase,
     * but variable assignments during execution can override them.
     * Later function declarations override earlier ones during compilation.
     */
}

complexHoistingScenario();

// ============================================================================
// SCOPE CHAIN AND CLOSURE INTERACTIONS
// ============================================================================

/**
 * Advanced Closure Patterns with Scope Chain:
 * 
 * Closures capture variables from their lexical scope at the time of creation.
 * Understanding how closures interact with the scope chain is crucial for
 * advanced JavaScript patterns and avoiding memory leaks.
 */

console.log('\n=== ADVANCED CLOSURE AND SCOPE PATTERNS ===\n');

function createAdvancedClosureExample() {
    console.log('3. Advanced Closure Patterns:');
    
    // Outer scope variables
    let outerCounter = 0;
    var outerVar = 'outer';
    const outerConst = 'constant';
    
    // Returning multiple functions that share scope
    return {
        // Function 1: Increments shared counter
        increment: function() {
            outerCounter++;
            console.log(`  Incremented counter to: ${outerCounter}`);
            return outerCounter;
        },
        
        // Function 2: Reads all outer variables
        getState: function() {
            const state = {
                counter: outerCounter,
                variable: outerVar,
                constant: outerConst
            };
            console.log('  Current state:', state);
            return state;
        },
        
        // Function 3: Creates nested closure
        createNestedClosure: function(multiplier) {
            // This closure captures both outer scope and its own parameter
            return function(value) {
                const result = outerCounter * multiplier * value;
                console.log(`  Nested calculation: ${outerCounter} * ${multiplier} * ${value} = ${result}`);
                return result;
            };
        },
        
        // Function 4: Modifies outer scope from closure
        modifyOuter: function(newVar) {
            outerVar = newVar; // Modifying variable from outer scope
            console.log(`  Modified outerVar to: ${outerVar}`);
            
            // Can't modify const - this would throw an error
            // outerConst = 'new value'; // TypeError: Assignment to constant variable
        }
    };
}

// Using the advanced closure pattern
const closureExample = createAdvancedClosureExample();
closureExample.increment(); // counter: 1
closureExample.increment(); // counter: 2
closureExample.getState(); // Shows current state

const nestedCalculator = closureExample.createNestedClosure(5);
nestedCalculator(3); // 2 * 5 * 3 = 30

closureExample.modifyOuter('modified outer');
closureExample.getState(); // Shows modified state

// ============================================================================
// TEMPORAL DEAD ZONE EDGE CASES
// ============================================================================

/**
 * Complex Temporal Dead Zone Scenarios:
 * 
 * The TDZ creates subtle bugs that are hard to detect. Understanding
 * these edge cases helps write more robust code and debug TDZ issues.
 */

console.log('\n=== TEMPORAL DEAD ZONE EDGE CASES ===\n');

function demonstrateTDZEdgeCases() {
    console.log('4. Temporal Dead Zone Edge Cases:');
    
    // Edge Case 1: TDZ with default parameters
    function withDefaultParam(param = tdzVariable) {
        // This creates a TDZ issue - tdzVariable is not yet initialized
        // when the default parameter is evaluated
        console.log('  Inside function with param:', param);
        
        let tdzVariable = 'initialized inside function';
        return tdzVariable;
    }
    
    try {
        // This will throw because default parameter tries to access tdzVariable
        // before it's initialized
        withDefaultParam();
    } catch (error) {
        console.log('  TDZ Error with default param:', error.message);
    }
    
    // Edge Case 2: TDZ in nested scopes
    let outerTDZ = 'outer value';
    
    function nestedTDZExample() {
        console.log('  Trying to access outerTDZ from nested scope...');
        
        try {
            // This throws ReferenceError due to variable shadowing and TDZ
            console.log('  outerTDZ before declaration:', outerTDZ);
        } catch (error) {
            console.log('  TDZ Error in nested scope:', error.message);
        }
        
        let outerTDZ = 'inner value'; // Shadows outer variable
        console.log('  outerTDZ after declaration:', outerTDZ);
    }
    
    nestedTDZExample();
    
    // Edge Case 3: TDZ with destructuring
    function destructuringTDZ() {
        try {
            // This throws because destructuredVar is in TDZ
            const { prop } = destructuredVar;
        } catch (error) {
            console.log('  TDZ Error with destructuring:', error.message);
        }
        
        const destructuredVar = { prop: 'value' };
        console.log('  Destructuring after declaration works:', destructuredVar);
    }
    
    destructuringTDZ();
    
    /**
     * TDZ Prevention Strategies:
     * 1. Always declare variables before use
     * 2. Initialize variables when declaring them
     * 3. Be careful with variable shadowing
     * 4. Watch out for TDZ in function parameters and destructuring
     */
}

demonstrateTDZEdgeCases();

// ============================================================================
// IIFE AND MODULE PATTERNS WITH HOISTING
// ============================================================================

/**
 * Immediately Invoked Function Expressions (IIFE) and Modern Modules:
 * 
 * IIFEs create their own scope and interact with hoisting in unique ways.
 * Understanding these patterns is crucial for module design and avoiding
 * global scope pollution.
 */

console.log('\n=== IIFE AND MODULE PATTERNS ===\n');

// Classic IIFE pattern
const moduleExample = (function() {
    console.log('5. IIFE Module Pattern:');
    
    // Private variables (not accessible outside IIFE)
    var privateCounter = 0;
    let privateState = 'initialized';
    
    // Private function (hoisted within IIFE scope)
    function privateHelper(value) {
        return `Processed: ${value}`;
    }
    
    console.log('  Inside IIFE, privateHelper available:', typeof privateHelper);
    
    // Public interface returned from IIFE
    return {
        // Public method that uses private variables
        increment: function() {
            privateCounter++;
            console.log(`  Public increment: ${privateCounter}`);
            return privateCounter;
        },
        
        // Public method that uses private function
        process: function(data) {
            const result = privateHelper(data);
            console.log(`  Public process result: ${result}`);
            return result;
        },
        
        // Getter for private state
        getState: function() {
            const state = {
                counter: privateCounter,
                state: privateState,
                timestamp: Date.now()
            };
            console.log('  Current module state:', state);
            return state;
        }
    };
})(); // IIFE immediately executed

// Using the module
moduleExample.increment();
moduleExample.process('some data');
moduleExample.getState();

// privateCounter is not accessible here - good encapsulation!
// console.log(privateCounter); // ReferenceError

// Modern module pattern with block scoping
const modernModule = (() => {
    console.log('\n6. Modern Module Pattern with Block Scope:');
    
    // Using let/const for better scoping
    let moduleState = new Map();
    const moduleConfig = Object.freeze({
        version: '1.0.0',
        debug: true
    });
    
    // Private class inside module
    class PrivateDataProcessor {
        constructor() {
            this.processCount = 0;
        }
        
        process(data) {
            this.processCount++;
            return {
                processed: data,
                count: this.processCount,
                timestamp: Date.now()
            };
        }
    }
    
    const processor = new PrivateDataProcessor();
    
    return {
        // Public API
        addData(key, value) {
            moduleState.set(key, value);
            console.log(`  Added data: ${key} = ${value}`);
        },
        
        processData(key) {
            const data = moduleState.get(key);
            if (!data) {
                console.log(`  No data found for key: ${key}`);
                return null;
            }
            
            const result = processor.process(data);
            console.log(`  Processed data for ${key}:`, result);
            return result;
        },
        
        getModuleInfo() {
            return {
                config: moduleConfig,
                stateSize: moduleState.size,
                processCount: processor.processCount
            };
        }
    };
})();

// Using modern module
modernModule.addData('user1', { name: 'John', age: 30 });
modernModule.processData('user1');
console.log('Modern module info:', modernModule.getModuleInfo());

// ============================================================================
// HOISTING WITH ARROW FUNCTIONS AND CLASS METHODS
// ============================================================================

/**
 * Modern Function Syntax and Hoisting:
 * 
 * Arrow functions, class methods, and other modern syntax have different
 * hoisting behaviors that can be confusing when mixed with traditional
 * function declarations.
 */

console.log('\n=== MODERN FUNCTION SYNTAX HOISTING ===\n');

function modernFunctionHoisting() {
    console.log('7. Arrow Functions vs Function Declarations:');
    
    // Traditional function declaration - fully hoisted
    console.log('  Can call traditional function:', traditionalFunc());
    
    function traditionalFunc() {
        return 'I am hoisted!';
    }
    
    // Arrow function stored in var - only declaration hoisted
    console.log('  Arrow function before assignment:', typeof arrowVar); // undefined
    
    var arrowVar = () => 'I am an arrow function in var';
    console.log('  Arrow function after assignment:', arrowVar());
    
    // Arrow function stored in let/const - TDZ applies
    try {
        // This would throw ReferenceError
        // console.log(arrowLet());
        console.log('  Arrow function in let is in TDZ before declaration');
    } catch (error) {
        console.log('  TDZ Error:', error.message);
    }
    
    let arrowLet = () => 'I am an arrow function in let';
    console.log('  Arrow function after let declaration:', arrowLet());
}

modernFunctionHoisting();

// Class method hoisting behavior
class HoistingDemoClass {
    constructor() {
        console.log('\n8. Class Method Hoisting:');
        
        // Can call methods defined later in the class
        console.log('  Calling method from constructor:', this.laterMethod());
        
        // Can access properties defined later (if they're initialized)
        console.log('  Later property:', this.laterProperty);
    }
    
    // This method can be called from constructor even though it appears later
    laterMethod() {
        return 'Method is accessible from constructor';
    }
    
    // Property declarations are processed during construction
    laterProperty = 'Property is accessible';
    
    // Static method hoisting
    static staticMethod() {
        return 'Static methods are also hoisted within class';
    }
}

const demoInstance = new HoistingDemoClass();
console.log('Static method call:', HoistingDemoClass.staticMethod());

// ============================================================================
// DEBUGGING COMPLEX HOISTING SCENARIOS
// ============================================================================

/**
 * Debugging Tools and Techniques for Complex Hoisting:
 * 
 * When debugging complex hoisting issues, these patterns and tools help
 * identify the root cause and fix the problem systematically.
 */

console.log('\n=== DEBUGGING COMPLEX HOISTING ===\n');

function createHoistingDebugger() {
    console.log('9. Hoisting Debugging Utilities:');
    
    return {
        // Check what's available in current scope
        inspectScope: function(label = 'Current Scope') {
            console.log(`\n--- ${label} ---`);
            
            // List of common variable names to check
            const commonVars = ['temp', 'result', 'data', 'config', 'state'];
            
            commonVars.forEach(varName => {
                try {
                    const value = eval(varName);
                    console.log(`  ${varName}: ${typeof value} - ${value}`);
                } catch (error) {
                    console.log(`  ${varName}: ${error.name} - ${error.message}`);
                }
            });
        },
        
        // Test hoisting behavior for a given code string
        testHoisting: function(codeString, description) {
            console.log(`\nTesting: ${description}`);
            console.log(`Code: ${codeString}`);
            
            try {
                const result = eval(codeString);
                console.log(`Result: ${result}`);
                console.log(`Type: ${typeof result}`);
            } catch (error) {
                console.log(`Error: ${error.name} - ${error.message}`);
            }
        },
        
        // Analyze scope chain at runtime
        analyzeScopeChain: function() {
            console.log('\nScope Chain Analysis:');
            
            // This function will be nested to show scope chain
            function level1() {
                const level1Var = 'Level 1';
                
                function level2() {
                    const level2Var = 'Level 2';
                    
                    function level3() {
                        const level3Var = 'Level 3';
                        
                        console.log('  Level 3 can access:');
                        console.log('    level3Var:', level3Var);
                        console.log('    level2Var:', level2Var);
                        console.log('    level1Var:', level1Var);
                        // console.log('    Global variables also accessible');
                    }
                    
                    level3();
                }
                
                level2();
            }
            
            level1();
        }
    };
}

const debugger = createHoistingDebugger();
debugger.analyzeScopeChain();

// ============================================================================
// PERFORMANCE IMPLICATIONS OF HOISTING PATTERNS
// ============================================================================

/**
 * Performance Considerations:
 * 
 * Different hoisting patterns and scope management techniques have
 * performance implications that matter in high-performance applications.
 */

console.log('\n=== PERFORMANCE IMPLICATIONS ===\n');

function performanceComparison() {
    console.log('10. Performance Implications of Scope Patterns:');
    
    const iterations = 100000;
    
    // Test 1: Function declaration vs function expression performance
    console.time('Function declarations');
    for (let i = 0; i < iterations; i++) {
        function testFunc() {
            return i * 2;
        }
        testFunc();
    }
    console.timeEnd('Function declarations');
    
    console.time('Function expressions');
    for (let i = 0; i < iterations; i++) {
        const testFunc = function() {
            return i * 2;
        };
        testFunc();
    }
    console.timeEnd('Function expressions');
    
    console.time('Arrow functions');
    for (let i = 0; i < iterations; i++) {
        const testFunc = () => i * 2;
        testFunc();
    }
    console.timeEnd('Arrow functions');
    
    // Test 2: Variable access patterns
    const globalVar = 'global';
    
    function testScopeAccess() {
        const localVar = 'local';
        
        console.time('Local variable access');
        for (let i = 0; i < iterations; i++) {
            const temp = localVar; // Access local variable
        }
        console.timeEnd('Local variable access');
        
        console.time('Global variable access');
        for (let i = 0; i < iterations; i++) {
            const temp = globalVar; // Access global variable
        }
        console.timeEnd('Global variable access');
    }
    
    testScopeAccess();
    
    /**
     * Performance Insights:
     * 1. Function declarations are typically fastest (optimized by engines)
     * 2. Local variable access is faster than global variable access
     * 3. Arrow functions have slight overhead for 'this' binding
     * 4. Deeply nested scope chains slow down variable resolution
     */
}

performanceComparison();

// Export advanced utilities for testing and learning
module.exports = {
    // Advanced closure utilities
    createClosureFactory: function(initialValue) {
        let sharedState = initialValue;
        
        return function(operation) {
            switch (operation) {
                case 'get':
                    return sharedState;
                case 'increment':
                    return ++sharedState;
                case 'reset':
                    sharedState = initialValue;
                    return sharedState;
                default:
                    return sharedState;
            }
        };
    },
    
    // TDZ testing utility
    testTDZ: function(testCode) {
        try {
            eval(testCode);
            return { success: true, result: 'No TDZ error' };
        } catch (error) {
            return { 
                success: false, 
                error: error.name, 
                message: error.message 
            };
        }
    },
    
    // Scope chain visualization
    createScopeVisualizer: function() {
        const scopes = [];
        
        return {
            addScope: function(name, variables) {
                scopes.push({ name, variables, level: scopes.length });
                return this;
            },
            
            lookup: function(variableName) {
                for (let i = scopes.length - 1; i >= 0; i--) {
                    const scope = scopes[i];
                    if (variableName in scope.variables) {
                        return {
                            found: true,
                            value: scope.variables[variableName],
                            scope: scope.name,
                            level: scope.level
                        };
                    }
                }
                return { found: false, scope: null, level: -1 };
            },
            
            visualize: function() {
                return scopes.map(scope => ({
                    scope: scope.name,
                    level: scope.level,
                    variables: Object.keys(scope.variables)
                }));
            }
        };
    }
};