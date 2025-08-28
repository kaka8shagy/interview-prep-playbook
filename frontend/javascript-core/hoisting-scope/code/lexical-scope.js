/**
 * File: lexical-scope.js
 * Description: Lexical scoping patterns and scope resolution
 * Demonstrates how JavaScript resolves variables based on where they're written
 */

console.log('=== Basic Lexical Scoping ===');

// Example 1: Basic lexical scope
console.log('1. Basic lexical scope:');

const globalVar = 'I am global';

function outerFunction() {
  const outerVar = 'I am outer';
  
  function innerFunction() {
    const innerVar = 'I am inner';
    
    // Inner function can access all outer scopes
    console.log('From inner - global:', globalVar);
    console.log('From inner - outer:', outerVar);
    console.log('From inner - inner:', innerVar);
  }
  
  innerFunction();
  
  // Outer cannot access inner scope
  console.log('From outer - global:', globalVar);
  console.log('From outer - outer:', outerVar);
  // console.log('From outer - inner:', innerVar); // ReferenceError
}

outerFunction();

console.log('\n=== Scope Chain Resolution ===');

// Example 2: Scope chain lookup
console.log('2. Scope chain lookup:');

let level0 = 'global level';

function level1() {
  let level1Var = 'level 1';
  
  function level2() {
    let level2Var = 'level 2';
    
    function level3() {
      let level3Var = 'level 3';
      
      // JavaScript looks up the scope chain: level3 -> level2 -> level1 -> global
      console.log('Level 3 accessing:');
      console.log('  - level0:', level0);     // Found in global
      console.log('  - level1Var:', level1Var); // Found in level1
      console.log('  - level2Var:', level2Var); // Found in level2  
      console.log('  - level3Var:', level3Var); // Found in current scope
    }
    
    level3();
  }
  
  level2();
}

level1();

console.log('\n=== Variable Shadowing ===');

// Example 3: Variable shadowing in lexical scope
console.log('3. Variable shadowing:');

const shadowedVar = 'global value';

function demonstrateShadowing() {
  const shadowedVar = 'function value'; // Shadows global
  
  console.log('In function:', shadowedVar); // 'function value'
  
  {
    const shadowedVar = 'block value'; // Shadows function
    console.log('In block:', shadowedVar); // 'block value'
    
    {
      const shadowedVar = 'nested block value'; // Shadows block
      console.log('In nested block:', shadowedVar); // 'nested block value'
    }
    
    console.log('Back in block:', shadowedVar); // 'block value'
  }
  
  console.log('Back in function:', shadowedVar); // 'function value'
}

demonstrateShadowing();
console.log('In global:', shadowedVar); // 'global value'

console.log('\n=== Lexical Scope with Closures ===');

// Example 4: Closures capture lexical scope
console.log('4. Closures and lexical scope:');

function createCounterFactory(initialValue) {
  // This variable is captured in the closure
  let count = initialValue;
  
  function createCounter(increment) {
    // This function "closes over" both count and increment
    return function() {
      count += increment;
      return count;
    };
  }
  
  return createCounter;
}

const counterFactory = createCounterFactory(10);
const counter1 = counterFactory(1);
const counter2 = counterFactory(5);

console.log('Counter 1:', counter1()); // 11
console.log('Counter 2:', counter2()); // 16 (shares same count)
console.log('Counter 1 again:', counter1()); // 17

// Example 5: Multiple closure instances
console.log('\n5. Multiple closure instances:');

function createPrivateCounter() {
  let count = 0;
  
  return {
    increment() {
      count++;
      return count;
    },
    
    decrement() {
      count--;
      return count;
    },
    
    getValue() {
      return count;
    }
  };
}

const counter_a = createPrivateCounter();
const counter_b = createPrivateCounter();

console.log('Counter A increment:', counter_a.increment()); // 1
console.log('Counter B increment:', counter_b.increment()); // 1 (separate instance)
console.log('Counter A increment:', counter_a.increment()); // 2
console.log('Counter B value:', counter_b.getValue()); // Still 1

console.log('\n=== Lexical Scope with Different Declaration Types ===');

// Example 6: var vs let/const in lexical scope
console.log('6. Declaration types in lexical scope:');

function lexicalScopeDemo() {
  var varInFunction = 'function scoped var';
  
  if (true) {
    var varInBlock = 'var in block'; // Still function scoped
    let letInBlock = 'let in block'; // Block scoped
    const constInBlock = 'const in block'; // Block scoped
    
    console.log('Inside block:');
    console.log('  - varInFunction:', varInFunction);
    console.log('  - varInBlock:', varInBlock);
    console.log('  - letInBlock:', letInBlock);
    console.log('  - constInBlock:', constInBlock);
  }
  
  console.log('Outside block:');
  console.log('  - varInFunction:', varInFunction);
  console.log('  - varInBlock:', varInBlock); // Accessible
  // console.log('  - letInBlock:', letInBlock); // ReferenceError
  // console.log('  - constInBlock:', constInBlock); // ReferenceError
}

lexicalScopeDemo();

console.log('\n=== Lexical Scope with Arrow Functions ===');

// Example 7: Arrow functions and lexical scope
console.log('7. Arrow functions lexical scope:');

const obj = {
  name: 'Object',
  
  regularMethod() {
    console.log('Regular method this.name:', this.name);
    
    const innerRegular = function() {
      console.log('Inner regular function this.name:', this.name); // undefined
    };
    
    const innerArrow = () => {
      // Arrow functions lexically bind 'this' from enclosing scope
      console.log('Inner arrow function this.name:', this.name);
    };
    
    innerRegular();
    innerArrow();
  },
  
  arrowMethod: () => {
    // Arrow functions don't have their own 'this'
    console.log('Arrow method this.name:', this.name); // undefined
  }
};

