/**
 * File: fundamentals.js
 * Topic: Proxy and Reflect API Fundamentals
 * 
 * This file explains the core concepts of JavaScript Proxy and Reflect APIs
 * with extensive commenting to understand how they enable meta-programming
 * and custom object behavior in JavaScript.
 * Focus: Understanding proxy traps, reflect methods, and basic meta-programming
 */

// ============================================================================
// PROXY API FUNDAMENTALS
// ============================================================================

/**
 * Proxy Mental Model:
 * 
 * A Proxy is a wrapper around an object that intercepts and customizes
 * operations performed on it (property access, assignment, enumeration, etc.)
 * 
 * Key Components:
 * - TARGET: The original object being proxied
 * - HANDLER: Object containing traps (intercepted operations)
 * - TRAPS: Methods that provide property access (like getters/setters but more powerful)
 * 
 * Mental Model: Think of Proxy as a "security guard" that stands between
 * your code and an object, deciding how operations should be handled.
 */

console.log('=== PROXY AND REFLECT API FUNDAMENTALS ===\n');

function demonstrateProxyBasics() {
    console.log('1. Basic Proxy Creation and Usage:');
    
    // Simple target object
    const targetObject = {
        name: 'JavaScript',
        version: 2023,
        features: ['classes', 'modules', 'async'],
        _private: 'This should be private'
    };
    
    console.log('  Original target object:', targetObject);
    
    // Basic proxy with get and set traps
    const basicProxy = new Proxy(targetObject, {
        // GET TRAP: Intercepts property access (obj.prop, obj['prop'])
        get: function(target, property, receiver) {
            console.log(`    GET trap: accessing property '${String(property)}'`);
            
            // Custom behavior for private properties
            if (String(property).startsWith('_')) {
                console.log(`      Blocking access to private property: ${String(property)}`);
                return undefined; // Hide private properties
            }
            
            // Custom behavior for specific properties
            if (property === 'description') {
                return `${target.name} version ${target.version} with ${target.features.length} features`;
            }
            
            // Default behavior: return actual property value
            return target[property];
        },
        
        // SET TRAP: Intercepts property assignment (obj.prop = value)
        set: function(target, property, value, receiver) {
            console.log(`    SET trap: setting property '${String(property)}' to ${value}`);
            
            // Validation example: prevent modification of version
            if (property === 'version' && typeof value !== 'number') {
                console.log(`      Validation failed: version must be a number`);
                return false; // Reject the assignment
            }
            
            // Prevent creation of private properties from outside
            if (String(property).startsWith('_')) {
                console.log(`      Blocked: cannot set private property ${String(property)}`);
                return false;
            }
            
            // Log changes to audit trail
            if (target[property] !== value) {
                console.log(`      Change detected: ${String(property)} changed from ${target[property]} to ${value}`);
            }
            
            // Default behavior: set the property
            target[property] = value;
            return true; // Indicate success
        }
    });
    
    // Test the proxy behavior
    console.log('  Testing proxy behavior:');
    
    // Normal property access
    console.log(`    name: ${basicProxy.name}`); // Normal access
    console.log(`    _private: ${basicProxy._private}`); // Blocked access
    console.log(`    description: ${basicProxy.description}`); // Computed property
    
    // Property assignment
    basicProxy.author = 'Brendan Eich'; // Allowed
    basicProxy.version = '2024'; // Should be rejected (string instead of number)
    basicProxy.version = 2024; // Should be allowed
    basicProxy._secret = 'hidden'; // Should be blocked
    
    console.log('  Final target state:', targetObject);
    
    /**
     * Key Proxy Insights:
     * 1. Proxy intercepts operations, not just property access
     * 2. Handler methods (traps) define custom behavior
     * 3. Return values from traps control the operation's success
     * 4. Target object can be modified through the proxy
     * 5. Proxy enables virtual properties and validation
     */
}

demonstrateProxyBasics();

// ============================================================================
// PROXY TRAPS OVERVIEW
// ============================================================================

/**
 * Comprehensive Proxy Traps:
 * 
 * Proxy supports 13 different traps for intercepting various operations:
 * - Fundamental traps: get, set, has, deleteProperty
 * - Function traps: apply, construct
 * - Property descriptor traps: getOwnPropertyDescriptor, defineProperty
 * - Enumeration traps: enumerate, ownKeys
 * - Prototype traps: getPrototypeOf, setPrototypeOf
 * - Extensibility traps: isExtensible, preventExtensions
 */

