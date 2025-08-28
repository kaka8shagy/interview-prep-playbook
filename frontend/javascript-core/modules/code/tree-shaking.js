/**
 * File: tree-shaking.js
 * Description: Tree shaking demonstration and optimization techniques
 * Shows how dead code elimination works and how to write tree-shakable code
 */

console.log('=== Tree Shaking Fundamentals ===');

// Example 1: Basic tree shaking concept
console.log('1. Basic tree shaking concept:');

// Simulate a large utility library
const largeUtilityLibrary = {
  // Mathematical functions
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
  power: (a, b) => Math.pow(a, b),
  sqrt: (a) => Math.sqrt(a),
  factorial: (n) => n <= 1 ? 1 : n * largeUtilityLibrary.factorial(n - 1),
  fibonacci: (n) => n <= 1 ? n : largeUtilityLibrary.fibonacci(n - 1) + largeUtilityLibrary.fibonacci(n - 2),
  
  // String functions
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  reverse: (str) => str.split('').reverse().join(''),
  truncate: (str, length) => str.length > length ? str.slice(0, length) + '...' : str,
  slugify: (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  
  // Array functions
  unique: (arr) => [...new Set(arr)],
  chunk: (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => 
    arr.slice(i * size, i * size + size)
  ),
  shuffle: (arr) => arr.sort(() => Math.random() - 0.5),
  flatten: (arr) => arr.flat(Infinity),
  
  // Date functions
  formatDate: (date) => date.toISOString().split('T')[0],
  addDays: (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  daysBetween: (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24),
  
  // Validation functions
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isPhone: (phone) => /^\d{3}-\d{3}-\d{4}$/.test(phone),
  isUrl: (url) => /^https?:\/\/.+/.test(url),
  
  // Color functions
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  rgbToHex: (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''),
  
  // Network functions
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  retry: async (fn, attempts = 3) => {
    try {
      return await fn();
    } catch (error) {
      if (attempts > 1) {
        return largeUtilityLibrary.retry(fn, attempts - 1);
      }
      throw error;
    }
  }
};

console.log('Large utility library has', Object.keys(largeUtilityLibrary).length, 'functions');

// Tree shaking simulation: only using a few functions
function demonstrateTreeShaking() {
  console.log('Application only uses these functions:');
  
  // Only these functions would be included in final bundle
  const usedFunctions = ['add', 'capitalize', 'isEmail'];
  
  usedFunctions.forEach(funcName => {
    console.log(`- ${funcName}`);
  });
  
  // Simulate bundler tree shaking
  const treeShakeResult = {
    originalSize: Object.keys(largeUtilityLibrary).length,
    afterTreeShaking: usedFunctions.length,
    eliminated: Object.keys(largeUtilityLibrary).length - usedFunctions.length
  };
  
  console.log('Tree shaking results:');
  console.log(`- Original: ${treeShakeResult.originalSize} functions`);
  console.log(`- After tree shaking: ${treeShakeResult.afterTreeShaking} functions`);
  console.log(`- Eliminated: ${treeShakeResult.eliminated} functions (${Math.round(treeShakeResult.eliminated / treeShakeResult.originalSize * 100)}%)`);
  
  return treeShakeResult;
}

demonstrateTreeShaking();

console.log('\n=== Tree-Shakable vs Non-Tree-Shakable Code ===');

// Example 2: Tree-shakable patterns
console.log('2. Tree-shakable vs Non-tree-shakable patterns:');

// ✅ GOOD: Tree-shakable - individual named exports
const treeShakableUtils = {
  // Each function is a separate export
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  parseJSON: (str, defaultValue = null) => {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// ❌ BAD: Not tree-shakable - everything bundled together
const nonTreeShakableUtils = {
  default: {
    // All utilities in one object - harder to shake
    string: {
      format: (str, ...args) => str.replace(/{(\d+)}/g, (match, index) => args[index] || ''),
      pad: (str, length, char = ' ') => str.padStart(length, char),
      truncate: (str, length) => str.length > length ? str.slice(0, length) + '...' : str
    },
    
    array: {
      groupBy: (arr, key) => arr.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      }, {}),
      sortBy: (arr, key) => arr.sort((a, b) => a[key] > b[key] ? 1 : -1)
    },
    
    object: {
      pick: (obj, keys) => keys.reduce((result, key) => {
        if (key in obj) result[key] = obj[key];
        return result;
      }, {}),
      omit: (obj, keys) => Object.keys(obj).reduce((result, key) => {
        if (!keys.includes(key)) result[key] = obj[key];
        return result;
      }, {})
    }
  }
};

console.log('Tree-shakable utils:');
// Using individual functions (tree-shakable)
console.log('Currency:', treeShakableUtils.formatCurrency(1234.56));
console.log('Debounced function created');

console.log('\nNon-tree-shakable utils:');
// Using object methods (less tree-shakable)
console.log('String format:', nonTreeShakableUtils.default.string.format('Hello {0}!', 'World'));
console.log('Array groupBy available:', typeof nonTreeShakableUtils.default.array.groupBy);

console.log('\n=== Side Effects and Tree Shaking ===');

// Example 3: Side effects impact
console.log('3. Side effects and tree shaking:');

// ✅ GOOD: Pure functions without side effects
const pureUtils = {
  calculateTax: (amount, rate) => amount * rate,
  formatNumber: (num, decimals = 2) => num.toFixed(decimals),
  validateAge: (age) => age >= 0 && age <= 150
};

// ❌ BAD: Functions with side effects
const impureUtils = {
  // Side effect: logging
  calculateTaxWithLogging: (amount, rate) => {
    console.log(`Calculating tax for amount: ${amount}`); // Side effect!
    return amount * rate;
  },
  
  // Side effect: modifying global state
  counter: 0,
  incrementCounter: () => {
    impureUtils.counter++; // Side effect!
    return impureUtils.counter;
  },
  
  // Side effect: DOM manipulation
  updateUI: (message) => {
    if (typeof document !== 'undefined') {
      document.title = message; // Side effect!
    }
  }
};

// Module with side effects at top level
console.log('Module side effects example:');

// This side effect runs when module is imported
const moduleWithSideEffects = (() => {
  console.log('Module initialization side effect!'); // Always runs
  
  // Polyfill example (side effect)
  if (!Array.prototype.customMethod) {
    Array.prototype.customMethod = function() {
      return 'Custom method added';
    };
  }
  
  return {
    utilityFunction: (x) => x * 2
  };
})();

console.log('Pure function result:', pureUtils.calculateTax(100, 0.1));
console.log('Impure function result:', impureUtils.calculateTaxWithLogging(100, 0.1));
console.log('Module with side effects loaded');

console.log('\n=== Advanced Tree Shaking Techniques ===');

// Example 4: Advanced optimization patterns
console.log('4. Advanced optimization patterns:');

// Conditional exports for better tree shaking
const conditionalUtils = {
  // Base utilities (always included)
  core: {
    identity: (x) => x,
    noop: () => {},
    constant: (value) => () => value
  },
  
  // Development utilities (can be tree-shaken in production)
  development: typeof process !== 'undefined' && process.env.NODE_ENV === 'development' ? {
    debug: (...args) => console.log('[DEBUG]', ...args),
    trace: (label) => console.trace(label),
    profile: (name) => {
      console.time(name);
      return () => console.timeEnd(name);
    }
  } : {},
  
  // Browser-specific utilities (can be tree-shaken in Node.js)
  browser: typeof window !== 'undefined' ? {
    getViewportSize: () => ({
      width: window.innerWidth,
      height: window.innerHeight
    }),
    
    scrollTo: (element) => {
      element.scrollIntoView({ behavior: 'smooth' });
    },
    
    copyToClipboard: async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }
  } : {}
};

console.log('Core utils available:', Object.keys(conditionalUtils.core));
console.log('Development utils:', Object.keys(conditionalUtils.development));
console.log('Browser utils:', Object.keys(conditionalUtils.browser));

// Class-based tree shaking
console.log('\nClass-based tree shaking:');

// ✅ GOOD: Individual classes can be tree-shaken
class UserValidator {
  static validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  static validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }
}

