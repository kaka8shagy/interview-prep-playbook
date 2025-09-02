/**
 * File: memoize-cache.js
 * Description: Multiple implementations of memoization and caching for API calls
 * 
 * Learning objectives:
 * - Understand memoization patterns and cache strategies
 * - Learn different cache eviction policies (LRU, TTL, size-based)
 * - See API caching with request deduplication and invalidation
 * 
 * Time Complexity: O(1) for cache hit, O(n) for cache miss where n is function execution
 * Space Complexity: O(k) where k is number of cached results
 */

// =======================
// Approach 1: Basic Memoization
// =======================

/**
 * Basic memoization implementation
 * Caches function results based on arguments
 * 
 * Mental model: Create a lookup table where function arguments
 * map to previously computed results
 */
function memoizeBasic(fn, keyGenerator = JSON.stringify) {
  const cache = new Map();
  
  return function memoized(...args) {
    // Generate cache key from arguments
    const key = keyGenerator(args);
    
    // Return cached result if available
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Compute and cache result
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

// =======================
// Approach 2: LRU (Least Recently Used) Cache
// =======================

/**
 * LRU Cache implementation
 * Evicts least recently used items when cache size limit is reached
 */
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map(); // Map maintains insertion order
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Add to end (most recently used)
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
  
  keys() {
    return Array.from(this.cache.keys());
  }
}

function memoizeWithLRU(fn, maxSize = 100, keyGenerator = JSON.stringify) {
  const cache = new LRUCache(maxSize);
  
  const memoized = function(...args) {
    const key = keyGenerator(args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Compute and cache
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
  
  // Expose cache methods
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.delete = (key) => cache.delete(key);
  memoized.has = (key) => cache.has(key);
  
  return memoized;
}

// =======================
// Approach 3: TTL (Time To Live) Cache
// =======================

/**
 * TTL Cache with automatic expiration
 * Cached items expire after specified time period
 */
class TTLCache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
    this.cache = new Map();
    this.timers = new Map();
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() < item.expiry) {
      return item.value;
    }
    
    // Item expired or doesn't exist
    this.delete(key);
    return undefined;
  }
  
  set(key, value, ttl = this.defaultTTL) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  has(key) {
    const item = this.cache.get(key);
    if (item && Date.now() < item.expiry) {
      return true;
    }
    
    this.delete(key);
    return false;
  }
  
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    return this.cache.delete(key);
  }
  
  clear() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }
  
  size() {
    // Clean up expired items first
    for (const [key] of this.cache) {
      this.get(key); // This will clean up expired items
    }
    return this.cache.size;
  }
  
  keys() {
    // Return only non-expired keys
    const validKeys = [];
    for (const [key] of this.cache) {
      if (this.has(key)) {
        validKeys.push(key);
      }
    }
    return validKeys;
  }
}

function memoizeWithTTL(fn, ttl = 5 * 60 * 1000, keyGenerator = JSON.stringify) {
  const cache = new TTLCache(ttl);
  
  const memoized = function(...args) {
    const key = keyGenerator(args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Compute and cache
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
  
  // Expose cache methods
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  memoized.delete = (key) => cache.delete(key);
  memoized.has = (key) => cache.has(key);
  
  return memoized;
}

// =======================
// Approach 4: Advanced Async Memoization with Request Deduplication
// =======================

/**
 * Advanced async memoization with request deduplication
 * Prevents multiple identical API calls from being made simultaneously
 */
function memoizeAsync(asyncFn, options = {}) {
  const {
    maxSize = 100,
    ttl = 5 * 60 * 1000,
    keyGenerator = JSON.stringify,
    onCacheHit = null,
    onCacheMiss = null,
    onError = null
  } = options;
  
  const cache = new Map();
  const pending = new Map(); // Track pending requests
  const timers = new Map(); // TTL timers
  
  // Clean up expired entries
  function cleanup(key) {
    cache.delete(key);
    pending.delete(key);
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
      timers.delete(key);
    }
  }
  
  // Evict oldest entry if cache is full
  function evictOldest() {
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cleanup(oldestKey);
    }
  }
  
  const memoized = async function(...args) {
    const key = keyGenerator(args);
    
    // Check for cached result
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (Date.now() < cached.expiry) {
        if (onCacheHit) onCacheHit(key, cached.value);
        return cached.value;
      } else {
        cleanup(key);
      }
    }
    
    // Check for pending request (deduplication)
    if (pending.has(key)) {
      return pending.get(key);
    }
    
    // Create and track promise
    const promise = asyncFn.apply(this, args)
      .then(result => {
        // Cache successful result
        evictOldest();
        
        const expiry = Date.now() + ttl;
        cache.set(key, { value: result, expiry, createdAt: Date.now() });
        
        // Set TTL timer
        const timer = setTimeout(() => cleanup(key), ttl);
        timers.set(key, timer);
        
        if (onCacheMiss) onCacheMiss(key, result);
        return result;
      })
      .catch(error => {
        if (onError) onError(key, error);
        throw error;
      })
      .finally(() => {
        pending.delete(key);
      });
    
    pending.set(key, promise);
    return promise;
  };
  
  // Expose control methods
  memoized.clear = () => {
    cache.clear();
    pending.clear();
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
  };
  
  memoized.delete = (key) => {
    cleanup(key);
  };
  
  memoized.has = (key) => {
    if (cache.has(key)) {
      const cached = cache.get(key);
      return Date.now() < cached.expiry;
    }
    return false;
  };
  
  memoized.keys = () => {
    return Array.from(cache.keys()).filter(key => {
      const cached = cache.get(key);
      return Date.now() < cached.expiry;
    });
  };
  
  memoized.stats = () => {
    let hitCount = 0;
    let totalSize = 0;
    
    cache.forEach(cached => {
      if (Date.now() < cached.expiry) {
        hitCount++;
        totalSize++;
      }
    });
    
    return {
      size: totalSize,
      pendingRequests: pending.size,
      hitRate: hitCount / (hitCount + pending.size) || 0
    };
  };
  
  return memoized;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Memoization Examples ===');

