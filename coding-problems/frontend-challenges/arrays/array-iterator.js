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
    
    const batch = [];
    const startIndex = this.index;
    
    // Process batch
    for (let i = 0; i < this.batchSize && this.index < this.array.length; i++) {
      const rawValue = this.array[this.index++];
      
      try {
        // Apply async processor
        const processedValue = await this.processor(rawValue, this.index - 1);
        
        batch.push({
          value: processedValue,
          originalValue: rawValue,
          index: this.index - 1
        });
        
        // Add delay if specified
        if (this.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
        
      } catch (error) {
        batch.push({
          error: error,
          originalValue: rawValue,
          index: this.index - 1
        });
      }
      
      // Report progress
      this.onProgress({
        processed: this.index,
        total: this.array.length,
        percentage: (this.index / this.array.length * 100).toFixed(1),
        currentBatch: batch.length
      });
    }
    
    return {
      value: this.batchSize === 1 ? batch[0] : batch,
      done: false
    };
  }
  
  /**
   * Async iterator protocol
   */
  [Symbol.asyncIterator]() {
    return this;
  }
  
  /**
   * Process all remaining items
   */
  async processAll() {
    const results = [];
    
    for await (const item of this) {
      if (Array.isArray(item)) {
        results.push(...item);
      } else {
        results.push(item);
      }
    }
    
    return results;
  }
  
  /**
   * Process with error collection
   */
  async processWithErrorHandling() {
    const results = [];
    const errors = [];
    
    for await (const item of this) {
      const items = Array.isArray(item) ? item : [item];
      
      for (const processedItem of items) {
        if (processedItem.error) {
          errors.push({
            error: processedItem.error,
            index: processedItem.index,
            value: processedItem.originalValue
          });
        } else {
          results.push(processedItem);
        }
      }
    }
    
    return { results, errors };
  }
}

// =======================
// Approach 5: Generator-Based Iterators
// =======================

/**
 * Generator-based array iterator with various patterns
 * Demonstrates different generator approaches
 */
class GeneratorArrayIterator {
  constructor(array) {
    this.array = array;
  }
  
  /**
   * Basic generator iterator
   */
  *[Symbol.iterator]() {
    for (let i = 0; i < this.array.length; i++) {
      yield {
        value: this.array[i],
        index: i,
        isFirst: i === 0,
        isLast: i === this.array.length - 1
      };
    }
  }
  
  /**
   * Windowed iterator - yields sliding windows
   */
  *windows(size = 2) {
    if (size <= 0 || size > this.array.length) return;
    
    for (let i = 0; i <= this.array.length - size; i++) {
      yield {
        window: this.array.slice(i, i + size),
        startIndex: i,
        endIndex: i + size - 1
      };
    }
  }
  
  /**
   * Chunked iterator - yields fixed-size chunks
   */
  *chunks(size = 2) {
    for (let i = 0; i < this.array.length; i += size) {
      yield {
        chunk: this.array.slice(i, i + size),
        chunkIndex: Math.floor(i / size),
        startIndex: i,
        endIndex: Math.min(i + size - 1, this.array.length - 1)
      };
    }
  }
  
  /**
   * Paired iterator - yields pairs of adjacent elements
   */
  *pairs() {
    for (let i = 0; i < this.array.length - 1; i++) {
      yield {
        pair: [this.array[i], this.array[i + 1]],
        indices: [i, i + 1]
      };
    }
  }
  
  /**
   * Indexed iterator with custom step
   */
  *step(stepSize = 1) {
    for (let i = 0; i < this.array.length; i += stepSize) {
      yield {
        value: this.array[i],
        index: i,
        step: stepSize
      };
    }
  }
  
  /**
   * Async generator for delayed processing
   */
  async *async(delay = 100) {
    for (let i = 0; i < this.array.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      yield {
        value: this.array[i],
        index: i,
        timestamp: Date.now()
      };
    }
  }
}

