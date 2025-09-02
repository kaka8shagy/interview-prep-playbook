/**
 * ResizeObserver Utilities - Responsive Component Sizing with Performance Optimization
 * 
 * A comprehensive ResizeObserver-based system including:
 * - Responsive component sizing with debounced callbacks
 * - Layout optimization and reflow prevention
 * - Breakpoint-based responsive design utilities
 * - Container query polyfill implementation
 * - Multiple approaches from basic to production-ready
 * 
 * Problem: Efficiently detect and respond to element size changes for responsive design
 * 
 * Key Interview Points:
 * - Understanding ResizeObserver vs window.resize performance differences
 * - Layout thrashing prevention and reflow optimization
 * - Container queries vs media queries for component-based design
 * - Performance implications of frequent resize callbacks
 * - Memory management with element observers
 * 
 * Companies: All companies building responsive UIs need efficient resize handling
 * Frequency: High - Essential for modern responsive web applications
 */

// ========================================================================================
// APPROACH 1: BASIC RESIZE OBSERVER - Simple element size tracking
// ========================================================================================

/**
 * Basic ResizeObserver wrapper with callback management
 * Mental model: Watch element size changes and trigger callbacks efficiently
 * 
 * Time Complexity: O(1) for observation setup, O(n) for callback execution where n is observers
 * Space Complexity: O(n) where n is number of observed elements
 * 
 * Interview considerations:
 * - Why ResizeObserver over window.resize? (Element-specific, no polling, better performance)
 * - How does ResizeObserver work? (Browser-native element size change detection)
 * - What triggers ResizeObserver? (Content box, border box, or device pixel changes)
 * - How to prevent infinite resize loops? (Avoid size changes in resize callbacks)
 */
class BasicResizeObserver {
  constructor(options = {}) {
    this.config = {
      // ResizeObserver options
      box: options.box || 'content-box', // 'content-box', 'border-box', 'device-pixel-content-box'
      
      // Performance options
      debounceDelay: options.debounceDelay || 100,
      enableDebouncing: options.enableDebouncing !== false,
      
      // Callback management
      enableBatching: options.enableBatching !== false,
      maxBatchSize: options.maxBatchSize || 10,
      
      ...options
    };
    
    // Check browser support
    if (!('ResizeObserver' in window)) {
      console.warn('ResizeObserver not supported, falling back to window resize events');
      this.fallbackToWindowResize();
      return;
    }
    
    // Create ResizeObserver instance
    this.observer = new ResizeObserver(entries => {
      if (this.config.enableDebouncing) {
        this.debouncedHandleResize(entries);
      } else {
        this.handleResize(entries);
      }
    });
    
    // Track observed elements and their callbacks
    this.observedElements = new Map();
    this.resizeCallbacks = new Map();
    
    // Debouncing setup
    this.debounceTimer = null;
    this.pendingEntries = [];
    
    // Performance monitoring
    this.performanceMetrics = {
      totalObservations: 0,
      totalCallbacks: 0,
      averageCallbackTime: 0,
      lastResizeTime: 0
    };
  }
  
  /**
   * Start observing an element for size changes
   * Registers element with ResizeObserver and associates callback
   */
  observe(element, callback, options = {}) {
    if (!element || typeof callback !== 'function') {
      throw new Error('Element and callback are required');
    }
    
    // Store element configuration
    const elementConfig = {
      callback,
      options: { ...this.config, ...options },
      lastSize: null,
      observedAt: Date.now()
    };
    
    this.observedElements.set(element, elementConfig);
    
    // Start observing with specified box model
    const observerOptions = {
      box: elementConfig.options.box || this.config.box
    };
    
    this.observer.observe(element, observerOptions);
    this.performanceMetrics.totalObservations++;
    
    // Return unobserve function for cleanup
    return () => this.unobserve(element);
  }
  
  /**
   * Stop observing an element
   * Removes element from observation and cleans up references
   */
  unobserve(element) {
    if (!element) return;
    
    this.observer.unobserve(element);
    this.observedElements.delete(element);
    this.resizeCallbacks.delete(element);
  }
  
  /**
   * Handle resize entries from ResizeObserver
   * Processes size changes and triggers callbacks
   */
  handleResize(entries) {
    const startTime = performance.now();
    
    if (this.config.enableBatching) {
      this.handleBatchedResize(entries);
    } else {
      this.handleIndividualResize(entries);
    }
    
    // Update performance metrics
    const duration = performance.now() - startTime;
    this.updatePerformanceMetrics(duration);
    this.performanceMetrics.lastResizeTime = Date.now();
  }
  
