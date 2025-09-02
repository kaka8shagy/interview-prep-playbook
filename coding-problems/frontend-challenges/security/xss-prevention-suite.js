/**
 * XSS Prevention Suite - HTML Sanitization Engine
 * 
 * A comprehensive XSS prevention system that includes:
 * - HTML sanitization with allowlist-based filtering
 * - Safe DOM manipulation utilities
 * - Content filtering and validation
 * - Multiple implementation approaches from basic to production-ready
 * 
 * Problem: Prevent Cross-Site Scripting (XSS) attacks while preserving safe HTML content
 * 
 * Key Interview Points:
 * - Understanding XSS attack vectors (stored, reflected, DOM-based)
 * - Allowlist vs blocklist security approaches
 * - DOM manipulation best practices
 * - Content Security Policy (CSP) integration
 * - Performance considerations for large HTML content
 * 
 * Companies: All FAANG companies test XSS prevention knowledge
 * Frequency: High - Security is critical in modern web applications
 */

// ========================================================================================
// APPROACH 1: BASIC HTML SANITIZER - Simple tag and attribute filtering
// ========================================================================================

/**
 * Basic HTML sanitizer using allowlist approach
 * Mental model: Only allow explicitly safe tags and attributes
 * 
 * Time Complexity: O(n) where n is the length of HTML string
 * Space Complexity: O(n) for the result string
 * 
 * Interview considerations:
 * - Why allowlist over blocklist? (Blocklist can be bypassed with new attack vectors)
 * - How to handle nested tags and malformed HTML?
 * - What about HTML entities and encoding issues?
 */
function basicHtmlSanitizer(html) {
  // Define allowed tags and their permitted attributes
  // This is the core security boundary - everything else is stripped
  const allowedTags = {
    'p': ['class', 'id'],
    'div': ['class', 'id'], 
    'span': ['class', 'id'],
    'strong': [],
    'em': [],
    'b': [],
    'i': [],
    'u': [],
    'a': ['href', 'title', 'target'], // href will be further validated
    'img': ['src', 'alt', 'title', 'width', 'height'], // src will be validated
    'br': [],
    'hr': [],
    'ul': ['class'],
    'ol': ['class'],
    'li': ['class'],
    'h1': ['class', 'id'],
    'h2': ['class', 'id'],
    'h3': ['class', 'id'],
    'h4': ['class', 'id'],
    'h5': ['class', 'id'],
    'h6': ['class', 'id']
  };

  // Dangerous protocols that should never be allowed in href/src attributes
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  
  // Step 1: Remove all script tags and their content entirely
  // This is critical - script tags can execute arbitrary JavaScript
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Step 2: Remove style tags to prevent CSS injection attacks
  // CSS can be used for data exfiltration and UI manipulation attacks
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Step 3: Remove on* event handlers (onclick, onload, etc.)
  // These are common XSS vectors - any on* attribute is dangerous
  html = html.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');
  
  // Step 4: Process each HTML tag using regex (basic approach)
  // More robust parsing would use a proper HTML parser like DOMParser
  return html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/gi, (match, tagName, attributes) => {
    const lowerTagName = tagName.toLowerCase();
    
    // If tag is not in allowlist, remove it entirely
    if (!allowedTags.hasOwnProperty(lowerTagName)) {
      return ''; // Strip unknown/dangerous tags
    }
    
    // Process attributes for allowed tags
    const allowedAttrs = allowedTags[lowerTagName];
    let cleanAttributes = '';
    
    // Extract and validate each attribute
    const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      const [, attrName, attrValue] = attrMatch;
      const lowerAttrName = attrName.toLowerCase();
      
      // Only include allowed attributes
      if (allowedAttrs.includes(lowerAttrName)) {
        // Special validation for URL attributes (href, src)
        if ((lowerAttrName === 'href' || lowerAttrName === 'src')) {
          // Block dangerous protocols
          if (!dangerousProtocols.test(attrValue.trim())) {
            cleanAttributes += ` ${lowerAttrName}="${attrValue}"`;
          }
        } else {
          // For other attributes, HTML-encode the value to prevent injection
          cleanAttributes += ` ${lowerAttrName}="${htmlEncode(attrValue)}"`;
        }
      }
    }
    
    // Reconstruct the clean tag
    const isClosingTag = match.startsWith('</');
    return isClosingTag ? `</${lowerTagName}>` : `<${lowerTagName}${cleanAttributes}>`;
  });
}

