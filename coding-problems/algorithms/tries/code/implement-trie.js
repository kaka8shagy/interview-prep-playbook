/**
 * Problem: Implement Trie (Prefix Tree)
 * 
 * A trie (pronounced as "try") or prefix tree is a tree data structure used to efficiently store 
 * and retrieve keys in a dataset of strings. There are various applications of this data structure, 
 * such as autocomplete and spellchecker.
 * 
 * Implement the Trie class:
 * - Trie() Initializes the trie object.
 * - void insert(String word) Inserts the string word into the trie.
 * - boolean search(String word) Returns true if the string word is in the trie (i.e., was inserted before), and false otherwise.
 * - boolean startsWith(String prefix) Returns true if there is a previously inserted string word that has the prefix prefix, and false otherwise.
 * 
 * Example:
 * Input: ["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
 * [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
 * Output: [null, null, true, false, true, null, true]
 * 
 * Time Complexity: O(m) for all operations where m is key length
 * Space Complexity: O(ALPHABET_SIZE * N * M) where N is number of keys
 */

class TrieNode {
    constructor() {
        // TODO: Initialize trie node structure
    }
}

class Trie {
    constructor() {
        // TODO: Initialize trie
    }
    
    insert(word) {
        // TODO: Insert word into trie
    }
    
    search(word) {
        // TODO: Search for exact word in trie
    }
    
    startsWith(prefix) {
        // TODO: Check if any word starts with prefix
    }
}

module.exports = { Trie, TrieNode };