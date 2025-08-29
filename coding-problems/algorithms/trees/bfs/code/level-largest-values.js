/**
 * Problem: Find Largest Value in Each Tree Row
 * 
 * Given the root of a binary tree, return an array of the largest value in each row of the tree (0-indexed).
 * 
 * Example:
 * Input: root = [1,3,2,5,3,null,9]
 * Output: [1,3,9]
 * 
 * Example:
 * Input: root = [1,2,3]
 * Output: [1,3]
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(w) where w is maximum width
 */

// Definition for a binary tree node.
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function largestValues(root) {
    // TODO: Implement find largest value in each tree row using BFS
}

module.exports = { largestValues, TreeNode };