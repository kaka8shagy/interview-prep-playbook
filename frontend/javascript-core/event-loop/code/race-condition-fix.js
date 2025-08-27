/**
 * File: race-condition-fix.js
 * Description: Common race condition problem and multiple solutions
 * Shows how to properly handle asynchronous data fetching
 */

// Simulated async function
function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: 'Important data' });
    }, 1000);
  });
}

function processData(data) {
  console.log('Processing:', data);
}

// PROBLEM: Race condition
function buggyCode() {
  let data = null;
  
  fetchData().then(result => {
    data = result;
  });
  
  processData(data); // Bug: data is still null!
}

// SOLUTION 1: Using async/await
async function solution1() {
  const data = await fetchData();
  processData(data);
}

// SOLUTION 2: Using Promise chain
function solution2() {
  fetchData()
    .then(data => processData(data))
    .catch(error => console.error(error));
}

// SOLUTION 3: Using callbacks in promise
function solution3() {
  fetchData().then(data => {
    processData(data);
  });
}

// SOLUTION 4: With error handling and loading state
class DataHandler {
  constructor() {
    this.data = null;
    this.loading = false;
    this.error = null;
  }
  
  async loadAndProcess() {
    this.loading = true;
    try {
      this.data = await fetchData();
      processData(this.data);
    } catch (error) {
      this.error = error;
      console.error('Failed to fetch data:', error);
    } finally {
      this.loading = false;
    }
  }
}

// Example usage
console.log('Starting async operations...');
solution1().then(() => console.log('Solution 1 complete'));
solution2();
solution3();

module.exports = { solution1, solution2, solution3, DataHandler };