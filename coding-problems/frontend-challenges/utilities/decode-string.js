/**
 * File: decode-string.js
 * Description: String decoding implementation with support for nested patterns,
 *              multiple encoding schemes, and advanced parsing techniques
 * 
 * Learning objectives:
 * - Understand stack-based parsing and recursive descent algorithms
 * - Learn pattern matching and regular expression techniques
 * - Implement string manipulation and character encoding/decoding
 * - Practice nested structure handling and context management
 * - Handle edge cases in parsing and validation
 * 
 * Real-world applications:
 * - Text compression and decompression algorithms
 * - URL encoding/decoding for web applications
 * - Configuration file parsing and template expansion
 * - Markup language processing (HTML, XML, Markdown)
 * - Protocol message parsing and serialization
 * - Template string interpolation and expansion
 * 
 * Time Complexity: O(n*k) where n is input length, k is expansion factor
 * Space Complexity: O(d*m) where d is nesting depth, m is max string length
 */

// =======================
// Approach 1: Basic Pattern Decoding (k[string])
// =======================

/**
 * Decode string with pattern k[encoded_string]
 * Example: "3[a]2[bc]" → "aaabcbc", "2[3[a]b]" → "aaabaaab"
 * 
 * Uses stack to handle nested patterns and track context
 * 
 * @param {string} s - Encoded string to decode
 * @returns {string} Decoded string
 */
function decodeString(s) {
  if (!s || typeof s !== 'string') {
    return '';
  }
  
  // Stack to track context: [currentString, currentNumber]
  const stack = [];
  let currentString = '';
  let currentNumber = 0;
  
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    
    if (char >= '0' && char <= '9') {
      // Build multi-digit number
      currentNumber = currentNumber * 10 + parseInt(char);
      
    } else if (char === '[') {
      // Start new nested context
      // Push current state to stack and reset
      stack.push([currentString, currentNumber]);
      currentString = '';
      currentNumber = 0;
      
    } else if (char === ']') {
      // Close current context and apply repetition
      const [prevString, repeatCount] = stack.pop();
      
      // Repeat current string and prepend previous string
      currentString = prevString + currentString.repeat(repeatCount);
      
    } else {
      // Regular character, add to current string
      currentString += char;
    }
  }
  
  return currentString;
}

/**
 * Alternative recursive implementation for pattern decoding
 * Uses helper function with index tracking for cleaner recursion
 * 
 * @param {string} s - Encoded string
 * @returns {string} Decoded string
 */
function decodeStringRecursive(s) {
  if (!s || typeof s !== 'string') {
    return '';
  }
  
  let index = 0;
  
  function parseString() {
    let result = '';
    let num = 0;
    
    while (index < s.length) {
      const char = s[index];
      
      if (char >= '0' && char <= '9') {
        num = num * 10 + parseInt(char);
        index++;
        
      } else if (char === '[') {
        index++; // Skip '['
        const substr = parseString(); // Recursive call for nested content
        result += substr.repeat(num);
        num = 0;
        
      } else if (char === ']') {
        index++; // Skip ']'
        return result; // Return to parent context
        
      } else {
        result += char;
        index++;
      }
    }
    
    return result;
  }
  
  return parseString();
}

// =======================
// Approach 2: Advanced Multi-Format Decoder
// =======================

/**
 * Advanced decoder supporting multiple encoding formats
 * Handles various patterns like URL encoding, HTML entities, and custom formats
 */
