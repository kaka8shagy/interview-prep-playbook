/**
 * File: spread-operator.js
 * Description: Spread operator (...) usage patterns
 * Demonstrates various spread operator applications
 */

console.log('=== Array Spread Operator ===');

// Basic array spreading
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log('Combined arrays:', combined); // [1, 2, 3, 4, 5, 6]

// Array copying
const original = [1, 2, 3];
const copy = [...original];
copy.push(4);
console.log('Original:', original); // [1, 2, 3]
console.log('Copy:', copy); // [1, 2, 3, 4]

// Spreading with additional elements
const base = [2, 3, 4];
const extended = [1, ...base, 5, 6];
console.log('Extended array:', extended); // [1, 2, 3, 4, 5, 6]

// Converting strings to character arrays
const word = 'hello';
const chars = [...word];
console.log('String to chars:', chars); // ['h', 'e', 'l', 'l', 'o']

console.log('\n=== Object Spread Operator ===');

// Basic object spreading
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const mergedObj = { ...obj1, ...obj2 };
console.log('Merged object:', mergedObj); // { a: 1, b: 2, c: 3, d: 4 }

// Object copying with modifications
const person = { name: 'John', age: 30, city: 'New York' };
const updatedPerson = { ...person, age: 31, country: 'USA' };
console.log('Updated person:', updatedPerson);

// Property override order matters
const defaults = { theme: 'light', fontSize: 14, showSidebar: true };
const userSettings = { fontSize: 16, theme: 'dark' };
const settings = { ...defaults, ...userSettings };
console.log('Final settings:', settings); // userSettings override defaults

console.log('\n=== Function Arguments ===');

// Spreading arrays as function arguments
function sum(a, b, c, d) {
  return a + b + c + d;
}

const numbers = [1, 2, 3, 4];
const result = sum(...numbers);
console.log('Sum result:', result); // 10

// Math functions with spread
const values = [5, 10, 2, 8, 1];
console.log('Max value:', Math.max(...values)); // 10
console.log('Min value:', Math.min(...values)); // 1

// Function with variable arguments
function greet(greeting, ...names) {
  return `${greeting} ${names.join(', ')}!`;
}

const people = ['Alice', 'Bob', 'Charlie'];
console.log('Greeting:', greet('Hello', ...people));

console.log('\n=== Advanced Array Operations ===');

// Flattening arrays one level
const nested = [[1, 2], [3, 4], [5, 6]];
const flattened = [].concat(...nested);
console.log('Flattened:', flattened); // [1, 2, 3, 4, 5, 6]

// Remove duplicates
const withDuplicates = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(withDuplicates)];
console.log('Unique values:', unique); // [1, 2, 3, 4]

// Array insertion at specific position
function insertAt(array, index, ...items) {
  return [
    ...array.slice(0, index),
    ...items,
    ...array.slice(index)
  ];
}

const originalArray = [1, 2, 5, 6];
const inserted = insertAt(originalArray, 2, 3, 4);
console.log('Array with insertion:', inserted); // [1, 2, 3, 4, 5, 6]

// Array replacement
function replaceRange(array, start, end, ...items) {
  return [
    ...array.slice(0, start),
    ...items,
    ...array.slice(end)
  ];
}

const replaced = replaceRange([1, 2, 3, 4, 5], 1, 4, 'a', 'b');
console.log('Array with replacement:', replaced); // [1, 'a', 'b', 5]

console.log('\n=== Object Manipulation ===');

// Deep merge (one level)
function mergeObjects(...objects) {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
}

const config1 = { api: { timeout: 5000 }, debug: true };
const config2 = { api: { retries: 3 }, theme: 'dark' };
const merged = mergeObjects(config1, config2);
console.log('Merged config:', merged);

// Selective property copying
function pickProperties(obj, ...props) {
  return props.reduce((acc, prop) => {
    if (prop in obj) {
      acc[prop] = obj[prop];
    }
    return acc;
  }, {});
}

const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
const publicUser = pickProperties(user, 'id', 'name', 'email');
console.log('Public user data:', publicUser);

// Property exclusion
function omitProperties(obj, ...propsToOmit) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!propsToOmit.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

const userWithoutPassword = omitProperties(user, 'password');
console.log('User without password:', userWithoutPassword);

console.log('\n=== Conditional Spreading ===');

