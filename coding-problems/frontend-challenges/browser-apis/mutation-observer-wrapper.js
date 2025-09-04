/**
 * File: mutation-observer-wrapper.js
 * 
 * Challenge: Create a comprehensive MutationObserver wrapper that provides:
 * - DOM change tracking with efficient batching
 * - Dynamic content handling with callbacks
 * - Memory-safe cleanup and lifecycle management
 * - Performance optimizations for high-frequency mutations
 * 
 * Interview Focus:
 * - Understanding browser performance and DOM optimization
 * - Event batching and debouncing patterns
 * - Memory management and avoiding leaks
 * - API design for developer experience
 * 
 * Companies: Meta, Google, Netflix, Spotify (DOM-heavy apps)
 * Difficulty: Medium-Hard
 */

/**
 * APPROACH 1: Basic MutationObserver Wrapper
 * 
 * Simple wrapper that provides a cleaner API over native MutationObserver.
 * Good for understanding the core concepts but lacks advanced features.
 * 
 * Time: O(1) for registration, O(n) for processing mutations
 * Space: O(n) where n is number of observed elements
 */
class BasicMutationTracker {
  constructor() {
    this.observers = new Map(); // Track observers by target element
    this.callbacks = new Map(); // Store callbacks for each observer
  }

  /**
   * Observe DOM changes on a target element
   * @param {Element} target - DOM element to observe
   * @param {Object} options - What types of changes to observe
   * @param {Function} callback - Function called when changes occur
   */
  observe(target, options = {}, callback) {
    // Default options cover most common use cases
    // We separate concerns: what to observe vs how to handle
    const defaultOptions = {
      childList: true,      // Watch for added/removed child nodes
      attributes: true,     // Watch for attribute changes
      characterData: true,  // Watch for text content changes
      subtree: false,       // Don't observe descendants by default
      attributeOldValue: false, // Don't store previous attribute values
      characterDataOldValue: false // Don't store previous text content
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create new observer for this target
    // Each target gets its own observer for better isolation
    const observer = new MutationObserver((mutations) => {
      // Process mutations immediately (no batching in basic version)
      // Each mutation record contains: type, target, addedNodes, removedNodes, etc.
      callback(mutations, target);
    });

    // Start observing the target with specified options
    observer.observe(target, finalOptions);

    // Store references for cleanup later
    // Using WeakMap would be better but Map is clearer for learning
    this.observers.set(target, observer);
    this.callbacks.set(target, callback);

    // Return cleanup function - important for preventing memory leaks
    return () => this.unobserve(target);
  }

  /**
   * Stop observing a target element
   * Essential for preventing memory leaks in SPAs
   */
  unobserve(target) {
    const observer = this.observers.get(target);
    if (observer) {
      // Disconnect stops the observer and clears its record queue
      observer.disconnect();
      
      // Remove references to allow garbage collection
      this.observers.delete(target);
      this.callbacks.delete(target);
    }
  }

  /**
   * Stop all observations and clean up
   * Critical for component unmounting in React/Vue
   */
  disconnect() {
    // Disconnect all observers to prevent memory leaks
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    
    // Clear all references
    this.observers.clear();
    this.callbacks.clear();
  }
}

/**
 * APPROACH 2: Advanced MutationObserver with Batching
 * 
 * Production-ready wrapper with performance optimizations:
 * - Batches mutations for better performance
 * - Debounces rapid changes
 * - Provides typed callbacks for different mutation types
 * 
 * Time: O(1) for registration, O(n) for batched processing
 * Space: O(n + m) where n = elements, m = queued mutations
 */
class AdvancedMutationTracker {
  constructor(options = {}) {
    // Configuration affects performance characteristics
    this.batchDelay = options.batchDelay || 16; // ~60fps batching
    this.maxBatchSize = options.maxBatchSize || 100; // Prevent memory bloat
    
    // State management for batching system
    this.observers = new Map();
    this.callbacks = new Map();
    this.mutationQueue = []; // Batch mutations before processing
    this.batchTimer = null; // Debounce rapid mutations
    this.isProcessing = false; // Prevent recursive processing
    
    // Bind methods to preserve context when used as callbacks
    this.processBatch = this.processBatch.bind(this);
    this.handleMutations = this.handleMutations.bind(this);
  }

