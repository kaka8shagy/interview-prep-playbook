/**
 * File: throttle-tasks.js
 * Description: Advanced task throttling implementation with queue management,
 *              priority handling, and resource optimization
 * 
 * Learning objectives:
 * - Understand task scheduling and queue management algorithms
 * - Learn concurrency control and resource throttling techniques
 * - Implement priority queues and rate limiting strategies
 * - Practice async coordination and error handling patterns
 * - Handle backpressure and resource exhaustion scenarios
 * 
 * Real-world applications:
 * - API rate limiting and request throttling
 * - Database connection pooling and query queuing
 * - File processing pipelines with resource constraints
 * - Background job processing systems
 * - Resource-intensive computation scheduling
 * - Network request management in browsers
 * 
 * Time Complexity: O(1) for adding tasks, O(log n) for priority queue operations
 * Space Complexity: O(n) where n is the number of queued tasks
 */

// =======================
// Approach 1: Basic Task Throttling
// =======================

/**
 * Basic task throttling implementation with simple queue and concurrency control
 * Executes tasks with a maximum concurrent limit
 */
class BasicTaskThrottler {
  constructor(options = {}) {
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      delay: options.delay ?? 0,
      timeout: options.timeout ?? 30000,
      retries: options.retries ?? 0,
      backoffFactor: options.backoffFactor ?? 2
    };
    
    // Core state
    this.queue = [];
    this.running = 0;
    this.completed = 0;
    this.failed = 0;
    this.isActive = false;
    
    // Event handlers
    this.onTaskComplete = null;
    this.onTaskError = null;
    this.onQueueEmpty = null;
  }
  
  /**
   * Add task to the throttling queue
   * Tasks are executed with concurrency limits and optional delays
   * 
   * @param {Function} task - Async task function to execute
   * @param {Object} options - Task-specific options
   * @returns {Promise} Promise that resolves when task completes
   */
  addTask(task, options = {}) {
    return new Promise((resolve, reject) => {
      const taskWrapper = {
        id: this.generateTaskId(),
        execute: task,
        resolve,
        reject,
        options: {
          ...this.options,
          ...options
        },
        createdAt: Date.now(),
        attempts: 0,
        lastError: null
      };
      
      this.queue.push(taskWrapper);
      
      // Start processing if not already active
      if (!this.isActive) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Add multiple tasks at once
   * Bulk operation for adding arrays of tasks
   * 
   * @param {Array} tasks - Array of task functions
   * @param {Object} commonOptions - Options applied to all tasks
   * @returns {Promise} Promise that resolves when all tasks complete
   */
  addTasks(tasks, commonOptions = {}) {
    const taskPromises = tasks.map(task => this.addTask(task, commonOptions));
    return Promise.allSettled(taskPromises);
  }
  
  /**
   * Process the task queue with concurrency control
   * Manages task execution and maintains concurrency limits
   */
  async processQueue() {
    this.isActive = true;
    
    while (this.queue.length > 0 || this.running > 0) {
      // Start tasks up to concurrency limit
      while (this.queue.length > 0 && this.running < this.options.maxConcurrent) {
        const task = this.queue.shift();
        this.running++;
        
        // Execute task asynchronously
        this.executeTask(task).finally(() => {
          this.running--;
        });
        
        // Apply delay between task starts if configured
        if (this.options.delay > 0) {
          await this.sleep(this.options.delay);
        }
      }
      
      // Wait a bit before checking queue again
      if (this.running >= this.options.maxConcurrent) {
        await this.sleep(10);
      }
    }
    
    this.isActive = false;
    
    // Notify when queue is empty
    if (this.onQueueEmpty) {
      this.onQueueEmpty({
        completed: this.completed,
        failed: this.failed,
        totalProcessed: this.completed + this.failed
      });
    }
  }
  
  /**
   * Execute individual task with timeout and retry logic
   * Handles task execution, error handling, and retries
   * 
   * @param {Object} taskWrapper - Task wrapper object
   */
  async executeTask(taskWrapper) {
    const { execute, options, resolve, reject } = taskWrapper;
    
    try {
      taskWrapper.attempts++;
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, rejectTimeout) => {
        setTimeout(() => {
          rejectTimeout(new Error(`Task timeout after ${options.timeout}ms`));
        }, options.timeout);
      });
      
      // Race task execution against timeout
      const result = await Promise.race([
        execute(),
        timeoutPromise
      ]);
      
      // Task completed successfully
      this.completed++;
      resolve(result);
      
      if (this.onTaskComplete) {
        this.onTaskComplete({
          taskId: taskWrapper.id,
          result,
          attempts: taskWrapper.attempts,
          duration: Date.now() - taskWrapper.createdAt
        });
      }
      
    } catch (error) {
      taskWrapper.lastError = error;
      
      // Check if we should retry
      if (taskWrapper.attempts < options.retries + 1) {
        // Calculate backoff delay
        const backoffDelay = options.delay * Math.pow(options.backoffFactor, taskWrapper.attempts - 1);
        
        console.log(`Task ${taskWrapper.id} failed, retrying in ${backoffDelay}ms (attempt ${taskWrapper.attempts})`);
        
        // Add task back to queue after delay
        setTimeout(() => {
          this.queue.unshift(taskWrapper); // Add to front for priority
        }, backoffDelay);
        
        return;
      }
      
      // All retries exhausted
      this.failed++;
      reject(error);
      
      if (this.onTaskError) {
        this.onTaskError({
          taskId: taskWrapper.id,
          error,
          attempts: taskWrapper.attempts,
          duration: Date.now() - taskWrapper.createdAt
        });
      }
    }
  }
  
  /**
   * Sleep utility function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generate unique task ID
   * @returns {string} Unique task identifier
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get current throttler status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      running: this.running,
      completed: this.completed,
      failed: this.failed,
      isActive: this.isActive,
      maxConcurrent: this.options.maxConcurrent
    };
  }
  
  /**
   * Clear all queued tasks
   * Cancels pending tasks but doesn't affect running ones
   * 
   * @returns {number} Number of tasks cleared
   */
  clearQueue() {
    const clearedCount = this.queue.length;
    
    // Reject all pending tasks
    this.queue.forEach(task => {
      task.reject(new Error('Task cancelled - queue cleared'));
    });
    
    this.queue = [];
    return clearedCount;
  }
  
  /**
   * Pause task processing
   * Stops new tasks from starting but doesn't affect running tasks
   */
  pause() {
    this.isActive = false;
  }
  
  /**
   * Resume task processing
   * Restarts the queue processing
   */
  resume() {
    if (!this.isActive && (this.queue.length > 0 || this.running > 0)) {
      this.processQueue();
    }
  }
}

