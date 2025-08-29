/**
 * File: advanced-patterns.js
 * Description: Advanced Web Worker patterns and architectures
 * Time Complexity: Varies by pattern (documented per implementation)
 * Space Complexity: O(n) for pooled workers, O(1) for single workers
 */

// === Worker Pool Pattern ===
console.log('=== Worker Pool Implementation ===');

class WorkerPool {
  constructor(size, workerScript, options = {}) {
    this.size = size;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.taskTimeout = options.taskTimeout || 30000;
    
    this.availableWorkers = [];
    this.busyWorkers = new Set();
    this.taskQueue = [];
    this.taskId = 0;
    this.metrics = {
      tasksCompleted: 0,
      tasksErrored: 0,
      averageExecutionTime: 0,
      queuedTasks: 0
    };
    
    // Create workers
    this.workerScript = workerScript;
    this.initializeWorkers();
  }
  
  initializeWorkers() {
    for (let i = 0; i < this.size; i++) {
      const worker = this.createWorker(i);
      this.availableWorkers.push(worker);
    }
    console.log(`Initialized pool with ${this.size} workers`);
  }
  
  createWorker(id) {
    const blob = new Blob([this.workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    
    worker.workerId = id;
    worker.tasksCompleted = 0;
    worker.cleanup = () => URL.revokeObjectURL(url);
    
    worker.addEventListener('message', (e) => {
      this.handleWorkerMessage(worker, e);
    });
    
    worker.addEventListener('error', (e) => {
      this.handleWorkerError(worker, e);
    });
    
    return worker;
  }
  
  handleWorkerMessage(worker, event) {
    const { taskId, type, result, error } = event.data;
    
    if (worker.currentTask && worker.currentTask.id === taskId) {
      const task = worker.currentTask;
      const duration = performance.now() - task.startTime;
      
      // Update metrics
      this.metrics.tasksCompleted++;
      this.updateAverageExecutionTime(duration);
      
      clearTimeout(task.timeout);
      worker.currentTask = null;
      worker.tasksCompleted++;
      
      if (error) {
        this.metrics.tasksErrored++;
        task.reject(new Error(error));
      } else {
        task.resolve({ result, duration, workerId: worker.workerId });
      }
      
      this.releaseWorker(worker);
      this.processQueue();
    }
  }
  
  handleWorkerError(worker, error) {
    console.error(`Worker ${worker.workerId} error:`, error);
    this.metrics.tasksErrored++;
    
    if (worker.currentTask) {
      clearTimeout(worker.currentTask.timeout);
      worker.currentTask.reject(error);
      worker.currentTask = null;
    }
    
    // Replace failed worker
    this.replaceWorker(worker);
  }
  
  replaceWorker(failedWorker) {
    const index = this.availableWorkers.indexOf(failedWorker);
    if (index > -1) {
      this.availableWorkers.splice(index, 1);
    }
    this.busyWorkers.delete(failedWorker);
    
    failedWorker.terminate();
    failedWorker.cleanup();
    
    // Create replacement
    const newWorker = this.createWorker(failedWorker.workerId);
    this.availableWorkers.push(newWorker);
    
    console.log(`Replaced failed worker ${failedWorker.workerId}`);
  }
  
  execute(taskData, priority = 0) {
    return new Promise((resolve, reject) => {
      if (this.taskQueue.length >= this.maxQueueSize) {
        reject(new Error('Task queue is full'));
        return;
      }
      
      const task = {
        id: ++this.taskId,
        data: taskData,
        priority,
        resolve,
        reject,
        queuedAt: performance.now()
      };
      
      this.taskQueue.push(task);
      this.metrics.queuedTasks = this.taskQueue.length;
      
      // Sort by priority (higher priority first)
      this.taskQueue.sort((a, b) => b.priority - a.priority);
      
      this.processQueue();
    });
  }
  
  processQueue() {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift();
      const worker = this.availableWorkers.shift();
      
      this.assignTaskToWorker(worker, task);
    }
    this.metrics.queuedTasks = this.taskQueue.length;
  }
  
  assignTaskToWorker(worker, task) {
    this.busyWorkers.add(worker);
    worker.currentTask = task;
    task.startTime = performance.now();
    
    // Set timeout
    task.timeout = setTimeout(() => {
      console.warn(`Task ${task.id} timed out`);
      task.reject(new Error('Task timeout'));
      this.releaseWorker(worker);
    }, this.taskTimeout);
    
    worker.postMessage({
      taskId: task.id,
      data: task.data
    });
  }
  
  releaseWorker(worker) {
    this.busyWorkers.delete(worker);
    this.availableWorkers.push(worker);
  }
  
  updateAverageExecutionTime(duration) {
    const total = this.metrics.averageExecutionTime * (this.metrics.tasksCompleted - 1);
    this.metrics.averageExecutionTime = (total + duration) / this.metrics.tasksCompleted;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      totalWorkers: this.size
    };
  }
  
