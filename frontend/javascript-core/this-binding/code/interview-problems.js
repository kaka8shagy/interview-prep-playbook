/**
 * File: interview-problems.js
 * Description: Common 'this' binding interview questions with detailed solutions and explanations
 * Time Complexity: Varies by problem (noted per function)
 * Space Complexity: Varies by problem (noted per function)
 */

// Problem 1: Implement Function.prototype.bind() from scratch
// Question: Can you implement the bind method without using the native bind?
// This tests understanding of 'this', closures, and function context

function customBind(context, ...boundArgs) {
  // Store reference to the original function
  const originalFunction = this;
  
  // Validate that 'this' is a function
  if (typeof originalFunction !== 'function') {
    throw new TypeError('customBind must be called on a function');
  }
  
  // Return the bound function
  function boundFunction(...args) {
    // Check if called with 'new' operator
    if (new.target) {
      // When used as constructor, ignore the bound context
      // Create new instance and call original function as constructor
      const instance = Object.create(originalFunction.prototype);
      const result = originalFunction.apply(instance, [...boundArgs, ...args]);
      
      // Return the result if it's an object, otherwise return the instance
      return (typeof result === 'object' && result !== null) ? result : instance;
    }
    
    // Normal function call - use bound context
    return originalFunction.apply(context, [...boundArgs, ...args]);
  }
  
  // Maintain prototype chain for constructor functions
  if (originalFunction.prototype) {
    boundFunction.prototype = Object.create(originalFunction.prototype);
  }
  
  return boundFunction;
}

// Add to Function prototype for testing
Function.prototype.customBind = customBind;

function testCustomBind() {
  console.log('1. Custom Bind Implementation:');
  
  // Test 1: Basic binding
  function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
  }
  
  const person = { name: 'Alice' };
  const boundGreet = greet.customBind(person, 'Hello');
  
  console.log('  Basic binding:', boundGreet('!'));  // "Hello, Alice!"
  console.log('  With extra args:', boundGreet('?')); // "Hello, Alice?"
  
  // Test 2: Constructor binding
  function Person(name, age) {
    this.name = name;
    this.age = age;
  }
  
  Person.prototype.introduce = function() {
    return `I'm ${this.name}, ${this.age} years old`;
  };
  
  const BoundPerson = Person.customBind(null, 'DefaultName');
  const instance = new BoundPerson(25);
  
  console.log('  Constructor binding - name:', instance.name);        // 'DefaultName'
  console.log('  Constructor binding - age:', instance.age);          // 25
  console.log('  Constructor binding - method:', instance.introduce()); // "I'm DefaultName, 25 years old"
  console.log('  Prototype chain:', instance instanceof Person);      // true
  
  // Test 3: Hard binding (cannot be overridden)
  const obj1 = { x: 1 };
  const obj2 = { x: 2 };
  
  function getX() { return this.x; }
  
  const boundGetX = getX.customBind(obj1);
  console.log('  Hard binding test:', boundGetX.call(obj2)); // 1 (not 2)
  
  return { boundGreet, BoundPerson, boundGetX };
}

// Problem 2: Implement Function.prototype.call() from scratch
// Question: Can you implement call() method?

function customCall(context, ...args) {
  // Handle null/undefined context
  const ctx = context == null ? globalThis : Object(context);
  
  // Create unique property name to avoid collisions
  const fnKey = Symbol('customCall');
  
  // Assign function to context as a method
  ctx[fnKey] = this;
  
  try {
    // Call the function as a method of the context
    const result = ctx[fnKey](...args);
    return result;
  } finally {
    // Clean up: remove the temporary method
    delete ctx[fnKey];
  }
}

Function.prototype.customCall = customCall;

