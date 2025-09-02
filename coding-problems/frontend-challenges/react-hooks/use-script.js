/**
 * File: use-script.js
 * Description: React hook for dynamically loading external scripts with loading states and error handling
 * 
 * Learning objectives:
 * - Master dynamic script loading in React applications
 * - Handle loading states and error scenarios for external resources
 * - Implement cleanup and memory management for DOM scripts
 * - Understand script caching and deduplication strategies
 * 
 * Common use cases:
 * - Loading third-party libraries (Google Maps, Stripe, etc.)
 * - Dynamic component dependencies
 * - A/B testing with different script versions  
 * - Performance optimization with lazy-loaded scripts
 * - Analytics and tracking script management
 */

import { useState, useEffect, useRef } from 'react';

/**
 * APPROACH 1: Basic Script Loading Hook
 * Simple implementation for loading external scripts
 * 
 * Mental model:
 * - Create script element and inject into DOM
 * - Track loading state (idle, loading, ready, error)
 * - Handle script load/error events
 * - Cleanup script element on unmount
 * 
 * Time Complexity: O(1) for script creation and DOM manipulation
 * Space Complexity: O(1) per script instance
 */
function useScript(src, options = {}) {
  // Possible states: 'idle' | 'loading' | 'ready' | 'error'
  const [status, setStatus] = useState('idle');
  const scriptRef = useRef(null);

  const {
    // Remove script from DOM when component unmounts
    removeOnUnmount = true,
    // Custom attributes for script element
    attributes = {},
    // Async loading (default: true for better performance)
    async = true,
    // Defer execution until DOM is ready
    defer = false
  } = options;

  useEffect(() => {
    // Don't load if no source provided
    if (!src) {
      setStatus('idle');
      return;
    }

    // Check if script is already loaded in the document
    // This prevents duplicate script loading
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      // Script already exists - check if it's loaded
      if (existingScript.dataset.status === 'ready') {
        setStatus('ready');
        return;
      } else if (existingScript.dataset.status === 'error') {
        setStatus('error');
        return;
      } else {
        // Script exists but still loading - attach listeners
        setStatus('loading');
        
        const handleLoad = () => {
          existingScript.dataset.status = 'ready';
          setStatus('ready');
        };
        
        const handleError = () => {
          existingScript.dataset.status = 'error';
          setStatus('error');
        };
        
        existingScript.addEventListener('load', handleLoad);
        existingScript.addEventListener('error', handleError);
        
        return () => {
          existingScript.removeEventListener('load', handleLoad);
          existingScript.removeEventListener('error', handleError);
        };
      }
    }

    // Create new script element
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    // Apply custom attributes
    Object.keys(attributes).forEach(key => {
      script.setAttribute(key, attributes[key]);
    });

    // Set initial status
    setStatus('loading');
    script.dataset.status = 'loading';
    
    // Store reference for cleanup
    scriptRef.current = script;

    // Event handlers for load success and failure
    const handleLoad = () => {
      script.dataset.status = 'ready';
      setStatus('ready');
    };

    const handleError = (event) => {
      script.dataset.status = 'error';
      setStatus('error');
      console.error(`Failed to load script: ${src}`, event);
    };

    // Attach event listeners
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    // Inject script into document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove event listeners
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      
      // Remove script from DOM if requested
      if (removeOnUnmount && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      scriptRef.current = null;
    };
  }, [src, async, defer, removeOnUnmount, attributes]);

  return status;
}

/**
 * APPROACH 2: Advanced Script Hook with Caching
 * Enhanced implementation with global script cache and advanced options
 * 
 * Features:
 * - Global cache to prevent duplicate loading
 * - Retry logic for failed loads
 * - Custom loading timeout
 * - Script verification after load
 * - Multiple hook instances sharing same script
 */

// Global cache to store script loading promises and states
const scriptCache = new Map();

