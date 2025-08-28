/**
 * File: set-usage.js
 * Description: Set collection usage patterns and techniques
 * Demonstrates Set features, operations, and practical applications
 */

console.log('=== Basic Set Operations ===');

// Creating Sets
const basicSet = new Set();
const setWithValues = new Set([1, 2, 3, 4, 5]);
const setWithDuplicates = new Set([1, 2, 2, 3, 3, 3]);

console.log('Set with duplicates removed:', setWithDuplicates);
console.log('Set size:', setWithDuplicates.size);

// Basic operations
basicSet.add('apple');
basicSet.add('banana');
basicSet.add('orange');
basicSet.add('apple'); // Duplicate - won't be added

console.log('Basic set:', basicSet);
console.log('Has apple:', basicSet.has('apple'));
console.log('Delete banana:', basicSet.delete('banana'));
console.log('After delete:', basicSet);

// Clear all values
const tempSet = new Set([1, 2, 3]);
tempSet.clear();
console.log('After clear:', tempSet.size);

console.log('\n=== Set Iteration ===');

const iterationSet = new Set(['a', 'b', 'c']);

// Different iteration methods
console.log('1. for...of:');
for (const value of iterationSet) {
  console.log(`  ${value}`);
}

console.log('2. values():');
for (const value of iterationSet.values()) {
  console.log(`  ${value}`);
}

console.log('3. keys() - same as values():');
for (const key of iterationSet.keys()) {
  console.log(`  ${key}`);
}

console.log('4. entries() - [value, value]:');
for (const [key, value] of iterationSet.entries()) {
  console.log(`  [${key}, ${value}]`);
}

console.log('5. forEach():');
iterationSet.forEach((value1, value2, set) => {
  console.log(`  ${value1} (${value2}) - size: ${set.size}`);
});

console.log('\n=== Practical Use Cases ===');

// 1. Remove duplicates from array
function removeDuplicates(arr) {
  return [...new Set(arr)];
}

const duplicateArray = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
console.log('Remove duplicates:', removeDuplicates(duplicateArray));

// 2. Unique elements from multiple arrays
function getUniqueElements(...arrays) {
  const combined = arrays.flat();
  return [...new Set(combined)];
}

console.log('Unique from multiple arrays:', 
  getUniqueElements([1, 2, 3], [3, 4, 5], [5, 6, 7])
);

// 3. Track visited items
class VisitTracker {
  constructor() {
    this.visited = new Set();
  }
  
  visit(item) {
    if (this.visited.has(item)) {
      return false; // Already visited
    }
    this.visited.add(item);
    return true; // First visit
  }
  
  hasVisited(item) {
    return this.visited.has(item);
  }
  
  getVisitedCount() {
    return this.visited.size;
  }
  
  getVisitedItems() {
    return [...this.visited];
  }
  
  reset() {
    this.visited.clear();
  }
}

const tracker = new VisitTracker();
console.log('Visit A:', tracker.visit('A')); // true
console.log('Visit B:', tracker.visit('B')); // true
console.log('Visit A again:', tracker.visit('A')); // false
console.log('Visited items:', tracker.getVisitedItems());

console.log('\n=== Set Operations ===');

// Mathematical set operations
class SetOperations {
  static union(setA, setB) {
    const result = new Set(setA);
    for (const element of setB) {
      result.add(element);
    }
    return result;
  }
  
  static intersection(setA, setB) {
    const result = new Set();
    for (const element of setA) {
      if (setB.has(element)) {
        result.add(element);
      }
    }
    return result;
  }
  
  static difference(setA, setB) {
    const result = new Set();
    for (const element of setA) {
      if (!setB.has(element)) {
        result.add(element);
      }
    }
    return result;
  }
  
  static symmetricDifference(setA, setB) {
    const union = SetOperations.union(setA, setB);
    const intersection = SetOperations.intersection(setA, setB);
    
    return SetOperations.difference(union, intersection);
  }
  
  static isSubset(setA, setB) {
    for (const element of setA) {
      if (!setB.has(element)) {
        return false;
      }
    }
    return true;
  }
  
  static isSuperset(setA, setB) {
    return SetOperations.isSubset(setB, setA);
  }
  
  static isEqual(setA, setB) {
    return setA.size === setB.size && SetOperations.isSubset(setA, setB);
  }
}

