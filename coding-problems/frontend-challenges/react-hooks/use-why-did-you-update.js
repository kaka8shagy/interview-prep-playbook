/**
 * File: use-why-did-you-update.js
 * Description: React hook for debugging unnecessary re-renders by tracking prop changes
 * 
 * Learning objectives:
 * - Master React performance debugging techniques
 * - Understand prop comparison and change detection
 * - Implement development-time debugging utilities
 * - Learn advanced useRef and useEffect patterns
 * 
 * Common use cases:
 * - Debugging performance issues in React components
 * - Identifying unnecessary re-renders
 * - Development-time prop change monitoring
 * - Component optimization analysis
 */

import { useRef, useEffect } from 'react';

/**
 * APPROACH 1: Basic Why Did You Update Hook
 * Simple implementation that logs changed props to console
 * 
 * Mental model:
 * - Store previous props in useRef to persist across renders
 * - Compare current props with previous props on each render
 * - Log differences to help identify render triggers
 * - Only runs in development mode for performance
 * 
 * Time Complexity: O(n) where n is number of props
 * Space Complexity: O(n) to store previous props
 */
function useWhyDidYouUpdate(name, props) {
  // Store previous props in ref to persist across renders
  // useRef doesn't trigger re-renders when value changes
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      // Get all keys from current and previous props
      // Using Set to get unique keys from both objects
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      
      // Find changed props by comparing current vs previous
      const changedProps = {};
      
      allKeys.forEach(key => {
        const prevValue = previousProps.current[key];
        const currentValue = props[key];
        
        // Deep comparison for objects and arrays
        // For primitive values, simple comparison works
        if (prevValue !== currentValue) {
          changedProps[key] = {
            from: prevValue,
            to: currentValue
          };
        }
      });

      // Only log if there are actual changes
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    // Update the ref with current props for next comparison
    previousProps.current = props;
  });
}

/**
 * APPROACH 2: Enhanced Debug Hook with Deep Comparison
 * More sophisticated implementation with deep object comparison
 * and detailed change analysis
 */
function useWhyDidYouUpdateEnhanced(name, props, options = {}) {
  const {
    // Only run in development mode by default
    enabled = process.env.NODE_ENV === 'development',
    // Include detailed object diffs
    detailed = true,
    // Custom comparison function
    compare = null,
    // Filter out specific props from logging
    exclude = [],
    // Maximum depth for object comparison
    maxDepth = 3
  } = options;

  const previousProps = useRef();
  const renderCount = useRef(0);

  // Deep equality comparison utility
  const deepEqual = (obj1, obj2, depth = 0) => {
    // Prevent infinite recursion
    if (depth > maxDepth) return obj1 === obj2;
    
    // Handle null/undefined cases
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    
    // Handle different types
    if (typeof obj1 !== typeof obj2) return false;
    
    // Handle primitives
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    // Handle arrays
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((item, index) => deepEqual(item, obj2[index], depth + 1));
    }
    
    // Handle objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
      keys2.includes(key) && deepEqual(obj1[key], obj2[key], depth + 1)
    );
  };

  // Analyze the type of change for better debugging
  const analyzeChange = (oldValue, newValue) => {
    const oldType = typeof oldValue;
    const newType = typeof newValue;
    
    if (oldType !== newType) {
      return `Type changed from ${oldType} to ${newType}`;
    }
    
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (oldValue.length !== newValue.length) {
        return `Array length changed from ${oldValue.length} to ${newValue.length}`;
      }
      return 'Array contents changed';
    }
    
    if (oldType === 'object' && oldValue !== null && newValue !== null) {
      const oldKeys = Object.keys(oldValue);
      const newKeys = Object.keys(newValue);
      
      if (oldKeys.length !== newKeys.length) {
        return `Object keys changed from ${oldKeys.length} to ${newKeys.length}`;
      }
      
      const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
      const removedKeys = oldKeys.filter(key => !newKeys.includes(key));
      
      if (addedKeys.length > 0 || removedKeys.length > 0) {
        return `Object structure changed. Added: [${addedKeys.join(', ')}], Removed: [${removedKeys.join(', ')}]`;
      }
      
      return 'Object values changed';
    }
    
    if (oldType === 'function') {
      return 'Function reference changed';
    }
    
    return `Value changed`;
  };

  useEffect(() => {
    // Only run if enabled (typically only in development)
    if (!enabled) return;
    
    renderCount.current += 1;
    
    if (previousProps.current) {
      // Filter out excluded props
      const filteredProps = Object.keys(props)
        .filter(key => !exclude.includes(key))
        .reduce((obj, key) => {
          obj[key] = props[key];
          return obj;
        }, {});
        
      const filteredPrevious = Object.keys(previousProps.current)
        .filter(key => !exclude.includes(key))
        .reduce((obj, key) => {
          obj[key] = previousProps.current[key];
          return obj;
        }, {});

      // Get all unique keys
      const allKeys = [...new Set([
        ...Object.keys(filteredProps),
        ...Object.keys(filteredPrevious)
      ])];
      
      const changes = [];
      
      allKeys.forEach(key => {
        const oldValue = filteredPrevious[key];
        const newValue = filteredProps[key];
        
        // Use custom comparison function if provided
        const isEqual = compare 
          ? compare(oldValue, newValue, key)
          : deepEqual(oldValue, newValue);
        
        if (!isEqual) {
          const change = {
            prop: key,
            oldValue,
            newValue,
            analysis: analyzeChange(oldValue, newValue)
          };
          
          // Add detailed diff for objects if requested
          if (detailed && typeof oldValue === 'object' && typeof newValue === 'object') {
            change.detailed = generateDetailedDiff(oldValue, newValue);
          }
          
          changes.push(change);
        }
      });

      if (changes.length > 0) {
        console.group(`🔄 [${name}] Re-render #${renderCount.current}`);
        
        changes.forEach(change => {
          console.log(`📝 ${change.prop}:`, change.analysis);
          console.log('   Previous:', change.oldValue);
          console.log('   Current:', change.newValue);
          
          if (change.detailed) {
            console.log('   Detailed diff:', change.detailed);
          }
        });
        
        // Add performance timing if available
        if (performance.mark) {
          console.log('⏱️  Render timestamp:', performance.now());
        }
        
        console.groupEnd();
      }
    } else {
      console.log(`🎬 [${name}] Initial render`);
    }

    // Store current props for next comparison
    previousProps.current = props;
  });

  // Return render statistics for advanced debugging
  return {
    renderCount: renderCount.current,
    // Helper to manually check specific prop changes
    checkProp: (propName) => {
      if (!previousProps.current) return null;
      return {
        current: props[propName],
        previous: previousProps.current[propName],
        changed: !deepEqual(props[propName], previousProps.current[propName])
      };
    }
  };
}

