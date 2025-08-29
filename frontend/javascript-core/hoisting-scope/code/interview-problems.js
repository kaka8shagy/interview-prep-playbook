/**
 * File: interview-problems.js
 * Topic: Hoisting and Scope Interview Problems
 * 
 * This file contains comprehensive interview problems that test deep understanding
 * of hoisting and scope concepts. Each problem includes detailed explanations,
 * mental models, and step-by-step solutions.
 * Focus: Interview preparation, common pitfalls, and advanced problem solving
 */

// ============================================================================
// PROBLEM 1: VARIABLE HOISTING OUTPUT PREDICTION
// ============================================================================

/**
 * Problem: Predict the output of this code and explain why
 * 
 * This is one of the most common hoisting interview questions.
 * Tests understanding of var hoisting, function scope, and execution phases.
 */

console.log('=== PROBLEM 1: VARIABLE HOISTING PREDICTION ===\n');

function problem1_demonstration() {
    console.log('Problem 1 - What will this code output?');
    
    // The actual interview question code:
    console.log('a:', a); // What gets printed?
    console.log('b:', b); // What gets printed?
    // console.log('c:', c); // What happens here? (Uncomment to see)
    
    var a = 1;
    let b = 2;
    const c = 3;
    
    console.log('a after assignment:', a);
    console.log('b after assignment:', b);
    console.log('c after assignment:', c);
    
    /**
     * SOLUTION EXPLANATION:
     * 
     * Output Analysis:
     * - console.log('a:', a); → "a: undefined"
     * - console.log('b:', b); → ReferenceError: Cannot access 'b' before initialization
     * - console.log('c:', c); → ReferenceError: Cannot access 'c' before initialization
     * 
     * Mental Model:
     * 1. COMPILATION PHASE:
     *    - var a; → hoisted and initialized to undefined
     *    - let b; → hoisted but NOT initialized (TDZ)
     *    - const c; → hoisted but NOT initialized (TDZ)
     * 
     * 2. EXECUTION PHASE:
     *    - console.log('a:', a); → undefined (from compilation phase)
     *    - console.log('b:', b); → TDZ error (b exists but not accessible)
     *    - a = 1; → assignment happens here
     *    - b = 2; → b exits TDZ and gets value
     *    - c = 3; → c exits TDZ and gets value
     */
}

problem1_demonstration();

// ============================================================================
// PROBLEM 2: FUNCTION HOISTING VS VARIABLE HOISTING CONFLICTS
// ============================================================================

/**
 * Problem: Predict behavior when functions and variables have the same name
 * 
 * Tests understanding of hoisting priority, function declarations vs expressions,
 * and the interaction between different types of declarations.
 */

console.log('\n=== PROBLEM 2: FUNCTION VS VARIABLE CONFLICTS ===\n');

function problem2_demonstration() {
    console.log('Problem 2 - Function and variable name conflicts:');
    
    // Interview question scenario:
    console.log('1. foo before anything:', typeof foo, foo?.name || foo);
    
    var foo = 'I am a variable';
    console.log('2. foo after var assignment:', typeof foo, foo);
    
    function foo() {
        return 'I am a function';
    }
    
    console.log('3. foo after function declaration:', typeof foo, foo);
    
    var foo = 'I am a variable again';
    console.log('4. foo after second var assignment:', typeof foo, foo);
    
    /**
     * SOLUTION EXPLANATION:
     * 
     * Hoisting Priority Order:
     * 1. Function declarations (highest priority)
     * 2. Variable declarations (ignored if name already exists)
     * 3. Variable assignments (during execution)
     * 
     * Compilation Phase Process:
     * 1. function foo() → creates foo function binding
     * 2. var foo → ignored (foo already exists from function)
     * 3. var foo → ignored (foo already exists)
     * 
     * Execution Phase Process:
     * 1. console.log → shows function (from compilation)
     * 2. foo = 'I am a variable' → overwrites function with string
     * 3. function foo() {} → ignored (already processed in compilation)
     * 4. foo = 'I am a variable again' → overwrites with new string
     * 
     * Output:
     * 1. "function foo"
     * 2. "I am a variable" 
     * 3. "I am a variable" (not the function!)
     * 4. "I am a variable again"
     */
}

problem2_demonstration();

