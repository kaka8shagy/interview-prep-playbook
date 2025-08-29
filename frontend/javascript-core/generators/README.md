# JavaScript Generators & Iterators

## Quick Summary
- Generators are functions that can pause and resume execution
- Iterators provide a standard way to traverse sequences
- Yield keyword pauses generator and returns value
- Enable lazy evaluation and infinite sequences
- Foundation for async generators and async iteration

## Core Concepts

### Generator and Iterator Fundamentals
Essential concepts with detailed mental model explanations.
Generator syntax, iterator protocol, bidirectional communication, and integration patterns.
See: `./code/fundamentals.js`

### Advanced Generator Patterns
Yield delegation, lazy evaluation, infinite sequences, and performance optimization.
Complex composition patterns and memory-efficient processing techniques.
See: `./code/advanced-patterns.js`

### Practical Applications  
Real-world applications including state machines, tree traversal, and async flow.
Data processing pipelines, async generators, and production-ready patterns.
See: `./code/practical-applications.js`

### Interview Problems and Solutions
Common generator interview questions with comprehensive solutions.
Fibonacci implementations, custom iterators, performance analysis, and async control flow.
See: `./code/interview-problems.js`
Examples: `./code/async-generators.js`

### Async Iteration
for-await-of loop for async iterables.
Examples: `./code/async-iteration.js`

### Generator Composition
Combining multiple generators.
Patterns: `./code/generator-composition.js`

### Early Termination
Cleanup with finally blocks.
Examples: `./code/early-termination.js`

## Interview Questions

### Question 1: Implement Range
Create a range generator function.
- Solution: `./code/interview-range.js`
- Tests generator basics

### Question 2: Fibonacci Generator
Build infinite Fibonacci sequence.
- Solution: `./code/interview-fibonacci.js`
- Tests infinite sequences

### Question 3: Tree Iterator
Iterate through tree structure.
- Solution: `./code/interview-tree-iterator.js`
- Tests complex iteration

### Question 4: Async Queue
Implement async task queue with generators.
- Solution: `./code/interview-async-queue.js`
- Tests async generators

## Performance Considerations

### Lazy Evaluation
Generators compute values on-demand.
Benefits: `./code/lazy-evaluation.js`

### Memory Efficiency
Process large datasets without loading all.
Examples: `./code/memory-efficiency.js`

### Generator vs Array Methods
When to use each approach.
Comparison: `./code/generator-vs-array.js`

## Real-World Use Cases

### Data Pagination
Loading data in chunks.
Implementation: `./code/data-pagination.js`

### Stream Processing
Processing streams of data.
Implementation: `./code/stream-processing.js`

### Animation Sequences
Controlling animation frames.
Implementation: `./code/animation-sequences.js`

### Task Scheduling
Cooperative multitasking.
Implementation: `./code/task-scheduling.js`

## Common Pitfalls

### Pitfall 1: Generator Reuse
Generators are single-use iterators.
Solution: `./code/pitfall-reuse.js`

### Pitfall 2: Memory Leaks
Keeping references to yielded values.
Solution: `./code/pitfall-memory.js`

### Pitfall 3: Error Handling
Errors in generators need careful handling.
Solution: `./code/pitfall-errors.judgments`

### Pitfall 4: Performance Overhead
Generator overhead vs simple loops.
Analysis: `./code/pitfall-performance.js`

## Debugging Generators

### Chrome DevTools
1. Set breakpoints on yield statements
2. Step through generator execution
3. Inspect generator state
4. Watch yielded values

### Common Issues
- Generator not iterating
- Unexpected done: true
- Values not yielding correctly
- Memory consumption issues

## Best Practices

### DO:
- Use generators for lazy evaluation
- Implement custom iterables with Symbol.iterator
- Clean up resources in finally blocks
- Use async generators for async streams
- Consider memory implications

### DON'T:
- Overuse generators for simple iterations
- Forget generators are stateful
- Ignore error handling
- Create unnecessary generator overhead
- Mix sync and async inappropriately

## ES6+ Iterator Features

### for...of Loop
Consuming iterables easily.
Examples: `./code/for-of-loop.js`

### Spread Operator
Expanding iterables.
Examples: `./code/spread-iterables.js`

### Destructuring
Extracting values from iterables.
Examples: `./code/destructuring-iterables.js`

### Array.from()
Converting iterables to arrays.
Examples: `./code/array-from.js`

## Generator Libraries

### Redux-Saga
Using generators for side effects.
Patterns: `./code/redux-saga-patterns.js`

### Co.js
Promise-based flow control.
Usage: `./code/co-patterns.js`

## Comparison with Alternatives

### Generators vs Async/Await
When to use each.
Comparison: `./code/generators-vs-async.js`

### Generators vs Observables
Different streaming approaches.
Comparison: `./code/generators-vs-observables.js`

## Practice Problems

1. Build a pagination generator
2. Implement backpressure control
3. Create permutation generator
4. Build CSV parser generator
5. Implement coroutine scheduler

## Common Interview Mistakes

### Conceptual Errors
- Confusing generators with regular functions
- Not understanding iterator protocol
- Missing yield delegation concept
- Forgetting generators are stateful

### Implementation Errors
- Not handling generator completion
- Ignoring return values
- Missing error propagation
- Creating infinite loops accidentally

## Related Topics

- [Promises](../promises/README.md)
- [Async/Await](../promises/README.md#asyncawait)
- [Symbols](../es6-features/README.md#symbols)
- [For-of Loops](../es6-features/README.md#forof)
- [Proxy & Reflect](../proxy-reflect/README.md)