/**
 * File: interview-problems.js
 * Topic: Closure Interview Problems and Solutions
 * 
 * This file contains comprehensive interview problems that test deep understanding
 * of closures, variable capture, scope persistence, and advanced patterns.
 * Each problem includes detailed explanations, common pitfalls, and solutions.
 * Focus: Interview preparation, problem-solving patterns, and edge cases
 */

// ============================================================================
// PROBLEM 1: CLASSIC LOOP CLOSURE ISSUE
// ============================================================================

/**
 * Problem: Fix the loop closure bug
 * 
 * This is the most common closure interview question. It tests understanding
 * of variable capture timing, scope creation, and various solution approaches.
 */

console.log('=== CLOSURE INTERVIEW PROBLEMS ===\n');

function problem1_loopClosureIssue() {
    console.log('Problem 1: Loop Closure Variable Capture');
    console.log('Question: Why do all functions return 3? Provide 3 different solutions.\n');
    
    // The buggy code that interviewers often present
    console.log('  Buggy version (all functions return 3):');
    const buggyFunctions = [];
    
    for (var i = 0; i < 3; i++) {
        buggyFunctions.push(function() {
            return i; // All functions capture the SAME variable 'i'
        });
    }
    
    // Demonstrate the bug
    buggyFunctions.forEach((fn, index) => {
        console.log(`    Function ${index} returns: ${fn()}`); // All return 3
    });
    
    /**
     * SOLUTION ANALYSIS:
     * 
     * Why this happens:
     * 1. var i is function-scoped, so there's only ONE variable 'i'
     * 2. All functions capture a reference to the SAME variable 'i'
     * 3. By the time functions execute, the loop has finished and i = 3
     * 4. All functions reference the same i variable with final value 3
     */
    
    // SOLUTION 1: Use let instead of var (ES6+)
    console.log('\n  Solution 1 - Using let (block scope):');
    const solution1Functions = [];
    
    for (let j = 0; j < 3; j++) {
        // Each iteration creates a NEW variable 'j' in a new block scope
        solution1Functions.push(function() {
            return j; // Each function captures its own 'j' variable
        });
    }
    
    solution1Functions.forEach((fn, index) => {
        console.log(`    Function ${index} returns: ${fn()}`); // 0, 1, 2
    });
    
    /**
     * Why let works:
     * let creates a new variable binding for each iteration of the loop.
     * Each function closes over its own separate variable.
     */
    
    // SOLUTION 2: IIFE (Immediately Invoked Function Expression)
    console.log('\n  Solution 2 - Using IIFE to create scope:');
    const solution2Functions = [];
    
    for (var k = 0; k < 3; k++) {
        // IIFE creates a new function scope and immediately executes it
        solution2Functions.push((function(capturedValue) {
            // The parameter 'capturedValue' captures the current value of k
            return function() {
                return capturedValue; // Function returns the captured value
            };
        })(k)); // Pass current k value to IIFE
    }
    
    solution2Functions.forEach((fn, index) => {
        console.log(`    Function ${index} returns: ${fn()}`); // 0, 1, 2
    });
    
    /**
     * Why IIFE works:
     * The IIFE creates a new function scope with parameter 'capturedValue'.
     * Each iteration calls the IIFE with current k value, creating separate closures.
     */
    
    // SOLUTION 3: bind() method
    console.log('\n  Solution 3 - Using bind() to preset arguments:');
    const solution3Functions = [];
    
    function returnValue(value) {
        return value;
    }
    
    for (var l = 0; l < 3; l++) {
        // bind() creates a new function with preset first argument
        solution3Functions.push(returnValue.bind(null, l));
    }
    
    solution3Functions.forEach((fn, index) => {
        console.log(`    Function ${index} returns: ${fn()}`); // 0, 1, 2
    });
    
    /**
     * Why bind works:
     * bind() creates a new function with the first argument preset to the current value.
     * Each iteration creates a separate function with its own bound value.
     */
    
    // SOLUTION 4: Closure factory function
    console.log('\n  Solution 4 - Using closure factory:');
    const solution4Functions = [];
    
    function createFunction(value) {
        // Factory function creates a closure with captured value
        return function() {
            return value; // Captures value parameter from factory
        };
    }
    
    for (var m = 0; m < 3; m++) {
        solution4Functions.push(createFunction(m));
    }
    
    solution4Functions.forEach((fn, index) => {
        console.log(`    Function ${index} returns: ${fn()}`); // 0, 1, 2
    });
    
    /**
     * INTERVIEW FOLLOW-UP QUESTIONS:
     * 
     * Q: Which solution is best and why?
     * A: let (Solution 1) is preferred because:
     *    - Most readable and intuitive
     *    - Native language support
     *    - No additional function calls
     *    - Clear intent
     * 
     * Q: What if you must use var?
     * A: IIFE (Solution 2) is the classic pre-ES6 solution
     * 
     * Q: How would you test these solutions?
     * A: Create unit tests that verify each function returns expected value
     */
}

