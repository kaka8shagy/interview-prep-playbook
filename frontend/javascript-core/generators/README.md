# JavaScript Generators & Iterators

## Quick Summary
- Generators are functions that can pause and resume execution
- Iterators provide a standard way to traverse sequences
- Yield keyword pauses generator and returns value
- Enable lazy evaluation and infinite sequences
- Foundation for async generators and async iteration

## Core Concepts

### What are Generators?
Special functions that can pause execution and resume later. Defined with function* syntax and use yield to pause.

Basic syntax: `./code/generator-basics.js`

### What are Iterators?
Objects implementing the Iterator protocol with a next() method returning {value, done}.

Iterator protocol: `./code/iterator-protocol.js`

### Generator Functions
Functions that return generator objects (which are iterators).

Creation patterns: `./code/generator-functions.js`

## Iterator Protocol

### Symbol.iterator
Well-known symbol for making objects iterable.
Implementation: `./code/symbol-iterator.js`

### Custom Iterators
Building your own iterable objects.
Examples: `./code/custom-iterators.js`

### Built-in Iterables
Arrays, Strings, Maps, Sets are iterable.
Usage: `./code/builtin-iterables.js`

## Generator Features

### Yield Expression
Pauses generator and returns value.
Examples: `./code/yield-expression.js`

### Yield Delegation
yield* delegates to another generator.
Examples: `./code/yield-delegation.js`

### Return and Throw
Controlling generator flow.
Examples: `./code/return-throw.js`

### Two-way Communication
Passing values into generators.
Examples: `./code/two-way-communication.js`

## Common Patterns

### Infinite Sequences
Generating endless sequences lazily.
Implementation: `./code/infinite-sequences.js`

### State Machines
Using generators for state management.
Implementation: `./code/state-machines.js`

### Tree Traversal
Traversing data structures with generators.
Implementation: `./code/tree-traversal.js`

### Async Flow Control
Managing async operations (pre async/await).
Implementation: `./code/async-flow.js`

## Advanced Topics

### Async Generators
Generators that yield promises.
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