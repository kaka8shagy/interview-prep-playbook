/**
 * File: use-previous.js
 * Description: Custom React hook for tracking previous values across renders
 * 
 * Learning objectives:
 * - Understand useRef for persistent values across renders
 * - Learn how to track state changes and compare values
 * - Master cleanup and memory management patterns
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */

import { useRef, useEffect } from 'react';

/**
 * Custom hook to track the previous value of a state or prop
 * 
 * This hook is incredibly useful for:
 * - Form validation (checking if a field changed)
 * - Animation triggers (starting animation when value changes)
 * - Debugging re-renders and state changes
 * - Conditional effects based on value changes
 * 
 * @param {any} value - The current value to track
 * @returns {any} The previous value from the last render
 */
function usePrevious(value) {
  // useRef creates a mutable object that persists across renders
  // Unlike state, changing ref.current doesn't trigger re-renders
  const ref = useRef();
  
  // useEffect runs AFTER the render is committed to the DOM
  // This timing is crucial - we capture the previous value first,
  // then update the ref with the new value for the next render
  useEffect(() => {
    // Store the current value to be the "previous" value for next render
    // This happens after we've already returned the previous value
    ref.current = value;
  });
  
  // Return the previous value (or undefined on first render)
  // On first render: ref.current is undefined (no previous value exists)
  // On subsequent renders: ref.current contains the value from previous render
  return ref.current;
}

/**
 * Enhanced version with optional comparison function
 * Useful when you need custom equality logic for complex objects
 * 
 * @param {any} value - The current value to track
 * @param {Function} compareFn - Optional comparison function (a, b) => boolean
 * @returns {any} The previous value if different, otherwise undefined
 */
function usePreviousDistinct(value, compareFn = Object.is) {
  const ref = useRef({
    value: value,
    previous: undefined
  });
  
  // Only update if the value has actually changed according to compareFn
  if (!compareFn(value, ref.current.value)) {
    ref.current.previous = ref.current.value;
    ref.current.value = value;
  }
  
  return ref.current.previous;
}

/**
 * Example usage in a React component:
 * 
 * function MyComponent({ count }) {
 *   const prevCount = usePrevious(count);
 *   
 *   useEffect(() => {
 *     if (prevCount !== undefined && prevCount < count) {
 *       console.log('Count increased from', prevCount, 'to', count);
 *       // Trigger animation or other side effect
 *     }
 *   }, [count, prevCount]);
 *   
 *   return (
 *     <div>
 *       <p>Current: {count}</p>
 *       <p>Previous: {prevCount ?? 'None'}</p>
 *     </div>
 *   );
 * }
 */

// Example with form validation
function FormExample() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const prevEmail = usePrevious(email);
  
  useEffect(() => {
    // Only validate when email actually changes, not on every render
    if (prevEmail !== undefined && prevEmail !== email) {
      const emailErrors = validateEmail(email);
      setErrors(prev => ({ ...prev, email: emailErrors }));
    }
  }, [email, prevEmail]);
  
  return (
    <input 
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={{ borderColor: errors.email ? 'red' : 'initial' }}
    />
  );
}

// Example with animation triggers
function AnimatedCounter({ count }) {
  const prevCount = usePrevious(count);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Trigger animation only when count increases
    if (prevCount !== undefined && count > prevCount) {
      setIsAnimating(true);
      // Reset animation after duration
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count, prevCount]);
  
  return (
    <div className={`counter ${isAnimating ? 'animate-pulse' : ''}`}>
      {count}
    </div>
  );
}

// Real-world example: API request optimization
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevUserId = usePrevious(userId);
  
  useEffect(() => {
    // Only fetch when userId actually changes, preventing unnecessary API calls
    if (userId && userId !== prevUserId) {
      setLoading(true);
      fetchUser(userId)
        .then(setUser)
        .finally(() => setLoading(false));
    }
  }, [userId, prevUserId]);
  
  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}

export { usePrevious, usePreviousDistinct };