function demonstrateProxyTraps() {
    console.log('\n2. Comprehensive Proxy Traps:');
    
    // Target object for trap demonstration
    const target = {
        regularProp: 'normal value',
        methodProp: function() { return 'method called'; }
    };
    
    const comprehensiveProxy = new Proxy(target, {
        // Property access trap
        get(target, prop, receiver) {
            console.log(`    GET: ${String(prop)}`);
            return Reflect.get(target, prop, receiver);
        },
        
        // Property assignment trap
        set(target, prop, value, receiver) {
            console.log(`    SET: ${String(prop)} = ${value}`);
            return Reflect.set(target, prop, value, receiver);
        },
        
        // Property existence check trap (in operator, hasOwnProperty)
        has(target, prop) {
            console.log(`    HAS: checking if '${String(prop)}' exists`);
            return Reflect.has(target, prop);
        },
        
        // Property deletion trap (delete operator)
        deleteProperty(target, prop) {
            console.log(`    DELETE: deleting property '${String(prop)}'`);
            
            // Prevent deletion of essential properties
            if (prop === 'regularProp') {
                console.log(`      Prevention: Cannot delete essential property`);
                return false;
            }
            
            return Reflect.deleteProperty(target, prop);
        },
        
        // Property enumeration trap (Object.keys, for...in)
        ownKeys(target) {
            console.log(`    OWN_KEYS: enumerating properties`);
            const keys = Reflect.ownKeys(target);
            console.log(`      Found keys: [${keys.join(', ')}]`);
            return keys;
        },
        
        // Property descriptor trap (Object.getOwnPropertyDescriptor)
        getOwnPropertyDescriptor(target, prop) {
            console.log(`    GET_DESCRIPTOR: ${String(prop)}`);
            return Reflect.getOwnPropertyDescriptor(target, prop);
        },
        
        // Property definition trap (Object.defineProperty)
        defineProperty(target, prop, descriptor) {
            console.log(`    DEFINE_PROPERTY: ${String(prop)}`);
            console.log(`      Descriptor:`, descriptor);
            return Reflect.defineProperty(target, prop, descriptor);
        },
        
        // Function call trap (when proxy is called as function)
        apply(target, thisArg, argumentsList) {
            console.log(`    APPLY: function called with args [${argumentsList.join(', ')}]`);
            return Reflect.apply(target, thisArg, argumentsList);
        },
        
        // Constructor call trap (new operator)
        construct(target, argumentsList, newTarget) {
            console.log(`    CONSTRUCT: constructor called with args [${argumentsList.join(', ')}]`);
            return Reflect.construct(target, argumentsList, newTarget);
        },
        
        // Prototype access trap (Object.getPrototypeOf)
        getPrototypeOf(target) {
            console.log(`    GET_PROTOTYPE: getting prototype`);
            return Reflect.getPrototypeOf(target);
        },
        
        // Prototype setting trap (Object.setPrototypeOf)
        setPrototypeOf(target, prototype) {
            console.log(`    SET_PROTOTYPE: setting new prototype`);
            return Reflect.setPrototypeOf(target, prototype);
        },
        
        // Extensibility check trap (Object.isExtensible)
        isExtensible(target) {
            console.log(`    IS_EXTENSIBLE: checking extensibility`);
            return Reflect.isExtensible(target);
        },
        
        // Extensibility prevention trap (Object.preventExtensions)
        preventExtensions(target) {
            console.log(`    PREVENT_EXTENSIONS: preventing extensions`);
            return Reflect.preventExtensions(target);
        }
    });
    
    // Test various trap triggers
    console.log('  Testing various operations that trigger traps:');
    
    // Property operations
    comprehensiveProxy.newProp = 'new value'; // SET trap
    console.log(`    Reading newProp: ${comprehensiveProxy.newProp}`); // GET trap
    console.log(`    Has regularProp: ${'regularProp' in comprehensiveProxy}`); // HAS trap
    
    // Enumeration
    console.log(`    Keys: [${Object.keys(comprehensiveProxy).join(', ')}]`); // OWN_KEYS trap
    
    // Property deletion
    delete comprehensiveProxy.newProp; // DELETE trap (should work)
    delete comprehensiveProxy.regularProp; // DELETE trap (should be prevented)
    
    // Property descriptor operations
    Object.defineProperty(comprehensiveProxy, 'configuredProp', {
        value: 'configured',
        writable: true,
        enumerable: true,
        configurable: true
    }); // DEFINE_PROPERTY trap
    
    const descriptor = Object.getOwnPropertyDescriptor(comprehensiveProxy, 'configuredProp');
    console.log(`    Configured property descriptor:`, descriptor); // GET_DESCRIPTOR trap
    
    /**
     * Trap Insights:
     * 1. Each trap corresponds to a built-in operation
     * 2. Traps must maintain object invariants (consistency rules)
     * 3. Reflect API provides default implementations
     * 4. Traps can prevent, modify, or enhance operations
     * 5. Some traps have specific return value requirements
     */
}

