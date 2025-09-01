/**
 * File: redux-immer.js
 * Description: Custom Redux implementation with Immer for immutable state updates
 * 
 * Learning objectives:
 * - Understand Redux pattern and state management principles
 * - Learn Immer concepts for immutable updates
 * - Master middleware patterns and async handling
 * 
 * Time Complexity: O(1) for basic operations, O(n) for complex state updates
 * Space Complexity: O(n) where n is state size
 */

// =======================
// Approach 1: Basic Redux Implementation
// =======================

/**
 * Core Redux store implementation
 * Manages state through reducer functions with immutable updates
 * 
 * Mental model: Single source of truth with predictable state updates
 */
class BasicReduxStore {
  constructor(reducer, initialState = undefined, enhancer = null) {
    if (typeof reducer !== 'function') {
      throw new TypeError('Expected the reducer to be a function');
    }
    
    if (enhancer && typeof enhancer === 'function') {
      return enhancer(this.constructor)(reducer, initialState);
    }
    
    this.currentReducer = reducer;
    this.currentState = initialState;
    this.listeners = new Set();
    this.isDispatching = false;
    
    // Initialize state by dispatching init action
    this.dispatch({ type: '@@redux/INIT' });
  }
  
  /**
   * Get current state snapshot
   * Returns immutable reference to prevent accidental mutations
   */
  getState() {
    if (this.isDispatching) {
      throw new Error('Cannot access state while reducer is executing');
    }
    
    return this.currentState;
  }
  
  /**
   * Dispatch action to update state
   * Actions must be plain objects with type property
   */
  dispatch(action) {
    if (!this.isPlainObject(action)) {
      throw new TypeError('Actions must be plain objects');
    }
    
    if (!action.type) {
      throw new TypeError('Actions must have a type property');
    }
    
    if (this.isDispatching) {
      throw new Error('Reducers may not dispatch actions');
    }
    
    try {
      this.isDispatching = true;
      
      // Calculate new state using reducer
      const newState = this.currentReducer(this.currentState, action);
      
      // Only update if state actually changed
      if (newState !== this.currentState) {
        this.currentState = newState;
        
        // Notify all subscribers
        this.listeners.forEach(listener => {
          try {
            listener();
          } catch (error) {
            console.error('Listener error:', error);
          }
        });
      }
      
    } finally {
      this.isDispatching = false;
    }
    
    return action;
  }
  
  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Expected listener to be a function');
    }
    
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Replace the current reducer
   * Useful for code splitting and hot reloading
   */
  replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new TypeError('Expected the nextReducer to be a function');
    }
    
    this.currentReducer = nextReducer;
    this.dispatch({ type: '@@redux/REPLACE' });
  }
  
  /**
   * Check if value is a plain object
   */
  isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    
    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    
    return Object.getPrototypeOf(obj) === proto;
  }
}

// =======================
// Approach 2: Simple Immer Implementation
// =======================

/**
 * Simplified Immer implementation for immutable updates
 * Uses Proxy to track mutations and create immutable copies
 */
class SimpleImmer {
  constructor() {
    this.DRAFT = Symbol('draft');
    this.CURRENT = Symbol('current');
  }
  
  /**
   * Produce new state from draft mutations
   * Creates proxy that tracks changes and applies them immutably
   */
  produce(baseState, producer) {
    // Handle case where producer doesn't mutate
    if (typeof producer !== 'function') {
      throw new TypeError('Producer must be a function');
    }
    
    // Track all changes made during production
    const changes = new Map();
    const drafts = new WeakMap();
    
    // Create draft proxy for the base state
    const draft = this.createDraft(baseState, changes, drafts);
    
    // Execute producer function with draft
    const result = producer(draft);
    
    // If producer returns a value, use it directly
    if (result !== undefined) {
      return result;
    }
    
    // Apply all changes to create new immutable state
    return this.applyChanges(baseState, changes);
  }
  
