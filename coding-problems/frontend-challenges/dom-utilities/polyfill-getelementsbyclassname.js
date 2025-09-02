/**
 * File: polyfill-getelementsbyclassname.js
 * Description: Polyfill implementation for getElementsByClassName with multiple approaches
 * 
 * Learning objectives:
 * - Understand DOM traversal algorithms
 * - Learn polyfill implementation patterns
 * - See performance optimizations for DOM queries
 * 
 * Time Complexity: O(n) where n is number of elements in subtree
 * Space Complexity: O(k) where k is number of matching elements
 */

// =======================
// Approach 1: Basic Polyfill Implementation
// =======================

/**
 * Basic getElementsByClassName polyfill using DOM traversal
 * Recursively searches through all descendant elements
 * 
 * Mental model: DFS traversal checking class attribute of each element
 */
function getElementsByClassNamePolyfill(className, root = document) {
  // Input validation
  if (typeof className !== 'string') {
    throw new TypeError('Class name must be a string');
  }
  
  if (!root || typeof root.getElementsByTagName !== 'function') {
    throw new TypeError('Root must be a valid DOM element or document');
  }
  
  const results = [];
  const classNames = className.trim().split(/\s+/); // Support multiple classes
  
  // Get all elements in the subtree
  const allElements = root.getElementsByTagName('*');
  
  // Check each element for matching classes
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    
    if (hasAllClasses(element, classNames)) {
      results.push(element);
    }
  }
  
  // Return NodeList-like object
  return createNodeListLike(results);
}

/**
 * Check if element has all specified class names
 */
function hasAllClasses(element, classNames) {
  if (!element.className) {
    return classNames.length === 0;
  }
  
  const elementClasses = element.className.trim().split(/\s+/);
  
  // Check if all required classes are present
  return classNames.every(className => 
    elementClasses.includes(className)
  );
}

/**
 * Create NodeList-like object that matches native behavior
 */
function createNodeListLike(elements) {
  const nodeList = Object.create(Array.prototype);
  
  // Add array elements
  elements.forEach((element, index) => {
    nodeList[index] = element;
  });
  
  // Add length property
  Object.defineProperty(nodeList, 'length', {
    value: elements.length,
    writable: false,
    enumerable: false,
    configurable: false
  });
  
  // Add NodeList methods
  nodeList.item = function(index) {
    return this[index] || null;
  };
  
  nodeList.namedItem = function(name) {
    for (let i = 0; i < this.length; i++) {
      if (this[i].id === name || this[i].name === name) {
        return this[i];
      }
    }
    return null;
  };
  
  return nodeList;
}

// =======================
// Approach 2: Optimized Tree Walker Implementation
// =======================

/**
 * Optimized implementation using TreeWalker API when available
 * Falls back to manual traversal in older browsers
 * 
 * Mental model: Use browser's optimized tree walking when possible
 */
function getElementsByClassNameOptimized(className, root = document) {
  if (typeof className !== 'string') {
    throw new TypeError('Class name must be a string');
  }
  
  const classNames = className.trim().split(/\s+/);
  const results = [];
  
  // Use TreeWalker if available (more efficient)
  if (typeof document.createTreeWalker === 'function') {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function(element) {
          return hasAllClasses(element, classNames) 
            ? NodeFilter.FILTER_ACCEPT 
            : NodeFilter.FILTER_REJECT;
        }
      }
    );
    
    let currentElement = walker.nextNode();
    while (currentElement) {
      results.push(currentElement);
      currentElement = walker.nextNode();
    }
  } else {
    // Fallback to manual traversal
    traverseAndCollect(root, classNames, results);
  }
  
  return createNodeListLike(results);
}

/**
 * Manual tree traversal for fallback
 */
function traverseAndCollect(element, classNames, results) {
  // Check current element (except document)
  if (element.nodeType === 1 && hasAllClasses(element, classNames)) {
    results.push(element);
  }
  
  // Recursively check children
  const children = element.children || element.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === 1) { // Element nodes only
      traverseAndCollect(child, classNames, results);
    }
  }
}

