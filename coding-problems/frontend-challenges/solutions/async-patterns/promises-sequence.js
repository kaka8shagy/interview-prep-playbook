/**
 * File: promises-sequence.js
 * Description: Sequential promise execution with error handling and result collection
 * 
 * Learning objectives:
 * - Execute async tasks sequentially vs parallelly
 * - Handle both resolved values and errors in sequence
 * - Understand different approaches: iterative, recursive, async/await
 * 
 * Time Complexity: O(n) where n is number of tasks
 * Space Complexity: O(n) for storing results
 */

// =======================
// Approach 1: Iterative with async/await
// =======================

/**
 * Execute promises sequentially using async/await
 * This is the most readable and modern approach
 * 
 * Mental model: Like processing tasks one by one in a queue
 * Each task waits for the previous one to complete
 */
async function executeSequentiallyIterative(tasks, callback) {
  const results = [];
  const errors = [];
  
  // Process each task one by one
  for (let i = 0; i < tasks.length; i++) {
    try {
      // Wait for current task to complete before moving to next
      // This is the key difference from Promise.all() which runs in parallel
      const result = await tasks[i]();
      results.push(result);
    } catch (error) {
      // Collect errors but continue processing remaining tasks
      errors.push(error);
    }
  }
  
  // Execute callback with collected results and errors
  callback(results, errors);
}

// =======================
// Approach 2: Recursive Promise Chaining
// =======================

/**
 * Execute promises sequentially using recursive promise chaining
 * This approach uses .then() chains and recursion
 */
function executeSequentiallyRecursive(tasks, callback) {
  const results = [];
  const errors = [];
  
  // Helper function to process tasks recursively
  function processTask(index = 0) {
    // Base case: all tasks processed
    if (index >= tasks.length) {
      callback(results, errors);
      return;
    }
    
    // Execute current task and handle its result
    tasks[index]()
      .then((result) => {
        // Task succeeded - store result
        results.push(result);
      })
      .catch((error) => {
        // Task failed - store error
        errors.push(error);
      })
      .finally(() => {
        // Always move to next task regardless of success/failure
        // This ensures sequential execution continues
        processTask(index + 1);
      });
  }
  
  // Start processing from first task
  processTask();
}

// =======================
// Approach 3: Promise.reduce Pattern
// =======================

/**
 * Use Array.reduce to create a sequential promise chain
 * This is a functional programming approach
 */
function executeSequentiallyReduce(tasks, callback) {
  const results = [];
  const errors = [];
  
  // Use reduce to create a chain of sequential promises
  // Each iteration waits for the previous promise to complete
  tasks.reduce((promiseChain, currentTask, index) => {
    return promiseChain.then(async () => {
      try {
        const result = await currentTask();
        results.push(result);
      } catch (error) {
        errors.push(error);
      }
    });
  }, Promise.resolve()) // Start with resolved promise
    .then(() => {
      callback(results, errors);
    });
}

// =======================
// Approach 4: Advanced with Progress Tracking
// =======================

/**
 * Enhanced sequential execution with progress tracking
 * Useful for long-running operations where user needs feedback
 */
async function executeWithProgress(tasks, options = {}) {
  const {
    onProgress = () => {},
    onTaskComplete = () => {},
    onTaskError = () => {},
    stopOnError = false
  } = options;
  
  const results = [];
  const errors = [];
  const totalTasks = tasks.length;
  
  for (let i = 0; i < tasks.length; i++) {
    try {
      // Notify progress before starting task
      onProgress({
        currentTask: i + 1,
        totalTasks,
        percentage: Math.round((i / totalTasks) * 100),
        phase: 'executing'
      });
      
      const result = await tasks[i]();
      results.push(result);
      
      // Notify task completion
      onTaskComplete({
        taskIndex: i,
        result,
        completedTasks: results.length
      });
      
    } catch (error) {
      errors.push(error);
      
      // Notify task error
      onTaskError({
        taskIndex: i,
        error,
        totalErrors: errors.length
      });
      
      // Optionally stop execution on first error
      if (stopOnError) {
        break;
      }
    }
    
    // Final progress update
    onProgress({
      currentTask: Math.min(i + 2, totalTasks),
      totalTasks,
      percentage: Math.round(((i + 1) / totalTasks) * 100),
      phase: i === tasks.length - 1 ? 'completed' : 'executing'
    });
  }
  
  return { results, errors };
}

