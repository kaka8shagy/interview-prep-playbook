/**
 * File: default-parameters.js
 * Description: Default parameters in functions
 * Demonstrates default parameter patterns and edge cases
 */

console.log('=== Basic Default Parameters ===');

// Basic default values
function greet(name = 'World', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

console.log('No args:', greet());
console.log('One arg:', greet('Alice'));
console.log('Two args:', greet('Bob', 'Hi'));

// Default parameters only apply to undefined
function testUndefined(value = 'default') {
  return value;
}

console.log('Undefined:', testUndefined(undefined)); // 'default'
console.log('Null:', testUndefined(null)); // null
console.log('False:', testUndefined(false)); // false
console.log('Empty string:', testUndefined('')); // ''
console.log('Zero:', testUndefined(0)); // 0

console.log('\n=== Expression as Default Values ===');

// Function calls as defaults
function getTimestamp() {
  console.log('Getting timestamp...');
  return Date.now();
}

function logEvent(message, timestamp = getTimestamp()) {
  return { message, timestamp };
}

console.log('With timestamp:', logEvent('User login', 1234567890));
console.log('Without timestamp:', logEvent('User logout')); // Calls getTimestamp()

// Mathematical expressions
function calculateArea(length = 10, width = length * 0.8, unit = 'sq ft') {
  return `${length * width} ${unit}`;
}

console.log('Default area:', calculateArea());
console.log('Custom length:', calculateArea(20));
console.log('Custom length and width:', calculateArea(20, 15));

// Object/Array defaults
function processUserData(
  user = { name: 'Anonymous', role: 'guest' },
  permissions = ['read'],
  metadata = { created: new Date() }
) {
  return {
    ...user,
    permissions,
    metadata
  };
}

console.log('Default user:', processUserData());
console.log('Custom user:', processUserData({ name: 'John', role: 'admin' }));

console.log('\n=== Default Parameters with Destructuring ===');

// Object parameter with defaults
function createUser({
  name = 'Unknown',
  email = 'no-email@example.com',
  age = 0,
  isActive = true
} = {}) {
  return { name, email, age, isActive, id: Math.random() };
}

console.log('No parameters:', createUser());
console.log('Partial parameters:', createUser({ name: 'Alice', age: 25 }));
console.log('All parameters:', createUser({ 
  name: 'Bob', 
  email: 'bob@example.com', 
  age: 30, 
  isActive: false 
}));

// Array parameter with defaults
function processNumbers([first = 0, second = 1, ...rest] = []) {
  return {
    first,
    second,
    rest,
    sum: first + second + rest.reduce((a, b) => a + b, 0)
  };
}

console.log('No array:', processNumbers());
console.log('Partial array:', processNumbers([5]));
console.log('Full array:', processNumbers([5, 10, 2, 3, 4]));

// Nested destructuring with defaults
function updateProfile({
  user: {
    id = null,
    name = 'Anonymous'
  } = {},
  settings: {
    theme = 'light',
    notifications = true
  } = {}
} = {}) {
  return { id, name, theme, notifications };
}

console.log('Deep defaults:', updateProfile());
console.log('Partial deep:', updateProfile({
  user: { id: 123 },
  settings: { theme: 'dark' }
}));

console.log('\n=== Advanced Default Parameter Patterns ===');

// Using previous parameters in defaults
function createRange(start = 0, end = start + 10, step = 1) {
  const range = [];
  for (let i = start; i < end; i += step) {
    range.push(i);
  }
  return range;
}

console.log('Default range:', createRange());
console.log('Start at 5:', createRange(5));
console.log('Start at 5, end at 20:', createRange(5, 20));
console.log('Custom step:', createRange(0, 10, 2));

// Conditional defaults based on other parameters
function formatMessage(message, format = message.length > 50 ? 'long' : 'short') {
  switch (format) {
    case 'long':
      return `📄 ${message}`;
    case 'short':
      return `💬 ${message.substring(0, 20)}...`;
    default:
      return message;
  }
}

const shortMsg = 'Hello world';
const longMsg = 'This is a very long message that exceeds fifty characters and should be formatted differently';

console.log('Short message:', formatMessage(shortMsg));
console.log('Long message:', formatMessage(longMsg));

// Function defaults that depend on environment
let environment = 'development';

function connectToDatabase(
  host = environment === 'production' ? 'prod-db.com' : 'localhost',
  port = environment === 'production' ? 5432 : 3000,
  ssl = environment === 'production'
) {
  return { host, port, ssl };
}

console.log('Dev connection:', connectToDatabase());

environment = 'production';
console.log('Prod connection:', connectToDatabase());

console.log('\n=== Default Parameters with Rest Parameters ===');

// Combining defaults with rest parameters
function createLogger(level = 'info', ...formatters) {
  return function(message, ...args) {
    const timestamp = new Date().toISOString();
    let formattedMessage = message;
    
    // Apply formatters
    formatters.forEach(formatter => {
      formattedMessage = formatter(formattedMessage, ...args);
    });
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${formattedMessage}`);
  };
}

const upperCaseFormatter = (msg) => msg.toUpperCase();
const prefixFormatter = (msg, prefix = 'APP') => `${prefix} - ${msg}`;

const logger = createLogger('debug', upperCaseFormatter, prefixFormatter);
logger('User logged in', 'MyApp');

// Variable number of arguments with defaults
function calculateStats(
  operation = 'sum',
  precision = 2,
  ...numbers
) {
  if (numbers.length === 0) {
    numbers = [0]; // Default to array with 0
  }
  
  let result;
  switch (operation) {
    case 'sum':
      result = numbers.reduce((a, b) => a + b, 0);
      break;
    case 'average':
      result = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      break;
    case 'product':
      result = numbers.reduce((a, b) => a * b, 1);
      break;
    default:
      result = numbers[0];
  }
  
  return Number(result.toFixed(precision));
}

console.log('Default stats:', calculateStats());
console.log('Sum with precision:', calculateStats('sum', 2, 1.234, 2.567, 3.891));
console.log('Average:', calculateStats('average', 1, 10, 20, 30));

console.log('\n=== Error Handling with Defaults ===');

// Validation with defaults
function validateAndCreate(
  data = {},
  validator = (data) => data.name && data.email,
  errorMessage = 'Invalid data provided'
) {
  if (!validator(data)) {
    throw new Error(errorMessage);
  }
  
  return {
    ...data,
    id: Math.random().toString(36),
    created: new Date()
  };
}

try {
  console.log('Valid data:', validateAndCreate({ name: 'John', email: 'john@example.com' }));
  validateAndCreate({ name: 'John' }); // Missing email
} catch (error) {
  console.log('Validation error:', error.message);
}

// Fallback function defaults
function processWithFallback(
  data,
  processor = (data) => data,
  fallbackProcessor = (data, error) => ({ error: error.message, data })
) {
  try {
    return processor(data);
  } catch (error) {
    console.log('Primary processor failed, using fallback');
    return fallbackProcessor(data, error);
  }
}

const riskyProcessor = (data) => {
  if (data.length < 3) {
    throw new Error('Data too short');
  }
  return data.toUpperCase();
};

console.log('Success case:', processWithFallback('hello', riskyProcessor));
console.log('Fallback case:', processWithFallback('hi', riskyProcessor));

console.log('\n=== Performance Considerations ===');

// Expensive default calculations - only computed when needed
function expensiveDefault() {
  console.log('Computing expensive default...');
  // Simulate expensive operation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random();
  }
  return result;
}

function processData(input, backup = expensiveDefault()) {
  return input || backup;
}

console.log('With input:', processData('provided value'));
// expensiveDefault is not called when input is provided

console.log('Without input:');
console.log(processData()); // Now expensiveDefault is called

// Memoized default values
const memoizedDefaults = {
  cache: new Map(),
  
  getExpensiveDefault(key) {
    if (!this.cache.has(key)) {
      console.log(`Computing expensive default for ${key}...`);
      this.cache.set(key, Math.random() * 1000);
    }
    return this.cache.get(key);
  }
};

function processWithMemoization(
  input,
  defaultValue = memoizedDefaults.getExpensiveDefault('default')
) {
  return input || defaultValue;
}

console.log('First call:', processWithMemoization());
console.log('Second call (cached):', processWithMemoization());

console.log('\n=== Interview Questions ===');

// Q1: Implement a config merger with intelligent defaults
function createConfig(userConfig = {}, environment = 'development') {
  const defaults = {
    development: {
      debug: true,
      apiUrl: 'http://localhost:3000',
      timeout: 5000
    },
    production: {
      debug: false,
      apiUrl: 'https://api.example.com',
      timeout: 30000
    },
    test: {
      debug: false,
      apiUrl: 'http://test-api.local',
      timeout: 1000
    }
  };
  
  const envDefaults = defaults[environment] || defaults.development;
  
  return {
    environment,
    ...envDefaults,
    ...userConfig,
    timestamp: new Date().toISOString()
  };
}

console.log('Dev config:', createConfig());
console.log('Prod config:', createConfig({ debug: true }, 'production'));

// Q2: Create a retry function with exponential backoff
function withRetry(
  fn,
  maxAttempts = 3,
  baseDelay = 1000,
  backoffFactor = 2,
  onRetry = (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
) {
  return async function(...args) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
          onRetry(attempt, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };
}

// Simulate unreliable function
let callCount = 0;
const unreliableFunction = async (data) => {
  callCount++;
  if (callCount < 3) {
    throw new Error(`Attempt ${callCount} failed`);
  }
  return `Success with ${data}`;
};

const reliableFunction = withRetry(unreliableFunction);

// Reset for demo
callCount = 0;
reliableFunction('test data')
  .then(result => console.log('Final result:', result))
  .catch(error => console.log('Final error:', error.message));

// Q3: Implement a template function with default interpolation
function createTemplate(
  template,
  defaultValues = {},
  interpolator = (template, values) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  }
) {
  return function(values = {}) {
    const mergedValues = { ...defaultValues, ...values };
    return interpolator(template, mergedValues);
  };
}

const emailTemplate = createTemplate(
  'Hello {{name}}, your order {{orderId}} is {{status}}.',
  { name: 'Customer', status: 'processing' }
);

console.log('Default template:', emailTemplate());
console.log('Custom values:', emailTemplate({ name: 'John', orderId: '12345', status: 'shipped' }));

module.exports = {
  greet,
  testUndefined,
  logEvent,
  calculateArea,
  processUserData,
  createUser,
  processNumbers,
  updateProfile,
  createRange,
  formatMessage,
  connectToDatabase,
  createLogger,
  calculateStats,
  validateAndCreate,
  processWithFallback,
  createConfig,
  withRetry,
  createTemplate
};