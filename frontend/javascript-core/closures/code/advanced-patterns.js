/**
 * File: advanced-patterns.js
 * Topic: Advanced Closure Patterns and Techniques
 * 
 * This file explores sophisticated closure patterns used in professional
 * JavaScript development, including functional programming concepts, advanced
 * state management, and performance optimization techniques.
 * Focus: Professional patterns, functional programming, and optimization strategies
 */

// ============================================================================
// CURRYING AND PARTIAL APPLICATION WITH CLOSURES
// ============================================================================

/**
 * Currying Mental Model:
 * 
 * Currying transforms a function that takes multiple arguments into a series
 * of functions that each take a single argument. Each function returns another
 * function until all arguments are provided, then returns the final result.
 * 
 * Benefits:
 * - Function reusability and specialization
 * - Better composition and pipeline creation  
 * - Easier testing and debugging
 * - Functional programming paradigm support
 */

console.log('=== ADVANCED CLOSURE PATTERNS ===\n');

function demonstrateCurryingPatterns() {
    console.log('1. Currying and Partial Application:');
    
    // Manual currying implementation
    function createCurriedFunction(originalFunction, arity = originalFunction.length) {
        console.log(`  Creating curried version of function with arity ${arity}`);
        
        return function curried(...args) {
            // If we have enough arguments, execute the function
            if (args.length >= arity) {
                const result = originalFunction.apply(this, args);
                console.log(`    Final execution with args [${args}]: ${result}`);
                return result;
            }
            
            // Otherwise, return a new function that captures current arguments
            return function(...nextArgs) {
                const allArgs = [...args, ...nextArgs];
                console.log(`    Partial application: captured [${args}], received [${nextArgs}]`);
                return curried.apply(this, allArgs);
            };
        };
    }
    
    // Original function to curry
    function calculateTotal(tax, discount, shipping, price) {
        const subtotal = price - discount;
        const withTax = subtotal + (subtotal * tax);
        const total = withTax + shipping;
        return Math.round(total * 100) / 100;
    }
    
    // Create curried version
    const curriedCalculator = createCurriedFunction(calculateTotal);
    
    // Create specialized calculators through partial application
    const salesTaxCalculator = curriedCalculator(0.08); // 8% tax
    const salesTaxWithStandardDiscount = salesTaxCalculator(5.00); // $5 discount
    const standardShippingCalculator = salesTaxWithStandardDiscount(3.50); // $3.50 shipping
    
    // Now we can easily calculate totals for different prices
    console.log('  Specialized calculator results:');
    console.log(`    Price $100: $${standardShippingCalculator(100)}`);
    console.log(`    Price $50: $${standardShippingCalculator(50)}`);
    console.log(`    Price $25: $${standardShippingCalculator(25)}`);
    
    // Alternative: Create different specialized versions
    const premiumCalculator = curriedCalculator(0.10)(10.00)(0); // Premium tax, discount, free shipping
    const budgetCalculator = curriedCalculator(0.06)(0)(8.50); // Low tax, no discount, expensive shipping
    
    console.log('  Different configurations:');
    console.log(`    Premium calc for $100: $${premiumCalculator(100)}`);
    console.log(`    Budget calc for $100: $${budgetCalculator(100)}`);
    
    /**
     * Currying Benefits Demonstrated:
     * 1. Configuration reuse - set tax/discount/shipping once
     * 2. Function specialization - create purpose-specific calculators
     * 3. Easier testing - test each level of the curried function
     * 4. Better composition - curry enables function pipelines
     */
}

demonstrateCurryingPatterns();

// ============================================================================
// MEMOIZATION WITH CLOSURES
// ============================================================================

/**
 * Memoization Pattern:
 * 
 * Memoization caches function results to avoid expensive recalculations.
 * Closures are perfect for this because they can maintain private cache
 * state that persists across function calls.
 */

console.log('\n=== MEMOIZATION WITH CLOSURES ===\n');

