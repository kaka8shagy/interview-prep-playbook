/**
 * File: practical-applications.js
 * Description: Real-world applications of 'this' binding in frameworks, libraries, and common patterns
 * Time Complexity: Varies by application (noted per function)
 * Space Complexity: Varies by application (noted per function)
 */

// Real-World Application 1: Event Handler Management
// Managing 'this' context in DOM event handlers and custom event systems

class EventHandlerManager {
  constructor(element) {
    this.element = element;
    this.handlers = new Map(); // Track bound handlers for removal
    this.eventCount = 0;
  }
  
  // Method 1: Using bind() to preserve context
  // Time Complexity: O(1) per handler registration
  addHandler(eventType, handler, useCapture = false) {
    // Bind handler to preserve 'this' context
    const boundHandler = handler.bind(this);
    
    // Store reference for later removal
    const key = `${eventType}-${handler.name || 'anonymous'}`;
    this.handlers.set(key, { original: handler, bound: boundHandler });
    
    // Add event listener with bound handler
    if (this.element && this.element.addEventListener) {
      this.element.addEventListener(eventType, boundHandler, useCapture);
      console.log(`  Added ${eventType} handler with preserved context`);
    } else {
      console.log(`  Simulated adding ${eventType} handler`);
    }
    
    return key; // Return key for removal
  }
  
  // Method 2: Using arrow functions for context preservation
  createArrowHandler(callback) {
    return (event) => {
      this.eventCount++;
      console.log(`  Arrow handler called, count: ${this.eventCount}`);
      
      // 'this' refers to EventHandlerManager instance
      if (callback) {
        callback.call(this, event);
      }
    };
  }
  
  // Remove handler by key
  removeHandler(eventType, key, useCapture = false) {
    if (this.handlers.has(key)) {
      const { bound } = this.handlers.get(key);
      
      if (this.element && this.element.removeEventListener) {
        this.element.removeEventListener(eventType, bound, useCapture);
        console.log(`  Removed ${eventType} handler`);
      }
      
      this.handlers.delete(key);
    }
  }
  
  // Cleanup all handlers
  cleanup() {
    this.handlers.forEach((handlerInfo, key) => {
      const eventType = key.split('-')[0];
      if (this.element && this.element.removeEventListener) {
        this.element.removeEventListener(eventType, handlerInfo.bound);
      }
    });
    
    this.handlers.clear();
    console.log('  All handlers cleaned up');
  }
  
  // Get statistics
  getStats() {
    return {
      totalHandlers: this.handlers.size,
      eventCount: this.eventCount
    };
  }
}

function demonstrateEventHandlers() {
  console.log('1. Event Handler Management:');
  
  // Simulate DOM element
  const mockElement = {
    addEventListener: (type, handler, capture) => {
      console.log(`    Mock: addEventListener(${type})`);
      // Simulate event triggering
      setTimeout(() => handler({ type, target: mockElement }), 100);
    },
    removeEventListener: (type, handler, capture) => {
      console.log(`    Mock: removeEventListener(${type})`);
    }
  };
  
  const manager = new EventHandlerManager(mockElement);
  
  // Add handlers with different approaches
  const clickHandlerKey = manager.addHandler('click', function(event) {
    console.log(`    Click handled by ${this.constructor.name}, count: ${this.eventCount + 1}`);
  });
  
  const arrowHandler = manager.createArrowHandler(function(event) {
    console.log(`    Custom callback in arrow handler`);
  });
  
  // Simulate using arrow handler
  setTimeout(() => {
    arrowHandler({ type: 'custom' });
    console.log('  Final stats:', manager.getStats());
  }, 200);
}

// Real-World Application 2: React-like Component System
// Simulating how React manages 'this' context in class components

class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this._isMounted = false;
    
    // Bind all methods to preserve context (React pattern)
    this._bindMethods();
  }
  
  // Automatically bind all methods to component instance
  _bindMethods() {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(name => {
        return name !== 'constructor' && 
               typeof this[name] === 'function' &&
               !name.startsWith('_');
      });
    
    methodNames.forEach(methodName => {
      this[methodName] = this[methodName].bind(this);
    });
    
    console.log(`  Bound methods: ${methodNames.join(', ')}`);
  }
  
  // Simulate setState with 'this' context
  setState(newState, callback) {
    if (!this._isMounted) {
      console.warn('  Warning: setState called on unmounted component');
      return;
    }
    
    // Merge new state
    this.state = { ...this.state, ...newState };
    console.log(`  State updated:`, this.state);
    
    // Simulate re-render
    this.render();
    
    if (callback && typeof callback === 'function') {
      callback.call(this);
    }
  }
  
  // Mount component
  mount() {
    this._isMounted = true;
    console.log(`  Component ${this.constructor.name} mounted`);
    this.render();
  }
  
  // Unmount component
  unmount() {
    this._isMounted = false;
    console.log(`  Component ${this.constructor.name} unmounted`);
  }
  
  // Override in subclasses
  render() {
    console.log(`  Rendering ${this.constructor.name}`);
  }
}

