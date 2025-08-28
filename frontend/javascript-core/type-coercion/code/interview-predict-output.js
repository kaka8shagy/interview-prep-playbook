/**
 * File: interview-predict-output.js
 * Description: Common interview questions - predict coercion output
 * Tests understanding of type coercion rules
 */

// Question 1: Basic coercion
console.log('=== Question 1: Basic Coercion ===');
console.log(1 + '2' + 3); // ?
console.log(1 + 2 + '3'); // ?
console.log('1' + 2 + 3); // ?
console.log('1' - 2 + 3); // ?

// Answers:
console.log('Answers: "123", "33", "123", 2\n');

// Question 2: Boolean coercion
console.log('=== Question 2: Boolean Coercion ===');
console.log(true + true); // ?
console.log(true + false); // ?
console.log(true + ''); // ?
console.log(false + ''); // ?
console.log('true' + false); // ?

// Answers:
console.log('Answers: 2, 1, "true", "false", "truefalse"\n');

// Question 3: Equality comparisons
console.log('=== Question 3: Equality Comparisons ===');
console.log(0 == false); // ?
console.log('' == false); // ?
console.log([] == false); // ?
console.log([] == ![]); // ?
console.log(null == undefined); // ?
console.log(null == 0); // ?

// Answers:
console.log('Answers: true, true, true, true, true, false\n');

// Question 4: NaN comparisons
console.log('=== Question 4: NaN Comparisons ===');
console.log(NaN == NaN); // ?
console.log(NaN === NaN); // ?
console.log(Object.is(NaN, NaN)); // ?
console.log(isNaN('hello')); // ?
console.log(Number.isNaN('hello')); // ?

// Answers:
console.log('Answers: false, false, true, true, false\n');

// Question 5: Array coercion
console.log('=== Question 5: Array Coercion ===');
console.log([1] + [2]); // ?
console.log([1, 2] + [3, 4]); // ?
console.log([] + {}); // ?
console.log({} + []); // ?
console.log([] + []); // ?
console.log([1] == 1); // ?

// Answers:
console.log('Answers: "12", "1,23,4", "[object Object]", 0 or "[object Object]", "", true\n');

// Question 6: Object coercion
console.log('=== Question 6: Object Coercion ===');
console.log({} + 1); // ?
console.log(1 + {}); // ?
console.log({} + {}); // ?
console.log({} == '[object Object]'); // ?
console.log({valueOf: () => 2} + 3); // ?

// Answers:
console.log('Answers: 1 or "[object Object]1", "1[object Object]", "[object Object][object Object]" or NaN, false, 5\n');

// Question 7: Tricky coercions
console.log('=== Question 7: Tricky Coercions ===');
console.log('5' + 3 - 2); // ?
console.log('5' - 3 + 2); // ?
console.log(+''); // ?
console.log(+[]); // ?
console.log(+[1]); // ?
console.log(+[1, 2]); // ?

// Answers:
console.log('Answers: 51, 4, 0, 0, 1, NaN\n');

// Question 8: Logical operators
console.log('=== Question 8: Logical Operators ===');
console.log(null || 'default'); // ?
console.log(undefined || 'default'); // ?
console.log(0 || 'default'); // ?
console.log('' || 'default'); // ?
console.log('first' || 'second'); // ?
console.log(1 && 2); // ?
console.log(0 && 2); // ?

// Answers:
console.log('Answers: "default", "default", "default", "default", "first", 2, 0\n');

// Question 9: Complex expressions
console.log('=== Question 9: Complex Expressions ===');
console.log([] == ![]); // Step by step: ![] = false, [] == false = true
console.log([] + null + 1); // "" + null + 1 = "null" + 1 = "null1"
console.log([1, 2, 3] == [1, 2, 3]); // Different objects
console.log({} + [] + {} + [1]); // Complex!
console.log(!+[]+[]+![]); // Very tricky!

// Answers:
console.log('Answers: true, "null1", false, "0[object Object]1" or "[object Object][object Object]1", "truefalse"\n');

// Question 10: Comparison operators
console.log('=== Question 10: Comparison Operators ===');
console.log('2' > 1); // ?
console.log('02' == 2); // ?
console.log('02' === 2); // ?
console.log(false == 0); // ?
console.log(false === 0); // ?
console.log(null >= 0); // ?
console.log(null == 0); // ?

// Answers:
console.log('Answers: true, true, false, true, false, true, false\n');

// Bonus: The wat examples
console.log('=== Bonus: JavaScript WAT ===');
console.log([] + {}); // "[object Object]"
console.log({} + []); // 0 (in console) or "[object Object]" (in script)
console.log([] + []); // ""
console.log({} + {}); // "[object Object][object Object]" or NaN
console.log(Array(16).join('wat' - 1) + ' Batman!'); // "NaNNaNNaN..." Batman!
console.log('b' + 'a' + +'a' + 'a'); // "baNaNa"

// Function to test understanding
function testCoercionKnowledge(value) {
  const results = {
    toNumber: +value,
    toString: String(value),
    toBoolean: !!value,
    isEqualToTrue: value == true,
    isEqualToFalse: value == false,
    isEqualToOne: value == 1,
    isEqualToZero: value == 0,
    isEqualToEmptyString: value == '',
    isTruthy: !!value,
    typeOf: typeof value
  };
  
  return results;
}

// Test with various values
console.log('\n=== Test Your Understanding ===');
const testValues = [[], {}, '', '0', 0, null, undefined, NaN, false];
testValues.forEach(val => {
  console.log(`\nTesting ${String(val)}:`, testCoercionKnowledge(val));
});

module.exports = { testCoercionKnowledge };