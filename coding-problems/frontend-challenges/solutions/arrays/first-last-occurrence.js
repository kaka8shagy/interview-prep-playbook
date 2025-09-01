/**
 * File: first-last-occurrence.js
 * Description: Find first and last occurrence of element in sorted array
 *              using binary search for optimal O(log n) time complexity
 * 
 * Learning objectives:
 * - Master binary search variations and modifications
 * - Understand left and right boundary search techniques
 * - Learn to handle duplicate elements in sorted arrays
 * - Practice edge case handling and boundary conditions
 * 
 * Real-world applications:
 * - Database range queries and indexing
 * - Time series data analysis (finding event ranges)
 * - Log file analysis and event searching
 * - Pagination and data slicing operations
 * - Search engine result ranking and filtering
 * 
 * Time Complexity: O(log n) for both searches
 * Space Complexity: O(1) iterative, O(log n) recursive
 */

// =======================
// Approach 1: Modified Binary Search (Iterative)
// =======================

/**
 * Find first and last occurrence using separate binary searches
 * Uses iterative approach for better space efficiency
 * 
 * Key insight: Use binary search but modify the condition to find boundaries
 * - For first occurrence: when found, continue searching left half
 * - For last occurrence: when found, continue searching right half
 * 
 * @param {number[]} arr - Sorted array of numbers
 * @param {number} target - Target value to find
 * @returns {number[]} [firstIndex, lastIndex] or [-1, -1] if not found
 */
function findFirstLastOccurrence(arr, target) {
  if (!arr || arr.length === 0) {
    return [-1, -1];
  }
  
  // Find first occurrence using left-boundary binary search
  const firstOccurrence = findFirstOccurrence(arr, target);
  
  // If target not found, return [-1, -1]
  if (firstOccurrence === -1) {
    return [-1, -1];
  }
  
  // Find last occurrence using right-boundary binary search
  const lastOccurrence = findLastOccurrence(arr, target);
  
  return [firstOccurrence, lastOccurrence];
}

/**
 * Find the first (leftmost) occurrence of target in sorted array
 * Continues searching left even after finding the target
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number} Index of first occurrence or -1 if not found
 */
function findFirstOccurrence(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    // Calculate middle index avoiding integer overflow
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] === target) {
      // Found target, but there might be earlier occurrences
      // Store current result and continue searching in left half
      result = mid;
      right = mid - 1;  // Key: search left for earlier occurrence
      
    } else if (arr[mid] < target) {
      // Target is in right half
      left = mid + 1;
      
    } else {
      // Target is in left half
      right = mid - 1;
    }
  }
  
  return result;
}

/**
 * Find the last (rightmost) occurrence of target in sorted array
 * Continues searching right even after finding the target
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number} Index of last occurrence or -1 if not found
 */
function findLastOccurrence(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] === target) {
      // Found target, but there might be later occurrences
      // Store current result and continue searching in right half
      result = mid;
      left = mid + 1;   // Key: search right for later occurrence
      
    } else if (arr[mid] < target) {
      // Target is in right half
      left = mid + 1;
      
    } else {
      // Target is in left half
      right = mid - 1;
    }
  }
  
  return result;
}

// =======================
// Approach 2: Unified Binary Search with Range Finding
// =======================

/**
 * Single function approach that finds both boundaries efficiently
 * Uses a flag parameter to determine search direction
 * More concise but slightly less readable than separate functions
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number[]} [firstIndex, lastIndex] or [-1, -1]
 */
function findFirstLastOccurrenceUnified(arr, target) {
  if (!arr || arr.length === 0) {
    return [-1, -1];
  }
  
  /**
   * Generic binary search for finding boundaries
   * 
   * @param {boolean} findFirst - If true, finds first occurrence; if false, finds last
   * @returns {number} Index of occurrence or -1 if not found
   */
  const binarySearchBoundary = (findFirst) => {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;
    
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      
      if (arr[mid] === target) {
        result = mid;
        
        if (findFirst) {
          // For first occurrence, continue searching left
          right = mid - 1;
        } else {
          // For last occurrence, continue searching right
          left = mid + 1;
        }
        
      } else if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return result;
  };
  
  const firstIndex = binarySearchBoundary(true);
  
  if (firstIndex === -1) {
    return [-1, -1];
  }
  
  const lastIndex = binarySearchBoundary(false);
  return [firstIndex, lastIndex];
}

// =======================
// Approach 3: Optimized Single-Pass with Early Termination
// =======================

/**
 * Optimized approach that can terminate early in certain cases
 * Uses the first occurrence to narrow the search space for last occurrence
 * Particularly efficient when the target has few occurrences
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number[]} [firstIndex, lastIndex] or [-1, -1]
 */
