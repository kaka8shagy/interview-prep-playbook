# Trees - Depth First Search (DFS)

## Quick Summary
- Explores tree by going as deep as possible before backtracking
- Three main traversal orders: inorder, preorder, postorder
- Natural fit for recursive solutions
- Stack-based for iterative implementations
- Excellent for path problems and tree property validation

## Core Patterns

### Inorder Traversal (Left, Root, Right)
Visits left subtree, then root, then right subtree. Produces sorted order for BSTs.

### Preorder Traversal (Root, Left, Right)  
Visits root first, then subtrees. Good for tree copying and serialization.

### Postorder Traversal (Left, Right, Root)
Visits subtrees first, then root. Good for tree deletion and bottom-up calculations.

## Interview Questions

### 1. Binary Tree Inorder Traversal
**Approach**: Recursive or iterative with stack
**Solution**: `./code/inorder-traversal.js`

### 2. Maximum Depth of Binary Tree
**Approach**: Recursive DFS, return 1 + max of subtree depths
**Solution**: `./code/maximum-depth.js`

### 3. Same Tree
**Approach**: Compare nodes recursively
**Solution**: `./code/same-tree.js`

### 4. Path Sum
**Approach**: DFS with running sum, check at leaves
**Solution**: `./code/path-sum.js`

### 5. Binary Tree Maximum Path Sum
**Approach**: Consider each node as potential path root
**Solution**: `./code/maximum-path-sum.js`

## Related Topics
- [Trees](../README.md) - Parent topic
- [Recursion](../../recursion/README.md) - Core technique used