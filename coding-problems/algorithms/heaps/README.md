# Heaps / Two Heaps

## Quick Summary
- Heap: Complete binary tree with heap property (min/max at root)
- Two Heaps pattern: Use max heap and min heap together for median problems
- Priority queue implementation using heaps
- Time complexity: O(log n) for insert/delete, O(1) for peek
- Applications: finding median, scheduling, top K problems

## Core Concepts

### Min Heap vs Max Heap
- **Min Heap**: Parent ≤ children, root is minimum
- **Max Heap**: Parent ≥ children, root is maximum

### Two Heaps Pattern
- **Max Heap**: Stores smaller half of elements
- **Min Heap**: Stores larger half of elements  
- **Median**: Root of max heap (if odd total) or average of both roots

### Heap Operations
- **Insert**: Add element and bubble up
- **Extract**: Remove root and bubble down
- **Peek**: View root without removal

## Implementation Patterns
See code examples:
- Median finder: `./code/find-median-data-stream.js`
- Sliding window median: `./code/sliding-window-median.js`
- IPO problem: `./code/ipo.js`

## Common Pitfalls
- JavaScript doesn't have built-in heap (need custom implementation)
- Confusing min/max heap usage in two heaps pattern
- Not balancing heaps properly (size difference > 1)
- Incorrect heap property maintenance
- Off-by-one errors in array-based heap indexing

## Interview Questions

### 1. Find Median from Data Stream
**Approach**: Two heaps - max heap for lower half, min heap for upper half
**Solution**: `./code/find-median-data-stream.js`

### 2. Sliding Window Median
**Approach**: Extend median finder with removal capability
**Solution**: `./code/sliding-window-median.js`

### 3. IPO
**Approach**: Use heaps to maximize capital with limited projects
**Solution**: `./code/ipo.js`

### 4. Find Right Interval
**Approach**: Use heap to efficiently find next intervals
**Solution**: `./code/find-right-interval.js`

## Related Topics
- [Top K Elements](../top-k-elements/README.md) - Heap applications
- [Priority Queues](../../data-structures/priority-queues/README.md) - Heap implementation
- [Arrays and Strings](../arrays-and-strings/README.md) - Heap storage structure