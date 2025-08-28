/**
 * File: hoisting-basics.js
 * Description: Basic hoisting behavior in JavaScript
 */

// Example 1: Variable hoisting with var
console.log('=== Variable Hoisting with var ===');
console.log('x before declaration:', x); // undefined (not ReferenceError)
var x = 5;
console.log('x after initialization:', x); // 5

// How JavaScript interprets it:
// var x; // Declaration hoisted
// console.log(x); // undefined
// x = 5; // Initialization stays in place

// Example 2: Function declaration hoisting
console.log('\n=== Function Declaration Hoisting ===');
console.log('Calling function before declaration:', sayHello()); // Works!

function sayHello() {
  return 'Hello from hoisted function';
}

// Example 3: Function expression hoisting
console.log('\n=== Function Expression Hoisting ===');
console.log('Type of func before:', typeof funcExpression); // undefined

var funcExpression = function() {
  return 'Function expression';
};

console.log('Type of func after:', typeof funcExpression); // function

// Example 4: let and const hoisting (TDZ)
console.log('\n=== let/const Hoisting (TDZ) ===');
// console.log(letVar); // ReferenceError: Cannot access before initialization
// console.log(constVar); // ReferenceError: Cannot access before initialization

let letVar = 'let value';
const constVar = 'const value';

console.log('let after declaration:', letVar);
console.log('const after declaration:', constVar);

// Example 5: Hoisting in nested scopes
console.log('\n=== Nested Scope Hoisting ===');
function outer() {
  console.log('Inner function accessible?', typeof inner); // function
  
  function inner() {
    console.log('Inside inner function');
  }
  
  inner();
}
outer();

// Example 6: Variable and function name collision
console.log('\n=== Name Collision ===');
console.log('foo before:', typeof foo); // function

var foo = 'variable';
function foo() {
  return 'function';
}

console.log('foo after:', foo); // 'variable'

// How it works:
// 1. Function declaration hoisted first
// 2. Variable declaration hoisted (but doesn't override)
// 3. Variable assignment executes in order

// Example 7: Multiple declarations
console.log('\n=== Multiple Declarations ===');
var a = 1;
var a = 2; // Allowed with var
console.log('Multiple var declarations:', a); // 2

// let b = 1;
// let b = 2; // SyntaxError: Identifier 'b' has already been declared

// Example 8: Hoisting in blocks (function scope vs block scope)
console.log('\n=== Block Scope Hoisting ===');
function testBlockScope() {
  if (true) {
    var blockVar = 'var in block'; // Function scoped
    let blockLet = 'let in block'; // Block scoped
    const blockConst = 'const in block'; // Block scoped
  }
  
  console.log('var accessible outside block:', blockVar); // Works
  // console.log(blockLet); // ReferenceError
  // console.log(blockConst); // ReferenceError
}
testBlockScope();

// Example 9: Hoisting order demonstration
console.log('\n=== Hoisting Order ===');
function demonstrateOrder() {
  console.log('1. variable x:', x); // undefined
  console.log('2. function func:', func); // [Function: func]
  console.log('3. class MyClass:', typeof MyClass); // ReferenceError (TDZ)
  
  var x = 5;
  function func() {}
  class MyClass {}
}

try {
  demonstrateOrder();
} catch (e) {
  console.log('Error caught:', e.message);
}

// Example 10: Parameters and hoisting
console.log('\n=== Parameters and Hoisting ===');
function parameterHoisting(param) {
  console.log('Parameter value:', param); // 'passed value'
  console.log('Local var:', localVar); // undefined
  
  var localVar = 'local';
  var param = 'overridden'; // This creates a new local variable
  
  console.log('Parameter after override:', param); // 'overridden'
  console.log('Local var after:', localVar); // 'local'
}
parameterHoisting('passed value');

module.exports = {
  sayHello,
  outer,
  testBlockScope,
  parameterHoisting
};