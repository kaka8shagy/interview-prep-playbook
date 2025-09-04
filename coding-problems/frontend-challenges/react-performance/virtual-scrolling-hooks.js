/**
 * File: virtual-scrolling-hooks.js
 * 
 * Challenge: Implement React-based virtual scrolling using modern hooks:
 * - Custom hooks for fixed and variable size lists
 * - React performance optimizations (useMemo, useCallback, useRef)
 * - Proper React lifecycle management with useEffect
 * - Integration with React's reconciliation and rendering
 * - TypeScript-style prop interfaces and component patterns
 * 
 * Interview Focus:
 * - React performance optimization techniques
 * - Custom hook design patterns and reusability
 * - Memory management in React applications  
 * - Event handling and cleanup in React
 * - Advanced React patterns and best practices
 * 
 * Companies: Facebook, Airbnb, Netflix, Uber (React-heavy applications)
 * Difficulty: Hard
 */

// Note: This file demonstrates React patterns but uses plain JavaScript
// In a real React environment, you'd import React and use JSX syntax

/**
 * APPROACH 1: Basic Fixed-Size Virtual Scrolling Hook
 * 
 * Simple React hook for virtual scrolling with fixed item heights.
 * Focuses on React-specific optimizations and patterns.
 * 
 * Time: O(visible items) for rendering
 * Space: O(visible items) for React elements
 */
function useFixedSizeList({ 
  items, 
  itemHeight = 50, 
  containerHeight = 400,
  buffer = 5 
}) {
  // React hooks for state management
  // In real React: const [scrollTop, setScrollTop] = useState(0);
  const state = {
    scrollTop: 0,
    setScrollTop: (value) => { state.scrollTop = value; },
    
    // Ref to container element for direct DOM access
    containerRef: null, // In real React: useRef(null)
    
    // Memoized calculations to prevent unnecessary re-renders
    totalHeight: items.length * itemHeight,
    visibleItemCount: Math.ceil(containerHeight / itemHeight)
  };

  /**
   * Calculate visible items range with React optimization patterns
   * This would be wrapped in useMemo in real React for performance
   */
  const calculateVisibleItems = () => {
    const startIndex = Math.floor(state.scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + state.visibleItemCount
    );
    
    // Add buffer items for smooth scrolling
    const bufferedStart = Math.max(0, startIndex - buffer);
    const bufferedEnd = Math.min(items.length - 1, endIndex + buffer);
    
    const visibleItems = [];
    for (let i = bufferedStart; i <= bufferedEnd; i++) {
      visibleItems.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          // React-specific optimizations
          willChange: 'transform', // Optimize for animations
          contain: 'layout style paint', // CSS containment
        }
      });
    }
    
    return visibleItems;
  };

  /**
   * Optimized scroll handler with React patterns
   * Would use useCallback in real React to prevent re-renders
   */
  const handleScroll = (event) => {
    const newScrollTop = event.target.scrollTop;
    
    // Only update state if scroll position actually changed
    // Prevents unnecessary re-renders
    if (Math.abs(newScrollTop - state.scrollTop) > 1) {
      state.setScrollTop(newScrollTop);
    }
  };

  /**
   * Programmatic scrolling function
   * Integrates with React's ref system
   */
  const scrollToIndex = (index, behavior = 'smooth') => {
    if (state.containerRef && state.containerRef.current) {
      const scrollTop = index * itemHeight;
      state.containerRef.current.scrollTo({
        top: scrollTop,
        behavior
      });
    }
  };

  /**
   * Scroll to item smoothly with bounds checking
   */
  const scrollToItem = (item, behavior = 'smooth') => {
    const index = items.indexOf(item);
    if (index !== -1) {
      scrollToIndex(index, behavior);
    }
  };

  // Return hook API - this is what components consume
  return {
    // Container props to spread onto the scrolling element
    containerProps: {
      ref: state.containerRef, // React ref for direct DOM access
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        // Performance optimizations
        willChange: 'scroll-position',
        contain: 'strict'
      },
      onScroll: handleScroll, // React event handler
      'aria-label': `Virtual list with ${items.length} items`,
      role: 'listbox',
      tabIndex: 0
    },
    
    // Scrollable area props
    scrollableProps: {
      style: {
        height: state.totalHeight,
        position: 'relative',
        pointerEvents: 'none' // Only items should receive events
      }
    },
    
    // Visible items for rendering
    visibleItems: calculateVisibleItems(),
    
    // Helper functions
    scrollToIndex,
    scrollToItem,
    
    // State for debugging/monitoring
    state: {
      scrollTop: state.scrollTop,
      totalHeight: state.totalHeight,
      visibleCount: state.visibleItemCount
    }
  };
}

