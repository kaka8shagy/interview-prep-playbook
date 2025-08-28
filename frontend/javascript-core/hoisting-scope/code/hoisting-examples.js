/**
 * File: hoisting-examples.js
 * Description: Comprehensive examples of hoisting behavior
 * Demonstrates var, let, const, function hoisting patterns
 */

console.log('=== Variable Hoisting Examples ===\n');

// === var Hoisting ===
console.log('1. var hoisting:');

// This code:
console.log(hoistedVar); // undefined (not ReferenceError)
var hoistedVar = 'I am hoisted!';
console.log(hoistedVar); // 'I am hoisted!'

// Is interpreted as:
// var hoistedVar; // hoisted to top, initialized as undefined
// console.log(hoistedVar); // undefined
// hoistedVar = 'I am hoisted!';
// console.log(hoistedVar); // 'I am hoisted!'

// === let and const Hoisting (Temporal Dead Zone) ===
console.log('\n2. let/const hoisting (Temporal Dead Zone):');

try {
  console.log(letVar); // ReferenceError: Cannot access 'letVar' before initialization
} catch (e) {
  console.log('Error:', e.message);
}

let letVar = 'I am let!';
console.log(letVar); // 'I am let!'

try {
  console.log(constVar); // ReferenceError: Cannot access 'constVar' before initialization
} catch (e) {
  console.log('Error:', e.message);
}

const constVar = 'I am const!';
console.log(constVar); // 'I am const!'

// === Function Declaration Hoisting ===
console.log('\n3. Function declaration hoisting:');

// Function can be called before declaration
console.log(hoistedFunction()); // 'I am hoisted!'

function hoistedFunction() {
  return 'I am hoisted!';
}

// === Function Expression Hoisting ===
console.log('\n4. Function expression hoisting:');

try {
  console.log(functionExpression()); // TypeError: functionExpression is not a function
} catch (e) {
  console.log('Error:', e.message);
}

var functionExpression = function() {
  return 'I am a function expression!';
};

console.log(functionExpression()); // 'I am a function expression!'

// === Arrow Function Hoisting ===
console.log('\n5. Arrow function hoisting:');

try {
  console.log(arrowFunction()); // ReferenceError: Cannot access 'arrowFunction' before initialization
} catch (e) {
  console.log('Error:', e.message);
}

const arrowFunction = () => 'I am an arrow function!';
console.log(arrowFunction()); // 'I am an arrow function!'

// === Complex Hoisting Scenarios ===
console.log('\n6. Complex hoisting scenarios:');

// Variable and function with same name
console.log(typeof complexExample); // 'function'

var complexExample = 'I am a variable!';
console.log(complexExample); // 'I am a variable!'

function complexExample() {
  return 'I am a function!';
}

console.log(complexExample); // 'I am a variable!' (variable assignment overwrites function)

// === Hoisting in Different Scopes ===
console.log('\n7. Hoisting in different scopes:');

function scopeExample() {
  console.log('Inside function, before declaration:', innerVar); // undefined
  
  if (true) {
    var innerVar = 'Function scoped!';
    let blockVar = 'Block scoped!';
    console.log('Inside block:', innerVar, blockVar);
  }
  
  console.log('Outside block:', innerVar); // 'Function scoped!'
  
  try {
    console.log('Outside block:', blockVar); // ReferenceError
  } catch (e) {
    console.log('Error accessing blockVar:', e.message);
  }
}

scopeExample();

// === Class Hoisting ===
console.log('\n8. Class hoisting:');

try {
  const instance = new MyClass(); // ReferenceError: Cannot access 'MyClass' before initialization
} catch (e) {
  console.log('Error:', e.message);
}

class MyClass {
  constructor() {
    this.value = 'I am a class!';
  }
}

const validInstance = new MyClass();
console.log(validInstance.value); // 'I am a class!'

// === Hoisting with Loops ===
console.log('\n9. Hoisting with loops:');

// Classic var loop issue
var varFunctions = [];
for (var i = 0; i < 3; i++) {
  varFunctions[i] = function() {
    return i; // All will return 3
  };
}

console.log('var loop results:', varFunctions.map(f => f())); // [3, 3, 3]

// let solves the issue
var letFunctions = [];
for (let i = 0; i < 3; i++) {
  letFunctions[i] = function() {
    return i; // Each will return its own i
  };
}

console.log('let loop results:', letFunctions.map(f => f())); // [0, 1, 2]

// === Interview Gotchas ===
console.log('\n10. Interview gotchas:');

// Gotcha 1: Function overwriting
console.log('Gotcha 1:');
function test() {
  return 'first';
}

console.log(test()); // 'second' (not 'first')

function test() {
  return 'second';
}

// Gotcha 2: var vs let in blocks
console.log('\nGotcha 2:');
console.log('Before block:', typeof blockTest); // 'undefined'

{
  function blockTest() {
    return 'block function';
  }
  var blockVar = 'block var';
}

console.log('After block:', typeof blockTest); // 'function' (in some environments)
console.log('After block:', blockVar); // 'block var'

// Gotcha 3: Parameter vs variable
console.log('\nGotcha 3:');
function parameterTest(param) {
  console.log('Parameter:', param); // undefined
  var param = 'redefined';
  console.log('Redefined:', param); // 'redefined'
}

parameterTest();

module.exports = {
  hoistedFunction,
  MyClass,
  scopeExample,
  parameterTest
};