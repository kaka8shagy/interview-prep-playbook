/**
 * File: performance-memory.js
 * Description: Generator performance and memory usage analysis
 * Demonstrates memory efficiency and performance characteristics
 */

// === Memory Usage Comparison ===

// Memory-intensive approach: Store all values
function arrayBasedSequence(n) {
  const result = [];
  let a = 0, b = 1;
  
  result.push(a, b);
  
  for (let i = 2; i < n; i++) {
    const next = a + b;
    result.push(next);
    a = b;
    b = next;
  }
  
  return result;
}

// Memory-efficient approach: Generate on demand
function* generatorBasedSequence() {
  let a = 0, b = 1;
  
  yield a;
  yield b;
  
  while (true) {
    const next = a + b;
    yield next;
    a = b;
    b = next;
  }
}

// === Performance Benchmarks ===

function benchmarkMemoryUsage() {
  console.log('=== Memory Usage Comparison ===\n');
  
  // Test with large numbers
  const n = 100000;
  
  console.time('Array-based (stores all values)');
  const arrayResult = arrayBasedSequence(n);
  console.timeEnd('Array-based (stores all values)');
  console.log(`Memory usage: ~${(arrayResult.length * 8)} bytes (approximation)`);
  
  console.time('Generator-based (constant memory)');
  const gen = generatorBasedSequence();
  let count = 0;
  let lastValue;
  
  // Consume same number of values
  for (const value of gen) {
    lastValue = value;
    count++;
    if (count >= n) break;
  }
  console.timeEnd('Generator-based (constant memory)');
  console.log('Memory usage: ~constant (just current state)');
  
  console.log(`\nBoth produced ${count} values`);
  console.log(`Array last value: ${arrayResult[arrayResult.length - 1]}`);
  console.log(`Generator last value: ${lastValue}`);
}

// === Large Dataset Processing ===

// Process large dataset with array (memory intensive)
function processWithArray(size) {
  console.time('Array processing');
  
  // Generate large array
  const data = Array.from({ length: size }, (_, i) => i * 2);
  
  // Process all data
  const processed = data
    .filter(x => x % 4 === 0)
    .map(x => x * 3)
    .slice(0, 1000);
  
  console.timeEnd('Array processing');
  return processed;
}

// Process large dataset with generators (memory efficient)
function* generateData(size) {
  for (let i = 0; i < size; i++) {
    yield i * 2;
  }
}

function* filterData(iterable) {
  for (const value of iterable) {
    if (value % 4 === 0) {
      yield value;
    }
  }
}

function* mapData(iterable) {
  for (const value of iterable) {
    yield value * 3;
  }
}

function* takeData(iterable, count) {
  let taken = 0;
  for (const value of iterable) {
    if (taken >= count) break;
    yield value;
    taken++;
  }
}

function processWithGenerators(size) {
  console.time('Generator processing');
  
  const pipeline = takeData(
    mapData(
      filterData(
        generateData(size)
      )
    ),
    1000
  );
  
  const result = [...pipeline];
  
  console.timeEnd('Generator processing');
  return result;
}

// === Lazy Evaluation Benefits ===

function* expensiveComputation() {
  console.log('Starting expensive computation...');
  
  for (let i = 0; i < 1000000; i++) {
    // Simulate expensive operation
    if (i % 100000 === 0) {
      console.log(`Processed ${i} items`);
    }
    
    // Only yield if divisible by 1000
    if (i % 1000 === 0) {
      yield i;
    }
  }
  
  console.log('Expensive computation complete');
}

function demonstrateLazyEvaluation() {
  console.log('\n=== Lazy Evaluation Demonstration ===');
  
  console.log('Creating generator (no computation yet)...');
  const gen = expensiveComputation();
  
  console.log('Taking first 3 values only...');
  const results = [];
  let count = 0;
  
  for (const value of gen) {
    results.push(value);
    count++;
    if (count >= 3) break; // Stop early
  }
  
  console.log('Results:', results);
  console.log('Computation stopped early - saved resources!');
}

