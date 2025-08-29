/**
 * Problem: Same Tree
 * 
 * Given the roots of two binary trees p and q, write a function to check if they are the same or not.
 * Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.
 * 
 * Example:
 * Input: p = [1,2,3], q = [1,2,3]
 * Output: true
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

function isSameTree(p, q) {
    // TODO: Implement same tree comparison
}

module.exports = { isSameTree, TreeNode };