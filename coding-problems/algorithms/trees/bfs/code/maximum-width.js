/**
 * Problem: Maximum Width of Binary Tree
 * 
 * Given the root of a binary tree, return the maximum width of the given tree.
 * 
 * The maximum width of a tree is the maximum width among all levels.
 * 
 * The width of one level is defined as the length between the end-nodes (the leftmost and rightmost non-null nodes),
 * where the null nodes between the end-nodes that would be present in a complete binary tree extending down
 * to that level are also counted into the length calculation.
 * 
 * It is guaranteed that the answer will in the range of a 32-bit signed integer.
 * 
 * Example:
 * Input: root = [1,3,2,5,3,null,9]
 * Output: 4
 * Explanation: The maximum width exists in the third level with length 4 (5,3,null,9).
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

function widthOfBinaryTree(root) {
    // TODO: Implement maximum width of binary tree using BFS with index tracking
}

module.exports = { widthOfBinaryTree, TreeNode };