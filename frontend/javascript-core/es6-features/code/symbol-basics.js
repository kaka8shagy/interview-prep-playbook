/**
 * File: symbol-basics.js
 * Description: Symbol primitive type usage and patterns
 * Demonstrates Symbol creation, properties, and use cases
 */

console.log('=== Basic Symbol Creation ===');

// Creating symbols
const symbol1 = Symbol();
const symbol2 = Symbol('description');
const symbol3 = Symbol('description');

console.log('Symbol 1:', symbol1);
console.log('Symbol 2:', symbol2);
console.log('Symbol 3:', symbol3);

// Symbols are always unique
console.log('symbol2 === symbol3:', symbol2 === symbol3); // false
console.log('typeof symbol1:', typeof symbol1); // 'symbol'

// Description property
console.log('Symbol description:', symbol2.description); // 'description'

console.log('\n=== Symbol as Object Keys ===');

// Symbols as property keys
const nameSymbol = Symbol('name');
const ageSymbol = Symbol('age');
const hiddenSymbol = Symbol('hidden');

const person = {
  // Regular properties
  id: 1,
  email: 'john@example.com',
  
  // Symbol properties
  [nameSymbol]: 'John Doe',
  [ageSymbol]: 30,
  [hiddenSymbol]: 'secret data'
};

console.log('Person object:', person);
console.log('Name via symbol:', person[nameSymbol]);
console.log('Age via symbol:', person[ageSymbol]);

// Symbol properties are not enumerable in normal iteration
console.log('Object.keys():', Object.keys(person)); // Only regular keys
console.log('Object.getOwnPropertyNames():', Object.getOwnPropertyNames(person));
console.log('Object.getOwnPropertySymbols():', Object.getOwnPropertySymbols(person));

// But they are included in Reflect.ownKeys()
console.log('Reflect.ownKeys():', Reflect.ownKeys(person));

console.log('\n=== Private-like Properties ===');

// Using symbols for "private" properties
const _private = Symbol('private');
const _internal = Symbol('internal');

class SecureCounter {
  constructor(initialValue = 0) {
    this[_private] = initialValue;
    this[_internal] = {
      created: new Date(),
      accessCount: 0
    };
  }
  
  increment() {
    this[_private]++;
    this[_internal].accessCount++;
    return this[_private];
  }
  
  decrement() {
    this[_private]--;
    this[_internal].accessCount++;
    return this[_private];
  }
  
  getValue() {
    this[_internal].accessCount++;
    return this[_private];
  }
  
  getInternalState() {
    return { ...this[_internal] };
  }
  
  // Regular method
  reset() {
    this[_private] = 0;
    this[_internal].accessCount = 0;
  }
}

const counter = new SecureCounter(10);
console.log('Initial value:', counter.getValue());
console.log('After increment:', counter.increment());

// Symbol properties are not easily accessible
console.log('Counter object keys:', Object.keys(counter));
console.log('Direct access to private fails:', counter[_private]); // undefined - different symbol

// But can be accessed if symbol is exposed
const symbols = Object.getOwnPropertySymbols(counter);
console.log('Internal state via symbol:', counter[symbols[1]]);

console.log('\n=== Symbol Registry ===');

// Global symbol registry
const globalSymbol1 = Symbol.for('app.user.id');
const globalSymbol2 = Symbol.for('app.user.id');

console.log('Global symbols are same:', globalSymbol1 === globalSymbol2); // true

// Key for a global symbol
console.log('Key for global symbol:', Symbol.keyFor(globalSymbol1)); // 'app.user.id'
console.log('Key for local symbol:', Symbol.keyFor(symbol1)); // undefined

// Using global symbols across modules (simulation)
const MODULE_A = {
  CONSTANTS: {
    USER_ID: Symbol.for('user.id'),
    SESSION_ID: Symbol.for('session.id')
  }
};

const MODULE_B = {
  getUserId(obj) {
    return obj[Symbol.for('user.id')];
  },
  
  setUserId(obj, id) {
    obj[Symbol.for('user.id')] = id;
  }
};

const userObj = {};
MODULE_B.setUserId(userObj, 'user123');
console.log('Cross-module access:', MODULE_B.getUserId(userObj));

