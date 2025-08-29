/**
 * File: advanced-patterns.js
 * Topic: Advanced Proxy and Reflect Patterns
 * 
 * This file explores sophisticated proxy patterns including virtual properties,
 * method interception, observable objects, and complex meta-programming techniques
 * used in modern JavaScript frameworks and libraries.
 * Focus: Advanced proxy patterns, performance considerations, and real-world applications
 */

// ============================================================================
// VIRTUAL PROPERTIES AND COMPUTED VALUES
// ============================================================================

/**
 * Virtual Properties Mental Model:
 * 
 * Virtual properties don't exist on the target object but are computed
 * dynamically when accessed. This enables:
 * - Computed properties based on other values
 * - API-like interfaces over data
 * - Dynamic property generation
 * - Memory-efficient data access patterns
 */

console.log('=== ADVANCED PROXY AND REFLECT PATTERNS ===\n');

function demonstrateVirtualProperties() {
    console.log('1. Virtual Properties and Computed Values:');
    
    // User data object with virtual computed properties
    const userData = {
        firstName: 'John',
        lastName: 'Doe',
        birthYear: 1990,
        email: 'john.doe@example.com'
    };
    
    // Proxy with virtual properties
    const userWithVirtuals = new Proxy(userData, {
        get(target, prop, receiver) {
            console.log(`    Accessing property: ${String(prop)}`);
            
            // Virtual property: fullName
            if (prop === 'fullName') {
                const fullName = `${target.firstName} ${target.lastName}`;
                console.log(`      Computed fullName: ${fullName}`);
                return fullName;
            }
            
            // Virtual property: age (computed from birthYear)
            if (prop === 'age') {
                const age = new Date().getFullYear() - target.birthYear;
                console.log(`      Computed age: ${age}`);
                return age;
            }
            
            // Virtual property: initials
            if (prop === 'initials') {
                const initials = `${target.firstName[0]}${target.lastName[0]}`;
                console.log(`      Computed initials: ${initials}`);
                return initials;
            }
            
            // Virtual property: emailDomain
            if (prop === 'emailDomain') {
                const domain = target.email.split('@')[1] || '';
                console.log(`      Computed emailDomain: ${domain}`);
                return domain;
            }
            
            // Virtual property: displayName (context-aware)
            if (prop === 'displayName') {
                // Could be influenced by external context
                const formal = target.lastName ? `${target.firstName} ${target.lastName}` : target.firstName;
                console.log(`      Computed displayName: ${formal}`);
                return formal;
            }
            
            // Return actual property or undefined for non-existent properties
            return Reflect.get(target, prop, receiver);
        },
        
        set(target, prop, value, receiver) {
            console.log(`    Setting property: ${String(prop)} = ${value}`);
            
            // Intercept virtual property assignments and map to real properties
            if (prop === 'fullName') {
                const parts = String(value).split(' ');
                if (parts.length >= 2) {
                    target.firstName = parts[0];
                    target.lastName = parts.slice(1).join(' ');
                    console.log(`      Virtual fullName set: updated firstName and lastName`);
                    return true;
                }
                return false;
            }
            
            // Intercept age setting and convert to birthYear
            if (prop === 'age') {
                const birthYear = new Date().getFullYear() - Number(value);
                target.birthYear = birthYear;
                console.log(`      Virtual age set: updated birthYear to ${birthYear}`);
                return true;
            }
            
            // Prevent setting other virtual properties directly
            if (['initials', 'emailDomain', 'displayName'].includes(prop)) {
                console.log(`      Cannot set computed property: ${String(prop)}`);
                return false;
            }
            
            // Default behavior for real properties
            return Reflect.set(target, prop, value, receiver);
        },
        
        has(target, prop) {
            // Virtual properties should appear to exist
            const virtualProps = ['fullName', 'age', 'initials', 'emailDomain', 'displayName'];
            if (virtualProps.includes(prop)) {
                return true;
            }
            
            return Reflect.has(target, prop);
        },
        
        ownKeys(target) {
            // Include virtual properties in enumeration
            const realKeys = Reflect.ownKeys(target);
            const virtualKeys = ['fullName', 'age', 'initials', 'emailDomain', 'displayName'];
            return [...realKeys, ...virtualKeys];
        },
        
        getOwnPropertyDescriptor(target, prop) {
            // Provide descriptors for virtual properties
            const virtualProps = ['fullName', 'age', 'initials', 'emailDomain', 'displayName'];
            if (virtualProps.includes(prop)) {
                return {
                    enumerable: true,
                    configurable: true,
                    // Virtual properties appear as getters
                    get: () => this.get(target, prop, this)
                };
            }
            
            return Reflect.getOwnPropertyDescriptor(target, prop);
        }
    });
    
    // Test virtual properties
    console.log('  Testing virtual properties:');
    
    // Read virtual properties
    console.log(`    Full name: ${userWithVirtuals.fullName}`);
    console.log(`    Age: ${userWithVirtuals.age}`);
    console.log(`    Initials: ${userWithVirtuals.initials}`);
    console.log(`    Email domain: ${userWithVirtuals.emailDomain}`);
    
    // Write to virtual properties
    userWithVirtuals.fullName = 'Jane Smith'; // Should update firstName and lastName
    userWithVirtuals.age = 35; // Should update birthYear
    
    console.log(`    After virtual updates - firstName: ${userData.firstName}, lastName: ${userData.lastName}`);
    console.log(`    After virtual updates - birthYear: ${userData.birthYear}`);
    
    // Test property existence
    console.log(`    Has fullName: ${'fullName' in userWithVirtuals}`);
    console.log(`    Has nonexistent: ${'nonexistent' in userWithVirtuals}`);
    
    // Test enumeration
    console.log(`    All keys: [${Object.keys(userWithVirtuals).join(', ')}]`);
    
    /**
     * Virtual Properties Benefits:
     * 1. Memory efficiency - computed on-demand, not stored
     * 2. Always up-to-date - based on current data
     * 3. API consistency - properties behave like regular properties
     * 4. Encapsulation - hide computation complexity
     * 5. Dynamic behavior - can change based on context
     * 
     * Use Cases:
     * - Computed fields in data models
     * - API response transformation
     * - Legacy data format compatibility
     * - Dynamic configuration objects
     */
}

