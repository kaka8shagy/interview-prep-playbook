/**
 * File: json-polyfills.js
 * Description: Implementation of JSON.stringify and JSON.parse polyfills with detailed explanations
 * 
 * Learning objectives:
 * - Understand JSON specification and edge cases
 * - Learn recursive parsing and serialization
 * - Handle circular references and special values
 * 
 * Time Complexity: O(n) where n is total nodes in object graph
 * Space Complexity: O(d) where d is maximum depth of nested structures
 */

// =======================
// Approach 1: Basic JSON.stringify Implementation
// =======================

/**
 * Basic JSON.stringify implementation covering core functionality
 * Handles primitives, objects, arrays with basic type coercion
 * 
 * Mental model: Think of JSON as a tree traversal where we convert
 * JavaScript values to string representations following JSON syntax rules
 */
function jsonStringifyBasic(value) {
  // Handle different JavaScript types according to JSON spec
  
  // Undefined, functions, and symbols are not valid JSON
  // In objects they're omitted, in arrays they become null
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined; // This will be handled differently in objects vs arrays
  }
  
  // null is a valid JSON primitive
  if (value === null) {
    return 'null';
  }
  
  // Booleans become true/false strings
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  // Numbers have special handling for non-finite values
  if (typeof value === 'number') {
    // NaN and Infinity become null in JSON
    if (!isFinite(value)) {
      return 'null';
    }
    return String(value);
  }
  
  // Strings need escaping for special characters
  if (typeof value === 'string') {
    return escapeString(value);
  }
  
  // Arrays are serialized as comma-separated values in brackets
  if (Array.isArray(value)) {
    return serializeArray(value);
  }
  
  // Objects (including Date, RegExp, etc.) are serialized as key-value pairs
  if (typeof value === 'object') {
    return serializeObject(value);
  }
  
  // Fallback for any unhandled types
  return 'null';
}

/**
 * Helper function to escape string values for JSON
 * Must handle all JSON escape sequences properly
 */
function escapeString(str) {
  // JSON requires escaping these specific characters
  const escapeMap = {
    '"': '\\"',      // Quote
    '\\': '\\\\',    // Backslash
    '\b': '\\b',     // Backspace
    '\f': '\\f',     // Form feed
    '\n': '\\n',     // Newline
    '\r': '\\r',     // Carriage return
    '\t': '\\t'      // Tab
  };
  
  // Replace all escape characters with their JSON equivalents
  const escaped = str.replace(/["\\\b\f\n\r\t]/g, match => escapeMap[match]);
  
  // Wrap in quotes as required by JSON spec
  return `"${escaped}"`;
}

/**
 * Helper to serialize arrays
 * Arrays in JSON are comma-separated values in square brackets
 */
function serializeArray(arr) {
  const elements = [];
  
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    const serialized = jsonStringifyBasic(element);
    
    // undefined/function/symbol elements become null in arrays
    if (serialized === undefined) {
      elements.push('null');
    } else {
      elements.push(serialized);
    }
  }
  
  return `[${elements.join(',')}]`;
}

/**
 * Helper to serialize objects
 * Objects in JSON are comma-separated key-value pairs in curly braces
 */
function serializeObject(obj) {
  const pairs = [];
  
  // Iterate through own enumerable properties only
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const serializedValue = jsonStringifyBasic(value);
      
      // Skip undefined/function/symbol values in objects (they're omitted)
      if (serializedValue !== undefined) {
        // Key must always be a string in JSON
        const serializedKey = escapeString(key);
        pairs.push(`${serializedKey}:${serializedValue}`);
      }
    }
  }
  
  return `{${pairs.join(',')}}`;
}

// =======================
// Approach 2: JSON.stringify with Circular Reference Detection
// =======================

/**
 * Enhanced JSON.stringify that detects and handles circular references
 * Prevents infinite recursion by tracking visited objects
 * 
 * This is essential for real-world usage where objects might reference each other
 */
function jsonStringifyWithCircular(value, seen = new WeakSet()) {
  // Handle primitives first (same as basic implementation)
  if (value === null) return 'null';
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') return escapeString(value);
  
  // For objects and arrays, check for circular references
  if (typeof value === 'object') {
    // Circular reference detection
    if (seen.has(value)) {
      throw new TypeError('Converting circular structure to JSON');
    }
    
    // Add current object to seen set
    seen.add(value);
    
    let result;
    
    if (Array.isArray(value)) {
      result = serializeArrayWithCircular(value, seen);
    } else {
      result = serializeObjectWithCircular(value, seen);
    }
    
    // Remove from seen set when done (allows same object in different branches)
    seen.delete(value);
    
    return result;
  }
  
  return 'null';
}

