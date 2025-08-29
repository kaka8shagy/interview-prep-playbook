/**
 * File: interview-problems.js
 * Description: Common interview questions and problems about type coercion
 * Time Complexity: O(1) for most coercion operations
 * Space Complexity: O(1) for most problems
 */

// === Classic Interview Questions ===
console.log('=== Classic Interview Questions ===');

// Question 1: Output Prediction
function question1_OutputPrediction() {
  console.log('Question 1: What will these expressions output?');
  
  const expressions = [
    '1 + "2" + 3',        // "123"
    '1 + 2 + "3"',        // "33"  
    '"1" + 2 + 3',        // "123"
    '"1" - 2 + 3',        // 2
    'true + true',        // 2
    'true + "true"',      // "truetrue"
    '[] + {}',            // "[object Object]"
    '{} + []',            // 0 (context dependent)
    '[] + []',            // ""
    '[] == ![]',          // true
    'null == undefined',  // true
    'null == 0',          // false
    '"" == 0',            // true
    '"0" == false',       // true
    'false == "false"'    // false
  ];
  
  expressions.forEach(expr => {
    try {
      const result = eval(expr);
      console.log(`${expr.padEnd(20)} = ${JSON.stringify(result)}`);
    } catch (e) {
      console.log(`${expr.padEnd(20)} = Error: ${e.message}`);
    }
  });
}

// Question 2: Fix the Bug
function question2_FixTheBug() {
  console.log('\nQuestion 2: Find and fix the bugs in this code:');
  
  // Buggy code
  function buggyCalculator(a, b, operation) {
    // Bug 1: No type checking
    if (a + b) {  // This will always be truthy for strings!
      switch (operation) {
        case 'add':
          return a + b;  // Bug 2: String concatenation instead of addition
        case 'subtract':
          return a - b;  // This works due to coercion
        case 'multiply':
          return a * b;  // This works due to coercion
        case 'divide':
          return a / b;  // Bug 3: No division by zero check
      }
    }
    return 'Invalid input';
  }
  
  console.log('Buggy results:');
  console.log('buggyCalculator("5", "3", "add"):', buggyCalculator("5", "3", "add"));
  console.log('buggyCalculator("10", "0", "divide"):', buggyCalculator("10", "0", "divide"));
  
  // Fixed version
  function fixedCalculator(a, b, operation) {
    // Fix: Proper type conversion and validation
    const numA = Number(a);
    const numB = Number(b);
    
    if (isNaN(numA) || isNaN(numB)) {
      throw new Error('Invalid numbers provided');
    }
    
    switch (operation) {
      case 'add':
        return numA + numB;
      case 'subtract':
        return numA - numB;
      case 'multiply':
        return numA * numB;
      case 'divide':
        if (numB === 0) {
          throw new Error('Cannot divide by zero');
        }
        return numA / numB;
      default:
        throw new Error('Unknown operation');
    }
  }
  
  console.log('\nFixed results:');
  console.log('fixedCalculator("5", "3", "add"):', fixedCalculator("5", "3", "add"));
  console.log('fixedCalculator("10", "2", "divide"):', fixedCalculator("10", "2", "divide"));
}

// Question 3: Implement Custom Equality
function question3_CustomEquality() {
  console.log('\nQuestion 3: Implement a function that mimics == behavior:');
  
  function customEquals(a, b) {
    // Handle same type
    if (typeof a === typeof b) {
      return a === b;
    }
    
    // Handle null and undefined
    if ((a === null && b === undefined) || (a === undefined && b === null)) {
      return true;
    }
    
    // Handle number and string
    if (typeof a === 'number' && typeof b === 'string') {
      return a === Number(b);
    }
    if (typeof a === 'string' && typeof b === 'number') {
      return Number(a) === b;
    }
    
    // Handle boolean conversion
    if (typeof a === 'boolean') {
      return customEquals(Number(a), b);
    }
    if (typeof b === 'boolean') {
      return customEquals(a, Number(b));
    }
    
    // Handle object to primitive conversion
    if (typeof a === 'object' && a !== null && (typeof b === 'string' || typeof b === 'number')) {
      const primitive = (a.valueOf !== Object.prototype.valueOf) ? a.valueOf() : a.toString();
      return customEquals(primitive, b);
    }
    if (typeof b === 'object' && b !== null && (typeof a === 'string' || typeof a === 'number')) {
      const primitive = (b.valueOf !== Object.prototype.valueOf) ? b.valueOf() : b.toString();
      return customEquals(a, primitive);
    }
    
    return false;
  }
  
  // Test cases
  const testCases = [
    [1, '1'],
    [true, 1],
    [false, 0],
    [null, undefined],
    [[], false],
    [[1], 1],
    [{valueOf: () => 42}, 42],
    ['', 0],
    [NaN, NaN]
  ];
  
  testCases.forEach(([a, b]) => {
    const jsResult = a == b;
    const customResult = customEquals(a, b);
    const match = jsResult === customResult;
    console.log(`${JSON.stringify(a)} == ${JSON.stringify(b)}: JS=${jsResult}, Custom=${customResult} ${match ? '✓' : '✗'}`);
  });
}

