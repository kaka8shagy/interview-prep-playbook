/**
 * File: pick-omit.js
 * Description: Object property selection and exclusion utilities
 * 
 * Learning objectives:
 * - Understand object property manipulation patterns
 * - Learn efficient key filtering techniques
 * - See data sanitization and API response filtering
 * 
 * Time Complexity: O(n) where n is number of object properties
 * Space Complexity: O(k) where k is selected/remaining properties
 */

/**
 * Creates an object with only the specified properties from source object
 * 
 * Mental model: "Select only what you need from an object"
 * Useful for API response filtering, form data extraction, and data sanitization
 */
function pick(object, keys) {
  // Input validation - handle non-objects gracefully
  if (!object || typeof object !== 'object') {
    return {};
  }
  
  // Normalize keys to array for consistent processing
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const result = {};
  
  // Only include properties that exist in the source object
  for (const key of keysArray) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  
  return result;
}

/**
 * Creates an object with specified properties excluded from source object
 * 
 * Mental model: "Remove unwanted properties from an object"
 * Useful for removing sensitive data, cleaning API responses, and data filtering
 */
function omit(object, keys) {
  // Input validation - handle non-objects gracefully
  if (!object || typeof object !== 'object') {
    return {};
  }
  
  // Normalize keys and use Set for O(1) lookup performance
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const keysSet = new Set(keysArray);
  const result = {};
  
  // Copy all properties except omitted ones
  for (const key in object) {
    if (object.hasOwnProperty(key) && !keysSet.has(key)) {
      result[key] = object[key];
    }
  }
  
  return result;
}

// =======================
// Usage Examples
// =======================

// Example 1: API response filtering with pick
function filterApiResponse() {
  const userResponse = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    password: 'secret123',
    internalNotes: 'Admin user',
    createdAt: '2023-01-01',
    lastLogin: '2023-12-01'
  };
  
  // Only send public data to frontend
  const publicUser = pick(userResponse, ['id', 'username', 'email', 'lastLogin']);
  console.log('Public user data:', publicUser);
  
  return publicUser;
}

// Example 2: Form data sanitization with omit
function sanitizeFormData() {
  const formData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
    csrf_token: 'abc123',
    submit: 'Submit'
  };
  
  // Remove non-essential fields before processing
  const cleanData = omit(formData, ['confirmPassword', 'csrf_token', 'submit']);
  console.log('Clean form data:', cleanData);
  
  return cleanData;
}

// Example 3: Database projection simulation
function simulateDBProjection() {
  const documents = [
    { _id: 1, name: 'Alice', age: 25, salary: 50000, ssn: '123-45-6789' },
    { _id: 2, name: 'Bob', age: 30, salary: 60000, ssn: '987-65-4321' },
    { _id: 3, name: 'Carol', age: 35, salary: 70000, ssn: '456-78-9123' }
  ];
  
  // Simulate MongoDB-style projection: only return name and age
  const projectedDocs = documents.map(doc => pick(doc, ['name', 'age']));
  console.log('Projected documents:', projectedDocs);
  
  return projectedDocs;
}

// Export for use in other modules
module.exports = {
  pick,
  omit,
  filterApiResponse,
  sanitizeFormData,
  simulateDBProjection
};