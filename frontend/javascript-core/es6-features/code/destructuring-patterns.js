/**
 * File: destructuring-patterns.js
 * Description: Advanced destructuring patterns for arrays and objects with comprehensive examples
 * 
 * Learning objectives:
 * - Master array and object destructuring syntax and use cases
 * - Understand nested destructuring and default value patterns
 * - Learn practical applications in function parameters and API responses
 * - Grasp performance implications and best practices
 * 
 * This file consolidates: array-destructuring.js, object-destructuring.js, destructuring-advanced.js
 */

console.log('=== Destructuring Patterns Deep Dive ===\n');

// ============================================================================
// PART 1: ARRAY DESTRUCTURING FUNDAMENTALS
// ============================================================================

console.log('--- Array Destructuring Fundamentals ---');

/**
 * ARRAY DESTRUCTURING: Positional Value Extraction
 * 
 * Key concepts:
 * 1. POSITION MATTERS: Variables are assigned based on array index
 * 2. SKIPPING ELEMENTS: Use empty slots to skip unwanted values
 * 3. REST PATTERN: Collect remaining elements with ...rest
 * 4. DEFAULT VALUES: Provide fallbacks for undefined elements
 * 5. SWAPPING: Elegant variable swapping without temp variables
 */

function demonstrateArrayDestructuring() {
  console.log('Array Destructuring Patterns:');
  
  // Basic destructuring
  const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
  const [first, second, third] = colors;
  
  console.log('  Basic destructuring:');
  console.log('    Colors array:', colors);
  console.log('    Extracted:', { first, second, third });
  
  // Skipping elements with empty slots
  const [primary, , tertiary, , fifth] = colors; // Skip green and yellow
  console.log('  Skipping elements:', { primary, tertiary, fifth });
  
  // Rest pattern - collecting remaining elements
  const [head, ...tail] = colors;
  const [firstTwo, secondTwo, ...remainder] = colors;
  
  console.log('  Rest patterns:');
  console.log('    Head and tail:', { head, tail });
  console.log('    First two and remainder:', { firstTwo, secondTwo, remainder });
  
  // Default values for undefined elements
  const shortArray = ['a', 'b'];
  const [a, b, c = 'default-c', d = 'default-d'] = shortArray;
  
  console.log('  Default values:');
  console.log('    Short array:', shortArray);
  console.log('    With defaults:', { a, b, c, d });
  
  // Default values can be expressions or function calls
  let defaultCounter = 0;
  function getDefault() {
    return `default-${++defaultCounter}`;
  }
  
  const [x, y = getDefault(), z = getDefault()] = ['x-value'];
  console.log('  Dynamic defaults:', { x, y, z });
  console.log('    Default counter:', defaultCounter); // Only incremented twice
  
  // Variable swapping - classic use case
  let var1 = 'first';
  let var2 = 'second';
  
  console.log('  Variable swapping:');
  console.log('    Before swap:', { var1, var2 });
  
  [var1, var2] = [var2, var1]; // Elegant swap without temp variable
  
  console.log('    After swap:', { var1, var2 });
  
  // Multiple assignment from function returns
  function getCoordinates() {
    return [10, 20, 30]; // x, y, z coordinates
  }
  
  function getMinMax(numbers) {
    return [Math.min(...numbers), Math.max(...numbers)];
  }
  
  const [x_coord, y_coord, z_coord] = getCoordinates();
  const [minimum, maximum] = getMinMax([5, 2, 8, 1, 9]);
  
  console.log('  Function return destructuring:');
  console.log('    Coordinates:', { x_coord, y_coord, z_coord });
  console.log('    Min/Max of [5, 2, 8, 1, 9]:', { minimum, maximum });
  
  // Destructuring in loops
  const pairs = [['name', 'Alice'], ['age', 25], ['city', 'New York']];
  
  console.log('  Destructuring in loops:');
  for (const [key, value] of pairs) {
    console.log(`    ${key}: ${value}`);
  }
  
  // Array-like objects (strings, NodeLists, etc.)
  const [char1, char2, ...restChars] = 'Hello';
  console.log('  String destructuring:', { char1, char2, restChars });
  
  // Practical example: Parsing CSV-like data
  function parseCSVRow(csvRow) {
    const fields = csvRow.split(',');
    const [id, name, email, ...extraFields] = fields.map(field => field.trim());
    
    return {
      id: parseInt(id),
      name,
      email,
      hasExtraData: extraFields.length > 0,
      extraFields
    };
  }
  
  const csvData = '123, Alice Johnson, alice@example.com, Manager, IT Department';
  const parsedData = parseCSVRow(csvData);
  console.log('  CSV parsing example:', parsedData);
  
  /**
   * ADVANCED ARRAY DESTRUCTURING PATTERNS
   */
  
  // Destructuring with computed/dynamic positions
  function extractAtPositions(array, ...positions) {
    // Extract values at specific positions
    return positions.map(pos => array[pos]);
  }
  
  const data = ['a', 'b', 'c', 'd', 'e', 'f'];
  const extracted = extractAtPositions(data, 0, 2, 4); // Get elements at index 0, 2, 4
  console.log('  Dynamic position extraction:', extracted);
  
  // Destructuring with validation
  function processCoordinates(coordArray) {
    if (!Array.isArray(coordArray) || coordArray.length < 2) {
      throw new Error('Invalid coordinates array');
    }
    
    const [x, y, z = 0] = coordArray; // z defaults to 0 for 2D coordinates
    
    // Validate numeric values
    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      throw new Error('Coordinates must be numbers');
    }
    
    return { x, y, z, is3D: z !== 0 };
  }
  
  console.log('  Coordinate processing:');
  console.log('    2D coords [10, 20]:', processCoordinates([10, 20]));
  console.log('    3D coords [5, 15, 25]:', processCoordinates([5, 15, 25]));
}

