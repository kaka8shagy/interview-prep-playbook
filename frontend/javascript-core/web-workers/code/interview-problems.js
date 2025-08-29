/**
 * File: interview-problems.js
 * Description: Common Web Worker interview questions and coding challenges
 * Time Complexity: Varies by problem (documented per solution)
 * Space Complexity: O(n) for data processing problems
 */

console.log('=== Web Worker Interview Problems ===');

// === Problem 1: Prime Number Calculator ===
console.log('\n=== Problem 1: Prime Number Calculator ===');

class PrimeCalculatorChallenge {
  static getDescription() {
    return `
      Problem: Build a prime number calculator that can:
      1. Calculate primes up to N without blocking the UI
      2. Show progress during calculation
      3. Allow cancellation of ongoing calculations
      4. Compare performance between worker and main thread
      
      Requirements:
      - Use Web Workers for calculation
      - Implement progress reporting
      - Handle multiple concurrent requests
      - Provide performance metrics
    `;
  }
  
  constructor() {
    this.activeCalculations = new Map();
    this.calculationId = 0;
  }
  
  createPrimeWorker() {
    const workerScript = `
      // Sieve of Eratosthenes implementation
      function sieveOfEratosthenes(limit) {
        if (limit < 2) return [];
        
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;
        
        const primes = [];
        const progressInterval = Math.max(1, Math.floor(limit / 100));
        
        for (let i = 2; i <= limit; i++) {
          if (sieve[i]) {
            primes.push(i);
            
            // Mark multiples as non-prime
            for (let j = i * i; j <= limit; j += i) {
              sieve[j] = false;
            }
            
            // Report progress every 1% of the way
            if (i % progressInterval === 0) {
              self.postMessage({
                type: 'PROGRESS',
                current: i,
                limit,
                primesFound: primes.length,
                progress: (i / limit) * 100
              });
            }
          }
        }
        
        return primes;
      }
      
      // Simple trial division for comparison
      function trialDivisionPrimes(limit) {
        const primes = [];
        const progressInterval = Math.max(1, Math.floor(limit / 100));
        
        for (let n = 2; n <= limit; n++) {
          let isPrime = true;
          const sqrt = Math.sqrt(n);
          
          for (let i = 2; i <= sqrt; i++) {
            if (n % i === 0) {
              isPrime = false;
              break;
            }
          }
          
          if (isPrime) {
            primes.push(n);
          }
          
          if (n % progressInterval === 0) {
            self.postMessage({
              type: 'PROGRESS',
              current: n,
              limit,
              primesFound: primes.length,
              progress: (n / limit) * 100
            });
          }
        }
        
        return primes;
      }
      
      let cancelled = false;
      
      self.addEventListener('message', function(e) {
        const { calculationId, limit, algorithm, type } = e.data;
        
        if (type === 'CANCEL') {
          cancelled = true;
          self.postMessage({
            type: 'CANCELLED',
            calculationId
          });
          return;
        }
        
        cancelled = false;
        const startTime = performance.now();
        
        try {
          let primes;
          
          if (algorithm === 'sieve') {
            primes = sieveOfEratosthenes(limit);
          } else {
            primes = trialDivisionPrimes(limit);
          }
          
          if (!cancelled) {
            const endTime = performance.now();
            
            self.postMessage({
              type: 'COMPLETE',
              calculationId,
              primes: primes.slice(0, 1000), // Only send first 1000 for memory efficiency
              totalPrimes: primes.length,
              largest: primes[primes.length - 1] || null,
              duration: endTime - startTime,
              algorithm,
              limit
            });
          }
        } catch (error) {
          self.postMessage({
            type: 'ERROR',
            calculationId,
            error: error.message
          });
        }
      });
    `;
    
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    return {
      worker: new Worker(url),
      cleanup: () => URL.revokeObjectURL(url)
    };
  }
  
