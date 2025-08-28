/**
 * File: coercion-types.js
 * Description: Different types of coercion in JavaScript
 */

// String Coercion
console.log('=== String Coercion ===');

// Implicit string coercion
console.log('Number + String:', 5 + '5'); // "55"
console.log('String + Number:', '5' + 5); // "55" 
console.log('String + Boolean:', 'Value: ' + true); // "Value: true"
console.log('String + null:', 'Value: ' + null); // "Value: null"
console.log('String + undefined:', 'Value: ' + undefined); // "Value: undefined"
console.log('String + Object:', 'Obj: ' + {}); // "Obj: [object Object]"
console.log('String + Array:', 'Array: ' + [1, 2]); // "Array: 1,2"

// Explicit string coercion
console.log('\nExplicit String Conversion:');
console.log('String(123):', String(123)); // "123"
console.log('String(true):', String(true)); // "true"
console.log('String(null):', String(null)); // "null"
console.log('String(undefined):', String(undefined)); // "undefined"
console.log('String([1,2,3]):', String([1, 2, 3])); // "1,2,3"
console.log('(123).toString():', (123).toString()); // "123"
console.log('123 + "":', 123 + ''); // "123"

// Number Coercion
console.log('\n=== Number Coercion ===');

// Implicit number coercion
console.log('String - Number:', '5' - 2); // 3
console.log('String * Number:', '5' * 2); // 10
console.log('String / Number:', '10' / 2); // 5
console.log('Unary +:', +'123'); // 123
console.log('Unary + on true:', +true); // 1
console.log('Unary + on false:', +false); // 0
console.log('Unary + on null:', +null); // 0
console.log('Unary + on undefined:', +undefined); // NaN
console.log('Unary + on empty string:', +''); // 0
console.log('Unary + on array:', +[5]); // 5
console.log('Unary + on empty array:', +[]); // 0

// Explicit number coercion
console.log('\nExplicit Number Conversion:');
console.log('Number("123"):', Number('123')); // 123
console.log('Number("123.45"):', Number('123.45')); // 123.45
console.log('Number("hello"):', Number('hello')); // NaN
console.log('Number(true):', Number(true)); // 1
console.log('Number(false):', Number(false)); // 0
console.log('Number(null):', Number(null)); // 0
console.log('Number(undefined):', Number(undefined)); // NaN
console.log('Number([]):', Number([])); // 0
console.log('Number([5]):', Number([5])); // 5
console.log('Number([1,2]):', Number([1, 2])); // NaN
console.log('parseInt("123px"):', parseInt('123px')); // 123
console.log('parseFloat("123.45abc"):', parseFloat('123.45abc')); // 123.45

// Boolean Coercion
console.log('\n=== Boolean Coercion ===');

// Implicit boolean coercion
if ('') {
  console.log('Empty string is truthy');
} else {
  console.log('Empty string is falsy'); // This executes
}

console.log('!! operator (double negation):');
console.log('!!"":', !!'' ); // false
console.log('!!"hello":', !!'hello'); // true
console.log('!!0:', !!0); // false
console.log('!!1:', !!1); // true
console.log('!!null:', !!null); // false
console.log('!!undefined:', !!undefined); // false
console.log('!!NaN:', !!NaN); // false
console.log('!![]:', !![]); // true (arrays are truthy!)
console.log('!!{}:', !!{}); // true (objects are truthy!)

// Explicit boolean coercion
console.log('\nExplicit Boolean Conversion:');
console.log('Boolean(0):', Boolean(0)); // false
console.log('Boolean(1):', Boolean(1)); // true
console.log('Boolean(""):', Boolean('')); // false
console.log('Boolean("0"):', Boolean('0')); // true (non-empty string)
console.log('Boolean("false"):', Boolean('false')); // true (non-empty string)
console.log('Boolean([]):', Boolean([])); // true
console.log('Boolean({}):', Boolean({})); // true
console.log('Boolean(null):', Boolean(null)); // false
console.log('Boolean(undefined):', Boolean(undefined)); // false
console.log('Boolean(NaN):', Boolean(NaN)); // false

// Special Cases
console.log('\n=== Special Cases ===');

// Array coercion
const arr = [1, 2, 3];
console.log('Array to String:', String(arr)); // "1,2,3"
console.log('Array to Number:', Number(arr)); // NaN
console.log('Empty Array to Number:', Number([])); // 0
console.log('Single element array to Number:', Number([5])); // 5

// Object coercion
const obj = { 
  valueOf() { return 42; },
  toString() { return 'custom'; }
};
console.log('Object with valueOf to Number:', Number(obj)); // 42
console.log('Object with toString to String:', String(obj)); // "custom"

// Date coercion
const date = new Date('2024-01-01');
console.log('Date to Number:', Number(date)); // timestamp
console.log('Date to String:', String(date)); // date string
console.log('Date with +:', +date); // timestamp

// Function coercion
function myFunc() { return 'hello'; }
console.log('Function to String:', String(myFunc)); // function source
console.log('Function to Number:', Number(myFunc)); // NaN
console.log('Function to Boolean:', Boolean(myFunc)); // true

// Symbol coercion (special case - mostly throws errors)
const sym = Symbol('test');
console.log('Symbol to String explicitly:', String(sym)); // "Symbol(test)"
// console.log('Symbol + string:', sym + ''); // TypeError!
// console.log('Symbol to Number:', Number(sym)); // TypeError!
console.log('Symbol to Boolean:', Boolean(sym)); // true

module.exports = {
  demonstrateStringCoercion: () => console.log(5 + '5'),
  demonstrateNumberCoercion: () => console.log('5' - 2),
  demonstrateBooleanCoercion: () => console.log(!!'hello')
};