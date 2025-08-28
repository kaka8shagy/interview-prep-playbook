# JavaScript This Binding & Context

## Quick Summary
- `this` value depends on how function is called, not where it's defined
- Four binding rules: default, implicit, explicit, new
- Arrow functions inherit `this` from enclosing scope
- Binding priority: new > explicit > implicit > default
- Common source of bugs in callbacks and event handlers

## Core Concepts

### What is "this"?
The `this` keyword refers to the object that is executing the current function. Its value is determined at runtime based on how the function is invoked.

### Default Binding
Standalone function invocation. In non-strict mode, `this` refers to global object (window in browser, global in Node.js). In strict mode, `this` is undefined.

Example: `./code/default-binding.js`

### Implicit Binding
When function is called as a method of an object, `this` refers to the object.

Example: `./code/implicit-binding.js`

### Explicit Binding
Using call(), apply(), or bind() to explicitly set `this` value.

Example: `./code/explicit-binding.js`

### New Binding
When function is invoked with `new` keyword, `this` refers to newly created object.

Example: `./code/new-binding.js`

### Arrow Functions
Arrow functions don't have their own `this`. They inherit `this` from enclosing lexical scope.

Example: `./code/arrow-functions.js`

## Binding Methods

### call() Method
Implementation: `./code/call-method.js`

Invokes function immediately with specified `this` value and arguments.

### apply() Method
Implementation: `./code/apply-method.js`

Like call(), but accepts arguments as array.

### bind() Method
Implementation: `./code/bind-method.js`

Creates new function with permanently bound `this` value.

## Common Patterns

### Method Borrowing
Using methods from one object on another.
Example: `./code/method-borrowing.js`

### Event Handlers
Managing `this` in event callbacks.
Example: `./code/event-handlers.js`

### Class Methods
Binding in ES6 classes.
Example: `./code/class-methods.js`

### Callbacks
Preserving context in callbacks.
Example: `./code/callbacks-context.js`

## Common Pitfalls

### Pitfall 1: Lost Context
Method loses `this` when passed as callback.
Solution: `./code/lost-context-fix.js`

### Pitfall 2: Nested Functions
Inner functions don't inherit `this`.
Solution: `./code/nested-functions-fix.js`

### Pitfall 3: setTimeout/setInterval
Async functions lose context.
Solution: `./code/async-context-fix.js`

### Pitfall 4: Array Methods
forEach, map, filter callback context.
Solution: `./code/array-methods-context.js`

## Interview Questions

### Question 1: Implement call()
Build Function.prototype.call from scratch.
- Solution: `./code/interview-implement-call.js`
- Tests understanding of context manipulation

### Question 2: Implement bind()
Build Function.prototype.bind from scratch.
- Solution: `./code/interview-implement-bind.js`
- Tests closure and context preservation

### Question 3: Fix This Context
Debug and fix context issues in given code.
- Problems and solutions: `./code/interview-fix-context.js`
- Tests practical debugging skills

### Question 4: Output Prediction
Predict `this` value in complex scenarios.
- Examples: `./code/interview-output-prediction.js`
- Tests understanding of all binding rules

## Binding Priority

When multiple rules could apply, JavaScript follows this priority:

1. **new binding**: Highest priority
2. **explicit binding**: call/apply/bind
3. **implicit binding**: Method calls
4. **default binding**: Lowest priority

Priority examples: `./code/binding-priority.js`

## Special Cases

### Global Context
Behavior differences between browser and Node.js.
Example: `./code/global-context.js`

### Strict Mode
How strict mode affects `this` binding.
Example: `./code/strict-mode.js`

### Primitive Values
What happens when `this` is primitive.
Example: `./code/primitive-this.js`

## ES6+ Considerations

### Classes
- Class methods are not bound by default
- Constructor `this` refers to instance
- Static methods have class as `this`

### Arrow Functions in Classes
Example: `./code/arrow-in-class.js`

Pros and cons of arrow function properties.

### Method Shorthand
Object method shorthand syntax.
Example: `./code/method-shorthand.js`

## Performance Considerations

### Binding Cost
- bind() creates new function (memory cost)
- Arrow functions in render methods
- Repeated binding in loops

Optimization strategies: `./code/performance-optimization.js`

## Debugging Tips

### Chrome DevTools
1. Use debugger to inspect `this` value
2. Console log `this` at different points
3. Use conditional breakpoints

### Common Issues
- Undefined is not an object (reading property)
- Cannot read property of undefined
- this.setState is not a function

## Best Practices

### DO:
- Use arrow functions for callbacks in classes
- Bind methods in constructor for React components
- Use call/apply for method borrowing
- Store `this` reference when needed (self/that)
- Use strict mode to catch errors early

### DON'T:
- Rely on default binding in production code
- Pass methods directly as callbacks without binding
- Use `var self = this` when arrow functions work
- Forget about binding in event handlers
- Mix arrow and regular functions inconsistently

## Real-World Applications

### React Components
Class component binding patterns.
Example: `./code/react-patterns.js`

### Event Emitters
Managing context in pub/sub systems.
Example: `./code/event-emitter.js`

### Decorators
Using `this` in method decorators.
Example: `./code/decorators.js`

## Practice Problems

1. Build a function that always maintains its context
2. Create a method chaining API with proper `this`
3. Implement a polyfill for bind()
4. Fix context issues in provided code
5. Build an object with fluent interface

## Related Topics

- [Closures](../closures/README.md)
- [Prototypes](../prototypes/README.md)
- [Classes](../es6-features/README.md#classes)
- [Arrow Functions](../es6-features/README.md#arrow-functions)
- [Event Loop](../event-loop/README.md)