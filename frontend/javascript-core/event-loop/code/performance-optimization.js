/**
 * File: performance-optimization.js  
 * Description: Event loop performance optimization techniques and non-blocking patterns
 * 
 * Learning objectives:
 * - Master techniques for non-blocking JavaScript execution
 * - Learn how to prevent UI freezing and callback starvation
 * - Understand race condition prevention and resolution
 * - Implement efficient task scheduling and batching patterns
 * 
 * This file consolidates: non-blocking-processing.js, race-condition-fix.js, performance-optimization.js
 */

console.log('=== Event Loop Performance Optimization ===\n');

// ============================================================================
// PART 1: NON-BLOCKING PROCESSING PATTERNS
// ============================================================================

/**
 * PROBLEM: Heavy synchronous operations block the event loop
 * 
 * When JavaScript executes long-running synchronous code:
 * - Browser UI becomes unresponsive (no clicks, scrolling, animations)
 * - Node.js server can't handle new requests  
 * - Other callbacks are starved and can't execute
 * 
 * SOLUTION: Break work into chunks and yield control periodically
 */

class NonBlockingProcessor {
  constructor() {
    this.isProcessing = false;
    this.processedCount = 0;
    this.startTime = null;
  }
  
  /**
   * TECHNIQUE 1: Time-based chunking
   * Process items until a time limit is reached, then yield
   */
  async processWithTimeSlicing(items, processor, maxTimeMs = 16) {
    console.log(`Processing ${items.length} items with time slicing (${maxTimeMs}ms chunks)`);
    
    this.isProcessing = true;
    this.processedCount = 0;
    this.startTime = Date.now();
    
    let currentIndex = 0;
    
    while (currentIndex < items.length && this.isProcessing) {
      const chunkStartTime = Date.now();
      
      // Process items until time limit or completion
      while (currentIndex < items.length) {
        const item = items[currentIndex];
        
        // Simulate processing work - in real code this might be:
        // - DOM manipulation
        // - Data transformation  
        // - Complex calculations
        processor(item, currentIndex);
        
        currentIndex++;
        this.processedCount++;
        
        // Check if we've exceeded our time budget
        const elapsedTime = Date.now() - chunkStartTime;
        if (elapsedTime >= maxTimeMs) {
          console.log(`  Chunk complete: processed ${this.processedCount}/${items.length} (${elapsedTime}ms)`);
          break;
        }
      }
      
      // Yield control to the event loop
      // This allows other tasks (UI updates, other callbacks) to run
      if (currentIndex < items.length) {
        await this.yieldToEventLoop();
      }
    }
    
    const totalTime = Date.now() - this.startTime;
    console.log(`  Time slicing complete: ${this.processedCount} items in ${totalTime}ms`);
    this.isProcessing = false;
  }
  
  /**
   * TECHNIQUE 2: Count-based chunking  
   * Process a fixed number of items, then yield
   */
  async processWithCountChunking(items, processor, chunkSize = 100) {
    console.log(`Processing ${items.length} items with count chunking (${chunkSize} per chunk)`);
    
    this.isProcessing = true;
    this.processedCount = 0;
    this.startTime = Date.now();
    
    for (let i = 0; i < items.length && this.isProcessing; i += chunkSize) {
      const chunkStartTime = Date.now();
      
      // Process this chunk synchronously
      const chunkEnd = Math.min(i + chunkSize, items.length);
      for (let j = i; j < chunkEnd; j++) {
        processor(items[j], j);
        this.processedCount++;
      }
      
      const chunkTime = Date.now() - chunkStartTime;
      console.log(`  Chunk ${Math.floor(i/chunkSize) + 1}: processed ${chunkEnd - i} items (${chunkTime}ms)`);
      
      // Yield to event loop between chunks
      if (chunkEnd < items.length) {
        await this.yieldToEventLoop();
      }
    }
    
    const totalTime = Date.now() - this.startTime;
    console.log(`  Count chunking complete: ${this.processedCount} items in ${totalTime}ms`);
    this.isProcessing = false;
  }
  
  /**
   * TECHNIQUE 3: Priority-aware yielding
   * Adjust yielding strategy based on task priority
   */
  async processWithPriorityYielding(items, processor, priority = 'normal') {
    console.log(`Processing ${items.length} items with ${priority} priority yielding`);
    
    // Different yielding strategies based on priority
    const yieldingConfig = {
      'critical': { chunkSize: 1000, yieldMethod: 'microtask' }, // Less yielding
      'normal': { chunkSize: 100, yieldMethod: 'macrotask' },   // Balanced
      'background': { chunkSize: 10, yieldMethod: 'macrotask' }  // More yielding
    };
    
    const config = yieldingConfig[priority] || yieldingConfig['normal'];
    
    this.isProcessing = true;
    this.processedCount = 0;
    this.startTime = Date.now();
    
    for (let i = 0; i < items.length && this.isProcessing; i += config.chunkSize) {
      // Process chunk
      const chunkEnd = Math.min(i + config.chunkSize, items.length);
      for (let j = i; j < chunkEnd; j++) {
        processor(items[j], j);
        this.processedCount++;
      }
      
      console.log(`  ${priority} priority chunk: ${chunkEnd - i} items processed`);
      
      // Yield based on priority
      if (chunkEnd < items.length) {
        if (config.yieldMethod === 'microtask') {
          // Less yielding - only to microtasks
          await Promise.resolve();
        } else {
          // More yielding - to macrotasks  
          await this.yieldToEventLoop();
        }
      }
    }
    
    const totalTime = Date.now() - this.startTime;
    console.log(`  Priority processing complete: ${this.processedCount} items in ${totalTime}ms`);
    this.isProcessing = false;
  }
  