demonstrateVirtualProperties();

// ============================================================================
// METHOD INTERCEPTION AND ENHANCEMENT
// ============================================================================

/**
 * Method Interception Patterns:
 * 
 * Proxy can intercept method calls to add:
 * - Logging and debugging
 * - Performance monitoring
 * - Input validation
 * - Caching and memoization
 * - Error handling and retry logic
 */

function demonstrateMethodInterception() {
    console.log('\n2. Method Interception and Enhancement:');
    
    // Service class with methods to intercept
    class DataService {
        constructor() {
            this.cache = new Map();
            this.callCount = 0;
        }
        
        fetchData(id) {
            this.callCount++;
            console.log(`      [ORIGINAL] fetchData called with id: ${id}`);
            
            // Simulate API call
            const data = {
                id: id,
                name: `Data item ${id}`,
                timestamp: Date.now()
            };
            
            return data;
        }
        
        saveData(data) {
            this.callCount++;
            console.log(`      [ORIGINAL] saveData called:`, data);
            
            // Simulate save operation
            return { success: true, id: data.id, saved: Date.now() };
        }
        
        deleteData(id) {
            this.callCount++;
            console.log(`      [ORIGINAL] deleteData called with id: ${id}`);
            
            // Simulate delete operation
            return { success: true, deleted: id };
        }
        
        getStats() {
            return { callCount: this.callCount, cacheSize: this.cache.size };
        }
    }
    
    const service = new DataService();
    
    // Enhanced service with method interception
    const enhancedService = new Proxy(service, {
        get(target, prop, receiver) {
            const originalValue = Reflect.get(target, prop, receiver);
            
            // Only intercept function properties (methods)
            if (typeof originalValue === 'function' && prop !== 'getStats') {
                console.log(`    Intercepting method call: ${String(prop)}`);
                
                // Return enhanced method
                return function(...args) {
                    const methodName = String(prop);
                    
                    // Pre-execution logging
                    console.log(`    [INTERCEPT] Before ${methodName}(${args.join(', ')})`);
                    const startTime = Date.now();
                    
                    // Input validation
                    if (methodName === 'fetchData' || methodName === 'deleteData') {
                        if (!args[0] || typeof args[0] !== 'string') {
                            console.log(`    [VALIDATION] ${methodName} requires a valid ID`);
                            throw new Error(`Invalid ID for ${methodName}`);
                        }
                    }
                    
                    // Caching for fetch operations
                    if (methodName === 'fetchData') {
                        const cacheKey = `fetch_${args[0]}`;
                        if (target.cache.has(cacheKey)) {
                            console.log(`    [CACHE] Cache hit for ${cacheKey}`);
                            const cachedResult = target.cache.get(cacheKey);
                            return cachedResult;
                        }
                    }
                    
                    try {
                        // Execute original method with proper this binding
                        const result = originalValue.apply(this, args);
                        
                        // Cache the result for fetch operations
                        if (methodName === 'fetchData') {
                            const cacheKey = `fetch_${args[0]}`;
                            target.cache.set(cacheKey, result);
                            console.log(`    [CACHE] Cached result for ${cacheKey}`);
                        }
                        
                        // Invalidate cache for save/delete operations
                        if (methodName === 'saveData' || methodName === 'deleteData') {
                            const relatedCacheKey = `fetch_${args[0] || result.id}`;
                            if (target.cache.has(relatedCacheKey)) {
                                target.cache.delete(relatedCacheKey);
                                console.log(`    [CACHE] Invalidated cache for ${relatedCacheKey}`);
                            }
                        }
                        
                        // Post-execution logging
                        const duration = Date.now() - startTime;
                        console.log(`    [INTERCEPT] After ${methodName}: completed in ${duration}ms`);
                        
                        return result;
                        
                    } catch (error) {
                        // Error handling and logging
                        const duration = Date.now() - startTime;
                        console.log(`    [ERROR] ${methodName} failed after ${duration}ms:`, error.message);
                        
                        // Could implement retry logic here
                        throw error;
                    }
                };
            }
            
            // Return non-function properties as-is
            return originalValue;
        }
    });
    
    // Test method interception
    console.log('  Testing method interception:');
    
    // First fetch - should hit original method and cache result
    const data1 = enhancedService.fetchData('user_1');
    console.log(`    Result 1:`, data1);
    
    // Second fetch - should hit cache
    const data2 = enhancedService.fetchData('user_1');
    console.log(`    Result 2 (cached):`, data2);
    
    // Save operation - should invalidate cache
    enhancedService.saveData({ id: 'user_1', name: 'Updated User' });
    
    // Third fetch - cache invalidated, should hit original method again
    const data3 = enhancedService.fetchData('user_1');
    console.log(`    Result 3 (after save):`, data3);
    
    // Delete operation
    enhancedService.deleteData('user_1');
    
    // Test validation error
    try {
        enhancedService.fetchData(null);
    } catch (error) {
        console.log(`    Validation error caught: ${error.message}`);
    }
    
    // Check final stats
    console.log('    Final service stats:', service.getStats());
    
    /**
     * Method Interception Benefits:
     * 1. Cross-cutting concerns - logging, caching, validation
     * 2. Non-invasive - no modification of original class
     * 3. Dynamic behavior - can be enabled/disabled at runtime
     * 4. Comprehensive - can intercept all method calls
     * 5. Composable - multiple proxies can be chained
     * 
     * Common Patterns:
     * - Performance monitoring
     * - Audit logging
     * - Input validation
     * - Caching and memoization
     * - Error handling and retries
     * - Rate limiting
     * - Authorization checks
     */
}

