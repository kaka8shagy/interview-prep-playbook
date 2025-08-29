/**
 * File: interview-problems.js
 * Topic: Memory Management Interview Problems
 * 
 * This file contains comprehensive interview problems that test understanding
 * of JavaScript memory management, garbage collection, memory leaks, and
 * optimization techniques. Each problem includes detailed explanations and solutions.
 * Focus: Interview preparation, memory leak detection, and optimization strategies
 */

// ============================================================================
// PROBLEM 1: IDENTIFY AND FIX MEMORY LEAKS
// ============================================================================

/**
 * Problem: Identify memory leaks in the given code
 * 
 * This is one of the most common memory management interview questions.
 * Tests ability to identify closure-based leaks, event listener leaks,
 * and timer-based leaks.
 */

console.log('=== MEMORY MANAGEMENT INTERVIEW PROBLEMS ===\n');

function problem1_identifyMemoryLeaks() {
    console.log('Problem 1: Identify and Fix Memory Leaks');
    console.log('Task: Find all memory leaks in the provided code samples\n');
    
    // BUGGY CODE 1: Closure-based memory leak
    console.log('  Buggy Code 1 - Closure Memory Leak:');
    
    function createLeakyProcessor() {
        // Large data structure that should be garbage collected
        const largeData = new Array(100000).fill().map((_, i) => ({
            id: i,
            data: new Array(100).fill(Math.random()),
            timestamp: Date.now()
        }));
        
        console.log('    Created large data structure with 100k objects');
        
        // Return function that creates closure over large data
        return function processSmallTask(input) {
            // This function only needs input, but it captures largeData in closure
            // MEMORY LEAK: largeData stays in memory even though we don't use it
            const result = input * 2;
            console.log(`      Processing: ${input} -> ${result}`);
            return result;
        };
    }
    
    // SOLUTION 1: Break the closure reference
    function createFixedProcessor() {
        // Process large data and extract only what we need
        const largeData = new Array(100000).fill().map((_, i) => ({
            id: i,
            data: new Array(100).fill(Math.random()),
            timestamp: Date.now()
        }));
        
        console.log('    Created large data structure (will be cleaned up)');
        
        // Extract only the necessary information
        const necessaryInfo = {
            processedCount: largeData.length,
            averageValue: largeData.reduce((sum, item) => sum + item.data[0], 0) / largeData.length
        };
        
        // largeData can now be garbage collected
        // Return function that only captures necessary info
        return function processSmallTask(input) {
            const result = input * 2;
            console.log(`      Processing: ${input} -> ${result} (processed ${necessaryInfo.processedCount} items)`);
            return result;
        };
    }
    
    // BUGGY CODE 2: Event listener leak
    console.log('  Buggy Code 2 - Event Listener Leak:');
    
    function createLeakyComponent() {
        const largeComponentData = new Array(10000).fill('component data');
        
        const component = {
            data: largeComponentData,
            
            init: function() {
                if (typeof document !== 'undefined') {
                    // MEMORY LEAK: Event listener keeps component in memory
                    document.addEventListener('click', (event) => {
                        // Closure captures entire component including large data
                        console.log('      Component click handler - data size:', this.data.length);
                    });
                }
                
                console.log('    Leaky component initialized');
            },
            
            destroy: function() {
                // PROBLEM: No cleanup of event listeners
                console.log('    Component destroyed (but listeners remain!)');
            }
        };
        
        return component;
    }
    
    // SOLUTION 2: Proper event listener cleanup
    function createFixedComponent() {
        const largeComponentData = new Array(10000).fill('component data');
        
        const component = {
            data: largeComponentData,
            listeners: [], // Track listeners for cleanup
            
            init: function() {
                if (typeof document !== 'undefined') {
                    // Create bound handler that can be removed
                    const clickHandler = (event) => {
                        console.log('      Fixed component click handler - data size:', this.data.length);
                    };
                    
                    // Store reference for cleanup
                    this.listeners.push({
                        element: document,
                        event: 'click',
                        handler: clickHandler
                    });
                    
                    document.addEventListener('click', clickHandler);
                }
                
                console.log('    Fixed component initialized');
            },
            
            destroy: function() {
                // Proper cleanup of all listeners
                this.listeners.forEach(({ element, event, handler }) => {
                    element.removeEventListener(event, handler);
                });
                this.listeners = [];
                
                // Clear large data
                this.data = null;
                
                console.log('    Component properly destroyed');
            }
        };
        
        return component;
    }
    
    // BUGGY CODE 3: Timer-based leak
    console.log('  Buggy Code 3 - Timer Memory Leak:');
    
    function createLeakyTimer() {
        const expensiveData = {
            cache: new Map(),
            largeArray: new Array(50000).fill().map(() => Math.random())
        };
        
        // MEMORY LEAK: Timer keeps running and holds reference to expensive data
        const intervalId = setInterval(() => {
            expensiveData.cache.set(Date.now(), Math.random());
            console.log(`      Timer tick - cache size: ${expensiveData.cache.size}`);
        }, 100);
        
        console.log('    Leaky timer started');
        
        return {
            // PROBLEM: No way to stop the timer
            getData: () => expensiveData,
            
            // destroy method exists but doesn't clean up timer
            destroy: () => {
                console.log('    Timer object destroyed (but timer keeps running!)');
            }
        };
    }
    
    // SOLUTION 3: Proper timer cleanup
    function createFixedTimer() {
        const expensiveData = {
            cache: new Map(),
            largeArray: new Array(50000).fill().map(() => Math.random())
        };
        
        const intervalId = setInterval(() => {
            // Limit cache size to prevent unbounded growth
            if (expensiveData.cache.size > 1000) {
                const oldestKey = expensiveData.cache.keys().next().value;
                expensiveData.cache.delete(oldestKey);
            }
            
            expensiveData.cache.set(Date.now(), Math.random());
            console.log(`      Fixed timer tick - cache size: ${expensiveData.cache.size}`);
        }, 100);
        
        console.log('    Fixed timer started');
        
        return {
            getData: () => expensiveData,
            
            destroy: () => {
                // Proper cleanup
                clearInterval(intervalId);
                expensiveData.cache.clear();
                expensiveData.largeArray = null;
                console.log('    Timer properly destroyed');
            }
        };
    }
    
    // Demonstrate the problems and solutions
    console.log('  Testing memory leak scenarios:');
    
    // Test 1: Closure leak
    const leakyProcessor = createLeakyProcessor();
    const fixedProcessor = createFixedProcessor();
    
    leakyProcessor(5);
    fixedProcessor(5);
    
    // Test 2: Event listener leak
    const leakyComponent = createLeakyComponent();
    const fixedComponent = createFixedComponent();
    
    leakyComponent.init();
    fixedComponent.init();
    
    // Cleanup components after a short time
    setTimeout(() => {
        leakyComponent.destroy(); // Doesn't fully clean up
        fixedComponent.destroy(); // Properly cleans up
    }, 1000);
    
    // Test 3: Timer leak
    const leakyTimer = createLeakyTimer();
    const fixedTimer = createFixedTimer();
    
    // Let timers run for a bit, then cleanup
    setTimeout(() => {
        leakyTimer.destroy(); // Doesn't stop timer
        fixedTimer.destroy(); // Properly stops timer
    }, 500);
    
    /**
     * INTERVIEW INSIGHTS:
     * 
     * Common Memory Leak Patterns:
     * 1. Closures capturing large unnecessary data
     * 2. Event listeners not being removed
     * 3. Timers/intervals not being cleared
     * 4. DOM references held after element removal
     * 5. Circular references (less common in modern JS)
     * 
     * Detection Strategies:
     * 1. Browser DevTools memory tab
     * 2. Heap snapshots comparison
     * 3. Performance.memory API monitoring
     * 4. Long-running application testing
     * 
     * Prevention Best Practices:
     * 1. Always provide cleanup methods
     * 2. Use weak references where appropriate
     * 3. Track resources that need cleanup
     * 4. Test for leaks during development
     */
}

