/**
 * Input Validation Framework - Schema Validation and Type Checking System
 * 
 * A comprehensive input validation system that provides:
 * - Schema-based validation with custom rules
 * - Type checking and sanitization
 * - Async validation support
 * - Multiple validation approaches from basic to enterprise-grade
 * 
 * Problem: Validate user input to prevent security vulnerabilities and ensure data integrity
 * 
 * Key Interview Points:
 * - Different validation strategies (client vs server-side)
 * - Schema definition patterns and type systems
 * - Performance optimization for large datasets
 * - Error handling and user experience considerations
 * - Security implications of improper validation
 * 
 * Companies: All companies need robust input validation
 * Frequency: Very High - Fundamental security and data integrity requirement
 */

// ========================================================================================
// APPROACH 1: BASIC VALIDATOR - Simple type checking and rules
// ========================================================================================

/**
 * Basic input validator with common validation rules
 * Mental model: Define rules and check input against each rule
 * 
 * Time Complexity: O(r) where r is number of rules per field
 * Space Complexity: O(1) for validation, O(n) for error storage
 * 
 * Interview considerations:
 * - How to handle async validation (API calls for uniqueness)?
 * - What's the difference between validation and sanitization?
 * - How to provide helpful error messages to users?
 * - Performance implications of complex validation rules?
 */
class BasicValidator {
  constructor() {
    // Pre-defined common validation patterns
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s\-\(\)]{10,}$/,
      url: /^https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
      zipCode: /^\d{5}(-\d{4})?$/,
      strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };
  }
  
  /**
   * Validate a single value against a set of rules
   * Core validation method that processes each rule sequentially
   */
  validateValue(value, rules = {}) {
    const errors = [];
    
    // Rule 1: Required field validation
    if (rules.required && this.isEmpty(value)) {
      errors.push('This field is required');
      return { isValid: false, errors }; // Stop early for required fields
    }
    
    // Skip other validations if value is empty and not required
    if (this.isEmpty(value)) {
      return { isValid: true, errors: [] };
    }
    
    // Rule 2: Type validation
    if (rules.type && !this.validateType(value, rules.type)) {
      errors.push(`Value must be of type ${rules.type}`);
    }
    
    // Rule 3: Length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters long`);
    }
    
    // Rule 4: Numeric range validation
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`Value must be at least ${rules.min}`);
    }
    
    if (rules.max !== undefined && Number(value) > rules.max) {
      errors.push(`Value must be at most ${rules.max}`);
    }
    
    // Rule 5: Pattern validation (regex)
    if (rules.pattern) {
      const pattern = typeof rules.pattern === 'string' ? 
        this.patterns[rules.pattern] : rules.pattern;
      
      if (pattern && !pattern.test(value.toString())) {
        errors.push(rules.patternMessage || `Value does not match required format`);
      }
    }
    
    // Rule 6: Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors.push(customResult || 'Custom validation failed');
      }
    }
    
    // Rule 7: Enumeration validation (allowed values)
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate an entire object against a schema
   * Processes all fields and collects validation errors
   */
  validateObject(obj, schema) {
    const result = {
      isValid: true,
      errors: {},
      data: { ...obj } // Copy of validated data
    };
    
    // Validate each field defined in the schema
    for (const [fieldName, rules] of Object.entries(schema)) {
      const fieldValue = obj[fieldName];
      const validation = this.validateValue(fieldValue, rules);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors[fieldName] = validation.errors;
      }
    }
    
    return result;
  }
  
  /**
   * Type validation helper
   * Checks if value matches expected JavaScript type
   */
  validateType(value, expectedType) {
    switch (expectedType.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return Number.isInteger(Number(value));
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return value instanceof Date && !isNaN(value);
      case 'email':
        return typeof value === 'string' && this.patterns.email.test(value);
      default:
        return true; // Unknown type passes validation
    }
  }
  
  /**
   * Check if a value is considered empty
   * Used for required field validation
   */
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }
}

