/**
 * File: binary-tree-dimensions.js
 * Description: Calculate height and width of binary tree using multiple approaches
 *              including recursive, iterative, and optimized solutions
 * 
 * Learning objectives:
 * - Understand tree height vs depth concepts and calculations
 * - Learn level-order traversal for width calculations
 * - Practice recursive vs iterative tree algorithms
 * - Optimize for both time and space complexity
 * 
 * Real-world applications:
 * - Database B-tree optimization and balancing
 * - UI component tree layout calculations
 * - File system directory structure analysis
 * - Decision tree depth analysis in machine learning
 * - Game tree pruning and minimax algorithms
 * 
 * Time Complexity: O(n) for both height and width calculations
 * Space Complexity: O(h) for recursion, O(w) for BFS queue where h=height, w=max width
 */

// =======================
// Binary Tree Node Definition
// =======================

/**
 * Binary Tree Node class with enhanced utility methods
 * Standard binary tree node with additional helper methods
 */
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
  
  /**
   * Check if this node is a leaf
   * @returns {boolean} True if node has no children
   */
  isLeaf() {
    return this.left === null && this.right === null;
  }
  
  /**
   * Get immediate children count
   * @returns {number} Number of direct children (0, 1, or 2)
   */
  getChildCount() {
    let count = 0;
    if (this.left !== null) count++;
    if (this.right !== null) count++;
    return count;
  }
  
  /**
   * Get non-null children as array
   * @returns {TreeNode[]} Array of existing child nodes
   */
  getChildren() {
    const children = [];
    if (this.left !== null) children.push(this.left);
    if (this.right !== null) children.push(this.right);
    return children;
  }
}

// =======================
// Approach 1: Height Calculation Methods
// =======================

/**
 * Calculate tree height using recursive depth-first search
 * Height is the number of edges in the longest path from root to leaf
 * 
 * Definition: Height of empty tree = -1, single node = 0
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Height of the tree
 */
function getTreeHeightRecursive(root) {
  // Base case: empty tree has height -1
  if (root === null) {
    return -1;
  }
  
  // Base case: leaf node has height 0
  if (root.isLeaf()) {
    return 0;
  }
  
  // Recursive case: height = 1 + max(left_height, right_height)
  const leftHeight = getTreeHeightRecursive(root.left);
  const rightHeight = getTreeHeightRecursive(root.right);
  
  return 1 + Math.max(leftHeight, rightHeight);
}

/**
 * Alternative height definition: number of nodes in longest path
 * Some definitions count nodes instead of edges
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Height counting nodes (empty = 0, single node = 1)
 */
function getTreeHeightNodes(root) {
  if (root === null) {
    return 0;
  }
  
  const leftHeight = getTreeHeightNodes(root.left);
  const rightHeight = getTreeHeightNodes(root.right);
  
  return 1 + Math.max(leftHeight, rightHeight);
}

/**
 * Calculate tree height using iterative level-order traversal
 * Uses BFS to traverse level by level and count levels
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Height of the tree
 */
function getTreeHeightIterative(root) {
  if (root === null) {
    return -1;
  }
  
  const queue = [root];
  let height = -1;
  
  // Process tree level by level
  while (queue.length > 0) {
    const levelSize = queue.length;
    height++; // Increment height for each level
    
    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const currentNode = queue.shift();
      
      // Add children to queue for next level
      if (currentNode.left !== null) {
        queue.push(currentNode.left);
      }
      if (currentNode.right !== null) {
        queue.push(currentNode.right);
      }
    }
  }
  
  return height;
}

/**
 * Calculate tree height using stack-based DFS
 * Alternative iterative approach using explicit stack
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Height of the tree
 */
