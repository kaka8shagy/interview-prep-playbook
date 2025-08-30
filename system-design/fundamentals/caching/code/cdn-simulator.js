/**
 * File: cdn-simulator.js
 * Description: CDN edge caching simulation with geographic distribution and routing
 * 
 * Learning objectives:
 * - Understand CDN architecture and edge server placement strategies
 * - Implement geographic request routing and latency optimization
 * - Design cache warming, invalidation, and content distribution
 * - Handle failover, load balancing, and performance optimization
 * 
 * Time Complexity: O(log N) for geographic routing, O(1) for cache operations
 * Space Complexity: O(K * E) where K is content items and E is edge locations
 */

// Geographic coordinates for realistic distance calculations
const LOCATIONS = {
  // North America
  'us-east-1': { name: 'Virginia', lat: 39.0458, lng: -77.4413, region: 'North America' },
  'us-west-1': { name: 'California', lat: 37.4419, lng: -122.1419, region: 'North America' },
  'ca-central-1': { name: 'Canada Central', lat: 45.5017, lng: -73.5673, region: 'North America' },
  
  // Europe
  'eu-west-1': { name: 'Ireland', lat: 53.4127, lng: -8.2439, region: 'Europe' },
  'eu-central-1': { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, region: 'Europe' },
  'eu-north-1': { name: 'Stockholm', lat: 59.3293, lng: 18.0686, region: 'Europe' },
  
  // Asia Pacific
  'ap-southeast-1': { name: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia Pacific' },
  'ap-northeast-1': { name: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'Asia Pacific' },
  'ap-south-1': { name: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'Asia Pacific' },
  
  // Other regions
  'sa-east-1': { name: 'São Paulo', lat: -23.5558, lng: -46.6396, region: 'South America' },
  'af-south-1': { name: 'Cape Town', lat: -33.9249, lng: 18.4241, region: 'Africa' },
  'me-south-1': { name: 'Bahrain', lat: 26.0667, lng: 50.5577, region: 'Middle East' }
};

// Edge server representing a CDN point of presence (PoP)
class EdgeServer {
  constructor(id, location, capacity = 1000, bandwidth = 10000) { // 10 Gbps default
    this.id = id;
    this.location = location;
    this.locationData = LOCATIONS[location];
    this.capacity = capacity; // Storage capacity in GB
    this.bandwidth = bandwidth; // Bandwidth in Mbps
    this.cache = new Map(); // Content cache
    this.currentLoad = 0; // Current bandwidth usage
    this.requestCount = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.bytesServed = 0;
    this.isHealthy = true;
    
    // Simulate realistic edge server characteristics
    this.cpuUsage = Math.random() * 20; // Start with 0-20% CPU
    this.memoryUsage = Math.random() * 30; // Start with 0-30% memory
    this.diskUsage = Math.random() * 10; // Start with 0-10% disk
  }

  // Calculate network latency to client based on geographic distance
  calculateLatencyTo(clientLat, clientLng) {
    if (!this.locationData) return 100; // Default latency if location unknown
    
    const distance = this.haversineDistance(
      this.locationData.lat, this.locationData.lng,
      clientLat, clientLng
    );
    
    // Approximate latency: base latency + distance factor + random jitter
    const baseLatency = 10; // 10ms base processing time
    const distanceLatency = distance / 100; // ~1ms per 100km (simplified)
    const jitter = Math.random() * 5; // 0-5ms random jitter
    
    return Math.round(baseLatency + distanceLatency + jitter);
  }

  // Haversine formula for calculating distance between two points on Earth
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Serve content from edge cache or fetch from origin
  async serveContent(contentId, clientLat, clientLng, contentSize = 1) {
    this.requestCount++;
    const latency = this.calculateLatencyTo(clientLat, clientLng);
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Check if content is cached
    const cachedContent = this.cache.get(contentId);
    
    if (cachedContent && !this.isExpired(cachedContent)) {
      // Cache hit - serve from edge
      this.hitCount++;
      this.bytesServed += contentSize;
      this.currentLoad += contentSize;
      
      console.log(`EDGE ${this.id}: HIT for ${contentId} (${latency}ms latency)`);
      
      // Update access time for LRU
      cachedContent.lastAccessed = Date.now();
      cachedContent.accessCount++;
      
      return {
        content: cachedContent.data,
        source: 'edge',
        edgeServer: this.id,
        latency: latency,
        cached: true
      };
    } else {
      // Cache miss - need to fetch from origin
      this.missCount++;
      console.log(`EDGE ${this.id}: MISS for ${contentId}, fetching from origin`);
      
      const originResponse = await this.fetchFromOrigin(contentId, contentSize);
      
      // Cache the content for future requests
      if (originResponse.success) {
        this.cacheContent(contentId, originResponse.data, contentSize);
      }
      
      return {
        content: originResponse.data,
        source: 'origin',
        edgeServer: this.id,
        latency: latency + originResponse.latency,
        cached: false
      };
    }
  }

  // Simulate fetching content from origin server
  async fetchFromOrigin(contentId, contentSize) {
    // Simulate origin server latency (typically higher than edge)
    const originLatency = 100 + Math.random() * 50; // 100-150ms
    await new Promise(resolve => setTimeout(resolve, originLatency));
    
    // Simulate occasional origin server issues
    if (Math.random() < 0.02) { // 2% failure rate
      console.log(`EDGE ${this.id}: Origin fetch failed for ${contentId}`);
      return { success: false, latency: originLatency, data: null };
    }
    
    const data = `content-${contentId}-data-${Date.now()}`;
    console.log(`EDGE ${this.id}: Fetched ${contentId} from origin (${originLatency}ms)`);
    
    return { success: true, latency: originLatency, data };
  }

  // Cache content at edge server
  cacheContent(contentId, data, size, ttlMs = 3600000) { // 1 hour default TTL
    // Check if we need to evict content due to capacity constraints
    this.evictIfNeeded(size);
    
    const cacheEntry = {
      data: data,
      size: size,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      lastAccessed: Date.now(),
      accessCount: 0,
      ttl: ttlMs
    };
    
    this.cache.set(contentId, cacheEntry);
    this.diskUsage += size / this.capacity * 100;
    
    console.log(`EDGE ${this.id}: Cached ${contentId} (${size}MB, TTL: ${ttlMs/1000}s)`);
  }

  // Evict content based on LRU policy when capacity is reached
  evictIfNeeded(incomingSize) {
    const currentSize = this.getCurrentCacheSize();
    const availableSpace = this.capacity - currentSize;
    
    if (availableSpace >= incomingSize) {
      return; // No eviction needed
    }
    
    // Sort cache entries by last accessed time (LRU)
    const entries = Array.from(this.cache.entries())
      .map(([id, entry]) => ({ id, ...entry }))
      .sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    let freedSpace = 0;
    const evicted = [];
    
    for (const entry of entries) {
      if (freedSpace >= incomingSize) {
        break;
      }
      
      this.cache.delete(entry.id);
      freedSpace += entry.size;
      evicted.push(entry.id);
      this.diskUsage -= entry.size / this.capacity * 100;
    }
    
    console.log(`EDGE ${this.id}: Evicted ${evicted.length} items (${freedSpace}MB freed)`);
  }

  // Check if cached content has expired
  isExpired(cacheEntry) {
    return Date.now() > cacheEntry.expiresAt;
  }

  // Get current cache size in MB
  getCurrentCacheSize() {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  // Invalidate specific content from cache
  invalidateContent(contentId) {
    const entry = this.cache.get(contentId);
    if (entry) {
      this.cache.delete(contentId);
      this.diskUsage -= entry.size / this.capacity * 100;
      console.log(`EDGE ${this.id}: Invalidated ${contentId}`);
      return true;
    }
    return false;
  }

  // Warm up cache with popular content
  async warmCache(popularContent) {
    console.log(`EDGE ${this.id}: Starting cache warming with ${popularContent.length} items`);
    
    for (const content of popularContent) {
      if (!this.cache.has(content.id)) {
        const response = await this.fetchFromOrigin(content.id, content.size);
        if (response.success) {
          this.cacheContent(content.id, response.data, content.size, content.ttl);
        }
      }
    }
    
    console.log(`EDGE ${this.id}: Cache warming completed`);
  }

  // Health check and resource monitoring
  performHealthCheck() {
    // Simulate resource usage changes
    this.cpuUsage += (Math.random() - 0.5) * 5;
    this.memoryUsage += (Math.random() - 0.5) * 3;
    
    // Clamp values to realistic ranges
    this.cpuUsage = Math.max(0, Math.min(100, this.cpuUsage));
    this.memoryUsage = Math.max(0, Math.min(100, this.memoryUsage));
    
    // Determine health status
    const isOverloaded = this.cpuUsage > 90 || this.memoryUsage > 95 || this.diskUsage > 95;
    this.isHealthy = !isOverloaded;
    
    return {
      healthy: this.isHealthy,
      cpu: this.cpuUsage.toFixed(1),
      memory: this.memoryUsage.toFixed(1),
      disk: this.diskUsage.toFixed(1),
      load: this.currentLoad
    };
  }

  // Get comprehensive edge server statistics
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) : '0';
    
    return {
      id: this.id,
      location: this.location,
      region: this.locationData?.region,
      isHealthy: this.isHealthy,
      requests: totalRequests,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: hitRate + '%',
      bytesServed: this.bytesServed,
      cacheSize: this.getCurrentCacheSize(),
      capacity: this.capacity,
      utilization: ((this.getCurrentCacheSize() / this.capacity) * 100).toFixed(2) + '%',
      resources: {
        cpu: this.cpuUsage.toFixed(1) + '%',
        memory: this.memoryUsage.toFixed(1) + '%',
        disk: this.diskUsage.toFixed(1) + '%'
      }
    };
  }
}