function findFirstLastOptimized(arr, target) {
  if (!arr || arr.length === 0) {
    return [-1, -1];
  }
  
  // Step 1: Find first occurrence
  const firstIndex = findFirstOccurrence(arr, target);
  
  if (firstIndex === -1) {
    return [-1, -1];
  }
  
  // Optimization: If first occurrence is at the end, it's also the last
  if (firstIndex === arr.length - 1 || arr[firstIndex + 1] !== target) {
    return [firstIndex, firstIndex];
  }
  
  // Step 2: Find last occurrence, but start search from firstIndex
  // This optimization reduces the search space
  const lastIndex = findLastOccurrenceFrom(arr, target, firstIndex);
  
  return [firstIndex, lastIndex];
}

/**
 * Find last occurrence starting from a given index
 * Optimization that reduces search space when we know the first occurrence
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @param {number} startIndex - Starting index for search
 * @returns {number} Index of last occurrence
 */
function findLastOccurrenceFrom(arr, target, startIndex) {
  let left = startIndex;
  let right = arr.length - 1;
  let result = startIndex;
  
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] === target) {
      result = mid;
      left = mid + 1; // Continue searching right
    } else {
      // Since we know target exists, arr[mid] must be > target
      right = mid - 1;
    }
  }
  
  return result;
}

// =======================
// Approach 4: Recursive Implementation
// =======================

/**
 * Recursive implementation for educational purposes
 * Shows the binary search pattern in recursive form
 * Less space-efficient due to call stack, but more intuitive for some
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number[]} [firstIndex, lastIndex] or [-1, -1]
 */
function findFirstLastRecursive(arr, target) {
  if (!arr || arr.length === 0) {
    return [-1, -1];
  }
  
  /**
   * Recursive helper for finding first occurrence
   * 
   * @param {number} left - Left boundary
   * @param {number} right - Right boundary
   * @returns {number} Index of first occurrence or -1
   */
  const findFirstRecursive = (left, right) => {
    // Base case: search space exhausted
    if (left > right) {
      return -1;
    }
    
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] === target) {
      // Found target, but check if there's an earlier occurrence
      const leftResult = findFirstRecursive(left, mid - 1);
      return leftResult !== -1 ? leftResult : mid;
      
    } else if (arr[mid] < target) {
      return findFirstRecursive(mid + 1, right);
    } else {
      return findFirstRecursive(left, mid - 1);
    }
  };
  
  /**
   * Recursive helper for finding last occurrence
   * 
   * @param {number} left - Left boundary
   * @param {number} right - Right boundary
   * @returns {number} Index of last occurrence or -1
   */
  const findLastRecursive = (left, right) => {
    if (left > right) {
      return -1;
    }
    
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] === target) {
      // Found target, but check if there's a later occurrence
      const rightResult = findLastRecursive(mid + 1, right);
      return rightResult !== -1 ? rightResult : mid;
      
    } else if (arr[mid] < target) {
      return findLastRecursive(mid + 1, right);
    } else {
      return findLastRecursive(left, mid - 1);
    }
  };
  
  const firstIndex = findFirstRecursive(0, arr.length - 1);
  
  if (firstIndex === -1) {
    return [-1, -1];
  }
  
  const lastIndex = findLastRecursive(0, arr.length - 1);
  return [firstIndex, lastIndex];
}

// =======================
// Approach 5: Lower and Upper Bound Implementation
// =======================

/**
 * Implementation using lower_bound and upper_bound concepts from C++ STL
 * Lower bound: first position where element could be inserted
 * Upper bound: first position after all occurrences of element
 * 
 * This approach is very clean and reusable for other range queries
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number[]} [firstIndex, lastIndex] or [-1, -1]
 */
function findFirstLastWithBounds(arr, target) {
  if (!arr || arr.length === 0) {
    return [-1, -1];
  }
  
  const lowerBound = findLowerBound(arr, target);
  
  // If lower bound is out of range or doesn't match target, element not found
  if (lowerBound >= arr.length || arr[lowerBound] !== target) {
    return [-1, -1];
  }
  
  const upperBound = findUpperBound(arr, target);
  
  // Last occurrence is one position before upper bound
  return [lowerBound, upperBound - 1];
}

/**
 * Find lower bound (first position >= target)
 * This is equivalent to finding the first occurrence
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number} Index of lower bound
 */
function findLowerBound(arr, target) {
  let left = 0;
  let right = arr.length;
  
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      // arr[mid] >= target, this could be our answer
      right = mid;
    }
  }
  
  return left;
}

