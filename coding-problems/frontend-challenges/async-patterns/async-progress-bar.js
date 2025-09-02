/**
 * File: async-progress-bar.js
 * Description: Async progress tracking system for monitoring multiple concurrent operations
 * 
 * Learning objectives:
 * - Track progress across multiple async operations
 * - Implement weighted progress calculations
 * - Handle errors and provide detailed status updates
 * - Build reusable progress monitoring utilities
 * 
 * Time Complexity: O(1) for progress updates
 * Space Complexity: O(n) where n is number of tracked operations
 */

// =======================
// Approach 1: Basic Progress Tracker
// =======================

/**
 * Basic progress tracker for multiple async operations
 * Tracks completion percentage and provides status updates
 * 
 * Mental model: Think of it like a download manager that shows
 * progress for multiple files being downloaded simultaneously
 */
class BasicProgressTracker {
  constructor() {
    this.operations = new Map(); // operationId -> operation info
    this.listeners = new Set(); // Progress change listeners
    this.totalOperations = 0;
    this.completedOperations = 0;
  }

  // Add a new operation to track
  addOperation(id, description = '', estimatedDuration = 1000) {
    if (this.operations.has(id)) {
      throw new Error(`Operation ${id} already exists`);
    }

    const operation = {
      id,
      description,
      status: 'pending', // pending, running, completed, failed
      progress: 0, // 0-100
      estimatedDuration,
      startTime: null,
      endTime: null,
      error: null,
      result: null
    };

    this.operations.set(id, operation);
    this.totalOperations++;
    this._notifyListeners();
    
    return operation;
  }

  // Update progress for a specific operation
  updateProgress(id, progress, status = 'running') {
    const operation = this.operations.get(id);
    if (!operation) {
      throw new Error(`Operation ${id} not found`);
    }

    // Start timing if this is the first progress update
    if (!operation.startTime && status === 'running') {
      operation.startTime = Date.now();
    }

    // Clamp progress between 0 and 100
    operation.progress = Math.max(0, Math.min(100, progress));
    operation.status = status;

    // Mark as completed if progress is 100% or status is completed
    if ((progress >= 100 || status === 'completed') && operation.status !== 'completed') {
      this._completeOperation(id);
    }

    this._notifyListeners();
  }

  // Mark operation as completed with result
  completeOperation(id, result = null) {
    this._completeOperation(id, result, 'completed');
  }

  // Mark operation as failed with error
  failOperation(id, error) {
    const operation = this.operations.get(id);
    if (!operation) {
      throw new Error(`Operation ${id} not found`);
    }

    operation.status = 'failed';
    operation.error = error;
    operation.endTime = Date.now();

    // Count as completed for overall progress calculation
    if (operation.status !== 'completed' && operation.status !== 'failed') {
      this.completedOperations++;
    }

    this._notifyListeners();
  }

  // Internal method to complete an operation
  _completeOperation(id, result = null, status = 'completed') {
    const operation = this.operations.get(id);
    if (!operation) return;

    if (operation.status !== 'completed' && operation.status !== 'failed') {
      this.completedOperations++;
    }

    operation.status = status;
    operation.progress = 100;
    operation.result = result;
    operation.endTime = Date.now();

    this._notifyListeners();
  }

  // Get overall progress (0-100)
  getOverallProgress() {
    if (this.totalOperations === 0) return 0;
    
    // Calculate based on individual operation progress
    let totalProgress = 0;
    for (const operation of this.operations.values()) {
      totalProgress += operation.progress;
    }
    
    return Math.round(totalProgress / this.totalOperations);
  }

  // Get completion percentage (completed operations / total operations)
  getCompletionPercentage() {
    if (this.totalOperations === 0) return 0;
    return Math.round((this.completedOperations / this.totalOperations) * 100);
  }