// =======================
// Approach 2: Priority Task Throttler
// =======================

/**
 * Enhanced task throttler with priority queuing and advanced scheduling
 * Supports task priorities, categories, and sophisticated queue management
 */
class PriorityTaskThrottler extends BasicTaskThrottler {
  constructor(options = {}) {
    super(options);
    
    // Enhanced options
    this.priorityOptions = {
      ...this.options,
      enablePriorities: options.enablePriorities ?? true,
      maxPriority: options.maxPriority ?? 10,
      schedulingStrategy: options.schedulingStrategy ?? 'priority', // 'priority', 'fifo', 'round-robin'
      categoryLimits: options.categoryLimits ?? {}
    };
    
    // Priority queue implementation using multiple queues
    this.priorityQueues = new Map();
    this.categoryCounters = new Map();
    this.runningTasks = new Map(); // taskId -> task info
    this.taskCategories = new Map(); // taskId -> category
    
    // Initialize priority queues
    for (let i = 0; i <= this.priorityOptions.maxPriority; i++) {
      this.priorityQueues.set(i, []);
    }
    
    // Statistics
    this.stats = {
      tasksByPriority: new Map(),
      tasksByCategory: new Map(),
      averageWaitTime: 0,
      averageExecutionTime: 0,
      throughput: 0,
      lastThroughputUpdate: Date.now()
    };
  }
  
  /**
   * Add task with priority and category support
   * Enhanced version supporting advanced scheduling options
   * 
   * @param {Function} task - Task function to execute
   * @param {Object} options - Enhanced task options
   * @returns {Promise} Task completion promise
   */
  addTask(task, options = {}) {
    const priority = Math.min(Math.max(options.priority ?? 0, 0), this.priorityOptions.maxPriority);
    const category = options.category || 'default';
    
    return new Promise((resolve, reject) => {
      const taskWrapper = {
        id: this.generateTaskId(),
        execute: task,
        resolve,
        reject,
        priority,
        category,
        options: {
          ...this.priorityOptions,
          ...options
        },
        createdAt: Date.now(),
        attempts: 0,
        lastError: null,
        estimatedDuration: options.estimatedDuration || 1000
      };
      
      // Check category limits
      if (this.checkCategoryLimits(category)) {
        reject(new Error(`Category ${category} has reached its limit`));
        return;
      }
      
      // Add to appropriate priority queue
      this.priorityQueues.get(priority).push(taskWrapper);
      
      // Update statistics
      this.updateStats(priority, category);
      
      // Store category mapping
      this.taskCategories.set(taskWrapper.id, category);
      
      // Start processing if not active
      if (!this.isActive) {
        this.processAdvancedQueue();
      }
    });
  }
  
