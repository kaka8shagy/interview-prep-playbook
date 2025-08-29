/**
 * File: advanced-concepts.js
 * Description: Advanced module concepts including bundling, optimization, and complex scenarios
 * 
 * Learning objectives:
 * - Understand modern bundling strategies and their trade-offs
 * - Master dynamic imports and code splitting techniques
 * - Learn module federation and micro-frontend patterns
 * - Grasp performance implications of different module strategies
 * 
 * This file consolidates concepts from: webpack-rollup-basics.js, code-splitting.js, dynamic-imports.js, tree-shaking.js
 */

console.log('=== Advanced Module Concepts ===\n');

// ============================================================================
// PART 1: DYNAMIC IMPORTS AND CODE SPLITTING
// ============================================================================

console.log('--- Dynamic Imports and Code Splitting ---');

/**
 * DYNAMIC IMPORTS: THE FOUNDATION OF CODE SPLITTING
 * 
 * Key insight: import() returns a Promise, enabling asynchronous module loading
 * This is crucial for:
 * - Reducing initial bundle size
 * - Loading code on-demand
 * - Route-based splitting in SPAs
 * - Conditional feature loading
 */

class LazyFeatureLoader {
  constructor() {
    this.loadedFeatures = new Map();
    this.loadingPromises = new Map();
  }
  
  /**
   * Load a feature module only when needed
   * This pattern prevents loading unused features
   */
  async loadFeature(featureName) {
    console.log(`Loading feature: ${featureName}`);
    
    // Check if already loaded (cache check)
    if (this.loadedFeatures.has(featureName)) {
      console.log(`  Feature ${featureName} already loaded from cache`);
      return this.loadedFeatures.get(featureName);
    }
    
    // Check if currently loading (prevent duplicate requests)
    if (this.loadingPromises.has(featureName)) {
      console.log(`  Feature ${featureName} is already loading, waiting...`);
      return await this.loadingPromises.get(featureName);
    }
    
    // Start loading the feature
    const loadingPromise = this._loadFeatureModule(featureName);
    this.loadingPromises.set(featureName, loadingPromise);
    
    try {
      const featureModule = await loadingPromise;
      
      // Cache the loaded feature
      this.loadedFeatures.set(featureName, featureModule);
      
      console.log(`  Feature ${featureName} loaded successfully`);
      return featureModule;
      
    } catch (error) {
      console.error(`  Failed to load feature ${featureName}:`, error.message);
      throw error;
      
    } finally {
      // Clean up loading promise
      this.loadingPromises.delete(featureName);
    }
  }
  
  /**
   * Simulate dynamic import with fallback handling
   * In real applications, this would use actual import() statements
   */
  async _loadFeatureModule(featureName) {
    // Simulate network delay for module loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock feature modules - in real apps these would be separate files
    const features = {
      'advanced-charts': {
        default: class AdvancedChartRenderer {
          render(data) {
            return `Advanced chart with ${data.points} data points`;
          }
        },
        ChartConfig: { theme: 'modern', animations: true }
      },
      
      'data-export': {
        exportToPDF: (data) => `PDF export of ${data.length} records`,
        exportToExcel: (data) => `Excel export of ${data.length} records`,
        default: { version: '1.2.0' }
      },
      
      'user-analytics': {
        trackEvent: (event, data) => console.log(`Analytics: ${event}`, data),
        generateReport: () => ({ users: 1000, sessions: 5000 })
      }
    };
    
    if (!features[featureName]) {
      throw new Error(`Feature module '${featureName}' not found`);
    }
    
    return features[featureName];
  }
  
