/**
 * Problem: Swap Nodes in Pairs
 * 
 * Given a linked list, swap every two adjacent nodes and return its head.
 * You must solve the problem without modifying the values in the list's nodes
 * (i.e., only nodes themselves may be changed.)
 * 
 * Example:
 * Input: head = [1,2,3,4]
 * Output: [2,1,4,3]
 * 
 * Example:
 * Input: head = []
 * Output: []
 * 
 * Example:
 * Input: head = [1]
 * Output: [1]
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// Definition for singly-linked list.
class ListNode {
    constructor(val, next) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}

function swapPairs(head) {
    // TODO: Implement swap nodes in pairs iteratively
}

module.exports = { swapPairs, ListNode };