/**
 * File: lazy-evaluation.js
 * Description: Lazy evaluation patterns using generators
 * Demonstrates deferred computation, memoization, and performance optimizations
 */

console.log('=== Basic Lazy Evaluation ===');

// Lazy range generator
function* lazyRange(start, end, step = 1) {
  let current = start;
  while (current < end) {
    yield current;
    current += step;
  }
}

// Lazy map operation
function* lazyMap(iterable, transform) {
  for (const item of iterable) {
    yield transform(item);
  }
}

// Lazy filter operation
function* lazyFilter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// Lazy take operation
function* lazyTake(iterable, count) {
  let taken = 0;
  for (const item of iterable) {
    if (taken >= count) break;
    yield item;
    taken++;
  }
}

console.log('1. Lazy Operations Chain:');
const numbers = lazyRange(1, 1000000); // Large range
const squared = lazyMap(numbers, x => x * x);
const evens = lazyFilter(squared, x => x % 2 === 0);
const first10 = lazyTake(evens, 10);

console.log('First 10 even squares:', [...first10]);
console.log('Note: Only computed 20 values instead of 1 million');

console.log('\n=== Lazy Data Structures ===');

// Lazy list implementation
class LazyList {
  constructor(head, tailGenerator) {
    this.head = head;
    this._tailGenerator = tailGenerator;
    this._tail = null;
    this._tailComputed = false;
  }
  
  get tail() {
    if (!this._tailComputed) {
      this._tail = this._tailGenerator ? this._tailGenerator() : null;
      this._tailComputed = true;
    }
    return this._tail;
  }
  
  isEmpty() {
    return this.head === undefined;
  }
  
  // Lazy map
  map(fn) {
    if (this.isEmpty()) return new LazyList();
    
    return new LazyList(
      fn(this.head),
      () => this.tail ? this.tail.map(fn) : null
    );
  }
  
  // Lazy filter
  filter(predicate) {
    if (this.isEmpty()) return new LazyList();
    
    if (predicate(this.head)) {
      return new LazyList(
        this.head,
        () => this.tail ? this.tail.filter(predicate) : null
      );
    } else {
      return this.tail ? this.tail.filter(predicate) : new LazyList();
    }
  }
  
  // Take n elements
  take(n) {
    if (n <= 0 || this.isEmpty()) return new LazyList();
    
    return new LazyList(
      this.head,
      () => n > 1 && this.tail ? this.tail.take(n - 1) : null
    );
  }
  
  // Convert to array (forces evaluation)
  toArray() {
    const result = [];
    let current = this;
    
    while (current && !current.isEmpty()) {
      result.push(current.head);
      current = current.tail;
    }
    
    return result;
  }
  
  // Generator for iteration
  *[Symbol.iterator]() {
    let current = this;
    while (current && !current.isEmpty()) {
      yield current.head;
      current = current.tail;
    }
  }
}

// Create lazy list from range
function createLazyRange(start, end) {
  if (start >= end) return new LazyList();
  
  return new LazyList(
    start,
    () => createLazyRange(start + 1, end)
  );
}

console.log('2. Lazy List Operations:');
const lazyNumbers = createLazyRange(1, 100);
const lazyDoubled = lazyNumbers.map(x => {
  console.log(`Computing ${x} * 2`); // Only logs when evaluated
  return x * 2;
});
const lazyFiltered = lazyDoubled.filter(x => x > 10);
const first5 = lazyFiltered.take(5);

console.log('Taking first 5 elements:');
console.log([...first5]);

console.log('\n=== Memoized Generators ===');

// Memoization decorator for generators
function memoizeGenerator(generatorFunction) {
  const cache = new Map();
  
  return function* (...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      yield* cache.get(key);
      return;
    }
    
    const results = [];
    const generator = generatorFunction(...args);
    
    for (const value of generator) {
      results.push(value);
      yield value;
    }
    
    cache.set(key, results);
  };
}

// Expensive Fibonacci with memoization
const memoizedFibonacci = memoizeGenerator(function* (n) {
  console.log(`Computing Fibonacci for ${n}`);
  
  if (n <= 1) {
    yield n;
    return;
  }
  
  const fib1 = [...memoizedFibonacci(n - 1)].pop();
  const fib2 = [...memoizedFibonacci(n - 2)].pop();
  
  yield fib1 + fib2;
});

console.log('3. Memoized Fibonacci:');
console.log('Fib(10):', [...memoizedFibonacci(10)][0]);
console.log('Fib(10) again (cached):', [...memoizedFibonacci(10)][0]);
console.log('Fib(15):', [...memoizedFibonacci(15)][0]);

console.log('\n=== Lazy Database Operations ===');