function serializeArrayWithCircular(arr, seen) {
  const elements = [];
  
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    const serialized = jsonStringifyWithCircular(element, seen);
    
    if (serialized === undefined) {
      elements.push('null');
    } else {
      elements.push(serialized);
    }
  }
  
  return `[${elements.join(',')}]`;
}

function serializeObjectWithCircular(obj, seen) {
  const pairs = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const serializedValue = jsonStringifyWithCircular(value, seen);
      
      if (serializedValue !== undefined) {
        const serializedKey = escapeString(key);
        pairs.push(`${serializedKey}:${serializedValue}`);
      }
    }
  }
  
  return `{${pairs.join(',')}}`;
}

// =======================
// Approach 3: Complete JSON.stringify with Replacer and Space
// =======================

/**
 * Full-featured JSON.stringify implementation
 * Supports replacer functions/arrays and space formatting
 * 
 * This matches the native API signature and behavior
 */
function jsonStringifyComplete(value, replacer = null, space = 0) {
  // Normalize space parameter
  let indent = '';
  if (typeof space === 'number') {
    // Clamp space to maximum of 10 (per JSON spec)
    const clampedSpace = Math.min(Math.max(0, Math.floor(space)), 10);
    indent = ' '.repeat(clampedSpace);
  } else if (typeof space === 'string') {
    // Use first 10 characters of string
    indent = space.slice(0, 10);
  }
  
  // Process replacer parameter
  let replacerArray = null;
  let replacerFunction = null;
  
  if (Array.isArray(replacer)) {
    // Replacer array filters which properties to include
    replacerArray = replacer.filter(key => 
      typeof key === 'string' || typeof key === 'number'
    ).map(String);
  } else if (typeof replacer === 'function') {
    replacerFunction = replacer;
  }
  
  // Create serialization context
  const context = {
    replacerArray,
    replacerFunction,
    indent,
    currentIndent: '',
    seen: new WeakSet()
  };
  
  // Start serialization
  return serializeWithContext(value, '', context);
}

function serializeWithContext(value, key, context) {
  // Apply replacer function if provided
  if (context.replacerFunction) {
    value = context.replacerFunction(key, value);
  }
  
  // Handle primitives
  if (value === null) return 'null';
  if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return isFinite(value) ? String(value) : 'null';
  if (typeof value === 'string') return escapeString(value);
  
  // Handle objects with circular reference checking
  if (typeof value === 'object') {
    if (context.seen.has(value)) {
      throw new TypeError('Converting circular structure to JSON');
    }
    
    context.seen.add(value);
    
    let result;
    if (Array.isArray(value)) {
      result = serializeArrayWithContext(value, context);
    } else {
      result = serializeObjectWithContext(value, context);
    }
    
    context.seen.delete(value);
    return result;
  }
  
  return 'null';
}

function serializeArrayWithContext(arr, context) {
  if (arr.length === 0) return '[]';
  
  const elements = [];
  const { indent } = context;
  const oldIndent = context.currentIndent;
  
  if (indent) {
    context.currentIndent += indent;
  }
  
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    const serialized = serializeWithContext(element, String(i), context);
    
    if (serialized === undefined) {
      elements.push('null');
    } else {
      elements.push(serialized);
    }
  }
  
  context.currentIndent = oldIndent;
  
  if (indent) {
    const separator = `,\n${context.currentIndent}${indent}`;
    return `[\n${context.currentIndent}${indent}${elements.join(separator)}\n${context.currentIndent}]`;
  } else {
    return `[${elements.join(',')}]`;
  }
}

