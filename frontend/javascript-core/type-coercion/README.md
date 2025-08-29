# JavaScript Type Coercion

## Quick Summary
- JavaScript automatically converts types when needed (implicit coercion)
- Understanding coercion rules prevents subtle bugs and unexpected behavior
- == allows coercion, === prevents it - choose wisely
- Only 8 values are falsy, everything else is truthy
- Master the ToPrimitive algorithm for object conversions

## Implementation Files

### Core Concepts
- **Fundamentals**: `./code/fundamentals.js`
  - String, number, and boolean coercion basics
  - ToPrimitive algorithm demonstration
  - Falsy vs truthy values with examples

### Advanced Patterns
- **Advanced Patterns**: `./code/advanced-patterns.js`  
  - Equality comparison algorithm (== implementation)
  - Complex object coercion with Symbol.toPrimitive
  - Array coercion complexities and edge cases
  - Modern types (Symbol, BigInt) coercion rules

### Real-World Applications  
- **Practical Applications**: `./code/practical-applications.js`
  - Form input validation and safe coercion
  - URL parameter handling with type inference
  - JSON coercion with special values
  - Database value preparation and parsing

### Interview Preparation
- **Interview Problems**: `./code/interview-problems.js`
  - Classic output prediction questions
  - Bug fixing exercises with coercion issues  
  - Custom equality implementation
  - Advanced coercion puzzles and explanations

## Core Coercion Rules

### String Coercion
```javascript
// Implicit: + operator with strings
5 + "5"        // "55"
true + " fact" // "true fact"

// Explicit: String() function
String(123)    // "123"
String(null)   // "null"
```

### Number Coercion  
```javascript
// Implicit: arithmetic operators (-, *, /)
"5" - 2        // 3
"5" * 2        // 10

// Explicit: Number() function, unary +
Number("123")  // 123
+"123"         // 123
```

### Boolean Coercion
```javascript
// Falsy values (only 8):
false, 0, -0, 0n, "", null, undefined, NaN

// Everything else is truthy:
"0", "false", [], {}, function() {}
```

## The ToPrimitive Algorithm

When objects need to become primitives:
1. Check for Symbol.toPrimitive method
2. For string context: try toString() then valueOf()  
3. For number context: try valueOf() then toString()
4. Throw TypeError if no primitive result

## Equality Comparison (==)

The == operator follows these steps:
1. If same types, use === 
2. null == undefined (special case)
3. Number/string: convert string to number
4. Boolean: convert to number, then retry
5. Object: convert to primitive, then retry

## Common Interview Traps

```javascript
[] == false     // true (empty array to primitive)
[] == ![]       // true (false becomes 0) 
null == 0       // false (null only equals undefined)
"2" > "12"      // true (string comparison, not numeric)
```

## Best Practices

**DO:**
- Use === for comparisons (avoids coercion)
- Explicitly convert types: Number(), String(), Boolean()
- Validate input types before processing
- Use Array.isArray() for array detection

**DON'T:**  
- Rely on implicit coercion in complex expressions
- Use == unless you specifically need coercion
- Assume type coercion behavior without testing
- Mix types unnecessarily in operations

## Performance Notes

- Explicit conversion is often faster than implicit
- Number() vs parseInt() vs unary + have different performance
- Type checking before operations prevents unexpected coercion
- Template literals always coerce to strings

## Related Topics
- [Operators and Precedence](../operators/README.md)
- [Equality and Comparison](../equality/README.md)  
- [ES6 Features](../es6-features/README.md)
- [Error Handling](../error-handling/README.md)