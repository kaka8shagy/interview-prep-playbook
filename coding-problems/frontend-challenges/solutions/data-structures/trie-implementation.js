/**
 * File: trie-implementation.js
 * Description: Comprehensive Trie (Prefix Tree) data structure implementation
 *              with search, insertion, deletion, and advanced features
 * 
 * Learning objectives:
 * - Understand Trie data structure and its applications
 * - Learn prefix-based searching and autocomplete functionality
 * - Implement efficient string storage and retrieval
 * - Handle word boundaries and prefix matching
 * 
 * Real-world applications:
 * - Autocomplete and search suggestions
 * - Spell checkers and text processing
 * - IP routing tables in networking
 * - Dictionary lookups and word games
 * 
 * Time Complexity:
 * - Insert: O(m) where m is the length of the word
 * - Search: O(m) where m is the length of the word
 * - Delete: O(m) where m is the length of the word
 * - Prefix Search: O(p + n) where p is prefix length, n is number of results
 * 
 * Space Complexity: O(ALPHABET_SIZE * N * M) where N is number of words, M is average length
 */

// =======================
// Approach 1: Basic Trie Implementation
// =======================

/**
 * Basic Trie node structure
 * Each node represents a character and maintains references to child nodes
 */
class TrieNode {
  constructor() {
    // Map to store child nodes for each character
    // Using Map for better performance than plain object
    this.children = new Map();
    
    // Flag to mark end of a complete word
    // Distinguishes between prefixes and actual words
    this.isEndOfWord = false;
    
    // Optional: store the character this node represents
    // Useful for debugging and traversal operations
    this.char = null;
  }
}

/**
 * Basic Trie implementation with core functionality
 * Supports insertion, search, deletion, and prefix operations
 */
class BasicTrie {
  constructor() {
    // Root node doesn't represent any character
    // All words start from root's children
    this.root = new TrieNode();
    
    // Track number of words for statistics
    this.wordCount = 0;
  }
  
  /**
   * Insert a word into the Trie
   * Creates nodes for each character and marks end of word
   * 
   * @param {string} word - Word to insert into the Trie
   * @returns {boolean} True if word was inserted, false if already exists
   */
  insert(word) {
    // Validate input
    if (typeof word !== 'string' || word.length === 0) {
      throw new Error('Word must be a non-empty string');
    }
    
    // Convert to lowercase for case-insensitive operations
    word = word.toLowerCase();
    
    let currentNode = this.root;
    
    // Traverse/create path for each character
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      // Create new node if character doesn't exist
      if (!currentNode.children.has(char)) {
        const newNode = new TrieNode();
        newNode.char = char;
        currentNode.children.set(char, newNode);
      }
      
      // Move to the child node
      currentNode = currentNode.children.get(char);
    }
    
    // Check if word already exists
    if (currentNode.isEndOfWord) {
      return false; // Word already exists
    }
    
