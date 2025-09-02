/**
 * File: use-has-focus.js
 * Description: React hook for tracking focus state of elements and document
 * 
 * Learning objectives:
 * - Master focus event handling in React applications
 * - Understand focus/blur event propagation and bubbling
 * - Implement accessibility-focused UI patterns
 * - Handle focus management for complex components
 * 
 * Common use cases:
 * - Modal focus trapping
 * - Form validation and UX improvements
 * - Accessibility enhancements
 * - Keyboard navigation systems
 * - Auto-save on focus loss
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * APPROACH 1: Basic Element Focus Hook
 * Simple implementation to track if a specific element has focus
 * 
 * Mental model:
 * - Attach focus/blur event listeners to element
 * - Track focus state in component state
 * - Handle cleanup on unmount
 * - Support initial focus detection
 * 
 * Time Complexity: O(1) for event handling
 * Space Complexity: O(1) per tracked element
 */
function useHasFocus(initialFocus = false) {
  const [hasFocus, setHasFocus] = useState(initialFocus);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check initial focus state
    // This handles cases where element might already be focused
    if (document.activeElement === element) {
      setHasFocus(true);
    }

    // Focus event handler
    const handleFocus = (event) => {
      // Only update if the focus is on our element
      // event.target is the element that received focus
      if (event.target === element) {
        setHasFocus(true);
      }
    };

    // Blur event handler
    const handleBlur = (event) => {
      // Only update if the blur is from our element
      // event.target is the element that lost focus
      if (event.target === element) {
        setHasFocus(false);
      }
    };

    // Attach event listeners
    // Using capture phase to ensure we catch all focus events
    element.addEventListener('focus', handleFocus, true);
    element.addEventListener('blur', handleBlur, true);

    // Cleanup function
    return () => {
      element.removeEventListener('focus', handleFocus, true);
      element.removeEventListener('blur', handleBlur, true);
    };
  }, []); // Empty dependency array - set up listeners once

  return {
    elementRef,
    hasFocus,
    // Utility method to programmatically focus element
    focus: () => {
      if (elementRef.current) {
        elementRef.current.focus();
      }
    },
    // Utility method to programmatically blur element
    blur: () => {
      if (elementRef.current) {
        elementRef.current.blur();
      }
    }
  };
}

/**
 * APPROACH 2: Advanced Focus Hook with Focus Within
 * Enhanced implementation that tracks focus within element tree
 * 
 * Features:
 * - Track focus within element and its children
 * - Handle focus/blur with relatedTarget for accurate detection
 * - Support for focus trap patterns
 * - Debounced focus changes for performance
 */
