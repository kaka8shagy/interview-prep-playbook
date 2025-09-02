/**
 * Mini-Redux Implementation - State Management System
 * 
 * A complete Redux implementation from scratch including:
 * - Store with state management and subscription system
 * - Action creators and dispatch mechanism  
 * - Reducer composition and middleware pipeline
 * - Dev tools integration and time-travel debugging
 * - Multiple approaches from basic to production-ready
 * 
 * Problem: Implement predictable state container for JavaScript applications
 * 
 * Key Interview Points:
 * - Understanding flux architecture and unidirectional data flow
 * - Immutability principles and pure functions
 * - Middleware pattern implementation
 * - Observer pattern for state subscriptions
 * - Performance optimization strategies
 * 
 * Companies: All companies using React/Redux ask about state management
 * Frequency: Very High - Fundamental pattern in modern frontend development
 */

// ========================================================================================
// APPROACH 1: BASIC REDUX - Core store, actions, and reducers
// ========================================================================================

/**
 * Basic Redux store implementation
 * Mental model: Central state container with predictable state updates
 * 
 * Time Complexity: O(1) for dispatch, O(n) for notifications where n is subscribers
 * Space Complexity: O(n) for state history (if enabled)
 * 
 * Interview considerations:
 * - Why immutability? Enables efficient change detection and time travel
 * - How does subscriber pattern work? Observer pattern implementation
 * - What are the benefits of pure reducers? Predictability and testability
 * - How to handle async actions? Middleware like redux-thunk
 */
class BasicStore {
  constructor(reducer, initialState = {}) {
    // Validate reducer function
    if (typeof reducer !== 'function') {
      throw new Error('Reducer must be a function');
    }
    
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = new Set(); // Use Set to prevent duplicate subscriptions
    this.isDispatching = false; // Prevent recursive dispatching
    
    // Initialize state by dispatching a dummy action
    // This ensures all reducers get a chance to set initial state
    this.dispatch({ type: '@@INIT' });
  }
  
  /**
   * Get current state
   * Returns immutable reference to current state
   */
  getState() {
    if (this.isDispatching) {
      throw new Error('Cannot get state while dispatching');
    }
    
    return this.state;
  }
  
  /**
   * Dispatch an action to update state
   * Core method that triggers state updates through reducers
   */
  dispatch(action) {
    // Validate action format
    if (!action || typeof action !== 'object') {
      throw new Error('Action must be a plain object');
    }
    
    if (typeof action.type === 'undefined') {
      throw new Error('Action must have a type property');
    }
    
    // Prevent recursive dispatching
    if (this.isDispatching) {
      throw new Error('Cannot dispatch while dispatching');
    }
    
    try {
      this.isDispatching = true;
      
      // Calculate new state using reducer
      // Reducer must be pure function: (state, action) => newState
      const newState = this.reducer(this.state, action);
      
      // Update state if it changed
      if (newState !== this.state) {
        this.state = newState;
        
        // Notify all subscribers of state change
        this.notifyListeners();
      }
      
    } finally {
      this.isDispatching = false;
    }
    
    return action; // Return action for middleware chaining
  }
  
  /**
   * Subscribe to state changes
   * Returns unsubscribe function for cleanup
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all subscribers of state change
   * Called after each successful dispatch
   */
  notifyListeners() {
    // Create array copy to avoid issues if listeners modify the set during iteration
    const listenersArray = Array.from(this.listeners);
    
    listenersArray.forEach(listener => {
      try {
        listener(); // Listeners get current state via getState()
      } catch (error) {
        console.error('Listener error:', error);
        // Continue notifying other listeners even if one fails
      }
    });
  }
  
  /**
   * Replace the reducer (useful for code splitting and hot reloading)
   * Advanced feature for dynamic reducer composition
   */
  replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Reducer must be a function');
    }
    
    this.reducer = nextReducer;
    
    // Reinitialize state with new reducer
    this.dispatch({ type: '@@REPLACE' });
  }
}

/**
 * Combine multiple reducers into a single root reducer
 * Essential utility for scaling Redux applications
 */
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  
  // Validate all reducers are functions
  reducerKeys.forEach(key => {
    if (typeof reducers[key] !== 'function') {
      throw new Error(`Reducer for key "${key}" must be a function`);
    }
  });
  
  // Return combined reducer function
  return function combinedReducer(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    
    // Call each reducer with its slice of state
    reducerKeys.forEach(key => {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      // Validate reducer returned a value
      if (typeof nextStateForKey === 'undefined') {
        throw new Error(`Reducer "${key}" returned undefined`);
      }
      
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });
    
    // Return new state object only if something changed
    return hasChanged ? nextState : state;
  };
}

