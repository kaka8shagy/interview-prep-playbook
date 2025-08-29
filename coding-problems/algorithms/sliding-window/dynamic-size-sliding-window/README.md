# Dynamic-Size Sliding Window

## Quick Summary
- Window size changes based on problem constraints
- Two pointers: left (start) and right (end) of window
- Expand window by moving right pointer, contract by moving left pointer
- Optimal for problems finding longest/shortest subarrays meeting criteria

## Core Pattern
```
1. Initialize left = 0, right = 0
2. Expand window by moving right pointer
3. When condition is violated, contract by moving left pointer
4. Track optimal window size/position during expansion
```

## Common Variations
- **Longest subarray/substring** with constraint
- **Shortest subarray/substring** with constraint
- **Count of valid** subarrays/substrings

## Interview Questions

### 1. Max Consecutive Ones
**Approach**: Track longest sequence of consecutive 1s
**Solution**: `./code/max-consecutive-ones.js`

### 2. Max Consecutive Ones III
**Approach**: Allow flipping at most k zeros, find longest subarray
**Solution**: `./code/max-consecutive-ones-iii.js`

### 3. Maximize the Confusion of an Exam
**Approach**: Similar to Max Consecutive Ones III but with T/F
**Solution**: `./code/maximize-confusion-exam.js`

### 4. Longest Substring Without Repeating Characters
**Approach**: Use set to track unique characters in window
**Solution**: `./code/longest-substring-no-repeating.js`

### 5. Longest Substring with At Most Two Distinct Characters
**Approach**: Use map to track character frequencies, maintain ≤ 2 distinct
**Solution**: `./code/longest-substring-two-distinct.js`

### 6. Longest Substring with At Most K Distinct Characters
**Approach**: Extend above approach to k distinct characters
**Solution**: `./code/longest-substring-k-distinct.js`

### 7. Fruit Into Baskets
**Approach**: Same as longest substring with 2 distinct characters
**Solution**: `./code/fruit-into-baskets.js`

### 8. Minimum Window Substring
**Approach**: Find shortest window containing all characters of target
**Solution**: `./code/minimum-window-substring.js`

## Related Topics
- [Fixed-Size Sliding Window](../fixed-size-sliding-window/README.md)
- [Two Pointers](../../two-pointers/README.md)