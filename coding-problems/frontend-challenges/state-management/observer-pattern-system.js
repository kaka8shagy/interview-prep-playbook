/**
 * Observer Pattern System - Reactive State Management
 * 
 * A comprehensive implementation of the Observer pattern for reactive state management,
 * featuring subscription handling, memory-safe cleanup, and advanced state synchronization.
 * 
 * Common interview topics:
 * - Observer vs Pub/Sub pattern differences
 * - Memory leak prevention in observer systems
 * - Reactive programming concepts and implementation
 * - State synchronization and change propagation
 * - Performance optimization for many observers
 * 
 * Companies that ask this: Meta, Google, Netflix, Airbnb, Uber
 * Frequency: Very High (★★★★★) - Core pattern in modern frameworks
 */

// ===================================================================
// APPROACH 1: BASIC OBSERVER PATTERN
// Time: O(n) for notify, O(1) for subscribe/unsubscribe
// Space: O(n) for observers storage
// ===================================================================

/**
 * Basic Observable implementation with core observer pattern functionality
 * This approach demonstrates the fundamental observer pattern concepts
 * without advanced features like state management or change detection
 */
class BasicObservable {
  constructor() {
    // Store observers in a Set for O(1) add/remove and automatic deduplication
    // Using Set prevents duplicate observer registration
    this.observers = new Set();
    
    // Track current state - basic implementation just holds any value
    this.state = null;
  }
  
  /**
   * Subscribe an observer function to state changes
   * @param {Function} observer - Function called when state changes
   * @returns {Function} Unsubscribe function for cleanup
   */
  subscribe(observer) {
    // Validate observer is a function to prevent runtime errors
    if (typeof observer !== 'function') {
      throw new TypeError('Observer must be a function');
    }
    
    // Add observer to our set
    this.observers.add(observer);
    
    // Return unsubscribe function following modern pattern
    // This closure captures the observer reference for safe removal
    return () => {
      this.observers.delete(observer);
    };
  }
  
  /**
   * Notify all observers of state change
   * Basic implementation passes current state to each observer
   */
  notify() {
    // Use for...of for efficient iteration over Set
    // Each observer receives current state
    for (const observer of this.observers) {
      try {
        // Wrap in try-catch to prevent one observer error from breaking others
        observer(this.state);
      } catch (error) {
        // Log error but continue notifying other observers
        // In production, you might want to collect these errors
        console.error('Observer error:', error);
      }
    }
  }
  
  /**
   * Update state and notify observers
   * Basic setter that triggers change detection
   */
  setState(newState) {
    // Simple assignment - no change detection yet
    this.state = newState;
    
    // Immediately notify all observers
    this.notify();
  }
  
  /**
   * Get current state value
   */
  getState() {
    return this.state;
  }
  
  /**
   * Get current observer count for debugging
   */
  getObserverCount() {
    return this.observers.size;
  }
}

// ===================================================================
// APPROACH 2: ADVANCED REACTIVE STATE MANAGER
// Time: O(n) for notify with change detection, O(1) for operations
// Space: O(n) for observers + O(m) for computed values
// ===================================================================

/**
 * Advanced reactive state manager with change detection, computed values,
 * and sophisticated observer management
 */
class ReactiveStateManager {
  constructor(initialState = {}) {
    // Store state as immutable-friendly object
    this.state = { ...initialState };
    
    // Map of property paths to observer sets for targeted notifications
    // This allows observers to subscribe to specific state properties
    this.propertyObservers = new Map();
    
    // Global observers that get notified of any state change
    this.globalObservers = new Set();
    
    // Computed value cache with dependency tracking
    this.computedValues = new Map();
    this.computedDependencies = new Map();
    
    // Change detection - track previous state for comparison
    this.previousState = { ...initialState };
    
    // Performance optimization - batch notifications
    this.notificationQueue = new Set();
    this.isNotifying = false;
  }
  
