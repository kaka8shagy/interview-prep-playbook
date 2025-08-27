/**
 * File: interview-counter.js
 * Description: Interview question - implement counter with private state
 * Common interview problem testing closure understanding
 */

// Basic counter implementation
function createCounter(initialValue = 0) {
  let count = initialValue;
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    reset() {
      count = initialValue;
      return count;
    },
    getValue() {
      return count;
    }
  };
}

// Advanced counter with step and bounds
function createAdvancedCounter(options = {}) {
  let count = options.initialValue || 0;
  const step = options.step || 1;
  const min = options.min !== undefined ? options.min : -Infinity;
  const max = options.max !== undefined ? options.max : Infinity;
  
  function constrain(value) {
    return Math.max(min, Math.min(max, value));
  }
  
  return {
    increment() {
      count = constrain(count + step);
      return count;
    },
    decrement() {
      count = constrain(count - step);
      return count;
    },
    reset() {
      count = options.initialValue || 0;
      return count;
    },
    getValue() {
      return count;
    },
    setValue(newValue) {
      count = constrain(newValue);
      return count;
    }
  };
}

// Counter with history
function createHistoryCounter() {
  let count = 0;
  const history = [];
  
  function recordAction(action, value) {
    history.push({ 
      action, 
      value, 
      timestamp: Date.now() 
    });
  }
  
  return {
    increment() {
      count++;
      recordAction('increment', count);
      return count;
    },
    decrement() {
      count--;
      recordAction('decrement', count);
      return count;
    },
    reset() {
      count = 0;
      recordAction('reset', count);
      return count;
    },
    getValue() {
      return count;
    },
    getHistory() {
      return history.slice(); // Return copy
    },
    undo() {
      if (history.length > 1) {
        history.pop(); // Remove current state
        const lastState = history[history.length - 1];
        count = lastState ? lastState.value : 0;
        return count;
      }
      return count;
    }
  };
}

// Multiple independent counters
function createCounterFactory() {
  const counters = new Map();
  
  return {
    create(name, initialValue = 0) {
      if (counters.has(name)) {
        throw new Error(`Counter ${name} already exists`);
      }
      counters.set(name, createCounter(initialValue));
      return this;
    },
    
    get(name) {
      const counter = counters.get(name);
      if (!counter) {
        throw new Error(`Counter ${name} does not exist`);
      }
      return counter;
    },
    
    remove(name) {
      return counters.delete(name);
    },
    
    list() {
      return Array.from(counters.keys());
    }
  };
}

// Test cases
console.log('Basic Counter:');
const counter1 = createCounter(10);
console.log(counter1.increment()); // 11
console.log(counter1.increment()); // 12
console.log(counter1.decrement()); // 11
console.log(counter1.reset());     // 10

console.log('\nAdvanced Counter (max: 5, step: 2):');
const counter2 = createAdvancedCounter({ 
  initialValue: 0, 
  step: 2, 
  max: 5, 
  min: -5 
});
console.log(counter2.increment()); // 2
console.log(counter2.increment()); // 4
console.log(counter2.increment()); // 5 (capped at max)
console.log(counter2.setValue(10)); // 5 (capped at max)

console.log('\nHistory Counter:');
const counter3 = createHistoryCounter();
counter3.increment();
counter3.increment();
counter3.decrement();
console.log(counter3.getValue()); // 1
console.log(counter3.undo());     // 2
console.log(counter3.getHistory().length); // 2

module.exports = { 
  createCounter, 
  createAdvancedCounter, 
  createHistoryCounter,
  createCounterFactory
};