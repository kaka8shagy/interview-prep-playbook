/**
 * File: dynamic-imports.js
 * Description: Dynamic import patterns and use cases
 * Demonstrates runtime module loading with import() function
 */

console.log('=== Dynamic Imports Basics ===');

// Example 1: Basic dynamic import
console.log('1. Basic dynamic import:');

async function basicDynamicImport() {
  try {
    // Dynamic import returns a Promise
    const module = await import('./esm-syntax.js');
    console.log('Dynamically imported module:', typeof module);
    
    // Access exported members
    if (module.default) {
      console.log('Default export available');
    }
    
    console.log('Module keys:', Object.keys(module));
  } catch (error) {
    console.log('Dynamic import failed:', error.message);
  }
}

basicDynamicImport();

console.log('\n2. Conditional dynamic imports:');

// Example 2: Conditional imports based on runtime conditions
async function conditionalImports(feature) {
  console.log(`Loading feature: ${feature}`);
  
  try {
    let featureModule;
    
    switch (feature) {
      case 'analytics':
        // Only load analytics module if needed
        featureModule = await import(/* webpackChunkName: "analytics" */ './mock-analytics.js');
        console.log('Analytics module loaded');
        break;
        
      case 'charts':
        // Heavy charting library loaded on demand
        featureModule = await import(/* webpackChunkName: "charts" */ './mock-charts.js');
        console.log('Charts module loaded');
        break;
        
      case 'utils':
        // Utility functions
        featureModule = await import('./commonjs-basics.js');
        console.log('Utils module loaded');
        break;
        
      default:
        console.log('Unknown feature requested');
        return null;
    }
    
    return featureModule;
  } catch (error) {
    console.error(`Failed to load ${feature}:`, error.message);
    return null;
  }
}

// Test conditional imports
conditionalImports('utils');
conditionalImports('unknown');

console.log('\n=== Dynamic Import Patterns ===');

// Example 3: Lazy loading with caching
console.log('3. Lazy loading with caching:');

class ModuleLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }
  
  async loadModule(modulePath) {
    // Return cached module if available
    if (this.cache.has(modulePath)) {
      console.log(`Module '${modulePath}' loaded from cache`);
      return this.cache.get(modulePath);
    }
    
    // Return loading promise if already loading
    if (this.loading.has(modulePath)) {
      console.log(`Module '${modulePath}' is already loading, waiting...`);
      return this.loading.get(modulePath);
    }
    
    // Start loading
    console.log(`Loading module '${modulePath}'...`);
    const loadingPromise = this.loadModuleInternal(modulePath);
    this.loading.set(modulePath, loadingPromise);
    
    try {
      const module = await loadingPromise;
      this.cache.set(modulePath, module);
      this.loading.delete(modulePath);
      console.log(`Module '${modulePath}' loaded and cached`);
      return module;
    } catch (error) {
      this.loading.delete(modulePath);
      throw error;
    }
  }
  
  async loadModuleInternal(modulePath) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      return await import(modulePath);
    } catch (error) {
      // Fallback for missing modules
      console.warn(`Module '${modulePath}' not found, returning mock`);
      return { default: () => `Mock module for ${modulePath}` };
    }
  }
  
  preloadModule(modulePath) {
    // Start loading without waiting
    this.loadModule(modulePath).catch(() => {
      // Ignore preload errors
    });
  }
  
  clearCache() {
    this.cache.clear();
    console.log('Module cache cleared');
  }
  
  getCacheInfo() {
    return {
      cached: Array.from(this.cache.keys()),
      loading: Array.from(this.loading.keys()),
      cacheSize: this.cache.size
    };
  }
}

const moduleLoader = new ModuleLoader();

// Test lazy loading
async function testLazyLoading() {
  console.log('Testing lazy loading...');
  
  // Load same module multiple times
  const module1 = await moduleLoader.loadModule('./esm-syntax.js');
  const module2 = await moduleLoader.loadModule('./esm-syntax.js'); // Should use cache
  
  console.log('Modules are same object:', module1 === module2);
  console.log('Cache info:', moduleLoader.getCacheInfo());
}

testLazyLoading();

console.log('\n4. Feature-based dynamic loading:');

// Example 4: Feature-based loading system
class FeatureLoader {
  constructor() {
    this.features = new Map();
    this.loadingStates = new Map();
  }
  
  registerFeature(name, loader) {
    this.features.set(name, {
      loader,
      loaded: false,
      instance: null,
      error: null
    });
  }
  
