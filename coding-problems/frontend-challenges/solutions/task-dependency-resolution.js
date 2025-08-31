/**
 * File: task-dependency-resolution.js
 * Description: Advanced task dependency resolution system with topological sorting
 * 
 * Learning objectives:
 * - Understand topological sorting algorithms
 * - Implement dependency graphs and cycle detection
 * - Build concurrent execution with dependency constraints
 * - Handle complex real-world dependency scenarios
 * 
 * Time Complexity: O(V + E) where V is vertices (tasks) and E is edges (dependencies)
 * Space Complexity: O(V + E) for storing the dependency graph
 */

// =======================
// Approach 1: Basic Task Dependency Resolver
// =======================

/**
 * Basic dependency resolver using topological sort (Kahn's algorithm)
 * Ensures tasks execute only after their dependencies are satisfied
 * 
 * Mental model: Think of it like getting dressed - you must put on underwear
 * before pants, socks before shoes, etc. There's a natural order.
 */
class TaskDependencyResolver {
  constructor() {
    this.tasks = new Map(); // taskId -> task info
    this.dependencies = new Map(); // taskId -> Set of dependency taskIds
    this.dependents = new Map(); // taskId -> Set of dependent taskIds (reverse mapping)
    this.results = new Map(); // taskId -> execution result
    this.executionOrder = []; // Order in which tasks were executed
  }

  // Add a task to the system
  addTask(taskId, taskFn, description = '', dependencies = []) {
    if (this.tasks.has(taskId)) {
      throw new Error(`Task ${taskId} already exists`);
    }

    // Validate dependencies exist
    for (const depId of dependencies) {
      if (!this.tasks.has(depId)) {
        throw new Error(`Dependency ${depId} does not exist for task ${taskId}`);
      }
    }

    const task = {
      id: taskId,
      fn: taskFn,
      description,
      status: 'pending', // pending, running, completed, failed
      dependencies: new Set(dependencies),
      startTime: null,
      endTime: null,
      result: null,
      error: null
    };

    this.tasks.set(taskId, task);
    this.dependencies.set(taskId, new Set(dependencies));

    // Update reverse dependencies (dependents)
    if (!this.dependents.has(taskId)) {
      this.dependents.set(taskId, new Set());
    }

    for (const depId of dependencies) {
      if (!this.dependents.has(depId)) {
        this.dependents.set(depId, new Set());
      }
      this.dependents.get(depId).add(taskId);
    }

    return task;
  }

