/**
 * File: module-resolution.js
 * Description: Module resolution algorithms in Node.js and browsers
 * Covers CommonJS resolution, ES module resolution, and package.json handling
 */

console.log('=== Module Resolution Algorithms ===');

// Example 1: CommonJS Module Resolution Algorithm
console.log('1. CommonJS Module Resolution:');

class CommonJSResolver {
  constructor() {
    this.cache = new Map();
    this.paths = [
      '/node_modules',
      '/usr/local/lib/node_modules',
      process.cwd() + '/node_modules'
    ];
  }

  resolve(request, parent = process.cwd()) {
    console.log(`Resolving: "${request}" from "${parent}"`);
    
    // Step 1: Check if it's a core module
    if (this.isCoreModule(request)) {
      console.log(`  ✓ Core module: ${request}`);
      return { type: 'core', path: request };
    }

    // Step 2: Check if it's a relative path
    if (request.startsWith('./') || request.startsWith('../') || request.startsWith('/')) {
      return this.resolveRelative(request, parent);
    }

    // Step 3: Check if it's a package
    return this.resolvePackage(request, parent);
  }

  isCoreModule(request) {
    const coreModules = [
      'fs', 'path', 'http', 'https', 'url', 'querystring',
      'crypto', 'events', 'stream', 'util', 'os'
    ];
    return coreModules.includes(request);
  }

  resolveRelative(request, parent) {
    const path = require('path');
    const fs = require('fs');
    
    const basePath = path.resolve(path.dirname(parent), request);
    
    // Try exact match first
    if (this.fileExists(basePath)) {
      console.log(`  ✓ Exact file: ${basePath}`);
      return { type: 'file', path: basePath };
    }

    // Try with extensions
    const extensions = ['.js', '.json', '.node'];
    for (const ext of extensions) {
      const filePath = basePath + ext;
      if (this.fileExists(filePath)) {
        console.log(`  ✓ With extension: ${filePath}`);
        return { type: 'file', path: filePath };
      }
    }

    // Try as directory with index file
    for (const ext of extensions) {
      const indexPath = path.join(basePath, 'index' + ext);
      if (this.fileExists(indexPath)) {
        console.log(`  ✓ Directory index: ${indexPath}`);
        return { type: 'file', path: indexPath };
      }
    }

    // Try package.json main field
    const packagePath = path.join(basePath, 'package.json');
    if (this.fileExists(packagePath)) {
      const packageJson = this.readPackageJson(packagePath);
      if (packageJson.main) {
        const mainPath = path.resolve(basePath, packageJson.main);
        console.log(`  ✓ Package main: ${mainPath}`);
        return { type: 'file', path: mainPath };
      }
    }

    throw new Error(`Module not found: ${request}`);
  }

  resolvePackage(request, parent) {
    const path = require('path');
    
    // Extract package name and subpath
    const [packageName, ...subpathParts] = request.split('/');
    const subpath = subpathParts.join('/');
    
    console.log(`  Package: ${packageName}, Subpath: ${subpath || '(none)'}`);

    // Search in node_modules directories
    let currentDir = path.dirname(parent);
    
    while (currentDir !== path.dirname(currentDir)) {
      const nodeModulesDir = path.join(currentDir, 'node_modules');
      const packageDir = path.join(nodeModulesDir, packageName);
      
      if (this.directoryExists(packageDir)) {
        console.log(`  Found package at: ${packageDir}`);
        
        if (subpath) {
          // Resolve subpath
          return this.resolveRelative('./' + subpath, packageDir);
        } else {
          // Resolve main entry
          return this.resolvePackageMain(packageDir);
        }
      }
      
      currentDir = path.dirname(currentDir);
    }

    // Check global paths
    for (const globalPath of this.paths) {
      const packageDir = path.join(globalPath, packageName);
      if (this.directoryExists(packageDir)) {
        console.log(`  Found global package at: ${packageDir}`);
        return this.resolvePackageMain(packageDir);
      }
    }

    throw new Error(`Package not found: ${request}`);
  }

  resolvePackageMain(packageDir) {
    const path = require('path');
    const packageJsonPath = path.join(packageDir, 'package.json');
    
    if (this.fileExists(packageJsonPath)) {
      const packageJson = this.readPackageJson(packageJsonPath);
      
      // Check main field
      if (packageJson.main) {
        const mainPath = path.resolve(packageDir, packageJson.main);
        console.log(`  ✓ Package main field: ${mainPath}`);
        return { type: 'file', path: mainPath };
      }
    }

    // Default to index.js
    const indexPath = path.join(packageDir, 'index.js');
    if (this.fileExists(indexPath)) {
      console.log(`  ✓ Default index.js: ${indexPath}`);
      return { type: 'file', path: indexPath };
    }

    throw new Error(`Cannot resolve package main: ${packageDir}`);
  }

  fileExists(filePath) {
    // Mock implementation
    const mockFiles = [
      '/project/utils.js',
      '/project/lib/helper.js',
      '/project/node_modules/lodash/index.js',
      '/project/node_modules/express/package.json'
    ];
    return mockFiles.includes(filePath);
  }