  /**
   * Subscribe to state changes with optional property filtering
   * @param {Function} observer - Callback function
   * @param {string} propertyPath - Optional specific property to watch
   * @returns {Function} Unsubscribe function
   */
  subscribe(observer, propertyPath = null) {
    if (typeof observer !== 'function') {
      throw new TypeError('Observer must be a function');
    }
    
    if (propertyPath) {
      // Subscribe to specific property changes
      if (!this.propertyObservers.has(propertyPath)) {
        this.propertyObservers.set(propertyPath, new Set());
      }
      this.propertyObservers.get(propertyPath).add(observer);
      
      // Return targeted unsubscribe function
      return () => {
        const observers = this.propertyObservers.get(propertyPath);
        if (observers) {
          observers.delete(observer);
          // Clean up empty observer sets to prevent memory leaks
          if (observers.size === 0) {
            this.propertyObservers.delete(propertyPath);
          }
        }
      };
    } else {
      // Subscribe to all state changes
      this.globalObservers.add(observer);
      return () => this.globalObservers.delete(observer);
    }
  }
  
  /**
   * Update state with change detection and batched notifications
   * Supports both object merge and function updates
   */
  setState(stateOrUpdater) {
    // Store previous state for change detection
    this.previousState = { ...this.state };
    
    // Handle function updater pattern (similar to React setState)
    if (typeof stateOrUpdater === 'function') {
      this.state = { ...this.state, ...stateOrUpdater(this.state) };
    } else {
      // Merge new state with existing state
      this.state = { ...this.state, ...stateOrUpdater };
    }
    
    // Detect which properties actually changed
    const changedProperties = this.detectChanges();
    
    // Only notify if there were actual changes
    if (changedProperties.length > 0) {
      this.invalidateComputedValues(changedProperties);
      this.batchedNotify(changedProperties);
    }
  }
  
  /**
   * Detect which properties changed between previous and current state
   * Returns array of property paths that have different values
   */
  detectChanges() {
    const changed = [];
    const allKeys = new Set([
      ...Object.keys(this.previousState),
      ...Object.keys(this.state)
    ]);
    
    for (const key of allKeys) {
      // Use shallow comparison - for deep objects, consider using deep equality
      if (this.previousState[key] !== this.state[key]) {
        changed.push(key);
      }
    }
    
    return changed;
  }
  
  /**
   * Batch notifications to prevent multiple rapid-fire observer calls
   * Uses microtask queue for efficient batching
   */
  batchedNotify(changedProperties) {
    if (this.isNotifying) {
      return; // Already in notification cycle
    }
    
    this.isNotifying = true;
    
    // Use microtask for batching - executes after current execution stack
    queueMicrotask(() => {
      // Notify global observers
      for (const observer of this.globalObservers) {
        try {
          observer(this.state, changedProperties, this.previousState);
        } catch (error) {
          console.error('Global observer error:', error);
        }
      }
      
      // Notify property-specific observers
      for (const property of changedProperties) {
        const observers = this.propertyObservers.get(property);
        if (observers) {
          for (const observer of observers) {
            try {
              observer(this.state[property], property, this.state);
            } catch (error) {
              console.error('Property observer error:', error);
            }
          }
        }
      }
      
      this.isNotifying = false;
    });
  }
  
  /**
   * Create computed values that automatically update when dependencies change
   * @param {string} key - Computed value identifier
   * @param {Function} computeFn - Function to compute the value
   * @param {string[]} dependencies - Array of state properties this computed value depends on
   */
  addComputed(key, computeFn, dependencies = []) {
    // Store computed function and dependencies
    this.computedDependencies.set(key, dependencies);
    
    // Calculate initial value
    this.computedValues.set(key, computeFn(this.state));
    
    // Return current value
    return this.computedValues.get(key);
  }
  
  /**
   * Get computed value by key
   */
  getComputed(key) {
    return this.computedValues.get(key);
  }
  
