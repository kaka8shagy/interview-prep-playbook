/**
 * File: practical-patterns.js
 * Description: Real-world module patterns and best practices with extensive explanations
 * 
 * Learning objectives:
 * - Master common module design patterns used in production
 * - Understand module organization and architectural decisions
 * - Learn browser vs Node.js compatibility strategies
 * - See how modern bundlers handle different module patterns
 * 
 * This file consolidates concepts from: module-patterns.js, default-vs-named.js, browser-vs-node.js
 */

console.log('=== Practical Module Patterns ===\n');

// ============================================================================
// PART 1: MODULE DESIGN PATTERNS
// ============================================================================

console.log('--- Common Module Design Patterns ---');

/**
 * PATTERN 1: REVEALING MODULE PATTERN
 * Purpose: Create private scope and expose only what's needed
 * When to use: When you need private variables/functions with selective exposure
 */

const DatabaseManager = (function() {
  // Private variables - not accessible from outside
  // We use closure to create true privacy (pre-private fields)
  let connectionPool = new Map();
  let maxConnections = 10;
  let activeConnections = 0;
  
  // Private helper functions
  function validateConnection(config) {
    // Real validation would check host, port, credentials, etc.
    return config && config.host && config.database;
  }
  
  function createConnection(config) {
    // Simulate connection creation
    // In real app, this would create actual database connection
    if (activeConnections >= maxConnections) {
      throw new Error(`Connection pool exhausted. Max: ${maxConnections}`);
    }
    
    activeConnections++;
    return {
      id: `conn_${Date.now()}_${Math.random()}`,
      config,
      status: 'active',
      createdAt: new Date()
    };
  }
  
  // Public API - only these methods are exposed
  return {
    // We expose methods that internally use private variables
    // This gives us controlled access to the private state
    connect(config) {
      if (!validateConnection(config)) {
        throw new Error('Invalid connection configuration');
      }
      
      const key = `${config.host}:${config.database}`;
      
      // Check if connection already exists (pooling pattern)
      if (connectionPool.has(key)) {
        console.log(`Reusing existing connection for ${key}`);
        return connectionPool.get(key);
      }
      
      // Create new connection
      const connection = createConnection(config);
      connectionPool.set(key, connection);
      
      console.log(`Created new connection: ${connection.id}`);
      return connection;
    },
    
    disconnect(connectionId) {
      // Find and remove connection from pool
      for (const [key, conn] of connectionPool.entries()) {
        if (conn.id === connectionId) {
          connectionPool.delete(key);
          activeConnections--;
          console.log(`Disconnected: ${connectionId}`);
          return true;
        }
      }
      return false;
    },
    
    // Expose read-only access to stats
    getStats() {
      return {
        activeConnections,
        maxConnections,
        poolSize: connectionPool.size
      };
    },
    
    // Configuration method
    setMaxConnections(max) {
      if (max < activeConnections) {
        throw new Error('Cannot set max below current active connections');
      }
      maxConnections = max;
    }
  };
})(); // IIFE (Immediately Invoked Function Expression)

/**
 * PATTERN 2: FACTORY PATTERN FOR MODULES
 * Purpose: Create multiple instances with shared behavior but separate state
 * When to use: When you need multiple instances of similar functionality
 */

