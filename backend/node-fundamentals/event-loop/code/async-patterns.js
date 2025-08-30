/**
 * File: async-patterns.js
 * Description: Advanced async patterns and flow control techniques
 * 
 * Learning objectives:
 * - Master sequential vs parallel async execution
 * - Implement controlled concurrency patterns
 * - Build robust error handling for async operations
 * - Create custom async utilities and schedulers
 * 
 * Key Patterns:
 * - Sequential processing with for...of + await
 * - Parallel processing with Promise.all/allSettled
 * - Controlled concurrency with semaphores
 * - Custom async queue and scheduler implementations
 */

const { performance } = require('perf_hooks');
const { promisify } = require('util');

console.log('=== Advanced Async Patterns Demo ===\n');

/**
 * Demonstration 1: Sequential vs Parallel Processing
 * Shows the performance difference between sequential and parallel execution
 */
class AsyncProcessingComparison {
    constructor() {
        this.simulatedAPICalls = [];
        this.initializeAPIMocks();
    }
    
    initializeAPIMocks() {
        // Mock API calls with realistic response times
        const apiEndpoints = [
            { name: 'getUserData', delay: 150, failureRate: 0.1 },
            { name: 'getOrders', delay: 200, failureRate: 0.05 },
            { name: 'getPayments', delay: 120, failureRate: 0.08 },
            { name: 'getPreferences', delay: 80, failureRate: 0.02 },
            { name: 'getRecommendations', delay: 300, failureRate: 0.15 }
        ];
        
        this.apiCalls = apiEndpoints.map(endpoint => {
            return {
                name: endpoint.name,
                call: () => new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (Math.random() < endpoint.failureRate) {
                            reject(new Error(`${endpoint.name} API failed`));
                        } else {
                            resolve({
                                data: `${endpoint.name} data`,
                                timestamp: Date.now(),
                                processingTime: endpoint.delay
                            });
                        }
                    }, endpoint.delay);
                })
            };
        });
    }
    
    // Sequential processing - one after another
    async processSequentially() {
        console.log('--- Sequential Processing ---');
        const start = performance.now();
        const results = [];
        
        try {
            // Process each API call one by one
            for (const api of this.apiCalls) {
                console.log(`Starting ${api.name}...`);
                const result = await api.call();
                results.push({ api: api.name, result, error: null });
                console.log(`Completed ${api.name} in ${result.processingTime}ms`);
            }
        } catch (error) {
            console.error('Sequential processing failed:', error.message);
            results.push({ api: 'unknown', result: null, error });
        }
        
        const duration = performance.now() - start;
        console.log(`Sequential total time: ${duration.toFixed(2)}ms`);
        return { results, duration, mode: 'sequential' };
    }
    
    // Parallel processing - all at once
    async processInParallel() {
        console.log('\n--- Parallel Processing ---');
        const start = performance.now();
        
        try {
            // Start all API calls simultaneously
            const promises = this.apiCalls.map(api => {
                console.log(`Starting ${api.name}...`);
                return api.call().then(result => ({
                    api: api.name,
                    result,
                    error: null
                })).catch(error => ({
                    api: api.name,
                    result: null,
                    error
                }));
            });
            
            const results = await Promise.all(promises);
            const duration = performance.now() - start;
            
            // Log completion order (may differ from start order)
            results.forEach(({ api, result, error }) => {
                if (error) {
                    console.log(`Failed ${api}: ${error.message}`);
                } else {
                    console.log(`Completed ${api} (${result.processingTime}ms simulated)`);
                }
            });
            
            console.log(`Parallel total time: ${duration.toFixed(2)}ms`);
            return { results, duration, mode: 'parallel' };
        } catch (error) {
            console.error('Parallel processing failed:', error.message);
            return { results: [], duration: performance.now() - start, mode: 'parallel', error };
        }
    }
    
    // Parallel with error tolerance - continue even if some fail
    async processInParallelWithErrorTolerance() {
        console.log('\n--- Parallel Processing (Error Tolerant) ---');
        const start = performance.now();
        
        // Use Promise.allSettled to get all results regardless of failures
        const promises = this.apiCalls.map(async (api) => {
            try {
                const result = await api.call();
                return { api: api.name, result, error: null, status: 'fulfilled' };
            } catch (error) {
                return { api: api.name, result: null, error, status: 'rejected' };
            }
        });
        
        const settledResults = await Promise.allSettled(promises);
        const results = settledResults.map(settled => settled.value || settled.reason);
        
        const duration = performance.now() - start;
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Completed: ${successful} successful, ${failed} failed`);
        console.log(`Error-tolerant parallel time: ${duration.toFixed(2)}ms`);
        
        return { results, duration, mode: 'parallel-tolerant', successful, failed };
    }
}

/**
 * Demonstration 2: Controlled Concurrency with Semaphore
 * Limits the number of concurrent operations to prevent overwhelming resources
 */
class AsyncSemaphore {
    constructor(maxConcurrent = 3) {
        this.maxConcurrent = maxConcurrent;
        this.currentCount = 0;
        this.waitingQueue = [];
    }
    
    async acquire() {
        return new Promise((resolve) => {
            if (this.currentCount < this.maxConcurrent) {
                this.currentCount++;
                resolve();
            } else {
                this.waitingQueue.push(resolve);
            }
        });
    }
    
    release() {
        this.currentCount--;
        
        if (this.waitingQueue.length > 0) {
            const nextResolve = this.waitingQueue.shift();
            this.currentCount++;
            nextResolve();
        }
    }
    
    // Helper method to wrap async operations with semaphore
    async execute(asyncOperation) {
        await this.acquire();
        try {
            const result = await asyncOperation();
            return result;
        } finally {
            this.release();
        }
    }
    
    getStatus() {
        return {
            active: this.currentCount,
            queued: this.waitingQueue.length,
            maxConcurrent: this.maxConcurrent
        };
    }
}

async function demonstrateControlledConcurrency() {
    console.log('\n--- Controlled Concurrency Demo ---');
    
    const semaphore = new AsyncSemaphore(2); // Max 2 concurrent operations
    
    // Simulate database operations with varying durations
    const dbOperations = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        operation: () => new Promise(resolve => {
            const duration = Math.random() * 1000 + 500; // 500-1500ms
            setTimeout(() => {
                resolve({ id: i + 1, duration: Math.round(duration) });
            }, duration);
        })
    }));
    
    console.log(`Starting ${dbOperations.length} database operations with max 2 concurrent...`);
    
    const start = performance.now();
    
    // Process all operations with controlled concurrency
    const promises = dbOperations.map(async (op) => {
        const opStart = performance.now();
        
        console.log(`Operation ${op.id}: Waiting for semaphore...`);
        const status = semaphore.getStatus();
        console.log(`  Queue status: ${status.active} active, ${status.queued} queued`);
        
        const result = await semaphore.execute(async () => {
            console.log(`Operation ${op.id}: Started execution`);
            const opResult = await op.operation();
            console.log(`Operation ${op.id}: Completed in ${opResult.duration}ms`);
            return opResult;
        });
        
        const totalTime = performance.now() - opStart;
        return { ...result, totalWaitTime: totalTime - result.duration };
    });
    
    const results = await Promise.all(promises);
    const totalDuration = performance.now() - start;
    
    console.log('\n--- Controlled Concurrency Results ---');
    console.log(`Total time: ${totalDuration.toFixed(2)}ms`);
    results.forEach(result => {
        console.log(`Op ${result.id}: ${result.duration}ms execution + ${result.totalWaitTime.toFixed(2)}ms wait`);
    });
}

/**
 * Demonstration 3: Custom Async Queue with Priority
 * Implements a priority queue for managing async task execution
 */
class PriorityAsyncQueue {
    constructor(options = {}) {
        this.maxConcurrent = options.maxConcurrent || 3;
        this.currentlyRunning = 0;
        this.queue = [];
        this.results = new Map();
        this.isProcessing = false;
    }
    
    add(task, priority = 0, metadata = {}) {
        const taskId = this.generateTaskId();
        const queueItem = {
            id: taskId,
            task,
            priority,
            metadata: { ...metadata, addedAt: Date.now() },
            status: 'queued'
        };
        
        // Insert in priority order (higher priority first)
        let insertIndex = 0;
        while (insertIndex < this.queue.length && this.queue[insertIndex].priority >= priority) {
            insertIndex++;
        }
        
        this.queue.splice(insertIndex, 0, queueItem);
        
        console.log(`Task ${taskId} queued with priority ${priority} (position ${insertIndex + 1})`);
        
        if (!this.isProcessing) {
            this.processQueue();
        }
        
        return taskId;
    }
    
    async processQueue() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        while (this.queue.length > 0 || this.currentlyRunning > 0) {
            // Start new tasks up to the concurrency limit
            while (this.queue.length > 0 && this.currentlyRunning < this.maxConcurrent) {
                const queueItem = this.queue.shift();
                this.executeTask(queueItem);
            }
            
            // Wait a bit before checking again
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.isProcessing = false;
        console.log('Queue processing completed');
    }
    
    async executeTask(queueItem) {
        this.currentlyRunning++;
        queueItem.status = 'running';
        queueItem.metadata.startedAt = Date.now();
        
        console.log(`Executing task ${queueItem.id} (priority ${queueItem.priority})`);
        
        try {
            const result = await queueItem.task();
            queueItem.status = 'completed';
            queueItem.metadata.completedAt = Date.now();
            
            this.results.set(queueItem.id, {
                ...queueItem,
                result,
                duration: queueItem.metadata.completedAt - queueItem.metadata.startedAt,
                waitTime: queueItem.metadata.startedAt - queueItem.metadata.addedAt
            });
            
            console.log(`Task ${queueItem.id} completed successfully`);
        } catch (error) {
            queueItem.status = 'failed';
            queueItem.metadata.failedAt = Date.now();
            
            this.results.set(queueItem.id, {
                ...queueItem,
                error,
                duration: queueItem.metadata.failedAt - queueItem.metadata.startedAt,
                waitTime: queueItem.metadata.startedAt - queueItem.metadata.addedAt
            });
            
            console.log(`Task ${queueItem.id} failed: ${error.message}`);
        } finally {
            this.currentlyRunning--;
        }
    }
    
    getStatus() {
        return {
            queued: this.queue.length,
            running: this.currentlyRunning,
            completed: Array.from(this.results.values()).filter(r => r.status === 'completed').length,
            failed: Array.from(this.results.values()).filter(r => r.status === 'failed').length
        };
    }
    
    getResults() {
        return Array.from(this.results.values()).sort((a, b) => a.priority - b.priority);
    }
    
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

async function demonstratePriorityQueue() {
    console.log('\n--- Priority Async Queue Demo ---');
    
    const queue = new PriorityAsyncQueue({ maxConcurrent: 2 });
    
    // Create tasks with different priorities
    const tasks = [
        { name: 'Low priority task 1', priority: 1, duration: 800 },
        { name: 'High priority task', priority: 10, duration: 400 },
        { name: 'Low priority task 2', priority: 1, duration: 600 },
        { name: 'Medium priority task', priority: 5, duration: 1000 },
        { name: 'Critical task', priority: 20, duration: 200 },
        { name: 'Normal task', priority: 3, duration: 700 }
    ];
    
    // Add tasks to queue (not necessarily in priority order)
    const taskIds = tasks.map(taskSpec => {
        const task = () => new Promise(resolve => {
            setTimeout(() => {
                resolve({ name: taskSpec.name, completed: true });
            }, taskSpec.duration);
        });
        
        return queue.add(task, taskSpec.priority, { name: taskSpec.name });
    });
    
    // Monitor queue status
    const statusInterval = setInterval(() => {
        const status = queue.getStatus();
        console.log(`Queue: ${status.queued} queued, ${status.running} running, ${status.completed} completed`);
        
        if (status.queued === 0 && status.running === 0) {
            clearInterval(statusInterval);
        }
    }, 300);
    
    // Wait for all tasks to complete
    await new Promise(resolve => {
        const checkCompletion = () => {
            const status = queue.getStatus();
            if (status.queued === 0 && status.running === 0) {
                resolve();
            } else {
                setTimeout(checkCompletion, 100);
            }
        };
        checkCompletion();
    });
    
    // Print results
    console.log('\n--- Priority Queue Results ---');
    const results = queue.getResults();
    results.forEach(result => {
        console.log(`${result.metadata.name}: Priority ${result.priority}, Wait ${result.waitTime}ms, Duration ${result.duration}ms`);
    });
}

/**
 * Demonstration 4: Custom Task Scheduler
 * Advanced scheduling with cron-like functionality and error handling
 */
class TaskScheduler {
    constructor() {
        this.tasks = new Map();
        this.isRunning = false;
        this.schedulerInterval = null;
    }
    
    // Add a recurring task
    addRecurringTask(name, taskFunction, intervalMs, options = {}) {
        const task = {
            name,
            function: taskFunction,
            interval: intervalMs,
            lastRun: 0,
            runCount: 0,
            successCount: 0,
            errorCount: 0,
            maxRuns: options.maxRuns || Infinity,
            retryAttempts: options.retryAttempts || 0,
            timeout: options.timeout || 30000,
            enabled: true,
            errors: []
        };
        
        this.tasks.set(name, task);
        console.log(`Scheduled recurring task: ${name} (every ${intervalMs}ms)`);
        
        return name;
    }
    
    // Add a one-time delayed task
    addDelayedTask(name, taskFunction, delayMs, options = {}) {
        const runTime = Date.now() + delayMs;
        
        setTimeout(async () => {
            if (this.tasks.has(name)) {
                await this.executeTask(this.tasks.get(name));
                this.tasks.delete(name);
            }
        }, delayMs);
        
        const task = {
            name,
            function: taskFunction,
            runTime,
            oneTime: true,
            timeout: options.timeout || 30000,
            runCount: 0,
            successCount: 0,
            errorCount: 0,
            errors: []
        };
        
        this.tasks.set(name, task);
        console.log(`Scheduled one-time task: ${name} (in ${delayMs}ms)`);
        
        return name;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Task scheduler started');
        
        this.schedulerInterval = setInterval(() => {
            this.checkAndRunTasks();
        }, 100); // Check every 100ms
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
        }
        
        console.log('Task scheduler stopped');
    }
    
    async checkAndRunTasks() {
        const now = Date.now();
        
        for (const [name, task] of this.tasks) {
            if (!task.enabled || task.oneTime) continue;
            
            // Check if it's time to run the task
            if (now - task.lastRun >= task.interval) {
                // Check if max runs reached
                if (task.runCount >= task.maxRuns) {
                    console.log(`Task ${name} reached max runs (${task.maxRuns}), disabling`);
                    task.enabled = false;
                    continue;
                }
                
                // Execute the task
                await this.executeTask(task);
            }
        }
    }
    
    async executeTask(task) {
        task.runCount++;
        task.lastRun = Date.now();
        
        console.log(`Executing task: ${task.name} (run #${task.runCount})`);
        
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Task timeout')), task.timeout);
            });
            
            // Race between task execution and timeout
            const result = await Promise.race([
                task.function(),
                timeoutPromise
            ]);
            
            task.successCount++;
            console.log(`Task ${task.name} completed successfully`);
            return result;
        } catch (error) {
            task.errorCount++;
            task.errors.push({
                timestamp: Date.now(),
                error: error.message,
                runNumber: task.runCount
            });
            
            console.log(`Task ${task.name} failed: ${error.message}`);
            
            // Retry logic if configured
            if (task.retryAttempts > 0 && task.errorCount <= task.retryAttempts) {
                console.log(`Retrying task ${task.name} (attempt ${task.errorCount}/${task.retryAttempts})`);
                setTimeout(() => this.executeTask(task), 1000);
            }
            
            throw error;
        }
    }
    
    getTaskStatus(taskName) {
        const task = this.tasks.get(taskName);
        if (!task) return null;
        
        return {
            name: task.name,
            enabled: task.enabled,
            runCount: task.runCount,
            successCount: task.successCount,
            errorCount: task.errorCount,
            lastRun: new Date(task.lastRun).toISOString(),
            recentErrors: task.errors.slice(-3)
        };
    }
    
    getAllTaskStatuses() {
        return Array.from(this.tasks.keys()).map(name => this.getTaskStatus(name));
    }
}