// Basic memoization example
const expensiveCalculation = (n) => {
  console.log(`Computing for ${n}...`);
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += i;
  }
  return result;
};

const memoizedCalc = memoizeBasic(expensiveCalculation);

console.log('First call:', memoizedCalc(100));
console.log('Second call (cached):', memoizedCalc(100));

// LRU Cache example
const lruMemoized = memoizeWithLRU(expensiveCalculation, 2);
console.log('\n--- LRU Cache ---');
lruMemoized(1);
lruMemoized(2);
lruMemoized(3); // This should evict 1
console.log('Cache size:', lruMemoized.cache.size());
console.log('Cache keys:', lruMemoized.cache.keys());

// Async memoization example
const mockAPICall = async (endpoint) => {
  console.log(`Fetching ${endpoint}...`);
  await new Promise(resolve => setTimeout(resolve, 100));
  return { data: `Response from ${endpoint}`, timestamp: Date.now() };
};

const memoizedAPI = memoizeAsync(mockAPICall, {
  ttl: 2000,
  onCacheHit: (key, value) => console.log(`Cache hit for ${key}`),
  onCacheMiss: (key, value) => console.log(`Cache miss for ${key}`)
});

// Test async memoization
async function testAsyncMemoization() {
  console.log('\n--- Async Memoization ---');
  await memoizedAPI('/users');
  await memoizedAPI('/users'); // Should be cached
  
  // Concurrent requests (deduplication)
  const promises = [
    memoizedAPI('/posts'),
    memoizedAPI('/posts'),
    memoizedAPI('/posts')
  ];
  
  await Promise.all(promises);
  console.log('Stats:', memoizedAPI.stats());
}

testAsyncMemoization();

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: API Client with Intelligent Caching
 * HTTP client with automatic caching and cache invalidation
 */
