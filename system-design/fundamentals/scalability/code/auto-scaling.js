/**
 * File: auto-scaling.js
 * Description: Auto-scaling controller implementation with multiple strategies
 * 
 * Learning objectives:
 * - Understand reactive, predictive, and scheduled scaling approaches
 * - Learn metric-based scaling decisions and cooldown periods
 * - See cloud provider integration patterns and capacity planning
 * - Understand scaling policies and threshold management
 * 
 * Time Complexity: O(1) for metric evaluation, O(N) for historical analysis
 * Space Complexity: O(N) where N is the number of metrics stored
 */

const EventEmitter = require('events');

// Configuration constants for auto-scaling behavior
const DEFAULT_SCALE_UP_THRESHOLD = 70; // CPU percentage
const DEFAULT_SCALE_DOWN_THRESHOLD = 30; // CPU percentage
const DEFAULT_COOLDOWN_PERIOD = 300000; // 5 minutes in milliseconds
const DEFAULT_MIN_INSTANCES = 2;
const DEFAULT_MAX_INSTANCES = 20;
const METRICS_RETENTION_PERIOD = 3600000; // 1 hour in milliseconds
const EVALUATION_INTERVAL = 30000; // 30 seconds

/**
 * Auto Scaling Controller with multiple scaling strategies
 * Supports reactive, predictive, and scheduled scaling policies
 */
