/**
 * File: event-loop-phases.js
 * Description: Demonstrates the execution order of Node.js event loop phases
 * 
 * Learning objectives:
 * - Understand the 6 phases of the event loop
 * - See how different callback types are scheduled and executed
 * - Learn the priority system between phases
 * - Observe microtask execution between phases
 * 
 * Expected Output Order:
 * 1. Synchronous code
 * 2. process.nextTick (microtask - highest priority)
 * 3. Promise.then (microtask)
 * 4. setImmediate (check phase)
 * 5. setTimeout(0) (timer phase - next iteration)
 */

console.log('=== Event Loop Phase Demonstration ===\n');

// Step 1: Synchronous code executes first
// This runs immediately in the current execution stack
console.log('1. Synchronous: Script start');

// Step 2: Timer phase - schedule for next event loop iteration
// setTimeout callbacks are processed in the Timer phase
// Even with 0ms delay, minimum is 1ms and executes after current iteration
setTimeout(() => {
    console.log('5. Timer Phase: setTimeout(0) callback');
    
    // Nested callbacks to show phase transitions
    process.nextTick(() => {
        console.log('6. Microtask: process.nextTick inside setTimeout');
    });
}, 0);

// Step 3: Check phase - executed in current event loop iteration
// setImmediate callbacks run in the Check phase
// This typically executes before setTimeout(0) in I/O contexts
setImmediate(() => {
    console.log('4. Check Phase: setImmediate callback');
    
    // Show microtasks run after each phase
    Promise.resolve().then(() => {
        console.log('7. Microtask: Promise.then inside setImmediate');
    });
});

// Step 4: Microtasks - highest priority, run after each phase
// process.nextTick has higher priority than Promise callbacks
process.nextTick(() => {
    console.log('2. Microtask: process.nextTick callback');
    
    // Demonstrate recursive nextTick (can cause starvation)
    // In production, be careful with recursive nextTick calls
    process.nextTick(() => {
        console.log('3. Microtask: Nested process.nextTick');
    });
});

// Step 5: Promise microtasks - processed after nextTick queue is empty
Promise.resolve().then(() => {
    console.log('8. Microtask: Promise.then callback');
    
    // Chain to show promise microtask order
    return Promise.resolve();
}).then(() => {
    console.log('9. Microtask: Chained Promise.then');
});

// Step 6: I/O operations (Poll phase)
// File system operations are handled in the Poll phase
const fs = require('fs');
fs.readFile(__filename, () => {
    console.log('10. Poll Phase: fs.readFile callback');
    
    // Compare immediate vs timeout inside I/O callback
    // Inside I/O callbacks, setImmediate typically executes before setTimeout(0)
    setTimeout(() => {
        console.log('12. Timer Phase: setTimeout(0) inside I/O');
    }, 0);
    
    setImmediate(() => {
        console.log('11. Check Phase: setImmediate inside I/O');
    });
    
    // Microtasks still have highest priority
    process.nextTick(() => {
        console.log('13. Microtask: process.nextTick inside I/O');
    });
});

// Step 7: More synchronous code
console.log('14. Synchronous: Script end');

// Additional demonstration: Event emitters and event loop
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Event listeners are synchronous when emitted
emitter.on('test', () => {
    console.log('15. Synchronous: EventEmitter listener (when emitted)');
});

// This will execute synchronously
emitter.emit('test');

/**
 * Key Takeaways:
 * 
 * 1. Phase Execution Order:
 *    - Each phase processes its entire queue before moving to next
 *    - Microtasks run between each phase transition
 *    - Timer → Pending Callbacks → Idle/Prepare → Poll → Check → Close
 * 
 * 2. Microtask Priority:
 *    - process.nextTick queue is processed first
 *    - Then Promise microtask queue
 *    - Both execute until queues are empty before next phase
 * 
 * 3. Common Gotchas:
 *    - setTimeout(0) is not truly immediate (minimum 1ms)
 *    - setImmediate vs setTimeout(0) order depends on context
 *    - Recursive process.nextTick can starve other phases
 * 
 * 4. Performance Implications:
 *    - Too many microtasks can delay I/O processing
 *    - Long-running synchronous code blocks everything
 *    - Understanding phases helps optimize callback scheduling
 */

// Export for testing
module.exports = {
    demonstratePhases: () => {
        console.log('Phase demonstration functions would be implemented here');
    }
};