function getTreeHeightStack(root) {
  if (root === null) {
    return -1;
  }
  
  // Stack stores [node, depth] pairs
  const stack = [[root, 0]];
  let maxDepth = 0;
  
  while (stack.length > 0) {
    const [currentNode, depth] = stack.pop();
    maxDepth = Math.max(maxDepth, depth);
    
    // Add children with incremented depth
    if (currentNode.right !== null) {
      stack.push([currentNode.right, depth + 1]);
    }
    if (currentNode.left !== null) {
      stack.push([currentNode.left, depth + 1]);
    }
  }
  
  return maxDepth;
}

// =======================
// Approach 2: Width Calculation Methods
// =======================

/**
 * Calculate maximum width of binary tree using level-order traversal
 * Width is the maximum number of nodes at any level
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Maximum width of the tree
 */
function getTreeWidthBFS(root) {
  if (root === null) {
    return 0;
  }
  
  const queue = [root];
  let maxWidth = 0;
  
  while (queue.length > 0) {
    const currentLevelSize = queue.length;
    maxWidth = Math.max(maxWidth, currentLevelSize);
    
    // Process all nodes at current level
    for (let i = 0; i < currentLevelSize; i++) {
      const currentNode = queue.shift();
      
      // Add children for next level
      if (currentNode.left !== null) {
        queue.push(currentNode.left);
      }
      if (currentNode.right !== null) {
        queue.push(currentNode.right);
      }
    }
  }
  
  return maxWidth;
}

/**
 * Calculate tree width with detailed level information
 * Returns width of each level along with maximum width
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {Object} Object containing max width and level details
 */
function getTreeWidthDetailed(root) {
  if (root === null) {
    return {
      maxWidth: 0,
      levels: [],
      height: -1
    };
  }
  
  const queue = [root];
  const levels = [];
  let levelIndex = 0;
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelNodes = [];
    
    // Process current level
    for (let i = 0; i < levelSize; i++) {
      const currentNode = queue.shift();
      levelNodes.push(currentNode.val);
      
      // Add children for next level
      if (currentNode.left !== null) {
        queue.push(currentNode.left);
      }
      if (currentNode.right !== null) {
        queue.push(currentNode.right);
      }
    }
    
    levels.push({
      level: levelIndex,
      width: levelSize,
      nodes: levelNodes
    });
    
    levelIndex++;
  }
  
  const maxWidth = Math.max(...levels.map(level => level.width));
  
  return {
    maxWidth,
    levels,
    height: levels.length - 1
  };
}

/**
 * Calculate tree width considering null nodes (positional width)
 * Uses position-based calculation to handle sparse trees accurately
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Maximum positional width considering null spaces
 */
function getTreeWidthPositional(root) {
  if (root === null) {
    return 0;
  }
  
  // Queue stores [node, position] pairs
  const queue = [[root, 0]];
  let maxWidth = 0;
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    let minPos = Infinity;
    let maxPos = -Infinity;
    
    // Process current level and track position range
    for (let i = 0; i < levelSize; i++) {
      const [currentNode, pos] = queue.shift();
      
      minPos = Math.min(minPos, pos);
      maxPos = Math.max(maxPos, pos);
      
      // Add children with calculated positions
      if (currentNode.left !== null) {
        queue.push([currentNode.left, pos * 2]);
      }
      if (currentNode.right !== null) {
        queue.push([currentNode.right, pos * 2 + 1]);
      }
    }
    
    // Width = difference between max and min positions + 1
    if (minPos !== Infinity) {
      maxWidth = Math.max(maxWidth, maxPos - minPos + 1);
    }
  }
  
  return maxWidth;
}

// =======================
// Approach 3: Combined Dimension Calculation
// =======================

/**
 * Calculate both height and width in a single traversal
 * Optimized approach that computes both metrics efficiently
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {Object} Object containing both height and width information
 */