class DataFormatter {
  static formatDate(date) {
    return new Intl.DateTimeFormat('en-US').format(date);
  }
  
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}

// Usage: only UserValidator would be included if DataFormatter isn't used
console.log('Email valid:', UserValidator.validateEmail('test@example.com'));
console.log('Password valid:', UserValidator.validatePassword('MyPass123'));

console.log('\n=== Bundle Analysis Simulation ===');

// Example 5: Bundle analysis
console.log('5. Bundle analysis simulation:');

class BundleAnalyzer {
  constructor() {
    this.dependencies = new Map();
    this.usedExports = new Set();
  }
  
  addDependency(moduleName, exports) {
    this.dependencies.set(moduleName, exports);
  }
  
  markExportAsUsed(moduleName, exportName) {
    const key = `${moduleName}.${exportName}`;
    this.usedExports.add(key);
  }
  
  analyze() {
    const results = {
      totalModules: this.dependencies.size,
      totalExports: 0,
      usedExports: this.usedExports.size,
      unusedExports: 0,
      savingsPotential: 0
    };
    
    for (const [moduleName, moduleExports] of this.dependencies) {
      results.totalExports += Object.keys(moduleExports).length;
      
      // Check which exports are unused
      Object.keys(moduleExports).forEach(exportName => {
        const key = `${moduleName}.${exportName}`;
        if (!this.usedExports.has(key)) {
          results.unusedExports++;
        }
      });
    }
    
    results.savingsPotential = Math.round((results.unusedExports / results.totalExports) * 100);
    
    return results;
  }
  
