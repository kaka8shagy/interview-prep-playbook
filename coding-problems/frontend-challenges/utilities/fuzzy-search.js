/**
 * File: fuzzy-search.js
 * Description: Comprehensive fuzzy search implementation with multiple algorithms,
 *              similarity scoring, and performance optimizations
 * 
 * Learning objectives:
 * - Understand edit distance algorithms (Levenshtein, Jaro-Winkler, etc.)
 * - Learn phonetic matching and string similarity techniques
 * - Implement N-gram analysis and token-based matching
 * - Practice dynamic programming optimization techniques
 * - Handle Unicode normalization and text preprocessing
 * 
 * Real-world applications:
 * - Search autocomplete with typo tolerance
 * - Spell checkers and text correction systems
 * - Name matching for deduplication
 * - Database record linkage and fuzzy joins
 * - Voice recognition text processing
 * - User input validation with suggestions
 * 
 * Time Complexity: 
 * - Levenshtein: O(m*n) where m,n are string lengths
 * - Jaro-Winkler: O(m*n) with early termination optimizations
 * - N-gram: O(m+n) for preprocessing, O(1) for similarity calculation
 */

// =======================
// Approach 1: Basic Edit Distance (Levenshtein)
// =======================

/**
 * Calculate Levenshtein distance between two strings
 * Measures minimum number of single-character edits (insertions, deletions, substitutions)
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance between strings
 */
function levenshteinDistance(str1, str2) {
  // Handle edge cases
  if (str1 === str2) return 0;
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;
  
  const rows = str1.length + 1;
  const cols = str2.length + 1;
  
  // Create DP table
  const dp = Array(rows).fill(null).map(() => Array(cols).fill(0));
  
  // Initialize base cases
  for (let i = 0; i < rows; i++) {
    dp[i][0] = i; // Cost of deleting i characters from str1
  }
  for (let j = 0; j < cols; j++) {
    dp[0][j] = j; // Cost of inserting j characters to empty string
  }
  
  // Fill DP table
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      // If characters match, no additional cost
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // Choose minimum cost operation
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // Deletion
          dp[i][j - 1] + 1,     // Insertion
          dp[i - 1][j - 1] + 1  // Substitution
        );
      }
    }
  }
  
  return dp[rows - 1][cols - 1];
}

/**
 * Memory-optimized Levenshtein distance calculation
 * Uses only two rows instead of full DP table, O(min(m,n)) space complexity
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistanceOptimized(str1, str2) {
  // Ensure str1 is the shorter string for space optimization
  if (str1.length > str2.length) {
    [str1, str2] = [str2, str1];
  }
  
  if (str1.length === 0) return str2.length;
  
  // Use only two rows instead of full matrix
  let prevRow = Array(str1.length + 1).fill(0).map((_, i) => i);
  let currRow = Array(str1.length + 1).fill(0);
  
  for (let i = 0; i < str2.length; i++) {
    currRow[0] = i + 1;
    
    for (let j = 0; j < str1.length; j++) {
      const cost = str1[j] === str2[i] ? 0 : 1;
      
      currRow[j + 1] = Math.min(
        currRow[j] + 1,         // Insertion
        prevRow[j + 1] + 1,     // Deletion
        prevRow[j] + cost       // Substitution
      );
    }
    
    // Swap rows for next iteration
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[str1.length];
}

/**
 * Calculate similarity ratio based on Levenshtein distance
 * Returns value between 0 (no similarity) and 1 (identical)
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity ratio (0-1)
 */
function levenshteinSimilarity(str1, str2) {
  if (str1 === str2) return 1;
  
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistanceOptimized(str1, str2);
  return (maxLen - distance) / maxLen;
}

// =======================
// Approach 2: Jaro-Winkler Distance
// =======================

/**
 * Calculate Jaro similarity between two strings
 * Better for strings with common prefixes and character transpositions
 * 
 * @param {string} str1 - First string  
 * @param {string} str2 - Second string
 * @returns {number} Jaro similarity (0-1)
 */
