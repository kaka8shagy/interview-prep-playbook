# Dynamic Programming

## Quick Summary
- Optimization technique that solves complex problems by breaking them into simpler subproblems
- Two approaches: top-down (memoization) and bottom-up (tabulation)
- Applicable when problems have optimal substructure and overlapping subproblems
- Transforms exponential time algorithms into polynomial time
- Common patterns: linear DP, 2D DP, knapsack problems

## Core Concepts

### Optimal Substructure
Problem can be solved optimally using optimal solutions of its subproblems.

### Overlapping Subproblems
Same subproblems are solved repeatedly in naive recursive approach.

### Memoization (Top-Down)
Store results of expensive function calls and reuse when same inputs occur.

### Tabulation (Bottom-Up)
Build solution iteratively from smallest subproblems to larger ones.

## Common DP Patterns
- **Linear DP**: Problems on arrays/strings (Fibonacci, climbing stairs)
- **2D DP**: Grid problems, string matching
- **Knapsack**: Resource allocation with constraints
- **Palindrome**: String/array palindrome problems

## Interview Questions

### 1. Fibonacci Number
**Approach**: Linear DP with bottom-up approach
**Solution**: `./code/fibonacci.js`

### 2. Climbing Stairs
**Approach**: Similar to Fibonacci, count ways to reach step
**Solution**: `./code/climbing-stairs.js`

### 3. Coin Change II
**Approach**: 2D DP for counting combinations
**Solution**: `./code/coin-change-ii.js`

### 4. Unique Paths
**Approach**: 2D grid DP for path counting
**Solution**: `./code/unique-paths.js`

### 5. Target Sum
**Approach**: Convert to subset sum problem
**Solution**: `./code/target-sum.js`

## Related Topics
- [Recursion](../recursion/README.md) - Foundation for DP
- [Arrays and Strings](../arrays-and-strings/README.md) - Common problem domains