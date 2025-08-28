/**
 * File: event-handlers.js
 * Description: Using closures in event handlers and callbacks
 * Demonstrates state preservation and callback patterns
 */

// === Button Click Handler with Closure ===
function createButtonHandler(buttonName) {
  let clickCount = 0;
  let lastClickTime = null;
  
  return function handleClick(event) {
    clickCount++;
    lastClickTime = new Date();
    
    console.log(`${buttonName} clicked ${clickCount} times`);
    console.log(`Last click: ${lastClickTime.toLocaleTimeString()}`);
    
    return {
      buttonName,
      clickCount,
      lastClickTime
    };
  };
}

// Simulate button handlers
const saveButtonHandler = createButtonHandler('Save Button');
const deleteButtonHandler = createButtonHandler('Delete Button');

console.log('=== Event Handler Closures ===');
saveButtonHandler(); // Save Button clicked 1 times
saveButtonHandler(); // Save Button clicked 2 times
deleteButtonHandler(); // Delete Button clicked 1 times

// === Event Debouncing with Closures ===
function createDebouncer(func, delay) {
  let timeoutId = null;
  let lastArgs = null;
  
  return function debounced(...args) {
    lastArgs = args;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, lastArgs);
    }, delay);
  };
}

// Usage example
function searchApi(query) {
  console.log(`Searching for: "${query}"`);
}

const debouncedSearch = createDebouncer(searchApi, 300);

console.log('\n=== Debounced Search ===');
debouncedSearch('a');
debouncedSearch('ap');
debouncedSearch('app'); // Only this will execute after 300ms

