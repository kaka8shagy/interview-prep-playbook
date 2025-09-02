/**
 * File: negative-array-proxy.js
 * Description: Implement negative array indexing using JavaScript Proxy
 * 
 * Learning objectives:
 * - Understand JavaScript Proxy and its traps
 * - Learn to extend native array behavior
 * - See metaprogramming patterns in JavaScript
 * 
 * Time Complexity: O(1) for index access
 * Space Complexity: O(1) additional space per array
 */

// =======================
// Approach 1: Basic Negative Index Proxy
// =======================

/**
 * Basic implementation using Proxy to enable negative indexing
 * Similar to Python's negative indexing: arr[-1] gets last element
 * 
 * Mental model: Negative indices count backwards from the end
 * -1 = last element, -2 = second to last, etc.
 */
function createNegativeIndexArray(initialArray = []) {
  const array = [...initialArray]; // Create copy to avoid mutations
  
  return new Proxy(array, {
    // Trap for property access (getting values)
    get(target, prop, receiver) {
      // Check if property is a numeric index
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        
        // Handle negative indices
        if (index < 0) {
          // Convert negative index to positive: -1 becomes length-1
          const positiveIndex = target.length + index;
          
          // Check bounds to avoid out-of-range access
          if (positiveIndex >= 0 && positiveIndex < target.length) {
            return target[positiveIndex];
          }
          return undefined; // Out of bounds
        }
      }
      
      // Default behavior for non-numeric properties or positive indices
      return Reflect.get(target, prop, receiver);
    },
    
    // Trap for property assignment (setting values)
    set(target, prop, value, receiver) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        
        if (index < 0) {
          const positiveIndex = target.length + index;
          
          // Only set if within bounds
          if (positiveIndex >= 0 && positiveIndex < target.length) {
            target[positiveIndex] = value;
            return true;
          }
          return false; // Assignment failed - out of bounds
        }
      }
      
      // Default behavior
      return Reflect.set(target, prop, value, receiver);
    },
    
    // Trap for 'in' operator and hasOwnProperty
    has(target, prop) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        
        if (index < 0) {
          const positiveIndex = target.length + index;
          return positiveIndex >= 0 && positiveIndex < target.length;
        }
      }
      
      return Reflect.has(target, prop);
    }
  });
}

// =======================
// Approach 2: Enhanced Proxy with Method Support
// =======================

/**
 * Enhanced version that also supports negative indices in array methods
 * Intercepts method calls like splice, slice to support negative indexing
 */
function createEnhancedNegativeArray(initialArray = []) {
  const array = [...initialArray];
  
  // Helper function to normalize index (convert negative to positive)
  function normalizeIndex(index, length) {
    if (typeof index !== 'number') return index;
    return index < 0 ? Math.max(0, length + index) : index;
  }
  
  return new Proxy(array, {
    get(target, prop, receiver) {
      // Handle numeric string properties (array indices)
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        if (index < 0) {
          const positiveIndex = target.length + index;
          return positiveIndex >= 0 && positiveIndex < target.length 
            ? target[positiveIndex] 
            : undefined;
        }
      }
      
      // Intercept array methods that use indices
      const methodsToEnhance = ['slice', 'splice', 'at'];
      if (methodsToEnhance.includes(prop) && typeof target[prop] === 'function') {
        return function(...args) {
          // Normalize negative indices in arguments
          const normalizedArgs = args.map((arg, index) => {
            // For slice: normalize first two arguments (start, end)
            if (prop === 'slice' && index < 2) {
              return normalizeIndex(arg, target.length);
            }
            // For splice: normalize first argument (start)
            if (prop === 'splice' && index === 0) {
              return normalizeIndex(arg, target.length);
            }
            return arg;
          });
          
          return target[prop].apply(target, normalizedArgs);
        };
      }
      
      return Reflect.get(target, prop, receiver);
    },
    
    set(target, prop, value, receiver) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        if (index < 0) {
          const positiveIndex = target.length + index;
          if (positiveIndex >= 0 && positiveIndex < target.length) {
            target[positiveIndex] = value;
            return true;
          }
          return false;
        }
      }
      
      return Reflect.set(target, prop, value, receiver);
    },
    
    has(target, prop) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        if (index < 0) {
          const positiveIndex = target.length + index;
          return positiveIndex >= 0 && positiveIndex < target.length;
        }
      }
      
      return Reflect.has(target, prop);
    }
  });
}

// =======================
// Approach 3: Class-based Implementation with Proxy
// =======================

/**
 * Class-based approach providing a more structured interface
 * Includes additional utility methods and better error handling
 */
