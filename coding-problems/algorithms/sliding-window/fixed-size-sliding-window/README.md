# Fixed-Size Sliding Window

## Quick Summary
- Window size k remains constant throughout the algorithm
- Efficient for problems involving subarrays/substrings of exact size
- Template: calculate initial window, then slide by removing left and adding right element
- Time complexity: O(n), Space complexity: O(1) typically

## Core Pattern
```
1. Calculate sum/state of first window of size k
2. For remaining elements:
   - Remove leftmost element from window
   - Add new rightmost element to window  
   - Update result based on current window state
```

## Interview Questions

### 1. Average Of All Subarrays
**Approach**: Maintain running sum, divide by k for each window
**Solution**: `./code/average-of-all-subarrays.js`

### 2. Maximum Average Subarray I
**Approach**: Track maximum sum window, convert to average
**Solution**: `./code/maximum-average-subarray-i.js`

### 3. Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold
**Approach**: Count windows where average >= threshold
**Solution**: `./code/subarray-average-threshold.js`

### 4. Diet Plan Performance
**Approach**: Sliding window to track calories over k days
**Solution**: `./code/diet-plan-performance.js`

### 5. Substrings of Size Three with Distinct Characters
**Approach**: Fixed window of size 3, check for distinct characters
**Solution**: `./code/substrings-size-three-distinct.js`

### 6. Find K-Length Substrings With No Repeated Characters
**Approach**: Use set to track unique characters in window
**Solution**: `./code/k-length-no-repeated-chars.js`

### 7. Find All Anagrams in a String
**Approach**: Compare character frequencies in sliding window
**Solution**: `./code/find-all-anagrams.js`

### 8. Permutation in String
**Approach**: Check if any window matches target permutation
**Solution**: `./code/permutation-in-string.js`

## Related Topics
- [Dynamic-Size Sliding Window](../dynamic-size-sliding-window/README.md)
- [Arrays and Strings](../../arrays-and-strings/README.md)