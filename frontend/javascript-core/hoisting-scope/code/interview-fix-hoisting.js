/**
 * File: interview-fix-hoisting.js
 * Description: Common hoisting bugs and their fixes
 * Demonstrates debugging hoisting issues and implementing solutions
 */

console.log('=== Hoisting Bug Fixes ===');

// Problem 1: Loop Variable Issue
console.log('1. Loop Variable Issue:');

console.log('PROBLEM: Loop variable captured incorrectly');
// Broken version
function createFunctionsBroken() {
  const functions = [];
  
  for (var i = 0; i < 3; i++) {
    functions.push(function() {
      return `Function ${i}`; // All functions capture same 'i'
    });
  }
  
  return functions;
}

const brokenFunctions = createFunctionsBroken();
console.log('Broken results:');
brokenFunctions.forEach((fn, index) => {
  console.log(`  Function ${index}:`, fn()); // All print "Function 3"
});

console.log('SOLUTION 1: Use let instead of var');
function createFunctionsFixed1() {
  const functions = [];
  
  for (let i = 0; i < 3; i++) { // let creates new binding each iteration
    functions.push(function() {
      return `Function ${i}`;
    });
  }
  
  return functions;
}

const fixedFunctions1 = createFunctionsFixed1();
console.log('Fixed results (let):');
fixedFunctions1.forEach((fn, index) => {
  console.log(`  Function ${index}:`, fn());
});

console.log('SOLUTION 2: Use IIFE to capture variable');
function createFunctionsFixed2() {
  const functions = [];
  
  for (var i = 0; i < 3; i++) {
    functions.push((function(index) { // IIFE captures current value
      return function() {
        return `Function ${index}`;
      };
    })(i));
  }
  
  return functions;
}

const fixedFunctions2 = createFunctionsFixed2();
console.log('Fixed results (IIFE):');
fixedFunctions2.forEach((fn, index) => {
  console.log(`  Function ${index}:`, fn());
});

console.log('SOLUTION 3: Use bind to capture variable');
function createFunctionsFixed3() {
  const functions = [];
  
  for (var i = 0; i < 3; i++) {
    functions.push(function(index) {
      return `Function ${index}`;
    }.bind(null, i));
  }
  
  return functions;
}

const fixedFunctions3 = createFunctionsFixed3();
console.log('Fixed results (bind):');
fixedFunctions3.forEach((fn, index) => {
  console.log(`  Function ${index}:`, fn());
});

// Problem 2: Event Handler Scope Issues
console.log('\n2. Event Handler Scope Issues:');

console.log('PROBLEM: Event handlers in loop');
function createEventHandlersBroken() {
  const handlers = [];
  
  for (var i = 0; i < 3; i++) {
    handlers.push({
      id: i,
      onClick: function() {
        console.log(`Clicked button ${i}`); // All reference same 'i'
      }
    });
  }
  
  return handlers;
}

const brokenHandlers = createEventHandlersBroken();
console.log('Broken event handlers:');
brokenHandlers.forEach((handler, index) => {
  console.log(`  Handler ${index} click:`);
  handler.onClick(); // All print "Clicked button 3"
});

console.log('SOLUTION: Use let or closure');
function createEventHandlersFixed() {
  const handlers = [];
  
  for (let i = 0; i < 3; i++) {
    handlers.push({
      id: i,
      onClick: function() {
        console.log(`Clicked button ${i}`);
      }
    });
  }
  
  return handlers;
}

const fixedHandlers = createEventHandlersFixed();
console.log('Fixed event handlers:');
fixedHandlers.forEach((handler, index) => {
  console.log(`  Handler ${index} click:`);
  handler.onClick();
});

// Problem 3: Temporal Dead Zone Issues
console.log('\n3. Temporal Dead Zone Issues:');

console.log('PROBLEM: Accessing let/const before declaration');
function tdzProblemExample() {
  try {
    console.log('Accessing before declaration:', myVariable);
    let myVariable = 'declared value';
  } catch (error) {
    console.log('TDZ Error:', error.message);
  }
}

tdzProblemExample();

console.log('SOLUTION: Declare variables at top of scope');
function tdzSolutionExample() {
  let myVariable; // Declare at top
  
  // Other code here...
  console.log('Before assignment:', myVariable); // undefined, not error
  
  myVariable = 'assigned value';
  console.log('After assignment:', myVariable);
}

tdzSolutionExample();

