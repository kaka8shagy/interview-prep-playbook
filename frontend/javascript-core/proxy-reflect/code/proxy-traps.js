/**
 * File: proxy-traps.js
 * Description: Comprehensive overview of all proxy handler traps
 * Demonstrates each available trap with examples
 */

console.log('=== All Proxy Handler Traps ===\n');

// === Complete Handler with All Traps ===
const target = {
  name: 'John',
  age: 30,
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

const comprehensiveHandler = {
  // 1. get trap - intercepts property reads
  get(target, property, receiver) {
    console.log(`GET: Reading property "${property}"`);
    if (property === 'secret') {
      return 'Access denied';
    }
    return Reflect.get(target, property, receiver);
  },

  // 2. set trap - intercepts property writes
  set(target, property, value, receiver) {
    console.log(`SET: Setting property "${property}" to "${value}"`);
    if (property === 'age' && typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    return Reflect.set(target, property, value, receiver);
  },

  // 3. has trap - intercepts 'in' operator
  has(target, property) {
    console.log(`HAS: Checking if property "${property}" exists`);
    if (property === 'secret') {
      return false; // Hide secret property
    }
    return Reflect.has(target, property);
  },

  // 4. deleteProperty trap - intercepts delete operator
  deleteProperty(target, property) {
    console.log(`DELETE: Attempting to delete property "${property}"`);
    if (property === 'name') {
      console.log('Cannot delete name property');
      return false;
    }
    return Reflect.deleteProperty(target, property);
  },

  // 5. defineProperty trap - intercepts Object.defineProperty()
  defineProperty(target, property, descriptor) {
    console.log(`DEFINE: Defining property "${property}"`);
    console.log('Descriptor:', descriptor);
    return Reflect.defineProperty(target, property, descriptor);
  },

  // 6. getOwnPropertyDescriptor trap
  getOwnPropertyDescriptor(target, property) {
    console.log(`GET_DESCRIPTOR: Getting descriptor for "${property}"`);
    return Reflect.getOwnPropertyDescriptor(target, property);
  },

  // 7. ownKeys trap - intercepts Object.keys(), Object.getOwnPropertyNames(), etc.
  ownKeys(target) {
    console.log('OWN_KEYS: Getting own property keys');
    const keys = Reflect.ownKeys(target);
    // Filter out properties starting with underscore
    return keys.filter(key => !key.toString().startsWith('_'));
  },

  // 8. getPrototypeOf trap - intercepts Object.getPrototypeOf()
  getPrototypeOf(target) {
    console.log('GET_PROTOTYPE: Getting prototype');
    return Reflect.getPrototypeOf(target);
  },

  // 9. setPrototypeOf trap - intercepts Object.setPrototypeOf()
  setPrototypeOf(target, prototype) {
    console.log('SET_PROTOTYPE: Setting prototype');
    return Reflect.setPrototypeOf(target, prototype);
  },

  // 10. isExtensible trap - intercepts Object.isExtensible()
  isExtensible(target) {
    console.log('IS_EXTENSIBLE: Checking if extensible');
    return Reflect.isExtensible(target);
  },

  // 11. preventExtensions trap - intercepts Object.preventExtensions()
  preventExtensions(target) {
    console.log('PREVENT_EXTENSIONS: Making object non-extensible');
    return Reflect.preventExtensions(target);
  },

  // 12. apply trap - intercepts function calls (only for function targets)
  apply(target, thisArg, argumentsList) {
    console.log('APPLY: Function called with args:', argumentsList);
    return Reflect.apply(target, thisArg, argumentsList);
  },

  // 13. construct trap - intercepts 'new' operator (only for constructor targets)
  construct(target, argumentsList, newTarget) {
    console.log('CONSTRUCT: Constructor called with args:', argumentsList);
    return Reflect.construct(target, argumentsList, newTarget);
  }
};

// Test basic property operations
console.log('1. Property Operations:');
const proxiedObject = new Proxy(target, comprehensiveHandler);

console.log('Reading name:', proxiedObject.name);
console.log('Setting age:', (proxiedObject.age = 31));
console.log('Checking "name" in object:', 'name' in proxiedObject);
console.log('Checking "secret" in object:', 'secret' in proxiedObject);

// Test property definition
console.log('\n2. Property Definition:');
Object.defineProperty(proxiedObject, 'email', {
  value: 'john@example.com',
  writable: true,
  enumerable: true
});

// Test property deletion
console.log('\n3. Property Deletion:');
console.log('Delete age:', delete proxiedObject.age);
console.log('Delete name (protected):', delete proxiedObject.name);

// Test object methods
console.log('\n4. Object Methods:');
console.log('Object keys:', Object.keys(proxiedObject));
console.log('Is extensible:', Object.isExtensible(proxiedObject));

// === Function Proxy Traps ===
console.log('\n=== Function Proxy Traps ===');

function originalFunction(x, y) {
  return x + y;
}

const functionHandler = {
  apply(target, thisArg, argumentsList) {
    console.log(`APPLY: Calling function with ${argumentsList.length} arguments`);
    console.log('Arguments:', argumentsList);
    
    // Add logging and validation
    if (argumentsList.some(arg => typeof arg !== 'number')) {
      throw new TypeError('All arguments must be numbers');
    }
    
    const result = Reflect.apply(target, thisArg, argumentsList);
    console.log('Result:', result);
    return result;
  }
};

const proxiedFunction = new Proxy(originalFunction, functionHandler);
console.log('Calling proxied function:', proxiedFunction(5, 3));

// === Constructor Proxy Traps ===
console.log('\n=== Constructor Proxy Traps ===');

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  introduce() {
    return `Hi, I'm ${this.name}`;
  }
}

const constructorHandler = {
  construct(target, argumentsList, newTarget) {
    console.log('CONSTRUCT: Creating new instance');
    console.log('Arguments:', argumentsList);
    
    // Validate constructor arguments
    if (argumentsList.length < 2) {
      throw new Error('Person requires name and age');
    }
    
    const instance = Reflect.construct(target, argumentsList, newTarget);
    
    // Add additional properties
    instance.id = Math.random().toString(36).substr(2, 9);
    instance.createdAt = new Date();
    
    console.log('Created instance with ID:', instance.id);
    return instance;
  },
  
  apply(target, thisArg, argumentsList) {
    // Prevent calling constructor as function
    throw new TypeError('Class constructor cannot be invoked without new');
  }
};

const ProxiedPerson = new Proxy(Person, constructorHandler);
const person = new ProxiedPerson('Alice', 25);
console.log('Person instance:', person);

// === Trap Combinations ===
console.log('\n=== Trap Combinations ===');

const trackingHandler = {
  operations: [],
  
  get(target, property, receiver) {
    this.operations.push({ type: 'get', property, timestamp: Date.now() });
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    this.operations.push({ 
      type: 'set', 
      property, 
      value, 
      oldValue: target[property],
      timestamp: Date.now() 
    });
    return Reflect.set(target, property, value, receiver);
  },
  
  deleteProperty(target, property) {
    this.operations.push({ 
      type: 'delete', 
      property, 
      deletedValue: target[property],
      timestamp: Date.now() 
    });
    return Reflect.deleteProperty(target, property);
  },
  
  getOperations() {
    return this.operations.slice();
  },
  
  clearOperations() {
    this.operations.length = 0;
  }
};

const tracked = new Proxy({ x: 1, y: 2 }, trackingHandler);
tracked.x = 10;
tracked.z = 30;
delete tracked.y;
console.log('Read x:', tracked.x);

console.log('Operations log:', trackingHandler.getOperations());

// === Trap Invariants ===
console.log('\n=== Trap Invariants ===');

// Demonstrating trap invariants that must be respected
const sealedTarget = {};
Object.seal(sealedTarget);

const invariantHandler = {
  get(target, property) {
    console.log(`Getting ${property}`);
    return Reflect.get(target, property);
  },
  
  set(target, property, value) {
    console.log(`Setting ${property} to ${value}`);
    // This will respect the sealed nature of the target
    return Reflect.set(target, property, value);
  },
  
  defineProperty(target, property, descriptor) {
    console.log(`Defining property ${property}`);
    // This will fail on sealed objects as required by invariants
    return Reflect.defineProperty(target, property, descriptor);
  }
};

const sealedProxy = new Proxy(sealedTarget, invariantHandler);

try {
  sealedProxy.newProp = 'value'; // Will fail due to sealed target
} catch (error) {
  console.log('Expected error:', error.message);
}

// === Performance Monitoring ===
console.log('\n=== Performance Monitoring ===');

const performanceHandler = {
  trapCalls: new Map(),
  
  recordTrap(trapName) {
    const count = this.trapCalls.get(trapName) || 0;
    this.trapCalls.set(trapName, count + 1);
  },
  
  get(target, property, receiver) {
    this.recordTrap('get');
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    this.recordTrap('set');
    return Reflect.set(target, property, value, receiver);
  },
  
  has(target, property) {
    this.recordTrap('has');
    return Reflect.has(target, property);
  },
  
  getStats() {
    return Object.fromEntries(this.trapCalls);
  }
};

const monitored = new Proxy({ a: 1, b: 2 }, performanceHandler);
monitored.a = 10;
monitored.b = 20;
console.log('Property a:', monitored.a);
console.log('Has property c:', 'c' in monitored);

console.log('Trap call statistics:', performanceHandler.getStats());

module.exports = {
  comprehensiveHandler,
  functionHandler,
  constructorHandler,
  trackingHandler,
  invariantHandler,
  performanceHandler
};