problem1_loopClosureIssue();

// ============================================================================
// PROBLEM 2: CLOSURE WITH COUNTER AND PRIVATE STATE
// ============================================================================

/**
 * Problem: Implement a counter that supports multiple instances
 * 
 * Tests understanding of closure state isolation, private variables,
 * and factory patterns. Common in interviews testing closure mastery.
 */

console.log('\n=== PROBLEM 2: COUNTER WITH PRIVATE STATE ===\n');

function problem2_counterWithPrivateState() {
    console.log('Problem 2: Counter Factory with Private State');
    console.log('Requirement: Create counter factory that produces independent counters\n');
    
    // SOLUTION: Counter factory using closures
    function createCounter(initialValue = 0, step = 1) {
        // Private variables (only accessible within this closure)
        let count = initialValue;
        const createdAt = Date.now();
        let operationHistory = [];
        
        console.log(`    Counter created with initial value: ${initialValue}, step: ${step}`);
        
        // Private helper function
        function logOperation(operation, oldValue, newValue) {
            operationHistory.push({
                operation,
                oldValue,
                newValue,
                timestamp: Date.now()
            });
        }
        
        // Return public interface (closure)
        return {
            // Increment counter
            increment: function() {
                const oldValue = count;
                count += step;
                logOperation('increment', oldValue, count);
                console.log(`      Incremented: ${oldValue} -> ${count}`);
                return count;
            },
            
            // Decrement counter
            decrement: function() {
                const oldValue = count;
                count -= step;
                logOperation('decrement', oldValue, count);
                console.log(`      Decremented: ${oldValue} -> ${count}`);
                return count;
            },
            
            // Get current value (read-only access)
            getValue: function() {
                console.log(`      Current value: ${count}`);
                return count;
            },
            
            // Reset to initial value
            reset: function() {
                const oldValue = count;
                count = initialValue;
                logOperation('reset', oldValue, count);
                console.log(`      Reset: ${oldValue} -> ${count}`);
                return count;
            },
            
            // Add custom amount
            add: function(amount) {
                const oldValue = count;
                count += amount;
                logOperation(`add(${amount})`, oldValue, count);
                console.log(`      Added ${amount}: ${oldValue} -> ${count}`);
                return count;
            },
            
            // Get counter metadata (demonstrates closure access to private variables)
            getInfo: function() {
                const info = {
                    currentValue: count,
                    initialValue: initialValue,
                    step: step,
                    createdAt: new Date(createdAt).toISOString(),
                    operationsCount: operationHistory.length,
                    uptime: Date.now() - createdAt
                };
                console.log('      Counter info:', info);
                return info;
            },
            
            // Get operation history (first 10 operations)
            getHistory: function(limit = 10) {
                const history = operationHistory.slice(-limit);
                console.log(`      History (last ${limit}):`, history);
                return history;
            }
        };
    }
    
    // Test the counter factory
    console.log('  Testing counter factory:');
    
    // Create independent counters
    const counter1 = createCounter(0, 1);    // Start at 0, increment by 1
    const counter2 = createCounter(100, 5);  // Start at 100, increment by 5
    const counter3 = createCounter(-10, 2);  // Start at -10, increment by 2
    
    // Operate on counter1
    console.log('    Counter 1 operations:');
    counter1.increment();
    counter1.increment();
    counter1.add(10);
    counter1.decrement();
    counter1.getInfo();
    
    // Operate on counter2 
    console.log('    Counter 2 operations:');
    counter2.increment();
    counter2.add(-20);
    counter2.increment();
    counter2.getInfo();
    
    // Operate on counter3
    console.log('    Counter 3 operations:');
    counter3.increment();
    counter3.reset();
    counter3.add(5);
    counter3.getHistory(5);
    
    // Demonstrate state isolation
    console.log('    Final values (demonstrating state isolation):');
    console.log(`      Counter 1: ${counter1.getValue()}`);
    console.log(`      Counter 2: ${counter2.getValue()}`);
    console.log(`      Counter 3: ${counter3.getValue()}`);
    
    /**
     * INTERVIEW INSIGHTS:
     * 
     * Key Points to Mention:
     * 1. Each counter instance has its own private state
     * 2. Private variables (count, createdAt, operationHistory) cannot be accessed directly
     * 3. Only methods in the returned object can access private state
     * 4. Each call to createCounter() creates a new closure with separate variables
     * 5. This demonstrates data encapsulation and information hiding
     * 
     * Common Follow-up Questions:
     * Q: Can you access the private variables from outside?
     * A: No, they're completely private within the closure scope
     * 
     * Q: What happens to memory when counters are no longer needed?
     * A: JavaScript garbage collector will clean up when no references remain
     * 
     * Q: How would you add a feature to get all counters' values?
     * A: Need a registry pattern or static method to track instances
     */
}

