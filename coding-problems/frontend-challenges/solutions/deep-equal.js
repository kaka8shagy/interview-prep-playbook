/**
 * File: deep-equal.js
 * Description: Multiple implementations of deep equality comparison
 * 
 * Learning objectives:
 * - Understand deep equality vs shallow equality
 * - Learn to handle circular references and edge cases
 * - See performance optimizations and type handling
 * 
 * Time Complexity: O(n) where n is total number of properties
 * Space Complexity: O(d) where d is maximum depth
 */

// =======================
// Approach 1: Basic Deep Equal
// =======================

/**
 * Basic deep equality implementation
 * Recursively compares objects and arrays
 * 
 * Mental model: Compare structure and values at every level
 */
function deepEqualBasic(a, b) {
  // Same reference check (optimization)
  if (a === b) return true;
  
  // Type check - different types are not equal
  if (typeof a !== typeof b) return false;
  
  // Null and undefined handling
  if (a == null || b == null) return a === b;
  
  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualBasic(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // Only one is array - not equal
  if (Array.isArray(a) || Array.isArray(b)) return false;
  
  // Object comparison
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    // Different number of properties
    if (keysA.length !== keysB.length) return false;
    
    // Check each property
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqualBasic(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  // Primitive comparison (already handled by === above, but for completeness)
  return a === b;
}

// =======================
// Approach 2: Enhanced with Type Checking
// =======================

/**
 * Enhanced deep equal with better type detection
 * Handles Date, RegExp, and other built-in types
 */
function deepEqualEnhanced(a, b) {
  // Same reference
  if (a === b) return true;
  
  // Get accurate type
  function getType(obj) {
    return Object.prototype.toString.call(obj);
  }
  
  const typeA = getType(a);
  const typeB = getType(b);
  
  // Different types
  if (typeA !== typeB) return false;
  
  // Handle primitives and null/undefined
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object') return a === b;
  
  // Handle Date objects
  if (typeA === '[object Date]') {
    return a.getTime() === b.getTime();
  }
  
  // Handle RegExp objects
  if (typeA === '[object RegExp]') {
    return a.toString() === b.toString();
  }
  
  // Handle Arrays
  if (typeA === '[object Array]') {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualEnhanced(a[i], b[i])) return false;
    }
    
    return true;
  }
  
  // Handle Objects
  if (typeA === '[object Object]') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqualEnhanced(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  // For other object types, use default comparison
  return a === b;
}

// =======================
// Approach 3: With Circular Reference Detection
// =======================

/**
 * Deep equal with circular reference detection
 * Uses WeakSet to track visited objects and prevent infinite recursion
 */
function deepEqualWithCircular(a, b, visitedA = new WeakSet(), visitedB = new WeakSet()) {
  // Same reference
  if (a === b) return true;
  
  // Type checking
  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object') return a === b;
  
  // Circular reference detection
  if (visitedA.has(a) || visitedB.has(b)) {
    // If both are visited, they should be the same reference
    // If only one is visited, they're different
    return visitedA.has(a) && visitedB.has(b) && a === b;
  }
  
  // Mark as visited
  visitedA.add(a);
  visitedB.add(b);
  
  try {
    // Get type information
    const typeA = Object.prototype.toString.call(a);
    const typeB = Object.prototype.toString.call(b);
    
    if (typeA !== typeB) return false;
    
    // Handle specific types
    if (typeA === '[object Date]') {
      return a.getTime() === b.getTime();
    }
    
    if (typeA === '[object RegExp]') {
      return a.toString() === b.toString();
    }
    
    if (typeA === '[object Array]') {
      if (a.length !== b.length) return false;
      
      for (let i = 0; i < a.length; i++) {
        if (!deepEqualWithCircular(a[i], b[i], visitedA, visitedB)) {
          return false;
        }
      }
      
      return true;
    }
    
    // Handle objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqualWithCircular(a[key], b[key], visitedA, visitedB)) {
        return false;
      }
    }
    
    return true;
  } finally {
    // Clean up visited sets for this level
    visitedA.delete(a);
    visitedB.delete(b);
  }
}

// =======================
// Approach 4: Performance Optimized
// =======================

/**
 * Performance-optimized deep equal
 * Uses caching and early exits for better performance
 */
