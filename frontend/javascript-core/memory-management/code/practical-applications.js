/**
 * File: practical-applications.js
 * Topic: Practical Memory Management Applications
 * 
 * This file demonstrates real-world memory management scenarios including
 * production-ready patterns for web applications, memory monitoring,
 * and performance optimization techniques used in professional development.
 * Focus: Production patterns, monitoring, and real-world optimization
 */

// ============================================================================
// WEB APPLICATION MEMORY MANAGEMENT
// ============================================================================

/**
 * Web Application Memory Patterns:
 * 
 * Real-world memory management for web applications including:
 * - Component lifecycle management
 * - Cache implementations
 * - Image and media handling
 * - Large dataset processing
 */

console.log('=== PRACTICAL MEMORY MANAGEMENT APPLICATIONS ===\n');

function demonstrateWebAppMemoryManagement() {
    console.log('1. Web Application Memory Management:');
    
    // Component lifecycle manager for framework-agnostic memory management
    class ComponentMemoryManager {
        constructor() {
            this.components = new Map();
            this.globalCleanupTasks = [];
            this.memoryThreshold = 50 * 1024 * 1024; // 50MB threshold
            
            console.log('  Component memory manager initialized');
            this.startMemoryMonitoring();
        }
        
        // Register a component with its cleanup requirements
        registerComponent(componentId, cleanupConfig) {
            const component = {
                id: componentId,
                createdAt: Date.now(),
                eventListeners: [],
                timers: [],
                observers: [],
                subscriptions: [],
                domRefs: new Set(),
                customCleanup: cleanupConfig.customCleanup || null,
                memoryUsage: 0
            };
            
            this.components.set(componentId, component);
            console.log(`    Registered component: ${componentId}`);
            
            return {
                // Helper methods for the component to register resources
                addEventListener: (target, event, handler, options) => {
                    const cleanup = () => target.removeEventListener(event, handler, options);
                    target.addEventListener(event, handler, options);
                    component.eventListeners.push(cleanup);
                    return cleanup;
                },
                
                setTimeout: (callback, delay) => {
                    const timerId = setTimeout(callback, delay);
                    const cleanup = () => clearTimeout(timerId);
                    component.timers.push(cleanup);
                    return timerId;
                },
                
                setInterval: (callback, interval) => {
                    const intervalId = setInterval(callback, interval);
                    const cleanup = () => clearInterval(intervalId);
                    component.timers.push(cleanup);
                    return intervalId;
                },
                
                observeDOM: (target, callback, options) => {
                    if (typeof MutationObserver !== 'undefined') {
                        const observer = new MutationObserver(callback);
                        observer.observe(target, options);
                        const cleanup = () => observer.disconnect();
                        component.observers.push(cleanup);
                        return observer;
                    }
                    return null;
                },
                
                addDOMRef: (element) => {
                    component.domRefs.add(element);
                    return element;
                },
                
                addSubscription: (subscription) => {
                    const cleanup = () => {
                        if (subscription && typeof subscription.unsubscribe === 'function') {
                            subscription.unsubscribe();
                        }
                    };
                    component.subscriptions.push(cleanup);
                    return cleanup;
                }
            };
        }
        
        // Unregister component and perform cleanup
        unregisterComponent(componentId) {
            const component = this.components.get(componentId);
            if (!component) return false;
            
            console.log(`    Cleaning up component: ${componentId}`);
            
            // Clean up all registered resources
            let cleanupCount = 0;
            
            // Event listeners
            component.eventListeners.forEach(cleanup => {
                cleanup();
                cleanupCount++;
            });
            
            // Timers
            component.timers.forEach(cleanup => {
                cleanup();
                cleanupCount++;
            });
            
            // Observers
            component.observers.forEach(cleanup => {
                cleanup();
                cleanupCount++;
            });
            
            // Subscriptions
            component.subscriptions.forEach(cleanup => {
                cleanup();
                cleanupCount++;
            });
            
            // DOM references
            component.domRefs.clear();
            
            // Custom cleanup
            if (component.customCleanup) {
                component.customCleanup();
            }
            
            this.components.delete(componentId);
            console.log(`    Component ${componentId} cleaned up (${cleanupCount} resources)`);
            
            return true;
        }
        
        // Memory monitoring for the application
        startMemoryMonitoring() {
            const checkMemory = () => {
                if (typeof performance !== 'undefined' && performance.memory) {
                    const memInfo = performance.memory;
                    const usedMB = memInfo.usedJSHeapSize / 1024 / 1024;
                    const totalMB = memInfo.totalJSHeapSize / 1024 / 1024;
                    const limitMB = memInfo.jsHeapSizeLimit / 1024 / 1024;
                    
                    console.log(`    Memory usage: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB`);
                    
                    // Trigger cleanup if memory usage is high
                    if (memInfo.usedJSHeapSize > this.memoryThreshold) {
                        this.performMemoryCleanup();
                    }
                }
            };
            
            // Check memory every 30 seconds
            this.globalCleanupTasks.push(() => clearInterval(
                setInterval(checkMemory, 30000)
            ));
            
            // Initial check
            checkMemory();
        }
        
        // Emergency memory cleanup
        performMemoryCleanup() {
            console.log('  Performing emergency memory cleanup:');
            
            const oldComponents = [];
            const now = Date.now();
            const maxAge = 10 * 60 * 1000; // 10 minutes
            
            // Find old components
            for (const [id, component] of this.components) {
                if (now - component.createdAt > maxAge) {
                    oldComponents.push(id);
                }
            }
            
            // Clean up old components
            oldComponents.forEach(id => {
                console.log(`    Cleaning up old component: ${id}`);
                this.unregisterComponent(id);
            });
            
            // Force garbage collection if available
            if (global && global.gc) {
                global.gc();
                console.log('    Forced garbage collection');
            }
        }
        
        // Get memory statistics
        getStats() {
            const stats = {
                totalComponents: this.components.size,
                componentAges: [],
                totalResources: 0
            };
            
            const now = Date.now();
            for (const component of this.components.values()) {
                const age = now - component.createdAt;
                stats.componentAges.push(age);
                
                stats.totalResources += 
                    component.eventListeners.length +
                    component.timers.length +
                    component.observers.length +
                    component.subscriptions.length +
                    component.domRefs.size;
            }
            
            return stats;
        }
        
        // Cleanup the manager itself
        destroy() {
            // Clean up all components
            for (const componentId of this.components.keys()) {
                this.unregisterComponent(componentId);
            }
            
            // Clean up global tasks
            this.globalCleanupTasks.forEach(cleanup => cleanup());
            this.globalCleanupTasks.length = 0;
            
            console.log('  Component memory manager destroyed');
        }
    }
    
    // Demonstrate usage
    const memoryManager = new ComponentMemoryManager();
    
    // Simulate creating components
    const component1 = memoryManager.registerComponent('header-component', {
        customCleanup: () => console.log('      Custom header cleanup')
    });
    
    const component2 = memoryManager.registerComponent('data-table-component', {
        customCleanup: () => console.log('      Custom data table cleanup')
    });
    
    // Simulate component resource usage
    if (typeof document !== 'undefined') {
        component1.addEventListener(document, 'scroll', () => {
            // Header scroll logic
        });
        
        component1.setTimeout(() => {
            console.log('      Header animation complete');
        }, 1000);
    }
    
    component2.setInterval(() => {
        // Refresh data table every 5 seconds
    }, 5000);
    
    // Show stats
    setTimeout(() => {
        console.log('  Memory manager stats:', memoryManager.getStats());
        
        // Simulate component unmounting
        memoryManager.unregisterComponent('header-component');
        
        // Final cleanup
        setTimeout(() => {
            memoryManager.destroy();
        }, 1000);
    }, 2000);
}