class NegativeIndexArray {
  constructor(initialArray = []) {
    this._data = [...initialArray];
    
    // Return proxy instead of instance for transparent array access
    return new Proxy(this, {
      get(target, prop, receiver) {
        // Handle numeric indices
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          return target.get(parseInt(prop, 10));
        }
        
        // Handle length property
        if (prop === 'length') {
          return target._data.length;
        }
        
        // Handle array methods by binding to internal data
        if (typeof target._data[prop] === 'function') {
          return target._data[prop].bind(target._data);
        }
        
        // Handle class methods
        return Reflect.get(target, prop, receiver);
      },
      
      set(target, prop, value, receiver) {
        // Handle numeric indices
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          return target.set(parseInt(prop, 10), value);
        }
        
        // Handle length (for array-like behavior)
        if (prop === 'length') {
          target._data.length = value;
          return true;
        }
        
        return Reflect.set(target, prop, value, receiver);
      },
      
      has(target, prop) {
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          return target.has(parseInt(prop, 10));
        }
        return Reflect.has(target, prop);
      }
    });
  }
  
  // Core methods for index manipulation
  get(index) {
    if (index < 0) {
      const positiveIndex = this._data.length + index;
      return positiveIndex >= 0 && positiveIndex < this._data.length 
        ? this._data[positiveIndex] 
        : undefined;
    }
    return this._data[index];
  }
  
  set(index, value) {
    if (index < 0) {
      const positiveIndex = this._data.length + index;
      if (positiveIndex >= 0 && positiveIndex < this._data.length) {
        this._data[positiveIndex] = value;
        return true;
      }
      return false;
    }
    
    this._data[index] = value;
    return true;
  }
  
  has(index) {
    if (index < 0) {
      const positiveIndex = this._data.length + index;
      return positiveIndex >= 0 && positiveIndex < this._data.length;
    }
    return index >= 0 && index < this._data.length;
  }
  
  // Utility methods
  normalizeIndex(index) {
    return index < 0 ? this._data.length + index : index;
  }
  
  slice(start = 0, end = this._data.length) {
    const normalizedStart = this.normalizeIndex(start);
    const normalizedEnd = this.normalizeIndex(end);
    return new NegativeIndexArray(this._data.slice(normalizedStart, normalizedEnd));
  }
  
  // Convert back to regular array
  toArray() {
    return [...this._data];
  }
  
  // JSON serialization support
  toJSON() {
    return this._data;
  }
  
  // Iterator support
  *[Symbol.iterator]() {
    yield* this._data;
  }
}

// =======================
// Approach 4: Functional Factory with Multiple Features
// =======================

/**
 * Factory function creating arrays with advanced negative indexing features
 * Includes range access, multi-dimensional support, and performance optimizations
 */
function createAdvancedNegativeArray(initialArray = [], options = {}) {
  const {
    enableRangeAccess = true,
    enableMultiDimensional = false,
    throwOnOutOfBounds = false
  } = options;
  
  const array = [...initialArray];
  
  // Helper functions
  function normalizeIndex(index, length) {
    if (typeof index !== 'number') return index;
    const normalized = index < 0 ? length + index : index;
    
    if (throwOnOutOfBounds && (normalized < 0 || normalized >= length)) {
      throw new RangeError(`Index ${index} is out of bounds for array of length ${length}`);
    }
    
    return normalized;
  }
  
  function parseRangeString(rangeStr) {
    // Support Python-like slice notation: "1:5", "-3:-1", ":"
    const parts = rangeStr.split(':');
    if (parts.length === 2) {
      const start = parts[0] === '' ? 0 : parseInt(parts[0], 10);
      const end = parts[1] === '' ? array.length : parseInt(parts[1], 10);
      return { start, end };
    }
    return null;
  }
  
  return new Proxy(array, {
    get(target, prop, receiver) {
      // Handle range access (e.g., arr['1:5'] or arr['-3:-1'])
      if (enableRangeAccess && typeof prop === 'string' && prop.includes(':')) {
        const range = parseRangeString(prop);
        if (range) {
          const start = normalizeIndex(range.start, target.length);
          const end = normalizeIndex(range.end, target.length);
          return target.slice(Math.max(0, start), Math.min(target.length, end));
        }
      }
      
      // Handle multi-dimensional access (e.g., arr['1,2'] for arr[1][2])
      if (enableMultiDimensional && typeof prop === 'string' && prop.includes(',')) {
        const indices = prop.split(',').map(s => parseInt(s.trim(), 10));
        let current = target;
        
        for (const index of indices) {
          if (Array.isArray(current)) {
            const normalizedIndex = normalizeIndex(index, current.length);
            current = current[normalizedIndex];
          } else {
            return undefined;
          }
        }
        
        return current;
      }
      
      // Handle negative numeric indices
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        if (index < 0) {
          const positiveIndex = normalizeIndex(index, target.length);
          return positiveIndex >= 0 && positiveIndex < target.length 
            ? target[positiveIndex] 
            : undefined;
        }
      }
      
      return Reflect.get(target, prop, receiver);
    },
    
    set(target, prop, value, receiver) {
      // Handle multi-dimensional assignment
      if (enableMultiDimensional && typeof prop === 'string' && prop.includes(',')) {
        const indices = prop.split(',').map(s => parseInt(s.trim(), 10));
        let current = target;
        
        // Navigate to parent of target location
        for (let i = 0; i < indices.length - 1; i++) {
          const index = normalizeIndex(indices[i], current.length);
          if (!Array.isArray(current[index])) {
            current[index] = []; // Auto-create nested arrays
          }
          current = current[index];
        }
        
        // Set final value
        const lastIndex = normalizeIndex(indices[indices.length - 1], current.length);
        current[lastIndex] = value;
        return true;
      }
      
      // Handle negative numeric indices
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        if (index < 0) {
          const positiveIndex = normalizeIndex(index, target.length);
          if (positiveIndex >= 0 && positiveIndex < target.length) {
            target[positiveIndex] = value;
            return true;
          }
          return !throwOnOutOfBounds;
        }
      }
      
      return Reflect.set(target, prop, value, receiver);
    },
    
    has(target, prop) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        if (index < 0) {
          const positiveIndex = normalizeIndex(index, target.length);
          return positiveIndex >= 0 && positiveIndex < target.length;
        }
      }
      
      return Reflect.has(target, prop);
    }
  });
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Negative Index Examples ===');

