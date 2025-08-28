# JavaScript Type Coercion

## Quick Summary
- JavaScript automatically converts types when needed
- Implicit coercion happens automatically
- Explicit coercion done intentionally by developer
- == allows coercion, === prevents it
- Understanding coercion prevents subtle bugs

## Core Concepts

### What is Type Coercion?
Automatic or implicit conversion of values from one data type to another. JavaScript is weakly typed, allowing operations between different types.

### Types of Coercion
1. **String coercion**: Converting to string
2. **Number coercion**: Converting to number  
3. **Boolean coercion**: Converting to boolean

Examples: `./code/coercion-types.js`

### Implicit vs Explicit
- **Implicit**: Automatic by JavaScript
- **Explicit**: Intentional using functions/operators

Comparison: `./code/implicit-vs-explicit.js`

## Coercion Rules

### ToString Conversion
How different types convert to strings.
Rules and examples: `./code/to-string.js`

### ToNumber Conversion  
How different types convert to numbers.
Rules and examples: `./code/to-number.js`

### ToBoolean Conversion
Truthy and falsy values.
Rules and examples: `./code/to-boolean.js`

### ToPrimitive Conversion
Converting objects to primitives.
Algorithm: `./code/to-primitive.js`

## Operators and Coercion

### Addition Operator (+)
String concatenation vs numeric addition.
Examples: `./code/addition-operator.js`

### Other Arithmetic Operators
How -, *, /, % handle coercion.
Examples: `./code/arithmetic-operators.js`

### Comparison Operators
Coercion in ==, <, >, <=, >=.
Examples: `./code/comparison-operators.js`

### Logical Operators
&&, ||, ! and truthy/falsy.
Examples: `./code/logical-operators.js`

## Equality Comparisons

### == vs ===
Loose vs strict equality.
Detailed comparison: `./code/equality-comparison.js`

### Object.is()
Even stricter than ===.
Examples: `./code/object-is.js`

### Equality Algorithm
Step-by-step == algorithm.
Implementation: `./code/equality-algorithm.js`

## Common Pitfalls

### Pitfall 1: [] == false
Empty array equals false confusion.
Explanation: `./code/pitfall-array-false.js`

### Pitfall 2: NaN Comparisons
NaN !== NaN uniqueness.
Solution: `./code/pitfall-nan.js`

### Pitfall 3: null vs undefined
Subtle differences in coercion.
Examples: `./code/pitfall-null-undefined.js`

### Pitfall 4: Object to Primitive
Unexpected string conversions.
Examples: `./code/pitfall-object-primitive.js`

## Interview Questions

### Question 1: Coercion Output
Predict output of coercion expressions.
- Problems: `./code/interview-predict-output.js`
- Tests coercion understanding

### Question 2: Truthy/Falsy
Identify truthy and falsy values.
- Examples: `./code/interview-truthy-falsy.js`
- Tests boolean conversion

### Question 3: Equality Puzzles
Solve == vs === puzzles.
- Puzzles: `./code/interview-equality-puzzles.js`
- Tests equality rules

### Question 4: Fix Coercion Bugs
Debug coercion-related issues.
- Problems: `./code/interview-fix-bugs.js`
- Tests practical knowledge

## Truthy and Falsy Values

### Falsy Values
Only 8 falsy values in JavaScript:
- false
- 0, -0, 0n (BigInt)
- "", '', `` (empty string)
- null
- undefined
- NaN

### Truthy Values
Everything else is truthy, including:
- "0", "false" (non-empty strings)
- [] (empty array)
- {} (empty object)
- function() {} (functions)

Examples: `./code/truthy-falsy-complete.js`

## Type Checking

### typeof Operator
Check primitive types.
Quirks: `./code/typeof-operator.js`

### instanceof Operator
Check object types.
Usage: `./code/instanceof-operator.js`

### Array.isArray()
Reliable array checking.
Examples: `./code/array-checking.js`

### Custom Type Checking
Building robust type checkers.
Implementation: `./code/custom-type-checking.js`

## Advanced Topics

### Symbol Coercion
Special coercion rules for Symbols.
Examples: `./code/symbol-coercion.js`

### BigInt Coercion
BigInt type coercion rules.
Examples: `./code/bigint-coercion.js`

### valueOf vs toString
Customizing object coercion.
Examples: `./code/valueof-tostring.js`

### Coercion in Template Literals
String conversion in templates.
Examples: `./code/template-literal-coercion.js`

## Performance Considerations

### Coercion Cost
Performance impact of type coercion.
Benchmarks: `./code/coercion-performance.js`

### Optimization Tips
Avoiding unnecessary coercion.
Best practices: `./code/optimization-tips.js`

## Real-World Scenarios

### Form Input Handling
Coercion with user input.
Examples: `./code/form-input-coercion.js`

### JSON Parsing
Type coercion in JSON operations.
Examples: `./code/json-coercion.js`

### URL Parameters
Query string coercion.
Examples: `./code/url-param-coercion.js`

## Debugging Tips

### Common Type Errors
- Cannot read property of undefined
- X is not a function
- Cannot convert undefined to object

### Console Techniques
1. Use typeof to check types
2. console.log with multiple values
3. JSON.stringify for objects
4. debugger for step-through

## Best Practices

### DO:
- Use === for comparisons
- Explicitly convert types when needed
- Validate input types
- Use Number() for numeric conversion
- Use String() for string conversion

### DON'T:
- Rely on implicit coercion
- Use == unless specifically needed
- Compare with NaN using ==
- Assume coercion behavior
- Mix types unnecessarily

## Edge Cases

### Special Number Values
Infinity, -Infinity, NaN behavior.
Examples: `./code/special-numbers.js`

### Date Coercion
Date object conversion rules.
Examples: `./code/date-coercion.js`

### Regular Expression Coercion
RegExp to string/boolean.
Examples: `./code/regex-coercion.js`

## Common Interview Mistakes

### Conceptual Errors
- Not knowing all falsy values
- Confusing null and undefined coercion
- Missing object to primitive conversion
- Wrong == algorithm understanding

### Practical Errors
- Using + for number addition with strings
- Not handling NaN properly
- Assuming [] == false means [] is falsy
- Type checking with typeof for arrays

## Practice Problems

1. Implement custom == algorithm
2. Build type validation library
3. Create safe type converter
4. Debug coercion-related bugs
5. Predict complex coercion chains

## Related Topics

- [Operators](../operators/README.md)
- [Data Types](../data-types/README.md)
- [Equality](../equality/README.md)
- [Type Checking](../type-checking/README.md)
- [ES6 Features](../es6-features/README.md)