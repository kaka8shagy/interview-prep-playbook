/**
 * File: chunk.js
 * Description: Array chunking utility - splits array into smaller arrays of specified size
 * 
 * Learning objectives:
 * - Understand array partitioning algorithms
 * - Learn efficient slicing techniques
 * - See pagination and batch processing patterns
 * 
 * Time Complexity: O(n) where n is array length
 * Space Complexity: O(n) for result storage
 */

/**
 * Creates an array of elements split into groups of specified size
 * If array can't be split evenly, the final chunk will be the remaining elements
 * 
 * Mental model: "Break large array into manageable pieces"
 * Useful for pagination, batch processing, and UI rendering optimization
 */
function chunk(array, size = 1) {
  // Input validation - handle edge cases early
  if (!Array.isArray(array)) {
    return [];
  }
  
  if (size < 1) {
    return [];
  }
  
  const result = [];
  const length = array.length;
  
  // Process array in chunks of specified size
  for (let i = 0; i < length; i += size) {
    // slice creates a new array with elements from i to i+size (exclusive)
    // This ensures we don't go beyond array boundaries
    result.push(array.slice(i, i + size));
  }
  
  return result;
}

// =======================
// Usage Examples
// =======================

// Example 1: Basic chunking for pagination
function paginationExample() {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const pageSize = 3;
  
  const pages = chunk(items, pageSize);
  console.log('Pages:', pages); // [[1,2,3], [4,5,6], [7,8,9], [10]]
  
  return pages;
}

// Example 2: Batch processing for API calls
async function batchApiCalls(userIds) {
  const batchSize = 5; // Process 5 users at a time to avoid rate limits
  const batches = chunk(userIds, batchSize);
  
  const results = [];
  
  for (const batch of batches) {
    // Process each batch in parallel, but batches in sequence
    const batchResults = await Promise.all(
      batch.map(id => fetch(`/api/users/${id}`).then(r => r.json()))
    );
    
    results.push(...batchResults);
    
    // Optional: Add delay between batches
    if (batch !== batches[batches.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Example 3: UI rendering optimization
function renderItemsInBatches(items, container) {
  const chunks = chunk(items, 50); // Render 50 items at a time
  
  chunks.forEach((chunk, index) => {
    // Use requestAnimationFrame to avoid blocking the UI
    setTimeout(() => {
      const fragment = document.createDocumentFragment();
      
      chunk.forEach(item => {
        const element = document.createElement('div');
        element.textContent = item.name;
        fragment.appendChild(element);
      });
      
      container.appendChild(fragment);
    }, index * 10); // Small delay between batches
  });
}

// Export for use in other modules
module.exports = {
  chunk,
  paginationExample,
  batchApiCalls,
  renderItemsInBatches
};