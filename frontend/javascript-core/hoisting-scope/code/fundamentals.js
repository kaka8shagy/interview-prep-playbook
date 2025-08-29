/**
 * File: fundamentals.js
 * Topic: Hoisting and Scope Fundamentals
 * 
 * This file explains the core concepts of JavaScript hoisting and scope with
 * detailed mental models and extensive commenting to understand the "why"
 * behind JavaScript's execution behavior.
 * Focus: Understanding execution context, hoisting mechanism, and scope chain basics
 */

// ============================================================================
// HOISTING MENTAL MODEL - Understanding JavaScript's Two-Phase Execution
// ============================================================================

/**
 * JavaScript Execution Mental Model:
 * 
 * Phase 1 - Compilation/Creation Phase:
 * - Scan code for declarations (var, function, let, const, class)
 * - Create bindings in the appropriate scope
 * - Initialize var and function declarations
 * - Create Temporal Dead Zone for let/const/class
 * 
 * Phase 2 - Execution Phase:
 * - Execute code line by line
 * - Assign values to variables
 * - Call functions
 * 
 * This two-phase process creates the "hoisting" effect where declarations
 * appear to be moved to the top of their scope.
 */

console.log('=== DEMONSTRATING HOISTING BEHAVIOR ===\n');

// Example 1: Variable Hoisting with var
console.log('1. Variable Hoisting with var:');
console.log('Before declaration, userName is:', userName); // undefined (not ReferenceError!)

var userName = 'John Doe';
console.log('After assignment, userName is:', userName); // 'John Doe'

/**
 * What actually happens during compilation:
 * 
 * Phase 1 (Creation):
 * var userName; // Hoisted and initialized to undefined
 * 
 * Phase 2 (Execution):
 * console.log(userName); // undefined
 * userName = 'John Doe'; // Assignment happens here
 * console.log(userName); // 'John Doe'
 */

// Example 2: Function Declaration Hoisting
console.log('\n2. Function Declaration Hoisting:');
console.log('Calling greetUser before declaration:', greetUser('Alice'));

function greetUser(name) {
    return `Hello, ${name}! Welcome to JavaScript hoisting.`;
}

/**
 * Function declarations are fully hoisted - both declaration and definition
 * are available immediately during the creation phase. This allows you to
 * call functions before they appear in the code.
 */

// Example 3: Function Expression Hoisting (Different Behavior)
console.log('\n3. Function Expression Hoisting:');
console.log('Type of farewell before assignment:', typeof farewell); // undefined

var farewell = function(name) {
    return `Goodbye, ${name}!`;
};

console.log('Calling farewell after assignment:', farewell('Bob'));

/**
 * Function expressions follow variable hoisting rules:
 * - The variable 'farewell' is hoisted and initialized to undefined
 * - The function assignment happens during execution phase
 * - Cannot be called before the assignment
 */

// ============================================================================
// LET, CONST, AND THE TEMPORAL DEAD ZONE
// ============================================================================

/**
 * Temporal Dead Zone (TDZ) Mental Model:
 * 
 * let and const declarations are hoisted but NOT initialized.
 * From the start of the scope until the declaration is encountered,
 * the variable is in the "Temporal Dead Zone" - it exists but cannot be accessed.
 * 
 * This prevents many common bugs and makes code more predictable.
 */

console.log('\n=== TEMPORAL DEAD ZONE DEMONSTRATION ===\n');

function demonstrateTDZ() {
    console.log('4. Temporal Dead Zone with let/const:');
    
    // This would throw ReferenceError: Cannot access 'modernVar' before initialization
    // console.log(modernVar); // Uncomment to see the error
    
    console.log('About to declare modernVar...');
    let modernVar = 'I am safely declared';
    console.log('modernVar after declaration:', modernVar);
    
    // const behaves the same way
    // console.log(constantValue); // Would throw ReferenceError
    const constantValue = 'I cannot be reassigned';
    console.log('constantValue:', constantValue);
    
    /**
     * TDZ Timeline for this function:
     * 1. Function scope created - modernVar and constantValue bindings created but uninitialized
     * 2. Execution starts - variables are in TDZ
     * 3. let modernVar = '...' - modernVar exits TDZ, becomes initialized
     * 4. const constantValue = '...' - constantValue exits TDZ, becomes initialized
     */
}

demonstrateTDZ();

// ============================================================================
// SCOPE CHAIN AND LEXICAL SCOPING
// ============================================================================

