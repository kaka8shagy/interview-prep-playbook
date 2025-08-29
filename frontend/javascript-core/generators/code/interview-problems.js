/**
 * File: interview-problems.js
 * Description: Common generator interview questions with detailed solutions
 * 
 * Learning objectives:
 * - Master typical generator interview questions and solutions
 * - Understand the reasoning behind generator design decisions
 * - Practice explaining generator concepts clearly to interviewers
 * - Learn to implement custom iterators and generator patterns
 * 
 * This file consolidates: interview-fibonacci.js, interview-iterator.js
 */

console.log('=== Generator Interview Problems ===\n');

// ============================================================================
// INTERVIEW QUESTION 1: IMPLEMENT FIBONACCI GENERATOR
// ============================================================================

console.log('--- Question 1: Implement Fibonacci Generator ---');

/**
 * QUESTION: "Implement a Fibonacci sequence generator that can produce 
 * infinite fibonacci numbers efficiently."
 * 
 * This tests:
 * - Basic generator syntax understanding
 * - Infinite sequence implementation
 * - Memory efficiency considerations
 * - Understanding of lazy evaluation
 */

function solveFibonacciGenerator() {
  console.log('=== FIBONACCI GENERATOR SOLUTION ===');
  
  // Solution 1: Basic fibonacci generator
  function* fibonacci() {
    let a = 0, b = 1;
    
    while (true) { // Infinite sequence
      yield a;
      [a, b] = [b, a + b]; // Elegant parallel assignment
    }
  }
  
  // Solution 2: Fibonacci with configurable start values
  function* fibonacciCustom(start1 = 0, start2 = 1) {
    let a = start1, b = start2;
    
    while (true) {
      yield a;
      [a, b] = [b, a + b];
    }
  }
  
  // Solution 3: Fibonacci with limit
  function* fibonacciUpTo(limit) {
    let a = 0, b = 1;
    
    while (a <= limit) {
      yield a;
      [a, b] = [b, a + b];
    }
  }
  
  // Solution 4: Fibonacci with count limit
  function* fibonacciCount(count) {
    let a = 0, b = 1;
    let generated = 0;
    
    while (generated < count) {
      yield a;
      [a, b] = [b, a + b];
      generated++;
    }
  }
  
  console.log('Testing fibonacci implementations:');
  
  // Test basic fibonacci
  console.log('Basic fibonacci (first 10):');
  let count = 0;
  for (const fib of fibonacci()) {
    console.log(`  F(${count}) = ${fib}`);
    if (++count >= 10) break;
  }
  
  // Test fibonacci with custom start
  console.log('\nCustom start fibonacci (2, 3, first 8):');
  count = 0;
  for (const fib of fibonacciCustom(2, 3)) {
    console.log(`  F(${count}) = ${fib}`);
    if (++count >= 8) break;
  }
  
  // Test fibonacci up to limit
  console.log('\nFibonacci up to 100:');
  const fibsUpTo100 = [...fibonacciUpTo(100)];
  console.log('  Values:', fibsUpTo100);
  
  // Test fibonacci with count
  console.log('\nExactly 7 fibonacci numbers:');
  const first7Fibs = [...fibonacciCount(7)];
  console.log('  Values:', first7Fibs);
  
  /**
   * INTERVIEWER FOLLOW-UPS:
   * 
   * Q: "Why use a generator instead of returning an array?"
   * A: Memory efficiency - generators use O(1) memory vs O(n) for arrays.
   *    Can represent infinite sequences. Lazy evaluation computes only what's needed.
   * 
   * Q: "How would you make this more performant?"
   * A: For very large numbers, could use BigInt. For repeated access to same values,
   *    could add memoization. Could batch yield multiple values to reduce iterator overhead.
   * 
   * Q: "What's the time complexity?"
   * A: O(1) per value generated. Total O(n) for n values, which is optimal.
   */
}

solveFibonacciGenerator();

// ============================================================================
// INTERVIEW QUESTION 2: IMPLEMENT CUSTOM ITERATOR PROTOCOL
// ============================================================================