// CDN orchestrator managing global content distribution
class CDNSimulator {
  constructor() {
    this.edgeServers = new Map();
    this.routingPolicy = 'latency'; // 'latency', 'round-robin', 'load'
    this.globalStats = {
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      totalBytesServed: 0
    };
    
    // Popular content for cache warming
    this.popularContent = [
      { id: 'homepage.html', size: 2, ttl: 1800000 }, // 30 min
      { id: 'main.css', size: 0.5, ttl: 86400000 }, // 24 hours
      { id: 'app.js', size: 1.5, ttl: 86400000 }, // 24 hours
      { id: 'logo.png', size: 0.1, ttl: 604800000 }, // 7 days
      { id: 'hero-image.jpg', size: 5, ttl: 3600000 } // 1 hour
    ];
  }

  // Add edge server to CDN network
  addEdgeServer(location, capacity = 1000, bandwidth = 10000) {
    if (!LOCATIONS[location]) {
      throw new Error(`Unknown location: ${location}`);
    }
    
    const server = new EdgeServer(location, location, capacity, bandwidth);
    this.edgeServers.set(location, server);
    
    console.log(`CDN: Added edge server at ${LOCATIONS[location].name} (${location})`);
    
    // Warm cache with popular content
    this.warmEdgeCache(server);
    
    return server;
  }