function demonstrateMemoizationPatterns() {
    console.log('2. Advanced Memoization Patterns:');
    
    // Advanced memoization factory with customizable cache strategies
    function createMemoizedFunction(originalFunction, options = {}) {
        const {
            maxCacheSize = 100,
            ttl = null, // Time to live in milliseconds
            keyGenerator = (...args) => JSON.stringify(args),
            onCacheHit = null,
            onCacheMiss = null,
            onCacheEviction = null
        } = options;
        
        // Cache storage and metadata
        const cache = new Map();
        const accessTimes = new Map();
        const creationTimes = new Map();
        let hitCount = 0;
        let missCount = 0;
        
        console.log(`  Created memoized function with cache size ${maxCacheSize}, TTL: ${ttl}ms`);
        
        // Cache cleanup utility
        function cleanupExpiredEntries() {
            const now = Date.now();
            const expiredKeys = [];
            
            for (const [key, creationTime] of creationTimes) {
                if (ttl && (now - creationTime > ttl)) {
                    expiredKeys.push(key);
                }
            }
            
            expiredKeys.forEach(key => {
                cache.delete(key);
                accessTimes.delete(key);
                creationTimes.delete(key);
                
                if (onCacheEviction) {
                    onCacheEviction(key, 'expired');
                }
            });
            
            return expiredKeys.length;
        }
        
        // LRU eviction for cache size management
        function evictLRUEntries(count) {
            const entries = Array.from(accessTimes.entries())
                .sort((a, b) => a[1] - b[1]) // Sort by access time (oldest first)
                .slice(0, count);
            
            entries.forEach(([key]) => {
                cache.delete(key);
                accessTimes.delete(key);
                creationTimes.delete(key);
                
                if (onCacheEviction) {
                    onCacheEviction(key, 'lru');
                }
            });
        }
        
        // Main memoized function
        function memoizedFunction(...args) {
            const key = keyGenerator(...args);
            const now = Date.now();
            
            // Cleanup expired entries
            cleanupExpiredEntries();
            
            // Check if result is cached and not expired
            if (cache.has(key)) {
                accessTimes.set(key, now); // Update LRU
                hitCount++;
                
                const cachedResult = cache.get(key);
                console.log(`    Cache HIT for key: ${key.substring(0, 50)}...`);
                
                if (onCacheHit) {
                    onCacheHit(key, cachedResult);
                }
                
                return cachedResult;
            }
            
            // Cache miss - calculate result
            missCount++;
            console.log(`    Cache MISS for key: ${key.substring(0, 50)}...`);
            
            const result = originalFunction.apply(this, args);
            
            // Evict entries if cache is full
            if (cache.size >= maxCacheSize) {
                evictLRUEntries(Math.ceil(maxCacheSize * 0.1)); // Evict 10%
            }
            
            // Store result with metadata
            cache.set(key, result);
            accessTimes.set(key, now);
            creationTimes.set(key, now);
            
            if (onCacheMiss) {
                onCacheMiss(key, result);
            }
            
            return result;
        }
        
        // Add cache management methods
        memoizedFunction.cache = {
            clear: () => {
                const size = cache.size;
                cache.clear();
                accessTimes.clear();
                creationTimes.clear();
                hitCount = 0;
                missCount = 0;
                console.log(`    Cache cleared: ${size} entries removed`);
            },
            
            size: () => cache.size,
            
            stats: () => {
                const total = hitCount + missCount;
                return {
                    size: cache.size,
                    hits: hitCount,
                    misses: missCount,
                    hitRate: total > 0 ? (hitCount / total * 100).toFixed(1) + '%' : '0%',
                    expired: cleanupExpiredEntries()
                };
            },
            
            keys: () => Array.from(cache.keys()),
            
            delete: (key) => {
                const existed = cache.delete(key);
                accessTimes.delete(key);
                creationTimes.delete(key);
                return existed;
            }
        };
        
        return memoizedFunction;
    }
    
    // Expensive function to memoize: Fibonacci calculation
    function expensiveFibonacci(n) {
        console.log(`      Computing fibonacci(${n})`);
        if (n <= 1) return n;
        return expensiveFibonacci(n - 1) + expensiveFibonacci(n - 2);
    }
    
    // Create memoized version with logging
    const memoizedFib = createMemoizedFunction(expensiveFibonacci, {
        maxCacheSize: 50,
        ttl: 5000, // 5 second TTL
        onCacheHit: (key, result) => console.log(`      Using cached result: ${result}`),
        onCacheMiss: (key, result) => console.log(`      Cached new result: ${result}`)
    });
    
    // Test memoization performance
    console.log('  Testing memoized Fibonacci:');
    console.log(`    fib(10) = ${memoizedFib(10)}`);
    console.log(`    fib(10) = ${memoizedFib(10)}`); // Should be cached
    console.log(`    fib(12) = ${memoizedFib(12)}`); // Reuses cached fib(10)
    
    console.log('  Cache statistics:', memoizedFib.cache.stats());
}

