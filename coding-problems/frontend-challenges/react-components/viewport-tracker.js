/**
 * File: viewport-tracker.js
 * Description: React component for tracking element visibility and viewport positions with intersection observer
 * 
 * Learning objectives:
 * - Master Intersection Observer API for efficient viewport tracking
 * - Implement viewport-based animations and lazy loading
 * - Handle scroll-based UI updates and analytics tracking
 * - Create performant viewport detection systems
 * 
 * Common use cases:
 * - Analytics tracking for element visibility
 * - Scroll-triggered animations and effects
 * - Lazy loading of images and components
 * - Infinite scroll and pagination
 * - Progress indicators based on scroll position
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * APPROACH 1: Basic Viewport Tracker Component
 * Simple implementation using Intersection Observer
 * 
 * Mental model:
 * - Wrap content with viewport detection
 * - Use Intersection Observer for efficient visibility tracking
 * - Provide visibility state to child components or callbacks
 * - Handle observer cleanup on unmount
 * 
 * Time Complexity: O(1) for intersection detection
 * Space Complexity: O(1) per tracked element
 */
function ViewportTracker({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = false,
  onEnter = null,
  onExit = null,
  onVisibilityChange = null,
  className = '',
  as = 'div'
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [intersectionData, setIntersectionData] = useState(null);
  
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  // Create intersection observer
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, assuming element is visible');
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    // Create observer with specified options
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isCurrentlyVisible = entry.isIntersecting;
        
        // Update visibility state
        setIsVisible(isCurrentlyVisible);
        setIntersectionData({
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          rootBounds: entry.rootBounds,
          time: entry.time
        });

        // Track if element has ever been visible
        if (isCurrentlyVisible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }

        // Call appropriate callbacks
        if (isCurrentlyVisible && onEnter) {
          onEnter(entry);
        } else if (!isCurrentlyVisible && onExit) {
          onExit(entry);
        }

        if (onVisibilityChange) {
          onVisibilityChange(isCurrentlyVisible, entry);
        }

        // Stop observing if triggerOnce and element is now visible
        if (triggerOnce && isCurrentlyVisible) {
          observer.unobserve(element);
        }
      },
      {
        threshold: Array.isArray(threshold) ? threshold : [threshold],
        rootMargin
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, onEnter, onExit, onVisibilityChange, hasBeenVisible]);

  // Create element with ref
  const Component = as;
  
  return (
    <Component ref={elementRef} className={className}>
      {typeof children === 'function' 
        ? children({ isVisible, hasBeenVisible, intersectionData })
        : children
      }
    </Component>
  );
}

/**
 * APPROACH 2: Advanced Viewport Tracker with Analytics
 * Enhanced implementation with detailed tracking and analytics
 * 
 * Features:
 * - Detailed visibility metrics and timing
 * - Scroll direction detection
 * - Viewport position calculations
 * - Performance monitoring
 * - Advanced callback system
 */