  // Remove edge server from CDN network
  removeEdgeServer(location) {
    const removed = this.edgeServers.delete(location);
    if (removed) {
      console.log(`CDN: Removed edge server at ${location}`);
    }
    return removed;
  }

  // Route request to optimal edge server
  async routeRequest(contentId, clientLat, clientLng, contentSize = 1) {
    this.globalStats.totalRequests++;
    
    if (this.edgeServers.size === 0) {
      throw new Error('No edge servers available');
    }
    
    const optimalServer = this.selectOptimalServer(clientLat, clientLng);
    
    if (!optimalServer) {
      throw new Error('No healthy edge servers available');
    }
    
    console.log(`CDN: Routing request for ${contentId} to ${optimalServer.id}`);
    
    const response = await optimalServer.serveContent(contentId, clientLat, clientLng, contentSize);
    
    // Update global statistics
    this.globalStats.totalBytesServed += contentSize;
    if (response.cached) {
      this.globalStats.totalHits++;
    } else {
      this.globalStats.totalMisses++;
    }
    
    return response;
  }

  // Select optimal edge server based on routing policy
  selectOptimalServer(clientLat, clientLng) {
    const healthyServers = Array.from(this.edgeServers.values())
      .filter(server => server.isHealthy);
    
    if (healthyServers.length === 0) {
      return null;
    }
    
    switch (this.routingPolicy) {
      case 'latency':
        return this.selectByLatency(healthyServers, clientLat, clientLng);
      
      case 'load':
        return this.selectByLoad(healthyServers);
      
      case 'round-robin':
        return this.selectRoundRobin(healthyServers);
      
      default:
        return healthyServers[0];
    }
  }