class AdvancedStringDecoder {
  constructor(options = {}) {
    this.options = {
      enableHtmlEntities: options.enableHtmlEntities ?? true,
      enableUrlDecoding: options.enableUrlDecoding ?? true,
      enableCustomPatterns: options.enableCustomPatterns ?? true,
      maxNestingDepth: options.maxNestingDepth ?? 100,
      allowInfiniteRecursion: options.allowInfiniteRecursion ?? false
    };
    
    // HTML entity mappings
    this.htmlEntities = new Map([
      ['&amp;', '&'],
      ['&lt;', '<'],
      ['&gt;', '>'],
      ['&quot;', '"'],
      ['&#39;', "'"],
      ['&nbsp;', ' '],
      ['&copy;', '©'],
      ['&reg;', '®'],
      ['&trade;', '™']
    ]);
    
    // Custom pattern handlers
    this.patternHandlers = new Map([
      ['repeat', this.handleRepeatPattern.bind(this)],
      ['reverse', this.handleReversePattern.bind(this)],
      ['upper', this.handleUpperPattern.bind(this)],
      ['lower', this.handleLowerPattern.bind(this)],
      ['caesar', this.handleCaesarPattern.bind(this)]
    ]);
    
    // Decoding statistics
    this.stats = {
      totalDecodings: 0,
      patternCounts: new Map(),
      averageNestingDepth: 0,
      maxObservedDepth: 0
    };
  }
  
  /**
   * Main decoding method supporting multiple formats
   * Applies different decoding strategies based on detected patterns
   * 
   * @param {string} input - Encoded input string
   * @param {Object} decodeOptions - Decoding configuration
   * @returns {string} Decoded string
   */
  decode(input, decodeOptions = {}) {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    this.stats.totalDecodings++;
    let result = input;
    let currentDepth = 0;
    let maxDepth = decodeOptions.maxDepth || this.options.maxNestingDepth;
    
    // Apply different decoding methods in sequence
    const decodingMethods = [
      this.decodeHtmlEntities.bind(this),
      this.decodeUrlEncoding.bind(this),
      this.decodeCustomPatterns.bind(this),
      this.decodeNestedPatterns.bind(this)
    ];
    
    // Keep decoding until no changes occur or max depth reached
    let hasChanges = true;
    while (hasChanges && currentDepth < maxDepth) {
      const originalResult = result;
      
      for (const method of decodingMethods) {
        if (this.shouldApplyMethod(method, decodeOptions)) {
          result = method(result, currentDepth);
        }
      }
      
      hasChanges = result !== originalResult;
      currentDepth++;
      
      // Update depth statistics
      this.stats.maxObservedDepth = Math.max(this.stats.maxObservedDepth, currentDepth);
    }
    
    // Update average depth (exponential moving average)
    this.stats.averageNestingDepth = this.stats.averageNestingDepth * 0.9 + currentDepth * 0.1;
    
    return result;
  }
  
  /**
   * Decode HTML entities to their character equivalents
   * Handles both named entities and numeric character references
   * 
   * @param {string} input - String with HTML entities
   * @returns {string} String with decoded entities
   */
  decodeHtmlEntities(input) {
    if (!this.options.enableHtmlEntities) {
      return input;
    }
    
    let result = input;
    
    // Decode named entities
    for (const [entity, char] of this.htmlEntities) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }
    
