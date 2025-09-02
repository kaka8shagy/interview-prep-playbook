/**
 * File: analytics-sdk.js
 * Description: Comprehensive analytics SDK for tracking user events, 
 *              performance metrics, and behavioral data with batching,
 *              retry mechanisms, and privacy controls
 * 
 * Learning objectives:
 * - Understand event-driven architecture and observer patterns
 * - Learn batching strategies for efficient network usage
 * - Implement retry mechanisms and error handling
 * - Handle privacy controls and data sanitization
 * - Practice modular SDK design patterns
 * 
 * Real-world applications:
 * - Web analytics platforms (Google Analytics, Mixpanel)
 * - Performance monitoring tools (New Relic, DataDog)
 * - Error tracking systems (Sentry, Rollbar)
 * - Business intelligence and user behavior tracking
 * - A/B testing and feature flag systems
 * 
 * Time Complexity: O(1) for event tracking, O(n) for batch processing
 * Space Complexity: O(n) for event buffer and configuration storage
 */

// =======================
// Approach 1: Basic Analytics SDK
// =======================

/**
 * Basic analytics SDK implementation with core functionality
 * Supports event tracking, batching, and basic configuration
 * 
 * Features:
 * - Event tracking with custom properties
 * - Automatic batching and flushing
 * - Session management
 * - Basic user identification
 */
class BasicAnalyticsSDK {
  constructor(config = {}) {
    // Core configuration with defaults
    this.config = {
      apiEndpoint: config.apiEndpoint || 'https://analytics.example.com/events',
      apiKey: config.apiKey || '',
      userId: config.userId || null,
      sessionId: this.generateSessionId(),
      
      // Batching configuration
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 5000, // 5 seconds
      maxRetries: config.maxRetries || 3,
      
      // Feature toggles
      enableAutoFlush: config.enableAutoFlush ?? true,
      enableSessionTracking: config.enableSessionTracking ?? true,
      enableErrorTracking: config.enableErrorTracking ?? true,
      
      // Debug mode
      debug: config.debug ?? false
    };
    
    // Internal state
    this.eventBuffer = [];
    this.isInitialized = false;
    this.flushTimer = null;
    this.sessionStartTime = Date.now();
    this.eventCounter = 0;
    
    // Initialize the SDK
    this.initialize();
  }
  
  /**
   * Initialize the SDK and set up automatic flushing
   * Sets up timers and event listeners for session management
   */
  initialize() {
    if (this.isInitialized) {
      this.log('SDK already initialized');
      return;
    }
    
    // Set up automatic flushing
    if (this.config.enableAutoFlush) {
      this.startAutoFlush();
    }
    
    // Set up session tracking
    if (this.config.enableSessionTracking) {
      this.setupSessionTracking();
    }
    
    // Set up error tracking
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }
    
    this.isInitialized = true;
    this.log('Analytics SDK initialized');
    
