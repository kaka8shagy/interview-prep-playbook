/**
 * File: interview-problems.js
 * Description: Common Proxy/Reflect interview questions with detailed solutions
 * Time Complexity: Various based on problem
 * Space Complexity: Various based on problem
 */

// Problem 1: Implement a negative array indexing system
// Question: Create a proxy that allows negative indexing (like Python)
// Example: arr[-1] should return the last element

function createNegativeIndexArray(arr) {
  return new Proxy(arr, {
    get(target, property) {
      // Handle numeric string properties for negative indexing
      if (typeof property === 'string' && /^-?\d+$/.test(property)) {
        const index = parseInt(property);
        
        // For negative indices, convert to positive equivalent
        if (index < 0) {
          const actualIndex = target.length + index;
          // Ensure the calculated index is valid
          if (actualIndex >= 0 && actualIndex < target.length) {
            return target[actualIndex];
          }
          return undefined; // Out of bounds
        }
      }
      
      // For all other properties (methods, symbols, etc.), return normally
      return Reflect.get(target, property);
    },
    
    set(target, property, value) {
      // Handle negative indexing for setting values too
      if (typeof property === 'string' && /^-?\d+$/.test(property)) {
        const index = parseInt(property);
        
        if (index < 0) {
          const actualIndex = target.length + index;
          if (actualIndex >= 0 && actualIndex < target.length) {
            target[actualIndex] = value;
            return true;
          }
          return false; // Invalid index
        }
      }
      
      return Reflect.set(target, property, value);
    }
  });
}

// Test negative indexing
const arr = createNegativeIndexArray([1, 2, 3, 4, 5]);
console.log('Last element:', arr[-1]); // 5
console.log('Second last:', arr[-2]); // 4
console.log('Out of bounds:', arr[-10]); // undefined
arr[-1] = 99;
console.log('Modified array:', arr); // [1, 2, 3, 4, 99]

// Problem 2: Create a case-insensitive object
// Question: Implement an object where property access is case-insensitive
// Challenge: Handle both getting and setting of properties

function createCaseInsensitiveObject(initialData = {}) {
  // Store actual data with original casing as keys and lowercase keys for lookup
  const data = { ...initialData };
  const keyMap = new Map(); // Maps lowercase keys to original keys
  
  // Initialize key mapping
  Object.keys(data).forEach(key => {
    keyMap.set(key.toLowerCase(), key);
  });
  
  return new Proxy(data, {
    get(target, property) {
      if (typeof property === 'string') {
        const lowerProp = property.toLowerCase();
        const actualKey = keyMap.get(lowerProp);
        
        if (actualKey !== undefined) {
          return target[actualKey];
        }
      }
      
      // Return undefined for non-existent properties
      // Don't use Reflect.get here as we want case-insensitive behavior
      return undefined;
    },
    
    set(target, property, value) {
      if (typeof property === 'string') {
        const lowerProp = property.toLowerCase();
        const existingKey = keyMap.get(lowerProp);
        
        if (existingKey !== undefined) {
          // Update existing property (maintain original casing)
          target[existingKey] = value;
        } else {
          // Create new property with provided casing
          target[property] = value;
          keyMap.set(lowerProp, property);
        }
        return true;
      }
      
      return Reflect.set(target, property, value);
    },
    
    has(target, property) {
      if (typeof property === 'string') {
        return keyMap.has(property.toLowerCase());
      }
      return Reflect.has(target, property);
    },
    
    deleteProperty(target, property) {
      if (typeof property === 'string') {
        const lowerProp = property.toLowerCase();
        const actualKey = keyMap.get(lowerProp);
        
        if (actualKey !== undefined) {
          delete target[actualKey];
          keyMap.delete(lowerProp);
          return true;
        }
      }
      
      return false;
    },
    
    ownKeys(target) {
      // Return the actual keys from the target object
      return Reflect.ownKeys(target);
    }
  });
}

// Test case-insensitive object
const user = createCaseInsensitiveObject({ Name: 'John', AGE: 30 });
console.log(user.name); // 'John' (accessing with different case)
console.log(user.Age); // 30
user.EMAIL = 'john@example.com'; // Setting with different case
console.log(user.email); // 'john@example.com'
console.log('name' in user); // true
console.log(Object.keys(user)); // ['Name', 'AGE', 'EMAIL'] (original casing preserved)

// Problem 3: Implement method call logging and performance monitoring
// Question: Create a proxy that logs all method calls with execution time
// Follow-up: Add caching for expensive method calls

