/**
 * File: practical-applications.js
 * Topic: Practical Applications of Hoisting and Scope
 * 
 * This file demonstrates real-world applications where understanding hoisting
 * and scope is crucial for writing robust, maintainable JavaScript code.
 * Focus: Production patterns, common use cases, and practical solutions
 */

// ============================================================================
// MODULE SYSTEMS AND SCOPE MANAGEMENT
// ============================================================================

/**
 * Real-World Module Pattern Using Scope and Hoisting:
 * 
 * In production applications, proper scope management prevents global
 * pollution, enables code organization, and provides encapsulation.
 * This pattern is foundational to modern JavaScript architecture.
 */

console.log('=== MODULE SYSTEMS WITH SCOPE MANAGEMENT ===\n');

// Production-style configuration module
const ConfigManager = (function() {
    console.log('1. Configuration Manager Module:');
    
    // Private configuration state (hoisted in IIFE scope)
    var environment = 'development';
    let configurations = new Map();
    const defaultConfig = Object.freeze({
        apiUrl: 'https://api.example.com',
        timeout: 5000,
        retryAttempts: 3,
        debug: false
    });
    
    // Private validation function (hoisted within module)
    function validateConfig(config) {
        const required = ['apiUrl', 'timeout'];
        const missing = required.filter(key => !(key in config));
        
        if (missing.length > 0) {
            throw new Error(`Missing required config keys: ${missing.join(', ')}`);
        }
        
        return true;
    }
    
    // Private environment setup (uses hoisted functions)
    function initializeEnvironment() {
        // Detect environment from various sources
        const envFromNode = typeof process !== 'undefined' ? process.env.NODE_ENV : null;
        const envFromUrl = typeof window !== 'undefined' ? 
            (window.location.hostname === 'localhost' ? 'development' : 'production') : null;
        
        environment = envFromNode || envFromUrl || 'development';
        console.log(`  Initialized environment: ${environment}`);
        
        // Load environment-specific defaults
        loadEnvironmentDefaults(environment);
    }
    
    function loadEnvironmentDefaults(env) {
        const envConfigs = {
            development: {
                ...defaultConfig,
                debug: true,
                timeout: 10000
            },
            production: {
                ...defaultConfig,
                apiUrl: 'https://api.prod.example.com',
                retryAttempts: 5
            },
            test: {
                ...defaultConfig,
                apiUrl: 'https://api.test.example.com',
                timeout: 1000
            }
        };
        
        const envConfig = envConfigs[env] || defaultConfig;
        configurations.set('default', envConfig);
        console.log(`  Loaded ${env} configuration:`, envConfig);
    }
    
    // Initialize on module creation
    initializeEnvironment();
    
    // Public API returned from IIFE
    return {
        get: function(key = 'default') {
            const config = configurations.get(key);
            if (!config) {
                console.warn(`  Configuration '${key}' not found, using default`);
                return configurations.get('default');
            }
            return { ...config }; // Return copy to prevent mutation
        },
        
        set: function(key, config) {
            try {
                validateConfig(config);
                configurations.set(key, Object.freeze({ ...config }));
                console.log(`  Configuration '${key}' updated successfully`);
                return true;
            } catch (error) {
                console.error(`  Failed to set configuration '${key}':`, error.message);
                return false;
            }
        },
        
        getEnvironment: function() {
            return environment;
        },
        
        reload: function() {
            configurations.clear();
            initializeEnvironment();
            console.log('  Configuration reloaded');
        }
    };
})();

// Usage of the configuration manager
console.log('Current config:', ConfigManager.get());
ConfigManager.set('api', {
    apiUrl: 'https://custom-api.com',
    timeout: 3000,
    retryAttempts: 2
});
console.log('Custom API config:', ConfigManager.get('api'));

// ============================================================================
// EVENT HANDLING WITH PROPER SCOPE MANAGEMENT
// ============================================================================

/**
 * Event Handler Patterns Using Closures and Scope:
 * 
 * Proper scope management in event handling prevents memory leaks,
 * enables proper cleanup, and maintains context across async operations.
 */

console.log('\n=== EVENT HANDLING WITH SCOPE MANAGEMENT ===\n');

