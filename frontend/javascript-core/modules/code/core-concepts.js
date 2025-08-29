/**
 * File: core-concepts.js
 * Description: Essential module system concepts with detailed mental model explanations
 * 
 * Learning objectives:
 * - Understand the fundamental difference between CommonJS and ES Modules
 * - Learn module resolution and loading mechanisms
 * - Master import/export syntax patterns
 * - Grasp the execution timing differences
 * 
 * This file consolidates concepts from: commonjs-basics.js, esm-syntax.js, exports-vs-module-exports.js
 */

console.log('=== Module Systems Core Concepts ===\n');

// ============================================================================
// PART 1: COMMONJS FUNDAMENTALS
// ============================================================================

console.log('--- CommonJS (Node.js Module System) ---');

/**
 * MENTAL MODEL: CommonJS modules are executed synchronously and cached
 * - require() loads and executes modules immediately
 * - module.exports is what gets returned from require()
 * - Each module runs in its own scope wrapper function
 * - First require() executes the module, subsequent requires return cached result
 */

// The module wrapper function (what Node.js does internally):
// (function(exports, require, module, __filename, __dirname) {
//   // Your module code here
// });

// Basic CommonJS export patterns
function createUser(name, email) {
  // We return an object with methods - this creates encapsulation
  // The closure preserves the name and email variables
  return {
    getName() { return name; },
    getEmail() { return email; },
    // We use a method instead of direct property access for privacy
    setEmail(newEmail) {
      // Basic validation - in real apps this would be more robust
      if (newEmail.includes('@')) {
        email = newEmail;
      } else {
        throw new Error('Invalid email format');
      }
    }
  };
}

// Class-based approach for comparison
class UserService {
  constructor() {
    // Private field using WeakMap pattern (pre-private fields)
    // This is important because direct properties are accessible
    this._cache = new Map();
  }
  
  createUser(id, name) {
    // Check cache first - this is a common performance pattern
    // We cache to avoid recreating the same user objects
    if (this._cache.has(id)) {
      return this._cache.get(id);
    }
    
    const user = { id, name, createdAt: new Date() };
    this._cache.set(id, user);
    return user;
  }
  
  // Utility method to manage cache lifecycle
  clearCache() {
    this._cache.clear();
  }
}

// CommonJS export - everything we want to expose goes in module.exports
// We use an object so consumers can destructure what they need
module.exports = {
  createUser,
  UserService,
  // We also export some metadata for debugging
  version: '1.0.0',
  type: 'CommonJS'
};

// CRITICAL CONCEPT: The difference between exports and module.exports
// exports is just a reference to module.exports initially
// exports = module.exports = {}
// 
// This works: exports.foo = 'bar'  (adds property to the same object)
// This breaks: exports = 'bar'     (reassigns exports, breaking the reference)
// 
// Always use module.exports for safety when reassigning the entire export

console.log('CommonJS module loaded. Type:', typeof module);
console.log('Available in CommonJS:', { exports, require, module, __filename, __dirname });

// ============================================================================
// PART 2: ES MODULES FUNDAMENTALS  
// ============================================================================

console.log('\n--- ES Modules (ECMAScript Standard) ---');

/**
 * MENTAL MODEL: ES Modules are statically analyzed and can be async
 * - import/export statements are hoisted and processed before execution
 * - Imports are live bindings (not copies) to exported values
 * - Modules are singletons - same instance shared across all imports
 * - Static structure enables tree shaking and bundler optimizations
 */

// Named exports - these are live bindings
// When we update counter, all imports see the new value immediately
let counter = 0;

export function increment() {
  // This updates the binding that all importers see
  // This is different from CommonJS where you get a copy
  return ++counter;
}

export function getCount() {
  return counter;
}

// This demonstrates the live binding concept
export { counter }; // Importers will see updates to this value

// Default export - there can only be one per module
// Default exports are good for the "main thing" a module provides
class ModuleDemo {
  constructor() {
    this.name = 'ES Module Demo';
    this.features = [
      'Static analysis',
      'Live bindings', 
      'Asynchronous loading',
      'Tree shaking support'
    ];
  }
  
