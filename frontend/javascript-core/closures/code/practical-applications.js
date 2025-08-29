/**
 * File: practical-applications.js
 * Topic: Practical Applications of Closures
 * 
 * This file demonstrates real-world applications where closures solve
 * common development problems and enable powerful design patterns.
 * Each example includes production-ready code with extensive commenting.
 * Focus: Real-world solutions, production patterns, and practical implementations
 */

// ============================================================================
// MODULE PATTERN WITH CLOSURES
// ============================================================================

/**
 * Module Pattern Implementation:
 * 
 * The module pattern uses closures to create private variables and methods
 * while exposing a public API. This pattern was essential before ES6 modules
 * and is still useful for creating self-contained components.
 */

console.log('=== PRACTICAL CLOSURE APPLICATIONS ===\n');

function demonstrateModulePattern() {
    console.log('1. Module Pattern with Private State:');
    
    // Advanced module pattern with multiple features
    const UserManager = (function() {
        // Private variables (only accessible within this closure)
        let users = new Map();
        let currentUserId = 0;
        const adminUsers = new Set();
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes
        const activeSessions = new Map();
        
        // Private helper functions
        function generateUserId() {
            return ++currentUserId;
        }
        
        function validateUserData(userData) {
            const { username, email, password } = userData;
            const errors = [];
            
            if (!username || username.length < 3) {
                errors.push('Username must be at least 3 characters');
            }
            
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                errors.push('Valid email is required');
            }
            
            if (!password || password.length < 8) {
                errors.push('Password must be at least 8 characters');
            }
            
            return errors;
        }
        
        function hashPassword(password) {
            // Simple hash simulation (use proper hashing in production)
            let hash = 0;
            for (let i = 0; i < password.length; i++) {
                const char = password.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(36);
        }
        
        function createSession(userId) {
            const sessionId = Math.random().toString(36).substr(2, 9);
            const expiryTime = Date.now() + sessionTimeout;
            
            activeSessions.set(sessionId, {
                userId: userId,
                createdAt: Date.now(),
                expiresAt: expiryTime,
                lastActivity: Date.now()
            });
            
            // Auto-cleanup expired session
            setTimeout(() => {
                if (activeSessions.has(sessionId)) {
                    activeSessions.delete(sessionId);
                    console.log(`    Session ${sessionId} expired and removed`);
                }
            }, sessionTimeout);
            
            return sessionId;
        }
        
        function cleanupExpiredSessions() {
            const now = Date.now();
            const expiredSessions = [];
            
            for (const [sessionId, session] of activeSessions) {
                if (session.expiresAt < now) {
                    expiredSessions.push(sessionId);
                }
            }
            
            expiredSessions.forEach(sessionId => {
                activeSessions.delete(sessionId);
            });
            
            return expiredSessions.length;
        }
        
        // Public API (returned object)
        return {
            // Create new user
            createUser: function(userData) {
                console.log('    Creating new user...');
                
                const validationErrors = validateUserData(userData);
                if (validationErrors.length > 0) {
                    console.error('    Validation failed:', validationErrors);
                    return { success: false, errors: validationErrors };
                }
                
                // Check if username already exists
                for (const [id, user] of users) {
                    if (user.username === userData.username) {
                        console.error('    Username already exists');
                        return { success: false, errors: ['Username already exists'] };
                    }
                }
                
                const userId = generateUserId();
                const user = {
                    id: userId,
                    username: userData.username,
                    email: userData.email,
                    passwordHash: hashPassword(userData.password),
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    loginCount: 0,
                    lastLogin: null
                };
                
                users.set(userId, user);
                console.log(`    User created: ${userData.username} (ID: ${userId})`);
                
                return { 
                    success: true, 
                    userId: userId,
                    username: userData.username
                };
            },
            
            // Authenticate user and create session
            login: function(username, password) {
                console.log(`    Login attempt for: ${username}`);
                
                // Find user by username
                let targetUser = null;
                for (const [id, user] of users) {
                    if (user.username === username && user.isActive) {
                        targetUser = user;
                        break;
                    }
                }
                
                if (!targetUser) {
                    console.log('    Login failed: User not found or inactive');
                    return { success: false, error: 'Invalid credentials' };
                }
                
                // Verify password
                const passwordHash = hashPassword(password);
                if (targetUser.passwordHash !== passwordHash) {
                    console.log('    Login failed: Incorrect password');
                    return { success: false, error: 'Invalid credentials' };
                }
                
                // Update user login info
                targetUser.loginCount++;
                targetUser.lastLogin = new Date().toISOString();
                
                // Create session
                const sessionId = createSession(targetUser.id);
                
                console.log(`    Login successful: ${username} (Session: ${sessionId})`);
                return {
                    success: true,
                    sessionId: sessionId,
                    user: {
                        id: targetUser.id,
                        username: targetUser.username,
                        email: targetUser.email
                    }
                };
            },
            
            // Validate session and extend if active
            validateSession: function(sessionId) {
                cleanupExpiredSessions();
                
                const session = activeSessions.get(sessionId);
                if (!session) {
                    return { valid: false, error: 'Session not found or expired' };
                }
                
                // Update last activity
                session.lastActivity = Date.now();
                
                const user = users.get(session.userId);
                console.log(`    Session validated for user: ${user?.username}`);
                
                return {
                    valid: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        isAdmin: adminUsers.has(user.id)
                    }
                };
            },
            
            // Logout and destroy session
            logout: function(sessionId) {
                const session = activeSessions.get(sessionId);
                if (session) {
                    const user = users.get(session.userId);
                    console.log(`    Logout: ${user?.username}`);
                    activeSessions.delete(sessionId);
                    return { success: true };
                }
                return { success: false, error: 'Session not found' };
            },
            
            // Admin functions
            makeAdmin: function(sessionId, targetUserId) {
                const sessionValidation = this.validateSession(sessionId);
                if (!sessionValidation.valid) {
                    return { success: false, error: 'Invalid session' };
                }
                
                // Check if current user is admin
                const currentUserId = activeSessions.get(sessionId).userId;
                if (!adminUsers.has(currentUserId)) {
                    console.log('    Admin action denied: Insufficient privileges');
                    return { success: false, error: 'Insufficient privileges' };
                }
                
                if (users.has(targetUserId)) {
                    adminUsers.add(targetUserId);
                    const targetUser = users.get(targetUserId);
                    console.log(`    User ${targetUser.username} promoted to admin`);
                    return { success: true };
                }
                
                return { success: false, error: 'User not found' };
            },
            
            // Statistics (read-only access to private data)
            getStats: function() {
                cleanupExpiredSessions();
                
                const stats = {
                    totalUsers: users.size,
                    activeUsers: Array.from(users.values()).filter(u => u.isActive).length,
                    adminUsers: adminUsers.size,
                    activeSessions: activeSessions.size,
                    totalLogins: Array.from(users.values()).reduce((sum, u) => sum + u.loginCount, 0)
                };
                
                console.log('    System stats:', stats);
                return stats;
            }
        };
    })(); // IIFE creates the module immediately
    
    // Using the UserManager module
    console.log('  Testing UserManager module:');
    
    // Create users
    const user1 = UserManager.createUser({
        username: 'alice',
        email: 'alice@example.com',
        password: 'securepass123'
    });
    
    const user2 = UserManager.createUser({
        username: 'bob',
        email: 'bob@example.com', 
        password: 'strongpass456'
    });
    
    // Login and get session
    const aliceLogin = UserManager.login('alice', 'securepass123');
    if (aliceLogin.success) {
        // Validate session
        const sessionCheck = UserManager.validateSession(aliceLogin.sessionId);
        console.log('    Session valid:', sessionCheck.valid);
        
        // Make alice admin (this will fail since alice isn't admin yet)
        UserManager.makeAdmin(aliceLogin.sessionId, user2.userId);
        
        // Get system stats
        UserManager.getStats();
        
        // Logout
        UserManager.logout(aliceLogin.sessionId);
    }
    
    /**
     * Module Pattern Benefits:
     * 1. True privacy - private variables cannot be accessed externally
     * 2. Controlled API - only intended methods are exposed
     * 3. State encapsulation - module state is self-contained
     * 4. Namespace protection - no global variable pollution
     * 5. Singleton pattern - single instance with shared state
     */
}

