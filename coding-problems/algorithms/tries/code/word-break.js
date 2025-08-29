/**
 * Problem: Word Break
 * 
 * Given a string s and a dictionary of strings wordDict, return true if s can be segmented
 * into a space-separated sequence of one or more dictionary words.
 * 
 * Note that the same word in the dictionary may be reused multiple times in the segmentation.
 * 
 * Example:
 * Input: s = "leetcode", wordDict = ["leet","code"]
 * Output: true
 * Explanation: Return true because "leetcode" can be segmented as "leet code".
 * 
 * Time Complexity: O(n^2 + m*k) where n is length of s, m is number of words, k is avg word length
 * Space Complexity: O(n + m*k)
 */

function wordBreak(s, wordDict) {
    // TODO: Implement word break using trie + dynamic programming
}

module.exports = { wordBreak };