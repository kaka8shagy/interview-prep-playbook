/**
 * File: number-increment-counter.js
 * Description: React component for animated number incrementing with customizable animations and formatting
 * 
 * Learning objectives:
 * - Master smooth number transitions and animations in React
 * - Implement custom animation curves and timing functions
 * - Handle large number formatting and internationalization
 * - Create reusable animation components with performance optimization
 * 
 * Common use cases:
 * - Dashboard metrics and KPIs
 * - Statistics displays and counters
 * - Progress indicators and achievement systems
 * - Financial applications with currency display
 * - Analytics dashboards and data visualization
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * APPROACH 1: Basic Number Counter Component
 * Simple implementation with linear animation
 * 
 * Mental model:
 * - Use requestAnimationFrame for smooth 60fps animation
 * - Linear interpolation between start and end values
 * - Track animation state and progress
 * - Handle component cleanup to prevent memory leaks
 * 
 * Time Complexity: O(1) per frame update
 * Space Complexity: O(1) per counter instance
 */
function NumberCounter({ 
  value, 
  duration = 1000,
  formatValue = (num) => num.toLocaleString(),
  onComplete = null,
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const endValueRef = useRef(value);

  // Animation function using requestAnimationFrame
  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // Linear interpolation between start and end values
    const currentValue = startValueRef.current + 
      (endValueRef.current - startValueRef.current) * progress;
    
    setDisplayValue(Math.round(currentValue));

    if (progress < 1) {
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      setIsAnimating(false);
      setDisplayValue(endValueRef.current);
      
      if (onComplete) {
        onComplete(endValueRef.current);
      }
    }
  }, [duration, onComplete]);

  // Start animation when value changes
  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Set up new animation
    startValueRef.current = displayValue;
    endValueRef.current = value;
    startTimeRef.current = null;
    setIsAnimating(true);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate]);

  return (
    <span className={`number-counter ${isAnimating ? 'animating' : ''} ${className}`}>
      {formatValue(displayValue)}
    </span>
  );
}

/**
 * APPROACH 2: Advanced Counter with Easing and Multiple Animation Types
 * Enhanced implementation with custom easing functions and animation styles
 * 
 * Features:
 * - Multiple easing functions (ease-in, ease-out, bounce, etc.)
 * - Digit-by-digit animation for large numbers
 * - Prefix/suffix support (currency symbols, units)
 * - Color transitions during animation
 * - Performance optimizations for large datasets
 */
