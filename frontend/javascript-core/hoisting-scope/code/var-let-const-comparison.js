/**
 * File: var-let-const-comparison.js
 * Description: Comprehensive comparison of var, let, and const
 * Demonstrates differences in hoisting, scope, redeclaration, and usage patterns
 */

console.log('=== Declaration and Initialization Differences ===');

// Example 1: Declaration behavior
console.log('1. Declaration behavior:');

// var declarations
console.log('Before var declaration:', typeof varVariable); // undefined
var varVariable = 'var value';
console.log('After var declaration:', varVariable);

// let declarations
try {
  console.log('Before let declaration:', typeof letVariable); // ReferenceError
} catch (error) {
  console.log('Let TDZ error:', error.message);
}

let letVariable = 'let value';
console.log('After let declaration:', letVariable);

// const declarations
try {
  console.log('Before const declaration:', typeof constVariable); // ReferenceError
} catch (error) {
  console.log('Const TDZ error:', error.message);
}

const constVariable = 'const value';
console.log('After const declaration:', constVariable);

console.log('\n=== Scope Differences ===');

// Example 2: Function scope vs block scope
console.log('2. Scope differences:');

function scopeComparison() {
  console.log('Function start');
  
  if (true) {
    var varInBlock = 'var in if block';
    let letInBlock = 'let in if block';
    const constInBlock = 'const in if block';
    
    console.log('Inside block:');
    console.log('  var:', varInBlock);
    console.log('  let:', letInBlock);
    console.log('  const:', constInBlock);
  }
  
  console.log('Outside block:');
  console.log('  var:', varInBlock); // Accessible - function scoped
  
  try {
    console.log('  let:', letInBlock); // ReferenceError - block scoped
  } catch (error) {
    console.log('  let error:', error.message);
  }
  
  try {
    console.log('  const:', constInBlock); // ReferenceError - block scoped
  } catch (error) {
    console.log('  const error:', error.message);
  }
}

scopeComparison();

// Example 3: Loop scope behavior
console.log('\n3. Loop scope behavior:');

// var in loops
console.log('var in for loop:');
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var i:', i), 10); // All print 3
}
console.log('After loop, var i:', i); // 3 (accessible)

// let in loops
console.log('let in for loop:');
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let j:', j), 20); // Prints 0, 1, 2
}
// console.log('After loop, let j:', j); // ReferenceError

// const in loops
console.log('const in for loop:');
for (const k of [0, 1, 2]) {
  setTimeout(() => console.log('const k:', k), 30); // Prints 0, 1, 2
}
// console.log('After loop, const k:', k); // ReferenceError

console.log('\n=== Redeclaration Rules ===');

// Example 4: Redeclaration behavior
console.log('4. Redeclaration behavior:');

// var allows redeclaration
var redeclareTest = 'first var';
console.log('First var declaration:', redeclareTest);

var redeclareTest = 'second var';
console.log('Second var declaration:', redeclareTest);

// let doesn't allow redeclaration in same scope
let letRedeclare = 'first let';
console.log('First let declaration:', letRedeclare);

try {
  // This would cause SyntaxError at parse time:
  // let letRedeclare = 'second let';
  eval('let letRedeclare = "second let"'); // Using eval to catch at runtime
} catch (error) {
  console.log('Let redeclaration error:', error.message);
}

// const doesn't allow redeclaration
const constRedeclare = 'first const';
console.log('First const declaration:', constRedeclare);

try {
  eval('const constRedeclare = "second const"');
} catch (error) {
  console.log('Const redeclaration error:', error.message);
}

console.log('\n=== Reassignment Rules ===');

// Example 5: Reassignment behavior
console.log('5. Reassignment behavior:');

// var allows reassignment
var reassignVar = 'original var';
console.log('Original var:', reassignVar);
reassignVar = 'reassigned var';
console.log('Reassigned var:', reassignVar);

// let allows reassignment
let reassignLet = 'original let';
console.log('Original let:', reassignLet);
reassignLet = 'reassigned let';
console.log('Reassigned let:', reassignLet);

// const doesn't allow reassignment
const reassignConst = 'original const';
console.log('Original const:', reassignConst);

try {
  reassignConst = 'reassigned const'; // TypeError
} catch (error) {
  console.log('Const reassignment error:', error.message);
}

// const with objects/arrays (contents can change)
const constObject = { name: 'John', age: 30 };
console.log('Original const object:', constObject);

constObject.age = 31; // This is allowed
constObject.city = 'New York'; // This is allowed
console.log('Modified const object:', constObject);

try {
  constObject = { name: 'Jane' }; // This is not allowed
} catch (error) {
  console.log('Const object reassignment error:', error.message);
}

console.log('\n=== Temporal Dead Zone Comparison ===');

// Example 6: TDZ behavior
console.log('6. Temporal Dead Zone:');

function tdzComparison() {
  console.log('Function start');
  
  // var is hoisted and initialized to undefined
  console.log('var before declaration:', typeof varTDZ); // undefined
  
  // let/const are hoisted but not initialized (TDZ)
  try {
    console.log('let before declaration:', typeof letTDZ); // ReferenceError
  } catch (error) {
    console.log('Let TDZ:', error.message);
  }
  
  try {
    console.log('const before declaration:', typeof constTDZ); // ReferenceError
  } catch (error) {
    console.log('Const TDZ:', error.message);
  }
  
  var varTDZ = 'var value';
  let letTDZ = 'let value';
  const constTDZ = 'const value';
  
  console.log('After declarations:');
  console.log('  var:', varTDZ);
  console.log('  let:', letTDZ);
  console.log('  const:', constTDZ);
}

