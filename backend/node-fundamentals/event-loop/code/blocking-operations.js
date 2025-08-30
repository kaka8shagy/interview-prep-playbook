/**
 * File: blocking-operations.js
 * Description: Demonstrates how blocking operations affect the event loop
 * 
 * Learning objectives:
 * - Understand what constitutes a "blocking" operation
 * - Learn techniques to measure event loop lag
 * - See strategies to avoid blocking the event loop
 * - Implement worker threads for CPU-intensive tasks
 * 
 * Key Concepts:
 * - Operations taking >10ms can cause noticeable lag
 * - Synchronous operations block ALL async callbacks
 * - Event loop lag measurement is crucial for performance monitoring
 * - Worker threads and streaming can prevent blocking
 */

const { performance } = require('perf_hooks');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const crypto = require('crypto');

console.log('=== Event Loop Blocking Operations Demo ===\n');

/**
 * Demonstration 1: Event Loop Lag Measurement
 * Shows how to detect when the event loop is being blocked
 */
class EventLoopMonitor {
    constructor(sampleInterval = 100) {
        this.sampleInterval = sampleInterval;
        this.lagHistory = [];
        this.isMonitoring = false;
    }
    
    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        
        console.log('--- Starting Event Loop Monitor ---');
        this.measureLag();
    }
    
    stop() {
        this.isMonitoring = false;
        console.log('--- Event Loop Monitor Stopped ---');
        this.printStats();
    }
    
    measureLag() {
        if (!this.isMonitoring) return;
        
        const start = process.hrtime.bigint();
        
        // Schedule callback and measure actual delay
        setImmediate(() => {
            const end = process.hrtime.bigint();
            const lag = Number(end - start) / 1000000; // Convert to milliseconds
            
            this.lagHistory.push({
                timestamp: Date.now(),
                lag: lag
            });
            
            // Alert if lag is significant (>10ms typically indicates issues)
            if (lag > 10) {
                console.log(`⚠️  High Event Loop Lag: ${lag.toFixed(2)}ms`);
            }
            
            // Continue monitoring
            setTimeout(() => this.measureLag(), this.sampleInterval);
        });
    }
    
    printStats() {
        if (this.lagHistory.length === 0) return;
        
        const lags = this.lagHistory.map(h => h.lag);
        const avgLag = lags.reduce((a, b) => a + b, 0) / lags.length;
        const maxLag = Math.max(...lags);
        const minLag = Math.min(...lags);
        
        console.log('\n--- Event Loop Lag Statistics ---');
        console.log(`Samples: ${lags.length}`);
        console.log(`Average Lag: ${avgLag.toFixed(2)}ms`);
        console.log(`Maximum Lag: ${maxLag.toFixed(2)}ms`);
        console.log(`Minimum Lag: ${minLag.toFixed(2)}ms`);
        
        // Performance assessment
        if (maxLag > 100) {
            console.log('🚨 Critical: Event loop severely blocked');
        } else if (maxLag > 50) {
            console.log('⚠️  Warning: Significant event loop blocking detected');
        } else if (maxLag > 10) {
            console.log('ℹ️  Info: Minor event loop delays observed');
        } else {
            console.log('✅ Good: Event loop performance is healthy');
        }
    }
}

/**
 * Demonstration 2: Blocking Synchronous Operations
 * Shows different types of operations that can block the event loop
 */
