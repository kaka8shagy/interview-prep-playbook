/**
 * File: class-syntax.js
 * Description: ES6 class syntax and features
 * Demonstrates modern class patterns and inheritance
 */

console.log('=== Basic Class Syntax ===');

// Basic class definition
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
    this.id = Math.random().toString(36).substr(2, 9);
  }
  
  // Instance method
  introduce() {
    return `Hi, I'm ${this.name} and I'm ${this.age} years old.`;
  }
  
  // Getter
  get info() {
    return {
      name: this.name,
      age: this.age,
      id: this.id,
      canVote: this.age >= 18
    };
  }
  
  // Setter
  set name(newName) {
    if (typeof newName === 'string' && newName.trim()) {
      this._name = newName.trim();
    }
  }
  
  get name() {
    return this._name;
  }
  
  // Method with validation
  celebrateBirthday() {
    this.age++;
    console.log(`Happy birthday ${this.name}! Now ${this.age} years old.`);
    return this.age;
  }
}

const person1 = new Person('Alice', 25);
console.log(person1.introduce());
console.log('Person info:', person1.info);
person1.celebrateBirthday();

console.log('\n=== Static Methods and Properties ===');

class MathUtils {
  static PI = 3.14159;
  
  static add(a, b) {
    return a + b;
  }
  
  static multiply(a, b) {
    return a * b;
  }
  
  static calculateCircleArea(radius) {
    return MathUtils.PI * radius * radius;
  }
  
  // Static getter
  static get version() {
    return '1.0.0';
  }
  
  // Instance method for comparison
  instanceMethod() {
    return 'This is an instance method';
  }
}

console.log('Static PI:', MathUtils.PI);
console.log('Add 5 + 3:', MathUtils.add(5, 3));
console.log('Circle area (r=5):', MathUtils.calculateCircleArea(5));
console.log('Version:', MathUtils.version);

// Note: Static methods cannot be called on instances
const mathInstance = new MathUtils();
console.log('Instance method:', mathInstance.instanceMethod());
// console.log(mathInstance.add(1, 2)); // Error: not a function

console.log('\n=== Class Inheritance ===');

// Base class
class Animal {
  constructor(species, name) {
    this.species = species;
    this.name = name;
    this.energy = 100;
  }
  
  eat(amount = 10) {
    this.energy = Math.min(this.energy + amount, 100);
    console.log(`${this.name} ate and gained energy. Energy: ${this.energy}`);
    return this.energy;
  }
  
  sleep() {
    this.energy = 100;
    console.log(`${this.name} had a good sleep. Energy restored!`);
    return this.energy;
  }
  
  move(distance = 1) {
    const energyLoss = distance * 5;
    this.energy = Math.max(this.energy - energyLoss, 0);
    console.log(`${this.name} moved ${distance} units. Energy: ${this.energy}`);
    return this.energy;
  }
  
  getStatus() {
    return {
      name: this.name,
      species: this.species,
      energy: this.energy,
      status: this.energy > 50 ? 'energetic' : 'tired'
    };
  }
}

// Derived class
class Dog extends Animal {
  constructor(name, breed) {
    super('Dog', name); // Call parent constructor
    this.breed = breed;
    this.tricks = [];
  }
  
  bark() {
    console.log(`${this.name}: Woof! Woof!`);
    return this.move(0.1); // Barking uses minimal energy
  }
  
  learnTrick(trick) {
    if (!this.tricks.includes(trick)) {
      this.tricks.push(trick);
      console.log(`${this.name} learned: ${trick}`);
    }
    return this.tricks;
  }
  
  performTrick(trick) {
    if (this.tricks.includes(trick)) {
      console.log(`${this.name} performs: ${trick}`);
      return this.move(0.5);
    } else {
      console.log(`${this.name} doesn't know how to ${trick}`);
      return false;
    }
  }
  
  // Override parent method
  getStatus() {
    const baseStatus = super.getStatus();
    return {
      ...baseStatus,
      breed: this.breed,
      tricks: this.tricks.slice(),
      tricksCount: this.tricks.length
    };
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
console.log('Dog status:', dog.getStatus());

dog.bark();
dog.learnTrick('sit');
dog.learnTrick('fetch');
dog.performTrick('sit');
dog.eat(20);

console.log('Updated status:', dog.getStatus());

console.log('\n=== Private Fields and Methods ===');

class BankAccount {
  // Private fields (ES2022)
  #balance = 0;
  #accountNumber;
  #transactions = [];
  
  constructor(initialDeposit = 0) {
    this.#accountNumber = this.#generateAccountNumber();
    if (initialDeposit > 0) {
      this.#balance = initialDeposit;
      this.#addTransaction('initial_deposit', initialDeposit);
    }
  }
  
  // Private method
  #generateAccountNumber() {
    return 'ACC' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  
  #addTransaction(type, amount) {
    this.#transactions.push({
      type,
      amount,
      balance: this.#balance,
      timestamp: new Date().toISOString()
    });
  }
  
  // Public methods
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    
    this.#balance += amount;
    this.#addTransaction('deposit', amount);
    console.log(`Deposited $${amount}. New balance: $${this.#balance}`);
    return this.#balance;
  }
  
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    
    this.#balance -= amount;
    this.#addTransaction('withdrawal', amount);
    console.log(`Withdrew $${amount}. New balance: $${this.#balance}`);
    return this.#balance;
  }
  
  getBalance() {
    return this.#balance;
  }
  
  getAccountNumber() {
    return this.#accountNumber;
  }
  
  getTransactionHistory(limit = 10) {
    return this.#transactions.slice(-limit);
  }
  
  getAccountSummary() {
    return {
      accountNumber: this.#accountNumber,
      balance: this.#balance,
      transactionCount: this.#transactions.length,
      lastTransaction: this.#transactions[this.#transactions.length - 1]
    };
  }
}