  /**
   * Invalidate and recalculate computed values when their dependencies change
   */
  invalidateComputedValues(changedProperties) {
    for (const [key, dependencies] of this.computedDependencies) {
      // Check if any dependency changed
      if (dependencies.some(dep => changedProperties.includes(dep))) {
        // Recalculate computed value
        const computeFn = this.computedValues.get(key + '_fn');
        if (computeFn) {
          this.computedValues.set(key, computeFn(this.state));
        }
      }
    }
  }
  
  getState() {
    return this.state;
  }
  
  /**
   * Development helper to inspect current observers
   */
  getDebugInfo() {
    return {
      globalObservers: this.globalObservers.size,
      propertyObservers: Array.from(this.propertyObservers.entries()).map(([prop, observers]) => ({
        property: prop,
        observerCount: observers.size
      })),
      computedValues: Array.from(this.computedValues.keys()),
      currentState: this.state
    };
  }
}

// ===================================================================
// APPROACH 3: ENTERPRISE OBSERVER SYSTEM
// Production-ready with WeakRef, event sourcing, and performance monitoring
// ===================================================================

/**
 * Enterprise-grade observer system with automatic cleanup, event sourcing,
 * performance monitoring, and memory leak prevention
 */
class EnterpriseObserverSystem {
  constructor(config = {}) {
    this.config = {
      maxObservers: 10000,
      enableEventSourcing: true,
      performanceMonitoring: true,
      autoCleanupInterval: 30000, // 30 seconds
      ...config
    };
    
    // Core state management
    this.state = {};
    this.version = 0;
    
    // Observer management with WeakRef for automatic garbage collection
    // WeakRef allows observers to be garbage collected even if still registered
    this.observers = new Map(); // observerId -> WeakRef<observer>
    this.observerMetadata = new Map(); // observerId -> metadata
    this.propertySubscriptions = new Map(); // property -> Set<observerId>
    
    // Event sourcing for debugging and time-travel
    this.events = this.config.enableEventSourcing ? [] : null;
    this.maxEvents = 1000;
    
    // Performance monitoring
    this.metrics = {
      notificationTime: [],
      observerCount: 0,
      stateChanges: 0,
      memoryCleanups: 0
    };
    
    // Automatic cleanup timer to remove dead WeakRefs
    this.setupAutoCleanup();
    
    // Generate unique observer IDs
    this.nextObserverId = 1;
  }
  
  /**
   * Subscribe with automatic cleanup and enhanced metadata
   * @param {Function} observer - Observer function
   * @param {Object} options - Subscription options
   * @returns {Object} Subscription object with unsubscribe and metadata
   */
  subscribe(observer, options = {}) {
    const {
      property = null,
      priority = 0,
      once = false,
      debounceMs = 0,
      condition = null, // Function to filter notifications
      metadata = {}
    } = options;
    
    if (typeof observer !== 'function') {
      throw new TypeError('Observer must be a function');
    }
    
    // Check observer limit to prevent memory issues
    if (this.observers.size >= this.config.maxObservers) {
      throw new Error(`Maximum observers limit (${this.config.maxObservers}) reached`);
    }
    
    const observerId = this.nextObserverId++;
    
    // Wrap observer with additional functionality
    let wrappedObserver = observer;
    
    // Add debouncing if requested
    if (debounceMs > 0) {
      let timeout;
      const originalObserver = observer;
      wrappedObserver = (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => originalObserver(...args), debounceMs);
      };
    }
    
    // Add condition filtering
    if (condition) {
      const originalObserver = wrappedObserver;
      wrappedObserver = (...args) => {
        if (condition(this.state, ...args)) {
          originalObserver(...args);
        }
      };
    }
    
    // Store observer with WeakRef for automatic cleanup
    this.observers.set(observerId, new WeakRef(wrappedObserver));
    
