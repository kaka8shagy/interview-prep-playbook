/**
 * File: deep-clone.js
 * Description: Multiple implementations of deep cloning with comprehensive type support
 * 
 * Learning objectives:
 * - Understand deep vs shallow cloning
 * - Learn to handle all JavaScript types and edge cases
 * - See circular reference detection and performance optimizations
 * 
 * Time Complexity: O(n) where n is total number of properties
 * Space Complexity: O(d) where d is maximum depth (recursive), O(n) for result
 */

// =======================
// Approach 1: Basic Deep Clone
// =======================

/**
 * Basic deep clone implementation
 * Handles objects, arrays, and primitives recursively
 * 
 * Mental model: Create completely independent copy by recreating
 * every nested structure
 */
function deepCloneBasic(obj) {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle primitives (string, number, boolean, symbol, bigint)
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle RegExp objects
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  
  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneBasic(item));
  }
  
  // Handle plain Objects
  if (obj.constructor === Object || !obj.constructor) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepCloneBasic(obj[key]);
      }
    }
    return cloned;
  }
  
  // For other object types, return as-is (functions, etc.)
  return obj;
}

// =======================
// Approach 2: Comprehensive Type Support
// =======================

/**
 * Enhanced deep clone with support for all JavaScript types
 * Handles Map, Set, Buffer, and other built-in types
 */
function deepCloneEnhanced(obj, visited = new WeakMap()) {
  // Handle primitives and null/undefined
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  // Check for circular references
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  
  // Get the constructor and type
  const type = Object.prototype.toString.call(obj);
  
  let cloned;
  
  switch (type) {
    case '[object Date]':
      cloned = new Date(obj.getTime());
      break;
      
    case '[object RegExp]':
      cloned = new RegExp(obj.source, obj.flags);
      break;
      
    case '[object Array]':
      cloned = [];
      visited.set(obj, cloned); // Set early to handle circular refs
      
      for (let i = 0; i < obj.length; i++) {
        cloned[i] = deepCloneEnhanced(obj[i], visited);
      }
      break;
      
    case '[object Object]':
      // Check if it's a plain object
      if (obj.constructor === Object || !obj.constructor) {
        cloned = {};
        visited.set(obj, cloned);
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = deepCloneEnhanced(obj[key], visited);
          }
        }
      } else {
        // For objects with custom constructors, create instance
        cloned = Object.create(Object.getPrototypeOf(obj));
        visited.set(obj, cloned);
        
        // Copy own properties
        const keys = Object.getOwnPropertyNames(obj);
        for (const key of keys) {
          const descriptor = Object.getOwnPropertyDescriptor(obj, key);
          if (descriptor.value !== undefined) {
            descriptor.value = deepCloneEnhanced(descriptor.value, visited);
          }
          Object.defineProperty(cloned, key, descriptor);
        }
      }
      break;
      
    case '[object Map]':
      cloned = new Map();
      visited.set(obj, cloned);
      
      obj.forEach((value, key) => {
        cloned.set(
          deepCloneEnhanced(key, visited),
          deepCloneEnhanced(value, visited)
        );
      });
      break;
      
    case '[object Set]':
      cloned = new Set();
      visited.set(obj, cloned);
      
      obj.forEach(value => {
        cloned.add(deepCloneEnhanced(value, visited));
      });
      break;
      
    case '[object ArrayBuffer]':
      cloned = obj.slice(); // ArrayBuffer has slice method
      break;
      
    case '[object Uint8Array]':
    case '[object Uint16Array]':
    case '[object Uint32Array]':
    case '[object Int8Array]':
    case '[object Int16Array]':
    case '[object Int32Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
      // Typed arrays
      cloned = new obj.constructor(obj);
      break;
      
    case '[object Error]':
      cloned = new obj.constructor(obj.message);
      cloned.name = obj.name;
      cloned.stack = obj.stack;
      break;
      
    case '[object Function]':
      // Functions are typically not cloned, return reference
      cloned = obj;
      break;
      
    default:
      // For other types, try to create a new instance
      try {
        cloned = new obj.constructor();
        visited.set(obj, cloned);
        
        // Copy properties
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = deepCloneEnhanced(obj[key], visited);
          }
        }
      } catch (e) {
        // If we can't clone it, return the original
        cloned = obj;
      }
  }
  
  return cloned;
}

// =======================
// Approach 3: Performance Optimized
// =======================

