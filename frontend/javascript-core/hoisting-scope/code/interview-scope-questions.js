/**
 * File: interview-scope-questions.js
 * Description: Common interview questions about scope and hoisting
 * Real interview problems with detailed explanations
 */

console.log('=== JavaScript Scope & Hoisting Interview Questions ===\n');

// === Question 1: Variable Hoisting Prediction ===
console.log('Q1: What will this code output?');
console.log('-----');

function question1() {
  console.log('a:', a);
  console.log('b:', b);
  console.log('c:', c);
  
  var a = 1;
  let b = 2;
  const c = 3;
}

try {
  question1();
} catch (e) {
  console.log('Error:', e.message);
}

// Answer: a: undefined, then ReferenceError for b
// Explanation: var is hoisted as undefined, let/const are in TDZ

// === Question 2: Function Hoisting vs Expression ===
console.log('\n\nQ2: Function hoisting behavior');
console.log('-----');

function question2() {
  console.log('typeof foo:', typeof foo);
  console.log('typeof bar:', typeof bar);
  
  var bar = function() { return 'bar'; };
  
  function foo() {
    return 'foo';
  }
}

question2();

// Answer: typeof foo: 'function', typeof bar: 'undefined'
// Explanation: Function declarations are fully hoisted, expressions are not

// === Question 3: Classic Loop Closure Problem ===
console.log('\n\nQ3: Loop closure problem');
console.log('-----');

function question3() {
  var functions = [];
  
  // Problem version
  for (var i = 0; i < 3; i++) {
    functions[i] = function() {
      return i;
    };
  }
  
  console.log('Problem results:', functions.map(f => f()));
  
  // Solution 1: IIFE
  var solution1 = [];
  for (var i = 0; i < 3; i++) {
    solution1[i] = (function(index) {
      return function() {
        return index;
      };
    })(i);
  }
  
  console.log('IIFE solution:', solution1.map(f => f()));
  
  // Solution 2: let
  var solution2 = [];
  for (let i = 0; i < 3; i++) {
    solution2[i] = function() {
      return i;
    };
  }
  
  console.log('let solution:', solution2.map(f => f()));
  
  // Solution 3: bind
  var solution3 = [];
  for (var i = 0; i < 3; i++) {
    solution3[i] = function(index) {
      return index;
    }.bind(null, i);
  }
  
  console.log('bind solution:', solution3.map(f => f()));
}

question3();

// === Question 4: Temporal Dead Zone ===
console.log('\n\nQ4: Temporal Dead Zone behavior');
console.log('-----');

function question4() {
  console.log('Start of function');
  
  // These will work
  console.log('var variable:', varVariable); // undefined
  console.log('function:', hoistedFunc()); // 'hoisted!'
  
  // These will throw ReferenceError
  try {
    console.log('let variable:', letVariable);
  } catch (e) {
    console.log('let error:', e.message);
  }
  
  try {
    console.log('const variable:', constVariable);
  } catch (e) {
    console.log('const error:', e.message);
  }
  
  var varVariable = 'var value';
  let letVariable = 'let value';
  const constVariable = 'const value';
  
  function hoistedFunc() {
    return 'hoisted!';
  }
}

question4();

// === Question 5: Scope Chain Resolution ===
console.log('\n\nQ5: Scope chain resolution');
console.log('-----');

var x = 'global';

function question5() {
  var x = 'outer';
  
  function inner() {
    var x = 'inner';
    
    function innermost() {
      console.log('innermost x:', x); // Which x?
    }
    
    innermost();
    
    // Remove local x and try again
    delete x; // Won't work, can't delete local variables
    console.log('after delete attempt:', x);
  }
  
  console.log('outer x:', x);
  inner();
}

question5();

// === Question 6: Variable Redeclaration ===
console.log('\n\nQ6: Variable redeclaration behavior');
console.log('-----');

function question6() {
  console.log('Initial foo:', foo); // undefined
  
  var foo = 'first';
  console.log('First assignment:', foo);
  
  var foo = 'second'; // Redeclaration allowed with var
  console.log('Second assignment:', foo);
  
  function foo() {
    return 'function';
  }
  
  console.log('After function:', foo); // Still 'second'
  
  // This would cause error with let/const
  try {
    eval(`
      let bar = 'first';
      let bar = 'second'; // SyntaxError
    `);
  } catch (e) {
    console.log('let redeclaration error:', e.message);
  }
}

question6();

