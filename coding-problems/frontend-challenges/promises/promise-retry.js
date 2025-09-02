/**
 * File: promise-retry.js
 * Description: Multiple implementations of promise retry mechanisms with backoff strategies
 * 
 * Learning objectives:
 * - Understand retry patterns and error recovery
 * - Learn different backoff strategies (exponential, linear, fixed)
 * - See circuit breaker and timeout handling patterns
 * 
 * Time Complexity: O(n) where n is number of retry attempts
 * Space Complexity: O(1) additional space per retry
 */

// =======================
// Approach 1: Basic Promise Retry
// =======================

/**
 * Basic retry implementation with fixed delay
 * Retries a promise-returning function until success or max attempts reached
 * 
 * Mental model: Keep trying the same operation with a pause between attempts
 */
function retryBasic(promiseFn, maxAttempts = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attemptCount = 0;
    
    function attempt() {
      attemptCount++;
      
      // Execute the promise function
      Promise.resolve()
        .then(() => promiseFn())
        .then(result => {
          // Success - resolve with result
          resolve(result);
        })
        .catch(error => {
          console.log(`Attempt ${attemptCount} failed:`, error.message);
          
          if (attemptCount >= maxAttempts) {
            // No more attempts - reject with last error
            reject(new Error(`Failed after ${maxAttempts} attempts. Last error: ${error.message}`));
          } else {
            // Wait and try again
            setTimeout(attempt, delay);
          }
        });
    }
    
    // Start first attempt
    attempt();
  });
}

// =======================
// Approach 2: Exponential Backoff Retry
// =======================

/**
 * Retry with exponential backoff - delay increases exponentially
 * Common pattern: 1s, 2s, 4s, 8s, etc. with optional jitter
 */
function retryWithExponentialBackoff(promiseFn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    onRetry = null
  } = options;
  
  return new Promise((resolve, reject) => {
    let attemptCount = 0;
    
    async function attempt() {
      attemptCount++;
      
      try {
        const result = await promiseFn();
        resolve(result);
      } catch (error) {
        if (attemptCount >= maxAttempts) {
          reject(new Error(`Failed after ${maxAttempts} attempts. Last error: ${error.message}`));
          return;
        }
        
        // Calculate delay with exponential backoff
        let delay = Math.min(baseDelay * Math.pow(backoffMultiplier, attemptCount - 1), maxDelay);
        
        // Add jitter to avoid thundering herd problem
        if (jitter) {
          delay = delay * (0.5 + Math.random() * 0.5); // Random between 50%-100% of calculated delay
        }
        
        // Call retry callback if provided
        if (onRetry) {
          onRetry(error, attemptCount, delay);
        }
        
        console.log(`Retry ${attemptCount}/${maxAttempts} in ${Math.round(delay)}ms`);
        
        // Wait and retry
        setTimeout(attempt, delay);
      }
    }
    
    attempt();
  });
}

// =======================
// Approach 3: Conditional Retry
// =======================

/**
 * Retry with conditions - only retry on specific errors
 * Different strategies for different types of errors
 */
function retryConditional(promiseFn, options = {}) {
  const {
    maxAttempts = 3,
    shouldRetry = (error) => true, // Function to determine if error should be retried
    getDelay = (attemptCount) => 1000, // Function to determine delay
    onRetry = null,
    timeout = null // Overall timeout for all attempts
  } = options;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let attemptCount = 0;
    
    async function attempt() {
      // Check overall timeout
      if (timeout && Date.now() - startTime > timeout) {
        reject(new Error(`Operation timed out after ${timeout}ms`));
        return;
      }
      
      attemptCount++;
      
      try {
        const result = await promiseFn();
        resolve(result);
      } catch (error) {
        // Check if we should retry this error
        if (!shouldRetry(error)) {
          reject(error);
          return;
        }
        
        if (attemptCount >= maxAttempts) {
          reject(new Error(`Failed after ${maxAttempts} attempts. Last error: ${error.message}`));
          return;
        }
        
        const delay = getDelay(attemptCount);
        
        if (onRetry) {
          onRetry(error, attemptCount, delay);
        }
        
        console.log(`Retrying attempt ${attemptCount} after ${delay}ms due to:`, error.message);
        setTimeout(attempt, delay);
      }
    }
    
    attempt();
  });
}

