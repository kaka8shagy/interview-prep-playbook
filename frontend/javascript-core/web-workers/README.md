# JavaScript Web Workers

## Quick Summary
- Web Workers run JavaScript in background threads without blocking the UI
- Enable true parallel execution for CPU-intensive tasks
- Communicate through structured cloning and message passing (postMessage)
- Cannot access DOM directly - workers are completely isolated from main thread
- Types: Dedicated (private), Shared (between tabs), Service (network proxy)

## Implementation Files

### Core Concepts
- **Fundamentals**: `./code/fundamentals.js`
  - Worker feature detection and browser support
  - Basic worker creation and message communication
  - Worker lifecycle management and cleanup
  - Error handling and timeout patterns

### Advanced Architecture  
- **Advanced Patterns**: `./code/advanced-patterns.js`
  - Worker pool implementation for concurrent processing
  - Shared worker patterns for cross-tab communication
  - Pipeline processing for multi-stage operations
  - Map-Reduce pattern for parallel data processing

### Real-World Applications
- **Practical Applications**: `./code/practical-applications.js`
  - Image processing with transferable objects
  - Background data synchronization with retry logic
  - Real-time stream processing with buffering
  - Large dataset processing (CSV, JSON, statistics)

### Interview Preparation
- **Interview Problems**: `./code/interview-problems.js`
  - Prime number calculator with progress tracking
  - Multi-filter image processing pipeline
  - Background task scheduler with dependencies
  - Performance comparison utilities

## Core Worker Concepts

### Worker Creation and Communication
```javascript
// Creating a worker from script string
const workerScript = `
  self.addEventListener('message', function(e) {
    const result = performTask(e.data);
    self.postMessage(result);
  });
`;

const blob = new Blob([workerScript], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

worker.postMessage(data);
worker.addEventListener('message', (e) => console.log(e.data));
```

### Message Passing Patterns
1. **Fire-and-forget**: Send data without expecting response
2. **Request-response**: Send data and wait for specific response
3. **Streaming**: Continuous data flow between threads
4. **Broadcast**: One-to-many communication patterns

### Data Transfer Methods
```javascript
// Structured cloning (default - copies data)
worker.postMessage(largeObject);

// Transferable objects (zero-copy - transfers ownership)
worker.postMessage(arrayBuffer, [arrayBuffer]);

// Shared memory (experimental)
const sharedBuffer = new SharedArrayBuffer(1024);
worker.postMessage(sharedBuffer);
```

## Worker Types

### Dedicated Workers
- Private to the creating script
- One-to-one communication
- Most common type for parallel processing

### Shared Workers  
- Shared between multiple tabs/windows
- Communication through message ports
- Useful for cross-tab coordination

### Service Workers
- Act as network proxy
- Enable offline functionality
- Handle background sync and push notifications

## Performance Considerations

### When to Use Workers
- **DO**: CPU-intensive calculations, large data processing, background tasks
- **DON'T**: Simple operations, frequent small calculations, DOM manipulation

### Optimization Strategies
- Use transferable objects for large data (ArrayBuffer, MessagePort)
- Implement worker pools to manage concurrency
- Batch operations to reduce message overhead
- Cache workers to avoid creation overhead

### Memory Management
- Always terminate workers when done
- Clean up blob URLs to prevent memory leaks
- Monitor worker count - too many can hurt performance
- Use SharedArrayBuffer for memory efficiency when available

## Common Pitfalls

### Serialization Costs
```javascript
// Expensive - large object copied
worker.postMessage(hugeObject);

// Better - transfer ownership
worker.postMessage(arrayBuffer, [arrayBuffer]);
```

### Worker Lifecycle Issues
```javascript
// Bad - creates new worker every time
function processData(data) {
  const worker = new Worker('processor.js');
  return new Promise(resolve => {
    worker.onmessage = e => resolve(e.data);
    worker.postMessage(data);
  });
}

// Good - reuse worker
const worker = new Worker('processor.js');
function processData(data) {
  return new Promise(resolve => {
    worker.onmessage = e => resolve(e.data);
    worker.postMessage(data);
  });
}
```

### Error Handling
- Always handle worker errors and message errors
- Implement timeouts for worker operations
- Have fallback strategies for worker failures
- Validate data before sending to workers

## Interview Topics

### Common Questions
1. **When to use workers?** - CPU-intensive tasks, non-blocking operations
2. **Communication patterns?** - postMessage, structured cloning, transferables
3. **Performance implications?** - Creation overhead, serialization costs
4. **Limitations?** - No DOM access, same-origin policy, browser support

### Coding Challenges
- Build parallel sorting algorithm
- Implement image processing pipeline
- Create background task scheduler
- Design worker pool for concurrent processing

## Browser Support and Alternatives

### Feature Detection
```javascript
const workerSupport = {
  worker: typeof Worker !== 'undefined',
  sharedWorker: typeof SharedWorker !== 'undefined', 
  serviceWorker: 'serviceWorker' in navigator
};
```

### Fallback Strategies
- Graceful degradation to main thread processing
- Use setTimeout/setInterval for pseudo-threading
- Implement task splitting for long-running operations

## Best Practices

**DO:**
- Use workers for CPU-intensive tasks only
- Implement proper error handling and timeouts
- Clean up workers and blob URLs when done
- Use transferable objects for large data transfers
- Consider worker pools for managing concurrency

**DON'T:**
- Create workers for simple operations
- Forget to terminate workers when finished
- Access DOM from worker context
- Create excessive numbers of workers
- Rely on workers for small, frequent operations

## Related Topics
- [Event Loop and Concurrency](../event-loop/README.md)
- [Promises and Async Programming](../promises/README.md)
- [Memory Management](../memory-management/README.md)
- [Performance Optimization](../../performance/README.md)