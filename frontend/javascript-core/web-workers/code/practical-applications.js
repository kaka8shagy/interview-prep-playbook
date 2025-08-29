/**
 * File: practical-applications.js
 * Description: Real-world Web Worker applications and use cases
 * Time Complexity: Varies by application (documented per use case)
 * Space Complexity: O(n) for data processing, O(1) for background tasks
 */

// === Image Processing Application ===
console.log('=== Image Processing with Workers ===');

class ImageProcessorWorker {
  constructor() {
    this.filters = new Map();
    this.setupFilters();
  }
  
  setupFilters() {
    // Define image processing filters
    this.filters.set('grayscale', this.createFilterWorker(`
      function grayscaleFilter(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;     // Red
          data[i + 1] = gray; // Green
          data[i + 2] = gray; // Blue
          // Alpha channel (i + 3) remains unchanged
        }
        return imageData;
      }
    `));
    
    this.filters.set('sepia', this.createFilterWorker(`
      function sepiaFilter(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        return imageData;
      }
    `));
    
    this.filters.set('blur', this.createFilterWorker(`
      function blurFilter(imageData, radius = 3) {
        const data = new Uint8ClampedArray(imageData.data);
        const width = imageData.width;
        const height = imageData.height;
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const idx = (ny * width + nx) * 4;
                  r += data[idx];
                  g += data[idx + 1];
                  b += data[idx + 2];
                  a += data[idx + 3];
                  count++;
                }
              }
            }
            
            const idx = (y * width + x) * 4;
            imageData.data[idx] = r / count;
            imageData.data[idx + 1] = g / count;
            imageData.data[idx + 2] = b / count;
            imageData.data[idx + 3] = a / count;
          }
        }
        
        return imageData;
      }
    `));
  }
  