  /**
   * Handle individual resize events immediately
   * Processes each resize entry as it comes
   */
  handleIndividualResize(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const elementConfig = this.observedElements.get(element);
      
      if (!elementConfig) return; // Element no longer observed
      
      // Extract size information based on box model
      const sizeInfo = this.extractSizeInfo(entry);
      
      // Check if size actually changed (prevent duplicate callbacks)
      if (this.hasSizeChanged(elementConfig.lastSize, sizeInfo)) {
        elementConfig.lastSize = sizeInfo;
        
        try {
          elementConfig.callback({
            element,
            ...sizeInfo,
            timestamp: Date.now(),
            entry
          });
          
          this.performanceMetrics.totalCallbacks++;
        } catch (error) {
          console.error('Resize callback error:', error);
        }
      }
    });
  }
  
  /**
   * Handle batched resize events for performance
   * Groups multiple resize events and processes them together
   */
  handleBatchedResize(entries) {
    const batches = this.createBatches(entries, this.config.maxBatchSize);
    
    batches.forEach(batch => {
      const batchData = [];
      
      batch.forEach(entry => {
        const element = entry.target;
        const elementConfig = this.observedElements.get(element);
        
        if (!elementConfig) return;
        
        const sizeInfo = this.extractSizeInfo(entry);
        
        if (this.hasSizeChanged(elementConfig.lastSize, sizeInfo)) {
          elementConfig.lastSize = sizeInfo;
          batchData.push({
            element,
            ...sizeInfo,
            timestamp: Date.now(),
            entry
          });
        }
      });
      
      // Execute callbacks for this batch
      if (batchData.length > 0) {
        this.executeBatchCallbacks(batchData);
      }
    });
  }
  
  /**
   * Create batches from entries for batch processing
   * Divides large entry arrays into manageable batches
   */
  createBatches(entries, batchSize) {
    const batches = [];
    for (let i = 0; i < entries.length; i += batchSize) {
      batches.push(entries.slice(i, i + batchSize));
    }
    return batches;
  }
  
  /**
   * Execute callbacks for batched entries
   * Calls individual callbacks with batch awareness
   */
  executeBatchCallbacks(batchData) {
    batchData.forEach(data => {
      const elementConfig = this.observedElements.get(data.element);
      if (elementConfig) {
        try {
          elementConfig.callback(data);
          this.performanceMetrics.totalCallbacks++;
        } catch (error) {
          console.error('Batched resize callback error:', error);
        }
      }
    });
  }
  
  /**
   * Debounced resize handler to reduce callback frequency
   * Prevents excessive callback execution during rapid resizing
   */
  debouncedHandleResize(entries) {
    // Accumulate entries during debounce period
    this.pendingEntries.push(...entries);
    
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.handleResize([...this.pendingEntries]);
      this.pendingEntries = [];
      this.debounceTimer = null;
    }, this.config.debounceDelay);
  }
  
  /**
   * Extract size information from ResizeObserver entry
   * Normalizes size data based on box model
   */
  extractSizeInfo(entry) {
    const { contentRect, borderBoxSize, contentBoxSize, devicePixelContentBoxSize } = entry;
    
    // Use the most appropriate size based on configuration
    let width, height;
    
    if (this.config.box === 'border-box' && borderBoxSize) {
      // Use border box size if available
      const borderBox = Array.isArray(borderBoxSize) ? borderBoxSize[0] : borderBoxSize;
      width = borderBox.inlineSize;
      height = borderBox.blockSize;
    } else if (this.config.box === 'device-pixel-content-box' && devicePixelContentBoxSize) {
      // Use device pixel content box if available
      const devicePixelBox = Array.isArray(devicePixelContentBoxSize) ? 
        devicePixelContentBoxSize[0] : devicePixelContentBoxSize;
      width = devicePixelBox.inlineSize;
      height = devicePixelBox.blockSize;
    } else if (contentBoxSize) {
      // Use content box size (modern browsers)
      const contentBox = Array.isArray(contentBoxSize) ? contentBoxSize[0] : contentBoxSize;
      width = contentBox.inlineSize;
      height = contentBox.blockSize;
    } else {
      // Fallback to contentRect (older browsers)
      width = contentRect.width;
      height = contentRect.height;
    }
    
    return {
      width,
      height,
      boxModel: this.config.box,
      contentRect: {
        top: contentRect.top,
        left: contentRect.left,
        width: contentRect.width,
        height: contentRect.height
      }
    };
  }
  
  /**
   * Check if size has meaningfully changed
   * Prevents redundant callbacks for identical sizes
   */
  hasSizeChanged(lastSize, currentSize, threshold = 1) {
    if (!lastSize) return true;
    
    const widthChanged = Math.abs(lastSize.width - currentSize.width) >= threshold;
    const heightChanged = Math.abs(lastSize.height - currentSize.height) >= threshold;
    
    return widthChanged || heightChanged;
  }
  
  /**
   * Update performance metrics for monitoring
   * Tracks resize handling performance
   */
  updatePerformanceMetrics(duration) {
    const metrics = this.performanceMetrics;
    metrics.averageCallbackTime = (
      (metrics.averageCallbackTime * metrics.totalCallbacks + duration) / 
      (metrics.totalCallbacks + 1)
    );
  }
  
  /**
   * Get performance statistics
   * Returns metrics for monitoring and optimization
   */
  getPerformanceStats() {
    return {
      ...this.performanceMetrics,
      observedElements: this.observedElements.size,
      pendingEntries: this.pendingEntries.length,
      isDebouncing: !!this.debounceTimer
    };
  }
  
  /**
   * Fallback to window resize events for unsupported browsers
   * Provides basic functionality when ResizeObserver unavailable
   */
  fallbackToWindowResize() {
    console.log('Using window resize fallback');
    
    let resizeTimer;
    
    const handleWindowResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      
      resizeTimer = setTimeout(() => {
        // Check all observed elements manually
        this.observedElements.forEach((config, element) => {
          const rect = element.getBoundingClientRect();
          const sizeInfo = {
            width: rect.width,
            height: rect.height,
            boxModel: 'content-box',
            contentRect: rect
          };
          
          if (this.hasSizeChanged(config.lastSize, sizeInfo)) {
            config.lastSize = sizeInfo;
            
            try {
              config.callback({
                element,
                ...sizeInfo,
                timestamp: Date.now(),
                fallback: true
              });
            } catch (error) {
              console.error('Fallback resize callback error:', error);
            }
          }
        });
      }, this.config.debounceDelay);
    };
    
    window.addEventListener('resize', handleWindowResize, { passive: true });
    
    // Store cleanup function
    this.fallbackCleanup = () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
    
    // Mock observe method for fallback
    this.observe = (element, callback, options = {}) => {
      const elementConfig = {
        callback,
        options: { ...this.config, ...options },
        lastSize: null,
        observedAt: Date.now()
      };
      
      this.observedElements.set(element, elementConfig);
      
      // Initial size check
      const rect = element.getBoundingClientRect();
      elementConfig.lastSize = {
        width: rect.width,
        height: rect.height,
        boxModel: 'content-box',
        contentRect: rect
      };
      
      return () => this.observedElements.delete(element);
    };
  }
  
  /**
   * Disconnect observer and clean up resources
   * Important for preventing memory leaks
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.fallbackCleanup) {
      this.fallbackCleanup();
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.observedElements.clear();
    this.resizeCallbacks.clear();
    this.pendingEntries = [];
  }
}

// ========================================================================================
// APPROACH 2: RESPONSIVE BREAKPOINT MANAGER - Breakpoint-based responsive utilities
// ========================================================================================

/**
 * Responsive breakpoint manager using ResizeObserver
 * Mental model: Component-level responsive design with breakpoint triggers
 * 
 * Features:
 * - Custom breakpoint definitions per element
 * - Breakpoint enter/exit callbacks
 * - CSS class management for responsive states
 * - Container query simulation
 */