async function demonstrateTaskScheduler() {
    console.log('\n--- Task Scheduler Demo ---');
    
    const scheduler = new TaskScheduler();
    
    // Add various types of tasks
    scheduler.addRecurringTask('heartbeat', async () => {
        console.log(`Heartbeat at ${new Date().toISOString()}`);
        return { status: 'alive' };
    }, 1000, { maxRuns: 5 });
    
    scheduler.addRecurringTask('data-cleanup', async () => {
        console.log('Running data cleanup...');
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Randomly fail sometimes to test error handling
        if (Math.random() < 0.3) {
            throw new Error('Cleanup failed - database connection lost');
        }
        
        return { cleaned: Math.floor(Math.random() * 100) };
    }, 2000, { maxRuns: 3, retryAttempts: 2 });
    
    scheduler.addDelayedTask('startup-task', async () => {
        console.log('Running startup initialization...');
        await new Promise(resolve => setTimeout(resolve, 300));
        return { initialized: true };
    }, 500);
    
    // Start scheduler
    scheduler.start();
    
    // Monitor for a while
    setTimeout(() => {
        console.log('\n--- Task Status Report ---');
        const statuses = scheduler.getAllTaskStatuses();
        statuses.forEach(status => {
            console.log(`${status.name}: ${status.runCount} runs, ${status.successCount} success, ${status.errorCount} errors`);
            if (status.recentErrors.length > 0) {
                console.log(`  Recent errors: ${status.recentErrors.map(e => e.error).join(', ')}`);
            }
        });
        
        scheduler.stop();
    }, 8000);
}