  /**
   * Create draft proxy that tracks mutations
   */
  createDraft(target, changes, drafts, path = []) {
    // Return primitives as-is
    if (typeof target !== 'object' || target === null) {
      return target;
    }
    
    // Reuse existing draft
    if (drafts.has(target)) {
      return drafts.get(target);
    }
    
    const draft = new Proxy(target, {
      get: (obj, prop) => {
        if (prop === this.DRAFT) return true;
        if (prop === this.CURRENT) return target;
        
        const value = obj[prop];
        
        // Create nested draft for object properties
        if (typeof value === 'object' && value !== null) {
          return this.createDraft(value, changes, drafts, [...path, prop]);
        }
        
        return value;
      },
      
      set: (obj, prop, value) => {
        const currentPath = [...path, prop];
        const pathKey = currentPath.join('.');
        
        // Record the change
        changes.set(pathKey, {
          path: currentPath,
          value,
          target: obj
        });
        
        // Apply change to draft
        obj[prop] = value;
        return true;
      },
      
      deleteProperty: (obj, prop) => {
        const currentPath = [...path, prop];
        const pathKey = currentPath.join('.');
        
        changes.set(pathKey, {
          path: currentPath,
          value: undefined,
          deleted: true,
          target: obj
        });
        
        delete obj[prop];
        return true;
      }
    });
    
    drafts.set(target, draft);
    return draft;
  }
  
  /**
   * Apply recorded changes to create new immutable state
   */
  applyChanges(baseState, changes) {
    if (changes.size === 0) {
      return baseState;
    }
    
    // Deep clone the base state
    const newState = this.deepClone(baseState);
    
    // Apply each change
    for (const [pathKey, change] of changes) {
      let current = newState;
      const { path, value, deleted } = change;
      
      // Navigate to parent object
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
      
      // Apply the change
      const finalKey = path[path.length - 1];
      if (deleted) {
        delete current[finalKey];
      } else {
        current[finalKey] = value;
      }
    }
    
    return newState;
  }
  
  /**
   * Deep clone an object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  }
}

// =======================
// Approach 3: Redux with Immer Integration
// =======================

/**
 * Enhanced Redux store that uses Immer for reducers
 * Allows writing "mutative" logic that produces immutable updates
 */
class ImmerReduxStore extends BasicReduxStore {
  constructor(reducer, initialState, enhancer) {
    const immer = new SimpleImmer();
    
    // Wrap reducer to use Immer
    const immerReducer = (state, action) => {
      return immer.produce(state, (draft) => {
        // Call original reducer with draft state
        const result = reducer(draft, action);
        
        // If reducer returns new state, use it
        if (result !== undefined) {
          return result;
        }
        
        // Otherwise, mutations to draft are applied automatically
      });
    };
    
    super(immerReducer, initialState, enhancer);
    this.immer = immer;
  }
  
  /**
   * Convenience method for creating Immer-compatible reducers
   */
  static createReducer(initialState, actionMap) {
    return (state = initialState, action) => {
      const handler = actionMap[action.type];
      return handler ? handler(state, action) : state;
    };
  }
}

// =======================
// Approach 4: Middleware System
// =======================

/**
 * Apply middleware to Redux store
 * Middleware can intercept and transform actions before they reach reducers
 */
function applyMiddleware(...middlewares) {
  return (StoreClass) => (reducer, initialState) => {
    const store = new StoreClass(reducer, initialState);
    
    // Create middleware API
    const middlewareAPI = {
      getState: store.getState.bind(store),
      dispatch: (action) => dispatch(action) // Will be updated below
    };
    
    // Apply each middleware
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    
    // Compose middleware chain
    let dispatch = store.dispatch.bind(store);
    
    for (let i = chain.length - 1; i >= 0; i--) {
      dispatch = chain[i](dispatch);
    }
    
    // Update dispatch reference in middleware API
    middlewareAPI.dispatch = dispatch;
    
    return {
      ...store,
      dispatch
    };
  };
}

/**
 * Logger middleware - logs every action and state change
 */
const loggerMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  
  console.group(`Action: ${action.type}`);
  console.log('Previous State:', prevState);
  console.log('Action:', action);
  
