/**
 * File: interview-problems.js
 * Description: Common module-related interview questions with detailed solutions
 * 
 * Learning objectives:
 * - Master typical interview questions about module systems
 * - Understand the reasoning behind module design decisions
 * - Practice explaining module concepts clearly
 * - See how to implement module-like behavior from scratch
 * 
 * This file consolidates concepts from: interview-module-comparison.js, circular-dependencies.js
 */

console.log('=== Module System Interview Problems ===\n');

// ============================================================================
// INTERVIEW QUESTION 1: IMPLEMENT A SIMPLE MODULE SYSTEM
// ============================================================================

console.log('--- Question 1: Implement a Simple Module System ---');

/**
 * QUESTION: "Can you implement a basic module system similar to CommonJS?"
 * 
 * APPROACH:
 * 1. Create a module cache to store loaded modules
 * 2. Implement require() function that loads and caches modules
 * 3. Create module wrapper function like Node.js does
 * 4. Handle circular dependencies
 */

class SimpleModuleSystem {
  constructor() {
    // Cache to store loaded modules - key insight for performance
    // Real Node.js uses require.cache for this exact purpose
    this.cache = new Map();
    
    // Keep track of modules currently being loaded to detect cycles
    this.loading = new Set();
  }
  
  /**
   * Our implementation of require()
   * This mimics what Node.js does internally
   */
  require(moduleId) {
    console.log(`Loading module: ${moduleId}`);
    
    // Step 1: Check cache first (performance optimization)
    // Once a module is loaded, we return the cached version
    if (this.cache.has(moduleId)) {
      console.log(`  Found in cache: ${moduleId}`);
      return this.cache.get(moduleId).exports;
    }
    
    // Step 2: Check for circular dependency
    // If we're already loading this module, we have a cycle
    if (this.loading.has(moduleId)) {
      console.log(`  Circular dependency detected: ${moduleId}`);
      // Return incomplete exports (partial loading)
      // This is exactly how Node.js handles circular dependencies
      return this.cache.get(moduleId)?.exports || {};
    }
    
    // Step 3: Create module object (like Node.js module object)
    const module = {
      id: moduleId,
      exports: {}, // This is what gets returned by require()
      loaded: false,
      children: [],
      parent: null
    };
    
    // Step 4: Add to cache early (before execution)
    // This is crucial for circular dependency handling
    this.cache.set(moduleId, module);
    this.loading.add(moduleId);
    
    try {
      // Step 5: Get module source code
      // In real implementation, this would read from filesystem
      const moduleSource = this.getModuleSource(moduleId);
      
      // Step 6: Create module wrapper function
      // Node.js wraps every module in a function like this
      const wrappedModule = this.wrapModule(moduleSource);
      
      // Step 7: Execute module with proper context
      // The module can modify its exports object
      wrappedModule(
        module.exports,  // exports parameter
        this.createRequire(moduleId), // require function
        module,          // module object
        moduleId,        // __filename equivalent
        this.getModuleDir(moduleId) // __dirname equivalent
      );
      
      // Step 8: Mark as loaded
      module.loaded = true;
      console.log(`  Successfully loaded: ${moduleId}`);
      
    } catch (error) {
      // Clean up on error
      this.cache.delete(moduleId);
      throw new Error(`Failed to load module ${moduleId}: ${error.message}`);
    } finally {
      // Remove from loading set
      this.loading.delete(moduleId);
    }
    
    // Step 9: Return module exports
    return module.exports;
  }
  
  /**
   * Wrap module source in function (like Node.js does)
   * This creates the proper scope and provides module globals
   */
  wrapModule(source) {
    // This is the actual pattern Node.js uses
    const wrapper = `(function(exports, require, module, __filename, __dirname) {
      ${source}
    });`;
    
    // Evaluate the wrapper to get the function
    // In production, you'd use vm.runInNewContext for security
    return eval(wrapper);
  }
  
  /**
   * Create a require function scoped to the calling module
   * This allows relative path resolution
   */
  createRequire(parentId) {
    return (moduleId) => {
      // In real implementation, this would resolve relative paths
      // For our demo, we'll just delegate to main require
      return this.require(moduleId);
    };
  }
  
