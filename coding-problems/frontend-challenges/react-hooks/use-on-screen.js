/**
 * File: use-on-screen.js
 * Description: React hook for detecting when elements enter/exit viewport using Intersection Observer
 * 
 * Learning objectives:
 * - Master Intersection Observer API for efficient viewport detection
 * - Understand performance optimization in scroll-based interactions
 * - Implement lazy loading and infinite scroll patterns
 * - Handle cleanup and memory management in custom hooks
 * 
 * Common use cases:
 * - Lazy loading images and components
 * - Infinite scroll implementation
 * - Analytics tracking for element visibility
 * - Animation triggers based on scroll position
 * - Progressive content loading
 */

import { useState, useEffect, useRef } from 'react';

/**
 * APPROACH 1: Basic Intersection Observer Hook
 * Simple implementation to detect when an element is visible
 * 
 * Mental model:
 * - Use Intersection Observer API for efficient viewport detection
 * - Track visibility state and provide boolean result
 * - Handle observer creation and cleanup automatically
 * - Support basic threshold and root margin options
 * 
 * Time Complexity: O(1) for observation setup
 * Space Complexity: O(1) per observed element
 */
function useOnScreen(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef();

  const {
    // Threshold for triggering visibility (0-1)
    threshold = 0.1,
    // Root margin for expanding/shrinking root bounds
    rootMargin = '0px',
    // Root element for intersection (null = viewport)
    root = null,
    // Only trigger once when element becomes visible
    triggerOnce = false,
    // Disable the observer (useful for conditional observation)
    disabled = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    
    // Don't create observer if disabled or element doesn't exist
    if (disabled || !element) return;

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer not supported');
      // Fallback: assume element is visible
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    // Create intersection observer with specified options
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyVisible = entry.isIntersecting;
        
        // Update visibility state
        setIsVisible(isCurrentlyVisible);
        
        // Track if element has ever been visible
        if (isCurrentlyVisible && !hasBeenVisible) {
          setHasBeenVisible(true);
          
          // If triggerOnce is true, stop observing after first visibility
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    // Start observing the element
    observer.observe(element);

    // Cleanup function to disconnect observer
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, triggerOnce, disabled, hasBeenVisible]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible
  };
}

/**
 * APPROACH 2: Advanced Intersection Observer Hook
 * Enhanced implementation with detailed intersection information
 * 
 * Features:
 * - Multiple threshold support
 * - Intersection ratio tracking
 * - Entry/exit timing
 * - Bounding rectangle information
 * - Multiple elements support
 */
