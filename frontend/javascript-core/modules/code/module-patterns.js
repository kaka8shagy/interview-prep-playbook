/**
 * File: module-patterns.js
 * Description: Historical module patterns and implementations
 * Demonstrates evolution from IIFE to modern modules
 */

console.log('=== Historical Module Patterns ===');

// Example 1: IIFE (Immediately Invoked Function Expression) Pattern
console.log('1. IIFE Module Pattern:');

const MyModule = (function() {
  // Private variables and functions
  let privateCounter = 0;
  const privateData = 'secret';
  
  function privateFunction() {
    return `Private function called, counter: ${privateCounter}`;
  }
  
  // Public API
  return {
    increment() {
      privateCounter++;
      console.log('Counter incremented to:', privateCounter);
    },
    
    decrement() {
      privateCounter--;
      console.log('Counter decremented to:', privateCounter);
    },
    
    getCount() {
      return privateCounter;
    },
    
    getInfo() {
      return privateFunction();
    }
  };
})();

// Usage
MyModule.increment();
MyModule.increment();
console.log('Current count:', MyModule.getCount());
console.log('Info:', MyModule.getInfo());
// console.log(MyModule.privateData); // undefined - not accessible

console.log('\n2. Namespace Pattern:');

// Example 2: Namespace pattern
const App = App || {};

App.Utils = (function() {
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
  }
  
  return {
    formatDate,
    generateId
  };
})();

App.User = (function() {
  const users = [];
  
  function create(name, email) {
    const user = {
      id: App.Utils.generateId(),
      name,
      email,
      created: App.Utils.formatDate(new Date())
    };
    
    users.push(user);
    return user;
  }
  
  function findById(id) {
    return users.find(user => user.id === id);
  }
  
  return {
    create,
    findById,
    getAll: () => users.slice() // Return copy
  };
})();

// Usage
const user1 = App.User.create('John Doe', 'john@example.com');
const user2 = App.User.create('Jane Smith', 'jane@example.com');

console.log('Created users:', App.User.getAll());
console.log('Find user:', App.User.findById(user1.id));

console.log('\n3. Revealing Module Pattern:');

// Example 3: Revealing module pattern
const Calculator = (function() {
  let result = 0;
  
  function add(x) {
    result += x;
    logOperation('add', x);
    return this;
  }
  
  function subtract(x) {
    result -= x;
    logOperation('subtract', x);
    return this;
  }
  
  function multiply(x) {
    result *= x;
    logOperation('multiply', x);
    return this;
  }
  
  function divide(x) {
    if (x === 0) throw new Error('Division by zero');
    result /= x;
    logOperation('divide', x);
    return this;
  }
  
  function getValue() {
    return result;
  }
  
  function reset() {
    result = 0;
    console.log('Calculator reset');
    return this;
  }
  
  function logOperation(op, value) {
    console.log(`${op}(${value}) -> ${result}`);
  }
  
  // Reveal public methods
  return {
    add,
    subtract,
    multiply,
    divide,
    getValue,
    reset
  };
})();

// Usage with chaining
Calculator
  .reset()
  .add(10)
  .multiply(5)
  .subtract(20)
  .divide(3);

console.log('Final result:', Calculator.getValue());

console.log('\n=== AMD (Asynchronous Module Definition) ===');

// Example 4: AMD pattern simulation
console.log('4. AMD Pattern Simulation:');

// Simplified AMD implementation
const define = (function() {
  const modules = {};
  
  return function(name, dependencies, factory) {
    if (typeof name !== 'string') {
      // Anonymous module
      factory = dependencies;
      dependencies = name;
      name = 'anonymous-' + Date.now();
    }
    
    // Resolve dependencies
    const resolvedDeps = dependencies.map(dep => {
      if (dep === 'exports') {
        return {};
      } else if (dep === 'require') {
        return function(moduleName) {
          return modules[moduleName];
        };
      } else {
        return modules[dep] || {};
      }
    });
    
    // Execute factory
    const result = factory.apply(null, resolvedDeps);
    modules[name] = result || resolvedDeps[0]; // Use exports if no return
    
    console.log(`AMD module '${name}' defined`);
    return modules[name];
  };
})();

