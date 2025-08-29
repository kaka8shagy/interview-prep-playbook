/**
 * File: practical-applications.js
 * Description: Practical generator applications including state machines, tree traversal, and async flow patterns
 * 
 * Learning objectives:
 * - Implement state machines using generator functions
 * - Master tree and graph traversal algorithms with generators
 * - Understand async generators and async iteration patterns
 * - Build real-world data processing pipelines
 * 
 * This file consolidates: state-machines.js, tree-traversal.js, async-flow.js, async-generators.js
 */

console.log('=== Practical Generator Applications ===\n');

// ============================================================================
// PART 1: STATE MACHINES WITH GENERATORS
// ============================================================================

console.log('--- State Machines with Generators ---');

/**
 * STATE MACHINES: Perfect Use Case for Generators
 * 
 * State machines are systems that:
 * 1. Have a finite set of states
 * 2. Transition between states based on inputs
 * 3. Maintain current state and history
 * 4. Execute actions during state transitions
 * 
 * Generators are ideal for state machines because:
 * - yield pauses execution at each state
 * - Bidirectional communication handles state transitions
 * - Generator state naturally preserves machine state
 */

function demonstrateStateMachines() {
  // Example 1: Simple Traffic Light State Machine
  function* trafficLightMachine() {
    console.log('  Traffic light system starting...');
    
    while (true) {
      // RED state
      console.log('  🔴 RED: Stop (30s)');
      const fromRed = yield 'RED';
      
      if (fromRed === 'emergency') {
        console.log('  🚨 Emergency override!');
        continue; // Stay in RED for emergency
      }
      
      // GREEN state  
      console.log('  🟢 GREEN: Go (45s)');
      const fromGreen = yield 'GREEN';
      
      if (fromGreen === 'emergency') {
        console.log('  🚨 Emergency override!');
        // Skip to RED for emergency
        continue;
      }
      
      // YELLOW state
      console.log('  🟡 YELLOW: Caution (5s)');
      const fromYellow = yield 'YELLOW';
      
      if (fromYellow === 'emergency') {
        console.log('  🚨 Emergency override!');
        continue;
      }
      
      // Loop back to RED
    }
  }
  
  console.log('Traffic Light State Machine:');
  const trafficLight = trafficLightMachine();
  
  // Normal operation cycle
  console.log('Normal operation:');
  console.log('  Current state:', trafficLight.next().value);
  console.log('  Current state:', trafficLight.next().value);  
  console.log('  Current state:', trafficLight.next().value);
  console.log('  Current state:', trafficLight.next().value);
  
  // Emergency intervention
  console.log('\nEmergency intervention:');
  console.log('  Current state:', trafficLight.next('emergency').value);
  console.log('  Current state:', trafficLight.next().value);
  
  // Example 2: Advanced User Authentication State Machine
  function* authenticationMachine(initialUser = null) {
    let user = initialUser;
    let attempts = 0;
    const maxAttempts = 3;
    let lockoutTime = null;
    
    console.log('  Authentication system initialized');
    
    while (true) {
      // Check if account is locked
      if (lockoutTime && Date.now() < lockoutTime) {
        const timeLeft = Math.ceil((lockoutTime - Date.now()) / 1000);
        const action = yield { state: 'LOCKED', timeLeft, message: `Account locked for ${timeLeft}s` };
        
        if (action?.type === 'unlock' && action?.adminKey === 'admin123') {
          console.log('  Admin unlock performed');
          lockoutTime = null;
          attempts = 0;
        }
        continue;
      }
      
      if (!user) {
        // UNAUTHENTICATED state
        const action = yield { state: 'UNAUTHENTICATED', message: 'Please log in' };
        
        if (action?.type === 'login') {
          console.log(`  Login attempt for user: ${action.username}`);
          
          // Simulate authentication check
          if (action.username === 'admin' && action.password === 'secret') {
            user = { username: action.username, role: 'admin' };
            attempts = 0;
            console.log('  ✅ Login successful');
          } else {
            attempts++;
            console.log(`  ❌ Login failed (attempt ${attempts}/${maxAttempts})`);
            
            if (attempts >= maxAttempts) {
              lockoutTime = Date.now() + 30000; // 30 second lockout
              console.log('  🔒 Account locked due to too many attempts');
            }
          }
        }
      } else {
        // AUTHENTICATED state
        const action = yield { 
          state: 'AUTHENTICATED', 
          user: user.username, 
          role: user.role,
          message: `Welcome ${user.username}` 
        };
        
        if (action?.type === 'logout') {
          console.log(`  User ${user.username} logged out`);
          user = null;
        } else if (action?.type === 'changePassword') {
          console.log('  Password change requested');
          // Handle password change logic
        }
      }
    }
  }
  
  console.log('\nAuthentication State Machine:');
  const authMachine = authenticationMachine();
  
  // Demonstrate the authentication flow
  let authState = authMachine.next();
  console.log('1.', authState.value);
  
  // Failed login attempts
  authState = authMachine.next({ type: 'login', username: 'admin', password: 'wrong' });
  console.log('2.', authState.value);
  
  authState = authMachine.next({ type: 'login', username: 'admin', password: 'wrong' });
  console.log('3.', authState.value);
  
  authState = authMachine.next({ type: 'login', username: 'admin', password: 'wrong' });
  console.log('4.', authState.value);
  
  // Account should be locked now
  authState = authMachine.next({ type: 'login', username: 'admin', password: 'secret' });
  console.log('5.', authState.value);
  
  // Admin unlock
  authState = authMachine.next({ type: 'unlock', adminKey: 'admin123' });
  console.log('6.', authState.value);
  
  // Successful login
  authState = authMachine.next({ type: 'login', username: 'admin', password: 'secret' });
  console.log('7.', authState.value);
}

