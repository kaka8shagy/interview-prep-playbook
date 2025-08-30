/**
 * File: failover-system.js
 * Description: Automatic failover system with leader election and graceful degradation
 * 
 * Learning objectives:
 * - Understand leader election algorithms and consensus mechanisms
 * - Learn automatic failover patterns and split-brain prevention
 * - See graceful degradation and service mesh integration
 * - Understand failover coordination and state management
 * 
 * Time Complexity: O(N) for leader election, O(1) for failover decisions
 * Space Complexity: O(N) where N is the number of nodes in the cluster
 */

const EventEmitter = require('events');
const crypto = require('crypto');

// Failover system constants
const DEFAULT_HEARTBEAT_INTERVAL = 5000; // 5 seconds
const DEFAULT_ELECTION_TIMEOUT = 15000; // 15 seconds
const DEFAULT_LEADER_LEASE_TTL = 30000; // 30 seconds
const DEFAULT_HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const DEFAULT_FAILOVER_COOLDOWN = 60000; // 1 minute cooldown between failovers

// Node states in the cluster
const NODE_STATES = {
  FOLLOWER: 'follower',
  CANDIDATE: 'candidate',
  LEADER: 'leader',
  INACTIVE: 'inactive'
};

// Failover trigger types
const FAILOVER_TRIGGERS = {
  HEALTH_CHECK_FAILURE: 'health_check_failure',
  HEARTBEAT_TIMEOUT: 'heartbeat_timeout',
  MANUAL_TRIGGER: 'manual_trigger',
  RESOURCE_EXHAUSTION: 'resource_exhaustion',
  NETWORK_PARTITION: 'network_partition'
};

/**
 * Cluster Node representing a single node in a failover cluster
 * Implements leader election and maintains cluster membership
 */
class ClusterNode extends EventEmitter {
  constructor(nodeId, options = {}) {
    super();
    
    this.nodeId = nodeId;
    this.clusterId = options.clusterId || 'default';
    this.state = NODE_STATES.FOLLOWER;
    this.term = 0; // Current election term (Raft-style)
    this.votedFor = null;
    this.leaderId = null;
    this.lastHeartbeat = Date.now();
    
    // Configuration
    this.heartbeatInterval = options.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL;
    this.electionTimeout = options.electionTimeout || DEFAULT_ELECTION_TIMEOUT;
    this.leaderLeaseTTL = options.leaderLeaseTTL || DEFAULT_LEADER_LEASE_TTL;
    this.priority = options.priority || Math.random(); // For tie-breaking in elections
    
    // Cluster membership
    this.clusterNodes = new Map(); // nodeId -> node info
    this.quorumSize = Math.floor((options.clusterSize || 3) / 2) + 1;
    
    // Timers
    this.heartbeatTimer = null;
    this.electionTimer = null;
    this.leadershipTimer = null;
    
    // Metrics and monitoring
    this.metrics = {
      totalElections: 0,
      timesElectedLeader: 0,
      totalFailovers: 0,
      averageElectionTime: 0,
      uptime: Date.now()
    };
    
    console.log(`Cluster node initialized: ${this.nodeId} (cluster: ${this.clusterId})`);
  }

  /**
   * Join the cluster and start participating in leader election
   */
  async joinCluster(seedNodes = []) {
    console.log(`[${this.nodeId}] Joining cluster with ${seedNodes.length} seed nodes`);
    
    // Add seed nodes to cluster membership
    for (const seedNode of seedNodes) {
      this.addClusterNode(seedNode);
    }
    
    // Add self to cluster
    this.addClusterNode({
      nodeId: this.nodeId,
      priority: this.priority,
      state: this.state,
      lastSeen: Date.now()
    });
    
    // Start heartbeat and election processes
    this.startHeartbeat();
    this.resetElectionTimer();
    
    this.emit('cluster_joined', {
      nodeId: this.nodeId,
      clusterId: this.clusterId,
      clusterSize: this.clusterNodes.size
    });
  }

  /**
   * Leave the cluster gracefully
   */
  async leaveCluster() {
    console.log(`[${this.nodeId}] Leaving cluster`);
    
    // Step down if leader
    if (this.state === NODE_STATES.LEADER) {
      await this.stepDown();
    }
    
    // Stop all timers
    this.stopAllTimers();
    
    // Mark as inactive
    this.state = NODE_STATES.INACTIVE;
    
    // Notify cluster of departure
    this.broadcastMessage({
      type: 'node_leaving',
      nodeId: this.nodeId,
      term: this.term
    });
    
    this.emit('cluster_left', { nodeId: this.nodeId });
  }

