/**
 * File: scope-chain.js
 * Description: Demonstrates JavaScript scope chain and lexical scoping
 * Shows how variable resolution works through scope hierarchy
 */

console.log('=== JavaScript Scope Chain Examples ===\n');

// === Global Scope ===
var globalVar = 'I am global';
let globalLet = 'I am global let';
const globalConst = 'I am global const';

console.log('1. Global scope variables:');
console.log(globalVar, globalLet, globalConst);

// === Function Scope ===
function outerFunction() {
  var outerVar = 'I am in outer function';
  let outerLet = 'I am outer let';
  
  console.log('\n2. Outer function scope:');
  console.log('Accessing global from outer:', globalVar);
  console.log('Outer variable:', outerVar);
  
  function innerFunction() {
    var innerVar = 'I am in inner function';
    
    console.log('\n3. Inner function scope:');
    console.log('Accessing global from inner:', globalVar);
    console.log('Accessing outer from inner:', outerVar);
    console.log('Inner variable:', innerVar);
    
    // Scope chain: innerFunction -> outerFunction -> global
    return {
      inner: innerVar,
      outer: outerVar,
      global: globalVar
    };
  }
  
  return innerFunction;
}

const inner = outerFunction();
const scopeChainResult = inner();
console.log('\n4. Scope chain result:', scopeChainResult);

// === Block Scope ===
function blockScopeExample() {
  console.log('\n5. Block scope example:');
  
  var functionScoped = 'Function scoped var';
  
  if (true) {
    var functionScoped2 = 'Also function scoped';
    let blockScoped = 'Block scoped let';
    const blockConst = 'Block scoped const';
    
    console.log('Inside block:', { functionScoped, functionScoped2, blockScoped, blockConst });
  }
  
  console.log('Outside block - var accessible:', functionScoped2);
  
  try {
    console.log('Outside block - let:', blockScoped); // ReferenceError
  } catch (e) {
    console.log('Error accessing let outside block:', e.message);
  }
}

blockScopeExample();

// === Lexical Scoping ===
function lexicalScopingExample() {
  console.log('\n6. Lexical scoping example:');
  
  const outerValue = 'Outer lexical value';
  
  function createInnerFunction() {
    const innerValue = 'Inner lexical value';
    
    return function() {
      // Has access to both outer and inner scopes
      return `${outerValue} and ${innerValue}`;
    };
  }
  
  const innerFunc = createInnerFunction();
  console.log('Lexical scope result:', innerFunc());
}

lexicalScopingExample();

// === Variable Shadowing ===
function shadowingExample() {
  console.log('\n7. Variable shadowing:');
  
  const value = 'Outer value';
  
  function shadowFunction() {
    const value = 'Shadowed value'; // Shadows outer value
    console.log('Inner value:', value); // 'Shadowed value'
    
    function deeperFunction() {
      const value = 'Deeper shadowed value'; // Shadows both outer values
      console.log('Deeper value:', value); // 'Deeper shadowed value'
    }
    
    deeperFunction();
  }
  
  console.log('Outer value:', value); // 'Outer value'
  shadowFunction();
}

shadowingExample();

// === Closure and Scope Chain ===
function closureAndScopeChain() {
  console.log('\n8. Closure and scope chain:');
  
  const outerData = 'Closure data';
  let counter = 0;
  
  function createCounter() {
    const step = 1;
    
    return function() {
      counter += step;
      return `${outerData}: ${counter}`;
    };
  }
  
  const counterFunc = createCounter();
  console.log(counterFunc()); // 'Closure data: 1'
  console.log(counterFunc()); // 'Closure data: 2'
  console.log(counterFunc()); // 'Closure data: 3'
}

closureAndScopeChain();

// === Module Pattern with Scope ===
const ModuleExample = (function() {
  console.log('\n9. Module pattern with scope:');
  
  // Private variables (not accessible outside)
  let privateVar = 'Private data';
  let privateCounter = 0;
  
  // Private function
  function privateFunction() {
    return `Private function called with ${privateVar}`;
  }
  
  // Public API
  return {
    getPrivateVar() {
      return privateVar;
    },
    
    setPrivateVar(value) {
      privateVar = value;
    },
    
    increment() {
      privateCounter++;
      return privateCounter;
    },
    
    callPrivateFunction() {
      return privateFunction();
    }
  };
})();

