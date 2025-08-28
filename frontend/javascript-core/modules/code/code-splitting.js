/**
 * File: code-splitting.js
 * Description: Code splitting strategies and implementation patterns
 * Demonstrates route-based, component-based, and dynamic code splitting
 */

console.log('=== Code Splitting Fundamentals ===');

// Example 1: Basic code splitting concept
console.log('1. Basic code splitting concept:');

// Simulate a large application bundle
const monolithicApp = {
  // Home page components
  HomePage: class HomePage {
    render() { return '<div>Home Page</div>'; }
  },
  
  // About page components  
  AboutPage: class AboutPage {
    render() { return '<div>About Page</div>'; }
  },
  
  // Dashboard (heavy component with dependencies)
  Dashboard: class Dashboard {
    constructor() {
      this.charts = new (class ChartsLibrary {
        renderLineChart() { return 'Line Chart'; }
        renderBarChart() { return 'Bar Chart'; }
        renderPieChart() { return 'Pie Chart'; }
      })();
      
      this.dataGrid = new (class DataGridLibrary {
        renderTable() { return 'Data Table'; }
        renderFilters() { return 'Filters'; }
        renderPagination() { return 'Pagination'; }
      })();
    }
    
    render() {
      return `
        <div>Dashboard
          ${this.charts.renderLineChart()}
          ${this.dataGrid.renderTable()}
        </div>
      `;
    }
  },
  
  // Settings page
  SettingsPage: class SettingsPage {
    render() { return '<div>Settings Page</div>'; }
  },
  
  // User profile (with image editor)
  UserProfile: class UserProfile {
    constructor() {
      this.imageEditor = new (class ImageEditorLibrary {
        crop() { return 'Crop functionality'; }
        resize() { return 'Resize functionality'; }
        filter() { return 'Filter functionality'; }
      })();
    }
    
    render() { return '<div>User Profile with Image Editor</div>'; }
  }
};

console.log('Monolithic app size:', Object.keys(monolithicApp).length, 'components');
console.log('All components loaded regardless of usage');

// Code splitting solution
class CodeSplittingApp {
  constructor() {
    this.loadedChunks = new Map();
    this.currentRoute = null;
  }
  
  async loadChunk(chunkName) {
    if (this.loadedChunks.has(chunkName)) {
      console.log(`Chunk '${chunkName}' already loaded from cache`);
      return this.loadedChunks.get(chunkName);
    }
    
    console.log(`Loading chunk '${chunkName}'...`);
    
    // Simulate async chunk loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let chunk;
    switch (chunkName) {
      case 'home':
        chunk = { HomePage: monolithicApp.HomePage };
        break;
      case 'about':
        chunk = { AboutPage: monolithicApp.AboutPage };
        break;
      case 'dashboard':
        chunk = { Dashboard: monolithicApp.Dashboard };
        break;
      case 'settings':
        chunk = { SettingsPage: monolithicApp.SettingsPage };
        break;
      case 'profile':
        chunk = { UserProfile: monolithicApp.UserProfile };
        break;
      default:
        throw new Error(`Unknown chunk: ${chunkName}`);
    }
    
    this.loadedChunks.set(chunkName, chunk);
    console.log(`Chunk '${chunkName}' loaded successfully`);
    
    return chunk;
  }
  
  async navigateTo(route) {
    console.log(`Navigating to route: ${route}`);
    this.currentRoute = route;
    
    try {
      const chunk = await this.loadChunk(route);
      const ComponentClass = chunk[Object.keys(chunk)[0]];
      const component = new ComponentClass();
      
      console.log(`Rendered: ${component.render()}`);
      return component;
    } catch (error) {
      console.error(`Failed to load route '${route}':`, error.message);
      return null;
    }
  }
  
  getLoadedChunks() {
    return Array.from(this.loadedChunks.keys());
  }
  