const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

console.log('Set A:', setA);
console.log('Set B:', setB);
console.log('Union:', SetOperations.union(setA, setB));
console.log('Intersection:', SetOperations.intersection(setA, setB));
console.log('A - B (difference):', SetOperations.difference(setA, setB));
console.log('B - A (difference):', SetOperations.difference(setB, setA));
console.log('Symmetric difference:', SetOperations.symmetricDifference(setA, setB));

const subset = new Set([1, 2]);
console.log('Is [1,2] subset of A:', SetOperations.isSubset(subset, setA));

console.log('\n=== Advanced Set Patterns ===');

// 1. Permission system
class PermissionManager {
  constructor() {
    this.userPermissions = new Map();
    this.rolePermissions = new Map();
  }
  
  addRole(role, permissions = []) {
    this.rolePermissions.set(role, new Set(permissions));
  }
  
  addUser(userId, roles = [], directPermissions = []) {
    const userPerms = new Set(directPermissions);
    
    // Add permissions from roles
    roles.forEach(role => {
      if (this.rolePermissions.has(role)) {
        const rolePerms = this.rolePermissions.get(role);
        rolePerms.forEach(perm => userPerms.add(perm));
      }
    });
    
    this.userPermissions.set(userId, userPerms);
  }
  
  hasPermission(userId, permission) {
    const userPerms = this.userPermissions.get(userId);
    return userPerms ? userPerms.has(permission) : false;
  }
  
  getUserPermissions(userId) {
    const userPerms = this.userPermissions.get(userId);
    return userPerms ? [...userPerms] : [];
  }
  
  addPermissionToUser(userId, permission) {
    if (this.userPermissions.has(userId)) {
      this.userPermissions.get(userId).add(permission);
    }
  }
  
  removePermissionFromUser(userId, permission) {
    if (this.userPermissions.has(userId)) {
      this.userPermissions.get(userId).delete(permission);
    }
  }
}

const permManager = new PermissionManager();

// Setup roles
permManager.addRole('admin', ['read', 'write', 'delete', 'manage']);
permManager.addRole('editor', ['read', 'write']);
permManager.addRole('viewer', ['read']);

// Add users
permManager.addUser('user1', ['admin']);
permManager.addUser('user2', ['editor'], ['special_feature']);
permManager.addUser('user3', ['viewer']);

console.log('User1 permissions:', permManager.getUserPermissions('user1'));
console.log('User2 has write:', permManager.hasPermission('user2', 'write'));
console.log('User3 has delete:', permManager.hasPermission('user3', 'delete'));

// 2. Cache with expiration
class ExpiringCache {
  constructor() {
    this.cache = new Map();
    this.expiring = new Set();
  }
  