// ========================================================================================
// APPROACH 2: SCHEMA-BASED VALIDATOR - Structured validation with nested objects
// ========================================================================================

/**
 * Advanced schema-based validator with support for nested objects and arrays
 * Mental model: Define a schema structure that mirrors your data structure
 * 
 * Features:
 * - Nested object validation
 * - Array validation with item schemas
 * - Conditional validation rules
 * - Field dependencies and cross-field validation
 * 
 * Time Complexity: O(n*r) where n is data size and r is rules per field
 * Space Complexity: O(n) for storing validation results
 */
class SchemaValidator {
  constructor() {
    this.basicValidator = new BasicValidator();
    this.customValidators = new Map();
  }
  
  /**
   * Register custom validator functions
   * Allows extending the validator with domain-specific rules
   */
  registerValidator(name, validatorFunction) {
    if (typeof validatorFunction !== 'function') {
      throw new Error('Validator must be a function');
    }
    this.customValidators.set(name, validatorFunction);
  }
  
  /**
   * Main validation method with support for nested schemas
   * Recursively validates complex data structures
   */
  validate(data, schema, path = '') {
    const result = {
      isValid: true,
      errors: {},
      warnings: {},
      sanitizedData: {}
    };
    
    // Handle different schema types
    if (schema.type === 'array') {
      return this.validateArray(data, schema, path);
    } else if (schema.type === 'object' || schema.properties) {
      return this.validateObject(data, schema, path);
    } else {
      // Single field validation
      return this.validateField(data, schema, path);
    }
  }
  
  /**
   * Validate array data with item schema
   * Each array item is validated against the same schema
   */
  validateArray(data, schema, path) {
    const result = {
      isValid: true,
      errors: {},
      warnings: {},
      sanitizedData: []
    };
    
    // Check if data is actually an array
    if (!Array.isArray(data)) {
      result.isValid = false;
      result.errors[path] = ['Expected an array'];
      return result;
    }
    
    // Validate array length constraints
    if (schema.minItems && data.length < schema.minItems) {
      result.isValid = false;
      result.errors[path] = [`Array must have at least ${schema.minItems} items`];
    }
    
    if (schema.maxItems && data.length > schema.maxItems) {
      result.isValid = false;
      result.errors[path] = [`Array must have at most ${schema.maxItems} items`];
    }
    
    // Validate each array item
    data.forEach((item, index) => {
      const itemPath = `${path}[${index}]`;
      const itemResult = this.validate(item, schema.items, itemPath);
      
      if (!itemResult.isValid) {
        result.isValid = false;
        Object.assign(result.errors, itemResult.errors);
      }
      
      result.sanitizedData.push(itemResult.sanitizedData);
      Object.assign(result.warnings, itemResult.warnings);
    });
    
    return result;
  }
  