  terminate() {
    console.log('Terminating worker pool...');
    
    // Clear queue
    this.taskQueue.forEach(task => {
      task.reject(new Error('Pool terminated'));
    });
    this.taskQueue = [];
    
    // Terminate all workers
    [...this.availableWorkers, ...this.busyWorkers].forEach(worker => {
      if (worker.currentTask) {
        clearTimeout(worker.currentTask.timeout);
        worker.currentTask.reject(new Error('Pool terminated'));
      }
      worker.terminate();
      worker.cleanup();
    });
    
    this.availableWorkers = [];
    this.busyWorkers.clear();
  }
}

// === Shared Worker Pattern ===
console.log('\n=== Shared Worker Implementation ===');

class SharedWorkerManager {
  constructor(workerScript, name = 'shared-worker') {
    this.name = name;
    this.connections = new Map();
    this.messageId = 0;
    
    if (typeof SharedWorker !== 'undefined') {
      this.createSharedWorker(workerScript);
    } else {
      console.warn('SharedWorker not supported, falling back to dedicated worker');
      this.createFallbackWorker(workerScript);
    }
  }
  
  createSharedWorker(script) {
    const blob = new Blob([this.wrapSharedWorkerScript(script)], { 
      type: 'application/javascript' 
    });
    const url = URL.createObjectURL(blob);
    
    this.sharedWorker = new SharedWorker(url, this.name);
    this.port = this.sharedWorker.port;
    this.cleanup = () => URL.revokeObjectURL(url);
    
    this.port.addEventListener('message', this.handleMessage.bind(this));
    this.port.start();
  }
  
  wrapSharedWorkerScript(userScript) {
    return `
      const connections = new Map();
      let messageId = 0;
      
      self.addEventListener('connect', function(e) {
        const port = e.ports[0];
        const connectionId = ++messageId;
        connections.set(connectionId, port);
        
        console.log(\`Shared worker: New connection \${connectionId}\`);
        
        port.addEventListener('message', function(event) {
          const { type, data, targetConnection, broadcast } = event.data;
          
          try {
            // User script processing
            ${userScript}
            
            // Handle built-in commands
            if (type === 'GET_CONNECTIONS') {
              port.postMessage({
                type: 'CONNECTION_COUNT',
                count: connections.size,
                connectionId
              });
            } else if (broadcast) {
              // Broadcast to all connections
              connections.forEach((conn, id) => {
                if (conn !== port) {
                  conn.postMessage({ ...event.data, fromConnection: connectionId });
                }
              });
            } else if (targetConnection && connections.has(targetConnection)) {
              // Send to specific connection
              connections.get(targetConnection).postMessage({
                ...event.data,
                fromConnection: connectionId
              });
            }
          } catch (error) {
            port.postMessage({
              type: 'ERROR',
              error: error.message,
              connectionId
            });
          }
        });
        
        port.addEventListener('close', function() {
          connections.delete(connectionId);
          console.log(\`Shared worker: Connection \${connectionId} closed\`);
        });
        
        port.start();
        
        // Welcome message
        port.postMessage({
          type: 'CONNECTED',
          connectionId,
          totalConnections: connections.size
        });
      });
    `;
  }
  