  const result = next(action);
  
  console.log('Next State:', store.getState());
  console.groupEnd();
  
  return result;
};

/**
 * Thunk middleware - allows dispatching functions for async actions
 */
const thunkMiddleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  
  return next(action);
};

/**
 * Promise middleware - handles promise-based actions
 */
const promiseMiddleware = (store) => (next) => (action) => {
  if (!action.promise) {
    return next(action);
  }
  
  const { promise, type, ...rest } = action;
  
  // Dispatch pending action
  next({ ...rest, type: `${type}_PENDING` });
  
  return promise
    .then(payload => {
      // Dispatch success action
      next({ ...rest, type: `${type}_FULFILLED`, payload });
      return payload;
    })
    .catch(error => {
      // Dispatch error action
      next({ ...rest, type: `${type}_REJECTED`, error });
      throw error;
    });
};

// =======================
// Approach 5: Advanced Redux Patterns
// =======================

/**
 * Combine multiple reducers into one
 */
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  
  return (state = {}, action) => {
    let hasChanged = false;
    const nextState = {};
    
    for (const key of reducerKeys) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    
    return hasChanged ? nextState : state;
  };
}

/**
 * Create action creators with automatic type generation
 */
function createActions(actionMap) {
  const actions = {};
  
  for (const [key, creator] of Object.entries(actionMap)) {
    if (typeof creator === 'function') {
      actions[key] = creator;
    } else {
      // Simple action creator
      actions[key] = (payload) => ({
        type: key.toUpperCase(),
        payload
      });
    }
  }
  
  return actions;
}

/**
 * Reselect-like memoized selectors
 */
function createSelector(...args) {
  const selectors = args.slice(0, -1);
  const resultFunc = args[args.length - 1];
  
  let lastArgs = [];
  let lastResult;
  
  return (state) => {
    const currentArgs = selectors.map(selector => selector(state));
    
    // Check if any arguments changed
    const hasChanged = currentArgs.some((arg, index) => arg !== lastArgs[index]);
    
    if (hasChanged) {
      lastArgs = currentArgs;
      lastResult = resultFunc(...currentArgs);
    }
    
    return lastResult;
  };
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Redux Example ===');

// Define initial state and actions
const initialState = {
  count: 0,
  todos: [],
  user: null
};

// Action types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';

// Action creators
const actions = createActions({
  increment: () => ({ type: INCREMENT }),
  decrement: () => ({ type: DECREMENT }),
  addTodo: (text) => ({ type: ADD_TODO, payload: text }),
  toggleTodo: (id) => ({ type: TOGGLE_TODO, payload: id })
});

// Reducer using Immer
const reducer = ImmerReduxStore.createReducer(initialState, {
  [INCREMENT]: (draft) => {
    draft.count += 1;
  },
  
  [DECREMENT]: (draft) => {
    draft.count -= 1;
  },
  
  [ADD_TODO]: (draft, action) => {
    draft.todos.push({
      id: Date.now(),
      text: action.payload,
      completed: false
    });
  },
  
  [TOGGLE_TODO]: (draft, action) => {
    const todo = draft.todos.find(t => t.id === action.payload);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }
});

// Create store with middleware
const enhancer = applyMiddleware(loggerMiddleware, thunkMiddleware);
const store = new ImmerReduxStore(reducer, initialState, enhancer);

// Subscribe to changes
const unsubscribe = store.subscribe(() => {
  console.log('State updated:', store.getState());
});

// Dispatch some actions
store.dispatch(actions.increment());
store.dispatch(actions.addTodo('Learn Redux'));
store.dispatch(actions.addTodo('Learn Immer'));

console.log('\n=== Async Actions Example ===');

// Async action creator using thunk
const fetchUserData = (userId) => async (dispatch, getState) => {
  dispatch({ type: 'FETCH_USER_PENDING' });
  
  try {
    // Simulate API call
    const userData = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: userId, name: `User ${userId}`, email: `user${userId}@example.com` });
      }, 1000);
    });
    
    dispatch({ type: 'FETCH_USER_FULFILLED', payload: userData });
    return userData;
  } catch (error) {
    dispatch({ type: 'FETCH_USER_REJECTED', error: error.message });
    throw error;
  }
};

