/**
 * File: commonjs-basics.js
 * Description: CommonJS module system basics (Node.js style)
 */

// === Exporting in CommonJS ===
console.log('=== CommonJS Export Patterns ===\n');

// Method 1: module.exports (recommended)
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Export object
module.exports = {
  add,
  subtract,
  PI: 3.14159,
  version: '1.0.0'
};

// Method 2: exports shorthand (be careful!)
// Note: This works because exports is a reference to module.exports
// exports.multiply = (a, b) => a * b;
// exports.divide = (a, b) => a / b;

// Method 3: Direct assignment (overwrites)
// module.exports = function(a, b) {
//   return a + b;
// };

// === Different Export Patterns ===

// Pattern 1: Object with methods
const mathUtils = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

// Pattern 2: Constructor function
function Calculator(initialValue = 0) {
  this.value = initialValue;
}

Calculator.prototype.add = function(n) {
  this.value += n;
  return this;
};

Calculator.prototype.multiply = function(n) {
  this.value *= n;
  return this;
};

Calculator.prototype.getResult = function() {
  return this.value;
};

// Pattern 3: Class (modern Node.js)
class AdvancedCalculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
    this.history = [];
  }
  
  add(n) {
    this.history.push({ operation: 'add', value: n });
    this.value += n;
    return this;
  }
  
  subtract(n) {
    this.history.push({ operation: 'subtract', value: n });
    this.value -= n;
    return this;
  }
  
  getHistory() {
    return [...this.history];
  }
  
  clear() {
    this.value = 0;
    this.history = [];
    return this;
  }
}

// Pattern 4: Factory function
function createCounter(initialValue = 0) {
  let count = initialValue;
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    reset() {
      count = initialValue;
      return count;
    },
    getValue() {
      return count;
    }
  };
}

// Pattern 5: Singleton pattern
const Logger = (function() {
  let instance;
  
  function createLogger() {
    const logs = [];
    
    return {
      log(message) {
        logs.push({
          message,
          timestamp: new Date(),
          level: 'info'
        });
      },
      
      error(message) {
        logs.push({
          message,
          timestamp: new Date(),
          level: 'error'
        });
      },
      
      getLogs() {
        return [...logs];
      },
      
      clearLogs() {
        logs.length = 0;
      }
    };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createLogger();
      }
      return instance;
    }
  };
})();

// === Module Information ===
console.log('Module filename:', __filename);
console.log('Module dirname:', __dirname);
console.log('Module exports:', Object.keys(module.exports));
console.log('Module loaded:', module.loaded);
console.log('Module parent:', module.parent ? module.parent.filename : 'none');

// === Requiring Modules ===
// Note: These would work in a real Node.js environment

// Built-in modules
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// Local modules (relative paths)
// const utils = require('./utils'); // Same directory
// const helpers = require('../helpers'); // Parent directory
// const config = require('../../config'); // Two levels up

// npm packages
// const lodash = require('lodash');
// const express = require('express');

// === Conditional Require ===
function conditionalRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    console.log(`Module ${moduleName} not found:`, error.message);
    return null;
  }
}

// === Module Caching ===
console.log('\n=== Module Caching ===');
console.log('Require cache keys:', Object.keys(require.cache));

// Function to clear module from cache
function clearModuleCache(modulePath) {
  delete require.cache[require.resolve(modulePath)];
}

// === Runtime Module Loading ===
function loadModuleDynamically(moduleName) {
  try {
    // This would load the module at runtime
    const module = require(moduleName);
    console.log(`Dynamically loaded: ${moduleName}`);
    return module;
  } catch (error) {
    console.error(`Failed to load ${moduleName}:`, error.message);
    return null;
  }
}

// === Module Wrapper ===
// Node.js wraps every module in a function like this:
// (function(exports, require, module, __filename, __dirname) {
//   // Module code here
// });

console.log('\n=== Module Wrapper Arguments ===');
console.log('exports:', typeof exports);
console.log('require:', typeof require);
console.log('module:', typeof module);
console.log('__filename:', typeof __filename);
console.log('__dirname:', typeof __dirname);

// === Practical Examples ===

// Example 1: Config module
const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'myapp'
  },
  api: {
    port: process.env.PORT || 3000,
    version: 'v1'
  }
};

// Example 2: Utility functions
const stringUtils = {
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },
  
  truncate(str, length = 50) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }
};

// Example 3: Service class
class UserService {
  constructor(database) {
    this.db = database;
    this.cache = new Map();
  }
  
  async getUser(id) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    
    // Simulate database call
    const user = { id, name: `User ${id}`, email: `user${id}@example.com` };
    this.cache.set(id, user);
    return user;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// === Final Export (choose one pattern) ===
// Option 1: Export everything
module.exports = {
  mathUtils,
  Calculator,
  AdvancedCalculator,
  createCounter,
  Logger,
  config,
  stringUtils,
  UserService,
  
  // Utility functions
  conditionalRequire,
  clearModuleCache,
  loadModuleDynamically
};

// Option 2: Export single main export
// module.exports = AdvancedCalculator;

// Option 3: Export with additional properties
// module.exports = AdvancedCalculator;
// module.exports.VERSION = '2.0.0';
// module.exports.createBasic = () => new Calculator();

// === Module Usage Examples ===
// These show how this module would be used:

/*
// In another file:
const { Calculator, mathUtils, stringUtils } = require('./commonjs-basics');

const calc = new Calculator(10);
console.log(calc.add(5).multiply(2).getResult()); // 30

console.log(mathUtils.add(5, 3)); // 8
console.log(stringUtils.capitalize('hello world')); // Hello world

// Or import everything:
const basics = require('./commonjs-basics');
const calc2 = new basics.Calculator();
*/