function testCustomCall() {
  console.log('\n2. Custom Call Implementation:');
  
  function introduce(greeting, punctuation) {
    return `${greeting}, I'm ${this.name}${punctuation}`;
  }
  
  const person1 = { name: 'Bob' };
  const person2 = { name: 'Carol' };
  
  // Test basic call
  console.log('  Custom call 1:', introduce.customCall(person1, 'Hi', '!'));
  console.log('  Custom call 2:', introduce.customCall(person2, 'Hello', '.'));
  
  // Compare with native call
  console.log('  Native call 1:', introduce.call(person1, 'Hi', '!'));
  console.log('  Native call 2:', introduce.call(person2, 'Hello', '.'));
  
  // Test with primitive context
  function showType() {
    return `${typeof this}: ${this}`;
  }
  
  console.log('  Primitive context (number):', showType.customCall(42));
  console.log('  Primitive context (string):', showType.customCall('hello'));
  console.log('  Null context:', showType.customCall(null));
}

// Problem 3: Implement Function.prototype.apply() from scratch
// Question: Can you implement apply() method?

function customApply(context, argsArray) {
  // Handle null/undefined context
  const ctx = context == null ? globalThis : Object(context);
  
  // Handle null/undefined args
  const args = argsArray == null ? [] : [...argsArray];
  
  // Use customCall implementation
  return this.customCall(ctx, ...args);
}

Function.prototype.customApply = customApply;

function testCustomApply() {
  console.log('\n3. Custom Apply Implementation:');
  
  function sum(a, b, c) {
    console.log(`  Context name: ${this.name}`);
    return a + b + c;
  }
  
  const calculator = { name: 'Calculator' };
  
  // Test with array of arguments
  const result1 = sum.customApply(calculator, [1, 2, 3]);
  console.log('  Custom apply result:', result1); // 6
  
  // Test with null arguments
  const result2 = sum.customApply(calculator, null);
  console.log('  Apply with null args:', result2); // NaN (undefined + undefined + undefined)
  
  // Compare with native apply
  const result3 = sum.apply(calculator, [4, 5, 6]);
  console.log('  Native apply result:', result3); // 15
}

// Problem 4: What will this code output? (Context Loss Scenarios)
// Question: Predict the output and explain why

function predictOutput() {
  console.log('\n4. Context Loss Prediction Problems:');
  
  // Scenario 1: Method extraction
  const user = {
    name: 'Alice',
    getName: function() {
      return this.name;
    }
  };
  
  console.log('  Direct call:', user.getName()); // 'Alice'
  
  const getName = user.getName;
  try {
    console.log('  Extracted method:', getName()); // undefined or error
  } catch (error) {
    console.log('  Extracted method error:', error.message);
  }
  
  // Scenario 2: Callback context loss
  function processUser(callback) {
    console.log('  Processing user...');
    return callback();
  }
  
  try {
    const result = processUser(user.getName);
    console.log('  Callback result:', result);
  } catch (error) {
    console.log('  Callback error:', error.message);
  }
  
  // Scenario 3: setTimeout context loss
  const timer = {
    seconds: 0,
    start: function() {
      console.log('  Timer starting...');
      setTimeout(function() {
        this.seconds++; // 'this' is window/global, not timer
        console.log('  Timer seconds:', this.seconds);
      }, 100);
    },
    
    startFixed: function() {
      console.log('  Fixed timer starting...');
      setTimeout(() => {
        this.seconds++; // Arrow function preserves 'this'
        console.log('  Fixed timer seconds:', this.seconds);
      }, 200);
    }
  };
  
  timer.start();      // Shows NaN or undefined
  timer.startFixed(); // Shows 1
  
  // Scenario 4: Array method callbacks
  const numbers = [1, 2, 3];
  const multiplier = {
    factor: 10,
    
    multiplyArray: function(arr) {
      return arr.map(function(num) {
        return num * this.factor; // 'this' is undefined in strict mode
      });
    },
    
    multiplyArrayFixed: function(arr) {
      return arr.map(num => num * this.factor); // Arrow function preserves 'this'
    }
  };
  
  try {
    console.log('  Array map (broken):', multiplier.multiplyArray(numbers));
  } catch (error) {
    console.log('  Array map error:', error.message);
  }
  
  console.log('  Array map (fixed):', multiplier.multiplyArrayFixed(numbers));
}

// Problem 5: Complex 'this' binding chain
// Question: Trace through complex binding scenarios

