/**
 * File: readable-streams.js
 * Description: Custom readable stream implementations demonstrating core concepts
 * 
 * Learning objectives:
 * - Understand how to create custom readable streams
 * - Learn different reading modes and their use cases
 * - Master backpressure handling in readable streams
 * - See practical examples of stream state management
 * 
 * Key concepts covered:
 * - Flowing vs paused modes
 * - ObjectMode streams for structured data
 * - Memory-efficient data production
 * - Error handling and cleanup
 */

const { Readable } = require('stream');
const fs = require('fs');

/**
 * Example 1: Basic Custom Readable Stream
 * 
 * This example demonstrates the fundamental pattern for creating readable streams.
 * The _read() method is called automatically when the stream needs more data.
 * We push data chunks and signal completion with null.
 */
class NumberGenerator extends Readable {
  constructor(options = {}) {
    super(options);
    
    // Stream state - tracks current position and maximum limit
    this.currentNumber = options.start || 0;
    this.maxNumber = options.max || 100;
    this.increment = options.increment || 1;
    
    // Performance tracking for demonstration
    this.chunksProduced = 0;
  }

  // Core method that produces data when the stream requests it
  // This method is called automatically by Node.js when buffer space is available
  _read() {
    // Check if we've reached the end condition
    if (this.currentNumber >= this.maxNumber) {
      // Push null to signal end of stream - this is crucial for proper cleanup
      this.push(null);
      console.log(`NumberGenerator completed: produced ${this.chunksProduced} chunks`);
      return;
    }

    // Generate the next data chunk
    // We convert to string because streams work with strings/buffers by default
    const chunk = `${this.currentNumber}\n`;
    this.currentNumber += this.increment;
    this.chunksProduced++;

    // Push the chunk to the stream's internal buffer
    // The return value indicates if we should continue producing immediately
    const shouldContinue = this.push(chunk);
    
    // If shouldContinue is false, the internal buffer is full
    // Node.js will call _read() again when buffer space becomes available
    if (!shouldContinue) {
      console.log('Buffer full - pausing production');
    }
  }
}

/**
 * Example 2: Object Mode Readable Stream
 * 
 * Object mode allows streams to work with JavaScript objects instead of strings/buffers.
 * This is useful for processing structured data through stream pipelines.
 * Memory usage is different - each object is a separate entity in the buffer.
 */
class TaskGenerator extends Readable {
  constructor(options = {}) {
    // Enable objectMode to work with JavaScript objects
    super({ objectMode: true, ...options });
    
    this.taskId = 1;
    this.maxTasks = options.maxTasks || 50;
    this.categories = ['urgent', 'normal', 'low'];
  }

  _read() {
    if (this.taskId > this.maxTasks) {
      // End the stream
      this.push(null);
      return;
    }

    // Create a structured task object
    // In object mode, we push actual JavaScript objects
    const task = {
      id: this.taskId,
      title: `Task ${this.taskId}`,
      priority: this.categories[Math.floor(Math.random() * this.categories.length)],
      created: new Date(),
      // Simulate variable task complexity
      estimatedHours: Math.floor(Math.random() * 8) + 1
    };

    this.taskId++;
    
    // Push the object directly - no string conversion needed
    this.push(task);
  }
}

/**
 * Example 3: File-like Readable Stream with Chunking
 * 
 * This demonstrates reading large datasets in controlled chunks,
 * simulating how file streams work internally. Shows proper memory management
 * and how to handle different data sources efficiently.
 */
class ChunkedDataReader extends Readable {
  constructor(data, options = {}) {
    super(options);
    
    this.sourceData = Buffer.from(data); // Convert to buffer for binary operations
    this.position = 0;
    this.chunkSize = options.chunkSize || 16; // Small chunks for demonstration
    
    // Track performance metrics
    this.totalBytesRead = 0;
    this.chunksEmitted = 0;
  }

  _read(size) {
    // The size parameter is a hint about how much data the consumer wants
    // We can use it to optimize our chunk size, but it's not mandatory
    const requestedSize = Math.min(size || this.chunkSize, this.chunkSize);
    
    if (this.position >= this.sourceData.length) {
      // All data has been read
      console.log(`ChunkedDataReader stats: ${this.totalBytesRead} bytes in ${this.chunksEmitted} chunks`);
      this.push(null);
      return;
    }

    // Calculate how much data to read this time
    const remainingBytes = this.sourceData.length - this.position;
    const bytesToRead = Math.min(requestedSize, remainingBytes);
    
    // Extract the chunk using Buffer.slice (efficient - doesn't copy data)
    const chunk = this.sourceData.slice(this.position, this.position + bytesToRead);
    
    // Update position and metrics
    this.position += bytesToRead;
    this.totalBytesRead += bytesToRead;
    this.chunksEmitted++;
    
    console.log(`Reading chunk ${this.chunksEmitted}: ${bytesToRead} bytes`);
    
    // Push the chunk to consumers
    this.push(chunk);
  }
}

/**
 * Example 4: Async Data Source Stream
 * 
 * Real-world streams often need to fetch data asynchronously from databases,
 * APIs, or other async sources. This example shows how to handle async operations
 * in readable streams while maintaining proper flow control.
 */
