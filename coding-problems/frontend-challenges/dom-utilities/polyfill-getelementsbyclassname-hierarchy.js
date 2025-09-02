/**
 * File: polyfill-getelementsbyclassname-hierarchy.js
 * Description: Enhanced getElementsByClassName with hierarchical class selection
 * 
 * Learning objectives:
 * - Understand advanced DOM traversal patterns
 * - Learn hierarchical element selection strategies
 * - See performance optimizations for complex queries
 * 
 * Time Complexity: O(n*m) where n is elements, m is hierarchy depth
 * Space Complexity: O(k) where k is matching elements
 */

// =======================
// Approach 1: Hierarchical Class Selection
// =======================

/**
 * Extended getElementsByClassName that supports hierarchical selection
 * Allows selection like: parent.child.grandchild class patterns
 * 
 * Mental model: Chain class selectors with parent-child relationships
 */
function getElementsByClassNameHierarchy(hierarchyPattern, root = document) {
  if (typeof hierarchyPattern !== 'string') {
    throw new TypeError('Hierarchy pattern must be a string');
  }
  
  // Parse hierarchy pattern: "parent > child > grandchild"
  const levels = hierarchyPattern.split('>').map(level => level.trim());
  
  if (levels.length === 1) {
    // No hierarchy, use standard class selection
    return getElementsByClassName(levels[0], root);
  }
  
  return findHierarchicalMatches(levels, root);
}

/**
 * Find elements matching hierarchical class pattern
 */
function findHierarchicalMatches(levels, root) {
  const results = [];
  
  // Start with elements matching the first level
  const rootElements = getElementsByClassName(levels[0], root);
  
  // For each root element, check if it has the required hierarchy
  for (let i = 0; i < rootElements.length; i++) {
    const matches = findNestedMatches(rootElements[i], levels.slice(1));
    results.push(...matches);
  }
  
  return createNodeListLike(results);
}

/**
 * Recursively find nested matches for remaining hierarchy levels
 */
function findNestedMatches(element, remainingLevels) {
  if (remainingLevels.length === 0) {
    return [element]; // Found complete hierarchy
  }
  
  const results = [];
  const nextClass = remainingLevels[0];
  
  // Find direct children matching next class
  const children = getElementsByClassName(nextClass, element);
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // Ensure it's actually a descendant of the element
    if (element.contains(child)) {
      const nestedMatches = findNestedMatches(child, remainingLevels.slice(1));
      results.push(...nestedMatches);
    }
  }
  
  return results;
}

// =======================
// Approach 2: Advanced Pattern Matching
// =======================

/**
 * Advanced pattern matching with multiple selector types
 * Supports: classes, IDs, attributes, and combinations
 */
function getElementsByAdvancedPattern(pattern, root = document) {
  const segments = parseAdvancedPattern(pattern);
  return findAdvancedMatches(segments, root);
}

/**
 * Parse advanced pattern into structured segments
 */
