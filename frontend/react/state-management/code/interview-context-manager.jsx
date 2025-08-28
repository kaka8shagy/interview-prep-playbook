/**
 * File: interview-context-manager.jsx
 * Description: Interview question - Build reusable state management with Context
 * Tests advanced Context API usage, performance optimization, and state management patterns
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef, useEffect } from 'react';

// === INTERVIEW QUESTION ===
// Build a reusable state management system using React Context that:
// 1. Provides global application state management
// 2. Supports multiple state slices with different reducers
// 3. Includes middleware support (logging, persistence, etc.)
// 4. Optimizes performance to prevent unnecessary re-renders
// 5. Provides dev tools integration
// 6. Supports async actions and side effects
// 7. Includes state selectors and computed values

// === Core State Manager Implementation ===

class StateManager {
  constructor() {
    this.slices = new Map();
    this.middleware = [];
    this.listeners = new Set();
    this.state = {};
  }
  
  // Register a state slice with its reducer
  registerSlice(name, reducer, initialState) {
    this.slices.set(name, { reducer, initialState });
    this.state[name] = initialState;
  }
  
  // Add middleware
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }
  
  // Dispatch action to specific slice
  dispatch(action) {
    const { slice, ...actionData } = action;
    
    if (!this.slices.has(slice)) {
      console.error(`Slice "${slice}" not registered`);
      return;
    }
    
    const { reducer } = this.slices.get(slice);
    const currentSliceState = this.state[slice];
    
    // Apply middleware
    let processedAction = actionData;
    for (const middleware of this.middleware) {
      processedAction = middleware(processedAction, currentSliceState, this.state);
    }
    
    const newSliceState = reducer(currentSliceState, processedAction);
    
    if (newSliceState !== currentSliceState) {
      this.state = {
        ...this.state,
        [slice]: newSliceState
      };
      
      // Notify listeners
      this.listeners.forEach(listener => listener(this.state, action));
    }
  }
  
  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // Get current state
  getState() {
    return this.state;
  }
  
  // Get specific slice state
  getSliceState(slice) {
    return this.state[slice];
  }
}

// === Context Setup ===

const StateContext = createContext(null);
const DispatchContext = createContext(null);

// === State Manager Provider ===

function StateManagerProvider({ children, devTools = false }) {
  const stateManagerRef = useRef(new StateManager());
  const [state, setState] = useState({});
  
  // Setup state manager on mount
  useEffect(() => {
    const stateManager = stateManagerRef.current;
    
    // Subscribe to state changes
    const unsubscribe = stateManager.subscribe((newState) => {
      setState(newState);
    });
    
    // Dev tools integration
    if (devTools && window.__REDUX_DEVTOOLS_EXTENSION__) {
      const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
      
      stateManager.subscribe((newState, action) => {
        devToolsExtension.send(action, newState);
      });
    }
    
    return unsubscribe;
  }, [devTools]);
  
  const dispatch = useCallback((action) => {
    stateManagerRef.current.dispatch(action);
  }, []);
  
  const contextValue = useMemo(() => ({
    state,
    stateManager: stateManagerRef.current
  }), [state]);
  
  return (
    <StateContext.Provider value={contextValue}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// === Hooks ===

function useStateManager() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateManager must be used within StateManagerProvider');
  }
  return context;
}

function useDispatch() {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) {
    throw new Error('useDispatch must be used within StateManagerProvider');
  }
  return dispatch;
}

// Optimized selector hook to prevent unnecessary re-renders
function useSelector(selector, equalityFn = Object.is) {
  const { state } = useStateManager();
  const selectedValue = useMemo(() => selector(state), [state, selector]);
  
  const prevSelectedValueRef = useRef();
  const [, forceRender] = useState({});
  
  useEffect(() => {
    if (!equalityFn(selectedValue, prevSelectedValueRef.current)) {
      prevSelectedValueRef.current = selectedValue;
      forceRender({});
    }
  });
  
  return selectedValue;
}

// Slice-specific selector
function useSliceSelector(slice, selector = (state) => state) {
  return useSelector((state) => selector(state[slice]));
}

// === Middleware ===

// Logging middleware
const loggingMiddleware = (action, sliceState, fullState) => {
  console.group(`Action: ${action.type}`);
  console.log('Previous state:', sliceState);
  console.log('Action:', action);
  console.groupEnd();
  return action;
};

// Persistence middleware
const persistenceMiddleware = (storageKey) => (action, sliceState, fullState) => {
  if (action.persist !== false) {
    setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(fullState));
    }, 0);
  }
  return action;
};

// Async middleware
const thunkMiddleware = (action, sliceState, fullState) => {
  if (typeof action === 'function') {
    return action(dispatch, () => fullState);
  }
  return action;
};

// === State Slices ===

// User slice
const userSlice = {
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  
  reducer: (state, action) => {
    switch (action.type) {
      case 'user/login/start':
        return { ...state, loading: true, error: null };
        
      case 'user/login/success':
        return {
          ...state,
          loading: false,
          currentUser: action.payload,
          isAuthenticated: true,
          error: null
        };
        
      case 'user/login/failure':
        return {
          ...state,
          loading: false,
          error: action.payload,
          isAuthenticated: false,
          currentUser: null
        };
        
      case 'user/logout':
        return {
          ...state,
          currentUser: null,
          isAuthenticated: false,
          error: null
        };
        
      case 'user/updateProfile':
        return {
          ...state,
          currentUser: { ...state.currentUser, ...action.payload }
        };
        
      default:
        return state;
    }
  }
};

// Todo slice
const todoSlice = {
  initialState: {
    items: [],
    filter: 'all', // 'all', 'active', 'completed'
    loading: false
  },
  
  reducer: (state, action) => {
    switch (action.type) {
      case 'todos/add':
        return {
          ...state,
          items: [
            ...state.items,
            {
              id: Date.now(),
              text: action.payload.text,
              completed: false,
              createdAt: new Date().toISOString()
            }
          ]
        };
        
      case 'todos/toggle':
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, completed: !item.completed }
              : item
          )
        };
        
      case 'todos/remove':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
        
      case 'todos/update':
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, text: action.payload.text }
              : item
          )
        };
        
      case 'todos/setFilter':
        return {
          ...state,
          filter: action.payload.filter
        };
        
      case 'todos/clearCompleted':
        return {
          ...state,
          items: state.items.filter(item => !item.completed)
        };
        
      case 'todos/loadStart':
        return { ...state, loading: true };
        
      case 'todos/loadSuccess':
        return { ...state, loading: false, items: action.payload.items };
        
      default:
        return state;
    }
  }
};

// UI slice
const uiSlice = {
  initialState: {
    sidebarOpen: false,
    theme: 'light',
    notifications: [],
    modals: {}
  },
  
  reducer: (state, action) => {
    switch (action.type) {
      case 'ui/toggleSidebar':
        return { ...state, sidebarOpen: !state.sidebarOpen };
        
      case 'ui/setSidebar':
        return { ...state, sidebarOpen: action.payload.open };
        
      case 'ui/setTheme':
        return { ...state, theme: action.payload.theme };
        
      case 'ui/addNotification':
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), ...action.payload }
          ]
        };
        
      case 'ui/removeNotification':
        return {
          ...state,
          notifications: state.notifications.filter(
            notification => notification.id !== action.payload.id
          )
        };
        
      case 'ui/openModal':
        return {
          ...state,
          modals: { ...state.modals, [action.payload.id]: action.payload.props }
        };
        
      case 'ui/closeModal':
        const { [action.payload.id]: removed, ...restModals } = state.modals;
        return { ...state, modals: restModals };
        
      default:
        return state;
    }
  }
};

// === Action Creators ===

// Async action creators (thunks)
const userActions = {
  login: (credentials) => async (dispatch, getState) => {
    dispatch({ slice: 'user', type: 'user/login/start' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.username === 'admin' && credentials.password === 'password') {
        const user = {
          id: 1,
          username: credentials.username,
          email: 'admin@example.com',
          role: 'admin'
        };
        
        dispatch({
          slice: 'user',
          type: 'user/login/success',
          payload: user
        });
        
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      dispatch({
        slice: 'user',
        type: 'user/login/failure',
        payload: error.message
      });
      throw error;
    }
  },
  
  logout: () => (dispatch) => {
    dispatch({ slice: 'user', type: 'user/logout', persist: false });
    localStorage.removeItem('authToken');
  },
  
  updateProfile: (updates) => (dispatch) => {
    dispatch({
      slice: 'user',
      type: 'user/updateProfile',
      payload: updates
    });
  }
};

const todoActions = {
  add: (text) => ({
    slice: 'todos',
    type: 'todos/add',
    payload: { text }
  }),
  
  toggle: (id) => ({
    slice: 'todos',
    type: 'todos/toggle',
    payload: { id }
  }),
  
  remove: (id) => ({
    slice: 'todos',
    type: 'todos/remove',
    payload: { id }
  }),
  
  update: (id, text) => ({
    slice: 'todos',
    type: 'todos/update',
    payload: { id, text }
  }),
  
  setFilter: (filter) => ({
    slice: 'todos',
    type: 'todos/setFilter',
    payload: { filter }
  }),
  
  clearCompleted: () => ({
    slice: 'todos',
    type: 'todos/clearCompleted'
  }),
  
  loadTodos: () => async (dispatch) => {
    dispatch({ slice: 'todos', type: 'todos/loadStart' });
    
    try {
      // Simulate API call
      const response = await fetch('/api/todos');
      const todos = await response.json();
      
      dispatch({
        slice: 'todos',
        type: 'todos/loadSuccess',
        payload: { items: todos }
      });
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  }
};

const uiActions = {
  toggleSidebar: () => ({
    slice: 'ui',
    type: 'ui/toggleSidebar'
  }),
  
  setTheme: (theme) => ({
    slice: 'ui',
    type: 'ui/setTheme',
    payload: { theme }
  }),
  
  showNotification: (message, type = 'info', duration = 5000) => (dispatch) => {
    const id = Date.now();
    
    dispatch({
      slice: 'ui',
      type: 'ui/addNotification',
      payload: { id, message, type, duration }
    });
    
    if (duration > 0) {
      setTimeout(() => {
        dispatch({
          slice: 'ui',
          type: 'ui/removeNotification',
          payload: { id }
        });
      }, duration);
    }
  },
  
  openModal: (id, props = {}) => ({
    slice: 'ui',
    type: 'ui/openModal',
    payload: { id, props }
  }),
  
  closeModal: (id) => ({
    slice: 'ui',
    type: 'ui/closeModal',
    payload: { id }
  })
};

// === Selectors ===

const userSelectors = {
  getCurrentUser: (state) => state.user?.currentUser,
  isAuthenticated: (state) => state.user?.isAuthenticated || false,
  isLoading: (state) => state.user?.loading || false,
  getError: (state) => state.user?.error
};

const todoSelectors = {
  getAllTodos: (state) => state.todos?.items || [],
  getVisibleTodos: (state) => {
    const todos = state.todos?.items || [];
    const filter = state.todos?.filter || 'all';
    
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  },
  getTodoCount: (state) => {
    const todos = state.todos?.items || [];
    return {
      total: todos.length,
      active: todos.filter(todo => !todo.completed).length,
      completed: todos.filter(todo => todo.completed).length
    };
  },
  getCurrentFilter: (state) => state.todos?.filter || 'all'
};

const uiSelectors = {
  isSidebarOpen: (state) => state.ui?.sidebarOpen || false,
  getTheme: (state) => state.ui?.theme || 'light',
  getNotifications: (state) => state.ui?.notifications || [],
  getModal: (id) => (state) => state.ui?.modals[id] || null,
  isModalOpen: (id) => (state) => Boolean(state.ui?.modals[id])
};

// === Setup Hook ===

function useStateManagerSetup() {
  const { stateManager } = useStateManager();
  
  useEffect(() => {
    // Register slices
    stateManager.registerSlice('user', userSlice.reducer, userSlice.initialState);
    stateManager.registerSlice('todos', todoSlice.reducer, todoSlice.initialState);
    stateManager.registerSlice('ui', uiSlice.reducer, uiSlice.initialState);
    
    // Add middleware
    stateManager.addMiddleware(loggingMiddleware);
    stateManager.addMiddleware(thunkMiddleware);
    stateManager.addMiddleware(persistenceMiddleware('appState'));
    
    // Load persisted state
    try {
      const persistedState = localStorage.getItem('appState');
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        // You would need to implement state restoration logic here
        console.log('Loaded persisted state:', parsedState);
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }, [stateManager]);
}

// === Demo Components ===

function LoginForm() {
  const dispatch = useDispatch();
  const currentUser = useSelector(userSelectors.getCurrentUser);
  const isLoading = useSelector(userSelectors.isLoading);
  const error = useSelector(userSelectors.getError);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(userActions.login(credentials));
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleLogout = () => {
    dispatch(userActions.logout());
  };
  
  if (currentUser) {
    return (
      <div>
        <h3>Welcome, {currentUser.username}!</h3>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h3>Login</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div>
        <input
          type="text"
          placeholder="Username (try: admin)"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password (try: password)"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

function TodoApp() {
  const dispatch = useDispatch();
  const todos = useSelector(todoSelectors.getVisibleTodos);
  const todoCount = useSelector(todoSelectors.getTodoCount);
  const currentFilter = useSelector(todoSelectors.getCurrentFilter);
  const [newTodo, setNewTodo] = useState('');
  
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      dispatch(todoActions.add(newTodo.trim()));
      setNewTodo('');
    }
  };
  
  return (
    <div>
      <h3>Todo List</h3>
      
      <form onSubmit={handleAddTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>
      
      <div>
        <button
          onClick={() => dispatch(todoActions.setFilter('all'))}
          style={{ fontWeight: currentFilter === 'all' ? 'bold' : 'normal' }}
        >
          All ({todoCount.total})
        </button>
        <button
          onClick={() => dispatch(todoActions.setFilter('active'))}
          style={{ fontWeight: currentFilter === 'active' ? 'bold' : 'normal' }}
        >
          Active ({todoCount.active})
        </button>
        <button
          onClick={() => dispatch(todoActions.setFilter('completed'))}
          style={{ fontWeight: currentFilter === 'completed' ? 'bold' : 'normal' }}
        >
          Completed ({todoCount.completed})
        </button>
      </div>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(todoActions.toggle(todo.id))}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(todoActions.remove(todo.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      {todoCount.completed > 0 && (
        <button onClick={() => dispatch(todoActions.clearCompleted())}>
          Clear Completed
        </button>
      )}
    </div>
  );
}

function ThemeControls() {
  const dispatch = useDispatch();
  const theme = useSelector(uiSelectors.getTheme);
  const sidebarOpen = useSelector(uiSelectors.isSidebarOpen);
  
  return (
    <div>
      <h3>UI Controls</h3>
      
      <div>
        <label>
          Theme:
          <select
            value={theme}
            onChange={(e) => dispatch(uiActions.setTheme(e.target.value))}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </label>
      </div>
      
      <div>
        <button onClick={() => dispatch(uiActions.toggleSidebar())}>
          {sidebarOpen ? 'Close' : 'Open'} Sidebar
        </button>
      </div>
      
      <div>
        <button
          onClick={() => dispatch(uiActions.showNotification('Hello World!', 'info'))}
        >
          Show Notification
        </button>
      </div>
    </div>
  );
}

function NotificationList() {
  const notifications = useSelector(uiSelectors.getNotifications);
  
  if (notifications.length === 0) return null;
  
  return (
    <div style={{ position: 'fixed', top: 10, right: 10 }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            background: notification.type === 'error' ? '#ffebee' : '#e3f2fd',
            padding: '10px',
            margin: '5px 0',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

// === Main Demo App ===

function ContextManagerDemo() {
  useStateManagerSetup();
  
  return (
    <div>
      <h1>Advanced Context State Manager Demo</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <LoginForm />
        </div>
        
        <div>
          <ThemeControls />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <TodoApp />
        </div>
      </div>
      
      <NotificationList />
    </div>
  );
}

// === App with Provider ===

function App() {
  return (
    <StateManagerProvider devTools={process.env.NODE_ENV === 'development'}>
      <ContextManagerDemo />
    </StateManagerProvider>
  );
}

export default App;
export {
  StateManagerProvider,
  useStateManager,
  useDispatch,
  useSelector,
  useSliceSelector,
  userActions,
  todoActions,
  uiActions,
  userSelectors,
  todoSelectors,
  uiSelectors,
  ContextManagerDemo
};