function createAdvancedEventManager() {
    console.log('2. Advanced Event Manager:');
    
    // Private state using closures
    let eventListeners = new Map();
    let eventHistory = [];
    const maxHistorySize = 100;
    
    // Private helper functions (benefit from hoisting)
    function generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    function logEvent(eventType, data, listenerId) {
        const eventRecord = {
            type: eventType,
            data: data,
            listenerId: listenerId,
            timestamp: Date.now()
        };
        
        eventHistory.push(eventRecord);
        
        // Maintain history size limit
        if (eventHistory.length > maxHistorySize) {
            eventHistory.shift(); // Remove oldest event
        }
        
        console.log(`  Event logged: ${eventType} (${listenerId})`);
    }
    
    // Public API
    return {
        // Add event listener with automatic cleanup
        addEventListener: function(eventType, callback, options = {}) {
            const listenerId = generateListenerId();
            const { once = false, timeout = null, context = null } = options;
            
            // Create enhanced callback with scope management
            const enhancedCallback = function(eventData) {
                try {
                    logEvent(eventType, eventData, listenerId);
                    
                    // Apply context if provided
                    const result = context ? 
                        callback.call(context, eventData) : 
                        callback(eventData);
                    
                    // Auto-remove if 'once' option is set
                    if (once) {
                        this.removeEventListener(listenerId);
                    }
                    
                    return result;
                    
                } catch (error) {
                    console.error(`  Error in event listener ${listenerId}:`, error.message);
                }
            }.bind(this);
            
            // Store listener with metadata
            const listenerInfo = {
                eventType,
                callback: enhancedCallback,
                originalCallback: callback,
                options,
                created: Date.now()
            };
            
            eventListeners.set(listenerId, listenerInfo);
            
            // Set up automatic timeout removal if specified
            if (timeout) {
                setTimeout(() => {
                    if (eventListeners.has(listenerId)) {
                        console.log(`  Auto-removing listener ${listenerId} after timeout`);
                        this.removeEventListener(listenerId);
                    }
                }.bind(this), timeout);
            }
            
            console.log(`  Added event listener: ${eventType} (${listenerId})`);
            return listenerId;
        },
        
        // Remove specific event listener
        removeEventListener: function(listenerId) {
            if (eventListeners.has(listenerId)) {
                const listener = eventListeners.get(listenerId);
                eventListeners.delete(listenerId);
                console.log(`  Removed event listener: ${listener.eventType} (${listenerId})`);
                return true;
            }
            return false;
        },
        
        // Emit event to all relevant listeners
        emit: function(eventType, eventData) {
            console.log(`  Emitting event: ${eventType}`);
            
            const relevantListeners = Array.from(eventListeners.entries())
                .filter(([id, listener]) => listener.eventType === eventType);
            
            if (relevantListeners.length === 0) {
                console.log(`  No listeners for event: ${eventType}`);
                return;
            }
            
            // Execute all listeners with proper error isolation
            relevantListeners.forEach(([id, listener]) => {
                try {
                    listener.callback(eventData);
                } catch (error) {
                    console.error(`  Listener ${id} threw error:`, error.message);
                }
            });
            
            console.log(`  Event ${eventType} emitted to ${relevantListeners.length} listeners`);
        },
        
        // Get event statistics
        getStats: function() {
            const stats = {
                activeListeners: eventListeners.size,
                eventHistory: eventHistory.length,
                listenersByType: {}
            };
            
            // Group listeners by event type
            for (const [id, listener] of eventListeners) {
                const type = listener.eventType;
                stats.listenersByType[type] = (stats.listenersByType[type] || 0) + 1;
            }
            
            console.log('  Event manager stats:', stats);
            return stats;
        },
        
        // Cleanup all listeners (important for memory management)
        cleanup: function() {
            const count = eventListeners.size;
            eventListeners.clear();
            eventHistory = [];
            console.log(`  Cleaned up ${count} event listeners`);
        }
    };
}

// Using the advanced event manager
const eventManager = createAdvancedEventManager();

// Add various listeners with different patterns
const userActionListener = eventManager.addEventListener('user_action', function(data) {
    console.log(`    User action received: ${data.action}`);
}, { context: { userId: 123 } });

const onceListener = eventManager.addEventListener('system_startup', function(data) {
    console.log(`    System startup: ${data.version}`);
}, { once: true });

const timeoutListener = eventManager.addEventListener('heartbeat', function(data) {
    console.log(`    Heartbeat: ${data.timestamp}`);
}, { timeout: 5000 }); // Auto-remove after 5 seconds

