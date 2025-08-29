/**
 * File: practical-applications.js
 * Description: Real-world applications and best practices for type coercion
 * Time Complexity: Varies by use case
 * Space Complexity: O(1) for most operations
 */

// === Form Input Validation and Coercion ===
console.log('=== Form Input Validation ===');

class FormValidator {
  static validateAndCoerceInput(input, expectedType, options = {}) {
    const { allowEmpty = false, min, max, pattern } = options;
    
    // Handle empty input
    if (!input && input !== 0) {
      if (allowEmpty) {
        return { value: null, valid: true, errors: [] };
      }
      return { value: null, valid: false, errors: ['Field is required'] };
    }
    
    const errors = [];
    let value;
    
    switch (expectedType) {
      case 'string':
        value = String(input);
        if (pattern && !pattern.test(value)) {
          errors.push('Invalid format');
        }
        break;
        
      case 'number':
        // Prefer Number() over parseInt for strict validation
        value = Number(input);
        if (isNaN(value)) {
          errors.push('Must be a valid number');
        } else {
          if (min !== undefined && value < min) {
            errors.push(`Must be at least ${min}`);
          }
          if (max !== undefined && value > max) {
            errors.push(`Must be at most ${max}`);
          }
        }
        break;
        
      case 'integer':
        const numValue = Number(input);
        if (isNaN(numValue) || !Number.isInteger(numValue)) {
          errors.push('Must be a valid integer');
          value = NaN;
        } else {
          value = numValue;
        }
        break;
        
      case 'boolean':
        // Safe boolean conversion
        if (input === 'true' || input === true) {
          value = true;
        } else if (input === 'false' || input === false) {
          value = false;
        } else {
          errors.push('Must be true or false');
          value = Boolean(input); // fallback
        }
        break;
        
      default:
        errors.push('Unknown type');
        value = input;
    }
    
    return { value, valid: errors.length === 0, errors };
  }
}

// Test form validation
const formTests = [
  { input: '123', type: 'number', options: { min: 0, max: 1000 } },
  { input: 'abc', type: 'number' },
  { input: '123.45', type: 'integer' },
  { input: 'true', type: 'boolean' },
  { input: '', type: 'string', options: { allowEmpty: true } },
  { input: 'test@email.com', type: 'string', options: { pattern: /@/ } }
];

formTests.forEach(test => {
  const result = FormValidator.validateAndCoerceInput(test.input, test.type, test.options);
  console.log(`Input: "${test.input}" as ${test.type}:`, result);
});

// === Safe Type Conversion Utilities ===
console.log('\n=== Safe Type Conversion ===');

class SafeConverter {
  // Safe string conversion
  static toString(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'symbol') return value.toString();
    return String(value);
  }
  
  // Safe number conversion with default
  static toNumber(value, defaultValue = 0) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  
  // Safe integer conversion
  static toInteger(value, defaultValue = 0) {
    const num = this.toNumber(value, defaultValue);
    return Math.trunc(num);
  }
  
  // Safe boolean conversion with explicit rules
  static toBoolean(value, strictMode = false) {
    if (strictMode) {
      if (value === true || value === 'true') return true;
      if (value === false || value === 'false') return false;
      throw new Error(`Cannot convert ${value} to boolean in strict mode`);
    }
    return Boolean(value);
  }
  
  // Safe array conversion
  static toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    if (typeof value === 'string') return [value];
    if (typeof value[Symbol.iterator] === 'function') {
      return Array.from(value);
    }
    return [value];
  }
}

// Test safe conversions
const safeConversionTests = [
  { value: '123', method: 'toNumber' },
  { value: 'abc', method: 'toNumber' },
  { value: null, method: 'toString' },
  { value: Symbol('test'), method: 'toString' },
  { value: 'true', method: 'toBoolean', args: [true] },
  { value: 'hello', method: 'toArray' }
];