demonstrateModulePattern();

// ============================================================================
// EVENT SYSTEM WITH CLOSURE-BASED HANDLERS
// ============================================================================

/**
 * Event System Using Closures:
 * 
 * Closures enable sophisticated event handling patterns with private state,
 * automatic cleanup, and context preservation across async operations.
 */

console.log('\n=== EVENT SYSTEM WITH CLOSURES ===\n');

function demonstrateEventSystem() {
    console.log('2. Advanced Event System:');
    
    // Event emitter with closure-based handlers
    function createAdvancedEventEmitter() {
        // Private state
        const eventListeners = new Map();
        const onceListeners = new Set();
        const eventHistory = [];
        const maxHistorySize = 1000;
        let isDestroyed = false;
        
        // Private helper functions
        function addToHistory(eventType, data, timestamp) {
            eventHistory.push({ eventType, data, timestamp });
            
            // Maintain history size limit
            if (eventHistory.length > maxHistorySize) {
                eventHistory.shift();
            }
        }
        
        function validateEventType(eventType) {
            if (typeof eventType !== 'string' || eventType.trim() === '') {
                throw new Error('Event type must be a non-empty string');
            }
        }
        
        function createWrappedListener(originalListener, context, options) {
            const { once = false, timeout = null, filter = null } = options;
            
            return function wrappedListener(data) {
                if (isDestroyed) {
                    console.warn('    Event emitter has been destroyed');
                    return;
                }
                
                // Apply filter if provided
                if (filter && !filter(data)) {
                    console.log('    Event filtered out by listener filter');
                    return;
                }
                
                try {
                    // Call original listener with proper context
                    const result = context ? 
                        originalListener.call(context, data) : 
                        originalListener(data);
                    
                    // Remove listener if it was a 'once' listener
                    if (once) {
                        // Find and remove this listener
                        for (const [eventType, listeners] of eventListeners) {
                            const index = listeners.indexOf(wrappedListener);
                            if (index !== -1) {
                                listeners.splice(index, 1);
                                onceListeners.delete(wrappedListener);
                                console.log(`    Removed 'once' listener for ${eventType}`);
                                break;
                            }
                        }
                    }
                    
                    return result;
                    
                } catch (error) {
                    console.error('    Error in event listener:', error.message);
                }
            };
        }
        
        // Public API
        return {
            // Add event listener with options
            on: function(eventType, listener, options = {}) {
                validateEventType(eventType);
                
                if (!eventListeners.has(eventType)) {
                    eventListeners.set(eventType, []);
                }
                
                const wrappedListener = createWrappedListener(listener, options.context, options);
                
                // Set up timeout removal if specified
                if (options.timeout) {
                    setTimeout(() => {
                        this.off(eventType, wrappedListener);
                        console.log(`    Listener for '${eventType}' removed due to timeout`);
                    }, options.timeout);
                }
                
                // Track 'once' listeners for cleanup
                if (options.once) {
                    onceListeners.add(wrappedListener);
                }
                
                eventListeners.get(eventType).push(wrappedListener);
                console.log(`    Added listener for '${eventType}'`);
                
                return wrappedListener; // Return for potential removal
            },
            
            // Remove specific listener
            off: function(eventType, listener) {
                if (!eventListeners.has(eventType)) {
                    return false;
                }
                
                const listeners = eventListeners.get(eventType);
                const index = listeners.indexOf(listener);
                
                if (index !== -1) {
                    listeners.splice(index, 1);
                    onceListeners.delete(listener);
                    console.log(`    Removed listener for '${eventType}'`);
                    
                    // Clean up empty event type
                    if (listeners.length === 0) {
                        eventListeners.delete(eventType);
                    }
                    
                    return true;
                }
                
                return false;
            },
            
            // Remove all listeners for event type
            removeAllListeners: function(eventType) {
                if (eventType) {
                    const listeners = eventListeners.get(eventType);
                    if (listeners) {
                        listeners.forEach(listener => onceListeners.delete(listener));
                        eventListeners.delete(eventType);
                        console.log(`    Removed all listeners for '${eventType}'`);
                        return listeners.length;
                    }
                    return 0;
                } else {
                    // Remove all listeners for all events
                    let totalRemoved = 0;
                    for (const [eventType, listeners] of eventListeners) {
                        totalRemoved += listeners.length;
                        listeners.forEach(listener => onceListeners.delete(listener));
                    }
                    eventListeners.clear();
                    console.log(`    Removed all listeners (${totalRemoved} total)`);
                    return totalRemoved;
                }
            },
            
            // Emit event to all listeners
            emit: function(eventType, data) {
                validateEventType(eventType);
                
                const timestamp = Date.now();
                addToHistory(eventType, data, timestamp);
                
                if (!eventListeners.has(eventType)) {
                    console.log(`    No listeners for event '${eventType}'`);
                    return 0;
                }
                
                const listeners = [...eventListeners.get(eventType)]; // Copy to prevent modification during iteration
                console.log(`    Emitting '${eventType}' to ${listeners.length} listeners`);
                
                let successCount = 0;
                listeners.forEach((listener, index) => {
                    try {
                        listener(data);
                        successCount++;
                    } catch (error) {
                        console.error(`    Listener ${index} failed:`, error.message);
                    }
                });
                
                return successCount;
            },
            
            // Emit event asynchronously
            emitAsync: async function(eventType, data) {
                validateEventType(eventType);
                
                const timestamp = Date.now();
                addToHistory(eventType, data, timestamp);
                
                if (!eventListeners.has(eventType)) {
                    console.log(`    No listeners for async event '${eventType}'`);
                    return [];
                }
                
                const listeners = [...eventListeners.get(eventType)];
                console.log(`    Emitting async '${eventType}' to ${listeners.length} listeners`);
                
                const results = await Promise.allSettled(
                    listeners.map(async (listener, index) => {
                        try {
                            return await Promise.resolve(listener(data));
                        } catch (error) {
                            console.error(`    Async listener ${index} failed:`, error.message);
                            throw error;
                        }
                    })
                );
                
                const successful = results.filter(r => r.status === 'fulfilled').length;
                console.log(`    Async emission completed: ${successful}/${listeners.length} successful`);
                
                return results;
            },
            
            // Get event statistics
            getStats: function() {
                const stats = {
                    totalEvents: eventListeners.size,
                    totalListeners: Array.from(eventListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0),
                    onceListeners: onceListeners.size,
                    historySize: eventHistory.length,
                    events: Array.from(eventListeners.keys()),
                    destroyed: isDestroyed
                };
                
                return stats;
            },
            
            // Get event history with optional filtering
            getHistory: function(eventType = null, limit = 100) {
                let history = eventHistory;
                
                if (eventType) {
                    history = history.filter(event => event.eventType === eventType);
                }
                
                return history.slice(-limit); // Return most recent events
            },
            
            // Cleanup and destroy emitter
            destroy: function() {
                const stats = this.getStats();
                
                this.removeAllListeners();
                eventHistory.length = 0;
                isDestroyed = true;
                
                console.log(`    Event emitter destroyed (had ${stats.totalListeners} listeners)`);
            }
        };
    }
    
    // Create and test event emitter
    const emitter = createAdvancedEventEmitter();
    
    // Create event handlers with different closure contexts
    function createUserActivityHandler(userId) {
        // Closure captures userId
        return function(activityData) {
            console.log(`      User ${userId} activity: ${activityData.action} at ${new Date().toLocaleTimeString()}`);
            
            // Simulate processing activity
            return {
                userId: userId,
                processedAt: Date.now(),
                action: activityData.action
            };
        };
    }
    
    function createAnalyticsHandler(analyticsId) {
        let eventCount = 0; // Private counter in closure
        
        return function(data) {
            eventCount++;
            console.log(`      Analytics ${analyticsId}: Event #${eventCount} - ${JSON.stringify(data)}`);
            return { analyticsId, eventCount, data };
        };
    }
    
    // Add various listeners
    const user1Handler = emitter.on('user_activity', createUserActivityHandler('user_123'));
    const analyticsHandler = emitter.on('user_activity', createAnalyticsHandler('analytics_1'));
    
    // Add a 'once' listener
    emitter.on('system_shutdown', function(data) {
        console.log(`      System shutting down: ${data.reason}`);
    }, { once: true });
    
    // Add filtered listener
    emitter.on('user_activity', function(data) {
        console.log(`      High-priority activity: ${data.action}`);
    }, { 
        filter: (data) => data.priority === 'high'
    });
    
    // Test event emission
    console.log('  Testing event system:');
    emitter.emit('user_activity', { action: 'login', priority: 'normal' });
    emitter.emit('user_activity', { action: 'purchase', priority: 'high' });
    emitter.emit('system_shutdown', { reason: 'maintenance' });
    emitter.emit('system_shutdown', { reason: 'emergency' }); // Won't trigger 'once' listener
    
    // Show statistics
    console.log('  Event system stats:', emitter.getStats());
    
    // Cleanup
    setTimeout(() => {
        emitter.destroy();
    }, 100);
    
    /**
     * Event System Benefits:
     * 1. Closure-based handlers maintain private state
     * 2. Automatic cleanup prevents memory leaks
     * 3. Context preservation across async operations
     * 4. Flexible listener management with options
     * 5. Event history and analytics capabilities
     */
}