function createLoggingProxy(target, options = {}) {
  const { 
    logCalls = true, 
    logPerformance = true, 
    enableCaching = false,
    cacheExpiry = 60000 // 1 minute
  } = options;
  
  const methodCache = new Map();
  const callStats = new Map(); // Track call frequency and performance
  
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      
      // Only wrap functions
      if (typeof value !== 'function') {
        return value;
      }
      
      return function(...args) {
        const methodName = `${obj.constructor.name}.${prop}`;
        const startTime = Date.now();
        
        // Generate cache key if caching is enabled
        let cacheKey = null;
        if (enableCaching) {
          cacheKey = `${methodName}-${JSON.stringify(args)}`;
          
          if (methodCache.has(cacheKey)) {
            const cached = methodCache.get(cacheKey);
            if (Date.now() - cached.timestamp < cacheExpiry) {
              if (logCalls) {
                console.log(`[CACHED] ${methodName}(${args.length} args)`);
              }
              return cached.result;
            } else {
              // Remove expired cache entry
              methodCache.delete(cacheKey);
            }
          }
        }
        
        if (logCalls) {
          console.log(`[CALL] ${methodName}(${JSON.stringify(args)})`);
        }
        
        try {
          // Execute the original method
          const result = value.apply(this, args);
          const executionTime = Date.now() - startTime;
          
          // Update statistics
          if (!callStats.has(methodName)) {
            callStats.set(methodName, {
              callCount: 0,
              totalTime: 0,
              averageTime: 0,
              minTime: Infinity,
              maxTime: 0
            });
          }
          
          const stats = callStats.get(methodName);
          stats.callCount++;
          stats.totalTime += executionTime;
          stats.averageTime = stats.totalTime / stats.callCount;
          stats.minTime = Math.min(stats.minTime, executionTime);
          stats.maxTime = Math.max(stats.maxTime, executionTime);
          
          if (logPerformance) {
            console.log(`[PERF] ${methodName} executed in ${executionTime}ms`);
          }
          
          // Cache result if enabled
          if (enableCaching && cacheKey) {
            methodCache.set(cacheKey, {
              result,
              timestamp: Date.now()
            });
          }
          
          return result;
        } catch (error) {
          const executionTime = Date.now() - startTime;
          console.error(`[ERROR] ${methodName} failed after ${executionTime}ms:`, error.message);
          throw error;
        }
      };
    }
  });
}

// Example class to test logging proxy
class DataProcessor {
  processData(data) {
    // Simulate some processing time
    const start = Date.now();
    while (Date.now() - start < 100) {} // Busy wait for 100ms
    
    return data.map(x => x * 2);
  }
  
  expensiveCalculation(n) {
    // Simulate expensive calculation
    const start = Date.now();
    while (Date.now() - start < 500) {} // Busy wait for 500ms
    
    return n * n;
  }
}

// Test logging proxy
const processor = createLoggingProxy(new DataProcessor(), {
  logCalls: true,
  logPerformance: true,
  enableCaching: true
});

processor.processData([1, 2, 3]);
processor.expensiveCalculation(10);
processor.expensiveCalculation(10); // Should be cached

// Problem 4: Implement a type-safe object with runtime validation
// Question: Create a proxy that enforces TypeScript-like type checking at runtime
// Challenge: Handle nested objects and arrays

function createTypedObject(schema) {
  function validateType(value, expectedType, path = '') {
    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          throw new TypeError(`Expected string at ${path}, got ${typeof value}`);
        }
        break;
      
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new TypeError(`Expected number at ${path}, got ${typeof value}`);
        }
        break;
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new TypeError(`Expected boolean at ${path}, got ${typeof value}`);
        }
        break;
      
      case 'array':
        if (!Array.isArray(value)) {
          throw new TypeError(`Expected array at ${path}, got ${typeof value}`);
        }
        break;
      
      default:
        // Handle object schemas
        if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
          if (typeof value !== 'object' || value === null) {
            throw new TypeError(`Expected object at ${path}, got ${typeof value}`);
          }
          
          // Validate nested properties
          for (const [key, nestedType] of Object.entries(expectedType)) {
            if (value[key] !== undefined) {
              validateType(value[key], nestedType, `${path}.${key}`);
            }
          }
        }
        // Handle array of specific type
        else if (Array.isArray(expectedType) && expectedType.length === 1) {
          if (!Array.isArray(value)) {
            throw new TypeError(`Expected array at ${path}, got ${typeof value}`);
          }
          
          value.forEach((item, index) => {
            validateType(item, expectedType[0], `${path}[${index}]`);
          });
        }
    }
  }
  
  const data = {};
  
  return new Proxy(data, {
    set(target, property, value) {
      const expectedType = schema[property];
      
      if (expectedType) {
        try {
          validateType(value, expectedType, property);
        } catch (error) {
          console.error(`Type validation failed for property '${property}':`, error.message);
          return false; // Reject the assignment
        }
      }
      
      target[property] = value;
      return true;
    },
    
    get(target, property) {
      // Add type information as special methods
      if (property === '_getSchema') {
        return () => ({ ...schema });
      }
      
      if (property === '_validateAll') {
        return () => {
          for (const [key, expectedType] of Object.entries(schema)) {
            if (target[key] !== undefined) {
              validateType(target[key], expectedType, key);
            }
          }
          return true;
        };
      }
      
      return target[property];
    }
  });
}

