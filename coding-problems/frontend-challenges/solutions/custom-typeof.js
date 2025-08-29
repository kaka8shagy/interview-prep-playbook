/**
 * File: custom-typeof.js
 * Description: Enhanced typeof implementations with detailed type detection
 * 
 * Learning objectives:
 * - Understand JavaScript type system and quirks
 * - Learn Object.prototype.toString technique
 * - Handle edge cases and cross-frame objects
 * 
 * Time Complexity: O(1) for most checks, O(n) for complex object analysis
 * Space Complexity: O(1)
 */

// =======================
// Approach 1: Enhanced typeof with Native Quirks Fixed
// =======================

/**
 * Basic enhanced typeof that fixes common issues with native typeof
 * Handles the main quirks: null, arrays, and dates
 * 
 * Mental model: Native typeof has several known issues:
 * - typeof null === 'object' (should be 'null')
 * - typeof [] === 'object' (should be 'array')
 * - typeof new Date() === 'object' (should be 'date')
 */
function typeofEnhanced(value) {
  // Handle the null special case first
  // This is the most famous typeof quirk in JavaScript
  if (value === null) {
    return 'null';
  }
  
  // Get the native typeof result
  const nativeType = typeof value;
  
  // For non-objects, native typeof is usually correct
  if (nativeType !== 'object') {
    return nativeType;
  }
  
  // Handle common object subtypes
  if (Array.isArray(value)) {
    return 'array';
  }
  
  if (value instanceof Date) {
    return 'date';
  }
  
  if (value instanceof RegExp) {
    return 'regexp';
  }
  
  // For plain objects and other object types, return 'object'
  return 'object';
}

// =======================
// Approach 2: Comprehensive Type Detection
// =======================

/**
 * Comprehensive type detection using Object.prototype.toString
 * This is the most reliable method for type detection in JavaScript
 * 
 * Object.prototype.toString returns strings like:
 * - "[object Object]" for plain objects
 * - "[object Array]" for arrays
 * - "[object Date]" for dates
 * - etc.
 */
function getType(value) {
  // Handle primitives that don't have toString method
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  // Use Object.prototype.toString for most reliable type detection
  // This works even for objects from different frames/contexts
  const objectString = Object.prototype.toString.call(value);
  
  // Extract type from format "[object Type]"
  const type = objectString.slice(8, -1).toLowerCase();
  
  // Map some types to more common names
  const typeMap = {
    'object': 'object',
    'array': 'array',
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'function': 'function',
    'date': 'date',
    'regexp': 'regexp',
    'error': 'error',
    'math': 'math',
    'json': 'json',
    'arguments': 'arguments',
    'htmldocument': 'document',
    'htmlelement': 'element',
    'nodelist': 'nodelist'
  };
  
  return typeMap[type] || type;
}

// =======================
// Approach 3: Detailed Type Analysis
// =======================

/**
 * Most comprehensive type analysis with detailed information
 * Returns an object with multiple type classifications
 * 
 * Useful for debugging and understanding exactly what you're dealing with
 */
function analyzeType(value) {
  const analysis = {
    value: value,
    nativeType: typeof value,
    constructorName: null,
    prototype: null,
    objectString: null,
    isNullish: false,
    isPrimitive: false,
    isObject: false,
    isIterable: false,
    isCallable: false,
    detectedType: null
  };
  
  // Check for nullish values
  analysis.isNullish = value == null;
  
  if (analysis.isNullish) {
    analysis.detectedType = value === null ? 'null' : 'undefined';
    analysis.isPrimitive = true;
    return analysis;
  }
  
  // Get object string representation
  analysis.objectString = Object.prototype.toString.call(value);
  
  // Check if value is primitive
  const primitiveTypes = ['string', 'number', 'boolean', 'symbol', 'bigint'];
  analysis.isPrimitive = primitiveTypes.includes(analysis.nativeType);
  
  // For objects, get additional information
  if (!analysis.isPrimitive) {
    analysis.isObject = true;
    
    // Get constructor information
    if (value.constructor) {
      analysis.constructorName = value.constructor.name;
    }
    
    // Get prototype information
    analysis.prototype = Object.getPrototypeOf(value);
    
    // Check if object is iterable
    analysis.isIterable = value != null && typeof value[Symbol.iterator] === 'function';
    
    // Check if object is callable
    analysis.isCallable = typeof value === 'function';
  }
  
  // Determine detailed type
  analysis.detectedType = getDetailedType(value, analysis);
  
  return analysis;
}

/**
 * Helper function to determine detailed type based on analysis
 */