  /**
   * Utility method to yield control to the event loop
   * This allows other tasks to run before continuing
   */
  yieldToEventLoop() {
    // setTimeout with 0 delay schedules a macrotask
    // This gives maximum opportunity for other work to run
    return new Promise(resolve => setTimeout(resolve, 0));
  }
  
  // Allow external cancellation  
  cancel() {
    console.log('  Processing cancelled by user');
    this.isProcessing = false;
  }
}

// Demonstrate non-blocking processing
const processor = new NonBlockingProcessor();

// Create test data
const testData = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  value: Math.random() * 1000,
  category: i % 10
}));

// Mock processor function that simulates work
const heavyProcessor = (item, index) => {
  // Simulate computational work
  let result = 0;
  for (let i = 0; i < 1000; i++) {
    result += Math.sin(item.value) * Math.cos(index);
  }
  item.processed = result;
  
  // Simulate occasional heavy operation
  if (index % 100 === 0) {
    // Extra work every 100 items
    for (let i = 0; i < 5000; i++) {
      result += Math.sqrt(i * item.value);
    }
  }
};

// Demo 1: Time-based chunking
processor.processWithTimeSlicing(testData.slice(0, 200), heavyProcessor, 20);

// Demo 2: Count-based chunking  
setTimeout(() => {
  processor.processWithCountChunking(testData.slice(200, 350), heavyProcessor, 50);
}, 100);

// Demo 3: Priority-aware processing
setTimeout(() => {
  processor.processWithPriorityYielding(testData.slice(350, 450), heavyProcessor, 'critical');
}, 200);

setTimeout(() => {
  processor.processWithPriorityYielding(testData.slice(450), heavyProcessor, 'background');
}, 300);

// ============================================================================
// PART 2: RACE CONDITION PREVENTION
// ============================================================================

/**
 * PROBLEM: Async operations can complete in unexpected order
 * 
 * Race conditions occur when:
 * - Multiple async operations run concurrently
 * - Code assumes a specific completion order
 * - Results depend on timing rather than logic
 */

class RaceConditionHandler {
  constructor() {
    this.operationCounter = 0;
    this.pendingOperations = new Map();
  }
  
  /**
   * TECHNIQUE 1: Operation sequencing
   * Ensure operations complete in the correct order
   */
  async sequentialOperations(tasks) {
    console.log('\n--- Sequential Operation Handling ---');
    console.log(`Processing ${tasks.length} tasks sequentially`);
    
    const results = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      console.log(`  Starting task ${i + 1}: ${task.name}`);
      
      try {
        // Await each task before starting the next
        // This prevents race conditions by enforcing order
        const result = await this.simulateAsyncTask(task);
        results.push(result);
        console.log(`  ✅ Task ${i + 1} completed: ${result.data}`);
      } catch (error) {
        console.log(`  ❌ Task ${i + 1} failed: ${error.message}`);
        results.push({ error: error.message });
      }
    }
    
