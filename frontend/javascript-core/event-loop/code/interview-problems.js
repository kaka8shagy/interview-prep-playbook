/**
 * File: interview-problems.js
 * Description: Common event loop interview questions with detailed solutions
 * 
 * Learning objectives:
 * - Master typical event loop interview questions and their solutions
 * - Understand the reasoning behind execution order predictions
 * - Practice explaining event loop concepts clearly to interviewers
 * - Learn how to implement polyfills for event loop-related APIs
 * 
 * This file consolidates: interview-question-1.js, setimmediate-polyfill.js
 */

console.log('=== Event Loop Interview Problems ===\n');

// ============================================================================
// INTERVIEW QUESTION 1: EXECUTION ORDER PREDICTION
// ============================================================================

console.log('--- Question 1: Predict the Execution Order ---');

/**
 * QUESTION: "What will this code output and why?"
 * 
 * This is the most common event loop interview question.
 * The interviewer wants to test your understanding of:
 * - Synchronous vs asynchronous execution
 * - Microtask vs macrotask priority
 * - Promise behavior and timing
 */

function interviewQuestion1() {
  console.log('=== INTERVIEW QUESTION 1 ===');
  console.log('Predict the output order, then check your answer:\n');
  
  // The actual code sequence to predict
  console.log('1');
  
  setTimeout(() => console.log('2'), 0);
  
  Promise.resolve().then(() => console.log('3'));
  
  console.log('4');
  
  /**
   * STEP-BY-STEP ANALYSIS:
   * 
   * SYNCHRONOUS PHASE:
   * - console.log('1') executes immediately → Output: "1"
   * - setTimeout() schedules callback in macrotask queue
   * - Promise.resolve().then() schedules callback in microtask queue  
   * - console.log('4') executes immediately → Output: "4"
   * 
   * ASYNCHRONOUS PHASE:
   * - Call stack is now empty, event loop starts
   * - Microtasks have priority: Promise callback runs → Output: "3"
   * - Then macrotasks: setTimeout callback runs → Output: "2"
   * 
   * FINAL ORDER: 1, 4, 3, 2
   */
  
  console.log('\nCORRECT ANSWER: 1, 4, 3, 2');
  console.log('REASONING:');
  console.log('• Sync code runs first (1, 4)');
  console.log('• Microtasks run next (3)'); 
  console.log('• Macrotasks run last (2)');
}

interviewQuestion1();

// ============================================================================
// INTERVIEW QUESTION 2: COMPLEX NESTED SCENARIO
// ============================================================================

function interviewQuestion2() {
  console.log('\n=== INTERVIEW QUESTION 2 ===');
  console.log('More complex scenario - predict the execution order:\n');
  
  /**
   * QUESTION: "What happens with nested async operations?"
   * 
   * This tests deeper understanding of:
   * - How microtasks can schedule more microtasks
   * - When event loop processes different queue types
   * - Interaction between different async APIs
   */
  
  console.log('start');
  
  setTimeout(() => {
    console.log('timeout1');
    Promise.resolve().then(() => console.log('promise3'));
  }, 0);
  
  Promise.resolve().then(() => {
    console.log('promise1');
    Promise.resolve().then(() => console.log('promise2'));
  });
  
  setTimeout(() => console.log('timeout2'), 0);
  
  console.log('end');
  
  /**
   * DETAILED EXECUTION ANALYSIS:
   * 
   * PHASE 1 - SYNCHRONOUS:
   * 1. "start" - immediate sync execution
   * 2. First setTimeout scheduled → macrotask queue: [timeout1_callback]
   * 3. Promise.resolve().then() scheduled → microtask queue: [promise1_callback]  
   * 4. Second setTimeout scheduled → macrotask queue: [timeout1_callback, timeout2_callback]
   * 5. "end" - immediate sync execution
   * 
   * PHASE 2 - MICROTASKS (before any macrotasks):
   * 6. "promise1" - first microtask executes
   * 7. During promise1, Promise.resolve().then() schedules another microtask
   * 8. "promise2" - second microtask executes (all microtasks must complete)
   * 
   * PHASE 3 - MACROTASKS (one per event loop iteration):
   * 9. "timeout1" - first macrotask executes
   * 10. During timeout1, Promise.resolve().then() schedules a microtask
   * 11. "promise3" - microtask from within macrotask (processed immediately)
   * 12. "timeout2" - second macrotask executes
   * 
   * FINAL ORDER: start, end, promise1, promise2, timeout1, promise3, timeout2
   */
  
  setTimeout(() => {
    console.log('\nCORRECT ANSWER: start, end, promise1, promise2, timeout1, promise3, timeout2');
    console.log('KEY INSIGHT: Microtasks scheduled within macrotasks run before the next macrotask');
  }, 100);
}

