/**
 * File: leak-timers.js
 * Description: Timer-related memory leaks and their solutions
 * Demonstrates setInterval, setTimeout leaks and proper cleanup patterns
 */

console.log('=== Timer Memory Leaks ===');

// Example 1: Basic timer leak
console.log('1. Basic timer leak:');

// PROBLEMATIC: Timer leak
function createTimerLeak() {
  const largeData = new Array(100000).fill('data');
  let counter = 0;
  
  console.log('Creating timer that references large data...');
  
  // This creates a memory leak - timer keeps largeData alive
  const intervalId = setInterval(() => {
    counter++;
    console.log(`Timer tick ${counter}, data length: ${largeData.length}`);
    
    // Even though we might think this timer will end soon,
    // it keeps the entire function scope (including largeData) alive
  }, 1000);
  
  // PROBLEM: No cleanup mechanism
  return intervalId; // Returning ID, but caller might forget to clear
}

const leakyTimerId = createTimerLeak();

// Clear after demo
setTimeout(() => {
  clearInterval(leakyTimerId);
  console.log('Cleared leaky timer');
}, 3000);

console.log('\n2. Timer leak with object references:');

// PROBLEMATIC: Object timer leak
class LeakyComponent {
  constructor(name) {
    this.name = name;
    this.data = new Array(50000).fill(`data-for-${name}`);
    this.timers = [];
    
    console.log(`Creating leaky component: ${name}`);
  }
  
  startOperations() {
    // Multiple timers referencing 'this'
    const timer1 = setInterval(() => {
      // Timer closure captures 'this', preventing GC
      console.log(`${this.name} operation 1, data: ${this.data.length} items`);
    }, 1500);
    
    const timer2 = setTimeout(() => {
      console.log(`${this.name} delayed operation, data: ${this.data.length} items`);
    }, 5000);
    
    this.timers.push(timer1, timer2);
    
    // PROBLEM: Even if component is "removed", timers keep it alive
  }
  
  // Missing proper cleanup method
  destroy() {
    console.log(`Attempting to destroy ${this.name}`);
    // PROBLEM: Forgot to clear timers
    this.data = null; // This doesn't help if timers are still running
  }
}

const leakyComponent = new LeakyComponent('LeakyWidget');
leakyComponent.startOperations();

// Simulate component removal
setTimeout(() => {
  leakyComponent.destroy(); // Component still not GC'able due to active timers
}, 2000);

console.log('\n=== Timer Leak Solutions ===');

// Example 3: Proper timer cleanup
console.log('3. Proper timer cleanup:');

class ProperComponent {
  constructor(name) {
    this.name = name;
    this.data = new Array(50000).fill(`data-for-${name}`);
    this.timers = new Set(); // Track all timers
    this.isDestroyed = false;
    
    console.log(`Creating proper component: ${name}`);
  }
  
  startOperations() {
    if (this.isDestroyed) return;
    
    // Method 1: Store timer IDs and clear them
    const timer1 = setInterval(() => {
      if (this.isDestroyed) return; // Guard against destroyed state
      console.log(`${this.name} operation 1, data: ${this.data.length} items`);
    }, 1500);
    
    const timer2 = setTimeout(() => {
      if (this.isDestroyed) return;
      console.log(`${this.name} delayed operation completed`);
      this.timers.delete(timer2); // Remove completed timer
    }, 4000);
    
    this.timers.add(timer1);
    this.timers.add(timer2);
    
    console.log(`${this.name} started with ${this.timers.size} timers`);
  }
  
  destroy() {
    if (this.isDestroyed) return;
    
    console.log(`Properly destroying ${this.name}...`);
    
    // Clear all active timers
    this.timers.forEach(timerId => {
      clearInterval(timerId); // Works for both interval and timeout
      clearTimeout(timerId);
    });
    
    this.timers.clear();
    this.isDestroyed = true;
    this.data = null;
    
    console.log(`${this.name} destroyed cleanly`);
  }
}

const properComponent = new ProperComponent('ProperWidget');
properComponent.startOperations();

