/**
 * File: object-assign.js
 * Description: Multiple implementations of Object.assign polyfill with detailed explanations
 * 
 * Learning objectives:
 * - Understand object property copying and descriptor handling
 * - Learn about enumerable vs non-enumerable properties
 * - See prototype chain traversal and symbol handling
 * 
 * Time Complexity: O(n*m) where n is number of sources, m is average properties per source
 * Space Complexity: O(1) - modifies target in place
 */

// =======================
// Approach 1: Basic Object.assign Polyfill
// =======================

/**
 * Basic Object.assign implementation
 * Covers 90% of common use cases with proper error handling
 * 
 * Mental model: Think of this as shallow property merger that
 * iterates through source objects and copies enumerable properties
 */
function objectAssignBasic(target, ...sources) {
  // Step 1: Convert target to object (handle null/undefined)
  // This matches native behavior - throws TypeError for null/undefined
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  
  // Convert primitive targets to objects (numbers, strings, booleans)
  // Example: objectAssign(3, {a: 1}) returns Number object with property a
  const targetObject = Object(target);
  
  // Step 2: Process each source object
  for (const source of sources) {
    // Skip null and undefined sources (they're ignored, not error)
    // This is different from target - sources can be null/undefined
    if (source != null) {
      // Convert source to object to handle primitives
      // Example: "abc" becomes String object with indexed properties
      const sourceObject = Object(source);
      
      // Step 3: Copy all enumerable own properties
      // Only enumerable properties are copied (not inherited ones)
      for (const key in sourceObject) {
        // hasOwnProperty check ensures we don't copy inherited properties
        // This is crucial for proper prototype chain handling
        if (sourceObject.hasOwnProperty(key)) {
          // Simple assignment - copies value and makes property enumerable/writable/configurable
          targetObject[key] = sourceObject[key];
        }
      }
    }
  }
  
  return targetObject;
}

// =======================
// Approach 2: Symbol-aware Object.assign
// =======================

/**
 * Enhanced Object.assign that handles Symbol properties
 * Symbols are special properties that need separate handling
 * 
 * Use cases: When working with libraries that use Symbol properties
 * for private or special behavior (React, Redux, etc.)
 */
function objectAssignWithSymbols(target, ...sources) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  
  const targetObject = Object(target);
  
  for (const source of sources) {
    if (source != null) {
      const sourceObject = Object(source);
      
      // Copy regular string/numeric properties
      for (const key in sourceObject) {
        if (sourceObject.hasOwnProperty(key)) {
          targetObject[key] = sourceObject[key];
        }
      }
      
      // Copy Symbol properties separately
      // Object.getOwnPropertySymbols() returns array of symbol properties
      const symbols = Object.getOwnPropertySymbols(sourceObject);
      for (const symbol of symbols) {
        // Check if symbol property is enumerable
        // Some symbols might be non-enumerable (like Symbol.iterator)
        const descriptor = Object.getOwnPropertyDescriptor(sourceObject, symbol);
        if (descriptor && descriptor.enumerable) {
          targetObject[symbol] = sourceObject[symbol];
        }
      }
    }
  }
  
  return targetObject;
}

// =======================
// Approach 3: Descriptor-aware Object.assign
// =======================

/**
 * Complete Object.assign that preserves property descriptors
 * Maintains original property attributes (writable, enumerable, configurable)
 * 
 * This is closer to the native implementation's behavior
 * Important for libraries that rely on specific property attributes
 */
function objectAssignWithDescriptors(target, ...sources) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  
  const targetObject = Object(target);
  
  for (const source of sources) {
    if (source != null) {
      const sourceObject = Object(source);
      
      // Get all property keys (strings, numbers, symbols)
      // Reflects.ownKeys() returns both string keys and symbol keys
      const keys = Reflect.ownKeys(sourceObject);
      
      for (const key of keys) {
        // Get complete property descriptor including attributes
        const descriptor = Object.getOwnPropertyDescriptor(sourceObject, key);
        
        // Only copy enumerable properties (matches native behavior)
        // Property descriptor contains: value, writable, enumerable, configurable
        if (descriptor && descriptor.enumerable) {
          // Two approaches for copying:
          
          if ('value' in descriptor) {
            // Data property - has value and writable attributes
            // Use simple assignment which creates writable, enumerable, configurable property
            targetObject[key] = descriptor.value;
          } else {
            // Accessor property - has get/set functions
            // Must preserve getter/setter behavior
            Object.defineProperty(targetObject, key, {
              get: descriptor.get,
              set: descriptor.set,
              enumerable: true,  // Force enumerable for consistency
              configurable: true // Force configurable for consistency
            });
          }
        }
      }
    }
  }
  
  return targetObject;
}

// =======================
// Approach 4: Performance-optimized Object.assign
// =======================

/**
 * Optimized Object.assign for high-performance scenarios
 * Uses direct property access when possible for better V8 optimization
 * 
 * Trade-offs: Slightly less compliant but much faster for simple objects
 */