// Basic usage
const basicArray = createNegativeIndexArray([1, 2, 3, 4, 5]);
console.log('Array:', basicArray.toArray ? basicArray.toArray() : [...basicArray]);
console.log('Last element (arr[-1]):', basicArray[-1]); // 5
console.log('Second to last (arr[-2]):', basicArray[-2]); // 4
console.log('Out of bounds (arr[-10]):', basicArray[-10]); // undefined

// Setting values
basicArray[-1] = 'LAST';
basicArray[-2] = 'SECOND_LAST';
console.log('After modification:', [...basicArray]); // [1, 2, 3, 'SECOND_LAST', 'LAST']

console.log('\n=== Enhanced Array Examples ===');

// Enhanced version with method support
const enhancedArray = createEnhancedNegativeArray([10, 20, 30, 40, 50]);
console.log('Original:', [...enhancedArray]);
console.log('Slice from -3 to -1:', enhancedArray.slice(-3, -1)); // [30, 40]
console.log('Last 2 elements:', enhancedArray.slice(-2)); // [40, 50]

console.log('\n=== Class-based Examples ===');

// Class-based approach
const classArray = new NegativeIndexArray(['a', 'b', 'c', 'd', 'e']);
console.log('Length:', classArray.length);
console.log('Element at -1:', classArray[-1]); // 'e'
console.log('Has index -2:', -2 in classArray); // true
console.log('Has index -10:', -10 in classArray); // false

// Array methods work normally
classArray.push('f');
console.log('After push:', classArray.toArray());

console.log('\n=== Advanced Features ===');

// Advanced array with range access
const advancedArray = createAdvancedNegativeArray([1, 2, 3, 4, 5, 6, 7, 8], {
  enableRangeAccess: true,
  enableMultiDimensional: true
});

console.log('Range [1:4]:', advancedArray['1:4']); // [2, 3, 4]
console.log('Range [-3:-1]:', advancedArray['-3:-1']); // [6, 7]
console.log('All elements [:]:', advancedArray[':'] || [...advancedArray]);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Time Series Data Access
 * Access recent data points using negative indexing
 */
function createTimeSeriesArray(initialData = []) {
  const timeArray = createNegativeIndexArray(initialData);
  
  return {
    data: timeArray,
    
    // Get most recent N data points
    getRecent(n = 1) {
      if (n === 1) return timeArray[-1];
      return timeArray.slice(-n);
    },
    
    // Get data from N periods ago
    getPeriodAgo(n) {
      return timeArray[-n - 1];
    },
    
    // Add new data point
    addDataPoint(value) {
      timeArray.push(value);
    },
    
    // Get trend (compare recent vs previous)
    getTrend() {
      const current = timeArray[-1];
      const previous = timeArray[-2];
      
      if (current == null || previous == null) return null;
      
      return {
        current,
        previous,
        change: current - previous,
        percentChange: ((current - previous) / previous) * 100
      };
    }
  };
}

/**
 * Use Case 2: Undo/Redo Stack with Negative Indexing
 * Navigate through history states using negative indices
 */