  // Select server with lowest latency to client
  selectByLatency(servers, clientLat, clientLng) {
    let bestServer = null;
    let bestLatency = Infinity;
    
    for (const server of servers) {
      const latency = server.calculateLatencyTo(clientLat, clientLng);
      if (latency < bestLatency) {
        bestLatency = latency;
        bestServer = server;
      }
    }
    
    return bestServer;
  }

  // Select server with lowest current load
  selectByLoad(servers) {
    return servers.reduce((best, current) =>
      current.currentLoad < best.currentLoad ? current : best
    );
  }

  // Simple round-robin selection
  selectRoundRobin(servers) {
    // Simple implementation - in production would maintain state
    const index = Math.floor(Math.random() * servers.length);
    return servers[index];
  }

  // Warm cache on edge server with popular content
  async warmEdgeCache(edgeServer) {
    await edgeServer.warmCache(this.popularContent);
  }

  // Invalidate content across all edge servers
  async invalidateContent(contentId) {
    console.log(`CDN: Global invalidation for ${contentId}`);
    
    const promises = Array.from(this.edgeServers.values())
      .map(server => server.invalidateContent(contentId));
    
    const results = await Promise.all(promises);
    const successCount = results.filter(result => result).length;
    
    console.log(`CDN: Invalidated ${contentId} on ${successCount}/${this.edgeServers.size} servers`);
    return successCount;
  }

  // Perform health checks on all edge servers
  performHealthChecks() {
    const healthReports = [];
    
    for (const server of this.edgeServers.values()) {
      const health = server.performHealthCheck();
      healthReports.push({
        server: server.id,
        location: server.location,
        ...health
      });
      
      if (!health.healthy) {
        console.log(`CDN: Health check failed for ${server.id} - ${JSON.stringify(health)}`);
      }
    }
    
    return healthReports;
  }

  // Get comprehensive CDN statistics
  getStats() {
    const serverStats = Array.from(this.edgeServers.values()).map(server => server.getStats());
    
    const totalRequests = this.globalStats.totalHits + this.globalStats.totalMisses;
    const globalHitRate = totalRequests > 0 ?
      (this.globalStats.totalHits / totalRequests * 100).toFixed(2) : '0';
    
    return {
      global: {
        ...this.globalStats,
        totalRequests,
        globalHitRate: globalHitRate + '%',
        edgeServerCount: this.edgeServers.size,
        healthyServers: serverStats.filter(s => s.isHealthy).length,
        routingPolicy: this.routingPolicy
      },
      edgeServers: serverStats,
      regions: this.getRegionalStats(serverStats)
    };
  }

  // Get statistics grouped by region
  getRegionalStats(serverStats) {
    const regions = {};
    
    for (const server of serverStats) {
      const region = server.region || 'Unknown';
      
      if (!regions[region]) {
        regions[region] = {
          serverCount: 0,
          totalRequests: 0,
          totalHits: 0,
          totalMisses: 0,
          avgHitRate: 0
        };
      }
      
      regions[region].serverCount++;
      regions[region].totalRequests += server.requests;
      regions[region].totalHits += server.hits;
      regions[region].totalMisses += server.misses;
    }
    
    // Calculate average hit rates per region
    for (const region of Object.keys(regions)) {
      const regionData = regions[region];
      const totalRequests = regionData.totalHits + regionData.totalMisses;
      regionData.avgHitRate = totalRequests > 0 ?
        (regionData.totalHits / totalRequests * 100).toFixed(2) + '%' : '0%';
    }
    
    return regions;
  }

  // Change routing policy
  setRoutingPolicy(policy) {
    if (!['latency', 'load', 'round-robin'].includes(policy)) {
      throw new Error(`Invalid routing policy: ${policy}`);
    }
    
    this.routingPolicy = policy;
    console.log(`CDN: Routing policy changed to ${policy}`);
  }
}