    // Store metadata for debugging and management
    this.observerMetadata.set(observerId, {
      property,
      priority,
      once,
      debounceMs,
      subscribeTime: Date.now(),
      callCount: 0,
      lastCallTime: null,
      metadata
    });
    
    // Register property subscription
    if (property) {
      if (!this.propertySubscriptions.has(property)) {
        this.propertySubscriptions.set(property, new Set());
      }
      this.propertySubscriptions.get(property).add(observerId);
    }
    
    this.metrics.observerCount = this.observers.size;
    
    // Return subscription object with enhanced API
    return {
      observerId,
      unsubscribe: () => this.unsubscribe(observerId),
      isPaused: false,
      pause: () => { this.observerMetadata.get(observerId).paused = true; },
      resume: () => { this.observerMetadata.get(observerId).paused = false; },
      getMetadata: () => this.observerMetadata.get(observerId),
      updateOptions: (newOptions) => this.updateObserverOptions(observerId, newOptions)
    };
  }
  
  /**
   * Enhanced state update with event sourcing and performance tracking
   */
  setState(stateOrUpdater, eventName = 'STATE_UPDATE') {
    const startTime = performance.now();
    const previousState = { ...this.state };
    
    // Apply state update
    if (typeof stateOrUpdater === 'function') {
      this.state = { ...this.state, ...stateOrUpdater(this.state) };
    } else {
      this.state = { ...this.state, ...stateOrUpdater };
    }
    
    this.version++;
    this.metrics.stateChanges++;
    
    // Event sourcing - record state changes for debugging
    if (this.config.enableEventSourcing) {
      this.recordEvent({
        type: eventName,
        timestamp: Date.now(),
        version: this.version,
        previousState,
        newState: { ...this.state },
        changes: this.getChangedProperties(previousState, this.state)
      });
    }
    
    // Notify observers with performance tracking
    const changedProperties = this.getChangedProperties(previousState, this.state);
    if (changedProperties.length > 0) {
      this.notifyObservers(changedProperties, previousState);
    }
    
    // Record performance metrics
    if (this.config.performanceMonitoring) {
      const duration = performance.now() - startTime;
      this.metrics.notificationTime.push(duration);
      // Keep only last 100 measurements
      if (this.metrics.notificationTime.length > 100) {
        this.metrics.notificationTime.shift();
      }
    }
  }
  
  /**
   * Advanced notification system with priority and filtering
   */
  notifyObservers(changedProperties, previousState) {
    // Get all relevant observer IDs sorted by priority
    const relevantObservers = this.getRelevantObservers(changedProperties);
    
    // Sort by priority (higher priority first)
    relevantObservers.sort((a, b) => {
      const priorityA = this.observerMetadata.get(a.id)?.priority || 0;
      const priorityB = this.observerMetadata.get(b.id)?.priority || 0;
      return priorityB - priorityA;
    });
    
    // Notify in priority order
    for (const { id, property } of relevantObservers) {
      const observerRef = this.observers.get(id);
      const metadata = this.observerMetadata.get(id);
      
      if (!observerRef || !metadata || metadata.paused) continue;
      
      // Get actual observer function from WeakRef
      const observer = observerRef.deref();
      if (!observer) {
        // Observer was garbage collected - clean up
        this.cleanupObserver(id);
        continue;
      }
      
      try {
        // Update call statistics
        metadata.callCount++;
        metadata.lastCallTime = Date.now();
        
        // Call observer with appropriate arguments
        if (property) {
          observer(this.state[property], property, this.state, previousState);
        } else {
          observer(this.state, changedProperties, previousState);
        }
        
        // Handle once-only observers
        if (metadata.once) {
          this.unsubscribe(id);
        }
        
      } catch (error) {
        console.error('Observer error:', error);
        // Optionally auto-unsubscribe failing observers in production
      }
    }
  }
  
  /**
   * Get observers relevant to the changed properties
   */
  getRelevantObservers(changedProperties) {
    const relevant = [];
    
    // Add global observers (no property filter)
    for (const [id, metadata] of this.observerMetadata) {
      if (!metadata.property) {
        relevant.push({ id, property: null });
      }
    }
    
    // Add property-specific observers
    for (const property of changedProperties) {
      const subscribers = this.propertySubscriptions.get(property);
      if (subscribers) {
        for (const id of subscribers) {
          relevant.push({ id, property });
        }
      }
    }
    
    return relevant;
  }
  
  /**
   * Clean up observer and its metadata
   */
  unsubscribe(observerId) {
    this.cleanupObserver(observerId);
  }
  
  /**
   * Internal cleanup for observers
   */
  cleanupObserver(observerId) {
    const metadata = this.observerMetadata.get(observerId);
    
    // Remove from property subscriptions
    if (metadata?.property) {
      const subscribers = this.propertySubscriptions.get(metadata.property);
      if (subscribers) {
        subscribers.delete(observerId);
        if (subscribers.size === 0) {
          this.propertySubscriptions.delete(metadata.property);
        }
      }
    }
    
    // Remove observer and metadata
    this.observers.delete(observerId);
    this.observerMetadata.delete(observerId);
    this.metrics.observerCount = this.observers.size;
    this.metrics.memoryCleanups++;
  }
  
  /**
   * Set up automatic cleanup of dead WeakRefs
   */
  setupAutoCleanup() {
    if (this.config.autoCleanupInterval > 0) {
      setInterval(() => {
        const deadObservers = [];
        
        for (const [id, observerRef] of this.observers) {
          if (!observerRef.deref()) {
            deadObservers.push(id);
          }
        }
        
        for (const id of deadObservers) {
          this.cleanupObserver(id);
        }
        
      }, this.config.autoCleanupInterval);
    }
  }
  
  /**
   * Event sourcing support
   */
  recordEvent(event) {
    if (!this.events) return;
    
    this.events.push(event);
    
    // Limit event history to prevent memory growth
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }
  
  /**
   * Get event history for debugging
   */
  getEventHistory(limit = 10) {
    return this.events ? this.events.slice(-limit) : [];
  }
  
  /**
   * Time-travel debugging - replay to specific version
   */
  replayToVersion(targetVersion) {
    if (!this.events) {
      throw new Error('Event sourcing not enabled');
    }
    
    // Find events up to target version
    const replayEvents = this.events.filter(e => e.version <= targetVersion);
    
    // Reset state
    this.state = {};
    this.version = 0;
    
    // Replay events
    for (const event of replayEvents) {
      this.state = { ...event.newState };
      this.version = event.version;
    }
    
    // Notify observers of the replayed state
    this.notifyObservers(Object.keys(this.state), {});
  }
  
  /**
   * Utility to detect changed properties
   */
  getChangedProperties(previousState, currentState) {
    const changes = [];
    const allKeys = new Set([
      ...Object.keys(previousState),
      ...Object.keys(currentState)
    ]);
    
    for (const key of allKeys) {
      if (previousState[key] !== currentState[key]) {
        changes.push(key);
      }
    }
    
    return changes;
  }
  
  /**
   * Performance and debugging utilities
   */
  getMetrics() {
    return {
      ...this.metrics,
      averageNotificationTime: this.metrics.notificationTime.length > 0
        ? this.metrics.notificationTime.reduce((a, b) => a + b, 0) / this.metrics.notificationTime.length
        : 0,
      stateVersion: this.version,
      eventHistorySize: this.events?.length || 0
    };
  }
  
  getState() {
    return this.state;
  }
  
  /**
   * Development tools integration
   */
  getDebugSnapshot() {
    return {
      state: this.state,
      version: this.version,
      observers: Array.from(this.observerMetadata.entries()).map(([id, metadata]) => ({
        id,
        ...metadata,
        isAlive: !!this.observers.get(id)?.deref()
      })),
      metrics: this.getMetrics(),
      recentEvents: this.getEventHistory(5)
    };
  }
}

