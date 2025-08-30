/**
 * File: transform-streams.js
 * Description: Transform stream implementations for data processing pipelines
 * 
 * Learning objectives:
 * - Understand transform streams as readable/writable combination
 * - Master data transformation patterns and pipelines
 * - Learn object mode transformations for structured data
 * - See practical examples of data processing workflows
 * 
 * Key concepts covered:
 * - _transform() method implementation
 * - _flush() for cleanup and final processing
 * - Object mode vs binary mode transformations
 * - Stream composition and pipelines
 * - Error handling in transform chains
 */

const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

/**
 * Example 1: Basic Text Transform Stream
 * 
 * This example demonstrates the fundamental transform pattern.
 * Each chunk is processed and the result is pushed to the readable side.
 * Shows line-by-line processing with buffering for partial lines.
 */
class LineUppercaseTransform extends Transform {
  constructor(options = {}) {
    super(options);
    
    // Buffer for incomplete lines
    this.buffer = '';
    this.lineCount = 0;
    this.totalChars = 0;
  }

  // Core transform method - called for each incoming chunk
  // chunk: the data to transform
  // encoding: character encoding (for string mode)
  // callback: call when transformation is complete
  _transform(chunk, encoding, callback) {
    // Convert chunk to string and add to buffer
    const data = this.buffer + chunk.toString();
    
    // Split into lines, keeping the last partial line in buffer
    const lines = data.split('\n');
    this.buffer = lines.pop() || ''; // Last element might be partial
    
    // Process complete lines
    for (const line of lines) {
      if (line.trim()) { // Skip empty lines
        this.lineCount++;
        this.totalChars += line.length;
        
        // Transform the line and push to readable side
        const transformed = `[${this.lineCount}] ${line.toUpperCase()}\n`;
        this.push(transformed);
        
        console.log(`Transformed line ${this.lineCount}: "${line}" -> "${line.toUpperCase()}"`);
      }
    }
    
    // Signal that this chunk is processed
    callback();
  }

  // Called when no more data will be written
  // Use this to process any remaining buffered data
  _flush(callback) {
    // Process any remaining data in buffer
    if (this.buffer.trim()) {
      this.lineCount++;
      this.totalChars += this.buffer.length;
      
      const transformed = `[${this.lineCount}] ${this.buffer.toUpperCase()}\n`;
      this.push(transformed);
      
      console.log(`Final line ${this.lineCount}: "${this.buffer}" -> "${this.buffer.toUpperCase()}"`);
    }
    
    console.log(`LineUppercaseTransform stats: ${this.lineCount} lines, ${this.totalChars} characters`);
    callback();
  }
}

/**
 * Example 2: JSON Processing Transform (Object Mode)
 * 
 * This demonstrates object mode transformations where we process
 * JavaScript objects instead of strings/buffers. Perfect for
 * data processing pipelines and ETL operations.
 */
class JSONProcessorTransform extends Transform {
  constructor(options = {}) {
    // Enable object mode to work with JavaScript objects
    super({ objectMode: true, ...options });
    
    this.processor = options.processor || this.defaultProcessor;
    this.stats = {
      processed: 0,
      filtered: 0,
      errors: 0
    };
  }

  _transform(chunk, encoding, callback) {
    try {
      // Apply processing function to the object
      const result = this.processor(chunk);
      
      if (result === null || result === undefined) {
        // Item was filtered out
        this.stats.filtered++;
        console.log(`Filtered item: ${JSON.stringify(chunk)}`);
      } else {
        // Item was processed
        this.stats.processed++;
        this.push(result);
        console.log(`Processed: ${JSON.stringify(chunk)} -> ${JSON.stringify(result)}`);
      }
      
      callback();
      
    } catch (error) {
      this.stats.errors++;
      console.error(`Processing error for ${JSON.stringify(chunk)}:`, error);
      
      // Options for error handling:
      // 1. Fail the entire stream: callback(error)
      // 2. Skip item and continue: callback()
      // 3. Push error object downstream
      
      // Skip item and continue in this example
      callback();
    }
  }

  // Default processor - can be overridden via options
  defaultProcessor(obj) {
    // Example: extract and transform user data
    if (obj && typeof obj === 'object' && obj.name) {
      return {
        id: obj.id || Date.now(),
        name: obj.name.toUpperCase(),
        email: obj.email?.toLowerCase(),
        processedAt: new Date().toISOString(),
        // Add computed fields
        nameLength: obj.name.length,
        isValidEmail: obj.email ? /\S+@\S+\.\S+/.test(obj.email) : false
      };
    }
    
    // Filter out invalid objects
    return null;
  }