  // Check for circular dependencies using DFS
  detectCycles() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfsVisit = (taskId, path = []) => {
      if (recursionStack.has(taskId)) {
        // Found a cycle - extract it from the path
        const cycleStart = path.indexOf(taskId);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), taskId]);
        }
        return true;
      }

      if (visited.has(taskId)) {
        return false; // Already processed
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const dependencies = this.dependencies.get(taskId) || new Set();
      for (const depId of dependencies) {
        if (dfsVisit(depId, [...path, taskId])) {
          return true;
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    // Check all tasks for cycles
    for (const taskId of this.tasks.keys()) {
      if (!visited.has(taskId)) {
        dfsVisit(taskId);
      }
    }

    return cycles;
  }

  // Get topological order using Kahn's algorithm
  getTopologicalOrder() {
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      throw new Error(`Circular dependencies detected: ${cycles.map(cycle => cycle.join(' -> ')).join(', ')}`);
    }

    // Calculate in-degrees (number of dependencies)
    const inDegree = new Map();
    for (const taskId of this.tasks.keys()) {
      inDegree.set(taskId, this.dependencies.get(taskId).size);
    }

    // Queue for tasks with no dependencies
    const queue = [];
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(taskId);
      }
    }

    const topologicalOrder = [];

    // Process tasks in dependency order
    while (queue.length > 0) {
      const currentTaskId = queue.shift();
      topologicalOrder.push(currentTaskId);

      // Process all dependents of current task
      const dependents = this.dependents.get(currentTaskId) || new Set();
      for (const dependentId of dependents) {
        // Reduce in-degree of dependent
        inDegree.set(dependentId, inDegree.get(dependentId) - 1);

        // If dependent has no more dependencies, add to queue
        if (inDegree.get(dependentId) === 0) {
          queue.push(dependentId);
        }
      }
    }

    // Check if all tasks were included (no cycles)
    if (topologicalOrder.length !== this.tasks.size) {
      throw new Error('Unable to resolve all dependencies - possible circular dependency');
    }

    return topologicalOrder;
  }

  // Execute all tasks in dependency order (sequential)
  async executeSequential() {
    const order = this.getTopologicalOrder();
    
    console.log('Execution order:', order.join(' -> '));
    
    for (const taskId of order) {
      await this.executeTask(taskId);
    }

    return this.getExecutionSummary();
  }

  // Execute a single task
  async executeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    console.log(`Executing task: ${taskId} (${task.description})`);
    
    task.status = 'running';
    task.startTime = Date.now();

    try {
      // Pass dependency results to the task
      const dependencyResults = {};
      for (const depId of task.dependencies) {
        dependencyResults[depId] = this.results.get(depId);
      }

      const result = await task.fn(dependencyResults);
      
      task.status = 'completed';
      task.result = result;
      task.endTime = Date.now();
      
      this.results.set(taskId, result);
      this.executionOrder.push(taskId);

      console.log(`✓ Task ${taskId} completed in ${task.endTime - task.startTime}ms`);
      
      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error;
      task.endTime = Date.now();

      console.log(`✗ Task ${taskId} failed: ${error.message}`);
      
      throw error;
    }
  }

  // Get execution summary
  getExecutionSummary() {
    const tasks = Array.from(this.tasks.values());
    
    return {
      totalTasks: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      executionOrder: this.executionOrder,
      results: Object.fromEntries(this.results),
      totalDuration: this.executionOrder.length > 0 
        ? Math.max(...tasks.filter(t => t.endTime).map(t => t.endTime)) - 
          Math.min(...tasks.filter(t => t.startTime).map(t => t.startTime))
        : 0
    };
  }

  // Clear all tasks and results
  reset() {
    this.tasks.clear();
    this.dependencies.clear();
    this.dependents.clear();
    this.results.clear();
    this.executionOrder = [];
  }
}

// =======================
// Approach 2: Concurrent Task Dependency Resolver
// =======================

/**
 * Advanced resolver that executes independent tasks concurrently
 * while respecting dependency constraints
 */
class ConcurrentTaskDependencyResolver extends TaskDependencyResolver {
  constructor(maxConcurrency = Infinity) {
    super();
    this.maxConcurrency = maxConcurrency;
    this.runningTasks = new Set();
    this.completedTasks = new Set();
  }

