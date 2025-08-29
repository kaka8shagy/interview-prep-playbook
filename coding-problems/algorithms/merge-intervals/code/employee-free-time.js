/**
 * Problem: Employee Free Time
 * 
 * We are given a list schedule of employees, which represents the working time for each employee.
 * Each employee has a list of non-overlapping Intervals, and these intervals are in sorted order.
 * 
 * Return the list of finite intervals representing common, positive-length free time for all employees,
 * also in sorted order.
 * 
 * (Even though we are representing Intervals in the form [x, y], the objects inside are Intervals, not lists or arrays.
 * For example, schedule[0][0].start = 1, schedule[0][0].end = 3, and schedule[0][0][0] is not defined).
 * Also, we wouldn't include intervals like [5, 5] in our answer, as they have zero length.
 * 
 * Example:
 * Input: schedule = [[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]
 * Output: [[5,6],[7,9]]
 * 
 * Time Complexity: O(n log n) where n is total number of intervals
 * Space Complexity: O(n)
 */

// Definition for an Interval
class Interval {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

function employeeFreeTime(schedule) {
    // TODO: Implement employee free time using merge intervals approach
}

module.exports = { employeeFreeTime, Interval };