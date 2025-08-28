/**
 * File: tree-traversal.js
 * Description: Tree and graph traversal using generators
 * Demonstrates various traversal algorithms with memory-efficient generators
 */

console.log('=== Tree Node Definition ===');

// Tree node class
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
    this.parent = null;
    
    // Set parent references
    children.forEach(child => {
      if (child instanceof TreeNode) {
        child.parent = this;
      }
    });
  }
  
  addChild(child) {
    if (child instanceof TreeNode) {
      child.parent = this;
      this.children.push(child);
    }
  }
  
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }
  
  isLeaf() {
    return this.children.length === 0;
  }
  
  getDepth() {
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }
}

// Binary tree node
class BinaryTreeNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

// Sample tree construction
const sampleTree = new TreeNode('A', [
  new TreeNode('B', [
    new TreeNode('D'),
    new TreeNode('E', [
      new TreeNode('H'),
      new TreeNode('I')
    ])
  ]),
  new TreeNode('C', [
    new TreeNode('F'),
    new TreeNode('G', [
      new TreeNode('J'),
      new TreeNode('K'),
      new TreeNode('L')
    ])
  ])
]);

console.log('Sample tree created with root:', sampleTree.value);

console.log('\n=== Depth-First Traversal ===');

// DFS Pre-order (root, left, right)
function* dfsPreOrder(node) {
  if (!node) return;
  
  yield node.value;
  
  for (const child of node.children) {
    yield* dfsPreOrder(child);
  }
}

// DFS Post-order (children first, then root)
function* dfsPostOrder(node) {
  if (!node) return;
  
  for (const child of node.children) {
    yield* dfsPostOrder(child);
  }
  
  yield node.value;
}

// DFS with path information
function* dfsWithPath(node, path = []) {
  if (!node) return;
  
  const currentPath = [...path, node.value];
  yield { value: node.value, path: currentPath, depth: path.length };
  
  for (const child of node.children) {
    yield* dfsWithPath(child, currentPath);
  }
}

console.log('1. DFS Pre-order:');
const preOrder = [...dfsPreOrder(sampleTree)];
console.log('Pre-order:', preOrder.join(' -> '));

console.log('2. DFS Post-order:');
const postOrder = [...dfsPostOrder(sampleTree)];
console.log('Post-order:', postOrder.join(' -> '));

console.log('3. DFS with paths:');
for (const node of dfsWithPath(sampleTree)) {
  console.log(`${node.value} at depth ${node.depth}: ${node.path.join(' -> ')}`);
}

console.log('\n=== Breadth-First Traversal ===');

// BFS Level-by-level
function* bfsTraversal(root) {
  if (!root) return;
  
  const queue = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    yield node.value;
    
    for (const child of node.children) {
      queue.push(child);
    }
  }
}

// BFS with level information
function* bfsWithLevels(root) {
  if (!root) return;
  
  const queue = [{ node: root, level: 0 }];
  
  while (queue.length > 0) {
    const { node, level } = queue.shift();
    yield { value: node.value, level };
    
    for (const child of node.children) {
      queue.push({ node: child, level: level + 1 });
    }
  }
}

// Level-order with level grouping
function* levelOrder(root) {
  if (!root) return;
  
  let currentLevel = [root];
  let level = 0;
  
  while (currentLevel.length > 0) {
    const levelValues = currentLevel.map(node => node.value);
    yield { level, values: levelValues };
    
    const nextLevel = [];
    for (const node of currentLevel) {
      nextLevel.push(...node.children);
    }
    
    currentLevel = nextLevel;
    level++;
  }
}

console.log('4. BFS Traversal:');
const bfsOrder = [...bfsTraversal(sampleTree)];
console.log('BFS order:', bfsOrder.join(' -> '));

console.log('5. BFS with levels:');
for (const node of bfsWithLevels(sampleTree)) {
  console.log(`${node.value} at level ${node.level}`);
}

console.log('6. Level-order grouping:');
for (const level of levelOrder(sampleTree)) {
  console.log(`Level ${level.level}: [${level.values.join(', ')}]`);
}

console.log('\n=== Binary Tree Traversals ===');

// Binary tree sample
const binaryTree = new BinaryTreeNode('F',
  new BinaryTreeNode('B',
    new BinaryTreeNode('A'),
    new BinaryTreeNode('D',
      new BinaryTreeNode('C'),
      new BinaryTreeNode('E')
    )
  ),
  new BinaryTreeNode('G',
    null,
    new BinaryTreeNode('I',
      new BinaryTreeNode('H'),
      null
    )
  )
);

// Binary tree in-order (left, root, right)
function* inOrderBinary(node) {
  if (!node) return;
  
  yield* inOrderBinary(node.left);
  yield node.value;
  yield* inOrderBinary(node.right);
}

// Binary tree pre-order (root, left, right)
function* preOrderBinary(node) {
  if (!node) return;
  
  yield node.value;
  yield* preOrderBinary(node.left);
  yield* preOrderBinary(node.right);
}