function serializeObjectWithContext(obj, context) {
  const pairs = [];
  const { indent, replacerArray } = context;
  const oldIndent = context.currentIndent;
  
  if (indent) {
    context.currentIndent += indent;
  }
  
  // Determine which keys to process
  const keys = replacerArray || Object.keys(obj).filter(key => obj.hasOwnProperty(key));
  
  for (const key of keys) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const serializedValue = serializeWithContext(value, key, context);
      
      if (serializedValue !== undefined) {
        const serializedKey = escapeString(key);
        
        if (indent) {
          pairs.push(`${serializedKey}: ${serializedValue}`);
        } else {
          pairs.push(`${serializedKey}:${serializedValue}`);
        }
      }
    }
  }
  
  context.currentIndent = oldIndent;
  
  if (pairs.length === 0) return '{}';
  
  if (indent) {
    const separator = `,\n${context.currentIndent}${indent}`;
    return `{\n${context.currentIndent}${indent}${pairs.join(separator)}\n${context.currentIndent}}`;
  } else {
    return `{${pairs.join(',')}}`;
  }
}

// =======================
// Approach 4: Basic JSON.parse Implementation
// =======================

/**
 * Basic JSON.parse implementation using recursive descent parsing
 * Builds JavaScript values from JSON string representation
 * 
 * Mental model: Think of this as a state machine that consumes
 * characters and builds up JavaScript values according to JSON grammar
 */
function jsonParseBasic(jsonString) {
  // Remove leading/trailing whitespace
  const trimmed = jsonString.trim();
  
  if (!trimmed) {
    throw new SyntaxError('Unexpected end of JSON input');
  }
  
  // Create parsing context
  const context = {
    json: trimmed,
    index: 0
  };
  
  // Parse the value and ensure we consume the entire string
  const result = parseValue(context);
  skipWhitespace(context);
  
  if (context.index < context.json.length) {
    throw new SyntaxError('Unexpected token in JSON');
  }
  
  return result;
}

/**
 * Parse any JSON value (null, boolean, number, string, array, object)
 */
function parseValue(context) {
  skipWhitespace(context);
  
  const char = context.json[context.index];
  
  // Determine value type by first character
  switch (char) {
    case 'n':
      return parseNull(context);
    case 't':
    case 'f':
      return parseBoolean(context);
    case '"':
      return parseString(context);
    case '[':
      return parseArray(context);
    case '{':
      return parseObject(context);
    default:
      // Numbers can start with -, +, or digits
      if (char === '-' || (char >= '0' && char <= '9')) {
        return parseNumber(context);
      }
      throw new SyntaxError(`Unexpected token ${char}`);
  }
}

/**
 * Parse null literal
 */
function parseNull(context) {
  const nullStr = context.json.slice(context.index, context.index + 4);
  if (nullStr === 'null') {
    context.index += 4;
    return null;
  }
  throw new SyntaxError('Invalid null literal');
}

/**
 * Parse boolean literals (true/false)
 */
function parseBoolean(context) {
  if (context.json.slice(context.index, context.index + 4) === 'true') {
    context.index += 4;
    return true;
  } else if (context.json.slice(context.index, context.index + 5) === 'false') {
    context.index += 5;
    return false;
  }
  throw new SyntaxError('Invalid boolean literal');
}

/**
 * Parse number values including integers, floats, and scientific notation
 */
function parseNumber(context) {
  const start = context.index;
  
  // Handle negative sign
  if (context.json[context.index] === '-') {
    context.index++;
  }
  
  // Parse integer part
  if (context.json[context.index] === '0') {
    // Leading zero only allowed if it's the only digit before decimal
    context.index++;
  } else if (context.json[context.index] >= '1' && context.json[context.index] <= '9') {
    // Parse digits
    while (context.index < context.json.length && 
           context.json[context.index] >= '0' && 
           context.json[context.index] <= '9') {
      context.index++;
    }
  } else {
    throw new SyntaxError('Invalid number');
  }
  
  // Parse decimal part if present
  if (context.json[context.index] === '.') {
    context.index++;
    
    // Must have at least one digit after decimal
    if (context.json[context.index] < '0' || context.json[context.index] > '9') {
      throw new SyntaxError('Invalid number');
    }
    
    while (context.index < context.json.length && 
           context.json[context.index] >= '0' && 
           context.json[context.index] <= '9') {
      context.index++;
    }
  }
  
  // Parse exponent part if present
  if (context.json[context.index] === 'e' || context.json[context.index] === 'E') {
    context.index++;
    
    // Optional sign
    if (context.json[context.index] === '+' || context.json[context.index] === '-') {
      context.index++;
    }
    
    // Must have at least one digit in exponent
    if (context.json[context.index] < '0' || context.json[context.index] > '9') {
      throw new SyntaxError('Invalid number');
    }
    
    while (context.index < context.json.length && 
           context.json[context.index] >= '0' && 
           context.json[context.index] <= '9') {
      context.index++;
    }
  }
  
  // Convert parsed substring to number
  const numberStr = context.json.slice(start, context.index);
  return parseFloat(numberStr);
}

