/**
 * File: use-throttle.js
 * Description: Custom React hook for throttling values with rate limiting
 * 
 * Learning objectives:
 * - Understand throttling vs debouncing patterns
 * - Learn rate limiting for performance optimization
 * - Master high-frequency event handling in React
 * 
 * Time Complexity: O(1) for each update
 * Space Complexity: O(1)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to throttle a value, limiting updates to a maximum frequency
 * 
 * Throttling is essential for:
 * - Scroll event handling (prevent excessive renders)
 * - Mouse tracking (smooth animation performance)
 * - API calls with rate limits (respect server constraints)
 * - Resize events (optimize layout recalculations)
 * 
 * Key difference from debouncing:
 * - Debounce: Waits for pause in activity, then executes once
 * - Throttle: Executes at regular intervals during continuous activity
 * 
 * @param {any} value - The value to throttle
 * @param {number} limit - Minimum time between updates in milliseconds (default: 100ms)
 * @returns {any} The throttled value
 */
function useThrottle(value, limit = 100) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());
  
  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastExecuted.current;
    
    if (timeElapsed >= limit) {
      // Enough time has passed, update immediately
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      // Not enough time has passed, schedule update for later
      const timeRemaining = limit - timeElapsed;
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, timeRemaining);
      
      return () => clearTimeout(timer);
    }
  }, [value, limit]);
  
  return throttledValue;
}

/**
 * Enhanced throttle hook with leading/trailing edge control
 * 
 * @param {any} value - The value to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @param {Object} options - Configuration options
 * @param {boolean} options.leading - Execute on leading edge (default: true)
 * @param {boolean} options.trailing - Execute on trailing edge (default: true)
 * @returns {Object} { throttledValue, isThrottling, cancel, flush }
 */
function useThrottleAdvanced(value, limit = 100, options = {}) {
  const { leading = true, trailing = true } = options;
  
  const [throttledValue, setThrottledValue] = useState(value);
  const [isThrottling, setIsThrottling] = useState(false);
  
  const lastExecuted = useRef(0);
  const timeoutRef = useRef(null);
  const lastValueRef = useRef(value);
  
  const executeFunction = useCallback((newValue) => {
    setThrottledValue(newValue);
    setIsThrottling(false);
    lastExecuted.current = Date.now();
  }, []);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsThrottling(false);
  }, []);
  
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      executeFunction(lastValueRef.current);
      timeoutRef.current = null;
    }
  }, [executeFunction]);
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;
    lastValueRef.current = value;
    
    if (timeSinceLastExecution >= limit) {
      // Enough time has passed
      if (leading) {
        executeFunction(value);
      } else if (trailing) {
        setIsThrottling(true);
        timeoutRef.current = setTimeout(() => {
          executeFunction(value);
          timeoutRef.current = null;
        }, limit);
      }
    } else {
      // Not enough time has passed
      setIsThrottling(true);
      
      if (trailing && !timeoutRef.current) {
        const remaining = limit - timeSinceLastExecution;
        timeoutRef.current = setTimeout(() => {
          executeFunction(value);
          timeoutRef.current = null;
        }, remaining);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, limit, leading, trailing, executeFunction]);
  
  return {
    throttledValue,
    isThrottling,
    cancel,
    flush
  };
}

/**
 * Hook to throttle a callback function instead of a value
 * Perfect for event handlers and API calls
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @param {Array} deps - Dependencies for the callback
 * @returns {Function} The throttled callback function
 */
function useThrottleCallback(callback, limit = 100, deps = []) {
  const lastExecuted = useRef(0);
  const timeoutRef = useRef(null);
  
  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;
    
    if (timeSinceLastExecution >= limit) {
      // Execute immediately
      lastExecuted.current = now;
      callback(...args);
    } else {
      // Schedule execution for later if not already scheduled
      if (!timeoutRef.current) {
        const remaining = limit - timeSinceLastExecution;
        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          callback(...args);
          timeoutRef.current = null;
        }, remaining);
      }
    }
  }, [...deps, limit]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

/**
 * Example usage in a React component:
 * 
 * function ScrollTracker() {
 *   const [scrollY, setScrollY] = useState(0);
 *   const throttledScrollY = useThrottle(scrollY, 16); // ~60fps
 *   
 *   useEffect(() => {
 *     const handleScroll = () => setScrollY(window.scrollY);
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, []);
 *   
 *   return (
 *     <div style={{ 
 *       position: 'fixed',
 *       transform: `translateY(${throttledScrollY * 0.5}px)` 
 *     }}>
 *       Parallax Element
 *     </div>
 *   );
 * }
 */

// Real-world example: Smooth scroll progress indicator
function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Throttle scroll updates to 60fps for smooth animation
  const throttledProgress = useThrottle(scrollProgress, 16);
  
  useEffect(() => {
    const calculateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };
    
    const handleScroll = () => calculateScrollProgress();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateScrollProgress(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      className="scroll-progress-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${throttledProgress}%`,
        height: '4px',
        backgroundColor: '#007bff',
        zIndex: 9999,
        transition: 'width 0.1s ease'
      }}
    />
  );
}

// Real-world example: Mouse position tracking
function MouseTracker() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Throttle mouse updates to prevent excessive re-renders
  const throttledPosition = useThrottle(mousePosition, 50);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="mouse-tracker">
      <div 
        className="cursor-follower"
        style={{
          position: 'absolute',
          left: throttledPosition.x - 10,
          top: throttledPosition.y - 10,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 123, 255, 0.5)',
          pointerEvents: 'none',
          transition: 'all 0.1s ease'
        }}
      />
      <p>Mouse: ({throttledPosition.x}, {throttledPosition.y})</p>
    </div>
  );
}

// Real-world example: API call rate limiting
function SearchWithRateLimit() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Throttle API calls to respect rate limits (max 1 call per 500ms)
  const throttledQuery = useThrottle(query, 500);
  
  useEffect(() => {
    if (throttledQuery.trim()) {
      setLoading(true);
      
      // This API call will be throttled to maximum 2 calls per second
      fetch(`/api/search?q=${encodeURIComponent(throttledQuery)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Search failed:', error);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [throttledQuery]);
  
  return (
    <div className="search-with-rate-limit">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search (rate limited)..."
      />
      {loading && <div>Searching...</div>}
      <div className="results">
        {results.map((result, index) => (
          <div key={index} className="result-item">
            {result.title}
          </div>
        ))}
      </div>
    </div>
  );
}

// Real-world example: Resize-based layout updates
function ResponsiveGrid() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [columns, setColumns] = useState(1);
  
  // Throttle resize events to improve performance
  const throttledWidth = useThrottle(windowWidth, 100);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Calculate columns based on throttled width
    if (throttledWidth >= 1200) setColumns(4);
    else if (throttledWidth >= 992) setColumns(3);
    else if (throttledWidth >= 576) setColumns(2);
    else setColumns(1);
  }, [throttledWidth]);
  
  return (
    <div 
      className="responsive-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem',
        transition: 'all 0.3s ease'
      }}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="grid-item" style={{ 
          padding: '2rem',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px'
        }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );
}

export { useThrottle, useThrottleAdvanced, useThrottleCallback };