// Problem 4: Function Hoisting Confusion
console.log('\n4. Function Hoisting Confusion:');

console.log('PROBLEM: Mixed function declarations and expressions');
function hoistingConfusionExample() {
  console.log('Before declarations:');
  console.log('typeof funcDeclaration:', typeof funcDeclaration); // function
  console.log('typeof funcExpression:', typeof funcExpression); // undefined
  
  // This works due to hoisting
  console.log('Function declaration result:', funcDeclaration());
  
  try {
    console.log('Function expression result:', funcExpression());
  } catch (error) {
    console.log('Function expression error:', error.message);
  }
  
  function funcDeclaration() {
    return 'hoisted function';
  }
  
  var funcExpression = function() {
    return 'function expression';
  };
  
  console.log('After declarations:');
  console.log('Function expression now works:', funcExpression());
}

hoistingConfusionExample();

console.log('SOLUTION: Use consistent function declaration style');
function consistentFunctionStyle() {
  // Option 1: All function declarations at top
  function helper1() {
    return 'helper 1';
  }
  
  function helper2() {
    return 'helper 2';
  }
  
  // Main logic
  console.log('Using declared functions:', helper1(), helper2());
  
  // Option 2: All function expressions with const
  const utilFn1 = function() {
    return 'util 1';
  };
  
  const utilFn2 = function() {
    return 'util 2';
  };
  
  console.log('Using function expressions:', utilFn1(), utilFn2());
}

consistentFunctionStyle();

// Problem 5: Variable Shadowing Issues
console.log('\n5. Variable Shadowing Issues:');

console.log('PROBLEM: Unintentional variable shadowing');
function shadowingProblem() {
  var data = 'outer data';
  
  function processData() {
    console.log('Processing:', data); // undefined, not 'outer data'
    
    if (Math.random() > 0.5) {
      var data = 'inner data'; // Shadows outer, but hoisted
    }
    
    console.log('Processed:', data);
  }
  
  processData();
}

shadowingProblem();

console.log('SOLUTION: Use different variable names or let/const');
function shadowingSolution() {
  const outerData = 'outer data';
  
  function processData() {
    console.log('Processing:', outerData); // Clearly references outer
    
    if (Math.random() > 0.5) {
      const innerData = 'inner data'; // Block scoped, no confusion
      console.log('Inner data:', innerData);
    }
    
    console.log('Outer data still available:', outerData);
  }
  
  processData();
}

shadowingSolution();

// Problem 6: Block Scope Misunderstanding
console.log('\n6. Block Scope Misunderstanding:');

console.log('PROBLEM: Expecting block scope with var');
function blockScopeProblem() {
  var results = [];
  
  if (true) {
    var blockVar = 'should be block scoped';
  }
  
  console.log('Var accessible outside block:', blockVar); // Accessible
  
  for (var i = 0; i < 3; i++) {
    if (i === 1) {
      var loopVar = 'loop variable';
    }
  }
  
  console.log('Loop var accessible:', loopVar); // Accessible
  console.log('Loop counter final value:', i); // 3
}

blockScopeProblem();

console.log('SOLUTION: Use let/const for block scope');
function blockScopeSolution() {
  const results = [];
  
  if (true) {
    let blockVar = 'properly block scoped';
    console.log('Inside block:', blockVar);
  }
  
  // console.log('Block var outside:', blockVar); // Would be ReferenceError
  
  for (let i = 0; i < 3; i++) {
    if (i === 1) {
      let loopVar = 'loop variable';
      console.log('Loop variable inside:', loopVar);
    }
  }
  
  // console.log('Loop var outside:', loopVar); // Would be ReferenceError
  // console.log('Loop counter outside:', i); // Would be ReferenceError
  console.log('Block scope working correctly');
}

blockScopeSolution();

// Problem 7: Async Callback Issues
console.log('\n7. Async Callback Issues:');

console.log('PROBLEM: Async callbacks with var');
function asyncCallbackProblem() {
  console.log('Async problem:');
  
  for (var i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log('Async var result:', i); // All print 3
    }, 100 + i * 10);
  }
}

asyncCallbackProblem();

console.log('SOLUTION: Use let or closure');
function asyncCallbackSolution() {
  console.log('Async solution with let:');
  
  for (let i = 0; i < 3; i++) {
    setTimeout(function() {
      console.log('Async let result:', i); // Prints 0, 1, 2
    }, 200 + i * 10);
  }
  
  console.log('Async solution with closure:');
  for (var j = 0; j < 3; j++) {
    (function(index) {
      setTimeout(function() {
        console.log('Async closure result:', index);
      }, 300 + index * 10);
    })(j);
  }
}

