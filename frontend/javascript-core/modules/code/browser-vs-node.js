/**
 * File: browser-vs-node.js
 * Description: Key differences between module systems in browser vs Node.js environments
 * Covers loading mechanisms, global objects, APIs, and compatibility patterns
 */

console.log('=== Browser vs Node.js Module Systems ===');

// Example 1: Environment Detection
console.log('1. Environment Detection:');

function detectEnvironment() {
  // Method 1: Check for Node.js specific globals
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node';
  }
  
  // Method 2: Check for browser specific globals
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser';
  }
  
  // Method 3: Check for Web Workers
  if (typeof self !== 'undefined' && typeof importScripts !== 'undefined') {
    return 'webworker';
  }
  
  // Method 4: Check for Deno
  if (typeof Deno !== 'undefined') {
    return 'deno';
  }
  
  return 'unknown';
}

const environment = detectEnvironment();
console.log('Current environment:', environment);

// Example 2: Module Loading Differences
console.log('\n2. Module Loading Differences:');

// Node.js module loading simulation
class NodeModuleLoader {
  constructor() {
    this.cache = new Map();
    this.extensions = {
      '.js': this.loadJavaScript.bind(this),
      '.json': this.loadJSON.bind(this),
      '.node': this.loadNative.bind(this)
    };
  }

  require(id) {
    console.log(`Node require('${id}')`);
    
    // Check cache first
    if (this.cache.has(id)) {
      console.log(`  ✓ From cache`);
      return this.cache.get(id).exports;
    }

    // Resolve path
    const resolvedPath = this.resolve(id);
    console.log(`  Resolved to: ${resolvedPath}`);

    // Create module object
    const module = {
      id: resolvedPath,
      exports: {},
      loaded: false,
      children: [],
      parent: null
    };

    // Cache before loading to handle circular dependencies
    this.cache.set(id, module);

    // Load based on extension
    const ext = this.getExtension(resolvedPath);
    const loader = this.extensions[ext] || this.extensions['.js'];
    loader(module, resolvedPath);

    module.loaded = true;
    return module.exports;
  }

  resolve(id) {
    // Simplified resolution
    if (id.startsWith('./') || id.startsWith('../')) {
      return `/project/${id}`;
    }
    return `/node_modules/${id}/index.js`;
  }

  getExtension(filename) {
    return filename.slice(filename.lastIndexOf('.'));
  }

  loadJavaScript(module, filename) {
    console.log(`  Loading JS: ${filename}`);
    // In real Node.js, would read file and wrap in function
    const mockCode = `
      module.exports = {
        name: '${filename}',
        type: 'javascript',
        loaded: new Date()
      };
    `;
    this.executeModule(module, mockCode, filename);
  }

  loadJSON(module, filename) {
    console.log(`  Loading JSON: ${filename}`);
    // Mock JSON content
    module.exports = {
      name: filename,
      type: 'json',
      version: '1.0.0'
    };
  }

  loadNative(module, filename) {
    console.log(`  Loading native: ${filename}`);
    // Mock native module
    module.exports = {
      name: filename,
      type: 'native',
      binding: 'mock'
    };
  }

  executeModule(module, code, filename) {
    // In real Node.js, code is wrapped like this:
    const wrapper = [
      '(function (exports, require, module, __filename, __dirname) { ',
      '\n});'
    ];
    
    console.log(`  Wrapped module code for execution`);
    // Mock execution - in real Node.js, would use vm module
    eval(code);
  }
}

// Browser module loading simulation
class BrowserModuleLoader {
  constructor() {
    this.moduleMap = new Map();
    this.importMap = new Map();
  }

  async import(specifier) {
    console.log(`Browser import('${specifier}')`);

    // Check import map
    const resolvedSpecifier = this.resolveImportMap(specifier);
    console.log(`  Resolved specifier: ${resolvedSpecifier}`);

    // Check module cache
    if (this.moduleMap.has(resolvedSpecifier)) {
      console.log(`  ✓ From module cache`);
      return this.moduleMap.get(resolvedSpecifier);
    }

    // Fetch the module
    const moduleRecord = await this.fetchModule(resolvedSpecifier);
    
    // Parse and link
    const module = await this.instantiateModule(moduleRecord, resolvedSpecifier);
    
    // Cache and return
    this.moduleMap.set(resolvedSpecifier, module);
    return module;
  }

