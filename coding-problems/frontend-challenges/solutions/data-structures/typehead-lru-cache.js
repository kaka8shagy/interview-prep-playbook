/**
 * File: typehead-lru-cache.js
 * Description: LRU Cache implementation optimized for typeahead/autocomplete scenarios
 * 
 * Problem: Create an LRU cache with typeahead-specific optimizations and prefix matching
 * Level: Hard
 * Asked at: Dropbox, Stripe
 * 
 * Learning objectives:
 * - Understand LRU cache algorithms and data structure optimization
 * - Learn prefix matching and trie-based search optimizations
 * - Practice cache eviction policies and memory management
 * - Explore performance optimization for real-time search scenarios
 * 
 * Time Complexity: O(1) for get/put operations, O(k) for prefix search where k is prefix length
 * Space Complexity: O(n) where n is cache capacity
 */

// =======================
// Problem Statement
// =======================

/**
 * Create an advanced LRU cache specifically optimized for typeahead/autocomplete use cases:
 * 
 * 1. Standard LRU cache operations (get, put, delete)
 * 2. Prefix-based search for typeahead functionality
 * 3. Efficient storage and retrieval of search results
 * 4. Cache warming and preloading strategies
 * 5. Memory management with configurable limits
 * 6. Hit/miss ratio tracking and analytics
 * 7. Time-based expiration for stale data
 * 8. Batch operations for improved performance
 * 
 * Typeahead-specific features:
 * - Prefix matching with fuzzy search support
 * - Result ranking and sorting based on frequency/recency
 * - Debounced search with request deduplication
 * - Progressive loading for large result sets
 * - Integration with external data sources
 * - Cache invalidation strategies for dynamic data
 * - Memory optimization for mobile devices
 * - Search analytics and usage patterns
 * 
 * Use cases:
 * - Search autocomplete with caching
 * - User/contact search in applications
 * - Product search in e-commerce
 * - Location/address autocomplete
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Node structure for doubly linked list used in LRU implementation
 */