    // Mark end of word and increment counter
    currentNode.isEndOfWord = true;
    this.wordCount++;
    return true;
  }
  
  /**
   * Search for a complete word in the Trie
   * Returns true only if the exact word exists (not just prefix)
   * 
   * @param {string} word - Word to search for
   * @returns {boolean} True if word exists, false otherwise
   */
  search(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return false;
    }
    
    word = word.toLowerCase();
    let currentNode = this.root;
    
    // Traverse the Trie following the word's characters
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      
      // If character path doesn't exist, word is not in Trie
      if (!currentNode.children.has(char)) {
        return false;
      }
      
      currentNode = currentNode.children.get(char);
    }
    
    // Word exists only if we reached a valid end-of-word marker
    return currentNode.isEndOfWord;
  }
  
  /**
   * Check if any word in the Trie starts with the given prefix
   * Useful for autocomplete and suggestion features
   * 
   * @param {string} prefix - Prefix to search for
   * @returns {boolean} True if prefix exists, false otherwise
   */
  startsWith(prefix) {
    if (typeof prefix !== 'string' || prefix.length === 0) {
      return false;
    }
    
    prefix = prefix.toLowerCase();
    let currentNode = this.root;
    
    // Traverse the Trie following the prefix's characters
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      
      if (!currentNode.children.has(char)) {
        return false;
      }
      
      currentNode = currentNode.children.get(char);
    }
    
    // If we successfully traversed all prefix characters, prefix exists
    return true;
  }
  
  /**
   * Delete a word from the Trie
   * Removes nodes that are no longer needed after deletion
   * 
   * @param {string} word - Word to delete
   * @returns {boolean} True if word was deleted, false if not found
   */
  delete(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return false;
    }
    
    word = word.toLowerCase();
    
    // Helper function to perform recursive deletion
    const deleteRecursively = (node, word, index) => {
      // Base case: reached end of word
      if (index === word.length) {
        // Word doesn't exist if not marked as end of word
        if (!node.isEndOfWord) {
          return false;
        }
        
        // Unmark as end of word
        node.isEndOfWord = false;
        this.wordCount--;
        
        // Return true if node can be deleted (no children and not end of other word)
        return node.children.size === 0;
      }
      
      const char = word[index];
      const childNode = node.children.get(char);
      
      // Character not found, word doesn't exist
      if (!childNode) {
        return false;
      }
      
      // Recursively delete from child node
      const shouldDeleteChild = deleteRecursively(childNode, word, index + 1);
      
      // Delete child node if it's no longer needed
      if (shouldDeleteChild) {
        node.children.delete(char);
        
        // Return true if current node can also be deleted
        // (no children and not end of another word)
        return node.children.size === 0 && !node.isEndOfWord;
      }
      
      return false;
    };
    
    return deleteRecursively(this.root, word, 0);
  }
  
  /**
   * Get all words that start with the given prefix
   * Returns array of matching words for autocomplete functionality
   * 
   * @param {string} prefix - Prefix to search for
   * @param {number} maxResults - Maximum number of results to return
   * @returns {string[]} Array of words that start with the prefix
   */
  getWordsWithPrefix(prefix, maxResults = 100) {
    if (typeof prefix !== 'string') {
      return [];
    }
    
    prefix = prefix.toLowerCase();
    const results = [];
    
    // First, navigate to the prefix node
    let currentNode = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!currentNode.children.has(char)) {
        return results; // Prefix doesn't exist
      }
      currentNode = currentNode.children.get(char);
    }
    
    // DFS to collect all words with this prefix
    const collectWords = (node, currentWord) => {
      // Stop if we've collected enough results
      if (results.length >= maxResults) {
        return;
      }
      
      // If this node marks end of word, add to results
      if (node.isEndOfWord) {
        results.push(currentWord);
      }
      
      // Recursively explore all children
      for (const [char, childNode] of node.children) {
        collectWords(childNode, currentWord + char);
      }
    };
    
    collectWords(currentNode, prefix);
    return results;
  }
  
  /**
   * Get statistics about the Trie
   * Useful for monitoring and optimization
   * 
   * @returns {Object} Trie statistics
   */
  getStats() {
    let nodeCount = 0;
    let maxDepth = 0;
    let leafNodes = 0;
    
    // DFS to collect statistics
    const traverse = (node, depth) => {
      nodeCount++;
      maxDepth = Math.max(maxDepth, depth);
      
      if (node.children.size === 0) {
        leafNodes++;
      }
      
      for (const childNode of node.children.values()) {
        traverse(childNode, depth + 1);
      }
    };
    
    traverse(this.root, 0);
    
    return {
      wordCount: this.wordCount,
      nodeCount,
      maxDepth,
      leafNodes,
      memoryEfficiency: this.wordCount / nodeCount // Words per node ratio
    };
  }
}

// =======================
// Approach 2: Enhanced Trie with Additional Features
// =======================

/**
 * Enhanced Trie node with additional metadata
 * Supports frequency counting, timestamps, and custom data
 */
class EnhancedTrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    
    // Additional metadata for enhanced functionality
    this.frequency = 0;        // How many times this word was inserted/searched
    this.lastAccessed = null;  // Timestamp of last access
    this.customData = null;    // Store custom data with each word
    this.wordLength = 0;       // Length of the word ending at this node
  }
}

/**
 * Enhanced Trie with frequency tracking, timestamps, and advanced search
 * Suitable for real-world applications like search engines and autocomplete
 */
class EnhancedTrie {
  constructor(options = {}) {
    this.root = new EnhancedTrieNode();
    this.wordCount = 0;
    
    // Configuration options
    this.options = {
      trackFrequency: options.trackFrequency ?? true,
      trackLastAccessed: options.trackLastAccessed ?? true,
      caseSensitive: options.caseSensitive ?? false,
      maxSuggestions: options.maxSuggestions ?? 10
    };
  }
  
  /**
   * Insert word with optional custom data and frequency
   * Enhanced version supports metadata and configuration
   * 
   * @param {string} word - Word to insert
   * @param {Object} options - Additional options
   * @param {any} options.data - Custom data to store with the word
   * @param {number} options.frequency - Initial frequency count
   * @returns {boolean} True if inserted, false if updated existing word
   */
  insert(word, options = {}) {
    if (typeof word !== 'string' || word.length === 0) {
      throw new Error('Word must be a non-empty string');
    }
    
    const processedWord = this.options.caseSensitive ? word : word.toLowerCase();
    const { data = null, frequency = 1 } = options;
    
    let currentNode = this.root;
    
    // Navigate/create path for each character
    for (let i = 0; i < processedWord.length; i++) {
      const char = processedWord[i];
      
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new EnhancedTrieNode());
      }
      
