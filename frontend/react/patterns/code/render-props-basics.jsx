/**
 * File: render-props-basics.jsx
 * Description: Render Props pattern fundamentals in React
 * Tests understanding of function as children and render prop patterns
 */

import React, { useState, useEffect } from 'react';

// === Basic Render Props Pattern ===
// Component that accepts a function as a prop and calls it with data

function BasicRenderProp({ render, data }) {
  return (
    <div className="render-prop-wrapper">
      {render(data)}
    </div>
  );
}

// Alternative: Function as Children pattern
function FunctionAsChildren({ children, data }) {
  return (
    <div className="function-as-children-wrapper">
      {typeof children === 'function' ? children(data) : children}
    </div>
  );
}

// === Counter with Render Props ===
function Counter({ initialCount = 0, render }) {
  const [count, setCount] = useState(initialCount);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialCount);
  
  return render({
    count,
    increment,
    decrement,
    reset
  });
}

// === Toggle Component with Render Props ===
function Toggle({ defaultToggled = false, render, children }) {
  const [toggled, setToggled] = useState(defaultToggled);
  
  const toggle = () => setToggled(prev => !prev);
  const on = () => setToggled(true);
  const off = () => setToggled(false);
  
  const toggleData = {
    toggled,
    toggle,
    on,
    off
  };
  
  // Support both render prop and children function
  if (typeof children === 'function') {
    return children(toggleData);
  }
  
  if (typeof render === 'function') {
    return render(toggleData);
  }
  
  return null;
}

// === Async Data Fetcher with Render Props ===
function AsyncDataFetcher({ url, render, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on URL
      const mockData = {
        '/api/users': [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        '/api/products': [
          { id: 1, name: 'Laptop', price: 999 },
          { id: 2, name: 'Phone', price: 699 }
        ]
      };
      
      setData(mockData[url] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]);
  
  const fetcherData = {
    data,
    loading,
    error,
    refetch: fetchData
  };
  
  return (typeof children === 'function' ? children : render)(fetcherData);
}

// === Form Validation with Render Props ===
function FormValidator({ validationRules, render, children }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';
    
    for (const rule of rules) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message || `${name} is required`;
      }
      
      if (rule.minLength && value && value.length < rule.minLength) {
        return rule.message || `${name} must be at least ${rule.minLength} characters`;
      }
      
      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.message || `${name} format is invalid`;
      }
      
      if (rule.validate && value && !rule.validate(value)) {
        return rule.message || `${name} is invalid`;
      }
    }
    
    return '';
  };
  
  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  const setTouched = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const validateAll = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      newErrors[name] = validateField(name, values[name]);
    });
    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, name) => ({ ...acc, [name]: true }), {}));
    
    return Object.values(newErrors).every(error => !error);
  };
  
  const validatorData = {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validateAll,
    isValid: Object.values(errors).every(error => !error)
  };
  
  return (typeof children === 'function' ? children : render)(validatorData);
}