function solveCustomIterator() {
  console.log('\n--- Question 2: Implement Custom Iterator Protocol ---');
  
  /**
   * QUESTION: "Create a custom iterable class that generates a sequence of 
   * prime numbers, implementing both iterator and iterable protocols without using generators."
   * 
   * This tests:
   * - Understanding of iterator protocol
   * - Manual implementation vs generator benefits
   * - Symbol.iterator usage
   * - Prime number algorithm knowledge
   */
  
  console.log('=== CUSTOM ITERATOR SOLUTION ===');
  
  class PrimeIterator {
    constructor(limit = Infinity) {
      this.limit = limit;
      this.current = 2; // Start from first prime
      this.generated = 0;
    }
    
    // Helper method to check if number is prime
    isPrime(n) {
      if (n < 2) return false;
      if (n === 2) return true;
      if (n % 2 === 0) return false;
      
      // Only check odd divisors up to square root
      for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
      }
      return true;
    }
    
    // Iterator protocol: must have next() method
    next() {
      // Find next prime
      while (this.current <= this.limit && this.generated < this.limit) {
        if (this.isPrime(this.current)) {
          const value = this.current;
          this.current++;
          this.generated++;
          
          return { value, done: false };
        }
        this.current++;
      }
      
      // No more primes within limit
      return { value: undefined, done: true };
    }
    
    // Iterable protocol: must have Symbol.iterator method
    [Symbol.iterator]() {
      // Return an iterator - in this case, create a new instance
      // This allows multiple independent iterations
      return new PrimeIterator(this.limit);
    }
    
    // Convenience method to reset iteration
    reset() {
      this.current = 2;
      this.generated = 0;
      return this;
    }
  }
  
  // Alternative implementation using closure pattern
  function createPrimeIterable(limit = Infinity) {
    return {
      [Symbol.iterator]() {
        let current = 2;
        let generated = 0;
        
        function isPrime(n) {
          if (n < 2) return false;
          if (n === 2) return true;
          if (n % 2 === 0) return false;
          
          for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
          }
          return true;
        }
        
        return {
          next() {
            while (current <= limit && generated < limit) {
              if (isPrime(current)) {
                const value = current;
                current++;
                generated++;
                return { value, done: false };
              }
              current++;
            }
            return { value: undefined, done: true };
          }
        };
      }
    };
  }
  
  // Equivalent generator solution (for comparison)
  function* primeGenerator(limit = Infinity) {
    function isPrime(n) {
      if (n < 2) return false;
      if (n === 2) return true;
      if (n % 2 === 0) return false;
      
      for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
      }
      return true;
    }
    
    let current = 2;
    let generated = 0;
    
    while (current <= limit && generated < limit) {
      if (isPrime(current)) {
        yield current;
        generated++;
      }
      current++;
    }
  }
  
  console.log('Testing custom iterator implementations:');
  
  // Test class-based iterator
  console.log('\nClass-based iterator (first 8 primes):');
  const primeIter = new PrimeIterator();
  let count = 0;
  for (const prime of primeIter) {
    console.log(`  Prime ${count + 1}: ${prime}`);
    if (++count >= 8) break;
  }
  
  // Test closure-based iterator  
  console.log('\nClosure-based iterator (primes up to 30):');
  const primeIterable = createPrimeIterable(30);
  const primesUpTo30 = [...primeIterable];
  console.log('  Primes:', primesUpTo30);
  
  // Test generator solution (for comparison)
  console.log('\nGenerator solution (first 5 primes):');
  const first5Primes = [];
  count = 0;
  for (const prime of primeGenerator()) {
    first5Primes.push(prime);
    if (++count >= 5) break;
  }
  console.log('  Primes:', first5Primes);
  
  // Performance and code comparison
  console.log('\nCode complexity comparison:');
  console.log('  Manual iterator: ~40 lines, explicit state management');
  console.log('  Generator: ~15 lines, automatic state management');
  console.log('  Generator is more concise and less error-prone');
  
  /**
   * KEY INSIGHTS FOR INTERVIEW:
   * 
   * 1. Manual iterators require explicit state management
   * 2. Must implement both next() and Symbol.iterator
   * 3. Generators automatically handle the iterator protocol
   * 4. Manual iterators give fine-grained control but more complexity
   * 5. Both approaches achieve the same lazy evaluation benefits
   */
}

solveCustomIterator();