  directoryExists(dirPath) {
    // Mock implementation
    const mockDirs = [
      '/project/node_modules/lodash',
      '/project/node_modules/express'
    ];
    return mockDirs.includes(dirPath);
  }

  readPackageJson(packagePath) {
    // Mock package.json files
    const mockPackages = {
      '/project/node_modules/express/package.json': {
        name: 'express',
        version: '4.18.0',
        main: 'lib/express.js'
      },
      '/project/package.json': {
        name: 'my-project',
        version: '1.0.0',
        main: 'index.js'
      }
    };
    return mockPackages[packagePath] || {};
  }
}

// Test CommonJS resolution
const resolver = new CommonJSResolver();
try {
  console.log('Testing resolution:');
  resolver.resolve('fs');
  resolver.resolve('./utils');
  resolver.resolve('lodash');
} catch (error) {
  console.log('Resolution error:', error.message);
}

// Example 2: ES Module Resolution
console.log('\n2. ES Module Resolution:');

class ESModuleResolver {
  constructor() {
    this.importMap = new Map();
  }

  resolve(specifier, parent) {
    console.log(`ES Module resolving: "${specifier}" from "${parent}"`);

    // Check import map first
    if (this.importMap.has(specifier)) {
      const mapped = this.importMap.get(specifier);
      console.log(`  ✓ Import map: ${mapped}`);
      return { type: 'mapped', url: mapped };
    }

    // URL resolution
    try {
      const url = new URL(specifier, parent);
      console.log(`  ✓ URL resolved: ${url.href}`);
      return { type: 'url', url: url.href };
    } catch (error) {
      console.log(`  ✗ Invalid URL: ${error.message}`);
    }

    // Bare specifier (package name)
    if (!specifier.startsWith('./') && !specifier.startsWith('../') && !specifier.startsWith('/')) {
      return this.resolveBareSpecifier(specifier, parent);
    }

    throw new Error(`Cannot resolve ES module: ${specifier}`);
  }

  resolveBareSpecifier(specifier, parent) {
    console.log(`  Resolving bare specifier: ${specifier}`);
    
    // In browser, would consult import map
    // In Node.js, would follow package.json exports field
    
    const mockResolution = `https://cdn.skypack.dev/${specifier}`;
    console.log(`  ✓ CDN resolution: ${mockResolution}`);
    return { type: 'cdn', url: mockResolution };
  }

  addImportMap(map) {
    Object.entries(map).forEach(([key, value]) => {
      this.importMap.set(key, value);
    });
  }
}

const esResolver = new ESModuleResolver();
esResolver.addImportMap({
  'react': 'https://cdn.skypack.dev/react@17',
  'lodash': 'https://cdn.skypack.dev/lodash@4'
});

try {
  esResolver.resolve('react', 'file:///project/main.js');
  esResolver.resolve('./module.js', 'file:///project/main.js');
  esResolver.resolve('https://example.com/module.js', 'file:///project/main.js');
} catch (error) {
  console.log('ES resolution error:', error.message);
}

// Example 3: Package.json Export Maps
console.log('\n3. Package.json Export Maps:');

class ExportMapResolver {
  constructor() {
    this.packageExports = new Map();
  }

  addPackage(name, packageJson) {
    this.packageExports.set(name, packageJson);
  }

  resolve(packageName, subpath = '.') {
    console.log(`Resolving export: ${packageName}${subpath !== '.' ? '/' + subpath : ''}`);
    
    const packageJson = this.packageExports.get(packageName);
    if (!packageJson || !packageJson.exports) {
      console.log(`  No exports field, falling back to main`);
      return packageJson?.main || './index.js';
    }

    const exports = packageJson.exports;
    
    // Handle different export patterns
    if (typeof exports === 'string') {
      console.log(`  ✓ Simple export: ${exports}`);
      return exports;
    }

    if (Array.isArray(exports)) {
      console.log(`  ✓ Array export: ${exports[0]}`);
      return exports[0];
    }

    // Object exports
    return this.resolveObjectExports(exports, subpath, packageName);
  }

  resolveObjectExports(exports, subpath, packageName) {
    const targetKey = subpath === '' ? '.' : './' + subpath;
    console.log(`  Looking for key: ${targetKey}`);

    // Direct match
    if (exports[targetKey]) {
      return this.resolveExportValue(exports[targetKey], packageName);
    }

    // Pattern matching
    for (const [pattern, value] of Object.entries(exports)) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '(.+)') + '$');
        const match = targetKey.match(regex);
        if (match) {
          console.log(`  ✓ Pattern match: ${pattern} -> ${value}`);
          return this.resolveExportValue(value, packageName, match[1]);
        }
      }
    }

    // Fallback patterns
    if (exports['./*']) {
      const fallback = exports['./*'].replace('*', subpath);
      console.log(`  ✓ Wildcard fallback: ${fallback}`);
      return fallback;
    }

    throw new Error(`No export found for ${packageName}/${subpath}`);
  }

  resolveExportValue(value, packageName, wildcard = '') {
    if (typeof value === 'string') {
      const resolved = value.replace('*', wildcard);
      console.log(`  ✓ Resolved to: ${resolved}`);
      return resolved;
    }

    // Conditional exports
    if (typeof value === 'object') {
      // Check conditions in order
      const conditions = ['import', 'require', 'node', 'browser', 'default'];
      for (const condition of conditions) {
        if (value[condition]) {
          console.log(`  ✓ Conditional export (${condition}): ${value[condition]}`);
          return value[condition];
        }
      }
    }

    throw new Error(`Cannot resolve export value for ${packageName}`);
  }
}