// === Question 7: Block Scope Edge Cases ===
console.log('\n\nQ7: Block scope edge cases');
console.log('-----');

function question7() {
  var x = 1;
  let y = 2;
  const z = 3;
  
  if (true) {
    console.log('x in block before redeclaration:', x); // 1
    
    var x = 10; // Same variable (function scoped)
    let y = 20; // New variable (block scoped)
    const z = 30; // New variable (block scoped)
    
    console.log('In block:', { x, y, z }); // { x: 10, y: 20, z: 30 }
  }
  
  console.log('After block:', { x, y, z }); // { x: 10, y: 2, z: 3 }
}

question7();

// === Question 8: Function Scope vs Arrow Functions ===
console.log('\n\nQ8: Function types and this binding');
console.log('-----');

const question8 = {
  name: 'object',
  
  regularFunction: function() {
    console.log('Regular function this.name:', this.name);
    
    const innerRegular = function() {
      console.log('Inner regular this.name:', this.name); // undefined (global context)
    };
    
    const innerArrow = () => {
      console.log('Inner arrow this.name:', this.name); // 'object' (lexical this)
    };
    
    innerRegular();
    innerArrow();
  },
  
  arrowFunction: () => {
    console.log('Arrow function this.name:', this.name); // undefined (no own this)
  }
};

question8.regularFunction();
question8.arrowFunction();

// === Question 9: Complex Hoisting Scenario ===
console.log('\n\nQ9: Complex hoisting scenario');
console.log('-----');

function question9() {
  console.log('typeof a:', typeof a); // 'function'
  console.log('typeof b:', typeof b); // 'undefined'
  console.log('typeof c:', typeof c); // 'undefined'
  
  var a = 'variable a';
  console.log('typeof a after assignment:', typeof a); // 'string'
  
  function a() {
    return 'function a';
  }
  
  console.log('typeof a after function:', typeof a); // still 'string'
  
  var b = function() {
    return 'function b';
  };
  
  var c = () => {
    return 'arrow c';
  };
  
  console.log('Final types:', {
    a: typeof a,
    b: typeof b,
    c: typeof c
  });
}

question9();

// === Question 10: Module Pattern Scope ===
console.log('\n\nQ10: Module pattern scope');
console.log('-----');

const Question10Module = (function() {
  let privateCounter = 0;
  const privateFunction = function() {
    privateCounter++;
    return `Private function called ${privateCounter} times`;
  };
  
  return {
    publicCounter: 0,
    
    increment: function() {
      this.publicCounter++;
      return privateFunction();
    },
    
    getPrivateCounter: function() {
      return privateCounter;
    },
    
    // What happens when we try to access private variables?
    attemptPrivateAccess: function() {
      try {
        // This works because of closure
        console.log('Private counter via closure:', privateCounter);
        
        // This won't work
        console.log('Private counter via this:', this.privateCounter);
      } catch (e) {
        console.log('Error:', e.message);
      }
    }
  };
})();

console.log(Question10Module.increment()); // "Private function called 1 times"
console.log(Question10Module.increment()); // "Private function called 2 times"
console.log('Public counter:', Question10Module.publicCounter); // 2
console.log('Private counter:', Question10Module.getPrivateCounter()); // 2
Question10Module.attemptPrivateAccess();

// === Performance Test: Scope Chain Length ===
console.log('\n\nBonus: Scope chain performance');
console.log('-----');

function performanceTest() {
  const globalVar = 'global';
  
  // Deep scope chain
  function level1() {
    const level1Var = 'level1';
    
    function level2() {
      const level2Var = 'level2';
      
      function level3() {
        const level3Var = 'level3';
        
        function level4() {
          // Accessing variable from different scope levels
          console.time('Deep scope access');
          for (let i = 0; i < 100000; i++) {
            const result = globalVar + level1Var + level2Var + level3Var;
          }
          console.timeEnd('Deep scope access');
          
          // Accessing local variable (fastest)
          console.time('Local access');
          for (let i = 0; i < 100000; i++) {
            const result = level3Var;
          }
          console.timeEnd('Local access');
        }
        
        return level4;
      }
      
      return level3;
    }
    
    return level2;
  }
  
  const deepFunction = level1()()();
  deepFunction();
}

performanceTest();

module.exports = {
  question1,
  question2,
  question3,
  question4,
  question5,
  question6,
  question7,
  question8,
  question9,
  Question10Module,
  performanceTest
};