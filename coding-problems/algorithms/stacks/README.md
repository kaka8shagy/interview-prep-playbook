# Stacks

## Quick Summary
- LIFO (Last In, First Out) data structure
- Essential for problems involving matching pairs, nearest elements, and expression evaluation
- Common patterns: monotonic stacks, balanced parentheses, next greater element
- Time complexity: O(1) for push/pop operations
- Space complexity: O(n) for stack storage

## Core Concepts

### Basic Stack Operations
Push (add to top), Pop (remove from top), Peek (view top element), isEmpty check.

### Monotonic Stacks
Maintain elements in strictly increasing or decreasing order. Useful for nearest smaller/greater element problems.

### Expression Evaluation
Stacks are fundamental for parsing and evaluating mathematical expressions and validating balanced parentheses.

## Implementation Patterns
See code examples:
- Next greater/smaller: `./code/next-greater-element.js`
- Balanced parentheses: `./code/valid-parentheses.js`
- Monotonic stack: `./code/daily-temperatures.js`

## Common Pitfalls
- Forgetting to check if stack is empty before popping
- Not handling edge cases (empty strings, unbalanced expressions)
- Incorrect order of operations in expression evaluation
- Memory issues with very large stacks

## Interview Questions

### 1. Next Greater Element
**Approach**: Use monotonic decreasing stack
**Solution**: `./code/next-greater-element.js`

### 2. Previous Greater Element
**Approach**: Similar to next greater, scan from right to left
**Solution**: `./code/previous-greater-element.js`

### 3. Next Smaller Element
**Approach**: Use monotonic increasing stack
**Solution**: `./code/next-smaller-element.js`

### 4. Daily Temperatures
**Approach**: Monotonic stack to find next warmer day
**Solution**: `./code/daily-temperatures.js`

### 5. Largest Rectangle in Histogram
**Approach**: Stack to find largest area under histogram
**Solution**: `./code/largest-rectangle.js`

## Related Topics
- [Arrays and Strings](../arrays-and-strings/README.md) - Implementation foundation
- [Trees](../trees/README.md) - DFS traversal uses stack
- [Expression Parsing](../parsing/README.md) - Stack-based evaluation