  /**
   * Preload features that are likely to be needed
   * This optimizes perceived performance
   */
  async preloadFeatures(featureNames) {
    console.log('Preloading features:', featureNames.join(', '));
    
    // Load multiple features in parallel
    const preloadPromises = featureNames.map(name => 
      this.loadFeature(name).catch(error => {
        console.warn(`Failed to preload ${name}:`, error.message);
        return null; // Don't fail the entire preload for one feature
      })
    );
    
    const results = await Promise.allSettled(preloadPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    console.log(`Preloaded ${successful}/${featureNames.length} features`);
  }
  
  /**
   * Get loading statistics for performance monitoring
   */
  getStats() {
    return {
      loadedFeatures: Array.from(this.loadedFeatures.keys()),
      currentlyLoading: Array.from(this.loadingPromises.keys()),
      cacheSize: this.loadedFeatures.size
    };
  }
}

// Demonstrate dynamic loading
const featureLoader = new LazyFeatureLoader();

// Example 1: Load feature on demand
async function demonstrateDynamicLoading() {
  console.log('\nDemonstrating dynamic feature loading:');
  
  try {
    // This would typically be triggered by user action
    const chartModule = await featureLoader.loadFeature('advanced-charts');
    
    // Use the dynamically loaded module
    const ChartRenderer = chartModule.default;
    const chart = new ChartRenderer();
    console.log('  Chart result:', chart.render({ points: 100 }));
    
    // Access named exports
    console.log('  Chart config:', chartModule.ChartConfig);
    
  } catch (error) {
    console.error('Failed to load chart feature:', error);
  }
}

demonstrateDynamicLoading();

// ============================================================================
// PART 2: ADVANCED BUNDLING STRATEGIES
// ============================================================================

console.log('\n--- Advanced Bundling Strategies ---');

/**
 * BUNDLE SPLITTING STRATEGIES
 * 
 * Modern applications use sophisticated splitting strategies:
 * 1. Vendor splitting - separate third-party libraries
 * 2. Route-based splitting - one bundle per route
 * 3. Feature-based splitting - logical feature boundaries
 * 4. Common chunk extraction - shared code optimization
 */

class BundleAnalyzer {
  constructor() {
    this.modules = new Map();
    this.bundles = new Map();
    this.dependencyGraph = new Map();
  }
  
  /**
   * Analyze module dependencies to determine optimal bundle strategy
   */
  analyzeModules(moduleData) {
    console.log('Analyzing modules for optimal bundling strategy...\n');
    
    // Process each module
    moduleData.forEach(({ name, size, dependencies, type, frequency }) => {
      this.modules.set(name, { size, dependencies, type, frequency });
      
      // Build dependency graph
      this.dependencyGraph.set(name, new Set(dependencies));
    });
    
    // Generate bundle recommendations
    return this.generateBundleStrategy();
  }
  
  /**
   * Generate optimal bundle splitting strategy
   */
  generateBundleStrategy() {
    const strategy = {
      vendor: [], // Third-party libraries
      common: [], // Shared utilities used by multiple features
      routes: {}, // Route-specific bundles
      features: {} // Feature-specific bundles
    };
    
    console.log('Bundle Strategy Analysis:');
    
    // Step 1: Identify vendor modules (third-party libraries)
    for (const [name, info] of this.modules) {
      if (info.type === 'vendor') {
        strategy.vendor.push({ name, size: info.size });
        console.log(`  📦 Vendor bundle: ${name} (${info.size}kb)`);
      }
    }
    
    // Step 2: Find commonly shared modules
    const sharedModules = this.findSharedModules();
    strategy.common = sharedModules;
    
    console.log('\n  🔗 Common modules (shared by 3+ features):');
    sharedModules.forEach(module => {
      console.log(`    - ${module.name} (used by ${module.usedBy.length} features)`);
    });
    
    // Step 3: Group by features/routes
    for (const [name, info] of this.modules) {
      if (info.type === 'route') {
        const routeName = name.split('/')[0]; // Extract route name
        if (!strategy.routes[routeName]) {
          strategy.routes[routeName] = [];
        }
        strategy.routes[routeName].push({ name, size: info.size });
      }
    }
    
    console.log('\n  🗂️ Route-based bundles:');
    Object.entries(strategy.routes).forEach(([route, modules]) => {
      const totalSize = modules.reduce((sum, mod) => sum + mod.size, 0);
      console.log(`    - ${route}: ${modules.length} modules, ${totalSize}kb total`);
    });
    
    // Step 4: Calculate optimization impact
    const optimization = this.calculateOptimization(strategy);
    console.log('\n  📊 Optimization Impact:');
    console.log(`    - Initial bundle size reduction: ${optimization.sizeReduction}%`);
    console.log(`    - Estimated cache hit improvement: ${optimization.cacheImprovement}%`);
    console.log(`    - Parallel loading opportunities: ${optimization.parallelChunks} chunks`);
    
    return strategy;
  }
  
