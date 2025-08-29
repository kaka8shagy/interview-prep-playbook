/**
 * File: fundamentals.js
 * Description: Core Web Worker concepts and basic implementation
 * Time Complexity: O(1) for worker creation, varies by task
 * Space Complexity: O(n) where n is data transferred between threads
 */

// === Web Worker Feature Detection ===
console.log('=== Web Worker Feature Detection ===');

function checkWorkerSupport() {
  const support = {
    worker: typeof Worker !== 'undefined',
    sharedWorker: typeof SharedWorker !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator
  };
  
  console.log('Browser support:', support);
  return support;
}

checkWorkerSupport();

// === Basic Worker Creation and Communication ===
console.log('\n=== Basic Worker Creation ===');

function createBasicWorker() {
  // Worker script as string (in real apps, this would be a separate file)
  const workerScript = `
    console.log('Worker thread started');
    
    // Listen for messages from main thread
    self.addEventListener('message', function(e) {
      const { type, data, id } = e.data;
      
      try {
        switch (type) {
          case 'PING':
            self.postMessage({
              type: 'PONG',
              id,
              timestamp: Date.now(),
              data: 'Hello from worker!'
            });
            break;
            
          case 'CALCULATE_SUM':
            const sum = data.numbers.reduce((acc, num) => acc + num, 0);
            self.postMessage({
              type: 'SUM_RESULT',
              id,
              result: sum,
              count: data.numbers.length
            });
            break;
            
          case 'HEAVY_TASK':
            // Simulate CPU-intensive work
            let result = 0;
            const iterations = data.iterations || 1000000;
            
            for (let i = 0; i < iterations; i++) {
              result += Math.sqrt(i) * Math.sin(i);
              
              // Report progress every 100k iterations
              if (i % 100000 === 0) {
                self.postMessage({
                  type: 'PROGRESS',
                  id,
                  progress: (i / iterations) * 100,
                  current: i
                });
              }
            }
            
            self.postMessage({
              type: 'TASK_COMPLETE',
              id,
              result: result.toFixed(2),
              iterations
            });
            break;
            
          case 'CLOSE':
            self.postMessage({ type: 'CLOSING', id });
            self.close();
            break;
            
          default:
            throw new Error(\`Unknown message type: \${type}\`);
        }
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          id,
          error: error.message,
          stack: error.stack
        });
      }
    });
    
    // Worker can send unsolicited messages
    setTimeout(() => {
      self.postMessage({
        type: 'HEARTBEAT',
        timestamp: Date.now(),
        message: 'Worker is alive'
      });
    }, 1000);
    
    // Handle uncaught errors
    self.addEventListener('error', function(e) {
      console.error('Worker uncaught error:', e);
    });
  `;
  
  // Create blob URL for worker
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return { workerUrl, cleanup: () => URL.revokeObjectURL(workerUrl) };
}

// === Worker Wrapper Class ===
class WorkerManager {
  constructor(workerScript) {
    this.messageId = 0;
    this.pendingMessages = new Map();
    this.eventListeners = new Map();
    
    // Create worker from script string
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    this.workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(this.workerUrl);
    
    // Set up message handling
    this.worker.addEventListener('message', this.handleMessage.bind(this));
    this.worker.addEventListener('error', this.handleError.bind(this));
  }
  
  handleMessage(event) {
    const { type, id, ...data } = event.data;
    
    // Handle promise-based messages
    if (id && this.pendingMessages.has(id)) {
      const { resolve } = this.pendingMessages.get(id);
      this.pendingMessages.delete(id);
      resolve({ type, ...data });
    }
    
    // Handle event listeners
    if (this.eventListeners.has(type)) {
      this.eventListeners.get(type).forEach(callback => {
        callback({ type, id, ...data });
      });
    }
  }
  
  handleError(error) {
    console.error('Worker error:', {
      message: error.message,
      filename: error.filename,
      lineno: error.lineno
    });
    
    // Reject any pending promises
    this.pendingMessages.forEach(({ reject }) => {
      reject(new Error(`Worker error: ${error.message}`));
    });
    this.pendingMessages.clear();
  }
  