// Emit some events
eventManager.emit('user_action', { action: 'click', button: 'submit' });
eventManager.emit('system_startup', { version: '2.1.0' });
eventManager.emit('heartbeat', { timestamp: Date.now() });

// Check stats
eventManager.getStats();

// ============================================================================
// ASYNCHRONOUS OPERATIONS WITH SCOPE PRESERVATION
// ============================================================================

/**
 * Managing Scope in Async Operations:
 * 
 * Async operations often lose scope context, leading to bugs.
 * Proper scope management ensures data consistency and prevents
 * common async pitfalls.
 */

console.log('\n=== ASYNC OPERATIONS WITH SCOPE PRESERVATION ===\n');

function createAsyncTaskManager() {
    console.log('3. Async Task Manager with Scope Preservation:');
    
    // Task state management with proper scoping
    let taskQueue = [];
    let runningTasks = new Map();
    let completedTasks = [];
    let taskIdCounter = 0;
    
    // Create isolated scope for each task
    function createTaskScope(taskId, taskData) {
        // Each task gets its own scope with preserved variables
        const taskScope = {
            id: taskId,
            data: { ...taskData }, // Copy data to prevent external modification
            startTime: null,
            endTime: null,
            result: null,
            error: null,
            status: 'pending'
        };
        
        return taskScope;
    }
    
    // Async task executor with scope isolation
    async function executeTaskWithScope(taskScope, taskFunction) {
        taskScope.startTime = Date.now();
        taskScope.status = 'running';
        
        console.log(`    Starting task ${taskScope.id} with data:`, taskScope.data);
        
        try {
            // Execute task with preserved scope
            const result = await taskFunction.call(taskScope, taskScope.data);
            
            taskScope.result = result;
            taskScope.status = 'completed';
            taskScope.endTime = Date.now();
            
            console.log(`    Task ${taskScope.id} completed:`, result);
            return taskScope;
            
        } catch (error) {
            taskScope.error = error.message;
            taskScope.status = 'failed';
            taskScope.endTime = Date.now();
            
            console.error(`    Task ${taskScope.id} failed:`, error.message);
            throw taskScope;
        }
    }
    
    return {
        // Add task to queue with scope preservation
        addTask: function(taskFunction, taskData, options = {}) {
            const taskId = ++taskIdCounter;
            const { priority = 0, timeout = 30000 } = options;
            
            const taskScope = createTaskScope(taskId, taskData);
            taskScope.priority = priority;
            taskScope.timeout = timeout;
            
            const taskWrapper = {
                scope: taskScope,
                execute: () => executeTaskWithScope(taskScope, taskFunction)
            };
            
            // Insert based on priority (higher priority first)
            const insertIndex = taskQueue.findIndex(task => task.scope.priority < priority);
            if (insertIndex === -1) {
                taskQueue.push(taskWrapper);
            } else {
                taskQueue.splice(insertIndex, 0, taskWrapper);
            }
            
            console.log(`  Added task ${taskId} to queue (priority: ${priority})`);
            return taskId;
        },
        
        // Execute tasks with controlled concurrency
        processTasks: async function(maxConcurrent = 3) {
            console.log(`  Processing tasks (max concurrent: ${maxConcurrent})`);
            
            const executing = [];
            
            while (taskQueue.length > 0 || executing.length > 0) {
                // Start new tasks up to concurrency limit
                while (executing.length < maxConcurrent && taskQueue.length > 0) {
                    const taskWrapper = taskQueue.shift();
                    const taskScope = taskWrapper.scope;
                    
                    runningTasks.set(taskScope.id, taskScope);
                    
                    // Create promise with timeout handling
                    const taskPromise = Promise.race([
                        taskWrapper.execute(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Task timeout')), taskScope.timeout)
                        )
                    ]).then(
                        (completedScope) => {
                            runningTasks.delete(completedScope.id);
                            completedTasks.push(completedScope);
                            return completedScope;
                        },
                        (failedScope) => {
                            runningTasks.delete(failedScope.id);
                            completedTasks.push(failedScope);
                            return failedScope;
                        }
                    );
                    
                    executing.push(taskPromise);
                }
                
                // Wait for at least one task to complete
                if (executing.length > 0) {
                    const completedTask = await Promise.race(executing);
                    const completedIndex = executing.findIndex(promise => 
                        promise === completedTask || promise._settledValue === completedTask
                    );
                    executing.splice(completedIndex, 1);
                }
            }
            
            console.log(`  All tasks processed. Completed: ${completedTasks.length}`);
        },
        
        // Get task statistics with scope information
        getTaskStats: function() {
            const stats = {
                queued: taskQueue.length,
                running: runningTasks.size,
                completed: completedTasks.length,
                successful: completedTasks.filter(task => task.status === 'completed').length,
                failed: completedTasks.filter(task => task.status === 'failed').length,
                runningDetails: Array.from(runningTasks.values()).map(task => ({
                    id: task.id,
                    status: task.status,
                    runtime: Date.now() - task.startTime
                }))
            };
            
            console.log('  Task stats:', stats);
            return stats;
        }
    };
}