  /**
   * Find modules that are shared across multiple features
   */
  findSharedModules() {
    const moduleUsage = new Map();
    
    // Count how many times each module is used
    for (const [moduleName, info] of this.modules) {
      info.dependencies.forEach(dep => {
        if (!moduleUsage.has(dep)) {
          moduleUsage.set(dep, new Set());
        }
        moduleUsage.get(dep).add(moduleName);
      });
    }
    
    // Find modules used by 3+ other modules
    const sharedModules = [];
    for (const [moduleName, usedBy] of moduleUsage) {
      if (usedBy.size >= 3 && this.modules.has(moduleName)) {
        sharedModules.push({
          name: moduleName,
          size: this.modules.get(moduleName).size,
          usedBy: Array.from(usedBy)
        });
      }
    }
    
    return sharedModules.sort((a, b) => b.usedBy.length - a.usedBy.length);
  }
  
  /**
   * Calculate optimization metrics
   */
  calculateOptimization(strategy) {
    const totalModules = this.modules.size;
    const bundleCount = 
      1 + // vendor bundle
      strategy.common.length +
      Object.keys(strategy.routes).length;
    
    // Simplified optimization calculations
    const sizeReduction = Math.min(30, bundleCount * 3); // Estimate based on bundle splitting
    const cacheImprovement = Math.min(50, strategy.common.length * 10);
    const parallelChunks = bundleCount;
    
    return { sizeReduction, cacheImprovement, parallelChunks };
  }
}

// Demonstrate bundle analysis
const bundleAnalyzer = new BundleAnalyzer();

// Mock application module data
const mockModuleData = [
  // Vendor libraries
  { name: 'react', size: 45, dependencies: [], type: 'vendor', frequency: 100 },
  { name: 'lodash', size: 25, dependencies: [], type: 'vendor', frequency: 80 },
  { name: 'axios', size: 15, dependencies: [], type: 'vendor', frequency: 60 },
  
  // Common utilities
  { name: 'utils/api', size: 5, dependencies: ['axios'], type: 'common', frequency: 90 },
  { name: 'utils/date', size: 3, dependencies: ['lodash'], type: 'common', frequency: 70 },
  { name: 'utils/validation', size: 4, dependencies: [], type: 'common', frequency: 85 },
  
  // Route-specific modules
  { name: 'dashboard/Overview', size: 12, dependencies: ['react', 'utils/api', 'utils/date'], type: 'route', frequency: 95 },
  { name: 'dashboard/Analytics', size: 18, dependencies: ['react', 'utils/api', 'lodash'], type: 'route', frequency: 40 },
  { name: 'profile/Settings', size: 8, dependencies: ['react', 'utils/validation'], type: 'route', frequency: 30 },
  { name: 'profile/Preferences', size: 6, dependencies: ['react', 'utils/validation'], type: 'route', frequency: 20 }
];

bundleAnalyzer.analyzeModules(mockModuleData);

// ============================================================================
// PART 3: MODULE FEDERATION AND MICRO-FRONTENDS
// ============================================================================

console.log('\n--- Module Federation and Micro-Frontend Patterns ---');

/**
 * MODULE FEDERATION: SHARING MODULES ACROSS APPLICATIONS
 * 
 * This is an advanced pattern where separate applications can share
 * modules at runtime, enabling true micro-frontend architectures.
 */

class ModuleFederationHost {
  constructor() {
    this.remoteModules = new Map();
    this.sharedModules = new Map();
    this.loadingCache = new Map();
  }
  
