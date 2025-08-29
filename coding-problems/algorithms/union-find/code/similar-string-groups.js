/**
 * Problem: Similar String Groups
 * 
 * Two strings X and Y are similar if we can swap two letters (in different positions) of X, so that it equals Y.
 * Also two strings X and Y are similar if they are equal.
 * 
 * For example, "tars" and "rats" are similar (swapping at positions 0 and 2), and "rats" and "arts" are similar,
 * but "star" is not similar to "tars", "rats", or "arts".
 * 
 * Together, these form two connected groups: {"tars", "rats", "arts"} and {"star"}.
 * Notice that "tars" and "arts" are in the same group even though they are not similar.
 * Formally, each group is such that a word is in the group if and only if it is similar to at least one other word in the group.
 * 
 * We are given a list strs of strings where every string in strs is an anagram of every other string in strs.
 * How many groups are there?
 * 
 * Example:
 * Input: strs = ["tars","rats","arts","star"]
 * Output: 2
 * 
 * Time Complexity: O(n^2 * m + n * α(n)) where n is number of strings, m is string length
 * Space Complexity: O(n)
 */

function numSimilarGroups(strs) {
    // TODO: Implement similar string groups using union find
}

module.exports = { numSimilarGroups };