// =======================
// Utility Functions and Helpers
// =======================

/**
 * Create iterator from array with options
 */
function createArrayIterator(array, type = 'basic', options = {}) {
  switch (type) {
    case 'basic':
      return new BasicArrayIterator(array, options.startIndex);
      
    case 'filtering':
      return new FilteringArrayIterator(array, options);
      
    case 'bidirectional':
      return new BidirectionalArrayIterator(array);
      
    case 'async':
      return new AsyncArrayIterator(array, options);
      
    case 'generator':
      return new GeneratorArrayIterator(array);
      
    default:
      throw new Error(`Unknown iterator type: ${type}`);
  }
}

/**
 * Iterator utilities
 */
const IteratorUtils = {
  /**
   * Convert iterator to array
   */
  toArray(iterator) {
    const results = [];
    let item;
    
    while (!(item = iterator.next()).done) {
      results.push(item.value);
    }
    
    return results;
  },
  
  /**
   * Take first n items from iterator
   */
  take(iterator, n) {
    const results = [];
    let count = 0;
    let item;
    
    while (count < n && !(item = iterator.next()).done) {
      results.push(item.value);
      count++;
    }
    
    return results;
  },
  
  /**
   * Skip n items from iterator
   */
  skip(iterator, n) {
    let count = 0;
    let item;
    
    while (count < n && !(item = iterator.next()).done) {
      count++;
    }
    
    return iterator;
  },
  
  /**
   * Find first item matching predicate
   */
  find(iterator, predicate) {
    let item;
    
    while (!(item = iterator.next()).done) {
      if (predicate(item.value)) {
        return item.value;
      }
    }
    
    return undefined;
  },
  
  /**
   * Count items in iterator
   */
  count(iterator) {
    let count = 0;
    let item;
    
    while (!(item = iterator.next()).done) {
      count++;
    }
    
    return count;
  },
  
  /**
   * Chain multiple iterators
   */
  chain(...iterators) {
    return {
      *[Symbol.iterator]() {
        for (const iterator of iterators) {
          yield* iterator;
        }
      }
    };
  }
};

// =======================
// Real-world Examples
// =======================

// Example: Process large dataset with progress
async function processLargeDataset(data, processor) {
  const iterator = new AsyncArrayIterator(data, {
    processor,
    batchSize: 10,
    delay: 10,
    onProgress: (progress) => {
      console.log(`Processing: ${progress.percentage}% complete`);
    }
  });
  
  return await iterator.processWithErrorHandling();
}

// Example: Sliding window analysis
function analyzeWithSlidingWindow(timeSeries, windowSize = 5) {
  const iterator = new GeneratorArrayIterator(timeSeries);
  const results = [];
  
  for (const window of iterator.windows(windowSize)) {
    const avg = window.window.reduce((a, b) => a + b, 0) / window.window.length;
    results.push({
      startIndex: window.startIndex,
      endIndex: window.endIndex,
      values: window.window,
      average: avg
    });
  }
  
  return results;
}

// Example: Batch processing with error handling
async function batchProcess(items, batchProcessor, batchSize = 5) {
  const iterator = new GeneratorArrayIterator(items);
  const results = [];
  const errors = [];
  
  for (const chunk of iterator.chunks(batchSize)) {
    try {
      const batchResult = await batchProcessor(chunk.chunk);
      results.push({
        chunkIndex: chunk.chunkIndex,
        result: batchResult
      });
    } catch (error) {
      errors.push({
        chunkIndex: chunk.chunkIndex,
        error: error,
        items: chunk.chunk
      });
    }
  }
  
  return { results, errors };
}

// Export for use in other modules
module.exports = {
  BasicArrayIterator,
  FilteringArrayIterator,
  BidirectionalArrayIterator,
  AsyncArrayIterator,
  GeneratorArrayIterator,
  createArrayIterator,
  IteratorUtils,
  processLargeDataset,
  analyzeWithSlidingWindow,
  batchProcess
};