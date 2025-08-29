/**
 * File: async-patterns.js
 * Description: Advanced async/await patterns and Promise interactions with event loop
 * 
 * Learning objectives:
 * - Understand how async/await creates microtasks under the hood
 * - Master the execution timing of complex Promise chains
 * - Learn common async/await pitfalls and debugging techniques
 * - See how async functions interact with the event loop
 * 
 * This file consolidates: async-await-puzzle.js, performance-optimization.js
 */

console.log('=== Advanced Async Patterns ===\n');

// ============================================================================
// PART 1: ASYNC/AWAIT MENTAL MODEL
// ============================================================================

/**
 * CRITICAL UNDERSTANDING: What async/await really does
 * 
 * async/await is syntactic sugar over Promises, but it's important to understand
 * the underlying microtask scheduling to predict execution order correctly.
 * 
 * KEY CONCEPTS:
 * 1. async function always returns a Promise
 * 2. await pauses execution and schedules continuation as microtask
 * 3. Code after await runs in a separate microtask  
 * 4. Multiple awaits create multiple microtask scheduling points
 */

async function demonstrateAsyncMicrotasks() {
  console.log('--- How async/await creates microtasks ---');
  
  // This function shows the microtask scheduling behavior
  console.log('1. Sync: Function start (before any await)');
  
  // When we await, the function pauses here
  // The continuation (everything after await) gets scheduled as a microtask
  await Promise.resolve();
  
  // This line runs in a microtask (continuation after await)
  console.log('3. Microtask: After first await');
  
  // Another await creates another scheduling point
  await Promise.resolve(); 
  
  // This runs in yet another microtask
  console.log('4. Microtask: After second await');
  
  return 'async function complete';
}

function demonstrateAsyncVsPromises() {
  console.log('Comparing async/await with explicit Promises:');
  
  // Synchronous code runs first
  console.log('2. Sync: Before calling async function');
  
  // Call the async function
  demonstrateAsyncMicrotasks().then(result => {
    console.log('5. Microtask: Async function result:', result);
  });
  
  // More synchronous code
  console.log('6. Sync: After calling async function');
  
  /**
   * EXECUTION ORDER: 1, 2, 6, 3, 4, 5
   * 
   * EXPLANATION:
   * 1. "Function start" - sync execution begins
   * 2. "Before calling" - sync code continues  
   * 3. "After calling" - sync code completes (async function paused at first await)
   * 4. "After first await" - first microtask from await continuation
   * 5. "After second await" - second microtask from second await  
   * 6. "Async function result" - microtask from .then() on return value
   */
}

demonstrateAsyncVsPromises();

// ============================================================================
// PART 2: CLASSIC INTERVIEW PUZZLE
// ============================================================================

function classicAsyncAwaitPuzzle() {
  console.log('\n--- Classic Interview Puzzle ---');
  console.log('Try to predict the output order before running!');
  
  // This is a very common interview question that tests deep understanding
  async function async1() {
    console.log('async1 start');
    
    // await creates a microtask scheduling point
    // Everything after this await will run as a microtask
    await async2();
    
    // This runs in a microtask (after async2 completes)
    console.log('async1 end');
  }
  
  async function async2() {
    // This runs synchronously when called
    console.log('async2');
    // Since there's no await here, this function completes synchronously
    // But it still returns a Promise (because it's async)
  }
  
  // Start of synchronous execution
  console.log('script start');
  
  // Schedule a macrotask
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);
  
  // Call async function - this starts synchronous execution
  async1();
  
  // Create a Promise - the executor runs synchronously
  new Promise((resolve) => {
    console.log('promise1'); // This runs immediately (synchronous)
    resolve(); // This schedules the .then callback as microtask
  }).then(() => {
    console.log('promise2'); // This runs as microtask
  });
  
  // More synchronous code
  console.log('script end');
  
  /**
   * CORRECT OUTPUT ORDER:
   * script start
   * async1 start  
   * async2
   * promise1
   * script end
   * async1 end
   * promise2  
   * setTimeout
   * 
   * DETAILED EXPLANATION:
   * 
   * SYNCHRONOUS PHASE:
   * 1. "script start" - obvious sync code
   * 2. "async1 start" - async1() called, runs until first await
   * 3. "async2" - async2() called synchronously, completes immediately  
   * 4. "promise1" - Promise executor runs synchronously
   * 5. "script end" - remaining sync code
   * 
   * MICROTASK PHASE:
   * 6. "async1 end" - continuation after await async2()
   * 7. "promise2" - .then() callback from Promise
   * 
   * MACROTASK PHASE: 
   * 8. "setTimeout" - setTimeout callback
   */
}