  /**
   * Register a remote module source
   * In real module federation, this would be a remote webpack build
   */
  registerRemote(name, config) {
    console.log(`Registering remote module: ${name}`);
    console.log(`  URL: ${config.url}`);
    console.log(`  Exposed modules: ${config.exposedModules.join(', ')}`);
    
    this.remoteModules.set(name, {
      url: config.url,
      exposedModules: new Set(config.exposedModules),
      version: config.version,
      loaded: false
    });
  }
  
  /**
   * Register shared modules (like React, common utilities)
   * These are shared across all micro-frontends to avoid duplication
   */
  registerSharedModule(name, module, version) {
    console.log(`Registering shared module: ${name}@${version}`);
    
    this.sharedModules.set(name, {
      module,
      version,
      singleton: true // Ensure only one version is used
    });
  }
  
  /**
   * Load a module from a remote micro-frontend
   */
  async loadRemoteModule(remoteName, moduleName) {
    const cacheKey = `${remoteName}/${moduleName}`;
    
    // Check loading cache to prevent duplicate requests
    if (this.loadingCache.has(cacheKey)) {
      return await this.loadingCache.get(cacheKey);
    }
    
    console.log(`Loading remote module: ${remoteName}/${moduleName}`);
    
    const remote = this.remoteModules.get(remoteName);
    if (!remote) {
      throw new Error(`Remote '${remoteName}' not registered`);
    }
    
    if (!remote.exposedModules.has(moduleName)) {
      throw new Error(`Module '${moduleName}' not exposed by remote '${remoteName}'`);
    }
    
    // Create loading promise
    const loadingPromise = this._loadRemoteModuleImpl(remote, moduleName);
    this.loadingCache.set(cacheKey, loadingPromise);
    
    try {
      const module = await loadingPromise;
      console.log(`  Successfully loaded ${remoteName}/${moduleName}`);
      return module;
      
    } catch (error) {
      this.loadingCache.delete(cacheKey); // Remove from cache on error
      throw error;
    }
  }
  
  /**
   * Simulate loading a remote module
   * In real module federation, this involves loading and executing remote webpack chunks
   */
  async _loadRemoteModuleImpl(remote, moduleName) {
    // Simulate network request to load remote module
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock remote modules for demonstration
    const mockRemoteModules = {
      'user-profile-app': {
        'UserProfile': {
          default: class UserProfile {
            render(userData) {
              return `<UserProfile name="${userData.name}" email="${userData.email}"/>`;
            }
          }
        },
        'UserSettings': {
          default: class UserSettings {
            render(settings) {
              return `<UserSettings theme="${settings.theme}" notifications="${settings.notifications}"/>`;
            }
          }
        }
      },
      
      'analytics-app': {
        'Dashboard': {
          default: class AnalyticsDashboard {
            render(metrics) {
              return `<Dashboard metrics="${JSON.stringify(metrics)}"/>`;
            }
          },
          ChartComponent: class Chart {
            render(data) { return `<Chart data="${data}"/>`; }
          }
        }
      }
    };
    
    const appModules = mockRemoteModules[remote.url];
    if (!appModules || !appModules[moduleName]) {
      throw new Error(`Remote module ${moduleName} not found`);
    }
    
    return appModules[moduleName];
  }
  
  /**
   * Get shared module (like React, common libraries)
   * This ensures version consistency across micro-frontends
   */
  getSharedModule(name) {
    const shared = this.sharedModules.get(name);
    if (!shared) {
      throw new Error(`Shared module '${name}' not available`);
    }
    
    console.log(`Providing shared module: ${name}@${shared.version}`);
    return shared.module;
  }
  