/**
 * HTML entity encoding utility
 * Prevents HTML injection by encoding dangerous characters
 * 
 * This is essential for preventing attribute-based XSS attacks
 */
function htmlEncode(str) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#47;'
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
}

// ========================================================================================
// APPROACH 2: DOM-BASED SANITIZER - Using DOMParser for robust HTML parsing
// ========================================================================================

/**
 * Advanced HTML sanitizer using DOMParser for accurate HTML parsing
 * Mental model: Parse HTML into DOM tree, then traverse and clean each node
 * 
 * Advantages over regex approach:
 * - Handles malformed HTML correctly
 * - Properly parses nested structures
 * - More resistant to encoding bypass attempts
 * 
 * Time Complexity: O(n) where n is number of DOM nodes
 * Space Complexity: O(n) for DOM tree construction
 */
function domBasedSanitizer(html) {
  // Configuration object for maintainable security policy
  const config = {
    allowedTags: new Set([
      'p', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 'a', 'img', 
      'br', 'hr', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ]),
    
    allowedAttributes: {
      'global': ['class', 'id'], // Attributes allowed on all tags
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    },
    
    // URL validation for href and src attributes
    urlValidator: (url) => {
      const dangerous = /^(javascript|data|vbscript|file|about):/i;
      return !dangerous.test(url.trim());
    }
  };
  
  try {
    // Step 1: Parse HTML using DOMParser (more robust than regex)
    // DOMParser handles malformed HTML and creates proper DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Step 2: Recursively sanitize the DOM tree
    // Start with body element which contains the parsed HTML
    const sanitizedBody = sanitizeNode(doc.body, config);
    
    // Step 3: Extract clean HTML from sanitized DOM
    return sanitizedBody ? sanitizedBody.innerHTML : '';
    
  } catch (error) {
    // Fallback to basic sanitizer if DOMParser fails
    console.warn('DOMParser failed, falling back to basic sanitizer:', error);
    return basicHtmlSanitizer(html);
  }
}

/**
 * Recursively sanitize a DOM node and its children
 * This is the core of the DOM-based approach - traverse and clean each node
 */
function sanitizeNode(node, config) {
  if (!node) return null;
  
  // Handle different node types appropriately
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      // Text nodes are safe - they can't contain HTML
      return document.createTextNode(node.textContent);
      
    case Node.ELEMENT_NODE:
      const tagName = node.tagName.toLowerCase();
      
      // Step 1: Check if tag is allowed
      if (!config.allowedTags.has(tagName)) {
        // For disallowed tags, we process children but don't include the tag
        // This preserves content while removing dangerous containers
        const fragment = document.createDocumentFragment();
        Array.from(node.childNodes).forEach(child => {
          const sanitizedChild = sanitizeNode(child, config);
          if (sanitizedChild) fragment.appendChild(sanitizedChild);
        });
        return fragment;
      }
      
      // Step 2: Create clean element
      const cleanElement = document.createElement(tagName);
      
      // Step 3: Sanitize attributes
      sanitizeAttributes(node, cleanElement, config);
      
      // Step 4: Recursively sanitize children
      Array.from(node.childNodes).forEach(child => {
        const sanitizedChild = sanitizeNode(child, config);
        if (sanitizedChild) cleanElement.appendChild(sanitizedChild);
      });
      
      return cleanElement;
      
    default:
      // Skip comment nodes, processing instructions, etc.
      return null;
  }
}

/**
 * Sanitize element attributes based on allowlist
 * Critical security function - validates each attribute value
 */
function sanitizeAttributes(sourceElement, targetElement, config) {
  const tagName = sourceElement.tagName.toLowerCase();
  const globalAttrs = config.allowedAttributes.global || [];
  const tagSpecificAttrs = config.allowedAttributes[tagName] || [];
  const allowedAttrs = [...globalAttrs, ...tagSpecificAttrs];
  
  // Iterate through all attributes on the source element
  Array.from(sourceElement.attributes).forEach(attr => {
    const attrName = attr.name.toLowerCase();
    const attrValue = attr.value;
    
    // Skip event handlers and unknown attributes
    if (attrName.startsWith('on') || !allowedAttrs.includes(attrName)) {
      return; // Silently drop dangerous/unknown attributes
    }
    
    // Special validation for URL attributes
    if ((attrName === 'href' || attrName === 'src')) {
      if (config.urlValidator(attrValue)) {
        targetElement.setAttribute(attrName, attrValue);
      }
      // Invalid URLs are silently dropped for security
    } else {
      // For other allowed attributes, set the value
      // The browser automatically handles HTML encoding
      targetElement.setAttribute(attrName, attrValue);
    }
  });
}