function AdvancedNumberCounter({
  value,
  duration = 1500,
  easingFunction = 'easeOutQuart',
  animationType = 'smooth', // 'smooth' | 'typewriter' | 'digit-flip'
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  separator = ',',
  decimal = '.',
  formatValue = null,
  onStart = null,
  onUpdate = null,
  onComplete = null,
  className = '',
  style = {}
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [animationState, setAnimationState] = useState({
    isAnimating: false,
    progress: 0,
    currentValue: 0
  });

  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(0);
  const targetValueRef = useRef(value);

  // Easing functions for different animation curves
  const easingFunctions = useMemo(() => ({
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    easeOutElastic: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutBounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }), []);

  // Custom number formatter
  const defaultFormatter = useCallback((num) => {
    // Handle decimal places
    const fixedNum = Number(num).toFixed(decimalPlaces);
    const [integerPart, decimalPart] = fixedNum.split('.');
    
    // Add thousand separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    // Combine parts
    let formatted = formattedInteger;
    if (decimalPlaces > 0) {
      formatted += decimal + decimalPart;
    }
    
    return prefix + formatted + suffix;
  }, [decimalPlaces, separator, decimal, prefix, suffix]);

  // Animation loop with custom easing
  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      
      if (onStart) {
        onStart(targetValueRef.current);
      }
    }

    const elapsed = timestamp - startTimeRef.current;
    const rawProgress = Math.min(elapsed / duration, 1);
    
    // Apply easing function
    const easingFn = easingFunctions[easingFunction] || easingFunctions.easeOutQuart;
    const easedProgress = easingFn(rawProgress);
    
    // Calculate current value based on animation type
    let currentValue;
    
    switch (animationType) {
      case 'typewriter':
        // Simulate typing effect - increment in chunks
        const chunks = Math.max(1, Math.floor(Math.abs(targetValueRef.current - startValueRef.current) / 20));
        currentValue = startValueRef.current + 
          Math.floor(easedProgress * chunks) * 
          Math.ceil((targetValueRef.current - startValueRef.current) / chunks);
        break;
        
      case 'digit-flip':
        // Animate each digit separately for flip effect
        currentValue = animateDigitFlip(startValueRef.current, targetValueRef.current, easedProgress);
        break;
        
      default: // 'smooth'
        currentValue = startValueRef.current + 
          (targetValueRef.current - startValueRef.current) * easedProgress;
    }

    // Update state
    const roundedValue = Math.round(currentValue);
    setDisplayValue(roundedValue);
    setAnimationState({
      isAnimating: rawProgress < 1,
      progress: rawProgress,
      currentValue: roundedValue
    });

    // Call update callback
    if (onUpdate) {
      onUpdate(roundedValue, rawProgress);
    }

    if (rawProgress < 1) {
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Animation complete
      setDisplayValue(targetValueRef.current);
      setAnimationState({
        isAnimating: false,
        progress: 1,
        currentValue: targetValueRef.current
      });
      
      if (onComplete) {
        onComplete(targetValueRef.current);
      }
    }
  }, [duration, easingFunction, animationType, easingFunctions, onStart, onUpdate, onComplete]);

  // Helper function for digit-flip animation
  const animateDigitFlip = useCallback((start, end, progress) => {
    const startStr = Math.abs(start).toString();
    const endStr = Math.abs(end).toString();
    const maxLength = Math.max(startStr.length, endStr.length);
    
    let result = '';
    
    for (let i = 0; i < maxLength; i++) {
      const startDigit = parseInt(startStr[startStr.length - 1 - i] || '0');
      const endDigit = parseInt(endStr[endStr.length - 1 - i] || '0');
      
      // Animate each digit with slight delay based on position
      const digitProgress = Math.max(0, Math.min(1, (progress - i * 0.1) * 1.5));
      const currentDigit = Math.round(startDigit + (endDigit - startDigit) * digitProgress);
      
      result = currentDigit + result;
    }
    
    const numResult = parseInt(result);
    return end < 0 ? -numResult : numResult;
  }, []);

  // Start animation when value changes
  useEffect(() => {
    if (targetValueRef.current === value) return; // No change needed

    // Cancel existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Set up new animation
    startValueRef.current = displayValue;
    targetValueRef.current = value;
    startTimeRef.current = null;

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate, displayValue]);

  // Format the display value
  const formattedValue = formatValue ? formatValue(displayValue) : defaultFormatter(displayValue);

  return (
    <span 
      className={`advanced-number-counter ${animationState.isAnimating ? 'animating' : ''} ${className}`}
      style={{
        ...style,
        // Add CSS custom properties for potential styling
        '--animation-progress': animationState.progress,
        '--current-value': animationState.currentValue
      }}
      data-animation-type={animationType}
      data-easing={easingFunction}
    >
      {formattedValue}
    </span>
  );
}

/**
 * APPROACH 3: Multi-Counter Dashboard Component
 * Component for displaying multiple animated counters in a dashboard layout
 * 
 * Useful for analytics dashboards, KPI displays, and metric showcases
 */
