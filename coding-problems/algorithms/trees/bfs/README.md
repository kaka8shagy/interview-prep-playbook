# Trees - Breadth First Search (BFS)

## Quick Summary
- Explores tree level by level from left to right
- Uses queue data structure for implementation
- Also known as level-order traversal
- Optimal for shortest path problems and level-based operations
- Time complexity: O(n), Space complexity: O(w) where w is maximum width

## Core Patterns

### Level-Order Traversal
Visit all nodes at current level before moving to next level.

### Level-by-Level Processing
Process nodes in groups by level, useful for level-specific operations.

### Right-to-Left Traversal
Variation that processes levels from right to left.

## Interview Questions

### 1. Binary Tree Level Order Traversal
**Approach**: Use queue, process level by level
**Solution**: `./code/level-order-traversal.js`

### 2. Average of Levels in Binary Tree
**Approach**: BFS with level grouping, calculate averages
**Solution**: `./code/average-of-levels.js`

### 3. Minimum Depth of Binary Tree
**Approach**: BFS to find first leaf node
**Solution**: `./code/minimum-depth.js`

### 4. Binary Tree Zigzag Level Order Traversal
**Approach**: BFS with alternating left-right direction
**Solution**: `./code/zigzag-traversal.js`

## Related Topics
- [Trees](../README.md) - Parent topic
- [Queues](../../queues/README.md) - Core data structure used