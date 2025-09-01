/**
 * File: in-memory-search-engine.js
 * Description: Comprehensive in-memory search engine with indexing, ranking, 
 *              filtering, and full-text search capabilities
 * 
 * Learning objectives:
 * - Understand inverted index data structures and search algorithms
 * - Learn text processing, tokenization, and normalization techniques
 * - Implement ranking algorithms (TF-IDF, BM25) for relevance scoring
 * - Practice efficient data structures for search operations
 * - Handle search optimization, caching, and performance tuning
 * 
 * Real-world applications:
 * - In-app search functionality (e-commerce, documentation, CMS)
 * - Log analysis and searching in development tools
 * - Real-time search suggestions and autocomplete
 * - Content filtering and recommendation systems
 * - Local search for offline-capable applications
 * 
 * Time Complexity: 
 * - Indexing: O(n*m) where n=documents, m=average terms per document
 * - Search: O(k + r*log(r)) where k=terms in query, r=matching documents
 * - Space Complexity: O(v*n) where v=vocabulary size, n=documents
 */

// =======================
// Approach 1: Basic Inverted Index Search Engine
// =======================

/**
 * Basic search engine implementation using inverted index
 * Supports exact term matching and simple boolean operations
 */
class BasicSearchEngine {
  constructor(options = {}) {
    // Configuration options
    this.options = {
      caseSensitive: options.caseSensitive ?? false,
      stemming: options.stemming ?? false,
      stopWords: options.stopWords ?? ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
      minTermLength: options.minTermLength ?? 2,
      maxResults: options.maxResults ?? 100
    };
    
    // Core data structures
    this.documents = new Map(); // docId -> document object
    this.invertedIndex = new Map(); // term -> Set of docIds
    this.termFrequency = new Map(); // term -> Map(docId -> frequency)
    this.documentLength = new Map(); // docId -> number of terms
    this.totalDocuments = 0;
    this.totalTerms = 0;
    
    // Performance tracking
    this.indexingTime = 0;
    this.searchStats = {
      totalSearches: 0,
      averageSearchTime: 0,
      cacheHits: 0
    };
  }
  
  /**
   * Add document to the search index
   * Processes document content and updates inverted index
   * 
   * @param {string} docId - Unique document identifier
   * @param {Object} document - Document object with content and metadata
   * @returns {boolean} True if document was successfully indexed
   */
  addDocument(docId, document) {
    const startTime = performance.now();
    
    if (this.documents.has(docId)) {
      // Remove existing document first
      this.removeDocument(docId);
    }
    
    // Validate document
    if (!document.content || typeof document.content !== 'string') {
      console.warn(`Document ${docId} has no content or invalid content`);
      return false;
    }
    
    // Store document
    this.documents.set(docId, {
      id: docId,
      content: document.content,
      title: document.title || '',
      metadata: document.metadata || {},
      indexedAt: Date.now()
    });
    
    // Tokenize and process content
    const terms = this.tokenize(document.content + ' ' + (document.title || ''));
    const processedTerms = this.processTerms(terms);
    
    // Count term frequencies in document
    const termCounts = new Map();
    processedTerms.forEach(term => {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    });
    
    // Update inverted index and term frequencies
    termCounts.forEach((count, term) => {
      // Add to inverted index
      if (!this.invertedIndex.has(term)) {
        this.invertedIndex.set(term, new Set());
      }
      this.invertedIndex.get(term).add(docId);
      
      // Update term frequency
      if (!this.termFrequency.has(term)) {
        this.termFrequency.set(term, new Map());
      }
      this.termFrequency.get(term).set(docId, count);
    });
    
    // Store document length (number of processed terms)
    this.documentLength.set(docId, processedTerms.length);
    this.totalDocuments++;
    this.totalTerms += processedTerms.length;
    
    const endTime = performance.now();
    this.indexingTime += (endTime - startTime);
    
    return true;
  }
  
  /**
   * Remove document from search index
   * Cleans up all references to the document
   * 
   * @param {string} docId - Document identifier to remove
   * @returns {boolean} True if document was removed
   */
  removeDocument(docId) {
    if (!this.documents.has(docId)) {
      return false;
    }
    
    // Remove from term frequency and inverted index
    this.termFrequency.forEach((docMap, term) => {
      if (docMap.has(docId)) {
        docMap.delete(docId);
        
        // Remove term from inverted index if no documents remain
        if (docMap.size === 0) {
          this.termFrequency.delete(term);
          this.invertedIndex.delete(term);
        } else {
          this.invertedIndex.get(term).delete(docId);
        }
      }
    });
    
    // Remove document
    const docLength = this.documentLength.get(docId) || 0;
    this.totalTerms -= docLength;
    this.totalDocuments--;
    
    this.documents.delete(docId);
    this.documentLength.delete(docId);
    
    return true;
  }
  
  /**
   * Search for documents matching the query
   * Implements basic term matching with optional boolean operations
   * 
   * @param {string} query - Search query string
   * @param {Object} options - Search options
   * @returns {Array} Array of matching documents with scores
   */
  search(query, options = {}) {
    const searchStart = performance.now();
    this.searchStats.totalSearches++;
    
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    // Process query terms
    const queryTerms = this.processTerms(this.tokenize(query));
    
    if (queryTerms.length === 0) {
      return [];
    }
    
    // Find documents containing query terms
    const candidates = this.findCandidateDocuments(queryTerms);
    
    if (candidates.size === 0) {
      return [];
    }
    
    // Score and rank documents
    const scoredResults = this.scoreDocuments(candidates, queryTerms);
    
    // Sort by score (descending) and limit results
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults || this.options.maxResults);
    
