# Tries (Prefix Trees)

## Quick Summary
- Tree data structure for storing strings with shared prefixes efficiently
- Each node represents a character, path from root to node forms a prefix
- Excellent for autocomplete, spell checkers, and prefix-based searches
- Time complexity: O(m) for insert/search where m is string length
- Space complexity: O(ALPHABET_SIZE * N * M) worst case

## Core Concepts

### Trie Structure
- Root node represents empty string
- Each edge represents a character
- Node can be marked as end of word
- Children stored in array (26 for lowercase) or hash map

### Common Operations
- **Insert**: Add word to trie by following/creating path
- **Search**: Check if exact word exists in trie
- **StartsWith**: Check if any word starts with given prefix

### Optimization Techniques
- Compressed tries to reduce space
- Lazy deletion for word removal
- Character frequency optimization

## Implementation Patterns
See code examples:
- Basic trie: `./code/implement-trie.js`
- Word replacement: `./code/replace-words.js`
- Search suggestions: `./code/search-suggestions.js`

## Common Pitfalls
- Not marking end of words correctly
- Memory inefficiency with sparse tries
- Case sensitivity issues
- Not handling empty strings or null inputs
- Infinite loops in traversal

## Interview Questions

### 1. Implement Trie (Prefix Tree)
**Approach**: Build basic trie with insert, search, startsWith
**Solution**: `./code/implement-trie.js`

### 2. Replace Words
**Approach**: Build trie of roots, replace words with shortest root
**Solution**: `./code/replace-words.js`

### 3. Longest Common Prefix
**Approach**: Use trie or iterative comparison
**Solution**: `./code/longest-common-prefix.js`

### 4. Search Suggestions System
**Approach**: Trie with DFS to find suggestions
**Solution**: `./code/search-suggestions.js`

### 5. Lexicographical Numbers
**Approach**: Use trie structure or DFS approach
**Solution**: `./code/lexicographical-numbers.js`

### 6. Design Add and Search Words Data Structure
**Approach**: Trie with wildcard character support
**Solution**: `./code/add-search-words.js`

### 7. Word Search II
**Approach**: Combine trie with backtracking on grid
**Solution**: `./code/word-search-ii.js`

## Related Topics
- [Strings](../arrays-and-strings/README.md) - Primary data type
- [Trees](../trees/README.md) - Underlying tree structure
- [Backtracking](../backtracking/README.md) - For complex search problems