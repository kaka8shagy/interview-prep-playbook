/**
 * File: count-multidimensional.js
 * Description: Multiple approaches to count elements in multidimensional arrays
 * 
 * Learning objectives:
 * - Understand recursive counting patterns
 * - Learn different counting strategies (occurrences, unique, by criteria)
 * - See performance optimizations for large datasets
 * 
 * Time Complexity: O(n) where n is total elements across all dimensions
 * Space Complexity: O(d) where d is maximum depth (recursion stack)
 */

// =======================
// Approach 1: Basic Element Count
// =======================

/**
 * Count specific element occurrences in multidimensional array
 * Uses deep traversal to visit every element at any level
 * 
 * Mental model: DFS search counting matches
 * Handles any depth of nesting
 */
function countElement(arr, target, useStrictEquality = true) {
  // Input validation
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array');
  }
  
  let count = 0;
  
  function traverse(currentArr) {
    for (const item of currentArr) {
      if (Array.isArray(item)) {
        // Recursively count in subarrays
        traverse(item);
      } else {
        // Compare item with target
        const matches = useStrictEquality 
          ? item === target 
          : item == target; // Loose equality
          
        if (matches) {
          count++;
        }
      }
    }
  }
  
  traverse(arr);
  return count;
}

// =======================
// Approach 2: Count by Predicate Function
// =======================

/**
 * Count elements that match a predicate function
 * More flexible than exact matching - supports complex conditions
 * 
 * Mental model: Apply test function to each element, count passes
 */
function countByPredicate(arr, predicate, includeArrays = false) {
  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }
  
  let count = 0;
  
  function traverse(currentArr, depth = 0) {
    for (let i = 0; i < currentArr.length; i++) {
      const item = currentArr[i];
      
      if (Array.isArray(item)) {
        // Count arrays themselves if requested
        if (includeArrays && predicate(item, { depth, index: i, parent: currentArr })) {
          count++;
        }
        // Recurse into subarray
        traverse(item, depth + 1);
      } else {
        // Test non-array elements
        if (predicate(item, { depth, index: i, parent: currentArr })) {
          count++;
        }
      }
    }
  }
  
  traverse(arr);
  return count;
}

// =======================
// Approach 3: Count Unique Elements
// =======================

/**
 * Count unique elements across all dimensions
 * Returns total unique count and frequency map
 * 
 * Mental model: Flatten conceptually, use Set/Map for uniqueness
 */
function countUnique(arr, customKeyFn = null) {
  const frequencyMap = new Map();
  
  function traverse(currentArr) {
    for (const item of currentArr) {
      if (Array.isArray(item)) {
        traverse(item);
      } else {
        // Generate key for uniqueness check
        const key = customKeyFn ? customKeyFn(item) : item;
        
        // Update frequency count
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
      }
    }
  }
  
  traverse(arr);
  
  return {
    uniqueCount: frequencyMap.size,
    totalCount: Array.from(frequencyMap.values()).reduce((sum, count) => sum + count, 0),
    frequencies: Object.fromEntries(frequencyMap),
    mostFrequent: getMostFrequent(frequencyMap)
  };
}

// Helper function to find most frequent element
function getMostFrequent(frequencyMap) {
  let maxCount = 0;
  let mostFrequent = null;
  
  for (const [key, count] of frequencyMap) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = key;
    }
  }
  
  return { element: mostFrequent, count: maxCount };
}

// =======================
// Approach 4: Count by Type
// =======================

/**
 * Count elements grouped by their JavaScript types
 * Useful for data analysis and validation
 * 
 * Mental model: Type classification with counting
 */
function countByType(arr, includeNull = true, includeArrays = true) {
  const typeCounts = {
    number: 0,
    string: 0,
    boolean: 0,
    object: 0,
    undefined: 0,
    function: 0,
    symbol: 0,
    bigint: 0
  };
  
  if (includeNull) typeCounts.null = 0;
  if (includeArrays) typeCounts.array = 0;
  
  function traverse(currentArr) {
    for (const item of currentArr) {
      if (Array.isArray(item)) {
        if (includeArrays) {
          typeCounts.array++;
        }
        traverse(item);
      } else if (item === null && includeNull) {
        typeCounts.null++;
      } else {
        const type = typeof item;
        if (type in typeCounts) {
          typeCounts[type]++;
        }
      }
    }
  }
  
  traverse(arr);
  
  // Calculate totals and percentages
  const totalCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
  const percentages = {};
  
  for (const [type, count] of Object.entries(typeCounts)) {
    percentages[type] = totalCount > 0 ? ((count / totalCount) * 100).toFixed(2) + '%' : '0%';
  }
  
  return {
    counts: typeCounts,
    percentages,
    total: totalCount
  };
}

