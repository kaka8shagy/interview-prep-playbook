/**
 * Problem: Populating Next Right Pointers in Each Node
 * 
 * You are given a perfect binary tree where all leaves are on the same level,
 * and every parent has two children. The binary tree has the following definition:
 * 
 * struct Node {
 *   int val;
 *   Node *left;
 *   Node *right;
 *   Node *next;
 * }
 * 
 * Populate each next pointer to point to its next right node.
 * If there is no next right node, the next pointer should be set to NULL.
 * 
 * Initially, all next pointers are set to NULL.
 * 
 * Example:
 * Input: root = [1,2,3,4,5,6,7]
 * Output: [1,#,2,3,#,4,5,6,7,#]
 * Explanation: Given the above perfect binary tree, your function should populate each next pointer
 * to point to its next right node, just like in the figure.
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1) for optimal solution, O(w) for BFS solution
 */

// Definition for a Node.
class Node {
    constructor(val, left, right, next) {
        this.val = val === undefined ? 0 : val;
        this.left = left === undefined ? null : left;
        this.right = right === undefined ? null : right;
        this.next = next === undefined ? null : next;
    }
}

function connect(root) {
    // TODO: Implement connect next right pointers using BFS or constant space approach
}

module.exports = { connect, Node };