function getDetailedType(value, analysis) {
  if (analysis.isPrimitive) {
    return analysis.nativeType;
  }
  
  // Special object type detection
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  if (value instanceof Error) return 'error';
  if (value instanceof Map) return 'map';
  if (value instanceof Set) return 'set';
  if (value instanceof WeakMap) return 'weakmap';
  if (value instanceof WeakSet) return 'weakset';
  if (value instanceof Promise) return 'promise';
  if (value instanceof ArrayBuffer) return 'arraybuffer';
  
  // Check for typed arrays
  const typedArrayTypes = [
    'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
    'Int16Array', 'Uint16Array',
    'Int32Array', 'Uint32Array',
    'Float32Array', 'Float64Array',
    'BigInt64Array', 'BigUint64Array'
  ];
  
  if (analysis.constructorName && typedArrayTypes.includes(analysis.constructorName)) {
    return analysis.constructorName.toLowerCase();
  }
  
  // Check for DOM elements
  if (typeof window !== 'undefined') {
    if (value instanceof Element) return 'element';
    if (value instanceof Document) return 'document';
    if (value instanceof NodeList) return 'nodelist';
    if (value instanceof HTMLCollection) return 'htmlcollection';
  }
  
  // Check for generator functions and iterators
  if (analysis.constructorName === 'GeneratorFunction') return 'generatorfunction';
  if (analysis.constructorName === 'AsyncFunction') return 'asyncfunction';
  
  // Check for plain objects
  if (isPlainObject(value)) return 'plainobject';
  
  // Default to function or object
  return analysis.nativeType === 'function' ? 'function' : 'object';
}

/**
 * Check if object is a plain object (created with {} or new Object())
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Objects without prototype (created with Object.create(null))
  const proto = Object.getPrototypeOf(obj);
  if (proto === null) return true;
  
  // Objects with Object.prototype as direct prototype
  return proto === Object.prototype;
}

// =======================
// Approach 4: Type Guards and Predicates
// =======================

/**
 * Collection of type checking predicates for common use cases
 * These are optimized for performance and readability
 */
const TypeCheckers = {
  // Primitive type checkers
  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number' && !Number.isNaN(value),
  isInteger: (value) => Number.isInteger(value),
  isBoolean: (value) => typeof value === 'boolean',
  isSymbol: (value) => typeof value === 'symbol',
  isBigInt: (value) => typeof value === 'bigint',
  isFunction: (value) => typeof value === 'function',
  
  // Nullish checkers
  isNull: (value) => value === null,
  isUndefined: (value) => value === undefined,
  isNullish: (value) => value == null,
  
  // Object type checkers
  isObject: (value) => typeof value === 'object' && value !== null,
  isPlainObject: isPlainObject,
  isArray: Array.isArray,
  isDate: (value) => value instanceof Date,
  isRegExp: (value) => value instanceof RegExp,
  isError: (value) => value instanceof Error,
  
  // Collection checkers
  isMap: (value) => value instanceof Map,
  isSet: (value) => value instanceof Set,
  isWeakMap: (value) => value instanceof WeakMap,
  isWeakSet: (value) => value instanceof WeakSet,
  
  // Async checkers
  isPromise: (value) => value instanceof Promise || (
    value !== null && 
    typeof value === 'object' && 
    typeof value.then === 'function'
  ),
  
  // Iterable checkers
  isIterable: (value) => value != null && typeof value[Symbol.iterator] === 'function',
  isArrayLike: (value) => 
    value != null && 
    typeof value.length === 'number' && 
    value.length >= 0 && 
    value.length <= Number.MAX_SAFE_INTEGER,
  
  // Number validation
  isFiniteNumber: (value) => typeof value === 'number' && Number.isFinite(value),
  isPositiveNumber: (value) => typeof value === 'number' && value > 0,
  isNonNegativeNumber: (value) => typeof value === 'number' && value >= 0,
  
  // String validation
  isNonEmptyString: (value) => typeof value === 'string' && value.length > 0,
  isEmptyString: (value) => typeof value === 'string' && value.length === 0,
  
  // Advanced type checkers
  isClass: (value) => {
    if (typeof value !== 'function') return false;
    // Check if function has a prototype with constructor
    return value.prototype && value.prototype.constructor === value;
  },
  
  isAsyncFunction: (value) => 
    Object.prototype.toString.call(value) === '[object AsyncFunction]',
  
  isGeneratorFunction: (value) => 
    Object.prototype.toString.call(value) === '[object GeneratorFunction]',
  
  // DOM checkers (safe for non-browser environments)
  isElement: (value) => {
    try {
      return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
    } catch {
      return false;
    }
  },
  
  isDocument: (value) => {
    try {
      return typeof Document !== 'undefined' && value instanceof Document;
    } catch {
      return false;
    }
  }
};

// =======================
// Approach 5: Type Coercion Helpers
// =======================

