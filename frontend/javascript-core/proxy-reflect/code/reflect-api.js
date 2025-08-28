/**
 * File: reflect-api.js
 * Description: Complete guide to the Reflect API
 * Demonstrates all Reflect methods and their use cases
 */

console.log('=== Reflect API Complete Guide ===\n');

// === Reflect.get(target, property[, receiver]) ===
console.log('1. Reflect.get():');

const obj1 = {
  name: 'John',
  get fullName() {
    return `${this.firstName || 'Unknown'} ${this.name}`;
  }
};

console.log('Basic get:', Reflect.get(obj1, 'name')); // 'John'
console.log('Getter without receiver:', Reflect.get(obj1, 'fullName')); // 'Unknown John'

// With receiver
const receiver = { firstName: 'Jane', name: 'Doe' };
console.log('Getter with receiver:', Reflect.get(obj1, 'fullName', receiver)); // 'Jane John'

// === Reflect.set(target, property, value[, receiver]) ===
console.log('\n2. Reflect.set():');

const obj2 = {
  _value: 0,
  set value(val) {
    console.log(`Setting value to ${val}`);
    this._value = val;
  },
  get value() {
    return this._value;
  }
};

console.log('Set result:', Reflect.set(obj2, 'value', 42)); // true
console.log('Current value:', obj2.value); // 42

// With receiver
const receiver2 = { _value: 0 };
Reflect.set(obj2, 'value', 100, receiver2);
console.log('Receiver value:', receiver2._value); // 100

// === Reflect.has(target, property) ===
console.log('\n3. Reflect.has():');

const obj3 = {
  prop1: 'value1',
  [Symbol.for('hidden')]: 'secret'
};

console.log('Has prop1:', Reflect.has(obj3, 'prop1')); // true
console.log('Has prop2:', Reflect.has(obj3, 'prop2')); // false
console.log('Has symbol:', Reflect.has(obj3, Symbol.for('hidden'))); // true
console.log('Has toString (inherited):', Reflect.has(obj3, 'toString')); // true

// === Reflect.deleteProperty(target, property) ===
console.log('\n4. Reflect.deleteProperty():');

const obj4 = {
  deletable: 'can delete',
  permanent: 'cannot delete'
};

Object.defineProperty(obj4, 'permanent', {
  configurable: false
});

console.log('Delete deletable:', Reflect.deleteProperty(obj4, 'deletable')); // true
console.log('Delete permanent:', Reflect.deleteProperty(obj4, 'permanent')); // false
console.log('Object after deletion:', obj4);

// === Reflect.defineProperty(target, property, descriptor) ===
console.log('\n5. Reflect.defineProperty():');

const obj5 = {};

const success1 = Reflect.defineProperty(obj5, 'readOnly', {
  value: 'constant',
  writable: false,
  enumerable: true,
  configurable: false
});

console.log('Define readonly property:', success1); // true
console.log('Readonly value:', obj5.readOnly); // 'constant'

// Try to redefine (will fail)
const success2 = Reflect.defineProperty(obj5, 'readOnly', {
  value: 'changed'
});

console.log('Redefine readonly property:', success2); // false

// === Reflect.getOwnPropertyDescriptor(target, property) ===
console.log('\n6. Reflect.getOwnPropertyDescriptor():');

const obj6 = {
  normalProp: 'normal'
};

Object.defineProperty(obj6, 'specialProp', {
  value: 'special',
  writable: false,
  enumerable: false,
  configurable: true
});

const desc1 = Reflect.getOwnPropertyDescriptor(obj6, 'normalProp');
const desc2 = Reflect.getOwnPropertyDescriptor(obj6, 'specialProp');
const desc3 = Reflect.getOwnPropertyDescriptor(obj6, 'nonexistent');

console.log('Normal prop descriptor:', desc1);
console.log('Special prop descriptor:', desc2);
console.log('Nonexistent prop descriptor:', desc3); // undefined

// === Reflect.ownKeys(target) ===
console.log('\n7. Reflect.ownKeys():');

const obj7 = {
  prop1: 'value1',
  prop2: 'value2',
  [Symbol.for('sym1')]: 'symbol value',
  [Symbol('sym2')]: 'another symbol'
};

Object.defineProperty(obj7, 'hiddenProp', {
  value: 'hidden',
  enumerable: false
});

console.log('Own keys:', Reflect.ownKeys(obj7));
console.log('Compare with Object.keys:', Object.keys(obj7));
console.log('Compare with Object.getOwnPropertyNames:', Object.getOwnPropertyNames(obj7));

// === Reflect.getPrototypeOf(target) ===
console.log('\n8. Reflect.getPrototypeOf():');

class Parent {
  parentMethod() {
    return 'parent';
  }
}

class Child extends Parent {
  childMethod() {
    return 'child';
  }
}

const child = new Child();

console.log('Child prototype:', Reflect.getPrototypeOf(child) === Child.prototype); // true
console.log('Parent prototype:', Reflect.getPrototypeOf(Child.prototype) === Parent.prototype); // true

// === Reflect.setPrototypeOf(target, prototype) ===
console.log('\n9. Reflect.setPrototypeOf():');