// =======================
// Approach 4: Circuit Breaker Pattern
// =======================

/**
 * Circuit breaker with retry - prevents cascade failures
 * Three states: CLOSED (normal), OPEN (failing), HALF_OPEN (testing)
 */
class CircuitBreakerWithRetry {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    this.retryOptions = options.retryOptions || { maxAttempts: 3, baseDelay: 1000 };
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.requestCount = 0;
  }
  
  async execute(promiseFn) {
    if (this.state === 'OPEN') {
      // Check if we should try to recover
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker: Moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - requests blocked');
      }
    }
    
    try {
      // Execute with retry
      const result = await retryWithExponentialBackoff(promiseFn, this.retryOptions);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }
  
  onSuccess() {
    this.requestCount++;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      // If we have enough successes, close the circuit
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        console.log('Circuit breaker: Moving to CLOSED state');
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }
  
  onFailure(error) {
    this.requestCount++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN') {
      // Failed while testing - back to OPEN
      this.state = 'OPEN';
      this.successCount = 0;
      console.log('Circuit breaker: Back to OPEN state after failure');
    } else if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
      // Too many failures - open circuit
      this.state = 'OPEN';
      console.log('Circuit breaker: Moving to OPEN state due to failures');
    }
  }
  
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      requestCount: this.requestCount,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.requestCount = 0;
    this.lastFailureTime = null;
  }
}

// =======================
// Approach 5: Retry with Abort Signal
// =======================

/**
 * Retry implementation with cancellation support
 * Allows aborting retry attempts using AbortSignal
 */
function retryWithAbort(promiseFn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    signal = null, // AbortSignal for cancellation
    onRetry = null
  } = options;
  
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation was aborted before starting'));
      return;
    }
    
    let attemptCount = 0;
    let timeoutId;
    
    // Handle abort signal
    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new Error('Operation was aborted'));
    };
    
    signal?.addEventListener('abort', onAbort);
    
    async function attempt() {
      if (signal?.aborted) {
        onAbort();
        return;
      }
      
      attemptCount++;
      
      try {
        const result = await promiseFn(signal); // Pass signal to promise function
        signal?.removeEventListener('abort', onAbort);
        resolve(result);
      } catch (error) {
        if (signal?.aborted) {
          onAbort();
          return;
        }
        
        if (attemptCount >= maxAttempts) {
          signal?.removeEventListener('abort', onAbort);
          reject(new Error(`Failed after ${maxAttempts} attempts. Last error: ${error.message}`));
          return;
        }
        
        const delay = baseDelay * Math.pow(2, attemptCount - 1);
        
        if (onRetry) {
          onRetry(error, attemptCount, delay);
        }
        
        console.log(`Retry ${attemptCount}/${maxAttempts} in ${delay}ms`);
        
        timeoutId = setTimeout(attempt, delay);
      }
    }
    
    attempt();
  });
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Promise Retry Examples ===');

// Mock functions for testing
function unreliableAPI(successRate = 0.3) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < successRate) {
        resolve({ data: 'Success!', timestamp: Date.now() });
      } else {
        reject(new Error('API request failed'));
      }
    }, Math.random() * 500 + 100); // Random delay 100-600ms
  });
}

function networkRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 200 + 50;
    
    setTimeout(() => {
      // Simulate different types of errors
      const rand = Math.random();
      
      if (rand < 0.2) {
        reject(new Error('Network timeout'));
      } else if (rand < 0.4) {
        reject(new Error('500 Internal Server Error'));
      } else if (rand < 0.5) {
        reject(new Error('404 Not Found'));
      } else {
        resolve({ url, data: `Response from ${url}`, status: 200 });
      }
    }, delay);
  });
}

