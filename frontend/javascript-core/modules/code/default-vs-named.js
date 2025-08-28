/**
 * File: default-vs-named.js
 * Description: ES Modules default vs named exports comparison
 * Demonstrates different export patterns, import syntax, and best practices
 */

console.log('=== Default vs Named Exports ===');

// Example 1: Named Exports Patterns
console.log('1. Named Exports Patterns:');

// Simulate named exports module
const namedExportsModule = {
  // Individual named exports
  PI: 3.14159,
  E: 2.71828,
  
  // Function exports
  add: function(a, b) {
    return a + b;
  },
  
  subtract: function(a, b) {
    return a - b;
  },
  
  multiply: function(a, b) {
    return a * b;
  },
  
  // Class export
  Calculator: class Calculator {
    constructor() {
      this.result = 0;
    }
    
    add(x) {
      this.result += x;
      return this;
    }
    
    getResult() {
      return this.result;
    }
  },
  
  // Object export
  mathUtils: {
    square: (x) => x * x,
    cube: (x) => x * x * x,
    factorial: function(n) {
      return n <= 1 ? 1 : n * this.factorial(n - 1);
    }
  }
};

console.log('Named exports available:', Object.keys(namedExportsModule));

// Usage of named exports
const { PI, add, Calculator } = namedExportsModule;
console.log('Using named imports:', { PI, result: add(5, 3) });

const calc = new Calculator();
console.log('Calculator result:', calc.add(10).add(5).getResult());

// Example 2: Default Export Patterns
console.log('\n2. Default Export Patterns:');

// Pattern A: Class as default export
const UserClassDefault = class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.id = Math.random().toString(36).substr(2, 9);
  }
  
  toString() {
    return `User(${this.name}, ${this.email})`;
  }
  
  static create(name, email) {
    return new User(name, email);
  }
};

console.log('Default class export example:');
const user1 = new UserClassDefault('John', 'john@example.com');
console.log('User:', user1.toString());

// Pattern B: Function as default export
const loggerFunctionDefault = function createLogger(level = 'info') {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  const currentLevel = levels[level] || 1;
  
  return {
    debug: (msg) => currentLevel <= 0 && console.log(`[DEBUG] ${msg}`),
    info: (msg) => currentLevel <= 1 && console.log(`[INFO] ${msg}`),
    warn: (msg) => currentLevel <= 2 && console.log(`[WARN] ${msg}`),
    error: (msg) => currentLevel <= 3 && console.log(`[ERROR] ${msg}`)
  };
};

console.log('Default function export example:');
const logger = loggerFunctionDefault('debug');
logger.info('This is an info message');
logger.warn('This is a warning message');

// Pattern C: Object as default export
const configObjectDefault = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  },
  ui: {
    theme: 'dark',
    language: 'en',
    animations: true
  },
  features: {
    analytics: true,
    notifications: false,
    caching: true
  },
  
  // Methods on default object
  get(path) {
    const keys = path.split('.');
    let current = this;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  },
  
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = this;
    
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  }
};

console.log('Default object export example:');
console.log('API base URL:', configObjectDefault.get('api.baseUrl'));
configObjectDefault.set('ui.theme', 'light');
console.log('Updated theme:', configObjectDefault.get('ui.theme'));

console.log('\n=== Mixing Default and Named Exports ===');

// Example 3: Mixed export patterns
console.log('3. Mixed export patterns:');

// Simulate a module with both default and named exports
const mixedExportsModule = {
  // Default export (main functionality)
  default: class EventEmitter {
    constructor() {
      this.events = {};
    }
    
    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }
    
    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(callback => callback(data));
      }
    }
    
    off(event, callback) {
      if (this.events[event]) {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      }
    }
  },
  
  // Named exports (utilities)
  EVENT_TYPES: {
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    DATA_UPDATED: 'data:updated',
    ERROR_OCCURRED: 'error:occurred'
  },
  
  createEventBus: function() {
    return new this.default();
  },
  
  isValidEventName: function(name) {
    return typeof name === 'string' && name.length > 0;
  },
  
  once: function(emitter, event) {
    return new Promise(resolve => {
      const handler = (data) => {
        emitter.off(event, handler);
        resolve(data);
      };
      emitter.on(event, handler);
    });
  }
};

// Usage of mixed exports
console.log('Using mixed exports:');
const EventEmitter = mixedExportsModule.default;
const { EVENT_TYPES, createEventBus, once } = mixedExportsModule;

const emitter = new EventEmitter();
emitter.on(EVENT_TYPES.USER_LOGIN, (user) => {
  console.log('User logged in:', user.name);
});

emitter.emit(EVENT_TYPES.USER_LOGIN, { name: 'Alice', id: 123 });

console.log('\n=== Import Syntax Patterns ===');

// Example 4: Different import syntax patterns
console.log('4. Import syntax patterns:');