demonstrateMemoizationPatterns();

// ============================================================================
// STATE MACHINES WITH CLOSURES
// ============================================================================

/**
 * State Machine Pattern with Closures:
 * 
 * Closures enable elegant state machine implementations by encapsulating
 * state and providing controlled state transitions through function composition.
 */

console.log('\n=== STATE MACHINES WITH CLOSURES ===\n');

function demonstrateStateMachinePattern() {
    console.log('3. State Machine Patterns:');
    
    // Advanced state machine factory
    function createStateMachine(initialState, stateDefinitions) {
        let currentState = initialState;
        const history = [initialState];
        const listeners = new Map();
        
        console.log(`  Created state machine with initial state: ${initialState}`);
        
        // State transition executor
        function executeTransition(fromState, toState, event, data) {
            // Execute exit action for current state
            const fromDefinition = stateDefinitions[fromState];
            if (fromDefinition?.onExit) {
                console.log(`    Executing exit action for ${fromState}`);
                fromDefinition.onExit(event, data);
            }
            
            // Update state
            const previousState = currentState;
            currentState = toState;
            history.push(toState);
            
            // Execute entry action for new state
            const toDefinition = stateDefinitions[toState];
            if (toDefinition?.onEntry) {
                console.log(`    Executing entry action for ${toState}`);
                toDefinition.onEntry(event, data);
            }
            
            // Notify listeners
            const eventData = {
                from: previousState,
                to: toState,
                event: event,
                data: data,
                timestamp: Date.now()
            };
            
            if (listeners.has('transition')) {
                listeners.get('transition').forEach(listener => listener(eventData));
            }
        }
        
        // Main state machine interface
        return {
            // Get current state
            getState: () => currentState,
            
            // Trigger event/transition
            trigger: function(event, data = null) {
                const stateDefinition = stateDefinitions[currentState];
                
                if (!stateDefinition) {
                    console.error(`    Unknown state: ${currentState}`);
                    return false;
                }
                
                const transitions = stateDefinition.transitions;
                if (!transitions || !transitions[event]) {
                    console.log(`    No transition for event '${event}' in state '${currentState}'`);
                    return false;
                }
                
                const transition = transitions[event];
                let targetState;
                
                // Handle conditional transitions
                if (typeof transition === 'function') {
                    targetState = transition(data);
                } else if (typeof transition === 'object' && transition.target) {
                    // Check guard condition if exists
                    if (transition.guard && !transition.guard(data)) {
                        console.log(`    Transition guard failed for ${event}`);
                        return false;
                    }
                    
                    // Execute transition action if exists
                    if (transition.action) {
                        transition.action(data);
                    }
                    
                    targetState = transition.target;
                } else {
                    targetState = transition;
                }
                
                if (targetState) {
                    console.log(`    Transitioning: ${currentState} --[${event}]--> ${targetState}`);
                    executeTransition(currentState, targetState, event, data);
                    return true;
                }
                
                return false;
            },
            
            // Add event listeners
            on: function(event, callback) {
                if (!listeners.has(event)) {
                    listeners.set(event, []);
                }
                listeners.get(event).push(callback);
            },
            
            // Get state history
            getHistory: () => [...history],
            
            // Check if state can handle event
            canTransition: function(event) {
                const stateDefinition = stateDefinitions[currentState];
                return !!(stateDefinition?.transitions?.[event]);
            },
            
            // Reset to initial state
            reset: function() {
                const previousState = currentState;
                currentState = initialState;
                history.length = 0;
                history.push(initialState);
                console.log(`    State machine reset from ${previousState} to ${initialState}`);
            }
        };
    }
    
    // Define a document approval workflow
    const documentStates = {
        draft: {
            onEntry: () => console.log('      Document is in draft mode'),
            onExit: () => console.log('      Leaving draft mode'),
            transitions: {
                submit: 'pending_review',
                delete: 'deleted'
            }
        },
        
        pending_review: {
            onEntry: () => console.log('      Document sent for review'),
            transitions: {
                approve: 'approved',
                reject: {
                    target: 'draft',
                    action: (data) => console.log(`      Rejected: ${data?.reason || 'No reason provided'}`)
                },
                request_changes: {
                    target: 'draft',
                    guard: (data) => data?.hasChanges === true,
                    action: (data) => console.log(`      Changes requested: ${data.changes}`)
                }
            }
        },
        
        approved: {
            onEntry: () => console.log('      Document approved!'),
            transitions: {
                publish: 'published',
                revoke: 'draft'
            }
        },
        
        published: {
            onEntry: () => console.log('      Document is now public'),
            transitions: {
                unpublish: 'approved',
                archive: 'archived'
            }
        },
        
        archived: {
            onEntry: () => console.log('      Document archived'),
            transitions: {
                restore: 'approved'
            }
        },
        
        deleted: {
            onEntry: () => console.log('      Document deleted'),
            transitions: {} // No transitions from deleted state
        }
    };
    
    // Create and test the state machine
    const docWorkflow = createStateMachine('draft', documentStates);
    
    // Add transition listener
    docWorkflow.on('transition', (eventData) => {
        console.log(`    Transition logged: ${eventData.from} -> ${eventData.to}`);
    });
    
    // Execute workflow
    console.log('  Document workflow demonstration:');
    docWorkflow.trigger('submit');
    docWorkflow.trigger('reject', { reason: 'Missing references' });
    docWorkflow.trigger('submit');
    docWorkflow.trigger('approve');
    docWorkflow.trigger('publish');
    
    console.log('  Final state:', docWorkflow.getState());
    console.log('  History:', docWorkflow.getHistory());
    
    /**
     * State Machine Benefits:
     * 1. Clear state representation and transitions
     * 2. Controlled state changes with validation
     * 3. Entry/exit actions for consistent behavior
     * 4. Event-driven architecture support
     * 5. Easy to test and debug state flows
     */
}