  // Execute tasks concurrently while respecting dependencies
  async executeConcurrent() {
    const allTaskIds = Array.from(this.tasks.keys());
    
    // Track which tasks are ready to execute (dependencies satisfied)
    const getReadyTasks = () => {
      return allTaskIds.filter(taskId => {
        const task = this.tasks.get(taskId);
        
        // Skip if already running, completed, or failed
        if (this.runningTasks.has(taskId) || this.completedTasks.has(taskId) || task.status === 'failed') {
          return false;
        }

        // Check if all dependencies are completed
        const dependencies = this.dependencies.get(taskId) || new Set();
        return Array.from(dependencies).every(depId => this.completedTasks.has(depId));
      });
    };

    // Execute tasks until all are done or failed
    while (this.completedTasks.size < allTaskIds.length) {
      const readyTasks = getReadyTasks();
      
      // If no tasks ready and none running, we have a problem
      if (readyTasks.length === 0 && this.runningTasks.size === 0) {
        const pendingTasks = allTaskIds.filter(id => !this.completedTasks.has(id));
        throw new Error(`Deadlock detected. Pending tasks: ${pendingTasks.join(', ')}`);
      }

      // Start as many ready tasks as concurrency allows
      const tasksToStart = readyTasks.slice(0, this.maxConcurrency - this.runningTasks.size);
      
      // Start tasks concurrently
      const promises = tasksToStart.map(async (taskId) => {
        this.runningTasks.add(taskId);
        
        try {
          await this.executeTask(taskId);
          this.completedTasks.add(taskId);
        } catch (error) {
          // Task failed, but we continue with others
          console.log(`Task ${taskId} failed, continuing with remaining tasks`);
          this.completedTasks.add(taskId); // Mark as done to avoid deadlock
        } finally {
          this.runningTasks.delete(taskId);
        }
      });

      // Wait for at least one task to complete before checking for more ready tasks
      if (promises.length > 0) {
        await Promise.race(promises);
      }

      // Small delay to prevent tight loop if no tasks are ready
      if (readyTasks.length === 0 && this.runningTasks.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return this.getExecutionSummary();
  }

  // Enhanced summary with concurrency info
  getExecutionSummary() {
    const baseSummary = super.getExecutionSummary();
    return {
      ...baseSummary,
      maxConcurrency: this.maxConcurrency,
      concurrentExecution: true
    };
  }

  // Reset with concurrent tracking
  reset() {
    super.reset();
    this.runningTasks.clear();
    this.completedTasks.clear();
  }
}

// =======================
// Approach 3: Priority-based Task Resolver
// =======================

/**
 * Task resolver with priority support and resource management
 * Tasks can have priorities and resource requirements
 */
class PriorityTaskDependencyResolver extends ConcurrentTaskDependencyResolver {
  constructor(maxConcurrency = Infinity, resources = {}) {
    super(maxConcurrency);
    this.resources = { ...resources }; // Available resources
    this.initialResources = { ...resources }; // For reset
    this.taskResources = new Map(); // taskId -> required resources
    this.taskPriorities = new Map(); // taskId -> priority (higher = more important)
  }

  // Add task with priority and resource requirements
  addTaskWithPriority(taskId, taskFn, description = '', dependencies = [], priority = 0, requiredResources = {}) {
    const task = this.addTask(taskId, taskFn, description, dependencies);
    
    this.taskPriorities.set(taskId, priority);
    this.taskResources.set(taskId, requiredResources);

    return task;
  }

  // Check if resources are available for a task
  canAllocateResources(taskId) {
    const required = this.taskResources.get(taskId) || {};
    
    for (const [resource, amount] of Object.entries(required)) {
      if ((this.resources[resource] || 0) < amount) {
        return false;
      }
    }
    
    return true;
  }

  // Allocate resources for a task
  allocateResources(taskId) {
    const required = this.taskResources.get(taskId) || {};
    
    for (const [resource, amount] of Object.entries(required)) {
      this.resources[resource] = (this.resources[resource] || 0) - amount;
    }
  }

  // Release resources after task completion
  releaseResources(taskId) {
    const required = this.taskResources.get(taskId) || {};
    
    for (const [resource, amount] of Object.entries(required)) {
      this.resources[resource] = (this.resources[resource] || 0) + amount;
    }
  }

  // Get ready tasks sorted by priority
  getReadyTasksByPriority() {
    const allTaskIds = Array.from(this.tasks.keys());
    
    return allTaskIds
      .filter(taskId => {
        const task = this.tasks.get(taskId);
        
        // Skip if already running, completed, or failed
        if (this.runningTasks.has(taskId) || this.completedTasks.has(taskId) || task.status === 'failed') {
          return false;
        }

        // Check dependencies
        const dependencies = this.dependencies.get(taskId) || new Set();
        const dependenciesSatisfied = Array.from(dependencies).every(depId => this.completedTasks.has(depId));
        
        // Check resources
        const resourcesAvailable = this.canAllocateResources(taskId);
        
        return dependenciesSatisfied && resourcesAvailable;
      })
      .sort((a, b) => (this.taskPriorities.get(b) || 0) - (this.taskPriorities.get(a) || 0));
  }

  // Execute task with resource management
  async executeTaskWithResources(taskId) {
    // Allocate resources before execution
    this.allocateResources(taskId);
    
    try {
      const result = await this.executeTask(taskId);
      return result;
    } finally {
      // Always release resources
      this.releaseResources(taskId);
    }
  }

  // Execute with priority and resource management
  async executeWithPriority() {
    const allTaskIds = Array.from(this.tasks.keys());
    
    while (this.completedTasks.size < allTaskIds.length) {
      const readyTasks = this.getReadyTasksByPriority();
      
      if (readyTasks.length === 0 && this.runningTasks.size === 0) {
        const pendingTasks = allTaskIds.filter(id => !this.completedTasks.has(id));
        throw new Error(`Deadlock or resource starvation. Pending tasks: ${pendingTasks.join(', ')}`);
      }

      // Start highest priority tasks first
      const tasksToStart = readyTasks.slice(0, this.maxConcurrency - this.runningTasks.size);
      
      const promises = tasksToStart.map(async (taskId) => {
        this.runningTasks.add(taskId);
        
        try {
          await this.executeTaskWithResources(taskId);
          this.completedTasks.add(taskId);
        } catch (error) {
          console.log(`Task ${taskId} failed: ${error.message}`);
          this.completedTasks.add(taskId);
        } finally {
          this.runningTasks.delete(taskId);
        }
      });

      if (promises.length > 0) {
        await Promise.race(promises);
      }

      if (readyTasks.length === 0 && this.runningTasks.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return this.getExecutionSummary();
  }

  // Get resource utilization info
  getResourceStatus() {
    return {
      available: { ...this.resources },
      initial: { ...this.initialResources },
      utilization: Object.fromEntries(
        Object.entries(this.initialResources).map(([resource, total]) => [
          resource,
          {
            used: total - (this.resources[resource] || 0),
            total,
            percentage: Math.round(((total - (this.resources[resource] || 0)) / total) * 100)
          }
        ])
      )
    };
  }

  // Reset with resource management
  reset() {
    super.reset();
    this.resources = { ...this.initialResources };
    this.taskResources.clear();
    this.taskPriorities.clear();
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== Task Dependency Resolution Examples ===\n');

// Example 1: Basic Sequential Execution
async function example1() {
  console.log('Example 1: Basic Sequential Execution');
  
  const resolver = new TaskDependencyResolver();
  
  // Add tasks with dependencies (build pipeline example)
  resolver.addTask('fetch_code', async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'Source code fetched';
  }, 'Fetch source code from repository');

  resolver.addTask('install_deps', async (deps) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'Dependencies installed';
  }, 'Install project dependencies', ['fetch_code']);

  resolver.addTask('compile', async (deps) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return 'Code compiled successfully';
  }, 'Compile source code', ['install_deps']);

  resolver.addTask('run_tests', async (deps) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return 'All tests passed';
  }, 'Run test suite', ['compile']);

  resolver.addTask('package', async (deps) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return 'Application packaged';
  }, 'Package application', ['run_tests']);

  try {
    const summary = await resolver.executeSequential();
    console.log('Summary:', summary);
  } catch (error) {
    console.log('Execution failed:', error.message);
  }
  
  console.log();
}

// Example 2: Concurrent Execution
async function example2() {
  console.log('Example 2: Concurrent Execution');
  
  const resolver = new ConcurrentTaskDependencyResolver(3); // Max 3 concurrent tasks
  
  // Parallel tasks in a web application build
  resolver.addTask('fetch_assets', async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return 'Static assets downloaded';
  }, 'Download static assets');

