/**
 * Problem: Short Encoding of Words
 * 
 * A valid encoding of an array of words is any reference string s and an array of indices indices such that:
 * - words.length == indices.length
 * - The reference string s ends with the '#' character.
 * - For each index indices[i], the substring of s starting from indices[i] and ending before the next '#'
 *   character is equal to words[i].
 * 
 * Given an array of words, return the length of the shortest reference string s possible of any valid encoding of words.
 * 
 * Example:
 * Input: words = ["time", "me", "bell"]
 * Output: 10
 * Explanation: A valid encoding would be s = "time#bell#" and indices = [0, 2, 5].
 * words[0] = "time", the substring of s starting from indices[0] = 0 to the next '#' is "time"
 * words[1] = "me", the substring of s starting from indices[1] = 2 to the next '#' is "me"
 * words[2] = "bell", the substring of s starting from indices[2] = 5 to the next '#' is "bell"
 * 
 * Time Complexity: O(sum of word lengths)
 * Space Complexity: O(sum of word lengths)
 */

function minimumLengthEncoding(words) {
    // TODO: Implement short encoding using suffix trie
}

module.exports = { minimumLengthEncoding };