/**
 * Problem: K Closest Points to Origin
 * 
 * Given an array of points where points[i] = [xi, yi] represents a point on the X-Y plane 
 * and an integer k, return the k closest points to the origin (0, 0).
 * The distance between two points on the X-Y plane is the Euclidean distance (i.e., √(x1 - x2)² + (y1 - y2)²).
 * 
 * Example:
 * Input: points = [[1,3],[-2,2]], k = 1
 * Output: [[-2,2]]
 * Explanation: The distance between (1, 3) and the origin is sqrt(10).
 * The distance between (-2, 2) and the origin is sqrt(8).
 * Since sqrt(8) < sqrt(10), (-2, 2) is closer to the origin.
 * 
 * Time Complexity: O(n log k)
 * Space Complexity: O(k)
 */

function kClosest(points, k) {
    // TODO: Implement k closest points to origin using heap
}

module.exports = { kClosest };