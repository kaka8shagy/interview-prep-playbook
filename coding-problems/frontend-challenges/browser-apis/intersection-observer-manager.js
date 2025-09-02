/**
 * Intersection Observer Manager - Lazy Loading and Viewport Tracking System
 * 
 * A comprehensive system for efficient viewport-based interactions including:
 * - Lazy loading for images, videos, and components
 * - Infinite scrolling with performance optimization
 * - Element visibility tracking and analytics
 * - Multiple implementation approaches from basic to production-ready
 * 
 * Problem: Efficiently track when elements enter/exit viewport without performance penalties
 * 
 * Key Interview Points:
 * - Understanding browser performance and reflow/repaint cycles
 * - Intersection Observer API vs scroll event listeners
 * - Memory management and cleanup strategies
 * - Handling edge cases (rapidly scrolling, dynamic content)
 * - Performance optimization techniques
 * 
 * Companies: All major tech companies use viewport tracking extensively
 * Frequency: Very High - Critical for modern web performance
 */

// ========================================================================================
// APPROACH 1: BASIC INTERSECTION OBSERVER - Simple lazy loading implementation
// ========================================================================================

/**
 * Basic Intersection Observer wrapper for lazy loading
 * Mental model: Watch elements and trigger callbacks when they become visible
 * 
 * Time Complexity: O(1) for each intersection event
 * Space Complexity: O(n) where n is number of observed elements
 * 
 * Interview considerations:
 * - Why Intersection Observer over scroll listeners? (Performance - no forced reflow)
 * - How does the browser optimize intersection calculations?
 * - What are the limitations of Intersection Observer?
 * - How to handle unsupported browsers?
 */
class BasicIntersectionObserver {
  constructor(options = {}) {
    // Configuration with sensible defaults
    this.config = {
      // Intersection threshold (0 = any pixel visible, 1 = fully visible)
      threshold: options.threshold || [0],
      
      // Root margin - extends the intersection area
      // Useful for pre-loading content before it becomes visible
      rootMargin: options.rootMargin || '50px',
      
      // Root element (null means viewport)
      root: options.root || null,
      
      // Whether to unobserve after first intersection
      once: options.once !== false
    };
    
    // Check browser support
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to scroll events');
      this.fallbackToScrollEvents();
      return;
    }
    
    // Create the intersection observer
    this.observer = new IntersectionObserver(
      this.handleIntersections.bind(this),
      {
        root: this.config.root,
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      }
    );
    
    // Track observed elements and their callbacks
    this.observedElements = new Map();
  }
  
  /**
   * Observe an element for intersection events
   * Core method that starts tracking an element
   */
  observe(element, callback, options = {}) {
    if (!element || typeof callback !== 'function') {
      throw new Error('Element and callback are required');
    }
    
    // Store element metadata for later use
    const elementData = {
      callback,
      options: { ...this.config, ...options },
      intersecting: false,
      intersectionRatio: 0,
      boundingClientRect: null
    };
    
    this.observedElements.set(element, elementData);
    
    // Start observing if we have a valid observer
    if (this.observer) {
      this.observer.observe(element);
    }
    
    // Return unobserve function for convenience
    return () => this.unobserve(element);
  }
  
  /**
   * Stop observing an element
   * Important for memory management and preventing memory leaks
   */
  unobserve(element) {
    if (!element) return;
    
    if (this.observer) {
      this.observer.unobserve(element);
    }
    
    this.observedElements.delete(element);
  }
  
  /**
   * Handle intersection events from the browser
   * This is called whenever visibility changes for observed elements
   */
  handleIntersections(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const elementData = this.observedElements.get(element);
      
      if (!elementData) return; // Element no longer tracked
      
      // Update intersection state
      const wasIntersecting = elementData.intersecting;
      const isIntersecting = entry.isIntersecting;
      
      elementData.intersecting = isIntersecting;
      elementData.intersectionRatio = entry.intersectionRatio;
      elementData.boundingClientRect = entry.boundingClientRect;
      
      // Create detailed intersection data for callback
      const intersectionData = {
        element,
        isIntersecting,
        wasIntersecting,
        intersectionRatio: entry.intersectionRatio,
        boundingClientRect: entry.boundingClientRect,
        rootBounds: entry.rootBounds,
        intersectionRect: entry.intersectionRect,
        time: entry.time
      };
      
      // Call the registered callback
      try {
        elementData.callback(intersectionData);
      } catch (error) {
        console.error('Intersection callback error:', error);
      }
      
      // Auto-unobserve if configured to run once
      if (elementData.options.once && isIntersecting) {
        this.unobserve(element);
      }
    });
  }
  
  /**
   * Disconnect observer and clean up resources
   * Critical for preventing memory leaks in SPAs
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    this.observedElements.clear();
  }
  
  /**
   * Get current intersection state for an element
   * Useful for debugging and state management
   */
  getElementState(element) {
    return this.observedElements.get(element) || null;
  }
  
  /**
   * Fallback implementation for browsers without IntersectionObserver support
   * Uses throttled scroll events - less efficient but functional
   */
  fallbackToScrollEvents() {
    console.log('Using scroll event fallback for intersection detection');
    
    let scrollTimeout;
    const checkIntersections = () => {
      this.observedElements.forEach((elementData, element) => {
        const rect = element.getBoundingClientRect();
        const viewport = {
          top: 0,
          left: 0,
          bottom: window.innerHeight,
          right: window.innerWidth
        };
        
        // Simple intersection check
        const isIntersecting = rect.bottom > viewport.top && 
                              rect.top < viewport.bottom &&
                              rect.right > viewport.left && 
                              rect.left < viewport.right;
        
        if (isIntersecting !== elementData.intersecting) {
          elementData.intersecting = isIntersecting;
          
          // Simulate intersection observer entry
          const mockEntry = {
            element,
            isIntersecting,
            wasIntersecting: !isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
            boundingClientRect: rect,
            time: Date.now()
          };
          
          elementData.callback(mockEntry);
          
          if (elementData.options.once && isIntersecting) {
            this.unobserve(element);
          }
        }
      });
    };
    
    // Throttled scroll handler for performance
    const scrollHandler = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkIntersections, 100);
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', scrollHandler, { passive: true });
    
    // Store cleanup function
    this.fallbackCleanup = () => {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', scrollHandler);
      clearTimeout(scrollTimeout);
    };
  }
}

