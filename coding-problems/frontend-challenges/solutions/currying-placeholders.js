/**
 * File: currying-placeholders.js
 * Description: Advanced currying with placeholder support for flexible argument positioning
 * 
 * Learning objectives:
 * - Understand placeholder pattern in functional programming
 * - Learn to handle partial application with gaps
 * - See advanced currying with positional control
 * 
 * Time Complexity: O(n) where n is number of arguments
 * Space Complexity: O(n) for argument storage and placeholder tracking
 */

// =======================
// Approach 1: Basic Placeholder Currying
// =======================

/**
 * Curry with placeholder support
 * Allows skipping arguments with a special placeholder symbol
 * 
 * Mental model: Think of placeholders as "slots" that can be filled later
 * while keeping the argument positions intact
 */
function curryWithPlaceholders(fn, placeholder = Symbol('placeholder')) {
  return function curried(...args) {
    // Filter out placeholders to check if we have enough real arguments
    const filledArgs = args.filter(arg => arg !== placeholder);
    
    // If we have enough arguments and no placeholders, execute
    if (filledArgs.length >= fn.length && !args.includes(placeholder)) {
      return fn.apply(this, args);
    }
    
    // Return function that accepts more arguments and fills placeholders
    return function(...nextArgs) {
      const mergedArgs = [];
      let nextIndex = 0;
      
      // Process each existing argument
      args.forEach(arg => {
        if (arg === placeholder && nextIndex < nextArgs.length) {
          // Replace placeholder with next argument
          mergedArgs.push(nextArgs[nextIndex++]);
        } else {
          // Keep existing argument (including unfilled placeholders)
          mergedArgs.push(arg);
        }
      });
      
      // Add any remaining next arguments
      while (nextIndex < nextArgs.length) {
        mergedArgs.push(nextArgs[nextIndex++]);
      }
      
      // Recursively curry with merged arguments
      return curried.apply(this, mergedArgs);
    };
  };
}

// =======================
// Approach 2: Named Placeholder System
// =======================

/**
 * Advanced placeholder system with named placeholders
 * Allows more readable and maintainable placeholder usage
 */
function curryWithNamedPlaceholders(fn, placeholderMap = {}) {
  const argNames = Object.keys(placeholderMap);
  const arity = fn.length;
  
  return function curried(...args) {
    const argMap = new Map();
    const hasPlaceholders = args.some(arg => 
      typeof arg === 'object' && arg && arg._isPlaceholder
    );
    
    // Process arguments and map them appropriately
    args.forEach((arg, index) => {
      if (arg && arg._isPlaceholder) {
        // Skip placeholder - will be filled later
        return;
      }
      
      if (argNames[index]) {
        argMap.set(argNames[index], arg);
      } else {
        argMap.set(index, arg);
      }
    });
    
    // Check if we have all required arguments
    const filledCount = argMap.size;
    if (filledCount >= arity && !hasPlaceholders) {
      // Convert map back to ordered arguments
      const orderedArgs = [];
      for (let i = 0; i < arity; i++) {
        orderedArgs.push(argMap.get(argNames[i] || i));
      }
      return fn.apply(this, orderedArgs);
    }
    
    // Return function for more arguments
    return function(...nextArgs) {
      return curried.apply(this, fillPlaceholders(args, nextArgs));
    };
  };
  
  // Helper to fill placeholders with new arguments
  function fillPlaceholders(existingArgs, newArgs) {
    const result = [];
    let newIndex = 0;
    
    existingArgs.forEach(arg => {
      if (arg && arg._isPlaceholder && newIndex < newArgs.length) {
        result.push(newArgs[newIndex++]);
      } else {
        result.push(arg);
      }
    });
    
    // Add remaining new arguments
    result.push(...newArgs.slice(newIndex));
    
    return result;
  }
}

// =======================
// Approach 3: Lodash-style Placeholder Implementation
// =======================

/**
 * Implementation similar to Lodash's curry with _ placeholder
 * Most commonly used in real-world applications
 */
