/**
 * File: new-data-types.js
 * Topic: ES6+ New Data Types - Map, Set, Symbol, and Enhanced Classes
 * 
 * This file demonstrates the new data types introduced in ES6+ with extensive
 * commenting to explain concepts, use cases, and implementation details.
 * Focus: Understanding when and why to use these new data types over traditional objects/arrays
 */

// ============================================================================
// MAP DATA TYPE - Key-Value Store with Any Key Type
// ============================================================================

/**
 * Map vs Object: Understanding the Mental Model
 * 
 * Object limitations:
 * - Keys must be strings or symbols
 * - Prototype pollution risk
 * - No built-in size property
 * - Iteration order not guaranteed in older environments
 * 
 * Map advantages:
 * - Any type can be a key (objects, primitives, functions)
 * - No default keys (clean slate)
 * - Built-in size property
 * - Guaranteed insertion order iteration
 */

// Creating and populating Maps with different key types
const userPreferences = new Map();

// Using primitive keys (similar to object)
userPreferences.set('theme', 'dark');
userPreferences.set('language', 'en');
userPreferences.set('notifications', true);

// Using object keys (impossible with regular objects)
const userObj = { id: 123, name: 'John' };
const settingsObj = { volume: 80, quality: 'high' };
userPreferences.set(userObj, settingsObj);

// Using function keys (advanced pattern for caching/memoization)
function expensiveCalculation(data) {
    return data.reduce((sum, num) => sum + num * num, 0);
}
const calculationCache = new Map();
calculationCache.set(expensiveCalculation, new Map()); // Function as key for nested cache

console.log('Map size:', userPreferences.size); // Built-in size property
console.log('User settings:', userPreferences.get(userObj)); // Retrieve by object key

/**
 * Map Iteration Patterns - Multiple Ways to Process Data
 * 
 * Maps provide three main iteration methods, each optimized for different use cases:
 * - keys(): When you only need keys (rare, usually combined with get())
 * - values(): When you only need values (common for processing data)
 * - entries(): When you need both key and value (most common)
 */

// Method 1: for...of with entries (most common pattern)
console.log('\n=== Iterating Map entries ===');
for (const [key, value] of userPreferences.entries()) {
    // Type-safe iteration - key and value are properly typed
    console.log(`Key type: ${typeof key}, Value:`, value);
}

// Method 2: forEach method (callback style, useful for side effects)
userPreferences.forEach((value, key, map) => {
    // Note: forEach signature is (value, key, map) - value comes first!
    // This is different from Array.forEach which is (item, index, array)
    if (typeof key === 'string') {
        console.log(`String key "${key}" has value:`, value);
    }
});

// Method 3: Destructuring with spread (converting to array for processing)
const mapEntries = [...userPreferences]; // Convert to array of [key, value] pairs
const stringKeys = mapEntries
    .filter(([key]) => typeof key === 'string') // Filter by key type
    .map(([key, value]) => ({ setting: key, value })); // Transform structure

console.log('String-based preferences:', stringKeys);

// ============================================================================
// SET DATA TYPE - Unique Values Collection
// ============================================================================

/**
 * Set vs Array: When to Use Each
 * 
 * Use Set when:
 * - You need unique values only
 * - Frequent membership testing (has() is O(1) vs Array.includes() O(n))
 * - Adding/removing values frequently
 * - You don't care about order (though Sets maintain insertion order)
 * 
 * Use Array when:
 * - You need indexed access
 * - Duplicates are meaningful
 * - You need array methods (map, filter, reduce)
 * - Order/position is important for logic
 */

// Creating Sets with different data types
const uniqueUserIds = new Set([1, 2, 3, 4, 4, 4]); // Duplicates automatically removed
console.log('Unique IDs:', [...uniqueUserIds]); // [1, 2, 3, 4]

// Practical example: Tag management system
const articleTags = new Set();
const userTags = ['javascript', 'react', 'nodejs', 'javascript', 'python'];

// Adding tags (duplicates ignored automatically)
userTags.forEach(tag => articleTags.add(tag));
console.log('Unique tags:', [...articleTags]);

// Fast membership testing - O(1) complexity
function hasTag(tag) {
    return articleTags.has(tag); // Much faster than array.includes() for large datasets
}

console.log('Has "react" tag:', hasTag('react'));
console.log('Has "angular" tag:', hasTag('angular'));

/**
 * Set Operations - Mathematical Set Theory in JavaScript
 * 
 * Sets enable mathematical operations like union, intersection, difference
 * These are common in data processing, filtering, and comparison scenarios
 */

const frontendSkills = new Set(['html', 'css', 'javascript', 'react', 'vue']);
const backendSkills = new Set(['javascript', 'nodejs', 'python', 'sql', 'mongodb']);

// Union: All skills combined (no duplicates)
const allSkills = new Set([...frontendSkills, ...backendSkills]);
console.log('All skills:', [...allSkills]);

// Intersection: Common skills between frontend and backend
const sharedSkills = new Set(
    [...frontendSkills].filter(skill => backendSkills.has(skill))
);
console.log('Shared skills:', [...sharedSkills]);

