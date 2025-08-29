/**
 * File: language-enhancements.js
 * Description: Core ES6+ language enhancements with detailed explanations
 * 
 * Learning objectives:
 * - Master arrow functions and their this-binding behavior
 * - Understand template literals and tagged templates
 * - Learn default parameters and their evaluation timing
 * - Grasp rest/spread operators and their various use cases
 * 
 * This file consolidates: arrow-functions.js, template-literals.js, default-parameters.js, rest-parameters.js, spread-operator.js
 */

console.log('=== ES6+ Language Enhancements ===\n');

// ============================================================================
// PART 1: ARROW FUNCTIONS - SYNTAX AND THIS-BINDING BEHAVIOR
// ============================================================================

console.log('--- Arrow Functions Deep Dive ---');

/**
 * ARROW FUNCTIONS: More than just syntax sugar
 * 
 * Key differences from regular functions:
 * 1. LEXICAL THIS: Arrow functions don't have their own 'this'
 * 2. NO ARGUMENTS OBJECT: Use rest parameters instead
 * 3. NOT CONSTRUCTIBLE: Cannot be used with 'new'
 * 4. NO HOISTING: Must be declared before use
 * 5. IMPLICIT RETURNS: Single expressions return automatically
 * 
 * Understanding these differences is crucial for choosing the right function type.
 */

function demonstrateArrowFunctions() {
  console.log('Arrow Function Behavior Analysis:');
  
  // Traditional function vs Arrow function comparison
  const traditionalObj = {
    name: 'TraditionalObject',
    items: ['a', 'b', 'c'],
    
    // Regular method - 'this' refers to the object
    processItemsRegular: function() {
      console.log('  Regular method this:', this.name);
      
      // Problem: 'this' changes inside callback
      this.items.forEach(function(item) {
        // 'this' is undefined (strict mode) or global object
        console.log(`    Processing ${item} for ${this?.name || 'undefined context'}`);
      });
    },
    
    // Solution 1: Store 'this' in variable (pre-ES6 pattern)
    processItemsWithVar: function() {
      console.log('  Stored this approach:');
      const self = this; // Common pattern before arrow functions
      
      this.items.forEach(function(item) {
        console.log(`    Processing ${item} for ${self.name}`);
      });
    },
    
    // Solution 2: Arrow function preserves lexical 'this'
    processItemsArrow: function() {
      console.log('  Arrow function approach:');
      
      // Arrow function inherits 'this' from enclosing scope
      this.items.forEach((item) => {
        console.log(`    Processing ${item} for ${this.name}`);
      });
    },
    
    // MISTAKE: Using arrow function as method
    arrowMethod: () => {
      // 'this' is not the object, it's the enclosing scope (likely global)
      console.log('  Arrow method this:', this?.name || 'Not the object!');
    }
  };
  
  console.log('\n1. Regular function callback (problematic):');
  traditionalObj.processItemsRegular();
  
  console.log('\n2. Stored this workaround:');
  traditionalObj.processItemsWithVar();
  
  console.log('\n3. Arrow function solution:');
  traditionalObj.processItemsArrow();
  
  console.log('\n4. Arrow function as method (incorrect):');
  traditionalObj.arrowMethod();
  
  /**
   * PRACTICAL ARROW FUNCTION PATTERNS
   */
  
  console.log('\nPractical arrow function patterns:');
  
  // Pattern 1: Array processing (most common use case)
  const numbers = [1, 2, 3, 4, 5];
  
  // Concise array transformations
  const doubled = numbers.map(n => n * 2);
  const evens = numbers.filter(n => n % 2 === 0);
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  
  console.log('  Array processing:');
  console.log('    Original:', numbers);
  console.log('    Doubled:', doubled);
  console.log('    Evens:', evens);
  console.log('    Sum:', sum);
  
  // Pattern 2: Event handlers that need lexical this
  class ButtonManager {
    constructor(buttonId) {
      this.buttonId = buttonId;
      this.clickCount = 0;
    }
    
    // Arrow function preserves 'this' for event handlers
    handleClick = (event) => {
      this.clickCount++;
      console.log(`  Button ${this.buttonId} clicked ${this.clickCount} times`);
    }
    
    // Would need .bind(this) if using regular function
    handleClickRegular(event) {
      this.clickCount++;
      console.log(`  Regular handler: ${this.clickCount} clicks`);
    }
    
    attachListeners() {
      // Arrow function: automatic 'this' binding
      // button.addEventListener('click', this.handleClick);
      
      // Regular function: manual binding required
      // button.addEventListener('click', this.handleClickRegular.bind(this));
      
      console.log('  Event listeners attached (simulated)');
    }
  }
  
  const btnManager = new ButtonManager('submit-btn');
  btnManager.attachListeners();
  btnManager.handleClick(); // Simulate click
  btnManager.handleClick(); // Simulate another click
  
  // Pattern 3: Promise chains with arrow functions
  console.log('\n  Promise chain with arrow functions:');
  
  const simulateAsyncOperation = (data) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(data.toUpperCase()), 100);
    });
  };
  
  // Clean promise chain with arrow functions
  simulateAsyncOperation('hello')
    .then(result => {
      console.log('    Step 1:', result);
      return result + ' WORLD';
    })
    .then(result => {
      console.log('    Step 2:', result);
      return result.length;
    })
    .then(length => {
      console.log('    Final result length:', length);
    });
  
  /**
   * WHEN NOT TO USE ARROW FUNCTIONS
   */
  
  console.log('\nWhen NOT to use arrow functions:');
  
  // Mistake 1: Object methods
  const obj = {
    value: 42,
    
    // Wrong: arrow function doesn't bind 'this' to object
    getValueWrong: () => {
      return this?.value || 'undefined'; // 'this' is not the object
    },
    
    // Correct: regular function binds 'this' to object
    getValueCorrect: function() {
      return this.value;
    }
  };
  
  console.log('  Object method with arrow (wrong):', obj.getValueWrong());
  console.log('  Object method with regular (correct):', obj.getValueCorrect());
  
  // Mistake 2: Dynamic this scenarios
  const button = {
    text: 'Click me',
    
    // This won't work as expected if used as event handler
    onClick: () => {
      // 'this' is not the DOM element or the object
      console.log('  Arrow onClick - this.text:', this?.text || 'undefined');
    },
    
    onClickCorrect: function() {
      // 'this' would be the DOM element when used as event handler
      console.log('  Regular onClick - can access DOM element properties');
    }
  };
}

