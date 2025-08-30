/**
 * File: interview-cache-design.js
 * Description: Complete multi-tier cache system design for system design interviews
 * 
 * Learning objectives:
 * - Design comprehensive caching architecture for large-scale systems
 * - Integrate multiple cache layers with proper hierarchy and policies
 * - Handle cache warming, monitoring, and operational considerations
 * - Solve real interview problems with production-ready solutions
 * 
 * This file demonstrates a complete caching solution that could be presented
 * in system design interviews for companies like Meta, Google, Netflix, etc.
 */

const { LRUCache } = require('./lru-cache');
const { CacheAsidePattern } = require('./cache-patterns');

// Mock database for realistic data simulation
class ProductionDatabase {
  constructor() {
    this.data = new Map();
    this.readLatency = 50; // 50ms average read latency
    this.writeLatency = 30; // 30ms average write latency
    this.queryCount = 0;
    this.slowQueryThreshold = 100; // Queries over 100ms are "slow"
    this.slowQueryCount = 0;
  }

  async read(key) {
    this.queryCount++;
    
    // Simulate variable database latency
    const latency = this.readLatency + (Math.random() - 0.5) * 20;
    await new Promise(resolve => setTimeout(resolve, Math.max(1, latency)));
    
    if (latency > this.slowQueryThreshold) {
      this.slowQueryCount++;
    }
    
    const value = this.data.get(key);
    console.log(`DB: Read ${key} in ${latency.toFixed(1)}ms (${value ? 'found' : 'not found'})`);
    return value;
  }

  async write(key, value) {
    const latency = this.writeLatency + (Math.random() - 0.5) * 10;
    await new Promise(resolve => setTimeout(resolve, Math.max(1, latency)));
    
    this.data.set(key, value);
    console.log(`DB: Write ${key} in ${latency.toFixed(1)}ms`);
    return true;
  }

  getStats() {
    return {
      totalQueries: this.queryCount,
      slowQueries: this.slowQueryCount,
      slowQueryRate: this.queryCount > 0 ? 
        ((this.slowQueryCount / this.queryCount) * 100).toFixed(2) + '%' : '0%',
      avgLatency: this.readLatency
    };
  }
}

// Browser cache simulator (client-side caching)
class BrowserCache {
  constructor(maxSize = 50) { // Smaller than server caches
    this.cache = new LRUCache(maxSize, 1800000); // 30 minute TTL
    this.name = 'Browser';
  }

  async get(key) {
    // Browser cache is local, so no network latency
    const value = this.cache.get(key);
    if (value) {
      console.log(`BROWSER: Cache hit for ${key}`);
      return value;
    }
    console.log(`BROWSER: Cache miss for ${key}`);
    return null;
  }

  async set(key, value) {
    this.cache.put(key, value);
    console.log(`BROWSER: Cached ${key}`);
  }

  getStats() {
    return {
      layer: 'Browser',
      ...this.cache.getStats()
    };
  }
}

// Reverse proxy cache (like Varnish, NGINX)
class ReverseProxyCache {
  constructor(maxSize = 500) {
    this.cache = new LRUCache(maxSize, 3600000); // 1 hour TTL
    this.name = 'ReverseProxy';
    this.compressionEnabled = true;
  }

  async get(key) {
    // Simulate very low latency for reverse proxy (same datacenter)
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const value = this.cache.get(key);
    if (value) {
      console.log(`PROXY: Cache hit for ${key}`);
      return this.compressionEnabled ? this.decompress(value) : value;
    }
    console.log(`PROXY: Cache miss for ${key}`);
    return null;
  }

  async set(key, value) {
    await new Promise(resolve => setTimeout(resolve, 1));
    
    const compressed = this.compressionEnabled ? this.compress(value) : value;
    this.cache.put(key, compressed);
    console.log(`PROXY: Cached ${key}${this.compressionEnabled ? ' (compressed)' : ''}`);
  }

  // Simulate compression (in reality, would use gzip/brotli)
  compress(data) {
    return {
      compressed: true,
      data: data,
      originalSize: JSON.stringify(data).length,
      compressedSize: Math.floor(JSON.stringify(data).length * 0.7) // 30% compression
    };
  }

  decompress(compressed) {
    return compressed.compressed ? compressed.data : compressed;
  }

