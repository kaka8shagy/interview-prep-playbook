/**
 * Problem: Find K Closest Elements
 * 
 * Given a sorted integer array arr, two integers k and x, return the k closest integers to x in the array. 
 * The result should also be sorted in ascending order.
 * An integer a is closer to x than an integer b if:
 * |a - x| < |b - x|, or
 * |a - x| == |b - x| and a < b
 * 
 * Example:
 * Input: arr = [1,2,3,4,5], k = 4, x = 3
 * Output: [1,2,3,4]
 * 
 * Time Complexity: O(log n + k)
 * Space Complexity: O(k)
 */

function findClosestElements(arr, k, x) {
    // TODO: Implement find k closest elements using binary search + two pointers
}

module.exports = { findClosestElements };