/**
 * Generate detailed diff for objects
 * Helper function to create human-readable object diffs
 */
function generateDetailedDiff(oldObj, newObj, path = '') {
  const diff = {};
  
  // Handle null/undefined cases
  if (oldObj === null || oldObj === undefined) {
    return { added: newObj };
  }
  if (newObj === null || newObj === undefined) {
    return { removed: oldObj };
  }
  
  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);
  
  // Find added keys
  const added = {};
  newKeys.forEach(key => {
    if (!oldKeys.includes(key)) {
      added[key] = newObj[key];
    }
  });
  
  // Find removed keys
  const removed = {};
  oldKeys.forEach(key => {
    if (!newKeys.includes(key)) {
      removed[key] = oldObj[key];
    }
  });
  
  // Find changed keys
  const changed = {};
  oldKeys.forEach(key => {
    if (newKeys.includes(key) && oldObj[key] !== newObj[key]) {
      if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
        // Recursively diff nested objects
        changed[key] = generateDetailedDiff(oldObj[key], newObj[key], `${path}.${key}`);
      } else {
        changed[key] = {
          from: oldObj[key],
          to: newObj[key]
        };
      }
    }
  });
  
  const result = {};
  if (Object.keys(added).length > 0) result.added = added;
  if (Object.keys(removed).length > 0) result.removed = removed;
  if (Object.keys(changed).length > 0) result.changed = changed;
  
  return result;
}

/**
 * APPROACH 3: Performance-Focused Debug Hook
 * Optimized version with minimal performance impact and batch logging
 */