console.log('Module private var:', ModuleExample.getPrivateVar());
console.log('Module increment:', ModuleExample.increment());
console.log('Module private function:', ModuleExample.callPrivateFunction());

// === Dynamic Scope vs Lexical Scope ===
function dynamicVsLexicalExample() {
  console.log('\n10. Dynamic vs Lexical scope example:');
  
  const value = 'Lexical scope value';
  
  function showValue() {
    console.log('Value in showValue:', value); // Always uses lexical scope
  }
  
  function callShowValue() {
    const value = 'Different local value';
    showValue(); // Still shows 'Lexical scope value' (lexical scoping)
  }
  
  showValue(); // 'Lexical scope value'
  callShowValue(); // Still 'Lexical scope value' (not 'Different local value')
}

dynamicVsLexicalExample();

// === Complex Scope Chain ===
function complexScopeChain() {
  console.log('\n11. Complex scope chain:');
  
  const level1 = 'Level 1';
  
  function level2Function() {
    const level2 = 'Level 2';
    
    function level3Function() {
      const level3 = 'Level 3';
      
      function level4Function() {
        const level4 = 'Level 4';
        
        // Can access all levels
        return {
          level1,
          level2,
          level3,
          level4,
          global: globalVar
        };
      }
      
      return level4Function;
    }
    
    return level3Function;
  }
  
  const level3 = level2Function();
  const level4 = level3();
  const result = level4();
  
  console.log('Complex scope chain result:', result);
}

complexScopeChain();

// === Scope Chain Performance ===
function scopeChainPerformance() {
  console.log('\n12. Scope chain performance implications:');
  
  const globalValue = 'Global';
  
  function deepNesting() {
    const level1Value = 'Level 1';
    
    return function() {
      const level2Value = 'Level 2';
      
      return function() {
        const level3Value = 'Level 3';
        
        return function() {
          // Deep scope chain lookup
          console.time('Deep scope access');
          for (let i = 0; i < 100000; i++) {
            // Accessing global through deep scope chain
            const temp = globalValue + level1Value + level2Value + level3Value;
          }
          console.timeEnd('Deep scope access');
        };
      };
    };
  }
  
  // Optimized version - cache frequently accessed values
  function optimizedNesting() {
    const level1Value = 'Level 1';
    
    return function() {
      const level2Value = 'Level 2';
      
      return function() {
        const level3Value = 'Level 3';
        
        return function() {
          // Cache values at inner scope
          const cached = globalValue + level1Value + level2Value + level3Value;
          
          console.time('Optimized scope access');
          for (let i = 0; i < 100000; i++) {
            const temp = cached;
          }
          console.timeEnd('Optimized scope access');
        };
      };
    };
  }
  
  const deepFunc = deepNesting()()();
  const optimizedFunc = optimizedNesting()()();
  
  deepFunc();
  optimizedFunc();
}

scopeChainPerformance();

// === Interview Questions ===
function interviewQuestions() {
  console.log('\n13. Common interview questions:');
  
  // Question 1: What will this output?
  console.log('\nQ1: Scope chain resolution');
  var x = 1;
  
  function outer() {
    var x = 2;
    
    function inner() {
      console.log('x in inner:', x); // 2 (not 1)
    }
    
    inner();
  }
  
  outer();
  
  // Question 2: Loop closure problem
  console.log('\nQ2: Loop closure problem');
  var funcs = [];
  
  for (var i = 0; i < 3; i++) {
    funcs[i] = function() {
      return i; // All return 3 due to scope chain
    };
  }
  
  console.log('Loop results:', funcs.map(f => f())); // [3, 3, 3]
  
  // Solution with IIFE
  var fixedFuncs = [];
  
  for (var i = 0; i < 3; i++) {
    fixedFuncs[i] = (function(index) {
      return function() {
        return index;
      };
    })(i);
  }
  
  console.log('Fixed results:', fixedFuncs.map(f => f())); // [0, 1, 2]
}

interviewQuestions();

module.exports = {
  outerFunction,
  blockScopeExample,
  lexicalScopingExample,
  shadowingExample,
  closureAndScopeChain,
  ModuleExample,
  dynamicVsLexicalExample,
  complexScopeChain,
  scopeChainPerformance,
  interviewQuestions
};