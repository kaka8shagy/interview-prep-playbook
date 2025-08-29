/**
 * Problem: Find Median from Data Stream
 * 
 * The median is the middle value in an ordered integer list. If the size of the list is even, 
 * there is no middle value and the median is the mean of the two middle values.
 * Implement the MedianFinder class with methods to add numbers and find median.
 * 
 * Example:
 * Input: ["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]
 * [[], [1], [2], [], [3], []]
 * Output: [null, null, null, 1.5, null, 2.0]
 * 
 * Time Complexity: O(log n) for addNum, O(1) for findMedian
 * Space Complexity: O(n)
 */

class MedianFinder {
    constructor() {
        // TODO: Initialize two heaps
    }
    
    addNum(num) {
        // TODO: Add number maintaining heap balance
    }
    
    findMedian() {
        // TODO: Calculate median from heap tops
    }
}

module.exports = { MedianFinder };