/**
 * Collection of type coercion utilities that safely convert between types
 * These handle edge cases and provide fallback values
 */
const TypeCoercion = {
  /**
   * Convert to string with fallback
   */
  toString: (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    
    try {
      return String(value);
    } catch {
      return fallback;
    }
  },
  
  /**
   * Convert to number with validation
   */
  toNumber: (value, fallback = 0) => {
    if (typeof value === 'number') return Number.isNaN(value) ? fallback : value;
    
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  },
  
  /**
   * Convert to integer
   */
  toInteger: (value, fallback = 0) => {
    const num = TypeCoercion.toNumber(value, fallback);
    return Math.floor(Math.abs(num)) * (num < 0 ? -1 : 1);
  },
  
  /**
   * Convert to boolean with custom truthy logic
   */
  toBoolean: (value) => {
    // JavaScript falsy values: false, 0, -0, '', null, undefined, NaN
    if (!value) return false;
    
    // String 'false' should be false
    if (typeof value === 'string' && value.toLowerCase() === 'false') return false;
    
    // String '0' should be false
    if (typeof value === 'string' && value === '0') return false;
    
    // Everything else is truthy
    return true;
  },
  
  /**
   * Convert to array
   */
  toArray: (value) => {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) return value;
    if (TypeCheckers.isArrayLike(value)) return Array.from(value);
    if (TypeCheckers.isIterable(value)) return Array.from(value);
    
    return [value];
  },
  
  /**
   * Convert to object
   */
  toObject: (value) => {
    if (value === null || value === undefined) return {};
    if (typeof value === 'object') return value;
    
    // Convert primitives to object form
    return Object(value);
  }
};

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic typeof Enhancement ===');

const testValues = [
  null,
  undefined,
  true,
  42,
  'hello',
  [],
  {},
  new Date(),
  /regex/,
  function() {},
  Symbol('sym'),
  BigInt(123)
];

testValues.forEach(value => {
  console.log(`Value: ${String(value)}`);
  console.log(`Native typeof: ${typeof value}`);
  console.log(`Enhanced typeof: ${typeofEnhanced(value)}`);
  console.log(`Comprehensive type: ${getType(value)}`);
  console.log('---');
});

console.log('\n=== Comprehensive Type Analysis ===');

const complexValue = new Map([['key', 'value']]);
const analysis = analyzeType(complexValue);
console.log('Map analysis:', analysis);

const promiseValue = Promise.resolve(42);
const promiseAnalysis = analyzeType(promiseValue);
console.log('Promise analysis:', promiseAnalysis);

console.log('\n=== Type Checker Examples ===');

console.log('Is "hello" a string?', TypeCheckers.isString('hello'));
console.log('Is [] an array?', TypeCheckers.isArray([]));
console.log('Is {} a plain object?', TypeCheckers.isPlainObject({}));
console.log('Is new Date() a plain object?', TypeCheckers.isPlainObject(new Date()));
console.log('Is async function detected?', TypeCheckers.isAsyncFunction(async () => {}));

// Test array-like objects
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
console.log('Is array-like object detected?', TypeCheckers.isArrayLike(arrayLike));

console.log('\n=== Type Coercion Examples ===');

console.log('String coercion:', TypeCoercion.toString(42)); // '42'
console.log('Number coercion:', TypeCoercion.toNumber('123.45')); // 123.45
console.log('Boolean coercion:', TypeCoercion.toBoolean('false')); // false
console.log('Array coercion:', TypeCoercion.toArray('hello')); // ['hello']

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: API parameter validation
 * Validate and coerce API parameters to expected types
 */
function validateAPIParameters(params, schema) {
  const validated = {};
  const errors = [];
  
  for (const [key, config] of Object.entries(schema)) {
    const value = params[key];
    const { type, required = false, defaultValue } = config;
    
    // Check required parameters
    if (required && TypeCheckers.isNullish(value)) {
      errors.push(`Parameter '${key}' is required`);
      continue;
    }
    
    // Use default value if provided
    if (TypeCheckers.isNullish(value) && defaultValue !== undefined) {
      validated[key] = defaultValue;
      continue;
    }
    
    // Skip optional nullish values
    if (TypeCheckers.isNullish(value)) {
      continue;
    }
    
    // Validate and coerce type
    try {
      switch (type) {
        case 'string':
          if (!TypeCheckers.isString(value)) {
            validated[key] = TypeCoercion.toString(value);
          } else {
            validated[key] = value;
          }
          break;
          
        case 'number':
          if (!TypeCheckers.isNumber(value)) {
            const coerced = TypeCoercion.toNumber(value);
            if (coerced === 0 && value !== '0' && value !== 0) {
              errors.push(`Parameter '${key}' must be a valid number`);
            } else {
              validated[key] = coerced;
            }
          } else {
            validated[key] = value;
          }
          break;
          
        case 'boolean':
          validated[key] = TypeCoercion.toBoolean(value);
          break;
          
        case 'array':
          validated[key] = TypeCoercion.toArray(value);
          break;
          
        default:
          validated[key] = value;
      }
    } catch (error) {
      errors.push(`Parameter '${key}' validation failed: ${error.message}`);
    }
  }
  
  return { validated, errors };
}