// Test basic retry
async function testBasicRetry() {
  console.log('\n--- Testing Basic Retry ---');
  
  try {
    const result = await retryBasic(() => unreliableAPI(0.4), 5, 500);
    console.log('Basic retry succeeded:', result);
  } catch (error) {
    console.log('Basic retry failed:', error.message);
  }
}

// Test exponential backoff
async function testExponentialBackoff() {
  console.log('\n--- Testing Exponential Backoff ---');
  
  try {
    const result = await retryWithExponentialBackoff(
      () => unreliableAPI(0.3),
      {
        maxAttempts: 4,
        baseDelay: 100,
        maxDelay: 2000,
        onRetry: (error, attempt, delay) => {
          console.log(`Exponential backoff retry ${attempt}, delay: ${Math.round(delay)}ms`);
        }
      }
    );
    console.log('Exponential backoff succeeded:', result);
  } catch (error) {
    console.log('Exponential backoff failed:', error.message);
  }
}

// Test conditional retry
async function testConditionalRetry() {
  console.log('\n--- Testing Conditional Retry ---');
  
  try {
    const result = await retryConditional(
      () => networkRequest('/api/data'),
      {
        maxAttempts: 3,
        shouldRetry: (error) => {
          // Only retry on network errors, not 404s
          return !error.message.includes('404');
        },
        getDelay: (attempt) => 1000 * attempt, // Linear backoff
        onRetry: (error, attempt, delay) => {
          console.log(`Conditional retry ${attempt}: ${error.message}`);
        }
      }
    );
    console.log('Conditional retry succeeded:', result);
  } catch (error) {
    console.log('Conditional retry failed:', error.message);
  }
}

// Run tests
testBasicRetry();
testExponentialBackoff();
testConditionalRetry();

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: HTTP Client with Retry
 * Robust HTTP client with intelligent retry logic
 */
function createHTTPClient() {
  const circuitBreaker = new CircuitBreakerWithRetry({
    failureThreshold: 3,
    recoveryTimeout: 10000,
    retryOptions: { maxAttempts: 3, baseDelay: 1000 }
  });
  
  return {
    async get(url, options = {}) {
      const requestFn = async (signal) => {
        // Mock fetch implementation
        return networkRequest(url, { ...options, signal });
      };
      
      return circuitBreaker.execute(requestFn);
    },
    
    async post(url, data, options = {}) {
      const requestFn = async (signal) => {
        return networkRequest(url, { method: 'POST', body: data, ...options, signal });
      };
      
      return retryConditional(requestFn, {
        maxAttempts: 3,
        shouldRetry: (error) => {
          // Retry on 5xx errors but not 4xx
          return error.message.includes('500') || error.message.includes('timeout');
        },
        getDelay: (attempt) => 1000 * Math.pow(2, attempt - 1)
      });
    },
    
    // Get circuit breaker stats
    getStats: () => circuitBreaker.getStats(),
    
    // Reset circuit breaker
    reset: () => circuitBreaker.reset()
  };
}

/**
 * Use Case 2: Database Connection Pool with Retry
 * Database operations with connection retry and backoff
 */
