/**
 * File: object-destructuring.js
 * Description: Object destructuring patterns and techniques
 * Demonstrates various object destructuring use cases
 */

console.log('=== Basic Object Destructuring ===');

// Basic object destructuring
const person = {
  name: 'John',
  age: 30,
  city: 'New York',
  country: 'USA'
};

const { name, age } = person;
console.log('Basic destructuring:', { name, age });

// Destructuring with different variable names
const { name: fullName, age: years } = person;
console.log('Renamed variables:', { fullName, years });

// Default values
const { name: userName, occupation = 'Unknown' } = person;
console.log('With defaults:', { userName, occupation });

// Rest operator with objects
const { name: personName, ...otherInfo } = person;
console.log('Name:', personName);
console.log('Other info:', otherInfo);

console.log('\n=== Advanced Object Destructuring ===');

// Nested object destructuring
const user = {
  id: 1,
  profile: {
    personal: {
      firstName: 'Alice',
      lastName: 'Smith'
    },
    contact: {
      email: 'alice@example.com',
      phone: '123-456-7890'
    }
  },
  preferences: {
    theme: 'dark',
    language: 'en'
  }
};

// Deep destructuring
const {
  profile: {
    personal: { firstName, lastName },
    contact: { email }
  }
} = user;

console.log('Nested destructuring:', { firstName, lastName, email });

// Mixed with defaults and renaming
const {
  profile: {
    contact: { 
      email: userEmail,
      phone: userPhone = 'Not provided'
    }
  },
  preferences: { theme = 'light', notifications = false }
} = user;

console.log('Advanced nested:', { userEmail, userPhone, theme, notifications });

console.log('\n=== Function Parameter Destructuring ===');

// Function with destructured parameters
function createUser({ name, email, age = 18, isActive = true }) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    age,
    isActive,
    createdAt: new Date()
  };
}

const newUser = createUser({
  name: 'Bob',
  email: 'bob@example.com',
  age: 25
});

console.log('Created user:', newUser);

// Nested parameter destructuring
function updateUserProfile(userId, { 
  profile: { 
    personal: { firstName, lastName }, 
    contact: { email, phone = null } 
  },
  preferences = {}
}) {
  return {
    userId,
    updates: { firstName, lastName, email, phone },
    preferences
  };
}

const updates = updateUserProfile('user123', {
  profile: {
    personal: { firstName: 'Jane', lastName: 'Doe' },
    contact: { email: 'jane@example.com' }
  }
});

console.log('Profile updates:', updates);

console.log('\n=== Dynamic Property Destructuring ===');

// Computed property names
const propName = 'dynamicProp';
const data = {
  [propName]: 'dynamic value',
  staticProp: 'static value'
};

const { [propName]: dynamicValue, staticProp } = data;
console.log('Dynamic destructuring:', { dynamicValue, staticProp });

// Array of property names
function extractProperties(obj, props) {
  const result = {};
  props.forEach(prop => {
    if (obj[prop] !== undefined) {
      result[prop] = obj[prop];
    }
  });
  return result;
}

// Using destructuring assignment
function extractPropsDestructured(obj, props) {
  return props.reduce((acc, prop) => {
    const { [prop]: value } = obj;
    if (value !== undefined) {
      acc[prop] = value;
    }
    return acc;
  }, {});
}

const sourceObj = { a: 1, b: 2, c: 3, d: 4 };
console.log('Extract a,c:', extractPropsDestructured(sourceObj, ['a', 'c']));

console.log('\n=== Practical Use Cases ===');

// API response handling
function handleApiResponse(response) {
  const {
    data: {
      user: { id, username },
      posts = [],
      meta: { total, page = 1 } = {}
    } = {},
    status = 'unknown',
    message = 'No message'
  } = response;

  return { id, username, posts, total, page, status, message };
}

const apiResponse = {
  status: 'success',
  data: {
    user: { id: 123, username: 'alice' },
    posts: [{ id: 1, title: 'Post 1' }],
    meta: { total: 10, page: 2 }
  }
};

console.log('API response:', handleApiResponse(apiResponse));