  /**
   * Process queue using priority-based scheduling
   * Advanced queue processing with multiple strategies
   */
  async processAdvancedQueue() {
    this.isActive = true;
    
    while (this.hasQueuedTasks() || this.running > 0) {
      // Start tasks up to concurrency limit
      while (this.hasQueuedTasks() && this.running < this.priorityOptions.maxConcurrent) {
        const task = this.getNextTask();
        
        if (task) {
          this.running++;
          this.runningTasks.set(task.id, {
            ...task,
            startedAt: Date.now()
          });
          
          // Execute task
          this.executeAdvancedTask(task).finally(() => {
            this.running--;
            this.runningTasks.delete(task.id);
            this.taskCategories.delete(task.id);
          });
          
          // Apply scheduling delay
          if (this.priorityOptions.delay > 0) {
            await this.sleep(this.priorityOptions.delay);
          }
        } else {
          break; // No tasks available
        }
      }
      
      // Wait before checking again
      if (this.running >= this.priorityOptions.maxConcurrent) {
        await this.sleep(50);
      }
    }
    
    this.isActive = false;
    this.notifyQueueEmpty();
  }
  
  /**
   * Get next task based on scheduling strategy
   * Implements different scheduling algorithms
   * 
   * @returns {Object|null} Next task to execute or null
   */
  getNextTask() {
    switch (this.priorityOptions.schedulingStrategy) {
      case 'priority':
        return this.getHighestPriorityTask();
      
      case 'fifo':
        return this.getOldestTask();
      
      case 'round-robin':
        return this.getRoundRobinTask();
      
      default:
        return this.getHighestPriorityTask();
    }
  }
  
  /**
   * Get highest priority task
   * Returns task from highest non-empty priority queue
   * 
   * @returns {Object|null} Highest priority task
   */
  getHighestPriorityTask() {
    // Start from highest priority and work down
    for (let priority = this.priorityOptions.maxPriority; priority >= 0; priority--) {
      const queue = this.priorityQueues.get(priority);
      if (queue && queue.length > 0) {
        return queue.shift();
      }
    }
    return null;
  }
  
  /**
   * Get oldest task regardless of priority
   * FIFO scheduling across all priority levels
   * 
   * @returns {Object|null} Oldest task
   */
  getOldestTask() {
    let oldestTask = null;
    let oldestTime = Infinity;
    let sourceQueue = null;
    
    for (const [priority, queue] of this.priorityQueues) {
      if (queue.length > 0 && queue[0].createdAt < oldestTime) {
        oldestTask = queue[0];
        oldestTime = queue[0].createdAt;
        sourceQueue = queue;
      }
    }
    
    if (oldestTask && sourceQueue) {
      sourceQueue.shift();
    }
    
    return oldestTask;
  }
  
  /**
   * Get task using round-robin scheduling
   * Alternates between priority levels to ensure fairness
   * 
   * @returns {Object|null} Round-robin selected task
   */
  getRoundRobinTask() {
    // Simple round-robin implementation
    // In production, this would be more sophisticated
    const nonEmptyQueues = Array.from(this.priorityQueues.entries())
      .filter(([_, queue]) => queue.length > 0);
    
    if (nonEmptyQueues.length === 0) return null;
    
    // Use current time to determine which queue to pick from
    const selectedIndex = Date.now() % nonEmptyQueues.length;
    const [_, selectedQueue] = nonEmptyQueues[selectedIndex];
    
    return selectedQueue.shift();
  }
  
  /**
   * Check if there are any queued tasks
   * @returns {boolean} True if tasks are queued
   */
  hasQueuedTasks() {
    for (const queue of this.priorityQueues.values()) {
      if (queue.length > 0) return true;
    }
    return false;
  }
  
  /**
   * Check category limits
   * Verifies if adding task would exceed category limits
   * 
   * @param {string} category - Task category
   * @returns {boolean} True if limit would be exceeded
   */
  checkCategoryLimits(category) {
    const limit = this.priorityOptions.categoryLimits[category];
    if (!limit) return false;
    
    const currentCount = this.getCategoryCount(category);
    return currentCount >= limit;
  }
  
