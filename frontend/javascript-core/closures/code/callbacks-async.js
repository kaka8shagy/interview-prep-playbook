/**
 * File: callbacks-async.js
 * Description: Closures in callbacks and async operations
 * Demonstrates state preservation across async boundaries
 */

// === Basic Async Callback with State ===
function createAsyncCounter() {
  let count = 0;
  let operations = [];
  
  return {
    increment(delay = 0, callback) {
      const operationId = Date.now() + Math.random();
      
      setTimeout(() => {
        count++;
        const operation = {
          id: operationId,
          type: 'increment',
          count,
          timestamp: new Date()
        };
        
        operations.push(operation);
        
        if (callback) {
          callback(null, operation);
        }
      }, delay);
      
      return operationId;
    },
    
    getCount() {
      return count;
    },
    
    getOperations() {
      return operations.slice();
    }
  };
}

console.log('=== Async Counter with Callbacks ===');
const asyncCounter = createAsyncCounter();

asyncCounter.increment(100, (err, result) => {
  console.log('First increment:', result);
});

asyncCounter.increment(200, (err, result) => {
  console.log('Second increment:', result);
});

// === Promise-based Async with Closures ===
function createAsyncTaskManager() {
  const tasks = new Map();
  let taskIdCounter = 0;
  
  function createTask(taskFn, delay = 0) {
    const taskId = ++taskIdCounter;
    const startTime = Date.now();
    
    const task = {
      id: taskId,
      status: 'pending',
      startTime,
      endTime: null,
      result: null,
      error: null
    };
    
    tasks.set(taskId, task);
    
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          task.status = 'running';
          const result = await taskFn();
          
          task.status = 'completed';
          task.endTime = Date.now();
          task.result = result;
          
          resolve(result);
        } catch (error) {
          task.status = 'failed';
          task.endTime = Date.now();
          task.error = error;
          
          reject(error);
        }
      }, delay);
    });
    
    return { taskId, promise };
  }
  
  return {
    createTask,
    
    getTask(taskId) {
      return tasks.get(taskId);
    },
    
    getAllTasks() {
      return Array.from(tasks.values());
    },
    
    getTasksByStatus(status) {
      return Array.from(tasks.values()).filter(task => task.status === status);
    }
  };
}

console.log('\n=== Async Task Manager ===');
const taskManager = createAsyncTaskManager();

// Create some async tasks
const task1 = taskManager.createTask(
  () => new Promise(resolve => setTimeout(() => resolve('Task 1 complete'), 100)),
  50
);

const task2 = taskManager.createTask(
  () => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Task 2 failed')), 150)),
  100
);

task1.promise
  .then(result => console.log('Task 1 result:', result))
  .catch(error => console.error('Task 1 error:', error));

task2.promise
  .then(result => console.log('Task 2 result:', result))
  .catch(error => console.error('Task 2 error:', error.message));

// === Callback Queue with Closures ===
function createCallbackQueue() {
  const queue = [];
  let isProcessing = false;
  let processedCount = 0;
  
  function processQueue() {
    if (isProcessing || queue.length === 0) {
      return;
    }
    
    isProcessing = true;
    
    const processNext = () => {
      if (queue.length === 0) {
        isProcessing = false;
        return;
      }
      
      const { callback, args, resolve, reject } = queue.shift();
      processedCount++;
      
      try {
        const result = callback.apply(null, args);
        
        // Handle both sync and async callbacks
        if (result && typeof result.then === 'function') {
          result
            .then(resolve)
            .catch(reject)
            .finally(() => {
              setTimeout(processNext, 0); // Process next in next tick
            });
        } else {
          resolve(result);
          setTimeout(processNext, 0);
        }
      } catch (error) {
        reject(error);
        setTimeout(processNext, 0);
      }
    };
    
    processNext();
  }
  
  return {
    enqueue(callback, ...args) {
      return new Promise((resolve, reject) => {
        queue.push({ callback, args, resolve, reject });
        processQueue();
      });
    },
    
    size() {
      return queue.length;
    },
    
    getProcessedCount() {
      return processedCount;
    },
    
    isProcessing() {
      return isProcessing;
    },
    
    clear() {
      queue.length = 0;
    }
  };
}

console.log('\n=== Callback Queue ===');
const callbackQueue = createCallbackQueue();

// Enqueue some callbacks
callbackQueue.enqueue((x, y) => {
  console.log(`Processing: ${x} + ${y} = ${x + y}`);
  return x + y;
}, 5, 3).then(result => console.log('Queue result 1:', result));

callbackQueue.enqueue(async (name) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`Async processing: Hello, ${name}!`);
  return `Hello, ${name}!`;
}, 'World').then(result => console.log('Queue result 2:', result));

// === Event-driven Async Pattern ===
function createAsyncEventProcessor() {
  const eventHandlers = {};
  const eventQueue = [];
  let isProcessingEvents = false;
  
  function processEventQueue() {
    if (isProcessingEvents || eventQueue.length === 0) {
      return;
    }
    
    isProcessingEvents = true;
    
    const processNext = async () => {
      if (eventQueue.length === 0) {
        isProcessingEvents = false;
        return;
      }
      
      const { eventType, data, timestamp } = eventQueue.shift();
      const handlers = eventHandlers[eventType] || [];
      
      console.log(`Processing event: ${eventType} at ${timestamp.toLocaleTimeString()}`);
      
      // Process all handlers for this event type
      const handlerPromises = handlers.map(async (handler) => {
        try {
          return await handler(data, eventType, timestamp);
        } catch (error) {
          console.error(`Handler error for ${eventType}:`, error);
          return null;
        }
      });
      
      await Promise.all(handlerPromises);
      
      // Process next event
      setTimeout(processNext, 0);
    };
    
    processNext();
  }
  
  return {
    on(eventType, handler) {
      if (!eventHandlers[eventType]) {
        eventHandlers[eventType] = [];
      }
      eventHandlers[eventType].push(handler);
    },
    
    emit(eventType, data) {
      const event = {
        eventType,
        data,
        timestamp: new Date()
      };
      
      eventQueue.push(event);
      processEventQueue();
      
      return event;
    },
    
    getQueueSize() {
      return eventQueue.length;
    },
    
    isProcessing() {
      return isProcessingEvents;
    }
  };
}

