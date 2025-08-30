/**
 * File: file-processing.js
 * Description: Large file processing with streams for memory-efficient operations
 * 
 * Learning objectives:
 * - Process large files without loading into memory
 * - Implement line-by-line processing for log analysis
 * - Handle different file formats and encodings
 * - Master backpressure in file I/O operations
 * - Build scalable file processing pipelines
 * 
 * Key concepts covered:
 * - fs.createReadStream() and fs.createWriteStream()
 * - Line-by-line processing with partial line handling
 * - File encoding and character boundary issues
 * - Progress tracking and performance monitoring
 * - Error handling and file cleanup
 */

const fs = require('fs');
const path = require('path');
const { Transform, pipeline } = require('stream');
const { promisify } = require('util');
const readline = require('readline');

const pipelineAsync = promisify(pipeline);

/**
 * Example 1: Large Log File Processor
 * 
 * This class processes large log files line by line, extracting specific patterns
 * and generating summaries. Common interview question for backend positions.
 */
class LogFileProcessor {
  constructor(inputPath, outputPath, options = {}) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.options = {
      encoding: 'utf8',
      highWaterMark: 64 * 1024, // 64KB buffer
      ...options
    };
    
    this.stats = {
      linesProcessed: 0,
      linesMatched: 0,
      bytesProcessed: 0,
      errors: 0,
      startTime: null,
      patterns: new Map()
    };
    
    // Default patterns to extract (can be customized)
    this.patterns = {
      error: /ERROR|error/,
      warning: /WARN|warning/i,
      ip: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
      timestamp: /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/,
      httpStatus: /\s(2\d{2}|3\d{2}|4\d{2}|5\d{2})\s/
    };
  }

  async process() {
    this.stats.startTime = Date.now();
    
    console.log(`Starting log file processing: ${this.inputPath}`);
    console.log(`Output will be written to: ${this.outputPath}`);
    
    try {
      // Create read stream for input file
      const readStream = fs.createReadStream(this.inputPath, {
        encoding: this.options.encoding,
        highWaterMark: this.options.highWaterMark
      });
      
      // Create write stream for output
      const writeStream = fs.createWriteStream(this.outputPath, {
        encoding: this.options.encoding
      });
      
      // Create line processor transform
      const lineProcessor = this.createLineProcessor();
      
      // Set up progress monitoring
      const progressMonitor = this.createProgressMonitor();
      
      // Build processing pipeline
      await pipelineAsync(
        readStream,
        lineProcessor,
        progressMonitor,
        writeStream
      );
      
      // Write final summary
      await this.writeSummary();
      
      const duration = Date.now() - this.stats.startTime;
      console.log(`\nProcessing completed in ${duration}ms`);
      console.log(`Lines processed: ${this.stats.linesProcessed}`);
      console.log(`Lines matched: ${this.stats.linesMatched}`);
      console.log(`Bytes processed: ${this.stats.bytesProcessed}`);
      console.log(`Processing rate: ${(this.stats.linesProcessed / (duration / 1000)).toFixed(2)} lines/sec`);
      
    } catch (error) {
      console.error('Processing failed:', error);
      throw error;
    }
  }

  createLineProcessor() {
    let buffer = '';
    
    return new Transform({
      encoding: this.options.encoding,
      
      transform(chunk, encoding, callback) {
        // Add chunk to buffer and split into lines
        const data = buffer + chunk.toString();
        const lines = data.split('\n');
        
        // Keep the last line in buffer (might be partial)
        buffer = lines.pop() || '';
        
        // Process complete lines
        for (const line of lines) {
          if (line.trim()) {
            const processed = this.processLine(line);
            if (processed) {
              this.push(processed + '\n');
            }
          }
        }
        
        callback();
      },
      
      flush(callback) {
        // Process any remaining line in buffer
        if (buffer.trim()) {
          const processed = this.processLine(buffer);
          if (processed) {
            this.push(processed + '\n');
          }
        }
        callback();
      }
    }.bind(this));
  }

  processLine(line) {
    this.stats.linesProcessed++;
    this.stats.bytesProcessed += Buffer.byteLength(line, 'utf8');
    
    try {
      // Extract patterns from the line
      const matches = {};
      let hasMatches = false;
      
      for (const [patternName, pattern] of Object.entries(this.patterns)) {
        const match = line.match(pattern);
        if (match) {
          matches[patternName] = match[0];
          hasMatches = true;
          
          // Update pattern statistics
          const count = this.stats.patterns.get(patternName) || 0;
          this.stats.patterns.set(patternName, count + 1);
        }
      }
      
      // If line matches our criteria, format it for output
      if (hasMatches) {
        this.stats.linesMatched++;
        
        const output = {
          lineNumber: this.stats.linesProcessed,
          originalLine: line,
          matches: matches,
          timestamp: new Date().toISOString()
        };
        
        return JSON.stringify(output);
      }
      
    } catch (error) {
      this.stats.errors++;
      console.error(`Error processing line ${this.stats.linesProcessed}: ${error.message}`);
    }
    
    return null; // Line doesn't match criteria
  }

  createProgressMonitor() {
    let lastReport = 0;
    const reportInterval = 10000; // Report every 10k lines
    
    return new Transform({
      transform(chunk, encoding, callback) {
        // Pass through data unchanged
        this.push(chunk);
        
        // Report progress periodically
        if (this.stats.linesProcessed - lastReport >= reportInterval) {
          const elapsed = Date.now() - this.stats.startTime;
          const rate = (this.stats.linesProcessed / (elapsed / 1000)).toFixed(2);
          
          console.log(`Progress: ${this.stats.linesProcessed} lines processed (${rate} lines/sec)`);
          lastReport = this.stats.linesProcessed;
        }
        
        callback();
      }
    }.bind(this));
  }

  async writeSummary() {
    const summaryPath = this.outputPath.replace('.json', '_summary.json');
    
    const summary = {
      processingStats: this.stats,
      patternCounts: Object.fromEntries(this.stats.patterns),
      performance: {
        duration: Date.now() - this.stats.startTime,
        linesPerSecond: this.stats.linesProcessed / ((Date.now() - this.stats.startTime) / 1000),
        bytesPerSecond: this.stats.bytesProcessed / ((Date.now() - this.stats.startTime) / 1000)
      }
    };
    
    await fs.promises.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`Summary written to: ${summaryPath}`);
  }
}