  preloadChunk(chunkName) {
    // Load chunk without navigating
    this.loadChunk(chunkName).catch(() => {
      console.log(`Preload failed for chunk: ${chunkName}`);
    });
  }
}

// Demonstrate code splitting
const app = new CodeSplittingApp();

async function demonstrateCodeSplitting() {
  await app.navigateTo('home');
  await app.navigateTo('dashboard'); // Heavy chunk loaded on demand
  await app.navigateTo('home'); // Served from cache
  
  console.log('Loaded chunks:', app.getLoadedChunks());
  
  // Preload for better UX
  app.preloadChunk('profile');
}

demonstrateCodeSplitting();

console.log('\n=== Route-Based Code Splitting ===');

// Example 2: Route-based code splitting
console.log('2. Route-based code splitting:');

class RouteBasedSplitting {
  constructor() {
    this.routes = new Map();
    this.loadingStates = new Map();
    this.cache = new Map();
  }
  
  registerRoute(path, chunkLoader) {
    this.routes.set(path, {
      loader: chunkLoader,
      preload: false,
      priority: 'normal'
    });
  }
  
  registerRouteWithOptions(path, chunkLoader, options = {}) {
    this.routes.set(path, {
      loader: chunkLoader,
      preload: options.preload || false,
      priority: options.priority || 'normal',
      prefetch: options.prefetch || false
    });
  }
  
  async loadRoute(path) {
    if (this.cache.has(path)) {
      console.log(`Route '${path}' loaded from cache`);
      return this.cache.get(path);
    }
    
    if (this.loadingStates.has(path)) {
      console.log(`Route '${path}' is already loading, waiting...`);
      return this.loadingStates.get(path);
    }
    
    const route = this.routes.get(path);
    if (!route) {
      throw new Error(`Route '${path}' not found`);
    }
    
    console.log(`Loading route '${path}' with priority: ${route.priority}`);
    
    const loadingPromise = this.loadRouteInternal(path, route);
    this.loadingStates.set(path, loadingPromise);
    
    return loadingPromise;
  }
  
  async loadRouteInternal(path, route) {
    try {
      // Simulate different loading times based on priority
      const delay = route.priority === 'high' ? 50 : route.priority === 'low' ? 200 : 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const component = await route.loader();
      
      this.cache.set(path, component);
      this.loadingStates.delete(path);
      
      console.log(`Route '${path}' loaded successfully`);
      return component;
    } catch (error) {
      this.loadingStates.delete(path);
      console.error(`Route '${path}' failed to load:`, error.message);
      throw error;
    }
  }
  
  async preloadRoutes(paths) {
    console.log('Preloading routes:', paths);
    
    const preloadPromises = paths.map(path => 
      this.loadRoute(path).catch(error => 
        console.log(`Preload failed for ${path}: ${error.message}`)
      )
    );
    
    await Promise.allSettled(preloadPromises);
    console.log('Route preloading completed');
  }
  
  getRoutingStats() {
    return {
      registeredRoutes: this.routes.size,
      cachedRoutes: this.cache.size,
      loadingRoutes: this.loadingStates.size
    };
  }
}

// Setup route-based splitting
const routeBasedApp = new RouteBasedSplitting();

// Register routes with different priorities
routeBasedApp.registerRouteWithOptions('/', () => Promise.resolve({
  name: 'Home',
  render: () => '<div>Home Page - Fast Loading</div>'
}), { priority: 'high', preload: true });

routeBasedApp.registerRouteWithOptions('/dashboard', () => {
  // Simulate heavy dashboard loading
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        name: 'Dashboard',
        render: () => '<div>Dashboard - Heavy Component</div>',
        charts: ['line', 'bar', 'pie'],
        dataGrid: { rows: 1000, columns: 20 }
      });
    }, 300);
  });
}, { priority: 'normal', prefetch: true });

routeBasedApp.registerRoute('/admin', () => Promise.resolve({
  name: 'Admin',
  render: () => '<div>Admin Panel - Restricted Access</div>'
}));

