/**
 * File: loop-variable-fix.js
 * Description: Classic loop closure problem and solutions
 */

// PROBLEM: All callbacks log the same value
function brokenLoop() {
  for (var i = 0; i < 5; i++) {
    setTimeout(function() {
      console.log('Broken:', i); // Always logs 5
    }, i * 100);
  }
}

// SOLUTION 1: Use let (block scoping)
function fixedWithLet() {
  for (let i = 0; i < 5; i++) {
    setTimeout(function() {
      console.log('Fixed with let:', i); // Logs 0,1,2,3,4
    }, i * 100);
  }
}

// SOLUTION 2: IIFE (Immediately Invoked Function Expression)
function fixedWithIIFE() {
  for (var i = 0; i < 5; i++) {
    (function(index) {
      setTimeout(function() {
        console.log('Fixed with IIFE:', index); // Logs 0,1,2,3,4
      }, index * 100);
    })(i);
  }
}

// SOLUTION 3: Function factory
function fixedWithFactory() {
  function createCallback(index) {
    return function() {
      console.log('Fixed with factory:', index);
    };
  }
  
  for (var i = 0; i < 5; i++) {
    setTimeout(createCallback(i), i * 100);
  }
}

// SOLUTION 4: forEach (for arrays)
function fixedWithForEach() {
  [0, 1, 2, 3, 4].forEach(function(i) {
    setTimeout(function() {
      console.log('Fixed with forEach:', i);
    }, i * 100);
  });
}

// Real-world example: Event listeners
function attachEventListeners() {
  const buttons = document.querySelectorAll('.button');
  
  // Problem: using var
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
      console.log('Button clicked:', i); // Always logs buttons.length
    });
  }
  
  // Solution: using let
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
      console.log('Button clicked:', i); // Logs correct index
    });
  }
  
  // Better solution: use forEach
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => {
      console.log('Button clicked:', i);
    });
  });
}

// Run examples
console.log('Running broken example:');
brokenLoop();

setTimeout(() => {
  console.log('\nRunning fixed examples:');
  fixedWithLet();
  setTimeout(() => fixedWithIIFE(), 1000);
  setTimeout(() => fixedWithFactory(), 2000);
  setTimeout(() => fixedWithForEach(), 3000);
}, 1000);

module.exports = { 
  brokenLoop, 
  fixedWithLet, 
  fixedWithIIFE, 
  fixedWithFactory, 
  fixedWithForEach 
};