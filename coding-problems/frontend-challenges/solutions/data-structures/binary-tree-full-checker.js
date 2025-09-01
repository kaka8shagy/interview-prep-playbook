/**
 * File: binary-tree-full-checker.js
 * Description: Check if a binary tree is full (every node has either 0 or 2 children)
 *              with multiple approaches including recursive, iterative, and optimized solutions
 * 
 * Learning objectives:
 * - Understand binary tree properties and terminology
 * - Learn different tree traversal techniques (DFS, BFS)
 * - Practice recursive vs iterative algorithm design
 * - Handle edge cases and null tree scenarios
 * 
 * Real-world applications:
 * - Tree structure validation in compilers and parsers
 * - Data structure integrity checking in databases
 * - Game tree analysis (chess, tic-tac-toe decision trees)
 * - Hierarchical data validation (org charts, file systems)
 * - Expression tree validation in mathematical computations
 * 
 * Time Complexity: O(n) where n is the number of nodes
 * Space Complexity: O(h) for recursion stack or O(w) for BFS queue, where h is height, w is width
 */

// =======================
// Binary Tree Node Definition
// =======================

/**
 * Binary Tree Node class
 * Standard binary tree node with left and right children
 */
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
  
  /**
   * Check if this node is a leaf (has no children)
   * @returns {boolean} True if node is a leaf
   */
  isLeaf() {
    return this.left === null && this.right === null;
  }
  
  /**
   * Check if this node has exactly two children
   * @returns {boolean} True if node has both children
   */
  hasFullChildren() {
    return this.left !== null && this.right !== null;
  }
  
  /**
   * Check if this node violates the full tree property
   * @returns {boolean} True if node has exactly one child (violation)
   */
  violatesFullProperty() {
    return (this.left === null && this.right !== null) ||
           (this.left !== null && this.right === null);
  }
}

// =======================
// Approach 1: Recursive DFS Solution
// =======================

/**
 * Check if binary tree is full using recursive depth-first search
 * A full binary tree has all nodes with either 0 or 2 children
 * 
 * Key insight: We only need to find one node with exactly 1 child to disprove fullness
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is full, false otherwise
 */
function isFullBinaryTreeRecursive(root) {
  // Base case: empty tree is considered full
  if (root === null) {
    return true;
  }
  
  // Base case: leaf node is valid in a full tree
  if (root.isLeaf()) {
    return true;
  }
  
  // Check if current node violates full property
  // Node must have either 0 children (leaf) or 2 children
  if (root.violatesFullProperty()) {
    return false;
  }
  
  // Recursively check both subtrees
  // Both subtrees must be full for entire tree to be full
  return isFullBinaryTreeRecursive(root.left) && 
         isFullBinaryTreeRecursive(root.right);
}

/**
 * Alternative recursive implementation with explicit condition checking
 * More verbose but shows the logic step-by-step
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is full
 */
function isFullBinaryTreeRecursiveVerbose(root) {
  // Helper function that returns detailed information about tree validity
  function checkFullnessRecursive(node) {
    // Empty subtree is considered full
    if (node === null) {
      return { isFull: true, reason: 'empty subtree' };
    }
    
    // Leaf node is always valid in a full tree
    if (node.left === null && node.right === null) {
      return { isFull: true, reason: 'leaf node' };
    }
    
    // Node with exactly one child violates full property
    if (node.left === null || node.right === null) {
      return { 
        isFull: false, 
        reason: `node ${node.val} has only one child`,
        violatingNode: node.val
      };
    }
    
    // Node has both children, check recursively
    const leftResult = checkFullnessRecursive(node.left);
    const rightResult = checkFullnessRecursive(node.right);
    
    // If either subtree is not full, entire tree is not full
    if (!leftResult.isFull) {
      return leftResult; // Propagate the error from left subtree
    }
    
    if (!rightResult.isFull) {
      return rightResult; // Propagate the error from right subtree
    }
    
    // Both subtrees are full
    return { isFull: true, reason: `node ${node.val} and subtrees are full` };
  }
  
  const result = checkFullnessRecursive(root);
  
  // Log detailed result if in debug mode
  if (typeof console !== 'undefined' && console.debug) {
    console.debug('Full tree check result:', result);
  }
  
  return result.isFull;
}