// Mock database with lazy loading
class LazyDatabase {
  constructor() {
    this.data = new Map();
    this.accessLog = [];
    
    // Populate with mock data
    for (let i = 1; i <= 1000; i++) {
      this.data.set(i, {
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        posts: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, 
          (_, j) => ({ id: j + 1, title: `Post ${j + 1}`, content: `Content ${j + 1}` }))
      });
    }
  }
  
  // Lazy user loading
  *getUsers(batchSize = 10) {
    console.log(`Loading users in batches of ${batchSize}`);
    const userIds = Array.from(this.data.keys());
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const users = batch.map(id => {
        this.accessLog.push({ table: 'users', id, timestamp: Date.now() });
        return this.data.get(id);
      });
      
      console.log(`Loaded batch ${Math.floor(i / batchSize) + 1}`);
      yield* users;
    }
  }
  
  // Lazy filtered search
  *searchUsers(query, limit = 50) {
    console.log(`Searching for "${query}" with limit ${limit}`);
    let found = 0;
    
    for (const user of this.getUsers(20)) {
      if (found >= limit) break;
      
      if (user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())) {
        found++;
        yield user;
      }
    }
    
    console.log(`Search completed. Found ${found} results.`);
  }
  
  // Lazy join simulation
  *getUsersWithPosts(userIds) {
    for (const userId of userIds) {
      const user = this.data.get(userId);
      if (user) {
        this.accessLog.push({ table: 'users', id: userId, timestamp: Date.now() });
        
        // Simulate lazy loading posts
        const userWithPosts = {
          ...user,
          posts: user.posts // In real scenario, this would be another lazy generator
        };
        
        yield userWithPosts;
      }
    }
  }
  
  getAccessLog() {
    return this.accessLog.slice(-10); // Last 10 accesses
  }
}

const db = new LazyDatabase();

console.log('4. Lazy Database Operations:');
console.log('Searching for users with "1" in name/email:');
const searchResults = [...lazyTake(db.searchUsers('1'), 5)];
searchResults.forEach(user => console.log(`- ${user.name} (${user.email})`));

console.log('\nRecent database accesses:');
console.log(db.getAccessLog());

console.log('\n=== Lazy Stream Processing ===');

// Stream processor with lazy evaluation
class LazyStream {
  constructor(source) {
    this.source = source;
    this.operations = [];
  }
  
  map(fn) {
    this.operations.push({ type: 'map', fn });
    return this;
  }
  
  filter(predicate) {
    this.operations.push({ type: 'filter', predicate });
    return this;
  }
  
  take(count) {
    this.operations.push({ type: 'take', count });
    return this;
  }
  
  skip(count) {
    this.operations.push({ type: 'skip', count });
    return this;
  }
  
  // Execute the pipeline lazily
  *execute() {
    let stream = this.source;
    
    for (const operation of this.operations) {
      stream = this._applyOperation(stream, operation);
    }
    
    yield* stream;
  }
  
  _applyOperation(stream, operation) {
    switch (operation.type) {
      case 'map':
        return lazyMap(stream, operation.fn);
      
      case 'filter':
        return lazyFilter(stream, operation.predicate);
      
      case 'take':
        return lazyTake(stream, operation.count);
      
      case 'skip':
        return this._skip(stream, operation.count);
      
      default:
        return stream;
    }
  }
  
  *_skip(iterable, count) {
    let skipped = 0;
    for (const item of iterable) {
      if (skipped < count) {
        skipped++;
        continue;
      }
      yield item;
    }
  }
  
  // Terminal operations
  toArray() {
    return [...this.execute()];
  }
  
  first() {
    const iterator = this.execute();
    const result = iterator.next();
    return result.done ? undefined : result.value;
  }
  
  reduce(reducer, initial) {
    let accumulator = initial;
    for (const item of this.execute()) {
      accumulator = reducer(accumulator, item);
    }
    return accumulator;
  }
}

// Factory function
function stream(source) {
  return new LazyStream(source);
}

console.log('5. Lazy Stream Processing:');
const largeDataset = lazyRange(1, 1000000);

const result = stream(largeDataset)
  .filter(x => x % 2 === 0)  // Even numbers
  .map(x => x * x)           // Square them
  .skip(1000)                // Skip first 1000
  .take(5)                   // Take next 5
  .toArray();

console.log('Processed result:', result);

console.log('\n=== Lazy File Processing ===');

// Simulated file line reader
class LazyFileReader {
  constructor(filename, lines) {
    this.filename = filename;
    this.lines = lines;
    this.readCount = 0;
  }
  
  *readLines() {
    console.log(`Opening file: ${this.filename}`);
    
    for (let i = 0; i < this.lines.length; i++) {
      // Simulate disk I/O delay
      this.readCount++;
      console.log(`Reading line ${i + 1}...`);
      yield this.lines[i];
    }
    
    console.log(`File closed. Total lines read: ${this.readCount}`);
  }
  
  *processLogs() {
    for (const line of this.readLines()) {
      // Parse log line (simulate expensive operation)
      const parsed = this._parseLine(line);
      if (parsed) {
        yield parsed;
      }
    }
  }
  
  _parseLine(line) {
    // Simulate parsing logic
    if (line.includes('ERROR')) {
      return {
        level: 'ERROR',
        message: line,
        timestamp: new Date().toISOString()
      };
    } else if (line.includes('WARN')) {
      return {
        level: 'WARN',
        message: line,
        timestamp: new Date().toISOString()
      };
    }
    return null; // Skip INFO lines
  }
}

