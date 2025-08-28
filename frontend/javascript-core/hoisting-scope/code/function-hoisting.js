/**
 * File: function-hoisting.js
 * Description: Function hoisting behavior and patterns
 * Demonstrates function declarations vs expressions, arrow functions, and hoisting priority
 */

console.log('=== Function Declaration Hoisting ===');

// Example 1: Basic function declaration hoisting
console.log('1. Basic function declaration hoisting:');

// Function can be called before declaration
console.log('Before declaration:', hoistedFunction()); 

function hoistedFunction() {
  return 'I was called before my declaration!';
}

console.log('After declaration:', hoistedFunction());

// Example 2: Multiple function declarations with same name
console.log('\n2. Function redeclaration:');

console.log('First call:', duplicateFunction()); // Returns "second"

function duplicateFunction() {
  return 'first declaration';
}

function duplicateFunction() {
  return 'second declaration'; // This overwrites the first
}

console.log('Second call:', duplicateFunction());

console.log('\n=== Function Expression Hoisting ===');

// Example 3: Function expressions follow var hoisting rules
console.log('3. Function expression hoisting:');

console.log('Before expression:', typeof functionExpression); // undefined
// functionExpression(); // Would throw TypeError: not a function

var functionExpression = function() {
  return 'I am a function expression';
};

console.log('After expression:', functionExpression());

// Example 4: Named function expressions
console.log('\n4. Named function expressions:');

console.log('Before named expression:', typeof namedExpression); // undefined

var namedExpression = function myNamedFunction() {
  // myNamedFunction is only available inside this function
  console.log('Internal name:', myNamedFunction.name);
  return 'Named function expression';
};

console.log('Result:', namedExpression());
// console.log('External name:', myNamedFunction); // ReferenceError

console.log('\n=== Arrow Function Hoisting ===');

// Example 5: Arrow functions follow variable hoisting rules
console.log('5. Arrow function hoisting:');

console.log('Before arrow function:', typeof arrowFunc); // undefined
// arrowFunc(); // Would throw TypeError: not a function

var arrowFunc = () => {
  return 'I am an arrow function';
};

console.log('Arrow function result:', arrowFunc());

// Example 6: Arrow functions with let/const
console.log('\n6. Arrow functions with let/const:');

// console.log(letArrow); // Would throw ReferenceError (TDZ)

let letArrow = () => 'let arrow function';
const constArrow = () => 'const arrow function';

console.log('Let arrow:', letArrow());
console.log('Const arrow:', constArrow());

console.log('\n=== Function vs Variable Hoisting Priority ===');

// Example 7: Function declarations have higher priority
console.log('7. Function vs variable hoisting priority:');

console.log('Before any declaration:', typeof priorityTest); // function
console.log('Function call result:', priorityTest());

var priorityTest = 'I am a variable';

function priorityTest() {
  return 'I am a function declaration';
}

console.log('After variable assignment:', typeof priorityTest); // string
console.log('Variable value:', priorityTest);

// What happens:
// 1. Function declaration is hoisted first
// 2. Variable declaration is ignored (name already exists)
// 3. Variable assignment happens at runtime

// Example 8: Multiple function and variable declarations
console.log('\n8. Complex hoisting priority:');

console.log('Complex test:', complexHoistingTest());

var complexHoistingTest = 'variable 1';

function complexHoistingTest() {
  return 'function 1';
}

var complexHoistingTest = 'variable 2';

function complexHoistingTest() {
  return 'function 2'; // This wins among functions
}

// Variable assignments happen in order at runtime
complexHoistingTest = 'runtime assignment';

console.log('Final value:', complexHoistingTest);

console.log('\n=== Nested Function Hoisting ===');

// Example 9: Functions inside functions
console.log('9. Nested function hoisting:');

function outerFunction() {
  console.log('Outer start, inner type:', typeof innerFunction);
  console.log('Calling inner:', innerFunction());
  
  function innerFunction() {
    console.log('Inner function, nested type:', typeof nestedFunction);
    
    function nestedFunction() {
      return 'deeply nested';
    }
    
    return 'inner result: ' + nestedFunction();
  }
  
  console.log('Outer end, inner type:', typeof innerFunction);
}

outerFunction();

console.log('\n=== Block Scope and Function Hoisting ===');

// Example 10: Function declarations in blocks (sloppy mode vs strict mode)
console.log('10. Function declarations in blocks:');

function blockFunctionDemo() {
  'use strict';
  
  console.log('Before block, typeof blockFunc:', typeof blockFunc);
  
  if (true) {
    // In strict mode, this is block-scoped
    // In sloppy mode, it would be function-scoped
    function blockFunc() {
      return 'block function';
    }
    
    console.log('Inside block:', blockFunc());
  }
  
  try {
    console.log('After block:', blockFunc()); // May throw in strict mode
  } catch (error) {
    console.log('Block function not accessible:', error.message);
  }
}

blockFunctionDemo();

// Example 11: Let/const function assignments in blocks
console.log('\n11. Let/const function assignments:');

{
  // These are properly block-scoped
  let letFunc = function() { return 'let function'; };
  const constFunc = function() { return 'const function'; };
  
  console.log('Inside block - let:', letFunc());
  console.log('Inside block - const:', constFunc());
}

// These would throw ReferenceError:
// console.log(letFunc());
// console.log(constFunc());

console.log('\n=== Conditional Function Declarations ===');

