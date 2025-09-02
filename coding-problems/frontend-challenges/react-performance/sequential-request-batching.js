/**
 * File: sequential-request-batching.js
 * Description: React performance optimization for batching sequential API requests with intelligent caching
 * 
 * Learning objectives:
 * - Master request batching and deduplication strategies
 * - Implement intelligent caching with TTL and invalidation
 * - Handle race conditions and request cancellation
 * - Optimize React rendering with batched state updates
 * 
 * Common use cases:
 * - API request optimization in data-heavy applications
 * - Search autocomplete with debouncing and batching  
 * - Real-time data fetching with minimal server load
 * - Dashboard applications with multiple data sources
 * - Form validation with server-side checks
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * APPROACH 1: Basic Request Batcher Hook
 * Simple implementation for batching multiple requests together
 * 
 * Mental model:
 * - Collect requests in a queue during a batching window
 * - Execute all queued requests simultaneously
 * - Share results across all requesting components
 * - Handle loading and error states efficiently
 * 
 * Time Complexity: O(1) for queuing, O(n) for batch execution
 * Space Complexity: O(n) where n is number of queued requests
 */
function useRequestBatcher(batchSize = 5, batchDelay = 100) {
  const [batchState, setBatchState] = useState({
    isLoading: false,
    completedRequests: new Map(),
    errors: new Map()
  });

  const requestQueue = useRef([]);
  const batchTimeout = useRef(null);
  const requestCallbacks = useRef(new Map());

  // Execute a batch of requests
  const executeBatch = useCallback(async () => {
    if (requestQueue.current.length === 0) return;

    const currentBatch = [...requestQueue.current];
    requestQueue.current = [];

    setBatchState(prev => ({ ...prev, isLoading: true }));

    try {
      // Execute all requests in parallel
      const promises = currentBatch.map(async (request) => {
        try {
          const response = await fetch(request.url, request.options);
          const data = await response.json();
          return { 
            requestId: request.id, 
            success: true, 
            data,
            url: request.url
          };
        } catch (error) {
          return { 
            requestId: request.id, 
            success: false, 
            error: error.message,
            url: request.url
          };
        }
      });

      const results = await Promise.all(promises);
      
      // Update state with results
      setBatchState(prev => {
        const newCompleted = new Map(prev.completedRequests);
        const newErrors = new Map(prev.errors);

        results.forEach(result => {
          if (result.success) {
            newCompleted.set(result.url, result.data);
            newErrors.delete(result.url);
          } else {
            newErrors.set(result.url, result.error);
            newCompleted.delete(result.url);
          }
        });

        return {
          isLoading: false,
          completedRequests: newCompleted,
          errors: newErrors
        };
      });

      // Notify individual request callbacks
      results.forEach(result => {
        const callback = requestCallbacks.current.get(result.requestId);
        if (callback) {
          callback(result.success ? result.data : null, result.success ? null : result.error);
          requestCallbacks.current.delete(result.requestId);
        }
      });

    } catch (error) {
      setBatchState(prev => ({ ...prev, isLoading: false }));
      console.error('Batch execution failed:', error);
    }
  }, []);

  // Add request to batch queue
  const addToBatch = useCallback((url, options = {}, callback = null) => {
    const requestId = `${url}-${Date.now()}-${Math.random()}`;
    
    // Add to queue
    requestQueue.current.push({
      id: requestId,
      url,
      options,
      timestamp: Date.now()
    });

    // Store callback if provided
    if (callback) {
      requestCallbacks.current.set(requestId, callback);
    }

    // Clear existing timeout
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    // Execute batch if we hit the size limit
    if (requestQueue.current.length >= batchSize) {
      executeBatch();
    } else {
      // Set timeout for batch delay
      batchTimeout.current = setTimeout(executeBatch, batchDelay);
    }

    return requestId;
  }, [batchSize, batchDelay, executeBatch]);

  // Get cached result
  const getCachedResult = useCallback((url) => {
    return {
      data: batchState.completedRequests.get(url),
      error: batchState.errors.get(url),
      isLoading: batchState.isLoading
    };
  }, [batchState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, []);

  return {
    addToBatch,
    getCachedResult,
    executeBatch,
    isLoading: batchState.isLoading,
    queueSize: requestQueue.current.length
  };
}

/**
 * APPROACH 2: Advanced Request Manager with Intelligent Caching
 * Enhanced implementation with TTL caching, deduplication, and performance optimization
 * 
 * Features:
 * - TTL-based caching with automatic cleanup
 * - Request deduplication to prevent duplicate API calls
 * - Configurable cache strategies (LRU, FIFO, etc.)
 * - Request prioritization and cancellation
 * - Performance metrics and monitoring
 */
function useAdvancedRequestManager(options = {}) {
  const {
    // Batching options
    batchSize = 10,
    batchDelay = 150,
    maxConcurrentBatches = 3,
    
    // Caching options
    defaultTTL = 300000, // 5 minutes
    maxCacheSize = 100,
    cacheStrategy = 'LRU',
    
    // Performance options
    enableMetrics = true,
    onBatchComplete = null,
    onCacheHit = null,
    onError = null
  } = options;

  const [requestState, setRequestState] = useState({
    isLoading: false,
    activeBatches: 0,
    cache: new Map(),
    metrics: {
      totalRequests: 0,
      cacheHits: 0,
      batchesExecuted: 0,
      averageBatchSize: 0,
      totalResponseTime: 0
    }
  });

  const requestQueue = useRef([]);
  const batchTimeout = useRef(null);
  const pendingCallbacks = useRef(new Map());
  const requestDeduplication = useRef(new Map());
  const cacheTimestamps = useRef(new Map());
  const abortControllers = useRef(new Map());

  // Cache management with TTL
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const expiredKeys = [];

    cacheTimestamps.current.forEach((timestamp, key) => {
      const cacheEntry = requestState.cache.get(key);
      const ttl = cacheEntry?.ttl || defaultTTL;
      
      if (now - timestamp > ttl) {
        expiredKeys.push(key);
      }
    });

    if (expiredKeys.length > 0) {
      setRequestState(prev => {
        const newCache = new Map(prev.cache);
        expiredKeys.forEach(key => {
          newCache.delete(key);
          cacheTimestamps.current.delete(key);
        });
        
        return { ...prev, cache: newCache };
      });
    }
  }, [requestState.cache, defaultTTL]);

  // LRU cache eviction
  const evictLRUCache = useCallback(() => {
    if (requestState.cache.size <= maxCacheSize) return;

    // Sort by timestamp (oldest first)
    const sortedEntries = Array.from(cacheTimestamps.current.entries())
      .sort(([, a], [, b]) => a - b);

    const toEvict = sortedEntries.slice(0, sortedEntries.length - maxCacheSize + 1);
    
    setRequestState(prev => {
      const newCache = new Map(prev.cache);
      toEvict.forEach(([key]) => {
        newCache.delete(key);
        cacheTimestamps.current.delete(key);
      });
      
      return { ...prev, cache: newCache };
    });
  }, [requestState.cache.size, maxCacheSize]);

  // Generate cache key from request
  const generateCacheKey = useCallback((url, options) => {
    const method = options.method || 'GET';
    const body = options.body || '';
    const headers = JSON.stringify(options.headers || {});
    return `${method}:${url}:${body}:${headers}`;
  }, []);

  // Check cache for existing result
  const checkCache = useCallback((cacheKey) => {
    const cachedResult = requestState.cache.get(cacheKey);
    const timestamp = cacheTimestamps.current.get(cacheKey);
    
    if (cachedResult && timestamp) {
      const ttl = cachedResult.ttl || defaultTTL;
      const isExpired = Date.now() - timestamp > ttl;
      
      if (!isExpired) {
        // Update timestamp for LRU
        cacheTimestamps.current.set(cacheKey, Date.now());
        
        if (enableMetrics) {
          setRequestState(prev => ({
            ...prev,
            metrics: {
              ...prev.metrics,
              cacheHits: prev.metrics.cacheHits + 1
            }
          }));
        }
        
        if (onCacheHit) {
          onCacheHit(cacheKey, cachedResult.data);
        }
        
        return cachedResult;
      } else {
        // Remove expired entry
        setRequestState(prev => {
          const newCache = new Map(prev.cache);
          newCache.delete(cacheKey);
          cacheTimestamps.current.delete(cacheKey);
          return { ...prev, cache: newCache };
        });
      }
    }
    
    return null;
  }, [requestState.cache, defaultTTL, enableMetrics, onCacheHit]);

  // Execute batch with advanced features
  const executeBatch = useCallback(async () => {
    if (requestQueue.current.length === 0) return;
    if (requestState.activeBatches >= maxConcurrentBatches) return;

    const currentBatch = [...requestQueue.current];
    requestQueue.current = [];
    const batchId = `batch-${Date.now()}`;
    const batchStartTime = performance.now();

    setRequestState(prev => ({ 
      ...prev, 
      isLoading: true,
      activeBatches: prev.activeBatches + 1
    }));

    try {
      // Create abort controller for this batch
      const controller = new AbortController();
      abortControllers.current.set(batchId, controller);

      // Execute requests with deduplication
      const uniqueRequests = new Map();
      const requestMapping = new Map();

      currentBatch.forEach(request => {
        const cacheKey = generateCacheKey(request.url, request.options);
        
        if (!uniqueRequests.has(cacheKey)) {
          uniqueRequests.set(cacheKey, request);
        }
        
        // Map original request to cache key for callback resolution
        requestMapping.set(request.id, cacheKey);
      });

      // Execute unique requests
      const promises = Array.from(uniqueRequests.values()).map(async (request) => {
        const cacheKey = generateCacheKey(request.url, request.options);
        
        try {
          const response = await fetch(request.url, {
            ...request.options,
            signal: controller.signal
          });
          
          const data = await response.json();
          
          return {
            cacheKey,
            success: true,
            data,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch (error) {
          if (error.name === 'AbortError') {
            return { cacheKey, success: false, cancelled: true };
          }
          
          return {
            cacheKey,
            success: false,
            error: error.message,
            status: 0
          };
        }
      });

      const results = await Promise.all(promises);
      const batchEndTime = performance.now();
      const batchResponseTime = batchEndTime - batchStartTime;

      // Update cache and state
      setRequestState(prev => {
        const newCache = new Map(prev.cache);
        const newMetrics = { ...prev.metrics };

        results.forEach(result => {
          if (result.success && !result.cancelled) {
            // Cache successful results
            newCache.set(result.cacheKey, {
              data: result.data,
              status: result.status,
              headers: result.headers,
              ttl: defaultTTL,
              cached: true
            });
            
            cacheTimestamps.current.set(result.cacheKey, Date.now());
          }
        });

        // Update metrics
        if (enableMetrics) {
          newMetrics.totalRequests += currentBatch.length;
          newMetrics.batchesExecuted += 1;
          newMetrics.averageBatchSize = Math.round(
            newMetrics.totalRequests / newMetrics.batchesExecuted
          );
          newMetrics.totalResponseTime += batchResponseTime;
        }

        return {
          ...prev,
          cache: newCache,
          metrics: newMetrics,
          activeBatches: prev.activeBatches - 1,
          isLoading: prev.activeBatches <= 1 ? false : prev.isLoading
        };
      });

      // Resolve callbacks
      currentBatch.forEach(request => {
        const cacheKey = requestMapping.get(request.id);
        const result = results.find(r => r.cacheKey === cacheKey);
        const callback = pendingCallbacks.current.get(request.id);
        
        if (callback && result) {
          if (result.cancelled) {
            callback(null, new Error('Request cancelled'));
          } else if (result.success) {
            callback(result.data, null);
          } else {
            callback(null, new Error(result.error));
          }
        }
        
        pendingCallbacks.current.delete(request.id);
      });

      // Clean up abort controller
      abortControllers.current.delete(batchId);

      // Trigger completion callback
      if (onBatchComplete) {
        onBatchComplete({
          batchId,
          requestCount: currentBatch.length,
          uniqueRequestCount: uniqueRequests.size,
          responseTime: batchResponseTime,
          results
        });
      }

    } catch (error) {
      setRequestState(prev => ({
        ...prev,
        activeBatches: prev.activeBatches - 1,
        isLoading: prev.activeBatches <= 1 ? false : prev.isLoading
      }));

      if (onError) {
        onError(error, currentBatch);
      }

      console.error('Batch execution failed:', error);
    }
  }, [
    requestState.activeBatches, 
    maxConcurrentBatches, 
    generateCacheKey, 
    defaultTTL, 
    enableMetrics,
    onBatchComplete,
    onError
  ]);

  // Add request with intelligent queuing
  const request = useCallback(async (url, options = {}, requestOptions = {}) => {
    const {
      ttl = defaultTTL,
      priority = 0,
      bypassCache = false,
      timeout = 30000
    } = requestOptions;

    const cacheKey = generateCacheKey(url, options);
    
    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cachedResult = checkCache(cacheKey);
      if (cachedResult) {
        return Promise.resolve(cachedResult.data);
      }
    }

    // Check for duplicate in-flight requests
    if (requestDeduplication.current.has(cacheKey)) {
      // Return existing promise
      return requestDeduplication.current.get(cacheKey);
    }

    // Create new request promise
    const requestPromise = new Promise((resolve, reject) => {
      const requestId = `${cacheKey}-${Date.now()}-${Math.random()}`;
      
      // Store callback
      pendingCallbacks.current.set(requestId, (data, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });

      // Add to queue
      requestQueue.current.push({
        id: requestId,
        url,
        options,
        priority,
        ttl,
        timestamp: Date.now()
      });

      // Sort queue by priority (higher priority first)
      requestQueue.current.sort((a, b) => b.priority - a.priority);

      // Set timeout for individual request
      setTimeout(() => {
        const callback = pendingCallbacks.current.get(requestId);
        if (callback) {
          pendingCallbacks.current.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, timeout);
    });

    // Store for deduplication
    requestDeduplication.current.set(cacheKey, requestPromise);
    
    // Clean up deduplication after promise settles
    requestPromise.finally(() => {
      requestDeduplication.current.delete(cacheKey);
    });

    // Trigger batch execution
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    if (requestQueue.current.length >= batchSize) {
      executeBatch();
    } else {
      batchTimeout.current = setTimeout(executeBatch, batchDelay);
    }

    return requestPromise;
  }, [
    defaultTTL, 
    generateCacheKey, 
    checkCache, 
    batchSize, 
    batchDelay, 
    executeBatch
  ]);

  // Cancel all pending requests
  const cancelAll = useCallback(() => {
    // Cancel all active batches
    abortControllers.current.forEach(controller => {
      controller.abort();
    });
    abortControllers.current.clear();

    // Clear queue and callbacks
    requestQueue.current = [];
    pendingCallbacks.current.forEach(callback => {
      callback(null, new Error('Cancelled'));
    });
    pendingCallbacks.current.clear();
    requestDeduplication.current.clear();

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }

    setRequestState(prev => ({
      ...prev,
      isLoading: false,
      activeBatches: 0
    }));
  }, []);

  // Periodic cache cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanExpiredCache();
      evictLRUCache();
    }, 60000); // Clean every minute

    return () => clearInterval(cleanupInterval);
  }, [cleanExpiredCache, evictLRUCache]);

  return {
    request,
    cancelAll,
    cache: requestState.cache,
    metrics: requestState.metrics,
    isLoading: requestState.isLoading,
    activeBatches: requestState.activeBatches,
    queueSize: requestQueue.current.length,
    clearCache: () => {
      setRequestState(prev => ({ ...prev, cache: new Map() }));
      cacheTimestamps.current.clear();
    }
  };
}