// ========================================================================================
// APPROACH 2: LAZY LOADING MANAGER - Specialized for image and content loading
// ========================================================================================

/**
 * Specialized lazy loading manager with advanced features
 * Mental model: Queue and prioritize loading based on viewport proximity
 * 
 * Features:
 * - Image lazy loading with placeholder/blur effects
 * - Progressive image loading (low-res to high-res)
 * - Loading priority based on viewport distance
 * - Error handling and retry logic
 * - Performance monitoring
 */
class LazyLoadManager {
  constructor(options = {}) {
    this.config = {
      // Loading strategy
      loadingDistance: options.loadingDistance || 200, // Load 200px before visible
      
      // Image specific options
      placeholderClass: options.placeholderClass || 'lazy-placeholder',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error',
      
      // Progressive loading
      enableProgressiveLoading: options.enableProgressiveLoading || false,
      lowQualityAttribute: options.lowQualityAttribute || 'data-src-low',
      highQualityAttribute: options.highQualityAttribute || 'data-src',
      
      // Performance
      enablePrioritization: options.enablePrioritization !== false,
      maxConcurrentLoads: options.maxConcurrentLoads || 3,
      retryAttempts: options.retryAttempts || 2,
      retryDelay: options.retryDelay || 1000,
      
      // Monitoring
      enableMetrics: options.enableMetrics || false
    };
    
    // Initialize intersection observer with loading distance
    this.intersectionObserver = new BasicIntersectionObserver({
      rootMargin: `${this.config.loadingDistance}px`,
      threshold: [0]
    });
    
    // Loading queue management
    this.loadingQueue = [];
    this.currentlyLoading = new Set();
    this.loadingStats = {
      totalRequested: 0,
      totalLoaded: 0,
      totalErrors: 0,
      averageLoadTime: 0
    };
  }
  
  /**
   * Register elements for lazy loading
   * Automatically detects element type and applies appropriate loading strategy
   */
  observeElement(element, options = {}) {
    if (!element) return;
    
    const elementType = this.detectElementType(element);
    const loadingConfig = { ...this.config, ...options };
    
    // Add loading metadata to element
    element.dataset.lazyType = elementType;
    element.dataset.lazyState = 'pending';
    
    // Apply placeholder styling
    if (elementType === 'image') {
      element.classList.add(this.config.placeholderClass);
    }
    
    // Start observing for intersection
    return this.intersectionObserver.observe(element, (intersectionData) => {
      if (intersectionData.isIntersecting) {
        this.queueForLoading(element, loadingConfig);
      }
    });
  }
  
  /**
   * Detect what type of element we're lazy loading
   * Different elements require different loading strategies
   */
  detectElementType(element) {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'img') return 'image';
    if (tagName === 'video') return 'video';
    if (tagName === 'iframe') return 'iframe';
    if (element.dataset.lazyComponent) return 'component';
    
