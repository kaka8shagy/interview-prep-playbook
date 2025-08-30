/**
 * File: health-checker.js
 * Description: Comprehensive health monitoring system for distributed services
 * 
 * Learning objectives:
 * - Understand different types of health checks and their purposes
 * - Learn health aggregation and dependency modeling
 * - See integration with service discovery and load balancers
 * - Understand health check patterns for microservices
 * 
 * Time Complexity: O(1) for individual checks, O(N) for batch checks
 * Space Complexity: O(N) where N is the number of services monitored
 */

const EventEmitter = require('events');
const http = require('http');
const https = require('https');

// Health check constants and configurations
const DEFAULT_CHECK_INTERVAL = 30000; // 30 seconds
const DEFAULT_CHECK_TIMEOUT = 5000; // 5 seconds
const DEFAULT_FAILURE_THRESHOLD = 3; // Consecutive failures before marking unhealthy
const DEFAULT_SUCCESS_THRESHOLD = 2; // Consecutive successes before marking healthy
const DEFAULT_HISTORY_SIZE = 100; // Number of check results to retain

// Health status types
const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  WARNING: 'warning',
  UNKNOWN: 'unknown'
};

// Health check types
const CHECK_TYPES = {
  HTTP: 'http',
  TCP: 'tcp',
  PING: 'ping',
  CUSTOM: 'custom',
  DEPENDENCY: 'dependency',
  COMPOSITE: 'composite'
};

// Critical levels for health checks
const CRITICALITY = {
  CRITICAL: 'critical',     // Service failure affects core functionality
  IMPORTANT: 'important',   // Service failure affects major features
  OPTIONAL: 'optional'      // Service failure affects nice-to-have features
};

/**
 * Individual Health Check implementation
 * Represents a single health check with its own configuration and state
 */
class HealthCheck extends EventEmitter {
  constructor(config) {
    super();
    
    // Validate required configuration
    if (!config.name) {
      throw new Error('Health check name is required');
    }
    
    if (!config.check && config.type !== CHECK_TYPES.COMPOSITE) {
      throw new Error('Health check function is required');
    }
    
    // Basic configuration
    this.name = config.name;
    this.type = config.type || CHECK_TYPES.CUSTOM;
    this.check = config.check; // Function that performs the actual check
    this.criticality = config.criticality || CRITICALITY.IMPORTANT;
    
    // Timing configuration
    this.interval = config.interval || DEFAULT_CHECK_INTERVAL;
    this.timeout = config.timeout || DEFAULT_CHECK_TIMEOUT;
    this.initialDelay = config.initialDelay || 0;
    
    // Threshold configuration for stability
    this.failureThreshold = config.failureThreshold || DEFAULT_FAILURE_THRESHOLD;
    this.successThreshold = config.successThreshold || DEFAULT_SUCCESS_THRESHOLD;
    
    // HTTP-specific configuration
    if (this.type === CHECK_TYPES.HTTP) {
      this.url = config.url;
      this.method = config.method || 'GET';
      this.expectedStatus = config.expectedStatus || [200];
      this.headers = config.headers || {};
      this.body = config.body;
    }
    
    // TCP-specific configuration
    if (this.type === CHECK_TYPES.TCP) {
      this.host = config.host;
      this.port = config.port;
    }
    
    // Dependencies for composite checks
    this.dependencies = config.dependencies || [];
    
    // State tracking
    this.currentStatus = HEALTH_STATUS.UNKNOWN;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastCheckTime = null;
    this.lastStatusChange = Date.now();
    
    // History and metrics
    this.checkHistory = [];
    this.metrics = {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      uptime: 0,
      downtime: 0
    };
    
    // Control flags
    this.isRunning = false;
    this.intervalId = null;
    
    console.log(`Health check created: ${this.name} (${this.type}, ${this.criticality})`);
  }

  /**
   * Start the health check monitoring
   */
  start() {
    if (this.isRunning) {
      console.warn(`Health check ${this.name} is already running`);
      return;
    }
    
    this.isRunning = true;
    
    console.log(`Starting health check: ${this.name} (interval: ${this.interval}ms)`);
    
    // Initial delay before first check
    setTimeout(() => {
      if (this.isRunning) {
        this.performCheck(); // Initial check
        
        // Schedule recurring checks
        this.intervalId = setInterval(() => {
          this.performCheck();
        }, this.interval);
      }
    }, this.initialDelay);
    
    this.emit('started', { name: this.name });
  }