function AdvancedViewportTracker({
  children,
  threshold = [0, 0.25, 0.5, 0.75, 1.0],
  rootMargin = '0px',
  trackTiming = true,
  trackScrollDirection = true,
  minimumVisibleTime = 0, // Minimum time visible before triggering callbacks
  onVisibilityThreshold = null, // Callback for specific threshold crossings
  onDwellTimeReached = null, // Callback when minimum visible time is reached
  onFirstView = null,
  onViewportData = null, // Callback with detailed viewport data
  analyticsId = null,
  className = '',
  as = 'div'
}) {
  const [viewportState, setViewportState] = useState({
    isVisible: false,
    hasBeenVisible: false,
    intersectionRatio: 0,
    thresholdsCrossed: new Set(),
    visibilityHistory: [],
    totalVisibleTime: 0,
    firstViewTime: null,
    lastVisibleTime: null,
    scrollDirection: null,
    viewportPosition: null
  });

  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const visibilityTimerRef = useRef(null);
  const lastScrollY = useRef(window.pageYOffset);
  const dwellTimeTimerRef = useRef(null);

  // Calculate viewport position relative to screen
  const calculateViewportPosition = useCallback((boundingRect) => {
    const viewportHeight = window.innerHeight;
    const elementHeight = boundingRect.height;
    
    return {
      // Percentage of element visible
      visiblePercentage: Math.max(0, Math.min(100, 
        ((Math.min(boundingRect.bottom, viewportHeight) - Math.max(boundingRect.top, 0)) / elementHeight) * 100
      )),
      // Position relative to viewport (0 = top, 1 = bottom)
      relativePosition: boundingRect.top / (viewportHeight - elementHeight),
      // Distance from viewport center
      distanceFromCenter: Math.abs((boundingRect.top + elementHeight / 2) - viewportHeight / 2),
      // Is element in viewport center area
      isInCenterArea: boundingRect.top < viewportHeight * 0.6 && boundingRect.bottom > viewportHeight * 0.4
    };
  }, []);

  // Track scroll direction
  const updateScrollDirection = useCallback(() => {
    if (!trackScrollDirection) return null;
    
    const currentScrollY = window.pageYOffset;
    const direction = currentScrollY > lastScrollY.current ? 'down' : 
                     currentScrollY < lastScrollY.current ? 'up' : null;
    
    lastScrollY.current = currentScrollY;
    return direction;
  }, [trackScrollDirection]);

  // Main intersection handler
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    const isCurrentlyVisible = entry.isIntersecting;
    const currentTime = trackTiming ? Date.now() : null;
    const scrollDirection = updateScrollDirection();

    // Calculate viewport position
    const viewportPosition = calculateViewportPosition(entry.boundingClientRect);

    // Update threshold tracking
    const thresholdsCrossed = new Set(viewportState.thresholdsCrossed);
    if (Array.isArray(threshold)) {
      threshold.forEach(t => {
        if (entry.intersectionRatio >= t) {
          thresholdsCrossed.add(t);
        }
      });
    }

    // Handle dwell time tracking
    if (isCurrentlyVisible && minimumVisibleTime > 0) {
      if (dwellTimeTimerRef.current) {
        clearTimeout(dwellTimeTimerRef.current);
      }
      
      dwellTimeTimerRef.current = setTimeout(() => {
        if (onDwellTimeReached) {
          onDwellTimeReached(entry, minimumVisibleTime);
        }
      }, minimumVisibleTime);
    } else if (!isCurrentlyVisible && dwellTimeTimerRef.current) {
      clearTimeout(dwellTimeTimerRef.current);
      dwellTimeTimerRef.current = null;
    }

    // Calculate total visible time
    let totalVisibleTime = viewportState.totalVisibleTime;
    if (viewportState.lastVisibleTime && !isCurrentlyVisible) {
      totalVisibleTime += currentTime - viewportState.lastVisibleTime;
    }

    // Update visibility history
    const historyEntry = {
      timestamp: currentTime,
      isVisible: isCurrentlyVisible,
      intersectionRatio: entry.intersectionRatio,
      scrollDirection,
      viewportPosition
    };

    const newState = {
      isVisible: isCurrentlyVisible,
      hasBeenVisible: viewportState.hasBeenVisible || isCurrentlyVisible,
      intersectionRatio: entry.intersectionRatio,
      thresholdsCrossed,
      visibilityHistory: [...viewportState.visibilityHistory.slice(-19), historyEntry], // Keep last 20 entries
      totalVisibleTime,
      firstViewTime: viewportState.firstViewTime || (isCurrentlyVisible ? currentTime : null),
      lastVisibleTime: isCurrentlyVisible ? currentTime : viewportState.lastVisibleTime,
      scrollDirection,
      viewportPosition
    };

    setViewportState(newState);

    // Trigger callbacks
    if (isCurrentlyVisible && !viewportState.hasBeenVisible && onFirstView) {
      onFirstView(entry, newState);
    }

    if (onVisibilityThreshold && Array.isArray(threshold)) {
      threshold.forEach(t => {
        if (entry.intersectionRatio >= t && !viewportState.thresholdsCrossed.has(t)) {
          onVisibilityThreshold(t, entry, newState);
        }
      });
    }

    if (onViewportData) {
      onViewportData(newState, entry);
    }

    // Analytics tracking
    if (analyticsId) {
      if (isCurrentlyVisible && !viewportState.hasBeenVisible) {
        // Track first view
        console.log(`Analytics: ${analyticsId} first viewed`, {
          intersectionRatio: entry.intersectionRatio,
          scrollDirection,
          viewportPosition
        });
      }
    }

  }, [
    viewportState, 
    trackTiming, 
    threshold, 
    minimumVisibleTime, 
    calculateViewportPosition, 
    updateScrollDirection,
    onFirstView,
    onVisibilityThreshold,
    onDwellTimeReached,
    onViewportData,
    analyticsId
  ]);

  // Set up intersection observer
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: Array.isArray(threshold) ? threshold : [threshold],
      rootMargin
    });

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (dwellTimeTimerRef.current) {
        clearTimeout(dwellTimeTimerRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  const Component = as;

  return (
    <Component ref={elementRef} className={className}>
      {typeof children === 'function' 
        ? children(viewportState)
        : children
      }
    </Component>
  );
}

/**
 * APPROACH 3: Multiple Elements Viewport Manager
 * Component for tracking multiple elements simultaneously
 * 
 * Useful for dashboards, galleries, and content feeds where
 * multiple elements need viewport tracking
 */
function ViewportManager({
  children,
  onElementVisible = null,
  onElementHidden = null,
  onAllElementsProcessed = null,
  trackingOptions = {},
  className = ''
}) {
  const [trackedElements, setTrackedElements] = useState(new Map());
  const [visibilityStats, setVisibilityStats] = useState({
    total: 0,
    visible: 0,
    everVisible: 0,
    processingComplete: false
  });

  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());

  // Register element for tracking
  const registerElement = useCallback((id, element, options = {}) => {
    if (!element || elementsRef.current.has(id)) return;

    elementsRef.current.set(id, { element, options });
    
    // Add to observer if it exists
    if (observerRef.current) {
      observerRef.current.observe(element);
    }

    // Initialize tracking data
    setTrackedElements(prev => new Map(prev).set(id, {
      id,
      isVisible: false,
      hasBeenVisible: false,
      intersectionRatio: 0,
      firstViewTime: null,
      totalViewTime: 0,
      viewCount: 0,
      element,
      options
    }));

  }, []);

  // Unregister element
  const unregisterElement = useCallback((id) => {
    const elementData = elementsRef.current.get(id);
    if (elementData && observerRef.current) {
      observerRef.current.unobserve(elementData.element);
    }
    
    elementsRef.current.delete(id);
    setTrackedElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // Handle intersection changes
  const handleIntersections = useCallback((entries) => {
    const updates = new Map();
    
    entries.forEach(entry => {
      // Find the element ID
      let elementId = null;
      for (const [id, data] of elementsRef.current.entries()) {
        if (data.element === entry.target) {
          elementId = id;
          break;
        }
      }
      
      if (!elementId) return;
      
      const currentData = trackedElements.get(elementId);
      if (!currentData) return;

      const isVisible = entry.isIntersecting;
      const wasVisible = currentData.isVisible;
      
      const updatedData = {
        ...currentData,
        isVisible,
        hasBeenVisible: currentData.hasBeenVisible || isVisible,
        intersectionRatio: entry.intersectionRatio,
        firstViewTime: currentData.firstViewTime || (isVisible ? Date.now() : null),
        viewCount: currentData.viewCount + (isVisible && !wasVisible ? 1 : 0)
      };

      updates.set(elementId, updatedData);

      // Trigger callbacks
      if (isVisible && !wasVisible && onElementVisible) {
        onElementVisible(elementId, entry, updatedData);
      } else if (!isVisible && wasVisible && onElementHidden) {
        onElementHidden(elementId, entry, updatedData);
      }
    });

    if (updates.size > 0) {
      setTrackedElements(prev => {
        const newMap = new Map(prev);
        updates.forEach((data, id) => {
          newMap.set(id, data);
        });
        return newMap;
      });
    }
  }, [trackedElements, onElementVisible, onElementHidden]);

  // Set up intersection observer
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }

    const observer = new IntersectionObserver(handleIntersections, {
      threshold: trackingOptions.threshold || [0, 0.5, 1.0],
      rootMargin: trackingOptions.rootMargin || '0px'
    });

    observerRef.current = observer;

    // Observe existing elements
    elementsRef.current.forEach(({ element }) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [handleIntersections, trackingOptions]);

  // Update visibility statistics
  useEffect(() => {
    const elements = Array.from(trackedElements.values());
    const stats = {
      total: elements.length,
      visible: elements.filter(el => el.isVisible).length,
      everVisible: elements.filter(el => el.hasBeenVisible).length,
      processingComplete: elements.length > 0 && elements.every(el => el.hasBeenVisible)
    };

    setVisibilityStats(stats);

    // Trigger completion callback
    if (stats.processingComplete && onAllElementsProcessed) {
      onAllElementsProcessed(elements, stats);
    }
  }, [trackedElements, onAllElementsProcessed]);

  return (
    <div className={`viewport-manager ${className}`}>
      {typeof children === 'function' 
        ? children({ 
            registerElement, 
            unregisterElement, 
            trackedElements, 
            visibilityStats 
          })
        : children
      }
    </div>
  );
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Basic visibility tracking
   */
  BasicVisibilityExample: () => {
    return (
      <div className="basic-example">
        <div style={{ height: '100vh', background: '#f0f0f0' }}>
          Scroll down to see the tracked element...
        </div>
        
        <ViewportTracker
          threshold={0.5}
          onEnter={() => console.log('Element entered viewport!')}
          onExit={() => console.log('Element left viewport!')}
          className="tracked-element"
        >
          {({ isVisible, hasBeenVisible }) => (
            <div style={{ 
              padding: '50px', 
              background: isVisible ? 'green' : 'red',
              color: 'white',
              textAlign: 'center'
            }}>
              <h3>Tracked Element</h3>
              <p>Visible: {isVisible ? 'Yes' : 'No'}</p>
              <p>Ever Visible: {hasBeenVisible ? 'Yes' : 'No'}</p>
            </div>
          )}
        </ViewportTracker>
      </div>
    );
  },

  /**
   * Advanced analytics tracking
   */
  AnalyticsTrackingExample: () => {
    return (
      <div className="analytics-example">
        <div style={{ height: '50vh' }}>Scroll to track analytics...</div>
        
        <AdvancedViewportTracker
          threshold={[0.1, 0.5, 0.9]}
          trackTiming={true}
          trackScrollDirection={true}
          minimumVisibleTime={2000} // 2 seconds
          analyticsId="hero-banner"
          onFirstView={(entry, state) => {
            console.log('First view tracked:', { 
              element: 'hero-banner',
              scrollDirection: state.scrollDirection,
              timestamp: state.firstViewTime
            });
          }}
          onDwellTimeReached={(entry, time) => {
            console.log(`Element viewed for ${time}ms - trigger conversion tracking`);
          }}
          onVisibilityThreshold={(threshold, entry, state) => {
            console.log(`${Math.round(threshold * 100)}% of element visible`);
          }}
        >
          {(state) => (
            <div style={{ 
              padding: '100px', 
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              color: 'white'
            }}>
              <h2>Analytics Banner</h2>
              <div style={{ fontSize: '14px', marginTop: '20px' }}>
                <div>Intersection Ratio: {Math.round(state.intersectionRatio * 100)}%</div>
                <div>Scroll Direction: {state.scrollDirection || 'N/A'}</div>
                <div>Total Visible Time: {state.totalVisibleTime}ms</div>
                <div>Thresholds Crossed: {Array.from(state.thresholdsCrossed).join(', ')}</div>
                {state.viewportPosition && (
                  <div>
                    <div>Visible: {Math.round(state.viewportPosition.visiblePercentage)}%</div>
                    <div>In Center: {state.viewportPosition.isInCenterArea ? 'Yes' : 'No'}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AdvancedViewportTracker>
      </div>
    );
  },

  /**
   * Image gallery with lazy loading
   */
  ImageGalleryExample: () => {
    const images = [
      { id: 1, src: 'https://picsum.photos/300/200?random=1', alt: 'Image 1' },
      { id: 2, src: 'https://picsum.photos/300/200?random=2', alt: 'Image 2' },
      { id: 3, src: 'https://picsum.photos/300/200?random=3', alt: 'Image 3' },
      { id: 4, src: 'https://picsum.photos/300/200?random=4', alt: 'Image 4' }
    ];

    return (
      <ViewportManager
        onElementVisible={(id, entry, data) => {
          console.log(`Image ${id} is now visible`);
        }}
        onAllElementsProcessed={(elements, stats) => {
          console.log('All images processed:', stats);
        }}
      >
        {({ registerElement, unregisterElement, visibilityStats }) => (
          <div className="image-gallery">
            <div className="gallery-stats">
              Visible: {visibilityStats.visible}/{visibilityStats.total} images
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {images.map((image) => (
                <ViewportTracker
                  key={image.id}
                  threshold={0.1}
                  triggerOnce={true}
                  onEnter={() => registerElement(image.id, null)}
                >
                  {({ isVisible, hasBeenVisible }) => (
                    <div style={{ 
                      height: '200px', 
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {hasBeenVisible ? (
                        <img 
                          src={image.src} 
                          alt={image.alt}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div>Loading...</div>
                      )}
                    </div>
                  )}
                </ViewportTracker>
              ))}
            </div>
          </div>
        )}
      </ViewportManager>
    );
  }
};

/**
 * Testing utilities for viewport tracking
 */
const TestingUtils = {
  /**
   * Mock IntersectionObserver for testing
   */
  mockIntersectionObserver: () => {
    const observe = jest.fn();
    const unobserve = jest.fn();
    const disconnect = jest.fn();
    
    const mockIntersectionObserver = jest.fn().mockImplementation((callback) => {
      const observer = {
        observe,
        unobserve,
        disconnect,
        // Helper to manually trigger intersections
        trigger: (entries) => callback(entries)
      };
      
      return observer;
    });
    
    global.IntersectionObserver = mockIntersectionObserver;
    
    return { 
      observe, 
      unobserve, 
      disconnect, 
      mockIntersectionObserver 
    };
  },

  /**
   * Create mock intersection entry
   */
  createMockEntry: (overrides = {}) => ({
    isIntersecting: false,
    intersectionRatio: 0,
    boundingClientRect: {
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    },
    rootBounds: {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth,
      width: window.innerWidth,
      height: window.innerHeight,
      x: 0,
      y: 0
    },
    target: document.createElement('div'),
    time: performance.now(),
    ...overrides
  }),

  /**
   * Simulate element entering/leaving viewport
   */
  simulateIntersection: (observer, isIntersecting = true, ratio = 1) => {
    const entry = TestingUtils.createMockEntry({
      isIntersecting,
      intersectionRatio: ratio
    });
    
    if (observer.trigger) {
      observer.trigger([entry]);
    }
    
    return entry;
  }
};

// CSS styles for components
const styles = `
  .viewport-tracker {
    position: relative;
  }

  .tracked-element {
    transition: all 0.3s ease;
  }

  .viewport-manager {
    position: relative;
  }

  .image-gallery {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .gallery-stats {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .image-gallery {
      padding: 10px;
    }
    
    .image-gallery [style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
    }
  }
`;

// Export all implementations and utilities
export {
  ViewportTracker,             // Basic viewport tracking
  AdvancedViewportTracker,     // Advanced with analytics
  ViewportManager,             // Multiple element manager
  ExampleUsages,               // Usage examples
  TestingUtils,                // Testing utilities
  styles                       // CSS styles
};

// Default export for most common use case
export default ViewportTracker;