/**
 * Lexical Scoping Mental Model:
 * 
 * Scope is determined by WHERE variables and functions are declared in code,
 * not WHERE they are called. JavaScript looks for variables by walking up
 * the scope chain from inner to outer scopes until it finds the variable
 * or reaches the global scope.
 * 
 * Scope Chain: Inner Scope -> Outer Scope -> Global Scope
 */

console.log('\n=== SCOPE CHAIN DEMONSTRATION ===\n');

// Global scope variables
var globalVar = 'I am in global scope';
let globalLet = 'Global let variable';

function outerFunction(outerParam) {
    // Outer function scope
    var outerVar = 'I am in outer function scope';
    let outerLet = 'Outer function let variable';
    
    console.log('5. Scope Chain Example:');
    console.log('In outerFunction, can access globalVar:', globalVar);
    
    function innerFunction(innerParam) {
        // Inner function scope
        var innerVar = 'I am in inner function scope';
        let innerLet = 'Inner function let variable';
        
        // Variable resolution demonstration
        console.log('In innerFunction:');
        console.log('  innerVar:', innerVar); // Found in current scope
        console.log('  outerVar:', outerVar); // Found in outer scope
        console.log('  globalVar:', globalVar); // Found in global scope
        console.log('  outerParam:', outerParam); // Parameter from outer scope
        console.log('  innerParam:', innerParam); // Parameter from current scope
        
        /**
         * Variable lookup process for each access:
         * 1. Check current scope (innerFunction)
         * 2. If not found, check outer scope (outerFunction)  
         * 3. If not found, check global scope
         * 4. If not found anywhere, throw ReferenceError
         */
    }
    
    return innerFunction;
}

// Create closure that maintains access to outer scope
const closureFunction = outerFunction('outer parameter');
closureFunction('inner parameter');

// ============================================================================
// BLOCK SCOPE WITH LET AND CONST
// ============================================================================

/**
 * Block Scope Mental Model:
 * 
 * let and const create block-scoped variables (confined to the nearest {})
 * var creates function-scoped variables (confined to the nearest function)
 * 
 * Block scope prevents variables from leaking out of blocks like:
 * - if statements
 * - for loops  
 * - while loops
 * - try/catch blocks
 * - arbitrary {} blocks
 */

console.log('\n=== BLOCK SCOPE DEMONSTRATION ===\n');

function demonstrateBlockScope() {
    console.log('6. Block Scope Comparison:');
    
    // var is function-scoped
    if (true) {
        var functionScoped = 'var is function-scoped';
        let blockScoped = 'let is block-scoped';
        const alsoBlockScoped = 'const is also block-scoped';
    }
    
    // var is accessible outside the block
    console.log('functionScoped outside block:', functionScoped);
    
    // let and const are NOT accessible outside their block
    // console.log(blockScoped); // ReferenceError: blockScoped is not defined
    // console.log(alsoBlockScoped); // ReferenceError: alsoBlockScoped is not defined
    
    // Common pitfall: for loop with var vs let
    console.log('\n7. For Loop Scope Behavior:');
    
    // Using var - all callbacks share the same variable
    console.log('Using var in for loop:');
    for (var i = 0; i < 3; i++) {
        // Set timeout to demonstrate closure behavior
        setTimeout(() => {
            console.log('  var i:', i); // Will print 3, 3, 3 (not 0, 1, 2)
        }, 10);
    }
    
    // Using let - each iteration gets its own variable
    console.log('Using let in for loop:');
    for (let j = 0; j < 3; j++) {
        setTimeout(() => {
            console.log('  let j:', j); // Will print 0, 1, 2 as expected
        }, 20);
    }
    
    /**
     * Why the difference?
     * 
     * With var:
     * - i is function-scoped, so there's only ONE i variable
     * - All setTimeout callbacks reference the same i
     * - By the time callbacks execute, the loop has finished and i = 3
     * 
     * With let:
     * - j is block-scoped, so each iteration creates a NEW j
     * - Each setTimeout callback captures its own j value
     * - Callbacks execute with their respective j values (0, 1, 2)
     */
}

demonstrateBlockScope();

// ============================================================================
// HOISTING WITH CLASSES AND MODERN SYNTAX
// ============================================================================

/**
 * Class Hoisting Behavior:
 * 
 * Classes are hoisted but remain in the Temporal Dead Zone until their
 * declaration is reached, similar to let/const. This prevents using
 * classes before they are fully defined.
 */

console.log('\n=== CLASS HOISTING DEMONSTRATION ===\n');

