/**
 * File: pipe-method.js
 * Description: Multiple implementations of pipe method for function composition
 * 
 * Learning objectives:
 * - Understand function composition and data flow
 * - Learn different pipe implementation approaches
 * - See async pipe and error handling patterns
 * 
 * Time Complexity: O(n) where n is number of functions
 * Space Complexity: O(1) additional space per function call
 */

// =======================
// Approach 1: Basic Pipe Implementation
// =======================

/**
 * Basic pipe implementation
 * Chains functions left-to-right: pipe(f1, f2, f3)(x) = f3(f2(f1(x)))
 * 
 * Mental model: Think of data flowing through a pipeline where each
 * function transforms the data before passing it to the next
 */
function pipe(...functions) {
  // Validate that all arguments are functions
  if (functions.some(fn => typeof fn !== 'function')) {
    throw new TypeError('All arguments must be functions');
  }
  
  // Return a new function that applies all transformations
  return function piped(initialValue) {
    // Use reduce to apply functions sequentially
    // Starting with initialValue, pass result to each function
    return functions.reduce((acc, fn) => fn(acc), initialValue);
  };
}

// =======================
// Approach 2: Compose (Right-to-Left)
// =======================

/**
 * Compose function - reverse of pipe (right-to-left)
 * compose(f1, f2, f3)(x) = f1(f2(f3(x)))
 * 
 * Mathematical function composition order
 */
function compose(...functions) {
  if (functions.some(fn => typeof fn !== 'function')) {
    throw new TypeError('All arguments must be functions');
  }
  
  return function composed(initialValue) {
    // Apply functions in reverse order (right-to-left)
    return functions.reduceRight((acc, fn) => fn(acc), initialValue);
  };
}

// =======================
// Approach 3: Async Pipe
// =======================

/**
 * Async pipe that handles promises and async functions
 * Waits for each function to complete before calling the next
 */
function asyncPipe(...functions) {
  if (functions.some(fn => typeof fn !== 'function')) {
    throw new TypeError('All arguments must be functions');
  }
  
  return async function asyncPiped(initialValue) {
    let result = initialValue;
    
    // Sequential execution of async functions
    for (const fn of functions) {
      try {
        // Await each function call to handle both sync and async functions
        result = await fn(result);
      } catch (error) {
        // Re-throw with additional context
        throw new Error(`Error in pipe function: ${error.message}`);
      }
    }
    
    return result;
  };
}

// =======================
// Approach 4: Pipe with Error Handling
// =======================

/**
 * Pipe with built-in error handling and debugging
 * Provides detailed error information and optional step logging
 */
function pipeWithErrorHandling(...functions) {
  return function pipeWithErrors(initialValue, options = {}) {
    const { debug = false, onError = null } = options;
    
    let result = initialValue;
    
    functions.forEach((fn, index) => {
      if (typeof fn !== 'function') {
        throw new TypeError(`Argument at index ${index} is not a function`);
      }
      
      try {
        const previousResult = result;
        result = fn(result);
        
        // Debug logging
        if (debug) {
          console.log(`Step ${index + 1}:`, {
            function: fn.name || 'anonymous',
            input: previousResult,
            output: result
          });
        }
      } catch (error) {
        const errorInfo = {
          step: index + 1,
          functionName: fn.name || 'anonymous',
          input: result,
          error: error.message
        };
        
        // Call custom error handler if provided
        if (onError) {
          const shouldContinue = onError(errorInfo);
          if (!shouldContinue) {
            throw new Error(`Pipeline failed at step ${index + 1}: ${error.message}`);
          }
          // If error handler returns truthy, continue with original value
          continue;
        }
        
        throw new Error(`Pipeline failed at step ${index + 1} (${fn.name || 'anonymous'}): ${error.message}`);
      }
    });
    
    return result;
  };
}

// =======================
// Approach 5: Lazy Pipe (Generator-based)
// =======================

/**
 * Lazy pipe implementation using generators
 * Functions are not executed until the result is needed
 */