  resolveImportMap(specifier) {
    if (this.importMap.has(specifier)) {
      return this.importMap.get(specifier);
    }
    
    // Handle relative/absolute URLs
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      return new URL(specifier, window.location.href).href;
    }
    
    if (specifier.startsWith('http')) {
      return specifier;
    }
    
    // Bare specifier - would normally fail without import map
    return `https://cdn.skypack.dev/${specifier}`;
  }

  async fetchModule(url) {
    console.log(`  Fetching: ${url}`);
    
    // Mock fetch response
    const mockModules = {
      'https://cdn.skypack.dev/lodash': `
        export default { version: '4.17.21' };
        export const map = (arr, fn) => arr.map(fn);
      `,
      '/modules/utils.js': `
        export const helper = () => 'helper function';
        export default { name: 'utils' };
      `
    };

    const code = mockModules[url] || `export default { mock: true };`;
    
    return {
      url,
      code,
      type: 'module'
    };
  }

  async instantiateModule(moduleRecord, url) {
    console.log(`  Instantiating: ${url}`);
    
    // Mock module instantiation
    // In real browser, this involves parsing, linking, and evaluation
    return {
      url,
      namespace: {
        default: { name: 'mock-module', url },
        // Other exports would be here
      }
    };
  }

  setImportMap(map) {
    Object.entries(map).forEach(([key, value]) => {
      this.importMap.set(key, value);
    });
  }
}

// Test both loaders
const nodeLoader = new NodeModuleLoader();
const browserLoader = new BrowserModuleLoader();

console.log('\nTesting Node.js loader:');
try {
  const nodeModule = nodeLoader.require('./utils');
  console.log('Node module result:', nodeModule);
} catch (error) {
  console.log('Node loading error:', error.message);
}

console.log('\nTesting Browser loader:');
browserLoader.setImportMap({
  'lodash': 'https://cdn.skypack.dev/lodash',
  'utils': '/modules/utils.js'
});

// Mock async execution for demo
setTimeout(async () => {
  try {
    const browserModule = await browserLoader.import('lodash');
    console.log('Browser module result:', browserModule);
  } catch (error) {
    console.log('Browser loading error:', error.message);
  }
}, 100);

// Example 3: Global Objects Comparison
console.log('\n3. Global Objects Comparison:');

class GlobalsAnalyzer {
  analyzeNode() {
    const nodeGlobals = {
      // Process information
      process: typeof process !== 'undefined' ? {
        version: process.version,
        platform: process.platform,
        env: Object.keys(process.env).length + ' env vars'
      } : 'undefined',
      
      // Path utilities
      __dirname: typeof __dirname !== 'undefined' ? __dirname : 'undefined',
      __filename: typeof __filename !== 'undefined' ? __filename : 'undefined',
      
      // Module system
      require: typeof require !== 'undefined' ? 'function' : 'undefined',
      module: typeof module !== 'undefined' ? 'object' : 'undefined',
      exports: typeof exports !== 'undefined' ? 'object' : 'undefined',
      
      // Timers
      setTimeout: typeof setTimeout,
      setImmediate: typeof setImmediate,
      
      // Buffer
      Buffer: typeof Buffer !== 'undefined' ? 'constructor' : 'undefined',
      
      // Global object
      global: typeof global !== 'undefined' ? 'object' : 'undefined'
    };

    return nodeGlobals;
  }

  analyzeBrowser() {
    const browserGlobals = {
      // Window object
      window: typeof window !== 'undefined' ? 'object' : 'undefined',
      document: typeof document !== 'undefined' ? 'object' : 'undefined',
      
      // Navigation
      location: typeof location !== 'undefined' ? {
        href: location.href,
        origin: location.origin
      } : 'undefined',
      navigator: typeof navigator !== 'undefined' ? {
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      } : 'undefined',
      
      // Storage
      localStorage: typeof localStorage !== 'undefined' ? 'object' : 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined' ? 'object' : 'undefined',
      
      // Networking
      fetch: typeof fetch,
      XMLHttpRequest: typeof XMLHttpRequest,
      
      // Timers (same as Node.js but different implementation)
      setTimeout: typeof setTimeout,
      requestAnimationFrame: typeof requestAnimationFrame,
      
      // Console (available in both but different implementation)
      console: typeof console
    };

    return browserGlobals;
  }