function useOnScreenAdvanced(options = {}) {
  const [intersectionData, setIntersectionData] = useState({
    isVisible: false,
    hasBeenVisible: false,
    intersectionRatio: 0,
    boundingClientRect: null,
    rootBounds: null,
    time: null,
    visibilityChanges: 0
  });
  
  const elementRef = useRef();
  const observerRef = useRef();
  const visibilityHistoryRef = useRef([]);

  const {
    threshold = [0, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
    disabled = false,
    // Callback for custom handling of intersection changes
    onIntersect = null,
    // Track detailed timing information
    trackTiming = false,
    // Store visibility history
    keepHistory = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    
    if (disabled || !element) {
      // Reset state when disabled
      if (disabled) {
        setIntersectionData(prev => ({
          ...prev,
          isVisible: false
        }));
      }
      return;
    }

    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer not supported');
      setIntersectionData(prev => ({
        ...prev,
        isVisible: true,
        hasBeenVisible: true,
        intersectionRatio: 1
      }));
      return;
    }

    // Create enhanced intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]; // We're observing single element
        const isCurrentlyVisible = entry.isIntersecting;
        const currentTime = entry.time;
        
        // Create intersection data object
        const newData = {
          isVisible: isCurrentlyVisible,
          hasBeenVisible: intersectionData.hasBeenVisible || isCurrentlyVisible,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          rootBounds: entry.rootBounds,
          time: trackTiming ? currentTime : null,
          visibilityChanges: intersectionData.visibilityChanges + 1
        };

        // Store visibility history if requested
        if (keepHistory) {
          visibilityHistoryRef.current.push({
            timestamp: Date.now(),
            isVisible: isCurrentlyVisible,
            intersectionRatio: entry.intersectionRatio,
            ...( trackTiming && { performanceTime: currentTime })
          });
          
          // Limit history to prevent memory leaks (keep last 100 entries)
          if (visibilityHistoryRef.current.length > 100) {
            visibilityHistoryRef.current = visibilityHistoryRef.current.slice(-100);
          }
        }

        // Update state
        setIntersectionData(newData);

        // Call custom intersection handler if provided
        if (onIntersect) {
          onIntersect(entry, {
            ...newData,
            history: keepHistory ? [...visibilityHistoryRef.current] : null
          });
        }

        // Stop observing if triggerOnce and now visible
        if (triggerOnce && isCurrentlyVisible) {
          observer.unobserve(element);
        }
      },
      {
        threshold: Array.isArray(threshold) ? threshold : [threshold],
        rootMargin,
        root
      }
    );

    // Store observer reference for potential external access
    observerRef.current = observer;

    // Start observing
    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [
    threshold, 
    rootMargin, 
    root, 
    triggerOnce, 
    disabled, 
    onIntersect, 
    trackTiming, 
    keepHistory,
    intersectionData.hasBeenVisible,
    intersectionData.visibilityChanges
  ]);

  // Utility methods for additional functionality
  const utilities = {
    // Get current visibility history
    getHistory: () => keepHistory ? [...visibilityHistoryRef.current] : null,
    
    // Clear visibility history
    clearHistory: () => {
      visibilityHistoryRef.current = [];
    },
    
    // Get time spent visible (requires trackTiming)
    getVisibilityDuration: () => {
      if (!trackTiming || !keepHistory) return null;
      
      let totalVisible = 0;
      let lastVisibleStart = null;
      
      visibilityHistoryRef.current.forEach(entry => {
        if (entry.isVisible && !lastVisibleStart) {
          lastVisibleStart = entry.timestamp;
        } else if (!entry.isVisible && lastVisibleStart) {
          totalVisible += entry.timestamp - lastVisibleStart;
          lastVisibleStart = null;
        }
      });
      
      // Add current visible duration if still visible
      if (lastVisibleStart && intersectionData.isVisible) {
        totalVisible += Date.now() - lastVisibleStart;
      }
      
      return totalVisible;
    },
    
    // Force refresh observation (useful for dynamic content)
    refresh: () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
        observerRef.current.observe(elementRef.current);
      }
    }
  };

  return {
    elementRef,
    ...intersectionData,
    ...utilities
  };
}

/**
 * APPROACH 3: Multiple Elements Intersection Hook
 * Hook for observing multiple elements simultaneously
 * 
 * Useful for components that need to track multiple child elements
 * like image galleries, product lists, or article feeds
 */