// ============================================================================
// PROBLEM 3: TEMPORAL DEAD ZONE EDGE CASES
// ============================================================================

/**
 * Problem: Identify TDZ errors in complex scenarios
 * 
 * Tests deep understanding of TDZ, variable shadowing, and scope boundaries.
 * This type of problem tests edge cases that even experienced developers miss.
 */

console.log('\n=== PROBLEM 3: TEMPORAL DEAD ZONE EDGE CASES ===\n');

function problem3_demonstration() {
    console.log('Problem 3 - TDZ Edge Cases:');
    
    let outerVariable = 'outer value';
    
    function scenario1() {
        console.log('Scenario 1 - Variable shadowing with TDZ:');
        
        try {
            // This should work, right? outerVariable is defined above...
            console.log('  Accessing outerVariable:', outerVariable);
        } catch (error) {
            console.log('  Error:', error.message);
            console.log('  Why: Variable shadowing creates TDZ even for outer variables');
        }
        
        let outerVariable = 'inner value'; // This creates TDZ for the entire function
        console.log('  After declaration:', outerVariable);
    }
    
    function scenario2() {
        console.log('\nScenario 2 - TDZ with default parameters:');
        
        function withDefault(param = tdzVar) {
            console.log('  Parameter:', param);
            let tdzVar = 'initialized';
            return tdzVar;
        }
        
        try {
            withDefault();
        } catch (error) {
            console.log('  Error:', error.message);
            console.log('  Why: Default parameters are evaluated before function body');
        }
        
        // This works because we provide the parameter
        console.log('  With provided param:', withDefault('provided'));
    }
    
    function scenario3() {
        console.log('\nScenario 3 - TDZ with typeof:');
        
        // typeof usually prevents ReferenceError, but not with TDZ!
        try {
            console.log('  typeof tdzVariable:', typeof tdzVariable);
        } catch (error) {
            console.log('  Error:', error.message);
            console.log('  Why: typeof cannot prevent TDZ errors with let/const');
        }
        
        let tdzVariable = 'now accessible';
        console.log('  typeof after declaration:', typeof tdzVariable);
    }
    
    scenario1();
    scenario2();
    scenario3();
    
    /**
     * SOLUTION EXPLANATION:
     * 
     * Key TDZ Insights:
     * 1. Variable shadowing creates TDZ for entire scope, even before declaration line
     * 2. Default parameters are evaluated before function body executes
     * 3. typeof operator cannot bypass TDZ errors (unlike with truly undeclared variables)
     * 4. TDZ exists from scope start until declaration is reached, regardless of outer scope
     */
}

problem3_demonstration();

// ============================================================================
// PROBLEM 4: CLOSURE AND SCOPE CHAIN COMPLEXITY
// ============================================================================

/**
 * Problem: Trace variable resolution through complex scope chains
 * 
 * Tests understanding of lexical scoping, closure creation, and scope chain traversal.
 * Common in advanced interviews to test closure mastery.
 */

console.log('\n=== PROBLEM 4: COMPLEX CLOSURE SCENARIOS ===\n');