  getStats() {
    return {
      layer: 'ReverseProxy',
      compressionEnabled: this.compressionEnabled,
      ...this.cache.getStats()
    };
  }
}

// Application-level cache (like Redis, Memcached)
class ApplicationCache {
  constructor(maxSize = 2000) {
    this.cache = new LRUCache(maxSize, 7200000); // 2 hour TTL
    this.name = 'Application';
    this.networkLatency = 2; // 2ms network latency to cache cluster
  }

  async get(key) {
    // Simulate network latency to distributed cache
    await new Promise(resolve => setTimeout(resolve, this.networkLatency));
    
    const value = this.cache.get(key);
    if (value) {
      console.log(`APP: Cache hit for ${key} (${this.networkLatency}ms latency)`);
      return value;
    }
    console.log(`APP: Cache miss for ${key}`);
    return null;
  }

  async set(key, value) {
    await new Promise(resolve => setTimeout(resolve, this.networkLatency));
    
    this.cache.put(key, value);
    console.log(`APP: Cached ${key}`);
  }

  async delete(key) {
    await new Promise(resolve => setTimeout(resolve, this.networkLatency));
    
    const deleted = this.cache.delete(key);
    console.log(`APP: ${deleted ? 'Deleted' : 'Not found'} ${key}`);
    return deleted;
  }

  getStats() {
    return {
      layer: 'Application',
      networkLatency: this.networkLatency + 'ms',
      ...this.cache.getStats()
    };
  }
}

// Database query cache (built into database)
class DatabaseCache {
  constructor(maxSize = 1000) {
    this.cache = new LRUCache(maxSize, 1800000); // 30 minute TTL
    this.name = 'Database';
    this.bufferPoolHits = 0;
    this.bufferPoolMisses = 0;
  }

  async get(key) {
    // Database cache has no additional latency (built-in)
    const value = this.cache.get(key);
    if (value) {
      this.bufferPoolHits++;
      console.log(`DB_CACHE: Buffer pool hit for ${key}`);
      return value;
    }
    this.bufferPoolMisses++;
    console.log(`DB_CACHE: Buffer pool miss for ${key}`);
    return null;
  }

  async set(key, value) {
    this.cache.put(key, value);
    console.log(`DB_CACHE: Cached query result ${key}`);
  }

  getStats() {
    const totalBufferAccess = this.bufferPoolHits + this.bufferPoolMisses;
    return {
      layer: 'Database',
      bufferPoolHits: this.bufferPoolHits,
      bufferPoolMisses: this.bufferPoolMisses,
      bufferPoolHitRate: totalBufferAccess > 0 ? 
        ((this.bufferPoolHits / totalBufferAccess) * 100).toFixed(2) + '%' : '0%',
      ...this.cache.getStats()
    };
  }
}

// Multi-tier cache system orchestrator
class MultiTierCacheSystem {
  constructor() {
    // Initialize cache hierarchy (fastest to slowest)
    this.browserCache = new BrowserCache();
    this.reverseProxyCache = new ReverseProxyCache();
    this.applicationCache = new ApplicationCache();
    this.databaseCache = new DatabaseCache();
    this.database = new ProductionDatabase();
    
    // Cache hierarchy for read operations
    this.readCacheTiers = [
      this.browserCache,
      this.reverseProxyCache,
      this.applicationCache,
      this.databaseCache
    ];
    
    // Performance tracking
    this.totalRequests = 0;
    this.cacheHitsByTier = new Map();
    this.cacheMisses = 0;
    this.totalLatency = 0;
    
    // Cache warming configuration
    this.popularKeys = new Set();
    this.warmingInProgress = false;
    
    // Initialize hit tracking for each tier
    for (const cache of this.readCacheTiers) {
      this.cacheHitsByTier.set(cache.name, 0);
    }
  }

