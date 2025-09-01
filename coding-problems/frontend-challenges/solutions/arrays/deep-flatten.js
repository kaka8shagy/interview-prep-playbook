/**
 * File: deep-flatten.js
 * Description: Multiple implementations of deep array flattening with detailed explanations
 * 
 * Learning objectives:
 * - Understand different flattening strategies
 * - Learn recursive vs iterative approaches
 * - See performance optimizations and edge cases
 * 
 * Time Complexity: O(n) where n is total number of elements
 * Space Complexity: O(d) where d is maximum depth (recursive), O(n) for iterative
 */

// =======================
// Approach 1: Recursive Deep Flatten
// =======================

/**
 * Recursive deep flatten implementation
 * Traverses nested arrays and flattens them completely
 * 
 * Mental model: Like unpacking nested boxes - keep opening until
 * you find individual items, then collect them all
 */
function deepFlattenRecursive(arr) {
  const result = [];
  
  // Process each element in the array
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    
    // Check if current element is an array
    if (Array.isArray(element)) {
      // Recursively flatten the nested array and spread results
      // This is the key insight - recursion handles arbitrary depth
      result.push(...deepFlattenRecursive(element));
    } else {
      // Base case - element is not an array, add to result
      result.push(element);
    }
  }
  
  return result;
}

// =======================
// Approach 2: Iterative with Stack
// =======================

/**
 * Iterative deep flatten using stack data structure
 * Avoids recursion depth limits and provides better memory control
 * 
 * Stack-based approach simulates recursive calls iteratively
 */
function deepFlattenIterative(arr) {
  const result = [];
  const stack = [...arr]; // Initialize stack with input array elements
  
  // Process stack until empty
  while (stack.length > 0) {
    // Pop element from stack (LIFO - Last In, First Out)
    const element = stack.pop();
    
    if (Array.isArray(element)) {
      // If element is array, push all its elements back to stack
      // This spreads nested array elements for processing
      stack.push(...element);
    } else {
      // Non-array element - add to beginning of result
      // We use unshift because stack processes in reverse order
      result.unshift(element);
    }
  }
  
  return result;
}

// =======================
// Approach 3: Generator-based Flatten
// =======================

/**
 * Generator-based deep flatten for memory efficiency
 * Yields elements one at a time instead of building entire result array
 * 
 * Benefits: Memory efficient for large arrays, lazy evaluation
 */
function* deepFlattenGenerator(arr) {
  for (const element of arr) {
    if (Array.isArray(element)) {
      // Recursively yield from nested array
      // yield* delegates to another generator
      yield* deepFlattenGenerator(element);
    } else {
      // Yield individual element
      yield element;
    }
  }
}

// Wrapper function to convert generator to array
function deepFlattenFromGenerator(arr) {
  return Array.from(deepFlattenGenerator(arr));
}

// =======================
// Approach 4: Configurable Depth Flatten
// =======================

/**
 * Flatten with configurable depth limit
 * Allows partial flattening for performance or specific requirements
 */
function deepFlattenWithDepth(arr, depth = Infinity) {
  // Base case - no more depth to flatten
  if (depth <= 0) {
    return arr.slice(); // Return shallow copy
  }
  
  const result = [];
  
  for (const element of arr) {
    if (Array.isArray(element)) {
      // Recursively flatten with reduced depth
      // This controls how deep the flattening goes
      result.push(...deepFlattenWithDepth(element, depth - 1));
    } else {
      result.push(element);
    }
  }
  
  return result;
}

// =======================
// Approach 5: TypeScript-style with Type Predicates
// =======================

/**
 * Type-aware flatten that preserves type information
 * Useful in TypeScript environments or when type checking is important
 */
function deepFlattenTyped(arr, typeCheck = null) {
  const result = [];
  
  function isArrayLike(element) {
    // More robust array detection including array-like objects
    return Array.isArray(element) || 
           (element && typeof element === 'object' && 
            typeof element.length === 'number' && 
            element.length >= 0);
  }
  
  function shouldFlatten(element) {
    // Custom type checking if provided
    if (typeCheck) {
      return typeCheck(element);
    }
    return isArrayLike(element);
  }
  
  for (const element of arr) {
    if (shouldFlatten(element)) {
      // Convert array-like objects to arrays and flatten
      const arrayElement = Array.isArray(element) ? element : Array.from(element);
      result.push(...deepFlattenTyped(arrayElement, typeCheck));
    } else {
      result.push(element);
    }
  }
  
  return result;
}

// =======================
// Approach 6: Performance-Optimized Flatten
// =======================

/**
 * Performance-optimized version with pre-allocation and minimal operations
 * Uses size estimation to pre-allocate result array
 */