console.log('\n=== Symbol Use Cases ===');

// 1. Unique constants
const STATUS = {
  PENDING: Symbol('pending'),
  APPROVED: Symbol('approved'),
  REJECTED: Symbol('rejected')
};

function processRequest(status) {
  switch (status) {
    case STATUS.PENDING:
      return 'Request is pending review';
    case STATUS.APPROVED:
      return 'Request has been approved';
    case STATUS.REJECTED:
      return 'Request has been rejected';
    default:
      return 'Unknown status';
  }
}

console.log('Process pending:', processRequest(STATUS.PENDING));

// 2. Object metadata
const METADATA = Symbol('metadata');

function createTrackedObject(data) {
  const obj = { ...data };
  obj[METADATA] = {
    created: new Date(),
    modified: new Date(),
    version: 1
  };
  
  return new Proxy(obj, {
    set(target, property, value) {
      const result = Reflect.set(target, property, value);
      
      // Update metadata on changes (except metadata itself)
      if (property !== METADATA) {
        target[METADATA].modified = new Date();
        target[METADATA].version++;
      }
      
      return result;
    }
  });
}

const tracked = createTrackedObject({ name: 'John', age: 30 });
console.log('Initial metadata:', tracked[METADATA]);

tracked.name = 'Jane';
tracked.age = 31;
console.log('Updated metadata:', tracked[METADATA]);

// 3. Plugin system with symbols
const PLUGIN_INTERFACE = {
  INITIALIZE: Symbol('initialize'),
  CLEANUP: Symbol('cleanup'),
  HANDLE: Symbol('handle')
};

class PluginManager {
  constructor() {
    this.plugins = [];
  }
  
  register(plugin) {
    if (typeof plugin[PLUGIN_INTERFACE.INITIALIZE] === 'function') {
      this.plugins.push(plugin);
      plugin[PLUGIN_INTERFACE.INITIALIZE]();
    }
  }
  
  handleRequest(data) {
    return this.plugins.map(plugin => {
      if (typeof plugin[PLUGIN_INTERFACE.HANDLE] === 'function') {
        return plugin[PLUGIN_INTERFACE.HANDLE](data);
      }
      return null;
    }).filter(result => result !== null);
  }
  
  cleanup() {
    this.plugins.forEach(plugin => {
      if (typeof plugin[PLUGIN_INTERFACE.CLEANUP] === 'function') {
        plugin[PLUGIN_INTERFACE.CLEANUP]();
      }
    });
    this.plugins = [];
  }
}

// Example plugins
const loggerPlugin = {
  [PLUGIN_INTERFACE.INITIALIZE]() {
    console.log('Logger plugin initialized');
  },
  
  [PLUGIN_INTERFACE.HANDLE](data) {
    console.log('Logging request:', data);
    return { plugin: 'logger', data };
  },
  
  [PLUGIN_INTERFACE.CLEANUP]() {
    console.log('Logger plugin cleaned up');
  }
};

const validatorPlugin = {
  [PLUGIN_INTERFACE.INITIALIZE]() {
    console.log('Validator plugin initialized');
  },
  
  [PLUGIN_INTERFACE.HANDLE](data) {
    const isValid = data && typeof data === 'object';
    return { plugin: 'validator', valid: isValid };
  }
};

const pluginManager = new PluginManager();
pluginManager.register(loggerPlugin);
pluginManager.register(validatorPlugin);

const results = pluginManager.handleRequest({ test: 'data' });
console.log('Plugin results:', results);

console.log('\n=== Symbol Iteration ===');

// Custom iterator using symbols
const ITERATOR_SYMBOL = Symbol.iterator;

class NumberRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  [ITERATOR_SYMBOL]() {
    let current = this.start;
    const end = this.end;
    
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const range = new NumberRange(1, 5);
console.log('Custom iterator:');
for (const num of range) {
  console.log('  ', num);
}

// Convert to array using spread
console.log('Range as array:', [...range]);

console.log('\n=== Symbol Coercion Behavior ===');

// Symbols cannot be coerced to strings or numbers
const testSymbol = Symbol('test');

try {
  const str = testSymbol + ''; // TypeError
} catch (error) {
  console.log('String coercion error:', error.message);
}

try {
  const num = +testSymbol; // TypeError
} catch (error) {
  console.log('Number coercion error:', error.message);
}

// Explicit conversion works
console.log('Explicit string conversion:', String(testSymbol));
console.log('Symbol toString:', testSymbol.toString());

// Boolean coercion works
console.log('Boolean coercion:', Boolean(testSymbol)); // true
console.log('Logical operations:', !!testSymbol); // true

console.log('\n=== Interview Questions ===');

// Q1: Implement a registry using symbols
class SymbolRegistry {
  constructor() {
    this.registry = new Map();
  }
  
  create(description) {
    const symbol = Symbol(description);
    this.registry.set(description, symbol);
    return symbol;
  }
  
  get(description) {
    return this.registry.get(description);
  }
  
  has(description) {
    return this.registry.has(description);
  }
  
  getAll() {
    return Array.from(this.registry.entries());
  }
  
  clear() {
    this.registry.clear();
  }
}

const registry = new SymbolRegistry();
const sym1 = registry.create('config');
const sym2 = registry.get('config');

console.log('Registry symbols equal:', sym1 === sym2);

// Q2: Create a mixin system using symbols
const MIXINS = {
  EVENTABLE: Symbol('eventable'),
  SERIALIZABLE: Symbol('serializable')
};

const EventableMixin = {
  [MIXINS.EVENTABLE]: true,
  
  on(event, callback) {
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(callback);
  },
  
  emit(event, data) {
    if (this._events && this._events[event]) {
      this._events[event].forEach(callback => callback(data));
    }
  }
};

const SerializableMixin = {
  [MIXINS.SERIALIZABLE]: true,
  
  serialize() {
    const result = {};
    for (const key of Object.keys(this)) {
      if (typeof this[key] !== 'function') {
        result[key] = this[key];
      }
    }
    return JSON.stringify(result);
  },
  
  deserialize(json) {
    const data = JSON.parse(json);
    Object.assign(this, data);
  }
};

function applyMixins(target, ...mixins) {
  mixins.forEach(mixin => {
    Object.assign(target.prototype, mixin);
  });
}

class User {
  constructor(name) {
    this.name = name;
  }
}

applyMixins(User, EventableMixin, SerializableMixin);

const user = new User('John');

// Test eventable
user.on('change', data => console.log('User changed:', data));
user.emit('change', { name: 'Jane' });

// Test serializable
console.log('Serialized user:', user.serialize());

// Check mixin presence
console.log('Has eventable mixin:', MIXINS.EVENTABLE in User.prototype);
console.log('Has serializable mixin:', MIXINS.SERIALIZABLE in User.prototype);

// Q3: Create a feature flag system
const FEATURES = {
  BETA: Symbol.for('feature.beta'),
  EXPERIMENTAL: Symbol.for('feature.experimental'),
  PREMIUM: Symbol.for('feature.premium')
};

class FeatureManager {
  constructor() {
    this.flags = new Set();
  }
  
  enable(feature) {
    this.flags.add(feature);
  }
  
  disable(feature) {
    this.flags.delete(feature);
  }
  
  isEnabled(feature) {
    return this.flags.has(feature);
  }
  
  getEnabledFeatures() {
    return Array.from(this.flags).map(symbol => Symbol.keyFor(symbol));
  }
}

const featureManager = new FeatureManager();
featureManager.enable(FEATURES.BETA);
featureManager.enable(FEATURES.PREMIUM);

console.log('Beta enabled:', featureManager.isEnabled(FEATURES.BETA));
console.log('Experimental enabled:', featureManager.isEnabled(FEATURES.EXPERIMENTAL));
console.log('Enabled features:', featureManager.getEnabledFeatures());

module.exports = {
  SecureCounter,
  STATUS,
  createTrackedObject,
  PLUGIN_INTERFACE,
  PluginManager,
  NumberRange,
  SymbolRegistry,
  MIXINS,
  EventableMixin,
  SerializableMixin,
  applyMixins,
  FEATURES,
  FeatureManager
};