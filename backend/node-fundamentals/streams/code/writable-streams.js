/**
 * File: writable-streams.js
 * Description: Custom writable stream implementations with backpressure handling
 * 
 * Learning objectives:
 * - Understand writable stream lifecycle and states
 * - Master backpressure handling with drain events
 * - Learn buffering strategies and flow control
 * - See practical examples of data persistence patterns
 * 
 * Key concepts covered:
 * - _write() implementation patterns
 * - Backpressure detection and handling
 * - Batch processing and buffering
 * - Error handling and cleanup
 * - ObjectMode for structured data
 */

const { Writable } = require('stream');
const fs = require('fs');
const path = require('path');

/**
 * Example 1: Basic File Writer Stream
 * 
 * This demonstrates the fundamental pattern for writable streams.
 * The _write() method handles individual chunks, while _final() 
 * allows cleanup when the stream is ending.
 */
class SimpleFileWriter extends Writable {
  constructor(filepath, options = {}) {
    super(options);
    
    this.filepath = filepath;
    this.bytesWritten = 0;
    this.chunksProcessed = 0;
    
    // Create write stream to actual file
    // We wrap a standard fs.WriteStream to add custom logic
    this.fileStream = fs.createWriteStream(filepath);
    
    // Handle file stream errors by propagating to our stream
    this.fileStream.on('error', (error) => {
      this.emit('error', error);
    });
    
    console.log(`FileWriter initialized: ${filepath}`);
  }

  // Core method that handles each chunk of data
  // callback MUST be called when processing is complete
  _write(chunk, encoding, callback) {
    // Track metrics before processing
    this.chunksProcessed++;
    const chunkSize = chunk.length;
    
    console.log(`Writing chunk ${this.chunksProcessed}: ${chunkSize} bytes`);
    
    // Write to underlying file stream
    // We need to handle the callback properly for backpressure
    this.fileStream.write(chunk, encoding, (error) => {
      if (error) {
        // Pass error to callback - this will emit 'error' event
        callback(error);
        return;
      }
      
      // Update metrics after successful write
      this.bytesWritten += chunkSize;
      
      // Call callback to signal completion
      // This is crucial for proper flow control
      callback();
    });
  }

  // Called when no more data will be written (end() called)
  // Use this for cleanup and final operations
  _final(callback) {
    console.log(`Finalizing FileWriter: ${this.bytesWritten} bytes in ${this.chunksProcessed} chunks`);
    
    // Close the underlying file stream
    this.fileStream.end(() => {
      callback(); // Signal completion
    });
  }

  // Override destroy for custom cleanup
  _destroy(error, callback) {
    if (this.fileStream) {
      this.fileStream.destroy();
    }
    callback(error);
  }
}

/**
 * Example 2: Buffered Batch Writer
 * 
 * This pattern accumulates data in memory and writes in batches
 * for better performance. Common for database operations or
 * when the destination has high per-operation overhead.
 */
class BatchWriter extends Writable {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    
    this.batchSize = options.batchSize || 5;
    this.flushInterval = options.flushInterval || 2000; // 2 seconds
    this.buffer = [];
    this.processedBatches = 0;
    this.totalItems = 0;
    
    // Set up automatic flush timer
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        console.log(`Auto-flushing ${this.buffer.length} items`);
        this._flushBuffer();
      }
    }, this.flushInterval);
  }

  _write(chunk, encoding, callback) {
    // Add item to buffer
    this.buffer.push(chunk);
    this.totalItems++;
    
    console.log(`Buffered item ${this.totalItems}: ${JSON.stringify(chunk)}`);
    
    // Check if we need to flush
    if (this.buffer.length >= this.batchSize) {
      this._flushBuffer(() => callback()); // Call callback after flush
    } else {
      callback(); // Item buffered, ready for next
    }
  }

  // Process accumulated buffer
  _flushBuffer(callback) {
    if (this.buffer.length === 0) {
      if (callback) callback();
      return;
    }
    
    const batch = this.buffer.splice(0); // Remove all items
    this.processedBatches++;
    
    console.log(`Processing batch ${this.processedBatches} with ${batch.length} items`);
    
    // Simulate batch processing (e.g., database insert)
    this._processBatch(batch)
      .then(() => {
        console.log(`Batch ${this.processedBatches} completed successfully`);
        if (callback) callback();
      })
      .catch((error) => {
        console.error(`Batch ${this.processedBatches} failed:`, error);
        if (callback) callback(error);
      });
  }

  // Simulate async batch processing
  async _processBatch(batch) {
    // Simulate database operation or API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real implementation, this would be:
    // - Database bulk insert
    // - API batch request
    // - File append operations
    // etc.
  }

  _final(callback) {
    console.log('BatchWriter finalizing - flushing remaining items');
    
    // Clear the timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Flush any remaining items
    this._flushBuffer(callback);
  }

  _destroy(error, callback) {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    callback(error);
  }
}

