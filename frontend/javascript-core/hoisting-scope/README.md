# JavaScript Hoisting & Scope

## Quick Summary
- Hoisting moves declarations to top of their scope
- Only declarations are hoisted, not initializations  
- Function declarations fully hoisted, variables partially
- let/const have temporal dead zone (TDZ)
- JavaScript has function scope and block scope

## Core Concepts

### What is Hoisting?
JavaScript's default behavior of moving declarations to the top of their containing scope during compilation phase. Code behaves as if declarations were written at the top.

Example: `./code/hoisting-basics.js`

### Variable Hoisting
Variables declared with var are hoisted and initialized to undefined. Let/const are hoisted but not initialized (TDZ).

Example: `./code/variable-hoisting.js`

### Function Hoisting
Function declarations are fully hoisted (both declaration and body). Function expressions follow variable hoisting rules.

Example: `./code/function-hoisting.js`

### Temporal Dead Zone
The period between entering scope and declaration where let/const variables cannot be accessed.

Example: `./code/temporal-dead-zone.js`

## Scope Types

### Global Scope
Variables accessible throughout the program.
Example: `./code/global-scope.js`

### Function Scope
Variables accessible within function and nested functions.
Example: `./code/function-scope.js`

### Block Scope
Variables accessible within block (let/const only).
Example: `./code/block-scope.js`

### Module Scope
Top-level scope in ES modules.
Example: `./code/module-scope.js`

## Scope Chain

### Lexical Scoping
Scope determined by where variables are declared in code.
Example: `./code/lexical-scope.js`

### Scope Chain Resolution
How JavaScript resolves variables through nested scopes.
Example: `./code/scope-chain.js`

### Dynamic vs Static Scope
JavaScript uses static (lexical) scoping.
Comparison: `./code/static-vs-dynamic.js`

## Common Pitfalls

### Pitfall 1: Accessing Before Declaration
Using variables before they're declared.
Solution: `./code/pitfall-before-declaration.js`

### Pitfall 2: Loop Variable Scope
var in loops creates function scope issues.
Solution: `./code/pitfall-loop-scope.js`

### Pitfall 3: Function vs Block Scope
Misunderstanding var scope in blocks.
Solution: `./code/pitfall-block-confusion.js`

### Pitfall 4: Hoisting Priority
Function declarations override variable declarations.
Example: `./code/pitfall-hoisting-priority.js`

## Interview Questions

### Question 1: Output Prediction
Predict console output with hoisting.
- Problems: `./code/interview-output-prediction.js`
- Tests hoisting understanding

### Question 2: Scope Chain Puzzle
Trace variable resolution through scopes.
- Problem: `./code/interview-scope-chain.js`
- Tests scope chain knowledge

### Question 3: Fix Hoisting Issues
Debug and fix hoisting-related bugs.
- Problems: `./code/interview-fix-hoisting.js`
- Tests practical debugging

### Question 4: TDZ Edge Cases
Handle temporal dead zone scenarios.
- Examples: `./code/interview-tdz-cases.js`
- Tests let/const understanding

## Variable Declaration Keywords

### var
- Function scoped
- Hoisted and initialized to undefined
- Can be redeclared
- No block scope

### let
- Block scoped
- Hoisted but not initialized (TDZ)
- Cannot be redeclared in same scope
- Preferred for variables that change

### const
- Block scoped
- Hoisted but not initialized (TDZ)
- Cannot be redeclared or reassigned
- Preferred for constants

Comparison: `./code/var-let-const-comparison.js`

## Advanced Topics

### IIFE and Scope
Creating isolated scopes with IIFE.
Example: `./code/iife-scope.js`

### Closure and Scope
How closures capture scope.
Example: `./code/closure-scope.js`

### With Statement (Deprecated)
Dynamic scope manipulation.
Example: `./code/with-statement.js`

### Eval and Scope
Dynamic code execution scope issues.
Example: `./code/eval-scope.js`

## Edge Cases

### Class Hoisting
Classes are hoisted but in TDZ.
Example: `./code/class-hoisting.js`

### Import Hoisting
ES6 imports are hoisted.
Example: `./code/import-hoisting.js`

### Nested Function Hoisting
Hoisting in nested functions.
Example: `./code/nested-hoisting.js`

## Performance Considerations

### Scope Lookup Cost
Performance impact of scope chain depth.
Benchmark: `./code/scope-performance.js`

### Variable Access Optimization
Local variables faster than global.
Example: `./code/variable-access-perf.js`

## Debugging Tips

### Chrome DevTools
1. Use Scope panel in debugger
2. Set breakpoints to inspect scope
3. Watch expressions for variables
4. Use console.log at different points

### Common Issues
- ReferenceError: not defined
- TypeError: undefined is not a function
- Unexpected undefined values
- Variables changing unexpectedly

## Best Practices

### DO:
- Declare variables at top of scope
- Use const by default, let when needed
- Avoid var in modern code
- Keep scope chains shallow
- Use block scope to limit variable lifetime

### DON'T:
- Rely on hoisting behavior
- Use variables before declaration
- Create unnecessary global variables
- Use with statement
- Mix var and let/const

## Real-World Scenarios

### Configuration Objects
Scope patterns for configuration.
Example: `./code/config-scope.js`

### Event Handlers
Scope issues in event callbacks.
Example: `./code/event-handler-scope.js`

### Async Operations
Scope in promises and async/await.
Example: `./code/async-scope.js`

## Common Interview Mistakes

### Conceptual Errors
- Thinking let/const aren't hoisted
- Not understanding TDZ
- Confusing scope and context (this)
- Missing function expression hoisting rules

### Practical Errors
- Declaring functions in blocks
- Assuming block scope for var
- Not considering hoisting order
- Forgetting about closure scope capture

## Practice Problems

1. Predict output of complex hoisting scenario
2. Fix scope-related bugs in given code  
3. Implement scope isolation pattern
4. Create variable shadowing examples
5. Build scope analyzer function

## Related Topics

- [Closures](../closures/README.md)
- [Event Loop](../event-loop/README.md)
- [This Binding](../this-binding/README.md)
- [ES6 Features](../es6-features/README.md)
- [Module Systems](../modules/README.md)