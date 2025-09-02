/**
 * File: filter-multidimensional.js
 * Description: Multiple approaches to filter multidimensional arrays with various criteria
 * 
 * Learning objectives:
 * - Understand recursive array traversal patterns
 * - Learn deep filtering vs shallow filtering
 * - See practical applications in data processing
 * 
 * Time Complexity: O(n) where n is total elements across all dimensions
 * Space Complexity: O(d) where d is maximum depth (recursion stack)
 */

// =======================
// Approach 1: Basic Recursive Filter
// =======================

/**
 * Recursively filter multidimensional array
 * Applies filter to all elements at any depth level
 * 
 * Mental model: DFS traversal applying filter at each leaf node
 * Preserves original array structure
 */
function filterMultidimensional(arr, predicate) {
  // Input validation
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array');
  }
  
  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }
  
  return arr.map(item => {
    // If item is an array, recursively filter it
    if (Array.isArray(item)) {
      const filtered = filterMultidimensional(item, predicate);
      // Return the filtered subarray (even if empty)
      return filtered;
    }
    
    // For non-array items, apply the predicate
    return predicate(item) ? item : null;
  }).filter(item => {
    // Remove null items (failed predicate) but keep arrays (even empty ones)
    return item !== null;
  });
}

// =======================
// Approach 2: Filter with Structure Preservation
// =======================

/**
 * Filter while maintaining exact structure including empty arrays
 * Useful when array positions/structure matter
 * 
 * Mental model: Filter in place but preserve array shape
 */
function filterPreserveStructure(arr, predicate, keepEmptyArrays = true) {
  return arr.map(item => {
    if (Array.isArray(item)) {
      const filtered = filterPreserveStructure(item, predicate, keepEmptyArrays);
      
      // Keep empty arrays if requested, otherwise filter them out
      if (!keepEmptyArrays && filtered.length === 0) {
        return null; // Will be filtered out later
      }
      
      return filtered;
    }
    
    // Apply predicate to leaf nodes
    return predicate(item) ? item : null;
  }).filter(item => item !== null);
}

// =======================
// Approach 3: Flatten and Filter
// =======================

/**
 * Flatten first, then filter - simpler but loses structure
 * Returns a flat array of all matching elements
 * 
 * Mental model: Convert to 1D, filter, done
 * Trade-off: simplicity vs structure loss
 */
function flattenAndFilter(arr, predicate, maxDepth = Infinity) {
  const result = [];
  
  function flatten(currentArr, depth = 0) {
    for (const item of currentArr) {
      if (Array.isArray(item) && depth < maxDepth) {
        flatten(item, depth + 1);
      } else {
        if (predicate(item)) {
          result.push(item);
        }
      }
    }
  }
  
  flatten(arr);
  return result;
}

// =======================
// Approach 4: Filter by Depth Level
// =======================

/**
 * Filter elements at specific depth levels only
 * Useful for structured data where depth has meaning
 * 
 * Mental model: Only apply filter at specific tree levels
 */
function filterByDepth(arr, predicate, targetDepth = 0, currentDepth = 0) {
  if (currentDepth === targetDepth) {
    // At target depth, apply filter to each element
    return arr.filter(predicate);
  }
  
  // Not at target depth, recurse deeper
  return arr.map(item => {
    if (Array.isArray(item)) {
      return filterByDepth(item, predicate, targetDepth, currentDepth + 1);
    }
    // Non-array items at non-target depth are kept as-is
    return item;
  }).filter(item => {
    // Remove null/undefined results but keep empty arrays
    return item !== null && item !== undefined;
  });
}

// =======================
// Approach 5: Advanced Filter with Context
// =======================

/**
 * Filter with additional context about position, depth, and parents
 * Provides maximum flexibility for complex filtering scenarios
 * 
 * Mental model: Each element knows where it is in the structure
 */
function filterWithContext(arr, predicate, context = { path: [], depth: 0, parent: null }) {
  return arr.map((item, index) => {
    // Create context for current item
    const itemContext = {
      path: [...context.path, index],
      depth: context.depth,
      parent: context.parent,
      index,
      siblings: arr,
      siblingsCount: arr.length
    };
    
    if (Array.isArray(item)) {
      // Recurse with updated context
      const newContext = {
        path: itemContext.path,
        depth: context.depth + 1,
        parent: itemContext
      };
      
      return filterWithContext(item, predicate, newContext);
    }
    
    // Apply predicate with full context information
    return predicate(item, itemContext) ? item : null;
  }).filter(item => item !== null);
}

// =======================
// Approach 6: Parallel Processing for Large Arrays
// =======================

/**
 * Filter large multidimensional arrays using parallel processing concepts
 * Simulates parallel execution using setTimeout for non-blocking operations
 * 
 * Mental model: Break work into chunks to avoid blocking the main thread
 */
async function filterMultidimensionalAsync(arr, predicate, chunkSize = 1000) {
  // For small arrays, use synchronous approach
  if (arr.length < chunkSize) {
    return filterMultidimensional(arr, predicate);
  }
  
  const result = [];
  
  // Process array in chunks
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    
    // Process chunk and yield control to event loop
    const chunkResult = await new Promise(resolve => {
      setTimeout(() => {
        resolve(filterMultidimensional(chunk, predicate));
      }, 0);
    });
    
    result.push(...chunkResult);
  }
  
  return result;
}

// =======================
// Specialized Filters for Common Use Cases
// =======================

/**
 * Filter numeric matrices (2D arrays of numbers)
 * Optimized for mathematical operations
 */
