/**
 * Performance Observer Integration - Core Web Vitals Tracking and Monitoring
 * 
 * A comprehensive performance monitoring system including:
 * - Core Web Vitals tracking (LCP, FID, CLS, TTFB)
 * - Custom performance metrics collection
 * - Performance budget monitoring and alerting
 * - Real User Monitoring (RUM) implementation
 * - Multiple approaches from basic to enterprise-grade
 * 
 * Problem: Monitor and optimize web performance with comprehensive metrics collection
 * 
 * Key Interview Points:
 * - Understanding Core Web Vitals and their impact on user experience
 * - Performance Observer API vs traditional performance measurement
 * - Real User Monitoring vs synthetic monitoring approaches
 * - Performance budget implementation and monitoring
 * - Memory management for performance data collection
 * 
 * Companies: All performance-focused companies need comprehensive monitoring
 * Frequency: Very High - Performance is critical for user experience and SEO
 */

// ========================================================================================
// APPROACH 1: BASIC PERFORMANCE MONITOR - Simple Core Web Vitals tracking
// ========================================================================================

/**
 * Basic performance monitor using Performance Observer API
 * Mental model: Observe and collect key performance metrics for user experience
 * 
 * Time Complexity: O(1) for metric collection, O(n) for data processing
 * Space Complexity: O(n) where n is number of performance entries
 * 
 * Interview considerations:
 * - What are Core Web Vitals? (LCP, FID, CLS - Google's key UX metrics)
 * - How does Performance Observer work? (Browser-native performance data collection)
 * - Why is RUM important? (Real user data vs synthetic testing)
 * - How to handle performance data without affecting performance? (Efficient collection)
 */
