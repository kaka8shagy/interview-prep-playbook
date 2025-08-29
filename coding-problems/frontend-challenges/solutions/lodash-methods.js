/**
 * File: lodash-methods.js
 * Description: Implementation of commonly used lodash methods with detailed explanations
 * 
 * Learning objectives:
 * - Understand functional programming patterns
 * - Learn array and object manipulation techniques
 * - Master utility function design patterns
 * 
 * Time Complexity: Varies by method, documented per function
 * Space Complexity: Varies by method, documented per function
 */

// =======================
// Array Methods
// =======================

/**
 * chunk - Creates an array of elements split into groups of specified size
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function chunk(array, size = 1) {
  // Input validation
  if (!Array.isArray(array)) return [];
  if (size < 1) return [];
  
  const result = [];
  const length = array.length;
  
  // Process array in chunks of specified size
  for (let i = 0; i < length; i += size) {
    // slice creates a new array with elements from i to i+size (exclusive)
    // This ensures we don't go beyond array boundaries
    result.push(array.slice(i, i + size));
  }
  
  return result;
}

/**
 * compact - Creates array with all falsy values removed
 * Time Complexity: O(n)
 * Space Complexity: O(k) where k is number of truthy values
 */
function compact(array) {
  if (!Array.isArray(array)) return [];
  
  // Filter out falsy values: false, null, 0, "", undefined, NaN
  // Boolean constructor used as predicate - returns true for truthy values
  return array.filter(Boolean);
}

/**
 * difference - Creates array of values not included in other given arrays
 * Time Complexity: O(n + m) where n is first array size, m is total other elements
 * Space Complexity: O(m) for the Set
 */
function difference(array, ...others) {
  if (!Array.isArray(array)) return [];
  
  // Flatten all comparison arrays into a single Set for O(1) lookup
  // Set automatically handles duplicates
  const excludeSet = new Set(others.flat());
  
  // Keep only elements not in the exclude set
  return array.filter(item => !excludeSet.has(item));
}

/**
 * drop - Creates a slice of array with n elements dropped from beginning
 * Time Complexity: O(k) where k is elements to keep
 * Space Complexity: O(k)
 */
function drop(array, n = 1) {
  if (!Array.isArray(array)) return [];
  if (n <= 0) return array.slice(); // Return copy if n is 0 or negative
  
  // slice creates new array starting from index n
  return array.slice(n);
}

/**
 * dropRight - Creates a slice of array with n elements dropped from end
 * Time Complexity: O(k) where k is elements to keep
 * Space Complexity: O(k)
 */
function dropRight(array, n = 1) {
  if (!Array.isArray(array)) return [];
  if (n <= 0) return array.slice();
  
  // slice with negative second parameter drops from end
  return array.slice(0, -n || undefined);
}

/**
 * flatten - Flattens array a single level deep
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function flatten(array) {
  if (!Array.isArray(array)) return [];
  
  const result = [];
  
  for (const item of array) {
    if (Array.isArray(item)) {
      // Spread operator flattens one level
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  
  return result;
}

/**
 * flattenDeep - Recursively flattens array
 * Time Complexity: O(n) where n is total elements in nested structure
 * Space Complexity: O(d) where d is maximum nesting depth
 */
function flattenDeep(array) {
  if (!Array.isArray(array)) return [];
  
  const result = [];
  
  for (const item of array) {
    if (Array.isArray(item)) {
      // Recursive call for nested arrays
      result.push(...flattenDeep(item));
    } else {
      result.push(item);
    }
  }
  
  return result;
}

/**
 * uniq - Creates duplicate-free version of array
 * Time Complexity: O(n)
 * Space Complexity: O(k) where k is number of unique elements
 */
function uniq(array) {
  if (!Array.isArray(array)) return [];
  
  // Set automatically handles uniqueness
  return [...new Set(array)];
}

/**
 * uniqBy - Like uniq but accepts iteratee to compute uniqueness
 * Time Complexity: O(n)
 * Space Complexity: O(k) where k is number of unique values
 */
function uniqBy(array, iteratee) {
  if (!Array.isArray(array)) return [];
  
  const seen = new Set();
  const result = [];
  
  // Convert iteratee to function if it's a string (property name)
  const iterateeFn = typeof iteratee === 'string' ? 
    item => item?.[iteratee] : iteratee;
  
  for (const item of array) {
    const computed = iterateeFn(item);
    
    if (!seen.has(computed)) {
      seen.add(computed);
      result.push(item);
    }
  }
  
  return result;
}

// =======================
// Object Methods
// =======================

