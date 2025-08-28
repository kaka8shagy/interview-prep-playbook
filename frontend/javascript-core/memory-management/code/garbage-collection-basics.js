/**
 * File: garbage-collection-basics.js
 * Description: Fundamentals of garbage collection in JavaScript
 * Demonstrates GC behavior, triggers, and monitoring
 */

console.log('=== Garbage Collection Basics ===');

// Example 1: Basic object lifecycle
console.log('1. Basic object lifecycle:');

function demonstrateObjectLifecycle() {
  // Allocation phase
  let obj = {
    data: new Array(1000).fill('data'),
    timestamp: Date.now()
  };
  
  console.log('Object allocated:', typeof obj);
  console.log('Object size estimate:', JSON.stringify(obj).length, 'bytes');
  
  // Usage phase
  obj.processed = true;
  obj.data.push('extra');
  
  console.log('Object modified:', obj.processed);
  
  // Release phase - object becomes eligible for GC
  obj = null; // Remove reference
  
  console.log('Reference cleared');
  // Object may now be garbage collected (timing is non-deterministic)
}

demonstrateObjectLifecycle();

// Example 2: Reachability demonstration
console.log('\n2. Reachability and GC:');

function reachabilityExample() {
  // Create object graph
  const root = {
    name: 'root',
    children: []
  };
  
  const child1 = { name: 'child1', parent: root };
  const child2 = { name: 'child2', parent: root };
  
  root.children.push(child1, child2);
  
  console.log('Object graph created');
  console.log('Root has children:', root.children.length);
  
  // All objects are reachable from root, so none can be GC'd
  return root; // Root stays reachable
  
  // If we returned null, entire graph could be GC'd
}

const keepAlive = reachabilityExample();
console.log('Root kept alive:', keepAlive.name);

// Example 3: Demonstrating GC suggestions
console.log('\n3. GC suggestions:');

function gcSuggestionExample() {
  // Create many temporary objects
  const tempObjects = [];
  
  for (let i = 0; i < 10000; i++) {
    tempObjects.push({
      id: i,
      data: new Array(100).fill(`item-${i}`),
      created: new Date()
    });
  }
  
  console.log('Created', tempObjects.length, 'temporary objects');
  
  // Clear references
  tempObjects.length = 0;
  
  // Suggest garbage collection (if available)
  if (global.gc) {
    console.log('Suggesting GC...');
    global.gc();
    console.log('GC suggested');
  } else if (window && window.gc) {
    console.log('Suggesting GC in browser...');
    window.gc();
  } else {
    console.log('GC not available - depends on runtime flags');
  }
  
  console.log('Objects should now be eligible for collection');
}

gcSuggestionExample();

console.log('\n=== Memory Usage Monitoring ===');

// Example 4: Memory usage tracking
console.log('4. Memory usage tracking:');

function trackMemoryUsage() {
  // Node.js memory usage
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    
    console.log('Node.js Memory Usage:');
    console.log('  RSS (Resident Set Size):', Math.round(usage.rss / 1024 / 1024), 'MB');
    console.log('  Heap Used:', Math.round(usage.heapUsed / 1024 / 1024), 'MB');
    console.log('  Heap Total:', Math.round(usage.heapTotal / 1024 / 1024), 'MB');
    console.log('  External:', Math.round(usage.external / 1024 / 1024), 'MB');
    
    if (usage.arrayBuffers) {
      console.log('  Array Buffers:', Math.round(usage.arrayBuffers / 1024 / 1024), 'MB');
    }
  }
  
  // Browser memory usage (limited info)
  if (typeof performance !== 'undefined' && performance.memory) {
    const memory = performance.memory;
    
    console.log('Browser Memory Info:');
    console.log('  Used JS Heap:', Math.round(memory.usedJSHeapSize / 1024 / 1024), 'MB');
    console.log('  Total JS Heap:', Math.round(memory.totalJSHeapSize / 1024 / 1024), 'MB');
    console.log('  Heap Size Limit:', Math.round(memory.jsHeapSizeLimit / 1024 / 1024), 'MB');
  }
}

trackMemoryUsage();

// Example 5: GC timing observation
console.log('\n5. GC timing observation:');

class GCObserver {
  constructor() {
    this.observations = [];
    this.isObserving = false;
  }
  
  start() {
    if (this.isObserving) return;
    
    this.isObserving = true;
    console.log('Starting GC observation...');
    
    // Use FinalizationRegistry to observe when objects are GC'd
    if (typeof FinalizationRegistry !== 'undefined') {
      this.registry = new FinalizationRegistry((heldValue) => {
        console.log('Object with id', heldValue, 'was garbage collected');
        this.observations.push({
          id: heldValue,
          timestamp: Date.now()
        });
      });
      
      console.log('FinalizationRegistry created');
    } else {
      console.log('FinalizationRegistry not available');
    }
  }
  
  registerObject(obj, id) {
    if (this.registry) {
      this.registry.register(obj, id);
      console.log('Registered object with id:', id);
    }
  }
  
  getObservations() {
    return this.observations.slice();
  }
  
  stop() {
    this.isObserving = false;
    console.log('Stopped GC observation');
  }
}

const gcObserver = new GCObserver();
gcObserver.start();

// Create some objects to observe
function createObservableObjects() {
  for (let i = 0; i < 5; i++) {
    const obj = {
      id: i,
      data: new Array(1000).fill(`object-${i}`)
    };
    
    gcObserver.registerObject(obj, `obj-${i}`);
  }
  
  console.log('Created 5 observable objects');
}

createObservableObjects();

console.log('\n=== Memory Pressure Simulation ===');

// Example 6: Memory pressure simulation
console.log('6. Memory pressure simulation:');

