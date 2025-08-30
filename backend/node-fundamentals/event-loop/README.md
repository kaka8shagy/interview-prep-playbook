# Node.js Event Loop Deep Dive

## Quick Summary
- Single-threaded JavaScript runtime with event-driven, non-blocking I/O
- Event loop consists of 6 main phases that execute in order
- Microtasks (process.nextTick, Promise callbacks) have higher priority than macrotasks
- Understanding execution order is critical for debugging and optimization
- Blocking operations can starve the event loop and degrade performance

## Core Concepts

### What is the Event Loop?

The event loop is the heart of Node.js's asynchronous, non-blocking architecture. Despite JavaScript being single-threaded, Node.js can handle thousands of concurrent operations through its event-driven model.

### Event Loop Phases

The event loop operates in phases, each with a specific purpose:

1. **Timer Phase**: Executes setTimeout() and setInterval() callbacks
2. **Pending Callbacks Phase**: Executes I/O callbacks deferred to the next loop iteration
3. **Idle, Prepare Phase**: Internal use only
4. **Poll Phase**: Fetches new I/O events; executes I/O related callbacks
5. **Check Phase**: Executes setImmediate() callbacks
6. **Close Callbacks Phase**: Executes close event callbacks (socket.on('close'))

### Microtasks vs Macrotasks

**Microtasks** (highest priority):
- process.nextTick() callbacks
- Promise.then(), Promise.catch(), Promise.finally()
- queueMicrotask() callbacks

**Macrotasks** (lower priority):
- setTimeout(), setInterval()
- setImmediate()
- I/O operations
- UI rendering (in browsers)

## Implementation Examples

### Basic Event Loop Phases
See: `./code/event-loop-phases.js`

Demonstrates the execution order of different phase callbacks and how they interact with the event loop.

### Microtask vs Macrotask Priority
See: `./code/microtask-macrotask.js`

Shows how microtasks are processed before moving to the next event loop phase, including the special case of process.nextTick().

### Blocking Operations Impact
See: `./code/blocking-operations.js`

Illustrates how CPU-intensive synchronous operations can block the event loop and provides patterns to avoid this.

### Advanced Async Patterns
See: `./code/async-patterns.js`

Advanced patterns for managing asynchronous flow control, including parallel execution, sequential processing, and error handling.

### Interview Event Loop Questions
See: `./code/interview-event-loop.js`

Common interview questions about event loop execution order with detailed explanations.

## Common Pitfalls

### 1. Blocking the Event Loop
- Synchronous operations over 10ms can cause performance issues
- Heavy computation should be offloaded to worker threads
- Use streaming for large data processing

### 2. Incorrect Execution Order Assumptions
- Timers are not guaranteed to execute exactly on time
- I/O callbacks can be delayed by other phases
- Microtasks can starve the event loop if queued recursively

### 3. Promise Anti-Patterns
- Creating unnecessary Promise wrappers around already async functions
- Not handling Promise rejections can crash the application
- Missing await keywords can cause race conditions

### 4. Timer Misunderstandings
- setTimeout(0) is actually setTimeout(1) due to minimum delay
- setImmediate() vs setTimeout(0) behavior differs between environments
- Timer accuracy decreases under heavy load

## Performance Considerations

### Event Loop Lag Monitoring
Monitor event loop lag to detect performance issues:
```javascript
// This will be implemented in blocking-operations.js
const start = process.hrtime();
setImmediate(() => {
  const lag = process.hrtime(start);
  console.log(`Event loop lag: ${lag[1] / 1e6}ms`);
});
```

### Optimizing Async Operations
- Batch similar operations together
- Use connection pooling for database operations
- Implement proper backpressure handling
- Consider worker threads for CPU-intensive tasks

### Memory Management
- Avoid creating closures in hot paths
- Clear timer references when no longer needed
- Monitor for memory leaks in long-running processes

## Production Patterns

### Graceful Degradation
Handle high load scenarios by:
- Implementing circuit breakers
- Adding request queuing with limits
- Using adaptive algorithms based on event loop lag

### Error Handling
- Use domains or async_hooks for request context
- Implement proper error boundaries
- Log errors with sufficient context for debugging

### Monitoring and Observability
- Track event loop utilization metrics
- Monitor GC pressure and frequency
- Implement distributed tracing for async operations

## Interview Questions

### 1. Event Loop Execution Order
**Question**: "What is the output of this code and why?"

**Approach**: 
- Identify each callback type (timer, immediate, microtask)
- Trace through event loop phases
- Account for microtask priority

**Solution**: `./code/interview-event-loop.js`

### 2. Performance Debugging
**Question**: "How would you debug a Node.js application that's experiencing high latency?"

**Approach**:
- Check event loop lag
- Profile CPU usage
- Monitor memory consumption
- Analyze I/O patterns

**Implementation**: `./code/blocking-operations.js`

### 3. Async Flow Control
**Question**: "Implement a function that processes an array of URLs sequentially vs in parallel."

**Approach**:
- Sequential: Use for...of with await
- Parallel: Use Promise.all() or Promise.allSettled()
- Controlled concurrency: Use semaphore pattern

**Solution**: `./code/async-patterns.js`

### 4. Custom Event Loop Scheduler
**Question**: "How would you implement a custom task scheduler with priorities?"

**Approach**:
- Use multiple queues for different priorities
- Implement round-robin or weighted scheduling
- Handle backpressure and cancellation

**Implementation**: `./code/async-patterns.js`

## Debugging Techniques

### Event Loop Visualization
Use Node.js built-in tools:
- `--trace-events-enabled` flag for detailed tracing
- `perf_hooks` module for performance measurements
- Chrome DevTools for flame graphs

### Common Debug Commands
```bash
# Enable event loop tracing
node --trace-events-enabled --trace-event-categories=node app.js

# Profile performance
node --prof app.js

# Inspect event loop lag
node --expose-gc --inspect app.js
```

### Memory Leak Detection
- Monitor heap usage over time
- Use heap snapshots to identify growing objects
- Track event listener registration/deregistration

## Testing Strategies

### Unit Testing Async Code
- Use proper async/await patterns in tests
- Mock timers for deterministic testing
- Test error propagation paths

### Integration Testing
- Test under realistic load conditions
- Verify graceful degradation
- Check resource cleanup

### Performance Testing
- Measure throughput under various loads
- Test memory usage over time
- Verify latency percentiles

## Related Topics

- [Streams & Buffers](../streams/README.md) - How streams interact with the event loop
- [Memory Management](../memory/README.md) - GC impact on event loop performance  
- [Error Handling Patterns](../error-handling/README.md) - Async error propagation
- [Clustering & Worker Threads](../clustering/README.md) - Scaling beyond single thread
- [Microservices Communication](../../microservices/communication/README.md) - Event loop in distributed systems