function createLogger(namespace = 'default') {
  // Each logger instance has its own state
  // But they all share the same behavior patterns
  const logs = [];
  const startTime = Date.now();
  
  return {
    // Each method has access to this instance's closure variables
    info(message, data = null) {
      const entry = {
        level: 'INFO',
        namespace,
        message,
        data,
        timestamp: Date.now(),
        // Calculate relative time for performance debugging
        relativeTime: Date.now() - startTime
      };
      
      logs.push(entry);
      
      // In production, this would go to actual logging service
      console.log(`[${namespace}] INFO: ${message}`, data || '');
      
      return entry; // Return for chaining or testing
    },
    
    error(message, error = null) {
      const entry = {
        level: 'ERROR',
        namespace,
        message,
        // Extract error details if Error object provided
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        timestamp: Date.now(),
        relativeTime: Date.now() - startTime
      };
      
      logs.push(entry);
      console.error(`[${namespace}] ERROR: ${message}`, error || '');
      
      return entry;
    },
    
    // Utility methods for log management
    getLogs(level = null) {
      if (level) {
        return logs.filter(log => log.level === level.toUpperCase());
      }
      return [...logs]; // Return copy to prevent external mutation
    },
    
    clear() {
      logs.length = 0; // Clear array while maintaining reference
    },
    
    // Method to demonstrate the factory pattern benefit
    getNamespace() {
      return namespace;
    }
  };
}

/**
 * PATTERN 3: SINGLETON PATTERN (Modern Version)
 * Purpose: Ensure only one instance exists across the entire application
 * When to use: For global state, configuration, or shared resources
 */

class ConfigurationManager {
  constructor() {
    // Prevent direct instantiation after first instance
    if (ConfigurationManager.instance) {
      return ConfigurationManager.instance;
    }
    
    // Initialize configuration state
    this.config = new Map();
    this.environment = process?.env?.NODE_ENV || 'development';
    this.initialized = false;
    
    // Store the instance
    ConfigurationManager.instance = this;
    
    // Auto-initialize with defaults
    this.loadDefaults();
  }
  
  loadDefaults() {
    // These would typically come from environment variables or config files
    const defaults = {
      'app.name': 'MyApplication',
      'app.version': '1.0.0',
      'db.maxConnections': 50,
      'api.timeout': 30000,
      'logging.level': 'info'
    };
    
    // Load defaults into configuration
    Object.entries(defaults).forEach(([key, value]) => {
      this.config.set(key, value);
    });
    
    this.initialized = true;
    console.log(`Configuration initialized for ${this.environment} environment`);
  }
  
  get(key, defaultValue = null) {
    // Dot notation support: 'db.maxConnections'
    if (!this.config.has(key)) {
      if (defaultValue !== null) {
        return defaultValue;
      }
      throw new Error(`Configuration key '${key}' not found`);
    }
    
    return this.config.get(key);
  }
  
  set(key, value) {
    const oldValue = this.config.get(key);
    this.config.set(key, value);
    
    // Log configuration changes for debugging
    console.log(`Config updated: ${key} = ${value} (was: ${oldValue})`);
  }
  
  // Method to get all config for debugging
  getAll() {
    return Object.fromEntries(this.config.entries());
  }
  
  // Static method to get singleton instance
  static getInstance() {
    if (!ConfigurationManager.instance) {
      new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }
}

// ============================================================================
// PART 2: EXPORT STRATEGIES AND BEST PRACTICES
// ============================================================================

console.log('\n--- Export Strategy Patterns ---');

/**
 * STRATEGY 1: NAMED EXPORTS FOR UTILITIES
 * Best for: Utility functions, constants, multiple related functions
 * Benefit: Tree shaking friendly, clear about what's being imported
 */

// Utility functions that work well as named exports
export function formatCurrency(amount, currency = 'USD') {
  // We use Intl.NumberFormat for proper internationalization
  // This handles locale-specific formatting automatically
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function debounce(func, delay) {
  // Debouncing is crucial for performance in UI applications
  // This prevents excessive function calls during rapid events
  let timeoutId;
  
  return function debounced(...args) {
    // Clear any existing timeout to reset the delay
    clearTimeout(timeoutId);
    
    // Set new timeout - function only executes after delay period
    timeoutId = setTimeout(() => {
      func.apply(this, args); // Preserve 'this' context and arguments
    }, delay);
  };
}

export function throttle(func, limit) {
  // Throttling limits function execution to once per time period
  // Different from debouncing - ensures function runs periodically
  let inThrottle;
  
  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      // Reset throttle after time limit
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Constants that are commonly imported
export const COMMON_DELAYS = {
  DEBOUNCE_SEARCH: 300,    // Good for search input
  DEBOUNCE_RESIZE: 100,    // Good for window resize
  THROTTLE_SCROLL: 16,     // ~60fps for scroll events
  API_TIMEOUT: 5000        // 5 second API timeout
};

/**
 * STRATEGY 2: DEFAULT EXPORT FOR MAIN CLASS/COMPONENT
 * Best for: Primary export that represents the module's main purpose
 * Benefit: Clean import syntax, clear "main thing" designation
 */

class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout || COMMON_DELAYS.API_TIMEOUT;
    
    // Create default headers with common settings
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers // Allow override of defaults
    };
    
    // Initialize request interceptors array
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    
    console.log(`API Client initialized for ${this.baseURL}`);
  }
  