function lazyPipe(...functions) {
  if (functions.some(fn => typeof fn !== 'function')) {
    throw new TypeError('All arguments must be functions');
  }
  
  return function* lazyPiped(initialValue) {
    let result = initialValue;
    
    for (const [index, fn] of functions.entries()) {
      try {
        result = fn(result);
        // Yield intermediate results for inspection
        yield { step: index + 1, result, function: fn.name || 'anonymous' };
      } catch (error) {
        throw new Error(`Lazy pipe failed at step ${index + 1}: ${error.message}`);
      }
    }
    
    return result;
  };
}

// =======================
// Approach 6: Branching Pipe
// =======================

/**
 * Advanced pipe that supports conditional branches
 * Allows different paths based on intermediate results
 */
function branchingPipe(...steps) {
  return function branched(initialValue) {
    let result = initialValue;
    
    for (const step of steps) {
      if (typeof step === 'function') {
        // Regular function step
        result = step(result);
      } else if (typeof step === 'object' && step.condition && step.then) {
        // Conditional branch: { condition: fn, then: fn, else: fn }
        if (step.condition(result)) {
          result = step.then(result);
        } else if (step.else) {
          result = step.else(result);
        }
      } else {
        throw new Error('Invalid step in branching pipe');
      }
    }
    
    return result;
  };
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Pipe Examples ===');

// Basic pipe usage
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x ** 2;

const pipeline = pipe(addOne, double, square);
console.log('pipe(addOne, double, square)(3):', pipeline(3)); // (3+1)*2^2 = 64

// Compose example (reverse order)
const composePipeline = compose(square, double, addOne);
console.log('compose(square, double, addOne)(3):', composePipeline(3)); // ((3+1)*2)^2 = 64

// String processing pipeline
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const processString = pipe(trim, toLowerCase, capitalize);
console.log('String processing:', processString('  HELLO WORLD  ')); // "Hello world"

console.log('\n=== Async Pipe Example ===');

// Async pipeline
const fetchData = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id, data: `data-${id}` };
};

const transformData = async (obj) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return { ...obj, transformed: true };
};

const validateData = (obj) => {
  if (!obj.data) throw new Error('Invalid data');
  return obj;
};

const asyncPipeline = asyncPipe(fetchData, validateData, transformData);

asyncPipeline(123).then(result => {
  console.log('Async pipeline result:', result);
}).catch(error => {
  console.error('Async pipeline error:', error.message);
});

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Data Transformation Pipeline
 * Process API responses through multiple transformation steps
 */
function createDataProcessor() {
  // Data cleaning functions
  const removeNullValues = (data) => {
    if (Array.isArray(data)) {
      return data.filter(item => item != null);
    }
    if (typeof data === 'object' && data !== null) {
      const cleaned = {};
      Object.keys(data).forEach(key => {
        if (data[key] != null) {
          cleaned[key] = data[key];
        }
      });
      return cleaned;
    }
    return data;
  };
  
  const normalizeKeys = (data) => {
    if (Array.isArray(data)) {
      return data.map(normalizeKeys);
    }
    if (typeof data === 'object' && data !== null) {
      const normalized = {};
      Object.keys(data).forEach(key => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
        normalized[normalizedKey] = normalizeKeys(data[key]);
      });
      return normalized;
    }
    return data;
  };
  
  const addMetadata = (data) => ({
    ...data,
    _metadata: {
      processedAt: new Date().toISOString(),
      version: '1.0'
    }
  });
  
  const validateRequired = (requiredFields) => (data) => {
    const missing = requiredFields.filter(field => !(field in data));
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    return data;
  };
  
  return {
    // Create processing pipeline
    createPipeline: (...customSteps) => {
      const standardSteps = [
        removeNullValues,
        normalizeKeys,
        ...customSteps,
        addMetadata
      ];
      return pipe(...standardSteps);
    },
    
    // User data processor
    processUser: pipe(
      removeNullValues,
      normalizeKeys,
      validateRequired(['name', 'email']),
      (user) => ({
        ...user,
        display_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name
      }),
      addMetadata
    ),
    
    // Product data processor
    processProduct: pipe(
      removeNullValues,
      normalizeKeys,
      validateRequired(['name', 'price']),
      (product) => ({
        ...product,
        price: parseFloat(product.price),
        slug: product.name.toLowerCase().replace(/\s+/g, '-')
      }),
      addMetadata
    )
  };
}