demonstrateStateMachines();

// ============================================================================
// PART 2: TREE AND GRAPH TRAVERSAL
// ============================================================================

function demonstrateTreeTraversal() {
  console.log('\n--- Tree and Graph Traversal ---');
  
  /**
   * TREE TRAVERSAL: Natural Fit for Generators
   * 
   * Tree traversal algorithms benefit from generators because:
   * 1. Lazy evaluation - process nodes as needed
   * 2. Memory efficiency - no need to store entire traversal
   * 3. Pausable iteration - can stop/resume traversal
   * 4. Clean recursive patterns with yield*
   */
  
  // Define a sample tree structure
  class TreeNode {
    constructor(value, children = []) {
      this.value = value;
      this.children = children;
    }
    
    addChild(node) {
      this.children.push(node);
      return this;
    }
  }
  
  // Build a sample tree
  const tree = new TreeNode('A')
    .addChild(new TreeNode('B')
      .addChild(new TreeNode('D'))
      .addChild(new TreeNode('E')))
    .addChild(new TreeNode('C')
      .addChild(new TreeNode('F')
        .addChild(new TreeNode('H'))
        .addChild(new TreeNode('I')))
      .addChild(new TreeNode('G')));
  
  console.log('Sample tree structure:');
  console.log('       A');
  console.log('      / \\');
  console.log('     B   C');  
  console.log('    / \\ / \\');
  console.log('   D  E F  G');
  console.log('       / \\');
  console.log('      H   I');
  
  // Depth-First Search (DFS) traversal
  function* depthFirstTraversal(node, visited = new Set()) {
    if (!node || visited.has(node)) return;
    
    // Visit current node
    visited.add(node);
    console.log(`  Visiting: ${node.value}`);
    yield node.value;
    
    // Recursively visit children using yield* delegation
    for (const child of node.children) {
      yield* depthFirstTraversal(child, visited);
    }
  }
  
  // Breadth-First Search (BFS) traversal  
  function* breadthFirstTraversal(root) {
    if (!root) return;
    
    const queue = [root];
    const visited = new Set();
    
    while (queue.length > 0) {
      const node = queue.shift();
      
      if (visited.has(node)) continue;
      visited.add(node);
      
      console.log(`  Visiting: ${node.value}`);
      yield node.value;
      
      // Add children to queue for next level
      queue.push(...node.children);
    }
  }
  
  // Path finding with generators
  function* findAllPaths(node, target, currentPath = [], visited = new Set()) {
    if (visited.has(node)) return;
    
    const newPath = [...currentPath, node.value];
    
    if (node.value === target) {
      // Found target - yield the complete path
      yield newPath;
      return;
    }
    
    visited.add(node);
    
    // Recursively search children
    for (const child of node.children) {
      yield* findAllPaths(child, target, newPath, new Set(visited));
    }
  }
  
  console.log('\nDepth-First Traversal:');
  const dfsResult = [...depthFirstTraversal(tree)];
  console.log('  Order:', dfsResult.join(' → '));
  
  console.log('\nBreadth-First Traversal:');
  const bfsResult = [...breadthFirstTraversal(tree)];
  console.log('  Order:', bfsResult.join(' → '));
  
  console.log('\nFind all paths to node "I":');
  for (const path of findAllPaths(tree, 'I')) {
    console.log('  Path:', path.join(' → '));
  }
  
  // Advanced: Directory tree traversal simulation
  function* traverseFileSystem(directory, maxDepth = Infinity, currentDepth = 0) {
    /**
     * Simulates file system traversal with configurable depth limiting
     * This pattern is useful for real file system operations
     */
    
    if (currentDepth > maxDepth) return;
    
    // Simulate directory structure
    const fileSystem = {
      '/': {
        type: 'directory',
        children: {
          'home': {
            type: 'directory', 
            children: {
              'user': {
                type: 'directory',
                children: {
                  'documents': { type: 'directory', children: {} },
                  'photos': { type: 'directory', children: {} },
                  'config.json': { type: 'file', size: 1024 }
                }
              }
            }
          },
          'var': {
            type: 'directory',
            children: {
              'log': { type: 'directory', children: {} },
              'tmp': { type: 'directory', children: {} }
            }
          },
          'etc': { type: 'directory', children: {} }
        }
      }
    };
    
    function* traverseNode(path, node, depth) {
      if (depth > maxDepth) return;
      
      yield { path, type: node.type, size: node.size, depth };
      
      if (node.type === 'directory' && node.children) {
        for (const [name, child] of Object.entries(node.children)) {
          const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
          yield* traverseNode(childPath, child, depth + 1);
        }
      }
    }
    
    const root = fileSystem[directory];
    if (root) {
      yield* traverseNode(directory, root, currentDepth);
    }
  }
  
  console.log('\nFile system traversal (max depth 2):');
  for (const item of traverseFileSystem('/', 2)) {
    const indent = '  '.repeat(item.depth);
    const sizeInfo = item.size ? ` (${item.size} bytes)` : '';
    console.log(`${indent}${item.path} [${item.type}]${sizeInfo}`);
  }
}

