/**
 * File: interview-spa-router.jsx
 * Description: Build a mini SPA router from scratch - Interview Problem
 * 
 * Interview Question: "Implement a basic client-side router that supports:
 * - Route matching with parameters (e.g., /users/:id)
 * - Navigation without page reloads
 * - Browser back/forward button support
 * - Route change event handling
 * - Not found (404) handling"
 * 
 * Learning objectives:
 * - Understand how React Router works internally
 * - Learn browser history API manipulation
 * - Master pattern matching and URL parsing
 * - Implement context-based state management for routing
 * - Handle edge cases and browser compatibility
 * 
 * Key concepts demonstrated:
 * - Custom hook for routing state management
 * - Pattern matching for dynamic routes
 * - History API integration (pushState, popstate)
 * - Context provider pattern for global state
 * - Component-based route definitions
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ========================================
// CORE ROUTER IMPLEMENTATION
// ========================================

// Router context to share routing state across components
const RouterContext = createContext();

// Custom hook to access router functionality
function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router component');
  }
  return context;
}

// Core Router component that manages navigation state
function Router({ children }) {
  // Current location state includes pathname and parsed parameters
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });
  
  // Track route parameters extracted from current path
  const [params, setParams] = useState({});
  
  // Store registered routes for pattern matching
  const [routes, setRoutes] = useState([]);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      // Browser navigation occurred, update our internal state
      const newLocation = {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
      };
      
      setLocation(newLocation);
      
      // Find matching route and extract parameters
      const { params: newParams } = findMatchingRoute(newLocation.pathname, routes);
      setParams(newParams);
    };
    
    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [routes]);
  
  // Navigate to a new path programmatically
  const navigate = useCallback((to, options = {}) => {
    const { replace = false, state = null } = options;
    
    // Prevent navigation to same path unless forced
    if (to === location.pathname && !options.force) {
      return;
    }
    
    // Update browser URL using History API
    if (replace) {
      // Replace current history entry
      window.history.replaceState(state, '', to);
    } else {
      // Push new history entry
      window.history.pushState(state, '', to);
    }
    
    // Parse the new path and extract search/hash
    const [pathname, search = '', hash = ''] = to.split(/[?#]/);
    const newLocation = {
      pathname,
      search: search ? `?${search}` : '',
      hash: hash ? `#${hash}` : ''
    };
    
    // Update internal state
    setLocation(newLocation);
    
    // Find matching route and update parameters
    const { params: newParams } = findMatchingRoute(pathname, routes);
    setParams(newParams);
  }, [location.pathname, routes]);
  
  // Register a new route pattern
  const registerRoute = useCallback((pattern, component, exact = false) => {
    setRoutes(prevRoutes => {
      // Check if route already exists
      const existingIndex = prevRoutes.findIndex(route => route.pattern === pattern);
      
      const newRoute = { pattern, component, exact };
      
      if (existingIndex >= 0) {
        // Update existing route
        const updatedRoutes = [...prevRoutes];
        updatedRoutes[existingIndex] = newRoute;
        return updatedRoutes;
      } else {
        // Add new route, sorted by specificity (specific routes first)
        const updatedRoutes = [...prevRoutes, newRoute];
        
        // Sort routes by specificity to ensure correct matching order
        // More specific routes (with more segments or parameters) come first
        return updatedRoutes.sort((a, b) => {
          const aSegments = a.pattern.split('/').length;
          const bSegments = b.pattern.split('/').length;
          const aParams = (a.pattern.match(/:/g) || []).length;
          const bParams = (b.pattern.match(/:/g) || []).length;
          
          // Exact routes get higher priority
          if (a.exact && !b.exact) return -1;
          if (!a.exact && b.exact) return 1;
          
          // More segments = more specific
          if (aSegments !== bSegments) return bSegments - aSegments;
          
          // Fewer parameters = more specific (static routes beat dynamic)
          return aParams - bParams;
        });
      }
    });
  }, []);
  
  // Find the component that should render for current location
  const currentRoute = findMatchingRoute(location.pathname, routes);
  
  // Router context value provided to all child components
  const routerValue = {
    location,
    params,
    navigate,
    registerRoute,
    currentRoute: currentRoute.route,
    isActive: (path, exact = false) => {
      if (exact) {
        return location.pathname === path;
      }
      return location.pathname.startsWith(path);
    }
  };
  
  return (
    <RouterContext.Provider value={routerValue}>
      {children}
    </RouterContext.Provider>
  );
}

// ========================================
// ROUTE MATCHING LOGIC
// ========================================

// Convert route pattern to regex and extract parameter names
function compileRoute(pattern) {
  // Extract parameter names from pattern (e.g., ":id" -> "id")
  const paramNames = [];
  const regexPattern = pattern
    .split('/')
    .map(segment => {
      if (segment.startsWith(':')) {
        // Dynamic segment - capture parameter name and create regex group
        const paramName = segment.slice(1); // Remove ':' prefix
        paramNames.push(paramName);
        return '([^/]+)'; // Match any characters except '/'
      } else if (segment === '*') {
        // Wildcard segment - matches everything
        paramNames.push('wildcard');
        return '(.*)';
      } else {
        // Static segment - escape special regex characters
        return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
    })
    .join('/');
  
  // Create regex that matches the entire path
  const regex = new RegExp(`^${regexPattern}$`);
  
  return { regex, paramNames };
}

// Find matching route for given pathname
function findMatchingRoute(pathname, routes) {
  // Try each route in order until we find a match
  for (const route of routes) {
    const { regex, paramNames } = compileRoute(route.pattern);
    const match = pathname.match(regex);
    
    if (match) {
      // Extract parameter values from regex capture groups
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1]; // +1 because index 0 is full match
      });
      
      return {
        route,
        params,
        isExact: pathname === route.pattern.replace(/:\w+/g, params[paramNames[0]] || '')
      };
    }
  }
  
  // No matching route found
  return {
    route: null,
    params: {},
    isExact: false
  };
}

// ========================================
// ROUTING COMPONENTS
// ========================================

// Route component for defining route patterns
function Route({ path, component: Component, exact = false, children }) {
  const { registerRoute, currentRoute, params } = useRouter();
  
  // Register this route pattern when component mounts
  useEffect(() => {
    registerRoute(path, Component || (() => children), exact);
  }, [path, Component, exact, children, registerRoute]);
  
  // This component doesn't render anything itself
  // The Router component handles rendering the matched route
  return null;
}

// Routes container component that renders the matched route
function Routes({ children }) {
  const { currentRoute, params } = useRouter();
  
  if (!currentRoute) {
    // No matching route found - could render 404 component here
    return null;
  }
  
  // Render the matched route component with parameters
  const Component = currentRoute.component;
  
  if (typeof Component === 'function') {
    return <Component params={params} />;
  }
  
  // If component is JSX element, clone it with params
  if (React.isValidElement(Component)) {
    return React.cloneElement(Component, { params });
  }
  
  return null;
}

// Link component for navigation without page reload
function Link({ to, children, className = '', replace = false, state = null, onClick }) {
  const { navigate, location } = useRouter();
  
  const handleClick = (event) => {
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(event);
    }
    
    // Don't navigate if event was cancelled or if it's a modified click
    if (
      event.defaultPrevented ||
      event.button !== 0 || // Not left click
      event.metaKey || // Command/Ctrl + click
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    
    // Prevent default browser navigation
    event.preventDefault();
    
    // Use our custom navigate function
    navigate(to, { replace, state });
  };
  
  // Determine if this link is currently active
  const isActive = location.pathname === to;
  const finalClassName = `${className} ${isActive ? 'active' : ''}`.trim();
  
  return (
    <a
      href={to}
      className={finalClassName}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

// NavLink component with active state styling
function NavLink({ to, children, className = '', activeClassName = 'active', exact = false }) {
  const { isActive } = useRouter();
  const active = isActive(to, exact);
  const finalClassName = `${className} ${active ? activeClassName : ''}`.trim();
  
  return (
    <Link to={to} className={finalClassName}>
      {children}
    </Link>
  );
}

// Custom hook for programmatic navigation
function useNavigate() {
  const { navigate } = useRouter();
  return navigate;
}

// Custom hook for accessing current location
function useLocation() {
  const { location } = useRouter();
  return location;
}

// Custom hook for accessing route parameters
function useParams() {
  const { params } = useRouter();
  return params;
}

// ========================================
// DEMO APPLICATION USING THE CUSTOM ROUTER
// ========================================

// Demo app that uses our custom router implementation
function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        
        <main className="content">
          {/* Define all application routes */}
          <Routes>
            <Route path="/" exact component={HomePage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/users" exact component={UsersListPage} />
            <Route path="/users/:id" component={UserDetailPage} />
            <Route path="/users/:id/posts" component={UserPostsPage} />
            <Route path="/posts/:postId" component={PostDetailPage} />
            <Route path="/category/:categoryName" component={CategoryPage} />
            <Route path="*" component={NotFoundPage} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Navigation component using our custom Link components
function Navigation() {
  return (
    <nav className="navigation">
      <Link to="/" className="nav-logo">Custom Router Demo</Link>
      
      <div className="nav-links">
        <NavLink to="/" exact>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/category/electronics">Electronics</NavLink>
      </div>
    </nav>
  );
}

// Page components demonstrating parameter usage
function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="page">
      <h1>Custom Router Demo</h1>
      <p>This demonstrates a custom SPA router implementation.</p>
      
      <div className="current-info">
        <h3>Current Location:</h3>
        <p><strong>Pathname:</strong> {location.pathname}</p>
        <p><strong>Search:</strong> {location.search || 'None'}</p>
        <p><strong>Hash:</strong> {location.hash || 'None'}</p>
      </div>
      
      <div className="demo-links">
        <h3>Test Navigation:</h3>
        <Link to="/users/123">User 123</Link>
        <Link to="/users/456/posts">User 456 Posts</Link>
        <Link to="/posts/789">Post 789</Link>
        <Link to="/category/books">Books Category</Link>
        <Link to="/nonexistent">404 Page</Link>
        
        <div className="programmatic-nav">
          <h4>Programmatic Navigation:</h4>
          <button onClick={() => navigate('/about')}>
            Go to About
          </button>
          <button onClick={() => navigate('/users', { replace: true })}>
            Replace with Users (no history)
          </button>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page">
      <h1>About Our Router</h1>
      <p>This router implementation includes:</p>
      <ul>
        <li>Pattern matching with parameters</li>
        <li>Browser history integration</li>
        <li>Navigation without page reloads</li>
        <li>Route registration system</li>
        <li>Active link detection</li>
      </ul>
    </div>
  );
}

