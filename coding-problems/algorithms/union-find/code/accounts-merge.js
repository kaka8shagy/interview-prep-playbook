/**
 * Problem: Accounts Merge
 * 
 * Given a list of accounts where each element accounts[i] is a list of strings,
 * where the first element accounts[i][0] is a name, and the rest of the elements are emails representing emails of the account.
 * 
 * Now, two accounts definitely belong to the same person if there is some common email to both accounts.
 * Note that even if two accounts have the same name, they may belong to different people as people could have the same name.
 * A person can have any number of accounts initially, but all of their accounts definitely have the same name.
 * 
 * After merging the accounts, return the accounts in the following format:
 * the first element of each account is the name, and the rest of the elements are emails in sorted order.
 * 
 * Example:
 * Input: accounts = [["John","johnsmith@mail.com","john_newyork@mail.com"],["John","johnsmith@mail.com","john00@mail.com"],["Mary","mary@mail.com"],["John","johnnybravo@mail.com"]]
 * Output: [["John","john00@mail.com","john_newyork@mail.com","johnsmith@mail.com"],["John","johnnybravo@mail.com"],["Mary","mary@mail.com"]]
 * 
 * Time Complexity: O(n * k * log(k)) where n is number of accounts, k is max emails per account
 * Space Complexity: O(n * k)
 */

function accountsMerge(accounts) {
    // TODO: Implement accounts merge using union find
}

module.exports = { accountsMerge };