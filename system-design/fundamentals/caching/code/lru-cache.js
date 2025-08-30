/**
 * File: lru-cache.js
 * Description: Production-grade LRU cache implementation with detailed explanations
 * 
 * Learning objectives:
 * - Understand LRU (Least Recently Used) eviction policy implementation
 * - Master doubly-linked list and hashmap combination for O(1) operations
 * - Implement thread-safe operations with proper locking mechanisms
 * - Handle memory management and capacity constraints effectively
 * 
 * Time Complexity: O(1) for get, put, delete operations
 * Space Complexity: O(capacity) for storing key-value pairs and metadata
 */

// Node class for doubly-linked list
// Each node represents a cache entry with forward and backward pointers
class LRUNode {
  constructor(key = null, value = null) {
    this.key = key;       // Store key for reverse lookup during eviction
    this.value = value;   // Actual cached value
    this.prev = null;     // Previous node in doubly-linked list
    this.next = null;     // Next node in doubly-linked list
    this.timestamp = Date.now(); // For TTL functionality
  }
}

// Production-grade LRU Cache implementation
// Uses hashmap + doubly-linked list for O(1) operations on all methods
class LRUCache {
  constructor(capacity = 100, ttlMs = null) {
    if (capacity <= 0) {
      throw new Error('Capacity must be positive');
    }
    
    this.capacity = capacity;
    this.ttlMs = ttlMs; // Time-to-live in milliseconds (null = no expiry)
    this.size = 0;
    
    // HashMap for O(1) key lookup to nodes
    // Maps key -> LRUNode for constant time access
    this.cache = new Map();
    
    // Doubly-linked list with sentinel nodes (dummy head/tail)
    // Eliminates edge cases when adding/removing nodes
    this.head = new LRUNode(); // Dummy head (most recently used end)
    this.tail = new LRUNode(); // Dummy tail (least recently used end)
    this.head.next = this.tail;
    this.tail.prev = this.head;
    
    // Statistics for monitoring cache performance
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      puts: 0,
      gets: 0
    };
  }

  // Retrieve value from cache and mark as most recently used
  // Returns undefined if key doesn't exist or has expired
  get(key) {
    this.stats.gets++;
    
    const node = this.cache.get(key);
    
    if (!node) {
      this.stats.misses++;
      return undefined;
    }
    
    // Check TTL expiration if configured
    if (this.ttlMs && (Date.now() - node.timestamp) > this.ttlMs) {
      console.log(`LRU: Key '${key}' expired, removing from cache`);
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    // Move accessed node to head (mark as most recently used)
    // This is the core LRU behavior - frequent access keeps items cached
    this.moveToHead(node);
    this.stats.hits++;
    
    console.log(`LRU GET: '${key}' -> '${node.value}' (hit)`);
    return node.value;
  }

  // Add or update key-value pair in cache
  // Implements full LRU logic with capacity management and eviction
  put(key, value) {
    this.stats.puts++;
    
    const existingNode = this.cache.get(key);
    
    if (existingNode) {
      // Update existing key - modify value and move to head
      existingNode.value = value;
      existingNode.timestamp = Date.now(); // Reset TTL timer
      this.moveToHead(existingNode);
      console.log(`LRU UPDATE: '${key}' -> '${value}' (existing key updated)`);
      return;
    }
    
    // Handle capacity constraint - evict least recently used if at capacity
    if (this.size >= this.capacity) {
      const evicted = this.evictLRU();
      console.log(`LRU EVICTION: Removed '${evicted.key}' to make space`);
      this.stats.evictions++;
    }
    
    // Create new node and add to cache
    const newNode = new LRUNode(key, value);
    this.cache.set(key, newNode);
    this.addToHead(newNode);
    this.size++;
    
    console.log(`LRU PUT: '${key}' -> '${value}' (new entry, size: ${this.size})`);
  }

  // Remove key from cache if it exists
  // Returns true if key was removed, false if not found
  delete(key) {
    const node = this.cache.get(key);
    
    if (!node) {
      return false;
    }
    
    // Remove from both hashmap and linked list
    this.cache.delete(key);
    this.removeNode(node);
    this.size--;
    
    console.log(`LRU DELETE: '${key}' removed (size: ${this.size})`);
    return true;
  }

  // Check if key exists and hasn't expired (without affecting LRU order)
  // Useful for existence checks without changing access patterns
  has(key) {
    const node = this.cache.get(key);
    if (!node) {
      return false;
    }
    
    // Check TTL without updating access time or moving node
    if (this.ttlMs && (Date.now() - node.timestamp) > this.ttlMs) {
      // Lazy cleanup - remove expired entry
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Get all keys in LRU order (most recent to least recent)
  // Useful for debugging and cache analysis
  keys() {
    const keys = [];
    let current = this.head.next;
    
    // Walk from head to tail to get MRU to LRU order
    while (current !== this.tail) {
      // Skip expired entries during traversal
      if (!this.ttlMs || (Date.now() - current.timestamp) <= this.ttlMs) {
        keys.push(current.key);
      }
      current = current.next;
    }
    
    return keys;
  }

  // Clear all entries from cache
  // Useful for cache invalidation scenarios
  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
    
    console.log('LRU: Cache cleared');
  }

  // Get comprehensive cache statistics
  // Essential for monitoring cache performance in production
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      ...this.stats,
      size: this.size,
      capacity: this.capacity,
      hitRate: totalRequests > 0 ? 
        ((this.stats.hits / totalRequests) * 100).toFixed(2) + '%' : '0%',
      utilizationRate: ((this.size / this.capacity) * 100).toFixed(2) + '%',
      avgAccessesPerItem: this.size > 0 ? 
        (this.stats.gets / this.size).toFixed(2) : '0'
    };
  }

  // Reset statistics counters
  // Useful for benchmarking specific operations
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      puts: 0,
      gets: 0
    };
  }

  // PRIVATE METHODS - Internal doubly-linked list operations

  // Add node right after head (mark as most recently used)
  addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    
    this.head.next.prev = node;
    this.head.next = node;
  }

  // Remove node from its current position in linked list
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  // Move existing node to head position (mark as most recently used)
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }

  // Remove and return the least recently used node (node before tail)
  evictLRU() {
    const last = this.tail.prev;
    
    // Remove from both data structures
    this.cache.delete(last.key);
    this.removeNode(last);
    this.size--;
    
    return last;
  }

  // Clean up expired entries proactively
  // Can be called periodically to prevent memory leaks from expired entries
  cleanupExpired() {
    if (!this.ttlMs) return 0; // No TTL configured
    
    let cleaned = 0;
    const now = Date.now();
    let current = this.tail.prev; // Start from LRU end
    
    // Walk backwards and remove expired entries
    while (current !== this.head) {
      const prev = current.prev;
      
      if ((now - current.timestamp) > this.ttlMs) {
        console.log(`LRU CLEANUP: Removing expired key '${current.key}'`);
        this.cache.delete(current.key);
        this.removeNode(current);
        this.size--;
        cleaned++;
      }
      
      current = prev;
    }
    
    return cleaned;
  }
}

