/**
 * File: advanced-patterns.js
 * Description: Advanced generator patterns including yield delegation, lazy evaluation, and infinite sequences
 * 
 * Learning objectives:
 * - Master yield* delegation for composing generators
 * - Understand lazy evaluation patterns and memory efficiency
 * - Learn to work with infinite sequences safely
 * - Implement performance-optimized generator patterns
 * 
 * This file consolidates: yield-delegation.js, lazy-evaluation.js, infinite-sequences.js, performance-memory.js
 */

console.log('=== Advanced Generator Patterns ===\n');

// ============================================================================
// PART 1: YIELD DELEGATION (yield*)
// ============================================================================

console.log('--- Yield Delegation with yield* ---');

/**
 * YIELD DELEGATION: The Power of Composition
 * 
 * yield* is like "flattening" or "delegating" to another iterable.
 * Instead of yielding a generator object, it yields each value from the iterable.
 * 
 * Think of it as:
 * - yield someIterable → yields the iterable object itself
 * - yield* someIterable → yields each individual value from the iterable
 * 
 * This enables powerful composition patterns where complex generators
 * are built from simpler building blocks.
 */

function demonstrateYieldDelegation() {
  // Basic building block generators
  function* numbersGenerator() {
    console.log('  Generating numbers...');
    yield 1;
    yield 2;
    yield 3;
  }
  
  function* lettersGenerator() {
    console.log('  Generating letters...');
    yield 'a';
    yield 'b';
    yield 'c';
  }
  
  // Composed generator using yield* delegation
  function* composedGenerator() {
    console.log('  Starting composition...');
    
    // yield* delegates to the numbers generator
    // Each value from numbersGenerator is yielded individually
    yield* numbersGenerator();
    
    console.log('  Between generators...');
    
    // yield* delegates to the letters generator
    yield* lettersGenerator();
    
    // We can also yield* arrays and other iterables
    yield* ['x', 'y', 'z'];
    
    // And mix with regular yields
    yield 'final';
    
    console.log('  Composition complete');
  }
  
  console.log('Composed generator output:');
  for (const value of composedGenerator()) {
    console.log('  ', value);
  }
  
  /**
   * KEY INSIGHTS:
   * 1. yield* "flattens" iterables - yields their individual values
   * 2. Execution flows naturally through delegated generators
   * 3. Can delegate to any iterable (generators, arrays, strings, etc.)
   * 4. Enables clean composition and reusability
   */
  
  // Advanced example: Tree flattening with yield*
  function* flattenTree(node) {
    // This generator recursively flattens a tree structure
    // using yield* for elegant recursive delegation
    
    if (typeof node === 'number') {
      // Leaf node - just yield the value
      yield node;
    } else if (Array.isArray(node)) {
      // Branch node - delegate to each child
      for (const child of node) {
        yield* flattenTree(child); // Recursive delegation
      }
    }
  }
  
  console.log('\nTree flattening example:');
  const nestedTree = [1, [2, 3], [[4, 5], 6], [7, [8, [9]]]];
  console.log('Original tree:', JSON.stringify(nestedTree));
  console.log('Flattened values:');
  
  for (const value of flattenTree(nestedTree)) {
    console.log('  ', value);
  }
  
  // Show how this is more elegant than manual flattening
  const flatArray = [...flattenTree(nestedTree)];
  console.log('As array:', flatArray);
}

demonstrateYieldDelegation();

// ============================================================================
// PART 2: LAZY EVALUATION PATTERNS
// ============================================================================