/**
 * APPROACH 2: Advanced Variable-Size Virtual Scrolling Hook
 * 
 * Production-ready React hook with dynamic heights:
 * - Height measurement and caching
 * - Advanced React optimizations
 * - ResizeObserver integration
 * - Accessibility enhancements
 * 
 * Time: O(visible items) for rendering, O(log n) for positioning
 * Space: O(n) for height cache + O(visible items) for React elements
 */
function useVariableSizeList({
  items,
  estimatedItemHeight = 50,
  containerHeight = 400,
  buffer = 10,
  getItemHeight = null, // Function to get item height if known
  onItemsRendered = null // Callback for when items are rendered
}) {
  // React state management (would be actual hooks in React)
  const state = {
    scrollTop: 0,
    setScrollTop: (value) => { state.scrollTop = value; },
    
    containerRef: null, // useRef for container
    itemRefs: new Map(), // useRef for each item element
    
    // Height caching system
    itemHeights: new Map(),
    itemPositions: new Map(),
    totalHeight: 0,
    
    // ResizeObserver for dynamic height changes
    resizeObserver: null,
    
    // Performance tracking
    renderCount: 0
  };

  /**
   * Calculate item positions based on cached or estimated heights
   * This would be in a useMemo with dependencies on items and itemHeights
   */
  const calculatePositions = () => {
    let cumulativeHeight = 0;
    
    for (let i = 0; i < items.length; i++) {
      state.itemPositions.set(i, cumulativeHeight);
      
      // Use cached height, getItemHeight function, or estimate
      let itemHeight = state.itemHeights.get(i);
      if (!itemHeight && getItemHeight) {
        itemHeight = getItemHeight(items[i], i);
      }
      if (!itemHeight) {
        itemHeight = estimatedItemHeight;
      }
      
      cumulativeHeight += itemHeight;
    }
    
    state.totalHeight = cumulativeHeight;
  };

  /**
   * Binary search for finding first visible item
   * Optimizes performance for large lists
   */
  const findFirstVisibleIndex = (scrollTop) => {
    let low = 0;
    let high = items.length - 1;
    
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const position = state.itemPositions.get(mid) || 0;
      
      if (position < scrollTop) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    
    return Math.max(0, low - 1);
  };

  /**
   * Calculate visible items with dynamic heights
   * Would be wrapped in useMemo with proper dependencies
   */
  const calculateVisibleItems = () => {
    // Ensure positions are calculated
    calculatePositions();
    
    const startIndex = findFirstVisibleIndex(state.scrollTop);
    const endScrollTop = state.scrollTop + containerHeight;
    
    const visibleItems = [];
    let currentIndex = Math.max(0, startIndex - buffer);
    
    // Add items until we exceed the visible area
    while (currentIndex < items.length) {
      const itemTop = state.itemPositions.get(currentIndex) || 0;
      const itemHeight = state.itemHeights.get(currentIndex) || estimatedItemHeight;
      
      // Stop if well past visible area
      if (itemTop > endScrollTop + buffer * estimatedItemHeight) {
        break;
      }
      
      visibleItems.push({
        index: currentIndex,
        item: items[currentIndex],
        style: {
          position: 'absolute',
          top: itemTop,
          left: 0,
          right: 0,
          minHeight: itemHeight,
          // React-specific optimizations
          willChange: 'transform',
          contain: 'layout style paint',
          pointerEvents: 'auto' // Re-enable events for items
        }
      });
      
      currentIndex++;
    }
    
    return visibleItems;
  };

  /**
   * Measure item height after render
   * This would be called in useLayoutEffect after render
   */
  const measureItem = (index, element) => {
    if (!element) return;
    
    const measuredHeight = element.offsetHeight;
    const cachedHeight = state.itemHeights.get(index);
    
    // Update cache if height changed significantly
    if (!cachedHeight || Math.abs(measuredHeight - cachedHeight) > 1) {
      state.itemHeights.set(index, measuredHeight);
      
      // Trigger recalculation of positions
      // In React, this would trigger a re-render
      calculatePositions();
    }
  };

  /**
   * Ref callback for measuring items
   * React pattern for getting element references
   */
  const getItemRef = (index) => (element) => {
    if (element) {
      state.itemRefs.set(index, element);
      measureItem(index, element);
    } else {
      state.itemRefs.delete(index);
    }
  };

  /**
   * Initialize ResizeObserver for dynamic height changes
   * Would be in useEffect with proper cleanup
   */
  const initializeResizeObserver = () => {
    if (typeof ResizeObserver !== 'undefined') {
      state.resizeObserver = new ResizeObserver((entries) => {
        let needsUpdate = false;
        
        for (const entry of entries) {
          // Find which item this element belongs to
          for (const [index, element] of state.itemRefs) {
            if (element === entry.target) {
              measureItem(index, element);
              needsUpdate = true;
              break;
            }
          }
        }
        
        // In React, this would trigger a re-render
        if (needsUpdate) {
          calculatePositions();
        }
      });
      
      // Observe all current item elements
      for (const element of state.itemRefs.values()) {
        state.resizeObserver.observe(element);
      }
    }
  };

  /**
   * Enhanced scroll handler with performance tracking
   */
  const handleScroll = (event) => {
    const newScrollTop = event.target.scrollTop;
    
    // Throttle updates for performance
    if (Math.abs(newScrollTop - state.scrollTop) > 1) {
      state.setScrollTop(newScrollTop);
      state.renderCount++;
      
      // Call callback if provided
      if (onItemsRendered) {
        const visibleItems = calculateVisibleItems();
        onItemsRendered({
          visibleStartIndex: visibleItems[0]?.index || 0,
          visibleStopIndex: visibleItems[visibleItems.length - 1]?.index || 0,
          totalCount: items.length
        });
      }
    }
  };

  /**
   * Enhanced scroll to index with dynamic heights
   */
  const scrollToIndex = (index, behavior = 'smooth') => {
    if (state.containerRef?.current) {
      calculatePositions(); // Ensure positions are up to date
      const itemPosition = state.itemPositions.get(index) || 0;
      
      state.containerRef.current.scrollTo({
        top: itemPosition,
        behavior
      });
    }
  };

  /**
   * Cleanup function for useEffect
   */
  const cleanup = () => {
    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
      state.resizeObserver = null;
    }
    state.itemRefs.clear();
    state.itemHeights.clear();
    state.itemPositions.clear();
  };

  // Return comprehensive hook API
  return {
    // Container props
    containerProps: {
      ref: state.containerRef,
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        willChange: 'scroll-position',
        contain: 'strict'
      },
      onScroll: handleScroll,
      'aria-label': `Virtual list with ${items.length} items`,
      role: 'listbox',
      tabIndex: 0
    },
    
    // Scrollable area props
    scrollableProps: {
      style: {
        height: state.totalHeight,
        position: 'relative',
        pointerEvents: 'none'
      }
    },
    
    // Visible items with ref callbacks
    visibleItems: calculateVisibleItems().map(item => ({
      ...item,
      ref: getItemRef(item.index) // React ref callback
    })),
    
    // Helper functions
    scrollToIndex,
    scrollToItem: (item, behavior = 'smooth') => {
      const index = items.indexOf(item);
      if (index !== -1) scrollToIndex(index, behavior);
    },
    
    // Hook management
    initialize: initializeResizeObserver,
    cleanup,
    
    // Debug/monitoring data
    state: {
      scrollTop: state.scrollTop,
      totalHeight: state.totalHeight,
      cachedHeights: state.itemHeights.size,
      renderCount: state.renderCount
    }
  };
}