class ResponsiveBreakpointManager extends BasicResizeObserver {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Default breakpoints (can be customized per element)
      defaultBreakpoints: options.defaultBreakpoints || {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
      },
      
      // CSS class options
      addBreakpointClasses: options.addBreakpointClasses !== false,
      classPrefix: options.classPrefix || 'bp-',
      
      // Callback options
      enableBreakpointCallbacks: options.enableBreakpointCallbacks !== false,
      
      ...options
    };
    
    // Track current breakpoints for each element
    this.elementBreakpoints = new Map();
  }
  
  /**
   * Observe element with breakpoint-aware resize handling
   * Adds breakpoint detection to standard resize observation
   */
  observeBreakpoints(element, breakpoints, callbacks = {}) {
    // Use default breakpoints if none provided
    const elementBreakpoints = breakpoints || this.config.defaultBreakpoints;
    
    // Validate breakpoints
    this.validateBreakpoints(elementBreakpoints);
    
    // Store breakpoint configuration
    const breakpointConfig = {
      breakpoints: elementBreakpoints,
      callbacks,
      currentBreakpoint: null,
      previousBreakpoint: null
    };
    
    this.elementBreakpoints.set(element, breakpointConfig);
    
    // Start observing with breakpoint-aware callback
    return this.observe(element, (resizeData) => {
      this.handleBreakpointResize(element, resizeData, breakpointConfig);
    });
  }
  
  /**
   * Handle resize with breakpoint detection
   * Determines current breakpoint and triggers appropriate callbacks
   */
  handleBreakpointResize(element, resizeData, breakpointConfig) {
    const { width } = resizeData;
    const { breakpoints, callbacks } = breakpointConfig;
    
    // Determine current breakpoint
    const newBreakpoint = this.determineBreakpoint(width, breakpoints);
    const previousBreakpoint = breakpointConfig.currentBreakpoint;
    
    // Update breakpoint state
    breakpointConfig.previousBreakpoint = previousBreakpoint;
    breakpointConfig.currentBreakpoint = newBreakpoint;
    
    // Handle CSS classes if enabled
    if (this.config.addBreakpointClasses) {
      this.updateBreakpointClasses(element, newBreakpoint, previousBreakpoint);
    }
    
    // Trigger breakpoint-specific callbacks
    if (this.config.enableBreakpointCallbacks && newBreakpoint !== previousBreakpoint) {
      this.triggerBreakpointCallbacks(element, newBreakpoint, previousBreakpoint, 
                                     resizeData, callbacks);
    }
    
    // Always trigger general resize callback if provided
    if (callbacks.onResize) {
      callbacks.onResize({
        ...resizeData,
        breakpoint: newBreakpoint,
        previousBreakpoint,
        breakpointChanged: newBreakpoint !== previousBreakpoint
      });
    }
  }
  
  /**
   * Determine which breakpoint the current width falls into
   * Finds the appropriate breakpoint based on width thresholds
   */
  determineBreakpoint(width, breakpoints) {
    const sortedBreakpoints = Object.entries(breakpoints)
      .sort(([, a], [, b]) => b - a); // Sort descending
    
    for (const [name, threshold] of sortedBreakpoints) {
      if (width >= threshold) {
        return name;
      }
    }
    
    // Fallback to smallest breakpoint
    return sortedBreakpoints[sortedBreakpoints.length - 1][0];
  }
  
  /**
   * Update CSS classes based on current breakpoint
   * Manages responsive CSS classes automatically
   */
  updateBreakpointClasses(element, newBreakpoint, previousBreakpoint) {
    // Remove previous breakpoint class
    if (previousBreakpoint) {
      element.classList.remove(`${this.config.classPrefix}${previousBreakpoint}`);
    }
    
    // Add new breakpoint class
    if (newBreakpoint) {
      element.classList.add(`${this.config.classPrefix}${newBreakpoint}`);
    }
  }
  
  /**
   * Trigger appropriate breakpoint callbacks
   * Calls enter/exit callbacks when breakpoints change
   */
  triggerBreakpointCallbacks(element, newBreakpoint, previousBreakpoint, resizeData, callbacks) {
    const callbackData = {
      element,
      breakpoint: newBreakpoint,
      previousBreakpoint,
      ...resizeData
    };
    
    // Trigger exit callback for previous breakpoint
    if (previousBreakpoint && callbacks.onBreakpointExit) {
      try {
        callbacks.onBreakpointExit({
          ...callbackData,
          exitingBreakpoint: previousBreakpoint
        });
      } catch (error) {
        console.error('Breakpoint exit callback error:', error);
      }
    }
    
    // Trigger enter callback for new breakpoint
    if (newBreakpoint && callbacks.onBreakpointEnter) {
      try {
        callbacks.onBreakpointEnter({
          ...callbackData,
          enteringBreakpoint: newBreakpoint
        });
      } catch (error) {
        console.error('Breakpoint enter callback error:', error);
      }
    }
    
    // Trigger specific breakpoint callback
    const breakpointCallback = callbacks[`on${newBreakpoint.charAt(0).toUpperCase() + 
                                           newBreakpoint.slice(1)}`];
    if (breakpointCallback) {
      try {
        breakpointCallback(callbackData);
      } catch (error) {
        console.error('Specific breakpoint callback error:', error);
      }
    }
  }
  
  /**
   * Validate breakpoint configuration
   * Ensures breakpoints are properly defined
   */
  validateBreakpoints(breakpoints) {
    if (!breakpoints || typeof breakpoints !== 'object') {
      throw new Error('Breakpoints must be an object');
    }
    
    const entries = Object.entries(breakpoints);
    if (entries.length === 0) {
      throw new Error('At least one breakpoint must be defined');
    }
    
    // Check that all values are numbers
    for (const [name, value] of entries) {
      if (typeof value !== 'number' || value < 0) {
        throw new Error(`Breakpoint '${name}' must be a non-negative number`);
      }
    }
    
    return true;
  }
  
  /**
   * Get current breakpoint for an element
   * Returns the active breakpoint name
   */
  getCurrentBreakpoint(element) {
    const config = this.elementBreakpoints.get(element);
    return config ? config.currentBreakpoint : null;
  }
  
  /**
   * Check if element matches specific breakpoint
   * Utility method for conditional logic
   */
  matchesBreakpoint(element, breakpointName) {
    const currentBreakpoint = this.getCurrentBreakpoint(element);
    return currentBreakpoint === breakpointName;
  }
  
  /**
   * Get all breakpoints for debugging
   * Returns breakpoint state for all observed elements
   */
  getAllBreakpoints() {
    const breakpointState = {};
    
    this.elementBreakpoints.forEach((config, element) => {
      const elementKey = element.id || element.className || element.tagName;
      breakpointState[elementKey] = {
        current: config.currentBreakpoint,
        previous: config.previousBreakpoint,
        breakpoints: Object.keys(config.breakpoints)
      };
    });
    
    return breakpointState;
  }
}