/**
 * Use Case 2: Form Validation Pipeline
 * Chain validation rules with detailed error reporting
 */
function createValidationPipeline() {
  // Individual validation functions
  const validateRequired = (field) => (value) => {
    if (value == null || value === '') {
      throw new Error(`${field} is required`);
    }
    return value;
  };
  
  const validateMinLength = (min, field) => (value) => {
    if (value.length < min) {
      throw new Error(`${field} must be at least ${min} characters`);
    }
    return value;
  };
  
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    return value;
  };
  
  const validatePassword = (value) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    
    if (!hasUpper || !hasLower || !hasNumber) {
      throw new Error('Password must contain uppercase, lowercase, and number');
    }
    return value;
  };
  
  // Create field validators
  const validateEmailField = pipeWithErrorHandling(
    validateRequired('Email'),
    validateEmail
  );
  
  const validatePasswordField = pipeWithErrorHandling(
    validateRequired('Password'),
    validateMinLength(8, 'Password'),
    validatePassword
  );
  
  const validateNameField = pipeWithErrorHandling(
    validateRequired('Name'),
    validateMinLength(2, 'Name')
  );
  
  return {
    validateEmail: validateEmailField,
    validatePassword: validatePasswordField,
    validateName: validateNameField,
    
    // Validate entire form
    validateForm: (formData) => {
      const errors = {};
      
      ['email', 'password', 'name'].forEach(field => {
        try {
          const validator = field === 'email' ? validateEmailField :
                          field === 'password' ? validatePasswordField :
                          validateNameField;
          
          validator(formData[field]);
        } catch (error) {
          errors[field] = error.message;
        }
      });
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    }
  };
}

/**
 * Use Case 3: Image Processing Pipeline
 * Process images through multiple transformation steps
 */
function createImageProcessor() {
  // Mock image processing functions
  const resize = (width, height) => (image) => {
    console.log(`Resizing image to ${width}x${height}`);
    return { ...image, width, height, resized: true };
  };
  
  const addWatermark = (text) => (image) => {
    console.log(`Adding watermark: ${text}`);
    return { ...image, watermark: text };
  };
  
  const compress = (quality) => (image) => {
    console.log(`Compressing image to ${quality}% quality`);
    return { ...image, quality, compressed: true };
  };
  
  const convertFormat = (format) => (image) => {
    console.log(`Converting to ${format} format`);
    return { ...image, format, converted: true };
  };
  
  const generateThumbnail = (size) => (image) => {
    console.log(`Generating ${size}px thumbnail`);
    return {
      ...image,
      thumbnail: { size, generated: true }
    };
  };
  
  return {
    // Standard web optimization pipeline
    optimizeForWeb: pipe(
      resize(1200, 800),
      compress(85),
      convertFormat('webp'),
      generateThumbnail(150)
    ),
    
    // Social media processing
    prepareForSocial: pipe(
      resize(1200, 630), // Social media aspect ratio
      addWatermark('© MyBrand'),
      compress(90),
      convertFormat('jpg')
    ),
    
    // Print preparation
    prepareForPrint: pipe(
      resize(3000, 2000),
      compress(100), // No compression for print
      convertFormat('tiff')
    ),
    
    // Custom pipeline builder
    buildCustomPipeline: (...steps) => pipe(...steps),
    
    // Available transformations
    transformations: {
      resize,
      addWatermark,
      compress,
      convertFormat,
      generateThumbnail
    }
  };
}

/**
 * Use Case 4: Analytics Data Pipeline
 * Process analytics events through filtering, transformation, and aggregation
 */
