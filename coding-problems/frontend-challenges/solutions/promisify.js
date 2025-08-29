/**
 * File: promisify.js
 * Description: Convert callback-based functions to promise-based with multiple approaches
 * 
 * Learning objectives:
 * - Understand callback to promise conversion patterns
 * - Learn Node.js callback conventions and error handling
 * - Master function wrapping and context preservation
 * 
 * Time Complexity: O(1) for promisify operation, depends on wrapped function
 * Space Complexity: O(1) for wrapper creation
 */

// =======================
// Approach 1: Basic Promisify
// =======================

/**
 * Basic promisify implementation for Node.js style callbacks
 * Converts functions that use (error, result) callback pattern to promises
 * 
 * Mental model: Wrap callback-based function in a promise that resolves/rejects
 * based on the error-first callback convention
 */
function promisify(callbackFunction) {
  // Input validation
  if (typeof callbackFunction !== 'function') {
    throw new TypeError('Expected a function');
  }
  
  // Return a new function that returns a promise
  return function promisified(...args) {
    const context = this; // Preserve 'this' context
    
    return new Promise((resolve, reject) => {
      // Create callback that follows Node.js convention
      const callback = (error, result) => {
        if (error) {
          // First argument is error - reject the promise
          reject(error);
        } else {
          // Success case - resolve with result
          resolve(result);
        }
      };
      
      try {
        // Call original function with arguments plus our callback
        callbackFunction.call(context, ...args, callback);
      } catch (error) {
        // Handle synchronous errors
        reject(error);
      }
    });
  };
}

// =======================
// Approach 2: Multi-value Result Promisify
// =======================

/**
 * Enhanced promisify that handles callbacks with multiple success values
 * Some callbacks pass multiple results: callback(null, result1, result2, ...)
 * 
 * This version collects all non-error values into an array
 */
function promisifyMulti(callbackFunction) {
  if (typeof callbackFunction !== 'function') {
    throw new TypeError('Expected a function');
  }
  
  return function promisified(...args) {
    const context = this;
    
    return new Promise((resolve, reject) => {
      const callback = (error, ...results) => {
        if (error) {
          reject(error);
        } else {
          // If multiple results, return array; if single result, return value directly
          if (results.length === 0) {
            resolve(undefined);
          } else if (results.length === 1) {
            resolve(results[0]);
          } else {
            resolve(results);
          }
        }
      };
      
      try {
        callbackFunction.call(context, ...args, callback);
      } catch (error) {
        reject(error);
      }
    });
  };
}

// =======================
// Approach 3: Custom Callback Pattern Promisify
// =======================

/**
 * Flexible promisify that allows custom callback patterns
 * Some APIs don't follow Node.js convention (error-first)
 * 
 * Options:
 * - errorFirst: whether error is first parameter (default: true)
 * - multiResult: whether to return array for multiple results (default: false)
 */
function promisifyCustom(callbackFunction, options = {}) {
  const {
    errorFirst = true,
    multiResult = false,
    transform = null  // Custom transform function for results
  } = options;
  
  if (typeof callbackFunction !== 'function') {
    throw new TypeError('Expected a function');
  }
  
  return function promisified(...args) {
    const context = this;
    
    return new Promise((resolve, reject) => {
      const callback = (...callbackArgs) => {
        let error, results;
        
        if (errorFirst) {
          // Node.js style: callback(error, result1, result2, ...)
          [error, ...results] = callbackArgs;
        } else {
          // Success-first style: callback(result1, result2, ..., error)
          error = callbackArgs[callbackArgs.length - 1];
          results = callbackArgs.slice(0, -1);
        }
        
        if (error) {
          reject(error);
        } else {
          let finalResult;
          
          if (results.length === 0) {
            finalResult = undefined;
          } else if (results.length === 1 && !multiResult) {
            finalResult = results[0];
          } else {
            finalResult = results;
          }
          
          // Apply transform if provided
          if (transform && typeof transform === 'function') {
            try {
              finalResult = transform(finalResult);
            } catch (transformError) {
              reject(transformError);
              return;
            }
          }
          
          resolve(finalResult);
        }
      };
      
      try {
        callbackFunction.call(context, ...args, callback);
      } catch (error) {
        reject(error);
      }
    });
  };
}

// =======================
// Approach 4: Promisify with Timeout
// =======================

/**
 * Promisify with built-in timeout functionality
 * Useful for operations that might hang or take too long
 */
function promisifyWithTimeout(callbackFunction, timeoutMs = 30000) {
  if (typeof callbackFunction !== 'function') {
    throw new TypeError('Expected a function');
  }
  
  return function promisified(...args) {
    const context = this;
    
    return new Promise((resolve, reject) => {
      let isResolved = false;
      let timeoutId;
      
      // Set up timeout
      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(new Error(`Operation timed out after ${timeoutMs}ms`));
          }
        }, timeoutMs);
      }
      
      const callback = (error, result) => {
        if (isResolved) return; // Prevent multiple resolutions
        
        isResolved = true;
        
        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      };
      
      try {
        callbackFunction.call(context, ...args, callback);
      } catch (error) {
        if (!isResolved) {
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          reject(error);
        }
      }
    });
  };
}