// Mock log file
const logLines = [
  'INFO: Application started',
  'ERROR: Database connection failed',
  'WARN: High memory usage detected',
  'INFO: User logged in',
  'ERROR: Authentication failed',
  'INFO: Request processed',
  'WARN: Rate limit exceeded'
];

const fileReader = new LazyFileReader('app.log', logLines);

console.log('6. Lazy File Processing:');
console.log('Processing only ERROR and WARN logs:');

// Only process until we find 2 ERROR logs
let errorCount = 0;
for (const logEntry of fileReader.processLogs()) {
  console.log(`${logEntry.level}: ${logEntry.message}`);
  
  if (logEntry.level === 'ERROR') {
    errorCount++;
    if (errorCount >= 2) {
      console.log('Found 2 errors, stopping processing');
      break;
    }
  }
}

console.log('\n=== Performance Comparison ===');

// Performance comparison: Eager vs Lazy
function eagerProcessing() {
  const start = Date.now();
  
  // Create entire array upfront
  const numbers = Array.from({ length: 100000 }, (_, i) => i + 1);
  const doubled = numbers.map(x => x * 2);
  const filtered = doubled.filter(x => x > 10);
  const result = filtered.slice(0, 10);
  
  const duration = Date.now() - start;
  return { result, duration, processed: numbers.length };
}

function lazyProcessing() {
  const start = Date.now();
  
  // Process only what's needed
  const numbers = lazyRange(1, 100001);
  const doubled = lazyMap(numbers, x => x * 2);
  const filtered = lazyFilter(doubled, x => x > 10);
  const result = [...lazyTake(filtered, 10)];
  
  const duration = Date.now() - start;
  return { result, duration, processed: 10 }; // Only processed what we needed
}

console.log('7. Performance Comparison:');
const eagerResult = eagerProcessing();
console.log(`Eager: ${eagerResult.duration}ms, processed ${eagerResult.processed} items`);

const lazyResult = lazyProcessing();
console.log(`Lazy: ${lazyResult.duration}ms, processed ${lazyResult.processed} items`);

console.log('Results equal:', JSON.stringify(eagerResult.result) === JSON.stringify(lazyResult.result));

console.log('\n=== Interview Questions ===');

// Q1: Implement lazy pagination
function* lazyPagination(fetchFunction, pageSize = 10) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    const data = fetchFunction(page, pageSize);
    
    if (data.length < pageSize) {
      hasMore = false;
    }
    
    yield* data;
    page++;
    
    if (data.length === 0) break;
  }
}

// Mock API
function mockFetchPage(page, pageSize) {
  const totalItems = 25;
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalItems);
  
  if (start >= totalItems) return [];
  
  return Array.from({ length: end - start }, (_, i) => ({
    id: start + i + 1,
    data: `Item ${start + i + 1}`
  }));
}

console.log('Q1: Lazy Pagination:');
let itemCount = 0;
for (const item of lazyPagination(mockFetchPage, 5)) {
  console.log(`${item.id}: ${item.data}`);
  itemCount++;
  
  // Stop after 8 items to demonstrate lazy behavior
  if (itemCount >= 8) {
    console.log('Stopping early - remaining pages not fetched');
    break;
  }
}

// Q2: Implement lazy cache with TTL
class LazyCacheWithTTL {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  *get(key, factory) {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < this.ttl) {
      console.log(`Cache hit for ${key}`);
      yield cached.value;
      return;
    }
    
    console.log(`Cache miss for ${key}, generating value...`);
    const value = factory();
    
    this.cache.set(key, {
      value,
      timestamp: now
    });
    
    yield value;
  }
  
  clear() {
    this.cache.clear();
  }
}

console.log('Q2: Lazy Cache with TTL:');
const cache = new LazyCacheWithTTL(1000); // 1 second TTL

const expensiveFactory = () => {
  console.log('Expensive computation...');
  return Math.random() * 1000;
};

// First access
const value1 = [...cache.get('expensive-calc', expensiveFactory)][0];
console.log('First value:', Math.floor(value1));

// Second access (should use cache)
setTimeout(() => {
  const value2 = [...cache.get('expensive-calc', expensiveFactory)][0];
  console.log('Second value:', Math.floor(value2));
}, 500);

// Third access after TTL (should regenerate)
setTimeout(() => {
  const value3 = [...cache.get('expensive-calc', expensiveFactory)][0];
  console.log('Third value after TTL:', Math.floor(value3));
}, 1500);

module.exports = {
  lazyRange,
  lazyMap,
  lazyFilter,
  lazyTake,
  LazyList,
  createLazyRange,
  memoizeGenerator,
  LazyDatabase,
  LazyStream,
  stream,
  LazyFileReader,
  eagerProcessing,
  lazyProcessing,
  lazyPagination,
  LazyCacheWithTTL
};