// ========================================================================================
// APPROACH 3: CONTAINER QUERY MANAGER - Advanced container-based responsive design
// ========================================================================================

/**
 * Container query manager with advanced responsive features
 * Mental model: Component-centric responsive design with container queries
 * 
 * Features:
 * - Container query polyfill functionality
 * - Aspect ratio tracking and callbacks
 * - Layout shift detection and optimization
 * - Performance-optimized container monitoring
 * - Integration with CSS custom properties
 */
class ContainerQueryManager extends ResponsiveBreakpointManager {
  constructor(options = {}) {
    super(options);
    
    this.config = {
      ...this.config,
      
      // Container query features
      enableContainerQueries: options.enableContainerQueries !== false,
      containerSizeProperty: options.containerSizeProperty || '--container-size',
      
      // Aspect ratio tracking
      enableAspectRatioTracking: options.enableAspectRatioTracking || false,
      aspectRatioThreshold: options.aspectRatioThreshold || 0.1,
      
      // Layout shift detection
      enableLayoutShiftDetection: options.enableLayoutShiftDetection || false,
      layoutShiftThreshold: options.layoutShiftThreshold || 5,
      
      // Performance optimization
      enableIntersectionFiltering: options.enableIntersectionFiltering || false,
      intersectionMargin: options.intersectionMargin || '100px',
      
      ...options
    };
    
    // Container query state
    this.containerStates = new Map();
    this.aspectRatioCallbacks = new Map();
    this.layoutShiftCallbacks = new Map();
    
    // Performance optimization with Intersection Observer
    if (this.config.enableIntersectionFiltering) {
      this.setupIntersectionFiltering();
    }
  }
  
