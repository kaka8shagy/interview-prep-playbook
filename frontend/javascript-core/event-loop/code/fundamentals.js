/**
 * File: fundamentals.js
 * Description: Core event loop concepts with detailed execution order explanations
 * 
 * Learning objectives:
 * - Understand the event loop architecture and execution phases
 * - Master the difference between microtasks and macrotasks
 * - Learn how synchronous code, promises, and timers interact
 * - Grasp the mental model for predicting execution order
 * 
 * This file consolidates: basic-example.js, nested-promises-timers.js, microtask-exhaustion.js
 */

console.log('=== Event Loop Fundamentals ===\n');

// ============================================================================
// PART 1: THE MENTAL MODEL - HOW EVENT LOOP WORKS
// ============================================================================

/**
 * MENTAL MODEL: The JavaScript Runtime Architecture
 * 
 * Think of the JavaScript runtime as having these components:
 * 
 * 1. CALL STACK (LIFO - Last In, First Out)
 *    - Where synchronous code executes
 *    - Functions are pushed on when called, popped off when return
 *    - Must be empty before event loop processes queues
 * 
 * 2. MICROTASK QUEUE (High Priority)
 *    - Promise.then/catch/finally callbacks
 *    - queueMicrotask() callbacks  
 *    - MutationObserver callbacks (browser)
 *    - ALL microtasks run before ANY macrotask
 * 
 * 3. MACROTASK QUEUE (Lower Priority)  
 *    - setTimeout/setInterval callbacks
 *    - setImmediate callbacks (Node.js)
 *    - I/O callbacks, DOM events (browser)
 *    - Only ONE macrotask runs per event loop iteration
 * 
 * 4. EVENT LOOP (The Orchestrator)
 *    - Continuously monitors call stack and queues
 *    - Enforces the execution priority rules
 */

function demonstrateBasicEventLoop() {
  console.log('--- Basic Event Loop Execution Order ---');
  
  // Step 1: Synchronous code - executes immediately on call stack
  console.log('1. Sync: Call stack execution');
  
  // Step 2: Schedule macrotask - goes to macrotask queue
  // The callback won't execute until call stack is empty AND all microtasks done
  setTimeout(() => {
    console.log('4. Macrotask: setTimeout callback');
  }, 0); // Even with 0ms delay, this is still a macrotask
  
  // Step 3: Schedule microtask - goes to microtask queue  
  // Promise.resolve() creates an already-resolved promise
  // .then() schedules its callback as a microtask
  Promise.resolve().then(() => {
    console.log('3. Microtask: Promise.then callback');
  });
  
  // Step 4: More synchronous code - executes immediately
  console.log('2. Sync: More call stack execution');
  
  // EXECUTION ORDER EXPLANATION:
  // 1. All synchronous code runs first (console.log statements 1 & 2)
  // 2. Call stack becomes empty, event loop starts processing queues
  // 3. ALL microtasks run first (Promise.then - statement 3)  
  // 4. Only then does ONE macrotask run (setTimeout - statement 4)
}

demonstrateBasicEventLoop();

// ============================================================================
// PART 2: NESTED PROMISES AND TIMERS - COMPLEX SCENARIOS
// ============================================================================