// Enhanced reducer with async handling
const asyncReducer = ImmerReduxStore.createReducer(
  { ...initialState, loading: false, error: null },
  {
    ...reducer(undefined, { type: '@@INIT' }), // Merge with previous reducer
    
    FETCH_USER_PENDING: (draft) => {
      draft.loading = true;
      draft.error = null;
    },
    
    FETCH_USER_FULFILLED: (draft, action) => {
      draft.loading = false;
      draft.user = action.payload;
    },
    
    FETCH_USER_REJECTED: (draft, action) => {
      draft.loading = false;
      draft.error = action.error;
    }
  }
);

// Dispatch async action
store.dispatch(fetchUserData(123));

console.log('\n=== Selectors Example ===');

// Memoized selectors
const selectTodos = (state) => state.todos;
const selectCompletedTodos = createSelector(
  selectTodos,
  (todos) => todos.filter(todo => todo.completed)
);

const selectTodoStats = createSelector(
  selectTodos,
  selectCompletedTodos,
  (todos, completed) => ({
    total: todos.length,
    completed: completed.length,
    remaining: todos.length - completed.length
  })
);

// Test selectors
store.dispatch(actions.toggleTodo(store.getState().todos[0]?.id));

const stats = selectTodoStats(store.getState());
console.log('Todo stats:', stats);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: E-commerce shopping cart
 * Complex state management with nested updates
 */
const cartInitialState = {
  items: [],
  total: 0,
  shipping: {
    address: null,
    method: 'standard',
    cost: 0
  },
  payment: {
    method: null,
    processing: false
  }
};

const cartActions = {
  ADD_ITEM: 'cart/ADD_ITEM',
  REMOVE_ITEM: 'cart/REMOVE_ITEM',
  UPDATE_QUANTITY: 'cart/UPDATE_QUANTITY',
  SET_SHIPPING_ADDRESS: 'cart/SET_SHIPPING_ADDRESS',
  SET_SHIPPING_METHOD: 'cart/SET_SHIPPING_METHOD',
  PROCESS_PAYMENT: 'cart/PROCESS_PAYMENT'
};

const cartReducer = ImmerReduxStore.createReducer(cartInitialState, {
  [cartActions.ADD_ITEM]: (draft, action) => {
    const { product, quantity = 1 } = action.payload;
    const existingItem = draft.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      draft.items.push({ product, quantity });
    }
    
    // Recalculate total
    draft.total = draft.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
  },
  
  [cartActions.REMOVE_ITEM]: (draft, action) => {
    const productId = action.payload;
    draft.items = draft.items.filter(item => item.product.id !== productId);
    
    draft.total = draft.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
  },
  
  [cartActions.UPDATE_QUANTITY]: (draft, action) => {
    const { productId, quantity } = action.payload;
    const item = draft.items.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        draft.items = draft.items.filter(item => item.product.id !== productId);
      } else {
        item.quantity = quantity;
      }
      
      draft.total = draft.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
    }
  },
  
  [cartActions.SET_SHIPPING_ADDRESS]: (draft, action) => {
    draft.shipping.address = action.payload;
  },
  
  [cartActions.SET_SHIPPING_METHOD]: (draft, action) => {
    const { method, cost } = action.payload;
    draft.shipping.method = method;
    draft.shipping.cost = cost;
  }
});

/**
 * Use Case 2: Form state management with validation
 * Complex form handling with nested validation
 */