safeConversionTests.forEach(test => {
  const result = SafeConverter[test.method](test.value, ...(test.args || []));
  console.log(`${test.method}("${test.value}"):`, result);
});

// === URL Parameter Handling ===
console.log('\n=== URL Parameter Coercion ===');

class URLParamHandler {
  static parseQueryParams(queryString) {
    const params = new URLSearchParams(queryString);
    const result = {};
    
    for (const [key, value] of params) {
      // Smart type inference
      result[key] = this.inferType(value);
    }
    
    return result;
  }
  
  static inferType(value) {
    // Boolean strings
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Null/undefined
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    
    // Numbers
    if (value !== '' && !isNaN(Number(value))) {
      const num = Number(value);
      // Check if it's an integer
      return Number.isInteger(num) ? num : parseFloat(value);
    }
    
    // Arrays (comma-separated)
    if (value.includes(',')) {
      return value.split(',').map(v => this.inferType(v.trim()));
    }
    
    // Default to string
    return value;
  }
  
  static stringifyParams(params) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        searchParams.append(key, value.join(','));
      } else {
        searchParams.append(key, String(value));
      }
    });
    
    return searchParams.toString();
  }
}

// Test URL parameter handling
const queryString = 'name=John&age=30&active=true&scores=85,90,92&height=5.9';
const parsedParams = URLParamHandler.parseQueryParams(queryString);
console.log('Parsed params:', parsedParams);
console.log('Stringified back:', URLParamHandler.stringifyParams(parsedParams));

// === JSON Coercion Handling ===
console.log('\n=== JSON Coercion ===');