demonstrateStateMachinePattern();

// ============================================================================
// ADVANCED FUNCTION COMPOSITION
// ============================================================================

/**
 * Function Composition with Closures:
 * 
 * Closures enable powerful function composition patterns that allow
 * building complex operations from simple, reusable functions.
 */

console.log('\n=== ADVANCED FUNCTION COMPOSITION ===\n');

function demonstrateFunctionComposition() {
    console.log('4. Advanced Function Composition:');
    
    // Pipe function - left-to-right composition
    function pipe(...functions) {
        console.log(`  Created pipe with ${functions.length} functions`);
        
        return function(initialValue) {
            console.log(`    Starting pipe with value: ${initialValue}`);
            
            return functions.reduce((result, fn, index) => {
                const newResult = fn(result);
                console.log(`      Step ${index + 1} (${fn.name}): ${result} -> ${newResult}`);
                return newResult;
            }, initialValue);
        };
    }
    
    // Compose function - right-to-left composition
    function compose(...functions) {
        console.log(`  Created composition with ${functions.length} functions`);
        
        return function(initialValue) {
            console.log(`    Starting composition with value: ${initialValue}`);
            
            return functions.reduceRight((result, fn, index) => {
                const newResult = fn(result);
                console.log(`      Step ${functions.length - index} (${fn.name}): ${result} -> ${newResult}`);
                return newResult;
            }, initialValue);
        };
    }
    
    // Async pipe for handling promises
    function asyncPipe(...functions) {
        console.log(`  Created async pipe with ${functions.length} functions`);
        
        return async function(initialValue) {
            console.log(`    Starting async pipe with value: ${initialValue}`);
            
            let result = initialValue;
            for (let i = 0; i < functions.length; i++) {
                const fn = functions[i];
                const newResult = await fn(result);
                console.log(`      Async step ${i + 1} (${fn.name}): ${result} -> ${newResult}`);
                result = newResult;
            }
            
            return result;
        };
    }
    
    // Example transformation functions
    const addTax = (price) => price * 1.08;
    addTax.functionName = 'addTax'; // For logging
    
    const applyDiscount = (price) => price * 0.9;
    applyDiscount.functionName = 'applyDiscount';
    
    const roundToNearestCent = (price) => Math.round(price * 100) / 100;
    roundToNearestCent.functionName = 'roundToNearestCent';
    
    const formatCurrency = (price) => `$${price.toFixed(2)}`;
    formatCurrency.functionName = 'formatCurrency';
    
    // Async function example
    const saveToDatabase = async (formattedPrice) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate DB operation
        return `Saved: ${formattedPrice}`;
    };
    saveToDatabase.functionName = 'saveToDatabase';
    
    // Create composed functions
    const calculateFinalPrice = pipe(
        applyDiscount,
        addTax,
        roundToNearestCent,
        formatCurrency
    );
    
    const processAndSave = asyncPipe(
        applyDiscount,
        addTax,
        roundToNearestCent,
        formatCurrency,
        saveToDatabase
    );
    
    // Test synchronous composition
    console.log('  Synchronous composition:');
    const finalPrice = calculateFinalPrice(100);
    console.log(`    Final result: ${finalPrice}`);
    
    // Test asynchronous composition
    console.log('  Asynchronous composition:');
    processAndSave(150).then(result => {
        console.log(`    Async final result: ${result}`);
    });
    
    // Advanced: Conditional composition
    function conditionalPipe(condition, ...functions) {
        return function(initialValue) {
            if (condition(initialValue)) {
                return pipe(...functions)(initialValue);
            }
            return initialValue;
        };
    }
    
    const expensiveItemProcessor = conditionalPipe(
        (price) => price > 100,
        applyDiscount,
        addTax,
        roundToNearestCent
    );
    
    console.log('  Conditional composition:');
    console.log(`    Expensive item ($150): ${expensiveItemProcessor(150)}`);
    console.log(`    Cheap item ($50): ${expensiveItemProcessor(50)}`);
    
    /**
     * Composition Benefits:
     * 1. Reusable function building blocks
     * 2. Clear data transformation pipelines
     * 3. Easy testing of individual steps
     * 4. Functional programming paradigm
     * 5. Separation of concerns
     */
}