  resolver.addTask('fetch_data', async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return 'Initial data loaded';
  }, 'Load initial data');

  resolver.addTask('compile_js', async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return 'JavaScript compiled';
  }, 'Compile JavaScript');

  resolver.addTask('compile_css', async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'CSS compiled';
  }, 'Compile CSS');

  // Tasks that depend on multiple parallel tasks
  resolver.addTask('optimize_assets', async (deps) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'Assets optimized';
  }, 'Optimize compiled assets', ['compile_js', 'compile_css', 'fetch_assets']);

  resolver.addTask('generate_html', async (deps) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return 'HTML generated';
  }, 'Generate HTML pages', ['fetch_data', 'optimize_assets']);

  try {
    const summary = await resolver.executeConcurrent();
    console.log('Concurrent Summary:', summary);
  } catch (error) {
    console.log('Concurrent execution failed:', error.message);
  }
  
  console.log();
}

// Example 3: Priority and Resource Management
async function example3() {
  console.log('Example 3: Priority and Resource Management');
  
  // Available resources: CPU cores, memory GB, disk GB
  const resolver = new PriorityTaskDependencyResolver(2, {
    cpu: 4,
    memory: 8,
    disk: 100
  });
  
  // High priority critical tasks
  resolver.addTaskWithPriority('critical_backup', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'Critical data backed up';
  }, 'Critical data backup', [], 10, { cpu: 1, memory: 2, disk: 20 });

  resolver.addTaskWithPriority('user_auth', async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'User authenticated';
  }, 'User authentication', [], 9, { cpu: 1, memory: 1 });

  // Medium priority tasks
  resolver.addTaskWithPriority('data_process', async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return 'Data processed';
  }, 'Process user data', ['user_auth'], 5, { cpu: 2, memory: 3, disk: 10 });

  resolver.addTaskWithPriority('report_gen', async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return 'Report generated';
  }, 'Generate reports', ['data_process'], 5, { cpu: 1, memory: 2, disk: 5 });

  // Low priority cleanup tasks
  resolver.addTaskWithPriority('cleanup_temp', async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return 'Temp files cleaned';
  }, 'Clean temporary files', [], 1, { disk: 5 });

  resolver.addTaskWithPriority('cleanup_logs', async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return 'Logs cleaned';
  }, 'Clean old logs', ['cleanup_temp'], 1, { disk: 10 });

  try {
    console.log('Initial resources:', resolver.getResourceStatus());
    const summary = await resolver.executeWithPriority();
    console.log('Priority Summary:', summary);
    console.log('Final resources:', resolver.getResourceStatus());
  } catch (error) {
    console.log('Priority execution failed:', error.message);
  }
  
  console.log();
}

