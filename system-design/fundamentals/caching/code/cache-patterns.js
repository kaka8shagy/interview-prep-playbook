/**
 * File: cache-patterns.js
 * Description: Comprehensive cache patterns implementation with detailed explanations
 * 
 * Learning objectives:
 * - Understand different caching patterns and their trade-offs
 * - Implement cache-aside, write-through, write-behind patterns
 * - Handle cache invalidation and consistency challenges
 * - Design multi-level caching architectures
 * 
 * Time Complexity: O(1) average for cache operations
 * Space Complexity: O(n) for cache storage
 */

// Mock database to simulate real data persistence layer
// This helps demonstrate how caches interact with underlying storage
class MockDatabase {
  constructor() {
    // Simulate database with in-memory storage and access tracking
    this.data = new Map();
    this.readLatency = 50; // Simulate 50ms database read latency
    this.writeLatency = 30; // Simulate 30ms database write latency
    this.readCount = 0;
    this.writeCount = 0;
  }

  // Simulate asynchronous database read with realistic latency
  // In production, this would be actual database query
  async read(key) {
    this.readCount++;
    // Simulate network/disk latency
    await new Promise(resolve => setTimeout(resolve, this.readLatency));
    
    const value = this.data.get(key);
    console.log(`DB READ: ${key} = ${value} (Total reads: ${this.readCount})`);
    return value;
  }

  // Simulate asynchronous database write with realistic latency
  // In production, this would persist to disk/network storage
  async write(key, value) {
    this.writeCount++;
    await new Promise(resolve => setTimeout(resolve, this.writeLatency));
    
    this.data.set(key, value);
    console.log(`DB WRITE: ${key} = ${value} (Total writes: ${this.writeCount})`);
    return true;
  }

  // Get database access statistics for performance analysis
  // Essential for understanding cache effectiveness
  getStats() {
    return {
      reads: this.readCount,
      writes: this.writeCount,
      totalOperations: this.readCount + this.writeCount
    };
  }
}

// Cache-Aside Pattern (Lazy Loading)
// Application manages cache directly - most flexible but requires careful implementation
class CacheAsidePattern {
  constructor(database, cacheSize = 100, ttlMs = 300000) { // 5 minute default TTL
    this.db = database;
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.ttlMs = ttlMs;
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Read with cache-aside pattern: check cache first, then database
  // This is the most common pattern in real applications
  async get(key) {
    const cacheEntry = this.cache.get(key);
    
    // Check if cache entry exists and hasn't expired
    if (cacheEntry && (Date.now() - cacheEntry.timestamp) < this.ttlMs) {
      this.hitCount++;
      console.log(`CACHE HIT: ${key} = ${cacheEntry.value}`);
      return cacheEntry.value;
    }

    // Cache miss - read from database and populate cache
    this.missCount++;
    console.log(`CACHE MISS: ${key} - fetching from database`);
    
    const value = await this.db.read(key);
    if (value !== undefined) {
      // Store in cache with timestamp for TTL checking
      this.setCache(key, value);
    }
    
    return value;
  }

  // Write with cache-aside: update database, then invalidate cache
  // Ensures consistency by removing potentially stale cache entries
  async set(key, value) {
    // Write to database first (fail fast if DB is down)
    await this.db.write(key, value);
    
    // Invalidate cache entry to ensure consistency
    // Alternative: update cache entry, but invalidation is safer
    this.cache.delete(key);
    console.log(`CACHE INVALIDATED: ${key} after database write`);
    
    return true;
  }

  // Internal method to manage cache size and TTL
  // Implements LRU eviction when cache is full
  setCache(key, value) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log(`CACHE EVICTED: ${firstKey} (LRU policy)`);
    }

    this.cache.set(key, {
      value: value,
      timestamp: Date.now()
    });
    console.log(`CACHE SET: ${key} = ${value}`);
  }

  // Get cache performance statistics
  // Critical for monitoring cache effectiveness in production
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size,
      maxSize: this.cacheSize
    };
  }
}

