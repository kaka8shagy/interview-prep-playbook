/**
 * Problem: Find in Mountain Array
 * 
 * You may recall that an array arr is a mountain array if and only if:
 * - arr.length >= 3
 * - There exists some i with 0 < i < arr.length - 1 such that:
 *   - arr[0] < arr[1] < ... < arr[i - 1] < arr[i]
 *   - arr[i] > arr[i + 1] > ... > arr[arr.length - 1]
 * Given a mountain array mountainArr, return the minimum index such that mountainArr.get(index) == target. 
 * If such an index does not exist, return -1.
 * 
 * Example:
 * Input: array = [1,2,3,4,5,3,1], target = 3
 * Output: 2
 * Explanation: 3 exists in the array, at index=2 and index=5. Return the minimum index, which is 2.
 * 
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */

function findInMountainArray(target, mountainArr) {
    // TODO: Implement find in mountain array solution
}

module.exports = { findInMountainArray };