# Sliding Window

## Quick Summary
- Optimization technique for array/string problems involving contiguous subarrays
- Two main types: Fixed-size and Dynamic-size sliding windows
- Reduces time complexity from O(n²) or O(n³) to O(n) for many problems
- Core idea: maintain a window that slides through the data structure
- Track window state using pointers and auxiliary data structures

## Core Concepts

### Fixed-Size Sliding Window
The window size remains constant throughout the algorithm. Used for problems asking about subarrays/substrings of exact size k.

### Dynamic-Size Sliding Window
The window size changes based on conditions. Two pointers (left and right) expand and contract the window to satisfy given constraints.

### Window State Management
- Track current window sum, maximum, minimum, or other metrics
- Use hash maps for frequency counting within the window
- Update state incrementally as window slides

## Implementation Patterns
See code examples organized by window type:
- Fixed-size patterns: `./fixed-size-sliding-window/`
- Dynamic-size patterns: `./dynamic-size-sliding-window/`

## Common Pitfalls
- Forgetting to handle edge cases (empty arrays, single elements)
- Not properly maintaining window state when sliding
- Off-by-one errors in window boundaries
- Incorrect expansion/contraction logic in dynamic windows
- Not considering all possible subwindows

## Time & Space Complexity Patterns
- **Time**: O(n) - each element processed at most twice
- **Space**: O(1) for simple windows, O(k) for frequency tracking
- Significant improvement over brute force O(n²) approaches

## Fixed-Size Sliding Window Problems
Problems where the window size k is given and remains constant.

### Key Technique
1. Calculate initial window of size k
2. Slide window one position at a time
3. Remove leftmost element, add rightmost element
4. Update result based on current window

## Dynamic-Size Sliding Window Problems
Problems where window size varies based on conditions.

### Key Technique
1. Expand window by moving right pointer
2. Contract window by moving left pointer when condition violated
3. Track optimal window meeting the criteria
4. Update result during expansion or contraction

## Related Topics
- [Arrays and Strings](../arrays-and-strings/README.md) - Foundation data structures
- [Two Pointers](../two-pointers/README.md) - Similar pointer manipulation techniques
- [Hash Maps](../../data-structures/hash-maps/README.md) - For frequency tracking