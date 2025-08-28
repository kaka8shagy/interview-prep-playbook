/**
 * File: worker-basics.js
 * Description: Basic Web Worker creation and communication
 */

// === Main Thread Code ===
console.log('=== Web Worker Basics ===\n');

// Check if Web Workers are supported
if (typeof Worker !== 'undefined') {
  console.log('Web Workers are supported');
} else {
  console.log('Web Workers are not supported');
}

// === Creating a Worker from External File ===
// Note: In real implementation, you'd have a separate worker.js file

// Create worker script as blob for demo purposes
const workerScript = `
  // Worker script code
  console.log('Worker started');
  
  // Listen for messages from main thread
  self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    switch(type) {
      case 'CALCULATE':
        const result = performCalculation(data);
        self.postMessage({ type: 'RESULT', result });
        break;
        
      case 'ECHO':
        self.postMessage({ type: 'ECHO_RESPONSE', message: 'Echo: ' + data });
        break;
        
      case 'TERMINATE':
        self.postMessage({ type: 'TERMINATING' });
        self.close(); // Terminate from within worker
        break;
        
      default:
        self.postMessage({ type: 'ERROR', message: 'Unknown message type' });
    }
  });
  
  function performCalculation(num) {
    // Simulate CPU-intensive task
    let result = 0;
    for (let i = 0; i < num * 1000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  }
  
  // Worker can send messages without being prompted
  setTimeout(() => {
    self.postMessage({ type: 'HEARTBEAT', timestamp: Date.now() });
  }, 2000);
`;

// Create blob URL for worker
const blob = new Blob([workerScript], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);

// Create worker
const worker = new Worker(workerUrl);

// === Message Handling ===
worker.addEventListener('message', function(e) {
  const { type, result, message, timestamp } = e.data;
  
  switch(type) {
    case 'RESULT':
      console.log('Calculation result:', result);
      break;
      
    case 'ECHO_RESPONSE':
      console.log('Echo response:', message);
      break;
      
    case 'HEARTBEAT':
      console.log('Worker heartbeat at:', new Date(timestamp).toISOString());
      break;
      
    case 'TERMINATING':
      console.log('Worker is terminating');
      break;
      
    case 'ERROR':
      console.error('Worker error:', message);
      break;
      
    default:
      console.log('Unknown message from worker:', e.data);
  }
});

// === Error Handling ===
worker.addEventListener('error', function(e) {
  console.error('Worker error:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno
  });
});

// === Sending Messages to Worker ===
console.log('Sending messages to worker...');

// Send calculation task
worker.postMessage({ type: 'CALCULATE', data: 100 });

// Send echo message
worker.postMessage({ type: 'ECHO', data: 'Hello Worker!' });

// Send unknown message type (will trigger error response)
worker.postMessage({ type: 'UNKNOWN', data: 'test' });

// === Worker Lifecycle Management ===
function createManagedWorker(script) {
  const blob = new Blob([script], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  
  const cleanup = () => {
    worker.terminate();
    URL.revokeObjectURL(url);
  };
  
  // Auto-cleanup after timeout
  const timeout = setTimeout(cleanup, 10000);
  
  return {
    worker,
    cleanup: () => {
      clearTimeout(timeout);
      cleanup();
    }
  };
}

// === Simple Task Example ===
function runWorkerTask(taskData) {
  return new Promise((resolve, reject) => {
    const taskScript = `
      self.addEventListener('message', function(e) {
        try {
          const { numbers } = e.data;
          const sum = numbers.reduce((a, b) => a + b, 0);
          const avg = sum / numbers.length;
          
          self.postMessage({ 
            success: true, 
            sum, 
            average: avg,
            count: numbers.length
          });
        } catch (error) {
          self.postMessage({ 
            success: false, 
            error: error.message 
          });
        }
      });
    `;
    
    const { worker, cleanup } = createManagedWorker(taskScript);
    
    worker.addEventListener('message', function(e) {
      cleanup();
      
      if (e.data.success) {
        resolve(e.data);
      } else {
        reject(new Error(e.data.error));
      }
    });
    
    worker.addEventListener('error', function(e) {
      cleanup();
      reject(new Error(`Worker error: ${e.message}`));
    });
    
    worker.postMessage(taskData);
  });
}

// Test the managed worker
console.log('\n=== Managed Worker Test ===');
runWorkerTask({ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })
  .then(result => {
    console.log('Task result:', result);
  })
  .catch(error => {
    console.error('Task error:', error.message);
  });

// === Multiple Workers ===
console.log('\n=== Multiple Workers ===');

function createWorkerPool(size, script) {
  const workers = [];
  
  for (let i = 0; i < size; i++) {
    const { worker } = createManagedWorker(script);
    workers.push(worker);
  }
  
  let currentWorker = 0;
  
  return {
    execute(data) {
      return new Promise((resolve, reject) => {
        const worker = workers[currentWorker];
        currentWorker = (currentWorker + 1) % workers.length;
        
        const messageHandler = (e) => {
          worker.removeEventListener('message', messageHandler);
          resolve(e.data);
        };
        
        const errorHandler = (e) => {
          worker.removeEventListener('error', errorHandler);
          reject(new Error(e.message));
        };
        
        worker.addEventListener('message', messageHandler);
        worker.addEventListener('error', errorHandler);
        worker.postMessage(data);
      });
    },
    
    terminate() {
      workers.forEach(worker => worker.terminate());
    }
  };
}

const poolScript = `
  self.addEventListener('message', function(e) {
    const { id, task, data } = e.data;
    
    // Simulate work
    const start = Date.now();
    let result = 0;
    for (let i = 0; i < data * 100000; i++) {
      result += Math.sin(i);
    }
    const duration = Date.now() - start;
    
    self.postMessage({ 
      id, 
      result: result.toFixed(2), 
      duration,
      workerId: self.name || 'unnamed'
    });
  });
`;

const pool = createWorkerPool(3, poolScript);

// Execute tasks on pool
const tasks = [
  { id: 1, task: 'calculate', data: 1000 },
  { id: 2, task: 'calculate', data: 2000 },
  { id: 3, task: 'calculate', data: 1500 },
  { id: 4, task: 'calculate', data: 800 }
];

Promise.all(
  tasks.map(task => pool.execute(task))
).then(results => {
  console.log('Pool results:', results);
  pool.terminate();
}).catch(error => {
  console.error('Pool error:', error);
  pool.terminate();
});

// === Cleanup ===
setTimeout(() => {
  console.log('\nCleaning up workers...');
  worker.terminate();
  URL.revokeObjectURL(workerUrl);
}, 5000);

// === Export for Testing ===
module.exports = {
  createManagedWorker,
  runWorkerTask,
  createWorkerPool
};