/**
 * File: use-copy.js
 * Description: React hook for copying text to clipboard with fallback methods and user feedback
 * 
 * Learning objectives:
 * - Master modern Clipboard API and legacy fallback methods
 * - Handle async operations and error states in hooks
 * - Implement user feedback patterns for copy operations
 * - Understand browser security restrictions for clipboard access
 * 
 * Common use cases:
 * - Copy text content, URLs, or code snippets
 * - Share functionality in applications
 * - Quick copy buttons for forms and data tables
 * - Code documentation and tutorial sites
 * - Social sharing and referral systems
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * APPROACH 1: Basic Clipboard Hook
 * Simple implementation using modern Clipboard API with fallback
 * 
 * Mental model:
 * - Use navigator.clipboard.writeText() for modern browsers
 * - Fall back to execCommand('copy') for older browsers
 * - Track copy state and provide user feedback
 * - Handle permissions and security restrictions
 * 
 * Time Complexity: O(1) for copy operation
 * Space Complexity: O(1) per hook instance
 */
function useCopy(defaultValue = '', options = {}) {
  const [copyState, setCopyState] = useState({
    value: defaultValue,
    isCopied: false,
    isSupported: false
  });

  const {
    // Duration to show "copied" state (ms)
    successDuration = 2000,
    // Callback when copy succeeds
    onSuccess = null,
    // Callback when copy fails
    onError = null
  } = options;

  const timeoutRef = useRef(null);

  // Check clipboard support on mount
  useEffect(() => {
    const isSupported = 
      // Modern Clipboard API
      (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') ||
      // Legacy fallback support
      (document.queryCommandSupported && document.queryCommandSupported('copy'));
    
    setCopyState(prev => ({ ...prev, isSupported }));
  }, []);

  // Modern clipboard API implementation
  const copyWithClipboardAPI = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed:', error);
      return false;
    }
  }, []);

  // Legacy fallback implementation using execCommand
  const copyWithExecCommand = useCallback((text) => {
    try {
      // Create temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Position off-screen to avoid visual flash
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      
      document.body.appendChild(textArea);
      
      // Select and copy text
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.warn('ExecCommand copy failed:', error);
      return false;
    }
  }, []);

  // Main copy function
  const copy = useCallback(async (text = copyState.value) => {
    if (!copyState.isSupported) {
      const error = new Error('Copy operation not supported in this browser');
      onError && onError(error);
      return false;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      let success = false;

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        success = await copyWithClipboardAPI(text);
      }

      // Fall back to execCommand if clipboard API fails
      if (!success) {
        success = copyWithExecCommand(text);
      }

      if (success) {
        // Update state to show success
        setCopyState(prev => ({ ...prev, value: text, isCopied: true }));
        
        // Call success callback
        onSuccess && onSuccess(text);
        
        // Reset copied state after duration
        timeoutRef.current = setTimeout(() => {
          setCopyState(prev => ({ ...prev, isCopied: false }));
        }, successDuration);
        
        return true;
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      onError && onError(error);
      return false;
    }
  }, [copyState.value, copyState.isSupported, copyWithClipboardAPI, copyWithExecCommand, onSuccess, onError, successDuration]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...copyState,
    copy,
    // Reset copied state manually
    reset: () => setCopyState(prev => ({ ...prev, isCopied: false }))
  };
}

/**
 * APPROACH 2: Enhanced Copy Hook with Advanced Features
 * More sophisticated implementation with additional features
 * 
 * Features:
 * - Rich text and HTML copying
 * - Image and file copying support
 * - Copy history tracking
 * - Permission handling
 * - Advanced error reporting
 */
