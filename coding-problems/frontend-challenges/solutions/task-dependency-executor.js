/**
 * File: task-dependency-executor.js
 * Description: Task execution system with dependency resolution using DAG (Directed Acyclic Graph)
 * 
 * Problem: Create a task dependency executor that handles complex task relationships
 * Level: Hard
 * Asked at: Airbnb, Uber
 * 
 * Learning objectives:
 * - Understand graph algorithms and topological sorting
 * - Learn dependency resolution and cycle detection
 * - Practice async task coordination and scheduling
 * - Explore DAG-based execution patterns and optimization
 * 
 * Time Complexity: O(V + E) where V is vertices (tasks) and E is edges (dependencies)
 * Space Complexity: O(V + E) for storing graph and execution state
 */

// =======================
// Problem Statement
// =======================

/**
 * Create a comprehensive task dependency executor that provides:
 * 
 * 1. Task definition with dependencies and execution logic
 * 2. Dependency resolution using topological sorting
 * 3. Parallel execution of independent tasks
 * 4. Error handling and retry mechanisms
 * 5. Progress tracking and status monitoring
 * 6. Dynamic task addition and dependency updates
 * 7. Resource management and concurrency control
 * 8. Conditional execution based on task results
 * 
 * Advanced features:
 * - Cycle detection in dependency graph
 * - Priority-based task scheduling
 * - Task cancellation and cleanup
 * - Partial execution and resume capabilities
 * - Resource constraints and allocation
 * - Timeout handling and escalation
 * - Execution analytics and performance monitoring
 * - Integration with external scheduling systems
 * 
 * Use cases:
 * - Build systems and CI/CD pipelines
 * - Data processing workflows
 * - Microservice orchestration
 * - Database migration systems
 * - Deployment automation
 * - ETL (Extract, Transform, Load) processes
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Task execution states
 */
const TaskState = {
    PENDING: 'pending',
    READY: 'ready',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    SKIPPED: 'skipped'
};

/**
 * Task definition class
 */