// Write-Through Pattern
// All writes go through cache to database - ensures consistency but higher write latency
class WriteThroughPattern {
  constructor(database, cacheSize = 100, ttlMs = 600000) { // 10 minute default TTL
    this.db = database;
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.ttlMs = ttlMs;
    this.hitCount = 0;
    this.missCount = 0;
  }

  // Read operation - check cache first, then database if miss
  // Similar to cache-aside but typically higher hit rates due to write-through
  async get(key) {
    const cacheEntry = this.cache.get(key);
    
    if (cacheEntry && (Date.now() - cacheEntry.timestamp) < this.ttlMs) {
      this.hitCount++;
      console.log(`WT CACHE HIT: ${key} = ${cacheEntry.value}`);
      return cacheEntry.value;
    }

    this.missCount++;
    console.log(`WT CACHE MISS: ${key} - fetching from database`);
    
    const value = await this.db.read(key);
    if (value !== undefined) {
      this.setCache(key, value);
    }
    
    return value;
  }

  // Write-through: update cache and database synchronously
  // Ensures cache is always consistent with database but increases write latency
  async set(key, value) {
    // Write to both cache and database synchronously
    // Database write happens first to ensure durability
    await this.db.write(key, value);
    
    // Update cache after successful database write
    // Cache now contains the freshly written data
    this.setCache(key, value);
    console.log(`WT WRITE COMPLETE: ${key} = ${value} (cache and DB updated)`);
    
    return true;
  }

  setCache(key, value) {
    if (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value: value,
      timestamp: Date.now()
    });
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size,
      pattern: 'Write-Through'
    };
  }
}

// Write-Behind Pattern (Write-Back)
// Cache absorbs writes and flushes to database asynchronously for high throughput
class WriteBehindPattern {
  constructor(database, cacheSize = 100, flushIntervalMs = 5000) {
    this.db = database;
    this.cache = new Map();
    this.dirtyKeys = new Set(); // Track which keys need database sync
    this.cacheSize = cacheSize;
    this.flushInterval = flushIntervalMs;
    this.hitCount = 0;
    this.missCount = 0;
    
    // Start background flush process
    // In production, this would be more sophisticated with batching
    this.startFlushTimer();
  }

  // Read operation with high cache hit expectation
  // Write-behind typically has very high hit rates for recently written data
  async get(key) {
    const cacheEntry = this.cache.get(key);
    
    if (cacheEntry) {
      this.hitCount++;
      console.log(`WB CACHE HIT: ${key} = ${cacheEntry.value}`);
      return cacheEntry.value;
    }

    // Cache miss - need to read from database
    this.missCount++;
    console.log(`WB CACHE MISS: ${key} - fetching from database`);
    
    const value = await this.db.read(key);
    if (value !== undefined) {
      this.setCache(key, value, false); // false = not dirty (clean read from DB)
    }
    
    return value;
  }

  // Write-behind: update cache immediately, mark for later DB sync
  // Provides very low write latency but requires careful failure handling
  async set(key, value) {
    // Update cache immediately and mark as dirty
    this.setCache(key, value, true); // true = dirty (needs DB sync)
    this.dirtyKeys.add(key);
    
    console.log(`WB WRITE CACHED: ${key} = ${value} (will flush to DB later)`);
    return true; // Return immediately without waiting for DB write
  }

