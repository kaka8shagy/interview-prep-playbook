/**
 * Problem: Course Schedule II
 * 
 * There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. 
 * You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first 
 * if you want to take course ai. Return the ordering of courses you should take to finish all courses. 
 * If there are many valid answers, return any of them. If it is impossible to finish all courses, return an empty array.
 * 
 * Example:
 * Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
 * Output: [0,2,1,3]
 * Explanation: There are a total of 4 courses to take. To take course 3 you should have finished both courses 1 and 2. 
 * Both courses 1 and 2 should be taken after you finished course 0. So one correct course order is [0,1,2,3]. 
 * Another correct ordering is [0,2,1,3].
 * 
 * Time Complexity: O(V + E)
 * Space Complexity: O(V + E)
 */

function findOrder(numCourses, prerequisites) {
    // TODO: Implement course schedule II using Kahn's algorithm
}

module.exports = { findOrder };