    // Add document details to results
    const enrichedResults = this.enrichResults(sortedResults, queryTerms);
    
    const searchEnd = performance.now();
    const searchTime = searchEnd - searchStart;
    this.updateSearchStats(searchTime);
    
    return enrichedResults;
  }
  
  /**
   * Tokenize text into individual terms
   * Basic tokenization splitting on whitespace and punctuation
   * 
   * @param {string} text - Text to tokenize
   * @returns {string[]} Array of tokens
   */
  tokenize(text) {
    if (!text) return [];
    
    // Split on whitespace and punctuation, filter empty strings
    return text
      .toLowerCase()
      .split(/[\s\.,;:!?()[\]{}'"]+/)
      .filter(token => token.length > 0);
  }
  
  /**
   * Process terms by applying filters and transformations
   * Removes stop words, applies minimum length filter, etc.
   * 
   * @param {string[]} terms - Raw terms from tokenization
   * @returns {string[]} Processed terms
   */
  processTerms(terms) {
    return terms
      .filter(term => {
        // Apply minimum length filter
        if (term.length < this.options.minTermLength) {
          return false;
        }
        
        // Filter stop words (if case insensitive)
        if (!this.options.caseSensitive && this.options.stopWords.includes(term)) {
          return false;
        }
        
        return true;
      })
      .map(term => this.options.caseSensitive ? term : term.toLowerCase());
  }
  
  /**
   * Find candidate documents that contain any of the query terms
   * Returns set of document IDs that should be considered for ranking
   * 
   * @param {string[]} queryTerms - Processed query terms
   * @returns {Set} Set of candidate document IDs
   */
  findCandidateDocuments(queryTerms) {
    const candidates = new Set();
    
    queryTerms.forEach(term => {
      const docsWithTerm = this.invertedIndex.get(term);
      if (docsWithTerm) {
        docsWithTerm.forEach(docId => candidates.add(docId));
      }
    });
    
    return candidates;
  }
  
  /**
   * Score documents based on term frequency
   * Simple scoring based on number of matching terms and their frequencies
   * 
   * @param {Set} candidates - Candidate document IDs
   * @param {string[]} queryTerms - Query terms
   * @returns {Array} Array of {docId, score} objects
   */
  scoreDocuments(candidates, queryTerms) {
    const scoredDocs = [];
    
    candidates.forEach(docId => {
      let score = 0;
      let matchingTerms = 0;
      
      queryTerms.forEach(term => {
        const termFreqMap = this.termFrequency.get(term);
        if (termFreqMap && termFreqMap.has(docId)) {
          const freq = termFreqMap.get(docId);
          score += freq; // Simple frequency-based scoring
          matchingTerms++;
        }
      });
      
      // Boost score based on percentage of query terms matched
      const termMatchRatio = matchingTerms / queryTerms.length;
      score *= (1 + termMatchRatio);
      
      if (score > 0) {
        scoredDocs.push({ docId, score, matchingTerms });
      }
    });
    
    return scoredDocs;
  }
  
  /**
   * Enrich search results with document details and highlighting
   * Adds document content, metadata, and highlights matching terms
   * 
   * @param {Array} results - Scored results
   * @param {string[]} queryTerms - Query terms for highlighting
   * @returns {Array} Enriched results with document details
   */
  enrichResults(results, queryTerms) {
    return results.map(result => {
      const document = this.documents.get(result.docId);
      
      return {
        id: result.docId,
        score: result.score,
        matchingTerms: result.matchingTerms,
        title: document.title,
        content: document.content,
        metadata: document.metadata,
        snippet: this.generateSnippet(document.content, queryTerms),
        highlights: this.highlightTerms(document.content, queryTerms)
      };
    });
  }
  
  /**
   * Generate content snippet around matching terms
   * Creates preview text showing context around query terms
   * 
   * @param {string} content - Document content
   * @param {string[]} queryTerms - Query terms
   * @param {number} snippetLength - Length of snippet in characters
   * @returns {string} Content snippet
   */
  generateSnippet(content, queryTerms, snippetLength = 200) {
    if (!content) return '';
    
    // Find first occurrence of any query term
    const lowerContent = content.toLowerCase();
    let firstMatchIndex = -1;
    
    for (const term of queryTerms) {
      const index = lowerContent.indexOf(term.toLowerCase());
      if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
        firstMatchIndex = index;
      }
    }
    
    if (firstMatchIndex === -1) {
      // No matches found, return beginning of content
      return content.substring(0, snippetLength) + (content.length > snippetLength ? '...' : '');
    }
    
    // Create snippet around first match
    const startIndex = Math.max(0, firstMatchIndex - Math.floor(snippetLength / 2));
    const endIndex = Math.min(content.length, startIndex + snippetLength);
    
    let snippet = content.substring(startIndex, endIndex);
    
    // Add ellipsis if needed
    if (startIndex > 0) snippet = '...' + snippet;
    if (endIndex < content.length) snippet += '...';
    
    return snippet;
  }
  
  /**
   * Highlight query terms in content
   * Marks matching terms for display purposes
   * 
   * @param {string} content - Document content
   * @param {string[]} queryTerms - Query terms to highlight
   * @returns {string} Content with highlighted terms
   */
  highlightTerms(content, queryTerms) {
    if (!content || queryTerms.length === 0) return content;
    
    let highlighted = content;
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<mark>$&</mark>`);
    });
    
    return highlighted;
  }
  
  /**
   * Update search performance statistics
   * Tracks average search times and cache performance
   * 
   * @param {number} searchTime - Time taken for this search
   */
  updateSearchStats(searchTime) {
    const currentAverage = this.searchStats.averageSearchTime;
    const totalSearches = this.searchStats.totalSearches;
    
    this.searchStats.averageSearchTime = 
      (currentAverage * (totalSearches - 1) + searchTime) / totalSearches;
  }
  
  /**
   * Get search engine statistics
   * Returns performance metrics and index information
   * 
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      indexing: {
        totalDocuments: this.totalDocuments,
        totalTerms: this.totalTerms,
        vocabularySize: this.invertedIndex.size,
        averageDocumentLength: this.totalDocuments > 0 ? this.totalTerms / this.totalDocuments : 0,
        indexingTime: this.indexingTime
      },
      performance: {
        ...this.searchStats,
        memoryUsage: {
          documents: this.documents.size,
          invertedIndexEntries: this.invertedIndex.size,
          termFrequencyEntries: Array.from(this.termFrequency.values())
            .reduce((sum, map) => sum + map.size, 0)
        }
      }
    };
  }
}

// =======================
// Approach 2: Advanced Search Engine with TF-IDF Ranking
// =======================

/**
 * Advanced search engine with TF-IDF scoring, phrase search, and filtering
 * Implements more sophisticated ranking algorithms and search features
 */
class AdvancedSearchEngine extends BasicSearchEngine {
  constructor(options = {}) {
    super(options);
    
    // Additional advanced options
    this.advancedOptions = {
      ...this.options,
      enableTfIdf: options.enableTfIdf ?? true,
      enablePhraseSearch: options.enablePhraseSearch ?? true,
      enableFacetedSearch: options.enableFacetedSearch ?? true,
      boostTitleMatches: options.boostTitleMatches ?? 2.0,
      boostExactMatches: options.boostExactMatches ?? 1.5,
      minScore: options.minScore ?? 0.1
    };
    
    // Additional data structures for advanced features
    this.documentVectors = new Map(); // docId -> term vector for similarity
    this.facets = new Map(); // facet -> Map(value -> Set(docIds))
    this.phraseIndex = new Map(); // phrase -> Set(docIds)
    
    // Caching for performance
    this.queryCache = new Map();
    this.cacheMaxSize = options.cacheMaxSize ?? 1000;
  }
  
  /**
   * Enhanced document addition with TF-IDF calculation and facet indexing
   * Extends base method with advanced indexing features
   */
  addDocument(docId, document) {
    // Call parent method first
    const success = super.addDocument(docId, document);
    
    if (!success) return false;
    
    // Build document vector for similarity calculations
    this.buildDocumentVector(docId);
    
    // Index phrases if enabled
    if (this.advancedOptions.enablePhraseSearch) {
      this.indexPhrases(docId, document.content);
    }
    
    // Index facets if enabled
    if (this.advancedOptions.enableFacetedSearch && document.metadata) {
      this.indexFacets(docId, document.metadata);
    }
    
    // Clear query cache when index changes
    this.clearQueryCache();
    
    return true;
  }
  
  /**
   * Build TF-IDF vector representation of document
   * Creates normalized vector for similarity calculations
   * 
   * @param {string} docId - Document identifier
   */
  buildDocumentVector(docId) {
    const vector = new Map();
    const docLength = this.documentLength.get(docId) || 1;
    
    // Calculate TF-IDF for each term in document
    this.termFrequency.forEach((docMap, term) => {
      if (docMap.has(docId)) {
        const tf = docMap.get(docId) / docLength; // Term frequency
        const df = docMap.size; // Document frequency
        const idf = Math.log(this.totalDocuments / df); // Inverse document frequency
        const tfIdf = tf * idf;
        
        if (tfIdf > 0) {
          vector.set(term, tfIdf);
        }
      }
    });
    
    // Normalize vector (L2 normalization)
    const magnitude = Math.sqrt(
      Array.from(vector.values()).reduce((sum, val) => sum + val * val, 0)
    );
    
    if (magnitude > 0) {
      vector.forEach((value, term) => {
        vector.set(term, value / magnitude);
      });
    }
    
    this.documentVectors.set(docId, vector);
  }
  
  /**
   * Index phrases for phrase search functionality
   * Creates inverted index for multi-word phrases
   * 
   * @param {string} docId - Document identifier
   * @param {string} content - Document content
   */
  indexPhrases(docId, content) {
    const terms = this.processTerms(this.tokenize(content));
    
    // Index bigrams and trigrams
    for (let i = 0; i < terms.length - 1; i++) {
      // Bigrams (2-word phrases)
      const bigram = terms[i] + ' ' + terms[i + 1];
      this.addPhraseToIndex(bigram, docId);
      
      // Trigrams (3-word phrases)
      if (i < terms.length - 2) {
        const trigram = bigram + ' ' + terms[i + 2];
        this.addPhraseToIndex(trigram, docId);
      }
    }
  }
  
  /**
   * Add phrase to phrase index
   * Helper method for phrase indexing
   * 
   * @param {string} phrase - Phrase to index
   * @param {string} docId - Document identifier
   */
  addPhraseToIndex(phrase, docId) {
    if (!this.phraseIndex.has(phrase)) {
      this.phraseIndex.set(phrase, new Set());
    }
    this.phraseIndex.get(phrase).add(docId);
  }
  
  /**
   * Index document metadata for faceted search
   * Creates facet indexes for filtering capabilities
   * 
   * @param {string} docId - Document identifier
   * @param {Object} metadata - Document metadata
   */
  indexFacets(docId, metadata) {
    Object.entries(metadata).forEach(([facet, value]) => {
      if (!this.facets.has(facet)) {
        this.facets.set(facet, new Map());
      }
      
      const facetMap = this.facets.get(facet);
      const facetValue = String(value).toLowerCase();
      
      if (!facetMap.has(facetValue)) {
        facetMap.set(facetValue, new Set());
      }
      
      facetMap.get(facetValue).add(docId);
    });
  }
  
  /**
   * Advanced search with TF-IDF scoring and phrase matching
   * Implements sophisticated ranking and filtering
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Ranked search results
   */
  search(query, options = {}) {
    const searchStart = performance.now();
    this.searchStats.totalSearches++;
    
    // Check cache first
    const cacheKey = this.createCacheKey(query, options);
    if (this.queryCache.has(cacheKey)) {
      this.searchStats.cacheHits++;
      return this.queryCache.get(cacheKey);
    }
    
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    // Parse query for phrases and terms
    const parsedQuery = this.parseQuery(query);
    
    if (parsedQuery.terms.length === 0 && parsedQuery.phrases.length === 0) {
      return [];
    }
    
    // Find candidates using both terms and phrases
    let candidates = this.findAdvancedCandidates(parsedQuery);
    
    // Apply facet filters if specified
    if (options.filters) {
      candidates = this.applyFacetFilters(candidates, options.filters);
    }
    
    if (candidates.size === 0) {
      return [];
    }
    
    // Advanced scoring with TF-IDF
    const scoredResults = this.scoreDocumentsAdvanced(candidates, parsedQuery, options);
    
    // Filter by minimum score
    const filteredResults = scoredResults.filter(
      result => result.score >= this.advancedOptions.minScore
    );
    
    // Sort and limit results
    const sortedResults = filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults || this.advancedOptions.maxResults);
    
    // Enrich results
    const enrichedResults = this.enrichAdvancedResults(sortedResults, parsedQuery);
    
    // Cache results
    this.cacheResults(cacheKey, enrichedResults);
    
    const searchEnd = performance.now();
    this.updateSearchStats(searchEnd - searchStart);
    
    return enrichedResults;
  }
  
  /**
   * Parse query to extract terms and phrases
   * Handles quoted phrases and individual terms
   * 
   * @param {string} query - Raw query string
   * @returns {Object} Parsed query with terms and phrases
   */
  parseQuery(query) {
    const phrases = [];
    const terms = [];
    
    // Extract quoted phrases
    const phraseRegex = /"([^"]+)"/g;
    let match;
    let remainingQuery = query;
    
    while ((match = phraseRegex.exec(query)) !== null) {
      phrases.push(match[1].toLowerCase());
      remainingQuery = remainingQuery.replace(match[0], '');
    }
    
    // Process remaining terms
    const remainingTerms = this.processTerms(this.tokenize(remainingQuery));
    terms.push(...remainingTerms);
    
    return { terms, phrases };
  }
  
  /**
   * Find candidates using advanced matching (terms + phrases)
   * Combines term and phrase matching for comprehensive candidate selection
   * 
   * @param {Object} parsedQuery - Parsed query object
   * @returns {Set} Candidate document IDs
   */
  findAdvancedCandidates(parsedQuery) {
    const candidates = new Set();
    
    // Find candidates from individual terms
    parsedQuery.terms.forEach(term => {
      const docsWithTerm = this.invertedIndex.get(term);
      if (docsWithTerm) {
        docsWithTerm.forEach(docId => candidates.add(docId));
      }
    });
    
    // Find candidates from phrases
    if (this.advancedOptions.enablePhraseSearch) {
      parsedQuery.phrases.forEach(phrase => {
        const docsWithPhrase = this.phraseIndex.get(phrase);
        if (docsWithPhrase) {
          docsWithPhrase.forEach(docId => candidates.add(docId));
        }
      });
    }
    
    return candidates;
  }
  
  /**
   * Apply facet filters to candidate documents
   * Filters candidates based on metadata facets
   * 
   * @param {Set} candidates - Candidate document IDs
   * @param {Object} filters - Facet filters to apply
   * @returns {Set} Filtered candidate document IDs
   */
  applyFacetFilters(candidates, filters) {
    let filteredCandidates = new Set(candidates);
    
    Object.entries(filters).forEach(([facet, values]) => {
      const facetMap = this.facets.get(facet);
      if (!facetMap) return;
      
      const allowedValues = Array.isArray(values) ? values : [values];
      const facetMatches = new Set();
      
      allowedValues.forEach(value => {
        const docsWithFacetValue = facetMap.get(String(value).toLowerCase());
        if (docsWithFacetValue) {
          docsWithFacetValue.forEach(docId => facetMatches.add(docId));
        }
      });
      
      // Intersect with current candidates
      filteredCandidates = new Set(
        [...filteredCandidates].filter(docId => facetMatches.has(docId))
      );
    });
    
    return filteredCandidates;
  }
  
  /**
   * Advanced document scoring using TF-IDF and additional signals
   * Implements sophisticated ranking with multiple scoring factors
   * 
   * @param {Set} candidates - Candidate documents
   * @param {Object} parsedQuery - Parsed query
   * @param {Object} options - Search options
   * @returns {Array} Scored documents
   */
  scoreDocumentsAdvanced(candidates, parsedQuery, options) {
    const scoredDocs = [];
    
    candidates.forEach(docId => {
      const document = this.documents.get(docId);
      let score = 0;
      let matchingTerms = 0;
      let phraseMatches = 0;
      
      // TF-IDF scoring for individual terms
      if (this.advancedOptions.enableTfIdf) {
        const docVector = this.documentVectors.get(docId);
        if (docVector) {
          parsedQuery.terms.forEach(term => {
            const termTfIdf = docVector.get(term);
            if (termTfIdf) {
              score += termTfIdf;
              matchingTerms++;
            }
          });
        }
      } else {
        // Fallback to simple term frequency scoring
        parsedQuery.terms.forEach(term => {
          const termFreqMap = this.termFrequency.get(term);
          if (termFreqMap && termFreqMap.has(docId)) {
            const freq = termFreqMap.get(docId);
            score += freq;
            matchingTerms++;
          }
        });
      }
      
      // Phrase matching bonus
      parsedQuery.phrases.forEach(phrase => {
        const docsWithPhrase = this.phraseIndex.get(phrase);
        if (docsWithPhrase && docsWithPhrase.has(docId)) {
          score += 2.0; // Phrase match bonus
          phraseMatches++;
        }
      });
      
      // Title match boost
      if (document.title) {
        const titleTerms = this.processTerms(this.tokenize(document.title));
        const titleMatches = parsedQuery.terms.filter(term => 
          titleTerms.includes(term)
        ).length;
        
        if (titleMatches > 0) {
          score *= (1 + this.advancedOptions.boostTitleMatches * titleMatches / parsedQuery.terms.length);
        }
      }
      
      // Complete query match bonus
      const totalQueryParts = parsedQuery.terms.length + parsedQuery.phrases.length;
      const totalMatches = matchingTerms + phraseMatches;
      
      if (totalMatches === totalQueryParts && totalQueryParts > 1) {
        score *= this.advancedOptions.boostExactMatches;
      }
      
      // Document length normalization (prevents bias toward longer documents)
      const docLength = this.documentLength.get(docId) || 1;
      const lengthNormalization = Math.log(1 + docLength) / Math.log(2);
      score = score / lengthNormalization;
      
      if (score > 0) {
        scoredDocs.push({ 
          docId, 
          score, 
          matchingTerms, 
          phraseMatches,
          totalMatches: totalMatches
        });
      }
    });
    
    return scoredDocs;
  }
  
  /**
   * Enrich advanced search results with additional information
   * Adds facet information and advanced highlighting
   * 
   * @param {Array} results - Scored results
   * @param {Object} parsedQuery - Parsed query
   * @returns {Array} Enriched results
   */
  enrichAdvancedResults(results, parsedQuery) {
    return results.map(result => {
      const document = this.documents.get(result.docId);
      const allQueryTerms = [...parsedQuery.terms, ...parsedQuery.phrases];
      
      return {
        id: result.docId,
        score: result.score,
        matchingTerms: result.matchingTerms,
        phraseMatches: result.phraseMatches,
        totalMatches: result.totalMatches,
        title: document.title,
        content: document.content,
        metadata: document.metadata,
        snippet: this.generateSnippet(document.content, allQueryTerms),
        highlights: this.highlightTerms(document.content, allQueryTerms),
        facets: this.extractDocumentFacets(document.metadata),
        relevanceFactors: this.explainRelevance(result, parsedQuery, document)
      };
    });
  }
  
  /**
   * Extract facet values from document metadata
   * Returns facet information for search result filtering
   * 
   * @param {Object} metadata - Document metadata
   * @returns {Object} Facet values
   */
  extractDocumentFacets(metadata) {
    const facets = {};
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (this.facets.has(key)) {
          facets[key] = value;
        }
      });
    }
    
    return facets;
  }
  
  /**
   * Explain why document was considered relevant
   * Provides transparency into ranking factors
   * 
   * @param {Object} result - Scored result
   * @param {Object} parsedQuery - Parsed query
   * @param {Object} document - Document object
   * @returns {Object} Relevance explanation
   */
  explainRelevance(result, parsedQuery, document) {
    return {
      termMatches: result.matchingTerms,
      phraseMatches: result.phraseMatches,
      titleMatches: document.title ? 
        parsedQuery.terms.filter(term => 
          document.title.toLowerCase().includes(term)
        ).length : 0,
      queryCompleteness: result.totalMatches / (parsedQuery.terms.length + parsedQuery.phrases.length),
      documentLength: this.documentLength.get(result.docId)
    };
  }
  
  /**
   * Create cache key for query and options
   * Generates unique key for result caching
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {string} Cache key
   */
  createCacheKey(query, options) {
    const key = {
      query: query.toLowerCase(),
      maxResults: options.maxResults || this.advancedOptions.maxResults,
      filters: options.filters || {}
    };
    
    return JSON.stringify(key);
  }
  
  /**
   * Cache search results
   * Implements LRU cache for query results
   * 
   * @param {string} cacheKey - Cache key
   * @param {Array} results - Search results to cache
   */
  cacheResults(cacheKey, results) {
    // Simple LRU cache implementation
    if (this.queryCache.size >= this.cacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    
    this.queryCache.set(cacheKey, results);
  }
  
  /**
   * Clear query result cache
   * Called when index is modified
   */
  clearQueryCache() {
    this.queryCache.clear();
  }
  
  /**
   * Get available facets and their values
   * Returns facet information for search UI
   * 
   * @param {Set} documentIds - Optional subset of documents to analyze
   * @returns {Object} Facet information
   */
  getFacets(documentIds = null) {
    const facetInfo = {};
    
    this.facets.forEach((valueMap, facetName) => {
      const facetValues = {};
      
      valueMap.forEach((docSet, value) => {
        let count = docSet.size;
        
        // If document subset provided, filter count
        if (documentIds) {
          count = [...docSet].filter(docId => documentIds.has(docId)).length;
        }
        
        if (count > 0) {
          facetValues[value] = count;
        }
      });
      
      if (Object.keys(facetValues).length > 0) {
        facetInfo[facetName] = facetValues;
      }
    });
    
    return facetInfo;
  }
  
  /**
   * Get search suggestions based on indexed terms
   * Provides autocomplete functionality
   * 
   * @param {string} prefix - Partial query
   * @param {number} limit - Maximum suggestions
   * @returns {Array} Suggested completions
   */
  getSuggestions(prefix, limit = 10) {
    if (!prefix || prefix.length < 2) {
      return [];
    }
    
    const lowerPrefix = prefix.toLowerCase();
    const suggestions = [];
    
    // Find terms that start with prefix
    this.invertedIndex.forEach((docSet, term) => {
      if (term.startsWith(lowerPrefix) && term !== lowerPrefix) {
        suggestions.push({
          term,
          frequency: docSet.size,
          type: 'term'
        });
      }
    });
    
    // Find phrases that start with prefix
    if (this.advancedOptions.enablePhraseSearch) {
      this.phraseIndex.forEach((docSet, phrase) => {
        if (phrase.startsWith(lowerPrefix) && phrase !== lowerPrefix) {
          suggestions.push({
            term: phrase,
            frequency: docSet.size,
            type: 'phrase'
          });
        }
      });
    }
    
    // Sort by frequency and limit results
    return suggestions
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
      .map(item => item.term);
  }
  
  /**
   * Get enhanced statistics including advanced features
   * Returns comprehensive performance and usage metrics
   * 
   * @returns {Object} Enhanced statistics
   */
  getStats() {
    const baseStats = super.getStats();
    
    return {
      ...baseStats,
      advanced: {
        phraseIndexSize: this.phraseIndex.size,
        facetCount: this.facets.size,
        facetValues: Array.from(this.facets.values())
          .reduce((sum, valueMap) => sum + valueMap.size, 0),
        cacheSize: this.queryCache.size,
        cacheHitRate: this.searchStats.totalSearches > 0 
          ? this.searchStats.cacheHits / this.searchStats.totalSearches 
          : 0
      },
      features: {
        tfIdfEnabled: this.advancedOptions.enableTfIdf,
        phraseSearchEnabled: this.advancedOptions.enablePhraseSearch,
        facetedSearchEnabled: this.advancedOptions.enableFacetedSearch
      }
    };
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic search engine usage
 * Demonstrates core search functionality with simple documents
 */
function demonstrateBasicSearch() {
  console.log('=== Basic Search Engine Demo ===\n');
  
  const searchEngine = new BasicSearchEngine({
    caseSensitive: false,
    stopWords: ['the', 'a', 'an', 'and', 'or', 'but'],
    minTermLength: 2
  });
  
  // Add sample documents
  const documents = [
    {
      id: 'doc1',
      title: 'JavaScript Fundamentals',
      content: 'JavaScript is a programming language that runs in web browsers. It supports object-oriented and functional programming paradigms.',
      metadata: { category: 'programming', difficulty: 'beginner', language: 'javascript' }
    },
    {
      id: 'doc2', 
      title: 'React Tutorial',
      content: 'React is a JavaScript library for building user interfaces. It uses components and virtual DOM for efficient rendering.',
      metadata: { category: 'framework', difficulty: 'intermediate', language: 'javascript' }
    },
    {
      id: 'doc3',
      title: 'Python Data Analysis',
      content: 'Python is excellent for data analysis with libraries like pandas and numpy. It has simple syntax and powerful features.',
      metadata: { category: 'data-science', difficulty: 'intermediate', language: 'python' }
    },
    {
      id: 'doc4',
      title: 'Node.js Backend',
      content: 'Node.js allows JavaScript to run on the server. It uses an event-driven architecture for building scalable applications.',
      metadata: { category: 'backend', difficulty: 'advanced', language: 'javascript' }
    }
  ];
  
  // Index documents
  console.log('Indexing documents...');
  documents.forEach(doc => {
    searchEngine.addDocument(doc.id, doc);
    console.log(`Indexed: ${doc.title}`);
  });
  
  // Perform searches
  const queries = [
    'JavaScript',
    'programming language',
    'React components',
    'Python analysis',
    'nonexistent term'
  ];
  
  console.log('\n--- Search Results ---');
  queries.forEach(query => {
    console.log(`\nQuery: "${query}"`);
    const results = searchEngine.search(query);
    
    if (results.length === 0) {
      console.log('  No results found');
    } else {
      results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.title} (score: ${result.score.toFixed(2)})`);
        console.log(`     Snippet: ${result.snippet}`);
        console.log(`     Matching terms: ${result.matchingTerms}`);
      });
    }
  });
  
  // Show statistics
  console.log('\n--- Search Engine Statistics ---');
  console.log(JSON.stringify(searchEngine.getStats(), null, 2));
}