interviewQuestion2();

// ============================================================================
// INTERVIEW QUESTION 3: ASYNC/AWAIT TIMING
// ============================================================================

function interviewQuestion3() {
  console.log('\n=== INTERVIEW QUESTION 3 ===');
  console.log('Async/await execution timing - predict the order:\n');
  
  /**
   * QUESTION: "How does async/await affect execution order?"
   * 
   * This tests understanding of:
   * - How async functions create microtasks
   * - When await pauses execution
   * - Interaction between async/await and Promises
   */
  
  async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
  }
  
  async function async2() {
    console.log('async2');
  }
  
  console.log('script start');
  
  setTimeout(() => console.log('setTimeout'), 0);
  
  async1();
  
  new Promise(resolve => {
    console.log('promise1');
    resolve();
  }).then(() => console.log('promise2'));
  
  console.log('script end');
  
  /**
   * ASYNC/AWAIT EXECUTION BREAKDOWN:
   * 
   * SYNCHRONOUS PHASE:
   * 1. "script start" - sync execution
   * 2. setTimeout scheduled → macrotask queue: [setTimeout_callback]
   * 3. async1() called → "async1 start" printed
   * 4. await async2() called → "async2" printed (sync part of async2)
   * 5. await pauses async1, continuation scheduled as microtask
   * 6. Promise executor runs → "promise1" printed (sync)
   * 7. Promise.then() scheduled → microtask queue: [async1_continuation, promise2_callback]
   * 8. "script end" - sync execution completes
   * 
   * MICROTASK PHASE:
   * 9. async1 continuation → "async1 end"
   * 10. promise2 callback → "promise2"
   * 
   * MACROTASK PHASE:
   * 11. setTimeout callback → "setTimeout"
   * 
   * FINAL ORDER: script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout
   */
  
  setTimeout(() => {
    console.log('\nCORRECT ANSWER: script start, async1 start, async2, promise1, script end, async1 end, promise2, setTimeout');
    console.log('CRITICAL INSIGHT: await creates a microtask for the continuation after the await');
  }, 200);
}

interviewQuestion3();

// ============================================================================
// INTERVIEW QUESTION 4: IMPLEMENT setImmediate POLYFILL
// ============================================================================

