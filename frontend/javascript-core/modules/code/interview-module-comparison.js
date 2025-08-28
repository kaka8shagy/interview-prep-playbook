/**
 * File: interview-module-comparison.js
 * Description: Comprehensive comparison of CommonJS vs ES Modules for interviews
 * Demonstrates key differences, compatibility issues, and migration strategies
 */

console.log('=== CommonJS vs ES Modules Comparison ===');

// Example 1: Syntax Differences
console.log('1. Syntax Differences:');

// CommonJS Examples (simulated)
function demonstrateCommonJSSyntax() {
  console.log('CommonJS Syntax:');
  console.log('// Exporting');
  console.log('module.exports = { name: "MyModule" };');
  console.log('exports.helper = function() {};');
  console.log('');
  console.log('// Importing');
  console.log('const myModule = require("./myModule");');
  console.log('const { helper } = require("./helpers");');
  
  // Simulate CommonJS module
  const simulatedCommonJSModule = {
    exports: {
      name: 'CommonJS Module',
      version: '1.0.0',
      utils: {
        format: (data) => `Formatted: ${data}`,
        validate: (input) => input !== null && input !== undefined
      },
      createInstance: function(config) {
        return {
          config,
          process: (data) => `Processing ${data} with ${config.mode} mode`
        };
      }
    }
  };
  
  // Usage
  const cjsModule = simulatedCommonJSModule.exports;
  console.log('CommonJS module name:', cjsModule.name);
  console.log('CommonJS util:', cjsModule.utils.format('test data'));
  
  const instance = cjsModule.createInstance({ mode: 'production' });
  console.log('CommonJS instance:', instance.process('user data'));
}

function demonstrateESMSyntax() {
  console.log('\nES Modules Syntax:');
  console.log('// Exporting');
  console.log('export default { name: "MyModule" };');
  console.log('export const helper = function() {};');
  console.log('export { utils as utilityFunctions };');
  console.log('');
  console.log('// Importing');
  console.log('import myModule from "./myModule.js";');
  console.log('import { helper } from "./helpers.js";');
  console.log('import { utils as utilityFunctions } from "./utils.js";');
  
  // Simulate ES Module
  const simulatedESModule = {
    default: {
      name: 'ES Module',
      version: '2.0.0',
      description: 'Modern ES Module implementation'
    },
    utils: {
      format: (data) => `ES Formatted: ${data}`,
      validate: (input) => typeof input !== 'undefined' && input !== null
    },
    createFactory: function(options) {
      return {
        options,
        build: (spec) => `Building ${spec} with ES module factory`
      };
    }
  };
  
  // Usage (simulating import statements)
  const esmDefault = simulatedESModule.default;
  const { utils, createFactory } = simulatedESModule;
  
  console.log('ESM default export:', esmDefault.name);
  console.log('ESM named export:', utils.format('test data'));
  
  const factory = createFactory({ environment: 'development' });
  console.log('ESM factory:', factory.build('component'));
}

demonstrateCommonJSSyntax();
demonstrateESMSyntax();

console.log('\n=== Loading Behavior Differences ===');

// Example 2: Loading behavior
console.log('2. Loading Behavior:');