setTimeout(() => {
  properComponent.destroy(); // Proper cleanup
}, 3500);

console.log('\n4. Timer management class:');

// Example 4: Timer management utility
class TimerManager {
  constructor() {
    this.timers = new Map();
    this.nextId = 1;
  }
  
  setInterval(callback, delay, name = `interval-${this.nextId++}`) {
    const timerId = setInterval(callback, delay);
    
    this.timers.set(name, {
      id: timerId,
      type: 'interval',
      delay,
      created: Date.now()
    });
    
    console.log(`Created interval '${name}' with ${delay}ms delay`);
    return name; // Return our custom name instead of system ID
  }
  
  setTimeout(callback, delay, name = `timeout-${this.nextId++}`) {
    const timerId = setTimeout(() => {
      callback();
      this.timers.delete(name); // Auto-remove completed timeouts
    }, delay);
    
    this.timers.set(name, {
      id: timerId,
      type: 'timeout',
      delay,
      created: Date.now()
    });
    
    console.log(`Created timeout '${name}' with ${delay}ms delay`);
    return name;
  }
  
  clear(name) {
    const timer = this.timers.get(name);
    if (timer) {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
      
      this.timers.delete(name);
      console.log(`Cleared timer '${name}'`);
      return true;
    }
    return false;
  }
  
  clearAll() {
    console.log(`Clearing ${this.timers.size} timers...`);
    
    this.timers.forEach((timer, name) => {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else {
        clearTimeout(timer.id);
      }
    });
    
    const count = this.timers.size;
    this.timers.clear();
    console.log(`Cleared ${count} timers`);
  }
  
  getActiveTimers() {
    return Array.from(this.timers.entries()).map(([name, timer]) => ({
      name,
      type: timer.type,
      delay: timer.delay,
      age: Date.now() - timer.created
    }));
  }
}

// Usage example
const timerManager = new TimerManager();

timerManager.setInterval(() => {
  console.log('Managed interval tick');
}, 1000, 'heartbeat');

timerManager.setTimeout(() => {
  console.log('Managed timeout executed');
}, 2500, 'delayed-task');

setTimeout(() => {
  console.log('Active timers:', timerManager.getActiveTimers());
  timerManager.clearAll();
}, 4000);

console.log('\n5. React-style timer hooks pattern:');

// Example 5: React-style useEffect pattern for timers
function createTimerHook() {
  const activeTimers = new Set();
  
  function useTimer() {
    const timers = {
      setInterval(callback, delay) {
        const id = setInterval(callback, delay);
        activeTimers.add(id);
        
        // Return cleanup function
        return () => {
          clearInterval(id);
          activeTimers.delete(id);
        };
      },
      
      setTimeout(callback, delay) {
        const id = setTimeout(() => {
          callback();
          activeTimers.delete(id); // Auto-cleanup
        }, delay);
        
        activeTimers.add(id);
        
        return () => {
          clearTimeout(id);
          activeTimers.delete(id);
        };
      }
    };
    
    // Cleanup function for all timers
    timers.cleanup = () => {
      activeTimers.forEach(id => {
        clearInterval(id);
        clearTimeout(id);
      });
      activeTimers.clear();
      console.log('All hook timers cleaned up');
    };
    
    return timers;
  }
  
  return useTimer;
}

const useTimer = createTimerHook();

function simulateComponent() {
  const timers = useTimer();
  
  console.log('Component mounted, starting timers...');
  
  const cleanupInterval = timers.setInterval(() => {
    console.log('Component interval tick');
  }, 1200);
  
  const cleanupTimeout = timers.setTimeout(() => {
    console.log('Component timeout executed');
  }, 3000);
  
  // Simulate component unmount
  setTimeout(() => {
    console.log('Component unmounting...');
    cleanupInterval(); // Clean specific timer
    cleanupTimeout();
    timers.cleanup(); // Clean all remaining timers
  }, 2500);
}

simulateComponent();

console.log('\n=== Advanced Timer Leak Scenarios ===');