/**
 * Parse string values with proper unescaping
 */
function parseString(context) {
  if (context.json[context.index] !== '"') {
    throw new SyntaxError('Expected string');
  }
  
  context.index++; // Skip opening quote
  let result = '';
  
  while (context.index < context.json.length) {
    const char = context.json[context.index];
    
    if (char === '"') {
      // End of string
      context.index++;
      return result;
    } else if (char === '\\') {
      // Escape sequence
      context.index++;
      const escapeChar = context.json[context.index];
      
      switch (escapeChar) {
        case '"':
          result += '"';
          break;
        case '\\':
          result += '\\';
          break;
        case '/':
          result += '/';
          break;
        case 'b':
          result += '\b';
          break;
        case 'f':
          result += '\f';
          break;
        case 'n':
          result += '\n';
          break;
        case 'r':
          result += '\r';
          break;
        case 't':
          result += '\t';
          break;
        case 'u':
          // Unicode escape sequence \uXXXX
          const hexDigits = context.json.slice(context.index + 1, context.index + 5);
          if (hexDigits.length !== 4 || !/^[0-9a-fA-F]{4}$/.test(hexDigits)) {
            throw new SyntaxError('Invalid unicode escape');
          }
          result += String.fromCharCode(parseInt(hexDigits, 16));
          context.index += 4; // Skip the 4 hex digits
          break;
        default:
          throw new SyntaxError(`Invalid escape sequence \\${escapeChar}`);
      }
      context.index++;
    } else if (char >= ' ') {
      // Regular character (must not be control character)
      result += char;
      context.index++;
    } else {
      throw new SyntaxError('Invalid character in string');
    }
  }
  
  throw new SyntaxError('Unterminated string');
}

/**
 * Parse array values
 */
function parseArray(context) {
  if (context.json[context.index] !== '[') {
    throw new SyntaxError('Expected [');
  }
  
  context.index++; // Skip opening bracket
  skipWhitespace(context);
  
  const result = [];
  
  // Handle empty array
  if (context.json[context.index] === ']') {
    context.index++;
    return result;
  }
  
  // Parse array elements
  while (context.index < context.json.length) {
    // Parse value
    const value = parseValue(context);
    result.push(value);
    
    skipWhitespace(context);
    
    if (context.json[context.index] === ']') {
      // End of array
      context.index++;
      return result;
    } else if (context.json[context.index] === ',') {
      // More elements
      context.index++;
      skipWhitespace(context);
    } else {
      throw new SyntaxError('Expected , or ]');
    }
  }
  
  throw new SyntaxError('Unterminated array');
}

/**
 * Parse object values
 */
function parseObject(context) {
  if (context.json[context.index] !== '{') {
    throw new SyntaxError('Expected {');
  }
  
  context.index++; // Skip opening brace
  skipWhitespace(context);
  
  const result = {};
  
  // Handle empty object
  if (context.json[context.index] === '}') {
    context.index++;
    return result;
  }
  
  // Parse object properties
  while (context.index < context.json.length) {
    // Parse key (must be string)
    skipWhitespace(context);
    
    if (context.json[context.index] !== '"') {
      throw new SyntaxError('Expected string key');
    }
    
    const key = parseString(context);
    
    // Expect colon
    skipWhitespace(context);
    if (context.json[context.index] !== ':') {
      throw new SyntaxError('Expected :');
    }
    context.index++;
    
    // Parse value
    const value = parseValue(context);
    result[key] = value;
    
    skipWhitespace(context);
    
    if (context.json[context.index] === '}') {
      // End of object
      context.index++;
      return result;
    } else if (context.json[context.index] === ',') {
      // More properties
      context.index++;
    } else {
      throw new SyntaxError('Expected , or }');
    }
  }
  
  throw new SyntaxError('Unterminated object');
}

/**
 * Skip whitespace characters (space, tab, newline, carriage return)
 */
function skipWhitespace(context) {
  while (context.index < context.json.length) {
    const char = context.json[context.index];
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      context.index++;
    } else {
      break;
    }
  }
}

