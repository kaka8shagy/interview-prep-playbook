/**
 * File: css-selector-generator.js
 * Description: Generate unique CSS selectors for DOM elements
 * 
 * Learning objectives:
 * - Understand DOM traversal and element identification
 * - Learn selector specificity and uniqueness strategies
 * - See performance vs accuracy trade-offs
 * 
 * Time Complexity: O(d) where d is DOM depth
 * Space Complexity: O(d) for selector path storage
 */

// =======================
// Approach 1: Basic Selector Generation
// =======================

/**
 * Generate basic CSS selector for an element
 * Prioritizes ID, then class, then tag with position
 * 
 * Mental model: Build selector from most specific to least specific
 * ID > Class > Tag + nth-child
 */
function generateBasicSelector(element) {
  // Input validation
  if (!element || !element.nodeType || element.nodeType !== 1) {
    throw new Error('Invalid element provided');
  }
  
  // Check if element has ID (most specific)
  if (element.id) {
    // Validate ID is unique in document
    if (document.querySelectorAll(`#${element.id}`).length === 1) {
      return `#${element.id}`;
    }
  }
  
  // Check for unique class combination
  if (element.className) {
    const classes = element.className.split(/\s+/).filter(cls => cls);
    if (classes.length > 0) {
      const classSelector = '.' + classes.join('.');
      if (document.querySelectorAll(classSelector).length === 1) {
        return classSelector;
      }
    }
  }
  
  // Fall back to tag with nth-child
  const tagName = element.tagName.toLowerCase();
  const parent = element.parentNode;
  
  if (!parent || parent.nodeType !== 1) {
    return tagName; // Root element
  }
  
  // Find position among siblings of same type
  const siblings = Array.from(parent.children).filter(
    sibling => sibling.tagName.toLowerCase() === tagName
  );
  
  if (siblings.length === 1) {
    return tagName;
  }
  
  const index = siblings.indexOf(element) + 1;
  return `${tagName}:nth-child(${index})`;
}

// =======================
// Approach 2: Unique Path Generation
// =======================

/**
 * Generate unique selector path from document root
 * Traverses up the DOM tree building a unique path
 * 
 * Mental model: Build breadcrumb path ensuring uniqueness at each level
 */
function generateUniquePath(element, options = {}) {
  const {
    includeRoot = false,
    preferIds = true,
    preferClasses = true,
    maxDepth = 50
  } = options;
  
  if (!element || element.nodeType !== 1) {
    throw new Error('Invalid element provided');
  }
  
  const path = [];
  let current = element;
  let depth = 0;
  
  while (current && current.nodeType === 1 && depth < maxDepth) {
    const selector = generateSelectorForElement(current, {
      preferIds,
      preferClasses,
      context: current.parentNode
    });
    
    path.unshift(selector);
    
    // Stop if we have a unique selector
    if (selector.startsWith('#') || 
        document.querySelectorAll(path.join(' > ')).length === 1) {
      break;
    }
    
    current = current.parentNode;
    depth++;
    
    // Stop at document root unless specifically requested
    if (!includeRoot && (current === document.body || current === document.documentElement)) {
      break;
    }
  }
  
  return path.join(' > ');
}

/**
 * Generate selector for a single element with context awareness
 */
function generateSelectorForElement(element, options = {}) {
  const { preferIds = true, preferClasses = true, context = null } = options;
  
  // Try ID first (if enabled and unique in context)
  if (preferIds && element.id) {
    const idSelector = `#${element.id}`;
    const contextQuery = context || document;
    
    if (contextQuery.querySelectorAll(idSelector).length === 1) {
      return idSelector;
    }
  }
  
  const tagName = element.tagName.toLowerCase();
  let selector = tagName;
  
  // Add classes if they help uniqueness
  if (preferClasses && element.className) {
    const classes = element.className.split(/\s+/).filter(cls => cls && /^[a-zA-Z]/.test(cls));
    
    if (classes.length > 0) {
      // Try most specific class combination first
      for (let i = classes.length; i > 0; i--) {
        const classCombo = classes.slice(0, i).join('.');
        const testSelector = `${tagName}.${classCombo}`;
        
        const contextQuery = context || document;
        if (contextQuery.querySelectorAll(testSelector).length === 1) {
          return testSelector;
        }
      }
      
      // Use first class even if not unique
      selector += '.' + classes[0];
    }
  }
  
  // Add nth-child if still not unique
  const parent = element.parentNode;
  if (parent && parent.nodeType === 1) {
    const siblings = Array.from(parent.children);
    const sameTagSiblings = siblings.filter(
      sibling => sibling.tagName.toLowerCase() === tagName
    );
    
    if (sameTagSiblings.length > 1) {
      const index = sameTagSiblings.indexOf(element) + 1;
      selector += `:nth-child(${index})`;
    }
  }
  
  return selector;
}

// =======================
// Approach 3: Smart Selector Optimization
// =======================