  /**
   * Get current count for category
   * Counts queued and running tasks in category
   * 
   * @param {string} category - Category to count
   * @returns {number} Current task count
   */
  getCategoryCount(category) {
    let count = 0;
    
    // Count queued tasks
    for (const queue of this.priorityQueues.values()) {
      count += queue.filter(task => task.category === category).length;
    }
    
    // Count running tasks
    for (const task of this.runningTasks.values()) {
      if (task.category === category) count++;
    }
    
    return count;
  }
  
  /**
   * Execute task with advanced monitoring
   * Enhanced execution with detailed metrics
   * 
   * @param {Object} taskWrapper - Task wrapper
   */
  async executeAdvancedTask(taskWrapper) {
    const startTime = Date.now();
    const waitTime = startTime - taskWrapper.createdAt;
    
    try {
      taskWrapper.attempts++;
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, rejectTimeout) => {
        setTimeout(() => {
          rejectTimeout(new Error(`Task timeout after ${taskWrapper.options.timeout}ms`));
        }, taskWrapper.options.timeout);
      });
      
      // Execute task with timeout
      const result = await Promise.race([
        taskWrapper.execute(),
        timeoutPromise
      ]);
      
      const executionTime = Date.now() - startTime;
      
      // Update performance statistics
      this.updatePerformanceStats(waitTime, executionTime);
      
      this.completed++;
      taskWrapper.resolve(result);
      
      if (this.onTaskComplete) {
        this.onTaskComplete({
          taskId: taskWrapper.id,
          result,
          attempts: taskWrapper.attempts,
          waitTime,
          executionTime,
          priority: taskWrapper.priority,
          category: taskWrapper.category
        });
      }
      
    } catch (error) {
      taskWrapper.lastError = error;
      
      // Retry logic with exponential backoff
      if (taskWrapper.attempts < taskWrapper.options.retries + 1) {
        const backoffDelay = taskWrapper.options.delay * 
          Math.pow(taskWrapper.options.backoffFactor, taskWrapper.attempts - 1);
        
        setTimeout(() => {
          // Re-add to appropriate priority queue
          this.priorityQueues.get(taskWrapper.priority).unshift(taskWrapper);
        }, backoffDelay);
        
        return;
      }
      
      // All retries exhausted
      this.failed++;
      taskWrapper.reject(error);
      
      if (this.onTaskError) {
        this.onTaskError({
          taskId: taskWrapper.id,
          error,
          attempts: taskWrapper.attempts,
          waitTime: Date.now() - startTime,
          priority: taskWrapper.priority,
          category: taskWrapper.category
        });
      }
    }
  }
  
  /**
   * Update statistics for task addition
   * @param {number} priority - Task priority
   * @param {string} category - Task category
   */
  updateStats(priority, category) {
    // Priority statistics
    const priorityCount = this.stats.tasksByPriority.get(priority) || 0;
    this.stats.tasksByPriority.set(priority, priorityCount + 1);
    
    // Category statistics
    const categoryCount = this.stats.tasksByCategory.get(category) || 0;
    this.stats.tasksByCategory.set(category, categoryCount + 1);
  }
  
  /**
   * Update performance statistics
   * @param {number} waitTime - Time task waited in queue
   * @param {number} executionTime - Time task took to execute
   */
  updatePerformanceStats(waitTime, executionTime) {
    // Update average wait time (exponential moving average)
    this.stats.averageWaitTime = this.stats.averageWaitTime * 0.9 + waitTime * 0.1;
    
    // Update average execution time
    this.stats.averageExecutionTime = this.stats.averageExecutionTime * 0.9 + executionTime * 0.1;
    
    // Update throughput (tasks per second)
    const now = Date.now();
    const timeSinceLastUpdate = now - this.stats.lastThroughputUpdate;
    
    if (timeSinceLastUpdate >= 1000) { // Update every second
      const completedInInterval = this.completed; // Simplified for example
      this.stats.throughput = completedInInterval / (timeSinceLastUpdate / 1000);
      this.stats.lastThroughputUpdate = now;
    }
  }
  
  /**
   * Get comprehensive status including priority and category info
   * @returns {Object} Enhanced status information
   */
  getStatus() {
    const baseStatus = super.getStatus();
    
    // Calculate queue distribution
    const queueDistribution = {};
    for (const [priority, queue] of this.priorityQueues) {
      if (queue.length > 0) {
        queueDistribution[`priority_${priority}`] = queue.length;
      }
    }
    
    // Calculate category distribution
    const categoryDistribution = {};
    for (const [category, task] of this.taskCategories) {
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    }
    
    return {
      ...baseStatus,
      queueDistribution,
      categoryDistribution,
      runningTasks: Array.from(this.runningTasks.keys()),
      stats: {
        averageWaitTime: Math.round(this.stats.averageWaitTime),
        averageExecutionTime: Math.round(this.stats.averageExecutionTime),
        throughput: this.stats.throughput.toFixed(2),
        priorityDistribution: Object.fromEntries(this.stats.tasksByPriority),
        categoryDistribution: Object.fromEntries(this.stats.tasksByCategory)
      }
    };
  }
  
  /**
   * Notify when queue becomes empty
   */
  notifyQueueEmpty() {
    if (this.onQueueEmpty) {
      this.onQueueEmpty({
        completed: this.completed,
        failed: this.failed,
        totalProcessed: this.completed + this.failed,
        finalStats: this.getStatus().stats
      });
    }
  }
}