// Binary tree post-order (left, right, root)
function* postOrderBinary(node) {
  if (!node) return;
  
  yield* postOrderBinary(node.left);
  yield* postOrderBinary(node.right);
  yield node.value;
}

console.log('7. Binary Tree In-order:');
console.log('In-order:', [...inOrderBinary(binaryTree)].join(' -> '));

console.log('8. Binary Tree Pre-order:');
console.log('Pre-order:', [...preOrderBinary(binaryTree)].join(' -> '));

console.log('9. Binary Tree Post-order:');
console.log('Post-order:', [...postOrderBinary(binaryTree)].join(' -> '));

console.log('\n=== Advanced Traversal Patterns ===');

// Conditional traversal with filtering
function* conditionalTraversal(node, condition) {
  if (!node) return;
  
  if (condition(node)) {
    yield node.value;
  }
  
  for (const child of node.children) {
    yield* conditionalTraversal(child, condition);
  }
}

// Find all leaf nodes
function* findLeafNodes(node) {
  if (!node) return;
  
  if (node.isLeaf()) {
    yield node.value;
  } else {
    for (const child of node.children) {
      yield* findLeafNodes(child);
    }
  }
}

// Find nodes at specific depth
function* findNodesAtDepth(node, targetDepth, currentDepth = 0) {
  if (!node) return;
  
  if (currentDepth === targetDepth) {
    yield node.value;
    return;
  }
  
  for (const child of node.children) {
    yield* findNodesAtDepth(child, targetDepth, currentDepth + 1);
  }
}

// Path finding generator
function* findPaths(node, target, currentPath = []) {
  if (!node) return;
  
  const newPath = [...currentPath, node.value];
  
  if (node.value === target) {
    yield newPath;
  }
  
  for (const child of node.children) {
    yield* findPaths(child, target, newPath);
  }
}

console.log('10. Conditional Traversal (nodes with length > 1):');
const multiCharNodes = [...conditionalTraversal(sampleTree, node => node.value.length > 1)];
console.log('Multi-char nodes:', multiCharNodes);

console.log('11. Leaf Nodes:');
const leafNodes = [...findLeafNodes(sampleTree)];
console.log('Leaf nodes:', leafNodes);

console.log('12. Nodes at Depth 2:');
const depth2Nodes = [...findNodesAtDepth(sampleTree, 2)];
console.log('Depth 2 nodes:', depth2Nodes);

console.log('13. All Paths to "K":');
const pathsToK = [...findPaths(sampleTree, 'K')];
pathsToK.forEach((path, index) => {
  console.log(`Path ${index + 1}: ${path.join(' -> ')}`);
});

console.log('\n=== Graph Traversal ===');

// Graph representation
class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }
  
  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }
  
  addEdge(vertex1, vertex2) {
    this.addVertex(vertex1);
    this.addVertex(vertex2);
    
    this.adjacencyList.get(vertex1).push(vertex2);
    this.adjacencyList.get(vertex2).push(vertex1); // Undirected graph
  }
  
  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }
  
  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }
}

// DFS for graphs with cycle detection
function* graphDFS(graph, startVertex, visited = new Set()) {
  if (visited.has(startVertex)) return;
  
  visited.add(startVertex);
  yield startVertex;
  
  for (const neighbor of graph.getNeighbors(startVertex)) {
    if (!visited.has(neighbor)) {
      yield* graphDFS(graph, neighbor, visited);
    }
  }
}

// BFS for graphs
function* graphBFS(graph, startVertex) {
  const visited = new Set();
  const queue = [startVertex];
  
  while (queue.length > 0) {
    const vertex = queue.shift();
    
    if (visited.has(vertex)) continue;
    
    visited.add(vertex);
    yield vertex;
    
    for (const neighbor of graph.getNeighbors(vertex)) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }
}

// Connected components
function* findConnectedComponents(graph) {
  const visited = new Set();
  
  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      const component = [];
      
      for (const node of graphDFS(graph, vertex, visited)) {
        component.push(node);
      }
      
      yield component;
    }
  }
}

// Create sample graph
const graph = new Graph();
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
graph.addEdge('B', 'D');
graph.addEdge('C', 'E');
graph.addEdge('F', 'G'); // Separate component

console.log('14. Graph DFS from A:');
const graphDfsResult = [...graphDFS(graph, 'A')];
console.log('DFS:', graphDfsResult.join(' -> '));

console.log('15. Graph BFS from A:');
const graphBfsResult = [...graphBFS(graph, 'A')];
console.log('BFS:', graphBfsResult.join(' -> '));

console.log('16. Connected Components:');
const components = [...findConnectedComponents(graph)];
components.forEach((component, index) => {
  console.log(`Component ${index + 1}: [${component.join(', ')}]`);
});

console.log('\n=== Memory-Efficient Patterns ===');

// Large tree simulation for memory testing
class LargeTreeNode {
  constructor(id, childCount = 0) {
    this.id = id;
    this.children = [];
    
    for (let i = 0; i < childCount; i++) {
      this.children.push(new LargeTreeNode(`${id}-${i}`));
    }
  }
}

