/**
 * File: advanced-patterns.js
 * Description: Advanced 'this' binding patterns including custom implementations and complex scenarios
 * Time Complexity: Varies by pattern (noted per function)
 * Space Complexity: O(1) for most patterns, O(n) for collections
 */

// Advanced Pattern 1: Soft Binding
// Allows re-binding unlike hard binding, but provides fallback when 'this' is global/undefined

function softBind(fn, obj, ...boundArgs) {
  return function(...args) {
    // Check if 'this' is global object or undefined (default binding scenario)
    const context = (!this || this === globalThis) ? obj : this;
    return fn.apply(context, [...boundArgs, ...args]);
  };
}

// Extend Function.prototype for convenience
Function.prototype.softBind = function(obj, ...boundArgs) {
  const fn = this;
  
  const bound = function(...args) {
    // Use provided object only if 'this' is global/undefined
    const context = (!this || this === globalThis) ? obj : this;
    return fn.apply(context, [...boundArgs, ...args]);
  };
  
  return bound;
};

function demonstrateSoftBinding() {
  console.log('1. Soft Binding Pattern:');
  
  function greet(greeting) {
    console.log(`  ${greeting}, I'm ${this.name}`);
  }
  
  const person1 = { name: 'Alice' };
  const person2 = { name: 'Bob' };
  
  // Create soft-bound function
  const softGreet = greet.softBind(person1, 'Hello');
  
  // Default binding scenario - uses bound object
  softGreet(); // Uses person1
  
  // Explicit binding - allows override
  softGreet.call(person2); // Uses person2 (overrides soft binding)
  
  // Compare with hard binding
  const hardGreet = greet.bind(person1, 'Hello');
  hardGreet.call(person2); // Still uses person1 (cannot override)
}

// Advanced Pattern 2: Context-Preserving Decorators
// Decorators that preserve 'this' context while adding functionality

class ContextPreservingDecorators {
  // Timing decorator that preserves 'this'
  static timed(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      const start = performance.now();
      console.log(`  Starting ${propertyKey}...`);
      
      // Preserve 'this' context
      const result = originalMethod.apply(this, args);
      
      const end = performance.now();
      console.log(`  ${propertyKey} took ${(end - start).toFixed(2)}ms`);
      
      return result;
    };
    
    return descriptor;
  }
  
  // Logging decorator with context preservation
  static logged(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      console.log(`  [${this.constructor.name}] Calling ${propertyKey} with:`, args);
      
      try {
        const result = originalMethod.apply(this, args);
        console.log(`  [${this.constructor.name}] ${propertyKey} returned:`, result);
        return result;
      } catch (error) {
        console.log(`  [${this.constructor.name}] ${propertyKey} threw:`, error.message);
        throw error;
      }
    };
    
    return descriptor;
  }
  
  // Memoization decorator preserving 'this'
  static memoized(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      // Create cache per instance using WeakMap
      if (!this._memoCache) {
        this._memoCache = new Map();
      }
      
      const key = `${propertyKey}:${JSON.stringify(args)}`;
      
      if (this._memoCache.has(key)) {
        console.log(`  Cache hit for ${propertyKey}`);
        return this._memoCache.get(key);
      }
      
      const result = originalMethod.apply(this, args);
      this._memoCache.set(key, result);
      console.log(`  Cached result for ${propertyKey}`);
      
      return result;
    };
    
    return descriptor;
  }
}

// Example class using decorators
class Calculator {
  constructor(name) {
    this.name = name;
  }
  
  // Apply multiple decorators
  @ContextPreservingDecorators.timed
  @ContextPreservingDecorators.logged
  @ContextPreservingDecorators.memoized
  expensiveCalculation(n) {
    // Simulate expensive operation
    let result = 0;
    for (let i = 0; i < n * 1000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  }
  
  @ContextPreservingDecorators.logged
  add(a, b) {
    return a + b;
  }
}

function demonstrateDecorators() {
  console.log('\n2. Context-Preserving Decorators:');
  
  const calc = new Calculator('Scientific Calculator');
  
  // First call - no cache
  calc.expensiveCalculation(5);
  
  // Second call - cache hit
  calc.expensiveCalculation(5);
  
  // Regular method
  calc.add(10, 20);
}

// Advanced Pattern 3: Dynamic Context Switching
// Allow objects to dynamically switch their execution context

class ContextSwitcher {
  constructor() {
    this.contexts = new Map();
    this.currentContext = null;
  }
  
