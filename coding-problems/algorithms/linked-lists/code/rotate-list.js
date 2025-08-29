/**
 * Problem: Rotate List
 * 
 * Given the head of a linked list, rotate the list to the right by k places.
 * 
 * Example:
 * Input: head = [1,2,3,4,5], k = 2
 * Output: [4,5,1,2,3]
 * 
 * Example:
 * Input: head = [0,1,2], k = 4
 * Output: [2,0,1]
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

function rotateRight(head, k) {
    // TODO: Implement rotate list using two pointers
}

module.exports = { rotateRight, ListNode };