// =======================
// Approach 5: Count by Depth Level
// =======================

/**
 * Count elements at each depth level separately
 * Useful for analyzing array structure and distribution
 * 
 * Mental model: Level-order traversal with counting
 */
function countByDepth(arr, maxDepth = Infinity) {
  const depthCounts = [];
  
  function traverse(currentArr, depth = 0) {
    // Initialize depth level if needed
    if (!depthCounts[depth]) {
      depthCounts[depth] = 0;
    }
    
    if (depth >= maxDepth) return;
    
    for (const item of currentArr) {
      if (Array.isArray(item)) {
        // Count the array itself at current depth
        depthCounts[depth]++;
        // Recurse to next depth
        traverse(item, depth + 1);
      } else {
        // Count non-array elements at current depth
        depthCounts[depth]++;
      }
    }
  }
  
  traverse(arr);
  
  return {
    byDepth: depthCounts,
    maxDepth: depthCounts.length - 1,
    totalElements: depthCounts.reduce((sum, count) => sum + count, 0),
    avgElementsPerDepth: depthCounts.reduce((sum, count) => sum + count, 0) / depthCounts.length
  };
}

// =======================
// Approach 6: Performance-Optimized Counting
// =======================

/**
 * Optimized counting for very large multidimensional arrays
 * Uses iterative approach to avoid stack overflow
 * 
 * Mental model: Stack-based DFS instead of recursive
 */
function countOptimized(arr, target, useStrictEquality = true) {
  let count = 0;
  const stack = [arr];
  
  while (stack.length > 0) {
    const current = stack.pop();
    
    for (const item of current) {
      if (Array.isArray(item)) {
        stack.push(item);
      } else {
        const matches = useStrictEquality 
          ? item === target 
          : item == target;
          
        if (matches) {
          count++;
        }
      }
    }
  }
  
  return count;
}

// =======================
// Approach 7: Advanced Counting with Statistics
// =======================

/**
 * Comprehensive counting with statistical analysis
 * Provides detailed insights into array composition
 * 
 * Mental model: Complete data profiling in one pass
 */
function countWithStatistics(arr) {
  const stats = {
    totalElements: 0,
    arrayCount: 0,
    maxDepth: 0,
    minDepth: Infinity,
    elements: [],
    typeDistribution: {},
    depthDistribution: {},
    uniqueElements: new Set(),
    duplicates: new Map(),
    emptyArrays: 0
  };
  
  function traverse(currentArr, depth = 0, path = []) {
    // Update depth statistics
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    stats.minDepth = Math.min(stats.minDepth, depth);
    
    // Check if array is empty
    if (currentArr.length === 0) {
      stats.emptyArrays++;
    }
    
    for (let i = 0; i < currentArr.length; i++) {
      const item = currentArr[i];
      const currentPath = [...path, i];
      
      if (Array.isArray(item)) {
        stats.arrayCount++;
        
        // Update depth distribution
        stats.depthDistribution[depth] = (stats.depthDistribution[depth] || 0) + 1;
        
        traverse(item, depth + 1, currentPath);
      } else {
        stats.totalElements++;
        
        // Store element with metadata
        stats.elements.push({
          value: item,
          type: typeof item,
          depth,
          path: currentPath
        });
        
        // Update type distribution
        const type = typeof item;
        stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;
        
        // Track uniqueness and duplicates
        if (stats.uniqueElements.has(item)) {
          stats.duplicates.set(item, (stats.duplicates.get(item) || 1) + 1);
        } else {
          stats.uniqueElements.add(item);
        }
      }
    }
  }
  
  traverse(arr);
  
  // Finalize statistics
  if (stats.minDepth === Infinity) stats.minDepth = 0;
  
  return {
    ...stats,
    uniqueCount: stats.uniqueElements.size,
    duplicateCount: stats.duplicates.size,
    duplicateElements: Object.fromEntries(stats.duplicates)
  };
}

// =======================
// Specialized Counting Functions
// =======================

/**
 * Count elements in matrix (2D array) efficiently
 * Optimized for mathematical matrices
 */
function countInMatrix(matrix, target) {
  let count = 0;
  
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === target) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * Count using parallel processing concepts for large arrays
 * Simulates parallel execution using setTimeout
 */
