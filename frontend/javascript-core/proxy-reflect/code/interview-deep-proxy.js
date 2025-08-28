/**
 * File: interview-deep-proxy.js
 * Description: Implement deep proxy for nested objects - common interview question
 * Tests recursive proxying and complex object handling
 */

console.log('=== Deep Proxy Implementation ===\n');

// === Basic Deep Proxy ===
function createDeepProxy(target, handler, visited = new WeakSet()) {
  // Prevent infinite recursion for circular references
  if (visited.has(target)) {
    return target;
  }
  
  // Only proxy objects (not primitives, functions, dates, etc.)
  if (!target || typeof target !== 'object') {
    return target;
  }
  
  // Don't proxy built-in objects
  if (target instanceof Date || target instanceof RegExp || target instanceof Error) {
    return target;
  }
  
  visited.add(target);
  
  const deepHandler = {
    get(obj, property, receiver) {
      const value = Reflect.get(obj, property, receiver);
      
      // Call original handler's get if it exists
      if (handler.get) {
        const handlerResult = handler.get(obj, property, receiver);
        if (handlerResult !== undefined) {
          return handlerResult;
        }
      }
      
      // Recursively proxy nested objects
      return createDeepProxy(value, handler, visited);
    },
    
    set(obj, property, value, receiver) {
      // Call original handler's set if it exists
      if (handler.set) {
        const handlerResult = handler.set(obj, property, value, receiver);
        if (handlerResult !== undefined) {
          return handlerResult;
        }
      }
      
      // Proxy the value being set if it's an object
      const proxiedValue = createDeepProxy(value, handler, visited);
      return Reflect.set(obj, property, proxiedValue, receiver);
    },
    
    // Forward other traps to original handler
    has: handler.has,
    deleteProperty: handler.deleteProperty,
    defineProperty: handler.defineProperty,
    getOwnPropertyDescriptor: handler.getOwnPropertyDescriptor,
    ownKeys: handler.ownKeys
  };
  
  return new Proxy(target, deepHandler);
}

// === Test Deep Proxy ===
console.log('1. Basic Deep Proxy Test:');

const data = {
  user: {
    name: 'John',
    profile: {
      email: 'john@example.com',
      settings: {
        theme: 'light',
        notifications: {
          email: true,
          push: false
        }
      }
    }
  },
  posts: [
    { id: 1, title: 'First Post', metadata: { views: 100 } },
    { id: 2, title: 'Second Post', metadata: { views: 200 } }
  ]
};

const accessLog = [];

