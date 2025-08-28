/**
 * File: circular-dependencies.js
 * Description: Circular dependency handling in different module systems
 * Demonstrates detection, resolution strategies, and best practices
 */

console.log('=== Understanding Circular Dependencies ===');

// Example 1: CommonJS circular dependency simulation
console.log('1. CommonJS circular dependencies:');

// Simulate CommonJS module system
class CommonJSModuleSystem {
  constructor() {
    this.moduleCache = new Map();
    this.loading = new Set();
  }
  
  require(modulePath) {
    // Return cached module if available
    if (this.moduleCache.has(modulePath)) {
      console.log(`Returning cached module: ${modulePath}`);
      return this.moduleCache.get(modulePath).exports;
    }
    
    // Check for circular dependency
    if (this.loading.has(modulePath)) {
      console.warn(`Circular dependency detected: ${modulePath}`);
      // Return empty exports object for now
      const partialModule = { exports: {} };
      this.moduleCache.set(modulePath, partialModule);
      return partialModule.exports;
    }
    
    // Mark as loading
    this.loading.add(modulePath);
    
    // Create module object
    const module = { 
      id: modulePath,
      exports: {},
      loaded: false
    };
    
    // Cache immediately (before execution) to handle circular deps
    this.moduleCache.set(modulePath, module);
    
    try {
      // Simulate module execution
      this.executeModule(modulePath, module, this);
      
      module.loaded = true;
      this.loading.delete(modulePath);
      
      console.log(`Module loaded: ${modulePath}`);
      return module.exports;
      
    } catch (error) {
      // Remove from cache on error
      this.moduleCache.delete(modulePath);
      this.loading.delete(modulePath);
      throw error;
    }
  }
  
  executeModule(modulePath, module, moduleSystem) {
    switch (modulePath) {
      case './moduleA':
        // Module A depends on Module B
        console.log('Executing moduleA...');
        const moduleB = moduleSystem.require('./moduleB');
        
        module.exports = {
          name: 'Module A',
          getValue: () => `A -> ${moduleB.getValue ? moduleB.getValue() : 'B (partial)'}`,
          fromA: true
        };
        break;
        
      case './moduleB':
        // Module B depends on Module A (circular!)
        console.log('Executing moduleB...');
        const moduleA = moduleSystem.require('./moduleA');
        
        module.exports = {
          name: 'Module B',
          getValue: () => `B -> ${moduleA.fromA ? 'A (complete)' : 'A (partial)'}`,
          fromB: true
        };
        break;
        
      default:
        throw new Error(`Module not found: ${modulePath}`);
    }
  }
}

// Test CommonJS circular dependencies
const cjsSystem = new CommonJSModuleSystem();

console.log('Loading moduleA (which depends on moduleB):');
const moduleA = cjsSystem.require('./moduleA');
console.log('ModuleA result:', moduleA.getValue());

console.log('\nLoading moduleB directly:');
const moduleB = cjsSystem.require('./moduleB');
console.log('ModuleB result:', moduleB.getValue());

console.log('\n=== ES Modules Circular Dependencies ===');

// Example 2: ES Modules circular dependency simulation
console.log('2. ES Modules circular dependencies:');

class ESModuleSystem {
  constructor() {
    this.moduleMap = new Map();
    this.instantiating = new Set();
    this.evaluating = new Set();
  }
  
  async importModule(modulePath) {
    if (this.moduleMap.has(modulePath)) {
      const module = this.moduleMap.get(modulePath);
      if (module.status === 'evaluated') {
        return module.namespace;
      }
    }
    
    // Create module record
    const moduleRecord = {
      modulePath,
      status: 'uninstantiated',
      environment: {},
      namespace: {},
      requestedModules: []
    };
    
    this.moduleMap.set(modulePath, moduleRecord);
    
    // Parse and get dependencies
    const { dependencies, factory } = this.parseModule(modulePath);
    moduleRecord.requestedModules = dependencies;
    moduleRecord.factory = factory;
    
    // Instantiate module and dependencies
    await this.instantiate(moduleRecord);
    
    // Evaluate module
    await this.evaluate(moduleRecord);
    
    return moduleRecord.namespace;
  }
  