/**
 * Create store with enhanced error handling and validation
 * Factory function that creates properly configured store
 */
function createStore(reducer, initialState, enhancer) {
  // Handle case where initialState is actually an enhancer
  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState;
    initialState = undefined;
  }
  
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Enhancer must be a function');
    }
    
    // Apply enhancer (middleware, dev tools, etc.)
    return enhancer(createStore)(reducer, initialState);
  }
  
  return new BasicStore(reducer, initialState);
}

// ========================================================================================
// APPROACH 2: MIDDLEWARE SYSTEM - Redux middleware pattern implementation
// ========================================================================================

/**
 * Enhanced store with middleware support
 * Mental model: Pipeline of functions that can intercept and modify actions
 * 
 * Middleware signature: store => next => action => result
 * This curried function pattern allows for composable action processing
 */
class EnhancedStore extends BasicStore {
  constructor(reducer, initialState = {}, middlewares = []) {
    super(reducer, initialState);
    this.middlewares = middlewares;
    this.setupMiddlewareChain();
  }
  
  /**
   * Set up middleware chain using functional composition
   * Creates a pipeline where each middleware can intercept actions
   */
  setupMiddlewareChain() {
    if (this.middlewares.length === 0) {
      return; // No middleware to apply
    }
    
    // Create middleware API that gets passed to each middleware
    const middlewareAPI = {
      getState: () => this.getState(),
      dispatch: (action) => this.dispatch(action) // This will be the final dispatch
    };
    
    // Apply each middleware to create the chain
    // Each middleware receives the store API and returns a function
    const chain = this.middlewares.map(middleware => middleware(middlewareAPI));
    
    // Compose the chain by applying each middleware to the next one
    // The final middleware in the chain calls the original dispatch
    this.dispatch = this.compose(...chain)(this.originalDispatch.bind(this));
  }
  
  /**
   * Store original dispatch method before middleware wrapping
   * This is what actually updates the state
   */
  originalDispatch(action) {
    return super.dispatch(action);
  }
  
  /**
   * Functional composition utility for middleware chaining
   * Composes functions from right to left: compose(f, g, h)(x) = f(g(h(x)))
   */
  compose(...funcs) {
    if (funcs.length === 0) {
      return arg => arg; // Identity function
    }
    
    if (funcs.length === 1) {
      return funcs[0];
    }
    
    // Reduce from right to left to create composition
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
  }
}

/**
 * Apply middleware to store creation
 * Standard Redux pattern for enhancing store with middleware
 */
function applyMiddleware(...middlewares) {
  return createStore => (reducer, initialState) => {
    const store = new EnhancedStore(reducer, initialState, middlewares);
    return store;
  };
}

/**
 * Logger middleware - logs actions and state changes
 * Example middleware that demonstrates the pattern
 */
const loggerMiddleware = store => next => action => {
  console.group(`Action: ${action.type}`);
  console.log('Previous State:', store.getState());
  console.log('Action:', action);
  
  const result = next(action); // Call next middleware or dispatch
  
  console.log('Next State:', store.getState());
  console.groupEnd();
  
  return result;
};

/**
 * Thunk middleware - enables async actions
 * Allows action creators to return functions instead of plain objects
 */
const thunkMiddleware = store => next => action => {
  // If action is a function, call it with dispatch and getState
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  
  // Otherwise, pass action to next middleware
  return next(action);
};

/**
 * Error handling middleware
 * Catches errors in reducers and prevents app crashes
 */
const errorHandlerMiddleware = store => next => action => {
  try {
    return next(action);
  } catch (error) {
    console.error('Redux Error:', error);
    console.error('Action:', action);
    console.error('State:', store.getState());
    
    // Optionally dispatch an error action
    store.dispatch({
      type: 'SYSTEM_ERROR',
      error: error.message,
      originalAction: action
    });
    
    return action;
  }
};

// ========================================================================================
// APPROACH 3: PRODUCTION REDUX - Full implementation with dev tools and optimization
// ========================================================================================

/**
 * Production-ready Redux implementation
 * Mental model: Enterprise-grade state management with all features
 * 
 * Features:
 * - Time-travel debugging
 * - Dev tools integration
 * - Performance optimization
 * - State persistence
 * - Hot reloading support
 * - Memory management
 */
