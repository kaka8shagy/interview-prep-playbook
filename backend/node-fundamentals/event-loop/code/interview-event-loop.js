/**
 * File: interview-event-loop.js
 * Description: Common interview questions about Node.js event loop execution order
 * 
 * Learning objectives:
 * - Master predicting execution order in complex async scenarios
 * - Understand subtle differences between similar async patterns
 * - Practice explaining event loop behavior in interviews
 * - Learn to trace through event loop phases systematically
 * 
 * Interview Strategy:
 * 1. Identify all callback types (sync, nextTick, promise, timer, immediate, I/O)
 * 2. Group by phase (microtasks always go first)
 * 3. Consider nesting and chaining effects
 * 4. Trace through execution step by step
 */

console.log('=== Event Loop Interview Questions ===\n');

/**
 * Interview Question 1: Basic Execution Order
 * Difficulty: ⭐⭐⭐
 * 
 * Question: "What will be the output of this code and in what order?"
 */
function interviewQuestion1() {
    console.log('--- Interview Question 1: Basic Order ---');
    console.log('Code to analyze:');
    console.log(`
    console.log('1');
    setTimeout(() => console.log('2'), 0);
    Promise.resolve().then(() => console.log('3'));
    console.log('4');
    `);
    
    console.log('\nActual execution:');
    
    // The actual code execution
    console.log('1');
    setTimeout(() => console.log('2'), 0);
    Promise.resolve().then(() => console.log('3'));
    console.log('4');
    
    setTimeout(() => {
        console.log('\nExpected Answer: 1, 4, 3, 2');
        console.log('Explanation:');
        console.log('- "1" and "4" are synchronous, execute immediately');
        console.log('- Promise.then is a microtask, executes before macrotasks');
        console.log('- setTimeout is a macrotask, executes in next event loop iteration');
    }, 100);
}

/**
 * Interview Question 2: Nested Callbacks
 * Difficulty: ⭐⭐⭐⭐
 * 
 * Question: "Trace the execution order with nested async callbacks"
 */
function interviewQuestion2() {
    console.log('\n--- Interview Question 2: Nested Callbacks ---');
    console.log('Code to analyze:');
    console.log(`
    setTimeout(() => {
        console.log('A');
        Promise.resolve().then(() => console.log('B'));
    }, 0);
    
    Promise.resolve().then(() => {
        console.log('C');
        setTimeout(() => console.log('D'), 0);
    });
    
    console.log('E');
    `);
    
    console.log('\nActual execution:');
    
    setTimeout(() => {
        console.log('A');
        Promise.resolve().then(() => console.log('B'));
    }, 0);
    
    Promise.resolve().then(() => {
        console.log('C');
        setTimeout(() => console.log('D'), 0);
    });
    
    console.log('E');
    
    setTimeout(() => {
        console.log('\nExpected Answer: E, C, A, B, D');
        console.log('Explanation:');
        console.log('- "E" executes synchronously first');
        console.log('- Promise "C" is microtask, executes before timer "A"');
        console.log('- Timer "A" executes, then its nested promise "B" (microtask)');
        console.log('- Timer "D" from promise "C" executes last');
    }, 200);
}

/**
 * Interview Question 3: process.nextTick vs Promise
 * Difficulty: ⭐⭐⭐⭐⭐
 * 
 * Question: "Explain the difference between process.nextTick and Promise.then priority"
 */
function interviewQuestion3() {
    console.log('\n--- Interview Question 3: nextTick vs Promise Priority ---');
    console.log('Code to analyze:');
    console.log(`
    Promise.resolve().then(() => console.log('1'));
    process.nextTick(() => console.log('2'));
    Promise.resolve().then(() => console.log('3'));
    process.nextTick(() => console.log('4'));
    setImmediate(() => console.log('5'));
    console.log('6');
    `);
    
    console.log('\nActual execution:');
    
    Promise.resolve().then(() => console.log('1'));
    process.nextTick(() => console.log('2'));
    Promise.resolve().then(() => console.log('3'));
    process.nextTick(() => console.log('4'));
    setImmediate(() => console.log('5'));
    console.log('6');
    
    setTimeout(() => {
        console.log('\nExpected Answer: 6, 2, 4, 1, 3, 5');
        console.log('Explanation:');
        console.log('- "6" executes synchronously first');
        console.log('- ALL process.nextTick callbacks execute first: "2", "4"');
        console.log('- THEN all Promise callbacks execute: "1", "3"');
        console.log('- Finally setImmediate executes: "5"');
        console.log('- Key: nextTick queue is fully drained before Promise queue');
    }, 300);
}