function demonstrateLazyEvaluation() {
  console.log('\n--- Lazy Evaluation Patterns ---');
  
  /**
   * LAZY EVALUATION: Compute Only What's Needed
   * 
   * Lazy evaluation means values are computed only when requested,
   * not when the generator is created. This provides several benefits:
   * 
   * 1. MEMORY EFFICIENCY: Only current value is in memory
   * 2. CPU EFFICIENCY: Avoid computing unused values  
   * 3. INFINITE SEQUENCES: Can represent unbounded sequences
   * 4. COMPOSABILITY: Lazy operations can be chained efficiently
   */
  
  // Example: Lazy data transformation pipeline
  function* lazyMap(iterable, transformFn) {
    // This generator applies a transformation lazily
    // Values are transformed only when requested
    console.log('  Setting up lazy map transformation');
    
    for (const value of iterable) {
      console.log(`    Transforming: ${value}`);
      yield transformFn(value);
    }
  }
  
  function* lazyFilter(iterable, predicateFn) {
    // This generator filters values lazily
    // Filtering happens only as values are consumed
    console.log('  Setting up lazy filter');
    
    for (const value of iterable) {
      console.log(`    Testing: ${value}`);
      if (predicateFn(value)) {
        yield value;
      } else {
        console.log(`    Filtered out: ${value}`);
      }
    }
  }
  
  function* lazyTake(iterable, count) {
    // This generator takes only the first 'count' values
    // Stops processing as soon as limit is reached
    console.log(`  Setting up lazy take (${count} items)`);
    
    let taken = 0;
    for (const value of iterable) {
      if (taken >= count) {
        console.log('    Take limit reached, stopping');
        break;
      }
      console.log(`    Taking: ${value}`);
      yield value;
      taken++;
    }
  }
  
  // Create a large source sequence (lazy - no computation yet)
  function* largeSequence() {
    console.log('  Generating large sequence...');
    for (let i = 0; i < 1000000; i++) {
      // Expensive computation simulation
      const value = i * i + Math.sin(i);
      if (i < 10) console.log(`    Generated: ${value.toFixed(2)}`);
      if (i === 10) console.log('    ... (generating more values as needed)');
      yield value;
    }
  }
  
  console.log('Setting up lazy transformation pipeline:');
  
  // Build a lazy processing pipeline
  // IMPORTANT: No computation happens yet - just setting up the pipeline
  const pipeline = lazyTake(
    lazyFilter(
      lazyMap(largeSequence(), x => x * 2),
      x => x > 10
    ),
    5
  );
  
  console.log('\nPipeline created (no computation done yet)');
  console.log('Starting to consume values:');
  
  // Now computation happens on-demand as we iterate
  const results = [];
  for (const value of pipeline) {
    results.push(value);
    console.log(`  Result: ${value.toFixed(2)}`);
  }
  
  console.log('\nFinal results:', results.map(x => x.toFixed(2)));
  
  /**
   * PERFORMANCE COMPARISON: Lazy vs Eager
   */
  
  console.log('\nPerformance comparison:');
  
  // Eager evaluation (traditional array methods)
  function eagerProcessing() {
    console.log('  Eager: Creating full array...');
    const data = Array.from({length: 100000}, (_, i) => i * i);
    
    console.log('  Eager: Mapping all values...');
    const mapped = data.map(x => x * 2);
    
    console.log('  Eager: Filtering all values...');
    const filtered = mapped.filter(x => x > 10);
    
    console.log('  Eager: Taking first 5...');
    return filtered.slice(0, 5);
  }
  
  // Lazy evaluation (generators)
  function lazyProcessing() {
    console.log('  Lazy: Setting up pipeline...');
    return [...lazyTake(
      lazyFilter(
        lazyMap(
          (function* () {
            for (let i = 0; i < 100000; i++) yield i * i;
          })(),
          x => x * 2
        ),
        x => x > 10
      ),
      5
    )];
  }
  
  // Measure performance
  console.time('Eager processing');
  const eagerResults = eagerProcessing();
  console.timeEnd('Eager processing');
  
  console.time('Lazy processing');
  const lazyResults = lazyProcessing();
  console.timeEnd('Lazy processing');
  
  console.log('Results match:', JSON.stringify(eagerResults) === JSON.stringify(lazyResults));
}

demonstrateLazyEvaluation();

// ============================================================================
// PART 3: INFINITE SEQUENCES
// ============================================================================