// =======================
// Approach 2: Iterative BFS Solution
// =======================

/**
 * Check if binary tree is full using iterative breadth-first search
 * Uses a queue to traverse the tree level by level
 * 
 * Advantage: Avoids recursion stack overflow for very deep trees
 * Disadvantage: Uses more memory for the queue in wide trees
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is full
 */
function isFullBinaryTreeIterative(root) {
  // Empty tree is considered full
  if (root === null) {
    return true;
  }
  
  // Use queue for BFS traversal
  const queue = [root];
  
  while (queue.length > 0) {
    const currentNode = queue.shift();
    
    // Check if current node violates full property
    const leftChild = currentNode.left;
    const rightChild = currentNode.right;
    
    // Node with exactly one child violates full tree property
    if ((leftChild === null && rightChild !== null) ||
        (leftChild !== null && rightChild === null)) {
      return false;
    }
    
    // Add children to queue for further processing
    if (leftChild !== null) {
      queue.push(leftChild);
    }
    
    if (rightChild !== null) {
      queue.push(rightChild);
    }
  }
  
  // All nodes have been checked and none violate the full property
  return true;
}

/**
 * Enhanced iterative solution with detailed tracking
 * Provides additional information about the tree structure
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {Object} Detailed result with tree statistics
 */
function isFullBinaryTreeIterativeEnhanced(root) {
  const result = {
    isFull: true,
    nodeCount: 0,
    leafCount: 0,
    internalNodeCount: 0,
    maxDepth: 0,
    violatingNodes: [],
    treeStructure: []
  };
  
  // Empty tree case
  if (root === null) {
    result.reason = 'Empty tree is considered full';
    return result;
  }
  
  // BFS with level tracking
  const queue = [{ node: root, depth: 0 }];
  let currentLevel = [];
  let currentDepth = 0;
  
  while (queue.length > 0) {
    const { node: currentNode, depth } = queue.shift();
    
    // Update statistics
    result.nodeCount++;
    result.maxDepth = Math.max(result.maxDepth, depth);
    
    // Track level structure
    if (depth !== currentDepth) {
      if (currentLevel.length > 0) {
        result.treeStructure.push([...currentLevel]);
      }
      currentLevel = [];
      currentDepth = depth;
    }
    currentLevel.push(currentNode.val);
    
    const leftChild = currentNode.left;
    const rightChild = currentNode.right;
    
    // Check fullness property
    if (leftChild === null && rightChild === null) {
      // Leaf node - valid
      result.leafCount++;
      
    } else if (leftChild !== null && rightChild !== null) {
      // Internal node with both children - valid
      result.internalNodeCount++;
      queue.push({ node: leftChild, depth: depth + 1 });
      queue.push({ node: rightChild, depth: depth + 1 });
      
    } else {
      // Node with exactly one child - violation
      result.isFull = false;
      result.violatingNodes.push({
        nodeValue: currentNode.val,
        depth: depth,
        hasLeft: leftChild !== null,
        hasRight: rightChild !== null,
        reason: 'Has exactly one child'
      });
      
      // Continue processing to find all violations
      if (leftChild !== null) {
        queue.push({ node: leftChild, depth: depth + 1 });
      }
      if (rightChild !== null) {
        queue.push({ node: rightChild, depth: depth + 1 });
      }
    }
  }
  
  // Add final level
  if (currentLevel.length > 0) {
    result.treeStructure.push(currentLevel);
  }
  
  return result;
}

// =======================
// Approach 3: Early Termination Optimized Solution
// =======================

/**
 * Optimized solution that terminates as soon as a violation is found
 * Uses DFS with early termination for best average-case performance
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is full
 */
function isFullBinaryTreeOptimized(root) {
  /**
   * Internal recursive helper with early termination
   * Returns false immediately when violation is found
   * 
   * @param {TreeNode} node - Current node to check
   * @returns {boolean} False if violation found, true otherwise
   */
  function checkNodeOptimized(node) {
    // Base cases
    if (node === null) return true;
    if (node.isLeaf()) return true;
    
    // Early termination: return false immediately on violation
    if (node.violatesFullProperty()) {
      return false;
    }
    
    // Short-circuit evaluation: if left subtree fails, don't check right
    return checkNodeOptimized(node.left) && checkNodeOptimized(node.right);
  }
  
  return checkNodeOptimized(root);
}