// === Event Throttling with Closures ===
function createThrottler(func, limit) {
  let inThrottle = false;
  let lastResult = null;
  
  return function throttled(...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

// Usage example
function handleScroll() {
  const scrollY = Math.random() * 1000; // Simulate scroll position
  console.log(`Scroll position: ${scrollY.toFixed(0)}`);
  return scrollY;
}

const throttledScroll = createThrottler(handleScroll, 100);

console.log('\n=== Throttled Scroll Handler ===');
// Simulate rapid scroll events
for (let i = 0; i < 5; i++) {
  setTimeout(() => throttledScroll(), i * 20);
}

// === Form Validation with State ===
function createFormValidator(fields) {
  const fieldStates = {};
  const validationRules = {};
  
  // Initialize field states
  fields.forEach(field => {
    fieldStates[field] = {
      value: '',
      isValid: false,
      errors: [],
      touched: false
    };
  });
  
  function validateField(fieldName, value, rules) {
    const errors = [];
    
    if (rules.required && !value.trim()) {
      errors.push(`${fieldName} is required`);
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
    }
    
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${fieldName} must be a valid email`);
      }
    }
    
    return errors;
  }
  
  return {
    setValidationRules(fieldName, rules) {
      validationRules[fieldName] = rules;
    },
    
    handleChange(fieldName, value) {
      if (fieldStates[fieldName]) {
        const errors = validationRules[fieldName] 
          ? validateField(fieldName, value, validationRules[fieldName])
          : [];
        
        fieldStates[fieldName] = {
          value,
          isValid: errors.length === 0,
          errors,
          touched: true
        };
        
        return fieldStates[fieldName];
      }
    },
    
    handleBlur(fieldName) {
      if (fieldStates[fieldName]) {
        fieldStates[fieldName].touched = true;
        return fieldStates[fieldName];
      }
    },
    
    getFieldState(fieldName) {
      return fieldStates[fieldName];
    },
    
    getFormState() {
      const isFormValid = Object.values(fieldStates).every(field => field.isValid);
      const touchedFields = Object.keys(fieldStates).filter(key => fieldStates[key].touched);
      
      return {
        fields: { ...fieldStates },
        isValid: isFormValid,
        touchedCount: touchedFields.length
      };
    },
    
    reset() {
      Object.keys(fieldStates).forEach(field => {
        fieldStates[field] = {
          value: '',
          isValid: false,
          errors: [],
          touched: false
        };
      });
    }
  };
}

console.log('\n=== Form Validator ===');
const validator = createFormValidator(['username', 'email', 'password']);

validator.setValidationRules('username', { required: true, minLength: 3 });
validator.setValidationRules('email', { required: true, email: true });
validator.setValidationRules('password', { required: true, minLength: 8 });

console.log('Username validation:', validator.handleChange('username', 'jo'));
console.log('Email validation:', validator.handleChange('email', 'john@example.com'));
console.log('Password validation:', validator.handleChange('password', 'password123'));
console.log('Form state:', validator.getFormState());

// === Event Bus with Closures ===
function createEventBus() {
  const listeners = {};
  const eventHistory = [];
  
  function addEventListener(eventType, callback, options = {}) {
    if (!listeners[eventType]) {
      listeners[eventType] = [];
    }
    
    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    listeners[eventType].push(listener);
    
    // Sort by priority (higher priority first)
    listeners[eventType].sort((a, b) => b.priority - a.priority);
    
    return listener.id;
  }
  
  function removeEventListener(eventType, listenerId) {
    if (listeners[eventType]) {
      listeners[eventType] = listeners[eventType].filter(
        listener => listener.id !== listenerId
      );
    }
  }
  
  function emit(eventType, data) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date()
    };
    
    eventHistory.push(event);
    
    if (listeners[eventType]) {
      const listenersToRemove = [];
      
      listeners[eventType].forEach(listener => {
        try {
          listener.callback(event);
          
          if (listener.once) {
            listenersToRemove.push(listener.id);
          }
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
      
      // Remove one-time listeners
      listenersToRemove.forEach(id => {
        removeEventListener(eventType, id);
      });
    }
    
    return event;
  }
  
  return {
    on: addEventListener,
    off: removeEventListener,
    emit,
    
    once(eventType, callback) {
      return addEventListener(eventType, callback, { once: true });
    },
    
    getEventHistory() {
      return eventHistory.slice();
    },
    
    getListenerCount(eventType) {
      return listeners[eventType] ? listeners[eventType].length : 0;
    },
    
    clear() {
      Object.keys(listeners).forEach(eventType => {
        listeners[eventType] = [];
      });
      eventHistory.length = 0;
    }
  };
}

console.log('\n=== Event Bus ===');
const eventBus = createEventBus();

// Add listeners
const listener1 = eventBus.on('user-login', (event) => {
  console.log(`User logged in: ${event.data.username}`);
});

const listener2 = eventBus.once('user-login', (event) => {
  console.log(`First login detected for: ${event.data.username}`);
});

eventBus.on('user-logout', (event) => {
  console.log(`User logged out: ${event.data.username}`);
});

// Emit events
eventBus.emit('user-login', { username: 'john_doe' });
eventBus.emit('user-login', { username: 'jane_doe' }); // 'once' listener won't fire
eventBus.emit('user-logout', { username: 'john_doe' });

console.log('Event history:', eventBus.getEventHistory().length);

// === Animation Controller with Closures ===
function createAnimationController() {
  let animationId = null;
  let isRunning = false;
  let startTime = null;
  let pausedTime = 0;
  let duration = 1000;
  
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  return function animate(callback, animationDuration = 1000) {
    duration = animationDuration;
    
    const api = {
      start() {
        if (isRunning) return this;
        
        isRunning = true;
        startTime = performance.now() - pausedTime;
        
        function frame(currentTime) {
          if (!isRunning) return;
          
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeInOut(progress);
          
          callback(easedProgress, elapsed);
          
          if (progress < 1) {
            animationId = requestAnimationFrame(frame);
          } else {
            api.stop();
          }
        }
        
        animationId = requestAnimationFrame(frame);
        return this;
      },
      
      pause() {
        if (isRunning) {
          isRunning = false;
          pausedTime = performance.now() - startTime;
          cancelAnimationFrame(animationId);
        }
        return this;
      },
      
      stop() {
        isRunning = false;
        pausedTime = 0;
        startTime = null;
        cancelAnimationFrame(animationId);
        return this;
      },
      
      reset() {
        api.stop();
        callback(0, 0);
        return this;
      },
      
      isRunning() {
        return isRunning;
      }
    };
    
    return api;
  };
}

console.log('\n=== Animation Controller ===');
const createAnimation = createAnimationController();

const fadeAnimation = createAnimation((progress) => {
  console.log(`Fade progress: ${(progress * 100).toFixed(0)}%`);
}, 1000);

// Would start animation in a real browser environment
// fadeAnimation.start();

module.exports = {
  createButtonHandler,
  createDebouncer,
  createThrottler,
  createFormValidator,
  createEventBus,
  createAnimationController
};