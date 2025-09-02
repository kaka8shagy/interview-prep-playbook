/**
 * File: event-emitter.js
 * Description: Multiple implementations of EventEmitter pattern
 * 
 * Learning objectives:
 * - Understand observer pattern implementation
 * - Learn event-driven architecture patterns
 * - See memory management and performance optimizations
 * 
 * Time Complexity: O(n) for emit where n is number of listeners
 * Space Complexity: O(n) for storing listeners
 */

// =======================
// Approach 1: Basic EventEmitter
// =======================

/**
 * Basic EventEmitter implementation
 * Core functionality: on, off, emit
 * 
 * Mental model: Publisher-subscriber pattern where objects can subscribe
 * to events and be notified when those events are published
 */
class BasicEventEmitter {
  constructor() {
    // Map to store event listeners: eventName -> array of listener functions
    this.events = new Map();
  }
  
  // Add event listener
  on(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    // Get existing listeners or create new array
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    this.events.get(eventName).push(listener);
    return this; // Enable method chaining
  }
  
  // Remove event listener
  off(eventName, listener) {
    if (!this.events.has(eventName)) {
      return this;
    }
    
    const listeners = this.events.get(eventName);
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      // Clean up empty arrays
      if (listeners.length === 0) {
        this.events.delete(eventName);
      }
    }
    
    return this;
  }
  
  // Emit event to all listeners
  emit(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false; // No listeners
    }
    
    const listeners = this.events.get(eventName);
    
    // Call each listener with provided arguments
    // Use slice() to avoid issues if listeners modify the array during iteration
    listeners.slice().forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        // In production, you might want to emit an 'error' event instead
        console.error('Error in event listener:', error);
      }
    });
    
    return true; // Had listeners
  }
  
  // Get listener count for an event
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }
  
  // Get all event names
  eventNames() {
    return Array.from(this.events.keys());
  }
  
  // Remove all listeners
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
    return this;
  }
}

// =======================
// Approach 2: Enhanced EventEmitter with Advanced Features
// =======================

/**
 * Enhanced EventEmitter with once(), prepend(), and error handling
 */
class EnhancedEventEmitter extends BasicEventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      maxListeners: 10,
      captureRejections: false,
      ...options
    };
    this.onceWrappers = new WeakMap(); // Track once wrappers for removal
  }
  
  // Add one-time listener that removes itself after first call
  once(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    // Create wrapper that removes itself after execution
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      listener.apply(this, args);
    };
    
    // Store reference for potential removal
    this.onceWrappers.set(listener, onceWrapper);
    
    return this.on(eventName, onceWrapper);
  }
  
  // Add listener to beginning of listeners array
  prependListener(eventName, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }
    
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    this.events.get(eventName).unshift(listener);
    this.checkMaxListeners(eventName);
    return this;
  }
  
  // Add one-time listener to beginning
  prependOnceListener(eventName, listener) {
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      listener.apply(this, args);
    };
    
    this.onceWrappers.set(listener, onceWrapper);
    return this.prependListener(eventName, onceWrapper);
  }
  
  // Enhanced off method that handles once wrappers
  off(eventName, listener) {
    // Check if this is a once wrapper
    if (this.onceWrappers.has(listener)) {
      const wrapper = this.onceWrappers.get(listener);
      this.onceWrappers.delete(listener);
      return super.off(eventName, wrapper);
    }
    
    return super.off(eventName, listener);
  }
  
  // Enhanced emit with error handling
  emit(eventName, ...args) {
    // Special handling for 'error' events
    if (eventName === 'error' && !this.events.has('error')) {
      if (args[0] instanceof Error) {
        throw args[0]; // Throw the error if no listeners
      } else {
        throw new Error('Unhandled error event');
      }
    }
    
    if (!this.events.has(eventName)) {
      return false;
    }
    
    const listeners = this.events.get(eventName);
    
    // Handle async errors if captureRejections is enabled
    listeners.slice().forEach(listener => {
      try {
        const result = listener.apply(this, args);
        
        // Handle promise rejections if enabled
        if (this.options.captureRejections && result && typeof result.catch === 'function') {
          result.catch(error => {
            this.emit('error', error);
          });
        }
      } catch (error) {
        // Emit error event instead of logging
        this.emit('error', error);
      }
    });
    
    return true;
  }
  
  // Check max listeners warning
  checkMaxListeners(eventName) {
    const count = this.listenerCount(eventName);
    if (count > this.options.maxListeners) {
      console.warn(`MaxListenersExceededWarning: ${count} ${eventName} listeners added`);
    }
  }
  
  // Override on to check max listeners
  on(eventName, listener) {
    super.on(eventName, listener);
    this.checkMaxListeners(eventName);
    return this;
  }
  
  // Get raw listeners (including wrapped once listeners)
  rawListeners(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).slice() : [];
  }
  
  // Get listeners (unwrapped)
  listeners(eventName) {
    if (!this.events.has(eventName)) return [];
    
    return this.events.get(eventName).map(listener => {
      // Find original function for once wrappers
      for (const [original, wrapper] of this.onceWrappers) {
        if (wrapper === listener) return original;
      }
      return listener;
    });
  }
}

