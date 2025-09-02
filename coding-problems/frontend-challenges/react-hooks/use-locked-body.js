/**
 * File: use-locked-body.js
 * Description: React hook for preventing body scroll when modals/overlays are open
 * 
 * Learning objectives:
 * - Master scroll prevention techniques for modal overlays
 * - Handle body scroll restoration and cleanup
 * - Implement cross-browser compatible scroll locking
 * - Manage multiple overlapping scroll locks
 * 
 * Common use cases:
 * - Modal dialogs and overlays
 * - Full-screen mobile menus
 * - Image lightboxes and carousels
 * - Drawer components and sidebars
 * - Loading screens that require scroll prevention
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * APPROACH 1: Basic Body Scroll Lock Hook
 * Simple implementation to prevent body scrolling
 * 
 * Mental model:
 * - Set body overflow to 'hidden' when lock is active
 * - Store original scroll position and body styles
 * - Restore original state when lock is removed
 * - Handle cleanup on component unmount
 * 
 * Time Complexity: O(1) for lock/unlock operations
 * Space Complexity: O(1) per hook instance
 */
function useLockedBody(initialLocked = false) {
  const originalStyleRef = useRef(null);
  const originalScrollYRef = useRef(0);

  const lock = useCallback(() => {
    // Store current scroll position
    originalScrollYRef.current = window.pageYOffset;
    
    // Store original body styles
    const body = document.body;
    originalStyleRef.current = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left
    };

    // Get scrollbar width to prevent layout shift
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Apply scroll lock styles
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollBarWidth}px`;
    
    // Fix body position to prevent scroll restoration on iOS
    body.style.position = 'fixed';
    body.style.top = `-${originalScrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
  }, []);

  const unlock = useCallback(() => {
    if (!originalStyleRef.current) return;

    const body = document.body;
    const scrollY = originalScrollYRef.current;

    // Restore original styles
    Object.keys(originalStyleRef.current).forEach(key => {
      body.style[key] = originalStyleRef.current[key];
    });

    // Clear stored references
    originalStyleRef.current = null;
    originalScrollYRef.current = 0;

    // Restore scroll position
    window.scrollTo(0, scrollY);
  }, []);

  useEffect(() => {
    if (initialLocked) {
      lock();
    }

    // Cleanup on unmount
    return () => {
      if (originalStyleRef.current) {
        unlock();
      }
    };
  }, [initialLocked, lock, unlock]);

  return {
    lock,
    unlock,
    isLocked: originalStyleRef.current !== null
  };
}

/**
 * APPROACH 2: Advanced Scroll Lock with Reference Counting
 * Enhanced implementation that handles multiple overlapping locks
 * 
 * Features:
 * - Reference counting for nested/multiple locks
 * - Custom scroll restoration behavior
 * - iOS Safari specific fixes
 * - Touch event prevention for mobile
 * - Configurable lock options
 */

// Global reference counter for managing multiple locks
let lockCount = 0;
let originalBodyStyle = null;
let originalScrollPosition = 0;