  parseModule(modulePath) {
    const moduleDefinitions = {
      './esModuleX': {
        dependencies: ['./esModuleY'],
        factory: (importedY) => ({
          name: 'ES Module X',
          getInfo: () => `X exports: ${importedY.name || 'Y (not ready)'}`,
          xValue: 'X_VALUE'
        })
      },
      './esModuleY': {
        dependencies: ['./esModuleX'],
        factory: (importedX) => ({
          name: 'ES Module Y',
          getInfo: () => `Y exports: ${importedX.xValue || 'X (not ready)'}`,
          yValue: 'Y_VALUE'
        })
      }
    };
    
    return moduleDefinitions[modulePath] || { dependencies: [], factory: () => ({}) };
  }
  
  async instantiate(moduleRecord) {
    if (moduleRecord.status !== 'uninstantiated') {
      return;
    }
    
    if (this.instantiating.has(moduleRecord.modulePath)) {
      console.log(`Circular dependency during instantiation: ${moduleRecord.modulePath}`);
      return; // Break the cycle
    }
    
    this.instantiating.add(moduleRecord.modulePath);
    moduleRecord.status = 'instantiating';
    
    // Instantiate dependencies first
    const dependencyModules = [];
    for (const depPath of moduleRecord.requestedModules) {
      const depModule = this.moduleMap.get(depPath) || {
        modulePath: depPath,
        status: 'uninstantiated',
        environment: {},
        namespace: {},
        requestedModules: []
      };
      
      if (!this.moduleMap.has(depPath)) {
        this.moduleMap.set(depPath, depModule);
        const { dependencies, factory } = this.parseModule(depPath);
        depModule.requestedModules = dependencies;
        depModule.factory = factory;
      }
      
      await this.instantiate(depModule);
      dependencyModules.push(depModule);
    }
    
    // Set up bindings
    moduleRecord.dependencies = dependencyModules;
    moduleRecord.status = 'instantiated';
    this.instantiating.delete(moduleRecord.modulePath);
    
    console.log(`Instantiated: ${moduleRecord.modulePath}`);
  }
  
  async evaluate(moduleRecord) {
    if (moduleRecord.status === 'evaluated') {
      return;
    }
    
    if (this.evaluating.has(moduleRecord.modulePath)) {
      console.log(`Circular dependency during evaluation: ${moduleRecord.modulePath}`);
      return; // Return partial namespace
    }
    
    this.evaluating.add(moduleRecord.modulePath);
    moduleRecord.status = 'evaluating';
    
    // Evaluate dependencies first
    if (moduleRecord.dependencies) {
      for (const depModule of moduleRecord.dependencies) {
        await this.evaluate(depModule);
      }
    }
    
    // Execute module
    const dependencyNamespaces = moduleRecord.dependencies ? 
      moduleRecord.dependencies.map(dep => dep.namespace) : [];
    
    moduleRecord.namespace = moduleRecord.factory(...dependencyNamespaces);
    moduleRecord.status = 'evaluated';
    
    this.evaluating.delete(moduleRecord.modulePath);
    console.log(`Evaluated: ${moduleRecord.modulePath}`);
  }
}

// Test ES Modules circular dependencies
const esmSystem = new ESModuleSystem();

async function testESMCircular() {
  console.log('Loading ES Module X (which depends on Y):');
  const moduleX = await esmSystem.importModule('./esModuleX');
  console.log('Module X result:', moduleX.getInfo());
  
  console.log('\nLoading ES Module Y:');
  const moduleY = await esmSystem.importModule('./esModuleY');
  console.log('Module Y result:', moduleY.getInfo());
}

testESMCircular();

console.log('\n=== Circular Dependency Detection ===');

// Example 3: Circular dependency detector
console.log('3. Circular dependency detection:');

class DependencyAnalyzer {
  constructor() {
    this.dependencies = new Map();
    this.visited = new Set();
    this.recursionStack = new Set();
  }
  
  addDependency(module, dependencies) {
    this.dependencies.set(module, dependencies);
  }
  
  detectCircularDependencies() {
    const cycles = [];
    
    for (const module of this.dependencies.keys()) {
      if (!this.visited.has(module)) {
        const cycle = this.dfs(module, []);
        if (cycle.length > 0) {
          cycles.push(cycle);
        }
      }
    }
    
    return cycles;
  }
  
  dfs(module, path) {
    if (this.recursionStack.has(module)) {
      // Found a cycle
      const cycleStart = path.indexOf(module);
      return path.slice(cycleStart).concat([module]);
    }
    
    if (this.visited.has(module)) {
      return [];
    }
    
    this.visited.add(module);
    this.recursionStack.add(module);
    path.push(module);
    
    const dependencies = this.dependencies.get(module) || [];
    for (const dep of dependencies) {
      const cycle = this.dfs(dep, [...path]);
      if (cycle.length > 0) {
        this.recursionStack.delete(module);
        return cycle;
      }
    }
    
    this.recursionStack.delete(module);
    return [];
  }
  