function complexBindingScenarios() {
  console.log('\n5. Complex Binding Scenarios:');
  
  // Scenario 1: Multiple bindings
  function getValue() {
    return this.value;
  }
  
  const obj1 = { value: 1 };
  const obj2 = { value: 2 };
  const obj3 = { value: 3 };
  
  // First binding
  const bound1 = getValue.bind(obj1);
  console.log('  First binding:', bound1()); // 1
  
  // Second binding (doesn't override first)
  const bound2 = bound1.bind(obj2);
  console.log('  Second binding:', bound2()); // Still 1
  
  // Try explicit call (still can't override)
  console.log('  Explicit call on bound:', bound1.call(obj3)); // Still 1
  
  // Scenario 2: Constructor vs binding
  function Person(name) {
    this.name = name;
    console.log(`  Constructor called with 'this':`, this.constructor.name);
  }
  
  const obj = { name: 'Wrong' };
  const BoundPerson = Person.bind(obj);
  
  // Normal call - uses bound context
  BoundPerson('Normal'); // 'this' is obj
  
  // Constructor call - creates new instance, ignores binding
  const instance = new BoundPerson('Constructor');
  console.log('  Instance name:', instance.name); // 'Constructor'
  console.log('  Is instance of Person:', instance instanceof Person); // true
  
  // Scenario 3: Arrow functions in objects
  const arrowTest = {
    name: 'ArrowTest',
    
    regularMethod: function() {
      console.log(`  Regular method 'this':`, this.name);
      
      // Nested regular function loses 'this'
      function nested() {
        console.log(`  Nested regular function 'this':`, this?.name || 'lost');
      }
      
      // Arrow function preserves 'this'
      const arrowNested = () => {
        console.log(`  Nested arrow function 'this':`, this.name);
      };
      
      nested();
      arrowNested();
    },
    
    // Arrow function as method - doesn't get object as 'this'
    arrowMethod: () => {
      console.log(`  Arrow method 'this':`, this?.name || 'not object');
    }
  };
  
  arrowTest.regularMethod();
  arrowTest.arrowMethod();
}

// Problem 6: Create a function that can bind multiple contexts
// Question: Create a function that can switch between different contexts

function createContextSwitcher(contexts) {
  let currentContext = contexts[0] || {};
  
  const switcher = {
    switchTo: function(contextName) {
      const context = contexts.find(ctx => ctx.name === contextName);
      if (context) {
        currentContext = context;
        console.log(`  Switched to context: ${contextName}`);
      } else {
        console.log(`  Context '${contextName}' not found`);
      }
    },
    
    execute: function(fn, ...args) {
      return fn.apply(currentContext, args);
    },
    
    getCurrentContext: function() {
      return currentContext.name;
    }
  };
  
  return switcher;
}

function testContextSwitcher() {
  console.log('\n6. Context Switcher Implementation:');
  
  const contexts = [
    { name: 'user', type: 'user', permissions: ['read'] },
    { name: 'admin', type: 'admin', permissions: ['read', 'write', 'delete'] },
    { name: 'guest', type: 'guest', permissions: [] }
  ];
  
  const switcher = createContextSwitcher(contexts);
  
  function checkPermissions(action) {
    const hasPermission = this.permissions.includes(action);
    console.log(`  ${this.name} can ${action}: ${hasPermission}`);
    return hasPermission;
  }
  
  console.log('  Initial context:', switcher.getCurrentContext());
  switcher.execute(checkPermissions, 'read');
  
  switcher.switchTo('admin');
  switcher.execute(checkPermissions, 'delete');
  
  switcher.switchTo('guest');
  switcher.execute(checkPermissions, 'read');
}

// Problem 7: Polyfill for arrow functions behavior
// Question: How would you polyfill arrow function 'this' behavior?

function createArrowFunctionPolyfill(regularFunction, lexicalThis) {
  // Return function that always uses the provided lexical 'this'
  return function(...args) {
    return regularFunction.apply(lexicalThis, args);
  };
}

