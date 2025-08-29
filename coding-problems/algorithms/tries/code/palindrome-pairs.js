/**
 * Problem: Palindrome Pairs
 * 
 * Given a list of unique words, return all the pairs of the distinct indices (i, j)
 * in the given list, so that the concatenation of the two words words[i] + words[j] is a palindrome.
 * 
 * Example:
 * Input: words = ["abcd","dcba","lls","s","sssll"]
 * Output: [[0,1],[1,0],[3,2],[2,4]]
 * Explanation: The palindromes are ["dcbaabcd","abcddcba","slls","llssssll"]
 * 
 * Time Complexity: O(n * k^2) where n is number of words, k is max word length
 * Space Complexity: O(n * k)
 */

function palindromePairs(words) {
    // TODO: Implement palindrome pairs using trie + palindrome checking
}

module.exports = { palindromePairs };