// Run examples
example1()
  .then(() => example2())
  .then(() => example3())
  .catch(console.error);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Build Pipeline Manager
 * Manages complex software build pipelines with dependencies
 */
class BuildPipelineManager {
  constructor(maxConcurrency = 4) {
    this.resolver = new ConcurrentTaskDependencyResolver(maxConcurrency);
    this.buildConfig = null;
  }

  // Configure build pipeline from config
  configurePipeline(config) {
    this.buildConfig = config;
    this.resolver.reset();

    // Add all build stages as tasks
    config.stages.forEach(stage => {
      this.resolver.addTask(
        stage.name,
        async (deps) => this.executeBuildStage(stage, deps),
        stage.description,
        stage.dependencies || []
      );
    });

    return this;
  }

  // Execute a build stage
  async executeBuildStage(stage, dependencyResults) {
    console.log(`Starting build stage: ${stage.name}`);
    
    const startTime = Date.now();
    
    try {
      // Simulate different build operations
      const operations = {
        'checkout': () => this.simulateCheckout(),
        'install': () => this.simulateInstall(),
        'build': () => this.simulateBuild(),
        'test': () => this.simulateTest(),
        'package': () => this.simulatePackage(),
        'deploy': () => this.simulateDeploy()
      };

      const operation = operations[stage.type] || (() => this.simulateGeneric(stage));
      const result = await operation();
      
      const duration = Date.now() - startTime;
      console.log(`✓ Build stage ${stage.name} completed in ${duration}ms`);
      
      return {
        stage: stage.name,
        success: true,
        duration,
        result,
        artifacts: stage.artifacts || []
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`✗ Build stage ${stage.name} failed after ${duration}ms: ${error.message}`);
      throw error;
    }
  }

