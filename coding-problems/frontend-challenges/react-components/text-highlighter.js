/**
 * File: text-highlighter.js
 * Description: React component for highlighting text with search terms, patterns, and custom styling
 * 
 * Learning objectives:
 * - Master text processing and string manipulation in React
 * - Implement efficient search and highlighting algorithms
 * - Handle regex patterns and case-sensitive matching
 * - Create performant text rendering with custom markup
 * 
 * Common use cases:
 * - Search result highlighting
 * - Code syntax highlighting
 * - Documentation and help systems
 * - Content management and editing tools
 * - Educational applications with text analysis
 */

import React, { useMemo, useCallback } from 'react';

/**
 * APPROACH 1: Basic Text Highlighter Component
 * Simple implementation for highlighting search terms in text
 * 
 * Mental model:
 * - Split text by search terms while preserving the terms
 * - Wrap matching terms in highlight elements
 * - Handle case sensitivity and multiple terms
 * - Render as React elements with proper keys
 * 
 * Time Complexity: O(n * m) where n is text length, m is number of search terms
 * Space Complexity: O(n) for storing text segments
 */
function TextHighlighter({
  text,
  searchTerms = [],
  caseSensitive = false,
  highlightClassName = 'highlighted',
  highlightStyle = { backgroundColor: 'yellow' },
  className = '',
  as = 'span'
}) {
  // Memoized highlight processing to avoid re-computation
  const highlightedContent = useMemo(() => {
    if (!text || searchTerms.length === 0) {
      return text;
    }

    // Normalize search terms
    const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
    const normalizedTerms = terms
      .filter(term => term && typeof term === 'string' && term.length > 0)
      .map(term => caseSensitive ? term : term.toLowerCase());

    if (normalizedTerms.length === 0) {
      return text;
    }

    // Create regex pattern to match any of the search terms
    // Escape special regex characters in search terms
    const escapedTerms = normalizedTerms.map(term => 
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, caseSensitive ? 'g' : 'gi');
    
    // Split text by matches while keeping the matched terms
    const parts = text.split(pattern);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      // Check if this part is a match (odd indices in split result)
      const isMatch = normalizedTerms.some(term => 
        caseSensitive ? part === term : part.toLowerCase() === term
      );
      
      if (isMatch) {
        return (
          <mark 
            key={index}
            className={highlightClassName}
            style={highlightStyle}
          >
            {part}
          </mark>
        );
      }
      
      return part;
    }).filter(part => part !== null);
  }, [text, searchTerms, caseSensitive, highlightClassName, highlightStyle]);

  const Component = as;
  
  return (
    <Component className={className}>
      {highlightedContent}
    </Component>
  );
}

/**
 * APPROACH 2: Advanced Pattern Highlighter
 * Enhanced implementation with regex patterns, multiple styles, and advanced options
 * 
 * Features:
 * - Regex pattern support
 * - Multiple highlight styles for different pattern types
 * - Word boundary matching
 * - Configurable case sensitivity per pattern
 * - Priority-based highlighting for overlapping matches
 */
