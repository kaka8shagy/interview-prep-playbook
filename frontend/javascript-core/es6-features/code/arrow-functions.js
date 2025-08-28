/**
 * File: arrow-functions.js
 * Description: Arrow function syntax, usage, and behavior
 */

// === Basic Syntax ===
console.log('=== Arrow Function Syntax ===\n');

// Traditional function
function traditional(a, b) {
  return a + b;
}

// Arrow function
const arrow = (a, b) => a + b;

// Single parameter (parentheses optional)
const single = x => x * 2;

// No parameters
const noParams = () => 'Hello World';

// Multiple statements (need braces and return)
const multiStatement = (a, b) => {
  const sum = a + b;
  return sum * 2;
};

console.log('Traditional:', traditional(2, 3)); // 5
console.log('Arrow:', arrow(2, 3)); // 5
console.log('Single param:', single(5)); // 10
console.log('No params:', noParams()); // Hello World
console.log('Multi-statement:', multiStatement(2, 3)); // 10

// === Lexical This Binding ===
console.log('\n=== Lexical This Binding ===\n');

const obj = {
  name: 'MyObject',
  
  // Regular method
  regularMethod: function() {
    console.log('Regular method this:', this.name);
    
    // Nested function loses this
    function nested() {
      console.log('Nested regular this:', this?.name || 'undefined');
    }
    nested();
  },
  
  // Arrow method (bad practice for object methods)
  arrowMethod: () => {
    console.log('Arrow method this:', this?.name || 'global/undefined');
  },
  
  // Regular method with arrow function inside
  mixedMethod: function() {
    console.log('Mixed method this:', this.name);
    
    // Arrow function preserves this
    const nested = () => {
      console.log('Nested arrow this:', this.name);
    };
    nested();
  },
  
  // Method with callbacks
  withCallback: function() {
    const self = this;
    
    // Problem with regular function
    setTimeout(function() {
      console.log('Regular callback this:', this?.name || 'undefined');
      console.log('Using self:', self.name);
    }, 0);
    
    // Solution with arrow function
    setTimeout(() => {
      console.log('Arrow callback this:', this.name);
    }, 0);
  }
};

obj.regularMethod();
obj.arrowMethod();
obj.mixedMethod();
obj.withCallback();

// === Returning Objects ===
console.log('\n=== Returning Objects ===\n');

// Need parentheses to return object literal
const getObject = () => ({ name: 'John', age: 30 });
// Without parentheses, {} is treated as function body
const wrongObject = () => { name: 'John', age: 30 }; // Returns undefined

console.log('Correct object return:', getObject());
console.log('Wrong object return:', wrongObject()); // undefined

// === No Arguments Object ===
console.log('\n=== Arguments Object ===\n');

function regularFunc() {
  console.log('Regular function arguments:', arguments);
}

const arrowFunc = () => {
  try {
    console.log('Arrow function arguments:', arguments);
  } catch (e) {
    console.log('Arrow function error:', e.message);
  }
};

// Use rest parameters instead
const arrowWithRest = (...args) => {
  console.log('Arrow with rest params:', args);
};

regularFunc(1, 2, 3);
arrowFunc(1, 2, 3);
arrowWithRest(1, 2, 3);

// === Cannot be Constructor ===
console.log('\n=== Constructor Usage ===\n');

function RegularConstructor(name) {
  this.name = name;
}

const ArrowConstructor = (name) => {
  this.name = name;
};

try {
  const regular = new RegularConstructor('Regular');
  console.log('Regular constructor:', regular.name);
  
  const arrow = new ArrowConstructor('Arrow');
} catch (e) {
  console.log('Arrow constructor error:', e.message);
}

// === Array Methods ===
console.log('\n=== Array Methods with Arrow Functions ===\n');

const numbers = [1, 2, 3, 4, 5];

// Map
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);

// Filter
const evens = numbers.filter(n => n % 2 === 0);
console.log('Evens:', evens);

// Reduce
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('Sum:', sum);

// Chaining
const result = numbers
  .filter(n => n > 2)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0);
console.log('Chained result:', result);

// === Event Handlers ===
console.log('\n=== Event Handlers (Simulated) ===\n');

class Button {
  constructor(label) {
    this.label = label;
    this.clicks = 0;
  }
  
  // Regular function as handler loses this
  handleClickRegular() {
    this.clicks++; // Error: this is undefined/window
    console.log(`${this.label} clicked ${this.clicks} times`);
  }
  
  // Arrow function as property preserves this
  handleClickArrow = () => {
    this.clicks++;
    console.log(`${this.label} clicked ${this.clicks} times`);
  }
  
  simulateClick() {
    // Simulate event handler call
    const handler1 = this.handleClickRegular;
    const handler2 = this.handleClickArrow;
    
    try {
      handler1(); // Loses this
    } catch (e) {
      console.log('Regular handler error:', e.message);
    }
    
    handler2(); // Preserves this
  }
}

const button = new Button('Submit');
button.simulateClick();

// === Performance Considerations ===
console.log('\n=== Performance Notes ===\n');

// Arrow functions are NOT always faster
// They have different use cases:

// Good for:
const goodUses = [
  'Callbacks and event handlers',
  'Array methods (map, filter, reduce)',
  'Promise chains',
  'Short, simple functions'
];

// Avoid for:
const avoidFor = [
  'Object methods that need dynamic this',
  'Constructors',
  'Functions needing arguments object',
  'Generator functions'
];

console.log('Good uses for arrow functions:');
goodUses.forEach(use => console.log(`  - ${use}`));

console.log('\nAvoid arrow functions for:');
avoidFor.forEach(use => console.log(`  - ${use}`));

module.exports = {
  arrow,
  obj,
  Button,
  getObject
};