// ===================================================================
// PRACTICAL USAGE EXAMPLES AND TESTING
// ===================================================================

// Example 1: Basic Observer Pattern
console.log('=== Basic Observer Pattern Demo ===');
const basicObservable = new BasicObservable();

const basicObserver1 = (state) => console.log('Observer 1:', state);
const basicObserver2 = (state) => console.log('Observer 2:', state);

const unsubscribe1 = basicObservable.subscribe(basicObserver1);
const unsubscribe2 = basicObservable.subscribe(basicObserver2);

basicObservable.setState('Hello World');
basicObservable.setState('Updated State');

unsubscribe1(); // Clean up first observer
basicObservable.setState('Only Observer 2 sees this');

// Example 2: Reactive State Manager
console.log('\n=== Reactive State Manager Demo ===');
const reactiveState = new ReactiveStateManager({ count: 0, name: 'Demo' });

// Global observer
reactiveState.subscribe((state, changed) => {
  console.log('Global observer - changed:', changed, 'state:', state);
});

// Property-specific observer
const unsubscribeCount = reactiveState.subscribe((value) => {
  console.log('Count changed to:', value);
}, 'count');

// Computed value
reactiveState.addComputed('doubleCount', (state) => state.count * 2, ['count']);

reactiveState.setState({ count: 5 });
reactiveState.setState({ name: 'Updated' });
console.log('Computed doubleCount:', reactiveState.getComputed('doubleCount'));

