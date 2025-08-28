/**
 * File: state-scope.jsx
 * Description: State scope decisions - when to use local vs global state
 * Demonstrates proper state placement strategies and common patterns
 */

import React, { useState, useContext, createContext, useCallback, useMemo } from 'react';

// === Global State Context ===
const AppStateContext = createContext();

function AppStateProvider({ children }) {
  const [globalState, setGlobalState] = useState({
    user: { id: 1, name: 'John Doe', theme: 'light' },
    notifications: [],
    shoppingCart: { items: [], total: 0 }
  });
  
  const updateGlobalState = useCallback((updates) => {
    setGlobalState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const value = useMemo(() => ({
    ...globalState,
    updateGlobalState
  }), [globalState, updateGlobalState]);
  
  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

// === COMPONENT EXAMPLES ===

// 1. LOCAL STATE: Form input (temporary, component-specific)
function ContactForm() {
  // ✅ LOCAL STATE - Form data is temporary and specific to this component
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      
      // Reset form after successful submission
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h3>Contact Form (Local State Example)</h3>
      
      <div>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange('name')}
        />
        {validationErrors.name && <span className="error">{validationErrors.name}</span>}
      </div>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange('email')}
        />
        {validationErrors.email && <span className="error">{validationErrors.email}</span>}
      </div>
      
      <div>
        <textarea
          placeholder="Message"
          value={formData.message}
          onChange={handleInputChange('message')}
        />
        {validationErrors.message && <span className="error">{validationErrors.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

// 2. GLOBAL STATE: User profile (shared across components)
function UserProfile() {
  const { user, updateGlobalState } = useAppState();
  // ❌ DON'T put editing state in global - it's temporary
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);
  
  const handleSave = () => {
    updateGlobalState({ user: editData });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div>
        <h3>Edit Profile</h3>
        <input
          value={editData.name}
          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
        />
        <select
          value={editData.theme}
          onChange={(e) => setEditData(prev => ({ ...prev, theme: e.target.value }))}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }
  
  return (
    <div>
      <h3>User Profile (Global State Example)</h3>
      <p>Name: {user.name}</p>
      <p>Theme: {user.theme}</p>
      <button onClick={() => setIsEditing(true)}>Edit Profile</button>
    </div>
  );
}

// 3. MIXED STATE: Shopping cart item (local UI state + global cart state)
function ProductCard({ product }) {
  const { shoppingCart, updateGlobalState } = useAppState();
  
  // ✅ LOCAL STATE - UI-specific state that doesn't need to persist
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Check if item is already in cart (derived from global state)
  const itemInCart = shoppingCart.items.find(item => item.id === product.id);
  
  const addToCart = async () => {
    setIsAdding(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ✅ GLOBAL STATE - Cart data that needs to persist and be shared
    const updatedItems = itemInCart
      ? shoppingCart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...shoppingCart.items, { ...product, quantity }];
    
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    updateGlobalState({
      shoppingCart: { items: updatedItems, total }
    });
    
    setIsAdding(false);
    setQuantity(1); // Reset local quantity after adding
  };
  
  return (
    <div className="product-card">
      <h4>{product.name}</h4>
      <p>${product.price}</p>
      
      {/* Local UI state */}
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? 'Hide' : 'Show'} Details
      </button>
      
      {showDetails && (
        <div>
          <p>{product.description}</p>
        </div>
      )}
      
      <div>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        />
        <button onClick={addToCart} disabled={isAdding}>
          {isAdding ? 'Adding...' : `Add to Cart`}
        </button>
      </div>
      
      {itemInCart && (
        <p>In cart: {itemInCart.quantity}</p>
      )}
    </div>
  );
}

// 4. LIFTED STATE: Search functionality shared between components
function ProductSearch({ onFiltersChange }) {
  // ✅ LOCAL STATE - Search is temporary and specific to this component
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  
  // But we lift the results up to parent component that needs them
  React.useEffect(() => {
    onFiltersChange({ searchTerm, category, priceRange });
  }, [searchTerm, category, priceRange, onFiltersChange]);
  
  return (
    <div>
      <h3>Product Search (Lifted State Example)</h3>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
      </select>
      
      <div>
        <input
          type="range"
          min="0"
          max="1000"
          value={priceRange.max}
          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
        />
        <span>Max: ${priceRange.max}</span>
      </div>
    </div>
  );
}

function ProductList() {
  const [products] = useState([
    { id: 1, name: 'Laptop', price: 999, category: 'electronics', description: 'High-performance laptop' },
    { id: 2, name: 'T-Shirt', price: 25, category: 'clothing', description: 'Comfortable cotton t-shirt' },
    { id: 3, name: 'Book', price: 15, category: 'books', description: 'Interesting novel' }
  ]);
  
  // ✅ LOCAL STATE - Filter results are derived and don't need global persistence
  const [filters, setFilters] = useState({ searchTerm: '', category: 'all', priceRange: { min: 0, max: 1000 } });
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      const matchesPrice = product.price <= filters.priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, filters]);
  
  return (
    <div>
      <ProductSearch onFiltersChange={setFilters} />
      
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <p>No products found matching your criteria.</p>
      )}
    </div>
  );
}