function demonstrateBlockingOperations() {
    console.log('\n--- Blocking Operations Demo ---');
    
    const monitor = new EventLoopMonitor(50);
    monitor.start();
    
    // Schedule some async operations that should execute quickly
    const asyncOperations = [];
    for (let i = 0; i < 5; i++) {
        const start = performance.now();
        setTimeout(() => {
            const delay = performance.now() - start;
            asyncOperations.push(delay);
            console.log(`Async operation ${i + 1} completed after ${delay.toFixed(2)}ms`);
        }, 10 * (i + 1));
    }
    
    // Blocking operation 1: CPU-intensive computation
    setTimeout(() => {
        console.log('Starting CPU-intensive computation...');
        const start = performance.now();
        
        // Simulate heavy computation (finding prime numbers)
        let primes = [];
        for (let num = 2; num < 10000; num++) {
            let isPrime = true;
            for (let i = 2; i <= Math.sqrt(num); i++) {
                if (num % i === 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) primes.push(num);
        }
        
        const duration = performance.now() - start;
        console.log(`CPU computation completed in ${duration.toFixed(2)}ms (found ${primes.length} primes)`);
    }, 100);
    
    // Blocking operation 2: Synchronous I/O
    setTimeout(() => {
        console.log('Starting synchronous file operation...');
        const start = performance.now();
        
        try {
            // Read this file synchronously (blocking)
            const content = fs.readFileSync(__filename, 'utf8');
            const duration = performance.now() - start;
            console.log(`Sync file read completed in ${duration.toFixed(2)}ms (${content.length} bytes)`);
        } catch (error) {
            console.error('File read error:', error.message);
        }
    }, 200);
    
    // Blocking operation 3: Large JSON parsing
    setTimeout(() => {
        console.log('Starting large JSON operation...');
        const start = performance.now();
        
        // Create and parse large JSON object
        const largeObject = {};
        for (let i = 0; i < 10000; i++) {
            largeObject[`key_${i}`] = {
                id: i,
                name: `item_${i}`,
                data: Array(100).fill(i).map(x => x * Math.random()),
                timestamp: new Date().toISOString()
            };
        }
        
        const jsonString = JSON.stringify(largeObject);
        const parsed = JSON.parse(jsonString);
        
        const duration = performance.now() - start;
        console.log(`JSON operation completed in ${duration.toFixed(2)}ms (${jsonString.length} chars)`);
    }, 300);
    
    // Stop monitoring after all operations complete
    setTimeout(() => {
        monitor.stop();
        
        console.log('\n--- Async Operations Summary ---');
        asyncOperations.forEach((delay, i) => {
            console.log(`Operation ${i + 1}: Expected ~${(i + 1) * 10}ms, Actual ${delay.toFixed(2)}ms`);
        });
    }, 500);
}

/**
 * Demonstration 3: Non-Blocking Alternatives
 * Shows how to refactor blocking operations to be non-blocking
 */
function demonstrateNonBlockingAlternatives() {
    console.log('\n--- Non-Blocking Alternatives Demo ---');
    
    const monitor = new EventLoopMonitor(50);
    monitor.start();
    
    // Non-blocking alternative 1: Break work into chunks
    function nonBlockingPrimeCalculation(max, chunkSize = 1000) {
        return new Promise((resolve) => {
            const primes = [];
            let current = 2;
            
            function processChunk() {
                const chunkEnd = Math.min(current + chunkSize, max);
                
                // Process chunk synchronously
                for (let num = current; num < chunkEnd; num++) {
                    let isPrime = true;
                    for (let i = 2; i <= Math.sqrt(num); i++) {
                        if (num % i === 0) {
                            isPrime = false;
                            break;
                        }
                    }
                    if (isPrime) primes.push(num);
                }
                
                current = chunkEnd;
                
                // Check if more work remains
                if (current < max) {
                    // Schedule next chunk in next tick to avoid blocking
                    setImmediate(processChunk);
                } else {
                    resolve(primes);
                }
            }
            
            // Start processing
            processChunk();
        });
    }
    
    // Non-blocking alternative 2: Worker threads for CPU-intensive tasks
    function workerThreadCalculation(max) {
        return new Promise((resolve, reject) => {
            // Worker thread code (would normally be in separate file)
            const workerCode = `
                const { parentPort, workerData } = require('worker_threads');
                
                function calculatePrimes(max) {
                    const primes = [];
                    for (let num = 2; num < max; num++) {
                        let isPrime = true;
                        for (let i = 2; i <= Math.sqrt(num); i++) {
                            if (num % i === 0) {
                                isPrime = false;
                                break;
                            }
                        }
                        if (isPrime) primes.push(num);
                    }
                    return primes;
                }
                
                const primes = calculatePrimes(workerData.max);
                parentPort.postMessage({ primes, count: primes.length });
            `;
            
            try {
                const worker = new Worker(workerCode, {
                    eval: true,
                    workerData: { max }
                });
                
                worker.on('message', (result) => {
                    worker.terminate();
                    resolve(result);
                });
                
                worker.on('error', reject);
            } catch (error) {
                // Fallback to main thread if worker threads not available
                console.log('Worker threads not available, using chunked processing');
                nonBlockingPrimeCalculation(max).then(primes => resolve({ primes, count: primes.length }));
            }
        });
    }
    
    // Non-blocking alternative 3: Async file operations
    function nonBlockingFileOperation(filename) {
        return new Promise((resolve, reject) => {
            const start = performance.now();
            
            fs.readFile(filename, 'utf8', (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    const duration = performance.now() - start;
                    resolve({ content, duration, size: content.length });
                }
            });
        });
    }
    
    // Execute non-blocking alternatives
    setTimeout(async () => {
        console.log('Starting non-blocking prime calculation (chunked)...');
        const chunkStart = performance.now();
        const chunkResult = await nonBlockingPrimeCalculation(5000, 500);
        const chunkDuration = performance.now() - chunkStart;
        console.log(`Chunked calculation: ${chunkResult.length} primes in ${chunkDuration.toFixed(2)}ms`);
    }, 100);
    
    setTimeout(async () => {
        console.log('Starting worker thread calculation...');
        const workerStart = performance.now();
        try {
            const workerResult = await workerThreadCalculation(5000);
            const workerDuration = performance.now() - workerStart;
            console.log(`Worker thread calculation: ${workerResult.count} primes in ${workerDuration.toFixed(2)}ms`);
        } catch (error) {
            console.log('Worker thread failed:', error.message);
        }
    }, 200);
    
    setTimeout(async () => {
        console.log('Starting async file operation...');
        try {
            const fileResult = await nonBlockingFileOperation(__filename);
            console.log(`Async file read: ${fileResult.size} bytes in ${fileResult.duration.toFixed(2)}ms`);
        } catch (error) {
            console.error('Async file read error:', error.message);
        }
    }, 300);
    
    // Schedule some concurrent operations to show they're not blocked
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            console.log(`Concurrent operation ${i + 1} executed at ${Date.now()}`);
        }, 50 + i * 100);
    }
    
    setTimeout(() => {
        monitor.stop();
    }, 800);
}