obj.regularMethod();
obj.arrowMethod();

console.log('\n=== Lexical Scope with Loops ===');

// Example 8: Loop variable scope issues
console.log('8. Loop variable lexical scope:');

// Classic var problem
console.log('Using var in loop:');
const varFunctions = [];

for (var i = 0; i < 3; i++) {
  varFunctions.push(function() {
    return i; // Captures reference to same 'i'
  });
}

varFunctions.forEach((fn, index) => {
  console.log(`Function ${index} returns:`, fn()); // All return 3
});

// Let creates new binding each iteration
console.log('\nUsing let in loop:');
const letFunctions = [];

for (let j = 0; j < 3; j++) {
  letFunctions.push(function() {
    return j; // Each captures different 'j'
  });
}

letFunctions.forEach((fn, index) => {
  console.log(`Function ${index} returns:`, fn()); // Returns 0, 1, 2
});

console.log('\n=== Advanced Lexical Scope Patterns ===');

// Example 9: Module pattern with lexical scope
console.log('9. Module pattern:');

const mathModule = (function() {
  // Private variables and functions
  let privateValue = 0;
  
  function privateHelper(x) {
    return x * 2;
  }
  
  // Public API
  return {
    add(x) {
      privateValue += x;
      return privateValue;
    },
    
    multiply(x) {
      privateValue = privateHelper(privateValue * x);
      return privateValue;
    },
    
    getValue() {
      return privateValue;
    },
    
    reset() {
      privateValue = 0;
    }
  };
})();

console.log('Math module add(5):', mathModule.add(5));
console.log('Math module multiply(2):', mathModule.multiply(2));
console.log('Math module value:', mathModule.getValue());
mathModule.reset();

// Example 10: Lexical scope with generators
console.log('\n10. Generators and lexical scope:');

function* createGeneratorWithScope(initialValue) {
  let current = initialValue;
  
  while (true) {
    const increment = yield current;
    if (increment !== undefined) {
      current += increment;
    } else {
      current++;
    }
  }
}

const generator1 = createGeneratorWithScope(0);
const generator2 = createGeneratorWithScope(100);

console.log('Generator 1:', generator1.next().value); // 0
console.log('Generator 1 with increment:', generator1.next(5).value); // 5
console.log('Generator 2:', generator2.next().value); // 100
console.log('Generator 1 again:', generator1.next().value); // 6

console.log('\n=== Lexical Scope Edge Cases ===');

// Example 11: Temporal Dead Zone in lexical scope
console.log('11. TDZ in lexical scope:');

function tdzDemo() {
  console.log('Function start');
  
  // This block creates its own lexical scope
  {
    console.log('Block start');
    // console.log(blockScoped); // Would throw ReferenceError (TDZ)
    
    let blockScoped = 'block value';
    console.log('After declaration:', blockScoped);
  }
  
  console.log('Function end');
}

tdzDemo();

// Example 12: Lexical scope with eval (not recommended)
console.log('\n12. Eval and lexical scope:');

function evalScopeDemo() {
  const localVar = 'original value';
  
  console.log('Before eval:', localVar);
  
  // eval can modify lexical scope (in non-strict mode)
  eval('var localVar = "eval modified"');
  
  console.log('After eval:', localVar);
}

evalScopeDemo();

// Example 13: Lexical scope with destructuring
console.log('\n13. Destructuring and lexical scope:');

function destructuringScope() {
  const data = {
    user: { name: 'John', age: 30 },
    config: { theme: 'dark', lang: 'en' }
  };
  
  // Destructuring creates new variables in current scope
  const { user: { name, age }, config: { theme } } = data;
  
  console.log('Destructured variables:', { name, age, theme });
  
  // Nested function can access destructured variables
  function displayInfo() {
    console.log(`User ${name} (${age}) prefers ${theme} theme`);
  }
  
  displayInfo();
}

destructuringScope();

console.log('\n=== Performance Implications of Lexical Scope ===');

// Example 14: Scope chain performance
console.log('14. Scope chain performance:');

const deepNesting = (function() {
  let level1 = 'level 1';
  
  return function() {
    let level2 = 'level 2';
    
    return function() {
      let level3 = 'level 3';
      
      return function() {
        let level4 = 'level 4';
        
        return function() {
          // Deep scope chain lookup
          const start = performance.now();
          for (let i = 0; i < 100000; i++) {
            const result = level1 + level2 + level3 + level4;
          }
          const end = performance.now();
          
          console.log(`Deep scope lookup took ${(end - start).toFixed(2)}ms`);
        };
      };
    };
  };
})();

deepNesting()()()();

// Comparison with local variables
function localVariablePerformance() {
  const start = performance.now();
  
  // Cache values locally
  const local1 = 'level 1';
  const local2 = 'level 2';
  const local3 = 'level 3';
  const local4 = 'level 4';
  
  for (let i = 0; i < 100000; i++) {
    const result = local1 + local2 + local3 + local4;
  }
  
  const end = performance.now();
  console.log(`Local variable access took ${(end - start).toFixed(2)}ms`);
}

localVariablePerformance();

module.exports = {
  outerFunction,
  level1,
  demonstrateShadowing,
  createCounterFactory,
  createPrivateCounter,
  lexicalScopeDemo,
  obj,
  mathModule,
  createGeneratorWithScope,
  tdzDemo,
  evalScopeDemo,
  destructuringScope,
  deepNesting,
  localVariablePerformance
};