// =======================
// Approach 3: Async EventEmitter
// =======================

/**
 * EventEmitter with async/await support and sequential execution
 */
class AsyncEventEmitter extends EnhancedEventEmitter {
  // Emit events and wait for all async listeners to complete
  async emitAsync(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false;
    }
    
    const listeners = this.events.get(eventName);
    
    // Execute all listeners and collect promises
    const promises = listeners.map(async listener => {
      try {
        return await listener.apply(this, args);
      } catch (error) {
        this.emit('error', error);
        return null;
      }
    });
    
    // Wait for all listeners to complete
    await Promise.all(promises);
    return true;
  }
  
  // Emit events sequentially (one after another)
  async emitSequential(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false;
    }
    
    const listeners = this.events.get(eventName);
    const results = [];
    
    // Execute listeners sequentially
    for (const listener of listeners) {
      try {
        const result = await listener.apply(this, args);
        results.push(result);
      } catch (error) {
        this.emit('error', error);
        results.push(null);
      }
    }
    
    return results;
  }
  
  // Emit with timeout for async operations
  async emitWithTimeout(eventName, timeout, ...args) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Event emission timed out')), timeout);
    });
    
    return Promise.race([
      this.emitAsync(eventName, ...args),
      timeoutPromise
    ]);
  }
}

// =======================
// Approach 4: Namespaced EventEmitter
// =======================

/**
 * EventEmitter with namespace support and wildcard matching
 */
class NamespacedEventEmitter extends AsyncEventEmitter {
  constructor(options = {}) {
    super(options);
    this.namespaceDelimiter = options.delimiter || '.';
    this.wildcardEnabled = options.wildcardEnabled !== false;
  }
  
  // Enhanced emit with namespace support
  emit(eventName, ...args) {
    let hasListeners = super.emit(eventName, ...args);
    
    // Handle wildcard matching if enabled
    if (this.wildcardEnabled && eventName.includes(this.namespaceDelimiter)) {
      const parts = eventName.split(this.namespaceDelimiter);
      
      // Emit for parent namespaces with wildcards
      for (let i = parts.length - 1; i > 0; i--) {
        const wildcardEvent = parts.slice(0, i).join(this.namespaceDelimiter) + this.namespaceDelimiter + '*';
        if (super.emit(wildcardEvent, eventName, ...args)) {
          hasListeners = true;
        }
      }
      
      // Emit for global wildcard
      if (super.emit('*', eventName, ...args)) {
        hasListeners = true;
      }
    }
    
    return hasListeners;
  }
  
  // Get all listeners for a namespace
  getNamespaceListeners(namespace) {
    const listeners = new Map();
    
    for (const [eventName, eventListeners] of this.events) {
      if (eventName.startsWith(namespace + this.namespaceDelimiter) || eventName === namespace) {
        listeners.set(eventName, eventListeners.slice());
      }
    }
    
    return listeners;
  }
  
