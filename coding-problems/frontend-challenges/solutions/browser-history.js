/**
 * File: browser-history.js
 * Description: Custom browser history API implementation with routing and state management
 * 
 * Learning objectives:
 * - Understand browser history and navigation concepts
 * - Learn URL parsing and route matching
 * - Implement client-side routing mechanisms
 * 
 * Time Complexity: O(1) for navigation, O(n) for route matching
 * Space Complexity: O(n) where n is history entries + routes
 */

// =======================
// Approach 1: Basic History Manager
// =======================

/**
 * Basic history management with forward/back navigation
 * Mimics browser history behavior with stack-based approach
 * 
 * Mental model: Think of this as a stack of history entries
 * with a pointer to current position
 */
class BasicHistoryManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.listeners = new Set();
  }
  
  /**
   * Navigate to a new location
   * Adds entry to history and updates current position
   */
  push(path, state = null) {
    // Remove any entries after current position (forward history is discarded)
    // This mimics browser behavior when navigating to new page from middle of history
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Create new history entry
    const entry = {
      path: this.normalizePath(path),
      state: state ? JSON.parse(JSON.stringify(state)) : null, // Deep clone state
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    // Add to history and update position
    this.history.push(entry);
    this.currentIndex++;
    
    // Notify listeners of navigation
    this.notifyListeners('push', entry);
    
    return entry.id;
  }
  
  /**
   * Replace current history entry
   * Updates current entry without changing history length
   */
  replace(path, state = null) {
    if (this.currentIndex >= 0) {
      const entry = {
        path: this.normalizePath(path),
        state: state ? JSON.parse(JSON.stringify(state)) : null,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      this.history[this.currentIndex] = entry;
      this.notifyListeners('replace', entry);
      
      return entry.id;
    }
    
    return this.push(path, state);
  }
  
  /**
   * Go back in history
   * Returns false if cannot go back
   */
  back() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const entry = this.history[this.currentIndex];
      this.notifyListeners('back', entry);
      return true;
    }
    return false;
  }
  
  /**
   * Go forward in history
   * Returns false if cannot go forward
   */
  forward() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const entry = this.history[this.currentIndex];
      this.notifyListeners('forward', entry);
      return true;
    }
    return false;
  }
  
  /**
   * Go to specific history index
   * Delta can be positive (forward) or negative (back)
   */
  go(delta) {
    const newIndex = this.currentIndex + delta;
    
    if (newIndex >= 0 && newIndex < this.history.length) {
      this.currentIndex = newIndex;
      const entry = this.history[this.currentIndex];
      this.notifyListeners('go', entry, delta);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get current history entry
   */
  getCurrentEntry() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return { ...this.history[this.currentIndex] };
    }
    return null;
  }
  
  /**
   * Get current path
   */
  getCurrentPath() {
    const entry = this.getCurrentEntry();
    return entry ? entry.path : '/';
  }
  
  /**
   * Get current state
   */
  getCurrentState() {
    const entry = this.getCurrentEntry();
    return entry && entry.state ? JSON.parse(JSON.stringify(entry.state)) : null;
  }
  
  /**
   * Add navigation listener
   */
  listen(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners of navigation changes
   */
  notifyListeners(action, entry, ...args) {
    for (const listener of this.listeners) {
      try {
        listener({
          action,
          location: {
            path: entry.path,
            state: entry.state,
            id: entry.id
          },
          ...args
        });
      } catch (error) {
        console.error('History listener error:', error);
      }
    }
  }
  
  /**
   * Normalize path to ensure consistent format
   */
  normalizePath(path) {
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Remove trailing slash except for root
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    return path;
  }
  
  /**
   * Get history statistics
   */
  getStats() {
    return {
      length: this.history.length,
      currentIndex: this.currentIndex,
      canGoBack: this.currentIndex > 0,
      canGoForward: this.currentIndex < this.history.length - 1,
      currentPath: this.getCurrentPath()
    };
  }
  
  /**
   * Clear history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.notifyListeners('clear', null);
  }
}

// =======================
// Approach 2: Router with Pattern Matching
// =======================

/**
 * Advanced router with URL pattern matching and parameter extraction
 * Supports dynamic routes, query parameters, and route guards
 */
class Router {
  constructor(options = {}) {
    this.routes = new Map();
    this.history = new BasicHistoryManager();
    this.currentRoute = null;
    this.baseURL = options.baseURL || '';
    this.mode = options.mode || 'history'; // 'history' or 'hash'
    this.guards = {
      before: [],
      after: []
    };
    
    // Listen to history changes
    this.history.listen(({ location, action }) => {
      this.handleNavigation(location.path, location.state, action);
    });
    
    // Listen to browser events if available
    if (typeof window !== 'undefined') {
      this.setupBrowserIntegration();
    }
  }
  
  /**
   * Register a route with pattern and handler
   */
  route(pattern, handler, options = {}) {
    const {
      name = null,
      guards = [],
      metadata = {}
    } = options;
    
    const route = {
      pattern: this.normalizePattern(pattern),
      handler,
      name,
      guards: Array.isArray(guards) ? guards : [guards],
      metadata,
      regex: this.patternToRegex(pattern),
      paramNames: this.extractParamNames(pattern)
    };
    
    this.routes.set(pattern, route);
    
    return this;
  }
  
  /**
   * Navigate to a path
   */
  push(path, state = null) {
    return this.history.push(path, state);
  }
  
  /**
   * Replace current location
   */
  replace(path, state = null) {
    return this.history.replace(path, state);
  }
  
  /**
   * Navigate back
   */
  back() {
    return this.history.back();
  }
  
  /**
   * Navigate forward
   */
  forward() {
    return this.history.forward();
  }
  
  /**
   * Handle navigation to specific path
   */
  async handleNavigation(path, state = null, action = 'push') {
    const previousRoute = this.currentRoute;
    
    // Parse URL and find matching route
    const { pathname, search, hash } = this.parseURL(path);
    const matchedRoute = this.findRoute(pathname);
    
    if (!matchedRoute) {
      console.warn(`No route found for path: ${pathname}`);
      return false;
    }
    
    // Extract route parameters
    const params = this.extractParams(matchedRoute, pathname);
    const query = this.parseQuery(search);
    
    // Create route context
    const routeContext = {
      path: pathname,
      fullPath: path,
      params,
      query,
      hash,
      state,
      route: matchedRoute,
      previous: previousRoute,
      action
    };
    
    try {
      // Run before guards
      const canNavigate = await this.runGuards('before', routeContext);
      if (!canNavigate) {
        console.log('Navigation blocked by guard');
        return false;
      }
      
      // Execute route handler
      await this.executeRoute(routeContext);
      
      // Update current route
      this.currentRoute = routeContext;
      
      // Run after guards
      await this.runGuards('after', routeContext);
      
      return true;
      
    } catch (error) {
      console.error('Navigation error:', error);
      return false;
    }
  }
  
  /**
   * Find route that matches the given path
   */
  findRoute(path) {
    for (const route of this.routes.values()) {
      if (route.regex.test(path)) {
        return route;
      }
    }
    return null;
  }
  
  /**
   * Convert route pattern to regex for matching
   */
  patternToRegex(pattern) {
    // Convert route parameters like :id to regex groups
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')  // :param -> ([^/]+)  
      .replace(/\*/g, '(.*)');        // * -> (.*)
    
    return new RegExp(`^${regexPattern}$`);
  }
  
  /**
   * Extract parameter names from route pattern
   */
  extractParamNames(pattern) {
    const matches = pattern.match(/:[^/]+/g) || [];
    return matches.map(match => match.slice(1)); // Remove : prefix
  }
  
  /**
   * Extract parameter values from matched route
   */
  extractParams(route, path) {
    const match = path.match(route.regex);
    const params = {};
    
    if (match && route.paramNames.length > 0) {
      route.paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
    }
    
    return params;
  }
  
  /**
   * Parse URL into components
   */
  parseURL(url) {
    const [pathname, searchAndHash = ''] = url.split('?');
    const [search = '', hash = ''] = searchAndHash.split('#');
    
    return {
      pathname: pathname || '/',
      search: search ? '?' + search : '',
      hash: hash ? '#' + hash : ''
    };
  }
  
  /**
   * Parse query string into object
   */
  parseQuery(search) {
    if (!search || search === '?') return {};
    
    const query = {};
    const queryString = search.startsWith('?') ? search.slice(1) : search;
    
    queryString.split('&').forEach(param => {
      const [key, value = ''] = param.split('=');
      if (key) {
        query[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    
    return query;
  }
  
  /**
   * Execute route handler with context
   */
  async executeRoute(context) {
    if (typeof context.route.handler === 'function') {
      await context.route.handler(context);
    }
  }
  
  /**
   * Run navigation guards
   */
  async runGuards(type, context) {
    const guards = [...this.guards[type], ...context.route.guards];
    
    for (const guard of guards) {
      if (typeof guard === 'function') {
        try {
          const result = await guard(context);
          if (result === false) {
            return false;
          }
        } catch (error) {
          console.error(`Guard error:`, error);
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Add global navigation guard
   */
  beforeEach(guard) {
    this.guards.before.push(guard);
    return this;
  }
  
  /**
   * Add global after guard
   */
  afterEach(guard) {
    this.guards.after.push(guard);
    return this;
  }
  
  /**
   * Normalize route pattern
   */
  normalizePattern(pattern) {
    if (!pattern.startsWith('/')) {
      pattern = '/' + pattern;
    }
    return pattern;
  }
  
  /**
   * Setup browser history integration
   */
  setupBrowserIntegration() {
    // Handle popstate events (back/forward buttons)
    window.addEventListener('popstate', (event) => {
      const path = this.mode === 'hash' ? 
        window.location.hash.slice(1) || '/' : 
        window.location.pathname;
      
      this.handleNavigation(path, event.state, 'pop');
    });
    
    // Handle hash changes in hash mode
    if (this.mode === 'hash') {
      window.addEventListener('hashchange', () => {
        const path = window.location.hash.slice(1) || '/';
        this.handleNavigation(path, null, 'hash');
      });
    }
  }
  
  /**
   * Get current route information
   */
  getCurrentRoute() {
    return this.currentRoute ? { ...this.currentRoute } : null;
  }
  
  /**
   * Get route by name
   */
  getRouteByName(name) {
    for (const route of this.routes.values()) {
      if (route.name === name) {
        return route;
      }
    }
    return null;
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic History Manager ===');

const history = new BasicHistoryManager();

// Listen to navigation changes
const unlisten = history.listen((event) => {
  console.log(`Navigation: ${event.action} to ${event.location.path}`);
});

// Test navigation
history.push('/home');
history.push('/about');
history.push('/contact');

console.log('Current path:', history.getCurrentPath());
console.log('Can go back:', history.getStats().canGoBack);

// Navigate back
history.back();
console.log('After back:', history.getCurrentPath());

// Navigate forward
history.forward();
console.log('After forward:', history.getCurrentPath());

console.log('\n=== Router with Pattern Matching ===');

const router = new Router();

// Define routes
router
  .route('/', (context) => {
    console.log('Home route:', context.path);
  })
  .route('/users/:id', (context) => {
    console.log('User route:', context.params.id);
  })
  .route('/posts/:id/comments/:commentId', (context) => {
    console.log('Comment route:', context.params);
  })
  .route('/search', (context) => {
    console.log('Search route with query:', context.query);
  });

// Add global guard
router.beforeEach((context) => {
  console.log(`Navigating to: ${context.path}`);
  return true; // Allow navigation
});

// Test route navigation
router.push('/');
router.push('/users/123');
router.push('/posts/456/comments/789');
router.push('/search?q=javascript&type=posts');

// Export all implementations
module.exports = {
  BasicHistoryManager,
  Router
};

/**
 * Key Interview Points:
 * 
 * 1. History Management:
 *    - Browser history stack behavior
 *    - Push vs replace operations
 *    - Handling browser back/forward buttons
 *    - State preservation across navigation
 * 
 * 2. URL Pattern Matching:
 *    - Regular expressions for route patterns
 *    - Parameter extraction from URLs
 *    - Query string parsing
 *    - Wildcard and dynamic routes
 * 
 * 3. Navigation Guards:
 *    - Authentication and authorization
 *    - Route-level and global guards
 *    - Async guard execution
 *    - Navigation cancellation
 * 
 * 4. State Synchronization:
 *    - Keeping application state in sync with URL
 *    - Browser history API integration
 *    - Hash vs history mode differences
 *    - Memory management for large applications
 * 
 * 5. Real-world Considerations:
 *    - SEO implications of client-side routing
 *    - Browser compatibility (hash vs history mode)
 *    - Error handling and fallback routes
 *    - Performance optimization for large route tables
 */