// =======================
// Task Creation Utilities
// =======================

/**
 * Create async tasks for testing
 * These simulate real-world async operations with random success/failure
 */
function createAsyncTask(name, delay = null, shouldFail = null) {
  return () => {
    const actualDelay = delay || Math.floor(Math.random() * 1000) + 500;
    const willFail = shouldFail !== null ? shouldFail : Math.random() < 0.3; // 30% failure rate
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (willFail) {
          reject(new Error(`Task ${name} failed`));
        } else {
          resolve(`Task ${name} completed successfully`);
        }
      }, actualDelay);
    });
  };
}

/**
 * Create a batch of test tasks
 */
function createTaskBatch(count = 5) {
  const tasks = [];
  for (let i = 1; i <= count; i++) {
    tasks.push(createAsyncTask(i));
  }
  return tasks;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== Sequential Promise Execution Examples ===\n');

// Example 1: Basic sequential execution with mixed success/failure
async function example1() {
  console.log('Example 1: Basic Sequential Execution');
  
  const tasks = [
    createAsyncTask('A', 500, false), // Will succeed
    createAsyncTask('B', 300, true),  // Will fail
    createAsyncTask('C', 200, false), // Will succeed
    createAsyncTask('D', 400, true),  // Will fail
    createAsyncTask('E', 100, false)  // Will succeed
  ];
  
  console.log('Starting tasks sequentially...');
  
  await executeSequentiallyIterative(tasks, (results, errors) => {
    console.log('\nResults:', results);
    console.log('Errors:', errors.map(e => e.message));
    console.log(`Completed: ${results.length} success, ${errors.length} errors\n`);
  });
}

// Example 2: Progress tracking
async function example2() {
  console.log('Example 2: Sequential Execution with Progress Tracking');
  
  const tasks = createTaskBatch(4);
  
  const result = await executeWithProgress(tasks, {
    onProgress: (progress) => {
      console.log(`Progress: ${progress.percentage}% (${progress.currentTask}/${progress.totalTasks}) - ${progress.phase}`);
    },
    onTaskComplete: (info) => {
      console.log(`✓ Task ${info.taskIndex + 1} completed`);
    },
    onTaskError: (info) => {
      console.log(`✗ Task ${info.taskIndex + 1} failed: ${info.error.message}`);
    }
  });
  
  console.log('\nFinal Results:');
  console.log(`Success: ${result.results.length}, Errors: ${result.errors.length}\n`);
}

// Example 3: Comparison with parallel execution
async function example3() {
  console.log('Example 3: Sequential vs Parallel Execution Timing');
  
  const tasks = [
    () => new Promise(resolve => setTimeout(() => resolve('Task 1'), 1000)),
    () => new Promise(resolve => setTimeout(() => resolve('Task 2'), 800)),
    () => new Promise(resolve => setTimeout(() => resolve('Task 3'), 600))
  ];
  
  // Sequential execution
  console.log('Sequential execution starting...');
  const sequentialStart = Date.now();
  await executeSequentiallyIterative(tasks, (results) => {
    const sequentialEnd = Date.now();
    console.log(`Sequential completed in ${sequentialEnd - sequentialStart}ms`);
    console.log('Results:', results);
  });
  
  // Parallel execution for comparison
  console.log('\nParallel execution starting...');
  const parallelStart = Date.now();
  const parallelResults = await Promise.all(tasks.map(task => task()));
  const parallelEnd = Date.now();
  console.log(`Parallel completed in ${parallelEnd - parallelStart}ms`);
  console.log('Results:', parallelResults);
  console.log();
}

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: API Rate Limiting
 * When you need to call multiple APIs but respect rate limits
 */
class APIClient {
  constructor(baseURL, rateLimitMs = 1000) {
    this.baseURL = baseURL;
    this.rateLimitMs = rateLimitMs;
    this.lastRequestTime = 0;
  }
  
  async makeRequest(endpoint) {
    // Ensure rate limiting between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Data from ${endpoint}`);
      }, Math.random() * 200 + 100);
    });
  }
  
  async fetchMultipleEndpoints(endpoints) {
    const tasks = endpoints.map(endpoint => () => this.makeRequest(endpoint));
    
    return new Promise((resolve) => {
      executeSequentiallyIterative(tasks, (results, errors) => {
        resolve({ results, errors });
      });
    });
  }
}