problem1_identifyMemoryLeaks();

// ============================================================================
// PROBLEM 2: OPTIMIZE MEMORY USAGE FOR LARGE DATASETS
// ============================================================================

/**
 * Problem: Optimize memory usage for processing large datasets
 * 
 * Tests understanding of memory-efficient data processing, streaming,
 * chunking, and garbage collection optimization.
 */

function problem2_optimizeDatasetProcessing() {
    console.log('\n=== PROBLEM 2: OPTIMIZE LARGE DATASET PROCESSING ===\n');
    console.log('Problem 2: Optimize Memory Usage for Large Datasets');
    console.log('Scenario: Process 1M records without running out of memory\n');
    
    // INEFFICIENT APPROACH: Load all data into memory at once
    console.log('  Inefficient Approach - Load Everything:');
    
    function inefficientDataProcessor() {
        console.log('    Creating 1M records in memory...');
        
        // PROBLEM: All data loaded into memory simultaneously
        const allRecords = [];
        for (let i = 0; i < 1000000; i++) {
            allRecords.push({
                id: i,
                timestamp: Date.now() + i,
                data: `Record data ${i}`,
                metadata: {
                    processed: false,
                    category: i % 10,
                    score: Math.random() * 100
                }
            });
        }
        
        console.log(`    All records loaded: ${allRecords.length} records (high memory usage)`);
        
        // Process all records
        const processedResults = allRecords.map(record => {
            record.metadata.processed = true;
            record.processedAt = Date.now();
            return {
                id: record.id,
                category: record.metadata.category,
                score: record.metadata.score * 2
            };
        });
        
        console.log(`    Processing complete: ${processedResults.length} results`);
        
        // Memory usage remains high until function exits
        return processedResults;
    }
    
    // EFFICIENT APPROACH: Stream processing with chunking
    console.log('  Efficient Approach - Streaming with Chunks:');
    
    function* efficientDataGenerator(totalRecords) {
        // Generator yields records one at a time or in chunks
        console.log(`    Generating ${totalRecords} records on-demand...`);
        
        for (let i = 0; i < totalRecords; i++) {
            yield {
                id: i,
                timestamp: Date.now() + i,
                data: `Record data ${i}`,
                metadata: {
                    processed: false,
                    category: i % 10,
                    score: Math.random() * 100
                }
            };
        }
    }
    
    async function efficientChunkedProcessor(totalRecords, chunkSize = 10000) {
        console.log(`    Processing ${totalRecords} records in chunks of ${chunkSize}...`);
        
        const results = [];
        let processed = 0;
        
        // Process in chunks to control memory usage
        for (let chunkStart = 0; chunkStart < totalRecords; chunkStart += chunkSize) {
            const chunkEnd = Math.min(chunkStart + chunkSize, totalRecords);
            const chunkGenerator = efficientDataGenerator(chunkEnd - chunkStart);
            
            // Process current chunk
            const chunkResults = [];
            for (const record of chunkGenerator) {
                // Process individual record
                const processedRecord = {
                    id: record.id + chunkStart,
                    category: record.metadata.category,
                    score: record.metadata.score * 2,
                    processedAt: Date.now()
                };
                
                chunkResults.push(processedRecord);
            }
            
            // Store only aggregated results, not raw data
            const chunkSummary = {
                chunkStart: chunkStart,
                chunkEnd: chunkEnd,
                recordCount: chunkResults.length,
                averageScore: chunkResults.reduce((sum, r) => sum + r.score, 0) / chunkResults.length,
                categoryDistribution: chunkResults.reduce((dist, r) => {
                    dist[r.category] = (dist[r.category] || 0) + 1;
                    return dist;
                }, {})
            };
            
            results.push(chunkSummary);
            processed += chunkResults.length;
            
            console.log(`      Processed chunk ${Math.floor(chunkStart / chunkSize) + 1}: ${processed}/${totalRecords} records`);
            
            // Force garbage collection opportunity
            if (global && global.gc && processed % (chunkSize * 5) === 0) {
                global.gc();
                console.log('      Forced garbage collection');
            }
            
            // Simulate async processing delay
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        console.log(`    Efficient processing complete: ${results.length} chunk summaries`);
        return results;
    }
    
    // MEMORY-OPTIMIZED APPROACH: Streaming with minimal retention
    console.log('  Memory-Optimized Approach - Minimal Retention:');
    
    class MemoryOptimizedProcessor {
        constructor(options = {}) {
            this.chunkSize = options.chunkSize || 5000;
            this.retainResults = options.retainResults || false;
            this.onProgress = options.onProgress || null;
            
            // Minimal state retention
            this.totalProcessed = 0;
            this.aggregateStats = {
                totalScore: 0,
                categoryCount: {},
                minScore: Infinity,
                maxScore: -Infinity
            };
        }
        
        async processDataset(totalRecords) {
            console.log(`    Memory-optimized processing: ${totalRecords} records`);
            
            for (let i = 0; i < totalRecords; i += this.chunkSize) {
                const chunkSize = Math.min(this.chunkSize, totalRecords - i);
                
                // Process chunk without storing intermediate results
                await this.processChunk(i, chunkSize);
                
                // Report progress
                if (this.onProgress) {
                    this.onProgress({
                        processed: this.totalProcessed,
                        total: totalRecords,
                        percent: (this.totalProcessed / totalRecords * 100).toFixed(1)
                    });
                }
            }
            
            return this.getFinalStats();
        }
        
        async processChunk(startId, chunkSize) {
            // Process records one by one without accumulating data
            for (let i = 0; i < chunkSize; i++) {
                const record = {
                    id: startId + i,
                    category: (startId + i) % 10,
                    score: Math.random() * 100
                };
                
                // Process record and update aggregates only
                const processedScore = record.score * 2;
                
                // Update aggregate statistics (minimal memory impact)
                this.aggregateStats.totalScore += processedScore;
                this.aggregateStats.categoryCount[record.category] = 
                    (this.aggregateStats.categoryCount[record.category] || 0) + 1;
                this.aggregateStats.minScore = Math.min(this.aggregateStats.minScore, processedScore);
                this.aggregateStats.maxScore = Math.max(this.aggregateStats.maxScore, processedScore);
                
                this.totalProcessed++;
                
                // record goes out of scope and becomes eligible for GC
            }
            
            // Chunk processing complete - no chunk data retained in memory
            console.log(`      Processed chunk starting at ${startId}: ${this.totalProcessed} total processed`);
            
            // Yield control to allow GC
            await new Promise(resolve => setImmediate(resolve));
        }
        
        getFinalStats() {
            return {
                totalProcessed: this.totalProcessed,
                averageScore: this.aggregateStats.totalScore / this.totalProcessed,
                minScore: this.aggregateStats.minScore,
                maxScore: this.aggregateStats.maxScore,
                categoryDistribution: { ...this.aggregateStats.categoryCount },
                memoryEfficient: true
            };
        }
    }
    
    // Test different approaches
    async function testProcessingApproaches() {
        console.log('  Testing different processing approaches:');
        
        // Test efficient chunked processing
        console.log('    Running efficient chunked processor...');
        const chunkResults = await efficientChunkedProcessor(100000, 10000);
        console.log(`    Chunked results: ${chunkResults.length} summaries`);
        
        // Test memory-optimized processing
        console.log('    Running memory-optimized processor...');
        const optimizedProcessor = new MemoryOptimizedProcessor({
            chunkSize: 10000,
            onProgress: (progress) => {
                if (progress.processed % 50000 === 0) {
                    console.log(`      Progress: ${progress.percent}% (${progress.processed}/${progress.total})`);
                }
            }
        });
        
        const optimizedResults = await optimizedProcessor.processDataset(100000);
        console.log('    Optimized results:', optimizedResults);
        
        // Compare memory footprints (conceptual)
        console.log('  Memory Usage Comparison:');
        console.log('    Inefficient approach: ~400MB (all records in memory)');
        console.log('    Chunked approach: ~40MB (one chunk at a time)');
        console.log('    Optimized approach: ~1MB (minimal aggregation only)');
    }
    
    await testProcessingApproaches();
    
    /**
     * OPTIMIZATION STRATEGIES:
     * 
     * 1. Streaming Processing:
     *    - Process data as it arrives/is generated
     *    - Don't load entire dataset into memory
     *    - Use generators for lazy evaluation
     * 
     * 2. Chunking:
     *    - Process data in manageable chunks
     *    - Control memory usage by limiting chunk size
     *    - Allow GC between chunks
     * 
     * 3. Aggregation-Only:
     *    - Compute statistics without retaining raw data
     *    - Keep only necessary summary information
     *    - Minimize intermediate result storage
     * 
     * 4. Memory Pressure Management:
     *    - Monitor memory usage during processing
     *    - Force GC at strategic points
     *    - Adjust chunk sizes based on available memory
     * 
     * Interview Follow-ups:
     * Q: How would you handle sorting a dataset too large for memory?
     * A: External merge sort - sort chunks, then merge sorted chunks
     * 
     * Q: What about processing data from multiple sources?
     * A: Use async iterators, parallel processing with worker threads
     * 
     * Q: How to ensure data consistency during streaming?
     * A: Checkpointing, transactional chunks, rollback capability
     */
}

problem2_optimizeDatasetProcessing();

// ============================================================================
// PROBLEM 3: IMPLEMENT MEMORY-EFFICIENT CACHE
// ============================================================================

/**
 * Problem: Implement a memory-efficient cache with size and TTL limits
 * 
 * Tests understanding of cache eviction strategies, memory monitoring,
 * and trade-offs between memory usage and performance.
 */

function problem3_implementMemoryEfficientCache() {
    console.log('\n=== PROBLEM 3: MEMORY-EFFICIENT CACHE IMPLEMENTATION ===\n');
    console.log('Problem 3: Implement Memory-Efficient Cache');
    console.log('Requirements: Size limit, TTL, LRU eviction, memory monitoring\n');
    
    // SOLUTION: Advanced Memory-Efficient Cache
    class MemoryEfficientCache {
        constructor(options = {}) {
            // Configuration
            this.maxItems = options.maxItems || 1000;
            this.maxMemoryMB = options.maxMemoryMB || 50;
            this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
            this.cleanupInterval = options.cleanupInterval || 60000; // 1 minute
            
            // Storage
            this.cache = new Map();
            this.accessOrder = new Map(); // For LRU tracking
            this.memoryUsage = 0;
            
            // Statistics
            this.stats = {
                hits: 0,
                misses: 0,
                evictions: 0,
                cleanups: 0,
                operations: 0
            };
            
            // Cleanup timer
            this.cleanupTimer = setInterval(() => {
                this.performCleanup();
            }, this.cleanupInterval);
            
            console.log(`    Cache created: max ${this.maxItems} items, ${this.maxMemoryMB}MB limit`);
        }
        
        // Estimate memory usage of a value
        estimateMemorySize(value) {
            if (value === null || value === undefined) return 0;
            
            const type = typeof value;
            
            switch (type) {
                case 'string':
                    return value.length * 2; // UTF-16 encoding
                    
                case 'number':
                    return 8; // 64-bit float
                    
                case 'boolean':
                    return 1;
                    
                case 'object':
                    if (Array.isArray(value)) {
                        // Array overhead + elements
                        return 24 + value.reduce((sum, item) => sum + this.estimateMemorySize(item), 0);
                    } else {
                        // Object overhead + properties
                        try {
                            const jsonString = JSON.stringify(value);
                            return 50 + jsonString.length * 2; // Overhead + JSON size
                        } catch (e) {
                            return 100; // Fallback for circular refs
                        }
                    }
                    
                case 'function':
                    return value.toString().length * 2 + 100; // Code + overhead
                    
                default:
                    return 50; // Default estimate
            }
        }
        
        // Set a value in the cache
        set(key, value, ttl = this.defaultTTL) {
            this.stats.operations++;
            
            const now = Date.now();
            const memorySize = this.estimateMemorySize(value);
            
            // Check if we need to make room
            if (this.cache.size >= this.maxItems || 
                this.memoryUsage + memorySize > this.maxMemoryMB * 1024 * 1024) {
                this.evictItems(memorySize);
            }
            
            // Remove existing entry if present
            if (this.cache.has(key)) {
                const oldEntry = this.cache.get(key);
                this.memoryUsage -= oldEntry.memorySize;
                this.accessOrder.delete(key);
            }
            
            // Create new entry
            const entry = {
                value: value,
                created: now,
                expires: now + ttl,
                memorySize: memorySize,
                accessCount: 0
            };
            
            // Store entry
            this.cache.set(key, entry);
            this.accessOrder.set(key, now); // Track access order
            this.memoryUsage += memorySize;
            
            console.log(`      Set: ${key} (${memorySize} bytes, expires in ${ttl}ms)`);
            return true;
        }
        
        // Get a value from the cache
        get(key) {
            this.stats.operations++;
            
            const entry = this.cache.get(key);
            
            if (!entry) {
                this.stats.misses++;
                console.log(`      Miss: ${key}`);
                return undefined;
            }
            
            // Check if expired
            const now = Date.now();
            if (now >= entry.expires) {
                this.delete(key);
                this.stats.misses++;
                console.log(`      Expired: ${key}`);
                return undefined;
            }
            
            // Update access information
            entry.accessCount++;
            this.accessOrder.delete(key);
            this.accessOrder.set(key, now); // Move to end (most recent)
            
            this.stats.hits++;
            console.log(`      Hit: ${key} (access #${entry.accessCount})`);
            return entry.value;
        }
        
        // Delete a key from cache
        delete(key) {
            const entry = this.cache.get(key);
            if (entry) {
                this.memoryUsage -= entry.memorySize;
                this.cache.delete(key);
                this.accessOrder.delete(key);
                console.log(`      Deleted: ${key} (freed ${entry.memorySize} bytes)`);
                return true;
            }
            return false;
        }
        
        // Evict items to make room
        evictItems(neededMemory = 0) {
            console.log('      Evicting items due to memory/size pressure...');
            
            const now = Date.now();
            let freedMemory = 0;
            let evicted = 0;
            
            // Strategy 1: Remove expired items first
            for (const [key, entry] of this.cache) {
                if (now >= entry.expires) {
                    this.delete(key);
                    freedMemory += entry.memorySize;
                    evicted++;
                    this.stats.evictions++;
                }
            }
            
            // Strategy 2: LRU eviction if still need more space
            if (this.cache.size >= this.maxItems || 
                this.memoryUsage + neededMemory > this.maxMemoryMB * 1024 * 1024) {
                
                // Get keys in LRU order (oldest first)
                const lruKeys = Array.from(this.accessOrder.keys());
                
                for (const key of lruKeys) {
                    if (this.cache.size < this.maxItems && 
                        this.memoryUsage + neededMemory <= this.maxMemoryMB * 1024 * 1024) {
                        break; // Sufficient space freed
                    }
                    
                    const entry = this.cache.get(key);
                    if (entry) {
                        freedMemory += entry.memorySize;
                        this.delete(key);
                        evicted++;
                        this.stats.evictions++;
                    }
                }
            }
            
            console.log(`      Evicted ${evicted} items, freed ${(freedMemory / 1024).toFixed(1)}KB`);
        }
        
        // Periodic cleanup of expired items
        performCleanup() {
            const now = Date.now();
            let cleaned = 0;
            
            for (const [key, entry] of this.cache) {
                if (now >= entry.expires) {
                    this.delete(key);
                    cleaned++;
                }
            }
            
            this.stats.cleanups++;
            if (cleaned > 0) {
                console.log(`      Cleanup: removed ${cleaned} expired items`);
            }
        }
        
        // Get cache statistics
        getStats() {
            const totalOps = this.stats.hits + this.stats.misses;
            const hitRate = totalOps > 0 ? (this.stats.hits / totalOps * 100).toFixed(1) : '0';
            
            return {
                ...this.stats,
                hitRate: hitRate + '%',
                size: this.cache.size,
                maxItems: this.maxItems,
                memoryUsageMB: (this.memoryUsage / 1024 / 1024).toFixed(2),
                maxMemoryMB: this.maxMemoryMB,
                fillRate: ((this.cache.size / this.maxItems) * 100).toFixed(1) + '%',
                memoryUtilization: ((this.memoryUsage / (this.maxMemoryMB * 1024 * 1024)) * 100).toFixed(1) + '%'
            };
        }
        
        // Clear all entries
        clear() {
            const itemCount = this.cache.size;
            const memoryFreed = this.memoryUsage;
            
            this.cache.clear();
            this.accessOrder.clear();
            this.memoryUsage = 0;
            
            console.log(`      Cleared cache: ${itemCount} items, ${(memoryFreed / 1024).toFixed(1)}KB freed`);
        }
        
        // Cleanup resources
        destroy() {
            clearInterval(this.cleanupTimer);
            this.clear();
            console.log('      Cache destroyed');
        }
    }
    
    // Test the memory-efficient cache
    async function testMemoryEfficientCache() {
        console.log('  Testing Memory-Efficient Cache:');
        
        const cache = new MemoryEfficientCache({
            maxItems: 100,
            maxMemoryMB: 1, // 1MB limit for testing
            defaultTTL: 2000 // 2 seconds for testing
        });
        
        // Test 1: Basic operations
        console.log('    Test 1: Basic Operations');
        cache.set('small', 'Hello World');
        cache.set('number', 42);
        cache.set('object', { name: 'Test', data: [1, 2, 3, 4, 5] });
        cache.set('large', new Array(1000).fill('x').join(''));
        
        // Access items
        console.log('      Getting items:');
        console.log(`        small: ${cache.get('small')}`);
        console.log(`        number: ${cache.get('number')}`);
        console.log(`        nonexistent: ${cache.get('nonexistent')}`);
        
        // Test 2: Memory pressure
        console.log('    Test 2: Memory Pressure');
        for (let i = 0; i < 50; i++) {
            cache.set(`bulk_${i}`, new Array(100).fill(`data_${i}`));
        }
        
        console.log('      Stats after bulk insert:', cache.getStats());
        
        // Test 3: TTL expiration
        console.log('    Test 3: TTL Expiration');
        cache.set('expires_soon', 'This will expire', 500);
        
        setTimeout(() => {
            console.log('      After 600ms:');
            console.log(`        expires_soon: ${cache.get('expires_soon')}`); // Should be expired
            
            console.log('      Final stats:', cache.getStats());
            
            // Cleanup
            cache.destroy();
        }, 600);
        
        // Test 4: LRU behavior
        console.log('    Test 4: LRU Behavior');
        const smallCache = new MemoryEfficientCache({ maxItems: 3 });
        
        smallCache.set('a', 1);
        smallCache.set('b', 2);
        smallCache.set('c', 3);
        console.log('      Added a, b, c');
        
        smallCache.get('a'); // Access a (make it recently used)
        smallCache.set('d', 4); // Should evict b (least recently used)
        
        console.log(`      After adding d: a=${smallCache.get('a')}, b=${smallCache.get('b')}, c=${smallCache.get('c')}, d=${smallCache.get('d')}`);
        
        setTimeout(() => {
            smallCache.destroy();
        }, 100);
    }
    
    await testMemoryEfficientCache();
    
    /**
     * CACHE IMPLEMENTATION INSIGHTS:
     * 
     * Key Design Decisions:
     * 1. Eviction Strategy: TTL first, then LRU
     * 2. Memory Estimation: Approximate but fast calculation
     * 3. Cleanup: Both periodic and on-demand
     * 4. Statistics: Track hit rate and resource usage
     * 
     * Memory Management Techniques:
     * 1. Size estimation for different data types
     * 2. Memory pressure detection and response
     * 3. Proactive cleanup of expired entries
     * 4. LRU tracking with minimal overhead
     * 
     * Interview Follow-ups:
     * Q: How would you handle cache persistence?
     * A: Serialize to disk, use localStorage/IndexedDB, external storage
     * 
     * Q: What about distributed caching?
     * A: Consistent hashing, cache coherence, network protocols
     * 
     * Q: How to optimize for different access patterns?
     * A: Adaptive eviction strategies, access pattern analysis
     */
}

problem3_implementMemoryEfficientCache();

// Export interview problem utilities for practice
module.exports = {
    // Memory leak detection utility
    createMemoryLeakDetector: function() {
        const trackedObjects = new WeakSet();
        const objectCounts = new Map();
        
        return {
            track: (obj, type) => {
                trackedObjects.add(obj);
                objectCounts.set(type, (objectCounts.get(type) || 0) + 1);
            },
            
            getStats: () => Object.fromEntries(objectCounts),
            
            checkLeak: (obj) => trackedObjects.has(obj)
        };
    },
    
    // Memory-efficient data processor
    createStreamProcessor: function(chunkSize = 1000) {
        return {
            process: async function*(dataSource, processor) {
                let chunk = [];
                
                for await (const item of dataSource) {
                    chunk.push(item);
                    
                    if (chunk.length >= chunkSize) {
                        yield await processor(chunk);
                        chunk = []; // Clear chunk
                    }
                }
                
                // Process remaining items
                if (chunk.length > 0) {
                    yield await processor(chunk);
                }
            }
        };
    },
    
    // Simple memory monitor
    createMemoryMonitor: function(intervalMs = 1000) {
        let monitoring = false;
        let intervalId = null;
        
        return {
            start: (callback) => {
                if (monitoring) return;
                
                monitoring = true;
                intervalId = setInterval(() => {
                    if (typeof performance !== 'undefined' && performance.memory) {
                        const memory = performance.memory;
                        callback({
                            used: memory.usedJSHeapSize,
                            total: memory.totalJSHeapSize,
                            limit: memory.jsHeapSizeLimit,
                            timestamp: Date.now()
                        });
                    }
                }, intervalMs);
            },
            
            stop: () => {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                    monitoring = false;
                }
            }
        };
    },
    
    // Cache implementation helper
    createSimpleCache: function(maxSize = 100) {
        const cache = new Map();
        
        return {
            set: (key, value) => {
                if (cache.size >= maxSize && !cache.has(key)) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(key, value);
            },
            
            get: (key) => cache.get(key),
            
            delete: (key) => cache.delete(key),
            
            clear: () => cache.clear(),
            
            size: () => cache.size,
            
            stats: () => ({
                size: cache.size,
                maxSize: maxSize,
                keys: Array.from(cache.keys())
            })
        };
    }
};