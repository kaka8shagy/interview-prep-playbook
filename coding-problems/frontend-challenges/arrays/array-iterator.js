/**
 * File: array-iterator.js
 * Description: Custom array iterator implementation with various traversal patterns
 * 
 * Learning objectives:
 * - Understand iterator protocol and Symbol.iterator
 * - Learn different array traversal strategies
 * - See generator functions and async iteration patterns
 * 
 * Time Complexity: O(1) per iteration, O(n) for full traversal
 * Space Complexity: O(1) for iterator state
 */

// =======================
// Approach 1: Basic Iterator Implementation
// =======================

/**
 * Basic array iterator following JavaScript iterator protocol
 * Implements next() method returning {value, done}
 * 
 * Mental model: Cursor moving through array with state tracking
 */
class BasicArrayIterator {
  constructor(array, startIndex = 0) {
    this.array = array;
    this.index = startIndex;
  }
  
  /**
   * Iterator protocol implementation
   */
  next() {
    if (this.index < this.array.length) {
      return {
        value: this.array[this.index++],
        done: false
      };
    }
    
    return {
      value: undefined,
      done: true
    };
  }
  
  /**
   * Make iterator iterable
   */
  [Symbol.iterator]() {
    return this;
  }
  
  /**
   * Reset iterator to beginning
   */
  reset() {
    this.index = 0;
    return this;
  }
  
  /**
   * Peek at next value without advancing
   */
  peek() {
    return this.index < this.array.length 
      ? this.array[this.index] 
      : undefined;
  }
  
  /**
   * Check if more items available
   */
  hasNext() {
    return this.index < this.array.length;
  }
  
  /**
   * Skip n items
   */
  skip(n = 1) {
    this.index = Math.min(this.index + n, this.array.length);
    return this;
  }
  
  /**
   * Get current position
   */
  position() {
    return this.index;
  }
}

// =======================
// Approach 2: Advanced Iterator with Filtering
// =======================

/**
 * Advanced iterator with built-in filtering and transformation
 * Combines iteration with data processing capabilities
 */
class FilteringArrayIterator {
  constructor(array, options = {}) {
    this.array = array;
    this.index = 0;
    this.predicate = options.filter || (() => true);
    this.transformer = options.transform || (x => x);
    this.reverse = options.reverse || false;
    
    // Initialize position based on direction
    if (this.reverse) {
      this.index = this.array.length - 1;
    }
  }
  
  /**
   * Iterator with filtering and transformation
   */
  next() {
    while (this.hasNext()) {
      const currentIndex = this.index;
      const rawValue = this.array[currentIndex];
      
      // Advance index based on direction
      if (this.reverse) {
        this.index--;
      } else {
        this.index++;
      }
      
      // Apply filter
      if (this.predicate(rawValue, currentIndex)) {
        // Apply transformation
        const transformedValue = this.transformer(rawValue, currentIndex);
        
        return {
          value: {
            value: transformedValue,
            index: currentIndex,
            originalValue: rawValue
          },
          done: false
        };
      }
    }
    
    return { value: undefined, done: true };
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  /**
   * Check if more items available
   */
  hasNext() {
    return this.reverse 
      ? this.index >= 0 
      : this.index < this.array.length;
  }
  
  /**
   * Count remaining items that match filter
   */
  countRemaining() {
    let count = 0;
    const startIndex = this.index;
    
    while (this.hasNext()) {
      const value = this.reverse 
        ? this.array[this.index--] 
        : this.array[this.index++];
        
      if (this.predicate(value)) {
        count++;
      }
    }
    
    // Restore position
    this.index = startIndex;
    return count;
  }
  
  /**
   * Collect all remaining items into array
   */
  toArray() {
    const results = [];
    let item;
    
    while (!(item = this.next()).done) {
      results.push(item.value);
    }
    
    return results;
  }
}

// =======================
// Approach 3: Bi-directional Iterator
// =======================

/**
 * Iterator that can move forward and backward
 * Useful for undo/redo operations or flexible traversal
 */
class BidirectionalArrayIterator {
  constructor(array) {
    this.array = array;
    this.index = 0;
    this.history = [];
    this.maxHistory = 100; // Prevent memory leaks
  }
  
  /**
   * Move forward and return value
   */
  next() {
    if (this.index >= this.array.length) {
      return { value: undefined, done: true };
    }
    
    const value = this.array[this.index];
    
    // Record history for backward movement
    this.history.push({
      index: this.index,
      value: value,
      direction: 'forward'
    });
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    this.index++;
    
    return {
      value: {
        value: value,
        index: this.index - 1,
        canGoBack: this.history.length > 0,
        canGoForward: this.index < this.array.length
      },
      done: false
    };
  }
  
  /**
   * Move backward and return value
   */
  previous() {
    if (this.history.length === 0 || this.index <= 0) {
      return { value: undefined, done: true };
    }
    
    this.index--;
    const historyEntry = this.history.pop();
    
    return {
      value: {
        value: historyEntry.value,
        index: this.index,
        canGoBack: this.history.length > 0,
        canGoForward: true
      },
      done: false
    };
  }
  