// Test route-based splitting
async function testRouteBasedSplitting() {
  console.log('Testing route-based code splitting:');
  
  // Load home page (high priority)
  const home = await routeBasedApp.loadRoute('/');
  console.log('Home component:', home.render());
  
  // Preload dashboard for better UX
  routeBasedApp.preloadRoutes(['/dashboard']);
  
  // Load dashboard (should be cached from preload)
  setTimeout(async () => {
    const dashboard = await routeBasedApp.loadRoute('/dashboard');
    console.log('Dashboard component:', dashboard.render());
    console.log('Dashboard features:', dashboard.charts, dashboard.dataGrid);
    
    console.log('Routing stats:', routeBasedApp.getRoutingStats());
  }, 400);
}

testRouteBasedSplitting();

console.log('\n=== Component-Based Code Splitting ===');

// Example 3: Component-based code splitting
console.log('3. Component-based code splitting:');

class ComponentBasedSplitting {
  constructor() {
    this.componentCache = new Map();
    this.loadingComponents = new Map();
  }
  
  async loadComponent(componentName, props = {}) {
    const cacheKey = `${componentName}_${JSON.stringify(props)}`;
    
    if (this.componentCache.has(cacheKey)) {
      console.log(`Component '${componentName}' loaded from cache`);
      return this.componentCache.get(cacheKey);
    }
    
    if (this.loadingComponents.has(componentName)) {
      console.log(`Component '${componentName}' is loading, waiting...`);
      return this.loadingComponents.get(componentName);
    }
    
    console.log(`Loading component '${componentName}' dynamically...`);
    
    const loadingPromise = this.loadComponentInternal(componentName, props);
    this.loadingComponents.set(componentName, loadingPromise);
    
    return loadingPromise;
  }
  
  async loadComponentInternal(componentName, props) {
    try {
      let ComponentClass;
      
      switch (componentName) {
        case 'DataTable':
          // Simulate loading heavy data table component
          await new Promise(resolve => setTimeout(resolve, 150));
          ComponentClass = class DataTable {
            constructor(props) {
              this.props = props;
              this.sortingLibrary = { sort: () => 'Data sorted' };
              this.filterLibrary = { filter: () => 'Data filtered' };
            }
            
            render() {
              return `<table>DataTable with ${this.props.rows || 0} rows</table>`;
            }
          };
          break;
          
        case 'ChartWidget':
          await new Promise(resolve => setTimeout(resolve, 200));
          ComponentClass = class ChartWidget {
            constructor(props) {
              this.props = props;
              this.chartingLibrary = {
                line: () => 'Line chart rendered',
                bar: () => 'Bar chart rendered',
                pie: () => 'Pie chart rendered'
              };
            }
            
            render() {
              const type = this.props.type || 'line';
              return `<div>Chart: ${this.chartingLibrary[type]()}</div>`;
            }
          };
          break;
          
        case 'ImageEditor':
          await new Promise(resolve => setTimeout(resolve, 300));
          ComponentClass = class ImageEditor {
            constructor(props) {
              this.props = props;
              this.editingLibrary = {
                crop: () => 'Image cropped',
                resize: () => 'Image resized',
                filter: () => 'Filter applied'
              };
            }
            
            render() {
              return `<div>Image Editor loaded for: ${this.props.imageUrl || 'no image'}</div>`;
            }
          };
          break;
          
        default:
          throw new Error(`Unknown component: ${componentName}`);
      }
      
      const component = new ComponentClass(props);
      const cacheKey = `${componentName}_${JSON.stringify(props)}`;
      
      this.componentCache.set(cacheKey, component);
      this.loadingComponents.delete(componentName);
      
      console.log(`Component '${componentName}' loaded successfully`);
      return component;
      
    } catch (error) {
      this.loadingComponents.delete(componentName);
      throw error;
    }
  }
  