function useHasFocusAdvanced(options = {}) {
  const {
    // Track focus within element tree (not just direct focus)
    trackFocusWithin = true,
    // Debounce focus changes (useful for rapid focus changes)
    debounceMs = 0,
    // Callback when focus enters element tree
    onFocusEnter = null,
    // Callback when focus leaves element tree
    onFocusLeave = null,
    // Initial focus state
    initialFocus = false
  } = options;

  const [focusState, setFocusState] = useState({
    hasFocus: initialFocus,
    hasFocusWithin: initialFocus,
    activeElement: null
  });

  const elementRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debounced state update function
  const updateFocusState = useCallback((newState) => {
    if (debounceMs > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setFocusState(prev => {
          const updated = { ...prev, ...newState };
          
          // Trigger callbacks if focus within state changed
          if (prev.hasFocusWithin !== updated.hasFocusWithin) {
            if (updated.hasFocusWithin && onFocusEnter) {
              onFocusEnter(updated.activeElement);
            } else if (!updated.hasFocusWithin && onFocusLeave) {
              onFocusLeave();
            }
          }
          
          return updated;
        });
      }, debounceMs);
    } else {
      setFocusState(prev => {
        const updated = { ...prev, ...newState };
        
        // Trigger callbacks immediately
        if (prev.hasFocusWithin !== updated.hasFocusWithin) {
          if (updated.hasFocusWithin && onFocusEnter) {
            onFocusEnter(updated.activeElement);
          } else if (!updated.hasFocusWithin && onFocusLeave) {
            onFocusLeave();
          }
        }
        
        return updated;
      });
    }
  }, [debounceMs, onFocusEnter, onFocusLeave]);

  // Check if element contains the focused element
  const isElementWithinFocus = useCallback((element, focusedElement) => {
    if (!element || !focusedElement) return false;
    return element === focusedElement || element.contains(focusedElement);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check initial focus state
    const activeElement = document.activeElement;
    const initialDirectFocus = activeElement === element;
    const initialFocusWithin = trackFocusWithin ? 
      isElementWithinFocus(element, activeElement) : 
      initialDirectFocus;

    updateFocusState({
      hasFocus: initialDirectFocus,
      hasFocusWithin: initialFocusWithin,
      activeElement: initialFocusWithin ? activeElement : null
    });

    // Focus event handler
    const handleFocus = (event) => {
      const focusedElement = event.target;
      const isDirectFocus = focusedElement === element;
      const isFocusWithin = trackFocusWithin ? 
        isElementWithinFocus(element, focusedElement) : 
        isDirectFocus;

      updateFocusState({
        hasFocus: isDirectFocus,
        hasFocusWithin: isFocusWithin,
        activeElement: isFocusWithin ? focusedElement : null
      });
    };

    // Blur event handler
    const handleBlur = (event) => {
      const blurredElement = event.target;
      const relatedTarget = event.relatedTarget;
      
      // Check if focus is moving to another element within our tree
      const isDirectBlur = blurredElement === element;
      const isFocusLeavingTree = trackFocusWithin ? 
        !isElementWithinFocus(element, relatedTarget) : 
        isDirectBlur;

      if (isFocusLeavingTree) {
        updateFocusState({
          hasFocus: false,
          hasFocusWithin: false,
          activeElement: null
        });
      } else if (isDirectBlur && trackFocusWithin) {
        // Focus moved from our element to a child - update direct focus only
        updateFocusState({
          hasFocus: false,
          hasFocusWithin: true,
          activeElement: relatedTarget
        });
      }
    };

    // Use capture phase to catch all focus events in the tree
    element.addEventListener('focus', handleFocus, true);
    element.addEventListener('blur', handleBlur, true);

    // Cleanup
    return () => {
      element.removeEventListener('focus', handleFocus, true);
      element.removeEventListener('blur', handleBlur, true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trackFocusWithin, updateFocusState, isElementWithinFocus]);

  return {
    elementRef,
    ...focusState,
    // Utility methods
    focus: () => {
      if (elementRef.current) {
        elementRef.current.focus();
      }
    },
    blur: () => {
      if (elementRef.current) {
        elementRef.current.blur();
      }
    },
    // Find focusable elements within the tree
    getFocusableElements: () => {
      const element = elementRef.current;
      if (!element) return [];
      
      const focusableSelectors = [
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'button:not([disabled])',
        'a[href]',
        'area[href]',
        'iframe',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(',');
      
      return Array.from(element.querySelectorAll(focusableSelectors));
    }
  };
}

/**
 * APPROACH 3: Document Focus Hook
 * Hook for tracking overall document focus state and window focus
 * 
 * Useful for:
 * - Detecting when user switches browser tabs
 * - Pausing/resuming activities when window loses focus
 * - Auto-save when user leaves the page
 */
function useDocumentFocus() {
  const [documentState, setDocumentState] = useState({
    // Whether the document has focus (not in background tab)
    hasFocus: typeof document !== 'undefined' ? document.hasFocus() : true,
    // Whether any element in document has focus
    hasActiveElement: typeof document !== 'undefined' ? !!document.activeElement && document.activeElement !== document.body : false,
    // Current active element
    activeElement: typeof document !== 'undefined' ? document.activeElement : null,
    // Visibility state of the document
    isVisible: typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  });

  useEffect(() => {
    // Handle window focus/blur events
    const handleWindowFocus = () => {
      setDocumentState(prev => ({
        ...prev,
        hasFocus: true
      }));
    };

    const handleWindowBlur = () => {
      setDocumentState(prev => ({
        ...prev,
        hasFocus: false
      }));
    };

    // Handle document focus changes (any element gaining/losing focus)
    const handleDocumentFocusIn = (event) => {
      setDocumentState(prev => ({
        ...prev,
        hasActiveElement: true,
        activeElement: event.target
      }));
    };

    const handleDocumentFocusOut = (event) => {
      // Check if focus is truly leaving (not moving to another element)
      setTimeout(() => {
        const hasActive = !!document.activeElement && document.activeElement !== document.body;
        setDocumentState(prev => ({
          ...prev,
          hasActiveElement: hasActive,
          activeElement: hasActive ? document.activeElement : null
        }));
      }, 0);
    };

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      setDocumentState(prev => ({
        ...prev,
        isVisible: document.visibilityState === 'visible'
      }));
    };

    // Add event listeners
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('focusin', handleDocumentFocusIn);
    document.addEventListener('focusout', handleDocumentFocusOut);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('focusin', handleDocumentFocusIn);
      document.removeEventListener('focusout', handleDocumentFocusOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return documentState;
}

/**
 * Focus Trap Hook
 * Specialized hook for implementing focus trapping (e.g., in modals)
 */
function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);
  const lastFocusedElement = useRef(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'a[href]:not([tabindex="-1"])',
      'area[href]:not([tabindex="-1"])',
      'iframe:not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])'
    ].join(',');
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors))
      .filter(element => {
        // Filter out invisible elements
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the currently focused element to restore later
    lastFocusedElement.current = document.activeElement;

    // Focus first focusable element in container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key to trap focus
    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab - moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab - moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Handle escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        // Return focus to the element that was focused before trap
        if (lastFocusedElement.current) {
          lastFocusedElement.current.focus();
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
      
      // Restore focus when trap is deactivated
      if (lastFocusedElement.current && document.contains(lastFocusedElement.current)) {
        lastFocusedElement.current.focus();
      }
    };
  }, [isActive, getFocusableElements]);

  return {
    containerRef,
    // Manually restore focus to previous element
    restoreFocus: () => {
      if (lastFocusedElement.current && document.contains(lastFocusedElement.current)) {
        lastFocusedElement.current.focus();
      }
    },
    // Get focusable elements in container
    getFocusableElements
  };
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Form field with focus indicator
   */
  FocusIndicatorInput: ({ placeholder, ...props }) => {
    const { elementRef, hasFocus } = useHasFocus();
    
    return (
      <div className={`input-container ${hasFocus ? 'focused' : ''}`}>
        <input 
          ref={elementRef}
          placeholder={placeholder}
          className={hasFocus ? 'input-focused' : ''}
          {...props}
        />
        {hasFocus && <div className="focus-indicator">✓ Active</div>}
      </div>
    );
  },

  /**
   * Auto-save form on focus loss
   */
  AutoSaveForm: ({ onSave }) => {
    const { elementRef, hasFocusWithin } = useHasFocusAdvanced({
      trackFocusWithin: true,
      onFocusLeave: () => {
        console.log('Form lost focus, auto-saving...');
        onSave && onSave();
      }
    });
    
    return (
      <form ref={elementRef} className="auto-save-form">
        <input type="text" placeholder="First name" />
        <input type="text" placeholder="Last name" />
        <textarea placeholder="Comments" />
        {!hasFocusWithin && <div className="saved-indicator">✓ Saved</div>}
      </form>
    );
  },

  /**
   * Modal with focus trap
   */
  Modal: ({ isOpen, onClose, children }) => {
    const { containerRef } = useFocusTrap(isOpen);
    
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div 
          ref={containerRef}
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose}>×</button>
          {children}
          <div className="modal-actions">
            <button>Cancel</button>
            <button>Confirm</button>
          </div>
        </div>
      </div>
    );
  },

  /**
   * Document focus monitor
   */
  DocumentFocusMonitor: () => {
    const { hasFocus, isVisible, hasActiveElement, activeElement } = useDocumentFocus();
    
    return (
      <div className="focus-monitor">
        <div>Window Focus: {hasFocus ? '✓' : '✗'}</div>
        <div>Page Visible: {isVisible ? '✓' : '✗'}</div>
        <div>Has Active Element: {hasActiveElement ? '✓' : '✗'}</div>
        <div>Active Element: {activeElement?.tagName || 'None'}</div>
      </div>
    );
  }
};