demonstrateTreeTraversal();

// ============================================================================
// PART 3: ASYNC GENERATORS AND ASYNC ITERATION
// ============================================================================

function demonstrateAsyncGenerators() {
  console.log('\n--- Async Generators and Async Iteration ---');
  
  /**
   * ASYNC GENERATORS: Combining Async/Await with Generators
   * 
   * Async generators enable:
   * 1. Lazy evaluation of async operations
   * 2. Backpressure handling in data streams
   * 3. Memory-efficient processing of large async datasets
   * 4. Clean async iteration patterns
   * 
   * Syntax: async function* and for await...of
   */
  
  // Basic async generator example
  async function* asyncNumberGenerator(count) {
    console.log('  Starting async number generation...');
    
    for (let i = 0; i < count; i++) {
      // Simulate async operation (e.g., API call, database query)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`  Generated async number: ${i}`);
      yield i;
    }
    
    console.log('  Async generation complete');
  }
  
  // Consume async generator with for await...of
  async function consumeAsyncGenerator() {
    console.log('Consuming async generator:');
    
    // for await...of handles the async iteration protocol
    for await (const num of asyncNumberGenerator(3)) {
      console.log('  Received:', num);
    }
  }
  
  // Data streaming simulation with backpressure
  async function* streamLargeDataset(dataset, batchSize = 5) {
    /**
     * This pattern is crucial for processing large datasets without
     * overwhelming memory or downstream consumers
     */
    
    console.log(`  Streaming ${dataset.length} items in batches of ${batchSize}`);
    
    for (let i = 0; i < dataset.length; i += batchSize) {
      const batch = dataset.slice(i, i + batchSize);
      
      // Simulate async processing of batch
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log(`  Streaming batch ${Math.floor(i/batchSize) + 1}: ${batch.length} items`);
      
      // Yield the processed batch
      yield batch.map(item => ({ 
        original: item, 
        processed: item * 2,
        timestamp: Date.now() 
      }));
    }
  }
  
  // Advanced: Async pipeline with error handling
  async function* asyncTransformPipeline(source, transforms) {
    /**
     * Creates an async processing pipeline that applies
     * multiple transformations with error handling
     */
    
    try {
      for await (const item of source) {
        let result = item;
        
        // Apply each transformation in sequence
        for (const transform of transforms) {
          try {
            result = await transform(result);
          } catch (error) {
            console.log(`  Transform error for item ${item}:`, error.message);
            result = null; // Mark as failed
            break;
          }
        }
        
        if (result !== null) {
          yield result;
        }
      }
    } catch (error) {
      console.error('  Pipeline error:', error.message);
    }
  }
  
  // API polling simulation
  async function* pollAPI(url, interval = 1000, maxPolls = 5) {
    /**
     * Simulates polling an API endpoint at regular intervals
     * This pattern is useful for monitoring systems
     */
    
    let polls = 0;
    
    while (polls < maxPolls) {
      try {
        console.log(`  Polling ${url} (attempt ${polls + 1})`);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Simulate response with changing data
        const response = {
          timestamp: new Date().toISOString(),
          data: { value: Math.random() * 100, status: 'active' },
          poll: polls + 1
        };
        
        yield response;
        
        polls++;
        
        if (polls < maxPolls) {
          // Wait for next poll interval
          await new Promise(resolve => setTimeout(resolve, interval));
        }
        
      } catch (error) {
        console.error(`  Polling error: ${error.message}`);
        yield { error: error.message, poll: polls + 1 };
        polls++;
      }
    }
    
    console.log('  Polling complete');
  }
  
  // Run async generator demonstrations
  async function runAsyncDemos() {
    // Demo 1: Basic async generator
    await consumeAsyncGenerator();
    
    // Demo 2: Data streaming
    console.log('\nData streaming with backpressure:');
    const largeDataset = Array.from({length: 12}, (_, i) => i + 1);
    
    for await (const batch of streamLargeDataset(largeDataset, 4)) {
      console.log('  Processing batch:', batch.map(item => `${item.original}→${item.processed}`));
    }
    
    // Demo 3: Transform pipeline
    console.log('\nAsync transform pipeline:');
    
    const sourceData = async function*() {
      for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        yield i;
      }
    };
    
    const transforms = [
      async (x) => {
        await new Promise(resolve => setTimeout(resolve, 30));
        return x * 2;
      },
      async (x) => {
        await new Promise(resolve => setTimeout(resolve, 20));
        if (x === 6) throw new Error('Simulated error'); // Cause error for input 3*2=6
        return x + 10;
      }
    ];
    
    for await (const result of asyncTransformPipeline(sourceData(), transforms)) {
      console.log('  Pipeline result:', result);
    }
    
    // Demo 4: API polling
    console.log('\nAPI polling simulation:');
    for await (const response of pollAPI('https://api.example.com/status', 200, 3)) {
      if (response.error) {
        console.log('  Error response:', response);
      } else {
        console.log('  API response:', { 
          value: response.data.value.toFixed(2), 
          poll: response.poll 
        });
      }
    }
  }
  
  // Execute async demos
  return runAsyncDemos();
}