// Example 3: Enterprise Observer System
console.log('\n=== Enterprise Observer System Demo ===');
const enterprise = new EnterpriseObserverSystem({
  enableEventSourcing: true,
  performanceMonitoring: true
});

// High-priority observer
const subscription = enterprise.subscribe(
  (state) => console.log('High priority observer:', state),
  { priority: 10, metadata: { name: 'Critical Handler' } }
);

// Debounced observer
enterprise.subscribe(
  (state) => console.log('Debounced observer:', state),
  { debounceMs: 100 }
);

// Conditional observer
enterprise.subscribe(
  (state) => console.log('Conditional observer (count > 5):', state),
  { condition: (state) => state.count > 5 }
);

enterprise.setState({ count: 3 });
enterprise.setState({ count: 7 }); // Will trigger conditional observer

console.log('Performance metrics:', enterprise.getMetrics());
console.log('Event history:', enterprise.getEventHistory(3));

// Export all implementations for testing and usage
module.exports = {
  BasicObservable,
  ReactiveStateManager,
  EnterpriseObserverSystem
};

/**
 * INTERVIEW DISCUSSION POINTS:
 * 
 * 1. Observer vs Pub/Sub Pattern:
 *    - Observer: Direct coupling, observers know about subject
 *    - Pub/Sub: Decoupled through message broker/event bus
 *    - When to choose each pattern
 * 
 * 2. Memory Management:
 *    - WeakRef usage for automatic cleanup
 *    - Unsubscribe patterns and cleanup responsibilities  
 *    - Preventing memory leaks in SPA applications
 * 
 * 3. Performance Considerations:
 *    - Batched notifications to prevent observer storms
 *    - Priority-based observer ordering
 *    - Debouncing and throttling strategies
 * 
 * 4. State Management Patterns:
 *    - Immutability vs mutable state
 *    - Change detection strategies (shallow vs deep)
 *    - Computed values and dependency tracking
 * 
 * 5. Error Handling:
 *    - Isolating observer errors
 *    - Recovery strategies
 *    - Debugging and monitoring tools
 * 
 * 6. Real-world Applications:
 *    - React's state management (useState, useEffect)
 *    - Vue's reactivity system
 *    - Redux and other state containers
 *    - DOM event systems
 * 
 * 7. Advanced Features:
 *    - Event sourcing for debugging
 *    - Time-travel debugging capabilities
 *    - Performance monitoring and metrics
 *    - Automatic memory cleanup
 */