function deepEqualOptimized(a, b, cache = new Map()) {
  // Same reference - fastest check
  if (a === b) return true;
  
  // Create cache key for memoization
  const cacheKey = `${a}_${b}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Quick type checks
  const typeA = typeof a;
  const typeB = typeof b;
  
  if (typeA !== typeB) {
    cache.set(cacheKey, false);
    return false;
  }
  
  // Handle primitives and null
  if (typeA !== 'object' || a == null || b == null) {
    const result = a === b;
    cache.set(cacheKey, result);
    return result;
  }
  
  // Detailed type checking for objects
  const tagA = Object.prototype.toString.call(a);
  const tagB = Object.prototype.toString.call(b);
  
  if (tagA !== tagB) {
    cache.set(cacheKey, false);
    return false;
  }
  
  let result;
  
  // Optimize for arrays - length check first
  if (tagA === '[object Array]') {
    if (a.length !== b.length) {
      result = false;
    } else {
      result = true;
      for (let i = 0; i < a.length && result; i++) {
        result = deepEqualOptimized(a[i], b[i], cache);
      }
    }
  }
  // Handle Date
  else if (tagA === '[object Date]') {
    result = a.getTime() === b.getTime();
  }
  // Handle RegExp
  else if (tagA === '[object RegExp]') {
    result = a.source === b.source && a.flags === b.flags;
  }
  // Handle objects
  else if (tagA === '[object Object]') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
      result = false;
    } else {
      result = true;
      
      // Use Set for faster key lookups
      const keySetB = new Set(keysB);
      
      for (const key of keysA) {
        if (!keySetB.has(key)) {
          result = false;
          break;
        }
        
        if (!deepEqualOptimized(a[key], b[key], cache)) {
          result = false;
          break;
        }
      }
    }
  }
  // Default comparison
  else {
    result = a === b;
  }
  
  cache.set(cacheKey, result);
  return result;
}

// =======================
// Approach 5: Configurable Deep Equal
// =======================

/**
 * Configurable deep equal with options for different comparison strategies
 */
function deepEqualConfigurable(a, b, options = {}) {
  const {
    strict = true,           // Use strict equality for primitives
    compareArrayOrder = true, // Whether array order matters
    ignoreKeys = [],         // Keys to ignore in objects
    customComparators = {},   // Custom comparison functions by type
    maxDepth = Infinity      // Maximum recursion depth
  } = options;
  
  function compare(objA, objB, depth = 0) {
    // Max depth check
    if (depth > maxDepth) return true;
    
    // Same reference
    if (objA === objB) return true;
    
    // Custom comparator check
    const typeA = Object.prototype.toString.call(objA);
    if (customComparators[typeA]) {
      return customComparators[typeA](objA, objB);
    }
    
    // Type checking
    if (typeof objA !== typeof objB) return false;
    if (objA == null || objB == null) return objA === objB;
    
    // Primitive comparison
    if (typeof objA !== 'object') {
      return strict ? objA === objB : objA == objB;
    }
    
    const typeB = Object.prototype.toString.call(objB);
    if (typeA !== typeB) return false;
    
    // Array comparison
    if (typeA === '[object Array]') {
      if (objA.length !== objB.length) return false;
      
      if (compareArrayOrder) {
        // Order matters - compare sequentially
        for (let i = 0; i < objA.length; i++) {
          if (!compare(objA[i], objB[i], depth + 1)) return false;
        }
      } else {
        // Order doesn't matter - check all elements exist in both
        const usedIndices = new Set();
        
        for (const itemA of objA) {
          let found = false;
          for (let j = 0; j < objB.length; j++) {
            if (!usedIndices.has(j) && compare(itemA, objB[j], depth + 1)) {
              usedIndices.add(j);
              found = true;
              break;
            }
          }
          if (!found) return false;
        }
      }
      
      return true;
    }
    
    // Object comparison
    if (typeA === '[object Object]') {
      const keysA = Object.keys(objA).filter(key => !ignoreKeys.includes(key));
      const keysB = Object.keys(objB).filter(key => !ignoreKeys.includes(key));
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
        if (!compare(objA[key], objB[key], depth + 1)) return false;
      }
      
      return true;
    }
    
    // Date comparison
    if (typeA === '[object Date]') {
      return objA.getTime() === objB.getTime();
    }
    
    // RegExp comparison
    if (typeA === '[object RegExp]') {
      return objA.toString() === objB.toString();
    }
    
    // Default comparison
    return objA === objB;
  }
  
  return compare(a, b);
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Deep Equal Examples ===');

// Test data
const obj1 = {
  name: 'John',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Anytown'
  },
  hobbies: ['reading', 'coding']
};

const obj2 = {
  name: 'John',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Anytown'
  },
  hobbies: ['reading', 'coding']
};

const obj3 = {
  name: 'John',
  age: 30,
  address: {
    street: '123 Main St',
    city: 'Different City' // Different value
  },
  hobbies: ['reading', 'coding']
};

// Test basic comparison
console.log('obj1 === obj2:', obj1 === obj2); // false (different references)
console.log('deepEqual(obj1, obj2):', deepEqualBasic(obj1, obj2)); // true
console.log('deepEqual(obj1, obj3):', deepEqualBasic(obj1, obj3)); // false

// Test with different types
console.log('deepEqual(1, "1"):', deepEqualBasic(1, "1")); // false
console.log('deepEqual([1,2], [1,2]):', deepEqualBasic([1,2], [1,2])); // true

// Test enhanced version with dates and regex
const dateObj1 = { created: new Date('2023-01-01'), pattern: /test/gi };
const dateObj2 = { created: new Date('2023-01-01'), pattern: /test/gi };
const dateObj3 = { created: new Date('2023-01-02'), pattern: /test/gi };

console.log('\n--- Enhanced Comparison ---');
console.log('Date objects equal:', deepEqualEnhanced(dateObj1, dateObj2)); // true
console.log('Different dates:', deepEqualEnhanced(dateObj1, dateObj3)); // false

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Form State Comparison
 * Compare form states to detect changes for save prompts
 */
function createFormStateManager() {
  let initialState = null;
  let currentState = null;
  
  return {
    // Initialize form state
    initialize(state) {
      initialState = JSON.parse(JSON.stringify(state)); // Deep copy
      currentState = JSON.parse(JSON.stringify(state));
    },
    
    // Update current state
    updateField(field, value) {
      currentState = { ...currentState, [field]: value };
    },
    
    // Check if form has unsaved changes
    hasUnsavedChanges() {
      return !deepEqualBasic(initialState, currentState);
    },
    
    // Get changed fields
    getChangedFields() {
      const changes = {};
      
      function findChanges(initial, current, path = '') {
        if (!deepEqualBasic(initial, current)) {
          if (typeof initial !== 'object' || typeof current !== 'object') {
            changes[path] = { from: initial, to: current };
          } else if (Array.isArray(initial) && Array.isArray(current)) {
            changes[path] = { from: initial, to: current };
          } else {
            // Recurse for objects
            const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
            for (const key of allKeys) {
              const newPath = path ? `${path}.${key}` : key;
              findChanges(initial?.[key], current?.[key], newPath);
            }
          }
        }
      }
      
      findChanges(initialState, currentState);
      return changes;
    },
    
    // Save current state as initial (commit changes)
    save() {
      initialState = JSON.parse(JSON.stringify(currentState));
    },
    
    // Revert to initial state
    revert() {
      currentState = JSON.parse(JSON.stringify(initialState));
    }
  };
}

/**
 * Use Case 2: Cache Key Generation
 * Generate cache keys based on deep equality of parameters
 */
function createCacheKeyManager() {
  const cache = new Map();
  
  return {
    // Generate stable cache key from parameters
    generateKey(params) {
      // Convert to sorted JSON for consistent keys
      function sortedStringify(obj) {
        if (typeof obj !== 'object' || obj === null) {
          return JSON.stringify(obj);
        }
        
        if (Array.isArray(obj)) {
          return '[' + obj.map(sortedStringify).join(',') + ']';
        }
        
        const keys = Object.keys(obj).sort();
        const pairs = keys.map(key => `"${key}":${sortedStringify(obj[key])}`);
        return '{' + pairs.join(',') + '}';
      }
      
      return sortedStringify(params);
    },
    
    // Get from cache or compute
    getOrCompute(params, computeFn) {
      const key = this.generateKey(params);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = computeFn(params);
      cache.set(key, result);
      return result;
    },
    
    // Check if equivalent params exist in cache
    hasEquivalent(params) {
      const targetKey = this.generateKey(params);
      return cache.has(targetKey);
    },
    
    // Clear cache
    clear() {
      cache.clear();
    },
    
    // Get cache stats
    getStats() {
      return {
        size: cache.size,
        keys: Array.from(cache.keys())
      };
    }
  };
}

/**
 * Use Case 3: Object Diff Generator
 * Generate detailed diff between two objects
 */
function createObjectDiffer() {
  return {
    // Generate diff between two objects
    diff(oldObj, newObj) {
      const changes = [];
      
      function compareObjects(old, current, path = '') {
        // Handle null/undefined
        if (old == null && current == null) return;
        if (old == null) {
          changes.push({ path, type: 'added', value: current });
          return;
        }
        if (current == null) {
          changes.push({ path, type: 'removed', value: old });
          return;
        }
        
        // Handle different types
        if (typeof old !== typeof current) {
          changes.push({ path, type: 'changed', oldValue: old, newValue: current });
          return;
        }
        
        // Handle primitives
        if (typeof old !== 'object') {
          if (old !== current) {
            changes.push({ path, type: 'changed', oldValue: old, newValue: current });
          }
          return;
        }
        
        // Handle arrays
        if (Array.isArray(old) && Array.isArray(current)) {
          const maxLength = Math.max(old.length, current.length);
          
          for (let i = 0; i < maxLength; i++) {
            const itemPath = path ? `${path}[${i}]` : `[${i}]`;
            
            if (i >= old.length) {
              changes.push({ path: itemPath, type: 'added', value: current[i] });
            } else if (i >= current.length) {
              changes.push({ path: itemPath, type: 'removed', value: old[i] });
            } else {
              compareObjects(old[i], current[i], itemPath);
            }
          }
          return;
        }
        
        // Handle objects
        const allKeys = new Set([...Object.keys(old), ...Object.keys(current)]);
        
        for (const key of allKeys) {
          const keyPath = path ? `${path}.${key}` : key;
          
          if (!(key in old)) {
            changes.push({ path: keyPath, type: 'added', value: current[key] });
          } else if (!(key in current)) {
            changes.push({ path: keyPath, type: 'removed', value: old[key] });
          } else {
            compareObjects(old[key], current[key], keyPath);
          }
        }
      }
      
      compareObjects(oldObj, newObj);
      return changes;
    },
    
    // Apply diff to an object
    applyDiff(obj, diff) {
      const result = JSON.parse(JSON.stringify(obj)); // Deep copy
      
      for (const change of diff) {
        const pathParts = change.path.split(/[.\[\]]/).filter(Boolean);
        let current = result;
        
        // Navigate to parent
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          const isArrayIndex = /^\d+$/.test(part);
          
          if (isArrayIndex) {
            const index = parseInt(part, 10);
            if (!Array.isArray(current)) current = [];
            current = current[index];
          } else {
            if (typeof current !== 'object') current = {};
            current = current[part];
          }
        }
        
        // Apply change
        const lastKey = pathParts[pathParts.length - 1];
        
        switch (change.type) {
          case 'added':
          case 'changed':
            current[lastKey] = change.value || change.newValue;
            break;
          case 'removed':
            delete current[lastKey];
            break;
        }
      }
      
      return result;
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Form state manager
const formManager = createFormStateManager();
formManager.initialize({ name: 'John', email: 'john@example.com' });
formManager.updateField('name', 'Jane');
console.log('Has unsaved changes:', formManager.hasUnsavedChanges());
console.log('Changed fields:', formManager.getChangedFields());

// Cache key manager
const cacheManager = createCacheKeyManager();
const params1 = { userId: 123, filters: { active: true } };
const params2 = { filters: { active: true }, userId: 123 }; // Different order
console.log('Same cache key:', cacheManager.generateKey(params1) === cacheManager.generateKey(params2));

// Object differ
const differ = createObjectDiffer();
const diff = differ.diff(
  { name: 'John', age: 30, hobbies: ['reading'] },
  { name: 'Jane', age: 30, hobbies: ['reading', 'coding'], city: 'NYC' }
);
console.log('Object diff:', diff);

// Export all implementations
module.exports = {
  deepEqualBasic,
  deepEqualEnhanced,
  deepEqualWithCircular,
  deepEqualOptimized,
  deepEqualConfigurable,
  createFormStateManager,
  createCacheKeyManager,
  createObjectDiffer
};

/**
 * Key Interview Points:
 * 
 * 1. Shallow vs Deep Equality:
 *    - Shallow: Only compares top-level properties
 *    - Deep: Recursively compares all nested properties
 * 
 * 2. Edge Cases to Handle:
 *    - Circular references (infinite recursion)
 *    - Different object types (Date, RegExp, Array)
 *    - null vs undefined vs missing properties
 *    - NaN comparisons (NaN !== NaN)
 * 
 * 3. Performance Considerations:
 *    - Early exits (reference equality, type checking)
 *    - Memoization for repeated comparisons
 *    - Avoiding unnecessary deep copying
 * 
 * 4. Real-world Applications:
 *    - React shouldComponentUpdate optimizations
 *    - Redux state change detection
 *    - Form dirty state tracking
 *    - API response caching
 * 
 * 5. Alternative Approaches:
 *    - JSON.stringify comparison (unreliable due to key order)
 *    - Lodash isEqual (handles most edge cases)
 *    - Immutable data structures (structural sharing)
 */