// ============================================================================
// INTERVIEW QUESTION 3: GENERATOR COMPOSITION AND FLATTENING
// ============================================================================

function solveGeneratorComposition() {
  console.log('\n--- Question 3: Generator Composition and Flattening ---');
  
  /**
   * QUESTION: "Write a function that takes an array of iterables (arrays, generators, strings)
   * and returns a generator that yields all values from all iterables in sequence."
   * 
   * This tests:
   * - yield* delegation understanding
   * - Working with mixed iterable types
   * - Generator composition patterns
   * - Error handling in generators
   */
  
  console.log('=== GENERATOR COMPOSITION SOLUTION ===');
  
  // Solution 1: Basic flattening with yield*
  function* flattenIterables(iterables) {
    for (const iterable of iterables) {
      yield* iterable;
    }
  }
  
  // Solution 2: Flattening with error handling
  function* robustFlatten(iterables) {
    for (let i = 0; i < iterables.length; i++) {
      const iterable = iterables[i];
      
      try {
        // Check if it's actually iterable
        if (iterable && typeof iterable[Symbol.iterator] === 'function') {
          yield* iterable;
        } else {
          console.log(`  Warning: Item ${i} is not iterable, skipping`);
        }
      } catch (error) {
        console.log(`  Error processing iterable ${i}: ${error.message}`);
        // Continue with next iterable
      }
    }
  }
  
  // Solution 3: Deep flattening (recursive)
  function* deepFlatten(iterable) {
    for (const item of iterable) {
      if (item && typeof item[Symbol.iterator] === 'function' && typeof item !== 'string') {
        // Recursively flatten nested iterables (except strings)
        yield* deepFlatten(item);
      } else {
        yield item;
      }
    }
  }
  
  // Solution 4: Controlled flattening with depth limit
  function* flattenWithDepth(iterable, maxDepth = Infinity, currentDepth = 0) {
    for (const item of iterable) {
      if (currentDepth < maxDepth && 
          item && 
          typeof item[Symbol.iterator] === 'function' && 
          typeof item !== 'string') {
        yield* flattenWithDepth(item, maxDepth, currentDepth + 1);
      } else {
        yield item;
      }
    }
  }
  
  // Helper generators for testing
  function* numberGen() {
    yield 1;
    yield 2; 
    yield 3;
  }
  
  function* letterGen() {
    yield 'a';
    yield 'b';
  }
  
  console.log('Testing generator composition:');
  
  // Test basic flattening
  console.log('\nBasic flattening:');
  const mixed = [
    [1, 2, 3],           // Array
    numberGen(),         // Generator  
    'hello',             // String (iterable)
    new Set([4, 5, 6]),  // Set (iterable)
    letterGen()          // Another generator
  ];
  
  const flattened = [...flattenIterables(mixed)];
  console.log('  Result:', flattened);
  
  // Test robust flattening with invalid input
  console.log('\nRobust flattening with mixed valid/invalid inputs:');
  const mixedWithInvalid = [
    [1, 2],
    'test', 
    null,        // Not iterable
    numberGen(),
    42,          // Not iterable
    [3, 4]
  ];
  
  const robustResult = [...robustFlatten(mixedWithInvalid)];
  console.log('  Result:', robustResult);
  
  // Test deep flattening
  console.log('\nDeep flattening (nested arrays):');
  const nested = [
    [1, [2, 3]], 
    [[4, 5], 6],
    [7, [8, [9]]]
  ];
  
  const deepResult = [...deepFlatten(nested)];
  console.log('  Original:', JSON.stringify(nested));
  console.log('  Flattened:', deepResult);
  
  // Test depth-limited flattening
  console.log('\nDepth-limited flattening (max depth 1):');
  const depthLimited = [...flattenWithDepth(nested, 1)];
  console.log('  Depth 1:', JSON.stringify(depthLimited));
  
  const depthLimited2 = [...flattenWithDepth(nested, 2)];
  console.log('  Depth 2:', JSON.stringify(depthLimited2));
  
  /**
   * ADVANCED FOLLOW-UP: Transform while flattening
   */
  
  function* flattenAndTransform(iterables, transformer) {
    for (const iterable of iterables) {
      for (const item of iterable) {
        yield transformer(item);
      }
    }
  }
  
  console.log('\nFlattening with transformation (double each value):');
  const transformed = [...flattenAndTransform(
    [[1, 2], [3, 4], [5]], 
    x => x * 2
  )];
  console.log('  Result:', transformed);
  
  /**
   * INTERVIEW DISCUSSION POINTS:
   * 
   * Q: "What's the difference between yield and yield*?"
   * A: yield produces a single value, yield* delegates to another iterable
   *    and yields each of its values individually.
   * 
   * Q: "How do you handle errors in generator composition?"
   * A: Use try-catch blocks, check for iterable protocol, provide fallbacks.
   *    Can use generator.throw() to propagate errors.
   * 
   * Q: "What are the memory implications?"
   * A: Generators maintain lazy evaluation even when composed. Memory usage
   *    is proportional to nesting depth, not total data size.
   */
}

