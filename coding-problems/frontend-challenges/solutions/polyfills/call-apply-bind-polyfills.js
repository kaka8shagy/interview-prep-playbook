/**
 * File: call-apply-bind-polyfills.js
 * Description: Implementation of call, apply, and bind method polyfills
 * 
 * Learning objectives:
 * - Understand how JavaScript function context ('this') binding works
 * - Learn the differences between call, apply, and bind
 * - See how to implement these methods from scratch
 * - Understand when and why to use each method
 * 
 * Time Complexity: O(1) for call/apply, O(1) for bind creation
 * Space Complexity: O(1) additional space
 */

// =======================
// Function.prototype.call() Polyfill
// =======================

/**
 * Call polyfill - invokes function immediately with specified 'this' context
 * 
 * Mental model: Think of call as "borrowing" a method from one object
 * and using it on another object with different context
 * 
 * Syntax: func.call(thisArg, arg1, arg2, ...)
 */
Function.prototype.myCall = function(context, ...args) {
  // Handle edge case: if context is null or undefined, use global object
  // In browser: window, in Node.js: global, in strict mode: undefined
  if (context === null || context === undefined) {
    // In browser environment, 'this' in global scope refers to window
    // In Node.js, it refers to global object
    context = typeof window !== 'undefined' ? window : global;
  }
  
  // Convert primitive values to objects (primitive context handling)
  // This matches native behavior where primitives get wrapped in objects
  if (typeof context !== 'object' && typeof context !== 'function') {
    context = Object(context);
  }
  
  // Create a unique property name to avoid conflicts
  // Use Symbol if available for true uniqueness, otherwise use timestamp
  const fnSymbol = typeof Symbol !== 'undefined' 
    ? Symbol('fn') 
    : `__fn_${Date.now()}_${Math.random()}`;
  
  // Temporarily assign the function to the context object
  // This is the key trick - by making the function a method of the context,
  // when we call it, 'this' will naturally refer to the context
  context[fnSymbol] = this;
  
  // Invoke the function as a method of the context object
  // The spread operator passes individual arguments
  const result = context[fnSymbol](...args);
  
  // Clean up - remove the temporary property to avoid pollution
  // This ensures we don't modify the original object permanently
  delete context[fnSymbol];
  
  // Return the result of the function execution
  return result;
};

// =======================
// Function.prototype.apply() Polyfill
// =======================

/**
 * Apply polyfill - similar to call but takes arguments as an array
 * 
 * Mental model: Apply is like call but with arguments "applied" as an array
 * Useful when you have arguments in array format or unknown number of args
 * 
 * Syntax: func.apply(thisArg, [arg1, arg2, ...])
 */
Function.prototype.myApply = function(context, argsArray) {
  // Handle context similar to call
  if (context === null || context === undefined) {
    context = typeof window !== 'undefined' ? window : global;
  }
  
  // Convert primitive contexts to objects
  if (typeof context !== 'object' && typeof context !== 'function') {
    context = Object(context);
  }
  
  // Handle arguments array - if not provided or null, use empty array
  // Native apply accepts null/undefined as "no arguments"
  if (argsArray === null || argsArray === undefined) {
    argsArray = [];
  }
  
  // Ensure argsArray is array-like (has length property)
  // This handles cases where someone passes array-like objects
  if (typeof argsArray !== 'object' || typeof argsArray.length !== 'number') {
    throw new TypeError('CreateListFromArrayLike called on non-object');
  }
  
  // Create unique property name
  const fnSymbol = typeof Symbol !== 'undefined' 
    ? Symbol('fn') 
    : `__fn_${Date.now()}_${Math.random()}`;
  
  // Assign function to context temporarily
  context[fnSymbol] = this;
  
  // Convert array-like object to actual array and spread
  // This handles both real arrays and array-like objects (like arguments)
  const result = context[fnSymbol](...Array.from(argsArray));
  
  // Clean up temporary property
  delete context[fnSymbol];
  
  return result;
};

// =======================
// Function.prototype.bind() Polyfill
// =======================

/**
 * Bind polyfill - creates a new function with fixed 'this' context
 * 
 * Mental model: Bind is like creating a "preset" version of a function
 * with fixed context and potentially some fixed arguments (partial application)
 * 
 * Syntax: func.bind(thisArg, arg1, arg2, ...)
 * Returns: New function with bound context and arguments
 */