// Simulate different import scenarios
function demonstrateImportPatterns() {
  console.log('Import pattern demonstrations:');
  
  // Pattern 1: Named imports
  console.log('// import { add, subtract, PI } from "./math.js"');
  const namedImportResult = namedExportsModule.add(namedExportsModule.PI, 2);
  console.log('Named import usage:', namedImportResult);
  
  // Pattern 2: Default import
  console.log('// import User from "./user.js"');
  const defaultImportResult = new UserClassDefault('Jane', 'jane@example.com');
  console.log('Default import usage:', defaultImportResult.toString());
  
  // Pattern 3: Mixed imports
  console.log('// import EventEmitter, { EVENT_TYPES, once } from "./events.js"');
  const mixedImportDemo = createEventBus();
  console.log('Mixed import - created event bus:', typeof mixedImportDemo);
  
  // Pattern 4: Namespace import
  console.log('// import * as MathUtils from "./math.js"');
  const namespaceImport = { ...namedExportsModule };
  console.log('Namespace import keys:', Object.keys(namespaceImport).slice(0, 5));
  
  // Pattern 5: Renamed imports
  console.log('// import { add as sum, multiply as product } from "./math.js"');
  const sum = namedExportsModule.add;
  const product = namedExportsModule.multiply;
  console.log('Renamed imports:', sum(3, 4), product(3, 4));
  
  // Pattern 6: Side-effect imports
  console.log('// import "./polyfills.js" (side effects only)');
  console.log('Side-effect import: module loaded for its side effects');
}

demonstrateImportPatterns();

console.log('\n=== Best Practices and Guidelines ===');

// Example 5: When to use default vs named exports
console.log('5. When to use default vs named exports:');

// Use case 1: Single primary export - use default
console.log('Use case 1: Single primary export (default)');
const DatabaseDefault = class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connected = false;
  }
  
  async connect() {
    console.log('Connecting to database...');
    this.connected = true;
    return this;
  }
  
  async disconnect() {
    console.log('Disconnecting from database...');
    this.connected = false;
  }
  
  query(sql) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }
    return `Executing: ${sql}`;
  }
};