function objectAssignOptimized(target, ...sources) {
  // Fast path for common cases - avoid Object() conversion overhead
  if (target === null || target === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  
  // Avoid Object() conversion for objects (performance optimization)
  // Only convert primitives to objects when necessary
  let targetObject = target;
  if (typeof target !== 'object' || target === null) {
    targetObject = Object(target);
  }
  
  // Process sources with optimized loops
  const sourcesLength = sources.length;
  for (let i = 0; i < sourcesLength; i++) {
    const source = sources[i];
    
    // Skip falsy sources quickly
    if (!source) continue;
    
    // Fast path for plain objects (most common case)
    if (isPlainObject(source)) {
      // Direct property enumeration - faster than hasOwnProperty checks
      for (const key in source) {
        targetObject[key] = source[key];
      }
    } else {
      // Fallback to safe approach for complex objects
      const sourceObject = Object(source);
      for (const key in sourceObject) {
        if (sourceObject.hasOwnProperty(key)) {
          targetObject[key] = sourceObject[key];
        }
      }
    }
  }
  
  return targetObject;
}

// Helper function to detect plain objects (optimization)
function isPlainObject(obj) {
  // Quick checks for performance
  if (!obj || typeof obj !== 'object') return false;
  
  // Check if object has Object.prototype as its prototype
  // Plain objects are created with {} or new Object()
  const prototype = Object.getPrototypeOf(obj);
  return prototype === null || prototype === Object.prototype;
}

// =======================
// Approach 5: Complete Polyfill with Edge Cases
// =======================

/**
 * Production-ready Object.assign polyfill
 * Handles all edge cases and matches native behavior exactly
 * 
 * Use this as a drop-in replacement for environments without Object.assign
 */
function objectAssignPolyfill(target, ...sources) {
  // Handle target conversion exactly like native implementation
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  
  // Convert target to object (handles primitives correctly)
  const to = Object(target);
  
  // Process each source with comprehensive property handling
  for (let index = 0; index < sources.length; index++) {
    const nextSource = sources[index];
    
    if (nextSource != null) {
      // Convert source to object
      const from = Object(nextSource);
      
      // Get all own property keys (including non-enumerable and symbols)
      const keys = Object.getOwnPropertyNames(from);
      const symbols = Object.getOwnPropertySymbols(from);
      
      // Process string/number keys
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        const desc = Object.getOwnPropertyDescriptor(from, key);
        
        // Only copy enumerable properties
        if (desc && desc.enumerable) {
          to[key] = from[key];
        }
      }
      
      // Process symbol keys
      for (let k = 0; k < symbols.length; k++) {
        const symbol = symbols[k];
        const desc = Object.getOwnPropertyDescriptor(from, symbol);
        
        // Only copy enumerable symbol properties
        if (desc && desc.enumerable) {
          to[symbol] = from[symbol];
        }
      }
    }
  }
  
  return to;
}

// =======================
// Polyfill Installation
// =======================

/**
 * Safe polyfill installation that doesn't override native implementation
 * Checks for existing implementation before installing
 */