function createAnalyticsPipeline() {
  // Event processing functions
  const filterValidEvents = (events) => {
    return events.filter(event => 
      event && 
      event.type && 
      event.timestamp && 
      event.userId
    );
  };
  
  const enrichEvents = (events) => {
    return events.map(event => ({
      ...event,
      date: new Date(event.timestamp).toISOString().split('T')[0],
      hour: new Date(event.timestamp).getHours(),
      enriched: true
    }));
  };
  
  const groupByType = (events) => {
    return events.reduce((groups, event) => {
      if (!groups[event.type]) {
        groups[event.type] = [];
      }
      groups[event.type].push(event);
      return groups;
    }, {});
  };
  
  const calculateMetrics = (groupedEvents) => {
    const metrics = {};
    
    Object.keys(groupedEvents).forEach(type => {
      const events = groupedEvents[type];
      metrics[type] = {
        count: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        timeRange: {
          start: Math.min(...events.map(e => e.timestamp)),
          end: Math.max(...events.map(e => e.timestamp))
        }
      };
    });
    
    return metrics;
  };
  
  const generateReport = (metrics) => {
    return {
      summary: {
        totalEvents: Object.values(metrics).reduce((sum, m) => sum + m.count, 0),
        eventTypes: Object.keys(metrics).length,
        generatedAt: new Date().toISOString()
      },
      breakdown: metrics
    };
  };
  
  // Complete analytics pipeline
  const processEvents = pipe(
    filterValidEvents,
    enrichEvents,
    groupByType,
    calculateMetrics,
    generateReport
  );
  
  return {
    processEvents,
    
    // Individual steps for custom pipelines
    steps: {
      filterValidEvents,
      enrichEvents,
      groupByType,
      calculateMetrics,
      generateReport
    },
    
    // Real-time processing with async pipe
    processRealTime: asyncPipe(
      async (events) => {
        // Simulate async validation
        await new Promise(resolve => setTimeout(resolve, 10));
        return filterValidEvents(events);
      },
      enrichEvents,
      async (events) => {
        // Simulate async enrichment (e.g., geo lookup)
        await new Promise(resolve => setTimeout(resolve, 20));
        return events;
      },
      groupByType,
      calculateMetrics,
      generateReport
    )
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Data processor
const dataProcessor = createDataProcessor();
const userData = {
  'First Name': 'John',
  'Last Name': null,
  'Email Address': 'john@example.com',
  'Phone': '123-456-7890'
};

console.log('Processed user data:', dataProcessor.processUser(userData));

// Validation pipeline
const validator = createValidationPipeline();
const formData = {
  email: 'john@example.com',
  password: 'Password123',
  name: 'John Doe'
};

console.log('Form validation:', validator.validateForm(formData));

// Image processor
const imageProcessor = createImageProcessor();
const image = { name: 'photo.jpg', width: 4000, height: 3000 };
console.log('Optimized image:', imageProcessor.optimizeForWeb(image));

// Analytics pipeline
const analytics = createAnalyticsPipeline();
const events = [
  { type: 'pageview', userId: 'user1', timestamp: Date.now() - 1000 },
  { type: 'click', userId: 'user2', timestamp: Date.now() - 500 },
  { type: 'pageview', userId: 'user1', timestamp: Date.now() }
];

console.log('Analytics report:', analytics.processEvents(events));

// Export all implementations
module.exports = {
  pipe,
  compose,
  asyncPipe,
  pipeWithErrorHandling,
  lazyPipe,
  branchingPipe,
  createDataProcessor,
  createValidationPipeline,
  createImageProcessor,
  createAnalyticsPipeline
};

/**
 * Key Interview Points:
 * 
 * 1. Function Composition vs Pipe:
 *    - Composition: Mathematical notation, right-to-left
 *    - Pipe: Data flow notation, left-to-right
 *    - Both create reusable transformation chains
 * 
 * 2. Synchronous vs Asynchronous:
 *    - Sync pipe: Immediate transformation chain
 *    - Async pipe: Sequential promise resolution
 *    - Error handling differs between approaches
 * 
 * 3. Error Handling Strategies:
 *    - Fail fast: Stop on first error
 *    - Continue on error: Skip failed steps
 *    - Error enrichment: Add context to errors
 * 
 * 4. Performance Considerations:
 *    - Function call overhead
 *    - Memory usage with large data
 *    - Lazy evaluation for optimization
 * 
 * 5. Real-world Applications:
 *    - Data transformation pipelines
 *    - Form validation chains
 *    - Image/file processing
 *    - Analytics data processing
 *    - Middleware patterns
 * 
 * 6. Advanced Features:
 *    - Conditional branching
 *    - Generator-based lazy evaluation
 *    - Debug and logging capabilities
 *    - Custom error handling
 */