  /**
   * Validate object with nested properties
   * Handles complex nested data structures
   */
  validateObject(data, schema, path) {
    const result = {
      isValid: true,
      errors: {},
      warnings: {},
      sanitizedData: {}
    };
    
    if (typeof data !== 'object' || data === null) {
      result.isValid = false;
      result.errors[path] = ['Expected an object'];
      return result;
    }
    
    const properties = schema.properties || {};
    const required = schema.required || [];
    
    // Check required fields
    for (const requiredField of required) {
      if (!(requiredField in data) || this.basicValidator.isEmpty(data[requiredField])) {
        result.isValid = false;
        const fieldPath = path ? `${path}.${requiredField}` : requiredField;
        result.errors[fieldPath] = ['This field is required'];
      }
    }
    
    // Validate each property
    for (const [propertyName, propertySchema] of Object.entries(properties)) {
      const propertyValue = data[propertyName];
      const propertyPath = path ? `${path}.${propertyName}` : propertyName;
      
      // Skip validation if field is missing and not required
      if (!(propertyName in data) && !required.includes(propertyName)) {
        continue;
      }
      
      const fieldResult = this.validate(propertyValue, propertySchema, propertyPath);
      
      if (!fieldResult.isValid) {
        result.isValid = false;
        Object.assign(result.errors, fieldResult.errors);
      }
      
      result.sanitizedData[propertyName] = fieldResult.sanitizedData;
      Object.assign(result.warnings, fieldResult.warnings);
    }
    
    // Check for unknown properties (if strict mode is enabled)
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in properties)) {
          result.warnings[`${path}.${key}`] = ['Unknown property'];
        }
      }
    }
    
    // Cross-field validation
    if (schema.dependencies) {
      this.validateDependencies(data, schema.dependencies, result, path);
    }
    
    return result;
  }
  
  /**
   * Validate a single field with all rules
   * Handles sanitization and type conversion
   */
  validateField(value, rules, path) {
    const result = {
      isValid: true,
      errors: {},
      warnings: {},
      sanitizedData: value
    };
    
    // Basic validation using our existing validator
    const basicResult = this.basicValidator.validateValue(value, rules);
    
    if (!basicResult.isValid) {
      result.isValid = false;
      result.errors[path] = basicResult.errors;
      return result;
    }
    
    // Apply sanitization rules
    if (rules.sanitize) {
      result.sanitizedData = this.sanitizeValue(value, rules.sanitize);
    }
    
    // Apply type conversion
    if (rules.coerce && rules.type) {
      result.sanitizedData = this.coerceType(result.sanitizedData, rules.type);
    }
    
    // Apply custom validators
    if (rules.customValidator) {
      const validatorName = rules.customValidator;
      if (this.customValidators.has(validatorName)) {
        const validator = this.customValidators.get(validatorName);
        const customResult = validator(result.sanitizedData);
        
        if (customResult !== true) {
          result.isValid = false;
          result.errors[path] = Array.isArray(customResult) ? customResult : [customResult];
        }
      }
    }
    
    return result;
  }
  
  /**
   * Handle field dependencies and conditional validation
   * Example: password confirmation field depends on password field
   */
  validateDependencies(data, dependencies, result, path) {
    for (const [field, dependency] of Object.entries(dependencies)) {
      if (field in data) {
        // Field exists, check if its dependencies are met
        if (Array.isArray(dependency)) {
          // Simple dependency: other fields must exist
          for (const requiredField of dependency) {
            if (!(requiredField in data)) {
              const fieldPath = path ? `${path}.${field}` : field;
              result.errors[fieldPath] = result.errors[fieldPath] || [];
              result.errors[fieldPath].push(`Field ${requiredField} is required when ${field} is present`);
              result.isValid = false;
            }
          }
        } else if (typeof dependency === 'object') {
          // Complex dependency with conditional rules
          this.validateConditionalDependency(data, field, dependency, result, path);
        }
      }
    }
  }
  
  /**
   * Validate conditional dependencies
   * Example: if country is "US", then state field is required
   */
  validateConditionalDependency(data, field, dependency, result, path) {
    const fieldValue = data[field];
    
    if (dependency.if && dependency.then) {
      const conditionMet = this.evaluateCondition(fieldValue, dependency.if);
      
      if (conditionMet) {
        // Apply additional validation rules
        for (const [depField, depRules] of Object.entries(dependency.then)) {
          const depValue = data[depField];
          const depPath = path ? `${path}.${depField}` : depField;
          
          const depResult = this.basicValidator.validateValue(depValue, depRules);
          if (!depResult.isValid) {
            result.isValid = false;
            result.errors[depPath] = depResult.errors;
          }
        }
      }
    }
  }
  
  /**
   * Evaluate conditional logic for dependencies
   * Supports various condition types (equals, in, range, etc.)
   */
  evaluateCondition(value, condition) {
    if (condition.equals !== undefined) {
      return value === condition.equals;
    }
    
    if (condition.in && Array.isArray(condition.in)) {
      return condition.in.includes(value);
    }
    
    if (condition.range && Array.isArray(condition.range) && condition.range.length === 2) {
      const [min, max] = condition.range;
      return value >= min && value <= max;
    }
    
    return false;
  }
  
  /**
   * Sanitize input values based on sanitization rules
   * Cleans data while preserving essential information
   */
  sanitizeValue(value, sanitizeRules) {
    let sanitized = value;
    
    if (typeof sanitized === 'string') {
      if (sanitizeRules.trim) {
        sanitized = sanitized.trim();
      }
      
      if (sanitizeRules.lowercase) {
        sanitized = sanitized.toLowerCase();
      }
      
      if (sanitizeRules.uppercase) {
        sanitized = sanitized.toUpperCase();
      }
      
      if (sanitizeRules.removeSpecialChars) {
        sanitized = sanitized.replace(/[^\w\s]/gi, '');
      }
      
      if (sanitizeRules.normalizeWhitespace) {
        sanitized = sanitized.replace(/\s+/g, ' ');
      }
    }
    
    return sanitized;
  }
  
  /**
   * Type coercion for flexible input handling
   * Converts strings to appropriate types when possible
   */
  coerceType(value, targetType) {
    try {
      switch (targetType) {
        case 'number':
          const num = Number(value);
          return isNaN(num) ? value : num;
          
        case 'integer':
          const int = parseInt(value, 10);
          return isNaN(int) ? value : int;
          
        case 'boolean':
          if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
          }
          return Boolean(value);
          
        case 'date':
          if (typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date) ? value : date;
          }
          return value;
          
        default:
          return value;
      }
    } catch (error) {
      return value; // Return original value if coercion fails
    }
  }
}