// Memory-efficient deep traversal
function* deepTraversal(node, maxDepth = 10, currentDepth = 0) {
  if (!node || currentDepth > maxDepth) return;
  
  yield { id: node.id, depth: currentDepth };
  
  for (const child of node.children) {
    yield* deepTraversal(child, maxDepth, currentDepth + 1);
  }
}

// Lazy tree construction
function* lazyTreeTraversal(nodeFactory, maxNodes = 1000) {
  let nodeCount = 0;
  const queue = [{ factory: nodeFactory, depth: 0 }];
  
  while (queue.length > 0 && nodeCount < maxNodes) {
    const { factory, depth } = queue.shift();
    const node = factory();
    
    yield { node: node.id, depth };
    nodeCount++;
    
    // Generate children lazily
    if (node.children && depth < 3) {
      for (const child of node.children) {
        queue.push({ factory: () => child, depth: depth + 1 });
      }
    }
  }
}

console.log('17. Memory-Efficient Deep Traversal:');
const largeTree = new LargeTreeNode('root', 3);
const deepNodes = [];
let count = 0;

for (const node of deepTraversal(largeTree, 3)) {
  deepNodes.push(node);
  count++;
  if (count >= 10) break; // Limit output
}

console.log('First 10 nodes:', deepNodes);
console.log('Generator allows early termination without processing entire tree');

console.log('\n=== Interview Questions ===');

// Q1: Serialize and deserialize tree
function* serializeTree(node) {
  if (!node) {
    yield null;
    return;
  }
  
  yield node.value;
  yield node.children.length;
  
  for (const child of node.children) {
    yield* serializeTree(child);
  }
}

function deserializeTree(values) {
  const iter = values[Symbol.iterator]();
  
  function buildNode() {
    const result = iter.next();
    if (result.done || result.value === null) {
      return null;
    }
    
    const value = result.value;
    const childCountResult = iter.next();
    const childCount = childCountResult.value;
    
    const children = [];
    for (let i = 0; i < childCount; i++) {
      const child = buildNode();
      if (child) children.push(child);
    }
    
    return new TreeNode(value, children);
  }
  
  return buildNode();
}

console.log('Q1: Tree Serialization:');
const serialized = [...serializeTree(sampleTree)];
console.log('Serialized:', serialized);

const deserialized = deserializeTree(serialized);
const deserializedPreOrder = [...dfsPreOrder(deserialized)];
console.log('Deserialized pre-order:', deserializedPreOrder.join(' -> '));

// Q2: Find lowest common ancestor
function* findAncestors(node, target) {
  if (!node) return;
  
  if (node.value === target) {
    yield node;
    return;
  }
  
  for (const child of node.children) {
    const found = findAncestors(child, target);
    const ancestors = [...found];
    
    if (ancestors.length > 0) {
      yield node;
      yield* ancestors;
      return;
    }
  }
}

function findLCA(root, value1, value2) {
  const ancestors1 = [...findAncestors(root, value1)].reverse();
  const ancestors2 = [...findAncestors(root, value2)].reverse();
  
  let lca = null;
  const minLength = Math.min(ancestors1.length, ancestors2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (ancestors1[i].value === ancestors2[i].value) {
      lca = ancestors1[i];
    } else {
      break;
    }
  }
  
  return lca;
}

console.log('Q2: Lowest Common Ancestor:');
const lca = findLCA(sampleTree, 'H', 'K');
console.log(`LCA of H and K: ${lca ? lca.value : 'Not found'}`);

// Q3: Tree diameter (longest path between any two nodes)
function* findAllPaths(node, visited = new Set()) {
  if (!node || visited.has(node)) return;
  
  visited.add(node);
  
  if (node.children.length === 0) {
    yield [node.value];
    visited.delete(node);
    return;
  }
  
  for (const child of node.children) {
    for (const path of findAllPaths(child, visited)) {
      yield [node.value, ...path];
    }
  }
  
  visited.delete(node);
}

function findTreeDiameter(root) {
  let maxDiameter = 0;
  
  for (const path of findAllPaths(root)) {
    maxDiameter = Math.max(maxDiameter, path.length - 1); // Edges = nodes - 1
  }
  
  return maxDiameter;
}

console.log('Q3: Tree Diameter:');
const diameter = findTreeDiameter(sampleTree);
console.log(`Tree diameter: ${diameter}`);

module.exports = {
  TreeNode,
  BinaryTreeNode,
  dfsPreOrder,
  dfsPostOrder,
  dfsWithPath,
  bfsTraversal,
  bfsWithLevels,
  levelOrder,
  inOrderBinary,
  preOrderBinary,
  postOrderBinary,
  conditionalTraversal,
  findLeafNodes,
  findNodesAtDepth,
  findPaths,
  Graph,
  graphDFS,
  graphBFS,
  findConnectedComponents,
  deepTraversal,
  lazyTreeTraversal,
  serializeTree,
  deserializeTree,
  findAncestors,
  findLCA,
  findAllPaths,
  findTreeDiameter
};