// Question 4: Truthy/Falsy Challenge
function question4_TruthyFalsy() {
  console.log('\nQuestion 4: Identify which values are truthy or falsy:');
  
  const challengeValues = [
    0, -0, +0,
    '', ' ',
    'false', 'true',
    [], [0], [[]],
    {}, {a: 1},
    null, undefined,
    NaN, Infinity, -Infinity,
    function() {}, () => {},
    new Boolean(false), new Boolean(true),
    new Number(0), new String(''),
    Symbol(''), Symbol.for(''),
    0n, 1n
  ];
  
  console.log('Value'.padEnd(20) + 'Boolean()'.padEnd(12) + '!!value'.padEnd(10) + 'Truthy?');
  console.log('-'.repeat(50));
  
  challengeValues.forEach(value => {
    const booleanResult = Boolean(value);
    const doubleNotResult = !!value;
    const display = typeof value === 'string' ? `"${value}"` : 
                   typeof value === 'function' ? '[Function]' : 
                   String(value);
    
    console.log(`${display.padEnd(20)}${String(booleanResult).padEnd(12)}${String(doubleNotResult).padEnd(10)}${booleanResult ? 'Yes' : 'No'}`);
  });
}

// Question 5: Advanced Coercion Puzzle
function question5_AdvancedPuzzle() {
  console.log('\nQuestion 5: Solve this advanced coercion puzzle:');
  console.log('Create an object that equals both 1 and "1" but not true:');
  
  // Solution
  const puzzleObject = {
    valueOf() {
      return 1;
    },
    toString() {
      return '1';
    }
  };
  
  console.log('puzzleObject == 1:', puzzleObject == 1);      // true
  console.log('puzzleObject == "1":', puzzleObject == '1');  // true
  console.log('puzzleObject == true:', puzzleObject == true); // true (1 == true)
  
  // Better solution that avoids true
  const betterPuzzleObject = {
    valueOf() {
      return 1;
    },
    toString() {
      return '1';
    },
    // Override to prevent true equality
    [Symbol.toPrimitive](hint) {
      if (hint === 'number') return 1;
      if (hint === 'string') return '1';
      // For default hint in == comparison
      return 1;
    }
  };
  
  console.log('\nBetter solution:');
  console.log('betterPuzzleObject == 1:', betterPuzzleObject == 1);
  console.log('betterPuzzleObject == "1":', betterPuzzleObject == '1');
  console.log('betterPuzzleObject == true:', betterPuzzleObject == true);
}

// Question 6: Array Coercion Mastery
function question6_ArrayCoercion() {
  console.log('\nQuestion 6: Master array coercion patterns:');
  
  const arrays = [
    [],
    [1],
    [1, 2],
    [1, 2, 3],
    [[1]],
    [[]],
    [null],
    [undefined],
    [''],
    ['0'],
    [false]
  ];
  
  console.log('Array'.padEnd(15) + 'String()'.padEnd(15) + 'Number()'.padEnd(10) + 'Boolean()');
  console.log('-'.repeat(55));
  
  arrays.forEach(arr => {
    const str = String(arr);
    const num = Number(arr);
    const bool = Boolean(arr);
    
    console.log(`${JSON.stringify(arr).padEnd(15)}${str.padEnd(15)}${String(num).padEnd(10)}${bool}`);
  });
}

