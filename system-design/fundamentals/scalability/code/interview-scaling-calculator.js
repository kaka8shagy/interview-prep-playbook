/**
 * File: interview-scaling-calculator.js
 * Description: Back-of-envelope calculations for system design interviews
 * 
 * Learning objectives:
 * - Master capacity planning and resource estimation techniques
 * - Learn standard calculations for QPS, storage, bandwidth, and memory
 * - Understand scaling numbers and industry benchmarks
 * - Practice quick estimation skills for system design interviews
 * 
 * Time Complexity: O(1) for all calculations
 * Space Complexity: O(1) - simple numerical computations
 */

// Industry standard benchmarks and constants for estimation
const SCALING_BENCHMARKS = {
  // Network and bandwidth
  NETWORK_LATENCY: {
    same_datacenter: 0.5, // ms
    cross_datacenter: 50, // ms
    round_trip_internet: 150 // ms
  },
  
  // Storage performance
  DISK_PERFORMANCE: {
    hdd_iops: 100, // IOPS for traditional hard drives
    ssd_iops: 1000, // IOPS for solid state drives
    nvme_iops: 10000 // IOPS for NVMe drives
  },
  
  // Memory and CPU
  MEMORY_ACCESS: 0.0001, // ms (100 nanoseconds)
  CPU_CYCLE: 0.0000003, // ms (0.3 nanoseconds for 3GHz CPU)
  
  // Database performance
  DB_QUERY: {
    simple_select: 1, // ms
    complex_join: 100, // ms
    index_lookup: 10 // ms
  },
  
  // Cache performance
  CACHE_LOOKUP: {
    in_memory: 0.001, // ms (1 microsecond)
    redis: 1, // ms
    memcached: 1 // ms
  },
  
  // Standard data sizes
  DATA_SIZES: {
    char: 1, // byte
    int: 4, // bytes
    long: 8, // bytes
    pointer: 8, // bytes (64-bit system)
    uuid: 16, // bytes
    timestamp: 8, // bytes
    tweet_text: 140, // characters
    image_thumbnail: 20000, // bytes (20KB)
    image_full: 2000000, // bytes (2MB)
    video_minute: 50000000 // bytes (50MB per minute)
  },
  
  // Time constants
  TIME_UNITS: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    month: 2629746, // average month (30.44 days)
    year: 31556952 // average year (365.25 days)
  }
};

/**
 * Comprehensive scaling calculator for system design interviews
 * Provides methods for all common capacity planning calculations
 */
class ScalingCalculator {
  constructor() {
    this.benchmarks = SCALING_BENCHMARKS;
    this.calculations = []; // Store calculation history
  }

  // ========================
  // QPS and Load Calculations
  // ========================