  // Get detailed status of all operations
  getStatus() {
    const operations = Array.from(this.operations.values());
    const running = operations.filter(op => op.status === 'running');
    const completed = operations.filter(op => op.status === 'completed');
    const failed = operations.filter(op => op.status === 'failed');
    const pending = operations.filter(op => op.status === 'pending');

    return {
      totalOperations: this.totalOperations,
      pending: pending.length,
      running: running.length,
      completed: completed.length,
      failed: failed.length,
      overallProgress: this.getOverallProgress(),
      completionPercentage: this.getCompletionPercentage(),
      operations: operations,
      isComplete: this.totalOperations > 0 && this.completedOperations === this.totalOperations,
      hasErrors: failed.length > 0
    };
  }

  // Add progress change listener
  onProgress(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of progress changes
  _notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in progress listener:', error);
      }
    });
  }

  // Clear all operations and reset
  reset() {
    this.operations.clear();
    this.totalOperations = 0;
    this.completedOperations = 0;
    this._notifyListeners();
  }
}

// =======================
// Approach 2: Weighted Progress Tracker
// =======================

/**
 * Enhanced progress tracker with weighted operations
 * Different operations can have different weights based on complexity/time
 */
class WeightedProgressTracker extends BasicProgressTracker {
  constructor() {
    super();
    this.totalWeight = 0;
    this.completedWeight = 0;
  }

  // Add operation with weight (default weight = 1)
  addOperation(id, description = '', estimatedDuration = 1000, weight = 1) {
    const operation = super.addOperation(id, description, estimatedDuration);
    operation.weight = weight;
    this.totalWeight += weight;
    return operation;
  }

  // Override completion to handle weights
  _completeOperation(id, result = null, status = 'completed') {
    const operation = this.operations.get(id);
    if (!operation) return;

    const wasCompleted = operation.status === 'completed' || operation.status === 'failed';
    super._completeOperation(id, result, status);

    // Update weighted completion tracking
    if (!wasCompleted) {
      this.completedWeight += operation.weight;
    }
  }

  // Calculate weighted overall progress
  getOverallProgress() {
    if (this.totalWeight === 0) return 0;
    
    let weightedProgress = 0;
    for (const operation of this.operations.values()) {
      weightedProgress += (operation.progress / 100) * operation.weight;
    }
    
    return Math.round((weightedProgress / this.totalWeight) * 100);
  }

  // Get weighted completion percentage
  getWeightedCompletionPercentage() {
    if (this.totalWeight === 0) return 0;
    return Math.round((this.completedWeight / this.totalWeight) * 100);
  }

  // Enhanced status with weight information
  getStatus() {
    const baseStatus = super.getStatus();
    return {
      ...baseStatus,
      totalWeight: this.totalWeight,
      completedWeight: this.completedWeight,
      weightedProgress: this.getOverallProgress(),
      weightedCompletion: this.getWeightedCompletionPercentage()
    };
  }

  // Reset with weight tracking
  reset() {
    super.reset();
    this.totalWeight = 0;
    this.completedWeight = 0;
  }
}

// =======================
// Approach 3: Promise-based Progress Tracker
// =======================

/**
 * Promise-based progress tracker that wraps async operations
 * Automatically tracks promise resolution/rejection
 */
class PromiseProgressTracker extends WeightedProgressTracker {
  constructor() {
    super();
    this.promiseMap = new Map(); // operationId -> Promise
  }

  // Track a promise and return a wrapped promise
  trackPromise(id, promiseOrFn, options = {}) {
    const {
      description = '',
      weight = 1,
      onProgress = null, // Function to report progress during execution
      estimatedDuration = 1000
    } = options;

    // Add operation to tracker
    this.addOperation(id, description, estimatedDuration, weight);

    // Convert function to promise if needed
    const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;

    // Create wrapper promise that tracks progress
    const trackedPromise = new Promise(async (resolve, reject) => {
      try {
        // Mark as running
        this.updateProgress(id, 0, 'running');

        // If onProgress is provided, set up progress reporting
        let progressInterval;
        if (onProgress) {
          let currentProgress = 0;
          progressInterval = setInterval(() => {
            try {
              const progress = onProgress();
              if (typeof progress === 'number' && progress !== currentProgress) {
                currentProgress = Math.max(0, Math.min(100, progress));
                this.updateProgress(id, currentProgress, 'running');
              }
            } catch (error) {
              // Ignore progress reporting errors
            }
          }, 100);
        }

        // Await the original promise
        const result = await promise;

        // Clear progress interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        // Mark as completed
        this.completeOperation(id, result);
        resolve(result);

      } catch (error) {
        // Clear progress interval
        if (progressInterval) {
          clearInterval(progressInterval);
        }

        // Mark as failed
        this.failOperation(id, error);
        reject(error);
      }
    });

    // Store the tracked promise
    this.promiseMap.set(id, trackedPromise);

    return trackedPromise;
  }