/**
 * Example 2: Advanced search with TF-IDF and facets
 * Demonstrates sophisticated search features and filtering
 */
function demonstrateAdvancedSearch() {
  console.log('=== Advanced Search Engine Demo ===\n');
  
  const advancedEngine = new AdvancedSearchEngine({
    enableTfIdf: true,
    enablePhraseSearch: true,
    enableFacetedSearch: true,
    boostTitleMatches: 2.0,
    minScore: 0.1
  });
  
  // Add comprehensive document set
  const techDocs = [
    {
      id: 'js1',
      title: 'Advanced JavaScript Patterns',
      content: 'Advanced JavaScript programming patterns including closures, prototypes, and asynchronous programming. These patterns help create maintainable and scalable applications.',
      metadata: { category: 'programming', difficulty: 'advanced', language: 'javascript', tags: ['patterns', 'async', 'closures'] }
    },
    {
      id: 'react1',
      title: 'React Hooks Deep Dive',
      content: 'React hooks revolutionized React development. useState, useEffect, and custom hooks provide powerful state management capabilities.',
      metadata: { category: 'framework', difficulty: 'intermediate', language: 'javascript', tags: ['react', 'hooks', 'state'] }
    },
    {
      id: 'node1',
      title: 'Node.js Microservices',
      content: 'Building microservices with Node.js enables scalable architecture. Event-driven programming and asynchronous I/O make Node.js ideal for microservices.',
      metadata: { category: 'backend', difficulty: 'advanced', language: 'javascript', tags: ['microservices', 'scalability', 'async'] }
    },
    {
      id: 'py1',
      title: 'Python Machine Learning',
      content: 'Python excels in machine learning with scikit-learn, tensorflow, and pytorch. Data preprocessing and model training are streamlined in Python.',
      metadata: { category: 'data-science', difficulty: 'advanced', language: 'python', tags: ['ml', 'tensorflow', 'data'] }
    },
    {
      id: 'web1',
      title: 'Modern Web Development',
      content: 'Modern web development combines JavaScript frameworks, responsive design, and progressive web apps. Performance optimization is crucial for user experience.',
      metadata: { category: 'web-dev', difficulty: 'intermediate', language: 'javascript', tags: ['responsive', 'pwa', 'performance'] }
    }
  ];
  
  // Index documents
  console.log('Indexing documents...');
  techDocs.forEach(doc => {
    advancedEngine.addDocument(doc.id, doc);
    console.log(`Indexed: ${doc.title}`);
  });
  
  // Demonstrate advanced search features
  console.log('\n--- Advanced Search Features ---');
  
  // Phrase search
  console.log('\n1. Phrase Search:');
  const phraseResults = advancedEngine.search('"asynchronous programming"');
  phraseResults.forEach(result => {
    console.log(`  ${result.title} (score: ${result.score.toFixed(3)})`);
    console.log(`  Phrase matches: ${result.phraseMatches}, Term matches: ${result.matchingTerms}`);
  });
  
  // Faceted search
  console.log('\n2. Faceted Search (JavaScript + Advanced difficulty):');
  const facetResults = advancedEngine.search('JavaScript', {
    filters: {
      language: 'javascript',
      difficulty: 'advanced'
    }
  });
  facetResults.forEach(result => {
    console.log(`  ${result.title} (score: ${result.score.toFixed(3)})`);
    console.log(`  Facets: ${JSON.stringify(result.facets)}`);
  });
  
  // Get available facets
  console.log('\n3. Available Facets:');
  const facets = advancedEngine.getFacets();
  Object.entries(facets).forEach(([facetName, values]) => {
    console.log(`  ${facetName}:`, Object.entries(values).map(([v, c]) => `${v}(${c})`).join(', '));
  });
  
  // Search suggestions
  console.log('\n4. Search Suggestions:');
  const suggestions = advancedEngine.getSuggestions('java', 5);
  console.log(`  Suggestions for "java": ${suggestions.join(', ')}`);
  
  // Performance statistics
  console.log('\n--- Advanced Statistics ---');
  const stats = advancedEngine.getStats();
  console.log(`TF-IDF enabled: ${stats.features.tfIdfEnabled}`);
  console.log(`Phrase search enabled: ${stats.features.phraseSearchEnabled}`);
  console.log(`Phrase index size: ${stats.advanced.phraseIndexSize}`);
  console.log(`Facet count: ${stats.advanced.facetCount}`);
  console.log(`Cache hit rate: ${(stats.advanced.cacheHitRate * 100).toFixed(1)}%`);
}