function demonstrateInfiniteSequences() {
  console.log('\n--- Infinite Sequences ---');
  
  /**
   * INFINITE SEQUENCES: Representing Unbounded Data
   * 
   * Generators can represent infinite sequences because they:
   * 1. Generate values on-demand (lazy evaluation)
   * 2. Don't store all values in memory
   * 3. Can run indefinitely with while(true) loops
   * 
   * This is impossible with arrays but natural with generators.
   */
  
  // Classic example: Infinite fibonacci sequence
  function* fibonacciInfinite() {
    let a = 0, b = 1;
    
    while (true) { // Infinite loop!
      yield a;
      [a, b] = [b, a + b]; // Generate next fibonacci number
    }
    
    // This line never executes - the generator runs forever
  }
  
  console.log('First 10 fibonacci numbers:');
  let count = 0;
  for (const fib of fibonacciInfinite()) {
    console.log(`  F(${count}) = ${fib}`);
    
    if (++count >= 10) {
      break; // CRITICAL: Must break to avoid infinite loop
    }
  }
  
  // Infinite prime number generator
  function* primeNumbers() {
    // Helper function to check if number is prime
    function isPrime(n) {
      if (n < 2) return false;
      
      // Only check up to square root for efficiency
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    }
    
    let candidate = 2;
    
    while (true) {
      if (isPrime(candidate)) {
        yield candidate;
      }
      candidate++;
    }
  }
  
  console.log('\nFirst 10 prime numbers:');
  count = 0;
  for (const prime of primeNumbers()) {
    console.log(`  Prime ${count + 1}: ${prime}`);
    
    if (++count >= 10) break;
  }
  
  // Infinite random number generator with seed
  function* randomNumbers(seed = Date.now()) {
    // Simple linear congruential generator for reproducible randomness
    let state = seed;
    
    while (true) {
      // LCG formula: (a * state + c) % m
      state = (1664525 * state + 1013904223) % (2 ** 32);
      
      // Normalize to 0-1 range
      yield state / (2 ** 32);
    }
  }
  
  console.log('\nFirst 5 pseudo-random numbers (seeded):');
  count = 0;
  for (const random of randomNumbers(12345)) {
    console.log(`  Random ${count + 1}: ${random.toFixed(6)}`);
    
    if (++count >= 5) break;
  }
  
  /**
   * SAFE INFINITE SEQUENCE PATTERNS
   * 
   * Working with infinite sequences requires careful patterns
   * to avoid accidentally consuming the entire sequence.
   */
  
  // Pattern 1: takeWhile - stop based on condition
  function* takeWhile(iterable, predicate) {
    for (const value of iterable) {
      if (!predicate(value)) {
        break; // Stop when condition fails
      }
      yield value;
    }
  }
  
  // Pattern 2: takeN - stop after N items
  function* takeN(iterable, n) {
    let count = 0;
    for (const value of iterable) {
      if (count >= n) break;
      yield value;
      count++;
    }
  }
  
  console.log('\nSafe infinite sequence consumption:');
  
  // Take fibonacci numbers while they're less than 1000
  console.log('Fibonacci numbers < 1000:');
  const smallFibs = [...takeWhile(fibonacciInfinite(), n => n < 1000)];
  console.log('  ', smallFibs);
  
  // Take exactly 7 prime numbers
  console.log('\nExactly 7 prime numbers:');
  const sevenPrimes = [...takeN(primeNumbers(), 7)];
  console.log('  ', sevenPrimes);
  
  /**
   * MEMORY EFFICIENCY DEMONSTRATION
   * 
   * Show that infinite sequences use constant memory
   */
  
  function* infiniteCounter() {
    let n = 0;
    while (true) {
      yield n++;
    }
  }
  
  console.log('\nMemory efficiency test:');
  console.log('Processing 1 million numbers with constant memory...');
  
  let sum = 0;
  let processed = 0;
  
  for (const num of infiniteCounter()) {
    sum += num;
    processed++;
    
    if (processed >= 1000000) {
      break;
    }
    
    // Show progress occasionally
    if (processed % 200000 === 0) {
      console.log(`  Processed ${processed} numbers, sum so far: ${sum}`);
    }
  }
  
  console.log(`Final: Processed ${processed} numbers, total sum: ${sum}`);
  console.log('Memory usage remained constant throughout!');
}

demonstrateInfiniteSequences();

// ============================================================================
// PART 4: PERFORMANCE OPTIMIZATION PATTERNS
// ============================================================================