  // Track multiple promises concurrently
  trackAll(promiseConfigs) {
    const trackedPromises = promiseConfigs.map(config => {
      const { id, promise, ...options } = config;
      return this.trackPromise(id, promise, options);
    });

    // Return promise that resolves when all are complete
    return Promise.all(trackedPromises);
  }

  // Track promises sequentially (one after another)
  async trackSequential(promiseConfigs) {
    const results = [];
    
    for (const config of promiseConfigs) {
      const { id, promise, ...options } = config;
      try {
        const result = await this.trackPromise(id, promise, options);
        results.push(result);
      } catch (error) {
        // Continue with other promises even if one fails
        results.push(error);
      }
    }

    return results;
  }

  // Cancel a tracked promise (if it supports AbortSignal)
  cancelOperation(id) {
    const operation = this.operations.get(id);
    const promise = this.promiseMap.get(id);

    if (!operation || !promise) {
      throw new Error(`Operation ${id} not found`);
    }

    // Mark as failed with cancellation error
    this.failOperation(id, new Error('Operation cancelled'));

    // Remove from promise map
    this.promiseMap.delete(id);
  }

  // Wait for all tracked operations to complete
  async waitForAll() {
    const promises = Array.from(this.promiseMap.values());
    try {
      return await Promise.allSettled(promises);
    } finally {
      // Clear promise map after completion
      this.promiseMap.clear();
    }
  }

  // Reset with promise tracking
  reset() {
    super.reset();
    this.promiseMap.clear();
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== Async Progress Bar Examples ===\n');

// Example 1: Basic Progress Tracking
async function example1() {
  console.log('Example 1: Basic Progress Tracking');
  
  const tracker = new BasicProgressTracker();
  
  // Add progress listener
  const unsubscribe = tracker.onProgress((status) => {
    console.log(`Progress: ${status.overallProgress}% (${status.completed}/${status.totalOperations} completed)`);
  });

  // Add operations
  tracker.addOperation('task1', 'Download file 1', 2000);
  tracker.addOperation('task2', 'Process data', 1500);
  tracker.addOperation('task3', 'Upload results', 1000);

  // Simulate progress updates
  const simulateTask = async (id, totalSteps) => {
    for (let step = 0; step <= totalSteps; step++) {
      const progress = (step / totalSteps) * 100;
      tracker.updateProgress(id, progress);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  // Run tasks concurrently
  await Promise.all([
    simulateTask('task1', 10),
    simulateTask('task2', 7),
    simulateTask('task3', 5)
  ]);

  unsubscribe();
  console.log('Final status:', tracker.getStatus().overallProgress + '%\n');
}

// Example 2: Weighted Progress Tracking
async function example2() {
  console.log('Example 2: Weighted Progress Tracking');
  
  const tracker = new WeightedProgressTracker();
  
  tracker.onProgress((status) => {
    console.log(`Weighted progress: ${status.weightedProgress}% (weight: ${status.completedWeight}/${status.totalWeight})`);
  });

  // Add operations with different weights
  tracker.addOperation('heavy_task', 'Complex computation', 5000, 5); // Heavy task
  tracker.addOperation('light_task1', 'Simple validation', 500, 1); // Light task
  tracker.addOperation('light_task2', 'Quick check', 300, 1); // Light task

  // Simulate weighted tasks
  const simulateWeightedTask = async (id, steps, delay) => {
    for (let i = 0; i <= steps; i++) {
      tracker.updateProgress(id, (i / steps) * 100);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  // Run tasks
  await Promise.all([
    simulateWeightedTask('heavy_task', 15, 200), // Slower, but higher weight
    simulateWeightedTask('light_task1', 3, 100),  // Faster, lower weight
    simulateWeightedTask('light_task2', 2, 150)   // Faster, lower weight
  ]);

  console.log();
}

// Example 3: Promise-based Progress Tracking
async function example3() {
  console.log('Example 3: Promise-based Progress Tracking');
  
  const tracker = new PromiseProgressTracker();
  
  tracker.onProgress((status) => {
    const activeOps = status.operations.filter(op => op.status === 'running');
    if (activeOps.length > 0) {
      console.log(`Overall: ${status.overallProgress}% | Active: ${activeOps.map(op => `${op.id}:${op.progress}%`).join(', ')}`);
    }
  });

  // Create mock async operations
  const createAsyncTask = (name, duration, progressCallback = null) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progressCallback) {
          progressCallback(progress);
        }
        if (progress >= 100) {
          clearInterval(interval);
          resolve(`${name} completed`);
        }
      }, duration / 10);
    });
  };