// Question 7: Implement Type Checker
function question7_TypeChecker() {
  console.log('\nQuestion 7: Implement a robust type checker:');
  
  function getType(value) {
    // Handle null specially (typeof null === 'object')
    if (value === null) return 'null';
    
    // Handle arrays specifically
    if (Array.isArray(value)) return 'array';
    
    // Handle dates
    if (value instanceof Date) return 'date';
    
    // Handle regular expressions
    if (value instanceof RegExp) return 'regexp';
    
    // Handle primitive wrapper objects
    if (value instanceof Boolean) return 'boolean-object';
    if (value instanceof Number) return 'number-object';
    if (value instanceof String) return 'string-object';
    
    // Use typeof for everything else
    return typeof value;
  }
  
  function isType(value, expectedType) {
    const actualType = getType(value);
    
    // Handle special cases
    if (expectedType === 'integer') {
      return actualType === 'number' && Number.isInteger(value);
    }
    
    if (expectedType === 'numeric') {
      return actualType === 'number' && !isNaN(value);
    }
    
    if (expectedType === 'empty') {
      return value === null || value === undefined || value === '' || 
             (Array.isArray(value) && value.length === 0) ||
             (typeof value === 'object' && Object.keys(value).length === 0);
    }
    
    return actualType === expectedType;
  }
  
  // Test the type checker
  const typeTests = [
    [42, 'number'],
    [42, 'integer'],
    [42.5, 'integer'],
    [NaN, 'numeric'],
    [null, 'null'],
    [[], 'array'],
    [[], 'empty'],
    [{}, 'empty'],
    [new Date(), 'date'],
    [/test/, 'regexp'],
    [new String('test'), 'string-object']
  ];
  
  typeTests.forEach(([value, type]) => {
    const result = isType(value, type);
    console.log(`isType(${JSON.stringify(value)}, "${type}"):`, result);
  });
}

// Question 8: Coercion Performance Challenge
function question8_PerformanceChallenge() {
  console.log('\nQuestion 8: Which conversion method is fastest?');
  
  function benchmarkConversions() {
    const testString = '12345';
    const iterations = 1000000;
    
    const methods = {
      'Number()': () => Number(testString),
      'parseInt()': () => parseInt(testString, 10),
      'parseFloat()': () => parseFloat(testString),
      'Unary +': () => +testString,
      'Math.floor()': () => Math.floor(testString),
      '* 1': () => testString * 1,
      '- 0': () => testString - 0
    };
    
    const results = {};
    
    Object.entries(methods).forEach(([name, method]) => {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        method();
      }
      const end = performance.now();
      results[name] = end - start;
    });
    
    // Sort by performance
    const sorted = Object.entries(results).sort(([,a], [,b]) => a - b);
    
    console.log('Performance results (lower is better):');
    sorted.forEach(([method, time], index) => {
      console.log(`${index + 1}. ${method}: ${time.toFixed(2)}ms`);
    });
  }
  
  // Uncomment to run benchmark
  // benchmarkConversions();
  console.log('(Benchmark commented out - uncomment to run)');
}

// Question 9: Build a Safe Evaluator
function question9_SafeEvaluator() {
  console.log('\nQuestion 9: Build a safe expression evaluator:');
  
  class SafeEvaluator {
    static evaluate(expression, variables = {}) {
      // Replace variables
      let processed = expression;
      Object.entries(variables).forEach(([key, value]) => {
        // Simple variable replacement (not production-ready)
        processed = processed.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(value));
      });
      
      // Validate expression (basic security check)
      const allowedChars = /^[0-9+\-*/()\s"'\[\],{}.:]+$/;
      if (!allowedChars.test(processed)) {
        throw new Error('Invalid characters in expression');
      }
      
      try {
        // Use Function constructor instead of eval for slightly better security
        return Function(`"use strict"; return (${processed})`)();
      } catch (error) {
        throw new Error(`Evaluation error: ${error.message}`);
      }
    }
    
    static safeParse(value) {
      // Try to parse as number
      if (!isNaN(Number(value)) && value !== '') {
        return Number(value);
      }
      
      // Try to parse as boolean
      if (value === 'true') return true;
      if (value === 'false') return false;
      
      // Try to parse as array/object
      if ((value.startsWith('[') && value.endsWith(']')) ||
          (value.startsWith('{') && value.endsWith('}'))) {
        try {
          return JSON.parse(value);
        } catch {
          // Fall through to string
        }
      }
      
      // Return as string
      return value;
    }
  }
  
  // Test the evaluator
  const expressions = [
    { expr: '5 + 3', vars: {} },
    { expr: 'x * 2', vars: { x: 10 } },
    { expr: 'name + " World"', vars: { name: '"Hello"' } },
    { expr: 'items.length', vars: { items: [1, 2, 3] } }
  ];
  
  expressions.forEach(({ expr, vars }) => {
    try {
      const result = SafeEvaluator.evaluate(expr, vars);
      console.log(`${expr} = ${result}`);
    } catch (error) {
      console.log(`${expr} = Error: ${error.message}`);
    }
  });
}

