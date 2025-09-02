/**
 * File: use-responsive.js
 * Description: React hook for responsive design with breakpoint detection and media query monitoring
 * 
 * Learning objectives:
 * - Understand responsive design patterns with React hooks
 * - Master media query JavaScript API integration
 * - Implement performant breakpoint detection systems
 * - Handle cleanup and memory management in custom hooks
 * 
 * Common use cases:
 * - Conditional component rendering based on screen size
 * - Dynamic layout adjustments
 * - Performance optimization by device type
 * - Responsive navigation menus
 */

import { useState, useEffect } from 'react';

/**
 * APPROACH 1: Basic Breakpoint Hook
 * Simple implementation that detects common breakpoints
 * 
 * Mental model: 
 * - Define standard breakpoints (mobile, tablet, desktop)
 * - Use window.matchMedia to create MediaQueryList objects
 * - Listen for changes and update state accordingly
 * 
 * Time Complexity: O(1) for each breakpoint check
 * Space Complexity: O(n) where n is number of breakpoints
 */
function useResponsive() {
  // Standard breakpoints following common design systems
  const breakpoints = {
    mobile: '(max-width: 768px)',
    tablet: '(min-width: 769px) and (max-width: 1024px)', 
    desktop: '(min-width: 1025px)',
    // Additional utility breakpoints
    small: '(max-width: 640px)',
    large: '(min-width: 1280px)'
  };

  // State to track current breakpoint matches
  const [matches, setMatches] = useState({});

  useEffect(() => {
    // Create MediaQueryList objects for each breakpoint
    // MediaQueryList provides efficient media query monitoring
    const mediaQueries = {};
    const handlers = {};

    Object.keys(breakpoints).forEach(key => {
      const query = breakpoints[key];
      const mediaQuery = window.matchMedia(query);
      
      // Store reference for cleanup
      mediaQueries[key] = mediaQuery;
      
      // Handler function for this specific breakpoint
      // Using arrow function to maintain proper 'this' context
      handlers[key] = (e) => {
        setMatches(prev => ({
          ...prev,
          [key]: e.matches
        }));
      };

      // Add event listener for changes
      // Modern browsers support addEventListener, fallback to addListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handlers[key]);
      } else {
        // Legacy support for older browsers
        mediaQuery.addListener(handlers[key]);
      }

      // Set initial state by checking current match
      setMatches(prev => ({
        ...prev,
        [key]: mediaQuery.matches
      }));
    });

    // Cleanup function to prevent memory leaks
    return () => {
      Object.keys(breakpoints).forEach(key => {
        const mediaQuery = mediaQueries[key];
        const handler = handlers[key];
        
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handler);
        } else {
          // Legacy cleanup
          mediaQuery.removeListener(handler);
        }
      });
    };
  }, []); // Empty dependency array - run once on mount

  return matches;
}

/**
 * APPROACH 2: Advanced Responsive Hook with Custom Breakpoints
 * More flexible implementation allowing custom breakpoints and additional features
 * 
 * Features:
 * - Custom breakpoint definitions
 * - Orientation detection
 * - Pixel ratio detection for high-DPI displays
 * - Debounced updates for performance
 */
function useAdvancedResponsive(customBreakpoints = {}) {
  // Merge custom breakpoints with defaults
  const defaultBreakpoints = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 991px)',
    lg: '(min-width: 992px) and (max-width: 1199px)',
    xl: '(min-width: 1200px)',
    // Orientation queries
    portrait: '(orientation: portrait)',
    landscape: '(orientation: landscape)',
    // High-DPI detection
    retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx)'
  };
  
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [state, setState] = useState({
    breakpoints: {},
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const mediaQueries = new Map();
    const handlers = new Map();
    let resizeTimeout;

    // Debounced resize handler to improve performance
    // Prevents excessive updates during window resize
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setState(prev => ({
          ...prev,
          width: window.innerWidth,
          height: window.innerHeight
        }));
      }, 100); // 100ms debounce
    };

    // Set up media query listeners
    Object.entries(breakpoints).forEach(([key, query]) => {
      const mediaQuery = window.matchMedia(query);
      mediaQueries.set(key, mediaQuery);
      
      const handler = (e) => {
        setState(prev => ({
          ...prev,
          breakpoints: {
            ...prev.breakpoints,
            [key]: e.matches
          }
        }));
      };
      
      handlers.set(key, handler);
      
      // Add listener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else {
        mediaQuery.addListener(handler);
      }
      
      // Set initial state
      setState(prev => ({
        ...prev,
        breakpoints: {
          ...prev.breakpoints,
          [key]: mediaQuery.matches
        }
      }));
    });

    // Add resize listener for width/height tracking
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      
      // Clean up media query listeners
      for (const [key, mediaQuery] of mediaQueries) {
        const handler = handlers.get(key);
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handler);
        } else {
          mediaQuery.removeListener(handler);
        }
      }
    };
  }, [breakpoints]);

  return state;
}