/**
 * APPROACH 3: React Component with Optimized Data Fetching
 * Complete component implementation showcasing the batching system
 */
function DataDashboard({ apiEndpoints, refreshInterval = 30000 }) {
  const [dashboardData, setDashboardData] = useState(new Map());
  const [lastRefresh, setLastRefresh] = useState(null);
  
  const requestManager = useAdvancedRequestManager({
    batchSize: 5,
    batchDelay: 200,
    defaultTTL: refreshInterval,
    onBatchComplete: (batchInfo) => {
      console.log('Batch completed:', batchInfo);
    }
  });

  // Fetch data for all endpoints
  const fetchDashboardData = useCallback(async () => {
    const fetchPromises = apiEndpoints.map(async (endpoint) => {
      try {
        const data = await requestManager.request(endpoint.url, endpoint.options || {});
        return { id: endpoint.id, data, error: null };
      } catch (error) {
        return { id: endpoint.id, data: null, error: error.message };
      }
    });

    const results = await Promise.all(fetchPromises);
    
    // Batch state update
    React.startTransition(() => {
      const newData = new Map();
      results.forEach(result => {
        newData.set(result.id, result);
      });
      setDashboardData(newData);
      setLastRefresh(new Date());
    });
  }, [apiEndpoints, requestManager]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, refreshInterval]);

  return (
    <div className="data-dashboard">
      <div className="dashboard-header">
        <h2>Performance Dashboard</h2>
        <div className="dashboard-stats">
          <div>Active Batches: {requestManager.activeBatches}</div>
          <div>Queue Size: {requestManager.queueSize}</div>
          <div>Cache Size: {requestManager.cache.size}</div>
          <div>Cache Hits: {requestManager.metrics.cacheHits}</div>
          <div>Total Requests: {requestManager.metrics.totalRequests}</div>
        </div>
      </div>

      <div className="dashboard-controls">
        <button onClick={fetchDashboardData} disabled={requestManager.isLoading}>
          {requestManager.isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
        <button onClick={requestManager.clearCache}>
          Clear Cache
        </button>
        <button onClick={requestManager.cancelAll}>
          Cancel Requests
        </button>
      </div>

      {lastRefresh && (
        <div className="last-refresh">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      <div className="data-grid">
        {apiEndpoints.map(endpoint => {
          const result = dashboardData.get(endpoint.id);
          
          return (
            <div key={endpoint.id} className="data-card">
              <h3>{endpoint.name}</h3>
              
              {!result ? (
                <div className="loading">Loading...</div>
              ) : result.error ? (
                <div className="error">Error: {result.error}</div>
              ) : (
                <div className="data-content">
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Example usage patterns
const ExampleUsages = {
  /**
   * Basic request batching
   */
  BasicBatchingExample: () => {
    const { addToBatch, getCachedResult, isLoading } = useRequestBatcher(3, 100);
    const [results, setResults] = useState([]);

    const handleBatchRequest = () => {
      const urls = [
        'https://jsonplaceholder.typicode.com/posts/1',
        'https://jsonplaceholder.typicode.com/posts/2', 
        'https://jsonplaceholder.typicode.com/posts/3'
      ];

      urls.forEach(url => {
        addToBatch(url, {}, (data, error) => {
          if (data) {
            setResults(prev => [...prev, data]);
          }
        });
      });
    };

    return (
      <div className="basic-batching">
        <h3>Basic Request Batching</h3>
        <button onClick={handleBatchRequest} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Batched Data'}
        </button>
        
        <div className="results">
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <h4>{result.title}</h4>
              <p>{result.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },

  /**
   * Search with intelligent batching
   */
  IntelligentSearchExample: () => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const debounceTimeout = useRef(null);
    
    const requestManager = useAdvancedRequestManager({
      batchSize: 3,
      batchDelay: 150,
      defaultTTL: 600000 // 10 minutes cache for search results
    });

    const performSearch = useCallback(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const data = await requestManager.request(
          `https://jsonplaceholder.typicode.com/posts?q=${encodeURIComponent(searchQuery)}`
        );
        setSearchResults(data || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    }, [requestManager]);

    const handleSearchChange = (event) => {
      const newQuery = event.target.value;
      setQuery(newQuery);

      // Debounce search requests
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        performSearch(newQuery);
      }, 300);
    };

    return (
      <div className="intelligent-search">
        <h3>Intelligent Search with Batching</h3>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search posts..."
          className="search-input"
        />
        
        <div className="search-stats">
          <small>
            Cache hits: {requestManager.metrics.cacheHits} | 
            Loading: {requestManager.isLoading ? 'Yes' : 'No'}
          </small>
        </div>

        <div className="search-results">
          {searchResults.map(result => (
            <div key={result.id} className="search-result">
              <h4>{result.title}</h4>
              <p>{result.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },

  /**
   * Complete dashboard example
   */
  CompleteDashboardExample: () => {
    const endpoints = [
      {
        id: 'users',
        name: 'User Data',
        url: 'https://jsonplaceholder.typicode.com/users'
      },
      {
        id: 'posts',
        name: 'Recent Posts',
        url: 'https://jsonplaceholder.typicode.com/posts?_limit=5'
      },
      {
        id: 'albums',
        name: 'Albums',
        url: 'https://jsonplaceholder.typicode.com/albums?_limit=5'
      }
    ];

    return (
      <DataDashboard 
        apiEndpoints={endpoints}
        refreshInterval={30000}
      />
    );
  }
};

/**
 * Testing utilities
 */
const TestingUtils = {
  /**
   * Mock fetch for testing
   */
  mockFetch: (responses = {}) => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const response = responses[url] || { data: 'mock data' };
      
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
        headers: new Headers({
          'content-type': 'application/json'
        })
      });
    });
    
    return global.fetch;
  },

  /**
   * Wait for batches to complete
   */
  waitForBatch: (delay = 200) => {
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  /**
   * Create performance test scenario
   */
  createPerformanceTest: (requestCount = 100) => {
    return {
      urls: Array.from({ length: requestCount }, (_, i) => 
        `https://api.example.com/data/${i}`
      ),
      expectedBatches: Math.ceil(requestCount / 10),
      measureTime: (fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        return { result, time: end - start };
      }
    };
  }
};

// CSS styles
const styles = `
  .data-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .dashboard-stats {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #666;
  }

  .dashboard-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .dashboard-controls button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }

  .dashboard-controls button:hover {
    background: #f5f5f5;
  }

  .dashboard-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .data-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background: white;
  }

  .data-card h3 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .data-content {
    max-height: 200px;
    overflow-y: auto;
    background: #f9f9f9;
    padding: 10px;
    border-radius: 4px;
  }

  .data-content pre {
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
  }

  .loading {
    color: #666;
    font-style: italic;
  }

  .error {
    color: #d32f2f;
    background: #ffebee;
    padding: 10px;
    border-radius: 4px;
  }

  .search-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .search-stats {
    margin-bottom: 15px;
    color: #666;
  }

  .search-results {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .search-result {
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    background: white;
  }

  .search-result h4 {
    margin: 0 0 8px 0;
    color: #333;
  }

  .last-refresh {
    text-align: center;
    color: #666;
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

// Export all implementations and utilities
export {
  useRequestBatcher,           // Basic request batching
  useAdvancedRequestManager,   // Advanced with caching
  DataDashboard,               // Complete dashboard component
  ExampleUsages,               // Usage examples
  TestingUtils,                // Testing utilities
  styles                       // CSS styles
};

// Default export for most common use case
export default useAdvancedRequestManager;