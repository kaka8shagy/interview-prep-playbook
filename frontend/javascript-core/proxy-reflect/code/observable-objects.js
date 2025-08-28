/**
 * File: observable-objects.js
 * Description: Creating reactive/observable objects with Proxy
 * Demonstrates reactive programming patterns
 */

console.log('=== Observable Objects with Proxy ===\n');

// === Basic Observable ===
function createObservable(target, onChange) {
  const observers = new Set();
  
  if (onChange) {
    observers.add(onChange);
  }
  
  const handler = {
    set(obj, property, value) {
      const oldValue = obj[property];
      const result = Reflect.set(obj, property, value);
      
      if (result && oldValue !== value) {
        // Notify all observers
        observers.forEach(observer => {
          observer({
            type: 'set',
            property,
            value,
            oldValue,
            target: obj
          });
        });
      }
      
      return result;
    },
    
    deleteProperty(obj, property) {
      const oldValue = obj[property];
      const result = Reflect.deleteProperty(obj, property);
      
      if (result && property in obj === false) {
        observers.forEach(observer => {
          observer({
            type: 'delete',
            property,
            oldValue,
            target: obj
          });
        });
      }
      
      return result;
    }
  };
  
  const observable = new Proxy(target, handler);
  
  // Add methods to manage observers
  observable.observe = function(callback) {
    observers.add(callback);
    return () => observers.delete(callback); // Return unsubscribe function
  };
  
  observable.unobserve = function(callback) {
    return observers.delete(callback);
  };
  
  return observable;
}

console.log('1. Basic Observable:');
const user = createObservable({
  name: 'John',
  age: 30
}, (change) => {
  console.log(`Change detected: ${change.property} = ${change.value} (was ${change.oldValue})`);
});

user.name = 'Jane';
user.age = 31;
delete user.age;

// === Advanced Observable with Deep Watching ===
function createDeepObservable(target, onChange) {
  const observers = new Set([onChange].filter(Boolean));
  
  function makeObservable(obj, path = []) {
    return new Proxy(obj, {
      set(target, property, value) {
        const oldValue = target[property];
        const propertyPath = [...path, property];
        
        // Make nested objects observable too
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          value = makeObservable(value, propertyPath);
        }
        
        const result = Reflect.set(target, property, value);
        
        if (result && oldValue !== value) {
          observers.forEach(observer => {
            observer({
              type: 'set',
              path: propertyPath,
              property,
              value,
              oldValue,
              target
            });
          });
        }
        
        return result;
      },
      
      get(target, property) {
        const value = Reflect.get(target, property);
        
        // Make nested objects observable when first accessed
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const propertyPath = [...path, property];
          const observable = makeObservable(value, propertyPath);
          Reflect.set(target, property, observable);
          return observable;
        }
        
        return value;
      },
      
      deleteProperty(target, property) {
        const oldValue = target[property];
        const result = Reflect.deleteProperty(target, property);
        
        if (result) {
          observers.forEach(observer => {
            observer({
              type: 'delete',
              path: [...path, property],
              property,
              oldValue,
              target
            });
          });
        }
        
        return result;
      }
    });
  }
  
  return makeObservable(target);
}

console.log('\n2. Deep Observable:');
const deepUser = createDeepObservable({
  name: 'Alice',
  profile: {
    email: 'alice@example.com',
    settings: {
      theme: 'light',
      notifications: true
    }
  }
}, (change) => {
  console.log(`Deep change: ${change.path.join('.')} = ${change.value}`);
});

deepUser.profile.email = 'alice.new@example.com';
deepUser.profile.settings.theme = 'dark';

// === Event-Based Observable ===
class EventObservable {
  constructor(target = {}) {
    this.listeners = new Map();
    this.target = target;
    
    return new Proxy(target, {
      set: (obj, property, value) => {
        const oldValue = obj[property];
        const result = Reflect.set(obj, property, value);
        
        if (result && oldValue !== value) {
          this.emit('change', { property, value, oldValue });
          this.emit(`change:${property}`, { value, oldValue });
        }
        
        return result;
      },
      
      deleteProperty: (obj, property) => {
        const oldValue = obj[property];
        const result = Reflect.deleteProperty(obj, property);
        
        if (result) {
          this.emit('delete', { property, oldValue });
          this.emit(`delete:${property}`, { oldValue });
        }
        
        return result;
      },
      
      get: (target, property) => {
        // Expose event methods
        if (property === 'on') return this.on.bind(this);
        if (property === 'off') return this.off.bind(this);
        if (property === 'emit') return this.emit.bind(this);
        if (property === 'once') return this.once.bind(this);
        
        return Reflect.get(target, property);
      }
    });
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return this;
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    return this;
  }
  
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    return this.on(event, onceCallback);
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
    return this;
  }
}

console.log('\n3. Event-Based Observable:');
const eventUser = new EventObservable({ name: 'Bob', age: 25 });

