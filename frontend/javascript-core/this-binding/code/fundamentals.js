/**
 * File: fundamentals.js
 * Description: Core concepts of 'this' binding in JavaScript with comprehensive examples
 * Time Complexity: O(1) for binding operations
 * Space Complexity: O(1) for context storage
 */

// Understanding 'this' - The Most Misunderstood Concept in JavaScript
// 'this' is determined by HOW a function is called, not WHERE it's defined

console.log('=== This Binding Fundamentals ===\n');

// Rule 1: Default Binding (Standalone Function Invocation)
// When no other binding rule applies, 'this' defaults to global object (or undefined in strict mode)

function demonstrateDefaultBinding() {
  console.log('1. Default Binding:');
  
  // Non-strict mode - 'this' refers to global object
  function nonStrictFunction() {
    console.log('  Non-strict this:', this === globalThis ? 'global object' : this);
    console.log('  Type of this:', typeof this);
  }
  
  // Strict mode - 'this' is undefined
  function strictFunction() {
    'use strict';
    console.log('  Strict this:', this);
    console.log('  Is undefined?', this === undefined);
  }
  
  // Demonstrate both modes
  nonStrictFunction(); // Called without any context
  strictFunction();    // Called without any context
  
  // Common gotcha: Method extracted from object loses context
  const obj = {
    name: 'MyObject',
    getName: function() {
      return this.name;
    }
  };
  
  // Direct method call - 'this' is obj
  console.log('  Direct method call:', obj.getName());
  
  // Extracted method - loses context, uses default binding
  const extractedMethod = obj.getName;
  try {
    console.log('  Extracted method:', extractedMethod()); // undefined or error
  } catch (error) {
    console.log('  Extracted method error:', error.message);
  }
}

// Rule 2: Implicit Binding (Object Method Invocation)
// When function is called as a method of an object, 'this' is the object

function demonstrateImplicitBinding() {
  console.log('\n2. Implicit Binding:');
  
  const user = {
    name: 'Alice',
    age: 30,
    
    // Method using 'this'
    introduce: function() {
      console.log(`  Hi, I'm ${this.name}, age ${this.age}`);
    },
    
    // Nested object - 'this' refers to immediate parent
    profile: {
      bio: 'Software Engineer',
      showBio: function() {
        console.log(`  Bio: ${this.bio}`);
        // 'this' is profile object, not user object
        console.log(`  Name from this context:`, this.name); // undefined
      }
    },
    
    // Method that calls another method
    fullIntro: function() {
      this.introduce(); // 'this' is still user object
      console.log('  Full introduction complete');
    }
  };
  
  // Implicit binding - 'this' is the calling object
  user.introduce();           // 'this' is user
  user.profile.showBio();     // 'this' is profile
  user.fullIntro();          // 'this' is user
  
  // Chain of objects - 'this' is the immediate caller
  const company = {
    name: 'TechCorp',
    employee: user
  };
  
  company.employee.introduce(); // 'this' is still user, not company
  
  // Losing implicit binding through assignment
  console.log('  Losing implicit binding:');
  const standalone = user.introduce;
  try {
    standalone(); // Default binding - 'this' is not user
  } catch (error) {
    console.log('  Error:', error.message);
  }
}

// Rule 3: Explicit Binding (call, apply, bind)
// Explicitly set 'this' using call(), apply(), or bind()

function demonstrateExplicitBinding() {
  console.log('\n3. Explicit Binding:');
  
  function greet(greeting, punctuation) {
    console.log(`  ${greeting}, ${this.name}${punctuation}`);
  }
  
  const person1 = { name: 'Bob' };
  const person2 = { name: 'Carol' };
  
  // call() - pass arguments individually
  console.log('  Using call():');
  greet.call(person1, 'Hello', '!');        // 'this' is person1
  greet.call(person2, 'Greetings', '.');    // 'this' is person2
  
  // apply() - pass arguments as array
  console.log('  Using apply():');
  greet.apply(person1, ['Hi', '?']);        // 'this' is person1
  greet.apply(person2, ['Welcome', '!!']);  // 'this' is person2
  
  // bind() - creates new function with fixed 'this'
  console.log('  Using bind():');
  const greetBob = greet.bind(person1);     // Create bound function
  greetBob('Hey', '~');                     // 'this' is always person1
  
  // Bind with partial application
  const greetBobHello = greet.bind(person1, 'Hello');
  greetBobHello('!!!');                     // Only need punctuation
  
  // Hard binding prevents re-binding
  const hardBound = greetBob.bind(person2); // Try to rebind to person2
  hardBound('Test', '?');                    // Still bound to person1
}