// Thread-Safe LRU Cache wrapper
// Adds synchronization for concurrent access scenarios
class ThreadSafeLRUCache {
  constructor(capacity = 100, ttlMs = null) {
    this.cache = new LRUCache(capacity, ttlMs);
    this.locks = new Map(); // Per-key locks to reduce contention
    this.globalLock = false; // Simple global lock flag
  }

  // Acquire lock for specific key to minimize contention
  // In production, you'd use more sophisticated locking (e.g., ReadWriteLock)
  async acquireLock(key) {
    // Simple implementation - in production use proper mutex/semaphore
    while (this.locks.has(key) || this.globalLock) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    this.locks.set(key, true);
  }

  // Release lock for specific key
  releaseLock(key) {
    this.locks.delete(key);
  }

  // Acquire global lock for operations affecting multiple keys
  async acquireGlobalLock() {
    while (this.globalLock || this.locks.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    this.globalLock = true;
  }

  // Release global lock
  releaseGlobalLock() {
    this.globalLock = false;
  }

  // Thread-safe get operation
  async get(key) {
    await this.acquireLock(key);
    try {
      return this.cache.get(key);
    } finally {
      this.releaseLock(key);
    }
  }

  // Thread-safe put operation
  async put(key, value) {
    await this.acquireLock(key);
    try {
      return this.cache.put(key, value);
    } finally {
      this.releaseLock(key);
    }
  }

  // Thread-safe delete operation
  async delete(key) {
    await this.acquireLock(key);
    try {
      return this.cache.delete(key);
    } finally {
      this.releaseLock(key);
    }
  }

  // Thread-safe clear operation (requires global lock)
  async clear() {
    await this.acquireGlobalLock();
    try {
      return this.cache.clear();
    } finally {
      this.releaseGlobalLock();
    }
  }

  // Thread-safe statistics access
  async getStats() {
    await this.acquireGlobalLock();
    try {
      return this.cache.getStats();
    } finally {
      this.releaseGlobalLock();
    }
  }
}

// Demonstration of LRU cache functionality
// Shows common usage patterns and edge cases
async function demonstrateLRUCache() {
  console.log('=== LRU Cache Demonstration ===\n');
  
  // Create cache with small capacity to show eviction behavior
  const cache = new LRUCache(3, 10000); // Capacity: 3, TTL: 10 seconds
  
  console.log('--- Basic Operations ---');
  cache.put('A', 'Value A');
  cache.put('B', 'Value B');
  cache.put('C', 'Value C');
  
  console.log('Current keys (MRU to LRU):', cache.keys());
  
  // Access 'A' to make it most recently used
  console.log('\nAccessing key A...');
  cache.get('A');
  console.log('Keys after accessing A:', cache.keys());
  
  // Add 'D' which should evict 'B' (least recently used)
  console.log('\nAdding key D (should evict B)...');
  cache.put('D', 'Value D');
  console.log('Keys after adding D:', cache.keys());
  
  console.log('\nTrying to access evicted key B...');
  const result = cache.get('B');
  console.log('Result:', result); // Should be undefined
  
  console.log('\n--- Cache Statistics ---');
  console.log(cache.getStats());
  
  console.log('\n--- TTL Demonstration ---');
  const shortTTLCache = new LRUCache(5, 2000); // 2 second TTL
  shortTTLCache.put('temp', 'temporary value');
  
  console.log('Value immediately after put:', shortTTLCache.get('temp'));
  console.log('Waiting 2.5 seconds for expiration...');
  
  await new Promise(resolve => setTimeout(resolve, 2500));
  console.log('Value after TTL expiry:', shortTTLCache.get('temp'));
  
  console.log('\n--- Thread-Safe Cache Demo ---');
  const threadSafeCache = new ThreadSafeLRUCache(10);
  
  // Simulate concurrent access
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(threadSafeCache.put(`key${i}`, `value${i}`));
  }
  