// === Mouse Position Tracker ===
function MouseTracker({ render, children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (typeof children === 'function' ? children : render)(mousePosition);
}

// === Dimension Tracker ===
function DimensionTracker({ render, children }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return (typeof children === 'function' ? children : render)(dimensions);
}

// === Usage Examples ===

// Counter usage with different render functions
function CounterExamples() {
  return (
    <div>
      <h3>Counter Examples</h3>
      
      {/* Basic counter */}
      <Counter 
        initialCount={5}
        render={({ count, increment, decrement, reset }) => (
          <div>
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
            <button onClick={reset}>Reset</button>
          </div>
        )}
      />
      
      {/* Progress bar counter */}
      <Counter
        initialCount={0}
        render={({ count, increment, decrement }) => (
          <div>
            <div style={{ 
              width: '200px', 
              height: '20px', 
              background: '#ddd',
              position: 'relative'
            }}>
              <div style={{
                width: `${Math.min(100, (count / 10) * 100)}%`,
                height: '100%',
                background: '#4caf50',
                transition: 'width 0.3s'
              }} />
            </div>
            <p>Progress: {count}/10</p>
            <button onClick={increment} disabled={count >= 10}>Add</button>
            <button onClick={decrement} disabled={count <= 0}>Remove</button>
          </div>
        )}
      />
    </div>
  );
}

// Toggle examples
function ToggleExamples() {
  return (
    <div>
      <h3>Toggle Examples</h3>
      
      {/* Basic toggle */}
      <Toggle>
        {({ toggled, toggle }) => (
          <div>
            <p>Status: {toggled ? 'ON' : 'OFF'}</p>
            <button onClick={toggle}>Toggle</button>
          </div>
        )}
      </Toggle>
      
      {/* Modal toggle */}
      <Toggle>
        {({ toggled, on, off }) => (
          <div>
            <button onClick={on}>Open Modal</button>
            {toggled && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <h4>Modal Content</h4>
                  <button onClick={off}>Close</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Toggle>
    </div>
  );
}

// Form validation example
function FormExample() {
  return (
    <FormValidator
      validationRules={{
        email: [
          { required: true, message: 'Email is required' },
          { pattern: /\S+@\S+\.\S+/, message: 'Email format is invalid' }
        ],
        password: [
          { required: true, message: 'Password is required' },
          { minLength: 6, message: 'Password must be at least 6 characters' }
        ]
      }}
    >
      {({ values, errors, setValue, setTouched, validateAll }) => (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (validateAll()) {
            console.log('Form submitted:', values);
          }
        }}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={values.email || ''}
              onChange={(e) => setValue('email', e.target.value)}
              onBlur={() => setTouched('email')}
            />
            {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
          </div>
          
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={values.password || ''}
              onChange={(e) => setValue('password', e.target.value)}
              onBlur={() => setTouched('password')}
            />
            {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
          </div>
          
          <button type="submit">Submit</button>
        </form>
      )}
    </FormValidator>
  );
}

// === Demo Component ===
function RenderPropsDemo() {
  const [selectedUrl, setSelectedUrl] = useState('/api/users');
  
  return (
    <div className="render-props-demo">
      <h1>Render Props Pattern Demo</h1>
      
      <section>
        <CounterExamples />
      </section>
      
      <section>
        <ToggleExamples />
      </section>
      
      <section>
        <h3>Data Fetcher</h3>
        <select 
          value={selectedUrl} 
          onChange={(e) => setSelectedUrl(e.target.value)}
        >
          <option value="/api/users">Users</option>
          <option value="/api/products">Products</option>
        </select>
        
        <AsyncDataFetcher url={selectedUrl}>
          {({ data, loading, error, refetch }) => (
            <div>
              {loading && <p>Loading...</p>}
              {error && <p style={{ color: 'red' }}>Error: {error}</p>}
              {data && (
                <div>
                  <h4>Data:</h4>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                  <button onClick={refetch}>Refetch</button>
                </div>
              )}
            </div>
          )}
        </AsyncDataFetcher>
      </section>
      
      <section>
        <h3>Form Validation</h3>
        <FormExample />
      </section>
      
      <section>
        <h3>Mouse Tracker</h3>
        <MouseTracker>
          {({ x, y }) => (
            <p>Mouse position: ({x}, {y})</p>
          )}
        </MouseTracker>
      </section>
      
      <section>
        <h3>Window Dimensions</h3>
        <DimensionTracker>
          {({ width, height }) => (
            <p>Window size: {width} x {height}</p>
          )}
        </DimensionTracker>
      </section>
    </div>
  );
}

export default RenderPropsDemo;
export {
  BasicRenderProp,
  FunctionAsChildren,
  Counter,
  Toggle,
  AsyncDataFetcher,
  FormValidator,
  MouseTracker,
  DimensionTracker,
  CounterExamples,
  ToggleExamples,
  FormExample
};