setTimeout(classicAsyncAwaitPuzzle, 100);

// ============================================================================  
// PART 3: PERFORMANCE OPTIMIZATION PATTERNS
// ============================================================================

function performanceOptimizationPatterns() {
  console.log('\n--- Performance Optimization with Event Loop ---');
  
  /**
   * PATTERN 1: YIELDING CONTROL TO PREVENT UI BLOCKING
   * 
   * When you have heavy computation, you can use the event loop
   * to break it into chunks and allow other tasks to run.
   */
  
  async function processLargeDatasetOptimized(data) {
    console.log(`Processing ${data.length} items with yielding...`);
    const results = [];
    const batchSize = 100; // Process 100 items at a time
    
    for (let i = 0; i < data.length; i += batchSize) {
      // Process a batch synchronously
      const batch = data.slice(i, i + batchSize);
      
      for (const item of batch) {
        // Simulate some processing work
        results.push(item * 2);
      }
      
      console.log(`Processed ${Math.min(i + batchSize, data.length)} of ${data.length} items`);
      
      // Yield control back to the event loop
      // This allows other microtasks, macrotasks, and UI updates to run
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Alternative yielding methods:
      // await new Promise(resolve => resolve()); // Microtask yield (less yielding)
      // await scheduler.postTask?.(() => {}, {priority: 'user-blocking'}); // Modern API
    }
    
    console.log('Optimized processing complete');
    return results;
  }
  
  /**
   * PATTERN 2: AVOIDING MICROTASK EXHAUSTION
   * 
   * When chaining many operations, be careful not to create
   * infinitely recursive microtasks that starve macrotasks.
   */
  
  function processQueueSafely(queue, processor) {
    console.log('Processing queue with macrotask scheduling...');
    
    function processNext() {
      if (queue.length === 0) {
        console.log('Queue processing complete');
        return;
      }
      
      // Process one item
      const item = queue.shift();
      processor(item);
      console.log(`Processed item: ${item}, remaining: ${queue.length}`);
      
      // Schedule next processing as macrotask to allow other work
      // This prevents microtask exhaustion
      setTimeout(processNext, 0);
    }
    
    // Start processing
    processNext();
  }
  
  /**
   * PATTERN 3: DEBOUNCING WITH EVENT LOOP AWARENESS
   * 
   * Proper debouncing needs to understand how timers interact
   * with the event loop for optimal performance.
   */
  
  function createEventLoopAwareDebounce(func, delay) {
    let timeoutId;
    let lastCallTime;
    
    return function debouncedFunction(...args) {
      const now = Date.now();
      lastCallTime = now;
      
      // Clear existing timeout
      clearTimeout(timeoutId);
      
      // Schedule new execution
      timeoutId = setTimeout(() => {
        // Double-check timing in case of rapid calls
        if (Date.now() - lastCallTime >= delay) {
          func.apply(this, args);
        }
      }, delay);
      
      console.log(`Debounced call scheduled for ${delay}ms from now`);
    };
  }
  
  // Demonstrate the patterns
  const mockData = Array.from({length: 250}, (_, i) => i + 1);
  
  console.log('Demonstrating optimized processing...');
  processLargeDatasetOptimized(mockData.slice(0, 10)); // Small demo
  
  setTimeout(() => {
    console.log('\nDemonstrating safe queue processing...');
    const queue = [1, 2, 3, 4, 5];
    processQueueSafely(queue, (item) => {
      // Simulate some work
      const result = item * item;
      return result;
    });
  }, 200);
  
  setTimeout(() => {
    console.log('\nDemonstrating event loop aware debouncing...');
    const debouncedLog = createEventLoopAwareDebounce(
      (message) => console.log(`Debounced execution: ${message}`), 
      100
    );
    
    // Rapid calls - only last one should execute
    debouncedLog('call 1');
    debouncedLog('call 2'); 
    debouncedLog('call 3');
  }, 400);
}

setTimeout(performanceOptimizationPatterns, 200);

// ============================================================================
// PART 4: DEBUGGING COMPLEX ASYNC FLOWS  
// ============================================================================