// =======================
// Approach 5: JSON.parse with Reviver Function
// =======================

/**
 * Enhanced JSON.parse with reviver function support
 * Allows transformation of parsed values during parsing
 */
function jsonParseWithReviver(jsonString, reviver = null) {
  // First parse normally
  const parsed = jsonParseBasic(jsonString);
  
  // Apply reviver if provided
  if (typeof reviver === 'function') {
    return applyReviver('', parsed, reviver);
  }
  
  return parsed;
}

/**
 * Apply reviver function recursively to parsed structure
 */
function applyReviver(key, value, reviver) {
  // For objects and arrays, recursively apply reviver to children first
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      // Process array elements
      for (let i = 0; i < value.length; i++) {
        const revivedElement = applyReviver(String(i), value[i], reviver);
        if (revivedElement === undefined) {
          delete value[i];
        } else {
          value[i] = revivedElement;
        }
      }
    } else {
      // Process object properties
      for (const prop in value) {
        if (value.hasOwnProperty(prop)) {
          const revivedValue = applyReviver(prop, value[prop], reviver);
          if (revivedValue === undefined) {
            delete value[prop];
          } else {
            value[prop] = revivedValue;
          }
        }
      }
    }
  }
  
  // Apply reviver to current value
  return reviver(key, value);
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== JSON.stringify Examples ===');

// Basic serialization
const basicObj = { name: 'John', age: 30, active: true };
console.log('Basic object:', jsonStringifyBasic(basicObj));

// Array serialization
const basicArray = [1, 'hello', true, null, undefined];
console.log('Basic array:', jsonStringifyBasic(basicArray));

// Special values handling
const specialValues = { 
  infinity: Infinity, 
  nan: NaN, 
  undef: undefined,
  func: function() {},
  symbol: Symbol('test')
};
console.log('Special values:', jsonStringifyBasic(specialValues));

// Circular reference detection
const circular1 = { name: 'obj1' };
const circular2 = { name: 'obj2', ref: circular1 };
circular1.ref = circular2;

try {
  jsonStringifyWithCircular(circular1);
} catch (error) {
  console.log('Circular reference detected:', error.message);
}

// Pretty printing with spaces
const prettyObj = { users: [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }] };
console.log('\nPretty printed:', jsonStringifyComplete(prettyObj, null, 2));

// Using replacer function
const withReplacer = jsonStringifyComplete(
  { password: 'secret', username: 'user123', age: 30 },
  (key, value) => {
    // Hide password field
    if (key === 'password') return '[HIDDEN]';
    return value;
  },
  2
);
console.log('\nWith replacer:', withReplacer);

console.log('\n=== JSON.parse Examples ===');

// Basic parsing
const jsonStr = '{"name":"John","age":30,"active":true}';
console.log('Parsed object:', jsonParseBasic(jsonStr));

// Array parsing
const jsonArray = '[1,"hello",true,null]';
console.log('Parsed array:', jsonParseBasic(jsonArray));

// Complex nested structure
const complexJson = '{"users":[{"name":"Alice","age":25},{"name":"Bob","age":30}],"total":2}';
console.log('Complex parsed:', jsonParseBasic(complexJson));

// Using reviver function (e.g., to parse date strings)
const dateJson = '{"created":"2023-01-01T00:00:00.000Z","name":"Test"}';
const withReviver = jsonParseWithReviver(dateJson, (key, value) => {
  // Convert ISO date strings to Date objects
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
});
console.log('With reviver:', withReviver);

// =======================
// Error Handling Examples
// =======================

console.log('\n=== Error Handling ===');

const errorCases = [
  '{"invalid": }',           // Missing value
  '{"key": "unterminated',   // Unterminated string
  '{key: "value"}',          // Unquoted key
  '[1, 2, 3,]',             // Trailing comma
  '{"a": 1 "b": 2}'         // Missing comma
];

errorCases.forEach((json, index) => {
  try {
    jsonParseBasic(json);
  } catch (error) {
    console.log(`Error case ${index + 1}: ${error.message}`);
  }
});

// =======================
// Performance Comparison
// =======================

