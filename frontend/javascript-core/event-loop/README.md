# JavaScript Event Loop Deep Dive

## Quick Summary
- Single-threaded runtime with non-blocking I/O
- Call stack executes synchronous code
- Task queue holds callbacks (setTimeout, I/O)
- Microtask queue has priority (Promises, queueMicrotask)
- Event loop coordinates execution between stack and queues

## Core Concepts

### The Architecture

The JavaScript runtime consists of:
1. **Call Stack**: Executes functions (LIFO)
2. **Heap**: Memory allocation for objects
3. **Task Queue** (Macrotask): setTimeout, setInterval, I/O
4. **Microtask Queue**: Promises, queueMicrotask, MutationObserver
5. **Event Loop**: Orchestrates execution

See complete architecture diagram: `./diagrams/event-loop-architecture.txt`

### How It Works

The event loop continuously monitors the call stack and queues:
1. Executes all synchronous code on the call stack
2. When stack is empty, processes all microtasks
3. Executes one macrotask
4. Returns to processing microtasks

This cycle ensures non-blocking execution while maintaining order.

### Execution Order

Understanding execution order is crucial for debugging async code:
1. Synchronous code always runs first
2. All microtasks run before any macrotask
3. Only one macrotask runs per loop iteration
4. Microtasks can queue more microtasks

## Code Examples

### Basic Examples
- Simple execution order: `./code/basic-example.js`
- Nested promises and timers: `./code/nested-promises-timers.js`

### Advanced Patterns
- Async/await puzzle: `./code/async-await-puzzle.js`
- Microtask exhaustion: `./code/microtask-exhaustion.js`

### Real-World Applications
- Non-blocking processing: `./code/non-blocking-processing.js`
- Performance optimization: `./code/performance-optimization.js`

## Common Pitfalls

### Pitfall 1: setTimeout(fn, 0) is not immediate
The zero delay doesn't mean immediate execution. The callback still goes through the event loop and waits for the call stack to clear.

### Pitfall 2: Microtask queue starvation
Continuously queuing microtasks can prevent macrotasks from executing, potentially freezing the UI.

### Pitfall 3: async/await creates microtasks
Each await point creates a microtask, which can affect execution order in unexpected ways.

### Pitfall 4: Promise executor runs synchronously
The function passed to new Promise() runs immediately, not asynchronously.

## Interview Questions

### Question 1: Output Prediction
What will be the output of the code?
- Problem: `./code/interview-question-1.js`
- Tests understanding of promise executor and event loop timing

### Question 2: Fix the Race Condition
Common async data fetching problem:
- Problem and solutions: `./code/race-condition-fix.js`
- Multiple approaches to handle asynchronous operations correctly

### Question 3: Implement setImmediate
Create a setImmediate polyfill using browser APIs:
- Implementation: `./code/setimmediate-polyfill.js`
- Shows different strategies using Promise, MessageChannel, and postMessage

## Common Interview Mistakes

### Execution Order Confusion
- Not understanding that Promise executors run synchronously
- Thinking setTimeout(fn, 0) runs immediately
- Not knowing microtasks always run before macrotasks

### Async/Await Misunderstanding
- Not realizing async functions return Promises immediately
- Confusion about when await actually pauses execution
- Not understanding each await creates a microtask

### Performance Issues
- Blocking the event loop with synchronous operations
- Not using chunking for large data processing
- Creating infinite microtask loops

## Performance Considerations

### Long-Running Operations
For CPU-intensive tasks, consider:
- Web Workers for parallel processing
- Chunking with setTimeout for yielding
- requestIdleCallback for non-critical work

See implementation: `./code/performance-optimization.js`

### Optimization Strategies
1. **Chunking**: Break large tasks into smaller pieces
2. **Debouncing/Throttling**: Limit function execution frequency
3. **Web Workers**: Move heavy computation off main thread
4. **requestAnimationFrame**: Smooth animations synced with browser

## Debugging Tips

### Visualizing Execution
1. Add console.log statements with descriptive labels
2. Use performance profiler to see task timing
3. Chrome DevTools Timeline for visual representation

### Common Debugging Scenarios
- Unexpected execution order: Check microtask vs macrotask
- UI freezing: Look for blocking synchronous operations
- Memory leaks: Check for uncleared timers or listeners

## Advanced Topics

### Event Loop in Different Environments
- Browser vs Node.js differences
- process.nextTick in Node.js
- setImmediate vs setTimeout in Node.js

### Relationship with Rendering
- requestAnimationFrame timing
- Layout and paint operations
- Compositor thread interaction

### Modern APIs
- queueMicrotask() for explicit microtask queuing
- Scheduler API for priority-based scheduling
- Web Workers and SharedArrayBuffer

## Best Practices

### DO:
- Use async/await for cleaner async code
- Implement chunking for large data sets
- Clear timeouts and intervals when done
- Use Web Workers for heavy computation

### DON'T:
- Block the event loop with synchronous operations
- Create infinite microtask loops
- Assume timing of async operations
- Nest callbacks excessively (callback hell)

## Practice Problems

1. Predict output of mixed async patterns
2. Implement a task scheduler using event loop
3. Create a non-blocking array processor
4. Build a debounce function from scratch
5. Design a progress indicator for async operations

## Related Topics

- [Promises & Async/Await](../promises/README.md)
- [Web Workers](../web-workers/README.md)
- [Performance Optimization](../../performance/README.md)
- [Memory Management](../memory-management/README.md)
- [Closures](../closures/README.md)