// =======================
// Approach 3: Adaptive Task Throttler
// =======================

/**
 * Adaptive task throttler with dynamic concurrency adjustment
 * Automatically adjusts concurrency based on system load and performance
 */
class AdaptiveTaskThrottler extends PriorityTaskThrottler {
  constructor(options = {}) {
    super(options);
    
    this.adaptiveOptions = {
      ...this.priorityOptions,
      enableAdaptive: options.enableAdaptive ?? true,
      minConcurrency: options.minConcurrency ?? 1,
      maxConcurrency: Math.max(options.maxConcurrency ?? 10, this.options.maxConcurrent),
      adaptiveInterval: options.adaptiveInterval ?? 5000,
      loadThreshold: options.loadThreshold ?? 0.8,
      performanceTarget: options.performanceTarget ?? 1000 // target avg execution time
    };
    
    // Adaptive state
    this.currentConcurrency = this.options.maxConcurrent;
    this.performanceHistory = [];
    this.loadHistory = [];
    this.adaptiveTimer = null;
    
    // Start adaptive monitoring if enabled
    if (this.adaptiveOptions.enableAdaptive) {
      this.startAdaptiveMonitoring();
    }
  }
  
  /**
   * Start adaptive monitoring
   * Begins periodic adjustment of concurrency based on performance
   */
  startAdaptiveMonitoring() {
    this.adaptiveTimer = setInterval(() => {
      this.adjustConcurrency();
    }, this.adaptiveOptions.adaptiveInterval);
  }
  
  /**
   * Stop adaptive monitoring
   * Stops automatic concurrency adjustments
   */
  stopAdaptiveMonitoring() {
    if (this.adaptiveTimer) {
      clearInterval(this.adaptiveTimer);
      this.adaptiveTimer = null;
    }
  }
  
  /**
   * Adjust concurrency based on system performance
   * Implements adaptive algorithm for optimal throughput
   */
  adjustConcurrency() {
    // Calculate current system load
    const currentLoad = this.calculateSystemLoad();
    const avgExecutionTime = this.stats.averageExecutionTime;
    
    // Store performance metrics
    this.performanceHistory.push({
      timestamp: Date.now(),
      concurrency: this.currentConcurrency,
      executionTime: avgExecutionTime,
      throughput: this.stats.throughput,
      load: currentLoad
    });
    
    // Keep only recent history
    this.performanceHistory = this.performanceHistory.slice(-10);
    
    // Decide on adjustment
    let newConcurrency = this.currentConcurrency;
    
    if (currentLoad > this.adaptiveOptions.loadThreshold) {
      // System under stress, reduce concurrency
      newConcurrency = Math.max(
        this.adaptiveOptions.minConcurrency,
        Math.floor(this.currentConcurrency * 0.8)
      );
    } else if (avgExecutionTime < this.adaptiveOptions.performanceTarget && 
               this.stats.throughput > 0) {
      // System performing well, try increasing concurrency
      newConcurrency = Math.min(
        this.adaptiveOptions.maxConcurrency,
        this.currentConcurrency + 1
      );
    } else if (avgExecutionTime > this.adaptiveOptions.performanceTarget * 2) {
      // System struggling, reduce concurrency
      newConcurrency = Math.max(
        this.adaptiveOptions.minConcurrency,
        this.currentConcurrency - 1
      );
    }
    
    // Apply adjustment if significant change
    if (Math.abs(newConcurrency - this.currentConcurrency) >= 1) {
      console.log(`Adjusting concurrency: ${this.currentConcurrency} → ${newConcurrency} (load: ${currentLoad.toFixed(2)}, avgTime: ${avgExecutionTime.toFixed(0)}ms)`);
      this.currentConcurrency = newConcurrency;
      this.priorityOptions.maxConcurrent = newConcurrency;
    }
  }
  