// =======================
// Approach 3: Performance-Focused Implementation
// =======================

/**
 * High-performance implementation with caching and optimizations
 * Uses various strategies to minimize DOM access
 * 
 * Mental model: Cache results and use fast path optimizations
 */
function getElementsByClassNameFast(className, root = document, options = {}) {
  const { 
    useCache = false,
    maxResults = Infinity,
    stopAtFirst = false 
  } = options;
  
  if (typeof className !== 'string') {
    throw new TypeError('Class name must be a string');
  }
  
  const classNames = className.trim().split(/\s+/);
  const results = [];
  
  // Early termination for single class optimization
  if (classNames.length === 1 && root.querySelectorAll) {
    try {
      const nodeList = root.querySelectorAll('.' + classNames[0]);
      return nodeList;
    } catch (e) {
      // Invalid class name, fall through to manual implementation
    }
  }
  
  // Use optimized traversal
  fastTraverse(root, classNames, results, { maxResults, stopAtFirst });
  
  return createNodeListLike(results);
}

/**
 * Optimized traversal with early termination
 */
function fastTraverse(element, classNames, results, options) {
  const { maxResults, stopAtFirst } = options;
  
  // Stop if we've found enough results
  if (results.length >= maxResults) {
    return true; // Signal to stop
  }
  
  // Check current element
  if (element.nodeType === 1 && hasAllClasses(element, classNames)) {
    results.push(element);
    
    if (stopAtFirst || results.length >= maxResults) {
      return true; // Found what we need
    }
  }
  
  // Continue with children
  const children = element.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      if (fastTraverse(children[i], classNames, results, options)) {
        return true; // Propagate stop signal
      }
    }
  }
  
  return false;
}

// =======================
// Approach 4: Cross-Browser Compatible Implementation
// =======================

/**
 * Comprehensive polyfill that handles browser differences
 * Includes workarounds for IE and other legacy browsers
 * 
 * Mental model: Handle all the edge cases and browser quirks
 */
function getElementsByClassNameCompatible(className, root = document) {
  // Handle missing or invalid parameters
  if (arguments.length === 0) {
    throw new TypeError('Not enough arguments');
  }
  
  if (className === null || className === undefined) {
    className = 'null'; // IE behavior
  }
  
  className = String(className);
  
  if (!root) {
    root = document;
  }
  
  // Handle empty class name
  if (!className.trim()) {
    return createNodeListLike([]);
  }
  
  const classNames = className.trim().split(/\s+/);
  const results = [];
  
  // IE8 and below compatibility
  if (typeof root.getElementsByTagName === 'function') {
    const allElements = root.getElementsByTagName('*');
    
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      
      if (hasAllClassesCompatible(element, classNames)) {
        results.push(element);
      }
    }
  } else {
    // Very old browsers fallback
    traverseManually(root, classNames, results);
  }
  
  return createNodeListLike(results);
}

/**
 * Compatible class checking that handles IE quirks
 */
function hasAllClassesCompatible(element, classNames) {
  // Handle elements without className property
  const elementClassName = element.className || element.getAttribute('class') || '';
  
  if (!elementClassName) {
    return classNames.length === 0;
  }
  
  // Normalize whitespace (IE sometimes has different whitespace)
  const elementClasses = elementClassName.replace(/\s+/g, ' ').trim().split(' ');
  
  return classNames.every(className => {
    // Case-insensitive in quirks mode in some browsers
    if (document.compatMode === 'BackCompat') {
      return elementClasses.some(eleClass => 
        eleClass.toLowerCase() === className.toLowerCase()
      );
    }
    
    return elementClasses.includes(className);
  });
}

/**
 * Manual traversal for very old browsers
 */
function traverseManually(node, classNames, results) {
  if (node.nodeType === 1 && hasAllClassesCompatible(node, classNames)) {
    results.push(node);
  }
  
  // Use childNodes for maximum compatibility
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    if (children[i].nodeType === 1) {
      traverseManually(children[i], classNames, results);
    }
  }
}