function installObjectAssignPolyfill() {
  // Only install if Object.assign doesn't exist
  if (!Object.assign) {
    // Use our complete polyfill implementation
    Object.assign = objectAssignPolyfill;
    
    // Mark as polyfilled for debugging/testing
    Object.assign._isPolyfill = true;
  }
  
  return Object.assign;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Object.assign Examples ===');

// Example 1: Basic property copying
const target1 = { a: 1, b: 2 };
const source1 = { b: 3, c: 4 };
const result1 = objectAssignBasic(target1, source1);
console.log('Basic merge:', result1); // { a: 1, b: 3, c: 4 }
console.log('Target modified:', target1 === result1); // true

// Example 2: Multiple sources (last wins for conflicts)
const target2 = { a: 1 };
const source2 = { a: 2, b: 2 };
const source3 = { a: 3, c: 3 };
const result2 = objectAssignBasic(target2, source2, source3);
console.log('Multiple sources:', result2); // { a: 3, b: 2, c: 3 }

// Example 3: Primitive target conversion
const result3 = objectAssignBasic('abc', { length: 5, 0: 'x' });
console.log('String target:', result3); // String object with added properties

console.log('\n=== Symbol Properties Example ===');

// Example 4: Symbol properties
const symbolKey = Symbol('test');
const sourceWithSymbol = {
  regular: 'value',
  [symbolKey]: 'symbol value'
};

const targetWithSymbol = {};
objectAssignWithSymbols(targetWithSymbol, sourceWithSymbol);
console.log('Regular property:', targetWithSymbol.regular); // 'value'
console.log('Symbol property:', targetWithSymbol[symbolKey]); // 'symbol value'

console.log('\n=== Descriptor Preservation Example ===');

// Example 5: Property descriptors
const sourceWithDescriptor = {};
Object.defineProperty(sourceWithDescriptor, 'getter', {
  get() { return 'computed value'; },
  enumerable: true,
  configurable: true
});

const targetWithDescriptor = {};
objectAssignWithDescriptors(targetWithDescriptor, sourceWithDescriptor);
console.log('Getter property:', targetWithDescriptor.getter); // 'computed value'

// =======================
// Edge Cases and Error Handling
// =======================

console.log('\n=== Edge Cases ===');

// Test null/undefined target (should throw)
try {
  objectAssignBasic(null, { a: 1 });
} catch (error) {
  console.log('Null target error:', error.message);
}

// Test null/undefined sources (should be ignored)
const result4 = objectAssignBasic({}, null, undefined, { a: 1 });
console.log('Null sources ignored:', result4); // { a: 1 }

// Test primitive sources
const result5 = objectAssignBasic({}, 'hello', 123, true);
console.log('Primitive sources:', result5); // { '0': 'h', '1': 'e', ... }

// Test circular references (should work fine - shallow copy)
const circular1 = { name: 'circle1' };
const circular2 = { name: 'circle2', ref: circular1 };
circular1.ref = circular2;

const result6 = objectAssignBasic({}, circular1);
console.log('Circular reference copied:', result6.ref.name); // 'circle2'

// =======================
// Performance Comparison
// =======================

/**
 * Performance test between different implementations
 * Shows trade-offs between compliance and speed
 */
function performanceComparison() {
  const iterations = 100000;
  const sourceObj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
  
  // Test basic implementation
  console.time('Basic Implementation');
  for (let i = 0; i < iterations; i++) {
    objectAssignBasic({}, sourceObj);
  }
  console.timeEnd('Basic Implementation');
  
  // Test optimized implementation
  console.time('Optimized Implementation');
  for (let i = 0; i < iterations; i++) {
    objectAssignOptimized({}, sourceObj);
  }
  console.timeEnd('Optimized Implementation');
  
  // Test native implementation (if available)
  if (Object.assign && !Object.assign._isPolyfill) {
    console.time('Native Implementation');
    for (let i = 0; i < iterations; i++) {
      Object.assign({}, sourceObj);
    }
    console.timeEnd('Native Implementation');
  }
}

// Run performance comparison
setTimeout(performanceComparison, 2000);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Default options pattern
 * Common pattern in libraries and APIs
 */
function createConfig(userOptions = {}) {
  const defaultOptions = {
    timeout: 5000,
    retries: 3,
    debug: false,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Merge user options with defaults
  // Note: This is shallow merge - nested objects are replaced, not merged
  return objectAssignBasic({}, defaultOptions, userOptions);
}

const config1 = createConfig({ timeout: 10000, debug: true });
console.log('\nConfig example:', config1);

/**
 * Use Case 2: State updates in React-style patterns
 * Immutable state updates for predictable state management
 */
function updateState(currentState, updates) {
  // Create new state object without mutating original
  // This pattern is fundamental to React and Redux
  return objectAssignBasic({}, currentState, updates);
}

const initialState = { count: 0, user: null, loading: false };
const newState = updateState(initialState, { count: 1, loading: true });
console.log('State update:', newState);
console.log('Original unchanged:', initialState.count === 0); // true

/**
 * Use Case 3: Mixin pattern for object composition
 * Alternative to class inheritance using object composition
 */
const EventMixin = {
  addEventListener(event, handler) {
    this.events = this.events || {};
    this.events[event] = this.events[event] || [];
    this.events[event].push(handler);
  },
  
  removeEventListener(event, handler) {
    if (this.events && this.events[event]) {
      const index = this.events[event].indexOf(handler);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }
  },
  
  emit(event, data) {
    if (this.events && this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }
};

// Create object with event capabilities
function createEventEmitter(initialData = {}) {
  // Compose object with event capabilities
  return objectAssignBasic({}, initialData, EventMixin);
}

const emitter = createEventEmitter({ name: 'MyEmitter' });
emitter.addEventListener('test', data => console.log('Event received:', data));
emitter.emit('test', 'Hello World!');

// Export all implementations
module.exports = {
  objectAssignBasic,
  objectAssignWithSymbols,
  objectAssignWithDescriptors,
  objectAssignOptimized,
  objectAssignPolyfill,
  installObjectAssignPolyfill,
  createConfig,
  updateState,
  createEventEmitter
};

/**
 * Key Interview Points:
 * 
 * 1. Object.assign Behavior:
 *    - Shallow copy only (nested objects are shared references)
 *    - Modifies target object in place and returns it
 *    - Only enumerable own properties are copied
 *    - Symbol properties need special handling
 * 
 * 2. Property Descriptors:
 *    - Properties have attributes: writable, enumerable, configurable
 *    - Object.assign creates new properties as writable/enumerable/configurable
 *    - Getters/setters are invoked during copying, not preserved
 * 
 * 3. Error Handling:
 *    - Throws TypeError for null/undefined target
 *    - Silently ignores null/undefined sources
 *    - Converts primitives to objects
 * 
 * 4. Performance Considerations:
 *    - Enumeration is expensive for large objects
 *    - hasOwnProperty calls add overhead
 *    - Native implementation is optimized in V8/SpiderMonkey
 * 
 * 5. Common Pitfalls:
 *    - Shallow copy behavior surprises developers
 *    - Prototype properties are not copied
 *    - Non-enumerable properties are ignored
 *    - Arrays are treated as objects (indices become string keys)
 */