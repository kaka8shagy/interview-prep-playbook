/**
 * File: destructuring-advanced.js
 * Description: Advanced destructuring patterns and techniques
 */

// === Nested Destructuring ===
console.log('=== Nested Destructuring ===\n');

const complexData = {
  user: {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    hobbies: ['reading', 'coding', 'gaming']
  },
  metadata: {
    created: '2024-01-01',
    updated: '2024-01-15'
  }
};

// Deeply nested destructuring
const {
  user: {
    name,
    address: {
      city,
      coordinates: { lat, lng }
    },
    hobbies: [firstHobby, ...otherHobbies]
  },
  metadata: { created }
} = complexData;

console.log('Name:', name);
console.log('City:', city);
console.log('Coordinates:', lat, lng);
console.log('First hobby:', firstHobby);
console.log('Other hobbies:', otherHobbies);
console.log('Created:', created);

// === Default Values ===
console.log('\n=== Default Values ===\n');

// Object destructuring with defaults
const settings = {
  theme: 'dark',
  fontSize: 14
};

const {
  theme = 'light',
  fontSize = 16,
  language = 'en', // Default used
  autoSave = true  // Default used
} = settings;

console.log('Settings:', { theme, fontSize, language, autoSave });

// Array destructuring with defaults
const rgb = [255, 128];
const [r = 0, g = 0, b = 0, a = 1] = rgb;
console.log('RGBA:', { r, g, b, a });

// Nested defaults
const config = {
  api: {
    url: 'https://api.example.com'
    // timeout not defined
  }
};

const {
  api: {
    url: apiUrl,
    timeout = 5000,
    retries = 3
  } = {} // Default empty object if api is undefined
} = config;

console.log('API Config:', { apiUrl, timeout, retries });

// === Renaming Variables ===
console.log('\n=== Renaming Variables ===\n');

const person = {
  firstName: 'Jane',
  lastName: 'Smith',
  age: 25
};

// Rename during destructuring
const {
  firstName: fName,
  lastName: lName,
  age: personAge
} = person;

console.log('Renamed:', { fName, lName, personAge });

// Rename with defaults
const {
  firstName: first = 'Unknown',
  middleName: middle = 'N/A',
  title: honorific = 'Mr/Ms'
} = person;

console.log('Renamed with defaults:', { first, middle, honorific });

// === Dynamic Property Names ===
console.log('\n=== Dynamic Property Names ===\n');

const key = 'dynamicKey';
const data = {
  staticKey: 'static value',
  dynamicKey: 'dynamic value',
  anotherKey: 'another value'
};

// Computed property destructuring
const { [key]: dynamicValue, ...rest } = data;
console.log('Dynamic value:', dynamicValue);
console.log('Rest:', rest);

// === Function Parameters ===
console.log('\n=== Function Parameter Destructuring ===\n');

// Object parameter destructuring
function createUser({
  name,
  email,
  role = 'user',
  active = true,
  metadata = {}
} = {}) { // Default empty object prevents error
  return {
    name,
    email,
    role,
    active,
    metadata,
    createdAt: new Date()
  };
}

const user1 = createUser({
  name: 'Alice',
  email: 'alice@example.com'
});
console.log('User 1:', user1);

const user2 = createUser(); // Uses all defaults
console.log('User 2:', user2);

// Array parameter destructuring
function processCoordinates([x = 0, y = 0, z = 0] = []) {
  return { x, y, z, magnitude: Math.sqrt(x*x + y*y + z*z) };
}

console.log('3D coords:', processCoordinates([3, 4, 5]));
console.log('2D coords:', processCoordinates([3, 4]));
console.log('Default coords:', processCoordinates());

// === Mixed Destructuring ===
console.log('\n=== Mixed Array and Object Destructuring ===\n');

const response = {
  status: 200,
  data: {
    users: [
      { id: 1, name: 'User 1', roles: ['admin', 'user'] },
      { id: 2, name: 'User 2', roles: ['user'] },
      { id: 3, name: 'User 3', roles: ['guest'] }
    ],
    total: 3,
    page: 1
  }
};

// Complex mixed destructuring
const {
  status: httpStatus,
  data: {
    users: [
      { name: firstUserName, roles: [primaryRole] },
      secondUser,
      ...remainingUsers
    ],
    total
  }
} = response;

console.log('HTTP Status:', httpStatus);
console.log('First user name:', firstUserName);
console.log('First user primary role:', primaryRole);
console.log('Second user:', secondUser);
console.log('Remaining users:', remainingUsers);
console.log('Total:', total);

// === Swapping Variables ===
console.log('\n=== Variable Swapping ===\n');

let x = 10, y = 20;
console.log('Before swap:', { x, y });

[x, y] = [y, x];
console.log('After swap:', { x, y });

// Multiple variable rotation
let a = 1, b = 2, c = 3, d = 4;
[a, b, c, d] = [d, a, b, c];
console.log('Rotated:', { a, b, c, d });

// === RegExp Destructuring ===
console.log('\n=== RegExp Match Destructuring ===\n');

const dateString = '2024-01-15';
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;

const [fullMatch, year, month, day] = dateString.match(dateRegex) || [];
console.log('Parsed date:', { fullMatch, year, month, day });

// Named groups (ES2018)
const namedRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const { groups: { year: y2, month: m2, day: d2 } = {} } = 
  dateString.match(namedRegex) || {};
console.log('Named groups:', { year: y2, month: m2, day: d2 });

// === Iterator Destructuring ===
console.log('\n=== Iterator Destructuring ===\n');

// String destructuring
const str = 'Hello';
const [h, e, ...llo] = str;
console.log('String chars:', { h, e, llo: llo.join('') });

// Set destructuring
const uniqueNumbers = new Set([1, 2, 3, 4, 5]);
const [first, second, ...others] = uniqueNumbers;
console.log('Set values:', { first, second, others });

// Map destructuring
const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
const [[key1, val1], ...entries] = map;
console.log('Map first entry:', { key1, val1 });
console.log('Rest entries:', entries);

module.exports = {
  createUser,
  processCoordinates
};