// Rule 4: new Binding (Constructor Invocation)
// When function is called with 'new', 'this' is the newly created object

function demonstrateNewBinding() {
  console.log('\n4. New Binding:');
  
  // Constructor function
  function Person(name, age) {
    // 'this' refers to the newly created object
    this.name = name;
    this.age = age;
    
    console.log('  Inside constructor, this is:', this.constructor.name);
    
    // Methods can be added to the instance
    this.introduce = function() {
      console.log(`  I'm ${this.name}, ${this.age} years old`);
    };
  }
  
  // Using 'new' creates new object and binds it to 'this'
  const alice = new Person('Alice', 25);
  alice.introduce();
  
  const bob = new Person('Bob', 30);
  bob.introduce();
  
  // What happens without 'new'? (Bad practice)
  console.log('  Without new keyword:');
  try {
    const charlie = Person('Charlie', 35); // No 'new'
    console.log('  charlie is:', charlie);  // undefined
    // Properties went to global object (in non-strict mode)
  } catch (error) {
    console.log('  Error:', error.message);
  }
  
  // Constructor with return value
  function SpecialPerson(name) {
    this.name = name;
    
    // Returning primitive - ignored, returns 'this'
    return 42;
  }
  
  function ObjectReturner(name) {
    this.name = name;
    
    // Returning object - overrides 'this'
    return { customProperty: 'I override this' };
  }
  
  const special = new SpecialPerson('Special');
  console.log('  Constructor returning primitive:', special.name); // 'Special'
  
  const override = new ObjectReturner('Override');
  console.log('  Constructor returning object:', override.customProperty); // 'I override this'
  console.log('  Original name property:', override.name); // undefined
}

// Binding Priority - Which rule wins when multiple apply?
// Priority: new binding > explicit binding > implicit binding > default binding

function demonstrateBindingPriority() {
  console.log('\n5. Binding Priority:');
  
  function identify() {
    return this.name || 'unknown';
  }
  
  const obj1 = { name: 'obj1', identify: identify };
  const obj2 = { name: 'obj2' };
  
  // Test 1: Implicit vs Explicit
  console.log('  Implicit binding:', obj1.identify());              // 'obj1'
  console.log('  Explicit overrides implicit:', obj1.identify.call(obj2)); // 'obj2'
  
  // Test 2: Explicit vs Hard Binding
  const bound = identify.bind(obj1);
  console.log('  Hard binding:', bound.call(obj2));                // Still 'obj1'
  
  // Test 3: New vs Explicit
  function Person(name) {
    this.name = name;
  }
  
  const boundPerson = Person.bind(obj1);
  const newInstance = new boundPerson('New Instance');             // 'new' wins
  console.log('  New vs bound:', newInstance.name);                // 'New Instance'
  
  // Test 4: New vs Hard Binding (new wins)
  function Foo(name) {
    this.name = name;
  }
  
  const bar = Foo.bind(obj2);
  const instance = new bar('Instance');                            // 'new' wins
  console.log('  New vs hard binding:', instance.name);            // 'Instance'
}

// Common Pitfalls and Gotchas

