/**
 * File: basic-example.js
 * Description: Basic demonstration of JavaScript event loop execution order
 * Shows the difference between synchronous, microtask, and macrotask execution
 */

console.log('1'); // Synchronous

setTimeout(() => console.log('2'), 0); // Macrotask

Promise.resolve().then(() => console.log('3')); // Microtask

console.log('4'); // Synchronous

// Output: 1, 4, 3, 2
// Explanation:
// 1. Synchronous code runs first (1, 4)
// 2. Microtasks run next (3)
// 3. Macrotasks run last (2)