/**
 * File: cancelable-promise.js
 * Description: Implementation of cancelable promises with proper cleanup
 * 
 * Learning objectives:
 * - Understand promise cancellation patterns
 * - Learn AbortController and AbortSignal usage
 * - Implement proper resource cleanup on cancellation
 * - Handle race conditions between completion and cancellation
 * 
 * Time Complexity: O(1) for cancellation operations
 * Space Complexity: O(1) additional space per cancelable promise
 */

// =======================
// Approach 1: Basic Cancelable Promise
// =======================

/**
 * Basic cancelable promise implementation
 * Wraps a regular promise with cancellation capability
 * 
 * Mental model: Think of it like having a stop button for a running operation
 * The operation continues running but we ignore its result if cancelled
 */
class CancelablePromise {
  constructor(promiseOrExecutor) {
    // Track cancellation state
    this.isCancelled = false;
    this.cancelReason = null;
    this.onCancel = null;
    
    // If executor function provided, create promise
    if (typeof promiseOrExecutor === 'function') {
      this.promise = new Promise((resolve, reject) => {
        // Provide cancel-aware resolve/reject
        const cancelableResolve = (value) => {
          if (!this.isCancelled) {
            resolve(value);
          }
        };
        
        const cancelableReject = (reason) => {
          if (!this.isCancelled) {
            reject(reason);
          }
        };
        
        // Execute the original function with cancel-aware callbacks
        promiseOrExecutor(cancelableResolve, cancelableReject);
      });
    } else {
      // Wrap existing promise
      this.promise = promiseOrExecutor;
    }
    
    // Wrap the promise to handle cancellation
    this.wrappedPromise = this.promise.then(
      value => {
        if (this.isCancelled) {
          throw new Error(this.cancelReason || 'Promise was cancelled');
        }
        return value;
      },
      reason => {
        if (this.isCancelled) {
          throw new Error(this.cancelReason || 'Promise was cancelled');
        }
        throw reason;
      }
    );
  }

  // Cancel the promise with optional reason
  cancel(reason = 'Promise was cancelled') {
    if (this.isCancelled) {
      return; // Already cancelled
    }
    
    this.isCancelled = true;
    this.cancelReason = reason;
    
    // Execute cancellation callback if provided
    if (this.onCancel && typeof this.onCancel === 'function') {
      try {
        this.onCancel(reason);
      } catch (error) {
        console.error('Error in cancellation handler:', error);
      }
    }
  }

  // Set cancellation callback for cleanup
  onCancellation(callback) {
    this.onCancel = callback;
    return this;
  }

  // Promise interface methods
  then(onFulfilled, onRejected) {
    return this.wrappedPromise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.wrappedPromise.catch(onRejected);
  }

  finally(onFinally) {
    return this.wrappedPromise.finally(onFinally);
  }

  // Check if promise is cancelled
  get cancelled() {
    return this.isCancelled;
  }

  // Static method to create cancelable promise
  static create(promiseOrExecutor) {
    return new CancelablePromise(promiseOrExecutor);
  }
}

// =======================
// Approach 2: AbortController-based Cancelable Promise
// =======================

/**
 * Modern cancelable promise using AbortController (standard API)
 * Provides better integration with fetch() and other modern APIs
 */
