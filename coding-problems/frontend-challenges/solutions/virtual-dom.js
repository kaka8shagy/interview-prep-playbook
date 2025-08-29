/**
 * Virtual DOM Serialization and Deserialization
 * 
 * This module implements comprehensive virtual DOM serialization and deserialization
 * with support for React-like virtual nodes, component hierarchies, and complex structures.
 * 
 * Key concepts covered:
 * - Virtual DOM representation and structure
 * - JSON serialization with circular reference handling
 * - Component and element differentiation
 * - Props and children serialization
 * - Event handler serialization strategies
 * - Performance optimization techniques
 * - Cross-platform compatibility
 * 
 * Learning objectives:
 * - Understand virtual DOM internal structure
 * - Master serialization patterns for complex objects
 * - Learn circular reference detection and handling
 * - Implement robust deserialization with validation
 * - Handle edge cases in virtual DOM operations
 */

// =============================================================================
// APPROACH 1: Basic Virtual DOM Serialization
// =============================================================================

/**
 * Basic virtual DOM node structure
 * Represents the minimal structure needed for virtual DOM operations
 * 
 * Structure follows React's virtual node pattern:
 * - type: component type (string for HTML elements, function/class for components)
 * - props: properties passed to the component (including children)
 * - key: unique identifier for reconciliation
 * - ref: reference to actual DOM element
 */
class VNode {
  constructor(type, props = {}, key = null, ref = null) {
    this.type = type;           // 'div', 'span', or component function/class
    this.props = props || {};   // attributes and children
    this.key = key;            // for list reconciliation
    this.ref = ref;            // DOM reference
    this.$$vnode = true;       // marker to identify virtual nodes
    
    // Internal properties for reconciliation
    this._owner = null;        // component that created this node
    this._store = {};         // internal store for framework data
  }
}

/**
 * Basic serialization approach
 * Converts virtual DOM tree to JSON string with basic handling
 * 
 * Limitations:
 * - Cannot serialize functions (event handlers, components)
 * - No circular reference detection
 * - Basic error handling
 * 
 * Use case: Simple virtual DOM trees without complex components
 */
function basicVDOMSerialize(vnode) {
  if (!vnode || typeof vnode !== 'object') {
    return JSON.stringify(vnode);
  }
  
  // Create serializable representation
  // We exclude functions and non-serializable properties
  const serializable = {
    type: typeof vnode.type === 'string' ? vnode.type : '[Component]',
    props: {},
    key: vnode.key,
    $$vnode: true
  };
  
  // Serialize props, excluding functions
  if (vnode.props) {
    for (const [key, value] of Object.entries(vnode.props)) {
      if (typeof value === 'function') {
        // Store function names for later reference
        serializable.props[key] = `[Function: ${value.name || 'anonymous'}]`;
      } else if (Array.isArray(value)) {
        // Recursively serialize children array
        serializable.props[key] = value.map(child => 
          child && child.$$vnode ? basicVDOMSerialize(child) : child
        );
      } else if (value && value.$$vnode) {
        // Recursively serialize virtual node children
        serializable.props[key] = basicVDOMSerialize(value);
      } else {
        serializable.props[key] = value;
      }
    }
  }
  
  return JSON.stringify(serializable);
}

/**
 * Basic deserialization approach
 * Converts JSON string back to virtual DOM structure
 * 
 * Creates new VNode instances from serialized data
 * Function placeholders remain as strings (limitation)
 */
function basicVDOMDeserialize(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed || !parsed.$$vnode) {
      return parsed; // Not a virtual node
    }
    
    // Reconstruct VNode
    const vnode = new VNode(parsed.type, {}, parsed.key);
    
    // Deserialize props
    if (parsed.props) {
      for (const [key, value] of Object.entries(parsed.props)) {
        if (Array.isArray(value)) {
          // Recursively deserialize children
          vnode.props[key] = value.map(child =>
            typeof child === 'object' && child.$$vnode 
              ? basicVDOMDeserialize(JSON.stringify(child))
              : child
          );
        } else if (typeof value === 'object' && value && value.$$vnode) {
          // Recursively deserialize virtual node children
          vnode.props[key] = basicVDOMDeserialize(JSON.stringify(value));
        } else {
          vnode.props[key] = value;
        }
      }
    }
    
    return vnode;
  } catch (error) {
    throw new Error(`Deserialization failed: ${error.message}`);
  }
}

