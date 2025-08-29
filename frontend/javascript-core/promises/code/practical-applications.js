/**
 * File: practical-applications.js
 * Description: Real-world Promise applications including API handling, data processing, and resource management
 * Time Complexity: Varies by application (noted per function)
 * Space Complexity: Varies by application (noted per function)
 */

// HTTP Request Management with Promises
// Handles retries, timeouts, caching, and request deduplication
class HTTPClient {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 5000,
      retries: 3,
      retryDelay: 1000,
      ...options
    };
    
    // Request deduplication - prevent multiple identical requests
    this.pendingRequests = new Map();
    
    // Response cache with TTL
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 300000; // 5 minutes default
  }
  
  // Core request method with comprehensive error handling
  // Time Complexity: O(1) + network time
  async request(endpoint, options = {}) {
    const requestKey = this._generateRequestKey(endpoint, options);
    
    // Check cache first
    if (this._isCacheValid(requestKey)) {
      console.log(`Cache hit for ${endpoint}`);
      return this.cache.get(requestKey).data;
    }
    
    // Check for duplicate pending request
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Returning pending request for ${endpoint}`);
      return this.pendingRequests.get(requestKey);
    }
    
    // Create new request with retry logic
    const requestPromise = this._executeWithRetry(endpoint, options);
    this.pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // Cache successful responses
      if (options.cache !== false) {
        this._cacheResponse(requestKey, result);
      }
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(requestKey);
    }
  }
  
  // Retry mechanism with exponential backoff
  async _executeWithRetry(endpoint, options) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let lastError;
    
    for (let attempt = 1; attempt <= mergedOptions.retries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${mergedOptions.retries} for ${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, mergedOptions.timeout);
        
        // Simulate HTTP request (in real app, use fetch)
        const response = await this._simulateRequest(endpoint, {
          ...mergedOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors (4xx client errors)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Apply exponential backoff delay before retry
        if (attempt < mergedOptions.retries) {
          const delay = mergedOptions.retryDelay * Math.pow(2, attempt - 1);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`All ${mergedOptions.retries} attempts failed. Last error: ${lastError.message}`);
  }
  
  // Simulate HTTP request for demo purposes
  async _simulateRequest(endpoint, options) {
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 1000 + 500; // 500-1500ms
      
      setTimeout(() => {
        // Simulate various response scenarios
        const random = Math.random();
        
        if (random < 0.1) {
          reject({ message: 'Network error', status: 0 });
        } else if (random < 0.2) {
          reject({ message: 'Server error', status: 500 });
        } else if (random < 0.3) {
          reject({ message: 'Not found', status: 404 });
        } else {
          resolve({
            data: `Response from ${endpoint}`,
            timestamp: Date.now(),
            endpoint
          });
        }
      }, delay);
    });
  }
  
  _generateRequestKey(endpoint, options) {
    return `${endpoint}:${JSON.stringify(options)}`;
  }
  
  _isCacheValid(requestKey) {
    if (!this.cache.has(requestKey)) return false;
    
    const cached = this.cache.get(requestKey);
    return (Date.now() - cached.timestamp) < this.cacheTTL;
  }
  
  _cacheResponse(requestKey, data) {
    this.cache.set(requestKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  // Batch request method - execute multiple requests efficiently
  // Time Complexity: O(n) where n is number of requests
  async batchRequest(requests, options = {}) {
    const { concurrency = 5, failFast = false } = options;
    
    console.log(`Executing ${requests.length} requests with concurrency ${concurrency}`);
    
    if (failFast) {
      // Use Promise.all - fail fast on any error
      const batches = this._createBatches(requests, concurrency);
      const results = [];
      
      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(req => this.request(req.endpoint, req.options))
        );
        results.push(...batchResults);
      }
      
      return results;
    } else {
      // Execute all and collect results/errors
      const promises = requests.map(async (req, index) => {
        try {
          const result = await this.request(req.endpoint, req.options);
          return { success: true, result, index };
        } catch (error) {
          return { success: false, error: error.message, index };
        }
      });
      
      const results = await Promise.all(promises);
      return {
        successful: results.filter(r => r.success).map(r => r.result),
        failed: results.filter(r => !r.success).map(r => ({ index: r.index, error: r.error }))
      };
    }
  }
  
  _createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  // Clear cache and pending requests
  clearCache() {
    this.cache.clear();
  }
  
  getCacheStats() {
    return {
      cachedItems: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Database Connection Pool Simulation
// Manages database connections with promise-based operations
class DatabasePool {
  constructor(maxConnections = 10, options = {}) {
    this.maxConnections = maxConnections;
    this.connections = [];
    this.waitingQueue = [];
    this.options = {
      connectionTimeout: 5000,
      queryTimeout: 30000,
      ...options
    };
    
    // Initialize connection pool
    this._initializePool();
  }
  
  _initializePool() {
    console.log(`Initializing database pool with ${this.maxConnections} connections`);
    
    for (let i = 0; i < this.maxConnections; i++) {
      this.connections.push({
        id: i,
        busy: false,
        created: Date.now(),
        lastUsed: Date.now()
      });
    }
  }
  
  // Get connection from pool with timeout
  async getConnection() {
    return new Promise((resolve, reject) => {
      // Check for available connection
      const availableConnection = this.connections.find(conn => !conn.busy);
      
      if (availableConnection) {
        availableConnection.busy = true;
        availableConnection.lastUsed = Date.now();
        console.log(`Acquired connection ${availableConnection.id}`);
        resolve(availableConnection);
        return;
      }
      
      // No available connections - add to waiting queue
      console.log('No available connections, adding to queue');
      
      const timeout = setTimeout(() => {
        // Remove from queue and reject
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection timeout - no available connections'));
      }, this.options.connectionTimeout);
      
      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }
  
  // Release connection back to pool
  releaseConnection(connection) {
    connection.busy = false;
    connection.lastUsed = Date.now();
    console.log(`Released connection ${connection.id}`);
    
    // Process waiting queue
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift();
      clearTimeout(next.timeout);
      
      connection.busy = true;
      next.resolve(connection);
    }
  }
  
  // Execute query with automatic connection management
  // Time Complexity: O(1) + query execution time
  async query(sql, params = []) {
    const connection = await this.getConnection();
    
    try {
      console.log(`Executing query on connection ${connection.id}:`, sql);
      
      // Simulate query execution with timeout
      const result = await Promise.race([
        this._executeQuery(sql, params, connection),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Query timeout'));
          }, this.options.queryTimeout);
        })
      ]);
      
      return result;
    } finally {
      this.releaseConnection(connection);
    }
  }
  
  // Transaction support with rollback on error
  async transaction(queries) {
    const connection = await this.getConnection();
    
    try {
      console.log(`Starting transaction on connection ${connection.id}`);
      await this._executeQuery('BEGIN', [], connection);
      
      const results = [];
      
      // Execute all queries in sequence
      for (const { sql, params } of queries) {
        const result = await this._executeQuery(sql, params, connection);
        results.push(result);
      }
      
      await this._executeQuery('COMMIT', [], connection);
      console.log('Transaction committed successfully');
      return results;
      
    } catch (error) {
      console.log('Transaction error, rolling back:', error.message);
      await this._executeQuery('ROLLBACK', [], connection);
      throw error;
    } finally {
      this.releaseConnection(connection);
    }
  }
  
  // Simulate query execution
  async _executeQuery(sql, params, connection) {
    return new Promise((resolve, reject) => {
      // Simulate database query delay
      const delay = Math.random() * 500 + 100; // 100-600ms
      
      setTimeout(() => {
        // Simulate occasional query failures
        if (Math.random() < 0.05) { // 5% failure rate
          reject(new Error(`Query failed: ${sql}`));
          return;
        }
        
        resolve({
          sql,
          params,
          connectionId: connection.id,
          rowCount: Math.floor(Math.random() * 100),
          executionTime: delay
        });
      }, delay);
    });
  }
  
  // Pool statistics
  getPoolStats() {
    const busyConnections = this.connections.filter(conn => conn.busy).length;
    const availableConnections = this.connections.length - busyConnections;
    
    return {
      total: this.connections.length,
      busy: busyConnections,
      available: availableConnections,
      queueLength: this.waitingQueue.length
    };
  }
}

// File Processing Pipeline
// Processes files asynchronously with progress tracking and error recovery
class FileProcessor {
  constructor(options = {}) {
    this.options = {
      concurrency: 3,
      retries: 2,
      chunkSize: 1024,
      ...options
    };
  }
  
  // Process multiple files with progress tracking
  // Time Complexity: O(n) where n is number of files
  async processFiles(files, processor) {
    console.log(`Processing ${files.length} files with concurrency ${this.options.concurrency}`);
    
    const results = [];
    const errors = [];
    let completed = 0;
    
    // Create progress tracking promise
    const progressPromise = this._trackProgress(files.length, () => completed);
    
    // Process files with controlled concurrency
    const processingPromise = this._processWithConcurrency(
      files,
      async (file, index) => {
        try {
          console.log(`Starting processing file ${index + 1}: ${file.name}`);
          const result = await this._processFile(file, processor);
          results[index] = result;
          console.log(`Completed file ${index + 1}: ${file.name}`);
        } catch (error) {
          console.error(`Failed to process file ${index + 1}: ${file.name}`, error.message);
          errors.push({ index, file: file.name, error: error.message });
        } finally {
          completed++;
        }
      }
    );
    
    // Wait for both processing and progress tracking to complete
    await Promise.all([processingPromise, progressPromise]);
    
    return {
      results: results.filter(r => r !== undefined),
      errors,
      summary: {
        total: files.length,
        successful: results.filter(r => r !== undefined).length,
        failed: errors.length
      }
    };
  }
  
  // Process individual file with retry logic
  async _processFile(file, processor) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.options.retries + 1; attempt++) {
      try {
        // Simulate file reading and processing
        const content = await this._readFile(file);
        const processed = await processor(content, file);
        return processed;
      } catch (error) {
        lastError = error;
        
        if (attempt <= this.options.retries) {
          console.log(`File processing attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw new Error(`Failed to process file after ${this.options.retries + 1} attempts: ${lastError.message}`);
  }
  
  // Simulate file reading
  async _readFile(file) {
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 1000 + 500; // 500-1500ms
      
      setTimeout(() => {
        // Simulate occasional read failures
        if (Math.random() < 0.1) { // 10% failure rate
          reject(new Error(`Failed to read file: ${file.name}`));
          return;
        }
        
        resolve({
          name: file.name,
          size: file.size || Math.floor(Math.random() * 10000),
          content: `Content of ${file.name}`,
          timestamp: Date.now()
        });
      }, delay);
    });
  }
  
  // Controlled concurrency processing
  async _processWithConcurrency(items, processor) {
    const executing = [];
    
    for (let i = 0; i < items.length; i++) {
      const promise = processor(items[i], i);
      executing.push(promise);
      
      // If we've reached concurrency limit, wait for one to complete
      if (executing.length >= this.options.concurrency) {
        await Promise.race(executing);
        
        // Remove completed promises
        for (let j = executing.length - 1; j >= 0; j--) {
          const settled = await Promise.allSettled([executing[j]]);
          if (settled[0].status !== 'pending') {
            executing.splice(j, 1);
          }
        }
      }
    }
    
    // Wait for all remaining promises
    await Promise.all(executing);
  }
  
  // Progress tracking utility
  async _trackProgress(total, getCompleted) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const completed = getCompleted();
        const percentage = Math.round((completed / total) * 100);
        console.log(`Progress: ${completed}/${total} (${percentage}%)`);
        
        if (completed >= total) {
          clearInterval(interval);
          console.log('Processing complete!');
          resolve();
        }
      }, 1000);
    });
  }
}