      currentNode = currentNode.children.get(char);
    }
    
    const isNewWord = !currentNode.isEndOfWord;
    
    // Set word properties
    currentNode.isEndOfWord = true;
    currentNode.wordLength = processedWord.length;
    
    if (this.options.trackFrequency) {
      currentNode.frequency += frequency;
    }
    
    if (this.options.trackLastAccessed) {
      currentNode.lastAccessed = Date.now();
    }
    
    if (data !== null) {
      currentNode.customData = data;
    }
    
    if (isNewWord) {
      this.wordCount++;
    }
    
    return isNewWord;
  }
  
  /**
   * Search with enhanced features including frequency update
   * Returns detailed information about the word
   * 
   * @param {string} word - Word to search for
   * @returns {Object|null} Word details or null if not found
   */
  search(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return null;
    }
    
    const processedWord = this.options.caseSensitive ? word : word.toLowerCase();
    let currentNode = this.root;
    
    // Navigate to the word's end node
    for (let i = 0; i < processedWord.length; i++) {
      const char = processedWord[i];
      
      if (!currentNode.children.has(char)) {
        return null; // Word not found
      }
      
      currentNode = currentNode.children.get(char);
    }
    
    // Check if it's a complete word
    if (!currentNode.isEndOfWord) {
      return null;
    }
    
    // Update access tracking
    if (this.options.trackLastAccessed) {
      currentNode.lastAccessed = Date.now();
    }
    
    if (this.options.trackFrequency) {
      currentNode.frequency++;
    }
    
    // Return detailed word information
    return {
      word: processedWord,
      exists: true,
      frequency: currentNode.frequency,
      lastAccessed: currentNode.lastAccessed,
      customData: currentNode.customData,
      wordLength: currentNode.wordLength
    };
  }
  
  /**
   * Get ranked suggestions based on frequency and recency
   * Advanced autocomplete with intelligent ranking
   * 
   * @param {string} prefix - Prefix to search for
   * @param {Object} options - Search options
   * @returns {Array} Ranked array of suggestions
   */
  getSuggestions(prefix, options = {}) {
    const {
      maxResults = this.options.maxSuggestions,
      sortBy = 'frequency', // 'frequency', 'recency', 'alphabetical'
      minFrequency = 0,
      includeMetadata = false
    } = options;
    
    if (typeof prefix !== 'string') {
      return [];
    }
    
    const processedPrefix = this.options.caseSensitive ? prefix : prefix.toLowerCase();
    
    // Navigate to prefix node
    let currentNode = this.root;
    for (let i = 0; i < processedPrefix.length; i++) {
      const char = processedPrefix[i];
      if (!currentNode.children.has(char)) {
        return []; // Prefix doesn't exist
      }
      currentNode = currentNode.children.get(char);
    }
    
    // Collect all words with this prefix
    const suggestions = [];
    
    const collectSuggestions = (node, currentWord) => {
      if (node.isEndOfWord && node.frequency >= minFrequency) {
        const suggestion = {
          word: currentWord,
          frequency: node.frequency,
          lastAccessed: node.lastAccessed,
          customData: node.customData
        };
        
        suggestions.push(suggestion);
      }
      
      // Continue exploring children
      for (const [char, childNode] of node.children) {
        collectSuggestions(childNode, currentWord + char);
      }
    };
    
    collectSuggestions(currentNode, processedPrefix);
    
    // Sort suggestions based on criteria
    suggestions.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'recency':
          return (b.lastAccessed || 0) - (a.lastAccessed || 0);
        case 'alphabetical':
          return a.word.localeCompare(b.word);
        default:
          return b.frequency - a.frequency;
      }
    });
    
    // Limit results and format output
    const limitedResults = suggestions.slice(0, maxResults);
    
    if (includeMetadata) {
      return limitedResults;
    } else {
      return limitedResults.map(item => item.word);
    }
  }
  
  /**
   * Bulk insert words from an array
   * Efficient batch operation for large datasets
   * 
   * @param {Array} words - Array of words or word objects
   * @param {Object} defaultOptions - Default options for all words
   * @returns {Object} Insert statistics
   */
  bulkInsert(words, defaultOptions = {}) {
    if (!Array.isArray(words)) {
      throw new Error('Words must be an array');
    }
    
    let newWords = 0;
    let updatedWords = 0;
    let errors = [];
    
    for (let i = 0; i < words.length; i++) {
      try {
        let word, options;
        
        if (typeof words[i] === 'string') {
          word = words[i];
          options = { ...defaultOptions };
        } else if (words[i] && typeof words[i] === 'object') {
          word = words[i].word;
          options = { ...defaultOptions, ...words[i] };
        } else {
          throw new Error('Invalid word format');
        }
        
        const isNew = this.insert(word, options);
        if (isNew) {
          newWords++;
        } else {
          updatedWords++;
        }
        
      } catch (error) {
        errors.push({ index: i, word: words[i], error: error.message });
      }
    }
    
    return {
      newWords,
      updatedWords,
      errors,
      totalProcessed: newWords + updatedWords,
      totalErrors: errors.length
    };
  }
  
  /**
   * Find words by pattern with wildcards
   * Supports ? (single character) and * (multiple characters) wildcards
   * 
   * @param {string} pattern - Pattern to match (e.g., "h?llo", "test*")
   * @param {number} maxResults - Maximum results to return
   * @returns {string[]} Matching words
   */
  findByPattern(pattern, maxResults = 100) {
    if (typeof pattern !== 'string' || pattern.length === 0) {
      return [];
    }
    
    const processedPattern = this.options.caseSensitive ? pattern : pattern.toLowerCase();
    const results = [];
    
    // Recursive pattern matching function
    const matchPattern = (node, patternIndex, currentWord) => {
      if (results.length >= maxResults) {
        return; // Stop if we have enough results
      }
      
      // If we've matched the entire pattern
      if (patternIndex === processedPattern.length) {
        if (node.isEndOfWord) {
          results.push(currentWord);
        }
        return;
      }
      
      const patternChar = processedPattern[patternIndex];
      
      if (patternChar === '?') {
        // ? matches any single character
        for (const [char, childNode] of node.children) {
          matchPattern(childNode, patternIndex + 1, currentWord + char);
        }
      } else if (patternChar === '*') {
        // * matches zero or more characters
        // Try matching zero characters (skip the *)
        matchPattern(node, patternIndex + 1, currentWord);
        
        // Try matching one or more characters
        for (const [char, childNode] of node.children) {
          matchPattern(childNode, patternIndex, currentWord + char);
        }
      } else {
        // Literal character match
        if (node.children.has(patternChar)) {
          const childNode = node.children.get(patternChar);
          matchPattern(childNode, patternIndex + 1, currentWord + patternChar);
        }
      }
    };
    
    matchPattern(this.root, 0, '');
    return results;
  }
  
  /**
   * Get comprehensive analytics about the Trie
   * Detailed statistics for optimization and monitoring
   * 
   * @returns {Object} Comprehensive analytics
   */
  getAnalytics() {
    let nodeCount = 0;
    let totalFrequency = 0;
    let maxDepth = 0;
    let wordsByLength = new Map();
    let frequencyDistribution = new Map();
    let recentWords = [];
    
    const traverse = (node, depth, path) => {
      nodeCount++;
      maxDepth = Math.max(maxDepth, depth);
      
      if (node.isEndOfWord) {
        totalFrequency += node.frequency;
        
        // Track words by length
        const length = node.wordLength;
        wordsByLength.set(length, (wordsByLength.get(length) || 0) + 1);
        
        // Track frequency distribution
        const freq = node.frequency;
        frequencyDistribution.set(freq, (frequencyDistribution.get(freq) || 0) + 1);
        
        // Collect recent words
        if (node.lastAccessed && recentWords.length < 10) {
          recentWords.push({
            word: path,
            frequency: node.frequency,
            lastAccessed: node.lastAccessed
          });
        }
      }
      
      for (const [char, childNode] of node.children) {
        traverse(childNode, depth + 1, path + char);
      }
    };
    
    traverse(this.root, 0, '');
    
    // Sort recent words by access time
    recentWords.sort((a, b) => b.lastAccessed - a.lastAccessed);
    
    return {
      structure: {
        wordCount: this.wordCount,
        nodeCount,
        maxDepth,
        averageDepth: nodeCount > 0 ? maxDepth / nodeCount : 0,
        compressionRatio: this.wordCount / nodeCount
      },
      frequency: {
        totalFrequency,
        averageFrequency: this.wordCount > 0 ? totalFrequency / this.wordCount : 0,
        distribution: Array.from(frequencyDistribution.entries()).sort((a, b) => b[0] - a[0])
      },
      words: {
        byLength: Array.from(wordsByLength.entries()).sort((a, b) => a[0] - b[0]),
        recentlyAccessed: recentWords
      },
      performance: {
        memoryEfficiency: this.wordCount / nodeCount,
        averageWordLength: Array.from(wordsByLength.entries())
          .reduce((sum, [length, count]) => sum + length * count, 0) / this.wordCount || 0
      }
    };
  }
}