problem2_counterWithPrivateState();

// ============================================================================
// PROBLEM 3: FUNCTION CURRYING AND PARTIAL APPLICATION
// ============================================================================

/**
 * Problem: Implement function currying manually
 * 
 * Tests advanced closure understanding, argument collection,
 * and function composition. Common in functional programming interviews.
 */

console.log('\n=== PROBLEM 3: MANUAL CURRYING IMPLEMENTATION ===\n');

function problem3_manualCurrying() {
    console.log('Problem 3: Implement Manual Currying');
    console.log('Task: Create curry function that transforms f(a,b,c) into f(a)(b)(c)\n');
    
    // SOLUTION: Manual currying implementation
    function curry(originalFunction, arity = originalFunction.length) {
        console.log(`    Currying function with arity: ${arity}`);
        
        // Return the curried version
        return function curried(...capturedArgs) {
            console.log(`      Current args: [${capturedArgs}], need: ${arity}`);
            
            // If we have enough arguments, execute the original function
            if (capturedArgs.length >= arity) {
                const result = originalFunction.apply(this, capturedArgs);
                console.log(`      Executing: ${originalFunction.name}(${capturedArgs}) = ${result}`);
                return result;
            }
            
            // Otherwise, return a new function that captures more arguments
            return function(...newArgs) {
                const allArgs = [...capturedArgs, ...newArgs];
                console.log(`      Partial application: [${capturedArgs}] + [${newArgs}] = [${allArgs}]`);
                return curried.apply(this, allArgs);
            };
        };
    }
    
    // Test function for currying
    function calculateTotal(tax, discount, shipping, price) {
        const subtotal = price - discount;
        const withTax = subtotal + (subtotal * tax);
        const total = withTax + shipping;
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    }
    
    // Create curried version
    const curriedCalculate = curry(calculateTotal);
    
    console.log('  Testing manual currying:');
    
    // Method 1: Full currying (one argument at a time)
    console.log('    Method 1 - Full currying:');
    const result1 = curriedCalculate(0.08)(5.00)(3.50)(100);
    console.log(`      Final result: $${result1}`);
    
    // Method 2: Partial application (multiple arguments at once)
    console.log('    Method 2 - Partial application:');
    const taxAndDiscount = curriedCalculate(0.10, 10.00);
    const withShipping = taxAndDiscount(2.00);
    const result2 = withShipping(75);
    console.log(`      Final result: $${result2}`);
    
    // Method 3: Creating specialized functions
    console.log('    Method 3 - Specialized functions:');
    const standardTax = curriedCalculate(0.08);
    const standardTaxAndDiscount = standardTax(5.00);
    const standardConfig = standardTaxAndDiscount(4.99);
    
    // Now we can calculate for different prices easily
    const prices = [50, 75, 100, 125];
    prices.forEach(price => {
        const total = standardConfig(price);
        console.log(`      Price $${price} -> Total $${total}`);
    });
    
    // ADVANCED: Curry with support for placeholders
    const _ = Symbol('placeholder'); // Placeholder symbol
    
    function advancedCurry(fn, arity = fn.length) {
        console.log(`    Advanced currying with placeholders, arity: ${arity}`);
        
        return function curried(...args) {
            const filledArgs = [];
            let argIndex = 0;
            
            // Process arguments and handle placeholders
            for (let i = 0; i < arity && argIndex < args.length; i++) {
                if (args[argIndex] === _) {
                    // Skip placeholder
                    filledArgs[i] = _;
                    argIndex++;
                } else if (filledArgs[i] === _ || filledArgs[i] === undefined) {
                    // Fill empty slot
                    filledArgs[i] = args[argIndex];
                    argIndex++;
                }
            }
            
            // Check if we have all arguments (no placeholders)
            const hasAllArgs = filledArgs.length >= arity && 
                               !filledArgs.slice(0, arity).includes(_);
            
            if (hasAllArgs) {
                const result = fn.apply(this, filledArgs);
                console.log(`      Advanced execution: ${fn.name}(${filledArgs}) = ${result}`);
                return result;
            }
            
            // Return new curried function with filled arguments
            return function(...nextArgs) {
                // Merge current args with new args, handling placeholders
                const mergedArgs = [...filledArgs];
                let nextIndex = 0;
                
                for (let i = 0; i < mergedArgs.length && nextIndex < nextArgs.length; i++) {
                    if (mergedArgs[i] === _) {
                        mergedArgs[i] = nextArgs[nextIndex];
                        nextIndex++;
                    }
                }
                
                // Add any remaining args
                while (nextIndex < nextArgs.length) {
                    mergedArgs.push(nextArgs[nextIndex]);
                    nextIndex++;
                }
                
                console.log(`      Advanced partial: merged [${mergedArgs}]`);
                return curried.apply(this, mergedArgs);
            };
        };
    }
    
    // Test advanced currying with placeholders
    console.log('    Testing advanced currying with placeholders:');
    const advancedCalculate = advancedCurry(calculateTotal);
    
    // Use placeholders to fill arguments out of order
    const withTaxAndShipping = advancedCalculate(0.08, _, 5.99, _);
    const result3 = withTaxAndShipping(15.00, 200); // discount=15, price=200
    console.log(`      Advanced result: $${result3}`);
    
    /**
     * INTERVIEW ANALYSIS:
     * 
     * Key Concepts Demonstrated:
     * 1. Closure captures and accumulates arguments over time
     * 2. Recursive function return creates chain of closures
     * 3. Arity checking determines when to execute vs return new function
     * 4. Argument spreading and rest parameters for flexibility
     * 
     * Advanced Features:
     * 1. Placeholder support for out-of-order argument filling
     * 2. Context preservation with apply()
     * 3. Argument validation and processing
     * 
     * Common Follow-ups:
     * Q: What are the performance implications?
     * A: Each call creates new functions, so memory usage increases with partial applications
     * 
     * Q: When would you use currying in real applications?
     * A: Event handlers, configuration functions, functional programming pipelines
     * 
     * Q: How does this relate to partial application?
     * A: Currying is automatic partial application - each call partially applies arguments
     */
}

