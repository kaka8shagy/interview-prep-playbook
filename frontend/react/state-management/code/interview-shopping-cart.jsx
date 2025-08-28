/**
 * File: interview-shopping-cart.jsx
 * Description: Complete shopping cart implementation with useReducer - interview question
 * Tests complex state management, reducer patterns, and Context API integration
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// === Cart State Structure ===
const initialCartState = {
  items: [],
  discounts: [],
  shippingInfo: null,
  paymentMethod: null,
  status: 'idle', // idle, calculating, checkout, complete
  errors: {},
  metadata: {
    lastUpdated: Date.now(),
    sessionId: Math.random().toString(36).substr(2, 9)
  }
};

// === Action Types ===
const CART_ACTIONS = {
  // Item operations
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_ITEMS: 'CLEAR_ITEMS',
  
  // Batch operations
  BATCH_UPDATE_ITEMS: 'BATCH_UPDATE_ITEMS',
  RESTORE_CART: 'RESTORE_CART',
  
  // Discounts
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  REMOVE_DISCOUNT: 'REMOVE_DISCOUNT',
  
  // Checkout flow
  SET_SHIPPING_INFO: 'SET_SHIPPING_INFO',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  SET_STATUS: 'SET_STATUS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  
  // Complete flow
  COMPLETE_CHECKOUT: 'COMPLETE_CHECKOUT',
  RESET_CART: 'RESET_CART'
};

// === Helper Functions ===
const calculateItemTotal = (item) => {
  const baseTotal = item.price * item.quantity;
  const itemDiscounts = item.discounts?.reduce((total, discount) => {
    return total + (discount.type === 'percentage' 
      ? baseTotal * (discount.value / 100)
      : discount.value
    );
  }, 0) || 0;
  
  return Math.max(0, baseTotal - itemDiscounts);
};

const findItemIndex = (items, productId, variantId = null) => {
  return items.findIndex(item => 
    item.productId === productId && 
    (variantId ? item.variantId === variantId : !item.variantId)
  );
};

const validateQuantity = (quantity, maxStock = Infinity) => {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 0) return 0;
  return Math.min(qty, maxStock);
};

// === Complex Cart Reducer ===
const cartReducer = (state, action) => {
  const updateMetadata = (newState) => ({
    ...newState,
    metadata: {
      ...state.metadata,
      lastUpdated: Date.now()
    }
  });
  
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1, variant = null } = action.payload;
      const itemIndex = findItemIndex(state.items, product.id, variant?.id);
      
      if (itemIndex >= 0) {
        // Update existing item
        const existingItem = state.items[itemIndex];
        const newQuantity = validateQuantity(
          existingItem.quantity + quantity,
          product.stock || variant?.stock
        );
        
        const updatedItems = state.items.map((item, index) =>
          index === itemIndex 
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        return updateMetadata({
          ...state,
          items: updatedItems
        });
      } else {
        // Add new item
        const newItem = {
          id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
          productId: product.id,
          variantId: variant?.id || null,
          name: product.name,
          price: variant?.price || product.price,
          image: variant?.image || product.image,
          variant: variant,
          quantity: validateQuantity(quantity, product.stock || variant?.stock),
          addedAt: Date.now()
        };
        
        return updateMetadata({
          ...state,
          items: [...state.items, newItem]
        });
      }
    }
    
    case CART_ACTIONS.REMOVE_ITEM: {
      return updateMetadata({
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId)
      });
    }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      const updatedItems = state.items.map(item => {
        if (item.id === itemId) {
          const newQuantity = validateQuantity(quantity);
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
      
      return updateMetadata({
        ...state,
        items: updatedItems
      });
    }
    
    case CART_ACTIONS.BATCH_UPDATE_ITEMS: {
      const updates = action.payload.updates; // Array of { itemId, quantity }
      const updatedItems = state.items.map(item => {
        const update = updates.find(u => u.itemId === item.id);
        if (update) {
          const newQuantity = validateQuantity(update.quantity);
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
      
      return updateMetadata({
        ...state,
        items: updatedItems
      });
    }
    
    case CART_ACTIONS.APPLY_DISCOUNT: {
      const { discount } = action.payload;
      const existingIndex = state.discounts.findIndex(d => d.code === discount.code);
      
      if (existingIndex >= 0) {
        // Update existing discount
        const updatedDiscounts = state.discounts.map((d, index) =>
          index === existingIndex ? discount : d
        );
        return updateMetadata({
          ...state,
          discounts: updatedDiscounts
        });
      } else {
        // Add new discount
        return updateMetadata({
          ...state,
          discounts: [...state.discounts, discount]
        });
      }
    }
    
    case CART_ACTIONS.REMOVE_DISCOUNT: {
      return updateMetadata({
        ...state,
        discounts: state.discounts.filter(d => d.code !== action.payload.code)
      });
    }
    
    case CART_ACTIONS.SET_SHIPPING_INFO: {
      return updateMetadata({
        ...state,
        shippingInfo: action.payload.shippingInfo,
        errors: { ...state.errors, shipping: null }
      });
    }
    
    case CART_ACTIONS.SET_PAYMENT_METHOD: {
      return updateMetadata({
        ...state,
        paymentMethod: action.payload.paymentMethod,
        errors: { ...state.errors, payment: null }
      });
    }
    
    case CART_ACTIONS.SET_STATUS: {
      return updateMetadata({
        ...state,
        status: action.payload.status
      });
    }
    
    case CART_ACTIONS.SET_ERROR: {
      return updateMetadata({
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      });
    }
    
    case CART_ACTIONS.CLEAR_ERRORS: {
      return updateMetadata({
        ...state,
        errors: {}
      });
    }
    
    case CART_ACTIONS.COMPLETE_CHECKOUT: {
      return updateMetadata({
        ...state,
        status: 'complete',
        completedAt: Date.now(),
        orderId: action.payload.orderId
      });
    }
    
    case CART_ACTIONS.RESET_CART: {
      return {
        ...initialCartState,
        metadata: {
          lastUpdated: Date.now(),
          sessionId: Math.random().toString(36).substr(2, 9)
        }
      };
    }
    
    case CART_ACTIONS.RESTORE_CART: {
      return updateMetadata({
        ...state,
        ...action.payload.cartData
      });
    }
    
    default:
      throw new Error(`Unknown cart action: ${action.type}`);
  }
};

// === Cart Context ===
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  
  // === Action Creators ===
  const addItem = useCallback((product, quantity = 1, variant = null) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity, variant }
    });
  }, []);
  
  const removeItem = useCallback((itemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { itemId }
    });
  }, []);
  
  const updateQuantity = useCallback((itemId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, quantity }
    });
  }, []);
  
  const batchUpdateItems = useCallback((updates) => {
    dispatch({
      type: CART_ACTIONS.BATCH_UPDATE_ITEMS,
      payload: { updates }
    });
  }, []);
  
  const applyDiscount = useCallback((discount) => {
    dispatch({
      type: CART_ACTIONS.APPLY_DISCOUNT,
      payload: { discount }
    });
  }, []);
  
  const removeDiscount = useCallback((code) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_DISCOUNT,
      payload: { code }
    });
  }, []);
  
  const setShippingInfo = useCallback((shippingInfo) => {
    dispatch({
      type: CART_ACTIONS.SET_SHIPPING_INFO,
      payload: { shippingInfo }
    });
  }, []);
  
  const setPaymentMethod = useCallback((paymentMethod) => {
    dispatch({
      type: CART_ACTIONS.SET_PAYMENT_METHOD,
      payload: { paymentMethod }
    });
  }, []);
  
  const setError = useCallback((field, message) => {
    dispatch({
      type: CART_ACTIONS.SET_ERROR,
      payload: { field, message }
    });
  }, []);
  
  const clearErrors = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERRORS });
  }, []);
  
  const completeCheckout = useCallback(async () => {
    dispatch({
      type: CART_ACTIONS.SET_STATUS,
      payload: { status: 'checkout' }
    });
    
    try {
      // Simulate checkout API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderId = `ORD-${Date.now()}`;
      dispatch({
        type: CART_ACTIONS.COMPLETE_CHECKOUT,
        payload: { orderId }
      });
      
      return { success: true, orderId };
    } catch (error) {
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: { field: 'checkout', message: error.message }
      });
      
      dispatch({
        type: CART_ACTIONS.SET_STATUS,
        payload: { status: 'idle' }
      });
      
      return { success: false, error: error.message };
    }
  }, []);
  
  const resetCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.RESET_CART });
  }, []);
  
  // === Computed Values ===
  const computedValues = useMemo(() => {
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = state.items.reduce((total, item) => total + calculateItemTotal(item), 0);
    
    // Calculate total discounts
    const totalDiscounts = state.discounts.reduce((total, discount) => {
      if (discount.type === 'percentage') {
        return total + (subtotal * (discount.value / 100));
      } else if (discount.type === 'fixed') {
        return total + discount.value;
      }
      return total;
    }, 0);
    
    // Calculate shipping
    const shippingCost = state.shippingInfo?.cost || 0;
    
    // Calculate tax (8% for example)
    const taxRate = 0.08;
    const taxableAmount = Math.max(0, subtotal - totalDiscounts);
    const tax = taxableAmount * taxRate;
    
    // Calculate total
    const total = Math.max(0, subtotal - totalDiscounts + shippingCost + tax);
    
    return {
      itemCount,
      subtotal,
      totalDiscounts,
      shippingCost,
      tax,
      total,
      isEmpty: state.items.length === 0,
      isCheckoutReady: state.items.length > 0 && 
                      state.shippingInfo && 
                      state.paymentMethod &&
                      Object.keys(state.errors).length === 0
    };
  }, [state.items, state.discounts, state.shippingInfo, state.errors]);
  
  // === Cart Persistence ===
  React.useEffect(() => {
    const cartData = {
      items: state.items,
      discounts: state.discounts,
      shippingInfo: state.shippingInfo,
      paymentMethod: state.paymentMethod
    };
    localStorage.setItem('shopping-cart', JSON.stringify(cartData));
  }, [state.items, state.discounts, state.shippingInfo, state.paymentMethod]);
  
  // Load persisted cart on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.RESTORE_CART,
          payload: { cartData }
        });
      } catch (error) {
        console.error('Failed to restore cart:', error);
      }
    }
  }, []);
  
  const contextValue = {
    // State
    items: state.items,
    discounts: state.discounts,
    shippingInfo: state.shippingInfo,
    paymentMethod: state.paymentMethod,
    status: state.status,
    errors: state.errors,
    metadata: state.metadata,
    
    // Computed values
    ...computedValues,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    batchUpdateItems,
    applyDiscount,
    removeDiscount,
    setShippingInfo,
    setPaymentMethod,
    setError,
    clearErrors,
    completeCheckout,
    resetCart
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// === Demo Components ===
function ProductCatalog() {
  const { addItem } = useCart();
  
  const products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 199.99,
      image: 'headphones.jpg',
      stock: 10,
      variants: [
        { id: 'black', name: 'Black', price: 199.99, stock: 5 },
        { id: 'white', name: 'White', price: 209.99, stock: 3 }
      ]
    },
    {
      id: 2,
      name: 'Smartphone',
      price: 699.99,
      image: 'phone.jpg',
      stock: 5
    },
    {
      id: 3,
      name: 'Laptop',
      price: 1299.99,
      image: 'laptop.jpg',
      stock: 2
    }
  ];
  
  return (
    <div className="product-catalog">
      <h2>Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>Stock: {product.stock}</p>
            
            {product.variants ? (
              <div className="variants">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => addItem(product, 1, variant)}
                    disabled={variant.stock === 0}
                  >
                    Add {variant.name} (${variant.price})
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => addItem(product)}
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CartSummary() {
  const {
    items,
    itemCount,
    subtotal,
    totalDiscounts,
    shippingCost,
    tax,
    total,
    removeItem,
    updateQuantity
  } = useCart();
  
  if (items.length === 0) {
    return <div className="cart-summary">Your cart is empty</div>;
  }
  
  return (
    <div className="cart-summary">
      <h2>Cart Summary ({itemCount} items)</h2>
      
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h4>{item.name}</h4>
              {item.variant && <span>Variant: {item.variant.name}</span>}
              <span>${item.price}</span>
            </div>
            <div className="item-controls">
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, e.target.value)}
              />
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
            <div className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-totals">
        <div>Subtotal: ${subtotal.toFixed(2)}</div>
        {totalDiscounts > 0 && <div>Discounts: -${totalDiscounts.toFixed(2)}</div>}
        {shippingCost > 0 && <div>Shipping: ${shippingCost.toFixed(2)}</div>}
        <div>Tax: ${tax.toFixed(2)}</div>
        <div className="total"><strong>Total: ${total.toFixed(2)}</strong></div>
      </div>
    </div>
  );
}

function DiscountCode() {
  const { discounts, applyDiscount, removeDiscount } = useCart();
  const [code, setCode] = React.useState('');
  
  const availableDiscounts = {
    'SAVE10': { code: 'SAVE10', type: 'percentage', value: 10, description: '10% off' },
    'SAVE20': { code: 'SAVE20', type: 'fixed', value: 20, description: '$20 off' },
    'WELCOME': { code: 'WELCOME', type: 'percentage', value: 15, description: '15% off for new customers' }
  };
  
  const handleApplyDiscount = () => {
    const discount = availableDiscounts[code.toUpperCase()];
    if (discount) {
      applyDiscount(discount);
      setCode('');
    } else {
      alert('Invalid discount code');
    }
  };
  
  return (
    <div className="discount-section">
      <h3>Discount Codes</h3>
      
      <div className="discount-input">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter discount code"
        />
        <button onClick={handleApplyDiscount}>Apply</button>
      </div>
      
      <div className="applied-discounts">
        {discounts.map(discount => (
          <div key={discount.code} className="applied-discount">
            <span>{discount.code} - {discount.description}</span>
            <button onClick={() => removeDiscount(discount.code)}>Remove</button>
          </div>
        ))}
      </div>
      
      <div className="available-codes">
        <small>Try: SAVE10, SAVE20, WELCOME</small>
      </div>
    </div>
  );
}

function CheckoutFlow() {
  const {
    status,
    errors,
    isCheckoutReady,
    setShippingInfo,
    setPaymentMethod,
    completeCheckout,
    resetCart
  } = useCart();
  
  const [shipping, setShipping] = React.useState({
    address: '',
    city: '',
    zipCode: '',
    method: 'standard'
  });
  
  const [payment, setPayment] = React.useState({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const handleShippingSubmit = () => {
    const cost = shipping.method === 'express' ? 15 : 5;
    setShippingInfo({ ...shipping, cost });
  };
  
  const handlePaymentSubmit = () => {
    setPaymentMethod(payment);
  };
  
  const handleCheckout = async () => {
    const result = await completeCheckout();
    if (result.success) {
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
    } else {
      alert(`Checkout failed: ${result.error}`);
    }
  };
  
  if (status === 'complete') {
    return (
      <div className="checkout-complete">
        <h2>Order Complete!</h2>
        <button onClick={resetCart}>Start New Order</button>
      </div>
    );
  }
  
  return (
    <div className="checkout-flow">
      <h2>Checkout</h2>
      
      <div className="shipping-form">
        <h3>Shipping Information</h3>
        <input
          type="text"
          value={shipping.address}
          onChange={(e) => setShipping(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Address"
        />
        <input
          type="text"
          value={shipping.city}
          onChange={(e) => setShipping(prev => ({ ...prev, city: e.target.value }))}
          placeholder="City"
        />
        <input
          type="text"
          value={shipping.zipCode}
          onChange={(e) => setShipping(prev => ({ ...prev, zipCode: e.target.value }))}
          placeholder="ZIP Code"
        />
        <select
          value={shipping.method}
          onChange={(e) => setShipping(prev => ({ ...prev, method: e.target.value }))}
        >
          <option value="standard">Standard Shipping ($5)</option>
          <option value="express">Express Shipping ($15)</option>
        </select>
        <button onClick={handleShippingSubmit}>Set Shipping</button>
      </div>
      
      <div className="payment-form">
        <h3>Payment Method</h3>
        <input
          type="text"
          value={payment.cardNumber}
          onChange={(e) => setPayment(prev => ({ ...prev, cardNumber: e.target.value }))}
          placeholder="Card Number"
        />
        <input
          type="text"
          value={payment.expiryDate}
          onChange={(e) => setPayment(prev => ({ ...prev, expiryDate: e.target.value }))}
          placeholder="MM/YY"
        />
        <input
          type="text"
          value={payment.cvv}
          onChange={(e) => setPayment(prev => ({ ...prev, cvv: e.target.value }))}
          placeholder="CVV"
        />
        <button onClick={handlePaymentSubmit}>Set Payment</button>
      </div>
      
      <button
        onClick={handleCheckout}
        disabled={!isCheckoutReady || status === 'checkout'}
        className="checkout-button"
      >
        {status === 'checkout' ? 'Processing...' : 'Complete Order'}
      </button>
      
      {Object.entries(errors).map(([field, message]) => (
        <div key={field} className="error">
          {field}: {message}
        </div>
      ))}
    </div>
  );
}

// === Main Demo ===
function ShoppingCartDemo() {
  return (
    <CartProvider>
      <div className="shopping-cart-demo">
        <h1>Advanced Shopping Cart Demo</h1>
        
        <div className="demo-layout">
          <div className="left-column">
            <ProductCatalog />
            <DiscountCode />
          </div>
          
          <div className="right-column">
            <CartSummary />
            <CheckoutFlow />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}

export default ShoppingCartDemo;