  // Method to add request interceptor
  addRequestInterceptor(interceptor) {
    // Interceptors allow modification of requests before sending
    // Common use: Adding auth tokens, request IDs, etc.
    this.requestInterceptors.push(interceptor);
  }
  
  async request(endpoint, options = {}) {
    // Build the full URL
    const url = `${this.baseURL}${endpoint}`;
    
    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers
    };
    
    // Build request configuration
    let requestConfig = {
      method: options.method || 'GET',
      headers,
      ...options
    };
    
    // Apply request interceptors
    // Each interceptor can modify the request config
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }
    
    try {
      // Add timeout support using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle non-successful responses
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      
      // Apply response interceptors
      let finalData = data;
      for (const interceptor of this.responseInterceptors) {
        finalData = await interceptor(finalData, response);
      }
      
      return finalData;
      
    } catch (error) {
      // Handle different types of errors appropriately
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      
      // Re-throw other errors with context
      throw new Error(`API Request failed: ${error.message}`);
    }
  }
  
  // Convenience methods for common HTTP verbs
  get(endpoint, params = {}) {
    // Convert params to query string
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(fullEndpoint, { method: 'GET' });
  }
  
  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Export as default - this is the main thing this module provides
export default APIClient;

// ============================================================================
// PART 3: CROSS-ENVIRONMENT COMPATIBILITY
// ============================================================================

console.log('\n--- Browser vs Node.js Compatibility ---');

/**
 * ENVIRONMENT DETECTION AND ADAPTATION
 * Challenge: Code that works in both browser and Node.js environments
 * Solution: Feature detection and polyfills
 */

// Detect environment safely
export const Environment = {
  // Check if we're in Node.js
  isNode: typeof process !== 'undefined' && 
          process.versions && 
          process.versions.node,
  
  // Check if we're in browser
  isBrowser: typeof window !== 'undefined' && 
             typeof window.document !== 'undefined',
  
  // Check if we're in Web Worker
  isWebWorker: typeof self !== 'undefined' && 
               typeof window === 'undefined',
  
  // Get appropriate global object
  getGlobal() {
    // This pattern works across all JavaScript environments
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    if (typeof self !== 'undefined') return self;
    throw new Error('Unable to locate global object');
  }
};

/**
 * UNIVERSAL FETCH IMPLEMENTATION
 * Challenge: fetch() is not available in older Node.js versions
 * Solution: Conditional loading with fallback
 */

let universalFetch;

if (Environment.isBrowser) {
  // Use native fetch in browser
  universalFetch = fetch.bind(window);
} else if (Environment.isNode) {
  // In Node.js, we need to import a fetch polyfill
  // This would typically be 'node-fetch' or similar
  try {
    // Dynamic import for Node.js compatibility
    // In real code, you'd install and import 'node-fetch'
    universalFetch = async (url, options) => {
      throw new Error('Install node-fetch for Node.js fetch support');
    };
  } catch (error) {
    universalFetch = () => {
      throw new Error('Fetch not available in this environment');
    };
  }
}

