/**
 * File: basic-streams.js
 * Description: Basic implementation of Node.js Streams API patterns for data processing
 * 
 * Learning objectives:
 * - Understand streaming data patterns and backpressure
 * - Learn event-driven data processing architectures
 * - See memory-efficient data transformation techniques
 * 
 * Time Complexity: O(1) per chunk, O(n) overall where n is total data
 * Space Complexity: O(k) where k is buffer size, not total data size
 */

// =======================
// Approach 1: Basic Readable Stream
// =======================

/**
 * Basic readable stream implementation
 * Generates data on-demand with flow control
 * 
 * Mental model: Data source that can be consumed piece by piece
 * Prevents memory issues by processing data in chunks
 */
class ReadableStream {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 16384; // 16KB default
    this.objectMode = options.objectMode || false;
    
    // Internal state
    this.readable = true;
    this.destroyed = false;
    this.flowing = null; // null, true, false
    this.buffer = [];
    this.reading = false;
    this.ended = false;
    
    // Event system
    this.listeners = new Map();
    
    // Async iterator support
    this.iterator = null;
  }
  
  /**
   * Add event listener
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
    
    // Auto-start flowing mode for 'data' listeners
    if (event === 'data' && this.flowing === null) {
      this.flowing = true;
      process.nextTick(() => this._read());
    }
    
    return this;
  }
  
  /**
   * Remove event listener
   */
  off(event, listener) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }
  
  /**
   * Emit event to listeners
   */
  emit(event, ...args) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          process.nextTick(() => this.emit('error', error));
        }
      });
    }
  }
  
  /**
   * Push data to internal buffer
   * Returns false if buffer is full (backpressure)
   */
  push(chunk) {
    if (this.ended) {
      this.emit('error', new Error('Cannot push after EOF'));
      return false;
    }
    
    // null indicates end of data
    if (chunk === null) {
      this.ended = true;
      this.readable = false;
      this.emit('end');
      return false;
    }
    
    // Add to buffer
    this.buffer.push(chunk);
    
    // Emit data if in flowing mode
    if (this.flowing) {
      process.nextTick(() => this._emitData());
    }
    
    // Check backpressure
    const bufferSize = this.objectMode 
      ? this.buffer.length 
      : this.buffer.reduce((size, chunk) => size + chunk.length, 0);
    
    return bufferSize < this.highWaterMark;
  }
  
  /**
   * Read data from stream (pull mode)
   */
  read(size) {
    if (!this.readable || this.buffer.length === 0) {
      return null;
    }
    
    let chunk;
    if (this.objectMode || !size) {
      chunk = this.buffer.shift();
    } else {
      // Handle byte-based reading
      chunk = this._readBytes(size);
    }
    
    // Trigger more data production
    if (this.buffer.length === 0 && !this.ended) {
      process.nextTick(() => this._read());
    }
    
    return chunk;
  }
  
  /**
   * Read specific number of bytes
   */
  _readBytes(size) {
    let result = '';
    let remaining = size;
    
    while (remaining > 0 && this.buffer.length > 0) {
      const chunk = this.buffer[0];
      
      if (chunk.length <= remaining) {
        result += chunk;
        remaining -= chunk.length;
        this.buffer.shift();
      } else {
        result += chunk.slice(0, remaining);
        this.buffer[0] = chunk.slice(remaining);
        remaining = 0;
      }
    }
    
    return result;
  }
  
  /**
   * Emit data in flowing mode
   */
  _emitData() {
    while (this.buffer.length > 0 && this.flowing) {
      const chunk = this.buffer.shift();
      this.emit('data', chunk);
    }
    
    if (this.buffer.length === 0 && !this.ended) {
      this._read();
    }
  }
  
  /**
   * Internal method to read more data (to be overridden)
   */
  _read() {
    // Override this method in subclasses
    // Should call push() to add data to buffer
  }
  
  /**
   * Pause the stream (stop flowing mode)
   */
  pause() {
    if (this.flowing !== false) {
      this.flowing = false;
      this.emit('pause');
    }
    return this;
  }
  
  /**
   * Resume the stream (start flowing mode)
   */
  resume() {
    if (this.flowing !== true) {
      this.flowing = true;
      this.emit('resume');
      process.nextTick(() => this._emitData());
    }
    return this;
  }
  
  /**
   * Destroy the stream
   */
  destroy(error) {
    if (this.destroyed) return;
    
    this.destroyed = true;
    this.readable = false;
    
    if (error) {
      this.emit('error', error);
    }
    
    this.emit('close');
  }
  
  /**
   * Async iterator support
   */
  [Symbol.asyncIterator]() {
    return {
      next: () => {
        return new Promise((resolve, reject) => {
          if (this.ended && this.buffer.length === 0) {
            resolve({ done: true });
            return;
          }
          
          const chunk = this.read();
          if (chunk !== null) {
            resolve({ value: chunk, done: false });
          } else {
            const onData = (chunk) => {
              this.off('data', onData);
              this.off('end', onEnd);
              resolve({ value: chunk, done: false });
            };
            
            const onEnd = () => {
              this.off('data', onData);
              this.off('end', onEnd);
              resolve({ done: true });
            };
            
            this.on('data', onData);
            this.on('end', onEnd);
          }
        });
      }
    };
  }
}