  /**
   * Calculate Queries Per Second (QPS) from user metrics
   * Essential for determining server capacity requirements
   */
  calculateQPS(dailyActiveUsers, avgQueriesPerUser, peakMultiplier = 3) {
    const calculation = {
      type: 'QPS Calculation',
      inputs: { dailyActiveUsers, avgQueriesPerUser, peakMultiplier },
      steps: []
    };
    
    // Step 1: Calculate daily queries
    const dailyQueries = dailyActiveUsers * avgQueriesPerUser;
    calculation.steps.push({
      description: 'Daily total queries',
      formula: `${dailyActiveUsers} users × ${avgQueriesPerUser} queries/user`,
      result: `${dailyQueries.toLocaleString()} queries/day`
    });
    
    // Step 2: Calculate average QPS
    const avgQPS = dailyQueries / this.benchmarks.TIME_UNITS.day;
    calculation.steps.push({
      description: 'Average QPS',
      formula: `${dailyQueries.toLocaleString()} queries ÷ ${this.benchmarks.TIME_UNITS.day} seconds/day`,
      result: `${Math.round(avgQPS)} QPS`
    });
    
    // Step 3: Calculate peak QPS
    const peakQPS = avgQPS * peakMultiplier;
    calculation.steps.push({
      description: 'Peak QPS (with multiplier)',
      formula: `${Math.round(avgQPS)} QPS × ${peakMultiplier}`,
      result: `${Math.round(peakQPS)} QPS`
    });
    
    // Step 4: Determine server count
    const qpsPerServer = 1000; // Typical web server capacity
    const serversNeeded = Math.ceil(peakQPS / qpsPerServer);
    calculation.steps.push({
      description: 'Servers needed',
      formula: `${Math.round(peakQPS)} peak QPS ÷ ${qpsPerServer} QPS/server`,
      result: `${serversNeeded} servers`
    });
    
    calculation.results = {
      avgQPS: Math.round(avgQPS),
      peakQPS: Math.round(peakQPS),
      serversNeeded: serversNeeded,
      dailyQueries: dailyQueries
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate read/write QPS breakdown for database sizing
   * Critical for determining database architecture needs
   */
  calculateReadWriteQPS(totalQPS, readRatio = 0.8) {
    const calculation = {
      type: 'Read/Write QPS Breakdown',
      inputs: { totalQPS, readRatio },
      steps: []
    };
    
    const writeRatio = 1 - readRatio;
    const readQPS = totalQPS * readRatio;
    const writeQPS = totalQPS * writeRatio;
    
    calculation.steps.push({
      description: 'Read QPS',
      formula: `${totalQPS} total QPS × ${readRatio} read ratio`,
      result: `${Math.round(readQPS)} read QPS`
    });
    
    calculation.steps.push({
      description: 'Write QPS',
      formula: `${totalQPS} total QPS × ${writeRatio} write ratio`,
      result: `${Math.round(writeQPS)} write QPS`
    });
    
    // Database server recommendations
    const readServers = Math.ceil(readQPS / 5000); // Read replicas can handle more
    const writeServers = Math.max(1, Math.ceil(writeQPS / 1000)); // Write servers are more constrained
    
    calculation.steps.push({
      description: 'Read servers (replicas) needed',
      formula: `${Math.round(readQPS)} read QPS ÷ 5000 QPS/server`,
      result: `${readServers} read servers`
    });
    
    calculation.steps.push({
      description: 'Write servers (masters) needed',
      formula: `${Math.round(writeQPS)} write QPS ÷ 1000 QPS/server`,
      result: `${writeServers} write servers`
    });
    
    calculation.results = {
      readQPS: Math.round(readQPS),
      writeQPS: Math.round(writeQPS),
      readServers: readServers,
      writeServers: writeServers
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // Storage Calculations
  // ========================

  /**
   * Calculate storage requirements for a given dataset
   * Includes data growth projections and replication overhead
   */
  calculateStorage(recordCount, avgRecordSize, growthRate = 0.2, replicationFactor = 3, compressionRatio = 0.7) {
    const calculation = {
      type: 'Storage Requirements',
      inputs: { recordCount, avgRecordSize, growthRate, replicationFactor, compressionRatio },
      steps: []
    };
    
    // Step 1: Base storage requirement
    const baseStorage = recordCount * avgRecordSize;
    calculation.steps.push({
      description: 'Base storage (uncompressed)',
      formula: `${recordCount.toLocaleString()} records × ${avgRecordSize} bytes/record`,
      result: this.formatBytes(baseStorage)
    });
    
    // Step 2: After compression
    const compressedStorage = baseStorage * compressionRatio;
    calculation.steps.push({
      description: 'After compression',
      formula: `${this.formatBytes(baseStorage)} × ${compressionRatio} compression ratio`,
      result: this.formatBytes(compressedStorage)
    });
    
    // Step 3: With replication
    const replicatedStorage = compressedStorage * replicationFactor;
    calculation.steps.push({
      description: 'With replication',
      formula: `${this.formatBytes(compressedStorage)} × ${replicationFactor} replicas`,
      result: this.formatBytes(replicatedStorage)
    });
    
    // Step 4: 5-year growth projection
    const yearsToProject = 5;
    const futureStorage = replicatedStorage * Math.pow(1 + growthRate, yearsToProject);
    calculation.steps.push({
      description: `Storage after ${yearsToProject} years`,
      formula: `${this.formatBytes(replicatedStorage)} × (1 + ${growthRate})^${yearsToProject}`,
      result: this.formatBytes(futureStorage)
    });
    
    // Step 5: Database server count estimation
    const storagePerServer = 2 * Math.pow(1024, 4); // 2TB per server
    const serversNeeded = Math.ceil(futureStorage / storagePerServer);
    calculation.steps.push({
      description: 'Database servers needed',
      formula: `${this.formatBytes(futureStorage)} ÷ ${this.formatBytes(storagePerServer)} per server`,
      result: `${serversNeeded} servers`
    });
    
    calculation.results = {
      baseStorage: baseStorage,
      compressedStorage: compressedStorage,
      replicatedStorage: replicatedStorage,
      futureStorage: futureStorage,
      serversNeeded: serversNeeded
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate cache storage requirements
   * Determines optimal cache size for hit rate targets
   */
  calculateCacheStorage(totalDataSize, targetHitRate = 0.8, hotDataRatio = 0.2) {
    const calculation = {
      type: 'Cache Storage Requirements',
      inputs: { totalDataSize, targetHitRate, hotDataRatio },
      steps: []
    };
    
    // Rule of thumb: cache 20% of data to get 80% hit rate (Pareto principle)
    const recommendedCacheSize = totalDataSize * hotDataRatio;
    calculation.steps.push({
      description: 'Recommended cache size (80/20 rule)',
      formula: `${this.formatBytes(totalDataSize)} × ${hotDataRatio} hot data ratio`,
      result: this.formatBytes(recommendedCacheSize)
    });
    
    // Adjust based on target hit rate
    const adjustmentFactor = Math.pow(targetHitRate / 0.8, 2); // Exponential relationship
    const adjustedCacheSize = recommendedCacheSize * adjustmentFactor;
    calculation.steps.push({
      description: `Adjusted for ${(targetHitRate * 100).toFixed(0)}% hit rate`,
      formula: `${this.formatBytes(recommendedCacheSize)} × ${adjustmentFactor.toFixed(2)} adjustment`,
      result: this.formatBytes(adjustedCacheSize)
    });
    
    // Calculate memory servers needed (assuming 64GB RAM servers with 50GB available for cache)
    const cachePerServer = 50 * Math.pow(1024, 3); // 50GB
    const cacheServers = Math.ceil(adjustedCacheSize / cachePerServer);
    calculation.steps.push({
      description: 'Cache servers needed',
      formula: `${this.formatBytes(adjustedCacheSize)} ÷ ${this.formatBytes(cachePerServer)} per server`,
      result: `${cacheServers} cache servers`
    });
    
    calculation.results = {
      recommendedCacheSize: recommendedCacheSize,
      adjustedCacheSize: adjustedCacheSize,
      cacheServers: cacheServers,
      expectedHitRate: targetHitRate
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // Bandwidth Calculations
  // ========================

  /**
   * Calculate bandwidth requirements for a system
   * Includes peak load handling and CDN considerations
   */
  calculateBandwidth(avgRequestSize, qps, peakMultiplier = 3, cdnOffloadRatio = 0.7) {
    const calculation = {
      type: 'Bandwidth Requirements',
      inputs: { avgRequestSize, qps, peakMultiplier, cdnOffloadRatio },
      steps: []
    };
    
    // Step 1: Average bandwidth
    const avgBandwidthBps = avgRequestSize * qps * 8; // Convert bytes to bits
    calculation.steps.push({
      description: 'Average bandwidth',
      formula: `${avgRequestSize} bytes/request × ${qps} QPS × 8 bits/byte`,
      result: this.formatBandwidth(avgBandwidthBps)
    });
    
    // Step 2: Peak bandwidth (before CDN)
    const peakBandwidthBps = avgBandwidthBps * peakMultiplier;
    calculation.steps.push({
      description: 'Peak bandwidth (before CDN)',
      formula: `${this.formatBandwidth(avgBandwidthBps)} × ${peakMultiplier}`,
      result: this.formatBandwidth(peakBandwidthBps)
    });
    
    // Step 3: After CDN offloading
    const originBandwidthBps = peakBandwidthBps * (1 - cdnOffloadRatio);
    calculation.steps.push({
      description: 'Origin bandwidth (after CDN)',
      formula: `${this.formatBandwidth(peakBandwidthBps)} × ${(1 - cdnOffloadRatio).toFixed(1)} (CDN offloads ${(cdnOffloadRatio * 100).toFixed(0)}%)`,
      result: this.formatBandwidth(originBandwidthBps)
    });
    
    // Step 4: Internet connectivity needed
    const connectivityGbps = Math.ceil((originBandwidthBps / Math.pow(10, 9)) * 1.5); // 50% buffer
    calculation.steps.push({
      description: 'Internet connectivity needed',
      formula: `${this.formatBandwidth(originBandwidthBps)} with 50% buffer`,
      result: `${connectivityGbps} Gbps`
    });
    
    calculation.results = {
      avgBandwidthBps: avgBandwidthBps,
      peakBandwidthBps: peakBandwidthBps,
      originBandwidthBps: originBandwidthBps,
      connectivityGbps: connectivityGbps
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // System Capacity Calculations
  // ========================

  /**
   * Calculate overall system capacity for a social media platform
   * Comprehensive example combining all metrics
   */
  calculateSocialMediaSystem(monthlyActiveUsers, dailyActiveRatio = 0.1, postsPerUserPerDay = 2) {
    const calculation = {
      type: 'Social Media System Capacity',
      inputs: { monthlyActiveUsers, dailyActiveRatio, postsPerUserPerDay },
      steps: []
    };
    
    // Step 1: Daily active users
    const dailyActiveUsers = Math.floor(monthlyActiveUsers * dailyActiveRatio);
    calculation.steps.push({
      description: 'Daily active users',
      formula: `${monthlyActiveUsers.toLocaleString()} MAU × ${dailyActiveRatio} daily ratio`,
      result: `${dailyActiveUsers.toLocaleString()} DAU`
    });
    
    // Step 2: QPS calculation (reads are 100x writes for social media)
    const writeQPS = this.calculateQPS(dailyActiveUsers, postsPerUserPerDay, 5).results.peakQPS;
    const readQPS = writeQPS * 100; // Social media is read-heavy
    const totalQPS = writeQPS + readQPS;
    
    calculation.steps.push({
      description: 'Write QPS (posts, likes, comments)',
      formula: `Peak QPS from user posting activity`,
      result: `${writeQPS.toLocaleString()} write QPS`
    });
    
    calculation.steps.push({
      description: 'Read QPS (timeline, profile views)',
      formula: `${writeQPS.toLocaleString()} write QPS × 100 (read/write ratio)`,
      result: `${readQPS.toLocaleString()} read QPS`
    });
    
    // Step 3: Storage calculation
    const avgPostSize = 500; // bytes (text + metadata)
    const postsPerDay = dailyActiveUsers * postsPerUserPerDay;
    const storageCalc = this.calculateStorage(
      postsPerDay * 365, // yearly posts
      avgPostSize,
      0.3, // 30% yearly growth
      3, // replication factor
      0.8 // compression ratio
    );
    
    calculation.steps.push({
      description: 'Storage for posts (per year)',
      formula: `${postsPerDay.toLocaleString()} posts/day × 365 days × ${avgPostSize} bytes`,
      result: this.formatBytes(storageCalc.results.replicatedStorage)
    });
    
    // Step 4: CDN and media storage
    const mediaPostRatio = 0.6; // 60% of posts have media
    const avgMediaSize = 2 * Math.pow(1024, 2); // 2MB average
    const mediaStoragePerYear = postsPerDay * 365 * mediaPostRatio * avgMediaSize * 3; // 3x replication
    
    calculation.steps.push({
      description: 'Media storage (images, videos)',
      formula: `${postsPerDay.toLocaleString()} posts/day × 365 × ${mediaPostRatio} media ratio × ${this.formatBytes(avgMediaSize)}`,
      result: this.formatBytes(mediaStoragePerYear)
    });
    
    // Step 5: Cache requirements
    const cacheCalc = this.calculateCacheStorage(
      storageCalc.results.replicatedStorage + mediaStoragePerYear,
      0.85, // 85% hit rate target
      0.15  // 15% hot data
    );
    
    calculation.steps.push({
      description: 'Cache storage needed',
      formula: `15% of total data for 85% hit rate`,
      result: this.formatBytes(cacheCalc.results.adjustedCacheSize)
    });
    
    // Step 6: Server estimates
    const webServers = Math.ceil(totalQPS / 2000); // 2K QPS per web server
    const dbServers = Math.ceil(writeQPS / 1000) + Math.ceil(readQPS / 5000);
    const cacheServers = cacheCalc.results.cacheServers;
    
    calculation.steps.push({
      description: 'Infrastructure summary',
      formula: 'Based on QPS and storage calculations',
      result: `${webServers} web servers, ${dbServers} DB servers, ${cacheServers} cache servers`
    });
    
    calculation.results = {
      dailyActiveUsers: dailyActiveUsers,
      writeQPS: writeQPS,
      readQPS: readQPS,
      totalQPS: totalQPS,
      yearlyStorage: storageCalc.results.replicatedStorage,
      mediaStorage: mediaStoragePerYear,
      cacheStorage: cacheCalc.results.adjustedCacheSize,
      webServers: webServers,
      dbServers: dbServers,
      cacheServers: cacheServers
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  /**
   * Calculate video streaming platform capacity (like YouTube)
   * High bandwidth and storage requirements
   */
  calculateVideoStreamingSystem(hoursUploadedPerMinute, avgViewsPerVideo = 1000, avgVideoDuration = 5) {
    const calculation = {
      type: 'Video Streaming System Capacity',
      inputs: { hoursUploadedPerMinute, avgViewsPerVideo, avgVideoDuration },
      steps: []
    };
    
    // Step 1: Upload rate and storage
    const minutesUploadedPerMinute = hoursUploadedPerMinute * 60;
    const uploadStoragePerDay = minutesUploadedPerMinute * 1440 * this.benchmarks.DATA_SIZES.video_minute; // 1440 minutes per day
    
    calculation.steps.push({
      description: 'Video upload storage per day',
      formula: `${hoursUploadedPerMinute} hours/min × 60 × 1440 min/day × ${this.formatBytes(this.benchmarks.DATA_SIZES.video_minute)}/min`,
      result: this.formatBytes(uploadStoragePerDay)
    });
    
    // Step 2: Multiple quality versions (480p, 720p, 1080p, 4K)
    const qualityMultiplier = 1 + 0.5 + 2 + 8; // Relative storage sizes
    const totalStoragePerDay = uploadStoragePerDay * qualityMultiplier;
    
    calculation.steps.push({
      description: 'All quality versions',
      formula: `${this.formatBytes(uploadStoragePerDay)} × ${qualityMultiplier} (multiple qualities)`,
      result: this.formatBytes(totalStoragePerDay)
    });
    
    // Step 3: View QPS calculation
    const videosPerDay = (hoursUploadedPerMinute * 60) / avgVideoDuration;
    const viewsPerDay = videosPerDay * avgViewsPerVideo;
    const viewQPS = viewsPerDay / this.benchmarks.TIME_UNITS.day;
    const peakViewQPS = viewQPS * 3;
    
    calculation.steps.push({
      description: 'Peak view QPS',
      formula: `${videosPerDay.toFixed(0)} videos/day × ${avgViewsPerVideo} views × 3x peak`,
      result: `${Math.round(peakViewQPS).toLocaleString()} QPS`
    });
    
    // Step 4: Bandwidth calculation
    const avgBitrate = 2000000; // 2 Mbps average
    const avgVideoBytes = (avgVideoDuration * 60 * avgBitrate) / 8; // Convert to bytes
    const peakBandwidthBps = peakViewQPS * avgVideoBytes * 8; // Convert to bits
    
    calculation.steps.push({
      description: 'Peak bandwidth requirement',
      formula: `${Math.round(peakViewQPS).toLocaleString()} QPS × ${this.formatBytes(avgVideoBytes)} × 8 bits/byte`,
      result: this.formatBandwidth(peakBandwidthBps)
    });
    
    // Step 5: CDN and edge servers
    const edgeLocations = 200; // Global edge locations
    const avgBandwidthPerEdge = peakBandwidthBps / edgeLocations;
    
    calculation.steps.push({
      description: 'Bandwidth per edge location',
      formula: `${this.formatBandwidth(peakBandwidthBps)} ÷ ${edgeLocations} edge locations`,
      result: this.formatBandwidth(avgBandwidthPerEdge)
    });
    
    // Step 6: Storage servers needed
    const storagePerServer = 100 * Math.pow(1024, 4); // 100TB per storage server
    const storageServers = Math.ceil(totalStoragePerDay * 365 / storagePerServer);
    
    calculation.steps.push({
      description: 'Storage servers needed (yearly)',
      formula: `${this.formatBytes(totalStoragePerDay)} × 365 days ÷ ${this.formatBytes(storagePerServer)}/server`,
      result: `${storageServers.toLocaleString()} servers`
    });
    
    calculation.results = {
      uploadStoragePerDay: uploadStoragePerDay,
      totalStoragePerDay: totalStoragePerDay,
      peakViewQPS: Math.round(peakViewQPS),
      peakBandwidthBps: peakBandwidthBps,
      storageServers: storageServers,
      edgeLocations: edgeLocations
    };
    
    this.logCalculation(calculation);
    return calculation;
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Format bytes in human-readable format
   */
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Format bandwidth in human-readable format
   */
  formatBandwidth(bitsPerSecond) {
    const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
    let speed = bitsPerSecond;
    let unitIndex = 0;
    
    while (speed >= 1000 && unitIndex < units.length - 1) {
      speed /= 1000;
      unitIndex++;
    }
    
    return `${speed.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Log calculation for review and learning
   */
  logCalculation(calculation) {
    calculation.timestamp = new Date().toISOString();
    this.calculations.push(calculation);
    
    // Keep only last 50 calculations to prevent memory issues
    if (this.calculations.length > 50) {
      this.calculations = this.calculations.slice(-50);
    }
  }

  /**
   * Generate a formatted report of a calculation
   */
  generateReport(calculation) {
    let report = `\n=== ${calculation.type} ===\n`;
    
    report += '\n📋 Inputs:\n';
    for (const [key, value] of Object.entries(calculation.inputs)) {
      report += `  • ${key}: ${typeof value === 'number' ? value.toLocaleString() : value}\n`;
    }
    
    report += '\n🧮 Calculation Steps:\n';
    calculation.steps.forEach((step, index) => {
      report += `  ${index + 1}. ${step.description}\n`;
      report += `     Formula: ${step.formula}\n`;
      report += `     Result: ${step.result}\n\n`;
    });
    
    report += '📊 Final Results:\n';
    for (const [key, value] of Object.entries(calculation.results)) {
      const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
      report += `  • ${key}: ${formattedValue}\n`;
    }
    
    return report;
  }

  /**
   * Get quick reference for common benchmarks
   */
  getBenchmarkReference() {
    return {
      'Typical QPS per server': {
        'Web server (simple)': '2,000 QPS',
        'Web server (complex)': '500 QPS',
        'Database (read)': '5,000 QPS',
        'Database (write)': '1,000 QPS',
        'Cache server': '100,000 QPS'
      },
      'Latency expectations': {
        'Memory access': '100 ns',
        'SSD access': '1 ms',
        'Network (same DC)': '0.5 ms',
        'Network (cross DC)': '50 ms',
        'Internet round trip': '150 ms'
      },
      'Storage per server': {
        'Database server': '2 TB',
        'Object storage': '100 TB',
        'Cache server RAM': '64 GB'
      },
      'Data size estimates': {
        'Tweet': '140 bytes',
        'Facebook post': '500 bytes',
        'Photo thumbnail': '20 KB',
        'Photo full size': '2 MB',
        'Video per minute': '50 MB'
      }
    };
  }

  /**
   * Get calculation history
   */
  getCalculationHistory() {
    return this.calculations.map(calc => ({
      type: calc.type,
      timestamp: calc.timestamp,
      summary: calc.results
    }));
  }
}

// ========================
// Usage Examples and Interview Scenarios
// ========================

/**
 * Demonstrate common interview scaling calculations
 */
function demonstrateInterviewCalculations() {
  console.log('=== System Design Interview Calculations ===');
  
  const calculator = new ScalingCalculator();
  
  // Example 1: Design Twitter-like system
  console.log('\n🐦 Twitter-like Social Media Platform');
  const twitterSystem = calculator.calculateSocialMediaSystem(
    500000000, // 500M MAU
    0.1,        // 10% daily active ratio
    2           // 2 posts per user per day
  );
  console.log(calculator.generateReport(twitterSystem));
  
  // Example 2: Design YouTube-like system
  console.log('\n🎬 Video Streaming Platform (YouTube-scale)');
  const youtubeSystem = calculator.calculateVideoStreamingSystem(
    500,  // 500 hours uploaded per minute
    1000, // 1000 views per video average
    4     // 4 minute average duration
  );
  console.log(calculator.generateReport(youtubeSystem));
  
  // Example 3: Basic QPS calculation
  console.log('\n📈 QPS Calculation Example');
  const qpsCalc = calculator.calculateQPS(
    1000000, // 1M daily active users
    50,      // 50 requests per user per day
    4        // 4x peak multiplier
  );
  console.log(calculator.generateReport(qpsCalc));
  
  // Example 4: Storage calculation
  console.log('\n💾 Storage Calculation Example');
  const storageCalc = calculator.calculateStorage(
    10000000, // 10M records
    2048,     // 2KB per record
    0.25,     // 25% annual growth
    3,        // 3x replication
    0.6       // 60% compression ratio
  );
  console.log(calculator.generateReport(storageCalc));
  
  // Show benchmark reference
  console.log('\n📚 Quick Reference Benchmarks');
  const benchmarks = calculator.getBenchmarkReference();
  for (const [category, values] of Object.entries(benchmarks)) {
    console.log(`\n${category}:`);
    for (const [metric, value] of Object.entries(values)) {
      console.log(`  • ${metric}: ${value}`);
    }
  }
}

/**
 * Practice problems for interview preparation
 */
function practiceInterviewProblems() {
  console.log('\n=== Practice Interview Problems ===');
  
  const calculator = new ScalingCalculator();
  
  const problems = [
    {
      title: "Design WhatsApp",
      description: "500M daily active users, each sending 40 messages per day",
      solution: () => {
        const msgSystem = calculator.calculateQPS(500000000, 40, 3);
        const storage = calculator.calculateStorage(500000000 * 40, 100, 0.2, 3, 0.8);
        return { qps: msgSystem.results, storage: storage.results };
      }
    },
    {
      title: "Design Uber",
      description: "10M daily active users, 1M drivers, 2 rides per user per day",
      solution: () => {
        const rideSystem = calculator.calculateQPS(10000000, 2, 5);
        const locationUpdates = calculator.calculateQPS(1000000, 3600, 2); // Driver location updates
        return { rides: rideSystem.results, locationUpdates: locationUpdates.results };
      }
    },
    {
      title: "Design TikTok",
      description: "1B MAU, 10% daily active, 5 videos viewed per session",
      solution: () => {
        const videoSystem = calculator.calculateSocialMediaSystem(1000000000, 0.1, 0.5);
        return videoSystem.results;
      }
    }
  ];
  
  problems.forEach((problem, index) => {
    console.log(`\n📝 Problem ${index + 1}: ${problem.title}`);
    console.log(`Description: ${problem.description}`);
    console.log('Solution:');
    const solution = problem.solution();
    console.log(JSON.stringify(solution, null, 2));
  });
}

// Export for use in other modules
module.exports = { 
  ScalingCalculator,
  SCALING_BENCHMARKS,
  demonstrateInterviewCalculations,
  practiceInterviewProblems
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
  demonstrateInterviewCalculations();
  practiceInterviewProblems();
}