/**
 * Performance-optimized deep clone with caching and type checking
 * Uses faster property iteration and minimal type checking
 */
function deepCloneOptimized(obj, cache = new WeakMap()) {
  // Fast path for primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Check cache for circular references
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  // Fast type detection
  const isArray = Array.isArray(obj);
  const isDate = obj instanceof Date;
  const isRegExp = obj instanceof RegExp;
  
  let cloned;
  
  if (isDate) {
    cloned = new Date(obj.getTime());
  } else if (isRegExp) {
    cloned = new RegExp(obj.source, obj.flags);
  } else if (isArray) {
    cloned = new Array(obj.length);
    cache.set(obj, cloned);
    
    // Optimized array cloning
    for (let i = 0; i < obj.length; i++) {
      cloned[i] = deepCloneOptimized(obj[i], cache);
    }
  } else {
    // Object cloning
    cloned = {};
    cache.set(obj, cloned);
    
    // Use Object.keys for better performance than for..in
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      cloned[key] = deepCloneOptimized(obj[key], cache);
    }
  }
  
  return cloned;
}

// =======================
// Approach 4: Structured Clone Algorithm Simulation
// =======================

/**
 * Implementation similar to HTML5 Structured Clone Algorithm
 * Handles more edge cases and maintains object relationships
 */
function structuredClone(obj, options = {}) {
  const { includeNonEnumerable = false, includeFunctions = false } = options;
  const visited = new WeakMap();
  
  function clone(value, path = '') {
    // Primitive values
    if (value === null || typeof value !== 'object') {
      if (typeof value === 'function' && !includeFunctions) {
        return undefined; // Functions are not cloneable by default
      }
      return value;
    }
    
    // Check for circular references
    if (visited.has(value)) {
      return visited.get(value);
    }
    
    // Get object type
    const type = Object.prototype.toString.call(value);
    let cloned;
    
    try {
      switch (type) {
        case '[object Boolean]':
        case '[object Number]':
        case '[object String]':
          cloned = new value.constructor(value.valueOf());
          break;
          
        case '[object Date]':
          cloned = new Date(value.getTime());
          break;
          
        case '[object RegExp]':
          cloned = new RegExp(value.source, value.flags);
          break;
          
        case '[object Array]':
          cloned = [];
          visited.set(value, cloned);
          
          for (let i = 0; i < value.length; i++) {
            if (i in value) { // Sparse array support
              cloned[i] = clone(value[i], `${path}[${i}]`);
            }
          }
          break;
          
        case '[object Object]':
          if (value.constructor === Object) {
            cloned = {};
          } else {
            // Try to create instance with same prototype
            cloned = Object.create(Object.getPrototypeOf(value));
          }
          
          visited.set(value, cloned);
          
          // Get property names
          const propertyNames = includeNonEnumerable 
            ? Object.getOwnPropertyNames(value)
            : Object.keys(value);
          
          for (const key of propertyNames) {
            const descriptor = Object.getOwnPropertyDescriptor(value, key);
            
            if (descriptor.value !== undefined) {
              const clonedValue = clone(descriptor.value, `${path}.${key}`);
              if (clonedValue !== undefined) {
                cloned[key] = clonedValue;
              }
            } else {
              // Handle getters/setters
              Object.defineProperty(cloned, key, descriptor);
            }
          }
          break;
          
        case '[object Map]':
          cloned = new Map();
          visited.set(value, cloned);
          
          for (const [k, v] of value) {
            const clonedKey = clone(k, `${path}.key`);
            const clonedValue = clone(v, `${path}.value`);
            cloned.set(clonedKey, clonedValue);
          }
          break;
          
        case '[object Set]':
          cloned = new Set();
          visited.set(value, cloned);
          
          for (const item of value) {
            cloned.add(clone(item, `${path}.item`));
          }
          break;
          
        case '[object ArrayBuffer]':
          cloned = value.slice(0);
          break;
          
        default:
          // For unknown types, try to clone as object
          cloned = {};
          visited.set(value, cloned);
          
          for (const key in value) {
            if (value.hasOwnProperty(key)) {
              cloned[key] = clone(value[key], `${path}.${key}`);
            }
          }
      }
    } catch (error) {
      console.warn(`Failed to clone object at path: ${path}`, error);
      return value; // Return original if cloning fails
    }
    
    return cloned;
  }
  
  return clone(obj);
}

// =======================
// Approach 5: JSON-based Clone (with limitations)
// =======================