  // Read with multi-tier cache hierarchy
  async read(key) {
    this.totalRequests++;
    const startTime = Date.now();
    
    console.log(`\n--- MULTI-TIER READ: ${key} ---`);
    
    // Check each cache tier in order (fastest to slowest)
    for (let i = 0; i < this.readCacheTiers.length; i++) {
      const cache = this.readCacheTiers[i];
      const value = await cache.get(key);
      
      if (value !== null && value !== undefined) {
        // Cache hit - backfill higher tiers for next request
        await this.backfillCaches(key, value, i);
        
        this.cacheHitsByTier.set(cache.name, this.cacheHitsByTier.get(cache.name) + 1);
        
        const latency = Date.now() - startTime;
        this.totalLatency += latency;
        
        console.log(`CACHE HIT at tier ${i + 1} (${cache.name}) - ${latency}ms total latency`);
        return value;
      }
    }
    
    // All cache tiers missed - read from database
    console.log(`ALL CACHE TIERS MISSED - Reading from database`);
    this.cacheMisses++;
    
    const value = await this.database.read(key);
    
    if (value !== null && value !== undefined) {
      // Populate all cache tiers with fresh data
      await this.populateAllCaches(key, value);
      
      // Track popular keys for warming
      this.popularKeys.add(key);
    }
    
    const latency = Date.now() - startTime;
    this.totalLatency += latency;
    
    console.log(`DATABASE READ completed - ${latency}ms total latency`);
    return value;
  }

  // Write with cache invalidation strategy
  async write(key, value) {
    console.log(`\n--- MULTI-TIER WRITE: ${key} ---`);
    
    // Write to database first (durability)
    await this.database.write(key, value);
    
    // Cache invalidation strategy: Invalidate all tiers
    // Alternative strategies: write-through, write-behind
    await this.invalidateAllCaches(key);
    
    // For write-heavy workloads, consider write-through to application cache
    if (this.isHotData(key)) {
      console.log(`HOT DATA: Write-through to application cache for ${key}`);
      await this.applicationCache.set(key, value);
    }
    
    console.log(`WRITE completed with cache invalidation`);
    return true;
  }

  // Backfill higher-tier caches when lower tier has hit
  async backfillCaches(key, value, hitTier) {
    console.log(`BACKFILL: Updating tiers 0-${hitTier - 1} with ${key}`);
    
    // Populate all faster tiers with the value
    for (let i = 0; i < hitTier; i++) {
      try {
        await this.readCacheTiers[i].set(key, value);
      } catch (error) {
        console.error(`BACKFILL ERROR: Failed to update ${this.readCacheTiers[i].name}:`, error.message);
      }
    }
  }

  // Populate all cache tiers after database read
  async populateAllCaches(key, value) {
    console.log(`POPULATE: Adding ${key} to all cache tiers`);
    
    const promises = this.readCacheTiers.map(cache =>
      cache.set(key, value).catch(error => {
        console.error(`POPULATE ERROR: Failed to update ${cache.name}:`, error.message);
      })
    );
    
    await Promise.all(promises);
  }

  // Invalidate key from all cache tiers
  async invalidateAllCaches(key) {
    console.log(`INVALIDATE: Removing ${key} from all cache tiers`);
    
    const promises = this.readCacheTiers.map(cache => {
      if (cache.delete) {
        return cache.delete(key).catch(error => {
          console.error(`INVALIDATE ERROR: Failed to remove from ${cache.name}:`, error.message);
        });
      } else {
        // For caches without delete method, we'd need to implement it
        return Promise.resolve();
      }
    });
    
    await Promise.all(promises);
  }

  // Check if data is "hot" (frequently accessed)
  isHotData(key) {
    return this.popularKeys.has(key);
  }

