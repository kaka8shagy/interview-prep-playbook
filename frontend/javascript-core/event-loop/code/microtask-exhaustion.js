/**
 * File: microtask-exhaustion.js
 * Description: Demonstrates how microtasks can block macrotasks
 * Shows the priority of microtask queue over task queue
 */

// Demonstrating microtask exhaustion
function recursiveMicrotask(count) {
  if (count > 0) {
    Promise.resolve().then(() => {
      console.log(`Microtask ${count}`);
      recursiveMicrotask(count - 1);
    });
  }
}

console.log('Start');
setTimeout(() => console.log('Timeout'), 0);
recursiveMicrotask(5);
console.log('End');

// Output:
// Start
// End
// Microtask 5
// Microtask 4
// Microtask 3
// Microtask 2
// Microtask 1
// Timeout (only after ALL microtasks)

// WARNING: Infinite microtasks can block macrotasks
function blockEventLoop() {
  // DON'T DO THIS - will block all macrotasks indefinitely
  // Promise.resolve().then(blockEventLoop);
  console.log('This would block the event loop if uncommented');
}

module.exports = { recursiveMicrotask };