  visualizeDependencies() {
    console.log('Dependency Graph:');
    for (const [module, deps] of this.dependencies) {
      console.log(`${module} -> [${deps.join(', ')}]`);
    }
  }
}

// Test circular dependency detection
const analyzer = new DependencyAnalyzer();

// Add dependency relationships
analyzer.addDependency('auth', ['user', 'config']);
analyzer.addDependency('user', ['database', 'logger']);
analyzer.addDependency('database', ['config', 'logger']);
analyzer.addDependency('logger', ['config']);
analyzer.addDependency('config', ['auth']); // Creates circular dependency!
analyzer.addDependency('utils', ['logger']);

analyzer.visualizeDependencies();

console.log('\nCircular dependencies found:');
const cycles = analyzer.detectCircularDependencies();
cycles.forEach((cycle, index) => {
  console.log(`Cycle ${index + 1}: ${cycle.join(' -> ')}`);
});

console.log('\n=== Resolution Strategies ===');

// Example 4: Circular dependency resolution strategies
console.log('4. Resolution strategies:');

class CircularDependencyResolver {
  // Strategy 1: Dependency Injection
  static dependencyInjection() {
    console.log('Strategy 1: Dependency Injection');
    
    // Instead of direct imports, inject dependencies
    class UserService {
      constructor(authService) {
        this.authService = authService;
      }
      
      createUser(userData) {
        if (this.authService?.validatePermissions('create_user')) {
          return `User created: ${userData.name}`;
        }
        return 'Permission denied';
      }
    }
    
    class AuthService {
      constructor(userService) {
        this.userService = userService;
      }
      
      validatePermissions(permission) {
        // Can access userService without circular import
        return true;
      }
    }
    
    // Wire up dependencies externally
    const authService = new AuthService();
    const userService = new UserService(authService);
    authService.userService = userService; // Inject back reference
    
    console.log('Result:', userService.createUser({ name: 'John' }));
    return { userService, authService };
  }
  
  // Strategy 2: Event-driven architecture
  static eventDrivenApproach() {
    console.log('\nStrategy 2: Event-driven Architecture');
    
    class EventBus {
      constructor() {
        this.listeners = new Map();
      }
      
      on(event, callback) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
      }
      
      emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
      }
    }
    
    const eventBus = new EventBus();
    
    // Modules communicate through events instead of direct dependencies
    class OrderModule {
      constructor(eventBus) {
        this.eventBus = eventBus;
      }
      
      createOrder(orderData) {
        console.log('Order created');
        this.eventBus.emit('order:created', orderData);
        return orderData;
      }
    }
    
    class InventoryModule {
      constructor(eventBus) {
        this.eventBus = eventBus;
        this.eventBus.on('order:created', (order) => {
          this.updateInventory(order);
        });
      }
      
      updateInventory(order) {
        console.log('Inventory updated for order:', order.id);
        this.eventBus.emit('inventory:updated', order);
      }
    }
    
    const orderModule = new OrderModule(eventBus);
    const inventoryModule = new InventoryModule(eventBus);
    
    orderModule.createOrder({ id: 'ORD-123', items: ['item1'] });
    
    return { orderModule, inventoryModule };
  }
  
  // Strategy 3: Lazy loading
  static lazyLoading() {
    console.log('\nStrategy 3: Lazy Loading');
    
    class LazyModuleA {
      constructor() {
        this.name = 'Module A';
        this._moduleB = null;
      }
      
      get moduleB() {
        if (!this._moduleB) {
          // Lazy load to break circular dependency
          this._moduleB = new LazyModuleB();
        }
        return this._moduleB;
      }
      
      getValue() {
        return `A -> ${this.moduleB.name}`;
      }
    }
    
    class LazyModuleB {
      constructor() {
        this.name = 'Module B';
        this._moduleA = null;
      }
      
      get moduleA() {
        if (!this._moduleA) {
          this._moduleA = new LazyModuleA();
        }
        return this._moduleA;
      }
      
      getValue() {
        return `B -> ${this.moduleA.name}`;
      }
    }
    
    const moduleA = new LazyModuleA();
    console.log('Lazy result:', moduleA.getValue());
    
    return { LazyModuleA, LazyModuleB };
  }
  
  // Strategy 4: Interface segregation
  static interfaceSegregation() {
    console.log('\nStrategy 4: Interface Segregation');
    
    // Split large modules into smaller, focused interfaces
    class UserDataService {
      getUser(id) {
        return { id, name: `User ${id}`, email: `user${id}@example.com` };
      }
    }
    
    class UserValidationService {
      validateUser(userData) {
        return userData.name && userData.email;
      }
    }
    
    class AuthTokenService {
      generateToken(user) {
        return `token_${user.id}_${Date.now()}`;
      }
      
      validateToken(token) {
        return token.startsWith('token_');
      }
    }
    
    // Each service has focused responsibility, reducing circular dependencies
    const userDataService = new UserDataService();
    const validationService = new UserValidationService();
    const tokenService = new AuthTokenService();
    
    const user = userDataService.getUser(123);
    const isValid = validationService.validateUser(user);
    const token = isValid ? tokenService.generateToken(user) : null;
    
    console.log('User valid:', isValid);
    console.log('Token generated:', !!token);
    
    return { userDataService, validationService, tokenService };
  }
}