function demonstrateLoadingBehavior() {
  console.log('CommonJS - Synchronous, Runtime Loading:');
  console.log('- Modules loaded synchronously when require() is called');
  console.log('- Can use require() conditionally');
  console.log('- Dynamic module path resolution');
  
  // Simulate CommonJS conditional loading
  function loadCommonJSConditionally(condition) {
    let module;
    
    if (condition) {
      // This would work in real CommonJS
      console.log('Loading production module...');
      module = { name: 'Production Module', config: { debug: false } };
    } else {
      console.log('Loading development module...');
      module = { name: 'Development Module', config: { debug: true } };
    }
    
    return module;
  }
  
  const prodModule = loadCommonJSConditionally(true);
  console.log('Loaded:', prodModule.name);
  
  console.log('\nES Modules - Asynchronous, Static Analysis:');
  console.log('- Modules analyzed statically at compile time');
  console.log('- Import/export statements must be at top level');
  console.log('- Better for tree shaking and optimization');
  console.log('- Dynamic imports available with import() function');
  
  // Simulate ES Modules static nature
  const staticImports = {
    // These would be determined at parse time
    mathUtils: { add: (a, b) => a + b, multiply: (a, b) => a * b },
    stringUtils: { capitalize: (s) => s.charAt(0).toUpperCase() + s.slice(1) },
    dateUtils: { formatDate: (d) => d.toISOString().split('T')[0] }
  };
  
  console.log('Static imports resolved:', Object.keys(staticImports));
  
  // Dynamic import simulation
  async function dynamicImportExample(moduleName) {
    console.log(`Dynamically importing ${moduleName}...`);
    
    // Simulate dynamic import
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const modules = {
      analytics: { track: (event) => `Tracking: ${event}` },
      charts: { render: (data) => `Rendering chart with ${data.length} points` }
    };
    
    return modules[moduleName] || null;
  }
  
  // Test dynamic import
  dynamicImportExample('analytics').then(module => {
    if (module) {
      console.log('Dynamic import result:', module.track('page_view'));
    }
  });
}

demonstrateLoadingBehavior();

console.log('\n=== Hoisting Differences ===');

// Example 3: Hoisting behavior
console.log('3. Hoisting Differences:');

function demonstrateHoisting() {
  console.log('CommonJS Hoisting:');
  console.log('- require() calls can be placed anywhere');
  console.log('- Variables follow normal JavaScript hoisting');
  console.log('- Module caching happens at runtime');
  
  // Simulate CommonJS hoisting
  function commonJSHoistingDemo() {
    console.log('Before require - accessing cached module');
    
    // This would work in CommonJS - require can be anywhere
    function getUtility() {
      const utils = { helper: () => 'Helper function' };
      return utils;
    }
    
    const result = getUtility().helper();
    console.log('CommonJS result:', result);
    
    // require() can be conditional
    let conditionalModule = null;
    if (Math.random() > 0.5) {
      conditionalModule = { name: 'Conditional Module' };
    }
    
    console.log('Conditional module:', conditionalModule?.name || 'Not loaded');
  }
  
  commonJSHoistingDemo();
  
  console.log('\nES Modules Hoisting:');
  console.log('- Import statements are hoisted to top of module');
  console.log('- Imported bindings are in temporal dead zone until module is evaluated');
  console.log('- Import/export statements must be at module top level');
  
  // Simulate ES Modules hoisting
  function esModulesHoistingDemo() {
    console.log('ES Modules - imports are hoisted and processed first');
    
    // Simulate the effect of import hoisting
    const importedBindings = {
      // These would be available throughout the module scope
      utils: { format: (s) => `Formatted: ${s}` },
      constants: { VERSION: '1.0.0', DEBUG: false }
    };
    
    // Even though used before "import" statement, these work due to hoisting
    console.log('Using hoisted import:', importedBindings.utils.format('data'));
    console.log('Using hoisted constant:', importedBindings.constants.VERSION);
    
    // Note: In real ES modules, you can't do conditional imports at top level
    // This would NOT work:
    // if (condition) { import something from './module.js'; }
  }
  
  esModulesHoistingDemo();
}

demonstrateHoisting();

console.log('\n=== Caching Differences ===');

// Example 4: Module caching
console.log('4. Module Caching:');