  // Register a context with a name
  registerContext(name, contextObject) {
    this.contexts.set(name, contextObject);
    console.log(`  Registered context: ${name}`);
  }
  
  // Switch to a different context
  switchTo(contextName) {
    if (!this.contexts.has(contextName)) {
      throw new Error(`Context '${contextName}' not found`);
    }
    
    this.currentContext = contextName;
    console.log(`  Switched to context: ${contextName}`);
  }
  
  // Execute function in current context
  execute(fn, ...args) {
    if (!this.currentContext) {
      throw new Error('No context selected');
    }
    
    const context = this.contexts.get(this.currentContext);
    return fn.apply(context, args);
  }
  
  // Execute function in specific context without switching
  executeIn(contextName, fn, ...args) {
    if (!this.contexts.has(contextName)) {
      throw new Error(`Context '${contextName}' not found`);
    }
    
    const context = this.contexts.get(contextName);
    return fn.apply(context, args);
  }
}

function demonstrateContextSwitching() {
  console.log('\n3. Dynamic Context Switching:');
  
  const switcher = new ContextSwitcher();
  
  // Register different contexts
  switcher.registerContext('user', { 
    name: 'John User', 
    role: 'user',
    permissions: ['read'] 
  });
  
  switcher.registerContext('admin', { 
    name: 'Jane Admin', 
    role: 'admin',
    permissions: ['read', 'write', 'delete'] 
  });
  
  // Function to execute in different contexts
  function checkPermissions(action) {
    const hasPermission = this.permissions.includes(action);
    console.log(`  ${this.name} (${this.role}) can ${action}: ${hasPermission}`);
    return hasPermission;
  }
  
  // Switch contexts and execute
  switcher.switchTo('user');
  switcher.execute(checkPermissions, 'read');   // true
  switcher.execute(checkPermissions, 'delete'); // false
  
  switcher.switchTo('admin');
  switcher.execute(checkPermissions, 'read');   // true
  switcher.execute(checkPermissions, 'delete'); // true
  
  // Execute in specific context without switching
  switcher.executeIn('user', checkPermissions, 'write'); // false
}

// Advanced Pattern 4: Proxy-Based 'this' Interception
// Use Proxy to intercept and modify 'this' behavior

function createThisProxy(target, handler = {}) {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      
      if (typeof value === 'function') {
        return function(...args) {
          // Custom 'this' handling logic
          let context = obj;
          
          // Apply custom handler if provided
          if (handler.beforeCall) {
            context = handler.beforeCall(obj, prop, args) || obj;
          }
          
          console.log(`  Proxied call to ${prop} with context:`, context.constructor.name);
          
          const result = value.apply(context, args);
          
          // Post-call handling
          if (handler.afterCall) {
            handler.afterCall(obj, prop, args, result);
          }
          
          return result;
        };
      }
      
      return value;
    }
  });
}

function demonstrateThisProxy() {
  console.log('\n4. Proxy-Based This Interception:');
  
  class Service {
    constructor(name) {
      this.name = name;
      this.callCount = 0;
    }
    
    process(data) {
      this.callCount++;
      return `${this.name} processed: ${data}`;
    }
    
    getStats() {
      return { name: this.name, calls: this.callCount };
    }
  }
  
  const service = new Service('DataService');
  
  // Create proxy with custom handlers
  const proxiedService = createThisProxy(service, {
    beforeCall: (obj, method, args) => {
      console.log(`    Before ${method}: callCount = ${obj.callCount}`);
      return obj; // Return original context
    },
    
    afterCall: (obj, method, args, result) => {
      console.log(`    After ${method}: callCount = ${obj.callCount}`);
    }
  });
  
  // Use proxied service
  const result1 = proxiedService.process('test data 1');
  console.log(`  Result: ${result1}`);
  
  const result2 = proxiedService.process('test data 2');
  console.log(`  Result: ${result2}`);
  
  const stats = proxiedService.getStats();
  console.log(`  Final stats:`, stats);
}

// Advanced Pattern 5: Method Borrowing and Delegation
// Advanced techniques for sharing methods between objects

class MethodBorrowing {
  // Generic method that can work with any object having required properties
  static createFormatter() {
    return function(template) {
      // 'this' will be the object calling this method
      return template.replace(/\{(\w+)\}/g, (match, prop) => {
        return this[prop] || match;
      });
    };
  }
  