demonstrateProxyTraps();

// ============================================================================
// REFLECT API FUNDAMENTALS
// ============================================================================

/**
 * Reflect API Mental Model:
 * 
 * Reflect is a built-in object that provides methods for interceptable
 * JavaScript operations. It's the "default handler" for Proxy traps.
 * 
 * Benefits of Reflect:
 * - Provides functional approach to object operations
 * - Returns sensible return values (boolean for success/failure)
 * - Maintains proper this binding
 * - Pairs perfectly with Proxy traps
 * 
 * Think of Reflect as the "standard toolkit" for meta-programming operations.
 */

function demonstrateReflectAPI() {
    console.log('\n3. Reflect API Methods:');
    
    const targetObj = {
        name: 'Reflect Demo',
        value: 42,
        method: function(arg) {
            return `Method called with: ${arg}`;
        }
    };
    
    console.log('  Original object:', targetObj);
    
    // Reflect.get - Get property value
    console.log('  Reflect.get operations:');
    const nameValue = Reflect.get(targetObj, 'name');
    console.log(`    Reflect.get(obj, 'name'): ${nameValue}`);
    
    // Reflect.set - Set property value
    console.log('  Reflect.set operations:');
    const setSuccess = Reflect.set(targetObj, 'newProp', 'new value');
    console.log(`    Reflect.set(obj, 'newProp', 'new value'): ${setSuccess}`);
    console.log(`    Object after set:`, targetObj);
    
    // Reflect.has - Check property existence
    console.log('  Reflect.has operations:');
    const hasName = Reflect.has(targetObj, 'name');
    const hasNonExistent = Reflect.has(targetObj, 'nonexistent');
    console.log(`    Reflect.has(obj, 'name'): ${hasName}`);
    console.log(`    Reflect.has(obj, 'nonexistent'): ${hasNonExistent}`);
    
    // Reflect.deleteProperty - Delete property
    console.log('  Reflect.deleteProperty operations:');
    const deleteSuccess = Reflect.deleteProperty(targetObj, 'newProp');
    console.log(`    Reflect.deleteProperty(obj, 'newProp'): ${deleteSuccess}`);
    console.log(`    Object after delete:`, targetObj);
    
    // Reflect.ownKeys - Get all own property keys
    console.log('  Reflect.ownKeys operations:');
    const keys = Reflect.ownKeys(targetObj);
    console.log(`    Reflect.ownKeys(obj): [${keys.join(', ')}]`);
    
    // Reflect.defineProperty - Define property with descriptor
    console.log('  Reflect.defineProperty operations:');
    const defineSuccess = Reflect.defineProperty(targetObj, 'readOnlyProp', {
        value: 'cannot change',
        writable: false,
        enumerable: true,
        configurable: false
    });
    console.log(`    Define read-only property success: ${defineSuccess}`);
    
    // Try to modify read-only property
    const modifySuccess = Reflect.set(targetObj, 'readOnlyProp', 'new value');
    console.log(`    Attempt to modify read-only property: ${modifySuccess}`);
    
    // Reflect.getOwnPropertyDescriptor - Get property descriptor
    console.log('  Reflect.getOwnPropertyDescriptor operations:');
    const descriptor = Reflect.getOwnPropertyDescriptor(targetObj, 'readOnlyProp');
    console.log(`    Descriptor for readOnlyProp:`, descriptor);
    
    // Reflect.apply - Apply function with specific this and arguments
    console.log('  Reflect.apply operations:');
    const applyResult = Reflect.apply(targetObj.method, targetObj, ['test argument']);
    console.log(`    Reflect.apply result: ${applyResult}`);
    
    // Reflect with arrow function (different this binding)
    const arrowMethod = (arg) => `Arrow method: ${arg}, this.name: ${this?.name || 'undefined'}`;
    const arrowResult = Reflect.apply(arrowMethod, targetObj, ['arrow test']);
    console.log(`    Arrow function apply result: ${arrowResult}`);
    
    // Reflect.construct - Create instance using constructor
    console.log('  Reflect.construct operations:');
    
    function TestConstructor(name, value) {
        this.name = name;
        this.value = value;
        this.created = Date.now();
    }
    
    const constructedObj = Reflect.construct(TestConstructor, ['Constructed', 100]);
    console.log(`    Reflect.construct result:`, constructedObj);
    
    // Reflect.getPrototypeOf and setPrototypeOf
    console.log('  Reflect prototype operations:');
    const prototype = Reflect.getPrototypeOf(targetObj);
    console.log(`    Current prototype: ${prototype.constructor.name}`);
    
    const customProto = { customMethod: () => 'custom behavior' };
    const setProtoSuccess = Reflect.setPrototypeOf(targetObj, customProto);
    console.log(`    Set custom prototype success: ${setProtoSuccess}`);
    console.log(`    Custom method available: ${typeof targetObj.customMethod}`);
    
    // Reflect.isExtensible and preventExtensions
    console.log('  Reflect extensibility operations:');
    const isExtensible = Reflect.isExtensible(targetObj);
    console.log(`    Object is extensible: ${isExtensible}`);
    
    const preventSuccess = Reflect.preventExtensions(targetObj);
    console.log(`    Prevent extensions success: ${preventSuccess}`);
    console.log(`    Object is extensible after prevention: ${Reflect.isExtensible(targetObj)}`);
    
    /**
     * Reflect API Benefits:
     * 
     * 1. Consistent API: All methods return success/failure status
     * 2. Functional style: Can be used with functional programming patterns
     * 3. Proper this binding: Maintains correct context
     * 4. Error handling: Returns boolean instead of throwing errors
     * 5. Proxy integration: Perfect companion for Proxy traps
     * 
     * Comparison with Traditional Approaches:
     * - obj.prop vs Reflect.get(obj, 'prop')
     * - obj.prop = value vs Reflect.set(obj, 'prop', value)
     * - delete obj.prop vs Reflect.deleteProperty(obj, 'prop')
     * - 'prop' in obj vs Reflect.has(obj, 'prop')
     * - Object.keys(obj) vs Reflect.ownKeys(obj)
     */
}