    // Decode numeric character references (&#123; or &#x1F;)
    result = result.replace(/&#(\d+);/g, (match, charCode) => {
      return String.fromCharCode(parseInt(charCode));
    });
    
    result = result.replace(/&#x([0-9A-Fa-f]+);/g, (match, hexCode) => {
      return String.fromCharCode(parseInt(hexCode, 16));
    });
    
    return result;
  }
  
  /**
   * Decode URL-encoded strings
   * Handles percent-encoding and plus signs
   * 
   * @param {string} input - URL-encoded string
   * @returns {string} Decoded string
   */
  decodeUrlEncoding(input) {
    if (!this.options.enableUrlDecoding) {
      return input;
    }
    
    try {
      // Replace + with spaces and decode percent-encoding
      const withSpaces = input.replace(/\+/g, ' ');
      return decodeURIComponent(withSpaces);
    } catch (error) {
      // If decoding fails, return original string
      console.warn('URL decoding failed:', error.message);
      return input;
    }
  }
  
  /**
   * Decode custom patterns using registered handlers
   * Processes custom format strings with specific transformation rules
   * 
   * @param {string} input - String with custom patterns
   * @param {number} depth - Current nesting depth
   * @returns {string} String with custom patterns decoded
   */
  decodeCustomPatterns(input, depth = 0) {
    if (!this.options.enableCustomPatterns) {
      return input;
    }
    
    let result = input;
    
    // Pattern: {pattern:parameter}[content]
    const customPatternRegex = /\{(\w+):?([^}]*)\}\[([^\]]*)\]/g;
    
    result = result.replace(customPatternRegex, (match, pattern, parameter, content) => {
      const handler = this.patternHandlers.get(pattern);
      
      if (handler) {
        // Update pattern statistics
        const currentCount = this.stats.patternCounts.get(pattern) || 0;
        this.stats.patternCounts.set(pattern, currentCount + 1);
        
        return handler(content, parameter, depth);
      }
      
      return match; // Return unchanged if no handler
    });
    
    return result;
  }
  
  /**
   * Decode nested k[string] patterns
   * Enhanced version with better error handling and depth tracking
   * 
   * @param {string} input - String with nested patterns
   * @param {number} depth - Current nesting depth
   * @returns {string} Decoded string
   */
  decodeNestedPatterns(input, depth = 0) {
    // Use the basic implementation but with depth tracking
    const stack = [];
    let currentString = '';
    let currentNumber = 0;
    let observedDepth = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      
      if (char >= '0' && char <= '9') {
        currentNumber = currentNumber * 10 + parseInt(char);
        
      } else if (char === '[') {
        stack.push([currentString, currentNumber]);
        currentString = '';
        currentNumber = 0;
        observedDepth = Math.max(observedDepth, stack.length);
        
        // Depth protection
        if (stack.length > this.options.maxNestingDepth) {
          throw new Error(`Maximum nesting depth exceeded: ${this.options.maxNestingDepth}`);
        }
        
      } else if (char === ']') {
        if (stack.length === 0) {
          throw new Error('Unmatched closing bracket at position ' + i);
        }
        
        const [prevString, repeatCount] = stack.pop();
        
        // Prevent excessive expansion
        if (currentString.length * repeatCount > 100000) {
          throw new Error('Pattern would create excessively long string');
        }
        
        currentString = prevString + currentString.repeat(repeatCount);
        
      } else {
        currentString += char;
      }
    }
    
    if (stack.length > 0) {
      throw new Error('Unmatched opening bracket(s)');
    }
    
    return currentString;
  }
  
  /**
   * Handle repeat pattern: {repeat:n}[content]
   * Repeats content n times
   * 
   * @param {string} content - Content to repeat
   * @param {string} parameter - Repeat count
   * @returns {string} Repeated content
   */
  handleRepeatPattern(content, parameter) {
    const count = parseInt(parameter) || 1;
    
    if (count < 0 || count > 1000) {
      throw new Error(`Invalid repeat count: ${count}`);
    }
    
    return content.repeat(count);
  }
  
  /**
   * Handle reverse pattern: {reverse}[content]
   * Reverses the content string
   * 
   * @param {string} content - Content to reverse
   * @returns {string} Reversed content
   */
  handleReversePattern(content) {
    return content.split('').reverse().join('');
  }
  
  /**
   * Handle uppercase pattern: {upper}[content]
   * Converts content to uppercase
   * 
   * @param {string} content - Content to uppercase
   * @returns {string} Uppercased content
   */
  handleUpperPattern(content) {
    return content.toUpperCase();
  }
  
  /**
   * Handle lowercase pattern: {lower}[content]
   * Converts content to lowercase
   * 
   * @param {string} content - Content to lowercase
   * @returns {string} Lowercased content
   */
  handleLowerPattern(content) {
    return content.toLowerCase();
  }
  
  /**
   * Handle Caesar cipher pattern: {caesar:shift}[content]
   * Applies Caesar cipher with given shift
   * 
   * @param {string} content - Content to shift
   * @param {string} parameter - Shift amount
   * @returns {string} Caesar-shifted content
   */
  handleCaesarPattern(content, parameter) {
    const shift = parseInt(parameter) || 0;
    
    return content.replace(/[A-Za-z]/g, char => {
      const isUppercase = char >= 'A' && char <= 'Z';
      const baseCode = isUppercase ? 65 : 97; // 'A' or 'a'
      const charCode = char.charCodeAt(0);
      
      // Apply Caesar shift with wrap-around
      const shiftedCode = ((charCode - baseCode + shift + 26) % 26) + baseCode;
      
      return String.fromCharCode(shiftedCode);
    });
  }
  
  /**
   * Check if decoding method should be applied
   * Allows conditional application of decoding methods
   * 
   * @param {Function} method - Decoding method
   * @param {Object} options - Decode options
   * @returns {boolean} Whether to apply method
   */
  shouldApplyMethod(method, options) {
    // For demo, always apply enabled methods
    // In practice, could be more sophisticated
    return true;
  }
  
  /**
   * Add custom pattern handler
   * Allows extending decoder with new pattern types
   * 
   * @param {string} pattern - Pattern name
   * @param {Function} handler - Pattern handler function
   */
  addPatternHandler(pattern, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    
    this.patternHandlers.set(pattern, handler);
  }
  
  /**
   * Get decoding statistics
   * Returns performance and usage metrics
   * 
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalDecodings: this.stats.totalDecodings,
      patternCounts: Object.fromEntries(this.stats.patternCounts),
      averageNestingDepth: this.stats.averageNestingDepth.toFixed(2),
      maxObservedDepth: this.stats.maxObservedDepth,
      availablePatterns: Array.from(this.patternHandlers.keys())
    };
  }
  
  /**
   * Reset statistics
   * Clears all collected statistics
   */
  resetStats() {
    this.stats = {
      totalDecodings: 0,
      patternCounts: new Map(),
      averageNestingDepth: 0,
      maxObservedDepth: 0
    };
  }
}