function debuggingAsyncFlows() {
  console.log('\n--- Debugging Complex Async Flows ---');
  
  /**
   * DEBUGGING STRATEGY: Async Call Stack Tracking
   * 
   * When debugging complex async code, it's helpful to track
   * the relationship between different async operations.
   */
  
  class AsyncFlowTracker {
    constructor() {
      this.operations = [];
      this.currentId = 0;
    }
    
    startOperation(name) {
      const id = ++this.currentId;
      const operation = {
        id,
        name,
        startTime: Date.now(),
        status: 'running',
        children: []
      };
      
      this.operations.push(operation);
      console.log(`🟢 Started: ${name} (id: ${id})`);
      
      return id;
    }
    
    completeOperation(id, result = null) {
      const operation = this.operations.find(op => op.id === id);
      if (operation) {
        operation.status = 'completed';
        operation.endTime = Date.now();
        operation.duration = operation.endTime - operation.startTime;
        operation.result = result;
        
        console.log(`✅ Completed: ${operation.name} (${operation.duration}ms)`);
      }
    }
    
    addChildOperation(parentId, childId) {
      const parent = this.operations.find(op => op.id === parentId);
      if (parent) {
        parent.children.push(childId);
      }
    }
    
    getReport() {
      console.log('\n--- Async Flow Report ---');
      const completed = this.operations.filter(op => op.status === 'completed');
      const totalDuration = completed.reduce((sum, op) => sum + op.duration, 0);
      
      console.log(`Total operations: ${this.operations.length}`);
      console.log(`Completed operations: ${completed.length}`);
      console.log(`Total duration: ${totalDuration}ms`);
      
      return {
        operations: this.operations,
        summary: { total: this.operations.length, completed: completed.length, totalDuration }
      };
    }
  }
  
  // Demonstrate async debugging
  const tracker = new AsyncFlowTracker();
  
  async function complexAsyncFlow() {
    const mainId = tracker.startOperation('Main async flow');
    
    try {
      // Parallel operations
      const op1Id = tracker.startOperation('Parallel operation 1');
      const op2Id = tracker.startOperation('Parallel operation 2');
      
      tracker.addChildOperation(mainId, op1Id);
      tracker.addChildOperation(mainId, op2Id);
      
      const [result1, result2] = await Promise.all([
        new Promise(resolve => {
          setTimeout(() => {
            tracker.completeOperation(op1Id, 'Result 1');
            resolve('Result 1');
          }, 50);
        }),
        new Promise(resolve => {
          setTimeout(() => {
            tracker.completeOperation(op2Id, 'Result 2');
            resolve('Result 2');
          }, 30);
        })
      ]);
      
      // Sequential operation based on results
      const op3Id = tracker.startOperation('Sequential operation');
      tracker.addChildOperation(mainId, op3Id);
      
      const finalResult = await new Promise(resolve => {
        setTimeout(() => {
          const combined = `${result1} + ${result2}`;
          tracker.completeOperation(op3Id, combined);
          resolve(combined);
        }, 20);
      });
      
      tracker.completeOperation(mainId, finalResult);
      return finalResult;
      
    } catch (error) {
      tracker.completeOperation(mainId, `Error: ${error.message}`);
      throw error;
    }
  }
  
  // Run the complex flow and generate report
  complexAsyncFlow().then(result => {
    console.log(`Final result: ${result}`);
    tracker.getReport();
  });
}

setTimeout(debuggingAsyncFlows, 600);

/**
 * SUMMARY OF ASYNC PATTERNS:
 * 
 * 1. Async/Await Mechanics:
 *    - Each await creates a microtask scheduling point
 *    - Code after await runs in separate microtask
 *    - Understanding this predicts execution order
 * 
 * 2. Performance Optimization:
 *    - Yield control to prevent blocking with setTimeout(fn, 0)  
 *    - Process large datasets in batches
 *    - Avoid microtask exhaustion patterns
 * 
 * 3. Debugging Strategies:
 *    - Track async operation lifecycles
 *    - Use consistent logging patterns  
 *    - Monitor timing and dependencies
 * 
 * 4. Common Pitfalls:
 *    - Assuming async functions run synchronously
 *    - Not yielding control during heavy computation
 *    - Creating infinite microtask loops
 * 
 * Key Interview Points:
 * - Explain why await creates microtasks
 * - Predict execution order in complex scenarios
 * - Discuss performance implications of async patterns
 * - Show debugging techniques for async code
 */

console.log('\nAsync patterns demonstration ready!');
console.log('Next: See performance-optimization.js for advanced performance techniques');