demonstrateWebAppMemoryManagement();

// ============================================================================
// INTELLIGENT CACHING SYSTEMS
// ============================================================================

/**
 * Intelligent Caching with Memory Management:
 * 
 * Production-ready caching systems that handle memory pressure,
 * implement multiple eviction strategies, and provide monitoring.
 */

function demonstrateIntelligentCaching() {
    console.log('\n2. Intelligent Caching Systems:');
    
    // Advanced cache with multiple eviction strategies
    class IntelligentCache {
        constructor(options = {}) {
            this.maxSize = options.maxSize || 1000;
            this.maxMemory = options.maxMemory || 50 * 1024 * 1024; // 50MB
            this.ttl = options.ttl || 30 * 60 * 1000; // 30 minutes
            this.evictionStrategy = options.evictionStrategy || 'lru';
            
            // Storage
            this.cache = new Map();
            this.metadata = new Map();
            
            // Statistics
            this.stats = {
                hits: 0,
                misses: 0,
                evictions: 0,
                memoryUsage: 0,
                operations: 0
            };
            
            // Maintenance
            this.maintenanceInterval = setInterval(() => {
                this.performMaintenance();
            }, 5 * 60 * 1000); // Every 5 minutes
            
            console.log(`    Intelligent cache created: ${this.maxSize} items, ${this.maxMemory / 1024 / 1024}MB limit`);
        }
        
        set(key, value, customTTL = null) {
            this.stats.operations++;
            
            // Calculate approximate memory size
            const memorySize = this.estimateMemorySize(value);
            const ttl = customTTL || this.ttl;
            const now = Date.now();
            
            // Check if we need to make space
            if (this.cache.size >= this.maxSize || 
                this.stats.memoryUsage + memorySize > this.maxMemory) {
                this.evictItems();
            }
            
            // Store value and metadata
            this.cache.set(key, value);
            this.metadata.set(key, {
                created: now,
                lastAccessed: now,
                accessCount: 0,
                memorySize: memorySize,
                ttl: ttl
            });
            
            this.stats.memoryUsage += memorySize;
            
            console.log(`      Cached: ${key} (${memorySize} bytes, ${this.cache.size} items)`);
            return this;
        }
        
        get(key) {
            this.stats.operations++;
            
            const value = this.cache.get(key);
            const meta = this.metadata.get(key);
            
            if (!value || !meta) {
                this.stats.misses++;
                return undefined;
            }
            
            // Check TTL
            if (Date.now() - meta.created > meta.ttl) {
                this.delete(key);
                this.stats.misses++;
                return undefined;
            }
            
            // Update access metadata
            meta.lastAccessed = Date.now();
            meta.accessCount++;
            this.stats.hits++;
            
            console.log(`      Cache hit: ${key} (access #${meta.accessCount})`);
            return value;
        }
        
        delete(key) {
            const meta = this.metadata.get(key);
            if (meta) {
                this.stats.memoryUsage -= meta.memorySize;
                this.metadata.delete(key);
                console.log(`      Deleted: ${key} (freed ${meta.memorySize} bytes)`);
            }
            
            return this.cache.delete(key);
        }
        
        // Estimate memory usage of a value
        estimateMemorySize(value) {
            if (typeof value === 'string') {
                return value.length * 2; // UTF-16
            } else if (typeof value === 'number') {
                return 8;
            } else if (typeof value === 'boolean') {
                return 4;
            } else if (value === null || value === undefined) {
                return 0;
            } else if (typeof value === 'object') {
                // Rough estimation for objects
                const jsonString = JSON.stringify(value);
                return jsonString.length * 2 + 100; // JSON size + overhead
            }
            return 100; // Default estimate
        }
        
        // Evict items based on strategy
        evictItems() {
            const targetSize = Math.floor(this.maxSize * 0.8); // Evict to 80% capacity
            const itemsToEvict = this.cache.size - targetSize;
            
            if (itemsToEvict <= 0) return;
            
            console.log(`      Evicting ${itemsToEvict} items using ${this.evictionStrategy} strategy`);
            
            let candidates = [];
            
            switch (this.evictionStrategy) {
                case 'lru': // Least Recently Used
                    candidates = Array.from(this.metadata.entries())
                        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
                    break;
                    
                case 'lfu': // Least Frequently Used
                    candidates = Array.from(this.metadata.entries())
                        .sort((a, b) => a[1].accessCount - b[1].accessCount);
                    break;
                    
                case 'ttl': // Shortest TTL first
                    const now = Date.now();
                    candidates = Array.from(this.metadata.entries())
                        .sort((a, b) => {
                            const aRemaining = (a[1].created + a[1].ttl) - now;
                            const bRemaining = (b[1].created + b[1].ttl) - now;
                            return aRemaining - bRemaining;
                        });
                    break;
                    
                case 'memory': // Largest items first
                    candidates = Array.from(this.metadata.entries())
                        .sort((a, b) => b[1].memorySize - a[1].memorySize);
                    break;
            }
            
            // Evict the selected items
            for (let i = 0; i < itemsToEvict && i < candidates.length; i++) {
                const [key] = candidates[i];
                this.delete(key);
                this.stats.evictions++;
            }
        }
        
        // Periodic maintenance
        performMaintenance() {
            console.log('    Performing cache maintenance...');
            
            const now = Date.now();
            const expiredKeys = [];
            
            // Find expired items
            for (const [key, meta] of this.metadata) {
                if (now - meta.created > meta.ttl) {
                    expiredKeys.push(key);
                }
            }
            
            // Remove expired items
            expiredKeys.forEach(key => this.delete(key));
            
            // Defragment if needed (in a real implementation)
            if (this.cache.size < this.maxSize * 0.5) {
                console.log('    Cache defragmentation opportunity detected');
            }
            
            console.log(`    Maintenance complete: removed ${expiredKeys.length} expired items`);
        }
        
        // Get comprehensive statistics
        getStats() {
            const hitRate = this.stats.operations > 0 
                ? (this.stats.hits / this.stats.operations * 100).toFixed(1)
                : '0';
            
            return {
                ...this.stats,
                hitRate: hitRate + '%',
                size: this.cache.size,
                memoryUsageMB: (this.stats.memoryUsage / 1024 / 1024).toFixed(2),
                fillRate: (this.cache.size / this.maxSize * 100).toFixed(1) + '%',
                avgMemoryPerItem: this.cache.size > 0 
                    ? Math.round(this.stats.memoryUsage / this.cache.size)
                    : 0
            };
        }
        
        // Cleanup
        destroy() {
            clearInterval(this.maintenanceInterval);
            this.cache.clear();
            this.metadata.clear();
            this.stats.memoryUsage = 0;
            console.log('    Intelligent cache destroyed');
        }
    }
    
    // Test the intelligent cache
    const cache = new IntelligentCache({
        maxSize: 100,
        maxMemory: 1024 * 1024, // 1MB
        evictionStrategy: 'lru'
    });
    
    // Simulate cache usage
    console.log('  Testing intelligent cache:');
    
    // Add various data types
    cache.set('user:123', { id: 123, name: 'John Doe', email: 'john@example.com' });
    cache.set('config:app', { theme: 'dark', language: 'en', version: '2.1.0' });
    cache.set('large:data', new Array(1000).fill().map((_, i) => ({ id: i, value: Math.random() })));
    
    // Access patterns
    cache.get('user:123'); // Hit
    cache.get('config:app'); // Hit
    cache.get('nonexistent'); // Miss
    
    // Add more data to trigger eviction
    for (let i = 0; i < 50; i++) {
        cache.set(`temp:${i}`, `Temporary data item ${i}`);
    }
    
    console.log('  Cache statistics:', cache.getStats());
    
    // Cleanup
    setTimeout(() => {
        cache.destroy();
    }, 3000);
}