  setCache(key, value, isDirty = false) {
    if (this.cache.size >= this.cacheSize) {
      // For write-behind, we must flush dirty entries before eviction
      // Otherwise, we'd lose data that hasn't been written to database
      const firstKey = this.cache.keys().next().value;
      if (this.dirtyKeys.has(firstKey)) {
        console.log(`WARNING: Evicting dirty key ${firstKey} - forcing flush`);
        this.flushKey(firstKey);
      }
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value: value,
      timestamp: Date.now(),
      dirty: isDirty
    });
  }

  // Background process to flush dirty cache entries to database
  // Batches writes for better performance and handles failures gracefully
  startFlushTimer() {
    setInterval(async () => {
      if (this.dirtyKeys.size > 0) {
        console.log(`WB FLUSH: Syncing ${this.dirtyKeys.size} dirty keys to database`);
        
        // Create array copy to avoid modification during iteration
        const keysToFlush = Array.from(this.dirtyKeys);
        
        for (const key of keysToFlush) {
          try {
            await this.flushKey(key);
          } catch (error) {
            console.error(`WB FLUSH ERROR: Failed to flush ${key}:`, error.message);
            // In production, you'd implement retry logic, dead letter queues, etc.
          }
        }
      }
    }, this.flushInterval);
  }

  // Flush individual key from cache to database
  // Handles both success and failure scenarios
  async flushKey(key) {
    const cacheEntry = this.cache.get(key);
    if (!cacheEntry || !cacheEntry.dirty) {
      return; // Key is clean or doesn't exist
    }

    await this.db.write(key, cacheEntry.value);
    
    // Mark as clean after successful database write
    cacheEntry.dirty = false;
    this.dirtyKeys.delete(key);
    
    console.log(`WB FLUSHED: ${key} synchronized to database`);
  }

  // Force flush all dirty keys (useful for shutdown scenarios)
  async flushAll() {
    const keysToFlush = Array.from(this.dirtyKeys);
    console.log(`WB FLUSH ALL: Force syncing ${keysToFlush.length} keys`);
    
    for (const key of keysToFlush) {
      await this.flushKey(key);
    }
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) + '%' : '0%',
      cacheSize: this.cache.size,
      dirtyKeys: this.dirtyKeys.size,
      pattern: 'Write-Behind'
    };
  }
}

// Refresh-Ahead Pattern
// Proactively refresh cache entries before they expire to eliminate cache miss penalty
class RefreshAheadPattern {
  constructor(database, cacheSize = 100, ttlMs = 300000, refreshThresholdRatio = 0.8) {
    this.db = database;
    this.cache = new Map();
    this.cacheSize = cacheSize;
    this.ttlMs = ttlMs;
    // Refresh when entry age reaches this ratio of TTL (e.g., 80% of TTL)
    this.refreshThreshold = ttlMs * refreshThresholdRatio;
    this.hitCount = 0;
    this.missCount = 0;
    this.refreshCount = 0;
    this.activeRefreshes = new Set(); // Prevent duplicate refresh operations
  }

  // Read with proactive refresh logic
  // Returns cached data immediately but triggers refresh if near expiration
  async get(key) {
    const cacheEntry = this.cache.get(key);
    
    if (cacheEntry && (Date.now() - cacheEntry.timestamp) < this.ttlMs) {
      this.hitCount++;
      
      // Check if entry is near expiration and needs refresh
      const age = Date.now() - cacheEntry.timestamp;
      if (age > this.refreshThreshold && !this.activeRefreshes.has(key)) {
        // Trigger async refresh without blocking the current request
        this.refreshAsync(key);
      }
      
      console.log(`RA CACHE HIT: ${key} = ${cacheEntry.value}`);
      return cacheEntry.value;
    }

    // Cache miss or expired entry
    this.missCount++;
    console.log(`RA CACHE MISS: ${key} - fetching from database`);
    
    const value = await this.db.read(key);
    if (value !== undefined) {
      this.setCache(key, value);
    }
    
    return value;
  }

  // Asynchronous refresh to avoid blocking current requests
  // Prevents cache stampede and eliminates cache miss penalty for hot data
  async refreshAsync(key) {
    // Prevent multiple concurrent refreshes for same key
    if (this.activeRefreshes.has(key)) {
      return;
    }
    
    this.activeRefreshes.add(key);
    this.refreshCount++;
    
    try {
      console.log(`RA REFRESH: Proactively refreshing ${key}`);
      const value = await this.db.read(key);
      
      if (value !== undefined) {
        this.setCache(key, value);
        console.log(`RA REFRESH COMPLETE: ${key} = ${value}`);
      }
    } catch (error) {
      console.error(`RA REFRESH ERROR: Failed to refresh ${key}:`, error.message);
    } finally {
      this.activeRefreshes.delete(key);
    }
  }