// Example 12: Functions in conditional blocks
console.log('12. Conditional function declarations:');

function conditionalFunctionDemo(condition) {
  console.log('Before conditional:', typeof conditionalFunc);
  
  if (condition) {
    function conditionalFunc() {
      return 'condition was true';
    }
  } else {
    function conditionalFunc() {
      return 'condition was false';
    }
  }
  
  console.log('After conditional:', conditionalFunc());
}

conditionalFunctionDemo(true);
conditionalFunctionDemo(false);

console.log('\n=== IIFE and Hoisting ===');

// Example 13: Immediately Invoked Function Expressions
console.log('13. IIFE patterns:');

// Function declaration wrapped in parentheses becomes expression
var iifeResult1 = (function() {
  // This function has its own scope
  var privateVar = 'IIFE scope';
  
  function privateFn() {
    return privateVar;
  }
  
  return privateFn();
})();

console.log('IIFE result 1:', iifeResult1);

// Different IIFE syntax
var iifeResult2 = (function iifeNamed() {
  // iifeNamed is only available inside this function
  return 'Named IIFE result';
}());

console.log('IIFE result 2:', iifeResult2);

console.log('\n=== Method Hoisting in Objects ===');

// Example 14: Methods in object literals
console.log('14. Object method hoisting:');

var obj = {
  // Method shorthand
  method1() {
    return 'method 1 result';
  },
  
  // Function expression property
  method2: function() {
    return 'method 2 result';
  },
  
  // Arrow function property
  method3: () => {
    return 'method 3 result';
  },
  
  // Method that calls other methods
  callMethods() {
    // All methods are available here
    return {
      m1: this.method1(),
      m2: this.method2(),
      m3: this.method3()
    };
  }
};

console.log('Object methods:', obj.callMethods());

console.log('\n=== Class Method Hoisting ===');

// Example 15: Class methods and hoisting
console.log('15. Class method hoisting:');

try {
  new HoistedClass(); // ReferenceError - classes in TDZ
} catch (error) {
  console.log('Class TDZ error:', error.message);
}

class HoistedClass {
  constructor() {
    this.value = 'class instance';
    // All methods are available here
    this.result = this.method1();
  }
  
  method1() {
    // Can call method2 even though it's defined later
    return this.method2() + ' processed';
  }
  
  method2() {
    return 'method 2';
  }
  
  // Static methods
  static staticMethod() {
    return 'static method result';
  }
}

const instance = new HoistedClass();
console.log('Class instance:', instance);
console.log('Static method:', HoistedClass.staticMethod());

console.log('\n=== Generator Function Hoisting ===');

// Example 16: Generator functions
console.log('16. Generator function hoisting:');

console.log('Generator available:', typeof hoistedGenerator); // function
const gen = hoistedGenerator();
console.log('Generator result:', gen.next().value);

function* hoistedGenerator() {
  yield 'first value';
  yield 'second value';
}

// Generator expressions follow variable hoisting rules
console.log('Generator expression:', typeof generatorExpression); // undefined

var generatorExpression = function* () {
  yield 'expression generator';
};

console.log('Generator expression result:', generatorExpression().next().value);

console.log('\n=== Async Function Hoisting ===');

// Example 17: Async function declarations
console.log('17. Async function hoisting:');

console.log('Async function type:', typeof hoistedAsync); // function

// Can call immediately (returns Promise)
hoistedAsync().then(result => {
  console.log('Async result:', result);
});

async function hoistedAsync() {
  return 'async function result';
}

// Async function expressions
console.log('Async expression type:', typeof asyncExpression); // undefined

var asyncExpression = async function() {
  return 'async expression result';
};

asyncExpression().then(result => {
  console.log('Async expression result:', result);
});

console.log('\n=== Interview Edge Cases ===');

// Example 18: Function declarations in switch statements
console.log('18. Functions in switch statements:');

function switchFunctionDemo(value) {
  // Both functions are hoisted to function scope
  console.log('Before switch:', typeof caseFunction);
  
  switch (value) {
    case 'a':
      function caseFunction() { return 'case a function'; }
      break;
    case 'b':
      function caseFunction() { return 'case b function'; }
      break;
  }
  
  return caseFunction();
}

console.log('Switch result a:', switchFunctionDemo('a'));
console.log('Switch result b:', switchFunctionDemo('b'));

// Example 19: Function parameters and hoisting
console.log('\n19. Function parameters:');

function parameterHoisting(param = defaultParam()) {
  // Parameters are in their own scope
  console.log('Parameter value:', param);
  
  function defaultParam() {
    return 'default parameter function';
  }
  
  // Default function is hoisted within function scope
  return param;
}

console.log('Parameter result:', parameterHoisting());

// Example 20: Function hoisting with destructuring
console.log('\n20. Destructuring and functions:');

const { method: destructuredMethod } = {
  method: function() { return 'destructured method'; }
};

console.log('Destructured method:', destructuredMethod());

// Array destructuring with functions
const [firstFunc, secondFunc] = [
  function() { return 'first'; },
  function() { return 'second'; }
];

console.log('Array destructured functions:', firstFunc(), secondFunc());

module.exports = {
  hoistedFunction,
  duplicateFunction,
  outerFunction,
  blockFunctionDemo,
  conditionalFunctionDemo,
  HoistedClass,
  hoistedGenerator,
  hoistedAsync,
  switchFunctionDemo,
  parameterHoisting
};