// Difference: Frontend-only skills
const frontendOnlySkills = new Set(
    [...frontendSkills].filter(skill => !backendSkills.has(skill))
);
console.log('Frontend-only skills:', [...frontendOnlySkills]);

// ============================================================================
// SYMBOL TYPE - Unique Identifiers and Hidden Properties
// ============================================================================

/**
 * Symbol Mental Model: Private Property Keys
 * 
 * Symbols solve the problem of property name collisions and provide
 * a way to create "hidden" properties that won't interfere with regular
 * object properties or show up in normal iteration.
 * 
 * Key characteristics:
 * - Every Symbol() call creates a unique value
 * - Symbols are not strings - they're a primitive type
 * - Symbol properties don't show up in Object.keys(), for...in, JSON.stringify
 * - Used extensively by JavaScript internals (Symbol.iterator, Symbol.toPrimitive)
 */

// Creating unique symbols for private-like properties
const INTERNAL_STATE = Symbol('internal_state');
const VALIDATION_RULES = Symbol('validation_rules');
const CACHE_KEY = Symbol('cache_key');

// Using symbols as object keys for "private" properties
class UserAccount {
    constructor(username, email) {
        this.username = username;
        this.email = email;
        
        // "Private" properties using symbols - won't conflict with user properties
        this[INTERNAL_STATE] = {
            createdAt: new Date(),
            lastLogin: null,
            sessionToken: null
        };
        
        this[VALIDATION_RULES] = {
            username: /^[a-zA-Z0-9_]{3,20}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        };
        
        this[CACHE_KEY] = `user_${Date.now()}_${Math.random()}`;
    }
    
    // Method to access "private" data
    getInternalState() {
        return this[INTERNAL_STATE]; // Only accessible if you have the symbol
    }
    
    // Method to validate using "private" rules
    validate() {
        const rules = this[VALIDATION_RULES];
        return {
            username: rules.username.test(this.username),
            email: rules.email.test(this.email)
        };
    }
}

const user = new UserAccount('john_doe', 'john@example.com');

// Regular properties are visible
console.log('Public properties:', Object.keys(user)); // ['username', 'email']

// Symbol properties are hidden from normal iteration
console.log('JSON serialization:', JSON.stringify(user)); // Only public props

// But accessible if you have the symbol reference
console.log('Internal state:', user.getInternalState());
console.log('Validation result:', user.validate());

/**
 * Well-Known Symbols - Customizing Built-in Behavior
 * 
 * JavaScript provides built-in symbols that let you customize how objects
 * behave with built-in operations like iteration, string conversion, etc.
 * These are the "hooks" into JavaScript's internal operations.
 */

// Custom iterator using Symbol.iterator
class NumberRange {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    
    // Making objects iterable with for...of loops
    *[Symbol.iterator]() {
        for (let i = this.start; i <= this.end; i++) {
            yield i; // Generator function - yields values one by one
        }
    }
    
    // Custom string conversion using Symbol.toPrimitive
    [Symbol.toPrimitive](hint) {
        // hint can be 'number', 'string', or 'default'
        if (hint === 'string') {
            return `Range(${this.start} to ${this.end})`;
        }
        if (hint === 'number') {
            return this.end - this.start + 1; // Return count of numbers
        }
        return this.toString(); // Default case
    }
    
    // Custom toString behavior
    toString() {
        return `[${this.start}...${this.end}]`;
    }
}

const range = new NumberRange(1, 5);

// Using custom iterator with for...of
console.log('Iterating range:');
for (const num of range) {
    console.log(num); // 1, 2, 3, 4, 5
}

// Using custom primitive conversion
console.log('Range as string:', String(range)); // "Range(1 to 5)"
console.log('Range as number:', Number(range)); // 5 (count of numbers)
console.log('Range in template:', `Numbers: ${range}`); // "Numbers: [1...5]"

// ============================================================================
// ENHANCED CLASS SYNTAX - Modern OOP in JavaScript
// ============================================================================

/**
 * Class vs Function Constructor: Modern Syntax Benefits
 * 
 * Classes provide:
 * - Cleaner, more readable syntax
 * - Built-in inheritance with extends/super
 * - Static methods and properties
 * - Private fields (# syntax)
 * - Method binding advantages
 * 
 * Under the hood, classes are still prototype-based, but with better ergonomics
 */

// Enhanced class with all modern features
class SmartCache {
    // Public fields (equivalent to this.property in constructor)
    maxSize = 100;
    
    // Private fields (truly private, not accessible outside class)
    #cache = new Map();
    #stats = { hits: 0, misses: 0, evictions: 0 };
    
    // Static properties (shared across all instances)
    static DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    static instances = new Set(); // Track all cache instances
    
    constructor(options = {}) {
        // Override defaults with provided options
        this.maxSize = options.maxSize || this.maxSize;
        this.ttl = options.ttl || SmartCache.DEFAULT_TTL;
        
        // Add this instance to static tracking
        SmartCache.instances.add(this);
    }
    
