/**
 * File: virtual-scrolling.js
 * 
 * Challenge: Implement a comprehensive vanilla JavaScript virtual scrolling system that handles:
 * - Large list rendering with viewport optimization 
 * - Dynamic item sizing and adaptive height calculation
 * - Smooth scrolling with proper scroll position management
 * - Memory-efficient rendering of only visible items
 * - Performance optimization for thousands of items
 * 
 * Interview Focus:
 * - Understanding browser rendering performance bottlenecks
 * - DOM manipulation optimization techniques
 * - Scroll event handling and throttling strategies
 * - Memory management for large datasets
 * - Pure JavaScript performance patterns
 * 
 * Companies: Facebook, Google, LinkedIn, Twitter (large data rendering)
 * Difficulty: Hard
 */

/**
 * APPROACH 1: Basic Fixed-Height Virtual Scrolling
 * 
 * Simple implementation with fixed item heights.
 * Good for understanding core concepts but limited flexibility.
 * 
 * Time: O(1) for rendering, O(log n) for scroll position calculation
 * Space: O(visible items) instead of O(total items)
 */
class BasicVirtualScroller {
  constructor(options = {}) {
    // Core configuration - affects performance and behavior
    this.itemHeight = options.itemHeight || 50; // Fixed height per item
    this.containerHeight = options.containerHeight || 400; // Viewport height
    this.buffer = options.buffer || 5; // Extra items to render for smooth scrolling
    
    // State management
    this.scrollTop = 0; // Current scroll position
    this.totalItems = 0; // Total number of items in dataset
    this.visibleItems = []; // Currently rendered items
    
    // DOM references
    this.container = null;
    this.scrollableArea = null;
    this.viewport = null;
    
    // Performance optimization
    this.onScroll = this.throttle(this.handleScroll.bind(this), 16); // ~60fps
  }