  /**
   * Enhanced observe method with typed callbacks and batching
   */
  observe(target, options = {}, callbacks) {
    // Support both function and object callback formats
    // Object format allows type-specific handling
    const normalizedCallbacks = typeof callbacks === 'function' 
      ? { all: callbacks }
      : callbacks;

    const defaultOptions = {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: options.deep || false, // More intuitive naming
      attributeOldValue: options.trackOldValues || false,
      characterDataOldValue: options.trackOldValues || false,
      attributeFilter: options.attributeFilter // Only watch specific attributes
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Create observer with batched mutation handler
    const observer = new MutationObserver(this.handleMutations);
    observer.observe(target, finalOptions);

    // Store metadata for this observation
    this.observers.set(target, observer);
    this.callbacks.set(target, {
      callbacks: normalizedCallbacks,
      options: finalOptions,
      target: target
    });

    return () => this.unobserve(target);
  }

  /**
   * Batched mutation handler - core performance optimization
   * Collects mutations and processes them efficiently
   */
  handleMutations(mutations) {
    // Add mutations to queue for batched processing
    // This prevents overwhelming the main thread with rapid changes
    this.mutationQueue.push(...mutations);

    // Prevent memory leaks from unlimited queue growth
    if (this.mutationQueue.length > this.maxBatchSize) {
      // Process immediately if queue gets too large
      this.processBatch();
      return;
    }

    // Debounce processing using requestAnimationFrame timing
    if (!this.batchTimer && !this.isProcessing) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchDelay);
    }
  }

  /**
   * Process accumulated mutations in batches
   * This is where the performance magic happens
   */
  processBatch() {
    if (this.isProcessing || this.mutationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    clearTimeout(this.batchTimer);
    this.batchTimer = null;

    // Group mutations by target element for efficient processing
    // This reduces callback invocations for the same element
    const mutationsByTarget = new Map();
    
    for (const mutation of this.mutationQueue) {
      const target = mutation.target;
      if (!mutationsByTarget.has(target)) {
        mutationsByTarget.set(target, []);
      }
      mutationsByTarget.get(target).push(mutation);
    }

    // Process each target's mutations
    for (const [target, mutations] of mutationsByTarget) {
      const callbackData = this.callbacks.get(target);
      if (!callbackData) continue;

      const { callbacks } = callbackData;

      // Group mutations by type for type-specific callbacks
      const mutationsByType = this.groupMutationsByType(mutations);

      try {
        // Call type-specific callbacks if provided
        if (callbacks.childList && mutationsByType.childList.length > 0) {
          callbacks.childList(mutationsByType.childList, target);
        }
        
        if (callbacks.attributes && mutationsByType.attributes.length > 0) {
          callbacks.attributes(mutationsByType.attributes, target);
        }
        
        if (callbacks.characterData && mutationsByType.characterData.length > 0) {
          callbacks.characterData(mutationsByType.characterData, target);
        }

        // Always call general callback if provided
        if (callbacks.all) {
          callbacks.all(mutations, target);
        }
      } catch (error) {
        // Don't let callback errors break the observation system
        console.error('MutationTracker callback error:', error);
      }
    }

    // Clear processed mutations and reset state
    this.mutationQueue = [];
    this.isProcessing = false;

    // If more mutations arrived during processing, schedule another batch
    if (this.mutationQueue.length > 0) {
      this.batchTimer = setTimeout(this.processBatch, this.batchDelay);
    }
  }

  /**
   * Group mutations by type for efficient callback handling
   * Helps developers handle specific types of changes
   */
  groupMutationsByType(mutations) {
    const groups = {
      childList: [],
      attributes: [],
      characterData: []
    };

    // Categorize each mutation for type-specific handling
    for (const mutation of mutations) {
      if (groups[mutation.type]) {
        groups[mutation.type].push(mutation);
      }
    }

    return groups;
  }

  /**
   * Enhanced unobserve with proper cleanup
   */
  unobserve(target) {
    const observer = this.observers.get(target);
    if (observer) {
      observer.disconnect();
      this.observers.delete(target);
      this.callbacks.delete(target);
    }
  }

  /**
   * Complete cleanup - essential for SPA lifecycle management
   */
  disconnect() {
    // Clear any pending batch processing
    clearTimeout(this.batchTimer);
    this.batchTimer = null;
    this.mutationQueue = [];
    this.isProcessing = false;

    // Disconnect all observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }

    this.observers.clear();
    this.callbacks.clear();
  }
}

/**
 * APPROACH 3: Production-Ready MutationObserver with Advanced Features
 * 
 * Enterprise-grade implementation with:
 * - Memory leak detection and prevention
 * - Performance monitoring and metrics
 * - Plugin system for extensibility
 * - Error recovery and resilience
 * 
 * Time: O(1) registration, O(n log n) processing with optimizations
 * Space: O(n + m + p) where p = plugin overhead
 */
class ProductionMutationTracker extends AdvancedMutationTracker {
  constructor(options = {}) {
    super(options);
    
    // Advanced configuration options
    this.enableMetrics = options.enableMetrics || false;
    this.memoryCheckInterval = options.memoryCheckInterval || 30000; // 30s
    this.maxObservers = options.maxObservers || 1000; // Prevent memory issues
    
    // Performance tracking
    this.metrics = {
      totalMutations: 0,
      batchesProcessed: 0,
      averageBatchSize: 0,
      processingTime: 0
    };
    
    // Plugin system for extensibility
    this.plugins = new Set();
    
    // Memory management
    this.memoryCheckTimer = null;
    if (options.memoryManagement !== false) {
      this.startMemoryMonitoring();
    }
  }