// Define utility module
define('utils', [], function() {
  return {
    isArray(obj) {
      return Array.isArray(obj);
    },
    
    clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  };
});

// Define module with dependencies
define('dataStore', ['utils'], function(utils) {
  const storage = [];
  
  return {
    add(item) {
      if (utils.isArray(item)) {
        storage.push(...item);
      } else {
        storage.push(item);
      }
    },
    
    get(index) {
      return index !== undefined ? storage[index] : storage.slice();
    },
    
    clear() {
      storage.length = 0;
    }
  };
});

// Define main module
define('app', ['dataStore', 'utils'], function(dataStore, utils) {
  return {
    init() {
      console.log('AMD App initialized');
      dataStore.add(['item1', 'item2', 'item3']);
      console.log('Data stored:', dataStore.get());
    }
  };
});

// Simulate require
const require = function(name) {
  return modules[name];
};

console.log('\n5. UMD (Universal Module Definition):');

// Example 5: UMD pattern
const UMDModule = (function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    console.log('Loading as AMD module');
    define(['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    console.log('Loading as CommonJS module');
    factory(exports);
  } else {
    // Browser globals
    console.log('Loading as global module');
    root.UMDModule = {};
    factory(root.UMDModule);
  }
}(typeof self !== 'undefined' ? self : this, function (exports) {
  // Module implementation
  let counter = 0;
  
  exports.increment = function() {
    return ++counter;
  };
  
  exports.decrement = function() {
    return --counter;
  };
  
  exports.getValue = function() {
    return counter;
  };
  
  console.log('UMD module initialized');
}));

// Test UMD module
console.log('UMD increment:', UMDModule.increment());
console.log('UMD increment:', UMDModule.increment());
console.log('UMD current value:', UMDModule.getValue());

console.log('\n=== Module Loader Patterns ===');

// Example 6: Simple module loader
console.log('6. Simple Module Loader:');

class SimpleModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loading = new Map(); // Track modules being loaded
  }
  
  define(name, dependencies, factory) {
    const module = {
      name,
      dependencies,
      factory,
      exports: {},
      loaded: false
    };
    
    this.modules.set(name, module);
    console.log(`Module '${name}' defined`);
  }
  
  async require(name) {
    if (!this.modules.has(name)) {
      throw new Error(`Module '${name}' not found`);
    }
    
    const module = this.modules.get(name);
    
    if (module.loaded) {
      return module.exports;
    }
    
    if (this.loading.has(name)) {
      // Circular dependency - return empty exports for now
      console.warn(`Circular dependency detected for '${name}'`);
      return module.exports;
    }
    
    this.loading.set(name, true);
    
    try {
      // Load dependencies first
      const deps = await Promise.all(
        module.dependencies.map(dep => this.require(dep))
      );
      
      // Execute factory
      const result = module.factory(...deps);
      if (result) {
        module.exports = result;
      }
      
      module.loaded = true;
      this.loading.delete(name);
      
      console.log(`Module '${name}' loaded`);
      return module.exports;
      
    } catch (error) {
      this.loading.delete(name);
      throw error;
    }
  }
  
  getModuleInfo() {
    const info = {};
    this.modules.forEach((module, name) => {
      info[name] = {
        loaded: module.loaded,
        dependencies: module.dependencies
      };
    });
    return info;
  }
}

// Usage example
const loader = new SimpleModuleLoader();

// Define modules
loader.define('math', [], function() {
  return {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b
  };
});

loader.define('formatter', ['math'], function(math) {
  return {
    formatResult: (operation, a, b) => {
      let result;
      if (operation === 'add') {
        result = math.add(a, b);
      } else if (operation === 'multiply') {
        result = math.multiply(a, b);
      }
      return `${operation}(${a}, ${b}) = ${result}`;
    }
  };
});