class BasicPerformanceMonitor {
  constructor(options = {}) {
    this.config = {
      // Core Web Vitals tracking
      trackLCP: options.trackLCP !== false, // Largest Contentful Paint
      trackFID: options.trackFID !== false, // First Input Delay  
      trackCLS: options.trackCLS !== false, // Cumulative Layout Shift
      trackTTFB: options.trackTTFB !== false, // Time to First Byte
      
      // Additional metrics
      trackNavigation: options.trackNavigation || false,
      trackResources: options.trackResources || false,
      trackLongTasks: options.trackLongTasks || false,
      
      // Data collection options
      maxEntries: options.maxEntries || 1000,
      enableAutoReporting: options.enableAutoReporting || false,
      reportingInterval: options.reportingInterval || 30000, // 30 seconds
      
      // Callbacks
      onMetric: options.onMetric || null,
      onThresholdExceeded: options.onThresholdExceeded || null,
      
      ...options
    };
    
    // Performance data storage
    this.metrics = {
      lcp: null,
      fid: null,
      cls: 0,
      ttfb: null,
      navigationTiming: null,
      resources: [],
      longTasks: [],
      customMetrics: []
    };
    
    // Performance thresholds (based on Google's recommendations)
    this.thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1800 }
    };
    
    // Observer instances
    this.observers = new Map();
    
    // Check browser support
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported, using fallback methods');
      this.setupFallbacks();
      return;
    }
    
    // Initialize performance monitoring
    this.initializeObservers();
    
    // Set up automatic reporting if enabled
    if (this.config.enableAutoReporting) {
      this.startAutoReporting();
    }
  }
  
  /**
   * Initialize performance observers for different metrics
   * Sets up observers for all configured performance entry types
   */
  initializeObservers() {
    // Largest Contentful Paint (LCP)
    if (this.config.trackLCP) {
      this.setupLCPObserver();
    }
    
    // First Input Delay (FID)
    if (this.config.trackFID) {
      this.setupFIDObserver();
    }
    
    // Cumulative Layout Shift (CLS)
    if (this.config.trackCLS) {
      this.setupCLSObserver();
    }
    
    // Navigation timing (includes TTFB)
    if (this.config.trackTTFB || this.config.trackNavigation) {
      this.setupNavigationObserver();
    }
    
    // Resource timing
    if (this.config.trackResources) {
      this.setupResourceObserver();
    }
    
    // Long tasks
    if (this.config.trackLongTasks) {
      this.setupLongTaskObserver();
    }
  }
  
  /**
   * Set up Largest Contentful Paint observer
   * Tracks the render time of the largest content element
   */
  setupLCPObserver() {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // LCP can change as larger elements are rendered
        this.metrics.lcp = lastEntry.startTime;
        
        this.handleMetricUpdate('lcp', lastEntry.startTime, {
          element: lastEntry.element,
          url: lastEntry.url,
          size: lastEntry.size
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
      
    } catch (error) {
      console.warn('LCP observer setup failed:', error);
    }
  }
  
  /**
   * Set up First Input Delay observer
   * Measures responsiveness to first user interaction
   */
  setupFIDObserver() {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // FID is the delay between user input and browser response
          this.metrics.fid = entry.processingStart - entry.startTime;
          
          this.handleMetricUpdate('fid', this.metrics.fid, {
            name: entry.name,
            startTime: entry.startTime,
            processingStart: entry.processingStart,
            processingEnd: entry.processingEnd
          });
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
      
    } catch (error) {
      console.warn('FID observer setup failed:', error);
    }
  }
  
  /**
   * Set up Cumulative Layout Shift observer
   * Tracks visual stability by measuring unexpected layout shifts
   */
  setupCLSObserver() {
    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries = [];
      
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // Start new session if gap > 1 second or total session > 5 seconds
            if (sessionValue &&
                (entry.startTime - lastSessionEntry.startTime > 1000 ||
                 entry.startTime - firstSessionEntry.startTime > 5000)) {
              
              clsValue = Math.max(clsValue, sessionValue);
              sessionValue = 0;
              sessionEntries = [];
            }
            
            sessionValue += entry.value;
            sessionEntries.push(entry);
          }
        });
        
        // Update CLS value
        this.metrics.cls = Math.max(clsValue, sessionValue);
        
        this.handleMetricUpdate('cls', this.metrics.cls, {
          entries: entries.map(e => ({
            value: e.value,
            sources: e.sources,
            hadRecentInput: e.hadRecentInput
          }))
        });
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
      
    } catch (error) {
      console.warn('CLS observer setup failed:', error);
    }
  }
  
  /**
   * Set up navigation timing observer
   * Captures navigation performance including TTFB
   */
  setupNavigationObserver() {
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Calculate TTFB (Time to First Byte)
          this.metrics.ttfb = entry.responseStart - entry.requestStart;
          
          // Store full navigation timing
          this.metrics.navigationTiming = {
            ttfb: this.metrics.ttfb,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.fetchStart,
            redirectTime: entry.redirectEnd - entry.redirectStart,
            dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
            tcpConnect: entry.connectEnd - entry.connectStart,
            sslTime: entry.connectEnd - entry.secureConnectionStart
          };
          
          this.handleMetricUpdate('ttfb', this.metrics.ttfb, {
            navigationTiming: this.metrics.navigationTiming
          });
        });
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
      
    } catch (error) {
      console.warn('Navigation observer setup failed:', error);
    }
  }
  
  /**
   * Set up resource timing observer
   * Tracks loading performance of individual resources
   */
  setupResourceObserver() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const resourceData = {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            startTime: entry.startTime,
            endTime: entry.responseEnd,
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0
          };
          
          this.metrics.resources.push(resourceData);
          
          // Maintain max entries limit
          if (this.metrics.resources.length > this.config.maxEntries) {
            this.metrics.resources.shift();
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
      
    } catch (error) {
      console.warn('Resource observer setup failed:', error);
    }
  }
  
  /**
   * Set up long task observer
   * Detects tasks that block the main thread for >50ms
   */
  setupLongTaskObserver() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const longTaskData = {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
            attribution: entry.attribution
          };
          
          this.metrics.longTasks.push(longTaskData);
          
          // Maintain max entries limit
          if (this.metrics.longTasks.length > this.config.maxEntries) {
            this.metrics.longTasks.shift();
          }
          
          // Long tasks are performance issues - always report
          if (this.config.onThresholdExceeded) {
            this.config.onThresholdExceeded({
              metric: 'longTask',
              value: entry.duration,
              threshold: 50,
              details: longTaskData
            });
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);
      
    } catch (error) {
      console.warn('Long task observer setup failed:', error);
    }
  }
  
  /**
   * Handle metric updates and threshold checking
   * Processes new metric values and triggers callbacks
   */
  handleMetricUpdate(metricName, value, details = {}) {
    // Check threshold if defined
    const threshold = this.thresholds[metricName];
    if (threshold) {
      let status = 'good';
      if (value > threshold.needsImprovement) {
        status = 'poor';
      } else if (value > threshold.good) {
        status = 'needs-improvement';
      }
      
      // Trigger threshold callback if performance is poor
      if (status === 'poor' && this.config.onThresholdExceeded) {
        this.config.onThresholdExceeded({
          metric: metricName,
          value,
          threshold: threshold.needsImprovement,
          status,
          details
        });
      }
    }
    
    // Trigger general metric callback
    if (this.config.onMetric) {
      this.config.onMetric({
        metric: metricName,
        value,
        timestamp: Date.now(),
        details
      });
    }
    
    console.log(`[Performance] ${metricName.toUpperCase()}: ${value.toFixed(2)}ms`);
  }
  
  /**
   * Add custom performance metric
   * Allows tracking of application-specific metrics
   */
  addCustomMetric(name, value, details = {}) {
    const customMetric = {
      name,
      value,
      timestamp: Date.now(),
      details
    };
    
    this.metrics.customMetrics.push(customMetric);
    
    // Maintain max entries limit
    if (this.metrics.customMetrics.length > this.config.maxEntries) {
      this.metrics.customMetrics.shift();
    }
    
    this.handleMetricUpdate(name, value, details);
  }
  
  /**
   * Get current performance summary
   * Returns comprehensive performance data
   */
  getPerformanceSummary() {
    return {
      coreWebVitals: {
        lcp: this.metrics.lcp,
        fid: this.metrics.fid,
        cls: this.metrics.cls,
        ttfb: this.metrics.ttfb
      },
      scores: this.calculateScores(),
      resourceCount: this.metrics.resources.length,
      longTaskCount: this.metrics.longTasks.length,
      customMetricCount: this.metrics.customMetrics.length,
      navigationTiming: this.metrics.navigationTiming,
      timestamp: Date.now()
    };
  }
  
  /**
   * Calculate performance scores based on thresholds
   * Provides numeric scores for performance evaluation
   */
  calculateScores() {
    const scores = {};
    
    for (const [metric, value] of Object.entries(this.metrics)) {
      if (this.thresholds[metric] && value !== null) {
        const threshold = this.thresholds[metric];
        
        if (value <= threshold.good) {
          scores[metric] = 100;
        } else if (value <= threshold.needsImprovement) {
          scores[metric] = 75;
        } else {
          scores[metric] = 25;
        }
      }
    }
    
    return scores;
  }
  
  /**
   * Start automatic performance reporting
   * Periodically reports performance data
   */
  startAutoReporting() {
    this.reportingInterval = setInterval(() => {
      const summary = this.getPerformanceSummary();
      console.log('Performance Report:', summary);
      
      // Here you would typically send data to analytics service
      if (this.config.onReport) {
        this.config.onReport(summary);
      }
    }, this.config.reportingInterval);
  }
  
  /**
   * Set up fallback methods for unsupported browsers
   * Provides basic performance tracking without Performance Observer
   */
  setupFallbacks() {
    // Basic navigation timing fallback
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.handleMetricUpdate('ttfb', this.metrics.ttfb);
        }
      }, 0);
    });
    
    // Basic LCP approximation using load event
    window.addEventListener('load', () => {
      this.metrics.lcp = performance.now();
      this.handleMetricUpdate('lcp', this.metrics.lcp);
    });
    
    console.log('Performance monitoring fallbacks initialized');
  }
  
  /**
   * Clean up observers and intervals
   * Prevents memory leaks
   */
  disconnect() {
    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    // Clear reporting interval
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
    
    console.log('Performance monitoring disconnected');
  }
}