eventUser.on('change', (data) => {
  console.log(`Property changed: ${data.property}`);
});

eventUser.on('change:age', (data) => {
  console.log(`Age changed from ${data.oldValue} to ${data.value}`);
});

eventUser.age = 26;
eventUser.name = 'Robert';

// === Computed Properties ===
function createComputed(target, computedProperties = {}) {
  const computedCache = new Map();
  const dependencies = new Map();
  
  // Track property access during computation
  let currentComputation = null;
  
  return new Proxy(target, {
    get(obj, property) {
      // If it's a computed property
      if (computedProperties[property]) {
        // Track dependency if we're inside a computation
        if (currentComputation) {
          if (!dependencies.has(currentComputation)) {
            dependencies.set(currentComputation, new Set());
          }
          dependencies.get(currentComputation).add(property);
        }
        
        // Return cached value if available
        if (computedCache.has(property)) {
          return computedCache.get(property);
        }
        
        // Compute value
        currentComputation = property;
        const value = computedProperties[property].call(obj);
        currentComputation = null;
        
        computedCache.set(property, value);
        return value;
      }
      
      // Track dependency for regular properties
      if (currentComputation) {
        if (!dependencies.has(currentComputation)) {
          dependencies.set(currentComputation, new Set());
        }
        dependencies.get(currentComputation).add(property);
      }
      
      return Reflect.get(obj, property);
    },
    
    set(obj, property, value) {
      const result = Reflect.set(obj, property, value);
      
      // Invalidate computed properties that depend on this property
      dependencies.forEach((deps, computedProp) => {
        if (deps.has(property)) {
          computedCache.delete(computedProp);
        }
      });
      
      return result;
    }
  });
}

console.log('\n4. Computed Properties:');
const student = createComputed({
  firstName: 'John',
  lastName: 'Doe',
  grades: [85, 92, 78, 96]
}, {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  
  averageGrade() {
    const sum = this.grades.reduce((a, b) => a + b, 0);
    return sum / this.grades.length;
  },
  
  status() {
    return this.averageGrade >= 90 ? 'Excellent' : 
           this.averageGrade >= 80 ? 'Good' : 'Needs Improvement';
  }
});

console.log('Full name:', student.fullName);
console.log('Average grade:', student.averageGrade);
console.log('Status:', student.status);

student.firstName = 'Jane';
console.log('Updated full name:', student.fullName);

// === Observable Array ===
function createObservableArray(arr = [], onChange) {
  const observers = new Set([onChange].filter(Boolean));
  
  return new Proxy(arr, {
    set(target, property, value) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value);
      
      if (result && oldValue !== value) {
        observers.forEach(observer => {
          observer({
            type: 'set',
            index: property,
            value,
            oldValue,
            array: target
          });
        });
      }
      
      return result;
    },
    
    get(target, property) {
      // Add observer management methods
      if (property === 'observe') {
        return function(callback) {
          observers.add(callback);
          return () => observers.delete(callback);
        };
      }
      
      const value = Reflect.get(target, property);
      
      // Wrap array methods to trigger observers
      if (typeof value === 'function') {
        const mutatingMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
        
        if (mutatingMethods.includes(property)) {
          return function(...args) {
            const oldArray = [...target];
            const result = value.apply(this, args);
            
            observers.forEach(observer => {
              observer({
                type: property,
                args,
                result,
                oldArray: oldArray,
                array: target
              });
            });
            
            return result;
          };
        }
      }
      
      return value;
    }
  });
}

console.log('\n5. Observable Array:');
const items = createObservableArray(['apple', 'banana'], (change) => {
  console.log(`Array change: ${change.type}`, change);
});

items.push('orange');
items[1] = 'grape';
items.splice(0, 1);

// === React-like State Management ===
function createState(initialState) {
  let state = { ...initialState };
  const subscribers = new Set();
  
  function notify() {
    subscribers.forEach(callback => callback(state));
  }
  
  const stateProxy = new Proxy(state, {
    set(target, property, value) {
      if (target[property] !== value) {
        target[property] = value;
        notify();
      }
      return true;
    },
    
    get(target, property) {
      if (property === 'subscribe') {
        return function(callback) {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        };
      }
      
      if (property === 'setState') {
        return function(updates) {
          Object.assign(state, updates);
          notify();
        };
      }
      
      return target[property];
    }
  });
  
  return stateProxy;
}

console.log('\n6. React-like State:');
const appState = createState({
  count: 0,
  user: null,
  loading: false
});

const unsubscribe = appState.subscribe((newState) => {
  console.log('State updated:', newState);
});

appState.count = 1;
appState.setState({ user: { name: 'Alice' }, loading: true });

unsubscribe();

module.exports = {
  createObservable,
  createDeepObservable,
  EventObservable,
  createComputed,
  createObservableArray,
  createState
};