function AdvancedTextHighlighter({
  text,
  patterns = [],
  defaultHighlightStyle = { backgroundColor: '#ffeb3b' },
  className = '',
  as = 'span',
  preserveWhitespace = false,
  maxHighlights = null, // Limit number of highlights for performance
  onHighlight = null // Callback when highlighting occurs
}) {
  // Process and normalize patterns
  const processedPatterns = useMemo(() => {
    return patterns.map((pattern, index) => {
      if (typeof pattern === 'string') {
        return {
          id: `pattern-${index}`,
          pattern: pattern,
          isRegex: false,
          caseSensitive: false,
          wholeWord: false,
          style: defaultHighlightStyle,
          className: 'highlight',
          priority: 0
        };
      }
      
      return {
        id: pattern.id || `pattern-${index}`,
        pattern: pattern.pattern,
        isRegex: pattern.isRegex || false,
        caseSensitive: pattern.caseSensitive || false,
        wholeWord: pattern.wholeWord || false,
        style: pattern.style || defaultHighlightStyle,
        className: pattern.className || 'highlight',
        priority: pattern.priority || 0,
        ...pattern
      };
    });
  }, [patterns, defaultHighlightStyle]);

  // Find all matches with their positions and metadata
  const findMatches = useCallback((text, patterns) => {
    const matches = [];
    
    patterns.forEach(patternConfig => {
      let regex;
      
      if (patternConfig.isRegex) {
        try {
          // Use provided regex pattern
          const flags = `g${patternConfig.caseSensitive ? '' : 'i'}`;
          regex = new RegExp(patternConfig.pattern, flags);
        } catch (error) {
          console.warn(`Invalid regex pattern: ${patternConfig.pattern}`, error);
          return;
        }
      } else {
        // Create regex from string pattern
        const escapedPattern = patternConfig.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boundaryPrefix = patternConfig.wholeWord ? '\\b' : '';
        const boundarySuffix = patternConfig.wholeWord ? '\\b' : '';
        const flags = `g${patternConfig.caseSensitive ? '' : 'i'}`;
        
        regex = new RegExp(`${boundaryPrefix}${escapedPattern}${boundarySuffix}`, flags);
      }
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          patternConfig,
          fullMatch: match
        });
        
        // Prevent infinite loop for zero-width matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    });
    
    return matches;
  }, []);

  // Resolve overlapping matches by priority
  const resolveOverlappingMatches = useCallback((matches) => {
    if (matches.length === 0) return matches;
    
    // Sort by start position, then by priority (higher priority first)
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.patternConfig.priority - a.patternConfig.priority;
    });
    
    const resolved = [];
    let lastEnd = 0;
    
    sortedMatches.forEach(match => {
      // Skip overlapping matches with lower priority
      if (match.start >= lastEnd) {
        resolved.push(match);
        lastEnd = match.end;
      }
    });
    
    return resolved;
  }, []);

  // Generate highlighted content
  const highlightedContent = useMemo(() => {
    if (!text || processedPatterns.length === 0) {
      return text;
    }
    
    // Find all matches
    const allMatches = findMatches(text, processedPatterns);
    
    // Resolve overlapping matches
    const resolvedMatches = resolveOverlappingMatches(allMatches);
    
    // Apply max highlights limit
    const limitedMatches = maxHighlights 
      ? resolvedMatches.slice(0, maxHighlights)
      : resolvedMatches;
    
    // Trigger highlight callback
    if (onHighlight && limitedMatches.length > 0) {
      onHighlight(limitedMatches, text);
    }
    
    if (limitedMatches.length === 0) {
      return text;
    }
    
    // Build segments with highlights
    const segments = [];
    let currentIndex = 0;
    
    limitedMatches.forEach((match, matchIndex) => {
      // Add text before match
      if (currentIndex < match.start) {
        segments.push({
          type: 'text',
          content: text.slice(currentIndex, match.start),
          key: `text-${matchIndex}`
        });
      }
      
      // Add highlighted match
      segments.push({
        type: 'highlight',
        content: match.text,
        patternConfig: match.patternConfig,
        matchData: match,
        key: `highlight-${matchIndex}`
      });
      
      currentIndex = match.end;
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.slice(currentIndex),
        key: 'text-final'
      });
    }
    
    return segments.map(segment => {
      if (segment.type === 'text') {
        return segment.content;
      }
      
      return (
        <mark
          key={segment.key}
          className={segment.patternConfig.className}
          style={segment.patternConfig.style}
          data-pattern-id={segment.patternConfig.id}
          title={`Matched: ${segment.patternConfig.pattern}`}
        >
          {segment.content}
        </mark>
      );
    });
    
  }, [text, processedPatterns, findMatches, resolveOverlappingMatches, maxHighlights, onHighlight]);

  const Component = as;
  
  return (
    <Component 
      className={className}
      style={{ 
        whiteSpace: preserveWhitespace ? 'pre-wrap' : 'normal'
      }}
    >
      {highlightedContent}
    </Component>
  );
}

