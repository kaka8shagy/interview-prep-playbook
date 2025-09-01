/**
 * File: path-access.js
 * Description: Deep object property access using string paths
 * 
 * Learning objectives:
 * - Understand nested object traversal algorithms
 * - Learn path parsing and normalization techniques
 * - See safe property access patterns
 * 
 * Time Complexity: O(d) where d is path depth
 * Space Complexity: O(1) for get, O(d) for set (intermediate objects)
 */

/**
 * Gets value at object path, returns defaultValue if path doesn't exist
 * 
 * Mental model: "Navigate deep object structures safely"
 * Prevents "Cannot read property of undefined" errors
 */
function get(object, path, defaultValue) {
  // Input validation - handle non-objects gracefully
  if (!object || typeof object !== 'object') {
    return defaultValue;
  }
  
  // Convert string path to array of keys
  // Handle both 'a.b.c' and 'a[0].b' formats
  const keys = typeof path === 'string' ? 
    path.replace(/\[(\d+)\]/g, '.$1').split('.') : 
    Array.isArray(path) ? path : [path];
  
  let current = object;
  
  // Traverse the object following the path
  for (const key of keys) {
    // Stop traversal if we hit null/undefined at any point
    if (current == null) {
      return defaultValue;
    }
    
    current = current[key];
  }
  
  // Return defaultValue if final result is undefined
  return current === undefined ? defaultValue : current;
}

/**
 * Sets value at object path, creating intermediate objects as needed
 * 
 * Mental model: "Build object structure on-demand while setting value"
 * Useful for dynamic object construction and API response building
 */
function set(object, path, value) {
  // Input validation - must be an object to modify
  if (!object || typeof object !== 'object') {
    return object;
  }
  
  // Convert string path to array of keys
  const keys = typeof path === 'string' ? 
    path.replace(/\[(\d+)\]/g, '.$1').split('.') : 
    Array.isArray(path) ? path : [path];
  
  let current = object;
  
  // Navigate to the parent of the target property
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // Create intermediate object if it doesn't exist or isn't an object
    if (!current[key] || typeof current[key] !== 'object') {
      // Use array if next key is numeric, object otherwise
      const nextKey = keys[i + 1];
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    
    current = current[key];
  }
  
  // Set the final value
  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;
  
  return object;
}

// =======================
// Usage Examples
// =======================

// Example 1: Safe API response access
function safeApiAccess() {
  const apiResponse = {
    user: {
      profile: {
        name: 'John Doe',
        settings: {
          theme: 'dark',
          notifications: true
        }
      }
    }
  };
  
  // Safe access - won't throw errors even if structure changes
  const userName = get(apiResponse, 'user.profile.name', 'Unknown User');
  const theme = get(apiResponse, 'user.profile.settings.theme', 'light');
  const missing = get(apiResponse, 'user.profile.avatar.url', '/default-avatar.png');
  
  console.log({ userName, theme, missing });
  return { userName, theme, missing };
}

// Example 2: Dynamic object construction
function buildNestedConfig() {
  const config = {};
  
  // Build complex configuration dynamically
  set(config, 'database.host', 'localhost');
  set(config, 'database.port', 5432);
  set(config, 'cache.redis.host', 'redis-server');
  set(config, 'cache.redis.ttl', 3600);
  set(config, 'features[0].name', 'analytics');
  set(config, 'features[0].enabled', true);
  
  console.log('Built config:', JSON.stringify(config, null, 2));
  return config;
}

// Example 3: Form field validation helper
function validateFormField(formData, fieldPath, validator) {
  const value = get(formData, fieldPath);
  
  if (value === undefined) {
    return { valid: false, error: 'Field is required' };
  }
  
  return validator(value);
}

// Example usage of validation
function exampleValidation() {
  const formData = {
    user: {
      contact: {
        email: 'john@example.com'
      }
    }
  };
  
  const emailValidation = validateFormField(
    formData, 
    'user.contact.email', 
    (email) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      return { 
        valid: isValid, 
        error: isValid ? null : 'Invalid email format' 
      };
    }
  );
  
  console.log('Email validation:', emailValidation);
  return emailValidation;
}

// Export for use in other modules
module.exports = {
  get,
  set,
  safeApiAccess,
  buildNestedConfig,
  validateFormField,
  exampleValidation
};