function getTreeDimensions(root) {
  if (root === null) {
    return {
      height: -1,
      width: 0,
      nodeCount: 0,
      leafCount: 0,
      levels: []
    };
  }
  
  const queue = [root];
  const levels = [];
  let height = -1;
  let maxWidth = 0;
  let totalNodes = 0;
  let leafCount = 0;
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelNodes = [];
    let levelLeaves = 0;
    
    height++; // Increment height for each level
    maxWidth = Math.max(maxWidth, levelSize);
    totalNodes += levelSize;
    
    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const currentNode = queue.shift();
      levelNodes.push({
        value: currentNode.val,
        hasLeft: currentNode.left !== null,
        hasRight: currentNode.right !== null,
        isLeaf: currentNode.isLeaf()
      });
      
      if (currentNode.isLeaf()) {
        levelLeaves++;
        leafCount++;
      }
      
      // Add children for next level
      if (currentNode.left !== null) {
        queue.push(currentNode.left);
      }
      if (currentNode.right !== null) {
        queue.push(currentNode.right);
      }
    }
    
    levels.push({
      level: height,
      width: levelSize,
      leafCount: levelLeaves,
      nodes: levelNodes
    });
  }
  
  return {
    height,
    width: maxWidth,
    nodeCount: totalNodes,
    leafCount,
    levels,
    // Additional computed properties
    internalNodeCount: totalNodes - leafCount,
    averageWidth: totalNodes / (height + 1),
    isBalanced: checkIfBalanced(root),
    isComplete: checkIfComplete(root),
    isPerfect: checkIfPerfect(root, height)
  };
}

/**
 * Check if tree is height-balanced (AVL property)
 * Height difference between left and right subtrees ≤ 1
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is balanced
 */
function checkIfBalanced(root) {
  function getHeightAndBalance(node) {
    if (node === null) {
      return { height: -1, isBalanced: true };
    }
    
    const left = getHeightAndBalance(node.left);
    const right = getHeightAndBalance(node.right);
    
    const height = 1 + Math.max(left.height, right.height);
    const heightDiff = Math.abs(left.height - right.height);
    const isBalanced = left.isBalanced && right.isBalanced && heightDiff <= 1;
    
    return { height, isBalanced };
  }
  
  return getHeightAndBalance(root).isBalanced;
}

/**
 * Check if tree is complete (all levels filled except possibly last)
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is complete
 */
function checkIfComplete(root) {
  if (root === null) return true;
  
  const queue = [root];
  let foundNullNode = false;
  
  while (queue.length > 0) {
    const currentNode = queue.shift();
    
    if (currentNode === null) {
      foundNullNode = true;
    } else {
      // If we previously found a null but now have a non-null, tree is not complete
      if (foundNullNode) {
        return false;
      }
      
      queue.push(currentNode.left);
      queue.push(currentNode.right);
    }
  }
  
  return true;
}

/**
 * Check if tree is perfect (all internal nodes have 2 children, all leaves at same level)
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @param {number} height - Height of the tree
 * @returns {boolean} True if tree is perfect
 */
function checkIfPerfect(root, height) {
  function checkPerfect(node, depth, leafDepth) {
    if (node === null) return true;
    
    if (node.isLeaf()) {
      return depth === leafDepth;
    }
    
    if (node.left === null || node.right === null) {
      return false;
    }
    
    return checkPerfect(node.left, depth + 1, leafDepth) &&
           checkPerfect(node.right, depth + 1, leafDepth);
  }
  
  return checkPerfect(root, 0, height);
}

// =======================
// Approach 4: Advanced Width Calculations
// =======================

/**
 * Calculate diameter of the tree (longest path between any two nodes)
 * Diameter may or may not pass through the root
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {number} Diameter of the tree
 */
function getTreeDiameter(root) {
  let maxDiameter = 0;
  
  function getHeight(node) {
    if (node === null) return 0;
    
    const leftHeight = getHeight(node.left);
    const rightHeight = getHeight(node.right);
    
    // Diameter through current node = left height + right height
    const currentDiameter = leftHeight + rightHeight;
    maxDiameter = Math.max(maxDiameter, currentDiameter);
    
    // Return height of current subtree
    return 1 + Math.max(leftHeight, rightHeight);
  }
  
  getHeight(root);
  return maxDiameter;
}