// ============================================================================
// PART 4: REAL-WORLD DATA PROCESSING PIPELINES
// ============================================================================

function demonstrateDataPipelines() {
  console.log('\n--- Real-World Data Processing Pipelines ---');
  
  /**
   * DATA PROCESSING: Where Generators Shine
   * 
   * Real-world scenarios where generators provide significant benefits:
   * 1. ETL (Extract, Transform, Load) operations
   * 2. Log file processing
   * 3. CSV/JSON data processing
   * 4. Stream processing and aggregation
   */
  
  // Simulated log entry generator
  function* generateLogEntries(count) {
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const services = ['auth', 'api', 'db', 'cache'];
    
    for (let i = 0; i < count; i++) {
      const entry = {
        timestamp: new Date(Date.now() - (count - i) * 1000),
        level: levels[Math.floor(Math.random() * levels.length)],
        service: services[Math.floor(Math.random() * services.length)],
        message: `Log entry ${i + 1}`,
        userId: Math.floor(Math.random() * 1000)
      };
      
      yield entry;
    }
  }
  
  // Log processing pipeline
  function* processLogs(logStream) {
    let processedCount = 0;
    const startTime = Date.now();
    
    for (const logEntry of logStream) {
      processedCount++;
      
      // Transform log entry
      const processed = {
        ...logEntry,
        processed: true,
        processingTime: Date.now(),
        id: processedCount
      };
      
      // Add derived fields
      processed.isError = logEntry.level === 'ERROR';
      processed.hourOfDay = logEntry.timestamp.getHours();
      
      yield processed;
      
      // Show progress occasionally
      if (processedCount % 100 === 0) {
        const elapsed = Date.now() - startTime;
        console.log(`  Processed ${processedCount} logs in ${elapsed}ms`);
      }
    }
    
    console.log(`  Log processing complete: ${processedCount} entries`);
  }
  
  // Aggregation generator
  function* aggregateLogs(logStream, windowSize = 10) {
    let window = [];
    let windowCount = 0;
    
    for (const logEntry of logStream) {
      window.push(logEntry);
      
      if (window.length >= windowSize) {
        windowCount++;
        
        // Calculate aggregations for this window
        const aggregation = {
          windowId: windowCount,
          count: window.length,
          errorCount: window.filter(log => log.isError).length,
          services: [...new Set(window.map(log => log.service))],
          timeRange: {
            start: window[0].timestamp,
            end: window[window.length - 1].timestamp
          },
          avgProcessingTime: window.reduce((sum, log) => sum + (log.processingTime - log.timestamp.getTime()), 0) / window.length
        };
        
        yield aggregation;
        window = []; // Reset window
      }
    }
    
    // Handle remaining entries in partial window
    if (window.length > 0) {
      windowCount++;
      yield {
        windowId: windowCount,
        count: window.length,
        errorCount: window.filter(log => log.isError).length,
        services: [...new Set(window.map(log => log.service))],
        partial: true
      };
    }
  }
  
  // CSV-like data processing
  function* processCSVData(csvLines) {
    let headerProcessed = false;
    let headers = [];
    let rowCount = 0;
    
    for (const line of csvLines) {
      if (!headerProcessed) {
        headers = line.split(',').map(h => h.trim());
        headerProcessed = true;
        console.log('  CSV Headers:', headers);
        continue;
      }
      
      const values = line.split(',').map(v => v.trim());
      
      // Convert to object
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      
      rowCount++;
      record._rowNumber = rowCount;
      
      yield record;
    }
    
    console.log(`  Processed ${rowCount} CSV rows`);
  }
  
  // Demonstrate the pipelines
  console.log('Data processing pipeline demonstration:');
  
  // Generate sample log data
  const logs = generateLogEntries(25);
  const processedLogs = processLogs(logs);
  const aggregatedLogs = aggregateLogs(processedLogs, 5);
  
  console.log('\nLog aggregation results:');
  for (const aggregation of aggregatedLogs) {
    console.log(`  Window ${aggregation.windowId}: ${aggregation.count} logs, ${aggregation.errorCount} errors, services: [${aggregation.services.join(', ')}]${aggregation.partial ? ' (partial)' : ''}`);
  }
  
  // CSV processing example
  console.log('\nCSV processing:');
  const csvData = [
    'name,age,city',
    'Alice,25,New York',
    'Bob,30,San Francisco', 
    'Charlie,35,Chicago',
    'Diana,28,Boston'
  ];
  
  const csvRecords = [...processCSVData(csvData)];
  console.log('  Sample records:');
  csvRecords.slice(0, 2).forEach(record => {
    console.log('   ', record);
  });
}