/**
 * pick - Creates object with only specified properties
 * Time Complexity: O(k) where k is number of keys to pick
 * Space Complexity: O(k)
 */
function pick(object, keys) {
  if (!object || typeof object !== 'object') return {};
  
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const result = {};
  
  for (const key of keysArray) {
    // Only include properties that exist in the source object
    if (key in object) {
      result[key] = object[key];
    }
  }
  
  return result;
}

/**
 * omit - Creates object with specified properties omitted
 * Time Complexity: O(n) where n is number of properties in object
 * Space Complexity: O(n - k) where k is number of omitted keys
 */
function omit(object, keys) {
  if (!object || typeof object !== 'object') return {};
  
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const keysSet = new Set(keysArray);
  const result = {};
  
  // Copy all properties except omitted ones
  for (const key in object) {
    if (object.hasOwnProperty(key) && !keysSet.has(key)) {
      result[key] = object[key];
    }
  }
  
  return result;
}

/**
 * get - Gets value at object path with optional default
 * Time Complexity: O(d) where d is path depth
 * Space Complexity: O(1)
 */
function get(object, path, defaultValue) {
  if (!object || typeof object !== 'object') return defaultValue;
  
  // Convert string path to array of keys
  // Handle both 'a.b.c' and 'a[0].b' formats
  const keys = typeof path === 'string' ? 
    path.replace(/\[(\d+)\]/g, '.$1').split('.') : 
    Array.isArray(path) ? path : [path];
  
  let current = object;
  
  for (const key of keys) {
    // Stop if we hit null/undefined at any point
    if (current == null) return defaultValue;
    
    current = current[key];
  }
  
  return current === undefined ? defaultValue : current;
}

/**
 * set - Sets value at object path, creating intermediate objects as needed
 * Time Complexity: O(d) where d is path depth
 * Space Complexity: O(d) for created intermediate objects
 */
function set(object, path, value) {
  if (!object || typeof object !== 'object') return object;
  
  const keys = typeof path === 'string' ? 
    path.replace(/\[(\d+)\]/g, '.$1').split('.') : 
    Array.isArray(path) ? path : [path];
  
  let current = object;
  
  // Navigate to parent of target property
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    
    // Create intermediate object if it doesn't exist
    if (!(key in current) || current[key] == null) {
      // Create array if next key is numeric, otherwise create object
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    
    current = current[key];
  }
  
  // Set the final value
  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;
  
  return object;
}

/**
 * merge - Recursively merges source objects into target object
 * Time Complexity: O(n) where n is total properties in all objects
 * Space Complexity: O(d) where d is maximum nesting depth
 */
function merge(target, ...sources) {
  if (!target || typeof target !== 'object') return {};
  
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    
    mergeRecursive(target, source);
  }
  
  return target;
}

function mergeRecursive(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      // If both values are objects, merge recursively
      if (isObject(sourceValue) && isObject(targetValue)) {
        mergeRecursive(targetValue, sourceValue);
      } else {
        // Otherwise, replace target value with source value
        target[key] = sourceValue;
      }
    }
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// =======================
// Collection Methods
// =======================

/**
 * groupBy - Creates object grouped by result of iteratee
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function groupBy(collection, iteratee) {
  if (!collection) return {};
  
  const result = {};
  const iterateeFn = typeof iteratee === 'string' ? 
    item => item?.[iteratee] : iteratee;
  
  for (const item of collection) {
    const key = iterateeFn(item);
    
    if (!result[key]) {
      result[key] = [];
    }
    
    result[key].push(item);
  }
  
  return result;
}

/**
 * keyBy - Creates object keyed by result of iteratee
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function keyBy(collection, iteratee) {
  if (!collection) return {};
  
  const result = {};
  const iterateeFn = typeof iteratee === 'string' ? 
    item => item?.[iteratee] : iteratee;
  
  for (const item of collection) {
    const key = iterateeFn(item);
    result[key] = item;
  }
  
  return result;
}

/**
 * sortBy - Creates array sorted by results of iteratees
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */
function sortBy(collection, iteratees) {
  if (!collection) return [];
  
  const array = Array.from(collection);
  const iterateesArray = Array.isArray(iteratees) ? iteratees : [iteratees];
  
  return array.sort((a, b) => {
    for (const iteratee of iterateesArray) {
      const iterateeFn = typeof iteratee === 'string' ? 
        item => item?.[iteratee] : iteratee;
      
      const aValue = iterateeFn(a);
      const bValue = iterateeFn(b);
      
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
    }
    
    return 0;
  });
}