/**
 * Testing utilities for focus-related hooks
 */
const TestingUtils = {
  /**
   * Mock focus events for testing
   */
  mockFocusEvents: () => {
    const focusEvent = new Event('focus', { bubbles: true });
    const blurEvent = new Event('blur', { bubbles: true });
    
    return {
      focus: (element) => {
        // Set active element
        Object.defineProperty(document, 'activeElement', {
          writable: true,
          value: element
        });
        element.dispatchEvent(focusEvent);
      },
      blur: (element) => {
        const blurEvent = new Event('blur', { 
          bubbles: true,
          relatedTarget: document.body // Focus moves to body
        });
        element.dispatchEvent(blurEvent);
        
        // Update active element
        Object.defineProperty(document, 'activeElement', {
          writable: true,
          value: document.body
        });
      }
    };
  },

  /**
   * Create focusable element for testing
   */
  createFocusableElement: (tagName = 'input', attributes = {}) => {
    const element = document.createElement(tagName);
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
    element.focus = jest.fn();
    element.blur = jest.fn();
    return element;
  },

  /**
   * Mock document focus state
   */
  mockDocumentFocus: (hasFocus = true) => {
    Object.defineProperty(document, 'hasFocus', {
      writable: true,
      value: () => hasFocus
    });
    
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      value: hasFocus ? 'visible' : 'hidden'
    });
  }
};

// Export all implementations and utilities
export {
  useHasFocus,                 // Basic element focus tracking
  useHasFocusAdvanced,         // Advanced with focus-within support
  useDocumentFocus,            // Document-level focus tracking
  useFocusTrap,                // Focus trapping for modals
  ExampleUsages,               // Usage examples
  TestingUtils                 // Testing utilities
};

// Default export for most common use case
export default useHasFocus;