function demonstrateCommonPitfalls() {
  console.log('\n6. Common Pitfalls:');
  
  // Pitfall 1: Nested functions lose context
  const team = {
    name: 'Development Team',
    members: ['Alice', 'Bob', 'Charlie'],
    
    printMembers: function() {
      console.log(`  ${this.name} members:`);
      
      // Problem: forEach callback loses 'this' context
      this.members.forEach(function(member) {
        // 'this' is undefined (strict) or global (non-strict)
        try {
          console.log(`    ${this.name}: ${member}`);
        } catch (error) {
          console.log(`    Error accessing this.name: ${member}`);
        }
      });
    },
    
    // Solution 1: Arrow functions preserve 'this'
    printMembersFixed1: function() {
      console.log(`  ${this.name} members (arrow function):`);
      this.members.forEach(member => {
        console.log(`    ${this.name}: ${member}`); // 'this' preserved
      });
    },
    
    // Solution 2: Capture 'this' in variable
    printMembersFixed2: function() {
      console.log(`  ${this.name} members (captured this):`);
      const self = this; // Capture context
      this.members.forEach(function(member) {
        console.log(`    ${self.name}: ${member}`);
      });
    },
    
    // Solution 3: Use bind()
    printMembersFixed3: function() {
      console.log(`  ${this.name} members (bound callback):`);
      this.members.forEach(function(member) {
        console.log(`    ${this.name}: ${member}`);
      }.bind(this)); // Bind callback to current 'this'
    }
  };
  
  console.log('  Pitfall: Nested function context loss');
  team.printMembers();
  
  console.log('\n  Solutions:');
  team.printMembersFixed1();
  team.printMembersFixed2();
  team.printMembersFixed3();
  
  // Pitfall 2: Event handlers lose context
  console.log('\n  Event Handler Context Loss:');
  const button = {
    label: 'Click Me',
    
    // Problem: Event handler loses 'this'
    handleClick: function() {
      console.log(`    Button "${this.label}" was clicked`);
    },
    
    // Solution: Arrow function or bind
    handleClickFixed: function() {
      console.log(`    Button "${this.label}" was clicked (fixed)`);
    },
    
    setupEventListeners: function() {
      // Simulate event binding
      console.log('  Setting up event listeners...');
      
      // Problem version - 'this' would be the DOM element
      setTimeout(() => {
        console.log('  Simulated click (wrong this):');
        this.handleClick.call({}); // Simulate wrong context
      }, 100);
      
      // Fixed version
      setTimeout(() => {
        console.log('  Simulated click (correct this):');
        this.handleClickFixed(); // Correct context preserved
      }, 200);
    }
  };
  
  button.setupEventListeners();
}

// Arrow Functions and 'this' - Special Case
// Arrow functions don't have their own 'this' - they inherit from enclosing scope

function demonstrateArrowFunctions() {
  console.log('\n7. Arrow Functions and This:');
  
  const obj = {
    name: 'ArrowTest',
    
    // Regular function - has its own 'this'
    regularMethod: function() {
      console.log('  Regular method this:', this.name);
      
      // Nested regular function - loses 'this'
      function nested() {
        console.log('  Nested regular function this:', this?.name || 'lost');
      }
      nested();
      
      // Arrow function - inherits 'this' from enclosing scope
      const arrowNested = () => {
        console.log('  Nested arrow function this:', this.name);
      };
      arrowNested();
    },
    
    // Arrow function as method - inherits 'this' from enclosing scope (not obj)
    arrowMethod: () => {
      console.log('  Arrow method this:', this?.name || 'not obj');
    }
  };
  
  obj.regularMethod();
  obj.arrowMethod();
  
  // Arrow functions cannot be bound
  const arrowFunc = () => {
    console.log('  Arrow function this:', this?.constructor?.name || 'global/undefined');
  };
  
  const boundArrow = arrowFunc.bind({ name: 'Bound' });
  console.log('  Arrow function ignores binding:');
  boundArrow(); // Still uses original 'this'
}

// Comprehensive Demo Function
function runThisFundamentalsDemo() {
  demonstrateDefaultBinding();
  demonstrateImplicitBinding();
  demonstrateExplicitBinding();
  demonstrateNewBinding();
  demonstrateBindingPriority();
  demonstrateCommonPitfalls();
  
  setTimeout(() => {
    demonstrateArrowFunctions();
  }, 1000);
}

// Export for testing and other modules
module.exports = {
  demonstrateDefaultBinding,
  demonstrateImplicitBinding,
  demonstrateExplicitBinding,
  demonstrateNewBinding,
  demonstrateBindingPriority,
  demonstrateCommonPitfalls,
  demonstrateArrowFunctions,
  runThisFundamentalsDemo
};