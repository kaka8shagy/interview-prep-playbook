/**
 * File: interview-output-prediction.js
 * Description: Common interview questions - predict the output
 * Tests understanding of hoisting and scope
 */

// Question 1: Basic hoisting
console.log('=== Question 1: Basic Hoisting ===');
function question1() {
  console.log(a);
  var a = 1;
  console.log(a);
  
  function a() {
    return 'function';
  }
  
  console.log(a);
}

console.log('Output for Question 1:');
question1();
// Output: [Function: a], 1, 1

// Question 2: Nested scopes
console.log('\n=== Question 2: Nested Scopes ===');
var x = 1;

function question2() {
  console.log(x);
  var x = 2;
  
  function inner() {
    console.log(x);
    var x = 3;
    console.log(x);
  }
  
  inner();
  console.log(x);
}

console.log('Output for Question 2:');
question2();
// Output: undefined, undefined, 3, 2

// Question 3: let/const TDZ
console.log('\n=== Question 3: Temporal Dead Zone ===');
function question3() {
  console.log(typeof a);
  console.log(typeof b);
  
  let a = 1;
  const b = 2;
  
  console.log(a, b);
}

console.log('Output for Question 3:');
try {
  question3();
} catch (e) {
  console.log('Error:', e.message);
}
// Output: undefined, then ReferenceError

// Question 4: Block scope
console.log('\n=== Question 4: Block Scope ===');
function question4() {
  var a = 1;
  let b = 2;
  const c = 3;
  
  if (true) {
    var a = 4;
    let b = 5;
    const c = 6;
    console.log(a, b, c);
  }
  
  console.log(a, b, c);
}

console.log('Output for Question 4:');
question4();
// Output: 4 5 6, then 4 2 3

// Question 5: Function vs var priority
console.log('\n=== Question 5: Declaration Priority ===');
function question5() {
  console.log(typeof foo);
  console.log(typeof bar);
  
  var foo = 'hello';
  function foo() {
    return 'world';
  }
  
  function bar() {
    return 'world';
  }
  var bar = 'hello';
  
  console.log(typeof foo);
  console.log(typeof bar);
}

console.log('Output for Question 5:');
question5();
// Output: function, function, string, string

// Question 6: IIFE and hoisting
console.log('\n=== Question 6: IIFE Scope ===');
var result = 'global';

(function() {
  console.log(result);
  var result = 'local';
  console.log(result);
})();

console.log(result);
// Output: undefined, local, global

// Question 7: Loop hoisting
console.log('\n=== Question 7: Loop Hoisting ===');
function question7() {
  var funcs = [];
  
  for (var i = 0; i < 3; i++) {
    funcs[i] = function() {
      console.log('var i:', i);
    };
  }
  
  for (let j = 0; j < 3; j++) {
    funcs[j + 3] = function() {
      console.log('let j:', j);
    };
  }
  
  funcs.forEach(f => f());
}

console.log('Output for Question 7:');
question7();
// Output: var i: 3 (three times), let j: 0, 1, 2

// Question 8: Complex hoisting
console.log('\n=== Question 8: Complex Hoisting ===');
var a = 1;

function question8() {
  a = 10;
  console.log(a);
  console.log(window?.a || global?.a || 'not global');
  
  function a() {}
}

question8();
console.log(a);
// Output: 10, 1 (or 'not global' in strict isolated env), 1

// Question 9: Class hoisting
console.log('\n=== Question 9: Class Hoisting ===');
function question9() {
  try {
    const instance = new MyClass();
  } catch (e) {
    console.log('Error 1:', e.message);
  }
  
  class MyClass {
    constructor() {
      this.value = 'initialized';
    }
  }
  
  const instance = new MyClass();
  console.log('Success:', instance.value);
}

console.log('Output for Question 9:');
question9();
// Output: Error (cannot access before initialization), then Success: initialized

// Question 10: Mixed declarations
console.log('\n=== Question 10: Mixed Declarations ===');
function question10() {
  console.log(a, b, c);
  
  var a = 1;
  let b = 2;
  const c = 3;
  
  {
    console.log(a, b, c);
    var a = 4;
    let b = 5;
    const c = 6;
    console.log(a, b, c);
  }
  
  console.log(a, b, c);
}

console.log('Output for Question 10:');
try {
  question10();
} catch (e) {
  console.log('Error:', e.message);
}
// Output: Error (cannot access 'b' before initialization)

// Tricky Question: Arguments and parameters
console.log('\n=== Tricky: Arguments Hoisting ===');
function tricky(a = b, b = 1) {
  console.log(a, b);
}

try {
  tricky();
} catch (e) {
  console.log('Error:', e.message);
}

tricky(undefined, 2);
// Output: Error (b not defined), then 2 2

module.exports = {
  question1,
  question2,
  question3,
  question4,
  question5,
  question7,
  question8,
  question9,
  question10
};