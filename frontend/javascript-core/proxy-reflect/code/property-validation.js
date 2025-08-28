/**
 * File: property-validation.js
 * Description: Property validation using Proxy traps
 * Demonstrates validation patterns and type checking
 */

console.log('=== Property Validation with Proxy ===\n');

// === Basic Property Validation ===
function createValidatedObject(target, validators = {}) {
  return new Proxy(target, {
    set(obj, property, value) {
      const validator = validators[property];
      
      if (validator) {
        const validation = validator(value, property, obj);
        
        if (validation === false) {
          throw new Error(`Validation failed for property "${property}"`);
        }
        
        if (typeof validation === 'string') {
          throw new Error(validation);
        }
        
        if (validation && typeof validation === 'object' && !validation.valid) {
          throw new Error(validation.message || `Validation failed for property "${property}"`);
        }
      }
      
      return Reflect.set(obj, property, value);
    }
  });
}

console.log('1. Basic Property Validation:');

const user = createValidatedObject({}, {
  name: (value) => {
    if (typeof value !== 'string') {
      return 'Name must be a string';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return true;
  },
  
  age: (value) => {
    if (typeof value !== 'number') {
      return 'Age must be a number';
    }
    if (value < 0 || value > 150) {
      return 'Age must be between 0 and 150';
    }
    return true;
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, message: 'Invalid email format' };
    }
    return { valid: true };
  }
});

try {
  user.name = 'John Doe';
  user.age = 30;
  user.email = 'john@example.com';
  console.log('Valid user:', user);
  
  user.age = -5; // Should throw
} catch (error) {
  console.log('Validation error:', error.message);
}

// === Advanced Validation with Schema ===
console.log('\n2. Schema-based Validation:');

class ValidationSchema {
  constructor(schema) {
    this.schema = schema;
  }
  
  static string(options = {}) {
    return {
      type: 'string',
      required: options.required !== false,
      minLength: options.minLength || 0,
      maxLength: options.maxLength || Infinity,
      pattern: options.pattern,
      enum: options.enum
    };
  }
  
  static number(options = {}) {
    return {
      type: 'number',
      required: options.required !== false,
      min: options.min ?? -Infinity,
      max: options.max ?? Infinity,
      integer: options.integer || false
    };
  }
  
  static boolean(options = {}) {
    return {
      type: 'boolean',
      required: options.required !== false
    };
  }
  
  static array(itemSchema, options = {}) {
    return {
      type: 'array',
      items: itemSchema,
      required: options.required !== false,
      minItems: options.minItems || 0,
      maxItems: options.maxItems || Infinity
    };
  }
  
  static object(properties, options = {}) {
    return {
      type: 'object',
      properties,
      required: options.required !== false,
      strict: options.strict || false
    };
  }
  
