# Top K Elements

## Quick Summary
- Pattern for finding top/bottom K elements in a dataset
- Uses heaps (priority queues) for efficient K-element tracking
- Common variations: top K frequent, K largest/smallest, K closest
- Time complexity: typically O(n log k) where k << n
- Space complexity: O(k) for heap storage

## Core Concepts

### Min Heap vs Max Heap
- **Min Heap**: Root is smallest element, use for finding K largest elements
- **Max Heap**: Root is largest element, use for finding K smallest elements
- JavaScript uses min heap by default in most implementations

### K-Size Heap Pattern
Maintain heap of size K, add elements and remove when size exceeds K.

### Frequency-Based Problems
Combine hash maps for counting with heaps for top K selection.

## Implementation Patterns
See code examples:
- Basic top K: `./code/kth-largest-element.js`
- Frequency based: `./code/top-k-frequent-elements.js`
- Distance based: `./code/k-closest-points.js`

## Common Pitfalls
- Choosing wrong heap type (min vs max)
- Not handling edge cases (K > array length)
- Inefficient heap operations
- Forgetting to maintain heap size K
- Incorrect comparison functions

## Interview Questions

### 1. Kth Largest Element in an Array
**Approach**: Use min heap of size K
**Solution**: `./code/kth-largest-element.js`

### 2. Top K Frequent Elements
**Approach**: Count frequencies, then use heap for top K
**Solution**: `./code/top-k-frequent-elements.js`

### 3. Sort Array by Increasing Frequency
**Approach**: Use frequency map and custom sorting
**Solution**: `./code/sort-by-frequency.js`

### 4. Sort Characters By Frequency
**Approach**: Count character frequencies, use heap for sorting
**Solution**: `./code/sort-characters-frequency.js`

### 5. K Closest Points to Origin
**Approach**: Use max heap to maintain K closest points
**Solution**: `./code/k-closest-points.js`

### 6. Find K Closest Elements
**Approach**: Binary search + two pointers, or heap
**Solution**: `./code/k-closest-elements.js`

### 7. Least Number of Unique Integers after K Removals
**Approach**: Frequency count + greedy removal of least frequent
**Solution**: `./code/least-unique-after-k-removals.js`

## Related Topics
- [Heaps](../heaps/README.md) - Core data structure
- [Arrays and Strings](../arrays-and-strings/README.md) - Input data structures
- [Hash Maps](../../data-structures/hash-maps/README.md) - For frequency counting