// Using async task manager
const taskManager = createAsyncTaskManager();

// Define some sample async tasks
async function dataProcessingTask(data) {
    // Simulate async processing with preserved scope
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Access scope data safely
    const processed = {
        original: data,
        processed: data.value * 2,
        timestamp: Date.now(),
        taskId: this.id // 'this' refers to taskScope
    };
    
    return processed;
}

async function apiCallTask(data) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (Math.random() < 0.1) { // 10% chance of failure
        throw new Error('API call failed');
    }
    
    return {
        apiResponse: `Response for ${data.endpoint}`,
        status: 200,
        taskId: this.id
    };
}

// Add tasks with different priorities and data
taskManager.addTask(dataProcessingTask, { value: 10, type: 'number' }, { priority: 1 });
taskManager.addTask(dataProcessingTask, { value: 20, type: 'number' }, { priority: 3 });
taskManager.addTask(apiCallTask, { endpoint: '/users' }, { priority: 2 });
taskManager.addTask(apiCallTask, { endpoint: '/posts' }, { priority: 1 });
taskManager.addTask(dataProcessingTask, { value: 30, type: 'number' }, { priority: 1 });

// Process all tasks
taskManager.processTasks(2).then(() => {
    taskManager.getTaskStats();
});

// ============================================================================
// MEMORY MANAGEMENT WITH PROPER SCOPE CLEANUP
// ============================================================================

/**
 * Memory-Efficient Patterns with Scope Management:
 * 
 * Proper scope management prevents memory leaks by ensuring references
 * are cleaned up appropriately and closures don't retain unnecessary data.
 */

console.log('\n=== MEMORY MANAGEMENT WITH SCOPE CLEANUP ===\n');

