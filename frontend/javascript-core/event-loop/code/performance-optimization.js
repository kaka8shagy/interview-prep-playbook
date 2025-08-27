/**
 * File: performance-optimization.js
 * Description: Performance optimization techniques using event loop knowledge
 * Shows Web Workers and requestIdleCallback usage
 */

// Using Web Workers for CPU-intensive tasks
function setupWebWorker() {
  // This would be in a separate worker file: heavy-computation.js
  const workerCode = `
    self.onmessage = function(e) {
      const result = performHeavyComputation(e.data);
      self.postMessage(result);
    };
    
    function performHeavyComputation(data) {
      // Simulate heavy work
      let result = 0;
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < 1000000; j++) {
          result += Math.sqrt(data[i] * j);
        }
      }
      return result;
    }
  `;
  
  // Create blob URL for inline worker
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);
  
  // Usage
  const largeArray = Array.from({ length: 100 }, (_, i) => i);
  worker.postMessage({ cmd: 'start', data: largeArray });
  worker.onmessage = (e) => {
    console.log('Computation complete:', e.data);
    URL.revokeObjectURL(workerUrl);
  };
  
  return worker;
}

// Using requestIdleCallback for non-critical work
function scheduleIdleWork(tasks) {
  function performIdleWork(deadline) {
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
      const task = tasks.shift();
      task();
    }
    
    // Schedule more work if needed
    if (tasks.length > 0) {
      requestIdleCallback(performIdleWork);
    }
  }
  
  // Start the idle work
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(performIdleWork);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      tasks.forEach(task => task());
    }, 0);
  }
}

// Using requestAnimationFrame for smooth animations
function smoothAnimation(element, duration) {
  const startTime = performance.now();
  const startPosition = element.offsetLeft;
  const endPosition = startPosition + 200;
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentPosition = startPosition + (endPosition - startPosition) * easeProgress;
    
    element.style.left = currentPosition + 'px';
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// Debouncing with event loop understanding
function debounce(func, wait) {
  let timeoutId;
  return function(...args) {
    // Clear existing timeout (removes from task queue)
    clearTimeout(timeoutId);
    
    // Schedule new execution
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// Throttling with event loop understanding
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Example usage
const tasks = [
  () => console.log('Idle task 1'),
  () => console.log('Idle task 2'),
  () => console.log('Idle task 3')
];

scheduleIdleWork(tasks);

// Export functions
module.exports = {
  setupWebWorker,
  scheduleIdleWork,
  smoothAnimation,
  debounce,
  throttle
};