  // Track promises with automatic progress
  const promises = [
    {
      id: 'api_call_1',
      description: 'Fetch user data',
      weight: 2,
      promise: createAsyncTask('API Call 1', 1000, (p) => tracker.updateProgress('api_call_1', p))
    },
    {
      id: 'api_call_2', 
      description: 'Fetch posts data',
      weight: 3,
      promise: createAsyncTask('API Call 2', 1500, (p) => tracker.updateProgress('api_call_2', p))
    },
    {
      id: 'processing',
      description: 'Process data',
      weight: 1,
      promise: createAsyncTask('Processing', 800, (p) => tracker.updateProgress('processing', p))
    }
  ];

  // Track all promises
  const results = await tracker.trackAll(promises);
  console.log('All operations completed:', results.length, 'results\n');
}

// Run examples
example1()
  .then(() => example2())
  .then(() => example3())
  .catch(console.error);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: File Upload with Progress
 * Track multiple file uploads with chunk-based progress
 */
class FileUploadProgressTracker {
  constructor() {
    this.tracker = new PromiseProgressTracker();
  }

  async uploadFiles(files) {
    const uploadConfigs = files.map((file, index) => ({
      id: `file_${index}`,
      description: `Uploading ${file.name}`,
      weight: Math.ceil(file.size / (1024 * 1024)), // Weight based on file size in MB
      promise: this.uploadFile(file, `file_${index}`)
    }));

    // Add overall progress listener
    this.tracker.onProgress((status) => {
      console.log(`Upload Progress: ${status.weightedProgress}% | ${status.completed}/${status.totalOperations} files`);
      
      // Show individual file progress
      status.operations.forEach(op => {
        if (op.status === 'running') {
          console.log(`  ${op.description}: ${op.progress}%`);
        }
      });
    });

    return await this.tracker.trackAll(uploadConfigs);
  }

  async uploadFile(file, trackerId) {
    const chunkSize = 64 * 1024; // 64KB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    // Simulate chunked upload
    for (let i = 0; i < totalChunks; i++) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      uploadedChunks++;
      const progress = (uploadedChunks / totalChunks) * 100;
      this.tracker.updateProgress(trackerId, progress);
    }

    return { filename: file.name, size: file.size };
  }
}

/**
 * Use Case 2: Database Migration Progress
 * Track progress of multiple database migration scripts
 */
class MigrationProgressTracker {
  constructor() {
    this.tracker = new WeightedProgressTracker();
  }

