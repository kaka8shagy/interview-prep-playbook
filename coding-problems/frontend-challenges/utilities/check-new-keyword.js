/**
 * File: check-new-keyword.js
 * Description: Multiple approaches to detect if a function was called with the 'new' keyword
 * 
 * Learning objectives:
 * - Understand constructor invocation patterns
 * - Learn about new.target and other detection methods
 * - See practical applications in library design
 * 
 * Time Complexity: O(1) for detection
 * Space Complexity: O(1)
 */

// =======================
// Approach 1: new.target (ES6+)
// =======================

/**
 * Modern approach using new.target
 * new.target is undefined when function is called normally
 * new.target refers to the constructor when called with 'new'
 * 
 * Mental model: new.target is like a flag that gets set automatically
 * when using the 'new' operator
 */
function ModernConstructor() {
  // new.target will be undefined if called without 'new'
  // Will be the constructor function if called with 'new'
  if (!new.target) {
    // Called without 'new' - handle gracefully
    console.log('Function called without new keyword');
    return new ModernConstructor();
  }
  
  console.log('Function called with new keyword');
  this.calledWithNew = true;
  
  // new.target gives us the actual constructor used
  // Useful for inheritance scenarios
  this.constructor = new.target;
}

// =======================
// Approach 2: instanceof Check
// =======================

/**
 * Check if 'this' is an instance of the constructor
 * When called with 'new', 'this' will be a new instance
 * When called normally, 'this' will be global object or undefined (strict mode)
 * 
 * Mental model: 'new' creates a new object and sets it as 'this'
 */
function InstanceofConstructor() {
  // In strict mode, 'this' is undefined when called without 'new'
  // In non-strict mode, 'this' is the global object (window/global)
  if (!(this instanceof InstanceofConstructor)) {
    console.log('Function called without new keyword');
    // Auto-correct by calling with 'new'
    return new InstanceofConstructor();
  }
  
  console.log('Function called with new keyword');
  this.calledWithNew = true;
}

// =======================
// Approach 3: this Binding Check (Legacy)
// =======================

/**
 * Legacy approach - check the nature of 'this'
 * Less reliable than modern approaches but useful for understanding
 * 
 * Limitations:
 * - Doesn't work in strict mode as reliably
 * - Can be fooled by .call()/.apply()
 */
function LegacyConstructor() {
  'use strict';
  
  // In strict mode, 'this' is undefined when called without 'new'
  if (this === undefined) {
    console.log('Function called without new keyword (strict mode)');
    // Cannot auto-correct easily in strict mode
    throw new TypeError('Constructor must be called with new keyword');
  }
  
  // Additional check: ensure 'this' is not the global object
  if (typeof window !== 'undefined' && this === window) {
    console.log('Function called without new keyword (non-strict)');
    return new LegacyConstructor();
  }
  
  console.log('Function called with new keyword');
  this.calledWithNew = true;
}

// =======================
// Approach 4: Comprehensive Detection Utility
// =======================

/**
 * Robust utility function that can detect 'new' usage
 * Combines multiple techniques for maximum compatibility
 * 
 * This is what you'd use in real-world libraries
 */
function createNewDetector(name = 'Constructor') {
  return function() {
    let calledWithNew = false;
    let detectionMethod = '';
    
    // Method 1: new.target (most reliable, ES6+)
    if (typeof new.target !== 'undefined') {
      calledWithNew = !!new.target;
      detectionMethod = 'new.target';
    }
    // Method 2: instanceof check
    else if (this instanceof arguments.callee) {
      calledWithNew = true;
      detectionMethod = 'instanceof';
    }
    // Method 3: this binding analysis
    else if (this && this !== (typeof window !== 'undefined' ? window : global)) {
      calledWithNew = true;
      detectionMethod = 'this-binding';
    }
    else {
      calledWithNew = false;
      detectionMethod = 'default-false';
    }
    
    // Store detection information
    this.newDetection = {
      calledWithNew,
      detectionMethod,
      timestamp: Date.now()
    };
    
    console.log(`${name} called ${calledWithNew ? 'with' : 'without'} new (detected via ${detectionMethod})`);
    
    // Auto-correct if needed
    if (!calledWithNew) {
      console.log('Auto-correcting by calling with new...');
      return new arguments.callee();
    }
  };
}

// =======================
// Approach 5: Factory Pattern Alternative
// =======================

/**
 * Sometimes the best solution is to avoid the problem entirely
 * Use factory functions that work both with and without 'new'
 * 
 * Mental model: Make the API foolproof by design
 */
function createInstance(data) {
  // Always return a new object, regardless of how called
  const instance = Object.create(createInstance.prototype);
  
  // Set up the instance
  instance.data = data || {};
  instance.created = Date.now();
  instance.type = 'factory-created';
  
  return instance;
}

// Add methods to the prototype
createInstance.prototype.getData = function() {
  return this.data;
};

createInstance.prototype.isFactoryCreated = function() {
  return this.type === 'factory-created';
};

// =======================
// Practical Examples & Edge Cases
// =======================

// Example 1: Library that requires 'new'
function StrictLibrary() {
  if (!new.target) {
    throw new Error('StrictLibrary must be called with new keyword');
  }
  this.initialized = true;
}

// Example 2: Library that's flexible
function FlexibleLibrary() {
  if (!new.target) {
    return new FlexibleLibrary();
  }
  this.initialized = true;
}

// Example 3: Detection in class constructors (ES6)
class ModernClass {
  constructor() {
    // new.target works in class constructors too
    console.log('new.target in class:', new.target ? new.target.name : 'undefined');
    
    // Classes automatically enforce 'new' usage
    // Calling without 'new' throws TypeError automatically
  }
}

// =======================
// Testing Examples
// =======================

console.log('\n=== Testing new.target approach ===');
try {
  const obj1 = new ModernConstructor(); // With new
  const obj2 = ModernConstructor();     // Without new (auto-corrected)
} catch (e) {
  console.log('Error:', e.message);
}

console.log('\n=== Testing instanceof approach ===');
try {
  const obj3 = new InstanceofConstructor(); // With new
  const obj4 = InstanceofConstructor();     // Without new (auto-corrected)
} catch (e) {
  console.log('Error:', e.message);
}

console.log('\n=== Testing factory pattern ===');
const factory1 = createInstance({ name: 'test1' }); // No new needed
const factory2 = new createInstance({ name: 'test2' }); // Works with new too
console.log('Factory 1:', factory1.getData());
console.log('Factory 2:', factory2.getData());

console.log('\n=== Testing modern class ===');
try {
  const class1 = new ModernClass(); // Correct usage
  // const class2 = ModernClass(); // Would throw TypeError
} catch (e) {
  console.log('Class error:', e.message);
}

// =======================
// Real-world Usage Patterns
// =======================

/**
 * Pattern 1: jQuery-style - always return an instance
 */
function $(selector) {
  if (!new.target) {
    return new $(selector);
  }
  this.selector = selector;
  this.elements = document.querySelectorAll(selector);
  return this;
}

/**
 * Pattern 2: Configuration objects with validation
 */
function Config(options) {
  if (!new.target) {
    throw new TypeError('Config must be instantiated with new keyword for proper validation');
  }
  
  // Validate options since this is a proper constructor call
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be provided as an object');
  }
  
  this.options = { ...options };
  this.validated = true;
}

// Export for use in other modules
module.exports = {
  ModernConstructor,
  InstanceofConstructor,
  LegacyConstructor,
  createNewDetector,
  createInstance,
  StrictLibrary,
  FlexibleLibrary,
  ModernClass,
  $,
  Config
};