# JavaScript Core Concepts

## Overview
Essential JavaScript language features and runtime concepts for staff/architect level interviews.

## Topics

### ✅ Completed Topics

#### [Event Loop](./event-loop/README.md)
- Call stack, task queue, microtask queue
- Execution order and timing
- Performance optimization strategies

#### [Closures](./closures/README.md)
- Lexical scoping and variable capture
- Module pattern and data privacy
- Common pitfalls and memory implications

#### [Promises & Async/Await](./promises/README.md)
- Promise states and chaining
- Async/await patterns
- Error handling and performance

### 📝 Core Language Features

#### [This Binding & Context](./this-binding/README.md)
- Implicit, explicit, new, and arrow function binding
- Call, apply, bind methods
- Context loss and preservation

#### [Prototypes & Inheritance](./prototypes/README.md)
- Prototype chain
- Constructor functions vs classes
- Object.create() and inheritance patterns

#### [Hoisting & Scope](./hoisting-scope/README.md)
- Variable and function hoisting
- Block scope vs function scope
- Temporal dead zone

#### [Type Coercion](./type-coercion/README.md)
- Implicit vs explicit coercion
- Truthy/falsy values
- Equality operators (== vs ===)

### 📝 Advanced Features

#### [ES6+ Features](./es6-features/README.md)
- Destructuring, spread/rest operators
- Template literals, arrow functions
- Map, Set, WeakMap, WeakSet
- Symbols and well-known symbols

#### [Generators & Iterators](./generators/README.md)
- Generator functions and yield
- Custom iterators
- Async generators

#### [Proxy & Reflect](./proxy-reflect/README.md)
- Meta-programming with Proxy
- Handler traps
- Reflect API

#### [Memory Management](./memory-management/README.md)
- Garbage collection strategies
- Memory leaks and prevention
- WeakMap and WeakSet usage

### 📝 Browser/Runtime APIs

#### [Web Workers](./web-workers/README.md)
- Main thread vs worker threads
- SharedArrayBuffer and Atomics
- Service Workers basics

#### [Module Systems](./modules/README.md)
- CommonJS vs ES Modules
- Dynamic imports
- Module resolution

#### [Regular Expressions](./regex/README.md)
- Pattern matching and groups
- Lookahead/lookbehind assertions
- Common patterns and performance

#### [Error Handling](./error-handling/README.md)
- Error types and custom errors
- Try/catch/finally patterns
- Error boundaries and async errors

## Interview Preparation Path

### For L5/L6 (Senior/Staff)
1. **Must Know**: Event Loop, Closures, Promises, This Binding, Prototypes
2. **Should Know**: ES6+, Type Coercion, Hoisting
3. **Good to Know**: Generators, Web Workers, Proxy

### For L7 (Principal/Architect)
- All above topics with deep understanding
- Performance implications of each feature
- Browser implementation details
- Historical context and evolution

## Common Interview Patterns

### Concept Questions
- "Explain the event loop"
- "What is a closure?"
- "How does 'this' work?"

### Code Output Prediction
- Mixed async operations
- Scope and hoisting puzzles
- Type coercion edge cases

### Implementation Challenges
- Build Promise.all
- Create event emitter
- Implement debounce/throttle

### Debug Scenarios
- Fix memory leaks
- Resolve this binding issues
- Handle async errors

## Study Tips

### Hands-On Practice
1. Run all code examples in console
2. Modify examples to test understanding
3. Build projects using these concepts

### Interview Preparation
1. Practice explaining concepts clearly
2. Draw diagrams for visual concepts
3. Prepare real-world use cases

### Common Mistakes to Avoid
- Over-complicating explanations
- Not providing concrete examples
- Ignoring performance implications
- Missing edge cases in implementations

## Resources for Deep Dive

### Specifications
- ECMAScript specification for language details
- MDN for practical documentation
- V8 blog for implementation insights

### Practice Platforms
- Build small utilities using each concept
- Contribute to open source to see patterns
- Review framework source code

## Quick Reference

### Execution Order
```
Sync → Microtasks → Macrotasks → Render
```

### This Binding Priority
```
new > explicit (call/apply/bind) > implicit > default
```

### Type Coercion Rules
```
Number("") → 0
Boolean([]) → true
String(null) → "null"
```

## Next Steps
- Complete all code exercises in each topic
- Build a project combining multiple concepts
- Practice explaining concepts to others
- Review framework implementations