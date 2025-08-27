/**
 * File: nested-promises-timers.js
 * Description: Advanced pattern showing interaction between nested promises and timers
 * Demonstrates how microtasks are processed before macrotasks
 */

console.log('start');

setTimeout(() => {
  console.log('timeout 1');
  Promise.resolve().then(() => console.log('promise 1'));
}, 0);

Promise.resolve().then(() => {
  console.log('promise 2');
  setTimeout(() => console.log('timeout 2'), 0);
});

Promise.resolve().then(() => console.log('promise 3'));

console.log('end');

// Output: start, end, promise 2, promise 3, timeout 1, promise 1, timeout 2
// Explanation:
// 1. Sync: 'start', 'end'
// 2. Microtasks: 'promise 2' (queues timeout 2), 'promise 3'
// 3. Macrotask: 'timeout 1' (queues promise 1)
// 4. Microtask: 'promise 1'
// 5. Macrotask: 'timeout 2'