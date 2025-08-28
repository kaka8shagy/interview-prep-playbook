/**
 * File: useState-examples.jsx
 * Description: Comprehensive useState hook patterns and examples
 */

import React, { useState } from 'react';

// === Basic useState Examples ===
function BasicCounter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// === Functional Updates ===
function FunctionalUpdates() {
  const [count, setCount] = useState(0);
  
  // Using functional updates prevents stale closure issues
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  
  // Multiple rapid updates
  const incrementBy5 = () => {
    // Wrong way - would only increment by 1
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);
    
    // Correct way - each uses the previous value
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <p>Functional Updates Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={incrementBy5}>+5 (Functional)</button>
    </div>
  );
}

// === Object State ===
function ObjectState() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });
  
  // Updating object properties
  const updateName = (name) => {
    setUser(prev => ({ ...prev, name }));
  };
  
  const updateEmail = (email) => {
    setUser(prev => ({ ...prev, email }));
  };
  
  const updateAge = (age) => {
    setUser(prev => ({ ...prev, age: parseInt(age) || 0 }));
  };
  
  const resetUser = () => {
    setUser({ name: '', email: '', age: 0 });
  };
  
  return (
    <div>
      <h3>User Information</h3>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={user.name}
          onChange={(e) => updateName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => updateEmail(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={user.age}
          onChange={(e) => updateAge(e.target.value)}
        />
      </div>
      <button onClick={resetUser}>Reset</button>
      <div>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}

// === Array State ===
function ArrayState() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const addItem = () => {
    if (inputValue.trim()) {
      setItems(prev => [...prev, {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      }]);
      setInputValue('');
    }
  };
  
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const toggleItem = (id) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };
  
  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.completed));
  };
  
  return (
    <div>
      <h3>Todo List</h3>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          placeholder="Add new item"
        />
        <button onClick={addItem}>Add</button>
      </div>
      
      <ul>
        {items.map(item => (
          <li key={item.id} className={item.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
            />
            <span>{item.text}</span>
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      
      <div>
        <p>Total: {items.length}, Completed: {items.filter(item => item.completed).length}</p>
        <button onClick={clearCompleted}>Clear Completed</button>
      </div>
    </div>
  );
}

// === Lazy Initial State ===
function LazyInitialState() {
  // Expensive computation for initial state
  const [data, setData] = useState(() => {
    console.log('Computing initial state...');
    // Simulate expensive calculation
    return Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random()
    }));
  });
  
  const regenerate = () => {
    setData(() => {
      console.log('Regenerating data...');
      return Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: Math.random()
      }));
    });
  };
  
  return (
    <div>
      <h3>Lazy Initial State</h3>
      <p>Data points: {data.length}</p>
      <p>First 5 values: {data.slice(0, 5).map(item => item.value.toFixed(3)).join(', ')}</p>
      <button onClick={regenerate}>Regenerate Data</button>
    </div>
  );
}

// === Multiple State Variables ===
function MultipleState() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState('light');
  
  const themes = ['light', 'dark', 'blue', 'green'];
  
  return (
    <div className={`theme-${theme}`}>
      <h3>Multiple State Variables</h3>
      
      {isVisible && (
        <div>
          <div>
            <label>Name: </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label>Age: </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label>Theme: </label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {themes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <div>
            <p>Preview: Hello {name}, you are {age} years old!</p>
            <p>Email: {email}</p>
            <p>Theme: {theme}</p>
          </div>
        </div>
      )}
      
      <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide' : 'Show'} Form
      </button>
    </div>
  );
}

// === State with Validation ===
function StateWithValidation() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  const handleEmailChange = (value) => {
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };
  
  const handlePasswordChange = (value) => {
    setPassword(value);
    
    if (value && !validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
    } else {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };
  
  const isValid = email && password && !errors.email && !errors.password;
  
  return (
    <div>
      <h3>State with Validation</h3>
      
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>
      
      <button disabled={!isValid}>
        Submit
      </button>
      
      <div>
        <p>Form valid: {isValid ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

// === Demo Component ===
function UseStateDemo() {
  const [activeExample, setActiveExample] = useState('basic');
  
  const examples = {
    basic: { component: BasicCounter, title: 'Basic Counter' },
    functional: { component: FunctionalUpdates, title: 'Functional Updates' },
    object: { component: ObjectState, title: 'Object State' },
    array: { component: ArrayState, title: 'Array State' },
    lazy: { component: LazyInitialState, title: 'Lazy Initial State' },
    multiple: { component: MultipleState, title: 'Multiple State Variables' },
    validation: { component: StateWithValidation, title: 'State with Validation' }
  };
  
  const ActiveComponent = examples[activeExample].component;
  
  return (
    <div className="demo-container">
      <h1>useState Examples</h1>
      
      <nav className="example-nav">
        {Object.entries(examples).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => setActiveExample(key)}
            className={activeExample === key ? 'active' : ''}
          >
            {title}
          </button>
        ))}
      </nav>
      
      <div className="example-content">
        <h2>{examples[activeExample].title}</h2>
        <ActiveComponent />
      </div>
    </div>
  );
}

export default UseStateDemo;
export {
  BasicCounter,
  FunctionalUpdates,
  ObjectState,
  ArrayState,
  LazyInitialState,
  MultipleState,
  StateWithValidation
};