Function.prototype.myBind = function(context, ...boundArgs) {
  // Store reference to the original function
  // We need this because the returned function will be called later
  const originalFunc = this;
  
  // Validate that we're binding a function
  // This matches native bind behavior which throws TypeError for non-functions
  if (typeof originalFunc !== 'function') {
    throw new TypeError('Function.prototype.bind called on non-function');
  }
  
  // Return a new function that will call the original with bound context
  // This new function can be called later with additional arguments
  function boundFunction(...callArgs) {
    // Check if the bound function is being used as a constructor (with 'new')
    // When called with 'new', we should ignore the bound context and use the new instance
    if (new.target) {
      // Constructor call: ignore bound context, use new instance as context
      // Combine bound arguments with call-time arguments
      return originalFunc.apply(this, [...boundArgs, ...callArgs]);
    } else {
      // Normal call: use bound context and combine arguments
      // This is the typical use case for bind
      return originalFunc.apply(context, [...boundArgs, ...callArgs]);
    }
  }
  
  // Preserve the original function's prototype for constructor scenarios
  // When the bound function is used as a constructor, instances should inherit
  // from the original function's prototype
  if (originalFunc.prototype) {
    // Create a function that acts as the prototype chain connector
    // This ensures proper inheritance without directly linking prototypes
    function FakeConstructor() {}
    FakeConstructor.prototype = originalFunc.prototype;
    boundFunction.prototype = new FakeConstructor();
  }
  
  // Set the length property to match remaining parameters
  // If original function expects 5 params and we bind 2, length should be 3
  const remainingParamsLength = Math.max(0, originalFunc.length - boundArgs.length);
  Object.defineProperty(boundFunction, 'length', {
    value: remainingParamsLength,
    writable: false,
    enumerable: false,
    configurable: true
  });
  
  // Set a descriptive name for debugging
  Object.defineProperty(boundFunction, 'name', {
    value: `bound ${originalFunc.name}`,
    writable: false,
    enumerable: false,
    configurable: true
  });
  
  return boundFunction;
};

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== Call, Apply, Bind Polyfill Examples ===\n');

// Example 1: Basic context binding
const person1 = {
  name: 'Alice',
  age: 25,
  greet() {
    return `Hello, I'm ${this.name}, ${this.age} years old`;
  }
};

const person2 = {
  name: 'Bob',
  age: 30
};

console.log('Example 1: Basic Context Binding');
console.log('Direct call:', person1.greet());
console.log('Using myCall:', person1.greet.myCall(person2));
console.log('Using myApply:', person1.greet.myApply(person2));

const boundGreet = person1.greet.myBind(person2);
console.log('Using myBind:', boundGreet());
console.log();

// Example 2: Functions with arguments
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

console.log('Example 2: Functions with Arguments');
console.log('Using myCall:', introduce.myCall(person1, 'Hi', '!'));
console.log('Using myApply:', introduce.myApply(person1, ['Hello', '.']));

const boundIntroduce = introduce.myBind(person2, 'Hey');
console.log('Using myBind with partial args:', boundIntroduce('!!!'));
console.log();

// Example 3: Array method borrowing (common interview pattern)
const arrayLike = {
  0: 'apple',
  1: 'banana', 
  2: 'cherry',
  length: 3
};

console.log('Example 3: Array Method Borrowing');
console.log('Array-like object:', arrayLike);

// Borrow Array.prototype.slice to convert array-like to array
const convertToArray = Array.prototype.slice.myCall(arrayLike);
console.log('Converted to array using myCall:', convertToArray);

// Borrow Array.prototype.push to add elements
Array.prototype.push.myCall(arrayLike, 'date', 'elderberry');
console.log('After borrowing push:', arrayLike);
console.log();

// Example 4: Constructor function binding
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function() {
    return `Hi, I'm ${this.name}`;
  };
}

console.log('Example 4: Constructor Function Binding');

// Bind constructor to create specialized constructors
const AdultPerson = Person.myBind(null, 'Unknown Adult');
const adult1 = new AdultPerson(25);
console.log('Bound constructor result:', adult1.name, adult1.age);
console.log();

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Event Handler Context Preservation
 * Common problem: losing 'this' context in event handlers
 */
class ButtonController {
  constructor(element) {
    this.element = element;
    this.clickCount = 0;
    
    // Problem: this.handleClick would lose 'this' context
    // Solution: bind the method to preserve context
    this.boundHandleClick = this.handleClick.myBind(this);
  }
  
  handleClick(event) {
    this.clickCount++;
    console.log(`Button clicked ${this.clickCount} times`);
    return this.clickCount;
  }
  