  // Warm cache with popular content
  async warmCache(popularData) {
    if (this.warmingInProgress) {
      console.log('WARMING: Cache warming already in progress');
      return;
    }
    
    this.warmingInProgress = true;
    console.log(`WARMING: Starting cache warm-up with ${popularData.length} items`);
    
    try {
      for (const item of popularData) {
        // Read from database and populate caches
        const value = await this.database.read(item.key);
        if (value) {
          await this.populateAllCaches(item.key, value);
          this.popularKeys.add(item.key);
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log('WARMING: Cache warm-up completed successfully');
    } catch (error) {
      console.error('WARMING: Cache warm-up failed:', error.message);
    } finally {
      this.warmingInProgress = false;
    }
  }

  // Get comprehensive system performance statistics
  getPerformanceStats() {
    const avgLatency = this.totalRequests > 0 ? 
      (this.totalLatency / this.totalRequests).toFixed(2) : '0';
    
    const totalHits = Array.from(this.cacheHitsByTier.values()).reduce((sum, hits) => sum + hits, 0);
    const overallHitRate = this.totalRequests > 0 ? 
      ((totalHits / this.totalRequests) * 100).toFixed(2) : '0';
    
    // Cache tier performance breakdown
    const tierPerformance = [];
    for (const [tierName, hits] of this.cacheHitsByTier.entries()) {
      const hitRate = this.totalRequests > 0 ? ((hits / this.totalRequests) * 100).toFixed(2) : '0';
      tierPerformance.push({
        tier: tierName,
        hits: hits,
        hitRate: hitRate + '%'
      });
    }
    
    return {
      overview: {
        totalRequests: this.totalRequests,
        totalCacheHits: totalHits,
        cacheMisses: this.cacheMisses,
        overallHitRate: overallHitRate + '%',
        avgLatency: avgLatency + 'ms',
        popularKeysCount: this.popularKeys.size
      },
      tierPerformance,
      cacheStats: [
        this.browserCache.getStats(),
        this.reverseProxyCache.getStats(),
        this.applicationCache.getStats(),
        this.databaseCache.getStats()
      ],
      database: this.database.getStats()
    };
  }

  // Simulate realistic production load patterns
  async simulateProductionLoad() {
    console.log('\n=== PRODUCTION LOAD SIMULATION ===');
    
    // Populate database with realistic data
    const testData = [
      { key: 'user:1001', value: { id: 1001, name: 'Alice', role: 'premium', lastLogin: Date.now() }},
      { key: 'user:1002', value: { id: 1002, name: 'Bob', role: 'basic', lastLogin: Date.now() - 86400000 }},
      { key: 'product:501', value: { id: 501, name: 'Laptop Pro', price: 1999.99, stock: 50 }},
      { key: 'product:502', value: { id: 502, name: 'Wireless Mouse', price: 29.99, stock: 200 }},
      { key: 'session:abc123', value: { userId: 1001, expires: Date.now() + 3600000, permissions: ['read', 'write'] }},
      { key: 'config:app', value: { theme: 'dark', language: 'en', features: ['chat', 'notifications'] }},
      { key: 'analytics:daily', value: { date: '2024-01-15', users: 12543, revenue: 45678.90 }}
    ];
    
    // Seed database
    for (const item of testData) {
      await this.database.write(item.key, item.value);
    }
    
    console.log('\n--- Cache Warming Phase ---');
    const popularItems = testData.slice(0, 4); // First 4 items are "popular"
    await this.warmCache(popularItems);
    
    console.log('\n--- Normal Traffic Simulation ---');
    
    // Simulate realistic access patterns
    const accessPatterns = [
      // Hot data (80% of requests to 20% of data - Pareto principle)
      ...Array(40).fill().map(() => ({ key: 'user:1001', weight: 1 })),
      ...Array(30).fill().map(() => ({ key: 'product:501', weight: 1 })),
      ...Array(20).fill().map(() => ({ key: 'session:abc123', weight: 1 })),
      
      // Warm data (moderate access)
      ...Array(15).fill().map(() => ({ key: 'user:1002', weight: 1 })),
      ...Array(10).fill().map(() => ({ key: 'product:502', weight: 1 })),
      
      // Cold data (rare access)
      ...Array(5).fill().map(() => ({ key: 'config:app', weight: 1 })),
      ...Array(3).fill().map(() => ({ key: 'analytics:daily', weight: 1 }))
    ];
    
    // Shuffle to simulate random access
    for (let i = accessPatterns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [accessPatterns[i], accessPatterns[j]] = [accessPatterns[j], accessPatterns[i]];
    }
    
    // Execute read requests
    console.log(`Executing ${accessPatterns.length} read requests...`);
    const startTime = Date.now();
    
    for (const pattern of accessPatterns.slice(0, 50)) { // Limit to first 50 for demo
      await this.read(pattern.key);
      
      // Small delay to simulate realistic request timing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    }
    
    const duration = Date.now() - startTime;
    console.log(`\nLoad simulation completed in ${duration}ms`);
    
    console.log('\n--- Write Operations Simulation ---');
    
    // Simulate some write operations
    await this.write('user:1001', { 
      id: 1001, 
      name: 'Alice Updated', 
      role: 'premium', 
      lastLogin: Date.now() 
    });
    
    await this.write('product:503', { 
      id: 503, 
      name: 'New Product', 
      price: 99.99, 
      stock: 100 
    });
    
    // Test read after write
    console.log('\n--- Read After Write Test ---');
    await this.read('user:1001'); // Should read updated value
    await this.read('product:503'); // Should read new product
  }
}

// Interview problem: Design caching for a social media feed
async function interviewProblemSocialMediaFeed() {
  console.log('\n=== INTERVIEW PROBLEM: Social Media Feed Caching ===');
  console.log('Problem: Design a caching system for a social media platform like Twitter/Instagram');
  console.log('Requirements:');
  console.log('- 300M DAU, 10B posts per day');
  console.log('- Sub-100ms response times for feed generation'); 
  console.log('- Handle celebrity users with millions of followers');
  console.log('- Real-time updates for new posts');
  
  const socialFeedCache = new MultiTierCacheSystem();
  
  // Seed with social media data
  const socialData = [
    { key: 'user:celebrity', value: { followers: 50000000, posts: 12543 }},
    { key: 'feed:user123', value: { posts: ['post1', 'post2', 'post3'], lastUpdate: Date.now() }},
    { key: 'post:trending1', value: { content: 'Viral post content', likes: 1000000, shares: 50000 }},
    { key: 'recommendations:user123', value: { users: ['user456', 'user789'], score: 0.95 }}
  ];
  
  for (const item of socialData) {
    await socialFeedCache.database.write(item.key, item.value);
  }
  
  console.log('\n--- Solution Implementation ---');
  console.log('1. Multi-tier caching with specialized TTLs:');
  console.log('   - Browser: 30min (static content, profile info)');
  console.log('   - CDN: 1hr (images, videos, popular posts)');
  console.log('   - App Cache: 2hr (user feeds, recommendations)');
  console.log('   - DB Cache: 30min (query results, aggregations)');
  
  console.log('\n2. Cache warming for popular content:');
  await socialFeedCache.warmCache([
    { key: 'post:trending1' },
    { key: 'user:celebrity' }
  ]);
  
  console.log('\n3. Simulating feed requests:');
  
  // Simulate different types of requests
  console.log('\n--- Timeline Feed Request ---');
  await socialFeedCache.read('feed:user123');
  
  console.log('\n--- Popular Post Request (should hit cache) ---');
  await socialFeedCache.read('post:trending1');
  
  console.log('\n--- User Profile Request ---');
  await socialFeedCache.read('user:celebrity');
  
  console.log('\n--- New Post Publishing (cache invalidation) ---');
  await socialFeedCache.write('feed:user123', {
    posts: ['newpost', 'post1', 'post2', 'post3'],
    lastUpdate: Date.now()
  });
  
  console.log('\n--- Updated Feed Request ---');
  await socialFeedCache.read('feed:user123');
  
  console.log('\n--- Performance Analysis ---');
  const stats = socialFeedCache.getPerformanceStats();
  console.log('Social Media Feed Cache Performance:');
  console.log(JSON.stringify(stats, null, 2));
  
  console.log('\n--- Interview Discussion Points ---');
  console.log('✅ Cache Hierarchy: Browser → CDN → App → DB caches');
  console.log('✅ Invalidation: Write-through for hot data, invalidate-on-write');
  console.log('✅ Warming: Popular posts and celebrity content pre-loaded');
  console.log('✅ Consistency: Eventual consistency acceptable for feeds');
  console.log('✅ Monitoring: Hit rates, latencies, and error rates tracked');
  console.log('✅ Scalability: Distributed app cache with consistent hashing');
  console.log('✅ Reliability: Graceful degradation when cache tiers fail');
}

// Main demonstration function
async function demonstrateMultiTierCaching() {
  console.log('=== Multi-Tier Cache System Demonstration ===');
  
  const cacheSystem = new MultiTierCacheSystem();
  
  // Run production load simulation
  await cacheSystem.simulateProductionLoad();
  
  // Display performance statistics
  console.log('\n=== FINAL PERFORMANCE STATISTICS ===');
  const stats = cacheSystem.getPerformanceStats();
  console.log(JSON.stringify(stats, null, 2));
  
  // Run interview problem demonstration
  await interviewProblemSocialMediaFeed();
}

// Export for use in other modules and testing
module.exports = {
  MultiTierCacheSystem,
  BrowserCache,
  ReverseProxyCache,
  ApplicationCache,
  DatabaseCache,
  ProductionDatabase,
  demonstrateMultiTierCaching,
  interviewProblemSocialMediaFeed
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateMultiTierCaching().catch(console.error);
}