const obj8 = {};
const proto = { 
  inheritedMethod() {
    return 'inherited';
  }
};

const setProtoResult = Reflect.setPrototypeOf(obj8, proto);
console.log('Set prototype result:', setProtoResult); // true
console.log('Can call inherited method:', obj8.inheritedMethod()); // 'inherited'

// === Reflect.isExtensible(target) ===
console.log('\n10. Reflect.isExtensible():');

const obj9 = {};
console.log('Initially extensible:', Reflect.isExtensible(obj9)); // true

Object.preventExtensions(obj9);
console.log('After preventExtensions:', Reflect.isExtensible(obj9)); // false

// === Reflect.preventExtensions(target) ===
console.log('\n11. Reflect.preventExtensions():');

const obj10 = { existing: 'prop' };

console.log('Before prevent:', Reflect.isExtensible(obj10)); // true
const preventResult = Reflect.preventExtensions(obj10);
console.log('Prevent result:', preventResult); // true
console.log('After prevent:', Reflect.isExtensible(obj10)); // false

// Try to add property (will fail silently or throw in strict mode)
obj10.newProp = 'value';
console.log('New property added?', 'newProp' in obj10); // false

// === Reflect.apply(target, thisArgument, argumentsList) ===
console.log('\n12. Reflect.apply():');

function greet(greeting, punctuation = '!') {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };
const args = ['Hello', '!!!'];

const result = Reflect.apply(greet, person, args);
console.log('Apply result:', result); // 'Hello, Alice!!!'

// Using with array methods
const numbers = [1, 2, 3, 4, 5];
const max = Reflect.apply(Math.max, null, numbers);
console.log('Max from array:', max); // 5

// === Reflect.construct(target, argumentsList[, newTarget]) ===
console.log('\n13. Reflect.construct():');

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  introduce() {
    return `Hi, I'm ${this.name}`;
  }
}

const personArgs = ['Bob', 30];
const newPerson = Reflect.construct(Person, personArgs);
console.log('Constructed person:', newPerson);
console.log('Introduce:', newPerson.introduce());

// With different newTarget
class Employee extends Person {
  constructor(name, age, job) {
    super(name, age);
    this.job = job;
  }
}

const employee = Reflect.construct(Person, personArgs, Employee);
console.log('Is Employee instance:', employee instanceof Employee); // true
console.log('Has Person constructor behavior:', employee.name, employee.age);

// === Practical Examples ===
console.log('\n=== Practical Examples ===');

// 1. Generic property setter with validation
function safeSet(target, property, value, validator) {
  if (validator && !validator(value)) {
    throw new Error(`Invalid value for property ${property}`);
  }
  
  return Reflect.set(target, property, value);
}

const user = {};
try {
  safeSet(user, 'age', 25, (val) => typeof val === 'number' && val >= 0);
  safeSet(user, 'name', 'John', (val) => typeof val === 'string' && val.length > 0);
  console.log('User object:', user);
  
  safeSet(user, 'age', -5, (val) => typeof val === 'number' && val >= 0);
} catch (error) {
  console.log('Validation error:', error.message);
}

// 2. Dynamic method calling
function callMethod(obj, methodName, ...args) {
  if (Reflect.has(obj, methodName)) {
    const method = Reflect.get(obj, methodName);
    if (typeof method === 'function') {
      return Reflect.apply(method, obj, args);
    }
  }
  throw new Error(`Method ${methodName} not found or not a function`);
}

const calculator = {
  add(a, b) { return a + b; },
  multiply(a, b) { return a * b; }
};

console.log('Dynamic add:', callMethod(calculator, 'add', 5, 3));
console.log('Dynamic multiply:', callMethod(calculator, 'multiply', 4, 7));

// 3. Property copying with descriptors
function copyProperties(source, target, ...properties) {
  for (const prop of properties) {
    if (Reflect.has(source, prop)) {
      const descriptor = Reflect.getOwnPropertyDescriptor(source, prop);
      if (descriptor) {
        Reflect.defineProperty(target, prop, descriptor);
      }
    }
  }
}

const source = {
  prop1: 'value1',
  get prop2() { return this._prop2 || 'default'; },
  set prop2(val) { this._prop2 = val; }
};

const target = {};
copyProperties(source, target, 'prop1', 'prop2');
console.log('Copied properties:', target);

target.prop2 = 'set value';
console.log('Getter/setter works:', target.prop2);

// 4. Safe object extension
function extendObject(target, extensions) {
  if (!Reflect.isExtensible(target)) {
    console.log('Cannot extend non-extensible object');
    return false;
  }
  
  for (const [key, value] of Object.entries(extensions)) {
    if (!Reflect.set(target, key, value)) {
      console.log(`Failed to set property ${key}`);
      return false;
    }
  }
  
  return true;
}

const extensible = {};
const nonExtensible = {};
Object.preventExtensions(nonExtensible);

console.log('Extend extensible:', extendObject(extensible, { a: 1, b: 2 }));
console.log('Extend non-extensible:', extendObject(nonExtensible, { c: 3 }));

module.exports = {
  safeSet,
  callMethod,
  copyProperties,
  extendObject
};