/**
 * File: interview-hoc-loader.jsx
 * Description: Interview question - Build reusable HOC for loading states and error handling
 * Tests advanced HOC composition, error boundaries, and state management
 */

import React, { useState, useEffect } from 'react';

// === INTERVIEW QUESTION ===
// Build a Higher-Order Component that:
// 1. Shows loading state while data is being fetched
// 2. Handles errors gracefully with retry functionality  
// 3. Provides caching mechanism
// 4. Supports timeout handling
// 5. Can be composed with other HOCs

// === Advanced Loading HOC Implementation ===

function withAsyncLoader(config = {}) {
  const {
    loadingComponent: LoadingComponent = DefaultLoadingComponent,
    errorComponent: ErrorComponent = DefaultErrorComponent,
    emptyComponent: EmptyComponent = DefaultEmptyComponent,
    cacheKey = null,
    timeout = 10000,
    retryAttempts = 3,
    retryDelay = 1000
  } = config;
  
  return function(WrappedComponent) {
    function AsyncLoaderHOC(props) {
      const [state, setState] = useState({
        loading: false,
        error: null,
        data: null,
        isEmpty: false,
        retryCount: 0
      });
      
      // Simple cache implementation
      const cache = React.useRef(new Map());
      
      const fetchData = React.useCallback(async () => {
        // Check cache first
        if (cacheKey && cache.current.has(cacheKey)) {
          const cachedData = cache.current.get(cacheKey);
          setState(prev => ({ ...prev, data: cachedData, loading: false }));
          return;
        }
        
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
          // Create timeout promise
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          );
          
          // Race between actual fetch and timeout
          let data;
          if (props.fetchData) {
            data = await Promise.race([props.fetchData(), timeoutPromise]);
          } else {
            throw new Error('No fetchData function provided');
          }
          
          // Cache the result
          if (cacheKey) {
            cache.current.set(cacheKey, data);
          }
          
          // Check if data is empty
          const isEmpty = !data || 
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === 'object' && Object.keys(data).length === 0);
          
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            data, 
            isEmpty,
            error: null,
            retryCount: 0
          }));
          
        } catch (error) {
          console.error('Data fetching error:', error);
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: error.message,
            retryCount: prev.retryCount + 1
          }));
        }
      }, [props.fetchData, cacheKey, timeout]);
      
      const retry = React.useCallback(async () => {
        if (state.retryCount < retryAttempts) {
          // Exponential backoff delay
          const delay = retryDelay * Math.pow(2, state.retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          fetchData();
        }
      }, [fetchData, state.retryCount, retryAttempts, retryDelay]);
      
      const clearCache = React.useCallback(() => {
        if (cacheKey) {
          cache.current.delete(cacheKey);
        }
      }, [cacheKey]);
      
      const refetch = React.useCallback(() => {
        clearCache();
        setState(prev => ({ ...prev, retryCount: 0 }));
        fetchData();
      }, [fetchData, clearCache]);
      
      // Initial data fetch
      React.useEffect(() => {
        if (props.autoLoad !== false) {
          fetchData();
        }
      }, [fetchData]);
      
      // Loading state
      if (state.loading) {
        return <LoadingComponent {...props} />;
      }
      
      // Error state
      if (state.error) {
        return (
          <ErrorComponent
            {...props}
            error={state.error}
            retry={retry}
            refetch={refetch}
            retryCount={state.retryCount}
            canRetry={state.retryCount < retryAttempts}
          />
        );
      }
      
      // Empty state
      if (state.isEmpty && EmptyComponent) {
        return <EmptyComponent {...props} refetch={refetch} />;
      }
      
      // Success state - render wrapped component with data
      return (
        <WrappedComponent
          {...props}
          data={state.data}
          refetch={refetch}
          clearCache={clearCache}
          loading={state.loading}
          error={state.error}
        />
      );
    }
    
    AsyncLoaderHOC.displayName = `withAsyncLoader(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return AsyncLoaderHOC;
  };
}

// === Default Components ===

function DefaultLoadingComponent({ loadingMessage = 'Loading...' }) {
  return (
    <div className="async-loader-loading">
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
      <p>{loadingMessage}</p>
    </div>
  );
}

function DefaultErrorComponent({ 
  error, 
  retry, 
  refetch, 
  retryCount, 
  canRetry,
  errorTitle = 'Something went wrong'
}) {
  return (
    <div className="async-loader-error">
      <h3>{errorTitle}</h3>
      <p className="error-message">{error}</p>
      {retryCount > 0 && (
        <p className="retry-info">Retry attempt: {retryCount}</p>
      )}
      <div className="error-actions">
        {canRetry && (
          <button onClick={retry} className="retry-button">
            Retry ({retryCount + 1})
          </button>
        )}
        <button onClick={refetch} className="refetch-button">
          Refresh
        </button>
      </div>
    </div>
  );
}

function DefaultEmptyComponent({ emptyMessage = 'No data available', refetch }) {
  return (
    <div className="async-loader-empty">
      <p>{emptyMessage}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

// === Custom Loading Components ===

function SkeletonLoader({ rows = 3 }) {
  return (
    <div className="skeleton-loader">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton-row">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line-title"></div>
            <div className="skeleton-line skeleton-line-subtitle"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressLoader({ progress = 0, message = 'Loading...' }) {
  return (
    <div className="progress-loader">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p>{message} ({Math.round(progress)}%)</p>
    </div>
  );
}

// === Usage Examples ===

// Basic component that will be enhanced
function UserList({ data = [], onUserClick }) {
  return (
    <div className="user-list">
      <h2>Users</h2>
      {data.map(user => (
        <div 
          key={user.id} 
          className="user-item"
          onClick={() => onUserClick?.(user)}
        >
          <img src={user.avatar} alt={user.name} className="user-avatar" />
          <div className="user-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>{user.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced component with async loading
const AsyncUserList = withAsyncLoader({
  loadingComponent: () => <SkeletonLoader rows={5} />,
  errorComponent: (props) => (
    <DefaultErrorComponent 
      {...props} 
      errorTitle="Failed to load users"
    />
  ),
  emptyComponent: (props) => (
    <DefaultEmptyComponent 
      {...props}
      emptyMessage="No users found"
    />
  ),
  cacheKey: 'users-list',
  timeout: 5000,
  retryAttempts: 3
})(UserList);

// Product list with different configuration
function ProductList({ data = [], onProductClick }) {
  return (
    <div className="product-list">
      <h2>Products</h2>
      <div className="product-grid">
        {data.map(product => (
          <div 
            key={product.id} 
            className="product-card"
            onClick={() => onProductClick?.(product)}
          >
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const AsyncProductList = withAsyncLoader({
  loadingComponent: () => <ProgressLoader progress={75} message="Loading products" />,
  cacheKey: 'products-list',
  timeout: 8000
})(ProductList);

// === HOC Composition Example ===

// Additional HOC for analytics
function withAnalytics(WrappedComponent) {
  function AnalyticsComponent(props) {
    React.useEffect(() => {
      console.log(`Component ${WrappedComponent.name} mounted`);
      // Track component usage
    }, []);
    
    return <WrappedComponent {...props} />;
  }
  
  AnalyticsComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AnalyticsComponent;
}

// Composed HOC
const EnhancedUserList = withAnalytics(
  withAsyncLoader({
    loadingComponent: SkeletonLoader,
    cacheKey: 'enhanced-users'
  })(UserList)
);

// === Demo Component ===
function AsyncLoaderDemo() {
  // Mock data fetching functions
  const fetchUsers = React.useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random failure
    if (Math.random() < 0.3) {
      throw new Error('Failed to fetch users from server');
    }
    
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer', avatar: '/avatar1.jpg' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer', avatar: '/avatar2.jpg' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', avatar: '/avatar3.jpg' }
    ];
  }, []);
  
  const fetchProducts = React.useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return [
      { id: 1, name: 'Laptop', price: 999, image: '/laptop.jpg' },
      { id: 2, name: 'Phone', price: 699, image: '/phone.jpg' },
      { id: 3, name: 'Tablet', price: 399, image: '/tablet.jpg' }
    ];
  }, []);
  
  const fetchEmptyData = React.useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [];
  }, []);
  
  return (
    <div className="async-loader-demo">
      <h1>Async Loader HOC Demo</h1>
      
      <section>
        <h2>User List with Skeleton Loading</h2>
        <AsyncUserList
          fetchData={fetchUsers}
          onUserClick={(user) => console.log('User clicked:', user)}
        />
      </section>
      
      <section>
        <h2>Product List with Progress Loading</h2>
        <AsyncProductList
          fetchData={fetchProducts}
          onProductClick={(product) => console.log('Product clicked:', product)}
        />
      </section>
      
      <section>
        <h2>Empty State Example</h2>
        <AsyncUserList
          fetchData={fetchEmptyData}
          onUserClick={(user) => console.log('User clicked:', user)}
        />
      </section>
      
      <section>
        <h2>Enhanced with Multiple HOCs</h2>
        <EnhancedUserList
          fetchData={fetchUsers}
          onUserClick={(user) => console.log('Enhanced user clicked:', user)}
        />
      </section>
    </div>
  );
}

// === Testing Utilities ===

// Helper for testing HOCs
function createMockAsyncComponent(delay = 1000, shouldFail = false) {
  return function MockComponent({ fetchData, data, ...props }) {
    if (!data) return null;
    
    return (
      <div {...props}>
        Mock Component with data: {JSON.stringify(data, null, 2)}
      </div>
    );
  };
}

const TestAsyncComponent = withAsyncLoader({
  timeout: 2000,
  retryAttempts: 2
})(createMockAsyncComponent());

export default AsyncLoaderDemo;
export {
  withAsyncLoader,
  DefaultLoadingComponent,
  DefaultErrorComponent,
  DefaultEmptyComponent,
  SkeletonLoader,
  ProgressLoader,
  AsyncUserList,
  AsyncProductList,
  EnhancedUserList,
  withAnalytics,
  createMockAsyncComponent,
  TestAsyncComponent
};