  async simulateCheckout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'Source code checked out from repository';
  }

  async simulateInstall() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (Math.random() < 0.1) throw new Error('Dependency installation failed');
    return 'Dependencies installed successfully';
  }

  async simulateBuild() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (Math.random() < 0.05) throw new Error('Compilation error');
    return 'Application built successfully';
  }

  async simulateTest() {
    await new Promise(resolve => setTimeout(resolve, 4000));
    if (Math.random() < 0.15) throw new Error('Tests failed');
    return 'All tests passed';
  }

  async simulatePackage() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'Application packaged for deployment';
  }

  async simulateDeploy() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (Math.random() < 0.08) throw new Error('Deployment failed');
    return 'Application deployed successfully';
  }

  async simulateGeneric(stage) {
    const duration = stage.duration || Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, duration));
    return `${stage.name} completed`;
  }

  // Run the entire build pipeline
  async runPipeline() {
    if (!this.buildConfig) {
      throw new Error('Build pipeline not configured');
    }

    console.log(`Starting build pipeline: ${this.buildConfig.name}`);
    console.log(`Stages: ${this.buildConfig.stages.map(s => s.name).join(' -> ')}`);

    try {
      const summary = await this.resolver.executeConcurrent();
      
      console.log(`Build pipeline completed successfully!`);
      console.log(`Total duration: ${summary.totalDuration}ms`);
      console.log(`Executed ${summary.completed} stages`);
      
      return summary;
    } catch (error) {
      console.log(`Build pipeline failed: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Use Case 2: Data Processing Workflow
 * Manages ETL workflows with complex data dependencies
 */
class DataProcessingWorkflow {
  constructor() {
    this.resolver = new PriorityTaskDependencyResolver(3, {
      cpu: 8,
      memory: 16,
      storage: 1000
    });
    this.dataStore = new Map();
  }

  // Add data processing task
  addDataTask(taskId, processor, description, dependencies = [], priority = 0, resources = {}) {
    return this.resolver.addTaskWithPriority(
      taskId,
      async (deps) => this.processData(taskId, processor, deps),
      description,
      dependencies,
      priority,
      resources
    );
  }

  // Process data with the given processor function
  async processData(taskId, processor, dependencyResults) {
    console.log(`Processing data: ${taskId}`);
    
    // Collect input data from dependencies
    const inputData = {};
    for (const [depId, result] of Object.entries(dependencyResults)) {
      if (result && result.data) {
        inputData[depId] = result.data;
      }
    }

    // Process data
    const result = await processor(inputData, this.dataStore);
    
    // Store result for dependent tasks
    this.dataStore.set(taskId, result);
    
    return {
      taskId,
      data: result,
      recordCount: Array.isArray(result) ? result.length : 1,
      timestamp: new Date().toISOString()
    };
  }

  // Run the entire workflow
  async runWorkflow() {
    console.log('Starting data processing workflow...');
    console.log('Resource status:', this.resolver.getResourceStatus());
    
    try {
      const summary = await this.resolver.executeWithPriority();
      
      console.log('Data workflow completed!');
      console.log(`Processed ${summary.completed} tasks`);
      console.log('Final resource status:', this.resolver.getResourceStatus());
      
      return summary;
    } catch (error) {
      console.log(`Data workflow failed: ${error.message}`);
      throw error;
    }
  }

  // Get processed data
  getData(taskId) {
    return this.dataStore.get(taskId);
  }
}

/**
 * Use Case 3: Microservice Deployment Orchestrator
 * Orchestrates microservice deployments with complex dependencies
 */
class MicroserviceDeploymentOrchestrator {
  constructor() {
    this.resolver = new PriorityTaskDependencyResolver(5, {
      deploymentSlots: 10,
      networkBandwidth: 1000, // MB/s
      storageIOPS: 500
    });
    this.services = new Map();
    this.deploymentStatus = new Map();
  }

  // Add microservice deployment task
  addServiceDeployment(serviceId, deploymentConfig, dependencies = []) {
    const { priority = 5, resources = {}, healthCheck = null } = deploymentConfig;
    
    this.services.set(serviceId, deploymentConfig);
    
    return this.resolver.addTaskWithPriority(
      serviceId,
      async (deps) => this.deployService(serviceId, deploymentConfig, deps),
      `Deploy ${serviceId} service`,
      dependencies,
      priority,
      {
        deploymentSlots: 1,
        networkBandwidth: 50,
        storageIOPS: 20,
        ...resources
      }
    );
  }

  // Deploy a single service
  async deployService(serviceId, config, dependencyResults) {
    console.log(`Deploying service: ${serviceId}`);
    
    const deployment = {
      serviceId,
      startTime: Date.now(),
      status: 'deploying',
      healthCheck: config.healthCheck
    };
    
    this.deploymentStatus.set(serviceId, deployment);

    try {
      // Simulate deployment phases
      await this.simulateDeploymentPhase('pulling-image', config.imagePullTime || 500);
      await this.simulateDeploymentPhase('starting-container', config.startupTime || 1000);
      await this.simulateDeploymentPhase('initializing', config.initTime || 800);
      
      // Health check
      if (config.healthCheck) {
        await this.performHealthCheck(serviceId, config.healthCheck);
      }

      deployment.status = 'deployed';
      deployment.endTime = Date.now();
      
      console.log(`✓ Service ${serviceId} deployed successfully`);
      
      return {
        serviceId,
        status: 'deployed',
        duration: deployment.endTime - deployment.startTime,
        endpoint: `http://${serviceId}.service.local`,
        health: 'healthy'
      };
      
    } catch (error) {
      deployment.status = 'failed';
      deployment.error = error.message;
      deployment.endTime = Date.now();
      
      console.log(`✗ Service ${serviceId} deployment failed: ${error.message}`);
      throw error;
    }
  }

  // Simulate deployment phase
  async simulateDeploymentPhase(phase, duration) {
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Simulate occasional failures
    if (Math.random() < 0.03) { // 3% failure rate
      throw new Error(`${phase} failed`);
    }
  }

  // Perform health check
  async performHealthCheck(serviceId, healthCheck) {
    console.log(`Performing health check for ${serviceId}...`);
    
    const maxAttempts = healthCheck.maxAttempts || 5;
    const interval = healthCheck.interval || 1000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, interval));
      
      // Simulate health check
      if (Math.random() < 0.8) { // 80% success rate
        console.log(`Health check passed for ${serviceId} (attempt ${attempt})`);
        return true;
      }
      
      if (attempt === maxAttempts) {
        throw new Error(`Health check failed after ${maxAttempts} attempts`);
      }
    }
  }

  // Run complete deployment
  async deployAll() {
    console.log('Starting microservice deployment orchestration...');
    
    try {
      const summary = await this.resolver.executeWithPriority();
      
      console.log('All microservices deployed successfully!');
      console.log(`Total services: ${summary.completed}`);
      console.log(`Total duration: ${summary.totalDuration}ms`);
      
      return {
        ...summary,
        deployments: Object.fromEntries(this.deploymentStatus)
      };
      
    } catch (error) {
      console.log(`Deployment orchestration failed: ${error.message}`);
      throw error;
    }
  }

  // Get deployment status
  getDeploymentStatus(serviceId) {
    return this.deploymentStatus.get(serviceId);
  }

  // Get all deployment statuses
  getAllDeploymentStatuses() {
    return Object.fromEntries(this.deploymentStatus);
  }
}