  createFilterWorker(filterFunction) {
    const workerScript = `
      ${filterFunction}
      
      self.addEventListener('message', function(e) {
        const { imageData, filterParams, taskId } = e.data;
        
        try {
          const startTime = performance.now();
          const result = ${filterFunction.name}(imageData, ...filterParams);
          const processingTime = performance.now() - startTime;
          
          // Transfer the processed image data back
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
    
    return {
      worker: new Worker(url),
      cleanup: () => URL.revokeObjectURL(url)
    };
  }
  
  async applyFilter(imageData, filterName, ...params) {
    const filter = this.filters.get(filterName);
    if (!filter) {
      throw new Error(`Unknown filter: ${filterName}`);
    }
    
    const taskId = Math.random().toString(36);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image processing timeout'));
      }, 30000);
      
      const messageHandler = (e) => {
        const { taskId: responseTaskId, imageData, processingTime, error, success } = e.data;
        
        if (responseTaskId === taskId) {
          clearTimeout(timeout);
          filter.worker.removeEventListener('message', messageHandler);
          
          if (success) {
            resolve({ imageData, processingTime });
          } else {
            reject(new Error(error));
          }
        }
      };
      
      filter.worker.addEventListener('message', messageHandler);
      filter.worker.postMessage({
        imageData: imageData,
        filterParams: params,
        taskId
      }, [imageData.data.buffer]); // Transfer ownership
    });
  }
  
  terminate() {
    this.filters.forEach(filter => {
      filter.worker.terminate();
      filter.cleanup();
    });
  }
}

// === Background Data Sync ===
console.log('\n=== Background Data Synchronization ===');

class BackgroundSyncWorker {
  constructor(apiEndpoint, options = {}) {
    this.apiEndpoint = apiEndpoint;
    this.syncInterval = options.syncInterval || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 5000;
    
    this.createSyncWorker();
  }
  
  createSyncWorker() {
    const workerScript = `
      let syncInterval = ${this.syncInterval};
      let retryAttempts = ${this.retryAttempts};
      let retryDelay = ${this.retryDelay};
      let apiEndpoint = '${this.apiEndpoint}';
      
      let syncTimer = null;
      let pendingSync = false;
      let offlineQueue = [];
      
      // Sync function
      async function performSync(data) {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
          }
          
          const result = await response.json();
          return { success: true, result };
          
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
      
      // Retry mechanism
      async function syncWithRetry(data, attempt = 1) {
        const result = await performSync(data);
        
        if (!result.success && attempt < retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return syncWithRetry(data, attempt + 1);
        }
        
        return result;
      }
      
      // Process offline queue
      async function processOfflineQueue() {
        if (offlineQueue.length === 0) return;
        
        const batch = offlineQueue.splice(0, 10); // Process in batches
        
        for (const item of batch) {
          const result = await syncWithRetry(item);
          
          self.postMessage({
            type: 'SYNC_RESULT',
            item,
            result,
            timestamp: Date.now()
          });
        }
        
        if (offlineQueue.length > 0) {
          // Continue processing if more items remain
          setTimeout(processOfflineQueue, 1000);
        }
      }
      
      // Start periodic sync
      function startPeriodicSync() {
        if (syncTimer) clearInterval(syncTimer);
        
        syncTimer = setInterval(async () => {
          if (!pendingSync) {
            pendingSync = true;
            
            self.postMessage({
              type: 'SYNC_START',
              timestamp: Date.now()
            });
            
            await processOfflineQueue();
            
            self.postMessage({
              type: 'SYNC_COMPLETE',
              timestamp: Date.now(),
              queueLength: offlineQueue.length
            });
            
            pendingSync = false;
          }
        }, syncInterval);
      }
      
      // Message handling
      self.addEventListener('message', function(e) {
        const { type, data, config } = e.data;
        
        switch (type) {
          case 'SYNC_DATA':
            offlineQueue.push(data);
            self.postMessage({
              type: 'DATA_QUEUED',
              queueLength: offlineQueue.length
            });
            break;
            
          case 'START_SYNC':
            startPeriodicSync();
            self.postMessage({ type: 'SYNC_STARTED' });
            break;
            
          case 'STOP_SYNC':
            if (syncTimer) {
              clearInterval(syncTimer);
              syncTimer = null;
            }
            self.postMessage({ type: 'SYNC_STOPPED' });
            break;
            
          case 'FORCE_SYNC':
            if (!pendingSync) {
              processOfflineQueue();
            }
            break;
            
          case 'UPDATE_CONFIG':
            if (config.syncInterval) syncInterval = config.syncInterval;
            if (config.retryAttempts) retryAttempts = config.retryAttempts;
            if (config.retryDelay) retryDelay = config.retryDelay;
            if (config.apiEndpoint) apiEndpoint = config.apiEndpoint;
            break;
            
          case 'GET_STATUS':
            self.postMessage({
              type: 'STATUS',
              queueLength: offlineQueue.length,
              isSync: pendingSync,
              config: { syncInterval, retryAttempts, retryDelay, apiEndpoint }
            });
            break;
        }
      });
    `;
    
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    this.workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(this.workerUrl);
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.eventListeners = new Map();
    
    this.worker.addEventListener('message', (e) => {
      const { type } = e.data;
      const listeners = this.eventListeners.get(type) || [];
      listeners.forEach(callback => callback(e.data));
    });
    
    this.worker.addEventListener('error', (error) => {
      console.error('Sync worker error:', error);
    });
  }
  
  addEventListener(type, callback) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(callback);
  }
  
  queueData(data) {
    this.worker.postMessage({ type: 'SYNC_DATA', data });
  }
  
  startSync() {
    this.worker.postMessage({ type: 'START_SYNC' });
  }
  
  stopSync() {
    this.worker.postMessage({ type: 'STOP_SYNC' });
  }
  
  forceSync() {
    this.worker.postMessage({ type: 'FORCE_SYNC' });
  }
  
  updateConfig(config) {
    this.worker.postMessage({ type: 'UPDATE_CONFIG', config });
  }
  
  getStatus() {
    return new Promise((resolve) => {
      const handler = (data) => {
        if (data.type === 'STATUS') {
          this.removeEventListener('STATUS', handler);
          resolve(data);
        }
      };
      
      this.addEventListener('STATUS', handler);
      this.worker.postMessage({ type: 'GET_STATUS' });
    });
  }
  
  removeEventListener(type, callback) {
    if (this.eventListeners.has(type)) {
      const listeners = this.eventListeners.get(type);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  terminate() {
    this.worker.terminate();
    URL.revokeObjectURL(this.workerUrl);
  }
}

// === Real-Time Data Processing ===
console.log('\n=== Real-Time Data Stream Processing ===');

class StreamProcessorWorker {
  constructor(processingFunction, options = {}) {
    this.bufferSize = options.bufferSize || 1000;
    this.batchSize = options.batchSize || 100;
    this.flushInterval = options.flushInterval || 5000;
    
    this.createStreamWorker(processingFunction);
  }
  
  createStreamWorker(processingFunction) {
    const workerScript = `
      let buffer = [];
      let bufferSize = ${this.bufferSize};
      let batchSize = ${this.batchSize};
      let flushInterval = ${this.flushInterval};
      let flushTimer = null;
      
      // User-defined processing function
      const processFunction = ${processingFunction.toString()};
      
      function processBatch(batch) {
        try {
          const startTime = performance.now();
          const result = processFunction(batch);
          const processingTime = performance.now() - startTime;
          
          self.postMessage({
            type: 'BATCH_PROCESSED',
            result,
            batchSize: batch.length,
            processingTime,
            bufferLength: buffer.length
          });
        } catch (error) {
          self.postMessage({
            type: 'PROCESSING_ERROR',
            error: error.message,
            batchSize: batch.length
          });
        }
      }
      
      function flushBuffer() {
        if (buffer.length === 0) return;
        
        while (buffer.length > 0) {
          const batch = buffer.splice(0, batchSize);
          processBatch(batch);
        }
      }
      
      function startFlushTimer() {
        if (flushTimer) clearInterval(flushTimer);
        
        flushTimer = setInterval(() => {
          if (buffer.length > 0) {
            flushBuffer();
          }
        }, flushInterval);
      }
      
      self.addEventListener('message', function(e) {
        const { type, data, config } = e.data;
        
        switch (type) {
          case 'STREAM_DATA':
            if (Array.isArray(data)) {
              buffer.push(...data);
            } else {
              buffer.push(data);
            }
            
            // Process if buffer is full
            if (buffer.length >= bufferSize) {
              flushBuffer();
            }
            break;
            
          case 'START_STREAM':
            startFlushTimer();
            self.postMessage({ type: 'STREAM_STARTED' });
            break;
            
          case 'STOP_STREAM':
            if (flushTimer) {
              clearInterval(flushTimer);
              flushTimer = null;
            }
            flushBuffer(); // Process remaining data
            self.postMessage({ type: 'STREAM_STOPPED' });
            break;
            
          case 'FLUSH':
            flushBuffer();
            break;
            
          case 'UPDATE_CONFIG':
            if (config.bufferSize) bufferSize = config.bufferSize;
            if (config.batchSize) batchSize = config.batchSize;
            if (config.flushInterval) {
              flushInterval = config.flushInterval;
              if (flushTimer) {
                startFlushTimer(); // Restart with new interval
              }
            }
            break;
            
          case 'GET_STATS':
            self.postMessage({
              type: 'STATS',
              bufferLength: buffer.length,
              config: { bufferSize, batchSize, flushInterval },
              isRunning: flushTimer !== null
            });
            break;
        }
      });
    `;
    
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    this.workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(this.workerUrl);
    
    this.eventHandlers = new Map();
    this.worker.addEventListener('message', this.handleMessage.bind(this));
  }
  
  handleMessage(event) {
    const { type } = event.data;
    const handlers = this.eventHandlers.get(type) || [];
    handlers.forEach(handler => handler(event.data));
  }
  
  addEventListener(type, handler) {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type).push(handler);
  }
  
  streamData(data) {
    this.worker.postMessage({ type: 'STREAM_DATA', data });
  }
  
  startStream() {
    this.worker.postMessage({ type: 'START_STREAM' });
  }
  
  stopStream() {
    this.worker.postMessage({ type: 'STOP_STREAM' });
  }
  
  flush() {
    this.worker.postMessage({ type: 'FLUSH' });
  }
  
  updateConfig(config) {
    this.worker.postMessage({ type: 'UPDATE_CONFIG', config });
  }
  
  getStats() {
    return new Promise((resolve) => {
      const handler = (data) => {
        if (data.type === 'STATS') {
          const handlers = this.eventHandlers.get('STATS');
          const index = handlers.indexOf(handler);
          if (index > -1) handlers.splice(index, 1);
          resolve(data);
        }
      };
      
      this.addEventListener('STATS', handler);
      this.worker.postMessage({ type: 'GET_STATS' });
    });
  }
  
  terminate() {
    this.worker.terminate();
    URL.revokeObjectURL(this.workerUrl);
  }
}

// === CSV/JSON Data Processor ===
console.log('\n=== Large Dataset Processing ===');

class DatasetProcessor {
  constructor() {
    this.processors = new Map();
    this.initializeProcessors();
  }
  
  initializeProcessors() {
    // CSV processor
    this.processors.set('csv', this.createProcessor(`
      function processCSV(csvText, options = {}) {
        const delimiter = options.delimiter || ',';
        const hasHeader = options.hasHeader !== false;
        const skipEmpty = options.skipEmpty !== false;
        
        const lines = csvText.split('\\n');
        if (skipEmpty) {
          lines = lines.filter(line => line.trim());
        }
        
        const result = {
          headers: [],
          data: [],
          rowCount: 0,
          columnCount: 0
        };
        
        if (lines.length === 0) return result;
        
        let startIndex = 0;
        
        if (hasHeader) {
          result.headers = lines[0].split(delimiter).map(h => h.trim());
          result.columnCount = result.headers.length;
          startIndex = 1;
        }
        
        for (let i = startIndex; i < lines.length; i++) {
          const row = lines[i].split(delimiter).map(cell => {
            // Try to parse numbers
            const trimmed = cell.trim();
            if (trimmed === '') return null;
            if (!isNaN(Number(trimmed))) return Number(trimmed);
            return trimmed;
          });
          
          if (row.length > 0) {
            result.data.push(row);
            result.rowCount++;
            result.columnCount = Math.max(result.columnCount, row.length);
          }
        }
        
        return result;
      }
    `));
    
    // JSON processor
    this.processors.set('json', this.createProcessor(`
      function processJSON(jsonText, options = {}) {
        const transformPath = options.transformPath || null;
        const filterFunction = options.filterFunction || null;
        
        try {
          let data = JSON.parse(jsonText);
          
          // Extract nested data if path specified
          if (transformPath) {
            const paths = transformPath.split('.');
            for (const path of paths) {
              if (data && typeof data === 'object' && path in data) {
                data = data[path];
              } else {
                throw new Error(\`Path not found: \${transformPath}\`);
              }
            }
          }
          
          // Ensure data is array
          if (!Array.isArray(data)) {
            data = [data];
          }
          
          // Apply filter if provided
          if (filterFunction) {
            const filter = new Function('item', 'index', \`return (\${filterFunction})\`);
            data = data.filter(filter);
          }
          
          return {
            data,
            count: data.length,
            sample: data.slice(0, 3),
            types: data.length > 0 ? Object.keys(data[0] || {}) : []
          };
          
        } catch (error) {
          throw new Error(\`JSON processing failed: \${error.message}\`);
        }
      }
    `));
    
    // Statistics processor
    this.processors.set('statistics', this.createProcessor(`
      function calculateStatistics(data, column = null) {
        let values = data;
        
        if (column !== null && Array.isArray(data) && data.length > 0) {
          if (typeof column === 'string' && typeof data[0] === 'object') {
            values = data.map(row => row[column]).filter(v => v != null);
          } else if (typeof column === 'number' && Array.isArray(data[0])) {
            values = data.map(row => row[column]).filter(v => v != null);
          }
        }
        
        // Filter numeric values
        const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
        
        if (numericValues.length === 0) {
          return { error: 'No numeric values found' };
        }
        
        const sorted = numericValues.sort((a, b) => a - b);
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const count = numericValues.length;
        const mean = sum / count;
        
        // Calculate variance
        const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
        const standardDeviation = Math.sqrt(variance);
        
        return {
          count,
          sum,
          mean,
          median: count % 2 === 0 
            ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
            : sorted[Math.floor(count / 2)],
          min: sorted[0],
          max: sorted[count - 1],
          variance,
          standardDeviation,
          quartiles: {
            q1: sorted[Math.floor(count * 0.25)],
            q3: sorted[Math.floor(count * 0.75)]
          }
        };
      }
    `));
  }
  
  createProcessor(processingFunction) {
    const workerScript = `
      ${processingFunction}
      
      self.addEventListener('message', function(e) {
        const { taskId, data, options } = e.data;
        
        try {
          const startTime = performance.now();
          const result = ${processingFunction.name}(data, options);
          const processingTime = performance.now() - startTime;
          
          self.postMessage({
            taskId,
            success: true,
            result,
            processingTime,
            memoryUsage: performance.memory ? {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize
            } : null
          });
        } catch (error) {
          self.postMessage({
            taskId,
            success: false,
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
  
  async processData(type, data, options = {}) {
    const processor = this.processors.get(type);
    if (!processor) {
      throw new Error(`Unknown processor type: ${type}`);
    }
    
    const taskId = Math.random().toString(36);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Processing timeout'));
      }, 60000);
      
      const messageHandler = (e) => {
        const { taskId: responseTaskId, success, result, error, processingTime, memoryUsage } = e.data;
        
        if (responseTaskId === taskId) {
          clearTimeout(timeout);
          processor.worker.removeEventListener('message', messageHandler);
          
          if (success) {
            resolve({ result, processingTime, memoryUsage });
          } else {
            reject(new Error(error));
          }
        }
      };
      
      processor.worker.addEventListener('message', messageHandler);
      processor.worker.postMessage({ taskId, data, options });
    });
  }
  
  terminate() {
    this.processors.forEach(processor => {
      processor.worker.terminate();
      processor.cleanup();
    });
  }
}

// === Export for testing and usage ===
module.exports = {
  ImageProcessorWorker,
  BackgroundSyncWorker,
  StreamProcessorWorker,
  DatasetProcessor,
  
  // Factory functions
  createImageProcessor: () => new ImageProcessorWorker(),
  
  createBackgroundSync: (endpoint, options) => new BackgroundSyncWorker(endpoint, options),
  
  createStreamProcessor: (processingFn, options) => new StreamProcessorWorker(processingFn, options),
  
  createDatasetProcessor: () => new DatasetProcessor(),
  
  // Utility functions
  measureProcessingTime: async (task) => {
    const start = performance.now();
    const result = await task();
    const duration = performance.now() - start;
    return { result, duration };
  },
  
  createProgressTracker: (total) => {
    let completed = 0;
    return {
      increment: (amount = 1) => {
        completed += amount;
        const progress = (completed / total) * 100;
        return { completed, total, progress };
      },
      getProgress: () => ({ completed, total, progress: (completed / total) * 100 })
    };
  }
};

// === Demo setup ===
if (typeof window !== 'undefined') {
  console.log('\nPractical Web Worker applications loaded');
  console.log('Available: ImageProcessor, BackgroundSync, StreamProcessor, DatasetProcessor');
}