// =============================================================================
// APPROACH 2: Advanced Serialization with Circular Reference Detection
// =============================================================================

/**
 * Advanced serialization with comprehensive handling
 * Supports circular references, custom serializers, and component handling
 * 
 * Features:
 * - Circular reference detection and handling
 * - Custom serialization strategies for different node types
 * - Component metadata preservation
 * - Memory efficient serialization
 * - Extensible serializer system
 */
class AdvancedVDOMSerializer {
  constructor(options = {}) {
    this.options = {
      maxDepth: options.maxDepth || 100,
      includePrivateProps: options.includePrivateProps || false,
      customSerializers: options.customSerializers || new Map(),
      preserveCircularRefs: options.preserveCircularRefs || true,
      ...options
    };
    
    // Track circular references during serialization
    this.circularRefs = new WeakMap();
    this.refCounter = 0;
    this.refMap = new Map();
  }
  
  /**
   * Main serialization method
   * Handles complex virtual DOM trees with circular references
   */
  serialize(vnode, depth = 0) {
    // Prevent infinite recursion
    if (depth > this.options.maxDepth) {
      return '[Max Depth Exceeded]';
    }
    
    // Handle primitive values
    if (vnode === null || vnode === undefined) return vnode;
    if (typeof vnode !== 'object') return vnode;
    
    // Check for circular references
    if (this.circularRefs.has(vnode)) {
      const refId = this.circularRefs.get(vnode);
      return { $$ref: refId };
    }
    
    // Mark this object to detect future circular references
    const refId = `ref_${++this.refCounter}`;
    this.circularRefs.set(vnode, refId);
    
    // Handle arrays (like children arrays)
    if (Array.isArray(vnode)) {
      const serialized = vnode.map(child => this.serialize(child, depth + 1));
      this.refMap.set(refId, serialized);
      return serialized;
    }
    
    // Handle virtual DOM nodes
    if (vnode.$$vnode) {
      return this.serializeVNode(vnode, depth);
    }
    
    // Handle regular objects
    return this.serializeObject(vnode, depth);
  }
  
  /**
   * Specialized virtual node serialization
   * Handles component types, props, and special virtual node properties
   */
  serializeVNode(vnode, depth) {
    const serialized = {
      $$vnode: true,
      $$refId: this.circularRefs.get(vnode),
      type: this.serializeType(vnode.type),
      key: vnode.key,
      props: {}
    };
    
    // Serialize props with special handling for children
    if (vnode.props) {
      for (const [key, value] of Object.entries(vnode.props)) {
        // Skip private properties unless explicitly included
        if (key.startsWith('_') && !this.options.includePrivateProps) {
          continue;
        }
        
        serialized.props[key] = this.serializeProp(key, value, depth + 1);
      }
    }
    
    // Store in reference map for circular reference resolution
    this.refMap.set(serialized.$$refId, serialized);
    
    return serialized;
  }
  
  /**
   * Serialize component types (functions, classes, strings)
   * Preserves type information while handling non-serializable types
   */
  serializeType(type) {
    if (typeof type === 'string') {
      return type; // HTML element type
    }
    
    if (typeof type === 'function') {
      // Component function or class
      return {
        $$component: true,
        name: type.name || 'Anonymous',
        displayName: type.displayName,
        // For class components, we can detect if it extends React.Component
        isClassComponent: type.prototype && type.prototype.render,
        // Store function string for debugging (optional)
        source: this.options.includeSource ? type.toString() : undefined
      };
    }
    
    // Handle other types (symbols, etc.)
    return `[${typeof type}: ${String(type)}]`;
  }
  