function problem4_demonstration() {
    console.log('Problem 4 - Complex Closure and Scope Chain:');
    
    // Setup: Multiple nested functions with variables at different levels
    var globalVar = 'global';
    
    function outerFunction(outerParam) {
        var outerVar = 'outer';
        let outerLet = 'outer let';
        
        function middleFunction(middleParam) {
            var middleVar = 'middle';
            const middleConst = 'middle const';
            
            function innerFunction(innerParam) {
                var innerVar = 'inner';
                
                // The question: What values do these variables have?
                // And what happens if we change them?
                console.log('  Variables accessible in innerFunction:');
                console.log('    globalVar:', globalVar);
                console.log('    outerParam:', outerParam);
                console.log('    outerVar:', outerVar);
                console.log('    outerLet:', outerLet);
                console.log('    middleParam:', middleParam);
                console.log('    middleVar:', middleVar);
                console.log('    middleConst:', middleConst);
                console.log('    innerParam:', innerParam);
                console.log('    innerVar:', innerVar);
                
                // Modification test
                return function modifierFunction() {
                    outerVar = 'modified outer';
                    middleVar = 'modified middle';
                    innerVar = 'modified inner';
                    // middleConst = 'cannot modify'; // Would throw error
                    
                    console.log('  After modifications:');
                    console.log('    outerVar:', outerVar);
                    console.log('    middleVar:', middleVar);
                    console.log('    innerVar:', innerVar);
                };
            }
            
            return innerFunction;
        }
        
        return middleFunction;
    }
    
    // Execute the nested function chain
    const nestedFunction = outerFunction('outer param')('middle param')('inner param');
    nestedFunction(); // Execute the modifier
    
    // Advanced scenario: Multiple closures sharing scope
    function createCounterFactory() {
        let sharedCounter = 0;
        
        return {
            counter1: function() {
                return ++sharedCounter;
            },
            counter2: function() {
                sharedCounter += 2;
                return sharedCounter;
            },
            reset: function() {
                const oldValue = sharedCounter;
                sharedCounter = 0;
                return oldValue;
            },
            getCount: () => sharedCounter // Arrow function - lexical binding
        };
    }
    
    console.log('\n  Shared closure state:');
    const counters = createCounterFactory();
    console.log('    counter1():', counters.counter1()); // 1
    console.log('    counter2():', counters.counter2()); // 3
    console.log('    counter1():', counters.counter1()); // 4
    console.log('    getCount():', counters.getCount()); // 4
    console.log('    reset():', counters.reset()); // 4
    console.log('    getCount():', counters.getCount()); // 0
    
    /**
     * SOLUTION EXPLANATION:
     * 
     * Scope Chain Resolution:
     * 1. JavaScript starts with innermost scope
     * 2. If variable not found, moves to next outer scope
     * 3. Continues until variable found or global scope reached
     * 4. Throws ReferenceError if variable never found
     * 
     * Closure Capture:
     * 1. Functions capture variables from lexical scope (where defined)
     * 2. Captured variables maintain their references (not copies)
     * 3. Multiple functions can share same closure scope
     * 4. Modifications affect all functions sharing the scope
     * 
     * Memory Implications:
     * 1. Closures keep outer scope variables alive
     * 2. Can prevent garbage collection if not careful
     * 3. Arrow functions inherit 'this' from lexical scope
     */
}

problem4_demonstration();

// ============================================================================
// PROBLEM 5: HOISTING IN DIFFERENT CONTEXTS
// ============================================================================

/**
 * Problem: Compare hoisting behavior in different execution contexts
 * 
 * Tests understanding of hoisting in various contexts like global scope,
 * function scope, block scope, and eval contexts.
 */

console.log('\n=== PROBLEM 5: HOISTING IN DIFFERENT CONTEXTS ===\n');