  calculatePrimes(limit, algorithm = 'sieve') {
    const calculationId = ++this.calculationId;
    const { worker, cleanup } = this.createPrimeWorker();
    
    const calculation = {
      id: calculationId,
      worker,
      cleanup,
      promise: null,
      cancelled: false
    };
    
    calculation.promise = new Promise((resolve, reject) => {
      const progressHandlers = [];
      
      const messageHandler = (e) => {
        const { type, calculationId: responseId } = e.data;
        
        if (responseId !== calculationId && type !== 'PROGRESS') return;
        
        switch (type) {
          case 'PROGRESS':
            progressHandlers.forEach(handler => handler(e.data));
            break;
            
          case 'COMPLETE':
            this.cleanup(calculationId);
            resolve({
              ...e.data,
              addEventListener: () => {}, // Placeholder for consistency
              removeEventListener: () => {}
            });
            break;
            
          case 'ERROR':
            this.cleanup(calculationId);
            reject(new Error(e.data.error));
            break;
            
          case 'CANCELLED':
            this.cleanup(calculationId);
            reject(new Error('Calculation was cancelled'));
            break;
        }
      };
      
      worker.addEventListener('message', messageHandler);
      
      // Add progress event handling
      resolve.addEventListener = (type, handler) => {
        if (type === 'progress') {
          progressHandlers.push(handler);
        }
      };
      
      resolve.removeEventListener = (type, handler) => {
        if (type === 'progress') {
          const index = progressHandlers.indexOf(handler);
          if (index > -1) progressHandlers.splice(index, 1);
        }
      };
      
      worker.postMessage({ calculationId, limit, algorithm });
    });
    
    this.activeCalculations.set(calculationId, calculation);
    
    // Return calculation object with control methods
    return {
      id: calculationId,
      promise: calculation.promise,
      cancel: () => this.cancelCalculation(calculationId),
      addEventListener: (type, handler) => {
        if (type === 'progress') {
          // This is a simplified implementation
          // In practice, you'd need to handle this more elegantly
        }
      }
    };
  }
  
  cancelCalculation(calculationId) {
    const calculation = this.activeCalculations.get(calculationId);
    if (calculation && !calculation.cancelled) {
      calculation.cancelled = true;
      calculation.worker.postMessage({ type: 'CANCEL', calculationId });
    }
  }
  
  cleanup(calculationId) {
    const calculation = this.activeCalculations.get(calculationId);
    if (calculation) {
      calculation.worker.terminate();
      calculation.cleanup();
      this.activeCalculations.delete(calculationId);
    }
  }
  
  terminateAll() {
    this.activeCalculations.forEach((_, id) => this.cleanup(id));
  }
  
  // Demonstration method
  static async runDemo() {
    console.log(this.getDescription());
    
    const calculator = new PrimeCalculatorChallenge();
    
    try {
      console.log('Calculating primes up to 100,000 using Sieve of Eratosthenes...');
      
      const calculation = calculator.calculatePrimes(100000, 'sieve');
      
      // Set up progress tracking
      let progressCount = 0;
      calculation.addEventListener('progress', (data) => {
        if (progressCount % 10 === 0) { // Log every 10th progress update
          console.log(`Progress: ${data.progress.toFixed(1)}% (${data.primesFound} primes found)`);
        }
        progressCount++;
      });
      
      const result = await calculation.promise;
      console.log(`Calculation complete!`);
      console.log(`Found ${result.totalPrimes} primes in ${result.duration.toFixed(2)}ms`);
      console.log(`Largest prime: ${result.largest}`);
      
    } catch (error) {
      console.error('Calculation failed:', error.message);
    } finally {
      calculator.terminateAll();
    }
  }
}

// === Problem 2: Image Processing Challenge ===
console.log('\n=== Problem 2: Image Processing Challenge ===');

class ImageFilterChallenge {
  static getDescription() {
    return `
      Problem: Build an image processing system that can:
      1. Apply multiple filters to images using workers
      2. Process multiple images concurrently
      3. Show processing progress for each image
      4. Implement a filter pipeline
      
      Requirements:
      - Use transferable objects for efficiency
      - Handle different image sizes
      - Implement at least 3 different filters
      - Provide performance comparisons
    `;
  }
  
  constructor() {
    this.filterWorkers = new Map();
    this.processingQueue = [];
    this.maxConcurrentProcessing = 3;
    this.activeProcessing = 0;
  }
  
