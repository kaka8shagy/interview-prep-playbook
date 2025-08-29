/**
 * Problem: Binary Tree Zigzag Level Order Traversal
 * 
 * Given the root of a binary tree, return the zigzag level order traversal of its nodes' values.
 * (i.e., from left to right, then right to left for the next level and alternate between).
 * 
 * Example:
 * Input: root = [3,9,20,null,null,15,7]
 * Output: [[3],[20,9],[15,7]]
 * 
 * Example:
 * Input: root = [1]
 * Output: [[1]]
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

function zigzagLevelOrder(root) {
    // TODO: Implement zigzag level order traversal using BFS with alternating direction
}

module.exports = { zigzagLevelOrder, TreeNode };