  /**
   * Calculate current system load
   * Estimates system stress based on queue and performance metrics
   * 
   * @returns {number} Load factor (0-1)
   */
  calculateSystemLoad() {
    const queueLength = this.getTotalQueueLength();
    const runningTasks = this.running;
    const avgWaitTime = this.stats.averageWaitTime;
    
    // Simple load calculation based on multiple factors
    const queueLoad = Math.min(queueLength / (this.currentConcurrency * 5), 1);
    const executionLoad = Math.min(runningTasks / this.currentConcurrency, 1);
    const waitLoad = Math.min(avgWaitTime / 5000, 1); // 5 second target
    
    return (queueLoad + executionLoad + waitLoad) / 3;
  }
  
  /**
   * Get total number of queued tasks across all priorities
   * @returns {number} Total queued tasks
   */
  getTotalQueueLength() {
    let total = 0;
    for (const queue of this.priorityQueues.values()) {
      total += queue.length;
    }
    return total;
  }
  
  /**
   * Get adaptive performance metrics
   * @returns {Object} Performance and adaptation metrics
   */
  getAdaptiveMetrics() {
    return {
      currentConcurrency: this.currentConcurrency,
      minConcurrency: this.adaptiveOptions.minConcurrency,
      maxConcurrency: this.adaptiveOptions.maxConcurrency,
      systemLoad: this.calculateSystemLoad(),
      adaptiveEnabled: this.adaptiveOptions.enableAdaptive,
      performanceHistory: this.performanceHistory.slice(-5), // Recent history
      recommendations: this.getPerformanceRecommendations()
    };
  }
  
  /**
   * Get performance recommendations
   * Analyzes performance data and suggests optimizations
   * 
   * @returns {Array} Array of recommendation objects
   */
  getPerformanceRecommendations() {
    const recommendations = [];
    const avgExecTime = this.stats.averageExecutionTime;
    const avgWaitTime = this.stats.averageWaitTime;
    const currentLoad = this.calculateSystemLoad();
    
    if (avgWaitTime > 10000) { // 10 seconds
      recommendations.push({
        type: 'warning',
        message: 'High average wait time detected. Consider increasing concurrency or optimizing tasks.',
        metric: 'wait_time',
        value: avgWaitTime
      });
    }
    
    if (avgExecTime > this.adaptiveOptions.performanceTarget * 2) {
      recommendations.push({
        type: 'warning',
        message: 'Tasks taking longer than expected. Check for resource contention or optimize task logic.',
        metric: 'execution_time',
        value: avgExecTime
      });
    }
    
    if (currentLoad > 0.9) {
      recommendations.push({
        type: 'critical',
        message: 'System under high load. Consider reducing task complexity or increasing resources.',
        metric: 'system_load',
        value: currentLoad
      });
    }
    
    if (this.stats.throughput < 0.1) {
      recommendations.push({
        type: 'info',
        message: 'Low throughput detected. Verify tasks are being added and processed correctly.',
        metric: 'throughput',
        value: this.stats.throughput
      });
    }
    
    return recommendations;
  }
  
  /**
   * Cleanup adaptive resources
   */
  destroy() {
    this.stopAdaptiveMonitoring();
    this.clearQueue();
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic API rate limiting
 * Demonstrates simple task throttling for API requests
 */
async function demonstrateApiRateLimiting() {
  console.log('=== API Rate Limiting Demo ===\n');
  
  const apiThrottler = new BasicTaskThrottler({
    maxConcurrent: 2,
    delay: 500, // 500ms between requests
    timeout: 5000,
    retries: 2
  });
  
  // Simulate API endpoints
  const mockApiCall = (endpoint, delay = 1000) => {
    return () => new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) { // 10% failure rate
          reject(new Error(`API call to ${endpoint} failed`));
        } else {
          resolve({ endpoint, data: `Data from ${endpoint}`, timestamp: Date.now() });
        }
      }, delay);
    });
  };
  
  // Set up event handlers
  apiThrottler.onTaskComplete = (result) => {
    console.log(`✅ Completed: ${result.result.endpoint} (${result.duration}ms)`);
  };
  
  apiThrottler.onTaskError = (error) => {
    console.log(`❌ Failed: ${error.error.message} after ${error.attempts} attempts`);
  };
  
  // Queue multiple API calls
  const endpoints = [
    'users', 'products', 'orders', 'analytics', 'reports',
    'notifications', 'settings', 'audit', 'metrics', 'logs'
  ];
  
  console.log('Queueing API calls...');
  const startTime = Date.now();
  
  const promises = endpoints.map((endpoint, index) => 
    apiThrottler.addTask(mockApiCall(endpoint, 800 + Math.random() * 400))
  );
  
  // Monitor status while processing
  const statusInterval = setInterval(() => {
    const status = apiThrottler.getStatus();
    console.log(`Status: ${status.running} running, ${status.queueLength} queued, ${status.completed} completed`);
  }, 1000);
  
  try {
    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    
    clearInterval(statusInterval);
    
    console.log(`\nAll API calls completed in ${endTime - startTime}ms`);
    console.log('Results summary:');
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`  Successful: ${successful}`);
    console.log(`  Failed: ${failed}`);
    
    const finalStatus = apiThrottler.getStatus();
    console.log('Final status:', finalStatus);
    
  } catch (error) {
    console.error('Error in API throttling demo:', error);
    clearInterval(statusInterval);
  }
}