  async runMigrations(migrations) {
    // Add all migrations to tracker
    migrations.forEach((migration, index) => {
      this.tracker.addOperation(
        migration.id,
        migration.description,
        migration.estimatedTime,
        migration.complexity || 1
      );
    });

    // Progress listener
    this.tracker.onProgress((status) => {
      console.log(`Migration Progress: ${status.weightedProgress}%`);
      console.log(`Status: ${status.running} running, ${status.completed} completed, ${status.failed} failed`);
    });

    // Run migrations sequentially (order matters for DB migrations)
    for (const migration of migrations) {
      try {
        console.log(`Starting migration: ${migration.description}`);
        this.tracker.updateProgress(migration.id, 0, 'running');
        
        const result = await this.executeMigration(migration);
        this.tracker.completeOperation(migration.id, result);
        
        console.log(`✓ Completed: ${migration.description}`);
      } catch (error) {
        console.log(`✗ Failed: ${migration.description} - ${error.message}`);
        this.tracker.failOperation(migration.id, error);
        
        // Optionally stop on first failure
        if (migration.critical) {
          throw new Error(`Critical migration failed: ${migration.description}`);
        }
      }
    }

    return this.tracker.getStatus();
  }

  async executeMigration(migration) {
    // Simulate migration execution with progress updates
    const steps = 10;
    for (let step = 0; step <= steps; step++) {
      await new Promise(resolve => setTimeout(resolve, migration.estimatedTime / steps));
      this.tracker.updateProgress(migration.id, (step / steps) * 100);
    }
    
    // Simulate occasional failures
    if (Math.random() < 0.1) { // 10% failure rate
      throw new Error('Database connection lost');
    }

    return { migrationId: migration.id, recordsAffected: Math.floor(Math.random() * 1000) };
  }
}

/**
 * Use Case 3: Multi-step Deployment Progress
 * Track complex deployment process with dependencies
 */
class DeploymentProgressTracker {
  constructor() {
    this.tracker = new PromiseProgressTracker();
    this.steps = new Map();
  }

  async deploy(deploymentPlan) {
    console.log('Starting deployment...');
    
    // Add all steps to tracker
    deploymentPlan.steps.forEach(step => {
      this.tracker.addOperation(step.id, step.description, step.estimatedTime, step.weight || 1);
    });

    // Progress monitoring
    this.tracker.onProgress((status) => {
      console.log(`🚀 Deployment: ${status.weightedProgress}%`);
      
      // Show current phase
      const running = status.operations.filter(op => op.status === 'running');
      if (running.length > 0) {
        console.log(`   Current: ${running.map(op => op.description).join(', ')}`);
      }
    });

    // Execute deployment steps with dependency management
    const results = await this.executeDeploymentSteps(deploymentPlan.steps);
    
    const finalStatus = this.tracker.getStatus();
    console.log(`Deployment ${finalStatus.hasErrors ? 'completed with errors' : 'successful'}!`);
    
    return results;
  }

  async executeDeploymentSteps(steps) {
    const executed = new Set();
    const results = new Map();

    // Helper to check if all dependencies are satisfied
    const canExecute = (step) => {
      if (!step.dependencies) return true;
      return step.dependencies.every(dep => executed.has(dep));
    };

    // Execute steps in dependency order
    while (executed.size < steps.length) {
      const readySteps = steps.filter(step => 
        !executed.has(step.id) && canExecute(step)
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency or unresolved dependencies detected');
      }

      // Execute ready steps in parallel
      const promises = readySteps.map(step => this.executeStep(step));
      const stepResults = await Promise.allSettled(promises);

      // Process results
      readySteps.forEach((step, index) => {
        executed.add(step.id);
        const result = stepResults[index];
        
        if (result.status === 'fulfilled') {
          results.set(step.id, result.value);
          this.tracker.completeOperation(step.id, result.value);
        } else {
          results.set(step.id, result.reason);
          this.tracker.failOperation(step.id, result.reason);
        }
      });
    }

    return results;
  }

  async executeStep(step) {
    console.log(`Executing: ${step.description}`);
    
    // Simulate step execution with progress
    const updateInterval = setInterval(() => {
      const operation = this.tracker.operations.get(step.id);
      if (operation && operation.progress < 90) {
        this.tracker.updateProgress(step.id, operation.progress + 10);
      }
    }, step.estimatedTime / 10);

    try {
      // Simulate the actual work
      await new Promise(resolve => setTimeout(resolve, step.estimatedTime));
      
      // Simulate occasional failures
      if (step.canFail && Math.random() < 0.15) {
        throw new Error(`Step ${step.id} failed`);
      }

      clearInterval(updateInterval);
      return { stepId: step.id, success: true, timestamp: Date.now() };
      
    } catch (error) {
      clearInterval(updateInterval);
      throw error;
    }
  }
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===\n');

