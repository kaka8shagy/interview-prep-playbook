/**
 * File: html-encoding.js
 * Description: Multiple approaches to HTML encode/decode strings for safe DOM insertion
 * 
 * Learning objectives:
 * - Understand XSS prevention through proper encoding
 * - Learn different HTML entity encoding strategies
 * - See browser API vs manual implementation trade-offs
 * 
 * Time Complexity: O(n) where n is string length
 * Space Complexity: O(n) for output string
 */

// =======================
// Approach 1: Basic HTML Encoding
// =======================

/**
 * Basic HTML encoding for common dangerous characters
 * Prevents XSS by converting HTML special characters to entities
 * 
 * Mental model: Replace characters that have special meaning in HTML
 * with their safe entity representations
 */
function htmlEncode(str) {
  // Input validation
  if (typeof str !== 'string') {
    return String(str); // Convert to string if not already
  }
  
  // Map of dangerous characters to HTML entities
  const entityMap = {
    '&': '&amp;',   // Must be first to avoid double-encoding
    '<': '&lt;',    // Prevents opening tags
    '>': '&gt;',    // Prevents closing tags
    '"': '&quot;',  // Prevents attribute injection
    "'": '&#39;',   // Prevents single-quote attribute injection
    '/': '&#x2F;'   // Prevents some edge cases with closing tags
  };
  
  // Replace using regular expression with global flag
  return str.replace(/[&<>"'\/]/g, (match) => {
    return entityMap[match];
  });
}

// =======================
// Approach 2: HTML Decoding
// =======================

/**
 * Decode HTML entities back to regular characters
 * Reverses the encoding process
 * 
 * Mental model: Convert entity references back to actual characters
 * Handles both named and numeric entities
 */
function htmlDecode(str) {
  if (typeof str !== 'string') {
    return String(str);
  }
  
  // Map of HTML entities to characters (reverse of encode map)
  const entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' ',  // Non-breaking space
    '&copy;': '©',  // Copyright
    '&reg;': '®',   // Registered trademark
    '&trade;': '™'  // Trademark
  };
  
  return str.replace(/&[#\w]+;/g, (entity) => {
    // Check named entities first
    if (entityMap[entity]) {
      return entityMap[entity];
    }
    
    // Handle numeric entities: &#123; or &#x7B;
    if (entity.startsWith('&#')) {
      const numPart = entity.slice(2, -1);
      let charCode;
      
      if (numPart.startsWith('x')) {
        // Hexadecimal: &#xHH;
        charCode = parseInt(numPart.slice(1), 16);
      } else {
        // Decimal: &#NNN;
        charCode = parseInt(numPart, 10);
      }
      
      if (!isNaN(charCode) && charCode > 0 && charCode <= 0x10FFFF) {
        return String.fromCharCode(charCode);
      }
    }
    
    // Return original if can't decode
    return entity;
  });
}

// =======================
// Approach 3: DOM-Based Encoding (Browser Only)
// =======================

/**
 * Use browser's native HTML encoding via DOM manipulation
 * More comprehensive but only works in browser environment
 * 
 * Mental model: Let the browser handle the encoding automatically
 * Leverages textContent property behavior
 */
function htmlEncodeDom(str) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    // Fall back to manual encoding in Node.js environment
    return htmlEncode(str);
  }
  
  // Create temporary element
  const tempElement = document.createElement('div');
  
  // Set text content - browser automatically encodes
  tempElement.textContent = str;
  
  // Get the encoded HTML
  return tempElement.innerHTML;
}

/**
 * DOM-based HTML decoding
 * Uses innerHTML to let browser decode entities
 */
function htmlDecodeDom(str) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  
  if (typeof document === 'undefined') {
    return htmlDecode(str);
  }
  
  const tempElement = document.createElement('div');
  tempElement.innerHTML = str;
  
  return tempElement.textContent || tempElement.innerText || '';
}

// =======================
// Approach 4: Comprehensive Entity Encoding
// =======================

/**
 * Extended HTML encoding that handles a wider range of characters
 * Includes Unicode and extended ASCII characters
 * 
 * Mental model: Convert any potentially problematic character to entity
 */
function htmlEncodeExtended(str, encodeAll = false) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  
  // Extended entity map including common symbols
  const extendedEntityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    ' ': '&nbsp;',  // Non-breaking space (optional)
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '£': '&pound;',
    '¥': '&yen;',
    '°': '&deg;',
    '±': '&plusmn;',
    '×': '&times;',
    '÷': '&divide;'
  };
  
  if (encodeAll) {
    // Encode all non-ASCII characters to numeric entities
    return str.replace(/[\u0080-\uFFFF]/g, (match) => {
      return '&#' + match.charCodeAt(0) + ';';
    }).replace(/[&<>"'\/\s©®™€£¥°±×÷]/g, (match) => {
      return extendedEntityMap[match] || match;
    });
  } else {
    // Only encode dangerous characters
    return str.replace(/[&<>"'\/]/g, (match) => {
      return extendedEntityMap[match];
    });
  }
}

// =======================
// Approach 5: Security-Focused Encoding
// =======================

/**
 * HTML encoding specifically designed for XSS prevention
 * Includes additional security measures and validation
 * 
 * Mental model: Zero-trust approach - encode everything suspicious
 */