function createDatabaseClient() {
  let connectionPool = [];
  const maxConnections = 5;
  
  // Mock database operations
  const mockDBOperation = async (query) => {
    const rand = Math.random();
    
    if (rand < 0.1) {
      throw new Error('Connection lost');
    } else if (rand < 0.2) {
      throw new Error('Lock timeout');
    } else if (rand < 0.25) {
      throw new Error('Deadlock detected');
    }
    
    return { query, result: `Result for: ${query}`, rows: Math.floor(Math.random() * 100) };
  };
  
  return {
    async query(sql, params = []) {
      return retryConditional(
        () => mockDBOperation(sql),
        {
          maxAttempts: 5,
          shouldRetry: (error) => {
            // Retry on connection issues but not syntax errors
            const retryableErrors = ['Connection lost', 'Lock timeout', 'Deadlock detected'];
            return retryableErrors.some(msg => error.message.includes(msg));
          },
          getDelay: (attempt) => {
            // Progressive delay: 100ms, 500ms, 1s, 2s, 4s
            return Math.min(100 * Math.pow(2.5, attempt - 1), 4000);
          },
          onRetry: (error, attempt, delay) => {
            console.log(`DB retry ${attempt}: ${error.message} (waiting ${delay}ms)`);
          }
        }
      );
    },
    
    async transaction(queries) {
      // Execute multiple queries with transaction retry
      return retryWithExponentialBackoff(
        async () => {
          console.log('Starting transaction...');
          const results = [];
          
          for (const query of queries) {
            const result = await mockDBOperation(query);
            results.push(result);
          }
          
          console.log('Transaction completed');
          return results;
        },
        {
          maxAttempts: 3,
          baseDelay: 500,
          onRetry: (error, attempt, delay) => {
            console.log(`Transaction retry ${attempt}: ${error.message}`);
          }
        }
      );
    }
  };
}

/**
 * Use Case 3: File Upload with Progress and Retry
 * File upload with chunked retry and progress tracking
 */
function createFileUploader() {
  return {
    async uploadFile(file, options = {}) {
      const {
        chunkSize = 1024 * 1024, // 1MB chunks
        maxRetries = 3,
        onProgress = null,
        signal = null
      } = options;
      
      const totalChunks = Math.ceil(file.size / chunkSize);
      const uploadedChunks = new Set();
      
      // Mock chunk upload function
      const uploadChunk = async (chunkIndex) => {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        // Simulate chunk upload
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.8) { // 80% success rate per chunk
              resolve();
            } else {
              reject(new Error(`Chunk ${chunkIndex} upload failed`));
            }
          }, Math.random() * 200 + 50);
        });
        
        return { chunkIndex, size: chunk.size };
      };
      
      // Upload each chunk with retry
      for (let i = 0; i < totalChunks; i++) {
        if (signal?.aborted) {
          throw new Error('Upload cancelled');
        }
        
        if (uploadedChunks.has(i)) {
          continue; // Skip already uploaded chunks
        }
        
        try {
          await retryWithExponentialBackoff(
            () => uploadChunk(i),
            {
              maxAttempts: maxRetries,
              baseDelay: 500,
              onRetry: (error, attempt) => {
                console.log(`Retrying chunk ${i}, attempt ${attempt}: ${error.message}`);
              }
            }
          );
          
          uploadedChunks.add(i);
          
          // Report progress
          if (onProgress) {
            const progress = uploadedChunks.size / totalChunks;
            onProgress(progress, uploadedChunks.size, totalChunks);
          }
        } catch (error) {
          throw new Error(`Failed to upload chunk ${i} after ${maxRetries} attempts`);
        }
      }
      
      // Finalize upload
      console.log(`Upload complete: ${file.name} (${file.size} bytes)`);
      return {
        filename: file.name,
        size: file.size,
        chunks: totalChunks,
        uploadTime: Date.now()
      };
    }
  };
}

/**
 * Use Case 4: Microservice Communication
 * Inter-service communication with retry and fallback
 */