class AutoScaler extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Basic scaling configuration
    this.minInstances = config.minInstances || DEFAULT_MIN_INSTANCES;
    this.maxInstances = config.maxInstances || DEFAULT_MAX_INSTANCES;
    this.currentInstances = config.currentInstances || this.minInstances;
    
    // Threshold configuration
    this.scaleUpThreshold = config.scaleUpThreshold || DEFAULT_SCALE_UP_THRESHOLD;
    this.scaleDownThreshold = config.scaleDownThreshold || DEFAULT_SCALE_DOWN_THRESHOLD;
    
    // Cooldown periods to prevent thrashing
    this.scaleUpCooldown = config.scaleUpCooldown || DEFAULT_COOLDOWN_PERIOD;
    this.scaleDownCooldown = config.scaleDownCooldown || DEFAULT_COOLDOWN_PERIOD;
    
    // Scaling behavior configuration
    this.scaleUpStep = config.scaleUpStep || 1;
    this.scaleDownStep = config.scaleDownStep || 1;
    this.evaluationPeriods = config.evaluationPeriods || 2; // Consecutive periods above threshold
    
    // Strategy selection
    this.strategy = config.strategy || 'reactive'; // reactive, predictive, scheduled
    
    // State tracking
    this.lastScaleUpTime = 0;
    this.lastScaleDownTime = 0;
    this.consecutivePeriods = { up: 0, down: 0 };
    
    // Metrics storage and monitoring
    this.metrics = [];
    this.metricProviders = new Map();
    this.schedules = [];
    
    // Predictive scaling state
    this.historicalPatterns = new Map();
    this.predictionModel = null;
    
    // Monitoring state
    this.isRunning = false;
    this.evaluationTimer = null;
    
    console.log(`AutoScaler initialized: ${this.minInstances}-${this.maxInstances} instances, ${this.strategy} strategy`);
  }

  /**
   * Start the auto-scaling monitoring and evaluation process
   */
  start() {
    if (this.isRunning) {
      console.warn('AutoScaler is already running');
      return;
    }
    
    this.isRunning = true;
    this.evaluationTimer = setInterval(() => {
      this.evaluateScaling().catch(error => {
        console.error('Error during scaling evaluation:', error);
        this.emit('error', error);
      });
    }, EVALUATION_INTERVAL);
    
    console.log('AutoScaler started');
    this.emit('started');
  }

  /**
   * Stop the auto-scaling monitoring
   */
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = null;
    }
    
    console.log('AutoScaler stopped');
    this.emit('stopped');
  }

  /**
   * Add a metric provider for scaling decisions
   * Provider should have a getMetric() method that returns current value
   */
  addMetricProvider(name, provider) {
    if (typeof provider.getMetric !== 'function') {
      throw new Error('Metric provider must have a getMetric() method');
    }
    
    this.metricProviders.set(name, provider);
    console.log(`Metric provider added: ${name}`);
  }

  /**
   * Add a scheduled scaling event
   * Schedule format: { time: 'HH:MM', instances: number, days: [0,1,2,3,4,5,6] }
   */
  addSchedule(schedule) {
    if (!schedule.time || !schedule.instances) {
      throw new Error('Schedule must have time and instances properties');
    }
    
    // Parse time format (HH:MM)
    const [hours, minutes] = schedule.time.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Use HH:MM (24-hour format)');
    }
    
    schedule.hours = hours;
    schedule.minutes = minutes;
    schedule.days = schedule.days || [0,1,2,3,4,5,6]; // Default: all days
    
    this.schedules.push(schedule);
    console.log(`Schedule added: ${schedule.time} -> ${schedule.instances} instances`);
  }

  /**
   * Main scaling evaluation logic - determines if scaling action is needed
   */
  async evaluateScaling() {
    try {
      // Collect current metrics from all providers
      const currentMetrics = await this.collectMetrics();
      
      // Store metrics for historical analysis
      this.storeMetrics(currentMetrics);
      
      // Choose evaluation strategy
      let scalingDecision;
      switch (this.strategy) {
        case 'reactive':
          scalingDecision = this.evaluateReactiveScaling(currentMetrics);
          break;
        case 'predictive':
          scalingDecision = await this.evaluatePredictiveScaling(currentMetrics);
          break;
        case 'scheduled':
          scalingDecision = this.evaluateScheduledScaling(currentMetrics);
          break;
        default:
          throw new Error(`Unknown scaling strategy: ${this.strategy}`);
      }
      
      // Execute scaling decision if needed
      if (scalingDecision.action !== 'none') {
        await this.executeScaling(scalingDecision);
      }
      
    } catch (error) {
      console.error('Scaling evaluation failed:', error);
      this.emit('evaluation_error', error);
    }
  }

  /**
   * Reactive Scaling: Scale based on current metrics exceeding thresholds
   * Most common approach - responds to current load conditions
   */
  evaluateReactiveScaling(metrics) {
    const now = Date.now();
    
    // Calculate average of primary metrics (CPU, memory, etc.)
    const avgCpu = this.calculateAverageMetric(metrics, 'cpu');
    const avgMemory = this.calculateAverageMetric(metrics, 'memory');
    const currentLoad = Math.max(avgCpu, avgMemory); // Use highest utilization
    
    // Check for scale-up conditions
    if (currentLoad >= this.scaleUpThreshold) {
      this.consecutivePeriods.up++;
      this.consecutivePeriods.down = 0; // Reset down counter
      
      // Check cooldown period and consecutive threshold breaches
      if (this.consecutivePeriods.up >= this.evaluationPeriods &&
          now - this.lastScaleUpTime >= this.scaleUpCooldown) {
        
        const targetInstances = Math.min(
          this.maxInstances,
          this.currentInstances + this.scaleUpStep
        );
        
        return {
          action: 'scale_up',
          currentInstances: this.currentInstances,
          targetInstances: targetInstances,
          reason: `High load: ${currentLoad.toFixed(1)}% (threshold: ${this.scaleUpThreshold}%)`,
          metrics: { cpu: avgCpu, memory: avgMemory }
        };
      }
    }
    
    // Check for scale-down conditions
    else if (currentLoad <= this.scaleDownThreshold) {
      this.consecutivePeriods.down++;
      this.consecutivePeriods.up = 0; // Reset up counter
      
      // Check cooldown period and consecutive threshold breaches
      if (this.consecutivePeriods.down >= this.evaluationPeriods &&
          now - this.lastScaleDownTime >= this.scaleDownCooldown) {
        
        const targetInstances = Math.max(
          this.minInstances,
          this.currentInstances - this.scaleDownStep
        );
        
        return {
          action: 'scale_down',
          currentInstances: this.currentInstances,
          targetInstances: targetInstances,
          reason: `Low load: ${currentLoad.toFixed(1)}% (threshold: ${this.scaleDownThreshold}%)`,
          metrics: { cpu: avgCpu, memory: avgMemory }
        };
      }
    }
    
    // Reset consecutive periods if we're in the middle range
    else {
      this.consecutivePeriods.up = 0;
      this.consecutivePeriods.down = 0;
    }
    
    return {
      action: 'none',
      currentInstances: this.currentInstances,
      targetInstances: this.currentInstances,
      reason: `Load within normal range: ${currentLoad.toFixed(1)}%`,
      metrics: { cpu: avgCpu, memory: avgMemory }
    };
  }

  /**
   * Predictive Scaling: Scale based on forecasted demand using historical patterns
   * More advanced approach that anticipates load changes
   */
  async evaluatePredictiveScaling(metrics) {
    const now = new Date();
    
    // Update historical patterns for machine learning
    this.updateHistoricalPatterns(metrics, now);
    
    // Predict future load based on historical patterns
    const prediction = this.predictFutureLoad(now);
    
    // Make scaling decision based on prediction
    if (prediction.confidence > 0.7) { // High confidence threshold
      const predictedLoad = prediction.load;
      
      if (predictedLoad > this.scaleUpThreshold * 1.2) { // Scale up proactively
        const targetInstances = Math.min(
          this.maxInstances,
          Math.ceil(this.currentInstances * (predictedLoad / 100))
        );
        
        return {
          action: 'scale_up',
          currentInstances: this.currentInstances,
          targetInstances: targetInstances,
          reason: `Predicted high load: ${predictedLoad.toFixed(1)}% (confidence: ${(prediction.confidence * 100).toFixed(1)}%)`,
          prediction: prediction
        };
      }
      
      if (predictedLoad < this.scaleDownThreshold * 0.8) { // Scale down proactively
        const targetInstances = Math.max(
          this.minInstances,
          Math.ceil(this.currentInstances * (predictedLoad / 100))
        );
        
        return {
          action: 'scale_down',
          currentInstances: this.currentInstances,
          targetInstances: targetInstances,
          reason: `Predicted low load: ${predictedLoad.toFixed(1)}% (confidence: ${(prediction.confidence * 100).toFixed(1)}%)`,
          prediction: prediction
        };
      }
    }
    
    // Fallback to reactive scaling if prediction confidence is low
    return this.evaluateReactiveScaling(metrics);
  }

  /**
   * Scheduled Scaling: Scale based on predefined schedules
   * Good for applications with known traffic patterns
   */
  evaluateScheduledScaling(metrics) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Find applicable schedules for current time
    const applicableSchedules = this.schedules.filter(schedule => {
      return schedule.days.includes(currentDay) &&
             schedule.hours === currentHours &&
             Math.abs(schedule.minutes - currentMinutes) <= 1; // Within 1 minute tolerance
    });
    
    if (applicableSchedules.length > 0) {
      // Use the schedule with the highest instance count if multiple match
      const targetSchedule = applicableSchedules.reduce((max, schedule) => 
        schedule.instances > max.instances ? schedule : max
      );
      
      if (targetSchedule.instances !== this.currentInstances) {
        return {
          action: targetSchedule.instances > this.currentInstances ? 'scale_up' : 'scale_down',
          currentInstances: this.currentInstances,
          targetInstances: targetSchedule.instances,
          reason: `Scheduled scaling: ${targetSchedule.time} -> ${targetSchedule.instances} instances`,
          schedule: targetSchedule
        };
      }
    }
    
    // No applicable schedule found, use reactive scaling as fallback
    return this.evaluateReactiveScaling(metrics);
  }

  /**
   * Execute the scaling decision by calling cloud provider APIs
   * In a real implementation, this would integrate with AWS Auto Scaling, 
   * Kubernetes HPA, or other scaling mechanisms
   */
  async executeScaling(decision) {
    try {
      console.log(`\n=== SCALING ACTION ===`);
      console.log(`Action: ${decision.action.toUpperCase()}`);
      console.log(`Reason: ${decision.reason}`);
      console.log(`Instances: ${decision.currentInstances} -> ${decision.targetInstances}`);
      
      // Simulate cloud provider API call delay
      await this.simulateCloudProviderCall(decision);
      
      // Update instance count and timestamps
      const oldCount = this.currentInstances;
      this.currentInstances = decision.targetInstances;
      
      if (decision.action === 'scale_up') {
        this.lastScaleUpTime = Date.now();
        this.consecutivePeriods.up = 0; // Reset after successful scaling
      } else {
        this.lastScaleDownTime = Date.now();
        this.consecutivePeriods.down = 0; // Reset after successful scaling
      }
      
      // Emit scaling event
      this.emit('scaling_action', {
        action: decision.action,
        oldCount: oldCount,
        newCount: this.currentInstances,
        reason: decision.reason,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Scaling completed: ${oldCount} -> ${this.currentInstances} instances`);
      
    } catch (error) {
      console.error('Scaling execution failed:', error);
      this.emit('scaling_error', { decision, error });
    }
  }

  /**
   * Simulate cloud provider API call with realistic delay and error handling
   */
  async simulateCloudProviderCall(decision) {
    // Simulate API call delay (1-5 seconds)
    const delay = 1000 + Math.random() * 4000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional API failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Cloud provider API temporarily unavailable');
    }
    
    console.log(`Cloud provider API call completed in ${delay.toFixed(0)}ms`);
  }

  // ========================
  // Metrics Collection and Analysis
  // ========================

  /**
   * Collect metrics from all registered providers
   */
  async collectMetrics() {
    const metrics = {
      timestamp: Date.now(),
      values: {}
    };
    
    for (const [name, provider] of this.metricProviders.entries()) {
      try {
        metrics.values[name] = await provider.getMetric();
      } catch (error) {
        console.error(`Failed to collect metric ${name}:`, error);
        metrics.values[name] = null;
      }
    }
    
    return metrics;
  }

  /**
   * Store metrics for historical analysis and cleanup old data
   */
  storeMetrics(metrics) {
    this.metrics.push(metrics);
    
    // Clean up old metrics beyond retention period
    const cutoff = Date.now() - METRICS_RETENTION_PERIOD;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Calculate average value for a specific metric type
   */
  calculateAverageMetric(metrics, metricName) {
    const value = metrics.values[metricName];
    if (value === null || value === undefined) {
      return 0;
    }
    
    // Handle different metric value types
    if (Array.isArray(value)) {
      return value.reduce((sum, v) => sum + v, 0) / value.length;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  /**
   * Update historical patterns for predictive scaling
   */
  updateHistoricalPatterns(metrics, timestamp) {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const key = `${dayOfWeek}-${hour}`; // e.g., "1-14" for Monday 2PM
    
    if (!this.historicalPatterns.has(key)) {
      this.historicalPatterns.set(key, []);
    }
    
    const avgLoad = Math.max(
      this.calculateAverageMetric(metrics, 'cpu'),
      this.calculateAverageMetric(metrics, 'memory')
    );
    
    const pattern = this.historicalPatterns.get(key);
    pattern.push(avgLoad);
    
    // Keep only recent historical data (last 30 data points)
    if (pattern.length > 30) {
      pattern.shift();
    }
  }

  /**
   * Predict future load based on historical patterns
   */
  predictFutureLoad(currentTime) {
    const futureTime = new Date(currentTime.getTime() + (15 * 60 * 1000)); // Predict 15 minutes ahead
    const hour = futureTime.getHours();
    const dayOfWeek = futureTime.getDay();
    const key = `${dayOfWeek}-${hour}`;
    
    const historicalData = this.historicalPatterns.get(key);
    
    if (!historicalData || historicalData.length < 5) {
      return { load: 50, confidence: 0.1 }; // Low confidence default
    }
    
    // Simple prediction using moving average and trend analysis
    const recentData = historicalData.slice(-10); // Last 10 data points
    const average = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
    
    // Calculate trend (simple linear regression)
    let trend = 0;
    if (recentData.length >= 2) {
      const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
      const secondHalf = recentData.slice(Math.floor(recentData.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      trend = secondAvg - firstAvg;
    }
    
    // Predict future load
    const predictedLoad = Math.max(0, Math.min(100, average + trend));
    
    // Calculate confidence based on data consistency
    const variance = recentData.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / recentData.length;
    const confidence = Math.max(0.1, Math.min(0.9, 1 - (variance / 1000))); // Normalize variance to confidence
    
    return { load: predictedLoad, confidence: confidence, trend: trend };
  }

  /**
   * Get current auto-scaler status and statistics
   */
  getStatus() {
    const now = Date.now();
    
    return {
      isRunning: this.isRunning,
      strategy: this.strategy,
      currentInstances: this.currentInstances,
      minInstances: this.minInstances,
      maxInstances: this.maxInstances,
      thresholds: {
        scaleUp: this.scaleUpThreshold,
        scaleDown: this.scaleDownThreshold
      },
      cooldowns: {
        scaleUp: this.scaleUpCooldown,
        scaleDown: this.scaleDownCooldown
      },
      lastActions: {
        scaleUp: this.lastScaleUpTime ? new Date(this.lastScaleUpTime).toISOString() : null,
        scaleDown: this.lastScaleDownTime ? new Date(this.lastScaleDownTime).toISOString() : null
      },
      consecutivePeriods: { ...this.consecutivePeriods },
      metricsCount: this.metrics.length,
      schedulesCount: this.schedules.length,
      providersCount: this.metricProviders.size
    };
  }

  /**
   * Update scaling configuration
   */
  updateConfig(config) {
    if (config.minInstances !== undefined) this.minInstances = config.minInstances;
    if (config.maxInstances !== undefined) this.maxInstances = config.maxInstances;
    if (config.scaleUpThreshold !== undefined) this.scaleUpThreshold = config.scaleUpThreshold;
    if (config.scaleDownThreshold !== undefined) this.scaleDownThreshold = config.scaleDownThreshold;
    if (config.scaleUpCooldown !== undefined) this.scaleUpCooldown = config.scaleUpCooldown;
    if (config.scaleDownCooldown !== undefined) this.scaleDownCooldown = config.scaleDownCooldown;
    
    console.log('AutoScaler configuration updated');
    this.emit('config_updated', config);
  }
}

// ========================
// Mock Metric Providers for Testing
// ========================

/**
 * Simulated CPU metric provider
 */
class MockCPUProvider {
  constructor() {
    this.baseLoad = 40;
    this.trend = 0;
  }
  
  async getMetric() {
    // Simulate realistic CPU load with some randomness and trends
    const randomVariation = (Math.random() - 0.5) * 20; // ±10%
    const trendInfluence = this.trend * 0.1;
    
    this.baseLoad = Math.max(10, Math.min(90, this.baseLoad + randomVariation + trendInfluence));
    
    // Occasionally simulate load spikes
    if (Math.random() < 0.05) { // 5% chance of spike
      this.trend = Math.random() * 20 - 5; // Set trend for sustained spike
      return Math.min(95, this.baseLoad + 30);
    }
    
    // Gradually return trend to neutral
    this.trend *= 0.9;
    
    return Math.round(this.baseLoad);
  }
}

/**
 * Simulated memory metric provider
 */
class MockMemoryProvider {
  constructor() {
    this.baseLoad = 35;
  }
  
  async getMetric() {
    // Memory tends to be more stable than CPU
    const variation = (Math.random() - 0.5) * 10; // ±5%
    this.baseLoad = Math.max(20, Math.min(85, this.baseLoad + variation));
    
    return Math.round(this.baseLoad);
  }
}

// ========================
// Usage Example and Testing
// ========================

/**
 * Example usage demonstrating auto-scaling scenarios
 */
async function demonstrateAutoScaling() {
  console.log('=== Auto Scaling Demonstration ===');
  
  // Create auto-scaler with reactive strategy
  const autoScaler = new AutoScaler({
    minInstances: 2,
    maxInstances: 10,
    currentInstances: 3,
    scaleUpThreshold: 75,
    scaleDownThreshold: 25,
    scaleUpCooldown: 60000, // 1 minute for demo
    scaleDownCooldown: 90000, // 1.5 minutes for demo
    evaluationPeriods: 2,
    strategy: 'reactive'
  });
  
  // Add metric providers
  autoScaler.addMetricProvider('cpu', new MockCPUProvider());
  autoScaler.addMetricProvider('memory', new MockMemoryProvider());
  
  // Add event listeners
  autoScaler.on('scaling_action', (event) => {
    console.log(`\n🔄 SCALING EVENT: ${event.action} (${event.oldCount} -> ${event.newCount})`);
    console.log(`   Reason: ${event.reason}`);
    console.log(`   Time: ${event.timestamp}`);
  });
  
  autoScaler.on('error', (error) => {
    console.error('❌ AutoScaler error:', error.message);
  });
  
  // Add scheduled scaling for demonstration
  autoScaler.addSchedule({
    time: new Date(Date.now() + 120000).toISOString().substr(11, 5), // 2 minutes from now
    instances: 6,
    days: [new Date().getDay()]
  });
  
  console.log('\nStarting auto-scaler monitoring...');
  autoScaler.start();
  
  // Let it run for a few minutes to demonstrate scaling
  console.log('Monitoring for 3 minutes...');
  
  // Print status every 30 seconds
  const statusInterval = setInterval(() => {
    const status = autoScaler.getStatus();
    console.log(`\n📊 Status: ${status.currentInstances} instances running`);
    console.log(`   Strategy: ${status.strategy}, Running: ${status.isRunning}`);
    console.log(`   Consecutive periods: up=${status.consecutivePeriods.up}, down=${status.consecutivePeriods.down}`);
  }, 30000);
  
  // Stop after demo period
  setTimeout(() => {
    clearInterval(statusInterval);
    autoScaler.stop();
    console.log('\n=== Demo Complete ===');
    console.log('Final status:', autoScaler.getStatus());
  }, 180000); // 3 minutes
}

// Export for use in other modules
module.exports = { 
  AutoScaler,
  MockCPUProvider,
  MockMemoryProvider,
  DEFAULT_SCALE_UP_THRESHOLD,
  DEFAULT_SCALE_DOWN_THRESHOLD,
  demonstrateAutoScaling
};

// Run demonstration if this file is executed directly
if (require.main === module) {
  demonstrateAutoScaling().catch(console.error);
}