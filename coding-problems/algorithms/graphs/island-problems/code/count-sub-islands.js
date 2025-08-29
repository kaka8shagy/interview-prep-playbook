/**
 * Problem: Count Sub Islands
 * 
 * You are given two m x n binary matrices grid1 and grid2 containing only 0's (representing water) and 1's (representing land).
 * An island is a group of 1's connected 4-directionally (horizontal or vertical).
 * Any cells outside of the grid are considered water cells.
 * 
 * An island in grid2 is considered a sub-island if there is an island in grid1 that contains all the cells that make up this island in grid2.
 * 
 * Return the number of islands in grid2 that are considered sub-islands.
 * 
 * Example:
 * Input: grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]],
 *        grid2 = [[1,1,1,0,0],[0,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0],[0,1,0,1,0]]
 * Output: 3
 * 
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

function countSubIslands(grid1, grid2) {
    // TODO: Implement count sub islands using DFS
}

module.exports = { countSubIslands };