/**
 * APPROACH 3: Interactive Search Highlighter
 * Component that combines search input with dynamic highlighting
 * 
 * Features:
 * - Built-in search input
 * - Real-time highlighting as user types
 * - Search statistics and navigation
 * - Keyboard shortcuts for match navigation
 * - Export and sharing capabilities
 */
function InteractiveSearchHighlighter({
  text,
  initialSearchTerm = '',
  placeholder = 'Search text...',
  caseSensitive = false,
  wholeWords = false,
  useRegex = false,
  showStats = true,
  showNavigation = true,
  highlightStyle = { backgroundColor: '#ffeb3b' },
  activeHighlightStyle = { backgroundColor: '#ff9800' },
  onSearchChange = null,
  onMatchNavigation = null,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = React.useState(initialSearchTerm);
  const [currentMatchIndex, setCurrentMatchIndex] = React.useState(0);
  const [searchOptions, setSearchOptions] = React.useState({
    caseSensitive,
    wholeWords,
    useRegex
  });

  const searchInputRef = React.useRef(null);
  const highlighterRef = React.useRef(null);

  // Find matches for current search
  const matches = useMemo(() => {
    if (!searchTerm || !text) return [];
    
    const matches = [];
    
    try {
      let regex;
      
      if (searchOptions.useRegex) {
        const flags = `g${searchOptions.caseSensitive ? '' : 'i'}`;
        regex = new RegExp(searchTerm, flags);
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boundaryPrefix = searchOptions.wholeWords ? '\\b' : '';
        const boundarySuffix = searchOptions.wholeWords ? '\\b' : '';
        const flags = `g${searchOptions.caseSensitive ? '' : 'i'}`;
        
        regex = new RegExp(`${boundaryPrefix}${escapedTerm}${boundarySuffix}`, flags);
      }
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
        
        // Prevent infinite loop
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } catch (error) {
      console.warn('Search regex error:', error);
    }
    
    return matches;
  }, [searchTerm, text, searchOptions]);

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setCurrentMatchIndex(0);
    
    if (onSearchChange) {
      onSearchChange(newSearchTerm, searchOptions);
    }
  }, [onSearchChange, searchOptions]);

  // Navigate to specific match
  const navigateToMatch = useCallback((index) => {
    if (matches.length === 0) return;
    
    const validIndex = Math.max(0, Math.min(index, matches.length - 1));
    setCurrentMatchIndex(validIndex);
    
    if (onMatchNavigation) {
      onMatchNavigation(validIndex, matches[validIndex]);
    }
  }, [matches, onMatchNavigation]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'f':
          event.preventDefault();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
          break;
        case 'g':
          event.preventDefault();
          if (event.shiftKey) {
            navigateToMatch(currentMatchIndex - 1);
          } else {
            navigateToMatch(currentMatchIndex + 1);
          }
          break;
      }
    } else if (event.key === 'Enter' && document.activeElement === searchInputRef.current) {
      event.preventDefault();
      if (event.shiftKey) {
        navigateToMatch(currentMatchIndex - 1);
      } else {
        navigateToMatch(currentMatchIndex + 1);
      }
    }
  }, [navigateToMatch, currentMatchIndex]);

  // Set up keyboard listeners
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Generate pattern for highlighter
  const highlightPattern = useMemo(() => {
    if (!searchTerm || matches.length === 0) return [];
    
    return matches.map((match, index) => ({
      id: `match-${index}`,
      pattern: match.text,
      isRegex: false,
      caseSensitive: true, // We've already processed case sensitivity
      style: index === currentMatchIndex ? activeHighlightStyle : highlightStyle,
      className: index === currentMatchIndex ? 'highlight active' : 'highlight',
      priority: index === currentMatchIndex ? 1 : 0
    }));
  }, [searchTerm, matches, currentMatchIndex, highlightStyle, activeHighlightStyle]);

  return (
    <div className={`interactive-search-highlighter ${className}`}>
      {/* Search Controls */}
      <div className="search-controls">
        <div className="search-input-group">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="search-input"
          />
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="search-options">
          <label className="option-label">
            <input
              type="checkbox"
              checked={searchOptions.caseSensitive}
              onChange={(e) => setSearchOptions(prev => ({ 
                ...prev, 
                caseSensitive: e.target.checked 
              }))}
            />
            Case sensitive
          </label>
          
          <label className="option-label">
            <input
              type="checkbox"
              checked={searchOptions.wholeWords}
              onChange={(e) => setSearchOptions(prev => ({ 
                ...prev, 
                wholeWords: e.target.checked 
              }))}
            />
            Whole words
          </label>
          
          <label className="option-label">
            <input
              type="checkbox"
              checked={searchOptions.useRegex}
              onChange={(e) => setSearchOptions(prev => ({ 
                ...prev, 
                useRegex: e.target.checked 
              }))}
            />
            Regex
          </label>
        </div>
      </div>
      
      {/* Search Stats and Navigation */}
      {(showStats || showNavigation) && searchTerm && (
        <div className="search-info">
          {showStats && (
            <div className="search-stats">
              {matches.length === 0 
                ? 'No matches found'
                : `${currentMatchIndex + 1} of ${matches.length} matches`
              }
            </div>
          )}
          
          {showNavigation && matches.length > 0 && (
            <div className="search-navigation">
              <button
                onClick={() => navigateToMatch(currentMatchIndex - 1)}
                disabled={matches.length === 0}
                className="nav-button"
              >
                ↑ Previous
              </button>
              <button
                onClick={() => navigateToMatch(currentMatchIndex + 1)}
                disabled={matches.length === 0}
                className="nav-button"
              >
                ↓ Next
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Highlighted Text Content */}
      <div ref={highlighterRef} className="highlighted-text-content">
        <AdvancedTextHighlighter
          text={text}
          patterns={highlightPattern}
          preserveWhitespace={true}
        />
      </div>
      
      {/* Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts">
        <small>
          Shortcuts: Ctrl+F (focus search), Ctrl+G (next), Ctrl+Shift+G (previous)
        </small>
      </div>
    </div>
  );
}

// Example usage patterns for different scenarios
const ExampleUsages = {
  /**
   * Basic search highlighting
   */
  BasicSearchExample: () => {
    const sampleText = "The quick brown fox jumps over the lazy dog. The fox is quick and brown.";
    
    return (
      <div className="basic-example">
        <h3>Basic Text Highlighting</h3>
        <TextHighlighter
          text={sampleText}
          searchTerms={['fox', 'quick']}
          caseSensitive={false}
          highlightStyle={{ backgroundColor: '#ffeb3b', fontWeight: 'bold' }}
        />
      </div>
    );
  },

  /**
   * Advanced pattern matching
   */
  AdvancedPatternExample: () => {
    const codeText = `
function calculateTotal(items) {
  const total = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  return total;
}`;

    const patterns = [
      {
        id: 'keywords',
        pattern: '\\b(function|const|return)\\b',
        isRegex: true,
        style: { color: '#0000ff', fontWeight: 'bold' },
        className: 'keyword',
        priority: 2
      },
      {
        id: 'variables',
        pattern: '\\b(total|items|sum|item)\\b',
        isRegex: true,
        style: { color: '#008000' },
        className: 'variable',
        priority: 1
      },
      {
        id: 'numbers',
        pattern: '\\b\\d+\\b',
        isRegex: true,
        style: { color: '#ff0000' },
        className: 'number',
        priority: 0
      }
    ];

    return (
      <div className="advanced-example">
        <h3>Code Syntax Highlighting</h3>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <AdvancedTextHighlighter
            text={codeText}
            patterns={patterns}
            preserveWhitespace={true}
          />
        </pre>
      </div>
    );
  },

  /**
   * Interactive search interface
   */
  InteractiveSearchExample: () => {
    const longText = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
`;

    return (
      <div className="interactive-example">
        <h3>Interactive Search & Highlight</h3>
        <InteractiveSearchHighlighter
          text={longText}
          placeholder="Search in text..."
          showStats={true}
          showNavigation={true}
          onSearchChange={(term, options) => {
            console.log('Search changed:', { term, options });
          }}
          onMatchNavigation={(index, match) => {
            console.log('Navigated to match:', { index, match });
          }}
        />
      </div>
    );
  }
};

/**
 * Testing utilities for text highlighting
 */
const TestingUtils = {
  /**
   * Count highlights in rendered component
   */
  countHighlights: (container) => {
    return container.querySelectorAll('mark, .highlight').length;
  },

  /**
   * Get highlighted text content
   */
  getHighlightedTexts: (container) => {
    const highlights = container.querySelectorAll('mark, .highlight');
    return Array.from(highlights).map(el => el.textContent);
  },

  /**
   * Simulate search input
   */
  simulateSearch: async (searchInput, term) => {
    searchInput.value = term;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  },

  /**
   * Test regex pattern validity
   */
  isValidRegex: (pattern) => {
    try {
      new RegExp(pattern);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Measure highlighting performance
   */
  measureHighlightingPerformance: (text, patterns, iterations = 100) => {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      // Simulate highlighting process
      patterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        text.match(regex);
      });
    }
    
    const end = performance.now();
    return {
      totalTime: end - start,
      averageTime: (end - start) / iterations,
      iterations
    };
  }
};

// CSS styles for components
const styles = `
  .highlighted {
    background-color: #ffeb3b;
    padding: 0 2px;
    border-radius: 2px;
  }

  .interactive-search-highlighter {
    max-width: 800px;
    margin: 0 auto;
  }

  .search-controls {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px 8px 0 0;
    border: 1px solid #dee2e6;
  }

  .search-input-group {
    position: relative;
    margin-bottom: 10px;
  }

  .search-input {
    width: 100%;
    padding: 8px 12px;
    padding-right: 30px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
  }

  .clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #6c757d;
  }

  .search-options {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    cursor: pointer;
  }

  .search-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #e9ecef;
    padding: 8px 15px;
    border: 1px solid #dee2e6;
    border-top: none;
    font-size: 14px;
  }

  .search-navigation {
    display: flex;
    gap: 5px;
  }

  .nav-button {
    padding: 4px 8px;
    border: 1px solid #ced4da;
    background: white;
    cursor: pointer;
    font-size: 12px;
    border-radius: 3px;
  }

  .nav-button:hover {
    background: #f8f9fa;
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .highlighted-text-content {
    background: white;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 400px;
    overflow-y: auto;
    line-height: 1.6;
  }

  .highlight {
    background-color: #ffeb3b;
    padding: 1px 2px;
    border-radius: 2px;
  }

  .highlight.active {
    background-color: #ff9800;
    font-weight: bold;
  }

  .keyboard-shortcuts {
    margin-top: 10px;
    text-align: center;
    color: #6c757d;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .search-info {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }

    .search-options {
      flex-direction: column;
      gap: 8px;
    }
  }
`;

// Export all implementations and utilities
export {
  TextHighlighter,             // Basic text highlighting
  AdvancedTextHighlighter,     // Advanced pattern matching
  InteractiveSearchHighlighter, // Interactive search interface
  ExampleUsages,               // Usage examples
  TestingUtils,                // Testing utilities  
  styles                       // CSS styles
};

// Default export for most common use case
export default TextHighlighter;