function useScriptAdvanced(src, options = {}) {
  const [state, setState] = useState({
    status: 'idle',
    error: null,
    retryCount: 0
  });

  const {
    removeOnUnmount = false, // Keep scripts by default for caching
    attributes = {},
    async = true,
    defer = false,
    // Maximum number of retry attempts
    maxRetries = 2,
    // Timeout for script loading (ms)
    timeout = 10000,
    // Function to verify script loaded correctly
    verify = null,
    // Callback when script is ready
    onReady = null,
    // Callback when script fails
    onError = null
  } = options;

  useEffect(() => {
    if (!src) {
      setState({ status: 'idle', error: null, retryCount: 0 });
      return;
    }

    // Check cache first
    if (scriptCache.has(src)) {
      const cachedPromise = scriptCache.get(src);
      
      setState(prev => ({ ...prev, status: 'loading' }));
      
      cachedPromise
        .then(() => {
          // Verify script if verification function provided
          if (verify && !verify()) {
            throw new Error('Script verification failed');
          }
          
          setState(prev => ({ ...prev, status: 'ready', error: null }));
          onReady && onReady();
        })
        .catch((error) => {
          setState(prev => ({ 
            ...prev, 
            status: 'error', 
            error: error.message 
          }));
          onError && onError(error);
        });
      
      return;
    }

    // Create loading promise for this script
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already exists in DOM
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript && existingScript.dataset.status === 'ready') {
          resolve();
          return;
        }

        // Create new script element
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer;
        
        // Apply custom attributes
        Object.keys(attributes).forEach(key => {
          script.setAttribute(key, attributes[key]);
        });

        let timeoutId;
        
        // Success handler
        const handleLoad = () => {
          clearTimeout(timeoutId);
          script.dataset.status = 'ready';
          resolve();
        };

        // Error handler
        const handleError = (event) => {
          clearTimeout(timeoutId);
          script.dataset.status = 'error';
          reject(new Error(`Script load failed: ${src}`));
        };

        // Timeout handler
        const handleTimeout = () => {
          script.removeEventListener('load', handleLoad);
          script.removeEventListener('error', handleError);
          reject(new Error(`Script load timeout: ${src}`));
        };

        // Set up timeout
        if (timeout > 0) {
          timeoutId = setTimeout(handleTimeout, timeout);
        }

        // Attach event listeners
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        // Add to DOM
        document.head.appendChild(script);
      });
    };

    // Start loading with retry logic
    const attemptLoad = async (retryCount = 0) => {
      setState(prev => ({ ...prev, status: 'loading', retryCount }));
      
      try {
        await loadScript();
        
        // Verify script if verification function provided
        if (verify && !verify()) {
          throw new Error('Script verification failed');
        }
        
        setState(prev => ({ ...prev, status: 'ready', error: null }));
        onReady && onReady();
        
      } catch (error) {
        if (retryCount < maxRetries) {
          // Retry after delay
          setTimeout(() => attemptLoad(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          setState(prev => ({ 
            ...prev, 
            status: 'error', 
            error: error.message 
          }));
          onError && onError(error);
        }
      }
    };

    // Cache the loading promise
    const loadingPromise = attemptLoad();
    scriptCache.set(src, loadingPromise);

    // No cleanup needed as we're using global cache
    return () => {
      // Optional: Remove from cache if component unmounts quickly
      // This prevents memory leaks for one-off script loads
      if (removeOnUnmount) {
        setTimeout(() => {
          const script = document.querySelector(`script[src="${src}"]`);
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
          scriptCache.delete(src);
        }, 100);
      }
    };
  }, [src, maxRetries, timeout, verify, onReady, onError]);

  // Utility methods
  const retry = () => {
    if (state.status === 'error') {
      // Clear cache and reload
      scriptCache.delete(src);
      setState(prev => ({ ...prev, status: 'idle', error: null, retryCount: 0 }));
    }
  };

  return {
    ...state,
    retry,
    // Check if script is currently cached
    isCached: scriptCache.has(src)
  };
}

/**
 * APPROACH 3: Multiple Scripts Manager Hook
 * Hook for managing multiple scripts with dependencies
 * 
 * Useful for loading script chains where one script depends on another
 * (e.g., jQuery plugins that require jQuery to be loaded first)
 */
