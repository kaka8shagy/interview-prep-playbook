/**
 * File: fundamentals.js
 * Description: Core type coercion concepts and basic examples
 * Time Complexity: O(1) for most coercion operations
 * Space Complexity: O(1) for primitive coercions
 */

// === JavaScript Type System Basics ===
console.log('=== JavaScript Type System ===');

// Primitive types
const primitiveTypes = {
  number: 42,
  string: 'hello',
  boolean: true,
  undefined: undefined,
  null: null,
  bigint: 42n,
  symbol: Symbol('test')
};

Object.entries(primitiveTypes).forEach(([key, value]) => {
  console.log(`${key}: ${value} (type: ${typeof value})`);
});

// === String Coercion Fundamentals ===
console.log('\n=== String Coercion ===');

// Implicit string coercion (+ operator with strings)
function demonstrateStringCoercion() {
  console.log('Implicit with + operator:');
  console.log('Number + String:', 5 + '5');        // "55"
  console.log('Boolean + String:', true + ' fact'); // "true fact"
  console.log('null + String:', null + ' value');   // "null value"
  console.log('Array + String:', [1, 2] + ' items'); // "1,2 items"
  
  console.log('\nExplicit conversion:');
  console.log('String(123):', String(123));         // "123"
  console.log('String(true):', String(true));       // "true"
  console.log('String(null):', String(null));       // "null"
  console.log('String(undefined):', String(undefined)); // "undefined"
  console.log('String([1,2,3]):', String([1, 2, 3])); // "1,2,3"
  
  // toString() method
  console.log('\ntoString() method:');
  console.log('(123).toString():', (123).toString());
  console.log('(true).toString():', (true).toString());
  console.log('[1,2].toString():', [1, 2].toString());
  
  // Template literals (always coerce to string)
  console.log('\nTemplate literals:');
  console.log(`Value: ${123}`);    // "Value: 123"
  console.log(`Boolean: ${true}`); // "Boolean: true"
}

demonstrateStringCoercion();

// === Number Coercion Fundamentals ===
console.log('\n=== Number Coercion ===');

function demonstrateNumberCoercion() {
  console.log('Implicit with arithmetic operators:');
  console.log('String - Number:', '5' - 2);    // 3
  console.log('String * Number:', '5' * 2);    // 10
  console.log('String / Number:', '10' / 2);   // 5
  console.log('String % Number:', '10' % 3);   // 1
  
  console.log('\nUnary + operator:');
  console.log('+"123":', +'123');              // 123
  console.log('+true:', +true);                // 1
  console.log('+false:', +false);              // 0
  console.log('+null:', +null);                // 0
  console.log('+undefined:', +undefined);      // NaN
  console.log('+"" (empty string):', +'');     // 0
  console.log('+[] (empty array):', +[]);      // 0
  console.log('+[5] (single element):', +[5]); // 5
  
  console.log('\nExplicit conversion:');
  console.log('Number("123"):', Number('123'));     // 123
  console.log('Number("123.45"):', Number('123.45')); // 123.45
  console.log('Number("hello"):', Number('hello')); // NaN
  console.log('Number(true):', Number(true));       // 1
  console.log('Number(false):', Number(false));     // 0
  console.log('Number(null):', Number(null));       // 0
  console.log('Number(undefined):', Number(undefined)); // NaN
  
  console.log('\nParsing functions:');
  console.log('parseInt("123px"):', parseInt('123px'));         // 123
  console.log('parseInt("px123"):', parseInt('px123'));         // NaN
  console.log('parseFloat("123.45abc"):', parseFloat('123.45abc')); // 123.45
}

demonstrateNumberCoercion();

// === Boolean Coercion Fundamentals ===
console.log('\n=== Boolean Coercion ===');