/**
 * APPROACH 3: Hook with Utility Methods
 * Includes helper methods for common responsive patterns
 * 
 * This approach provides both the raw breakpoint data and
 * convenience methods for common use cases
 */
function useResponsiveUtils() {
  const breakpoints = useAdvancedResponsive();
  
  // Utility methods for common patterns
  const utils = {
    // Check if current screen is mobile-first
    isMobile: breakpoints.breakpoints.xs || breakpoints.breakpoints.sm,
    
    // Check if current screen is desktop-first  
    isDesktop: breakpoints.breakpoints.lg || breakpoints.breakpoints.xl,
    
    // Check if current screen is tablet
    isTablet: breakpoints.breakpoints.md,
    
    // Get current breakpoint name
    getCurrentBreakpoint: () => {
      const { breakpoints: bp } = breakpoints;
      if (bp.xs) return 'xs';
      if (bp.sm) return 'sm'; 
      if (bp.md) return 'md';
      if (bp.lg) return 'lg';
      if (bp.xl) return 'xl';
      return 'unknown';
    },
    
    // Check if screen width is above threshold
    isAbove: (threshold) => breakpoints.width > threshold,
    
    // Check if screen width is below threshold
    isBelow: (threshold) => breakpoints.width < threshold,
    
    // Get aspect ratio
    getAspectRatio: () => breakpoints.width / breakpoints.height,
    
    // Check if screen is in portrait mode
    isPortrait: breakpoints.breakpoints.portrait,
    
    // Check if screen is high-DPI (retina)
    isRetina: breakpoints.breakpoints.retina
  };
  
  return {
    ...breakpoints,
    ...utils
  };
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Basic responsive component
   * Shows how to conditionally render based on screen size
   */
  BasicExample: () => {
    const responsive = useResponsive();
    
    return (
      <div>
        {responsive.mobile && <div>Mobile Layout</div>}
        {responsive.tablet && <div>Tablet Layout</div>}
        {responsive.desktop && <div>Desktop Layout</div>}
      </div>
    );
  },

  /**
   * Advanced responsive navigation
   * Demonstrates complex responsive behavior with multiple conditions
   */
  ResponsiveNav: () => {
    const { isMobile, isTablet, getCurrentBreakpoint, isPortrait } = useResponsiveUtils();
    
    const showHamburgerMenu = isMobile || (isTablet && isPortrait);
    const showFullNav = !showHamburgerMenu;
    
    return (
      <nav className={`nav nav--${getCurrentBreakpoint()}`}>
        {showHamburgerMenu && <HamburgerMenu />}
        {showFullNav && <FullNavigation />}
      </nav>
    );
  },

  /**
   * Performance-optimized component loading
   * Only loads heavy components on larger screens
   */
  ConditionalLoading: () => {
    const { isDesktop, isRetina } = useResponsiveUtils();
    
    return (
      <div>
        {/* Always load core content */}
        <CoreContent />
        
        {/* Only load heavy components on desktop */}
        {isDesktop && <HeavyDashboardComponent />}
        
        {/* Load high-resolution images only on retina displays */}
        {isRetina ? <HighResImage /> : <StandardImage />}
      </div>
    );
  }
};

// Mock components for examples
const HamburgerMenu = () => <div>🍔 Menu</div>;
const FullNavigation = () => <div>Full Navigation Links</div>;
const CoreContent = () => <div>Essential Content</div>;
const HeavyDashboardComponent = () => <div>Complex Dashboard</div>;
const HighResImage = () => <img src="high-res.jpg" alt="High resolution" />;
const StandardImage = () => <img src="standard.jpg" alt="Standard resolution" />;

/**
 * Testing utilities for responsive behavior
 * Helper functions to simulate different screen sizes in tests
 */
const TestingUtils = {
  /**
   * Mock window.matchMedia for testing
   * Allows simulating different breakpoints in unit tests
   */
  mockMatchMedia: (matches) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  },

  /**
   * Simulate window resize
   * Helper to trigger resize events in tests
   */
  simulateResize: (width, height) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  }
};

// Export all implementations for different use cases
export {
  useResponsive,           // Basic implementation
  useAdvancedResponsive,   // Advanced with custom breakpoints
  useResponsiveUtils,      // With utility methods
  ExampleUsages,           // Usage examples
  TestingUtils             // Testing helpers
};

// Default export for most common use case
export default useResponsiveUtils;