  async loadMultipleComponents(componentConfigs) {
    console.log('Loading multiple components in parallel...');
    
    const loadPromises = componentConfigs.map(({ name, props }) =>
      this.loadComponent(name, props)
    );
    
    return Promise.all(loadPromises);
  }
  
  getCacheStats() {
    return {
      cached: this.componentCache.size,
      loading: this.loadingComponents.size,
      cachedComponents: Array.from(this.componentCache.keys())
    };
  }
}

// Test component-based splitting
const componentSplitter = new ComponentBasedSplitting();

async function testComponentBasedSplitting() {
  console.log('Testing component-based code splitting:');
  
  // Load individual components on demand
  const dataTable = await componentSplitter.loadComponent('DataTable', { rows: 1000 });
  console.log('DataTable rendered:', dataTable.render());
  
  const chart = await componentSplitter.loadComponent('ChartWidget', { type: 'bar' });
  console.log('Chart rendered:', chart.render());
  
  // Load multiple components in parallel
  const components = await componentSplitter.loadMultipleComponents([
    { name: 'ImageEditor', props: { imageUrl: 'photo.jpg' } },
    { name: 'DataTable', props: { rows: 500 } }
  ]);
  
  components.forEach((component, index) => {
    console.log(`Parallel component ${index}:`, component.render());
  });
  
  console.log('Component cache stats:', componentSplitter.getCacheStats());
}

testComponentBasedSplitting();

console.log('\n=== Advanced Code Splitting Patterns ===');

// Example 4: Advanced patterns
console.log('4. Advanced code splitting patterns:');

class AdvancedCodeSplitting {
  constructor() {
    this.bundles = new Map();
    this.dependencies = new Map();
    this.loadingQueue = [];
    this.maxConcurrentLoads = 3;
    this.currentLoads = 0;
  }
  
  // Register bundle with dependencies
  registerBundle(name, loader, dependencies = []) {
    this.bundles.set(name, {
      loader,
      dependencies,
      loaded: false,
      loading: false,
      size: Math.floor(Math.random() * 500) + 100, // Simulate bundle size
      priority: dependencies.length === 0 ? 'high' : 'normal'
    });
  }
  
  // Load bundle with dependency resolution
  async loadBundle(name) {
    const bundle = this.bundles.get(name);
    if (!bundle) {
      throw new Error(`Bundle '${name}' not found`);
    }
    
    if (bundle.loaded) {
      console.log(`Bundle '${name}' already loaded`);
      return this.dependencies.get(name);
    }
    
    if (bundle.loading) {
      console.log(`Bundle '${name}' is loading, waiting...`);
      return this.waitForBundle(name);
    }
    
    console.log(`Loading bundle '${name}' with dependencies: [${bundle.dependencies.join(', ')}]`);
    
    // Load dependencies first
    const dependencyPromises = bundle.dependencies.map(dep => this.loadBundle(dep));
    await Promise.all(dependencyPromises);
    
    // Add to loading queue if we're at capacity
    if (this.currentLoads >= this.maxConcurrentLoads) {
      console.log(`Queue full, queuing bundle '${name}'`);
      return new Promise((resolve) => {
        this.loadingQueue.push({ name, resolve });
      });
    }
    
    return this.loadBundleInternal(name);
  }
  
  async loadBundleInternal(name) {
    const bundle = this.bundles.get(name);
    bundle.loading = true;
    this.currentLoads++;
    
    try {
      console.log(`Actually loading bundle '${name}' (${bundle.size}KB)`);
      
      // Simulate network delay based on bundle size
      const delay = bundle.size * 2; // 2ms per KB
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const result = await bundle.loader();
      
      bundle.loaded = true;
      bundle.loading = false;
      this.dependencies.set(name, result);
      
      console.log(`Bundle '${name}' loaded successfully`);
      
      // Process queue
      this.currentLoads--;
      this.processQueue();
      
      return result;
      
    } catch (error) {
      bundle.loading = false;
      this.currentLoads--;
      this.processQueue();
      throw error;
    }
  }
  
