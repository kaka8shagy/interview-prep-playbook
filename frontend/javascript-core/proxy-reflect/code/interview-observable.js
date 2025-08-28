/**
 * File: interview-observable.js
 * Description: Build observable pattern with Proxy - common interview question
 * Tests understanding of reactive programming and proxy traps
 */

// === Basic Observable ===
function createObservable(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      onChange(prop, value, oldValue);
      return true;
    }
  });
}

// === Advanced Observable with Multiple Listeners ===
function createAdvancedObservable(target) {
  const listeners = [];
  
  const observable = new Proxy(target, {
    get(obj, prop) {
      if (prop === 'on') {
        return function(callback) {
          listeners.push(callback);
          return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
          };
        };
      }
      if (prop === 'off') {
        return function(callback) {
          const index = listeners.indexOf(callback);
          if (index > -1) listeners.splice(index, 1);
        };
      }
      return obj[prop];
    },
    
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      
      // Notify all listeners
      listeners.forEach(callback => {
        callback({
          property: prop,
          newValue: value,
          oldValue: oldValue,
          target: obj
        });
      });
      
      return true;
    }
  });
  
  return observable;
}

// === Deep Observable (Nested Objects) ===
function createDeepObservable(target, onChange) {
  function makeObservable(obj, path = []) {
    return new Proxy(obj, {
      get(target, property) {
        const value = target[property];
        
        // If value is an object, make it observable too
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return makeObservable(value, [...path, property]);
        }
        
        return value;
      },
      
      set(target, property, value) {
        const oldValue = target[property];
        target[property] = value;
        
        const fullPath = [...path, property].join('.');
        onChange(fullPath, value, oldValue);
        
        return true;
      }
    });
  }
  
  return makeObservable(target);
}

// === Observable Array ===
function createObservableArray(target, onChange) {
  return new Proxy(target, {
    set(target, property, value) {
      if (property === 'length') {
        const oldLength = target.length;
        target.length = value;
        if (value !== oldLength) {
          onChange('length', value, oldLength);
        }
        return true;
      }
      
      const oldValue = target[property];
      target[property] = value;
      
      if (!isNaN(property)) {
        onChange(`[${property}]`, value, oldValue);
      }
      
      return true;
    },
    
    get(target, property) {
      // Intercept array methods
      if (property === 'push') {
        return function(...items) {
          const result = Array.prototype.push.apply(target, items);
          onChange('push', items, undefined);
          return result;
        };
      }
      
      if (property === 'pop') {
        return function() {
          const result = Array.prototype.pop.call(target);
          onChange('pop', undefined, result);
          return result;
        };
      }
      
      if (property === 'splice') {
        return function(start, deleteCount, ...items) {
          const deleted = Array.prototype.splice.apply(target, arguments);
          onChange('splice', { start, deleteCount, items }, deleted);
          return deleted;
        };
      }
      
      return target[property];
    }
  });
}

// === Observable with Validation ===
function createValidatedObservable(target, validators = {}) {
  const listeners = [];
  
  return new Proxy(target, {
    get(target, prop) {
      if (prop === 'on') {
        return function(callback) {
          listeners.push(callback);
        };
      }
      return target[prop];
    },
    
    set(target, prop, value) {
      // Validate if validator exists
      if (validators[prop]) {
        const isValid = validators[prop](value);
        if (!isValid) {
          throw new Error(`Invalid value for property ${prop}: ${value}`);
        }
      }
      
      const oldValue = target[prop];
      target[prop] = value;
      
      // Notify listeners
      listeners.forEach(callback => {
        callback(prop, value, oldValue);
      });
      
      return true;
    }
  });
}

// === Computed Properties Observable ===
function createComputedObservable(target, computedProps = {}) {
  const cache = new Map();
  
  return new Proxy(target, {
    get(target, prop) {
      if (computedProps[prop]) {
        if (!cache.has(prop)) {
          cache.set(prop, computedProps[prop].call(this));
        }
        return cache.get(prop);
      }
      return target[prop];
    },
    
    set(target, prop, value) {
      target[prop] = value;
      // Clear computed cache when dependency might change
      cache.clear();
      return true;
    }
  });
}

