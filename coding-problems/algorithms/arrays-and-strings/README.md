# Arrays and Strings

## Quick Summary
- Foundation of most coding interviews and algorithm problems
- Linear data structures with contiguous memory allocation
- Common operations: indexing, insertion, deletion, searching, sorting
- Time complexity varies: O(1) for access, O(n) for search in unsorted arrays
- Space complexity: O(1) for most operations unless creating new arrays

## Core Concepts

### Array Fundamentals
Arrays provide constant-time access to elements via indexing but require linear time for operations like insertion/deletion in the middle. Understanding array manipulation is crucial for optimization problems.

### String Processing Patterns
Strings are essentially character arrays with additional methods for pattern matching, substring operations, and transformations. Many array techniques apply directly to string problems.

### Common Problem Categories
- **Element Frequency**: Counting occurrences, finding duplicates
- **Array Transformations**: Building new arrays, running sums, concatenations  
- **Number Validation**: Checking properties like palindromes, special numbers
- **String Manipulation**: IP addresses, anagrams, character operations

## Implementation Patterns
See code examples:
- Basic operations: `./code/basic-operations.js`
- Frequency counting: `./code/frequency-patterns.js`
- String validation: `./code/validation-patterns.js`

## Common Pitfalls
- Off-by-one errors in array indexing
- Forgetting to handle empty arrays or strings
- Not considering edge cases like single elements
- Integer overflow in mathematical operations
- Modifying arrays while iterating (use careful indexing)

## Time & Space Complexity Patterns
- **Access**: O(1) - direct indexing
- **Search**: O(n) - linear scan required
- **Insertion/Deletion**: O(n) - elements need shifting
- **Space**: Often O(1) auxiliary space for in-place algorithms

## Interview Questions

### 1. FizzBuzz
**Approach**: Iterate through numbers, check divisibility conditions
**Solution**: `./code/fizz-buzz.js`

### 2. Palindrome Number  
**Approach**: Convert to string or reverse mathematically
**Solution**: `./code/palindrome-number.js`

### 3. Single Number
**Approach**: XOR all numbers - duplicates cancel out
**Solution**: `./code/single-number.js`

### 4. Contains Duplicate
**Approach**: Use Set or sort array to detect duplicates
**Solution**: `./code/contains-duplicate.js`

### 5. Valid Anagram
**Approach**: Sort strings or use frequency counting
**Solution**: `./code/valid-anagram.js`

### 6. Fibonacci Number
**Approach**: Iterative or dynamic programming approach
**Solution**: `./code/fibonacci-number.js`

### 7. Defanging IP Address
**Approach**: String replacement or character iteration
**Solution**: `./code/defanging-ip-address.js`

### 8. Running Sum of 1d Array
**Approach**: Prefix sum calculation in single pass
**Solution**: `./code/running-sum-1d-array.js`

### 9. Number of Good Pairs
**Approach**: Count frequency, calculate pairs using formula
**Solution**: `./code/number-of-good-pairs.js`

### 10. Richest Customer Wealth
**Approach**: Calculate sum for each customer, track maximum
**Solution**: `./code/richest-customer-wealth.js`

### 11. Build Array from Permutation
**Approach**: Create new array using permutation indices
**Solution**: `./code/build-array-from-permutation.js`

### 12. Concatenation of Array
**Approach**: Append array to itself or use index arithmetic
**Solution**: `./code/concatenation-of-array.js`

### 13. Merge Two Sorted Lists
**Approach**: Two-pointer technique for merging
**Solution**: `./code/merge-two-sorted-lists.js`

## Related Topics
- [Two Pointers](../two-pointers/README.md) - Array traversal patterns
- [Sliding Window](../sliding-window/README.md) - Subarray processing
- [Binary Search](../binary-search/README.md) - Efficient searching in sorted arrays