  /**
   * Serialize individual props with type-specific handling
   * Special treatment for functions, objects, and arrays
   */
  serializeProp(key, value, depth) {
    // Handle functions (event handlers, render props)
    if (typeof value === 'function') {
      return {
        $$function: true,
        name: value.name || 'anonymous',
        // Store function metadata for reconstruction hints
        isArrow: !value.prototype,
        isAsync: value.constructor.name === 'AsyncFunction',
        paramCount: value.length
      };
    }
    
    // Handle React elements/virtual nodes
    if (value && value.$$vnode) {
      return this.serialize(value, depth);
    }
    
    // Handle arrays (children, prop arrays)
    if (Array.isArray(value)) {
      return value.map(item => this.serialize(item, depth));
    }
    
    // Handle regular objects
    if (value && typeof value === 'object') {
      return this.serializeObject(value, depth);
    }
    
    // Primitive values
    return value;
  }
  
  /**
   * Serialize regular objects with circular reference handling
   */
  serializeObject(obj, depth) {
    const serialized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = this.serialize(value, depth + 1);
    }
    
    return serialized;
  }
  
  /**
   * Convert to JSON string with reference map for circular resolution
   */
  toJSON() {
    return JSON.stringify({
      tree: this.serialize.apply(this, arguments),
      refs: Object.fromEntries(this.refMap)
    });
  }
}

/**
 * Advanced deserializer with circular reference resolution
 * Reconstructs complex virtual DOM trees from serialized data
 */
class AdvancedVDOMDeserializer {
  constructor(options = {}) {
    this.options = {
      componentRegistry: options.componentRegistry || new Map(),
      functionRegistry: options.functionRegistry || new Map(),
      ...options
    };
    
    this.refMap = new Map();
  }
  
  /**
   * Main deserialization method
   * Handles circular references and complex structures
   */
  deserialize(serializedData) {
    if (typeof serializedData === 'string') {
      serializedData = JSON.parse(serializedData);
    }
    
    // Handle advanced serialization format with reference map
    if (serializedData.tree && serializedData.refs) {
      // Populate reference map first
      for (const [refId, refData] of Object.entries(serializedData.refs)) {
        this.refMap.set(refId, refData);
      }
      
      return this.deserializeNode(serializedData.tree);
    }
    
    // Handle simple serialization format
    return this.deserializeNode(serializedData);
  }
  
  /**
   * Deserialize individual nodes with type checking
   */
  deserializeNode(node) {
    if (node === null || node === undefined) return node;
    if (typeof node !== 'object') return node;
    
    // Handle circular reference placeholders
    if (node.$$ref) {
      const referenced = this.refMap.get(node.$$ref);
      return referenced ? this.deserializeNode(referenced) : null;
    }
    
    // Handle arrays
    if (Array.isArray(node)) {
      return node.map(item => this.deserializeNode(item));
    }
    
    // Handle virtual DOM nodes
    if (node.$$vnode) {
      return this.deserializeVNode(node);
    }
    
    // Handle regular objects
    const obj = {};
    for (const [key, value] of Object.entries(node)) {
      obj[key] = this.deserializeNode(value);
    }
    
    return obj;
  }
  
  /**
   * Deserialize virtual DOM nodes with component reconstruction
   */
  deserializeVNode(serialized) {
    // Reconstruct component type
    const type = this.deserializeType(serialized.type);
    
    // Create new virtual node
    const vnode = new VNode(type, {}, serialized.key);
    
    // Deserialize props
    if (serialized.props) {
      for (const [key, value] of Object.entries(serialized.props)) {
        vnode.props[key] = this.deserializeProp(key, value);
      }
    }
    
    return vnode;
  }
  
  /**
   * Reconstruct component types from serialized data
   */
  deserializeType(serializedType) {
    if (typeof serializedType === 'string') {
      return serializedType; // HTML element
    }
    
    if (serializedType && serializedType.$$component) {
      // Try to find component in registry
      const component = this.options.componentRegistry.get(serializedType.name);
      if (component) {
        return component;
      }
      
      // Return placeholder component if not found
      return function PlaceholderComponent(props) {
        return new VNode('div', {
          ...props,
          'data-component': serializedType.name,
          'data-missing': 'true'
        });
      };
    }
    
    return 'unknown';
  }
  