/**
 * JSON-based cloning with pre/post processing for special types
 * Fast but limited - cannot handle functions, undefined, symbols, etc.
 */
function deepCloneJSON(obj) {
  // Handle special cases that JSON can't serialize
  const specialTypes = new WeakMap();
  
  // Pre-process: Convert special types to serializable format
  function preProcess(value, path = '') {
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    if (value instanceof Date) {
      return { __type: 'Date', __value: value.getTime() };
    }
    
    if (value instanceof RegExp) {
      return { __type: 'RegExp', __source: value.source, __flags: value.flags };
    }
    
    if (value instanceof Map) {
      return { 
        __type: 'Map', 
        __entries: Array.from(value.entries()).map(([k, v]) => [preProcess(k), preProcess(v)]) 
      };
    }
    
    if (value instanceof Set) {
      return { 
        __type: 'Set', 
        __values: Array.from(value.values()).map(preProcess) 
      };
    }
    
    if (Array.isArray(value)) {
      return value.map(item => preProcess(item));
    }
    
    if (value.constructor === Object) {
      const processed = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          processed[key] = preProcess(value[key]);
        }
      }
      return processed;
    }
    
    // For other objects, try to serialize as plain object
    const processed = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        processed[key] = preProcess(value[key]);
      }
    }
    return processed;
  }
  
  // Post-process: Convert back from serializable format
  function postProcess(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    // Check for special type markers
    if (value.__type) {
      switch (value.__type) {
        case 'Date':
          return new Date(value.__value);
        case 'RegExp':
          return new RegExp(value.__source, value.__flags);
        case 'Map':
          return new Map(value.__entries.map(([k, v]) => [postProcess(k), postProcess(v)]));
        case 'Set':
          return new Set(value.__values.map(postProcess));
      }
    }
    
    if (Array.isArray(value)) {
      return value.map(postProcess);
    }
    
    const processed = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        processed[key] = postProcess(value[key]);
      }
    }
    return processed;
  }
  
  try {
    const processed = preProcess(obj);
    const jsonString = JSON.stringify(processed);
    const parsed = JSON.parse(jsonString);
    return postProcess(parsed);
  } catch (error) {
    console.error('JSON clone failed:', error);
    return deepCloneBasic(obj); // Fallback to basic clone
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Deep Clone Examples ===');

// Test objects
const testObject = {
  num: 42,
  str: 'hello',
  bool: true,
  nul: null,
  undef: undefined,
  arr: [1, 2, { nested: 'value' }],
  date: new Date('2023-01-01'),
  regex: /test/gi,
  obj: {
    deep: {
      deeper: 'value'
    }
  }
};

// Create circular reference
testObject.circular = testObject;

// Test basic clone (will have issues with circular reference)
console.log('Original object keys:', Object.keys(testObject));

try {
  const basicClone = deepCloneBasic({ ...testObject, circular: undefined });
  console.log('Basic clone successful');
  console.log('Date cloned correctly:', basicClone.date instanceof Date);
  console.log('Nested object cloned:', basicClone.obj.deep.deeper);
} catch (error) {
  console.log('Basic clone failed:', error.message);
}

// Test enhanced clone (handles circular references)
try {
  const enhancedClone = deepCloneEnhanced(testObject);
  console.log('Enhanced clone successful');
  console.log('Circular reference handled:', enhancedClone.circular === enhancedClone);
  console.log('Date preserved:', enhancedClone.date.getTime() === testObject.date.getTime());
} catch (error) {
  console.log('Enhanced clone failed:', error.message);
}

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Redux-like State Management
 * Immutable updates with deep cloning
 */
function createStateManager(initialState) {
  let state = deepCloneEnhanced(initialState);
  const listeners = [];
  
  return {
    getState() {
      return deepCloneEnhanced(state); // Always return a copy
    },
    
    setState(newState) {
      const prevState = deepCloneEnhanced(state);
      state = deepCloneEnhanced(newState);
      
      // Notify listeners
      listeners.forEach(listener => {
        listener(state, prevState);
      });
    },
    
    updateState(updater) {
      const prevState = deepCloneEnhanced(state);
      
      if (typeof updater === 'function') {
        state = deepCloneEnhanced(updater(deepCloneEnhanced(state)));
      } else {
        state = deepCloneEnhanced({ ...state, ...updater });
      }
      
      listeners.forEach(listener => {
        listener(state, prevState);
      });
    },
    
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    }
  };
}