problem3_manualCurrying();

// ============================================================================
// PROBLEM 4: MEMOIZATION WITH COMPLEX CACHE STRATEGIES
// ============================================================================

/**
 * Problem: Implement memoization with TTL and cache size limits
 * 
 * Tests advanced closure patterns, cache management, and optimization techniques.
 * Common in performance optimization and system design interviews.
 */

console.log('\n=== PROBLEM 4: ADVANCED MEMOIZATION ===\n');

function problem4_advancedMemoization() {
    console.log('Problem 4: Advanced Memoization with TTL and Size Limits');
    console.log('Requirements: TTL expiration, LRU eviction, cache statistics\n');
    
    // SOLUTION: Advanced memoization with multiple strategies
    function createAdvancedMemoizer(options = {}) {
        const {
            maxSize = 100,
            ttl = null, // Time to live in milliseconds
            keyGenerator = (...args) => JSON.stringify(args),
            onHit = null,
            onMiss = null,
            onEvict = null
        } = options;
        
        console.log(`    Creating memoizer: maxSize=${maxSize}, ttl=${ttl}ms`);
        
        return function memoize(fn) {
            // Cache storage
            const cache = new Map();
            const accessTimes = new Map(); // For LRU tracking
            const creationTimes = new Map(); // For TTL tracking
            
            // Statistics
            let hitCount = 0;
            let missCount = 0;
            let evictionCount = 0;
            
            // Cache cleanup utilities
            function cleanupExpired() {
                if (!ttl) return 0;
                
                const now = Date.now();
                const expiredKeys = [];
                
                for (const [key, creationTime] of creationTimes) {
                    if (now - creationTime > ttl) {
                        expiredKeys.push(key);
                    }
                }
                
                expiredKeys.forEach(key => {
                    cache.delete(key);
                    accessTimes.delete(key);
                    creationTimes.delete(key);
                    evictionCount++;
                    
                    if (onEvict) onEvict(key, 'expired');
                });
                
                return expiredKeys.length;
            }
            
            function evictLRU(count = 1) {
                // Sort by access time (oldest first)
                const entries = Array.from(accessTimes.entries())
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, count);
                
                entries.forEach(([key]) => {
                    cache.delete(key);
                    accessTimes.delete(key);
                    creationTimes.delete(key);
                    evictionCount++;
                    
                    if (onEvict) onEvict(key, 'lru');
                });
                
                return entries.length;
            }
            
            // Memoized function
            function memoizedFunction(...args) {
                const key = keyGenerator(...args);
                const now = Date.now();
                
                // Cleanup expired entries
                const expiredCount = cleanupExpired();
                if (expiredCount > 0) {
                    console.log(`      Cleaned up ${expiredCount} expired entries`);
                }
                
                // Check cache hit
                if (cache.has(key)) {
                    // Update access time for LRU
                    accessTimes.set(key, now);
                    
                    hitCount++;
                    const result = cache.get(key);
                    
                    console.log(`      Cache HIT for key: ${key.substring(0, 30)}...`);
                    if (onHit) onHit(key, result);
                    
                    return result;
                }
                
                // Cache miss - compute result
                missCount++;
                console.log(`      Cache MISS for key: ${key.substring(0, 30)}...`);
                
                const result = fn.apply(this, args);
                
                // Evict entries if cache is full
                if (cache.size >= maxSize) {
                    const evicted = evictLRU(Math.ceil(maxSize * 0.1)); // Evict 10%
                    console.log(`      Evicted ${evicted} LRU entries due to size limit`);
                }
                
                // Store result with metadata
                cache.set(key, result);
                accessTimes.set(key, now);
                creationTimes.set(key, now);
                
                if (onMiss) onMiss(key, result);
                
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
                    evictionCount = 0;
                    console.log(`      Cache cleared: ${size} entries removed`);
                },
                
                delete: (key) => {
                    const had = cache.delete(key);
                    accessTimes.delete(key);
                    creationTimes.delete(key);
                    return had;
                },
                
                has: (key) => cache.has(key),
                
                size: () => cache.size,
                
                stats: () => {
                    const total = hitCount + missCount;
                    return {
                        size: cache.size,
                        maxSize,
                        hits: hitCount,
                        misses: missCount,
                        evictions: evictionCount,
                        hitRate: total > 0 ? ((hitCount / total) * 100).toFixed(1) + '%' : '0%',
                        fillRate: ((cache.size / maxSize) * 100).toFixed(1) + '%'
                    };
                }
            };
            
            return memoizedFunction;
        };
    }
    
    // Test with expensive Fibonacci function
    function expensiveFibonacci(n) {
        console.log(`        Computing fibonacci(${n})`);
        if (n <= 1) return n;
        return expensiveFibonacci(n - 1) + expensiveFibonacci(n - 2);
    }
    
    // Create memoizer with different configurations
    console.log('  Testing different memoization strategies:');
    
    // Strategy 1: Size-limited cache
    const sizeLimitedMemoizer = createAdvancedMemoizer({ 
        maxSize: 5,
        onHit: (key, result) => console.log(`        Hit: ${result}`),
        onMiss: (key, result) => console.log(`        Miss: computed ${result}`)
    });
    
    const memoizedFib1 = sizeLimitedMemoizer(expensiveFibonacci);
    
    console.log('    Size-limited memoization:');
    [5, 6, 7, 8, 5, 6, 9, 10].forEach(n => {
        const result = memoizedFib1(n);
        console.log(`      fib(${n}) = ${result}`);
    });
    
    console.log('      Stats:', memoizedFib1.cache.stats());
    
    // Strategy 2: TTL-based cache
    const ttlMemoizer = createAdvancedMemoizer({ 
        maxSize: 100,
        ttl: 2000, // 2 second TTL
        onEvict: (key, reason) => console.log(`        Evicted: ${key} (${reason})`)
    });
    
    const memoizedFib2 = ttlMemoizer(expensiveFibonacci);
    
    console.log('    TTL-based memoization:');
    console.log(`      fib(8) = ${memoizedFib2(8)}`);
    console.log(`      fib(8) = ${memoizedFib2(8)}`); // Should hit cache
    
    // Wait for TTL expiration
    setTimeout(() => {
        console.log('      After TTL expiration:');
        console.log(`      fib(8) = ${memoizedFib2(8)}`); // Should miss cache
        console.log('      Stats:', memoizedFib2.cache.stats());
    }, 2100);
    
    /**
     * INTERVIEW INSIGHTS:
     * 
     * Advanced Concepts Demonstrated:
     * 1. Multiple cache eviction strategies (LRU, TTL, size-based)
     * 2. Cache statistics and monitoring
     * 3. Configurable key generation
     * 4. Event callbacks for cache operations
     * 5. Memory management considerations
     * 
     * Performance Considerations:
     * 1. Time complexity: O(1) for cache hit, O(n) for cache miss
     * 2. Space complexity: O(k) where k is cache size
     * 3. TTL cleanup has O(n) worst case but typically O(1)
     * 4. LRU eviction is O(n log n) due to sorting
     * 
     * Common Follow-ups:
     * Q: How would you optimize LRU eviction?
     * A: Use doubly-linked list + hash map for O(1) operations
     * 
     * Q: What about thread safety?
     * A: Would need locks or atomic operations in multi-threaded environment
     * 
     * Q: How do you handle functions with object parameters?
     * A: Custom key generation that handles deep object serialization
     */
}

