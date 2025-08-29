/**
 * File: advanced-patterns.js
 * Topic: Advanced Memory Management Patterns
 * 
 * This file explores sophisticated memory management techniques including
 * object pooling, memory-efficient data structures, and optimization strategies
 * for high-performance JavaScript applications.
 * Focus: Performance optimization, memory pools, and advanced allocation strategies
 */

// ============================================================================
// OBJECT POOLING PATTERNS
// ============================================================================

/**
 * Object Pooling Mental Model:
 * 
 * Object pooling reuses objects instead of creating new ones, reducing:
 * - Garbage collection pressure
 * - Allocation/deallocation overhead
 * - Memory fragmentation
 * 
 * Best for: Objects created/destroyed frequently (particles, DOM elements, etc.)
 * Trade-off: Memory usage (pool size) vs CPU time (allocation/GC)
 */

console.log('=== ADVANCED MEMORY MANAGEMENT PATTERNS ===\n');

function demonstrateObjectPooling() {
    console.log('1. Object Pooling Patterns:');
    
    // Advanced object pool implementation
    class AdvancedObjectPool {
        constructor(createFn, resetFn, initialSize = 10, maxSize = 100) {
            this.createFn = createFn;     // Factory function for new objects
            this.resetFn = resetFn;       // Function to reset object state
            this.maxSize = maxSize;       // Maximum pool size
            this.pool = [];               // Available objects
            this.borrowed = new Set();    // Tracking borrowed objects
            this.totalCreated = 0;        // Statistics
            this.totalReuses = 0;         // Statistics
            
            // Pre-populate pool with initial objects
            for (let i = 0; i < initialSize; i++) {
                this.pool.push(this.createObject());
            }
            
            console.log(`    Created object pool: initial=${initialSize}, max=${maxSize}`);
        }
        
        createObject() {
            const obj = this.createFn();
            this.totalCreated++;
            
            // Add pool tracking metadata
            obj.__poolMetadata = {
                created: Date.now(),
                useCount: 0,
                poolId: this.totalCreated
            };
            
            return obj;
        }
        
        acquire() {
            let obj;
            
            if (this.pool.length > 0) {
                // Reuse existing object from pool
                obj = this.pool.pop();
                this.totalReuses++;
                console.log(`    Reused object #${obj.__poolMetadata.poolId} (reuse #${this.totalReuses})`);
            } else {
                // Create new object if pool is empty
                obj = this.createObject();
                console.log(`    Created new object #${obj.__poolMetadata.poolId} (pool empty)`);
            }
            
            // Track borrowed object
            this.borrowed.add(obj);
            obj.__poolMetadata.useCount++;
            obj.__poolMetadata.lastAcquired = Date.now();
            
            return obj;
        }
        
        release(obj) {
            if (!this.borrowed.has(obj)) {
                console.warn(`    Warning: Attempting to release object not borrowed from this pool`);
                return false;
            }
            
            // Remove from borrowed tracking
            this.borrowed.delete(obj);
            
            // Reset object state
            if (this.resetFn) {
                this.resetFn(obj);
            }
            
            // Return to pool if under max size
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
                obj.__poolMetadata.lastReleased = Date.now();
                console.log(`    Released object #${obj.__poolMetadata.poolId} back to pool`);
            } else {
                console.log(`    Discarded object #${obj.__poolMetadata.poolId} (pool at max size)`);
            }
            
            return true;
        }
        
        getStats() {
            return {
                poolSize: this.pool.length,
                borrowedCount: this.borrowed.size,
                totalCreated: this.totalCreated,
                totalReuses: this.totalReuses,
                reuseRatio: this.totalCreated > 0 ? (this.totalReuses / this.totalCreated).toFixed(2) : 0,
                memoryEfficiency: `${this.totalReuses} reuses avoided ${this.totalReuses} allocations`
            };
        }
        
        cleanup() {
            this.pool.length = 0;
            this.borrowed.clear();
            console.log(`    Pool cleaned up - freed ${this.totalCreated} objects`);
        }
    }
    
    // Example: Particle system using object pool
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.life = 1.0;
            this.size = 1.0;
            this.active = false;
        }
        
        update(dt) {
            if (!this.active) return;
            
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= dt * 0.1;
            this.size *= 0.99;
            
            if (this.life <= 0) {
                this.active = false;
            }
        }
        
        spawn(x, y, vx, vy) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.life = 1.0;
            this.size = Math.random() * 5 + 2;
            this.active = true;
        }
    }
    
    // Create particle pool
    const particlePool = new AdvancedObjectPool(
        () => new Particle(),              // Create function
        (particle) => particle.reset(),    // Reset function
        50,                                // Initial pool size
        200                                // Maximum pool size
    );
    
    // Simulate particle system usage
    console.log('  Simulating particle system with pooling:');
    
    const activeParticles = [];
    
    // Spawn particles over time
    for (let frame = 0; frame < 10; frame++) {
        // Spawn new particles
        for (let i = 0; i < 5; i++) {
            const particle = particlePool.acquire();
            particle.spawn(
                Math.random() * 100,
                Math.random() * 100,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            activeParticles.push(particle);
        }
        
        // Update and remove dead particles
        for (let i = activeParticles.length - 1; i >= 0; i--) {
            const particle = activeParticles[i];
            particle.update(0.016); // 60 FPS
            
            if (!particle.active) {
                particlePool.release(particle);
                activeParticles.splice(i, 1);
            }
        }
        
        console.log(`    Frame ${frame}: ${activeParticles.length} active particles`);
    }
    
    // Show pool statistics
    const poolStats = particlePool.getStats();
    console.log('  Pool performance:', poolStats);
    
    // Cleanup remaining particles
    activeParticles.forEach(particle => particlePool.release(particle));
    particlePool.cleanup();
    
    /**
     * Object Pooling Benefits:
     * 1. Reduced GC pressure - fewer objects created/destroyed
     * 2. Consistent performance - no allocation spikes
     * 3. Memory locality - reused objects may stay in cache
     * 4. Predictable memory usage - pool size limits memory
     * 
     * Use Cases:
     * - Game particles, bullets, enemies
     * - DOM manipulation (temporary elements)
     * - Network request objects
     * - Mathematical computation objects
     */
}

