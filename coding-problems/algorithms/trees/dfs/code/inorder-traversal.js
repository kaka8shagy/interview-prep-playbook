/**
 * Problem: Binary Tree Inorder Traversal
 * 
 * Given the root of a binary tree, return the inorder traversal of its nodes' values.
 * 
 * Example:
 * Input: root = [1,null,2,3]
 * Output: [1,3,2]
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(h) where h is height of tree
 */

// Definition for a binary tree node
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function inorderTraversal(root) {
    // TODO: Implement binary tree inorder traversal
}

module.exports = { inorderTraversal, TreeNode };