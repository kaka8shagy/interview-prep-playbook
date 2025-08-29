# Backtracking

## Quick Summary
- Algorithmic technique for finding all solutions by incrementally building candidates
- Uses recursion with systematic abandoning of candidates that cannot lead to valid solution
- "Trial and error" approach with intelligent pruning
- Common applications: generating combinations, permutations, solving puzzles
- Time complexity often exponential but much better than brute force

## Core Concepts

### Backtracking Template
1. Choose: Make a choice and add to current solution
2. Constraint: Check if choice is valid/promising
3. Goal: Check if we've reached a complete solution
4. Backtrack: Undo the choice and try next option

### Pruning
Abandoning partial solutions that cannot lead to valid complete solutions.

### State Space Tree
Conceptual tree representing all possible states/solutions.

## Common Problem Categories
- **Subsets**: Generate all possible subsets
- **Permutations**: Generate all arrangements
- **Combinations**: Generate combinations with constraints
- **Puzzle Solving**: N-Queens, Sudoku, etc.

## Interview Questions

### 1. Subsets
**Approach**: Include/exclude each element recursively
**Solution**: `./code/subsets.js`

### 2. Permutations
**Approach**: Fix each element and permute remaining
**Solution**: `./code/permutations.js`

### 3. Combination Sum
**Approach**: Try including each candidate, backtrack if sum exceeds
**Solution**: `./code/combination-sum.js`

### 4. Letter Combinations of Phone Number
**Approach**: For each digit, try all possible letters
**Solution**: `./code/letter-combinations.js`

## Related Topics
- [Recursion](../recursion/README.md) - Core technique
- [Dynamic Programming](../dynamic-programming/README.md) - Alternative optimization approach