tdzComparison();

console.log('\n=== Global Object Binding ===');

// Example 7: Global object properties
console.log('7. Global object binding:');

// In browser, var creates window property
var globalVar = 'global var';
let globalLet = 'global let';
const globalConst = 'global const';

// Simulate checking global object properties
function checkGlobalBinding() {
  const globalThis = (function() { return this; })() || {};
  
  console.log('Global var creates property:', 'globalVar' in globalThis);
  console.log('Global let creates property:', 'globalLet' in globalThis);
  console.log('Global const creates property:', 'globalConst' in globalThis);
}

checkGlobalBinding();

console.log('\n=== Performance Considerations ===');

// Example 8: Performance comparison
console.log('8. Performance comparison:');

function performanceTest() {
  const iterations = 1000000;
  
  // var performance
  console.time('var performance');
  for (var i = 0; i < iterations; i++) {
    var varPerf = i * 2;
  }
  console.timeEnd('var performance');
  
  // let performance
  console.time('let performance');
  for (let j = 0; j < iterations; j++) {
    let letPerf = j * 2;
  }
  console.timeEnd('let performance');
  
  // const performance
  console.time('const performance');
  for (let k = 0; k < iterations; k++) {
    const constPerf = k * 2;
  }
  console.timeEnd('const performance');
}

performanceTest();

console.log('\n=== Best Practice Examples ===');

// Example 9: Best practices demonstration
console.log('9. Best practices:');

// Bad: Using var
function badPracticeExample() {
  console.log('Bad practices with var:');
  
  // Accidentally global
  for (var i = 0; i < 3; i++) {
    var message = `Iteration ${i}`;
  }
  
  console.log('Loop variable leaked:', i); // 3
  console.log('Message variable leaked:', message); // "Iteration 2"
  
  // Unexpected hoisting
  console.log('Hoisted var:', hoistedVar); // undefined, not error
  var hoistedVar = 'hoisted value';
}

// Good: Using let/const
function goodPracticeExample() {
  console.log('Good practices with let/const:');
  
  // Block scoped variables
  for (let i = 0; i < 3; i++) {
    const message = `Iteration ${i}`;
    console.log(message);
  }
  
  // i and message are not accessible here
  
  // Use const by default
  const config = {
    api: 'https://api.example.com',
    timeout: 5000
  };
  
  // Use let only when reassignment needed
  let counter = 0;
  counter += 1;
  
  console.log('Config:', config);
  console.log('Counter:', counter);
}

badPracticeExample();
goodPracticeExample();

console.log('\n=== Edge Cases and Gotchas ===');

// Example 10: Edge cases
console.log('10. Edge cases:');

// Destructuring with different declaration types
const { a: varA } = { a: 1 };
const { b: letB } = { b: 2 };
const { c: constC } = { c: 3 };

console.log('Destructured variables:', { varA, letB, constC });

// For-in loop differences
const testObj = { x: 1, y: 2, z: 3 };

console.log('for-in with var:');
for (var prop in testObj) {
  setTimeout(() => console.log('var prop:', prop), 40); // All print 'z'
}

console.log('for-in with let:');
for (let prop in testObj) {
  setTimeout(() => console.log('let prop:', prop), 50); // Prints 'x', 'y', 'z'
}

// Switch statement scope
function switchScopeComparison(value) {
  switch (value) {
    case 'var':
      var caseVar = 'var case';
      break;
    case 'let':
      let caseLet = 'let case';
      break;
    case 'const':
      const caseConst = 'const case';
      break;
  }
  
  console.log('After switch:');
  console.log('  caseVar type:', typeof caseVar);
  
  try {
    console.log('  caseLet:', caseLet);
  } catch (error) {
    console.log('  caseLet error:', error.message);
  }
}

switchScopeComparison('var');

console.log('\n=== Interview Question Examples ===');

// Example 11: Common interview scenarios
console.log('11. Interview scenarios:');

// Question: What does this output?
function interviewQuestion1() {
  console.log('Interview Question 1 - Output:');
  
  for (var i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log('var i in timeout:', i);
    }, 60);
  }
  
  for (let j = 0; j < 3; j++) {
    setTimeout(function() {
      console.log('let j in timeout:', j);
    }, 70);
  }
}

// Question: Fix this code
function interviewQuestion2() {
  console.log('Interview Question 2 - Fixed code:');
  
  // Problem: var in loop
  const functions = [];
  
  // Bad version (commented out):
  // for (var i = 0; i < 3; i++) {
  //   functions.push(function() { return i; });
  // }
  
  // Good version:
  for (let i = 0; i < 3; i++) {
    functions.push(function() { return i; });
  }
  
  functions.forEach((fn, index) => {
    console.log(`Function ${index} returns:`, fn());
  });
}

// Question: Predict the behavior
function interviewQuestion3() {
  console.log('Interview Question 3 - Hoisting behavior:');
  
  console.log('typeof a:', typeof a); // undefined
  console.log('typeof b:', typeof b); // ReferenceError would occur
  
  var a = 1;
  // Uncommenting next line would cause ReferenceError:
  // console.log(b);
  let b = 2;
}

interviewQuestion1();
setTimeout(() => {
  interviewQuestion2();
  try {
    interviewQuestion3();
  } catch (error) {
    console.log('Interview Q3 error:', error.message);
  }
}, 100);

module.exports = {
  scopeComparison,
  tdzComparison,
  checkGlobalBinding,
  performanceTest,
  badPracticeExample,
  goodPracticeExample,
  switchScopeComparison,
  interviewQuestion1,
  interviewQuestion2,
  interviewQuestion3
};