/**
 * STORAGE ABSTRACTION PATTERN
 * Challenge: localStorage only exists in browsers
 * Solution: Abstract interface with environment-specific implementations
 */

export class StorageAdapter {
  constructor() {
    if (Environment.isBrowser && typeof localStorage !== 'undefined') {
      this.storage = localStorage;
      this.type = 'localStorage';
    } else {
      // Fallback to in-memory storage for Node.js or unsupported browsers
      this.storage = new Map();
      this.type = 'memory';
      console.warn('Using in-memory storage fallback');
    }
  }
  
  setItem(key, value) {
    if (this.type === 'localStorage') {
      // localStorage only accepts strings
      this.storage.setItem(key, JSON.stringify(value));
    } else {
      // Map can store any value type
      this.storage.set(key, value);
    }
  }
  
  getItem(key) {
    if (this.type === 'localStorage') {
      const value = this.storage.getItem(key);
      try {
        // Try to parse JSON, fall back to string if invalid
        return value ? JSON.parse(value) : null;
      } catch {
        return value;
      }
    } else {
      return this.storage.get(key) || null;
    }
  }
  
  removeItem(key) {
    if (this.type === 'localStorage') {
      this.storage.removeItem(key);
    } else {
      this.storage.delete(key);
    }
  }
  
  clear() {
    if (this.type === 'localStorage') {
      this.storage.clear();
    } else {
      this.storage.clear();
    }
  }
  
  // Utility method to get storage stats
  getInfo() {
    return {
      type: this.type,
      supported: this.type !== 'memory',
      size: this.type === 'localStorage' ? 
            this.storage.length : 
            this.storage.size
    };
  }
}

// ============================================================================
// PART 4: MODULE INITIALIZATION PATTERNS
// ============================================================================

console.log('\n--- Module Initialization Patterns ---');

/**
 * LAZY INITIALIZATION PATTERN
 * Purpose: Defer expensive operations until actually needed
 * Benefit: Faster application startup time
 */

export class LazyImageProcessor {
  constructor() {
    // Don't initialize expensive resources immediately
    this._canvas = null;
    this._context = null;
    this._initialized = false;
  }
  
  _initialize() {
    // Only initialize when first method is called
    if (this._initialized) return;
    
    console.log('Initializing image processor...');
    
    if (Environment.isBrowser) {
      this._canvas = document.createElement('canvas');
      this._context = this._canvas.getContext('2d');
    } else {
      // In Node.js, you might use 'canvas' npm package
      console.warn('Image processing limited in Node.js environment');
    }
    
    this._initialized = true;
  }
  
  processImage(imageData) {
    // Initialize on first use
    this._initialize();
    
    if (!this._context) {
      throw new Error('Image processing not available in this environment');
    }
    
    // Simulate image processing
    console.log('Processing image...');
    return { processed: true, timestamp: Date.now() };
  }
}

/**
 * SUMMARY OF PRACTICAL PATTERNS:
 * 
 * 1. Revealing Module: Use closures for private state with public API
 * 2. Factory: Create multiple instances with shared behavior
 * 3. Singleton: Ensure single instance for global state
 * 4. Named Exports: For utilities and tree-shaking
 * 5. Default Export: For main class/component  
 * 6. Environment Detection: Handle browser/Node.js differences
 * 7. Lazy Initialization: Defer expensive setup until needed
 * 
 * Choose patterns based on:
 * - Need for privacy vs. transparency
 * - Single vs. multiple instances
 * - Tree shaking requirements
 * - Cross-environment compatibility
 * - Performance considerations
 */

// Export the singleton instance for immediate use
export const config = ConfigurationManager.getInstance();
export const dbManager = DatabaseManager;

// Export factory functions
export { createLogger };

console.log('\nPractical patterns demonstration complete!');
console.log('Next: See interview-problems.js for common interview scenarios');