// Use case 2: Multiple utilities - use named exports
console.log('Use case 2: Multiple utilities (named)');
const stringUtilsNamed = {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  kebabCase: (str) => str.replace(/\s+/g, '-').toLowerCase(),
  camelCase: (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
  truncate: (str, length) => str.length > length ? str.slice(0, length) + '...' : str,
  reverse: (str) => str.split('').reverse().join(''),
  isPalindrome: (str) => str === str.split('').reverse().join('')
};

// Use case 3: Main + utilities - use mixed exports
console.log('Use case 3: Main + utilities (mixed)');
const validatorMixed = {
  // Default export - main validator class
  default: class Validator {
    constructor(rules = {}) {
      this.rules = rules;
    }
    
    validate(data) {
      const errors = [];
      
      for (const [field, value] of Object.entries(data)) {
        const rule = this.rules[field];
        if (rule && !rule(value)) {
          errors.push(`Invalid ${field}: ${value}`);
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  },
  
  // Named exports - utility functions
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isPhone: (phone) => /^\d{3}-\d{3}-\d{4}$/.test(phone),
  isRequired: (value) => value !== null && value !== undefined && value !== '',
  minLength: (min) => (value) => value && value.length >= min,
  maxLength: (max) => (value) => value && value.length <= max,
  isNumber: (value) => !isNaN(parseFloat(value)) && isFinite(value)
};

// Usage examples
const db = new DatabaseDefault('postgresql://localhost:5432/mydb');
console.log('Database created:', typeof db);

console.log('String utils:', stringUtilsNamed.capitalize('hello world'));
console.log('Kebab case:', stringUtilsNamed.kebabCase('Hello World'));

const Validator = validatorMixed.default;
const { isEmail, minLength } = validatorMixed;
const validator = new Validator({
  email: isEmail,
  password: minLength(8)
});

const result = validator.validate({
  email: 'invalid-email',
  password: '123'
});
console.log('Validation result:', result);

console.log('\n=== Common Pitfalls and Solutions ===');

// Example 6: Common pitfalls
console.log('6. Common pitfalls and solutions:');

// Pitfall 1: Default import confusion
console.log('Pitfall 1: Default import confusion');
function demonstrateDefaultImportConfusion() {
  // What people expect vs what actually happens
  
  // Module with named export
  const moduleWithNamed = {
    myFunction: () => 'I am a named export'
  };
  
  // WRONG: Trying to import named as default
  // This would fail: import myFunction from './module.js'
  // Should be: import { myFunction } from './module.js'
  
  console.log('Named export accessed correctly:', moduleWithNamed.myFunction());
  
  // Module with default export
  const moduleWithDefault = {
    default: () => 'I am the default export'
  };
  
  // WRONG: Trying to destructure default
  // This would fail: import { default } from './module.js'
  // Should be: import defaultFunction from './module.js'
  
  console.log('Default export accessed correctly:', moduleWithDefault.default());
}

demonstrateDefaultImportConfusion();

// Pitfall 2: Mixed exports confusion
console.log('\nPitfall 2: Mixed exports confusion');
function demonstrateMixedExportsConfusion() {
  // Module with both default and named exports
  const mixedModule = {
    default: { name: 'Default Object', type: 'default' },
    namedExport: { name: 'Named Export', type: 'named' },
    anotherNamed: { name: 'Another Named', type: 'named' }
  };
  
  // Correct usage patterns:
  console.log('Correct mixed import patterns:');
  console.log('// import DefaultThing from "./mixed.js"');
  console.log('// import { namedExport } from "./mixed.js"'); 
  console.log('// import DefaultThing, { namedExport, anotherNamed } from "./mixed.js"');
  
  // Simulate usage
  const DefaultThing = mixedModule.default;
  const { namedExport, anotherNamed } = mixedModule;
  
  console.log('Default:', DefaultThing.name);
  console.log('Named:', namedExport.name, anotherNamed.name);
}

demonstrateMixedExportsConfusion();

// Pitfall 3: Circular dependency issues
console.log('\nPitfall 3: Circular dependency issues');
function demonstrateCircularDependencyIssues() {
  // Simulate circular dependency problem
  
  // Module A (depends on B)
  const moduleA = {
    name: 'Module A',
    getValue: function() {
      // This would cause issues in real circular dependency
      return this.name + ' -> ' + (moduleB ? moduleB.name : 'undefined');
    }
  };
  
  // Module B (depends on A)
  const moduleB = {
    name: 'Module B',
    getValue: function() {
      return this.name + ' -> ' + (moduleA ? moduleA.name : 'undefined');
    }
  };
  
  console.log('Circular dependency simulation:');
  console.log('A:', moduleA.getValue());
  console.log('B:', moduleB.getValue());
  
  // Solutions:
  console.log('Solutions for circular dependencies:');
  console.log('1. Restructure code to remove circular dependency');
  console.log('2. Use dynamic imports');
  console.log('3. Move shared code to a third module');
  console.log('4. Use dependency injection');
}

demonstrateCircularDependencyIssues();

console.log('\n=== Performance and Tree Shaking ===');

// Example 7: Tree shaking implications
console.log('7. Tree shaking implications:');

function demonstrateTreeShaking() {
  // Good for tree shaking - named exports
  const treeShakableMathUtils = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b,
    power: (a, b) => Math.pow(a, b),
    sqrt: (a) => Math.sqrt(a),
    // Many more functions...
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan
    // If only 'add' is imported, other functions can be tree-shaken
  };
  
  // Less optimal for tree shaking - default export object
  const nonTreeShakableDefault = {
    default: {
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      multiply: (a, b) => a * b,
      divide: (a, b) => a / b,
      // All functions come together as one object
      // Harder for bundlers to optimize
    }
  };
  
  console.log('Tree-shakable usage (named):');
  // import { add } from './math.js' - only imports what's needed
  const result1 = treeShakableMathUtils.add(5, 3);
  console.log('Add result:', result1);
  
  console.log('Less tree-shakable usage (default object):');
  // import mathUtils from './math.js' - imports entire object
  const result2 = nonTreeShakableDefault.default.add(5, 3);
  console.log('Add result:', result2);
  
  console.log('Tree shaking best practices:');
  console.log('✅ Use named exports for utilities');
  console.log('✅ Keep functions separate, not in objects');
  console.log('✅ Avoid side effects in modules');
  console.log('❌ Avoid default export of large objects');
  console.log('❌ Avoid importing entire namespaces when not needed');
}

demonstrateTreeShaking();

console.log('\n=== Interview Questions Scenarios ===');

// Example 8: Common interview scenarios
console.log('8. Interview question scenarios:');

function interviewQuestionScenarios() {
  console.log('Q: What is the difference between these imports?');
  console.log('A: import User from "./user.js"');
  console.log('B: import { User } from "./user.js"');
  console.log('C: import * as UserModule from "./user.js"');
  
  console.log('\nAnswers:');
  console.log('A: Imports the default export, expects module.exports = User');
  console.log('B: Imports named export "User", expects export { User }');
  console.log('C: Imports all exports as an object with "UserModule" name');
  
  console.log('\nQ: How do you export both default and named from same module?');
  console.log('A: You can have both:');
  console.log('   export default class User { }');
  console.log('   export const utils = { }');
  console.log('   export function helper() { }');
  
  console.log('\nQ: What happens if you import non-existent named export?');
  console.log('A: Results in undefined or SyntaxError depending on context');
  
  // Demonstrate
  const mockModule = { existingExport: 'exists' };
  console.log('Existing export:', mockModule.existingExport);
  console.log('Non-existing export:', mockModule.nonExistingExport); // undefined
}

interviewQuestionScenarios();

module.exports = {
  namedExportsModule,
  UserClassDefault,
  loggerFunctionDefault,
  configObjectDefault,
  mixedExportsModule,
  DatabaseDefault,
  stringUtilsNamed,
  validatorMixed
};