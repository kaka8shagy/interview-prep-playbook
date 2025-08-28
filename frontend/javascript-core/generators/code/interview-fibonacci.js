/**
 * File: interview-fibonacci.js
 * Description: Implement Fibonacci generator - common interview question
 * Tests understanding of infinite sequences and generator state
 */

// === Basic Fibonacci Generator ===
function* fibonacci() {
  let prev = 0;
  let curr = 1;
  
  // First two numbers
  yield prev;
  yield curr;
  
  // Generate infinite sequence
  while (true) {
    const next = prev + curr;
    yield next;
    prev = curr;
    curr = next;
  }
}

// === Limited Fibonacci Generator ===
function* fibonacciLimit(max) {
  let prev = 0;
  let curr = 1;
  
  if (max >= 0) yield prev;
  if (max >= 1) yield curr;
  
  while (curr < max) {
    const next = prev + curr;
    if (next > max) break;
    yield next;
    prev = curr;
    curr = next;
  }
}

// === Fibonacci with Index ===
function* fibonacciWithIndex() {
  let prev = 0;
  let curr = 1;
  let index = 0;
  
  yield { index: index++, value: prev };
  yield { index: index++, value: curr };
  
  while (true) {
    const next = prev + curr;
    yield { index: index++, value: next };
    prev = curr;
    curr = next;
  }
}

// === Memoized Fibonacci Generator ===
function* memoizedFibonacci() {
  const cache = [0, 1];
  let index = 0;
  
  while (true) {
    if (index < cache.length) {
      yield cache[index++];
    } else {
      const next = cache[cache.length - 1] + cache[cache.length - 2];
      cache.push(next);
      yield cache[index++];
    }
  }
}

// === Resettable Fibonacci Generator ===
function* resettableFibonacci() {
  let prev = 0;
  let curr = 1;
  let shouldReset = false;
  
  while (true) {
    if (shouldReset) {
      prev = 0;
      curr = 1;
      shouldReset = false;
    }
    
    const command = yield prev;
    
    if (command === 'reset') {
      shouldReset = true;
    } else {
      const temp = prev;
      prev = curr;
      curr = temp + curr;
    }
  }
}

// === Fibonacci Variations ===
function* fibonacciVariations(a = 0, b = 1) {
  // Generalized Fibonacci with custom starting values
  yield a;
  yield b;
  
  while (true) {
    const next = a + b;
    yield next;
    a = b;
    b = next;
  }
}

// Lucas numbers (2, 1, 3, 4, 7, 11, ...)
function* lucasNumbers() {
  yield* fibonacciVariations(2, 1);
}

// === Test Functions ===
console.log('=== Basic Fibonacci Generator ===');
const fib = fibonacci();
const first10 = [];
for (let i = 0; i < 10; i++) {
  first10.push(fib.next().value);
}
console.log('First 10 Fibonacci numbers:', first10);
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

console.log('\n=== Limited Fibonacci (max 100) ===');
const fibLimited = fibonacciLimit(100);
const limited = [...fibLimited];
console.log('Fibonacci up to 100:', limited);
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

console.log('\n=== Fibonacci with Index ===');
const fibIndexed = fibonacciWithIndex();
for (let i = 0; i < 5; i++) {
  const { value } = fibIndexed.next();
  console.log(`F(${value.index}) = ${value.value}`);
}

console.log('\n=== Nth Fibonacci Number ===');
function getNthFibonacci(n) {
  const gen = fibonacci();
  let result;
  for (let i = 0; i <= n; i++) {
    result = gen.next().value;
  }
  return result;
}
console.log('10th Fibonacci:', getNthFibonacci(10)); // 55
console.log('15th Fibonacci:', getNthFibonacci(15)); // 610

console.log('\n=== Fibonacci Until Condition ===');
function* fibonacciUntil(predicate) {
  const gen = fibonacci();
  let value = gen.next().value;
  
  while (predicate(value)) {
    yield value;
    value = gen.next().value;
  }
}

const untilGreater1000 = fibonacciUntil(n => n < 1000);
console.log('Fibonacci < 1000:', [...untilGreater1000]);

console.log('\n=== Resettable Fibonacci ===');
const resetFib = resettableFibonacci();
console.log('Value 1:', resetFib.next().value); // 0
console.log('Value 2:', resetFib.next().value); // 1
console.log('Value 3:', resetFib.next().value); // 1
console.log('Reset and get value:', resetFib.next('reset').value); // 0
console.log('After reset:', resetFib.next().value); // 1

console.log('\n=== Lucas Numbers ===');
const lucas = lucasNumbers();
const first10Lucas = [];
for (let i = 0; i < 10; i++) {
  first10Lucas.push(lucas.next().value);
}
console.log('First 10 Lucas numbers:', first10Lucas);
// [2, 1, 3, 4, 7, 11, 18, 29, 47, 76]

// === Performance Test ===
console.log('\n=== Performance Comparison ===');

// Generator approach
console.time('Generator Fibonacci');
const fibGen = fibonacci();
let sum1 = 0;
for (let i = 0; i < 1000; i++) {
  sum1 += fibGen.next().value;
}
console.timeEnd('Generator Fibonacci');

// Array approach (memory intensive)
console.time('Array Fibonacci');
const fibArray = [];
fibArray[0] = 0;
fibArray[1] = 1;
let sum2 = 0;
for (let i = 2; i < 1000; i++) {
  fibArray[i] = fibArray[i-1] + fibArray[i-2];
}
for (let i = 0; i < 1000; i++) {
  sum2 += fibArray[i];
}
console.timeEnd('Array Fibonacci');

console.log('Sums match:', sum1 === sum2);

// === Advanced: Fibonacci as Iterable Class ===
class FibonacciSequence {
  constructor(max = Infinity) {
    this.max = max;
  }
  
  *[Symbol.iterator]() {
    let prev = 0;
    let curr = 1;
    
    yield prev;
    if (curr <= this.max) yield curr;
    
    while (curr < this.max) {
      const next = prev + curr;
      if (next > this.max) break;
      yield next;
      prev = curr;
      curr = next;
    }
  }
}

console.log('\n=== Fibonacci Iterable Class ===');
const fibSeq = new FibonacciSequence(50);
console.log('Fibonacci sequence up to 50:');
for (const num of fibSeq) {
  console.log(num);
}

module.exports = {
  fibonacci,
  fibonacciLimit,
  fibonacciWithIndex,
  memoizedFibonacci,
  resettableFibonacci,
  fibonacciVariations,
  lucasNumbers,
  getNthFibonacci,
  FibonacciSequence
};