// Conditional object properties
function createUserProfile(userData, options = {}) {
  return {
    ...userData,
    ...(options.includeTimestamp && { timestamp: new Date() }),
    ...(options.includeId && { id: Math.random().toString(36) }),
    ...(options.defaultRole && { role: options.defaultRole })
  };
}

const profile1 = createUserProfile(
  { name: 'Alice', email: 'alice@example.com' },
  { includeTimestamp: true, includeId: true }
);
console.log('Profile with timestamp and ID:', profile1);

const profile2 = createUserProfile(
  { name: 'Bob', email: 'bob@example.com' },
  { defaultRole: 'user' }
);
console.log('Profile with default role:', profile2);

// Conditional array elements
function createMenu(isAdmin, isAuthenticated) {
  return [
    'home',
    'about',
    ...(isAuthenticated ? ['profile', 'settings'] : []),
    ...(isAdmin ? ['admin', 'users'] : []),
    'contact'
  ];
}

const userMenu = createMenu(false, true);
const adminMenu = createMenu(true, true);
const guestMenu = createMenu(false, false);

console.log('User menu:', userMenu);
console.log('Admin menu:', adminMenu);
console.log('Guest menu:', guestMenu);

console.log('\n=== State Management Patterns ===');

// Redux-style state updates
function updateState(currentState, updates) {
  return {
    ...currentState,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
}

let appState = {
  user: { name: 'John', isLoggedIn: false },
  theme: 'light',
  notifications: []
};

// Update user login status
appState = updateState(appState, {
  user: { ...appState.user, isLoggedIn: true }
});
console.log('After login:', appState);

// Add notification
appState = updateState(appState, {
  notifications: [...appState.notifications, { id: 1, message: 'Welcome!', type: 'info' }]
});
console.log('After notification:', appState);

console.log('\n=== Performance Considerations ===');

// Efficient array concatenation for large arrays
function efficientConcat(arrays) {
  // For very large arrays, spread might cause stack overflow
  // Alternative approach for large datasets
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Array(totalLength);
  let offset = 0;
  
  for (const array of arrays) {
    for (let i = 0; i < array.length; i++) {
      result[offset + i] = array[i];
    }
    offset += array.length;
  }
  
  return result;
}

// Performance comparison function
function compareSpreadPerformance() {
  const largeArray1 = new Array(10000).fill(1);
  const largeArray2 = new Array(10000).fill(2);
  
  console.time('Spread operator');
  const spreadResult = [...largeArray1, ...largeArray2];
  console.timeEnd('Spread operator');
  
  console.time('Efficient concat');
  const efficientResult = efficientConcat([largeArray1, largeArray2]);
  console.timeEnd('Efficient concat');
  
  console.log('Results equal:', spreadResult.length === efficientResult.length);
}

compareSpreadPerformance();

console.log('\n=== Interview Questions ===');

// Q1: Implement array shuffle using spread
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const cards = ['A', 'K', 'Q', 'J', '10'];
console.log('Original cards:', cards);
console.log('Shuffled cards:', shuffleArray(cards));
console.log('Original unchanged:', cards);

// Q2: Implement object diff
function objectDiff(obj1, obj2) {
  const allKeys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])];
  
  return allKeys.reduce((diff, key) => {
    if (obj1[key] !== obj2[key]) {
      diff[key] = { from: obj1[key], to: obj2[key] };
    }
    return diff;
  }, {});
}

const before = { name: 'John', age: 30, city: 'NYC' };
const after = { name: 'John', age: 31, city: 'LA', country: 'USA' };
console.log('Object diff:', objectDiff(before, after));

// Q3: Implement pagination helper
function paginateArray(array, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: [...array.slice(start, end)],
    page,
    pageSize,
    total: array.length,
    totalPages: Math.ceil(array.length / pageSize),
    hasNext: end < array.length,
    hasPrev: page > 1
  };
}

const items = Array.from({ length: 25 }, (_, i) => `Item ${i + 1}`);
const page2 = paginateArray(items, 2, 10);
console.log('Page 2 data:', page2);

module.exports = {
  insertAt,
  replaceRange,
  mergeObjects,
  pickProperties,
  omitProperties,
  createUserProfile,
  createMenu,
  updateState,
  efficientConcat,
  shuffleArray,
  objectDiff,
  paginateArray
};