function demonstratePerformancePatterns() {
  console.log('\n--- Performance Optimization Patterns ---');
  
  /**
   * GENERATOR PERFORMANCE CONSIDERATIONS
   * 
   * While generators are memory efficient, there are performance
   * trade-offs to consider:
   * 
   * 1. ITERATION OVERHEAD: next() calls have some overhead
   * 2. FUNCTION CALL COST: Each yield involves function state saving
   * 3. OPTIMIZATION OPPORTUNITIES: V8 can optimize certain patterns
   * 
   * Understanding these helps write performant generator code.
   */
  
  // Performance pattern 1: Batch yielding for efficiency
  function* batchYield(iterable, batchSize = 1000) {
    // Instead of yielding individual values, yield batches
    // This reduces the number of next() calls needed
    
    let batch = [];
    
    for (const item of iterable) {
      batch.push(item);
      
      if (batch.length >= batchSize) {
        yield batch; // Yield the entire batch
        batch = []; // Reset for next batch
      }
    }
    
    // Yield remaining items if any
    if (batch.length > 0) {
      yield batch;
    }
  }
  
  // Performance pattern 2: Avoiding expensive operations in hot paths
  function* optimizedTransform(data, expensiveTransform) {
    // Cache expensive computations when possible
    const cache = new Map();
    
    for (const item of data) {
      // Check cache first before expensive operation
      if (cache.has(item)) {
        yield cache.get(item);
      } else {
        const result = expensiveTransform(item);
        cache.set(item, result);
        yield result;
      }
    }
  }
  
  // Performance pattern 3: Early termination optimization
  function* earlyTerminatingSearch(data, predicate, maxResults = Infinity) {
    let found = 0;
    
    for (const item of data) {
      if (predicate(item)) {
        yield item;
        found++;
        
        // Optimize: stop searching when we have enough results
        if (found >= maxResults) {
          return; // Early termination saves unnecessary work
        }
      }
    }
  }
  
  // Demonstrate performance patterns
  const testData = Array.from({length: 10000}, (_, i) => i);
  
  console.log('Performance pattern demonstrations:');
  
  // Batch yielding example
  console.log('\n1. Batch yielding:');
  let batchCount = 0;
  for (const batch of batchYield(testData.slice(0, 2500), 1000)) {
    batchCount++;
    console.log(`  Batch ${batchCount}: ${batch.length} items (${batch[0]} to ${batch[batch.length-1]})`);
  }
  
  // Cached expensive operations
  console.log('\n2. Cached expensive operations:');
  const expensiveOperation = (n) => {
    // Simulate expensive computation
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += Math.sin(n + i);
    }
    return result;
  };
  
  // Test data with duplicates to show caching benefit
  const dataWithDuplicates = [1, 2, 3, 1, 2, 3, 4, 5, 1, 2];
  
  console.time('With caching');
  const cachedResults = [...optimizedTransform(dataWithDuplicates, expensiveOperation)];
  console.timeEnd('With caching');
  
  console.log(`  Processed ${dataWithDuplicates.length} items with caching`);
  
  // Early termination search
  console.log('\n3. Early termination search:');
  const searchResults = [...earlyTerminatingSearch(
    testData,
    n => n % 1000 === 0, // Find multiples of 1000
    3 // Only need first 3 results
  )];
  
  console.log(`  Found first 3 multiples of 1000: ${searchResults}`);
  console.log('  Search stopped early, didn\'t check remaining 7000+ numbers');
  
  /**
   * MEMORY PROFILING EXAMPLE
   * 
   * Compare memory usage of different approaches
   */
  
  function measureMemoryUsage(name, fn) {
    // Simple memory usage estimation
    const before = process.memoryUsage?.()?.heapUsed || 0;
    
    console.time(`${name} execution time`);
    const result = fn();
    console.timeEnd(`${name} execution time`);
    
    const after = process.memoryUsage?.()?.heapUsed || 0;
    const memoryDelta = after - before;
    
    console.log(`  ${name} memory delta: ${memoryDelta > 0 ? '+' : ''}${memoryDelta} bytes`);
    
    return result;
  }
  
  console.log('\nMemory usage comparison:');
  
  // Array approach (eager)
  const arrayResult = measureMemoryUsage('Array approach', () => {
    return testData
      .map(x => x * 2)
      .filter(x => x > 100)
      .slice(0, 100);
  });
  
  // Generator approach (lazy)  
  const generatorResult = measureMemoryUsage('Generator approach', () => {
    function* process() {
      for (const x of testData) {
        const doubled = x * 2;
        if (doubled > 100) {
          yield doubled;
        }
      }
    }
    
    return [...takeN(process(), 100)];
  });
  
  console.log('Results match:', JSON.stringify(arrayResult) === JSON.stringify(generatorResult));
}

demonstratePerformancePatterns();

/**
 * SUMMARY OF ADVANCED PATTERNS:
 * 
 * 1. Yield Delegation (yield*):
 *    - Compose generators by delegating to other iterables
 *    - Enables clean recursive patterns and code reuse  
 *    - Works with any iterable (generators, arrays, strings)
 * 
 * 2. Lazy Evaluation:
 *    - Compute values only when needed
 *    - Build efficient processing pipelines
 *    - Avoid unnecessary memory allocation and computation
 * 
 * 3. Infinite Sequences:
 *    - Represent unbounded data with finite memory
 *    - Use safe consumption patterns (takeWhile, takeN)
 *    - Enable mathematical sequence representations
 * 
 * 4. Performance Optimization:
 *    - Batch operations to reduce overhead
 *    - Cache expensive computations
 *    - Implement early termination when possible
 * 
 * Key Benefits:
 * - Memory efficiency through lazy evaluation
 * - Composability through yield* delegation
 * - Infinite sequence representation capability
 * - Performance optimization opportunities
 * 
 * Interview Focus:
 * - Explain when to use generators vs arrays
 * - Demonstrate understanding of lazy evaluation
 * - Show ability to compose complex generators
 * - Discuss performance trade-offs and optimizations
 */

console.log('\nAdvanced generator patterns complete!');
console.log('Next: See practical-applications.js for state machines and async flow patterns');