// =======================
// Function Methods
// =======================

/**
 * debounce - Creates debounced function that delays invoking until after delay
 * Time Complexity: O(1) per call
 * Space Complexity: O(1)
 */
function debounce(func, wait, options = {}) {
  let timeoutId;
  let lastArgs;
  let lastThis;
  let result;
  let lastInvokeTime = 0;
  
  const { leading = false, trailing = true, maxWait } = options;
  
  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  
  function leadingEdge(time) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  
  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    
    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }
  
  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxWait !== undefined && timeSinceLastInvoke >= maxWait));
  }
  
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }
  
  function trailingEdge(time) {
    timeoutId = undefined;
    
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }
  
  let lastCallTime;
  
  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  
  debounced.cancel = function() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeoutId = undefined;
  };
  
  debounced.flush = function() {
    return timeoutId === undefined ? result : trailingEdge(Date.now());
  };
  
  return debounced;
}

/**
 * throttle - Creates throttled function that invokes at most once per wait period
 * Time Complexity: O(1) per call
 * Space Complexity: O(1)
 */
function throttle(func, wait, options = {}) {
  const { leading = true, trailing = true } = options;
  
  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait
  });
}

// =======================
// Utility Methods
// =======================

/**
 * cloneDeep - Creates deep clone of value
 * Time Complexity: O(n) where n is total elements
 * Space Complexity: O(d) where d is depth + O(n) for result
 */
function cloneDeep(value) {
  // Handle primitives and null
  if (value == null || typeof value !== 'object') {
    return value;
  }
  
  // Handle dates
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  
  // Handle regular expressions
  if (value instanceof RegExp) {
    return new RegExp(value);
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => cloneDeep(item));
  }
  
  // Handle objects
  if (typeof value === 'object') {
    const result = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = cloneDeep(value[key]);
      }
    }
    return result;
  }
  
  return value;
}

/**
 * isEqual - Performs deep comparison to determine if values are equivalent
 * Time Complexity: O(n) where n is total properties/elements
 * Space Complexity: O(d) where d is maximum depth
 */