// =======================
// Approach 5: Promisify All Methods
// =======================

/**
 * Promisify all methods of an object that follow callback convention
 * Useful for converting entire APIs or modules at once
 */
function promisifyAll(obj, options = {}) {
  const {
    suffix = 'Async',
    filter = null,
    exclude = [],
    promisifyOptions = {}
  } = options;
  
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('Expected an object');
  }
  
  const promisified = Object.create(Object.getPrototypeOf(obj));
  
  // Copy all properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'function' && !exclude.includes(key)) {
        // Apply filter if provided
        if (filter && !filter(key, value)) {
          promisified[key] = value;
          continue;
        }
        
        // Create both original and promisified versions
        promisified[key] = value.bind(obj);
        promisified[key + suffix] = promisifyCustom(value.bind(obj), promisifyOptions);
      } else {
        promisified[key] = value;
      }
    }
  }
  
  return promisified;
}

// =======================
// Approach 6: Auto-detecting Promisify
// =======================

/**
 * Smart promisify that attempts to detect callback patterns automatically
 * Analyzes function signature and behavior to determine best promisification
 */
function promisifyAuto(callbackFunction) {
  if (typeof callbackFunction !== 'function') {
    throw new TypeError('Expected a function');
  }
  
  // Get function signature information
  const functionStr = callbackFunction.toString();
  const paramCount = callbackFunction.length;
  
  return function promisified(...args) {
    const context = this;
    
    return new Promise((resolve, reject) => {
      // Track how many arguments the callback receives
      let callbackArgCount = 0;
      let callbackArgs = [];
      
      const callback = (...receivedArgs) => {
        callbackArgCount = receivedArgs.length;
        callbackArgs = receivedArgs;
        
        // Auto-detect pattern based on arguments
        if (callbackArgCount === 0) {
          // No arguments - assume success
          resolve(undefined);
        } else if (callbackArgCount === 1) {
          // Single argument - could be error or result
          const arg = receivedArgs[0];
          
          // Heuristic: if it looks like an Error object, treat as error
          if (arg instanceof Error || 
              (arg && typeof arg === 'object' && 'message' in arg && 'name' in arg)) {
            reject(arg);
          } else {
            resolve(arg);
          }
        } else {
          // Multiple arguments - assume Node.js style (error, result, ...)
          const [error, ...results] = receivedArgs;
          
          if (error) {
            reject(error);
          } else {
            resolve(results.length === 1 ? results[0] : results);
          }
        }
      };
      
      try {
        callbackFunction.call(context, ...args, callback);
      } catch (error) {
        reject(error);
      }
    });
  };
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Promisify Examples ===');

// Example 1: Node.js fs.readFile style
function simulateReadFile(filename, encoding, callback) {
  // Simulate async file reading
  setTimeout(() => {
    if (filename === 'nonexistent.txt') {
      callback(new Error('File not found'), null);
    } else {
      callback(null, `Contents of ${filename} with ${encoding} encoding`);
    }
  }, 100);
}

const readFileAsync = promisify(simulateReadFile);

readFileAsync('test.txt', 'utf8')
  .then(content => console.log('Read file:', content))
  .catch(error => console.error('File error:', error.message));

// Example 2: Multiple result callback
function simulateDbQuery(query, callback) {
  setTimeout(() => {
    if (query.includes('ERROR')) {
      callback(new Error('Database error'), null, null);
    } else {
      // Return multiple results
      callback(null, [{ id: 1, name: 'John' }], { totalCount: 1 });
    }
  }, 50);
}

const dbQueryAsync = promisifyMulti(simulateDbQuery);

dbQueryAsync('SELECT * FROM users')
  .then(results => console.log('DB results:', results))
  .catch(error => console.error('DB error:', error.message));

console.log('\n=== Custom Pattern Examples ===');

// Example 3: Success-first callback pattern
function jqueryStyleCallback(url, successCallback) {
  // jQuery style: success(data, textStatus, jqXHR)
  setTimeout(() => {
    if (url.includes('error')) {
      successCallback(null, 'error', new Error('Request failed'));
    } else {
      successCallback({ data: 'response' }, 'success', null);
    }
  }, 50);
}

const jqueryAsync = promisifyCustom(jqueryStyleCallback, {
  errorFirst: false,
  transform: (results) => results[0] // Return just the data
});

jqueryAsync('https://api.example.com/data')
  .then(data => console.log('jQuery style result:', data))
  .catch(error => console.error('jQuery error:', error.message));

console.log('\n=== Timeout Example ===');

// Example 4: Function that might hang
function slowOperation(callback) {
  // This operation takes 5 seconds
  setTimeout(() => {
    callback(null, 'Finally done!');
  }, 5000);
}

const slowOperationAsync = promisifyWithTimeout(slowOperation, 1000);

slowOperationAsync()
  .then(result => console.log('Slow result:', result))
  .catch(error => console.log('Timeout error:', error.message));

console.log('\n=== PromisifyAll Example ===');

// Example 5: Convert entire object
const fileSystem = {
  readFile(filename, callback) {
    setTimeout(() => callback(null, `Content of ${filename}`), 50);
  },
  
  writeFile(filename, data, callback) {
    setTimeout(() => callback(null, `Wrote to ${filename}`), 50);
  },
  
  // Sync method - should not be promisified
  readFileSync(filename) {
    return `Sync content of ${filename}`;
  }
};

const fsAsync = promisifyAll(fileSystem, {
  filter: (name, fn) => !name.includes('Sync')
});

// Now we have both original and async versions
fsAsync.readFileAsync('test.txt')
  .then(content => console.log('PromisifyAll result:', content))
  .catch(error => console.error('PromisifyAll error:', error));

console.log('Sync method still works:', fsAsync.readFileSync('test.txt'));

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Converting legacy callback-based API
 * Transform old APIs to work with modern async/await
 */
class LegacyAPIWrapper {
  constructor(legacyAPI) {
    this.api = legacyAPI;
    
    // Promisify all methods
    this.async = promisifyAll(legacyAPI, {
      suffix: 'Promise',
      exclude: ['constructor', 'close', 'destroy']
    });
  }
  
  // Convenience method for common patterns
  async fetchUserData(userId) {
    try {
      const userData = await this.async.getUserPromise(userId);
      const userPosts = await this.async.getUserPostsPromise(userId);
      
      return {
        user: userData,
        posts: userPosts
      };
    } catch (error) {
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }
  }
}

/**
 * Use Case 2: Promisify with retry logic
 * Combine promisify with retry functionality for unreliable operations
 */
function promisifyWithRetry(callbackFunction, maxRetries = 3) {
  const promisified = promisify(callbackFunction);
  
  return async function retriedFunction(...args) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await promisified.call(this, ...args);
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw new Error(
            `Operation failed after ${maxRetries} attempts. Last error: ${error.message}`
          );
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
    
    throw lastError;
  };
}

