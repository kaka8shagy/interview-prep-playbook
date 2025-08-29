# Fast-Slow Pointer

## Quick Summary
- Two pointers moving at different speeds through a linked list
- Fast pointer moves 2 steps, slow pointer moves 1 step per iteration
- Key applications: cycle detection, finding middle element, detecting intersections
- Based on Floyd's Cycle Detection Algorithm
- Time complexity: O(n), Space complexity: O(1)

## Core Concepts

### Floyd's Cycle Detection
If there's a cycle, fast and slow pointers will eventually meet inside the cycle.

### Finding Middle Element
When fast pointer reaches end, slow pointer is at middle of the list.

### Cycle Detection and Removal
After detecting cycle, additional logic can find cycle start and remove it.

## Interview Questions

### 1. Middle of the Linked List
**Approach**: Fast moves 2 steps, slow moves 1 step
**Solution**: `./code/middle-linked-list.js`

### 2. Linked List Cycle
**Approach**: Fast-slow pointers meet if cycle exists
**Solution**: `./code/linked-list-cycle.js`

### 3. Linked List Cycle II
**Approach**: Find meeting point, then find cycle start
**Solution**: `./code/linked-list-cycle-ii.js`

### 4. Happy Number
**Approach**: Treat number transformation as linked list, detect cycle
**Solution**: `./code/happy-number.js`

## Related Topics
- [Linked Lists](../README.md) - Parent topic
- [Two Pointers](../../two-pointers/README.md) - General pointer techniques