  _flush(callback) {
    console.log('\nJSONProcessorTransform final stats:');
    console.log(`  Processed: ${this.stats.processed}`);
    console.log(`  Filtered: ${this.stats.filtered}`);
    console.log(`  Errors: ${this.stats.errors}`);
    callback();
  }
}

/**
 * Example 3: CSV to JSON Transform
 * 
 * This is a common interview question - implement a CSV parser
 * that converts CSV rows to JSON objects. Handles quoted fields,
 * escaping, and malformed data.
 */
class CSVToJSONTransform extends Transform {
  constructor(headers, options = {}) {
    super({ objectMode: true, ...options });
    
    this.headers = headers;
    this.rowCount = 0;
    this.delimiter = options.delimiter || ',';
    this.quote = options.quote || '"';
    
    // Buffer for handling partial rows across chunks
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    // Add chunk to buffer
    const data = this.buffer + chunk.toString();
    
    // Split into rows, keeping last partial row in buffer
    const rows = data.split('\n');
    this.buffer = rows.pop() || '';
    
    // Process complete rows
    for (const row of rows) {
      if (row.trim()) {
        try {
          const parsedRow = this.parseCSVRow(row);
          if (parsedRow) {
            this.push(parsedRow);
          }
        } catch (error) {
          console.error(`Error parsing CSV row ${this.rowCount + 1}: "${row}"`, error);
          // Continue processing other rows
        }
      }
    }
    
    callback();
  }

  parseCSVRow(row) {
    this.rowCount++;
    
    // Simple CSV parser - handles quoted fields and escaping
    const fields = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < row.length) {
      const char = row[i];
      
      if (char === this.quote) {
        if (inQuotes && row[i + 1] === this.quote) {
          // Escaped quote
          current += this.quote;
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === this.delimiter && !inQuotes) {
        // Field delimiter
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    fields.push(current.trim());
    
    // Ensure we have the right number of fields
    if (fields.length !== this.headers.length) {
      console.warn(`Row ${this.rowCount} has ${fields.length} fields, expected ${this.headers.length}`);
    }
    
    // Create object from headers and fields
    const obj = {};
    this.headers.forEach((header, index) => {
      obj[header] = fields[index] || '';
    });
    
    obj.__rowNumber = this.rowCount;
    
    console.log(`CSV row ${this.rowCount}: ${JSON.stringify(obj)}`);
    return obj;
  }

  _flush(callback) {
    // Process any remaining data in buffer
    if (this.buffer.trim()) {
      try {
        const parsedRow = this.parseCSVRow(this.buffer);
        if (parsedRow) {
          this.push(parsedRow);
        }
      } catch (error) {
        console.error(`Error parsing final CSV row: "${this.buffer}"`, error);
      }
    }
    
    console.log(`CSVToJSONTransform completed: ${this.rowCount} rows processed`);
    callback();
  }
}

/**
 * Example 4: Aggregation Transform
 * 
 * This transform accumulates data and outputs summaries.
 * Useful for streaming analytics, reporting, and data aggregation.
 * Shows how to buffer and group data for batch processing.
 */
class AggregationTransform extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    
    this.windowSize = options.windowSize || 10;
    this.groupBy = options.groupBy || null;
    this.aggregations = options.aggregations || ['count'];
    
    this.buffer = [];
    this.windowCount = 0;
  }

  _transform(chunk, encoding, callback) {
    this.buffer.push(chunk);
    
    console.log(`Buffering item ${this.buffer.length}: ${JSON.stringify(chunk)}`);
    
    // Check if we have a full window
    if (this.buffer.length >= this.windowSize) {
      this.processWindow();
    }
    
    callback();
  }

  processWindow() {
    this.windowCount++;
    console.log(`\nProcessing window ${this.windowCount} with ${this.buffer.length} items`);
    
    let aggregated;
    
    if (this.groupBy) {
      // Group by specified field
      aggregated = this.groupedAggregation();
    } else {
      // Simple aggregation across all items
      aggregated = this.simpleAggregation();
    }
    
    // Add metadata
    aggregated.__window = this.windowCount;
    aggregated.__itemCount = this.buffer.length;
    aggregated.__processedAt = new Date().toISOString();
    
    this.push(aggregated);
    
    // Clear buffer for next window
    this.buffer = [];
  }

  simpleAggregation() {
    const result = {
      count: this.buffer.length,
      items: this.buffer.slice() // Copy for output
    };
    
    // Add numeric aggregations if data contains numbers
    const numericFields = this.findNumericFields();
    
    for (const field of numericFields) {
      const values = this.buffer
        .map(item => item[field])
        .filter(val => typeof val === 'number');
      
      if (values.length > 0) {
        result[`${field}_sum`] = values.reduce((a, b) => a + b, 0);
        result[`${field}_avg`] = result[`${field}_sum`] / values.length;
        result[`${field}_min`] = Math.min(...values);
        result[`${field}_max`] = Math.max(...values);
      }
    }
    
    return result;
  }

