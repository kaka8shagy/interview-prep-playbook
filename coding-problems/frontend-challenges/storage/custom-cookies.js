/**
 * File: custom-cookies.js
 * Description: Custom cookie management implementation with advanced features
 *
 * Learning objectives:
 * - Understand HTTP cookie mechanics and browser storage
 * - Learn cookie parsing, serialization, and security features
 * - See cross-browser compatibility and edge case handling
 *
 * Time Complexity: O(n) for parsing all cookies, O(1) for single operations
 * Space Complexity: O(n) where n is total cookie data size
 */

// =======================
// Approach 1: Basic Cookie Manager
// =======================

/**
 * Basic cookie management class with core functionality
 * Handles setting, getting, and removing cookies with options
 *
 * Mental model: Abstract cookie string manipulation into clean API
 */
class CookieManager {
  constructor(options = {}) {
    this.defaults = {
      path: '/',
      domain: null,
      secure: false,
      sameSite: 'Lax',
      httpOnly: false // Note: Can't be set via JavaScript
    };

    // Merge with provided defaults
    this.defaults = { ...this.defaults, ...options };
  }

  /**
   * Set a cookie with options
   */
  set(name, value, options = {}) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Cookie name must be a non-empty string');
    }

    // Merge with defaults
    const config = { ...this.defaults, ...options };

    // Build cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Add expiration
    if (config.expires) {
      if (config.expires instanceof Date) {
        cookieString += `; expires=${config.expires.toUTCString()}`;
      } else if (typeof config.expires === 'number') {
        // Treat as days from now
        const date = new Date();
        date.setTime(date.getTime() + (config.expires * 24 * 60 * 60 * 1000));
        cookieString += `; expires=${date.toUTCString()}`;
      }
    }

    // Add max-age (takes precedence over expires)
    if (config.maxAge !== undefined) {
      cookieString += `; max-age=${config.maxAge}`;
    }

    // Add path
    if (config.path) {
      cookieString += `; path=${config.path}`;
    }

    // Add domain
    if (config.domain) {
      cookieString += `; domain=${config.domain}`;
    }

    // Add secure flag
    if (config.secure) {
      cookieString += '; secure';
    }

    // Add SameSite
    if (config.sameSite) {
      cookieString += `; samesite=${config.sameSite}`;
    }

    try {
      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.warn('Failed to set cookie:', error.message);
      return false;
    }
  }

  /**
   * Get a cookie value by name
   */
  get(name) {
    if (typeof document === 'undefined') {
      return null; // Node.js environment
    }

    const encodedName = encodeURIComponent(name);
    const cookies = this.getAll();

    return cookies[encodedName] !== undefined
      ? decodeURIComponent(cookies[encodedName])
      : null;
  }

  /**
   * Get all cookies as an object
   */
  getAll() {
    if (typeof document === 'undefined') {
      return {};
    }

    const cookies = {};

    if (document.cookie && document.cookie.trim() !== '') {
      const cookiePairs = document.cookie.split(';');

      cookiePairs.forEach(pair => {
        const [name, ...valueParts] = pair.split('=');
        const value = valueParts.join('='); // Handle values with '=' in them

        if (name && name.trim()) {
          const cleanName = name.trim();
          const cleanValue = value ? value.trim() : '';
          cookies[cleanName] = cleanValue;
        }
      });
    }

    return cookies;
  }

  /**
   * Remove a cookie
   */
  remove(name, options = {}) {
    // Set cookie with past expiration date
    const removeOptions = {
      ...options,
      expires: new Date(0), // January 1, 1970
      maxAge: -1
    };

    return this.set(name, '', removeOptions);
  }

  /**
   * Check if a cookie exists
   */
  has(name) {
    return this.get(name) !== null;
  }

  /**
   * Get all cookie names
   */
  getNames() {
    const cookies = this.getAll();
    return Object.keys(cookies).map(name => decodeURIComponent(name));
  }

  /**
   * Clear all cookies (that can be cleared)
   */
  clear(options = {}) {
    const names = this.getNames();
    let removedCount = 0;

    names.forEach(name => {
      if (this.remove(name, options)) {
        removedCount++;
      }
    });

    return removedCount;
  }
}

// =======================
// Approach 2: Advanced Cookie Store
// =======================

/**
 * Advanced cookie store with JSON support, encryption, and validation
 * Provides type-safe operations and advanced features
 */