/**
 * Calculate tree width at specific level
 * Returns width of the tree at a given level (0-indexed)
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @param {number} targetLevel - Level to measure width (0 = root level)
 * @returns {number} Width at the specified level
 */
function getWidthAtLevel(root, targetLevel) {
  if (root === null || targetLevel < 0) {
    return 0;
  }
  
  const queue = [[root, 0]]; // [node, level]
  let count = 0;
  
  while (queue.length > 0) {
    const [currentNode, currentLevel] = queue.shift();
    
    if (currentLevel === targetLevel) {
      count++;
    } else if (currentLevel < targetLevel) {
      // Only add children if we haven't reached target level
      if (currentNode.left !== null) {
        queue.push([currentNode.left, currentLevel + 1]);
      }
      if (currentNode.right !== null) {
        queue.push([currentNode.right, currentLevel + 1]);
      }
    }
    // Skip nodes beyond target level
  }
  
  return count;
}

/**
 * Get all paths from root to leaves with their lengths
 * Useful for analyzing tree structure and balance
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {Array} Array of path objects with lengths and node values
 */
function getAllRootToLeafPaths(root) {
  const paths = [];
  
  function findPaths(node, currentPath) {
    if (node === null) return;
    
    currentPath.push(node.val);
    
    if (node.isLeaf()) {
      // Found a leaf, record the path
      paths.push({
        path: [...currentPath],
        length: currentPath.length,
        pathSum: currentPath.reduce((sum, val) => sum + val, 0)
      });
    } else {
      // Continue exploring children
      findPaths(node.left, currentPath);
      findPaths(node.right, currentPath);
    }
    
    // Backtrack
    currentPath.pop();
  }
  
  findPaths(root, []);
  
  return paths.sort((a, b) => a.length - b.length); // Sort by path length
}

// =======================
// Tree Building and Utility Functions
// =======================

/**
 * Build tree from array representation (level-order)
 * 
 * @param {Array} arr - Array representation with null for missing nodes
 * @returns {TreeNode|null} Root of constructed tree
 */
function buildTreeFromArray(arr) {
  if (!arr || arr.length === 0 || arr[0] === null) {
    return null;
  }
  
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  
  while (queue.length > 0 && i < arr.length) {
    const currentNode = queue.shift();
    
    // Add left child
    if (i < arr.length && arr[i] !== null) {
      currentNode.left = new TreeNode(arr[i]);
      queue.push(currentNode.left);
    }
    i++;
    
    // Add right child
    if (i < arr.length && arr[i] !== null) {
      currentNode.right = new TreeNode(arr[i]);
      queue.push(currentNode.right);
    }
    i++;
  }
  
  return root;
}

/**
 * Create sample trees for testing
 * Provides various tree configurations for comprehensive testing
 * 
 * @returns {Object} Object containing sample trees
 */
function createSampleTrees() {
  return {
    // Empty tree
    empty: null,
    
    // Single node
    single: new TreeNode(1),
    
    // Balanced tree
    balanced: buildTreeFromArray([1, 2, 3, 4, 5, 6, 7]),
    
    // Left-skewed tree
    leftSkewed: (() => {
      let root = new TreeNode(1);
      let current = root;
      for (let i = 2; i <= 5; i++) {
        current.left = new TreeNode(i);
        current = current.left;
      }
      return root;
    })(),
    
    // Right-skewed tree
    rightSkewed: (() => {
      let root = new TreeNode(1);
      let current = root;
      for (let i = 2; i <= 5; i++) {
        current.right = new TreeNode(i);
        current = current.right;
      }
      return root;
    })(),
    
    // Perfect binary tree
    perfect: buildTreeFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
    
    // Complete but not perfect
    complete: buildTreeFromArray([1, 2, 3, 4, 5, 6, null, 8, 9, 10]),
    
    // Sparse tree (wide but not deep)
    sparse: buildTreeFromArray([1, null, 2, null, null, null, 3, null, null, null, null, null, null, null, 4]),
    
    // Complex unbalanced tree
    unbalanced: buildTreeFromArray([1, 2, 3, 4, 5, null, 6, 7, null, null, 8, null, null, null, 9, 10])
  };
}