// Execute all demonstrations
async function runAllDemonstrations() {
    console.log('Starting comprehensive async patterns demonstration...\n');
    
    // Demo 1: Sequential vs Parallel
    const comparison = new AsyncProcessingComparison();
    const sequentialResult = await comparison.processSequentially();
    const parallelResult = await comparison.processInParallel();
    const tolerantResult = await comparison.processInParallelWithErrorTolerance();
    
    console.log('\n--- Processing Comparison Results ---');
    console.log(`Sequential: ${sequentialResult.duration.toFixed(2)}ms`);
    console.log(`Parallel: ${parallelResult.duration.toFixed(2)}ms`);
    console.log(`Error-Tolerant Parallel: ${tolerantResult.duration.toFixed(2)}ms`);
    console.log(`Speed improvement: ${(sequentialResult.duration / parallelResult.duration).toFixed(2)}x`);
    
    // Demo 2: Controlled Concurrency
    await demonstrateControlledConcurrency();
    
    // Demo 3: Priority Queue
    await demonstratePriorityQueue();
    
    // Demo 4: Task Scheduler
    await demonstrateTaskScheduler();
}

// Export for testing and reuse
module.exports = {
    AsyncProcessingComparison,
    AsyncSemaphore,
    PriorityAsyncQueue,
    TaskScheduler,
    demonstrateControlledConcurrency,
    demonstratePriorityQueue,
    demonstrateTaskScheduler,
    runAllDemonstrations
};

// Run demonstrations if this file is executed directly
if (require.main === module) {
    runAllDemonstrations().catch(console.error);
}

/**
 * Production Patterns Summary:
 * 
 * 1. Choose the Right Pattern:
 *    - Sequential: When order matters or resources are limited
 *    - Parallel: When operations are independent and fast
 *    - Controlled Concurrency: When managing external resources
 * 
 * 2. Error Handling Strategies:
 *    - Use Promise.allSettled for error tolerance
 *    - Implement retry logic with exponential backoff
 *    - Set appropriate timeouts for all async operations
 * 
 * 3. Performance Considerations:
 *    - Monitor queue depths and processing times
 *    - Implement backpressure handling
 *    - Use circuit breakers for external dependencies
 * 
 * 4. Monitoring and Observability:
 *    - Track async operation metrics
 *    - Log processing times and error rates
 *    - Implement health checks for critical async flows
 */