    return 'content'; // Generic content loading
  }
  
  /**
   * Add element to loading queue with prioritization
   * Manages concurrent loading limits and prioritizes by viewport distance
   */
  queueForLoading(element, config) {
    // Prevent duplicate queuing
    if (element.dataset.lazyState !== 'pending') return;
    
    element.dataset.lazyState = 'queued';
    this.loadingStats.totalRequested++;
    
    const loadingTask = {
      element,
      config,
      priority: this.calculatePriority(element),
      retryCount: 0,
      queuedAt: Date.now()
    };
    
    // Insert into queue based on priority
    if (config.enablePrioritization) {
      this.insertByPriority(loadingTask);
    } else {
      this.loadingQueue.push(loadingTask);
    }
    
    // Process queue if we have capacity
    this.processLoadingQueue();
  }
  
  /**
   * Calculate loading priority based on viewport distance and element importance
   * Elements closer to viewport and marked as important get higher priority
   */
  calculatePriority(element) {
    const rect = element.getBoundingClientRect();
    const viewport = {
      top: 0,
      bottom: window.innerHeight,
      center: window.innerHeight / 2
    };
    
    // Calculate distance from viewport center
    const elementCenter = rect.top + rect.height / 2;
    const distanceFromCenter = Math.abs(viewport.center - elementCenter);
    
    // Base priority on distance (closer = higher priority)
    let priority = 1000 - distanceFromCenter;
    
    // Boost priority for important elements
    if (element.dataset.priority === 'high') {
      priority += 500;
    } else if (element.dataset.priority === 'low') {
      priority -= 200;
    }
    
    // Boost priority for images above the fold
    if (rect.top < viewport.bottom) {
      priority += 300;
    }
    
    return Math.max(0, priority);
  }
  
  /**
   * Insert loading task into queue maintaining priority order
   * Uses binary search for efficient insertion
   */
  insertByPriority(task) {
    let left = 0;
    let right = this.loadingQueue.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.loadingQueue[mid].priority > task.priority) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    this.loadingQueue.splice(left, 0, task);
  }
  
  /**
   * Process the loading queue respecting concurrency limits
   * Manages the actual loading of elements
   */
  async processLoadingQueue() {
    while (this.loadingQueue.length > 0 && 
           this.currentlyLoading.size < this.config.maxConcurrentLoads) {
      
      const task = this.loadingQueue.shift();
      this.currentlyLoading.add(task.element);
      
      // Start loading asynchronously
      this.loadElement(task).finally(() => {
        this.currentlyLoading.delete(task.element);
        // Continue processing queue
        this.processLoadingQueue();
      });
    }
  }
  
  /**
   * Load individual element based on its type
   * Handles different loading strategies for different element types
   */
  async loadElement(task) {
    const { element, config } = task;
    const elementType = element.dataset.lazyType;
    const startTime = Date.now();
    
    element.dataset.lazyState = 'loading';
    
    try {
      switch (elementType) {
        case 'image':
          await this.loadImage(element, config);
          break;
        case 'video':
          await this.loadVideo(element, config);
          break;
        case 'iframe':
          await this.loadIframe(element, config);
          break;
        case 'component':
          await this.loadComponent(element, config);
          break;
        default:
          await this.loadGenericContent(element, config);
      }
      
      // Mark as successfully loaded
      element.dataset.lazyState = 'loaded';
      element.classList.add(config.loadedClass);
      element.classList.remove(config.placeholderClass);
      
      this.loadingStats.totalLoaded++;
      
      // Update performance metrics
      const loadTime = Date.now() - startTime;
      this.updateLoadingMetrics(loadTime);
      
    } catch (error) {
      console.error('Loading failed for element:', element, error);
      
      // Handle retry logic
      if (task.retryCount < config.retryAttempts) {
        task.retryCount++;
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        return this.loadElement(task); // Retry
      }
      
      // Mark as error after all retries exhausted
      element.dataset.lazyState = 'error';
      element.classList.add(config.errorClass);
      this.loadingStats.totalErrors++;
    }
  }
  
  /**
   * Load image with progressive enhancement support
   * Handles low-quality placeholder to high-quality transition
   */
  async loadImage(element, config) {
    const lowQualitySrc = element.dataset[config.lowQualityAttribute.replace('data-', '')];
    const highQualitySrc = element.dataset[config.highQualityAttribute.replace('data-', '')];
    
    if (!highQualitySrc) {
      throw new Error('No high quality image source found');
    }
    
    // Progressive loading: load low quality first if available
    if (config.enableProgressiveLoading && lowQualitySrc) {
      await this.preloadImage(lowQualitySrc);
      element.src = lowQualitySrc;
      element.classList.add('lazy-low-quality');
    }
    
    // Load high quality image
    await this.preloadImage(highQualitySrc);
    element.src = highQualitySrc;
    element.classList.remove('lazy-low-quality');
    
    // Set responsive attributes if available
    if (element.dataset.srcset) {
      element.srcset = element.dataset.srcset;
    }
    if (element.dataset.sizes) {
      element.sizes = element.dataset.sizes;
    }
  }
  
  /**
   * Preload image and return promise that resolves when loaded
   * Used for progressive loading and ensuring images are ready
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      
      img.src = src;
    });
  }
  
  /**
   * Load video element with appropriate attributes
   * Handles video-specific lazy loading considerations
   */
  async loadVideo(element, config) {
    const videoSrc = element.dataset.src;
    if (!videoSrc) {
      throw new Error('No video source found');
    }
    
    element.src = videoSrc;
    
    // Set additional video attributes
    if (element.dataset.poster) {
      element.poster = element.dataset.poster;
    }
    
    // Preload video metadata
    if (element.dataset.preload) {
      element.preload = element.dataset.preload;
    } else {
      element.preload = 'metadata'; // Default to metadata only
    }
  }
  
  /**
   * Load iframe with security considerations
   * Handles iframe lazy loading with proper sandbox attributes
   */
  async loadIframe(element, config) {
    const iframeSrc = element.dataset.src;
    if (!iframeSrc) {
      throw new Error('No iframe source found');
    }
    
    // Validate iframe source for security
    if (!this.isValidIframeSource(iframeSrc)) {
      throw new Error('Invalid iframe source');
    }
    
    element.src = iframeSrc;
    
    // Apply security attributes
    if (!element.hasAttribute('sandbox')) {
      element.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    }
  }
  
  /**
   * Load dynamic component content
   * Handles lazy loading of complex UI components
   */
  async loadComponent(element, config) {
    const componentType = element.dataset.lazyComponent;
    const componentData = element.dataset.componentData;
    
    // This would integrate with your component system
    // Example: React lazy loading, Vue async components, etc.
    
    try {
      // Simulate component loading
      const component = await this.loadComponentByType(componentType, componentData);
      
      // Render component into element
      element.innerHTML = component;
      
    } catch (error) {
      throw new Error(`Failed to load component: ${componentType}`);
    }
  }
  
  /**
   * Generic content loading for elements with data-src
   * Handles text content, HTML fragments, etc.
   */
  async loadGenericContent(element, config) {
    const contentSrc = element.dataset.src;
    if (!contentSrc) return; // No content to load
    
    const response = await fetch(contentSrc);
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }
    
    const content = await response.text();
    element.innerHTML = content;
  }
  
  /**
   * Validate iframe sources for security
   * Prevents loading from malicious domains
   */
  isValidIframeSource(src) {
    try {
      const url = new URL(src);
      
      // Allow list of safe domains
      const safeDomains = [
        'youtube.com',
        'vimeo.com',
        'maps.google.com',
        // Add your trusted domains
      ];
      
      return safeDomains.some(domain => url.hostname.endsWith(domain));
    } catch {
      return false; // Invalid URL
    }
  }
  
  /**
   * Simulate component loading (would integrate with your framework)
   * This is where you'd connect to your component system
   */
  async loadComponentByType(componentType, componentData) {
    // Simulate async component loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const data = componentData ? JSON.parse(componentData) : {};
    
    // Return mock component HTML
    return `<div class="lazy-component ${componentType}">
      <h3>${data.title || 'Lazy Loaded Component'}</h3>
      <p>${data.content || 'This component was loaded when it became visible'}</p>
    </div>`;
  }
  
  /**
   * Update loading performance metrics
   * Tracks loading performance for optimization
   */
  updateLoadingMetrics(loadTime) {
    if (!this.config.enableMetrics) return;
    
    const stats = this.loadingStats;
    stats.averageLoadTime = (stats.averageLoadTime * (stats.totalLoaded - 1) + loadTime) / stats.totalLoaded;
  }
  
  /**
   * Get performance statistics
   * Useful for monitoring and optimization
   */
  getStats() {
    return {
      ...this.loadingStats,
      queueLength: this.loadingQueue.length,
      currentlyLoading: this.currentlyLoading.size,
      successRate: this.loadingStats.totalLoaded / this.loadingStats.totalRequested
    };
  }
  
  /**
   * Clean up resources
   * Important for memory management
   */
  destroy() {
    this.intersectionObserver.disconnect();
    this.loadingQueue = [];
    this.currentlyLoading.clear();
  }
}