demonstrateEventSystem();

// ============================================================================
// CONFIGURATION AND FACTORY PATTERNS
// ============================================================================

/**
 * Configuration Factory with Closures:
 * 
 * Closures enable powerful factory patterns that create configured objects
 * with private state and specialized behavior based on initialization parameters.
 */

console.log('\n=== CONFIGURATION FACTORY PATTERNS ===\n');

function demonstrateFactoryPatterns() {
    console.log('3. Configuration Factory Patterns:');
    
    // Advanced API client factory
    function createAPIClientFactory() {
        // Shared configuration and utilities
        const defaultConfig = {
            timeout: 5000,
            retries: 3,
            retryDelay: 1000,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const activeClients = new Set();
        const requestInterceptors = [];
        const responseInterceptors = [];
        
        // Private utility functions
        function mergeConfig(base, override) {
            return {
                ...base,
                ...override,
                headers: {
                    ...base.headers,
                    ...override.headers
                }
            };
        }
        
        async function executeRequest(config, requestData) {
            // Apply request interceptors
            let processedData = requestData;
            for (const interceptor of requestInterceptors) {
                processedData = await interceptor(processedData, config);
            }
            
            // Simulate HTTP request
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            
            let response = {
                status: 200,
                data: processedData,
                headers: { 'Content-Type': 'application/json' },
                config: config
            };
            
            // Apply response interceptors
            for (const interceptor of responseInterceptors) {
                response = await interceptor(response);
            }
            
            return response;
        }
        
        // Factory function that returns configured API client
        return function createAPIClient(clientConfig = {}) {
            const config = mergeConfig(defaultConfig, clientConfig);
            
            // Private client state
            let requestCount = 0;
            const requestHistory = [];
            const maxHistorySize = 100;
            
            // Private methods
            function logRequest(method, url, data) {
                requestCount++;
                const logEntry = {
                    id: requestCount,
                    method,
                    url,
                    data,
                    timestamp: Date.now(),
                    config: { ...config }
                };
                
                requestHistory.push(logEntry);
                if (requestHistory.length > maxHistorySize) {
                    requestHistory.shift();
                }
                
                console.log(`      API Request #${requestCount}: ${method} ${url}`);
                return logEntry;
            }
            
            function withRetry(requestFn, maxRetries = config.retries) {
                return async function(...args) {
                    let lastError;
                    
                    for (let attempt = 0; attempt <= maxRetries; attempt++) {
                        try {
                            return await requestFn.apply(this, args);
                        } catch (error) {
                            lastError = error;
                            
                            if (attempt < maxRetries) {
                                console.log(`      Retry attempt ${attempt + 1}/${maxRetries}`);
                                await new Promise(resolve => 
                                    setTimeout(resolve, config.retryDelay * Math.pow(2, attempt))
                                );
                            }
                        }
                    }
                    
                    throw lastError;
                };
            }
            
            // Create API client instance
            const apiClient = {
                // HTTP methods
                get: async function(url, params = {}) {
                    const logEntry = logRequest('GET', url, params);
                    
                    try {
                        const response = await executeRequest(config, { url, params, method: 'GET' });
                        console.log(`        GET ${url} - Success (${response.status})`);
                        return response;
                    } catch (error) {
                        console.error(`        GET ${url} - Error:`, error.message);
                        throw error;
                    }
                },
                
                post: withRetry(async function(url, data = {}) {
                    const logEntry = logRequest('POST', url, data);
                    
                    const response = await executeRequest(config, { url, data, method: 'POST' });
                    console.log(`        POST ${url} - Success (${response.status})`);
                    return response;
                }),
                
                put: withRetry(async function(url, data = {}) {
                    const logEntry = logRequest('PUT', url, data);
                    
                    const response = await executeRequest(config, { url, data, method: 'PUT' });
                    console.log(`        PUT ${url} - Success (${response.status})`);
                    return response;
                }),
                
                // Configuration methods
                setHeader: function(key, value) {
                    config.headers[key] = value;
                    console.log(`      Set header: ${key} = ${value}`);
                    return this;
                },
                
                setTimeout: function(timeout) {
                    config.timeout = timeout;
                    console.log(`      Set timeout: ${timeout}ms`);
                    return this;
                },
                
                // Monitoring methods
                getStats: function() {
                    return {
                        requestCount: requestCount,
                        historySize: requestHistory.length,
                        config: { ...config },
                        lastRequest: requestHistory[requestHistory.length - 1] || null
                    };
                },
                
                getHistory: function(limit = 10) {
                    return requestHistory.slice(-limit);
                },
                
                // Cleanup
                destroy: function() {
                    activeClients.delete(this);
                    requestHistory.length = 0;
                    console.log('      API client destroyed');
                }
            };
            
            // Register client for tracking
            activeClients.add(apiClient);
            console.log(`    Created API client with config:`, config);
            
            return apiClient;
        };
    }
    
    // Create the factory
    const createAPIClient = createAPIClientFactory();
    
    // Create different configured clients
    const adminClient = createAPIClient({
        timeout: 10000,
        headers: {
            'Authorization': 'Bearer admin-token',
            'X-Admin-Client': 'true'
        }
    });
    
    const userClient = createAPIClient({
        timeout: 3000,
        retries: 1,
        headers: {
            'Authorization': 'Bearer user-token'
        }
    });
    
    // Test the clients
    console.log('  Testing API clients:');
    
    async function testClients() {
        try {
            // Admin operations
            await adminClient.get('/admin/users');
            await adminClient.post('/admin/settings', { theme: 'dark' });
            
            // User operations
            await userClient.get('/user/profile');
            await userClient.put('/user/preferences', { notifications: true });
            
            // Show statistics
            console.log('  Admin client stats:', adminClient.getStats());
            console.log('  User client stats:', userClient.getStats());
            
        } catch (error) {
            console.error('  Client test error:', error.message);
        }
    }
    
    testClients();
    
    /**
     * Factory Pattern Benefits:
     * 1. Configured instances with specialized behavior
     * 2. Shared utilities and interceptors across instances
     * 3. Private state per instance with closure encapsulation
     * 4. Easy testing with mockable configurations
     * 5. Consistent API across different configurations
     */
}

demonstrateFactoryPatterns();

// Export practical application utilities for production use
module.exports = {
    // Module pattern creator
    createModule: function(initFn) {
        return (function() {
            const privateScope = {};
            return initFn.call(privateScope, privateScope);
        })();
    },
    
    // Event emitter factory
    createEventEmitter: function() {
        const listeners = new Map();
        
        return {
            on: (event, callback) => {
                if (!listeners.has(event)) {
                    listeners.set(event, []);
                }
                listeners.get(event).push(callback);
            },
            
            emit: (event, data) => {
                if (listeners.has(event)) {
                    listeners.get(event).forEach(callback => callback(data));
                }
            },
            
            off: (event, callback) => {
                if (listeners.has(event)) {
                    const callbacks = listeners.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index !== -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };
    },
    
    // Configuration manager
    createConfigManager: function(defaults = {}) {
        let config = { ...defaults };
        const listeners = [];
        
        return {
            get: (key) => key ? config[key] : { ...config },
            
            set: (key, value) => {
                const oldValue = config[key];
                config[key] = value;
                
                listeners.forEach(listener => {
                    listener(key, value, oldValue);
                });
            },
            
            onChange: (callback) => {
                listeners.push(callback);
                return () => {
                    const index = listeners.indexOf(callback);
                    if (index !== -1) listeners.splice(index, 1);
                };
            }
        };
    },
    
    // Cache factory with closure
    createCache: function(maxSize = 100) {
        const cache = new Map();
        const accessOrder = [];
        
        return {
            get: (key) => {
                if (cache.has(key)) {
                    // Update access order for LRU
                    const index = accessOrder.indexOf(key);
                    if (index !== -1) {
                        accessOrder.splice(index, 1);
                    }
                    accessOrder.push(key);
                    return cache.get(key);
                }
                return undefined;
            },
            
            set: (key, value) => {
                if (cache.size >= maxSize && !cache.has(key)) {
                    // Remove least recently used
                    const lru = accessOrder.shift();
                    cache.delete(lru);
                }
                
                cache.set(key, value);
                
                const index = accessOrder.indexOf(key);
                if (index !== -1) {
                    accessOrder.splice(index, 1);
                }
                accessOrder.push(key);
            },
            
            clear: () => {
                cache.clear();
                accessOrder.length = 0;
            },
            
            size: () => cache.size
        };
    }
};