  /**
   * Observe container with advanced container query features
   * Provides comprehensive container-based responsive monitoring
   */
  observeContainer(element, config = {}) {
    const containerConfig = {
      // Container size categories
      sizeCategories: config.sizeCategories || {
        'small': { maxWidth: 400 },
        'medium': { maxWidth: 800, minWidth: 401 },
        'large': { minWidth: 801 }
      },
      
      // Aspect ratio thresholds
      aspectRatios: config.aspectRatios || {
        'portrait': { maxRatio: 0.8 },
        'square': { minRatio: 0.8, maxRatio: 1.2 },
        'landscape': { minRatio: 1.2 }
      },
      
      // Custom properties to update
      customProperties: config.customProperties || {},
      
      // Callbacks
      onSizeChange: config.onSizeChange,
      onAspectRatioChange: config.onAspectRatioChange,
      onLayoutShift: config.onLayoutShift,
      
      // State tracking
      currentSize: null,
      currentAspectRatio: null,
      currentCategory: null,
      previousCategory: null,
      
      ...config
    };
    
    this.containerStates.set(element, containerConfig);
    
    // Start observing with container-aware callback
    return this.observe(element, (resizeData) => {
      this.handleContainerResize(element, resizeData, containerConfig);
    });
  }
  
  /**
   * Handle container resize with advanced features
   * Processes size changes with container query logic
   */
  handleContainerResize(element, resizeData, containerConfig) {
    const { width, height } = resizeData;
    
    // Determine container size category
    const newCategory = this.determineContainerCategory(width, height, 
                                                      containerConfig.sizeCategories);
    const previousCategory = containerConfig.currentCategory;
    
    // Update container state
    containerConfig.previousCategory = previousCategory;
    containerConfig.currentCategory = newCategory;
    containerConfig.currentSize = { width, height };
    
    // Handle container queries (CSS custom properties)
    if (this.config.enableContainerQueries) {
      this.updateContainerProperties(element, width, height, containerConfig);
    }
    
    // Handle aspect ratio changes
    if (this.config.enableAspectRatioTracking) {
      this.handleAspectRatioChange(element, width, height, containerConfig);
    }
    
    // Handle layout shift detection
    if (this.config.enableLayoutShiftDetection) {
      this.detectLayoutShift(element, resizeData, containerConfig);
    }
    
    // Trigger size change callback
    if (containerConfig.onSizeChange) {
      containerConfig.onSizeChange({
        element,
        width,
        height,
        category: newCategory,
        previousCategory,
        categoryChanged: newCategory !== previousCategory,
        ...resizeData
      });
    }
  }
  