  /**
   * Mock function to simulate getting module source
   * In real Node.js, this reads from the filesystem
   */
  getModuleSource(moduleId) {
    // Mock module sources for demonstration
    const modules = {
      'math-utils': `
        function add(a, b) { return a + b; }
        function multiply(a, b) { return a * b; }
        module.exports = { add, multiply };
      `,
      'circular-a': `
        const b = require('circular-b');
        console.log('Module A loaded, B exports:', Object.keys(b));
        module.exports = { name: 'A', getB: () => b };
      `,
      'circular-b': `
        const a = require('circular-a');
        console.log('Module B loaded, A exports:', Object.keys(a));
        module.exports = { name: 'B', getA: () => a };
      `
    };
    
    if (!modules[moduleId]) {
      throw new Error(`Module not found: ${moduleId}`);
    }
    
    return modules[moduleId];
  }
  
  getModuleDir(moduleId) {
    return `/mock/modules/${moduleId}`;
  }
  
  /**
   * Utility to inspect the module cache (like require.cache)
   */
  getCacheInfo() {
    const info = {};
    for (const [id, module] of this.cache) {
      info[id] = {
        loaded: module.loaded,
        exports: Object.keys(module.exports)
      };
    }
    return info;
  }
}

// Demonstrate the module system
const moduleSystem = new SimpleModuleSystem();

// Test 1: Basic module loading
console.log('\nTest 1: Basic module loading');
const mathUtils = moduleSystem.require('math-utils');
console.log('math-utils exports:', mathUtils);
console.log('5 + 3 =', mathUtils.add(5, 3));

// Test 2: Module caching
console.log('\nTest 2: Module caching (second require should use cache)');
const mathUtilsAgain = moduleSystem.require('math-utils');
console.log('Same instance?', mathUtils === mathUtilsAgain);

// Test 3: Circular dependencies
console.log('\nTest 3: Circular dependencies');
try {
  const moduleA = moduleSystem.require('circular-a');
  console.log('Module A loaded successfully:', moduleA);
  console.log('Cache info:', moduleSystem.getCacheInfo());
} catch (error) {
  console.error('Circular dependency error:', error.message);
}

// ============================================================================
// INTERVIEW QUESTION 2: MODULE LOADING ORDER
// ============================================================================

console.log('\n--- Question 2: Explain Module Loading Order ---');

/**
 * QUESTION: "What order do modules execute in? How does dependency resolution work?"
 * 
 * ANSWER: Demonstrate with dependency tree and execution order
 */

class ModuleExecutionTracker {
  constructor() {
    this.executionOrder = [];
    this.dependencyGraph = {};
  }
  
  /**
   * Simulate module execution and track the order
   */
  simulateModuleExecution() {
    // Reset tracking
    this.executionOrder = [];
    this.dependencyGraph = {};
    
    console.log('Simulating module loading for: app.js');
    console.log('Dependency tree:');
    console.log('app.js -> [config.js, logger.js, utils.js]');
    console.log('logger.js -> [utils.js, formatter.js]');
    console.log('formatter.js -> [utils.js]');
    console.log('');
    
    // Simulate the loading process
    this.loadModule('app.js');
    
    console.log('Final execution order:', this.executionOrder);
    console.log('');
    console.log('Key insights:');
    console.log('1. Dependencies are loaded depth-first');
    console.log('2. Each module executes only once (cached after first load)');
    console.log('3. utils.js executes first (deepest dependency)');
    console.log('4. formatter.js executes before logger.js (dependency order)');
    console.log('5. app.js executes last (top-level module)');
  }
  
  loadModule(moduleId) {
    // Skip if already loaded (simulating cache)
    if (this.executionOrder.includes(moduleId)) {
      return;
    }
    
    // Get dependencies for this module
    const dependencies = this.getDependencies(moduleId);
    
    // Load all dependencies first (depth-first)
    dependencies.forEach(dep => {
      this.loadModule(dep);
    });
    
    // Now execute this module
    this.executeModule(moduleId);
  }
  
  executeModule(moduleId) {
    console.log(`Executing: ${moduleId}`);
    this.executionOrder.push(moduleId);
  }
  
  getDependencies(moduleId) {
    // Mock dependency relationships
    const dependencies = {
      'app.js': ['config.js', 'logger.js', 'utils.js'],
      'logger.js': ['utils.js', 'formatter.js'],
      'formatter.js': ['utils.js'],
      'config.js': [],
      'utils.js': []
    };
    
    return dependencies[moduleId] || [];
  }
}

const executionTracker = new ModuleExecutionTracker();
executionTracker.simulateModuleExecution();

// ============================================================================
// INTERVIEW QUESTION 3: TREE SHAKING EXPLANATION
// ============================================================================

