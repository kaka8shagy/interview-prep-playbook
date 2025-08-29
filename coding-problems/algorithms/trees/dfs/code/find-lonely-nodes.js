/**
 * Problem: Find All The Lonely Nodes
 * 
 * In a binary tree, a lonely node is a node that is the only child of its parent node. 
 * The root of the tree is not lonely because it does not have a parent node.
 * Given the root of a binary tree, return an array containing the values of all lonely nodes in the tree. 
 * Return the list in any order.
 * 
 * Example:
 * Input: root = [1,2,3,null,4]
 * Output: [4]
 * Explanation: Light blue node is the only lonely node. Node 1 is the root and is not lonely.
 * Nodes 2 and 3 have the same parent and are not lonely.
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

function getLonelyNodes(root) {
    // TODO: Implement find all lonely nodes using DFS
}

module.exports = { getLonelyNodes, TreeNode };