// 5. SERVER STATE: Data fetched from API (different from client state)
function UserSettings() {
  // ✅ SERVER STATE - Data from API that might be cached/synchronized
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ LOCAL STATE - UI state for editing
  const [isDirty, setIsDirty] = useState(false);
  const [localSettings, setLocalSettings] = useState(null);
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userSettings = {
        notifications: true,
        darkMode: false,
        language: 'en'
      };
      setSettings(userSettings);
      setLocalSettings(userSettings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettings(localSettings);
      setIsDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchSettings();
  }, []);
  
  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };
  
  if (loading && !settings) return <div>Loading settings...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!settings) return <div>No settings available</div>;
  
  return (
    <div>
      <h3>User Settings (Server State Example)</h3>
      
      <label>
        <input
          type="checkbox"
          checked={localSettings?.notifications || false}
          onChange={(e) => handleSettingChange('notifications', e.target.checked)}
        />
        Enable notifications
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={localSettings?.darkMode || false}
          onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
        />
        Dark mode
      </label>
      
      <select
        value={localSettings?.language || 'en'}
        onChange={(e) => handleSettingChange('language', e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
      
      {isDirty && (
        <div>
          <button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => {
            setLocalSettings(settings);
            setIsDirty(false);
          }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// 6. COMPUTED/DERIVED STATE: Values calculated from other state
function ShoppingCartSummary() {
  const { shoppingCart } = useAppState();
  
  // ✅ DERIVED STATE - Computed from global state, no need to store separately
  const summary = useMemo(() => {
    const { items } = shoppingCart;
    
    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      tax: items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08,
      shipping: items.length > 0 ? (shoppingCart.total > 100 ? 0 : 10) : 0
    };
  }, [shoppingCart]);
  
  const total = summary.subtotal + summary.tax + summary.shipping;
  
  if (shoppingCart.items.length === 0) {
    return <div>Your cart is empty</div>;
  }
  
  return (
    <div>
      <h3>Cart Summary (Derived State Example)</h3>
      <p>Items: {summary.itemCount}</p>
      <p>Subtotal: ${summary.subtotal.toFixed(2)}</p>
      <p>Tax: ${summary.tax.toFixed(2)}</p>
      <p>Shipping: ${summary.shipping.toFixed(2)}</p>
      <hr />
      <p><strong>Total: ${total.toFixed(2)}</strong></p>
    </div>
  );
}

// === STATE SCOPE DECISION TREE ===

const StateScopeGuide = () => (
  <div>
    <h2>State Scope Decision Guide</h2>
    
    <div className="decision-tree">
      <h3>Questions to Ask:</h3>
      <ul>
        <li><strong>Who needs this state?</strong>
          <ul>
            <li>Single component → Local state</li>
            <li>Multiple related components → Lift to common parent</li>
            <li>Unrelated components → Global state</li>
          </ul>
        </li>
        
        <li><strong>How long should it persist?</strong>
          <ul>
            <li>During component lifetime → Local state</li>
            <li>During user session → Global state</li>
            <li>Across sessions → Local/Session Storage + Global</li>
          </ul>
        </li>
        
        <li><strong>What type of data is it?</strong>
          <ul>
            <li>UI state (modals, forms, toggles) → Usually local</li>
            <li>User data (profile, settings) → Usually global</li>
            <li>Server data (API responses) → Server state management</li>
            <li>Derived data → Computed/memoized</li>
          </ul>
        </li>
        
        <li><strong>How often does it change?</strong>
          <ul>
            <li>Frequently (input values) → Local state</li>
            <li>Occasionally (user settings) → Global state</li>
            <li>Rarely (app configuration) → Context or constants</li>
          </ul>
        </li>
      </ul>
    </div>
    
    <div className="examples">
      <h3>Common Patterns:</h3>
      <ul>
        <li><strong>Local State:</strong> Form inputs, UI toggles, component-specific flags</li>
        <li><strong>Lifted State:</strong> Shared between siblings, parent manages</li>
        <li><strong>Global State:</strong> User profile, shopping cart, theme settings</li>
        <li><strong>Server State:</strong> API data, cache management, synchronization</li>
        <li><strong>Derived State:</strong> Computed values, filtered lists, totals</li>
      </ul>
    </div>
  </div>
);

// === Demo App ===
function StateScopeDemo() {
  return (
    <AppStateProvider>
      <div>
        <h1>State Scope Examples</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ContactForm />
          <UserProfile />
          <UserSettings />
          <ShoppingCartSummary />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <ProductList />
        </div>
        
        <StateScopeGuide />
      </div>
    </AppStateProvider>
  );
}

export default StateScopeDemo;
export {
  AppStateProvider,
  useAppState,
  ContactForm,
  UserProfile,
  ProductCard,
  ProductSearch,
  ProductList,
  UserSettings,
  ShoppingCartSummary,
  StateScopeGuide
};