/**
 * Visualize tree with dimensions
 * Creates ASCII representation showing structure and dimensions
 * 
 * @param {TreeNode} root - Root of tree to visualize
 * @returns {string} ASCII representation with dimension info
 */
function visualizeTreeWithDimensions(root) {
  const dimensions = getTreeDimensions(root);
  
  let output = `Tree Dimensions:\n`;
  output += `  Height: ${dimensions.height}\n`;
  output += `  Width: ${dimensions.width}\n`;
  output += `  Node Count: ${dimensions.nodeCount}\n`;
  output += `  Leaf Count: ${dimensions.leafCount}\n`;
  output += `  Is Balanced: ${dimensions.isBalanced}\n`;
  output += `  Is Complete: ${dimensions.isComplete}\n`;
  output += `  Is Perfect: ${dimensions.isPerfect}\n\n`;
  
  output += `Level Structure:\n`;
  dimensions.levels.forEach(level => {
    const nodeValues = level.nodes.map(node => node.value).join(', ');
    output += `  Level ${level.level}: [${nodeValues}] (width: ${level.width}, leaves: ${level.leafCount})\n`;
  });
  
  return output;
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic dimension calculations
 * Demonstrates fundamental height and width calculations
 */
function demonstrateBasicDimensions() {
  console.log('=== Basic Tree Dimensions ===\n');
  
  const samples = createSampleTrees();
  const testTrees = [
    { name: 'Empty Tree', tree: samples.empty },
    { name: 'Single Node', tree: samples.single },
    { name: 'Balanced Tree', tree: samples.balanced },
    { name: 'Left Skewed', tree: samples.leftSkewed },
    { name: 'Perfect Tree', tree: samples.perfect }
  ];
  
  testTrees.forEach(({ name, tree }) => {
    console.log(`--- ${name} ---`);
    
    const height1 = getTreeHeightRecursive(tree);
    const height2 = getTreeHeightIterative(tree);
    const width = getTreeWidthBFS(tree);
    const diameter = getTreeDiameter(tree);
    
    console.log(`Height (recursive): ${height1}`);
    console.log(`Height (iterative): ${height2}`);
    console.log(`Width: ${width}`);
    console.log(`Diameter: ${diameter}`);
    console.log(`Consistent heights: ${height1 === height2 ? '✅' : '❌'}`);
    console.log('');
  });
}

/**
 * Example 2: Comprehensive tree analysis
 * Shows detailed dimension analysis with tree properties
 */
function demonstrateComprehensiveAnalysis() {
  console.log('=== Comprehensive Tree Analysis ===\n');
  
  const samples = createSampleTrees();
  const testTrees = [
    { name: 'Perfect Binary Tree', tree: samples.perfect },
    { name: 'Unbalanced Tree', tree: samples.unbalanced }
  ];
  
  testTrees.forEach(({ name, tree }) => {
    console.log(`--- ${name} ---`);
    console.log(visualizeTreeWithDimensions(tree));
    
    // Additional analysis
    const paths = getAllRootToLeafPaths(tree);
    console.log('Root-to-leaf paths:');
    paths.forEach((pathInfo, index) => {
      console.log(`  Path ${index + 1}: [${pathInfo.path.join(' → ')}] (length: ${pathInfo.length})`);
    });
    
    console.log('');
  });
}

/**
 * Example 3: Performance comparison of different methods
 * Benchmarks various approaches on different tree sizes
 */
function demonstratePerformanceComparison() {
  console.log('=== Performance Comparison ===\n');
  
  // Create trees of different sizes
  const createBalancedTree = (depth) => {
    const size = Math.pow(2, depth + 1) - 1;
    const arr = Array.from({ length: size }, (_, i) => i + 1);
    return buildTreeFromArray(arr);
  };
  
  const testSizes = [
    { name: 'Small (depth 3)', tree: createBalancedTree(3) },
    { name: 'Medium (depth 8)', tree: createBalancedTree(8) },
    { name: 'Large (depth 12)', tree: createBalancedTree(12) }
  ];
  
  const heightMethods = [
    { name: 'Recursive', fn: getTreeHeightRecursive },
    { name: 'Iterative BFS', fn: getTreeHeightIterative },
    { name: 'Stack DFS', fn: getTreeHeightStack }
  ];
  
  const widthMethods = [
    { name: 'BFS Width', fn: getTreeWidthBFS },
    { name: 'Positional Width', fn: getTreeWidthPositional }
  ];
  
  testSizes.forEach(({ name, tree }) => {
    console.log(`--- ${name} ---`);
    
    console.log('Height Methods:');
    heightMethods.forEach(({ name: methodName, fn }) => {
      const startTime = performance.now();
      const result = fn(tree);
      const endTime = performance.now();
      console.log(`  ${methodName}: ${result} (${(endTime - startTime).toFixed(4)}ms)`);
    });
    
    console.log('Width Methods:');
    widthMethods.forEach(({ name: methodName, fn }) => {
      const startTime = performance.now();
      const result = fn(tree);
      const endTime = performance.now();
      console.log(`  ${methodName}: ${result} (${(endTime - startTime).toFixed(4)}ms)`);
    });
    
    console.log('');
  });
}

/**
 * Example 4: Level-specific analysis
 * Demonstrates width calculations at specific levels
 */
function demonstrateLevelAnalysis() {
  console.log('=== Level-specific Analysis ===\n');
  
  const tree = createSampleTrees().perfect;
  const dimensions = getTreeDimensions(tree);
  
  console.log('Perfect Binary Tree Level Analysis:');
  console.log(`Total Height: ${dimensions.height}`);
  console.log(`Max Width: ${dimensions.width}\n`);
  
  console.log('Width at each level:');
  for (let level = 0; level <= dimensions.height; level++) {
    const width = getWidthAtLevel(tree, level);
    const expected = Math.pow(2, level); // Expected for perfect tree
    const matches = width === expected;
    console.log(`  Level ${level}: ${width} nodes ${matches ? '✅' : '❌'} (expected: ${expected})`);
  }
  
  console.log('\nDetailed level information:');
  const detailed = getTreeWidthDetailed(tree);
  detailed.levels.forEach(level => {
    console.log(`  Level ${level.level}: width=${level.width}, nodes=[${level.nodes.join(', ')}]`);
  });
}

// Export all implementations and utilities
module.exports = {
  TreeNode,
  getTreeHeightRecursive,
  getTreeHeightNodes,
  getTreeHeightIterative,
  getTreeHeightStack,
  getTreeWidthBFS,
  getTreeWidthDetailed,
  getTreeWidthPositional,
  getTreeDimensions,
  getTreeDiameter,
  getWidthAtLevel,
  getAllRootToLeafPaths,
  buildTreeFromArray,
  createSampleTrees,
  visualizeTreeWithDimensions,
  demonstrateBasicDimensions,
  demonstrateComprehensiveAnalysis,
  demonstratePerformanceComparison,
  demonstrateLevelAnalysis
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Binary Tree Dimensions Calculator\n');
  console.log('This module demonstrates various approaches to calculating');
  console.log('height, width, and other dimensions of binary trees.\n');
  
  demonstrateBasicDimensions();
  
  setTimeout(() => {
    console.log('='.repeat(60) + '\n');
    demonstrateComprehensiveAnalysis();
  }, 1000);
  
  setTimeout(() => {
    console.log('='.repeat(60) + '\n');
    demonstratePerformanceComparison();
  }, 2000);
  
  setTimeout(() => {
    console.log('='.repeat(60) + '\n');
    demonstrateLevelAnalysis();
  }, 3000);
}