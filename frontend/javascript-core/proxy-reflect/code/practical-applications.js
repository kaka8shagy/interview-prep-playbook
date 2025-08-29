/**
 * File: practical-applications.js
 * Description: Real-world Proxy applications including validation, API wrappers, and debugging
 * Time Complexity: Various based on implementation
 * Space Complexity: O(1) additional overhead for most patterns
 */

// Property Validation System
// Real-world validation with detailed error messages and multiple validation rules
class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

function createValidatedObject(schema) {
  return new Proxy({}, {
    set(target, property, value) {
      const validator = schema[property];
      
      if (!validator) {
        // Allow setting properties not in schema (flexible validation)
        target[property] = value;
        return true;
      }
      
      // Run validation rules sequentially
      if (validator.required && (value === undefined || value === null)) {
        throw new ValidationError(
          `Property '${property}' is required`,
          property,
          value
        );
      }
      
      if (validator.type && typeof value !== validator.type) {
        throw new ValidationError(
          `Property '${property}' must be of type ${validator.type}, got ${typeof value}`,
          property,
          value
        );
      }
      
      if (validator.min && value < validator.min) {
        throw new ValidationError(
          `Property '${property}' must be at least ${validator.min}, got ${value}`,
          property,
          value
        );
      }
      
      if (validator.max && value > validator.max) {
        throw new ValidationError(
          `Property '${property}' must be at most ${validator.max}, got ${value}`,
          property,
          value
        );
      }
      
      if (validator.pattern && !validator.pattern.test(value)) {
        throw new ValidationError(
          `Property '${property}' does not match required pattern`,
          property,
          value
        );
      }
      
      if (validator.custom && !validator.custom(value)) {
        throw new ValidationError(
          `Property '${property}' failed custom validation`,
          property,
          value
        );
      }
      
      // All validations passed
      target[property] = value;
      return true;
    }
  });
}

// Example usage with comprehensive validation
const userSchema = {
  name: { 
    required: true, 
    type: 'string',
    min: 2,
    pattern: /^[a-zA-Z\s]+$/
  },
  age: { 
    required: true, 
    type: 'number',
    min: 0,
    max: 150
  },
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  role: {
    type: 'string',
    custom: (value) => ['admin', 'user', 'moderator'].includes(value)
  }
};

const user = createValidatedObject(userSchema);
try {
  user.name = "John Doe";
  user.age = 30;
  user.email = "john@example.com";
  user.role = "admin";
  console.log("User created:", user);
} catch (error) {
  console.error(`Validation failed: ${error.message}`);
}

// API Wrapper with Caching and Error Handling
// Transforms API responses and provides intelligent caching
class APIWrapper {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.cache = new Map(); // Simple cache implementation
    this.defaultOptions = {
      timeout: 5000,
      retries: 3,
      cacheExpiry: 300000, // 5 minutes
      ...options
    };
    
    // Return proxy that intercepts method calls
    return new Proxy(this, {
      get(target, property) {
        // If property exists on target, return it
        if (property in target) {
          return target[property];
        }
        
        // Otherwise, create dynamic API method
        return function(...args) {
          return target._makeRequest(property, ...args);
        };
      }
    });
  }
  
  async _makeRequest(endpoint, ...args) {
    const cacheKey = `${endpoint}-${JSON.stringify(args)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.defaultOptions.cacheExpiry) {
        console.log(`Cache hit for ${endpoint}`);
        return cached.data;
      }
    }
    
    // Build URL and options
    const url = `${this.baseURL}/${endpoint}`;
    const [data, options = {}] = args;
    
    try {
      // Simulate API call with retry logic
      const response = await this._fetchWithRetry(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });
      
      const result = await response.json();
      
      // Cache successful responses
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }
  
  async _fetchWithRetry(url, options, retries = this.defaultOptions.retries) {
    try {
      // In real implementation, this would use fetch()
      // Simulating API response for demo
      return {
        json: () => Promise.resolve({
          endpoint: url.split('/').pop(),
          data: `Response for ${url}`,
          timestamp: Date.now()
        })
      };
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying ${url}, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this._fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }
  
  // Utility methods
  clearCache() {
    this.cache.clear();
  }
  
  getCacheSize() {
    return this.cache.size;
  }
}

// Usage example - dynamic method creation
const api = new APIWrapper('https://api.example.com');

// These methods don't exist but are created dynamically
api.getUsers().then(users => console.log('Users:', users));
api.createPost({ title: 'Hello', content: 'World' }, { method: 'POST' })
   .then(result => console.log('Post created:', result));

// Debug Proxy for Development
// Provides comprehensive debugging information for object interactions
function createDebugProxy(target, label = 'Object') {
  const accessLog = [];
  const startTime = Date.now();
  
  function log(operation, property, value, result) {
    const timestamp = Date.now() - startTime;
    const logEntry = {
      timestamp,
      operation,
      property,
      value,
      result,
      stackTrace: new Error().stack.split('\n').slice(2, 5).join('\n')
    };
    accessLog.push(logEntry);
    
    // Console output with color coding (would work in browser)
    console.log(
      `[${timestamp}ms] ${label}.${operation}('${property}')${
        value !== undefined ? ` = ${JSON.stringify(value)}` : ''
      }${result !== undefined ? ` -> ${JSON.stringify(result)}` : ''}`
    );
  }
  
  const proxy = new Proxy(target, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      log('get', property, undefined, value);
      
      // If the property is a function, wrap it to log calls
      if (typeof value === 'function') {
        return new Proxy(value, {
          apply(func, thisArg, argumentsList) {
            log('call', property, argumentsList);
            const result = Reflect.apply(func, thisArg, argumentsList);
            log('return', property, undefined, result);
            return result;
          }
        });
      }
      
      return value;
    },
    
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      log('set', property, value, `${oldValue} -> ${value}`);
      return result;
    },
    
    has(target, property) {
      const result = Reflect.has(target, property);
      log('has', property, undefined, result);
      return result;
    },
    
    deleteProperty(target, property) {
      const oldValue = target[property];
      const result = Reflect.deleteProperty(target, property);
      log('delete', property, undefined, `deleted ${oldValue}`);
      return result;
    },
    
    enumerate(target) {
      const keys = Object.keys(target);
      log('enumerate', 'keys', undefined, keys);
      return keys[Symbol.iterator]();
    },
    
    ownKeys(target) {
      const keys = Reflect.ownKeys(target);
      log('ownKeys', 'all', undefined, keys);
      return keys;
    }
  });
  
  // Add utility methods to access debug information
  proxy._getAccessLog = () => [...accessLog];
  proxy._clearLog = () => accessLog.length = 0;
  proxy._getStats = () => ({
    totalOperations: accessLog.length,
    operationTypes: accessLog.reduce((acc, log) => {
      acc[log.operation] = (acc[log.operation] || 0) + 1;
      return acc;
    }, {}),
    mostAccessedProperties: accessLog.reduce((acc, log) => {
      acc[log.property] = (acc[log.property] || 0) + 1;
      return acc;
    }, {}),
    totalTime: Date.now() - startTime
  });
  
  return proxy;
}

// Example usage of debug proxy
const debuggedUser = createDebugProxy({ 
  name: 'Alice', 
  age: 25,
  greet() { return `Hello, I'm ${this.name}`; }
}, 'User');