// ========================================================================================
// APPROACH 2: ADVANCED PERFORMANCE TRACKER - Enhanced metrics with analysis
// ========================================================================================

/**
 * Advanced performance tracker with detailed analysis and reporting
 * Mental model: Comprehensive performance monitoring with intelligent analysis
 * 
 * Features:
 * - Performance trend analysis
 * - Resource categorization and analysis
 * - User journey performance tracking
 * - Performance budget monitoring
 * - Automated performance recommendations
 */
class AdvancedPerformanceTracker extends BasicPerformanceMonitor {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Advanced tracking options
      enableTrendAnalysis: options.enableTrendAnalysis !== false,
      trendWindowSize: options.trendWindowSize || 10,
      
      // Performance budgets
      performanceBudgets: options.performanceBudgets || {},
      enableBudgetAlerting: options.enableBudgetAlerting || false,
      
      // Resource analysis
      enableResourceAnalysis: options.enableResourceAnalysis !== false,
      resourceCategories: options.resourceCategories || {},
      
      // User journey tracking
      enableJourneyTracking: options.enableJourneyTracking || false,
      journeySteps: options.journeySteps || [],
      
      // Analysis options
      enableAutoAnalysis: options.enableAutoAnalysis || false,
      analysisInterval: options.analysisInterval || 60000, // 1 minute
      
