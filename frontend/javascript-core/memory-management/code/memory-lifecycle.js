/**
 * File: memory-lifecycle.js
 * Description: Demonstrating memory allocation, usage, and release in JavaScript
 */

// === Memory Allocation ===
console.log('=== Memory Allocation Examples ===\n');

// Primitive allocation (stack)
let numberValue = 42;              // Allocates memory for number
let stringValue = 'Hello';         // Allocates memory for string
let booleanValue = true;           // Allocates memory for boolean
let nullValue = null;              // Allocates memory for null
let undefinedValue = undefined;    // Allocates memory for undefined

// Object allocation (heap)
let objectValue = {                // Allocates memory for object
  name: 'John',
  age: 30
};

// Array allocation (heap)
let arrayValue = [1, 2, 3, 4, 5];  // Allocates memory for array

// Function allocation (heap)
function myFunction() {             // Allocates memory for function
  return 'Hello';
}

// Dynamic allocation
let dynamicArray = new Array(1000000); // Allocates large array
let date = new Date();                  // Allocates Date object

console.log('Memory allocated for various types');

// === Memory Usage ===
console.log('\n=== Memory Usage Examples ===\n');

// Reading from memory
console.log('Reading number:', numberValue);
console.log('Reading object property:', objectValue.name);
console.log('Reading array element:', arrayValue[0]);

// Writing to memory
numberValue = 100;
objectValue.city = 'New York';
arrayValue.push(6);

console.log('Memory modified');

// === Memory Release (Garbage Collection) ===
console.log('\n=== Memory Release Examples ===\n');

// Example 1: Variable goes out of scope
function createTemporaryData() {
  let tempData = new Array(10000).fill('temporary');
  // tempData is eligible for GC when function ends
  return tempData.length;
}

let result = createTemporaryData();
// tempData no longer reachable, will be garbage collected

// Example 2: Reassigning references
let largeObject = {
  data: new Array(10000).fill('data'),
  nested: {
    moreData: new Array(10000).fill('more')
  }
};

console.log('Large object created');
largeObject = null; // Original object now eligible for GC
console.log('Large object dereferenced');

// Example 3: Removing references from collections
let cache = new Map();
let data1 = { id: 1, content: new Array(1000).fill('content1') };
let data2 = { id: 2, content: new Array(1000).fill('content2') };

cache.set('item1', data1);
cache.set('item2', data2);
console.log('Cache size:', cache.size);

cache.delete('item1'); // data1 eligible for GC if no other references
cache.clear();         // All cached data eligible for GC
console.log('Cache cleared');

// Example 4: Circular references (handled by modern GC)
function createCircularReference() {
  let obj1 = { name: 'Object 1' };
  let obj2 = { name: 'Object 2' };
  
  obj1.ref = obj2;
  obj2.ref = obj1;
  
  return 'Circular reference created';
}

createCircularReference();
// Both objects eligible for GC despite circular reference

// === Memory Monitoring ===
console.log('\n=== Memory Monitoring ===\n');

// Browser environment
if (typeof performance !== 'undefined' && performance.memory) {
  console.log('Memory Usage (Browser):');
  console.log('Used JS Heap:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2), 'MB');
  console.log('Total JS Heap:', (performance.memory.totalJSHeapSize / 1048576).toFixed(2), 'MB');
  console.log('JS Heap Limit:', (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2), 'MB');
}

// Node.js environment
if (typeof process !== 'undefined' && process.memoryUsage) {
  const memUsage = process.memoryUsage();
  console.log('Memory Usage (Node.js):');
  console.log('RSS:', (memUsage.rss / 1048576).toFixed(2), 'MB');
  console.log('Heap Total:', (memUsage.heapTotal / 1048576).toFixed(2), 'MB');
  console.log('Heap Used:', (memUsage.heapUsed / 1048576).toFixed(2), 'MB');
  console.log('External:', (memUsage.external / 1048576).toFixed(2), 'MB');
}

// === Manual Memory Management Hints ===
console.log('\n=== Memory Management Hints ===\n');

// Suggesting garbage collection (Node.js only)
if (typeof global !== 'undefined' && global.gc) {
  console.log('Running manual GC (requires --expose-gc flag)');
  global.gc();
} else {
  console.log('Manual GC not available');
}

// Best practices demonstration
class MemoryEfficientClass {
  constructor() {
    this.data = [];
    this.cache = new Map();
  }
  
  addData(item) {
    this.data.push(item);
  }
  
  clearData() {
    // Properly clear references
    this.data.length = 0;
    this.cache.clear();
  }
  
  destroy() {
    // Cleanup method for manual memory management
    this.data = null;
    this.cache = null;
  }
}

const instance = new MemoryEfficientClass();
instance.addData({ large: new Array(1000).fill('data') });
console.log('Data added to instance');

instance.clearData();
console.log('Instance data cleared');

instance.destroy();
console.log('Instance destroyed');

module.exports = {
  createTemporaryData,
  createCircularReference,
  MemoryEfficientClass
};