class JSONHandler {
  static safeStringify(value, space = null) {
    try {
      return JSON.stringify(value, (key, val) => {
        // Handle special values
        if (typeof val === 'function') return '[Function]';
        if (typeof val === 'undefined') return '[Undefined]';
        if (typeof val === 'symbol') return '[Symbol]';
        if (val instanceof Date) return val.toISOString();
        if (typeof val === 'bigint') return val.toString() + 'n';
        if (val !== val) return '[NaN]'; // NaN check
        if (val === Infinity) return '[Infinity]';
        if (val === -Infinity) return '[-Infinity]';
        return val;
      }, space);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  
  static safeParse(jsonString, reviver = null) {
    try {
      return JSON.parse(jsonString, reviver || ((key, value) => {
        // Restore special values
        if (value === '[Undefined]') return undefined;
        if (value === '[NaN]') return NaN;
        if (value === '[Infinity]') return Infinity;
        if (value === '[-Infinity]') return -Infinity;
        if (typeof value === 'string' && value.endsWith('n')) {
          try {
            return BigInt(value.slice(0, -1));
          } catch {
            return value;
          }
        }
        return value;
      }));
    } catch (error) {
      return { error: error.message };
    }
  }
}

// Test JSON handling
const complexObject = {
  name: 'Test',
  func: () => 'hello',
  undef: undefined,
  nan: NaN,
  inf: Infinity,
  bigint: 123n,
  date: new Date('2024-01-01')
};

const jsonString = JSONHandler.safeStringify(complexObject, 2);
console.log('Safe stringify:', jsonString);
const parsed = JSONHandler.safeParse(jsonString);
console.log('Safe parse:', parsed);

// === Configuration Object Coercion ===
console.log('\n=== Configuration Coercion ===');

class ConfigHandler {
  static normalizeConfig(config, schema) {
    const normalized = {};
    
    Object.entries(schema).forEach(([key, def]) => {
      const value = config[key];
      
      if (value === undefined) {
        normalized[key] = def.default;
        return;
      }
      
      try {
        normalized[key] = this.coerceToType(value, def.type, def.options);
      } catch (error) {
        console.warn(`Config error for ${key}: ${error.message}`);
        normalized[key] = def.default;
      }
    });
    
    return normalized;
  }
  
  static coerceToType(value, type, options = {}) {
    switch (type) {
      case 'string':
        return String(value);
        
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new Error('Invalid number');
        if (options.min !== undefined && num < options.min) {
          throw new Error(`Below minimum ${options.min}`);
        }
        if (options.max !== undefined && num > options.max) {
          throw new Error(`Above maximum ${options.max}`);
        }
        return num;
        
      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (value === 'true' || value === 1) return true;
        if (value === 'false' || value === 0) return false;
        throw new Error('Invalid boolean');
        
      case 'array':
        if (Array.isArray(value)) return value;
        return [value];
        
      default:
        return value;
    }
  }
}

// Test config handling
const configSchema = {
  host: { type: 'string', default: 'localhost' },
  port: { type: 'number', default: 3000, options: { min: 1, max: 65535 } },
  debug: { type: 'boolean', default: false },
  features: { type: 'array', default: [] }
};

const userConfig = {
  host: 'example.com',
  port: '8080',
  debug: 'true',
  features: 'logging'
};

const normalizedConfig = ConfigHandler.normalizeConfig(userConfig, configSchema);
console.log('Normalized config:', normalizedConfig);

// === Database Value Coercion ===
console.log('\n=== Database Value Coercion ===');

class DatabaseCoercion {
  static prepareForDatabase(value, columnType) {
    switch (columnType.toLowerCase()) {
      case 'varchar':
      case 'text':
        return value === null || value === undefined ? null : String(value);
        
      case 'int':
      case 'integer':
        if (value === null || value === undefined) return null;
        const intVal = parseInt(value, 10);
        return isNaN(intVal) ? null : intVal;
        
      case 'decimal':
      case 'float':
        if (value === null || value === undefined) return null;
        const floatVal = parseFloat(value);
        return isNaN(floatVal) ? null : floatVal;
        
      case 'boolean':
        if (value === null || value === undefined) return null;
        return Boolean(value);
        
      case 'datetime':
      case 'timestamp':
        if (value === null || value === undefined) return null;
        if (value instanceof Date) return value;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
        
      case 'json':
        return value === null || value === undefined ? null : JSON.stringify(value);
        
      default:
        return value;
    }
  }
  
  static parseFromDatabase(value, columnType) {
    if (value === null || value === undefined) return null;
    
    switch (columnType.toLowerCase()) {
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
        
      case 'boolean':
        // Handle different database boolean representations
        if (value === 1 || value === '1' || value === 'true') return true;
        if (value === 0 || value === '0' || value === 'false') return false;
        return Boolean(value);
        
      case 'datetime':
      case 'timestamp':
        return new Date(value);
        
      default:
        return value;
    }
  }
}

// Test database coercion
const dbTests = [
  { value: 'true', type: 'boolean' },
  { value: 1, type: 'boolean' },
  { value: '123.45', type: 'decimal' },
  { value: '2024-01-01', type: 'datetime' },
  { value: { name: 'test' }, type: 'json' }
];

dbTests.forEach(test => {
  const prepared = DatabaseCoercion.prepareForDatabase(test.value, test.type);
  const parsed = DatabaseCoercion.parseFromDatabase(prepared, test.type);
  console.log(`DB ${test.type}: ${test.value} -> ${prepared} -> ${JSON.stringify(parsed)}`);
});

// Export for testing
module.exports = {
  FormValidator,
  SafeConverter,
  URLParamHandler,
  JSONHandler,
  ConfigHandler,
  DatabaseCoercion,
  
  // Utility functions
  createTypeCoercer: (rules) => (value) => {
    for (const [test, converter] of rules) {
      if (test(value)) {
        return converter(value);
      }
    }
    return value;
  },
  
  // Common patterns
  commonPatterns: {
    stringToNumber: (str, fallback = 0) => {
      const num = Number(str);
      return isNaN(num) ? fallback : num;
    },
    
    anyToBoolean: (value) => {
      if (value === 'false' || value === '0' || value === 0) return false;
      return Boolean(value);
    },
    
    csvToArray: (csv) => {
      if (!csv) return [];
      return csv.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
};