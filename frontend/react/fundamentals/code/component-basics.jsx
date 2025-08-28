/**
 * File: component-basics.jsx
 * Description: Basic React component patterns and concepts
 */

import React, { useState, useEffect } from 'react';

// === Functional Component (Modern Approach) ===
function WelcomeMessage({ name, age, onGreet }) {
  return (
    <div className="welcome">
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old.</p>
      <button onClick={() => onGreet(name)}>
        Greet Me
      </button>
    </div>
  );
}

// === Component with Props Destructuring ===
function UserProfile({ user: { name, email, avatar }, isOnline = false }) {
  return (
    <div className={`user-profile ${isOnline ? 'online' : 'offline'}`}>
      <img src={avatar} alt={`${name}'s avatar`} />
      <div className="user-info">
        <h3>{name}</h3>
        <p>{email}</p>
        <span className="status">
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
    </div>
  );
}

// === Component with State ===
function Counter({ initialCount = 0, step = 1 }) {
  const [count, setCount] = useState(initialCount);
  
  const increment = () => setCount(prev => prev + step);
  const decrement = () => setCount(prev => prev - step);
  const reset = () => setCount(initialCount);
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <div className="counter-controls">
        <button onClick={decrement}>-{step}</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+{step}</button>
      </div>
    </div>
  );
}

// === Component with Effects ===
function Timer({ initialTime = 0, autoStart = false }) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);
  
  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => {
    setTime(initialTime);
    setIsRunning(false);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="timer">
      <div className="time-display">
        {formatTime(time)}
      </div>
      <div className="timer-controls">
        <button onClick={start} disabled={isRunning}>
          Start
        </button>
        <button onClick={stop} disabled={!isRunning}>
          Stop
        </button>
        <button onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}

// === Component with Multiple Props Types ===
function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  showQuickActions = true,
  discount = null
}) {
  const {
    id,
    name,
    price,
    image,
    rating,
    description,
    inStock
  } = product;
  
  const discountedPrice = discount 
    ? price * (1 - discount / 100) 
    : price;
  
  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      <div className="product-image">
        <img src={image} alt={name} />
        {discount && (
          <div className="discount-badge">
            {discount}% OFF
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-description">{description}</p>
        
        <div className="product-rating">
          {'★'.repeat(Math.floor(rating))}
          {'☆'.repeat(5 - Math.floor(rating))}
          <span>({rating})</span>
        </div>
        
        <div className="product-price">
          {discount && (
            <span className="original-price">${price}</span>
          )}
          <span className="current-price">${discountedPrice}</span>
        </div>
        
        {showQuickActions && (
          <div className="product-actions">
            <button 
              onClick={() => onViewDetails(id)}
              className="btn-secondary"
            >
              View Details
            </button>
            <button 
              onClick={() => onAddToCart(product)}
              disabled={!inStock}
              className="btn-primary"
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// === Component with Children ===
function Card({ title, children, className = '', ...otherProps }) {
  return (
    <div className={`card ${className}`} {...otherProps}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

// === Component with Conditional Rendering ===
function LoginStatus({ user, onLogin, onLogout }) {
  if (!user) {
    return (
      <div className="login-prompt">
        <p>Please log in to continue</p>
        <button onClick={onLogin} className="login-btn">
          Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="user-menu">
      <span>Welcome, {user.name}!</span>
      <button onClick={onLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

// === Higher Order Component Example ===
function withLoading(WrappedComponent, loadingMessage = 'Loading...') {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div className="loading">{loadingMessage}</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Usage of HOC
const ProductCardWithLoading = withLoading(ProductCard, 'Loading product...');

// === Component with Error Handling ===
function SafeComponent({ children, fallback = <div>Something went wrong</div> }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('Component error:', error, errorInfo);
      setHasError(true);
    };
    
    // In a real app, you'd use Error Boundaries
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (hasError) {
    return fallback;
  }
  
  return children;
}

// === Demo Component ===
function ComponentBasicsDemo() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = () => {
    setUser({ name: 'John Doe', email: 'john@example.com' });
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  const handleGreet = (name) => {
    alert(`Hello, ${name}! Nice to meet you.`);
  };
  
  const handleAddToCart = (product) => {
    console.log('Added to cart:', product.name);
  };
  
  const handleViewDetails = (productId) => {
    console.log('Viewing product:', productId);
  };
  
  const sampleUser = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    avatar: 'https://via.placeholder.com/50'
  };
  
  const sampleProduct = {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://via.placeholder.com/200',
    rating: 4,
    description: 'High-quality wireless headphones with noise cancellation',
    inStock: true
  };
  
  return (
    <div className="demo-container">
      <h1>React Component Basics Demo</h1>
      
      <section>
        <h2>Welcome Message</h2>
        <WelcomeMessage 
          name="React Developer" 
          age={25} 
          onGreet={handleGreet} 
        />
      </section>
      
      <section>
        <h2>User Profile</h2>
        <UserProfile user={sampleUser} isOnline={true} />
      </section>
      
      <section>
        <h2>Counter</h2>
        <Counter initialCount={0} step={2} />
      </section>
      
      <section>
        <h2>Timer</h2>
        <Timer initialTime={0} autoStart={false} />
      </section>
      
      <section>
        <h2>Product Card</h2>
        <ProductCardWithLoading
          product={sampleProduct}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          discount={15}
          isLoading={isLoading}
        />
      </section>
      
      <section>
        <h2>Card with Children</h2>
        <Card title="Information">
          <p>This is content inside a card component.</p>
          <p>Cards can contain any kind of content.</p>
        </Card>
      </section>
      
      <section>
        <h2>Login Status</h2>
        <LoginStatus 
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </section>
    </div>
  );
}

export default ComponentBasicsDemo;
export {
  WelcomeMessage,
  UserProfile,
  Counter,
  Timer,
  ProductCard,
  Card,
  LoginStatus,
  withLoading,
  SafeComponent
};