  /**
   * Health check for all registered remotes
   */
  async healthCheck() {
    console.log('\nPerforming health check on remote modules...');
    
    const results = [];
    
    for (const [name, remote] of this.remoteModules) {
      try {
        // Simulate health check - in real scenario, this would ping the remote
        await new Promise(resolve => setTimeout(resolve, 50));
        
        results.push({
          name,
          status: 'healthy',
          version: remote.version,
          modules: Array.from(remote.exposedModules)
        });
        
        console.log(`  ✅ ${name}: healthy`);
        
      } catch (error) {
        results.push({
          name,
          status: 'unhealthy',
          error: error.message
        });
        
        console.log(`  ❌ ${name}: ${error.message}`);
      }
    }
    
    return results;
  }
}

// Demonstrate module federation
const federationHost = new ModuleFederationHost();

// Register shared modules (would be React, etc. in real scenario)
federationHost.registerSharedModule('react', { version: '18.0.0' }, '18.0.0');
federationHost.registerSharedModule('common-utils', { formatDate: (d) => d.toISOString() }, '1.0.0');

// Register remote micro-frontends
federationHost.registerRemote('user-profile-app', {
  url: 'user-profile-app',
  exposedModules: ['UserProfile', 'UserSettings'],
  version: '2.1.0'
});

federationHost.registerRemote('analytics-app', {
  url: 'analytics-app',
  exposedModules: ['Dashboard'],
  version: '1.5.0'
});

// Demonstrate loading remote modules
async function demonstrateModuleFederation() {
  console.log('\nDemonstrating module federation:');
  
  try {
    // Load UserProfile component from remote app
    const UserProfileModule = await federationHost.loadRemoteModule('user-profile-app', 'UserProfile');
    const UserProfile = UserProfileModule.default;
    const profile = new UserProfile();
    
    console.log('  Remote component result:', profile.render({ name: 'John', email: 'john@example.com' }));
    
    // Load Analytics Dashboard
    const DashboardModule = await federationHost.loadRemoteModule('analytics-app', 'Dashboard');
    const Dashboard = DashboardModule.default;
    const dashboard = new Dashboard();
    
    console.log('  Remote dashboard result:', dashboard.render({ users: 1000, sessions: 5000 }));
    
  } catch (error) {
    console.error('Module federation error:', error.message);
  }
}

demonstrateModuleFederation();

// Health check
setTimeout(async () => {
  await federationHost.healthCheck();
}, 300);

// ============================================================================
// PART 4: PERFORMANCE OPTIMIZATION STRATEGIES
// ============================================================================

console.log('\n--- Module Performance Optimization ---');

/**
 * PERFORMANCE MONITORING AND OPTIMIZATION
 * 
 * Advanced module systems need performance monitoring to optimize:
 * - Bundle loading times
 * - Module resolution performance
 * - Memory usage of cached modules
 * - Network utilization for remote modules
 */

class ModulePerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTimes: new Map(),
      cacheHits: 0,
      cacheMisses: 0,
      bundleSizes: new Map(),
      networkRequests: []
    };
  }
  
  /**
   * Track module loading performance
   */
  trackModuleLoad(moduleName, startTime, endTime, fromCache = false) {
    const loadTime = endTime - startTime;
    
    if (fromCache) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
      this.metrics.loadTimes.set(moduleName, loadTime);
    }
    
    console.log(`📊 Module ${moduleName}: ${loadTime}ms ${fromCache ? '(cached)' : '(fresh)'}`);
  }
  
  /**
   * Track bundle size information
   */
  trackBundleSize(bundleName, size, compressed = false) {
    this.metrics.bundleSizes.set(bundleName, {
      size,
      compressed,
      timestamp: Date.now()
    });
    
    console.log(`📦 Bundle ${bundleName}: ${size}kb ${compressed ? '(gzipped)' : '(uncompressed)'}`);
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n📈 Module Performance Report:');
    
    // Cache efficiency
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests * 100).toFixed(1) : 0;
    
    console.log(`  Cache Performance:`);
    console.log(`    - Hit rate: ${cacheHitRate}% (${this.metrics.cacheHits}/${totalRequests})`);
    console.log(`    - Average load time: ${this.getAverageLoadTime()}ms`);
    
    // Bundle analysis
    console.log(`  Bundle Analysis:`);
    let totalBundleSize = 0;
    for (const [name, info] of this.metrics.bundleSizes) {
      console.log(`    - ${name}: ${info.size}kb`);
      totalBundleSize += info.size;
    }
    console.log(`    - Total bundle size: ${totalBundleSize}kb`);
    
    // Performance recommendations
    console.log(`  Recommendations:`);
    if (cacheHitRate < 80) {
      console.log(`    - ⚠️ Low cache hit rate (${cacheHitRate}%), consider better caching strategy`);
    }
    if (totalBundleSize > 1000) {
      console.log(`    - ⚠️ Large bundle size (${totalBundleSize}kb), consider code splitting`);
    }
    if (this.getAverageLoadTime() > 100) {
      console.log(`    - ⚠️ Slow module loading (${this.getAverageLoadTime()}ms avg), optimize bundle size`);
    }
    
    return {
      cacheHitRate: parseFloat(cacheHitRate),
      averageLoadTime: this.getAverageLoadTime(),
      totalBundleSize,
      recommendations: this.getRecommendations()
    };
  }
  
  getAverageLoadTime() {
    if (this.metrics.loadTimes.size === 0) return 0;
    
    const times = Array.from(this.metrics.loadTimes.values());
    return Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
  }
  
  getRecommendations() {
    const recommendations = [];
    
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const cacheHitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests * 100) : 0;
    
    if (cacheHitRate < 80) {
      recommendations.push('Improve module caching strategy');
    }
    
    const totalSize = Array.from(this.metrics.bundleSizes.values())
      .reduce((sum, info) => sum + info.size, 0);
    
    if (totalSize > 1000) {
      recommendations.push('Implement code splitting to reduce bundle size');
    }
    
    if (this.getAverageLoadTime() > 100) {
      recommendations.push('Optimize module loading performance');
    }
    
    return recommendations;
  }
}