// Example 6: Recursive timer leak
console.log('6. Recursive timer leak:');

// PROBLEMATIC: Recursive timeout without cleanup
function createRecursiveTimer() {
  let count = 0;
  const data = new Array(10000).fill('recursive-data');
  
  function recursiveFunction() {
    count++;
    console.log(`Recursive call ${count}, data: ${data.length} items`);
    
    if (count < 100) { // Runs many times
      setTimeout(recursiveFunction, 100); // Each call creates new timer
    }
  }
  
  recursiveFunction();
  return { count, data }; // Keeps references alive
}

// This will run automatically
const recursiveResult = createRecursiveTimer();

console.log('\n7. Fixed recursive timer:');

// SOLUTION: Controllable recursive timer
class ControlledRecursiveTimer {
  constructor() {
    this.count = 0;
    this.data = new Array(10000).fill('controlled-data');
    this.isRunning = false;
    this.currentTimeoutId = null;
  }
  
  start(maxCount = 10) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.maxCount = maxCount;
    console.log('Starting controlled recursive timer...');
    
    this.scheduleNext();
  }
  
  scheduleNext() {
    if (!this.isRunning || this.count >= this.maxCount) {
      this.stop();
      return;
    }
    
    this.currentTimeoutId = setTimeout(() => {
      this.count++;
      console.log(`Controlled recursive call ${this.count}`);
      this.scheduleNext(); // Tail recursion
    }, 200);
  }
  
  stop() {
    if (this.currentTimeoutId) {
      clearTimeout(this.currentTimeoutId);
      this.currentTimeoutId = null;
    }
    
    this.isRunning = false;
    console.log('Controlled recursive timer stopped');
  }
  
  destroy() {
    this.stop();
    this.data = null;
    console.log('Controlled timer destroyed');
  }
}

const controlledTimer = new ControlledRecursiveTimer();
controlledTimer.start(5);

setTimeout(() => {
  controlledTimer.destroy();
}, 2000);

console.log('\n8. Memory-safe polling pattern:');

// Example 8: Polling with automatic cleanup
class MemorySafePoller {
  constructor(pollFunction, interval = 1000) {
    this.pollFunction = pollFunction;
    this.interval = interval;
    this.isPolling = false;
    this.timeoutId = null;
    this.pollCount = 0;
  }
  
  start() {
    if (this.isPolling) return false;
    
    this.isPolling = true;
    console.log('Starting memory-safe polling...');
    this.scheduleNext();
    return true;
  }
  
  scheduleNext() {
    if (!this.isPolling) return;
    
    this.timeoutId = setTimeout(async () => {
      try {
        this.pollCount++;
        const result = await this.pollFunction(this.pollCount);
        
        if (result === false) {
          // Poll function can stop polling by returning false
          this.stop();
          return;
        }
        
        // Schedule next poll
        this.scheduleNext();
      } catch (error) {
        console.error('Polling error:', error.message);
        this.stop(); // Stop on error
      }
    }, this.interval);
  }
  
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    this.isPolling = false;
    console.log(`Polling stopped after ${this.pollCount} polls`);
  }
  
  destroy() {
    this.stop();
    this.pollFunction = null;
    console.log('Poller destroyed');
  }
}

// Usage
const poller = new MemorySafePoller(
  (count) => {
    console.log(`Polling attempt ${count}`);
    
    // Simulate stopping condition
    if (count >= 3) {
      console.log('Poll condition met, stopping');
      return false; // Stop polling
    }
    
    return true; // Continue polling
  },
  800
);

poller.start();

// Cleanup after demo
setTimeout(() => {
  console.log('\n=== Timer Leak Demo Complete ===');
  
  // Force cleanup of any remaining demo timers
  poller.destroy();
  
  console.log('All demo timers cleaned up');
}, 6000);

module.exports = {
  LeakyComponent,
  ProperComponent,
  TimerManager,
  createTimerHook,
  ControlledRecursiveTimer,
  MemorySafePoller
};