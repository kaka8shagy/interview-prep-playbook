/**
 * File: fundamentals.js
 * Description: Core generator and iterator concepts with detailed explanations
 * 
 * Learning objectives:
 * - Understand the generator function syntax and iterator protocol
 * - Master the yield keyword and generator object behavior
 * - Learn the relationship between generators and iterators
 * - Grasp the mental model for pause-resume execution
 * 
 * This file consolidates: generator-basics.js, basic-generator.js, iterator-protocol.js
 */

console.log('=== Generator Fundamentals ===\n');

// ============================================================================
// PART 1: GENERATOR MENTAL MODEL
// ============================================================================

/**
 * MENTAL MODEL: What are Generators?
 * 
 * Think of generators as functions with superpowers:
 * 
 * 1. PAUSABLE EXECUTION: Unlike regular functions, generators can pause mid-execution
 *    and resume later from exactly where they left off
 * 
 * 2. STATE PRESERVATION: When paused, all local variables and execution state
 *    are preserved in memory
 * 
 * 3. BIDIRECTIONAL COMMUNICATION: Values can flow both INTO the generator (via .next(value))
 *    and OUT of the generator (via yield expressions)
 * 
 * 4. LAZY EVALUATION: Generators only compute values when requested, making them
 *    perfect for large or infinite sequences
 * 
 * Key insight: Generators return a generator object (which implements the Iterator protocol)
 * rather than executing their function body immediately.
 */

function demonstrateGeneratorBasics() {
  console.log('--- Generator Basics and Mental Model ---');
  
  // This is a generator function (note the asterisk *)
  // The asterisk can be placed in several positions:
  // function* name() {} - preferred style
  // function *name() {} - also valid
  // function * name() {} - also valid
  function* simpleGenerator() {
    console.log('  Generator started execution');
    
    // yield pauses the function and returns a value
    // The function's execution stops here until next() is called again
    yield 'First value';
    
    console.log('  Generator resumed after first yield');
    
    // Another yield - the function pauses again
    yield 'Second value';
    
    console.log('  Generator resumed after second yield');
    
    // return ends the generator and sets done: true
    return 'Final value';
    
    // This code never executes because we returned above
    console.log('  This will never print');
  }
  
  // Calling a generator function returns a generator object
  // The function body does NOT execute immediately
  console.log('1. Creating generator object...');
  const generator = simpleGenerator();
  console.log('   Generator created but not started yet');
  
  // The generator object implements the Iterator protocol
  // It has a next() method that returns {value, done}
  console.log('\n2. Calling next() to start execution...');
  let result = generator.next();
  console.log('   Result:', result); // {value: 'First value', done: false}
  
  console.log('\n3. Calling next() to resume execution...');
  result = generator.next();
  console.log('   Result:', result); // {value: 'Second value', done: false}
  
  console.log('\n4. Calling next() to finish execution...');
  result = generator.next();
  console.log('   Result:', result); // {value: 'Final value', done: true}
  
  console.log('\n5. Calling next() after generator is done...');
  result = generator.next();
  console.log('   Result:', result); // {value: undefined, done: true}
  
  /**
   * KEY OBSERVATIONS:
   * 1. Generator function creates a generator object, doesn't execute immediately
   * 2. First next() call starts execution until first yield
   * 3. Subsequent next() calls resume from the last yield point
   * 4. When generator returns or reaches end, done becomes true
   * 5. Calling next() on completed generator returns {value: undefined, done: true}
   */
}

demonstrateGeneratorBasics();

// ============================================================================
// PART 2: ITERATOR PROTOCOL DEEP DIVE
// ============================================================================