function curryLodashStyle(fn) {
  // Create a unique placeholder symbol
  const _ = Object.create(null);
  _ === Object.setPrototypeOf(_, null); // Make it truly unique
  
  function curried(...args) {
    // Count non-placeholder arguments
    const filledArgs = args.filter(arg => arg !== _).length;
    const placeholderCount = args.filter(arg => arg === _).length;
    
    // Execute if we have enough arguments and no trailing placeholders
    if (filledArgs >= fn.length && (placeholderCount === 0 || 
        args.slice(-1)[0] !== _ || args.length >= fn.length)) {
      return fn.apply(this, args.slice(0, fn.length));
    }
    
    // Return curried function
    return function(...nextArgs) {
      const newArgs = [];
      let nextIndex = 0;
      
      // Fill placeholders first
      for (let i = 0; i < args.length; i++) {
        if (args[i] === _ && nextIndex < nextArgs.length) {
          newArgs[i] = nextArgs[nextIndex++];
        } else {
          newArgs[i] = args[i];
        }
      }
      
      // Add remaining arguments
      newArgs.push(...nextArgs.slice(nextIndex));
      
      return curried.apply(this, newArgs);
    };
  }
  
  // Attach placeholder to curried function for external use
  curried.placeholder = _;
  return curried;
}

// =======================
// Approach 4: Flexible Placeholder with Position Swapping
// =======================

/**
 * Advanced placeholder system that allows argument position swapping
 * and complex argument manipulation
 */
function curryFlexible(fn) {
  const _ = Symbol('placeholder');
  
  function curried(...args) {
    const processedArgs = processArguments(args);
    
    if (isComplete(processedArgs)) {
      return fn.apply(this, processedArgs.slice(0, fn.length));
    }
    
    return function(...nextArgs) {
      return curried.apply(this, mergeArguments(args, nextArgs));
    };
  }
  
  // Process arguments to handle special placeholder operations
  function processArguments(args) {
    return args.map(arg => {
      // Handle position swapping: {_swap: [1, 2]} swaps positions 1 and 2
      if (arg && typeof arg === 'object' && arg._swap) {
        return arg; // Keep swap instruction for later processing
      }
      
      // Handle conditional placeholders
      if (arg && typeof arg === 'object' && arg._condition) {
        return arg._condition() ? arg._value : _;
      }
      
      return arg;
    });
  }
  
  // Check if we have enough non-placeholder arguments
  function isComplete(args) {
    const nonPlaceholders = args.filter(arg => 
      arg !== _ && !(arg && typeof arg === 'object' && arg._swap)
    ).length;
    
    return nonPlaceholders >= fn.length;
  }
  
  // Merge existing and new arguments, handling placeholders
  function mergeArguments(existingArgs, newArgs) {
    const result = [...existingArgs];
    let newIndex = 0;
    
    // First pass: fill placeholders
    for (let i = 0; i < result.length && newIndex < newArgs.length; i++) {
      if (result[i] === _) {
        result[i] = newArgs[newIndex++];
      }
    }
    
    // Second pass: add remaining arguments
    result.push(...newArgs.slice(newIndex));
    
    return result;
  }
  
  curried.placeholder = _;
  return curried;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Placeholder Examples ===');

// Example 1: Basic placeholder usage
const add3 = (a, b, c) => a + b + c;
const curriedAdd = curryWithPlaceholders(add3);
const _ = curriedAdd.placeholder || Symbol('placeholder');

// Various ways to use placeholders
const add5AndSomething = curriedAdd(5, _, _);
console.log('5 + 2 + 3 =', add5AndSomething(2, 3)); // 10

const addSomethingAnd7 = curriedAdd(_, _, 7);
console.log('1 + 2 + 7 =', addSomethingAnd7(1, 2)); // 10

const addSomethingTo5And7 = curriedAdd(_, 5, 7);
console.log('3 + 5 + 7 =', addSomethingTo5And7(3)); // 15

// Example 2: Lodash-style placeholders
console.log('\n=== Lodash-style Placeholder Examples ===');

const multiply3 = (a, b, c) => a * b * c;
const lodashCurry = curryLodashStyle(multiply3);
const __ = lodashCurry.placeholder;

const multiplyBy2AndSomething = lodashCurry(__, 2, __);
console.log('3 * 2 * 4 =', multiplyBy2AndSomething(3, 4)); // 24

const double = lodashCurry(2, __, 1);
console.log('Double 5:', double(5)); // 10

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Event Handler Builder with Placeholders
 * Create flexible event handlers with placeholder support
 */
function createEventHandlerBuilder() {
  const handleEvent = curryLodashStyle((eventType, element, options, handler, event) => {
    // Configure event handling with all parameters
    console.log(`Handling ${eventType} on`, element.tagName || element);
    
    if (options.preventDefault) {
      event.preventDefault();
    }
    
    if (options.stopPropagation) {
      event.stopPropagation();
    }
    
    return handler(event);
  });
  
  const _ = handleEvent.placeholder;
  
  // Pre-configured handlers with placeholders
  const clickHandler = handleEvent('click', _, _, _);
  const submitHandler = handleEvent('submit', _, { preventDefault: true }, _);
  
  return {
    // Create button click handler
    createButtonHandler: (handler) => {
      return clickHandler(document.body, {}, handler);
    },
    
    // Create form submit handler  
    createFormHandler: (formElement, handler) => {
      return submitHandler(formElement, handler);
    },
    
    // Flexible handler creation
    createCustomHandler: (element, options, handler) => {
      return clickHandler(element, options, handler);
    }
  };
}

/**
 * Use Case 2: API Request Builder with Placeholders
 * Build API requests with flexible parameter positioning
 */
function createAPIRequestBuilder() {
  const makeRequest = curryLodashStyle(async (method, baseURL, endpoint, headers, body, options) => {
    const url = `${baseURL}${endpoint}`;
    const config = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      ...options,
      ...(body && { body: JSON.stringify(body) })
    };
    
    console.log(`API Request: ${method} ${url}`);
    // return fetch(url, config);
    return { url, config }; // Mock for example
  });
  
  const _ = makeRequest.placeholder;
  
  // Pre-configured request builders
  const getRequest = makeRequest('GET', _, _, {}, null, _);
  const postRequest = makeRequest('POST', _, _, _, _, {});
  const authenticatedRequest = makeRequest(_, _, _, { Authorization: 'Bearer token' }, _, _);
  
  return {
    // API-specific builders
    buildGet: (baseURL, endpoint, options = {}) => 
      getRequest(baseURL, endpoint, options),
    
    buildPost: (baseURL, endpoint, headers, body) => 
      postRequest(baseURL, endpoint, headers, body),
    
    buildAuthenticatedGet: (method, baseURL, endpoint, options) =>
      authenticatedRequest(method, baseURL, endpoint, options),
    
    // Usage examples
    getUsersAPI: getRequest('https://api.example.com', '/users'),
    createUserAPI: postRequest('https://api.example.com', '/users', {}),
    
    // Flexible builder
    buildRequest: (config) => {
      return makeRequest(
        config.method || 'GET',
        config.baseURL,
        config.endpoint,
        config.headers || {},
        config.body || null,
        config.options || {}
      );
    }
  };
}

