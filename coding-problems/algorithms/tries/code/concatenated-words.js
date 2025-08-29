/**
 * Problem: Concatenated Words
 * 
 * Given an array of strings words (without duplicates), return all the concatenated words in the given list of words.
 * 
 * A concatenated word is defined as a string that is comprised entirely of at least two shorter words
 * in the given array.
 * 
 * Example:
 * Input: words = ["cat","cats","catsdogcats","dog","dogcatsdog","hippopotamus","rat","ratcatdogcat"]
 * Output: ["catsdogcats","dogcatsdog","ratcatdogcat"]
 * Explanation: "catsdogcats" can be concatenated by "cats", "dog" and "cats";
 * "dogcatsdog" can be concatenated by "dog", "cats" and "dog";
 * "ratcatdogcat" can be concatenated by "rat", "cat", "dog" and "cat".
 * 
 * Time Complexity: O(n * L^2) where n is number of words, L is max word length
 * Space Complexity: O(n * L)
 */

function findAllConcatenatedWordsInADict(words) {
    // TODO: Implement concatenated words using trie + DFS
}

module.exports = { findAllConcatenatedWordsInADict };