  /**
   * Jump to specific index
   */
  jumpTo(targetIndex) {
    if (targetIndex < 0 || targetIndex >= this.array.length) {
      return { value: undefined, done: true };
    }
    
    this.index = targetIndex;
    // Clear history on jump
    this.history = [];
    
    return {
      value: {
        value: this.array[this.index],
        index: this.index,
        canGoBack: false,
        canGoForward: this.index < this.array.length - 1
      },
      done: false
    };
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  /**
   * Get current position info
   */
  getPosition() {
    return {
      current: this.index,
      total: this.array.length,
      percentage: (this.index / this.array.length * 100).toFixed(1) + '%',
      canGoBack: this.history.length > 0,
      canGoForward: this.index < this.array.length
    };
  }
}

// =======================
// Approach 4: Async Iterator Implementation
// =======================

/**
 * Async iterator for processing arrays with async operations
 * Useful for API calls, file operations, or delayed processing
 */
class AsyncArrayIterator {
  constructor(array, options = {}) {
    this.array = array;
    this.index = 0;
    this.delay = options.delay || 0;
    this.processor = options.processor || (async (x) => x);
    this.batchSize = options.batchSize || 1;
    this.onProgress = options.onProgress || (() => {});
  }
  
  /**
   * Async iterator protocol
   */
  async next() {
    if (this.index >= this.array.length) {
      return { value: undefined, done: true };
    }
    
    const batch = [];\n    const startIndex = this.index;\n    \n    // Process batch\n    for (let i = 0; i < this.batchSize && this.index < this.array.length; i++) {\n      const rawValue = this.array[this.index++];\n      \n      try {\n        // Apply async processor\n        const processedValue = await this.processor(rawValue, this.index - 1);\n        \n        batch.push({\n          value: processedValue,\n          originalValue: rawValue,\n          index: this.index - 1\n        });\n        \n        // Add delay if specified\n        if (this.delay > 0) {\n          await new Promise(resolve => setTimeout(resolve, this.delay));\n        }\n        \n      } catch (error) {\n        batch.push({\n          error: error,\n          originalValue: rawValue,\n          index: this.index - 1\n        });\n      }\n      \n      // Report progress\n      this.onProgress({\n        processed: this.index,\n        total: this.array.length,\n        percentage: (this.index / this.array.length * 100).toFixed(1),\n        currentBatch: batch.length\n      });\n    }\n    \n    return {\n      value: this.batchSize === 1 ? batch[0] : batch,\n      done: false\n    };\n  }\n  \n  /**\n   * Async iterator protocol\n   */\n  [Symbol.asyncIterator]() {\n    return this;\n  }\n  \n  /**\n   * Process all remaining items\n   */\n  async processAll() {\n    const results = [];\n    \n    for await (const item of this) {\n      if (Array.isArray(item)) {\n        results.push(...item);\n      } else {\n        results.push(item);\n      }\n    }\n    \n    return results;\n  }\n  \n  /**\n   * Process with error collection\n   */\n  async processWithErrorHandling() {\n    const results = [];\n    const errors = [];\n    \n    for await (const item of this) {\n      const items = Array.isArray(item) ? item : [item];\n      \n      for (const processedItem of items) {\n        if (processedItem.error) {\n          errors.push({\n            error: processedItem.error,\n            index: processedItem.index,\n            value: processedItem.originalValue\n          });\n        } else {\n          results.push(processedItem);\n        }\n      }\n    }\n    \n    return { results, errors };\n  }\n}\n\n// =======================\n// Approach 5: Generator-Based Iterators\n// =======================\n\n/**\n * Generator-based array iterator with various patterns\n * Demonstrates different generator approaches\n */\nclass GeneratorArrayIterator {\n  constructor(array) {\n    this.array = array;\n  }\n  \n  /**\n   * Basic generator iterator\n   */\n  *[Symbol.iterator]() {\n    for (let i = 0; i < this.array.length; i++) {\n      yield {\n        value: this.array[i],\n        index: i,\n        isFirst: i === 0,\n        isLast: i === this.array.length - 1\n      };\n    }\n  }\n  \n  /**\n   * Windowed iterator - yields sliding windows\n   */\n  *windows(size = 2) {\n    if (size <= 0 || size > this.array.length) return;\n    \n    for (let i = 0; i <= this.array.length - size; i++) {\n      yield {\n        window: this.array.slice(i, i + size),\n        startIndex: i,\n        endIndex: i + size - 1\n      };\n    }\n  }\n  \n  /**\n   * Chunked iterator - yields fixed-size chunks\n   */\n  *chunks(size = 2) {\n    for (let i = 0; i < this.array.length; i += size) {\n      yield {\n        chunk: this.array.slice(i, i + size),\n        chunkIndex: Math.floor(i / size),\n        startIndex: i,\n        endIndex: Math.min(i + size - 1, this.array.length - 1)\n      };\n    }\n  }\n  \n  /**\n   * Paired iterator - yields pairs of adjacent elements\n   */\n  *pairs() {\n    for (let i = 0; i < this.array.length - 1; i++) {\n      yield {\n        pair: [this.array[i], this.array[i + 1]],\n        indices: [i, i + 1]\n      };\n    }\n  }\n  \n  /**\n   * Indexed iterator with custom step\n   */\n  *step(stepSize = 1) {\n    for (let i = 0; i < this.array.length; i += stepSize) {\n      yield {\n        value: this.array[i],\n        index: i,\n        step: stepSize\n      };\n    }\n  }\n  \n  /**\n   * Async generator for delayed processing\n   */\n  async *async(delay = 100) {\n    for (let i = 0; i < this.array.length; i++) {\n      await new Promise(resolve => setTimeout(resolve, delay));\n      \n      yield {\n        value: this.array[i],\n        index: i,\n        timestamp: Date.now()\n      };\n    }\n  }\n}\n\n// =======================\n// Utility Functions and Helpers\n// =======================\n\n/**\n * Create iterator from array with options\n */\nfunction createArrayIterator(array, type = 'basic', options = {}) {\n  switch (type) {\n    case 'basic':\n      return new BasicArrayIterator(array, options.startIndex);\n      \n    case 'filtering':\n      return new FilteringArrayIterator(array, options);\n      \n    case 'bidirectional':\n      return new BidirectionalArrayIterator(array);\n      \n    case 'async':\n      return new AsyncArrayIterator(array, options);\n      \n    case 'generator':\n      return new GeneratorArrayIterator(array);\n      \n    default:\n      throw new Error(`Unknown iterator type: ${type}`);\n  }\n}\n\n/**\n * Iterator utilities\n */\nconst IteratorUtils = {\n  /**\n   * Convert iterator to array\n   */\n  toArray(iterator) {\n    const results = [];\n    let item;\n    \n    while (!(item = iterator.next()).done) {\n      results.push(item.value);\n    }\n    \n    return results;\n  },\n  \n  /**\n   * Take first n items from iterator\n   */\n  take(iterator, n) {\n    const results = [];\n    let count = 0;\n    let item;\n    \n    while (count < n && !(item = iterator.next()).done) {\n      results.push(item.value);\n      count++;\n    }\n    \n    return results;\n  },\n  \n  /**\n   * Skip n items from iterator\n   */\n  skip(iterator, n) {\n    let count = 0;\n    let item;\n    \n    while (count < n && !(item = iterator.next()).done) {\n      count++;\n    }\n    \n    return iterator;\n  },\n  \n  /**\n   * Find first item matching predicate\n   */\n  find(iterator, predicate) {\n    let item;\n    \n    while (!(item = iterator.next()).done) {\n      if (predicate(item.value)) {\n        return item.value;\n      }\n    }\n    \n    return undefined;\n  },\n  \n  /**\n   * Count items in iterator\n   */\n  count(iterator) {\n    let count = 0;\n    let item;\n    \n    while (!(item = iterator.next()).done) {\n      count++;\n    }\n    \n    return count;\n  },\n  \n  /**\n   * Chain multiple iterators\n   */\n  chain(...iterators) {\n    return {\n      *[Symbol.iterator]() {\n        for (const iterator of iterators) {\n          yield* iterator;\n        }\n      }\n    };\n  }\n};\n\n// =======================\n// Real-world Examples\n// =======================\n\n// Example: Process large dataset with progress\nasync function processLargeDataset(data, processor) {\n  const iterator = new AsyncArrayIterator(data, {\n    processor,\n    batchSize: 10,\n    delay: 10,\n    onProgress: (progress) => {\n      console.log(`Processing: ${progress.percentage}% complete`);\n    }\n  });\n  \n  return await iterator.processWithErrorHandling();\n}\n\n// Example: Sliding window analysis\nfunction analyzeWithSlidingWindow(timeSeries, windowSize = 5) {\n  const iterator = new GeneratorArrayIterator(timeSeries);\n  const results = [];\n  \n  for (const window of iterator.windows(windowSize)) {\n    const avg = window.window.reduce((a, b) => a + b, 0) / window.window.length;\n    results.push({\n      startIndex: window.startIndex,\n      endIndex: window.endIndex,\n      values: window.window,\n      average: avg\n    });\n  }\n  \n  return results;\n}\n\n// Example: Batch processing with error handling\nasync function batchProcess(items, batchProcessor, batchSize = 5) {\n  const iterator = new GeneratorArrayIterator(items);\n  const results = [];\n  const errors = [];\n  \n  for (const chunk of iterator.chunks(batchSize)) {\n    try {\n      const batchResult = await batchProcessor(chunk.chunk);\n      results.push({\n        chunkIndex: chunk.chunkIndex,\n        result: batchResult\n      });\n    } catch (error) {\n      errors.push({\n        chunkIndex: chunk.chunkIndex,\n        error: error,\n        items: chunk.chunk\n      });\n    }\n  }\n  \n  return { results, errors };\n}\n\n// Export for use in other modules\nmodule.exports = {\n  BasicArrayIterator,\n  FilteringArrayIterator,\n  BidirectionalArrayIterator,\n  AsyncArrayIterator,\n  GeneratorArrayIterator,\n  createArrayIterator,\n  IteratorUtils,\n  processLargeDataset,\n  analyzeWithSlidingWindow,\n  batchProcess\n};