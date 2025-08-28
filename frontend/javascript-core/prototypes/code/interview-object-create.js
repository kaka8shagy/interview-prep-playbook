/**
 * File: interview-object-create.js
 * Description: Implement Object.create() polyfill - common interview question
 * Tests understanding of prototype chain and object creation
 */

// Basic Object.create implementation
function objectCreate(proto) {
  // Create a temporary constructor function
  function F() {}
  // Set its prototype to the desired prototype
  F.prototype = proto;
  // Return new instance which will have proto as [[Prototype]]
  return new F();
}

// More complete implementation with property descriptors
function objectCreateAdvanced(proto, propertiesObject) {
  if (typeof proto !== 'object' && typeof proto !== 'function' && proto !== null) {
    throw new TypeError('Object prototype may only be an Object or null');
  }
  
  // Create object with specified prototype
  function F() {}
  F.prototype = proto;
  const obj = new F();
  
  // Handle null prototype
  if (proto === null) {
    // Have to use native Object.create for null prototype
    obj.__proto__ = null;
  }
  
  // Add properties if provided
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  
  return obj;
}

// Full polyfill matching native Object.create
if (!Object.create) {
  Object.create = function(proto, propertiesObject) {
    if (typeof proto !== 'object' && typeof proto !== 'function' && proto !== null) {
      throw new TypeError('Object prototype may only be an Object or null: ' + proto);
    }
    
    // Create temporary constructor
    const TempConstructor = function() {};
    
    // Assign prototype
    TempConstructor.prototype = proto;
    
    // Create new instance
    const obj = new TempConstructor();
    
    // Restore constructor property
    if (proto === null) {
      obj.__proto__ = null;
    }
    
    // Add properties
    if (propertiesObject !== undefined) {
      if (Object(propertiesObject) !== propertiesObject) {
        throw new TypeError('Properties must be an object');
      }
      Object.defineProperties(obj, propertiesObject);
    }
    
    return obj;
  };
}

// Alternative implementation using __proto__ (not recommended)
function objectCreateProto(proto) {
  const obj = {};
  obj.__proto__ = proto;
  return obj;
}

// Modern implementation using Object.setPrototypeOf
function objectCreateModern(proto) {
  const obj = {};
  Object.setPrototypeOf(obj, proto);
  return obj;
}

// Test implementations
console.log('=== Testing Object.create Implementations ===\n');

// Test basic inheritance
const animal = {
  type: 'animal',
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = objectCreate(animal);
dog.name = 'Rex';
dog.bark = function() {
  return `${this.name} barks`;
};

console.log('Dog name:', dog.name); // Rex
console.log('Dog type:', dog.type); // animal (inherited)
console.log('Dog speaks:', dog.speak()); // Rex makes a sound
console.log('Dog barks:', dog.bark()); // Rex barks

// Test prototype chain
console.log('\n=== Prototype Chain ===');
console.log('dog.__proto__ === animal:', Object.getPrototypeOf(dog) === animal); // true
console.log('animal.isPrototypeOf(dog):', animal.isPrototypeOf(dog)); // true

// Test with property descriptors
console.log('\n=== With Property Descriptors ===');
const person = objectCreateAdvanced(null, {
  name: {
    value: 'John',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 30,
    writable: false,
    enumerable: true,
    configurable: false
  },
  getId: {
    value: function() { return this.name + this.age; },
    writable: false,
    enumerable: false,
    configurable: false
  }
});

console.log('Person name:', person.name); // John
console.log('Person age:', person.age); // 30
person.age = 40; // Won't change (not writable)
console.log('Person age after change:', person.age); // 30
console.log('Person ID:', person.getId()); // John30

// Test with null prototype
console.log('\n=== Null Prototype ===');
const nullProtoObj = objectCreate(null);
console.log('Has toString?:', nullProtoObj.toString); // undefined
console.log('Prototype:', Object.getPrototypeOf(nullProtoObj)); // null

// Comparison with native Object.create
console.log('\n=== Comparing with Native ===');
const nativeCreated = Object.create(animal);
const customCreated = objectCreate(animal);

nativeCreated.name = 'Native Dog';
customCreated.name = 'Custom Dog';

console.log('Native:', nativeCreated.speak()); // Native Dog makes a sound
console.log('Custom:', customCreated.speak()); // Custom Dog makes a sound

// Edge cases
console.log('\n=== Edge Cases ===');

// 1. Creating from function prototype
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} speaks`;
};

const cat = objectCreate(Animal.prototype);
cat.name = 'Whiskers';
console.log('Cat from function prototype:', cat.speak()); // Whiskers speaks

// 2. Creating from primitive (should throw error)
try {
  const invalid = objectCreate('string');
} catch (e) {
  console.log('Error creating from primitive:', e.message);
}

// 3. Property descriptor validation
const descriptorTest = objectCreateAdvanced({}, {
  prop: {
    get() { return this._prop; },
    set(value) { this._prop = value * 2; },
    enumerable: true,
    configurable: true
  }
});

descriptorTest.prop = 5;
console.log('Getter/Setter test:', descriptorTest.prop); // 10

// Performance comparison
console.log('\n=== Performance Test ===');
const iterations = 100000;
const proto = { x: 1, y: 2 };

console.time('Native Object.create');
for (let i = 0; i < iterations; i++) {
  Object.create(proto);
}
console.timeEnd('Native Object.create');

console.time('Custom objectCreate');
for (let i = 0; i < iterations; i++) {
  objectCreate(proto);
}
console.timeEnd('Custom objectCreate');

module.exports = {
  objectCreate,
  objectCreateAdvanced,
  objectCreateProto,
  objectCreateModern
};