function createHistoryStack(maxSize = 50) {
  const stack = createNegativeIndexArray([]);
  let currentIndex = -1;
  
  return {
    // Add new state
    push(state) {
      // Remove any future states if we're not at the end
      stack.splice(currentIndex + 1);
      
      // Add new state
      stack.push(JSON.parse(JSON.stringify(state))); // Deep copy
      
      // Maintain max size
      if (stack.length > maxSize) {
        stack.shift();
      }
      
      currentIndex = -1; // Always point to latest
    },
    
    // Get current state
    current() {
      return stack[currentIndex];
    },
    
    // Navigate to previous state
    undo() {
      if (Math.abs(currentIndex) < stack.length) {
        currentIndex--;
        return stack[currentIndex];
      }
      return null;
    },
    
    // Navigate to next state
    redo() {
      if (currentIndex < -1) {
        currentIndex++;
        return stack[currentIndex];
      }
      return null;
    },
    
    // Get state at specific position from end
    getStateFromEnd(position) {
      return stack[-position - 1];
    },
    
    // Check if can undo/redo
    canUndo() {
      return Math.abs(currentIndex) < stack.length;
    },
    
    canRedo() {
      return currentIndex < -1;
    },
    
    // Get history info
    getHistoryInfo() {
      return {
        totalStates: stack.length,
        currentPosition: currentIndex,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      };
    }
  };
}

/**
 * Use Case 3: Circular Buffer with Negative Indexing
 * Fixed-size buffer where negative indices wrap around
 */
function createCircularBuffer(size) {
  const buffer = new Array(size).fill(undefined);
  let writeIndex = 0;
  let count = 0;
  
  const proxy = new Proxy(buffer, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const index = parseInt(prop, 10);
        
        if (index < 0) {
          // Negative index: count backwards from most recent
          const actualIndex = (writeIndex + index) % size;
          return target[actualIndex < 0 ? actualIndex + size : actualIndex];
        } else if (index < count) {
          // Positive index: count forwards from oldest
          const startIndex = count < size ? 0 : (writeIndex % size);
          const actualIndex = (startIndex + index) % size;
          return target[actualIndex];
        }
        
        return undefined;
      }
      
      return Reflect.get(target, prop, receiver);
    }
  });
  
  return {
    buffer: proxy,
    
    // Add item to buffer
    push(item) {
      buffer[writeIndex % size] = item;
      writeIndex++;
      count = Math.min(count + 1, size);
    },
    
    // Get most recent N items
    getRecent(n = 1) {
      const result = [];
      for (let i = -n; i < 0; i++) {
        const item = proxy[i];
        if (item !== undefined) result.push(item);
      }
      return result.reverse();
    },
    
    // Get all items in chronological order
    getAll() {
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(proxy[i]);
      }
      return result;
    },
    
    // Buffer info
    getInfo() {
      return {
        size,
        count,
        writeIndex: writeIndex % size,
        isFull: count === size
      };
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Time series example
const timeSeries = createTimeSeriesArray([100, 102, 98, 105, 110, 108]);
timeSeries.addDataPoint(115);
console.log('Recent data:', timeSeries.getRecent(3));
console.log('Trend:', timeSeries.getTrend());

// History stack example
const history = createHistoryStack();
history.push({ value: 'initial' });
history.push({ value: 'modified' });
history.push({ value: 'final' });
console.log('Current state:', history.current());
console.log('After undo:', history.undo());
console.log('History info:', history.getHistoryInfo());

// Circular buffer example
const circular = createCircularBuffer(3);
circular.push('A');
circular.push('B');
circular.push('C');
circular.push('D'); // Overwrites 'A'
console.log('Buffer contents:', circular.getAll()); // ['B', 'C', 'D']
console.log('Last item:', circular.buffer[-1]); // 'D'
console.log('Two items ago:', circular.buffer[-2]); // 'C'

// Export all implementations
module.exports = {
  createNegativeIndexArray,
  createEnhancedNegativeArray,
  NegativeIndexArray,
  createAdvancedNegativeArray,
  createTimeSeriesArray,
  createHistoryStack,
  createCircularBuffer
};

/**
 * Key Interview Points:
 * 
 * 1. Proxy Fundamentals:
 *    - get, set, has traps for property access
 *    - Reflect for default behavior
 *    - Transparent wrapper around native objects
 * 
 * 2. Index Normalization:
 *    - Converting negative to positive: length + negativeIndex
 *    - Bounds checking for safety
 *    - Handling edge cases (empty arrays, out of bounds)
 * 
 * 3. Performance Considerations:
 *    - Proxy overhead vs native array access
 *    - Caching normalized indices for repeated access
 *    - Memory implications of proxy wrappers
 * 
 * 4. Real-world Applications:
 *    - Time series data analysis
 *    - Undo/redo implementations
 *    - Circular buffers and sliding windows
 *    - Python-like array slicing
 * 
 * 5. Advanced Features:
 *    - Range access (slice notation)
 *    - Multi-dimensional indexing
 *    - Method interception and enhancement
 *    - Integration with native array methods
 */