    console.log('Sequential processing complete');
    return results;
  }
  
  /**
   * TECHNIQUE 2: Request cancellation
   * Cancel outdated requests to prevent stale data updates
   */
  async handleWithCancellation(requestData) {
    console.log('\n--- Request Cancellation Pattern ---');
    
    // Cancel any existing operation for this data
    const operationId = ++this.operationCounter;
    console.log(`Starting operation ${operationId} for: ${requestData.query}`);
    
    // Store operation reference for potential cancellation
    const controller = new AbortController();
    this.pendingOperations.set(operationId, controller);
    
    try {
      // Simulate an API request that might be slow
      const result = await this.simulateSlowApiCall(requestData, controller.signal);
      
      // Check if operation was cancelled while we were waiting
      if (!this.pendingOperations.has(operationId)) {
        console.log(`  Operation ${operationId} was cancelled, ignoring result`);
        return null;
      }
      
      // Clean up and return result
      this.pendingOperations.delete(operationId);
      console.log(`  ✅ Operation ${operationId} completed successfully`);
      return result;
      
    } catch (error) {
      this.pendingOperations.delete(operationId);
      
      if (error.name === 'AbortError') {
        console.log(`  🚫 Operation ${operationId} was aborted`);
        return null;
      } else {
        console.log(`  ❌ Operation ${operationId} failed: ${error.message}`);
        throw error;
      }
    }
  }
  
  /**
   * TECHNIQUE 3: Latest-only pattern
   * Only process the most recent request, ignoring older ones
   */
  async handleLatestOnly(requests) {
    console.log('\n--- Latest-Only Request Pattern ---');
    
    let latestRequestId = 0;
    const results = [];
    
    // Start all requests simultaneously
    const requestPromises = requests.map(async (request, index) => {
      const requestId = ++latestRequestId;
      const currentLatest = requestId;
      
      console.log(`  Starting request ${requestId}: ${request.query}`);
      
      try {
        const result = await this.simulateAsyncTask(request);
        
        // Only use result if this is still the latest request
        if (requestId === currentLatest && requestId === latestRequestId) {
          console.log(`  ✅ Request ${requestId} is latest, using result`);
          return result;
        } else {
          console.log(`  🚫 Request ${requestId} is outdated, ignoring result`);
          return null;
        }
      } catch (error) {
        console.log(`  ❌ Request ${requestId} failed: ${error.message}`);
        return null;
      }
    });
    
    // Wait for all requests, but only use the latest result
    const allResults = await Promise.allSettled(requestPromises);
    const validResults = allResults
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(result => result !== null);
    
    console.log(`Latest-only processing complete: ${validResults.length} valid results`);
    return validResults;
  }
  
  /**
   * Simulate async task with variable timing
   */
  async simulateAsyncTask(task) {
    const delay = Math.random() * 200 + 50; // 50-250ms random delay
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error(`Task ${task.name} randomly failed`);
    }
    
    return {
      taskName: task.name,
      data: `Result for ${task.query}`,
      completedAt: Date.now(),
      processingTime: delay
    };
  }
  
  /**
   * Simulate slow API call with abort support
   */
  async simulateSlowApiCall(requestData, abortSignal) {
    const delay = Math.random() * 500 + 100; // 100-600ms delay
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve({
          query: requestData.query,
          data: `API result for ${requestData.query}`,
          timestamp: Date.now()
        });
      }, delay);
      
      // Handle abort signal
      abortSignal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('AbortError'));
      });
    });
  }
  
  // Cancel all pending operations
  cancelAllPending() {
    console.log(`Cancelling ${this.pendingOperations.size} pending operations`);
    
    for (const [id, controller] of this.pendingOperations) {
      controller.abort();
      console.log(`  Cancelled operation ${id}`);
    }
    
    this.pendingOperations.clear();
  }
}

// Demonstrate race condition handling
const raceHandler = new RaceConditionHandler();

// Test data with different timing characteristics
const tasks = [
  { name: 'Fast Task', query: 'quick-data', expectedDelay: 'short' },
  { name: 'Medium Task', query: 'medium-data', expectedDelay: 'medium' },
  { name: 'Slow Task', query: 'slow-data', expectedDelay: 'long' }
];

// Demo 1: Sequential processing (no race conditions)
setTimeout(() => {
  raceHandler.sequentialOperations(tasks);
}, 400);

// Demo 2: Cancellation pattern
setTimeout(() => {
  // Start multiple requests, then cancel some
  raceHandler.handleWithCancellation({ query: 'search-term-1' });
  
  setTimeout(() => {
    raceHandler.handleWithCancellation({ query: 'search-term-2' });
    
    // Cancel all pending after a short delay  
    setTimeout(() => {
      raceHandler.cancelAllPending();
    }, 100);
  }, 50);
}, 800);

// Demo 3: Latest-only pattern
setTimeout(() => {
  const rapidRequests = [
    { query: 'search-a', name: 'Request A' },
    { query: 'search-b', name: 'Request B' },  
    { query: 'search-c', name: 'Request C' }
  ];
  
  raceHandler.handleLatestOnly(rapidRequests);
}, 1200);

/**
 * SUMMARY OF PERFORMANCE OPTIMIZATION TECHNIQUES:
 * 
 * 1. Non-Blocking Processing:
 *    - Time-based chunking prevents UI freezing
 *    - Count-based chunking provides predictable progress
 *    - Priority-aware yielding optimizes resource usage
 * 
 * 2. Race Condition Prevention:
 *    - Sequential processing ensures correct order
 *    - Request cancellation prevents stale updates
 *    - Latest-only pattern handles rapid requests
 * 
 * 3. Performance Monitoring:
 *    - Track processing time and throughput
 *    - Monitor event loop responsiveness
 *    - Implement graceful cancellation
 * 
 * Key Performance Principles:
 * - Never block the event loop with long synchronous operations
 * - Yield control regularly to allow other tasks to run
 * - Cancel outdated operations to prevent wasted work
 * - Monitor and measure performance impact
 * 
 * Interview Focus:
 * - Explain why blocking is problematic
 * - Demonstrate yielding techniques
 * - Show race condition awareness
 * - Discuss performance trade-offs
 */

console.log('\nPerformance optimization patterns ready!');
console.log('Next: See interview-problems.js for common event loop interview questions');