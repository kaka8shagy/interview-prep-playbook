# Island Problems

## Quick Summary
- Graph problems involving 2D grids representing islands/land/water
- Use DFS or BFS to explore connected components (islands)
- Common patterns: counting islands, flood fill, finding perimeters
- Key insight: treat grid as implicit graph where adjacent cells are connected
- Time complexity: O(m*n), Space complexity: O(m*n) for recursion stack

## Core Concepts

### Grid as Graph
Each cell is a node, adjacent cells (4-directional or 8-directional) are connected edges.

### Connected Components
Islands are connected components of land cells (usually represented as 1s).

### DFS/BFS Traversal
Use DFS or BFS to mark visited cells and explore entire island from starting cell.

## Implementation Patterns
See code examples:
- Basic counting: `./code/number-of-islands.js`
- Flood fill: `./code/flood-fill.js`
- Perimeter: `./code/island-perimeter.js`

## Interview Questions

### 1. Number of Islands
**Approach**: DFS/BFS to count connected components
**Solution**: `./code/number-of-islands.js`

### 2. Flood Fill
**Approach**: DFS to change connected pixels to new color
**Solution**: `./code/flood-fill.js`

### 3. Surrounded Regions
**Approach**: DFS from border to find unsurrounded regions
**Solution**: `./code/surrounded-regions.js`

### 4. Walls and Gates
**Approach**: Multi-source BFS from all gates
**Solution**: `./code/walls-and-gates.js`

### 5. Find All Groups of Farmland
**Approach**: DFS to find rectangular farmland groups
**Solution**: `./code/farmland-groups.js`

### 6. Count Sub Islands
**Approach**: DFS to verify sub-island property
**Solution**: `./code/count-sub-islands.js`

### 7. Minesweeper
**Approach**: DFS to reveal connected empty cells
**Solution**: `./code/minesweeper.js`

## Related Topics
- [Graphs](../README.md) - Parent topic
- [DFS and BFS](../../trees/dfs/README.md) - Core traversal algorithms
- [Arrays and Strings](../../arrays-and-strings/README.md) - Grid representation