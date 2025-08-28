/**
 * File: map-usage.js
 * Description: Map collection usage patterns and techniques
 * Demonstrates Map features, performance, and use cases
 */

console.log('=== Basic Map Operations ===');

// Creating Maps
const basicMap = new Map();
const mapWithEntries = new Map([
  ['key1', 'value1'],
  ['key2', 'value2'],
  [1, 'number key'],
  [true, 'boolean key']
]);

console.log('Map with initial entries:', mapWithEntries);

// Basic operations
basicMap.set('name', 'John');
basicMap.set('age', 30);
basicMap.set('isActive', true);

console.log('Map size:', basicMap.size);
console.log('Get name:', basicMap.get('name'));
console.log('Has age:', basicMap.has('age'));

// Delete operations
console.log('Delete age:', basicMap.delete('age'));
console.log('Size after delete:', basicMap.size);

console.log('\n=== Map vs Object Key Types ===');

// Maps can use any type as key
const mixedKeyMap = new Map();
const objKey = { id: 1 };
const funcKey = function() {};
const symbolKey = Symbol('key');

mixedKeyMap.set(objKey, 'object key value');
mixedKeyMap.set(funcKey, 'function key value');
mixedKeyMap.set(symbolKey, 'symbol key value');
mixedKeyMap.set(42, 'number key value');

console.log('Object key value:', mixedKeyMap.get(objKey));
console.log('Function key value:', mixedKeyMap.get(funcKey));
console.log('Symbol key value:', mixedKeyMap.get(symbolKey));

// Objects have limitations with keys
const objWithLimitedKeys = {};
objWithLimitedKeys[objKey] = 'object as key'; // Converts to string
objWithLimitedKeys[42] = 'number as key'; // Converts to string

console.log('Object keys:', Object.keys(objWithLimitedKeys));
console.log('Object key became string:', objWithLimitedKeys['[object Object]']);

console.log('\n=== Map Iteration ===');

const iterationMap = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

// Different ways to iterate
console.log('1. for...of with entries():');
for (const [key, value] of iterationMap.entries()) {
  console.log(`  ${key}: ${value}`);
}

console.log('2. for...of (default is entries):');
for (const [key, value] of iterationMap) {
  console.log(`  ${key}: ${value}`);
}

console.log('3. keys():');
for (const key of iterationMap.keys()) {
  console.log(`  key: ${key}`);
}

console.log('4. values():');
for (const value of iterationMap.values()) {
  console.log(`  value: ${value}`);
}

console.log('5. forEach():');
iterationMap.forEach((value, key, map) => {
  console.log(`  ${key} => ${value} (size: ${map.size})`);
});

console.log('\n=== Practical Use Cases ===');

// 1. Caching function results
function createMemoizedFunction(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit for:', args);
      return cache.get(key);
    }
    
    console.log('Computing for:', args);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const expensiveCalculation = (x, y) => {
  // Simulate expensive operation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += x * y;
  }
  return result / 1000000;
};

const memoized = createMemoizedFunction(expensiveCalculation);
console.log('First call:', memoized(5, 10));
console.log('Second call (cached):', memoized(5, 10));

// 2. Event listeners management
class EventManager {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }
  
  getEventStats() {
    const stats = new Map();
    for (const [event, callbacks] of this.listeners) {
      stats.set(event, callbacks.size);
    }
    return stats;
  }
}

const eventManager = new EventManager();
const handler1 = data => console.log('Handler 1:', data);
const handler2 = data => console.log('Handler 2:', data);

eventManager.on('test', handler1);
eventManager.on('test', handler2);
eventManager.on('other', handler1);

console.log('Event stats:', eventManager.getEventStats());
eventManager.emit('test', { message: 'Hello' });

// 3. Object property metadata
function createMetadataTracker() {
  const metadata = new Map();
  
  return {
    setProperty(obj, prop, value, meta = {}) {
      const key = { obj, prop };
      metadata.set(key, {
        ...meta,
        lastModified: new Date(),
        accessCount: 0
      });
      obj[prop] = value;
    },
    
    getProperty(obj, prop) {
      const key = Array.from(metadata.keys())
        .find(k => k.obj === obj && k.prop === prop);
      
      if (key) {
        const meta = metadata.get(key);
        meta.accessCount++;
        meta.lastAccessed = new Date();
        return obj[prop];
      }
      
      return obj[prop];
    },
    
    getMetadata(obj, prop) {
      const key = Array.from(metadata.keys())
        .find(k => k.obj === obj && k.prop === prop);
      return key ? metadata.get(key) : null;
    },
    
    getAllMetadata() {
      return Array.from(metadata.entries()).map(([key, meta]) => ({
        object: key.obj,
        property: key.prop,
        metadata: meta
      }));
    }
  };
}

const tracker = createMetadataTracker();
const testObject = {};

tracker.setProperty(testObject, 'name', 'John', { type: 'string', required: true });
tracker.setProperty(testObject, 'age', 30, { type: 'number', min: 0 });