class ProductionStore extends EnhancedStore {
  constructor(reducer, initialState = {}, enhancers = []) {
    super(reducer, initialState);
    
    this.config = {
      enableDevTools: typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__,
      enableTimeTravel: true,
      maxHistorySize: 50,
      enablePersistence: false,
      persistenceKey: 'redux_state',
      performanceMonitoring: true
    };
    
    // Time travel debugging state
    this.history = [];
    this.currentHistoryIndex = -1;
    this.isTimeTraveling = false;
    
    // Performance monitoring
    this.performanceMetrics = {
      dispatchCount: 0,
      averageDispatchTime: 0,
      slowDispatches: []
    };
    
    // Apply enhancers
    this.applyEnhancers(enhancers);
    
    // Initialize dev tools
    this.initializeDevTools();
    
    // Load persisted state if enabled
    this.loadPersistedState();
  }
  
  /**
   * Enhanced dispatch with time travel and performance monitoring
   * Adds debugging and optimization features to basic dispatch
   */
  dispatch(action) {
    if (this.isTimeTraveling) {
      return action; // Don't dispatch during time travel
    }
    
    const startTime = performance.now();
    
    // Store current state in history before dispatching
    if (this.config.enableTimeTravel) {
      this.addToHistory({
        action,
        stateBefore: this.state,
        timestamp: Date.now()
      });
    }
    
    // Call parent dispatch
    const result = super.dispatch(action);
    
    // Update performance metrics
    if (this.config.performanceMonitoring) {
      this.updatePerformanceMetrics(action.type, performance.now() - startTime);
    }
    
    // Persist state if enabled
    if (this.config.enablePersistence) {
      this.persistState();
    }
    
    // Notify dev tools
    this.notifyDevTools(action);
    
    return result;
  }
  
  /**
   * Add state change to history for time travel debugging
   * Maintains a rolling buffer of state changes
   */
  addToHistory(historyEntry) {
    // Remove future entries if we're in the middle of history
    if (this.currentHistoryIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentHistoryIndex + 1);
    }
    
    this.history.push(historyEntry);
    this.currentHistoryIndex = this.history.length - 1;
    
