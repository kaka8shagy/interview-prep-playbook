/**
 * File: exports-vs-module-exports.js
 * Description: CommonJS exports vs module.exports patterns and differences
 * Demonstrates proper usage, common pitfalls, and best practices
 */

console.log('=== exports vs module.exports in CommonJS ===');

// Example 1: Understanding the relationship
console.log('1. Understanding the relationship:');

// At the beginning of every CommonJS module:
// exports = module.exports = {}
// They initially reference the same object

console.log('Initial state:');
console.log('exports === module.exports:', exports === module.exports);
console.log('typeof exports:', typeof exports);
console.log('typeof module.exports:', typeof module.exports);

// Example 2: Adding properties to exports (correct way)
console.log('\n2. Adding properties to exports:');

// Method 1: Using exports (shorthand)
exports.method1 = function() {
  return 'Method 1 via exports';
};

exports.property1 = 'Property 1 via exports';

// Method 2: Using module.exports
module.exports.method2 = function() {
  return 'Method 2 via module.exports';
};

module.exports.property2 = 'Property 2 via module.exports';

console.log('After adding properties:');
console.log('exports === module.exports:', exports === module.exports);
console.log('Object.keys(exports):', Object.keys(exports));
console.log('Object.keys(module.exports):', Object.keys(module.exports));

// Example 3: The crucial difference - reassignment
console.log('\n3. The crucial difference - reassignment:');

// Create a test module system
function createModuleSystem() {
  const moduleCache = {};
  
  function mockRequire(id) {
    if (moduleCache[id]) {
      return moduleCache[id].exports;
    }
    
    // Create module object
    const module = {
      id,
      exports: {}
    };
    
    // exports is initially same reference as module.exports
    let exports = module.exports;
    
    // Cache before executing
    moduleCache[id] = module;
    
    // Simulate different export patterns
    switch (id) {
      case 'pattern1':
        // Adding to exports (works)
        exports.name = 'Pattern 1';
        exports.getValue = () => 'Value from Pattern 1';
        break;
        
      case 'pattern2':
        // Adding to module.exports (works)
        module.exports.name = 'Pattern 2';
        module.exports.getValue = () => 'Value from Pattern 2';
        break;
        
      case 'pattern3':
        // Reassigning module.exports (works)
        module.exports = {
          name: 'Pattern 3',
          getValue: () => 'Value from Pattern 3'
        };
        break;
        
      case 'pattern4':
        // Reassigning exports (DOESN'T WORK!)
        exports = {
          name: 'Pattern 4',
          getValue: () => 'Value from Pattern 4'
        };
        break;
        
      case 'pattern5':
        // Mixed pattern (problematic)
        exports.name = 'Pattern 5';
        module.exports = {
          getValue: () => 'Value from Pattern 5'
        };
        // exports.name is lost!
        break;
    }
    
    return module.exports;
  }
  
  return mockRequire;
}

const mockRequire = createModuleSystem();

console.log('Testing different export patterns:');

const pattern1 = mockRequire('pattern1');
console.log('Pattern 1 (exports.prop):', pattern1);

const pattern2 = mockRequire('pattern2');
console.log('Pattern 2 (module.exports.prop):', pattern2);

const pattern3 = mockRequire('pattern3');
console.log('Pattern 3 (module.exports = {}):', pattern3);

const pattern4 = mockRequire('pattern4');
console.log('Pattern 4 (exports = {}) - BROKEN:', pattern4);

const pattern5 = mockRequire('pattern5');
console.log('Pattern 5 (mixed) - PARTIAL:', pattern5);

console.log('\n=== Common Patterns and Use Cases ===');

// Example 4: Named exports pattern
console.log('4. Named exports pattern:');

// Simulating a utility module
function createUtilityModule() {
  const module = { exports: {} };
  const exports = module.exports;
  
  // Named exports - good for multiple utilities
  exports.formatDate = function(date) {
    return date.toISOString().split('T')[0];
  };
  
  exports.generateId = function() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
  };
  
  exports.validateEmail = function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Can also add properties
  exports.VERSION = '1.0.0';
  exports.AUTHOR = 'Development Team';
  
  return module.exports;
}