  async loadFeature(name) {
    const feature = this.features.get(name);
    if (!feature) {
      throw new Error(`Feature '${name}' not registered`);
    }
    
    if (feature.loaded) {
      return feature.instance;
    }
    
    if (this.loadingStates.has(name)) {
      return this.loadingStates.get(name);
    }
    
    console.log(`Loading feature '${name}'...`);
    
    const loadingPromise = this.loadFeatureInternal(name, feature);
    this.loadingStates.set(name, loadingPromise);
    
    return loadingPromise;
  }
  
  async loadFeatureInternal(name, feature) {
    try {
      const module = await feature.loader();
      
      // Initialize if needed
      let instance = module.default || module;
      if (typeof instance === 'function') {
        instance = new instance();
      }
      
      feature.instance = instance;
      feature.loaded = true;
      feature.error = null;
      
      this.loadingStates.delete(name);
      
      console.log(`Feature '${name}' loaded successfully`);
      return instance;
      
    } catch (error) {
      feature.error = error;
      this.loadingStates.delete(name);
      
      console.error(`Feature '${name}' failed to load:`, error.message);
      throw error;
    }
  }
  
  isLoaded(name) {
    const feature = this.features.get(name);
    return feature ? feature.loaded : false;
  }
  
  getFeatureStatus() {
    const status = {};
    this.features.forEach((feature, name) => {
      status[name] = {
        loaded: feature.loaded,
        hasError: !!feature.error,
        error: feature.error?.message
      };
    });
    return status;
  }
}

// Register features
const featureLoader = new FeatureLoader();

featureLoader.registerFeature('userManagement', async () => {
  // Simulate loading user management module
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    default: class UserManager {
      constructor() {
        this.users = [];
      }
      
      addUser(user) {
        this.users.push(user);
        console.log('User added:', user.name);
      }
      
      getUsers() {
        return this.users.slice();
      }
    }
  };
});

featureLoader.registerFeature('reporting', async () => {
  // Simulate loading reporting module
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    generateReport: (data) => {
      console.log('Generating report with', data.length, 'items');
      return `Report: ${data.length} items processed`;
    }
  };
});

// Test feature loading
async function testFeatureLoading() {
  try {
    console.log('Testing feature loading...');
    
    // Load user management feature
    const userManager = await featureLoader.loadFeature('userManagement');
    userManager.addUser({ name: 'John Doe', email: 'john@example.com' });
    
    // Load reporting feature
    const reporting = await featureLoader.loadFeature('reporting');
    const users = userManager.getUsers();
    const report = reporting.generateReport(users);
    
    console.log('Report result:', report);
    console.log('Feature status:', featureLoader.getFeatureStatus());
    
  } catch (error) {
    console.error('Feature loading error:', error);
  }
}

testFeatureLoading();

console.log('\n=== Advanced Dynamic Import Patterns ===');

// Example 5: Route-based code splitting
console.log('5. Route-based code splitting:');

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.loadedComponents = new Map();
  }
  
  registerRoute(path, componentLoader) {
    this.routes.set(path, {
      loader: componentLoader,
      loaded: false
    });
  }
  
  async navigateTo(path) {
    console.log(`Navigating to: ${path}`);
    
    const route = this.routes.get(path);
    if (!route) {
      console.error(`Route '${path}' not found`);
      return null;
    }
    
    try {
      let component = this.loadedComponents.get(path);
      
      if (!component) {
        console.log(`Loading component for route: ${path}`);
        const module = await route.loader();
        component = module.default || module;
        this.loadedComponents.set(path, component);
        route.loaded = true;
      }
      
      // Simulate component mounting
      if (component.mount && typeof component.mount === 'function') {
        component.mount();
      }
      
      this.currentRoute = path;
      console.log(`Successfully navigated to: ${path}`);
      
      return component;
      
    } catch (error) {
      console.error(`Failed to load route '${path}':`, error.message);
      return null;
    }
  }
  
  preloadRoute(path) {
    // Preload route component without navigating
    this.navigateTo(path).catch(() => {}); // Ignore errors for preloading
  }
  
  getRouteInfo() {
    const info = {};
    this.routes.forEach((route, path) => {
      info[path] = {
        loaded: route.loaded,
        isCurrent: path === this.currentRoute
      };
    });
    return info;
  }
}

// Mock components
const createMockComponent = (name) => ({
  name,
  mount() {
    console.log(`${name} component mounted`);
  },
  unmount() {
    console.log(`${name} component unmounted`);
  }
});

// Setup router
const router = new Router();

router.registerRoute('/home', async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return createMockComponent('Home');
});

router.registerRoute('/profile', async () => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return createMockComponent('Profile');
});

router.registerRoute('/settings', async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return createMockComponent('Settings');
});