  createFilterWorker(filterName, filterFunction) {
    const workerScript = `
      ${filterFunction.toString()}
      
      self.addEventListener('message', function(e) {
        const { imageData, taskId, filterParams } = e.data;
        
        try {
          const startTime = performance.now();
          const result = ${filterFunction.name}(imageData, filterParams);
          const processingTime = performance.now() - startTime;
          
          self.postMessage({
            taskId,
            imageData: result,
            processingTime,
            success: true
          }, [result.data.buffer]);
          
        } catch (error) {
          self.postMessage({
            taskId,
            error: error.message,
            success: false
          });
        }
      });
    `;
    
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    const worker = new Worker(url);
    this.filterWorkers.set(filterName, {
      worker,
      cleanup: () => URL.revokeObjectURL(url),
      busy: false
    });
    
    return worker;
  }
  
  initializeFilters() {
    // Grayscale filter
    this.createFilterWorker('grayscale', function grayscaleFilter(imageData) {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      return imageData;
    });
    
    // Invert filter
    this.createFilterWorker('invert', function invertFilter(imageData) {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // Alpha unchanged
      }
      return imageData;
    });
    
    // Brightness filter
    this.createFilterWorker('brightness', function brightnessFilter(imageData, { brightness = 50 }) {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] + brightness));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
      }
      return imageData;
    });
    
    // Edge detection filter
    this.createFilterWorker('edges', function edgeFilter(imageData) {
      const data = new Uint8ClampedArray(imageData.data);
      const width = imageData.width;
      const height = imageData.height;
      
      // Sobel operator
      const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let pixelX = 0, pixelY = 0;
          
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const idx = ((y + i) * width + (x + j)) * 4;
              const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
              
              const kernelIdx = (i + 1) * 3 + (j + 1);
              pixelX += gray * sobelX[kernelIdx];
              pixelY += gray * sobelY[kernelIdx];
            }
          }
          
          const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
          const outputIdx = (y * width + x) * 4;
          
          imageData.data[outputIdx] = magnitude;
          imageData.data[outputIdx + 1] = magnitude;
          imageData.data[outputIdx + 2] = magnitude;
          // Alpha unchanged
        }
      }
      
      return imageData;
    });
  }
  
  async applyFilter(imageData, filterName, filterParams = {}) {
    const filterWorker = this.filterWorkers.get(filterName);
    if (!filterWorker) {
      throw new Error(`Unknown filter: ${filterName}`);
    }
    
    const taskId = Math.random().toString(36);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Filter processing timeout'));
      }, 30000);
      
      const messageHandler = (e) => {
        if (e.data.taskId === taskId) {
          clearTimeout(timeout);
          filterWorker.worker.removeEventListener('message', messageHandler);
          filterWorker.busy = false;
          
          if (e.data.success) {
            resolve({
              imageData: e.data.imageData,
              processingTime: e.data.processingTime
            });
          } else {
            reject(new Error(e.data.error));
          }
        }
      };
      
      filterWorker.worker.addEventListener('message', messageHandler);
      filterWorker.busy = true;
      
      // Clone imageData to avoid transferring ownership if we need original
      const clonedData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );
      
      filterWorker.worker.postMessage({
        imageData: clonedData,
        taskId,
        filterParams
      }, [clonedData.data.buffer]);
    });
  }
  
  async processImagePipeline(imageData, filterPipeline) {
    let currentImageData = imageData;
    const results = [];
    
    for (const { filter, params } of filterPipeline) {
      const startTime = performance.now();
      const result = await this.applyFilter(currentImageData, filter, params);
      const totalTime = performance.now() - startTime;
      
      results.push({
        filter,
        params,
        processingTime: result.processingTime,
        totalTime
      });
      
      currentImageData = result.imageData;
    }
    
    return {
      finalImageData: currentImageData,
      pipelineResults: results
    };
  }
  
  terminate() {
    this.filterWorkers.forEach(({ worker, cleanup }) => {
      worker.terminate();
      cleanup();
    });
  }
  
  static async runDemo() {
    console.log(this.getDescription());
    
    const processor = new ImageFilterChallenge();
    processor.initializeFilters();
    
    try {
      // Create a sample image data (100x100 pixels)
      const width = 100;
      const height = 100;
      const imageData = new ImageData(width, height);
      
      // Fill with a gradient pattern
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          imageData.data[idx] = (x / width) * 255;     // Red gradient
          imageData.data[idx + 1] = (y / height) * 255; // Green gradient
          imageData.data[idx + 2] = 128;                // Blue constant
          imageData.data[idx + 3] = 255;                // Alpha
        }
      }
      
      console.log('Applying filter pipeline to sample image...');
      
      const pipeline = [
        { filter: 'brightness', params: { brightness: 20 } },
        { filter: 'grayscale', params: {} },
        { filter: 'edges', params: {} }
      ];
      
      const result = await processor.processImagePipeline(imageData, pipeline);
      
      console.log('Filter pipeline completed!');
      result.pipelineResults.forEach((step, index) => {
        console.log(`Step ${index + 1} (${step.filter}): ${step.processingTime.toFixed(2)}ms`);
      });
      
    } catch (error) {
      console.error('Image processing failed:', error.message);
    } finally {
      processor.terminate();
    }
  }
}