// =======================
// Approach 2: Basic Writable Stream
// =======================

/**
 * Basic writable stream implementation
 * Accepts data chunks and processes them with backpressure support
 */
class WritableStream {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 16384;
    this.objectMode = options.objectMode || false;
    
    // Internal state
    this.writable = true;
    this.destroyed = false;
    this.ended = false;
    this.writing = false;
    this.buffer = [];
    this.bufferedSize = 0;
    
    // Event system
    this.listeners = new Map();
  }
  
  /**
   * Add event listener
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
    return this;
  }
  
  /**
   * Emit event
   */
  emit(event, ...args) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          process.nextTick(() => this.emit('error', error));
        }
      });
    }
  }
  
  /**
   * Write data to stream
   */
  write(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }
    
    if (!this.writable) {
      const error = new Error('Cannot write to non-writable stream');
      if (callback) {
        process.nextTick(() => callback(error));
      } else {
        this.emit('error', error);
      }
      return false;
    }
    
    // Add to buffer if currently writing
    if (this.writing) {
      this.buffer.push({ chunk, encoding, callback });
      this.bufferedSize += this.objectMode ? 1 : chunk.length;
      
      // Check backpressure
      return this.bufferedSize < this.highWaterMark;
    }
    
    // Write directly
    this.writing = true;
    process.nextTick(() => {
      this._write(chunk, encoding, (error) => {
        this.writing = false;
        
        if (callback) callback(error);
        
        if (error) {
          this.emit('error', error);
        } else {
          this.emit('drain');
          
          // Process buffer
          this._processBuffer();
        }
      });
    });
    
    return true;
  }
  
  /**
   * Internal write method (to be overridden)
   */
  _write(chunk, encoding, callback) {
    // Override this method in subclasses
    // Should call callback when done
    callback();
  }
  
  /**
   * Process buffered writes
   */
  _processBuffer() {
    if (this.buffer.length === 0 || this.writing) {
      return;
    }
    
    const { chunk, encoding, callback } = this.buffer.shift();
    this.bufferedSize -= this.objectMode ? 1 : chunk.length;
    
    this.writing = true;
    this._write(chunk, encoding, (error) => {
      this.writing = false;
      
      if (callback) callback(error);
      
      if (error) {
        this.emit('error', error);
      } else {
        if (this.buffer.length > 0) {
          process.nextTick(() => this._processBuffer());
        } else {
          this.emit('drain');
        }
      }
    });
  }
  
  /**
   * End the stream
   */
  end(chunk, encoding, callback) {
    if (typeof chunk === 'function') {
      callback = chunk;
      chunk = null;
    } else if (typeof encoding === 'function') {
      callback = encoding;
      encoding = 'utf8';
    }
    
    if (chunk !== null && chunk !== undefined) {
      this.write(chunk, encoding);
    }
    
    this.writable = false;
    this.ended = true;
    
    // Wait for buffer to drain
    const finish = () => {
      this.emit('finish');
      if (callback) callback();
    };
    
    if (this.buffer.length === 0 && !this.writing) {
      process.nextTick(finish);
    } else {
      this.on('drain', finish);
    }
  }
  
  /**
   * Destroy the stream
   */
  destroy(error) {
    if (this.destroyed) return;
    
    this.destroyed = true;
    this.writable = false;
    
    if (error) {
      this.emit('error', error);
    }
    
    this.emit('close');
  }
}

// =======================
// Approach 3: Transform Stream
// =======================