  /**
   * Initialize the virtual scroller with DOM container
   * Sets up the necessary DOM structure and event listeners
   */
  initialize(container, data, renderItem) {
    this.container = container;
    this.data = data;
    this.totalItems = data.length;
    this.renderItem = renderItem;
    
    // Create DOM structure
    // Outer container manages scrolling
    // Inner viewport renders visible items
    this.container.innerHTML = `
      <div class="virtual-scroller-container" style="
        height: ${this.containerHeight}px;
        overflow-y: auto;
        position: relative;
      ">
        <div class="virtual-scroller-scrollable" style="
          height: ${this.totalItems * this.itemHeight}px;
          position: relative;
        ">
          <div class="virtual-scroller-viewport" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
          "></div>
        </div>
      </div>
    `;
    
    // Get DOM references
    const scrollContainer = this.container.querySelector('.virtual-scroller-container');
    this.scrollableArea = this.container.querySelector('.virtual-scroller-scrollable');
    this.viewport = this.container.querySelector('.virtual-scroller-viewport');
    
    // Attach scroll listener
    scrollContainer.addEventListener('scroll', this.onScroll);
    
    // Initial render
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Calculate which items should be visible based on scroll position
   * This is the core optimization - only render what's needed
   */
  updateVisibleItems() {
    // Calculate the range of items that should be visible
    // We add buffer items above and below for smooth scrolling
    const visibleStart = Math.floor(this.scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      this.totalItems - 1,
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight)
    );
    
    // Add buffer items to prevent blank spaces during fast scrolling
    const startIndex = Math.max(0, visibleStart - this.buffer);
    const endIndex = Math.min(this.totalItems - 1, visibleEnd + this.buffer);
    
    // Create array of items that should be rendered
    this.visibleItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      this.visibleItems.push({
        index: i,
        data: this.data[i],
        top: i * this.itemHeight // Position in virtual space
      });
    }
  }

  /**
   * Render only the visible items to the DOM
   * Key performance optimization - minimal DOM manipulation
   */
  renderVisibleItems() {
    // Clear current viewport content
    this.viewport.innerHTML = '';
    
    // Render each visible item
    this.visibleItems.forEach(item => {
      // Create item container with absolute positioning
      const itemElement = document.createElement('div');
      itemElement.style.cssText = `
        position: absolute;
        top: ${item.top}px;
        left: 0;
        right: 0;
        height: ${this.itemHeight}px;
        box-sizing: border-box;
      `;
      
      // Let the consumer render the item content
      // This provides flexibility for different item types
      const content = this.renderItem(item.data, item.index);
      if (typeof content === 'string') {
        itemElement.innerHTML = content;
      } else {
        itemElement.appendChild(content);
      }
      
      this.viewport.appendChild(itemElement);
    });
  }

  /**
   * Handle scroll events with proper throttling
   * Updates visible items and triggers re-render
   */
  handleScroll(event) {
    // Update scroll position
    this.scrollTop = event.target.scrollTop;
    
    // Recalculate and render visible items
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Throttle function to limit scroll event frequency
   * Essential for maintaining 60fps during scrolling
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Update data and refresh the scroller
   * Handles dynamic data changes
   */
  updateData(newData) {
    this.data = newData;
    this.totalItems = newData.length;
    
    // Update scrollable area height
    this.scrollableArea.style.height = `${this.totalItems * this.itemHeight}px`;
    
    // Re-render with new data
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Scroll to specific item index
   * Useful for programmatic navigation
   */
  scrollToIndex(index) {
    const scrollTop = index * this.itemHeight;
    const scrollContainer = this.container.querySelector('.virtual-scroller-container');
    scrollContainer.scrollTop = scrollTop;
  }
}

/**
 * APPROACH 2: Advanced Virtual Scrolling with Dynamic Heights
 * 
 * Production-ready implementation supporting:
 * - Dynamic item heights with height caching
 * - Smooth scrolling with momentum preservation
 * - Intersection Observer for better performance
 * - Accessibility support
 * 
 * Time: O(visible items) for rendering, O(log n) for binary search
 * Space: O(n) for height cache + O(visible items) for DOM
 */
class AdvancedVirtualScroller {
  constructor(options = {}) {
    // Configuration
    this.containerHeight = options.containerHeight || 400;
    this.buffer = options.buffer || 10; // More buffer for dynamic heights
    this.estimatedItemHeight = options.estimatedItemHeight || 50;
    this.minItemHeight = options.minItemHeight || 20;
    this.maxItemHeight = options.maxItemHeight || 200;
    
    // State management for dynamic heights
    this.itemHeights = new Map(); // Cache actual measured heights
    this.itemPositions = new Map(); // Cache cumulative positions
    this.totalHeight = 0; // Total scrollable height
    
    // Rendering state
    this.scrollTop = 0;
    this.visibleItems = [];
    this.data = [];
    this.renderItem = null;
    
    // Performance optimization
    this.resizeObserver = null;
    this.intersectionObserver = null;
    
    // Bind methods for event handlers
    this.onScroll = this.throttle(this.handleScroll.bind(this), 16);
    this.onResize = this.debounce(this.handleResize.bind(this), 100);
  }

  /**
   * Initialize with enhanced DOM structure and observers
   */
  initialize(container, data, renderItem) {
    this.container = container;
    this.data = data;
    this.renderItem = renderItem;
    
    // Pre-calculate estimated positions for initial render
    this.calculateEstimatedPositions();
    
    // Create enhanced DOM structure with accessibility
    this.container.innerHTML = `
      <div class="advanced-virtual-scroller" 
           role="listbox" 
           aria-label="Virtual scrolling list"
           style="
             height: ${this.containerHeight}px;
             overflow-y: auto;
             position: relative;
             outline: none;
           "
           tabindex="0">
        <div class="virtual-scroller-scrollable" style="
          height: ${this.totalHeight}px;
          position: relative;
        ">
          <div class="virtual-scroller-viewport" style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
          "></div>
        </div>
      </div>
    `;
    
    // Get DOM references
    this.scrollContainer = this.container.querySelector('.advanced-virtual-scroller');
    this.scrollableArea = this.container.querySelector('.virtual-scroller-scrollable');
    this.viewport = this.container.querySelector('.virtual-scroller-viewport');
    
    // Set up event listeners
    this.scrollContainer.addEventListener('scroll', this.onScroll);
    window.addEventListener('resize', this.onResize);
    
    // Initialize observers for better performance
    this.initializeObservers();
    
    // Initial render
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Calculate estimated positions based on average height
   * Used before actual heights are measured
   */
  calculateEstimatedPositions() {
    let cumulativeHeight = 0;
    
    for (let i = 0; i < this.data.length; i++) {
      this.itemPositions.set(i, cumulativeHeight);
      
      // Use cached height if available, otherwise use estimate
      const itemHeight = this.itemHeights.get(i) || this.estimatedItemHeight;
      cumulativeHeight += itemHeight;
    }
    
    this.totalHeight = cumulativeHeight;
  }

  /**
   * Binary search to find first visible item index
   * Optimizes performance for large datasets with dynamic heights
   */
  findFirstVisibleIndex(scrollTop) {
    let low = 0;
    let high = this.data.length - 1;
    
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const position = this.itemPositions.get(mid) || 0;
      
      if (position < scrollTop) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    
    return Math.max(0, low - 1);
  }

  /**
   * Update visible items calculation for dynamic heights
   */
  updateVisibleItems() {
    const startIndex = this.findFirstVisibleIndex(this.scrollTop);
    const endScrollTop = this.scrollTop + this.containerHeight;
    
    this.visibleItems = [];
    let currentIndex = Math.max(0, startIndex - this.buffer);
    
    // Add items until we exceed the visible area
    while (currentIndex < this.data.length) {
      const itemTop = this.itemPositions.get(currentIndex) || 0;
      const itemHeight = this.itemHeights.get(currentIndex) || this.estimatedItemHeight;
      const itemBottom = itemTop + itemHeight;
      
      // Stop if we're well past the visible area
      if (itemTop > endScrollTop + this.buffer * this.estimatedItemHeight) {
        break;
      }
      
      this.visibleItems.push({
        index: currentIndex,
        data: this.data[currentIndex],
        top: itemTop,
        height: itemHeight
      });
      
      currentIndex++;
    }
  }

  /**
   * Enhanced rendering with height measurement and caching
   */
  renderVisibleItems() {
    // Use DocumentFragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    const newElements = new Map();
    
    this.visibleItems.forEach(item => {
      // Create item container
      const itemElement = document.createElement('div');
      itemElement.style.cssText = `
        position: absolute;
        top: ${item.top}px;
        left: 0;
        right: 0;
        min-height: ${this.minItemHeight}px;
        max-height: ${this.maxItemHeight}px;
        box-sizing: border-box;
        overflow: hidden;
      `;
      
      // Add accessibility attributes
      itemElement.setAttribute('role', 'option');
      itemElement.setAttribute('aria-setsize', this.data.length);
      itemElement.setAttribute('aria-posinset', item.index + 1);
      
      // Render item content
      const content = this.renderItem(item.data, item.index);
      if (typeof content === 'string') {
        itemElement.innerHTML = content;
      } else {
        itemElement.appendChild(content);
      }
      
      fragment.appendChild(itemElement);
      newElements.set(item.index, itemElement);
    });
    
    // Replace viewport content efficiently
    this.viewport.innerHTML = '';
    this.viewport.appendChild(fragment);
    
    // Measure actual heights after rendering
    this.measureItemHeights(newElements);
  }

  /**
   * Measure actual item heights and update cache
   * Critical for accurate scrolling with dynamic content
   */
  measureItemHeights(elements) {
    let needsRecalculation = false;
    
    for (const [index, element] of elements) {
      const measuredHeight = element.offsetHeight;
      const cachedHeight = this.itemHeights.get(index);
      
      // Update cache if height changed significantly
      if (!cachedHeight || Math.abs(measuredHeight - cachedHeight) > 1) {
        this.itemHeights.set(index, measuredHeight);
        needsRecalculation = true;
      }
    }
    
    // Recalculate positions if any heights changed
    if (needsRecalculation) {
      this.recalculatePositions();
    }
  }

  /**
   * Recalculate all item positions based on measured heights
   * Ensures accurate scroll position and total height
   */
  recalculatePositions() {
    let cumulativeHeight = 0;
    
    for (let i = 0; i < this.data.length; i++) {
      this.itemPositions.set(i, cumulativeHeight);
      const itemHeight = this.itemHeights.get(i) || this.estimatedItemHeight;
      cumulativeHeight += itemHeight;
    }
    
    this.totalHeight = cumulativeHeight;
    
    // Update scrollable area height
    this.scrollableArea.style.height = `${this.totalHeight}px`;
  }

  /**
   * Initialize observers for performance optimization
   */
  initializeObservers() {
    // ResizeObserver for container size changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === this.container) {
            this.handleContainerResize(entry.contentRect);
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }
    
    // IntersectionObserver for visibility tracking (could be used for lazy loading)
    if (window.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          // Could implement lazy loading or other optimizations here
          this.handleIntersection(entries);
        },
        { root: this.scrollContainer, threshold: 0.1 }
      );
    }
  }

  /**
   * Handle container resize events
   */
  handleContainerResize(rect) {
    this.containerHeight = rect.height;
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Handle intersection changes for potential optimizations
   */
  handleIntersection(entries) {
    // Placeholder for future optimizations like lazy loading images
    // or pausing animations for non-visible items
  }

  /**
   * Enhanced scroll handling with momentum preservation
   */
  handleScroll(event) {
    this.scrollTop = event.target.scrollTop;
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Handle window resize with debouncing
   */
  handleResize() {
    this.updateVisibleItems();
    this.renderVisibleItems();
  }

  /**
   * Debounce utility for resize events
   */
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle utility (same as basic version)
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * Enhanced scroll to index with smooth scrolling
   */
  scrollToIndex(index, behavior = 'smooth') {
    const itemPosition = this.itemPositions.get(index) || 0;
    this.scrollContainer.scrollTo({
      top: itemPosition,
      behavior: behavior
    });
  }

  /**
   * Get item at specific scroll position
   * Useful for maintaining scroll position during data updates
   */
  getItemAtPosition(scrollTop) {
    return this.findFirstVisibleIndex(scrollTop);
  }

  /**
   * Update data with scroll position preservation
   */
  updateData(newData) {
    // Remember current position
    const currentIndex = this.getItemAtPosition(this.scrollTop);
    
    this.data = newData;
    
    // Clear height caches for new data
    this.itemHeights.clear();
    this.itemPositions.clear();
    
    // Recalculate everything
    this.calculateEstimatedPositions();
    this.updateVisibleItems();
    this.renderVisibleItems();
    
    // Try to maintain scroll position
    if (currentIndex < newData.length) {
      this.scrollToIndex(currentIndex, 'auto');
    }
  }

  /**
   * Cleanup method for proper resource management
   */
  destroy() {
    // Remove event listeners
    this.scrollContainer?.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    
    // Cleanup observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    // Clear caches
    this.itemHeights.clear();
    this.itemPositions.clear();
  }
}

// =============================================================================
// EXAMPLE USAGE AND TESTING
// =============================================================================

/**
 * Example 1: Basic virtual scrolling with fixed heights
 */
function exampleBasicVirtualScrolling() {
  // Generate sample data
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
    value: Math.random() * 1000
  }));
  
  // Create scroller instance
  const scroller = new BasicVirtualScroller({
    itemHeight: 60,
    containerHeight: 400,
    buffer: 3
  });
  
  // Item renderer function
  const renderItem = (item, index) => {
    return `
      <div style="
        padding: 10px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <strong>${item.name}</strong>
          <div style="font-size: 12px; color: #666;">${item.description}</div>
        </div>
        <div style="font-weight: bold;">$${item.value.toFixed(2)}</div>
      </div>
    `;
  };
  
  // Initialize with container element
  const container = document.getElementById('basic-virtual-scroll-container');
  if (container) {
    scroller.initialize(container, data, renderItem);
    
    // Example of programmatic scrolling
    setTimeout(() => {
      scroller.scrollToIndex(5000); // Scroll to middle
    }, 2000);
  }
  
  return scroller;
}