  /**
   * Add or update cluster node information
   */
  addClusterNode(nodeInfo) {
    this.clusterNodes.set(nodeInfo.nodeId, {
      ...nodeInfo,
      lastSeen: Date.now()
    });
    
    // Update quorum size based on cluster size
    this.quorumSize = Math.floor(this.clusterNodes.size / 2) + 1;
    
    console.log(`[${this.nodeId}] Updated cluster membership: ${this.clusterNodes.size} nodes`);
  }

  /**
   * Start heartbeat process (for leaders)
   */
  startHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    
    this.heartbeatTimer = setInterval(() => {
      if (this.state === NODE_STATES.LEADER) {
        this.sendHeartbeat();
      }
    }, this.heartbeatInterval);
  }

  /**
   * Send heartbeat to all followers
   */
  sendHeartbeat() {
    const heartbeat = {
      type: 'heartbeat',
      leaderId: this.nodeId,
      term: this.term,
      timestamp: Date.now()
    };
    
    console.log(`[${this.nodeId}] Sending heartbeat (term: ${this.term})`);
    this.broadcastMessage(heartbeat);
    
    this.emit('heartbeat_sent', heartbeat);
  }

  /**
   * Reset election timer with random jitter to prevent simultaneous elections
   */
  resetElectionTimer() {
    if (this.electionTimer) {
      clearTimeout(this.electionTimer);
    }
    
    // Add random jitter to prevent split votes
    const jitter = Math.random() * this.electionTimeout * 0.5;
    const timeout = this.electionTimeout + jitter;
    
    this.electionTimer = setTimeout(() => {
      this.startElection();
    }, timeout);
  }

  /**
   * Start leader election process
   */
  async startElection() {
    if (this.state === NODE_STATES.INACTIVE) {
      return;
    }
    
    console.log(`[${this.nodeId}] Starting election (term: ${this.term + 1})`);
    
    const electionStartTime = Date.now();
    
    // Transition to candidate state
    this.state = NODE_STATES.CANDIDATE;
    this.term++;
    this.votedFor = this.nodeId;
    this.metrics.totalElections++;
    
    // Vote for self
    const votes = new Set([this.nodeId]);
    
    // Request votes from other nodes
    const voteRequest = {
      type: 'vote_request',
      candidateId: this.nodeId,
      term: this.term,
      priority: this.priority,
      timestamp: Date.now()
    };
    
    console.log(`[${this.nodeId}] Requesting votes for term ${this.term}`);
    
    // In a real implementation, this would be actual network communication
    const voteResponses = await this.requestVotes(voteRequest);
    
    // Count votes
    for (const response of voteResponses) {
      if (response.voteGranted && response.term === this.term) {
        votes.add(response.nodeId);
      }
    }
    
    console.log(`[${this.nodeId}] Election results: ${votes.size}/${this.clusterNodes.size} votes (need ${this.quorumSize})`);
    
    // Check if won election
    if (votes.size >= this.quorumSize) {
      await this.becomeLeader();
      
      const electionTime = Date.now() - electionStartTime;
      this.updateAverageElectionTime(electionTime);
      
    } else {
      // Election failed, return to follower state
      console.log(`[${this.nodeId}] Election failed, returning to follower state`);
      this.state = NODE_STATES.FOLLOWER;
      this.resetElectionTimer();
    }
    
    this.emit('election_completed', {
      nodeId: this.nodeId,
      term: this.term,
      votes: votes.size,
      won: votes.size >= this.quorumSize,
      electionTime: Date.now() - electionStartTime
    });
  }

  /**
   * Become the cluster leader
   */
  async becomeLeader() {
    console.log(`[${this.nodeId}] Became leader for term ${this.term}`);
    
    this.state = NODE_STATES.LEADER;
    this.leaderId = this.nodeId;
    this.metrics.timesElectedLeader++;
    
    // Start sending heartbeats immediately
    this.sendHeartbeat();
    
    // Set leadership lease timer
    this.leadershipTimer = setTimeout(() => {
      console.log(`[${this.nodeId}] Leadership lease expired, stepping down`);
      this.stepDown();
    }, this.leaderLeaseTTL);
    
    // Notify cluster of new leadership
    this.broadcastMessage({
      type: 'leader_announcement',
      leaderId: this.nodeId,
      term: this.term,
      timestamp: Date.now()
    });
    
    this.emit('became_leader', {
      nodeId: this.nodeId,
      term: this.term,
      clusterSize: this.clusterNodes.size
    });
  }

  /**
   * Step down from leadership
   */
  async stepDown() {
    if (this.state !== NODE_STATES.LEADER) {
      return;
    }
    
    console.log(`[${this.nodeId}] Stepping down from leadership`);
    
    this.state = NODE_STATES.FOLLOWER;
    this.leaderId = null;
    
    // Clear leadership timer
    if (this.leadershipTimer) {
      clearTimeout(this.leadershipTimer);
      this.leadershipTimer = null;
    }
    
    // Reset election timer
    this.resetElectionTimer();
    
    // Notify cluster
    this.broadcastMessage({
      type: 'leader_stepdown',
      nodeId: this.nodeId,
      term: this.term,
      timestamp: Date.now()
    });
    
    this.emit('stepped_down', {
      nodeId: this.nodeId,
      term: this.term
    });
  }

  /**
   * Process incoming message from other cluster nodes
   */
  async processMessage(message) {
    switch (message.type) {
      case 'heartbeat':
        await this.handleHeartbeat(message);
        break;
        
      case 'vote_request':
        return await this.handleVoteRequest(message);
        
      case 'leader_announcement':
        await this.handleLeaderAnnouncement(message);
        break;
        
      case 'leader_stepdown':
        await this.handleLeaderStepdown(message);
        break;
        
      case 'node_leaving':
        await this.handleNodeLeaving(message);
        break;
        
      default:
        console.log(`[${this.nodeId}] Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle heartbeat from leader
   */
  async handleHeartbeat(message) {
    if (message.term >= this.term) {
      this.term = message.term;
      this.leaderId = message.leaderId;
      this.lastHeartbeat = Date.now();
      
      // Return to follower state if we were candidate/leader
      if (this.state !== NODE_STATES.FOLLOWER) {
        console.log(`[${this.nodeId}] Received heartbeat from leader ${message.leaderId}, becoming follower`);
        this.state = NODE_STATES.FOLLOWER;
      }
      
      // Reset election timer since we heard from leader
      this.resetElectionTimer();
    }
  }

  /**
   * Handle vote request during election
   */
  async handleVoteRequest(message) {
    console.log(`[${this.nodeId}] Received vote request from ${message.candidateId} for term ${message.term}`);
    
    let voteGranted = false;
    
    // Grant vote if:
    // 1. Term is greater than our current term, OR
    // 2. Same term and we haven't voted, OR we voted for this candidate
    // 3. Candidate has higher priority (tie-breaking)
    if (message.term > this.term || 
        (message.term === this.term && 
         (this.votedFor === null || this.votedFor === message.candidateId))) {
      
      // Additional check: candidate priority for tie-breaking
      if (message.term > this.term || message.priority >= this.priority) {
        voteGranted = true;
        this.term = message.term;
        this.votedFor = message.candidateId;
        
        console.log(`[${this.nodeId}] Voted for ${message.candidateId} in term ${message.term}`);
      }
    }
    
    return {
      type: 'vote_response',
      nodeId: this.nodeId,
      term: this.term,
      voteGranted: voteGranted,
      candidateId: message.candidateId
    };
  }

  /**
   * Handle leader announcement
   */
  async handleLeaderAnnouncement(message) {
    if (message.term >= this.term) {
      console.log(`[${this.nodeId}] Acknowledged leader ${message.leaderId} for term ${message.term}`);
      
      this.term = message.term;
      this.leaderId = message.leaderId;
      this.state = NODE_STATES.FOLLOWER;
      this.lastHeartbeat = Date.now();
      
      // Reset election timer
      this.resetElectionTimer();
    }
  }

  /**
   * Handle leader stepdown notification
   */
  async handleLeaderStepdown(message) {
    if (message.nodeId === this.leaderId) {
      console.log(`[${this.nodeId}] Leader ${message.nodeId} stepped down`);
      
      this.leaderId = null;
      
      // Trigger new election after short delay
      setTimeout(() => {
        if (this.state === NODE_STATES.FOLLOWER && !this.leaderId) {
          this.startElection();
        }
      }, Math.random() * 1000); // Random delay to prevent simultaneous elections
    }
  }

  /**
   * Handle node leaving cluster
   */
  async handleNodeLeaving(message) {
    console.log(`[${this.nodeId}] Node ${message.nodeId} leaving cluster`);
    
    this.clusterNodes.delete(message.nodeId);
    this.quorumSize = Math.floor(this.clusterNodes.size / 2) + 1;
    
    // If the leaving node was the leader, trigger election
    if (message.nodeId === this.leaderId) {
      this.leaderId = null;
      setTimeout(() => this.startElection(), Math.random() * 1000);
    }
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Simulate requesting votes from other nodes
   */
  async requestVotes(voteRequest) {
    // In a real implementation, this would send network requests
    // For simulation, we'll mock responses based on node priorities
    const responses = [];
    
    for (const [nodeId, nodeInfo] of this.clusterNodes) {
      if (nodeId !== this.nodeId) {
        const mockResponse = {
          type: 'vote_response',
          nodeId: nodeId,
          term: voteRequest.term,
          voteGranted: voteRequest.priority > (nodeInfo.priority || 0.5),
          candidateId: this.nodeId
        };
        responses.push(mockResponse);
      }
    }
    
    return responses;
  }

  /**
   * Simulate broadcasting message to all cluster nodes
   */
  broadcastMessage(message) {
    // In a real implementation, this would send network messages
    console.log(`[${this.nodeId}] Broadcasting ${message.type} to ${this.clusterNodes.size - 1} nodes`);
    
    this.emit('message_broadcast', {
      nodeId: this.nodeId,
      messageType: message.type,
      recipients: this.clusterNodes.size - 1
    });
  }

  /**
   * Update average election time metric
   */
  updateAverageElectionTime(electionTime) {
    const totalElections = this.metrics.totalElections;
    this.metrics.averageElectionTime = 
      (this.metrics.averageElectionTime * (totalElections - 1) + electionTime) / totalElections;
  }

  /**
   * Stop all timers
   */
  stopAllTimers() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.electionTimer) {
      clearTimeout(this.electionTimer);
      this.electionTimer = null;
    }
    
    if (this.leadershipTimer) {
      clearTimeout(this.leadershipTimer);
      this.leadershipTimer = null;
    }
  }

  /**
   * Get current node status
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      clusterId: this.clusterId,
      state: this.state,
      term: this.term,
      leaderId: this.leaderId,
      priority: this.priority,
      clusterSize: this.clusterNodes.size,
      quorumSize: this.quorumSize,
      lastHeartbeat: this.lastHeartbeat,
      metrics: {
        ...this.metrics,
        uptimeSeconds: Math.floor((Date.now() - this.metrics.uptime) / 1000)
      }
    };
  }
}

/**
 * Failover Coordinator - manages multiple services with automatic failover
 * Integrates with health checking and implements graceful degradation
 */
class FailoverCoordinator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.coordinatorId = options.coordinatorId || this.generateId();
    this.services = new Map(); // serviceName -> service config
    this.serviceStates = new Map(); // serviceName -> current state
    this.failoverPolicies = new Map(); // serviceName -> failover policy
    
    // Configuration
    this.healthCheckInterval = options.healthCheckInterval || DEFAULT_HEALTH_CHECK_INTERVAL;
    this.failoverCooldown = options.failoverCooldown || DEFAULT_FAILOVER_COOLDOWN;
    this.enableGracefulDegradation = options.enableGracefulDegradation !== false;
    
    // State tracking
    this.activeFailovers = new Map(); // serviceName -> failover info
    this.lastFailoverTime = new Map(); // serviceName -> timestamp
    this.failoverHistory = [];
    
    // Metrics
    this.metrics = {
      totalFailovers: 0,
      successfulFailovers: 0,
      failedFailovers: 0,
      averageFailoverTime: 0,
      servicesMonitored: 0
    };
    
    // Timers
    this.healthCheckTimer = null;
    
    console.log(`Failover Coordinator initialized: ${this.coordinatorId}`);
  }

  /**
   * Register a service for failover monitoring
   */
  registerService(serviceName, config) {
    if (this.services.has(serviceName)) {
      throw new Error(`Service ${serviceName} already registered`);
    }
    
    const serviceConfig = {
      name: serviceName,
      primaryEndpoint: config.primaryEndpoint,
      secondaryEndpoints: config.secondaryEndpoints || [],
      healthCheckUrl: config.healthCheckUrl || config.primaryEndpoint + '/health',
      healthCheckTimeout: config.healthCheckTimeout || 5000,
      failoverPolicy: config.failoverPolicy || 'automatic',
      criticality: config.criticality || 'important',
      gracefulDegradation: config.gracefulDegradation || null,
      ...config
    };
    
    this.services.set(serviceName, serviceConfig);
    this.serviceStates.set(serviceName, {
      status: 'unknown',
      currentEndpoint: serviceConfig.primaryEndpoint,
      consecutiveFailures: 0,
      lastHealthCheck: null,
      failoverCount: 0
    });
    
    // Set default failover policy
    this.failoverPolicies.set(serviceName, {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5000,
      healthCheckThreshold: config.healthCheckThreshold || 3,
      autoRevert: config.autoRevert !== false,
      revertCheckInterval: config.revertCheckInterval || 30000
    });
    
    this.metrics.servicesMonitored++;
    
    console.log(`Registered service: ${serviceName} (${serviceConfig.secondaryEndpoints.length} backup endpoints)`);
    
    this.emit('service_registered', {
      serviceName,
      primaryEndpoint: serviceConfig.primaryEndpoint,
      backupCount: serviceConfig.secondaryEndpoints.length
    });
  }

  /**
   * Start monitoring all registered services
   */
  startMonitoring() {
    if (this.healthCheckTimer) {
      console.warn('Monitoring already started');
      return;
    }
    
    console.log(`Starting failover monitoring for ${this.services.size} services`);
    
    // Perform initial health checks
    this.performHealthChecks();
    
    // Schedule recurring health checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);
    
    this.emit('monitoring_started', {
      coordinatorId: this.coordinatorId,
      servicesCount: this.services.size
    });
  }

  /**
   * Stop monitoring all services
   */
  stopMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    console.log('Stopped failover monitoring');
    this.emit('monitoring_stopped', { coordinatorId: this.coordinatorId });
  }

  /**
   * Perform health checks for all registered services
   */
  async performHealthChecks() {
    const healthCheckPromises = [];
    
    for (const [serviceName, serviceConfig] of this.services) {
      healthCheckPromises.push(
        this.checkServiceHealth(serviceName).catch(error => {
          console.error(`Health check failed for ${serviceName}:`, error.message);
          return { serviceName, healthy: false, error: error.message };
        })
      );
    }
    
    const results = await Promise.all(healthCheckPromises);
    
    // Process health check results
    for (const result of results) {
      if (result.serviceName) {
        await this.processHealthCheckResult(result);
      }
    }
  }

  /**
   * Check health of a specific service
   */
  async checkServiceHealth(serviceName) {
    const serviceConfig = this.services.get(serviceName);
    const serviceState = this.serviceStates.get(serviceName);
    
    if (!serviceConfig || !serviceState) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    
    try {
      // Simulate health check (in real implementation, this would be HTTP request)
      const healthCheckResult = await this.performHealthCheck(
        serviceState.currentEndpoint, 
        serviceConfig.healthCheckTimeout
      );
      
      serviceState.lastHealthCheck = Date.now();
      
      return {
        serviceName: serviceName,
        healthy: healthCheckResult.healthy,
        responseTime: healthCheckResult.responseTime,
        endpoint: serviceState.currentEndpoint
      };
      
    } catch (error) {
      return {
        serviceName: serviceName,
        healthy: false,
        error: error.message,
        endpoint: serviceState.currentEndpoint
      };
    }
  }

  /**
   * Perform actual health check against endpoint
   */
  async performHealthCheck(endpoint, timeout) {
    // Simulate health check with random success/failure
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const responseTime = Date.now() - startTime;
        
        // Simulate varying reliability based on endpoint
        const reliability = endpoint.includes('primary') ? 0.9 : 0.7;
        
        if (Math.random() < reliability) {
          resolve({
            healthy: true,
            responseTime: responseTime,
            status: 200
          });
        } else {
          reject(new Error(`Health check failed for ${endpoint}`));
        }
      }, Math.random() * timeout * 0.5); // Random response time
    });
  }

  /**
   * Process health check result and trigger failover if needed
   */
  async processHealthCheckResult(result) {
    const serviceState = this.serviceStates.get(result.serviceName);
    const failoverPolicy = this.failoverPolicies.get(result.serviceName);
    
    if (result.healthy) {
      // Service is healthy
      serviceState.status = 'healthy';
      serviceState.consecutiveFailures = 0;
      
      console.log(`[${result.serviceName}] Health check passed (${result.responseTime}ms)`);
      
    } else {
      // Service is unhealthy
      serviceState.status = 'unhealthy';
      serviceState.consecutiveFailures++;
      
      console.log(`[${result.serviceName}] Health check failed (${serviceState.consecutiveFailures} consecutive failures)`);
      
      // Check if failover threshold reached
      if (serviceState.consecutiveFailures >= failoverPolicy.healthCheckThreshold) {
        await this.triggerFailover(result.serviceName, FAILOVER_TRIGGERS.HEALTH_CHECK_FAILURE);
      }
    }
    
    this.emit('health_check_completed', {
      serviceName: result.serviceName,
      healthy: result.healthy,
      consecutiveFailures: serviceState.consecutiveFailures,
      endpoint: result.endpoint
    });
  }

  /**
   * Trigger failover for a service
   */
  async triggerFailover(serviceName, trigger, options = {}) {
    const serviceConfig = this.services.get(serviceName);
    const serviceState = this.serviceStates.get(serviceName);
    const failoverPolicy = this.failoverPolicies.get(serviceName);
    
    // Check cooldown period
    const lastFailoverTime = this.lastFailoverTime.get(serviceName) || 0;
    const timeSinceLastFailover = Date.now() - lastFailoverTime;
    
    if (timeSinceLastFailover < this.failoverCooldown && !options.forceful) {
      console.log(`[${serviceName}] Failover blocked by cooldown (${Math.round((this.failoverCooldown - timeSinceLastFailover) / 1000)}s remaining)`);
      return false;
    }
    
    // Check if already in failover process
    if (this.activeFailovers.has(serviceName)) {
      console.log(`[${serviceName}] Failover already in progress`);
      return false;
    }
    
    console.log(`[${serviceName}] Triggering failover (trigger: ${trigger})`);
    
    const failoverStartTime = Date.now();
    
    // Mark failover as active
    this.activeFailovers.set(serviceName, {
      trigger: trigger,
      startTime: failoverStartTime,
      attempts: 0,
      originalEndpoint: serviceState.currentEndpoint
    });
    
    try {
      // Attempt failover to backup endpoints
      const success = await this.performFailover(serviceName);
      
      if (success) {
        const failoverTime = Date.now() - failoverStartTime;
        this.onFailoverSuccess(serviceName, failoverTime, trigger);
        return true;
      } else {
        this.onFailoverFailure(serviceName, trigger);
        return false;
      }
      
    } catch (error) {
      console.error(`[${serviceName}] Failover error:`, error.message);
      this.onFailoverFailure(serviceName, trigger, error);
      return false;
      
    } finally {
      // Remove from active failovers
      this.activeFailovers.delete(serviceName);
      this.lastFailoverTime.set(serviceName, Date.now());
    }
  }

  /**
   * Perform the actual failover process
   */
  async performFailover(serviceName) {
    const serviceConfig = this.services.get(serviceName);
    const serviceState = this.serviceStates.get(serviceName);
    const failoverInfo = this.activeFailovers.get(serviceName);
    
    console.log(`[${serviceName}] Starting failover from ${serviceState.currentEndpoint}`);
    
    // Try each backup endpoint
    for (const backupEndpoint of serviceConfig.secondaryEndpoints) {
      failoverInfo.attempts++;
      
      console.log(`[${serviceName}] Attempting failover to ${backupEndpoint} (attempt ${failoverInfo.attempts})`);
      
      try {
        // Test backup endpoint health
        const healthResult = await this.performHealthCheck(backupEndpoint, serviceConfig.healthCheckTimeout);
        
        if (healthResult.healthy) {
          // Switch to backup endpoint
          serviceState.currentEndpoint = backupEndpoint;
          serviceState.status = 'healthy';
          serviceState.consecutiveFailures = 0;
          serviceState.failoverCount++;
          
          console.log(`[${serviceName}] Successfully failed over to ${backupEndpoint}`);
          
          // Schedule revert check if auto-revert is enabled
          if (this.failoverPolicies.get(serviceName).autoRevert) {
            this.scheduleRevertCheck(serviceName);
          }
          
          return true;
        }
        
      } catch (error) {
        console.log(`[${serviceName}] Backup endpoint ${backupEndpoint} failed: ${error.message}`);
      }
      
      // Wait before trying next endpoint
      if (failoverInfo.attempts < serviceConfig.secondaryEndpoints.length) {
        await this.delay(this.failoverPolicies.get(serviceName).retryDelay);
      }
    }
    
    // All backup endpoints failed
    console.error(`[${serviceName}] All backup endpoints failed`);
    
    // Try graceful degradation if enabled
    if (this.enableGracefulDegradation && serviceConfig.gracefulDegradation) {
      console.log(`[${serviceName}] Attempting graceful degradation`);
      return await this.enableGracefulDegradation(serviceName);
    }
    
    return false;
  }

  /**
   * Enable graceful degradation for a service
   */
  async enableGracefulDegradation(serviceName) {
    const serviceConfig = this.services.get(serviceName);
    const degradationConfig = serviceConfig.gracefulDegradation;
    
    if (!degradationConfig) {
      return false;
    }
    
    console.log(`[${serviceName}] Enabling graceful degradation mode`);
    
    // Set service to degraded state
    const serviceState = this.serviceStates.get(serviceName);
    serviceState.status = 'degraded';
    serviceState.currentEndpoint = degradationConfig.fallbackEndpoint || 'degraded-mode';
    
    this.emit('graceful_degradation_enabled', {
      serviceName: serviceName,
      degradationMode: degradationConfig.mode || 'default',
      fallbackEndpoint: serviceState.currentEndpoint
    });
    
    return true;
  }

  /**
   * Schedule automatic revert check
   */
  scheduleRevertCheck(serviceName) {
    const revertInterval = this.failoverPolicies.get(serviceName).revertCheckInterval;
    
    setTimeout(async () => {
      await this.checkForRevert(serviceName);
    }, revertInterval);
  }

  /**
   * Check if service can be reverted to primary endpoint
   */
  async checkForRevert(serviceName) {
    const serviceConfig = this.services.get(serviceName);
    const serviceState = this.serviceStates.get(serviceName);
    
    // Only revert if we're currently on a backup endpoint
    if (serviceState.currentEndpoint === serviceConfig.primaryEndpoint) {
      return;
    }
    
    console.log(`[${serviceName}] Checking if primary endpoint has recovered`);
    
    try {
      const healthResult = await this.performHealthCheck(
        serviceConfig.primaryEndpoint,
        serviceConfig.healthCheckTimeout
      );
      
      if (healthResult.healthy) {
        console.log(`[${serviceName}] Primary endpoint recovered, reverting`);
        
        serviceState.currentEndpoint = serviceConfig.primaryEndpoint;
        serviceState.status = 'healthy';
        
        this.emit('service_reverted', {
          serviceName: serviceName,
          fromEndpoint: serviceState.currentEndpoint,
          toEndpoint: serviceConfig.primaryEndpoint
        });
      } else {
        // Schedule another revert check
        this.scheduleRevertCheck(serviceName);
      }
      
    } catch (error) {
      console.log(`[${serviceName}] Primary endpoint still unhealthy: ${error.message}`);
      // Schedule another revert check
      this.scheduleRevertCheck(serviceName);
    }
  }

  /**
   * Handle successful failover
   */
  onFailoverSuccess(serviceName, failoverTime, trigger) {
    console.log(`[${serviceName}] Failover completed successfully in ${failoverTime}ms`);
    
    this.metrics.totalFailovers++;
    this.metrics.successfulFailovers++;
    this.updateAverageFailoverTime(failoverTime);
    
    // Record in history
    this.failoverHistory.push({
      serviceName: serviceName,
      trigger: trigger,
      success: true,
      failoverTime: failoverTime,
      timestamp: Date.now(),
      newEndpoint: this.serviceStates.get(serviceName).currentEndpoint
    });
    
    this.emit('failover_completed', {
      serviceName: serviceName,
      success: true,
      failoverTime: failoverTime,
      trigger: trigger,
      newEndpoint: this.serviceStates.get(serviceName).currentEndpoint
    });
  }

  /**
   * Handle failed failover
   */
  onFailoverFailure(serviceName, trigger, error = null) {
    console.error(`[${serviceName}] Failover failed`);
    
    this.metrics.totalFailovers++;
    this.metrics.failedFailovers++;
    
    // Record in history
    this.failoverHistory.push({
      serviceName: serviceName,
      trigger: trigger,
      success: false,
      error: error?.message,
      timestamp: Date.now()
    });
    
    this.emit('failover_completed', {
      serviceName: serviceName,
      success: false,
      trigger: trigger,
      error: error?.message
    });
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Generate unique identifier
   */
  generateId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Simple delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update average failover time metric
   */
  updateAverageFailoverTime(failoverTime) {
    const totalSuccessful = this.metrics.successfulFailovers;
    this.metrics.averageFailoverTime = 
      (this.metrics.averageFailoverTime * (totalSuccessful - 1) + failoverTime) / totalSuccessful;
  }

  /**
   * Get current status of all services
   */
  getStatus() {
    const services = {};
    
    for (const [serviceName, serviceState] of this.serviceStates) {
      const serviceConfig = this.services.get(serviceName);
      services[serviceName] = {
        ...serviceState,
        primaryEndpoint: serviceConfig.primaryEndpoint,
        totalBackupEndpoints: serviceConfig.secondaryEndpoints.length,
        isFailedOver: serviceState.currentEndpoint !== serviceConfig.primaryEndpoint,
        hasActiveFailover: this.activeFailovers.has(serviceName)
      };
    }
    
    return {
      coordinatorId: this.coordinatorId,
      metrics: this.metrics,
      services: services,
      activeFailovers: this.activeFailovers.size,
      monitoringActive: !!this.healthCheckTimer
    };
  }

  /**
   * Get failover history
   */
  getFailoverHistory(limit = 10) {
    return this.failoverHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

// ========================
// Usage Examples and Testing
// ========================

/**
 * Demonstrate leader election
 */
async function demonstrateLeaderElection() {
  console.log('=== Leader Election Demonstration ===');
  
  // Create cluster of 5 nodes
  const nodes = [];
  const nodeCount = 5;
  
  for (let i = 0; i < nodeCount; i++) {
    const node = new ClusterNode(`node-${i}`, {
      clusterId: 'demo-cluster',
      clusterSize: nodeCount,
      priority: Math.random(),
      heartbeatInterval: 2000,
      electionTimeout: 5000
    });
    
    // Set up event listeners
    node.on('became_leader', (data) => {
      console.log(`🎯 ${data.nodeId} became leader for term ${data.term}`);
    });
    
    node.on('stepped_down', (data) => {
      console.log(`👋 ${data.nodeId} stepped down from leadership`);
    });
    
    nodes.push(node);
  }
  
  // Create seed node list for each node
  const seedNodes = nodes.map((node, index) => ({
    nodeId: node.nodeId,
    priority: node.priority,
    state: node.state
  }));
  
  // Start all nodes
  for (const node of nodes) {
    await node.joinCluster(seedNodes);
  }
  
  // Let cluster run for a while
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Simulate leader failure
  const currentLeader = nodes.find(node => node.state === NODE_STATES.LEADER);
  if (currentLeader) {
    console.log(`\nSimulating leader failure: ${currentLeader.nodeId}`);
    await currentLeader.stepDown();
  }
  
  // Let new election complete
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Show final status
  console.log('\n--- Final Cluster Status ---');
  nodes.forEach(node => {
    const status = node.getStatus();
    console.log(`${status.nodeId}: ${status.state} (term: ${status.term}, leader: ${status.leaderId})`);
  });
  
  // Cleanup
  for (const node of nodes) {
    await node.leaveCluster();
  }
}

/**
 * Demonstrate failover coordination
 */
async function demonstrateFailoverCoordination() {
  console.log('\n=== Failover Coordination Demonstration ===');
  
  const coordinator = new FailoverCoordinator({
    healthCheckInterval: 3000,
    failoverCooldown: 10000
  });
  
  // Register services with different configurations
  coordinator.registerService('user-service', {
    primaryEndpoint: 'https://users.primary.com',
    secondaryEndpoints: [
      'https://users.backup1.com',
      'https://users.backup2.com'
    ],
    criticality: 'critical',
    gracefulDegradation: {
      mode: 'read-only',
      fallbackEndpoint: 'cache://users-cache'
    }
  });
  
  coordinator.registerService('notification-service', {
    primaryEndpoint: 'https://notifications.primary.com',
    secondaryEndpoints: [
      'https://notifications.backup.com'
    ],
    criticality: 'important'
  });
  
  coordinator.registerService('analytics-service', {
    primaryEndpoint: 'https://analytics.primary.com',
    secondaryEndpoints: [
      'https://analytics.backup.com'
    ],
    criticality: 'optional',
    gracefulDegradation: {
      mode: 'disabled'
    }
  });
  
  // Set up event listeners
  coordinator.on('service_status_changed', (data) => {
    console.log(`📊 ${data.serviceName} status: ${data.healthy ? 'healthy' : 'unhealthy'}`);
  });
  
  coordinator.on('failover_completed', (data) => {
    if (data.success) {
      console.log(`✅ Failover successful for ${data.serviceName} -> ${data.newEndpoint}`);
    } else {
      console.log(`❌ Failover failed for ${data.serviceName}: ${data.error || 'unknown error'}`);
    }
  });
  
  coordinator.on('graceful_degradation_enabled', (data) => {
    console.log(`⚠️ Graceful degradation enabled for ${data.serviceName}`);
  });
  
  // Start monitoring
  coordinator.startMonitoring();
  
  // Let it run and observe failovers
  setTimeout(() => {
    console.log('\n--- Service Status ---');
    const status = coordinator.getStatus();
    
    Object.entries(status.services).forEach(([serviceName, serviceStatus]) => {
      console.log(`${serviceName}: ${serviceStatus.status} (${serviceStatus.currentEndpoint})`);
      if (serviceStatus.isFailedOver) {
        console.log(`  -> Failed over from ${serviceStatus.primaryEndpoint}`);
      }
    });
    
    console.log(`\nMetrics: ${status.metrics.successfulFailovers}/${status.metrics.totalFailovers} successful failovers`);
    
    const history = coordinator.getFailoverHistory(5);
    if (history.length > 0) {
      console.log('\nRecent Failovers:');
      history.forEach(event => {
        console.log(`  ${event.serviceName}: ${event.success ? 'success' : 'failed'} (${event.trigger})`);
      });
    }
    
    coordinator.stopMonitoring();
  }, 20000);
}

// Export for use in other modules
module.exports = { 
  ClusterNode,
  FailoverCoordinator,
  NODE_STATES,
  FAILOVER_TRIGGERS,
  demonstrateLeaderElection,
  demonstrateFailoverCoordination
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
  (async () => {
    await demonstrateLeaderElection();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await demonstrateFailoverCoordination();
  })().catch(console.error);
}