console.log('\n=== Async Event Processor ===');
const eventProcessor = createAsyncEventProcessor();

// Add event handlers
eventProcessor.on('user-action', async (data) => {
  console.log(`User action: ${data.action} by ${data.user}`);
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async work
});

eventProcessor.on('system-event', async (data) => {
  console.log(`System event: ${data.message}`);
  await new Promise(resolve => setTimeout(resolve, 30));
});

// Emit events
eventProcessor.emit('user-action', { user: 'john', action: 'login' });
eventProcessor.emit('system-event', { message: 'System started' });
eventProcessor.emit('user-action', { user: 'jane', action: 'logout' });

// === Retry Logic with Closures ===
function createRetryableOperation() {
  return function withRetry(operation, maxRetries = 3, delay = 1000) {
    let attemptCount = 0;
    const startTime = Date.now();
    
    return new Promise(async (resolve, reject) => {
      const attemptOperation = async () => {
        attemptCount++;
        
        try {
          console.log(`Attempt ${attemptCount} of ${maxRetries + 1}`);
          const result = await operation();
          
          const duration = Date.now() - startTime;
          console.log(`Operation succeeded after ${attemptCount} attempts in ${duration}ms`);
          
          resolve({
            result,
            attempts: attemptCount,
            duration
          });
        } catch (error) {
          console.log(`Attempt ${attemptCount} failed:`, error.message);
          
          if (attemptCount > maxRetries) {
            reject({
              error,
              attempts: attemptCount,
              duration: Date.now() - startTime
            });
          } else {
            console.log(`Retrying in ${delay}ms...`);
            setTimeout(attemptOperation, delay);
          }
        }
      };
      
      attemptOperation();
    });
  };
}

console.log('\n=== Retryable Operation ===');
const withRetry = createRetryableOperation();

// Simulate an operation that fails a few times
let callCount = 0;
const unreliableOperation = () => {
  return new Promise((resolve, reject) => {
    callCount++;
    if (callCount < 3) {
      reject(new Error(`Simulated failure ${callCount}`));
    } else {
      resolve('Success!');
    }
  });
};

withRetry(unreliableOperation, 3, 500)
  .then(result => console.log('Final result:', result))
  .catch(error => console.error('Final error:', error));

// === Async State Machine ===
function createAsyncStateMachine(states, initialState) {
  let currentState = initialState;
  let stateHistory = [{ state: initialState, timestamp: Date.now() }];
  const transitions = new Map();
  
  function addTransition(fromState, toState, condition, action) {
    const key = `${fromState}->${toState}`;
    transitions.set(key, { condition, action });
  }
  
  async function transition(toState, context = {}) {
    const key = `${currentState}->${toState}`;
    const transitionConfig = transitions.get(key);
    
    if (!transitionConfig) {
      throw new Error(`Invalid transition from ${currentState} to ${toState}`);
    }
    
    // Check condition if provided
    if (transitionConfig.condition && !(await transitionConfig.condition(context))) {
      throw new Error(`Transition condition not met for ${key}`);
    }
    
    // Execute action if provided
    let actionResult = null;
    if (transitionConfig.action) {
      actionResult = await transitionConfig.action(context);
    }
    
    // Update state
    const previousState = currentState;
    currentState = toState;
    
    stateHistory.push({
      from: previousState,
      to: toState,
      timestamp: Date.now(),
      context,
      actionResult
    });
    
    console.log(`State transition: ${previousState} -> ${toState}`);
    
    return actionResult;
  }
  
  return {
    addTransition,
    transition,
    
    getCurrentState() {
      return currentState;
    },
    
    getHistory() {
      return stateHistory.slice();
    },
    
    canTransitionTo(toState) {
      return transitions.has(`${currentState}->${toState}`);
    }
  };
}

console.log('\n=== Async State Machine ===');
const stateMachine = createAsyncStateMachine(['idle', 'loading', 'success', 'error'], 'idle');

// Define transitions
stateMachine.addTransition('idle', 'loading', null, async () => {
  console.log('Starting async operation...');
  return 'Loading started';
});

stateMachine.addTransition('loading', 'success', null, async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('Operation completed successfully');
  return 'Success data';
});

stateMachine.addTransition('loading', 'error', null, async () => {
  console.log('Operation failed');
  return 'Error details';
});

// Execute transitions
setTimeout(async () => {
  try {
    await stateMachine.transition('loading');
    await stateMachine.transition('success');
    
    console.log('Current state:', stateMachine.getCurrentState());
    console.log('State history:', stateMachine.getHistory());
  } catch (error) {
    console.error('State machine error:', error);
  }
}, 500);

module.exports = {
  createAsyncCounter,
  createAsyncTaskManager,
  createCallbackQueue,
  createAsyncEventProcessor,
  createRetryableOperation,
  createAsyncStateMachine
};