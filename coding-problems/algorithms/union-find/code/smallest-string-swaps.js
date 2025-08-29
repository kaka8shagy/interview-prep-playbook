/**
 * Problem: Smallest String With Swaps
 * 
 * You are given a string s, and an array of pairs of indices in the string pairs
 * where pairs[i] = [a, b] indicates 2 indices(0-indexed) of the string.
 * 
 * You can swap the characters at any pair of indices in the given pairs any number of times.
 * 
 * Return the lexicographically smallest string that s can be transformed to after using the swaps.
 * 
 * Example:
 * Input: s = "dcab", pairs = [[0,3],[1,2]]
 * Output: "bacd"
 * Explanation:
 * Swap s[0] and s[3], s = "bcad"
 * Swap s[1] and s[2], s = "bacd"
 * 
 * Time Complexity: O(n * log(n) + m * α(n)) where n is string length, m is pairs count
 * Space Complexity: O(n)
 */

function smallestStringWithSwaps(s, pairs) {
    // TODO: Implement smallest string with swaps using union find
}

module.exports = { smallestStringWithSwaps };