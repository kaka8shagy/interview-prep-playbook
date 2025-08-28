/**
 * File: object-pooling.js
 * Description: Object pooling patterns for memory optimization
 * Demonstrates reusable object pools to reduce garbage collection pressure
 */

console.log('=== Basic Object Pooling ===');

// Example 1: Simple object pool
console.log('1. Simple object pool:');

class SimpleObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.created = 0;
    this.reused = 0;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
      this.created++;
    }
    
    console.log(`Initialized pool with ${initialSize} objects`);
  }
  
  acquire() {
    let obj;
    
    if (this.pool.length > 0) {
      obj = this.pool.pop();
      this.reused++;
      console.log(`Reused object from pool (${this.pool.length} remaining)`);
    } else {
      obj = this.createFn();
      this.created++;
      console.log(`Created new object (pool empty)`);
    }
    
    return obj;
  }
  
  release(obj) {
    if (this.resetFn) {
      this.resetFn(obj);
    }
    
    this.pool.push(obj);
    console.log(`Returned object to pool (${this.pool.length} available)`);
  }
  
  getStats() {
    return {
      created: this.created,
      reused: this.reused,
      available: this.pool.length,
      efficiency: this.reused / (this.created + this.reused) * 100
    };
  }
  
  destroy() {
    this.pool.length = 0;
    console.log('Pool destroyed');
  }
}

// Usage example with vector objects
function createVector() {
  return { x: 0, y: 0, z: 0 };
}

function resetVector(vector) {
  vector.x = 0;
  vector.y = 0;
  vector.z = 0;
}

const vectorPool = new SimpleObjectPool(createVector, resetVector, 5);

// Simulate usage
console.log('Simulating vector operations...');
for (let i = 0; i < 10; i++) {
  const vector = vectorPool.acquire();
  vector.x = Math.random() * 100;
  vector.y = Math.random() * 100;
  vector.z = Math.random() * 100;
  
  console.log(`Vector ${i}: (${vector.x.toFixed(1)}, ${vector.y.toFixed(1)}, ${vector.z.toFixed(1)})`);
  
  // Simulate some work, then release
  setTimeout(() => {
    vectorPool.release(vector);
    
    if (i === 9) {
      console.log('Vector pool stats:', vectorPool.getStats());
    }
  }, i * 100);
}

console.log('\n=== Advanced Object Pool ===');

// Example 2: Generic typed object pool
console.log('2. Generic typed object pool:');

class TypedObjectPool {
  constructor(type, options = {}) {
    this.type = type;
    this.maxSize = options.maxSize || 100;
    this.initialSize = options.initialSize || 10;
    this.pool = [];
    this.inUse = new Set();
    this.stats = {
      created: 0,
      reused: 0,
      destroyed: 0
    };
    
    this.initialize();
  }
  
  initialize() {
    for (let i = 0; i < this.initialSize; i++) {
      this.pool.push(this.createInstance());
    }
    console.log(`Initialized ${this.type.name} pool with ${this.initialSize} instances`);
  }
  
  createInstance() {
    const instance = new this.type();
    this.stats.created++;
    
    // Add pool metadata
    instance._pooled = true;
    instance._poolInstance = this;
    
    return instance;
  }
  
  acquire(...args) {
    let instance;
    
    if (this.pool.length > 0) {
      instance = this.pool.pop();
      this.stats.reused++;
    } else {
      instance = this.createInstance();
    }
    
    this.inUse.add(instance);
    
    // Initialize if method exists
    if (instance.initialize && typeof instance.initialize === 'function') {
      instance.initialize(...args);
    }
    
    return instance;
  }
  
  release(instance) {
    if (!this.inUse.has(instance)) {
      console.warn('Attempting to release object not from this pool');
      return false;
    }
    
    this.inUse.delete(instance);
    
    // Reset if method exists
    if (instance.reset && typeof instance.reset === 'function') {
      instance.reset();
    }
    
    // Check pool size limit
    if (this.pool.length < this.maxSize) {
      this.pool.push(instance);
    } else {
      // Destroy excess instances
      if (instance.destroy && typeof instance.destroy === 'function') {
        instance.destroy();
      }
      this.stats.destroyed++;
    }
    
    return true;
  }
  
  getStats() {
    return {
      ...this.stats,
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      efficiency: this.stats.reused / (this.stats.created + this.stats.reused) * 100
    };
  }
  
  destroy() {
    // Destroy all pooled instances
    this.pool.forEach(instance => {
      if (instance.destroy && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    
    this.pool.length = 0;
    this.inUse.clear();
    console.log(`${this.type.name} pool destroyed`);
  }
}

// Example poolable class
class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
  }
  
  initialize(x, y, vx, vy, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
  }
  
  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.life -= deltaTime;
    
    return this.life <= 0; // Return true if particle should be removed
  }
  
  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
  }
  
  destroy() {
    // Cleanup if needed
    console.log('Particle destroyed');
  }
}

const particlePool = new TypedObjectPool(Particle, { maxSize: 50, initialSize: 20 });

// Simulate particle system
console.log('Simulating particle system...');

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.pool = particlePool;
  }
  
  emit(count) {
    for (let i = 0; i < count; i++) {
      const particle = this.pool.acquire(
        Math.random() * 100,  // x
        Math.random() * 100,  // y
        (Math.random() - 0.5) * 50, // vx
        (Math.random() - 0.5) * 50, // vy
        1000 + Math.random() * 2000  // life
      );
      
      this.particles.push(particle);
    }
    
    console.log(`Emitted ${count} particles, total active: ${this.particles.length}`);
  }
  
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const shouldRemove = particle.update(deltaTime);
      
      if (shouldRemove) {
        this.particles.splice(i, 1);
        this.pool.release(particle);
      }
    }
  }
  
  getStats() {
    return {
      activeParticles: this.particles.length,
      poolStats: this.pool.getStats()
    };
  }
  
  destroy() {
    // Return all particles to pool
    this.particles.forEach(particle => this.pool.release(particle));
    this.particles.length = 0;
    console.log('Particle system destroyed');
  }
}