/**
 * Use Case 3: Validation Builder with Placeholder Rules
 * Create complex validation chains with flexible rule positioning
 */
function createValidationBuilder() {
  const validate = curryLodashStyle((fieldName, required, minLength, maxLength, pattern, customValidators, value) => {
    const errors = [];
    
    // Required validation
    if (required && (value == null || value === '')) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors, value };
    }
    
    if (value == null || value === '') {
      return { isValid: true, errors: [], value };
    }
    
    // Length validations
    if (minLength && value.length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters`);
    }
    
    if (maxLength && value.length > maxLength) {
      errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
    }
    
    // Pattern validation
    if (pattern && !pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`);
    }
    
    // Custom validators
    if (customValidators) {
      customValidators.forEach(validator => {
        const result = validator(value);
        if (typeof result === 'string') {
          errors.push(result);
        } else if (!result) {
          errors.push(`${fieldName} failed custom validation`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      value
    };
  });
  
  const _ = validate.placeholder;
  
  // Common validation patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
  
  // Pre-configured validators
  const validateRequired = validate(_, true, _, _, _, _);
  const validateEmail = validate(_, true, _, _, emailPattern, _);
  const validatePhone = validate(_, false, _, _, phonePattern, _);
  const validatePassword = validate(_, true, 8, 128, _, [
    (value) => /[A-Z]/.test(value) || 'Password must contain uppercase letter',
    (value) => /[a-z]/.test(value) || 'Password must contain lowercase letter',
    (value) => /\d/.test(value) || 'Password must contain a number'
  ]);
  
  return {
    // Field-specific validators
    validateName: validateRequired('Name', _, _, _, _),
    validateEmail: validateEmail('Email', _, _, _, _),
    validatePhone: validatePhone('Phone', _, _, _, _),
    validatePassword: validatePassword('Password', _, _, _, _, _),
    
    // Flexible validator builder
    buildValidator: (fieldName, rules = {}) => {
      return validate(
        fieldName,
        rules.required || false,
        rules.minLength || null,
        rules.maxLength || null,
        rules.pattern || null,
        rules.customValidators || null
      );
    },
    
    // Form validation
    validateForm: (formData, fieldRules) => {
      const results = {};
      const allErrors = [];
      
      Object.keys(fieldRules).forEach(fieldName => {
        const validator = validate(
          fieldName,
          fieldRules[fieldName].required || false,
          fieldRules[fieldName].minLength || null,
          fieldRules[fieldName].maxLength || null,
          fieldRules[fieldName].pattern || null,
          fieldRules[fieldName].customValidators || null
        );
        
        results[fieldName] = validator(formData[fieldName]);
        allErrors.push(...results[fieldName].errors);
      });
      
      return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        fieldResults: results
      };
    }
  };
}

