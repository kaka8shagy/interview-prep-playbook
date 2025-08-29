# Cyclic Sort

## Quick Summary
- Pattern for problems involving arrays containing numbers in a given range
- Efficiently sorts arrays by placing each element at its correct index
- Key insight: if array contains n elements with numbers from 1 to n, element with value i should be at index i-1
- Time complexity: O(n), Space complexity: O(1)
- Useful for finding missing numbers, duplicates, and smallest positive integers

## Core Concepts

### Cyclic Sort Pattern
Place each element at its correct position. For array containing numbers 1 to n, number i goes to index i-1.

### In-Place Swapping
Swap elements until each is in its correct position, then move to next index.

### Range-Based Problems
Works when you know the range of numbers (typically 1 to n or 0 to n-1).

## Implementation Patterns
See code examples:
- Missing number: `./code/missing-number.js`
- Duplicate finding: `./code/find-duplicate-number.js`
- First missing positive: `./code/first-missing-positive.js`

## Common Pitfalls
- Forgetting to handle numbers outside expected range
- Infinite loops when not properly swapping
- Off-by-one errors in index calculations
- Not handling duplicate values correctly

## Interview Questions

### 1. Find All Numbers Disappeared in an Array
**Approach**: Use cyclic sort, then find missing positions
**Solution**: `./code/find-disappeared-numbers.js`

### 2. Missing Number
**Approach**: Sort array cyclically, find first wrong position
**Solution**: `./code/missing-number.js`

### 3. Find All Duplicates in an Array
**Approach**: After cyclic sort, duplicates will be displaced
**Solution**: `./code/find-all-duplicates.js`

### 4. Set Mismatch
**Approach**: Find duplicate and missing number using cyclic sort
**Solution**: `./code/set-mismatch.js`

### 5. Find the Duplicate Number
**Approach**: Use cyclic sort or Floyd's algorithm
**Solution**: `./code/find-duplicate-number.js`

### 6. First Missing Positive
**Approach**: Sort positive numbers, find first missing
**Solution**: `./code/first-missing-positive.js`

### 7. Kth Missing Positive Number
**Approach**: Use cyclic sort concept with positive numbers
**Solution**: `./code/kth-missing-positive.js`

## Related Topics
- [Arrays and Strings](../arrays-and-strings/README.md) - Foundation data structure
- [Two Pointers](../two-pointers/README.md) - Alternative approach for some problems