  set(key, value, ttl = 60000) { // Default 1 minute
    this.cache.set(key, value);
    
    // Set expiration
    setTimeout(() => {
      this.cache.delete(key);
      this.expiring.delete(key);
    }, ttl);
    
    this.expiring.add(key);
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  getActiveKeys() {
    return new Set(this.cache.keys());
  }
  
  getExpiringKeys() {
    return new Set(this.expiring);
  }
  
  clear() {
    this.cache.clear();
    this.expiring.clear();
  }
}

const cache = new ExpiringCache();
cache.set('key1', 'value1', 1000); // 1 second
cache.set('key2', 'value2', 5000); // 5 seconds

console.log('Initial cache keys:', cache.getActiveKeys());
setTimeout(() => {
  console.log('Cache keys after 2 seconds:', cache.getActiveKeys());
}, 2000);

console.log('\n=== Performance Considerations ===');

// Set vs Array performance for lookups
function performanceLookupTest(size) {
  const arr = Array.from({ length: size }, (_, i) => i);
  const set = new Set(arr);
  const searchItem = size - 1; // Worst case for array
  
  console.log(`\nLookup performance test with ${size} items:`);
  
  console.time('Array includes');
  for (let i = 0; i < 1000; i++) {
    arr.includes(searchItem);
  }
  console.timeEnd('Array includes');
  
  console.time('Set has');
  for (let i = 0; i < 1000; i++) {
    set.has(searchItem);
  }
  console.timeEnd('Set has');
}

performanceLookupTest(10000);

// Memory usage comparison
function memoryTest() {
  const arr = [];
  const set = new Set();
  const testSize = 100000;
  
  console.log('\nMemory usage patterns:');
  
  // Arrays store indices and values
  for (let i = 0; i < testSize; i++) {
    arr.push(i);
  }
  
  // Sets only store unique values
  for (let i = 0; i < testSize; i++) {
    set.add(i);
  }
  
  console.log('Array length:', arr.length);
  console.log('Set size:', set.size);
  console.log('Set has O(1) lookup, Array has O(n) for includes');
}

memoryTest();

console.log('\n=== Interview Questions ===');

// Q1: Find all unique characters in a string
function uniqueCharacters(str) {
  return new Set(str).size;
}

function hasAllUniqueChars(str) {
  return new Set(str).size === str.length;
}

console.log('Unique chars in "hello":', uniqueCharacters('hello'));
console.log('All unique in "world":', hasAllUniqueChars('world'));
console.log('All unique in "abc":', hasAllUniqueChars('abc'));

// Q2: Find missing numbers in sequence
function findMissingNumbers(arr, max) {
  const present = new Set(arr);
  const missing = [];
  
  for (let i = 1; i <= max; i++) {
    if (!present.has(i)) {
      missing.push(i);
    }
  }
  
  return missing;
}

console.log('Missing numbers [1,3,5] up to 6:', findMissingNumbers([1, 3, 5], 6));

// Q3: Group anagrams
function groupAnagrams(words) {
  const anagramMap = new Map();
  
  words.forEach(word => {
    const key = [...word].sort().join('');
    
    if (!anagramMap.has(key)) {
      anagramMap.set(key, new Set());
    }
    
    anagramMap.get(key).add(word);
  });
  
  return Array.from(anagramMap.values()).map(set => [...set]);
}

const words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
console.log('Grouped anagrams:', groupAnagrams(words));

// Q4: Implement a simple bloom filter using multiple Sets
class SimpleBloomFilter {
  constructor(size = 1000) {
    this.size = size;
    this.sets = [new Set(), new Set(), new Set()]; // 3 hash functions
  }
  
  _hash1(str) {
    return str.length % this.size;
  }
  
  _hash2(str) {
    return [...str].reduce((hash, char) => hash + char.charCodeAt(0), 0) % this.size;
  }
  
  _hash3(str) {
    return [...str].reduce((hash, char, i) => hash + char.charCodeAt(0) * (i + 1), 0) % this.size;
  }
  
  add(item) {
    const str = String(item);
    this.sets[0].add(this._hash1(str));
    this.sets[1].add(this._hash2(str));
    this.sets[2].add(this._hash3(str));
  }
  
  mightContain(item) {
    const str = String(item);
    return this.sets[0].has(this._hash1(str)) &&
           this.sets[1].has(this._hash2(str)) &&
           this.sets[2].has(this._hash3(str));
  }
}

const bloomFilter = new SimpleBloomFilter();
bloomFilter.add('hello');
bloomFilter.add('world');

console.log('Bloom filter might contain "hello":', bloomFilter.mightContain('hello'));
console.log('Bloom filter might contain "goodbye":', bloomFilter.mightContain('goodbye'));

// Q5: Detect cycle in array using Set
function hasCycle(arr, startIndex = 0) {
  const visited = new Set();
  let current = startIndex;
  
  while (current >= 0 && current < arr.length) {
    if (visited.has(current)) {
      return true; // Cycle detected
    }
    
    visited.add(current);
    current = arr[current];
  }
  
  return false; // No cycle
}

const cyclicArray = [1, 2, 3, 1]; // Points to indices: 1->2->3->1 (cycle)
const acyclicArray = [1, 2, 3, -1]; // No cycle (ends at -1)

console.log('Cyclic array has cycle:', hasCycle(cyclicArray, 0));
console.log('Acyclic array has cycle:', hasCycle(acyclicArray, 0));

module.exports = {
  removeDuplicates,
  getUniqueElements,
  VisitTracker,
  SetOperations,
  PermissionManager,
  ExpiringCache,
  uniqueCharacters,
  hasAllUniqueChars,
  findMissingNumbers,
  groupAnagrams,
  SimpleBloomFilter,
  hasCycle
};