class Task {
    constructor(id, options = {}) {
        // TODO: Initialize task with configuration
        // this.id = id;
        // this.name = options.name || id;
        // this.description = options.description || '';
        // this.dependencies = new Set(options.dependencies || []);
        // this.executor = options.executor; // Function to execute the task
        // this.timeout = options.timeout || 30000; // 30 seconds default
        // this.retries = options.retries || 0;
        // this.priority = options.priority || 0;
        // this.resources = options.resources || []; // Required resources
        // this.condition = options.condition; // Conditional execution function
        // 
        // // Execution state
        // this.state = TaskState.PENDING;
        // this.result = null;
        // this.error = null;
        // this.startTime = null;
        // this.endTime = null;
        // this.attempt = 0;
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Add dependency to this task
     * 
     * @param {string} taskId - ID of dependency task
     */
    addDependency(taskId) {
        // TODO: Add dependency and validate
        // this.dependencies.add(taskId);
        throw new Error('Implementation pending');
    }
    
    /**
     * Remove dependency from this task
     * 
     * @param {string} taskId - ID of dependency to remove
     */
    removeDependency(taskId) {
        // TODO: Remove dependency
        // this.dependencies.delete(taskId);
        throw new Error('Implementation pending');
    }
    
    /**
     * Check if task can be executed (all dependencies met)
     * 
     * @param {Map} taskRegistry - Registry of all tasks
     * @returns {boolean} - Whether task is ready to execute
     */
    isReady(taskRegistry) {
        // TODO: Check if all dependencies are completed
        // 1. Check each dependency task state
        // 2. Ensure all dependencies are COMPLETED
        // 3. Check conditional execution if specified
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Execute the task
     * 
     * @param {Object} context - Execution context
     * @returns {Promise} - Promise resolving to task result
     */
    async execute(context = {}) {
        // TODO: Execute task with proper state management
        // 1. Set state to RUNNING
        // 2. Record start time
        // 3. Execute with timeout and retry logic
        // 4. Handle success/failure states
        // 5. Record end time and result
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Cancel task execution
     */
    cancel() {
        // TODO: Cancel task and cleanup
        // 1. Set state to CANCELLED
        // 2. Stop execution if running
        // 3. Clean up resources
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get task execution summary
     * 
     * @returns {Object} - Task summary
     */
    getSummary() {
        // TODO: Return task execution summary
        // return {
        //     id: this.id,
        //     name: this.name,
        //     state: this.state,
        //     duration: this.endTime ? this.endTime - this.startTime : null,
        //     attempts: this.attempt,
        //     dependencies: Array.from(this.dependencies),
        //     error: this.error,
        //     result: this.result
        // };
        
        throw new Error('Implementation pending');
    }
}

/**
 * Main task dependency executor class
 */
class TaskDependencyExecutor {
    constructor(options = {}) {
        // TODO: Initialize executor with configuration
        // this.options = {
        //     maxConcurrency: options.maxConcurrency || 10,
        //     defaultTimeout: options.defaultTimeout || 30000,
        //     enableRetries: options.enableRetries !== false,
        //     detectCycles: options.detectCycles !== false,
        //     resourceManager: options.resourceManager || null,
        //     progressCallback: options.progressCallback || null
        // };
        // 
        // this.tasks = new Map(); // Task registry
        // this.runningTasks = new Map(); // Currently running tasks
        // this.completedTasks = new Set(); // Completed task IDs
        // this.failedTasks = new Set(); // Failed task IDs
        // this.cancelledTasks = new Set(); // Cancelled task IDs
        // 
        // this.isExecuting = false;
        // this.executionStartTime = null;
        // this.executionEndTime = null;
        // this.executionStats = {
        //     totalTasks: 0,
        //     completedTasks: 0,
        //     failedTasks: 0,
        //     skippedTasks: 0,
        //     totalDuration: 0
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Add task to the executor
     * 
     * @param {Task|Object} taskDefinition - Task or task configuration
     * @returns {Task} - Added task instance
     */
    addTask(taskDefinition) {
        // TODO: Add task to registry
        // 1. Create Task instance if needed
        // 2. Validate task configuration
        // 3. Add to registry
        // 4. Validate no cycles are introduced
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Remove task from executor
     * 
     * @param {string} taskId - Task ID to remove
     * @returns {boolean} - Whether task was removed
     */
    removeTask(taskId) {
        // TODO: Remove task from registry
        // 1. Check if task exists
        // 2. Remove from all dependency lists
        // 3. Remove from registry
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Execute all tasks respecting dependencies
     * 
     * @param {Object} context - Global execution context
     * @returns {Promise<Object>} - Execution results
     */
    async execute(context = {}) {
        // TODO: Execute all tasks with dependency resolution
        // 1. Validate graph (check cycles)
        // 2. Perform topological sort
        // 3. Execute tasks in parallel where possible
        // 4. Handle failures and retries
        // 5. Return execution summary
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Execute specific task and its dependencies
     * 
     * @param {string} taskId - Task to execute
     * @param {Object} context - Execution context
     * @returns {Promise<Object>} - Execution result
     */
    async executeTask(taskId, context = {}) {
        // TODO: Execute specific task and dependencies
        // 1. Find all dependencies recursively
        // 2. Create execution plan
        // 3. Execute dependencies first
        // 4. Execute target task
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Cancel all running tasks
     */
    async cancelAll() {
        // TODO: Cancel all active tasks
        // 1. Cancel all running tasks
        // 2. Set remaining pending tasks to cancelled
        // 3. Clean up resources
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get current execution status
     * 
     * @returns {Object} - Current status
     */
    getStatus() {
        // TODO: Return current execution status
        // return {
        //     isExecuting: this.isExecuting,
        //     totalTasks: this.tasks.size,
        //     pendingTasks: this._getPendingTasks().length,
        //     runningTasks: this.runningTasks.size,
        //     completedTasks: this.completedTasks.size,
        //     failedTasks: this.failedTasks.size,
        //     progress: this._calculateProgress()
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Get task execution graph visualization
     * 
     * @returns {Object} - Graph representation
     */
    getExecutionGraph() {
        // TODO: Generate graph representation for visualization
        // return {
        //     nodes: [], // Tasks with their states
        //     edges: [], // Dependencies between tasks
        //     metadata: {} // Additional graph information
        // };
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to detect cycles in dependency graph
     * 
     * @returns {Array} - Array of cycles found (empty if none)
     */
    _detectCycles() {
        // TODO: Implement cycle detection using DFS
        // 1. Use depth-first search with coloring
        // 2. Detect back edges that indicate cycles
        // 3. Return cycle paths for debugging
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to perform topological sort
     * 
     * @returns {Array} - Topologically sorted task IDs
     */
    _topologicalSort() {
        // TODO: Implement Kahn's algorithm for topological sorting
        // 1. Calculate in-degrees for all tasks
        // 2. Start with tasks having zero dependencies
        // 3. Process tasks in order, updating dependencies
        // 4. Return sorted order
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to find ready tasks
     * 
     * @returns {Array} - Tasks ready for execution
     */
    _getReadyTasks() {
        // TODO: Find tasks that can be executed now
        // 1. Check each pending task
        // 2. Verify all dependencies are completed
        // 3. Check resource availability
        // 4. Apply priority sorting
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to execute task with monitoring
     * 
     * @param {Task} task - Task to execute
     * @param {Object} context - Execution context
     * @returns {Promise} - Execution promise
     */
    async _executeTaskWithMonitoring(task, context) {
        // TODO: Execute task with full monitoring
        // 1. Register as running task
        // 2. Set up timeout handling
        // 3. Execute with error handling
        // 4. Update statistics
        // 5. Notify progress callbacks
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to handle task failure
     * 
     * @param {Task} task - Failed task
     * @param {Error} error - Failure error
     * @param {Object} context - Execution context
     * @returns {Promise<boolean>} - Whether task should be retried
     */
    async _handleTaskFailure(task, error, context) {
        // TODO: Handle task failure with retry logic
        // 1. Check retry configuration
        // 2. Implement exponential backoff
        // 3. Update failure statistics
        // 4. Determine if execution should continue
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to calculate execution progress
     * 
     * @returns {number} - Progress percentage (0-100)
     */
    _calculateProgress() {
        // TODO: Calculate overall progress
        // Consider task weights, dependencies, and current states
        throw new Error('Implementation pending');
    }
    
    /**
     * Internal method to update execution statistics
     */
    _updateStats() {
        // TODO: Update execution statistics
        // Calculate durations, success rates, etc.
        throw new Error('Implementation pending');
    }
}

// =======================
// Advanced Features
// =======================

/**
 * TODO: Resource manager for task execution
 * Manages limited resources required by tasks
 */
class ResourceManager {
    constructor(resources = {}) {
        // TODO: Initialize resource manager
        // this.resources = new Map(); // resource_name -> { total, available, allocated }
        // this.allocations = new Map(); // task_id -> [resource_names]
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Check if resources are available for task
     * 
     * @param {Array} requiredResources - Resources required by task
     * @returns {boolean} - Whether resources are available
     */
    canAllocate(requiredResources) {
        // TODO: Check resource availability
        throw new Error('Implementation pending');
    }
    
    /**
     * Allocate resources for task
     * 
     * @param {string} taskId - Task requesting resources
     * @param {Array} requiredResources - Required resources
     * @returns {boolean} - Whether allocation was successful
     */
    allocate(taskId, requiredResources) {
        // TODO: Allocate resources to task
        throw new Error('Implementation pending');
    }
    
    /**
     * Release resources from task
     * 
     * @param {string} taskId - Task releasing resources
     */
    release(taskId) {
        // TODO: Release allocated resources
        throw new Error('Implementation pending');
    }
    
    /**
     * Get resource usage statistics
     * 
     * @returns {Object} - Resource usage stats
     */
    getStats() {
        // TODO: Return resource utilization statistics
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Task scheduler with priority and timing
 * Advanced scheduling with priority queues and timing constraints
 */
class TaskScheduler {
    constructor(options = {}) {
        // TODO: Initialize scheduler
        // this.priorityQueue = new PriorityQueue();
        // this.scheduledTasks = new Map(); // task_id -> scheduled_time
        // this.recurringTasks = new Map(); // task_id -> recurrence_config
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Schedule task for future execution
     * 
     * @param {Task} task - Task to schedule
     * @param {Date|number} when - When to execute (Date or delay in ms)
     * @param {Object} options - Scheduling options
     */
    schedule(task, when, options = {}) {
        // TODO: Schedule task for future execution
        throw new Error('Implementation pending');
    }
    
    /**
     * Schedule recurring task
     * 
     * @param {Task} task - Task to schedule
     * @param {string} cronExpression - Cron-style schedule expression
     * @param {Object} options - Scheduling options
     */
    scheduleRecurring(task, cronExpression, options = {}) {
        // TODO: Schedule recurring task
        throw new Error('Implementation pending');
    }
    
    /**
     * Get next scheduled tasks
     * 
     * @param {number} limit - Maximum number of tasks to return
     * @returns {Array} - Next scheduled tasks
     */
    getNextTasks(limit = 10) {
        // TODO: Get upcoming scheduled tasks
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Execution history and analytics
 * Track and analyze task execution patterns
 */
class ExecutionAnalytics {
    constructor() {
        // TODO: Initialize analytics
        // this.executions = []; // Historical execution data
        // this.metrics = new Map(); // Calculated metrics
        
        throw new Error('Implementation pending');
    }
    
    /**
     * Record task execution
     * 
     * @param {Task} task - Executed task
     * @param {Object} executionInfo - Execution details
     */
    recordExecution(task, executionInfo) {
        // TODO: Record execution for analysis
        throw new Error('Implementation pending');
    }
    
    /**
     * Generate execution report
     * 
     * @param {Object} options - Report options
     * @returns {Object} - Execution analytics report
     */
    generateReport(options = {}) {
        // TODO: Generate comprehensive execution report
        throw new Error('Implementation pending');
    }
    
    /**
     * Get task performance metrics
     * 
     * @param {string} taskId - Task to analyze
     * @returns {Object} - Performance metrics
     */
    getTaskMetrics(taskId) {
        // TODO: Get performance metrics for specific task
        throw new Error('Implementation pending');
    }
}

// =======================
// Utility Classes
// =======================

/**
 * TODO: Priority queue implementation for task scheduling
 */
class PriorityQueue {
    constructor(compareFn) {
        // TODO: Initialize priority queue
        throw new Error('Implementation pending');
    }
    
    enqueue(item, priority) {
        // TODO: Add item with priority
        throw new Error('Implementation pending');
    }
    
    dequeue() {
        // TODO: Remove and return highest priority item
        throw new Error('Implementation pending');
    }
    
    peek() {
        // TODO: Get highest priority item without removing
        throw new Error('Implementation pending');
    }
    
    isEmpty() {
        // TODO: Check if queue is empty
        throw new Error('Implementation pending');
    }
    
    size() {
        // TODO: Get queue size
        throw new Error('Implementation pending');
    }
}

/**
 * TODO: Graph utilities for dependency analysis
 */
const GraphUtils = {
    /**
     * Find strongly connected components
     */
    findSCC: (graph) => {
        // TODO: Find strongly connected components using Tarjan's algorithm
        throw new Error('Implementation pending');
    },
    
    /**
     * Find shortest path between tasks
     */
    findShortestPath: (graph, start, end) => {
        // TODO: Find shortest dependency path
        throw new Error('Implementation pending');
    },
    
    /**
     * Calculate graph metrics
     */
    calculateMetrics: (graph) => {
        // TODO: Calculate graph complexity metrics
        throw new Error('Implementation pending');
    }
};

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic task dependency execution
console.log("=== Basic Task Dependency Test ===");
const executor = new TaskDependencyExecutor({ maxConcurrency: 3 });

// Define tasks with dependencies
const tasks = [
    {
        id: 'task-a',
        name: 'Initialize Database',
        executor: async () => {
            console.log('Initializing database...');
            await new Promise(resolve => setTimeout(resolve, 500));
            return { status: 'Database initialized' };
        }
    },
    {
        id: 'task-b',
        name: 'Load Configuration',
        dependencies: ['task-a'],
        executor: async (context, dependencies) => {
            console.log('Loading configuration...');
            await new Promise(resolve => setTimeout(resolve, 300));
            return { config: { apiUrl: 'https://api.example.com' } };
        }
    },
    {
        id: 'task-c',
        name: 'Start Web Server',
        dependencies: ['task-b'],
        executor: async (context, dependencies) => {
            console.log('Starting web server...');
            await new Promise(resolve => setTimeout(resolve, 400));
            return { server: 'Running on port 3000' };
        }
    },
    {
        id: 'task-d',
        name: 'Run Health Check',
        dependencies: ['task-c'],
        executor: async () => {
            console.log('Running health check...');
            await new Promise(resolve => setTimeout(resolve, 200));
            return { health: 'OK' };
        }
    }
];

// Add tasks to executor
tasks.forEach(taskDef => {
    const task = new Task(taskDef.id, taskDef);
    executor.addTask(task);
});

// Execute all tasks
console.time('Basic execution');
executor.execute().then(result => {
    console.timeEnd('Basic execution');
    console.log('Execution result:', result);
    console.log('Final status:', executor.getStatus());
});

// Test Case 2: Parallel execution of independent tasks
console.log("\n=== Parallel Execution Test ===");
const parallelExecutor = new TaskDependencyExecutor({ maxConcurrency: 5 });

// Create tasks with parallel branches
const parallelTasks = [
    {
        id: 'init',
        name: 'Initialize',
        executor: async () => {
            console.log('Initializing...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'initialized';
        }
    },
    {
        id: 'branch-a1',
        name: 'Branch A - Step 1',
        dependencies: ['init'],
        executor: async () => {
            console.log('Branch A - Step 1');
            await new Promise(resolve => setTimeout(resolve, 200));
            return 'a1-done';
        }
    },
    {
        id: 'branch-a2',
        name: 'Branch A - Step 2',
        dependencies: ['branch-a1'],
        executor: async () => {
            console.log('Branch A - Step 2');
            await new Promise(resolve => setTimeout(resolve, 150));
            return 'a2-done';
        }
    },
    {
        id: 'branch-b1',
        name: 'Branch B - Step 1',
        dependencies: ['init'],
        executor: async () => {
            console.log('Branch B - Step 1');
            await new Promise(resolve => setTimeout(resolve, 300));
            return 'b1-done';
        }
    },
    {
        id: 'branch-b2',
        name: 'Branch B - Step 2',
        dependencies: ['branch-b1'],
        executor: async () => {
            console.log('Branch B - Step 2');
            await new Promise(resolve => setTimeout(resolve, 250));
            return 'b2-done';
        }
    },
    {
        id: 'merge',
        name: 'Merge Results',
        dependencies: ['branch-a2', 'branch-b2'],
        executor: async (context, deps) => {
            console.log('Merging results from both branches');
            await new Promise(resolve => setTimeout(resolve, 100));
            return { merged: true, results: deps };
        }
    }
];

parallelTasks.forEach(taskDef => {
    parallelExecutor.addTask(new Task(taskDef.id, taskDef));
});

console.time('Parallel execution');
parallelExecutor.execute().then(result => {
    console.timeEnd('Parallel execution');
    console.log('Parallel execution completed');
});

// Test Case 3: Error handling and retries
console.log("\n=== Error Handling and Retries Test ===");
const errorExecutor = new TaskDependencyExecutor({ maxConcurrency: 2 });

let attemptCount = 0;
const errorTasks = [
    {
        id: 'stable-task',
        name: 'Stable Task',
        executor: async () => {
            console.log('Stable task executing...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'stable-result';
        }
    },
    {
        id: 'flaky-task',
        name: 'Flaky Task',
        dependencies: ['stable-task'],
        retries: 2,
        executor: async () => {
            attemptCount++;
            console.log(`Flaky task attempt #${attemptCount}`);
            
            if (attemptCount < 3) {
                throw new Error(`Attempt ${attemptCount} failed`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'flaky-success';
        }
    },
    {
        id: 'dependent-task',
        name: 'Task Depending on Flaky',
        dependencies: ['flaky-task'],
        executor: async () => {
            console.log('Dependent task executing...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'dependent-result';
        }
    }
];

errorTasks.forEach(taskDef => {
    errorExecutor.addTask(new Task(taskDef.id, taskDef));
});

errorExecutor.execute().then(result => {
    console.log('Error handling test completed:', result.success);
    console.log(`Total attempts for flaky task: ${attemptCount}`);
});

// Test Case 4: Cycle detection
console.log("\n=== Cycle Detection Test ===");
const cycleExecutor = new TaskDependencyExecutor({ detectCycles: true });

try {
    // Create tasks with circular dependency
    cycleExecutor.addTask(new Task('task-x', {
        dependencies: ['task-y'],
        executor: async () => 'x-result'
    }));
    
    cycleExecutor.addTask(new Task('task-y', {
        dependencies: ['task-z'],
        executor: async () => 'y-result'
    }));
    
    cycleExecutor.addTask(new Task('task-z', {
        dependencies: ['task-x'], // Creates cycle: x -> y -> z -> x
        executor: async () => 'z-result'
    }));
    
    cycleExecutor.execute().catch(error => {
        console.log('Cycle detected as expected:', error.message);
    });
} catch (error) {
    console.log('Cycle detected during task addition:', error.message);
}

// Test Case 5: Resource management
console.log("\n=== Resource Management Test ===");
const resourceManager = new ResourceManager({
    'database-connection': { total: 2, available: 2 },
    'memory': { total: 1000, available: 1000 }, // MB
    'cpu-core': { total: 4, available: 4 }
});

const resourceExecutor = new TaskDependencyExecutor({
    maxConcurrency: 10,
    resourceManager: resourceManager
});

const resourceTasks = [
    {
        id: 'db-task-1',
        name: 'Database Task 1',
        resources: ['database-connection'],
        executor: async () => {
            console.log('DB Task 1 using database connection');
            await new Promise(resolve => setTimeout(resolve, 500));
            return 'db1-result';
        }
    },
    {
        id: 'db-task-2',
        name: 'Database Task 2',
        resources: ['database-connection'],
        executor: async () => {
            console.log('DB Task 2 using database connection');
            await new Promise(resolve => setTimeout(resolve, 300));
            return 'db2-result';
        }
    },
    {
        id: 'memory-task',
        name: 'Memory Intensive Task',
        resources: ['memory:500'],
        executor: async () => {
            console.log('Memory task using 500MB');
            await new Promise(resolve => setTimeout(resolve, 400));
            return 'memory-result';
        }
    },
    {
        id: 'cpu-task',
        name: 'CPU Intensive Task',
        dependencies: ['db-task-1'],
        resources: ['cpu-core:2'],
        executor: async () => {
            console.log('CPU task using 2 cores');
            await new Promise(resolve => setTimeout(resolve, 600));
            return 'cpu-result';
        }
    }
];

resourceTasks.forEach(taskDef => {
    resourceExecutor.addTask(new Task(taskDef.id, taskDef));
});

resourceExecutor.execute().then(result => {
    console.log('Resource management test completed');
    console.log('Resource stats:', resourceManager.getStats());
});

// Test Case 6: Conditional execution
console.log("\n=== Conditional Execution Test ===");
const conditionalExecutor = new TaskDependencyExecutor();

const conditionalTasks = [
    {
        id: 'check-environment',
        name: 'Check Environment',
        executor: async () => {
            const isProduction = Math.random() > 0.5; // Random for testing
            console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
            return { isProduction };
        }
    },
    {
        id: 'production-setup',
        name: 'Production Setup',
        dependencies: ['check-environment'],
        condition: (context, deps) => deps['check-environment'].result.isProduction,
        executor: async () => {
            console.log('Setting up production environment...');
            await new Promise(resolve => setTimeout(resolve, 200));
            return 'production-configured';
        }
    },
    {
        id: 'development-setup',
        name: 'Development Setup',
        dependencies: ['check-environment'],
        condition: (context, deps) => !deps['check-environment'].result.isProduction,
        executor: async () => {
            console.log('Setting up development environment...');
            await new Promise(resolve => setTimeout(resolve, 150));
            return 'development-configured';
        }
    },
    {
        id: 'start-application',
        name: 'Start Application',
        dependencies: ['check-environment'], // Will run after either setup completes
        executor: async () => {
            console.log('Starting application...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'application-started';
        }
    }
];

conditionalTasks.forEach(taskDef => {
    conditionalExecutor.addTask(new Task(taskDef.id, taskDef));
});

conditionalExecutor.execute().then(result => {
    console.log('Conditional execution test completed');
});

// Performance test
console.log("\n=== Performance Test ===");
const perfExecutor = new TaskDependencyExecutor({ maxConcurrency: 50 });

// Create a large number of tasks with complex dependencies
const createPerformanceTasks = (count) => {
    const tasks = [];
    
    // Create root task
    tasks.push({
        id: 'root',
        executor: async () => 'root-completed'
    });
    
    // Create layers of dependent tasks
    for (let layer = 1; layer <= 5; layer++) {
        const layerSize = Math.floor(count / 5);
        for (let i = 0; i < layerSize; i++) {
            const taskId = `layer-${layer}-task-${i}`;
            const dependencies = layer === 1 ? ['root'] : 
                [`layer-${layer - 1}-task-${Math.floor(i / 2)}`];
            
            tasks.push({
                id: taskId,
                dependencies,
                executor: async () => {
                    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
                    return `${taskId}-completed`;
                }
            });
        }
    }
    
    return tasks;
};

const perfTasks = createPerformanceTasks(500);
perfTasks.forEach(taskDef => {
    perfExecutor.addTask(new Task(taskDef.id, taskDef));
});

const perfStartTime = Date.now();
perfExecutor.execute().then(result => {
    const duration = Date.now() - perfStartTime;
    console.log(`Performance test: executed ${perfTasks.length} tasks in ${duration}ms`);
    console.log(`Average: ${(duration / perfTasks.length).toFixed(2)}ms per task`);
    console.log('Success rate:', (result.completedTasks / result.totalTasks * 100).toFixed(1) + '%');
});
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Graph Algorithms:
 *    - Topological sorting algorithms (Kahn's vs DFS)
 *    - Cycle detection using DFS with coloring
 *    - Graph traversal optimization for large dependency networks
 * 
 * 2. Concurrency and Parallelism:
 *    - Identifying independent tasks for parallel execution
 *    - Resource constraint handling and allocation
 *    - Deadlock prevention in resource allocation
 * 
 * 3. Error Handling Strategies:
 *    - Failure propagation vs isolation
 *    - Retry mechanisms with exponential backoff
 *    - Circuit breaker patterns for unstable tasks
 * 
 * 4. State Management:
 *    - Task state transitions and consistency
 *    - Progress tracking and monitoring
 *    - Execution resume after failures
 * 
 * 5. Performance Optimization:
 *    - Memory efficiency with large task graphs
 *    - Optimal scheduling algorithms
 *    - Batching and chunking strategies
 * 
 * 6. Real-world Applications:
 *    - Build systems (Make, Bazel, Gradle)
 *    - CI/CD pipeline orchestration
 *    - Data processing workflows (Apache Airflow)
 *    - Microservice deployment coordination
 * 
 * 7. Advanced Features:
 *    - Dynamic task addition during execution
 *    - Priority-based scheduling
 *    - Resource pooling and allocation strategies
 *    - Integration with external scheduling systems
 * 
 * 8. Testing and Debugging:
 *    - Visualization of dependency graphs
 *    - Execution tracing and profiling
 *    - Deterministic testing of concurrent execution
 *    - Performance benchmarking and optimization
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TaskState,
        Task,
        TaskDependencyExecutor,
        ResourceManager,
        TaskScheduler,
        ExecutionAnalytics,
        PriorityQueue,
        GraphUtils
    };
}