// Example usage
const apiParams = {
  name: 'John',
  age: '30',
  active: 'true',
  tags: 'javascript,node'
};

const schema = {
  name: { type: 'string', required: true },
  age: { type: 'number', required: true },
  active: { type: 'boolean', defaultValue: false },
  tags: { type: 'array' },
  limit: { type: 'number', defaultValue: 10 }
};

const result = validateAPIParameters(apiParams, schema);
console.log('\nAPI Validation Result:', result);

/**
 * Use Case 2: Safe property access with type checking
 * Safely access nested object properties with type validation
 */
function safeGet(obj, path, expectedType = null, defaultValue = null) {
  if (!TypeCheckers.isObject(obj) || !TypeCheckers.isString(path)) {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (!TypeCheckers.isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  // Type validation if expected type provided
  if (expectedType) {
    const actualType = getType(current);
    if (actualType !== expectedType) {
      console.warn(`Expected ${expectedType}, got ${actualType} for path '${path}'`);
      return defaultValue;
    }
  }
  
  return current;
}

// Example usage
const userData = {
  user: {
    profile: {
      name: 'Alice',
      age: 30,
      preferences: {
        theme: 'dark',
        notifications: true
      }
    }
  }
};

console.log('\nSafe property access:');
console.log('Name:', safeGet(userData, 'user.profile.name', 'string', 'Unknown'));
console.log('Age:', safeGet(userData, 'user.profile.age', 'number', 0));
console.log('Missing:', safeGet(userData, 'user.profile.email', 'string', 'N/A'));

/**
 * Use Case 3: Dynamic function parameter handling
 * Handle functions that accept multiple parameter formats
 */
function flexibleFunction(...args) {
  // Handle different calling patterns:
  // flexibleFunction(callback)
  // flexibleFunction(options, callback)  
  // flexibleFunction(string, options, callback)
  
  let stringParam = null;
  let options = {};
  let callback = null;
  
  // Parse arguments based on types
  for (const arg of args) {
    const type = getType(arg);
    
    if (type === 'function' && !callback) {
      callback = arg;
    } else if (type === 'object' && !TypeCheckers.isArray(arg)) {
      options = { ...options, ...arg };
    } else if (type === 'string') {
      stringParam = arg;
    }
  }
  
  console.log('Parsed parameters:', { stringParam, options, callback });
  
  // Execute with parsed parameters
  if (callback) {
    callback({ stringParam, options });
  }
}

// Test different calling patterns
console.log('\nFlexible function calls:');
flexibleFunction(() => console.log('Just callback'));
flexibleFunction({ timeout: 1000 }, (params) => console.log('Options + callback:', params));
flexibleFunction('test', { retry: 3 }, (params) => console.log('String + options + callback:', params));

// Export all utilities
module.exports = {
  typeofEnhanced,
  getType,
  analyzeType,
  isPlainObject,
  TypeCheckers,
  TypeCoercion,
  validateAPIParameters,
  safeGet,
  flexibleFunction
};

/**
 * Key Interview Points:
 * 
 * 1. Native typeof Limitations:
 *    - typeof null === 'object' (historical bug)
 *    - Arrays, dates, regexps all return 'object'
 *    - Functions return 'function' but are objects
 *    - typeof doesn't distinguish object subtypes
 * 
 * 2. Object.prototype.toString Technique:
 *    - Most reliable method for type detection
 *    - Works across frames and contexts
 *    - Returns detailed type information
 *    - Format: "[object Type]"
 * 
 * 3. Type Detection Strategies:
 *    - instanceof checks: Limited by prototype chain
 *    - constructor.name: Can be changed or undefined
 *    - Array.isArray(): Special case for arrays
 *    - Duck typing: Check for expected properties/methods
 * 
 * 4. Edge Cases to Consider:
 *    - Cross-frame objects (iframe, web workers)
 *    - Objects with null prototype (Object.create(null))
 *    - Boxed primitives (new String(), new Number())
 *    - Symbol.toStringTag customization
 * 
 * 5. Performance Considerations:
 *    - typeof is fastest for primitives
 *    - instanceof requires prototype chain traversal
 *    - Object.prototype.toString has function call overhead
 *    - Cache results for repeated type checking
 */