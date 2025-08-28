/**
 * File: generator-basics.js
 * Description: Basic generator function syntax and usage
 */

// === Basic Generator Function ===
console.log('=== Basic Generator Function ===\n');

// Generator function declaration
function* simpleGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

// Create generator object
const gen = simpleGenerator();

// Call next() to get values
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// === Generator with Logic ===
console.log('\n=== Generator with Logic ===\n');

function* generatorWithLogic() {
  console.log('Generator started');
  
  yield 'First yield';
  console.log('After first yield');
  
  yield 'Second yield';
  console.log('After second yield');
  
  return 'Generator done'; // Return value
}

const gen2 = generatorWithLogic();
console.log('Before calling next()');
console.log(gen2.next()); // Logs: "Generator started", returns: { value: 'First yield', done: false }
console.log(gen2.next()); // Logs: "After first yield", returns: { value: 'Second yield', done: false }
console.log(gen2.next()); // Logs: "After second yield", returns: { value: 'Generator done', done: true }

// === Generator Expressions ===
console.log('\n=== Generator Expressions ===\n');

// Generator function expression
const genExpr = function* () {
  yield 'anonymous';
};

// Generator method in object
const obj = {
  *generatorMethod() {
    yield 'method';
  },
  
  // ES6 method syntax
  *['computed' + 'Name']() {
    yield 'computed';
  }
};

console.log(genExpr().next()); // { value: 'anonymous', done: false }
console.log(obj.generatorMethod().next()); // { value: 'method', done: false }
console.log(obj.computedName().next()); // { value: 'computed', done: false }

// === Generator in Class ===
console.log('\n=== Generator in Class ===\n');

class MyClass {
  *generator() {
    yield 'instance method';
  }
  
  static *staticGenerator() {
    yield 'static method';
  }
  
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  }
}

const instance = new MyClass();
console.log(instance.generator().next()); // { value: 'instance method', done: false }
console.log(MyClass.staticGenerator().next()); // { value: 'static method', done: false }

// Class is iterable due to Symbol.iterator
for (const value of instance) {
  console.log('Iterable value:', value);
}

// === Yield with Expressions ===
console.log('\n=== Yield with Expressions ===\n');

function* expressionGenerator() {
  const a = yield 1 + 1;
  console.log('Received:', a);
  
  const b = yield a * 2;
  console.log('Received:', b);
  
  return a + b;
}

const gen3 = expressionGenerator();
console.log(gen3.next());       // { value: 2, done: false }
console.log(gen3.next(10));     // Sends 10, logs "Received: 10", { value: 20, done: false }
console.log(gen3.next(5));      // Sends 5, logs "Received: 5", { value: 15, done: true }

// === Multiple Generators ===
console.log('\n=== Multiple Generators ===\n');

function* gen1() {
  yield 'a';
  yield 'b';
}

function* gen2() {
  yield 'c';
  yield 'd';
}

// Each call creates new generator
const g1a = gen1();
const g1b = gen1();
const g2a = gen2();

console.log(g1a.next().value); // 'a'
console.log(g1b.next().value); // 'a' (independent)
console.log(g2a.next().value); // 'c'
console.log(g1a.next().value); // 'b'
console.log(g1b.next().value); // 'b'

// === Generator State ===
console.log('\n=== Generator State ===\n');

function* stateGenerator() {
  let count = 0;
  while (true) {
    const reset = yield ++count;
    if (reset) {
      count = 0;
    }
  }
}

const counter = stateGenerator();
console.log(counter.next().value);      // 1
console.log(counter.next().value);      // 2
console.log(counter.next().value);      // 3
console.log(counter.next(true).value);  // Reset, returns 1
console.log(counter.next().value);      // 2

// === Early Return ===
console.log('\n=== Early Return ===\n');

function* earlyReturn() {
  yield 1;
  yield 2;
  return 'early'; // Return stops generator
  yield 3; // Never reached
}

const gen4 = earlyReturn();
console.log(gen4.next()); // { value: 1, done: false }
console.log(gen4.next()); // { value: 2, done: false }
console.log(gen4.next()); // { value: 'early', done: true }
console.log(gen4.next()); // { value: undefined, done: true }

// === Using for...of ===
console.log('\n=== Using for...of ===\n');

function* forOfGenerator() {
  yield 'one';
  yield 'two';
  yield 'three';
  return 'four'; // Return value not included in for...of
}

// for...of automatically calls next()
for (const value of forOfGenerator()) {
  console.log('for...of value:', value);
}
// Output: one, two, three (not four!)

// === Spread Operator ===
console.log('\n=== Spread Operator ===\n');

function* spreadGenerator() {
  yield* [1, 2];
  yield 3;
}

const array = [...spreadGenerator()];
console.log('Spread result:', array); // [1, 2, 3]

// === Array.from ===
console.log('\n=== Array.from ===\n');

function* arrayFromGenerator() {
  yield 'x';
  yield 'y';
  yield 'z';
}

const arr = Array.from(arrayFromGenerator());
console.log('Array.from result:', arr); // ['x', 'y', 'z']

module.exports = {
  simpleGenerator,
  generatorWithLogic,
  MyClass,
  stateGenerator
};