function interviewQuestion4() {
  console.log('\n=== INTERVIEW QUESTION 4 ===');
  console.log('Implement setImmediate polyfill for browsers:\n');
  
  /**
   * QUESTION: "setImmediate exists in Node.js but not browsers. How would you implement it?"
   * 
   * This tests understanding of:
   * - Different ways to schedule macrotasks
   * - Browser vs Node.js environment differences
   * - Performance characteristics of different scheduling methods
   */
  
  /**
   * setImmediate BEHAVIOR:
   * - Should execute callback in the next iteration of the event loop
   * - Should run before setTimeout(callback, 0) when possible
   * - Should return an ID that can be used with clearImmediate
   */
  
  class SetImmediatePolyfill {
    constructor() {
      this.taskId = 0;
      this.tasks = new Map();
      this.isScheduled = false;
      
      // Choose the best available scheduling method
      this.scheduleTask = this.getBestScheduler();
      
      console.log('setImmediate polyfill initialized with scheduler:', this.scheduleTask.name);
    }
    
    /**
     * Choose the best task scheduling method based on environment
     */
    getBestScheduler() {
      // Method 1: MessageChannel (fastest in browsers that support it)
      if (typeof MessageChannel !== 'undefined') {
        const channel = new MessageChannel();
        channel.port2.onmessage = () => this.flushTasks();
        
        return function scheduleWithMessageChannel() {
          channel.port1.postMessage(null);
        };
      }
      
      // Method 2: postMessage (fallback for older browsers)  
      if (typeof window !== 'undefined' && window.postMessage) {
        const messageKey = 'setImmediate$' + Math.random();
        
        window.addEventListener('message', (event) => {
          if (event.data === messageKey) {
            event.stopPropagation();
            this.flushTasks();
          }
        });
        
        return function scheduleWithPostMessage() {
          window.postMessage(messageKey, '*');
        };
      }
      
      // Method 3: setTimeout fallback (slowest but most compatible)
      return function scheduleWithTimeout() {
        setTimeout(() => this.flushTasks(), 0);
      }.bind(this);
    }
    
    /**
     * Main setImmediate implementation
     */
    setImmediate(callback, ...args) {
      if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }
      
      // Generate unique task ID
      const id = ++this.taskId;
      
      // Store task with its arguments
      this.tasks.set(id, {
        callback,
        args,
        scheduled: Date.now()
      });
      
      // Schedule task execution if not already scheduled
      if (!this.isScheduled) {
        this.isScheduled = true;
        this.scheduleTask();
      }
      
      console.log(`Task ${id} scheduled`);
      return id;
    }
    
    /**
     * Clear a scheduled immediate task
     */
    clearImmediate(id) {
      if (this.tasks.has(id)) {
        this.tasks.delete(id);
        console.log(`Task ${id} cancelled`);
        return true;
      }
      return false;
    }
    
    /**
     * Execute all scheduled tasks
     */
    flushTasks() {
      this.isScheduled = false;
      
      if (this.tasks.size === 0) {
        return;
      }
      
      // Execute all tasks scheduled up to this point
      // Note: New tasks scheduled during execution wait for next flush
      const tasksToRun = new Map(this.tasks);
      this.tasks.clear();
      
      console.log(`Executing ${tasksToRun.size} immediate tasks`);
      
      for (const [id, task] of tasksToRun) {
        try {
          const executionTime = Date.now() - task.scheduled;
          console.log(`  Executing task ${id} (${executionTime}ms delay)`);
          
          task.callback.apply(null, task.args);
          
        } catch (error) {
          console.error(`Error in setImmediate task ${id}:`, error);
          // Continue executing other tasks despite errors
        }
      }
      
      // If new tasks were scheduled during execution, schedule another flush
      if (this.tasks.size > 0 && !this.isScheduled) {
        this.isScheduled = true;
        this.scheduleTask();
      }
    }
    
    /**
     * Get statistics about the polyfill performance
     */
    getStats() {
      return {
        pendingTasks: this.tasks.size,
        isScheduled: this.isScheduled,
        nextTaskId: this.taskId + 1,
        schedulerType: this.scheduleTask.name
      };
    }
  }
  
  // Create global polyfill instance
  const polyfill = new SetImmediatePolyfill();
  
  // Add to global scope if not already present
  if (typeof setImmediate === 'undefined') {
    globalThis.setImmediate = polyfill.setImmediate.bind(polyfill);
    globalThis.clearImmediate = polyfill.clearImmediate.bind(polyfill);
  }
  
  // Demonstration of the polyfill
  console.log('Testing setImmediate polyfill:');
  
  console.log('1. Scheduling immediate tasks');
  
  const id1 = polyfill.setImmediate(() => console.log('  Immediate task 1 executed'));
  const id2 = polyfill.setImmediate(() => console.log('  Immediate task 2 executed')); 
  const id3 = polyfill.setImmediate(() => console.log('  Immediate task 3 executed'));
  
  // Cancel one task to test clearImmediate
  polyfill.clearImmediate(id2);
  
  setTimeout(() => console.log('  setTimeout task executed'), 0);
  
  console.log('2. Synchronous code complete');
  console.log('Expected order: sync code, immediate tasks (1,3), setTimeout task');
  
  // Show stats after a delay
  setTimeout(() => {
    console.log('\nPolyfill stats:', polyfill.getStats());
  }, 50);
}

interviewQuestion4();

// ============================================================================
// INTERVIEW QUESTION 5: DEBUG EXECUTION ORDER PROBLEM
// ============================================================================