// Example React-like component
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  // Event handler that relies on 'this' context
  handleIncrement() {
    console.log(`    Increment called on ${this.constructor.name}`);
    this.setState({ count: this.state.count + 1 });
  }
  
  handleDecrement() {
    console.log(`    Decrement called on ${this.constructor.name}`);
    this.setState({ count: this.state.count - 1 });
  }
  
  handleReset() {
    console.log(`    Reset called on ${this.constructor.name}`);
    this.setState({ count: 0 });
  }
  
  render() {
    console.log(`    Rendering counter with count: ${this.state.count}`);
    return `Count: ${this.state.count}`;
  }
}

function demonstrateReactLikeComponent() {
  console.log('\n2. React-like Component System:');
  
  const counter = new Counter({ initialValue: 0 });
  counter.mount();
  
  // Simulate event handlers being called from different contexts
  console.log('  Simulating button clicks...');
  
  // These would normally be called by DOM events, losing 'this' context
  // But our binding ensures 'this' is preserved
  setTimeout(() => {
    counter.handleIncrement(); // 'this' preserved
    counter.handleIncrement();
    counter.handleDecrement();
  }, 100);
  
  setTimeout(() => {
    counter.handleReset();
    counter.unmount();
  }, 200);
}

// Real-World Application 3: API Client with Method Chaining
// Demonstrating 'this' in fluent interfaces and method chaining

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.headers = {};
    this.middleware = [];
    this.retryCount = 0;
    this.timeout = 5000;
  }
  
  // Fluent interface methods - all return 'this' for chaining
  setHeader(key, value) {
    this.headers[key] = value;
    console.log(`  Set header: ${key} = ${value}`);
    return this; // Enable chaining
  }
  
  setTimeout(ms) {
    this.timeout = ms;
    console.log(`  Set timeout: ${ms}ms`);
    return this;
  }
  
  setRetries(count) {
    this.retryCount = count;
    console.log(`  Set retry count: ${count}`);
    return this;
  }
  
  // Add middleware function
  use(middleware) {
    // Bind middleware to this instance
    const boundMiddleware = middleware.bind(this);
    this.middleware.push(boundMiddleware);
    console.log(`  Added middleware`);
    return this;
  }
  
  // Execute request with middleware chain
  async request(endpoint, options = {}) {
    console.log(`  Making request to ${this.baseURL}${endpoint}`);
    
    let requestConfig = {
      url: `${this.baseURL}${endpoint}`,
      headers: { ...this.headers, ...options.headers },
      timeout: this.timeout,
      ...options
    };
    
    // Apply middleware in sequence
    for (const middleware of this.middleware) {
      // Each middleware can access 'this' (APIClient instance)
      requestConfig = await middleware(requestConfig);
    }
    
    // Simulate API call
    return this._executeRequest(requestConfig);
  }
  
  // Convenience methods that maintain chainability
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', data });
  }
  
  // Simulate request execution
  async _executeRequest(config) {
    console.log(`    Executing request:`, config.method || 'GET', config.url);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate response
    return {
      status: 200,
      data: { message: 'Success', timestamp: Date.now() },
      headers: { 'content-type': 'application/json' }
    };
  }
  
  // Factory method that preserves context
  static create(baseURL) {
    const client = new APIClient(baseURL);
    
    // Return proxy that maintains chainability
    return new Proxy(client, {
      get(target, prop) {
        const value = target[prop];
        
        if (typeof value === 'function') {
          return function(...args) {
            const result = value.apply(target, args);
            // Return proxy for chainable methods, original result for others
            return result === target ? new Proxy(target, this) : result;
          };
        }
        
        return value;
      }
    });
  }
}

function demonstrateAPIClient() {
  console.log('\n3. API Client with Method Chaining:');
  
  // Create API client with method chaining
  const client = APIClient.create('https://api.example.com');
  
  // Add middleware that uses 'this' context
  client
    .setHeader('Authorization', 'Bearer token123')
    .setHeader('Content-Type', 'application/json')
    .setTimeout(10000)
    .setRetries(3)
    .use(function(config) {
      // 'this' refers to APIClient instance
      console.log(`    Middleware: Adding user agent for ${this.constructor.name}`);
      config.headers['User-Agent'] = 'CustomClient/1.0';
      return config;
    })
    .use(function(config) {
      console.log(`    Middleware: Logging request to ${config.url}`);
      return config;
    });
  
  // Make requests
  setTimeout(async () => {
    try {
      const response1 = await client.get('/users');
      console.log('  GET response:', response1.data);
      
      const response2 = await client.post('/users', { name: 'John' });
      console.log('  POST response:', response2.data);
    } catch (error) {
      console.error('  Request failed:', error.message);
    }
  }, 300);
}

// Real-World Application 4: Observable Pattern with 'this' Context
// Event emitter pattern preserving context in observers

class Observable {
  constructor() {
    this.observers = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }
  