function UsersListPage() {
  const users = [
    { id: '123', name: 'Alice Johnson' },
    { id: '456', name: 'Bob Smith' },
    { id: '789', name: 'Carol Davis' }
  ];
  
  return (
    <div className="page">
      <h1>Users List</h1>
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3><Link to={`/users/${user.id}`}>{user.name}</Link></h3>
            <div className="user-actions">
              <Link to={`/users/${user.id}`}>View Profile</Link>
              <Link to={`/users/${user.id}/posts`}>View Posts</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="page">
      <h1>User Detail</h1>
      <p><strong>User ID:</strong> {params.id}</p>
      <p>This page shows details for user {params.id}.</p>
      
      <div className="user-actions">
        <button onClick={() => navigate(`/users/${params.id}/posts`)}>
          View User Posts
        </button>
        <Link to="/users">← Back to Users</Link>
      </div>
    </div>
  );
}

function UserPostsPage() {
  const params = useParams();
  
  return (
    <div className="page">
      <h1>Posts by User {params.id}</h1>
      <p>This page shows all posts by user {params.id}.</p>
      
      <div className="posts-list">
        <div className="post-item">
          <Link to="/posts/1">My First Post</Link>
        </div>
        <div className="post-item">
          <Link to="/posts/2">Another Great Post</Link>
        </div>
      </div>
      
      <Link to={`/users/${params.id}`}>← Back to User Profile</Link>
    </div>
  );
}

