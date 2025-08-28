/**
 * File: esm-syntax.js
 * Description: ES Modules (ESM) syntax and patterns
 */

// === Named Exports ===
// Export declarations
export const PI = 3.14159;
export const E = 2.71828;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// Export class
export class Calculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
    this.history = [];
  }
  
  add(n) {
    this.value += n;
    this.history.push({ operation: 'add', operand: n, result: this.value });
    return this;
  }
  
  subtract(n) {
    this.value -= n;
    this.history.push({ operation: 'subtract', operand: n, result: this.value });
    return this;
  }
  
  getResult() {
    return this.value;
  }
  
  getHistory() {
    return [...this.history];
  }
}

// === Export List ===
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
const power = (a, b) => a ** b;

// Export multiple items at once
export { multiply, divide, power };

// === Export with Rename ===
const internalUtilityFunction = () => 'internal';
export { internalUtilityFunction as utilityFunction };

// === Default Export ===
// Note: Only one default export per module
class MathLibrary {
  static add(a, b) { return a + b; }
  static subtract(a, b) { return a - b; }
  static multiply(a, b) { return a * b; }
  static divide(a, b) { return a / b; }
  
  // Instance methods
  constructor() {
    this.operations = [];
  }
  
  calculate(expression) {
    // Simple calculator logic
    const result = eval(expression); // Don't use eval in production!
    this.operations.push({ expression, result });
    return result;
  }
  
  getOperations() {
    return [...this.operations];
  }
}

export default MathLibrary;

// === Mixed Exports (Named + Default) ===
export const VERSION = '1.0.0';
export const AUTHOR = 'Math Library Team';

// === Computed Property Exports ===
const featureName = 'advancedMath';
export { power as [featureName + 'Power'] }; // Note: This doesn't work directly

// === Function Expression Exports ===
export const factorial = function(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
};

export const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// === Arrow Function Exports ===
export const square = x => x * x;
export const cube = x => x * x * x;

// === Object Method Exports ===
export const mathUtils = {
  max: Math.max,
  min: Math.min,
  abs: Math.abs,
  round: Math.round,
  
  // Custom methods
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
};

// === Conditional Exports ===
// Note: ESM doesn't allow conditional exports at module level
// This must be done at build time or with dynamic imports

// === Export Aggregation Pattern ===
// This would typically be in a separate file that re-exports from multiple modules

// Re-export everything from another module
// export * from './basicMath.js';

// Re-export specific items from another module
// export { sin, cos, tan } from './trigonometry.js';

// Re-export with rename
// export { default as TrigUtils } from './trigonometry.js';

// === Module Metadata ===
// ESM doesn't have __filename, __dirname like CommonJS
// Use import.meta instead
export const moduleInfo = {
  url: import.meta.url,
  // In browser: file:///path/to/file.js
  // In Node.js with --experimental-import-meta-resolve
};

// === Private Module Variables ===
// Variables not exported are private to the module
let internalCounter = 0;
const internalCache = new Map();

// Private helper function
function incrementCounter() {
  return ++internalCounter;
}

// Export function that uses private variables
export function getNextId() {
  return `id-${incrementCounter()}`;
}

export function cacheValue(key, value) {
  internalCache.set(key, value);
}

export function getCachedValue(key) {
  return internalCache.get(key);
}

// === Type Exports (TypeScript style comments) ===
/**
 * @typedef {Object} CalculationResult
 * @property {number} result - The calculation result
 * @property {string} operation - The operation performed
 * @property {number[]} operands - The operands used
 */

/**
 * Performs a calculation and returns structured result
 * @param {string} operation - The operation to perform
 * @param {...number} operands - The numbers to operate on
 * @returns {CalculationResult} The calculation result
 */
export function performCalculation(operation, ...operands) {
  let result;
  
  switch(operation) {
    case 'add':
      result = operands.reduce((a, b) => a + b, 0);
      break;
    case 'multiply':
      result = operands.reduce((a, b) => a * b, 1);
      break;
    case 'subtract':
      result = operands.reduce((a, b) => a - b);
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
  
  return { result, operation, operands };
}

// === Usage Examples in Comments ===
/*
// How to import this module:

// Import default export
import MathLibrary from './esm-syntax.js';
const lib = new MathLibrary();

// Import named exports
import { add, subtract, Calculator, PI } from './esm-syntax.js';
console.log(add(5, 3)); // 8
console.log(PI); // 3.14159

// Import with rename
import { add as sum, Calculator as Calc } from './esm-syntax.js';
const calc = new Calc(10);

// Import everything
import * as MathModule from './esm-syntax.js';
console.log(MathModule.add(1, 2));

// Import default + named
import MathLibrary, { add, PI } from './esm-syntax.js';

// Dynamic import
const mathModule = await import('./esm-syntax.js');
console.log(mathModule.add(1, 2));
*/

// === Export Summary ===
console.log('ESM module loaded with exports:');
console.log('Named exports: add, subtract, multiply, divide, Calculator, PI, E, etc.');
console.log('Default export: MathLibrary class');

// Note: In ESM, this console.log will run when the module is first imported