// === Problem 3: Background Task Scheduler ===
console.log('\n=== Problem 3: Background Task Scheduler ===');

class TaskSchedulerChallenge {
  static getDescription() {
    return `
      Problem: Build a background task scheduler that can:
      1. Queue tasks with different priorities
      2. Execute tasks in parallel using worker pool
      3. Handle task dependencies
      4. Implement retry logic for failed tasks
      5. Provide real-time status updates
      
      Requirements:
      - Support different task types
      - Implement priority scheduling
      - Handle task dependencies
      - Provide detailed metrics
    `;
  }
  
  constructor(workerPoolSize = 3) {
    this.workerPoolSize = workerPoolSize;
    this.taskQueue = [];
    this.completedTasks = [];
    this.failedTasks = [];
    this.taskId = 0;
    this.workers = [];
    this.taskRegistry = new Map();
    
    this.initializeWorkerPool();
    this.registerBuiltinTasks();
  }
  
  initializeWorkerPool() {
    const workerScript = `
      // Task registry
      const tasks = {};
      
      // Register task
      function registerTask(name, fn) {
        tasks[name] = fn;
      }
      
      // Built-in tasks
      registerTask('fibonacci', function(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      });
      
      registerTask('primeCheck', function(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
          if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
      });
      
      registerTask('sortArray', function(arr) {
        return arr.slice().sort((a, b) => a - b);
      });
      
      registerTask('matrixMultiply', function({ matrixA, matrixB }) {
        const result = [];
        for (let i = 0; i < matrixA.length; i++) {
          result[i] = [];
          for (let j = 0; j < matrixB[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < matrixB.length; k++) {
              sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i][j] = sum;
          }
        }
        return result;
      });
      
      registerTask('dataProcessing', function(data) {
        // Simulate complex data processing
        return data.map(item => ({
          ...item,
          processed: true,
          hash: item.value * 31 + item.id,
          timestamp: Date.now()
        }));
      });
      
      self.addEventListener('message', function(e) {
        const { taskId, taskType, taskData, timeout } = e.data;
        
        const startTime = performance.now();
        
        try {
          if (!tasks[taskType]) {
            throw new Error(\`Unknown task type: \${taskType}\`);
          }
          
          const result = tasks[taskType](taskData);
          const executionTime = performance.now() - startTime;
          
          self.postMessage({
            taskId,
            success: true,
            result,
            executionTime
          });
          
        } catch (error) {
          self.postMessage({
            taskId,
            success: false,
            error: error.message,
            executionTime: performance.now() - startTime
          });
        }
      });
    `;
    
    for (let i = 0; i < this.workerPoolSize; i++) {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      
      worker.workerId = i;
      worker.busy = false;
      worker.cleanup = () => URL.revokeObjectURL(url);
      
      worker.addEventListener('message', (e) => {
        this.handleWorkerMessage(worker, e);
      });
      
      this.workers.push(worker);
    }
  }
  
  registerBuiltinTasks() {
    this.taskRegistry.set('fibonacci', { timeout: 5000, retries: 2 });
    this.taskRegistry.set('primeCheck', { timeout: 1000, retries: 1 });
    this.taskRegistry.set('sortArray', { timeout: 10000, retries: 1 });
    this.taskRegistry.set('matrixMultiply', { timeout: 15000, retries: 2 });
    this.taskRegistry.set('dataProcessing', { timeout: 20000, retries: 3 });
  }
  