      ...options
    };
    
    // Advanced tracking data
    this.performanceHistory = [];
    this.budgetViolations = [];
    this.resourceAnalysis = {
      byType: {},
      byDomain: {},
      slowResources: [],
      largeResources: []
    };
    this.journeyMetrics = new Map();
    this.recommendations = [];
    
    // Initialize advanced features
    this.initializeAdvancedFeatures();
  }
  
  /**
   * Initialize advanced performance tracking features
   * Sets up trend analysis, budgets, and automated analysis
   */
  initializeAdvancedFeatures() {
    // Set up performance budgets
    this.setupPerformanceBudgets();
    
    // Start automated analysis if enabled
    if (this.config.enableAutoAnalysis) {
      this.startAutomatedAnalysis();
    }
    
    // Initialize user journey tracking
    if (this.config.enableJourneyTracking) {
      this.setupJourneyTracking();
    }
    
    console.log('Advanced performance tracking initialized');
  }
  
  /**
   * Set up performance budgets and monitoring
   * Defines performance targets and monitors compliance
   */
  setupPerformanceBudgets() {
    const defaultBudgets = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      ttfb: 800,
      totalResourceSize: 2 * 1024 * 1024, // 2MB
      totalRequests: 100,
      jsSize: 1024 * 1024, // 1MB
      cssSize: 256 * 1024, // 256KB
      imageSize: 1024 * 1024 // 1MB
    };
    
    this.budgets = { ...defaultBudgets, ...this.config.performanceBudgets };
    
    // Override metric handler to include budget checking
    const originalHandleMetric = this.handleMetricUpdate.bind(this);
    this.handleMetricUpdate = (metricName, value, details) => {
      originalHandleMetric(metricName, value, details);
      this.checkPerformanceBudget(metricName, value, details);
    };
  }
  
  /**
   * Check performance metrics against defined budgets
   * Monitors budget compliance and triggers alerts
   */
  checkPerformanceBudget(metricName, value, details) {
    const budget = this.budgets[metricName];
    if (!budget) return;
    
    const isViolation = value > budget;
    
    if (isViolation) {
      const violation = {
        metric: metricName,
        value,
        budget,
        excess: value - budget,
        timestamp: Date.now(),
        details
      };
      
      this.budgetViolations.push(violation);
      
      // Trigger budget alert if enabled
      if (this.config.enableBudgetAlerting && this.config.onBudgetViolation) {
        this.config.onBudgetViolation(violation);
      }
      
      console.warn(`Performance budget violation: ${metricName} = ${value} (budget: ${budget})`);
    }
  }
  
  /**
   * Track performance metrics over time for trend analysis
   * Maintains history of performance data for analysis
   */
  trackPerformanceHistory() {
    const currentMetrics = {
      timestamp: Date.now(),
      lcp: this.metrics.lcp,
      fid: this.metrics.fid,
      cls: this.metrics.cls,
      ttfb: this.metrics.ttfb,
      resourceCount: this.metrics.resources.length,
      customMetrics: [...this.metrics.customMetrics]
    };
    
    this.performanceHistory.push(currentMetrics);
    
    // Maintain history size
    if (this.performanceHistory.length > this.config.trendWindowSize * 2) {
      this.performanceHistory.shift();
    }
  }
  
  /**
   * Analyze performance trends over time
   * Identifies patterns and trends in performance data
   */
  analyzePerformanceTrends() {
    if (this.performanceHistory.length < 2) {
      return null;
    }
    
    const metrics = ['lcp', 'fid', 'cls', 'ttfb'];
    const trends = {};
    
    metrics.forEach(metric => {
      const values = this.performanceHistory
        .map(entry => entry[metric])
        .filter(value => value !== null);
      
      if (values.length >= 2) {
        trends[metric] = this.calculateTrend(values);
      }
    });
    
    return trends;
  }
  
  /**
   * Calculate trend direction and magnitude
   * Determines if performance is improving or degrading
   */
  calculateTrend(values) {
    if (values.length < 2) return null;
    
    const recent = values.slice(-this.config.trendWindowSize);
    const older = values.slice(0, -this.config.trendWindowSize);
    
    if (older.length === 0) return null;
    
    const recentAverage = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAverage = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const change = recentAverage - olderAverage;
    const changePercent = (change / olderAverage) * 100;
    
    return {
      direction: change > 0 ? 'degrading' : 'improving',
      magnitude: Math.abs(change),
      percentage: Math.abs(changePercent),
      recentAverage,
      olderAverage
    };
  }
  
  /**
   * Analyze resource loading performance
   * Categorizes and analyzes resource loading patterns
   */
  analyzeResources() {
    const analysis = {
      byType: {},
      byDomain: {},
      slowResources: [],
      largeResources: [],
      totalSize: 0,
      totalDuration: 0
    };
    
    this.metrics.resources.forEach(resource => {
      // Analyze by type
      if (!analysis.byType[resource.type]) {
        analysis.byType[resource.type] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0,
          averageDuration: 0
        };
      }
      
      const typeStats = analysis.byType[resource.type];
      typeStats.count++;
      typeStats.totalSize += resource.size || 0;
      typeStats.totalDuration += resource.duration;
      typeStats.averageDuration = typeStats.totalDuration / typeStats.count;
      
      // Analyze by domain
      const domain = this.extractDomain(resource.name);
      if (!analysis.byDomain[domain]) {
        analysis.byDomain[domain] = {
          count: 0,
          totalSize: 0,
          totalDuration: 0
        };
      }
      
      const domainStats = analysis.byDomain[domain];
      domainStats.count++;
      domainStats.totalSize += resource.size || 0;
      domainStats.totalDuration += resource.duration;
      
      // Track slow resources (>2 seconds)
      if (resource.duration > 2000) {
        analysis.slowResources.push({
          name: resource.name,
          type: resource.type,
          duration: resource.duration,
          size: resource.size
        });
      }
      
      // Track large resources (>1MB)
      if (resource.size > 1024 * 1024) {
        analysis.largeResources.push({
          name: resource.name,
          type: resource.type,
          duration: resource.duration,
          size: resource.size
        });
      }
      
      analysis.totalSize += resource.size || 0;
      analysis.totalDuration += resource.duration;
    });
    
    this.resourceAnalysis = analysis;
    return analysis;
  }
  
  /**
   * Extract domain from resource URL
   * Helper function for domain-based resource analysis
   */
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Set up user journey performance tracking
   * Tracks performance across different user flow steps
   */
  setupJourneyTracking() {
    this.config.journeySteps.forEach(step => {
      this.journeyMetrics.set(step, {
        startTime: null,
        endTime: null,
        duration: null,
        metrics: {}
      });
    });
  }
  
  /**
   * Mark start of user journey step
   * Records timing for specific user flow steps
   */
  markJourneyStart(stepName) {
    const stepData = this.journeyMetrics.get(stepName);
    if (stepData) {
      stepData.startTime = performance.now();
      stepData.metrics = this.getPerformanceSummary();
    }
  }
  
  /**
   * Mark end of user journey step
   * Calculates step duration and performance impact
   */
  markJourneyEnd(stepName) {
    const stepData = this.journeyMetrics.get(stepName);
    if (stepData && stepData.startTime) {
      stepData.endTime = performance.now();
      stepData.duration = stepData.endTime - stepData.startTime;
      
      console.log(`Journey step "${stepName}" completed in ${stepData.duration.toFixed(2)}ms`);
    }
  }
  
  /**
   * Generate automated performance recommendations
   * Analyzes current performance and suggests improvements
   */
  generateRecommendations() {
    const recommendations = [];
    const summary = this.getPerformanceSummary();
    
    // LCP recommendations
    if (this.metrics.lcp > 2500) {
      recommendations.push({
        type: 'lcp',
        priority: 'high',
        message: 'Largest Contentful Paint is slow',
        suggestions: [
          'Optimize images and use modern formats (WebP, AVIF)',
          'Remove render-blocking resources',
          'Use CDN for faster content delivery',
          'Optimize server response time'
        ]
      });
    }
    
    // FID recommendations
    if (this.metrics.fid > 100) {
      recommendations.push({
        type: 'fid',
        priority: 'high',
        message: 'First Input Delay is poor',
        suggestions: [
          'Reduce JavaScript execution time',
          'Code split and lazy load JavaScript',
          'Use web workers for heavy computations',
          'Remove unused JavaScript'
        ]
      });
    }
    
    // CLS recommendations
    if (this.metrics.cls > 0.1) {
      recommendations.push({
        type: 'cls',
        priority: 'medium',
        message: 'Cumulative Layout Shift is high',
        suggestions: [
          'Set size attributes on images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS aspect-ratio for dynamic content'
        ]
      });
    }
    
    // Resource-based recommendations
    const resourceAnalysis = this.analyzeResources();
    if (resourceAnalysis.slowResources.length > 0) {
      recommendations.push({
        type: 'resources',
        priority: 'medium',
        message: `${resourceAnalysis.slowResources.length} slow resources detected`,
        suggestions: [
          'Optimize slow-loading resources',
          'Use resource hints (preload, prefetch)',
          'Enable compression (gzip, brotli)',
          'Consider resource bundling or splitting'
        ]
      });
    }
    
    this.recommendations = recommendations;
    return recommendations;
  }
  
  /**
   * Start automated performance analysis
   * Periodically analyzes performance and generates insights
   */
  startAutomatedAnalysis() {
    this.analysisInterval = setInterval(() => {
      this.trackPerformanceHistory();
      
      const trends = this.analyzePerformanceTrends();
      const resourceAnalysis = this.analyzeResources();
      const recommendations = this.generateRecommendations();
      
      const analysisReport = {
        timestamp: Date.now(),
        summary: this.getPerformanceSummary(),
        trends,
        resourceAnalysis,
        recommendations,
        budgetViolations: this.budgetViolations.slice(-10) // Last 10 violations
      };
      
      if (this.config.onAnalysis) {
        this.config.onAnalysis(analysisReport);
      }
      
      console.log('Performance analysis completed:', analysisReport);
      
    }, this.config.analysisInterval);
  }
  
  /**
   * Get comprehensive performance report
   * Returns detailed performance analysis with recommendations
   */
  getDetailedReport() {
    return {
      ...this.getPerformanceSummary(),
      trends: this.analyzePerformanceTrends(),
      resourceAnalysis: this.analyzeResources(),
      recommendations: this.recommendations,
      budgetViolations: this.budgetViolations,
      journeyMetrics: Object.fromEntries(this.journeyMetrics),
      performanceHistory: this.performanceHistory.slice(-10)
    };
  }
  
  /**
   * Enhanced disconnect with advanced cleanup
   * Properly cleans up all advanced features
   */
  disconnect() {
    super.disconnect();
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    
    // Clear data structures
    this.performanceHistory = [];
    this.budgetViolations = [];
    this.journeyMetrics.clear();
    this.recommendations = [];
  }
}