problem4_advancedMemoization();

// ============================================================================
// PROBLEM 5: EVENT EMITTER WITH CLOSURE-BASED SUBSCRIPTIONS
// ============================================================================

/**
 * Problem: Implement event emitter with advanced subscription management
 * 
 * Tests closure-based state management, event handling patterns,
 * and subscription lifecycle management.
 */

console.log('\n=== PROBLEM 5: EVENT EMITTER WITH CLOSURE SUBSCRIPTIONS ===\n');

function problem5_eventEmitterWithClosures() {
    console.log('Problem 5: Event Emitter with Advanced Subscription Management');
    console.log('Requirements: Once listeners, filtered subscriptions, auto-unsubscribe\n');
    
    // SOLUTION: Advanced event emitter using closures
    function createEventEmitter() {
        // Private state
        const subscriptions = new Map(); // eventType -> Set of listeners
        const onceListeners = new WeakSet(); // Track one-time listeners
        const filteredListeners = new WeakMap(); // listener -> filter function
        const subscriptionMetadata = new WeakMap(); // listener -> metadata
        
        let eventIdCounter = 0;
        const eventHistory = [];
        const maxHistorySize = 100;
        
        console.log('    Created event emitter with advanced subscription management');
        
        // Private helpers
        function generateEventId() {
            return `event_${++eventIdCounter}`;
        }
        
        function addToHistory(eventType, data, listeners) {
            eventHistory.push({
                id: generateEventId(),
                type: eventType,
                data: data,
                timestamp: Date.now(),
                listenerCount: listeners
            });
            
            if (eventHistory.length > maxHistorySize) {
                eventHistory.shift();
            }
        }
        
        function createEnhancedListener(originalListener, options = {}) {
            const { once = false, filter = null, autoUnsubscribe = null, context = null } = options;
            
            // Create wrapper function with closure over options
            function enhancedListener(data) {
                const metadata = subscriptionMetadata.get(enhancedListener) || {};
                
                // Apply filter if present
                if (filter && !filter(data)) {
                    console.log('      Event filtered by subscription filter');
                    return;
                }
                
                // Check auto-unsubscribe condition
                if (autoUnsubscribe && autoUnsubscribe(data, metadata)) {
                    console.log('      Auto-unsubscribing due to condition');
                    emitter.off(metadata.eventType, enhancedListener);
                }
                
                // Update metadata
                metadata.callCount = (metadata.callCount || 0) + 1;
                metadata.lastCalled = Date.now();
                
                try {
                    // Call original listener with proper context
                    const result = context ? 
                        originalListener.call(context, data) : 
                        originalListener(data);
                    
                    // Remove if it's a once listener
                    if (once) {
                        emitter.off(metadata.eventType, enhancedListener);
                        console.log('      Removed once listener after execution');
                    }
                    
                    return result;
                } catch (error) {
                    console.error('      Error in event listener:', error.message);
                }
            }
            
            // Store metadata
            subscriptionMetadata.set(enhancedListener, {
                originalListener,
                options,
                createdAt: Date.now(),
                callCount: 0
            });
            
            // Track special listener types
            if (once) {
                onceListeners.add(enhancedListener);
            }
            if (filter) {
                filteredListeners.set(enhancedListener, filter);
            }
            
            return enhancedListener;
        }
        
        // Public API
        const emitter = {
            // Subscribe to events
            on: function(eventType, listener, options = {}) {
                if (!subscriptions.has(eventType)) {
                    subscriptions.set(eventType, new Set());
                }
                
                const enhancedListener = createEnhancedListener(listener, options);
                
                // Store event type in metadata for cleanup
                const metadata = subscriptionMetadata.get(enhancedListener);
                metadata.eventType = eventType;
                
                subscriptions.get(eventType).add(enhancedListener);
                
                console.log(`      Added ${options.once ? 'once ' : ''}listener for '${eventType}'`);
                return enhancedListener; // Return for later removal
            },
            
            // Unsubscribe from events
            off: function(eventType, listener) {
                if (!subscriptions.has(eventType)) {
                    return false;
                }
                
                const listeners = subscriptions.get(eventType);
                const removed = listeners.delete(listener);
                
                if (removed) {
                    // Clean up metadata
                    subscriptionMetadata.delete(listener);
                    onceListeners.delete(listener);
                    filteredListeners.delete(listener);
                    
                    console.log(`      Removed listener for '${eventType}'`);
                    
                    // Clean up empty event type
                    if (listeners.size === 0) {
                        subscriptions.delete(eventType);
                    }
                }
                
                return removed;
            },
            
            // Emit events
            emit: function(eventType, data) {
                const listeners = subscriptions.get(eventType);
                
                if (!listeners || listeners.size === 0) {
                    console.log(`      No listeners for '${eventType}'`);
                    addToHistory(eventType, data, 0);
                    return 0;
                }
                
                console.log(`      Emitting '${eventType}' to ${listeners.size} listeners`);
                
                let successfulCalls = 0;
                const listenersArray = [...listeners]; // Convert to array to prevent modification during iteration
                
                listenersArray.forEach((listener, index) => {
                    try {
                        listener(data);
                        successfulCalls++;
                    } catch (error) {
                        console.error(`      Listener ${index} failed:`, error.message);
                    }
                });
                
                addToHistory(eventType, data, successfulCalls);
                return successfulCalls;
            },
            
            // Get subscription statistics
            getStats: function() {
                const stats = {
                    totalEventTypes: subscriptions.size,
                    totalListeners: 0,
                    onceListeners: 0,
                    filteredListeners: 0,
                    eventsEmitted: eventHistory.length,
                    eventTypes: []
                };
                
                for (const [eventType, listeners] of subscriptions) {
                    const eventStats = {
                        eventType,
                        listenerCount: listeners.size,
                        onceCount: 0,
                        filteredCount: 0
                    };
                    
                    for (const listener of listeners) {
                        if (onceListeners.has(listener)) {
                            eventStats.onceCount++;
                            stats.onceListeners++;
                        }
                        if (filteredListeners.has(listener)) {
                            eventStats.filteredCount++;
                            stats.filteredListeners++;
                        }
                    }
                    
                    stats.totalListeners += listeners.size;
                    stats.eventTypes.push(eventStats);
                }
                
                return stats;
            },
            
            // Get event history
            getHistory: function(eventType = null, limit = 10) {
                let history = eventHistory;
                
                if (eventType) {
                    history = history.filter(event => event.type === eventType);
                }
                
                return history.slice(-limit);
            },
            
            // Clean up all subscriptions
            destroy: function() {
                const stats = this.getStats();
                
                subscriptions.clear();
                eventHistory.length = 0;
                
                console.log(`      Event emitter destroyed (had ${stats.totalListeners} listeners)`);
            }
        };
        
        return emitter;
    }
    
    // Test the advanced event emitter
    const emitter = createEventEmitter();
    
    // Create different types of subscribers with closures
    function createUserActivityTracker(userId) {
        let activityCount = 0;
        
        return function trackActivity(data) {
            activityCount++;
            console.log(`        User ${userId} activity #${activityCount}: ${data.action}`);
            return { userId, activityCount, action: data.action };
        };
    }
    
    function createConditionalLogger(condition) {
        return {
            filter: (data) => condition(data),
            handler: (data) => {
                console.log(`        Conditional log: ${JSON.stringify(data)}`);
            }
        };
    }
    
    // Set up various subscription patterns
    console.log('  Testing advanced event emitter:');
    
    // Regular subscription with closure state
    const userTracker = emitter.on('user_action', createUserActivityTracker('user123'));
    
    // Once subscription
    emitter.on('system_start', function(data) {
        console.log(`        System started: ${data.version}`);
    }, { once: true });
    
    // Filtered subscription
    const highPriorityLogger = createConditionalLogger(data => data.priority === 'high');
    emitter.on('system_event', highPriorityLogger.handler, {
        filter: highPriorityLogger.filter
    });
    
    // Auto-unsubscribe subscription
    emitter.on('error_event', function(data) {
        console.log(`        Error handled: ${data.message}`);
    }, {
        autoUnsubscribe: (data, metadata) => metadata.callCount >= 3 // Unsubscribe after 3 calls
    });
    
    // Test various events
    console.log('    Emitting test events:');
    emitter.emit('user_action', { action: 'login', timestamp: Date.now() });
    emitter.emit('user_action', { action: 'purchase', timestamp: Date.now() });
    emitter.emit('system_start', { version: '2.1.0' });
    emitter.emit('system_start', { version: '2.1.1' }); // Won't trigger once listener
    emitter.emit('system_event', { type: 'info', priority: 'low' }); // Filtered out
    emitter.emit('system_event', { type: 'alert', priority: 'high' }); // Will trigger
    emitter.emit('error_event', { message: 'Connection failed' });
    emitter.emit('error_event', { message: 'Timeout occurred' });
    emitter.emit('error_event', { message: 'Invalid response' });
    emitter.emit('error_event', { message: 'Should not trigger' }); // Auto-unsubscribed
    
    // Show statistics
    console.log('    Final stats:', emitter.getStats());
    console.log('    Event history:', emitter.getHistory());
    
    /**
     * INTERVIEW INSIGHTS:
     * 
     * Advanced Closure Patterns:
     * 1. WeakMap/WeakSet for memory-efficient metadata storage
     * 2. Closure factories for creating specialized listeners
     * 3. Enhanced listeners with wrapped functionality
     * 4. Private state management with closure scope
     * 
     * Key Features:
     * 1. Filtered subscriptions with closure-based conditions
     * 2. Auto-unsubscribe based on custom logic
     * 3. Once listeners with automatic cleanup
     * 4. Event history and subscription analytics
     * 5. Memory leak prevention with WeakMap/WeakSet
     * 
     * Common Follow-ups:
     * Q: How do you prevent memory leaks?
     * A: Use WeakMap/WeakSet, proper cleanup in off(), destroy method
     * 
     * Q: How would you add async event handling?
     * A: Promise-based emit method, error handling for async listeners
     * 
     * Q: What about event bubbling/capturing?
     * A: Add parent/child emitter relationships with event propagation
     */
}