  createFallbackWorker(script) {
    const blob = new Blob([script], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    this.worker = new Worker(url);
    this.cleanup = () => URL.revokeObjectURL(url);
    
    this.worker.addEventListener('message', this.handleMessage.bind(this));
  }
  
  handleMessage(event) {
    const callback = this.connections.get(event.data.type);
    if (callback) {
      callback(event.data);
    }
  }
  
  addEventListener(type, callback) {
    this.connections.set(type, callback);
  }
  
  postMessage(data) {
    if (this.port) {
      this.port.postMessage(data);
    } else if (this.worker) {
      this.worker.postMessage(data);
    }
  }
  
  terminate() {
    if (this.port) {
      this.port.close();
    }
    if (this.worker) {
      this.worker.terminate();
    }
    if (this.cleanup) {
      this.cleanup();
    }
  }
}

// === Pipeline Processing Pattern ===
console.log('\n=== Pipeline Processing ===');

class WorkerPipeline {
  constructor(stages) {
    this.stages = stages;
    this.workers = [];
    this.initializePipeline();
  }
  
  initializePipeline() {
    this.stages.forEach((stage, index) => {
      const workerScript = `
        const stageIndex = ${index};
        const stageName = "${stage.name}";
        
        ${stage.processor.toString()}
        
        self.addEventListener('message', async function(e) {
          const { data, pipelineId, stageData } = e.data;
          
          try {
            const startTime = performance.now();
            const result = await processor(data, stageData || {});
            const duration = performance.now() - startTime;
            
            self.postMessage({
              type: 'STAGE_COMPLETE',
              pipelineId,
              stageIndex,
              stageName,
              result,
              duration
            });
          } catch (error) {
            self.postMessage({
              type: 'STAGE_ERROR',
              pipelineId,
              stageIndex,
              stageName,
              error: error.message
            });
          }
        });
      `;
      
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);
      
      worker.stageIndex = index;
      worker.stageName = stage.name;
      worker.cleanup = () => URL.revokeObjectURL(url);
      
      this.workers.push(worker);
    });
  }
  
  async process(initialData, stageData = {}) {
    const pipelineId = Math.random().toString(36).substr(2, 9);
    let currentData = initialData;
    const results = [];
    
    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i];
      const stage = this.stages[i];
      