  // Method to demonstrate module state
  demonstrateStaticNature() {
    // ES modules don't have __filename, __dirname like CommonJS
    // Instead we use import.meta for module metadata
    return {
      url: import.meta.url, // The URL of this module
      // Note: import.meta.url gives file:// URL in Node.js
      moduleType: 'ES Module'
    };
  }
  
  // Method to show the difference in binding behavior
  testLiveBindings() {
    const beforeCount = getCount();
    increment();
    const afterCount = getCount();
    
    return {
      before: beforeCount,
      after: afterCount,
      // The counter export will reflect the new value immediately
      exportedCounter: counter
    };
  }
}

// Export the class as default
export default ModuleDemo;

// Additional named exports
export const PI = 3.14159;
export const version = '2.0.0';

// ============================================================================
// PART 3: KEY DIFFERENCES AND WHEN TO USE EACH
// ============================================================================

/**
 * EXECUTION TIMING COMPARISON:
 * 
 * CommonJS:
 * 1. require() is called
 * 2. Module file is executed synchronously 
 * 3. module.exports object is returned
 * 4. Result is cached in require.cache
 * 
 * ES Modules:
 * 1. import statements are hoisted and processed first
 * 2. Module dependency graph is built
 * 3. Modules are executed in dependency order
 * 4. Live bindings are established between modules
 */

// Example showing why understanding execution timing matters:
// In CommonJS, you can conditionally require modules
function loadConfigModule(environment) {
  // This works in CommonJS because require is executed at runtime
  if (environment === 'development') {
    return require('./dev-config');
  } else {
    return require('./prod-config');
  }
}

// In ES Modules, all imports must be at the top level
// This WON'T work:
// if (environment === 'development') {
//   import config from './dev-config.js'; // SyntaxError!
// }

// Instead, use dynamic imports for conditional loading:
export async function loadESMConfig(environment) {
  // Dynamic imports return a Promise and can be conditional
  // This is the ESM equivalent of conditional require()
  if (environment === 'development') {
    const module = await import('./dev-config.js');
    return module.default; // Don't forget .default for default exports
  } else {
    const module = await import('./prod-config.js');
    return module.default;
  }
}

// ============================================================================
// PART 4: PRACTICAL IMPLICATIONS
// ============================================================================

/**
 * WHEN TO USE COMMONJS:
 * - Node.js applications (traditional)
 * - When you need synchronous, conditional module loading
 * - Legacy codebases or libraries
 * - When working with tools that don't support ESM yet
 * 
 * WHEN TO USE ES MODULES:
 * - Modern applications (Node.js 14+ with .mjs or "type": "module")
 * - Frontend applications (with bundlers)
 * - When you need tree shaking for bundle size optimization
 * - When building libraries for modern consumers
 */

// Demonstrating the module wrapper concept for educational purposes
function simulateCommonJSWrapper(moduleCode, filename) {
  // This is approximately what Node.js does internally
  const exports = {};
  const module = { exports };
  
  // Create a mock require function
  const require = (moduleName) => {
    // In real Node.js, this would resolve and load the actual module
    console.log(`Would load module: ${moduleName}`);
    return {}; // Simplified mock
  };
  
  // Simulate the wrapper function
  const wrappedFunction = new Function(
    'exports',
    'require', 
    'module',
    '__filename',
    '__dirname',
    moduleCode
  );
  
  // Execute with the proper context
  wrappedFunction(exports, require, module, filename, '/mock/dir');
  
  // Return what the module exported
  return module.exports;
}

// Export educational utilities
export const educationalUtils = {
  simulateCommonJSWrapper,
  loadConfigModule
};

/**
 * SUMMARY OF KEY CONCEPTS:
 * 
 * 1. CommonJS uses require/module.exports, ESM uses import/export
 * 2. CommonJS loads synchronously, ESM can be async
 * 3. CommonJS exports are copies, ESM exports are live bindings  
 * 4. CommonJS allows conditional requires, ESM requires dynamic imports
 * 5. ESM enables better static analysis and tree shaking
 * 6. Module choice affects bundling and optimization strategies
 */

console.log('\nCore module concepts demonstration complete!');
console.log('Next: See practical-patterns.js for real-world usage patterns');