/**
 * Find upper bound (first position > target)
 * This helps us find the position after the last occurrence
 * 
 * @param {number[]} arr - Sorted array
 * @param {number} target - Target value
 * @returns {number} Index of upper bound
 */
function findUpperBound(arr, target) {
  let left = 0;
  let right = arr.length;
  
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] <= target) {
      left = mid + 1;
    } else {
      // arr[mid] > target, this could be our answer
      right = mid;
    }
  }
  
  return left;
}

// =======================
// Real-world Usage Examples and Applications
// =======================

/**
 * Example 1: Time series data analysis
 * Find all events within a specific time range
 */
function findEventsInTimeRange(events, startTime, endTime) {
  console.log('=== Time Series Data Analysis ===\n');
  
  // Events are sorted by timestamp
  const timestamps = events.map(event => event.timestamp);
  
  console.log('Events:', events);
  console.log('Looking for events between', startTime, 'and', endTime);
  
  // Find range of events within time window
  const [startIndex] = findFirstLastOccurrence(timestamps, startTime);
  const [, endIndex] = findFirstLastOccurrence(timestamps, endTime);
  
  if (startIndex === -1 || endIndex === -1) {
    console.log('No events found in the specified range');
    return [];
  }
  
  const eventsInRange = events.slice(startIndex, endIndex + 1);
  console.log('Events in range:', eventsInRange);
  
  return eventsInRange;
}

/**
 * Example 2: Database-style range queries
 * Demonstrate pagination and data slicing operations
 */
function demonstrateDatabaseRangeQuery() {
  console.log('=== Database Range Query Simulation ===\n');
  
  // Simulate a database table with sorted IDs
  const userIds = [1, 1, 2, 2, 2, 3, 4, 4, 4, 4, 5, 6, 6, 7, 8, 9, 9];
  const userData = userIds.map((id, index) => ({
    id,
    name: `User${id}_${index}`,
    email: `user${id}_${index}@example.com`
  }));
  
  console.log('Database records:', userData);
  
  // Find all records for specific user IDs
  const targetIds = [2, 4, 6, 10]; // Include non-existent ID
  
  targetIds.forEach(userId => {
    const [firstIndex, lastIndex] = findFirstLastOccurrence(userIds, userId);
    
    if (firstIndex === -1) {
      console.log(`User ID ${userId}: Not found`);
    } else {
      const userRecords = userData.slice(firstIndex, lastIndex + 1);
      console.log(`User ID ${userId}: Found ${userRecords.length} records at indices [${firstIndex}, ${lastIndex}]`);
      console.log('Records:', userRecords);
    }
    console.log('---');
  });
}

/**
 * Example 3: Search result ranking and filtering
 * Demonstrate how to find score ranges in sorted results
 */
function demonstrateSearchResultFiltering() {
  console.log('=== Search Result Score Filtering ===\n');
  
  // Search results sorted by score (descending, so we'll work with negative values for binary search)
  const searchResults = [
    { query: 'javascript', score: 95 },
    { query: 'js', score: 95 },
    { query: 'react', score: 90 },
    { query: 'reactjs', score: 90 },
    { query: 'vue', score: 85 },
    { query: 'angular', score: 80 },
    { query: 'node', score: 80 },
    { query: 'npm', score: 75 },
    { query: 'webpack', score: 70 },
    { query: 'babel', score: 65 }
  ];
  
  // Extract scores for binary search (need to work with sorted array)
  const scores = searchResults.map(result => result.score).reverse(); // Sort ascending for binary search
  const reversedResults = [...searchResults].reverse();
  
  console.log('Search results (sorted by score):', searchResults);
  
  // Find results with specific score ranges
  const targetScores = [95, 90, 80, 75, 60]; // Include non-existent score
  
  targetScores.forEach(targetScore => {
    const [firstIndex, lastIndex] = findFirstLastOccurrence(scores, targetScore);
    
    if (firstIndex === -1) {
      console.log(`Score ${targetScore}: No results found`);
    } else {
      // Convert back to original indices
      const originalFirst = scores.length - 1 - lastIndex;
      const originalLast = scores.length - 1 - firstIndex;
      
      const resultsWithScore = searchResults.slice(originalFirst, originalLast + 1);
      console.log(`Score ${targetScore}: Found ${resultsWithScore.length} results`);
      console.log('Results:', resultsWithScore.map(r => r.query).join(', '));
    }
    console.log('---');
  });
}

/**
 * Example 4: Performance comparison of different approaches
 * Benchmark and analyze the efficiency of various implementations
 */