/**
 * Example 3: E-commerce product search
 * Shows practical application for product catalogs
 */
function demonstrateEcommerceSearch() {
  console.log('=== E-commerce Search Demo ===\n');
  
  const productSearch = new AdvancedSearchEngine({
    enableTfIdf: true,
    enableFacetedSearch: true,
    boostTitleMatches: 3.0, // Higher boost for product titles
    minScore: 0.05
  });
  
  // Sample product catalog
  const products = [
    {
      id: 'prod1',
      title: 'Wireless Bluetooth Headphones',
      content: 'Premium wireless headphones with active noise cancellation. 30-hour battery life and superior sound quality. Perfect for music and calls.',
      metadata: { 
        category: 'electronics', 
        brand: 'audiotech', 
        price: 199, 
        rating: 4.5,
        inStock: true,
        tags: ['wireless', 'bluetooth', 'noise-cancelling'] 
      }
    },
    {
      id: 'prod2',
      title: 'Gaming Mechanical Keyboard',
      content: 'RGB backlit mechanical keyboard with cherry MX switches. Programmable keys and durable construction for professional gaming.',
      metadata: { 
        category: 'electronics', 
        brand: 'gamertech', 
        price: 149, 
        rating: 4.8,
        inStock: true,
        tags: ['gaming', 'mechanical', 'rgb', 'keyboard'] 
      }
    },
    {
      id: 'prod3',
      title: 'Organic Cotton T-Shirt',
      content: 'Soft organic cotton t-shirt in multiple colors. Sustainable fashion choice with comfortable fit and breathable fabric.',
      metadata: { 
        category: 'clothing', 
        brand: 'ecowear', 
        price: 29, 
        rating: 4.2,
        inStock: true,
        tags: ['organic', 'cotton', 'sustainable', 'clothing'] 
      }
    },
    {
      id: 'prod4',
      title: 'Stainless Steel Water Bottle',
      content: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours. Leak-proof design with wide mouth for easy filling.',
      metadata: { 
        category: 'home', 
        brand: 'hydrolife', 
        price: 39, 
        rating: 4.6,
        inStock: false,
        tags: ['stainless-steel', 'insulated', 'water-bottle', 'eco-friendly'] 
      }
    },
    {
      id: 'prod5',
      title: 'Wireless Gaming Mouse',
      content: 'High-precision wireless gaming mouse with programmable buttons. Long battery life and ergonomic design for extended gaming sessions.',
      metadata: { 
        category: 'electronics', 
        brand: 'gamertech', 
        price: 79, 
        rating: 4.4,
        inStock: true,
        tags: ['gaming', 'wireless', 'mouse', 'precision'] 
      }
    }
  ];
  
  // Index products
  console.log('Indexing product catalog...');
  products.forEach(product => {
    productSearch.addDocument(product.id, product);
    console.log(`Indexed: ${product.title}`);
  });
  
  // Product search scenarios
  console.log('\n--- Product Search Scenarios ---');
  
  // General search
  console.log('\n1. Search: "wireless"');
  const wirelessResults = productSearch.search('wireless');
  wirelessResults.forEach(result => {
    const product = products.find(p => p.id === result.id);
    console.log(`  ${result.title} - $${product.metadata.price} (score: ${result.score.toFixed(3)})`);
    console.log(`    ${result.snippet}`);
  });
  
  // Category filtered search
  console.log('\n2. Electronics under $100:');
  const electronicsResults = productSearch.search('', {
    filters: { 
      category: 'electronics',
      // Note: In a real implementation, you'd want price range filtering
    }
  });
  electronicsResults
    .filter(result => {
      const product = products.find(p => p.id === result.id);
      return product.metadata.price < 100;
    })
    .forEach(result => {
      const product = products.find(p => p.id === result.id);
      console.log(`  ${result.title} - $${product.metadata.price}`);
    });
  
  // Brand and category search
  console.log('\n3. Gaming products by GamerTech:');
  const gamingResults = productSearch.search('gaming', {
    filters: { brand: 'gamertech' }
  });
  gamingResults.forEach(result => {
    const product = products.find(p => p.id === result.id);
    console.log(`  ${result.title} - Rating: ${product.metadata.rating}/5`);
  });
  
  // Show product facets for filtering
  console.log('\n--- Available Product Filters ---');
  const productFacets = productSearch.getFacets();
  Object.entries(productFacets).forEach(([facet, values]) => {
    console.log(`${facet}:`);
    Object.entries(values).forEach(([value, count]) => {
      console.log(`  ${value} (${count} products)`);
    });
  });
}

// Export all implementations and examples
module.exports = {
  BasicSearchEngine,
  AdvancedSearchEngine,
  demonstrateBasicSearch,
  demonstrateAdvancedSearch,
  demonstrateEcommerceSearch
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('In-Memory Search Engine Implementations\n');
  console.log('This module demonstrates comprehensive search engine development');
  console.log('from basic inverted indexes to advanced TF-IDF ranking.\n');
  
  demonstrateBasicSearch();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateAdvancedSearch();
  }, 2000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateEcommerceSearch();
  }, 4000);
}