  /**
   * Determine container size category based on dimensions
   * Classifies container into predefined size categories
   */
  determineContainerCategory(width, height, sizeCategories) {
    for (const [category, constraints] of Object.entries(sizeCategories)) {
      let matches = true;
      
      if (constraints.minWidth && width < constraints.minWidth) {
        matches = false;
      }
      if (constraints.maxWidth && width > constraints.maxWidth) {
        matches = false;
      }
      if (constraints.minHeight && height < constraints.minHeight) {
        matches = false;
      }
      if (constraints.maxHeight && height > constraints.maxHeight) {
        matches = false;
      }
      
      if (matches) {
        return category;
      }
    }
    
    return 'uncategorized';
  }
  
  /**
   * Update CSS custom properties for container queries
   * Implements container query polyfill via CSS custom properties
   */
  updateContainerProperties(element, width, height, containerConfig) {
    // Set basic size properties
    element.style.setProperty('--container-width', `${width}px`);
    element.style.setProperty('--container-height', `${height}px`);
    element.style.setProperty('--container-aspect-ratio', `${width / height}`);
    
    // Set size category property
    element.style.setProperty('--container-size-category', containerConfig.currentCategory);
    
    // Set custom properties from configuration
    Object.entries(containerConfig.customProperties).forEach(([property, value]) => {
      if (typeof value === 'function') {
        const computedValue = value(width, height, containerConfig.currentCategory);
        element.style.setProperty(property, computedValue);
      } else {
        element.style.setProperty(property, value);
      }
    });
    
    // Add size-based CSS classes for easier styling
    const sizeClasses = Object.keys(containerConfig.sizeCategories);
    sizeClasses.forEach(sizeClass => {
      element.classList.toggle(`container-${sizeClass}`, 
                              sizeClass === containerConfig.currentCategory);
    });
  }
  
  /**
   * Handle aspect ratio changes and callbacks
   * Tracks aspect ratio changes and triggers appropriate callbacks
   */
  handleAspectRatioChange(element, width, height, containerConfig) {
    const currentRatio = width / height;
    const previousRatio = containerConfig.currentAspectRatio;
    
    // Check if aspect ratio changed significantly
    if (previousRatio === null || 
        Math.abs(currentRatio - previousRatio) > this.config.aspectRatioThreshold) {
      
      containerConfig.currentAspectRatio = currentRatio;
      
      // Determine aspect ratio category
      const ratioCategory = this.determineAspectRatioCategory(currentRatio, 
                                                            containerConfig.aspectRatios);
      
      // Update CSS property
      element.style.setProperty('--container-aspect-ratio-category', ratioCategory);
      
      // Trigger callback
      if (containerConfig.onAspectRatioChange) {
        containerConfig.onAspectRatioChange({
          element,
          aspectRatio: currentRatio,
          previousAspectRatio: previousRatio,
          category: ratioCategory,
          width,
          height
        });
      }
    }
  }
  