function useScripts(scripts, options = {}) {
  const [scriptsState, setScriptsState] = useState({});
  const loadedScripts = useRef(new Set());

  const {
    // Load scripts in parallel (false = sequential)
    parallel = true,
    // Stop loading remaining scripts if one fails
    stopOnError = false
  } = options;

  useEffect(() => {
    if (!scripts || scripts.length === 0) {
      setScriptsState({});
      return;
    }

    // Initialize state for all scripts
    const initialState = {};
    scripts.forEach((script, index) => {
      const key = typeof script === 'string' ? script : script.src;
      initialState[key] = { status: 'idle', index, error: null };
    });
    setScriptsState(initialState);

    // Load scripts based on strategy
    if (parallel) {
      loadScriptsParallel(scripts);
    } else {
      loadScriptsSequential(scripts);
    }

  }, [scripts, parallel, stopOnError]);

  // Parallel loading strategy
  const loadScriptsParallel = (scripts) => {
    const promises = scripts.map((scriptConfig, index) => {
      const src = typeof scriptConfig === 'string' ? scriptConfig : scriptConfig.src;
      const options = typeof scriptConfig === 'object' ? scriptConfig : {};
      
      return loadSingleScript(src, options, index);
    });

    // Handle all promises
    Promise.allSettled(promises).then(results => {
      const newState = {};
      
      results.forEach((result, index) => {
        const script = scripts[index];
        const src = typeof script === 'string' ? script : script.src;
        
        if (result.status === 'fulfilled') {
          newState[src] = { status: 'ready', index, error: null };
          loadedScripts.current.add(src);
        } else {
          newState[src] = { status: 'error', index, error: result.reason.message };
        }
      });
      
      setScriptsState(prev => ({ ...prev, ...newState }));
    });
  };

  // Sequential loading strategy
  const loadScriptsSequential = async (scripts) => {
    for (let i = 0; i < scripts.length; i++) {
      const scriptConfig = scripts[i];
      const src = typeof scriptConfig === 'string' ? scriptConfig : scriptConfig.src;
      const options = typeof scriptConfig === 'object' ? scriptConfig : {};
      
      try {
        setScriptsState(prev => ({
          ...prev,
          [src]: { status: 'loading', index: i, error: null }
        }));
        
        await loadSingleScript(src, options, i);
        
        setScriptsState(prev => ({
          ...prev,
          [src]: { status: 'ready', index: i, error: null }
        }));
        
        loadedScripts.current.add(src);
        
      } catch (error) {
        setScriptsState(prev => ({
          ...prev,
          [src]: { status: 'error', index: i, error: error.message }
        }));
        
        if (stopOnError) {
          break;
        }
      }
    }
  };

  // Helper to load single script
  const loadSingleScript = (src, options, index) => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (loadedScripts.current.has(src)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = options.async !== false;
      script.defer = options.defer || false;
      
      // Apply custom attributes
      if (options.attributes) {
        Object.keys(options.attributes).forEach(key => {
          script.setAttribute(key, options.attributes[key]);
        });
      }

      const handleLoad = () => {
        resolve();
      };

      const handleError = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      
      document.head.appendChild(script);
    });
  };

  // Utility methods
  const getOverallStatus = () => {
    const states = Object.values(scriptsState);
    if (states.length === 0) return 'idle';
    
    if (states.every(s => s.status === 'ready')) return 'ready';
    if (states.some(s => s.status === 'error')) return 'error';
    if (states.some(s => s.status === 'loading')) return 'loading';
    
    return 'idle';
  };

  return {
    scriptsState,
    overallStatus: getOverallStatus(),
    loadedCount: loadedScripts.current.size,
    totalCount: scripts.length,
    // Get status of specific script
    getScriptStatus: (src) => scriptsState[src] || null,
    // Check if all scripts are ready
    allReady: getOverallStatus() === 'ready',
    // Check if any script failed
    hasErrors: getOverallStatus() === 'error'
  };
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Google Maps integration
   */
  GoogleMapsComponent: () => {
    const status = useScript(
      'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY',
      {
        attributes: { defer: 'true' },
        verify: () => typeof window.google !== 'undefined'
      }
    );
    
    if (status === 'loading') return <div>Loading Google Maps...</div>;
    if (status === 'error') return <div>Failed to load Google Maps</div>;
    if (status === 'ready') return <GoogleMapComponent />;
    
    return null;
  },

  /**
   * Stripe payment integration
   */
  StripeCheckout: () => {
    const { status, error, retry } = useScriptAdvanced(
      'https://js.stripe.com/v3/',
      {
        verify: () => typeof window.Stripe !== 'undefined',
        onReady: () => console.log('Stripe loaded successfully'),
        onError: (error) => console.error('Stripe failed:', error),
        maxRetries: 3
      }
    );
    
    if (status === 'error') {
      return (
        <div>
          <p>Payment system failed to load: {error}</p>
          <button onClick={retry}>Retry</button>
        </div>
      );
    }
    
    return status === 'ready' ? <StripePaymentForm /> : <div>Loading payment...</div>;
  },

  /**
   * Sequential script loading (jQuery + plugins)
   */
  jQueryWithPlugins: () => {
    const scripts = [
      'https://code.jquery.com/jquery-3.6.0.min.js',
      'https://cdn.jsdelivr.net/npm/jquery-ui@1.12.1/ui/core.js',
      'https://cdn.jsdelivr.net/npm/jquery.datatables@1.10.25/js/jquery.dataTables.min.js'
    ];
    
    const { overallStatus, scriptsState, loadedCount, totalCount } = useScripts(scripts, {
      parallel: false, // Load sequentially
      stopOnError: true
    });
    
    if (overallStatus === 'loading') {
      return <div>Loading scripts: {loadedCount}/{totalCount}</div>;
    }
    
    if (overallStatus === 'error') {
      return <div>Script loading failed. Check console for details.</div>;
    }
    
    return overallStatus === 'ready' ? <DataTableComponent /> : null;
  }
};

