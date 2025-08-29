/**
 * Problem: Maximize the Confusion of an Exam
 * 
 * A teacher is writing a test with n true/false questions, with 'T' denoting true and 'F' denoting false. 
 * He wants to confuse the students by maximizing the number of consecutive questions with the same answer 
 * (multiple trues or multiple falses in a row).
 * You are given a string answerKey, where answerKey[i] is the original answer to the ith question. 
 * You are also given an integer k, the maximum number of times you may perform the following operation:
 * Change the answer key for any question to 'T' or 'F'.
 * Return the maximum number of consecutive 'T's or 'F's in the answer key after performing the operation at most k times.
 * 
 * Example:
 * Input: answerKey = "TTFF", k = 2
 * Output: 4
 * Explanation: We can replace both the 'F's with 'T's to make answerKey = "TTTT".
 * There are four consecutive 'T's.
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

function maxConsecutiveAnswers(answerKey, k) {
    // TODO: Implement maximize the confusion of an exam solution
}

module.exports = { maxConsecutiveAnswers };