// ========================================================================================
// APPROACH 3: ASYNC VALIDATOR - Enterprise-grade with async validation support
// ========================================================================================

/**
 * Enterprise-grade validation system with async support
 * Mental model: Pipeline of synchronous and asynchronous validation steps
 * 
 * Features:
 * - Async validation (API calls, database checks)
 * - Validation pipelines and middleware
 * - Caching for expensive validations
 * - Rate limiting for external API calls
 * - Performance monitoring and optimization
 */
class AsyncValidator {
  constructor(options = {}) {
    this.schemaValidator = new SchemaValidator();
    this.asyncValidators = new Map();
    this.validationCache = new Map();
    this.rateLimiter = new Map();
    
    this.config = {
      cacheEnabled: options.cacheEnabled !== false,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      rateLimitWindow: options.rateLimitWindow || 60000, // 1 minute
      maxRequestsPerWindow: options.maxRequestsPerWindow || 10,
      validationTimeout: options.validationTimeout || 5000, // 5 seconds
      ...options
    };
  }
  
  /**
   * Register async validator function
   * Async validators can make API calls, database queries, etc.
   */
  registerAsyncValidator(name, validatorFunction, options = {}) {
    if (typeof validatorFunction !== 'function') {
      throw new Error('Async validator must be a function');
    }
    
    this.asyncValidators.set(name, {
      validator: validatorFunction,
      cached: options.cached !== false,
      rateLimited: options.rateLimited !== false,
      timeout: options.timeout || this.config.validationTimeout
    });
  }
  
  /**
   * Main async validation method
   * Combines synchronous and asynchronous validation steps
   */
  async validate(data, schema, options = {}) {
    const startTime = Date.now();
    
    try {
      // Step 1: Synchronous validation first (fast fail)
      const syncResult = this.schemaValidator.validate(data, schema);
      
      if (!syncResult.isValid && !options.continueOnSyncError) {
        return {
          ...syncResult,
          validationTime: Date.now() - startTime,
          asyncValidations: []
        };
      }
      
      // Step 2: Collect async validation tasks
      const asyncTasks = this.collectAsyncValidations(data, schema);
      
      if (asyncTasks.length === 0) {
        return {
          ...syncResult,
          validationTime: Date.now() - startTime,
          asyncValidations: []
        };
      }
      
      // Step 3: Execute async validations with timeout and rate limiting
      const asyncResults = await this.executeAsyncValidations(asyncTasks);
      
      // Step 4: Merge results
      const finalResult = this.mergeValidationResults(syncResult, asyncResults);
      finalResult.validationTime = Date.now() - startTime;
      finalResult.asyncValidations = asyncResults;
      
      return finalResult;
      
    } catch (error) {
      return {
        isValid: false,
        errors: { _system: [`Validation error: ${error.message}`] },
        warnings: {},
        sanitizedData: data,
        validationTime: Date.now() - startTime,
        asyncValidations: [],
        systemError: error
      };
    }
  }
  