const utils = createUtilityModule();
console.log('Utility functions:', Object.keys(utils));
console.log('Format date:', utils.formatDate(new Date()));
console.log('Generate ID:', utils.generateId());
console.log('Validate email:', utils.validateEmail('test@example.com'));

// Example 5: Single export pattern
console.log('\n5. Single export pattern:');

// Simulating a class module
function createClassModule() {
  const module = { exports: {} };
  
  // Single export - good for classes or main functions
  module.exports = class User {
    constructor(name, email) {
      this.name = name;
      this.email = email;
      this.created = new Date();
    }
    
    toString() {
      return `User(${this.name}, ${this.email})`;
    }
    
    getAge() {
      return Date.now() - this.created.getTime();
    }
  };
  
  return module.exports;
}

const User = createClassModule();
const user = new User('John Doe', 'john@example.com');
console.log('User instance:', user.toString());

// Example 6: Function export pattern
console.log('\n6. Function export pattern:');

function createFunctionModule() {
  const module = { exports: {} };
  
  // Export a single function
  module.exports = function calculator(operation, a, b) {
    switch (operation) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return b !== 0 ? a / b : NaN;
      default: throw new Error('Unknown operation');
    }
  };
  
  // Add properties to the function
  module.exports.version = '2.0.0';
  module.exports.operations = ['add', 'subtract', 'multiply', 'divide'];
  
  return module.exports;
}

const calculator = createFunctionModule();
console.log('Calculator result:', calculator('multiply', 6, 7));
console.log('Calculator version:', calculator.version);
console.log('Available operations:', calculator.operations);

console.log('\n=== Common Pitfalls and Solutions ===');

// Example 7: Pitfall - Reassigning exports
console.log('7. Pitfall - Reassigning exports:');

function demonstrateExportsReassignmentPitfall() {
  const module = { exports: {} };
  let exports = module.exports;
  
  console.log('Before reassignment - same reference:', exports === module.exports);
  
  // WRONG: This breaks the connection
  exports = {
    message: 'This will not work',
    getValue: () => 'Lost value'
  };
  
  console.log('After exports reassignment:');
  console.log('  exports === module.exports:', exports === module.exports);
  console.log('  module.exports:', module.exports);
  console.log('  exports:', exports);
  
  return module.exports; // Returns empty object!
}

const broken = demonstrateExportsReassignmentPitfall();
console.log('Broken module result:', broken);

// SOLUTION: Use module.exports for reassignment
function demonstrateCorrectReassignment() {
  const module = { exports: {} };
  
  // CORRECT: Reassign module.exports
  module.exports = {
    message: 'This works correctly',
    getValue: () => 'Working value'
  };
  
  return module.exports;
}

const working = demonstrateCorrectReassignment();
console.log('Working module result:', working);
console.log('Working message:', working.message);

// Example 8: Pitfall - Mixed patterns
console.log('\n8. Pitfall - Mixed patterns:');

function demonstrateMixedPatternsPitfall() {
  const module = { exports: {} };
  const exports = module.exports;
  
  // First, add some properties to exports
  exports.utility1 = () => 'Utility 1';
  exports.utility2 = () => 'Utility 2';
  
  console.log('After adding to exports:', Object.keys(module.exports));
  
  // Then, reassign module.exports (LOSES previous exports!)
  module.exports = {
    mainFunction: () => 'Main function'
  };
  
  console.log('After reassigning module.exports:', Object.keys(module.exports));
  
  return module.exports;
}

const mixed = demonstrateMixedPatternsPitfall();
console.log('Mixed pattern result:', mixed);
// utility1 and utility2 are lost!

console.log('\n=== Best Practices ===');

// Example 9: Consistent patterns
console.log('9. Best practices - Consistent patterns:');

// Pattern A: Always use exports for properties
function createConsistentExportsModule() {
  const module = { exports: {} };
  const exports = module.exports;
  
  exports.config = { version: '1.0.0' };
  exports.init = function() { return 'Initialized'; };
  exports.cleanup = function() { return 'Cleaned up'; };
  
  return module.exports;
}

// Pattern B: Always use module.exports for single export
function createConsistentModuleExportsModule() {
  const module = { exports: {} };
  
  module.exports = class Service {
    constructor(name) {
      this.name = name;
    }
    
    start() {
      return `${this.name} service started`;
    }
    
    stop() {
      return `${this.name} service stopped`;
    }
  };
  
  return module.exports;
}