// === Batched Observable ===
function createBatchedObservable(target) {
  let batchedChanges = [];
  let isBatching = false;
  const listeners = [];
  
  const observable = new Proxy(target, {
    get(target, prop) {
      if (prop === 'batch') {
        return function(fn) {
          isBatching = true;
          batchedChanges = [];
          
          fn(observable);
          
          // Notify with all batched changes
          if (batchedChanges.length > 0) {
            listeners.forEach(callback => {
              callback(batchedChanges);
            });
          }
          
          isBatching = false;
          batchedChanges = [];
        };
      }
      
      if (prop === 'on') {
        return function(callback) {
          listeners.push(callback);
        };
      }
      
      return target[prop];
    },
    
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;
      
      const change = { property: prop, newValue: value, oldValue };
      
      if (isBatching) {
        batchedChanges.push(change);
      } else {
        listeners.forEach(callback => {
          callback([change]);
        });
      }
      
      return true;
    }
  });
  
  return observable;
}

// === Test Examples ===
console.log('=== Basic Observable Test ===');
const person = createObservable(
  { name: 'John', age: 30 },
  (prop, newVal, oldVal) => {
    console.log(`Property ${prop} changed from ${oldVal} to ${newVal}`);
  }
);

person.name = 'Jane'; // Logs: Property name changed from John to Jane
person.age = 31; // Logs: Property age changed from 30 to 31

console.log('\n=== Advanced Observable Test ===');
const user = createAdvancedObservable({ username: 'user1', email: 'user@example.com' });

const unsubscribe = user.on((change) => {
  console.log(`Change detected:`, change);
});

user.username = 'newuser'; // Triggers listener
user.email = 'new@example.com'; // Triggers listener

unsubscribe(); // Remove listener
user.username = 'finaluser'; // No listener triggered

console.log('\n=== Deep Observable Test ===');
const config = createDeepObservable(
  {
    theme: {
      colors: {
        primary: '#blue',
        secondary: '#green'
      }
    }
  },
  (path, newVal, oldVal) => {
    console.log(`Deep change at ${path}: ${oldVal} -> ${newVal}`);
  }
);

config.theme.colors.primary = '#red'; // Logs: Deep change at theme.colors.primary

console.log('\n=== Observable Array Test ===');
const todos = createObservableArray(
  ['Task 1', 'Task 2'],
  (operation, newVal, oldVal) => {
    console.log(`Array operation ${operation}:`, newVal, oldVal);
  }
);

todos.push('Task 3'); // Logs array operation
todos.pop(); // Logs array operation
todos[0] = 'Updated Task 1'; // Logs array operation

console.log('\n=== Validated Observable Test ===');
const product = createValidatedObservable(
  { name: 'Product', price: 100 },
  {
    price: (value) => value > 0,
    name: (value) => typeof value === 'string' && value.length > 0
  }
);

product.on((prop, newVal, oldVal) => {
  console.log(`Validated change: ${prop} = ${newVal}`);
});

try {
  product.price = 150; // OK
  product.name = 'New Product'; // OK
  product.price = -10; // Error
} catch (e) {
  console.log('Validation error:', e.message);
}

console.log('\n=== Computed Observable Test ===');
const rectangle = createComputedObservable(
  { width: 10, height: 5 },
  {
    area() {
      console.log('Computing area...');
      return this.width * this.height;
    },
    perimeter() {
      console.log('Computing perimeter...');
      return 2 * (this.width + this.height);
    }
  }
);

console.log('Area:', rectangle.area); // Computes and caches
console.log('Area again:', rectangle.area); // Uses cache
rectangle.width = 20; // Clears cache
console.log('New area:', rectangle.area); // Recomputes

console.log('\n=== Batched Observable Test ===');
const model = createBatchedObservable({ x: 0, y: 0, z: 0 });

model.on((changes) => {
  console.log(`Batch update with ${changes.length} changes:`, changes);
});

model.batch((m) => {
  m.x = 10;
  m.y = 20;
  m.z = 30;
}); // Single batch notification

module.exports = {
  createObservable,
  createAdvancedObservable,
  createDeepObservable,
  createObservableArray,
  createValidatedObservable,
  createComputedObservable,
  createBatchedObservable
};