/**
 * Use Case 2: Database Migration with Dependencies
 * When database migrations must run in specific order
 */
class DatabaseMigrator {
  constructor() {
    this.appliedMigrations = new Set();
  }
  
  async runMigration(migrationName, migrationFn) {
    console.log(`Running migration: ${migrationName}`);
    
    try {
      await migrationFn();
      this.appliedMigrations.add(migrationName);
      console.log(`✓ Migration ${migrationName} completed`);
      return `Migration ${migrationName} applied successfully`;
    } catch (error) {
      console.log(`✗ Migration ${migrationName} failed: ${error.message}`);
      throw error;
    }
  }
  
  async runMigrations(migrations) {
    const tasks = migrations.map(({ name, fn }) => 
      () => this.runMigration(name, fn)
    );
    
    const { results, errors } = await executeWithProgress(tasks, {
      stopOnError: true, // Stop on first migration failure
      onProgress: (progress) => {
        console.log(`Migration progress: ${progress.percentage}%`);
      }
    });
    
    return { results, errors, appliedCount: this.appliedMigrations.size };
  }
}

/**
 * Use Case 3: File Processing Pipeline
 * When files must be processed in sequence (e.g., video processing)
 */
class FileProcessor {
  async processFile(filename, operations) {
    console.log(`Processing ${filename}...`);
    
    const tasks = operations.map(operation => 
      () => this.runOperation(filename, operation)
    );
    
    return executeWithProgress(tasks, {
      onProgress: (progress) => {
        console.log(`${filename}: ${progress.percentage}% complete`);
      }
    });
  }
  
  async runOperation(filename, operation) {
    // Simulate file operation (resize, compress, convert, etc.)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    return `${operation} completed on ${filename}`;
  }
}

// Run examples
async function runExamples() {
  await example1();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
  
  await example2();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await example3();
  
  // Real-world examples
  console.log('=== Real-world Use Cases ===\n');
  
  // API rate limiting example
  const apiClient = new APIClient('https://api.example.com');
  const endpoints = ['users', 'posts', 'comments', 'analytics'];
  console.log('Testing API rate limiting...');
  const apiResults = await apiClient.fetchMultipleEndpoints(endpoints);
  console.log(`API calls completed: ${apiResults.results.length} success, ${apiResults.errors.length} errors\n`);
  
  // Database migration example
  const migrator = new DatabaseMigrator();
  const migrations = [
    { name: '001_create_users', fn: async () => { await new Promise(r => setTimeout(r, 300)); } },
    { name: '002_add_posts', fn: async () => { await new Promise(r => setTimeout(r, 200)); } },
    { name: '003_add_indexes', fn: async () => { await new Promise(r => setTimeout(r, 400)); } }
  ];
  
  console.log('Running database migrations...');
  const migrationResult = await migrator.runMigrations(migrations);
  console.log(`Migrations: ${migrationResult.appliedCount} applied\n`);
}

// Execute examples if this file is run directly
if (require.main === module) {
  runExamples().catch(console.error);
}

// Export all implementations
module.exports = {
  executeSequentiallyIterative,
  executeSequentiallyRecursive,
  executeSequentiallyReduce,
  executeWithProgress,
  createAsyncTask,
  createTaskBatch,
  APIClient,
  DatabaseMigrator,
  FileProcessor
};

/**
 * Key Interview Points:
 * 
 * 1. Sequential vs Parallel Execution:
 *    - Sequential: Tasks wait for previous to complete (slower but controlled)
 *    - Parallel: All tasks start simultaneously (faster but resource intensive)
 *    - Choose based on requirements (rate limiting, dependencies, resources)
 * 
 * 2. Error Handling Strategies:
 *    - Continue on error: Collect errors but process remaining tasks
 *    - Stop on error: Halt execution on first failure
 *    - Retry logic: Attempt failed tasks again with backoff
 * 
 * 3. Implementation Approaches:
 *    - async/await: Most readable and modern
 *    - Promise chaining: Traditional but still valid
 *    - Array.reduce: Functional programming approach
 * 
 * 4. Real-world Applications:
 *    - API rate limiting compliance
 *    - Database migrations with dependencies  
 *    - File processing pipelines
 *    - Batch job processing
 * 
 * 5. Performance Considerations:
 *    - Sequential is slower but uses less memory/resources
 *    - Good for rate-limited APIs or dependent operations
 *    - Progress tracking helps with user experience
 */