/**
 * Transform stream - combines readable and writable
 * Transforms data as it flows through
 */
class TransformStream {
  constructor(options = {}) {
    this.highWaterMark = options.highWaterMark || 16384;
    this.objectMode = options.objectMode || false;
    
    // Combine readable and writable state
    this.readable = true;
    this.writable = true;
    this.destroyed = false;
    
    // Buffers
    this.readableBuffer = [];
    this.writableBuffer = [];
    this.bufferedSize = 0;
    
    // State
    this.transforming = false;
    this.flowing = null;
    this.ended = false;
    
    // Event system
    this.listeners = new Map();
  }
  
  /**
   * Event system methods
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
    
    if (event === 'data' && this.flowing === null) {
      this.flowing = true;
      process.nextTick(() => this._emitData());
    }
    
    return this;
  }
  
  emit(event, ...args) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          process.nextTick(() => this.emit('error', error));
        }
      });
    }
  }
  
  /**
   * Write interface
   */
  write(chunk, encoding, callback) {
    if (!this.writable) {
      const error = new Error('Cannot write to non-writable stream');
      if (callback) process.nextTick(() => callback(error));
      return false;
    }
    
    this._processWrite(chunk, encoding, callback);
    return this.bufferedSize < this.highWaterMark;
  }
  
  /**
   * Process write with transformation
   */
  _processWrite(chunk, encoding, callback) {
    this.transforming = true;
    
    this._transform(chunk, encoding, (error, output) => {
      this.transforming = false;
      
      if (error) {
        if (callback) callback(error);
        this.emit('error', error);
        return;
      }
      
      // Push transformed data to readable side
      if (output !== null && output !== undefined) {
        this.readableBuffer.push(output);
        
        if (this.flowing) {
          process.nextTick(() => this._emitData());
        }
      }
      
      if (callback) callback();
    });
  }
  
  /**
   * Transform method (to be overridden)
   */
  _transform(chunk, encoding, callback) {
    // Override this method in subclasses
    // Should call callback(error, transformedData)
    callback(null, chunk);
  }
  
  /**
   * Read interface
   */
  read(size) {
    if (!this.readable || this.readableBuffer.length === 0) {
      return null;
    }
    
    return this.readableBuffer.shift();
  }
  
  /**
   * Emit data in flowing mode
   */
  _emitData() {
    while (this.readableBuffer.length > 0 && this.flowing) {
      const chunk = this.readableBuffer.shift();
      this.emit('data', chunk);
    }
  }
  
  /**
   * End the transform stream
   */
  end(chunk, encoding, callback) {
    if (chunk) {
      this.write(chunk, encoding);
    }
    
    this.writable = false;
    
    // Call flush if implemented
    if (typeof this._flush === 'function') {
      this._flush((error, output) => {
        if (error) {
          this.emit('error', error);
        } else {
          if (output) {
            this.readableBuffer.push(output);
            if (this.flowing) this._emitData();
          }
          
          this.readable = false;
          this.emit('end');
          if (callback) callback();
        }
      });
    } else {
      this.readable = false;
      this.emit('end');
      if (callback) callback();
    }
  }
  
  /**
   * Pipe to another stream
   */
  pipe(destination) {
    this.on('data', (chunk) => {
      const canWriteMore = destination.write(chunk);
      if (!canWriteMore) {
        this.pause();
        destination.once('drain', () => this.resume());
      }
    });
    
    this.on('end', () => {
      destination.end();
    });
    
    this.on('error', (error) => {
      destination.destroy(error);
    });
    
    return destination;
  }
  
  pause() {
    this.flowing = false;
    this.emit('pause');
    return this;
  }
  
  resume() {
    this.flowing = true;
    this.emit('resume');
    process.nextTick(() => this._emitData());
    return this;
  }
}

// =======================
// Approach 4: Practical Stream Implementations
// =======================

/**
 * Array source stream - reads from array
 */
class ArrayReadableStream extends ReadableStream {
  constructor(array, options = {}) {
    super(options);
    this.array = array;
    this.index = 0;
  }
  
  _read() {
    if (this.index < this.array.length) {
      this.push(this.array[this.index++]);
    } else {
      this.push(null); // End of stream
    }
  }
}

/**
 * Function transform stream
 */
class FunctionTransformStream extends TransformStream {
  constructor(transformFn, options = {}) {
    super(options);
    this.transformFn = transformFn;
  }
  