      try {
        const stageResult = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Stage ${stage.name} timeout`));
          }, stage.timeout || 10000);
          
          const messageHandler = (e) => {
            const { type, pipelineId: pid, result, error } = e.data;
            
            if (pid === pipelineId) {
              clearTimeout(timeout);
              worker.removeEventListener('message', messageHandler);
              
              if (type === 'STAGE_ERROR') {
                reject(new Error(error));
              } else {
                resolve(result);
              }
            }
          };
          
          worker.addEventListener('message', messageHandler);
          worker.postMessage({
            data: currentData,
            pipelineId,
            stageData: stageData[stage.name] || {}
          });
        });
        
        results.push({
          stage: stage.name,
          input: currentData,
          output: stageResult
        });
        
        currentData = stageResult;
        
      } catch (error) {
        throw new Error(`Pipeline failed at stage ${stage.name}: ${error.message}`);
      }
    }
    
    return { finalResult: currentData, stageResults: results };
  }
  
  terminate() {
    this.workers.forEach(worker => {
      worker.terminate();
      worker.cleanup();
    });
  }
}

// === Map-Reduce Pattern ===
console.log('\n=== Map-Reduce Implementation ===');

class MapReduceWorker {
  constructor(mapFunction, reduceFunction, options = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.maxWorkers = options.maxWorkers || navigator.hardwareConcurrency || 4;
    this.mapFunction = mapFunction.toString();
    this.reduceFunction = reduceFunction.toString();
    
    this.createWorkerScript();
  }
  
  createWorkerScript() {
    this.workerScript = `
      const mapFn = ${this.mapFunction};
      const reduceFn = ${this.reduceFunction};
      
      self.addEventListener('message', function(e) {
        const { type, data, taskId } = e.data;
        
        try {
          if (type === 'MAP') {
            const mapped = data.map((item, index) => mapFn(item, index));
            self.postMessage({
              type: 'MAP_COMPLETE',
              taskId,
              result: mapped
            });
          } else if (type === 'REDUCE') {
            const reduced = data.reduce((acc, curr) => reduceFn(acc, curr));
            self.postMessage({
              type: 'REDUCE_COMPLETE',
              taskId,
              result: reduced
            });
          }
        } catch (error) {
          self.postMessage({
            type: 'ERROR',
            taskId,
            error: error.message
          });
        }
      });
    `;
  }
  
  async process(data) {
    const startTime = performance.now();
    
    // Split data into chunks
    const chunks = this.chunkData(data, this.chunkSize);
    console.log(`Processing ${data.length} items in ${chunks.length} chunks`);
    
    // Map phase
    const mappedResults = await this.mapPhase(chunks);
    
    // Reduce phase
    const finalResult = await this.reducePhase(mappedResults);
    
    const totalTime = performance.now() - startTime;
    
    return {
      result: finalResult,
      metrics: {
        totalItems: data.length,
        chunks: chunks.length,
        processingTime: totalTime,
        throughput: data.length / (totalTime / 1000)
      }
    };
  }
  
  chunkData(data, size) {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  }
  
  async mapPhase(chunks) {
    const workerPool = new WorkerPool(
      Math.min(this.maxWorkers, chunks.length),
      this.workerScript
    );
    
    try {
      const mapTasks = chunks.map(chunk => 
        workerPool.execute({ type: 'MAP', data: chunk })
      );
      
      const results = await Promise.all(mapTasks);
      return results.map(r => r.result).flat();
      
    } finally {
      workerPool.terminate();
    }
  }
  
  async reducePhase(mappedData) {
    // For large datasets, we might need multiple reduce steps
    let currentData = mappedData;
    
    while (currentData.length > 1) {
      const chunks = this.chunkData(currentData, this.chunkSize);
      const workerPool = new WorkerPool(
        Math.min(this.maxWorkers, chunks.length),
        this.workerScript
      );
      
      try {
        const reduceTasks = chunks.map(chunk =>
          workerPool.execute({ type: 'REDUCE', data: chunk })
        );
        
        const results = await Promise.all(reduceTasks);
        currentData = results.map(r => r.result);
        
      } finally {
        workerPool.terminate();
      }
    }
    
    return currentData[0];
  }
}

// === Export patterns for testing ===
module.exports = {
  WorkerPool,
  SharedWorkerManager,
  WorkerPipeline,
  MapReduceWorker,
  
  // Factory functions
  createWorkerPool: (size, script, options) => new WorkerPool(size, script, options),
  
  createPipeline: (stages) => new WorkerPipeline(stages),
  
  createMapReduce: (mapFn, reduceFn, options) => new MapReduceWorker(mapFn, reduceFn, options),
  
  // Utility functions
  measureConcurrency: async () => {
    const concurrency = navigator.hardwareConcurrency || 4;
    console.log(`Detected hardware concurrency: ${concurrency}`);
    
    // Test actual concurrent execution
    const testScript = `
      self.addEventListener('message', function(e) {
        const start = performance.now();
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        const duration = performance.now() - start;
        self.postMessage({ result, duration });
      });
    `;
    
    const pool = new WorkerPool(concurrency, testScript);
    
    try {
      const tasks = Array(concurrency * 2).fill().map(() => pool.execute({}));
      const results = await Promise.all(tasks);
      
      return {
        hardwareConcurrency: concurrency,
        actualConcurrency: results.length,
        averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length
      };
    } finally {
      pool.terminate();
    }
  }
};

// === Demo execution ===
if (typeof window !== 'undefined') {
  console.log('\nAdvanced Web Worker patterns loaded');
  console.log('Available patterns: WorkerPool, SharedWorkerManager, WorkerPipeline, MapReduceWorker');
}