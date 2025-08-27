/**
 * File: interview-question-1.js
 * Description: Common interview question - predict the output
 * Tests understanding of promise executor and event loop
 */

const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});

promise.then((res) => {
  console.log(res);
});

console.log(4);

// Output:
// 1
// 2
// 4
// timerStart
// timerEnd
// success

// Explanation:
// 1. Promise executor runs synchronously: logs 1, schedules timer, logs 2
// 2. Synchronous code continues: logs 4
// 3. Event loop processes macrotask (timer): logs timerStart, resolves promise, logs timerEnd
// 4. Microtask (promise then): logs success