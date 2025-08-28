/**
 * File: variable-hoisting.js
 * Description: Variable hoisting behavior with var, let, and const
 * Demonstrates differences between declaration types and hoisting patterns
 */

console.log('=== Variable Hoisting with var ===');

// Example 1: Basic var hoisting
console.log('1. Basic var hoisting:');

try {
  console.log('Before declaration:', typeof myVar); // undefined (not error)
  var myVar = 'Hello World';
  console.log('After declaration:', myVar);
} catch (error) {
  console.log('Error:', error.message);
}

// What the engine actually sees:
// var myVar; // hoisted to top, initialized to undefined
// console.log('Before declaration:', typeof myVar);
// myVar = 'Hello World';
// console.log('After declaration:', myVar);

// Example 2: Multiple var declarations
console.log('\n2. Multiple var declarations:');

var x = 1;
var x = 2; // No error - var allows redeclaration
console.log('x after redeclaration:', x);

// Function scope var example
function varScopeExample() {
  console.log('Inside function, before declaration:', typeof funcVar);
  
  if (true) {
    var funcVar = 'I am function scoped';
  }
  
  console.log('Inside function, after block:', funcVar); // Accessible
}

varScopeExample();

console.log('\n=== let and const Hoisting (TDZ) ===');

// Example 3: let hoisting with Temporal Dead Zone
console.log('3. let hoisting with TDZ:');

try {
  console.log('Before let declaration:', letVar); // ReferenceError
} catch (error) {
  console.log('TDZ Error:', error.message);
}

let letVar = 'I am let';
console.log('After let declaration:', letVar);

// Example 4: const hoisting
console.log('\n4. const hoisting:');

try {
  console.log('Before const declaration:', constVar); // ReferenceError
} catch (error) {
  console.log('Const TDZ Error:', error.message);
}

const constVar = 'I am const';
console.log('After const declaration:', constVar);

// Example 5: Block scope with let/const
console.log('\n5. Block scope behavior:');

{
  // These variables are hoisted to the top of this block but in TDZ
  console.log('Block started');
  
  // This would throw ReferenceError if uncommented:
  // console.log(blockLet);
  
  let blockLet = 'block scoped let';
  const blockConst = 'block scoped const';
  
  console.log('Inside block - let:', blockLet);
  console.log('Inside block - const:', blockConst);
}

// These would throw ReferenceError if uncommented:
// console.log(blockLet);
// console.log(blockConst);

console.log('\n=== Hoisting in Different Scopes ===');

// Example 6: Global scope hoisting
console.log('6. Global scope hoisting:');

// Global variables are hoisted but create window properties (in browser)
console.log('Before global var:', typeof globalVar);
var globalVar = 'I am global';

// Example 7: Function scope hoisting
console.log('\n7. Function scope hoisting:');

function functionScopeDemo() {
  console.log('Function start - innerVar:', typeof innerVar);
  
  if (Math.random() > 0.5) {
    var innerVar = 'maybe declared';
  } else {
    var innerVar = 'definitely declared';
  }
  
  console.log('Function end - innerVar:', innerVar);
}

functionScopeDemo();

// Example 8: Nested function hoisting
console.log('\n8. Nested function hoisting:');

function outerFunction() {
  console.log('Outer function - nestedVar:', typeof nestedVar);
  
  function innerFunction() {
    console.log('Inner function - nestedVar:', typeof nestedVar);
    var nestedVar = 'nested scope';
    console.log('Inner function - after declaration:', nestedVar);
  }
  
  innerFunction();
  console.log('Outer function - after inner call:', typeof nestedVar);
}

outerFunction();

console.log('\n=== Variable Shadowing ===');

// Example 9: Variable shadowing with hoisting
console.log('9. Variable shadowing:');

var shadowVar = 'outer scope';

function shadowExample() {
  console.log('Before inner declaration:', shadowVar); // undefined, not 'outer scope'
  var shadowVar = 'inner scope';
  console.log('After inner declaration:', shadowVar);
}

shadowExample();
console.log('After function call:', shadowVar); // Still 'outer scope'

// Let/const shadowing
{
  let shadowLet = 'outer let';
  
  {
    // This would throw ReferenceError if we tried to access shadowLet before declaration
    let shadowLet = 'inner let';
    console.log('Inner block shadowLet:', shadowLet);
  }
  
  console.log('Outer block shadowLet:', shadowLet);
}

console.log('\n=== Complex Hoisting Scenarios ===');

// Example 10: Mixed declarations
console.log('10. Mixed var, let, const:');

