/**
 * File: distributed-cache.js
 * Description: Distributed cache implementation with consistent hashing and replication
 * 
 * Learning objectives:
 * - Understand consistent hashing for distributed cache partitioning
 * - Implement cache node management with failover capabilities
 * - Design replication strategies for high availability
 * - Handle cache coherence and invalidation in distributed systems
 * 
 * Time Complexity: O(log N) for node lookup with consistent hashing
 * Space Complexity: O(K + N) where K is keys and N is nodes
 */

const crypto = require('crypto');

// Individual cache node representing a single cache server
// In production, this would be a network client to actual cache servers
class CacheNode {
  constructor(id, host = 'localhost', port = 6379) {
    this.id = id;
    this.host = host;
    this.port = port;
    this.cache = new Map(); // Local storage for simulation
    this.isHealthy = true;
    this.lastHealthCheck = Date.now();
    this.requestCount = 0;
    this.hitCount = 0;
    this.missCount = 0;
    
    // Simulate realistic network latency for operations
    this.latencyMs = Math.floor(Math.random() * 10) + 5; // 5-15ms latency
  }

  // Simulate network request with latency and potential failures
  async simulateNetworkOperation(operation) {
    await new Promise(resolve => setTimeout(resolve, this.latencyMs));
    
    // Simulate occasional network failures (1% failure rate)
    if (Math.random() < 0.01) {
      throw new Error(`Network error on node ${this.id}`);
    }
    
    return operation();
  }

  // Get value from this cache node
  async get(key) {
    this.requestCount++;
    
    return await this.simulateNetworkOperation(() => {
      const value = this.cache.get(key);
      if (value !== undefined) {
        this.hitCount++;
        console.log(`NODE ${this.id}: HIT for key '${key}' -> ${JSON.stringify(value)}`);
        return { value, timestamp: Date.now() };
      } else {
        this.missCount++;
        console.log(`NODE ${this.id}: MISS for key '${key}'`);
        return null;
      }
    });
  }

  // Set value on this cache node
  async set(key, value, ttlMs = null) {
    return await this.simulateNetworkOperation(() => {
      const entry = {
        value: value,
        timestamp: Date.now(),
        ttl: ttlMs,
        expiresAt: ttlMs ? Date.now() + ttlMs : null
      };
      
      this.cache.set(key, entry);
      console.log(`NODE ${this.id}: SET key '${key}' -> ${JSON.stringify(value)}`);
      return true;
    });
  }

  // Delete value from this cache node
  async delete(key) {
    return await this.simulateNetworkOperation(() => {
      const existed = this.cache.delete(key);
      console.log(`NODE ${this.id}: DELETE key '${key}' (existed: ${existed})`);
      return existed;
    });
  }

  // Health check for this node
  async healthCheck() {
    try {
      await this.simulateNetworkOperation(() => {
        this.lastHealthCheck = Date.now();
        return 'pong';
      });
      
      this.isHealthy = true;
      return true;
    } catch (error) {
      console.log(`NODE ${this.id}: Health check failed - ${error.message}`);
      this.isHealthy = false;
      return false;
    }
  }

  // Get node statistics
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      id: this.id,
      host: this.host,
      port: this.port,
      isHealthy: this.isHealthy,
      size: this.cache.size,
      requests: this.requestCount,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: totalRequests > 0 ? ((this.hitCount / totalRequests) * 100).toFixed(2) + '%' : '0%',
      avgLatency: this.latencyMs
    };
  }

  // Clean up expired entries
  cleanupExpired() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`NODE ${this.id}: Cleaned up ${cleaned} expired entries`);
    }
    
    return cleaned;
  }
}

// Consistent hashing implementation for distributed cache
// Ensures minimal redistribution when nodes are added/removed
class ConsistentHashRing {
  constructor(virtualNodesPerNode = 150) {
    this.virtualNodesPerNode = virtualNodesPerNode;
    this.ring = new Map(); // hash -> nodeId mapping
    this.nodes = new Map(); // nodeId -> node mapping
    this.sortedHashes = []; // Sorted array of hash values for binary search
  }