demonstrateArrayDestructuring();

// ============================================================================
// PART 2: OBJECT DESTRUCTURING FUNDAMENTALS
// ============================================================================

function demonstrateObjectDestructuring() {
  console.log('\n--- Object Destructuring Fundamentals ---');
  
  /**
   * OBJECT DESTRUCTURING: Property-Based Value Extraction
   * 
   * Key concepts:
   * 1. PROPERTY NAMES: Variables are assigned based on property names, not position
   * 2. RENAMING: Use : to assign to different variable names
   * 3. DEFAULT VALUES: Provide fallbacks for undefined properties
   * 4. COMPUTED PROPERTIES: Use [] for dynamic property names
   * 5. NESTED EXTRACTION: Deep destructuring for nested objects
   */
  
  console.log('Object Destructuring Patterns:');
  
  // Basic object destructuring
  const user = {
    id: 123,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true
    }
  };
  
  // Extract properties into variables with same names
  const { id, name, email } = user;
  console.log('  Basic extraction:', { id, name, email });
  
  // Property renaming during extraction
  const { id: userId, name: fullName, role: userRole } = user;
  console.log('  Renamed extraction:', { userId, fullName, userRole });
  
  // Default values for missing properties
  const { 
    name: userName, 
    department = 'General', // Default for missing property
    isActive = true,        // Default for missing property
    lastLogin = null        // Default for missing property
  } = user;
  
  console.log('  With defaults:', { userName, department, isActive, lastLogin });
  
  // Nested object destructuring
  const { preferences: { theme, language, notifications } } = user;
  console.log('  Nested extraction:', { theme, language, notifications });
  
  // Nested with renaming and defaults
  const {
    preferences: {
      theme: selectedTheme = 'light',
      language: userLanguage = 'en',
      notifications: enableNotifications = false,
      timezone = 'UTC' // Default for missing nested property
    }
  } = user;
  
  console.log('  Nested with defaults:', { 
    selectedTheme, 
    userLanguage, 
    enableNotifications, 
    timezone 
  });
  
  // Rest pattern in objects - collecting remaining properties
  const { id: extractedId, name: extractedName, ...otherProperties } = user;
  console.log('  Rest pattern:');
  console.log('    Extracted:', { extractedId, extractedName });
  console.log('    Remaining:', Object.keys(otherProperties));
  
  // Computed property names
  const propertyName = 'email';
  const { [propertyName]: dynamicExtraction } = user;
  console.log('  Computed property:', { [propertyName]: dynamicExtraction });
  
  // Function parameter destructuring
  function displayUserInfo({ name, email, role = 'user', preferences = {} }) {
    const { theme = 'light' } = preferences;
    
    return `User: ${name} (${email}) - Role: ${role}, Theme: ${theme}`;
  }
  
  console.log('  Function parameter destructuring:');
  console.log('   ', displayUserInfo(user));
  console.log('   ', displayUserInfo({ name: 'Bob', email: 'bob@example.com' }));
  
  /**
   * PRACTICAL OBJECT DESTRUCTURING APPLICATIONS
   */
  
  // API response handling
  function handleAPIResponse(response) {
    const {
      data: {
        users = [],
        totalCount = 0,
        pagination: {
          currentPage = 1,
          totalPages = 1,
          hasNext = false
        } = {}
      } = {},
      status = 'unknown',
      message = 'No message'
    } = response;
    
    return {
      users: users.map(({ id, name, email }) => ({ id, name, email })),
      totalCount,
      currentPage,
      totalPages,
      hasNext,
      status,
      message
    };
  }
  
  const apiResponse = {
    data: {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' }
      ],
      totalCount: 50,
      pagination: {
        currentPage: 1,
        totalPages: 5,
        hasNext: true
      }
    },
    status: 'success',
    message: 'Users retrieved successfully'
  };
  
  const processedResponse = handleAPIResponse(apiResponse);
  console.log('  API response processing:', processedResponse);
  
  // Configuration object processing
  function initializeApp(config = {}) {
    const {
      server: {
        host = 'localhost',
        port = 3000,
        ssl = false
      } = {},
      database: {
        url = 'localhost:5432',
        name = 'myapp',
        credentials: {
          username = 'admin',
          password = 'password'
        } = {}
      } = {},
      features: {
        authentication = true,
        logging = true,
        analytics = false
      } = {}
    } = config;
    
    return {
      serverUrl: `${ssl ? 'https' : 'http'}://${host}:${port}`,
      databaseUrl: `postgresql://${username}:${password}@${url}/${name}`,
      enabledFeatures: Object.entries({ authentication, logging, analytics })
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
    };
  }
  
  const partialConfig = {
    server: { host: 'api.example.com', ssl: true },
    features: { analytics: true }
  };
  
  console.log('  Configuration processing:');
  console.log('   ', initializeApp(partialConfig));
  
  // Error handling with destructuring
  function processError(error) {
    const {
      name = 'UnknownError',
      message = 'An unknown error occurred',
      stack,
      code,
      details: {
        statusCode = 500,
        userMessage = 'Something went wrong'
      } = {}
    } = error;
    
    return {
      errorType: name,
      errorMessage: message,
      hasStack: !!stack,
      errorCode: code,
      httpStatus: statusCode,
      displayMessage: userMessage
    };
  }
  
  const customError = {
    name: 'ValidationError',
    message: 'Invalid user input',
    code: 'VALIDATION_FAILED',
    details: {
      statusCode: 400,
      userMessage: 'Please check your input and try again'
    }
  };
  
  console.log('  Error processing:', processError(customError));
  
  // Array of objects destructuring
  const products = [
    { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
    { id: 2, name: 'Book', price: 29, category: 'Education' },
    { id: 3, name: 'Headphones', price: 199, category: 'Electronics' }
  ];
  
  // Extract specific properties from each object
  const productSummary = products.map(({ name, price, category }) => ({
    displayName: name,
    cost: price,
    type: category
  }));
  
  console.log('  Array of objects processing:');
  products.forEach(({ id, name, price }, index) => {
    console.log(`    Product ${index + 1}: ${name} ($${price}) [ID: ${id}]`);
  });
  
  // Conditional destructuring based on object shape
  function processMessage(message) {
    if ('user' in message && 'text' in message) {
      // Chat message format
      const { user: { name, avatar }, text, timestamp = Date.now() } = message;
      return { type: 'chat', sender: name, content: text, avatar, timestamp };
    } else if ('level' in message && 'message' in message) {
      // Log message format
      const { level, message: content, timestamp = Date.now() } = message;
      return { type: 'log', level, content, timestamp };
    } else {
      // Unknown format
      return { type: 'unknown', raw: message };
    }
  }
  
  const chatMessage = {
    user: { name: 'Alice', avatar: 'alice.jpg' },
    text: 'Hello everyone!',
    timestamp: 1640995200000
  };
  
  const logMessage = {
    level: 'error',
    message: 'Database connection failed'
  };
  
  console.log('  Conditional destructuring:');
  console.log('    Chat:', processMessage(chatMessage));
  console.log('    Log:', processMessage(logMessage));
}

