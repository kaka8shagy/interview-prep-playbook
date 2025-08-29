/**
 * Problem: Binary Tree Level Order Traversal II
 * 
 * Given the root of a binary tree, return the bottom-up level order traversal of its nodes' values. 
 * (i.e., from left to right, level by level from leaf to root).
 * 
 * Example:
 * Input: root = [3,9,20,null,null,15,7]
 * Output: [[15,7],[9,20],[3]]
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// Definition for a binary tree node
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function levelOrderBottom(root) {
    // TODO: Implement binary tree level order traversal II
}

module.exports = { levelOrderBottom, TreeNode };