// Demonstrate performance monitoring
const performanceMonitor = new ModulePerformanceMonitor();

// Simulate module loading scenarios
console.log('Simulating module loading scenarios...');

// Track various module loads
performanceMonitor.trackModuleLoad('react', 1000, 1080, false);
performanceMonitor.trackModuleLoad('lodash', 2000, 2050, false);
performanceMonitor.trackModuleLoad('utils/api', 3000, 3020, false);
performanceMonitor.trackModuleLoad('react', 4000, 4005, true); // Cache hit
performanceMonitor.trackModuleLoad('components/Header', 5000, 5060, false);

// Track bundle sizes
performanceMonitor.trackBundleSize('vendor', 450, true);
performanceMonitor.trackBundleSize('main', 280, true);
performanceMonitor.trackBundleSize('dashboard', 120, true);

// Generate performance report
setTimeout(() => {
  const report = performanceMonitor.generateReport();
}, 100);

/**
 * SUMMARY OF ADVANCED CONCEPTS:
 * 
 * 1. Dynamic Imports:
 *    - Enable code splitting and lazy loading
 *    - Reduce initial bundle size
 *    - Support conditional feature loading
 * 
 * 2. Bundle Optimization:
 *    - Vendor/common/route-based splitting
 *    - Tree shaking for dead code elimination
 *    - Performance monitoring and optimization
 * 
 * 3. Module Federation:
 *    - Runtime module sharing across applications
 *    - Micro-frontend architecture support
 *    - Version management and health monitoring
 * 
 * 4. Performance Optimization:
 *    - Load time monitoring
 *    - Cache efficiency tracking
 *    - Bundle size analysis
 *    - Automated recommendations
 * 
 * Key Takeaways:
 * - Module strategy affects application performance significantly
 * - Modern bundlers enable sophisticated optimization techniques
 * - Performance monitoring is crucial for large applications
 * - Architecture decisions have long-term implications
 */

console.log('\nAdvanced concepts demonstration complete!');
console.log('You now have comprehensive understanding of module systems from basics to advanced patterns.');