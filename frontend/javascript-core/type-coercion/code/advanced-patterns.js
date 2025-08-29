/**
 * File: advanced-patterns.js
 * Description: Advanced type coercion patterns and edge cases
 * Time Complexity: Varies by operation
 * Space Complexity: O(1) for most operations
 */

// === Equality Comparison Algorithm ===
console.log('=== Equality Comparison Algorithm ===');

// The Abstract Equality Comparison (==) algorithm
function simulateEqualityComparison(x, y) {
  // Simplified version of the == algorithm
  console.log(`Comparing ${x} == ${y}:`);
  
  // 1. If types are the same, use strict equality
  if (typeof x === typeof y) {
    console.log('  Same types, using === comparison');
    return x === y;
  }
  
  // 2. null and undefined are equal to each other only
  if ((x === null && y === undefined) || (x === undefined && y === null)) {
    console.log('  null == undefined special case');
    return true;
  }
  
  // 3. Number and string comparison
  if (typeof x === 'number' && typeof y === 'string') {
    console.log('  Converting string to number');
    return x === Number(y);
  }
  if (typeof x === 'string' && typeof y === 'number') {
    console.log('  Converting string to number');
    return Number(x) === y;
  }
  
  // 4. Boolean conversion
  if (typeof x === 'boolean') {
    console.log('  Converting boolean to number');
    return Number(x) == y;
  }
  if (typeof y === 'boolean') {
    console.log('  Converting boolean to number');
    return x == Number(y);
  }
  
  // 5. Object conversion
  if ((typeof x === 'string' || typeof x === 'number') && typeof y === 'object') {
    console.log('  Converting object to primitive');
    return x == toPrimitive(y);
  }
  if (typeof x === 'object' && (typeof y === 'string' || typeof y === 'number')) {
    console.log('  Converting object to primitive');
    return toPrimitive(x) == y;
  }
  
  return false;
}

// Simplified ToPrimitive
function toPrimitive(obj, hint = 'default') {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (hint === 'string' && typeof obj.toString === 'function') {
    return obj.toString();
  }
  
  if (typeof obj.valueOf === 'function') {
    const primitive = obj.valueOf();
    if (typeof primitive !== 'object') {
      return primitive;
    }
  }
  
  if (typeof obj.toString === 'function') {
    return obj.toString();
  }
  
  throw new TypeError('Cannot convert object to primitive value');
}

// Test complex equality cases
const complexEqualityTests = [
  [[], false],    // [] == false
  [[], ![]],      // [] == ![] 
  [[1], 1],       // [1] == 1
  [null, undefined], // null == undefined
  [0, false],     // 0 == false
  ['', false],    // '' == false
  [null, 0],      // null == 0 (false!)
];

complexEqualityTests.forEach(([a, b]) => {
  console.log(`${JSON.stringify(a)} == ${JSON.stringify(b)}: ${a == b}`);
});

// === Advanced Object Coercion ===
console.log('\n=== Advanced Object Coercion ===');

class CustomCoercion {
  constructor(value) {
    this.value = value;
  }
  
  // Controls number coercion and default hint
  valueOf() {
    console.log('valueOf() called');
    return this.value;
  }
  
  // Controls string coercion
  toString() {
    console.log('toString() called');
    return `CustomCoercion(${this.value})`;
  }
  
  // Symbol.toPrimitive has highest priority
  [Symbol.toPrimitive](hint) {
    console.log(`Symbol.toPrimitive called with hint: ${hint}`);
    if (hint === 'number') {
      return this.value;
    }
    if (hint === 'string') {
      return `Custom(${this.value})`;
    }
    // Default hint
    return this.value;
  }
}

const custom = new CustomCoercion(42);

console.log('Number conversion:');
console.log(Number(custom));

console.log('\nString conversion:');
console.log(String(custom));

console.log('\nAddition (default hint):');
console.log(custom + 1);

console.log('\nTemplate literal (string hint):');
console.log(`Value: ${custom}`);

// === Date Coercion Edge Cases ===
console.log('\n=== Date Coercion ===');

const date = new Date('2024-01-01T00:00:00Z');

console.log('Date coercion patterns:');
console.log('Date to String:', String(date));
console.log('Date to Number:', Number(date));
console.log('Date + 1:', date + 1);          // String concatenation
console.log('Date - 1:', date - 1);          // Numeric subtraction
console.log('+Date:', +date);                // Numeric conversion
console.log('Date == timestamp:', date == date.getTime()); // false (different types)

// === Array Coercion Complexities ===
console.log('\n=== Array Coercion Complexities ===');

function demonstrateArrayCoercion() {
  console.log('Array to string conversion:');
  console.log('[] + "":', [] + '');           // ""
  console.log('[1] + "":', [1] + '');         // "1"
  console.log('[1,2] + "":', [1, 2] + '');    // "1,2"
  
  console.log('\nArray to number conversion:');
  console.log('+[]:', +[]);                   // 0
  console.log('+[1]:', +[1]);                 // 1
  console.log('+[1,2]:', +[1, 2]);            // NaN
  
  console.log('\nArray arithmetic:');
  console.log('[1] + [2]:', [1] + [2]);       // "12"
  console.log('[1] - [2]:', [1] - [2]);       // -1
  console.log('[1] * [2]:', [1] * [2]);       // 2
  
  // Nested arrays
  console.log('\nNested array coercion:');
  const nested = [[1], [2]];
  console.log('nested + "":', nested + '');    // "1,2"
  console.log('+nested:', +nested);           // NaN
}