  groupedAggregation() {
    const groups = {};
    
    // Group items by the specified field
    for (const item of this.buffer) {
      const key = item[this.groupBy] || 'unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }
    
    // Aggregate each group
    const result = { groups: {} };
    
    for (const [key, items] of Object.entries(groups)) {
      result.groups[key] = {
        count: items.length,
        items: items
      };
      
      // Add numeric aggregations for this group
      const numericFields = this.findNumericFields(items);
      
      for (const field of numericFields) {
        const values = items
          .map(item => item[field])
          .filter(val => typeof val === 'number');
        
        if (values.length > 0) {
          result.groups[key][`${field}_sum`] = values.reduce((a, b) => a + b, 0);
          result.groups[key][`${field}_avg`] = result.groups[key][`${field}_sum`] / values.length;
        }
      }
    }
    
    return result;
  }

  findNumericFields(items = this.buffer) {
    const fields = new Set();
    
    for (const item of items.slice(0, 5)) { // Sample first 5 items
      for (const [key, value] of Object.entries(item)) {
        if (typeof value === 'number') {
          fields.add(key);
        }
      }
    }
    
    return Array.from(fields);
  }

  _flush(callback) {
    // Process any remaining items in buffer
    if (this.buffer.length > 0) {
      console.log(`\nProcessing final window with ${this.buffer.length} items`);
      this.processWindow();
    }
    
    console.log(`AggregationTransform completed: ${this.windowCount} windows processed`);
    callback();
  }
}

/**
 * Demonstration Functions
 * 
 * These show practical usage patterns and stream composition.
 */

// Example 1: Basic text transformation
function demonstrateLineTransform() {
  console.log('\n=== Line Transform Demo ===');
  
  const { Readable } = require('stream');
  
  // Create a readable stream with test data
  const testData = [
    'hello world\n',
    'this is line two\n',
    'partial line without newline',
    '\nline after partial\n',
    'final line'
  ];
  
  let index = 0;
  const sourceStream = new Readable({
    read() {
      if (index < testData.length) {
        this.push(testData[index++]);
      } else {
        this.push(null);
      }
    }
  });
  
  const transformer = new LineUppercaseTransform();
  
  sourceStream.pipe(transformer).on('data', (chunk) => {
    console.log(`Output: ${chunk.toString().trim()}`);
  }).on('end', () => {
    console.log('Line transformation completed');
  });
}

// Example 2: JSON object processing
async function demonstrateJSONProcessor() {
  console.log('\n=== JSON Processor Demo ===');
  
  const { Readable } = require('stream');
  
  // Test data with various object types
  const testObjects = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'jane smith', email: 'JANE@EXAMPLE.COM' },
    { name: 'Bob Wilson' }, // Missing email
    { id: 3, email: 'invalid-email' }, // Missing name
    { id: 4, name: 'Alice Johnson', email: 'alice@test.com' },
    'invalid object', // Wrong type
    null, // Null value
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.org' }
  ];
  
  let index = 0;
  const sourceStream = new Readable({
    objectMode: true,
    read() {
      if (index < testObjects.length) {
        this.push(testObjects[index++]);
      } else {
        this.push(null);
      }
    }
  });
  
  // Custom processor for this demo
  const customProcessor = (obj) => {
    if (obj && typeof obj === 'object' && obj.name) {
      return {
        id: obj.id || Math.floor(Math.random() * 1000),
        displayName: obj.name.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' '),
        email: obj.email?.toLowerCase(),
        hasEmail: !!obj.email,
        processedAt: Date.now()
      };
    }
    return null; // Filter out invalid objects
  };
  
  const processor = new JSONProcessorTransform({ processor: customProcessor });
  
  const results = [];
  
  try {
    await pipeline(
      sourceStream,
      processor,
      new (require('stream')).Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
          results.push(chunk);
          console.log(`Result: ${JSON.stringify(chunk)}`);
          callback();
        }
      })
    );
    
    console.log(`\nJSON processing completed: ${results.length} valid objects`);
    
  } catch (error) {
    console.error('Pipeline error:', error);
  }
}