demonstrateReflectAPI();

// ============================================================================
// PROXY AND REFLECT WORKING TOGETHER
// ============================================================================

/**
 * Proxy + Reflect Integration:
 * 
 * Reflect methods are designed to match Proxy trap signatures exactly.
 * This makes it easy to:
 * - Implement default behavior in traps
 * - Add logging/monitoring without changing behavior
 * - Selectively override specific operations
 */

function demonstrateProxyReflectIntegration() {
    console.log('\n4. Proxy and Reflect Integration:');
    
    const target = {
        count: 0,
        items: ['a', 'b', 'c'],
        settings: { enabled: true }
    };
    
    // Proxy that logs all operations but maintains default behavior
    const loggingProxy = new Proxy(target, {
        get(target, prop, receiver) {
            console.log(`    LOG: Getting property '${String(prop)}'`);
            
            // Use Reflect for default behavior
            const result = Reflect.get(target, prop, receiver);
            console.log(`      Value: ${typeof result === 'object' ? JSON.stringify(result) : result}`);
            return result;
        },
        
        set(target, prop, value, receiver) {
            console.log(`    LOG: Setting property '${String(prop)}' to ${JSON.stringify(value)}`);
            
            // Custom validation before setting
            if (prop === 'count' && typeof value !== 'number') {
                console.log(`      VALIDATION: count must be a number, got ${typeof value}`);
                return false;
            }
            
            // Use Reflect for default behavior
            const success = Reflect.set(target, prop, value, receiver);
            console.log(`      Set operation ${success ? 'succeeded' : 'failed'}`);
            return success;
        },
        
        has(target, prop) {
            console.log(`    LOG: Checking existence of property '${String(prop)}'`);
            const exists = Reflect.has(target, prop);
            console.log(`      Exists: ${exists}`);
            return exists;
        },
        
        deleteProperty(target, prop) {
            console.log(`    LOG: Attempting to delete property '${String(prop)}'`);
            
            // Prevent deletion of critical properties
            if (['count', 'items'].includes(prop)) {
                console.log(`      BLOCKED: Cannot delete critical property '${String(prop)}'`);
                return false;
            }
            
            const success = Reflect.deleteProperty(target, prop);
            console.log(`      Delete operation ${success ? 'succeeded' : 'failed'}`);
            return success;
        },
        
        ownKeys(target) {
            console.log(`    LOG: Enumerating own keys`);
            const keys = Reflect.ownKeys(target);
            console.log(`      Keys: [${keys.join(', ')}]`);
            return keys;
        }
    });
    
    // Test the integrated proxy
    console.log('  Testing Proxy + Reflect integration:');
    
    // Property access
    const countValue = loggingProxy.count;
    const itemsValue = loggingProxy.items;
    
    // Property assignment
    loggingProxy.count = 5; // Valid
    loggingProxy.count = 'invalid'; // Should be blocked
    loggingProxy.newProp = 'new value'; // Should work
    
    // Property existence checks
    const hasCount = 'count' in loggingProxy;
    const hasNonExistent = 'nonexistent' in loggingProxy;
    
    // Property enumeration
    const keys = Object.keys(loggingProxy);
    
    // Property deletion
    delete loggingProxy.newProp; // Should work
    delete loggingProxy.count; // Should be blocked
    
    console.log('  Final target state:', target);
    
    /**
     * Integration Benefits:
     * 
     * 1. Default behavior: Reflect provides correct default implementations
     * 2. Consistency: Matching signatures make code predictable
     * 3. Error handling: Reflect methods return boolean success indicators
     * 4. Performance: No need to reimplement standard operations
     * 5. Maintainability: Clear separation of custom vs default behavior
     * 
     * Common Patterns:
     * - Logging: Add logging without changing behavior
     * - Validation: Check values before applying default behavior
     * - Filtering: Control which operations are allowed
     * - Transformation: Modify values while maintaining semantics
     */
}