solveGeneratorComposition();

// ============================================================================
// INTERVIEW QUESTION 4: GENERATOR-BASED ASYNC CONTROL FLOW
// ============================================================================

function solveAsyncControlFlow() {
  console.log('\n--- Question 4: Generator-based Async Control Flow ---');
  
  /**
   * QUESTION: "Before async/await existed, generators were used to handle async code.
   * Implement a simple async flow runner that uses generators to sequence async operations."
   * 
   * This tests:
   * - Understanding of generators as coroutines
   * - Knowledge of pre-async/await async patterns
   * - Bidirectional communication with generators
   * - Promise integration with generators
   */
  
  console.log('=== ASYNC CONTROL FLOW SOLUTION ===');
  
  // Simple async runner implementation
  function asyncRunner(generatorFn) {
    const generator = generatorFn();
    
    function handle(result) {
      if (!result.done) {
        const value = result.value;
        
        // If yielded value is a Promise, handle it
        if (value && typeof value.then === 'function') {
          value
            .then(res => handle(generator.next(res)))
            .catch(err => handle(generator.throw(err)));
        } else {
          // If not a Promise, continue immediately
          handle(generator.next(value));
        }
      }
      // If done, async flow is complete
    }
    
    // Start the generator
    handle(generator.next());
  }
  
  // Enhanced version with return value and error handling
  function advancedAsyncRunner(generatorFn) {
    return new Promise((resolve, reject) => {
      const generator = generatorFn();
      
      function handle(result) {
        try {
          if (result.done) {
            resolve(result.value);
            return;
          }
          
          const value = result.value;
          
          if (value && typeof value.then === 'function') {
            value
              .then(res => handle(generator.next(res)))
              .catch(err => {
                try {
                  handle(generator.throw(err));
                } catch (genError) {
                  reject(genError);
                }
              });
          } else {
            handle(generator.next(value));
          }
        } catch (error) {
          reject(error);
        }
      }
      
      handle(generator.next());
    });
  }
  
  // Mock async functions for testing
  function delay(ms, value) {
    return new Promise(resolve => {
      setTimeout(() => resolve(value), ms);
    });
  }
  
  function mockAPICall(endpoint) {
    console.log(`  Making API call to: ${endpoint}`);
    return delay(100, { 
      endpoint, 
      data: `Data from ${endpoint}`,
      timestamp: Date.now()
    });
  }
  
  function mockFailingAPI(shouldFail = true) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('API call failed'));
        } else {
          resolve({ success: true });
        }
      }, 50);
    });
  }
  
  // Example generator functions using the async runner
  function* fetchUserData(userId) {
    try {
      console.log('  Starting user data fetch...');
      
      // Step 1: Fetch user profile
      console.log('  Fetching user profile...');
      const profile = yield mockAPICall(`/users/${userId}`);
      console.log('  Profile received:', profile.data);
      
      // Step 2: Fetch user posts
      console.log('  Fetching user posts...');
      const posts = yield mockAPICall(`/users/${userId}/posts`);
      console.log('  Posts received:', posts.data);
      
      // Step 3: Fetch user settings
      console.log('  Fetching user settings...');
      const settings = yield mockAPICall(`/users/${userId}/settings`);
      console.log('  Settings received:', settings.data);
      
      // Combine all data
      return {
        profile: profile.data,
        posts: posts.data,
        settings: settings.data,
        fetchedAt: Date.now()
      };
      
    } catch (error) {
      console.log('  Error in user data fetch:', error.message);
      throw error;
    }
  }
  
  function* errorHandlingExample() {
    try {
      console.log('  Attempting operation that might fail...');
      const result = yield mockFailingAPI(true);
      console.log('  Success:', result);
      return result;
    } catch (error) {
      console.log('  Caught error, trying fallback...');
      
      // Try a fallback operation
      const fallback = yield mockFailingAPI(false);
      console.log('  Fallback succeeded:', fallback);
      return fallback;
    }
  }
  
  // Demonstrate the async runners
  async function runAsyncDemos() {
    console.log('Running async flow demonstrations:');
    
    // Demo 1: Basic async flow
    console.log('\n1. Basic async flow:');
    await new Promise(resolve => {
      asyncRunner(function* () {
        const result = yield fetchUserData(123);
        console.log('  Final result keys:', Object.keys(result));
        resolve();
      });
    });
    
    // Demo 2: Advanced async runner with return value
    console.log('\n2. Advanced async runner with return value:');
    try {
      const userData = await advancedAsyncRunner(function* () {
        return yield* fetchUserData(456);
      });
      console.log('  Returned user data keys:', Object.keys(userData));
    } catch (error) {
      console.log('  Error caught by runner:', error.message);
    }
    
    // Demo 3: Error handling
    console.log('\n3. Error handling:');
    try {
      const result = await advancedAsyncRunner(errorHandlingExample);
      console.log('  Error handling result:', result);
    } catch (error) {
      console.log('  Unhandled error:', error.message);
    }
    
    // Demo 4: Comparison with modern async/await
    console.log('\n4. Modern async/await equivalent:');
    
    async function modernFetchUserData(userId) {
      try {
        console.log('  Starting modern user data fetch...');
        
        const profile = await mockAPICall(`/users/${userId}`);
        console.log('  Profile received:', profile.data);
        
        const posts = await mockAPICall(`/users/${userId}/posts`);
        console.log('  Posts received:', posts.data);
        
        const settings = await mockAPICall(`/users/${userId}/settings`);
        console.log('  Settings received:', settings.data);
        
        return {
          profile: profile.data,
          posts: posts.data, 
          settings: settings.data,
          fetchedAt: Date.now()
        };
      } catch (error) {
        console.log('  Error in modern fetch:', error.message);
        throw error;
      }
    }
    
    const modernResult = await modernFetchUserData(789);
    console.log('  Modern result keys:', Object.keys(modernResult));
    
    console.log('\n  Generator approach: More verbose but gave us async/await concepts');
    console.log('  Modern async/await: Much cleaner syntax, same underlying concepts');
  }
  
  return runAsyncDemos();
  
  /**
   * HISTORICAL CONTEXT FOR INTERVIEW:
   * 
   * Before async/await (ES2017), developers used generators for async control:
   * - Libraries like co.js implemented similar patterns
   * - yield would pause execution until Promise resolved
   * - This approach inspired the async/await syntax
   * - Understanding this shows deep knowledge of async evolution
   * 
   * Key concepts that transferred to async/await:
   * - Pausing/resuming execution
   * - Sequential async operations with clean syntax
   * - Error handling with try/catch
   * - Return values from async functions
   */
}