// =======================
// Approach 5: Installation and Feature Detection
// =======================

/**
 * Install the polyfill if native implementation is not available
 * Includes feature detection and graceful degradation
 */
function installGetElementsByClassNamePolyfill() {
  // Feature detection
  if (typeof document.getElementsByClassName === 'function') {
    // Test if it works correctly
    try {
      document.createElement('div').getElementsByClassName('test');
      return; // Native implementation works
    } catch (e) {
      // Native implementation is broken, install polyfill
    }
  }
  
  // Install on Document prototype
  if (typeof Document !== 'undefined' && Document.prototype) {
    Document.prototype.getElementsByClassName = function(className) {
      return getElementsByClassNameCompatible(className, this);
    };
  }
  
  // Install on Element prototype
  if (typeof Element !== 'undefined' && Element.prototype) {
    Element.prototype.getElementsByClassName = function(className) {
      return getElementsByClassNameCompatible(className, this);
    };
  }
  
  // Install on document object directly (for IE8 and below)
  if (typeof document.getElementsByClassName !== 'function') {
    document.getElementsByClassName = function(className) {
      return getElementsByClassNameCompatible(className, this);
    };
  }
}

// =======================
// Utility Functions and Helpers
// =======================

/**
 * Test if polyfill is needed
 */
function isPolyfillNeeded() {
  if (typeof document === 'undefined') return false;
  
  try {
    // Test basic functionality
    const testDiv = document.createElement('div');
    testDiv.className = 'test-class';
    
    const childDiv = document.createElement('div');
    childDiv.className = 'child-test';
    testDiv.appendChild(childDiv);
    
    const result = testDiv.getElementsByClassName('child-test');
    return result.length !== 1;
  } catch (e) {
    return true;
  }
}

/**
 * Performance comparison between implementations
 */
function performanceTest(className, root = document, iterations = 1000) {
  if (typeof performance === 'undefined') {
    console.log('Performance API not available');
    return;
  }
  
  const tests = {
    native: () => root.getElementsByClassName(className),
    polyfill: () => getElementsByClassNamePolyfill(className, root),
    optimized: () => getElementsByClassNameOptimized(className, root),
    fast: () => getElementsByClassNameFast(className, root)
  };
  
  const results = {};
  
  Object.keys(tests).forEach(testName => {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      tests[testName]();
    }
    
    const end = performance.now();
    results[testName] = {
      totalTime: end - start,
      avgTime: (end - start) / iterations
    };
  });
  
  return results;
}

// =======================
// Testing and Demonstration
// =======================

function demonstratePolyfill() {
  if (typeof document === 'undefined') {
    console.log('DOM polyfill demos require a browser environment');
    return;
  }
  
  console.log('\n=== getElementsByClassName Polyfill Demo ===');
  
  // Create test elements
  const testContainer = document.createElement('div');
  testContainer.innerHTML = `
    <div class="test-class">Element 1</div>
    <div class="test-class another-class">Element 2</div>
    <div class="different-class">Element 3</div>
    <div class="test-class">Element 4</div>
  `;
  
  document.body.appendChild(testContainer);
  
  try {
    console.log('Polyfill results:', getElementsByClassNamePolyfill('test-class', testContainer).length);
    console.log('Optimized results:', getElementsByClassNameOptimized('test-class', testContainer).length);
    console.log('Multiple classes:', getElementsByClassNamePolyfill('test-class another-class', testContainer).length);
    
    console.log('Polyfill needed?', isPolyfillNeeded());
    
  } finally {
    document.body.removeChild(testContainer);
  }
}

// Auto-install polyfill if needed
if (typeof window !== 'undefined' && isPolyfillNeeded()) {
  installGetElementsByClassNamePolyfill();
}

// Export for use in other modules
module.exports = {
  getElementsByClassNamePolyfill,
  getElementsByClassNameOptimized,
  getElementsByClassNameFast,
  getElementsByClassNameCompatible,
  installGetElementsByClassNamePolyfill,
  isPolyfillNeeded,
  performanceTest
};