function testArrowFunctionPolyfill() {
  console.log('\n7. Arrow Function Polyfill:');
  
  const obj = {
    name: 'TestObject',
    value: 42,
    
    createArrowLike: function() {
      // Regular function that we want to behave like arrow function
      function regularFunction() {
        return `${this.name} has value ${this.value}`;
      }
      
      // Create arrow-like function with polyfill
      const arrowLike = createArrowFunctionPolyfill(regularFunction, this);
      
      return arrowLike;
    }
  };
  
  const arrowLike = obj.createArrowLike();
  
  // Test that it preserves lexical 'this'
  console.log('  Arrow-like function:', arrowLike()); // Uses obj as 'this'
  
  // Test that binding doesn't affect it
  const otherObj = { name: 'Other', value: 99 };
  console.log('  Arrow-like with call:', arrowLike.call(otherObj)); // Still uses obj
  
  // Compare with real arrow function
  const realArrow = obj.createArrowLike = function() {
    const arrow = () => `${this.name} has value ${this.value}`;
    return arrow;
  };
  
  const realArrowFunc = obj.createArrowLike();
  console.log('  Real arrow function:', realArrowFunc());
  console.log('  Real arrow with call:', realArrowFunc.call(otherObj)); // Still uses obj
}

// Problem 8: Create a memoization decorator that preserves 'this'
// Question: How do you memoize instance methods while preserving context?

function memoizeMethod(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args) {
    // Create cache per instance
    if (!this._memoCache) {
      this._memoCache = new Map();
    }
    
    // Create unique key for this method and arguments
    const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
    
    if (this._memoCache.has(cacheKey)) {
      console.log(`  Cache hit for ${propertyKey} on ${this.constructor.name}`);
      return this._memoCache.get(cacheKey);
    }
    
    console.log(`  Computing ${propertyKey} on ${this.constructor.name}`);
    const result = originalMethod.apply(this, args);
    this._memoCache.set(cacheKey, result);
    
    return result;
  };
  
  return descriptor;
}

// Test class with memoized methods
class MemoizedCalculator {
  constructor(name) {
    this.name = name;
  }
  
  // Apply memoization decorator manually (since decorators aren't widely supported yet)
  expensiveOperation(n) {
    // Simulate expensive calculation
    let sum = 0;
    for (let i = 0; i < n * 1000; i++) {
      sum += Math.sqrt(i);
    }
    return sum;
  }
}

// Apply memoization manually
const originalExpensive = MemoizedCalculator.prototype.expensiveOperation;
MemoizedCalculator.prototype.expensiveOperation = function(...args) {
  return memoizeMethod(MemoizedCalculator.prototype, 'expensiveOperation', {
    value: originalExpensive
  }).value.apply(this, args);
};

function testMemoizedMethods() {
  console.log('\n8. Memoized Methods with Context:');
  
  const calc1 = new MemoizedCalculator('Calculator1');
  const calc2 = new MemoizedCalculator('Calculator2');
  
  // First calls - compute
  calc1.expensiveOperation(100);
  calc2.expensiveOperation(100);
  
  // Second calls - cache hit (per instance)
  calc1.expensiveOperation(100);
  calc2.expensiveOperation(100);
  
  // Different args - compute again
  calc1.expensiveOperation(200);
}

// Comprehensive demo function
function runInterviewProblemsDemo() {
  console.log('=== This Binding Interview Problems Demo ===\n');
  
  testCustomBind();
  testCustomCall();
  testCustomApply();
  predictOutput();
  
  setTimeout(() => {
    complexBindingScenarios();
    testContextSwitcher();
    testArrowFunctionPolyfill();
    testMemoizedMethods();
    
    console.log('\n=== Interview Problems Demo Complete ===');
  }, 1000);
}

// Export for testing and other modules
module.exports = {
  customBind,
  customCall,
  customApply,
  createContextSwitcher,
  createArrowFunctionPolyfill,
  memoizeMethod,
  MemoizedCalculator,
  testCustomBind,
  testCustomCall,
  testCustomApply,
  predictOutput,
  complexBindingScenarios,
  testContextSwitcher,
  testArrowFunctionPolyfill,
  testMemoizedMethods,
  runInterviewProblemsDemo
};