console.log('Property value:', tracker.getProperty(testObject, 'name'));
console.log('Property metadata:', tracker.getMetadata(testObject, 'name'));

console.log('\n=== Map Performance Benefits ===');

// Performance comparison: Map vs Object
function performanceComparison(size) {
  console.log(`\nPerformance test with ${size} items:`);
  
  // Object performance
  console.time('Object creation');
  const obj = {};
  for (let i = 0; i < size; i++) {
    obj[`key${i}`] = `value${i}`;
  }
  console.timeEnd('Object creation');
  
  // Map performance
  console.time('Map creation');
  const map = new Map();
  for (let i = 0; i < size; i++) {
    map.set(`key${i}`, `value${i}`);
  }
  console.timeEnd('Map creation');
  
  // Access performance
  const randomKey = `key${Math.floor(size / 2)}`;
  
  console.time('Object access');
  for (let i = 0; i < 1000; i++) {
    const value = obj[randomKey];
  }
  console.timeEnd('Object access');
  
  console.time('Map access');
  for (let i = 0; i < 1000; i++) {
    const value = map.get(randomKey);
  }
  console.timeEnd('Map access');
  
  // Deletion performance
  console.time('Object deletion');
  delete obj[randomKey];
  console.timeEnd('Object deletion');
  
  console.time('Map deletion');
  map.delete(randomKey);
  console.timeEnd('Map deletion');
  
  console.log('Final sizes - Object keys:', Object.keys(obj).length, 'Map size:', map.size);
}

performanceComparison(10000);

console.log('\n=== Advanced Map Patterns ===');

// 1. Grouped data structure
function groupBy(array, keyFn) {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

const users = [
  { name: 'Alice', age: 25, department: 'Engineering' },
  { name: 'Bob', age: 30, department: 'Sales' },
  { name: 'Charlie', age: 35, department: 'Engineering' },
  { name: 'Diana', age: 28, department: 'Sales' }
];

const groupedByDept = groupBy(users, user => user.department);
console.log('Users by department:');
for (const [dept, userList] of groupedByDept) {
  console.log(`${dept}:`, userList.map(u => u.name));
}

// 2. LRU Cache implementation
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return -1;
  }
  
  put(key, value) {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  getContents() {
    return Array.from(this.cache.entries());
  }
}

const lruCache = new LRUCache(3);
lruCache.put(1, 'one');
lruCache.put(2, 'two');
lruCache.put(3, 'three');
console.log('LRU Cache after 3 puts:', lruCache.getContents());

lruCache.get(1); // Access 1, making it most recent
lruCache.put(4, 'four'); // Should evict 2
console.log('LRU Cache after access and new put:', lruCache.getContents());

console.log('\n=== Interview Questions ===');

// Q1: Implement a frequency counter
function frequencyCounter(arr) {
  return arr.reduce((freq, item) => {
    freq.set(item, (freq.get(item) || 0) + 1);
    return freq;
  }, new Map());
}

const items = ['a', 'b', 'a', 'c', 'b', 'a'];
const frequencies = frequencyCounter(items);
console.log('Frequency count:', frequencies);

// Q2: Find intersection of two arrays using Map
function intersection(arr1, arr2) {
  const set1 = new Map();
  const result = [];
  
  // Count occurrences in first array
  arr1.forEach(item => {
    set1.set(item, (set1.get(item) || 0) + 1);
  });
  
  // Find common elements in second array
  arr2.forEach(item => {
    if (set1.has(item) && set1.get(item) > 0) {
      result.push(item);
      set1.set(item, set1.get(item) - 1);
    }
  });
  
  return result;
}

console.log('Intersection [1,2,2,1] & [2,2]:', intersection([1, 2, 2, 1], [2, 2]));

// Q3: Two sum problem with Map
function twoSum(nums, target) {
  const seen = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    
    seen.set(nums[i], i);
  }
  
  return [];
}

console.log('Two sum [2,7,11,15], target 9:', twoSum([2, 7, 11, 15], 9));

// Q4: Clone a Map deeply
function deepCloneMap(originalMap) {
  const cloned = new Map();
  
  for (const [key, value] of originalMap) {
    if (value instanceof Map) {
      cloned.set(key, deepCloneMap(value));
    } else if (value && typeof value === 'object') {
      cloned.set(key, JSON.parse(JSON.stringify(value)));
    } else {
      cloned.set(key, value);
    }
  }
  
  return cloned;
}

const originalMap = new Map([
  ['simple', 'value'],
  ['nested', new Map([['inner', 'data']])],
  ['object', { prop: 'value' }]
]);

const clonedMap = deepCloneMap(originalMap);
console.log('Maps are different:', originalMap !== clonedMap);
console.log('Nested maps are different:', originalMap.get('nested') !== clonedMap.get('nested'));

module.exports = {
  createMemoizedFunction,
  EventManager,
  createMetadataTracker,
  groupBy,
  LRUCache,
  frequencyCounter,
  intersection,
  twoSum,
  deepCloneMap
};