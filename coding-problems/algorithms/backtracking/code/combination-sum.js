/**
 * Problem: Combination Sum
 * 
 * Given an array of distinct integers candidates and a target integer target, 
 * return a list of all unique combinations of candidates where the chosen numbers sum to target. 
 * You may choose the same number from candidates an unlimited number of times. 
 * Two combinations are unique if the frequency of at least one of the chosen numbers is different.
 * 
 * Example:
 * Input: candidates = [2,3,6,7], target = 7
 * Output: [[2,2,3],[7]]
 * Explanation: 2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
 * 7 is a candidate, and 7 = 7. These are the only two combinations.
 * 
 * Time Complexity: O(2^t) where t is target value
 * Space Complexity: O(target/min(candidates))
 */

function combinationSum(candidates, target) {
    // TODO: Implement combination sum backtracking solution
}

module.exports = { combinationSum };