    // Track initialization event
    this.track('sdk_initialized', {
      version: '1.0.0',
      config: this.getSafeConfig()
    });
  }
  
  /**
   * Track a custom event with properties
   * Main method for sending analytics events
   * 
   * @param {string} eventName - Name of the event to track
   * @param {Object} properties - Event properties and metadata
   * @param {Object} options - Additional options for this event
   */
  track(eventName, properties = {}, options = {}) {
    if (!this.isInitialized) {
      this.log('SDK not initialized, buffering event');
    }
    
    if (!eventName || typeof eventName !== 'string') {
      this.log('Invalid event name provided');
      return;
    }
    
    // Create event object with standard properties
    const event = this.createEvent(eventName, properties, options);
    
    // Add to buffer
    this.eventBuffer.push(event);
    this.eventCounter++;
    
    this.log(`Tracked event: ${eventName}`, event);
    
    // Check if we should flush immediately
    if (options.immediate || this.eventBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }
  
  /**
   * Create standardized event object
   * Adds common properties like timestamp, session info, etc.
   * 
   * @param {string} eventName - Event name
   * @param {Object} properties - Custom properties
   * @param {Object} options - Event options
   * @returns {Object} Formatted event object
   */
  createEvent(eventName, properties, options) {
    return {
      // Event identification
      eventId: this.generateEventId(),
      eventName,
      
      // Timing information
      timestamp: Date.now(),
      localTime: new Date().toISOString(),
      
      // Session information
      sessionId: this.config.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      
      // User information
      userId: this.config.userId,
      anonymousId: this.getAnonymousId(),
      
      // Custom properties
      properties: { ...properties },
      
      // System information
      context: this.getContextInfo(),
      
      // SDK metadata
      sdk: {
        version: '1.0.0',
        platform: 'web'
      }
    };
  }
  
  /**
   * Flush all buffered events to the server
   * Sends batch request and handles errors with retry logic
   * 
   * @param {boolean} force - Force flush even if buffer is small
   * @returns {Promise} Promise that resolves when flush completes
   */
  async flush(force = false) {
    if (this.eventBuffer.length === 0) {
      this.log('No events to flush');
      return Promise.resolve();
    }
    
    if (!force && this.eventBuffer.length < this.config.batchSize && this.config.enableAutoFlush) {
      this.log('Buffer not full, waiting for auto-flush');
      return Promise.resolve();
    }
    
    // Create batch payload
    const events = [...this.eventBuffer];
    this.eventBuffer = []; // Clear buffer immediately to prevent double-sending
    
    const batchPayload = {
      events,
      metadata: {
        batchId: this.generateBatchId(),
        apiKey: this.config.apiKey,
        timestamp: Date.now(),
        eventCount: events.length
      }
    };
    
    this.log(`Flushing ${events.length} events`, batchPayload);
    
    // Send with retry logic
    return this.sendWithRetry(batchPayload);
  }
  
  /**
   * Send batch with exponential backoff retry
   * Implements robust error handling and retry mechanisms
   * 
   * @param {Object} payload - Batch payload to send
   * @param {number} attempt - Current attempt number
   * @returns {Promise} Promise that resolves/rejects based on send result
   */
  async sendWithRetry(payload, attempt = 1) {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Analytics-SDK': 'BasicAnalyticsSDK/1.0.0'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      this.log('Batch sent successfully', result);
      return result;
      
    } catch (error) {
      this.log(`Send attempt ${attempt} failed:`, error.message);
      
      // Retry with exponential backoff
      if (attempt < this.config.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
        this.log(`Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendWithRetry(payload, attempt + 1);
      }
      
      // All retries failed, log error and potentially re-queue events
      this.log('All retry attempts failed, events lost:', error.message);
      throw error;
    }
  }
  
  /**
   * Set user identification
   * Updates userId for all future events
   * 
   * @param {string|number} userId - Unique user identifier
   * @param {Object} userProperties - Additional user properties
   */
  identify(userId, userProperties = {}) {
    this.config.userId = userId;
    
    // Track identification event
    this.track('user_identified', {
      previousUserId: this.config.userId,
      userProperties
    }, { immediate: true });
    
    this.log(`User identified: ${userId}`);
  }
  
  /**
   * Start a new session
   * Generates new session ID and resets session timer
   */
  startSession() {
    const previousSessionId = this.config.sessionId;
    this.config.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    this.track('session_started', {
      previousSessionId,
      sessionDuration: Date.now() - this.sessionStartTime
    });
    
    this.log(`New session started: ${this.config.sessionId}`);
  }
  
  /**
   * Set up automatic event flushing
   * Creates interval timer for periodic batch sending
   */
  startAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
    
    this.log('Auto-flush started');
  }
  
  /**
   * Set up session tracking
   * Monitors page visibility and user activity for session management
   */
  setupSessionTracking() {
    // Track page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_hidden');
          this.flush(true); // Force flush when page becomes hidden
        } else {
          this.track('page_visible');
        }
      });
      
      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.track('page_unload');
        this.flush(true);
      });
    }
    
    this.log('Session tracking enabled');
  }
  
  /**
   * Set up automatic error tracking
   * Captures JavaScript errors and unhandled promise rejections
   */
  setupErrorTracking() {
    if (typeof window !== 'undefined') {
      // Capture JavaScript errors
      window.addEventListener('error', (event) => {
        this.track('javascript_error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      });
      
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.track('unhandled_promise_rejection', {
          reason: event.reason?.toString(),
          stack: event.reason?.stack
        });
      });
    }
    
    this.log('Error tracking enabled');
  }
  
  /**
   * Get context information about the environment
   * Collects browser, device, and page information
   * 
   * @returns {Object} Context information
   */
  getContextInfo() {
    const context = {
      timestamp: Date.now()
    };
    
    // Browser information
    if (typeof navigator !== 'undefined') {
      context.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled
      };
    }
    
    // Page information
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      context.page = {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
    
    // Screen information
    if (typeof screen !== 'undefined') {
      context.screen = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      };
    }
    
    return context;
  }
  
  /**
   * Generate unique session ID
   * Creates random identifier for session tracking
   * 
   * @returns {string} Session ID
   */
  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  /**
   * Generate unique event ID
   * Creates unique identifier for each event
   * 
   * @returns {string} Event ID
   */
  generateEventId() {
    return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + this.eventCounter;
  }
  
  /**
   * Generate unique batch ID
   * Creates identifier for batch requests
   * 
   * @returns {string} Batch ID
   */
  generateBatchId() {
    return 'batch_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  /**
   * Get or create anonymous user ID
   * Uses localStorage for persistence across sessions
   * 
   * @returns {string} Anonymous user ID
   */
  getAnonymousId() {
    if (typeof localStorage !== 'undefined') {
      let anonymousId = localStorage.getItem('analytics_anonymous_id');
      if (!anonymousId) {
        anonymousId = 'anon_' + Math.random().toString(36).substr(2, 12);
        localStorage.setItem('analytics_anonymous_id', anonymousId);
      }
      return anonymousId;
    }
    return 'anon_' + Math.random().toString(36).substr(2, 12);
  }
  
  /**
   * Get safe config for logging (removes sensitive data)
   * Returns configuration without API keys or sensitive information
   * 
   * @returns {Object} Safe configuration object
   */
  getSafeConfig() {
    const { apiKey, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      apiKey: apiKey ? '***' : null
    };
  }
  
  /**
   * Log debug messages if debug mode is enabled
   * Centralized logging with consistent formatting
   * 
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   */
  log(message, data = null) {
    if (this.config.debug) {
      const timestamp = new Date().toISOString();
      console.log(`[Analytics SDK ${timestamp}] ${message}`, data || '');
    }
  }
  
  /**
   * Clean shutdown of the SDK
   * Flushes remaining events and clears timers
   * 
   * @returns {Promise} Promise that resolves when shutdown completes
   */
  async shutdown() {
    this.log('Shutting down SDK...');
    
    // Clear auto-flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush remaining events
    await this.flush(true);
    
    // Track shutdown event
    this.track('sdk_shutdown', {}, { immediate: true });
    await this.flush(true);
    
    this.isInitialized = false;
    this.log('SDK shutdown complete');
  }
}

// =======================
// Approach 2: Enhanced Analytics SDK with Advanced Features
// =======================

/**
 * Enhanced analytics SDK with advanced features
 * Includes A/B testing, feature flags, performance monitoring,
 * and sophisticated privacy controls
 */
class EnhancedAnalyticsSDK extends BasicAnalyticsSDK {
  constructor(config = {}) {
    super(config);
    
    // Enhanced configuration
    this.enhancedConfig = {
      ...this.config,
      
      // Privacy settings
      enableDataCollection: config.enableDataCollection ?? true,
      respectDoNotTrack: config.respectDoNotTrack ?? true,
      anonymizeIPs: config.anonymizeIPs ?? true,
      
      // Advanced features
      enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true,
      enableFunnelTracking: config.enableFunnelTracking ?? false,
      enableHeatmapData: config.enableHeatmapData ?? false,
      
      // Sampling
      samplingRate: config.samplingRate ?? 1.0, // 1.0 = 100%
      
      // Custom hooks
      beforeSendHook: config.beforeSendHook || null,
      afterSendHook: config.afterSendHook || null
    };
    
    // Enhanced state
    this.featureFlags = new Map();
    this.experiments = new Map();
    this.performanceMetrics = new Map();
    this.funnelSteps = new Map();
    this.userSegments = new Set();
    
    // Initialize enhanced features
    this.initializeEnhancedFeatures();
  }
  
  /**
   * Initialize enhanced features
   * Sets up performance monitoring, privacy checks, etc.
   */
  initializeEnhancedFeatures() {
    // Check privacy settings
    this.checkPrivacySettings();
    
    // Set up performance monitoring
    if (this.enhancedConfig.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }
    
    // Set up automatic page view tracking
    this.setupPageViewTracking();
    
    this.log('Enhanced features initialized');
  }
  
  /**
   * Override track method to add privacy checks and sampling
   * Enhances base tracking with privacy controls and sampling
   */
  track(eventName, properties = {}, options = {}) {
    // Privacy checks
    if (!this.shouldCollectData()) {
      this.log('Data collection disabled, skipping event');
      return;
    }
    
    // Sampling check
    if (!this.shouldSampleEvent()) {
      this.log('Event not sampled, skipping');
      return;
    }
    
    // Apply beforeSend hook
    if (this.enhancedConfig.beforeSendHook) {
      const modifiedEvent = this.enhancedConfig.beforeSendHook(eventName, properties);
      if (!modifiedEvent) {
        this.log('Event cancelled by beforeSend hook');
        return;
      }
      eventName = modifiedEvent.eventName || eventName;
      properties = modifiedEvent.properties || properties;
    }
    
    // Add enhanced properties
    properties = this.enhanceProperties(properties);
    
    // Call parent track method
    super.track(eventName, properties, options);
  }
  
  /**
   * Track page views with enhanced data
   * Captures detailed page information and performance metrics
   * 
   * @param {string} pageName - Optional page name override
   * @param {Object} properties - Additional page properties
   */
  trackPageView(pageName = null, properties = {}) {
    const pageProperties = {
      ...properties,
      page_name: pageName || this.getPageName(),
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_search: window.location.search,
      page_hash: window.location.hash,
      referrer: document.referrer,
      
      // Performance data
      ...this.getPagePerformanceMetrics()
    };
    
    this.track('page_view', pageProperties);
  }
  
  /**
   * Track conversion events with funnel context
   * Enhanced conversion tracking with funnel step information
   * 
   * @param {string} goalName - Name of the conversion goal
   * @param {number} value - Conversion value (optional)
   * @param {Object} properties - Additional conversion properties
   */
  trackConversion(goalName, value = null, properties = {}) {
    const conversionProperties = {
      ...properties,
      goal_name: goalName,
      goal_value: value,
      conversion_timestamp: Date.now(),
      
      // Add funnel context if available
      funnel_step: this.getCurrentFunnelStep(),
      funnel_progress: this.getFunnelProgress(),
      
      // Add user segments
      user_segments: Array.from(this.userSegments)
    };
    
    this.track('conversion', conversionProperties, { immediate: true });
  }
  
  /**
   * Set feature flag values
   * Manages feature flag state for A/B testing
   * 
   * @param {string} flagName - Feature flag name
   * @param {any} value - Flag value
   * @param {string} variant - Variant identifier for A/B testing
   */
  setFeatureFlag(flagName, value, variant = null) {
    this.featureFlags.set(flagName, {
      value,
      variant,
      timestamp: Date.now()
    });
    
    // Track feature flag exposure
    this.track('feature_flag_exposure', {
      flag_name: flagName,
      flag_value: value,
      flag_variant: variant
    });
    
    this.log(`Feature flag set: ${flagName} = ${value} (${variant})`);
  }
  
  /**
   * Get feature flag value
   * Retrieves feature flag value with default fallback
   * 
   * @param {string} flagName - Feature flag name
   * @param {any} defaultValue - Default value if flag not set
   * @returns {any} Feature flag value
   */
  getFeatureFlag(flagName, defaultValue = false) {
    const flag = this.featureFlags.get(flagName);
    return flag ? flag.value : defaultValue;
  }
  
  /**
   * Start A/B test experiment
   * Initializes user participation in an A/B test
   * 
   * @param {string} experimentName - Name of the experiment
   * @param {string} variant - Assigned variant
   * @param {Object} context - Experiment context
   */
  startExperiment(experimentName, variant, context = {}) {
    this.experiments.set(experimentName, {
      variant,
      startTime: Date.now(),
      context
    });
    
    this.track('experiment_started', {
      experiment_name: experimentName,
      experiment_variant: variant,
      experiment_context: context
    });
    
    this.log(`Experiment started: ${experimentName} (${variant})`);
  }
  
  /**
   * Track experiment conversion
   * Records when user completes experiment goal
   * 
   * @param {string} experimentName - Name of the experiment
   * @param {string} goalType - Type of conversion goal
   * @param {number} value - Conversion value
   */
  trackExperimentConversion(experimentName, goalType, value = 1) {
    const experiment = this.experiments.get(experimentName);
    
    if (!experiment) {
      this.log(`Unknown experiment: ${experimentName}`);
      return;
    }
    
    this.track('experiment_conversion', {
      experiment_name: experimentName,
      experiment_variant: experiment.variant,
      goal_type: goalType,
      goal_value: value,
      time_to_conversion: Date.now() - experiment.startTime
    });
  }
  
  /**
   * Add user to segment
   * Manages user segmentation for targeted analytics
   * 
   * @param {string} segment - Segment identifier
   */
  addUserSegment(segment) {
    if (!this.userSegments.has(segment)) {
      this.userSegments.add(segment);
      
      this.track('user_segment_added', {
        segment_name: segment,
        total_segments: this.userSegments.size
      });
    }
  }
  
  /**
   * Check if data collection should proceed
   * Implements privacy controls and user preferences
   * 
   * @returns {boolean} Whether data collection is allowed
   */
  shouldCollectData() {
    // Check global data collection setting
    if (!this.enhancedConfig.enableDataCollection) {
      return false;
    }
    
    // Check Do Not Track header
    if (this.enhancedConfig.respectDoNotTrack && navigator.doNotTrack === '1') {
      return false;
    }
    
    // Check if user has opted out (custom implementation needed)
    if (this.hasUserOptedOut()) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if event should be sampled
   * Implements sampling logic to reduce data volume
   * 
   * @returns {boolean} Whether event should be sampled
   */
  shouldSampleEvent() {
    return Math.random() < this.enhancedConfig.samplingRate;
  }
  
  /**
   * Enhance event properties with context data
   * Adds user segments, experiments, and feature flags to events
   * 
   * @param {Object} properties - Original properties
   * @returns {Object} Enhanced properties
   */
  enhanceProperties(properties) {
    const enhancedProps = { ...properties };
    
    // Add active experiments
    if (this.experiments.size > 0) {
      enhancedProps.active_experiments = {};
      for (const [name, experiment] of this.experiments) {
        enhancedProps.active_experiments[name] = experiment.variant;
      }
    }
    
    // Add user segments
    if (this.userSegments.size > 0) {
      enhancedProps.user_segments = Array.from(this.userSegments);
    }
    
    // Add feature flags
    if (this.featureFlags.size > 0) {
      enhancedProps.feature_flags = {};
      for (const [name, flag] of this.featureFlags) {
        enhancedProps.feature_flags[name] = flag.value;
      }
    }
    
    return enhancedProps;
  }
  
  /**
   * Set up performance monitoring
   * Tracks page load times, resource loading, and user interactions
   */
  setupPerformanceMonitoring() {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }
    
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => { // Small delay to ensure all metrics are available
        this.trackPageLoadPerformance();
      }, 100);
    });
    
    // Track navigation performance
    this.setupNavigationTiming();
    
    this.log('Performance monitoring enabled');
  }
  
  /**
   * Track page load performance metrics
   * Captures detailed timing information about page loading
   */
  trackPageLoadPerformance() {
    const perfData = window.performance.timing;
    const navigation = window.performance.navigation;
    
    const metrics = {
      // Navigation timing
      dns_lookup_time: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp_connect_time: perfData.connectEnd - perfData.connectStart,
      request_response_time: perfData.responseEnd - perfData.requestStart,
      dom_processing_time: perfData.domComplete - perfData.domLoading,
      page_load_time: perfData.loadEventEnd - perfData.navigationStart,
      
      // Navigation type
      navigation_type: navigation.type, // 0=navigate, 1=reload, 2=back_forward
      redirect_count: navigation.redirectCount,
      
      // Resource timing
      resource_count: window.performance.getEntriesByType('resource').length
    };
    
    this.track('page_performance', metrics);
  }
  
  /**
   * Get current page performance metrics
   * Returns real-time performance data for current page
   * 
   * @returns {Object} Performance metrics
   */
  getPagePerformanceMetrics() {
    if (typeof window === 'undefined' || !window.performance) {
      return {};
    }
    
    const now = window.performance.now();
    
    return {
      time_on_page: Math.round(now),
      memory_used: window.performance.memory ? window.performance.memory.usedJSHeapSize : null,
      connection_type: navigator.connection ? navigator.connection.effectiveType : null
    };
  }
  
  /**
   * Check if user has opted out of tracking
   * Placeholder for custom opt-out implementation
   * 
   * @returns {boolean} Whether user has opted out
   */
  hasUserOptedOut() {
    // Check localStorage for opt-out flag
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('analytics_opt_out') === 'true';
    }
    return false;
  }
  
  /**
   * Set up automatic page view tracking
   * Monitors URL changes for single-page applications
   */
  setupPageViewTracking() {
    // Track initial page view
    if (typeof window !== 'undefined') {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.trackPageView();
        });
      } else {
        this.trackPageView();
      }
      
      // Track navigation in SPAs
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => this.trackPageView(), 0);
      }.bind(this);
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => this.trackPageView(), 0);
      }.bind(this);
      
      window.addEventListener('popstate', () => {
        setTimeout(() => this.trackPageView(), 0);
      });
    }
  }
  
  /**
   * Get current page name from title or URL
   * Extracts meaningful page identifier
   * 
   * @returns {string} Page name
   */
  getPageName() {
    if (typeof document !== 'undefined') {
      return document.title || window.location.pathname;
    }
    return 'unknown';
  }
  
  /**
   * Get current funnel step
   * Returns current step in conversion funnel
   * 
   * @returns {string|null} Current funnel step
   */
  getCurrentFunnelStep() {
    // Implementation depends on your funnel logic
    // This is a placeholder
    return null;
  }
  
  /**
   * Get funnel progress percentage
   * Returns how far user has progressed through funnel
   * 
   * @returns {number} Progress percentage (0-100)
   */
  getFunnelProgress() {
    // Implementation depends on your funnel logic
    // This is a placeholder
    return 0;
  }
  
  /**
   * Set up navigation timing observation
   * Uses Performance Observer API for modern browsers
   */
  setupNavigationTiming() {
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }
  }
  
  /**
   * Track navigation timing data
   * Processes navigation performance entries
   * 
   * @param {PerformanceNavigationTiming} entry - Navigation timing entry
   */
  trackNavigationTiming(entry) {
    const metrics = {
      dns_time: entry.domainLookupEnd - entry.domainLookupStart,
      connect_time: entry.connectEnd - entry.connectStart,
      request_time: entry.responseEnd - entry.requestStart,
      response_time: entry.responseEnd - entry.responseStart,
      dom_processing: entry.domComplete - entry.domInteractive,
      load_complete: entry.loadEventEnd - entry.loadEventStart
    };
    
    this.track('navigation_timing', metrics);
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic analytics implementation
 * Shows fundamental usage patterns for event tracking
 */
function demonstrateBasicAnalytics() {
  console.log('=== Basic Analytics SDK Demo ===\n');
  
  // Initialize SDK
  const analytics = new BasicAnalyticsSDK({
    apiEndpoint: 'https://api.example.com/analytics',
    apiKey: 'your-api-key',
    debug: true,
    batchSize: 5,
    flushInterval: 3000
  });
  
  // Identify user
  analytics.identify('user123', {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'premium'
  });
  
  // Track various events
  analytics.track('button_clicked', {
    button_name: 'signup',
    page: 'homepage',
    campaign: 'summer2023'
  });
  
  analytics.track('form_submitted', {
    form_name: 'contact',
    fields: ['name', 'email', 'message'],
    validation_errors: 0
  });
  
  analytics.track('purchase_completed', {
    product_id: 'prod_123',
    product_name: 'Premium Plan',
    price: 29.99,
    currency: 'USD'
  });
  
  // Force immediate flush
  analytics.track('critical_action', {
    action_type: 'account_created'
  }, { immediate: true });
  
  console.log('Basic events tracked, check console for debug output');
  
  // Shutdown after demo
  setTimeout(async () => {
    await analytics.shutdown();
    console.log('Basic analytics demo completed');
  }, 5000);
}

/**
 * Example 2: Enhanced analytics with A/B testing
 * Demonstrates advanced features and experiment tracking
 */
function demonstrateEnhancedAnalytics() {
  console.log('=== Enhanced Analytics SDK Demo ===\n');
  
  // Initialize enhanced SDK
  const analytics = new EnhancedAnalyticsSDK({
    apiEndpoint: 'https://api.example.com/analytics',
    apiKey: 'your-api-key',
    debug: true,
    enablePerformanceMonitoring: true,
    samplingRate: 1.0, // 100% for demo
    beforeSendHook: (eventName, properties) => {
      console.log('Before send hook:', eventName);
      return { eventName, properties };
    }
  });
  
  // Set up user segments
  analytics.addUserSegment('premium_users');
  analytics.addUserSegment('mobile_users');
  
  // Set up A/B test
  analytics.startExperiment('homepage_redesign', 'variant_b', {
    test_duration: '2_weeks',
    traffic_split: '50_50'
  });
  
  // Set feature flags
  analytics.setFeatureFlag('new_checkout', true, 'enabled');
  analytics.setFeatureFlag('dark_mode', false, 'disabled');
  
  // Track enhanced events
  analytics.track('product_viewed', {
    product_id: 'prod_456',
    category: 'electronics',
    price: 99.99
  });
  
  // Track conversion for experiment
  analytics.trackExperimentConversion('homepage_redesign', 'signup', 1);
  
  // Track regular conversion
  analytics.trackConversion('newsletter_signup', null, {
    source: 'footer',
    campaign: 'growth_hack'
  });
  
  // Simulate page view
  analytics.trackPageView('product-detail', {
    product_id: 'prod_456',
    source: 'search'
  });
  
  console.log('Enhanced events tracked with A/B test and feature flag data');
  
  setTimeout(async () => {
    await analytics.shutdown();
    console.log('Enhanced analytics demo completed');
  }, 6000);
}

/**
 * Example 3: E-commerce analytics implementation
 * Shows comprehensive e-commerce event tracking
 */
function demonstrateEcommerceAnalytics() {
  console.log('=== E-commerce Analytics Demo ===\n');
  
  const analytics = new EnhancedAnalyticsSDK({
    apiEndpoint: 'https://api.example.com/ecommerce-analytics',
    apiKey: 'ecommerce-api-key',
    debug: true,
    enableFunnelTracking: true
  });
  
  // E-commerce event sequence
  const userId = 'customer_789';
  analytics.identify(userId, {
    customer_tier: 'gold',
    lifetime_value: 1250.00,
    signup_date: '2023-01-15'
  });
  
  // Product discovery
  analytics.track('product_search', {
    search_term: 'wireless headphones',
    results_count: 24,
    filter_applied: ['brand', 'price_range']
  });
  
  // Product engagement
  analytics.track('product_list_viewed', {
    category: 'electronics',
    product_count: 24,
    sort_method: 'price_low_to_high'
  });
  
  analytics.track('product_viewed', {
    product_id: 'headphones_001',
    product_name: 'Premium Wireless Headphones',
    price: 199.99,
    currency: 'USD',
    category: 'Electronics',
    brand: 'AudioTech'
  });
  
  // Cart interactions
  analytics.track('product_added_to_cart', {
    product_id: 'headphones_001',
    quantity: 1,
    price: 199.99,
    cart_total: 199.99
  });
  
  analytics.track('cart_viewed', {
    cart_id: 'cart_12345',
    cart_total: 199.99,
    item_count: 1
  });
  
  // Checkout process
  analytics.track('checkout_started', {
    cart_id: 'cart_12345',
    cart_total: 199.99,
    payment_method: 'credit_card'
  });
  
  analytics.track('checkout_step_completed', {
    step: 'shipping_info',
    step_number: 2,
    checkout_id: 'checkout_67890'
  });
  
  // Purchase completion
  analytics.track('purchase_completed', {
    order_id: 'order_54321',
    total: 199.99,
    currency: 'USD',
    items: [{
      product_id: 'headphones_001',
      product_name: 'Premium Wireless Headphones',
      quantity: 1,
      price: 199.99
    }],
    payment_method: 'credit_card',
    shipping_method: 'standard'
  });
  
  // Post-purchase
  analytics.track('email_sent', {
    email_type: 'order_confirmation',
    order_id: 'order_54321'
  });
  
  console.log('E-commerce analytics sequence completed');
  
  setTimeout(async () => {
    await analytics.shutdown();
    console.log('E-commerce analytics demo completed');
  }, 7000);
}

// Export all implementations and examples
module.exports = {
  BasicAnalyticsSDK,
  EnhancedAnalyticsSDK,
  demonstrateBasicAnalytics,
  demonstrateEnhancedAnalytics,
  demonstrateEcommerceAnalytics
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Analytics SDK Implementations\n');
  console.log('This module demonstrates comprehensive analytics SDK development');
  console.log('with basic and enhanced features for web applications.\n');
  
  demonstrateBasicAnalytics();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEnhancedAnalytics();
  }, 6000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEcommerceAnalytics();
  }, 13000);
}