class AbortableCancelablePromise {
  constructor(executor) {
    // Create abort controller for cancellation signaling
    this.abortController = new AbortController();
    this.signal = this.abortController.signal;
    
    // Track state
    this.isCancelled = false;
    this.cancelReason = null;
    
    // Create the main promise
    this.promise = new Promise((resolve, reject) => {
      // Handle abort signal
      const abortHandler = () => {
        this.isCancelled = true;
        reject(new Error(this.cancelReason || 'Operation was aborted'));
      };
      
      // Listen for abort signal
      if (this.signal.aborted) {
        abortHandler();
        return;
      }
      
      this.signal.addEventListener('abort', abortHandler);
      
      try {
        // Execute with abort signal
        const result = executor(resolve, reject, this.signal);
        
        // If executor returns a promise, handle it
        if (result && typeof result.then === 'function') {
          result.then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Cancel using AbortController
  cancel(reason = 'Operation cancelled') {
    if (this.isCancelled) return;
    
    this.isCancelled = true;
    this.cancelReason = reason;
    this.abortController.abort(reason);
  }

  // Promise interface
  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.promise.catch(onRejected);
  }

  finally(onFinally) {
    return this.promise.finally(onFinally);
  }

  get cancelled() {
    return this.isCancelled;
  }

  // Get the abort signal for use with other APIs
  getSignal() {
    return this.signal;
  }
}

// =======================
// Approach 3: Promise Chain Cancellation
// =======================

/**
 * Cancelable promise that can cancel entire chains
 * Propagates cancellation through promise chains
 */
class ChainCancelablePromise {
  constructor(promiseOrExecutor) {
    this.isCancelled = false;
    this.cancelReason = null;
    this.childPromises = new Set();
    this.parent = null;
    
    // Create base promise
    if (typeof promiseOrExecutor === 'function') {
      this.basePromise = new Promise(promiseOrExecutor);
    } else {
      this.basePromise = promiseOrExecutor;
    }
    
    // Wrap promise to check cancellation
    this.promise = this.basePromise.then(
      value => {
        if (this.isCancelled) {
          throw new Error(this.cancelReason || 'Promise chain was cancelled');
        }
        return value;
      },
      reason => {
        if (this.isCancelled) {
          throw new Error(this.cancelReason || 'Promise chain was cancelled');
        }
        throw reason;
      }
    );
  }

  cancel(reason = 'Promise chain cancelled', propagate = true) {
    if (this.isCancelled) return;
    
    this.isCancelled = true;
    this.cancelReason = reason;
    
    if (propagate) {
      // Cancel all child promises
      this.childPromises.forEach(child => {
        if (!child.cancelled) {
          child.cancel(reason, false); // Don't propagate from children
        }
      });
      
      // Optionally cancel parent
      if (this.parent && !this.parent.cancelled) {
        this.parent.cancel(reason, false);
      }
    }
  }

  then(onFulfilled, onRejected) {
    const childPromise = new ChainCancelablePromise(
      this.promise.then(onFulfilled, onRejected)
    );
    
    // Link parent-child relationship
    childPromise.parent = this;
    this.childPromises.add(childPromise);
    
    return childPromise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    const childPromise = new ChainCancelablePromise(
      this.promise.finally(onFinally)
    );
    
    childPromise.parent = this;
    this.childPromises.add(childPromise);
    
    return childPromise;
  }

  get cancelled() {
    return this.isCancelled;
  }
}

// =======================
// Approach 4: Timeout-based Auto-cancellation
// =======================

/**
 * Promise with automatic timeout cancellation
 * Combines cancellation with timeout functionality
 */
class TimeoutCancelablePromise extends CancelablePromise {
  constructor(promiseOrExecutor, timeout = null) {
    super(promiseOrExecutor);
    
    this.timeout = timeout;
    this.timeoutId = null;
    
    if (timeout && timeout > 0) {
      this.timeoutId = setTimeout(() => {
        this.cancel(`Operation timed out after ${timeout}ms`);
      }, timeout);
      
      // Clear timeout on promise completion
      this.wrappedPromise
        .then(() => this.clearTimeout())
        .catch(() => this.clearTimeout());
    }
  }

  cancel(reason) {
    super.cancel(reason);
    this.clearTimeout();
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Set or update timeout
  setTimeout(newTimeout) {
    this.clearTimeout();
    
    if (newTimeout && newTimeout > 0) {
      this.timeout = newTimeout;
      this.timeoutId = setTimeout(() => {
        this.cancel(`Operation timed out after ${newTimeout}ms`);
      }, newTimeout);
    }
  }
}

// =======================
// Utility Functions
// =======================

/**
 * Create a delay that can be cancelled
 */
function cancelableDelay(ms) {
  return new CancelablePromise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve(`Delay of ${ms}ms completed`);
    }, ms);
    
    // Return cancellation handler
    return () => {
      clearTimeout(timeoutId);
    };
  }).onCancellation(() => {
    // This runs when cancel() is called
    console.log(`Delay of ${ms}ms was cancelled`);
  });
}

/**
 * Wrap fetch with cancellation support
 */
function cancelableFetch(url, options = {}) {
  return new AbortableCancelablePromise((resolve, reject, signal) => {
    // Use the provided abort signal with fetch
    fetch(url, { ...options, signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Race multiple cancelable promises
 */
function cancelableRace(cancelablePromises) {
  return new CancelablePromise((resolve, reject) => {
    let resolved = false;
    
    const promises = cancelablePromises.map(cp => 
      cp.then(
        value => {
          if (!resolved) {
            resolved = true;
            // Cancel other promises
            cancelablePromises.forEach(other => {
              if (other !== cp) {
                other.cancel('Lost race');
              }
            });
            resolve(value);
          }
        },
        reason => {
          if (!resolved) {
            reject(reason);
          }
        }
      )
    );
    
    return () => {
      // Cancel all promises when this wrapper is cancelled
      cancelablePromises.forEach(cp => cp.cancel('Race cancelled'));
    };
  }).onCancellation(() => {
    cancelablePromises.forEach(cp => cp.cancel('Race cancelled'));
  });
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== Cancelable Promise Examples ===\n');

// Example 1: Basic Cancellation
async function example1() {
  console.log('Example 1: Basic Cancellation');
  
  const cancelableTask = new CancelablePromise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve('Task completed successfully');
    }, 2000);
    
    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
      console.log('Task resources cleaned up');
    };
  }).onCancellation((reason) => {
    console.log('Task cancelled:', reason);
  });
  
  // Cancel after 1 second
  setTimeout(() => {
    cancelableTask.cancel('User requested cancellation');
  }, 1000);
  
  try {
    const result = await cancelableTask;
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log();
}

// Example 2: AbortController Integration
async function example2() {
  console.log('Example 2: AbortController Integration');
  
  const abortableTask = new AbortableCancelablePromise((resolve, reject, signal) => {
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      console.log(`Processing step ${step}...`);
      
      // Check for cancellation
      if (signal.aborted) {
        clearInterval(interval);
        return;
      }
      
      if (step >= 5) {
        clearInterval(interval);
        resolve(`Completed all ${step} steps`);
      }
    }, 500);
    
    // Handle abort signal
    signal.addEventListener('abort', () => {
      clearInterval(interval);
      console.log('Operation aborted, cleaning up interval');
    });
  });
  
  // Cancel after 1.5 seconds
  setTimeout(() => {
    abortableTask.cancel('Process interrupted');
  }, 1500);
  
  try {
    const result = await abortableTask;
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log();
}

// Example 3: Promise Chain Cancellation
async function example3() {
  console.log('Example 3: Promise Chain Cancellation');
  
  const chainTask = new ChainCancelablePromise((resolve) => {
    setTimeout(() => resolve('Step 1 complete'), 500);
  })
    .then(result => {
      console.log(result);
      return new Promise(resolve => {
        setTimeout(() => resolve('Step 2 complete'), 500);
      });
    })
    .then(result => {
      console.log(result);
      return 'Step 3 complete';
    });
  
  // Cancel the chain after 750ms (during step 2)
  setTimeout(() => {
    chainTask.cancel('Chain interrupted');
  }, 750);
  
  try {
    const result = await chainTask;
    console.log('Final result:', result);
  } catch (error) {
    console.log('Chain error:', error.message);
  }
  
  console.log();
}

// Example 4: Timeout Cancellation
async function example4() {
  console.log('Example 4: Timeout Cancellation');
  
  const timeoutTask = new TimeoutCancelablePromise((resolve) => {
    // Simulate slow operation
    setTimeout(() => {
      resolve('Long operation completed');
    }, 3000);
  }, 2000); // 2 second timeout
  
  try {
    const result = await timeoutTask;
    console.log('Result:', result);
  } catch (error) {
    console.log('Timeout error:', error.message);
  }
  
  console.log();
}

// Run examples
example1()
  .then(() => example2())
  .then(() => example3())
  .then(() => example4())
  .catch(console.error);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: HTTP Request Manager
 * Manages multiple HTTP requests with cancellation support
 */
class HTTPRequestManager {
  constructor() {
    this.activeRequests = new Map();
    this.requestCounter = 0;
  }

  // Make a cancelable HTTP request
  request(url, options = {}) {
    const requestId = ++this.requestCounter;
    console.log(`Starting HTTP request ${requestId}: ${url}`);
    
    const cancelableRequest = new AbortableCancelablePromise((resolve, reject, signal) => {
      // Simulate HTTP request
      const delay = Math.random() * 2000 + 500; // 500ms to 2.5s
      
      const timeoutId = setTimeout(async () => {
        try {
          // Check for cancellation before processing
          if (signal.aborted) {
            return;
          }
          
          // Simulate response
          const response = {
            requestId,
            url,
            status: Math.random() < 0.9 ? 200 : 500,
            data: `Response data for ${url}`,
            duration: delay
          };
          
          if (response.status === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${response.status}: Request failed`));
          }
        } catch (error) {
          reject(error);
        }
      }, delay);
      
      // Handle cancellation
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        console.log(`HTTP request ${requestId} cancelled`);
      });
    });
    
    // Track active request
    this.activeRequests.set(requestId, cancelableRequest);
    
    // Clean up when completed
    cancelableRequest.finally(() => {
      this.activeRequests.delete(requestId);
      console.log(`HTTP request ${requestId} completed/cancelled`);
    });
    
    return {
      requestId,
      promise: cancelableRequest,
      cancel: (reason) => cancelableRequest.cancel(reason)
    };
  }

  // Cancel specific request
  cancelRequest(requestId, reason = 'Request cancelled') {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.cancel(reason);
      return true;
    }
    return false;
  }

  // Cancel all active requests
  cancelAll(reason = 'All requests cancelled') {
    console.log(`Cancelling ${this.activeRequests.size} active requests`);
    
    this.activeRequests.forEach((request, requestId) => {
      request.cancel(reason);
    });
    
    this.activeRequests.clear();
  }

  // Get active request count
  getActiveCount() {
    return this.activeRequests.size;
  }

  // Wait for all requests to complete
  async waitForAll() {
    const activePromises = Array.from(this.activeRequests.values());
    
    if (activePromises.length === 0) {
      return [];
    }
    
    console.log(`Waiting for ${activePromises.length} requests to complete...`);
    
    const results = await Promise.allSettled(activePromises);
    return results;
  }
}

/**
 * Use Case 2: Background Task Scheduler
 * Schedules and manages background tasks with cancellation
 */
class BackgroundTaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.taskCounter = 0;
  }

  // Schedule a background task
  schedule(taskFn, delay = 0, options = {}) {
    const taskId = ++this.taskCounter;
    const { timeout = null, retries = 0 } = options;
    
    console.log(`Scheduling task ${taskId} with ${delay}ms delay`);
    
    const task = new TimeoutCancelablePromise((resolve, reject) => {
      const startTask = async (attempt = 1) => {
        try {
          const delayPromise = new Promise(resolveDelay => 
            setTimeout(resolveDelay, delay)
          );
          
          await delayPromise;
          
          console.log(`Executing task ${taskId} (attempt ${attempt})`);
          const result = await taskFn();
          resolve({ taskId, result, attempts: attempt });
          
        } catch (error) {
          if (attempt <= retries) {
            console.log(`Task ${taskId} failed, retrying (attempt ${attempt + 1})`);
            setTimeout(() => startTask(attempt + 1), 1000 * attempt);
          } else {
            reject(error);
          }
        }
      };
      
      startTask();
    }, timeout);
    
    // Track task
    this.tasks.set(taskId, task);
    
    // Clean up when done
    task.finally(() => {
      this.tasks.delete(taskId);
      console.log(`Task ${taskId} removed from scheduler`);
    });
    
    return {
      taskId,
      cancel: (reason) => task.cancel(reason),
      promise: task
    };
  }

  // Cancel specific task
  cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.cancel(`Task ${taskId} cancelled by user`);
      return true;
    }
    return false;
  }

  // Cancel all tasks
  cancelAll() {
    console.log(`Cancelling ${this.tasks.size} scheduled tasks`);
    
    this.tasks.forEach((task, taskId) => {
      task.cancel(`Task ${taskId} cancelled - shutdown`);
    });
    
    this.tasks.clear();
  }

  // Get task status
  getStatus() {
    return {
      activeTasks: this.tasks.size,
      taskIds: Array.from(this.tasks.keys())
    };
  }
}

/**
 * Use Case 3: File Upload Manager
 * Manages file uploads with progress and cancellation
 */
class FileUploadManager {
  constructor() {
    this.uploads = new Map();
    this.uploadCounter = 0;
  }

  // Upload file with progress and cancellation
  uploadFile(file, options = {}) {
    const uploadId = ++this.uploadCounter;
    const { onProgress = null, chunkSize = 64 * 1024 } = options;
    
    console.log(`Starting upload ${uploadId}: ${file.name} (${file.size} bytes)`);
    
    const upload = new AbortableCancelablePromise((resolve, reject, signal) => {
      this.performUpload(file, uploadId, chunkSize, onProgress, signal)
        .then(resolve)
        .catch(reject);
    });
    
    // Track upload
    this.uploads.set(uploadId, {
      file,
      promise: upload,
      startTime: Date.now(),
      progress: 0
    });
    
    // Clean up when done
    upload.finally(() => {
      this.uploads.delete(uploadId);
      console.log(`Upload ${uploadId} completed/cancelled`);
    });
    
    return {
      uploadId,
      cancel: (reason) => upload.cancel(reason),
      promise: upload
    };
  }

  async performUpload(file, uploadId, chunkSize, onProgress, signal) {
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;
    
    for (let i = 0; i < totalChunks; i++) {
      // Check for cancellation
      if (signal.aborted) {
        throw new Error('Upload cancelled');
      }
      
      // Simulate chunk upload
      const delay = Math.random() * 200 + 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simulate occasional chunk failures
      if (Math.random() < 0.05) { // 5% chance
        throw new Error(`Chunk ${i} upload failed`);
      }
      
      uploadedChunks++;
      const progress = (uploadedChunks / totalChunks) * 100;
      
      // Update progress
      const uploadInfo = this.uploads.get(uploadId);
      if (uploadInfo) {
        uploadInfo.progress = progress;
      }
      
      // Report progress
      if (onProgress) {
        onProgress(progress, uploadedChunks, totalChunks);
      }
      
      console.log(`Upload ${uploadId} progress: ${Math.round(progress)}%`);
    }
    
    return {
      uploadId,
      filename: file.name,
      size: file.size,
      chunks: totalChunks,
      duration: Date.now() - this.uploads.get(uploadId).startTime
    };
  }

  // Cancel specific upload
  cancelUpload(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (upload) {
      upload.promise.cancel(`Upload ${uploadId} cancelled`);
      return true;
    }
    return false;
  }

  // Cancel all uploads
  cancelAll() {
    console.log(`Cancelling ${this.uploads.size} active uploads`);
    
    this.uploads.forEach((upload, uploadId) => {
      upload.promise.cancel(`Upload ${uploadId} cancelled - shutdown`);
    });
    
    this.uploads.clear();
  }

  // Get upload progress
  getProgress(uploadId) {
    const upload = this.uploads.get(uploadId);
    return upload ? upload.progress : null;
  }

  // Get all upload statuses
  getAllProgress() {
    const statuses = {};
    this.uploads.forEach((upload, uploadId) => {
      statuses[uploadId] = {
        filename: upload.file.name,
        progress: upload.progress,
        duration: Date.now() - upload.startTime
      };
    });
    return statuses;
  }
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Examples ===\n');

  // HTTP Request Manager
  console.log('Testing HTTP Request Manager:');
  const httpManager = new HTTPRequestManager();
  
  const requests = [
    httpManager.request('/api/users'),
    httpManager.request('/api/posts'),
    httpManager.request('/api/comments'),
    httpManager.request('/api/analytics')
  ];
  
  // Cancel some requests after delay
  setTimeout(() => {
    httpManager.cancelRequest(requests[1].requestId, 'User cancelled');
    httpManager.cancelRequest(requests[3].requestId, 'Timeout');
  }, 800);
  
  // Wait for remaining requests
  setTimeout(async () => {
    const results = await httpManager.waitForAll();
    console.log(`HTTP Manager: ${results.length} requests completed\n`);
    
    // Background Task Scheduler
    console.log('Testing Background Task Scheduler:');
    const scheduler = new BackgroundTaskScheduler();
    
    const createTask = (id, duration) => () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(`Task ${id} result`), duration);
      });
    };
    
    const tasks = [
      scheduler.schedule(createTask(1, 500), 100),
      scheduler.schedule(createTask(2, 800), 200, { timeout: 1000 }),
      scheduler.schedule(createTask(3, 1200), 0, { retries: 2 })
    ];
    
    // Cancel one task
    setTimeout(() => {
      scheduler.cancelTask(tasks[2].taskId);
    }, 600);
    
    // Wait and then cancel all remaining
    setTimeout(() => {
      scheduler.cancelAll();
      console.log('All scheduled tasks cancelled\n');
      
      // File Upload Manager
      console.log('Testing File Upload Manager:');
      const uploadManager = new FileUploadManager();
      
      const mockFiles = [
        { name: 'document.pdf', size: 512 * 1024 },
        { name: 'image.jpg', size: 256 * 1024 },
        { name: 'video.mp4', size: 2048 * 1024 }
      ];
      
      const uploads = mockFiles.map(file => {
        return uploadManager.uploadFile(file, {
          onProgress: (progress, chunks, total) => {
            if (chunks % 5 === 0 || chunks === total) {
              console.log(`  ${file.name}: ${Math.round(progress)}%`);
            }
          }
        });
      });
      
      // Cancel middle upload after delay
      setTimeout(() => {
        uploadManager.cancelUpload(uploads[1].uploadId);
      }, 1000);
      
      // Wait for uploads to complete/cancel
      setTimeout(() => {
        uploadManager.cancelAll();
        console.log('File upload test completed');
      }, 3000);
      
    }, 2000);
  }, 1500);
}, 2000);

// Export all implementations
module.exports = {
  CancelablePromise,
  AbortableCancelablePromise,
  ChainCancelablePromise,
  TimeoutCancelablePromise,
  cancelableDelay,
  cancelableFetch,
  cancelableRace,
  HTTPRequestManager,
  BackgroundTaskScheduler,
  FileUploadManager
};

/**
 * Key Interview Points:
 * 
 * 1. Cancellation Patterns:
 *    - Wrapper approach: Wrap existing promises with cancellation logic
 *    - AbortController: Modern standard for cancellation signaling
 *    - Chain propagation: Cancel entire promise chains
 *    - Resource cleanup: Properly clean up resources on cancellation
 * 
 * 2. Race Conditions:
 *    - Handle cancellation vs completion races
 *    - Prevent double resolution/rejection
 *    - Clean state management during cancellation
 * 
 * 3. Memory Management:
 *    - Clean up timeouts, intervals, event listeners
 *    - Remove references to cancelled promises
 *    - Prevent memory leaks in long-running applications
 * 
 * 4. Error Handling:
 *    - Distinguish between cancellation and actual errors
 *    - Proper error propagation in promise chains
 *    - Graceful degradation when operations are cancelled
 * 
 * 5. Real-world Applications:
 *    - HTTP request cancellation (user navigates away)
 *    - File upload cancellation (user cancels upload)
 *    - Background task management (app shutdown)
 *    - Database query cancellation (timeout scenarios)
 * 
 * 6. Integration Considerations:
 *    - AbortSignal compatibility with fetch(), axios
 *    - Framework integration (React useEffect cleanup)
 *    - Promise library compatibility
 *    - Testing cancellation scenarios
 */