demonstrateArrowFunctions();

// ============================================================================
// PART 2: TEMPLATE LITERALS AND TAGGED TEMPLATES
// ============================================================================

function demonstrateTemplateLiterals() {
  console.log('\n--- Template Literals and Tagged Templates ---');
  
  /**
   * TEMPLATE LITERALS: Beyond string concatenation
   * 
   * Benefits over traditional strings:
   * 1. MULTILINE STRINGS: No need for \n or string concatenation
   * 2. EXPRESSION INTERPOLATION: ${} can contain any JS expression
   * 3. TAGGED TEMPLATES: Custom string processing functions
   * 4. RAW STRINGS: Access to unprocessed string data
   */
  
  console.log('Template Literal Features:');
  
  // Basic interpolation
  const name = 'Alice';
  const age = 25;
  const city = 'New York';
  
  // Old way: error-prone and hard to read
  const oldWay = 'Hello, my name is ' + name + '. I am ' + age + ' years old and I live in ' + city + '.';
  
  // New way: clean and readable
  const newWay = `Hello, my name is ${name}. I am ${age} years old and I live in ${city}.`;
  
  console.log('  Old concatenation:', oldWay);
  console.log('  Template literal:', newWay);
  
  // Multiline strings
  const multilineOld = 'Line 1\n' +
                       'Line 2\n' +
                       'Line 3';
  
  const multilineNew = `Line 1
Line 2
Line 3`;
  
  console.log('  Multiline comparison:');
  console.log('    Old way:', JSON.stringify(multilineOld));
  console.log('    New way:', JSON.stringify(multilineNew));
  
  // Expression evaluation in templates
  const items = ['apple', 'banana', 'cherry'];
  const user = { firstName: 'John', lastName: 'Doe', role: 'admin' };
  
  console.log('\n  Complex expressions in templates:');
  console.log(`    Items count: ${items.length}`);
  console.log(`    First item: ${items[0]?.toUpperCase()}`);
  console.log(`    User: ${user.firstName} ${user.lastName}`);
  console.log(`    Is admin: ${user.role === 'admin' ? 'Yes' : 'No'}`);
  console.log(`    Random number: ${Math.floor(Math.random() * 100)}`);
  console.log(`    Current time: ${new Date().toLocaleTimeString()}`);
  
  /**
   * TAGGED TEMPLATES: Custom String Processing
   * 
   * Tagged templates allow you to parse template literals with a function.
   * The function receives:
   * 1. An array of string literals
   * 2. The interpolated values as separate arguments
   */
  
  console.log('\nTagged Templates:');
  
  // Simple tagged template example
  function highlight(strings, ...values) {
    // strings: array of string parts
    // values: array of interpolated expressions
    
    console.log('    Template parts:', strings);
    console.log('    Interpolated values:', values);
    
    // Combine strings and values with highlighting
    return strings.reduce((result, string, i) => {
      const value = i < values.length ? `**${values[i]}**` : '';
      return result + string + value;
    }, '');
  }
  
  const highlightedText = highlight`Hello ${name}, you are ${age} years old!`;
  console.log('  Highlighted result:', highlightedText);
  
  // Practical tagged template: HTML escaping
  function html(strings, ...values) {
    // Escape HTML in interpolated values to prevent XSS
    function escapeHtml(value) {
      const div = { innerHTML: '' }; // Simulate DOM element
      // In real implementation: value.replace(/[&<>"']/g, match => htmlEscapeMap[match])
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    
    return strings.reduce((result, string, i) => {
      const value = i < values.length ? escapeHtml(values[i]) : '';
      return result + string + value;
    }, '');
  }
  
  const userInput = '<script>alert("XSS")</script>';
  const safeHtml = html`<div>User input: ${userInput}</div>`;
  console.log('  Safe HTML:', safeHtml);
  
  // Advanced tagged template: CSS-in-JS simulation
  function css(strings, ...values) {
    // Process CSS template with dynamic values
    let cssString = '';
    
    strings.forEach((string, i) => {
      cssString += string;
      if (i < values.length) {
        const value = values[i];
        // Add units if it's a number (simplified)
        if (typeof value === 'number') {
          cssString += value + 'px';
        } else {
          cssString += value;
        }
      }
    });
    
    return cssString.trim();
  }
  
  const width = 200;
  const color = 'blue';
  const styles = css`
    width: ${width};
    height: ${width / 2};
    background-color: ${color};
    border-radius: ${width * 0.1};
  `;
  
  console.log('  Generated CSS:', styles);
  
  // String.raw for accessing raw template data
  const rawString = String.raw`Path: C:\Users\${name}\Documents`;
  const regularString = `Path: C:\\Users\\${name}\\Documents`;
  
  console.log('  Raw string:', rawString);
  console.log('  Regular string:', regularString);
  
  /**
   * TEMPLATE LITERAL BEST PRACTICES
   * 
   * 1. Use for string interpolation instead of concatenation
   * 2. Great for multiline strings and HTML/SQL generation
   * 3. Tagged templates for domain-specific languages (CSS, SQL, etc.)
   * 4. Always escape user input in tagged templates
   * 5. Consider performance for very large strings or tight loops
   */
  
  console.log('\nTemplate literal use cases:');
  
  // Use case 1: SQL query building
  function sql(strings, ...values) {
    // In production, use proper SQL parameterization for safety
    console.log('    SQL template (for demonstration only):');
    return strings.reduce((query, string, i) => {
      const value = i < values.length ? `'${values[i]}'` : '';
      return query + string + value;
    }, '');
  }
  
  const userId = 123;
  const sqlQuery = sql`SELECT * FROM users WHERE id = ${userId} AND active = ${true}`;
  console.log('   ', sqlQuery);
  
  // Use case 2: Configuration file generation
  function generateConfig(appName, version, environment) {
    return `# ${appName} Configuration
app:
  name: "${appName}"
  version: "${version}"
  environment: "${environment}"
  
database:
  host: "${environment === 'production' ? 'prod-db.example.com' : 'localhost'}"
  port: ${environment === 'production' ? 5432 : 5433}
  
features:
  debug: ${environment !== 'production'}
  analytics: ${environment === 'production'}`;
  }
  
  const config = generateConfig('MyApp', '1.0.0', 'development');
  console.log('  Generated config:');
  console.log(config);
}

setTimeout(demonstrateTemplateLiterals, 200); // Delay for better output ordering

// ============================================================================
// PART 3: DEFAULT PARAMETERS AND PARAMETER HANDLING
// ============================================================================

function demonstrateDefaultParameters() {
  console.log('\n--- Default Parameters ---');
  
  /**
   * DEFAULT PARAMETERS: More than just convenience
   * 
   * Key behaviors:
   * 1. EVALUATION TIME: Defaults are evaluated at call time, not definition time
   * 2. SCOPE ACCESS: Defaults can access previously defined parameters
   * 3. FUNCTION CALLS: Defaults can be function calls or expressions
   * 4. UNDEFINED CHECK: Only undefined triggers default (not null or falsy)
   */
  
  console.log('Default Parameter Behaviors:');
  
  // Basic default parameters
  function greet(name = 'World', punctuation = '!') {
    return `Hello, ${name}${punctuation}`;
  }
  
  console.log('  Basic defaults:');
  console.log('   ', greet()); // Uses both defaults
  console.log('   ', greet('Alice')); // Uses punctuation default
  console.log('   ', greet('Bob', '.')); // Uses no defaults
  console.log('   ', greet(undefined, '?')); // undefined triggers default
  console.log('   ', greet(null, '?')); // null does NOT trigger default
  
  // Advanced default parameter patterns
  function createUser(
    name, 
    email,
    role = 'user', // Simple default
    createdAt = new Date(), // Function call default - evaluated each time!
    id = Math.random().toString(36).substr(2, 9), // Expression default
    metadata = {} // Object default
  ) {
    return { name, email, role, createdAt, id, metadata };
  }
  
  console.log('\n  Advanced defaults (notice different timestamps and IDs):');
  
  // Each call gets a new Date and ID
  setTimeout(() => {
    const user1 = createUser('Alice', 'alice@example.com');
    console.log('    User 1:', { ...user1, createdAt: user1.createdAt.toISOString() });
  }, 100);
  
  setTimeout(() => {
    const user2 = createUser('Bob', 'bob@example.com', 'admin');
    console.log('    User 2:', { ...user2, createdAt: user2.createdAt.toISOString() });
  }, 200);
  
  // Parameter defaults can reference previous parameters
  function buildUrl(protocol = 'https', host = 'localhost', port = protocol === 'https' ? 443 : 80, path = '/') {
    return `${protocol}://${host}:${port}${path}`;
  }
  
  console.log('\n  Parameter dependencies:');
  console.log('   ', buildUrl()); // https://localhost:443/
  console.log('   ', buildUrl('http')); // http://localhost:80/
  console.log('   ', buildUrl('http', 'example.com')); // http://example.com:80/
  console.log('   ', buildUrl('https', 'api.example.com', undefined, '/api/v1')); // https://api.example.com:443/api/v1
  
  // Default parameters with destructuring
  function processConfig({
    apiUrl = 'https://api.example.com',
    timeout = 5000,
    retries = 3,
    debug = false
  } = {}) {
    // The = {} at the end provides a default for the entire parameter
    // Without it, calling processConfig() would throw an error
    
    return {
      config: { apiUrl, timeout, retries, debug },
      isConfigured: true
    };
  }
  
  console.log('\n  Destructuring with defaults:');
  console.log('    No args:', processConfig());
  console.log('    Partial config:', processConfig({ timeout: 10000 }));
  console.log('    Full config:', processConfig({
    apiUrl: 'https://custom-api.com',
    timeout: 2000,
    retries: 5,
    debug: true
  }));
  
  // Edge case: functions as defaults
  let callCount = 0;
  function incrementCounter() {
    return ++callCount;
  }
  
  function trackCalls(id = incrementCounter()) {
    return { callId: id, message: 'Function executed' };
  }
  
  console.log('\n  Function defaults (notice counter increments):');
  console.log('   ', trackCalls()); // Uses default, increments counter
  console.log('   ', trackCalls(100)); // Doesn't use default, counter not incremented  
  console.log('   ', trackCalls()); // Uses default again, increments counter
  
  /**
   * PERFORMANCE CONSIDERATIONS
   * 
   * Default parameters are evaluated every time they're needed.
   * For expensive operations, consider caching or lazy initialization.
   */
  
  // Expensive default (avoid this pattern)
  function badExample(data = expensiveOperation()) {
    return data.processed;
  }
  
  function expensiveOperation() {
    console.log('    Expensive operation running...');
    // Simulate expensive work
    return { processed: true, timestamp: Date.now() };
  }
  
  // Better pattern: lazy evaluation
  function goodExample(data = null) {
    if (data === null) {
      data = expensiveOperation(); // Only run when needed
    }
    return data.processed;
  }
  
  console.log('\n  Performance consideration:');
  console.log('    Calling function with expensive default twice:');
  // badExample(); // Would run expensive operation each call
  // badExample(); // Would run expensive operation again
  
  console.log('    Using lazy evaluation pattern:');
  console.log('   ', goodExample());
  console.log('    (Expensive operation only ran once)');
}

setTimeout(demonstrateDefaultParameters, 400); // Delay for better output ordering

// ============================================================================
// PART 4: REST AND SPREAD OPERATORS
// ============================================================================

function demonstrateRestAndSpread() {
  console.log('\n--- Rest and Spread Operators ---');
  
  /**
   * REST (...) vs SPREAD (...): Same syntax, different contexts
   * 
   * REST: Collects multiple elements into an array
   * - Function parameters: function(a, ...rest)
   * - Destructuring: const [first, ...rest] = array
   * 
   * SPREAD: Expands an array/object into individual elements
   * - Function calls: func(...array)
   * - Array literals: [...array1, ...array2]  
   * - Object literals: {...obj1, ...obj2}
   */
  
  console.log('Rest vs Spread Demonstration:');
  
  // REST: Collecting function arguments
  function sum(...numbers) {
    // 'numbers' is an array containing all arguments
    console.log('    REST - Function received:', numbers);
    return numbers.reduce((total, num) => total + num, 0);
  }
  
  console.log('  REST in function parameters:');
  console.log('   ', `sum(1, 2, 3) = ${sum(1, 2, 3)}`);
  console.log('   ', `sum(1, 2, 3, 4, 5) = ${sum(1, 2, 3, 4, 5)}`);
  
  // REST: Collecting remaining elements in destructuring
  const numbers = [1, 2, 3, 4, 5];
  const [first, second, ...remaining] = numbers;
  
  console.log('  REST in array destructuring:');
  console.log('   ', `first: ${first}, second: ${second}, remaining: [${remaining}]`);
  
  // SPREAD: Expanding array into function arguments
  const arrayOfNumbers = [10, 20, 30];
  console.log('  SPREAD in function calls:');
  console.log('   ', `sum(...[10, 20, 30]) = ${sum(...arrayOfNumbers)}`);
  
  // SPREAD: Creating new arrays
  const fruits = ['apple', 'banana'];
  const vegetables = ['carrot', 'broccoli'];
  const combined = [...fruits, 'orange', ...vegetables];
  
  console.log('  SPREAD in array creation:');
  console.log('   ', 'Combined array:', combined);
  
  // Practical applications
  console.log('\nPractical Applications:');
  
  // 1. Function with flexible parameters
  function createMessage(template, ...substitutions) {
    // Replace placeholders in template with substitutions
    let result = template;
    substitutions.forEach((sub, index) => {
      result = result.replace(`{${index}}`, sub);
    });
    return result;
  }
  
  const message = createMessage('Hello {0}, you have {1} messages in {2}', 'Alice', 5, 'inbox');
  console.log('  Flexible parameters:', message);
  
  // 2. Array operations without mutating original
  const originalArray = [1, 2, 3];
  
  // Add elements without mutating
  const withNewElements = [...originalArray, 4, 5];
  const withPrepended = [0, ...originalArray];
  const withInserted = [...originalArray.slice(0, 2), 2.5, ...originalArray.slice(2)];
  
  console.log('  Non-mutating array operations:');
  console.log('    Original:', originalArray);
  console.log('    With new elements:', withNewElements);
  console.log('    With prepended:', withPrepended);
  console.log('    With inserted:', withInserted);
  
  // 3. Object spreading (ES2018)
  const baseConfig = { host: 'localhost', port: 3000, ssl: false };
  const devConfig = { ...baseConfig, debug: true, port: 3001 };
  const prodConfig = { ...baseConfig, ssl: true, host: 'api.example.com' };
  
  console.log('  Object spreading:');
  console.log('    Base config:', baseConfig);
  console.log('    Dev config:', devConfig);
  console.log('    Prod config:', prodConfig);
  
  // 4. Cloning and merging
  function mergeUsers(...userObjects) {
    // Merge multiple user objects, with later objects overriding earlier ones
    return userObjects.reduce((merged, user) => ({ ...merged, ...user }), {});
  }
  
  const user1 = { id: 1, name: 'Alice', role: 'user' };
  const user2 = { email: 'alice@example.com', role: 'admin' }; // role overrides
  const user3 = { lastLogin: '2023-01-15' };
  
  const mergedUser = mergeUsers(user1, user2, user3);
  console.log('  Merged user:', mergedUser);
  
  // 5. Converting iterables to arrays
  function convertToArray(...iterables) {
    return iterables.map(iterable => [...iterable]);
  }
  
  const string = 'hello';
  const set = new Set([1, 2, 3, 2, 1]); // Set removes duplicates
  const nodeList = { length: 3, 0: 'a', 1: 'b', 2: 'c' }; // Array-like object
  
  console.log('  Converting iterables:');
  console.log('    String to array:', [...string]);
  console.log('    Set to array:', [...set]);
  console.log('    Array-like to array:', [...Object.values(nodeList)]);
  
  // 6. Advanced: Rest parameters with validation
  function validateAndSum(min, ...numbers) {
    // First parameter is minimum required count
    if (numbers.length < min) {
      throw new Error(`At least ${min} numbers required, got ${numbers.length}`);
    }
    
    // Validate all numbers
    const invalidNumbers = numbers.filter(n => typeof n !== 'number' || isNaN(n));
    if (invalidNumbers.length > 0) {
      throw new Error(`Invalid numbers: ${invalidNumbers}`);
    }
    
    return {
      count: numbers.length,
      sum: numbers.reduce((total, num) => total + num, 0),
      average: numbers.reduce((total, num) => total + num, 0) / numbers.length
    };
  }
  
  console.log('  Advanced rest usage:');
  try {
    console.log('    validateAndSum(2, 10, 20, 30):', validateAndSum(2, 10, 20, 30));
    console.log('    validateAndSum(1, 5):', validateAndSum(1, 5));
  } catch (error) {
    console.log('    Error:', error.message);
  }
  
  /**
   * PERFORMANCE AND BEST PRACTICES
   * 
   * 1. Spread creates shallow copies - nested objects are still referenced
   * 2. For large arrays, spread can be slower than concat or push
   * 3. Object spread is newer syntax - ensure browser support
   * 4. Use rest parameters instead of arguments object
   */
  
  console.log('\nBest Practices:');
  
  // Shallow copy demonstration
  const original = { name: 'Alice', address: { city: 'New York' } };
  const copy = { ...original };
  
  copy.name = 'Bob'; // This doesn't affect original
  copy.address.city = 'Boston'; // This DOES affect original!
  
  console.log('  Shallow copy behavior:');
  console.log('    Original after copy modification:', original);
  console.log('    Copy:', copy);
  console.log('    Notice: nested objects are still referenced!');
  
  // For deep copying, you need different approaches
  const deepCopy = JSON.parse(JSON.stringify(original));
  deepCopy.address.city = 'Chicago';
  console.log('    After deep copy modification:', original);
  console.log('    Deep copy:', deepCopy);
}

setTimeout(demonstrateRestAndSpread, 600); // Delay for better output ordering

/**
 * SUMMARY OF LANGUAGE ENHANCEMENTS:
 * 
 * 1. Arrow Functions:
 *    - Lexical 'this' binding - inherits from enclosing scope
 *    - No arguments object - use rest parameters
 *    - Cannot be constructors
 *    - Perfect for callbacks and functional programming
 * 
 * 2. Template Literals:
 *    - String interpolation with ${} syntax
 *    - Multiline strings without escape characters
 *    - Tagged templates for custom string processing
 *    - Great for HTML, CSS, SQL generation
 * 
 * 3. Default Parameters:
 *    - Evaluated at call time, not definition time
 *    - Can reference previous parameters
 *    - Only undefined triggers default (not null/falsy)
 *    - Can be expressions or function calls
 * 
 * 4. Rest/Spread Operators:
 *    - Rest (...): Collects multiple elements into array
 *    - Spread (...): Expands array/object into elements
 *    - Enables functional programming patterns
 *    - Creates shallow copies for immutability
 * 
 * Interview Focus:
 * - Explain 'this' behavior differences in arrow functions
 * - Show understanding of template literal use cases
 * - Demonstrate knowledge of default parameter evaluation
 * - Use rest/spread for practical programming patterns
 */

setTimeout(() => {
  console.log('\nLanguage enhancements demonstration complete!');
  console.log('Next: See destructuring-patterns.js for advanced destructuring techniques');
}, 800);