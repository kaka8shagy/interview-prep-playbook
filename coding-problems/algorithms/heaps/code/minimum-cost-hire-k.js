/**
 * Problem: Minimum Cost to Hire K Workers
 * 
 * There are n workers. You are given two integer arrays quality and wage where quality[i] is the quality of the ith worker
 * and wage[i] is the minimum wage expectation for the ith worker.
 * 
 * We want to hire exactly k workers to form a paid group. To hire a group of k workers, we must pay them according to the following rules:
 * 1. Every worker in the paid group should be paid in the ratio of their quality compared to other workers in the paid group.
 * 2. Every worker in the paid group must be paid at least their minimum wage expectation.
 * 
 * Given the above rules, return the least amount of money needed to form a paid group of exactly k workers.
 * 
 * Example:
 * Input: quality = [10,20,5], wage = [70,50,30], k = 2
 * Output: 105.00000
 * Explanation: We pay 70 to 0th worker and 35 to 2nd worker.
 * 
 * Time Complexity: O(n^2 log n)
 * Space Complexity: O(n)
 */

function mincostToHireWorkers(quality, wage, k) {
    // TODO: Implement minimum cost to hire k workers using heap
}

module.exports = { mincostToHireWorkers };