function demonstrateCaching() {
  // Simulate CommonJS caching
  const commonJSCache = new Map();
  
  function simulateCommonJSRequire(modulePath) {
    if (commonJSCache.has(modulePath)) {
      console.log(`CommonJS: Retrieved ${modulePath} from cache`);
      return commonJSCache.get(modulePath);
    }
    
    console.log(`CommonJS: Loading ${modulePath} for first time`);
    const module = {
      exports: {
        name: `Module ${modulePath}`,
        timestamp: new Date().toISOString(),
        counter: 0,
        increment() {
          this.counter++;
          return this.counter;
        }
      }
    };
    
    commonJSCache.set(modulePath, module.exports);
    return module.exports;
  }
  
  console.log('CommonJS Caching:');
  const cjsModule1 = simulateCommonJSRequire('./myModule');
  const cjsModule2 = simulateCommonJSRequire('./myModule');
  
  console.log('Same instance?', cjsModule1 === cjsModule2); // true
  console.log('First increment:', cjsModule1.increment());
  console.log('Second increment via different reference:', cjsModule2.increment());
  console.log('Counter value consistent:', cjsModule1.counter === cjsModule2.counter);
  
  // Simulate ES Modules caching
  const esModuleCache = new Map();
  
  async function simulateESModuleImport(modulePath) {
    if (esModuleCache.has(modulePath)) {
      console.log(`ES Module: Retrieved ${modulePath} from cache`);
      return esModuleCache.get(modulePath);
    }
    
    console.log(`ES Module: Loading ${modulePath} for first time`);
    
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const moduleNamespace = {
      default: {
        name: `ES Module ${modulePath}`,
        timestamp: new Date().toISOString()
      },
      namedExport: {
        counter: 0,
        increment() {
          this.counter++;
          return this.counter;
        }
      }
    };
    
    esModuleCache.set(modulePath, moduleNamespace);
    return moduleNamespace;
  }
  
  console.log('\nES Module Caching:');
  Promise.all([
    simulateESModuleImport('./esModule'),
    simulateESModuleImport('./esModule')
  ]).then(([esModule1, esModule2]) => {
    console.log('Same instance?', esModule1 === esModule2); // true
    console.log('First increment:', esModule1.namedExport.increment());
    console.log('Second increment:', esModule2.namedExport.increment());
    console.log('Shared state:', esModule1.namedExport.counter === esModule2.namedExport.counter);
  });
}

demonstrateCaching();

console.log('\n=== Binding Differences ===');

// Example 5: Live bindings vs value copies
console.log('5. Live Bindings vs Value Copies:');

function demonstrateBindings() {
  console.log('CommonJS - Value Copies:');
  console.log('- exports are copied by value when imported');
  console.log('- Changes to original don\'t reflect in imported copy');
  
  // Simulate CommonJS value copying
  function createCommonJSModule() {
    let counter = 0;
    
    return {
      exports: {
        counter: counter, // Copied by value
        increment() {
          counter++;
          this.counter = counter; // Need to manually update
          return counter;
        },
        getCounter() {
          return counter; // Always returns current value
        }
      }
    };
  }
  
  const cjsModule = createCommonJSModule();
  const importedCounter = cjsModule.exports.counter; // Copy of value
  
  console.log('Initial imported counter:', importedCounter);
  console.log('After increment:', cjsModule.exports.increment());
  console.log('Imported counter unchanged:', importedCounter); // Still 0
  console.log('Current counter via method:', cjsModule.exports.getCounter());
  
  console.log('\nES Modules - Live Bindings:');
  console.log('- imports are live bindings to exported values');
  console.log('- Changes to original reflect immediately in imports');
  
  // Simulate ES Modules live bindings
  function createESModule() {
    let counter = 0;
    
    // Simulate live binding with getter
    return {
      get counter() {
        return counter; // Always returns current value
      },
      increment() {
        counter++;
        return counter;
      },
      decrement() {
        counter--;
        return counter;
      }
    };
  }
  
  const esModule = createESModule();
  
  console.log('Initial counter binding:', esModule.counter);
  console.log('After increment:', esModule.increment());
  console.log('Counter binding updated:', esModule.counter); // Live binding reflects change
  console.log('After decrement:', esModule.decrement());
  console.log('Counter binding updated again:', esModule.counter);
}

demonstrateBindings();

console.log('\n=== Compatibility and Interoperability ===');

// Example 6: Interop between systems
console.log('6. Interoperability:');

