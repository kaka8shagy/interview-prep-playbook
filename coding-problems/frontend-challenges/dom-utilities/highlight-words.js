/**
 * File: highlight-words.js
 * Description: Highlight specific words or patterns in text content with various strategies
 * 
 * Learning objectives:
 * - Understand text processing and DOM manipulation
 * - Learn regex patterns and text matching techniques
 * - See performance considerations for text highlighting
 * 
 * Time Complexity: O(n*m) where n is text length, m is number of words
 * Space Complexity: O(n) for creating highlighted text nodes
 */

// =======================
// Approach 1: Basic Word Highlighting
// =======================

/**
 * Highlight specific words in text content
 * Wraps matched words with span elements containing highlight class
 */
function highlightWords(text, words, options = {}) {
  const {
    className = 'highlight',
    caseSensitive = false,
    wholeWords = true,
    tagName = 'mark'
  } = options;
  
  if (!text || !words) return text;
  
  // Normalize words to array
  const wordsArray = Array.isArray(words) ? words : [words];
  
  // Build regex pattern
  const flags = caseSensitive ? 'g' : 'gi';
  const boundary = wholeWords ? '\\b' : '';
  
  // Escape special regex characters in words
  const escapedWords = wordsArray.map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  const pattern = new RegExp(
    `${boundary}(${escapedWords.join('|')})${boundary}`,
    flags
  );
  
  // Replace matches with highlighted version
  return text.replace(pattern, `<${tagName} class=\"${className}\">$1</${tagName}>`);
}

// =======================
// Approach 2: DOM-Based Highlighting
// =======================

/**
 * Highlight words in DOM elements while preserving existing structure
 * Safely traverses text nodes without breaking HTML
 */
function highlightWordsInDOM(element, words, options = {}) {
  const {
    className = 'highlight',
    caseSensitive = false,
    wholeWords = true,
    skipTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA']
  } = options;
  
  if (!element || !words) return;
  
  const wordsArray = Array.isArray(words) ? words : [words];
  const flags = caseSensitive ? 'g' : 'gi';
  const boundary = wholeWords ? '\\b' : '';
  
  // Build regex pattern
  const escapedWords = wordsArray.map(word => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(
    `${boundary}(${escapedWords.join('|')})${boundary}`,
    flags
  );
  
  // Find all text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip nodes inside excluded tags
        const parent = node.parentNode;
        return skipTags.includes(parent.tagName) 
          ? NodeFilter.FILTER_REJECT 
          : NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes = [];
  let node;
  
  while (node = walker.nextNode()) {
    if (node.textContent.trim()) {
      textNodes.push(node);
    }
  }
  
  // Process text nodes in reverse order to avoid position shifts
  textNodes.reverse().forEach(textNode => {
    const text = textNode.textContent;
    
    if (pattern.test(text)) {
      // Create highlighted HTML
      const highlightedHTML = text.replace(pattern, 
        `<mark class=\"${className}\">$1</mark>`
      );
      
      // Replace text node with highlighted content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = highlightedHTML;
      
      // Replace text node with new nodes
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  });
}

// =======================
// Approach 3: Advanced Pattern Highlighting
// =======================

/**
 * Advanced highlighting with multiple patterns and custom styling
 * Supports regex patterns, custom classes, and priority-based highlighting
 */
class TextHighlighter {
  constructor(options = {}) {
    this.patterns = new Map();
    this.defaultOptions = {
      className: 'highlight',
      caseSensitive: false,
      wholeWords: true,
      tagName: 'mark',
      priority: 0
    };
    
    // Merge default options
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }
  
  /**
   * Add highlighting pattern
   */
  addPattern(id, pattern, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    let regex;
    if (pattern instanceof RegExp) {
      regex = pattern;
    } else {
      const flags = config.caseSensitive ? 'g' : 'gi';
      const boundary = config.wholeWords ? '\\b' : '';
      const escaped = pattern.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
      regex = new RegExp(`${boundary}(${escaped})${boundary}`, flags);
    }
    
    this.patterns.set(id, {
      regex,
      config
    });
    
    return this;
  }
  
  /**
   * Remove pattern
   */
  removePattern(id) {
    this.patterns.delete(id);
    return this;
  }
  
  /**
   * Highlight text with all patterns
   */
  highlight(text) {
    if (!text) return text;
    
    // Sort patterns by priority (higher priority first)
    const sortedPatterns = Array.from(this.patterns.entries())
      .sort((a, b) => b[1].config.priority - a[1].config.priority);
    
    let result = text;
    const appliedRanges = [];
    
    sortedPatterns.forEach(([id, { regex, config }]) => {
      result = this.applyPattern(result, regex, config, appliedRanges);
    });
    
    return result;
  }
  
  /**
   * Apply single pattern avoiding overlaps
   */
  applyPattern(text, regex, config, appliedRanges) {
    const matches = [];
    let match;
    
    // Find all matches
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      
      // Check for overlaps with existing highlights
      const hasOverlap = appliedRanges.some(range => 
        (start >= range.start && start < range.end) ||
        (end > range.start && end <= range.end) ||
        (start <= range.start && end >= range.end)
      );
      
      if (!hasOverlap) {
        matches.push({ match, start, end });
        appliedRanges.push({ start, end });
      }
    }
    
    // Apply highlights in reverse order to maintain positions
    matches.reverse().forEach(({ match, start, end }) => {
      const highlighted = `<${config.tagName} class=\"${config.className}\" data-pattern=\"${match[1]}\">${match[1]}</${config.tagName}>`;
      text = text.substring(0, start) + highlighted + text.substring(end);
    });
    
    return text;
  }
  
  /**
   * Highlight DOM element
   */
  highlightDOM(element) {
    const originalHTML = element.innerHTML;
    const highlightedHTML = this.highlight(element.textContent);
    
    // Only update if there are changes
    if (highlightedHTML !== element.textContent) {
      element.innerHTML = highlightedHTML;
    }
  }
  
  /**
   * Remove all highlights from element
   */
  removeHighlights(element, className = null) {
    const selector = className ? `mark.${className}` : 'mark';
    const highlights = element.querySelectorAll(selector);
    
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(
        document.createTextNode(highlight.textContent), 
        highlight
      );
      parent.normalize(); // Merge adjacent text nodes
    });
  }
  
  /**
   * Get highlighting statistics
   */
  getStats(text) {
    const stats = {
      totalMatches: 0,
      patternStats: new Map()
    };
    
    this.patterns.forEach((pattern, id) => {
      const matches = (text.match(pattern.regex) || []).length;
      stats.patternStats.set(id, matches);
      stats.totalMatches += matches;
    });
    
    return stats;
  }
}

