/**
 * File: default-binding.js
 * Description: Default binding behavior in different contexts
 */

// Non-strict mode
function showThis() {
  console.log('Non-strict this:', this);
  console.log('Is window/global?', this === globalThis);
}

// Strict mode
function showThisStrict() {
  'use strict';
  console.log('Strict this:', this);
  console.log('Is undefined?', this === undefined);
}

// Nested function loses object context
const obj = {
  name: 'MyObject',
  showThis: function() {
    console.log('Method this:', this.name);
    
    function inner() {
      // Default binding applies here
      console.log('Inner this:', this);
    }
    
    inner(); // Called without context
  }
};

// IIFE context
(function() {
  console.log('IIFE this:', this);
})();

// Global function stored in variable
const globalFunc = function() {
  console.log('Variable function this:', this);
};

// Demonstrating default binding
console.log('=== Default Binding Examples ===\n');

// 1. Standalone function call
showThis(); // global/window (non-strict)
showThisStrict(); // undefined (strict)

// 2. Function from object loses context
const extracted = obj.showThis;
extracted(); // Default binding, not obj

// 3. Nested function
obj.showThis(); // Inner function gets default binding

// 4. Global function
globalFunc(); // Default binding

// Real-world scenario: callbacks
function processData(callback) {
  // callback loses its original context
  callback();
}

const processor = {
  name: 'DataProcessor',
  process() {
    console.log(`Processing with ${this.name}`);
  }
};

// This will fail - default binding applied
console.log('\n=== Callback Context Loss ===');
try {
  processData(processor.process);
} catch (e) {
  console.log('Error:', e.message);
}

// Solutions for maintaining context
console.log('\n=== Solutions ===');

// Solution 1: Arrow function
const processor2 = {
  name: 'DataProcessor2',
  process: () => {
    // Note: this won't work as expected in object literal
    console.log('Arrow function this:', this);
  },
  
  processCorrectly() {
    // Use arrow function inside method
    const doProcess = () => {
      console.log(`Processing with ${this.name}`);
    };
    return doProcess;
  }
};

processData(processor2.processCorrectly());

// Solution 2: Bind
processData(processor.process.bind(processor));

// Solution 3: Wrapper function
processData(function() {
  processor.process();
});

module.exports = { showThis, showThisStrict, obj, processor };