  attachListener() {
    // In real DOM: this.element.addEventListener('click', this.boundHandleClick);
    console.log('Event listener attached with bound context');
  }
}

/**
 * Use Case 2: Method Chaining with Dynamic Context
 * Useful for creating fluent APIs that work with different objects
 */
const mathOperations = {
  add(value) {
    this.result = (this.result || 0) + value;
    return this;
  },
  
  multiply(value) {
    this.result = (this.result || 0) * value;
    return this;
  },
  
  getValue() {
    return this.result;
  }
};

function createCalculator(initialValue) {
  const calculator = { result: initialValue };
  
  // Bind all math operations to this calculator instance
  calculator.add = mathOperations.add.myBind(calculator);
  calculator.multiply = mathOperations.multiply.myBind(calculator);
  calculator.getValue = mathOperations.getValue.myBind(calculator);
  
  return calculator;
}

console.log('Real-world Use Case: Fluent Calculator API');
const calc1 = createCalculator(5);
const result1 = calc1.add(3).multiply(2).getValue();
console.log('Calculator 1 result:', result1); // (5 + 3) * 2 = 16

const calc2 = createCalculator(10);
const result2 = calc2.multiply(3).add(5).getValue();
console.log('Calculator 2 result:', result2); // (10 * 3) + 5 = 35
console.log();

/**
 * Use Case 3: Partial Application for Configuration
 * Creating specialized functions with pre-configured arguments
 */
function makeHttpRequest(method, url, headers, data) {
  // Simulate HTTP request
  return {
    method,
    url,
    headers: headers || {},
    data: data || null,
    timestamp: new Date().toISOString()
  };
}

// Create specialized request functions using bind
const postRequest = makeHttpRequest.myBind(null, 'POST');
const getRequest = makeHttpRequest.myBind(null, 'GET');

// Create API-specific request functions
const apiPost = postRequest.myBind(null, '/api/users', {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token123'
});

console.log('Partial Application Example:');
console.log('GET request:', getRequest('/api/posts'));
console.log('Specialized POST:', apiPost({ name: 'John', email: 'john@example.com' }));
console.log();

// =======================
// Edge Cases and Error Handling
// =======================

console.log('=== Edge Cases Testing ===');

// Edge Case 1: Null/undefined context
function testContext() {
  return this;
}

console.log('Context handling:');
console.log('null context (myCall):', typeof testContext.myCall(null));
console.log('undefined context (myCall):', typeof testContext.myCall(undefined));

// Edge Case 2: Primitive context wrapping
function showThis() {
  return typeof this;
}

console.log('Primitive context wrapping:');
console.log('String context:', showThis.myCall('hello'));
console.log('Number context:', showThis.myCall(42));
console.log('Boolean context:', showThis.myCall(true));

// Edge Case 3: Invalid apply arguments
try {
  const testFn = function() { return 'test'; };
  testFn.myApply({}, 'invalid'); // Should throw error
} catch (error) {
  console.log('Apply error handling:', error.message);
}

// Export all implementations
module.exports = {
  // Note: These are attached to Function.prototype, so no need to export
  // But we can export test functions for verification
  testCall: Function.prototype.myCall,
  testApply: Function.prototype.myApply, 
  testBind: Function.prototype.myBind,
  
  // Export utility functions for testing
  ButtonController,
  createCalculator,
  makeHttpRequest
};

/**
 * Key Interview Points:
 * 
 * 1. Context Binding Concepts:
 *    - call/apply invoke immediately with specified context
 *    - bind returns new function with bound context
 *    - apply takes array of arguments, call takes individual arguments
 * 
 * 2. Implementation Challenges:
 *    - Preserving original function's 'this' context
 *    - Handling null/undefined context (global object fallback)
 *    - Primitive context wrapping (Object() conversion)
 *    - Avoiding property name conflicts (Symbol/unique naming)
 * 
 * 3. Bind Specific Complexities:
 *    - Constructor call detection (new.target)
 *    - Prototype chain preservation
 *    - Partial application support
 *    - Property descriptor configuration (length, name)
 * 
 * 4. Common Use Cases:
 *    - Event handler context preservation
 *    - Array method borrowing (array-like objects)
 *    - Function composition and partial application
 *    - Method chaining with dynamic context
 * 
 * 5. Performance Considerations:
 *    - Temporary property assignment vs other approaches
 *    - Memory implications of bound functions
 *    - Prototype chain performance in constructor scenarios
 */