function problem5_demonstration() {
    console.log('Problem 5 - Hoisting in Different Contexts:');
    
    // Context 1: Global scope hoisting
    console.log('1. Global scope hoisting:');
    console.log('   globalHoisted before declaration:', typeof globalHoisted);
    
    var globalHoisted = 'global value';
    
    // Context 2: Function scope hoisting
    function testFunctionScope() {
        console.log('\n2. Function scope hoisting:');
        console.log('   functionScoped before declaration:', typeof functionScoped);
        
        var functionScoped = 'function value';
        
        // Nested function hoisting
        nestedFunction(); // Can call before declaration
        
        function nestedFunction() {
            console.log('   Nested function called successfully');
        }
    }
    
    testFunctionScope();
    
    // Context 3: Block scope (ES6+)
    function testBlockScope() {
        console.log('\n3. Block scope behavior:');
        
        if (true) {
            // var is function-scoped, not block-scoped
            console.log('   varInBlock before declaration:', typeof varInBlock);
            var varInBlock = 'var in block';
            
            // let/const are block-scoped
            let letInBlock = 'let in block';
            const constInBlock = 'const in block';
            
            console.log('   Inside block - varInBlock:', varInBlock);
            console.log('   Inside block - letInBlock:', letInBlock);
            console.log('   Inside block - constInBlock:', constInBlock);
        }
        
        // var is accessible outside block
        console.log('   Outside block - varInBlock:', varInBlock);
        
        // let/const are NOT accessible outside block
        try {
            console.log(letInBlock);
        } catch (error) {
            console.log('   letInBlock outside block: ReferenceError');
        }
    }
    
    testBlockScope();
    
    // Context 4: Loop scope differences
    function testLoopScope() {
        console.log('\n4. Loop scope differences:');
        
        // var in loop - function scoped
        var varResults = [];
        for (var i = 0; i < 3; i++) {
            varResults.push(function() { return i; });
        }
        console.log('   var in loop results:', varResults.map(fn => fn())); // [3, 3, 3]
        
        // let in loop - block scoped (each iteration gets new variable)
        var letResults = [];
        for (let j = 0; j < 3; j++) {
            letResults.push(function() { return j; });
        }
        console.log('   let in loop results:', letResults.map(fn => fn())); // [0, 1, 2]
    }
    
    testLoopScope();
    
    // Context 5: Switch statement scope
    function testSwitchScope() {
        console.log('\n5. Switch statement scope:');
        
        const value = 1;
        
        switch (value) {
            case 1:
                let caseVar = 'case 1';
                console.log('   Case 1 - caseVar:', caseVar);
                break;
                
            case 2:
                // This would cause error if case 1 runs first
                // let caseVar = 'case 2'; // SyntaxError: Identifier 'caseVar' has already been declared
                console.log('   Case 2');
                break;
                
            default:
                console.log('   Default case');
        }
        
        /**
         * Switch Statement Scope Issue:
         * All cases share the same block scope, so let/const declarations
         * in different cases can conflict. Solution: wrap cases in blocks {}
         */
    }
    
    testSwitchScope();
    
    /**
     * SOLUTION SUMMARY:
     * 
     * Context-Specific Hoisting Rules:
     * 1. Global: var and function declarations hoisted to global scope
     * 2. Function: var and function declarations hoisted to function scope
     * 3. Block: let/const hoisted but in TDZ until declaration
     * 4. Loop: var shared across iterations, let/const get new binding per iteration
     * 5. Switch: all cases share same block scope
     * 
     * Best Practices:
     * 1. Always declare variables at the top of their scope
     * 2. Use let/const instead of var for better scoping
     * 3. Wrap switch cases in blocks if using let/const
     * 4. Be aware of closure creation in loops
     */
}

problem5_demonstration();

// ============================================================================
// PROBLEM 6: REAL-WORLD DEBUGGING SCENARIOS
// ============================================================================

/**
 * Problem: Debug production code with hoisting-related bugs
 * 
 * Tests ability to identify and fix common hoisting bugs that appear
 * in real applications. These are the types of bugs that cause production issues.
 */

console.log('\n=== PROBLEM 6: REAL-WORLD DEBUGGING SCENARIOS ===\n');