loader.define('app', ['formatter'], function(formatter) {
  return {
    run() {
      console.log(formatter.formatResult('add', 5, 3));
      console.log(formatter.formatResult('multiply', 4, 7));
    }
  };
});

// Load and run
loader.require('app').then(app => {
  app.run();
  console.log('Module info:', loader.getModuleInfo());
});

console.log('\n7. Plugin Architecture Pattern:');

// Example 7: Plugin architecture
class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    
    // Initialize plugin
    if (plugin.init) {
      plugin.init(this);
    }
    
    console.log(`Plugin '${name}' registered`);
  }
  
  registerHook(name, callback) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push(callback);
  }
  
  async executeHook(name, data) {
    const callbacks = this.hooks.get(name) || [];
    let result = data;
    
    for (const callback of callbacks) {
      result = await callback(result);
    }
    
    return result;
  }
  
  getPlugin(name) {
    return this.plugins.get(name);
  }
  
  listPlugins() {
    return Array.from(this.plugins.keys());
  }
}

// Example plugins
const loggerPlugin = {
  name: 'logger',
  
  init(system) {
    system.registerHook('beforeProcess', (data) => {
      console.log('Logger: Processing data:', data.id);
      return data;
    });
    
    system.registerHook('afterProcess', (data) => {
      console.log('Logger: Processed data:', data.id, 'result:', data.result);
      return data;
    });
  }
};

const validatorPlugin = {
  name: 'validator',
  
  init(system) {
    system.registerHook('beforeProcess', (data) => {
      if (!data.id || !data.value) {
        throw new Error('Invalid data: missing id or value');
      }
      console.log('Validator: Data is valid');
      return data;
    });
  }
};

const processorPlugin = {
  name: 'processor',
  
  process(data) {
    return {
      ...data,
      result: data.value * 2,
      processed: true
    };
  }
};

// Usage
const pluginSystem = new PluginSystem();

pluginSystem.registerPlugin('logger', loggerPlugin);
pluginSystem.registerPlugin('validator', validatorPlugin);
pluginSystem.registerPlugin('processor', processorPlugin);

async function processData(data) {
  try {
    // Execute hooks
    const beforeResult = await pluginSystem.executeHook('beforeProcess', data);
    
    // Get processor and process data
    const processor = pluginSystem.getPlugin('processor');
    const processed = processor.process(beforeResult);
    
    // Execute after hooks
    const afterResult = await pluginSystem.executeHook('afterProcess', processed);
    
    return afterResult;
  } catch (error) {
    console.error('Processing error:', error.message);
    return null;
  }
}

// Test the plugin system
Promise.resolve().then(async () => {
  console.log('Active plugins:', pluginSystem.listPlugins());
  
  const result1 = await processData({ id: 'item1', value: 10 });
  console.log('Result 1:', result1);
  
  const result2 = await processData({ id: 'item2' }); // Missing value
  console.log('Result 2:', result2);
});

console.log('\n=== Module Pattern Evolution ===');

// Example 8: Evolution demonstration
console.log('8. Module Pattern Evolution:');

// Step 1: Global variables (problematic)
var globalCounter = 0; // Pollutes global namespace

// Step 2: Object literal
var CounterObject = {
  value: 0,
  increment: function() {
    this.value++;
  }
}; // No privacy

// Step 3: IIFE with privacy
var CounterIIFE = (function() {
  var value = 0; // Private
  
  return {
    increment: function() {
      value++;
    },
    getValue: function() {
      return value;
    }
  };
})();

// Step 4: Modern class (ES6+)
class CounterClass {
  #value = 0; // Private field
  
  increment() {
    this.#value++;
  }
  
  getValue() {
    return this.#value;
  }
}

// Step 5: ES Module (modern approach)
// export class CounterModule {
//   #value = 0;
//   
//   increment() {
//     this.#value++;
//   }
//   
//   getValue() {
//     return this.#value;
//   }
// }

console.log('Pattern evolution complete - from globals to ES modules');

module.exports = {
  MyModule,
  App,
  Calculator,
  define,
  UMDModule,
  SimpleModuleLoader,
  PluginSystem,
  CounterClass
};