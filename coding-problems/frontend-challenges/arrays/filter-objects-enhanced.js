/**
 * File: filter-objects-enhanced.js
 * Description: Advanced filtering for arrays of objects with multiple criteria and performance optimizations
 * 
 * Learning objectives:
 * - Understand complex object filtering patterns
 * - Learn performance optimization for large datasets
 * - See indexing and search optimization techniques
 * 
 * Time Complexity: O(n*m) where n is objects, m is filter criteria
 * Space Complexity: O(k) where k is filtered results
 */

// =======================
// Approach 1: Basic Object Filtering
// =======================

/**
 * Basic object filtering with multiple criteria support
 * Handles property paths, operators, and value comparisons
 * 
 * Mental model: SQL-like WHERE clause for JavaScript objects
 */
function filterObjectsBasic(objects, filters) {
  if (!Array.isArray(objects)) {
    throw new Error('Objects must be an array');
  }
  
  if (!filters || typeof filters !== 'object') {
    return objects;
  }
  
  return objects.filter(obj => {
    return Object.entries(filters).every(([key, expectedValue]) => {
      const actualValue = getNestedValue(obj, key);
      
      // Handle different comparison types
      if (typeof expectedValue === 'function') {
        return expectedValue(actualValue, obj);
      }
      
      if (expectedValue && typeof expectedValue === 'object' && expectedValue.$operator) {
        return applyOperator(actualValue, expectedValue);
      }
      
      // Direct comparison
      return actualValue === expectedValue;
    });
  });
}

/**
 * Get nested property value using dot notation
 */
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Apply comparison operators
 */
function applyOperator(actualValue, filter) {
  const { $operator, $value } = filter;
  
  switch ($operator) {
    case '$gt': return actualValue > $value;
    case '$gte': return actualValue >= $value;
    case '$lt': return actualValue < $value;
    case '$lte': return actualValue <= $value;
    case '$ne': return actualValue !== $value;
    case '$in': return Array.isArray($value) && $value.includes(actualValue);
    case '$nin': return Array.isArray($value) && !$value.includes(actualValue);
    case '$regex': return new RegExp($value).test(String(actualValue));
    case '$exists': return $value ? actualValue !== undefined : actualValue === undefined;
    case '$type': return typeof actualValue === $value;
    default: return actualValue === $value;
  }
}

// =======================
// Approach 2: Advanced Query Engine
// =======================

/**
 * Advanced object query engine with indexing and optimization
 * Supports complex queries, sorting, and pagination
 */
class ObjectQueryEngine {
  constructor(objects = []) {
    this.objects = objects;
    this.indexes = new Map(); // Property indexes for fast lookup
    this.queryCache = new Map(); // Query result cache
    this.cacheMaxSize = 100;
  }
  
  /**
   * Set data and rebuild indexes
   */
  setData(objects) {
    this.objects = objects;
    this.clearIndexes();
    this.clearCache();
    return this;
  }
  
  /**
   * Add data and update indexes
   */
  addData(newObjects) {
    if (!Array.isArray(newObjects)) {
      newObjects = [newObjects];
    }
    
    this.objects.push(...newObjects);
    
    // Update existing indexes
    for (const [property, index] of this.indexes) {
      this.updateIndex(property, newObjects);
    }
    
    this.clearCache();
    return this;
  }
  