  /**
   * Deserialize props with function reconstruction
   */
  deserializeProp(key, value) {
    if (value && value.$$function) {
      // Try to find function in registry
      const func = this.options.functionRegistry.get(value.name);
      if (func) return func;
      
      // Return placeholder function
      return function placeholder() {
        console.warn(`Function ${value.name} not found in registry`);
      };
    }
    
    return this.deserializeNode(value);
  }
}

// =============================================================================
// APPROACH 3: React-Specific Virtual DOM Serialization
// =============================================================================

/**
 * React-specific serialization that handles React elements
 * Includes support for React's internal structure and hooks
 * 
 * Features:
 * - React.createElement output handling
 * - Component props and state serialization
 * - Hooks and context serialization strategies
 * - React DevTools compatibility
 * - Fragment and portal handling
 */
class ReactVDOMSerializer {
  constructor() {
    // React element type symbols (if available)
    this.REACT_ELEMENT_TYPE = (typeof Symbol !== 'undefined' && Symbol.for) 
      ? Symbol.for('react.element') 
      : 0xeac7;
    
    this.REACT_FRAGMENT_TYPE = (typeof Symbol !== 'undefined' && Symbol.for)
      ? Symbol.for('react.fragment')
      : 0xeacb;
  }
  
  /**
   * Serialize React elements with proper type handling
   * Maintains React's internal structure while making it serializable
   */
  serialize(element) {
    if (!element || typeof element !== 'object') {
      return element;
    }
    
    // Handle React elements
    if (this.isReactElement(element)) {
      return this.serializeReactElement(element);
    }
    
    // Handle arrays of elements
    if (Array.isArray(element)) {
      return element.map(child => this.serialize(child));
    }
    
    return element;
  }
  
  /**
   * Check if object is a React element
   * Uses React's internal $$typeof property
   */
  isReactElement(obj) {
    return obj.$$typeof === this.REACT_ELEMENT_TYPE;
  }
  
  /**
   * Serialize React element with all properties
   * Preserves React-specific metadata
   */
  serializeReactElement(element) {
    const serialized = {
      $$reactElement: true,
      type: this.serializeComponentType(element.type),
      key: element.key,
      ref: element.ref ? '[Ref]' : null,
      props: {}
    };
    
    // Serialize props, including children
    if (element.props) {
      for (const [key, value] of Object.entries(element.props)) {
        if (key === 'children') {
          serialized.props.children = this.serializeChildren(value);
        } else {
          serialized.props[key] = this.serializeProp(value);
        }
      }
    }
    
    return serialized;
  }
  
  /**
   * Serialize component types with React-specific handling
   */
  serializeComponentType(type) {
    // Handle Fragment
    if (type === this.REACT_FRAGMENT_TYPE) {
      return { $$fragment: true };
    }
    
    // Handle string types (HTML elements)
    if (typeof type === 'string') {
      return type;
    }
    
    // Handle function/class components
    if (typeof type === 'function') {
      return {
        $$component: true,
        name: type.displayName || type.name || 'Anonymous',
        isClassComponent: type.prototype && type.prototype.isReactComponent,
        // Store component metadata for debugging
        contextTypes: type.contextTypes ? Object.keys(type.contextTypes) : [],
        propTypes: type.propTypes ? Object.keys(type.propTypes) : []
      };
    }
    
    return `[${typeof type}]`;
  }
  
  /**
   * Serialize children with proper React children handling
   * React children can be arrays, single elements, or functions
   */
  serializeChildren(children) {
    if (children === null || children === undefined) {
      return children;
    }
    
    // Handle single child
    if (!Array.isArray(children)) {
      return this.serialize(children);
    }
    
    // Handle array of children
    return children.map(child => this.serialize(child));
  }
  
  /**
   * Serialize individual props with React-specific types
   */
  serializeProp(value) {
    if (typeof value === 'function') {
      return {
        $$function: true,
        name: value.name || 'anonymous'
      };
    }
    
    if (this.isReactElement(value)) {
      return this.serialize(value);
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.serializeProp(item));
    }
    
    if (value && typeof value === 'object') {
      const serialized = {};
      for (const [key, val] of Object.entries(value)) {
        serialized[key] = this.serializeProp(val);
      }
      return serialized;
    }
    