// =======================
// Approach 4: Search and Highlight
// =======================

/**
 * Interactive search and highlight functionality
 * Supports incremental search with live highlighting
 */
function createSearchHighlighter(container, options = {}) {
  const {
    searchInput,
    highlightClass = 'search-highlight',
    currentClass = 'current-highlight',
    minLength = 2,
    debounceMs = 300
  } = options;
  
  let currentHighlights = [];
  let currentIndex = -1;
  let debounceTimer = null;
  
  const highlighter = new TextHighlighter({
    className: highlightClass,
    caseSensitive: false,
    wholeWords: false
  });
  
  function performSearch(query) {
    // Clear previous highlights
    clearHighlights();
    
    if (query.length < minLength) return;
    
    // Add search pattern
    highlighter.addPattern('search', query, {
      className: highlightClass
    });
    
    // Highlight in container
    highlighter.highlightDOM(container);
    
    // Collect all highlights
    currentHighlights = Array.from(
      container.querySelectorAll(`.${highlightClass}`)
    );
    
    // Highlight first match as current
    if (currentHighlights.length > 0) {
      setCurrentHighlight(0);
    }
    
    return currentHighlights.length;
  }
  
  function clearHighlights() {
    highlighter.removeHighlights(container, highlightClass);
    currentHighlights = [];
    currentIndex = -1;
  }
  
  function setCurrentHighlight(index) {
    // Remove current class from all highlights
    currentHighlights.forEach(highlight => {
      highlight.classList.remove(currentClass);
    });
    
    if (index >= 0 && index < currentHighlights.length) {
      currentIndex = index;
      const current = currentHighlights[index];
      current.classList.add(currentClass);
      current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  function navigateHighlights(direction) {
    if (currentHighlights.length === 0) return;
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % currentHighlights.length;
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = currentHighlights.length - 1;
    }
    
    setCurrentHighlight(nextIndex);
  }
  
  // Set up search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(query);
      }, debounceMs);
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateHighlights(e.shiftKey ? 'prev' : 'next');
      }
    });
  }
  
  return {
    search: performSearch,
    clear: clearHighlights,
    next: () => navigateHighlights('next'),
    prev: () => navigateHighlights('prev'),
    getCount: () => currentHighlights.length,
    getCurrentIndex: () => currentIndex
  };
}

// =======================
// Utility Functions
// =======================

/**
 * Extract highlighted text from element
 */
function extractHighlights(element, className = 'highlight') {
  const highlights = element.querySelectorAll(`.${className}`);
  return Array.from(highlights).map(highlight => ({
    text: highlight.textContent,
    element: highlight,
    position: getTextPosition(highlight)
  }));
}

/**
 * Get text position of element within container
 */
function getTextPosition(element) {
  const container = element.closest('[data-container]') || document.body;
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let position = 0;
  let node;
  
  while (node = walker.nextNode()) {
    if (element.contains(node)) {
      break;
    }
    position += node.textContent.length;
  }
  
  return position;
}

// Export for use in other modules
module.exports = {
  highlightWords,
  highlightWordsInDOM,
  TextHighlighter,
  createSearchHighlighter,
  extractHighlights,
  getTextPosition
};