/**
 * File: localstorage-expiry.js
 * Description: Enhanced localStorage with expiration functionality and advanced features
 * 
 * Learning objectives:
 * - Understand browser storage mechanisms and limitations
 * - Learn data serialization and time-based invalidation
 * - See storage optimization and cleanup strategies
 * 
 * Time Complexity: O(1) for most operations, O(n) for cleanup
 * Space Complexity: O(n) where n is stored data size
 */

// =======================
// Approach 1: Basic localStorage with Expiry
// =======================

/**
 * Enhanced localStorage wrapper with expiration support
 * Automatically handles TTL (Time To Live) for stored items
 * 
 * Mental model: Wrap data with metadata including expiration timestamp
 */
class ExpiryLocalStorage {
  constructor(prefix = 'exp_', defaultTTL = 24 * 60 * 60 * 1000) { // 24 hours default
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
    this.separator = '|';
  }
  
  /**
   * Set item with expiration
   */
  setItem(key, value, ttlMs = this.defaultTTL) {
    try {
      const expirationTime = Date.now() + ttlMs;
      const data = {
        value: value,
        expiry: expirationTime,
        created: Date.now(),
        accessed: Date.now()
      };
      
      const serializedData = JSON.stringify(data);
      const prefixedKey = this.prefix + key;
      
      localStorage.setItem(prefixedKey, serializedData);
      return true;
    } catch (error) {
      console.warn('Failed to store item:', error.message);
      return false;
    }
  }
  
  /**
   * Get item with expiration check
   */
  getItem(key, updateAccess = true) {
    try {
      const prefixedKey = this.prefix + key;
      const serializedData = localStorage.getItem(prefixedKey);
      
      if (!serializedData) {
        return null;
      }
      
      const data = JSON.parse(serializedData);
      
      // Check if item has expired
      if (Date.now() > data.expiry) {
        this.removeItem(key);
        return null;
      }
      
      // Update access time if requested
      if (updateAccess) {
        data.accessed = Date.now();
        localStorage.setItem(prefixedKey, JSON.stringify(data));
      }
      
      return data.value;
    } catch (error) {
      console.warn('Failed to retrieve item:', error.message);
      return null;
    }
  }
  
