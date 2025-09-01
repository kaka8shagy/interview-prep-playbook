/**
 * File: use-debounce.js
 * Description: Custom React hook for debouncing values with configurable delay
 * 
 * Learning objectives:
 * - Understand debouncing patterns for performance optimization
 * - Learn timeout management and cleanup in React hooks
 * - Master input optimization and API call reduction techniques
 * 
 * Time Complexity: O(1) for each update
 * Space Complexity: O(1)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to debounce a value, only updating after the specified delay
 * 
 * Debouncing is crucial for:
 * - Search input optimization (wait for user to stop typing)
 * - API call reduction (prevent excessive requests)
 * - Performance improvement (reduce expensive operations)
 * - User experience enhancement (smooth interactions)
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} The debounced value
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Set up a timer to update the debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cleanup function: cancel the timeout if value changes before delay completes
    // This is the core of debouncing - we reset the timer on every change
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run effect when value or delay changes
  
  return debouncedValue;
}

/**
 * Enhanced debounce hook with additional control and options
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Object} options - Additional configuration options
 * @param {boolean} options.leading - Fire on leading edge (default: false)
 * @param {boolean} options.trailing - Fire on trailing edge (default: true)
 * @param {number} options.maxWait - Maximum time to wait before forcing execution
 * @returns {Object} { debouncedValue, isDebouncing, cancel, flush }
 */
function useDebounceAdvanced(value, delay = 300, options = {}) {
  const { leading = false, trailing = true, maxWait } = options;
  
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const timeoutRef = useRef(null);
  const maxWaitTimeoutRef = useRef(null);
  const lastCallTimeRef = useRef(null);
  const lastInvokeTimeRef = useRef(Date.now());
  const leadingRef = useRef(leading);
  
  // Function to actually update the debounced value
  const invokeFunc = useCallback((newValue) => {
    setDebouncedValue(newValue);
    setIsDebouncing(false);
    lastInvokeTimeRef.current = Date.now();
  }, []);
  
  // Cancel any pending debounced execution
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    setIsDebouncing(false);
  }, []);
  
  // Immediately execute and update the debounced value
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      cancel();
      invokeFunc(value);
    }
  }, [cancel, invokeFunc, value]);
  
  useEffect(() => {
    const now = Date.now();
    lastCallTimeRef.current = now;
    
    // If leading edge and first call, execute immediately
    if (leading && !timeoutRef.current && !maxWaitTimeoutRef.current) {
      leadingRef.current = true;
      invokeFunc(value);
      return;
    }
    
    setIsDebouncing(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set up trailing execution if enabled
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        invokeFunc(value);
        timeoutRef.current = null;
        
        // Clear maxWait timeout as well
        if (maxWaitTimeoutRef.current) {
          clearTimeout(maxWaitTimeoutRef.current);
          maxWaitTimeoutRef.current = null;
        }
      }, delay);
    }
    
    // Set up maxWait timeout if specified
    if (maxWait && !maxWaitTimeoutRef.current) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        invokeFunc(value);
        
        // Clear regular timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        maxWaitTimeoutRef.current = null;
      }, maxWait);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitTimeoutRef.current) {
        clearTimeout(maxWaitTimeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing, maxWait, invokeFunc]);
  
  return {
    debouncedValue,
    isDebouncing,
    cancel,
    flush
  };
}

/**
 * Hook to debounce a callback function instead of a value
 * Useful for debouncing event handlers and API calls
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies for the callback
 * @returns {Function} The debounced callback function
 */
function useDebounceCallback(callback, delay = 300, deps = []) {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [...deps, delay]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Example usage in a React component:
 * 
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *   
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // This will only fire 500ms after the user stops typing
 *       searchAPI(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *   
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 */

// Real-world example: Search with API integration
function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setLoading(true);
      
      // Simulated API call - only executes after user stops typing
      fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then(res => res.json())
        .then(data => {
          setUsers(data.users || []);
          setLoading(false);
        })
        .catch(error => {
          console.error('Search failed:', error);
          setLoading(false);
        });
    } else {
      setUsers([]);
    }
  }, [debouncedQuery]);
  
  return (
    <div className="user-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="search-input"
      />
      
      {loading && <div className="loading">Searching...</div>}
      
      <div className="search-results">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <img src={user.avatar} alt={user.name} />
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Real-world example: Auto-save functionality
function DocumentEditor() {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  
  const { debouncedValue: debouncedContent, isDebouncing } = useDebounceAdvanced(
    content,
    1000, // Save 1 second after user stops typing
    { maxWait: 5000 } // But save at least every 5 seconds
  );
  
  useEffect(() => {
    if (debouncedContent && debouncedContent !== content) {
      setSaveStatus('saving');
      
      // Simulate auto-save API call
      fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: debouncedContent })
      })
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('error'));
    }
  }, [debouncedContent]);
  
  useEffect(() => {
    if (isDebouncing) {
      setSaveStatus('editing');
    }
  }, [isDebouncing]);
  
  return (
    <div className="document-editor">
      <div className="status-bar">
        Status: <span className={`status ${saveStatus}`}>{saveStatus}</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your document..."
        className="editor-textarea"
        rows={20}
      />
    </div>
  );
}

// Real-world example: Resize handler optimization
function ResponsiveComponent() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Debounce window resize events to improve performance
  const debouncedResize = useDebounceCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 150);
  
  useEffect(() => {
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [debouncedResize]);
  
  return (
    <div className="responsive-component">
      <p>Window size: {windowSize.width} x {windowSize.height}</p>
      <div className={windowSize.width < 768 ? 'mobile' : 'desktop'}>
        {windowSize.width < 768 ? 'Mobile Layout' : 'Desktop Layout'}
      </div>
    </div>
  );
}

export { useDebounce, useDebounceAdvanced, useDebounceCallback };