/**
 * Problem: Balanced Binary Tree
 * 
 * Given a binary tree, determine if it is height-balanced.
 * 
 * For this problem, a height-balanced binary tree is defined as:
 * a binary tree in which the left and right subtrees of every node differ in height by no more than 1.
 * 
 * Example:
 * Input: root = [3,9,20,null,null,15,7]
 * Output: true
 * 
 * Example:
 * Input: root = [1,2,2,3,3,null,null,4,4]
 * Output: false
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(h)
 */

// Definition for a binary tree node.
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function isBalanced(root) {
    // TODO: Implement balanced binary tree using DFS
}

module.exports = { isBalanced, TreeNode };