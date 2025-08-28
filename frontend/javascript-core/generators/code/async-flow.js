/**
 * File: async-flow.js
 * Description: Async flow control with generators
 * Demonstrates how generators can manage asynchronous operations and control flow
 */

console.log('=== Basic Async Flow with Generators ===');

// Simple async runner for generators
function runAsync(generatorFunction, ...args) {
  const generator = generatorFunction(...args);
  
  function handle(result) {
    if (result.done) return result.value;
    
    return Promise.resolve(result.value)
      .then(res => handle(generator.next(res)))
      .catch(err => handle(generator.throw(err)));
  }
  
  try {
    return handle(generator.next());
  } catch (ex) {
    return Promise.reject(ex);
  }
}

// Mock async functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 'error') {
        reject(new Error('User not found'));
      } else {
        resolve({ id, name: `User ${id}`, email: `user${id}@example.com` });
      }
    }, 100);
  });
}

function fetchPosts(userId) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'Post 1', author: userId },
        { id: 2, title: 'Post 2', author: userId }
      ]);
    }, 50);
  });
}

// Basic async generator usage
function* fetchUserData(userId) {
  try {
    console.log('Fetching user...');
    const user = yield fetchUser(userId);
    
    console.log('Fetching posts...');
    const posts = yield fetchPosts(user.id);
    
    return { user, posts };
  } catch (error) {
    console.log('Error in fetchUserData:', error.message);
    throw error;
  }
}

console.log('1. Basic Async Flow:');
runAsync(fetchUserData, '123')
  .then(result => console.log('Result:', result))
  .catch(error => console.log('Caught:', error.message));

console.log('\n=== Sequential vs Parallel Execution ===');

// Sequential execution
function* sequentialFetch(userIds) {
  const users = [];
  
  for (const id of userIds) {
    console.log(`Fetching user ${id}...`);
    const user = yield fetchUser(id);
    users.push(user);
  }
  
  return users;
}

// Parallel execution
function* parallelFetch(userIds) {
  console.log('Starting parallel fetch...');
  
  // Create all promises at once
  const promises = userIds.map(id => fetchUser(id));
  
  // Wait for all to complete
  const users = yield Promise.all(promises);
  
  return users;
}

console.log('2. Sequential Fetch:');
setTimeout(async () => {
  const start = Date.now();
  const users = await runAsync(sequentialFetch, ['1', '2', '3']);
  const duration = Date.now() - start;
  console.log(`Sequential completed in ${duration}ms`);
  console.log('Users:', users.map(u => u.name));
}, 200);

console.log('3. Parallel Fetch:');
setTimeout(async () => {
  const start = Date.now();
  const users = await runAsync(parallelFetch, ['1', '2', '3']);
  const duration = Date.now() - start;
  console.log(`Parallel completed in ${duration}ms`);
  console.log('Users:', users.map(u => u.name));
}, 400);

console.log('\n=== Error Handling Patterns ===');

