/**
 * File: interview-iterator.js
 * Description: Implement custom iterators and iterables
 * Tests understanding of iterator protocol and Symbol.iterator
 */

// === Custom Iterator Implementation ===
function createRangeIterator(start, end) {
  let current = start;
  
  return {
    next() {
      if (current < end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

// === Iterable Class ===
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    
    return {
      next() {
        if (current < end) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

// === Generator-based Iterator ===
class GeneratorRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; i++) {
      yield i;
    }
  }
}

// === Complex Data Structure Iterator ===
class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  add(value) {
    const node = { value, next: null };
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this.size++;
  }
  
  // Iterator implementation
  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
  
  // Reverse iterator
  *reverse() {
    const values = [];
    for (const value of this) {
      values.unshift(value);
    }
    yield* values;
  }
}

// === Binary Tree Iterator ===
class BinaryTreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    if (!this.root) {
      this.root = new BinaryTreeNode(value);
      return;
    }
    
    const insertNode = (node, value) => {
      if (value < node.value) {
        if (!node.left) {
          node.left = new BinaryTreeNode(value);
        } else {
          insertNode(node.left, value);
        }
      } else {
        if (!node.right) {
          node.right = new BinaryTreeNode(value);
        } else {
          insertNode(node.right, value);
        }
      }
    };
    
    insertNode(this.root, value);
  }
  
  // In-order traversal iterator
  *[Symbol.iterator]() {
    yield* this.inOrder(this.root);
  }
  
  *inOrder(node) {
    if (node) {
      yield* this.inOrder(node.left);
      yield node.value;
      yield* this.inOrder(node.right);
    }
  }
  
  // Pre-order traversal
  *preOrder(node = this.root) {
    if (node) {
      yield node.value;
      yield* this.preOrder(node.left);
      yield* this.preOrder(node.right);
    }
  }
  
  // Post-order traversal
  *postOrder(node = this.root) {
    if (node) {
      yield* this.postOrder(node.left);
      yield* this.postOrder(node.right);
      yield node.value;
    }
  }
}

// === Pagination Iterator ===
class PaginationIterator {
  constructor(data, pageSize = 5) {
    this.data = data;
    this.pageSize = pageSize;
  }
  
  *[Symbol.iterator]() {
    for (let i = 0; i < this.data.length; i += this.pageSize) {
      yield this.data.slice(i, i + this.pageSize);
    }
  }
}

// === Async Iterator ===
class AsyncDataLoader {
  constructor(urls) {
    this.urls = urls;
  }
  
  async *[Symbol.asyncIterator]() {
    for (const url of this.urls) {
      // Simulate async data loading
      await new Promise(resolve => setTimeout(resolve, 100));
      yield { url, data: `Data from ${url}` };
    }
  }
}

// === Tests and Demonstrations ===
console.log('=== Custom Range Iterator ===');
const rangeIter = createRangeIterator(1, 5);
let result = rangeIter.next();
while (!result.done) {
  console.log(result.value);
  result = rangeIter.next();
}

console.log('\n=== Range Iterable Class ===');
const range = new Range(5, 10);
for (const num of range) {
  console.log(num);
}

console.log('\n=== Generator Range ===');
const genRange = new GeneratorRange(10, 15);
console.log([...genRange]);

console.log('\n=== Linked List Iterator ===');
const list = new LinkedList();
list.add('A');
list.add('B');
list.add('C');
list.add('D');

console.log('Forward:', [...list]);
console.log('Reverse:', [...list.reverse()]);

console.log('\n=== Binary Tree Iterator ===');
const tree = new BinaryTree();
[5, 3, 8, 1, 4, 7, 9].forEach(val => tree.insert(val));

console.log('In-order:', [...tree]);
console.log('Pre-order:', [...tree.preOrder()]);
console.log('Post-order:', [...tree.postOrder()]);

console.log('\n=== Pagination Iterator ===');
const data = Array.from({ length: 23 }, (_, i) => `Item ${i + 1}`);
const pagination = new PaginationIterator(data, 5);

let pageNum = 1;
for (const page of pagination) {
  console.log(`Page ${pageNum++}:`, page);
}

// === Interview Questions ===

// Q1: Implement iterator for odd numbers
function* oddNumbers(limit) {
  for (let i = 1; i <= limit; i += 2) {
    yield i;
  }
}

console.log('\n=== Odd Numbers Iterator ===');
console.log([...oddNumbers(20)]);

// Q2: Implement iterator that filters values
function* filter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

console.log('\n=== Filter Iterator ===');
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = filter(numbers, x => x % 2 === 0);
console.log('Even numbers:', [...evenNumbers]);

// Q3: Implement zip iterator
function* zip(...iterables) {
  const iterators = iterables.map(it => it[Symbol.iterator]());
  
  while (true) {
    const results = iterators.map(it => it.next());
    
    if (results.some(result => result.done)) {
      break;
    }
    
    yield results.map(result => result.value);
  }
}

console.log('\n=== Zip Iterator ===');
const arr1 = [1, 2, 3];
const arr2 = ['a', 'b', 'c'];
const arr3 = ['x', 'y', 'z'];
const zipped = zip(arr1, arr2, arr3);
console.log([...zipped]);

// Q4: Implement take iterator
function* take(iterable, count) {
  let taken = 0;
  for (const item of iterable) {
    if (taken >= count) break;
    yield item;
    taken++;
  }
}

console.log('\n=== Take Iterator ===');
const infiniteNumbers = function* () {
  let i = 1;
  while (true) yield i++;
}();

const first5 = take(infiniteNumbers, 5);
console.log('First 5 numbers:', [...first5]);

// Async iterator demonstration
async function demonstrateAsyncIterator() {
  console.log('\n=== Async Iterator ===');
  const loader = new AsyncDataLoader(['url1', 'url2', 'url3']);
  
  for await (const item of loader) {
    console.log(item);
  }
}

module.exports = {
  createRangeIterator,
  Range,
  GeneratorRange,
  LinkedList,
  BinaryTree,
  BinaryTreeNode,
  PaginationIterator,
  AsyncDataLoader,
  oddNumbers,
  filter,
  zip,
  take,
  demonstrateAsyncIterator
};