  validate(obj) {
    const errors = [];
    
    for (const [property, rule] of Object.entries(this.schema)) {
      const value = obj[property];
      const error = this.validateProperty(property, value, rule);
      
      if (error) {
        errors.push(error);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  validateProperty(property, value, rule) {
    // Check required
    if (rule.required && (value === undefined || value === null)) {
      return `Property "${property}" is required`;
    }
    
    // Skip validation if value is undefined and not required
    if (value === undefined && !rule.required) {
      return null;
    }
    
    // Type validation
    switch (rule.type) {
      case 'string':
        return this.validateString(property, value, rule);
      case 'number':
        return this.validateNumber(property, value, rule);
      case 'boolean':
        return this.validateBoolean(property, value, rule);
      case 'array':
        return this.validateArray(property, value, rule);
      case 'object':
        return this.validateObject(property, value, rule);
      default:
        return null;
    }
  }
  
  validateString(property, value, rule) {
    if (typeof value !== 'string') {
      return `Property "${property}" must be a string`;
    }
    
    if (value.length < rule.minLength) {
      return `Property "${property}" must be at least ${rule.minLength} characters`;
    }
    
    if (value.length > rule.maxLength) {
      return `Property "${property}" must be at most ${rule.maxLength} characters`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return `Property "${property}" does not match required pattern`;
    }
    
    if (rule.enum && !rule.enum.includes(value)) {
      return `Property "${property}" must be one of: ${rule.enum.join(', ')}`;
    }
    
    return null;
  }
  
  validateNumber(property, value, rule) {
    if (typeof value !== 'number' || isNaN(value)) {
      return `Property "${property}" must be a number`;
    }
    
    if (rule.integer && !Number.isInteger(value)) {
      return `Property "${property}" must be an integer`;
    }
    
    if (value < rule.min) {
      return `Property "${property}" must be at least ${rule.min}`;
    }
    
    if (value > rule.max) {
      return `Property "${property}" must be at most ${rule.max}`;
    }
    
    return null;
  }
  
  validateBoolean(property, value, rule) {
    if (typeof value !== 'boolean') {
      return `Property "${property}" must be a boolean`;
    }
    return null;
  }
  
  validateArray(property, value, rule) {
    if (!Array.isArray(value)) {
      return `Property "${property}" must be an array`;
    }
    
    if (value.length < rule.minItems) {
      return `Property "${property}" must have at least ${rule.minItems} items`;
    }
    
    if (value.length > rule.maxItems) {
      return `Property "${property}" must have at most ${rule.maxItems} items`;
    }
    
    if (rule.items) {
      for (let i = 0; i < value.length; i++) {
        const itemError = this.validateProperty(`${property}[${i}]`, value[i], rule.items);
        if (itemError) {
          return itemError;
        }
      }
    }
    
    return null;
  }
  
  validateObject(property, value, rule) {
    if (typeof value !== 'object' || value === null) {
      return `Property "${property}" must be an object`;
    }
    
    if (rule.properties) {
      const schema = new ValidationSchema(rule.properties);
      const result = schema.validate(value);
      
      if (!result.valid) {
        return `Property "${property}" validation failed: ${result.errors[0]}`;
      }
    }
    
    return null;
  }
}

function createSchemaValidatedObject(initialData = {}, schema) {
  const validator = new ValidationSchema(schema);
  
  return new Proxy(initialData, {
    set(target, property, value) {
      if (schema[property]) {
        const error = validator.validateProperty(property, value, schema[property]);
        if (error) {
          throw new Error(error);
        }
      }
      
      return Reflect.set(target, property, value);
    }
  });
}

// Test schema validation
const userSchema = {
  name: ValidationSchema.string({ minLength: 2, maxLength: 50 }),
  age: ValidationSchema.number({ min: 0, max: 150, integer: true }),
  email: ValidationSchema.string({ 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  }),
  role: ValidationSchema.string({ 
    enum: ['admin', 'user', 'guest'] 
  }),
  preferences: ValidationSchema.object({
    theme: ValidationSchema.string({ enum: ['light', 'dark'] }),
    notifications: ValidationSchema.boolean()
  })
};

const validatedUser = createSchemaValidatedObject({}, userSchema);

try {
  validatedUser.name = 'Alice';
  validatedUser.age = 28;
  validatedUser.email = 'alice@example.com';
  validatedUser.role = 'admin';
  validatedUser.preferences = {
    theme: 'dark',
    notifications: true
  };
  
  console.log('Valid user with schema:', validatedUser);
  
  validatedUser.role = 'invalid_role'; // Should throw
} catch (error) {
  console.log('Schema validation error:', error.message);
}

// === Real-time Validation ===
console.log('\n3. Real-time Form Validation:');

class FormValidator {
  constructor() {
    this.fields = new Map();
    this.errors = new Map();
  }
  
  addField(name, rules) {
    this.fields.set(name, rules);
    return this;
  }
  
  createForm(initialData = {}) {
    return new Proxy(initialData, {
      set: (target, property, value) => {
        if (this.fields.has(property)) {
          const rules = this.fields.get(property);
          const error = this.validateField(property, value, rules);
          
          if (error) {
            this.errors.set(property, error);
          } else {
            this.errors.delete(property);
          }
        }
        
        const result = Reflect.set(target, property, value);
        
        // Trigger validation event
        if (this.onValidation) {
          this.onValidation({
            field: property,
            value,
            error: this.errors.get(property),
            isValid: !this.errors.has(property),
            allErrors: Object.fromEntries(this.errors)
          });
        }
        
        return result;
      },
      
      get: (target, property) => {
        // Expose validation methods
        if (property === 'getErrors') {
          return () => Object.fromEntries(this.errors);
        }
        if (property === 'isValid') {
          return () => this.errors.size === 0;
        }
        if (property === 'validate') {
          return () => this.validateAll(target);
        }
        
        return Reflect.get(target, property);
      }
    });
  }
  
  validateField(name, value, rules) {
    for (const rule of rules) {
      const error = rule(value, name);
      if (error) {
        return error;
      }
    }
    return null;
  }
  
  validateAll(data) {
    let isValid = true;
    
    for (const [fieldName, rules] of this.fields) {
      const value = data[fieldName];
      const error = this.validateField(fieldName, value, rules);
      
      if (error) {
        this.errors.set(fieldName, error);
        isValid = false;
      } else {
        this.errors.delete(fieldName);
      }
    }
    
    return {
      valid: isValid,
      errors: Object.fromEntries(this.errors)
    };
  }
  
  onValidation(callback) {
    this.onValidation = callback;
    return this;
  }
}

// Create form validator
const validator = new FormValidator()
  .addField('username', [
    (value) => !value ? 'Username is required' : null,
    (value) => value.length < 3 ? 'Username must be at least 3 characters' : null,
    (value) => !/^[a-zA-Z0-9_]+$/.test(value) ? 'Username can only contain letters, numbers, and underscores' : null
  ])
  .addField('password', [
    (value) => !value ? 'Password is required' : null,
    (value) => value.length < 8 ? 'Password must be at least 8 characters' : null,
    (value) => !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value) ? 'Password must contain uppercase, lowercase, and number' : null
  ])
  .onValidation((event) => {
    if (event.error) {
      console.log(`❌ ${event.field}: ${event.error}`);
    } else {
      console.log(`✅ ${event.field}: Valid`);
    }
  });

const form = validator.createForm();

form.username = 'jo'; // Too short
form.username = 'john_doe'; // Valid
form.password = '123'; // Too short and weak
form.password = 'StrongPass123'; // Valid

console.log('Form is valid:', form.isValid());
console.log('All errors:', form.getErrors());

// === Dynamic Validation Rules ===
console.log('\n4. Dynamic Validation Rules:');

function createDynamicValidator() {
  const rules = new Map();
  const conditions = new Map();
  
  return new Proxy({}, {
    set(target, property, value) {
      // Check conditional rules
      for (const [conditionProperty, condition] of conditions) {
        if (property === conditionProperty && condition.when(target)) {
          const activeRules = rules.get(property) || [];
          activeRules.push(...condition.rules);
          rules.set(property, activeRules);
        }
      }
      
      // Validate against current rules
      const propertyRules = rules.get(property) || [];
      for (const rule of propertyRules) {
        const error = rule(value, property, target);
        if (error) {
          throw new Error(error);
        }
      }
      
      const result = Reflect.set(target, property, value);
      
      // Clear conditional rules after validation
      if (conditions.has(property)) {
        rules.delete(property);
      }
      
      return result;
    },
    
    get(target, property) {
      if (property === 'addRule') {
        return (prop, rule) => {
          const existing = rules.get(prop) || [];
          rules.set(prop, [...existing, rule]);
          return target;
        };
      }
      
      if (property === 'addConditionalRule') {
        return (prop, when, conditionalRules) => {
          conditions.set(prop, { when, rules: conditionalRules });
          return target;
        };
      }
      
      return Reflect.get(target, property);
    }
  });
}

const dynamicObj = createDynamicValidator();

// Add basic rule
dynamicObj.addRule('type', (value) => {
  const validTypes = ['user', 'admin', 'guest'];
  return validTypes.includes(value) ? null : `Type must be one of: ${validTypes.join(', ')}`;
});

// Add conditional rule - admin users need additional validation
dynamicObj.addConditionalRule('permissions', 
  (obj) => obj.type === 'admin',
  [
    (value) => !Array.isArray(value) ? 'Admin permissions must be an array' : null,
    (value) => value.length === 0 ? 'Admin must have at least one permission' : null
  ]
);

try {
  dynamicObj.type = 'admin';
  dynamicObj.permissions = ['read', 'write', 'delete'];
  console.log('Dynamic validation passed:', dynamicObj);
  
  dynamicObj.type = 'user';
  dynamicObj.permissions = []; // This won't trigger validation since type is 'user'
  console.log('User type validation passed:', dynamicObj);
} catch (error) {
  console.log('Dynamic validation error:', error.message);
}

module.exports = {
  createValidatedObject,
  ValidationSchema,
  createSchemaValidatedObject,
  FormValidator,
  createDynamicValidator
};