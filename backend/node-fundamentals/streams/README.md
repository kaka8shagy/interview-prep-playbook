# Streams & Buffers

## Quick Summary
- Streams enable processing large amounts of data without loading everything into memory
- Four types: Readable, Writable, Duplex, and Transform streams
- Backpressure handling prevents memory overflow when data flows faster than processing
- Buffers manage binary data efficiently in Node.js
- Essential for file processing, network communication, and data transformation

## Core Concepts

### Stream Types and Use Cases
Streams are abstract interfaces for working with streaming data in Node.js. They handle data in chunks rather than loading entire datasets into memory, making them essential for scalable applications.

**Readable Streams** produce data that can be consumed. Examples include file read streams, HTTP request bodies, and process.stdin. They operate in flowing or paused mode, with flowing mode automatically pushing data to consumers.

**Writable Streams** consume data that can be written to them. Examples include file write streams, HTTP response objects, and process.stdout. They buffer incoming data and handle backpressure when the destination can't keep up.

**Duplex Streams** are both readable and writable, like TCP sockets. They maintain separate internal buffers for reading and writing operations.

**Transform Streams** are duplex streams where output is computed from input, like compression or encryption streams. They're perfect for data processing pipelines.

### Backpressure Handling
Backpressure occurs when data is written to a stream faster than it can be consumed. Without proper handling, this leads to unbounded memory growth and potential crashes.

The `write()` method returns `false` when the internal buffer is full, signaling to pause writing. The `drain` event indicates when it's safe to resume. This flow control mechanism prevents memory overflow.

For readable streams, the `highWaterMark` option controls buffer size. When the buffer is full, the stream enters paused mode until data is consumed.

Transform streams must balance reading and writing rates. They can implement custom buffering logic or use the built-in backpressure handling through proper implementation of `_transform()`.

### Buffer Management
Buffers represent fixed-size chunks of memory allocated outside V8's heap. They're used for binary data operations and are the underlying storage mechanism for streams.

Buffer allocation strategies affect performance. Pre-allocating buffers and reusing them reduces garbage collection pressure. The `Buffer.allocUnsafe()` method provides better performance but requires manual initialization.

String encoding and decoding with buffers requires attention to character boundaries, especially with multi-byte encodings like UTF-8. Streams handle this automatically when configured with proper encoding options.

Buffer pooling in Node.js optimizes memory usage by sharing underlying memory between small buffers. Understanding this mechanism helps with performance optimization.

## Implementation Examples

### Basic Stream Operations
See code examples:
- Readable stream creation: `./code/readable-streams.js`
- Writable stream handling: `./code/writable-streams.js`

### Advanced Stream Processing
See advanced examples:
- Data transformation: `./code/transform-streams.js`  
- Large file handling: `./code/file-processing.js`

## Common Pitfalls

### Memory Leaks from Improper Cleanup
Streams can leak memory if not properly cleaned up. Always handle the `error`, `end`, and `close` events. Use `pipeline()` or `finished()` utilities to ensure proper cleanup.

### Incorrect Backpressure Handling
Ignoring the return value of `write()` or not listening for `drain` events leads to unbounded memory growth. Always implement proper flow control.

### Synchronous Operations in Stream Handlers
Performing CPU-intensive synchronous operations in stream event handlers blocks the event loop. Use `setImmediate()` or worker threads for heavy processing.

### Buffer Encoding Issues  
Mixing buffer operations with different encodings causes data corruption. Be explicit about encoding when converting between strings and buffers.

### Stream State Management
Streams have complex state transitions. Writing to ended streams or reading from destroyed streams throws errors. Always check stream state before operations.

## Interview Questions

### Question 1: Implement Custom Transform Stream
Design a transform stream that processes JSON objects from input and outputs formatted CSV rows.

**Approach:** Create a class extending Transform, implement `_transform()` method to parse JSON and convert to CSV format, handle object mode for structured data processing.

**Solution:** `./code/transform-streams.js`

### Question 2: Handle Large File Processing
Process a 10GB log file to extract specific patterns without loading the entire file into memory.

**Approach:** Use readable stream with line-by-line processing, implement backpressure handling, use transform streams for pattern matching, optimize buffer sizes for performance.

**Solution:** `./code/file-processing.js`

### Question 3: Build Memory-Efficient CSV Parser
Create a streaming CSV parser that handles malformed data, different encodings, and produces structured objects.

**Approach:** Implement state machine for CSV parsing, handle quoted fields and escaping, manage partial lines across buffer boundaries, implement proper error handling.

**Solution:** `./code/interview-csv-processor.js`

### Question 4: Stream Pipeline Error Handling
Design error handling for a multi-stage stream pipeline with proper cleanup and recovery.

**Approach:** Use `pipeline()` utility for automatic cleanup, implement error handling at each stage, design fallback strategies for recoverable errors, ensure resources are properly released.

**Implementation:** Covered in multiple code examples

### Question 5: Optimize Stream Performance  
Identify and fix performance bottlenecks in a streaming data processing application.

**Approach:** Profile buffer usage and allocation patterns, optimize highWaterMark settings, implement object pooling, minimize synchronous operations, use worker threads for CPU-intensive tasks.

**Implementation:** Performance patterns shown across all examples

## Performance Considerations

### Buffer Size Optimization
The `highWaterMark` option controls internal buffer size. Larger buffers reduce system calls but increase memory usage. Optimal size depends on data characteristics and available memory.

### Object Mode vs Binary Mode
Object mode streams work with JavaScript objects instead of buffers/strings. They're more convenient but have higher overhead. Use binary mode for performance-critical applications.

### Stream Composition
Chaining multiple streams creates processing pipelines. Each stage adds overhead, so minimize unnecessary transformations. Use `pipeline()` for better error handling and cleanup.

### Memory Pool Management
Node.js uses memory pools for buffer allocation. Understanding pool behavior helps optimize allocation patterns and reduce fragmentation.

## Testing Strategies

### Mock Stream Testing
Create mock readable/writable streams for testing stream consumers/producers. Use `PassThrough` streams as test doubles.

### Backpressure Simulation
Test backpressure handling by creating slow consumers or fast producers. Verify memory usage remains bounded under stress.

### Error Condition Testing
Test error propagation through stream pipelines. Verify proper cleanup when errors occur at different stages.

### Performance Testing
Measure throughput, latency, and memory usage under various load conditions. Profile buffer allocation and garbage collection impact.

## Related Topics
- [Event Loop Basics](../event-loop/README.md) - Understanding async operations
- [Memory Management](../memory/README.md) - Buffer allocation and GC impact
- [File System Operations](../../api-design/rest/README.md) - Stream-based file handling
- [HTTP Streaming](../../api-design/realtime/README.md) - Network stream applications