    // Maintain history size limit
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift();
      this.currentHistoryIndex--;
    }
  }
  
  /**
   * Jump to specific point in history (time travel)
   * Enables debugging by replaying state changes
   */
  jumpToHistoryIndex(index) {
    if (index < 0 || index >= this.history.length) {
      throw new Error('Invalid history index');
    }
    
    this.isTimeTraveling = true;
    this.currentHistoryIndex = index;
    
    // Replay all actions up to the target index
    let newState = this.history[0].stateBefore;
    
    for (let i = 0; i <= index; i++) {
      const { action } = this.history[i];
      newState = this.reducer(newState, action);
    }
    
    this.state = newState;
    this.notifyListeners();
    this.isTimeTraveling = false;
  }
  
  /**
   * Undo last action (time travel backward)
   * Convenient debugging method
   */
  undo() {
    if (this.currentHistoryIndex > 0) {
      this.jumpToHistoryIndex(this.currentHistoryIndex - 1);
    }
  }
  
  /**
   * Redo next action (time travel forward)
   * Convenient debugging method
   */
  redo() {
    if (this.currentHistoryIndex < this.history.length - 1) {
      this.jumpToHistoryIndex(this.currentHistoryIndex + 1);
    }
  }
  
  /**
   * Get time travel debugging information
   * Returns current history state for dev tools
   */
  getDebugInfo() {
    return {
      history: this.history.map((entry, index) => ({
        action: entry.action,
        timestamp: entry.timestamp,
        isActive: index === this.currentHistoryIndex
      })),
      currentIndex: this.currentHistoryIndex,
      performanceMetrics: this.performanceMetrics
    };
  }
  
  /**
   * Update performance metrics for monitoring
   * Tracks dispatch performance for optimization
   */
  updatePerformanceMetrics(actionType, duration) {
    const metrics = this.performanceMetrics;
    
    metrics.dispatchCount++;
    metrics.averageDispatchTime = (
      (metrics.averageDispatchTime * (metrics.dispatchCount - 1) + duration) / 
      metrics.dispatchCount
    );
    
    // Track slow dispatches (over 16ms - one frame)
    if (duration > 16) {
      metrics.slowDispatches.push({
        actionType,
        duration,
        timestamp: Date.now()
      });
      
      // Keep only recent slow dispatches
      if (metrics.slowDispatches.length > 10) {
        metrics.slowDispatches.shift();
      }
    }
  }
  
  /**
   * Initialize Redux Dev Tools integration
   * Connects to browser extension for enhanced debugging
   */
  initializeDevTools() {
    if (!this.config.enableDevTools) return;
    
    this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: 'Mini-Redux Store'
    });
    
    // Handle dev tools actions
    this.devTools.subscribe((message) => {
      if (message.type === 'DISPATCH') {
        switch (message.payload.type) {
          case 'RESET':
            this.jumpToHistoryIndex(0);
            break;
          case 'ROLLBACK':
            this.jumpToHistoryIndex(this.currentHistoryIndex);
            break;
          case 'JUMP_TO_ACTION':
            this.jumpToHistoryIndex(message.payload.actionId);
            break;
        }
      }
    });
    
    // Send initial state
    this.devTools.init(this.state);
  }
  
  /**
   * Notify dev tools of state changes
   * Sends action and state to dev tools extension
   */
  notifyDevTools(action) {
    if (this.devTools && !this.isTimeTraveling) {
      this.devTools.send(action, this.state);
    }
  }
  
  /**
   * Apply store enhancers
   * Supports middleware and other enhancements
   */
  applyEnhancers(enhancers) {
    enhancers.forEach(enhancer => {
      if (typeof enhancer === 'function') {
        enhancer(this);
      }
    });
  }
  
  /**
   * Persist state to localStorage
   * Enables state restoration across browser sessions
   */
  persistState() {
    try {
      const serializedState = JSON.stringify(this.state);
      localStorage.setItem(this.config.persistenceKey, serializedState);
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }
  
  /**
   * Load persisted state from localStorage
   * Restores state from previous browser session
   */
  loadPersistedState() {
    if (!this.config.enablePersistence) return;
    
    try {
      const serializedState = localStorage.getItem(this.config.persistenceKey);
      if (serializedState) {
        this.state = JSON.parse(serializedState);
      }
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
    }
  }
  
  /**
   * Clear persisted state
   * Useful for logout or reset functionality
   */
  clearPersistedState() {
    try {
      localStorage.removeItem(this.config.persistenceKey);
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  }
  
  /**
   * Hot reload reducer
   * Supports development workflow with hot module replacement
   */
  hotReloadReducer(nextReducer) {
    this.replaceReducer(nextReducer);
    
    // Replay current state through new reducer
    if (this.history.length > 0) {
      const currentEntry = this.history[this.currentHistoryIndex];
      this.jumpToHistoryIndex(this.currentHistoryIndex);
    }
  }
}

// ========================================================================================
// UTILITY FUNCTIONS AND ACTION CREATORS
// ========================================================================================

/**
 * Bind action creators to dispatch
 * Utility function to create bound action creators
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return (...args) => dispatch(actionCreators(...args));
  }
  
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function');
  }
  
  const boundActionCreators = {};
  
  Object.keys(actionCreators).forEach(key => {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
    }
  });
  
  return boundActionCreators;
}

/**
 * Create action creator function
 * Helper for creating consistent action creators
 */
function createAction(type, payloadCreator = (payload) => payload) {
  const actionCreator = (...args) => {
    const payload = payloadCreator(...args);
    return { type, payload };
  };
  
  actionCreator.type = type;
  actionCreator.toString = () => type;
  
  return actionCreator;
}

/**
 * Create async action creator (thunk)
 * Helper for creating async actions that work with thunk middleware
 */
function createAsyncAction(type) {
  return {
    request: createAction(`${type}_REQUEST`),
    success: createAction(`${type}_SUCCESS`),
    failure: createAction(`${type}_FAILURE`),
    
    // Async action creator
    async: (asyncFn) => {
      return async (dispatch, getState) => {
        dispatch({ type: `${type}_REQUEST` });
        
        try {
          const result = await asyncFn(dispatch, getState);
          dispatch({ type: `${type}_SUCCESS`, payload: result });
          return result;
        } catch (error) {
          dispatch({ type: `${type}_FAILURE`, payload: error.message });
          throw error;
        }
      };
    }
  };
}

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic store with simple counter
console.log('=== BASIC STORE EXAMPLE ===');

// Define action types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';
const RESET = 'RESET';

// Define action creators
const increment = () => ({ type: INCREMENT });
const decrement = () => ({ type: DECREMENT });
const reset = () => ({ type: RESET });

// Define reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    case RESET:
      return { ...state, count: 0 };
    default:
      return state;
  }
}