function deepFlattenOptimized(arr) {
  // Estimate total size for pre-allocation
  function estimateSize(array, depth = 0) {
    if (depth > 100) return array.length; // Prevent infinite recursion
    
    let size = 0;
    for (const element of array) {
      if (Array.isArray(element)) {
        size += estimateSize(element, depth + 1);
      } else {
        size++;
      }
    }
    return size;
  }
  
  const estimatedSize = estimateSize(arr);
  const result = new Array(estimatedSize); // Pre-allocate for performance
  let index = 0;
  
  function flattenInto(array) {
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (Array.isArray(element)) {
        flattenInto(element);
      } else {
        result[index++] = element;
      }
    }
  }
  
  flattenInto(arr);
  
  // Trim array to actual size (estimation might be off)
  result.length = index;
  return result;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Deep Flatten Examples ===');

// Test data with various nesting levels
const testArray = [1, [2, 3], [4, [5, 6]], [[7, [8, 9]], 10], 11];
const veryNested = [1, [2, [3, [4, [5, [6, 7]]]]]];
const mixedTypes = [1, ['a', [true, [null, [undefined, {}]]]]];

// Test all approaches
console.log('Original:', testArray);
console.log('Recursive:', deepFlattenRecursive(testArray));
console.log('Iterative:', deepFlattenIterative(testArray));
console.log('Generator:', deepFlattenFromGenerator(testArray));
console.log('Depth 2:', deepFlattenWithDepth(testArray, 2));
console.log('Optimized:', deepFlattenOptimized(testArray));

console.log('\n=== Very Nested Array ===');
console.log('Original:', veryNested);
console.log('Flattened:', deepFlattenRecursive(veryNested));

console.log('\n=== Mixed Types ===');
console.log('Original:', mixedTypes);
console.log('Flattened:', deepFlattenRecursive(mixedTypes));

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Flattening nested navigation menus
 * Common in CMS systems where menus can be arbitrarily nested
 */
function createNavigationFlattener() {
  function flattenNavigation(navItems, parentPath = '') {
    const result = [];
    
    for (const item of navItems) {
      const currentPath = parentPath ? `${parentPath}/${item.path}` : item.path;
      
      // Create flattened item
      const flatItem = {
        ...item,
        fullPath: currentPath,
        level: parentPath.split('/').length,
        hasChildren: Array.isArray(item.children) && item.children.length > 0
      };
      
      // Add current item (without children)
      const { children, ...itemWithoutChildren } = flatItem;
      result.push(itemWithoutChildren);
      
      // Recursively process children
      if (item.children && Array.isArray(item.children)) {
        result.push(...flattenNavigation(item.children, currentPath));
      }
    }
    
    return result;
  }
  
  return {
    flatten: flattenNavigation,
    
    // Create breadcrumb from flattened nav
    createBreadcrumb: (flatNav, targetPath) => {
      return flatNav
        .filter(item => targetPath.startsWith(item.fullPath))
        .sort((a, b) => a.level - b.level);
    },
    
    // Find all leaf nodes (items without children)
    findLeafNodes: (flatNav) => {
      return flatNav.filter(item => !item.hasChildren);
    }
  };
}

/**
 * Use Case 2: Flattening nested form validation errors
 * Converts nested validation errors into flat list for display
 */
function createErrorFlattener() {
  function flattenErrors(errors, path = '') {
    const result = [];
    
    if (Array.isArray(errors)) {
      // Handle array of errors
      errors.forEach((error, index) => {
        const currentPath = path ? `${path}[${index}]` : `[${index}]`;
        result.push(...flattenErrors(error, currentPath));
      });
    } else if (errors && typeof errors === 'object') {
      // Handle nested object errors
      Object.keys(errors).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        const error = errors[key];
        
        if (typeof error === 'string') {
          // Leaf error message
          result.push({ path: currentPath, message: error });
        } else {
          // Nested errors - recurse
          result.push(...flattenErrors(error, currentPath));
        }
      });
    } else if (typeof errors === 'string') {
      // Simple string error
      result.push({ path, message: errors });
    }
    
    return result;
  }
  
  return {
    flatten: flattenErrors,
    
    // Group errors by field prefix
    groupByField: (flatErrors) => {
      const groups = {};
      flatErrors.forEach(error => {
        const fieldName = error.path.split('.')[0].split('[')[0];
        if (!groups[fieldName]) groups[fieldName] = [];
        groups[fieldName].push(error);
      });
      return groups;
    },
    
    // Convert to display format
    toDisplayFormat: (flatErrors) => {
      return flatErrors.map(error => ({
        field: error.path,
        message: error.message,
        displayName: error.path.replace(/\./g, ' → ').replace(/\[(\d+)\]/g, '[$1]')
      }));
    }
  };
}

/**
 * Use Case 3: Flattening nested component props
 * Useful for React components with deeply nested prop structures
 */
