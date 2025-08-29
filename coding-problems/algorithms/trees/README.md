# Trees

## Quick Summary
- Hierarchical data structure with nodes connected by edges
- Root node at top, leaves at bottom, no cycles
- Common types: binary trees, binary search trees, balanced trees
- Traversal methods: DFS (inorder, preorder, postorder) and BFS (level-order)
- Applications: searching, sorting, expression parsing, file systems

## Core Concepts

### Binary Trees
Each node has at most two children (left and right). Foundation for most tree problems.

### Tree Traversals
- **DFS**: Goes deep before wide (uses stack/recursion)
- **BFS**: Goes wide before deep (uses queue)

### Path Problems
Finding paths from root to leaf, maximum path sums, or paths with specific properties.

## Implementation Patterns
See code examples organized by traversal type:
- DFS patterns: `./dfs/`
- BFS patterns: `./bfs/`

## Common Pitfalls
- Null pointer exceptions when traversing
- Not handling empty trees or single node trees
- Incorrect base cases in recursive solutions
- Stack overflow with very deep trees
- Confusing left and right subtree operations

## DFS (Depth First Search) Subtopic
See dedicated subfolder: `./dfs/`

## BFS (Breadth First Search) Subtopic  
See dedicated subfolder: `./bfs/`

## Related Topics
- [Recursion](../recursion/README.md) - Tree operations are naturally recursive
- [Stacks and Queues](../stacks/README.md) - Used for iterative traversals
- [Dynamic Programming](../dynamic-programming/README.md) - Tree DP problems