function demonstrateClassHoisting() {
    console.log('8. Class Hoisting Behavior:');
    
    // This would throw ReferenceError: Cannot access 'ModernClass' before initialization
    // const instance = new ModernClass(); // Uncomment to see the error
    
    console.log('About to declare ModernClass...');
    
    class ModernClass {
        constructor(name) {
            this.name = name;
        }
        
        greet() {
            return `Hello from ${this.name}`;
        }
    }
    
    // Now we can use the class
    const instance = new ModernClass('Class Instance');
    console.log('Class instance greeting:', instance.greet());
    
    /**
     * Class hoisting prevents the confusing behavior where you might
     * try to instantiate a class before seeing its full definition,
     * making code more predictable and readable.
     */
}

demonstrateClassHoisting();

// ============================================================================
// PRACTICAL HOISTING PATTERNS AND BEST PRACTICES
// ============================================================================

/**
 * Best Practices for Managing Hoisting and Scope:
 * 
 * 1. Always declare before use (even though hoisting allows otherwise)
 * 2. Use let/const instead of var for better scoping
 * 3. Initialize variables when declaring them when possible
 * 4. Group related function declarations at the top of their scope
 * 5. Be aware of the Temporal Dead Zone with let/const
 */

console.log('\n=== BEST PRACTICES EXAMPLES ===\n');

function demonstrateBestPractices() {
    console.log('9. Best Practices for Hoisting and Scope:');
    
    // Good: Declare and initialize together
    const config = {
        apiUrl: 'https://api.example.com',
        timeout: 5000
    };
    
    // Good: Declare functions at the top of scope
    function processData(data) {
        return data.map(item => item.value).filter(value => value > 0);
    }
    
    function formatResult(result) {
        return `Processed ${result.length} items`;
    }
    
    // Good: Use const for values that won't change
    const data = [
        { value: 10 },
        { value: -5 },
        { value: 20 },
        { value: 0 },
        { value: 15 }
    ];
    
    // Good: Use descriptive variable names and limit scope
    {
        const processedData = processData(data);
        const resultMessage = formatResult(processedData);
        console.log('Result:', resultMessage);
        console.log('Processed values:', processedData);
    }
    
    // processedData and resultMessage are not accessible here - good!
    
    /**
     * This pattern prevents:
     * - Accidental variable reuse
     * - Temporal Dead Zone errors
     * - Scope pollution
     * - Hoisting-related confusion
     */
}

demonstrateBestPractices();

// ============================================================================
// DEBUGGING SCOPE AND HOISTING ISSUES
// ============================================================================

/**
 * Common Debugging Strategies:
 * 
 * 1. Use console.log to trace variable values at different points
 * 2. Check browser dev tools for scope inspection
 * 3. Look for Temporal Dead Zone errors with let/const
 * 4. Verify function availability before calls
 * 5. Check for variable shadowing in nested scopes
 */

function debuggingScopeExample() {
    console.log('\n10. Debugging Scope Issues:');
    
    let debugVar = 'outer value';
    
    function debugInner() {
        // Variable shadowing - inner debugVar hides outer debugVar
        console.log('Before inner declaration:', debugVar); // ReferenceError due to TDZ!
        let debugVar = 'inner value';
        console.log('After inner declaration:', debugVar);
    }
    
    try {
        debugInner();
    } catch (error) {
        console.log('Caught error:', error.message);
        console.log('This demonstrates Temporal Dead Zone in variable shadowing');
    }
    
    console.log('Outer debugVar still accessible:', debugVar);
}

debuggingScopeExample();

// Export utility functions for testing and learning
module.exports = {
    // Scope chain utilities
    createScopeChain: function(globalVar) {
        function outer(outerVar) {
            function inner(innerVar) {
                return { globalVar, outerVar, innerVar };
            }
            return inner;
        }
        return outer;
    },
    
    // Hoisting demonstration utilities
    demonstrateHoisting: function(type) {
        switch (type) {
            case 'var':
                console.log('var before:', typeof varDemo);
                var varDemo = 'hoisted';
                return varDemo;
            case 'let':
                try {
                    console.log(letDemo);
                } catch (e) {
                    console.log('let TDZ error:', e.message);
                }
                let letDemo = 'not hoisted';
                return letDemo;
            default:
                return 'unknown type';
        }
    },
    
    // Block scope testing
    testBlockScope: function() {
        const results = [];
        
        for (let i = 0; i < 3; i++) {
            results.push(() => i);
        }
        
        return results.map(fn => fn()); // [0, 1, 2]
    }
};