  /**
   * Collect all async validation tasks from schema
   * Identifies fields that need async validation
   */
  collectAsyncValidations(data, schema, path = '', tasks = []) {
    if (schema.asyncValidator) {
      const value = this.getValueFromPath(data, path);
      tasks.push({
        path,
        value,
        validatorName: schema.asyncValidator,
        validatorConfig: schema.asyncValidatorConfig || {}
      });
    }
    
    // Recursively collect from nested schemas
    if (schema.properties) {
      for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
        const propertyPath = path ? `${path}.${propertyName}` : propertyName;
        this.collectAsyncValidations(data, propertySchema, propertyPath, tasks);
      }
    }
    
    if (schema.items) {
      const arrayValue = this.getValueFromPath(data, path);
      if (Array.isArray(arrayValue)) {
        arrayValue.forEach((item, index) => {
          const itemPath = `${path}[${index}]`;
          this.collectAsyncValidations({ [index]: item }, { properties: { [index]: schema.items } }, path, tasks);
        });
      }
    }
    
    return tasks;
  }
  
  /**
   * Execute async validations with proper error handling and timeouts
   * Implements concurrent execution with rate limiting
   */
  async executeAsyncValidations(tasks) {
    const results = [];
    
    // Group tasks by validator for rate limiting
    const tasksByValidator = new Map();
    for (const task of tasks) {
      if (!tasksByValidator.has(task.validatorName)) {
        tasksByValidator.set(task.validatorName, []);
      }
      tasksByValidator.get(task.validatorName).push(task);
    }
    
    // Execute validations with rate limiting
    for (const [validatorName, validatorTasks] of tasksByValidator) {
      const validatorConfig = this.asyncValidators.get(validatorName);
      if (!validatorConfig) {
        results.push({
          path: validatorTasks[0].path,
          isValid: false,
          errors: [`Unknown async validator: ${validatorName}`]
        });
        continue;
      }
      
      // Apply rate limiting if enabled
      if (validatorConfig.rateLimited) {
        await this.applyRateLimit(validatorName);
      }
      
      // Execute validation tasks for this validator
      const validatorResults = await Promise.allSettled(
        validatorTasks.map(task => this.executeAsyncValidation(task, validatorConfig))
      );
      
      // Process results
      validatorResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            path: validatorTasks[index].path,
            isValid: false,
            errors: [`Async validation failed: ${result.reason.message}`],
            timeout: result.reason.name === 'TimeoutError'
          });
        }
      });
    }
    
    return results;
  }
  
  /**
   * Execute individual async validation with caching and timeout
   * Handles caching, timeout, and error recovery
   */
  async executeAsyncValidation(task, validatorConfig) {
    const { path, value, validatorName, validatorConfig: taskConfig } = task;
    
    // Check cache first
    if (validatorConfig.cached && this.config.cacheEnabled) {
      const cacheKey = `${validatorName}:${JSON.stringify(value)}`;
      const cached = this.validationCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return {
          ...cached.result,
          fromCache: true
        };
      }
    }
    
    // Execute validation with timeout
    const timeoutMs = taskConfig.timeout || validatorConfig.timeout;
    const validationPromise = validatorConfig.validator(value, taskConfig);
    
    const result = await Promise.race([
      validationPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Validation timeout')), timeoutMs)
      )
    ]);
    
    // Process validation result
    const processedResult = {
      path,
      isValid: result === true || (typeof result === 'object' && result.isValid),
      errors: typeof result === 'string' ? [result] : 
              (typeof result === 'object' && result.errors) ? result.errors : [],
      warnings: typeof result === 'object' ? result.warnings || [] : [],
      fromCache: false
    };
    
    // Cache the result
    if (validatorConfig.cached && this.config.cacheEnabled) {
      const cacheKey = `${validatorName}:${JSON.stringify(value)}`;
      this.validationCache.set(cacheKey, {
        result: processedResult,
        timestamp: Date.now()
      });
    }
    
    return processedResult;
  }
  
  /**
   * Apply rate limiting to prevent API abuse
   * Simple sliding window rate limiter
   */
  async applyRateLimit(validatorName) {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindow;
    
    // Clean old entries
    if (!this.rateLimiter.has(validatorName)) {
      this.rateLimiter.set(validatorName, []);
    }
    
    const requests = this.rateLimiter.get(validatorName)
      .filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit exceeded
    if (requests.length >= this.config.maxRequestsPerWindow) {
      const waitTime = requests[0] + this.config.rateLimitWindow - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Record this request
    requests.push(now);
    this.rateLimiter.set(validatorName, requests);
  }
  
  /**
   * Merge synchronous and asynchronous validation results
   * Combines all validation outcomes into final result
   */
  mergeValidationResults(syncResult, asyncResults) {
    const merged = { ...syncResult };
    
    for (const asyncResult of asyncResults) {
      if (!asyncResult.isValid) {
        merged.isValid = false;
        merged.errors[asyncResult.path] = [
          ...(merged.errors[asyncResult.path] || []),
          ...asyncResult.errors
        ];
      }
      
      if (asyncResult.warnings.length > 0) {
        merged.warnings[asyncResult.path] = [
          ...(merged.warnings[asyncResult.path] || []),
          ...asyncResult.warnings
        ];
      }
    }
    
    return merged;
  }
  
  /**
   * Get value from object using dot notation path
   * Helper function for nested object access
   */
  getValueFromPath(obj, path) {
    if (!path) return obj;
    
    return path.split('.').reduce((current, key) => {
      if (key.includes('[') && key.includes(']')) {
        const [objKey, indexStr] = key.split('[');
        const index = parseInt(indexStr.replace(']', ''), 10);
        return current && current[objKey] && current[objKey][index];
      }
      return current && current[key];
    }, obj);
  }
  
  /**
   * Clear validation cache
   * Useful for memory management and testing
   */
  clearCache() {
    this.validationCache.clear();
  }
  
  /**
   * Get cache and rate limiting statistics
   * Useful for monitoring and optimization
   */
  getStats() {
    return {
      cacheSize: this.validationCache.size,
      rateLimitedValidators: this.rateLimiter.size,
      registeredAsyncValidators: this.asyncValidators.size
    };
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic validation
console.log('=== BASIC VALIDATOR EXAMPLE ===');
const basicValidator = new BasicValidator();

const userData = {
  email: 'invalid-email',
  age: '25',
  password: 'weak',
  confirmPassword: 'weak'
};

const basicSchema = {
  email: { 
    required: true, 
    pattern: 'email',
    patternMessage: 'Please enter a valid email address'
  },
  age: { 
    required: true, 
    type: 'number', 
    min: 18, 
    max: 120 
  },
  password: { 
    required: true, 
    pattern: 'strongPassword',
    patternMessage: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  }
};

const basicResult = basicValidator.validateObject(userData, basicSchema);
console.log('Basic validation result:', basicResult);

// Example 2: Schema-based validation with nested objects
console.log('\n=== SCHEMA VALIDATOR EXAMPLE ===');
const schemaValidator = new SchemaValidator();

// Register custom validator
schemaValidator.registerValidator('uniqueEmail', (email) => {
  // Simulate checking email uniqueness
  const existingEmails = ['admin@example.com', 'user@test.com'];
  return !existingEmails.includes(email) || 'Email already exists';
});

const complexData = {
  user: {
    name: '  John Doe  ',
    email: 'john@example.com',
    age: '30'
  },
  address: {
    street: '123 Main St',
    city: 'Anytown',
    zipCode: '12345'
  },
  hobbies: ['reading', 'swimming', '']
};

const complexSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          required: true,
          sanitize: { trim: true, normalizeWhitespace: true }
        },
        email: { 
          type: 'email', 
          required: true,
          customValidator: 'uniqueEmail'
        },
        age: { 
          type: 'number', 
          coerce: true, 
          min: 18 
        }
      },
      required: ['name', 'email']
    },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string', required: true },
        city: { type: 'string', required: true },
        zipCode: { pattern: 'zipCode' }
      },
      required: ['street', 'city']
    },
    hobbies: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      minItems: 1
    }
  },
  required: ['user']
};