  // Write operation similar to cache-aside
  // Could be enhanced with write-through if consistency is critical
  async set(key, value) {
    await this.db.write(key, value);
    this.cache.delete(key); // Invalidate to ensure consistency
    console.log(`RA WRITE: ${key} written to DB, cache invalidated`);
    return true;
  }

  setCache(key, value) {
    if (this.cache.size >= this.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value: value,
      timestamp: Date.now()
    });
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      hits: this.hitCount,
      misses: this.missCount,
      refreshes: this.refreshCount,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) + '%' : '0%',
      activeRefreshes: this.activeRefreshes.size,
      pattern: 'Refresh-Ahead'
    };
  }
}

// Demo function showing cache patterns in action
// Demonstrates real-world usage scenarios and performance characteristics
async function demonstrateCachePatterns() {
  console.log('=== Cache Patterns Demonstration ===\n');
  
  const db = new MockDatabase();
  
  // Populate database with initial data
  await db.write('user:1', { id: 1, name: 'Alice', email: 'alice@example.com' });
  await db.write('user:2', { id: 2, name: 'Bob', email: 'bob@example.com' });
  await db.write('product:1', { id: 1, name: 'Laptop', price: 999.99 });
  
  console.log('\n--- Cache-Aside Pattern Demo ---');
  const cacheAside = new CacheAsidePattern(db, 10);
  
  // First read causes cache miss
  await cacheAside.get('user:1');
  // Second read hits cache
  await cacheAside.get('user:1');
  
  // Write invalidates cache
  await cacheAside.set('user:1', { id: 1, name: 'Alice Updated', email: 'alice@example.com' });
  // Next read causes cache miss due to invalidation
  await cacheAside.get('user:1');
  
  console.log('Cache-Aside Stats:', cacheAside.getStats());
  
  console.log('\n--- Write-Through Pattern Demo ---');
  const writeThrough = new WriteThroughPattern(db, 10);
  
  // Write updates both cache and database
  await writeThrough.set('product:2', { id: 2, name: 'Mouse', price: 29.99 });
  // Read hits cache immediately
  await writeThrough.get('product:2');
  
  console.log('Write-Through Stats:', writeThrough.getStats());
  
  console.log('\n--- Write-Behind Pattern Demo ---');
  const writeBehind = new WriteBehindPattern(db, 10, 2000); // 2 second flush interval
  
  // Multiple writes update cache immediately
  await writeBehind.set('session:1', { userId: 1, token: 'abc123' });
  await writeBehind.set('session:2', { userId: 2, token: 'def456' });
  
  // Reads hit cache
  await writeBehind.get('session:1');
  await writeBehind.get('session:2');
  
  console.log('Write-Behind Stats:', writeBehind.getStats());
  
  // Wait for background flush
  console.log('Waiting for background flush...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('Write-Behind Stats after flush:', writeBehind.getStats());
  
  console.log('\n--- Refresh-Ahead Pattern Demo ---');
  const refreshAhead = new RefreshAheadPattern(db, 10, 5000, 0.6); // 5s TTL, refresh at 60%
  
  await refreshAhead.get('user:2');
  // Simulate passage of time to trigger refresh
  await new Promise(resolve => setTimeout(resolve, 3500)); // 3.5s = 70% of 5s TTL
  await refreshAhead.get('user:2'); // Should trigger background refresh
  
  console.log('Refresh-Ahead Stats:', refreshAhead.getStats());
  
  console.log('\n--- Final Database Stats ---');
  console.log('Database Access Stats:', db.getStats());
  
  // Cleanup write-behind pattern
  await writeBehind.flushAll();
}

// Export for use in other modules and testing
module.exports = {
  CacheAsidePattern,
  WriteThroughPattern,
  WriteBehindPattern,
  RefreshAheadPattern,
  MockDatabase,
  demonstrateCachePatterns
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateCachePatterns().catch(console.error);
}