// =======================
// Approach 3: Compressed Trie (Radix Tree)
// =======================

/**
 * Compressed Trie node for memory efficiency
 * Stores compressed strings to reduce memory usage
 */
class CompressedTrieNode {
  constructor(str = '') {
    this.str = str;           // Compressed string stored in this node
    this.children = new Map(); // Child nodes
    this.isEndOfWord = false; // Whether this node represents end of word
    this.wordCount = 0;       // Number of words ending at this node
  }
}

/**
 * Compressed Trie (Radix Tree) implementation
 * More memory efficient for storing large dictionaries
 * Compresses chains of single-child nodes into single nodes
 */
class CompressedTrie {
  constructor() {
    this.root = new CompressedTrieNode();
    this.totalWords = 0;
  }
  
  /**
   * Insert word into compressed trie
   * Handles string compression and node splitting
   * 
   * @param {string} word - Word to insert
   * @returns {boolean} True if word was inserted, false if already exists
   */
  insert(word) {
    if (typeof word !== 'string' || word.length === 0) {
      throw new Error('Word must be a non-empty string');
    }
    
    word = word.toLowerCase();
    return this._insertHelper(this.root, word, 0);
  }
  
  /**
   * Recursive helper for insertion with string compression
   * 
   * @param {CompressedTrieNode} node - Current node
   * @param {string} word - Word to insert
   * @param {number} index - Current position in word
   * @returns {boolean} True if new word inserted
   */
  _insertHelper(node, word, index) {
    // If we've processed the entire word
    if (index === word.length) {
      if (node.isEndOfWord) {
        return false; // Word already exists
      }
      node.isEndOfWord = true;
      node.wordCount++;
      this.totalWords++;
      return true;
    }
    
    const char = word[index];
    
    // If no child with this character exists, create new branch
    if (!node.children.has(char)) {
      const newNode = new CompressedTrieNode(word.slice(index));
      newNode.isEndOfWord = true;
      newNode.wordCount++;
      node.children.set(char, newNode);
      this.totalWords++;
      return true;
    }
    
    const childNode = node.children.get(char);
    const childStr = childNode.str;
    
    // Find common prefix between remaining word and child string
    let commonLength = 0;
    const remainingWord = word.slice(index);
    
    while (commonLength < Math.min(remainingWord.length, childStr.length) &&
           remainingWord[commonLength] === childStr[commonLength]) {
      commonLength++;
    }
    
    // If child string is a prefix of remaining word
    if (commonLength === childStr.length) {
      return this._insertHelper(childNode, word, index + commonLength);
    }
    
    // Need to split the child node
    const splitNode = new CompressedTrieNode(childStr.slice(0, commonLength));
    
    // Move old child down one level
    const oldChildNode = new CompressedTrieNode(childStr.slice(commonLength));
    oldChildNode.children = childNode.children;
    oldChildNode.isEndOfWord = childNode.isEndOfWord;
    oldChildNode.wordCount = childNode.wordCount;
    
    splitNode.children.set(childStr[commonLength], oldChildNode);
    
    // If there's more to insert, create new branch
    if (commonLength < remainingWord.length) {
      const newBranch = new CompressedTrieNode(remainingWord.slice(commonLength));
      newBranch.isEndOfWord = true;
      newBranch.wordCount++;
      splitNode.children.set(remainingWord[commonLength], newBranch);
      this.totalWords++;
    } else {
      // The split point is end of word
      splitNode.isEndOfWord = true;
      splitNode.wordCount++;
      this.totalWords++;
    }
    
    // Replace child with split node
    node.children.set(char, splitNode);
    return true;
  }
  