function useCopyAdvanced(options = {}) {
  const [copyState, setCopyState] = useState({
    lastCopied: null,
    isCopied: false,
    isSupported: false,
    error: null,
    history: []
  });

  const {
    successDuration = 2000,
    onSuccess = null,
    onError = null,
    // Track copy history (limited to prevent memory leaks)
    trackHistory = false,
    maxHistorySize = 10,
    // Show more detailed error information
    detailedErrors = true
  } = options;

  const timeoutRef = useRef(null);

  // Check comprehensive clipboard support
  useEffect(() => {
    const checkSupport = async () => {
      const basicSupport = 
        (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') ||
        (document.queryCommandSupported && document.queryCommandSupported('copy'));

      let advancedSupport = false;
      if (navigator.clipboard) {
        // Check for advanced clipboard features
        try {
          // Test if we can access clipboard (permission check)
          const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' });
          advancedSupport = permissionStatus.state !== 'denied';
        } catch (error) {
          // Permissions API might not be available
          advancedSupport = true; // Assume support if we can't check
        }
      }

      setCopyState(prev => ({ 
        ...prev, 
        isSupported: basicSupport,
        hasAdvancedSupport: advancedSupport
      }));
    };

    checkSupport();
  }, []);

  // Copy plain text
  const copyText = useCallback(async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback to execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      
      document.body.appendChild(textArea);
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('ExecCommand copy failed');
      }
    }
    
    return { type: 'text', content: text };
  }, []);

  // Copy rich content (HTML + text)
  const copyRich = useCallback(async (html, plainText) => {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      // Fall back to plain text if rich copying not supported
      await copyText(plainText || html.replace(/<[^>]*>/g, ''));
      return { type: 'text', content: plainText || html };
    }

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plainText || html.replace(/<[^>]*>/g, '')], { type: 'text/plain' })
    });

    await navigator.clipboard.write([clipboardItem]);
    return { type: 'rich', content: { html, text: plainText } };
  }, [copyText]);

  // Copy image from URL or blob
  const copyImage = useCallback(async (imageSource) => {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Image copying not supported in this browser');
    }

    let blob;
    
    if (imageSource instanceof Blob) {
      blob = imageSource;
    } else if (typeof imageSource === 'string') {
      // Fetch image from URL
      const response = await fetch(imageSource);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      blob = await response.blob();
    } else {
      throw new Error('Invalid image source. Expected Blob or URL string.');
    }

    const clipboardItem = new ClipboardItem({
      [blob.type]: blob
    });

    await navigator.clipboard.write([clipboardItem]);
    return { type: 'image', content: blob.type };
  }, []);

  // Main copy function with type detection
  const copy = useCallback(async (content, type = 'auto') => {
    if (!copyState.isSupported) {
      const error = new Error('Copy operation not supported');
      setCopyState(prev => ({ ...prev, error }));
      onError && onError(error);
      return false;
    }

    // Clear existing timeout and error
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCopyState(prev => ({ ...prev, error: null }));

    try {
      let result;

      // Determine copy type and execute appropriate method
      if (type === 'auto') {
        if (typeof content === 'string') {
          // Check if content looks like HTML
          if (/<[a-z][\s\S]*>/i.test(content)) {
            type = 'rich';
          } else {
            type = 'text';
          }
        } else if (content instanceof Blob) {
          type = 'image';
        } else if (content && typeof content === 'object' && content.html) {
          type = 'rich';
        }
      }

      switch (type) {
        case 'text':
          result = await copyText(content);
          break;
        case 'rich':
          if (typeof content === 'object' && content.html) {
            result = await copyRich(content.html, content.text);
          } else {
            result = await copyRich(content);
          }
          break;
        case 'image':
          result = await copyImage(content);
          break;
        default:
          throw new Error(`Unknown copy type: ${type}`);
      }

      // Update state with success
      const newState = {
        lastCopied: result,
        isCopied: true,
        error: null
      };

      // Add to history if tracking enabled
      if (trackHistory) {
        const historyEntry = {
          timestamp: Date.now(),
          ...result
        };
        
        newState.history = [
          historyEntry,
          ...copyState.history.slice(0, maxHistorySize - 1)
        ];
      }

      setCopyState(prev => ({ ...prev, ...newState }));

      // Call success callback
      onSuccess && onSuccess(result);

      // Reset copied state after duration
      timeoutRef.current = setTimeout(() => {
        setCopyState(prev => ({ ...prev, isCopied: false }));
      }, successDuration);

      return true;

    } catch (error) {
      const enhancedError = detailedErrors ? {
        message: error.message,
        type: error.name,
        code: error.code || null,
        timestamp: Date.now()
      } : error;

      setCopyState(prev => ({ ...prev, error: enhancedError, isCopied: false }));
      onError && onError(enhancedError);
      return false;
    }
  }, [copyState.isSupported, copyState.history, copyText, copyRich, copyImage, trackHistory, maxHistorySize, detailedErrors, onSuccess, onError, successDuration]);

  // Utility methods
  const clearHistory = useCallback(() => {
    setCopyState(prev => ({ ...prev, history: [] }));
  }, []);

  const getLastCopied = useCallback(() => {
    return copyState.lastCopied;
  }, [copyState.lastCopied]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...copyState,
    copy,
    copyText: (text) => copy(text, 'text'),
    copyRich: (html, text) => copy({ html, text }, 'rich'),
    copyImage: (image) => copy(image, 'image'),
    clearHistory,
    getLastCopied,
    reset: () => setCopyState(prev => ({ ...prev, isCopied: false, error: null }))
  };
}

/**
 * APPROACH 3: Specialized Copy Hooks for Common Use Cases
 * Pre-configured hooks for specific copy scenarios
 */

// Hook for copying code snippets with syntax highlighting preservation
function useCopyCode(code = '', language = '') {
  const { copy, isCopied, isSupported } = useCopyAdvanced({
    successDuration: 1500,
    onSuccess: () => console.log(`Copied ${language} code to clipboard`),
    onError: (error) => console.error('Failed to copy code:', error)
  });

  const copyCode = useCallback(async (codeText = code) => {
    // Create rich content with code formatting
    const html = `<pre><code class="language-${language}">${codeText}</code></pre>`;
    const plainText = codeText;
    
    return await copy({ html, text: plainText }, 'rich');
  }, [copy, code, language]);

  return {
    copyCode,
    isCopied,
    isSupported
  };
}