  // Method delegation pattern
  static createDelegator(target, methods) {
    const delegator = {};
    
    methods.forEach(methodName => {
      delegator[methodName] = function(...args) {
        console.log(`  Delegating ${methodName} to target`);
        
        // 'this' refers to delegator, but we call method on target
        return target[methodName].apply(target, args);
      };
    });
    
    return delegator;
  }
  
  // Mixin pattern preserving 'this'
  static mixin(target, source) {
    Object.getOwnPropertyNames(source.prototype || source).forEach(name => {
      if (name !== 'constructor' && typeof source[name] === 'function') {
        target[name] = function(...args) {
          // Call source method with target's 'this'
          return source[name].apply(this, args);
        };
      }
    });
    
    return target;
  }
}

function demonstrateMethodBorrowing() {
  console.log('\n5. Method Borrowing and Delegation:');
  
  // Method borrowing example
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    age: 30
  };
  
  const company = {
    name: 'TechCorp',
    industry: 'Technology',
    employees: 100
  };
  
  // Create shared formatter method
  const format = MethodBorrowing.createFormatter();
  
  // Borrow method for different objects
  const userDescription = format.call(user, 'Hello, I am {firstName} {lastName}, {age} years old');
  const companyDescription = format.call(company, '{name} is a {industry} company with {employees} employees');
  
  console.log(`  User: ${userDescription}`);
  console.log(`  Company: ${companyDescription}`);
  
  // Method delegation example
  const dataStore = {
    data: [],
    add: function(item) {
      this.data.push(item);
      console.log(`    Added: ${item}`);
    },
    getAll: function() {
      return [...this.data];
    },
    clear: function() {
      this.data = [];
      console.log('    Data cleared');
    }
  };
  
  const delegator = MethodBorrowing.createDelegator(dataStore, ['add', 'getAll', 'clear']);
  
  delegator.add('item1');
  delegator.add('item2');
  console.log(`  All items:`, delegator.getAll());
  delegator.clear();
}

// Performance Comparison of Binding Methods
function performanceComparison() {
  console.log('\n6. Performance Comparison:');
  
  const obj = { value: 42 };
  
  function testFunction(a, b) {
    return this.value + a + b;
  }
  
  const iterations = 1000000;
  
  // Test direct method call
  obj.testMethod = testFunction;
  console.time('  Direct method call');
  for (let i = 0; i < iterations; i++) {
    obj.testMethod(1, 2);
  }
  console.timeEnd('  Direct method call');
  
  // Test call()
  console.time('  call() method');
  for (let i = 0; i < iterations; i++) {
    testFunction.call(obj, 1, 2);
  }
  console.timeEnd('  call() method');
  
  // Test apply()
  console.time('  apply() method');
  for (let i = 0; i < iterations; i++) {
    testFunction.apply(obj, [1, 2]);
  }
  console.timeEnd('  apply() method');
  
  // Test bind()
  const boundFunction = testFunction.bind(obj);
  console.time('  bind() method');
  for (let i = 0; i < iterations; i++) {
    boundFunction(1, 2);
  }
  console.timeEnd('  bind() method');
  
  // Test arrow function
  const arrowBound = (...args) => testFunction.apply(obj, args);
  console.time('  Arrow function');
  for (let i = 0; i < iterations; i++) {
    arrowBound(1, 2);
  }
  console.timeEnd('  Arrow function');
}

// Comprehensive demo function
async function runAdvancedPatternsDemo() {
  console.log('=== Advanced This Binding Patterns Demo ===\n');
  
  demonstrateSoftBinding();
  demonstrateDecorators();
  demonstrateContextSwitching();
  demonstrateThisProxy();
  demonstrateMethodBorrowing();
  performanceComparison();
  
  console.log('\n=== Advanced Patterns Demo Complete ===');
}

// Export for use in other modules
module.exports = {
  softBind,
  ContextPreservingDecorators,
  ContextSwitcher,
  createThisProxy,
  MethodBorrowing,
  Calculator,
  demonstrateSoftBinding,
  demonstrateDecorators,
  demonstrateContextSwitching,
  demonstrateThisProxy,
  demonstrateMethodBorrowing,
  performanceComparison,
  runAdvancedPatternsDemo
};