demonstrateFunctionComposition();

// Export advanced pattern utilities for professional use
module.exports = {
    // Currying utilities
    curry: function(fn, arity = fn.length) {
        return function curried(...args) {
            return args.length >= arity 
                ? fn.apply(this, args)
                : (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
        };
    },
    
    // Memoization factory
    memoize: function(fn, keyFn = JSON.stringify) {
        const cache = new Map();
        
        const memoized = function(...args) {
            const key = keyFn(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
        
        memoized.cache = cache;
        return memoized;
    },
    
    // State machine creator
    createStateMachine: function(initialState, states) {
        let current = initialState;
        const history = [initialState];
        
        return {
            getState: () => current,
            transition: (event, data) => {
                const state = states[current];
                const nextState = state?.transitions?.[event];
                if (nextState) {
                    current = nextState;
                    history.push(nextState);
                    return true;
                }
                return false;
            },
            getHistory: () => [...history]
        };
    },
    
    // Function composition utilities
    pipe: (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value),
    compose: (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value),
    
    // Partial application helper
    partial: function(fn, ...presetArgs) {
        return function(...laterArgs) {
            return fn.apply(this, [...presetArgs, ...laterArgs]);
        };
    },
    
    // Debounce with closure
    debounce: function(fn, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },
    
    // Throttle with closure
    throttle: function(fn, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};