  // File Upload Example
  console.log('Testing File Upload Progress:');
  const fileUploader = new FileUploadProgressTracker();
  const mockFiles = [
    { name: 'document.pdf', size: 2 * 1024 * 1024 }, // 2MB
    { name: 'image.jpg', size: 1024 * 1024 },        // 1MB
    { name: 'video.mp4', size: 10 * 1024 * 1024 }    // 10MB
  ];

  try {
    await fileUploader.uploadFiles(mockFiles);
    console.log('All files uploaded successfully!\n');
  } catch (error) {
    console.log('File upload failed:', error.message, '\n');
  }

  // Database Migration Example
  console.log('Testing Database Migration Progress:');
  const migrationTracker = new MigrationProgressTracker();
  const migrations = [
    { id: 'mig_001', description: 'Create users table', estimatedTime: 500, complexity: 2, critical: true },
    { id: 'mig_002', description: 'Add indexes', estimatedTime: 300, complexity: 1 },
    { id: 'mig_003', description: 'Populate data', estimatedTime: 800, complexity: 3 }
  ];

  try {
    await migrationTracker.runMigrations(migrations);
    console.log('All migrations completed!\n');
  } catch (error) {
    console.log('Migration failed:', error.message, '\n');
  }

  // Deployment Example
  console.log('Testing Deployment Progress:');
  const deploymentTracker = new DeploymentProgressTracker();
  const deploymentPlan = {
    steps: [
      { id: 'build', description: 'Build application', estimatedTime: 1000, weight: 3 },
      { id: 'test', description: 'Run tests', estimatedTime: 800, weight: 2, dependencies: ['build'] },
      { id: 'deploy_staging', description: 'Deploy to staging', estimatedTime: 600, weight: 2, dependencies: ['test'] },
      { id: 'smoke_test', description: 'Smoke tests', estimatedTime: 400, weight: 1, dependencies: ['deploy_staging'], canFail: true },
      { id: 'deploy_prod', description: 'Deploy to production', estimatedTime: 800, weight: 3, dependencies: ['smoke_test'] }
    ]
  };

  try {
    await deploymentTracker.deploy(deploymentPlan);
    console.log('Deployment completed!\n');
  } catch (error) {
    console.log('Deployment failed:', error.message, '\n');
  }
}, 3000);

// Export all implementations
module.exports = {
  BasicProgressTracker,
  WeightedProgressTracker, 
  PromiseProgressTracker,
  FileUploadProgressTracker,
  MigrationProgressTracker,
  DeploymentProgressTracker
};

/**
 * Key Interview Points:
 * 
 * 1. Progress Tracking Patterns:
 *    - Event-driven updates with listener pattern
 *    - Weighted progress calculation for different task complexities
 *    - Promise wrapping for automatic progress tracking
 *    - Status aggregation across multiple concurrent operations
 * 
 * 2. Real-world Considerations:
 *    - Error handling and partial failures
 *    - Cancellation support for long-running operations
 *    - Dependency management for ordered operations
 *    - Memory efficiency for large numbers of operations
 * 
 * 3. Implementation Challenges:
 *    - Thread-safe progress updates in concurrent scenarios
 *    - Accurate progress estimation for unknown durations
 *    - UI responsiveness during intensive operations
 *    - Progress persistence across page reloads/crashes
 * 
 * 4. Performance Optimization:
 *    - Debounced progress notifications to avoid UI spam
 *    - Efficient data structures for O(1) lookups
 *    - Lazy evaluation for expensive status calculations
 *    - Memory cleanup for completed operations
 * 
 * 5. Use Cases:
 *    - File uploads/downloads with chunked progress
 *    - Database migrations with step-by-step tracking
 *    - Complex deployments with dependency chains
 *    - Batch processing operations
 *    - Multi-step form wizards
 */