demonstrateObjectPooling();

// ============================================================================
// MEMORY-EFFICIENT DATA STRUCTURES
// ============================================================================

/**
 * Memory-Efficient Data Structures:
 * 
 * Specialized data structures that optimize memory usage through:
 * - Packed arrays (typed arrays)
 * - Bit manipulation
 * - Structure of arrays vs array of structures
 * - Memory alignment considerations
 */

function demonstrateEfficientDataStructures() {
    console.log('\n2. Memory-Efficient Data Structures:');
    
    // Typed Arrays - Memory-efficient numeric storage
    console.log('  Typed Arrays for Numeric Data:');
    
    // Compare regular array vs typed array memory usage
    const regularArray = [];
    const typedArray = new Float32Array(1000);
    
    // Fill with same data
    for (let i = 0; i < 1000; i++) {
        regularArray[i] = Math.random() * 100;
        typedArray[i] = Math.random() * 100;
    }
    
    console.log(`    Regular array: ~${1000 * 64} bytes (64-bit per number)`);
    console.log(`    Typed array: ~${typedArray.byteLength} bytes (32-bit per number)`);
    console.log(`    Memory savings: ~${((1 - typedArray.byteLength / (1000 * 8)) * 100).toFixed(1)}%`);
    
    // Bit manipulation for flags and small integers
    console.log('  Bit Manipulation for Compact Storage:');
    
    class BitFlags {
        constructor(size = 32) {
            this.data = new Uint32Array(Math.ceil(size / 32));
            this.size = size;
            
            console.log(`    Created BitFlags for ${size} flags using ${this.data.length * 4} bytes`);
        }
        
        set(index, value) {
            if (index >= this.size) return false;
            
            const wordIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            
            if (value) {
                this.data[wordIndex] |= (1 << bitIndex);  // Set bit
            } else {
                this.data[wordIndex] &= ~(1 << bitIndex); // Clear bit
            }
            
            return true;
        }
        
        get(index) {
            if (index >= this.size) return false;
            
            const wordIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            
            return (this.data[wordIndex] & (1 << bitIndex)) !== 0;
        }
        
        count() {
            let total = 0;
            for (let i = 0; i < this.size; i++) {
                if (this.get(i)) total++;
            }
            return total;
        }
        
        getMemoryUsage() {
            return this.data.length * 4; // 4 bytes per Uint32
        }
    }
    
    // Demonstrate bit flags vs boolean array
    const bitFlags = new BitFlags(1000);
    const booleanArray = new Array(1000);
    
    // Set some random flags
    for (let i = 0; i < 100; i++) {
        const index = Math.floor(Math.random() * 1000);
        bitFlags.set(index, true);
        booleanArray[index] = true;
    }
    
    console.log(`    BitFlags memory: ${bitFlags.getMemoryUsage()} bytes`);
    console.log(`    Boolean array: ~${1000 * 1} bytes (assuming 1 byte per boolean)`);
    console.log(`    Flags set: ${bitFlags.count()}`);
    
    // Structure of Arrays (SoA) vs Array of Structures (AoS)
    console.log('  Structure of Arrays vs Array of Structures:');
    
    // Array of Structures (AoS) - common but less cache-friendly
    class AoSParticles {
        constructor(count) {
            this.particles = [];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    vx: Math.random() * 10 - 5,
                    vy: Math.random() * 10 - 5,
                    life: 1.0
                });
            }
        }
        
        update(dt) {
            for (const particle of this.particles) {
                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;
                particle.life -= dt * 0.1;
            }
        }
        
        getMemoryEstimate() {
            // Rough estimate: object overhead + 5 properties * 8 bytes each
            return this.particles.length * (24 + 5 * 8);
        }
    }
    
    // Structure of Arrays (SoA) - more cache-friendly for batch operations
    class SoAParticles {
        constructor(count) {
            this.count = count;
            // Separate arrays for each property
            this.x = new Float32Array(count);
            this.y = new Float32Array(count);
            this.vx = new Float32Array(count);
            this.vy = new Float32Array(count);
            this.life = new Float32Array(count);
            
            // Initialize data
            for (let i = 0; i < count; i++) {
                this.x[i] = Math.random() * 100;
                this.y[i] = Math.random() * 100;
                this.vx[i] = Math.random() * 10 - 5;
                this.vy[i] = Math.random() * 10 - 5;
                this.life[i] = 1.0;
            }
        }
        
        update(dt) {
            // Batch operations on each array - more cache-friendly
            for (let i = 0; i < this.count; i++) {
                this.x[i] += this.vx[i] * dt;
                this.y[i] += this.vy[i] * dt;
                this.life[i] -= dt * 0.1;
            }
        }
        
        getMemoryEstimate() {
            // 5 typed arrays * 4 bytes per element
            return this.count * 5 * 4;
        }
    }
    
    // Compare memory usage and performance
    const particleCount = 1000;
    const aosParticles = new AoSParticles(particleCount);
    const soaParticles = new SoAParticles(particleCount);
    
    console.log(`    AoS estimated memory: ${aosParticles.getMemoryEstimate()} bytes`);
    console.log(`    SoA estimated memory: ${soaParticles.getMemoryEstimate()} bytes`);
    console.log(`    SoA memory savings: ~${((1 - soaParticles.getMemoryEstimate() / aosParticles.getMemoryEstimate()) * 100).toFixed(1)}%`);
    
    // Performance comparison (simplified)
    console.time('AoS update');
    for (let i = 0; i < 100; i++) {
        aosParticles.update(0.016);
    }
    console.timeEnd('AoS update');
    
    console.time('SoA update');
    for (let i = 0; i < 100; i++) {
        soaParticles.update(0.016);
    }
    console.timeEnd('SoA update');
    
    /**
     * Memory-Efficient Data Structure Benefits:
     * 
     * 1. Typed Arrays: 50-75% memory savings for numeric data
     * 2. Bit manipulation: Up to 97% savings for boolean flags
     * 3. Structure of Arrays: Better cache locality, faster batch operations
     * 4. Memory alignment: Processor-friendly data layout
     * 
     * Trade-offs:
     * - Type safety: Typed arrays lose JavaScript's dynamic typing
     * - Complexity: Bit manipulation requires more complex code
     * - Access patterns: SoA better for batch, AoS better for individual access
     */
}

