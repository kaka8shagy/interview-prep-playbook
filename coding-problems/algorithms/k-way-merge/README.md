# K-way Merge

## Quick Summary
- Pattern for merging K sorted arrays/lists using heap
- Use min heap to track smallest element from each array
- Efficiently finds smallest elements across multiple sorted structures
- Time complexity: O(n log k) where n is total elements, k is number of arrays
- Applications: merge sorted files, find kth smallest in matrix

## Core Concepts

### Min Heap for Tracking
Maintain min heap with one element from each array, always extract minimum.

### Pointer Management
Keep track of current position in each sorted array/list.

### K-way vs 2-way Merge
K-way merge is more efficient than repeatedly doing 2-way merges.

## Implementation Patterns
See code examples:
- Matrix problems: `./code/kth-smallest-matrix.js`
- List merging: `./code/merge-k-sorted-lists.js`
- Range problems: `./code/smallest-range.js`

## Common Pitfalls
- Not handling empty arrays/lists
- Incorrect heap comparisons for complex objects
- Index out of bounds when advancing pointers
- Not maintaining heap property
- Memory issues with large datasets

## Interview Questions

### 1. Kth Smallest Number in a Sorted Matrix
**Approach**: Use min heap to explore matrix elements in order
**Solution**: `./code/kth-smallest-matrix.js`

### 2. Find K Pairs with Smallest Sums
**Approach**: Use heap to track smallest sum pairs
**Solution**: `./code/k-smallest-pairs.js`

### 3. Minimum Cost to Hire K Workers
**Approach**: Use heap for worker selection optimization
**Solution**: `./code/minimum-cost-k-workers.js`

### 4. Smallest Range Covering Elements from K Lists
**Approach**: K-way merge while tracking range
**Solution**: `./code/smallest-range.js`

### 5. Merge k Sorted Lists
**Approach**: Use heap to merge linked lists efficiently
**Solution**: `./code/merge-k-sorted-lists.js`

### 6. Median of Two Sorted Arrays
**Approach**: Binary search or k-way merge approach
**Solution**: `./code/median-two-sorted-arrays.js`

## Related Topics
- [Heaps](../heaps/README.md) - Core data structure used
- [Linked Lists](../linked-lists/README.md) - Common input structure
- [Binary Search](../binary-search/README.md) - Alternative approaches