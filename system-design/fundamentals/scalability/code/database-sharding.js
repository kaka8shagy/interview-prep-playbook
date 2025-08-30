/**
 * File: database-sharding.js
 * Description: Database sharding implementation with multiple partitioning strategies
 * 
 * Learning objectives:
 * - Understand different sharding strategies: range, hash, directory-based
 * - Learn consistent hashing for dynamic shard management
 * - See cross-shard query handling and data rebalancing
 * - Understand hot spot detection and shard splitting
 * 
 * Time Complexity: O(1) for shard lookup, O(N) for cross-shard queries
 * Space Complexity: O(N) where N is the number of shards and routing metadata
 */

const crypto = require('crypto');
const EventEmitter = require('events');

// Configuration constants for sharding behavior
const DEFAULT_SHARD_COUNT = 16;
const DEFAULT_REPLICATION_FACTOR = 3;
const HOT_SPOT_THRESHOLD = 1000; // requests per minute
const REBALANCE_THRESHOLD = 0.3; // 30% load difference triggers rebalancing
const VIRTUAL_NODES_PER_SHARD = 150; // For consistent hashing

/**
 * Database Sharding Manager with multiple partitioning strategies
 * Supports range-based, hash-based, and directory-based sharding
 */
class ShardManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Sharding configuration
    this.strategy = config.strategy || 'hash'; // hash, range, directory, consistent-hash
    this.shardCount = config.shardCount || DEFAULT_SHARD_COUNT;
    this.replicationFactor = config.replicationFactor || DEFAULT_REPLICATION_FACTOR;
    
    // Shard metadata storage
    this.shards = new Map(); // shard_id -> shard_metadata
    this.shardRing = []; // For consistent hashing
    this.virtualNodes = new Map(); // virtual_node -> shard_id
    this.rangeMap = []; // For range-based sharding
    this.directoryMap = new Map(); // For directory-based sharding
    
    // Performance monitoring
    this.shardMetrics = new Map(); // shard_id -> metrics
    this.queryStats = new Map(); // track cross-shard queries
    
    // Rebalancing state
    this.isRebalancing = false;
    this.rebalanceHistory = [];
    
    this.initializeShards();
    console.log(`ShardManager initialized: ${this.strategy} strategy, ${this.shardCount} shards`);
  }

  /**
   * Initialize shards based on the selected strategy
   */
  initializeShards() {
    // Create shard metadata
    for (let i = 0; i < this.shardCount; i++) {
      const shardId = `shard_${i.toString().padStart(3, '0')}`;
      
      this.shards.set(shardId, {
        id: shardId,
        index: i,
        status: 'active',
        replicas: [],
        connectionPool: null, // Would contain actual DB connections
        metadata: {
          recordCount: 0,
          dataSize: 0,
          lastAccessed: Date.now(),
          hotSpotScore: 0
        }
      });
      
      // Initialize metrics tracking
      this.shardMetrics.set(shardId, {
        queries: 0,
        writes: 0,
        reads: 0,
        errors: 0,
        avgResponseTime: 0,
        lastMinuteQueries: []
      });
    }
    
    // Initialize strategy-specific structures
    switch (this.strategy) {
      case 'hash':
        this.initializeHashSharding();
        break;
      case 'consistent-hash':
        this.initializeConsistentHashing();
        break;
      case 'range':
        this.initializeRangeSharding();
        break;
      case 'directory':
        this.initializeDirectorySharding();
        break;
    }
  }

  /**
   * Hash-based Sharding: Use hash function to determine shard
   * Simple and evenly distributed, but difficult to rebalance
   */
  initializeHashSharding() {
    // No additional setup needed - uses modulo arithmetic
    console.log('Hash-based sharding initialized');
  }

  /**
   * Consistent Hashing: Use hash ring with virtual nodes
   * Good for dynamic shard addition/removal with minimal data movement
   */
  initializeConsistentHashing() {
    const hashRing = [];
    
    // Create virtual nodes for each shard
    for (const [shardId, shard] of this.shards.entries()) {
      for (let v = 0; v < VIRTUAL_NODES_PER_SHARD; v++) {
        const virtualNodeId = `${shardId}_virtual_${v}`;
        const hash = this.calculateHash(virtualNodeId);
        
        hashRing.push({
          hash: hash,
          shardId: shardId,
          virtualNodeId: virtualNodeId
        });
        
        this.virtualNodes.set(virtualNodeId, shardId);
      }
    }
    
    // Sort ring by hash value
    this.shardRing = hashRing.sort((a, b) => a.hash - b.hash);
    
    console.log(`Consistent hashing initialized with ${this.shardRing.length} virtual nodes`);
  }

  /**
   * Range-based Sharding: Partition data based on key ranges
   * Good for range queries, but can create hot spots
   */
  initializeRangeSharding() {
    // Create initial range mappings (assuming string keys)
    // In practice, these ranges would be determined by data analysis
    const rangeSize = Math.floor(0xFFFFFFFF / this.shardCount);
    
    for (let i = 0; i < this.shardCount; i++) {
      const shardId = `shard_${i.toString().padStart(3, '0')}`;
      const rangeStart = i * rangeSize;
      const rangeEnd = (i === this.shardCount - 1) ? 0xFFFFFFFF : (i + 1) * rangeSize - 1;
      
      this.rangeMap.push({
        shardId: shardId,
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
        keyPrefix: this.numberToHex(rangeStart).substr(0, 2) // First 2 hex chars
      });
    }
    
    // Sort by range start for binary search
    this.rangeMap.sort((a, b) => a.rangeStart - b.rangeStart);
    
    console.log(`Range-based sharding initialized with ${this.rangeMap.length} ranges`);
  }

  /**
   * Directory-based Sharding: Use lookup table for shard mapping
   * Most flexible but requires additional lookup infrastructure
   */
  initializeDirectorySharding() {
    // Initialize empty directory - will be populated as data is inserted
    // In production, this would be backed by a distributed cache or database
    console.log('Directory-based sharding initialized (empty directory)');
  }

  /**
   * Determine which shard a key belongs to based on the sharding strategy
   */
  getShardForKey(key) {
    switch (this.strategy) {
      case 'hash':
        return this.getHashShard(key);
      case 'consistent-hash':
        return this.getConsistentHashShard(key);
      case 'range':
        return this.getRangeShard(key);
      case 'directory':
        return this.getDirectoryShard(key);
      default:
        throw new Error(`Unknown sharding strategy: ${this.strategy}`);
    }
  }

  /**
   * Hash-based shard selection using modulo arithmetic
   */
  getHashShard(key) {
    const hash = this.calculateHash(key);
    const shardIndex = hash % this.shardCount;
    const shardId = `shard_${shardIndex.toString().padStart(3, '0')}`;
    
    return {
      primary: shardId,
      replicas: this.getReplicaShards(shardId),
      strategy: 'hash',
      metadata: { hash, shardIndex }
    };
  }

  /**
   * Consistent hash-based shard selection
   */
  getConsistentHashShard(key) {
    const hash = this.calculateHash(key);
    
    // Find the first virtual node with hash >= key hash (clockwise on ring)
    let targetNode = this.shardRing.find(node => node.hash >= hash);
    
    // If no node found, wrap around to first node
    if (!targetNode) {
      targetNode = this.shardRing[0];
    }
    
    return {
      primary: targetNode.shardId,
      replicas: this.getReplicaShards(targetNode.shardId),
      strategy: 'consistent-hash',
      metadata: { hash, virtualNode: targetNode.virtualNodeId }
    };
  }

  /**
   * Range-based shard selection using binary search
   */
  getRangeShard(key) {
    const keyHash = this.calculateHash(key);
    
    // Binary search for the appropriate range
    let left = 0;
    let right = this.rangeMap.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const range = this.rangeMap[mid];
      
      if (keyHash >= range.rangeStart && keyHash <= range.rangeEnd) {
        return {
          primary: range.shardId,
          replicas: this.getReplicaShards(range.shardId),
          strategy: 'range',
          metadata: { keyHash, range: range }
        };
      } else if (keyHash < range.rangeStart) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    
    // Fallback to first shard (should not happen with proper range setup)
    const fallbackShard = this.rangeMap[0];
    return {
      primary: fallbackShard.shardId,
      replicas: this.getReplicaShards(fallbackShard.shardId),
      strategy: 'range',
      metadata: { keyHash, fallback: true }
    };
  }

  /**
   * Directory-based shard selection using lookup table
   */
  getDirectoryShard(key) {
    // Check if we have a direct mapping
    if (this.directoryMap.has(key)) {
      const shardId = this.directoryMap.get(key);
      return {
        primary: shardId,
        replicas: this.getReplicaShards(shardId),
        strategy: 'directory',
        metadata: { directLookup: true }
      };
    }
    
    // No direct mapping - use consistent hashing for new keys
    const fallback = this.getConsistentHashShard(key);
    
    // Store mapping for future lookups
    this.directoryMap.set(key, fallback.primary);
    
    return {
      ...fallback,
      strategy: 'directory',
      metadata: { ...fallback.metadata, newMapping: true }
    };
  }

  /**
   * Get replica shards for high availability
   * Replicas are selected to be on different physical nodes if possible
   */
  getReplicaShards(primaryShardId) {
    const replicas = [];
    const primaryIndex = parseInt(primaryShardId.split('_')[1]);
    
    for (let i = 1; i <= this.replicationFactor; i++) {
      const replicaIndex = (primaryIndex + i) % this.shardCount;
      const replicaId = `shard_${replicaIndex.toString().padStart(3, '0')}`;
      replicas.push(replicaId);
    }
    
    return replicas;
  }

  /**
   * Execute a query across multiple shards
   * Handles both single-shard and cross-shard operations
   */
  async executeQuery(query) {
    const startTime = Date.now();
    
    try {
      // Determine which shards are needed for this query
      const shardMapping = this.analyzeQuery(query);
      
      if (shardMapping.shards.length === 1) {
        // Single shard query - most common case
        return await this.executeSingleShardQuery(query, shardMapping.shards[0]);
      } else {
        // Cross-shard query - more complex
        return await this.executeCrossShardQuery(query, shardMapping);
      }
      
    } catch (error) {
      this.recordQueryError(query, error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.recordQueryMetrics(query, duration);
    }
  }

  /**
   * Analyze query to determine which shards are involved
   */
  analyzeQuery(query) {
    const operation = query.operation; // 'insert', 'select', 'update', 'delete'
    const table = query.table;
    const conditions = query.conditions || {};
    
    if (query.key) {
      // Single key operation
      const shard = this.getShardForKey(query.key);
      return {
        type: 'single-key',
        shards: [shard.primary],
        replicas: shard.replicas,
        metadata: shard.metadata
      };
    }
    
    if (query.keys && Array.isArray(query.keys)) {
      // Multi-key operation
      const shardSet = new Set();
      const shardMappings = [];
      
      for (const key of query.keys) {
        const shard = this.getShardForKey(key);
        shardSet.add(shard.primary);
        shardMappings.push({ key, shard: shard.primary });
      }
      
      return {
        type: 'multi-key',
        shards: Array.from(shardSet),
        keyMappings: shardMappings
      };
    }
    
    if (query.range) {
      // Range query - may span multiple shards
      return this.analyzeRangeQuery(query.range);
    }
    
    // Full table scan or complex query - involves all shards
    return {
      type: 'full-scan',
      shards: Array.from(this.shards.keys())
    };
  }

  /**
   * Execute query on a single shard
   */
  async executeSingleShardQuery(query, shardId) {
    const shard = this.shards.get(shardId);
    if (!shard || shard.status !== 'active') {
      throw new Error(`Shard ${shardId} is not available`);
    }
    
    // Record shard access for hot spot detection
    this.recordShardAccess(shardId);
    
    // Simulate database operation
    const result = await this.simulateShardQuery(shard, query);
    
    // Update shard metadata
    this.updateShardMetadata(shardId, query, result);
    
    return {
      success: true,
      shardId: shardId,
      result: result,
      queryType: 'single-shard'
    };
  }

  /**
   * Execute query across multiple shards
   * Requires coordination and result aggregation
   */
  async executeCrossShardQuery(query, shardMapping) {
    const shardQueries = [];
    const results = [];
    
    // Prepare individual shard queries
    for (const shardId of shardMapping.shards) {
      const shardQuery = this.prepareShardQuery(query, shardId, shardMapping);
      shardQueries.push(
        this.executeSingleShardQuery(shardQuery, shardId)
          .catch(error => ({ error, shardId }))
      );
    }
    
    // Execute all shard queries in parallel
    const shardResults = await Promise.all(shardQueries);
    
    // Check for errors
    const errors = shardResults.filter(r => r.error);
    if (errors.length > 0) {
      throw new Error(`Cross-shard query failed on ${errors.length} shards: ${errors.map(e => e.shardId).join(', ')}`);
    }
    
    // Aggregate results
    const aggregatedResult = this.aggregateShardResults(query, shardResults);
    
    // Record cross-shard query statistics
    this.recordCrossShardQuery(shardMapping.shards.length, query.operation);
    
    return {
      success: true,
      shards: shardMapping.shards,
      result: aggregatedResult,
      queryType: 'cross-shard'
    };
  }

  /**
   * Analyze range queries to determine affected shards
   */
  analyzeRangeQuery(range) {
    if (this.strategy === 'range') {
      // Range sharding is optimized for range queries
      const startHash = this.calculateHash(range.start);
      const endHash = this.calculateHash(range.end);
      
      const affectedShards = this.rangeMap.filter(r => 
        (r.rangeStart <= endHash && r.rangeEnd >= startHash)
      ).map(r => r.shardId);
      
      return {
        type: 'range-optimized',
        shards: affectedShards
      };
    } else {
      // Other strategies require checking all shards for range queries
      return {
        type: 'range-scan',
        shards: Array.from(this.shards.keys())
      };
    }
  }

  // ========================
  // Shard Management Operations
  // ========================

  /**
   * Add a new shard to the cluster
   * Requires data rebalancing for consistent distribution
   */
  async addShard(shardConfig = {}) {
    if (this.isRebalancing) {
      throw new Error('Cannot add shard during rebalancing operation');
    }
    
    const newShardIndex = this.shardCount;
    const newShardId = `shard_${newShardIndex.toString().padStart(3, '0')}`;
    
    // Create new shard metadata
    this.shards.set(newShardId, {
      id: newShardId,
      index: newShardIndex,
      status: 'initializing',
      replicas: [],
      connectionPool: null,
      metadata: {
        recordCount: 0,
        dataSize: 0,
        lastAccessed: Date.now(),
        hotSpotScore: 0
      }
    });
    
    this.shardMetrics.set(newShardId, {
      queries: 0,
      writes: 0,
      reads: 0,
      errors: 0,
      avgResponseTime: 0,
      lastMinuteQueries: []
    });
    
    this.shardCount++;
    
    // Update strategy-specific structures
    await this.rebalanceAfterShardAddition(newShardId);
    
    // Mark shard as active
    this.shards.get(newShardId).status = 'active';
    
    console.log(`Shard ${newShardId} added successfully`);
    this.emit('shard_added', { shardId: newShardId });
    
    return newShardId;
  }

  /**
   * Remove a shard from the cluster
   * Requires data migration to remaining shards
   */
  async removeShard(shardId) {
    if (this.isRebalancing) {
      throw new Error('Cannot remove shard during rebalancing operation');
    }
    
    const shard = this.shards.get(shardId);
    if (!shard) {
      throw new Error(`Shard ${shardId} not found`);
    }
    
    if (this.shardCount <= 2) {
      throw new Error('Cannot remove shard - minimum 2 shards required');
    }
    
    // Mark shard for removal
    shard.status = 'draining';
    
    // Migrate data to other shards
    await this.migrateShardData(shardId);
    
    // Remove from data structures
    this.shards.delete(shardId);
    this.shardMetrics.delete(shardId);
    this.shardCount--;
    
    // Update strategy-specific structures
    await this.rebalanceAfterShardRemoval(shardId);
    
    console.log(`Shard ${shardId} removed successfully`);
    this.emit('shard_removed', { shardId });
  }

  /**
   * Rebalance data after shard addition
   */
  async rebalanceAfterShardAddition(newShardId) {
    this.isRebalancing = true;
    
    try {
      switch (this.strategy) {
        case 'consistent-hash':
          await this.rebalanceConsistentHash(newShardId, 'add');
          break;
        case 'hash':
          await this.rebalanceHashSharding();
          break;
        case 'range':
          await this.rebalanceRangeSharding();
          break;
        case 'directory':
          // Directory-based doesn't require immediate rebalancing
          break;
      }
    } finally {
      this.isRebalancing = false;
    }
  }

  /**
   * Rebalance consistent hash ring after adding new shard
   */
  async rebalanceConsistentHash(shardId, operation) {
    if (operation === 'add') {
      // Add virtual nodes for new shard
      for (let v = 0; v < VIRTUAL_NODES_PER_SHARD; v++) {
        const virtualNodeId = `${shardId}_virtual_${v}`;
        const hash = this.calculateHash(virtualNodeId);
        
        this.shardRing.push({
          hash: hash,
          shardId: shardId,
          virtualNodeId: virtualNodeId
        });
        
        this.virtualNodes.set(virtualNodeId, shardId);
      }
      
      // Re-sort ring
      this.shardRing.sort((a, b) => a.hash - b.hash);
      
      console.log(`Added ${VIRTUAL_NODES_PER_SHARD} virtual nodes for ${shardId}`);
    }
  }

  // ========================
  // Hot Spot Detection and Management
  // ========================

  /**
   * Record shard access for hot spot detection
   */
  recordShardAccess(shardId) {
    const now = Date.now();
    const metrics = this.shardMetrics.get(shardId);
    
    if (metrics) {
      metrics.queries++;
      metrics.lastMinuteQueries.push(now);
      
      // Clean old entries (older than 1 minute)
      const oneMinuteAgo = now - 60000;
      metrics.lastMinuteQueries = metrics.lastMinuteQueries.filter(time => time > oneMinuteAgo);
      
      // Update hot spot score
      const shard = this.shards.get(shardId);
      if (shard) {
        shard.metadata.hotSpotScore = metrics.lastMinuteQueries.length;
        shard.metadata.lastAccessed = now;
        
        // Detect hot spot
        if (shard.metadata.hotSpotScore > HOT_SPOT_THRESHOLD) {
          this.handleHotSpot(shardId);
        }
      }
    }
  }

  /**
   * Handle detected hot spot by implementing mitigation strategies
   */
  handleHotSpot(shardId) {
    console.warn(`Hot spot detected on shard ${shardId} (${this.shards.get(shardId).metadata.hotSpotScore} queries/min)`);
    
    this.emit('hot_spot_detected', {
      shardId: shardId,
      score: this.shards.get(shardId).metadata.hotSpotScore,
      strategy: this.suggestHotSpotMitigation(shardId)
    });
  }

  /**
   * Suggest hot spot mitigation strategies
   */
  suggestHotSpotMitigation(shardId) {
    const strategies = [];
    
    // Strategy 1: Add read replicas
    strategies.push({
      type: 'add_read_replicas',
      description: 'Add additional read replicas to distribute read load',
      effort: 'low'
    });
    
    // Strategy 2: Split shard
    if (this.strategy === 'range') {
      strategies.push({
        type: 'split_shard',
        description: 'Split the shard range to distribute load',
        effort: 'high'
      });
    }
    
    // Strategy 3: Cache frequently accessed data
    strategies.push({
      type: 'add_caching',
      description: 'Implement caching layer for frequently accessed data',
      effort: 'medium'
    });
    
    return strategies;
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Calculate hash value for a given key
   */
  calculateHash(key) {
    return parseInt(
      crypto.createHash('md5')
        .update(key.toString())
        .digest('hex')
        .substring(0, 8), 
      16
    );
  }

  /**
   * Convert number to hexadecimal string
   */
  numberToHex(num) {
    return num.toString(16).padStart(8, '0');
  }

  /**
   * Simulate database query execution
   */
  async simulateShardQuery(shard, query) {
    // Simulate network latency and processing time
    const baseLatency = 10 + Math.random() * 50; // 10-60ms
    const processingTime = query.complexity ? query.complexity * 5 : 20;
    const totalTime = baseLatency + processingTime;
    
    await new Promise(resolve => setTimeout(resolve, totalTime));
    
    // Update shard metadata based on query type
    if (query.operation === 'insert' || query.operation === 'update') {
      shard.metadata.recordCount += query.recordCount || 1;
      shard.metadata.dataSize += query.dataSize || 1024;
    }
    
    // Simulate query result
    return {
      rows: query.operation === 'select' ? Math.floor(Math.random() * 100) : 1,
      affected: query.operation !== 'select' ? query.recordCount || 1 : 0,
      executionTime: totalTime
    };
  }

  /**
   * Prepare query for execution on specific shard
   */
  prepareShardQuery(originalQuery, shardId, shardMapping) {
    const shardQuery = { ...originalQuery };
    
    if (shardMapping.type === 'multi-key') {
      // Filter keys that belong to this shard
      const shardKeys = shardMapping.keyMappings
        .filter(mapping => mapping.shard === shardId)
        .map(mapping => mapping.key);
      
      shardQuery.keys = shardKeys;
    }
    
    return shardQuery;
  }

  /**
   * Aggregate results from multiple shards
   */
  aggregateShardResults(query, shardResults) {
    const aggregated = {
      totalRows: 0,
      totalAffected: 0,
      maxExecutionTime: 0,
      shardCount: shardResults.length
    };
    
    for (const shardResult of shardResults) {
      if (shardResult.result) {
        aggregated.totalRows += shardResult.result.rows || 0;
        aggregated.totalAffected += shardResult.result.affected || 0;
        aggregated.maxExecutionTime = Math.max(
          aggregated.maxExecutionTime,
          shardResult.result.executionTime || 0
        );
      }
    }
    
    return aggregated;
  }

  /**
   * Get comprehensive shard statistics
   */
  getShardStats() {
    const stats = {
      totalShards: this.shardCount,
      strategy: this.strategy,
      isRebalancing: this.isRebalancing,
      shards: {},
      hotSpots: [],
      performance: {
        totalQueries: 0,
        crossShardQueries: 0,
        avgResponseTime: 0
      }
    };
    
    for (const [shardId, shard] of this.shards.entries()) {
      const metrics = this.shardMetrics.get(shardId);
      
      stats.shards[shardId] = {
        status: shard.status,
        recordCount: shard.metadata.recordCount,
        dataSize: shard.metadata.dataSize,
        hotSpotScore: shard.metadata.hotSpotScore,
        queries: metrics.queries,
        writes: metrics.writes,
        reads: metrics.reads,
        errors: metrics.errors,
        avgResponseTime: metrics.avgResponseTime
      };
      
      stats.performance.totalQueries += metrics.queries;
      
      if (shard.metadata.hotSpotScore > HOT_SPOT_THRESHOLD * 0.5) {
        stats.hotSpots.push({
          shardId: shardId,
          score: shard.metadata.hotSpotScore
        });
      }
    }
    
    return stats;
  }

  /**
   * Update shard metadata after query execution
   */
  updateShardMetadata(shardId, query, result) {
    const metrics = this.shardMetrics.get(shardId);
    if (metrics && result.executionTime) {
      metrics.avgResponseTime = (metrics.avgResponseTime + result.executionTime) / 2;
      
      if (query.operation === 'select') {
        metrics.reads++;
      } else {
        metrics.writes++;
      }
    }
  }

  /**
   * Record cross-shard query statistics
   */
  recordCrossShardQuery(shardCount, operation) {
    if (!this.queryStats.has('cross_shard')) {
      this.queryStats.set('cross_shard', { count: 0, operations: {} });
    }
    
    const crossShardStats = this.queryStats.get('cross_shard');
    crossShardStats.count++;
    
    if (!crossShardStats.operations[operation]) {
      crossShardStats.operations[operation] = 0;
    }
    crossShardStats.operations[operation]++;
  }

  /**
   * Record query error for monitoring
   */
  recordQueryError(query, error) {
    console.error(`Query error: ${error.message}`, { query });
    this.emit('query_error', { query, error });
  }

  /**
   * Record general query metrics
   */
  recordQueryMetrics(query, duration) {
    // Implementation would depend on monitoring system
    this.emit('query_completed', { 
      operation: query.operation,
      duration: duration,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Simulate data migration between shards
   */
  async migrateShardData(fromShardId) {
    console.log(`Migrating data from shard ${fromShardId}...`);
    
    // In a real implementation, this would:
    // 1. Identify all data in the source shard
    // 2. Determine new shard locations based on sharding strategy
    // 3. Copy data to destination shards
    // 4. Verify data integrity
    // 5. Update routing information
    // 6. Remove data from source shard
    
    // Simulate migration time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Data migration from shard ${fromShardId} completed`);
  }

  // Placeholder methods for rebalancing operations
  async rebalanceHashSharding() { /* Implementation for hash-based rebalancing */ }
  async rebalanceRangeSharding() { /* Implementation for range-based rebalancing */ }
  async rebalanceAfterShardRemoval(shardId) { /* Implementation for removal rebalancing */ }
}

// ========================
// Usage Examples and Testing
// ========================

/**
 * Demonstrate different sharding strategies
 */
async function demonstrateSharding() {
  console.log('=== Database Sharding Demonstration ===');
  
  // Test hash-based sharding
  console.log('\n--- Hash-based Sharding ---');
  const hashShardManager = new ShardManager({
    strategy: 'hash',
    shardCount: 8
  });
  
  const testKeys = ['user_123', 'user_456', 'user_789', 'order_abc', 'product_xyz'];
  
  for (const key of testKeys) {
    const shard = hashShardManager.getShardForKey(key);
    console.log(`Key "${key}" -> Shard: ${shard.primary}`);
  }
  
  // Test consistent hashing
  console.log('\n--- Consistent Hashing ---');
  const consistentShardManager = new ShardManager({
    strategy: 'consistent-hash',
    shardCount: 6
  });
  
  for (const key of testKeys) {
    const shard = consistentShardManager.getShardForKey(key);
    console.log(`Key "${key}" -> Shard: ${shard.primary} (Virtual: ${shard.metadata.virtualNode})`);
  }
  
  // Test adding shard to consistent hash ring
  console.log('\n--- Adding Shard to Consistent Hash ---');
  await consistentShardManager.addShard();
  
  console.log('After adding shard:');
  for (const key of testKeys) {
    const shard = consistentShardManager.getShardForKey(key);
    console.log(`Key "${key}" -> Shard: ${shard.primary}`);
  }
  
  // Test query execution
  console.log('\n--- Query Execution ---');
  const queryResult = await hashShardManager.executeQuery({
    operation: 'select',
    table: 'users',
    key: 'user_123',
    complexity: 5
  });
  
  console.log('Single-shard query result:', queryResult);
  
  // Test cross-shard query
  const crossShardResult = await hashShardManager.executeQuery({
    operation: 'select',
    table: 'users',
    keys: ['user_123', 'user_456', 'user_789'],
    complexity: 10
  });
  
  console.log('Cross-shard query result:', crossShardResult);
  
  // Show statistics
  console.log('\n--- Shard Statistics ---');
  const stats = hashShardManager.getShardStats();
  console.log(`Total shards: ${stats.totalShards}`);
  console.log(`Strategy: ${stats.strategy}`);
  console.log(`Total queries: ${stats.performance.totalQueries}`);
}

// Export for use in other modules
module.exports = { 
  ShardManager,
  DEFAULT_SHARD_COUNT,
  HOT_SPOT_THRESHOLD,
  demonstrateSharding
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateSharding().catch(console.error);
}