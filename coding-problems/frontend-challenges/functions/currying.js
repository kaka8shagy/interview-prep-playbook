/**
 * File: currying.js
 * Description: Multiple implementations of currying with detailed explanations
 * 
 * Learning objectives:
 * - Understand currying concept and use cases
 * - Learn different currying implementation techniques
 * - See partial application and composition patterns
 * 
 * Time Complexity: O(1) for curry setup, O(n) for argument collection
 * Space Complexity: O(n) where n is number of arguments
 */

// =======================
// Approach 1: Basic Currying
// =======================

/**
 * Basic curry implementation
 * Transforms function(a, b, c) into curry(a)(b)(c) or curry(a, b)(c), etc.
 * 
 * Mental model: Currying converts a function that takes multiple arguments
 * into a series of functions that each take one argument
 */
function curryBasic(fn) {
  // Store the expected number of arguments from original function
  const arity = fn.length;
  
  // Return a curried function that collects arguments
  return function curried(...args) {
    // If we have enough arguments, execute the original function
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    
    // Otherwise, return a new function that collects more arguments
    return function(...nextArgs) {
      // Combine previous and new arguments, then recurse
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// =======================
// Approach 2: Advanced Curry with Argument Length Detection
// =======================

/**
 * Advanced curry that handles functions with default parameters
 * and variable argument lists more intelligently
 */
function curryAdvanced(fn, arity = fn.length) {
  return function curried(...args) {
    // Check if we have collected enough arguments
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    
    // Return a new curried function with accumulated arguments
    return (...nextArgs) => {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// =======================
// Approach 3: Curry with Named Arguments Support
// =======================

/**
 * Curry implementation that supports both positional and named arguments
 * Useful for functions with many parameters where order might be confusing
 */
function curryNamed(fn, argNames = []) {
  const arity = argNames.length || fn.length;
  const argMap = new Map();
  
  return function curried(...args) {
    // Handle positional arguments
    args.forEach((arg, index) => {
      if (index < argNames.length) {
        argMap.set(argNames[index], arg);
      }
    });
    
    // Check if all required arguments are provided
    if (argMap.size >= arity) {
      // Convert map back to positional arguments
      const orderedArgs = argNames.map(name => argMap.get(name));
      return fn.apply(this, orderedArgs);
    }
    
    // Return function with methods for both positional and named args
    const nextCurried = (...nextArgs) => {
      return curried.apply(this, [...args, ...nextArgs]);
    };
    
    // Add method for setting named arguments
    nextCurried.set = (name, value) => {
      argMap.set(name, value);
      return nextCurried;
    };
    
    return nextCurried;
  };
}

// =======================
// Approach 4: Infinite Curry
// =======================

/**
 * Curry that can accept unlimited arguments until explicitly called
 * Useful for functions like sum() where argument count is unknown
 */
function curryInfinite(fn) {
  return function curried(...args) {
    // If called with no arguments, execute with collected args
    if (args.length === 0) {
      return fn.apply(this, curried._args || []);
    }
    
    // Collect arguments
    const allArgs = (curried._args || []).concat(args);
    
    // Create new curried function with accumulated args
    const newCurried = function(...nextArgs) {
      return curried.apply(this, allArgs.concat(nextArgs));
    };
    
    // Store accumulated arguments
    newCurried._args = allArgs;
    
    // Add valueOf/toString for implicit conversion
    newCurried.valueOf = () => fn.apply(this, allArgs);
    newCurried.toString = () => fn.apply(this, allArgs).toString();
    
    return newCurried;
  };
}

// =======================
// Approach 5: Curry with Method Chaining
// =======================

/**
 * Curry implementation that supports method chaining and partial application
 * Provides fluent interface for complex function composition
 */
function curryFluent(fn, context = null) {
  const arity = fn.length;
  
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(context || this, args);
    }
    
    const partial = (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
    
    // Add utility methods
    partial.partial = (...partialArgs) => curried(...args, ...partialArgs);
    partial.bind = (newContext) => curryFluent(fn, newContext)(...args);
    partial.arity = () => arity - args.length;
    partial.args = () => [...args];
    
    return partial;
  };
}

// =======================
// Usage Examples and Test Cases
// =======================

// Example 1: Basic arithmetic operations
console.log('\n=== Basic Currying Examples ===');

const add = (a, b, c) => a + b + c;
const curriedAdd = curryBasic(add);

console.log('Direct call:', curriedAdd(1, 2, 3)); // 6
console.log('Partial application:', curriedAdd(1)(2)(3)); // 6
console.log('Mixed application:', curriedAdd(1, 2)(3)); // 6

// Example 2: Function composition with currying
const multiply = (a, b) => a * b;
const curriedMultiply = curryBasic(multiply);

const double = curriedMultiply(2);
const triple = curriedMultiply(3);

console.log('Double 5:', double(5)); // 10
console.log('Triple 4:', triple(4)); // 12

// Example 3: Infinite curry for sum
console.log('\n=== Infinite Curry Example ===');
const sum = (...args) => args.reduce((a, b) => a + b, 0);
const curriedSum = curryInfinite(sum);

const result = curriedSum(1)(2)(3)(4, 5); // Collect args: [1,2,3,4,5]
console.log('Sum result:', +result); // 15 (implicit valueOf conversion)

// Example 4: Named arguments curry
console.log('\n=== Named Arguments Example ===');
const createUser = (name, email, age) => ({ name, email, age });
const curriedCreateUser = curryNamed(createUser, ['name', 'email', 'age']);

const userBuilder = curriedCreateUser
  .set('name', 'John')
  .set('email', 'john@example.com');
  
console.log('User:', userBuilder(25)); // { name: 'John', email: 'john@example.com', age: 25 }

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Event Handler Factory
 * Create specialized event handlers with currying
 */
function createEventHandler() {
  const handleEvent = curryBasic((eventType, selector, handler, event) => {
    if (event.target.matches(selector)) {
      console.log(`${eventType} event on ${selector}`);
      handler(event);
    }
  });
  
  // Create specialized handlers
  const handleClick = handleEvent('click');
  const handleButtonClick = handleClick('.button');
  const handleSubmitClick = handleClick('.submit-btn');
  
  return {
    handleClick,
    handleButtonClick,
    handleSubmitClick,
    
    // Usage example
    attachListeners() {
      document.addEventListener('click', handleButtonClick((e) => {
        console.log('Button clicked:', e.target.textContent);
      }));
      
      document.addEventListener('click', handleSubmitClick((e) => {
        e.preventDefault();
        console.log('Form submission prevented');
      }));
    }
  };
}

/**
 * Use Case 2: API Configuration Builder
 * Build API calls with consistent configuration
 */
function createAPIBuilder() {
  const makeRequest = curryBasic(async (method, baseURL, endpoint, options, data) => {
    const url = `${baseURL}${endpoint}`;
    const config = {
      method,
      ...options,
      ...(data && { body: JSON.stringify(data) })
    };
    
    console.log(`Making ${method} request to ${url}`);
    // return fetch(url, config);
    return { url, config }; // Mock response
  });
  
  // Build API methods for different environments
  const prodAPI = makeRequest('GET', 'https://api.prod.com');
  const devAPI = makeRequest('GET', 'https://api.dev.com');
  
  const prodGET = prodAPI;
  const prodPOST = makeRequest('POST', 'https://api.prod.com');
  
  // Create endpoint-specific functions
  const getUsers = prodGET('/users');
  const createUser = prodPOST('/users');
  
  return {
    getUsers: (options = {}) => getUsers(options),
    createUser: (options = {}, userData = {}) => createUser(options, userData),
    
    // Usage examples
    async fetchUserList() {
      return getUsers({ headers: { 'Authorization': 'Bearer token' } });
    },
    
    async addUser(userData) {
      return createUser(
        { headers: { 'Content-Type': 'application/json' } },
        userData
      );
    }
  };
}

/**
 * Use Case 3: Validation Chain Builder
 * Create reusable validation chains with currying
 */
function createValidationChain() {
  const validate = curryBasic((field, rules, errorMessages, value) => {
    const errors = [];
    
    rules.forEach((rule, index) => {
      if (!rule(value)) {
        errors.push(errorMessages[index] || `Validation failed for ${field}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      field,
      value
    };
  });
  
  // Common validation rules
  const rules = {
    required: (value) => value != null && value !== '',
    minLength: (min) => (value) => value && value.length >= min,
    maxLength: (max) => (value) => value && value.length <= max,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    numeric: (value) => !isNaN(Number(value))
  };
  
  // Build field validators
  const validateName = validate('name', [
    rules.required,
    rules.minLength(2),
    rules.maxLength(50)
  ], [
    'Name is required',
    'Name must be at least 2 characters',
    'Name cannot exceed 50 characters'
  ]);
  
  const validateEmail = validate('email', [
    rules.required,
    rules.email
  ], [
    'Email is required',
    'Please enter a valid email address'
  ]);
  
  return {
    validateName,
    validateEmail,
    
    // Validate entire form
    validateForm(formData) {
      const results = {
        name: validateName(formData.name),
        email: validateEmail(formData.email)
      };
      
      const allErrors = Object.values(results)
        .filter(r => !r.isValid)
        .flatMap(r => r.errors);
      
      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        fieldResults: results
      };
    }
  };
}

/**
 * Use Case 4: Logger Factory
 * Create specialized loggers with different levels and contexts
 */
function createLoggerFactory() {
  const log = curryBasic((level, context, timestamp, message, data) => {
    const logEntry = {
      level,
      context,
      timestamp: timestamp || new Date().toISOString(),
      message,
      data
    };
    
    console.log(`[${level}] ${context}: ${message}`, data || '');
    return logEntry;
  });
  
  // Create level-specific loggers
  const error = log('ERROR');
  const warn = log('WARN');
  const info = log('INFO');
  const debug = log('DEBUG');
  
  // Create context-specific loggers
  const apiError = error('API');
  const dbError = error('DATABASE');
  const authWarn = warn('AUTH');
  
  return {
    // Pre-configured loggers
    apiError: (message, data) => apiError()(message, data),
    dbError: (message, data) => dbError()(message, data),
    authWarn: (message, data) => authWarn()(message, data),
    
    // Factory for custom loggers
    createLogger: (level, context) => log(level)(context)(),
    
    // Usage example
    logUserAction(userId, action) {
      const userLogger = info('USER_ACTION');
      return userLogger()(`User ${userId} performed ${action}`, { userId, action });
    }
  };
}

// =======================
// Advanced Patterns and Optimizations
// =======================

/**
 * Memoized curry - caches results for performance
 */
function curryMemoized(fn) {
  const cache = new Map();
  
  return function curried(...args) {
    const key = args.join(',');
    
    if (cache.has(key) && args.length >= fn.length) {
      return cache.get(key);
    }
    
    if (args.length >= fn.length) {
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    }
    
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

/**
 * Type-aware curry that validates arguments
 */
function curryTyped(fn, types = []) {
  return function curried(...args) {
    // Validate argument types if provided
    args.forEach((arg, index) => {
      if (types[index] && typeof arg !== types[index]) {
        throw new TypeError(`Argument ${index} should be ${types[index]}, got ${typeof arg}`);
      }
    });
    
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    
    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  };
}

// Test the real-world examples
console.log('\n=== Real-world Examples ===');

// API builder example
const apiBuilder = createAPIBuilder();
console.log('API call result:', apiBuilder.fetchUserList());

// Validation chain example
const validator = createValidationChain();
console.log('Validation result:', validator.validateForm({
  name: 'John',
  email: 'john@example.com'
}));

// Logger factory example
const logger = createLoggerFactory();
logger.apiError('Failed to fetch users', { endpoint: '/users' });
logger.logUserAction('user123', 'login');

// Export all implementations
module.exports = {
  curryBasic,
  curryAdvanced,
  curryNamed,
  curryInfinite,
  curryFluent,
  curryMemoized,
  curryTyped,
  createEventHandler,
  createAPIBuilder,
  createValidationChain,
  createLoggerFactory
};

/**
 * Key Interview Points:
 * 
 * 1. Currying vs Partial Application:
 *    - Currying: Transforms n-ary function into series of unary functions
 *    - Partial Application: Fixes some arguments, returns function expecting rest
 * 
 * 2. Benefits of Currying:
 *    - Function reusability and composition
 *    - Easier unit testing
 *    - Configuration and specialization
 *    - Functional programming patterns
 * 
 * 3. Implementation Considerations:
 *    - Arity detection (function.length)
 *    - Context preservation (this binding)
 *    - Memory management (closure accumulation)
 *    - Performance implications
 * 
 * 4. Real-world Applications:
 *    - Event handler factories
 *    - API client builders
 *    - Validation chains
 *    - Logger configuration
 *    - React component props specialization
 * 
 * 5. Advanced Features:
 *    - Named arguments support
 *    - Infinite argument collection
 *    - Method chaining
 *    - Type validation
 *    - Memoization
 */