function demonstrateBooleanCoercion() {
  // Falsy values (exactly 8)
  const falsyValues = [false, 0, -0, 0n, '', null, undefined, NaN];
  
  console.log('Falsy values:');
  falsyValues.forEach(value => {
    console.log(`${String(value).padEnd(12)}: ${Boolean(value)}`);
  });
  
  // Some truthy values
  const truthyValues = ['0', 'false', [], {}, function() {}, 1, -1, Infinity];
  
  console.log('\nTruthy values:');
  truthyValues.forEach(value => {
    console.log(`${String(value).padEnd(12)}: ${Boolean(value)}`);
  });
  
  console.log('\nImplicit boolean coercion:');
  console.log('!!"hello":', !!'hello');    // true
  console.log('!!"":', !!'');              // false
  console.log('!!0:', !!0);                // false
  console.log('!![]:', !![]);              // true (arrays are truthy!)
  console.log('!!{}:', !!{});              // true (objects are truthy!)
  
  console.log('\nLogical operators (return actual values):');
  console.log('null || "default":', null || 'default');     // "default"
  console.log('"first" || "second":', 'first' || 'second'); // "first"
  console.log('1 && 2:', 1 && 2);                           // 2
  console.log('0 && 2:', 0 && 2);                           // 0
}

demonstrateBooleanCoercion();

// === ToPrimitive Algorithm ===
console.log('\n=== ToPrimitive Algorithm ===');

function demonstrateToPrimitive() {
  // Objects with custom valueOf and toString
  const objWithValueOf = {
    valueOf() { return 42; },
    toString() { return 'custom'; }
  };
  
  const objWithToString = {
    toString() { return 'stringified'; }
  };
  
  const objWithBoth = {
    valueOf() { return 100; },
    toString() { return 'hundred'; }
  };
  
  console.log('Number context (calls valueOf first):');
  console.log('Number(objWithValueOf):', Number(objWithValueOf)); // 42
  console.log('Number(objWithBoth):', Number(objWithBoth));       // 100
  
  console.log('\nString context (calls toString first):');
  console.log('String(objWithValueOf):', String(objWithValueOf)); // "custom"
  console.log('String(objWithBoth):', String(objWithBoth));       // "hundred"
  
  console.log('\nDefault context (usually calls valueOf first):');
  console.log('objWithValueOf + 1:', objWithValueOf + 1);         // 43
  console.log('objWithBoth == 100:', objWithBoth == 100);         // true
}

demonstrateToPrimitive();

// === Common Coercion Rules ===
console.log('\n=== Coercion Rules Summary ===');

const coercionRules = {
  toString: {
    number: 'String representation',
    boolean: '"true" or "false"',
    null: '"null"',
    undefined: '"undefined"',
    object: 'toString() or valueOf() result'
  },
  
  toNumber: {
    string: 'Parse number or NaN',
    boolean: 'true=1, false=0',
    null: '0',
    undefined: 'NaN',
    object: 'valueOf() or toString() then parse'
  },
  
  toBoolean: {
    falsy: 'false, 0, -0, 0n, "", null, undefined, NaN',
    truthy: 'Everything else'
  }
};

Object.entries(coercionRules).forEach(([conversion, rules]) => {
  console.log(`\n${conversion}:`);
  Object.entries(rules).forEach(([from, to]) => {
    console.log(`  ${from}: ${to}`);
  });
});

// Export for testing
module.exports = {
  demonstrateStringCoercion,
  demonstrateNumberCoercion,
  demonstrateBooleanCoercion,
  demonstrateToPrimitive,
  
  // Helper functions
  testCoercion: (value) => ({
    toString: String(value),
    toNumber: Number(value),
    toBoolean: Boolean(value),
    typeOf: typeof value,
    implicit: {
      plusString: value + '',
      unaryPlus: +value,
      doubleNot: !!value
    }
  }),
  
  getFalsyValues: () => [false, 0, -0, 0n, '', null, undefined, NaN],
  getTruthyExamples: () => ['0', 'false', [], {}, function() {}, 1, -1, Infinity]
};