demonstrateMethodInterception();

// ============================================================================
// OBSERVABLE OBJECTS AND REACTIVITY
// ============================================================================

/**
 * Observable Objects Pattern:
 * 
 * Create reactive objects that notify observers when properties change.
 * This is the foundation of many modern frameworks' reactivity systems
 * (Vue.js, MobX, etc.)
 */

function demonstrateObservableObjects() {
    console.log('\n3. Observable Objects and Reactivity:');
    
    // Observer registry and notification system
    class ObservableManager {
        constructor() {
            this.observers = new Map(); // propertyPath -> Set of callbacks
            this.computedCache = new Map(); // propertyPath -> cached value
            this.dependencies = new Map(); // computed property -> Set of dependencies
        }
        
        // Register observer for a property path
        observe(propertyPath, callback) {
            if (!this.observers.has(propertyPath)) {
                this.observers.set(propertyPath, new Set());
            }
            
            this.observers.get(propertyPath).add(callback);
            console.log(`      Registered observer for: ${propertyPath}`);
            
            // Return unsubscribe function
            return () => {
                const observers = this.observers.get(propertyPath);
                if (observers) {
                    observers.delete(callback);
                    if (observers.size === 0) {
                        this.observers.delete(propertyPath);
                    }
                }
            };
        }
        
        // Notify all observers of a property change
        notify(propertyPath, newValue, oldValue, target) {
            console.log(`      Notifying observers of ${propertyPath}: ${oldValue} -> ${newValue}`);
            
            const observers = this.observers.get(propertyPath);
            if (observers) {
                observers.forEach(callback => {
                    try {
                        callback(newValue, oldValue, propertyPath, target);
                    } catch (error) {
                        console.error(`Observer callback error for ${propertyPath}:`, error);
                    }
                });
            }
            
            // Invalidate computed properties that depend on this property
            this.invalidateComputedProperties(propertyPath);
        }
        
        // Invalidate computed properties
        invalidateComputedProperties(changedPath) {
            for (const [computedPath, deps] of this.dependencies) {
                if (deps.has(changedPath)) {
                    this.computedCache.delete(computedPath);
                    console.log(`      Invalidated computed property: ${computedPath}`);
                    
                    // Notify computed property observers
                    const observers = this.observers.get(computedPath);
                    if (observers) {
                        // Recompute and notify
                        // In a real implementation, you'd trigger recomputation here
                        console.log(`      Would recompute: ${computedPath}`);
                    }
                }
            }
        }
        
        // Register computed property dependencies
        registerDependencies(computedPath, dependencies) {
            this.dependencies.set(computedPath, new Set(dependencies));
        }
    }
    
    // Create observable proxy factory
    function createObservable(target, manager = new ObservableManager()) {
        return new Proxy(target, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                
                // If the value is an object, make it observable too
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    // Create nested observable
                    return createObservable(value, manager);
                }
                
                return value;
            },
            
            set(target, prop, newValue, receiver) {
                const oldValue = target[prop];
                
                // Only notify if value actually changed
                if (oldValue !== newValue) {
                    const success = Reflect.set(target, prop, newValue, receiver);
                    
                    if (success) {
                        const propertyPath = String(prop);
                        manager.notify(propertyPath, newValue, oldValue, target);
                    }
                    
                    return success;
                }
                
                return true;
            }
        });
    }
    
    // Test observable objects
    console.log('  Testing observable objects:');
    
    const manager = new ObservableManager();
    
    // Create observable state object
    const state = createObservable({
        name: 'John',
        age: 30,
        preferences: {
            theme: 'dark',
            language: 'en'
        },
        todos: ['Learn Proxy', 'Build app']
    }, manager);
    
    // Register observers
    const unsubscribeName = manager.observe('name', (newVal, oldVal) => {
        console.log(`        Name changed: "${oldVal}" -> "${newVal}"`);
    });
    
    const unsubscribeAge = manager.observe('age', (newVal, oldVal) => {
        console.log(`        Age changed: ${oldVal} -> ${newVal}`);
        
        // Side effect: update age category
        if (newVal >= 18 && oldVal < 18) {
            console.log('        Status: Now an adult!');
        }
    });
    
    // Observer for nested property
    const unsubscribeTheme = manager.observe('theme', (newVal, oldVal) => {
        console.log(`        Theme changed: ${oldVal} -> ${newVal}`);
        console.log(`        Updating UI theme...`);
    });
    
    // Test property changes
    console.log('    Triggering property changes:');
    
    state.name = 'Jane'; // Should notify name observer
    state.age = 25; // Should notify age observer
    state.age = 25; // Should NOT notify (same value)
    state.preferences.theme = 'light'; // Should notify theme observer
    
    // Test array modifications
    state.todos.push('Master Observables'); // Note: Array methods need special handling
    console.log(`    Current todos: [${state.todos.join(', ')}]`);
    
    // Computed property simulation
    manager.observe('displayInfo', (newVal, oldVal) => {
        console.log(`        Display info updated: ${newVal}`);
    });
    
    // Register computed property dependencies
    manager.registerDependencies('displayInfo', ['name', 'age']);
    
    // Unsubscribe some observers
    unsubscribeName();
    console.log('    Unsubscribed name observer');
    
    // This change should not trigger name observer
    state.name = 'Bob';
    
    console.log('    Final state:', state);
    
    /**
     * Observable Objects Benefits:
     * 1. Automatic UI updates - changes trigger re-renders
     * 2. Computed properties - derived values update automatically
     * 3. Debugging - track all state changes
     * 4. Validation - validate changes before applying
     * 5. History - track change history for undo/redo
     * 
     * Framework Applications:
     * - Vue.js reactivity system
     * - MobX state management
     * - React state management libraries
     * - Form libraries with validation
     * - Real-time collaboration systems
     * 
     * Implementation Considerations:
     * - Nested object handling
     * - Array method interception
     * - Circular reference prevention
     * - Performance optimization
     * - Memory leak prevention
     */
}