// Example Usage and Testing
async function runPracticalApplicationsDemo() {
  console.log('=== Practical Promise Applications Demo ===\n');
  
  // 1. HTTP Client with retries and caching
  console.log('1. HTTP Client Demo:');
  const httpClient = new HTTPClient('https://api.example.com', {
    timeout: 2000,
    retries: 3,
    cacheTTL: 5000
  });
  
  try {
    // Single request
    const result1 = await httpClient.request('/users/1');
    console.log('Single request result:', result1.data);
    
    // Batch requests
    const batchRequests = [
      { endpoint: '/users/1', options: {} },
      { endpoint: '/users/2', options: {} },
      { endpoint: '/posts/1', options: {} }
    ];
    
    const batchResults = await httpClient.batchRequest(batchRequests, { concurrency: 2 });
    console.log('Batch results:', batchResults);
    
    console.log('HTTP Client stats:', httpClient.getCacheStats());
  } catch (error) {
    console.error('HTTP Client error:', error.message);
  }
  
  // 2. Database connection pool
  console.log('\n2. Database Pool Demo:');
  const dbPool = new DatabasePool(3);
  
  try {
    // Single query
    const queryResult = await dbPool.query('SELECT * FROM users WHERE id = ?', [1]);
    console.log('Query result:', queryResult);
    
    // Transaction
    const transactionQueries = [
      { sql: 'INSERT INTO users (name) VALUES (?)', params: ['John'] },
      { sql: 'INSERT INTO profiles (user_id, bio) VALUES (?, ?)', params: [1, 'Developer'] }
    ];
    
    const transactionResult = await dbPool.transaction(transactionQueries);
    console.log('Transaction result:', transactionResult);
    
    console.log('Pool stats:', dbPool.getPoolStats());
  } catch (error) {
    console.error('Database error:', error.message);
  }
  
  // 3. File processing pipeline
  console.log('\n3. File Processing Demo:');
  const fileProcessor = new FileProcessor({ concurrency: 2, retries: 1 });
  
  // Simulate files to process
  const files = [
    { name: 'file1.txt', size: 1024 },
    { name: 'file2.txt', size: 2048 },
    { name: 'file3.txt', size: 512 },
    { name: 'file4.txt', size: 4096 }
  ];
  
  // Custom processor function
  const processor = async (content, file) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    return {
      originalName: file.name,
      processedSize: content.size,
      processedAt: Date.now(),
      checksum: Math.random().toString(36).substring(2, 15)
    };
  };
  
  try {
    const processingResult = await fileProcessor.processFiles(files, processor);
    console.log('File processing summary:', processingResult.summary);
    console.log('Processed files:', processingResult.results.length);
    console.log('Errors:', processingResult.errors.length);
  } catch (error) {
    console.error('File processing error:', error.message);
  }
  
  console.log('\n=== Practical Applications Demo Complete ===');
}

// Export for use in other modules
module.exports = {
  HTTPClient,
  DatabasePool,
  FileProcessor,
  runPracticalApplicationsDemo
};