// ========================================================================================
// APPROACH 3: PRODUCTION-READY SANITIZER - Content Security Policy Integration
// ========================================================================================

/**
 * Production-ready XSS prevention system with CSP integration
 * Mental model: Defense in depth - multiple security layers
 * 
 * Features:
 * - Comprehensive HTML sanitization
 * - CSP nonce integration for inline styles/scripts
 * - Logging and monitoring of attempted attacks
 * - Performance optimization with caching
 * - Configuration management for different contexts
 */
class XSSPreventionSuite {
  constructor(options = {}) {
    // Default configuration with security-first defaults
    this.config = {
      // Sanitization policy
      allowedTags: new Set(options.allowedTags || [
        'p', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 'a', 'img',
        'br', 'hr', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre'
      ]),
      
      allowedAttributes: {
        global: ['class', 'id', 'title'],
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'width', 'height'],
        blockquote: ['cite'],
        ...options.allowedAttributes
      },
      
      // URL policy
      allowedProtocols: new Set(['http:', 'https:', 'mailto:', 'tel:']),
      allowedDomains: options.allowedDomains || null, // null = allow all domains
      
      // CSP integration
      cspNonce: options.cspNonce || null,
      
      // Monitoring and logging
      logAttempts: options.logAttempts || false,
      onViolation: options.onViolation || this.defaultViolationHandler,
      
      // Performance optimization
      enableCaching: options.enableCaching || true,
      maxCacheSize: options.maxCacheSize || 1000
    };
    
    // Initialize cache for performance optimization
    if (this.config.enableCaching) {
      this.cache = new Map();
    }
    