/**
 * Stack-based iterative solution with early termination
 * Combines benefits of iterative approach with early termination
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is full
 */
function isFullBinaryTreeStackOptimized(root) {
  if (root === null) return true;
  
  // Use stack for DFS traversal (more memory efficient than queue for deep trees)
  const stack = [root];
  
  while (stack.length > 0) {
    const currentNode = stack.pop();
    
    // Early termination check
    if (currentNode.violatesFullProperty()) {
      return false;
    }
    
    // Add children to stack (right first so left is processed first)
    if (currentNode.right !== null) {
      stack.push(currentNode.right);
    }
    if (currentNode.left !== null) {
      stack.push(currentNode.left);
    }
  }
  
  return true;
}

// =======================
// Approach 4: Mathematical Property-Based Solution
// =======================

/**
 * Solution based on mathematical properties of full binary trees
 * Uses the relationship between nodes, leaves, and internal nodes
 * 
 * In a full binary tree:
 * - Number of leaves = Number of internal nodes + 1
 * - Total nodes = 2 * leaves - 1
 * 
 * @param {TreeNode} root - Root of the binary tree
 * @returns {boolean} True if tree is full
 */
function isFullBinaryTreeMathematical(root) {
  if (root === null) return true;
  
  /**
   * Count nodes by type in the tree
   * @param {TreeNode} node - Current node
   * @returns {Object} Counts of different node types
   */
  function countNodes(node) {
    if (node === null) {
      return { total: 0, leaves: 0, internal: 0, singleChild: 0 };
    }
    
    const leftCounts = countNodes(node.left);
    const rightCounts = countNodes(node.right);
    
    // If we find any nodes with single child, tree is not full
    if (leftCounts.singleChild > 0 || rightCounts.singleChild > 0) {
      return { total: 0, leaves: 0, internal: 0, singleChild: 1 };
    }
    
    let nodeType = { total: 0, leaves: 0, internal: 0, singleChild: 0 };
    
    if (node.isLeaf()) {
      nodeType.leaves = 1;
    } else if (node.hasFullChildren()) {
      nodeType.internal = 1;
    } else {
      // Node has exactly one child - violation
      nodeType.singleChild = 1;
    }
    
    return {
      total: 1 + leftCounts.total + rightCounts.total,
      leaves: nodeType.leaves + leftCounts.leaves + rightCounts.leaves,
      internal: nodeType.internal + leftCounts.internal + rightCounts.internal,
      singleChild: nodeType.singleChild + leftCounts.singleChild + rightCounts.singleChild
    };
  }
  
  const counts = countNodes(root);
  
  // If any node has single child, tree is not full
  if (counts.singleChild > 0) {
    return false;
  }
  
  // Verify mathematical property of full binary trees
  // In a full binary tree: leaves = internal nodes + 1
  const expectedLeaves = counts.internal + 1;
  const expectedTotal = 2 * counts.leaves - 1;
  
  return counts.leaves === expectedLeaves && counts.total === expectedTotal;
}

// =======================
// Tree Building Utilities
// =======================

/**
 * Build a binary tree from array representation
 * Uses level-order insertion with null values for missing nodes
 * 
 * @param {Array} arr - Array representation of the tree (null for missing nodes)
 * @returns {TreeNode|null} Root of the constructed tree
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
 * Visualize binary tree structure
 * Creates a string representation of the tree for debugging
 * 
 * @param {TreeNode} root - Root of the tree to visualize
 * @returns {string} String representation of the tree
 */
function visualizeTree(root) {
  if (root === null) {
    return 'Empty tree';
  }
  
  const levels = [];
  const queue = [{ node: root, depth: 0 }];
  
  while (queue.length > 0) {
    const { node, depth } = queue.shift();
    
    if (!levels[depth]) {
      levels[depth] = [];
    }
    
    levels[depth].push(node.val);
    
    if (node.left !== null) {
      queue.push({ node: node.left, depth: depth + 1 });
    }
    if (node.right !== null) {
      queue.push({ node: node.right, depth: depth + 1 });
    }
  }
  
  return levels.map((level, depth) => `Level ${depth}: ${level.join(', ')}`).join('\n');
}

/**
 * Create sample trees for testing
 * Provides various tree configurations for comprehensive testing
 * 
 * @returns {Object} Object containing sample trees
 */
