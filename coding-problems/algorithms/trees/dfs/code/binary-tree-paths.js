/**
 * Problem: Binary Tree Paths
 * 
 * Given the root of a binary tree, return all root-to-leaf paths in any order.
 * A leaf is a node with no children.
 * 
 * Example:
 * Input: root = [1,2,3,null,5]
 * Output: ["1->2->5","1->3"]
 * 
 * Time Complexity: O(n * h) where h is height
 * Space Complexity: O(n * h)
 */

// Definition for a binary tree node.
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function binaryTreePaths(root) {
    // TODO: Implement binary tree paths using DFS
}

module.exports = { binaryTreePaths, TreeNode };