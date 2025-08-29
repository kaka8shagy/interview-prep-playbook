# Binary Search

## Quick Summary
- Divide-and-conquer algorithm for searching in sorted arrays
- Time complexity: O(log n), Space complexity: O(1)
- Key requirement: array must be sorted
- Two main variants: finding exact match vs finding insertion position
- Template approach prevents off-by-one errors

## Core Concepts

### Basic Binary Search
Search for a target value in a sorted array by repeatedly dividing the search space in half.

### Modified Binary Search
Variations include finding first/last occurrence, peak elements, or searching in rotated arrays.

### Search Space Reduction
Each comparison eliminates half the remaining possibilities, leading to logarithmic time complexity.

## Implementation Patterns
See code examples:
- Basic search: `./code/binary-search.js`
- First/last position: `./code/first-last-position.js`
- Peak finding: `./code/peak-index-mountain.js`
- Rotated arrays: `./code/search-rotated-array.js`

## Common Pitfalls
- Off-by-one errors in boundary conditions
- Infinite loops when not updating pointers correctly
- Not handling edge cases (empty arrays, single elements)
- Forgetting that array must be sorted
- Incorrect mid calculation causing integer overflow

## Time & Space Complexity Patterns
- **Time**: O(log n) - search space halved each iteration
- **Space**: O(1) for iterative, O(log n) for recursive
- Significant improvement over linear search O(n)

## Binary Search Template
```javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1; // not found
}
```

## Interview Questions

### 1. Binary Search
**Approach**: Standard binary search template
**Solution**: `./code/binary-search.js`

### 2. Find Smallest Letter Greater Than Target
**Approach**: Find first element > target, handle wraparound
**Solution**: `./code/find-smallest-letter.js`

### 3. Find First and Last Position of Element in Sorted Array
**Approach**: Two binary searches for leftmost and rightmost positions
**Solution**: `./code/first-last-position.js`

### 4. Single Element in a Sorted Array
**Approach**: Use binary search on index parity
**Solution**: `./code/single-element-sorted-array.js`

### 5. Peak Index in a Mountain Array
**Approach**: Binary search for peak where arr[i] > arr[i+1]
**Solution**: `./code/peak-index-mountain.js`

### 6. Find in Mountain Array
**Approach**: First find peak, then search both sides
**Solution**: `./code/find-in-mountain-array.js`

### 7. Search in Rotated Sorted Array
**Approach**: Identify which half is sorted, then search appropriately
**Solution**: `./code/search-rotated-array.js`

## Related Topics
- [Arrays and Strings](../arrays-and-strings/README.md) - Foundation data structure
- [Two Pointers](../two-pointers/README.md) - Similar pointer manipulation
- [Divide and Conquer](../divide-and-conquer/README.md) - Core algorithmic paradigm