/**
 * Example 2: Advanced virtual scrolling with dynamic heights
 */
function exampleAdvancedVirtualScrolling() {
  // Generate data with varying content lengths
  const data = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    title: `Dynamic Item ${i}`,
    content: `This is item ${i} with variable content length. `.repeat(
      Math.floor(Math.random() * 5) + 1
    ),
    tags: Array.from(
      { length: Math.floor(Math.random() * 8) + 1 }, 
      (_, j) => `tag${j}`
    )
  }));
  
  const scroller = new AdvancedVirtualScroller({
    containerHeight: 500,
    estimatedItemHeight: 80,
    minItemHeight: 40,
    maxItemHeight: 200,
    buffer: 8
  });
  
  const renderItem = (item, index) => {
    return `
      <div style="
        padding: 15px;
        border-bottom: 1px solid #ddd;
        background: ${index % 2 === 0 ? '#f9f9f9' : '#fff'};
      ">
        <h3 style="margin: 0 0 10px 0; font-size: 16px;">${item.title}</h3>
        <p style="margin: 0 0 10px 0; line-height: 1.4;">${item.content}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
          ${item.tags.map(tag => 
            `<span style="
              background: #007acc;
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 11px;
            ">${tag}</span>`
          ).join('')}
        </div>
      </div>
    `;
  };
  
  const container = document.getElementById('advanced-virtual-scroll-container');
  if (container) {
    scroller.initialize(container, data, renderItem);
  }
  
  return scroller;
}

/**
 * Example 3: Performance comparison demo
 */
function createPerformanceDemo() {
  const largeDataset = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    name: `Performance Item ${i}`,
    data: Math.random().toString(36).substring(7)
  }));
  
  // Virtual scrolling version
  console.time('Virtual Scroll Setup');
  const virtualScroller = new BasicVirtualScroller({
    itemHeight: 40,
    containerHeight: 300
  });
  
  const renderItem = (item) => `
    <div style="padding: 10px; border-bottom: 1px solid #eee;">
      ${item.name} - ${item.data}
    </div>
  `;
  
  const virtualContainer = document.getElementById('virtual-demo');
  if (virtualContainer) {
    virtualScroller.initialize(virtualContainer, largeDataset, renderItem);
  }
  console.timeEnd('Virtual Scroll Setup');
  
  // Regular DOM version (for comparison - don't actually run with 100k items!)
  console.time('Regular DOM Setup');
  const regularContainer = document.getElementById('regular-demo');
  if (regularContainer && largeDataset.length < 1000) { // Safety limit
    regularContainer.innerHTML = largeDataset.slice(0, 100).map(item =>
      `<div style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name} - ${item.data}
      </div>`
    ).join('');
  }
  console.timeEnd('Regular DOM Setup');
  
  return { virtualScroller, datasetSize: largeDataset.length };
}

// =============================================================================
// INTERVIEW QUESTIONS AND FOLLOW-UPS
// =============================================================================

/**
 * Common Interview Questions:
 * 
 * Q1: "How would you optimize rendering of a list with 100,000 items?"
 * A: Virtual scrolling - only render visible items plus buffer. Show basic implementation.
 * 
 * Q2: "What if the items have different heights?"
 * A: Use dynamic height calculation with binary search for positioning. Show advanced implementation.
 * 
 * Q3: "How do you handle smooth scrolling performance?"
 * A: Throttle scroll events, use requestAnimationFrame, add buffer items, measure heights efficiently.
 * 
 * Q4: "What about accessibility?"
 * A: Add ARIA attributes, keyboard navigation, screen reader support, focus management.
 * 
 * Q5: "How would you integrate this with React?"
 * A: Custom hook approach, useCallback for optimizations, useMemo for calculations.
 * 
 * Follow-up Questions:
 * - "How would you handle horizontal virtual scrolling?"
 * - "What about infinite loading with virtual scrolling?"
 * - "How do you test virtual scrolling components?"
 * - "What are the trade-offs vs pagination?"
 * - "How would you handle search/filtering with virtual scrolling?"
 * 
 * Performance Optimizations to Discuss:
 * - requestAnimationFrame vs setTimeout vs throttling
 * - DocumentFragment for efficient DOM updates
 * - Binary search for dynamic height positioning
 * - Intersection Observer for advanced optimizations
 * - Memory management and cleanup strategies
 */

// Export for testing and real-world usage
module.exports = {
  BasicVirtualScroller,
  AdvancedVirtualScroller,
  
  // Example functions for demonstration
  exampleBasicVirtualScrolling,
  exampleAdvancedVirtualScrolling,
  createPerformanceDemo
};