    return value;
  }
}

// =============================================================================
// APPROACH 4: Streaming Virtual DOM Serialization
// =============================================================================

/**
 * Streaming serialization for large virtual DOM trees
 * Processes nodes incrementally to handle memory constraints
 * 
 * Use cases:
 * - Server-side rendering with large trees
 * - Progressive hydration scenarios
 * - Memory-constrained environments
 * - Real-time virtual DOM streaming
 */
class StreamingVDOMSerializer {
  constructor(options = {}) {
    this.options = {
      chunkSize: options.chunkSize || 1000,
      onChunk: options.onChunk || (() => {}),
      onComplete: options.onComplete || (() => {}),
      ...options
    };
    
    this.buffer = [];
    this.processedCount = 0;
  }
  
  /**
   * Start streaming serialization
   * Processes nodes in chunks to prevent blocking
   */
  async serialize(vnode) {
    return new Promise((resolve, reject) => {
      try {
        this.processNodeStream(vnode, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Process nodes in streaming fashion
   * Uses setTimeout to yield control and prevent blocking
   */
  processNodeStream(node, resolve, reject) {
    const processChunk = () => {
      let processedInChunk = 0;
      
      while (processedInChunk < this.options.chunkSize && node) {
        try {
          const serialized = this.serializeNode(node);
          this.buffer.push(serialized);
          this.processedCount++;
          processedInChunk++;
          
          // Emit chunk if buffer is full
          if (this.buffer.length >= this.options.chunkSize) {
            this.options.onChunk([...this.buffer]);
            this.buffer.length = 0;
          }
          
          // Move to next node (simplified for example)
          node = this.getNextNode(node);
          
        } catch (error) {
          reject(error);
          return;
        }
      }
      
      // Continue processing or complete
      if (node) {
        setTimeout(processChunk, 0); // Yield control
      } else {
        // Emit remaining buffer
        if (this.buffer.length > 0) {
          this.options.onChunk([...this.buffer]);
        }
        
        this.options.onComplete(this.processedCount);
        resolve({
          processedCount: this.processedCount,
          completed: true
        });
      }
    };
    
    // Start processing
    setTimeout(processChunk, 0);
  }
  
  /**
   * Serialize individual node (simplified)
   */
  serializeNode(node) {
    // This would implement the actual node serialization
    // Similar to previous approaches but optimized for streaming
    if (!node || typeof node !== 'object') return node;
    
    return {
      type: typeof node.type === 'string' ? node.type : '[Component]',
      props: node.props ? this.serializeProps(node.props) : {},
      timestamp: Date.now()
    };
  }
  
  /**
   * Get next node for streaming (simplified traversal)
   */
  getNextNode(node) {
    // This would implement tree traversal logic
    // For example, breadth-first or depth-first traversal
    return null; // Simplified for example
  }
  
  /**
   * Serialize props for streaming
   */
  serializeProps(props) {
    const serialized = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'function') {
        serialized[key] = `[Function: ${value.name}]`;
      } else {
        serialized[key] = value;
      }
    }
    return serialized;
  }
}

// =============================================================================
// UTILITY FUNCTIONS AND EXAMPLES
// =============================================================================

/**
 * Helper function to create virtual DOM nodes
 * Similar to React.createElement but simplified
 */
function createElement(type, props = {}, ...children) {
  const finalProps = { ...props };
  
  if (children.length > 0) {
    finalProps.children = children.length === 1 ? children[0] : children;
  }
  
  return new VNode(type, finalProps);
}

/**
 * Create component registry for deserialization
 * Maps component names to actual component functions
 */
function createComponentRegistry() {
  const registry = new Map();
  
  // Add common components
  registry.set('Button', function Button({ children, onClick, ...props }) {
    return createElement('button', { onClick, ...props }, children);
  });
  
  registry.set('Input', function Input({ value, onChange, ...props }) {
    return createElement('input', { value, onChange, ...props });
  });
  
  return registry;
}

// =============================================================================
// EXAMPLE USAGE AND TESTING
// =============================================================================

// Example 1: Basic serialization
console.log('=== Basic Serialization Example ===');
const basicTree = createElement('div', { className: 'container' },
  createElement('h1', {}, 'Hello World'),
  createElement('p', {}, 'This is a paragraph')
);

const basicSerialized = basicVDOMSerialize(basicTree);
console.log('Serialized:', basicSerialized);

const basicDeserialized = basicVDOMDeserialize(basicSerialized);
console.log('Deserialized type:', basicDeserialized.type);

// Example 2: Advanced serialization with circular references
console.log('\n=== Advanced Serialization Example ===');
const advancedTree = createElement('div', {},
  createElement('span', { id: 'test' }, 'Content')
);

// Create circular reference for testing
advancedTree.props.self = advancedTree;

const advancedSerializer = new AdvancedVDOMSerializer();
const advancedSerialized = advancedSerializer.toJSON(advancedTree);
console.log('Advanced serialized length:', advancedSerialized.length);

const advancedDeserializer = new AdvancedVDOMDeserializer();
const advancedDeserialized = advancedDeserializer.deserialize(advancedSerialized);
console.log('Advanced deserialized type:', advancedDeserialized.type);

// Example 3: React-specific serialization
console.log('\n=== React Serialization Example ===');
const reactElement = {
  $$typeof: (typeof Symbol !== 'undefined' && Symbol.for) 
    ? Symbol.for('react.element') 
    : 0xeac7,
  type: 'div',
  props: {
    className: 'react-component',
    children: 'React Element'
  },
  key: null,
  ref: null
};

const reactSerializer = new ReactVDOMSerializer();
const reactSerialized = reactSerializer.serialize(reactElement);
console.log('React serialized:', JSON.stringify(reactSerialized, null, 2));

// Example 4: Streaming serialization
console.log('\n=== Streaming Serialization Example ===');
const streamingSerializer = new StreamingVDOMSerializer({
  chunkSize: 2,
  onChunk: (chunk) => console.log('Chunk received:', chunk.length, 'items'),
  onComplete: (count) => console.log('Streaming complete:', count, 'items')
});

const largeTree = createElement('div', {},
  ...Array.from({ length: 5 }, (_, i) =>
    createElement('p', { key: i }, `Item ${i}`)
  )
);

streamingSerializer.serialize(largeTree)
  .then(result => console.log('Streaming result:', result))
  .catch(error => console.error('Streaming error:', error));

// Export all implementations
module.exports = {
  // Basic approach
  VNode,
  basicVDOMSerialize,
  basicVDOMDeserialize,
  
  // Advanced approach
  AdvancedVDOMSerializer,
  AdvancedVDOMDeserializer,
  
  // React-specific approach
  ReactVDOMSerializer,
  
  // Streaming approach
  StreamingVDOMSerializer,
  
  // Utilities
  createElement,
  createComponentRegistry
};

/**
 * Interview Discussion Points:
 * 
 * 1. Virtual DOM Structure:
 *    - Explain the basic structure of virtual DOM nodes
 *    - Discuss type, props, children hierarchy
 *    - Talk about keys and reconciliation
 * 
 * 2. Serialization Challenges:
 *    - Functions cannot be serialized to JSON
 *    - Circular references cause infinite recursion
 *    - Component instances vs component types
 *    - Event handler preservation strategies
 * 
 * 3. Performance Considerations:
 *    - Memory usage during serialization
 *    - Streaming for large trees
 *    - Compression strategies
 *    - Partial serialization techniques
 * 
 * 4. Use Cases:
 *    - Server-side rendering
 *    - State persistence
 *    - Time-travel debugging
 *    - Component caching
 *    - Cross-frame communication
 * 
 * 5. Trade-offs:
 *    - Completeness vs performance
 *    - Size vs functionality
 *    - Sync vs async processing
 *    - Memory vs computation
 * 
 * 6. Advanced Topics:
 *    - React Fiber serialization
 *    - Hooks state serialization
 *    - Context value handling
 *    - Portal and boundary serialization
 * 
 * 7. Error Handling:
 *    - Invalid virtual DOM structures
 *    - Version compatibility
 *    - Component registry misses
 *    - Malformed serialized data
 */