  // Add a node to the hash ring
  addNode(node) {
    this.nodes.set(node.id, node);
    
    // Create virtual nodes to improve distribution
    // More virtual nodes = better distribution but more memory
    for (let i = 0; i < this.virtualNodesPerNode; i++) {
      const virtualNodeKey = `${node.id}:${i}`;
      const hash = this.hashKey(virtualNodeKey);
      this.ring.set(hash, node.id);
    }
    
    // Rebuild sorted hash array for efficient lookups
    this.rebuildSortedHashes();
    console.log(`RING: Added node ${node.id} with ${this.virtualNodesPerNode} virtual nodes`);
  }

  // Remove a node from the hash ring
  removeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    this.nodes.delete(nodeId);
    
    // Remove all virtual nodes for this physical node
    for (const [hash, id] of this.ring.entries()) {
      if (id === nodeId) {
        this.ring.delete(hash);
      }
    }
    
    this.rebuildSortedHashes();
    console.log(`RING: Removed node ${nodeId}`);
    return true;
  }

  // Find the node responsible for a given key using consistent hashing
  getNode(key) {
    if (this.sortedHashes.length === 0) {
      return null;
    }
    
    const hash = this.hashKey(key);
    
    // Binary search to find the first hash >= target hash
    let left = 0;
    let right = this.sortedHashes.length - 1;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.sortedHashes[mid] < hash) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    // If key hash is larger than all ring hashes, wrap around to first node
    const targetHash = this.sortedHashes[left];
    const nodeId = this.ring.get(targetHash);
    const node = this.nodes.get(nodeId);
    
    return node && node.isHealthy ? node : this.findNextHealthyNode(targetHash);
  }

  // Find next healthy node in the ring (for failover)
  findNextHealthyNode(startHash) {
    const startIndex = this.sortedHashes.indexOf(startHash);
    
    // Search clockwise around the ring for healthy node
    for (let i = 1; i < this.sortedHashes.length; i++) {
      const index = (startIndex + i) % this.sortedHashes.length;
      const hash = this.sortedHashes[index];
      const nodeId = this.ring.get(hash);
      const node = this.nodes.get(nodeId);
      
      if (node && node.isHealthy) {
        console.log(`FAILOVER: Using node ${node.id} instead of failed primary`);
        return node;
      }
    }
    
    return null; // All nodes are unhealthy
  }

  // Get N replicas for a key (for replication)
  getReplicaNodes(key, replicationFactor = 2) {
    if (this.nodes.size < replicationFactor) {
      // Not enough nodes for desired replication
      return Array.from(this.nodes.values()).filter(node => node.isHealthy);
    }
    
    const hash = this.hashKey(key);
    const replicas = [];
    const usedNodes = new Set();
    
    // Find primary node
    let startIndex = 0;
    for (let i = 0; i < this.sortedHashes.length; i++) {
      if (this.sortedHashes[i] >= hash) {
        startIndex = i;
        break;
      }
    }
    
    // Collect unique healthy nodes for replication
    for (let i = 0; i < this.sortedHashes.length && replicas.length < replicationFactor; i++) {
      const index = (startIndex + i) % this.sortedHashes.length;
      const ringHash = this.sortedHashes[index];
      const nodeId = this.ring.get(ringHash);
      const node = this.nodes.get(nodeId);
      
      if (node && node.isHealthy && !usedNodes.has(nodeId)) {
        replicas.push(node);
        usedNodes.add(nodeId);
      }
    }
    
    return replicas;
  }

  // Hash function for consistent hashing
  // Uses SHA-256 for good distribution properties
  hashKey(key) {
    return parseInt(crypto.createHash('sha256').update(key).digest('hex').substring(0, 8), 16);
  }

  // Rebuild sorted hash array for efficient binary search
  rebuildSortedHashes() {
    this.sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  // Get ring statistics
  getStats() {
    const healthyNodes = Array.from(this.nodes.values()).filter(n => n.isHealthy).length;
    const totalNodes = this.nodes.size;
    
    return {
      totalNodes,
      healthyNodes,
      virtualNodes: this.ring.size,
      virtualNodesPerNode: this.virtualNodesPerNode,
      ringUtilization: totalNodes > 0 ? ((healthyNodes / totalNodes) * 100).toFixed(2) + '%' : '0%'
    };
  }
}