function mixedDeclarations() {
  console.log('Function start');
  
  // All these are hoisted, but behave differently:
  console.log('typeof a:', typeof a); // undefined
  // console.log('typeof b:', typeof b); // Would throw ReferenceError
  // console.log('typeof c:', typeof c); // Would throw ReferenceError
  
  var a = 1;
  let b = 2;
  const c = 3;
  
  console.log('After declarations - a:', a, 'b:', b, 'c:', c);
}

mixedDeclarations();

// Example 11: For loop hoisting issues
console.log('\n11. For loop hoisting:');

console.log('Using var in for loop:');
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var loop:', i), 10); // All print 3
}

console.log('Using let in for loop:');
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let loop:', j), 20); // Prints 0, 1, 2
}

// Example 12: Switch statement scope
console.log('\n12. Switch statement scope:');

function switchScopeDemo(value) {
  switch (value) {
    case 1:
      var caseVar = 'case 1';
      let caseLet = 'case 1 let';
      break;
    case 2:
      var caseVar = 'case 2'; // Same variable as case 1
      let caseLet = 'case 2 let'; // Different variable, would cause error if case 1 ran
      break;
  }
  
  console.log('After switch, caseVar:', typeof caseVar);
  // console.log('After switch, caseLet:', typeof caseLet); // Would throw error
}

switchScopeDemo(1);

console.log('\n=== Hoisting with Conditional Blocks ===');

// Example 13: Conditional hoisting
console.log('13. Conditional hoisting:');

function conditionalHoisting(condition) {
  console.log('Before condition, myVar:', typeof myVar); // undefined
  
  if (condition) {
    var myVar = 'condition true';
  } else {
    var myVar = 'condition false';
  }
  
  console.log('After condition, myVar:', myVar);
}

conditionalHoisting(true);
conditionalHoisting(false);

// Example 14: Try-catch hoisting
console.log('\n14. Try-catch hoisting:');

function tryCatchHoisting() {
  console.log('Before try-catch, errorVar:', typeof errorVar);
  
  try {
    var errorVar = 'try block';
    throw new Error('test');
  } catch (e) {
    var errorVar = 'catch block';
    var catchVar = 'only in catch';
  }
  
  console.log('After try-catch, errorVar:', errorVar);
  console.log('After try-catch, catchVar:', catchVar);
}

tryCatchHoisting();

console.log('\n=== Interview Edge Cases ===');

// Example 15: Function expression vs declaration hoisting
console.log('15. Function expression vs declaration:');

console.log('Before declarations:');
console.log('typeof functionDeclaration:', typeof functionDeclaration); // function
console.log('typeof functionExpression:', typeof functionExpression); // undefined

function functionDeclaration() {
  return 'I am hoisted completely';
}

var functionExpression = function() {
  return 'I follow var hoisting rules';
};

console.log('After declarations:');
console.log('functionDeclaration():', functionDeclaration());
console.log('functionExpression():', functionExpression());

// Example 16: Class hoisting (TDZ)
console.log('\n16. Class hoisting:');

try {
  const instance = new MyClass(); // ReferenceError
} catch (error) {
  console.log('Class TDZ error:', error.message);
}

class MyClass {
  constructor() {
    this.value = 'class instance';
  }
}

const validInstance = new MyClass();
console.log('Valid instance:', validInstance.value);

// Example 17: Arrow function hoisting
console.log('\n17. Arrow function hoisting:');

console.log('Before arrow function:');
console.log('typeof arrowFunc:', typeof arrowFunc); // undefined

var arrowFunc = () => 'I am an arrow function';

console.log('After declaration:');
console.log('arrowFunc():', arrowFunc());

// Example 18: Destructuring hoisting
console.log('\n18. Destructuring hoisting:');

console.log('Before destructuring:');
console.log('typeof destructuredVar:', typeof destructuredVar); // undefined

var { name: destructuredVar } = { name: 'destructured value' };

console.log('After destructuring:', destructuredVar);

console.log('\n=== Hoisting Best Practices Demo ===');

// Example 19: Good practices
console.log('19. Best practices:');

function goodPractices() {
  // Declare all variables at the top
  var functionVar;
  let blockVar;
  const CONSTANT = 'immutable';
  
  // Initialize after declaration
  functionVar = 'function scoped';
  blockVar = 'block scoped';
  
  console.log('Clean variable usage:', { functionVar, blockVar, CONSTANT });
  
  // Use const by default, let when reassignment needed
  const config = { api: 'endpoint' };
  let counter = 0;
  
  counter += 1;
  console.log('Counter after increment:', counter);
  console.log('Config remains:', config);
}

goodPractices();

// Export for testing
module.exports = {
  varScopeExample,
  shadowExample,
  mixedDeclarations,
  switchScopeDemo,
  conditionalHoisting,
  tryCatchHoisting,
  goodPractices
};