  // Remove all listeners in a namespace
  removeNamespace(namespace) {
    const toRemove = [];
    
    for (const eventName of this.events.keys()) {
      if (eventName.startsWith(namespace + this.namespaceDelimiter) || eventName === namespace) {
        toRemove.push(eventName);
      }
    }
    
    toRemove.forEach(eventName => this.events.delete(eventName));
    return this;
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== EventEmitter Examples ===');

// Basic usage
const emitter = new BasicEventEmitter();

emitter.on('test', (data) => {
  console.log('Basic listener:', data);
});

emitter.emit('test', 'Hello World!');

// Enhanced usage
const enhanced = new EnhancedEventEmitter();

enhanced.once('startup', () => {
  console.log('App started (once only)');
});

enhanced.on('startup', () => {
  console.log('App startup handler');
});

enhanced.emit('startup'); // Both listeners fire
enhanced.emit('startup'); // Only regular listener fires

// Async usage
async function testAsync() {
  const asyncEmitter = new AsyncEventEmitter();
  
  asyncEmitter.on('process', async (data) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Async processed:', data);
  });
  
  asyncEmitter.on('process', async (data) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log('Quick processed:', data);
  });
  
  console.log('Starting async processing...');
  await asyncEmitter.emitAsync('process', 'test data');
  console.log('All async processing complete');
}

testAsync();

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Application State Manager
 * Manages application state with event-driven updates
 */
function createStateManager(initialState = {}) {
  const emitter = new EnhancedEventEmitter();
  let state = { ...initialState };
  const history = [state];
  
  return {
    // Get current state
    getState() {
      return { ...state };
    },
    
    // Update state and emit change events
    setState(updates) {
      const prevState = { ...state };
      state = { ...state, ...updates };
      
      // Add to history
      history.push({ ...state });
      
      // Emit specific property change events
      Object.keys(updates).forEach(key => {
        emitter.emit(`change:${key}`, state[key], prevState[key]);
      });
      
      // Emit general change event
      emitter.emit('change', state, prevState);
      
      return state;
    },
    
    // Subscribe to state changes
    subscribe(callback) {
      emitter.on('change', callback);
      return () => emitter.off('change', callback); // Return unsubscribe function
    },
    
    // Subscribe to specific property changes
    subscribeToProperty(property, callback) {
      emitter.on(`change:${property}`, callback);
      return () => emitter.off(`change:${property}`, callback);
    },
    
    // Get state history
    getHistory() {
      return [...history];
    },
    
    // Undo last change
    undo() {
      if (history.length > 1) {
        history.pop(); // Remove current state
        const prevState = { ...state };
        state = { ...history[history.length - 1] };
        emitter.emit('change', state, prevState);
      }
      return state;
    }
  };
}

/**
 * Use Case 2: HTTP Request Manager with Events
 * Manages HTTP requests with event-driven progress tracking
 */
function createRequestManager() {
  const emitter = new AsyncEventEmitter();
  const activeRequests = new Map();
  
  return {
    // Make HTTP request with events
    async request(url, options = {}) {
      const requestId = Date.now() + Math.random();
      const request = { id: requestId, url, options, status: 'pending' };
      
      activeRequests.set(requestId, request);
      emitter.emit('request:start', request);
      
      try {
        // Simulate progress events
        emitter.emit('request:progress', { ...request, progress: 0 });
        
        // Simulate actual request (replace with fetch in real implementation)
        const response = await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate progress
            emitter.emit('request:progress', { ...request, progress: 50 });
            
            setTimeout(() => {
              emitter.emit('request:progress', { ...request, progress: 100 });
              
              if (Math.random() > 0.2) { // 80% success rate
                resolve({ status: 200, data: `Response from ${url}` });
              } else {
                reject(new Error('Request failed'));
              }
            }, 100);
          }, 100);
        });
        
        request.status = 'success';
        request.response = response;
        emitter.emit('request:success', request);
        
        return response;
      } catch (error) {
        request.status = 'error';
        request.error = error;
        emitter.emit('request:error', request);
        throw error;
      } finally {
        emitter.emit('request:complete', request);
        activeRequests.delete(requestId);
      }
    },
    
    // Subscribe to request events
    onStart(callback) {
      emitter.on('request:start', callback);
    },
    
    onProgress(callback) {
      emitter.on('request:progress', callback);
    },
    
    onSuccess(callback) {
      emitter.on('request:success', callback);
    },
    
    onError(callback) {
      emitter.on('request:error', callback);
    },
    
    onComplete(callback) {
      emitter.on('request:complete', callback);
    },
    
    // Get active requests
    getActiveRequests() {
      return Array.from(activeRequests.values());
    },
    
    // Cancel all requests (simplified)
    cancelAll() {
      activeRequests.clear();
      emitter.emit('requests:cancelled');
    }
  };
}

/**
 * Use Case 3: Plugin System
 * Event-driven plugin architecture
 */
