/**
 * File: proxy-basics.js
 * Description: Basic Proxy creation and usage patterns
 */

// === Basic Proxy Creation ===
console.log('=== Basic Proxy Creation ===\n');

const target = {
  name: 'John',
  age: 30
};

const handler = {
  get(target, property) {
    console.log(`Getting property: ${property}`);
    return target[property];
  },
  
  set(target, property, value) {
    console.log(`Setting property: ${property} = ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);

// Access through proxy
console.log(proxy.name); // Logs: "Getting property: name", Returns: "John"
proxy.age = 31; // Logs: "Setting property: age = 31"
console.log(proxy.age); // Logs: "Getting property: age", Returns: 31

// === Empty Handler ===
console.log('\n=== Empty Handler (Transparent Proxy) ===\n');

const transparentProxy = new Proxy(target, {});
console.log(transparentProxy.name); // Works normally
transparentProxy.city = 'New York'; // Works normally
console.log(target.city); // "New York" - changes affect original

// === Property Validation ===
console.log('\n=== Property Validation ===\n');

const user = {
  name: 'Alice',
  age: 25
};

const validatedUser = new Proxy(user, {
  set(target, property, value) {
    if (property === 'age') {
      if (typeof value !== 'number') {
        throw new TypeError('Age must be a number');
      }
      if (value < 0 || value > 150) {
        throw new RangeError('Age must be between 0 and 150');
      }
    }
    target[property] = value;
    return true;
  }
});

try {
  validatedUser.age = 30; // OK
  console.log('Age set to:', validatedUser.age);
  
  validatedUser.age = 'thirty'; // Error
} catch (e) {
  console.log('Validation error:', e.message);
}

// === Default Values ===
console.log('\n=== Default Values ===\n');

const defaults = {
  theme: 'dark',
  language: 'en'
};

const settings = new Proxy({}, {
  get(target, property) {
    return property in target ? target[property] : defaults[property];
  }
});

console.log(settings.theme); // "dark" (from defaults)
console.log(settings.language); // "en" (from defaults)
settings.theme = 'light';
console.log(settings.theme); // "light" (from target)

// === Property Case Normalization ===
console.log('\n=== Property Case Normalization ===\n');

const caseInsensitive = new Proxy({}, {
  get(target, property) {
    return target[property.toLowerCase()];
  },
  
  set(target, property, value) {
    target[property.toLowerCase()] = value;
    return true;
  },
  
  has(target, property) {
    return property.toLowerCase() in target;
  }
});

caseInsensitive.Name = 'Bob';
console.log(caseInsensitive.name); // "Bob"
console.log(caseInsensitive.NAME); // "Bob"
console.log(caseInsensitive.NaMe); // "Bob"

// === Array Negative Indexing ===
console.log('\n=== Array Negative Indexing ===\n');

const array = ['a', 'b', 'c', 'd', 'e'];

const smartArray = new Proxy(array, {
  get(target, property) {
    if (!isNaN(property)) {
      const index = Number(property);
      if (index < 0) {
        return target[target.length + index];
      }
    }
    return target[property];
  }
});

console.log(smartArray[0]); // "a"
console.log(smartArray[-1]); // "e"
console.log(smartArray[-2]); // "d"
console.log(smartArray.length); // 5

// === Function Proxy ===
console.log('\n=== Function Proxy ===\n');

function sum(a, b) {
  return a + b;
}

const loggedSum = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.log(`Calling sum with args: ${args}`);
    const result = target.apply(thisArg, args);
    console.log(`Result: ${result}`);
    return result;
  }
});

loggedSum(5, 3); // Logs call and result

// === Constructor Proxy ===
console.log('\n=== Constructor Proxy ===\n');

class User {
  constructor(name) {
    this.name = name;
    this.created = new Date();
  }
}

const TrackedUser = new Proxy(User, {
  construct(target, args) {
    console.log(`Creating new User with args: ${args}`);
    const instance = new target(...args);
    console.log(`User created:`, instance);
    return instance;
  }
});

const user1 = new TrackedUser('Charlie');

// === Revocable Proxy ===
console.log('\n=== Revocable Proxy ===\n');

const revocable = Proxy.revocable(
  { data: 'sensitive' },
  {
    get(target, property) {
      console.log(`Accessing: ${property}`);
      return target[property];
    }
  }
);

console.log(revocable.proxy.data); // "sensitive"

// Revoke access
revocable.revoke();

try {
  console.log(revocable.proxy.data); // Error
} catch (e) {
  console.log('After revoke:', e.message);
}

// === Proxy for Non-Existent Properties ===
console.log('\n=== Virtual Properties ===\n');

const virtualProps = new Proxy({}, {
  get(target, property) {
    if (property === 'timestamp') {
      return Date.now();
    }
    if (property === 'random') {
      return Math.random();
    }
    if (property.startsWith('computed_')) {
      return `Computed value for ${property}`;
    }
    return target[property];
  }
});

console.log(virtualProps.timestamp); // Current timestamp
console.log(virtualProps.random); // Random number
console.log(virtualProps.computed_test); // "Computed value for computed_test"

// === Proxy Chain ===
console.log('\n=== Proxy Chain ===\n');

const original = { value: 1 };

const proxy1 = new Proxy(original, {
  get(target, property) {
    console.log('Proxy 1 get');
    return target[property];
  }
});

const proxy2 = new Proxy(proxy1, {
  get(target, property) {
    console.log('Proxy 2 get');
    return target[property];
  }
});

console.log(proxy2.value); // Logs both proxy gets

module.exports = {
  createBasicProxy: (target, handler) => new Proxy(target, handler),
  validatedUser,
  settings,
  caseInsensitive,
  smartArray,
  virtualProps
};