/**
 * APPROACH 3: React Component Examples
 * 
 * Complete React components demonstrating hook usage.
 * Shows integration patterns and best practices.
 */

// Example: FixedSizeList Component
function FixedSizeList({ 
  items, 
  renderItem, 
  itemHeight = 50, 
  height = 400,
  className = '',
  ...props 
}) {
  const virtualList = useFixedSizeList({
    items,
    itemHeight,
    containerHeight: height
  });

  // In real React, this would be JSX:
  // return (
  //   <div {...virtualList.containerProps} className={className} {...props}>
  //     <div {...virtualList.scrollableProps}>
  //       {virtualList.visibleItems.map(({ index, item, style }) => (
  //         <div key={index} style={style}>
  //           {renderItem(item, index)}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  // Simulated React component structure
  return {
    type: 'FixedSizeList',
    props: { ...virtualList.containerProps, className, ...props },
    children: {
      type: 'div',
      props: virtualList.scrollableProps,
      children: virtualList.visibleItems.map(({ index, item, style }) => ({
        type: 'div',
        key: index,
        props: { style },
        children: renderItem(item, index)
      }))
    }
  };
}

// Example: VariableSizeList Component
function VariableSizeList({ 
  items, 
  renderItem, 
  estimatedItemHeight = 50,
  height = 400,
  onItemsRendered,
  className = '',
  ...props 
}) {
  const virtualList = useVariableSizeList({
    items,
    estimatedItemHeight,
    containerHeight: height,
    onItemsRendered
  });

  // Initialize ResizeObserver (would be in useEffect)
  virtualList.initialize();

  // Simulated React component with proper ref handling
  return {
    type: 'VariableSizeList',
    props: { ...virtualList.containerProps, className, ...props },
    children: {
      type: 'div',
      props: virtualList.scrollableProps,
      children: virtualList.visibleItems.map(({ index, item, style, ref }) => ({
        type: 'div',
        key: index,
        props: { style, ref }, // React ref callback
        children: renderItem(item, index)
      }))
    }
  };
}