function createAPIClient(baseURL, options = {}) {
  const {
    defaultTTL = 5 * 60 * 1000, // 5 minutes
    maxCacheSize = 200,
    enableLogging = false
  } = options;
  
  // Cache different types of requests differently
  const caches = {
    GET: memoizeAsync(fetchData, {
      maxSize: maxCacheSize,
      ttl: defaultTTL,
      keyGenerator: ({ url, params }) => `GET:${url}:${JSON.stringify(params || {})}`,
      onCacheHit: enableLogging ? (key) => console.log(`Cache hit: ${key}`) : null,
      onCacheMiss: enableLogging ? (key) => console.log(`Cache miss: ${key}`) : null
    }),
    
    // POST requests typically shouldn't be cached, but we can cache responses
    // for idempotent operations
    POST: memoizeAsync(postData, {
      maxSize: 50,
      ttl: 60 * 1000, // 1 minute for POST responses
      keyGenerator: ({ url, body }) => `POST:${url}:${JSON.stringify(body)}`
    })
  };
  
  // Mock fetch implementation
  async function fetchData({ url, params, headers }) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const fullURL = `${baseURL}${url}${queryString}`;
    
    console.log(`Fetching: ${fullURL}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    
    return {
      status: 200,
      data: { url: fullURL, timestamp: Date.now(), method: 'GET' },
      headers: { 'content-type': 'application/json' }
    };
  }
  
  async function postData({ url, body, headers }) {
    console.log(`Posting to: ${baseURL}${url}`);
    
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
    
    return {
      status: 201,
      data: { url: `${baseURL}${url}`, body, timestamp: Date.now(), method: 'POST' },
      headers: { 'content-type': 'application/json' }
    };
  }
  
  return {
    async get(url, params, options = {}) {
      const { ttl, noCache = false } = options;
      
      if (noCache) {
        return fetchData({ url, params });
      }
      
      if (ttl) {
        // Create temporary memoized function with custom TTL
        const customMemoized = memoizeAsync(fetchData, {
          maxSize: 10,
          ttl,
          keyGenerator: ({ url, params }) => `GET:${url}:${JSON.stringify(params || {})}`
        });
        return customMemoized({ url, params });
      }
      
      return caches.GET({ url, params });
    },
    
    async post(url, body, options = {}) {
      const { cache = false } = options;
      
      if (cache) {
        return caches.POST({ url, body });
      }
      
      return postData({ url, body });
    },
    
    // Cache invalidation methods
    invalidateCache(pattern) {
      Object.values(caches).forEach(cache => {
        cache.keys().forEach(key => {
          if (key.includes(pattern)) {
            cache.delete(key);
          }
        });
      });
    },
    
    clearCache() {
      Object.values(caches).forEach(cache => cache.clear());
    },
    
    getCacheStats() {
      const stats = {};
      Object.entries(caches).forEach(([method, cache]) => {
        stats[method] = cache.stats();
      });
      return stats;
    }
  };
}

/**
 * Use Case 2: React Hook for Data Fetching with Cache
 * Custom React hook with memoization and cache management
 */
function createDataFetcher() {
  // Global cache shared across all hook instances
  const globalCache = memoizeAsync(
    async (url, options = {}) => {
      console.log(`Fetching data from: ${url}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      
      if (Math.random() < 0.1) {
        throw new Error('Random API error');
      }
      
      return {
        data: `Data from ${url}`,
        timestamp: Date.now(),
        options
      };
    },
    {
      maxSize: 100,
      ttl: 10 * 60 * 1000, // 10 minutes
      keyGenerator: (args) => JSON.stringify(args)
    }
  );
  
  // React-like hook interface (simplified)
  function useData(url, options = {}) {
    const {
      enabled = true,
      refetchInterval = null,
      staleTime = 5 * 60 * 1000,
      onSuccess = null,
      onError = null
    } = options;
    
    let state = {
      data: null,
      error: null,
      isLoading: false,
      isFetching: false
    };
    
    const fetchData = async () => {
      if (!enabled || !url) return;
      
      state.isLoading = true;
      state.isFetching = true;
      
      try {
        const result = await globalCache(url, options);
        state.data = result;
        state.error = null;
        
        if (onSuccess) onSuccess(result);
      } catch (error) {
        state.error = error;
        if (onError) onError(error);
      } finally {
        state.isLoading = false;
        state.isFetching = false;
      }
    };
    
    // Auto-refetch setup
    if (refetchInterval && enabled) {
      setInterval(fetchData, refetchInterval);
    }
    
    return {
      ...state,
      refetch: fetchData,
      invalidate: () => globalCache.delete(JSON.stringify([url, options]))
    };
  }
  
  return {
    useData,
    clearAllCache: () => globalCache.clear(),
    getCacheStats: () => globalCache.stats()
  };
}

/**
 * Use Case 3: GraphQL Query Cache
 * Intelligent caching for GraphQL queries with field-level invalidation
 */
function createGraphQLCache() {
  const queryCache = new Map();
  const fieldDependencies = new Map(); // Track which fields each query depends on
  
  function parseQuery(query) {
    // Simplified query parsing - in reality you'd use a proper GraphQL parser
    const fields = [];
    const matches = query.match(/{\s*([^}]+)\s*}/g);
    
    if (matches) {
      matches.forEach(match => {
        const fieldMatch = match.match(/(\w+)/g);
        if (fieldMatch) {
          fields.push(...fieldMatch);
        }
      });
    }
    
    return fields;
  }
  
  const memoizedQuery = memoizeAsync(
    async (query, variables = {}) => {
      console.log('Executing GraphQL query:', query.substring(0, 100) + '...');
      
      // Parse query to extract fields
      const fields = parseQuery(query);
      const queryKey = JSON.stringify({ query, variables });
      
      // Store field dependencies
      fieldDependencies.set(queryKey, fields);
      
      // Simulate GraphQL execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
      
      return {
        data: { result: 'GraphQL result', fields, timestamp: Date.now() },
        extensions: { cacheKey: queryKey }
      };
    },
    {
      maxSize: 200,
      ttl: 15 * 60 * 1000,
      keyGenerator: ({ query, variables }) => JSON.stringify({ query, variables })
    }
  );
  
  return {
    async query(query, variables = {}) {
      return memoizedQuery(query, variables);
    },
    
    // Invalidate queries that depend on specific fields
    invalidateField(fieldName) {
      const keysToInvalidate = [];
      
      fieldDependencies.forEach((fields, queryKey) => {
        if (fields.includes(fieldName)) {
          keysToInvalidate.push(queryKey);
        }
      });
      
      keysToInvalidate.forEach(key => {
        memoizedQuery.delete(key);
        fieldDependencies.delete(key);
      });
      
      console.log(`Invalidated ${keysToInvalidate.length} queries for field: ${fieldName}`);
    },
    
    // Invalidate by entity type
    invalidateEntity(entityType) {
      this.invalidateField(entityType);
      this.invalidateField(`${entityType}s`); // Handle plurals
    },
    
    clearCache() {
      memoizedQuery.clear();
      fieldDependencies.clear();
    },
    
    getStats() {
      return {
        ...memoizedQuery.stats(),
        totalQueries: fieldDependencies.size
      };
    }
  };
}

