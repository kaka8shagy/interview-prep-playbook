/**
 * File: interview-curry.js
 * Description: Implement curry function - common interview question
 * Tests understanding of nested closures and function composition
 */

// Basic curry implementation
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// Curry with placeholder support
function curryAdvanced(fn) {
  const _ = curryAdvanced.placeholder;
  
  return function curried(...args) {
    // Check if we have enough non-placeholder arguments
    const validArgs = args.filter(arg => arg !== _);
    
    if (validArgs.length >= fn.length) {
      return fn.apply(this, args);
    }
    
    return function(...nextArgs) {
      // Fill placeholders with new arguments
      const mergedArgs = args.slice();
      let nextIndex = 0;
      
      for (let i = 0; i < mergedArgs.length && nextIndex < nextArgs.length; i++) {
        if (mergedArgs[i] === _) {
          mergedArgs[i] = nextArgs[nextIndex++];
        }
      }
      
      // Append remaining arguments
      while (nextIndex < nextArgs.length) {
        mergedArgs.push(nextArgs[nextIndex++]);
      }
      
      return curried.apply(this, mergedArgs);
    };
  };
}
curryAdvanced.placeholder = Symbol('placeholder');

// Auto-curry: automatically curries all functions
function autoCurry(fn) {
  const arity = fn.length;
  
  return function curried() {
    const args = Array.prototype.slice.call(arguments);
    
    if (args.length >= arity) {
      return fn.apply(this, args.slice(0, arity));
    }
    
    return function() {
      const nextArgs = Array.prototype.slice.call(arguments);
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// Uncurry: reverse of curry
function uncurry(fn) {
  return function(...args) {
    let result = fn;
    for (let i = 0; i < args.length; i++) {
      result = result(args[i]);
      if (typeof result !== 'function') {
        return result;
      }
    }
    return result;
  };
}

// Partial application (different from curry)
function partial(fn, ...partialArgs) {
  return function(...remainingArgs) {
    return fn.apply(this, partialArgs.concat(remainingArgs));
  };
}

// Example functions to curry
function add(a, b, c) {
  return a + b + c;
}

function multiply(a, b, c, d) {
  return a * b * c * d;
}

function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

// Practical examples
function discount(percentage, price) {
  return price * (1 - percentage / 100);
}

function createApiUrl(protocol, domain, path) {
  return `${protocol}://${domain}/${path}`;
}

// Tests
console.log('Basic curry:');
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6

console.log('\nCurry with placeholder:');
const _ = curryAdvanced.placeholder;
const curriedMultiply = curryAdvanced(multiply);
console.log(curriedMultiply(2)(3)(4)(5)); // 120
console.log(curriedMultiply(_, 3)(2, 4)(5)); // 120
console.log(curriedMultiply(2, _, 4)(3, 5)); // 120

console.log('\nPractical curry examples:');
const curriedGreet = curry(greet);
const greetHello = curriedGreet('Hello');
const greetHelloJohn = greetHello('John');
console.log(greetHelloJohn('!')); // Hello, John!
console.log(greetHello('Jane')('?')); // Hello, Jane?

console.log('\nDiscount calculator:');
const curriedDiscount = curry(discount);
const tenPercentOff = curriedDiscount(10);
const twentyPercentOff = curriedDiscount(20);
console.log('10% off $100:', tenPercentOff(100)); // 90
console.log('20% off $100:', twentyPercentOff(100)); // 80

console.log('\nAPI URL builder:');
const curriedApiUrl = curry(createApiUrl);
const httpsUrl = curriedApiUrl('https');
const httpsGithub = httpsUrl('api.github.com');
console.log(httpsGithub('users/nodejs')); // https://api.github.com/users/nodejs
console.log(httpsGithub('repos/nodejs/node')); // https://api.github.com/repos/nodejs/node

// Advanced composition with curry
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const composed = compose(square, double, addOne);
console.log('\nComposed functions (addOne, double, square):');
console.log(composed(3)); // ((3 + 1) * 2)² = 64

module.exports = {
  curry,
  curryAdvanced,
  autoCurry,
  uncurry,
  partial
};