/**
 * APPROACH 4: Advanced React Patterns and Optimizations
 * 
 * Production patterns for React virtual scrolling:
 * - Memoization strategies
 * - Context integration
 * - Error boundaries
 * - Suspense integration
 */

// Advanced optimization hook
function useVirtualScrollOptimizations({
  items,
  renderItem,
  keyExtractor = (item, index) => index
}) {
  // Memoized item renderer to prevent unnecessary re-renders
  // In React: const memoizedRenderItem = useCallback(renderItem, [dependencies]);
  const memoizedRenderItem = renderItem;
  
  // Memoized key extraction
  const memoizedKeyExtractor = keyExtractor;
  
  // Item comparison for React.memo optimization
  const itemsAreEqual = (prevItems, nextItems) => {
    if (prevItems.length !== nextItems.length) return false;
    
    // Shallow comparison - customize based on data structure
    return prevItems.every((item, index) => 
      item === nextItems[index] || 
      memoizedKeyExtractor(item, index) === memoizedKeyExtractor(nextItems[index], index)
    );
  };
  
  return {
    memoizedRenderItem,
    memoizedKeyExtractor,
    itemsAreEqual
  };
}

// Context for sharing virtual scroll state
const VirtualScrollContext = {
  // In React: createContext({
  scrollToIndex: () => {},
  scrollToItem: () => {},
  visibleRange: { start: 0, end: 0 },
  totalCount: 0
  // });
};

// Error boundary for virtual scroll components
function VirtualScrollErrorBoundary({ children, fallback }) {
  // In React, this would be a class component with componentDidCatch
  // For demonstration, showing the pattern
  return {
    type: 'ErrorBoundary',
    props: {
      onError: (error, errorInfo) => {
        console.error('Virtual scroll error:', error, errorInfo);
      }
    },
    children: children,
    fallback: fallback || 'Something went wrong with the virtual list.'
  };
}

// =============================================================================
// EXAMPLE USAGE AND INTEGRATION PATTERNS
// =============================================================================

/**
 * Example 1: Basic React virtual list usage
 */
function ExampleBasicReactList() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random() * 100
  }));

  const renderItem = (item, index) => ({
    type: 'div',
    props: {
      style: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff'
      }
    },
    children: `${item.name}: ${item.value.toFixed(2)}`
  });

  return FixedSizeList({
    items,
    renderItem,
    itemHeight: 50,
    height: 400
  });
}

/**
 * Example 2: Advanced variable-size list with callbacks
 */
