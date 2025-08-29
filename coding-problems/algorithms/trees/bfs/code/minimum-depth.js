/**
 * Problem: Minimum Depth of Binary Tree
 * 
 * Given a binary tree, find its minimum depth.
 * The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.
 * Note: A leaf is a node with no children.
 * 
 * Example:
 * Input: root = [3,9,20,null,null,15,7]
 * Output: 2
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(w) where w is maximum width of tree
 */

// Definition for a binary tree node
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function minDepth(root) {
    // TODO: Implement minimum depth using BFS
}

module.exports = { minDepth, TreeNode };