demonstrateObjectDestructuring();

// ============================================================================
// PART 3: ADVANCED DESTRUCTURING PATTERNS
// ============================================================================

function demonstrateAdvancedPatterns() {
  console.log('\n--- Advanced Destructuring Patterns ---');
  
  /**
   * ADVANCED DESTRUCTURING: Complex Real-World Scenarios
   * 
   * Advanced patterns include:
   * 1. MIXED ARRAY/OBJECT destructuring
   * 2. DESTRUCTURING IN LOOPS and iterations
   * 3. DYNAMIC PROPERTY extraction
   * 4. PERFORMANCE considerations
   * 5. ERROR HANDLING with destructuring
   */
  
  console.log('Advanced Destructuring Scenarios:');
  
  // Mixed array and object destructuring
  const apiData = [
    { 
      endpoint: '/users', 
      data: { users: ['Alice', 'Bob'], count: 2 },
      meta: { timestamp: Date.now(), version: 'v1' }
    },
    { 
      endpoint: '/products', 
      data: { products: ['Laptop', 'Phone'], count: 2 },
      meta: { timestamp: Date.now(), version: 'v2' }
    }
  ];
  
  // Destructure array elements and then their properties
  const [
    { 
      endpoint: firstEndpoint, 
      data: { count: firstCount },
      meta: { version: firstVersion }
    },
    {
      endpoint: secondEndpoint,
      data: { count: secondCount },
      meta: { version: secondVersion }
    }
  ] = apiData;
  
  console.log('  Mixed destructuring:');
  console.log(`    ${firstEndpoint}: ${firstCount} items (${firstVersion})`);
  console.log(`    ${secondEndpoint}: ${secondCount} items (${secondVersion})`);
  
  // Destructuring with parameter validation
  function createUser({ 
    name, 
    email, 
    age = null,
    preferences: { 
      theme = 'light', 
      notifications = true 
    } = {}
  }) {
    // Validation after destructuring
    if (!name || typeof name !== 'string') {
      throw new Error('Name is required and must be a string');
    }
    
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }
    
    if (age !== null && (typeof age !== 'number' || age < 0)) {
      throw new Error('Age must be a positive number or null');
    }
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      age,
      preferences: { theme, notifications },
      createdAt: new Date().toISOString()
    };
  }
  
  console.log('  Validated user creation:');
  try {
    const user1 = createUser({
      name: 'Alice',
      email: 'alice@example.com',
      age: 25,
      preferences: { theme: 'dark' }
    });
    console.log('    Valid user:', { ...user1, createdAt: 'timestamp' });
    
    // This would throw an error
    // const user2 = createUser({ name: 'Bob' }); // Missing email
  } catch (error) {
    console.log('    Validation error:', error.message);
  }
  
  // Destructuring with computed properties and dynamic keys
  function extractProperties(obj, ...keys) {
    const result = {};
    
    keys.forEach(key => {
      if (typeof key === 'string') {
        // Simple property extraction
        const { [key]: value } = obj;
        result[key] = value;
      } else if (typeof key === 'object' && key.from && key.to) {
        // Property renaming
        const { [key.from]: value } = obj;
        result[key.to] = value;
      }
    });
    
    return result;
  }
  
  const sourceObject = {
    firstName: 'Alice',
    lastName: 'Johnson',
    emailAddress: 'alice@example.com',
    userAge: 25,
    isActive: true
  };
  
  const extracted = extractProperties(
    sourceObject,
    'firstName',
    { from: 'emailAddress', to: 'email' },
    { from: 'userAge', to: 'age' },
    'isActive'
  );
  
  console.log('  Dynamic property extraction:', extracted);
  
  // Destructuring in complex iterations
  const salesData = [
    {
      quarter: 'Q1',
      regions: {
        north: { sales: 100, target: 120 },
        south: { sales: 80, target: 90 },
        east: { sales: 110, target: 100 }
      }
    },
    {
      quarter: 'Q2', 
      regions: {
        north: { sales: 130, target: 120 },
        south: { sales: 95, target: 90 },
        east: { sales: 105, target: 100 }
      }
    }
  ];
  
  console.log('  Complex iteration with destructuring:');
  
  salesData.forEach(({ quarter, regions }) => {
    console.log(`    ${quarter} Performance:`);
    
    Object.entries(regions).forEach(([regionName, { sales, target }]) => {
      const performance = ((sales / target) * 100).toFixed(1);
      const status = sales >= target ? '✓' : '✗';
      console.log(`      ${regionName}: ${sales}/${target} (${performance}%) ${status}`);
    });
  });
  
  // Destructuring with optional chaining simulation (pre-optional chaining)
  function safeExtract(obj, path) {
    const pathArray = path.split('.');
    let current = obj;
    
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  const deepObject = {
    user: {
      profile: {
        personal: {
          name: 'Alice',
          age: 25
        },
        professional: {
          title: 'Developer',
          company: 'Tech Corp'
        }
      }
    }
  };
  
  // Safe extraction from deeply nested objects
  const userName = safeExtract(deepObject, 'user.profile.personal.name');
  const userTitle = safeExtract(deepObject, 'user.profile.professional.title');
  const missingData = safeExtract(deepObject, 'user.profile.social.twitter');
  
  console.log('  Safe deep extraction:');
  console.log('    Name:', userName);
  console.log('    Title:', userTitle);
  console.log('    Missing data:', missingData);
  
  // Performance considerations demonstration
  function performanceTest() {
    const testObject = {
      a: 1, b: 2, c: 3, d: 4, e: 5,
      nested: { x: 10, y: 20, z: 30 }
    };
    
    const iterations = 1000000;
    
    // Test 1: Direct property access
    console.time('Direct access');
    for (let i = 0; i < iterations; i++) {
      const a = testObject.a;
      const b = testObject.b;
      const c = testObject.c;
    }
    console.timeEnd('Direct access');
    
    // Test 2: Destructuring
    console.time('Destructuring');
    for (let i = 0; i < iterations; i++) {
      const { a, b, c } = testObject;
    }
    console.timeEnd('Destructuring');
    
    // Test 3: Destructuring with defaults
    console.time('Destructuring with defaults');
    for (let i = 0; i < iterations; i++) {
      const { a = 0, b = 0, c = 0, f = 0 } = testObject;
    }
    console.timeEnd('Destructuring with defaults');
  }
  
  console.log('  Performance comparison (1M iterations):');
  performanceTest();
  
  /**
   * BEST PRACTICES AND COMMON PITFALLS
   */
  
  console.log('\nBest Practices:');
  
  // 1. Use meaningful variable names when renaming
  const { firstName: first } = { firstName: 'Alice' }; // Not great
  const { firstName: userFirstName } = { firstName: 'Alice' }; // Better
  
  // 2. Provide defaults for optional properties
  const { theme = 'light', debug = false } = {};
  
  // 3. Be careful with nested destructuring of potentially undefined objects
  const config = undefined;
  // This would throw an error:
  // const { server: { host } } = config;
  
  // Safe approach:
  const { server: { host } = {} } = config || {};
  
  // 4. Use destructuring for clean function signatures
  function goodFunction({ name, options = {} }) { /* ... */ }
  // Better than: function badFunction(name, options) { options = options || {}; /* ... */ }
  
  console.log('    Best practices applied in examples above');
  console.log('    - Meaningful variable names');
  console.log('    - Safe defaults for missing properties');  
  console.log('    - Proper error handling');
  console.log('    - Performance-conscious patterns');
}

