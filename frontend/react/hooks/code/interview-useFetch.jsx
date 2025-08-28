/**
 * File: interview-useFetch.jsx
 * Description: Custom useFetch hook implementation - common interview question
 * Tests async operations, cleanup, error handling, and custom hook design
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// === Basic useFetch Implementation ===
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!url) return;
    
    const abortController = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      abortController.abort();
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// === Advanced useFetch with Retry ===
function useFetchWithRetry(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { maxRetries = 3, retryDelay = 1000, ...fetchOptions } = options;
  
  const fetchWithRetry = useCallback(async () => {
    const abortController = new AbortController();
    
    const attemptFetch = async (attempt) => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
        setRetryCount(0);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        
        if (attempt < maxRetries) {
          setRetryCount(attempt + 1);
          setTimeout(() => attemptFetch(attempt + 1), retryDelay * attempt);
        } else {
          setError(err.message);
          setRetryCount(0);
        }
      } finally {
        if (attempt === 0 || attempt >= maxRetries || !error) {
          setLoading(false);
        }
      }
    };
    
    setLoading(true);
    setError(null);
    await attemptFetch(1);
    
    return abortController;
  }, [url, maxRetries, retryDelay, JSON.stringify(fetchOptions)]);
  
  useEffect(() => {
    if (!url) return;
    
    const controller = fetchWithRetry();
    
    return () => {
      controller.then(ctrl => ctrl?.abort());
    };
  }, [url, fetchWithRetry]);
  
  const retry = () => {
    fetchWithRetry();
  };
  
  return { data, loading, error, retryCount, retry };
}

// === useFetch with Cache ===
function useFetchWithCache(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simple in-memory cache
  const cacheRef = useRef(new Map());
  const { cacheTime = 5 * 60 * 1000, ...fetchOptions } = options; // 5 minutes default
  
  useEffect(() => {
    if (!url) return;
    
    const cacheKey = `${url}:${JSON.stringify(fetchOptions)}`;
    const cachedData = cacheRef.current.get(cacheKey);
    
    // Check if cached data is still valid
    if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
      setData(cachedData.data);
      setLoading(false);
      setError(null);
      return;
    }
    
    const abortController = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Cache the result
        cacheRef.current.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      abortController.abort();
    };
  }, [url, JSON.stringify(fetchOptions), cacheTime]);
  
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);
  
  return { data, loading, error, clearCache };
}

// === useFetch with Pagination ===
function useFetchPaginated(baseUrl, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const { pageSize = 10, ...fetchOptions } = options;
  
  const fetchPage = useCallback(async (pageNum) => {
    if (!baseUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `${baseUrl}?page=${pageNum}&limit=${pageSize}`;
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (pageNum === 1) {
        setData(result.data || []);
      } else {
        setData(prev => [...prev, ...(result.data || [])]);
      }
      
      setHasMore(result.hasMore || (result.data && result.data.length === pageSize));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, pageSize, JSON.stringify(fetchOptions)]);
  
  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);
  
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage);
    }
  }, [loading, hasMore, page, fetchPage]);
  
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1);
  }, [fetchPage]);
  
  return { data, loading, error, hasMore, loadMore, reset };
}

// === useFetch with Real-time Updates ===
function useFetchRealTime(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const { interval = 30000, enabled = true, ...fetchOptions } = options; // 30 seconds default
  const intervalRef = useRef();
  
  const fetchData = useCallback(async () => {
    if (!url) return;
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(fetchOptions)]);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    intervalRef.current = setInterval(fetchData, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, enabled]);
  
  const refetch = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, lastUpdated, refetch };
}

// === Demo Components ===
function BasicFetchDemo() {
  const { data, loading, error } = useFetch('https://jsonplaceholder.typicode.com/posts/1');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h3>Basic Fetch Result:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function RetryFetchDemo() {
  const { data, loading, error, retryCount, retry } = useFetchWithRetry(
    'https://jsonplaceholder.typicode.com/posts/2',
    { maxRetries: 3, retryDelay: 1000 }
  );
  
  return (
    <div>
      <h3>Fetch with Retry:</h3>
      {loading && <div>Loading... {retryCount > 0 && `(Retry ${retryCount})`}</div>}
      {error && (
        <div>
          <div>Error: {error}</div>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

function CachedFetchDemo() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/3');
  const { data, loading, error, clearCache } = useFetchWithCache(url, { cacheTime: 10000 });
  
  return (
    <div>
      <h3>Cached Fetch:</h3>
      <div>
        <button onClick={() => setUrl('https://jsonplaceholder.typicode.com/posts/3')}>
          Post 3
        </button>
        <button onClick={() => setUrl('https://jsonplaceholder.typicode.com/posts/4')}>
          Post 4
        </button>
        <button onClick={clearCache}>Clear Cache</button>
      </div>
      
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

function PaginatedDemo() {
  const { data, loading, error, hasMore, loadMore, reset } = useFetchPaginated(
    'https://jsonplaceholder.typicode.com/posts',
    { pageSize: 5 }
  );
  
  return (
    <div>
      <h3>Paginated Fetch:</h3>
      <button onClick={reset}>Reset</button>
      
      {error && <div>Error: {error}</div>}
      
      <div>
        {data.map((item, index) => (
          <div key={item.id || index} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px' }}>
            <h4>{item.title}</h4>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// === Main Demo ===
function UseFetchDemo() {
  const [activeDemo, setActiveDemo] = useState('basic');
  
  const demos = {
    basic: { component: BasicFetchDemo, title: 'Basic Fetch' },
    retry: { component: RetryFetchDemo, title: 'Fetch with Retry' },
    cached: { component: CachedFetchDemo, title: 'Cached Fetch' },
    paginated: { component: PaginatedDemo, title: 'Paginated Fetch' }
  };
  
  const ActiveDemo = demos[activeDemo].component;
  
  return (
    <div className="demo-container">
      <h1>useFetch Hook Examples</h1>
      
      <nav>
        {Object.entries(demos).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => setActiveDemo(key)}
            className={activeDemo === key ? 'active' : ''}
          >
            {title}
          </button>
        ))}
      </nav>
      
      <div className="demo-content">
        <ActiveDemo />
      </div>
    </div>
  );
}

export default UseFetchDemo;
export {
  useFetch,
  useFetchWithRetry,
  useFetchWithCache,
  useFetchPaginated,
  useFetchRealTime
};