function interviewQuestion5() {
  console.log('\n=== INTERVIEW QUESTION 5 ===');
  console.log('Debug this execution order problem:\n');
  
  /**
   * QUESTION: "This code isn't behaving as expected. Can you explain why and fix it?"
   * 
   * This tests:
   * - Debugging skills for async code
   * - Understanding of Promise timing
   * - Ability to identify and fix race conditions
   */
  
  // PROBLEMATIC CODE:
  function problematicCode() {
    console.log('=== PROBLEMATIC CODE ===');
    
    let result = null;
    
    // Async operation to fetch data
    Promise.resolve('important data').then(data => {
      result = data;
      console.log('Data loaded:', data);
    });
    
    // Try to use the result immediately
    console.log('Result:', result); // This will be null!
    
    // Another async operation that depends on the result
    setTimeout(() => {
      console.log('Processing result:', result); // This might work
    }, 0);
  }
  
  // FIXED VERSION:
  async function fixedCode() {
    console.log('\n=== FIXED VERSION ===');
    
    // Option 1: Use async/await for proper sequencing
    const result = await Promise.resolve('important data');
    console.log('Data loaded:', result);
    console.log('Result:', result); // Now this works!
    
    // Process the result
    console.log('Processing result:', result);
  }
  
  function alternativeFixedCode() {
    console.log('\n=== ALTERNATIVE FIX (Promise chaining) ===');
    
    Promise.resolve('important data')
      .then(data => {
        console.log('Data loaded:', data);
        console.log('Result:', data);
        
        // Continue processing in the Promise chain
        return data;
      })
      .then(result => {
        console.log('Processing result:', result);
      });
  }
  
  /**
   * EXPLANATION OF THE PROBLEM:
   * 
   * The original code has a classic timing issue:
   * 1. Promise.resolve().then() schedules callback as microtask
   * 2. console.log('Result:', result) runs immediately (result is null)
   * 3. setTimeout schedules callback as macrotask
   * 4. Microtasks run (Promise callback sets result)
   * 5. Macrotasks run (setTimeout callback uses result)
   * 
   * THE FIX:
   * - Use async/await to wait for async operations
   * - Or use Promise chaining to sequence operations
   * - Never assume async operations complete immediately
   */
  
  problematicCode();
  
  setTimeout(() => {
    fixedCode();
    
    setTimeout(() => {
      alternativeFixedCode();
      
      setTimeout(() => {
        console.log('\nKEY LESSON: Never assume async operations complete synchronously!');
        console.log('Always use await, .then(), or proper callbacks for sequencing.');
      }, 100);
    }, 50);
  }, 50);
}

interviewQuestion5();

/**
 * SUMMARY OF INTERVIEW STRATEGIES:
 * 
 * 1. EXECUTION ORDER QUESTIONS:
 *    - Always analyze sync code first
 *    - Then microtasks (Promises, async/await continuations)  
 *    - Finally macrotasks (setTimeout, setInterval)
 *    - Remember: ALL microtasks before ANY macrotask
 * 
 * 2. IMPLEMENTATION QUESTIONS:
 *    - Understand the behavior requirements first
 *    - Consider environment differences (browser vs Node.js)
 *    - Choose appropriate scheduling mechanisms
 *    - Handle edge cases and errors gracefully
 * 
 * 3. DEBUGGING QUESTIONS:
 *    - Look for timing assumptions
 *    - Identify race conditions  
 *    - Check async operation sequencing
 *    - Suggest proper async patterns
 * 
 * 4. EXPLANATION STRATEGY:
 *    - Start with the mental model (call stack, queues)
 *    - Walk through execution step-by-step
 *    - Explain WHY things happen in that order
 *    - Discuss real-world implications
 * 
 * 5. COMMON INTERVIEW TRAPS:
 *    - setTimeout(fn, 0) is NOT immediate
 *    - Promise executors run synchronously
 *    - await creates microtasks for continuations
 *    - Microtasks can starve macrotasks
 * 
 * Interview Tips:
 * - Think out loud while analyzing
 * - Draw diagrams if helpful
 * - Mention performance implications
 * - Show awareness of edge cases
 * - Relate to real-world scenarios
 */

console.log('\nInterview problems demonstration complete!');
console.log('You now have comprehensive event loop interview preparation!');