function parseAdvancedPattern(pattern) {
  // Support patterns like: ".parent#id[attr=value] > .child.class2"
  const segments = pattern.split('>').map(segment => {
    const trimmed = segment.trim();
    
    return {
      classes: (trimmed.match(/\.[a-zA-Z][a-zA-Z0-9_-]*/g) || []).map(c => c.slice(1)),
      id: (trimmed.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g) || [])[0]?.slice(1),
      attributes: parseAttributes(trimmed),
      tag: trimmed.replace(/[.#\[\]="'\s>]/g, '') || '*'
    };
  });
  
  return segments;
}

/**
 * Parse attribute selectors from pattern
 */
function parseAttributes(pattern) {
  const attrPattern = /\[([^\]]+)\]/g;
  const attributes = [];
  let match;
  
  while ((match = attrPattern.exec(pattern)) !== null) {
    const attrStr = match[1];
    
    if (attrStr.includes('=')) {
      const [name, value] = attrStr.split('=').map(s => s.replace(/["']/g, ''));
      attributes.push({ name, value, operator: '=' });
    } else {
      attributes.push({ name: attrStr, operator: 'exists' });
    }
  }
  
  return attributes;
}

/**
 * Find elements matching advanced pattern segments
 */
function findAdvancedMatches(segments, root) {
  if (segments.length === 0) return createNodeListLike([]);
  
  let currentElements = [root];
  
  for (const segment of segments) {
    const nextElements = [];
    
    for (const element of currentElements) {
      const matches = findElementsMatchingSegment(segment, element);
      nextElements.push(...matches);
    }
    
    currentElements = nextElements;
  }
  
  return createNodeListLike(currentElements);
}

/**
 * Find elements matching a single pattern segment
 */
function findElementsMatchingSegment(segment, root) {
  const { classes, id, attributes, tag } = segment;
  const results = [];
  
  // Get base elements by tag
  const elements = tag === '*' 
    ? root.getElementsByTagName('*')
    : root.getElementsByTagName(tag);
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    // Check ID match
    if (id && element.id !== id) continue;
    
    // Check class matches
    if (classes.length > 0 && !hasAllClasses(element, classes)) continue;
    
    // Check attribute matches
    if (!matchesAttributes(element, attributes)) continue;
    
    results.push(element);
  }
  
  return results;
}

/**
 * Check if element matches attribute requirements
 */
function matchesAttributes(element, attributes) {
  return attributes.every(attr => {
    const { name, value, operator } = attr;
    
    switch (operator) {
      case 'exists':
        return element.hasAttribute(name);
      case '=':
        return element.getAttribute(name) === value;
      default:
        return false;
    }
  });
}

// =======================
// Approach 3: Performance-Optimized Hierarchy
// =======================

/**
 * Optimized hierarchical selection using QuerySelectorAll when available
 * Falls back to manual traversal for complex patterns
 */
function getElementsByClassNameHierarchyOptimized(pattern, root = document) {
  // Try native querySelectorAll first
  if (root.querySelectorAll && isSimplePattern(pattern)) {
    try {
      const cssSelector = convertToCSSSelector(pattern);
      return root.querySelectorAll(cssSelector);
    } catch (e) {
      // Fall back to manual implementation
    }
  }
  
  // Use manual hierarchy matching
  return getElementsByClassNameHierarchy(pattern, root);
}

/**
 * Check if pattern can be converted to simple CSS selector
 */
function isSimplePattern(pattern) {
  // Simple patterns contain only classes and > combinators
  return /^[a-zA-Z0-9_.-]+\s*(>\s*[a-zA-Z0-9_.-]+\s*)*$/.test(pattern);
}

/**
 * Convert pattern to CSS selector
 */
function convertToCSSSelector(pattern) {
  return pattern
    .split('>')
    .map(level => level.trim())
    .map(level => {
      // Convert space-separated classes to CSS class selector
      const classes = level.split(/\s+/);
      return classes.map(cls => '.' + cls).join('');
    })
    .join(' > ');
}

// =======================
// Utility Functions
// =======================

/**
 * Enhanced class checking utility
 */
function hasAllClasses(element, classNames) {
  if (!element.className || classNames.length === 0) {
    return classNames.length === 0;
  }
  
  const elementClasses = element.className.trim().split(/\s+/);
  return classNames.every(className => elementClasses.includes(className));
}

/**
 * Create NodeList-like object
 */
function createNodeListLike(elements) {
  const nodeList = Object.create(Array.prototype);
  
  elements.forEach((element, index) => {
    nodeList[index] = element;
  });
  
  Object.defineProperty(nodeList, 'length', {
    value: elements.length,
    writable: false
  });
  
  nodeList.item = function(index) {
    return this[index] || null;
  };
  
  return nodeList;
}

/**
 * Basic getElementsByClassName fallback
 */
function getElementsByClassName(className, root = document) {
  if (root.getElementsByClassName) {
    return root.getElementsByClassName(className);
  }
  
  // Manual implementation for older browsers
  const results = [];
  const classes = className.trim().split(/\s+/);
  const elements = root.getElementsByTagName('*');
  
  for (let i = 0; i < elements.length; i++) {
    if (hasAllClasses(elements[i], classes)) {
      results.push(elements[i]);
    }
  }
  
  return createNodeListLike(results);
}

// =======================
// Testing and Demonstration
// =======================

function demonstrateHierarchicalSelection() {
  if (typeof document === 'undefined') {
    console.log('Hierarchical selection demos require a browser environment');
    return;
  }
  
  console.log('\n=== Hierarchical getElementsByClassName Demo ===');
  
  // Create test structure
  const testContainer = document.createElement('div');
  testContainer.innerHTML = `
    <div class="parent">
      <div class="child">Child 1</div>
      <div class="child special">Child 2</div>
    </div>
    <div class="parent">
      <div class="different">Not a child</div>
      <div class="child">Child 3</div>
    </div>
  `;
  
  document.body.appendChild(testContainer);
  
  try {
    const hierarchical = getElementsByClassNameHierarchy('parent > child', testContainer);
    console.log('Hierarchical matches:', hierarchical.length);
    
    const advanced = getElementsByAdvancedPattern('.parent > .child.special', testContainer);
    console.log('Advanced pattern matches:', advanced.length);
    
    const optimized = getElementsByClassNameHierarchyOptimized('parent > child', testContainer);
    console.log('Optimized matches:', optimized.length);
    
  } finally {
    document.body.removeChild(testContainer);
  }
}

// Export for use in other modules
module.exports = {
  getElementsByClassNameHierarchy,
  getElementsByAdvancedPattern,
  getElementsByClassNameHierarchyOptimized,
  parseAdvancedPattern,
  hasAllClasses,
  createNodeListLike
};