// ========================================================================================
// APPROACH 3: INFINITE SCROLL MANAGER - Production-ready infinite scrolling
// ========================================================================================

/**
 * Production-ready infinite scroll implementation
 * Mental model: Maintain virtual window of content with efficient loading/unloading
 * 
 * Features:
 * - Bidirectional infinite scrolling
 * - Virtual scrolling for performance
 * - Buffer management and memory optimization
 * - Loading states and error handling
 * - Accessibility support
 */
class InfiniteScrollManager {
  constructor(options = {}) {
    this.config = {
      // Container and content selectors
      container: options.container || window,
      loadingTriggerDistance: options.loadingTriggerDistance || 300,
      
      // Virtual scrolling
      enableVirtualScrolling: options.enableVirtualScrolling || false,
      itemHeight: options.itemHeight || 'auto',
      bufferSize: options.bufferSize || 10,
      
      // Loading behavior
      initialLoadSize: options.initialLoadSize || 20,
      loadSize: options.loadSize || 10,
      maxRetries: options.maxRetries || 3,
      
      // Performance
      throttleDelay: options.throttleDelay || 100,
      enableMemoryManagement: options.enableMemoryManagement || true,
      maxCachedItems: options.maxCachedItems || 1000,
      
      // Accessibility
      announceNewContent: options.announceNewContent || true,
      
      // Callbacks
      onLoadMore: options.onLoadMore || (() => Promise.resolve([])),
      onError: options.onError || console.error,
      onLoadStart: options.onLoadStart || (() => {}),
      onLoadComplete: options.onLoadComplete || (() => {})
    };
    
    this.state = {
      isLoading: false,
      hasMore: true,
      currentPage: 0,
      totalItems: 0,
      loadedItems: [],
      visibleRange: { start: 0, end: 0 },
      lastScrollTop: 0,
      retryCount: 0
    };
    
    // Initialize intersection observer for loading trigger
    this.setupIntersectionObserver();
    
    // Initialize scroll handling for virtual scrolling
    if (this.config.enableVirtualScrolling) {
      this.setupVirtualScrolling();
    }
    
    // Create loading indicator element
    this.createLoadingIndicator();
  }
  
