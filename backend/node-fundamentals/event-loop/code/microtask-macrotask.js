/**
 * File: microtask-macrotask.js
 * Description: Deep dive into microtask vs macrotask execution priority
 * 
 * Learning objectives:
 * - Understand the microtask queue priority system
 * - Learn about process.nextTick vs Promise microtasks
 * - See how microtasks can starve macrotasks
 * - Master debugging techniques for async execution order
 * 
 * Execution Priority (highest to lowest):
 * 1. Synchronous code
 * 2. process.nextTick queue (microtask)
 * 3. Promise microtask queue
 * 4. Macrotasks (timers, I/O, setImmediate)
 */

console.log('=== Microtask vs Macrotask Priority Demo ===\n');

/**
 * Demonstration 1: Basic Priority Order
 * This shows the fundamental difference between micro and macrotasks
 */
function basicPriorityDemo() {
    console.log('--- Basic Priority Demo ---');
    
    // Macrotask: Goes to timer queue, executed in next iteration
    setTimeout(() => {
        console.log('4. Macrotask: setTimeout');
    }, 0);
    
    // Macrotask: Goes to check queue, but still after microtasks
    setImmediate(() => {
        console.log('5. Macrotask: setImmediate');
    });
    
    // Microtask: Highest priority after sync code
    process.nextTick(() => {
        console.log('2. Microtask: process.nextTick');
    });
    
    // Microtask: Lower priority than nextTick, higher than macrotasks
    Promise.resolve().then(() => {
        console.log('3. Microtask: Promise.then');
    });
    
    console.log('1. Synchronous: Main thread');
}

/**
 * Demonstration 2: Microtask Starvation
 * Shows how recursive microtasks can prevent macrotasks from executing
 */
function microtaskStarvationDemo() {
    console.log('\n--- Microtask Starvation Demo ---');
    
    let counter = 0;
    const maxMicrotasks = 3; // Limit to prevent infinite recursion
    
    // This macrotask will be delayed by recursive microtasks
    setTimeout(() => {
        console.log('Macrotask: Finally executed after microtasks');
    }, 0);
    
    // Recursive microtask function
    function recursiveMicrotask() {
        if (counter < maxMicrotasks) {
            counter++;
            console.log(`Microtask ${counter}: Recursive process.nextTick`);
            
            // This keeps scheduling more microtasks, delaying macrotasks
            process.nextTick(recursiveMicrotask);
        }
    }
    
    // Start the recursive microtask chain
    process.nextTick(recursiveMicrotask);
    
    console.log('Synchronous: Started starvation demo');
}

/**
 * Demonstration 3: Mixed Async Patterns
 * Complex scenario with multiple async patterns interacting
 */
function mixedAsyncDemo() {
    console.log('\n--- Mixed Async Patterns Demo ---');
    
    // Multiple setTimeout calls with different delays
    setTimeout(() => console.log('Timer 1: 1ms delay'), 1);
    setTimeout(() => console.log('Timer 2: 0ms delay'), 0);
    setTimeout(() => console.log('Timer 3: 2ms delay'), 2);
    
    // Multiple setImmediate calls
    setImmediate(() => {
        console.log('Immediate 1: First setImmediate');
        
        // Nested microtasks inside macrotask
        process.nextTick(() => console.log('Nested: nextTick in setImmediate'));
        Promise.resolve().then(() => console.log('Nested: Promise in setImmediate'));
    });
    
    setImmediate(() => console.log('Immediate 2: Second setImmediate'));
    
    // Multiple microtasks of different types
    Promise.resolve()
        .then(() => console.log('Promise 1: First then'))
        .then(() => console.log('Promise 2: Chained then'));
    
    Promise.resolve().then(() => {
        console.log('Promise 3: Separate promise');
        
        // More microtasks from within promise
        process.nextTick(() => console.log('Nested: nextTick in Promise'));
    });
    
    // Multiple process.nextTick calls
    process.nextTick(() => {
        console.log('NextTick 1: First nextTick');
        
        // Nested nextTick (higher priority than new promises)
        process.nextTick(() => console.log('NextTick 2: Nested nextTick'));
    });
    
    process.nextTick(() => console.log('NextTick 3: Second nextTick'));
    
    console.log('Synchronous: Mixed demo setup complete');
}

/**
 * Demonstration 4: Promise vs NextTick Race Condition
 * Shows subtle timing differences that can cause bugs
 */