// Distributed cache coordinator managing multiple cache nodes
class DistributedCache {
  constructor(replicationFactor = 2, consistencyLevel = 'eventual') {
    this.hashRing = new ConsistentHashRing();
    this.replicationFactor = Math.max(1, replicationFactor);
    this.consistencyLevel = consistencyLevel; // 'strong', 'eventual', 'weak'
    this.healthCheckInterval = 10000; // 10 seconds
    
    // Statistics
    this.totalRequests = 0;
    this.totalHits = 0;
    this.totalMisses = 0;
    this.failoverCount = 0;
    
    // Start background health monitoring
    this.startHealthMonitoring();
  }

  // Add a cache node to the distributed system
  addNode(nodeId, host = 'localhost', port = 6379) {
    const node = new CacheNode(nodeId, host, port);
    this.hashRing.addNode(node);
    console.log(`DISTRIBUTED: Added cache node ${nodeId} at ${host}:${port}`);
    return node;
  }

  // Remove a cache node from the system
  removeNode(nodeId) {
    return this.hashRing.removeNode(nodeId);
  }

  // Get value from distributed cache with replication support
  async get(key) {
    this.totalRequests++;
    
    try {
      const replicas = this.hashRing.getReplicaNodes(key, this.replicationFactor);
      
      if (replicas.length === 0) {
        console.log(`DISTRIBUTED: No healthy nodes available for key '${key}'`);
        this.totalMisses++;
        return null;
      }
      
      // Try replicas in order until we get a hit
      for (const replica of replicas) {
        try {
          const result = await replica.get(key);
          if (result) {
            this.totalHits++;
            console.log(`DISTRIBUTED: HIT for key '${key}' from node ${replica.id}`);
            return result.value;
          }
        } catch (error) {
          console.log(`DISTRIBUTED: Error reading from node ${replica.id}: ${error.message}`);
          replica.isHealthy = false;
          this.failoverCount++;
        }
      }
      
      this.totalMisses++;
      console.log(`DISTRIBUTED: MISS for key '${key}' (checked ${replicas.length} replicas)`);
      return null;
      
    } catch (error) {
      console.error(`DISTRIBUTED: Get operation failed for key '${key}':`, error.message);
      this.totalMisses++;
      return null;
    }
  }

  // Set value in distributed cache with replication
  async set(key, value, ttlMs = null) {
    try {
      const replicas = this.hashRing.getReplicaNodes(key, this.replicationFactor);
      
      if (replicas.length === 0) {
        console.log(`DISTRIBUTED: No healthy nodes available for storing key '${key}'`);
        return false;
      }
      
      const promises = [];
      let successCount = 0;
      
      // Write to all replicas
      for (const replica of replicas) {
        promises.push(
          replica.set(key, value, ttlMs)
            .then(() => {
              successCount++;
              return { success: true, nodeId: replica.id };
            })
            .catch(error => {
              console.log(`DISTRIBUTED: Failed to write to node ${replica.id}: ${error.message}`);
              replica.isHealthy = false;
              return { success: false, nodeId: replica.id, error };
            })
        );
      }
      
      const results = await Promise.all(promises);
      
      // Determine success based on consistency level
      const requiredSuccess = this.getRequiredSuccessCount(replicas.length);
      const success = successCount >= requiredSuccess;
      
      console.log(`DISTRIBUTED: SET '${key}' -> ${successCount}/${replicas.length} replicas succeeded (required: ${requiredSuccess})`);
      
      return success;
      
    } catch (error) {
      console.error(`DISTRIBUTED: Set operation failed for key '${key}':`, error.message);
      return false;
    }
  }