  /**
   * Determine aspect ratio category
   * Classifies aspect ratio into predefined categories
   */
  determineAspectRatioCategory(ratio, aspectRatios) {
    for (const [category, constraints] of Object.entries(aspectRatios)) {
      let matches = true;
      
      if (constraints.minRatio && ratio < constraints.minRatio) {
        matches = false;
      }
      if (constraints.maxRatio && ratio > constraints.maxRatio) {
        matches = false;
      }
      
      if (matches) {
        return category;
      }
    }
    
    return 'uncategorized';
  }
  
  /**
   * Detect significant layout shifts
   * Monitors for layout changes that might indicate performance issues
   */
  detectLayoutShift(element, resizeData, containerConfig) {
    const { contentRect } = resizeData;
    
    if (containerConfig.lastPosition) {
      const positionShift = Math.abs(contentRect.top - containerConfig.lastPosition.top) +
                           Math.abs(contentRect.left - containerConfig.lastPosition.left);
      
      if (positionShift > this.config.layoutShiftThreshold) {
        const shiftData = {
          element,
          shift: positionShift,
          oldPosition: containerConfig.lastPosition,
          newPosition: { top: contentRect.top, left: contentRect.left },
          timestamp: Date.now()
        };
        
        if (containerConfig.onLayoutShift) {
          containerConfig.onLayoutShift(shiftData);
        }
        
        console.warn('Layout shift detected:', shiftData);
      }
    }
    
    containerConfig.lastPosition = { top: contentRect.top, left: contentRect.left };
  }
  
  /**
   * Set up intersection filtering for performance optimization
   * Only processes resize events for visible elements
   */
  setupIntersectionFiltering() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not available for filtering');
      return;
    }
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        const isVisible = entry.isIntersecting;
        
        // Enable/disable resize processing based on visibility
        const elementConfig = this.observedElements.get(element);
        if (elementConfig) {
          elementConfig.isVisible = isVisible;
        }
      });
    }, {
      rootMargin: this.config.intersectionMargin
    });
    
    // Override observe to include intersection observation
    const originalObserve = this.observe.bind(this);
    this.observe = (element, callback, options = {}) => {
      const unobserveResize = originalObserve(element, callback, options);
      
      // Also observe for intersection
      this.intersectionObserver.observe(element);
      
      return () => {
        unobserveResize();
        this.intersectionObserver.unobserve(element);
      };
    };
  }
  
  /**
   * Get container state for debugging
   * Returns current state for all observed containers
   */
  getContainerStates() {
    const states = {};
    
    this.containerStates.forEach((config, element) => {
      const elementKey = element.id || element.className || element.tagName;
      states[elementKey] = {
        category: config.currentCategory,
        previousCategory: config.previousCategory,
        size: config.currentSize,
        aspectRatio: config.currentAspectRatio,
        isVisible: this.observedElements.get(element)?.isVisible
      };
    });
    
    return states;
  }
  
  /**
   * Enhanced disconnect with intersection observer cleanup
   * Properly cleans up all observers and resources
   */
  disconnect() {
    super.disconnect();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    this.containerStates.clear();
    this.aspectRatioCallbacks.clear();
    this.layoutShiftCallbacks.clear();
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic ResizeObserver usage
console.log('=== BASIC RESIZE OBSERVER EXAMPLE ===');

const basicObserver = new BasicResizeObserver({
  debounceDelay: 150,
  enableBatching: true
});

// Mock element for demonstration
const mockElement = {
  getBoundingClientRect: () => ({ width: 300, height: 200, top: 0, left: 0 })
};

if (typeof document !== 'undefined') {
  const testElement = document.createElement('div');
  testElement.style.width = '300px';
  testElement.style.height = '200px';
  
  const unobserve = basicObserver.observe(testElement, (data) => {
    console.log('Element resized:', {
      width: data.width,
      height: data.height,
      boxModel: data.boxModel
    });
  });
  
  // Cleanup after 5 seconds
  setTimeout(() => {
    unobserve();
    console.log('Performance stats:', basicObserver.getPerformanceStats());
  }, 5000);
}

// Example 2: Responsive breakpoint manager
console.log('\n=== RESPONSIVE BREAKPOINT MANAGER EXAMPLE ===');

const breakpointManager = new ResponsiveBreakpointManager({
  defaultBreakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440
  },
  addBreakpointClasses: true,
  classPrefix: 'size-'
});