/**
 * Example 3: Backpressure-Aware Stream
 * 
 * This example demonstrates proper backpressure handling.
 * It simulates a slow destination and shows how to signal
 * when the consumer should pause writing.
 */
class BackpressureWriter extends Writable {
  constructor(options = {}) {
    super(options);
    
    this.processingTime = options.processingTime || 200; // ms per chunk
    this.maxConcurrent = options.maxConcurrent || 2;
    this.currentProcessing = 0;
    this.totalProcessed = 0;
    this.queuedItems = [];
  }

  _write(chunk, encoding, callback) {
    this.totalProcessed++;
    const chunkId = this.totalProcessed;
    
    console.log(`Received chunk ${chunkId}: "${chunk.toString().trim()}"`);
    
    // If we're at capacity, queue this item
    if (this.currentProcessing >= this.maxConcurrent) {
      console.log(`Queue full - chunk ${chunkId} queued`);
      this.queuedItems.push({ chunk, encoding, callback, id: chunkId });
      return; // Don't call callback yet
    }
    
    // Process immediately
    this._processChunk(chunk, encoding, callback, chunkId);
  }

  _processChunk(chunk, encoding, callback, chunkId) {
    this.currentProcessing++;
    
    console.log(`Processing chunk ${chunkId} (concurrent: ${this.currentProcessing})`);
    
    // Simulate slow processing
    setTimeout(() => {
      console.log(`Completed chunk ${chunkId}`);
      this.currentProcessing--;
      
      // Signal this chunk is done
      callback();
      
      // Process next queued item if available
      if (this.queuedItems.length > 0) {
        const next = this.queuedItems.shift();
        this._processChunk(next.chunk, next.encoding, next.callback, next.id);
      }
    }, this.processingTime);
  }

  _final(callback) {
    console.log('BackpressureWriter finalizing...');
    
    // Wait for all processing to complete
    const waitForCompletion = () => {
      if (this.currentProcessing === 0 && this.queuedItems.length === 0) {
        console.log(`All processing complete: ${this.totalProcessed} items`);
        callback();
      } else {
        console.log(`Waiting... Processing: ${this.currentProcessing}, Queued: ${this.queuedItems.length}`);
        setTimeout(waitForCompletion, 100);
      }
    };
    
    waitForCompletion();
  }
}

/**
 * Example 4: Transform-like Writer
 * 
 * This writer processes and transforms data before persisting it.
 * Shows how to combine processing logic with writing operations.
 */
class ProcessingWriter extends Writable {
  constructor(outputPath, options = {}) {
    super({ objectMode: true, ...options });
    
    this.outputPath = outputPath;
    this.processor = options.processor || this.defaultProcessor;
    this.stats = {
      itemsReceived: 0,
      itemsProcessed: 0,
      itemsSkipped: 0,
      errors: 0
    };
    
    // Initialize output file
    this.output = [];
  }

  _write(chunk, encoding, callback) {
    this.stats.itemsReceived++;
    
    try {
      // Process the incoming data
      const processed = this.processor(chunk);
      
      if (processed === null) {
        // Item was filtered out
        this.stats.itemsSkipped++;
        console.log(`Skipped item ${this.stats.itemsReceived}: filtered out`);
      } else {
        // Item was processed successfully
        this.output.push(processed);
        this.stats.itemsProcessed++;
        console.log(`Processed item ${this.stats.itemsReceived}: ${JSON.stringify(processed)}`);
      }
      
      callback(); // Success
      
    } catch (error) {
      this.stats.errors++;
      console.error(`Error processing item ${this.stats.itemsReceived}:`, error);
      
      // Depending on strategy, we could:
      // 1. Fail the entire stream: callback(error)
      // 2. Skip the item and continue: callback()
      // 3. Add to error log and continue
      
      callback(); // Continue processing despite error
    }
  }