// ========================================================================================
// APPROACH 3: ENTERPRISE PERFORMANCE SUITE - Production monitoring with alerting
// ========================================================================================

/**
 * Enterprise performance monitoring suite
 * Mental model: Complete performance monitoring solution for production applications
 * 
 * Features:
 * - Real User Monitoring (RUM) with sampling
 * - Performance alerting and incident management
 * - A/B testing integration for performance impact
 * - SLA monitoring and compliance reporting
 * - Integration with external monitoring services
 */
class EnterprisePerformanceSuite extends AdvancedPerformanceTracker {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Enterprise features
      enableRUMSampling: options.enableRUMSampling !== false,
      samplingRate: options.samplingRate || 0.1, // 10% of users
      
      // Alerting and incidents
      enableAlerting: options.enableAlerting || false,
      alertThresholds: options.alertThresholds || {},
      webhookUrl: options.webhookUrl || null,
      
      // SLA monitoring
      enableSLAMonitoring: options.enableSLAMonitoring || false,
      slaTargets: options.slaTargets || {},
      
      // External integrations
      analyticsEndpoint: options.analyticsEndpoint || null,
      enableDataExport: options.enableDataExport || false,
      
      // A/B testing
      enableABTesting: options.enableABTesting || false,
      abTestVariant: options.abTestVariant || 'control',
      