const consistentExports = createConsistentExportsModule();
const ConsistentService = createConsistentModuleExportsModule();

console.log('Consistent exports keys:', Object.keys(consistentExports));
console.log('Consistent service:', new ConsistentService('Database').start());

// Example 10: Module factory pattern
console.log('\n10. Module factory pattern:');

function createModuleFactory() {
  const module = { exports: {} };
  
  // Export a factory function
  module.exports = function createLogger(prefix = 'LOG') {
    return {
      info: (message) => console.log(`[${prefix}:INFO] ${message}`),
      warn: (message) => console.log(`[${prefix}:WARN] ${message}`),
      error: (message) => console.log(`[${prefix}:ERROR] ${message}`)
    };
  };
  
  // Add static methods to the factory
  module.exports.createWithTimestamp = function(prefix) {
    const baseLogger = module.exports(prefix);
    return {
      info: (message) => baseLogger.info(`${new Date().toISOString()} ${message}`),
      warn: (message) => baseLogger.warn(`${new Date().toISOString()} ${message}`),
      error: (message) => baseLogger.error(`${new Date().toISOString()} ${message}`)
    };
  };
  
  return module.exports;
}

const createLogger = createModuleFactory();
const appLogger = createLogger('APP');
const timestampLogger = createLogger.createWithTimestamp('TIMESTAMP');

appLogger.info('Application started');
timestampLogger.warn('This is a warning with timestamp');

console.log('\n=== Interview Questions Demonstration ===');

// Example 11: Common interview question
console.log('11. Interview question - What happens here?');

function interviewQuestion() {
  const module = { exports: {} };
  let exports = module.exports;
  
  console.log('Question: What will be exported?');
  
  exports.a = 1;
  module.exports.b = 2;
  module.exports = { c: 3 };
  exports.d = 4; // This is lost!
  
  console.log('Answer - Final exports:', module.exports);
  console.log('Explanation: exports.d is lost because module.exports was reassigned');
  
  return module.exports;
}

interviewQuestion();

// Example 12: Advanced pattern - Conditional exports
console.log('\n12. Advanced pattern - Conditional exports:');

function createConditionalModule(environment = 'development') {
  const module = { exports: {} };
  
  if (environment === 'development') {
    // Development exports
    module.exports = {
      debug: true,
      log: console.log,
      warn: console.warn,
      error: console.error,
      inspect: (obj) => console.log(JSON.stringify(obj, null, 2))
    };
  } else {
    // Production exports (minimal)
    module.exports = {
      debug: false,
      log: () => {},
      warn: () => {},
      error: console.error,
      inspect: () => {}
    };
  }
  
  // Common properties regardless of environment
  module.exports.version = '1.0.0';
  module.exports.environment = environment;
  
  return module.exports;
}

const devLogger = createConditionalModule('development');
const prodLogger = createConditionalModule('production');

console.log('Dev logger debug:', devLogger.debug);
console.log('Prod logger debug:', prodLogger.debug);
console.log('Both have version:', devLogger.version, prodLogger.version);

console.log('\n=== Memory and Performance Considerations ===');

// Example 13: Memory implications
console.log('13. Memory implications:');

function demonstrateMemoryImplications() {
  console.log('Memory consideration: exports vs module.exports');
  
  // When you reassign module.exports, the original exports object
  // may become eligible for garbage collection
  
  const module = { exports: {} };
  let exports = module.exports;
  
  // Add large data to exports
  exports.largeData = new Array(1000).fill('data');
  console.log('Added large data to exports');
  
  // Reassign module.exports
  module.exports = {
    smallData: 'small'
  };
  console.log('Reassigned module.exports');
  
  // exports.largeData is now unreachable from module.exports
  // and may be garbage collected
  
  console.log('Large data still in exports:', exports.largeData.length);
  console.log('But not accessible from module.exports:', module.exports.largeData);
}

demonstrateMemoryImplications();

module.exports = {
  // Demonstrating proper export
  createModuleSystem,
  createUtilityModule,
  createClassModule,
  createFunctionModule,
  createConsistentExportsModule,
  createConsistentModuleExportsModule,
  createModuleFactory,
  createConditionalModule
};