  /**
   * Set up intersection observer to trigger loading
   * Watches a sentinel element at the bottom of the content
   */
  setupIntersectionObserver() {
    // Create sentinel element that triggers loading
    this.sentinel = document.createElement('div');
    this.sentinel.style.height = '1px';
    this.sentinel.setAttribute('aria-hidden', 'true');
    this.sentinel.className = 'infinite-scroll-sentinel';
    
    this.observer = new BasicIntersectionObserver({
      rootMargin: `${this.config.loadingTriggerDistance}px`,
      threshold: 0
    });
    
    this.observer.observe(this.sentinel, (data) => {
      if (data.isIntersecting && !this.state.isLoading && this.state.hasMore) {
        this.loadMore();
      }
    });
  }
  
  /**
   * Initialize virtual scrolling for performance with large datasets
   * Only renders visible items plus buffer for smooth scrolling
   */
  setupVirtualScrolling() {
    if (this.config.container === window) {
      console.warn('Virtual scrolling works best with a container element');
    }
    
    this.virtualContainer = document.createElement('div');
    this.virtualContainer.style.overflow = 'auto';
    this.virtualContainer.style.height = '100%';
    
    // Throttled scroll handler for virtual scrolling
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.updateVisibleRange();
        this.renderVisibleItems();
      }, this.config.throttleDelay);
    };
    
    this.virtualContainer.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  /**
   * Create loading indicator with accessibility support
   * Shows loading state and provides screen reader announcements
   */
  createLoadingIndicator() {
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'infinite-scroll-loading';
    this.loadingIndicator.setAttribute('role', 'status');
    this.loadingIndicator.setAttribute('aria-live', 'polite');
    this.loadingIndicator.innerHTML = `
      <div class="loading-spinner" aria-hidden="true"></div>
      <span class="loading-text">Loading more content...</span>
    `;
    this.loadingIndicator.style.display = 'none';
  }
  
  /**
   * Initialize infinite scrolling on a container element
   * Sets up the container and loads initial content
   */
  async initialize(container) {
    if (!container) {
      throw new Error('Container element is required');
    }
    
    this.containerElement = container;
    
    // Set up container structure
    this.setupContainerStructure();
    
    // Load initial content
    await this.loadInitialContent();
    
    return this;
  }
  
  /**
   * Set up the DOM structure for infinite scrolling
   * Organizes elements for proper loading and virtual scrolling
   */
  setupContainerStructure() {
    // Create content wrapper
    this.contentWrapper = document.createElement('div');
    this.contentWrapper.className = 'infinite-scroll-content';
    
    if (this.config.enableVirtualScrolling) {
      // Set up virtual scrolling structure
      this.virtualScroller = document.createElement('div');
      this.virtualScroller.style.height = '100%';
      this.virtualScroller.style.overflow = 'auto';
      
      this.contentWrapper.style.position = 'relative';
      this.virtualScroller.appendChild(this.contentWrapper);
      this.containerElement.appendChild(this.virtualScroller);
    } else {
      this.containerElement.appendChild(this.contentWrapper);
    }
    
    // Add loading indicator and sentinel
    this.containerElement.appendChild(this.loadingIndicator);
    this.containerElement.appendChild(this.sentinel);
  }
  
  /**
   * Load initial batch of content
   * Called when infinite scroll is first initialized
   */
  async loadInitialContent() {
    this.state.isLoading = true;
    this.showLoadingIndicator();
    
    try {
      const items = await this.config.onLoadMore(0, this.config.initialLoadSize);
      
      if (items && items.length > 0) {
        this.state.loadedItems = items;
        this.state.totalItems = items.length;
        this.state.currentPage = 1;
        this.renderItems(items);
      } else {
        this.state.hasMore = false;
      }
      
      this.config.onLoadComplete(items);
      
    } catch (error) {
      this.handleLoadingError(error);
    } finally {
      this.state.isLoading = false;
      this.hideLoadingIndicator();
    }
  }
  
  /**
   * Load more content when triggered by intersection observer
   * Handles the core infinite scrolling logic
   */
  async loadMore() {
    if (this.state.isLoading || !this.state.hasMore) {
      return;
    }
    
    this.state.isLoading = true;
    this.showLoadingIndicator();
    this.config.onLoadStart();
    
    try {
      const items = await this.config.onLoadMore(
        this.state.currentPage, 
        this.config.loadSize
      );
      
      if (items && items.length > 0) {
        // Add new items to the collection
        this.state.loadedItems.push(...items);
        this.state.totalItems += items.length;
        this.state.currentPage++;
        this.state.retryCount = 0; // Reset retry count on successful load
        
        // Render new items
        this.renderItems(items, true);
        
        // Announce new content for screen readers
        if (this.config.announceNewContent) {
          this.announceNewContent(items.length);
        }
        
        // Memory management - remove items if we exceed limits
        if (this.config.enableMemoryManagement) {
          this.manageMemory();
        }
        
      } else {
        // No more items to load
        this.state.hasMore = false;
        this.removeSentinel();
      }
      
      this.config.onLoadComplete(items);
      
    } catch (error) {
      this.handleLoadingError(error);
    } finally {
      this.state.isLoading = false;
      this.hideLoadingIndicator();
    }
  }
  
  /**
   * Render items in the content container
   * Handles both normal and virtual rendering modes
   */
  renderItems(items, append = false) {
    if (this.config.enableVirtualScrolling) {
      this.renderVirtualItems();
    } else {
      this.renderNormalItems(items, append);
    }
  }
  
  /**
   * Normal rendering - add all items to DOM
   * Used when virtual scrolling is disabled
   */
  renderNormalItems(items, append) {
    if (!append) {
      this.contentWrapper.innerHTML = '';
    }
    
    const fragment = document.createDocumentFragment();
    
    items.forEach((item, index) => {
      const itemElement = this.createItemElement(item, this.state.totalItems - items.length + index);
      fragment.appendChild(itemElement);
    });
    
    this.contentWrapper.appendChild(fragment);
  }
  
  /**
   * Virtual rendering - only render visible items
   * Significantly improves performance with large datasets
   */
  renderVirtualItems() {
    if (!this.config.enableVirtualScrolling) return;
    
    const { start, end } = this.state.visibleRange;
    const fragment = document.createDocumentFragment();
    
    // Calculate total height for scrollbar
    const totalHeight = this.state.totalItems * this.getItemHeight();
    this.contentWrapper.style.height = `${totalHeight}px`;
    
    // Clear current visible items
    this.contentWrapper.innerHTML = '';
    
    // Render visible items with proper positioning
    for (let i = start; i < end && i < this.state.loadedItems.length; i++) {
      const item = this.state.loadedItems[i];
      const itemElement = this.createItemElement(item, i);
      
      // Position item absolutely for virtual scrolling
      itemElement.style.position = 'absolute';
      itemElement.style.top = `${i * this.getItemHeight()}px`;
      itemElement.style.width = '100%';
      
      fragment.appendChild(itemElement);
    }
    
    this.contentWrapper.appendChild(fragment);
  }
  
  /**
   * Create DOM element for individual item
   * Override this method to customize item rendering
   */
  createItemElement(item, index) {
    const element = document.createElement('div');
    element.className = 'infinite-scroll-item';
    element.setAttribute('data-index', index);
    
    // Basic item rendering - customize based on your data structure
    if (typeof item === 'string') {
      element.textContent = item;
    } else if (item.html) {
      element.innerHTML = item.html;
    } else {
      element.textContent = JSON.stringify(item);
    }
    
    return element;
  }
  
  /**
   * Update visible range for virtual scrolling
   * Calculates which items should be rendered based on scroll position
   */
  updateVisibleRange() {
    if (!this.config.enableVirtualScrolling) return;
    
    const scrollTop = this.virtualScroller.scrollTop;
    const containerHeight = this.virtualScroller.clientHeight;
    const itemHeight = this.getItemHeight();
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - this.config.bufferSize);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(
      this.state.totalItems,
      start + visibleCount + this.config.bufferSize * 2
    );
    
    this.state.visibleRange = { start, end };
  }
  
  /**
   * Get height of individual items for virtual scrolling
   * Supports both fixed and auto-calculated heights
   */
  getItemHeight() {
    if (this.config.itemHeight !== 'auto') {
      return this.config.itemHeight;
    }
    
    // Calculate item height from first rendered item
    const firstItem = this.contentWrapper.querySelector('.infinite-scroll-item');
    return firstItem ? firstItem.offsetHeight : 100; // Default height
  }
  
  /**
   * Manage memory by removing items that are far from viewport
   * Prevents memory leaks with very long lists
   */
  manageMemory() {
    if (this.state.totalItems <= this.config.maxCachedItems) return;
    
    const excessItems = this.state.totalItems - this.config.maxCachedItems;
    
    // Remove items from the beginning (could be made smarter based on scroll position)
    this.state.loadedItems.splice(0, excessItems);
    this.state.totalItems = this.config.maxCachedItems;
    
    // Update visible range if using virtual scrolling
    if (this.config.enableVirtualScrolling) {
      this.updateVisibleRange();
      this.renderVirtualItems();
    }
  }
  
  /**
   * Handle loading errors with retry logic
   * Provides graceful error handling and recovery
   */
  handleLoadingError(error) {
    console.error('Infinite scroll loading error:', error);
    
    if (this.state.retryCount < this.config.maxRetries) {
      this.state.retryCount++;
      
      // Show retry option to user
      this.showRetryOption();
      
    } else {
      // Max retries exceeded
      this.state.hasMore = false;
      this.removeSentinel();
      this.config.onError(error);
    }
  }
  
  /**
   * Show loading indicator with proper accessibility
   */
  showLoadingIndicator() {
    this.loadingIndicator.style.display = 'block';
    this.loadingIndicator.setAttribute('aria-busy', 'true');
  }
  
  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    this.loadingIndicator.style.display = 'none';
    this.loadingIndicator.setAttribute('aria-busy', 'false');
  }
  
  /**
   * Show retry option when loading fails
   * Provides user control over error recovery
   */
  showRetryOption() {
    const retryButton = document.createElement('button');
    retryButton.className = 'infinite-scroll-retry';
    retryButton.textContent = `Retry loading (${this.state.retryCount}/${this.config.maxRetries})`;
    
    retryButton.onclick = () => {
      retryButton.remove();
      this.loadMore();
    };
    
    this.containerElement.appendChild(retryButton);
  }
  
  /**
   * Announce new content to screen readers
   * Improves accessibility for users with assistive technology
   */
  announceNewContent(itemCount) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Screen reader only
    announcement.textContent = `${itemCount} new items loaded`;
    
    document.body.appendChild(announcement);
    
    // Remove announcement after a delay
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  /**
   * Remove sentinel element when no more content
   */
  removeSentinel() {
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
    }
  }
  
  /**
   * Reset infinite scroll state
   * Useful for filtering or refreshing content
   */
  reset() {
    this.state.currentPage = 0;
    this.state.totalItems = 0;
    this.state.loadedItems = [];
    this.state.hasMore = true;
    this.state.retryCount = 0;
    
    this.contentWrapper.innerHTML = '';
    
    // Re-add sentinel
    if (!this.sentinel.parentNode) {
      this.containerElement.appendChild(this.sentinel);
    }
    
    return this.loadInitialContent();
  }
  
  /**
   * Get current state for debugging
   */
  getState() {
    return { ...this.state };
  }
  
  /**
   * Destroy and clean up resources
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
    }
    
    if (this.loadingIndicator && this.loadingIndicator.parentNode) {
      this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
    }
  }
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic lazy loading for images
console.log('=== BASIC INTERSECTION OBSERVER EXAMPLE ===');
if (typeof document !== 'undefined') {
  const basicObserver = new BasicIntersectionObserver({
    threshold: [0, 0.25, 0.5, 0.75, 1.0],
    rootMargin: '20px'
  });
  
  // Simulate observing images
  const mockImage = { tagName: 'IMG', dataset: { src: 'image.jpg' } };
  basicObserver.observe(mockImage, (data) => {
    console.log(`Image intersection: ${data.isIntersecting ? 'visible' : 'hidden'} 
                 (${Math.round(data.intersectionRatio * 100)}% visible)`);
  });
}

// Example 2: Advanced lazy loading with progressive images
console.log('\n=== LAZY LOAD MANAGER EXAMPLE ===');
const lazyLoader = new LazyLoadManager({
  enableProgressiveLoading: true,
  maxConcurrentLoads: 3,
  enableMetrics: true
});

// Simulate lazy loading setup
if (typeof document !== 'undefined') {
  // Mock elements for demonstration
  const mockElements = [
    { tagName: 'IMG', dataset: { src: 'high-res.jpg', srcLow: 'low-res.jpg' } },
    { tagName: 'IFRAME', dataset: { src: 'https://youtube.com/embed/video' } },
    { tagName: 'DIV', dataset: { lazyComponent: 'UserCard', componentData: '{"id": 123}' } }
  ];
  
  mockElements.forEach(element => {
    console.log(`Setting up lazy loading for ${element.tagName}`);
    lazyLoader.observeElement(element);
  });
  
  // Check performance stats
  setTimeout(() => {
    console.log('Lazy loading stats:', lazyLoader.getStats());
  }, 1000);
}

// Example 3: Infinite scroll implementation
console.log('\n=== INFINITE SCROLL MANAGER EXAMPLE ===');
const infiniteScroll = new InfiniteScrollManager({
  loadSize: 10,
  loadingTriggerDistance: 200,
  enableVirtualScrolling: false,
  onLoadMore: async (page, size) => {
    // Simulate API call
    console.log(`Loading page ${page} with ${size} items`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    
    // Generate mock data
    const items = Array.from({ length: size }, (_, index) => ({
      id: page * size + index,
      title: `Item ${page * size + index + 1}`,
      content: `Content for item ${page * size + index + 1}`
    }));
    
    // Simulate end of data
    if (page > 5) return [];
    
    return items;
  },
  onLoadStart: () => console.log('Started loading more items...'),
  onLoadComplete: (items) => console.log(`Loaded ${items.length} new items`),
  onError: (error) => console.error('Infinite scroll error:', error)
});

// Export for use in other modules
module.exports = {
  BasicIntersectionObserver,
  LazyLoadManager,
  InfiniteScrollManager
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. Performance Considerations:
   - Intersection Observer vs scroll events performance
   - Memory management with large datasets
   - Virtual scrolling implementation and benefits
   - Throttling and debouncing strategies
   - Critical rendering path optimization

2. Browser Compatibility:
   - Intersection Observer API support and polyfills
   - Progressive enhancement strategies
   - Fallback implementations for older browsers
   - Feature detection best practices

3. User Experience:
   - Loading states and visual feedback
   - Error handling and retry mechanisms
   - Accessibility considerations (screen readers, keyboard navigation)
   - Progressive loading and perceived performance

4. Security and Reliability:
   - Safe iframe source validation
   - Content security policy considerations
   - Handling network failures gracefully
   - Preventing infinite loading loops

5. Architecture Decisions:
   - Component-based vs utility-based API design
   - State management and data flow
   - Integration with frontend frameworks
   - Testing strategies for async loading behavior

Common Follow-up Questions:
- How would you test intersection observer functionality?
- What are the trade-offs between eager loading and lazy loading?
- How do you handle SEO with lazy-loaded content?
- How would you implement bidirectional infinite scrolling?
- What metrics would you track for lazy loading performance?
- How do you handle lazy loading in server-side rendered applications?
- What are the challenges with lazy loading in mobile environments?
- How would you implement lazy loading for a data table with thousands of rows?
*/