      // Compliance and privacy
      enableDataPrivacy: options.enableDataPrivacy !== false,
      dataRetentionDays: options.dataRetentionDays || 30,
      
      ...options
    };
    
    // Enterprise state management
    this.sessionId = this.generateSessionId();
    this.userId = options.userId || null;
    this.slaViolations = [];
    this.alertHistory = [];
    this.performanceIncidents = [];
    
    // Initialize enterprise features
    this.initializeEnterpriseFeatures();
  }
  
  /**
   * Initialize enterprise-level performance monitoring
   * Sets up RUM sampling, alerting, and SLA monitoring
   */
  initializeEnterpriseFeatures() {
    // Check if this user should be sampled
    if (this.config.enableRUMSampling && !this.shouldSampleUser()) {
      console.log('User not selected for RUM sampling');
      return;
    }
    
    // Set up SLA monitoring
    if (this.config.enableSLAMonitoring) {
      this.setupSLAMonitoring();
    }
    
    // Set up alerting
    if (this.config.enableAlerting) {
      this.setupAlerting();
    }
    
    // Set up data export
    if (this.config.enableDataExport) {
      this.setupDataExport();
    }
    
    // Track A/B test variant
    if (this.config.enableABTesting) {
      this.trackABTestVariant();
    }
    
    console.log('Enterprise performance monitoring initialized', {
      sessionId: this.sessionId,
      userId: this.userId,
      variant: this.config.abTestVariant
    });
  }
  
  /**
   * Determine if current user should be included in RUM sampling
   * Implements consistent sampling based on user identifier
   */
  shouldSampleUser() {
    const identifier = this.userId || this.sessionId || 'anonymous';
    let hash = 0;
    
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const normalizedHash = Math.abs(hash) / 2147483647; // Normalize to 0-1
    return normalizedHash < this.config.samplingRate;
  }
  
  /**
   * Generate unique session identifier
   * Creates session ID for tracking user sessions
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }
  
  /**
   * Set up SLA monitoring and compliance tracking
   * Monitors performance against defined SLA targets
   */
  setupSLAMonitoring() {
    const defaultSLATargets = {
      lcp: { target: 2500, threshold: 95 }, // 95% of requests under 2.5s
      fid: { target: 100, threshold: 95 },
      cls: { target: 0.1, threshold: 95 },
      uptime: { target: 99.9 },
      availability: { target: 99.95 }
    };
    
    this.slaTargets = { ...defaultSLATargets, ...this.config.slaTargets };
    
    // Override metric handler to include SLA tracking
    const originalHandleMetric = this.handleMetricUpdate.bind(this);
    this.handleMetricUpdate = (metricName, value, details) => {
      originalHandleMetric(metricName, value, details);
      this.trackSLACompliance(metricName, value, details);
    };
  }
  
  /**
   * Track SLA compliance for performance metrics
   * Monitors compliance and identifies SLA violations
   */
  trackSLACompliance(metricName, value, details) {
    const slaTarget = this.slaTargets[metricName];
    if (!slaTarget) return;
    
    const isViolation = value > slaTarget.target;
    
    if (isViolation) {
      const violation = {
        metric: metricName,
        value,
        target: slaTarget.target,
        threshold: slaTarget.threshold,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        details
      };
      
      this.slaViolations.push(violation);
      
      // Check if we need to trigger an incident
      this.checkForPerformanceIncident(metricName, violation);
      
      console.warn(`SLA violation: ${metricName} = ${value} (target: ${slaTarget.target})`);
    }
  }
  
  /**
   * Check for performance incidents based on SLA violations
   * Determines if violations constitute a performance incident
   */
  checkForPerformanceIncident(metricName, violation) {
    const recentViolations = this.slaViolations.filter(v => 
      v.metric === metricName && 
      Date.now() - v.timestamp < 300000 // Last 5 minutes
    );
    
    const slaTarget = this.slaTargets[metricName];
    const violationRate = recentViolations.length / 10; // Assume 10 samples per 5 minutes
    
    if (violationRate > (1 - slaTarget.threshold / 100)) {
      this.triggerPerformanceIncident(metricName, recentViolations);
    }
  }
  
  /**
   * Trigger performance incident
   * Creates incident and sends alerts
   */
  async triggerPerformanceIncident(metricName, violations) {
    const incident = {
      id: `incident_${Date.now()}`,
      metric: metricName,
      severity: this.calculateIncidentSeverity(violations),
      startTime: Date.now(),
      violationCount: violations.length,
      affectedUsers: new Set(violations.map(v => v.userId).filter(Boolean)).size,
      status: 'active'
    };
    
    this.performanceIncidents.push(incident);
    
    // Send alert
    await this.sendAlert({
      type: 'performance_incident',
      incident,
      message: `Performance incident detected: ${metricName} SLA violations`
    });
    
    console.error('Performance incident triggered:', incident);
  }
  
  /**
   * Calculate incident severity based on violations
   * Determines appropriate severity level for incidents
   */
  calculateIncidentSeverity(violations) {
    const violationRate = violations.length / 10; // Sample rate assumption
    
    if (violationRate > 0.5) return 'critical';
    if (violationRate > 0.2) return 'high';
    if (violationRate > 0.1) return 'medium';
    return 'low';
  }
  
  /**
   * Set up performance alerting system
   * Configures thresholds and alert delivery
   */
  setupAlerting() {
    const defaultThresholds = {
      lcp: { critical: 4000, warning: 3000 },
      fid: { critical: 300, warning: 200 },
      cls: { critical: 0.25, warning: 0.15 },
      longTask: { critical: 500, warning: 200 }
    };
    
    this.alertThresholds = { ...defaultThresholds, ...this.config.alertThresholds };
  }
  
  /**
   * Send performance alert
   * Delivers alerts via configured channels (webhook, email, etc.)
   */
  async sendAlert(alertData) {
    const alert = {
      ...alertData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.alertHistory.push(alert);
    
    // Send to webhook if configured
    if (this.config.webhookUrl) {
      try {
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alert)
        });
        
        console.log('Alert sent successfully:', alert.type);
        
      } catch (error) {
        console.error('Failed to send alert:', error);
      }
    }
  }
  
  /**
   * Track A/B test variant impact on performance
   * Associates performance data with A/B test variants
   */
  trackABTestVariant() {
    // Override performance summary to include A/B test data
    const originalGetSummary = this.getPerformanceSummary.bind(this);
    this.getPerformanceSummary = () => {
      const summary = originalGetSummary();
      return {
        ...summary,
        abTestVariant: this.config.abTestVariant,
        sessionId: this.sessionId,
        userId: this.userId
      };
    };
  }
  
  /**
   * Set up automated data export to external systems
   * Exports performance data to analytics platforms
   */
  setupDataExport() {
    // Export data every 30 seconds
    setInterval(() => {
      this.exportPerformanceData();
    }, 30000);
    
    // Export on page unload
    window.addEventListener('beforeunload', () => {
      this.exportPerformanceData(true);
    });
  }
  
  /**
   * Export performance data to external analytics
   * Sends data to configured analytics endpoint
   */
  async exportPerformanceData(isBeacon = false) {
    if (!this.config.analyticsEndpoint) return;
    
    const data = {
      ...this.getDetailedReport(),
      exportTimestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      abTestVariant: this.config.abTestVariant
    };
    
    // Privacy compliance - remove sensitive data if required
    if (this.config.enableDataPrivacy) {
      data.userId = this.hashUserId(data.userId);
      data.url = this.sanitizeUrl(window.location.href);
    }
    
    try {
      if (isBeacon && 'sendBeacon' in navigator) {
        // Use sendBeacon for reliable data delivery on page unload
        navigator.sendBeacon(
          this.config.analyticsEndpoint,
          JSON.stringify(data)
        );
      } else {
        await fetch(this.config.analyticsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      }
      
      console.log('Performance data exported successfully');
      
    } catch (error) {
      console.error('Failed to export performance data:', error);
    }
  }
  
  /**
   * Hash user ID for privacy compliance
   * Creates anonymous identifier while maintaining consistency
   */
  hashUserId(userId) {
    if (!userId) return null;
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `user_${Math.abs(hash)}`;
  }
  
  /**
   * Sanitize URL for privacy compliance
   * Removes sensitive information from URLs
   */
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}${urlObj.pathname}`;
    } catch {
      return 'invalid-url';
    }
  }
  
  /**
   * Get enterprise performance dashboard data
   * Returns comprehensive data for enterprise dashboards
   */
  getEnterpriseDashboard() {
    return {
      ...this.getDetailedReport(),
      slaCompliance: this.calculateSLACompliance(),
      incidents: this.performanceIncidents,
      alerts: this.alertHistory.slice(-20),
      sampling: {
        issampled: true,
        samplingRate: this.config.samplingRate
      },
      session: {
        sessionId: this.sessionId,
        userId: this.userId,
        abTestVariant: this.config.abTestVariant
      }
    };
  }
  
  /**
   * Calculate SLA compliance percentages
   * Provides SLA compliance reporting
   */
  calculateSLACompliance() {
    const compliance = {};
    
    Object.keys(this.slaTargets).forEach(metric => {
      const target = this.slaTargets[metric];
      const violations = this.slaViolations.filter(v => v.metric === metric);
      const totalMeasurements = this.performanceHistory.length;
      
      if (totalMeasurements > 0) {
        const complianceRate = ((totalMeasurements - violations.length) / totalMeasurements) * 100;
        compliance[metric] = {
          rate: complianceRate,
          target: target.threshold,
          status: complianceRate >= target.threshold ? 'compliant' : 'violation'
        };
      }
    });
    
    return compliance;
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic performance monitoring
console.log('=== BASIC PERFORMANCE MONITOR EXAMPLE ===');

const basicMonitor = new BasicPerformanceMonitor({
  trackLCP: true,
  trackFID: true,
  trackCLS: true,
  trackTTFB: true,
  enableAutoReporting: true,
  reportingInterval: 10000, // 10 seconds for demo
  
  onMetric: (data) => {
    console.log(`Metric collected: ${data.metric} = ${data.value.toFixed(2)}ms`);
  },
  
  onThresholdExceeded: (data) => {
    console.warn(`Performance threshold exceeded: ${data.metric}`);
  }
});

// Add custom metric
basicMonitor.addCustomMetric('pageInteractive', performance.now(), {
  source: 'custom-timing'
});

// Example 2: Advanced performance tracking
console.log('\n=== ADVANCED PERFORMANCE TRACKER EXAMPLE ===');

const advancedTracker = new AdvancedPerformanceTracker({
  enableTrendAnalysis: true,
  enableBudgetAlerting: true,
  enableJourneyTracking: true,
  enableAutoAnalysis: true,
  
  performanceBudgets: {
    lcp: 2000, // Stricter budget
    totalResourceSize: 1.5 * 1024 * 1024 // 1.5MB
  },
  
  journeySteps: ['pageLoad', 'userInteraction', 'dataFetch'],
  
  onBudgetViolation: (violation) => {
    console.warn('Budget violation:', violation);
  }
});

// Track user journey
advancedTracker.markJourneyStart('pageLoad');
setTimeout(() => {
  advancedTracker.markJourneyEnd('pageLoad');
  console.log('Advanced tracker recommendations:', 
             advancedTracker.generateRecommendations());
}, 2000);

// Example 3: Enterprise performance suite
console.log('\n=== ENTERPRISE PERFORMANCE SUITE EXAMPLE ===');

const enterpriseSuite = new EnterprisePerformanceSuite({
  enableRUMSampling: true,
  samplingRate: 1.0, // 100% for demo
  enableSLAMonitoring: true,
  enableAlerting: true,
  enableABTesting: true,
  
  userId: 'demo-user-123',
  abTestVariant: 'experimental',
  
  slaTargets: {
    lcp: { target: 2000, threshold: 95 },
    fid: { target: 80, threshold: 90 }
  },
  
  webhookUrl: 'https://hooks.slack.com/demo-webhook' // Would be real webhook in production
});

// Simulate enterprise dashboard data
setTimeout(() => {
  const dashboardData = enterpriseSuite.getEnterpriseDashboard();
  console.log('Enterprise dashboard:', {
    coreWebVitals: dashboardData.coreWebVitals,
    slaCompliance: dashboardData.slaCompliance,
    sessionInfo: dashboardData.session
  });
}, 3000);

// Export for use in other modules
module.exports = {
  BasicPerformanceMonitor,
  AdvancedPerformanceTracker,
  EnterprisePerformanceSuite
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. Core Web Vitals Understanding:
   - LCP (Largest Contentful Paint) - Loading performance
   - FID (First Input Delay) - Interactivity responsiveness  
   - CLS (Cumulative Layout Shift) - Visual stability
   - TTFB (Time to First Byte) - Server response time

2. Performance Observer API:
   - How Performance Observer differs from polling approaches
   - Different performance entry types and their purposes
   - Browser support and fallback strategies
   - Memory management for performance data collection

3. Real User Monitoring (RUM):
   - RUM vs Synthetic monitoring approaches
   - Sampling strategies for performance data collection
   - Privacy considerations in performance monitoring
   - Performance data aggregation and analysis

4. Performance Optimization:
   - Performance budgets and threshold monitoring
   - Resource loading optimization strategies
   - Long task detection and main thread optimization
   - Layout shift prevention techniques

5. Enterprise Monitoring:
   - SLA monitoring and compliance reporting
   - Performance incident management
   - A/B testing impact on performance metrics
   - Integration with external monitoring systems

6. Implementation Considerations:
   - Avoiding performance overhead in monitoring code
   - Data export strategies (sendBeacon vs fetch)
   - Error handling in performance observers
   - Cross-browser compatibility issues

Common Follow-up Questions:
- How do you implement performance monitoring without affecting performance?
- What are effective strategies for performance budget monitoring?
- How do you handle performance data privacy compliance?
- What's your approach to performance regression detection?
- How do you correlate performance metrics with business metrics?
- What monitoring strategies work best for single-page applications?
- How do you implement real-time performance alerting?
- What are the challenges with mobile performance monitoring?
- How do you test performance monitoring implementation?
- What metrics beyond Core Web Vitals are important to track?
*/