  /**
   * Enhanced observe with validation and limits
   */
  observe(target, options = {}, callbacks) {
    // Prevent memory issues by limiting total observers
    if (this.observers.size >= this.maxObservers) {
      throw new Error(`Maximum observers limit (${this.maxObservers}) exceeded`);
    }

    // Validate target element
    if (!target || !target.nodeType) {
      throw new Error('Invalid target: must be a DOM element');
    }

    // Prevent duplicate observations
    if (this.observers.has(target)) {
      console.warn('Target already being observed, cleaning up previous observation');
      this.unobserve(target);
    }

    // Call plugins before observation starts
    for (const plugin of this.plugins) {
      if (plugin.beforeObserve) {
        plugin.beforeObserve(target, options, callbacks);
      }
    }

    return super.observe(target, options, callbacks);
  }

  /**
   * Enhanced batch processing with metrics and error recovery
   */
  processBatch() {
    if (this.enableMetrics) {
      const startTime = performance.now();
      
      super.processBatch();
      
      // Update performance metrics
      const processingTime = performance.now() - startTime;
      this.metrics.processingTime += processingTime;
      this.metrics.batchesProcessed++;
      this.metrics.totalMutations += this.mutationQueue.length;
      this.metrics.averageBatchSize = this.metrics.totalMutations / this.metrics.batchesProcessed;
    } else {
      super.processBatch();
    }
  }

  /**
   * Plugin system for extending functionality
   * Allows custom behavior without modifying core code
   */
  addPlugin(plugin) {
    if (typeof plugin !== 'object' || !plugin.name) {
      throw new Error('Plugin must be an object with a name property');
    }
    
    this.plugins.add(plugin);
    
    if (plugin.initialize) {
      plugin.initialize(this);
    }
  }

  removePlugin(pluginName) {
    for (const plugin of this.plugins) {
      if (plugin.name === pluginName) {
        if (plugin.destroy) {
          plugin.destroy(this);
        }
        this.plugins.delete(plugin);
        break;
      }
    }
  }

  /**
   * Memory monitoring to detect and prevent leaks
   * Critical for long-running applications
   */
  startMemoryMonitoring() {
    this.memoryCheckTimer = setInterval(() => {
      // Check if observers are still valid
      for (const [target, observer] of this.observers) {
        // Clean up observers for elements no longer in DOM
        if (!target.isConnected) {
          console.warn('Cleaning up observer for disconnected element');
          this.unobserve(target);
        }
      }
      
      // Log memory usage if metrics enabled
      if (this.enableMetrics) {
        console.info('MutationTracker status:', {
          activeObservers: this.observers.size,
          queuedMutations: this.mutationQueue.length,
          metrics: this.metrics
        });
      }
    }, this.memoryCheckInterval);
  }

  /**
   * Get performance metrics
   * Useful for debugging and optimization
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalMutations: 0,
      batchesProcessed: 0,
      averageBatchSize: 0,
      processingTime: 0
    };
  }

  /**
   * Enhanced cleanup with memory monitoring
   */
  disconnect() {
    super.disconnect();
    
    // Clean up memory monitoring
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer);
      this.memoryCheckTimer = null;
    }