function demonstrateInterop() {
  console.log('Using CommonJS in ES Modules:');
  console.log('- Can import CommonJS modules in ES modules');
  console.log('- Default import gets module.exports');
  console.log('- Named imports may not work depending on exports');
  
  // Simulate CommonJS module
  const commonjsModule = {
    exports: {
      name: 'CommonJS Library',
      version: '1.0.0',
      utils: {
        helper: () => 'Helper function'
      },
      default: 'This is default export' // Rarely used in CJS
    }
  };
  
  // Simulate importing in ES Module
  function simulateESMImportingCJS() {
    // Default import gets the entire module.exports
    const cjsDefault = commonjsModule.exports;
    console.log('Imported CJS as default:', cjsDefault.name);
    
    // Named imports work if properties exist
    const { utils, version } = commonjsModule.exports;
    console.log('Named import from CJS:', utils.helper(), version);
  }
  
  simulateESMImportingCJS();
  
  console.log('\nUsing ES Modules in CommonJS:');
  console.log('- Cannot directly require() ES modules');
  console.log('- Can use dynamic import() function');
  console.log('- Async operation required');
  
  // Simulate using ES Module in CommonJS
  async function simulateCJSImportingESM() {
    // Simulate ES Module
    const esModule = {
      default: {
        name: 'ES Module Library',
        process: (data) => `Processed: ${data}`
      },
      namedExport: {
        utility: () => 'Utility function'
      }
    };
    
    // Simulate dynamic import in CommonJS
    console.log('CommonJS using dynamic import for ES module:');
    
    // This would be: const esm = await import('./es-module.js');
    const esmImport = esModule;
    
    console.log('ES Module default in CJS:', esmImport.default.name);
    console.log('ES Module named export in CJS:', esmImport.namedExport.utility());
  }
  
  simulateCJSImportingESM();
}

demonstrateInterop();

console.log('\n=== Performance and Optimization ===');

// Example 7: Performance characteristics
console.log('7. Performance and Optimization:');

function demonstratePerformance() {
  console.log('CommonJS Performance:');
  console.log('- Runtime loading can impact startup time');
  console.log('- Synchronous loading blocks execution');
  console.log('- Less optimizable by bundlers');
  console.log('- Good for server-side where modules are cached');
  
  // Simulate CommonJS loading time
  function simulateCommonJSLoading() {
    const start = Date.now();
    
    // Simulate synchronous module loading
    const modules = [];
    for (let i = 0; i < 100; i++) {
      const module = {
        name: `Module ${i}`,
        data: new Array(100).fill(i)
      };
      modules.push(module);
    }
    
    const loadTime = Date.now() - start;
    console.log(`CommonJS simulation - loaded 100 modules in ${loadTime}ms`);
    return modules;
  }
  
  console.log('\nES Modules Performance:');
  console.log('- Static analysis enables better optimization');
  console.log('- Tree shaking removes unused exports');
  console.log('- Async loading doesn\'t block main thread');
  console.log('- Better for browser applications');
  
  // Simulate ES Modules optimization
  function simulateESMOptimization() {
    const start = Date.now();
    
    // Simulate optimized loading with tree shaking
    const usedExports = ['add', 'multiply']; // Only these are actually used
    const allExports = ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt'];
    
    // Tree shaking eliminates unused exports
    const optimizedModule = {};
    usedExports.forEach(exportName => {
      optimizedModule[exportName] = (a, b) => `${exportName}(${a}, ${b})`;
    });
    
    const optimizeTime = Date.now() - start;
    console.log(`ES Modules simulation - optimized to ${usedExports.length}/${allExports.length} exports in ${optimizeTime}ms`);
    console.log('Tree shaking saved:', allExports.length - usedExports.length, 'unused exports');
    
    return optimizedModule;
  }
  
  const cjsModules = simulateCommonJSLoading();
  const esmModule = simulateESMOptimization();
  
  console.log('CJS modules loaded:', cjsModules.length);
  console.log('ESM optimized exports:', Object.keys(esmModule));
}

demonstratePerformance();

console.log('\n=== Migration Strategies ===');

// Example 8: Migration approaches
console.log('8. Migration Strategies:');