class FormStore extends ImmerReduxStore {
  constructor(initialFormState) {
    const formReducer = ImmerReduxStore.createReducer(
      {
        values: initialFormState,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true
      },
      {
        SET_FIELD_VALUE: (draft, action) => {
          const { field, value } = action.payload;
          draft.values[field] = value;
          
          // Clear error when user starts typing
          if (draft.errors[field]) {
            delete draft.errors[field];
          }
        },
        
        SET_FIELD_TOUCHED: (draft, action) => {
          const { field } = action.payload;
          draft.touched[field] = true;
        },
        
        SET_FIELD_ERROR: (draft, action) => {
          const { field, error } = action.payload;
          draft.errors[field] = error;
          draft.isValid = Object.keys(draft.errors).length === 0;
        },
        
        SUBMIT_START: (draft) => {
          draft.isSubmitting = true;
        },
        
        SUBMIT_SUCCESS: (draft) => {
          draft.isSubmitting = false;
          // Reset form
          Object.keys(draft.values).forEach(key => {
            draft.values[key] = '';
          });
          draft.touched = {};
          draft.errors = {};
        },
        
        SUBMIT_ERROR: (draft, action) => {
          draft.isSubmitting = false;
          draft.errors = action.payload;
          draft.isValid = false;
        }
      }
    );
    
    super(formReducer);
  }
  
  // Helper methods for form interactions
  setFieldValue(field, value) {
    this.dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value } });
  }
  
  setFieldTouched(field) {
    this.dispatch({ type: 'SET_FIELD_TOUCHED', payload: { field } });
  }
  
  validateField(field, validators = []) {
    const value = this.getState().values[field];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        this.dispatch({ type: 'SET_FIELD_ERROR', payload: { field, error } });
        return false;
      }
    }
    
    return true;
  }
}

// Test form store
console.log('\n=== Form Store Example ===');

const formStore = new FormStore({
  email: '',
  password: '',
  confirmPassword: ''
});

// Email validation
const emailValidator = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(value) ? 'Invalid email format' : null;
};

// Password validation
const passwordValidator = (value) => {
  return value.length < 6 ? 'Password must be at least 6 characters' : null;
};

formStore.setFieldValue('email', 'invalid-email');
formStore.validateField('email', [emailValidator]);

formStore.setFieldValue('email', 'user@example.com');
formStore.validateField('email', [emailValidator]);

console.log('Form state:', formStore.getState());

// Export all implementations
module.exports = {
  BasicReduxStore,
  SimpleImmer,
  ImmerReduxStore,
  applyMiddleware,
  loggerMiddleware,
  thunkMiddleware,
  promiseMiddleware,
  combineReducers,
  createActions,
  createSelector,
  FormStore
};

/**
 * Key Interview Points:
 * 
 * 1. Redux Principles:
 *    - Single source of truth (one global state tree)
 *    - State is read-only (only changed via actions)
 *    - Changes made with pure functions (reducers)
 *    - Predictable state updates
 * 
 * 2. Immer Benefits:
 *    - Write "mutative" logic that produces immutable updates
 *    - Reduces boilerplate for complex state updates
 *    - Better performance for large state objects
 *    - Easier to understand and maintain
 * 
 * 3. Middleware Patterns:
 *    - Intercept actions before they reach reducers
 *    - Add cross-cutting concerns (logging, async, etc.)
 *    - Chain multiple middleware for complex behavior
 *    - Transform actions or handle side effects
 * 
 * 4. Performance Considerations:
 *    - Memoized selectors prevent unnecessary re-computations
 *    - Structural sharing in immutable updates
 *    - Middleware execution order matters
 *    - Avoid creating new objects in selectors
 * 
 * 5. Advanced Patterns:
 *    - Normalized state shape for relational data
 *    - Entity adapters for CRUD operations
 *    - Saga pattern for complex async flows
 *    - Time-travel debugging capabilities
 */