  // Default processor - can be overridden via options
  defaultProcessor(item) {
    // Example processing: uppercase strings, filter out numbers
    if (typeof item === 'string') {
      return {
        original: item,
        processed: item.toUpperCase(),
        timestamp: Date.now()
      };
    }
    
    // Filter out non-strings
    return null;
  }

  _final(callback) {
    console.log('\nProcessingWriter Stats:');
    console.log(`  Items received: ${this.stats.itemsReceived}`);
    console.log(`  Items processed: ${this.stats.itemsProcessed}`);
    console.log(`  Items skipped: ${this.stats.itemsSkipped}`);
    console.log(`  Errors: ${this.stats.errors}`);
    
    // Write final output to file
    const outputData = JSON.stringify(this.output, null, 2);
    fs.writeFile(this.outputPath, outputData, (error) => {
      if (error) {
        console.error('Failed to write output file:', error);
        callback(error);
      } else {
        console.log(`Output written to: ${this.outputPath}`);
        callback();
      }
    });
  }
}

/**
 * Demonstration Functions
 * 
 * These show practical usage patterns and common scenarios
 * you'll encounter when working with writable streams.
 */

// Example 1: Basic file writing with backpressure
function demonstrateFileWriter() {
  console.log('\n=== File Writer Demo ===');
  
  const outputPath = path.join(__dirname, 'output-file-writer.txt');
  const writer = new SimpleFileWriter(outputPath);
  
  // Write some test data
  const testData = [
    'Line 1: Hello World\n',
    'Line 2: Demonstrating file writing\n',
    'Line 3: With proper backpressure handling\n',
    'Line 4: Each line is a separate chunk\n',
    'Line 5: Final line\n'
  ];
  
  writer.on('error', (error) => {
    console.error('Writer error:', error);
  });
  
  writer.on('finish', () => {
    console.log('File writing completed successfully');
  });
  
  // Write data and handle backpressure
  let index = 0;
  function writeNext() {
    if (index >= testData.length) {
      writer.end(); // Signal end of data
      return;
    }
    
    const chunk = testData[index++];
    const canContinue = writer.write(chunk);
    
    if (!canContinue) {
      // Backpressure detected - wait for drain event
      console.log('Backpressure detected - waiting for drain');
      writer.once('drain', writeNext);
    } else {
      // Can continue immediately
      setImmediate(writeNext);
    }
  }
  
  writeNext();
}

// Example 2: Batch processing demonstration
function demonstrateBatchWriter() {
  console.log('\n=== Batch Writer Demo ===');
  
  const batchWriter = new BatchWriter({ 
    batchSize: 3,
    flushInterval: 1500 
  });
  
  // Prepare test data
  const testItems = [
    { id: 1, name: 'Item One' },
    { id: 2, name: 'Item Two' },
    { id: 3, name: 'Item Three' },
    { id: 4, name: 'Item Four' },
    { id: 5, name: 'Item Five' },
    { id: 6, name: 'Item Six' },
    { id: 7, name: 'Item Seven' }
  ];
  
  batchWriter.on('finish', () => {
    console.log('Batch processing completed');
  });
  
  batchWriter.on('error', (error) => {
    console.error('Batch writer error:', error);
  });
  
  // Write items with delays to show batching behavior
  let index = 0;
  function writeNext() {
    if (index >= testItems.length) {
      batchWriter.end();
      return;
    }
    
    batchWriter.write(testItems[index++]);
    setTimeout(writeNext, 800); // Delay to show auto-flush behavior
  }
  
  writeNext();
}