function demonstrateIteratorProtocol() {
  console.log('\n--- Iterator Protocol Implementation ---');
  
  /**
   * ITERATOR PROTOCOL: The Foundation
   * 
   * An object is an iterator if it implements the iterator interface:
   * - Has a next() method
   * - next() returns {value: any, done: boolean}
   * - When done is true, iteration is complete
   * 
   * An object is iterable if it implements the iterable interface:
   * - Has a Symbol.iterator method
   * - Symbol.iterator returns an iterator
   * 
   * Generators automatically implement both protocols!
   */
  
  // Manual iterator implementation (to understand the protocol)
  class NumberSequenceIterator {
    constructor(start, end) {
      this.current = start;
      this.end = end;
    }
    
    // This makes the object an iterator
    next() {
      if (this.current <= this.end) {
        // Still have values to yield
        return {
          value: this.current++,
          done: false
        };
      } else {
        // Iteration is complete
        return {
          value: undefined, // Could be any value, typically undefined
          done: true
        };
      }
    }
    
    // This makes the object iterable (can be used with for...of)
    [Symbol.iterator]() {
      // Return an iterator - in this case, the object itself
      return this;
    }
  }
  
  // Using the manual iterator
  console.log('Manual iterator implementation:');
  const numberIterator = new NumberSequenceIterator(1, 3);
  
  console.log('  Calling next() manually:');
  console.log('   ', numberIterator.next()); // {value: 1, done: false}
  console.log('   ', numberIterator.next()); // {value: 2, done: false}
  console.log('   ', numberIterator.next()); // {value: 3, done: false}
  console.log('   ', numberIterator.next()); // {value: undefined, done: true}
  
  // Since it's iterable, we can use for...of
  console.log('\n  Using for...of loop:');
  for (const num of new NumberSequenceIterator(5, 7)) {
    console.log('   ', num);
  }
  
  // Now let's see the same thing with a generator (much simpler!)
  function* numberSequenceGenerator(start, end) {
    // This generator does the same thing as the manual iterator above
    // but with much less code and automatic iterator protocol implementation
    for (let i = start; i <= end; i++) {
      yield i;
    }
    // No need to explicitly return {done: true} - it's automatic
  }
  
  console.log('\nGenerator equivalent:');
  const generator = numberSequenceGenerator(1, 3);
  
  console.log('  Calling next() manually:');
  console.log('   ', generator.next()); // {value: 1, done: false}
  console.log('   ', generator.next()); // {value: 2, done: false}
  console.log('   ', generator.next()); // {value: 3, done: false}
  console.log('   ', generator.next()); // {value: undefined, done: true}
  
  console.log('\n  Using for...of loop:');
  for (const num of numberSequenceGenerator(5, 7)) {
    console.log('   ', num);
  }
  
  /**
   * GENERATOR ADVANTAGES:
   * 1. Automatically implements both Iterator and Iterable protocols
   * 2. Much less boilerplate code
   * 3. Natural flow control with yield
   * 4. Automatic done: true when function ends
   * 5. Built-in state management
   */
}

demonstrateIteratorProtocol();

// ============================================================================
// PART 3: BIDIRECTIONAL COMMUNICATION
// ============================================================================