function createPropsFlattener() {
  function flattenProps(props, prefix = '', separator = '.') {
    const result = {};
    
    Object.keys(props).forEach(key => {
      const value = props[key];
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value) && 
          !(value instanceof Date) && !(value instanceof RegExp)) {
        // Recursively flatten nested objects
        Object.assign(result, flattenProps(value, newKey, separator));
      } else {
        // Leaf value - add to result
        result[newKey] = value;
      }
    });
    
    return result;
  }
  
  function unflattenProps(flatProps, separator = '.') {
    const result = {};
    
    Object.keys(flatProps).forEach(key => {
      const keys = key.split(separator);
      let current = result;
      
      // Navigate/create nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }
      
      // Set leaf value
      current[keys[keys.length - 1]] = flatProps[key];
    });
    
    return result;
  }
  
  return {
    flatten: flattenProps,
    unflatten: unflattenProps,
    
    // Get all prop paths
    getPropPaths: (props) => {
      const flatProps = flattenProps(props);
      return Object.keys(flatProps).sort();
    },
    
    // Filter props by prefix
    filterByPrefix: (props, prefix) => {
      const flatProps = flattenProps(props);
      const filtered = {};
      
      Object.keys(flatProps).forEach(key => {
        if (key.startsWith(prefix)) {
          filtered[key] = flatProps[key];
        }
      });
      
      return unflattenProps(filtered);
    }
  };
}

/**
 * Use Case 4: Data structure transformation for APIs
 * Convert nested data for different API formats
 */
function createDataTransformer() {
  function flattenForAPI(data, config = {}) {
    const { 
      arrayStrategy = 'index', // 'index' or 'bracket'
      delimiter = '.',
      maxDepth = Infinity 
    } = config;
    
    function flatten(obj, prefix = '', depth = 0) {
      if (depth >= maxDepth) {
        return { [prefix]: obj };
      }
      
      const result = {};
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const key = arrayStrategy === 'bracket' 
            ? `${prefix}[${index}]`
            : `${prefix}${prefix ? delimiter : ''}${index}`;
          
          if (typeof item === 'object' && item !== null) {
            Object.assign(result, flatten(item, key, depth + 1));
          } else {
            result[key] = item;
          }
        });
      } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          const newKey = prefix ? `${prefix}${delimiter}${key}` : key;
          const value = obj[key];
          
          if (typeof value === 'object' && value !== null) {
            Object.assign(result, flatten(value, newKey, depth + 1));
          } else {
            result[newKey] = value;
          }
        });
      } else {
        result[prefix] = obj;
      }
      
      return result;
    }
    
    return flatten(data);
  }
  
  return {
    flatten: flattenForAPI,
    
    // Convert to form data format
    toFormData: (data) => {
      const flattened = flattenForAPI(data, { arrayStrategy: 'bracket' });
      const formData = new FormData();
      
      Object.keys(flattened).forEach(key => {
        const value = flattened[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      return formData;
    },
    
    // Convert to URL search params
    toURLParams: (data) => {
      const flattened = flattenForAPI(data);
      return new URLSearchParams(flattened);
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Navigation flattener
const navFlattener = createNavigationFlattener();
const navData = [
  {
    path: 'home',
    title: 'Home',
    children: [
      { path: 'dashboard', title: 'Dashboard' },
      { path: 'profile', title: 'Profile' }
    ]
  },
  {
    path: 'admin',
    title: 'Admin',
    children: [
      {
        path: 'users',
        title: 'Users',
        children: [
          { path: 'list', title: 'User List' },
          { path: 'roles', title: 'User Roles' }
        ]
      }
    ]
  }
];

const flatNav = navFlattener.flatten(navData);
console.log('Flattened navigation:', flatNav.map(item => ({ fullPath: item.fullPath, title: item.title })));

// Error flattener
const errorFlattener = createErrorFlattener();
const nestedErrors = {
  user: {
    name: 'Name is required',
    address: {
      street: 'Street address is required',
      coordinates: ['Invalid latitude', 'Invalid longitude']
    }
  },
  settings: 'Invalid configuration'
};

const flatErrors = errorFlattener.flatten(nestedErrors);
console.log('Flattened errors:', flatErrors);

// Export all implementations
module.exports = {
  deepFlattenRecursive,
  deepFlattenIterative,
  deepFlattenGenerator,
  deepFlattenFromGenerator,
  deepFlattenWithDepth,
  deepFlattenTyped,
  deepFlattenOptimized,
  createNavigationFlattener,
  createErrorFlattener,
  createPropsFlattener,
  createDataTransformer
};

/**
 * Key Interview Points:
 * 
 * 1. Recursive vs Iterative:
 *    - Recursive: Cleaner code, but stack overflow risk
 *    - Iterative: Better memory control, handles deep nesting
 *    - Generator: Memory efficient, lazy evaluation
 * 
 * 2. Performance Considerations:
 *    - Pre-allocation vs dynamic sizing
 *    - Array operations cost (push vs unshift)
 *    - Depth-first vs breadth-first traversal
 * 
 * 3. Edge Cases:
 *    - Empty arrays and null values
 *    - Circular references (need cycle detection)
 *    - Array-like objects vs true arrays
 *    - Mixed data types preservation
 * 
 * 4. Real-world Applications:
 *    - Navigation menu flattening
 *    - Form validation error processing
 *    - API data transformation
 *    - Tree structure linearization
 * 
 * 5. Alternative Approaches:
 *    - Native Array.prototype.flat() for simple cases
 *    - Libraries like Lodash for complex scenarios
 *    - Streaming for very large datasets
 */