/**
 * Demonstration 4: Production Monitoring Pattern
 * Real-world event loop monitoring for production applications
 */
function productionMonitoringExample() {
    console.log('\n--- Production Monitoring Example ---');
    
    class ProductionEventLoopMonitor {
        constructor(options = {}) {
            this.warningThreshold = options.warningThreshold || 10; // ms
            this.criticalThreshold = options.criticalThreshold || 100; // ms
            this.sampleInterval = options.sampleInterval || 1000; // ms
            this.historySize = options.historySize || 100;
            
            this.metrics = {
                samples: 0,
                totalLag: 0,
                maxLag: 0,
                warningCount: 0,
                criticalCount: 0,
                history: []
            };
            
            this.isRunning = false;
        }
        
        start() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            this.monitor();
            console.log('Production event loop monitoring started');
        }
        
        stop() {
            this.isRunning = false;
            console.log('Production event loop monitoring stopped');
        }
        
        monitor() {
            if (!this.isRunning) return;
            
            const start = process.hrtime.bigint();
            
            setImmediate(() => {
                const end = process.hrtime.bigint();
                const lag = Number(end - start) / 1000000;
                
                this.recordMetrics(lag);
                
                setTimeout(() => this.monitor(), this.sampleInterval);
            });
        }
        
        recordMetrics(lag) {
            this.metrics.samples++;
            this.metrics.totalLag += lag;
            this.metrics.maxLag = Math.max(this.metrics.maxLag, lag);
            
            if (lag > this.criticalThreshold) {
                this.metrics.criticalCount++;
                console.log(`🚨 CRITICAL Event Loop Lag: ${lag.toFixed(2)}ms`);
            } else if (lag > this.warningThreshold) {
                this.metrics.warningCount++;
                console.log(`⚠️  WARNING Event Loop Lag: ${lag.toFixed(2)}ms`);
            }
            
            // Maintain rolling history
            this.metrics.history.push({ timestamp: Date.now(), lag });
            if (this.metrics.history.length > this.historySize) {
                this.metrics.history.shift();
            }
        }
        
        getMetrics() {
            const avgLag = this.metrics.samples > 0 ? 
                this.metrics.totalLag / this.metrics.samples : 0;
            
            return {
                ...this.metrics,
                averageLag: avgLag,
                healthStatus: this.getHealthStatus(avgLag)
            };
        }
        
        getHealthStatus(avgLag) {
            if (avgLag > this.criticalThreshold || this.metrics.criticalCount > 0) {
                return 'critical';
            } else if (avgLag > this.warningThreshold || this.metrics.warningCount > 5) {
                return 'warning';
            } else {
                return 'healthy';
            }
        }
    }
    
    // Start production monitoring
    const prodMonitor = new ProductionEventLoopMonitor({
        warningThreshold: 5,
        criticalThreshold: 50,
        sampleInterval: 500
    });
    
    prodMonitor.start();
    
    // Simulate some load
    setTimeout(() => {
        // Light load
        for (let i = 0; i < 1000; i++) {
            Math.sqrt(i);
        }
    }, 1000);
    
    setTimeout(() => {
        // Heavy load
        const heavyStart = performance.now();
        while (performance.now() - heavyStart < 60) {
            // Busy wait for 60ms
        }
    }, 2000);
    
    setTimeout(() => {
        const metrics = prodMonitor.getMetrics();
        console.log('\n--- Production Monitoring Results ---');
        console.log(`Health Status: ${metrics.healthStatus}`);
        console.log(`Total Samples: ${metrics.samples}`);
        console.log(`Average Lag: ${metrics.averageLag.toFixed(2)}ms`);
        console.log(`Maximum Lag: ${metrics.maxLag.toFixed(2)}ms`);
        console.log(`Warnings: ${metrics.warningCount}`);
        console.log(`Critical Events: ${metrics.criticalCount}`);
        
        prodMonitor.stop();
    }, 4000);
}