/**
 * Use Case 4: Smart Cache with Background Refresh
 * Cache that refreshes data in background before expiration
 */
function createSmartCache(options = {}) {
  const {
    backgroundRefreshThreshold = 0.8, // Refresh when 80% of TTL has passed
    maxBackgroundRequests = 3
  } = options;
  
  let backgroundRequestCount = 0;
  
  const smartMemoize = memoizeAsync(
    async (...args) => {
      // Simulate expensive operation
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      return { data: `Result for ${JSON.stringify(args)}`, timestamp: Date.now() };
    },
    {
      maxSize: 50,
      ttl: 10000, // 10 seconds
      onCacheHit: (key, value) => {
        // Check if we should refresh in background
        const age = Date.now() - value.createdAt;
        const ttl = 10000;
        
        if (age > ttl * backgroundRefreshThreshold && backgroundRequestCount < maxBackgroundRequests) {
          backgroundRequestCount++;
          
          console.log(`Background refresh for: ${key}`);
          
          // Trigger background refresh
          smartMemoize.delete(key);
          smartMemoize(...JSON.parse(key))
            .finally(() => {
              backgroundRequestCount--;
            });
        }
      }
    }
  );
  
  return {
    get: smartMemoize,
    clear: () => smartMemoize.clear(),
    stats: () => ({
      ...smartMemoize.stats(),
      backgroundRequests: backgroundRequestCount
    })
  };
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===');
  
  // API Client
  const apiClient = createAPIClient('https://api.example.com');
  
  try {
    await apiClient.get('/users', { page: 1 });
    await apiClient.get('/users', { page: 1 }); // Cached
    console.log('API Cache stats:', apiClient.getCacheStats());
  } catch (error) {
    console.log('API error:', error.message);
  }
  
  // Data fetcher
  const dataFetcher = createDataFetcher();
  const userData = dataFetcher.useData('/api/user/123');
  console.log('Data fetcher stats:', dataFetcher.getCacheStats());
  
  // GraphQL cache
  const gqlCache = createGraphQLCache();
  await gqlCache.query('{ user(id: 123) { name email } }');
  gqlCache.invalidateField('user');
  console.log('GraphQL stats:', gqlCache.getStats());
  
  // Smart cache
  const smartCache = createSmartCache();
  await smartCache.get('test', 'data');
  console.log('Smart cache stats:', smartCache.stats());
}, 3000);

// Export all implementations
module.exports = {
  memoizeBasic,
  LRUCache,
  TTLCache,
  memoizeWithLRU,
  memoizeWithTTL,
  memoizeAsync,
  createAPIClient,
  createDataFetcher,
  createGraphQLCache,
  createSmartCache
};

/**
 * Key Interview Points:
 * 
 * 1. Memoization vs Caching:
 *    - Memoization: Function-level result caching
 *    - Caching: General data storage with expiration
 *    - Both optimize repeated computations/requests
 * 
 * 2. Cache Eviction Strategies:
 *    - LRU: Remove least recently used items
 *    - TTL: Remove items after time expiration
 *    - Size-based: Remove oldest when size limit reached
 *    - FIFO: First in, first out
 * 
 * 3. Key Generation:
 *    - JSON.stringify: Simple but can have issues with object ordering
 *    - Custom serialization: More control over cache keys
 *    - Shallow vs deep comparison of arguments
 * 
 * 4. Async Considerations:
 *    - Request deduplication: Prevent multiple identical requests
 *    - Promise caching: Cache promises, not just results
 *    - Error handling: Should errors be cached?
 * 
 * 5. Cache Invalidation:
 *    - Manual: Explicit cache clearing
 *    - Time-based: TTL expiration
 *    - Event-based: Clear on data mutations
 *    - Smart refresh: Background updates before expiration
 * 
 * 6. Real-world Applications:
 *    - API response caching
 *    - Database query results
 *    - Computed values (React useMemo)
 *    - Image/asset caching
 *    - GraphQL field-level caching
 * 
 * 7. Performance Trade-offs:
 *    - Memory usage vs computation time
 *    - Cache hit rate vs cache size
 *    - Synchronous vs asynchronous operations
 */