class AsyncDataStream extends Readable {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    
    this.page = 0;
    this.pageSize = options.pageSize || 10;
    this.maxPages = options.maxPages || 5;
    this.isReading = false; // Prevent concurrent reads
  }

  async _read() {
    // Prevent multiple concurrent reads
    if (this.isReading) {
      return;
    }
    
    this.isReading = true;
    
    try {
      if (this.page >= this.maxPages) {
        this.push(null); // End stream
        return;
      }

      // Simulate async data fetching (e.g., database query, API call)
      console.log(`Fetching page ${this.page + 1}...`);
      const data = await this.fetchPageData(this.page);
      
      // Process each item in the fetched page
      for (const item of data) {
        // Check if the stream is still readable before pushing
        if (this.destroyed) {
          break;
        }
        
        this.push(item);
      }
      
      this.page++;
      
    } catch (error) {
      // Proper error handling - emit error event instead of throwing
      this.emit('error', error);
    } finally {
      this.isReading = false;
    }
  }

  // Simulate async data source (database, API, etc.)
  async fetchPageData(page) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate mock data for this page
    const data = [];
    for (let i = 0; i < this.pageSize; i++) {
      data.push({
        id: page * this.pageSize + i + 1,
        name: `Item ${page * this.pageSize + i + 1}`,
        page: page + 1,
        timestamp: Date.now()
      });
    }
    
    return data;
  }
}

/**
 * Demonstration Functions
 * 
 * These functions show different ways to consume readable streams,
 * demonstrating both event-based and async iterator approaches.
 */

// Example usage with event listeners - traditional Node.js pattern
function demonstrateNumberGenerator() {
  console.log('\n=== Number Generator Demo ===');
  
  const generator = new NumberGenerator({ start: 1, max: 20, increment: 2 });
  
  let dataReceived = '';
  
  // Data event fires for each chunk pushed by the stream
  generator.on('data', (chunk) => {
    dataReceived += chunk;
    console.log(`Received chunk: ${chunk.toString().trim()}`);
  });
  
  // End event fires when stream pushes null
  generator.on('end', () => {
    console.log('Stream ended');
    console.log(`Total data: ${dataReceived.trim()}`);
  });
  
  // Error event handling - crucial for production code
  generator.on('error', (error) => {
    console.error('Stream error:', error);
  });
}

// Example with object mode stream and async iteration
async function demonstrateTaskGenerator() {
  console.log('\n=== Task Generator Demo (Object Mode) ===');
  
  const taskGen = new TaskGenerator({ maxTasks: 5 });
  
  try {
    // Async iteration is the modern way to consume streams
    // Much cleaner than event listeners for sequential processing
    for await (const task of taskGen) {
      console.log(`Processing task: ${task.title} (Priority: ${task.priority})`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('All tasks processed');
    
  } catch (error) {
    console.error('Error processing tasks:', error);
  }
}

// Demonstrate backpressure handling with slow consumer
function demonstrateBackpressure() {
  console.log('\n=== Backpressure Demo ===');
  
  const data = 'x'.repeat(1000); // 1KB of data
  const reader = new ChunkedDataReader(data, { chunkSize: 100 });
  
  let processedChunks = 0;
  
  reader.on('data', (chunk) => {
    processedChunks++;
    console.log(`Processing chunk ${processedChunks} (${chunk.length} bytes)`);
    
    // Simulate slow processing that might cause backpressure
    // In real apps, this could be database writes, network requests, etc.
    setTimeout(() => {
      console.log(`Finished processing chunk ${processedChunks}`);
    }, Math.random() * 100);
  });
  
  reader.on('end', () => {
    console.log(`Backpressure demo completed: ${processedChunks} chunks processed`);
  });
}

// Demonstrate async data fetching stream
async function demonstrateAsyncStream() {
  console.log('\n=== Async Data Stream Demo ===');
  
  const asyncStream = new AsyncDataStream({ maxPages: 3, pageSize: 5 });
  
  try {
    let itemCount = 0;
    
    for await (const item of asyncStream) {
      itemCount++;
      console.log(`Item ${itemCount}: ${item.name} (Page ${item.page})`);
    }
    
    console.log(`Processed ${itemCount} items from async source`);
    
  } catch (error) {
    console.error('Async stream error:', error);
  }
}

/**
 * Error Handling Examples
 * 
 * Proper error handling in streams is crucial for robust applications.
 * These examples show different error scenarios and handling strategies.
 */

class ErrorProneStream extends Readable {
  constructor(options = {}) {
    super(options);
    this.count = 0;
  }

  _read() {
    this.count++;
    
    if (this.count === 3) {
      // Simulate an error condition
      this.emit('error', new Error('Simulated stream error at count 3'));
      return;
    }
    
    if (this.count > 5) {
      this.push(null);
      return;
    }
    
    this.push(`Data ${this.count}\n`);
  }
}

function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Demo ===');
  
  const errorStream = new ErrorProneStream();
  
  errorStream.on('data', (chunk) => {
    console.log(`Received: ${chunk.toString().trim()}`);
  });
  
  errorStream.on('error', (error) => {
    console.log(`Handled error: ${error.message}`);
    // In production, you might want to restart the stream, log the error,
    // switch to a backup data source, etc.
  });
  
  errorStream.on('end', () => {
    console.log('Stream ended normally');
  });
}

/**
 * Run all demonstrations
 */
if (require.main === module) {
  (async () => {
    demonstrateNumberGenerator();
    
    setTimeout(async () => {
      await demonstrateTaskGenerator();
      
      setTimeout(() => {
        demonstrateBackpressure();
        
        setTimeout(async () => {
          await demonstrateAsyncStream();
          
          setTimeout(() => {
            demonstrateErrorHandling();
          }, 1000);
        }, 1000);
      }, 1000);
    }, 2000);
  })();
}

// Export classes for use in other modules
module.exports = {
  NumberGenerator,
  TaskGenerator,
  ChunkedDataReader,
  AsyncDataStream,
  ErrorProneStream
};