// Create store
const basicStore = createStore(counterReducer);

// Subscribe to changes
const unsubscribe = basicStore.subscribe(() => {
  console.log('State changed:', basicStore.getState());
});

// Dispatch actions
console.log('Initial state:', basicStore.getState());
basicStore.dispatch(increment());
basicStore.dispatch(increment());
basicStore.dispatch(decrement());
basicStore.dispatch(reset());

// Example 2: Combined reducers with middleware
console.log('\n=== ENHANCED STORE WITH MIDDLEWARE ===');

// User reducer
function userReducer(state = { name: '', email: '' }, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, ...action.payload };
    case 'CLEAR_USER':
      return { name: '', email: '' };
    default:
      return state;
  }
}

// Posts reducer
function postsReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_POST':
      return [...state, action.payload];
    case 'REMOVE_POST':
      return state.filter(post => post.id !== action.payload);
    default:
      return state;
  }
}

// Combine reducers
const rootReducer = combineReducers({
  counter: counterReducer,
  user: userReducer,
  posts: postsReducer
});

// Create enhanced store with middleware
const enhancedStore = createStore(
  rootReducer,
  applyMiddleware(loggerMiddleware, thunkMiddleware, errorHandlerMiddleware)
);

// Example async action
const fetchUserData = (userId) => {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_REQUEST' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      dispatch({ type: 'SET_USER', payload: userData });
      dispatch({ type: 'FETCH_USER_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'FETCH_USER_FAILURE', payload: error.message });
    }
  };
};

// Test enhanced store
enhancedStore.subscribe(() => {
  console.log('Enhanced store state:', enhancedStore.getState());
});

enhancedStore.dispatch({ type: 'SET_USER', payload: { name: 'Alice' } });
enhancedStore.dispatch({ type: 'ADD_POST', payload: { id: 1, title: 'Hello World' } });

// Test async action (if running in async context)
// enhancedStore.dispatch(fetchUserData(1));

// Example 3: Production store with time travel
console.log('\n=== PRODUCTION STORE WITH TIME TRAVEL ===');

const productionStore = new ProductionStore(rootReducer);

productionStore.subscribe(() => {
  console.log('Production store state:', productionStore.getState());
});

// Dispatch several actions to build history
productionStore.dispatch(increment());
productionStore.dispatch({ type: 'SET_USER', payload: { name: 'Bob' } });
productionStore.dispatch(increment());
productionStore.dispatch({ type: 'ADD_POST', payload: { id: 2, title: 'Time Travel' } });

console.log('Debug info:', productionStore.getDebugInfo());

// Demonstrate time travel
console.log('Going back in time...');
productionStore.undo();
productionStore.undo();

console.log('Going forward...');
productionStore.redo();

// Export for use in other modules
module.exports = {
  BasicStore,
  EnhancedStore,
  ProductionStore,
  createStore,
  combineReducers,
  applyMiddleware,
  bindActionCreators,
  createAction,
  createAsyncAction,
  
  // Middleware
  loggerMiddleware,
  thunkMiddleware,
  errorHandlerMiddleware
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. Redux Principles:
   - Single source of truth: One store for entire application state
   - State is read-only: Only way to change state is by emitting actions
   - Changes made with pure functions: Reducers must be pure functions

2. Architecture Patterns:
   - Flux architecture and unidirectional data flow
   - Observer pattern for subscriptions
   - Command pattern for actions
   - Middleware pattern for cross-cutting concerns

3. Performance Considerations:
   - Immutability and reference equality for change detection
   - Selector functions and memoization (reselect)
   - Normalizing state shape for complex data
   - Avoiding object mutations and array mutations

4. Advanced Features:
   - Middleware composition and order importance
   - Time travel debugging and dev tools integration
   - Hot reloading and code splitting with reducers
   - State persistence and hydration strategies

5. Common Patterns:
   - Async actions with thunks or sagas
   - Normalized state management
   - Connected components and container pattern
   - Action creator patterns and constants

Follow-up Questions:
- How would you handle optimistic updates in Redux?
- What's the difference between Redux and Context API?
- How do you test Redux reducers and action creators?
- How would you implement undo/redo functionality?
- What are the trade-offs of using Redux vs local component state?
- How do you handle form state in Redux applications?
- What's your approach to organizing large Redux codebases?
- How would you implement real-time data synchronization with Redux?
- What are the performance implications of deeply nested state?
- How do you handle error states and loading states in Redux?
*/