/**
 * Generate optimized selector using intelligent strategies
 * Balances specificity, readability, and uniqueness
 * 
 * Mental model: Find the shortest, most maintainable unique selector
 */
function generateOptimizedSelector(element, options = {}) {
  const {
    preferShortSelectors = true,
    avoidNthChild = false,
    includeDataAttributes = false,
    customAttributePriority = [],
    blacklistClasses = ['active', 'selected', 'hover']
  } = options;
  
  if (!element || element.nodeType !== 1) {
    throw new Error('Invalid element provided');
  }
  
  // Strategy 1: Try single identifier selectors
  const singleSelectors = generateSingleIdentifiers(element, {
    includeDataAttributes,
    customAttributePriority,
    blacklistClasses
  });
  
  for (const selector of singleSelectors) {
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }
  
  // Strategy 2: Try parent + child combinations
  const parentChildSelectors = generateParentChildCombinations(element, {
    avoidNthChild,
    blacklistClasses,
    maxParentLevels: 3
  });
  
  for (const selector of parentChildSelectors) {
    if (document.querySelectorAll(selector).length === 1) {
      return selector;
    }
  }
  
  // Strategy 3: Fall back to full path
  return generateUniquePath(element, { preferIds: true, preferClasses: true });
}

/**
 * Generate single identifier selectors (ID, class, attribute)
 */
function generateSingleIdentifiers(element, options) {
  const selectors = [];
  const { includeDataAttributes, customAttributePriority, blacklistClasses } = options;
  
  // ID selector
  if (element.id) {
    selectors.push(`#${element.id}`);
  }
  
  // Class selectors (filtered)
  if (element.className) {
    const classes = element.className.split(/\s+/)
      .filter(cls => cls && !blacklistClasses.includes(cls));
    
    // Individual classes
    classes.forEach(cls => selectors.push(`.${cls}`));
    
    // Class combinations (up to 3 classes)
    if (classes.length > 1) {
      for (let i = 2; i <= Math.min(3, classes.length); i++) {
        const combo = classes.slice(0, i).join('.');
        selectors.push(`.${combo}`);
      }
    }
  }
  
  // Custom attribute selectors
  for (const attr of customAttributePriority) {
    if (element.hasAttribute(attr)) {
      const value = element.getAttribute(attr);
      selectors.push(`[${attr}="${value}"]`);
    }
  }
  
  // Data attribute selectors
  if (includeDataAttributes) {
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-')) {
        selectors.push(`[${attr.name}="${attr.value}"]`);
      }
    }
  }
  
  return selectors;
}

/**
 * Generate parent-child combination selectors
 */
function generateParentChildCombinations(element, options) {
  const selectors = [];
  const { avoidNthChild, blacklistClasses, maxParentLevels } = options;
  
  let current = element;
  const elementPath = [];
  
  // Build path up to maxParentLevels
  for (let level = 0; level < maxParentLevels && current.parentNode; level++) {
    const elementSelector = generateSelectorForElement(current, { 
      preferClasses: true, 
      context: current.parentNode 
    });
    
    elementPath.unshift(elementSelector);
    
    // Try different path lengths
    if (elementPath.length >= 2) {
      const pathSelector = elementPath.join(' > ');
      selectors.push(pathSelector);
      
      // Also try descendant selectors (space instead of >)
      const descendantSelector = elementPath.join(' ');
      selectors.push(descendantSelector);
    }
    
    current = current.parentNode;
  }
  
  return selectors;
}

// =======================
// Approach 4: Performance-Optimized Generation
// =======================

/**
 * Fast selector generation optimized for performance
 * Uses caching and early termination strategies
 * 
 * Mental model: Cache results and use heuristics for speed
 */
class SelectorGenerator {
  constructor() {
    this.cache = new WeakMap();
    this.elementCounter = 0;
  }
  
  /**
   * Generate selector with caching
   */
  generate(element, options = {}) {
    const { useCache = true, strategy = 'optimal' } = options;
    
    // Check cache first
    if (useCache && this.cache.has(element)) {
      const cached = this.cache.get(element);
      // Validate cached selector still works
      if (document.querySelectorAll(cached).length === 1) {
        return cached;
      }
    }
    
    let selector;
    
    switch (strategy) {
      case 'fast':
        selector = this.generateFastSelector(element);
        break;
      case 'short':
        selector = this.generateShortestSelector(element);
        break;
      case 'stable':
        selector = this.generateStableSelector(element);
        break;
      default:
        selector = this.generateOptimalSelector(element);
    }
    
    // Cache result
    if (useCache) {
      this.cache.set(element, selector);
    }
    
    return selector;
  }
  
  /**
   * Fast but potentially longer selectors
   */
  generateFastSelector(element) {
    // Quick checks in order of performance
    if (element.id) return `#${element.id}`;
    
    if (element.className) {
      const firstClass = element.className.split(/\s+/)[0];
      const selector = `${element.tagName.toLowerCase()}.${firstClass}`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }
    
    return generateUniquePath(element, { maxDepth: 10 });
  }
  
