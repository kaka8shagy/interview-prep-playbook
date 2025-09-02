/**
 * File: classnames.js
 * Description: Implementation of React classNames library for dynamic CSS class management
 * 
 * Learning objectives:
 * - Understand dynamic class name generation patterns
 * - Learn to handle multiple argument types and formats
 * - See conditional styling and optimization techniques
 * 
 * Time Complexity: O(n) where n is total number of arguments/properties
 * Space Complexity: O(n) for result string building
 */

// =======================
// Approach 1: Basic ClassNames Implementation
// =======================

/**
 * Basic classNames implementation
 * Handles strings, objects, arrays, and conditional classes
 * 
 * Mental model: Collect all truthy class names from various input formats
 * and join them into a single space-separated string
 */
function classNamesBasic(...args) {
  const classes = [];
  
  function processArg(arg) {
    // Skip falsy values
    if (!arg) return;
    
    const type = typeof arg;
    
    if (type === 'string' || type === 'number') {
      // String or number - add directly
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      // Array - recursively process each element
      arg.forEach(processArg);
    } else if (type === 'object') {
      // Object - add keys where values are truthy
      Object.keys(arg).forEach(key => {
        if (arg[key]) {
          classes.push(key);
        }
      });
    }
  }
  
  // Process all arguments
  args.forEach(processArg);
  
  // Join unique classes with spaces
  return [...new Set(classes)].join(' ');
}

// =======================
// Approach 2: Enhanced with Performance Optimizations
// =======================

/**
 * Performance-optimized classNames with better type checking
 * Avoids unnecessary operations and memory allocations
 */