// Hook for copying URLs with additional metadata
function useCopyUrl(baseUrl = '') {
  const { copy, isCopied, isSupported } = useCopy(baseUrl, {
    successDuration: 1000,
    onSuccess: (url) => console.log(`URL copied: ${url}`)
  });

  const copyUrl = useCallback((url = baseUrl, params = {}) => {
    const urlObj = new URL(url);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      urlObj.searchParams.set(key, params[key]);
    });
    
    return copy(urlObj.toString());
  }, [copy, baseUrl]);

  const copyCurrentPage = useCallback(() => {
    return copy(window.location.href);
  }, [copy]);

  return {
    copyUrl,
    copyCurrentPage,
    isCopied,
    isSupported
  };
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Copy button component
   */
  CopyButton: ({ text, children }) => {
    const { copy, isCopied, isSupported } = useCopy(text, {
      successDuration: 1500,
      onSuccess: (copied) => console.log('Copied:', copied)
    });

    if (!isSupported) {
      return <span>Copy not supported</span>;
    }

    return (
      <button 
        onClick={() => copy()}
        className={isCopied ? 'copy-success' : ''}
      >
        {isCopied ? '✓ Copied!' : (children || 'Copy')}
      </button>
    );
  },

  /**
   * Code block with copy functionality
   */
  CodeBlock: ({ code, language }) => {
    const { copyCode, isCopied } = useCopyCode(code, language);

    return (
      <div className="code-block">
        <div className="code-header">
          <span className="language">{language}</span>
          <button onClick={() => copyCode()} className="copy-btn">
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre><code>{code}</code></pre>
      </div>
    );
  },

  /**
   * Share button with URL copying
   */
  ShareButton: ({ url, title }) => {
    const { copyUrl, isCopied } = useCopyUrl(url);

    const handleShare = () => {
      // Add tracking parameters
      copyUrl(url, {
        utm_source: 'share_button',
        utm_medium: 'copy',
        shared_title: title
      });
    };

    return (
      <button onClick={handleShare} className="share-btn">
        {isCopied ? 'Link Copied!' : 'Share'}
      </button>
    );
  },

  /**
   * Advanced copy with rich content
   */
  RichCopyExample: () => {
    const { copy, copyRich, isCopied, error } = useCopyAdvanced({
      trackHistory: true,
      detailedErrors: true
    });

    const handleCopyFormatted = () => {
      copyRich(
        '<strong>Bold text</strong> and <em>italic text</em>',
        'Bold text and italic text'
      );
    };

    return (
      <div className="rich-copy-example">
        <button onClick={handleCopyFormatted}>
          Copy Formatted Text
        </button>
        {isCopied && <span>✓ Copied with formatting!</span>}
        {error && <span>Error: {error.message}</span>}
      </div>
    );
  }
};

/**
 * Testing utilities for clipboard functionality
 */
const TestingUtils = {
  /**
   * Mock Clipboard API for testing
   */
  mockClipboardAPI: () => {
    const mockWriteText = jest.fn().mockResolvedValue();
    const mockWrite = jest.fn().mockResolvedValue();
    const mockReadText = jest.fn().mockResolvedValue('');

    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
        write: mockWrite,
        readText: mockReadText
      }
    });

    // Mock permissions API
    Object.assign(navigator, {
      permissions: {
        query: jest.fn().mockResolvedValue({ state: 'granted' })
      }
    });

    return {
      mockWriteText,
      mockWrite,
      mockReadText
    };
  },

  /**
   * Mock execCommand for legacy testing
   */
  mockExecCommand: () => {
    const mockExecCommand = jest.fn().mockReturnValue(true);
    const mockQueryCommandSupported = jest.fn().mockReturnValue(true);

    Object.assign(document, {
      execCommand: mockExecCommand,
      queryCommandSupported: mockQueryCommandSupported
    });

    return {
      mockExecCommand,
      mockQueryCommandSupported
    };
  },

  /**
   * Simulate copy failure
   */
  simulateFailure: (method = 'clipboard') => {
    if (method === 'clipboard' && navigator.clipboard) {
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Permission denied'));
    } else if (method === 'execCommand') {
      document.execCommand = jest.fn().mockReturnValue(false);
    }
  }
};

// Export all implementations and utilities
export {
  useCopy,                     // Basic copy functionality
  useCopyAdvanced,             // Advanced with rich content support
  useCopyCode,                 // Specialized for code copying
  useCopyUrl,                  // Specialized for URL copying
  ExampleUsages,               // Usage examples
  TestingUtils                 // Testing utilities
};

// Default export for most common use case
export default useCopy;