function problem6_demonstration() {
    console.log('Problem 6 - Real-world Debugging Scenarios:');
    
    // Scenario 1: Event listener bug with var in loops
    function buggyEventHandlers() {
        console.log('\nScenario 1 - Buggy Event Handlers:');
        
        const buttons = ['Button 1', 'Button 2', 'Button 3'];
        const handlers = [];
        
        // Buggy version with var
        console.log('  Buggy handlers (using var):');
        for (var i = 0; i < buttons.length; i++) {
            handlers.push(function() {
                console.log(`    Clicked ${buttons[i]}`); // Bug: i is always 3
            });
        }
        
        // Simulate button clicks
        handlers.forEach((handler, index) => {
            try {
                handler();
            } catch (error) {
                console.log(`    Handler ${index} error: ${error.message}`);
            }
        });
        
        // Fixed version with let
        console.log('  Fixed handlers (using let):');
        const fixedHandlers = [];
        for (let j = 0; j < buttons.length; j++) {
            fixedHandlers.push(function() {
                console.log(`    Clicked ${buttons[j]}`); // Works correctly
            });
        }
        
        fixedHandlers.forEach(handler => handler());
    }
    
    buggyEventHandlers();
    
    // Scenario 2: Module initialization order bug
    function moduleInitializationBug() {
        console.log('\nScenario 2 - Module Initialization Bug:');
        
        // Simulate a real module loading scenario
        function loadModule() {
            // This looks like it should work...
            console.log('  Initializing module...');
            console.log('  Config available:', typeof moduleConfig);
            
            initializeFeatures(); // Called before moduleConfig is set!
            
            var moduleConfig = {
                features: ['auth', 'logging', 'cache'],
                debug: true
            };
            
            function initializeFeatures() {
                if (moduleConfig && moduleConfig.features) {
                    console.log('  Features initialized:', moduleConfig.features);
                } else {
                    console.log('  Error: moduleConfig not available during initialization');
                    console.log('  This is a common hoisting-related bug!');
                }
            }
            
            // This works because now moduleConfig has a value
            console.log('  Calling initializeFeatures after config assignment:');
            initializeFeatures();
        }
        
        loadModule();
        
        // Fixed version
        function loadModuleFixed() {
            console.log('\n  Fixed module loading:');
            
            // Option 1: Initialize config first
            var moduleConfig = {
                features: ['auth', 'logging', 'cache'],
                debug: true
            };
            
            function initializeFeatures() {
                console.log('  Features initialized correctly:', moduleConfig.features);
            }
            
            console.log('  Fixed: Config available before function call');
            initializeFeatures();
        }
        
        loadModuleFixed();
    }
    
    moduleInitializationBug();
    
    // Scenario 3: Async operation with closure bug
    function asyncClosureBug() {
        console.log('\nScenario 3 - Async Operation with Closure Bug:');
        
        // Simulate loading data with callbacks
        const dataItems = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' }
        ];
        
        // Buggy version
        console.log('  Buggy async processing:');
        for (var k = 0; k < dataItems.length; k++) {
            setTimeout(function() {
                console.log(`    Processing item ${k}: ${dataItems[k]?.name || 'undefined'}`);
            }, 10);
        }
        
        // Fixed version 1: Use let
        setTimeout(() => {
            console.log('  Fixed version 1 (using let):');
            for (let m = 0; m < dataItems.length; m++) {
                setTimeout(function() {
                    console.log(`    Processing item ${m}: ${dataItems[m].name}`);
                }, 10);
            }
        }, 50);
        
        // Fixed version 2: Use closure
        setTimeout(() => {
            console.log('  Fixed version 2 (using closure):');
            for (var n = 0; n < dataItems.length; n++) {
                (function(index) {
                    setTimeout(function() {
                        console.log(`    Processing item ${index}: ${dataItems[index].name}`);
                    }, 10);
                })(n);
            }
        }, 100);
    }
    
    asyncClosureBug();
    
    /**
     * DEBUGGING STRATEGIES:
     * 
     * Common Hoisting Bugs:
     * 1. var in loops with async callbacks
     * 2. Function calls before variable initialization
     * 3. Module loading order dependencies
     * 4. Closure capturing wrong variables
     * 
     * Debugging Techniques:
     * 1. Add console.log statements to trace execution
     * 2. Check variable types with typeof
     * 3. Use browser debugger to inspect scope
     * 4. Look for TDZ errors with let/const
     * 5. Verify closure variable capture
     * 
     * Prevention:
     * 1. Use let/const instead of var
     * 2. Initialize variables when declaring
     * 3. Declare functions before calling
     * 4. Be explicit about dependency order
     */
}

problem6_demonstration();

// Export interview problem utilities for practice
module.exports = {
    // Problem generators for practice
    generateHoistingProblem: function(type) {
        const problems = {
            basic: () => {
                console.log(typeof x);
                var x = 5;
                return x;
            },
            
            conflict: () => {
                console.log(typeof fn);
                var fn = 'variable';
                function fn() { return 'function'; }
                return fn;
            },
            
            tdz: () => {
                try {
                    console.log(y);
                    let y = 10;
                    return y;
                } catch (e) {
                    return e.message;
                }
            }
        };
        
        return problems[type] || problems.basic;
    },
    
    // Scope chain analyzer for practice
    analyzeScopeChain: function(func) {
        const originalConsole = console.log;
        const logs = [];
        
        console.log = (...args) => {
            logs.push(args.join(' '));
            originalConsole(...args);
        };
        
        try {
            func();
        } finally {
            console.log = originalConsole;
        }
        
        return logs;
    },
    
    // TDZ tester
    testTDZScenario: function(code) {
        try {
            eval(code);
            return { error: false, message: 'No TDZ error' };
        } catch (error) {
            return {
                error: true,
                type: error.name,
                message: error.message,
                isTDZ: error.message.includes('before initialization')
            };
        }
    }
};