function jaroSimilarity(str1, str2) {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
  if (matchWindow < 0) return str1 === str2 ? 1 : 0;
  
  // Track which characters have been matched
  const str1Matches = Array(str1.length).fill(false);
  const str2Matches = Array(str2.length).fill(false);
  
  let matches = 0;
  
  // Find matches within the match window
  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, str2.length);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      
      // Found a match
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  // Calculate transpositions
  let transpositions = 0;
  let k = 0;
  
  for (let i = 0; i < str1.length; i++) {
    if (!str1Matches[i]) continue;
    
    // Find next matched character in str2
    while (!str2Matches[k]) k++;
    
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  // Calculate Jaro similarity
  const jaro = (matches / str1.length + 
                matches / str2.length + 
                (matches - transpositions / 2) / matches) / 3;
  
  return jaro;
}

/**
 * Calculate Jaro-Winkler similarity
 * Enhanced Jaro similarity with prefix bonus
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @param {number} prefixScale - Scaling factor for prefix bonus (default 0.1)
 * @returns {number} Jaro-Winkler similarity (0-1)
 */
function jaroWinklerSimilarity(str1, str2, prefixScale = 0.1) {
  const jaro = jaroSimilarity(str1, str2);
  
  if (jaro < 0.7) return jaro; // No prefix bonus if Jaro similarity is low
  
  // Calculate common prefix length (up to 4 characters)
  let prefixLength = 0;
  for (let i = 0; i < Math.min(str1.length, str2.length, 4); i++) {
    if (str1[i] === str2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }
  
  return jaro + (prefixLength * prefixScale * (1 - jaro));
}

// =======================
// Approach 3: N-gram Based Similarity
// =======================

/**
 * Generate N-grams from a string
 * Creates sliding windows of n characters
 * 
 * @param {string} str - Input string
 * @param {number} n - N-gram size
 * @returns {Array} Array of n-grams
 */
function generateNGrams(str, n = 2) {
  if (str.length < n) return [str];
  
  const ngrams = [];
  for (let i = 0; i <= str.length - n; i++) {
    ngrams.push(str.substring(i, i + n));
  }
  return ngrams;
}

/**
 * Calculate N-gram similarity using Jaccard coefficient
 * Measures overlap between n-gram sets
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @param {number} n - N-gram size
 * @returns {number} N-gram similarity (0-1)
 */
function nGramSimilarity(str1, str2, n = 2) {
  if (str1 === str2) return 1;
  if (str1.length === 0 && str2.length === 0) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const ngrams1 = new Set(generateNGrams(str1.toLowerCase(), n));
  const ngrams2 = new Set(generateNGrams(str2.toLowerCase(), n));
  
  // Calculate Jaccard coefficient
  const intersection = new Set([...ngrams1].filter(gram => ngrams2.has(gram)));
  const union = new Set([...ngrams1, ...ngrams2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate weighted N-gram similarity using multiple N-gram sizes
 * Combines bigrams, trigrams, etc. for more robust matching
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @param {Array} weights - Weights for different N-gram sizes
 * @returns {number} Weighted similarity (0-1)
 */
function weightedNGramSimilarity(str1, str2, weights = [0.3, 0.5, 0.2]) {
  let totalSimilarity = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < weights.length; i++) {
    const n = i + 2; // Start from bigrams (n=2)
    const weight = weights[i];
    
    if (Math.min(str1.length, str2.length) >= n) {
      const similarity = nGramSimilarity(str1, str2, n);
      totalSimilarity += similarity * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
}

// =======================
// Approach 4: Comprehensive Fuzzy Search Engine
// =======================

/**
 * Advanced fuzzy search engine with multiple algorithms and optimizations
 * Supports various similarity metrics and search strategies
 */
class FuzzySearchEngine {
  constructor(options = {}) {
    this.options = {
      // Algorithm weights (must sum to 1)
      algorithms: {
        levenshtein: options.levenshteinWeight ?? 0.4,
        jaroWinkler: options.jaroWinklerWeight ?? 0.4,
        nGram: options.nGramWeight ?? 0.2
      },
      
      // Search parameters
      threshold: options.threshold ?? 0.6,
      maxResults: options.maxResults ?? 10,
      caseSensitive: options.caseSensitive ?? false,
      
      // Performance optimizations
      enableEarlyTermination: options.enableEarlyTermination ?? true,
      enableCaching: options.enableCaching ?? true,
      cacheSize: options.cacheSize ?? 1000,
      
      // Text preprocessing
      normalizeUnicode: options.normalizeUnicode ?? true,
      removeAccents: options.removeAccents ?? true,
      
      // Advanced features
      enablePhonetic: options.enablePhonetic ?? false,
      boostExactMatches: options.boostExactMatches ?? 1.5,
      boostPrefixMatches: options.boostPrefixMatches ?? 1.2
    };
    
    // Internal state
    this.cache = new Map();
    this.searchHistory = [];
    this.stats = {
      totalSearches: 0,
      cacheHits: 0,
      averageResponseTime: 0
    };
    
    // Validate algorithm weights
    const totalWeight = Object.values(this.options.algorithms)
      .reduce((sum, weight) => sum + weight, 0);
    
    if (Math.abs(totalWeight - 1) > 0.001) {
      console.warn('Algorithm weights should sum to 1, auto-normalizing');
      Object.keys(this.options.algorithms).forEach(alg => {
        this.options.algorithms[alg] /= totalWeight;
      });
    }
  }
  
  /**
   * Perform fuzzy search on array of items
   * Returns ranked results based on similarity scores
   * 
   * @param {string} query - Search query
   * @param {Array} items - Items to search (strings or objects with searchable properties)
   * @param {Object} searchOptions - Additional search options
   * @returns {Array} Ranked search results with scores
   */
  search(query, items, searchOptions = {}) {
    const startTime = performance.now();
    this.stats.totalSearches++;
    
    if (!query || !items || items.length === 0) {
      return [];
    }
    
    // Preprocess query
    const processedQuery = this.preprocessText(query);
    
    // Check cache
    const cacheKey = this.createCacheKey(processedQuery, items, searchOptions);
    if (this.options.enableCaching && this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    // Extract searchable text from items
    const searchableItems = this.extractSearchableText(items, searchOptions);
    
    // Calculate similarities
    const scoredItems = this.calculateSimilarities(processedQuery, searchableItems, searchOptions);
    
    // Filter by threshold and sort
    const filteredResults = scoredItems
      .filter(item => item.similarity >= this.options.threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, searchOptions.maxResults || this.options.maxResults);
    
    // Add original items to results
    const enrichedResults = this.enrichResults(filteredResults, items);
    
    // Cache results
    if (this.options.enableCaching) {
      this.cacheResults(cacheKey, enrichedResults);
    }
    
    // Update statistics
    const endTime = performance.now();
    this.updateStats(endTime - startTime);
    
    return enrichedResults;
  }
  
  /**
   * Preprocess text for consistent comparison
   * Normalizes case, Unicode, and removes accents
   * 
   * @param {string} text - Text to preprocess
   * @returns {string} Preprocessed text
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') return '';
    
    let processed = text;
    
    // Case normalization
    if (!this.options.caseSensitive) {
      processed = processed.toLowerCase();
    }
    
    // Unicode normalization
    if (this.options.normalizeUnicode) {
      processed = processed.normalize('NFD');
    }
    
    // Remove accents
    if (this.options.removeAccents) {
      processed = processed.replace(/[\u0300-\u036f]/g, '');
    }
    
    // Trim whitespace
    processed = processed.trim();
    
    return processed;
  }
  
  /**
   * Extract searchable text from items
   * Handles both string arrays and object arrays
   * 
   * @param {Array} items - Items to extract text from
   * @param {Object} searchOptions - Options specifying which fields to search
   * @returns {Array} Array of searchable text strings
   */
  extractSearchableText(items, searchOptions) {
    const searchFields = searchOptions.searchFields || ['name', 'title', 'text', 'content'];
    
    return items.map(item => {
      if (typeof item === 'string') {
        return this.preprocessText(item);
      }
      
      if (typeof item === 'object' && item !== null) {
        // Combine specified fields
        const textParts = [];
        
        searchFields.forEach(field => {
          if (item[field] && typeof item[field] === 'string') {
            textParts.push(item[field]);
          }
        });
        
        return this.preprocessText(textParts.join(' '));
      }
      
      return '';
    });
  }
  
  /**
   * Calculate similarity scores using multiple algorithms
   * Combines different similarity metrics with configurable weights
   * 
   * @param {string} query - Preprocessed query
   * @param {Array} searchableTexts - Preprocessed searchable texts
   * @param {Object} searchOptions - Search options
   * @returns {Array} Items with similarity scores
   */
  calculateSimilarities(query, searchableTexts, searchOptions) {
    const results = [];
    
    searchableTexts.forEach((text, index) => {
      if (!text) {
        results.push({ index, similarity: 0 });
        return;
      }
      
      // Calculate individual algorithm scores
      const scores = {};
      
      // Levenshtein similarity
      if (this.options.algorithms.levenshtein > 0) {
        scores.levenshtein = levenshteinSimilarity(query, text);
      }
      
      // Jaro-Winkler similarity
      if (this.options.algorithms.jaroWinkler > 0) {
        scores.jaroWinkler = jaroWinklerSimilarity(query, text);
      }
      
      // N-gram similarity
      if (this.options.algorithms.nGram > 0) {
        scores.nGram = weightedNGramSimilarity(query, text);
      }
      
      // Calculate weighted combined score
      let combinedScore = 0;
      Object.entries(this.options.algorithms).forEach(([algorithm, weight]) => {
        if (scores[algorithm] !== undefined) {
          combinedScore += scores[algorithm] * weight;
        }
      });
      
      // Apply bonuses
      combinedScore = this.applyBonuses(query, text, combinedScore);
      
      // Early termination optimization
      if (this.options.enableEarlyTermination && combinedScore < this.options.threshold * 0.5) {
        results.push({ index, similarity: 0, scores });
        return;
      }
      
      results.push({
        index,
        similarity: Math.min(combinedScore, 1), // Cap at 1.0
        scores,
        matchDetails: this.analyzeMatch(query, text)
      });
    });
    
    return results;
  }
  
  /**
   * Apply various bonuses to similarity scores
   * Boosts exact matches, prefix matches, etc.
   * 
   * @param {string} query - Search query
   * @param {string} text - Target text
   * @param {number} baseScore - Base similarity score
   * @returns {number} Enhanced score with bonuses
   */
  applyBonuses(query, text, baseScore) {
    let enhancedScore = baseScore;
    
    // Exact match bonus
    if (query === text) {
      enhancedScore *= this.options.boostExactMatches;
    }
    
    // Prefix match bonus
    else if (text.startsWith(query) || query.startsWith(text)) {
      enhancedScore *= this.options.boostPrefixMatches;
    }
    
    // Substring match bonus
    else if (text.includes(query) || query.includes(text)) {
      enhancedScore *= 1.1;
    }
    
    return enhancedScore;
  }
  
  /**
   * Analyze match details for debugging and explanation
   * Provides insights into why items matched
   * 
   * @param {string} query - Search query
   * @param {string} text - Target text
   * @returns {Object} Match analysis details
   */
  analyzeMatch(query, text) {
    return {
      exactMatch: query === text,
      prefixMatch: text.startsWith(query) || query.startsWith(text),
      substringMatch: text.includes(query) || query.includes(text),
      lengthRatio: query.length / text.length,
      commonNGrams: this.getCommonNGrams(query, text),
      editDistance: levenshteinDistance(query, text)
    };
  }
  
  /**
   * Get common N-grams between two strings
   * Useful for understanding match patterns
   * 
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {Array} Common N-grams
   */
  getCommonNGrams(str1, str2, n = 2) {
    const ngrams1 = new Set(generateNGrams(str1, n));
    const ngrams2 = new Set(generateNGrams(str2, n));
    
    return [...ngrams1].filter(gram => ngrams2.has(gram));
  }
  
  /**
   * Enrich results with original item data
   * Adds original items and additional metadata to results
   * 
   * @param {Array} scoredResults - Results with similarity scores
   * @param {Array} originalItems - Original item array
   * @returns {Array} Enriched results
   */
  enrichResults(scoredResults, originalItems) {
    return scoredResults.map(result => ({
      item: originalItems[result.index],
      similarity: result.similarity,
      scores: result.scores,
      matchDetails: result.matchDetails,
      rank: scoredResults.indexOf(result) + 1
    }));
  }
  
  /**
   * Create cache key for result caching
   * Generates unique key based on query and search parameters
   * 
   * @param {string} query - Processed query
   * @param {Array} items - Search items
   * @param {Object} options - Search options
   * @returns {string} Cache key
   */
  createCacheKey(query, items, options) {
    const keyComponents = {
      query,
      itemsHash: this.hashArray(items),
      threshold: this.options.threshold,
      maxResults: options.maxResults || this.options.maxResults,
      searchFields: options.searchFields || []
    };
    
    return JSON.stringify(keyComponents);
  }
  
  /**
   * Create hash of array for cache key generation
   * Simple hash function for caching purposes
   * 
   * @param {Array} arr - Array to hash
   * @returns {string} Hash string
   */
  hashArray(arr) {
    let hash = 0;
    const str = JSON.stringify(arr);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString();
  }
  
  /**
   * Cache search results with LRU eviction
   * Maintains cache size limit
   * 
   * @param {string} cacheKey - Cache key
   * @param {Array} results - Results to cache
   */
  cacheResults(cacheKey, results) {
    // Simple LRU cache implementation
    if (this.cache.size >= this.options.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, results);
  }
  
  /**
   * Update performance statistics
   * Tracks search performance metrics
   * 
   * @param {number} responseTime - Response time in milliseconds
   */
  updateStats(responseTime) {
    const currentAvg = this.stats.averageResponseTime;
    const totalSearches = this.stats.totalSearches;
    
    this.stats.averageResponseTime = 
      (currentAvg * (totalSearches - 1) + responseTime) / totalSearches;
  }
  
  /**
   * Clear search cache
   * Useful when search index changes
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * Get performance statistics
   * Returns detailed performance metrics
   * 
   * @returns {Object} Performance statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.totalSearches > 0 
        ? this.stats.cacheHits / this.stats.totalSearches 
        : 0,
      configuration: this.options
    };
  }
  
  /**
   * Suggest optimal threshold based on sample data
   * Analyzes distribution of similarity scores
   * 
   * @param {string} sampleQuery - Sample query
   * @param {Array} sampleItems - Sample items
   * @returns {number} Suggested threshold
   */
  suggestThreshold(sampleQuery, sampleItems) {
    if (!sampleQuery || !sampleItems || sampleItems.length < 10) {
      return this.options.threshold;
    }
    
    const tempResults = this.search(sampleQuery, sampleItems, { maxResults: sampleItems.length });
    const scores = tempResults.map(r => r.similarity);
    
    if (scores.length === 0) return this.options.threshold;
    
    // Calculate percentiles
    scores.sort((a, b) => b - a);
    const p75 = scores[Math.floor(scores.length * 0.25)];
    const p50 = scores[Math.floor(scores.length * 0.5)];
    
    // Suggest threshold between 50th and 75th percentile
    return Math.max(0.3, Math.min(0.8, (p50 + p75) / 2));
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic fuzzy string matching
 * Demonstrates core similarity algorithms
 */
function demonstrateBasicFuzzyMatching() {
  console.log('=== Basic Fuzzy String Matching ===\n');
  
  const testCases = [
    { str1: 'hello', str2: 'helo', expected: 'high similarity' },
    { str1: 'javascript', str2: 'javscript', expected: 'high similarity (typo)' },
    { str1: 'react', str2: 'reactor', expected: 'medium similarity (prefix)' },
    { str1: 'programming', str2: 'grammarpro', expected: 'medium similarity (anagram-like)' },
    { str1: 'test', str2: 'xyz', expected: 'low similarity' },
    { str1: 'identical', str2: 'identical', expected: 'perfect match' }
  ];
  
  console.log('Similarity Algorithm Comparison:\n');
  console.log('String 1'.padEnd(15) + 'String 2'.padEnd(15) + 'Levenshtein'.padEnd(12) + 'Jaro-Winkler'.padEnd(12) + 'N-gram'.padEnd(10) + 'Expected');
  console.log('-'.repeat(80));
  
  testCases.forEach(({ str1, str2, expected }) => {
    const levSim = levenshteinSimilarity(str1, str2);
    const jaroSim = jaroWinklerSimilarity(str1, str2);
    const ngramSim = nGramSimilarity(str1, str2);
    
    console.log(
      str1.padEnd(15) + 
      str2.padEnd(15) + 
      levSim.toFixed(3).padEnd(12) + 
      jaroSim.toFixed(3).padEnd(12) + 
      ngramSim.toFixed(3).padEnd(10) + 
      expected
    );
  });
}

/**
 * Example 2: Fuzzy search in name database
 * Practical application for name matching with typos
 */
function demonstrateNameMatching() {
  console.log('=== Fuzzy Name Matching Demo ===\n');
  
  const nameDatabase = [
    'John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams',
    'David Brown', 'Jennifer Davis', 'Christopher Miller', 'Jessica Wilson',
    'Matthew Moore', 'Amanda Taylor', 'Daniel Anderson', 'Lisa Thomas',
    'James Jackson', 'Michelle White', 'Robert Harris', 'Kimberly Martin'
  ];
  
  const fuzzySearch = new FuzzySearchEngine({
    threshold: 0.5,
    maxResults: 5,
    boostExactMatches: 2.0,
    boostPrefixMatches: 1.3
  });
  
  const searchQueries = [
    'Jon Smith',        // Typo in first name
    'Jane Do',          // Partial last name
    'Micheal Johnson',  // Common misspelling
    'Sara Williams',    // Missing 'h'
    'Chris Miller',     // Shortened first name
    'Jennifer Davies'   // Similar sounding last name
  ];
  
  console.log('Name Search Results:\n');
  
  searchQueries.forEach(query => {
    console.log(`Query: "${query}"`);
    const results = fuzzySearch.search(query, nameDatabase);
    
    if (results.length === 0) {
      console.log('  No matches found\n');
    } else {
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.item} (similarity: ${result.similarity.toFixed(3)})`);
        
        // Show match details for top result
        if (index === 0 && result.matchDetails) {
          const details = result.matchDetails;
          const insights = [];
          
          if (details.exactMatch) insights.push('exact match');
          if (details.prefixMatch) insights.push('prefix match');
          if (details.substringMatch) insights.push('substring match');
          if (details.editDistance <= 2) insights.push(`${details.editDistance} character diff`);
          
          if (insights.length > 0) {
            console.log(`     (${insights.join(', ')})`);
          }
        }
      });
      console.log('');
    }
  });
  
  // Show performance statistics
  console.log('Performance Statistics:');
  const stats = fuzzySearch.getStats();
  console.log(`  Total searches: ${stats.totalSearches}`);
  console.log(`  Average response time: ${stats.averageResponseTime.toFixed(2)}ms`);
  console.log(`  Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
}

/**
 * Example 3: Product search with fuzzy matching
 * E-commerce application with product name and description search
 */
function demonstrateProductSearch() {
  console.log('=== Fuzzy Product Search Demo ===\n');
  
  const products = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium quality wireless headphones with noise cancellation',
      category: 'Electronics',
      brand: 'AudioTech'
    },
    {
      id: 2,
      name: 'Gaming Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard for professional gaming',
      category: 'Electronics',
      brand: 'GamePro'
    },
    {
      id: 3,
      name: 'Smartphone Case Leather',
      description: 'Premium leather case for smartphone protection',
      category: 'Accessories',
      brand: 'CaseCraft'
    },
    {
      id: 4,
      name: 'Wireless Mouse Ergonomic',
      description: 'Ergonomic wireless mouse with precision tracking',
      category: 'Electronics',
      brand: 'ComfortClick'
    },
    {
      id: 5,
      name: 'Bluetooth Speaker Portable',
      description: 'Compact portable speaker with powerful bass',
      category: 'Electronics',
      brand: 'SoundWave'
    }
  ];
  
  const productSearch = new FuzzySearchEngine({
    threshold: 0.4,
    maxResults: 3,
    algorithms: {
      levenshtein: 0.3,
      jaroWinkler: 0.4,
      nGram: 0.3
    }
  });
  
  const searchQueries = [
    'bluetoth headphone',     // Multiple typos
    'mechanical keyborad',    // Typo in keyboard  
    'wireless mous',          // Partial word
    'leather smartphone',     // Different word order
    'portable speaker bass',  // Multiple keywords
    'gaming rgb keyboard'     // Mixed description words
  ];
  
  console.log('Product Search Results:\n');
  
  searchQueries.forEach(query => {
    console.log(`Query: "${query}"`);
    
    const results = productSearch.search(query, products, {
      searchFields: ['name', 'description', 'brand']
    });
    
    if (results.length === 0) {
      console.log('  No products found\n');
    } else {
      results.forEach((result, index) => {
        const product = result.item;
        console.log(`  ${index + 1}. ${product.name}`);
        console.log(`     Brand: ${product.brand} | Category: ${product.category}`);
        console.log(`     Similarity: ${result.similarity.toFixed(3)}`);
        
        // Show algorithm breakdown for top result
        if (index === 0 && result.scores) {
          const scores = result.scores;
          const breakdown = Object.entries(scores)
            .map(([alg, score]) => `${alg}: ${score.toFixed(3)}`)
            .join(', ');
          console.log(`     Algorithm scores: ${breakdown}`);
        }
        
        console.log('');
      });
    }
  });
}

/**
 * Example 4: Autocomplete with fuzzy matching
 * Search suggestions with typo tolerance
 */
function demonstrateAutocomplete() {
  console.log('=== Fuzzy Autocomplete Demo ===\n');
  
  const searchTerms = [
    'javascript', 'java', 'python', 'typescript', 'react', 'angular',
    'vue', 'node', 'express', 'mongodb', 'postgresql', 'mysql',
    'docker', 'kubernetes', 'aws', 'azure', 'github', 'gitlab',
    'html', 'css', 'sass', 'webpack', 'babel', 'eslint'
  ];
  
  const autocomplete = new FuzzySearchEngine({
    threshold: 0.3, // Lower threshold for autocomplete
    maxResults: 5,
    algorithms: {
      levenshtein: 0.2,
      jaroWinkler: 0.5,  // Higher weight for prefix matching
      nGram: 0.3
    },
    boostPrefixMatches: 2.0 // Strong preference for prefix matches
  });
  
  const userInputs = [
    'javas',        // Partial typing
    'reactt',       // Extra character
    'pythno',       // Transposed characters
    'expres',       // Missing last character
    'kuberntes',    // Missing vowel
    'postgre'       // Partial database name
  ];
  
  console.log('Autocomplete Suggestions:\n');
  
  userInputs.forEach(input => {
    console.log(`Input: "${input}"`);
    
    const suggestions = autocomplete.search(input, searchTerms);
    
    if (suggestions.length === 0) {
      console.log('  No suggestions available\n');
    } else {
      console.log('  Suggestions:');
      suggestions.forEach((suggestion, index) => {
        const confidence = suggestion.similarity;
        const confidenceLevel = confidence > 0.8 ? 'high' : 
                               confidence > 0.5 ? 'medium' : 'low';
        
        console.log(`    ${index + 1}. ${suggestion.item} (${confidenceLevel} confidence)`);
      });
      console.log('');
    }
  });
  
  // Demonstrate threshold optimization
  console.log('--- Threshold Optimization ---');
  const suggestedThreshold = autocomplete.suggestThreshold('java', searchTerms);
  console.log(`Current threshold: ${autocomplete.options.threshold}`);
  console.log(`Suggested threshold: ${suggestedThreshold.toFixed(3)}`);
  console.log(`Recommendation: ${suggestedThreshold > autocomplete.options.threshold ? 'Increase' : 'Decrease'} threshold for better results`);
}

// Export all implementations and examples
module.exports = {
  // Basic algorithms
  levenshteinDistance,
  levenshteinDistanceOptimized,
  levenshteinSimilarity,
  jaroSimilarity,
  jaroWinklerSimilarity,
  generateNGrams,
  nGramSimilarity,
  weightedNGramSimilarity,
  
  // Advanced engine
  FuzzySearchEngine,
  
  // Examples
  demonstrateBasicFuzzyMatching,
  demonstrateNameMatching,
  demonstrateProductSearch,
  demonstrateAutocomplete
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Fuzzy Search Implementation\n');
  console.log('This module demonstrates comprehensive fuzzy string matching');
  console.log('algorithms and their real-world applications.\n');
  
  demonstrateBasicFuzzyMatching();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateNameMatching();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateProductSearch();
  }, 3000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateAutocomplete();
  }, 5000);
}