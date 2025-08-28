/**
 * File: iterator-protocol.js
 * Description: Understanding the iterator protocol and implementing custom iterators
 * Demonstrates how generators work under the hood and manual iterator implementation
 */

console.log('=== Iterator Protocol Basics ===');

// Manual iterator implementation
function createCustomIterator(array) {
  let index = 0;
  
  return {
    next() {
      if (index < array.length) {
        return { value: array[index++], done: false };
      } else {
        return { value: undefined, done: true };
      }
    }
  };
}

console.log('1. Manual Iterator:');
const customIter = createCustomIterator(['a', 'b', 'c']);

console.log(customIter.next()); // { value: 'a', done: false }
console.log(customIter.next()); // { value: 'b', done: false }
console.log(customIter.next()); // { value: 'c', done: false }
console.log(customIter.next()); // { value: undefined, done: true }

console.log('\n=== Iterable Protocol ===');

// Object that implements iterable protocol
class NumberRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  // Implement Symbol.iterator to make it iterable
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    
    return {
      next() {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

console.log('2. Custom Iterable:');
const range = new NumberRange(1, 5);

// Now it works with for...of
for (const num of range) {
  console.log('Range value:', num);
}

// And with spread operator
console.log('Range as array:', [...range]);

console.log('\n=== Generator vs Manual Iterator ===');

// Same functionality with generator (much simpler)
function* generatorRange(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

console.log('3. Generator version:');
const genRange = generatorRange(1, 5);
console.log('Generator range:', [...genRange]);

// Generators are iterators
console.log('Generator is iterator:', typeof genRange.next === 'function');
console.log('Generator is iterable:', Symbol.iterator in genRange);

console.log('\n=== Complex Iterator Example ===');

// Iterator that processes data in chunks
class ChunkIterator {
  constructor(data, chunkSize) {
    this.data = data;
    this.chunkSize = chunkSize;
    this.index = 0;
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next() {
    if (this.index >= this.data.length) {
      return { done: true };
    }
    
    const chunk = this.data.slice(this.index, this.index + this.chunkSize);
    this.index += this.chunkSize;
    
    return { value: chunk, done: false };
  }
}

console.log('4. Chunk Iterator:');
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const chunks = new ChunkIterator(data, 3);

for (const chunk of chunks) {
  console.log('Chunk:', chunk);
}

console.log('\n=== Iterator with State ===');

// Iterator that maintains complex state
class StatefulIterator {
  constructor() {
    this.state = {
      count: 0,
      sequence: [0, 1], // Fibonacci starting values
      history: []
    };
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next() {
    if (this.state.count >= 10) { // Limit to 10 numbers
      return { done: true };
    }
    
    let value;
    if (this.state.count < 2) {
      value = this.state.sequence[this.state.count];
    } else {
      // Calculate next Fibonacci number
      value = this.state.sequence[0] + this.state.sequence[1];
      this.state.sequence = [this.state.sequence[1], value];
    }
    
    this.state.history.push(value);
    this.state.count++;
    
    return {
      value: {
        number: value,
        position: this.state.count,
        total: this.state.history.length
      },
      done: false
    };
  }
  
  getHistory() {
    return this.state.history.slice();
  }
}

console.log('5. Stateful Iterator (Fibonacci with metadata):');
const statefulIter = new StatefulIterator();

for (const item of statefulIter) {
  console.log(`Fib #${item.position}: ${item.number} (total: ${item.total})`);
}

console.log('History:', statefulIter.getHistory());

console.log('\n=== Iterator Protocols in Built-ins ===');

// String iterator
console.log('6. String Iterator:');
const str = 'Hello';
const strIterator = str[Symbol.iterator]();

console.log('String iterator results:');
let strResult = strIterator.next();
while (!strResult.done) {
  console.log('Character:', strResult.value);
  strResult = strIterator.next();
}

// Array iterator
console.log('\n7. Array Iterator:');
const arr = [10, 20, 30];
const arrIterator = arr[Symbol.iterator]();

console.log('Array iterator results:');
console.log(arrIterator.next()); // { value: 10, done: false }
console.log(arrIterator.next()); // { value: 20, done: false }
console.log(arrIterator.next()); // { value: 30, done: false }
console.log(arrIterator.next()); // { value: undefined, done: true }

// Map iterator
console.log('\n8. Map Iterator:');
const map = new Map([['a', 1], ['b', 2]]);
const mapIterator = map[Symbol.iterator]();

console.log('Map iterator results:');
for (const entry of mapIterator) {
  console.log('Entry:', entry);
}

console.log('\n=== Custom Iterator Use Cases ===');

// File line iterator (simulated)
class LineIterator {
  constructor(text) {
    this.lines = text.split('\n');
    this.index = 0;
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next() {
    if (this.index < this.lines.length) {
      const line = this.lines[this.index];
      this.index++;
      
      return {
        value: {
          lineNumber: this.index,
          content: line.trim(),
          length: line.length
        },
        done: false
      };
    }
    
    return { done: true };
  }
}

console.log('9. Line Iterator:');
const fileContent = `Line 1
Line 2
Line 3`;

const lineIter = new LineIterator(fileContent);
for (const line of lineIter) {
  console.log(`${line.lineNumber}: "${line.content}" (${line.length} chars)`);
}

// Date range iterator
class DateRangeIterator {
  constructor(startDate, endDate, intervalDays = 1) {
    this.current = new Date(startDate);
    this.end = new Date(endDate);
    this.interval = intervalDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next() {
    if (this.current <= this.end) {
      const value = new Date(this.current);
      this.current = new Date(this.current.getTime() + this.interval);
      
      return {
        value: value.toISOString().split('T')[0], // YYYY-MM-DD format
        done: false
      };
    }
    
    return { done: true };
  }
}

console.log('\n10. Date Range Iterator:');
const dateRange = new DateRangeIterator('2024-01-01', '2024-01-07', 2);
for (const date of dateRange) {
  console.log('Date:', date);
}

console.log('\n=== Iterator Error Handling ===');

// Iterator with error handling
class SafeIterator {
  constructor(data, validator) {
    this.data = data;
    this.validator = validator;
    this.index = 0;
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next() {
    while (this.index < this.data.length) {
      const value = this.data[this.index++];
      
      try {
        if (this.validator(value)) {
          return { value, done: false };
        }
        // Skip invalid values
        continue;
      } catch (error) {
        console.log(`Validation error for ${value}:`, error.message);
        continue;
      }
    }
    
    return { done: true };
  }
}

console.log('11. Safe Iterator (filters invalid values):');
const mixedData = [1, 'hello', 2, null, 3, undefined, 4];
const safeIter = new SafeIterator(mixedData, value => {
  if (value === null || value === undefined) {
    throw new Error('Null/undefined not allowed');
  }
  return typeof value === 'number';
});

for (const value of safeIter) {
  console.log('Valid value:', value);
}

console.log('\n=== Iterator Performance ===');

// Performance comparison: Iterator vs Array
function performanceTest() {
  const size = 1000000;
  
  // Array approach - loads all data into memory
  console.time('Array creation');
  const array = Array.from({ length: size }, (_, i) => i);
  console.timeEnd('Array creation');
  
  console.time('Array iteration');
  let sum1 = 0;
  for (const num of array) {
    sum1 += num;
    if (sum1 > size * 100) break; // Early termination
  }
  console.timeEnd('Array iteration');
  
  // Iterator approach - generates on demand
  class NumberIterator {
    constructor(max) {
      this.max = max;
      this.current = 0;
    }
    
    [Symbol.iterator]() {
      return this;
    }
    
    next() {
      if (this.current < this.max) {
        return { value: this.current++, done: false };
      }
      return { done: true };
    }
  }
  
  console.time('Iterator creation');
  const iterator = new NumberIterator(size);
  console.timeEnd('Iterator creation');
  
  console.time('Iterator iteration');
  let sum2 = 0;
  for (const num of iterator) {
    sum2 += num;
    if (sum2 > size * 100) break; // Early termination
  }
  console.timeEnd('Iterator iteration');
  
  console.log('Memory usage: Array loads all data, Iterator generates on-demand');
  console.log('Early termination benefits: Iterator stops generation immediately');
}

performanceTest();

console.log('\n=== Interview Questions ===');

// Q1: Implement a peek-able iterator
class PeekableIterator {
  constructor(iterable) {
    this.iterator = iterable[Symbol.iterator]();
    this.peekedValue = null;
    this.hasPeeked = false;
  }
  
  peek() {
    if (!this.hasPeeked) {
      const result = this.iterator.next();
      if (!result.done) {
        this.peekedValue = result.value;
        this.hasPeeked = true;
      }
    }
    return this.peekedValue;
  }
  
  next() {
    if (this.hasPeeked) {
      this.hasPeeked = false;
      const value = this.peekedValue;
      this.peekedValue = null;
      return { value, done: false };
    }
    
    return this.iterator.next();
  }
  
  [Symbol.iterator]() {
    return this;
  }
}

console.log('Q1: Peekable Iterator:');
const peekable = new PeekableIterator([1, 2, 3, 4, 5]);
console.log('Peek:', peekable.peek()); // 1
console.log('Peek again:', peekable.peek()); // 1 (same)
console.log('Next:', peekable.next().value); // 1
console.log('Next:', peekable.next().value); // 2

// Q2: Implement a take iterator
class TakeIterator {
  constructor(iterable, count) {
    this.iterator = iterable[Symbol.iterator]();
    this.count = count;
    this.taken = 0;
  }
  
  [Symbol.iterator]() {
    return this;
  }
  
  next() {
    if (this.taken >= this.count) {
      return { done: true };
    }
    
    const result = this.iterator.next();
    if (!result.done) {
      this.taken++;
    }
    
    return result;
  }
}

console.log('\nQ2: Take Iterator:');
const infiniteNumbers = function* () {
  let i = 1;
  while (true) yield i++;
}();

const takeFirst5 = new TakeIterator(infiniteNumbers, 5);
console.log('First 5 numbers:', [...takeFirst5]);

module.exports = {
  createCustomIterator,
  NumberRange,
  generatorRange,
  ChunkIterator,
  StatefulIterator,
  LineIterator,
  DateRangeIterator,
  SafeIterator,
  PeekableIterator,
  TakeIterator
};