function isEqual(value, other) {
  // Same reference or both NaN
  if (value === other) return true;
  if (value !== value && other !== other) return true; // Both NaN
  
  // Different types
  if (typeof value !== typeof other) return false;
  
  // Handle null and undefined
  if (value == null || other == null) return value === other;
  
  // Handle dates
  if (value instanceof Date && other instanceof Date) {
    return value.getTime() === other.getTime();
  }
  
  // Handle regular expressions
  if (value instanceof RegExp && other instanceof RegExp) {
    return value.toString() === other.toString();
  }
  
  // Handle arrays
  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) return false;
    
    for (let i = 0; i < value.length; i++) {
      if (!isEqual(value[i], other[i])) return false;
    }
    
    return true;
  }
  
  // Handle objects
  if (typeof value === 'object' && typeof other === 'object') {
    const keys1 = Object.keys(value);
    const keys2 = Object.keys(other);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!other.hasOwnProperty(key)) return false;
      if (!isEqual(value[key], other[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * isEmpty - Checks if value is empty object, collection, map, or set
 * Time Complexity: O(1) for most cases, O(n) for objects without length
 * Space Complexity: O(1)
 */
function isEmpty(value) {
  if (value == null) return true;
  
  // Arrays and strings
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }
  
  // Maps and Sets
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  
  // Objects
  if (typeof value === 'object') {
    // Check for own enumerable properties
    for (const key in value) {
      if (value.hasOwnProperty(key)) return false;
    }
    return true;
  }
  
  return false;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Array Methods Examples ===');

console.log('chunk([1,2,3,4,5], 2):', chunk([1,2,3,4,5], 2));
console.log('compact([0,1,false,2,"",3]):', compact([0,1,false,2,"",3]));
console.log('difference([1,2,3], [1,4], [2]):', difference([1,2,3], [1,4], [2]));
console.log('uniq([1,2,2,3,1]):', uniq([1,2,2,3,1]));

const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Alice', age: 35 }
];
console.log('uniqBy(users, "name"):', uniqBy(users, 'name'));

console.log('\n=== Object Methods Examples ===');

const user = { 
  name: 'John', 
  age: 30, 
  email: 'john@example.com',
  address: { city: 'NYC', country: 'USA' }
};

console.log('pick(user, ["name", "age"]):', pick(user, ['name', 'age']));
console.log('omit(user, "email"):', omit(user, 'email'));
console.log('get(user, "address.city"):', get(user, 'address.city'));

const cloned = cloneDeep(user);
console.log('cloneDeep - same object?', user === cloned); // false
console.log('cloneDeep - same values?', isEqual(user, cloned)); // true

console.log('\n=== Collection Methods Examples ===');

const products = [
  { name: 'Laptop', category: 'electronics', price: 1000 },
  { name: 'Phone', category: 'electronics', price: 500 },
  { name: 'Book', category: 'education', price: 20 }
];

console.log('groupBy(products, "category"):', groupBy(products, 'category'));
console.log('keyBy(products, "name"):', keyBy(products, 'name'));
console.log('sortBy(products, "price"):', sortBy(products, 'price'));

console.log('\n=== Utility Methods Examples ===');

console.log('isEmpty(""):', isEmpty(''));
console.log('isEmpty([]):', isEmpty([]));
console.log('isEmpty({}):', isEmpty({}));
console.log('isEmpty({ a: 1 }):', isEmpty({ a: 1 }));

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Data transformation pipeline
 * Common pattern for processing API responses
 */
function processUserData(rawUsers) {
  return chunk(
    sortBy(
      uniqBy(
        compact(rawUsers),
        'id'
      ),
      ['lastLogin', 'name']
    ),
    10 // Pagination
  );
}

/**
 * Use Case 2: Form validation with lodash utilities
 * Clean and validate form data
 */
function validateAndCleanForm(formData, requiredFields = []) {
  // Remove empty values
  const cleaned = omit(formData, (value, key) => isEmpty(value));
  
  // Check required fields
  const missing = difference(requiredFields, Object.keys(cleaned));
  
  return {
    isValid: missing.length === 0,
    cleanedData: cleaned,
    missingFields: missing
  };
}

/**
 * Use Case 3: Configuration merging with defaults
 * Common pattern in libraries and applications
 */
function createConfigWithDefaults(userConfig) {
  const defaultConfig = {
    timeout: 5000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'MyApp/1.0'
    },
    cache: {
      enabled: true,
      ttl: 300000
    }
  };
  
  // Deep merge preserving nested objects
  return merge(cloneDeep(defaultConfig), userConfig);
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

const rawUsers = [
  null,
  { id: 1, name: 'Alice', lastLogin: '2023-01-15' },
  { id: 2, name: 'Bob', lastLogin: '2023-01-10' },
  { id: 1, name: 'Alice', lastLogin: '2023-01-15' }, // duplicate
  undefined,
  { id: 3, name: 'Charlie', lastLogin: '2023-01-20' }
];

const processedUsers = processUserData(rawUsers);
console.log('Processed users:', processedUsers);

const formResult = validateAndCleanForm(
  { name: 'John', email: '', age: 30, phone: null },
  ['name', 'email']
);
console.log('Form validation:', formResult);

const config = createConfigWithDefaults({
  timeout: 10000,
  headers: { 'Authorization': 'Bearer token123' }
});
console.log('Merged config:', config);

// Export all methods
module.exports = {
  // Array methods
  chunk,
  compact,
  difference,
  drop,
  dropRight,
  flatten,
  flattenDeep,
  uniq,
  uniqBy,
  
  // Object methods
  pick,
  omit,
  get,
  set,
  merge,
  
  // Collection methods
  groupBy,
  keyBy,
  sortBy,
  
  // Function methods
  debounce,
  throttle,
  
  // Utility methods
  cloneDeep,
  isEqual,
  isEmpty,
  
  // Real-world helpers
  processUserData,
  validateAndCleanForm,
  createConfigWithDefaults
};

/**
 * Key Interview Points:
 * 
 * 1. Functional Programming Patterns:
 *    - Pure functions without side effects
 *    - Immutability for predictable behavior
 *    - Function composition for complex operations
 *    - Higher-order functions for flexibility
 * 
 * 2. Performance Optimizations:
 *    - Use Set for O(1) lookups instead of Array.includes()
 *    - Prefer slice() over splice() for immutability
 *    - Cache iteratee functions to avoid repeated creation
 *    - Early termination in loops when possible
 * 
 * 3. Type Safety Considerations:
 *    - Always validate input types
 *    - Handle null/undefined gracefully
 *    - Support both function and string iteratees
 *    - Consistent return types across methods
 * 
 * 4. Edge Cases:
 *    - Empty collections and null values
 *    - Circular references in objects
 *    - Path traversal in nested objects
 *    - Type coercion in comparisons
 * 
 * 5. Memory Management:
 *    - Clone objects to avoid mutations
 *    - Use weak references where appropriate
 *    - Clean up timeouts and intervals
 *    - Avoid memory leaks in closures
 */