  _transform(chunk, encoding, callback) {
    try {
      const result = this.transformFn(chunk);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }
}

/**
 * Collecting writable stream - collects all data
 */
class CollectingWritableStream extends WritableStream {
  constructor(options = {}) {
    super(options);
    this.data = [];
  }
  
  _write(chunk, encoding, callback) {
    this.data.push(chunk);
    callback();
  }
  
  getData() {
    return this.objectMode ? this.data : this.data.join('');
  }
}

// =======================
// Utility Functions
// =======================

/**
 * Create a simple pipeline
 */
function pipeline(...streams) {
  return new Promise((resolve, reject) => {
    let current = streams[0];
    
    for (let i = 1; i < streams.length; i++) {
      current = current.pipe(streams[i]);
    }
    
    current.on('finish', resolve);
    current.on('error', reject);
    
    streams.forEach(stream => {
      stream.on('error', reject);
    });
  });
}

/**
 * Convert async iterator to readable stream
 */
function fromAsyncIterable(asyncIterable, options = {}) {
  return new (class extends ReadableStream {
    constructor() {
      super(options);
      this.iterator = asyncIterable[Symbol.asyncIterator]();
    }
    
    async _read() {
      try {
        const { value, done } = await this.iterator.next();
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      } catch (error) {
        this.destroy(error);
      }
    }
  })();
}

/**
 * Convert stream to async iterator
 */
async function* streamToAsyncIterable(stream) {
  const reader = stream[Symbol.asyncIterator] ? 
    stream[Symbol.asyncIterator]() :
    createAsyncIterator(stream);
    
  try {
    while (true) {
      const { value, done } = await reader.next();
      if (done) break;
      yield value;
    }
  } finally {
    if (typeof reader.return === 'function') {
      await reader.return();
    }
  }
}

function createAsyncIterator(stream) {
  let ended = false;
  const queue = [];
  const waiters = [];
  
  stream.on('data', (chunk) => {
    if (waiters.length > 0) {
      const waiter = waiters.shift();
      waiter.resolve({ value: chunk, done: false });
    } else {
      queue.push({ value: chunk, done: false });
    }
  });
  
  stream.on('end', () => {
    ended = true;
    while (waiters.length > 0) {
      const waiter = waiters.shift();
      waiter.resolve({ done: true });
    }
  });
  
  stream.on('error', (error) => {
    while (waiters.length > 0) {
      const waiter = waiters.shift();
      waiter.reject(error);
    }
  });
  
  return {
    next() {
      if (queue.length > 0) {
        return Promise.resolve(queue.shift());
      }
      
      if (ended) {
        return Promise.resolve({ done: true });
      }
      
      return new Promise((resolve, reject) => {
        waiters.push({ resolve, reject });
      });
    }
  };
}

// =======================
// Real-world Examples
// =======================

// Example: CSV processing stream
class CSVTransformStream extends TransformStream {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.headers = options.headers;
    this.delimiter = options.delimiter || ',';
    this.firstRow = true;
  }
  
  _transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    const results = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const fields = line.split(this.delimiter);
      
      if (this.firstRow && !this.headers) {
        this.headers = fields;
        this.firstRow = false;
        continue;
      }
      
      if (this.headers) {
        const obj = {};
        this.headers.forEach((header, index) => {
          obj[header] = fields[index];
        });
        results.push(obj);
      } else {
        results.push(fields);
      }
    }
    
    callback(null, results);
  }
}

// Example: Batch processing stream
class BatchTransformStream extends TransformStream {
  constructor(batchSize = 10, options = {}) {
    super({ ...options, objectMode: true });
    this.batchSize = batchSize;
    this.batch = [];
  }
  
  _transform(chunk, encoding, callback) {
    this.batch.push(chunk);
    
    if (this.batch.length >= this.batchSize) {
      const batch = this.batch;
      this.batch = [];
      callback(null, batch);
    } else {
      callback();
    }
  }
  
  _flush(callback) {
    if (this.batch.length > 0) {
      callback(null, this.batch);
    } else {
      callback();
    }
  }
}

// Export for use in other modules
module.exports = {
  ReadableStream,
  WritableStream,
  TransformStream,
  ArrayReadableStream,
  FunctionTransformStream,
  CollectingWritableStream,
  CSVTransformStream,
  BatchTransformStream,
  pipeline,
  fromAsyncIterable,
  streamToAsyncIterable
};