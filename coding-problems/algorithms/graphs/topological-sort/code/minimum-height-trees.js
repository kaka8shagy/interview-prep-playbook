/**
 * Problem: Minimum Height Trees
 * 
 * A tree is an undirected graph in which any two vertices are connected by exactly one path.
 * In other words, any connected graph without simple cycles is a tree.
 * 
 * Given a tree of n nodes labelled from 0 to n - 1, and an array of n - 1 edges where
 * edges[i] = [ai, bi] indicates that there is an undirected edge between the two nodes ai and bi in the tree.
 * 
 * You can choose any node of the tree as the root. When you pick a node x as the root,
 * the result tree has height h. Among all possible rooted trees, those with minimum height h are called minimum height trees (MHTs).
 * 
 * Return a list of all MHTs' root labels. You can return the answer in any order.
 * 
 * Example:
 * Input: n = 4, edges = [[1,0],[1,2],[1,3]]
 * Output: [1]
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

function findMinHeightTrees(n, edges) {
    // TODO: Implement minimum height trees using topological sort (remove leaves iteratively)
}

module.exports = { findMinHeightTrees };