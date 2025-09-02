/**
 * File: use-idle.js
 * Description: Custom React hook for detecting user idle state with configurable timeout
 * 
 * Learning objectives:
 * - Understand event-driven idle detection patterns
 * - Learn proper event listener cleanup in React
 * - Master timeout management and resource optimization
 * 
 * Time Complexity: O(1) for state updates
 * Space Complexity: O(1)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect when user becomes idle (inactive) for a specified duration
 * 
 * Idle detection is crucial for:
 * - Auto-logout for security
 * - Resource cleanup (pause video, stop animations)
 * - Power saving (reduce API polling)
 * - User experience (show hints, reduce notifications)
 * 
 * @param {number} timeout - Milliseconds of inactivity before considered idle (default: 300000 = 5min)
 * @param {Array<string>} events - Events to track for activity (default: common user interactions)
 * @returns {boolean} true if user is idle, false if active
 */
function useIdle(timeout = 300000, events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']) {
  const [idle, setIdle] = useState(false);
  
  // Use refs to avoid recreating listeners on every render
  const timeoutId = useRef(null);
  const eventListenerOptions = useRef({ passive: true, capture: false });
  
  // Memoized function to reset idle timer
  // useCallback prevents unnecessary re-creation of this function
  const resetTimer = useCallback(() => {
    // Clear existing timeout if any
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    // If currently idle, mark as active
    setIdle(false);
    
    // Set new timeout to mark as idle
    timeoutId.current = setTimeout(() => {
      setIdle(true);
    }, timeout);
  }, [timeout]);
  
  // Initialize timer and event listeners on mount
  useEffect(() => {
    // Start the initial timer
    resetTimer();
    
    // Add event listeners to track user activity
    // We use passive listeners for better performance
    events.forEach(event => {
      document.addEventListener(event, resetTimer, eventListenerOptions.current);
    });
    
    // Cleanup function - CRITICAL for preventing memory leaks
    return () => {
      // Clear the timeout
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      
      // Remove all event listeners
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, eventListenerOptions.current);
      });
    };
  }, [resetTimer, events]);
  
  return idle;
}

/**
 * Enhanced version with additional features and callbacks
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Idle timeout in milliseconds
 * @param {Array<string>} options.events - Events to track
 * @param {Function} options.onIdle - Callback when user becomes idle
 * @param {Function} options.onActive - Callback when user becomes active
 * @param {boolean} options.initialState - Initial idle state
 * @returns {Object} { idle, lastActive, remainingTime }
 */
function useIdleWithCallbacks({
  timeout = 300000,
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
  onIdle,
  onActive,
  initialState = false
}) {
  const [idle, setIdle] = useState(initialState);
  const [lastActive, setLastActive] = useState(Date.now());
  const [remainingTime, setRemainingTime] = useState(timeout);
  
  const timeoutId = useRef(null);
  const intervalId = useRef(null);
  
  const resetTimer = useCallback(() => {
    const now = Date.now();
    setLastActive(now);
    setRemainingTime(timeout);
    
    // Clear existing timers
    if (timeoutId.current) clearTimeout(timeoutId.current);
    if (intervalId.current) clearInterval(intervalId.current);
    
    // If was idle, trigger onActive callback
    if (idle) {
      setIdle(false);
      onActive?.();
    }
    
    // Update remaining time every second
    intervalId.current = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = Math.max(0, prev - 1000);
        return newTime;
      });
    }, 1000);
    
    // Set main idle timer
    timeoutId.current = setTimeout(() => {
      setIdle(true);
      onIdle?.();
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    }, timeout);
  }, [timeout, idle, onIdle, onActive]);
  
  useEffect(() => {
    resetTimer();
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });
    
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      if (intervalId.current) clearInterval(intervalId.current);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer, events]);
  
  return { idle, lastActive, remainingTime };
}

/**
 * Example usage in a React component:
 * 
 * function App() {
 *   const isIdle = useIdle(60000); // 1 minute timeout
 *   
 *   return (
 *     <div>
 *       <h1>User is {isIdle ? 'idle' : 'active'}</h1>
 *       {isIdle && (
 *         <div className="idle-banner">
 *           You've been idle for a while. Move your mouse to continue.
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */

// Real-world example: Auto-logout component
function AutoLogout() {
  const isIdle = useIdle(15 * 60 * 1000); // 15 minutes
  
  useEffect(() => {
    if (isIdle) {
      // Show warning before logout
      const confirm = window.confirm('You\'ve been idle. Stay logged in?');
      if (!confirm) {
        // Perform logout
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
      }
    }
  }, [isIdle]);
  
  return null; // This component doesn't render anything
}

// Real-world example: Resource optimization
function VideoPlayer({ videoUrl }) {
  const isIdle = useIdle(30000); // 30 seconds
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef();
  
  useEffect(() => {
    if (isIdle && !isPaused && videoRef.current) {
      // Pause video when user is idle to save bandwidth
      videoRef.current.pause();
    }
  }, [isIdle, isPaused]);
  
  return (
    <div>
      <video 
        ref={videoRef}
        src={videoUrl}
        onPlay={() => setIsPaused(false)}
        onPause={() => setIsPaused(true)}
      />
      {isIdle && <div className="idle-overlay">Video paused due to inactivity</div>}
    </div>
  );
}

// Real-world example: Notification management
function NotificationManager() {
  const { idle, remainingTime } = useIdleWithCallbacks({
    timeout: 120000, // 2 minutes
    onIdle: () => {
      console.log('User went idle - reducing notification frequency');
    },
    onActive: () => {
      console.log('User is active again - resuming normal notifications');
    }
  });
  
  return (
    <div className="notification-status">
      {idle ? (
        <span>Notifications paused (user idle)</span>
      ) : (
        <span>Active - {Math.round(remainingTime / 1000)}s until idle</span>
      )}
    </div>
  );
}

export { useIdle, useIdleWithCallbacks };