demonstrateEfficientDataStructures();

// ============================================================================
// MEMORY LEAK PREVENTION STRATEGIES
// ============================================================================

/**
 * Memory Leak Prevention:
 * 
 * Advanced strategies for preventing common memory leaks in JavaScript:
 * - Event listener cleanup
 * - Timer management
 * - Closure reference management
 * - DOM reference handling
 */

function demonstrateLeakPrevention() {
    console.log('\n3. Memory Leak Prevention Strategies:');
    
    // Advanced event listener management
    console.log('  Event Listener Management:');
    
    class EventManager {
        constructor() {
            this.listeners = new Map(); // Track all listeners for cleanup
            this.abortControllers = new Map(); // Modern cleanup approach
        }
        
        // Enhanced addEventListener with automatic cleanup tracking
        addEventListener(target, event, handler, options = {}) {
            // Create abort controller for modern cleanup
            const abortController = new AbortController();
            const enhancedOptions = {
                ...options,
                signal: abortController.signal
            };
            
            // Add listener with abort signal
            target.addEventListener(event, handler, enhancedOptions);
            
            // Generate unique listener ID
            const listenerId = `${event}_${Date.now()}_${Math.random()}`;
            
            // Store listener info for manual cleanup if needed
            this.listeners.set(listenerId, {
                target,
                event,
                handler,
                abortController,
                options,
                created: Date.now()
            });
            
            this.abortControllers.set(listenerId, abortController);
            
            console.log(`    Registered listener: ${event} (ID: ${listenerId.substring(0, 20)}...)`);
            
            // Return cleanup function
            return () => this.removeListener(listenerId);
        }
        
        removeListener(listenerId) {
            const listenerInfo = this.listeners.get(listenerId);
            if (!listenerInfo) return false;
            
            // Use abort controller to remove listener
            listenerInfo.abortController.abort();
            
            // Clean up tracking
            this.listeners.delete(listenerId);
            this.abortControllers.delete(listenerId);
            
            console.log(`    Removed listener: ${listenerInfo.event}`);
            return true;
        }
        
        // Remove all listeners (prevent mass memory leaks)
        cleanup() {
            console.log(`    Cleaning up ${this.listeners.size} listeners`);
            
            // Abort all controllers
            for (const controller of this.abortControllers.values()) {
                controller.abort();
            }
            
            // Clear tracking
            this.listeners.clear();
            this.abortControllers.clear();
        }
        
        getStats() {
            return {
                activeListeners: this.listeners.size,
                oldestListener: Math.min(...Array.from(this.listeners.values()).map(l => l.created)),
                listenerTypes: Array.from(this.listeners.values()).reduce((types, listener) => {
                    types[listener.event] = (types[listener.event] || 0) + 1;
                    return types;
                }, {})
            };
        }
    }
    
    // Timer management to prevent timer-based leaks
    console.log('  Timer Management:');
    
    class TimerManager {
        constructor() {
            this.timers = new Map();
            this.intervals = new Map();
            this.animationFrames = new Set();
        }
        
        setTimeout(callback, delay, ...args) {
            const timerId = setTimeout(() => {
                callback(...args);
                this.timers.delete(timerId); // Auto-cleanup
            }, delay);
            
            this.timers.set(timerId, {
                type: 'timeout',
                callback,
                delay,
                created: Date.now()
            });
            
            console.log(`    Created timeout: ${delay}ms (${this.timers.size} active timers)`);
            return timerId;
        }
        
        setInterval(callback, interval, ...args) {
            const intervalId = setInterval(() => {
                callback(...args);
            }, interval);
            
            this.intervals.set(intervalId, {
                type: 'interval',
                callback,
                interval,
                created: Date.now()
            });
            
            console.log(`    Created interval: ${interval}ms (${this.intervals.size} active intervals)`);
            return intervalId;
        }
        
        requestAnimationFrame(callback) {
            const frameId = requestAnimationFrame((timestamp) => {
                callback(timestamp);
                this.animationFrames.delete(frameId); // Auto-cleanup
            });
            
            this.animationFrames.add(frameId);
            console.log(`    Requested animation frame (${this.animationFrames.size} pending)`);
            return frameId;
        }
        
        clearTimeout(timerId) {
            if (this.timers.has(timerId)) {
                clearTimeout(timerId);
                this.timers.delete(timerId);
                console.log(`    Cleared timeout (${this.timers.size} remaining)`);
                return true;
            }
            return false;
        }
        
        clearInterval(intervalId) {
            if (this.intervals.has(intervalId)) {
                clearInterval(intervalId);
                this.intervals.delete(intervalId);
                console.log(`    Cleared interval (${this.intervals.size} remaining)`);
                return true;
            }
            return false;
        }
        
        cancelAnimationFrame(frameId) {
            if (this.animationFrames.has(frameId)) {
                cancelAnimationFrame(frameId);
                this.animationFrames.delete(frameId);
                console.log(`    Cancelled animation frame (${this.animationFrames.size} remaining)`);
                return true;
            }
            return false;
        }
        
        cleanup() {
            // Clear all timers
            for (const timerId of this.timers.keys()) {
                clearTimeout(timerId);
            }
            
            for (const intervalId of this.intervals.keys()) {
                clearInterval(intervalId);
            }
            
            for (const frameId of this.animationFrames) {
                cancelAnimationFrame(frameId);
            }
            
            const total = this.timers.size + this.intervals.size + this.animationFrames.size;
            
            this.timers.clear();
            this.intervals.clear();
            this.animationFrames.clear();
            
            console.log(`    Cleaned up ${total} timers/frames`);
        }
        
        getStats() {
            return {
                activeTimeouts: this.timers.size,
                activeIntervals: this.intervals.size,
                pendingFrames: this.animationFrames.size,
                total: this.timers.size + this.intervals.size + this.animationFrames.size
            };
        }
    }
    
    // Test the managers
    const eventManager = new EventManager();
    const timerManager = new TimerManager();
    
    // Simulate real usage
    if (typeof document !== 'undefined') {
        const cleanup1 = eventManager.addEventListener(document, 'click', () => {
            console.log('    Document clicked');
        });
        
        const cleanup2 = eventManager.addEventListener(document, 'keydown', () => {
            console.log('    Key pressed');
        });
    }
    
    // Create some timers
    const timeoutId = timerManager.setTimeout(() => {
        console.log('    Timeout executed');
    }, 1000);
    
    const intervalId = timerManager.setInterval(() => {
        console.log('    Interval tick');
    }, 500);
    
    // Show initial stats
    console.log('  Manager stats:');
    console.log('    Event manager:', eventManager.getStats());
    console.log('    Timer manager:', timerManager.getStats());
    
    // Cleanup after a short time
    setTimeout(() => {
        console.log('  Performing cleanup:');
        eventManager.cleanup();
        timerManager.cleanup();
    }, 2000);
    
    /**
     * Memory Leak Prevention Insights:
     * 
     * 1. Event Listeners: Use AbortController for modern cleanup
     * 2. Timers: Track and cleanup all timers/intervals
     * 3. Animation Frames: Don't forget to cancel unused frames
     * 4. DOM References: Clear references to removed DOM elements
     * 5. Closures: Be careful with variables captured in closures
     * 
     * Best Practices:
     * - Always provide cleanup functions
     * - Use weak references where appropriate
     * - Implement resource managers
     * - Monitor memory usage in development
     * - Test for leaks with extended sessions
     */
}