function demonstrateBidirectionalCommunication() {
  console.log('\n--- Bidirectional Communication ---');
  
  /**
   * ADVANCED CONCEPT: Generators can receive values
   * 
   * The yield expression can receive values passed via next(value)
   * This enables powerful patterns like coroutines and state machines
   * 
   * Key insight: The first next() call starts the generator but cannot send a value
   * (there's no yield to receive it). Subsequent next(value) calls send values.
   */
  
  function* communicatingGenerator() {
    console.log('  Generator started');
    
    // This yield returns 'hello' to the caller
    // AND receives whatever value is passed to next()
    const firstReceived = yield 'hello';
    console.log('  Generator received:', firstReceived);
    
    // We can use the received value in our logic
    const response = `You said: ${firstReceived}`;
    const secondReceived = yield response;
    console.log('  Generator received:', secondReceived);
    
    return 'Generator finished';
  }
  
  const generator = communicatingGenerator();
  
  console.log('Step 1: Start generator (no value sent)');
  let result = generator.next(); // Start the generator
  console.log('  Received:', result.value); // 'hello'
  
  console.log('\nStep 2: Send "world" to generator');
  result = generator.next('world'); // Send 'world' to the generator
  console.log('  Received:', result.value); // 'You said: world'
  
  console.log('\nStep 3: Send "goodbye" to generator');
  result = generator.next('goodbye'); // Send 'goodbye' to the generator
  console.log('  Received:', result.value); // 'Generator finished'
  console.log('  Done:', result.done); // true
  
  /**
   * PRACTICAL EXAMPLE: Echo Server Pattern
   * 
   * This pattern is useful for building stateful processors
   * that respond differently based on input
   */
  
  function* echoServer() {
    console.log('\n  Echo server started. Send messages!');
    let messageCount = 0;
    
    while (true) { // Infinite loop - generator runs forever
      // Wait for a message from the outside
      const message = yield `Ready for message ${messageCount + 1}`;
      
      if (message === 'quit') {
        return 'Echo server shutting down';
      }
      
      messageCount++;
      console.log(`  Echo ${messageCount}: ${message}`);
    }
  }
  
  console.log('\nEcho Server Demo:');
  const echoGen = echoServer();
  
  // Start the echo server
  console.log('Starting:', echoGen.next().value);
  
  // Send some messages
  console.log('Response:', echoGen.next('Hello').value);
  console.log('Response:', echoGen.next('How are you?').value);
  console.log('Response:', echoGen.next('quit').value);
}

demonstrateBidirectionalCommunication();

// ============================================================================
// PART 4: GENERATOR METHODS AND ERROR HANDLING
// ============================================================================

function demonstrateGeneratorMethods() {
  console.log('\n--- Generator Methods and Error Handling ---');
  
  /**
   * GENERATOR OBJECT METHODS:
   * 
   * 1. next(value) - Resume execution, optionally send a value
   * 2. throw(error) - Throw an error at the current yield point
   * 3. return(value) - Force generator to return with given value
   */
  
  function* errorHandlingGenerator() {
    try {
      console.log('  Generator started');
      
      const value1 = yield 'First yield';
      console.log('  Received:', value1);
      
      const value2 = yield 'Second yield';  
      console.log('  Received:', value2);
      
      return 'Normal completion';
      
    } catch (error) {
      console.log('  Generator caught error:', error.message);
      yield 'Error handled';
      return 'Recovered from error';
    } finally {
      console.log('  Generator cleanup (finally block)');
    }
  }
  
  // Demo 1: Normal execution
  console.log('Demo 1: Normal execution');
  let gen = errorHandlingGenerator();
  console.log('1.', gen.next().value); // 'First yield'
  console.log('2.', gen.next('normal value').value); // 'Second yield'
  console.log('3.', gen.next('another value')); // {value: 'Normal completion', done: true}
  
  // Demo 2: Error injection
  console.log('\nDemo 2: Error injection with throw()');
  gen = errorHandlingGenerator();
  console.log('1.', gen.next().value); // 'First yield'
  
  // Instead of next(), we throw an error into the generator
  try {
    console.log('2.', gen.throw(new Error('Injected error')).value); // 'Error handled'
    console.log('3.', gen.next()); // {value: 'Recovered from error', done: true}
  } catch (error) {
    console.log('Uncaught error:', error.message);
  }
  
  // Demo 3: Early return with return()
  console.log('\nDemo 3: Early termination with return()');
  gen = errorHandlingGenerator();
  console.log('1.', gen.next().value); // 'First yield'
  
  // Force the generator to return early
  console.log('2.', gen.return('Forced return')); // {value: 'Forced return', done: true}
  console.log('3.', gen.next()); // {value: undefined, done: true} - generator is done
  
  /**
   * PRACTICAL IMPLICATIONS:
   * 
   * 1. throw() enables error injection for testing and error handling
   * 2. return() allows early termination and cleanup
   * 3. try/catch/finally works normally within generators
   * 4. These methods make generators suitable for complex control flow
   */
}

demonstrateGeneratorMethods();

