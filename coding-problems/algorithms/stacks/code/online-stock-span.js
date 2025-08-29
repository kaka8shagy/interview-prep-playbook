/**
 * Problem: Online Stock Span
 * 
 * Design an algorithm that collects daily price quotes for some stock and returns the span of that stock's price for the current day.
 * The span of the stock's price today is defined as the maximum number of consecutive days (starting from today and going backward) 
 * for which the stock price was less than or equal to today's price.
 * 
 * Example:
 * Input: ["StockSpanner", "next", "next", "next", "next", "next", "next", "next"]
 * [[], [100], [80], [60], [70], [60], [75], [85]]
 * Output: [null, 1, 1, 1, 2, 1, 4, 6]
 * 
 * Time Complexity: O(1) amortized per call
 * Space Complexity: O(n)
 */

class StockSpanner {
    constructor() {
        // TODO: Initialize data structures
    }
    
    next(price) {
        // TODO: Implement next method
    }
}

module.exports = { StockSpanner };