demonstrateProxyReflectIntegration();

// Export fundamental utilities for learning and testing
module.exports = {
    // Basic proxy factory
    createBasicProxy: function(target, options = {}) {
        const { logAccess = false, validateTypes = false, blockPrivate = true } = options;
        
        return new Proxy(target, {
            get(target, prop, receiver) {
                if (logAccess) console.log(`GET: ${String(prop)}`);
                
                if (blockPrivate && String(prop).startsWith('_')) {
                    return undefined;
                }
                
                return Reflect.get(target, prop, receiver);
            },
            
            set(target, prop, value, receiver) {
                if (logAccess) console.log(`SET: ${String(prop)} = ${value}`);
                
                if (blockPrivate && String(prop).startsWith('_')) {
                    return false;
                }
                
                if (validateTypes && target[prop] !== undefined) {
                    const existingType = typeof target[prop];
                    const newType = typeof value;
                    if (existingType !== newType) {
                        console.warn(`Type mismatch: ${existingType} vs ${newType}`);
                        return false;
                    }
                }
                
                return Reflect.set(target, prop, value, receiver);
            }
        });
    },
    
    // Logging proxy factory
    createLoggingProxy: function(target, prefix = 'PROXY') {
        return new Proxy(target, {
            get(target, prop, receiver) {
                console.log(`${prefix} GET: ${String(prop)}`);
                return Reflect.get(target, prop, receiver);
            },
            
            set(target, prop, value, receiver) {
                console.log(`${prefix} SET: ${String(prop)} = ${value}`);
                return Reflect.set(target, prop, value, receiver);
            }
        });
    },
    
    // Validation proxy factory
    createValidationProxy: function(target, validators = {}) {
        return new Proxy(target, {
            set(target, prop, value, receiver) {
                const validator = validators[prop];
                if (validator && !validator(value)) {
                    console.error(`Validation failed for ${String(prop)}: ${value}`);
                    return false;
                }
                
                return Reflect.set(target, prop, value, receiver);
            }
        });
    },
    
    // Reflect utility functions
    reflectUtils: {
        safeGet: (obj, prop, defaultValue = undefined) => {
            return Reflect.has(obj, prop) ? Reflect.get(obj, prop) : defaultValue;
        },
        
        safeSet: (obj, prop, value) => {
            try {
                return Reflect.set(obj, prop, value);
            } catch (error) {
                console.error(`Failed to set ${String(prop)}:`, error.message);
                return false;
            }
        },
        
        getAllProperties: (obj) => {
            const props = [];
            let current = obj;
            
            while (current && current !== Object.prototype) {
                props.push(...Reflect.ownKeys(current));
                current = Reflect.getPrototypeOf(current);
            }
            
            return [...new Set(props)]; // Remove duplicates
        }
    }
};