/**
 * Interview Question 4: Complex Mixed Scenario
 * Difficulty: ⭐⭐⭐⭐⭐
 * 
 * Question: "This is a complex scenario with multiple async patterns"
 */
function interviewQuestion4() {
    console.log('\n--- Interview Question 4: Complex Mixed Scenario ---');
    console.log('Code to analyze:');
    console.log(`
    console.log('start');
    
    setTimeout(() => {
        console.log('timer1');
        Promise.resolve().then(() => console.log('promise1'));
    }, 0);
    
    setTimeout(() => {
        console.log('timer2');
        process.nextTick(() => console.log('nextTick1'));
    }, 0);
    
    setImmediate(() => {
        console.log('immediate1');
        process.nextTick(() => console.log('nextTick2'));
    });
    
    process.nextTick(() => {
        console.log('nextTick3');
        setTimeout(() => console.log('timer3'), 0);
    });
    
    Promise.resolve().then(() => {
        console.log('promise2');
        setImmediate(() => console.log('immediate2'));
    });
    
    console.log('end');
    `);
    
    console.log('\nActual execution:');
    
    console.log('start');
    
    setTimeout(() => {
        console.log('timer1');
        Promise.resolve().then(() => console.log('promise1'));
    }, 0);
    
    setTimeout(() => {
        console.log('timer2');
        process.nextTick(() => console.log('nextTick1'));
    }, 0);
    
    setImmediate(() => {
        console.log('immediate1');
        process.nextTick(() => console.log('nextTick2'));
    });
    
    process.nextTick(() => {
        console.log('nextTick3');
        setTimeout(() => console.log('timer3'), 0);
    });
    
    Promise.resolve().then(() => {
        console.log('promise2');
        setImmediate(() => console.log('immediate2'));
    });
    
    console.log('end');
    
    setTimeout(() => {
        console.log('\nExpected Answer: start, end, nextTick3, promise2, timer1, timer2, promise1, nextTick1, immediate1, nextTick2, timer3, immediate2');
        console.log('\nDetailed Phase Analysis:');
        console.log('1. Sync: start, end');
        console.log('2. Microtasks: nextTick3, promise2');
        console.log('3. Timer phase: timer1, timer2');
        console.log('4. Microtasks from timers: promise1, nextTick1');
        console.log('5. Check phase: immediate1');
        console.log('6. Microtasks from immediate: nextTick2');
        console.log('7. Next iteration - Timer: timer3');
        console.log('8. Next iteration - Check: immediate2');
    }, 400);
}

/**
 * Interview Question 5: setImmediate vs setTimeout(0)
 * Difficulty: ⭐⭐⭐⭐
 * 
 * Question: "When does setImmediate execute before setTimeout(0)?"
 */
function interviewQuestion5() {
    console.log('\n--- Interview Question 5: setImmediate vs setTimeout(0) ---');
    console.log('Context matters for execution order:');
    
    console.log('\n1. Outside I/O callbacks:');
    setTimeout(() => console.log('setTimeout'), 0);
    setImmediate(() => console.log('setImmediate'));
    
    setTimeout(() => {
        console.log('Result: Order may vary (system dependent)\n');
        
        console.log('2. Inside I/O callbacks:');
        const fs = require('fs');
        fs.readFile(__filename, () => {
            setTimeout(() => console.log('setTimeout in I/O'), 0);
            setImmediate(() => console.log('setImmediate in I/O'));
            
            setTimeout(() => {
                console.log('Result: setImmediate consistently executes first inside I/O');
                console.log('\nExplanation:');
                console.log('- Outside I/O: depends on timing and system performance');
                console.log('- Inside I/O: setImmediate (check phase) before setTimeout (timer phase)');
                console.log('- This is because we\'re already past the timer phase in the current loop');
            }, 100);
        });
    }, 100);
}

/**
 * Interview Question 6: Recursive nextTick Starvation
 * Difficulty: ⭐⭐⭐⭐⭐
 * 
 * Question: "What happens with recursive process.nextTick calls?"
 */