  processQueue() {
    if (this.loadingQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      const { name, resolve } = this.loadingQueue.shift();
      this.loadBundleInternal(name).then(resolve);
    }
  }
  
  async waitForBundle(name) {
    while (this.bundles.get(name).loading) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return this.dependencies.get(name);
  }
  
  // Intelligent preloading based on user behavior
  async smartPreload(userContext) {
    const predictions = this.predictBundles(userContext);
    console.log('Smart preload predictions:', predictions);
    
    // Load high-probability bundles
    const preloadPromises = predictions
      .filter(p => p.probability > 0.7)
      .map(p => this.loadBundle(p.bundle).catch(() => {}));
    
    await Promise.allSettled(preloadPromises);
  }
  
  predictBundles(userContext) {
    // Simple prediction based on user context
    const predictions = [];
    
    if (userContext.isAdmin) {
      predictions.push({ bundle: 'admin-panel', probability: 0.9 });
    }
    
    if (userContext.hasChartAccess) {
      predictions.push({ bundle: 'charts', probability: 0.8 });
    }
    
    if (userContext.isDataAnalyst) {
      predictions.push({ bundle: 'data-analysis', probability: 0.85 });
    }
    
    return predictions;
  }
  
  getBundleStats() {
    const stats = {
      total: this.bundles.size,
      loaded: 0,
      loading: 0,
      queued: this.loadingQueue.length,
      currentLoads: this.currentLoads,
      totalSize: 0,
      loadedSize: 0
    };
    
    for (const [name, bundle] of this.bundles) {
      stats.totalSize += bundle.size;
      if (bundle.loaded) {
        stats.loaded++;
        stats.loadedSize += bundle.size;
      } else if (bundle.loading) {
        stats.loading++;
      }
    }
    
    return stats;
  }
}

// Setup advanced code splitting
const advancedSplitter = new AdvancedCodeSplitting();

// Register bundles with dependencies
advancedSplitter.registerBundle('core', () => Promise.resolve({
  name: 'Core Bundle',
  utils: { format: () => 'formatted' }
}));

advancedSplitter.registerBundle('ui-components', () => Promise.resolve({
  name: 'UI Components',
  Button: class Button { render() { return '<button>Button</button>'; } }
}), ['core']);

advancedSplitter.registerBundle('charts', () => Promise.resolve({
  name: 'Charts Library',
  LineChart: class LineChart { render() { return 'Line Chart'; } }
}), ['core', 'ui-components']);

advancedSplitter.registerBundle('data-analysis', () => Promise.resolve({
  name: 'Data Analysis Tools',
  DataProcessor: class DataProcessor { process(data) { return 'processed'; } }
}), ['core', 'charts']);

advancedSplitter.registerBundle('admin-panel', () => Promise.resolve({
  name: 'Admin Panel',
  UserManager: class UserManager { list() { return ['user1', 'user2']; } }
}), ['core', 'ui-components', 'data-analysis']);

// Test advanced code splitting
async function testAdvancedCodeSplitting() {
  console.log('Testing advanced code splitting:');
  
  // Smart preloading based on user context
  const userContext = {
    isAdmin: true,
    hasChartAccess: true,
    isDataAnalyst: false
  };
  
  await advancedSplitter.smartPreload(userContext);
  
  // Load admin panel (will load all dependencies)
  const adminPanel = await advancedSplitter.loadBundle('admin-panel');
  console.log('Admin panel loaded:', adminPanel.name);
  
  console.log('Bundle stats:', advancedSplitter.getBundleStats());
}

testAdvancedCodeSplitting();

console.log('\n=== Performance Monitoring ===');

// Example 5: Performance monitoring for code splitting
console.log('5. Code splitting performance monitoring:');