function raceConditionDemo() {
    console.log('\n--- Race Condition Demo ---');
    
    let sharedState = 'initial';
    
    // This promise might not see the state change from nextTick
    Promise.resolve().then(() => {
        console.log(`Promise sees state: ${sharedState}`);
        return new Promise(resolve => {
            // Async operation that depends on state
            setTimeout(() => {
                console.log(`Async operation with state: ${sharedState}`);
                resolve();
            }, 10);
        });
    });
    
    // NextTick executes first and modifies shared state
    process.nextTick(() => {
        console.log('NextTick: Modifying shared state');
        sharedState = 'modified by nextTick';
    });
    
    // Another promise to show execution order
    Promise.resolve().then(() => {
        console.log(`Second Promise sees state: ${sharedState}`);
    });
    
    console.log(`Synchronous: Initial state is ${sharedState}`);
}

/**
 * Demonstration 5: Production Pattern - Event Loop Monitoring
 * Practical example of measuring event loop performance
 */
function eventLoopMonitoring() {
    console.log('\n--- Event Loop Monitoring Demo ---');
    
    const performanceMarks = [];
    
    // Measure time between schedule and execution
    function measureAsyncDelay(name, scheduleFn) {
        const startTime = process.hrtime.bigint();
        
        scheduleFn(() => {
            const endTime = process.hrtime.bigint();
            const delay = Number(endTime - startTime) / 1000000; // Convert to milliseconds
            
            performanceMarks.push({ name, delay });
            console.log(`${name} executed after ${delay.toFixed(3)}ms`);
            
            // Report summary when all measurements are complete
            if (performanceMarks.length === 3) {
                console.log('\n--- Performance Summary ---');
                performanceMarks.forEach(mark => {
                    console.log(`${mark.name}: ${mark.delay.toFixed(3)}ms`);
                });
            }
        });
    }
    
    // Measure different async patterns
    measureAsyncDelay('process.nextTick', (cb) => process.nextTick(cb));
    measureAsyncDelay('Promise.then', (cb) => Promise.resolve().then(cb));
    measureAsyncDelay('setImmediate', (cb) => setImmediate(cb));
    
    console.log('Synchronous: Started performance monitoring');
}

/**
 * Interview Helper: Trace Execution Order
 * Utility function to predict execution order of mixed async code
 */
function traceExecutionOrder(asyncOperations) {
    console.log('\n--- Execution Order Tracer ---');
    console.log('Input operations:', asyncOperations);
    
    const executionPlan = asyncOperations
        .map((op, index) => ({ ...op, originalIndex: index }))
        .sort((a, b) => {
            // Sort by priority: sync < nextTick < promise < macrotask
            const priorities = {
                'sync': 0,
                'nextTick': 1, 
                'promise': 2,
                'setTimeout': 3,
                'setImmediate': 3
            };
            
            return priorities[a.type] - priorities[b.type];
        });
    
    console.log('Predicted execution order:');
    executionPlan.forEach((op, index) => {
        console.log(`${index + 1}. ${op.type}: ${op.description}`);
    });
    
    return executionPlan;
}

// Run all demonstrations
console.log('Starting comprehensive microtask/macrotask analysis...\n');

basicPriorityDemo();

// Small delay to separate demos clearly
setTimeout(() => {
    microtaskStarvationDemo();
    
    setTimeout(() => {
        mixedAsyncDemo();
        
        setTimeout(() => {
            raceConditionDemo();
            
            setTimeout(() => {
                eventLoopMonitoring();
                
                // Example usage of execution tracer
                setTimeout(() => {
                    const testOperations = [
                        { type: 'setTimeout', description: 'Timer callback' },
                        { type: 'promise', description: 'Promise resolution' },
                        { type: 'nextTick', description: 'Process nextTick' },
                        { type: 'sync', description: 'Synchronous code' },
                        { type: 'setImmediate', description: 'Immediate callback' }
                    ];
                    
                    traceExecutionOrder(testOperations);
                }, 100);
                
            }, 50);
        }, 50);
    }, 50);
}, 100);

/**
 * Production Best Practices:
 * 
 * 1. Avoid Microtask Starvation:
 *    - Limit recursive process.nextTick calls
 *    - Use setImmediate for deferring work to next iteration
 *    - Monitor event loop lag in production
 * 
 * 2. Predictable Async Flow:
 *    - Understand execution order for debugging
 *    - Use async/await for clearer control flow
 *    - Avoid mixing callback styles unnecessarily
 * 
 * 3. Performance Optimization:
 *    - Batch microtasks when possible
 *    - Use appropriate async primitive for the use case
 *    - Monitor and measure async performance
 * 
 * 4. Error Handling:
 *    - Unhandled promise rejections can crash the app
 *    - Use domains or async_hooks for request context
 *    - Implement proper error boundaries
 */

module.exports = {
    basicPriorityDemo,
    microtaskStarvationDemo,
    mixedAsyncDemo,
    raceConditionDemo,
    eventLoopMonitoring,
    traceExecutionOrder
};