function createMemoryEfficientCache() {
    console.log('4. Memory-Efficient Cache with Scope Cleanup:');
    
    // Private cache state with weak references where possible
    let cache = new Map();
    let accessTimes = new Map();
    let cleanupTimers = new Map();
    
    // Configuration with proper defaults
    const config = {
        maxSize: 100,
        ttl: 5 * 60 * 1000, // 5 minutes
        cleanupInterval: 60 * 1000 // 1 minute
    };
    
    // Cleanup function that properly releases references
    function cleanupExpiredEntries() {
        const now = Date.now();
        const expiredKeys = [];
        
        // Find expired entries
        for (const [key, accessTime] of accessTimes) {
            if (now - accessTime > config.ttl) {
                expiredKeys.push(key);
            }
        }
        
        // Remove expired entries and clean up references
        expiredKeys.forEach(key => {
            // Clear any pending timers for this key
            if (cleanupTimers.has(key)) {
                clearTimeout(cleanupTimers.get(key));
                cleanupTimers.delete(key);
            }
            
            // Remove from cache and access times
            cache.delete(key);
            accessTimes.delete(key);
            
            console.log(`    Cleaned up expired cache entry: ${key}`);
        });
        
        return expiredKeys.length;
    }
    
    // LRU eviction when cache is full
    function evictLRUEntries(count = 1) {
        if (cache.size === 0) return 0;
        
        // Sort by access time (oldest first)
        const entries = Array.from(accessTimes.entries())
            .sort((a, b) => a[1] - b[1])
            .slice(0, count);
        
        entries.forEach(([key]) => {
            cache.delete(key);
            accessTimes.delete(key);
            
            if (cleanupTimers.has(key)) {
                clearTimeout(cleanupTimers.get(key));
                cleanupTimers.delete(key);
            }
            
            console.log(`    Evicted LRU cache entry: ${key}`);
        });
        
        return entries.length;
    }
    
    // Start automatic cleanup
    const cleanupInterval = setInterval(cleanupExpiredEntries, config.cleanupInterval);
    
    return {
        set: function(key, value, customTTL = null) {
            const ttl = customTTL || config.ttl;
            const now = Date.now();
            
            // Evict entries if cache is full
            if (cache.size >= config.maxSize && !cache.has(key)) {
                evictLRUEntries(Math.ceil(config.maxSize * 0.1)); // Evict 10% of cache
            }
            
            // Store value and track access
            cache.set(key, value);
            accessTimes.set(key, now);
            
            // Set up individual cleanup timer for this entry
            if (cleanupTimers.has(key)) {
                clearTimeout(cleanupTimers.get(key));
            }
            
            const cleanupTimer = setTimeout(() => {
                if (cache.has(key)) {
                    cache.delete(key);
                    accessTimes.delete(key);
                    cleanupTimers.delete(key);
                    console.log(`    Auto-expired cache entry: ${key}`);
                }
            }, ttl);
            
            cleanupTimers.set(key, cleanupTimer);
            
            console.log(`  Cache set: ${key} (TTL: ${ttl}ms)`);
            return this;
        },
        
        get: function(key) {
            if (!cache.has(key)) {
                return undefined;
            }
            
            // Update access time for LRU
            accessTimes.set(key, Date.now());
            
            const value = cache.get(key);
            console.log(`  Cache hit: ${key}`);
            return value;
        },
        
        delete: function(key) {
            const existed = cache.has(key);
            
            if (existed) {
                cache.delete(key);
                accessTimes.delete(key);
                
                if (cleanupTimers.has(key)) {
                    clearTimeout(cleanupTimers.get(key));
                    cleanupTimers.delete(key);
                }
                
                console.log(`  Cache deleted: ${key}`);
            }
            
            return existed;
        },
        
        clear: function() {
            // Clean up all timers to prevent memory leaks
            for (const timer of cleanupTimers.values()) {
                clearTimeout(timer);
            }
            
            const size = cache.size;
            cache.clear();
            accessTimes.clear();
            cleanupTimers.clear();
            
            console.log(`  Cache cleared: ${size} entries removed`);
        },
        
        getStats: function() {
            // Trigger cleanup to get accurate stats
            const expiredCount = cleanupExpiredEntries();
            
            return {
                size: cache.size,
                maxSize: config.maxSize,
                expiredCount,
                oldestAccess: Math.min(...accessTimes.values()),
                newestAccess: Math.max(...accessTimes.values()),
                utilizationPercent: Math.round((cache.size / config.maxSize) * 100)
            };
        },
        
        // Important: cleanup method to prevent memory leaks
        destroy: function() {
            // Clear automatic cleanup interval
            clearInterval(cleanupInterval);
            
            // Clear all individual timers
            for (const timer of cleanupTimers.values()) {
                clearTimeout(timer);
            }
            
            // Clear all data structures
            cache.clear();
            accessTimes.clear();
            cleanupTimers.clear();
            
            console.log('  Cache destroyed and all resources cleaned up');
        }
    };
}

// Using memory-efficient cache
const cache = createMemoryEfficientCache();

// Add some data
cache.set('user_123', { name: 'John', preferences: { theme: 'dark' } });
cache.set('config_app', { version: '1.0', features: ['auth', 'cache'] });
cache.set('temp_data', { timestamp: Date.now() }, 2000); // Custom 2-second TTL

// Access data
console.log('Retrieved user:', cache.get('user_123'));
console.log('Retrieved config:', cache.get('config_app'));

// Check stats
setTimeout(() => {
    console.log('Cache stats:', cache.getStats());
    
    // Important: cleanup when done to prevent memory leaks
    cache.destroy();
}, 3000);

// Export practical utilities for production use
module.exports = {
    ConfigManager,
    createAdvancedEventManager,
    createAsyncTaskManager,
    createMemoryEfficientCache,
    
    // Utility functions for scope management
    createScopedCallback: function(callback, context) {
        return function(...args) {
            return callback.apply(context, args);
        };
    },
    
    debounceWithScope: function(func, delay, context) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context || this, args), delay);
        };
    },
    
    throttleWithScope: function(func, limit, context) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(context || this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};