function performanceComparison() {
  const testObj = {
    users: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `User${i}`,
      email: `user${i}@example.com`,
      active: i % 2 === 0,
      scores: [i * 10, i * 20, i * 30]
    })),
    metadata: {
      total: 1000,
      created: '2023-01-01T00:00:00.000Z',
      version: '1.0.0'
    }
  };
  
  console.log('\n=== Performance Comparison ===');
  
  // Test stringify performance
  console.time('Custom JSON.stringify');
  const customStringified = jsonStringifyBasic(testObj);
  console.timeEnd('Custom JSON.stringify');
  
  console.time('Native JSON.stringify');
  const nativeStringified = JSON.stringify(testObj);
  console.timeEnd('Native JSON.stringify');
  
  // Test parse performance
  console.time('Custom JSON.parse');
  jsonParseBasic(customStringified);
  console.timeEnd('Custom JSON.parse');
  
  console.time('Native JSON.parse');
  JSON.parse(nativeStringified);
  console.timeEnd('Native JSON.parse');
  
  console.log('Output lengths match:', customStringified.length === nativeStringified.length);
}

// Run performance test
setTimeout(performanceComparison, 2000);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Safe JSON serialization with error handling
 * Handles circular references gracefully instead of throwing
 */
function safeJsonStringify(obj, fallbackValue = null) {
  try {
    return jsonStringifyWithCircular(obj);
  } catch (error) {
    if (error.message.includes('circular')) {
      console.warn('Circular reference detected, returning fallback');
      return jsonStringifyBasic(fallbackValue);
    }
    throw error;
  }
}

/**
 * Use Case 2: JSON with date handling
 * Automatically converts dates to/from ISO strings
 */
class JSONWithDates {
  static stringify(obj) {
    return jsonStringifyComplete(obj, (key, value) => {
      if (value instanceof Date) {
        return { __date: value.toISOString() };
      }
      return value;
    });
  }
  
  static parse(json) {
    return jsonParseWithReviver(json, (key, value) => {
      if (typeof value === 'object' && value !== null && value.__date) {
        return new Date(value.__date);
      }
      return value;
    });
  }
}

// Test date handling
const dateObj = { created: new Date(), name: 'Test' };
const dateSerialized = JSONWithDates.stringify(dateObj);
const dateParsed = JSONWithDates.parse(dateSerialized);
console.log('\nDate handling:', dateParsed.created instanceof Date);

/**
 * Use Case 3: Configuration file parser with comments
 * Strips comments before parsing (JSON doesn't support comments)
 */
function parseJsonWithComments(jsonWithComments) {
  // Remove single-line comments
  const withoutComments = jsonWithComments
    .split('\n')
    .map(line => {
      const commentIndex = line.indexOf('//');
      if (commentIndex !== -1) {
        // Make sure // is not inside a string
        const beforeComment = line.slice(0, commentIndex);
        const quoteCount = (beforeComment.match(/"/g) || []).length;
        if (quoteCount % 2 === 0) {
          // Even number of quotes means // is outside string
          return line.slice(0, commentIndex);
        }
      }
      return line;
    })
    .join('\n');
  
  return jsonParseBasic(withoutComments);
}

// Export all implementations
module.exports = {
  jsonStringifyBasic,
  jsonStringifyWithCircular,
  jsonStringifyComplete,
  jsonParseBasic,
  jsonParseWithReviver,
  safeJsonStringify,
  JSONWithDates,
  parseJsonWithComments
};

/**
 * Key Interview Points:
 * 
 * 1. JSON vs JavaScript Object Differences:
 *    - JSON keys must be strings (quoted)
 *    - No undefined, functions, symbols, or comments
 *    - Numbers cannot be NaN or Infinity
 *    - Trailing commas not allowed
 * 
 * 2. Parsing Challenges:
 *    - Need to handle escape sequences in strings
 *    - Number parsing includes scientific notation
 *    - Whitespace handling between tokens
 *    - Proper error reporting with position information
 * 
 * 3. Serialization Challenges:
 *    - Circular reference detection
 *    - Type coercion for invalid JSON types
 *    - Property filtering (enumerable own properties only)
 *    - String escaping for control characters
 * 
 * 4. Performance Considerations:
 *    - Recursive parsing can cause stack overflow on deep structures
 *    - String concatenation vs array join for large outputs
 *    - WeakSet vs Set for circular reference tracking
 * 
 * 5. Edge Cases:
 *    - Empty input handling
 *    - Unicode character support
 *    - Very large numbers (beyond JavaScript precision)
 *    - Object property ordering (not guaranteed in JSON)
 */