  // Send message and return promise
  sendMessage(type, data = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(id);
        reject(new Error(`Worker message timeout: ${type}`));
      }, timeout);
      
      this.pendingMessages.set(id, {
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
      
      this.worker.postMessage({ type, data, id });
    });
  }
  
  // Add event listener for worker messages
  addEventListener(type, callback) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(callback);
  }
  
  removeEventListener(type, callback) {
    if (this.eventListeners.has(type)) {
      const listeners = this.eventListeners.get(type);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  // Terminate worker and cleanup
  terminate() {
    this.worker.terminate();
    URL.revokeObjectURL(this.workerUrl);
    
    // Reject pending promises
    this.pendingMessages.forEach(({ reject }) => {
      reject(new Error('Worker terminated'));
    });
    this.pendingMessages.clear();
  }
}

// === Demo: Basic Worker Usage ===
console.log('\n=== Basic Worker Demo ===');

async function demonstrateBasicWorker() {
  const { workerUrl, cleanup } = createBasicWorker();
  const workerManager = new WorkerManager(`
    self.addEventListener('message', function(e) {
      const { type, data, id } = e.data;
      
      if (type === 'FIBONACCI') {
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
        
        const result = fibonacci(data.n);
        self.postMessage({ type: 'FIBONACCI_RESULT', id, result });
      }
    });
  `);
  
  try {
    // Test simple calculation
    console.log('Calculating Fibonacci(35)...');
    const start = performance.now();
    const result = await workerManager.sendMessage('FIBONACCI', { n: 35 });
    const duration = performance.now() - start;
    
    console.log(`Fibonacci result: ${result.result} (took ${duration.toFixed(2)}ms)`);
    
  } catch (error) {
    console.error('Worker demo error:', error);
  } finally {
    workerManager.terminate();
    cleanup();
  }
}

// === Message Passing Patterns ===
console.log('\n=== Message Passing Patterns ===');

class MessagePatternDemo {
  static demonstratePatterns() {
    const patterns = {
      // Fire and forget
      fireAndForget: (worker, data) => {
        worker.postMessage({ type: 'FIRE_FORGET', data });
      },
      
      // Request-response
      requestResponse: (worker, data) => {
        return new Promise((resolve, reject) => {
          const id = Math.random().toString(36);
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
          
          const handler = (e) => {
            if (e.data.id === id) {
              clearTimeout(timeout);
              worker.removeEventListener('message', handler);
              resolve(e.data);
            }
          };
          
          worker.addEventListener('message', handler);
          worker.postMessage({ type: 'REQUEST', data, id });
        });
      },
      
      // Streaming
      streaming: (worker, data) => {
        return {
          start: () => worker.postMessage({ type: 'START_STREAM', data }),
          stop: () => worker.postMessage({ type: 'STOP_STREAM' }),
          onData: (callback) => {
            worker.addEventListener('message', (e) => {
              if (e.data.type === 'STREAM_DATA') {
                callback(e.data);
              }
            });
          }
        };
      }
    };
    
    console.log('Message patterns available:', Object.keys(patterns));
    return patterns;
  }
}

// === Error Handling Patterns ===
console.log('\n=== Error Handling ===');

function createRobustWorker(script) {
  const blob = new Blob([script], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);
  
  // Enhanced error handling
  const errorHandlers = [];
  const messageHandlers = [];
  
  worker.addEventListener('error', (error) => {
    console.error('Worker runtime error:', error);
    errorHandlers.forEach(handler => handler(error));
  });
  
  worker.addEventListener('messageerror', (error) => {
    console.error('Worker message error:', error);
    errorHandlers.forEach(handler => handler(error));
  });
  
  worker.addEventListener('message', (event) => {
    if (event.data.type === 'ERROR') {
      const error = new Error(event.data.message);
      error.stack = event.data.stack;
      errorHandlers.forEach(handler => handler(error));
    } else {
      messageHandlers.forEach(handler => handler(event));
    }
  });
  
  return {
    worker,
    postMessage: (data) => worker.postMessage(data),
    onMessage: (handler) => messageHandlers.push(handler),
    onError: (handler) => errorHandlers.push(handler),
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    }
  };
}

// === Data Transfer Patterns ===
console.log('\n=== Data Transfer Patterns ===');

class DataTransferDemo {
  // Demonstrate different data transfer methods
  static createTransferDemo() {
    const demos = {
      // Simple JSON data (structured clone)
      simpleData: {
        data: { numbers: [1, 2, 3, 4, 5], text: 'hello' },
        cost: 'O(n) serialization'
      },
      
      // Large array (expensive to clone)
      largeArray: {
        data: new Array(1000000).fill(0).map((_, i) => i),
        cost: 'O(n) - expensive for large arrays'
      },
      
      // Transferable objects (zero-copy)
      transferable: {
        data: new ArrayBuffer(1024),
        transfer: true,
        cost: 'O(1) - ownership transfer'
      },
      
      // Shared Array Buffer (if supported)
      shared: (() => {
        try {
          const sharedBuffer = new SharedArrayBuffer(1024);
          return {
            data: sharedBuffer,
            cost: 'O(1) - shared memory'
          };
        } catch (e) {
          return {
            data: null,
            cost: 'Not supported in this environment'
          };
        }
      })()
    };
    
    return demos;
  }
}

// === Worker Lifecycle Management ===
console.log('\n=== Worker Lifecycle ===');

class WorkerLifecycle {
  constructor() {
    this.workers = new Set();
    this.isShuttingDown = false;
  }
  
  createWorker(script) {
    if (this.isShuttingDown) {
      throw new Error('Cannot create workers during shutdown');
    }
    
    const worker = createRobustWorker(script);
    this.workers.add(worker);
    
    // Auto-remove when terminated
    const originalTerminate = worker.terminate;
    worker.terminate = () => {
      this.workers.delete(worker);
      originalTerminate.call(worker);
    };
    
    return worker;
  }
  
  terminateAll() {
    this.isShuttingDown = true;
    console.log(`Terminating ${this.workers.size} workers`);
    
    this.workers.forEach(worker => worker.terminate());
    this.workers.clear();
    this.isShuttingDown = false;
  }
  
  getActiveWorkers() {
    return this.workers.size;
  }
}

// === Export for testing and usage ===
module.exports = {
  checkWorkerSupport,
  WorkerManager,
  MessagePatternDemo,
  createRobustWorker,
  DataTransferDemo,
  WorkerLifecycle,
  
  // Utility functions
  createWorkerFromString: (script) => {
    const blob = new Blob([script], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    return { worker: new Worker(url), cleanup: () => URL.revokeObjectURL(url) };
  },
  
  measureWorkerPerformance: async (task, iterations = 1) => {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await task();
      const duration = performance.now() - start;
      results.push(duration);
    }
    
    return {
      min: Math.min(...results),
      max: Math.max(...results),
      avg: results.reduce((a, b) => a + b) / results.length,
      results
    };
  }
};

// === Demo execution ===
if (typeof window !== 'undefined') {
  // Browser environment - can run demos
  console.log('\nRunning basic worker demonstration...');
  demonstrateBasicWorker().catch(console.error);
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    console.log('Page unloading - cleaning up workers');
  });
}