function demonstrateNestedExecution() {
  console.log('\n--- Nested Promises and Timers ---');
  
  // This demonstrates how nesting affects execution order
  // Pay attention to when each callback gets scheduled vs when it executes
  
  console.log('A. Sync: Start');
  
  // Outer setTimeout - schedules a macrotask
  setTimeout(() => {
    console.log('E. Macrotask 1: Outer timeout start');
    
    // Inside macrotask, schedule another macrotask
    // This goes to the BACK of the macrotask queue
    setTimeout(() => {
      console.log('I. Macrotask 3: Inner timeout (nested in first timeout)');
    }, 0);
    
    // Inside macrotask, schedule a microtask
    // Microtasks from within macrotasks still have priority over next macrotasks
    Promise.resolve().then(() => {
      console.log('F. Microtask 3: Promise inside first timeout');
    });
    
    console.log('G. Sync: End of first timeout');
  }, 0);
  
  // Another setTimeout at same level - this competes with the first one
  setTimeout(() => {
    console.log('H. Macrotask 2: Second timeout');
  }, 0);
  
  // Outer Promise - schedules a microtask
  Promise.resolve().then(() => {
    console.log('C. Microtask 1: Outer Promise');
    
    // Inside microtask, schedule another microtask
    // This gets added to microtask queue and runs in the same event loop iteration
    Promise.resolve().then(() => {
      console.log('D. Microtask 2: Nested Promise');
    });
  });
  
  console.log('B. Sync: End');
  
  /**
   * EXECUTION ORDER: A, B, C, D, E, G, F, H, I
   * 
   * EXPLANATION:
   * 1. Sync code: A, B (call stack)
   * 2. All microtasks: C, D (microtask queue emptied completely)
   * 3. First macrotask: E, G (first setTimeout executes)
   * 4. Microtasks from macrotask: F (microtask queue processed again)  
   * 5. Second macrotask: H (second setTimeout executes)
   * 6. Third macrotask: I (nested setTimeout executes)
   * 
   * KEY INSIGHT: After each macrotask, the event loop checks microtasks again
   */
}

setTimeout(demonstrateNestedExecution, 100); // Delay to separate from first demo

// ============================================================================
// PART 3: MICROTASK EXHAUSTION - PERFORMANCE IMPLICATIONS  
// ============================================================================

function demonstrateMicrotaskExhaustion() {
  console.log('\n--- Microtask Exhaustion Patterns ---');
  
  // DANGEROUS PATTERN: Infinite microtasks can starve macrotasks
  // This is a common cause of "hanging" JavaScript applications
  
  let microtaskCount = 0;
  const maxMicrotasks = 5; // Limit to prevent infinite loop
  
  function scheduleMicrotask() {
    if (microtaskCount < maxMicrotasks) {
      microtaskCount++;
      
      // Each microtask schedules another microtask
      // This keeps the microtask queue non-empty
      Promise.resolve().then(() => {
        console.log(`  Microtask ${microtaskCount} executing`);
        scheduleMicrotask(); // Recursive scheduling
      });
    }
  }
  
  console.log('Scheduling microtasks and macrotask...');
  
  // Schedule a macrotask - this should run AFTER all microtasks
  setTimeout(() => {
    console.log('  Macrotask: This runs after ALL microtasks complete');
  }, 0);
  
  // Start the microtask chain
  scheduleMicrotask();
  
  console.log('Synchronous code complete, starting event loop...');
  
  /**
   * CRITICAL UNDERSTANDING: Microtask Priority
   * 
   * - Event loop MUST empty the microtask queue before processing macrotasks
   * - If microtasks keep adding more microtasks, macrotasks wait indefinitely
   * - This can cause UI freezing in browsers or callback starvation in Node.js
   * 
   * PREVENTION STRATEGIES:
   * 1. Limit recursive microtask scheduling
   * 2. Use setTimeout(fn, 0) to yield control to macrotasks
   * 3. Monitor microtask queue depth in performance-critical code
   */
}

setTimeout(demonstrateMicrotaskExhaustion, 200); // Delay for demo separation

// ============================================================================
// PART 4: PRACTICAL DEBUGGING TECHNIQUES
// ============================================================================