const schemaResult = schemaValidator.validate(complexData, complexSchema);
console.log('Schema validation result:', schemaResult);

// Example 3: Async validation
console.log('\n=== ASYNC VALIDATOR EXAMPLE ===');
const asyncValidator = new AsyncValidator({
  cacheEnabled: true,
  rateLimitWindow: 60000,
  maxRequestsPerWindow: 5
});

// Register async validators
asyncValidator.registerAsyncValidator('checkEmailUniqueness', async (email) => {
  // Simulate API call to check email uniqueness
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  
  const existingEmails = ['admin@example.com', 'taken@test.com'];
  if (existingEmails.includes(email)) {
    return { isValid: false, errors: ['Email address is already taken'] };
  }
  
  return { isValid: true, errors: [] };
}, { cached: true, rateLimited: true });

asyncValidator.registerAsyncValidator('validateCreditCard', async (cardNumber) => {
  // Simulate credit card validation service
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simple Luhn algorithm check (simplified for demo)
  const isValid = cardNumber.replace(/\s/g, '').length === 16;
  
  return isValid ? true : 'Invalid credit card number';
}, { cached: true, timeout: 3000 });

const asyncData = {
  email: 'newuser@example.com',
  creditCard: '1234 5678 9012 3456'
};

const asyncSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'email',
      required: true,
      asyncValidator: 'checkEmailUniqueness'
    },
    creditCard: {
      pattern: 'creditCard',
      asyncValidator: 'validateCreditCard'
    }
  },
  required: ['email']
};