function interviewQuestion6() {
    console.log('\n--- Interview Question 6: Recursive nextTick Starvation ---');
    console.log('Code to analyze:');
    console.log(`
    let count = 0;
    
    function recursiveNextTick() {
        console.log('nextTick', ++count);
        if (count < 5) {
            process.nextTick(recursiveNextTick);
        }
    }
    
    setTimeout(() => console.log('timer'), 0);
    process.nextTick(recursiveNextTick);
    setImmediate(() => console.log('immediate'));
    `);
    
    console.log('\nActual execution:');
    
    let count = 0;
    
    function recursiveNextTick() {
        console.log('nextTick', ++count);
        if (count < 5) {
            process.nextTick(recursiveNextTick);
        }
    }
    
    setTimeout(() => console.log('timer'), 0);
    process.nextTick(recursiveNextTick);
    setImmediate(() => console.log('immediate'));
    
    setTimeout(() => {
        console.log('\nExpected Answer: nextTick 1, nextTick 2, nextTick 3, nextTick 4, nextTick 5, immediate, timer');
        console.log('Explanation:');
        console.log('- Recursive nextTick calls keep adding to the nextTick queue');
        console.log('- nextTick queue must be fully drained before moving to next phase');
        console.log('- This can starve other phases if not limited');
        console.log('- In production, use setImmediate for recursive scheduling');
    }, 500);
}

/**
 * Interview Question 7: Promise Chain and Event Loop
 * Difficulty: ⭐⭐⭐⭐
 * 
 * Question: "How do Promise chains interact with the event loop?"
 */
function interviewQuestion7() {
    console.log('\n--- Interview Question 7: Promise Chains ---');
    console.log('Code to analyze:');
    console.log(`
    Promise.resolve()
        .then(() => {
            console.log('then1');
            return Promise.resolve();
        })
        .then(() => console.log('then2'));
    
    Promise.resolve()
        .then(() => console.log('then3'))
        .then(() => console.log('then4'));
        
    console.log('sync');
    `);
    
    console.log('\nActual execution:');
    
    Promise.resolve()
        .then(() => {
            console.log('then1');
            return Promise.resolve();
        })
        .then(() => console.log('then2'));
    
    Promise.resolve()
        .then(() => console.log('then3'))
        .then(() => console.log('then4'));
        
    console.log('sync');
    
    setTimeout(() => {
        console.log('\nExpected Answer: sync, then1, then3, then2, then4');
        console.log('Explanation:');
        console.log('- "sync" executes first');
        console.log('- First microtask: then1, then3 (first .then of each chain)');
        console.log('- Return Promise.resolve() adds extra microtask');
        console.log('- Second microtask: then2, then4 (second .then of each chain)');
        console.log('- Returning promises can affect execution order');
    }, 600);
}

/**
 * Interview Question 8: Error Handling in Event Loop
 * Difficulty: ⭐⭐⭐⭐
 * 
 * Question: "How do unhandled errors affect event loop execution?"
 */
function interviewQuestion8() {
    console.log('\n--- Interview Question 8: Error Handling ---');
    console.log('Code to analyze (with error handling):');
    
    // Demonstrate proper error handling
    process.on('uncaughtException', (error) => {
        console.log('Caught uncaught exception:', error.message);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        console.log('Caught unhandled rejection:', reason);
    });
    
    console.log('start');
    
    // This will cause unhandled rejection
    Promise.reject(new Error('promise error'))
        .then(() => console.log('this won\'t run'));
    
    setTimeout(() => {
        console.log('timer executes despite error');
    }, 0);
    
    process.nextTick(() => {
        console.log('nextTick executes despite error');
    });
    
    console.log('end');
    
    setTimeout(() => {
        console.log('\nKey Points:');
        console.log('- Unhandled promise rejections don\'t stop event loop');
        console.log('- Other callbacks continue to execute');
        console.log('- Always handle errors to prevent crashes');
        console.log('- Use process event handlers for global error handling');
    }, 700);
}

/**
 * Practical Interview Helper Functions
 * Tools to help analyze and explain event loop behavior
 */
class EventLoopAnalyzer {
    constructor() {
        this.executionLog = [];
        this.phaseMap = {
            'sync': 0,
            'nextTick': 1,
            'promise': 2,
            'timer': 3,
            'immediate': 4,
            'io': 5
        };
    }
    