function htmlEncodeSecurity(str, options = {}) {
  const {
    encodeQuotes = true,
    encodeSpaces = false,
    allowedTags = [],
    maxLength = 10000
  } = options;
  
  if (typeof str !== 'string') {
    str = String(str);
  }
  
  // Prevent extremely long strings that could cause DoS
  if (str.length > maxLength) {
    throw new Error(`Input string exceeds maximum length of ${maxLength} characters`);
  }
  
  // Base security encoding
  let encoded = str.replace(/&/g, '&amp;')  // Must be first
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
  
  if (encodeQuotes) {
    encoded = encoded.replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
  }
  
  if (encodeSpaces) {
    encoded = encoded.replace(/ /g, '&nbsp;');
  }
  
  // Additional security measures
  encoded = encoded.replace(/javascript:/gi, 'javascript%3A')  // Prevent JS injection
                  .replace(/vbscript:/gi, 'vbscript%3A')      // Prevent VBScript injection
                  .replace(/on\w+=/gi, (match) => {           // Prevent event handlers
                    return match.replace(/=/g, '%3D');
                  });
  
  return encoded;
}

// =======================
// Approach 6: Template String Safe Interpolation
// =======================

/**
 * Safe HTML template interpolation system
 * Prevents XSS in template strings by auto-encoding values
 * 
 * Mental model: Tagged template literal that encodes by default
 */
function html(strings, ...values) {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    
    if (i < values.length) {
      const value = values[i];
      
      // Check if value is marked as safe HTML
      if (value && value.__isSafeHtml) {
        result += value.toString();
      } else {
        // Auto-encode unsafe values
        result += htmlEncode(String(value));
      }
    }
  }
  
  return result;
}

/**
 * Mark string as safe HTML (skip encoding)
 * Use with extreme caution - only for trusted content
 */
function safeHtml(str) {
  const safeString = String(str);
  safeString.__isSafeHtml = true;
  return safeString;
}

// =======================
// Utility Functions and Helpers
// =======================

/**
 * Batch encode multiple strings
 */
function batchHtmlEncode(strings, options = {}) {
  if (!Array.isArray(strings)) {
    throw new Error('Input must be an array of strings');
  }
  
  return strings.map((str, index) => {
    try {
      return {
        index,
        original: str,
        encoded: htmlEncode(str),
        success: true
      };
    } catch (error) {
      return {
        index,
        original: str,
        error: error.message,
        success: false
      };
    }
  });
}

/**
 * Validate that string is properly HTML encoded
 */
function isHtmlEncoded(str) {
  if (typeof str !== 'string') {
    return false;
  }
  
  // Check if string contains unencoded dangerous characters
  const dangerousChars = /[<>&"']/;
  return !dangerousChars.test(str);
}

/**
 * Estimate encoding overhead
 */
function getEncodingStats(str) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  
  const encoded = htmlEncode(str);
  
  return {
    originalLength: str.length,
    encodedLength: encoded.length,
    overhead: encoded.length - str.length,
    overheadPercentage: ((encoded.length - str.length) / str.length * 100).toFixed(2) + '%',
    dangerousCharsFound: (str.match(/[&<>"'\/]/g) || []).length
  };
}

// =======================
// Real-world Examples
// =======================

// Example: User comment system
const userComments = [
  'This is a <script>alert("XSS")</script> attack',
  'I love the product! It\'s "amazing"',
  'Check this link: <a href="javascript:alert(1)">Click me</a>',
  'Math: 2 < 5 & 5 > 2'
];

// Example: Form data sanitization
function sanitizeFormData(formData) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = htmlEncode(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Example: Safe template system
function createSafeTemplate(user, message) {
  return html`
    <div class="message">
      <h3>From: ${user.name}</h3>
      <p>${message}</p>
      <small>Posted on ${new Date().toLocaleDateString()}</small>
    </div>
  `;
}

// =======================
// Testing and Demonstration
// =======================

function demonstrateHtmlEncoding() {
  console.log('\n=== Basic HTML Encoding Demo ===');
  const dangerous = '<script>alert("XSS")</script>';
  console.log('Original:', dangerous);
  console.log('Encoded:', htmlEncode(dangerous));
  console.log('Decoded:', htmlDecode(htmlEncode(dangerous)));
  
  console.log('\n=== Security Encoding Demo ===');
  const malicious = '<img src="x" onerror="alert(1)">';
  console.log('Malicious input:', malicious);
  console.log('Security encoded:', htmlEncodeSecurity(malicious));
  
  console.log('\n=== Template Safety Demo ===');
  const userInput = '<script>alert("hack")</script>';
  const safeTemplate = html`<p>User said: ${userInput}</p>`;
  console.log('Safe template:', safeTemplate);
  
  console.log('\n=== Encoding Stats Demo ===');
  const testString = 'Hello <world> & "friends"';
  console.log('Encoding statistics:', getEncodingStats(testString));
  
  console.log('\n=== Batch Encoding Demo ===');
  const batchResults = batchHtmlEncode(userComments);
  console.log('Batch encoding results:');
  batchResults.forEach(result => {
    if (result.success) {
      console.log(`✓ "${result.original}" → "${result.encoded}"`);
    } else {
      console.log(`✗ Error encoding: ${result.error}`);
    }
  });
  
  console.log('\n=== Form Sanitization Demo ===');
  const formData = {
    username: 'john<script>',
    email: 'john@example.com',
    message: 'Hello "world" & everyone!'
  };
  console.log('Sanitized form:', sanitizeFormData(formData));
}

// Uncomment to run demonstrations
// demonstrateHtmlEncoding();

// Export for use in other modules
module.exports = {
  htmlEncode,
  htmlDecode,
  htmlEncodeDom,
  htmlDecodeDom,
  htmlEncodeExtended,
  htmlEncodeSecurity,
  html,
  safeHtml,
  batchHtmlEncode,
  isHtmlEncoded,
  getEncodingStats,
  sanitizeFormData
};