// Run all demonstrations sequentially
console.log('Starting blocking operations analysis...\n');

// Allow some initial setup time
setTimeout(() => {
    demonstrateBlockingOperations();
    
    setTimeout(() => {
        demonstrateNonBlockingAlternatives();
        
        setTimeout(() => {
            productionMonitoringExample();
        }, 1000);
    }, 1000);
}, 100);

/**
 * Production Best Practices:
 * 
 * 1. Monitor Event Loop Performance:
 *    - Use tools like clinic.js, @nodejs/clinic, or custom monitoring
 *    - Set alerts for sustained high lag (>10ms)
 *    - Track lag trends over time
 * 
 * 2. Avoid Blocking Operations:
 *    - Use async versions of filesystem operations
 *    - Break CPU-intensive work into chunks
 *    - Offload heavy computation to worker threads
 * 
 * 3. Optimization Strategies:
 *    - Profile your application to identify bottlenecks
 *    - Use streaming for large data processing
 *    - Implement connection pooling for databases
 *    - Consider clustering for CPU-bound applications
 * 
 * 4. Error Handling:
 *    - Implement circuit breakers for external dependencies
 *    - Use proper timeout mechanisms
 *    - Monitor and log performance metrics
 */

module.exports = {
    EventLoopMonitor,
    demonstrateBlockingOperations,
    demonstrateNonBlockingAlternatives,
    productionMonitoringExample
};