// ============================================================================
// PART 5: BUILT-IN ITERABLE INTEGRATION
// ============================================================================

function demonstrateIterableIntegration() {
  console.log('\n--- Generator Integration with Built-in Iterables ---');
  
  /**
   * GENERATORS WORK SEAMLESSLY WITH:
   * - for...of loops
   * - Array.from()
   * - Spread operator (...)
   * - Destructuring assignment
   * - Array methods that expect iterables
   */
  
  function* fibonacciGenerator(limit) {
    let a = 0, b = 1;
    
    while (a <= limit) {
      yield a;
      [a, b] = [b, a + b]; // Parallel assignment for next fibonacci number
    }
  }
  
  console.log('Fibonacci numbers up to 20:');
  
  // 1. for...of loop (most common usage)
  console.log('Using for...of:');
  for (const num of fibonacciGenerator(20)) {
    console.log('  ', num);
  }
  
  // 2. Array.from() to collect all values
  console.log('\nUsing Array.from():');
  const fibArray = Array.from(fibonacciGenerator(20));
  console.log('  ', fibArray);
  
  // 3. Spread operator
  console.log('\nUsing spread operator:');
  const fibSpread = [...fibonacciGenerator(20)];
  console.log('  ', fibSpread);
  
  // 4. Destructuring assignment
  console.log('\nUsing destructuring (first 5 values):');
  const [first, second, third, fourth, fifth] = fibonacciGenerator(100);
  console.log('  ', { first, second, third, fourth, fifth });
  
  // 5. With array methods
  console.log('\nUsing with array methods:');
  const evenFibs = Array.from(fibonacciGenerator(50)).filter(n => n % 2 === 0);
  console.log('  Even fibonacci numbers:', evenFibs);
  
  /**
   * PERFORMANCE CONSIDERATION:
   * 
   * Notice that Array.from() and spread operator collect ALL values into memory.
   * This defeats the lazy evaluation benefit of generators.
   * 
   * Use for...of when you want to process items one at a time.
   * Use Array.from/spread only when you need all values collected.
   */
  
  // Demonstrating memory efficiency with large sequences
  function* largeSequence(limit) {
    console.log('  Generating large sequence...');
    for (let i = 0; i < limit; i++) {
      // Each value is generated on-demand
      yield i * i;
    }
  }
  
  console.log('\nMemory-efficient processing of large sequence:');
  let count = 0;
  for (const value of largeSequence(1000000)) {
    // Process only the first few values without loading all into memory
    if (count++ < 5) {
      console.log('  ', value);
    } else {
      break;
    }
  }
  console.log('  ... (and 999,995 more values available on-demand)');
}

demonstrateIterableIntegration();

/**
 * SUMMARY OF FUNDAMENTAL CONCEPTS:
 * 
 * 1. Generator Functions:
 *    - Defined with function* syntax
 *    - Return generator objects (which are iterators)
 *    - Can pause/resume execution with yield
 * 
 * 2. Iterator Protocol:
 *    - Generators automatically implement iterator interface
 *    - next() method returns {value, done} objects
 *    - Compatible with all built-in iteration mechanisms
 * 
 * 3. Bidirectional Communication:
 *    - yield can both send and receive values
 *    - Enables powerful patterns like coroutines
 *    - throw() and return() methods for error handling and early termination
 * 
 * 4. Integration Benefits:
 *    - Works with for...of, spread, destructuring
 *    - Lazy evaluation saves memory
 *    - Natural fit for sequences and data processing
 * 
 * 5. Key Mental Models:
 *    - Think of generators as pausable functions
 *    - yield is like a two-way communication point
 *    - Generator objects are iterators with additional capabilities
 * 
 * Next Topics:
 * - Advanced patterns (yield*, infinite sequences)
 * - Practical applications (state machines, async flow)
 * - Performance considerations and optimizations
 */

console.log('\nGenerator fundamentals complete!');
console.log('Next: See advanced-patterns.js for yield delegation and infinite sequences');