# Topological Sort

## Quick Summary
- Linear ordering of vertices in directed acyclic graph (DAG)
- Vertex u appears before vertex v if there's directed edge from u to v
- Only possible for DAGs (no cycles allowed)
- Two main algorithms: Kahn's algorithm (BFS) and DFS-based approach
- Applications: dependency resolution, scheduling, build systems

## Core Concepts

### Directed Acyclic Graph (DAG)
Topological sort only works on DAGs. If graph has cycles, topological ordering is impossible.

### Kahn's Algorithm (BFS-based)
1. Calculate in-degree for each vertex
2. Start with vertices having in-degree 0
3. Process vertex and reduce in-degree of neighbors
4. Add new zero in-degree vertices to queue

### DFS-based Algorithm
1. Perform DFS traversal
2. Add vertex to result when finishing (post-order)
3. Reverse the result to get topological order

## Implementation Patterns
See code examples:
- Course scheduling: `./code/course-schedule.js`
- Build dependencies: `./code/alien-dictionary.js`
- Minimum height trees: `./code/minimum-height-trees.js`

## Common Pitfalls
- Not detecting cycles before attempting topological sort
- Incorrect in-degree calculation
- Not handling disconnected components
- Confusing prerequisites vs dependencies direction
- Off-by-one errors in course numbering

## Interview Questions

### 1. Course Schedule
**Approach**: Use Kahn's algorithm to detect cycles
**Solution**: `./code/course-schedule.js`

### 2. Course Schedule II
**Approach**: Kahn's algorithm to return valid ordering
**Solution**: `./code/course-schedule-ii.js`

### 3. Alien Dictionary
**Approach**: Build graph from word comparisons, topological sort
**Solution**: `./code/alien-dictionary.js`

### 4. Minimum Height Trees
**Approach**: Remove leaf nodes iteratively (reverse topological sort)
**Solution**: `./code/minimum-height-trees.js`

### 5. All Ancestors of a Node in a Directed Acyclic Graph
**Approach**: Reverse graph and DFS from each node
**Solution**: `./code/all-ancestors.js`

### 6. Build a Matrix With Conditions
**Approach**: Two separate topological sorts for row/column constraints
**Solution**: `./code/build-matrix-conditions.js`

### 7. Find All Possible Recipes from Given Supplies
**Approach**: Model as dependency graph, topological sort
**Solution**: `./code/recipes-from-supplies.js`

## Related Topics
- [Graphs](../README.md) - Parent topic
- [DFS and BFS](../../trees/dfs/README.md) - Core algorithms used
- [Cycle Detection](../cycle-detection/README.md) - Prerequisite concept