// Run async validation
(async () => {
  const asyncResult = await asyncValidator.validate(asyncData, asyncSchema);
  console.log('Async validation result:', asyncResult);
  console.log('Validator stats:', asyncValidator.getStats());
})();

// Export for use in other modules
module.exports = {
  BasicValidator,
  SchemaValidator,
  AsyncValidator
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. Validation Strategies:
   - Client-side vs Server-side validation
   - Synchronous vs Asynchronous validation
   - Real-time vs Batch validation
   - Progressive validation (validate as user types)

2. Security Considerations:
   - Input sanitization vs validation
   - SQL injection prevention
   - XSS prevention in validation messages
   - Rate limiting for expensive validations

3. Performance Optimization:
   - Caching validation results
   - Debouncing expensive validations
   - Short-circuiting on first error
   - Parallel vs Sequential async validations

4. User Experience:
   - Error message clarity and helpfulness
   - Real-time feedback vs form submission validation
   - Internationalization of error messages
   - Accessibility considerations

5. Architecture Decisions:
   - Schema definition patterns (JSON Schema, Yup, Joi)
   - Validation middleware vs inline validation
   - Custom validator registration and reuse
   - Error handling and recovery strategies

Common Follow-up Questions:
- How would you validate file uploads?
- How do you handle validation in a microservices architecture?
- What's your approach to validating deeply nested objects?
- How do you handle validation for dynamic forms?
- How would you implement conditional validation rules?
- What's your strategy for testing validation logic?
- How do you handle validation for different user roles?
- How would you implement real-time collaborative validation?
*/