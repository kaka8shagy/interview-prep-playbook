/**
 * Problem: Design Add and Search Words Data Structure
 * 
 * Design a data structure that supports adding new words and finding if a string matches any previously added string.
 * 
 * Implement the WordDictionary class:
 * - WordDictionary() Initializes the object.
 * - void addWord(word) Adds word to the data structure, it can be matched later.
 * - bool search(word) Returns true if there is any string in the data structure that matches word or false otherwise.
 *   word may contain dots '.' where dots can be matched with any letter.
 * 
 * Example:
 * Input: ["WordDictionary","addWord","addWord","addWord","search","search","search","search"]
 *        [[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]
 * Output: [null,null,null,null,false,true,true,true]
 * 
 * Time Complexity: O(m) for addWord, O(n * 26^m) for search with wildcards
 * Space Complexity: O(ALPHABET_SIZE * N * M)
 */

class WordDictionary {
    constructor() {
        // TODO: Initialize trie structure
    }
    
    addWord(word) {
        // TODO: Add word to trie
    }
    
    search(word) {
        // TODO: Search word in trie with wildcard support
    }
}

module.exports = { WordDictionary };