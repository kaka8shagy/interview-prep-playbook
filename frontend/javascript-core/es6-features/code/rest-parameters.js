/**
 * File: rest-parameters.js
 * Description: Rest parameters (...args) usage patterns
 * Demonstrates rest parameters in functions and destructuring
 */

console.log('=== Basic Rest Parameters ===');

// Basic rest parameters in functions
function sum(...numbers) {
  console.log('Rest parameters are array:', Array.isArray(numbers));
  console.log('Arguments received:', numbers);
  
  return numbers.reduce((total, num) => total + num, 0);
}

console.log('Sum of 1,2,3:', sum(1, 2, 3));
console.log('Sum of 1,2,3,4,5:', sum(1, 2, 3, 4, 5));
console.log('Sum with no args:', sum());

// Rest parameters must be last
function processData(operation, ...data) {
  console.log(`Operation: ${operation}`);
  console.log('Data to process:', data);
  
  switch (operation) {
    case 'sum':
      return data.reduce((a, b) => a + b, 0);
    case 'multiply':
      return data.reduce((a, b) => a * b, 1);
    case 'concat':
      return data.join('');
    default:
      return data;
  }
}

console.log('Process sum:', processData('sum', 1, 2, 3, 4));
console.log('Process multiply:', processData('multiply', 2, 3, 4));
console.log('Process concat:', processData('concat', 'a', 'b', 'c'));

console.log('\n=== Rest vs Arguments Object ===');

// Traditional arguments object (avoid in modern code)
function oldStyleVariadic() {
  console.log('arguments is array-like:', Array.isArray(arguments)); // false
  console.log('arguments length:', arguments.length);
  
  // Need to convert to array
  const argsArray = Array.prototype.slice.call(arguments);
  return argsArray.reduce((sum, num) => sum + num, 0);
}

// Modern rest parameters
function modernVariadic(...args) {
  console.log('rest params is array:', Array.isArray(args)); // true
  console.log('args length:', args.length);
  
  // Already an array, can use array methods directly
  return args.reduce((sum, num) => sum + num, 0);
}

console.log('Old style sum:', oldStyleVariadic(1, 2, 3));
console.log('Modern sum:', modernVariadic(1, 2, 3));

console.log('\n=== Rest Parameters with Destructuring ===');

// Array destructuring with rest
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;

console.log('First:', first);
console.log('Second:', second);
console.log('Rest:', rest);

// Object destructuring with rest
const person = {
  name: 'John',
  age: 30,
  city: 'New York',
  country: 'USA',
  occupation: 'Developer'
};

const { name, age, ...otherInfo } = person;
console.log('Name:', name);
console.log('Age:', age);
console.log('Other info:', otherInfo);

// Nested destructuring with rest
const userData = {
  id: 1,
  profile: {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    phone: '123-456-7890',
    address: {
      street: '123 Main St',
      city: 'Boston',
      state: 'MA'
    }
  }
};

const {
  id,
  profile: {
    firstName,
    lastName,
    ...contactInfo
  }
} = userData;

console.log('User ID:', id);
console.log('Name:', firstName, lastName);
console.log('Contact info:', contactInfo);

console.log('\n=== Practical Use Cases ===');

// 1. Creating flexible APIs
function createApiRequest(method, url, ...options) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000
  };
  
  // Merge all options
  const mergedOptions = options.reduce((acc, option) => {
    return { ...acc, ...option };
  }, defaultOptions);
  
  return {
    method: method.toUpperCase(),
    url,
    ...mergedOptions
  };
}

const getRequest = createApiRequest('get', '/api/users');
const postRequest = createApiRequest(
  'post', 
  '/api/users', 
  { body: JSON.stringify({ name: 'John' }) },
  { timeout: 10000 },
  { headers: { Authorization: 'Bearer token' } }
);

console.log('GET request:', getRequest);
console.log('POST request:', postRequest);

// 2. Logger with multiple arguments
class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }
  
  log(level, ...messages) {
    const timestamp = new Date().toISOString();
    const formattedMessages = messages.map(msg => 
      typeof msg === 'object' ? JSON.stringify(msg) : String(msg)
    );
    
    console.log(`[${timestamp}] ${this.prefix}${level.toUpperCase()}: ${formattedMessages.join(' ')}`);
  }
  
  info(...messages) {
    this.log('info', ...messages);
  }
  
  warn(...messages) {
    this.log('warn', ...messages);
  }
  
  error(...messages) {
    this.log('error', ...messages);
  }
}

const logger = new Logger('MyApp - ');
logger.info('Application started');
logger.warn('This is a warning', { userId: 123 });
logger.error('Error occurred:', new Error('Something went wrong'));

// 3. Mathematical operations
const MathUtils = {
  max(...numbers) {
    return Math.max(...numbers);
  },
  
  min(...numbers) {
    return Math.min(...numbers);
  },
  
  average(...numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return sum / numbers.length;
  },
  
  range(...numbers) {
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    return max - min;
  }
};

console.log('Max of 1,5,3,9,2:', MathUtils.max(1, 5, 3, 9, 2));
console.log('Average of 1,2,3,4,5:', MathUtils.average(1, 2, 3, 4, 5));
console.log('Range of 1,5,3,9,2:', MathUtils.range(1, 5, 3, 9, 2));

console.log('\n=== Advanced Patterns ===');

