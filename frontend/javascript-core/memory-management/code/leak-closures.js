/**
 * File: leak-closures.js
 * Description: Memory leaks caused by closures and their solutions
 */

// === Problem: Closure retaining large scope ===
console.log('=== Closure Memory Leak Examples ===\n');

// BAD: Closure keeping entire scope alive
function createLeakyClosure() {
  const largeData = new Array(1000000).fill('memory leak');
  const unusedData = new Array(1000000).fill('also leaked');
  
  return function() {
    // Only uses one piece of data but keeps entire scope
    return largeData.length;
  };
}

const leakyFunc = createLeakyClosure();
// Both largeData and unusedData are kept in memory!
console.log('Leaky closure created, retains unnecessary data');

// GOOD: Minimize closure scope
function createEfficientClosure() {
  const largeData = new Array(1000000).fill('data');
  const unusedData = new Array(1000000).fill('unused');
  
  // Extract only what's needed
  const dataLength = largeData.length;
  
  // Clear references
  // largeData = null; // Can't do this if we need it
  // unusedData = null; // Can't do this either
  
  return function() {
    return dataLength; // Only keeps the number, not arrays
  };
}

const efficientFunc = createEfficientClosure();
console.log('Efficient closure created, minimal memory retained');

// === Problem: Event handler closures ===
function attachLeakyHandlers() {
  const elements = document.querySelectorAll('.item');
  const hugeCache = new Array(100000).fill('cached data');
  
  elements.forEach(element => {
    // BAD: Each handler keeps hugeCache alive
    element.addEventListener('click', function() {
      console.log('Clicked:', this.id);
      // Doesn't even use hugeCache!
    });
  });
}

// SOLUTION: Separate concerns
function attachEfficientHandlers() {
  const elements = document.querySelectorAll('.item');
  
  function handleClick() {
    console.log('Clicked:', this.id);
  }
  
  elements.forEach(element => {
    // Good: Handler doesn't capture unnecessary data
    element.addEventListener('click', handleClick);
  });
  
  // Process cache separately if needed
  processCache();
}

function processCache() {
  const hugeCache = new Array(100000).fill('cached data');
  // Process and then let it be garbage collected
}

// === Problem: Accumulating closures ===
class LeakySubscriptionManager {
  constructor() {
    this.handlers = [];
    this.data = new Array(10000).fill('shared data');
  }
  
  // BAD: Each handler closure keeps this.data alive
  subscribe(callback) {
    const handler = () => {
      callback(this.data);
    };
    this.handlers.push(handler);
    return handler;
  }
}

// SOLUTION: Weak references and cleanup
class EfficientSubscriptionManager {
  constructor() {
    this.handlers = new WeakMap();
    this.data = new Array(10000).fill('shared data');
  }
  
  subscribe(callback) {
    const handler = {
      callback,
      unsubscribe: () => {
        this.handlers.delete(handler);
      }
    };
    
    this.handlers.set(handler, callback);
    return handler;
  }
  
  // Proper cleanup method
  destroy() {
    this.handlers = null;
    this.data = null;
  }
}

// === Problem: Recursive closures ===
function createRecursiveLeak() {
  let counter = 0;
  const largeData = new Array(10000).fill('data');
  
  function recursive() {
    counter++;
    
    // BAD: Creates new closure each time
    setTimeout(() => {
      if (counter < 1000) {
        recursive(); // Keeps creating closures
      }
    }, 10);
  }
  
  recursive();
  return counter;
}

// SOLUTION: Avoid closure accumulation
function createEfficientRecursion() {
  let counter = 0;
  
  function recursive(count, callback) {
    if (count >= 1000) {
      callback(count);
      return;
    }
    
    // Use setImmediate or requestAnimationFrame for better control
    setTimeout(() => recursive(count + 1, callback), 10);
  }
  
  recursive(counter, (finalCount) => {
    console.log('Completed:', finalCount);
  });
}

// === Advanced: Module pattern leak ===
const LeakyModule = (function() {
  // Private variables kept alive forever
  const privateCache = new Map();
  const privateData = new Array(100000).fill('private');
  
  return {
    addToCache(key, value) {
      // Keeps adding without cleanup
      privateCache.set(key, value);
    },
    
    getFromCache(key) {
      return privateCache.get(key);
    }
    // No way to clear the private cache!
  };
})();

// SOLUTION: Provide cleanup methods
const EfficientModule = (function() {
  let privateCache = new Map();
  let privateData = new Array(100000).fill('private');
  
  return {
    addToCache(key, value) {
      privateCache.set(key, value);
    },
    
    getFromCache(key) {
      return privateCache.get(key);
    },
    
    clearCache() {
      privateCache.clear();
    },
    
    destroy() {
      privateCache = null;
      privateData = null;
    }
  };
})();

// === Testing memory impact ===
function measureMemoryImpact() {
  const iterations = 100;
  const closures = [];
  
  console.log('\n=== Memory Impact Test ===');
  
  // Create many leaky closures
  for (let i = 0; i < iterations; i++) {
    closures.push(createLeakyClosure());
  }
  
  // Memory is now bloated with unnecessary data
  console.log(`Created ${iterations} leaky closures`);
  
  // In Node.js, you can check memory usage
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    console.log('Heap used:', (usage.heapUsed / 1048576).toFixed(2), 'MB');
  }
  
  // Clear references
  closures.length = 0;
  console.log('References cleared, waiting for GC...');
}

// Demonstration
console.log('Result from leaky closure:', leakyFunc());
console.log('Result from efficient closure:', efficientFunc());

// Run memory impact test
measureMemoryImpact();

module.exports = {
  createLeakyClosure,
  createEfficientClosure,
  LeakySubscriptionManager,
  EfficientSubscriptionManager,
  LeakyModule,
  EfficientModule
};