  getUnusedExports() {
    const unused = [];
    
    for (const [moduleName, moduleExports] of this.dependencies) {
      Object.keys(moduleExports).forEach(exportName => {
        const key = `${moduleName}.${exportName}`;
        if (!this.usedExports.has(key)) {
          unused.push(key);
        }
      });
    }
    
    return unused;
  }
}

// Simulate bundle analysis
const analyzer = new BundleAnalyzer();

// Add modules to analysis
analyzer.addDependency('lodash', {
  map: () => {},
  filter: () => {},
  reduce: () => {},
  find: () => {},
  forEach: () => {},
  some: () => {},
  every: () => {},
  groupBy: () => {},
  sortBy: () => {},
  uniq: () => {},
  flatten: () => {},
  pick: () => {},
  omit: () => {},
  merge: () => {},
  clone: () => {}
});

analyzer.addDependency('moment', {
  format: () => {},
  add: () => {},
  subtract: () => {},
  diff: () => {},
  isValid: () => {},
  isBefore: () => {},
  isAfter: () => {},
  startOf: () => {},
  endOf: () => {},
  timezone: () => {}
});

analyzer.addDependency('axios', {
  get: () => {},
  post: () => {},
  put: () => {},
  delete: () => {},
  patch: () => {},
  request: () => {},
  create: () => {},
  interceptors: {}
});

// Mark only used exports
analyzer.markExportAsUsed('lodash', 'map');
analyzer.markExportAsUsed('lodash', 'filter');
analyzer.markExportAsUsed('lodash', 'find');

analyzer.markExportAsUsed('moment', 'format');
analyzer.markExportAsUsed('moment', 'add');

analyzer.markExportAsUsed('axios', 'get');
analyzer.markExportAsUsed('axios', 'post');