problem5_eventEmitterWithClosures();

// Export interview problem utilities for practice
module.exports = {
    // Loop closure bug solutions
    fixLoopClosure: {
        withLet: function(iterations, callback) {
            const functions = [];
            for (let i = 0; i < iterations; i++) {
                functions.push(() => callback(i));
            }
            return functions;
        },
        
        withIIFE: function(iterations, callback) {
            const functions = [];
            for (var i = 0; i < iterations; i++) {
                functions.push((function(captured) {
                    return () => callback(captured);
                })(i));
            }
            return functions;
        },
        
        withBind: function(iterations, callback) {
            const functions = [];
            function handler(value) { return callback(value); }
            for (var i = 0; i < iterations; i++) {
                functions.push(handler.bind(null, i));
            }
            return functions;
        }
    },
    
    // Counter factory
    createCounter: function(initial = 0, step = 1) {
        let count = initial;
        const history = [];
        
        return {
            increment: () => {
                count += step;
                history.push({ operation: 'increment', value: count, timestamp: Date.now() });
                return count;
            },
            decrement: () => {
                count -= step;
                history.push({ operation: 'decrement', value: count, timestamp: Date.now() });
                return count;
            },
            getValue: () => count,
            getHistory: () => [...history]
        };
    },
    
    // Simple memoization
    memoize: function(fn, keyFn = JSON.stringify) {
        const cache = new Map();
        
        return function(...args) {
            const key = keyFn(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    },
    
    // Event emitter
    createEventEmitter: function() {
        const events = new Map();
        
        return {
            on: (event, callback) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event).push(callback);
            },
            
            emit: (event, data) => {
                if (events.has(event)) {
                    events.get(event).forEach(callback => callback(data));
                }
            },
            
            off: (event, callback) => {
                if (events.has(event)) {
                    const callbacks = events.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index !== -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };
    },
    
    // Closure testing utilities
    testClosure: function(fn) {
        const result = {};
        try {
            result.value = fn();
            result.success = true;
        } catch (error) {
            result.error = error.message;
            result.success = false;
        }
        return result;
    }
};