  // Subscribe with context preservation options
  subscribe(eventType, callback, options = {}) {
    const {
      context = null,        // Context to bind callback to
      once = false,          // Remove after first call
      priority = 0           // Higher priority callbacks called first
    } = options;
    
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    
    // Create observer object
    const observer = {
      callback: context ? callback.bind(context) : callback,
      originalCallback: callback,
      context,
      once,
      priority,
      id: Date.now() + Math.random()
    };
    
    const observers = this.observers.get(eventType);
    observers.push(observer);
    
    // Sort by priority (higher first)
    observers.sort((a, b) => b.priority - a.priority);
    
    console.log(`  Subscribed to ${eventType} with ${context ? 'bound' : 'unbound'} context`);
    
    // Return unsubscribe function
    return () => this.unsubscribe(eventType, observer.id);
  }
  
  // Unsubscribe by event type and observer ID
  unsubscribe(eventType, observerId) {
    if (!this.observers.has(eventType)) return false;
    
    const observers = this.observers.get(eventType);
    const index = observers.findIndex(obs => obs.id === observerId);
    
    if (index !== -1) {
      observers.splice(index, 1);
      console.log(`  Unsubscribed from ${eventType}`);
      return true;
    }
    
    return false;
  }
  
  // Emit event to all subscribers
  emit(eventType, data) {
    console.log(`  Emitting ${eventType} event`);
    
    // Store in history
    const event = { type: eventType, data, timestamp: Date.now() };
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    if (!this.observers.has(eventType)) {
      console.log(`  No observers for ${eventType}`);
      return;
    }
    
    const observers = this.observers.get(eventType);
    const toRemove = [];
    
    // Call observers in priority order
    observers.forEach((observer, index) => {
      try {
        observer.callback(data, event);
        
        // Mark for removal if 'once' option
        if (observer.once) {
          toRemove.push(index);
        }
      } catch (error) {
        console.error(`    Observer error:`, error.message);
      }
    });
    
    // Remove 'once' observers
    toRemove.reverse().forEach(index => {
      observers.splice(index, 1);
    });
  }
  
  // Get event history
  getHistory(eventType = null) {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }
}

// Example classes using Observable
class UserService extends Observable {
  constructor() {
    super();
    this.users = [];
    this.currentUserId = 1;
  }
  
  addUser(userData) {
    const user = { ...userData, id: this.currentUserId++ };
    this.users.push(user);
    
    console.log(`    UserService: Added user ${user.name}`);
    
    // Emit event - observers with bound context will receive proper 'this'
    this.emit('user:added', user);
    
    return user;
  }
  
  getUser(id) {
    return this.users.find(user => user.id === id);
  }
}

class Logger {
  constructor(name) {
    this.name = name;
    this.logs = [];
  }
  
  // Method that uses 'this' context
  logEvent(data, event) {
    const logEntry = {
      logger: this.name,
      timestamp: event.timestamp,
      event: event.type,
      data
    };
    
    this.logs.push(logEntry);
    console.log(`    ${this.name}: Logged ${event.type} event`);
  }
  
  getLogs() {
    return [...this.logs];
  }
}

function demonstrateObservablePattern() {
  console.log('\n4. Observable Pattern with Context:');
  
  const userService = new UserService();
  const logger = new Logger('UserLogger');
  const auditLogger = new Logger('AuditLogger');
  
  // Subscribe with bound context
  const unsubscribe1 = userService.subscribe('user:added', logger.logEvent, {
    context: logger,
    priority: 1
  });
  
  const unsubscribe2 = userService.subscribe('user:added', auditLogger.logEvent, {
    context: auditLogger,
    priority: 2
  });
  
  // Subscribe with regular function (no context binding)
  const unsubscribe3 = userService.subscribe('user:added', function(user) {
    console.log(`    Anonymous observer: New user ${user.name} (this:${this?.constructor?.name || 'undefined'})`);
  });
  
  // Add users to trigger events
  setTimeout(() => {
    userService.addUser({ name: 'Alice', email: 'alice@example.com' });
    userService.addUser({ name: 'Bob', email: 'bob@example.com' });
    
    console.log('  Logger logs:', logger.getLogs().length);
    console.log('  Audit logs:', auditLogger.getLogs().length);
  }, 400);
}

// Comprehensive demo function
async function runPracticalApplicationsDemo() {
  console.log('=== Practical This Binding Applications Demo ===\n');
  
  demonstrateEventHandlers();
  demonstrateReactLikeComponent();
  demonstrateAPIClient();
  demonstrateObservablePattern();
  
  setTimeout(() => {
    console.log('\n=== Practical Applications Demo Complete ===');
  }, 1000);
}

// Export for use in other modules
module.exports = {
  EventHandlerManager,
  Component,
  Counter,
  APIClient,
  Observable,
  UserService,
  Logger,
  demonstrateEventHandlers,
  demonstrateReactLikeComponent,
  demonstrateAPIClient,
  demonstrateObservablePattern,
  runPracticalApplicationsDemo
};