  // Delete value from distributed cache
  async delete(key) {
    try {
      const replicas = this.hashRing.getReplicaNodes(key, this.replicationFactor);
      
      if (replicas.length === 0) {
        return false;
      }
      
      const promises = replicas.map(replica =>
        replica.delete(key)
          .catch(error => {
            console.log(`DISTRIBUTED: Failed to delete from node ${replica.id}: ${error.message}`);
            replica.isHealthy = false;
            return false;
          })
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      console.log(`DISTRIBUTED: DELETE '${key}' -> ${successCount}/${replicas.length} replicas succeeded`);
      
      return successCount > 0;
      
    } catch (error) {
      console.error(`DISTRIBUTED: Delete operation failed for key '${key}':`, error.message);
      return false;
    }
  }

  // Invalidate key across all nodes (useful for cache coherence)
  async invalidate(key) {
    console.log(`DISTRIBUTED: Invalidating key '${key}' across all nodes`);
    
    const allNodes = Array.from(this.hashRing.nodes.values());
    const promises = allNodes.map(node =>
      node.delete(key).catch(error => {
        console.log(`DISTRIBUTED: Failed to invalidate key on node ${node.id}: ${error.message}`);
        return false;
      })
    );
    
    const results = await Promise.all(promises);
    const successCount = results.filter(result => result).length;
    
    console.log(`DISTRIBUTED: Invalidated '${key}' on ${successCount}/${allNodes.length} nodes`);
    return successCount;
  }

  // Get required success count based on consistency level
  getRequiredSuccessCount(totalReplicas) {
    switch (this.consistencyLevel) {
      case 'strong':
        return totalReplicas; // All replicas must succeed
      case 'eventual':
        return Math.ceil(totalReplicas / 2); // Majority must succeed
      case 'weak':
        return 1; // At least one must succeed
      default:
        return Math.ceil(totalReplicas / 2);
    }
  }

  // Start background health monitoring
  startHealthMonitoring() {
    setInterval(async () => {
      const allNodes = Array.from(this.hashRing.nodes.values());
      
      for (const node of allNodes) {
        try {
          await node.healthCheck();
          // Clean up expired entries during health check
          node.cleanupExpired();
        } catch (error) {
          console.log(`HEALTH: Node ${node.id} health check failed`);
          node.isHealthy = false;
        }
      }
    }, this.healthCheckInterval);
  }

  // Get comprehensive system statistics
  getStats() {
    const allNodes = Array.from(this.hashRing.nodes.values());
    const nodeStats = allNodes.map(node => node.getStats());
    
    const totalRequests = this.totalHits + this.totalMisses;
    
    return {
      overview: {
        totalRequests: this.totalRequests,
        totalHits: this.totalHits,
        totalMisses: this.totalMisses,
        hitRate: totalRequests > 0 ? ((this.totalHits / totalRequests) * 100).toFixed(2) + '%' : '0%',
        failoverCount: this.failoverCount,
        replicationFactor: this.replicationFactor,
        consistencyLevel: this.consistencyLevel
      },
      hashRing: this.hashRing.getStats(),
      nodes: nodeStats
    };
  }

  // Simulate node failure for testing
  simulateNodeFailure(nodeId) {
    const node = this.hashRing.nodes.get(nodeId);
    if (node) {
      node.isHealthy = false;
      console.log(`SIMULATION: Node ${nodeId} marked as failed`);
    }
  }

  // Simulate node recovery for testing
  simulateNodeRecovery(nodeId) {
    const node = this.hashRing.nodes.get(nodeId);
    if (node) {
      node.isHealthy = true;
      console.log(`SIMULATION: Node ${nodeId} marked as healthy`);
    }
  }
}

// Demonstration of distributed cache functionality
async function demonstrateDistributedCache() {
  console.log('=== Distributed Cache Demonstration ===\n');
  
  // Create distributed cache with replication factor 3
  const distributedCache = new DistributedCache(3, 'eventual');
  
  console.log('--- Setting up cache cluster ---');
  // Add multiple cache nodes
  distributedCache.addNode('node-1', 'cache1.example.com', 6379);
  distributedCache.addNode('node-2', 'cache2.example.com', 6379);
  distributedCache.addNode('node-3', 'cache3.example.com', 6379);
  distributedCache.addNode('node-4', 'cache4.example.com', 6379);
  distributedCache.addNode('node-5', 'cache5.example.com', 6379);
  
  console.log('\n--- Basic distributed operations ---');
  
  // Store some data
  await distributedCache.set('user:1001', { id: 1001, name: 'Alice', role: 'admin' });
  await distributedCache.set('user:1002', { id: 1002, name: 'Bob', role: 'user' });
  await distributedCache.set('session:abc123', { userId: 1001, expires: Date.now() + 3600000 });
  
  // Retrieve data
  const user1 = await distributedCache.get('user:1001');
  console.log('Retrieved user:1001:', user1);
  
  const session = await distributedCache.get('session:abc123');
  console.log('Retrieved session:', session);
  
  console.log('\n--- Node failure simulation ---');
  
  // Simulate node failure
  distributedCache.simulateNodeFailure('node-1');
  distributedCache.simulateNodeFailure('node-2');
  
  // Data should still be accessible due to replication
  const userAfterFailure = await distributedCache.get('user:1001');
  console.log('Retrieved user after node failures:', userAfterFailure);
  
  console.log('\n--- Node recovery simulation ---');
  
  // Recover nodes
  distributedCache.simulateNodeRecovery('node-1');
  distributedCache.simulateNodeRecovery('node-2');
  
  console.log('\n--- Cache invalidation ---');
  
  // Invalidate across all nodes
  await distributedCache.invalidate('user:1001');
  
  const invalidatedUser = await distributedCache.get('user:1001');
  console.log('User after invalidation:', invalidatedUser); // Should be null
  
  console.log('\n--- Load distribution test ---');
  
  // Test key distribution across nodes
  const keys = [];
  for (let i = 0; i < 20; i++) {
    keys.push(`test:${i}`);
  }
  
  console.log('Key distribution:');
  for (const key of keys) {
    const node = distributedCache.hashRing.getNode(key);
    console.log(`${key} -> node ${node ? node.id : 'none'}`);
  }
  
  console.log('\n--- Performance test ---');
  
  // Load test with concurrent operations
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < 100; i++) {
    promises.push(distributedCache.set(`load:${i}`, { value: i, timestamp: Date.now() }));
  }
  
  await Promise.all(promises);
  
  const writeTime = Date.now() - startTime;
  console.log(`Wrote 100 keys in ${writeTime}ms`);
  
  // Read test
  const readStart = Date.now();
  const readPromises = [];
  
  for (let i = 0; i < 100; i++) {
    readPromises.push(distributedCache.get(`load:${i}`));
  }
  
  await Promise.all(readPromises);
  
  const readTime = Date.now() - readStart;
  console.log(`Read 100 keys in ${readTime}ms`);
  
  console.log('\n--- Final system statistics ---');
  const stats = distributedCache.getStats();
  console.log('System Stats:', JSON.stringify(stats, null, 2));
}

// Export for use in other modules
module.exports = {
  CacheNode,
  ConsistentHashRing,
  DistributedCache,
  demonstrateDistributedCache
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateDistributedCache().catch(console.error);
}