class AdvancedCookieStore extends CookieManager {
  constructor(options = {}) {
    super(options);

    this.jsonPrefix = '_json_';
    this.encryptedPrefix = '_enc_';
    this.validators = new Map();
    this.listeners = new Map();

    // Start monitoring for changes
    this.startChangeMonitoring();
  }

  /**
   * Set JSON cookie with automatic serialization
   */
  setJSON(name, value, options = {}) {
    try {
      const serialized = JSON.stringify(value);
      const prefixedName = this.jsonPrefix + name;

      return this.set(prefixedName, serialized, options);
    } catch (error) {
      console.warn('Failed to serialize JSON for cookie:', error.message);
      return false;
    }
  }

  /**
   * Get JSON cookie with automatic deserialization
   */
  getJSON(name) {
    const prefixedName = this.jsonPrefix + name;
    const value = this.get(prefixedName);

    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Failed to parse JSON from cookie:', error.message);
      return null;
    }
  }

  /**
   * Remove JSON cookie
   */
  removeJSON(name, options = {}) {
    const prefixedName = this.jsonPrefix + name;
    return this.remove(prefixedName, options);
  }

  /**
   * Set encrypted cookie (demo encryption - use proper crypto in production)
   */
  setEncrypted(name, value, key, options = {}) {
    try {
      const encrypted = this.simpleEncrypt(JSON.stringify(value), key);
      const prefixedName = this.encryptedPrefix + name;

      return this.set(prefixedName, encrypted, options);
    } catch (error) {
      console.warn('Failed to encrypt cookie:', error.message);
      return false;
    }
  }

  /**
   * Get encrypted cookie (demo decryption)
   */
  getEncrypted(name, key) {
    const prefixedName = this.encryptedPrefix + name;
    const encrypted = this.get(prefixedName);

    if (encrypted === null) return null;

    try {
      const decrypted = this.simpleDecrypt(encrypted, key);
      return JSON.parse(decrypted);
    } catch (error) {
      console.warn('Failed to decrypt cookie:', error.message);
      return null;
    }
  }

  /**
   * Simple encryption (demo - use proper encryption in production)
   */
  simpleEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    return btoa(result);
  }

  /**
   * Simple decryption
   */
  simpleDecrypt(encrypted, key) {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    return result;
  }

  /**
   * Add validator for cookie values
   */
  addValidator(name, validator) {
    if (typeof validator !== 'function') {
      throw new Error('Validator must be a function');
    }

    this.validators.set(name, validator);
    return this;
  }

  /**
   * Set cookie with validation
   */
  setWithValidation(name, value, options = {}) {
    const validator = this.validators.get(name);

    if (validator) {
      try {
        const isValid = validator(value);
        if (!isValid) {
          throw new Error(`Validation failed for cookie: ${name}`);
        }
      } catch (error) {
        console.warn('Cookie validation error:', error.message);
        return false;
      }
    }

    return this.set(name, value, options);
  }

  /**
   * Batch operations
   */
  setBatch(cookies, options = {}) {
    const results = {};

    Object.entries(cookies).forEach(([name, value]) => {
      results[name] = this.set(name, value, options);
    });

    return results;
  }

  /**
   * Get multiple cookies at once
   */
  getBatch(names) {
    const results = {};

    names.forEach(name => {
      results[name] = this.get(name);
    });

    return results;
  }

  /**
   * Add change listener
   */
  addChangeListener(name, callback) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set());
    }

    this.listeners.get(name).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(name);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(name);
        }
      }
    };
  }

  /**
   * Start monitoring for cookie changes
   */
  startChangeMonitoring() {
    if (typeof document === 'undefined') return;

    let lastCookies = this.getAll();

    const checkForChanges = () => {
      const currentCookies = this.getAll();

      // Check for changes
      Object.keys({ ...lastCookies, ...currentCookies }).forEach(name => {
        const oldValue = lastCookies[name];
        const newValue = currentCookies[name];

        if (oldValue !== newValue) {
          const decodedName = decodeURIComponent(name);
          const listeners = this.listeners.get(decodedName);

          if (listeners) {
            const event = {
              name: decodedName,
              oldValue: oldValue ? decodeURIComponent(oldValue) : null,
              newValue: newValue ? decodeURIComponent(newValue) : null,
              action: !oldValue ? 'set' : !newValue ? 'remove' : 'change'
            };

            listeners.forEach(callback => {
              try {
                callback(event);
              } catch (error) {
                console.warn('Cookie change listener error:', error);
              }
            });
          }
        }
      });

      lastCookies = currentCookies;
    };

    // Check every 100ms (can be optimized based on needs)
    this.changeMonitorInterval = setInterval(checkForChanges, 100);
  }

  /**
   * Stop change monitoring
   */
  stopChangeMonitoring() {
    if (this.changeMonitorInterval) {
      clearInterval(this.changeMonitorInterval);
      this.changeMonitorInterval = null;
    }
  }

  /**
   * Get cookie statistics and information
   */
  getStats() {
    const cookies = this.getAll();
    const names = Object.keys(cookies);

    let totalSize = 0;
    let jsonCount = 0;
    let encryptedCount = 0;

    const cookieInfo = names.map(name => {
      const value = cookies[name];
      const size = name.length + (value ? value.length : 0);
      totalSize += size;

      const decodedName = decodeURIComponent(name);
      const type = decodedName.startsWith(this.jsonPrefix) ? 'json' :
                   decodedName.startsWith(this.encryptedPrefix) ? 'encrypted' : 'string';

      if (type === 'json') jsonCount++;
      if (type === 'encrypted') encryptedCount++;

      return {
        name: decodedName,
        size,
        type,
        hasValidator: this.validators.has(decodedName),
        hasListeners: this.listeners.has(decodedName)
      };
    });

    return {
      totalCookies: names.length,
      totalSize,
      jsonCount,
      encryptedCount,
      averageSize: names.length > 0 ? Math.round(totalSize / names.length) : 0,
      cookies: cookieInfo,
      listeners: this.listeners.size,
      validators: this.validators.size
    };
  }

  /**
   * Import cookies from object
   */
  import(cookieObject, options = {}) {
    const results = {};

    Object.entries(cookieObject).forEach(([name, value]) => {
      try {
        results[name] = this.set(name, value, options);
      } catch (error) {
        results[name] = false;
        console.warn(`Failed to import cookie ${name}:`, error.message);
      }
    });

    return results;
  }

  /**
   * Export cookies to object
   */
  export(names = null) {
    const cookies = this.getAll();
    const result = {};

    const targetNames = names || Object.keys(cookies);

    targetNames.forEach(name => {
      const encodedName = encodeURIComponent(name);
      if (cookies[encodedName] !== undefined) {
        result[name] = decodeURIComponent(cookies[encodedName]);
      }
    });

    return result;
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.stopChangeMonitoring();
    this.listeners.clear();
    this.validators.clear();
  }
}

