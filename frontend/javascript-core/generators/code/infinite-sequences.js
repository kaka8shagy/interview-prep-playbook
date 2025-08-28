/**
 * File: infinite-sequences.js
 * Description: Infinite sequence generation using generators
 * Demonstrates memory-efficient infinite data generation
 */

console.log('=== Basic Infinite Sequences ===');

// Infinite counter
function* infiniteCounter(start = 0, step = 1) {
  let current = start;
  while (true) {
    yield current;
    current += step;
  }
}

console.log('1. Infinite Counter:');
const counter = infiniteCounter(1, 2);
for (let i = 0; i < 10; i++) {
  console.log('Counter value:', counter.next().value);
}

// Infinite random numbers
function* infiniteRandom(min = 0, max = 1) {
  while (true) {
    yield Math.random() * (max - min) + min;
  }
}

console.log('\n2. Infinite Random Numbers:');
const randomGen = infiniteRandom(1, 100);
for (let i = 0; i < 5; i++) {
  console.log('Random:', Math.floor(randomGen.next().value));
}

console.log('\n=== Mathematical Sequences ===');

// Fibonacci sequence (infinite)
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

console.log('3. Infinite Fibonacci:');
const fib = fibonacci();
const first20Fib = Array.from({ length: 20 }, () => fib.next().value);
console.log('First 20 Fibonacci:', first20Fib);

// Prime numbers (infinite)
function* primes() {
  const primeCache = [];
  let candidate = 2;
  
  while (true) {
    let isPrime = true;
    
    for (const prime of primeCache) {
      if (prime * prime > candidate) break;
      if (candidate % prime === 0) {
        isPrime = false;
        break;
      }
    }
    
    if (isPrime) {
      primeCache.push(candidate);
      yield candidate;
    }
    
    candidate++;
  }
}

console.log('4. Infinite Primes:');
const primeGen = primes();
const first15Primes = Array.from({ length: 15 }, () => primeGen.next().value);
console.log('First 15 primes:', first15Primes);

// Powers of 2
function* powersOf2() {
  let power = 0;
  while (true) {
    yield Math.pow(2, power++);
  }
}

console.log('5. Powers of 2:');
const powers = powersOf2();
for (let i = 0; i < 10; i++) {
  console.log(`2^${i} =`, powers.next().value);
}

console.log('\n=== Sequence Transformations ===');

// Map transformation over infinite sequence
function* mapSequence(generator, transformFn) {
  for (const value of generator) {
    yield transformFn(value);
  }
}

// Filter infinite sequence
function* filterSequence(generator, predicate) {
  for (const value of generator) {
    if (predicate(value)) {
      yield value;
    }
  }
}

// Take n elements from infinite sequence
function* take(generator, n) {
  let count = 0;
  for (const value of generator) {
    if (count >= n) break;
    yield value;
    count++;
  }
}

console.log('6. Sequence Transformations:');

// Transform infinite counter to squares
const squares = mapSequence(infiniteCounter(1), x => x * x);
const first10Squares = [...take(squares, 10)];
console.log('First 10 squares:', first10Squares);

// Filter even numbers from infinite counter
const evenNumbers = filterSequence(infiniteCounter(1), x => x % 2 === 0);
const first10Evens = [...take(evenNumbers, 10)];
console.log('First 10 even numbers:', first10Evens);

console.log('\n=== Complex Infinite Sequences ===');

// Collatz sequence (3n+1 problem)
function* collatz(start) {
  let n = start;
  yield n;
  
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    yield n;
  }
}

console.log('7. Collatz Sequence (27):');
const collatz27 = [...collatz(27)];
console.log(`Collatz(27) length: ${collatz27.length}, sequence:`, collatz27.slice(0, 10), '...');

// Pascal's triangle rows (infinite)
function* pascalTriangle() {
  let row = [1];
  
  while (true) {
    yield [...row];
    
    const nextRow = [1];
    for (let i = 1; i < row.length; i++) {
      nextRow[i] = row[i - 1] + row[i];
    }
    nextRow.push(1);
    row = nextRow;
  }
}

console.log('8. Pascal\'s Triangle:');
const pascal = pascalTriangle();
for (let i = 0; i < 8; i++) {
  const row = pascal.next().value;
  console.log(`Row ${i}:`, row);
}

// Infinite sequence of dates
function* dateSequence(startDate, intervalDays = 1) {
  let current = new Date(startDate);
  
  while (true) {
    yield new Date(current);
    current.setDate(current.getDate() + intervalDays);
  }
}

console.log('9. Infinite Date Sequence:');
const dates = dateSequence('2024-01-01', 7); // Weekly
for (let i = 0; i < 5; i++) {
  const date = dates.next().value;
  console.log('Date:', date.toISOString().split('T')[0]);
}

console.log('\n=== Practical Applications ===');

// ID generator
function* idGenerator(prefix = 'ID', start = 1) {
  let current = start;
  while (true) {
    yield `${prefix}_${String(current).padStart(6, '0')}`;
    current++;
  }
}

console.log('10. ID Generator:');
const idGen = idGenerator('USER', 1000);
for (let i = 0; i < 5; i++) {
  console.log('Generated ID:', idGen.next().value);
}

// Paginated data loader (infinite)
function* paginatedLoader(fetchFunction, pageSize = 10) {
  let page = 1;
  
  while (true) {
    console.log(`Fetching page ${page}...`);
    
    // Simulate API call
    const data = fetchFunction(page, pageSize);
    
    if (data.length === 0) {
      console.log('No more data available');
      break;
    }
    
    yield* data; // Yield each item individually
    page++;
  }
}

