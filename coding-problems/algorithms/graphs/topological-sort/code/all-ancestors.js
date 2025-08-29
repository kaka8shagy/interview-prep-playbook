/**
 * Problem: All Ancestors of a Node in a Directed Acyclic Graph
 * 
 * You are given a positive integer n representing the number of nodes of a Directed Acyclic Graph (DAG).
 * The nodes are numbered from 0 to n - 1 (inclusive).
 * 
 * You are also given a 2D integer array edges, where edges[i] = [fromi, toi] denotes that there is a
 * unidirectional edge from fromi to toi in the graph.
 * 
 * Return a list answer, where answer[i] is the list of ancestors of the ith node,
 * sorted in ascending order.
 * 
 * Example:
 * Input: n = 8, edgeList = [[0,3],[0,4],[1,3],[2,4],[2,7],[3,5],[3,6],[3,7],[4,6]]
 * Output: [[],[],[],[0,1],[0,2],[0,1,3],[0,1,2,3,4],[0,1,2,3]]
 * 
 * Time Complexity: O(V * (V + E))
 * Space Complexity: O(V^2)
 */

function getAncestors(n, edges) {
    // TODO: Implement all ancestors using topological sort and DFS
}

module.exports = { getAncestors };