// Mock components for examples
const GoogleMapComponent = () => <div>Google Map Component</div>;
const StripePaymentForm = () => <div>Stripe Payment Form</div>;
const DataTableComponent = () => <div>jQuery DataTable Component</div>;

/**
 * Testing utilities for script loading hooks
 */
const TestingUtils = {
  /**
   * Mock script loading for tests
   */
  mockScriptLoading: () => {
    const originalCreateElement = document.createElement;
    const mockScripts = new Map();
    
    document.createElement = (tagName) => {
      if (tagName === 'script') {
        const mockScript = {
          src: '',
          async: true,
          defer: false,
          dataset: {},
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          setAttribute: jest.fn(),
          // Mock methods to trigger events
          triggerLoad: () => {
            const handler = mockScript.addEventListener.mock.calls
              .find(call => call[0] === 'load');
            if (handler) handler[1]();
          },
          triggerError: () => {
            const handler = mockScript.addEventListener.mock.calls
              .find(call => call[0] === 'error');
            if (handler) handler[1]();
          }
        };
        
        mockScripts.set(mockScript.src, mockScript);
        return mockScript;
      }
      
      return originalCreateElement.call(document, tagName);
    };
    
    // Mock appendChild
    const originalAppendChild = document.head.appendChild;
    document.head.appendChild = jest.fn();
    
    return {
      mockScripts,
      triggerLoad: (src) => mockScripts.get(src)?.triggerLoad(),
      triggerError: (src) => mockScripts.get(src)?.triggerError(),
      restore: () => {
        document.createElement = originalCreateElement;
        document.head.appendChild = originalAppendChild;
      }
    };
  },

  /**
   * Clear script cache for testing
   */
  clearScriptCache: () => {
    scriptCache.clear();
  }
};

// Export all implementations and utilities
export {
  useScript,                   // Basic implementation
  useScriptAdvanced,           // Advanced with caching and retry
  useScripts,                  // Multiple scripts manager
  ExampleUsages,               // Usage examples
  TestingUtils                 // Testing utilities
};

// Default export for most common use case
export default useScript;