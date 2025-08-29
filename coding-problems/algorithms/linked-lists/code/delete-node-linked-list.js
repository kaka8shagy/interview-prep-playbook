/**
 * Problem: Delete Node in a Linked List
 * 
 * Write a function to delete a node in a singly-linked list. You will not be given access to the head of the list, 
 * instead you will be given access to the node to be deleted directly.
 * It is guaranteed that the node to be deleted is not a tail node in the list.
 * 
 * Example:
 * Input: head = [4,5,1,9], node = 5
 * Output: [4,1,9]
 * Explanation: You are given the second node with value 5, the linked list should become 4 -> 1 -> 9 after calling your function.
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */

// Definition for singly-linked list
class ListNode {
    constructor(val, next) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}

function deleteNode(node) {
    // TODO: Implement delete node in linked list
}

module.exports = { deleteNode, ListNode };