  compare() {
    const node = this.analyzeNode();
    const browser = this.analyzeBrowser();
    
    console.log('Node.js globals:');
    Object.entries(node).forEach(([key, value]) => {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    });
    
    console.log('\nBrowser globals:');
    Object.entries(browser).forEach(([key, value]) => {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    });
  }
}

const globalsAnalyzer = new GlobalsAnalyzer();
globalsAnalyzer.compare();

// Example 4: Polyfills and Compatibility
console.log('\n4. Polyfills and Compatibility:');

class CompatibilityLayer {
  constructor() {
    this.polyfills = new Map();
    this.setupPolyfills();
  }

  setupPolyfills() {
    // Process polyfill for browsers
    if (typeof process === 'undefined') {
      this.polyfills.set('process', {
        env: {},
        platform: 'browser',
        version: 'browser',
        nextTick: (callback) => setTimeout(callback, 0)
      });
    }

    // Buffer polyfill for browsers
    if (typeof Buffer === 'undefined') {
      this.polyfills.set('Buffer', {
        from: (data) => new Uint8Array(data),
        isBuffer: (obj) => obj instanceof Uint8Array
      });
    }

    // require polyfill for browsers (simplified)
    if (typeof require === 'undefined') {
      this.polyfills.set('require', (id) => {
        throw new Error(`require('${id}') not available in browser`);
      });
    }

    // global polyfill
    if (typeof global === 'undefined') {
      this.polyfills.set('global', typeof window !== 'undefined' ? window : self);
    }

    // fetch polyfill for Node.js (simplified)
    if (typeof fetch === 'undefined') {
      this.polyfills.set('fetch', async (url) => {
        const https = require('https');
        return new Promise((resolve, reject) => {
          https.get(url, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => resolve({
              ok: response.statusCode < 400,
              status: response.statusCode,
              text: () => Promise.resolve(data)
            }));
          }).on('error', reject);
        });
      });
    }
  }

  getPolyfill(name) {
    return this.polyfills.get(name);
  }

  applyPolyfills(globalObject = typeof window !== 'undefined' ? window : global) {
    this.polyfills.forEach((polyfill, name) => {
      if (!(name in globalObject)) {
        globalObject[name] = polyfill;
        console.log(`Applied polyfill for: ${name}`);
      }
    });
  }
}

const compatibility = new CompatibilityLayer();
console.log('Available polyfills:', Array.from(compatibility.polyfills.keys()));

// Example 5: Universal Module Pattern
console.log('\n5. Universal Module Pattern (UMD):');

function createUniversalModule() {
  // UMD (Universal Module Definition) pattern
  const umdTemplate = `
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['dependency'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory(require('dependency'));
    } else {
        // Browser globals
        root.MyLibrary = factory(root.Dependency);
    }
}(typeof self !== 'undefined' ? self : this, function (dependency) {
    'use strict';

    // Library code here
    function MyLibrary() {
        console.log('MyLibrary initialized');
        this.dependency = dependency;
    }

    MyLibrary.prototype.doSomething = function() {
        return 'Universal module working in ' + this.getEnvironment();
    };

    MyLibrary.prototype.getEnvironment = function() {
        if (typeof process !== 'undefined' && process.versions.node) {
            return 'Node.js';
        } else if (typeof window !== 'undefined') {
            return 'Browser';
        } else {
            return 'Unknown';
        }
    };

    return MyLibrary;
}));
  `;

  console.log('UMD template created (simplified)');
  return umdTemplate;
}

const umdModule = createUniversalModule();

// Example 6: Module Bundling Differences
console.log('\n6. Module Bundling Differences:');