const analysisResults = analyzer.analyze();
console.log('Bundle Analysis Results:');
console.log(`- Total modules: ${analysisResults.totalModules}`);
console.log(`- Total exports: ${analysisResults.totalExports}`);
console.log(`- Used exports: ${analysisResults.usedExports}`);
console.log(`- Unused exports: ${analysisResults.unusedExports}`);
console.log(`- Potential savings: ${analysisResults.savingsPotential}%`);

console.log('\nUnused exports (candidates for tree shaking):');
analyzer.getUnusedExports().slice(0, 10).forEach(exportKey => {
  console.log(`- ${exportKey}`);
});

console.log('\n=== Tree Shaking Best Practices ===');

// Example 6: Best practices demonstration
console.log('6. Tree shaking best practices:');

const bestPractices = {
  // ✅ DO: Use named exports
  namedExports: {
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    formatPhone: (phone) => phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
    generateId: () => Math.random().toString(36).substr(2, 9)
  },
  
  // ✅ DO: Keep functions pure
  pureHelpers: {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
    compose: (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value)
  },
  
  // ✅ DO: Use conditional exports for environment-specific code
  getEnvironmentUtils: () => {
    if (typeof window !== 'undefined') {
      return {
        storage: {
          get: (key) => localStorage.getItem(key),
          set: (key, value) => localStorage.setItem(key, value)
        }
      };
    } else {
      return {
        storage: {
          get: () => null,
          set: () => {}
        }
      };
    }
  },
  
  // ❌ DON'T: Export large objects
  // badPattern: {
  //   default: {
  //     utils: { /* many utilities */ },
  //     helpers: { /* many helpers */ },
  //     constants: { /* many constants */ }
  //   }
  // },
  
  // ❌ DON'T: Use side effects at module level
  // This would prevent tree shaking:
  // console.log('Module loaded!'); // Side effect at top level
  
  // ✅ DO: Lazy initialization for side effects
  lazyInit: (() => {
    let initialized = false;
    let config = null;
    
    return {
      getConfig: () => {
        if (!initialized) {
          config = { theme: 'default', debug: false };
          initialized = true;
        }
        return config;
      }
    };
  })()
};

console.log('Best practices examples:');
console.log('Email validation:', bestPractices.namedExports.validateEmail('test@example.com'));
console.log('Pure function result:', bestPractices.pureHelpers.add(5, 3));

const envUtils = bestPractices.getEnvironmentUtils();
console.log('Environment-specific utils loaded:', typeof envUtils.storage);

console.log('Lazy config initialized:', bestPractices.lazyInit.getConfig());

console.log('\n=== Tree Shaking Configuration Examples ===');

// Example 7: Configuration examples for different bundlers
console.log('7. Bundler configuration examples:');

const bundlerConfigs = {
  webpack: {
    optimization: {
      usedExports: true,
      sideEffects: false, // Mark package as side-effect free
      providedExports: true
    },
    mode: 'production' // Enables tree shaking by default
  },
  
  rollup: {
    // Tree shaking is enabled by default
    external: ['lodash'], // Don't bundle external dependencies
    output: {
      format: 'es' // ES modules for better tree shaking
    }
  },
  
  packageJson: {
    sideEffects: false, // Mark entire package as side-effect free
    // Or specify files with side effects:
    // sideEffects: ["*.css", "./src/polyfills.js"]
  }
};

console.log('Bundler configurations for optimal tree shaking:');
console.log('Webpack: usedExports + sideEffects: false');
console.log('Rollup: ES modules output format');
console.log('Package.json: sideEffects field');

module.exports = {
  largeUtilityLibrary,
  demonstrateTreeShaking,
  treeShakableUtils,
  nonTreeShakableUtils,
  pureUtils,
  impureUtils,
  moduleWithSideEffects,
  conditionalUtils,
  UserValidator,
  DataFormatter,
  BundleAnalyzer,
  bestPractices,
  bundlerConfigs
};