function ExampleAdvancedReactList() {
  const items = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    description: `Description for item ${i} `.repeat(Math.floor(Math.random() * 3) + 1),
    tags: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `tag${j}`)
  }));

  const renderItem = (item, index) => ({
    type: 'div',
    props: {
      style: {
        padding: '15px',
        borderBottom: '1px solid #ddd',
        minHeight: '60px'
      }
    },
    children: [
      {
        type: 'h3',
        props: { style: { margin: '0 0 10px 0' } },
        children: item.title
      },
      {
        type: 'p',
        props: { style: { margin: '0 0 10px 0' } },
        children: item.description
      },
      {
        type: 'div',
        props: { style: { display: 'flex', gap: '5px' } },
        children: item.tags.map(tag => ({
          type: 'span',
          props: {
            style: {
              background: '#007acc',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '12px'
            }
          },
          children: tag
        }))
      }
    ]
  });

  const handleItemsRendered = ({ visibleStartIndex, visibleStopIndex, totalCount }) => {
    console.log(`Rendered items ${visibleStartIndex} to ${visibleStopIndex} of ${totalCount}`);
  };

  return VariableSizeList({
    items,
    renderItem,
    estimatedItemHeight: 80,
    height: 500,
    onItemsRendered: handleItemsRendered
  });
}

/**
 * Example 3: Integration with React patterns
 */
function ExampleReactIntegration() {
  // Simulated React component with state and effects
  const state = {
    items: [],
    loading: false,
    error: null
  };

  // Simulated data fetching effect
  const loadItems = async () => {
    state.loading = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      state.items = Array.from({ length: 20000 }, (_, i) => ({
        id: i,
        name: `API Item ${i}`,
        timestamp: Date.now() + i
      }));
      state.loading = false;
    } catch (error) {
      state.error = error;
      state.loading = false;
    }
  };

  // Optimized render item with memoization
  const { memoizedRenderItem } = useVirtualScrollOptimizations({
    items: state.items,
    renderItem: (item, index) => ({
      type: 'div',
      props: {
        style: {
          padding: '12px',
          borderBottom: '1px solid #eee',
          cursor: 'pointer'
        },
        onClick: () => console.log('Clicked item:', item.id)
      },
      children: `${item.name} - ${new Date(item.timestamp).toLocaleString()}`
    })
  });

  // Loading state
  if (state.loading) {
    return {
      type: 'div',
      props: { style: { padding: '20px', textAlign: 'center' } },
      children: 'Loading items...'
    };
  }

  // Error state
  if (state.error) {
    return {
      type: 'div',
      props: { style: { padding: '20px', color: 'red' } },
      children: `Error: ${state.error.message}`
    };
  }

  // Virtual list with error boundary
  return VirtualScrollErrorBoundary({
    children: FixedSizeList({
      items: state.items,
      renderItem: memoizedRenderItem,
      itemHeight: 44,
      height: 600
    }),
    fallback: 'Failed to render virtual list'
  });
}

// =============================================================================
// REACT-SPECIFIC INTERVIEW QUESTIONS
// =============================================================================

/**
 * React Virtual Scrolling Interview Questions:
 * 
 * Q1: "How do you optimize React re-renders in a virtual scrolling component?"
 * A: useMemo, useCallback, React.memo, proper key props, minimize state updates
 * 
 * Q2: "How do you handle dynamic heights in React virtual scrolling?"
 * A: useLayoutEffect for measuring, ResizeObserver, ref callbacks, height caching
 * 
 * Q3: "What React patterns help with virtual scrolling performance?"
 * A: Custom hooks, context for state sharing, error boundaries, suspense
 * 
 * Q4: "How do you test React virtual scrolling components?"
 * A: React Testing Library, mock scroll events, measure rendered items, snapshot tests
 * 
 * Q5: "How would you integrate virtual scrolling with React Router or state management?"
 * A: URL-based scroll position, Redux/Context integration, navigation preservation
 * 
 * Follow-up Questions:
 * - "How do you handle keyboard navigation in React virtual lists?"
 * - "What about accessibility in React virtual scrolling?"
 * - "How would you implement infinite loading?"
 * - "How do you debug performance issues in React virtual scrolling?"
 * - "What are the trade-offs between different React virtual scrolling libraries?"
 */

// Export React implementations
module.exports = {
  // Hooks
  useFixedSizeList,
  useVariableSizeList,
  useVirtualScrollOptimizations,
  
  // Components
  FixedSizeList,
  VariableSizeList,
  VirtualScrollErrorBoundary,
  
  // Context
  VirtualScrollContext,
  
  // Examples
  ExampleBasicReactList,
  ExampleAdvancedReactList,
  ExampleReactIntegration
};