const particleSystem = new ParticleSystem();

// Emit particles over time
let emitCount = 0;
const emitTimer = setInterval(() => {
  particleSystem.emit(5);
  emitCount++;
  
  if (emitCount >= 5) {
    clearInterval(emitTimer);
  }
}, 500);

// Update particle system
const updateTimer = setInterval(() => {
  particleSystem.update(100); // 100ms delta time
  
  if (emitCount >= 5) {
    console.log('Particle system stats:', particleSystem.getStats());
  }
}, 100);

// Cleanup after demo
setTimeout(() => {
  clearInterval(updateTimer);
  particleSystem.destroy();
  particlePool.destroy();
}, 8000);

console.log('\n=== Specialized Pools ===');

// Example 3: String builder pool
console.log('3. String builder pool:');

class StringBuilder {
  constructor() {
    this.parts = [];
  }
  
  append(str) {
    this.parts.push(str);
    return this;
  }
  
  toString() {
    return this.parts.join('');
  }
  
  reset() {
    this.parts.length = 0;
  }
  
  getLength() {
    return this.parts.reduce((total, part) => total + part.length, 0);
  }
}

class StringBuilderPool {
  constructor(initialSize = 5) {
    this.pool = [];
    this.stats = { created: 0, reused: 0 };
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new StringBuilder());
      this.stats.created++;
    }
  }
  
  acquire() {
    let builder;
    
    if (this.pool.length > 0) {
      builder = this.pool.pop();
      this.stats.reused++;
    } else {
      builder = new StringBuilder();
      this.stats.created++;
    }
    
    return builder;
  }
  
  release(builder) {
    builder.reset();
    this.pool.push(builder);
  }
  
  getStats() {
    return { ...this.stats, available: this.pool.length };
  }
}

const stringPool = new StringBuilderPool();

// Usage example
function buildComplexString(data) {
  const builder = stringPool.acquire();
  
  builder.append('<html><body>')
          .append('<h1>').append(data.title).append('</h1>')
          .append('<p>').append(data.content).append('</p>')
          .append('</body></html>');
  
  const result = builder.toString();
  stringPool.release(builder);
  
  return result;
}

const testData = { title: 'Test Page', content: 'This is test content' };
const html = buildComplexString(testData);
console.log('Built HTML:', html);
console.log('String pool stats:', stringPool.getStats());

console.log('\n4. Array pool with different sizes:');

// Example 4: Multi-size array pool
class ArrayPool {
  constructor() {
    this.pools = new Map(); // Size -> array pool
    this.stats = { created: 0, reused: 0 };
  }
  
  acquire(size) {
    const poolKey = this.getPoolKey(size);
    let pool = this.pools.get(poolKey);
    
    if (!pool) {
      pool = [];
      this.pools.set(poolKey, pool);
    }
    
    let array;
    if (pool.length > 0) {
      array = pool.pop();
      this.stats.reused++;
    } else {
      array = new Array(poolKey);
      this.stats.created++;
    }
    
    // Clear array contents
    array.fill(undefined);
    
    return array;
  }
  
  release(array) {
    const size = array.length;
    const poolKey = this.getPoolKey(size);
    let pool = this.pools.get(poolKey);
    
    if (!pool) {
      pool = [];
      this.pools.set(poolKey, pool);
    }
    
    // Clear array and return to pool
    array.fill(undefined);
    pool.push(array);
  }
  
  getPoolKey(size) {
    // Round up to nearest power of 2 for efficient pooling
    return Math.pow(2, Math.ceil(Math.log2(size)));
  }
  
  getStats() {
    const poolSizes = {};
    this.pools.forEach((pool, size) => {
      poolSizes[size] = pool.length;
    });
    
    return {
      ...this.stats,
      pools: poolSizes,
      efficiency: this.stats.reused / (this.stats.created + this.stats.reused) * 100
    };
  }
  
  destroy() {
    this.pools.clear();
    console.log('Array pool destroyed');
  }
}

const arrayPool = new ArrayPool();

// Test different sized arrays
console.log('Testing multi-size array pool:');

function processData(items) {
  const workArray = arrayPool.acquire(items.length);
  
  // Use the array for processing
  for (let i = 0; i < items.length; i++) {
    workArray[i] = items[i] * 2;
  }
  
  const result = workArray.slice(0, items.length);
  arrayPool.release(workArray);
  
  return result;
}

// Test with different sizes
const result1 = processData([1, 2, 3]);
const result2 = processData([1, 2, 3, 4, 5, 6, 7]);
const result3 = processData([1, 2]);

console.log('Results:', { result1, result2, result3 });
console.log('Array pool stats:', arrayPool.getStats());

// Cleanup
setTimeout(() => {
  console.log('\n=== Object Pooling Demo Complete ===');
  
  vectorPool.destroy();
  stringPool.pool.length = 0;
  arrayPool.destroy();
  
  console.log('All pools destroyed');
}, 9000);

module.exports = {
  SimpleObjectPool,
  TypedObjectPool,
  Particle,
  ParticleSystem,
  StringBuilder,
  StringBuilderPool,
  ArrayPool
};