demonstrateAdvancedPatterns();

/**
 * SUMMARY OF DESTRUCTURING PATTERNS:
 * 
 * 1. Array Destructuring:
 *    - Position-based extraction from arrays and array-like objects
 *    - Elegant variable swapping and multiple assignment
 *    - Rest patterns for collecting remaining elements
 *    - Perfect for function returns and coordinate systems
 * 
 * 2. Object Destructuring:
 *    - Property-based extraction with optional renaming
 *    - Nested destructuring for complex object structures
 *    - Default values and computed property names
 *    - Excellent for API responses and configuration objects
 * 
 * 3. Advanced Patterns:
 *    - Mixed array/object destructuring for complex data
 *    - Function parameter destructuring for clean APIs
 *    - Dynamic property extraction with computed names
 *    - Performance considerations for hot code paths
 * 
 * 4. Best Practices:
 *    - Provide meaningful names when renaming properties
 *    - Use defaults to handle missing or undefined values
 *    - Be cautious with deeply nested destructuring
 *    - Consider performance implications in tight loops
 * 
 * Interview Focus:
 * - Show understanding of when to use each pattern
 * - Demonstrate knowledge of default values and rest patterns
 * - Explain performance implications and best practices
 * - Use destructuring for clean, readable function parameters
 */

setTimeout(() => {
  console.log('\nDestructuring patterns demonstration complete!');
  console.log('Next: See new-data-types.js for Map, Set, Symbol, and class syntax');
}, 100);