// =======================
// Approach 3: Template String Decoder
// =======================

/**
 * Template string decoder with variable substitution and expression evaluation
 * Supports complex template patterns with conditionals and loops
 */
class TemplateStringDecoder {
  constructor(variables = {}) {
    this.variables = new Map(Object.entries(variables));
    this.functions = new Map([
      ['uppercase', (str) => str.toUpperCase()],
      ['lowercase', (str) => str.toLowerCase()],
      ['reverse', (str) => str.split('').reverse().join('')],
      ['length', (str) => str.length.toString()],
      ['repeat', (str, count) => str.repeat(parseInt(count) || 1)]
    ]);
  }
  
  /**
   * Decode template string with variable substitution
   * Supports ${variable}, ${function(args)}, and conditional patterns
   * 
   * @param {string} template - Template string
   * @param {Object} context - Additional context variables
   * @returns {string} Decoded template
   */
  decode(template, context = {}) {
    if (!template || typeof template !== 'string') {
      return '';
    }
    
    // Merge context with instance variables
    const allVariables = new Map([...this.variables, ...Object.entries(context)]);
    
    let result = template;
    
    // Process template expressions: ${...}
    result = this.processTemplateExpressions(result, allVariables);
    
    // Process conditional blocks: {{if condition}}...{{endif}}
    result = this.processConditionals(result, allVariables);
    
    // Process loops: {{each array}}...{{endeach}}
    result = this.processLoops(result, allVariables);
    
    return result;
  }
  
  /**
   * Process ${...} template expressions
   * Handles variable substitution and function calls
   * 
   * @param {string} input - Input string with expressions
   * @param {Map} variables - Available variables
   * @returns {string} String with expressions evaluated
   */
  processTemplateExpressions(input, variables) {
    const expressionRegex = /\$\{([^}]+)\}/g;
    