// ============================================================================
// INTERVIEW QUESTION 5: PERFORMANCE AND MEMORY ANALYSIS
// ============================================================================

function solvePerformanceAnalysis() {
  console.log('\n--- Question 5: Performance and Memory Analysis ---');
  
  /**
   * QUESTION: "Compare the memory usage and performance characteristics of
   * generators vs arrays for processing large datasets. When would you choose each?"
   * 
   * This tests:
   * - Understanding of lazy vs eager evaluation
   * - Memory complexity analysis
   * - Performance trade-offs knowledge
   * - Real-world decision making
   */
  
  console.log('=== PERFORMANCE ANALYSIS SOLUTION ===');
  
  // Memory usage demonstration
  function demonstrateMemoryUsage() {
    console.log('Memory usage comparison:');
    
    // Array approach - eager evaluation
    function createLargeArray(size) {
      console.log(`  Creating array of ${size} items...`);
      const start = Date.now();
      
      const array = [];
      for (let i = 0; i < size; i++) {
        array.push(i * i); // Some computation
      }
      
      const time = Date.now() - start;
      console.log(`  Array creation took: ${time}ms`);
      console.log(`  Array memory usage: ~${size * 8} bytes (rough estimate)`);
      
      return array;
    }
    
    // Generator approach - lazy evaluation
    function* createLargeGenerator(size) {
      console.log(`  Creating generator for ${size} items...`);
      
      for (let i = 0; i < size; i++) {
        yield i * i; // Same computation, done lazily
      }
    }
    
    // Performance comparison
    function measurePerformance(name, fn) {
      const start = Date.now();
      const result = fn();
      const end = Date.now();
      
      console.log(`  ${name}: ${end - start}ms`);
      return result;
    }
    
    const size = 100000;
    
    // Measure array creation
    console.log('\n1. Creation time:');
    const array = measurePerformance('Array creation', () => createLargeArray(size));
    const generator = measurePerformance('Generator creation', () => createLargeGenerator(size));
    
    // Measure processing first N elements
    console.log('\n2. Processing first 1000 elements:');
    
    measurePerformance('Array slice and process', () => {
      return array.slice(0, 1000).map(x => x * 2).filter(x => x > 100).length;
    });
    
    measurePerformance('Generator take and process', () => {
      let count = 0;
      let processed = 0;
      
      for (const value of generator) {
        if (count >= 1000) break;
        
        const doubled = value * 2;
        if (doubled > 100) {
          processed++;
        }
        count++;
      }
      
      return processed;
    });
    
    // Measure finding first element matching condition
    console.log('\n3. Finding first element > 1000000:');
    
    measurePerformance('Array find', () => {
      return array.find(x => x > 1000000);
    });
    
    measurePerformance('Generator find', () => {
      for (const value of createLargeGenerator(size)) {
        if (value > 1000000) {
          return value;
        }
      }
      return undefined;
    });
  }
  
  // Iterator overhead analysis
  function analyzeIteratorOverhead() {
    console.log('\nIterator overhead analysis:');
    
    function* simpleGenerator(count) {
      for (let i = 0; i < count; i++) {
        yield i;
      }
    }
    
    function simpleArray(count) {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(i);
      }
      return arr;
    }
    
    const count = 1000000;
    
    // Test iteration speed
    console.log(`\nIteration speed test (${count} elements):`);
    
    // Array iteration
    console.time('Array for...of');
    let sum1 = 0;
    for (const value of simpleArray(count)) {
      sum1 += value;
    }
    console.timeEnd('Array for...of');
    
    // Generator iteration
    console.time('Generator for...of');
    let sum2 = 0;
    for (const value of simpleGenerator(count)) {
      sum2 += value;
    }
    console.timeEnd('Generator for...of');
    
    console.log(`  Array sum: ${sum1}`);
    console.log(`  Generator sum: ${sum2}`);
    console.log(`  Results match: ${sum1 === sum2}`);
    
    // Manual iteration comparison
    console.log('\nManual iteration comparison:');
    
    console.time('Array indexed access');
    let sum3 = 0;
    const arr = simpleArray(count);
    for (let i = 0; i < arr.length; i++) {
      sum3 += arr[i];
    }
    console.timeEnd('Array indexed access');
    
    console.time('Generator manual next()');
    let sum4 = 0;
    const gen = simpleGenerator(count);
    let result = gen.next();
    while (!result.done) {
      sum4 += result.value;
      result = gen.next();
    }
    console.timeEnd('Generator manual next()');
    
    console.log(`  Indexed sum: ${sum3}`);
    console.log(`  Manual next sum: ${sum4}`);
  }
  
  // Decision matrix for when to use each
  function createDecisionMatrix() {
    console.log('\nDecision Matrix - When to use Generators vs Arrays:');
    
    const scenarios = [
      {
        scenario: 'Processing all elements',
        dataSize: 'Small',
        arrayScore: 9,
        generatorScore: 6,
        reason: 'Array access is faster, no iterator overhead'
      },
      {
        scenario: 'Processing all elements',
        dataSize: 'Large',
        arrayScore: 4,
        generatorScore: 8,
        reason: 'Generator saves memory, prevents OOM errors'
      },
      {
        scenario: 'Finding first match',
        dataSize: 'Any',
        arrayScore: 5,
        generatorScore: 9,
        reason: 'Generator stops early, doesn\'t compute unused values'
      },
      {
        scenario: 'Random access needed',
        dataSize: 'Any', 
        arrayScore: 10,
        generatorScore: 2,
        reason: 'Arrays support O(1) random access, generators are sequential'
      },
      {
        scenario: 'Multiple iterations',
        dataSize: 'Any',
        arrayScore: 8,
        generatorScore: 4,
        reason: 'Arrays cache results, generators recompute each time'
      },
      {
        scenario: 'Infinite sequences',
        dataSize: 'Infinite',
        arrayScore: 0,
        generatorScore: 10,
        reason: 'Impossible with arrays, natural with generators'
      },
      {
        scenario: 'Memory constrained',
        dataSize: 'Large',
        arrayScore: 2,
        generatorScore: 10,
        reason: 'Generators use O(1) memory, arrays use O(n)'
      }
    ];
    
    console.log('\n  Scenario Analysis (0-10 scale):');
    console.log('  ' + 'Scenario'.padEnd(20) + 'Size'.padEnd(10) + 'Array'.padEnd(8) + 'Generator'.padEnd(12) + 'Reason');
    console.log('  ' + '-'.repeat(80));
    
    scenarios.forEach(s => {
      const line = `  ${s.scenario.padEnd(20)}${s.dataSize.padEnd(10)}${s.arrayScore.toString().padEnd(8)}${s.generatorScore.toString().padEnd(12)}${s.reason}`;
      console.log(line);
    });
    
    console.log('\n  Key Decision Factors:');
    console.log('  ✓ Use Arrays when: Small data, multiple iterations, random access needed');
    console.log('  ✓ Use Generators when: Large data, single iteration, early termination possible');
    console.log('  ✓ Use Generators always for: Infinite sequences, memory-constrained environments');
  }
  
  // Run performance analysis
  demonstrateMemoryUsage();
  analyzeIteratorOverhead();
  createDecisionMatrix();
  
  /**
   * INTERVIEW SUMMARY POINTS:
   * 
   * Memory Characteristics:
   * - Arrays: O(n) memory usage, all elements stored
   * - Generators: O(1) memory usage, only current state stored
   * 
   * Performance Characteristics:
   * - Arrays: Faster iteration, O(1) random access, good for multiple passes
   * - Generators: Slower iteration, sequential only, good for single passes
   * 
   * When to Use Each:
   * - Arrays: Small datasets, random access, multiple iterations
   * - Generators: Large datasets, single iteration, early termination, infinite sequences
   * 
   * Real-world Applications:
   * - Arrays: UI data, configuration, cached results
   * - Generators: Stream processing, lazy data loading, mathematical sequences
   */
}