function filterMatrix(matrix, predicate) {
  if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) {
    throw new Error('Input must be a 2D array (matrix)');
  }
  
  return matrix.map(row => 
    row.filter(cell => predicate(cell))
  ).filter(row => row.length > 0); // Remove empty rows
}

/**
 * Filter tree-like structures with parent-child relationships
 * Common in hierarchical data like file systems or org charts
 */
function filterTree(tree, predicate, childrenKey = 'children') {
  return tree.map(node => {
    const newNode = { ...node };
    
    // Filter children recursively if they exist
    if (node[childrenKey] && Array.isArray(node[childrenKey])) {
      newNode[childrenKey] = filterTree(node[childrenKey], predicate, childrenKey);
    }
    
    return newNode;
  }).filter(predicate);
}

/**
 * Filter nested object arrays (common in JSON APIs)
 * Handles arrays within objects within arrays
 */
function filterNestedObjectArrays(data, predicate, arrayKeys = ['items', 'children', 'list']) {
  if (Array.isArray(data)) {
    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        const filteredItem = { ...item };
        
        // Process known array properties
        for (const key of arrayKeys) {
          if (Array.isArray(item[key])) {
            filteredItem[key] = filterNestedObjectArrays(item[key], predicate, arrayKeys);
          }
        }
        
        return filteredItem;
      }
      return item;
    }).filter(predicate);
  }
  
  return data;
}

// =======================
// Utility Functions and Helpers
// =======================

/**
 * Create common predicate functions
 */
const createPredicates = {
  // Numeric predicates
  greaterThan: (value) => (x) => typeof x === 'number' && x > value,
  lessThan: (value) => (x) => typeof x === 'number' && x < value,
  between: (min, max) => (x) => typeof x === 'number' && x >= min && x <= max,
  
  // String predicates
  startsWith: (prefix) => (x) => typeof x === 'string' && x.startsWith(prefix),
  contains: (substring) => (x) => typeof x === 'string' && x.includes(substring),
  matchesPattern: (pattern) => (x) => typeof x === 'string' && pattern.test(x),
  
  // Type predicates
  ofType: (type) => (x) => typeof x === type,
  truthy: (x) => !!x,
  falsy: (x) => !x,
  
  // Array-specific predicates
  nonEmpty: (x) => Array.isArray(x) ? x.length > 0 : !!x,
  hasLength: (length) => (x) => Array.isArray(x) && x.length === length,
  
  // Context-aware predicates
  atDepth: (targetDepth) => (x, context) => context && context.depth === targetDepth,
  atPath: (targetPath) => (x, context) => {
    if (!context || !context.path) return false;
    return JSON.stringify(context.path) === JSON.stringify(targetPath);
  }
};

// =======================
// Real-world Examples
// =======================

// Example 1: Filter product catalog with nested categories
const productCatalog = [
  [
    { name: 'Laptop', price: 999, category: 'Electronics' },
    { name: 'Mouse', price: 25, category: 'Electronics' }
  ],
  [
    { name: 'Book', price: 15, category: 'Education' },
    { name: 'Pen', price: 2, category: 'Office' }
  ]
];

// Example 2: Filter multidimensional sensor data
const sensorData = [
  [[23.5, 24.1, 23.8], [24.2, 25.0, 24.8]], // Temperature readings
  [[0.5, 0.3, 0.7], [0.8, 1.2, 1.0]],       // Humidity readings
  [[1013, 1015, 1012], [1014, 1016, 1018]]  // Pressure readings
];

// Example 3: Filter nested menu structure
const menuStructure = [
  {
    title: 'File',
    items: [
      { title: 'New', shortcut: 'Ctrl+N', enabled: true },
      { title: 'Open', shortcut: 'Ctrl+O', enabled: true },
      { title: 'Recent', enabled: false, items: [] }
    ]
  }
];

// =======================
// Testing and Demonstration
// =======================

function demonstrateFiltering() {
  console.log('\n=== Basic Multidimensional Filter Demo ===');
  const numbers = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  const evenNumbers = filterMultidimensional(numbers, x => x % 2 === 0);
  console.log('Even numbers:', evenNumbers);
  
  console.log('\n=== Filter with Context Demo ===');
  const contextResult = filterWithContext(
    [['a', 'b'], ['c', 'd', 'e']],
    (item, context) => {
      console.log(`Item: ${item}, Path: [${context.path.join(',')}], Depth: ${context.depth}`);
      return item !== 'c'; // Filter out 'c'
    }
  );
  console.log('Context filter result:', contextResult);
  
  console.log('\n=== Product Catalog Filter Demo ===');
  const affordableProducts = filterMultidimensional(
    productCatalog,
    item => typeof item === 'object' && item.price < 50
  );
  console.log('Affordable products:', affordableProducts);
  
  console.log('\n=== Temperature Filter Demo ===');
  const highTemperatures = filterMatrix(
    sensorData[0], // Temperature data
    temp => temp > 24.0
  );
  console.log('High temperatures:', highTemperatures);
  
  console.log('\n=== Flatten and Filter Demo ===');
  const flatEvenNumbers = flattenAndFilter(numbers, x => x % 2 === 0);
  console.log('Flat even numbers:', flatEvenNumbers);
}

// Uncomment to run demonstrations
// demonstrateFiltering();

// Export for use in other modules
module.exports = {
  filterMultidimensional,
  filterPreserveStructure,
  flattenAndFilter,
  filterByDepth,
  filterWithContext,
  filterMultidimensionalAsync,
  filterMatrix,
  filterTree,
  filterNestedObjectArrays,
  createPredicates
};