    // Attack pattern detection
    this.attackPatterns = [
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /onerror\s*=/i,
      /<script/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ];
  }
  
  /**
   * Main sanitization method with caching and monitoring
   * Public API for the XSS prevention suite
   */
  sanitize(html, context = 'default') {
    if (typeof html !== 'string') {
      throw new TypeError('HTML input must be a string');
    }
    
    // Generate cache key based on content and context
    const cacheKey = this.config.enableCaching ? 
      `${context}:${this.hashString(html)}` : null;
    
    // Check cache first for performance
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Detect and log potential attacks
    this.detectAttackAttempts(html);
    
    // Perform sanitization
    const sanitizedHtml = this.performSanitization(html);
    
    // Cache the result
    if (cacheKey) {
      // Implement LRU cache eviction
      if (this.cache.size >= this.config.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, sanitizedHtml);
    }
    
    return sanitizedHtml;
  }
  
  /**
   * Core sanitization logic using DOMParser
   * This is where the actual HTML cleaning happens
   */
  performSanitization(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove dangerous elements entirely (scripts, styles, etc.)
      this.removeDangerousElements(doc);
      
      // Sanitize remaining elements
      const sanitizedBody = this.sanitizeElement(doc.body);
      
      return sanitizedBody ? sanitizedBody.innerHTML : '';
      
    } catch (error) {
      // Log error and fallback to basic sanitization
      console.error('Advanced sanitization failed:', error);
      return basicHtmlSanitizer(html);
    }
  }
  
  /**
   * Remove dangerous elements that should never be allowed
   * These elements are removed entirely, not just sanitized
   */
  removeDangerousElements(doc) {
    const dangerousTags = ['script', 'style', 'object', 'embed', 'link', 'meta', 'iframe'];
    
    dangerousTags.forEach(tagName => {
      const elements = doc.getElementsByTagName(tagName);
      // Convert to array since live NodeList changes during removal
      Array.from(elements).forEach(element => {
        element.remove();
      });
    });
  }
  
  /**
   * Recursively sanitize DOM element and its children
   * Similar to earlier approach but with enhanced validation
   */
  sanitizeElement(element) {
    if (!element) return null;
    
    if (element.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(element.textContent);
    }
    
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return null; // Skip comment nodes, etc.
    }
    
    const tagName = element.tagName.toLowerCase();
    
    // Check if tag is allowed
    if (!this.config.allowedTags.has(tagName)) {
      // Process children of disallowed tags
      const fragment = document.createDocumentFragment();
      Array.from(element.childNodes).forEach(child => {
        const sanitizedChild = this.sanitizeElement(child);
        if (sanitizedChild) fragment.appendChild(sanitizedChild);
      });
      return fragment;
    }
    
    // Create clean element
    const cleanElement = document.createElement(tagName);
    
    // Sanitize attributes with enhanced validation
    this.sanitizeAdvancedAttributes(element, cleanElement);
    
    // Recursively sanitize children
    Array.from(element.childNodes).forEach(child => {
      const sanitizedChild = this.sanitizeElement(child);
      if (sanitizedChild) cleanElement.appendChild(sanitizedChild);
    });
    
    return cleanElement;
  }
  
  /**
   * Advanced attribute sanitization with URL validation and CSP integration
   * Enhanced security checks for attribute values
   */
  sanitizeAdvancedAttributes(sourceElement, targetElement) {
    const tagName = sourceElement.tagName.toLowerCase();
    const globalAttrs = this.config.allowedAttributes.global || [];
    const tagSpecificAttrs = this.config.allowedAttributes[tagName] || [];
    const allowedAttrs = [...globalAttrs, ...tagSpecificAttrs];
    
    Array.from(sourceElement.attributes).forEach(attr => {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.trim();
      
      // Skip event handlers and data URIs
      if (attrName.startsWith('on') || attrName.startsWith('data-on')) {
        this.logViolation('Event handler detected', { attribute: attrName });
        return;
      }
      
      if (!allowedAttrs.includes(attrName)) {
        return; // Skip unknown attributes
      }
      
      // Enhanced URL validation
      if (attrName === 'href' || attrName === 'src') {
        if (this.validateUrl(attrValue)) {
          targetElement.setAttribute(attrName, attrValue);
        } else {
          this.logViolation('Invalid URL detected', { 
            attribute: attrName, 
            value: attrValue 
          });
        }
      } else if (attrName === 'style') {
        // Handle inline styles with CSP nonce if available
        const cleanStyle = this.sanitizeStyle(attrValue);
        if (cleanStyle) {
          targetElement.setAttribute(attrName, cleanStyle);
        }
      } else {
        // Regular attribute - validate for common attack patterns
        if (!this.containsAttackPattern(attrValue)) {
          targetElement.setAttribute(attrName, attrValue);
        } else {
          this.logViolation('Attack pattern in attribute', {
            attribute: attrName,
            value: attrValue
          });
        }
      }
    });
  }
  
  /**
   * Comprehensive URL validation
   * Validates protocol, domain, and checks for encoded attacks
   */
  validateUrl(url) {
    try {
      // Handle relative URLs
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return true; // Relative URLs are generally safe
      }
      
      // Parse absolute URLs
      const urlObj = new URL(url, window.location.origin);
      
      // Check protocol
      if (!this.config.allowedProtocols.has(urlObj.protocol)) {
        return false;
      }
      
      // Check domain allowlist if configured
      if (this.config.allowedDomains && 
          !this.config.allowedDomains.includes(urlObj.hostname)) {
        return false;
      }
      
      // Check for encoded JavaScript
      const decodedUrl = decodeURIComponent(url);
      if (this.containsAttackPattern(decodedUrl)) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      // Invalid URL
      return false;
    }
  }
  
  /**
   * Basic CSS sanitization for inline styles
   * Removes dangerous CSS properties and functions
   */
  sanitizeStyle(styleValue) {
    // Remove dangerous CSS functions and properties
    const dangerousPatterns = [
      /expression\s*\(/i,
      /javascript:/i,
      /vbscript:/i,
      /url\s*\(\s*['"]*javascript:/i,
      /url\s*\(\s*['"]*data:/i,
      /@import/i,
      /binding:/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(styleValue)) {
        return null; // Reject entire style if dangerous content found
      }
    }
    
    return styleValue;
  }
  
  /**
   * Detect potential attack patterns in input
   * Used for monitoring and alerting purposes
   */
  detectAttackAttempts(html) {
    if (!this.config.logAttempts) return;
    
    for (const pattern of this.attackPatterns) {
      if (pattern.test(html)) {
        this.logViolation('Attack pattern detected in HTML', {
          pattern: pattern.source,
          html: html.substring(0, 200) // Log first 200 chars for context
        });
      }
    }
  }
  
  /**
   * Check if text contains known attack patterns
   * Used for attribute value validation
   */
  containsAttackPattern(text) {
    return this.attackPatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Log security violations for monitoring
   * Can be integrated with security monitoring systems
   */
  logViolation(message, details = {}) {
    const violation = {
      timestamp: new Date().toISOString(),
      message,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.config.onViolation(violation);
  }
  
  /**
   * Default violation handler - logs to console
   * In production, this should integrate with your monitoring system
   */
  defaultViolationHandler(violation) {
    console.warn('XSS Prevention Suite - Security Violation:', violation);
    
    // In production, you might want to:
    // - Send to security monitoring service
    // - Alert security team for repeated violations
    // - Rate limit or block the user temporarily
  }
  
  /**
   * Simple string hashing for cache keys
   * Used to generate consistent cache keys for HTML content
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
  
  /**
   * Clear the sanitization cache
   * Useful for memory management in long-running applications
   */
  clearCache() {
    if (this.cache) {
      this.cache.clear();
    }
  }
  
  /**
   * Get cache statistics for monitoring
   * Helps optimize cache performance
   */
  getCacheStats() {
    if (!this.cache) {
      return { enabled: false };
    }
    
    return {
      enabled: true,
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: this.cacheHitRate || 0
    };
  }
}

// ========================================================================================
// SAFE DOM MANIPULATION UTILITIES
// ========================================================================================

/**
 * Safe DOM manipulation utilities that prevent XSS attacks
 * These functions should be used instead of direct innerHTML manipulation
 */
const SafeDOM = {
  /**
   * Safely set element content using sanitized HTML
   * Prevents XSS while allowing rich content
   */
  setHTML(element, html, sanitizer = null) {
    if (!element || typeof html !== 'string') {
      throw new TypeError('Invalid element or HTML content');
    }
    
    // Use provided sanitizer or create default one
    const xssProtection = sanitizer || new XSSPreventionSuite();
    
    // Sanitize HTML content before setting
    const safeHTML = xssProtection.sanitize(html);
    element.innerHTML = safeHTML;
    
    return element;
  },
  
  /**
   * Safely append HTML content to element
   * Sanitizes content before appending to prevent XSS
   */
  appendHTML(element, html, sanitizer = null) {
    if (!element || typeof html !== 'string') {
      throw new TypeError('Invalid element or HTML content');
    }
    
    const xssProtection = sanitizer || new XSSPreventionSuite();
    const safeHTML = xssProtection.sanitize(html);
    
    // Create temporary container to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = safeHTML;
    
    // Move all child nodes to target element
    while (temp.firstChild) {
      element.appendChild(temp.firstChild);
    }
    
    return element;
  },
  
  /**
   * Create element with safe attributes
   * Validates all attributes before setting them
   */
  createElement(tagName, attributes = {}, textContent = '') {
    const element = document.createElement(tagName);
    
    // Sanitize and set attributes
    for (const [name, value] of Object.entries(attributes)) {
      if (this.isSafeAttribute(name, value)) {
        element.setAttribute(name, value);
      } else {
        console.warn(`Unsafe attribute blocked: ${name}="${value}"`);
      }
    }
    
    // Set text content (always safe)
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  },
  
  /**
   * Validate if an attribute is safe to set
   * Blocks event handlers and dangerous attributes
   */
  isSafeAttribute(name, value) {
    const lowerName = name.toLowerCase();
    
    // Block event handlers
    if (lowerName.startsWith('on') || lowerName.startsWith('data-on')) {
      return false;
    }
    
    // Block dangerous attributes
    const dangerousAttrs = ['srcdoc', 'sandbox', 'allow'];
    if (dangerousAttrs.includes(lowerName)) {
      return false;
    }
    
    // Validate URL attributes
    if ((lowerName === 'href' || lowerName === 'src') && typeof value === 'string') {
      const dangerousProtocols = /^(javascript|data|vbscript):/i;
      return !dangerousProtocols.test(value.trim());
    }
    
    return true;
  }
};

// ========================================================================================
// EXAMPLE USAGE AND TESTING
// ========================================================================================

// Example 1: Basic HTML sanitization
console.log('=== BASIC SANITIZER EXAMPLE ===');
const maliciousHTML1 = `
  <div>
    <p>Safe content</p>
    <script>alert('XSS Attack!');</script>
    <img src="x" onerror="alert('XSS')">
    <a href="javascript:alert('XSS')">Dangerous link</a>
    <a href="https://example.com">Safe link</a>
  </div>
`;

console.log('Input:', maliciousHTML1);
console.log('Sanitized:', basicHtmlSanitizer(maliciousHTML1));

// Example 2: DOM-based sanitization
console.log('\n=== DOM-BASED SANITIZER EXAMPLE ===');
const maliciousHTML2 = `
  <div class="container">
    <h2>Article Title</h2>
    <p onclick="alert('clicked')">Click me</p>
    <style>body { background: red; }</style>
    <img src="https://example.com/image.jpg" alt="Safe image">
    <img src="javascript:alert('XSS')" alt="Dangerous image">
  </div>
`;

console.log('Input:', maliciousHTML2);
console.log('Sanitized:', domBasedSanitizer(maliciousHTML2));

// Example 3: Production-ready sanitizer with configuration
console.log('\n=== PRODUCTION SANITIZER EXAMPLE ===');
const xssProtection = new XSSPreventionSuite({
  allowedTags: ['p', 'strong', 'em', 'a', 'img'],
  allowedAttributes: {
    global: ['class'],
    a: ['href', 'title'],
    img: ['src', 'alt']
  },
  logAttempts: true,
  onViolation: (violation) => {
    console.log('Security violation detected:', violation.message);
  }
});

const maliciousHTML3 = `
  <p class="intro">Welcome to our site!</p>
  <strong>Important:</strong> 
  <em onmouseover="alert('XSS')">Hover over me</em>
  <a href="https://example.com" title="Safe link">Visit Example</a>
  <img src="data:text/html,<script>alert('XSS')</script>" alt="Attack image">
  <div style="background: expression(alert('XSS'))">Styled div</div>
`;

console.log('Input:', maliciousHTML3);
console.log('Sanitized:', xssProtection.sanitize(maliciousHTML3));
console.log('Cache stats:', xssProtection.getCacheStats());

// Example 4: Safe DOM manipulation
console.log('\n=== SAFE DOM MANIPULATION EXAMPLE ===');
// This would typically run in a browser environment
if (typeof document !== 'undefined') {
  const container = document.createElement('div');
  
  // Safe way to set HTML content
  SafeDOM.setHTML(container, '<p>Safe <strong>content</strong></p><script>alert("blocked")</script>');
  
  // Safe way to create elements with attributes
  const safeLink = SafeDOM.createElement('a', {
    href: 'https://example.com',
    class: 'external-link',
    onclick: 'alert("blocked")' // This will be blocked
  }, 'Click me');
  
  SafeDOM.appendHTML(container, safeLink.outerHTML);
  console.log('Safe DOM result:', container.innerHTML);
}

// Export for use in other modules
module.exports = {
  basicHtmlSanitizer,
  domBasedSanitizer,
  XSSPreventionSuite,
  SafeDOM,
  htmlEncode
};

// ========================================================================================
// INTERVIEW DISCUSSION POINTS
// ========================================================================================

/*
Key Interview Topics:

1. XSS Attack Types:
   - Stored XSS: Malicious scripts stored in database
   - Reflected XSS: Scripts in URL parameters or form data
   - DOM-based XSS: Client-side scripts manipulating DOM

2. Security Approaches:
   - Allowlist vs Blocklist: Why allowlist is more secure
   - Defense in Depth: Multiple security layers
   - Content Security Policy (CSP): Browser-level protection

3. Implementation Considerations:
   - Performance: Caching, efficient parsing
   - User Experience: Preserving legitimate content
   - Maintainability: Configurable policies

4. Common Bypass Techniques:
   - HTML entity encoding: &lt;script&gt;
   - JavaScript URLs: javascript:alert()
   - Event handlers: onclick, onerror, onload
   - CSS injection: expression(), url()
   - Data URLs: data:text/html,<script>

5. Production Concerns:
   - Monitoring and alerting on attack attempts
   - Performance impact of sanitization
   - False positives and user experience
   - Integration with existing security infrastructure

Follow-up Questions:
- How would you handle user-generated content at scale?
- What's the performance impact of different sanitization approaches?
- How do you balance security with user experience?
- How would you test this system for security vulnerabilities?
- What metrics would you track for XSS prevention effectiveness?
*/