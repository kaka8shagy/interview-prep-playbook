/**
 * File: interview-implement-bind.js
 * Description: Implement Function.prototype.bind() from scratch
 * Common interview question testing understanding of this and closures
 */

// Basic bind implementation
Function.prototype.myBind = function(context, ...boundArgs) {
  // Store reference to original function
  const fn = this;
  
  // Return new function
  return function(...args) {
    // Combine bound args with call-time args
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

// Advanced bind with new operator support
Function.prototype.myBindAdvanced = function(context, ...boundArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }
  
  const fn = this;
  const bound = function(...args) {
    // Check if called with new
    if (new.target) {
      // If called with new, ignore provided context
      return fn.apply(this, [...boundArgs, ...args]);
    }
    // Normal function call
    return fn.apply(context, [...boundArgs, ...args]);
  };
  
  // Preserve prototype chain for constructor functions
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }
  
  return bound;
};

// Full polyfill matching native bind
Function.prototype.myBindPolyfill = function(context) {
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }
  
  const slice = Array.prototype.slice;
  const args = slice.call(arguments, 1);
  const fn = this;
  const noop = function() {};
  
  const bound = function() {
    const combinedArgs = args.concat(slice.call(arguments));
    
    // Check if called as constructor
    if (this instanceof bound) {
      const result = fn.apply(this, combinedArgs);
      return Object(result) === result ? result : this;
    }
    
    return fn.apply(context, combinedArgs);
  };
  
  // Maintain prototype chain
  if (fn.prototype) {
    noop.prototype = fn.prototype;
    bound.prototype = new noop();
    noop.prototype = null;
  }
  
  return bound;
};

// Test implementations
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };

// Test basic bind
console.log('=== Testing Basic Bind ===');
const boundGreet1 = greet.myBind(person, 'Hello');
console.log(boundGreet1('!')); // "Hello, Alice!"
console.log(boundGreet1('?')); // "Hello, Alice?"

// Test advanced bind with partial application
console.log('\n=== Testing Partial Application ===');
function calculate(a, b, c, d) {
  return this.multiplier * (a + b + c + d);
}

const calculator = { multiplier: 2 };
const boundCalc = calculate.myBindAdvanced(calculator, 1, 2);
console.log(boundCalc(3, 4)); // 2 * (1 + 2 + 3 + 4) = 20

// Test with constructor
console.log('\n=== Testing with Constructor ===');
function User(name, age) {
  this.name = name;
  this.age = age;
}

User.prototype.greet = function() {
  return `I'm ${this.name}, ${this.age} years old`;
};

const BoundUser = User.myBindAdvanced(null, 'Bob');
const user = new BoundUser(25);
console.log(user.name); // "Bob"
console.log(user.age); // 25
console.log(user.greet()); // "I'm Bob, 25 years old"
console.log(user instanceof User); // true

// Test edge cases
console.log('\n=== Testing Edge Cases ===');

// 1. Multiple binding
const obj1 = { x: 1 };
const obj2 = { x: 2 };

function getX() {
  return this.x;
}

const bound1 = getX.myBind(obj1);
const bound2 = bound1.myBind(obj2); // Binding already bound function
console.log('Double binding:', bound2()); // 1 (first binding wins)

// 2. Binding primitive values
function showType() {
  return typeof this + ': ' + this;
}

const boundToNumber = showType.myBind(42);
const boundToString = showType.myBind('hello');
const boundToNull = showType.myBind(null);

console.log('Bound to number:', boundToNumber());
console.log('Bound to string:', boundToString());
console.log('Bound to null:', boundToNull());

// 3. Arrow functions (cannot be bound)
const arrowFunc = () => this;
const boundArrow = arrowFunc.myBind({ test: true });
console.log('Arrow function binding:', boundArrow()); // Still original this

// Comparison with native bind
console.log('\n=== Comparing with Native Bind ===');
const nativeBound = greet.bind(person, 'Hi');
const customBound = greet.myBindAdvanced(person, 'Hi');

console.log('Native:', nativeBound('!!'));
console.log('Custom:', customBound('!!'));

// Performance test implementation
function performanceTest() {
  const iterations = 100000;
  const testObj = { value: 42 };
  
  function testFunc(a, b) {
    return this.value + a + b;
  }
  
  console.time('Native bind');
  for (let i = 0; i < iterations; i++) {
    const bound = testFunc.bind(testObj, 1);
    bound(2);
  }
  console.timeEnd('Native bind');
  
  console.time('Custom bind');
  for (let i = 0; i < iterations; i++) {
    const bound = testFunc.myBind(testObj, 1);
    bound(2);
  }
  console.timeEnd('Custom bind');
}

console.log('\n=== Performance Comparison ===');
performanceTest();

module.exports = {
  myBind: Function.prototype.myBind,
  myBindAdvanced: Function.prototype.myBindAdvanced,
  myBindPolyfill: Function.prototype.myBindPolyfill
};