function demonstrateMigration() {
  console.log('Gradual Migration Approaches:');
  console.log('1. File-by-file conversion');
  console.log('2. Dual package hazard handling');
  console.log('3. Using build tools for compatibility');
  console.log('4. Package.json type field configuration');
  
  // Simulate migration scenario
  function simulateMigrationScenario() {
    // Legacy CommonJS module
    const legacyModule = {
      exports: {
        processData: (data) => `Legacy processing: ${data}`,
        validateInput: (input) => typeof input === 'string',
        version: '1.0.0'
      }
    };
    
    // Migrated ES Module equivalent
    const migratedModule = {
      // Named exports for tree shaking
      processData: (data) => `Modern processing: ${data}`,
      validateInput: (input) => typeof input === 'string' && input.length > 0,
      
      // Default export for main functionality
      default: class DataProcessor {
        constructor(options = {}) {
          this.options = options;
        }
        
        process(data) {
          const validated = migratedModule.validateInput(data);
          return validated ? migratedModule.processData(data) : 'Invalid input';
        }
      },
      
      // Version as named export
      version: '2.0.0'
    };
    
    console.log('\nMigration example:');
    console.log('Legacy:', legacyModule.exports.processData('test'));
    console.log('Migrated named export:', migratedModule.processData('test'));
    
    const processor = new migratedModule.default({ mode: 'strict' });
    console.log('Migrated class usage:', processor.process('test'));
    
    // Compatibility wrapper for gradual migration
    const compatibilityWrapper = {
      // CommonJS-style exports for backward compatibility
      exports: {
        ...migratedModule,
        default: migratedModule.default,
        // Legacy API compatibility
        processData: migratedModule.processData,
        validateInput: migratedModule.validateInput
      }
    };
    
    console.log('Compatibility wrapper works with both styles');
    console.log('CJS style:', compatibilityWrapper.exports.processData('compat'));
    console.log('ESM style available:', typeof compatibilityWrapper.exports.default);
  }
  
  simulateMigrationScenario();
}

demonstrateMigration();

console.log('\n=== Interview Questions Summary ===');

// Example 9: Key interview points
function interviewSummary() {
  console.log('Key Interview Points:');
  
  const comparison = {
    syntax: {
      commonjs: 'require() / module.exports',
      esm: 'import / export'
    },
    loading: {
      commonjs: 'Synchronous, runtime',
      esm: 'Asynchronous, compile-time analysis'
    },
    hoisting: {
      commonjs: 'require() can be anywhere',
      esm: 'import/export are hoisted'
    },
    bindings: {
      commonjs: 'Value copies',
      esm: 'Live bindings'
    },
    optimization: {
      commonjs: 'Limited tree shaking',
      esm: 'Excellent tree shaking'
    },
    compatibility: {
      commonjs: 'Node.js native, browser with bundler',
      esm: 'Modern browsers native, Node.js with flag/extension'
    }
  };
  
  console.log('\nComparison Table:');
  Object.entries(comparison).forEach(([feature, systems]) => {
    console.log(`${feature.toUpperCase()}:`);
    console.log(`  CommonJS: ${systems.commonjs}`);
    console.log(`  ES Modules: ${systems.esm}`);
  });
  
  console.log('\nWhen to use CommonJS:');
  console.log('- Node.js server applications');
  console.log('- Legacy codebases');
  console.log('- When dynamic require() is needed');
  console.log('- Libraries that need to support older environments');
  
  console.log('\nWhen to use ES Modules:');
  console.log('- Modern browser applications');
  console.log('- New projects');
  console.log('- When tree shaking is important');
  console.log('- Libraries targeting modern environments');
}

interviewSummary();

module.exports = {
  demonstrateCommonJSSyntax,
  demonstrateESMSyntax,
  demonstrateLoadingBehavior,
  demonstrateHoisting,
  demonstrateCaching,
  demonstrateBindings,
  demonstrateInterop,
  demonstratePerformance,
  demonstrateMigration,
  interviewSummary
};