// Test routing
async function testRouting() {
  console.log('Testing route-based code splitting...');
  
  await router.navigateTo('/home');
  await router.navigateTo('/profile');
  
  // Preload settings
  router.preloadRoute('/settings');
  
  // Wait a bit then navigate to preloaded route
  setTimeout(async () => {
    await router.navigateTo('/settings');
    console.log('Route info:', router.getRouteInfo());
  }, 300);
}

testRouting();

console.log('\n6. Dynamic import with error boundaries:');

// Example 6: Error boundaries for dynamic imports
class SafeModuleLoader {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }
  
  async safeImport(modulePath, options = {}) {
    const {
      fallback = null,
      onError = null,
      retries = this.retryAttempts,
      timeout = 10000
    } = options;
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Loading ${modulePath} (attempt ${attempt}/${retries})`);
        
        // Add timeout to import
        const importPromise = import(modulePath);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout')), timeout);
        });
        
        const module = await Promise.race([importPromise, timeoutPromise]);
        console.log(`Successfully loaded ${modulePath}`);
        return module;
        
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < retries) {
          console.log(`Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          this.retryDelay *= 1.5; // Exponential backoff
        }
      }
    }
    
    // All attempts failed
    console.error(`Failed to load ${modulePath} after ${retries} attempts`);
    
    if (onError) {
      onError(lastError);
    }
    
    if (fallback) {
      console.log('Using fallback module');
      return typeof fallback === 'function' ? fallback() : fallback;
    }
    
    throw lastError;
  }
  
  async loadWithFallback(primaryPath, fallbackPath) {
    try {
      return await import(primaryPath);
    } catch (primaryError) {
      console.warn(`Primary module ${primaryPath} failed:`, primaryError.message);
      console.log(`Falling back to ${fallbackPath}`);
      
      try {
        return await import(fallbackPath);
      } catch (fallbackError) {
        console.error('Both primary and fallback modules failed');
        throw new Error(`All imports failed: ${primaryError.message}, ${fallbackError.message}`);
      }
    }
  }
}

// Test safe loading
const safeLoader = new SafeModuleLoader();

async function testSafeLoading() {
  try {
    // Test with fallback
    const module = await safeLoader.safeImport('./non-existent-module.js', {
      fallback: () => ({
        default: { message: 'Fallback module loaded' }
      }),
      onError: (error) => console.log('Error handler called:', error.message)
    });
    
    console.log('Safe import result:', module.default.message);
    
  } catch (error) {
    console.error('Safe import failed:', error.message);
  }
}

testSafeLoading();

console.log('\n=== Performance Monitoring ===');

// Example 7: Performance monitoring for dynamic imports
class ImportPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  async monitoredImport(modulePath) {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      console.log(`Starting monitored import of ${modulePath}`);
      
      const module = await import(modulePath);
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const metrics = {
        path: modulePath,
        loadTime: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        timestamp: new Date().toISOString(),
        success: true
      };
      
      this.metrics.set(modulePath, metrics);
      
      console.log(`Import completed in ${metrics.loadTime.toFixed(2)}ms`);
      console.log(`Memory change: ${metrics.memoryDelta.toFixed(2)}MB`);
      
      return module;
      
    } catch (error) {
      const endTime = performance.now();
      
      const metrics = {
        path: modulePath,
        loadTime: endTime - startTime,
        memoryDelta: 0,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
      
      this.metrics.set(modulePath, metrics);
      throw error;
    }
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  getMetrics(path) {
    return path ? this.metrics.get(path) : Array.from(this.metrics.values());
  }
  
  getAverageLoadTime() {
    const successful = Array.from(this.metrics.values()).filter(m => m.success);
    if (successful.length === 0) return 0;
    
    const total = successful.reduce((sum, m) => sum + m.loadTime, 0);
    return total / successful.length;
  }
  
  clearMetrics() {
    this.metrics.clear();
  }
}

const performanceMonitor = new ImportPerformanceMonitor();

// Test performance monitoring
async function testPerformanceMonitoring() {
  try {
    await performanceMonitor.monitoredImport('./esm-syntax.js');
    await performanceMonitor.monitoredImport('./commonjs-basics.js');
    
    console.log('Performance metrics:', performanceMonitor.getMetrics());
    console.log('Average load time:', performanceMonitor.getAverageLoadTime().toFixed(2), 'ms');
    
  } catch (error) {
    console.error('Performance monitoring error:', error.message);
  }
}

setTimeout(testPerformanceMonitoring, 2000);

module.exports = {
  ModuleLoader,
  FeatureLoader,
  Router,
  SafeModuleLoader,
  ImportPerformanceMonitor
};