const deepProxy = createDeepProxy(data, {
  get(target, property, receiver) {
    accessLog.push({ type: 'get', property, target: target.constructor.name });
    console.log(`Access: ${property}`);
  },
  
  set(target, property, value, receiver) {
    accessLog.push({ type: 'set', property, value, target: target.constructor.name });
    console.log(`Set: ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
});

// Test deep access
console.log('Name:', deepProxy.user.name);
console.log('Theme:', deepProxy.user.profile.settings.theme);
console.log('Email notifications:', deepProxy.user.profile.settings.notifications.email);

// Test deep setting
deepProxy.user.profile.settings.theme = 'dark';
deepProxy.user.profile.settings.notifications.push = true;

console.log('Access log:', accessLog);

// === Advanced Deep Proxy with Path Tracking ===
console.log('\n2. Deep Proxy with Path Tracking:');

function createPathTrackingProxy(target, onAccess, path = []) {
  if (!target || typeof target !== 'object') {
    return target;
  }
  
  return new Proxy(target, {
    get(obj, property, receiver) {
      const currentPath = [...path, property];
      const value = Reflect.get(obj, property, receiver);
      
      // Notify about access
      if (onAccess) {
        onAccess({
          type: 'get',
          path: currentPath,
          value,
          target: obj
        });
      }
      
      // Recursively proxy nested objects with extended path
      if (value && typeof value === 'object') {
        return createPathTrackingProxy(value, onAccess, currentPath);
      }
      
      return value;
    },
    
    set(obj, property, value, receiver) {
      const currentPath = [...path, property];
      
      if (onAccess) {
        onAccess({
          type: 'set',
          path: currentPath,
          value,
          oldValue: obj[property],
          target: obj
        });
      }
      
      return Reflect.set(obj, property, value, receiver);
    }
  });
}

const nestedData = {
  level1: {
    level2: {
      level3: {
        deepValue: 'original'
      }
    }
  }
};

const pathProxy = createPathTrackingProxy(nestedData, (info) => {
  console.log(`${info.type.toUpperCase()}: ${info.path.join('.')} = ${info.value}`);
});

pathProxy.level1.level2.level3.deepValue = 'modified';
console.log('Deep value:', pathProxy.level1.level2.level3.deepValue);

// === Deep Proxy with Validation ===
console.log('\n3. Deep Proxy with Validation:');

function createValidatedDeepProxy(target, validators = {}) {
  function validatePath(path, value) {
    const pathStr = path.join('.');
    
    // Check for exact path match
    if (validators[pathStr]) {
      return validators[pathStr](value);
    }
    
    // Check for pattern matches
    for (const [pattern, validator] of Object.entries(validators)) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '[^.]*') + '$');
        if (regex.test(pathStr)) {
          return validator(value);
        }
      }
    }
    
    return true; // No validation needed
  }
  
  function createProxy(obj, currentPath = []) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    return new Proxy(obj, {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);
        const newPath = [...currentPath, property];
        
        if (value && typeof value === 'object') {
          return createProxy(value, newPath);
        }
        
        return value;
      },
      
      set(target, property, value, receiver) {
        const newPath = [...currentPath, property];
        
        if (!validatePath(newPath, value)) {
          throw new Error(`Validation failed for ${newPath.join('.')}: ${value}`);
        }
        
        return Reflect.set(target, property, value, receiver);
      }
    });
  }
  
  return createProxy(target);
}

const userConfig = {
  user: {
    name: 'Alice',
    age: 25,
    preferences: {
      theme: 'light',
      fontSize: 14
    }
  }
};

const validatedProxy = createValidatedDeepProxy(userConfig, {
  'user.age': (value) => typeof value === 'number' && value > 0 && value < 150,
  'user.name': (value) => typeof value === 'string' && value.length > 0,
  'user.preferences.theme': (value) => ['light', 'dark'].includes(value),
  'user.preferences.*': (value) => typeof value === 'number' && value > 0
});

try {
  validatedProxy.user.age = 30; // Valid
  validatedProxy.user.preferences.theme = 'dark'; // Valid
  console.log('Valid updates completed');
  
  validatedProxy.user.age = -5; // Invalid
} catch (error) {
  console.log('Validation error:', error.message);
}

// === Deep Proxy for Observable Pattern ===
console.log('\n4. Deep Observable with Proxy:');

function createDeepObservable(target, callback) {
  const observers = new Set([callback].filter(Boolean));
  
  function createObservableProxy(obj, path = []) {
    return new Proxy(obj, {
      get(target, property, receiver) {
        if (property === 'observe') {
          return (cb) => {
            observers.add(cb);
            return () => observers.delete(cb);
          };
        }
        
        const value = Reflect.get(target, property, receiver);
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return createObservableProxy(value, [...path, property]);
        }
        
        return value;
      },
      
      set(target, property, value, receiver) {
        const oldValue = target[property];
        const currentPath = [...path, property];
        const result = Reflect.set(target, property, value, receiver);
        
        if (result && oldValue !== value) {
          observers.forEach(observer => {
            observer({
              type: 'change',
              path: currentPath,
              value,
              oldValue,
              target
            });
          });
        }
        
        return result;
      },
      
      deleteProperty(target, property) {
        const oldValue = target[property];
        const currentPath = [...path, property];
        const result = Reflect.deleteProperty(target, property);
        
        if (result && oldValue !== undefined) {
          observers.forEach(observer => {
            observer({
              type: 'delete',
              path: currentPath,
              oldValue,
              target
            });
          });
        }
        
        return result;
      }
    });
  }
  
  return createObservableProxy(target);
}

const observableData = createDeepObservable({
  app: {
    state: {
      counter: 0,
      user: {
        name: 'John'
      }
    }
  }
}, (change) => {
  console.log(`Observable change at ${change.path.join('.')}: ${change.oldValue} → ${change.value}`);
});

observableData.app.state.counter = 1;
observableData.app.state.user.name = 'Jane';
delete observableData.app.state.counter;

// === Interview Questions ===
console.log('\n=== Interview Questions ===');

// Q1: Handle circular references in deep proxy
function createSafeDeepProxy(target) {
  const proxyMap = new WeakMap();
  
  function createProxy(obj, visited = new WeakSet()) {
    if (!obj || typeof obj !== 'object') return obj;
    if (visited.has(obj)) return obj; // Circular reference
    if (proxyMap.has(obj)) return proxyMap.get(obj);
    
    visited.add(obj);
    
    const proxy = new Proxy(obj, {
      get(target, property) {
        const value = Reflect.get(target, property);
        return createProxy(value, visited);
      }
    });
    
    proxyMap.set(obj, proxy);
    return proxy;
  }
  
  return createProxy(target);
}

// Test circular reference
const circular = { name: 'circular' };
circular.self = circular;

const safeProxy = createSafeDeepProxy(circular);
console.log('Circular reference handled:', safeProxy.self.name);

// Q2: Deep freeze with proxy
function createDeepFreeze(obj) {
  function freezeProxy(target) {
    return new Proxy(target, {
      set() {
        throw new Error('Object is frozen');
      },
      
      deleteProperty() {
        throw new Error('Object is frozen');
      },
      
      get(target, property) {
        const value = Reflect.get(target, property);
        if (value && typeof value === 'object') {
          return freezeProxy(value);
        }
        return value;
      }
    });
  }
  
  return freezeProxy(obj);
}

const frozenData = createDeepFreeze({ nested: { value: 1 } });

try {
  frozenData.nested.value = 2; // Should throw
} catch (error) {
  console.log('Deep freeze works:', error.message);
}

module.exports = {
  createDeepProxy,
  createPathTrackingProxy,
  createValidatedDeepProxy,
  createDeepObservable,
  createSafeDeepProxy,
  createDeepFreeze
};