/**
 * Example 2: Priority task processing
 * Shows advanced task scheduling with priorities and categories
 */
async function demonstratePriorityProcessing() {
  console.log('=== Priority Task Processing Demo ===\n');
  
  const priorityThrottler = new PriorityTaskThrottler({
    maxConcurrent: 3,
    enablePriorities: true,
    maxPriority: 5,
    schedulingStrategy: 'priority',
    categoryLimits: {
      'critical': 5,
      'normal': 10,
      'background': 20
    }
  });
  
  // Simulate different types of tasks
  const createTask = (name, category, priority, duration = 1000) => {
    return () => new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name,
          category,
          priority,
          completedAt: Date.now()
        });
      }, duration + Math.random() * 500);
    });
  };
  
  // Event handlers for monitoring
  priorityThrottler.onTaskComplete = (result) => {
    console.log(`✅ ${result.result.name} [P${result.priority}/${result.category}] completed in ${result.executionTime}ms (waited ${result.waitTime}ms)`);
  };
  
  // Add tasks with different priorities and categories
  const tasks = [
    // Critical tasks (high priority)
    { name: 'Security Scan', category: 'critical', priority: 5, duration: 1500 },
    { name: 'System Backup', category: 'critical', priority: 5, duration: 2000 },
    { name: 'Error Alert Processing', category: 'critical', priority: 4, duration: 500 },
    
    // Normal tasks (medium priority)
    { name: 'User Data Export', category: 'normal', priority: 3, duration: 1200 },
    { name: 'Report Generation', category: 'normal', priority: 3, duration: 1800 },
    { name: 'Email Sending', category: 'normal', priority: 2, duration: 800 },
    { name: 'Image Processing', category: 'normal', priority: 2, duration: 1000 },
    
    // Background tasks (low priority)
    { name: 'Log Cleanup', category: 'background', priority: 1, duration: 900 },
    { name: 'Cache Warming', category: 'background', priority: 1, duration: 1100 },
    { name: 'Analytics Aggregation', category: 'background', priority: 0, duration: 1300 }
  ];
  
  console.log('Adding tasks with priorities...');
  
  // Add all tasks
  const promises = tasks.map(task => 
    priorityThrottler.addTask(
      createTask(task.name, task.category, task.priority, task.duration),
      {
        priority: task.priority,
        category: task.category,
        estimatedDuration: task.duration
      }
    )
  );
  
  // Monitor progress
  const startTime = Date.now();
  let lastStatus = null;
  
  const monitor = setInterval(() => {
    const status = priorityThrottler.getStatus();
    
    if (JSON.stringify(status) !== JSON.stringify(lastStatus)) {
      console.log('\nCurrent Status:');
      console.log(`  Running: ${status.running}, Queue: ${status.queueLength}`);
      console.log('  Queue by Priority:', status.queueDistribution);
      console.log('  Running by Category:', status.categoryDistribution);
      lastStatus = status;
    }
  }, 1500);
  
  try {
    await Promise.allSettled(promises);
    clearInterval(monitor);
    
    const endTime = Date.now();
    console.log(`\nAll priority tasks completed in ${endTime - startTime}ms`);
    
    const finalStatus = priorityThrottler.getStatus();
    console.log('\nFinal Statistics:');
    console.log('  Performance:', JSON.stringify(finalStatus.stats, null, 2));
    
  } catch (error) {
    console.error('Error in priority processing demo:', error);
    clearInterval(monitor);
  }
}