// Test typed object
const userSchema = {
  name: 'string',
  age: 'number',
  isActive: 'boolean',
  tags: ['string'], // Array of strings
  profile: {
    bio: 'string',
    score: 'number'
  }
};

const typedUser = createTypedObject(userSchema);

try {
  typedUser.name = 'John'; // Valid
  typedUser.age = 30; // Valid
  typedUser.tags = ['developer', 'js']; // Valid
  typedUser.profile = { bio: 'Software developer', score: 95 }; // Valid
  
  console.log('Typed user created successfully:', typedUser);
  
  // This should fail
  typedUser.age = '30'; // Invalid - string instead of number
} catch (error) {
  console.error('Type error:', error.message);
}

// Problem 5: Implement a computed properties system (like Vue.js)
// Question: Create an object where some properties are computed from others
// Follow-up: Handle dependency tracking and caching

function createComputedObject(data, computed) {
  const computedCache = new Map();
  const dependencies = new Map(); // Track which properties each computed depends on
  const dependents = new Map(); // Track which computed properties depend on each property
  
  // Analyze dependencies by running computed functions with a dependency tracker
  function trackDependencies(computedKey, computedFn) {
    const deps = new Set();
    
    // Create a proxy to track property access during computation
    const tracker = new Proxy(data, {
      get(target, prop) {
        if (typeof prop === 'string') {
          deps.add(prop);
        }
        return target[prop];
      }
    });
    
    try {
      computedFn.call(tracker);
    } catch (e) {
      // Ignore errors during dependency tracking
    }
    
    dependencies.set(computedKey, deps);
    
    // Update reverse mapping
    deps.forEach(dep => {
      if (!dependents.has(dep)) {
        dependents.set(dep, new Set());
      }
      dependents.get(dep).add(computedKey);
    });
  }
  
  // Initialize dependency tracking
  Object.keys(computed).forEach(key => {
    trackDependencies(key, computed[key]);
  });
  
  return new Proxy(data, {
    get(target, property) {
      // If it's a computed property
      if (computed[property]) {
        // Check if we have a cached value
        if (computedCache.has(property)) {
          return computedCache.get(property);
        }
        
        // Compute the value
        const value = computed[property].call(target);
        computedCache.set(property, value);
        return value;
      }
      
      // Regular property
      return target[property];
    },
    
    set(target, property, value) {
      // Don't allow setting computed properties directly
      if (computed[property]) {
        throw new Error(`Cannot set computed property '${property}'`);
      }
      
      const oldValue = target[property];
      target[property] = value;
      
      // Invalidate computed properties that depend on this property
      if (dependents.has(property)) {
        dependents.get(property).forEach(computedKey => {
          computedCache.delete(computedKey);
          console.log(`Invalidated computed property '${computedKey}' due to change in '${property}'`);
        });
      }
      
      return true;
    },
    
    has(target, property) {
      return property in target || property in computed;
    },
    
    ownKeys(target) {
      return [...Object.keys(target), ...Object.keys(computed)];
    }
  });
}

// Test computed properties
const person = createComputedObject({
  firstName: 'John',
  lastName: 'Doe',
  age: 30
}, {
  // Computed properties
  fullName() {
    console.log('Computing fullName...'); // Shows when computation happens
    return `${this.firstName} ${this.lastName}`;
  },
  
  isAdult() {
    console.log('Computing isAdult...');
    return this.age >= 18;
  },
  
  displayName() {
    console.log('Computing displayName...');
    return `${this.fullName} (${this.age} years old)`;
  }
});

console.log('Full name:', person.fullName); // Computes
console.log('Full name again:', person.fullName); // Cached
console.log('Display name:', person.displayName); // Computes (depends on fullName and age)

person.firstName = 'Jane'; // This will invalidate fullName and displayName
console.log('Updated full name:', person.fullName); // Recomputes

try {
  person.fullName = 'Direct assignment'; // Should throw error
} catch (error) {
  console.error('Error:', error.message);
}

// Export all solutions for testing
module.exports = {
  createNegativeIndexArray,
  createCaseInsensitiveObject,
  createLoggingProxy,
  createTypedObject,
  createComputedObject
};