// 1. Function composition with rest parameters
function compose(...functions) {
  return function(input) {
    return functions.reduceRight((acc, fn) => fn(acc), input);
  };
}

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const composedFunction = compose(square, double, addOne);
console.log('Compose (square ∘ double ∘ addOne)(3):', composedFunction(3)); // ((3+1)*2)^2 = 64

// 2. Event system with rest parameters
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }
  
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        callback(...args);
      });
    }
  }
  
  off(event, callback) {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

const emitter = new EventEmitter();

emitter.on('data', (type, payload, metadata) => {
  console.log(`Data event - Type: ${type}, Payload:`, payload, 'Meta:', metadata);
});

emitter.emit('data', 'user_action', { action: 'click' }, { timestamp: Date.now() });

// 3. Partial application with rest parameters
function partial(fn, ...argsToApply) {
  return function(...remainingArgs) {
    return fn(...argsToApply, ...remainingArgs);
  };
}

function multiply(a, b, c) {
  return a * b * c;
}

const multiplyBy2And3 = partial(multiply, 2, 3);
console.log('Partial application 2*3*4:', multiplyBy2And3(4)); // 24

// 4. Currying with rest parameters
function curry(fn, ...args) {
  return function(...nextArgs) {
    const allArgs = [...args, ...nextArgs];
    
    if (allArgs.length >= fn.length) {
      return fn(...allArgs);
    }
    
    return curry(fn, ...allArgs);
  };
}

const curriedMultiply = curry(multiply);
const step1 = curriedMultiply(2);
const step2 = step1(3);
const result = step2(4);

console.log('Curried multiply 2*3*4:', result); // 24

// Or chained
console.log('Chained curried:', curriedMultiply(2)(3)(4)); // 24

console.log('\n=== Rest Parameters in Arrow Functions ===');

// Arrow functions with rest parameters
const concatenate = (...strings) => strings.join(' ');
const multiply = (...numbers) => numbers.reduce((a, b) => a * b, 1);
const findMax = (...nums) => Math.max(...nums);

console.log('Concatenate:', concatenate('Hello', 'beautiful', 'world'));
console.log('Multiply all:', multiply(2, 3, 4, 5));
console.log('Find max:', findMax(10, 5, 8, 15, 3));

// Rest parameters in arrow functions with destructuring
const extractFirstAndRest = ([first, ...rest]) => ({ first, rest });
const extractNameAndProps = ({ name, ...props }) => ({ name, props });

console.log('Extract first and rest:', extractFirstAndRest([1, 2, 3, 4, 5]));
console.log('Extract name and props:', extractNameAndProps({ name: 'John', age: 30, city: 'NYC' }));

console.log('\n=== Interview Questions ===');

// Q1: Implement a function that flattens arrays of any depth
function flattenDeep(...arrays) {
  const flatten = (arr) => {
    return arr.reduce((acc, val) => {
      if (Array.isArray(val)) {
        acc.push(...flatten(val));
      } else {
        acc.push(val);
      }
      return acc;
    }, []);
  };
  
  return flatten(arrays);
}

console.log('Flatten deep:', flattenDeep([1, 2], [3, [4, [5, 6]]], 7));

// Q2: Create a memoization function with rest parameters
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit for:', args);
      return cache.get(key);
    }
    
    console.log('Computing for:', args);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const expensiveSum = memoize((...numbers) => {
  // Simulate expensive calculation
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += numbers.reduce((a, b) => a + b, 0);
  }
  return sum / 1000000;
});

console.log('First call:', expensiveSum(1, 2, 3));
console.log('Second call (cached):', expensiveSum(1, 2, 3));

// Q3: Implement a validation function for required parameters
function requireParams(fn, ...requiredParams) {
  return function(...args) {
    if (args.length < requiredParams.length) {
      throw new Error(`Missing required parameters: ${requiredParams.slice(args.length).join(', ')}`);
    }
    
    // Check for undefined/null values
    for (let i = 0; i < requiredParams.length; i++) {
      if (args[i] === undefined || args[i] === null) {
        throw new Error(`Parameter "${requiredParams[i]}" cannot be null or undefined`);
      }
    }
    
    return fn(...args);
  };
}

const createUser = requireParams(
  (name, email, age) => ({ name, email, age, id: Math.random() }),
  'name', 'email', 'age'
);

try {
  console.log('Valid user:', createUser('John', 'john@example.com', 30));
  createUser('John'); // Should throw error
} catch (error) {
  console.log('Validation error:', error.message);
}

// Q4: Implement a pipe function (left-to-right composition)
function pipe(input, ...functions) {
  return functions.reduce((acc, fn) => fn(acc), input);
}

const increment = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

console.log('Pipe 3 -> increment -> double -> square:', 
  pipe(3, increment, double, square)); // ((3+1)*2)^2 = 64

// Q5: Create a debounce function with rest parameters
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

const debouncedLog = debounce((...messages) => {
  console.log('Debounced log:', ...messages);
}, 1000);

// These will be debounced - only the last call will execute
debouncedLog('First call');
debouncedLog('Second call');
debouncedLog('Third call', 'with multiple', 'arguments');

module.exports = {
  sum,
  processData,
  modernVariadic,
  createApiRequest,
  Logger,
  MathUtils,
  compose,
  EventEmitter,
  partial,
  curry,
  flattenDeep,
  memoize,
  requireParams,
  pipe,
  debounce
};