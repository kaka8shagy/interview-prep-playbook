/**
 * File: basic-generator.js
 * Description: Basic generator function examples and concepts
 */

// Basic generator function
function* simpleGenerator() {
  console.log('Generator started');
  yield 1;
  console.log('After first yield');
  yield 2;
  console.log('After second yield');
  yield 3;
  console.log('Generator finished');
}

// Using the generator
console.log('=== Basic Generator ===');
const gen = simpleGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// Generator with return value
function* generatorWithReturn() {
  yield 'first';
  yield 'second';
  return 'final';
}

console.log('\n=== Generator with Return ===');
const gen2 = generatorWithReturn();
console.log(gen2.next()); // { value: 'first', done: false }
console.log(gen2.next()); // { value: 'second', done: false }
console.log(gen2.next()); // { value: 'final', done: true }

// Infinite generator
function* infiniteSequence() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

console.log('\n=== Infinite Generator ===');
const infinite = infiniteSequence();
console.log(infinite.next().value); // 0
console.log(infinite.next().value); // 1
console.log(infinite.next().value); // 2

// Generator as iterator
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

console.log('\n=== Generator as Iterator ===');
for (const value of range(1, 5)) {
  console.log(value); // 1, 2, 3, 4, 5
}

// Generator expressions (arrow function style)
const arrowGen = function* () {
  yield 'arrow';
  yield 'generator';
};

// Generator methods in objects
const obj = {
  *generator() {
    yield 'method';
    yield 'generator';
  }
};

module.exports = {
  simpleGenerator,
  generatorWithReturn,
  infiniteSequence,
  range,
  arrowGen,
  obj
};