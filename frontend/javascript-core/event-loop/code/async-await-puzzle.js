/**
 * File: async-await-puzzle.js
 * Description: Common interview problem with async/await and event loop
 * Tests understanding of how async functions create microtasks
 */

async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// Output:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// Explanation:
// 1. Sync execution: 'script start', 'async1 start', 'async2', 'promise1', 'script end'
// 2. Microtasks: 'async1 end', 'promise2'
// 3. Macrotask: 'setTimeout'