    // Cleanup plugins
    for (const plugin of this.plugins) {
      if (plugin.destroy) {
        plugin.destroy(this);
      }
    }
    this.plugins.clear();
  }
}

// =============================================================================
// EXAMPLE USAGE AND TESTING
// =============================================================================

/**
 * Example 1: Basic DOM change tracking
 * Common use case: Track when content is dynamically added
 */
function exampleBasicUsage() {
  const tracker = new BasicMutationTracker();
  const container = document.getElementById('dynamic-content');

  if (container) {
    const cleanup = tracker.observe(
      container,
      { childList: true, subtree: true },
      (mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            console.log('Added nodes:', mutation.addedNodes.length);
            console.log('Removed nodes:', mutation.removedNodes.length);
          }
        });
      }
    );

    // Important: cleanup when component unmounts
    // In React: useEffect(() => cleanup, [])
    return cleanup;
  }
}

/**
 * Example 2: Advanced tracking with type-specific callbacks
 * Use case: Monitor form validation and content changes separately
 */
function exampleAdvancedUsage() {
  const tracker = new AdvancedMutationTracker({
    batchDelay: 50, // Longer delay for less frequent updates
    maxBatchSize: 200
  });

  const form = document.getElementById('user-form');
  
  if (form) {
    return tracker.observe(form, 
      { 
        attributes: true, 
        childList: true,
        attributeFilter: ['class', 'data-valid'] // Only watch validation attributes
      }, 
      {
        // Type-specific callbacks for better organization
        attributes: (mutations) => {
          // Handle validation state changes
          mutations.forEach(mutation => {
            if (mutation.attributeName === 'data-valid') {
              console.log('Validation changed:', mutation.target.dataset.valid);
            }
          });
        },
        
        childList: (mutations) => {
          // Handle form field addition/removal
          console.log('Form structure changed');
        },
        
        all: (mutations) => {
          // General logging for debugging
          console.log('Form mutations:', mutations.length);
        }
      }
    );
  }
}

/**
 * Example 3: Production usage with performance monitoring
 * Use case: Enterprise application with metrics and plugins
 */
function exampleProductionUsage() {
  const tracker = new ProductionMutationTracker({
    enableMetrics: true,
    memoryCheckInterval: 60000, // Check memory every minute
    maxObservers: 500
  });

  // Add performance monitoring plugin
  tracker.addPlugin({
    name: 'performance-monitor',
    initialize: (tracker) => {
      console.log('Performance monitoring initialized');
    },
    beforeObserve: (target, options, callbacks) => {
      console.log('Starting observation of:', target.tagName);
    }
  });

  // Monitor entire application for changes
  const appRoot = document.getElementById('app');
  if (appRoot) {
    return tracker.observe(
      appRoot,
      { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'] // Common UI changes
      },
      {
        all: (mutations) => {
          // Could integrate with analytics or performance monitoring
          if (mutations.length > 10) {
            console.warn('High mutation activity detected:', mutations.length);
          }
        }
      }
    );
  }
}

// =============================================================================
// INTERVIEW QUESTIONS AND FOLLOW-UPS
// =============================================================================

/**
 * Common Interview Questions:
 * 
 * Q1: "How would you detect when new content is added to a page?"
 * A: Use MutationObserver to watch for childList changes. Show basic example.
 * 
 * Q2: "How do you prevent performance issues with frequent DOM changes?"
 * A: Implement batching/debouncing. Explain the advanced approach.
 * 
 * Q3: "How do you handle memory leaks with observers?"
 * A: Show cleanup patterns and memory monitoring from production example.
 * 
 * Q4: "What's the difference between MutationObserver and polling?"
 * A: Observer is event-driven (efficient), polling is timer-based (inefficient).
 * 
 * Q5: "How would you make this work across different browsers?"
 * A: MutationObserver is well-supported (IE11+). For older browsers, fall back to
 *     DOM events or polling, but explain the trade-offs.
 * 
 * Follow-up Questions:
 * - "How would you test this code?"
 * - "What metrics would you track in production?"
 * - "How would you extend this for React components?"
 * - "What security considerations are there?"
 */

// Export for testing and real-world usage
module.exports = {
  BasicMutationTracker,
  AdvancedMutationTracker,
  ProductionMutationTracker,
  
  // Example functions for demonstration
  exampleBasicUsage,
  exampleAdvancedUsage,
  exampleProductionUsage
};