  handleWorkerMessage(worker, event) {
    const { taskId, success, result, error, executionTime } = event.data;
    const task = this.taskQueue.find(t => t.id === taskId);
    
    if (task) {
      worker.busy = false;
      
      if (success) {
        task.status = 'completed';
        task.result = result;
        task.executionTime = executionTime;
        
        this.completedTasks.push(task);
        this.removeFromQueue(taskId);
        
        // Check for dependent tasks
        this.processQueue();
        
      } else {
        task.attempts++;
        
        if (task.attempts < task.maxRetries) {
          task.status = 'retrying';
          setTimeout(() => this.processQueue(), task.retryDelay * task.attempts);
        } else {
          task.status = 'failed';
          task.error = error;
          
          this.failedTasks.push(task);
          this.removeFromQueue(taskId);
        }
      }
    }
  }
  
  scheduleTask(taskType, taskData, options = {}) {
    const taskId = ++this.taskId;
    const taskConfig = this.taskRegistry.get(taskType) || {};
    
    const task = {
      id: taskId,
      type: taskType,
      data: taskData,
      priority: options.priority || 0,
      dependencies: options.dependencies || [],
      maxRetries: options.maxRetries || taskConfig.retries || 1,
      timeout: options.timeout || taskConfig.timeout || 10000,
      retryDelay: options.retryDelay || 1000,
      status: 'queued',
      queuedAt: Date.now(),
      attempts: 0
    };
    
    this.taskQueue.push(task);
    this.sortQueue();
    this.processQueue();
    
    return taskId;
  }
  
  sortQueue() {
    // Sort by priority (higher first), then by queued time
    this.taskQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.queuedAt - b.queuedAt;
    });
  }
  
  processQueue() {
    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) return;
    
    const readyTask = this.taskQueue.find(task => 
      task.status === 'queued' || task.status === 'retrying'
    );
    
    if (!readyTask) return;
    
    // Check dependencies
    const dependenciesMet = readyTask.dependencies.every(depId =>
      this.completedTasks.some(t => t.id === depId)
    );
    
    if (!dependenciesMet) {
      // Check if any dependencies have failed
      const failedDependencies = readyTask.dependencies.filter(depId =>
        this.failedTasks.some(t => t.id === depId)
      );
      
      if (failedDependencies.length > 0) {
        readyTask.status = 'failed';
        readyTask.error = `Failed dependencies: ${failedDependencies.join(', ')}`;
        this.failedTasks.push(readyTask);
        this.removeFromQueue(readyTask.id);
        return;
      }
      
      return; // Wait for dependencies
    }
    
    // Execute task
    availableWorker.busy = true;
    readyTask.status = 'running';
    readyTask.startedAt = Date.now();
    
    availableWorker.postMessage({
      taskId: readyTask.id,
      taskType: readyTask.type,
      taskData: readyTask.data,
      timeout: readyTask.timeout
    });
    
    // Set timeout for the task
    setTimeout(() => {
      if (readyTask.status === 'running') {
        readyTask.attempts++;
        availableWorker.busy = false;
        
        if (readyTask.attempts < readyTask.maxRetries) {
          readyTask.status = 'retrying';
          setTimeout(() => this.processQueue(), readyTask.retryDelay * readyTask.attempts);
        } else {
          readyTask.status = 'failed';
          readyTask.error = 'Task timeout';
          this.failedTasks.push(readyTask);
          this.removeFromQueue(readyTask.id);
        }
      }
    }, readyTask.timeout);
  }
  
  removeFromQueue(taskId) {
    const index = this.taskQueue.findIndex(t => t.id === taskId);
    if (index > -1) {
      this.taskQueue.splice(index, 1);
    }
  }
  
  getStatus() {
    return {
      queued: this.taskQueue.filter(t => t.status === 'queued').length,
      running: this.taskQueue.filter(t => t.status === 'running').length,
      retrying: this.taskQueue.filter(t => t.status === 'retrying').length,
      completed: this.completedTasks.length,
      failed: this.failedTasks.length,
      workers: {
        total: this.workers.length,
        busy: this.workers.filter(w => w.busy).length,
        available: this.workers.filter(w => !w.busy).length
      }
    };
  }
  
  getTaskResult(taskId) {
    const completed = this.completedTasks.find(t => t.id === taskId);
    if (completed) return { status: 'completed', result: completed.result };
    
    const failed = this.failedTasks.find(t => t.id === taskId);
    if (failed) return { status: 'failed', error: failed.error };
    
    const queued = this.taskQueue.find(t => t.id === taskId);
    if (queued) return { status: queued.status };
    
    return { status: 'not_found' };
  }
  
  terminate() {
    this.workers.forEach(worker => {
      worker.terminate();
      worker.cleanup();
    });
  }
  
  static async runDemo() {
    console.log(this.getDescription());
    
    const scheduler = new TaskSchedulerChallenge();
    
    try {
      // Schedule some tasks with dependencies
      const task1 = scheduler.scheduleTask('fibonacci', 25, { priority: 1 });
      const task2 = scheduler.scheduleTask('primeCheck', 97, { priority: 2 });
      const task3 = scheduler.scheduleTask('sortArray', [64, 34, 25, 12, 22, 11, 90], { 
        priority: 1,
        dependencies: [task1] // Depends on task1
      });
      
      console.log('Scheduled tasks:', { task1, task2, task3 });
      console.log('Initial status:', scheduler.getStatus());
      
      // Wait for completion
      const checkCompletion = () => {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            const status = scheduler.getStatus();
            console.log('Current status:', status);
            
            if (status.queued === 0 && status.running === 0 && status.retrying === 0) {
              clearInterval(interval);
              resolve(status);
            }
          }, 1000);
        });
      };
      
      await checkCompletion();
      
      console.log('All tasks completed!');
      console.log('Task 1 result:', scheduler.getTaskResult(task1));
      console.log('Task 2 result:', scheduler.getTaskResult(task2));
      console.log('Task 3 result:', scheduler.getTaskResult(task3));
      
    } finally {
      scheduler.terminate();
    }
  }
}

