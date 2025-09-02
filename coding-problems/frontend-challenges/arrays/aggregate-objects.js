/**
 * File: aggregate-objects.js
 * Description: Advanced object aggregation by keys with multiple grouping and calculation strategies
 * 
 * Learning objectives:
 * - Understand data aggregation and grouping patterns
 * - Learn statistical calculations and data analysis
 * - See performance optimizations for large datasets
 * 
 * Time Complexity: O(n) for single-level grouping, O(n*m) for multi-level
 * Space Complexity: O(k) where k is number of unique groups
 */

// =======================
// Approach 1: Basic Aggregation by Key
// =======================

/**
 * Basic object aggregation with configurable grouping and calculations
 * Groups objects by specified key(s) and applies aggregation functions
 * 
 * Mental model: SQL GROUP BY with aggregate functions
 */
function aggregateObjects(objects, options = {}) {
  const {
    groupBy,
    aggregations = {},
    defaultValue = null
  } = options;
  
  if (!Array.isArray(objects)) {
    throw new Error('Objects must be an array');
  }
  
  if (!groupBy) {
    throw new Error('GroupBy key(s) must be specified');
  }
  
  const grouped = new Map();
  
  // Group objects by key(s)
  objects.forEach(obj => {
    const key = generateGroupKey(obj, groupBy);
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    
    grouped.get(key).push(obj);
  });
  
  // Apply aggregations to each group
  const results = [];
  
  for (const [groupKey, groupObjects] of grouped) {
    const result = {
      groupKey: parseGroupKey(groupKey, groupBy),
      count: groupObjects.length,
      items: groupObjects
    };
    
    // Apply each aggregation
    for (const [aggName, aggConfig] of Object.entries(aggregations)) {
      result[aggName] = calculateAggregation(groupObjects, aggConfig, defaultValue);
    }
    
    results.push(result);
  }
  
  return results;
}

/**
 * Generate consistent group key from object and groupBy configuration
 */
function generateGroupKey(obj, groupBy) {
  if (typeof groupBy === 'string') {
    const value = getNestedValue(obj, groupBy);
    return JSON.stringify({ [groupBy]: value });
  }
  
  if (Array.isArray(groupBy)) {
    const keyObj = {};
    groupBy.forEach(key => {
      keyObj[key] = getNestedValue(obj, key);
    });
    return JSON.stringify(keyObj);
  }
  
  if (typeof groupBy === 'object') {
    const keyObj = {};
    for (const [alias, path] of Object.entries(groupBy)) {
      keyObj[alias] = getNestedValue(obj, path);
    }
    return JSON.stringify(keyObj);
  }
  
  throw new Error('Invalid groupBy configuration');
}

/**
 * Parse group key back to readable format
 */
function parseGroupKey(keyString, groupBy) {
  try {
    const parsed = JSON.parse(keyString);
    
    if (typeof groupBy === 'string') {
      return parsed[groupBy];
    }
    
    return parsed;
  } catch (error) {
    return keyString;
  }
}

/**
 * Get nested property value
 */
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Calculate aggregation for a group of objects
 */
function calculateAggregation(objects, aggConfig, defaultValue) {
  if (typeof aggConfig === 'string') {
    // Simple property aggregation
    const values = objects.map(obj => getNestedValue(obj, aggConfig))
                          .filter(val => val !== undefined && val !== null);
                          
    return values.length > 0 ? values : defaultValue;
  }
  
  if (typeof aggConfig === 'function') {
    // Custom aggregation function
    return aggConfig(objects);
  }
  
  if (typeof aggConfig === 'object' && aggConfig !== null) {
    const { property, operation, defaultValue: aggDefault } = aggConfig;
    const values = objects.map(obj => getNestedValue(obj, property))
                          .filter(val => typeof val === 'number' && !isNaN(val));
    
    if (values.length === 0) {
      return aggDefault !== undefined ? aggDefault : defaultValue;
    }
    
    switch (operation) {
      case 'sum': return values.reduce((sum, val) => sum + val, 0);
      case 'avg': return values.reduce((sum, val) => sum + val, 0) / values.length;
      case 'min': return Math.min(...values);
      case 'max': return Math.max(...values);
      case 'count': return values.length;
      case 'median': return calculateMedian(values);
      case 'mode': return calculateMode(values);
      case 'std': return calculateStandardDeviation(values);
      default: throw new Error(`Unknown aggregation operation: ${operation}`);
    }
  }
  
  throw new Error('Invalid aggregation configuration');
}

