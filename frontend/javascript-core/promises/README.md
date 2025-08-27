# JavaScript Promises & Async/Await

## Quick Summary
- Promises represent eventual completion or failure of async operations
- Three states: pending, fulfilled, rejected
- Async/await is syntactic sugar over promises
- Microtasks have priority over macrotasks in event loop
- Essential for modern JavaScript async programming

## Core Concepts

### Promise States
Every promise exists in one of three states:
1. **Pending**: Initial state, neither fulfilled nor rejected
2. **Fulfilled**: Operation completed successfully with a value
3. **Rejected**: Operation failed with a reason (error)

State transitions are one-way and permanent - once settled, a promise cannot change state.

### Promise Creation
Basic promise constructor: `./code/promise-basics.js`

The executor function runs immediately and synchronously. Use resolve() for success, reject() for failure.

### Promise Chaining
Chaining implementation: `./code/promise-chaining.js`

Each then() returns a new promise, enabling sequential async operations. The chain continues even if intermediate promises are rejected (with catch handlers).

### Error Handling
Error patterns: `./code/error-handling.js`

Errors propagate through the chain until caught. Always include error handling to prevent unhandled rejections.

## Async/Await

### Fundamentals
Basic async/await: `./code/async-await-basics.js`

Async functions always return promises. Await pauses execution until promise settles.

### Error Handling with Try/Catch
Try/catch patterns: `./code/async-error-handling.js`

More intuitive than promise chains for complex error scenarios.

### Sequential vs Parallel
Execution patterns: `./code/sequential-parallel.js`

Understanding when to await sequentially vs using Promise.all() for parallel execution.

## Promise Methods

### Promise.all()
Implementation: `./code/promise-all.js`

Waits for all promises to fulfill or any to reject. Fails fast on first rejection.

### Promise.allSettled()
Implementation: `./code/promise-allsettled.js`

Waits for all promises to settle, regardless of outcome. Never rejects.

### Promise.race()
Implementation: `./code/promise-race.js`

Resolves/rejects with first settled promise. Useful for timeouts.

### Promise.any()
Implementation: `./code/promise-any.js`

Resolves with first fulfilled promise. Only rejects if all promises reject.

## Common Patterns

### Retry Logic
Retry implementation: `./code/retry-pattern.js`

Automatic retry with exponential backoff for failed operations.

### Timeout Wrapper
Timeout pattern: `./code/timeout-pattern.js`

Add timeouts to any promise-based operation.

### Sequential Processing
Sequential patterns: `./code/sequential-processing.js`

Process arrays sequentially with async operations.

### Concurrent Limit
Concurrency control: `./code/concurrent-limit.js`

Limit number of concurrent async operations.

## Common Pitfalls

### Pitfall 1: Forgetting to Return in Chains
Not returning promises breaks the chain.
Fix: `./code/pitfall-return-chain.js`

### Pitfall 2: Creating Unnecessary Promises
Wrapping already-promise-returning functions.
Fix: `./code/pitfall-unnecessary-promises.js`

### Pitfall 3: Sequential Instead of Parallel
Using await in loops when parallel execution is possible.
Fix: `./code/pitfall-sequential-loop.js`

### Pitfall 4: Unhandled Rejections
Missing error handlers causes silent failures.
Fix: `./code/pitfall-unhandled-rejection.js`

## Interview Questions

### Question 1: Implement Promise.all
Build Promise.all from scratch.
- Solution: `./code/interview-promise-all.js`
- Tests understanding of promise resolution

### Question 2: Promise Pool/Queue
Implement concurrent execution with limit.
- Solution: `./code/interview-promise-pool.js`
- Tests concurrency control

### Question 3: Async Cache
Build cache with async data fetching.
- Solution: `./code/interview-async-cache.js`
- Tests promise reuse and state management

### Question 4: Promise.retry
Implement retry with configurable attempts.
- Solution: `./code/interview-promise-retry.js`
- Tests error handling and recursion

### Question 5: Traffic Light
Simulate traffic light with promises.
- Solution: `./code/interview-traffic-light.js`
- Tests timing and state management

## Common Interview Mistakes

### Conceptual Errors
- Thinking async/await makes code synchronous
- Not understanding promise executor runs immediately
- Confusing microtask vs macrotask timing
- Believing promises can be cancelled

### Implementation Errors
- Mixing callbacks with promises incorrectly
- Creating promise constructor anti-pattern
- Not handling errors in Promise.all
- Incorrect async function returns

### Debugging Issues
- Not understanding promise chain flow
- Difficulty with async stack traces
- Missing await keywords
- Race conditions in tests

## Performance Considerations

### Memory Management
- Promises hold references until settled
- Long chains can cause memory buildup
- Clean up listeners and timers

### Optimization Techniques
Performance patterns: `./code/performance-optimization.js`

1. **Batch Operations**: Group multiple async calls
2. **Memoization**: Cache promise results
3. **Lazy Evaluation**: Defer promise creation
4. **Resource Pooling**: Reuse connections

## Advanced Patterns

### Promise Combinators
Custom combinators: `./code/custom-combinators.js`

Create specialized promise utilities for specific use cases.

### Async Iterators
Async iteration: `./code/async-iterators.js`

Handle streams of async data with for-await-of.

### Promise Cancellation
Cancellation patterns: `./code/cancellation-patterns.js`

Implement cancellable promises with AbortController.

## Debugging Tips

### Chrome DevTools
1. Use async stack traces
2. Set breakpoints in async functions
3. Monitor promise states in console
4. Track microtask queue in Performance tab

### Common Debugging Scenarios
- Promises never settling: Check for missing resolve/reject
- Unexpected execution order: Review microtask vs macrotask
- Silent failures: Add catch handlers everywhere
- Memory leaks: Look for retained promise references

## Best Practices

### DO:
- Always handle errors with catch or try/catch
- Use async/await for cleaner code
- Return promises from then() callbacks
- Use Promise.all() for parallel operations
- Clean up resources in finally blocks

### DON'T:
- Mix callbacks and promises unnecessarily
- Create promises when not needed
- Forget to await async functions
- Use await in loops for parallel operations
- Ignore unhandled rejection warnings

## Practice Problems

1. Build a promise-based delay function
2. Implement promise timeout with cancellation
3. Create async queue with priority
4. Build rate-limited API caller
5. Implement circuit breaker pattern

## Related Topics

- [Event Loop](../event-loop/README.md)
- [Closures](../closures/README.md)
- [Error Handling](../error-handling/README.md)
- [Generators & Iterators](../generators/README.md)
- [Web Workers](../web-workers/README.md)