// Mock fetch function
function mockFetchPage(page, pageSize) {
  const totalItems = 25; // Simulate 25 total items
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalItems);
  
  if (start >= totalItems) return [];
  
  return Array.from({ length: end - start }, (_, i) => ({
    id: start + i + 1,
    name: `Item ${start + i + 1}`
  }));
}

console.log('11. Paginated Data Loader:');
const dataLoader = paginatedLoader(mockFetchPage, 5);
const allData = [...dataLoader];
console.log(`Loaded ${allData.length} items total`);

// Color generator (infinite cycle through colors)
function* colorCycle(colors) {
  let index = 0;
  while (true) {
    yield colors[index % colors.length];
    index++;
  }
}

console.log('12. Color Cycle:');
const colors = colorCycle(['red', 'green', 'blue']);
for (let i = 0; i < 8; i++) {
  console.log(`Color ${i}:`, colors.next().value);
}

console.log('\n=== Performance and Memory ===');

// Memory comparison: Array vs Generator
function demonstrateMemoryEfficiency() {
  console.log('13. Memory Efficiency Demonstration:');
  
  // Array approach - creates all data in memory
  console.log('Creating array of 1M numbers...');
  console.time('Array creation');
  const largeArray = Array.from({ length: 1000000 }, (_, i) => i);
  console.timeEnd('Array creation');
  
  // Find first number divisible by 12345
  console.time('Array search');
  const arrayResult = largeArray.find(n => n % 12345 === 0);
  console.timeEnd('Array search');
  console.log('Found in array:', arrayResult);
  
  // Generator approach - generates on demand
  console.log('\nUsing infinite generator...');
  console.time('Generator search');
  const genResult = infiniteCounter(0);
  let generatorResult;
  for (const n of genResult) {
    if (n % 12345 === 0) {
      generatorResult = n;
      break;
    }
  }
  console.timeEnd('Generator search');
  console.log('Found with generator:', generatorResult);
  console.log('Generator uses constant memory regardless of search range');
}

demonstrateMemoryEfficiency();

console.log('\n=== Combining Infinite Sequences ===');

// Zip two infinite sequences
function* zipSequences(gen1, gen2) {
  while (true) {
    const val1 = gen1.next();
    const val2 = gen2.next();
    
    if (val1.done || val2.done) break;
    
    yield [val1.value, val2.value];
  }
}

console.log('14. Zipping Sequences:');
const numbers = infiniteCounter(1);
const letters = function* () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let i = 0;
  while (true) {
    yield chars[i % chars.length];
    i++;
  }
}();

const zipped = zipSequences(numbers, letters);
const first10Zipped = [...take(zipped, 10)];
console.log('Zipped sequences:', first10Zipped);

// Interleave multiple infinite sequences
function* interleave(...generators) {
  const iters = generators.map(g => g[Symbol.iterator]());
  
  while (iters.length > 0) {
    for (let i = iters.length - 1; i >= 0; i--) {
      const result = iters[i].next();
      
      if (result.done) {
        iters.splice(i, 1);
      } else {
        yield result.value;
      }
    }
  }
}

console.log('15. Interleaving Sequences:');
const seq1 = take(infiniteCounter(1, 2), 5); // 1, 3, 5, 7, 9
const seq2 = take(infiniteCounter(2, 2), 5); // 2, 4, 6, 8, 10
const seq3 = take(mapSequence(infiniteCounter(1), x => x * x), 3); // 1, 4, 9

const interleaved = interleave(seq1, seq2, seq3);
console.log('Interleaved result:', [...interleaved]);

console.log('\n=== Interview Questions ===');

// Q1: Implement infinite sequence of perfect squares
function* perfectSquares() {
  let n = 1;
  while (true) {
    yield n * n;
    n++;
  }
}

console.log('Q1: Perfect Squares:');
const squares2 = perfectSquares();
console.log('First 10 perfect squares:', [...take(squares2, 10)]);

// Q2: Create an infinite sequence that cycles through weekdays
function* weekdays() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let index = 0;
  
  while (true) {
    yield days[index % days.length];
    index++;
  }
}

console.log('\nQ2: Infinite Weekdays:');
const dayGen = weekdays();
for (let i = 0; i < 14; i++) {
  console.log(`Day ${i + 1}:`, dayGen.next().value);
}

// Q3: Implement an infinite arithmetic progression
function* arithmeticProgression(first, difference) {
  let current = first;
  while (true) {
    yield current;
    current += difference;
  }
}

console.log('\nQ3: Arithmetic Progression (3, 7, 11, 15, ...):');
const ap = arithmeticProgression(3, 4);
console.log('AP terms:', [...take(ap, 10)]);

// Q4: Create an infinite sequence of triangular numbers
function* triangularNumbers() {
  let n = 1;
  while (true) {
    yield (n * (n + 1)) / 2;
    n++;
  }
}

console.log('\nQ4: Triangular Numbers:');
const triangular = triangularNumbers();
console.log('First 10 triangular numbers:', [...take(triangular, 10)]);

module.exports = {
  infiniteCounter,
  infiniteRandom,
  fibonacci,
  primes,
  powersOf2,
  mapSequence,
  filterSequence,
  take,
  collatz,
  pascalTriangle,
  dateSequence,
  idGenerator,
  paginatedLoader,
  colorCycle,
  zipSequences,
  interleave,
  perfectSquares,
  weekdays,
  arithmeticProgression,
  triangularNumbers
};