/**
 * File: private-variables.js
 * Description: Using closures to create private variables
 */

// Basic private counter
function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    },
    getCount() {
      return count;
    }
  };
}

// Usage
const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.getCount());  // 1
// console.log(counter.count); // undefined - private!

// Bank account with private balance
function BankAccount(initialBalance = 0) {
  let balance = initialBalance; // Private
  let transactions = [];       // Private
  
  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        transactions.push({ type: 'deposit', amount, balance });
        return true;
      }
      return false;
    },
    
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        transactions.push({ type: 'withdraw', amount, balance });
        return true;
      }
      return false;
    },
    
    getBalance() {
      return balance;
    },
    
    getStatement() {
      return transactions.slice(); // Return copy
    }
  };
}

// Usage
const account = BankAccount(100);
account.deposit(50);
account.withdraw(30);
console.log(account.getBalance()); // 120
console.log(account.getStatement());

// Private methods example
function createCalculator() {
  // Private helper methods
  function isValidNumber(n) {
    return typeof n === 'number' && !isNaN(n);
  }
  
  function roundToTwo(n) {
    return Math.round(n * 100) / 100;
  }
  
  // Public API
  return {
    add(a, b) {
      if (isValidNumber(a) && isValidNumber(b)) {
        return roundToTwo(a + b);
      }
      throw new Error('Invalid input');
    },
    
    divide(a, b) {
      if (isValidNumber(a) && isValidNumber(b) && b !== 0) {
        return roundToTwo(a / b);
      }
      throw new Error('Invalid input or division by zero');
    }
  };
}

module.exports = { createCounter, BankAccount, createCalculator };