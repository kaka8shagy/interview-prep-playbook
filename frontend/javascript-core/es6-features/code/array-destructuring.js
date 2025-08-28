/**
 * File: array-destructuring.js
 * Description: Array destructuring patterns and use cases
 * Demonstrates various array destructuring techniques
 */

console.log('=== Basic Array Destructuring ===');

// Basic array destructuring
const numbers = [1, 2, 3, 4, 5];
const [first, second] = numbers;
console.log('First:', first, 'Second:', second); // 1, 2

// Skipping elements
const [a, , c] = numbers;
console.log('a:', a, 'c:', c); // 1, 3

// Rest operator
const [head, ...tail] = numbers;
console.log('Head:', head, 'Tail:', tail); // 1, [2, 3, 4, 5]

// Default values
const [x = 10, y = 20, z = 30] = [1, 2];
console.log('x:', x, 'y:', y, 'z:', z); // 1, 2, 30

console.log('\n=== Advanced Array Destructuring ===');

// Nested array destructuring
const nestedArray = [[1, 2], [3, 4], [5, 6]];
const [[firstFirst, firstSecond], [secondFirst]] = nestedArray;
console.log(firstFirst, firstSecond, secondFirst); // 1, 2, 3

// Mixed with rest
const [firstPair, ...restPairs] = nestedArray;
console.log('First pair:', firstPair); // [1, 2]
console.log('Rest pairs:', restPairs); // [[3, 4], [5, 6]]

// Function return destructuring
function getCoordinates() {
  return [10, 20, 30];
}

const [coordX, coordY, coordZ = 0] = getCoordinates();
console.log(`Coordinates: (${coordX}, ${coordY}, ${coordZ})`); // (10, 20, 30)

console.log('\n=== Practical Use Cases ===');

// Swapping variables
let var1 = 'hello';
let var2 = 'world';
console.log('Before swap:', var1, var2);

[var1, var2] = [var2, var1];
console.log('After swap:', var1, var2);

// Multiple return values
function divide(dividend, divisor) {
  return [Math.floor(dividend / divisor), dividend % divisor];
}

const [quotient, remainder] = divide(17, 5);
console.log(`17 ÷ 5 = ${quotient} remainder ${remainder}`); // 3 remainder 2

// Array-like objects destructuring
function processArguments() {
  const [firstArg, secondArg, ...restArgs] = arguments;
  console.log('First:', firstArg);
  console.log('Second:', secondArg);
  console.log('Rest:', restArgs);
}

processArguments('a', 'b', 'c', 'd');

// String destructuring
const word = 'hello';
const [firstChar, secondChar, ...restChars] = word;
console.log('First char:', firstChar); // 'h'
console.log('Second char:', secondChar); // 'e'
console.log('Rest chars:', restChars); // ['l', 'l', 'o']

console.log('\n=== Interview Questions ===');

// Q1: Extract first and last elements
const extractFirstLast = (arr) => {
  const [first, ...middle] = arr;
  const last = middle.pop();
  return { first, last, middle };
};

console.log('Extract first/last:', extractFirstLast([1, 2, 3, 4, 5]));

// Q2: Implement array rotation
const rotateLeft = (arr, positions = 1) => {
  const [head, ...tail] = arr.slice(positions);
  return [...tail, ...arr.slice(0, positions)];
};

console.log('Rotate left:', rotateLeft([1, 2, 3, 4, 5], 2)); // [3, 4, 5, 1, 2]

// Q3: Flatten one level
const flattenOne = (arr) => {
  const flattened = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      flattened.push(...item);
    } else {
      flattened.push(item);
    }
  }
  return flattened;
};

console.log('Flatten one:', flattenOne([1, [2, 3], 4, [5, 6]])); // [1, 2, 3, 4, 5, 6]

module.exports = {
  extractFirstLast,
  rotateLeft,
  flattenOne
};