demonstrateIntelligentCaching();

// ============================================================================
// IMAGE AND MEDIA MEMORY MANAGEMENT
// ============================================================================

/**
 * Image and Media Memory Management:
 * 
 * Techniques for handling images, videos, and other media files
 * without causing memory bloat in web applications.
 */

function demonstrateMediaMemoryManagement() {
    console.log('\n3. Image and Media Memory Management:');
    
    // Image cache with lazy loading and memory management
    class ImageMemoryManager {
        constructor(options = {}) {
            this.maxCacheSize = options.maxCacheSize || 50;
            this.maxMemoryMB = options.maxMemoryMB || 100;
            
            this.imageCache = new Map();
            this.loadingPromises = new Map();
            this.memoryUsage = 0;
            
            // Image size estimation (rough)
            this.estimatedBytesPerPixel = 4; // RGBA
            
            console.log(`    Image memory manager: max ${this.maxCacheSize} images, ${this.maxMemoryMB}MB limit`);
        }
        
        // Estimate image memory usage
        estimateImageMemory(width, height) {
            return width * height * this.estimatedBytesPerPixel;
        }
        
        // Load image with memory management
        async loadImage(url, expectedWidth = 1920, expectedHeight = 1080) {
            // Check cache first
            if (this.imageCache.has(url)) {
                console.log(`      Image cache hit: ${url}`);
                return this.imageCache.get(url);
            }
            
            // Check if already loading
            if (this.loadingPromises.has(url)) {
                console.log(`      Image already loading: ${url}`);
                return this.loadingPromises.get(url);
            }
            
            // Estimate memory needed
            const estimatedMemory = this.estimateImageMemory(expectedWidth, expectedHeight);
            
            // Check memory pressure
            if (this.memoryUsage + estimatedMemory > this.maxMemoryMB * 1024 * 1024) {
                this.evictImages();
            }
            
            // Create loading promise
            const loadingPromise = this.createImageLoadPromise(url, estimatedMemory);
            this.loadingPromises.set(url, loadingPromise);
            
            try {
                const result = await loadingPromise;
                this.loadingPromises.delete(url);
                return result;
            } catch (error) {
                this.loadingPromises.delete(url);
                throw error;
            }
        }
        
        // Create image loading promise (simulated)
        createImageLoadPromise(url, estimatedMemory) {
            return new Promise((resolve, reject) => {
                console.log(`      Loading image: ${url} (~${(estimatedMemory / 1024 / 1024).toFixed(1)}MB)`);
                
                // Simulate image loading
                setTimeout(() => {
                    // Simulate image object
                    const imageData = {
                        url: url,
                        width: 1920,
                        height: 1080,
                        loaded: true,
                        memorySize: estimatedMemory,
                        loadedAt: Date.now()
                    };
                    
                    // Add to cache
                    this.imageCache.set(url, imageData);
                    this.memoryUsage += estimatedMemory;
                    
                    console.log(`      Image loaded: ${url} (${this.imageCache.size} cached, ${(this.memoryUsage / 1024 / 1024).toFixed(1)}MB used)`);
                    resolve(imageData);
                }, Math.random() * 500 + 100); // Random load time
            });
        }
        
        // Evict images to free memory
        evictImages() {
            console.log('      Evicting images due to memory pressure...');
            
            // Sort by oldest first (LRU)
            const imageEntries = Array.from(this.imageCache.entries())
                .sort((a, b) => a[1].loadedAt - b[1].loadedAt);
            
            // Evict oldest images until we free enough memory
            const targetMemory = this.maxMemoryMB * 1024 * 1024 * 0.7; // Target 70% usage
            
            while (this.memoryUsage > targetMemory && imageEntries.length > 0) {
                const [url, imageData] = imageEntries.shift();
                this.imageCache.delete(url);
                this.memoryUsage -= imageData.memorySize;
                console.log(`      Evicted image: ${url} (freed ${(imageData.memorySize / 1024 / 1024).toFixed(1)}MB)`);
            }
        }
        
        // Preload images for better UX
        async preloadImages(urls, priority = 'low') {
            console.log(`      Preloading ${urls.length} images with ${priority} priority`);
            
            const preloadPromises = urls.map(url => 
                this.loadImage(url).catch(error => {
                    console.warn(`Preload failed for ${url}:`, error.message);
                    return null;
                })
            );
            
            // Load with appropriate concurrency based on priority
            const concurrency = priority === 'high' ? 4 : 2;
            const results = [];
            
            for (let i = 0; i < preloadPromises.length; i += concurrency) {
                const batch = preloadPromises.slice(i, i + concurrency);
                const batchResults = await Promise.allSettled(batch);
                results.push(...batchResults);
            }
            
            const successful = results.filter(r => r.status === 'fulfilled').length;
            console.log(`      Preloaded ${successful}/${urls.length} images`);
            
            return results;
        }
        
        // Clear specific images or all
        clearCache(urlPattern = null) {
            if (urlPattern) {
                const regex = new RegExp(urlPattern);
                const toDelete = [];
                
                for (const [url, imageData] of this.imageCache) {
                    if (regex.test(url)) {
                        toDelete.push([url, imageData]);
                    }
                }
                
                toDelete.forEach(([url, imageData]) => {
                    this.imageCache.delete(url);
                    this.memoryUsage -= imageData.memorySize;
                });
                
                console.log(`      Cleared ${toDelete.length} images matching pattern: ${urlPattern}`);
            } else {
                const count = this.imageCache.size;
                this.imageCache.clear();
                this.memoryUsage = 0;
                console.log(`      Cleared all ${count} cached images`);
            }
        }
        
        // Get memory and cache statistics
        getStats() {
            return {
                cachedImages: this.imageCache.size,
                memoryUsageMB: (this.memoryUsage / 1024 / 1024).toFixed(2),
                memoryLimitMB: this.maxMemoryMB,
                utilizationPercent: ((this.memoryUsage / (this.maxMemoryMB * 1024 * 1024)) * 100).toFixed(1),
                loadingImages: this.loadingPromises.size,
                avgMemoryPerImage: this.imageCache.size > 0 
                    ? ((this.memoryUsage / this.imageCache.size) / 1024 / 1024).toFixed(2) + 'MB'
                    : '0MB'
            };
        }
        
        // Cleanup
        destroy() {
            this.clearCache();
            this.loadingPromises.clear();
            console.log('      Image memory manager destroyed');
        }
    }
    
    // Test image memory management
    const imageManager = new ImageMemoryManager({
        maxCacheSize: 10,
        maxMemoryMB: 20
    });
    
    // Simulate loading images
    const testImages = [
        'https://example.com/hero-banner.jpg',
        'https://example.com/product-1.jpg',
        'https://example.com/product-2.jpg',
        'https://example.com/background.jpg',
        'https://example.com/thumbnail-1.jpg',
        'https://example.com/thumbnail-2.jpg'
    ];
    
    // Load images with different patterns
    async function testImageLoading() {
        try {
            // Load hero image
            await imageManager.loadImage(testImages[0]);
            
            // Preload product images
            await imageManager.preloadImages(testImages.slice(1, 3), 'high');
            
            // Load background image
            await imageManager.loadImage(testImages[3]);
            
            console.log('  Image loading stats:', imageManager.getStats());
            
            // Load more images to trigger eviction
            await imageManager.preloadImages(testImages.slice(4), 'low');
            
            console.log('  Final stats:', imageManager.getStats());
            
        } catch (error) {
            console.error('Image loading failed:', error);
        } finally {
            setTimeout(() => {
                imageManager.destroy();
            }, 1000);
        }
    }
    
    testImageLoading();
}

