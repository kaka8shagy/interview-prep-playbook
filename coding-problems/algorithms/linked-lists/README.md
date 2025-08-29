# Linked Lists

## Quick Summary
- Linear data structure with nodes connected via pointers
- Dynamic size, efficient insertion/deletion at known positions
- Common patterns: reversal, cycle detection, merging, fast-slow pointers
- No random access - must traverse from head
- Space efficient - only allocates memory as needed

## Core Concepts

### Singly Linked Lists
Each node contains data and pointer to next node. One-way traversal only.

### Doubly Linked Lists
Each node has pointers to both next and previous nodes. Bidirectional traversal.

### Fast-Slow Pointer Technique
Two pointers moving at different speeds. Used for cycle detection and finding middle elements.

### In-Place Reversal
Reverse links without using extra space by manipulating pointers.

## Implementation Patterns
See code examples:
- Basic operations: `./code/reverse-linked-list.js`
- Fast-slow pointers: `./code/middle-linked-list.js`
- Cycle detection: `./code/linked-list-cycle.js`

## Common Pitfalls
- Null pointer exceptions when traversing
- Losing references to nodes during manipulation
- Not handling single node or empty list cases
- Infinite loops in cycle detection
- Memory leaks in languages without garbage collection

## Interview Questions

### 1. Reverse Linked List
**Approach**: Iteratively reverse pointers between nodes
**Solution**: `./code/reverse-linked-list.js`

### 2. Middle of the Linked List
**Approach**: Fast pointer moves 2x speed of slow pointer
**Solution**: `./code/middle-linked-list.js`

### 3. Linked List Cycle
**Approach**: Fast-slow pointers (Floyd's algorithm)
**Solution**: `./code/linked-list-cycle.js`

### 4. Remove Duplicates from Sorted List
**Approach**: Compare adjacent nodes, skip duplicates
**Solution**: `./code/remove-duplicates-sorted.js`

### 5. Merge Two Sorted Lists
**Approach**: Two pointers to merge in sorted order
**Solution**: `./code/merge-two-sorted-lists.js`

## Fast-Slow Pointer Subtopic
See dedicated subfolder: `./fast-slow-pointer/`

## Related Topics
- [Two Pointers](../two-pointers/README.md) - Fast-slow pointer technique
- [Arrays and Strings](../arrays-and-strings/README.md) - Linear data structure comparison
- [Recursion](../recursion/README.md) - Recursive list operations