// Error recovery patterns
function* fetchWithRetry(userId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch user ${userId}`);
      const user = yield fetchUser(userId);
      return user;
    } catch (error) {
      if (attempt === maxRetries) {
        console.log(`Failed after ${maxRetries} attempts`);
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      yield delay(1000 * attempt); // Exponential backoff
    }
  }
}

// Fallback strategies
function* fetchWithFallback(primaryId, fallbackId) {
  try {
    console.log('Trying primary source...');
    const user = yield fetchUser(primaryId);
    return { user, source: 'primary' };
  } catch (primaryError) {
    console.log('Primary failed, trying fallback...');
    
    try {
      const user = yield fetchUser(fallbackId);
      return { user, source: 'fallback' };
    } catch (fallbackError) {
      console.log('Both sources failed');
      throw new Error('All sources unavailable');
    }
  }
}

console.log('4. Retry Pattern:');
setTimeout(async () => {
  try {
    const user = await runAsync(fetchWithRetry, 'error', 2);
    console.log('Retry succeeded:', user);
  } catch (error) {
    console.log('Retry pattern failed:', error.message);
  }
}, 600);

console.log('5. Fallback Pattern:');
setTimeout(async () => {
  const result = await runAsync(fetchWithFallback, 'error', '456');
  console.log('Fallback result:', result);
}, 800);

console.log('\n=== Rate Limiting and Throttling ===');

// Rate-limited async generator
function* rateLimitedRequests(requests, rateLimit = 2, interval = 1000) {
  const results = [];
  const chunks = [];
  
  // Split requests into chunks based on rate limit
  for (let i = 0; i < requests.length; i += rateLimit) {
    chunks.push(requests.slice(i, i + rateLimit));
  }
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    
    // Process chunk in parallel
    const chunkPromises = chunks[i].map(req => fetchUser(req.id));
    const chunkResults = yield Promise.all(chunkPromises);
    
    results.push(...chunkResults);
    
    // Wait before next chunk (except for last chunk)
    if (i < chunks.length - 1) {
      console.log(`Waiting ${interval}ms before next chunk...`);
      yield delay(interval);
    }
  }
  
  return results;
}

const requests = [
  { id: '1' }, { id: '2' }, { id: '3' }, 
  { id: '4' }, { id: '5' }
];

console.log('6. Rate Limited Requests:');
setTimeout(async () => {
  const start = Date.now();
  const users = await runAsync(rateLimitedRequests, requests, 2, 500);
  const duration = Date.now() - start;
  console.log(`Rate limited fetch completed in ${duration}ms`);
  console.log('Users:', users.length);
}, 1000);

console.log('\n=== Pipeline Processing ===');

// Data processing pipeline
function* processingPipeline(data) {
  console.log('Starting pipeline...');
  
  // Stage 1: Validation
  console.log('Stage 1: Validating data...');
  yield delay(100);
  const validData = data.filter(item => item && typeof item === 'object');
  console.log(`Validated ${validData.length}/${data.length} items`);
  
  // Stage 2: Enrichment
  console.log('Stage 2: Enriching data...');
  const enrichedData = [];
  for (const item of validData) {
    yield delay(50); // Simulate async enrichment
    enrichedData.push({
      ...item,
      enriched: true,
      timestamp: new Date().toISOString()
    });
  }
  
  // Stage 3: Transformation
  console.log('Stage 3: Transforming data...');
  yield delay(100);
  const transformedData = enrichedData.map(item => ({
    id: item.id,
    processedName: item.name?.toUpperCase(),
    metadata: {
      enriched: item.enriched,
      processed: item.timestamp
    }
  }));
  
  console.log('Pipeline completed');
  return transformedData;
}

const pipelineData = [
  { id: 1, name: 'item1' },
  { id: 2, name: 'item2' },
  null, // Invalid item
  { id: 3, name: 'item3' }
];

console.log('7. Processing Pipeline:');
setTimeout(async () => {
  const result = await runAsync(processingPipeline, pipelineData);
  console.log('Pipeline result:', result);
}, 2000);

console.log('\n=== Event-Driven Flow ===');

// Event-driven async generator
class AsyncEventEmitter {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.processing = false;
  }
  
  emit(event, data) {
    this.eventQueue.push({ event, data, timestamp: Date.now() });
    this.processQueue();
  }
  
  async processQueue() {
    if (this.processing || this.eventQueue.length === 0) return;
    
    this.processing = true;
    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift();
      const listeners = this.listeners.get(event) || [];
      
      for (const listener of listeners) {
        try {
          await listener(data);
        } catch (error) {
          console.log(`Event listener error: ${error.message}`);
        }
      }
    }
    this.processing = false;
  }
  
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
  
  off(event, listener) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

function* eventDrivenFlow(emitter) {
  const results = [];
  let completed = false;
  
  // Set up event handlers
  emitter.on('data', async (data) => {
    console.log('Processing data event:', data);
    results.push(await processDataEvent(data));
  });
  
  emitter.on('error', (error) => {
    console.log('Error event:', error.message);
  });
  
  emitter.on('complete', () => {
    console.log('Complete event received');
    completed = true;
  });
  
  // Wait for completion
  while (!completed) {
    yield delay(100); // Check every 100ms
  }
  
  return results;
}

async function processDataEvent(data) {
  await delay(200); // Simulate async processing
  return { processed: data, timestamp: Date.now() };
}

console.log('8. Event-Driven Flow:');
setTimeout(async () => {
  const emitter = new AsyncEventEmitter();
  
  // Start the event-driven flow
  const flowPromise = runAsync(eventDrivenFlow, emitter);
  
  // Simulate events
  setTimeout(() => emitter.emit('data', 'event1'), 100);
  setTimeout(() => emitter.emit('data', 'event2'), 300);
  setTimeout(() => emitter.emit('error', new Error('Test error')), 500);
  setTimeout(() => emitter.emit('data', 'event3'), 700);
  setTimeout(() => emitter.emit('complete'), 1000);
  
  const results = await flowPromise;
  console.log('Event-driven results:', results);
}, 3000);

console.log('\n=== Advanced Patterns ===');

// Circuit breaker pattern
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000, resetTimeout = 10000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(fn, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

function* circuitBreakerFlow(breaker, requests) {
  const results = [];
  const errors = [];
  
  for (const request of requests) {
    try {
      const result = yield breaker.call(fetchUser, request.id);
      results.push(result);
      console.log(`Request ${request.id} succeeded`);
    } catch (error) {
      errors.push({ request: request.id, error: error.message });
      console.log(`Request ${request.id} failed: ${error.message}`);
    }
  }
  
  return { results, errors };
}

console.log('9. Circuit Breaker Pattern:');
setTimeout(async () => {
  const breaker = new CircuitBreaker(2, 60000, 1000);
  const testRequests = [
    { id: '1' }, { id: 'error' }, { id: 'error' }, 
    { id: 'error' }, { id: '2' }, { id: '3' }
  ];
  
  const result = await runAsync(circuitBreakerFlow, breaker, testRequests);
  console.log('Circuit breaker results:', result);
}, 5000);

console.log('\n=== Interview Questions ===');

// Q1: Implement async/await using generators
function asyncAwait(generatorFunction) {
  return function (...args) {
    const generator = generatorFunction.apply(this, args);
    
    return new Promise((resolve, reject) => {
      function step(nextF, throwF) {
        let next;
        try {
          next = nextF ? nextF() : generator.next();
        } catch (e) {
          reject(e);
          return;
        }
        
        if (next.done) {
          resolve(next.value);
          return;
        }
        
        Promise.resolve(next.value)
          .then(
            v => step(() => generator.next(v)),
            e => step(() => generator.throw(e))
          );
      }
      
      step();
    });
  };
}

// Usage of custom async/await
const customAsync = asyncAwait(function* (userId) {
  try {
    const user = yield fetchUser(userId);
    const posts = yield fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.log('Custom async error:', error.message);
    throw error;
  }
});

console.log('Q1: Custom Async/Await:');
setTimeout(async () => {
  try {
    const result = await customAsync('789');
    console.log('Custom async result:', result.user.name);
  } catch (error) {
    console.log('Custom async failed:', error.message);
  }
}, 6000);

// Q2: Implement concurrent execution with limit
function* concurrentWithLimit(tasks, limit = 3) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const promise = task().then(result => {
      const index = executing.indexOf(promise);
      executing.splice(index, 1);
      return result;
    });
    
    results.push(promise);
    executing.push(promise);
    
    if (executing.length >= limit) {
      yield Promise.race(executing);
    }
  }
  
  // Wait for remaining tasks
  while (executing.length > 0) {
    yield Promise.race(executing);
  }
  
  return yield Promise.all(results);
}

const tasks = [
  () => delay(100).then(() => 'Task 1'),
  () => delay(200).then(() => 'Task 2'),
  () => delay(150).then(() => 'Task 3'),
  () => delay(300).then(() => 'Task 4'),
  () => delay(100).then(() => 'Task 5')
];

console.log('Q2: Concurrent with Limit:');
setTimeout(async () => {
  const start = Date.now();
  const results = await runAsync(concurrentWithLimit, tasks, 2);
  const duration = Date.now() - start;
  console.log(`Concurrent execution completed in ${duration}ms`);
  console.log('Results:', results);
}, 7000);

module.exports = {
  runAsync,
  fetchUserData,
  sequentialFetch,
  parallelFetch,
  fetchWithRetry,
  fetchWithFallback,
  rateLimitedRequests,
  processingPipeline,
  AsyncEventEmitter,
  eventDrivenFlow,
  CircuitBreaker,
  circuitBreakerFlow,
  asyncAwait,
  concurrentWithLimit
};