class MemoryPressureTester {
  constructor() {
    this.allocatedMemory = [];
    this.allocationSize = 1024 * 1024; // 1MB chunks
  }
  
  allocateMemory(chunks = 10) {
    console.log(`Allocating ${chunks} chunks of ${this.allocationSize / 1024}KB each`);
    
    for (let i = 0; i < chunks; i++) {
      const chunk = new ArrayBuffer(this.allocationSize);
      const view = new Uint8Array(chunk);
      
      // Fill with some data
      for (let j = 0; j < view.length; j += 1024) {
        view[j] = i % 256;
      }
      
      this.allocatedMemory.push({
        buffer: chunk,
        id: i,
        allocated: Date.now()
      });
    }
    
    console.log('Total allocated chunks:', this.allocatedMemory.length);
    this.logMemoryUsage();
  }
  
  releaseMemory(count = 5) {
    const released = this.allocatedMemory.splice(0, count);
    console.log(`Released ${released.length} chunks`);
    
    // Force references to null
    released.forEach(item => {
      item.buffer = null;
    });
    
    this.logMemoryUsage();
  }
  
  logMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      console.log(`Memory - Used: ${Math.round(usage.heapUsed / 1024 / 1024)}MB, Total: ${Math.round(usage.heapTotal / 1024 / 1024)}MB`);
    }
  }
  
  cleanup() {
    this.allocatedMemory.length = 0;
    console.log('All memory references cleared');
  }
}

const memoryTester = new MemoryPressureTester();
memoryTester.allocateMemory(20);

setTimeout(() => {
  memoryTester.releaseMemory(15);
  
  setTimeout(() => {
    memoryTester.cleanup();
    gcObserver.stop();
    
    console.log('GC observations:', gcObserver.getObservations());
  }, 1000);
}, 500);

console.log('\n=== GC Behavior Patterns ===');

// Example 7: Different object patterns and GC
console.log('7. Object patterns and GC impact:');

function testObjectPatterns() {
  console.log('Testing different object creation patterns...');
  
  // Pattern 1: Many small objects
  function createManySmallObjects() {
    const objects = [];
    const start = Date.now();
    
    for (let i = 0; i < 100000; i++) {
      objects.push({ id: i, small: true });
    }
    
    const duration = Date.now() - start;
    console.log(`Created 100k small objects in ${duration}ms`);
    return objects;
  }
  
  // Pattern 2: Few large objects
  function createFewLargeObjects() {
    const objects = [];
    const start = Date.now();
    
    for (let i = 0; i < 100; i++) {
      objects.push({
        id: i,
        large: true,
        data: new Array(1000).fill(`large-object-${i}`)
      });
    }
    
    const duration = Date.now() - start;
    console.log(`Created 100 large objects in ${duration}ms`);
    return objects;
  }
  
  const smallObjects = createManySmallObjects();
  const largeObjects = createFewLargeObjects();
  
  console.log('Small objects length:', smallObjects.length);
  console.log('Large objects length:', largeObjects.length);
  
  // Clear references
  smallObjects.length = 0;
  largeObjects.length = 0;
  
  console.log('References cleared - objects eligible for GC');
}

testObjectPatterns();

console.log('\n=== Generational Hypothesis Demo ===');

// Example 8: Demonstrate generational GC behavior
console.log('8. Generational GC behavior:');

class GenerationalDemo {
  constructor() {
    this.youngObjects = [];
    this.oldObjects = [];
  }
  
  createYoungObjects() {
    // Simulate short-lived objects
    for (let i = 0; i < 1000; i++) {
      this.youngObjects.push({
        id: i,
        temporary: true,
        created: Date.now()
      });
    }
    
    console.log('Created', this.youngObjects.length, 'young (temporary) objects');
  }
  
  createOldObjects() {
    // Simulate long-lived objects
    for (let i = 0; i < 100; i++) {
      this.oldObjects.push({
        id: i,
        persistent: true,
        created: Date.now(),
        data: new Array(100).fill(`persistent-${i}`)
      });
    }
    
    console.log('Created', this.oldObjects.length, 'old (persistent) objects');
  }
  
  simulateGenerationalPattern() {
    console.log('Simulating generational GC pattern...');
    
    // Create long-lived objects first
    this.createOldObjects();
    
    // Repeatedly create and destroy short-lived objects
    for (let cycle = 0; cycle < 5; cycle++) {
      console.log(`Cycle ${cycle + 1}:`);
      
      this.createYoungObjects();
      
      // Simulate work with young objects
      this.youngObjects.forEach(obj => {
        obj.processed = true;
      });
      
      // Clear young objects (simulate end of request/operation)
      this.youngObjects.length = 0;
      console.log('  Young objects cleared');
      
      // Old objects persist
      console.log('  Old objects count:', this.oldObjects.length);
    }
    
    console.log('Generational pattern complete');
    console.log('Young objects typically GC\'d in minor collections');
    console.log('Old objects require major collection cycles');
  }
  
  cleanup() {
    this.youngObjects.length = 0;
    this.oldObjects.length = 0;
    console.log('All objects cleared');
  }
}

const genDemo = new GenerationalDemo();
genDemo.simulateGenerationalPattern();

setTimeout(() => {
  genDemo.cleanup();
  console.log('\n=== GC Demonstration Complete ===');
  
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const finalUsage = process.memoryUsage();
    console.log('Final memory state:');
    console.log(`  Heap Used: ${Math.round(finalUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`  Heap Total: ${Math.round(finalUsage.heapTotal / 1024 / 1024)}MB`);
  }
}, 2000);

module.exports = {
  demonstrateObjectLifecycle,
  reachabilityExample,
  gcSuggestionExample,
  trackMemoryUsage,
  GCObserver,
  MemoryPressureTester,
  testObjectPatterns,
  GenerationalDemo
};