function createExecutionTracker() {
  // This utility helps debug complex async execution order
  // Use this pattern when debugging confusing async behavior
  
  const executionLog = [];
  let stepCounter = 0;
  
  function logStep(description, type = 'unknown') {
    const step = ++stepCounter;
    const logEntry = {
      step,
      description, 
      type,
      timestamp: Date.now(),
      stackDepth: new Error().stack.split('\n').length
    };
    
    executionLog.push(logEntry);
    console.log(`${step}. [${type.toUpperCase()}] ${description}`);
  }
  
  function getExecutionSummary() {
    console.log('\n--- Execution Summary ---');
    const summary = {
      totalSteps: executionLog.length,
      byType: {}
    };
    
    executionLog.forEach(entry => {
      summary.byType[entry.type] = (summary.byType[entry.type] || 0) + 1;
    });
    
    console.log(`Total execution steps: ${summary.totalSteps}`);
    Object.entries(summary.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} steps`);
    });
    
    return summary;
  }
  
  return { logStep, getExecutionSummary };
}

function demonstrateDebuggingTechnique() {
  console.log('\n--- Debugging Complex Execution Order ---');
  
  const tracker = createExecutionTracker();
  
  tracker.logStep('Starting complex async flow', 'sync');
  
  // Multiple nested async operations
  setTimeout(() => {
    tracker.logStep('First timeout executing', 'macrotask');
    
    Promise.resolve().then(() => {
      tracker.logStep('Promise in timeout executing', 'microtask');
      
      setTimeout(() => {
        tracker.logStep('Nested timeout executing', 'macrotask');
        
        // Show summary after all async operations
        tracker.getExecutionSummary();
      }, 0);
    });
  }, 0);
  
  Promise.resolve().then(() => {
    tracker.logStep('Main promise executing', 'microtask');
    
    Promise.resolve().then(() => {
      tracker.logStep('Chained promise executing', 'microtask');
    });
  });
  
  tracker.logStep('Sync code complete', 'sync');
}

setTimeout(demonstrateDebuggingTechnique, 300); // Final demo

// ============================================================================
// EDUCATIONAL UTILITIES FOR TESTING UNDERSTANDING
// ============================================================================

/**
 * Quiz function to test event loop understanding
 * Use this to verify your mental model is correct
 */
function eventLoopQuiz() {
  console.log('\n--- Event Loop Quiz ---');
  console.log('Predict the output order, then run to check:');
  
  // Don't look at the numbers! Try to predict the order first.
  console.log('Start');
  
  setTimeout(() => console.log('Timer 1'), 0);
  
  Promise.resolve().then(() => {
    console.log('Promise 1');
    return Promise.resolve();
  }).then(() => {
    console.log('Promise 2');
  });
  
  setTimeout(() => console.log('Timer 2'), 0);
  
  Promise.resolve().then(() => console.log('Promise 3'));
  
  console.log('End');
  
  // ANSWER: Start, End, Promise 1, Promise 3, Promise 2, Timer 1, Timer 2
  // 
  // REASONING:
  // 1. Sync: Start, End
  // 2. Microtasks: Promise 1, Promise 3, Promise 2 (note: Promise 2 is chained)
  // 3. Macrotasks: Timer 1, Timer 2 (in order they were scheduled)
}

setTimeout(eventLoopQuiz, 400);

/**
 * SUMMARY OF FUNDAMENTAL CONCEPTS:
 * 
 * 1. Execution Priority: Sync → Microtasks → Macrotasks
 * 2. Queue Processing: All microtasks before ANY macrotask  
 * 3. Recursive Scheduling: Microtasks can block macrotasks
 * 4. Debugging Strategy: Use logging and step tracking
 * 
 * COMMON MISCONCEPTIONS:
 * - setTimeout(fn, 0) runs immediately (NO - it's still a macrotask)
 * - Promises run synchronously (NO - .then() callbacks are microtasks)
 * - Event loop is random (NO - it follows strict priority rules)
 * 
 * PERFORMANCE IMPLICATIONS:
 * - Heavy microtask usage can block UI updates (macrotasks)
 * - Understanding timing helps avoid race conditions  
 * - Proper scheduling prevents callback starvation
 */

console.log('\nEvent loop fundamentals demonstration ready!');
console.log('Next: See async-patterns.js for Promise and async/await patterns');