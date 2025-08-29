/**
 * Problem: Path Sum III
 * 
 * Given the root of a binary tree and an integer targetSum, return the number of paths where the sum of the values
 * along the path equals targetSum.
 * 
 * The path does not need to start or end at the root or a leaf, but it must go downwards
 * (i.e., traveling only from parent nodes to child nodes).
 * 
 * Example:
 * Input: root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8
 * Output: 3
 * Explanation: The paths that sum to 8 are shown.
 * 
 * Time Complexity: O(n^2) worst case, O(n log n) average
 * Space Complexity: O(n)
 */

// Definition for a binary tree node.
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

function pathSum(root, targetSum) {
    // TODO: Implement path sum III using DFS with prefix sum
}

module.exports = { pathSum, TreeNode };