/**
 * File: use-async.js
 * Description: Custom React hook for handling async operations with loading/error states
 * 
 * Learning objectives:
 * - Understand async state management patterns in React
 * - Learn proper cleanup and cancellation of async operations
 * - Master race condition prevention and error handling
 * 
 * Time Complexity: O(1) for state updates
 * Space Complexity: O(1)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing async operations with built-in loading, error, and data states
 * 
 * This pattern is essential for:
 * - API calls with loading indicators
 * - Form submissions with error handling
 * - Data fetching with race condition prevention
 * - Resource loading with retry mechanisms
 * 
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} immediate - Whether to execute immediately on mount (default: true)
 * @param {Array} deps - Dependencies to trigger re-execution (default: [])
 * @returns {Object} { execute, loading, data, error, reset }
 */
function useAsync(asyncFunction, immediate = true, deps = []) {
  const [state, setState] = useState({
    loading: immediate,
    data: null,
    error: null
  });
  
  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  
  // Track current execution to handle race conditions
  const executionRef = useRef(0);
  
  // Memoized execute function to prevent unnecessary re-renders
  const execute = useCallback(async (...args) => {
    // Increment execution counter for race condition handling
    const currentExecution = ++executionRef.current;
    
    // Set loading state
    setState(prevState => ({
      ...prevState,
      loading: true,
      error: null
    }));
    
    try {
      // Execute the async function
      const data = await asyncFunction(...args);
      
      // Only update state if:
      // 1. Component is still mounted
      // 2. This is the most recent execution (prevents race conditions)
      if (mountedRef.current && currentExecution === executionRef.current) {
        setState({
          loading: false,
          data,
          error: null
        });
      }
      
      return data;
    } catch (error) {
      // Only update error state if component is still mounted and this is latest execution
      if (mountedRef.current && currentExecution === executionRef.current) {
        setState({
          loading: false,
          data: null,
          error
        });
      }
      
      // Re-throw error so caller can handle it
      throw error;
    }
  }, [asyncFunction]);
  
  // Reset function to clear state
  const reset = useCallback(() => {
    setState({
      loading: false,
      data: null,
      error: null
    });
  }, []);
  
  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, deps);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return {
    execute,
    loading: state.loading,
    data: state.data,
    error: state.error,
    reset
  };
}

/**
 * Enhanced version with additional features
 * 
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Enhanced state and control functions
 */
function useAsyncAdvanced(asyncFunction, options = {}) {
  const {
    immediate = true,
    deps = [],
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000,
    timeout
  } = options;
  
  const [state, setState] = useState({
    loading: immediate,
    data: null,
    error: null,
    retryCount: 0
  });
  
  const mountedRef = useRef(true);
  const executionRef = useRef(0);
  const timeoutRef = useRef(null);
  
  const executeWithRetry = useCallback(async (...args) => {
    const currentExecution = ++executionRef.current;
    let lastError = null;
    
    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= retry; attempt++) {
      if (!mountedRef.current || currentExecution !== executionRef.current) {
        return; // Component unmounted or newer execution started
      }
      
      setState(prevState => ({
        ...prevState,
        loading: true,
        error: null,
        retryCount: attempt
      }));
      
      try {
        let promise = asyncFunction(...args);
        
        // Add timeout wrapper if specified
        if (timeout) {
          promise = Promise.race([
            promise,
            new Promise((_, reject) => {
              timeoutRef.current = setTimeout(
                () => reject(new Error(`Operation timed out after ${timeout}ms`)),
                timeout
              );
            })
          ]);
        }
        
        const data = await promise;
        
        // Clear timeout if it was set
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        if (mountedRef.current && currentExecution === executionRef.current) {
          setState({
            loading: false,
            data,
            error: null,
            retryCount: 0
          });
          
          // Call success callback
          onSuccess?.(data);
        }
        
        return data;
      } catch (error) {
        lastError = error;
        
        // If this is the last attempt or component unmounted, set error state
        if (attempt === retry || !mountedRef.current || currentExecution !== executionRef.current) {
          if (mountedRef.current && currentExecution === executionRef.current) {
            setState({
              loading: false,
              data: null,
              error: lastError,
              retryCount: attempt
            });
            
            // Call error callback
            onError?.(lastError);
          }
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (lastError) {
      throw lastError;
    }
  }, [asyncFunction, retry, retryDelay, timeout, onSuccess, onError]);
  
  const reset = useCallback(() => {
    setState({
      loading: false,
      data: null,
      error: null,
      retryCount: 0
    });
  }, []);
  
  useEffect(() => {
    if (immediate) {
      executeWithRetry();
    }
  }, deps);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    execute: executeWithRetry,
    loading: state.loading,
    data: state.data,
    error: state.error,
    retryCount: state.retryCount,
    reset
  };
}

/**
 * Example usage in a React component:
 * 
 * function UserProfile({ userId }) {
 *   const fetchUser = useCallback(
 *     (id) => fetch(`/api/users/${id}`).then(res => res.json()),
 *     []
 *   );
 *   
 *   const { loading, data: user, error } = useAsync(
 *     () => fetchUser(userId),
 *     true,
 *     [userId]
 *   );
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (user) return <div>Hello, {user.name}!</div>;
 *   
 *   return null;
 * }
 */

// Real-world example: Form submission
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  const submitForm = useCallback(
    (data) => fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('Submission failed');
      return res.json();
    }),
    []
  );
  
  const { execute, loading, error, data } = useAsync(submitForm, false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await execute(formData);
      // Reset form on success
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      // Error is already handled by the hook
    }
  };
  
  if (data) {
    return <div className="success">Message sent successfully!</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
        required
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
        placeholder="Message"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
      {error && <div className="error">Error: {error.message}</div>}
    </form>
  );
}

// Real-world example: Data fetching with retry
function ProductList() {
  const fetchProducts = useCallback(
    () => fetch('/api/products').then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
    []
  );
  
  const { 
    loading, 
    data: products, 
    error, 
    retryCount,
    execute: refetch 
  } = useAsyncAdvanced(fetchProducts, {
    retry: 3,
    retryDelay: 1000,
    timeout: 5000,
    onError: (error) => {
      console.error('Failed to fetch products:', error);
    }
  });
  
  if (loading) {
    return (
      <div>
        Loading products...
        {retryCount > 0 && <span> (Retry {retryCount}/3)</span>}
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Products</h2>
      <button onClick={() => refetch()}>Refresh</button>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}

export { useAsync, useAsyncAdvanced };