// Test real-world examples
setTimeout(async () => {
  console.log('\n=== Real-world Use Cases ===\n');

  // Build Pipeline Example
  console.log('Testing Build Pipeline:');
  const buildManager = new BuildPipelineManager(3);
  
  const buildConfig = {
    name: 'Frontend Application Build',
    stages: [
      { name: 'checkout', type: 'checkout', description: 'Checkout source code' },
      { name: 'install', type: 'install', description: 'Install dependencies', dependencies: ['checkout'] },
      { name: 'lint', type: 'build', description: 'Run linting', dependencies: ['install'] },
      { name: 'test', type: 'test', description: 'Run tests', dependencies: ['install'] },
      { name: 'build', type: 'build', description: 'Build application', dependencies: ['lint', 'test'] },
      { name: 'package', type: 'package', description: 'Package for deployment', dependencies: ['build'] },
      { name: 'deploy', type: 'deploy', description: 'Deploy to production', dependencies: ['package'] }
    ]
  };
  
  try {
    await buildManager.configurePipeline(buildConfig).runPipeline();
  } catch (error) {
    console.log('Build pipeline failed:', error.message);
  }
  
  console.log();

  // Data Processing Workflow Example
  console.log('Testing Data Processing Workflow:');
  const dataWorkflow = new DataProcessingWorkflow();
  
  // Add data processing tasks
  dataWorkflow.addDataTask('extract_users', async (input, store) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
  }, 'Extract user data', [], 8, { cpu: 2, memory: 4 });

  dataWorkflow.addDataTask('extract_orders', async (input, store) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [{ id: 101, userId: 1, total: 100 }, { id: 102, userId: 2, total: 200 }];
  }, 'Extract order data', [], 7, { cpu: 1, memory: 2 });

  dataWorkflow.addDataTask('transform_users', async (input, store) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = input.extract_users || [];
    return users.map(user => ({ ...user, processed: true }));
  }, 'Transform user data', ['extract_users'], 6, { cpu: 1, memory: 1 });

  dataWorkflow.addDataTask('join_data', async (input, store) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const users = input.transform_users || [];
    const orders = input.extract_orders || [];
    
    return users.map(user => ({
      ...user,
      orders: orders.filter(order => order.userId === user.id)
    }));
  }, 'Join user and order data', ['transform_users', 'extract_orders'], 9, { cpu: 2, memory: 3 });

  try {
    await dataWorkflow.runWorkflow();
    console.log('Final joined data:', dataWorkflow.getData('join_data'));
  } catch (error) {
    console.log('Data workflow failed:', error.message);
  }
  
  console.log();

  // Microservice Deployment Example
  console.log('Testing Microservice Deployment:');
  const deploymentOrchestrator = new MicroserviceDeploymentOrchestrator();
  
  // Add service deployments
  deploymentOrchestrator.addServiceDeployment('database', {
    priority: 10,
    imagePullTime: 800,
    startupTime: 2000,
    initTime: 1500,
    healthCheck: { maxAttempts: 3, interval: 500 }
  });

  deploymentOrchestrator.addServiceDeployment('auth-service', {
    priority: 9,
    imagePullTime: 400,
    startupTime: 1000,
    initTime: 800,
    healthCheck: { maxAttempts: 5, interval: 300 }
  }, ['database']);

  deploymentOrchestrator.addServiceDeployment('user-service', {
    priority: 7,
    imagePullTime: 600,
    startupTime: 1200,
    initTime: 600,
    healthCheck: { maxAttempts: 3, interval: 400 }
  }, ['auth-service']);

  deploymentOrchestrator.addServiceDeployment('order-service', {
    priority: 6,
    imagePullTime: 500,
    startupTime: 1100,
    initTime: 700,
    healthCheck: { maxAttempts: 4, interval: 350 }
  }, ['user-service']);

  deploymentOrchestrator.addServiceDeployment('api-gateway', {
    priority: 8,
    imagePullTime: 300,
    startupTime: 800,
    initTime: 400,
    healthCheck: { maxAttempts: 5, interval: 200 }
  }, ['auth-service', 'user-service', 'order-service']);

  try {
    const deploymentResult = await deploymentOrchestrator.deployAll();
    console.log('All services deployed:', Object.keys(deploymentResult.deployments));
  } catch (error) {
    console.log('Deployment orchestration failed:', error.message);
  }

}, 3000);