/**
 * Use Case 2: Form Data Manager
 * Manage form state with undo/redo using cloning
 */
function createFormManager(initialData = {}) {
  const history = [deepCloneEnhanced(initialData)];
  let currentIndex = 0;
  
  return {
    getData() {
      return deepCloneEnhanced(history[currentIndex]);
    },
    
    updateField(field, value) {
      const current = deepCloneEnhanced(history[currentIndex]);
      
      // Support nested field paths like 'user.address.street'
      const keys = field.split('.');
      let target = current;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      
      target[keys[keys.length - 1]] = value;
      
      // Add to history (remove any future history first)
      history.splice(currentIndex + 1);
      history.push(current);
      currentIndex = history.length - 1;
      
      // Limit history size
      if (history.length > 50) {
        history.shift();
        currentIndex--;
      }
    },
    
    undo() {
      if (currentIndex > 0) {
        currentIndex--;
        return this.getData();
      }
      return null;
    },
    
    redo() {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        return this.getData();
      }
      return null;
    },
    
    canUndo() {
      return currentIndex > 0;
    },
    
    canRedo() {
      return currentIndex < history.length - 1;
    },
    
    getHistory() {
      return {
        history: history.map(deepCloneEnhanced),
        currentIndex,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      };
    },
    
    reset() {
      history.splice(1); // Keep only initial state
      currentIndex = 0;
    }
  };
}

/**
 * Use Case 3: Configuration Manager
 * Deep merge configurations with cloning
 */
function createConfigManager(defaultConfig = {}) {
  let config = deepCloneEnhanced(defaultConfig);
  
  function deepMerge(target, source) {
    const result = deepCloneEnhanced(target);
    
    function merge(obj, src) {
      for (const key in src) {
        if (src.hasOwnProperty(key)) {
          if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              obj[key] = merge(obj[key], src[key]);
            } else {
              obj[key] = deepCloneEnhanced(src[key]);
            }
          } else {
            obj[key] = deepCloneEnhanced(src[key]);
          }
        }
      }
      return obj;
    }
    
    return merge(result, source);
  }
  
  return {
    get(path) {
      if (!path) return deepCloneEnhanced(config);
      
      const keys = path.split('.');
      let current = config;
      
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      }
      
      return deepCloneEnhanced(current);
    },
    
    set(path, value) {
      const keys = path.split('.');
      const newConfig = deepCloneEnhanced(config);
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = deepCloneEnhanced(value);
      config = newConfig;
    },
    
    merge(newConfig) {
      config = deepMerge(config, newConfig);
    },
    
    extend(extensionConfig) {
      const extended = deepMerge(config, extensionConfig);
      return createConfigManager(extended);
    },
    
    reset() {
      config = deepCloneEnhanced(defaultConfig);
    },
    
    toJSON() {
      return deepCloneEnhanced(config);
    }
  };
}

/**
 * Use Case 4: Data Serialization/Deserialization
 * Serialize complex objects for storage or transmission
 */
