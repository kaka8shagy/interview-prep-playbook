/**
 * File: custom-array-sort.js
 * Description: Custom implementation of Array.sort() using QuickSort algorithm
 * 
 * Problem: Write custom polyfill for Array.sort()
 * Level: Medium
 * Asked at: Freshworks
 * 
 * Learning objectives:
 * - Understand QuickSort algorithm and partitioning
 * - Learn in-place sorting techniques
 * - Practice recursive algorithm implementation
 * 
 * Time Complexity: O(n log n) average case, O(n²) worst case
 * Space Complexity: O(log n) for recursion stack
 */

// =======================
// Problem Statement
// =======================

/**
 * Implement a custom sorting function that mimics Array.sort() behavior
 * using the QuickSort algorithm. The function should:
 * 
 * 1. Sort an array of numbers in ascending order
 * 2. Use in-place sorting (modify the original array)
 * 3. Implement proper partitioning logic
 * 4. Handle edge cases like empty arrays and single elements
 * 
 * Note: This is a simplified version focusing on numeric sorting
 */

// =======================
// TODO: Implementation
// =======================

/**
 * Custom sort function using QuickSort algorithm
 * 
 * @param {number[]} nums - Array of numbers to sort
 * @returns {number[]} - The sorted array (modified in-place)
 */
function customSort(nums) {
    // TODO: Implement the main QuickSort function
    // 
    // Structure needed:
    // 1. quickSort(left, right) - main recursive function
    // 2. partition(left, right) - partitioning logic
    // 3. Proper pivot selection and swapping
    
    throw new Error('Implementation pending');
    
    /**
     * Internal QuickSort recursive function
     * 
     * @param {number} left - Starting index
     * @param {number} right - Ending index
     */
    function quickSort(left, right) {
        // TODO: Base case and recursive calls
        // if (left >= right) return;
        // const pivotIndex = partition(left, right);
        // quickSort(left, pivotIndex - 1);
        // quickSort(pivotIndex, right);
    }
    
    /**
     * Partition function for QuickSort
     * 
     * @param {number} left - Starting index
     * @param {number} right - Ending index
     * @returns {number} - Final position of pivot
     */
    function partition(left, right) {
        // TODO: Implement partitioning logic
        // 1. Choose pivot (middle element recommended)
        // 2. Move elements smaller than pivot to left
        // 3. Move elements larger than pivot to right
        // 4. Return final pivot position
        
        // const pivot = nums[Math.floor((left + right) / 2)];
        // let i = left, j = right;
        // ... partitioning logic
        
        return 0; // Placeholder
    }
}

// =======================
// Alternative Implementation Ideas
// =======================

/**
 * TODO: Merge Sort Implementation (for comparison)
 * - More stable O(n log n) performance
 * - Not in-place (requires extra space)
 */
function customSortMerge(nums) {
    // TODO: Implement merge sort as alternative
    throw new Error('Implementation pending');
}

/**
 * TODO: Heap Sort Implementation
 * - Guaranteed O(n log n) performance
 * - In-place sorting
 */
function customSortHeap(nums) {
    // TODO: Implement heap sort as alternative
    throw new Error('Implementation pending');
}

// =======================
// Test Cases
// =======================

/**
 * Test the implementation with various scenarios
 * Uncomment when implementation is ready
 */

/*
// Test Case 1: Basic sorting
console.log("=== Basic Sorting Test ===");
const arr1 = [21, 31, 45, 56, 43];
console.log("Before:", arr1);
console.log("After:", customSort([...arr1]));
// Expected: [21, 31, 43, 45, 56]

// Test Case 2: Already sorted array
console.log("\n=== Already Sorted Test ===");
const arr2 = [1, 2, 3, 4, 5];
console.log("Before:", arr2);
console.log("After:", customSort([...arr2]));
// Expected: [1, 2, 3, 4, 5]

// Test Case 3: Reverse sorted array
console.log("\n=== Reverse Sorted Test ===");
const arr3 = [5, 4, 3, 2, 1];
console.log("Before:", arr3);
console.log("After:", customSort([...arr3]));
// Expected: [1, 2, 3, 4, 5]

// Test Case 4: Array with duplicates
console.log("\n=== Duplicates Test ===");
const arr4 = [3, 1, 4, 1, 5, 9, 2, 6, 5];
console.log("Before:", arr4);
console.log("After:", customSort([...arr4]));
// Expected: [1, 1, 2, 3, 4, 5, 5, 6, 9]

// Test Case 5: Single element
console.log("\n=== Single Element Test ===");
const arr5 = [42];
console.log("Before:", arr5);
console.log("After:", customSort([...arr5]));
// Expected: [42]

// Test Case 6: Empty array
console.log("\n=== Empty Array Test ===");
const arr6 = [];
console.log("Before:", arr6);
console.log("After:", customSort([...arr6]));
// Expected: []

// Performance comparison with native sort
console.log("\n=== Performance Comparison ===");
const largeArray = Array.from({length: 1000}, () => Math.floor(Math.random() * 1000));

console.time('Native Sort');
[...largeArray].sort((a, b) => a - b);
console.timeEnd('Native Sort');

console.time('Custom Sort');
customSort([...largeArray]);
console.timeEnd('Custom Sort');
*/

// =======================
// Interview Discussion Points
// =======================

/**
 * Key points to discuss:
 * 
 * 1. Algorithm Choice:
 *    - Why QuickSort over other sorting algorithms?
 *    - Trade-offs: average vs worst-case performance
 *    - When would you choose Merge Sort or Heap Sort?
 * 
 * 2. Implementation Details:
 *    - Pivot selection strategies (first, last, middle, random)
 *    - In-place vs out-of-place sorting
 *    - Handling duplicate elements
 * 
 * 3. Edge Cases:
 *    - Empty arrays and single elements
 *    - Arrays with all identical elements
 *    - Very large arrays and stack overflow prevention
 * 
 * 4. Optimizations:
 *    - Tail recursion optimization
 *    - Hybrid approaches (QuickSort + Insertion Sort for small arrays)
 *    - Three-way partitioning for duplicate handling
 * 
 * 5. Real-world Applications:
 *    - Database query optimization
 *    - Search algorithm preprocessing
 *    - Data analysis and reporting systems
 */

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        customSort,
        customSortMerge,
        customSortHeap
    };
}