function useLockedBodyAdvanced(initialLocked = false, options = {}) {
  const isLockedRef = useRef(false);
  const lockIdRef = useRef(null);

  const {
    // Prevent touch events on locked elements (helpful for mobile)
    preventTouchEvents = true,
    // Restore scroll position when unlocking
    restoreScrollPosition = true,
    // Allow scrolling within specific elements (CSS selector)
    allowScrollSelector = null,
    // Custom body scroll container (for custom scroll implementations)
    scrollContainer = null,
    // Minimum scroll position to maintain (useful for sticky headers)
    minScrollY = 0
  } = options;

  // Enhanced lock function with reference counting
  const lock = useCallback(() => {
    if (isLockedRef.current) return; // Already locked by this hook

    // Increment global lock count
    lockCount++;
    isLockedRef.current = true;
    lockIdRef.current = Date.now();

    // Only apply styles on first lock
    if (lockCount === 1) {
      const body = document.body;
      const container = scrollContainer || body;
      
      // Store original state
      originalScrollPosition = Math.max(window.pageYOffset, minScrollY);
      originalBodyStyle = {
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width
      };

      // Calculate scrollbar width
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Apply lock styles
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollBarWidth}px`;
      
      // iOS Safari fix: Use fixed positioning to prevent body scroll
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        body.style.position = 'fixed';
        body.style.top = `-${originalScrollPosition}px`;
        body.style.left = '0';
        body.style.right = '0';
        body.style.width = '100%';
      }

      // Add touch event prevention
      if (preventTouchEvents) {
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
      }
    }
  }, [preventTouchEvents, restoreScrollPosition, allowScrollSelector, scrollContainer, minScrollY]);

  // Enhanced unlock function with reference counting
  const unlock = useCallback(() => {
    if (!isLockedRef.current) return; // Not locked by this hook

    // Decrement global lock count
    lockCount = Math.max(0, lockCount - 1);
    isLockedRef.current = false;
    lockIdRef.current = null;

    // Only restore styles when all locks are released
    if (lockCount === 0 && originalBodyStyle) {
      const body = document.body;
      const scrollY = originalScrollPosition;

      // Restore original styles
      Object.keys(originalBodyStyle).forEach(key => {
        body.style[key] = originalBodyStyle[key] || '';
      });

      // Clear stored state
      originalBodyStyle = null;
      
      // Restore scroll position if requested
      if (restoreScrollPosition) {
        window.scrollTo(0, scrollY);
      }
      
      originalScrollPosition = 0;

      // Remove touch event prevention
      if (preventTouchEvents) {
        document.removeEventListener('touchmove', handleTouchMove);
      }
    }
  }, [preventTouchEvents, restoreScrollPosition]);

  // Handle touch events for mobile scroll prevention
  const handleTouchMove = useCallback((event) => {
    // Allow scrolling within specified selectors
    if (allowScrollSelector) {
      const scrollableElement = event.target.closest(allowScrollSelector);
      if (scrollableElement) {
        // Check if the scrollable element can actually scroll
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
        const isScrollable = scrollHeight > clientHeight;
        
        if (isScrollable) {
          // Allow touch event if within scrollable bounds
          const touchY = event.touches[0].clientY;
          const rect = scrollableElement.getBoundingClientRect();
          
          if (touchY >= rect.top && touchY <= rect.bottom) {
            return; // Allow scroll within this element
          }
        }
      }
    }

    // Prevent default touch behavior
    event.preventDefault();
  }, [allowScrollSelector]);

  // Initialize lock state
  useEffect(() => {
    if (initialLocked) {
      lock();
    }

    // Cleanup on unmount
    return () => {
      if (isLockedRef.current) {
        unlock();
      }
    };
  }, [initialLocked, lock, unlock]);

  return {
    lock,
    unlock,
    toggle: () => isLockedRef.current ? unlock() : lock(),
    isLocked: isLockedRef.current,
    lockCount, // Global lock count for debugging
    lockId: lockIdRef.current // Unique ID for this lock instance
  };
}

/**
 * APPROACH 3: Scroll Lock Manager Hook
 * Global manager for coordinating multiple scroll locks across components
 * 
 * Useful for complex applications with multiple modals, drawers, and overlays
 * that might appear simultaneously
 */
function useScrollLockManager() {
  const activeLocks = useRef(new Map());

  const addLock = useCallback((lockId, options = {}) => {
    if (activeLocks.current.has(lockId)) {
      console.warn(`Lock with ID '${lockId}' already exists`);
      return;
    }

    const lockInfo = {
      id: lockId,
      timestamp: Date.now(),
      options,
      active: true
    };

    activeLocks.current.set(lockId, lockInfo);

    // Apply lock if this is the first one
    if (activeLocks.current.size === 1) {
      applyScrollLock(options);
    }
  }, []);

  const removeLock = useCallback((lockId) => {
    if (!activeLocks.current.has(lockId)) {
      console.warn(`Lock with ID '${lockId}' does not exist`);
      return;
    }

    activeLocks.current.delete(lockId);

    // Remove lock if this was the last one
    if (activeLocks.current.size === 0) {
      removeScrollLock();
    }
  }, []);

  const hasActiveLocks = useCallback(() => {
    return activeLocks.current.size > 0;
  }, []);

  const getActiveLocks = useCallback(() => {
    return Array.from(activeLocks.current.values());
  }, []);

  const clearAllLocks = useCallback(() => {
    activeLocks.current.clear();
    removeScrollLock();
  }, []);

  // Priority-based lock management
  const getLockWithHighestPriority = useCallback(() => {
    const locks = Array.from(activeLocks.current.values());
    return locks.reduce((highest, current) => {
      const currentPriority = current.options.priority || 0;
      const highestPriority = highest?.options?.priority || 0;
      return currentPriority > highestPriority ? current : highest;
    }, null);
  }, []);

  return {
    addLock,
    removeLock,
    hasActiveLocks,
    getActiveLocks,
    clearAllLocks,
    getLockWithHighestPriority,
    lockCount: activeLocks.current.size
  };
}

// Helper functions for scroll lock implementation
function applyScrollLock(options = {}) {
  const body = document.body;
  const scrollY = window.pageYOffset;
  
  // Store original styles
  body.dataset.originalOverflow = body.style.overflow || '';
  body.dataset.originalPaddingRight = body.style.paddingRight || '';
  body.dataset.originalPosition = body.style.position || '';
  body.dataset.originalTop = body.style.top || '';
  body.dataset.scrollPosition = scrollY.toString();

  // Calculate and apply styles
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  
  body.style.overflow = 'hidden';
  body.style.paddingRight = `${scrollBarWidth}px`;
  
  // Mobile-specific fixes
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
  }
}

function removeScrollLock() {
  const body = document.body;
  
  // Restore original styles
  body.style.overflow = body.dataset.originalOverflow || '';
  body.style.paddingRight = body.dataset.originalPaddingRight || '';
  body.style.position = body.dataset.originalPosition || '';
  body.style.top = body.dataset.originalTop || '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';

  // Restore scroll position
  const scrollY = parseInt(body.dataset.scrollPosition || '0', 10);
  window.scrollTo(0, scrollY);

  // Clean up data attributes
  delete body.dataset.originalOverflow;
  delete body.dataset.originalPaddingRight;
  delete body.dataset.originalPosition;
  delete body.dataset.originalTop;
  delete body.dataset.scrollPosition;
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Modal component with scroll lock
   */
  Modal: ({ isOpen, onClose, children }) => {
    const { lock, unlock } = useLockedBody();
    
    useEffect(() => {
      if (isOpen) {
        lock();
      } else {
        unlock();
      }
      
      // Cleanup on unmount
      return () => unlock();
    }, [isOpen, lock, unlock]);
    
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  },

  /**
   * Mobile menu with scroll lock
   */
  MobileMenu: ({ isOpen }) => {
    const { toggle, isLocked } = useLockedBodyAdvanced(isOpen, {
      preventTouchEvents: true,
      allowScrollSelector: '.scrollable-content'
    });
    
    return (
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <h2>Navigation</h2>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
          
          {/* Scrollable content within locked body */}
          <div className="scrollable-content">
            <p>This content can scroll even when body is locked</p>
            {/* Long content that requires scrolling */}
          </div>
        </div>
        
        <div className="lock-status">
          Body scroll: {isLocked ? 'Locked' : 'Unlocked'}
        </div>
      </div>
    );
  },

  /**
   * Nested modals with managed locks
   */
  NestedModalsExample: () => {
    const [modal1Open, setModal1Open] = useState(false);
    const [modal2Open, setModal2Open] = useState(false);
    const lockManager = useScrollLockManager();
    
    useEffect(() => {
      if (modal1Open) {
        lockManager.addLock('modal1', { priority: 1 });
      } else {
        lockManager.removeLock('modal1');
      }
    }, [modal1Open, lockManager]);
    
    useEffect(() => {
      if (modal2Open) {
        lockManager.addLock('modal2', { priority: 2 }); // Higher priority
      } else {
        lockManager.removeLock('modal2');
      }
    }, [modal2Open, lockManager]);
    
    return (
      <div>
        <button onClick={() => setModal1Open(true)}>Open Modal 1</button>
        
        {modal1Open && (
          <div className="modal">
            <h2>Modal 1</h2>
            <button onClick={() => setModal2Open(true)}>Open Modal 2</button>
            <button onClick={() => setModal1Open(false)}>Close</button>
          </div>
        )}
        
        {modal2Open && (
          <div className="modal modal-priority">
            <h2>Modal 2 (Higher Priority)</h2>
            <button onClick={() => setModal2Open(false)}>Close</button>
          </div>
        )}
        
        <div className="status">
          Active locks: {lockManager.lockCount}
          <br />
          Has locks: {lockManager.hasActiveLocks() ? 'Yes' : 'No'}
        </div>
      </div>
    );
  }
};

// Mock useState for examples
const useState = (initial) => {
  const value = useRef(initial);
  const setValue = (newValue) => {
    value.current = typeof newValue === 'function' ? newValue(value.current) : newValue;
  };
  return [value.current, setValue];
};

/**
 * Testing utilities for scroll lock functionality
 */
const TestingUtils = {
  /**
   * Mock window and document properties
   */
  mockScrollEnvironment: () => {
    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 100
    });
    
    // Mock document properties
    Object.defineProperty(document.documentElement, 'clientWidth', {
      writable: true,
      configurable: true,
      value: 1000 // 24px scrollbar
    });
    
    // Mock body style
    document.body.style = {
      overflow: '',
      paddingRight: '',
      position: '',
      top: '',
      left: '',
      right: '',
      width: ''
    };
    
    // Mock scrollTo
    window.scrollTo = jest.fn();
  },

  /**
   * Simulate mobile user agent
   */
  mockMobileUserAgent: () => {
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
  },

  /**
   * Test scroll lock state
   */
  assertScrollLocked: () => {
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('24px'); // scrollbar width
  },

  /**
   * Test scroll lock removal
   */
  assertScrollUnlocked: () => {
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
  }
};

// Export all implementations and utilities
export {
  useLockedBody,               // Basic scroll lock
  useLockedBodyAdvanced,       // Advanced with options
  useScrollLockManager,        // Global lock management
  ExampleUsages,               // Usage examples
  TestingUtils                 // Testing utilities
};

// Default export for most common use case
export default useLockedBody;