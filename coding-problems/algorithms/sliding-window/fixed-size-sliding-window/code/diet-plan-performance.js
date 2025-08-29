/**
 * Problem: Diet Plan Performance
 * 
 * A dieter consumes calories[i] calories on the i-th day. Given an integer k, for every consecutive 
 * sequence of k days (calories[i], calories[i+1], ..., calories[i+k-1] for all 0 <= i <= n-k), 
 * they look at T, the total calories consumed during that sequence of k days (calories[i] + calories[i+1] + ... + calories[i+k-1]):
 * - If T < lower, they performed poorly and lost a point. 
 * - If T > upper, they performed poorly and lost a point.
 * - Otherwise, they performed normally and their points do not change.
 * Initially, the dieter has zero points. Return the total number of points the dieter has after dieting for calories.length days.
 * 
 * Example:
 * Input: calories = [1,2,3,4,5], k = 1, lower = 3, upper = 3
 * Output: 0
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

function dietPlanPerformance(calories, k, lower, upper) {
    // TODO: Implement diet plan performance solution
}

module.exports = { dietPlanPerformance };