// Test all resolution strategies
CircularDependencyResolver.dependencyInjection();
CircularDependencyResolver.eventDrivenApproach();
CircularDependencyResolver.lazyLoading();
CircularDependencyResolver.interfaceSegregation();

console.log('\n=== Best Practices ===');

// Example 5: Best practices for avoiding circular dependencies
console.log('5. Best practices:');

const bestPractices = {
  // ✅ DO: Use dependency inversion
  goodExample: {
    // Define interfaces/contracts
    IUserRepository: class {
      async getUser(id) { throw new Error('Not implemented'); }
    },
    
    IAuthService: class {
      async authenticate(credentials) { throw new Error('Not implemented'); }
    },
    
    // Implement concrete classes
    UserRepository: class extends Object.getPrototypeOf({}).IUserRepository {
      async getUser(id) {
        return { id, name: `User ${id}` };
      }
    },
    
    AuthService: class {
      constructor(userRepository) {
        this.userRepository = userRepository;
      }
      
      async authenticate(credentials) {
        const user = await this.userRepository.getUser(credentials.userId);
        return user ? { token: 'valid_token', user } : null;
      }
    }
  },
  
  // ❌ DON'T: Create tight coupling
  badExample: {
    // Tightly coupled modules that know too much about each other
    explanation: 'Avoid modules that directly import and depend on each other'
  },
  
  principles: [
    '1. Single Responsibility Principle - Each module should have one reason to change',
    '2. Dependency Inversion - Depend on abstractions, not concretions',
    '3. Event-driven Communication - Use events for loose coupling',
    '4. Lazy Loading - Defer dependency resolution when possible',
    '5. Interface Segregation - Keep interfaces small and focused'
  ]
};

console.log('Best Practices for Avoiding Circular Dependencies:');
bestPractices.principles.forEach(principle => console.log(principle));

// Demonstrate good example
const userRepo = new bestPractices.goodExample.UserRepository();
const authService = new bestPractices.goodExample.AuthService(userRepo);

authService.authenticate({ userId: 456 }).then(result => {
  console.log('Authentication result:', result);
});

console.log('\n=== Interview Questions ===');

console.log('6. Common interview questions:');

const interviewQuestions = [
  {
    question: 'What happens when you have circular dependencies in CommonJS?',
    answer: 'CommonJS returns partial exports (empty object initially) for the circularly dependent module, then fills it in as execution continues.'
  },
  {
    question: 'How do ES modules handle circular dependencies differently?',
    answer: 'ES modules create bindings early during instantiation phase, allowing circular references to work with live bindings.'
  },
  {
    question: 'How would you detect circular dependencies in a large codebase?',
    answer: 'Use dependency analysis tools, build dependency graphs, and implement DFS-based cycle detection algorithms.'
  },
  {
    question: 'What are the main strategies to resolve circular dependencies?',
    answer: 'Dependency injection, event-driven architecture, lazy loading, interface segregation, and architectural refactoring.'
  }
];

interviewQuestions.forEach((qa, index) => {
  console.log(`\nQ${index + 1}: ${qa.question}`);
  console.log(`A: ${qa.answer}`);
});

module.exports = {
  CommonJSModuleSystem,
  ESModuleSystem,
  DependencyAnalyzer,
  CircularDependencyResolver,
  bestPractices,
  interviewQuestions
};