async function countAsync(arr, target, chunkSize = 10000) {
  let totalCount = 0;
  const chunks = [];
  
  // Split array into manageable chunks
  function createChunks(currentArr, currentChunks = []) {
    for (const item of currentArr) {
      if (Array.isArray(item)) {
        createChunks(item, currentChunks);
      } else {
        // Add to current chunk or create new one
        if (currentChunks.length === 0 || currentChunks[currentChunks.length - 1].length >= chunkSize) {
          currentChunks.push([]);
        }
        currentChunks[currentChunks.length - 1].push(item);
      }
    }
    return currentChunks;
  }
  
  createChunks(arr, chunks);
  
  // Process chunks asynchronously
  for (const chunk of chunks) {
    const chunkCount = await new Promise(resolve => {
      setTimeout(() => {
        const count = chunk.reduce((acc, item) => acc + (item === target ? 1 : 0), 0);
        resolve(count);
      }, 0);
    });
    
    totalCount += chunkCount;
  }
  
  return totalCount;
}

// =======================
// Utility Functions
// =======================

/**
 * Create common counting predicates
 */
const createCountingPredicates = {
  numeric: {
    positive: (x) => typeof x === 'number' && x > 0,
    negative: (x) => typeof x === 'number' && x < 0,
    zero: (x) => typeof x === 'number' && x === 0,
    integer: (x) => typeof x === 'number' && Number.isInteger(x),
    float: (x) => typeof x === 'number' && !Number.isInteger(x)
  },
  
  string: {
    empty: (x) => typeof x === 'string' && x.length === 0,
    nonEmpty: (x) => typeof x === 'string' && x.length > 0,
    alphabetic: (x) => typeof x === 'string' && /^[a-zA-Z]+$/.test(x),
    numeric: (x) => typeof x === 'string' && /^\d+$/.test(x)
  },
  
  general: {
    truthy: (x) => !!x,
    falsy: (x) => !x,
    null: (x) => x === null,
    undefined: (x) => x === undefined,
    primitive: (x) => x !== Object(x)
  }
};

// =======================
// Real-world Examples
// =======================

// Example: Analyze survey responses (multidimensional data)
const surveyResponses = [
  [
    [5, 4, 5, 3], // Question group 1
    [4, 4, 5, 4]  // Question group 2
  ],
  [
    [3, 2, 4, 5], // Different respondent
    [5, 5, 4, 3]
  ]
];

// Example: Count inventory items by category
const inventory = [
  [
    { type: 'electronics', count: 5 },
    { type: 'books', count: 10 }
  ],
  [
    { type: 'electronics', count: 3 },
    { type: 'clothing', count: 8 }
  ]
];

// =======================
// Testing and Demonstration
// =======================

function demonstrateCounting() {
  console.log('\n=== Basic Element Count Demo ===');
  const numbers = [[1, 2, 2], [2, 3, 2], [4, 2]];
  const countOfTwos = countElement(numbers, 2);
  console.log('Count of 2s:', countOfTwos);
  
  console.log('\n=== Count by Predicate Demo ===');
  const evenCount = countByPredicate(numbers, x => x % 2 === 0);
  console.log('Count of even numbers:', evenCount);
  
  console.log('\n=== Unique Elements Demo ===');
  const uniqueAnalysis = countUnique(numbers);
  console.log('Unique analysis:', uniqueAnalysis);
  
  console.log('\n=== Count by Type Demo ===');
  const mixedArray = [[1, 'hello', true], [null, undefined, []]];
  const typeAnalysis = countByType(mixedArray);
  console.log('Type analysis:', typeAnalysis);
  
  console.log('\n=== Count by Depth Demo ===');
  const depthAnalysis = countByDepth(numbers);
  console.log('Depth analysis:', depthAnalysis);
  
  console.log('\n=== Statistical Analysis Demo ===');
  const fullStats = countWithStatistics(mixedArray);
  console.log('Full statistics:', fullStats);
  
  console.log('\n=== Survey Analysis Demo ===');
  const rating5Count = countElement(surveyResponses, 5);
  const positiveRatings = countByPredicate(surveyResponses, rating => rating >= 4);
  console.log(`Rating 5 count: ${rating5Count}, Positive ratings: ${positiveRatings}`);
}

// Uncomment to run demonstrations
// demonstrateCounting();

// Export for use in other modules
module.exports = {
  countElement,
  countByPredicate,
  countUnique,
  countByType,
  countByDepth,
  countOptimized,
  countWithStatistics,
  countInMatrix,
  countAsync,
  createCountingPredicates
};