function useWhyDidYouUpdatePerformant(name, props, batchSize = 5) {
  const previousProps = useRef();
  const changeQueue = useRef([]);
  const batchTimeout = useRef();

  // Batch changes and log them together to reduce console spam
  const queueChange = (changes) => {
    changeQueue.current.push({
      timestamp: Date.now(),
      changes,
      renderCount: changeQueue.current.length + 1
    });
    
    // Clear existing timeout
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
    }
    
    // Set new timeout to batch logs
    batchTimeout.current = setTimeout(() => {
      if (changeQueue.current.length > 0) {
        console.group(`📊 [${name}] Batched Re-render Analysis`);
        
        changeQueue.current.forEach(({ timestamp, changes, renderCount }) => {
          console.log(`Render #${renderCount} at ${new Date(timestamp).toLocaleTimeString()}`);
          console.table(changes);
        });
        
        console.log(`Total renders in batch: ${changeQueue.current.length}`);
        console.groupEnd();
        
        // Clear the queue
        changeQueue.current = [];
      }
    }, 1000); // 1 second batch window
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    if (previousProps.current) {
      const changes = {};
      let hasChanges = false;
      
      // Quick shallow comparison first
      Object.keys(props).forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changes[key] = {
            old: previousProps.current[key],
            new: props[key],
            type: typeof props[key]
          };
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        queueChange(changes);
      }
    }
    
    previousProps.current = props;
    
    // Cleanup timeout on unmount
    return () => {
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  });
}

// Example usage patterns
const ExampleUsages = {
  /**
   * Basic usage in a component
   */
  BasicComponent: ({ userId, userName, items }) => {
    // Simple debugging - just pass props you want to monitor
    useWhyDidYouUpdate('BasicComponent', { userId, userName, items });
    
    return <div>Component content</div>;
  },

  /**
   * Enhanced debugging with custom options
   */
  AdvancedComponent: ({ config, data, callbacks }) => {
    const debugInfo = useWhyDidYouUpdateEnhanced('AdvancedComponent', 
      { config, data, callbacks }, 
      {
        detailed: true,
        exclude: ['callbacks'], // Don't log function props
        maxDepth: 2
      }
    );
    
    // Use debug info for additional insights
    if (debugInfo.renderCount > 10) {
      console.warn('Component has rendered many times:', debugInfo.renderCount);
    }
    
    return <div>Advanced component content</div>;
  },

  /**
   * Performance monitoring
   */
  PerformanceComponent: ({ heavyData, complexState }) => {
    // Use performant version for production-adjacent debugging
    useWhyDidYouUpdatePerformant('PerformanceComponent', {
      heavyData,
      complexState
    });
    
    return <div>Performance-sensitive component</div>;
  }
};

// Higher-order component wrapper for easy integration
const withWhyDidYouUpdate = (WrappedComponent, name = WrappedComponent.name) => {
  return (props) => {
    useWhyDidYouUpdate(name, props);
    return <WrappedComponent {...props} />;
  };
};

// Custom hook for automatic component name detection
const useAutoWhyDidYouUpdate = (props) => {
  // Try to get component name from call stack (development only)
  const componentName = (() => {
    try {
      throw new Error();
    } catch (error) {
      const stack = error.stack;
      // Parse component name from stack trace
      const match = stack.match(/at (\w+)/g);
      return match && match[1] ? match[1].replace('at ', '') : 'UnknownComponent';
    }
  })();
  
  useWhyDidYouUpdate(componentName, props);
};

/**
 * Testing utilities for debugging hooks
 */
const TestingUtils = {
  /**
   * Mock console methods for testing
   */
  mockConsole: () => {
    const originalLog = console.log;
    const originalGroup = console.group;
    const originalGroupEnd = console.groupEnd;
    
    const logs = [];
    
    console.log = (...args) => {
      logs.push({ type: 'log', args });
      if (process.env.NODE_ENV === 'test') return;
      originalLog(...args);
    };
    
    console.group = (...args) => {
      logs.push({ type: 'group', args });
      if (process.env.NODE_ENV === 'test') return;
      originalGroup(...args);
    };
    
    console.groupEnd = () => {
      logs.push({ type: 'groupEnd' });
      if (process.env.NODE_ENV === 'test') return;
      originalGroupEnd();
    };
    
    return {
      logs,
      restore: () => {
        console.log = originalLog;
        console.group = originalGroup;
        console.groupEnd = originalGroupEnd;
      }
    };
  },

  /**
   * Create test props that will trigger re-renders
   */
  createChangingProps: (baseProps, changes) => {
    return changes.map(change => ({
      ...baseProps,
      ...change
    }));
  }
};

// Export all implementations and utilities
export {
  useWhyDidYouUpdate,              // Basic implementation
  useWhyDidYouUpdateEnhanced,      // Advanced with options
  useWhyDidYouUpdatePerformant,    // Performance-optimized
  withWhyDidYouUpdate,             // HOC wrapper
  useAutoWhyDidYouUpdate,          // Auto-naming version
  ExampleUsages,                   // Usage examples
  TestingUtils                     // Testing helpers
};

// Default export for most common use case
export default useWhyDidYouUpdate;