const account = new BankAccount(1000);
console.log('Account number:', account.getAccountNumber());
console.log('Initial balance:', account.getBalance());

account.deposit(500);
account.withdraw(200);
console.log('Account summary:', account.getAccountSummary());

// Private fields are truly private
// console.log(account.#balance); // SyntaxError: Private field '#balance' must be declared in an enclosing class

console.log('\n=== Abstract-like Classes ===');

// While JavaScript doesn't have true abstract classes, we can simulate them
class Shape {
  constructor(name) {
    if (this.constructor === Shape) {
      throw new Error('Shape is an abstract class and cannot be instantiated');
    }
    this.name = name;
  }
  
  // "Abstract" method - must be implemented by subclasses
  calculateArea() {
    throw new Error('calculateArea must be implemented by subclass');
  }
  
  calculatePerimeter() {
    throw new Error('calculatePerimeter must be implemented by subclass');
  }
  
  // Concrete method
  describe() {
    return `This is a ${this.name} with area ${this.calculateArea()} and perimeter ${this.calculatePerimeter()}`;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('Rectangle');
    this.width = width;
    this.height = height;
  }
  
  calculateArea() {
    return this.width * this.height;
  }
  
  calculatePerimeter() {
    return 2 * (this.width + this.height);
  }
}

class Circle extends Shape {
  constructor(radius) {
    super('Circle');
    this.radius = radius;
  }
  
  calculateArea() {
    return Math.PI * this.radius * this.radius;
  }
  
  calculatePerimeter() {
    return 2 * Math.PI * this.radius;
  }
}

const rectangle = new Rectangle(5, 3);
const circle = new Circle(4);

console.log(rectangle.describe());
console.log(circle.describe());

// This would throw an error:
// const shape = new Shape('Generic'); // Error: Shape is an abstract class

console.log('\n=== Method Chaining ===');

class FluentCalculator {
  constructor(value = 0) {
    this.value = value;
  }
  
  add(num) {
    this.value += num;
    return this; // Return this for chaining
  }
  
  subtract(num) {
    this.value -= num;
    return this;
  }
  
  multiply(num) {
    this.value *= num;
    return this;
  }
  
  divide(num) {
    if (num === 0) {
      throw new Error('Division by zero');
    }
    this.value /= num;
    return this;
  }
  
  power(exp) {
    this.value = Math.pow(this.value, exp);
    return this;
  }
  
  result() {
    return this.value;
  }
  
  reset() {
    this.value = 0;
    return this;
  }
}

const calc = new FluentCalculator(10);
const result = calc
  .add(5)        // 15
  .multiply(2)   // 30
  .subtract(10)  // 20
  .divide(4)     // 5
  .power(2)      // 25
  .result();

console.log('Fluent calculation result:', result); // 25

console.log('\n=== Interview Questions ===');

// Q1: Implement a singleton class
class Singleton {
  static instance = null;
  
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    
    this.id = Math.random().toString(36).substr(2, 9);
    this.createdAt = new Date();
    
    Singleton.instance = this;
  }
  
  getData() {
    return {
      id: this.id,
      createdAt: this.createdAt
    };
  }
}

const singleton1 = new Singleton();
const singleton2 = new Singleton();
console.log('Same instance?', singleton1 === singleton2); // true
console.log('Singleton data:', singleton1.getData());

// Q2: Implement a factory pattern with classes
class VehicleFactory {
  static createVehicle(type, ...args) {
    switch (type.toLowerCase()) {
      case 'car':
        return new Car(...args);
      case 'bike':
        return new Bike(...args);
      case 'truck':
        return new Truck(...args);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

class Vehicle {
  constructor(make, model) {
    this.make = make;
    this.model = model;
  }
  
  start() {
    console.log(`${this.make} ${this.model} is starting...`);
  }
}

class Car extends Vehicle {
  constructor(make, model, doors = 4) {
    super(make, model);
    this.doors = doors;
    this.type = 'Car';
  }
}

class Bike extends Vehicle {
  constructor(make, model, type = 'mountain') {
    super(make, model);
    this.bikeType = type;
    this.type = 'Bike';
  }
}

class Truck extends Vehicle {
  constructor(make, model, payload) {
    super(make, model);
    this.payload = payload;
    this.type = 'Truck';
  }
}

const car = VehicleFactory.createVehicle('car', 'Toyota', 'Camry', 4);
const bike = VehicleFactory.createVehicle('bike', 'Trek', 'Domane', 'road');

console.log('Created car:', car);
console.log('Created bike:', bike);

module.exports = {
  Person,
  MathUtils,
  Animal,
  Dog,
  BankAccount,
  Shape,
  Rectangle,
  Circle,
  FluentCalculator,
  Singleton,
  VehicleFactory,
  Vehicle,
  Car,
  Bike,
  Truck
};