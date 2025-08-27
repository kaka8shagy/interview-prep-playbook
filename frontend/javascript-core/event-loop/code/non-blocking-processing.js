/**
 * File: non-blocking-processing.js
 * Description: Techniques to prevent UI blocking with large data processing
 * Shows chunking strategy to yield to event loop
 */

// Bad: Blocks the UI
function processLargeArrayBlocking(array) {
  for (let i = 0; i < array.length; i++) {
    expensiveOperation(array[i]);
  }
}

// Good: Non-blocking with chunking
function processLargeArrayNonBlocking(array) {
  const CHUNK_SIZE = 100;
  let index = 0;

  function processChunk() {
    const end = Math.min(index + CHUNK_SIZE, array.length);
    
    for (let i = index; i < end; i++) {
      expensiveOperation(array[i]);
    }
    
    index = end;
    
    if (index < array.length) {
      // Use setTimeout to yield to event loop
      setTimeout(processChunk, 0);
      // Or use requestIdleCallback for better performance
      // requestIdleCallback(processChunk);
    }
  }
  
  processChunk();
}

// Alternative: Using async/await
async function processLargeArrayAsync(array) {
  const CHUNK_SIZE = 100;
  
  for (let i = 0; i < array.length; i += CHUNK_SIZE) {
    const chunk = array.slice(i, i + CHUNK_SIZE);
    
    // Process chunk
    chunk.forEach(item => expensiveOperation(item));
    
    // Yield to event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// Helper function for demonstration
function expensiveOperation(item) {
  // Simulate expensive computation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(item * i);
  }
  return result;
}

// Example usage
const largeArray = Array.from({ length: 1000 }, (_, i) => i);

// Non-blocking approach
processLargeArrayNonBlocking(largeArray);
console.log('UI remains responsive');

module.exports = {
  processLargeArrayBlocking,
  processLargeArrayNonBlocking,
  processLargeArrayAsync
};