/**
 * Use Case 3: Promisify with caching
 * Add memoization to promisified functions for performance
 */
function promisifyWithCache(callbackFunction, cacheOptions = {}) {
  const promisified = promisify(callbackFunction);
  const cache = new Map();
  const { 
    maxSize = 100, 
    ttl = 300000, // 5 minutes
    keyGenerator = (...args) => JSON.stringify(args)
  } = cacheOptions;
  
  return async function cachedFunction(...args) {
    const cacheKey = keyGenerator(...args);
    
    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      
      // Check TTL
      if (Date.now() - cached.timestamp < ttl) {
        console.log('Cache hit for:', cacheKey);
        return cached.value;
      } else {
        cache.delete(cacheKey);
      }
    }
    
    // Execute function
    try {
      const result = await promisified.call(this, ...args);
      
      // Store in cache
      if (cache.size >= maxSize) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(cacheKey, {
        value: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Legacy API simulation
const legacyAPI = {
  getUser(id, callback) {
    setTimeout(() => callback(null, { id, name: `User ${id}` }), 100);
  },
  
  getUserPosts(id, callback) {
    setTimeout(() => callback(null, [`Post 1 by ${id}`, `Post 2 by ${id}`]), 100);
  }
};

const wrapper = new LegacyAPIWrapper(legacyAPI);

wrapper.fetchUserData(123)
  .then(data => console.log('Combined user data:', data))
  .catch(error => console.error('Wrapper error:', error));

// Retry example
function unreliableOperation(callback) {
  // 70% chance of failure
  if (Math.random() > 0.3) {
    setTimeout(() => callback(new Error('Random failure')), 50);
  } else {
    setTimeout(() => callback(null, 'Success!'), 50);
  }
}

const retriedOperation = promisifyWithRetry(unreliableOperation, 3);

retriedOperation()
  .then(result => console.log('Retry result:', result))
  .catch(error => console.log('Final retry error:', error.message));

// Export all implementations
module.exports = {
  promisify,
  promisifyMulti,
  promisifyCustom,
  promisifyWithTimeout,
  promisifyAll,
  promisifyAuto,
  promisifyWithRetry,
  promisifyWithCache,
  LegacyAPIWrapper
};

/**
 * Key Interview Points:
 * 
 * 1. Callback Conventions:
 *    - Node.js error-first: callback(error, result)
 *    - jQuery success-first: callback(result, status, error)
 *    - Multiple results: callback(error, result1, result2, ...)
 * 
 * 2. Context Preservation:
 *    - Use call() to maintain 'this' binding
 *    - Arrow functions vs regular functions
 *    - Binding in promisifyAll scenarios
 * 
 * 3. Error Handling:
 *    - Synchronous errors (try-catch)
 *    - Asynchronous errors (callback errors)
 *    - Timeout scenarios
 *    - Multiple error sources
 * 
 * 4. Advanced Patterns:
 *    - Auto-detection of callback patterns
 *    - Retry logic with exponential backoff
 *    - Caching for performance
 *    - Batch promisification
 * 
 * 5. Real-world Considerations:
 *    - Legacy API migration strategies
 *    - Performance implications
 *    - Memory management in caching
 *    - Backward compatibility maintenance
 */