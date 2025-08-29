/**
 * Problem: Path Sum
 * 
 * Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path 
 * such that adding up all the values along the path equals targetSum.
 * A leaf is a node with no children.
 * 
 * Example:
 * Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
 * Output: true
 * Explanation: The root-to-leaf path with the target sum is shown.
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

function hasPathSum(root, targetSum) {
    // TODO: Implement path sum solution
}

module.exports = { hasPathSum, TreeNode };