demonstrateDataPipelines();

// Execute async demonstrations
demonstrateAsyncGenerators().then(() => {
  /**
   * SUMMARY OF PRACTICAL APPLICATIONS:
   * 
   * 1. State Machines:
   *    - Natural fit for generator pause/resume behavior
   *    - Clean state transition logic with bidirectional communication
   *    - Maintains state between transitions automatically
   * 
   * 2. Tree/Graph Traversal:
   *    - Lazy evaluation prevents memory overflow on large structures
   *    - yield* enables elegant recursive patterns
   *    - Pausable iteration allows for complex traversal logic
   * 
   * 3. Async Generators:
   *    - Combine benefits of generators with async operations
   *    - Perfect for streaming data processing
   *    - Handle backpressure naturally with for await...of
   * 
   * 4. Data Processing Pipelines:
   *    - Memory-efficient processing of large datasets
   *    - Composable pipeline stages with generators
   *    - Real-time processing without buffering entire datasets
   * 
   * Key Benefits:
   * - Memory efficiency through lazy evaluation
   * - Natural pause/resume capabilities  
   * - Clean composition and reusability
   * - Excellent for streaming and real-time processing
   * 
   * Production Use Cases:
   * - ETL data processing pipelines
   * - State management in complex UIs
   * - API response streaming
   * - Log processing and monitoring
   * - Tree/graph algorithm implementations
   */
  
  console.log('\nPractical applications demonstration complete!');
  console.log('Next: See interview-problems.js for common generator interview questions');
});

/**
 * Note: This file demonstrates async operations that complete after the main execution.
 * In a real Node.js environment, you might need to handle the async completion appropriately.
 */