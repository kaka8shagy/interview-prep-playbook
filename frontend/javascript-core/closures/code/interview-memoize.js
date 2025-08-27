/**
 * File: interview-memoize.js
 * Description: Implement memoization using closures
 * Tests understanding of closure for caching
 */

// Basic memoize for single argument functions
function memoize(fn) {
  const cache = {};
  
  return function(arg) {
    if (arg in cache) {
      console.log('Cache hit for:', arg);
      return cache[arg];
    }
    
    console.log('Cache miss for:', arg);
    const result = fn(arg);
    cache[arg] = result;
    return result;
  };
}

// Memoize with multiple arguments
function memoizeMulti(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit for:', args);
      return cache.get(key);
    }
    
    console.log('Cache miss for:', args);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Memoize with TTL (Time To Live)
function memoizeWithTTL(fn, ttl = 60000) { // Default 1 minute
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log('Cache hit (valid) for:', args);
      return cached.value;
    }
    
    console.log('Cache miss or expired for:', args);
    const result = fn.apply(this, args);
    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    return result;
  };
}

// Memoize with max cache size (LRU)
function memoizeLRU(fn, maxSize = 10) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    // If exists, delete and re-add to make it most recent
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      console.log('Cache hit for:', args);
      return value;
    }
    
    console.log('Cache miss for:', args);
    const result = fn.apply(this, args);
    
    // Add new entry
    cache.set(key, result);
    
    // Remove oldest if exceeds max size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
      console.log('Evicted oldest cache entry');
    }
    
    return result;
  };
}

// Advanced memoize with custom key generator
function memoizeAdvanced(fn, options = {}) {
  const {
    keyGenerator = (...args) => JSON.stringify(args),
    maxSize = Infinity,
    ttl = Infinity,
    onCacheHit = () => {},
    onCacheMiss = () => {}
  } = options;
  
  const cache = new Map();
  
  return function(...args) {
    const key = keyGenerator(...args);
    const cached = cache.get(key);
    
    // Check if cached and not expired
    if (cached) {
      if (Date.now() - cached.timestamp < ttl) {
        onCacheHit(key, cached.value);
        return cached.value;
      }
      // Expired, remove it
      cache.delete(key);
    }
    
    onCacheMiss(key);
    const result = fn.apply(this, args);
    
    // Add to cache
    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    // Handle max size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

// Example usage with expensive computation
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function expensiveOperation(x, y) {
  // Simulate expensive computation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(x * y + i);
  }
  return result;
}

// Test basic memoize
console.log('Testing basic memoize:');
const memoizedFib = memoize(fibonacci);
console.time('First call');
console.log(memoizedFib(10));
console.timeEnd('First call');

console.time('Second call (cached)');
console.log(memoizedFib(10));
console.timeEnd('Second call (cached)');

// Test multi-argument memoize
console.log('\nTesting multi-argument memoize:');
const memoizedExpensive = memoizeMulti(expensiveOperation);
console.time('First call');
memoizedExpensive(5, 10);
console.timeEnd('First call');

console.time('Second call (cached)');
memoizedExpensive(5, 10);
console.timeEnd('Second call (cached)');

// Test LRU memoize
console.log('\nTesting LRU memoize (max size 3):');
const memoizedLRU = memoizeLRU((x) => x * 2, 3);
[1, 2, 3, 4, 1, 5].forEach(n => {
  console.log(`Result for ${n}: ${memoizedLRU(n)}`);
});

module.exports = {
  memoize,
  memoizeMulti,
  memoizeWithTTL,
  memoizeLRU,
  memoizeAdvanced
};