debuggedUser.name; // Logs property access
debuggedUser.age = 26; // Logs property set
debuggedUser.greet(); // Logs method call and return
'name' in debuggedUser; // Logs has check
delete debuggedUser.age; // Logs deletion

console.log('Debug stats:', debuggedUser._getStats());

// Property Access Control System
// Implements role-based access control for object properties
function createAccessControlledObject(data, permissions) {
  // Current user context (in real app, this would come from auth system)
  let currentUser = { role: 'user', id: 1 };
  
  return new Proxy(data, {
    get(target, property) {
      if (property === '_setUser') {
        return (user) => { currentUser = user; };
      }
      
      if (property === '_getCurrentUser') {
        return () => currentUser;
      }
      
      const permission = permissions[property];
      if (!permission) {
        return target[property]; // No restrictions
      }
      
      // Check read permission
      if (permission.read && !permission.read.includes(currentUser.role)) {
        throw new Error(`Access denied: Cannot read property '${property}' with role '${currentUser.role}'`);
      }
      
      // Apply data filtering for sensitive information
      let value = target[property];
      if (permission.filter && typeof permission.filter === 'function') {
        value = permission.filter(value, currentUser);
      }
      
      return value;
    },
    
    set(target, property, value) {
      const permission = permissions[property];
      if (!permission) {
        target[property] = value; // No restrictions
        return true;
      }
      
      // Check write permission
      if (permission.write && !permission.write.includes(currentUser.role)) {
        throw new Error(`Access denied: Cannot write property '${property}' with role '${currentUser.role}'`);
      }
      
      // Apply value validation
      if (permission.validate && typeof permission.validate === 'function') {
        if (!permission.validate(value, currentUser)) {
          throw new Error(`Validation failed for property '${property}'`);
        }
      }
      
      target[property] = value;
      return true;
    }
  });
}

// Example with role-based access
const sensitiveData = createAccessControlledObject({
  publicInfo: 'This is public',
  salary: 75000,
  ssn: '123-45-6789',
  internalNotes: 'Confidential notes'
}, {
  salary: {
    read: ['admin', 'hr'],
    write: ['admin'],
    filter: (value, user) => user.role === 'hr' ? `$${Math.floor(value/1000)}K` : value
  },
  ssn: {
    read: ['admin'],
    write: ['admin'],
    filter: (value, user) => user.role === 'admin' ? value : '***-**-' + value.slice(-4)
  },
  internalNotes: {
    read: ['admin', 'manager'],
    write: ['admin', 'manager'],
    validate: (value, user) => typeof value === 'string' && value.length > 0
  }
});

// Test access control
console.log('Public info:', sensitiveData.publicInfo); // Accessible to all

sensitiveData._setUser({ role: 'user', id: 1 });
try {
  console.log('Salary:', sensitiveData.salary); // Should throw error
} catch (error) {
  console.log('Access denied:', error.message);
}

sensitiveData._setUser({ role: 'hr', id: 2 });
console.log('Salary (HR view):', sensitiveData.salary); // Filtered view

sensitiveData._setUser({ role: 'admin', id: 3 });
console.log('Salary (Admin view):', sensitiveData.salary); // Full access

module.exports = {
  createValidatedObject,
  ValidationError,
  APIWrapper,
  createDebugProxy,
  createAccessControlledObject
};