demonstrateObservableObjects();

// Export advanced pattern utilities for production use
module.exports = {
    // Virtual property proxy factory
    createVirtualProxy: function(target, virtualProperties = {}) {
        return new Proxy(target, {
            get(target, prop, receiver) {
                if (prop in virtualProperties) {
                    return virtualProperties[prop].get ? 
                        virtualProperties[prop].get.call(target) : 
                        virtualProperties[prop];
                }
                return Reflect.get(target, prop, receiver);
            },
            
            set(target, prop, value, receiver) {
                if (prop in virtualProperties && virtualProperties[prop].set) {
                    return virtualProperties[prop].set.call(target, value);
                }
                return Reflect.set(target, prop, value, receiver);
            },
            
            has(target, prop) {
                return prop in virtualProperties || Reflect.has(target, prop);
            }
        });
    },
    
    // Method interceptor factory
    createMethodInterceptor: function(target, options = {}) {
        const { beforeCall, afterCall, onError, cache = false } = options;
        const methodCache = cache ? new Map() : null;
        
        return new Proxy(target, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                
                if (typeof value === 'function') {
                    return function(...args) {
                        if (beforeCall) beforeCall(prop, args);
                        
                        try {
                            // Check cache if enabled
                            if (methodCache) {
                                const cacheKey = `${String(prop)}_${JSON.stringify(args)}`;
                                if (methodCache.has(cacheKey)) {
                                    return methodCache.get(cacheKey);
                                }
                            }
                            
                            const result = value.apply(this, args);
                            
                            // Cache result if enabled
                            if (methodCache) {
                                const cacheKey = `${String(prop)}_${JSON.stringify(args)}`;
                                methodCache.set(cacheKey, result);
                            }
                            
                            if (afterCall) afterCall(prop, args, result);
                            return result;
                            
                        } catch (error) {
                            if (onError) onError(prop, args, error);
                            throw error;
                        }
                    };
                }
                
                return value;
            }
        });
    },
    
    // Simple observable factory
    createObservable: function(target, onChange) {
        const listeners = new Set();
        
        if (onChange) listeners.add(onChange);
        
        const proxy = new Proxy(target, {
            set(target, prop, value, receiver) {
                const oldValue = target[prop];
                const success = Reflect.set(target, prop, value, receiver);
                
                if (success && oldValue !== value) {
                    listeners.forEach(listener => {
                        try {
                            listener(prop, value, oldValue);
                        } catch (error) {
                            console.error('Observer error:', error);
                        }
                    });
                }
                
                return success;
            }
        });
        
        // Add methods to manage observers
        proxy.observe = (callback) => {
            listeners.add(callback);
            return () => listeners.delete(callback);
        };
        
        proxy.unobserveAll = () => {
            listeners.clear();
        };
        
        return proxy;
    },
    
    // Validation proxy factory
    createValidatingProxy: function(target, schema = {}) {
        return new Proxy(target, {
            set(target, prop, value, receiver) {
                const validator = schema[prop];
                
                if (validator) {
                    if (typeof validator === 'function') {
                        if (!validator(value)) {
                            throw new Error(`Validation failed for ${String(prop)}`);
                        }
                    } else if (typeof validator === 'string') {
                        if (typeof value !== validator) {
                            throw new Error(`Expected ${validator}, got ${typeof value} for ${String(prop)}`);
                        }
                    }
                }
                
                return Reflect.set(target, prop, value, receiver);
            }
        });
    }
};