  /**
   * Search for word in compressed trie
   * 
   * @param {string} word - Word to search for
   * @returns {boolean} True if word exists
   */
  search(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return false;
    }
    
    word = word.toLowerCase();
    return this._searchHelper(this.root, word, 0);
  }
  
  /**
   * Recursive helper for searching
   * 
   * @param {CompressedTrieNode} node - Current node
   * @param {string} word - Word to search for
   * @param {number} index - Current position in word
   * @returns {boolean} True if word found
   */
  _searchHelper(node, word, index) {
    if (index === word.length) {
      return node.isEndOfWord;
    }
    
    const char = word[index];
    if (!node.children.has(char)) {
      return false;
    }
    
    const childNode = node.children.get(char);
    const childStr = childNode.str;
    const remainingWord = word.slice(index);
    
    // Check if child string matches remaining word prefix
    if (remainingWord.length < childStr.length) {
      return false; // Remaining word is shorter than child string
    }
    
    for (let i = 0; i < childStr.length; i++) {
      if (remainingWord[i] !== childStr[i]) {
        return false;
      }
    }
    
    return this._searchHelper(childNode, word, index + childStr.length);
  }
  
  /**
   * Get all words with given prefix from compressed trie
   * 
   * @param {string} prefix - Prefix to search for
   * @param {number} maxResults - Maximum results to return
   * @returns {string[]} Array of matching words
   */
  getWordsWithPrefix(prefix, maxResults = 100) {
    if (typeof prefix !== 'string') {
      return [];
    }
    
    prefix = prefix.toLowerCase();
    const results = [];
    
    // Navigate to prefix node
    const prefixNode = this._findPrefixNode(this.root, prefix, 0);
    if (!prefixNode) {
      return results;
    }
    
    // Collect all words from prefix node
    this._collectWords(prefixNode.node, prefix.slice(0, prefixNode.matchedLength), results, maxResults);
    
    return results;
  }
  
  /**
   * Find node that contains or leads to the given prefix
   * 
   * @param {CompressedTrieNode} node - Current node
   * @param {string} prefix - Prefix to find
   * @param {number} index - Current position in prefix
   * @returns {Object|null} Node and matched length or null
   */
  _findPrefixNode(node, prefix, index) {
    if (index === prefix.length) {
      return { node, matchedLength: index };
    }
    
    const char = prefix[index];
    if (!node.children.has(char)) {
      return null;
    }
    
    const childNode = node.children.get(char);
    const childStr = childNode.str;
    const remainingPrefix = prefix.slice(index);
    
    // Check how much of child string matches remaining prefix
    let matchLength = 0;
    while (matchLength < Math.min(remainingPrefix.length, childStr.length) &&
           remainingPrefix[matchLength] === childStr[matchLength]) {
      matchLength++;
    }
    
    // If we matched the entire child string, continue recursion
    if (matchLength === childStr.length) {
      return this._findPrefixNode(childNode, prefix, index + matchLength);
    }
    
    // If we matched part of the child string and consumed entire prefix
    if (matchLength > 0 && index + matchLength === prefix.length) {
      return { node: childNode, matchedLength: index + matchLength };
    }
    
    return null;
  }
  
  /**
   * Collect all words from given node (DFS traversal)
   * 
   * @param {CompressedTrieNode} node - Starting node
   * @param {string} currentWord - Word built so far
   * @param {string[]} results - Results array to populate
   * @param {number} maxResults - Maximum results to collect
   */
  _collectWords(node, currentWord, results, maxResults) {
    if (results.length >= maxResults) {
      return;
    }
    
    const fullWord = currentWord + node.str;
    
    if (node.isEndOfWord) {
      results.push(fullWord);
    }
    
    for (const childNode of node.children.values()) {
      this._collectWords(childNode, fullWord, results, maxResults);
    }
  }
  
  /**
   * Get compression statistics
   * 
   * @returns {Object} Compression and performance metrics
   */
  getCompressionStats() {
    let nodeCount = 0;
    let totalStringLength = 0;
    let maxDepth = 0;
    let compressionSavings = 0;
    
    const traverse = (node, depth) => {
      nodeCount++;
      totalStringLength += node.str.length;
      maxDepth = Math.max(maxDepth, depth);
      
      // Each character could have been a separate node in basic trie
      if (node.str.length > 1) {
        compressionSavings += node.str.length - 1;
      }
      
      for (const childNode of node.children.values()) {
        traverse(childNode, depth + 1);
      }
    };
    
    traverse(this.root, 0);
    
    return {
      totalWords: this.totalWords,
      nodeCount,
      averageStringLength: nodeCount > 0 ? totalStringLength / nodeCount : 0,
      maxDepth,
      compressionSavings,
      compressionRatio: compressionSavings / (nodeCount + compressionSavings) * 100
    };
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic autocomplete system
 * Demonstrates core Trie functionality for search suggestions
 */
function demonstrateBasicAutocomplete() {
  console.log('=== Basic Trie Autocomplete Example ===\n');
  
  const trie = new BasicTrie();
  
  // Insert common programming terms
  const programmingTerms = [
    'javascript', 'java', 'python', 'programming', 'algorithm',
    'data', 'database', 'development', 'debugging', 'deployment',
    'framework', 'frontend', 'backend', 'api', 'application'
  ];
  
  console.log('Inserting programming terms...');
  programmingTerms.forEach(term => {
    const inserted = trie.insert(term);
    console.log(`${term}: ${inserted ? 'inserted' : 'already exists'}`);
  });
  
  console.log('\n--- Search Results ---');
  console.log('Search "java":', trie.search('java'));
  console.log('Search "javascript":', trie.search('javascript'));
  console.log('Search "javac":', trie.search('javac'));
  
  console.log('\n--- Prefix Results ---');
  console.log('Starts with "java":', trie.startsWith('java'));
  console.log('Starts with "xyz":', trie.startsWith('xyz'));
  
  console.log('\n--- Autocomplete Suggestions ---');
  console.log('Prefix "java":', trie.getWordsWithPrefix('java'));
  console.log('Prefix "data":', trie.getWordsWithPrefix('data'));
  console.log('Prefix "dev":', trie.getWordsWithPrefix('dev'));
  
  console.log('\n--- Trie Statistics ---');
  console.log(JSON.stringify(trie.getStats(), null, 2));
}

/**
 * Example 2: Enhanced trie with frequency tracking
 * Shows advanced features for search ranking and analytics
 */
function demonstrateEnhancedTrie() {
  console.log('=== Enhanced Trie with Frequency Tracking ===\n');
  
  const enhancedTrie = new EnhancedTrie({
    trackFrequency: true,
    trackLastAccessed: true,
    maxSuggestions: 5
  });
  
  // Insert words with custom data and frequency
  const searchTerms = [
    { word: 'react', frequency: 100, data: { category: 'framework', difficulty: 'intermediate' } },
    { word: 'redux', frequency: 75, data: { category: 'state-management', difficulty: 'advanced' } },
    { word: 'reactjs', frequency: 90, data: { category: 'framework', difficulty: 'intermediate' } },
    { word: 'responsive', frequency: 60, data: { category: 'design', difficulty: 'beginner' } },
    { word: 'rest', frequency: 85, data: { category: 'api', difficulty: 'beginner' } },
    { word: 'recursion', frequency: 45, data: { category: 'algorithm', difficulty: 'advanced' } }
  ];
  
  console.log('Bulk inserting search terms with metadata...');
  const bulkResult = enhancedTrie.bulkInsert(searchTerms);
  console.log('Bulk insert result:', bulkResult);
  
  // Simulate searches to update frequency
  console.log('\n--- Simulating User Searches ---');
  ['react', 'redux', 'react', 'reactjs', 'react'].forEach(term => {
    const result = enhancedTrie.search(term);
    console.log(`Searched "${term}":`, result);
  });
  
  console.log('\n--- Ranked Suggestions ---');
  console.log('Prefix "re" by frequency:');
  console.log(enhancedTrie.getSuggestions('re', { 
    sortBy: 'frequency', 
    includeMetadata: true 
  }));
  
  console.log('\nPrefix "re" by recency:');
  console.log(enhancedTrie.getSuggestions('re', { 
    sortBy: 'recency', 
    includeMetadata: true 
  }));
  
  // Pattern matching example
  console.log('\n--- Pattern Matching ---');
  console.log('Pattern "re*" (starts with "re"):', enhancedTrie.findByPattern('re*'));
  console.log('Pattern "r?st" (r + any char + st):', enhancedTrie.findByPattern('r?st'));
  
  console.log('\n--- Enhanced Analytics ---');
  const analytics = enhancedTrie.getAnalytics();
  console.log(JSON.stringify(analytics, null, 2));
}

/**
 * Example 3: Compressed trie for memory efficiency
 * Shows space-efficient storage for large dictionaries
 */
function demonstrateCompressedTrie() {
  console.log('=== Compressed Trie (Radix Tree) Example ===\n');
  
  const compressedTrie = new CompressedTrie();
  const basicTrie = new BasicTrie();
  
  // Test words that should compress well
  const testWords = [
    'cat', 'car', 'card', 'care', 'careful', 'careless',
    'dog', 'doggy', 'doghouse',
    'test', 'testing', 'tester', 'tests',
    'program', 'programmer', 'programming', 'programs'
  ];
  
  console.log('Comparing compressed vs basic trie...');
  
  // Insert into both tries
  testWords.forEach(word => {
    compressedTrie.insert(word);
    basicTrie.insert(word);
  });
  
  console.log('\n--- Memory Comparison ---');
  const compressedStats = compressedTrie.getCompressionStats();
  const basicStats = basicTrie.getStats();
  
  console.log('Compressed Trie Stats:', compressedStats);
  console.log('Basic Trie Stats:', basicStats);
  console.log(`Memory savings: ${compressedStats.compressionRatio.toFixed(1)}%`);
  
  console.log('\n--- Search Functionality ---');
  const searchTests = ['car', 'careful', 'test', 'programming', 'nonexistent'];
  
  searchTests.forEach(word => {
    const compressedResult = compressedTrie.search(word);
    const basicResult = basicTrie.search(word);
    console.log(`Search "${word}": compressed=${compressedResult}, basic=${basicResult}`);
  });
  
  console.log('\n--- Prefix Functionality ---');
  console.log('Compressed trie "car" prefix:', compressedTrie.getWordsWithPrefix('car'));
  console.log('Basic trie "car" prefix:', basicTrie.getWordsWithPrefix('car'));
}

/**
 * Example 4: Real-world search engine implementation
 * Demonstrates comprehensive search functionality
 */
function demonstrateSearchEngine() {
  console.log('=== Real-world Search Engine Implementation ===\n');
  
  // Create enhanced trie for search engine
  const searchEngine = new EnhancedTrie({
    trackFrequency: true,
    trackLastAccessed: true,
    caseSensitive: false,
    maxSuggestions: 10
  });
  
  // Sample documents/articles
  const documents = [
    { title: 'JavaScript Fundamentals', content: 'Learn JavaScript basics, variables, functions', views: 1500 },
    { title: 'React Tutorial', content: 'React components, hooks, state management', views: 2300 },
    { title: 'Node.js Backend Development', content: 'Server-side JavaScript, Express, APIs', views: 1800 },
    { title: 'Python Data Science', content: 'Pandas, NumPy, data analysis, machine learning', views: 2100 },
    { title: 'Database Design', content: 'SQL, NoSQL, database optimization, indexing', views: 1200 },
    { title: 'Web Performance', content: 'Optimization, caching, CDN, loading speed', views: 900 }
  ];
  
  // Index documents by extracting keywords
  console.log('Indexing documents...');
  documents.forEach((doc, index) => {
    const keywords = [...doc.title.toLowerCase().split(' '), 
                     ...doc.content.toLowerCase().split(' ')];
    
    keywords.forEach(keyword => {
      if (keyword.length > 2) { // Filter out short words
        searchEngine.insert(keyword, {
          frequency: Math.floor(doc.views / 100), // Convert views to frequency
          data: { 
            documentId: index,
            title: doc.title,
            views: doc.views
          }
        });
      }
    });
  });
  
  console.log('\n--- Search Engine Queries ---');
  
  // Perform search queries
  const queries = ['javascript', 'data', 'react', 'performance'];
  
  queries.forEach(query => {
    console.log(`\nQuery: "${query}"`);
    
    // Get search suggestions ranked by popularity
    const suggestions = searchEngine.getSuggestions(query, {
      maxResults: 5,
      sortBy: 'frequency',
      includeMetadata: true
    });
    
    suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion.word} (freq: ${suggestion.frequency})`);
      if (suggestion.customData) {
        console.log(`     -> Document: "${suggestion.customData.title}" (${suggestion.customData.views} views)`);
      }
    });
  });
  
  // Demonstrate wildcard search
  console.log('\n--- Wildcard Search ---');
  console.log('Pattern "java*":', searchEngine.findByPattern('java*').slice(0, 5));
  console.log('Pattern "?ata":', searchEngine.findByPattern('?ata'));
  
  // Analytics for search engine optimization
  console.log('\n--- Search Engine Analytics ---');
  const analytics = searchEngine.getAnalytics();
  
  console.log('Top words by length:');
  analytics.words.byLength.slice(0, 5).forEach(([length, count]) => {
    console.log(`  ${length} chars: ${count} words`);
  });
  
  console.log('\nMost frequently accessed:');
  analytics.words.recentlyAccessed.slice(0, 5).forEach((word, index) => {
    console.log(`  ${index + 1}. ${word.word} (freq: ${word.frequency})`);
  });
}

// Export all implementations and examples
module.exports = {
  BasicTrie,
  EnhancedTrie,
  CompressedTrie,
  demonstrateBasicAutocomplete,
  demonstrateEnhancedTrie,
  demonstrateCompressedTrie,
  demonstrateSearchEngine
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Trie Data Structure Implementations\n');
  console.log('This module demonstrates three different Trie implementations:');
  console.log('1. Basic Trie - Core functionality');
  console.log('2. Enhanced Trie - Advanced features with frequency tracking');
  console.log('3. Compressed Trie - Memory-efficient radix tree\n');
  
  demonstrateBasicAutocomplete();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEnhancedTrie();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateCompressedTrie();
  }, 2000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateSearchEngine();
  }, 3000);
}