// Example 3: CSV processing demonstration
function demonstrateCSVTransform() {
  console.log('\n=== CSV Transform Demo ===');
  
  const { Readable } = require('stream');
  
  // Sample CSV data with various edge cases
  const csvData = [
    'id,name,email,age\n',
    '1,"John Doe",john@example.com,30\n',
    '2,"Jane Smith",jane@example.com,25\n',
    '3,"Bob ""Bobby"" Wilson",bob@test.com,35\n', // Quoted field with escaped quotes
    '4,Alice Johnson,alice@example.org,28\n',
    '5,"Charlie Brown,Jr.",charlie@example.net,', // Comma in quoted field, missing age
    '40\n', // Age on next line (testing partial row handling)
    '6,Dave Davis,dave@test.com,32\n'
  ];
  
  let index = 0;
  const sourceStream = new Readable({
    read() {
      if (index < csvData.length) {
        // Simulate chunked reading by sending data in pieces
        this.push(csvData[index++]);
      } else {
        this.push(null);
      }
    }
  });
  
  const headers = ['id', 'name', 'email', 'age'];
  const csvTransform = new CSVToJSONTransform(headers);
  
  const results = [];
  
  csvTransform.on('data', (obj) => {
    results.push(obj);
    console.log(`CSV Object: ${JSON.stringify(obj)}`);
  });
  
  csvTransform.on('end', () => {
    console.log(`CSV transformation completed: ${results.length} records processed`);
  });
  
  sourceStream.pipe(csvTransform);
}

// Example 4: Aggregation demonstration
async function demonstrateAggregation() {
  console.log('\n=== Aggregation Demo ===');
  
  const { Readable } = require('stream');
  
  // Generate test data with categories and numeric values
  const categories = ['A', 'B', 'C'];
  const testData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    category: categories[i % categories.length],
    value: Math.floor(Math.random() * 100) + 1,
    timestamp: Date.now() + i * 1000
  }));
  
  let index = 0;
  const sourceStream = new Readable({
    objectMode: true,
    read() {
      if (index < testData.length) {
        this.push(testData[index++]);
      } else {
        this.push(null);
      }
    }
  });
  
  const aggregator = new AggregationTransform({
    windowSize: 8,
    groupBy: 'category'
  });
  
  try {
    await pipeline(
      sourceStream,
      aggregator,
      new (require('stream')).Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
          console.log(`\nAggregation Window ${chunk.__window}:`);
          console.log(`  Items: ${chunk.__itemCount}`);
          console.log(`  Groups:`, Object.keys(chunk.groups));
          
          for (const [category, data] of Object.entries(chunk.groups)) {
            console.log(`    ${category}: ${data.count} items, avg value: ${data.value_avg?.toFixed(2) || 'N/A'}`);
          }
          
          callback();
        }
      })
    );
    
    console.log('Aggregation demo completed');
    
  } catch (error) {
    console.error('Aggregation pipeline error:', error);
  }
}

/**
 * Stream Pipeline Composition Example
 * 
 * Shows how to chain multiple transforms together for complex processing.
 */
async function demonstrateStreamPipeline() {
  console.log('\n=== Stream Pipeline Demo ===');
  
  const { Readable } = require('stream');
  
  // Raw CSV data
  const csvInput = 'name,score,category\nAlice,85,A\nBob,92,B\nCharlie,78,A\nDiana,95,B\nEve,88,A\nFrank,91,B\n';
  
  const sourceStream = new Readable({
    read() {
      this.push(csvInput);
      this.push(null);
    }
  });
  
  // Transform 1: CSV to JSON
  const csvTransform = new CSVToJSONTransform(['name', 'score', 'category']);
  
  // Transform 2: Process and validate
  const processor = new JSONProcessorTransform({
    processor: (obj) => {
      const score = parseInt(obj.score);
      if (isNaN(score)) return null;
      
      return {
        name: obj.name,
        score: score,
        category: obj.category,
        grade: score >= 90 ? 'A' : score >= 80 ? 'B' : 'C',
        isHighScore: score >= 90
      };
    }
  });
  
  // Transform 3: Aggregate by category
  const aggregator = new AggregationTransform({
    windowSize: 10,
    groupBy: 'category'
  });
  
  try {
    await pipeline(
      sourceStream,
      csvTransform,
      processor,
      aggregator,
      new (require('stream')).Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
          console.log('\nFinal Aggregation Result:');
          console.log(JSON.stringify(chunk, null, 2));
          callback();
        }
      })
    );
    
    console.log('Stream pipeline completed successfully');
    
  } catch (error) {
    console.error('Pipeline error:', error);
  }
}

/**
 * Run all demonstrations
 */
if (require.main === module) {
  (async () => {
    demonstrateLineTransform();
    
    setTimeout(async () => {
      await demonstrateJSONProcessor();
      
      setTimeout(() => {
        demonstrateCSVTransform();
        
        setTimeout(async () => {
          await demonstrateAggregation();
          
          setTimeout(async () => {
            await demonstrateStreamPipeline();
          }, 2000);
        }, 3000);
      }, 2000);
    }, 3000);
  })();
}

// Export classes for use in other modules
module.exports = {
  LineUppercaseTransform,
  JSONProcessorTransform,
  CSVToJSONTransform,
  AggregationTransform
};