// Example 3: Backpressure handling demonstration
function demonstrateBackpressure() {
  console.log('\n=== Backpressure Demo ===');
  
  const backpressureWriter = new BackpressureWriter({
    processingTime: 300,
    maxConcurrent: 2
  });
  
  backpressureWriter.on('finish', () => {
    console.log('Backpressure demo completed');
  });
  
  backpressureWriter.on('error', (error) => {
    console.error('Backpressure writer error:', error);
  });
  
  // Rapidly write data to trigger backpressure
  const messages = Array.from({ length: 8 }, (_, i) => `Message ${i + 1}`);
  
  messages.forEach((message, index) => {
    setTimeout(() => {
      const canContinue = backpressureWriter.write(message);
      console.log(`Write ${index + 1}: ${canContinue ? 'immediate' : 'backpressure'}`);
      
      if (index === messages.length - 1) {
        backpressureWriter.end();
      }
    }, index * 100); // Fast writes to create pressure
  });
}

// Example 4: Processing writer demonstration
function demonstrateProcessingWriter() {
  console.log('\n=== Processing Writer Demo ===');
  
  const outputPath = path.join(__dirname, 'processed-output.json');
  
  // Custom processor that filters and transforms data
  const customProcessor = (item) => {
    if (typeof item === 'number' && item % 2 === 0) {
      return { value: item, squared: item * item, isEven: true };
    }
    if (typeof item === 'string' && item.length > 3) {
      return { value: item, length: item.length, uppercased: item.toUpperCase() };
    }
    return null; // Filter out other items
  };
  
  const processingWriter = new ProcessingWriter(outputPath, {
    processor: customProcessor
  });
  
  processingWriter.on('finish', () => {
    console.log('Processing writer completed');
    
    // Clean up output file after demo
    setTimeout(() => {
      fs.unlink(outputPath, () => {
        console.log('Demo output file cleaned up');
      });
    }, 1000);
  });
  
  // Test data with mixed types
  const testData = [
    'hello',
    42,
    'a',
    'world',
    13,
    'test',
    24,
    'short',
    'x',
    88
  ];
  
  testData.forEach((item, index) => {
    setTimeout(() => {
      processingWriter.write(item);
      if (index === testData.length - 1) {
        processingWriter.end();
      }
    }, index * 100);
  });
}

/**
 * Error Handling Example
 * 
 * Shows how to handle various error conditions in writable streams.
 */
class ErrorProneWriter extends Writable {
  constructor(options = {}) {
    super(options);
    this.chunkCount = 0;
    this.shouldError = options.shouldError || false;
  }

  _write(chunk, encoding, callback) {
    this.chunkCount++;
    
    // Simulate error on specific chunk
    if (this.shouldError && this.chunkCount === 3) {
      const error = new Error('Simulated write error on chunk 3');
      callback(error);
      return;
    }
    
    console.log(`Processed chunk ${this.chunkCount}: ${chunk.toString().trim()}`);
    callback();
  }
}

function demonstrateErrorHandling() {
  console.log('\n=== Error Handling Demo ===');
  
  const errorWriter = new ErrorProneWriter({ shouldError: true });
  
  errorWriter.on('error', (error) => {
    console.log(`Handled stream error: ${error.message}`);
  });
  
  errorWriter.on('finish', () => {
    console.log('Stream finished successfully');
  });
  
  // This will cause an error on the 3rd chunk
  ['Chunk 1', 'Chunk 2', 'Chunk 3 (error)', 'Chunk 4', 'Chunk 5'].forEach((data, index) => {
    setTimeout(() => {
      try {
        errorWriter.write(data + '\n');
        if (index === 4) errorWriter.end();
      } catch (error) {
        console.log('Caught synchronous error:', error);
      }
    }, index * 200);
  });
}

/**
 * Run all demonstrations
 */
if (require.main === module) {
  demonstrateFileWriter();
  
  setTimeout(() => {
    demonstrateBatchWriter();
  }, 3000);
  
  setTimeout(() => {
    demonstrateBackpressure();
  }, 8000);
  
  setTimeout(() => {
    demonstrateProcessingWriter();
  }, 12000);
  
  setTimeout(() => {
    demonstrateErrorHandling();
  }, 16000);
}

// Export classes for use in other modules
module.exports = {
  SimpleFileWriter,
  BatchWriter,
  BackpressureWriter,
  ProcessingWriter,
  ErrorProneWriter
};