function createSampleTrees() {
  return {
    // Full binary tree
    fullTree: buildTreeFromArray([1, 2, 3, 4, 5, 6, 7]),
    
    // Not full - node 2 has only left child
    notFullSingleChild: buildTreeFromArray([1, 2, 3, 4, null, 6, 7]),
    
    // Single node (considered full)
    singleNode: new TreeNode(42),
    
    // Empty tree
    emptyTree: null,
    
    // Complex full tree
    complexFull: buildTreeFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
    
    // Tree with multiple violations
    multipleViolations: buildTreeFromArray([1, 2, 3, 4, null, null, 7, 8, null, null, null, null, null, null, 15]),
    
    // Deep tree (only left children - not full)
    deepNotFull: (() => {
      let root = new TreeNode(1);
      let current = root;
      for (let i = 2; i <= 10; i++) {
        current.left = new TreeNode(i);
        current = current.left;
      }
      return root;
    })(),
    
    // Perfect binary tree (also full)
    perfectTree: buildTreeFromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  };
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic full tree validation
 * Demonstrates core functionality with simple examples
 */
function demonstrateBasicValidation() {
  console.log('=== Basic Full Tree Validation ===\n');
  
  const samples = createSampleTrees();
  
  // Test different tree configurations
  const testCases = [
    { name: 'Full Tree', tree: samples.fullTree },
    { name: 'Not Full (Single Child)', tree: samples.notFullSingleChild },
    { name: 'Single Node', tree: samples.singleNode },
    { name: 'Empty Tree', tree: samples.emptyTree },
    { name: 'Complex Full Tree', tree: samples.complexFull }
  ];
  
  testCases.forEach(({ name, tree }) => {
    console.log(`\n--- Testing: ${name} ---`);
    console.log('Tree structure:');
    console.log(visualizeTree(tree));
    
    // Test with different algorithms
    const recursive = isFullBinaryTreeRecursive(tree);
    const iterative = isFullBinaryTreeIterative(tree);
    const optimized = isFullBinaryTreeOptimized(tree);
    
    console.log(`\nResults:`);
    console.log(`  Recursive: ${recursive}`);
    console.log(`  Iterative: ${iterative}`);
    console.log(`  Optimized: ${optimized}`);
    
    // Verify all algorithms agree
    if (recursive === iterative && iterative === optimized) {
      console.log(`  ✅ All algorithms agree: ${recursive}`);
    } else {
      console.log(`  ❌ Algorithms disagree!`);
    }
  });
}

/**
 * Example 2: Enhanced analysis with detailed reporting
 * Shows comprehensive tree analysis capabilities
 */
function demonstrateEnhancedAnalysis() {
  console.log('=== Enhanced Tree Analysis ===\n');
  
  const samples = createSampleTrees();
  
  const testTrees = [
    { name: 'Full Tree', tree: samples.fullTree },
    { name: 'Multiple Violations', tree: samples.multipleViolations }
  ];
  
  testTrees.forEach(({ name, tree }) => {
    console.log(`\n--- Enhanced Analysis: ${name} ---`);
    
    const analysis = isFullBinaryTreeIterativeEnhanced(tree);
    
    console.log('Detailed Analysis:');
    console.log(`  Is Full: ${analysis.isFull}`);
    console.log(`  Node Count: ${analysis.nodeCount}`);
    console.log(`  Leaf Count: ${analysis.leafCount}`);
    console.log(`  Internal Node Count: ${analysis.internalNodeCount}`);
    console.log(`  Max Depth: ${analysis.maxDepth}`);
    
    if (analysis.violatingNodes.length > 0) {
      console.log('  Violations Found:');
      analysis.violatingNodes.forEach(violation => {
        console.log(`    Node ${violation.nodeValue} at depth ${violation.depth}: ${violation.reason}`);
        console.log(`      Has left: ${violation.hasLeft}, Has right: ${violation.hasRight}`);
      });
    }
    
    console.log('  Tree Structure by Level:');
    analysis.treeStructure.forEach((level, index) => {
      console.log(`    Level ${index}: [${level.join(', ')}]`);
    });
  });
}

/**
 * Example 3: Performance comparison of different approaches
 * Benchmarks various algorithms on different tree sizes
 */
function demonstratePerformanceComparison() {
  console.log('=== Performance Comparison ===\n');
  
  // Create trees of different sizes
  const createLargeFullTree = (depth) => {
    if (depth === 0) return null;
    
    const root = new TreeNode(1);
    const queue = [root];
    let nodeValue = 2;
    let currentDepth = 1;
    
    while (currentDepth < depth && queue.length > 0) {
      const levelSize = queue.length;
      
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        
        node.left = new TreeNode(nodeValue++);
        node.right = new TreeNode(nodeValue++);
        
        queue.push(node.left);
        queue.push(node.right);
      }
      
      currentDepth++;
    }
    
    return root;
  };
  
  const testSizes = [
    { name: 'Small (depth 3)', tree: createLargeFullTree(3) },
    { name: 'Medium (depth 6)', tree: createLargeFullTree(6) },
    { name: 'Large (depth 10)', tree: createLargeFullTree(10) }
  ];
  
  const algorithms = [
    { name: 'Recursive', fn: isFullBinaryTreeRecursive },
    { name: 'Iterative BFS', fn: isFullBinaryTreeIterative },
    { name: 'Optimized DFS', fn: isFullBinaryTreeOptimized },
    { name: 'Stack-based', fn: isFullBinaryTreeStackOptimized }
  ];
  
  testSizes.forEach(({ name, tree }) => {
    console.log(`\n--- Performance Test: ${name} ---`);
    
    algorithms.forEach(({ name: algName, fn }) => {
      const startTime = performance.now();
      const result = fn(tree);
      const endTime = performance.now();
      
      console.log(`  ${algName}: ${result} (${(endTime - startTime).toFixed(4)}ms)`);
    });
  });
}