class CodeSplittingMonitor {
  constructor() {
    this.metrics = [];
    this.thresholds = {
      loadTime: 1000, // 1 second
      bundleSize: 200 // 200KB
    };
  }
  
  async monitorBundleLoad(bundleName, loader) {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      console.log(`Monitoring load of bundle: ${bundleName}`);
      
      const result = await loader();
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const loadTime = endTime - startTime;
      
      const metric = {
        bundleName,
        loadTime,
        memoryDelta: endMemory - startMemory,
        timestamp: new Date().toISOString(),
        success: true,
        size: this.estimateBundleSize(result)
      };
      
      this.metrics.push(metric);
      this.analyzePerformance(metric);
      
      console.log(`Bundle '${bundleName}' loaded in ${loadTime.toFixed(2)}ms`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      const metric = {
        bundleName,
        loadTime,
        memoryDelta: 0,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
      
      this.metrics.push(metric);
      throw error;
    }
  }
  
  analyzePerformance(metric) {
    const warnings = [];
    
    if (metric.loadTime > this.thresholds.loadTime) {
      warnings.push(`Slow load time: ${metric.loadTime.toFixed(2)}ms`);
    }
    
    if (metric.size > this.thresholds.bundleSize) {
      warnings.push(`Large bundle size: ${metric.size}KB`);
    }
    
    if (warnings.length > 0) {
      console.warn(`Performance warnings for ${metric.bundleName}:`, warnings);
    }
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  estimateBundleSize(bundle) {
    // Simple size estimation based on serialization
    try {
      return JSON.stringify(bundle).length / 1024; // KB
    } catch {
      return 50; // Default estimate
    }
  }
  
  getPerformanceReport() {
    const successful = this.metrics.filter(m => m.success);
    
    if (successful.length === 0) {
      return { message: 'No successful loads to report' };
    }
    
    const totalLoadTime = successful.reduce((sum, m) => sum + m.loadTime, 0);
    const totalSize = successful.reduce((sum, m) => sum + m.size, 0);
    
    return {
      totalBundles: successful.length,
      averageLoadTime: totalLoadTime / successful.length,
      totalSize,
      slowestBundle: successful.reduce((slow, m) => m.loadTime > slow.loadTime ? m : slow),
      largestBundle: successful.reduce((large, m) => m.size > large.size ? m : large)
    };
  }
}

// Test performance monitoring
const monitor = new CodeSplittingMonitor();

async function testPerformanceMonitoring() {
  console.log('Testing code splitting performance monitoring:');
  
  // Monitor different bundle loads
  await monitor.monitorBundleLoad('lightweight-utils', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { utils: ['helper1', 'helper2'] };
  });
  
  await monitor.monitorBundleLoad('heavy-charts', async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { 
      charts: new Array(100).fill('chart-component'),
      data: new Array(1000).fill({ x: 1, y: 2 })
    };
  });
  
  await monitor.monitorBundleLoad('slow-editor', async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { editor: 'complex-editor-component' };
  });
  
  const report = monitor.getPerformanceReport();
  console.log('Performance Report:');
  console.log(`- Total bundles loaded: ${report.totalBundles}`);
  console.log(`- Average load time: ${report.averageLoadTime.toFixed(2)}ms`);
  console.log(`- Total size: ${report.totalSize.toFixed(2)}KB`);
  console.log(`- Slowest bundle: ${report.slowestBundle.bundleName} (${report.slowestBundle.loadTime.toFixed(2)}ms)`);
  console.log(`- Largest bundle: ${report.largestBundle.bundleName} (${report.largestBundle.size.toFixed(2)}KB)`);
}

testPerformanceMonitoring();

module.exports = {
  monolithicApp,
  CodeSplittingApp,
  RouteBasedSplitting,
  ComponentBasedSplitting,
  AdvancedCodeSplitting,
  CodeSplittingMonitor
};