// =======================
// Approach 3: Cookie Utilities
// =======================

/**
 * Utility functions for cookie operations
 */
const CookieUtils = {
  /**
   * Parse cookie string into object
   */
  parse(cookieString) {
    const cookies = {};

    if (!cookieString || typeof cookieString !== 'string') {
      return cookies;
    }

    cookieString.split(';').forEach(pair => {
      const [name, ...valueParts] = pair.split('=');
      const value = valueParts.join('=');

      if (name && name.trim()) {
        const cleanName = decodeURIComponent(name.trim());
        const cleanValue = value ? decodeURIComponent(value.trim()) : '';
        cookies[cleanName] = cleanValue;
      }
    });

    return cookies;
  },

  /**
   * Serialize object to cookie string
   */
  serialize(name, value, options = {}) {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    return cookieString;
  },

  /**
   * Check if cookies are supported
   */
  isSupported() {
    if (typeof document === 'undefined') return false;

    try {
      const testName = '_cookie_test_';
      const testValue = 'test';

      document.cookie = `${testName}=${testValue}`;
      const supported = document.cookie.includes(`${testName}=${testValue}`);

      // Clean up test cookie
      document.cookie = `${testName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      return supported;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get remaining space for cookies (approximate)
   */
  getRemainingSpace() {
    if (typeof document === 'undefined') return 0;

    const currentSize = document.cookie.length;
    const maxSize = 4096; // Approximate limit per domain

    return Math.max(0, maxSize - currentSize);
  },

  /**
   * Validate cookie name
   */
  isValidName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      return false;
    }

    // RFC 6265 compliant name validation
    const invalidChars = /[\s\t\r\n\f;,=]/;
    return !invalidChars.test(name);
  },

  /**
   * Sanitize cookie value
   */
  sanitizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }

    // Remove or escape problematic characters
    return value.replace(/[;,\r\n]/g, '');
  }
};

// Create default instances
const cookies = new CookieManager();
const advancedCookies = new AdvancedCookieStore();

// Export for use in other modules
module.exports = {
  CookieManager,
  AdvancedCookieStore,
  CookieUtils,
  cookies,
  advancedCookies
};