// Execute all demonstrations
console.log('Starting generator interview problem solutions...');

Promise.resolve()
  .then(() => solveAsyncControlFlow())
  .then(() => {
    solvePerformanceAnalysis();
    
    console.log('\n' + '='.repeat(60));
    console.log('GENERATOR INTERVIEW PREPARATION COMPLETE');
    console.log('='.repeat(60));
    
    console.log('\nKey Topics Mastered:');
    console.log('✓ Fibonacci sequence implementation');
    console.log('✓ Custom iterator protocol');
    console.log('✓ Generator composition and flattening');
    console.log('✓ Async control flow with generators');
    console.log('✓ Performance and memory analysis');
    
    console.log('\nInterview Strategy:');
    console.log('• Always explain the "why" behind using generators');
    console.log('• Discuss memory and performance implications');
    console.log('• Compare with alternative approaches');
    console.log('• Show understanding of lazy evaluation benefits');
    console.log('• Demonstrate knowledge of iterator protocol');
    
    console.log('\nCommon Follow-up Questions to Prepare:');
    console.log('• When would you NOT use a generator?');
    console.log('• How do generators compare to async/await?');
    console.log('• What are the performance trade-offs?'); 
    console.log('• How do you handle errors in generator pipelines?');
    console.log('• Can you implement [specific algorithm] with generators?');
    
    console.log('\nYou\'re now ready for generator-focused interviews! 🚀');
  })
  .catch(error => {
    console.error('Error in demonstrations:', error);
  });