function useMultipleOnScreen(options = {}) {
  const [elementsData, setElementsData] = useState(new Map());
  const observerRef = useRef();
  const elementsRef = useRef(new Map());

  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
    disabled = false
  } = options;

  // Function to add element to observation
  const addElement = (key, element) => {
    if (!element || disabled) return;
    
    elementsRef.current.set(key, element);
    
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
    
    // Initialize data for this element
    setElementsData(prev => new Map(prev).set(key, {
      isVisible: false,
      hasBeenVisible: false,
      intersectionRatio: 0
    }));
  };

  // Function to remove element from observation
  const removeElement = (key) => {
    const element = elementsRef.current.get(key);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
    
    elementsRef.current.delete(key);
    setElementsData(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  useEffect(() => {
    if (disabled) return;

    if (!('IntersectionObserver' in window)) {
      console.warn('Intersection Observer not supported');
      return;
    }

    // Create observer for multiple elements
    const observer = new IntersectionObserver(
      (entries) => {
        const updates = new Map();
        
        entries.forEach(entry => {
          // Find the key for this element
          let elementKey = null;
          for (const [key, element] of elementsRef.current.entries()) {
            if (element === entry.target) {
              elementKey = key;
              break;
            }
          }
          
          if (elementKey !== null) {
            const isVisible = entry.isIntersecting;
            const currentData = elementsData.get(elementKey) || {};
            
            updates.set(elementKey, {
              isVisible,
              hasBeenVisible: currentData.hasBeenVisible || isVisible,
              intersectionRatio: entry.intersectionRatio,
              boundingClientRect: entry.boundingClientRect
            });
          }
        });
        
        if (updates.size > 0) {
          setElementsData(prev => {
            const newMap = new Map(prev);
            updates.forEach((data, key) => {
              newMap.set(key, data);
            });
            return newMap;
          });
        }
      },
      {
        threshold: Array.isArray(threshold) ? threshold : [threshold],
        rootMargin,
        root
      }
    );

    observerRef.current = observer;

    // Observe existing elements
    elementsRef.current.forEach(element => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [threshold, rootMargin, root, disabled]);

  return {
    addElement,
    removeElement,
    elementsData,
    // Get data for specific element
    getElementData: (key) => elementsData.get(key) || null,
    // Get all visible elements
    getVisibleElements: () => {
      const visible = [];
      elementsData.forEach((data, key) => {
        if (data.isVisible) visible.push(key);
      });
      return visible;
    },
    // Get visibility statistics
    getStats: () => ({
      total: elementsData.size,
      visible: Array.from(elementsData.values()).filter(data => data.isVisible).length,
      everVisible: Array.from(elementsData.values()).filter(data => data.hasBeenVisible).length
    })
  };
}

// Example usage patterns for common scenarios
const ExampleUsages = {
  /**
   * Lazy loading image component
   */
  LazyImage: ({ src, alt, placeholder, ...props }) => {
    const { elementRef, isVisible, hasBeenVisible } = useOnScreen({
      threshold: 0.1,
      triggerOnce: true // Only load once
    });
    
    return (
      <div ref={elementRef} {...props}>
        {hasBeenVisible ? (
          <img src={src} alt={alt} />
        ) : (
          <div className="placeholder">{placeholder || 'Loading...'}</div>
        )}
      </div>
    );
  },

  /**
   * Infinite scroll component
   */
  InfiniteScrollTrigger: ({ onLoadMore, threshold = 200 }) => {
    const { elementRef, isVisible } = useOnScreen({
      rootMargin: `${threshold}px`,
      threshold: 0
    });
    
    useEffect(() => {
      if (isVisible) {
        onLoadMore();
      }
    }, [isVisible, onLoadMore]);
    
    return <div ref={elementRef} className="scroll-trigger" />;
  },

  /**
   * Analytics tracking component
   */
  ViewTracking: ({ children, eventName, data = {} }) => {
    const { elementRef, isVisible, getVisibilityDuration } = useOnScreenAdvanced({
      threshold: 0.5,
      trackTiming: true,
      keepHistory: true
    });
    
    useEffect(() => {
      if (isVisible) {
        // Track view start
        analytics.track(`${eventName}_start`, data);
      } else if (getVisibilityDuration && getVisibilityDuration() > 1000) {
        // Track meaningful view (>1 second)
        analytics.track(`${eventName}_view`, {
          ...data,
          duration: getVisibilityDuration()
        });
      }
    }, [isVisible]);
    
    return <div ref={elementRef}>{children}</div>;
  },

  /**
   * Fade in animation on scroll
   */
  FadeInOnScroll: ({ children, className = '' }) => {
    const { elementRef, isVisible } = useOnScreen({
      threshold: 0.2,
      triggerOnce: true
    });
    
    return (
      <div 
        ref={elementRef} 
        className={`${className} transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    );
  }
};

// Mock analytics object for examples
const analytics = {
  track: (event, data) => console.log('Analytics:', event, data)
};

/**
 * Testing utilities for intersection observer hooks
 */
const TestingUtils = {
  /**
   * Mock IntersectionObserver for testing environments
   */
  mockIntersectionObserver: () => {
    const observe = jest.fn();
    const unobserve = jest.fn();
    const disconnect = jest.fn();
    
    // Mock constructor
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe,
      unobserve,
      disconnect,
      // Helper to trigger intersection
      trigger: (entries) => callback(entries)
    }));
    
    return { observe, unobserve, disconnect };
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
      height: 100
    },
    rootBounds: {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth,
      width: window.innerWidth,
      height: window.innerHeight
    },
    target: document.createElement('div'),
    time: performance.now(),
    ...overrides
  }),

  /**
   * Simulate element entering viewport
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

// Export all implementations and utilities
export {
  useOnScreen,                 // Basic implementation
  useOnScreenAdvanced,         // Enhanced with detailed data
  useMultipleOnScreen,         // Multiple elements support
  ExampleUsages,               // Common usage patterns
  TestingUtils                 // Testing utilities
};

// Default export for most common use case
export default useOnScreen;