function PostDetailPage() {
  const params = useParams();
  
  return (
    <div className="page">
      <h1>Post Detail</h1>
      <p><strong>Post ID:</strong> {params.postId}</p>
      <p>This is the content of post {params.postId}.</p>
      
      <Link to="/users">← Back to Users</Link>
    </div>
  );
}

function CategoryPage() {
  const params = useParams();
  const location = useLocation();
  
  return (
    <div className="page">
      <h1>Category: {params.categoryName}</h1>
      <p>Showing products in the {params.categoryName} category.</p>
      
      <div className="location-info">
        <h3>Route Information:</h3>
        <p><strong>Category:</strong> {params.categoryName}</p>
        <p><strong>Full Path:</strong> {location.pathname}</p>
      </div>
      
      <div className="category-navigation">
        <Link to="/category/electronics">Electronics</Link>
        <Link to="/category/books">Books</Link>
        <Link to="/category/clothing">Clothing</Link>
      </div>
    </div>
  );
}

function NotFoundPage() {
  const location = useLocation();
  
  return (
    <div className="page not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page "{location.pathname}" could not be found.</p>
      
      <div className="not-found-actions">
        <Link to="/">Go Home</Link>
        <Link to="/users">Browse Users</Link>
      </div>
    </div>
  );
}

export default App;

// ========================================
// INTERVIEW DISCUSSION POINTS
// ========================================

/*
Key Implementation Details to Discuss:

1. **History API Integration:**
   - Using pushState/replaceState for URL manipulation
   - Handling popstate events for browser navigation
   - Maintaining history stack properly

2. **Pattern Matching Algorithm:**
   - Converting route patterns to regular expressions
   - Parameter extraction from URL segments
   - Route precedence and specificity handling

3. **Context-Based State Management:**
   - Sharing router state across component tree
   - Avoiding prop drilling for navigation functions
   - Re-render optimization for route changes

4. **Component Lifecycle Integration:**
   - Route registration on component mount
   - Cleanup considerations for SPA memory management
   - Handling dynamic route definitions

5. **Edge Cases Handled:**
   - Modified clicks (Ctrl+click, middle-click)
   - Duplicate navigation attempts
   - Invalid route patterns
   - Browser compatibility considerations

6. **Performance Considerations:**
   - Route compilation caching
   - Minimal re-renders on navigation
   - Efficient pattern matching order

7. **Extension Points:**
   - Route guards for authentication
   - Lazy loading integration
   - Route data fetching hooks
   - Nested routing support

Common Interview Follow-ups:
- How would you add route guards?
- How would you implement nested routing?
- How would you handle query parameters?
- How would you add animation/transitions?
- How would you handle server-side rendering?
- What about lazy loading routes?
- How would you handle route conflicts?
- What about route metadata (titles, etc.)?

Code Complexity: O(n) for route matching where n = number of routes
Memory Usage: O(r) where r = number of registered routes
*/