// Configuration merging
function createConfig(userConfig = {}) {
  const defaultConfig = {
    server: {
      port: 3000,
      host: 'localhost'
    },
    database: {
      type: 'sqlite',
      connection: {
        filename: 'app.db'
      }
    },
    features: {
      auth: true,
      logging: false
    }
  };

  const {
    server: { 
      port = defaultConfig.server.port,
      host = defaultConfig.server.host 
    } = {},
    database: { 
      type = defaultConfig.database.type,
      connection = defaultConfig.database.connection 
    } = {},
    features: {
      auth = defaultConfig.features.auth,
      logging = defaultConfig.features.logging
    } = {}
  } = userConfig;

  return { server: { port, host }, database: { type, connection }, features: { auth, logging } };
}

const customConfig = createConfig({
  server: { port: 8080 },
  features: { logging: true }
});

console.log('Merged config:', customConfig);

console.log('\n=== Error Handling Patterns ===');

// Safe property access
function safeExtract(obj, path) {
  try {
    // Using computed destructuring for safe access
    const pathArray = path.split('.');
    let current = obj;
    
    for (const prop of pathArray) {
      if (current && typeof current === 'object') {
        current = current[prop];
      } else {
        return undefined;
      }
    }
    
    return current;
  } catch (error) {
    return undefined;
  }
}

// Alternative using destructuring with defaults
function extractSafely(obj, keys) {
  return keys.reduce((result, key) => {
    const { [key]: value = null } = obj || {};
    result[key] = value;
    return result;
  }, {});
}

const unreliableData = { a: 1, b: { c: 3 } };
console.log('Safe extract b.c:', safeExtract(unreliableData, 'b.c'));
console.log('Safe extract multiple:', extractSafely(unreliableData, ['a', 'b', 'missing']));

console.log('\n=== Interview Questions ===');

// Q1: Swap object properties
function swapObjectProps(obj, prop1, prop2) {
  const { [prop1]: val1, [prop2]: val2 } = obj;
  return { ...obj, [prop1]: val2, [prop2]: val1 };
}

const testObj = { x: 1, y: 2, z: 3 };
console.log('Swapped x,y:', swapObjectProps(testObj, 'x', 'y'));

// Q2: Pick properties from object
const pick = (obj, ...keys) => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

// Using destructuring
const pickDestructured = (obj, ...keys) => {
  const result = {};
  keys.forEach(key => {
    const { [key]: value } = obj;
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};

const sourceData = { name: 'John', age: 30, city: 'NYC', country: 'USA' };
console.log('Picked properties:', pickDestructured(sourceData, 'name', 'city'));

// Q3: Flatten one level of nesting
function flattenOneLevel(obj) {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Destructure nested object
      Object.assign(flattened, value);
    } else {
      flattened[key] = value;
    }
  }
  
  return flattened;
}

const nested = {
  a: 1,
  b: { c: 2, d: 3 },
  e: { f: 4 },
  g: 5
};

console.log('Flattened:', flattenOneLevel(nested));

// Q4: Transform object keys
function transformKeys(obj, transformer) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformer(key);
    result[newKey] = value;
  }
  
  return result;
}

// Using destructuring in transformer
const camelToSnake = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const camelCaseObj = { firstName: 'John', lastName: 'Doe', isActive: true };
console.log('Snake case:', transformKeys(camelCaseObj, camelToSnake));

// Q5: Validate required properties
function validateRequired(obj, required) {
  const missing = [];
  
  required.forEach(prop => {
    const { [prop]: value } = obj;
    if (value === undefined || value === null) {
      missing.push(prop);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
}

const userData = { name: 'Alice', email: 'alice@example.com' };
console.log('Validation result:', validateRequired(userData, ['name', 'email', 'age']));

module.exports = {
  createUser,
  updateUserProfile,
  extractPropsDestructured,
  handleApiResponse,
  createConfig,
  safeExtract,
  extractSafely,
  swapObjectProps,
  pickDestructured,
  flattenOneLevel,
  transformKeys,
  validateRequired
};