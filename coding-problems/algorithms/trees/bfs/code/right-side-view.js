/**
 * Problem: Binary Tree Right Side View
 * 
 * Given the root of a binary tree, imagine yourself standing on the right side of it,
 * return the values of the nodes you can see ordered from top to bottom.
 * 
 * Example:
 * Input: root = [1,2,3,null,5,null,4]
 * Output: [1,3,4]
 * 
 * Example:
 * Input: root = [1,null,3]
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

function rightSideView(root) {
    // TODO: Implement right side view using BFS level order traversal
}

module.exports = { rightSideView, TreeNode };