/**
 * File: temporal-dead-zone.js
 * Description: Comprehensive examples of Temporal Dead Zone (TDZ)
 * Demonstrates let/const behavior before declaration
 */

console.log('=== Temporal Dead Zone (TDZ) Examples ===\n');

// === Basic TDZ Example ===
console.log('1. Basic TDZ with let:');

try {
  console.log(myLet); // ReferenceError: Cannot access 'myLet' before initialization
} catch (e) {
  console.log('Error:', e.message);
}

let myLet = 'Initialized let';
console.log('After declaration:', myLet);

// === TDZ with const ===
console.log('\n2. Basic TDZ with const:');

try {
  console.log(myConst); // ReferenceError: Cannot access 'myConst' before initialization
} catch (e) {
  console.log('Error:', e.message);
}

const myConst = 'Initialized const';
console.log('After declaration:', myConst);

// === TDZ in Functions ===
console.log('\n3. TDZ in functions:');

function tdzInFunction() {
  console.log('Function started');
  
  try {
    console.log(funcLet); // ReferenceError
  } catch (e) {
    console.log('Error in function:', e.message);
  }
  
  let funcLet = 'Function let';
  console.log('Function let after declaration:', funcLet);
}

tdzInFunction();

// === TDZ in Blocks ===
console.log('\n4. TDZ in blocks:');

{
  console.log('Block started');
  
  try {
    console.log(blockLet); // ReferenceError
  } catch (e) {
    console.log('Error in block:', e.message);
  }
  
  let blockLet = 'Block let';
  console.log('Block let after declaration:', blockLet);
}

// === TDZ with typeof ===
console.log('\n5. TDZ with typeof operator:');

// typeof with undeclared variables returns 'undefined'
console.log('typeof undeclaredVar:', typeof undeclaredVar); // 'undefined'

// typeof with let/const in TDZ throws ReferenceError
try {
  console.log('typeof tdzVar:', typeof tdzVar); // ReferenceError
} catch (e) {
  console.log('typeof error:', e.message);
}

let tdzVar = 'TDZ variable';

// === TDZ and Loops ===
console.log('\n6. TDZ and loops:');

// This works fine
for (let i = 0; i < 3; i++) {
  console.log('Loop iteration:', i);
}

// This would cause TDZ error
try {
  for (let j = 0; j < 3; j++) {
    console.log('Before declaration:', k); // ReferenceError
    let k = j;
  }
} catch (e) {
  console.log('Loop TDZ error:', e.message);
}

// === TDZ and Function Parameters ===
console.log('\n7. TDZ and function parameters:');

// This works - parameters are initialized before function body
function parameterExample(param = defaultValue) {
  const defaultValue = 'default'; // This won't work for the parameter default
  return param;
}

try {
  console.log(parameterExample()); // ReferenceError
} catch (e) {
  console.log('Parameter TDZ error:', e.message);
}

// Correct version
function parameterExampleFixed(param = 'default') {
  return param;
}

console.log('Fixed parameter example:', parameterExampleFixed());

// === TDZ with Destructuring ===
console.log('\n8. TDZ with destructuring:');

try {
  const { prop } = obj; // ReferenceError: Cannot access 'obj' before initialization
} catch (e) {
  console.log('Destructuring TDZ error:', e.message);
}

const obj = { prop: 'value' };
const { prop } = obj;
console.log('Destructuring after declaration:', prop);

// === TDZ and Class Declarations ===
console.log('\n9. TDZ and class declarations:');

try {
  const instance = new MyClass(); // ReferenceError
} catch (e) {
  console.log('Class TDZ error:', e.message);
}

class MyClass {
  constructor() {
    this.value = 'Class instance';
  }
}

const validInstance = new MyClass();
console.log('Valid class instance:', validInstance.value);

// === TDZ Duration Example ===
console.log('\n10. TDZ duration visualization:');

function tdzDuration() {
  console.log('Function start - TDZ begins for localVar');
  
  // TDZ active here
  try {
    console.log(localVar); // ReferenceError
  } catch (e) {
    console.log('TDZ active:', e.message);
  }
  
  console.log('Just before declaration');
  
  let localVar = 'Initialized'; // TDZ ends here
  
  console.log('After declaration:', localVar); // Works fine
}