// Question 10: Ultimate Coercion Challenge
function question10_UltimateChallenge() {
  console.log('\nQuestion 10: The Ultimate Coercion Challenge');
  console.log('Explain the step-by-step execution of: !+[]+[]+![]');
  
  console.log('\nStep-by-step breakdown:');
  console.log('1. +[]        =', +[]);           // 0
  console.log('2. !+[]       =', !+[]);          // true
  console.log('3. ![]        =', ![]);           // false
  console.log('4. !+[] + []  =', !+[] + []);     // "true"
  console.log('5. "true" + false =', "true" + false); // "truefalse"
  
  console.log('\nThe complete expression:');
  console.log('!+[]+[]+![] =', !+[]+[]+![]);    // "truefalse"
  
  console.log('\nExplanation:');
  console.log('- +[] converts empty array to 0 (ToPrimitive then ToNumber)');
  console.log('- !0 converts 0 to true (ToBoolean then logical NOT)');
  console.log('- ![] converts array to false (arrays are truthy, so !true = false)');
  console.log('- true + [] triggers string conversion ("true" + "")');
  console.log('- "true" + false results in "truefalse"');
}

// Run all interview questions
function runAllQuestions() {
  question1_OutputPrediction();
  question2_FixTheBug();
  question3_CustomEquality();
  question4_TruthyFalsy();
  question5_AdvancedPuzzle();
  question6_ArrayCoercion();
  question7_TypeChecker();
  question8_PerformanceChallenge();
  question9_SafeEvaluator();
  question10_UltimateChallenge();
}

// Quick test function for interviews
function quickCoercionTest() {
  const tests = [
    () => console.log('[] + {} =', [] + {}),
    () => console.log('{} + [] =', {} + []),
    () => console.log('[] == ![] =', [] == ![]),
    () => console.log('null == 0 =', null == 0),
    () => console.log('null >= 0 =', null >= 0),
    () => console.log('"2" > "12" =', "2" > "12"),
    () => console.log('NaN === NaN =', NaN === NaN),
    () => console.log('typeof NaN =', typeof NaN)
  ];
  
  tests.forEach(test => test());
}

// Export for testing
module.exports = {
  runAllQuestions,
  quickCoercionTest,
  
  // Individual question functions
  question1_OutputPrediction,
  question2_FixTheBug,
  question3_CustomEquality,
  question4_TruthyFalsy,
  question5_AdvancedPuzzle,
  question6_ArrayCoercion,
  question7_TypeChecker,
  question8_PerformanceChallenge,
  question9_SafeEvaluator,
  question10_UltimateChallenge,
  
  // Utilities
  getFalsyValues: () => [false, 0, -0, 0n, '', null, undefined, NaN],
  
  testCoercionUnderstanding: (value) => ({
    value,
    type: typeof value,
    toString: String(value),
    toNumber: Number(value),
    toBoolean: Boolean(value),
    equalsTrue: value == true,
    equalsFalse: value == false,
    equalsZero: value == 0,
    equalsEmptyString: value == '',
    isTruthy: !!value
  })
};

// Auto-run for demonstration
if (require.main === module) {
  console.log('Running Type Coercion Interview Questions...\n');
  runAllQuestions();
}