function demonstratePerformanceComparison() {
  console.log('=== Performance Comparison ===\n');
  
  // Generate large sorted array with many duplicates
  const arraySize = 100000;
  const arr = [];
  
  for (let i = 0; i < arraySize; i++) {
    // Create duplicates by using integer division
    arr.push(Math.floor(i / 100));
  }
  
  const target = Math.floor(arraySize / 200); // Target that definitely exists
  
  console.log(`Array size: ${arraySize}, Target: ${target}`);
  console.log('Expected range:', [target * 100, (target + 1) * 100 - 1]);
  
  // Test different implementations
  const implementations = [
    { name: 'Separate Binary Searches', fn: findFirstLastOccurrence },
    { name: 'Unified Binary Search', fn: findFirstLastOccurrenceUnified },
    { name: 'Optimized Approach', fn: findFirstLastOptimized },
    { name: 'Lower/Upper Bound', fn: findFirstLastWithBounds }
  ];
  
  implementations.forEach(({ name, fn }) => {
    const startTime = performance.now();
    const result = fn(arr, target);
    const endTime = performance.now();
    
    const isCorrect = result[0] === target * 100 && result[1] === (target + 1) * 100 - 1;
    
    console.log(`${name}:`);
    console.log(`  Result: [${result[0]}, ${result[1]}]`);
    console.log(`  Time: ${(endTime - startTime).toFixed(4)}ms`);
    console.log(`  Correct: ${isCorrect}`);
    console.log('---');
  });
}

/**
 * Example 5: Edge cases and boundary testing
 * Comprehensive testing of various edge cases
 */
function demonstrateEdgeCases() {
  console.log('=== Edge Cases Testing ===\n');
  
  const testCases = [
    {
      name: 'Empty array',
      array: [],
      target: 5,
      expected: [-1, -1]
    },
    {
      name: 'Single element (found)',
      array: [5],
      target: 5,
      expected: [0, 0]
    },
    {
      name: 'Single element (not found)',
      array: [3],
      target: 5,
      expected: [-1, -1]
    },
    {
      name: 'All same elements',
      array: [7, 7, 7, 7, 7],
      target: 7,
      expected: [0, 4]
    },
    {
      name: 'Target at beginning',
      array: [1, 1, 2, 3, 4],
      target: 1,
      expected: [0, 1]
    },
    {
      name: 'Target at end',
      array: [1, 2, 3, 4, 4],
      target: 4,
      expected: [3, 4]
    },
    {
      name: 'Target smaller than all',
      array: [2, 3, 4, 5],
      target: 1,
      expected: [-1, -1]
    },
    {
      name: 'Target larger than all',
      array: [1, 2, 3, 4],
      target: 5,
      expected: [-1, -1]
    },
    {
      name: 'No duplicates (found)',
      array: [1, 2, 3, 4, 5],
      target: 3,
      expected: [2, 2]
    },
    {
      name: 'Complex duplicates',
      array: [1, 2, 2, 2, 3, 3, 4, 4, 4, 4, 5],
      target: 4,
      expected: [6, 9]
    }
  ];
  
  testCases.forEach(({ name, array, target, expected }) => {
    const result = findFirstLastOccurrence(array, target);
    const passed = result[0] === expected[0] && result[1] === expected[1];
    
    console.log(`${name}:`);
    console.log(`  Array: [${array.join(', ')}]`);
    console.log(`  Target: ${target}`);
    console.log(`  Expected: [${expected.join(', ')}]`);
    console.log(`  Got: [${result.join(', ')}]`);
    console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('---');
  });
}

// Export all implementations and examples
module.exports = {
  findFirstLastOccurrence,
  findFirstLastOccurrenceUnified,
  findFirstLastOptimized,
  findFirstLastRecursive,
  findFirstLastWithBounds,
  findFirstOccurrence,
  findLastOccurrence,
  findLowerBound,
  findUpperBound,
  findEventsInTimeRange,
  demonstrateDatabaseRangeQuery,
  demonstrateSearchResultFiltering,
  demonstratePerformanceComparison,
  demonstrateEdgeCases
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('First and Last Occurrence in Sorted Array\n');
  console.log('This module demonstrates various approaches to finding');
  console.log('the first and last occurrence of an element in a sorted array.\n');
  
  // Sample data for demonstrations
  const sampleEvents = [
    { timestamp: 100, event: 'user_login' },
    { timestamp: 120, event: 'page_view' },
    { timestamp: 120, event: 'click' },
    { timestamp: 150, event: 'purchase' },
    { timestamp: 180, event: 'logout' }
  ];
  
  findEventsInTimeRange(sampleEvents, 120, 120);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateDatabaseRangeQuery();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateSearchResultFiltering();
  }, 2000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstratePerformanceComparison();
  }, 3000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEdgeCases();
  }, 4000);
}