    return input.replace(expressionRegex, (match, expression) => {
      try {
        return this.evaluateExpression(expression.trim(), variables);
      } catch (error) {
        console.warn(`Template expression error: ${error.message}`);
        return match; // Return original if evaluation fails
      }
    });
  }
  
  /**
   * Evaluate a single template expression
   * Supports variables, function calls, and basic operations
   * 
   * @param {string} expression - Expression to evaluate
   * @param {Map} variables - Available variables
   * @returns {string} Evaluated result
   */
  evaluateExpression(expression, variables) {
    // Check for function calls: function(args)
    const functionCallRegex = /^(\w+)\(([^)]*)\)$/;
    const functionMatch = expression.match(functionCallRegex);
    
    if (functionMatch) {
      const [, funcName, argsString] = functionMatch;
      const func = this.functions.get(funcName);
      
      if (!func) {
        throw new Error(`Unknown function: ${funcName}`);
      }
      
      // Parse arguments
      const args = argsString.split(',').map(arg => {
        const trimmed = arg.trim();
        
        // Check if argument is a variable reference
        if (variables.has(trimmed)) {
          return variables.get(trimmed);
        }
        
        // Check if argument is a quoted string
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          return trimmed.slice(1, -1);
        }
        
        // Return as-is (could be a literal)
        return trimmed;
      });
      
      return func(...args);
    }
    
    // Simple variable lookup
    if (variables.has(expression)) {
      return String(variables.get(expression));
    }
    
    // Check for quoted strings
    if ((expression.startsWith('"') && expression.endsWith('"')) ||
        (expression.startsWith("'") && expression.endsWith("'"))) {
      return expression.slice(1, -1);
    }
    
    // Return as literal if nothing else matches
    return expression;
  }
  
  /**
   * Process conditional blocks
   * Handles {{if condition}}...{{else}}...{{endif}}
   * 
   * @param {string} input - Input with conditional blocks
   * @param {Map} variables - Available variables
   * @returns {string} String with conditionals processed
   */
  processConditionals(input, variables) {
    const conditionalRegex = /\{\{if\s+([^}]+)\}\}(.*?)\{\{endif\}\}/gs;
    
    return input.replace(conditionalRegex, (match, condition, content) => {
      const conditionResult = this.evaluateCondition(condition.trim(), variables);
      
      // Handle else clause
      const elseParts = content.split('{{else}}');
      const ifContent = elseParts[0];
      const elseContent = elseParts[1] || '';
      
      return conditionResult ? ifContent : elseContent;
    });
  }
  
  /**
   * Evaluate conditional expression
   * Supports basic comparisons and variable checks
   * 
   * @param {string} condition - Condition to evaluate
   * @param {Map} variables - Available variables
   * @returns {boolean} Condition result
   */
  evaluateCondition(condition, variables) {
    // Simple existence check
    if (variables.has(condition)) {
      const value = variables.get(condition);
      return value !== null && value !== undefined && value !== '' && value !== false;
    }
    
    // Basic comparisons: var == value, var != value
    const comparisonRegex = /^(\w+)\s*(==|!=|>|<|>=|<=)\s*(.+)$/;
    const match = condition.match(comparisonRegex);
    
    if (match) {
      const [, varName, operator, valueExpr] = match;
      const leftValue = variables.get(varName);
      const rightValue = this.parseValue(valueExpr.trim(), variables);
      
      switch (operator) {
        case '==': return leftValue == rightValue;
        case '!=': return leftValue != rightValue;
        case '>': return Number(leftValue) > Number(rightValue);
        case '<': return Number(leftValue) < Number(rightValue);
        case '>=': return Number(leftValue) >= Number(rightValue);
        case '<=': return Number(leftValue) <= Number(rightValue);
        default: return false;
      }
    }
    
    // Default to false for unknown conditions
    return false;
  }
  
  /**
   * Process loop blocks
   * Handles {{each array}}...{{endeach}}
   * 
   * @param {string} input - Input with loop blocks
   * @param {Map} variables - Available variables
   * @returns {string} String with loops processed
   */
  processLoops(input, variables) {
    const loopRegex = /\{\{each\s+(\w+)\s*(?:as\s+(\w+))?\}\}(.*?)\{\{endeach\}\}/gs;
    
    return input.replace(loopRegex, (match, arrayName, itemName, content) => {
      const array = variables.get(arrayName);
      
      if (!Array.isArray(array)) {
        console.warn(`Loop variable ${arrayName} is not an array`);
        return '';
      }
      
      const itemVariable = itemName || 'item';
      let result = '';
      
      array.forEach((item, index) => {
        // Create context for loop iteration
        const loopContext = new Map(variables);
        loopContext.set(itemVariable, item);
        loopContext.set('index', index);
        loopContext.set('first', index === 0);
        loopContext.set('last', index === array.length - 1);
        
        // Process content with loop context
        let iterationResult = content;
        iterationResult = this.processTemplateExpressions(iterationResult, loopContext);
        
        result += iterationResult;
      });
      
      return result;
    });
  }
  
  /**
   * Parse value with type conversion
   * Handles strings, numbers, and variable references
   * 
   * @param {string} valueExpr - Value expression to parse
   * @param {Map} variables - Available variables
   * @returns {any} Parsed value
   */
  parseValue(valueExpr, variables) {
    // Variable reference
    if (variables.has(valueExpr)) {
      return variables.get(valueExpr);
    }
    
    // Quoted string
    if ((valueExpr.startsWith('"') && valueExpr.endsWith('"')) ||
        (valueExpr.startsWith("'") && valueExpr.endsWith("'"))) {
      return valueExpr.slice(1, -1);
    }
    
    // Number
    if (!isNaN(valueExpr) && !isNaN(parseFloat(valueExpr))) {
      return parseFloat(valueExpr);
    }
    
    // Boolean
    if (valueExpr === 'true') return true;
    if (valueExpr === 'false') return false;
    
    // Return as string
    return valueExpr;
  }
  
  /**
   * Set variable value
   * @param {string} name - Variable name
   * @param {any} value - Variable value
   */
  setVariable(name, value) {
    this.variables.set(name, value);
  }
  
  /**
   * Add custom function
   * @param {string} name - Function name
   * @param {Function} func - Function implementation
   */
  addFunction(name, func) {
    this.functions.set(name, func);
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic string pattern decoding
 * Demonstrates core k[string] pattern decoding
 */
function demonstrateBasicDecoding() {
  console.log('=== Basic String Decoding Demo ===\n');
  
  const testCases = [
    '3[a]',                    // Simple repetition
    '2[bc]',                   // Multiple characters
    '3[a2[c]]',               // Nested pattern
    '2[abc]3[cd]ef',          // Mixed patterns
    '3[a]2[b4[F]c]',          // Complex nesting
    '10[a]',                  // Multi-digit numbers
    '2[2[2[b]]]',             // Deep nesting
    '',                        // Empty string
    'abc',                     // No patterns
    '0[abc]def'               // Zero repetition
  ];
  
  console.log('Testing basic decoding patterns:\n');
  console.log('Input'.padEnd(20) + 'Stack Method'.padEnd(25) + 'Recursive Method');
  console.log('-'.repeat(70));
  
  testCases.forEach(testCase => {
    try {
      const stackResult = decodeString(testCase);
      const recursiveResult = decodeStringRecursive(testCase);
      const match = stackResult === recursiveResult ? '✅' : '❌';
      
      console.log(
        `"${testCase}"`.padEnd(20) + 
        `"${stackResult}"`.padEnd(25) + 
        `"${recursiveResult}" ${match}`
      );
    } catch (error) {
      console.log(`"${testCase}"`.padEnd(20) + `ERROR: ${error.message}`);
    }
  });
  
  // Performance comparison
  console.log('\n--- Performance Test ---');
  const complexPattern = '5[3[a2[bc]d]e]';
  
  console.time('Stack method');
  for (let i = 0; i < 1000; i++) {
    decodeString(complexPattern);
  }
  console.timeEnd('Stack method');
  
  console.time('Recursive method');
  for (let i = 0; i < 1000; i++) {
    decodeStringRecursive(complexPattern);
  }
  console.timeEnd('Recursive method');
}

/**
 * Example 2: Advanced multi-format decoding
 * Shows comprehensive decoding with multiple formats
 */
function demonstrateAdvancedDecoding() {
  console.log('=== Advanced Multi-Format Decoding Demo ===\n');
  
  const decoder = new AdvancedStringDecoder({
    enableHtmlEntities: true,
    enableUrlDecoding: true,
    enableCustomPatterns: true
  });
  
  const testInputs = [
    // HTML entities
    'Hello &amp; welcome to &lt;our&gt; website!',
    'Copyright &copy; 2023 &trade; Company',
    '&#65;&#66;&#67; &#x44;&#x45;&#x46;',
    
    // URL encoding
    'Hello%20World%21',
    'user%40example.com',
    'search+query+with+spaces',
    
    // Custom patterns
    '{repeat:3}[Hi ]',
    '{reverse}[Hello]',
    '{upper}[hello world]',
    '{caesar:3}[abc]',
    
    // Mixed formats
    '3[{upper}[hello]]%20{reverse}[world]',
    '&lt;h1&gt;{repeat:2}[Welcome%21]&lt;/h1&gt;',
    
    // Nested patterns with custom
    '2[{caesar:1}[hello] {repeat:2}[!]]'
  ];
  
  console.log('Testing advanced decoding:\n');
  
  testInputs.forEach((input, index) => {
    try {
      const result = decoder.decode(input);
      console.log(`${index + 1}. Input:  "${input}"`);
      console.log(`   Output: "${result}"`);
      console.log('');
    } catch (error) {
      console.log(`${index + 1}. Input:  "${input}"`);
      console.log(`   ERROR:  ${error.message}`);
      console.log('');
    }
  });
  
  // Show decoder statistics
  console.log('--- Decoder Statistics ---');
  const stats = decoder.getStats();
  console.log(JSON.stringify(stats, null, 2));
  
  // Add custom pattern
  console.log('\n--- Adding Custom Pattern ---');
  decoder.addPatternHandler('double', (content) => content + content);
  
  const customResult = decoder.decode('{double}[Hello]');
  console.log(`Custom pattern result: "${customResult}"`);
}

/**
 * Example 3: Template string processing
 * Demonstrates template engine capabilities
 */
function demonstrateTemplateDecoding() {
  console.log('=== Template String Decoding Demo ===\n');
  
  // Create template decoder with initial variables
  const templateDecoder = new TemplateStringDecoder({
    name: 'John Doe',
    age: 30,
    city: 'New York',
    isAdmin: true,
    items: ['apple', 'banana', 'cherry'],
    score: 95
  });
  
  const templates = [
    // Basic variable substitution
    'Hello, ${name}! You are ${age} years old.',
    
    // Function calls
    'Your name in uppercase: ${uppercase(name)}',
    'Your name reversed: ${reverse(name)}',
    'Name length: ${length(name)} characters',
    
    // Conditionals
    '{{if isAdmin}}You have admin access!{{else}}Regular user{{endif}}',
    '{{if score > 90}}Excellent score!{{else}}Good effort!{{endif}}',
    
    // Loops
    'Items: {{each items}}${item} {{endeach}}',
    'Items with index: {{each items as fruit}}${index}: ${fruit} {{endeach}}',
    
    // Complex template
    `Welcome ${name}!
{{if isAdmin}}
Admin Panel:
{{each items as item}}
  - ${uppercase(item)} (${length(item)} chars)
{{endeach}}
{{else}}
User Dashboard: ${length(items)} items available
{{endif}}`,
    
    // Nested expressions
    'Score doubled: ${repeat(score, 2)}'
  ];
  
  console.log('Processing template strings:\n');
  
  templates.forEach((template, index) => {
    console.log(`Template ${index + 1}:`);
    console.log(`Input:\n${template}`);
    console.log(`Output:\n${templateDecoder.decode(template)}`);
    console.log('-'.repeat(50));
  });
  
  // Dynamic context
  console.log('\n--- Dynamic Context ---');
  const dynamicTemplate = 'Hello ${guest}! Today is ${day}.';
  const dynamicContext = { guest: 'Alice', day: 'Monday' };
  
  const dynamicResult = templateDecoder.decode(dynamicTemplate, dynamicContext);
  console.log(`Template: ${dynamicTemplate}`);
  console.log(`Context: ${JSON.stringify(dynamicContext)}`);
  console.log(`Result: ${dynamicResult}`);
  
  // Custom function
  console.log('\n--- Custom Function ---');
  templateDecoder.addFunction('shout', (text) => text.toUpperCase() + '!!!');
  
  const customTemplate = 'Announcement: ${shout(name)} is here!';
  const customResult = templateDecoder.decode(customTemplate);
  console.log(`Template: ${customTemplate}`);
  console.log(`Result: ${customResult}`);
}

/**
 * Example 4: Error handling and edge cases
 * Demonstrates robust error handling
 */
function demonstrateErrorHandling() {
  console.log('=== Error Handling Demo ===\n');
  
  const errorCases = [
    // Malformed patterns
    { input: '3[abc', description: 'Missing closing bracket' },
    { input: 'abc]', description: 'Unmatched closing bracket' },
    { input: '3[]', description: 'Empty pattern' },
    { input: '999999[a]', description: 'Very large repetition' },
    { input: '3[2[4[8[a]]]]', description: 'Deep nesting' },
    
    // Invalid inputs
    { input: null, description: 'Null input' },
    { input: undefined, description: 'Undefined input' },
    { input: 123, description: 'Non-string input' }
  ];
  
  console.log('Testing error handling:\n');
  
  errorCases.forEach(({ input, description }) => {
    try {
      const result = decodeString(input);
      console.log(`✅ ${description}: "${input}" → "${result}"`);
    } catch (error) {
      console.log(`❌ ${description}: "${input}" → ERROR: ${error.message}`);
    }
  });
  
  // Advanced decoder error handling
  console.log('\n--- Advanced Decoder Error Handling ---');
  
  const advancedDecoder = new AdvancedStringDecoder({ maxNestingDepth: 5 });
  
  const advancedErrorCases = [
    '10[5[4[3[2[1[a]]]]]]',  // Exceeds depth limit
    '{unknown}[content]',     // Unknown pattern
    '{repeat:abc}[text]',     // Invalid parameter
    '{repeat:10000}[a]'       // Excessive repetition
  ];
  
  advancedErrorCases.forEach((input, index) => {
    try {
      const result = advancedDecoder.decode(input);
      console.log(`${index + 1}. Success: "${input}" → "${result}"`);
    } catch (error) {
      console.log(`${index + 1}. Error: "${input}" → ${error.message}`);
    }
  });
}

// Export all implementations and examples
module.exports = {
  decodeString,
  decodeStringRecursive,
  AdvancedStringDecoder,
  TemplateStringDecoder,
  demonstrateBasicDecoding,
  demonstrateAdvancedDecoding,
  demonstrateTemplateDecoding,
  demonstrateErrorHandling
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('String Decoding Implementation\n');
  console.log('This module demonstrates comprehensive string decoding');
  console.log('with pattern matching, template processing, and error handling.\n');
  
  demonstrateBasicDecoding();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateAdvancedDecoding();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateTemplateDecoding();
  }, 3000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateErrorHandling();
  }, 5000);
}