/**
 * Example 2: CSV File Splitter
 * 
 * Splits large CSV files into smaller chunks while preserving headers.
 * Useful for processing large datasets that exceed memory limits.
 */
class CSVFileSplitter {
  constructor(inputPath, outputDir, options = {}) {
    this.inputPath = inputPath;
    this.outputDir = outputDir;
    this.chunkSize = options.chunkSize || 10000; // Lines per chunk
    this.preserveHeaders = options.preserveHeaders !== false;
    
    this.stats = {
      totalLines: 0,
      chunksCreated: 0,
      currentChunk: 1,
      currentChunkLines: 0,
      headers: null,
      startTime: Date.now()
    };
  }

  async split() {
    console.log(`Splitting CSV file: ${this.inputPath}`);
    console.log(`Chunk size: ${this.chunkSize} lines`);
    console.log(`Output directory: ${this.outputDir}`);
    
    // Ensure output directory exists
    await fs.promises.mkdir(this.outputDir, { recursive: true });
    
    // Create read stream
    const readStream = fs.createReadStream(this.inputPath, { encoding: 'utf8' });
    
    // Process file line by line
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity // Handle Windows line endings
    });
    
    let currentWriter = null;
    
    try {
      for await (const line of rl) {
        await this.processLine(line, () => {
          // Create new chunk writer when needed
          currentWriter = this.createChunkWriter();
          return currentWriter;
        });
      }
      
      // Close final writer
      if (currentWriter) {
        currentWriter.end();
      }
      
      const duration = Date.now() - this.stats.startTime;
      console.log(`\nSplitting completed in ${duration}ms`);
      console.log(`Total lines: ${this.stats.totalLines}`);
      console.log(`Chunks created: ${this.stats.chunksCreated}`);
      console.log(`Average lines per second: ${(this.stats.totalLines / (duration / 1000)).toFixed(2)}`);
      
    } catch (error) {
      console.error('Splitting failed:', error);
      if (currentWriter) {
        currentWriter.destroy();
      }
      throw error;
    }
  }

  async processLine(line, getWriter) {
    this.stats.totalLines++;
    
    // First line is headers (if preserveHeaders is true)
    if (this.stats.totalLines === 1 && this.preserveHeaders) {
      this.stats.headers = line;
    }
    
    // Check if we need a new chunk
    if (this.stats.currentChunkLines === 0) {
      const writer = getWriter();
      
      // Write headers to new chunk (except for first chunk)
      if (this.preserveHeaders && this.stats.headers && this.stats.currentChunk > 1) {
        await this.writeLineToStream(writer, this.stats.headers);
      }
    }
    
    // Write current line
    const writer = getWriter();
    await this.writeLineToStream(writer, line);
    
    this.stats.currentChunkLines++;
    
    // Check if chunk is full
    if (this.stats.currentChunkLines >= this.chunkSize) {
      writer.end();
      this.startNextChunk();
    }
  }

  createChunkWriter() {
    this.stats.chunksCreated++;
    
    const filename = `chunk_${this.stats.currentChunk.toString().padStart(4, '0')}.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    console.log(`Creating chunk ${this.stats.currentChunk}: ${filename}`);
    
    return fs.createWriteStream(filepath, { encoding: 'utf8' });
  }

  startNextChunk() {
    this.stats.currentChunk++;
    this.stats.currentChunkLines = 0;
  }

  async writeLineToStream(writer, line) {
    return new Promise((resolve, reject) => {
      const success = writer.write(line + '\n', 'utf8');
      
      if (success) {
        resolve();
      } else {
        // Handle backpressure
        writer.once('drain', resolve);
        writer.once('error', reject);
      }
    });
  }
}

/**
 * Example 3: File Format Converter
 * 
 * Converts between different file formats (CSV to JSON, JSON to CSV, etc.)
 * while handling large files efficiently through streaming.
 */
class FileFormatConverter {
  constructor(inputPath, outputPath, options = {}) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.inputFormat = options.inputFormat || this.detectFormat(inputPath);
    this.outputFormat = options.outputFormat || this.detectFormat(outputPath);
    
    this.stats = {
      recordsProcessed: 0,
      bytesRead: 0,
      bytesWritten: 0,
      errors: 0,
      startTime: null
    };
  }

  detectFormat(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    switch (ext) {
      case '.csv': return 'csv';
      case '.json': return 'json';
      case '.txt': return 'text';
      default: return 'unknown';
    }
  }

  async convert() {
    this.stats.startTime = Date.now();
    
    console.log(`Converting ${this.inputFormat} to ${this.outputFormat}`);
    console.log(`Input: ${this.inputPath}`);
    console.log(`Output: ${this.outputPath}`);
    
    try {
      // Create appropriate converter based on formats
      const converter = this.createConverter();
      
      // Build processing pipeline
      const readStream = fs.createReadStream(this.inputPath, { encoding: 'utf8' });
      const writeStream = fs.createWriteStream(this.outputPath, { encoding: 'utf8' });
      
      await pipelineAsync(
        readStream,
        converter,
        writeStream
      );
      
      const duration = Date.now() - this.stats.startTime;
      console.log(`\nConversion completed in ${duration}ms`);
      console.log(`Records processed: ${this.stats.recordsProcessed}`);
      console.log(`Input bytes: ${this.stats.bytesRead}`);
      console.log(`Output bytes: ${this.stats.bytesWritten}`);
      
    } catch (error) {
      console.error('Conversion failed:', error);
      throw error;
    }
  }

  createConverter() {
    if (this.inputFormat === 'csv' && this.outputFormat === 'json') {
      return this.createCSVToJSONConverter();
    } else if (this.inputFormat === 'json' && this.outputFormat === 'csv') {
      return this.createJSONToCSVConverter();
    } else {
      throw new Error(`Conversion from ${this.inputFormat} to ${this.outputFormat} not supported`);
    }
  }

  createCSVToJSONConverter() {
    let headers = null;
    let buffer = '';
    let isFirstChunk = true;
    
    return new Transform({
      transform(chunk, encoding, callback) {
        this.stats.bytesRead += chunk.length;
        
        const data = buffer + chunk.toString();
        const lines = data.split('\n');
        buffer = lines.pop() || '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          try {
            if (!headers) {
              // First line contains headers
              headers = this.parseCSVLine(line);
              if (isFirstChunk) {
                this.push('[\n'); // Start JSON array
                isFirstChunk = false;
              }
              continue;
            }
            
            const values = this.parseCSVLine(line);
            const record = {};
            
            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });
            
            const json = JSON.stringify(record);
            const prefix = this.stats.recordsProcessed > 0 ? ',\n' : '';
            this.push(prefix + json);
            
            this.stats.recordsProcessed++;
            this.stats.bytesWritten += json.length;
            
          } catch (error) {
            this.stats.errors++;
            console.error(`Error processing line ${this.stats.recordsProcessed + 1}:`, error);
          }
        }
        
        callback();
      }.bind(this),
      
      flush(callback) {
        // Process remaining buffer
        if (buffer.trim() && headers) {
          try {
            const values = this.parseCSVLine(buffer);
            const record = {};
            
            headers.forEach((header, index) => {
              record[header] = values[index] || '';
            });
            
            const json = JSON.stringify(record);
            const prefix = this.stats.recordsProcessed > 0 ? ',\n' : '';
            this.push(prefix + json);
            
            this.stats.recordsProcessed++;
          } catch (error) {
            this.stats.errors++;
            console.error('Error processing final line:', error);
          }
        }
        
        this.push('\n]'); // Close JSON array
        callback();
      }.bind(this)
    }.bind(this));
  }

  createJSONToCSVConverter() {
    let headers = null;
    let isFirstRecord = true;
    let buffer = '';
    
    return new Transform({
      transform(chunk, encoding, callback) {
        this.stats.bytesRead += chunk.length;
        
        const data = buffer + chunk.toString();
        
        // Try to extract complete JSON objects
        let objects;
        try {
          // Handle both JSON array format and newline-delimited JSON
          objects = this.extractJSONObjects(data);
          buffer = objects.remainder;
        } catch (error) {
          // If parsing fails, keep accumulating data
          buffer = data;
          callback();
          return;
        }
        
        for (const obj of objects.parsed) {
          try {
            if (!headers && obj && typeof obj === 'object') {
              // Extract headers from first object
              headers = Object.keys(obj);
              const headerLine = this.formatCSVLine(headers);
              this.push(headerLine + '\n');
              this.stats.bytesWritten += headerLine.length + 1;
            }
            
            if (headers && obj && typeof obj === 'object') {
              const values = headers.map(header => obj[header] || '');
              const csvLine = this.formatCSVLine(values);
              this.push(csvLine + '\n');
              
              this.stats.recordsProcessed++;
              this.stats.bytesWritten += csvLine.length + 1;
            }
            
          } catch (error) {
            this.stats.errors++;
            console.error(`Error processing record ${this.stats.recordsProcessed + 1}:`, error);
          }
        }
        
        callback();
      }.bind(this),
      
      flush(callback) {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const objects = this.extractJSONObjects(buffer + '}]'); // Try to close malformed JSON
            for (const obj of objects.parsed) {
              if (headers && obj && typeof obj === 'object') {
                const values = headers.map(header => obj[header] || '');
                const csvLine = this.formatCSVLine(values);
                this.push(csvLine + '\n');
                this.stats.recordsProcessed++;
              }
            }
          } catch (error) {
            console.error('Error processing final buffer:', error);
          }
        }
        
        callback();
      }.bind(this)
    }.bind(this));
  }

  // Helper methods for CSV parsing
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  formatCSVLine(values) {
    return values.map(value => {
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
  }

  extractJSONObjects(data) {
    const parsed = [];
    let remainder = data;
    
    try {
      // Try to parse as JSON array first
      const parsed_array = JSON.parse(data);
      if (Array.isArray(parsed_array)) {
        return { parsed: parsed_array, remainder: '' };
      }
    } catch (e) {
      // Fall back to line-by-line parsing
    }
    
    // Try newline-delimited JSON
    const lines = data.split('\n');
    remainder = lines.pop() || '';
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          parsed.push(obj);
        } catch (e) {
          // Skip malformed lines
        }
      }
    }
    
    return { parsed, remainder };
  }
}

/**
 * Demonstration Functions
 */

// Create sample log file for demonstration
async function createSampleLogFile(filepath, lineCount = 1000) {
  console.log(`Creating sample log file: ${filepath}`);
  
  const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1'];
  const statusCodes = [200, 404, 500, 302, 403];
  
  const writeStream = fs.createWriteStream(filepath);
  
  for (let i = 0; i < lineCount; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();
    const level = logLevels[Math.floor(Math.random() * logLevels.length)];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const message = `Request processed from ${ip} with status ${status}`;
    
    const logLine = `${timestamp} [${level}] ${message}\n`;
    writeStream.write(logLine);
  }
  
  writeStream.end();
  
  return new Promise((resolve) => {
    writeStream.on('finish', () => {
      console.log(`Sample log file created with ${lineCount} lines`);
      resolve();
    });
  });
}

// Create sample CSV file
async function createSampleCSVFile(filepath, recordCount = 1000) {
  console.log(`Creating sample CSV file: ${filepath}`);
  
  const writeStream = fs.createWriteStream(filepath);
  
  // Write headers
  writeStream.write('id,name,email,age,city\n');
  
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  
  for (let i = 1; i <= recordCount; i++) {
    const name = `User${i}`;
    const email = `user${i}@example.com`;
    const age = Math.floor(Math.random() * 50) + 20;
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    writeStream.write(`${i},"${name}",${email},${age},"${city}"\n`);
  }
  
  writeStream.end();
  
  return new Promise((resolve) => {
    writeStream.on('finish', () => {
      console.log(`Sample CSV file created with ${recordCount} records`);
      resolve();
    });
  });
}

// Demonstration functions
async function demonstrateLogProcessing() {
  console.log('\n=== Log File Processing Demo ===');
  
  const inputPath = path.join(__dirname, 'sample.log');
  const outputPath = path.join(__dirname, 'processed.json');
  
  // Create sample log file
  await createSampleLogFile(inputPath, 5000);
  
  // Process the log file
  const processor = new LogFileProcessor(inputPath, outputPath);
  await processor.process();
  
  // Clean up
  setTimeout(() => {
    fs.unlink(inputPath, () => {});
    fs.unlink(outputPath, () => {});
    fs.unlink(outputPath.replace('.json', '_summary.json'), () => {});
  }, 2000);
}

async function demonstrateCSVSplitting() {
  console.log('\n=== CSV File Splitting Demo ===');
  
  const inputPath = path.join(__dirname, 'large-data.csv');
  const outputDir = path.join(__dirname, 'csv-chunks');
  
  // Create sample CSV file
  await createSampleCSVFile(inputPath, 25000);
  
  // Split the CSV file
  const splitter = new CSVFileSplitter(inputPath, outputDir, { chunkSize: 5000 });
  await splitter.split();
  
  // Clean up
  setTimeout(async () => {
    try {
      fs.unlink(inputPath, () => {});
      const files = await fs.promises.readdir(outputDir);
      for (const file of files) {
        fs.unlink(path.join(outputDir, file), () => {});
      }
      fs.rmdir(outputDir, () => {});
    } catch (error) {
      // Ignore cleanup errors
    }
  }, 3000);
}

async function demonstrateFormatConversion() {
  console.log('\n=== File Format Conversion Demo ===');
  
  const csvPath = path.join(__dirname, 'input-data.csv');
  const jsonPath = path.join(__dirname, 'output-data.json');
  
  // Create sample CSV file
  await createSampleCSVFile(csvPath, 1000);
  
  // Convert CSV to JSON
  const converter = new FileFormatConverter(csvPath, jsonPath);
  await converter.convert();
  
  // Clean up
  setTimeout(() => {
    fs.unlink(csvPath, () => {});
    fs.unlink(jsonPath, () => {});
  }, 2000);
}

/**
 * Run demonstrations
 */
if (require.main === module) {
  (async () => {
    try {
      await demonstrateLogProcessing();
      
      setTimeout(async () => {
        await demonstrateCSVSplitting();
        
        setTimeout(async () => {
          await demonstrateFormatConversion();
        }, 4000);
      }, 4000);
      
    } catch (error) {
      console.error('Demonstration failed:', error);
    }
  })();
}

// Export classes for use in other modules
module.exports = {
  LogFileProcessor,
  CSVFileSplitter,
  FileFormatConverter
};