// === Generator vs Iterator Performance ===

// Custom iterator
function createCounterIterator(max) {
  let count = 0;
  
  return {
    next() {
      if (count < max) {
        return { value: count++, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

// Generator version
function* counterGenerator(max) {
  for (let i = 0; i < max; i++) {
    yield i;
  }
}

function benchmarkIteratorVsGenerator() {
  console.log('\n=== Iterator vs Generator Performance ===');
  
  const size = 1000000;
  
  // Test custom iterator
  console.time('Custom Iterator');
  const iter = createCounterIterator(size);
  let sum1 = 0;
  let result = iter.next();
  while (!result.done) {
    sum1 += result.value;
    result = iter.next();
  }
  console.timeEnd('Custom Iterator');
  
  // Test generator
  console.time('Generator');
  const gen = counterGenerator(size);
  let sum2 = 0;
  for (const value of gen) {
    sum2 += value;
  }
  console.timeEnd('Generator');
  
  console.log(`Iterator sum: ${sum1}`);
  console.log(`Generator sum: ${sum2}`);
  console.log(`Results match: ${sum1 === sum2}`);
}

// === Memory Leak Prevention ===

function* potentialMemoryLeak() {
  const largeArray = new Array(1000000).fill('data');
  
  try {
    for (let i = 0; i < largeArray.length; i++) {
      yield largeArray[i];
    }
  } finally {
    // Cleanup when generator is done/closed
    largeArray.length = 0;
    console.log('Cleaned up large array');
  }
}

function demonstrateCleanup() {
  console.log('\n=== Memory Cleanup Demonstration ===');
  
  const gen = potentialMemoryLeak();
  
  // Take only a few values
  console.log(gen.next().value);
  console.log(gen.next().value);
  
  // Explicitly close generator to trigger cleanup
  gen.return();
  console.log('Generator closed - cleanup triggered');
}

// === Streaming Data Processing ===

function* streamProcessor(source) {
  let buffer = [];
  const batchSize = 5;
  
  for (const item of source) {
    buffer.push(item);
    
    if (buffer.length === batchSize) {
      yield buffer.slice(); // Yield copy of buffer
      buffer.length = 0; // Clear buffer
    }
  }
  
  // Yield remaining items
  if (buffer.length > 0) {
    yield buffer;
  }
}

function* dataSource() {
  for (let i = 1; i <= 23; i++) {
    yield `item-${i}`;
  }
}

function demonstrateStreaming() {
  console.log('\n=== Streaming Data Processing ===');
  
  const stream = streamProcessor(dataSource());
  
  for (const batch of stream) {
    console.log('Processing batch:', batch);
    // Simulate processing time
    // In real scenario, each batch could be processed independently
  }
}

// === Run All Benchmarks ===

function runAllBenchmarks() {
  console.log('=== Generator Performance Analysis ===\n');
  
  benchmarkMemoryUsage();
  
  console.log('\n=== Large Dataset Processing (1M items) ===');
  const arrayResult = processWithArray(1000000);
  const genResult = processWithGenerators(1000000);
  
  console.log(`Array result length: ${arrayResult.length}`);
  console.log(`Generator result length: ${genResult.length}`);
  console.log(`Results match: ${JSON.stringify(arrayResult.slice(0, 5)) === JSON.stringify(genResult.slice(0, 5))}`);
  
  demonstrateLazyEvaluation();
  benchmarkIteratorVsGenerator();
  demonstrateCleanup();
  demonstrateStreaming();
}

module.exports = {
  arrayBasedSequence,
  generatorBasedSequence,
  benchmarkMemoryUsage,
  processWithArray,
  processWithGenerators,
  expensiveComputation,
  demonstrateLazyEvaluation,
  createCounterIterator,
  counterGenerator,
  benchmarkIteratorVsGenerator,
  potentialMemoryLeak,
  demonstrateCleanup,
  streamProcessor,
  dataSource,
  demonstrateStreaming,
  runAllBenchmarks
};