// Test export map resolution
const exportResolver = new ExportMapResolver();

// Add mock packages
exportResolver.addPackage('my-lib', {
  name: 'my-lib',
  exports: {
    '.': './index.js',
    './utils': './lib/utils.js',
    './features/*': './lib/features/*.js',
    './package.json': './package.json'
  }
});

exportResolver.addPackage('universal-lib', {
  name: 'universal-lib',
  exports: {
    '.': {
      import: './esm/index.js',
      require: './cjs/index.js'
    },
    './utils': {
      import: './esm/utils.js',
      require: './cjs/utils.js'
    }
  }
});

try {
  console.log('Testing export resolution:');
  exportResolver.resolve('my-lib');
  exportResolver.resolve('my-lib', 'utils');
  exportResolver.resolve('my-lib', 'features/auth');
  exportResolver.resolve('universal-lib');
  exportResolver.resolve('universal-lib', 'utils');
} catch (error) {
  console.log('Export resolution error:', error.message);
}

// Example 4: Resolution Caching
console.log('\n4. Resolution Caching:');

class CachedResolver {
  constructor() {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
  }

  resolve(request, parent) {
    const cacheKey = `${request}@${parent}`;
    
    if (this.cache.has(cacheKey)) {
      this.stats.hits++;
      console.log(`Cache HIT: ${cacheKey}`);
      return this.cache.get(cacheKey);
    }

    this.stats.misses++;
    console.log(`Cache MISS: ${cacheKey}`);
    
    // Simulate resolution work
    const result = {
      request,
      parent,
      resolved: `/resolved/path/to/${request}`,
      timestamp: Date.now()
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  getCacheStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`
    };
  }

  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

const cachedResolver = new CachedResolver();

// Test caching
console.log('Testing resolution caching:');
cachedResolver.resolve('lodash', '/project/main.js');
cachedResolver.resolve('react', '/project/main.js');
cachedResolver.resolve('lodash', '/project/main.js'); // Should hit cache
cachedResolver.resolve('lodash', '/project/other.js'); // Different parent, cache miss

console.log('Cache stats:', cachedResolver.getCacheStats());

// Example 5: Resolution Tracing
console.log('\n5. Resolution Tracing:');

class TracingResolver {
  constructor() {
    this.traces = [];
    this.depth = 0;
  }

  trace(message, type = 'info') {
    const indent = '  '.repeat(this.depth);
    const timestamp = Date.now();
    const entry = { timestamp, depth: this.depth, type, message };
    
    this.traces.push(entry);
    console.log(`${indent}[${type.upper || type}] ${message}`);
  }

  resolve(request, parent) {
    this.trace(`Resolving: ${request} from ${parent}`, 'start');
    this.depth++;

    try {
      // Step 1: Check cache
      this.trace('Checking cache', 'step');
      
      // Step 2: Determine resolution type
      if (request.startsWith('./')) {
        this.trace('Detected relative import', 'step');
        return this.resolveRelative(request, parent);
      } else {
        this.trace('Detected bare specifier', 'step');
        return this.resolvePackage(request, parent);
      }
    } finally {
      this.depth--;
      this.trace(`Resolution complete for: ${request}`, 'end');
    }
  }

  resolveRelative(request, parent) {
    this.trace(`Resolving relative: ${request}`, 'resolve');
    // Mock resolution
    const resolved = parent.replace(/\/[^\/]*$/, '/' + request.slice(2));
    this.trace(`✓ Resolved to: ${resolved}`, 'success');
    return { path: resolved };
  }

  resolvePackage(request, parent) {
    this.trace(`Resolving package: ${request}`, 'resolve');
    this.trace('Searching node_modules', 'step');
    
    // Mock package resolution
    const resolved = `/node_modules/${request}/index.js`;
    this.trace(`✓ Found package at: ${resolved}`, 'success');
    return { path: resolved };
  }

  getTrace() {
    return this.traces;
  }

  printTrace() {
    console.log('\nFull resolution trace:');
    this.traces.forEach((entry, index) => {
      const indent = '  '.repeat(entry.depth);
      console.log(`${index + 1}. ${indent}[${entry.type}] ${entry.message}`);
    });
  }
}

const tracingResolver = new TracingResolver();
tracingResolver.resolve('./utils', '/project/main.js');
tracingResolver.resolve('lodash', '/project/main.js');
tracingResolver.printTrace();

module.exports = {
  CommonJSResolver,
  ESModuleResolver,
  ExportMapResolver,
  CachedResolver,
  TracingResolver
};