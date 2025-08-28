/**
 * File: es2020-features.js
 * Description: ES2020 (ES11) features - Optional chaining, nullish coalescing, BigInt, etc.
 */

// === Optional Chaining (?.) ===
console.log('=== Optional Chaining (?.) ===\n');

const user = {
  name: 'John',
  address: {
    street: '123 Main St',
    city: 'New York'
    // No country property
  },
  getAge: function() {
    return 30;
  }
  // No getAddress method
};

// Property access
console.log('City:', user.address?.city); // 'New York'
console.log('Country:', user.address?.country); // undefined (no error)
console.log('Zip:', user.address?.zip?.code); // undefined (no error)

// Nested optional chaining
console.log('Deep access:', user.contact?.phone?.number); // undefined

// Method calls
console.log('Age:', user.getAge?.()); // 30
console.log('Address:', user.getAddress?.()); // undefined (no error)

// Array/bracket notation
const arr = [1, 2, 3];
console.log('Array element:', arr?.[1]); // 2
console.log('Out of bounds:', arr?.[10]); // undefined

const key = 'address';
console.log('Dynamic property:', user?.[key]?.city); // 'New York'

// Combining with nullish coalescing
const country = user.address?.country ?? 'USA';
console.log('Country with default:', country); // 'USA'

// === Nullish Coalescing (??) ===
console.log('\n=== Nullish Coalescing (??) ===\n');

// Problem with || operator
const config1 = {
  timeout: 0,        // Valid value
  retries: false,    // Valid value
  port: '',          // Valid value
  host: null,        // Invalid, need default
  path: undefined    // Invalid, need default
};

// Using || (incorrect for falsy values)
console.log('With || operator:');
console.log('Timeout:', config1.timeout || 5000); // 5000 (wrong!)
console.log('Retries:', config1.retries || true); // true (wrong!)
console.log('Port:', config1.port || '8080');     // '8080' (wrong!)

// Using ?? (correct)
console.log('\nWith ?? operator:');
console.log('Timeout:', config1.timeout ?? 5000); // 0 (correct!)
console.log('Retries:', config1.retries ?? true); // false (correct!)
console.log('Port:', config1.port ?? '8080');     // '' (correct!)
console.log('Host:', config1.host ?? 'localhost'); // 'localhost' (correct!)
console.log('Path:', config1.path ?? '/');         // '/' (correct!)

// Chaining
const value = null ?? undefined ?? 0 ?? 'default';
console.log('Chained value:', value); // 0

// === BigInt ===
console.log('\n=== BigInt ===\n');

// Creating BigInts
const bigInt1 = 123n;
const bigInt2 = BigInt(456);
const bigInt3 = BigInt('789012345678901234567890');

console.log('BigInt literal:', bigInt1);
console.log('BigInt from number:', bigInt2);
console.log('BigInt from string:', bigInt3);

// BigInt operations
const sum = bigInt1 + bigInt2;
const product = bigInt1 * bigInt2;
const power = bigInt1 ** 2n;

console.log('Sum:', sum); // 579n
console.log('Product:', product); // 56088n
console.log('Power:', power); // 15129n

// Large numbers
const maxSafeInt = BigInt(Number.MAX_SAFE_INTEGER);
console.log('MAX_SAFE_INTEGER:', maxSafeInt);
console.log('MAX_SAFE_INTEGER + 1:', maxSafeInt + 1n);
console.log('MAX_SAFE_INTEGER + 2:', maxSafeInt + 2n);

// Comparison
console.log('BigInt equality:', 123n === 123n); // true
console.log('BigInt > Number:', 123n > 100); // true
// console.log('BigInt === Number:', 123n === 123); // false (different types)

// Type conversion
const bigIntValue = 123n;
console.log('To Number:', Number(bigIntValue)); // 123
console.log('To String:', String(bigIntValue)); // "123"
console.log('To Boolean:', Boolean(bigIntValue)); // true

// === Dynamic Import ===
console.log('\n=== Dynamic Import ===\n');

// Dynamic import returns a promise
async function loadModule(moduleName) {
  try {
    const module = await import(moduleName);
    console.log('Module loaded:', moduleName);
    return module;
  } catch (error) {
    console.log('Failed to load module:', error.message);
  }
}

// Conditional imports
async function loadFeature(featureName) {
  if (featureName === 'advanced') {
    const { advancedFeature } = await import('./advanced-module.js');
    return advancedFeature;
  }
  return null;
}

// Lazy loading
class LazyLoader {
  constructor() {
    this.modules = new Map();
  }
  
  async load(path) {
    if (!this.modules.has(path)) {
      const module = await import(path);
      this.modules.set(path, module);
    }
    return this.modules.get(path);
  }
}

// === globalThis ===
console.log('\n=== globalThis ===\n');

// Unified global object access
console.log('Global object exists:', typeof globalThis !== 'undefined');

// Works in all environments
function getGlobal() {
  // Old way: checking multiple globals
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  if (typeof self !== 'undefined') return self;
  throw new Error('No global found');
}

// New way: just use globalThis
globalThis.myGlobalVar = 'Hello from globalThis';
console.log('Global var:', globalThis.myGlobalVar);

// === Promise.allSettled ===
console.log('\n=== Promise.allSettled ===\n');

const promises = [
  Promise.resolve('Success 1'),
  Promise.reject(new Error('Failed')),
  Promise.resolve('Success 2')
];

// Promise.all fails fast
Promise.all(promises)
  .then(results => console.log('Promise.all:', results))
  .catch(error => console.log('Promise.all error:', error.message));

// Promise.allSettled waits for all
Promise.allSettled(promises)
  .then(results => {
    console.log('Promise.allSettled results:');
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        console.log(`  ${i}: Success - ${result.value}`);
      } else {
        console.log(`  ${i}: Failed - ${result.reason.message}`);
      }
    });
  });

// === String.matchAll ===
console.log('\n=== String.matchAll ===\n');

const text = 'The dates are 2024-01-15 and 2024-02-20';
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/g;

// Old way: using exec in loop
console.log('Using exec:');
let match;
const regex1 = /(\d{4})-(\d{2})-(\d{2})/g;
while ((match = regex1.exec(text)) !== null) {
  console.log(`  Found: ${match[0]} - Year: ${match[1]}`);
}

// New way: using matchAll
console.log('Using matchAll:');
const matches = text.matchAll(dateRegex);
for (const match of matches) {
  const [full, year, month, day] = match;
  console.log(`  Date: ${full} - ${year}/${month}/${day}`);
}

// === for-in Mechanics ===
console.log('\n=== for-in Order Guarantee ===\n');

// ES2020 guarantees enumeration order for for-in
const obj = {
  2: 'two',
  1: 'one',
  'b': 'letter b',
  'a': 'letter a',
  3: 'three'
};

console.log('Object:', obj);
console.log('for-in order:');
for (const key in obj) {
  console.log(`  ${key}: ${obj[key]}`);
}
// Order: numeric keys (sorted), then string keys (insertion order)

module.exports = {
  user,
  LazyLoader
};