    log(message, type = 'sync') {
        const entry = {
            message,
            type,
            timestamp: Date.now(),
            phase: this.phaseMap[type] || 99
        };
        
        this.executionLog.push(entry);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    predict(operations) {
        console.log('\n--- Event Loop Execution Prediction ---');
        
        const sorted = operations
            .map((op, index) => ({ ...op, originalIndex: index }))
            .sort((a, b) => {
                if (a.phase !== b.phase) {
                    return a.phase - b.phase;
                }
                return a.originalIndex - b.originalIndex;
            });
        
        console.log('Predicted execution order:');
        sorted.forEach((op, index) => {
            console.log(`${index + 1}. ${op.type}: ${op.description}`);
        });
        
        return sorted;
    }
    
    getExecutionSummary() {
        const summary = this.executionLog.reduce((acc, entry) => {
            acc[entry.type] = (acc[entry.type] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n--- Execution Summary ---');
        Object.entries(summary).forEach(([type, count]) => {
            console.log(`${type}: ${count} executions`);
        });
        
        return summary;
    }
}

/**
 * Master Interview Strategy Function
 * Step-by-step approach to solving event loop questions
 */
function masterEventLoopStrategy(codeString) {
    console.log('\n=== Event Loop Analysis Strategy ===');
    console.log('For any event loop question, follow these steps:\n');
    
    console.log('Step 1: Identify all callback types');
    console.log('- Synchronous code (console.log, variables, etc.)');
    console.log('- process.nextTick callbacks');
    console.log('- Promise.then/catch/finally callbacks');
    console.log('- setTimeout/setInterval callbacks');
    console.log('- setImmediate callbacks');
    console.log('- I/O callbacks (fs.readFile, http requests, etc.)\n');
    
    console.log('Step 2: Group by execution priority');
    console.log('1. Synchronous code (executes immediately)');
    console.log('2. process.nextTick queue (highest microtask priority)');
    console.log('3. Promise microtask queue');
    console.log('4. Timer phase macrotasks');
    console.log('5. Check phase macrotasks (setImmediate)');
    console.log('6. I/O phase macrotasks\n');
    
    console.log('Step 3: Consider nesting effects');
    console.log('- Callbacks scheduled inside other callbacks');
    console.log('- Microtasks scheduled from macrotasks');
    console.log('- Chain reactions and recursive calls\n');
    
    console.log('Step 4: Trace execution step by step');
    console.log('- Start with synchronous code');
    console.log('- Drain microtask queues completely');
    console.log('- Move to next event loop phase');
    console.log('- Repeat until all callbacks executed\n');
    
    console.log('Step 5: Consider special cases');
    console.log('- setImmediate vs setTimeout(0) context dependency');
    console.log('- Promise return values affecting chain timing');
    console.log('- Error handling and rejection effects');
}

// Run all interview questions sequentially
async function runAllInterviewQuestions() {
    console.log('Starting comprehensive event loop interview preparation...\n');
    
    interviewQuestion1();
    
    setTimeout(() => {
        interviewQuestion2();
        
        setTimeout(() => {
            interviewQuestion3();
            
            setTimeout(() => {
                interviewQuestion4();
                
                setTimeout(() => {
                    interviewQuestion5();
                    
                    setTimeout(() => {
                        interviewQuestion6();
                        
                        setTimeout(() => {
                            interviewQuestion7();
                            
                            setTimeout(() => {
                                interviewQuestion8();
                                
                                setTimeout(() => {
                                    masterEventLoopStrategy();
                                    
                                    console.log('\n=== Interview Preparation Complete ===');
                                    console.log('Practice these patterns until you can predict execution order instantly!');
                                }, 1000);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

// Export for testing and practice
module.exports = {
    interviewQuestion1,
    interviewQuestion2,
    interviewQuestion3,
    interviewQuestion4,
    interviewQuestion5,
    interviewQuestion6,
    interviewQuestion7,
    interviewQuestion8,
    EventLoopAnalyzer,
    masterEventLoopStrategy,
    runAllInterviewQuestions
};

// Run if executed directly
if (require.main === module) {
    runAllInterviewQuestions();
}

/**
 * Interview Success Tips:
 * 
 * 1. Practice Methodology:
 *    - Always trace step by step, don't guess
 *    - Explain your reasoning out loud
 *    - Draw diagrams if it helps visualize
 * 
 * 2. Common Mistakes to Avoid:
 *    - Assuming setTimeout(0) is truly immediate
 *    - Forgetting that nextTick drains completely before promises
 *    - Not considering nested callback effects
 *    - Mixing up setImmediate vs setTimeout context rules
 * 
 * 3. Advanced Concepts to Know:
 *    - Event loop phases in detail
 *    - Microtask vs macrotask differences
 *    - I/O polling and libuv integration
 *    - Performance implications of different patterns
 * 
 * 4. Practical Applications:
 *    - When to use each async pattern
 *    - How to debug event loop issues
 *    - Performance optimization techniques
 *    - Error handling best practices
 */