  /**
   * Generate shortest possible selector
   */
  generateShortestSelector(element) {
    const candidates = [];
    
    // Single selectors
    if (element.id) candidates.push(`#${element.id}`);
    
    if (element.className) {
      element.className.split(/\s+/).forEach(cls => {
        if (cls) candidates.push(`.${cls}`);
      });
    }
    
    // Sort by length and test
    candidates.sort((a, b) => a.length - b.length);
    
    for (const selector of candidates) {
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }
    
    return generateUniquePath(element, { preferIds: true });
  }
  
  /**
   * Generate stable selector that's less likely to break
   */
  generateStableSelector(element) {
    // Avoid classes that might change (state classes, etc.)
    const stableClasses = element.className.split(/\s+/)
      .filter(cls => cls && !/(active|selected|hover|focus|disabled)/.test(cls));
    
    if (element.id && !/^(temp|generated|auto)/.test(element.id)) {
      return `#${element.id}`;
    }
    
    if (stableClasses.length > 0) {
      const selector = `${element.tagName.toLowerCase()}.${stableClasses[0]}`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }
    
    // Use structural selectors for stability
    return generateUniquePath(element, { preferClasses: false });
  }
  
  generateOptimalSelector(element) {
    return generateOptimizedSelector(element);
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache = new WeakMap();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    // Note: WeakMap doesn't provide size, this is approximate
    return {
      cacheType: 'WeakMap',
      elementsProcessed: this.elementCounter
    };
  }
}

// =======================
// Approach 5: Batch Processing and Analysis
// =======================

/**
 * Generate selectors for multiple elements with analysis
 */
function batchGenerateSelectors(elements, options = {}) {
  const results = [];
  const selectorFrequency = new Map();
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    try {
      const selector = generateOptimizedSelector(element, options);
      const isUnique = document.querySelectorAll(selector).length === 1;
      
      // Track selector patterns
      const pattern = selector.replace(/\d+/g, 'N'); // Replace numbers with N
      selectorFrequency.set(pattern, (selectorFrequency.get(pattern) || 0) + 1);
      
      results.push({
        element,
        index: i,
        selector,
        isUnique,
        length: selector.length,
        specificity: calculateSpecificity(selector),
        success: true
      });
    } catch (error) {
      results.push({
        element,
        index: i,
        error: error.message,
        success: false
      });
    }
  }
  
  // Generate analysis
  const analysis = {
    totalElements: elements.length,
    successfulSelectors: results.filter(r => r.success).length,
    uniqueSelectors: results.filter(r => r.success && r.isUnique).length,
    averageLength: results.filter(r => r.success)
                         .reduce((sum, r) => sum + r.length, 0) / results.filter(r => r.success).length,
    commonPatterns: Array.from(selectorFrequency.entries())
                         .sort((a, b) => b[1] - a[1])
                         .slice(0, 5)
  };
  
  return {
    results,
    analysis
  };
}

/**
 * Calculate CSS selector specificity
 */
function calculateSpecificity(selector) {
  const ids = (selector.match(/#/g) || []).length;
  const classes = (selector.match(/\./g) || []).length;
  const attributes = (selector.match(/\[/g) || []).length;
  const pseudos = (selector.match(/:/g) || []).length;
  const elements = (selector.match(/[a-zA-Z]/g) || []).length - 
                  (selector.match(/#[a-zA-Z]/g) || []).length -
                  (selector.match(/\.[a-zA-Z]/g) || []).length;
  
  return {
    ids,
    classes: classes + attributes + pseudos,
    elements,
    value: ids * 100 + (classes + attributes + pseudos) * 10 + elements
  };
}

// =======================
// Real-world Examples and Testing
// =======================

function demonstrateSelectorGeneration() {
  // This would typically run in a browser environment
  if (typeof document === 'undefined') {
    console.log('Selector generation demos require a browser environment');
    return;
  }
  
  console.log('\n=== CSS Selector Generation Demo ===');
  
  // Create test elements
  const testDiv = document.createElement('div');
  testDiv.id = 'test-element';
  testDiv.className = 'test-class another-class';
  document.body.appendChild(testDiv);
  
  try {
    console.log('Basic selector:', generateBasicSelector(testDiv));
    console.log('Unique path:', generateUniquePath(testDiv));
    console.log('Optimized selector:', generateOptimizedSelector(testDiv));
    
    // Test performance generator
    const generator = new SelectorGenerator();
    console.log('Fast selector:', generator.generate(testDiv, { strategy: 'fast' }));
    console.log('Short selector:', generator.generate(testDiv, { strategy: 'short' }));
    console.log('Stable selector:', generator.generate(testDiv, { strategy: 'stable' }));
    
  } finally {
    // Cleanup
    document.body.removeChild(testDiv);
  }
}

// Export for use in other modules
module.exports = {
  generateBasicSelector,
  generateUniquePath,
  generateOptimizedSelector,
  SelectorGenerator,
  batchGenerateSelectors,
  calculateSpecificity
};