function classNamesOptimized(...args) {
  const classes = [];
  const seen = new Set(); // Track duplicates
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Skip falsy values quickly
    if (!arg) continue;
    
    const type = typeof arg;
    
    if (type === 'string') {
      // Handle space-separated strings
      if (arg.includes(' ')) {
        const parts = arg.split(' ');
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j].trim();
          if (part && !seen.has(part)) {
            seen.add(part);
            classes.push(part);
          }
        }
      } else if (arg && !seen.has(arg)) {
        seen.add(arg);
        classes.push(arg);
      }
    } else if (type === 'number') {
      const str = String(arg);
      if (!seen.has(str)) {
        seen.add(str);
        classes.push(str);
      }
    } else if (Array.isArray(arg)) {
      // Recursively process array
      const nested = classNamesOptimized(...arg);
      if (nested) {
        const parts = nested.split(' ');
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j];
          if (!seen.has(part)) {
            seen.add(part);
            classes.push(part);
          }
        }
      }
    } else if (type === 'object') {
      // Process object keys
      const keys = Object.keys(arg);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (arg[key] && !seen.has(key)) {
          seen.add(key);
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

// =======================
// Approach 3: Advanced with CSS-in-JS Support
// =======================

/**
 * Advanced classNames with CSS-in-JS library integration
 * Supports emotion/styled-components style objects and template literals
 */
function classNamesAdvanced(...args) {
  const classes = [];
  
  function processValue(value, key = null) {
    if (!value) return;
    
    const type = typeof value;
    
    if (type === 'string' || type === 'number') {
      const str = String(value).trim();
      if (str) {
        // Handle CSS-in-JS class names (often start with prefixes)
        if (str.includes(' ')) {
          str.split(' ').forEach(cls => {
            const trimmed = cls.trim();
            if (trimmed) classes.push(trimmed);
          });
        } else {
          classes.push(str);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(item => processValue(item));
    } else if (type === 'object') {
      if (key && value) {
        // This is a conditional class from an object
        classes.push(key);
      } else {
        // Process object properties
        Object.entries(value).forEach(([k, v]) => {
          processValue(v, k);
        });
      }
    } else if (type === 'function') {
      // Support for functions that return class names
      try {
        const result = value();
        processValue(result);
      } catch (error) {
        console.warn('ClassNames function threw error:', error);
      }
    }
  }
  
  args.forEach(arg => processValue(arg));
  
  // Remove duplicates while preserving order
  const unique = [];
  const seen = new Set();
  
  for (const cls of classes) {
    if (!seen.has(cls)) {
      seen.add(cls);
      unique.push(cls);
    }
  }
  
  return unique.join(' ');
}

// =======================
// Approach 4: Functional Programming Style
// =======================

/**
 * Functional programming approach with method chaining
 * Provides fluent interface for building class names
 */
function createClassNameBuilder() {
  const classes = new Set();
  
  const builder = {
    // Add classes conditionally
    add(...args) {
      args.forEach(arg => {
        if (typeof arg === 'string' && arg.trim()) {
          arg.split(' ').forEach(cls => {
            const trimmed = cls.trim();
            if (trimmed) classes.add(trimmed);
          });
        } else if (typeof arg === 'object' && arg !== null) {
          Object.entries(arg).forEach(([key, value]) => {
            if (value) classes.add(key);
          });
        }
      });
      return builder;
    },
    
    // Add classes with condition
    addIf(condition, ...classNames) {
      if (condition) {
        builder.add(...classNames);
      }
      return builder;
    },
    
    // Remove classes
    remove(...classNames) {
      classNames.forEach(cls => {
        if (typeof cls === 'string') {
          cls.split(' ').forEach(c => classes.delete(c.trim()));
        }
      });
      return builder;
    },
    
    // Toggle classes
    toggle(className, condition) {
      if (typeof condition === 'boolean') {
        if (condition) {
          classes.add(className);
        } else {
          classes.delete(className);
        }
      } else {
        // Toggle based on current state
        if (classes.has(className)) {
          classes.delete(className);
        } else {
          classes.add(className);
        }
      }
      return builder;
    },
    
    // Check if class exists
    has(className) {
      return classes.has(className);
    },
    
    // Get array of classes
    toArray() {
      return Array.from(classes);
    },
    
    // Get string representation
    toString() {
      return Array.from(classes).join(' ');
    },
    
    // Clear all classes
    clear() {
      classes.clear();
      return builder;
    },
    
    // Create new builder with current classes
    clone() {
      const newBuilder = createClassNameBuilder();
      classes.forEach(cls => newBuilder.add(cls));
      return newBuilder;
    }
  };
  
  return builder;
}

// =======================
// Approach 5: Template Literal Support
// =======================

/**
 * ClassNames with template literal support
 * Allows using template strings for dynamic class generation
 */
function classNamesWithTemplates(...args) {
  const classes = [];
  
  function processArg(arg) {
    if (!arg) return;
    
    const type = typeof arg;
    
    if (type === 'string') {
      // Handle template literals and regular strings
      const trimmed = arg.trim();
      if (trimmed) {
        // Split by whitespace and filter empty strings
        trimmed.split(/\s+/).forEach(cls => {
          if (cls) classes.push(cls);
        });
      }
    } else if (type === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      arg.forEach(processArg);
    } else if (type === 'object') {
      Object.entries(arg).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }
  
  args.forEach(processArg);
  
  // Remove duplicates
  return [...new Set(classes)].join(' ');
}

// Tagged template literal function
function css(strings, ...values) {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const value = values[i];
      if (typeof value === 'function') {
        result += value();
      } else {
        result += String(value);
      }
    }
  }
  
  return result;
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== ClassNames Examples ===');

// Basic usage examples
console.log('Basic string:', classNamesBasic('btn', 'btn-primary')); // "btn btn-primary"
console.log('With object:', classNamesBasic('btn', { active: true, disabled: false })); // "btn active"
console.log('With array:', classNamesBasic(['btn', 'btn-large'], { active: true })); // "btn btn-large active"
console.log('Mixed args:', classNamesBasic('btn', ['btn-primary', { disabled: false }], null, 'active')); // "btn btn-primary active"

// Optimized version
console.log('\n--- Optimized Version ---');
console.log('Optimized:', classNamesOptimized('btn btn-primary', { active: true, hidden: false })); // "btn btn-primary active"
console.log('With duplicates:', classNamesOptimized('btn', 'btn', { btn: true, active: true })); // "btn active"

// Builder pattern
console.log('\n--- Builder Pattern ---');
const builder = createClassNameBuilder()
  .add('btn', 'btn-primary')
  .addIf(true, 'active')
  .addIf(false, 'disabled')
  .toggle('highlighted', true);

console.log('Builder result:', builder.toString()); // "btn btn-primary active highlighted"
console.log('Has active:', builder.has('active')); // true

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: React Component Class Name Manager
 * Dynamic class names for React components with props-based styling
 */
function createReactClassNames() {
  return {
    // Button component class names
    button(props = {}) {
      const { size = 'medium', variant = 'primary', disabled = false, loading = false, fullWidth = false } = props;
      
      return classNamesOptimized(
        'btn',
        `btn--${size}`,
        `btn--${variant}`,
        {
          'btn--disabled': disabled,
          'btn--loading': loading,
          'btn--full-width': fullWidth,
          'btn--interactive': !disabled && !loading
        }
      );
    },
    
    // Input component class names
    input(props = {}) {
      const { size = 'medium', error = false, focused = false, disabled = false } = props;
      
      return classNamesOptimized(
        'input',
        `input--${size}`,
        {
          'input--error': error,
          'input--focused': focused && !disabled,
          'input--disabled': disabled
        }
      );
    },
    
    // Card component class names
    card(props = {}) {
      const { variant = 'default', shadow = 'medium', padding = 'medium', hoverable = false } = props;
      
      return classNamesOptimized(
        'card',
        `card--${variant}`,
        `card--shadow-${shadow}`,
        `card--padding-${padding}`,
        {
          'card--hoverable': hoverable
        }
      );
    },
    
    // Layout classes
    layout(props = {}) {
      const { 
        display = 'block',
        flexDirection,
        justifyContent,
        alignItems,
        gap,
        padding,
        margin
      } = props;
      
      const classes = [`d-${display}`];
      
      if (display === 'flex') {
        if (flexDirection) classes.push(`flex-${flexDirection}`);
        if (justifyContent) classes.push(`justify-${justifyContent}`);
        if (alignItems) classes.push(`align-${alignItems}`);
        if (gap) classes.push(`gap-${gap}`);
      }
      
      if (padding) classes.push(`p-${padding}`);
      if (margin) classes.push(`m-${margin}`);
      
      return classes.join(' ');
    }
  };
}

/**
 * Use Case 2: CSS Module Integration
 * Work with CSS modules and scoped styles
 */
function createCSSModuleHelper(styles = {}) {
  return {
    // Get class name from CSS module
    get(className) {
      return styles[className] || className;
    },
    
    // Combine CSS module classes
    combine(...args) {
      return classNamesOptimized(
        ...args.map(arg => {
          if (typeof arg === 'string') {
            return styles[arg] || arg;
          }
          if (typeof arg === 'object' && arg !== null) {
            const mapped = {};
            Object.entries(arg).forEach(([key, value]) => {
              mapped[styles[key] || key] = value;
            });
            return mapped;
          }
          return arg;
        })
      );
    },
    
    // Conditional class with CSS modules
    conditional(baseClass, conditions = {}) {
      const base = styles[baseClass] || baseClass;
      const conditionalClasses = {};
      
      Object.entries(conditions).forEach(([key, value]) => {
        conditionalClasses[styles[key] || key] = value;
      });
      
      return classNamesOptimized(base, conditionalClasses);
    }
  };
}

/**
 * Use Case 3: Theme-based Class Name Generator
 * Generate class names based on theme and design system
 */
function createThemeClassNames(theme = {}) {
  const {
    colors = {},
    spacing = {},
    typography = {},
    breakpoints = {}
  } = theme;
  
  return {
    // Color utilities
    color(colorName, variant = 'primary') {
      const color = colors[colorName];
      if (color && color[variant]) {
        return `text-${colorName}-${variant}`;
      }
      return `text-${colorName}`;
    },
    
    backgroundColor(colorName, variant = 'primary') {
      return `bg-${colorName}-${variant}`;
    },
    
    // Spacing utilities
    spacing(property, size) {
      if (spacing[size]) {
        return `${property}-${size}`;
      }
      return `${property}-${size}`;
    },
    
    // Typography utilities
    text(style) {
      if (typography[style]) {
        return `text-${style}`;
      }
      return style;
    },
    
    // Responsive utilities
    responsive(baseClasses, responsiveClasses = {}) {
      const classes = [baseClasses];
      
      Object.entries(responsiveClasses).forEach(([breakpoint, cls]) => {
        if (breakpoints[breakpoint]) {
          if (typeof cls === 'string') {
            classes.push(`${breakpoint}:${cls}`);
          } else if (Array.isArray(cls)) {
            cls.forEach(c => classes.push(`${breakpoint}:${c}`));
          }
        }
      });
      
      return classNamesOptimized(...classes);
    },
    
    // Utility class generator
    utils(utilities = {}) {
      return classNamesOptimized(
        Object.entries(utilities).map(([util, value]) => {
          if (value === true) return util;
          if (value === false) return null;
          return `${util}-${value}`;
        }).filter(Boolean)
      );
    }
  };
}

/**
 * Use Case 4: Animation and Transition Classes
 * Manage animation states and transitions
 */
function createAnimationClassNames() {
  return {
    // Transition classes
    transition(element, state, options = {}) {
      const { duration = 'normal', easing = 'ease', delay = 0 } = options;
      
      const baseClasses = [
        'transition',
        `duration-${duration}`,
        `ease-${easing}`
      ];
      
      if (delay > 0) {
        baseClasses.push(`delay-${delay}`);
      }
      
      // State-specific classes
      const stateClasses = {
        entering: 'opacity-0 scale-95',
        entered: 'opacity-100 scale-100',
        exiting: 'opacity-100 scale-100',
        exited: 'opacity-0 scale-95'
      };
      
      return classNamesOptimized(
        baseClasses,
        stateClasses[state] || state,
        `${element}-transition`
      );
    },
    
    // Loading states
    loading(isLoading, element = 'default') {
      return classNamesOptimized(
        `${element}-loading`,
        {
          'animate-pulse': isLoading,
          'animate-spin': isLoading && element === 'spinner',
          'opacity-50': isLoading,
          'pointer-events-none': isLoading
        }
      );
    },
    
    // Hover and focus states
    interactive(states = {}) {
      const { hover = true, focus = true, active = true, disabled = false } = states;
      
      return classNamesOptimized({
        'hover:bg-gray-100': hover && !disabled,
        'focus:ring-2': focus && !disabled,
        'active:bg-gray-200': active && !disabled,
        'cursor-pointer': !disabled,
        'cursor-not-allowed': disabled,
        'opacity-50': disabled
      });
    }
  };
}

/**
 * Use Case 5: Form Validation Classes
 * Dynamic classes for form validation states
 */
function createFormClassNames() {
  return {
    // Input validation states
    input(validation = {}) {
      const { isValid, isInvalid, isTouched, isRequired, hasValue } = validation;
      
      return classNamesOptimized(
        'form-input',
        {
          'input-valid': isValid && isTouched,
          'input-invalid': isInvalid && isTouched,
          'input-required': isRequired,
          'input-filled': hasValue,
          'input-empty': !hasValue && isTouched,
          'input-untouched': !isTouched
        }
      );
    },
    
    // Form group classes
    group(field = {}) {
      const { hasError, isRequired, isDisabled } = field;
      
      return classNamesOptimized(
        'form-group',
        {
          'form-group--error': hasError,
          'form-group--required': isRequired,
          'form-group--disabled': isDisabled
        }
      );
    },
    
    // Error message classes
    error(error = null, options = {}) {
      const { animated = true, position = 'bottom' } = options;
      
      return classNamesOptimized(
        'error-message',
        `error-${position}`,
        {
          'error-visible': !!error,
          'error-hidden': !error,
          'error-animated': animated,
          'error-slide-down': animated && position === 'bottom',
          'error-fade-in': animated
        }
      );
    }
  };
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// React component classes
const reactClassNames = createReactClassNames();
console.log('Button classes:', reactClassNames.button({ size: 'large', disabled: true }));
console.log('Card classes:', reactClassNames.card({ variant: 'elevated', hoverable: true }));

// CSS module integration
const mockStyles = {
  button: 'Button_button__1a2b3c',
  primary: 'Button_primary__4d5e6f',
  disabled: 'Button_disabled__7g8h9i'
};

const cssModuleHelper = createCSSModuleHelper(mockStyles);
console.log('CSS Module classes:', cssModuleHelper.combine('button', { primary: true, disabled: false }));

// Theme-based classes
const theme = {
  colors: { blue: { primary: '#007bff', secondary: '#6c757d' } },
  spacing: { sm: '0.5rem', md: '1rem', lg: '1.5rem' }
};

const themeClassNames = createThemeClassNames(theme);
console.log('Theme classes:', themeClassNames.responsive('btn', { md: 'btn-large', lg: 'btn-xl' }));

// Animation classes
const animationClassNames = createAnimationClassNames();
console.log('Transition classes:', animationClassNames.transition('modal', 'entering', { duration: 'fast' }));

// Form validation classes
const formClassNames = createFormClassNames();
console.log('Input classes:', formClassNames.input({ isInvalid: true, isTouched: true, isRequired: true }));

// Export all implementations
module.exports = {
  classNames: classNamesBasic,
  classNamesOptimized,
  classNamesAdvanced,
  createClassNameBuilder,
  classNamesWithTemplates,
  css,
  createReactClassNames,
  createCSSModuleHelper,
  createThemeClassNames,
  createAnimationClassNames,
  createFormClassNames
};

/**
 * Key Interview Points:
 * 
 * 1. Input Type Handling:
 *    - Strings: Direct inclusion or space-separated parsing
 *    - Objects: Key inclusion based on truthy values
 *    - Arrays: Recursive processing of elements
 *    - Functions: Evaluation and result processing
 * 
 * 2. Performance Optimizations:
 *    - Duplicate removal using Set
 *    - Early termination on falsy values
 *    - Efficient string concatenation
 *    - Avoiding unnecessary array operations
 * 
 * 3. Advanced Features:
 *    - CSS-in-JS integration
 *    - Template literal support
 *    - Method chaining (builder pattern)
 *    - Conditional class application
 * 
 * 4. Real-world Applications:
 *    - React component styling
 *    - CSS module integration
 *    - Theme-based design systems
 *    - Animation state management
 *    - Form validation styling
 * 
 * 5. Edge Cases:
 *    - Empty strings and whitespace
 *    - Nested arrays and objects
 *    - Circular references (in objects)
 *    - Function evaluation errors
 * 
 * 6. Alternative Approaches:
 *    - Template literals for dynamic classes
 *    - CSS-in-JS libraries (emotion, styled-components)
 *    - Utility-first frameworks (Tailwind CSS)
 *    - CSS modules for scoped styling
 */