demonstrateLeakPrevention();

// Export advanced memory management utilities
module.exports = {
    // Object pool factory
    createObjectPool: function(createFn, resetFn, initialSize = 10, maxSize = 100) {
        const pool = [];
        const borrowed = new Set();
        
        // Pre-populate
        for (let i = 0; i < initialSize; i++) {
            pool.push(createFn());
        }
        
        return {
            acquire: () => {
                const obj = pool.length > 0 ? pool.pop() : createFn();
                borrowed.add(obj);
                return obj;
            },
            
            release: (obj) => {
                if (!borrowed.has(obj)) return false;
                borrowed.delete(obj);
                if (resetFn) resetFn(obj);
                if (pool.length < maxSize) {
                    pool.push(obj);
                }
                return true;
            },
            
            stats: () => ({
                available: pool.length,
                borrowed: borrowed.size,
                capacity: maxSize
            })
        };
    },
    
    // Bit flags utility
    BitFlags: class {
        constructor(size = 32) {
            this.data = new Uint32Array(Math.ceil(size / 32));
            this.size = size;
        }
        
        set(index, value) {
            if (index >= this.size) return false;
            const wordIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            
            if (value) {
                this.data[wordIndex] |= (1 << bitIndex);
            } else {
                this.data[wordIndex] &= ~(1 << bitIndex);
            }
            return true;
        }
        
        get(index) {
            if (index >= this.size) return false;
            const wordIndex = Math.floor(index / 32);
            const bitIndex = index % 32;
            return (this.data[wordIndex] & (1 << bitIndex)) !== 0;
        }
    },
    
    // Memory-efficient particle system base class
    SoAParticles: class {
        constructor(count) {
            this.count = count;
            this.x = new Float32Array(count);
            this.y = new Float32Array(count);
            this.vx = new Float32Array(count);
            this.vy = new Float32Array(count);
            this.life = new Float32Array(count);
        }
        
        update(dt) {
            for (let i = 0; i < this.count; i++) {
                this.x[i] += this.vx[i] * dt;
                this.y[i] += this.vy[i] * dt;
                this.life[i] -= dt;
            }
        }
    },
    
    // Resource cleanup utility
    createCleanupManager: function() {
        const cleanupTasks = [];
        
        return {
            add: (cleanupFn) => {
                cleanupTasks.push(cleanupFn);
                return () => {
                    const index = cleanupTasks.indexOf(cleanupFn);
                    if (index !== -1) cleanupTasks.splice(index, 1);
                };
            },
            
            cleanup: () => {
                cleanupTasks.forEach(task => {
                    try {
                        task();
                    } catch (error) {
                        console.error('Cleanup task failed:', error);
                    }
                });
                cleanupTasks.length = 0;
            }
        };
    }
};