class BundlingStrategies {
  analyzeBrowserBundling() {
    return {
      strategies: [
        'Webpack - Creates dependency graph, bundles everything',
        'Rollup - Tree-shaking focused, smaller bundles',
        'Parcel - Zero-config, automatic optimization',
        'Vite - ESM-based, fast dev server'
      ],
      considerations: [
        'Code splitting for better loading performance',
        'Tree shaking to remove unused code',
        'Lazy loading with dynamic imports',
        'Asset optimization (CSS, images)',
        'Source maps for debugging',
        'Browser compatibility transforms'
      ],
      outputFormats: ['IIFE', 'UMD', 'ES modules', 'CommonJS'],
      deliveryMethods: [
        'Single bundle file',
        'Code-split chunks',
        'HTTP/2 push',
        'CDN delivery'
      ]
    };
  }

  analyzeNodeBundling() {
    return {
      strategies: [
        'Webpack - Server-side rendering bundles',
        'Rollup - Library bundling',
        'pkg - Executable packaging',
        'Native ES modules - Node.js 14+'
      ],
      considerations: [
        'Preserve external dependencies',
        'Handle native modules',
        'Environment variable injection',
        'Process and path handling',
        'File system access patterns'
      ],
      outputFormats: ['CommonJS', 'ES modules'],
      deliveryMethods: [
        'npm package',
        'Single executable',
        'Docker container',
        'Lambda function'
      ]
    };
  }

  compare() {
    const browser = this.analyzeBrowserBundling();
    const node = this.analyzeNodeBundling();

    console.log('Browser bundling:');
    console.log('  Strategies:', browser.strategies);
    console.log('  Key considerations:', browser.considerations.slice(0, 3));

    console.log('\nNode.js bundling:');
    console.log('  Strategies:', node.strategies);
    console.log('  Key considerations:', node.considerations.slice(0, 3));

    console.log('\nCommon challenges:');
    console.log('  - Dependency resolution');
    console.log('  - Code transformation');
    console.log('  - Performance optimization');
    console.log('  - Development vs production builds');
  }
}

const bundlingAnalysis = new BundlingStrategies();
bundlingAnalysis.compare();

// Example 7: Performance Characteristics
console.log('\n7. Performance Characteristics:');

class PerformanceAnalyzer {
  measureModuleLoading() {
    console.log('Module loading performance characteristics:');
    
    console.log('\nNode.js:');
    console.log('  - Synchronous require() - blocking');
    console.log('  - File system access overhead');
    console.log('  - Module cache for repeated requires');
    console.log('  - V8 compilation cache');
    
    console.log('\nBrowser:');
    console.log('  - Asynchronous import() - non-blocking');
    console.log('  - Network latency for fetching');
    console.log('  - HTTP caching mechanisms');
    console.log('  - Preloading and prefetching');
    
    // Simulate performance measurement
    const measurements = {
      node: {
        firstLoad: '2-5ms (file system)',
        cachedLoad: '0.1ms (memory)',
        bundleSize: 'Not applicable'
      },
      browser: {
        firstLoad: '50-200ms (network)',
        cachedLoad: '1-5ms (HTTP cache)',
        bundleSize: 'Critical factor'
      }
    };

    console.log('\nTypical measurements:');
    Object.entries(measurements).forEach(([env, metrics]) => {
      console.log(`  ${env}:`);
      Object.entries(metrics).forEach(([metric, value]) => {
        console.log(`    ${metric}: ${value}`);
      });
    });
  }

  optimizationStrategies() {
    console.log('\nOptimization strategies:');
    
    console.log('\nNode.js optimizations:');
    console.log('  - Minimize require() calls in hot paths');
    console.log('  - Use lazy loading for heavy modules');
    console.log('  - Optimize module resolution paths');
    console.log('  - Cache expensive computations');
    
    console.log('\nBrowser optimizations:');
    console.log('  - Bundle splitting and lazy loading');
    console.log('  - Tree shaking unused code');
    console.log('  - Compress and minify bundles');
    console.log('  - Use service workers for caching');
    console.log('  - Implement module preloading');
  }
}

const perfAnalyzer = new PerformanceAnalyzer();
perfAnalyzer.measureModuleLoading();
perfAnalyzer.optimizationStrategies();

module.exports = {
  detectEnvironment,
  NodeModuleLoader,
  BrowserModuleLoader,
  GlobalsAnalyzer,
  CompatibilityLayer,
  BundlingStrategies,
  PerformanceAnalyzer,
  createUniversalModule
};