asyncCallbackSolution();

// Problem 8: Switch Statement Scope
console.log('\n8. Switch Statement Scope:');

console.log('PROBLEM: Variable declarations in switch cases');
function switchScopeProblem(value) {
  switch (value) {
    case 'a':
      var caseVar = 'case a';
      break;
    case 'b':
      var caseVar = 'case b'; // Same variable!
      break;
    default:
      console.log('Switch var:', typeof caseVar); // May be undefined
  }
  
  console.log('Outside switch:', caseVar);
}

switchScopeProblem('default');
switchScopeProblem('a');

console.log('SOLUTION: Use block scope or different names');
function switchScopeSolution(value) {
  switch (value) {
    case 'a': {
      let caseVar = 'case a'; // Block scoped
      console.log('Case a variable:', caseVar);
      break;
    }
    case 'b': {
      let caseVar = 'case b'; // Different variable
      console.log('Case b variable:', caseVar);
      break;
    }
    default:
      console.log('Default case');
  }
  
  console.log('Switch completed cleanly');
}

switchScopeSolution('a');
switchScopeSolution('b');

// Problem 9: Object Method Context
console.log('\n9. Object Method Context:');

console.log('PROBLEM: Method context and variable access');
const objectWithProblem = {
  name: 'Object',
  items: ['a', 'b', 'c'],
  
  processItems: function() {
    console.log('Processing items for:', this.name);
    
    for (var i = 0; i < this.items.length; i++) {
      setTimeout(function() {
        // 'this' is not what we expect, 'i' is wrong value
        console.log('Problem item:', this.items && this.items[i]); // undefined
      }, 400 + i * 10);
    }
  }
};

objectWithProblem.processItems();

console.log('SOLUTION: Use arrow functions or bind');
const objectWithSolution = {
  name: 'Object',
  items: ['a', 'b', 'c'],
  
  processItems: function() {
    console.log('Processing items for:', this.name);
    
    // Solution 1: Arrow functions (lexical this and let)
    for (let i = 0; i < this.items.length; i++) {
      setTimeout(() => {
        console.log('Solution 1 item:', this.items[i]);
      }, 500 + i * 10);
    }
    
    // Solution 2: Bind method
    for (let j = 0; j < this.items.length; j++) {
      setTimeout(function(index) {
        console.log('Solution 2 item:', this.items[index]);
      }.bind(this, j), 600 + j * 10);
    }
  }
};

setTimeout(() => {
  objectWithSolution.processItems();
}, 100);

// Problem 10: Module Pattern Issues
console.log('\n10. Module Pattern Issues:');

console.log('PROBLEM: Variable leakage in module pattern');
const problematicModule = (function() {
  // Accidentally global due to missing var/let/const
  moduleVar = 'leaked variable';
  
  return {
    getVar: function() {
      return moduleVar;
    }
  };
})();

console.log('Problematic module result:', problematicModule.getVar());
// console.log('Global leak:', typeof moduleVar); // Available globally

console.log('SOLUTION: Always use proper declarations');
const fixedModule = (function() {
  'use strict'; // Prevents accidental globals
  
  const moduleVar = 'properly scoped';
  let counter = 0;
  
  return {
    getVar: function() {
      return moduleVar;
    },
    
    increment: function() {
      return ++counter;
    },
    
    getCounter: function() {
      return counter;
    }
  };
})();

console.log('Fixed module result:', fixedModule.getVar());
console.log('Fixed module counter:', fixedModule.increment());
console.log('Fixed module counter:', fixedModule.getCounter());

module.exports = {
  createFunctionsBroken,
  createFunctionsFixed1,
  createFunctionsFixed2,
  createFunctionsFixed3,
  createEventHandlersBroken,
  createEventHandlersFixed,
  tdzProblemExample,
  tdzSolutionExample,
  hoistingConfusionExample,
  consistentFunctionStyle,
  shadowingProblem,
  shadowingSolution,
  blockScopeProblem,
  blockScopeSolution,
  asyncCallbackProblem,
  asyncCallbackSolution,
  switchScopeProblem,
  switchScopeSolution,
  objectWithProblem,
  objectWithSolution,
  problematicModule,
  fixedModule
};