class LRUNode {
    constructor(key, value) {
        // TODO: Initialize LRU node
        // this.key = key;
        // this.value = value;
        // this.prev = null;
        // this.next = null;
        // this.timestamp = Date.now();
        // this.accessCount = 0;
        // this.ttl = null; // Time to live for expiration
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Check if node has expired based on TTL
     * 
     * @returns {boolean} - Whether node has expired
     */
    isExpired() {
        // TODO: Check TTL expiration
        // return this.ttl && Date.now() > this.ttl;
        throw new Error('Implementation pending');
    }
    
    /**
     * Update access information
     */
    updateAccess() {
        // TODO: Update timestamp and access count
        // this.timestamp = Date.now();
        // this.accessCount++;
        throw new Error('Implementation pending');
    }
}

/**
 * Advanced LRU Cache with typeahead-specific optimizations
 */
class TypeaheadLRUCache {
    constructor(options = {}) {
        // TODO: Initialize the LRU cache
        // this.capacity = options.capacity || 1000;
        // this.defaultTTL = options.defaultTTL || null;
        // this.enableAnalytics = options.enableAnalytics || false;
        // this.caseSensitive = options.caseSensitive || false;
        // 
        // // LRU implementation structures
        // this.cache = new Map();
        // this.head = new LRUNode(null, null);
        // this.tail = new LRUNode(null, null);
        // this.head.next = this.tail;
        // this.tail.prev = this.head;
        // 
        // // Typeahead-specific structures
        // this.prefixIndex = new Map(); // Prefix -> Set of keys
        // this.searchStats = {
        //     hits: 0,
        //     misses: 0,
        //     totalSearches: 0,
        //     averageResultSize: 0
        // };
        // 
        // // Cleanup interval for expired items
        // this.cleanupInterval = setInterval(() => this._cleanupExpired(), 60000);
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get value by key
     * 
     * @param {string} key - Cache key
     * @returns {*} - Cached value or undefined
     */
    get(key) {
        // TODO: Implement LRU get operation
        // 1. Check if key exists in cache
        // 2. Check if node has expired
        // 3. Move node to head (most recently used)
        // 4. Update access statistics
        // 5. Return value
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Put key-value pair in cache
     * 
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {Object} options - Put options (TTL, etc.)
     */
    put(key, value, options = {}) {
        // TODO: Implement LRU put operation
        // 1. Check if key already exists
        // 2. Create new node or update existing
        // 3. Add to head of linked list
        // 4. Update prefix index for typeahead
        // 5. Check capacity and evict if necessary
        // 6. Update statistics
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Delete key from cache
     * 
     * @param {string} key - Key to delete
     * @returns {boolean} - Whether key was found and deleted
     */
    delete(key) {
        // TODO: Implement delete operation
        // 1. Find node in cache
        // 2. Remove from linked list
        // 3. Remove from cache map
        // 4. Update prefix index
        // 5. Return success status
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Search for keys matching prefix (typeahead functionality)
     * 
     * @param {string} prefix - Search prefix
     * @param {Object} options - Search options
     * @returns {Array} - Array of matching results
     */
    searchByPrefix(prefix, options = {}) {
        // TODO: Implement prefix search
        // 1. Normalize prefix (case sensitivity)
        // 2. Find all keys matching prefix
        // 3. Sort results by relevance (access count, recency)
        // 4. Apply limit and pagination
        // 5. Update search statistics
        // 6. Return formatted results
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Batch put operation for efficiency
     * 
     * @param {Array} entries - Array of [key, value, options] tuples
     */
    batchPut(entries) {
        // TODO: Implement batch put for performance
        // 1. Process all entries
        // 2. Update data structures efficiently
        // 3. Perform single eviction check at end
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Warm cache with data
     * 
     * @param {Map|Object} data - Data to preload
     * @param {Object} options - Warming options
     */
    warm(data, options = {}) {
        // TODO: Implement cache warming
        // 1. Convert data to entries
        // 2. Use batch operations for efficiency
        // 3. Apply warming-specific configurations
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Clear all cache entries
     */
    clear() {
        // TODO: Clear all cache data
        // 1. Clear all data structures
        // 2. Reset linked list
        // 3. Reset statistics
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get cache statistics and analytics
     * 
     * @returns {Object} - Cache statistics
     */
    getStats() {
        // TODO: Return comprehensive statistics
        // return {
        //     size: this.cache.size,
        //     capacity: this.capacity,
        //     hitRatio: this.searchStats.hits / (this.searchStats.hits + this.searchStats.misses),
        //     totalSearches: this.searchStats.totalSearches,
        //     averageResultSize: this.searchStats.averageResultSize,
        //     memoryUsage: this._estimateMemoryUsage()
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to add node to head of linked list
     * 
     * @param {LRUNode} node - Node to add
     */
    _addToHead(node) {
        // TODO: Add node to head of doubly linked list
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to remove node from linked list
     * 
     * @param {LRUNode} node - Node to remove
     */
    _removeNode(node) {
        // TODO: Remove node from doubly linked list
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to move node to head
     * 
     * @param {LRUNode} node - Node to move
     */
    _moveToHead(node) {
        // TODO: Move existing node to head
        // this._removeNode(node);
        // this._addToHead(node);
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to remove tail node
     * 
     * @returns {LRUNode} - Removed tail node
     */
    _removeTail() {
        // TODO: Remove and return least recently used node
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to update prefix index
     * 
     * @param {string} key - Key to index
     * @param {boolean} remove - Whether to remove from index
     */
    _updatePrefixIndex(key, remove = false) {
        // TODO: Update prefix index for typeahead search
        // 1. Generate all prefixes for the key
        // 2. Add/remove key from prefix sets
        // 3. Clean up empty prefix entries
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to cleanup expired entries
     */
    _cleanupExpired() {
        // TODO: Remove expired entries
        // 1. Iterate through cache
        // 2. Check expiration for each node
        // 3. Remove expired nodes
        // 4. Update statistics
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to estimate memory usage
     * 
     * @returns {number} - Estimated memory usage in bytes
     */
    _estimateMemoryUsage() {
        // TODO: Calculate approximate memory usage
        // Consider key/value sizes, overhead, indices
        throw new Error('Implementation pending');
    }
    
    /**
     * Cleanup resources and intervals
     */
    destroy() {
        // TODO: Clean up resources
        // 1. Clear interval timers
        // 2. Clear all data
        // 3. Reset state
        
        throw new Error('Implementation pending');
    }
}

// =======================
// Advanced Typeahead Features
// =======================

/**
 * TODO: Fuzzy search extension for typeahead
 * Implements fuzzy matching for more flexible search
 */
class FuzzyTypeaheadCache extends TypeaheadLRUCache {
    constructor(options = {}) {
        // TODO: Initialize fuzzy search cache
        // super(options);
        // this.maxEditDistance = options.maxEditDistance || 2;
        // this.fuzzyThreshold = options.fuzzyThreshold || 0.6;
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Search with fuzzy matching
     * 
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array} - Fuzzy matching results
     */
    fuzzySearch(query, options = {}) {
        // TODO: Implement fuzzy search
        // 1. Calculate edit distances for all keys
        // 2. Filter by distance threshold
        // 3. Sort by relevance score
        // 4. Return top results
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Calculate Levenshtein distance between strings
     * 
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} - Edit distance
     */
    _calculateEditDistance(str1, str2) {
        // TODO: Implement Levenshtein distance algorithm
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Trie-based typeahead cache for optimal prefix matching
 * Uses trie data structure for efficient prefix operations
 */
class TrieTypeaheadCache {
    constructor(options = {}) {
        // TODO: Initialize trie-based cache
        // this.root = new TrieNode();
        // this.lruCache = new TypeaheadLRUCache(options);
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Insert word into trie
     * 
     * @param {string} word - Word to insert
     * @param {*} value - Associated value
     */
    insert(word, value) {
        // TODO: Insert word into trie structure
        throw new Error('Implementation pending');
    }
    
    /**
     * Search for words with given prefix
     * 
     * @param {string} prefix - Search prefix
     * @param {number} limit - Maximum results
     * @returns {Array} - Matching words
     */
    searchPrefix(prefix, limit = 10) {
        // TODO: Search trie for prefix matches
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Trie node structure
 */
class TrieNode {
    constructor() {
        // TODO: Initialize trie node
        // this.children = new Map();
        // this.isEndOfWord = false;
        // this.value = null;
        // this.frequency = 0;
        
        throw new Error('Implementation pending');
    }
}

// =======================
// Performance Optimization Utilities
// =======================

/**
 * TODO: Debounced search manager for typeahead
 * Manages search requests with debouncing and caching
 */
class DebouncedTypeahead {
    constructor(cache, options = {}) {
        // TODO: Initialize debounced typeahead
        // this.cache = cache;
        // this.debounceDelay = options.debounceDelay || 300;
        // this.minQueryLength = options.minQueryLength || 1;
        // this.pendingSearches = new Map();
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Perform debounced search
     * 
     * @param {string} query - Search query
     * @param {Function} callback - Result callback
     * @param {Object} options - Search options
     */
    search(query, callback, options = {}) {
        // TODO: Implement debounced search
        // 1. Cancel previous search for same query
        // 2. Set up debounced execution
        // 3. Handle result caching
        // 4. Call callback with results
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Cancel pending search
     * 
     * @param {string} query - Query to cancel
     */
    cancelSearch(query) {
        // TODO: Cancel pending search request
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Memory-aware cache with automatic sizing
 * Adjusts cache size based on available memory
 */
class AdaptiveTypeaheadCache extends TypeaheadLRUCache {
    constructor(options = {}) {
        // TODO: Initialize adaptive cache
        // super(options);
        // this.targetMemoryUsage = options.targetMemoryUsage || 50 * 1024 * 1024; // 50MB
        // this.memoryCheckInterval = options.memoryCheckInterval || 10000; // 10s
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Adjust cache size based on memory usage
     */
    _adjustCacheSize() {
        // TODO: Monitor memory and adjust cache capacity
        // 1. Estimate current memory usage
        // 2. Compare with target usage
        // 3. Adjust capacity accordingly
        // 4. Evict excess entries if needed
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get current memory usage estimate
     * 
     * @returns {number} - Memory usage in bytes
     */
    _getCurrentMemoryUsage() {
        // TODO: Calculate current memory usage
        throw new Error('Implementation pending');
    }
}

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic LRU operations
console.log("=== Basic LRU Operations Test ===");
const cache = new TypeaheadLRUCache({ capacity: 5 });

// Add some entries
cache.put('apple', { name: 'Apple', category: 'fruit' });
cache.put('banana', { name: 'Banana', category: 'fruit' });
cache.put('avocado', { name: 'Avocado', category: 'fruit' });
cache.put('apricot', { name: 'Apricot', category: 'fruit' });

console.log("Get apple:", cache.get('apple'));
console.log("Get banana:", cache.get('banana'));

// Add more entries to test eviction
cache.put('orange', { name: 'Orange', category: 'fruit' });
cache.put('grape', { name: 'Grape', category: 'fruit' });

console.log("Cache size after eviction:", cache.getStats().size);
console.log("Get avocado (should be evicted):", cache.get('avocado'));

// Test Case 2: Prefix search functionality
console.log("\n=== Prefix Search Test ===");
const typeaheadCache = new TypeaheadLRUCache({ capacity: 100 });

// Add search data
const fruits = [
    'apple', 'apricot', 'avocado', 'banana', 'blackberry', 
    'blueberry', 'cherry', 'coconut', 'grape', 'grapefruit',
    'kiwi', 'lemon', 'lime', 'mango', 'orange', 'peach',
    'pear', 'pineapple', 'plum', 'raspberry', 'strawberry'
];

fruits.forEach(fruit => {
    typeaheadCache.put(fruit, { name: fruit, type: 'fruit', popularity: Math.random() });
});

console.log("Search 'ap':", typeaheadCache.searchByPrefix('ap', { limit: 5 }));
console.log("Search 'gr':", typeaheadCache.searchByPrefix('gr', { limit: 3 }));
console.log("Search 'berry':", typeaheadCache.searchByPrefix('berry', { limit: 5 }));

// Test Case 3: TTL expiration
console.log("\n=== TTL Expiration Test ===");
const ttlCache = new TypeaheadLRUCache({ capacity: 10 });

ttlCache.put('temp1', 'temporary data 1', { ttl: Date.now() + 1000 }); // 1 second
ttlCache.put('temp2', 'temporary data 2', { ttl: Date.now() + 2000 }); // 2 seconds
ttlCache.put('permanent', 'permanent data'); // No TTL

console.log("Immediate get temp1:", ttlCache.get('temp1'));
console.log("Immediate get temp2:", ttlCache.get('temp2'));

// Wait and check expiration
setTimeout(() => {
    console.log("After 1.5s get temp1:", ttlCache.get('temp1')); // Should be expired
    console.log("After 1.5s get temp2:", ttlCache.get('temp2')); // Should still exist
    console.log("After 1.5s get permanent:", ttlCache.get('permanent')); // Should exist
}, 1500);

// Test Case 4: Batch operations
console.log("\n=== Batch Operations Test ===");
const batchCache = new TypeaheadLRUCache({ capacity: 50 });

const batchData = [
    ['user1', { name: 'Alice Johnson', email: 'alice@example.com' }],
    ['user2', { name: 'Bob Smith', email: 'bob@example.com' }],
    ['user3', { name: 'Carol Davis', email: 'carol@example.com' }],
    ['user4', { name: 'David Wilson', email: 'david@example.com' }],
    ['user5', { name: 'Eve Brown', email: 'eve@example.com' }]
];

console.time('Batch put');
batchCache.batchPut(batchData);
console.timeEnd('Batch put');

console.log("Search for 'user':", batchCache.searchByPrefix('user', { limit: 3 }));

// Test Case 5: Fuzzy search
console.log("\n=== Fuzzy Search Test ===");
const fuzzyCache = new FuzzyTypeaheadCache({ 
    capacity: 100, 
    maxEditDistance: 2,
    fuzzyThreshold: 0.6 
});

const names = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
    'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
    'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Node.js'
];

names.forEach(name => {
    fuzzyCache.put(name.toLowerCase(), { language: name, popularity: Math.random() });
});

console.log("Fuzzy search 'java':", fuzzyCache.fuzzySearch('java', { limit: 5 }));
console.log("Fuzzy search 'script':", fuzzyCache.fuzzySearch('script', { limit: 5 }));
console.log("Fuzzy search 'pythn' (typo):", fuzzyCache.fuzzySearch('pythn', { limit: 3 }));

// Test Case 6: Trie-based cache
console.log("\n=== Trie-based Cache Test ===");
const trieCache = new TrieTypeaheadCache({ capacity: 200 });

const words = [
    'cat', 'car', 'card', 'care', 'careful', 'cats', 'catch',
    'dog', 'dogs', 'door', 'down', 'download',
    'tree', 'trees', 'truck', 'true', 'trust'
];

words.forEach(word => {
    trieCache.insert(word, { word, length: word.length, vowels: word.match(/[aeiou]/g)?.length || 0 });
});

console.log("Trie search 'car':", trieCache.searchPrefix('car', 5));
console.log("Trie search 'tre':", trieCache.searchPrefix('tre', 3));
console.log("Trie search 'do':", trieCache.searchPrefix('do', 4));

// Test Case 7: Debounced typeahead
console.log("\n=== Debounced Typeahead Test ===");
const debounceCache = new TypeaheadLRUCache({ capacity: 100 });
const debounced = new DebouncedTypeahead(debounceCache, { 
    debounceDelay: 200,
    minQueryLength: 2 
});

// Simulate rapid typing
const queries = ['a', 'ap', 'app', 'appl', 'apple'];
let queryIndex = 0;

const simulateTyping = () => {
    if (queryIndex < queries.length) {
        const query = queries[queryIndex++];
        console.log(`Typing: "${query}"`);
        
        debounced.search(query, (results) => {
            console.log(`Results for "${query}":`, results);
        });
        
        setTimeout(simulateTyping, 100); // Type every 100ms
    }
};

simulateTyping();

// Performance test
console.log("\n=== Performance Test ===");
const perfCache = new TypeaheadLRUCache({ capacity: 10000 });

// Generate test data
const testData = Array.from({ length: 5000 }, (_, i) => {
    const key = `item_${i.toString().padStart(4, '0')}_${Math.random().toString(36).substr(2, 5)}`;
    const value = { id: i, data: `data_${i}`, timestamp: Date.now() };
    return [key, value];
});

// Test put performance
console.time('Put 5000 items');
testData.forEach(([key, value]) => perfCache.put(key, value));
console.timeEnd('Put 5000 items');

// Test search performance
console.time('100 prefix searches');
for (let i = 0; i < 100; i++) {
    const prefix = `item_${Math.floor(Math.random() * 10).toString().padStart(4, '0')}`;
    perfCache.searchByPrefix(prefix, { limit: 10 });
}
console.timeEnd('100 prefix searches');

// Test get performance
console.time('1000 random gets');
for (let i = 0; i < 1000; i++) {
    const randomKey = testData[Math.floor(Math.random() * testData.length)][0];
    perfCache.get(randomKey);
}
console.timeEnd('1000 random gets');

console.log("Final cache stats:", perfCache.getStats());

// Cleanup
setTimeout(() => {
    perfCache.destroy();
    console.log("Cache destroyed");
}, 5000);
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. LRU Implementation:
 *    - Doubly linked list + HashMap for O(1) operations
 *    - Cache eviction policies and strategies
 *    - Memory management and capacity planning
 * 
 * 2. Typeahead Optimization:
 *    - Prefix indexing strategies (simple map vs trie)
 *    - Search result ranking and relevance scoring
 *    - Debouncing and request deduplication
 * 
 * 3. Data Structure Choice:
 *    - Trade-offs between HashMap and Trie for prefix search
 *    - Memory overhead vs query performance
 *    - Hybrid approaches for optimal performance
 * 
 * 4. Performance Optimization:
 *    - Batch operations for bulk updates
 *    - Memory-aware cache sizing
 *    - Lazy cleanup vs proactive maintenance
 * 
 * 5. Advanced Features:
 *    - TTL implementation and cleanup strategies
 *    - Fuzzy search algorithms and scoring
 *    - Cache warming and preloading techniques
 * 
 * 6. Real-world Applications:
 *    - Search autocomplete in web applications
 *    - User/contact search with caching
 *    - Product search in e-commerce platforms
 *    - Location/address autocomplete systems
 * 
 * 7. Scalability Considerations:
 *    - Distributed caching strategies
 *    - Cache partitioning and sharding
 *    - Integration with external data sources
 *    - Mobile performance and memory constraints
 * 
 * 8. Testing and Monitoring:
 *    - Hit/miss ratio optimization
 *    - Memory usage monitoring
 *    - Search performance metrics
 *    - A/B testing for cache configurations
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LRUNode,
        TypeaheadLRUCache,
        FuzzyTypeaheadCache,
        TrieTypeaheadCache,
        TrieNode,
        DebouncedTypeahead,
        AdaptiveTypeaheadCache
    };
}