/**
 * Problem: Letter Combinations of a Phone Number
 * 
 * Given a string containing digits from 2-9 inclusive, return all possible letter combinations
 * that the number could represent. Return the answer in any order.
 * 
 * A mapping of digits to letters (just like on the telephone buttons) is given below.
 * Note that 1 does not map to any letters.
 * 
 * 2: abc
 * 3: def
 * 4: ghi
 * 5: jkl
 * 6: mno
 * 7: pqrs
 * 8: tuv
 * 9: wxyz
 * 
 * Example:
 * Input: digits = "23"
 * Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
 * 
 * Time Complexity: O(3^m * 4^n) where m is digits with 3 letters, n is digits with 4 letters
 * Space Complexity: O(3^m * 4^n)
 */

function letterCombinations(digits) {
    // TODO: Implement letter combinations using backtracking
}

module.exports = { letterCombinations };