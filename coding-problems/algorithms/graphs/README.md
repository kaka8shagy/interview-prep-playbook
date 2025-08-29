# Graphs

## Quick Summary
- Collection of vertices (nodes) connected by edges
- Two main types: directed and undirected graphs
- Common representations: adjacency list, adjacency matrix, edge list
- Traversal algorithms: DFS and BFS
- Applications: social networks, maps, dependency resolution

## Core Concepts

### Graph Representations
- **Adjacency List**: Most common, space efficient for sparse graphs
- **Adjacency Matrix**: Good for dense graphs, O(1) edge lookup
- **Edge List**: Simple representation, list of all edges

### Graph Traversals
- **DFS**: Explore as far as possible before backtracking
- **BFS**: Explore all neighbors before going deeper

### Connected Components
Groups of vertices that are connected to each other but not to vertices in other groups.

## Subtopics
See specialized folders:
- Island Problems: `./island-problems/`
- Topological Sort: `./topological-sort/`

## Common Problem Categories
- **Connectivity**: Connected components, graph validity
- **Path Finding**: Shortest paths, all paths
- **Cycle Detection**: Finding cycles in directed/undirected graphs
- **Coloring**: Graph coloring problems

## Related Topics
- [Trees](../trees/README.md) - Special case of graphs
- [BFS and DFS](../trees/dfs/README.md) - Core traversal algorithms