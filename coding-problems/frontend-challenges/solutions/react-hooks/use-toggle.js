/**
 * File: use-toggle.js
 * Description: Custom React hook for boolean state toggling with optional value support
 * 
 * Learning objectives:
 * - Understand state management patterns for UI controls
 * - Learn callback optimization with useCallback
 * - Master flexible toggle implementations for various use cases
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */

import { useState, useCallback } from 'react';

/**
 * Hook for toggling boolean state with enhanced functionality
 * 
 * Toggle patterns are essential for:
 * - Modal visibility control
 * - Feature toggles and flags
 * - UI state management (expanded/collapsed, visible/hidden)
 * - Form field states (checked/unchecked, enabled/disabled)
 * 
 * @param {boolean} initialValue - Initial toggle state (default: false)
 * @returns {Array} [value, toggle, setTrue, setFalse, setValue]
 */
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  // useCallback prevents unnecessary re-renders of child components
  // that depend on these functions
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  // Allow direct value setting while maintaining the same interface
  const setToggleValue = useCallback((newValue) => {
    setValue(newValue);
  }, []);
  
  return [value, toggle, setTrue, setFalse, setToggleValue];
}

/**
 * Enhanced toggle hook with multiple value support
 * Cycles through an array of values instead of just true/false
 * 
 * @param {Array} values - Array of values to cycle through
 * @param {number} initialIndex - Initial index in the values array
 * @returns {Object} { value, toggle, setValue, reset, index }
 */
function useMultiToggle(values = [false, true], initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const toggle = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % values.length);
  }, [values.length]);
  
  const setValue = useCallback((newValue) => {
    const index = values.indexOf(newValue);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [values]);
  
  const setIndex = useCallback((index) => {
    if (index >= 0 && index < values.length) {
      setCurrentIndex(index);
    }
  }, [values.length]);
  
  const reset = useCallback(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);
  
  return {
    value: values[currentIndex],
    index: currentIndex,
    toggle,
    setValue,
    setIndex,
    reset
  };
}

/**
 * Toggle hook with persistence to localStorage
 * Maintains toggle state across browser sessions
 * 
 * @param {string} key - localStorage key
 * @param {boolean} initialValue - Default value if not in storage
 * @returns {Array} [value, toggle, setTrue, setFalse, setValue]
 */
function usePersistedToggle(key, initialValue = false) {
  // Initialize state from localStorage if available
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.warn(`Failed to read ${key} from localStorage:`, error);
      return initialValue;
    }
  });
  
  // Update localStorage whenever value changes
  const setPersistedValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key]);
  
  const toggle = useCallback(() => {
    setPersistedValue(prev => !prev);
  }, [setPersistedValue]);
  
  const setTrue = useCallback(() => {
    setPersistedValue(true);
  }, [setPersistedValue]);
  
  const setFalse = useCallback(() => {
    setPersistedValue(false);
  }, [setPersistedValue]);
  
  return [value, toggle, setTrue, setFalse, setPersistedValue];
}

/**
 * Example usage in a React component:
 * 
 * function ToggleExample() {
 *   const [isVisible, toggleVisible, showModal, hideModal] = useToggle(false);
 *   
 *   return (
 *     <div>
 *       <button onClick={toggleVisible}>
 *         {isVisible ? 'Hide' : 'Show'} Modal
 *       </button>
 *       <button onClick={showModal}>Show Modal</button>
 *       <button onClick={hideModal}>Hide Modal</button>
 *       
 *       {isVisible && (
 *         <div className="modal">
 *           Modal Content
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */

// Real-world example: Collapsible content
function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, toggle, expand, collapse] = useToggle(defaultOpen);
  
  return (
    <div className="collapsible-section">
      <button 
        className="collapsible-header"
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
      
      <div className="collapsible-actions">
        <button onClick={expand} disabled={isOpen}>Expand</button>
        <button onClick={collapse} disabled={!isOpen}>Collapse</button>
      </div>
    </div>
  );
}

