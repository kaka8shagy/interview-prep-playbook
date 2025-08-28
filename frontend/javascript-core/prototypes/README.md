# JavaScript Prototypes & Inheritance

## Quick Summary
- JavaScript uses prototypal inheritance, not classical
- Every object has internal [[Prototype]] link to another object
- Prototype chain enables property/method inheritance
- ES6 classes are syntactic sugar over prototypes
- Understanding prototypes crucial for framework internals

## Core Concepts

### The Prototype Chain
Every JavaScript object has an internal property [[Prototype]] that references another object. When accessing a property, JavaScript searches up this chain until found or reaches null.

Visualization: `./diagrams/prototype-chain.txt`

### Object Creation Patterns
Different ways to create objects and set up prototypes.

Examples: `./code/object-creation.js`

### Constructor Functions
Functions invoked with `new` keyword to create instances.

Implementation: `./code/constructor-functions.js`

### Prototype Property
Constructor functions have `prototype` property that becomes [[Prototype]] of instances.

Example: `./code/prototype-property.js`

## Inheritance Patterns

### Prototypal Inheritance
Direct object-to-object inheritance using Object.create().

Implementation: `./code/prototypal-inheritance.js`

### Constructor Inheritance
Classical-style inheritance using constructor functions.

Implementation: `./code/constructor-inheritance.js`

### ES6 Class Inheritance
Modern syntax for prototype-based inheritance.

Implementation: `./code/class-inheritance.js`

### Mixin Pattern
Copying properties from multiple sources.

Implementation: `./code/mixin-pattern.js`

## Object Methods

### Object.create()
Creates object with specified prototype.
Usage: `./code/object-create.js`

### Object.getPrototypeOf()
Returns [[Prototype]] of object.
Usage: `./code/get-prototype.js`

### Object.setPrototypeOf()
Sets [[Prototype]] of object (performance warning).
Usage: `./code/set-prototype.js`

### instanceof Operator
Checks prototype chain for constructor.
Usage: `./code/instanceof.js`

## Property Lookup

### Property Resolution
How JavaScript finds properties through prototype chain.
Example: `./code/property-lookup.js`

### Shadowing
When instance property hides prototype property.
Example: `./code/property-shadowing.js`

### hasOwnProperty
Distinguishing own vs inherited properties.
Example: `./code/hasownproperty.js`

## Common Pitfalls

### Pitfall 1: Shared Reference Types
Arrays/objects on prototype shared by all instances.
Solution: `./code/shared-reference-fix.js`

### Pitfall 2: Constructor Property
Lost constructor reference in inheritance.
Solution: `./code/constructor-property-fix.js`

### Pitfall 3: Extending Native Prototypes
Dangers of modifying built-in prototypes.
Example: `./code/native-prototype-danger.js`

### Pitfall 4: Performance Issues
Prototype chain length impact.
Optimization: `./code/prototype-performance.js`

## Interview Questions

### Question 1: Implement Object.create()
Build Object.create polyfill from scratch.
- Solution: `./code/interview-object-create.js`
- Tests understanding of prototype setting

### Question 2: Build Inheritance System
Create classical inheritance without ES6 classes.
- Solution: `./code/interview-inheritance.js`
- Tests prototype chain manipulation

### Question 3: instanceof Implementation
Implement instanceof operator.
- Solution: `./code/interview-instanceof.js`
- Tests prototype chain traversal

### Question 4: Deep Clone with Prototypes
Clone object preserving prototype chain.
- Solution: `./code/interview-deep-clone.js`
- Tests advanced prototype handling

## ES6 Classes Deep Dive

### Under the Hood
How classes translate to prototypes.
Comparison: `./code/class-vs-prototype.js`

### Static Methods
Class-level methods and properties.
Example: `./code/static-methods.js`

### Private Fields
Modern private properties using #.
Example: `./code/private-fields.js`

### Super Keyword
How super works in methods and constructor.
Example: `./code/super-keyword.js`

## Advanced Topics

### Prototype Pollution
Security vulnerability in prototype manipulation.
Example: `./code/prototype-pollution.js`

### Proxy with Prototypes
Meta-programming prototype behavior.
Example: `./code/proxy-prototypes.js`

### Multiple Inheritance
Simulating multiple inheritance in JavaScript.
Implementation: `./code/multiple-inheritance.js`

## Performance Considerations

### Chain Length
Impact of deep prototype chains.
Benchmarks: `./code/chain-performance.js`

### Property Access
Cost of prototype property lookup.
Optimization: `./code/access-optimization.js`

### Memory Usage
Prototype vs instance properties.
Analysis: `./code/memory-analysis.js`

## Real-World Applications

### Framework Patterns
How React, Vue, Angular use prototypes.
Examples: `./code/framework-patterns.js`

### Polyfills
Adding missing methods via prototypes.
Examples: `./code/polyfills.js`

### Plugin Systems
Extensible APIs using prototypes.
Implementation: `./code/plugin-system.js`

## Debugging Tips

### Chrome DevTools
1. Use __proto__ in console (deprecated but useful)
2. Inspect [[Prototype]] in object properties
3. Use console.dir() for detailed view

### Common Issues
- Method not found on object
- Unexpected shared state
- instanceof returning false unexpectedly
- Changes not reflecting in instances

## Best Practices

### DO:
- Use ES6 classes for cleaner syntax
- Put methods on prototype for memory efficiency
- Use Object.create() for prototype inheritance
- Check hasOwnProperty when iterating
- Document inheritance hierarchies

### DON'T:
- Modify Object.prototype
- Use __proto__ in production code
- Create deep prototype chains (>3-4 levels)
- Rely on constructor property
- Mix inheritance patterns inconsistently

## Comparison with Classical Inheritance

### JavaScript (Prototypal)
- Objects inherit from objects
- Dynamic inheritance chain
- Can change prototype at runtime
- No true classes (until ES6 syntax)

### Classical (Java/C++)
- Classes inherit from classes
- Static inheritance hierarchy
- Cannot change inheritance at runtime
- Clear class/instance distinction

Comparison table: `./diagrams/inheritance-comparison.txt`

## Practice Problems

1. Build a custom event emitter with inheritance
2. Create a type checking system using prototypes
3. Implement method chaining with prototypes
4. Build a simple ORM with prototype methods
5. Create plugin architecture for extensibility

## Related Topics

- [This Binding](../this-binding/README.md)
- [Classes](../es6-features/README.md#classes)
- [Object Methods](../es6-features/README.md#object-methods)
- [Proxy & Reflect](../proxy-reflect/README.md)
- [Memory Management](../memory-management/README.md)