// Export all implementations
module.exports = {
  TaskDependencyResolver,
  ConcurrentTaskDependencyResolver,
  PriorityTaskDependencyResolver,
  BuildPipelineManager,
  DataProcessingWorkflow,
  MicroserviceDeploymentOrchestrator
};

/**
 * Key Interview Points:
 * 
 * 1. Graph Algorithms:
 *    - Topological sorting (Kahn's algorithm, DFS-based)
 *    - Cycle detection in directed graphs
 *    - Dependency resolution and order determination
 *    - Time complexity: O(V + E) for both algorithms
 * 
 * 2. Concurrency Management:
 *    - Concurrent execution while respecting dependencies
 *    - Resource allocation and limiting
 *    - Priority-based scheduling
 *    - Deadlock prevention and detection
 * 
 * 3. Real-world Applications:
 *    - Build systems (make, webpack, gradle)
 *    - Package managers (npm, pip, apt)
 *    - Database migrations
 *    - Microservice deployment
 *    - ETL data pipelines
 * 
 * 4. Error Handling:
 *    - Graceful failure of dependent tasks
 *    - Retry mechanisms for transient failures
 *    - Rollback strategies
 *    - Partial execution scenarios
 * 
 * 5. Optimization Techniques:
 *    - Parallel execution of independent tasks
 *    - Resource pooling and sharing
 *    - Priority queuing for critical tasks
 *    - Caching of intermediate results
 * 
 * 6. Common Pitfalls:
 *    - Circular dependencies causing deadlocks
 *    - Resource starvation with priority systems
 *    - Race conditions in concurrent execution
 *    - Memory leaks from uncleaned task references
 */