  /**
   * Create index for faster filtering
   */
  createIndex(property) {
    const index = new Map();
    
    this.objects.forEach((obj, objIndex) => {
      const value = getNestedValue(obj, property);
      
      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, []);
        }
        index.get(value).push(objIndex);
      }
    });
    
    this.indexes.set(property, index);
    return this;
  }
  
  /**
   * Update existing index with new objects
   */
  updateIndex(property, newObjects) {
    const index = this.indexes.get(property);
    if (!index) return;
    
    const startIndex = this.objects.length - newObjects.length;
    
    newObjects.forEach((obj, relativeIndex) => {
      const value = getNestedValue(obj, property);
      const objIndex = startIndex + relativeIndex;
      
      if (value !== undefined) {
        if (!index.has(value)) {
          index.set(value, []);
        }
        index.get(value).push(objIndex);
      }
    });
  }
  
  /**
   * Advanced filter with multiple strategies
   */
  filter(query, options = {}) {
    const {
      useIndex = true,
      useCache = true,
      limit = null,
      offset = 0,
      sort = null
    } = options;
    
    // Check cache first
    const cacheKey = JSON.stringify({ query, limit, offset, sort });
    if (useCache && this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }
    
    let candidateIndices = null;
    
    // Try to use indexes for optimization
    if (useIndex && typeof query === 'object') {
      candidateIndices = this.findCandidatesUsingIndexes(query);
    }
    
    // Filter objects
    let results;
    if (candidateIndices !== null) {
      // Use indexed approach
      results = candidateIndices
        .map(index => this.objects[index])
        .filter(obj => this.matchesQuery(obj, query));
    } else {
      // Full scan approach
      results = this.objects.filter(obj => this.matchesQuery(obj, query));
    }
    
    // Apply sorting
    if (sort) {
      results = this.sortResults(results, sort);
    }
    
    // Apply pagination
    if (offset > 0 || limit !== null) {
      const start = offset;
      const end = limit !== null ? start + limit : undefined;
      results = results.slice(start, end);
    }
    
    // Cache results
    if (useCache) {
      this.addToCache(cacheKey, results);
    }
    
    return results;
  }
  
  /**
   * Find candidate object indices using indexes
   */
  findCandidatesUsingIndexes(query) {
    const indexedFilters = [];
    const nonIndexedFilters = [];
    
    // Separate indexed and non-indexed filters
    for (const [property, filter] of Object.entries(query)) {
      if (this.indexes.has(property) && this.canUseIndexForFilter(filter)) {
        indexedFilters.push([property, filter]);
      } else {
        nonIndexedFilters.push([property, filter]);
      }
    }
    
    if (indexedFilters.length === 0) {
      return null; // No usable indexes
    }
    
    // Start with the most selective index
    let candidateIndices = null;
    
    for (const [property, filter] of indexedFilters) {
      const index = this.indexes.get(property);
      const matchingIndices = this.getIndexMatches(index, filter);
      
      if (candidateIndices === null) {
        candidateIndices = new Set(matchingIndices);
      } else {
        // Intersect with existing candidates
        candidateIndices = new Set(
          matchingIndices.filter(idx => candidateIndices.has(idx))
        );
      }
      
      // Early termination if no candidates left
      if (candidateIndices.size === 0) {
        break;
      }
    }
    
    return candidateIndices ? Array.from(candidateIndices) : null;
  }
  
  /**
   * Check if filter can use index
   */
  canUseIndexForFilter(filter) {
    if (typeof filter === 'function') return false;
    
    if (filter && typeof filter === 'object' && filter.$operator) {
      // Only certain operators can use indexes efficiently
      return ['$in', '$ne'].includes(filter.$operator);
    }
    
    return true; // Direct equality
  }
  
  /**
   * Get matching indices from index
   */
  getIndexMatches(index, filter) {
    if (typeof filter === 'function') {
      return []; // Can't use index
    }
    
    if (filter && typeof filter === 'object' && filter.$operator) {
      const { $operator, $value } = filter;
      
      switch ($operator) {
        case '$in':
          const indices = [];
          if (Array.isArray($value)) {
            for (const val of $value) {
              if (index.has(val)) {
                indices.push(...index.get(val));
              }
            }
          }
          return indices;
          
        case '$ne':
          const allIndices = [];
          for (const [value, objectIndices] of index) {
            if (value !== $value) {
              allIndices.push(...objectIndices);
            }
          }
          return allIndices;
          
        default:
          return []; // Other operators need full scan
      }
    }
    
    // Direct equality
    return index.has(filter) ? index.get(filter) : [];
  }
  
  /**
   * Check if object matches query
   */
  matchesQuery(obj, query) {
    if (typeof query === 'function') {
      return query(obj);
    }
    
    if (typeof query !== 'object' || query === null) {
      return true;
    }
    
    return Object.entries(query).every(([key, filter]) => {
      const value = getNestedValue(obj, key);
      
      if (typeof filter === 'function') {
        return filter(value, obj);
      }
      
      if (filter && typeof filter === 'object' && filter.$operator) {
        return applyOperator(value, filter);
      }
      
      return value === filter;
    });
  }
  
  /**
   * Sort results
   */
  sortResults(results, sortConfig) {
    if (typeof sortConfig === 'string') {
      // Simple property sort
      return results.sort((a, b) => {
        const aVal = getNestedValue(a, sortConfig);
        const bVal = getNestedValue(b, sortConfig);
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    if (Array.isArray(sortConfig)) {
      // Multi-property sort
      return results.sort((a, b) => {
        for (const sortItem of sortConfig) {
          const { property, direction = 'asc' } = 
            typeof sortItem === 'string' 
              ? { property: sortItem, direction: 'asc' }
              : sortItem;
              
          const aVal = getNestedValue(a, property);
          const bVal = getNestedValue(b, property);
          
          let comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          if (direction === 'desc') comparison *= -1;
          
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    }
    
    return results;
  }
  
  /**
   * Add to cache with LRU eviction
   */
  addToCache(key, value) {
    if (this.queryCache.size >= this.cacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    
    this.queryCache.set(key, value);
  }
  
  /**
   * Clear all indexes
   */
  clearIndexes() {
    this.indexes.clear();
    return this;
  }
  
  /**
   * Clear query cache
   */
  clearCache() {
    this.queryCache.clear();
    return this;
  }
  
  /**
   * Get query statistics
   */
  getStats() {
    return {
      objectCount: this.objects.length,
      indexCount: this.indexes.size,
      cachedQueries: this.queryCache.size,
      indexes: Array.from(this.indexes.keys())
    };
  }
}

// =======================
// Approach 3: Specialized Filters
// =======================

/**
 * Collection of specialized filter functions
 */
const SpecializedFilters = {
  /**
   * Filter by date range
   */
  dateRange(objects, dateProperty, startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return objects.filter(obj => {
      const dateValue = getNestedValue(obj, dateProperty);
      if (!dateValue) return false;
      
      const timestamp = new Date(dateValue).getTime();
      return timestamp >= start && timestamp <= end;
    });
  },
  
  /**
   * Filter by text search (fuzzy matching)
   */
  textSearch(objects, searchProperties, query, options = {}) {
    const {
      caseSensitive = false,
      fuzzy = false,
      minScore = 0.3
    } = options;
    
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    
    return objects.filter(obj => {
      return searchProperties.some(property => {
        const value = getNestedValue(obj, property);
        if (typeof value !== 'string') return false;
        
        const text = caseSensitive ? value : value.toLowerCase();
        
        if (fuzzy) {
          const score = calculateSimilarity(text, searchQuery);
          return score >= minScore;
        }
        
        return text.includes(searchQuery);
      });
    });
  },
  
  /**
   * Filter by numeric range with tolerance
   */
  numericRange(objects, property, min, max, tolerance = 0) {
    return objects.filter(obj => {
      const value = getNestedValue(obj, property);
      if (typeof value !== 'number') return false;
      
      return value >= (min - tolerance) && value <= (max + tolerance);
    });
  },
  
  /**
   * Filter by array intersection
   */
  arrayIntersection(objects, property, targetArray) {
    return objects.filter(obj => {
      const value = getNestedValue(obj, property);
      if (!Array.isArray(value)) return false;
      
      return targetArray.some(item => value.includes(item));
    });
  },
  
  /**
   * Filter by geographic proximity (simple distance)
   */
  geoProximity(objects, latProperty, lngProperty, centerLat, centerLng, maxDistance) {
    return objects.filter(obj => {
      const lat = getNestedValue(obj, latProperty);
      const lng = getNestedValue(obj, lngProperty);
      
      if (typeof lat !== 'number' || typeof lng !== 'number') return false;
      
      const distance = calculateDistance(lat, lng, centerLat, centerLng);
      return distance <= maxDistance;
    });
  }
};

/**
 * Calculate string similarity (simple Levenshtein-based)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate distance between two points (simplified)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =======================
// Real-world Examples
// =======================

// Example: E-commerce product filtering
function filterProducts(products, filters) {
  const engine = new ObjectQueryEngine(products);
  
  // Create indexes for common filter properties
  engine.createIndex('category')
         .createIndex('brand')
         .createIndex('inStock');
  
  return engine.filter({
    category: filters.category,
    'price': { $operator: '$lte', $value: filters.maxPrice },
    inStock: true,
    'rating': { $operator: '$gte', $value: filters.minRating || 0 }
  }, {
    sort: [{ property: 'price', direction: 'asc' }],
    limit: filters.limit
  });
}

// Example: User search with multiple criteria
function searchUsers(users, searchCriteria) {
  const {
    name,
    ageRange,
    location,
    skills,
    joinedAfter
  } = searchCriteria;
  
  let filtered = users;
  
  // Apply text search on name
  if (name) {
    filtered = SpecializedFilters.textSearch(
      filtered,
      ['firstName', 'lastName', 'username'],
      name,
      { fuzzy: true, minScore: 0.4 }
    );
  }
  
  // Apply age range filter
  if (ageRange) {
    filtered = SpecializedFilters.numericRange(
      filtered,
      'age',
      ageRange.min,
      ageRange.max
    );
  }
  
  // Apply location filter
  if (location) {
    filtered = SpecializedFilters.geoProximity(
      filtered,
      'location.lat',
      'location.lng',
      location.lat,
      location.lng,
      location.radius
    );
  }
  
  // Apply skills filter
  if (skills && skills.length > 0) {
    filtered = SpecializedFilters.arrayIntersection(
      filtered,
      'skills',
      skills
    );
  }
  
  // Apply date filter
  if (joinedAfter) {
    filtered = SpecializedFilters.dateRange(
      filtered,
      'joinedDate',
      joinedAfter,
      new Date()
    );
  }
  
  return filtered;
}

// Export for use in other modules
module.exports = {
  filterObjectsBasic,
  ObjectQueryEngine,
  SpecializedFilters,
  getNestedValue,
  applyOperator,
  calculateSimilarity,
  filterProducts,
  searchUsers
};