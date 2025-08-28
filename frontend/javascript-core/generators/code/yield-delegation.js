/**
 * File: yield-delegation.js
 * Description: yield* delegation and composition patterns
 */

// Basic yield* delegation
function* generator1() {
  yield 'a';
  yield 'b';
}

function* generator2() {
  yield 'c';
  yield 'd';
}

function* combinedGenerator() {
  yield* generator1();
  yield* generator2();
  yield 'e';
}

console.log('=== Basic Yield Delegation ===');
for (const value of combinedGenerator()) {
  console.log(value); // a, b, c, d, e
}

// Yield* with arrays (iterable delegation)
function* arrayDelegation() {
  yield* [1, 2, 3];
  yield* 'hello';
  yield* new Set(['a', 'b', 'c']);
}

console.log('\n=== Array/String/Set Delegation ===');
console.log([...arrayDelegation()]); // [1, 2, 3, 'h', 'e', 'l', 'l', 'o', 'a', 'b', 'c']

// Nested generator delegation
function* level1() {
  yield 'level1-start';
  yield* level2();
  yield 'level1-end';
}

function* level2() {
  yield 'level2-start';
  yield* level3();
  yield 'level2-end';
}

function* level3() {
  yield 'level3-only';
}

console.log('\n=== Nested Delegation ===');
console.log([...level1()]);

// Tree traversal with yield*
class TreeNode {
  constructor(value, children = []) {
    this.value = value;
    this.children = children;
  }

  *traverse() {
    yield this.value;
    for (const child of this.children) {
      yield* child.traverse();
    }
  }
}

const tree = new TreeNode('root', [
  new TreeNode('child1', [
    new TreeNode('grandchild1'),
    new TreeNode('grandchild2')
  ]),
  new TreeNode('child2')
]);

console.log('\n=== Tree Traversal ===');
console.log([...tree.traverse()]);

// Generator composition with return values
function* generatorWithReturn() {
  yield 1;
  yield 2;
  return 'returned value';
}

function* delegatingGenerator() {
  const result = yield* generatorWithReturn();
  console.log('Received return value:', result);
  yield 3;
}

console.log('\n=== Delegation with Return Values ===');
console.log([...delegatingGenerator()]);

// Flattening nested arrays
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item);
    } else {
      yield item;
    }
  }
}

const nestedArray = [1, [2, 3], [4, [5, 6]], 7];
console.log('\n=== Flattening Arrays ===');
console.log([...flatten(nestedArray)]);

module.exports = {
  combinedGenerator,
  arrayDelegation,
  level1,
  TreeNode,
  generatorWithReturn,
  delegatingGenerator,
  flatten
};