// Mock breakpoint observation
if (typeof document !== 'undefined') {
  const responsiveElement = document.createElement('div');
  responsiveElement.id = 'responsive-container';
  
  const unobserveBreakpoints = breakpointManager.observeBreakpoints(responsiveElement, null, {
    onBreakpointEnter: (data) => {
      console.log(`Entered breakpoint: ${data.enteringBreakpoint} at ${data.width}px`);
    },
    
    onBreakpointExit: (data) => {
      console.log(`Exited breakpoint: ${data.exitingBreakpoint}`);
    },
    
    onMobile: (data) => {
      console.log('Mobile breakpoint active');
    },
    
    onDesktop: (data) => {
      console.log('Desktop breakpoint active');
    }
  });
}

// Example 3: Container query manager
console.log('\n=== CONTAINER QUERY MANAGER EXAMPLE ===');

const containerManager = new ContainerQueryManager({
  enableContainerQueries: true,
  enableAspectRatioTracking: true,
  enableLayoutShiftDetection: true
});

if (typeof document !== 'undefined') {
  const containerElement = document.createElement('div');
  containerElement.id = 'container-query-element';
  
  const unobserveContainer = containerManager.observeContainer(containerElement, {
    sizeCategories: {
      'small': { maxWidth: 300 },
      'medium': { maxWidth: 600, minWidth: 301 },
      'large': { minWidth: 601 }
    },
    
    customProperties: {
      '--columns': (width) => width > 600 ? '3' : width > 300 ? '2' : '1',
      '--gap': (width) => width > 600 ? '20px' : '10px'
    },
    
    onSizeChange: (data) => {
      console.log('Container size changed:', {
        category: data.category,
        width: data.width,
        height: data.height,
        categoryChanged: data.categoryChanged
      });
    },
    
    onAspectRatioChange: (data) => {
      console.log('Aspect ratio changed:', {
        ratio: data.aspectRatio.toFixed(2),
        category: data.category
      });
    },
    
    onLayoutShift: (data) => {
      console.warn('Layout shift detected:', data.shift);
    }
  });
  
  // Check container states
  setTimeout(() => {
    console.log('Container states:', containerManager.getContainerStates());
  }, 1000);
}

// Export for use in other modules
module.exports = {
  BasicResizeObserver,
  ResponsiveBreakpointManager,
  ContainerQueryManager
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. ResizeObserver Fundamentals:
   - How ResizeObserver works vs window.resize events
   - Different box models (content-box, border-box, device-pixel-content-box)
   - ResizeObserver entry structure and data extraction
   - Browser support and fallback strategies

2. Performance Considerations:
   - Debouncing vs throttling for resize events
   - Batch processing for multiple resize events
   - Intersection Observer for performance optimization
   - Memory management and cleanup strategies

3. Responsive Design Patterns:
   - Container queries vs media queries
   - Breakpoint-based responsive design
   - Aspect ratio tracking and responsive images
   - Layout shift detection and optimization

4. Implementation Challenges:
   - Preventing infinite resize loops
   - Handling rapid resize events efficiently
   - Cross-browser compatibility issues
   - Integration with CSS frameworks

5. Advanced Features:
   - Custom CSS property updates
   - Component-level responsive design
   - Dynamic breakpoint management
   - Performance monitoring and optimization

6. Production Considerations:
   - Error handling in resize callbacks
   - Testing resize behavior
   - Accessibility considerations
   - Integration with state management

Common Follow-up Questions:
- How do you implement container queries without native browser support?
- What are the performance implications of many ResizeObserver instances?
- How do you handle resize events during CSS transitions?
- What's your approach to testing responsive behavior?
- How do you prevent layout thrashing in resize handlers?
- What metrics would you track for resize performance?
- How do you implement responsive design for complex layouts?
- What are the accessibility considerations for dynamic sizing?
- How do you handle resize events in web components?
- What's your strategy for progressive enhancement with ResizeObserver?
*/