function CounterDashboard({ counters, title, onAllComplete = null, className = '' }) {
  const [completedCounters, setCompletedCounters] = useState(new Set());
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Handle individual counter completion
  const handleCounterComplete = useCallback((counterId) => {
    setCompletedCounters(prev => {
      const newSet = new Set(prev);
      newSet.add(counterId);
      return newSet;
    });
  }, []);

  // Check if all counters are complete
  useEffect(() => {
    const allComplete = counters.every(counter => completedCounters.has(counter.id));
    
    if (allComplete && !isAllComplete) {
      setIsAllComplete(true);
      if (onAllComplete) {
        onAllComplete();
      }
    }
  }, [completedCounters, counters, isAllComplete, onAllComplete]);

  return (
    <div className={`counter-dashboard ${isAllComplete ? 'all-complete' : ''} ${className}`}>
      {title && <h2 className="dashboard-title">{title}</h2>}
      
      <div className="counters-grid">
        {counters.map((counter, index) => (
          <div 
            key={counter.id} 
            className={`counter-card ${completedCounters.has(counter.id) ? 'complete' : ''}`}
            style={{ '--animation-delay': `${index * 100}ms` }}
          >
            {counter.icon && (
              <div className="counter-icon">
                {counter.icon}
              </div>
            )}
            
            <div className="counter-content">
              {counter.label && (
                <div className="counter-label">{counter.label}</div>
              )}
              
              <AdvancedNumberCounter
                value={counter.value}
                duration={counter.duration || 1500}
                easingFunction={counter.easing || 'easeOutQuart'}
                animationType={counter.animationType || 'smooth'}
                prefix={counter.prefix || ''}
                suffix={counter.suffix || ''}
                decimalPlaces={counter.decimalPlaces || 0}
                onComplete={() => handleCounterComplete(counter.id)}
                className="counter-value"
              />
              
              {counter.description && (
                <div className="counter-description">{counter.description}</div>
              )}
              
              {counter.trend && (
                <div className={`counter-trend ${counter.trend.direction}`}>
                  <span className="trend-icon">
                    {counter.trend.direction === 'up' ? '↗' : 
                     counter.trend.direction === 'down' ? '↘' : '→'}
                  </span>
                  <span className="trend-value">{counter.trend.value}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-footer">
        <div className="completion-status">
          {completedCounters.size} of {counters.length} metrics loaded
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(completedCounters.size / counters.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Basic counter example
   */
  BasicExample: () => {
    const [value, setValue] = useState(0);
    
    return (
      <div className="basic-example">
        <h3>Basic Counter</h3>
        <NumberCounter 
          value={value}
          duration={1000}
          formatValue={(num) => num.toLocaleString()}
          onComplete={() => console.log('Animation complete!')}
        />
        
        <div className="controls">
          <button onClick={() => setValue(1000)}>1,000</button>
          <button onClick={() => setValue(25000)}>25,000</button>
          <button onClick={() => setValue(999999)}>999,999</button>
          <button onClick={() => setValue(0)}>Reset</button>
        </div>
      </div>
    );
  },

  /**
   * Currency counter with advanced features
   */
  CurrencyCounter: () => {
    const [revenue, setRevenue] = useState(0);
    
    return (
      <div className="currency-counter">
        <h3>Monthly Revenue</h3>
        <AdvancedNumberCounter
          value={revenue}
          duration={2000}
          easingFunction="easeOutBounce"
          animationType="smooth"
          prefix="$"
          suffix=""
          decimalPlaces={2}
          separator=","
          decimal="."
          onStart={() => console.log('Revenue animation started')}
          onComplete={(value) => console.log(`Revenue reached: $${value}`)}
          className="revenue-display"
        />
        
        <div className="controls">
          <button onClick={() => setRevenue(45750.50)}>Q1 Revenue</button>
          <button onClick={() => setRevenue(67890.25)}>Q2 Revenue</button>
          <button onClick={() => setRevenue(89123.75)}>Q3 Revenue</button>
        </div>
      </div>
    );
  },

  /**
   * Analytics dashboard with multiple counters
   */
  AnalyticsDashboard: () => {
    const [metricsData, setMetricsData] = useState([
      {
        id: 'users',
        label: 'Active Users',
        value: 0,
        icon: '👥',
        suffix: '',
        animationType: 'smooth',
        easing: 'easeOutQuart',
        trend: { direction: 'up', value: '+12%' }
      },
      {
        id: 'revenue',
        label: 'Revenue',
        value: 0,
        icon: '💰',
        prefix: '$',
        decimalPlaces: 2,
        animationType: 'typewriter',
        easing: 'easeOutCubic',
        trend: { direction: 'up', value: '+8.5%' }
      },
      {
        id: 'conversion',
        label: 'Conversion Rate',
        value: 0,
        icon: '📈',
        suffix: '%',
        decimalPlaces: 1,
        animationType: 'digit-flip',
        easing: 'easeOutElastic',
        trend: { direction: 'down', value: '-2.1%' }
      },
      {
        id: 'pageviews',
        label: 'Page Views',
        value: 0,
        icon: '👁',
        suffix: '',
        animationType: 'smooth',
        easing: 'easeOutBounce',
        trend: { direction: 'up', value: '+15.2%' }
      }
    ]);

    const loadDashboardData = () => {
      setMetricsData(prev => prev.map(metric => ({
        ...metric,
        value: {
          users: 12847,
          revenue: 45690.75,
          conversion: 3.2,
          pageviews: 156789
        }[metric.id]
      })));
    };

    return (
      <div className="analytics-dashboard">
        <CounterDashboard
          title="Analytics Dashboard"
          counters={metricsData}
          onAllComplete={() => console.log('All metrics loaded!')}
        />
        
        <button onClick={loadDashboardData} className="load-data-btn">
          Load Dashboard Data
        </button>
      </div>
    );
  }
};

// Mock useState for examples (replace with actual React import in real usage)
const mockUseState = (initial) => {
  let value = initial;
  const setValue = (newValue) => {
    value = typeof newValue === 'function' ? newValue(value) : newValue;
  };
  return [value, setValue];
};

/**
 * Testing utilities for counter components
 */
const TestingUtils = {
  /**
   * Mock requestAnimationFrame for testing
   */
  mockAnimationFrame: () => {
    let id = 0;
    const callbacks = new Map();
    
    global.requestAnimationFrame = jest.fn((callback) => {
      const currentId = ++id;
      callbacks.set(currentId, callback);
      return currentId;
    });
    
    global.cancelAnimationFrame = jest.fn((id) => {
      callbacks.delete(id);
    });
    
    return {
      // Manually trigger animation frames
      tick: (timestamp = performance.now()) => {
        callbacks.forEach(callback => callback(timestamp));
      },
      // Get number of pending frames
      pendingFrames: () => callbacks.size
    };
  },

  /**
   * Wait for animation to complete
   */
  waitForAnimation: async (duration = 1000) => {
    return new Promise(resolve => {
      setTimeout(resolve, duration + 100); // Add small buffer
    });
  },

  /**
   * Simulate value changes for testing
   */
  createValueSequence: (values, interval = 500) => {
    return new Promise((resolve) => {
      let index = 0;
      const sequence = setInterval(() => {
        if (index >= values.length) {
          clearInterval(sequence);
          resolve();
          return;
        }
        
        // This would trigger setValue in real component
        console.log(`Setting value to: ${values[index]}`);
        index++;
      }, interval);
    });
  }
};

// CSS styles for components (would be in separate CSS file in real app)
const styles = `
  .number-counter {
    font-family: monospace;
    font-weight: bold;
    display: inline-block;
    transition: color 0.3s ease;
  }

  .number-counter.animating {
    color: #007bff;
  }

  .advanced-number-counter {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 600;
    display: inline-block;
    letter-spacing: -0.02em;
  }

  .counter-dashboard {
    padding: 24px;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .dashboard-title {
    margin: 0 0 24px 0;
    text-align: center;
    color: #333;
  }

  .counters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .counter-card {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    animation: fadeInUp 0.6s ease-out;
    animation-delay: var(--animation-delay, 0ms);
    animation-fill-mode: both;
  }

  .counter-card.complete {
    border-left: 4px solid #28a745;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .counter-icon {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .counter-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .counter-value {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  .counter-trend {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
  }

  .counter-trend.up {
    color: #28a745;
  }

  .counter-trend.down {
    color: #dc3545;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #007bff;
    transition: width 0.3s ease;
  }
`;

// Export all implementations and utilities
export {
  NumberCounter,               // Basic counter component
  AdvancedNumberCounter,       // Advanced counter with easing
  CounterDashboard,            // Multi-counter dashboard
  ExampleUsages,               // Usage examples
  TestingUtils,                // Testing utilities
  styles                       // CSS styles
};

// Default export for most common use case
export default NumberCounter;