demonstrateMediaMemoryManagement();

// Export practical memory management utilities
module.exports = {
    // Component memory manager
    createComponentManager: function() {
        const components = new Map();
        
        return {
            register: (id) => {
                const resources = [];
                components.set(id, resources);
                
                return {
                    addResource: (cleanup) => resources.push(cleanup),
                    cleanup: () => {
                        resources.forEach(cleanup => cleanup());
                        resources.length = 0;
                        components.delete(id);
                    }
                };
            },
            
            cleanup: () => {
                for (const resources of components.values()) {
                    resources.forEach(cleanup => cleanup());
                }
                components.clear();
            }
        };
    },
    
    // Intelligent cache factory
    createIntelligentCache: function(options = {}) {
        const cache = new Map();
        const metadata = new Map();
        const maxSize = options.maxSize || 100;
        
        return {
            set: (key, value, ttl = 300000) => { // 5 min default TTL
                if (cache.size >= maxSize) {
                    // Simple LRU eviction
                    const oldestKey = cache.keys().next().value;
                    cache.delete(oldestKey);
                    metadata.delete(oldestKey);
                }
                
                cache.set(key, value);
                metadata.set(key, { created: Date.now(), ttl });
            },
            
            get: (key) => {
                const value = cache.get(key);
                const meta = metadata.get(key);
                
                if (!value || !meta) return undefined;
                
                if (Date.now() - meta.created > meta.ttl) {
                    cache.delete(key);
                    metadata.delete(key);
                    return undefined;
                }
                
                return value;
            },
            
            clear: () => {
                cache.clear();
                metadata.clear();
            },
            
            size: () => cache.size
        };
    },
    
    // Memory monitoring utility
    createMemoryMonitor: function(thresholdMB = 50) {
        let lastCheck = Date.now();
        
        return {
            check: () => {
                if (typeof performance !== 'undefined' && performance.memory) {
                    const memory = performance.memory;
                    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                    const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                    
                    return {
                        used: usedMB,
                        limit: limitMB,
                        percent: (usedMB / limitMB * 100).toFixed(1),
                        overThreshold: usedMB > thresholdMB,
                        timestamp: Date.now()
                    };
                }
                return null;
            },
            
            startMonitoring: (intervalMs = 30000, callback) => {
                const interval = setInterval(() => {
                    const stats = this.check();
                    if (stats && callback) callback(stats);
                }, intervalMs);
                
                return () => clearInterval(interval);
            }
        };
    }
};