/**
 * Problem: Number of Closed Islands
 * 
 * Given a 2D grid consists of 0s (land) and 1s (water). An island is a maximal 4-directionally connected group of 0s
 * and a closed island is an island totally surrounded by 1s.
 * 
 * Return the number of closed islands.
 * 
 * Example:
 * Input: grid = [[1,1,1,1,1,1,1,0],
 *                [1,0,0,0,0,1,1,0],
 *                [1,0,1,0,1,1,1,0],
 *                [1,0,0,0,0,1,0,1],
 *                [1,1,1,1,1,1,1,0]]
 * Output: 2
 * Explanation: Islands in gray are closed because they are completely surrounded by water (group of 1s).
 * 
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

function closedIsland(grid) {
    // TODO: Implement count closed islands using DFS (mark boundary connected islands first)
}

module.exports = { closedIsland };