# ES6+ Features

## Quick Summary
- ES6 (ES2015) brought major JavaScript enhancements
- Arrow functions, destructuring, template literals
- Classes, modules, promises native support
- let/const, Map/Set, Symbol, Proxy
- Yearly releases since ES2016 with incremental features

## Arrow Functions

### Syntax and Usage
Concise function syntax with lexical this binding.
Examples: `./code/arrow-functions.js`

### When to Use
- Callbacks and array methods
- Preserving this context
- Single expression functions

### When NOT to Use
- Object methods needing dynamic this
- Constructors
- Functions needing arguments object

## Destructuring

### Array Destructuring
Extract values from arrays into variables.
Examples: `./code/array-destructuring.js`

### Object Destructuring
Extract properties from objects.
Examples: `./code/object-destructuring.js`

### Advanced Patterns
Nested, default values, rest syntax.
Examples: `./code/destructuring-advanced.js`

## Template Literals

### Basic Usage
String interpolation and multiline strings.
Examples: `./code/template-literals.js`

### Tagged Templates
Custom string processing functions.
Examples: `./code/tagged-templates.js`

## Spread and Rest

### Spread Operator
Expand iterables into individual elements.
Examples: `./code/spread-operator.js`

### Rest Parameters
Collect remaining arguments into array.
Examples: `./code/rest-parameters.js`

## Classes

### Class Syntax
Syntactic sugar over prototypes.
Examples: `./code/class-syntax.js`

### Inheritance
Extends and super keywords.
Examples: `./code/class-inheritance.js`

### Private Fields
Hash prefix for private properties.
Examples: `./code/private-fields.js`

### Static Methods
Class-level methods and properties.
Examples: `./code/static-methods.js`

## Enhanced Object Literals

### Shorthand Properties
Concise property definitions.
Examples: `./code/object-shorthand.js`

### Computed Properties
Dynamic property names.
Examples: `./code/computed-properties.js`

### Method Definitions
Shorter method syntax.
Examples: `./code/method-definitions.js`

## Map and Set

### Map
Key-value pairs with any key type.
Examples: `./code/map-usage.js`

### Set
Unique values collection.
Examples: `./code/set-usage.js`

### WeakMap and WeakSet
Garbage collection friendly versions.
Examples: `./code/weak-collections.js`

## Symbols

### Creating Symbols
Unique identifiers.
Examples: `./code/symbol-basics.js`

### Well-Known Symbols
Built-in symbols for customization.
Examples: `./code/well-known-symbols.js`

### Symbol Registry
Global symbol sharing.
Examples: `./code/symbol-registry.js`

## Promises Native Support

Built-in Promise implementation.
See dedicated topic: [Promises](../promises/README.md)

## Default Parameters

### Basic Defaults
Function parameter default values.
Examples: `./code/default-parameters.js`

### Expressions as Defaults
Dynamic default values.
Examples: `./code/default-expressions.js`

## Interview Questions

### Question 1: Destructuring Complex
Extract nested values with renaming.
- Problem: `./code/interview-destructuring.js`
- Tests destructuring mastery

### Question 2: Class vs Function
Convert between class and constructor function.
- Comparison: `./code/interview-class-function.js`
- Tests understanding of classes

### Question 3: Array Methods
Implement polyfills for ES6 array methods.
- Implementation: `./code/interview-array-methods.js`
- Tests method understanding

### Question 4: Object Manipulation
Use spread/rest for object operations.
- Solutions: `./code/interview-object-ops.js`
- Tests practical usage

## ES2016+ Features

### ES2016 (ES7)
- Array.includes()
- Exponentiation operator (**)
Examples: `./code/es2016-features.js`

### ES2017 (ES8)
- Async/await
- Object.values/entries()
- String padding
Examples: `./code/es2017-features.js`

### ES2018 (ES9)
- Rest/spread for objects
- Async iteration
- Promise.finally()
Examples: `./code/es2018-features.js`

### ES2019 (ES10)
- Array.flat/flatMap()
- Object.fromEntries()
- Optional catch binding
Examples: `./code/es2019-features.js`

### ES2020 (ES11)
- Optional chaining (?.)
- Nullish coalescing (??)
- BigInt
- Dynamic imports
Examples: `./code/es2020-features.js`

### ES2021 (ES12)
- Logical assignment operators
- String.replaceAll()
- Promise.any()
Examples: `./code/es2021-features.js`

### ES2022 (ES13)
- Top-level await
- Class fields and static blocks
- Array.at()
Examples: `./code/es2022-features.js`

## Common Pitfalls

### Pitfall 1: Arrow Function this
Misunderstanding lexical this.
Solution: `./code/pitfall-arrow-this.js`

### Pitfall 2: Destructuring undefined
Destructuring null/undefined errors.
Solution: `./code/pitfall-destructuring.js`

### Pitfall 3: Spread Performance
Performance implications of spread.
Analysis: `./code/pitfall-spread-perf.js`

### Pitfall 4: Class Hoisting
Classes are not hoisted like functions.
Example: `./code/pitfall-class-hoisting.js`

## Performance Considerations

### Spread vs Object.assign
Performance comparison.
Benchmark: `./code/perf-spread-assign.js`

### Map vs Object
When to use each.
Analysis: `./code/perf-map-object.js`

### Template Literals Cost
String concatenation comparison.
Benchmark: `./code/perf-template-literals.js`

## Migration Guide

### From ES5 to ES6
Common patterns to update.
Guide: `./code/migration-es5-es6.js`

### Polyfills and Transpilation
Supporting older browsers.
Setup: `./code/polyfill-setup.js`

## Best Practices

### DO:
- Use const by default, let when reassigning
- Prefer arrow functions for callbacks
- Use destructuring for cleaner code
- Leverage Map/Set for appropriate use cases
- Use template literals for string building

### DON'T:
- Use var in ES6+ code
- Overuse arrow functions for methods
- Destructure deeply nested structures
- Spread large arrays unnecessarily
- Mix old and new syntax inconsistently

## Real-World Applications

### React Patterns
ES6+ in React components.
Examples: `./code/react-es6-patterns.js`

### Node.js Patterns
Modern Node.js code.
Examples: `./code/node-es6-patterns.js`

### Functional Programming
ES6+ enabling FP patterns.
Examples: `./code/functional-patterns.js`

## Browser Compatibility

### Feature Detection
Checking for ES6+ support.
Implementation: `./code/feature-detection.js`

### Progressive Enhancement
Gradual feature adoption.
Strategy: `./code/progressive-enhancement.js`

## Practice Problems

1. Refactor ES5 code to ES6+
2. Build utility library using ES6 features
3. Implement array method polyfills
4. Create class hierarchy with inheritance
5. Use Map/Set for data structures

## Related Topics

- [Arrow Functions & This](../this-binding/README.md)
- [Promises](../promises/README.md)
- [Modules](../modules/README.md)
- [Generators](../generators/README.md)
- [Proxy & Reflect](../proxy-reflect/README.md)