// Real-world example: Theme switcher with multiple themes
function ThemeSwitcher() {
  const themes = ['light', 'dark', 'auto'];
  const { value: currentTheme, toggle, setValue } = useMultiToggle(themes, 0);
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);
  
  return (
    <div className="theme-switcher">
      <button onClick={toggle} className="theme-toggle">
        Current Theme: {currentTheme}
      </button>
      
      <div className="theme-options">
        {themes.map(theme => (
          <button
            key={theme}
            onClick={() => setValue(theme)}
            className={currentTheme === theme ? 'active' : ''}
          >
            {theme}
          </button>
        ))}
      </div>
    </div>
  );
}

// Real-world example: Feature flags with persistence
function FeatureTogglePanel() {
  const [debugMode, toggleDebug] = usePersistedToggle('debugMode', false);
  const [betaFeatures, toggleBeta] = usePersistedToggle('betaFeatures', false);
  const [analytics, toggleAnalytics] = usePersistedToggle('analytics', true);
  
  return (
    <div className="feature-toggle-panel">
      <h3>Feature Toggles</h3>
      
      <label className="toggle-item">
        <input
          type="checkbox"
          checked={debugMode}
          onChange={toggleDebug}
        />
        <span>Debug Mode</span>
        {debugMode && <span className="status active">ON</span>}
      </label>
      
      <label className="toggle-item">
        <input
          type="checkbox"
          checked={betaFeatures}
          onChange={toggleBeta}
        />
        <span>Beta Features</span>
        {betaFeatures && <span className="status active">ON</span>}
      </label>
      
      <label className="toggle-item">
        <input
          type="checkbox"
          checked={analytics}
          onChange={toggleAnalytics}
        />
        <span>Analytics</span>
        {analytics && <span className="status active">ON</span>}
      </label>
    </div>
  );
}

// Real-world example: Modal with multiple states
function NotificationModal() {
  const [isVisible, toggleModal, showModal, hideModal] = useToggle(false);
  const [isMinimized, toggleMinimize, minimize, maximize] = useToggle(false);
  
  const handleShow = useCallback(() => {
    showModal();
    maximize(); // Ensure it's not minimized when showing
  }, [showModal, maximize]);
  
  if (!isVisible) {
    return (
      <button onClick={handleShow} className="show-modal-btn">
        Show Notifications
      </button>
    );
  }
  
  return (
    <div className={`modal ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="modal-header">
        <h3>Notifications</h3>
        <div className="modal-controls">
          <button onClick={toggleMinimize}>
            {isMinimized ? '□' : '−'}
          </button>
          <button onClick={hideModal}>✕</button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="modal-content">
          <p>Your notifications will appear here...</p>
        </div>
      )}
    </div>
  );
}

// Real-world example: Settings panel with grouped toggles
function SettingsPanel() {
  const [notifications, toggleNotifications] = usePersistedToggle('notifications', true);
  const [emailAlerts, toggleEmailAlerts] = usePersistedToggle('emailAlerts', false);
  const [pushAlerts, togglePushAlerts] = usePersistedToggle('pushAlerts', true);
  const [darkMode, toggleDarkMode] = usePersistedToggle('darkMode', false);
  
  // Disable email/push if notifications are off
  useEffect(() => {
    if (!notifications) {
      // Could auto-disable sub-settings when parent is disabled
      // But keeping them independent for this example
    }
  }, [notifications]);
  
  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      
      <section className="settings-section">
        <h3>Notifications</h3>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={toggleNotifications}
            />
            Enable Notifications
          </label>
          
          <label className={!notifications ? 'disabled' : ''}>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={toggleEmailAlerts}
              disabled={!notifications}
            />
            Email Alerts
          </label>
          
          <label className={!notifications ? 'disabled' : ''}>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={togglePushAlerts}
              disabled={!notifications}
            />
            Push Notifications
          </label>
        </div>
      </section>
      
      <section className="settings-section">
        <h3>Appearance</h3>
        <div className="toggle-group">
          <label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            Dark Mode
          </label>
        </div>
      </section>
    </div>
  );
}

export { useToggle, useMultiToggle, usePersistedToggle };