function createSerializer() {
  // Custom serialization for complex types
  const typeHandlers = {
    Date: {
      serialize: (date) => ({ __type: 'Date', __value: date.getTime() }),
      deserialize: (data) => new Date(data.__value)
    },
    
    RegExp: {
      serialize: (regex) => ({ __type: 'RegExp', __source: regex.source, __flags: regex.flags }),
      deserialize: (data) => new RegExp(data.__source, data.__flags)
    },
    
    Map: {
      serialize: (map) => ({ 
        __type: 'Map', 
        __entries: Array.from(map.entries()) 
      }),
      deserialize: (data) => new Map(data.__entries)
    },
    
    Set: {
      serialize: (set) => ({ 
        __type: 'Set', 
        __values: Array.from(set.values()) 
      }),
      deserialize: (data) => new Set(data.__values)
    },
    
    Error: {
      serialize: (error) => ({
        __type: 'Error',
        __name: error.name,
        __message: error.message,
        __stack: error.stack
      }),
      deserialize: (data) => {
        const error = new Error(data.__message);
        error.name = data.__name;
        error.stack = data.__stack;
        return error;
      }
    }
  };
  
  return {
    serialize(obj) {
      function process(value, visited = new WeakSet()) {
        if (value === null || typeof value !== 'object') {
          return value;
        }
        
        if (visited.has(value)) {
          return { __type: 'CircularReference', __id: Math.random().toString(36) };
        }
        
        visited.add(value);
        
        // Check for custom type handlers
        for (const [typeName, handler] of Object.entries(typeHandlers)) {
          if (value.constructor.name === typeName) {
            const serialized = handler.serialize(value);
            // Recursively process the serialized data
            for (const key in serialized) {
              if (key !== '__type') {
                serialized[key] = process(serialized[key], visited);
              }
            }
            return serialized;
          }
        }
        
        if (Array.isArray(value)) {
          return value.map(item => process(item, visited));
        }
        
        const processed = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            processed[key] = process(value[key], visited);
          }
        }
        
        return processed;
      }
      
      return JSON.stringify(process(obj));
    },
    
    deserialize(jsonString) {
      const parsed = JSON.parse(jsonString);
      
      function process(value) {
        if (value === null || typeof value !== 'object') {
          return value;
        }
        
        // Check for type markers
        if (value.__type) {
          const handler = typeHandlers[value.__type];
          if (handler) {
            // Recursively process nested data first
            const processedValue = { ...value };
            for (const key in processedValue) {
              if (key !== '__type') {
                processedValue[key] = process(processedValue[key]);
              }
            }
            return handler.deserialize(processedValue);
          }
        }
        
        if (Array.isArray(value)) {
          return value.map(process);
        }
        
        const processed = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            processed[key] = process(value[key]);
          }
        }
        
        return processed;
      }
      
      return process(parsed);
    },
    
    // Add custom type handler
    addTypeHandler(typeName, serializer, deserializer) {
      typeHandlers[typeName] = {
        serialize: serializer,
        deserialize: deserializer
      };
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// State Manager
const stateManager = createStateManager({ count: 0, user: { name: 'John' } });
stateManager.updateState(state => ({ ...state, count: state.count + 1 }));
console.log('State after update:', stateManager.getState());

// Form Manager
const formManager = createFormManager({ user: { name: '', email: '' } });
formManager.updateField('user.name', 'John Doe');
formManager.updateField('user.email', 'john@example.com');
console.log('Form data:', formManager.getData());
console.log('Can undo:', formManager.canUndo());

// Config Manager
const configManager = createConfigManager({ api: { baseUrl: 'http://localhost' } });
configManager.merge({ api: { timeout: 5000 }, features: { darkMode: true } });
console.log('Config:', configManager.toJSON());

// Serializer
const serializer = createSerializer();
const complexObject = {
  date: new Date(),
  regex: /test/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  error: new Error('Test error')
};

const serialized = serializer.serialize(complexObject);
console.log('Serialized length:', serialized.length);

const deserialized = serializer.deserialize(serialized);
console.log('Deserialized date:', deserialized.date instanceof Date);
console.log('Deserialized map:', deserialized.map instanceof Map);

// Export all implementations
module.exports = {
  deepCloneBasic,
  deepCloneEnhanced,
  deepCloneOptimized,
  structuredClone,
  deepCloneJSON,
  createStateManager,
  createFormManager,
  createConfigManager,
  createSerializer
};

/**
 * Key Interview Points:
 * 
 * 1. Deep vs Shallow Clone:
 *    - Shallow: Copy first level only (Object.assign, spread operator)
 *    - Deep: Recursively copy all nested levels
 *    - Reference vs value copying
 * 
 * 2. Type Handling:
 *    - Primitives: Copy by value
 *    - Objects/Arrays: Need recursive copying
 *    - Special types: Date, RegExp, Map, Set require special handling
 *    - Functions: Usually not cloneable, reference preserved
 * 
 * 3. Circular References:
 *    - Cause infinite recursion without detection
 *    - Use WeakMap/WeakSet to track visited objects
 *    - Preserve object identity in cloned structure
 * 
 * 4. Performance Considerations:
 *    - Recursive approach: Stack overflow risk
 *    - Memory usage: O(n) additional space
 *    - JSON approach: Fast but limited type support
 *    - Object.keys vs for..in performance
 * 
 * 5. Real-world Applications:
 *    - Immutable state management
 *    - Undo/redo functionality
 *    - Configuration management
 *    - Data serialization
 *    - Form state preservation
 * 
 * 6. Alternative Approaches:
 *    - JSON.parse(JSON.stringify()) - Fast but limited
 *    - Lodash cloneDeep - Full-featured library solution
 *    - Immutable.js - Immutable data structures
 *    - Structured clone algorithm (HTML5)
 */