/**
 * Example 3: Adaptive concurrency system
 * Demonstrates dynamic concurrency adjustment based on performance
 */
async function demonstrateAdaptiveThrottling() {
  console.log('=== Adaptive Task Throttling Demo ===\n');
  
  const adaptiveThrottler = new AdaptiveTaskThrottler({
    maxConcurrent: 2,
    minConcurrency: 1,
    maxConcurrency: 8,
    enableAdaptive: true,
    adaptiveInterval: 2000,
    loadThreshold: 0.7,
    performanceTarget: 800
  });
  
  // Variable load simulation
  let currentLoad = 'light';
  const loadPatterns = {
    light: () => 400 + Math.random() * 200,
    medium: () => 800 + Math.random() * 400,
    heavy: () => 1500 + Math.random() * 1000
  };
  
  const createVariableTask = (name) => {
    return () => new Promise((resolve) => {
      const duration = loadPatterns[currentLoad]();
      setTimeout(() => {
        resolve({ name, duration, load: currentLoad });
      }, duration);
    });
  };
  
  // Monitor adaptive adjustments
  adaptiveThrottler.onTaskComplete = (result) => {
    console.log(`✅ ${result.result.name} [${result.result.load}] - ${result.executionTime}ms`);
  };
  
  console.log('Starting adaptive throttling with varying load patterns...');
  
  // Simulate changing load patterns
  const loadSchedule = [
    { load: 'light', duration: 5000, tasks: 8 },
    { load: 'medium', duration: 6000, tasks: 12 },
    { load: 'heavy', duration: 4000, tasks: 6 },
    { load: 'light', duration: 3000, tasks: 5 }
  ];
  
  const allPromises = [];
  let taskCounter = 0;
  
  for (const phase of loadSchedule) {
    currentLoad = phase.load;
    console.log(`\n📊 Switching to ${phase.load} load pattern`);
    
    // Add tasks for this phase
    for (let i = 0; i < phase.tasks; i++) {
      const promise = adaptiveThrottler.addTask(
        createVariableTask(`Task-${++taskCounter}`),
        { priority: Math.floor(Math.random() * 3) }
      );
      allPromises.push(promise);
    }
    
    // Wait for phase duration
    await new Promise(resolve => setTimeout(resolve, phase.duration));
    
    // Show adaptive metrics
    const metrics = adaptiveThrottler.getAdaptiveMetrics();
    console.log(`   Concurrency: ${metrics.currentConcurrency}, Load: ${metrics.systemLoad.toFixed(2)}`);
    
    if (metrics.recommendations.length > 0) {
      console.log('   Recommendations:');
      metrics.recommendations.forEach(rec => {
        console.log(`     ${rec.type.toUpperCase()}: ${rec.message}`);
      });
    }
  }
  
  console.log('\n⏳ Waiting for all tasks to complete...');
  await Promise.allSettled(allPromises);
  
  // Final metrics
  const finalMetrics = adaptiveThrottler.getAdaptiveMetrics();
  console.log('\nFinal Adaptive Metrics:');
  console.log(`  Final Concurrency: ${finalMetrics.currentConcurrency}`);
  console.log(`  System Load: ${finalMetrics.systemLoad.toFixed(2)}`);
  console.log(`  Performance History: ${finalMetrics.performanceHistory.length} entries`);
  
  console.log('\nPerformance Trend:');
  finalMetrics.performanceHistory.forEach((entry, index) => {
    console.log(`  ${index + 1}. Concurrency: ${entry.concurrency}, Exec Time: ${entry.executionTime.toFixed(0)}ms, Throughput: ${entry.throughput.toFixed(2)}/s`);
  });
  
  // Cleanup
  adaptiveThrottler.destroy();
}

// Export all implementations and examples
module.exports = {
  BasicTaskThrottler,
  PriorityTaskThrottler,
  AdaptiveTaskThrottler,
  demonstrateApiRateLimiting,
  demonstratePriorityProcessing,
  demonstrateAdaptiveThrottling
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Task Throttling Implementation\n');
  console.log('This module demonstrates advanced task throttling systems');
  console.log('with concurrency control, priority queuing, and adaptive scheduling.\n');
  
  demonstrateApiRateLimiting()
    .then(() => {
      console.log('\n' + '='.repeat(60) + '\n');
      return demonstratePriorityProcessing();
    })
    .then(() => {
      console.log('\n' + '='.repeat(60) + '\n');
      return demonstrateAdaptiveThrottling();
    })
    .catch(console.error);
}