/**
 * Use Case 4: Data Transformation Pipeline with Placeholders
 * Create flexible data transformation chains
 */
function createDataTransformer() {
  const transform = curryLodashStyle((mapper, filter, sorter, grouper, reducer, data) => {
    let result = data;
    
    // Apply transformations in sequence
    if (mapper) result = result.map(mapper);
    if (filter) result = result.filter(filter);
    if (sorter) result = result.sort(sorter);
    if (grouper) result = groupBy(result, grouper);
    if (reducer) result = reducer(result);
    
    return result;
  });
  
  const _ = transform.placeholder;
  
  // Helper function for grouping
  function groupBy(array, keyFn) {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {});
  }
  
  // Pre-configured transformers
  const mapAndFilter = transform(_, _, null, null, null);
  const sortAndGroup = transform(null, null, _, _, null);
  const filterAndReduce = transform(null, _, null, null, _);
  
  return {
    // Specialized transformers
    createUserTransformer: () => mapAndFilter(
      user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }),
      user => user.active
    ),
    
    createDataAggregator: (groupKey, aggregateFn) => sortAndGroup(
      (a, b) => a[groupKey].localeCompare(b[groupKey]),
      item => item[groupKey]
    ),
    
    createSummaryReport: (filterFn, summaryFn) => filterAndReduce(
      filterFn,
      summaryFn
    ),
    
    // Flexible transformer
    buildTransformer: (config) => {
      return transform(
        config.mapper || null,
        config.filter || null,
        config.sorter || null,
        config.grouper || null,
        config.reducer || null
      );
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Event handler example
const eventBuilder = createEventHandlerBuilder();
const buttonHandler = eventBuilder.createButtonHandler((e) => {
  console.log('Button clicked!', e.target);
});

// API builder example
const apiBuilder = createAPIRequestBuilder();
const getUsersCall = apiBuilder.getUsersAPI();
console.log('Get users API call:', getUsersCall);

// Validation example
const validationBuilder = createValidationBuilder();
const nameValidator = validationBuilder.validateName;
console.log('Name validation:', nameValidator('John Doe'));

// Data transformer example
const dataTransformer = createDataTransformer();
const userTransformer = dataTransformer.createUserTransformer();
const sampleData = [
  { firstName: 'John', lastName: 'Doe', active: true },
  { firstName: 'Jane', lastName: 'Smith', active: false }
];
console.log('Transformed users:', userTransformer(sampleData));

// Export all implementations
module.exports = {
  curryWithPlaceholders,
  curryWithNamedPlaceholders,
  curryLodashStyle,
  curryFlexible,
  createEventHandlerBuilder,
  createAPIRequestBuilder,
  createValidationBuilder,
  createDataTransformer
};

/**
 * Key Interview Points:
 * 
 * 1. Placeholder Benefits:
 *    - Flexible argument positioning
 *    - Better partial application control
 *    - More readable function composition
 *    - Reduced need for wrapper functions
 * 
 * 2. Implementation Challenges:
 *    - Argument position tracking
 *    - Placeholder replacement logic
 *    - Performance with many placeholders
 *    - Memory management in nested calls
 * 
 * 3. Placeholder Strategies:
 *    - Symbol-based (unique, non-enumerable)
 *    - Object-based (flexible, extensible)
 *    - Convention-based (simple, widely adopted)
 * 
 * 4. Real-world Applications:
 *    - Event handler configuration
 *    - API client builders
 *    - Validation chains
 *    - Data transformation pipelines
 * 
 * 5. Performance Considerations:
 *    - Argument copying overhead
 *    - Closure memory usage
 *    - Placeholder detection cost
 *    - Function call optimization
 */