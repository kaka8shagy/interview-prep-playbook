# Two Pointers

## Quick Summary
- Technique using two pointers to traverse arrays or strings efficiently
- Common patterns: opposite ends, same direction, fast-slow pointers
- Reduces time complexity from O(n²) to O(n) for many problems
- Particularly effective for sorted arrays and linked lists
- Memory efficient with O(1) space complexity

## Core Concepts

### Opposite Direction Pointers
Two pointers start from opposite ends and move toward each other. Used for problems like two sum, palindrome validation, or container problems.

### Same Direction Pointers
Both pointers move in the same direction but at different speeds. Useful for removing elements or detecting cycles.

### Fast-Slow Pointers
One pointer moves faster than the other. Classic application in cycle detection and finding middle elements.

## Implementation Patterns
See code examples:
- Opposite direction: `./code/two-sum-sorted.js`
- Same direction: `./code/remove-duplicates.js` 
- Fast-slow: `./code/linked-list-cycle.js`

## Common Pitfalls
- Boundary checks when pointers meet or cross
- Not handling edge cases (empty arrays, single elements)
- Incorrect pointer movement logic
- Off-by-one errors in loop conditions
- Not considering all possible pointer positions

## Time & Space Complexity Patterns
- **Time**: O(n) - single pass through data structure
- **Space**: O(1) - only using pointer variables
- Significant improvement over nested loop O(n²) approaches

## Interview Questions

### 1. Two Sum II - Input Array Is Sorted
**Approach**: Opposite pointers, adjust based on sum comparison
**Solution**: `./code/two-sum-sorted.js`

### 2. Reverse String
**Approach**: Swap characters at opposite positions
**Solution**: `./code/reverse-string.js`

### 3. Valid Palindrome
**Approach**: Check characters from both ends toward center
**Solution**: `./code/valid-palindrome.js`

### 4. Remove Duplicates from Sorted Array
**Approach**: Same direction pointers to overwrite duplicates
**Solution**: `./code/remove-duplicates.js`

### 5. Remove Element
**Approach**: Same direction pointers to remove target elements
**Solution**: `./code/remove-element.js`

### 6. Sort Colors
**Approach**: Three pointers for Dutch flag problem
**Solution**: `./code/sort-colors.js`

### 7. Move Zeroes
**Approach**: Two pointers to separate zeros and non-zeros
**Solution**: `./code/move-zeroes.js`

### 8. Squares of a Sorted Array
**Approach**: Opposite pointers, compare absolute values
**Solution**: `./code/squares-sorted-array.js`

### 9. Container With Most Water
**Approach**: Opposite pointers, move pointer with smaller height
**Solution**: `./code/container-most-water.js`

### 10. 3Sum
**Approach**: Fix one element, use two pointers for remaining sum
**Solution**: `./code/three-sum.js`

## Related Topics
- [Arrays and Strings](../arrays-and-strings/README.md) - Primary data structures
- [Sliding Window](../sliding-window/README.md) - Similar pointer techniques
- [Linked Lists](../linked-lists/README.md) - Fast-slow pointer applications