function createServiceClient(serviceName) {
  const endpoints = [`${serviceName}-1`, `${serviceName}-2`, `${serviceName}-3`];
  let currentEndpoint = 0;
  
  const makeRequest = async (endpoint, method, path, data) => {
    // Mock service request
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    const rand = Math.random();
    if (rand < 0.3) {
      throw new Error(`Service ${endpoint} unavailable`);
    }
    
    return {
      service: endpoint,
      method,
      path,
      data: data || null,
      timestamp: Date.now()
    };
  };
  
  return {
    async call(method, path, data, options = {}) {
      const { timeout = 5000, maxAttempts = 3 } = options;
      
      return retryConditional(
        async () => {
          // Try current endpoint
          const endpoint = endpoints[currentEndpoint];
          
          try {
            return await makeRequest(endpoint, method, path, data);
          } catch (error) {
            // Switch to next endpoint on failure
            currentEndpoint = (currentEndpoint + 1) % endpoints.length;
            throw error;
          }
        },
        {
          maxAttempts,
          timeout,
          shouldRetry: (error) => {
            // Retry on service unavailable, but not on invalid requests
            return error.message.includes('unavailable');
          },
          getDelay: (attempt) => 500 * attempt,
          onRetry: (error, attempt, delay) => {
            console.log(`Service retry ${attempt}: ${error.message} (next endpoint: ${endpoints[currentEndpoint]})`);
          }
        }
      );
    },
    
    // Health check with circuit breaker
    async healthCheck() {
      const circuitBreaker = new CircuitBreakerWithRetry({
        failureThreshold: 2,
        recoveryTimeout: 5000
      });
      
      return circuitBreaker.execute(() => makeRequest(endpoints[0], 'GET', '/health'));
    }
  };
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===');
  
  // HTTP Client
  const httpClient = createHTTPClient();
  try {
    const response = await httpClient.get('/api/users');
    console.log('HTTP request succeeded:', response.status);
  } catch (error) {
    console.log('HTTP request failed:', error.message);
  }
  console.log('Circuit breaker stats:', httpClient.getStats());
  
  // Database Client
  const dbClient = createDatabaseClient();
  try {
    const result = await dbClient.query('SELECT * FROM users WHERE active = ?', [true]);
    console.log('DB query succeeded:', result.rows, 'rows');
  } catch (error) {
    console.log('DB query failed:', error.message);
  }
  
  // File Uploader
  const uploader = createFileUploader();
  const mockFile = {
    name: 'document.pdf',
    size: 5 * 1024 * 1024, // 5MB
    slice: (start, end) => ({ size: end - start })
  };
  
  try {
    const result = await uploader.uploadFile(mockFile, {
      onProgress: (progress, completed, total) => {
        console.log(`Upload progress: ${Math.round(progress * 100)}% (${completed}/${total} chunks)`);
      }
    });
    console.log('File upload succeeded:', result.filename);
  } catch (error) {
    console.log('File upload failed:', error.message);
  }
  
  // Service Client
  const serviceClient = createServiceClient('user-service');
  try {
    const response = await serviceClient.call('GET', '/users/123');
    console.log('Service call succeeded:', response.service);
  } catch (error) {
    console.log('Service call failed:', error.message);
  }
}, 2000);

// Export all implementations
module.exports = {
  retryBasic,
  retryWithExponentialBackoff,
  retryConditional,
  CircuitBreakerWithRetry,
  retryWithAbort,
  createHTTPClient,
  createDatabaseClient,
  createFileUploader,
  createServiceClient
};

/**
 * Key Interview Points:
 * 
 * 1. Retry Strategies:
 *    - Fixed delay: Simple but can overload systems
 *    - Linear backoff: Gradual increase in delay
 *    - Exponential backoff: Rapid increase, prevents thundering herd
 *    - Jitter: Random component to spread out retries
 * 
 * 2. Error Classification:
 *    - Transient errors: Network timeouts, temporary unavailability
 *    - Permanent errors: 404 not found, authentication failures
 *    - Only retry transient errors
 * 
 * 3. Circuit Breaker Pattern:
 *    - Prevents cascade failures
 *    - Three states: CLOSED, OPEN, HALF_OPEN
 *    - Automatic recovery testing
 * 
 * 4. Cancellation Support:
 *    - AbortSignal for clean cancellation
 *    - Cleanup of timeouts and resources
 *    - Propagation to underlying operations
 * 
 * 5. Real-world Considerations:
 *    - Rate limiting and backpressure
 *    - Monitoring and observability
 *    - Fallback mechanisms
 *    - Resource cleanup
 * 
 * 6. Performance Impact:
 *    - Memory usage during retries
 *    - Thread/event loop blocking
 *    - Network resource consumption
 *    - Total operation timeout
 */