/**
 * Calculate median value
 */
function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate mode (most frequent value)
 */
function calculateMode(values) {
  const frequency = new Map();
  
  values.forEach(val => {
    frequency.set(val, (frequency.get(val) || 0) + 1);
  });
  
  let maxFreq = 0;
  let mode = null;
  
  for (const [value, freq] of frequency) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = value;
    }
  }
  
  return mode;
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
}

// =======================
// Approach 2: Advanced Aggregation Engine
// =======================

/**
 * Advanced aggregation engine with multiple grouping levels and optimizations
 */
class AggregationEngine {
  constructor(objects = []) {
    this.objects = objects;
    this.results = null;
    this.groupingCache = new Map();
  }
  
  /**
   * Set data source
   */
  setData(objects) {
    this.objects = objects;
    this.clearCache();
    return this;
  }
  
  /**
   * Add data incrementally
   */
  addData(newObjects) {
    if (!Array.isArray(newObjects)) {
      newObjects = [newObjects];
    }
    
    this.objects.push(...newObjects);
    this.clearCache();
    return this;
  }
  
  /**
   * Multi-level grouping and aggregation
   */
  groupBy(groupingLevels) {
    if (!Array.isArray(groupingLevels)) {
      groupingLevels = [groupingLevels];
    }
    
    this.results = this.performMultiLevelGrouping(this.objects, groupingLevels, 0);
    return this;
  }
  