  /**
   * Stop the health check monitoring
   */
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log(`Stopped health check: ${this.name}`);
    this.emit('stopped', { name: this.name });
  }

  /**
   * Perform a single health check
   */
  async performCheck() {
    const startTime = Date.now();
    this.lastCheckTime = startTime;
    
    try {
      console.log(`[${this.name}] Performing health check (${this.type})`);
      
      let result;
      
      // Execute check based on type
      switch (this.type) {
        case CHECK_TYPES.HTTP:
          result = await this.performHttpCheck();
          break;
        case CHECK_TYPES.TCP:
          result = await this.performTcpCheck();
          break;
        case CHECK_TYPES.CUSTOM:
          result = await this.performCustomCheck();
          break;
        case CHECK_TYPES.COMPOSITE:
          result = await this.performCompositeCheck();
          break;
        default:
          throw new Error(`Unsupported check type: ${this.type}`);
      }
      
      const duration = Date.now() - startTime;
      this.processCheckResult(true, result, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`[${this.name}] Health check failed: ${error.message}`);
      this.processCheckResult(false, { error: error.message }, duration);
    }
  }

  /**
   * Perform HTTP-based health check
   */
  async performHttpCheck() {
    return new Promise((resolve, reject) => {
      const urlObject = new URL(this.url);
      const httpModule = urlObject.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObject.hostname,
        port: urlObject.port,
        path: urlObject.pathname + urlObject.search,
        method: this.method,
        headers: this.headers,
        timeout: this.timeout
      };
      
      const req = httpModule.request(options, (res) => {
        let responseBody = '';
        
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        
        res.on('end', () => {
          const isStatusOk = Array.isArray(this.expectedStatus) 
            ? this.expectedStatus.includes(res.statusCode)
            : res.statusCode === this.expectedStatus;
          
          if (isStatusOk) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: responseBody,
              contentLength: responseBody.length
            });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: Expected ${this.expectedStatus}, got ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`HTTP request timeout after ${this.timeout}ms`));
      });
      
      if (this.body) {
        req.write(this.body);
      }
      
      req.end();
    });
  }

  /**
   * Perform TCP connection-based health check
   */
  async performTcpCheck() {
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(this.timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve({
          host: this.host,
          port: this.port,
          connected: true
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error(`TCP connection timeout to ${this.host}:${this.port} after ${this.timeout}ms`));
      });
      
      socket.on('error', (error) => {
        socket.destroy();
        reject(new Error(`TCP connection failed to ${this.host}:${this.port}: ${error.message}`));
      });
      
      socket.connect(this.port, this.host);
    });
  }

  /**
   * Perform custom function-based health check
   */
  async performCustomCheck() {
    if (typeof this.check !== 'function') {
      throw new Error('Custom check function not provided');
    }
    
    // Execute with timeout protection
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Custom check timeout after ${this.timeout}ms`));
      }, this.timeout);
      
      Promise.resolve(this.check())
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result || { status: 'ok' });
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Perform composite health check based on dependencies
   */
  async performCompositeCheck() {
    const dependencyResults = [];
    let criticalFailures = 0;
    let importantFailures = 0;
    
    for (const dep of this.dependencies) {
      const depStatus = dep.getStatus();
      dependencyResults.push({
        name: dep.name,
        status: depStatus.status,
        criticality: dep.criticality
      });
      
      if (depStatus.status === HEALTH_STATUS.UNHEALTHY) {
        if (dep.criticality === CRITICALITY.CRITICAL) {
          criticalFailures++;
        } else if (dep.criticality === CRITICALITY.IMPORTANT) {
          importantFailures++;
        }
      }
    }
    
    // Determine composite status
    let compositeStatus = HEALTH_STATUS.HEALTHY;
    
    if (criticalFailures > 0) {
      compositeStatus = HEALTH_STATUS.UNHEALTHY;
    } else if (importantFailures > 0) {
      compositeStatus = HEALTH_STATUS.WARNING;
    }
    
    return {
      compositeStatus,
      dependencies: dependencyResults,
      criticalFailures,
      importantFailures
    };
  }

  /**
   * Process the result of a health check
   */
  processCheckResult(success, result, duration) {
    this.metrics.totalChecks++;
    
    // Update metrics
    if (success) {
      this.metrics.successfulChecks++;
      this.consecutiveSuccesses++;
      this.consecutiveFailures = 0;
    } else {
      this.metrics.failedChecks++;
      this.consecutiveFailures++;
      this.consecutiveSuccesses = 0;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalChecks - 1) + duration) / this.metrics.totalChecks;
    
    // Store check result in history
    const checkResult = {
      timestamp: Date.now(),
      success: success,
      duration: duration,
      result: result
    };
    
    this.checkHistory.push(checkResult);
    
    // Maintain history size limit
    if (this.checkHistory.length > DEFAULT_HISTORY_SIZE) {
      this.checkHistory.shift();
    }
    
    // Determine new status based on thresholds
    const previousStatus = this.currentStatus;
    this.updateHealthStatus();
    
    // Emit events if status changed
    if (this.currentStatus !== previousStatus) {
      this.lastStatusChange = Date.now();
      
      console.log(`[${this.name}] Status changed: ${previousStatus} -> ${this.currentStatus}`);
      
      this.emit('status_changed', {
        name: this.name,
        previousStatus: previousStatus,
        currentStatus: this.currentStatus,
        consecutiveFailures: this.consecutiveFailures,
        consecutiveSuccesses: this.consecutiveSuccesses
      });
    }
    
    // Emit check completed event
    this.emit('check_completed', {
      name: this.name,
      success: success,
      duration: duration,
      status: this.currentStatus,
      result: result
    });
  }

  /**
   * Update health status based on consecutive success/failure counts
   */
  updateHealthStatus() {
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.currentStatus = HEALTH_STATUS.UNHEALTHY;
    } else if (this.consecutiveSuccesses >= this.successThreshold) {
      this.currentStatus = HEALTH_STATUS.HEALTHY;
    }
    // Status remains unchanged if neither threshold is met
  }

  /**
   * Get current health status and metrics
   */
  getStatus() {
    const now = Date.now();
    const timeSinceLastChange = now - this.lastStatusChange;
    
    // Calculate uptime/downtime percentages
    const totalTime = Math.max(now - (this.checkHistory[0]?.timestamp || now), 1);
    const healthyTime = this.checkHistory.reduce((acc, check) => {
      return acc + (check.success ? this.interval : 0);
    }, 0);
    
    return {
      name: this.name,
      type: this.type,
      status: this.currentStatus,
      criticality: this.criticality,
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      timeSinceLastChange: timeSinceLastChange,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      metrics: {
        ...this.metrics,
        uptimePercentage: (healthyTime / totalTime * 100).toFixed(2),
        successRate: this.metrics.totalChecks > 0 
          ? (this.metrics.successfulChecks / this.metrics.totalChecks * 100).toFixed(2)
          : 0
      }
    };
  }

  /**
   * Get recent check history
   */
  getHistory(limit = 10) {
    return this.checkHistory.slice(-limit);
  }

  /**
   * Reset health check state
   */
  reset() {
    console.log(`Resetting health check: ${this.name}`);
    
    this.currentStatus = HEALTH_STATUS.UNKNOWN;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastCheckTime = null;
    this.lastStatusChange = Date.now();
    this.checkHistory = [];
    
    this.metrics = {
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTime: 0,
      uptime: 0,
      downtime: 0
    };
    
    this.emit('reset', { name: this.name });
  }
}

/**
 * Health Check Manager - orchestrates multiple health checks
 * Provides aggregated health status and service management
 */
class HealthCheckManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.healthChecks = new Map();
    this.serviceGroups = new Map(); // Group related health checks
    this.globalConfig = {
      defaultInterval: options.defaultInterval || DEFAULT_CHECK_INTERVAL,
      defaultTimeout: options.defaultTimeout || DEFAULT_CHECK_TIMEOUT,
      enableNotifications: options.enableNotifications !== false
    };
    
    // Global metrics
    this.globalMetrics = {
      totalServices: 0,
      healthyServices: 0,
      unhealthyServices: 0,
      warningServices: 0,
      unknownServices: 0,
      overallStatus: HEALTH_STATUS.UNKNOWN
    };
    
    console.log('Health Check Manager initialized');
  }

  /**
   * Register a new health check
   */
  registerHealthCheck(config) {
    const healthCheck = new HealthCheck({
      interval: this.globalConfig.defaultInterval,
      timeout: this.globalConfig.defaultTimeout,
      ...config
    });
    
    // Forward events from individual health checks
    healthCheck.on('status_changed', (data) => {
      this.updateGlobalMetrics();
      this.emit('service_status_changed', data);
      
      if (this.globalConfig.enableNotifications) {
        this.handleStatusChangeNotification(data);
      }
    });
    
    healthCheck.on('check_completed', (data) => {
      this.emit('service_check_completed', data);
    });
    
    this.healthChecks.set(config.name, healthCheck);
    this.updateGlobalMetrics();
    
    console.log(`Registered health check: ${config.name}`);
    
    return healthCheck;
  }

  /**
   * Start monitoring for a specific service or all services
   */
  startMonitoring(serviceName = null) {
    if (serviceName) {
      const healthCheck = this.healthChecks.get(serviceName);
      if (healthCheck) {
        healthCheck.start();
      } else {
        throw new Error(`Health check not found: ${serviceName}`);
      }
    } else {
      // Start all health checks
      console.log(`Starting monitoring for ${this.healthChecks.size} services`);
      
      for (const [name, healthCheck] of this.healthChecks) {
        healthCheck.start();
      }
      
      this.emit('monitoring_started', { 
        totalServices: this.healthChecks.size 
      });
    }
  }

  /**
   * Stop monitoring for a specific service or all services
   */
  stopMonitoring(serviceName = null) {
    if (serviceName) {
      const healthCheck = this.healthChecks.get(serviceName);
      if (healthCheck) {
        healthCheck.stop();
      }
    } else {
      // Stop all health checks
      console.log('Stopping all health monitoring');
      
      for (const [name, healthCheck] of this.healthChecks) {
        healthCheck.stop();
      }
      
      this.emit('monitoring_stopped');
    }
  }

  /**
   * Create service group for related health checks
   */
  createServiceGroup(groupName, serviceNames, aggregationRule = 'all_healthy') {
    const services = serviceNames.map(name => {
      const service = this.healthChecks.get(name);
      if (!service) {
        throw new Error(`Service not found: ${name}`);
      }
      return service;
    });
    
    this.serviceGroups.set(groupName, {
      services: services,
      aggregationRule: aggregationRule // 'all_healthy', 'majority_healthy', 'any_healthy'
    });
    
    console.log(`Created service group: ${groupName} with ${services.length} services`);
  }

  /**
   * Get aggregated status for a service group
   */
  getServiceGroupStatus(groupName) {
    const group = this.serviceGroups.get(groupName);
    if (!group) {
      throw new Error(`Service group not found: ${groupName}`);
    }
    
    const serviceStatuses = group.services.map(service => ({
      name: service.name,
      status: service.getStatus()
    }));
    
    const healthyCount = serviceStatuses.filter(s => s.status.status === HEALTH_STATUS.HEALTHY).length;
    const totalCount = serviceStatuses.length;
    
    let groupStatus = HEALTH_STATUS.UNHEALTHY;
    
    switch (group.aggregationRule) {
      case 'all_healthy':
        groupStatus = healthyCount === totalCount ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY;
        break;
      case 'majority_healthy':
        groupStatus = healthyCount > totalCount / 2 ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY;
        break;
      case 'any_healthy':
        groupStatus = healthyCount > 0 ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY;
        break;
    }
    
    return {
      groupName: groupName,
      status: groupStatus,
      healthyServices: healthyCount,
      totalServices: totalCount,
      services: serviceStatuses
    };
  }

  /**
   * Update global metrics across all health checks
   */
  updateGlobalMetrics() {
    this.globalMetrics = {
      totalServices: this.healthChecks.size,
      healthyServices: 0,
      unhealthyServices: 0,
      warningServices: 0,
      unknownServices: 0,
      overallStatus: HEALTH_STATUS.HEALTHY
    };
    
    let criticalUnhealthy = 0;
    
    for (const [name, healthCheck] of this.healthChecks) {
      const status = healthCheck.getStatus();
      
      switch (status.status) {
        case HEALTH_STATUS.HEALTHY:
          this.globalMetrics.healthyServices++;
          break;
        case HEALTH_STATUS.UNHEALTHY:
          this.globalMetrics.unhealthyServices++;
          if (healthCheck.criticality === CRITICALITY.CRITICAL) {
            criticalUnhealthy++;
          }
          break;
        case HEALTH_STATUS.WARNING:
          this.globalMetrics.warningServices++;
          break;
        default:
          this.globalMetrics.unknownServices++;
          break;
      }
    }
    
    // Determine overall system status
    if (criticalUnhealthy > 0) {
      this.globalMetrics.overallStatus = HEALTH_STATUS.UNHEALTHY;
    } else if (this.globalMetrics.unhealthyServices > 0 || this.globalMetrics.warningServices > 0) {
      this.globalMetrics.overallStatus = HEALTH_STATUS.WARNING;
    } else if (this.globalMetrics.unknownServices > 0) {
      this.globalMetrics.overallStatus = HEALTH_STATUS.UNKNOWN;
    }
  }

  /**
   * Handle status change notifications
   */
  handleStatusChangeNotification(data) {
    if (data.currentStatus === HEALTH_STATUS.UNHEALTHY) {
      console.warn(`🔴 SERVICE UNHEALTHY: ${data.name}`);
      this.emit('service_unhealthy', data);
    } else if (data.currentStatus === HEALTH_STATUS.HEALTHY && 
               data.previousStatus === HEALTH_STATUS.UNHEALTHY) {
      console.log(`🟢 SERVICE RECOVERED: ${data.name}`);
      this.emit('service_recovered', data);
    }
  }

  /**
   * Get status of all health checks
   */
  getAllStatuses() {
    const services = {};
    
    for (const [name, healthCheck] of this.healthChecks) {
      services[name] = healthCheck.getStatus();
    }
    
    return {
      timestamp: new Date().toISOString(),
      globalMetrics: this.globalMetrics,
      services: services
    };
  }

  /**
   * Get summary dashboard view
   */
  getDashboard() {
    const criticalServices = [];
    const warningServices = [];
    const recentEvents = [];
    
    for (const [name, healthCheck] of this.healthChecks) {
      const status = healthCheck.getStatus();
      
      if (status.status === HEALTH_STATUS.UNHEALTHY && 
          healthCheck.criticality === CRITICALITY.CRITICAL) {
        criticalServices.push({
          name: name,
          status: status.status,
          consecutiveFailures: status.consecutiveFailures,
          lastCheckTime: status.lastCheckTime
        });
      }
      
      if (status.status === HEALTH_STATUS.WARNING || 
          status.status === HEALTH_STATUS.UNHEALTHY) {
        warningServices.push({
          name: name,
          status: status.status,
          criticality: healthCheck.criticality
        });
      }
      
      // Get recent status changes
      const history = healthCheck.getHistory(5);
      const recentFailures = history.filter(h => !h.success && Date.now() - h.timestamp < 300000); // Last 5 minutes
      
      if (recentFailures.length > 0) {
        recentEvents.push({
          service: name,
          eventType: 'failures',
          count: recentFailures.length,
          timestamp: recentFailures[recentFailures.length - 1].timestamp
        });
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      overallStatus: this.globalMetrics.overallStatus,
      summary: this.globalMetrics,
      criticalIssues: criticalServices,
      warnings: warningServices,
      recentEvents: recentEvents.sort((a, b) => b.timestamp - a.timestamp)
    };
  }

  /**
   * Export health check configuration
   */
  exportConfiguration() {
    const config = {
      globalConfig: this.globalConfig,
      healthChecks: [],
      serviceGroups: []
    };
    
    for (const [name, healthCheck] of this.healthChecks) {
      config.healthChecks.push({
        name: name,
        type: healthCheck.type,
        criticality: healthCheck.criticality,
        interval: healthCheck.interval,
        timeout: healthCheck.timeout,
        // Add type-specific config
        ...(healthCheck.url && { url: healthCheck.url }),
        ...(healthCheck.host && { host: healthCheck.host, port: healthCheck.port })
      });
    }
    
    for (const [groupName, group] of this.serviceGroups) {
      config.serviceGroups.push({
        name: groupName,
        services: group.services.map(s => s.name),
        aggregationRule: group.aggregationRule
      });
    }
    
    return config;
  }
}

// ========================
// Mock Services for Testing
// ========================

/**
 * Mock HTTP service for health check testing
 */
class MockHttpService {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.isHealthy = true;
    this.responseDelay = 100;
  }
  
  start() {
    this.server = http.createServer((req, res) => {
      setTimeout(() => {
        if (req.url === '/health') {
          if (this.isHealthy) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              uptime: process.uptime()
            }));
          } else {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'unhealthy',
              error: 'Service is down for maintenance'
            }));
          }
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      }, this.responseDelay);
    });
    
    this.server.listen(this.port, () => {
      console.log(`Mock HTTP service started on port ${this.port}`);
    });
  }
  
  stop() {
    if (this.server) {
      this.server.close();
      console.log(`Mock HTTP service stopped`);
    }
  }
  
  setHealthy(healthy) {
    this.isHealthy = healthy;
    console.log(`Mock service health: ${healthy ? 'healthy' : 'unhealthy'}`);
  }
  
  setResponseDelay(delay) {
    this.responseDelay = delay;
  }
}

// ========================
// Usage Examples and Testing
// ========================

/**
 * Demonstrate basic health checking
 */
async function demonstrateBasicHealthChecking() {
  console.log('=== Basic Health Checking Demonstration ===');
  
  const manager = new HealthCheckManager();
  
  // Register different types of health checks
  manager.registerHealthCheck({
    name: 'database',
    type: CHECK_TYPES.TCP,
    host: 'localhost',
    port: 5432,
    criticality: CRITICALITY.CRITICAL,
    interval: 5000
  });
  
  manager.registerHealthCheck({
    name: 'redis',
    type: CHECK_TYPES.TCP,
    host: 'localhost',
    port: 6379,
    criticality: CRITICALITY.IMPORTANT,
    interval: 10000
  });
  
  manager.registerHealthCheck({
    name: 'external_api',
    type: CHECK_TYPES.CUSTOM,
    criticality: CRITICALITY.OPTIONAL,
    interval: 15000,
    check: async () => {
      // Simulate external API check
      const random = Math.random();
      if (random < 0.7) {
        return { status: 'ok', latency: Math.round(random * 100) };
      } else {
        throw new Error('External API timeout');
      }
    }
  });
  
  // Set up event listeners
  manager.on('service_status_changed', (data) => {
    console.log(`🔄 Status changed: ${data.name} -> ${data.currentStatus}`);
  });
  
  manager.on('service_unhealthy', (data) => {
    console.log(`🚨 Service unhealthy: ${data.name} (${data.consecutiveFailures} failures)`);
  });
  
  manager.on('service_recovered', (data) => {
    console.log(`✅ Service recovered: ${data.name}`);
  });
  
  // Start monitoring
  manager.startMonitoring();
  
  // Let it run for a bit
  setTimeout(() => {
    console.log('\n--- Health Status Summary ---');
    const dashboard = manager.getDashboard();
    console.log(`Overall Status: ${dashboard.overallStatus}`);
    console.log(`Services: ${dashboard.summary.healthyServices} healthy, ${dashboard.summary.unhealthyServices} unhealthy`);
    
    if (dashboard.criticalIssues.length > 0) {
      console.log('Critical Issues:', dashboard.criticalIssues);
    }
    
    manager.stopMonitoring();
  }, 12000);
}

/**
 * Demonstrate HTTP service health checking with mock service
 */
async function demonstrateHttpHealthChecking() {
  console.log('\n=== HTTP Health Checking Demonstration ===');
  
  // Start mock service
  const mockService = new MockHttpService(3001);
  mockService.start();
  
  // Wait for service to start
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const manager = new HealthCheckManager({
    defaultInterval: 2000
  });
  
  // Register HTTP health check
  manager.registerHealthCheck({
    name: 'web_service',
    type: CHECK_TYPES.HTTP,
    url: 'http://localhost:3001/health',
    expectedStatus: [200],
    criticality: CRITICALITY.CRITICAL,
    failureThreshold: 2,
    successThreshold: 2
  });
  
  manager.on('service_status_changed', (data) => {
    console.log(`HTTP Service status: ${data.currentStatus}`);
  });
  
  // Start monitoring
  manager.startMonitoring();
  
  // Simulate service degradation after 5 seconds
  setTimeout(() => {
    console.log('Simulating service degradation...');
    mockService.setHealthy(false);
  }, 5000);
  
  // Simulate service recovery after 10 seconds
  setTimeout(() => {
    console.log('Simulating service recovery...');
    mockService.setHealthy(true);
  }, 10000);
  
  // Cleanup after 15 seconds
  setTimeout(() => {
    manager.stopMonitoring();
    mockService.stop();
    
    const finalStatus = manager.getAllStatuses();
    console.log('Final status:', finalStatus.services.web_service.status);
    console.log('Success rate:', finalStatus.services.web_service.metrics.successRate + '%');
  }, 15000);
}

/**
 * Demonstrate service groups and composite health checks
 */
async function demonstrateServiceGroups() {
  console.log('\n=== Service Groups Demonstration ===');
  
  const manager = new HealthCheckManager();
  
  // Register multiple services for different tiers
  const services = [
    { name: 'web_tier_1', criticality: CRITICALITY.CRITICAL },
    { name: 'web_tier_2', criticality: CRITICALITY.CRITICAL },
    { name: 'api_tier_1', criticality: CRITICALITY.IMPORTANT },
    { name: 'api_tier_2', criticality: CRITICALITY.IMPORTANT },
    { name: 'cache_tier', criticality: CRITICALITY.OPTIONAL }
  ];
  
  services.forEach(service => {
    manager.registerHealthCheck({
      name: service.name,
      type: CHECK_TYPES.CUSTOM,
      criticality: service.criticality,
      interval: 3000,
      check: async () => {
        // Simulate varying reliability
        const reliability = service.criticality === CRITICALITY.CRITICAL ? 0.9 : 0.7;
        if (Math.random() < reliability) {
          return { status: 'ok' };
        } else {
          throw new Error(`${service.name} simulated failure`);
        }
      }
    });
  });
  
  // Create service groups
  manager.createServiceGroup('web_tier', ['web_tier_1', 'web_tier_2'], 'majority_healthy');
  manager.createServiceGroup('api_tier', ['api_tier_1', 'api_tier_2'], 'any_healthy');
  
  manager.startMonitoring();
  
  // Monitor service groups
  const groupMonitor = setInterval(() => {
    try {
      const webTierStatus = manager.getServiceGroupStatus('web_tier');
      const apiTierStatus = manager.getServiceGroupStatus('api_tier');
      
      console.log(`Web Tier: ${webTierStatus.status} (${webTierStatus.healthyServices}/${webTierStatus.totalServices})`);
      console.log(`API Tier: ${apiTierStatus.status} (${apiTierStatus.healthyServices}/${apiTierStatus.totalServices})`);
    } catch (error) {
      console.error('Error monitoring service groups:', error.message);
    }
  }, 5000);
  
  // Cleanup after 20 seconds
  setTimeout(() => {
    clearInterval(groupMonitor);
    manager.stopMonitoring();
    console.log('Service group monitoring stopped');
  }, 20000);
}

// Export for use in other modules
module.exports = { 
  HealthCheck,
  HealthCheckManager,
  MockHttpService,
  HEALTH_STATUS,
  CHECK_TYPES,
  CRITICALITY,
  demonstrateBasicHealthChecking,
  demonstrateHttpHealthChecking,
  demonstrateServiceGroups
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
  (async () => {
    await demonstrateBasicHealthChecking();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await demonstrateHttpHealthChecking();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await demonstrateServiceGroups();
  })().catch(console.error);
}