tdzDuration();

// === TDZ vs var Comparison ===
console.log('\n11. TDZ vs var comparison:');

function tdzVsVar() {
  console.log('var before declaration:', varVariable); // undefined
  
  try {
    console.log('let before declaration:', letVariable); // ReferenceError
  } catch (e) {
    console.log('let TDZ:', e.message);
  }
  
  var varVariable = 'var value';
  let letVariable = 'let value';
  
  console.log('After declarations:', { varVariable, letVariable });
}

tdzVsVar();

// === Practical TDZ Scenarios ===
console.log('\n12. Practical TDZ scenarios:');

// Scenario 1: Conditional declarations
function conditionalTdz(condition) {
  if (condition) {
    try {
      console.log(conditionalVar); // ReferenceError even though inside if
    } catch (e) {
      console.log('Conditional TDZ:', e.message);
    }
    
    let conditionalVar = 'Conditional value';
    console.log('Conditional var after declaration:', conditionalVar);
  }
}

conditionalTdz(true);

// Scenario 2: Try-catch with TDZ
function tryCatchTdz() {
  try {
    console.log(tryVar); // ReferenceError
  } catch (e) {
    console.log('Try-catch TDZ:', e.message);
    
    // Even in catch block, TDZ is still active
    try {
      console.log(tryVar); // Still ReferenceError
    } catch (e2) {
      console.log('TDZ in catch:', e2.message);
    }
  }
  
  let tryVar = 'Try variable';
  console.log('Try var after declaration:', tryVar);
}

tryCatchTdz();

// === TDZ with Arrow Functions ===
console.log('\n13. TDZ with arrow functions:');

try {
  const arrowFunc = () => tdzArrowVar; // ReferenceError when called
  console.log(arrowFunc());
} catch (e) {
  console.log('Arrow function TDZ:', e.message);
}

const tdzArrowVar = 'Arrow variable';
const arrowFuncFixed = () => tdzArrowVar;
console.log('Fixed arrow function:', arrowFuncFixed());

// === TDZ Performance Impact ===
console.log('\n14. TDZ performance considerations:');

function tdzPerformance() {
  console.time('var access');
  for (let i = 0; i < 1000000; i++) {
    var temp = varPerf || 'default';
  }
  console.timeEnd('var access');
  
  console.time('let access after declaration');
  let letPerf = 'let value';
  for (let i = 0; i < 1000000; i++) {
    let temp = letPerf || 'default';
  }
  console.timeEnd('let access after declaration');
  
  var varPerf = 'var value';
}

tdzPerformance();

// === Advanced TDZ Edge Cases ===
console.log('\n15. Advanced TDZ edge cases:');

function advancedTdz() {
  // Edge case 1: Function expression vs declaration
  try {
    console.log(funcExpr()); // ReferenceError (TDZ)
  } catch (e) {
    console.log('Function expression TDZ:', e.message);
  }
  
  const funcExpr = () => 'Function expression';
  
  // Edge case 2: Hoisted function can access let/const after declaration
  console.log('Hoisted function result:', hoistedFunc());
  
  function hoistedFunc() {
    return hoistedLet; // This works because let is declared below
  }
  
  let hoistedLet = 'Hoisted let value';
}

advancedTdz();

// === Interview Question: Complex TDZ ===
console.log('\n16. Interview question - Complex TDZ:');

function complexTdzQuestion() {
  var x = 'outer';
  
  function inner() {
    console.log('x at start of inner:', typeof x); // 'undefined' (TDZ for inner x)
    
    try {
      console.log('Value of x:', x); // ReferenceError
    } catch (e) {
      console.log('Inner x TDZ:', e.message);
    }
    
    let x = 'inner'; // This x shadows the outer x
    console.log('x after declaration:', x);
  }
  
  inner();
  console.log('x after inner:', x); // Still 'outer'
}

complexTdzQuestion();

module.exports = {
  tdzInFunction,
  parameterExample,
  parameterExampleFixed,
  MyClass,
  tdzDuration,
  tdzVsVar,
  conditionalTdz,
  tryCatchTdz,
  tdzPerformance,
  advancedTdz,
  complexTdzQuestion
};