// Demonstration of CDN functionality
async function demonstrateCDN() {
  console.log('=== CDN Simulator Demonstration ===\n');
  
  // Create CDN and add edge servers globally
  const cdn = new CDNSimulator();
  
  console.log('--- Setting up global CDN infrastructure ---');
  cdn.addEdgeServer('us-east-1', 1000, 10000);
  cdn.addEdgeServer('us-west-1', 1000, 10000);
  cdn.addEdgeServer('eu-west-1', 800, 8000);
  cdn.addEdgeServer('ap-southeast-1', 600, 6000);
  cdn.addEdgeServer('ap-northeast-1', 800, 8000);
  
  console.log('\n--- Simulating global user requests ---');
  
  // Simulate requests from different geographic locations
  const userRequests = [
    { location: 'New York', lat: 40.7128, lng: -74.0060, content: 'homepage.html' },
    { location: 'London', lat: 51.5074, lng: -0.1278, content: 'main.css' },
    { location: 'Tokyo', lat: 35.6762, lng: 139.6503, content: 'app.js' },
    { location: 'Singapore', lat: 1.3521, lng: 103.8198, content: 'hero-image.jpg' },
    { location: 'Los Angeles', lat: 34.0522, lng: -118.2437, content: 'homepage.html' }
  ];
  
  for (const request of userRequests) {
    console.log(`\nRequest from ${request.location} for ${request.content}:`);
    const response = await cdn.routeRequest(
      request.content, 
      request.lat, 
      request.lng,
      2 // 2MB content size
    );
    
    console.log(`Response: ${response.source} via ${response.edgeServer} (${response.latency}ms)`);
  }
  
  console.log('\n--- Testing cache efficiency ---');
  
  // Repeat requests to test cache hits
  console.log('\nRepeating New York request (should hit cache):');
  await cdn.routeRequest('homepage.html', 40.7128, -74.0060, 2);
  
  console.log('\nRepeating London request (should hit cache):');
  await cdn.routeRequest('main.css', 51.5074, -0.1278, 0.5);
  
  console.log('\n--- Testing different routing policies ---');
  
  // Test load-based routing
  cdn.setRoutingPolicy('load');
  console.log('\nUsing load-based routing:');
  await cdn.routeRequest('new-content.js', 40.7128, -74.0060, 1);
  
  // Test round-robin routing
  cdn.setRoutingPolicy('round-robin');
  console.log('\nUsing round-robin routing:');
  await cdn.routeRequest('another-content.css', 40.7128, -74.0060, 0.8);
  
  // Reset to latency-based routing
  cdn.setRoutingPolicy('latency');
  
  console.log('\n--- Testing content invalidation ---');
  
  await cdn.invalidateContent('homepage.html');
  
  // Request should now miss cache and fetch from origin
  console.log('\nRequesting invalidated content:');
  await cdn.routeRequest('homepage.html', 40.7128, -74.0060, 2);
  
  console.log('\n--- Health monitoring ---');
  
  const healthReports = cdn.performHealthChecks();
  console.log('Health check results:');
  healthReports.forEach(report => {
    console.log(`${report.server}: ${report.healthy ? 'HEALTHY' : 'UNHEALTHY'} - CPU: ${report.cpu}, Memory: ${report.memory}`);
  });
  
  console.log('\n--- Load testing ---');
  
  // Simulate burst traffic
  const loadTestPromises = [];
  for (let i = 0; i < 50; i++) {
    const randomLat = 40 + Math.random() * 10; // Random location near NYC
    const randomLng = -80 + Math.random() * 10;
    const randomContent = `content-${Math.floor(Math.random() * 10)}.jpg`;
    
    loadTestPromises.push(
      cdn.routeRequest(randomContent, randomLat, randomLng, 1)
    );
  }
  
  console.log('Executing 50 concurrent requests...');
  const startTime = Date.now();
  await Promise.all(loadTestPromises);
  const duration = Date.now() - startTime;
  
  console.log(`Load test completed in ${duration}ms`);
  
  console.log('\n--- Final CDN Statistics ---');
  const stats = cdn.getStats();
  console.log('CDN Performance Summary:');
  console.log(JSON.stringify(stats, null, 2));
}

// Export for use in other modules
module.exports = {
  EdgeServer,
  CDNSimulator,
  LOCATIONS,
  demonstrateCDN
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateCDN().catch(console.error);
}