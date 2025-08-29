# Union Find (Disjoint Set)

## Quick Summary
- Data structure for tracking disjoint sets and connectivity queries
- Two main operations: Union (connect components) and Find (check connectivity)
- Optimizations: Union by rank/size and Path compression
- Nearly O(1) amortized time complexity with optimizations
- Applications: network connectivity, graph algorithms, clustering

## Core Concepts

### Disjoint Sets
Groups of elements where each element belongs to exactly one group.

### Union Operation
Merge two disjoint sets into one set.

### Find Operation
Determine which set an element belongs to, typically returns representative/root.

### Optimizations
- **Union by Rank**: Always attach smaller tree under root of larger tree
- **Path Compression**: Make nodes point directly to root during find operations

## Implementation Patterns
See code examples:
- Basic union-find: `./code/graph-valid-tree.js`
- Connectivity: `./code/redundant-connection.js`
- Components counting: `./code/number-of-provinces.js`

## Common Pitfalls
- Not implementing path compression (leads to O(n) find)
- Incorrect union by rank implementation
- Off-by-one errors in array indexing
- Not handling edge cases (self-loops, empty graphs)
- Forgetting to initialize parent/rank arrays

## Interview Questions

### 1. Graph Valid Tree
**Approach**: Use union-find to detect cycles and check connectivity
**Solution**: `./code/graph-valid-tree.js`

### 2. Redundant Connection
**Approach**: Process edges, use union-find to detect cycle-causing edge
**Solution**: `./code/redundant-connection.js`

### 3. Number of Provinces
**Approach**: Union connected cities, count distinct components
**Solution**: `./code/number-of-provinces.js`

### 4. Number of Operations to Make Network Connected
**Approach**: Count components and available edges for connections
**Solution**: `./code/network-connected.js`

### 5. Similar String Groups
**Approach**: Union strings that are anagrams or similar
**Solution**: `./code/similar-string-groups.js`

### 6. Remove Max Number of Edges to Keep Graph Fully Traversable
**Approach**: Use two union-find structures for different edge types
**Solution**: `./code/max-edges-removal.js`

### 7. Number of Connected Components in an Undirected Graph
**Approach**: Union connected nodes, count distinct roots
**Solution**: `./code/connected-components.js`

## Related Topics
- [Graphs](../graphs/README.md) - Primary application domain
- [Trees](../trees/README.md) - Union-find creates tree structures
- [Arrays and Strings](../arrays-and-strings/README.md) - Implementation using arrays