  await Promise.all(promises);
  
  const stats = await threadSafeCache.getStats();
  console.log('Thread-safe cache stats:', stats);
  
  console.log('\n--- Performance Test ---');
  await performanceTest();
}

// Performance benchmark for LRU cache operations
// Measures throughput and latency characteristics
async function performanceTest() {
  const cache = new LRUCache(1000);
  const iterations = 10000;
  
  console.log(`Running performance test with ${iterations} operations...`);
  
  // Warm up cache
  for (let i = 0; i < 500; i++) {
    cache.put(`warmup${i}`, `value${i}`);
  }
  
  // Measure put operations
  const putStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    cache.put(`key${i}`, `value${i}`);
  }
  const putTime = Date.now() - putStart;
  
  // Measure get operations (mix of hits and misses)
  const getStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    cache.get(`key${Math.floor(Math.random() * iterations * 1.5)}`);
  }
  const getTime = Date.now() - getStart;
  
  const stats = cache.getStats();
  
  console.log(`Performance Results:`);
  console.log(`- Put operations: ${iterations} in ${putTime}ms (${(iterations/putTime*1000).toFixed(0)} ops/sec)`);
  console.log(`- Get operations: ${iterations} in ${getTime}ms (${(iterations/getTime*1000).toFixed(0)} ops/sec)`);
  console.log(`- Hit rate: ${stats.hitRate}`);
  console.log(`- Final cache size: ${stats.size}/${stats.capacity}`);
}

// Export classes and functions for use in other modules
module.exports = {
  LRUCache,
  ThreadSafeLRUCache,
  LRUNode,
  demonstrateLRUCache,
  performanceTest
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateLRUCache().catch(console.error);
}