console.log('\n--- Question 3: How does tree shaking work? ---');

/**
 * QUESTION: "Explain tree shaking and why ES modules enable it better than CommonJS"
 * 
 * KEY POINTS:
 * 1. Static analysis vs dynamic analysis
 * 2. Import/export statements are declarative
 * 3. Dead code elimination at build time
 */

console.log('Tree Shaking Explanation:');
console.log('');

// Example 1: ES Modules - Tree shakeable
console.log('✅ ES Modules - Tree Shakeable:');
console.log(`
export function usedFunction() {
  return 'I will be included in bundle';
}

export function unusedFunction() {
  return 'I will be removed by tree shaking';
}

// In consuming module:
import { usedFunction } from './utils.js';
// Only usedFunction gets bundled, unusedFunction is eliminated
`);

// Example 2: CommonJS - Harder to tree shake
console.log('❌ CommonJS - Hard to Tree Shake:');
console.log(`
// utils.js
module.exports = {
  usedFunction() { return 'used'; },
  unusedFunction() { return 'unused'; }
};

// consumer.js
const { usedFunction } = require('./utils');
// Bundler can't easily determine what's unused
// The entire module.exports object might be included
`);

/**
 * Tree Shaking Implementation Concept
 * This shows how a bundler might analyze ES modules
 */
class TreeShakingAnalyzer {
  constructor() {
    this.exportedFunctions = new Set();
    this.importedFunctions = new Set();
    this.moduleGraph = new Map();
  }
  
  /**
   * Analyze a module's exports (what it provides)
   */
  analyzeExports(moduleId, source) {
    console.log(`\nAnalyzing exports in ${moduleId}:`);
    
    // Simplified regex-based analysis (real tools use AST)
    // Look for export statements
    const exportMatches = source.match(/export\s+(function|const|let|var|class)\s+(\w+)/g) || [];
    const namedExportMatches = source.match(/export\s*{\s*([^}]+)\s*}/g) || [];
    
    exportMatches.forEach(match => {
      const name = match.split(/\s+/).pop();
      this.exportedFunctions.add(`${moduleId}:${name}`);
      console.log(`  Found export: ${name}`);
    });
    
    namedExportMatches.forEach(match => {
      const names = match.replace(/export\s*{\s*|\s*}/g, '').split(',');
      names.forEach(name => {
        const cleanName = name.trim().split(' as ')[0];
        this.exportedFunctions.add(`${moduleId}:${cleanName}`);
        console.log(`  Found named export: ${cleanName}`);
      });
    });
  }
  
  /**
   * Analyze a module's imports (what it uses)
   */
  analyzeImports(moduleId, source) {
    console.log(`\nAnalyzing imports in ${moduleId}:`);
    
    // Look for import statements
    const importMatches = source.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"](.*?)['";]/g) || [];
    
    importMatches.forEach(match => {
      const parts = match.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"](.*?)['";]/);
      if (parts) {
        const names = parts[1].split(',');
        const fromModule = parts[2];
        
        names.forEach(name => {
          const cleanName = name.trim().split(' as ')[0];
          this.importedFunctions.add(`${fromModule}:${cleanName}`);
          console.log(`  Found import: ${cleanName} from ${fromModule}`);
        });
      }
    });
  }
  
  /**
   * Determine what can be tree-shaken (removed)
   */
  findUnusedExports() {
    console.log('\nTree Shaking Analysis:');
    
    const unused = [];
    for (const exported of this.exportedFunctions) {
      if (!this.importedFunctions.has(exported)) {
        unused.push(exported);
      }
    }
    
    console.log('\n✂️  Can be tree-shaken (unused exports):');
    unused.forEach(item => console.log(`  - ${item}`));
    
    console.log('\n✅ Will be kept (used exports):');
    for (const imported of this.importedFunctions) {
      if (this.exportedFunctions.has(imported)) {
        console.log(`  - ${imported}`);
      }
    }
    
    return unused;
  }
}

// Demonstrate tree shaking analysis
const analyzer = new TreeShakingAnalyzer();

// Mock module sources
const utilsSource = `
export function formatDate(date) { return date.toISOString(); }
export function formatCurrency(amount) { return '$' + amount; }
export function debugLog(msg) { console.log('[DEBUG]', msg); }
export const API_VERSION = 'v1';
`;

const appSource = `
import { formatDate, API_VERSION } from './utils.js';
console.log(formatDate(new Date()));
console.log('API Version:', API_VERSION);
`;

