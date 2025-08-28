/**
 * File: context-basics.jsx
 * Description: Basic React Context API patterns and usage
 */

import React, { createContext, useContext, useState, useReducer, useCallback } from 'react';

// === Basic Context Example ===
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  const value = {
    theme,
    toggleTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// === User Authentication Context ===
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: 1,
          email,
          name: 'Admin User',
          role: 'admin'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
  }, []);
  
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser = {
        id: Date.now(),
        ...userData,
        role: 'user'
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Check for existing session on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Invalid saved user data');
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// === Shopping Cart Context with useReducer ===
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    case 'APPLY_DISCOUNT':
      return {
        ...state,
        discount: action.payload
      };
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    discount: null
  });
  
  const addItem = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);
  
  const removeItem = useCallback((itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }, []);
  
  const updateQuantity = useCallback((itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);
  
  const applyDiscount = useCallback((discount) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: discount });
  }, []);
  
  // Computed values
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = state.discount ? subtotal * (state.discount.percentage / 100) : 0;
  const total = subtotal - discountAmount;
  
  const value = {
    items: state.items,
    discount: state.discount,
    itemCount,
    subtotal,
    discountAmount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// === Notification Context ===
const NotificationContext = createContext();

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// === Demo Components ===
function ThemeToggler() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`theme-demo theme-${theme}`}>
      <h3>Current theme: {theme}</h3>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} theme
      </button>
    </div>
  );
}

function LoginForm() {
  const { login, loading, error, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };
  
  if (isAuthenticated) {
    return (
      <div className="user-info">
        <h3>Welcome, {user.name}!</h3>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h3>Login</h3>
      {error && <div className="error">{error}</div>}
      
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      <small>Try: admin@example.com / password</small>
    </form>
  );
}

function ShoppingCartDemo() {
  const { items, itemCount, total, addItem, removeItem, clearCart } = useCart();
  
  const sampleProducts = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 25 },
    { id: 3, name: 'Keyboard', price: 75 }
  ];
  
  return (
    <div className="cart-demo">
      <h3>Shopping Cart ({itemCount} items)</h3>
      
      <div className="products">
        <h4>Available Products:</h4>
        {sampleProducts.map(product => (
          <div key={product.id} className="product">
            <span>{product.name} - ${product.price}</span>
            <button onClick={() => addItem(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-items">
        <h4>Cart Items:</h4>
        {items.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <>
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            ))}
            <div className="cart-total">
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
            <button onClick={clearCart}>Clear Cart</button>
          </>
        )}
      </div>
    </div>
  );
}

function NotificationDemo() {
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  const showNotification = (type) => {
    addNotification({
      type,
      message: `This is a ${type} notification`,
      title: `${type.charAt(0).toUpperCase()}${type.slice(1)} Alert`
    });
  };
  
  return (
    <div className="notification-demo">
      <h3>Notifications</h3>
      
      <div className="notification-buttons">
        <button onClick={() => showNotification('info')}>Info</button>
        <button onClick={() => showNotification('success')}>Success</button>
        <button onClick={() => showNotification('warning')}>Warning</button>
        <button onClick={() => showNotification('error')}>Error</button>
      </div>
      
      <div className="notifications-container">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification notification-${notification.type}`}
          >
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <button onClick={() => removeNotification(notification.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Main Demo Component ===
function ContextBasicsDemo() {
  const { logout, isAuthenticated } = useAuth();
  
  return (
    <div className="context-demo">
      <h1>React Context Basics Demo</h1>
      
      <section>
        <h2>Theme Context</h2>
        <ThemeToggler />
      </section>
      
      <section>
        <h2>Authentication Context</h2>
        <LoginForm />
        {isAuthenticated && (
          <button onClick={logout}>Logout</button>
        )}
      </section>
      
      <section>
        <h2>Shopping Cart Context</h2>
        <ShoppingCartDemo />
      </section>
      
      <section>
        <h2>Notification Context</h2>
        <NotificationDemo />
      </section>
    </div>
  );
}

// === App with All Providers ===
function AppWithProviders() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <ContextBasicsDemo />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppWithProviders;
export {
  ThemeProvider,
  useTheme,
  AuthProvider,
  useAuth,
  CartProvider,
  useCart,
  NotificationProvider,
  useNotifications,
  ContextBasicsDemo
};