demonstrateArrayCoercion();

// === Symbol and BigInt Coercion ===
console.log('\n=== Symbol and BigInt Coercion ===');

function demonstrateModernTypes() {
  const sym = Symbol('test');
  const bigNum = 42n;
  
  console.log('Symbol coercion:');
  console.log('String(symbol):', String(sym));     // Works
  console.log('Boolean(symbol):', Boolean(sym));   // true
  
  try {
    console.log('Number(symbol):', Number(sym));   // TypeError!
  } catch (e) {
    console.log('Number(symbol): TypeError -', e.message);
  }
  
  try {
    console.log('symbol + "":', sym + '');         // TypeError!
  } catch (e) {
    console.log('symbol + "": TypeError -', e.message);
  }
  
  console.log('\nBigInt coercion:');
  console.log('String(bigint):', String(bigNum));  // "42"
  console.log('Boolean(bigint):', Boolean(bigNum)); // true
  console.log('Boolean(0n):', Boolean(0n));        // false
  
  try {
    console.log('Number(bigint):', Number(bigNum)); // TypeError!
  } catch (e) {
    console.log('Number(bigint): TypeError -', e.message);
  }
}

demonstrateModernTypes();

// === Template Literal Coercion ===
console.log('\n=== Template Literal Coercion ===');

function demonstrateTemplateLiterals() {
  const values = [null, undefined, 0, false, [], {}, Symbol('test')];
  
  console.log('Template literal coercion (always toString):');
  values.forEach(value => {
    try {
      console.log(`${typeof value}: "${value}"`);
    } catch (e) {
      console.log(`${typeof value}: Error - ${e.message}`);
    }
  });
}

demonstrateTemplateLiterals();

// === Coercion Performance Patterns ===
console.log('\n=== Performance Considerations ===');

function benchmarkCoercion() {
  const iterations = 1000000;
  const testValue = '123';
  
  console.log(`Benchmarking ${iterations} iterations...`);
  
  // String to number conversion methods
  console.time('Number()');
  for (let i = 0; i < iterations; i++) {
    Number(testValue);
  }
  console.timeEnd('Number()');
  
  console.time('parseInt()');
  for (let i = 0; i < iterations; i++) {
    parseInt(testValue, 10);
  }
  console.timeEnd('parseInt()');
  
  console.time('Unary +');
  for (let i = 0; i < iterations; i++) {
    +testValue;
  }
  console.timeEnd('Unary +');
  
  console.time('parseFloat()');
  for (let i = 0; i < iterations; i++) {
    parseFloat(testValue);
  }
  console.timeEnd('parseFloat()');
}

// Uncomment to run benchmark
// benchmarkCoercion();

// === Complex Coercion Chains ===
console.log('\n=== Complex Coercion Chains ===');

function demonstrateComplexChains() {
  console.log('Analyzing complex expressions:');
  
  // The famous JavaScript WAT examples
  const expressions = [
    '[] + {}',
    '{} + []',
    '[] + []',
    '{} + {}',
    '!+[]+[]+![]',
    '"b" + "a" + +"a" + "a"',
    'Array(16).join("wat" - 1)'
  ];
  
  expressions.forEach(expr => {
    try {
      const result = eval(expr);
      console.log(`${expr} = ${JSON.stringify(result)}`);
    } catch (e) {
      console.log(`${expr} = Error: ${e.message}`);
    }
  });
  
  // Breaking down !+[]+[]+![]
  console.log('\nBreaking down !+[]+[]+![]:');
  console.log('Step 1: +[] =', +[]);           // 0
  console.log('Step 2: !+[] =', !+[]);         // true
  console.log('Step 3: ![] =', ![]);           // false
  console.log('Step 4: true + [] =', true + []); // "true"
  console.log('Step 5: "true" + false =', "true" + false); // "truefalse"
}

demonstrateComplexChains();

// Export utilities for testing
module.exports = {
  simulateEqualityComparison,
  toPrimitive,
  CustomCoercion,
  
  // Complex test cases
  runComplexEqualityTests: () => complexEqualityTests.map(([a, b]) => ({
    a, b, result: a == b, strict: a === b
  })),
  
  // Edge case testers
  testCoercionEdgeCases: (value) => ({
    original: value,
    typeof: typeof value,
    toString: (() => {
      try { return String(value); }
      catch (e) { return `Error: ${e.message}`; }
    })(),
    toNumber: (() => {
      try { return Number(value); }
      catch (e) { return `Error: ${e.message}`; }
    })(),
    toBoolean: Boolean(value),
    unaryPlus: (() => {
      try { return +value; }
      catch (e) { return `Error: ${e.message}`; }
    })(),
    stringConcat: (() => {
      try { return value + ''; }
      catch (e) { return `Error: ${e.message}`; }
    })()
  }),
  
  benchmarkCoercion
};