analyzer.analyzeExports('utils.js', utilsSource);
analyzer.analyzeImports('app.js', appSource);
analyzer.findUnusedExports();

// ============================================================================
// INTERVIEW QUESTION 4: CIRCULAR DEPENDENCY HANDLING
// ============================================================================

console.log('\n--- Question 4: How do you handle circular dependencies? ---');

/**
 * QUESTION: "What are circular dependencies and how should you handle them?"
 * 
 * APPROACH:
 * 1. Show how they occur
 * 2. Explain why they're problematic
 * 3. Demonstrate detection
 * 4. Show resolution strategies
 */

class CircularDependencyDetector {
  constructor() {
    this.dependencyGraph = new Map();
    this.visitStack = [];
  }
  
  addDependency(from, to) {
    if (!this.dependencyGraph.has(from)) {
      this.dependencyGraph.set(from, new Set());
    }
    this.dependencyGraph.get(from).add(to);
  }
  
  /**
   * Detect circular dependencies using DFS
   */
  detectCycles() {
    console.log('Checking for circular dependencies...');
    
    const visited = new Set();
    const cycles = [];
    
    for (const module of this.dependencyGraph.keys()) {
      if (!visited.has(module)) {
        const cycle = this.dfsDetectCycle(module, visited, [], new Set());
        if (cycle) {
          cycles.push(cycle);
        }
      }
    }
    
    return cycles;
  }
  
  dfsDetectCycle(module, visited, path, pathSet) {
    if (pathSet.has(module)) {
      // Found a cycle - return the circular path
      const cycleStart = path.indexOf(module);
      return path.slice(cycleStart).concat([module]);
    }
    
    if (visited.has(module)) {
      return null; // Already processed, no cycle here
    }
    
    visited.add(module);
    path.push(module);
    pathSet.add(module);
    
    const dependencies = this.dependencyGraph.get(module) || new Set();
    
    for (const dep of dependencies) {
      const cycle = this.dfsDetectCycle(dep, visited, path, pathSet);
      if (cycle) {
        return cycle;
      }
    }
    
    path.pop();
    pathSet.delete(module);
    
    return null;
  }
  
  /**
   * Suggest solutions for circular dependencies
   */
  suggestSolutions(cycles) {
    console.log('\nCircular Dependency Solutions:');
    
    cycles.forEach((cycle, index) => {
      console.log(`\nCycle ${index + 1}: ${cycle.join(' -> ')}`);
      console.log('Possible solutions:');
      console.log('1. Extract common dependencies to a separate module');
      console.log('2. Use dependency injection');
      console.log('3. Restructure to remove the circular reference');
      console.log('4. Use dynamic imports to break the cycle');
    });
  }
}

// Example: Set up a circular dependency scenario
console.log('Setting up circular dependency example:');
console.log('UserService -> OrderService -> UserService');

const detector = new CircularDependencyDetector();
detector.addDependency('UserService', 'OrderService');
detector.addDependency('OrderService', 'PaymentService');
detector.addDependency('PaymentService', 'UserService'); // Creates cycle
detector.addDependency('UserService', 'ValidationService');

const cycles = detector.detectCycles();

if (cycles.length > 0) {
  console.log('\n🚨 Circular dependencies detected:');
  cycles.forEach((cycle, index) => {
    console.log(`  Cycle ${index + 1}: ${cycle.join(' -> ')}`);
  });
  
  detector.suggestSolutions(cycles);
} else {
  console.log('\n✅ No circular dependencies found');
}

/**
 * SUMMARY OF INTERVIEW TOPICS:
 * 
 * 1. Module System Implementation:
 *    - Caching mechanism
 *    - Module wrapper function
 *    - Circular dependency handling
 * 
 * 2. Module Loading Order:
 *    - Depth-first dependency resolution
 *    - Execution order vs loading order
 *    - Cache behavior
 * 
 * 3. Tree Shaking:
 *    - Static analysis advantages of ES modules
 *    - Dead code elimination
 *    - Bundle optimization
 * 
 * 4. Circular Dependencies:
 *    - Detection algorithms
 *    - Common causes
 *    - Resolution strategies
 * 
 * Key Interview Tips:
 * - Explain the 'why' behind design decisions
 * - Use concrete examples to illustrate concepts  
 * - Mention performance implications
 * - Show awareness of real-world trade-offs
 */

console.log('\nInterview problems demonstration complete!');
console.log('Next: See advanced-concepts.js for complex scenarios and bundling topics');