function createPluginSystem() {
  const emitter = new NamespacedEventEmitter();
  const plugins = new Map();
  
  return {
    // Register plugin
    registerPlugin(name, plugin) {
      if (plugins.has(name)) {
        throw new Error(`Plugin ${name} already registered`);
      }
      
      plugins.set(name, plugin);
      
      // Initialize plugin with emitter
      if (typeof plugin.init === 'function') {
        plugin.init(emitter);
      }
      
      emitter.emit('plugin.registered', { name, plugin });
      return this;
    },
    
    // Unregister plugin
    unregisterPlugin(name) {
      const plugin = plugins.get(name);
      if (!plugin) return this;
      
      // Cleanup plugin
      if (typeof plugin.destroy === 'function') {
        plugin.destroy(emitter);
      }
      
      plugins.delete(name);
      emitter.removeNamespace(`plugin.${name}`);
      emitter.emit('plugin.unregistered', { name, plugin });
      
      return this;
    },
    
    // Get plugin
    getPlugin(name) {
      return plugins.get(name);
    },
    
    // Execute plugin hook
    async executeHook(hookName, ...args) {
      const results = [];
      
      // Emit to all plugins
      const listeners = emitter.rawListeners(`hook.${hookName}`);
      
      for (const listener of listeners) {
        try {
          const result = await listener(...args);
          results.push(result);
        } catch (error) {
          emitter.emit('plugin.error', { hookName, error });
        }
      }
      
      return results;
    },
    
    // Plugin can register for hooks
    registerHook(pluginName, hookName, handler) {
      emitter.on(`hook.${hookName}`, handler);
      emitter.emit(`plugin.${pluginName}.hook.registered`, { hookName });
    },
    
    // Global event emitter for plugins
    emit: emitter.emit.bind(emitter),
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter)
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// State Manager
const stateManager = createStateManager({ count: 0, name: 'App' });

const unsubscribe = stateManager.subscribe((newState, oldState) => {
  console.log('State changed:', { newState, oldState });
});

stateManager.setState({ count: 1 });
stateManager.setState({ name: 'Updated App' });

// Request Manager
const requestManager = createRequestManager();

requestManager.onStart((request) => {
  console.log('Request started:', request.url);
});

requestManager.onProgress((request) => {
  console.log(`Progress: ${request.progress}% for ${request.url}`);
});

requestManager.request('/api/data').then(() => {
  console.log('Request completed successfully');
}).catch(() => {
  console.log('Request failed');
});

// Plugin System
const pluginSystem = createPluginSystem();

// Sample plugin
const samplePlugin = {
  init(emitter) {
    console.log('Sample plugin initialized');
    emitter.on('hook.beforeRender', () => {
      console.log('Sample plugin: beforeRender hook');
    });
  },
  destroy(emitter) {
    console.log('Sample plugin destroyed');
  }
};

pluginSystem.registerPlugin('sample', samplePlugin);
pluginSystem.executeHook('beforeRender');

// Export all implementations
module.exports = {
  BasicEventEmitter,
  EnhancedEventEmitter,
  AsyncEventEmitter,
  NamespacedEventEmitter,
  createStateManager,
  createRequestManager,
  createPluginSystem
};

/**
 * Key Interview Points:
 * 
 * 1. Observer Pattern Implementation:
 *    - Decoupled communication between objects
 *    - One-to-many dependency relationships
 *    - Dynamic subscription/unsubscription
 * 
 * 2. Memory Management:
 *    - Remove listeners to prevent memory leaks
 *    - WeakMap for tracking wrapper functions
 *    - Cleanup on object destruction
 * 
 * 3. Error Handling:
 *    - Try-catch around listener execution
 *    - Special 'error' event handling
 *    - Async error capture with promises
 * 
 * 4. Performance Considerations:
 *    - Listener array management (add/remove efficiency)
 *    - Event emission overhead
 *    - Max listeners warnings
 * 
 * 5. Advanced Features:
 *    - Once listeners (self-removing)
 *    - Prepend listeners (priority)
 *    - Async/await support
 *    - Namespace and wildcard support
 * 
 * 6. Real-world Applications:
 *    - State management (Redux-like patterns)
 *    - HTTP request lifecycle
 *    - Plugin architectures
 *    - DOM event handling
 *    - WebSocket connections
 */