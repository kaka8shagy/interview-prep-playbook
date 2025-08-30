/**
 * File: load-balancer.js
 * Description: Custom load balancer implementation with multiple algorithms and health checking
 * 
 * Learning objectives:
 * - Understand different load balancing algorithms and their trade-offs
 * - Learn health checking mechanisms and failover strategies
 * - See practical implementation of weighted distribution and sticky sessions
 * - Understand circuit breaker patterns for handling upstream failures
 * 
 * Time Complexity: O(1) for round-robin, O(log N) for weighted algorithms
 * Space Complexity: O(N) where N is the number of backend servers
 */

const http = require('http');
const https = require('https');
const EventEmitter = require('events');
const crypto = require('crypto');

// Configuration constants
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 second timeout
const CIRCUIT_BREAKER_THRESHOLD = 5; // Failures before opening circuit
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute before trying to close
const MAX_RETRIES = 3; // Maximum retry attempts

/**
 * Load Balancer Implementation with multiple algorithms and health checking
 * Supports round-robin, weighted, least connections, and IP hash algorithms
 */
class LoadBalancer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration with sensible defaults
    this.algorithm = config.algorithm || 'round-robin';
    this.stickySession = config.stickySession || false;
    this.healthCheckPath = config.healthCheckPath || '/health';
    this.retryOnFailure = config.retryOnFailure !== false; // Default true
    
    // Backend server pool
    this.servers = [];
    this.currentIndex = 0; // For round-robin algorithm
    
    // Health checking state
    this.healthyServers = new Set();
    this.healthCheckIntervals = new Map();
    
    // Circuit breaker state per server
    this.circuitBreakers = new Map();
    
    // Session affinity tracking (for sticky sessions)
    this.sessionMap = new Map();
    
    // Metrics and monitoring
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      requestsPerServer: new Map()
    };

    console.log(`Load balancer initialized with algorithm: ${this.algorithm}`);
  }

  /**
   * Add a backend server to the pool
   * Each server has host, port, weight (for weighted algorithms), and health status
   */
  addServer(host, port, weight = 1, options = {}) {
    const serverId = `${host}:${port}`;
    
    const server = {
      id: serverId,
      host: host,
      port: port,
      weight: weight,
      isHealthy: true,
      connections: 0, // Track active connections for least-connections algorithm
      responseTime: 0, // Track average response time
      totalRequests: 0,
      failedRequests: 0,
      ...options
    };

    this.servers.push(server);
    this.healthyServers.add(serverId);
    
    // Initialize metrics tracking
    this.metrics.requestsPerServer.set(serverId, 0);
    
    // Initialize circuit breaker state
    this.circuitBreakers.set(serverId, {
      failures: 0,
      isOpen: false,
      lastFailureTime: null
    });

    // Start health checking for this server
    this.startHealthCheck(server);
    
    console.log(`Server added: ${serverId} (weight: ${weight})`);
    this.emit('server_added', server);
    
    return server;
  }

  /**
   * Remove a server from the pool
   * Stops health checking and cleans up associated state
   */
  removeServer(host, port) {
    const serverId = `${host}:${port}`;
    
    // Remove from server pool
    this.servers = this.servers.filter(server => server.id !== serverId);
    
    // Clean up health checking
    this.healthyServers.delete(serverId);
    if (this.healthCheckIntervals.has(serverId)) {
      clearInterval(this.healthCheckIntervals.get(serverId));
      this.healthCheckIntervals.delete(serverId);
    }
    
    // Clean up other state
    this.circuitBreakers.delete(serverId);
    this.metrics.requestsPerServer.delete(serverId);
    
    // Clean up session mappings
    for (const [sessionId, serverMapping] of this.sessionMap.entries()) {
      if (serverMapping === serverId) {
        this.sessionMap.delete(sessionId);
      }
    }
    
    console.log(`Server removed: ${serverId}`);
    this.emit('server_removed', { serverId });
  }

  /**
   * Select the next server to handle a request based on the configured algorithm
   * This is the core load balancing logic
   */
  selectServer(clientIp = null, sessionId = null) {
    // Filter to only healthy servers
    const healthyServers = this.servers.filter(server => 
      this.healthyServers.has(server.id) && !this.isCircuitOpen(server.id)
    );

    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }

    // Handle sticky sessions if enabled
    if (this.stickySession && sessionId) {
      const stickyServer = this.handleStickySession(sessionId, healthyServers);
      if (stickyServer) {
        return stickyServer;
      }
    }

    // Select server based on configured algorithm
    switch (this.algorithm) {
      case 'round-robin':
        return this.selectRoundRobin(healthyServers);
      
      case 'weighted-round-robin':
        return this.selectWeightedRoundRobin(healthyServers);
      
      case 'least-connections':
        return this.selectLeastConnections(healthyServers);
      
      case 'ip-hash':
        return this.selectIpHash(healthyServers, clientIp);
      
      case 'response-time':
        return this.selectByResponseTime(healthyServers);
        
      default:
        throw new Error(`Unknown algorithm: ${this.algorithm}`);
    }
  }

  /**
   * Round-robin algorithm: distribute requests evenly in sequence
   * Simple and fair distribution, good when all servers have similar capacity
   */
  selectRoundRobin(servers) {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex = (this.currentIndex + 1) % servers.length;
    return server;
  }

  /**
   * Weighted round-robin: distribute based on server weights
   * Servers with higher weights receive proportionally more requests
   */
  selectWeightedRoundRobin(servers) {
    // Calculate total weight
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0);
    
    // Generate random number within total weight
    let randomWeight = Math.random() * totalWeight;
    
    // Select server based on weight distribution
    for (const server of servers) {
      randomWeight -= server.weight;
      if (randomWeight <= 0) {
        return server;
      }
    }
    
    // Fallback to first server (shouldn't reach here)
    return servers[0];
  }

  /**
   * Least connections algorithm: route to server with fewest active connections
   * Good for applications where request processing time varies significantly
   */
  selectLeastConnections(servers) {
    return servers.reduce((minServer, currentServer) => {
      return currentServer.connections < minServer.connections ? currentServer : minServer;
    });
  }

  /**
   * IP hash algorithm: route based on client IP hash for session affinity
   * Ensures the same client consistently reaches the same server
   */
  selectIpHash(servers, clientIp) {
    if (!clientIp) {
      // Fallback to round-robin if no IP provided
      return this.selectRoundRobin(servers);
    }
    
    // Create hash of client IP
    const hash = crypto.createHash('md5').update(clientIp).digest('hex');
    const hashNumber = parseInt(hash.substring(0, 8), 16);
    
    // Select server based on hash
    const serverIndex = hashNumber % servers.length;
    return servers[serverIndex];
  }

  /**
   * Response time algorithm: route to server with best average response time
   * Dynamically adapts to server performance characteristics
   */
  selectByResponseTime(servers) {
    return servers.reduce((bestServer, currentServer) => {
      // For servers with no history, assume average response time
      const bestResponseTime = bestServer.responseTime || 100;
      const currentResponseTime = currentServer.responseTime || 100;
      
      return currentResponseTime < bestResponseTime ? currentServer : bestServer;
    });
  }

  /**
   * Handle sticky session routing
   * Maps session IDs to specific servers for session affinity
   */
  handleStickySession(sessionId, availableServers) {
    const mappedServerId = this.sessionMap.get(sessionId);
    
    if (mappedServerId) {
      // Check if mapped server is still available
      const mappedServer = availableServers.find(s => s.id === mappedServerId);
      if (mappedServer) {
        return mappedServer;
      } else {
        // Mapped server is no longer available, remove mapping
        this.sessionMap.delete(sessionId);
      }
    }
    
    // No existing mapping or mapped server unavailable
    // Select new server and create mapping
    const selectedServer = this.selectRoundRobin(availableServers);
    this.sessionMap.set(sessionId, selectedServer.id);
    
    return selectedServer;
  }

  /**
   * Proxy HTTP request to selected backend server
   * Includes retry logic, connection tracking, and error handling
   */
  async proxyRequest(clientReq, clientRes) {
    const startTime = Date.now();
    let selectedServer = null;
    let retryCount = 0;

    // Extract client information for routing decisions
    const clientIp = clientReq.connection.remoteAddress;
    const sessionId = this.extractSessionId(clientReq);

    while (retryCount < MAX_RETRIES) {
      try {
        // Select server for this request
        selectedServer = this.selectServer(clientIp, sessionId);
        
        // Track connection count for least-connections algorithm
        selectedServer.connections++;
        
        // Create proxy request to backend server
        const proxyReq = await this.createProxyRequest(selectedServer, clientReq, clientRes);
        
        // Track successful request
        this.recordSuccess(selectedServer, Date.now() - startTime);
        
        return proxyReq;
        
      } catch (error) {
        retryCount++;
        
        if (selectedServer) {
          // Decrement connection count on failure
          selectedServer.connections = Math.max(0, selectedServer.connections - 1);
          
          // Record failure for circuit breaker
          this.recordFailure(selectedServer);
        }
        
        console.error(`Request failed (attempt ${retryCount}):`, error.message);
        
        // If we've exhausted retries or retry is disabled, return error
        if (retryCount >= MAX_RETRIES || !this.retryOnFailure) {
          this.sendErrorResponse(clientRes, 503, 'Service Unavailable');
          this.recordFailedRequest();
          throw error;
        }
        
        // Small delay before retry to avoid thundering herd
        await this.delay(100 * retryCount);
      }
    }
  }

  /**
   * Create actual HTTP/HTTPS proxy request to backend server
   * Handles headers, request/response piping, and connection management
   */
  createProxyRequest(server, clientReq, clientRes) {
    return new Promise((resolve, reject) => {
      // Determine if we need HTTP or HTTPS
      const httpModule = server.secure ? https : http;
      
      const options = {
        hostname: server.host,
        port: server.port,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
          ...clientReq.headers,
          // Add/modify headers for backend
          'X-Forwarded-For': clientReq.connection.remoteAddress,
          'X-Forwarded-Proto': clientReq.connection.encrypted ? 'https' : 'http',
          'X-Load-Balancer': 'custom-lb'
        },
        timeout: HEALTH_CHECK_TIMEOUT
      };

      const proxyReq = httpModule.request(options, (proxyRes) => {
        // Copy response headers to client
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        // Pipe response data to client
        proxyRes.pipe(clientRes);
        
        // Handle response completion
        proxyRes.on('end', () => {
          // Decrement connection count
          server.connections = Math.max(0, server.connections - 1);
          resolve(proxyReq);
        });
      });

      // Handle request errors
      proxyReq.on('error', (error) => {
        server.connections = Math.max(0, server.connections - 1);
        reject(new Error(`Proxy request failed: ${error.message}`));
      });

      // Handle request timeout
      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        server.connections = Math.max(0, server.connections - 1);
        reject(new Error('Request timeout'));
      });

      // Pipe client request data to backend
      clientReq.pipe(proxyReq);
    });
  }

  /**
   * Health check implementation
   * Periodically checks server health and updates availability status
   */
  startHealthCheck(server) {
    const checkHealth = async () => {
      try {
        const isHealthy = await this.performHealthCheck(server);
        const wasHealthy = this.healthyServers.has(server.id);
        
        if (isHealthy && !wasHealthy) {
          // Server recovered
          this.healthyServers.add(server.id);
          this.resetCircuitBreaker(server.id);
          console.log(`Server ${server.id} is now healthy`);
          this.emit('server_healthy', server);
          
        } else if (!isHealthy && wasHealthy) {
          // Server failed
          this.healthyServers.delete(server.id);
          console.log(`Server ${server.id} is now unhealthy`);
          this.emit('server_unhealthy', server);
        }
        
        server.isHealthy = isHealthy;
        
      } catch (error) {
        console.error(`Health check failed for ${server.id}:`, error.message);
        this.healthyServers.delete(server.id);
        server.isHealthy = false;
      }
    };

    // Perform initial health check
    checkHealth();
    
    // Set up periodic health checking
    const intervalId = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    this.healthCheckIntervals.set(server.id, intervalId);
  }

  /**
   * Perform actual health check against a server
   * Makes HTTP request to health check endpoint
   */
  performHealthCheck(server) {
    return new Promise((resolve) => {
      const httpModule = server.secure ? https : http;
      
      const options = {
        hostname: server.host,
        port: server.port,
        path: this.healthCheckPath,
        method: 'GET',
        timeout: HEALTH_CHECK_TIMEOUT
      };

      const req = httpModule.request(options, (res) => {
        // Consider server healthy if it responds with 2xx status
        const isHealthy = res.statusCode >= 200 && res.statusCode < 300;
        resolve(isHealthy);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  // ========================
  // Circuit Breaker Implementation
  // ========================

  isCircuitOpen(serverId) {
    const breaker = this.circuitBreakers.get(serverId);
    if (!breaker || !breaker.isOpen) return false;
    
    // Check if we should try to close the circuit
    const timeSinceFailure = Date.now() - (breaker.lastFailureTime || 0);
    if (timeSinceFailure >= CIRCUIT_BREAKER_TIMEOUT) {
      this.resetCircuitBreaker(serverId);
      return false;
    }
    
    return true;
  }

  recordFailure(server) {
    const breaker = this.circuitBreakers.get(server.id);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailureTime = Date.now();
      
      if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        breaker.isOpen = true;
        console.warn(`Circuit breaker opened for server ${server.id}`);
        this.emit('circuit_breaker_opened', server);
      }
    }
    
    server.failedRequests++;
  }

  recordSuccess(server, responseTime) {
    // Reset circuit breaker on successful request
    this.resetCircuitBreaker(server.id);
    
    // Update server statistics
    server.totalRequests++;
    const currentResponseTime = server.responseTime || 0;
    server.responseTime = (currentResponseTime + responseTime) / 2; // Simple moving average
    
    // Update global metrics
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.requestsPerServer.set(server.id, 
      (this.metrics.requestsPerServer.get(server.id) || 0) + 1);
    
    // Update average response time
    const currentAvg = this.metrics.avgResponseTime;
    this.metrics.avgResponseTime = (currentAvg + responseTime) / 2;
  }

  resetCircuitBreaker(serverId) {
    const breaker = this.circuitBreakers.get(serverId);
    if (breaker) {
      const wasOpen = breaker.isOpen;
      breaker.failures = 0;
      breaker.isOpen = false;
      breaker.lastFailureTime = null;
      
      if (wasOpen) {
        console.log(`Circuit breaker closed for server ${serverId}`);
        this.emit('circuit_breaker_closed', { serverId });
      }
    }
  }

  // ========================
  // Utility Methods
  // ========================

  extractSessionId(req) {
    // Extract session ID from cookie or header
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const sessionMatch = cookieHeader.match(/sessionId=([^;]+)/);
      return sessionMatch ? sessionMatch[1] : null;
    }
    return req.headers['x-session-id'] || null;
  }

  sendErrorResponse(res, statusCode, message) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message, timestamp: new Date().toISOString() }));
  }

  recordFailedRequest() {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current load balancer statistics and health status
   * Useful for monitoring and debugging
   */
  getStats() {
    const healthyCount = this.healthyServers.size;
    const totalServers = this.servers.length;
    
    return {
      totalServers,
      healthyServers: healthyCount,
      unhealthyServers: totalServers - healthyCount,
      algorithm: this.algorithm,
      metrics: { ...this.metrics },
      serverDetails: this.servers.map(server => ({
        id: server.id,
        isHealthy: this.healthyServers.has(server.id),
        connections: server.connections,
        responseTime: Math.round(server.responseTime || 0),
        totalRequests: server.totalRequests,
        failedRequests: server.failedRequests,
        circuitOpen: this.isCircuitOpen(server.id)
      }))
    };
  }

  /**
   * Gracefully shutdown the load balancer
   * Stops health checks and cleans up resources
   */
  shutdown() {
    console.log('Shutting down load balancer...');
    
    // Stop all health check intervals
    for (const intervalId of this.healthCheckIntervals.values()) {
      clearInterval(intervalId);
    }
    
    this.healthCheckIntervals.clear();
    this.emit('shutdown');
  }
}

// Export for use in other modules and testing
module.exports = { 
  LoadBalancer,
  HEALTH_CHECK_INTERVAL,
  CIRCUIT_BREAKER_THRESHOLD
};