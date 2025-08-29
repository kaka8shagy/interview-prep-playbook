/**
 * Problem: Next Interval
 * 
 * You are given an array of intervals, where intervals[i] = [starti, endi] and each starti is unique.
 * 
 * The right interval for an interval i is an interval j such that startj >= endi and startj is minimized.
 * Note that i may equal j.
 * 
 * Return an array of right interval indices for each interval i. If no right interval exists for interval i, then put -1 at index i.
 * 
 * Example:
 * Input: intervals = [[1,2]]
 * Output: [-1]
 * Explanation: There is only one interval in the collection, so it outputs -1.
 * 
 * Example:
 * Input: intervals = [[3,4],[2,3],[1,2]]
 * Output: [-1,0,1]
 * Explanation: There is no right interval for [3,4].
 * The right interval for [2,3] is [3,4] since start0 = 3 is the smallest start that is >= end1 = 3.
 * The right interval for [1,2] is [2,3] since start1 = 2 is the smallest start that is >= end0 = 2.
 * 
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

function findRightInterval(intervals) {
    // TODO: Implement next interval using heaps or binary search
}

module.exports = { findRightInterval };