    // Public method with private field access
    set(key, value) {
        const timestamp = Date.now();
        const entry = { value, timestamp, accessCount: 0 };
        
        // Evict oldest entries if cache is full
        if (this.#cache.size >= this.maxSize && !this.#cache.has(key)) {
            this.#evictOldest();
        }
        
        this.#cache.set(key, entry);
        return this; // Method chaining support
    }
    
    get(key) {
        const entry = this.#cache.get(key);
        
        if (!entry) {
            this.#stats.misses++;
            return undefined;
        }
        
        // Check if entry has expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.#cache.delete(key);
            this.#stats.misses++;
            return undefined;
        }
        
        // Update access stats
        entry.accessCount++;
        this.#stats.hits++;
        return entry.value;
    }
    
    // Private method (only callable from within class)
    #evictOldest() {
        // Find oldest entry by timestamp
        let oldestKey = null;
        let oldestTimestamp = Infinity;
        
        for (const [key, entry] of this.#cache) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey !== null) {
            this.#cache.delete(oldestKey);
            this.#stats.evictions++;
        }
    }
    
    // Getter for computed properties (appears as property, not method)
    get stats() {
        // Return copy to prevent external modification
        return { ...this.#stats };
    }
    
    get size() {
        return this.#cache.size;
    }
    
    // Static method (called on class, not instance)
    static clearAllCaches() {
        for (const cache of SmartCache.instances) {
            cache.clear();
        }
        console.log(`Cleared ${SmartCache.instances.size} cache instances`);
    }
    
    // Instance method for cleanup
    clear() {
        this.#cache.clear();
        this.#stats = { hits: 0, misses: 0, evictions: 0 };
    }
    
    // Custom inspection for debugging
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `SmartCache(${this.size}/${this.maxSize} entries, ${JSON.stringify(this.stats)})`;
    }
}

// Using the enhanced class
const apiCache = new SmartCache({ maxSize: 50, ttl: 2000 }); // 2 second TTL for demo

// Method chaining
apiCache
    .set('user:123', { name: 'John', role: 'admin' })
    .set('post:456', { title: 'ES6 Features', views: 1250 })
    .set('config:app', { theme: 'dark', version: '2.1.0' });

console.log('Cache size:', apiCache.size);
console.log('User data:', apiCache.get('user:123'));

// Wait and test TTL expiration
setTimeout(() => {
    console.log('After TTL expiration:', apiCache.get('user:123')); // undefined
    console.log('Cache stats:', apiCache.stats);
}, 2100);

// Static method usage
const secondCache = new SmartCache();
SmartCache.clearAllCaches(); // Clears both apiCache and secondCache

/**
 * Class Inheritance - extends and super
 * 
 * Modern inheritance syntax makes it easy to create specialized versions
 * of base classes while maintaining proper prototype chains and method calls.
 */

class LRUCache extends SmartCache {
    // Private field for tracking access order
    #accessOrder = new Map();
    
    constructor(options = {}) {
        super(options); // Call parent constructor
        console.log('LRUCache initialized with LRU eviction strategy');
    }
    
    // Override parent method with specialized behavior
    set(key, value) {
        super.set(key, value); // Call parent method first
        
        // Update LRU tracking
        if (this._accessOrder) {
            this._accessOrder.delete(key); // Remove if exists
        }
        this._accessOrder.set(key, Date.now()); // Add at end (most recent)
        
        return this; // Maintain method chaining
    }
    
    get(key) {
        const value = super.get(key); // Call parent method
        
        if (value !== undefined) {
            // Update LRU position on access
            this._accessOrder.delete(key);
            this._accessOrder.set(key, Date.now());
        }
        
        return value;
    }
    
    // Override private method with LRU strategy
    _evictOldest() {
        // LRU: evict least recently used (first in accessOrder map)
        const lruKey = this._accessOrder.keys().next().value;
        if (lruKey !== undefined) {
            this._cache.delete(lruKey);
            this._accessOrder.delete(lruKey);
            this._stats.evictions++;
        }
    }
}

// Inheritance in action
const lruCache = new LRUCache({ maxSize: 3 });
lruCache.set('a', 1).set('b', 2).set('c', 3);
lruCache.get('a'); // Access 'a', making it most recently used
lruCache.set('d', 4); // This should evict 'b' (least recently used)

console.log('LRU Cache contents after eviction:');
console.log('a exists:', lruCache.get('a') !== undefined); // true
console.log('b exists:', lruCache.get('b') !== undefined); // false (evicted)
console.log('c exists:', lruCache.get('c') !== undefined); // true
console.log('d exists:', lruCache.get('d') !== undefined); // true

// Export for potential testing or module usage
module.exports = {
    SmartCache,
    LRUCache,
    NumberRange,
    UserAccount,
    // Helper functions for Map/Set operations
    setUnion: (setA, setB) => new Set([...setA, ...setB]),
    setIntersection: (setA, setB) => new Set([...setA].filter(x => setB.has(x))),
    setDifference: (setA, setB) => new Set([...setA].filter(x => !setB.has(x)))
};