// === Problem 4: Real-time Data Analysis ===
console.log('\n=== Problem 4: Real-time Data Analysis ===');

class DataAnalysisChallenge {
  static getDescription() {
    return `
      Problem: Build a real-time data analysis system that can:
      1. Process streaming data in real-time
      2. Calculate moving averages, trends
      3. Detect anomalies in data streams
      4. Generate reports on demand
      5. Handle multiple data streams simultaneously
      
      Requirements:
      - Process data without blocking UI
      - Implement statistical calculations
      - Detect patterns and anomalies
      - Provide real-time updates
    `;
  }
  
  // Implementation would be similar to previous patterns but focused on streaming analytics
  
  static async runDemo() {
    console.log(this.getDescription());
    console.log('This problem would involve building a comprehensive streaming analytics system');
    console.log('Key components: data ingestion, real-time processing, anomaly detection, reporting');
  }
}

// === Run all demonstrations ===
async function runAllInterviewProblems() {
  console.log('Running Web Worker Interview Problems...\n');
  
  try {
    await PrimeCalculatorChallenge.runDemo();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await ImageFilterChallenge.runDemo();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await TaskSchedulerChallenge.runDemo();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await DataAnalysisChallenge.runDemo();
    
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// === Export for testing ===
module.exports = {
  PrimeCalculatorChallenge,
  ImageFilterChallenge,  
  TaskSchedulerChallenge,
  DataAnalysisChallenge,
  runAllInterviewProblems,
  
  // Utility functions for interviews
  createPerformanceComparison: (mainThreadFn, workerFn, testData) => {
    return {
      async compare() {
        const mainStart = performance.now();
        const mainResult = mainThreadFn(testData);
        const mainTime = performance.now() - mainStart;
        
        const workerStart = performance.now();
        const workerResult = await workerFn(testData);
        const workerTime = performance.now() - workerStart;
        
        return {
          mainThread: { result: mainResult, time: mainTime },
          worker: { result: workerResult, time: workerTime },
          speedup: mainTime / workerTime
        };
      }
    };
  },
  
  createWorkerBenchmark: (workerCount, taskFn, testData) => {
    return {
      async run() {
        const results = [];
        
        for (let i = 1; i <= workerCount; i++) {
          const start = performance.now();
          
          // Simulate parallel execution with i workers
          const promises = Array(i).fill().map(() => taskFn(testData));
          await Promise.all(promises);
          
          const duration = performance.now() - start;
          results.push({ workers: i, time: duration });
        }
        
        return results;
      }
    };
  }
};

// Auto-run demonstrations if this is the main module
if (require.main === module) {
  runAllInterviewProblems().catch(console.error);
}