  /**
   * Remove item
   */
  removeItem(key) {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.warn('Failed to remove item:', error.message);
      return false;
    }
  }
  
  /**
   * Check if item exists and is not expired
   */
  hasItem(key) {
    return this.getItem(key, false) !== null;
  }
  
  /**
   * Get item metadata without the value
   */
  getItemInfo(key) {
    try {
      const prefixedKey = this.prefix + key;
      const serializedData = localStorage.getItem(prefixedKey);
      
      if (!serializedData) {
        return null;
      }
      
      const data = JSON.parse(serializedData);
      
      return {
        created: data.created,
        accessed: data.accessed,
        expiry: data.expiry,
        isExpired: Date.now() > data.expiry,
        remainingTTL: Math.max(0, data.expiry - Date.now()),
        size: serializedData.length
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Clean up expired items
   */
  cleanup() {
    const removedCount = 0;
    const keys = [];
    
    // Collect all keys with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    
    // Check each key for expiration
    let removed = 0;
    keys.forEach(prefixedKey => {
      try {
        const serializedData = localStorage.getItem(prefixedKey);
        if (serializedData) {
          const data = JSON.parse(serializedData);
          if (Date.now() > data.expiry) {
            localStorage.removeItem(prefixedKey);
            removed++;
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(prefixedKey);
        removed++;
      }
    });
    
    return removed;
  }
  
  /**
   * Get all non-expired keys
   */
  getAllKeys() {
    const keys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const prefixedKey = localStorage.key(i);
      if (prefixedKey && prefixedKey.startsWith(this.prefix)) {
        const key = prefixedKey.substring(this.prefix.length);
        if (this.hasItem(key)) {
          keys.push(key);
        }
      }
    }
    
    return keys;
  }
  
  /**
   * Clear all items with this prefix
   */
  clear() {
    const keys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    return keys.length;
  }
  
  /**
   * Get storage statistics
   */
  getStats() {
    const stats = {
      totalItems: 0,
      expiredItems: 0,
      totalSize: 0,
      oldestItem: null,
      newestItem: null,
      mostAccessed: null
    };
    
    let oldestTime = Date.now();
    let newestTime = 0;
    let maxAccesses = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const prefixedKey = localStorage.key(i);
      if (prefixedKey && prefixedKey.startsWith(this.prefix)) {
        try {
          const serializedData = localStorage.getItem(prefixedKey);
          const data = JSON.parse(serializedData);
          const key = prefixedKey.substring(this.prefix.length);
          
          stats.totalItems++;
          stats.totalSize += serializedData.length;
          
          if (Date.now() > data.expiry) {
            stats.expiredItems++;
          }
          
          if (data.created < oldestTime) {
            oldestTime = data.created;
            stats.oldestItem = key;
          }
          
          if (data.created > newestTime) {
            newestTime = data.created;
            stats.newestItem = key;
          }
          
          if (data.accessed > maxAccesses) {
            maxAccesses = data.accessed;
            stats.mostAccessed = key;
          }
        } catch (error) {
          // Skip corrupted items
        }
      }
    }
    
    return stats;
  }
}

// =======================
// Approach 2: Advanced Storage Manager
// =======================

/**
 * Advanced storage manager with multiple backends and features
 * Supports localStorage, sessionStorage, and memory fallback
 */
class AdvancedStorageManager {
  constructor(options = {}) {
    const {
      prefix = 'asm_',
      defaultTTL = 24 * 60 * 60 * 1000,
      maxSize = 5 * 1024 * 1024, // 5MB
      compressionThreshold = 1024, // Compress items > 1KB
      backend = 'auto'
    } = options;
    
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.compressionThreshold = compressionThreshold;
    
    // Determine storage backend
    this.backend = this.initializeBackend(backend);
    
    // Statistics
    this.stats = {
      reads: 0,
      writes: 0,
      hits: 0,
      misses: 0,
      compressions: 0,
      decompressions: 0
    };
    
    // Auto cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute
  }
  
  /**
   * Initialize storage backend
   */
  initializeBackend(backend) {
    const backends = {
      localStorage: typeof localStorage !== 'undefined' ? localStorage : null,
      sessionStorage: typeof sessionStorage !== 'undefined' ? sessionStorage : null,
      memory: new Map()
    };
    
    if (backend === 'auto') {
      // Try localStorage first, then sessionStorage, then memory
      return backends.localStorage || backends.sessionStorage || backends.memory;
    }
    
    return backends[backend] || backends.memory;
  }
  
  /**
   * Set item with advanced features
   */
  async setItem(key, value, options = {}) {
    const {
      ttl = this.defaultTTL,
      compress = null,
      encrypt = false,
      tags = []
    } = options;
    
    try {
      this.stats.writes++;
      
      let serializedValue = JSON.stringify(value);
      
      // Compression
      const shouldCompress = compress !== null 
        ? compress 
        : serializedValue.length > this.compressionThreshold;
      
      if (shouldCompress && typeof pako !== 'undefined') {
        serializedValue = pako.deflate(serializedValue, { to: 'string' });
        this.stats.compressions++;
      }
      
      // Encryption (placeholder for actual encryption)
      if (encrypt) {
        serializedValue = this.simpleEncrypt(serializedValue);
      }
      
      const data = {
        value: serializedValue,
        expiry: Date.now() + ttl,
        created: Date.now(),
        accessed: Date.now(),
        compressed: shouldCompress,
        encrypted: encrypt,
        tags,
        size: serializedValue.length
      };
      
      const finalData = JSON.stringify(data);
      const prefixedKey = this.prefix + key;
      
      // Check size limits
      if (this.getCurrentSize() + finalData.length > this.maxSize) {
        this.evictLRU(finalData.length);
      }
      
      if (this.backend instanceof Map) {
        this.backend.set(prefixedKey, finalData);
      } else {
        this.backend.setItem(prefixedKey, finalData);
      }
      
      return true;
    } catch (error) {
      console.warn('Storage setItem failed:', error.message);
      return false;
    }
  }
  
  /**
   * Get item with advanced features
   */
  async getItem(key, updateAccess = true) {
    try {
      this.stats.reads++;
      
      const prefixedKey = this.prefix + key;
      let serializedData;
      
      if (this.backend instanceof Map) {
        serializedData = this.backend.get(prefixedKey);
      } else {
        serializedData = this.backend.getItem(prefixedKey);
      }
      
      if (!serializedData) {
        this.stats.misses++;
        return null;
      }
      
      const data = JSON.parse(serializedData);
      
      // Check expiration
      if (Date.now() > data.expiry) {
        this.removeItem(key);
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      
      // Update access time
      if (updateAccess) {
        data.accessed = Date.now();
        const updatedData = JSON.stringify(data);
        
        if (this.backend instanceof Map) {
          this.backend.set(prefixedKey, updatedData);
        } else {
          this.backend.setItem(prefixedKey, updatedData);
        }
      }
      
      let value = data.value;
      
      // Decryption
      if (data.encrypted) {
        value = this.simpleDecrypt(value);
      }
      
      // Decompression
      if (data.compressed && typeof pako !== 'undefined') {
        value = pako.inflate(value, { to: 'string' });
        this.stats.decompressions++;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.warn('Storage getItem failed:', error.message);
      this.stats.misses++;
      return null;
    }
  }
  
  /**
   * Simple encryption (demo purposes - use proper crypto in production)
   */
  simpleEncrypt(text) {
    return btoa(text); // Simple base64 encoding
  }
  
  simpleDecrypt(encrypted) {
    return atob(encrypted); // Simple base64 decoding
  }
  
  /**
   * Get current storage size
   */
  getCurrentSize() {
    let size = 0;
    
    if (this.backend instanceof Map) {
      for (const [key, value] of this.backend) {
        if (key.startsWith(this.prefix)) {
          size += key.length + value.length;
        }
      }
    } else {
      for (let i = 0; i < this.backend.length; i++) {
        const key = this.backend.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = this.backend.getItem(key);
          size += key.length + (value ? value.length : 0);
        }
      }
    }
    
    return size;
  }
  
  /**
   * Evict least recently used items
   */
  evictLRU(neededSpace) {
    const items = [];
    
    // Collect all items with access times
    if (this.backend instanceof Map) {
      for (const [prefixedKey, serializedData] of this.backend) {
        if (prefixedKey.startsWith(this.prefix)) {
          try {
            const data = JSON.parse(serializedData);
            items.push({
              key: prefixedKey,
              accessed: data.accessed,
              size: serializedData.length
            });
          } catch (error) {
            // Remove corrupted items
            this.backend.delete(prefixedKey);
          }
        }
      }
    } else {
      for (let i = 0; i < this.backend.length; i++) {
        const prefixedKey = this.backend.key(i);
        if (prefixedKey && prefixedKey.startsWith(this.prefix)) {
          try {
            const serializedData = this.backend.getItem(prefixedKey);
            const data = JSON.parse(serializedData);
            items.push({
              key: prefixedKey,
              accessed: data.accessed,
              size: serializedData.length
            });
          } catch (error) {
            // Remove corrupted items
            this.backend.removeItem(prefixedKey);
          }
        }
      }
    }
    
    // Sort by access time (oldest first)
    items.sort((a, b) => a.accessed - b.accessed);
    
    // Remove items until we have enough space
    let freedSpace = 0;
    for (const item of items) {
      if (freedSpace >= neededSpace) break;
      
      if (this.backend instanceof Map) {
        this.backend.delete(item.key);
      } else {
        this.backend.removeItem(item.key);
      }
      
      freedSpace += item.size;
    }
  }
  
  /**
   * Find items by tags
   */
  findByTag(tag) {
    const results = [];
    
    const keys = this.getAllKeys();
    for (const key of keys) {
      const info = this.getItemInfo(key);
      if (info && info.tags && info.tags.includes(tag)) {
        results.push(key);
      }
    }
    
    return results;
  }
  
  /**
   * Get all keys
   */
  getAllKeys() {
    const keys = [];
    
    if (this.backend instanceof Map) {
      for (const prefixedKey of this.backend.keys()) {
        if (prefixedKey.startsWith(this.prefix)) {
          const key = prefixedKey.substring(this.prefix.length);
          keys.push(key);
        }
      }
    } else {
      for (let i = 0; i < this.backend.length; i++) {
        const prefixedKey = this.backend.key(i);
        if (prefixedKey && prefixedKey.startsWith(this.prefix)) {
          const key = prefixedKey.substring(this.prefix.length);
          keys.push(key);
        }
      }
    }
    
    return keys;
  }
  
  /**
   * Get comprehensive statistics
   */
  getComprehensiveStats() {
    return {
      performance: { ...this.stats },
      storage: {
        currentSize: this.getCurrentSize(),
        maxSize: this.maxSize,
        utilization: (this.getCurrentSize() / this.maxSize * 100).toFixed(2) + '%',
        itemCount: this.getAllKeys().length
      },
      backend: this.backend instanceof Map ? 'memory' : 'localStorage/sessionStorage'
    };
  }
  
  /**
   * Cleanup and destroy
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create default instances
const expiryStorage = new ExpiryLocalStorage();
const advancedStorage = new AdvancedStorageManager();

// Export for use in other modules
module.exports = {
  ExpiryLocalStorage,
  AdvancedStorageManager,
  expiryStorage,
  advancedStorage
};