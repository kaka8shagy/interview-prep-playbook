# JavaScript Event Loop Deep Dive

## Quick Summary
- Single-threaded runtime with non-blocking I/O
- Call stack executes synchronous code
- Task queue holds callbacks (setTimeout, I/O)
- Microtask queue has priority (Promises, queueMicrotask)
- Event loop coordinates execution between stack and queues

## Core Concepts

### Event Loop Fundamentals
Essential execution order concepts with detailed mental model explanations.
Microtask vs macrotask priority, synchronous execution phases, and debugging techniques.
See: `./code/fundamentals.js`

### Advanced Async Patterns  
Complex async/await behaviors and Promise interactions with event loop.
Performance optimization techniques and debugging strategies for async flows.
See: `./code/async-patterns.js`

### Performance Optimization
Non-blocking processing patterns and race condition prevention.
Time-based chunking, yielding strategies, and request cancellation techniques.
See: `./code/performance-optimization.js`

### Interview Problems and Solutions
Common event loop interview questions with step-by-step solutions.
Execution order prediction, polyfill implementation, and debugging scenarios.
See: `./code/interview-problems.js`

## Architecture Overview

The JavaScript runtime consists of:
1. **Call Stack**: Executes functions (LIFO)
2. **Heap**: Memory allocation for objects  
3. **Task Queue** (Macrotask): setTimeout, setInterval, I/O
4. **Microtask Queue**: Promises, queueMicrotask, MutationObserver
5. **Event Loop**: Orchestrates execution

See complete architecture diagram: `./diagrams/event-loop-architecture.txt`

## Execution Priority Rules

1. Synchronous code always runs first
2. All microtasks run before any macrotask
3. Only one macrotask runs per loop iteration
4. Microtasks can queue more microtasks

## Common Pitfalls

### Pitfall 1: setTimeout(fn, 0) is not immediate
The zero delay doesn't mean immediate execution. The callback still goes through the event loop and waits for the call stack to clear.

### Pitfall 2: Microtask queue starvation
Continuously queuing microtasks can prevent macrotasks from executing, potentially freezing the UI.

### Pitfall 3: async/await creates microtasks
Each await point creates a microtask, which can affect execution order in unexpected ways.

### Pitfall 4: Promise executor runs synchronously
The function passed to new Promise() runs immediately, not asynchronously.

## Key Interview Topics

### Execution Order Mastery
- Predict output of complex async/sync code combinations
- Explain why certain callbacks run before others
- Demonstrate understanding of microtask vs macrotask priority

### Performance and Optimization  
- Identify and fix event loop blocking issues
- Implement non-blocking processing patterns
- Handle race conditions in async operations

### Implementation Challenges
- Create polyfills for event loop APIs
- Debug timing-related issues in async code
- Design efficient async processing systems

## Critical Concepts to Master

### Execution Order Rules
- Promise executors run synchronously
- All microtasks before any macrotask
- Each await creates a microtask scheduling point

### Performance Implications  
- Long synchronous operations block the event loop
- Microtask loops can starve macrotasks
- Proper yielding prevents UI freezing

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