  /**
   * Perform multi-level recursive grouping
   */
  performMultiLevelGrouping(objects, groupingLevels, level) {
    if (level >= groupingLevels.length) {
      return objects;
    }
    
    const currentLevel = groupingLevels[level];
    const grouped = new Map();
    
    // Group by current level
    objects.forEach(obj => {
      const key = this.getGroupingKey(obj, currentLevel);
      
      if (!grouped.has(key)) {
        grouped.set(key, [];
      }
      
      grouped.get(key).push(obj);
    });
    
    // Process each group
    const results = [];
    
    for (const [groupKey, groupObjects] of grouped) {
      const groupResult = {
        level: level,
        key: this.parseGroupingKey(groupKey, currentLevel),
        count: groupObjects.length
      };
      
      // Apply aggregations for current level
      if (currentLevel.aggregations) {
        for (const [aggName, aggConfig] of Object.entries(currentLevel.aggregations)) {
          groupResult[aggName] = calculateAggregation(groupObjects, aggConfig);
        }
      }
      
      // Recurse to next level if exists
      if (level + 1 < groupingLevels.length) {
        groupResult.subgroups = this.performMultiLevelGrouping(
          groupObjects,
          groupingLevels,
          level + 1
        );
      } else {
        groupResult.items = groupObjects;
      }
      
      results.push(groupResult);
    }
    
    return results;
  }
  
  /**
   * Get grouping key for an object
   */
  getGroupingKey(obj, groupConfig) {
    if (typeof groupConfig === 'string') {
      return getNestedValue(obj, groupConfig);
    }
    
    if (groupConfig.key) {
      if (typeof groupConfig.key === 'function') {
        return groupConfig.key(obj);
      }
      return getNestedValue(obj, groupConfig.key);
    }
    
    if (groupConfig.keys) {
      const keyObj = {};
      groupConfig.keys.forEach(key => {
        keyObj[key] = getNestedValue(obj, key);
      });
      return JSON.stringify(keyObj);
    }
    
    throw new Error('Invalid grouping configuration');
  }
  
  /**
   * Parse grouping key back to readable format
   */
  parseGroupingKey(key, groupConfig) {
    if (typeof groupConfig === 'string' || 
        (groupConfig.key && typeof groupConfig.key !== 'function')) {
      return key;
    }
    
    if (groupConfig.keys) {
      try {
        return JSON.parse(key);
      } catch {
        return key;
      }
    }
    
    return key;
  }
  
  /**
   * Apply filtering before aggregation
   */
  filter(filterFn) {
    this.objects = this.objects.filter(filterFn);
    this.clearCache();
    return this;
  }
  
  /**
   * Sort results by specified criteria
   */
  sort(sortConfig) {
    if (!this.results) {
      throw new Error('No results to sort. Call groupBy() first.');
    }
    
    this.results = this.sortResults(this.results, sortConfig);
    return this;
  }
  
  /**
   * Sort results recursively
   */
  sortResults(results, sortConfig) {
    const sorted = [...results].sort((a, b) => {
      if (typeof sortConfig === 'string') {
        const aVal = a[sortConfig];
        const bVal = b[sortConfig];
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
      
      if (typeof sortConfig === 'function') {
        return sortConfig(a, b);
      }
      
      if (sortConfig.property) {
        const { property, direction = 'asc' } = sortConfig;
        const aVal = a[property];
        const bVal = b[property];
        
        let comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      }
      
      return 0;
    });
    
    // Sort subgroups recursively
    return sorted.map(group => {
      if (group.subgroups) {
        return {
          ...group,
          subgroups: this.sortResults(group.subgroups, sortConfig)
        };
      }
      return group;
    });
  }
  
  /**
   * Limit results
   */
  limit(count) {
    if (!this.results) {
      throw new Error('No results to limit. Call groupBy() first.');
    }
    
    this.results = this.results.slice(0, count);
    return this;
  }
  
  /**
   * Get final results
   */
  getResults() {
    return this.results || [];
  }
  
  /**
   * Get flattened results (all levels combined)
   */
  getFlatResults() {
    if (!this.results) return [];
    
    const flattened = [];
    
    const flatten = (groups, parentKey = '') => {
      groups.forEach(group => {
        const currentKey = parentKey 
          ? `${parentKey}.${JSON.stringify(group.key)}`
          : JSON.stringify(group.key);
          
        flattened.push({
          ...group,
          fullKey: currentKey
        });
        
        if (group.subgroups) {
          flatten(group.subgroups, currentKey);
        }
      });
    };
    
    flatten(this.results);
    return flattened;
  }
  
  /**
   * Get summary statistics
   */
  getSummary() {
    if (!this.results) return null;
    
    const summary = {
      totalGroups: 0,
      totalItems: this.objects.length,
      levels: 0,
      groupSizes: []
    };
    
    const analyze = (groups, level = 0) => {
      summary.levels = Math.max(summary.levels, level + 1);
      
      groups.forEach(group => {
        summary.totalGroups++;
        summary.groupSizes.push(group.count);
        
        if (group.subgroups) {
          analyze(group.subgroups, level + 1);
        }
      });
    };
    
    analyze(this.results);
    
    // Calculate group size statistics
    if (summary.groupSizes.length > 0) {
      summary.avgGroupSize = summary.groupSizes.reduce((a, b) => a + b, 0) / summary.groupSizes.length;
      summary.minGroupSize = Math.min(...summary.groupSizes);
      summary.maxGroupSize = Math.max(...summary.groupSizes);
    }
    
    return summary;
  }
  
  /**
   * Clear caches
   */
  clearCache() {
    this.groupingCache.clear();
    this.results = null;
  }
}

// =======================
// Approach 3: Specialized Aggregations
// =======================

/**
 * Specialized aggregation functions for common use cases
 */
const SpecializedAggregations = {
  /**
   * Time-based aggregation (by hour, day, month, etc.)
   */
  timeBasedAggregation(objects, dateProperty, interval = 'day', aggregations = {}) {
    const grouped = new Map();
    
    objects.forEach(obj => {
      const date = new Date(getNestedValue(obj, dateProperty));
      if (isNaN(date.getTime())) return;
      
      const key = this.getTimeIntervalKey(date, interval);
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      
      grouped.get(key).push(obj);
    });
    
    const results = [];
    
    for (const [timeKey, groupObjects] of grouped) {
      const result = {
        timeInterval: timeKey,
        count: groupObjects.length,
        items: groupObjects
      };
      
      // Apply aggregations
      for (const [aggName, aggConfig] of Object.entries(aggregations)) {
        result[aggName] = calculateAggregation(groupObjects, aggConfig);
      }
      
      results.push(result);
    }
    
    return results.sort((a, b) => a.timeInterval.localeCompare(b.timeInterval));
  },
  
  /**
   * Get time interval key
   */
  getTimeIntervalKey(date, interval) {
    switch (interval) {
      case 'hour':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      
      case 'day':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `${startOfWeek.getFullYear()}-W${String(Math.ceil((startOfWeek - new Date(startOfWeek.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))).padStart(2, '0')}`;
      
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      case 'year':
        return `${date.getFullYear()}`;
      
      default:
        throw new Error(`Unknown time interval: ${interval}`);
    }
  },
  
  /**
   * Range-based aggregation (for numeric values)
   */
  rangeAggregation(objects, property, ranges, aggregations = {}) {
    const grouped = new Map();
    
    objects.forEach(obj => {
      const value = getNestedValue(obj, property);
      if (typeof value !== 'number') return;
      
      const range = ranges.find(r => value >= r.min && value <= r.max);
      if (!range) return;
      
      const key = `${range.min}-${range.max}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, { range, objects: [] });
      }
      
      grouped.get(key).objects.push(obj);
    });
    
    const results = [];
    
    for (const [rangeKey, { range, objects: groupObjects }] of grouped) {
      const result = {
        range,
        rangeKey,
        count: groupObjects.length,
        items: groupObjects
      };
      
      // Apply aggregations
      for (const [aggName, aggConfig] of Object.entries(aggregations)) {
        result[aggName] = calculateAggregation(groupObjects, aggConfig);
      }
      
      results.push(result);
    }
    
    return results;
  },
  
  /**
   * Percentile-based aggregation
   */
  percentileAggregation(objects, property, percentiles = [25, 50, 75, 90, 95]) {
    const values = objects.map(obj => getNestedValue(obj, property))
                          .filter(val => typeof val === 'number' && !isNaN(val))
                          .sort((a, b) => a - b);
                          
    if (values.length === 0) {
      return { error: 'No numeric values found' };
    }
    
    const result = {
      totalValues: values.length,
      min: values[0],
      max: values[values.length - 1],
      percentiles: {}
    };
    
    percentiles.forEach(p => {
      const index = Math.ceil((p / 100) * values.length) - 1;
      result.percentiles[`p${p}`] = values[Math.max(0, index)];
    });
    
    return result;
  }
};

// =======================
// Real-world Examples
// =======================

// Example: Sales data analysis
function analyzeSalesData(sales) {
  const engine = new AggregationEngine(sales);
  
  return engine
    .filter(sale => sale.amount > 0) // Filter valid sales
    .groupBy([
      {
        key: 'region',
        aggregations: {
          totalRevenue: { property: 'amount', operation: 'sum' },
          avgOrderValue: { property: 'amount', operation: 'avg' },
          totalOrders: { property: 'amount', operation: 'count' }
        }
      },
      {
        key: 'category',
        aggregations: {
          categoryRevenue: { property: 'amount', operation: 'sum' },
          topProduct: (objects) => {
            const productCounts = new Map();
            objects.forEach(obj => {
              productCounts.set(obj.product, (productCounts.get(obj.product) || 0) + 1);
            });
            
            let maxCount = 0;
            let topProduct = null;
            for (const [product, count] of productCounts) {
              if (count > maxCount) {
                maxCount = count;
                topProduct = product;
              }
            }
            return topProduct;
          }
        }
      }
    ])
    .sort({ property: 'totalRevenue', direction: 'desc' })
    .getResults();
}

// Example: User activity analysis
function analyzeUserActivity(activities) {
  // Time-based analysis
  const hourlyActivity = SpecializedAggregations.timeBasedAggregation(
    activities,
    'timestamp',
    'hour',
    {
      uniqueUsers: (objects) => {
        const uniqueUserIds = new Set(objects.map(obj => obj.userId));
        return uniqueUserIds.size;
      },
      totalDuration: { property: 'duration', operation: 'sum' }
    }
  );
  
  // Range-based analysis for session duration
  const durationRanges = [
    { min: 0, max: 60, label: 'Quick (0-1 min)' },
    { min: 61, max: 300, label: 'Short (1-5 min)' },
    { min: 301, max: 1800, label: 'Medium (5-30 min)' },
    { min: 1801, max: Infinity, label: 'Long (30+ min)' }
  ];
  
  const sessionAnalysis = SpecializedAggregations.rangeAggregation(
    activities,
    'duration',
    durationRanges,
    {
      avgDuration: { property: 'duration', operation: 'avg' },
      uniqueUsers: (objects) => new Set(objects.map(obj => obj.userId)).size
    }
  );
  
  return {
    hourlyActivity,
    sessionAnalysis
  };
}

// Export for use in other modules
module.exports = {
  aggregateObjects,
  AggregationEngine,
  SpecializedAggregations,
  calculateAggregation,
  getNestedValue,
  analyzeSalesData,
  analyzeUserActivity
};