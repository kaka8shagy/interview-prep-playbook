/**
 * Problem: Treasure Island
 * 
 * You have a map that marks the location of a treasure island. Some of the map area are marked as 'O' which are the ocean,
 * some are marked as 'D' which are dangerous, and one cell is the treasure 'X' which is the final treasure.
 * 
 * The initial position is at the top-left corner of the map. You can move one step up, down, left, or right each time.
 * You cannot move into an ocean cell, or a dangerous cell. Return the minimum number of steps to get to the treasure.
 * 
 * Example:
 * Input: [['O', 'O', 'O', 'O'],
 *         ['D', 'O', 'D', 'O'],
 *         ['O', 'O', 'O', 'O'],
 *         ['X', 'D', 'D', 'O']]
 * Output: 5
 * Explanation: The path is Right -> Right -> Down -> Down -> Left.
 * 
 * Time Complexity: O(m * n)
 * Space Complexity: O(m * n)
 */

function treasureIsland(grid) {
    // TODO: Implement treasure island using BFS for shortest path
}

module.exports = { treasureIsland };