/**
 * Example 4: Edge cases and special scenarios
 * Tests various edge cases and boundary conditions
 */
function demonstrateEdgeCases() {
  console.log('=== Edge Cases Testing ===\n');
  
  // Create edge case trees
  const edgeCases = [
    {
      name: 'Null tree',
      tree: null,
      expected: true
    },
    {
      name: 'Single node',
      tree: new TreeNode(42),
      expected: true
    },
    {
      name: 'Only left child',
      tree: (() => {
        const root = new TreeNode(1);
        root.left = new TreeNode(2);
        return root;
      })(),
      expected: false
    },
    {
      name: 'Only right child',
      tree: (() => {
        const root = new TreeNode(1);
        root.right = new TreeNode(2);
        return root;
      })(),
      expected: false
    },
    {
      name: 'Two nodes (both children)',
      tree: (() => {
        const root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        return root;
      })(),
      expected: true
    },
    {
      name: 'Deep left chain',
      tree: (() => {
        let root = new TreeNode(1);
        let current = root;
        for (let i = 2; i <= 5; i++) {
          current.left = new TreeNode(i);
          current = current.left;
        }
        return root;
      })(),
      expected: false
    }
  ];
  
  edgeCases.forEach(({ name, tree, expected }) => {
    console.log(`\n--- Edge Case: ${name} ---`);
    
    const result = isFullBinaryTreeRecursive(tree);
    const passed = result === expected;
    
    console.log(`Tree structure:`);
    console.log(visualizeTree(tree));
    console.log(`Expected: ${expected}`);
    console.log(`Got: ${result}`);
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
}

// Export all implementations and utilities
module.exports = {
  TreeNode,
  isFullBinaryTreeRecursive,
  isFullBinaryTreeRecursiveVerbose,
  isFullBinaryTreeIterative,
  isFullBinaryTreeIterativeEnhanced,
  isFullBinaryTreeOptimized,
  isFullBinaryTreeStackOptimized,
  isFullBinaryTreeMathematical,
  buildTreeFromArray,
  visualizeTree,
  createSampleTrees,
  demonstrateBasicValidation,
  demonstrateEnhancedAnalysis,
  demonstratePerformanceComparison,
  demonstrateEdgeCases
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Binary Tree Full Checker Implementations\n');
  console.log('This module demonstrates various approaches to checking');
  console.log('if a binary tree is full (every node has 0 or 2 children).\n');
  
  demonstrateBasicValidation();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEnhancedAnalysis();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstratePerformanceComparison();
  }, 2000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEdgeCases();
  }, 3000);
}