/**
 * File: concurrent-history-tracking.js
 * Description: Advanced concurrent history tracking system with undo/redo,
 *              branching, merging, and conflict resolution capabilities
 * 
 * Learning objectives:
 * - Understand state management and history tracking patterns
 * - Learn conflict resolution algorithms and merge strategies
 * - Implement concurrent editing with operational transformations
 * - Practice event-driven architecture and observer patterns
 * - Handle complex data synchronization scenarios
 * 
 * Real-world applications:
 * - Collaborative text editors (Google Docs, Notion)
 * - Version control systems (Git-like functionality)
 * - Real-time collaborative whiteboards and design tools
 * - Multi-user document editing platforms
 * - Undo/redo systems in complex applications
 * - Conflict resolution in distributed systems
 * 
 * Time Complexity: 
 * - Add operation: O(1) amortized
 * - Undo/Redo: O(1) for simple cases, O(n) for complex transformations
 * - Merge: O(n*m) where n,m are operation counts
 * Space Complexity: O(h) where h is history depth
 */

// =======================
// Approach 1: Basic History Tracking
// =======================

/**
 * Basic history tracker with linear undo/redo functionality
 * Supports simple state snapshots and navigation
 */
class BasicHistoryTracker {
  constructor(options = {}) {
    this.options = {
      maxHistorySize: options.maxHistorySize ?? 100,
      enableCompression: options.enableCompression ?? false,
      trackMetadata: options.trackMetadata ?? true,
      autoSave: options.autoSave ?? false
    };
    
    // Core state
    this.history = [];
    this.currentIndex = -1;
    this.sessionId = this.generateSessionId();
    
    // Event system
    this.listeners = new Map();
    
    // Statistics
    this.stats = {
      totalOperations: 0,
      undoCount: 0,
      redoCount: 0,
      branchCount: 0,
      lastActivity: Date.now()
    };
  }
  
  /**
   * Add new state to history
   * Creates snapshot and manages history size limits
   * 
   * @param {any} state - State to track
   * @param {Object} metadata - Additional metadata about the change
   * @returns {string} Operation ID
   */
  addState(state, metadata = {}) {
    // Remove any future history if we're in the middle
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Create history entry
    const entry = {
      id: this.generateOperationId(),
      state: this.deepClone(state),
      metadata: {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        operationType: metadata.type || 'state_change',
        description: metadata.description || 'State updated',
        ...metadata
      }
    };
    
    // Add to history
    this.history.push(entry);
    this.currentIndex++;
    
    // Manage history size
    this.enforceHistoryLimit();
    
    // Update statistics
    this.stats.totalOperations++;
    this.stats.lastActivity = Date.now();
    
    // Emit event
    this.emit('stateAdded', {
      entry,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
    
    return entry.id;
  }
  
  /**
   * Undo to previous state
   * Moves backward in history if possible
   * 
   * @returns {Object|null} Previous state or null if can't undo
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }
    
    this.currentIndex--;
    this.stats.undoCount++;
    
    const currentEntry = this.history[this.currentIndex];
    const undoneEntry = this.history[this.currentIndex + 1];
    
    this.emit('undo', {
      currentState: currentEntry ? currentEntry.state : null,
      undoneEntry,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
    
    return currentEntry ? currentEntry.state : null;
  }
  
  /**
   * Redo to next state
   * Moves forward in history if possible
   * 
   * @returns {Object|null} Next state or null if can't redo
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }
    
    this.currentIndex++;
    this.stats.redoCount++;
    
    const currentEntry = this.history[this.currentIndex];
    
    this.emit('redo', {
      currentState: currentEntry.state,
      redoneEntry: currentEntry,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
    
    return currentEntry.state;
  }
  
  /**
   * Check if undo is possible
   * @returns {boolean} True if can undo
   */
  canUndo() {
    return this.currentIndex > 0;
  }
  
  /**
   * Check if redo is possible
   * @returns {boolean} True if can redo
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * Get current state
   * @returns {any} Current state or null
   */
  getCurrentState() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.deepClone(this.history[this.currentIndex].state);
    }
    return null;
  }
  
  /**
   * Get history summary
   * Returns overview of history without full state data
   * 
   * @returns {Array} History summary
   */
  getHistorySummary() {
    return this.history.map((entry, index) => ({
      id: entry.id,
      timestamp: entry.metadata.timestamp,
      description: entry.metadata.description,
      operationType: entry.metadata.operationType,
      isCurrent: index === this.currentIndex
    }));
  }
  
  /**
   * Jump to specific state by ID
   * Navigates directly to a state in history
   * 
   * @param {string} stateId - ID of target state
   * @returns {any|null} Target state or null if not found
   */
  jumpToState(stateId) {
    const targetIndex = this.history.findIndex(entry => entry.id === stateId);
    
    if (targetIndex === -1) {
      return null;
    }
    
    const previousIndex = this.currentIndex;
    this.currentIndex = targetIndex;
    
    const targetEntry = this.history[targetIndex];
    
    this.emit('jump', {
      from: previousIndex,
      to: targetIndex,
      currentState: targetEntry.state,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
    
    return targetEntry.state;
  }
  
  /**
   * Clear all history
   * Resets the tracker to initial state
   */
  clear() {
    const hadHistory = this.history.length > 0;
    
    this.history = [];
    this.currentIndex = -1;
    
    if (hadHistory) {
      this.emit('cleared', {
        stats: { ...this.stats }
      });
    }
    
    // Reset stats except totals for analytics
    this.stats.undoCount = 0;
    this.stats.redoCount = 0;
    this.stats.branchCount = 0;
  }
  
  /**
   * Enforce history size limits
   * Removes old entries if history exceeds maximum size
   */
  enforceHistoryLimit() {
    if (this.history.length > this.options.maxHistorySize) {
      const removeCount = this.history.length - this.options.maxHistorySize;
      this.history.splice(0, removeCount);
      this.currentIndex -= removeCount;
      this.currentIndex = Math.max(0, this.currentIndex);
    }
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Deep clone utility
   * @param {any} obj - Object to clone
   * @returns {any} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
    return obj;
  }
  
  /**
   * Generate unique operation ID
   * @returns {string} Unique operation ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate session ID
   * @returns {string} Unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get tracker statistics
   * @returns {Object} Usage statistics
   */
  getStats() {
    return {
      ...this.stats,
      historySize: this.history.length,
      currentPosition: this.currentIndex,
      memoryUsage: this.estimateMemoryUsage()
    };
  }
  
  /**
   * Estimate memory usage
   * @returns {number} Estimated memory usage in bytes
   */
  estimateMemoryUsage() {
    return JSON.stringify(this.history).length * 2; // Rough estimate
  }
}

// =======================
// Approach 2: Concurrent History with Branching
// =======================

/**
 * Advanced history tracker supporting branching, merging, and concurrent editing
 * Implements operational transformation for conflict resolution
 */
class ConcurrentHistoryTracker extends BasicHistoryTracker {
  constructor(options = {}) {
    super(options);
    
    // Enhanced options
    this.concurrentOptions = {
      ...this.options,
      enableBranching: options.enableBranching ?? true,
      enableMerging: options.enableMerging ?? true,
      enableOperationalTransform: options.enableOperationalTransform ?? true,
      maxBranches: options.maxBranches ?? 50,
      conflictResolution: options.conflictResolution ?? 'merge', // 'merge', 'overwrite', 'manual'
      enableRealTimeSync: options.enableRealTimeSync ?? false
    };
    
    // Enhanced state for branching
    this.branches = new Map(); // branchId -> branch info
    this.currentBranch = 'main';
    this.branchHistory = new Map(); // branchId -> history array
    this.operations = new Map(); // operationId -> operation details
    this.conflicts = [];
    
    // Initialize main branch
    this.branches.set('main', {
      id: 'main',
      name: 'Main Branch',
      created: Date.now(),
      parentBranch: null,
      lastActivity: Date.now(),
      collaborators: new Set([this.sessionId])
    });
    
    this.branchHistory.set('main', this.history);
  }
  
  /**
   * Create new branch from current state
   * Enables parallel development paths
   * 
   * @param {string} branchName - Name for the new branch
   * @param {Object} options - Branch options
   * @returns {string} Branch ID
   */
  createBranch(branchName, options = {}) {
    if (this.branches.size >= this.concurrentOptions.maxBranches) {
      throw new Error('Maximum number of branches reached');
    }
    
    const branchId = options.branchId || this.generateBranchId();
    
    // Create branch info
    const branchInfo = {
      id: branchId,
      name: branchName,
      created: Date.now(),
      parentBranch: this.currentBranch,
      parentStateId: this.getCurrentStateId(),
      lastActivity: Date.now(),
      collaborators: new Set([this.sessionId]),
      metadata: options.metadata || {}
    };
    
    // Copy current history to new branch
    const currentHistory = this.branchHistory.get(this.currentBranch) || [];
    const branchHistory = currentHistory.slice(0, this.currentIndex + 1);
    
    this.branches.set(branchId, branchInfo);
    this.branchHistory.set(branchId, branchHistory);
    
    this.stats.branchCount++;
    
    this.emit('branchCreated', {
      branchId,
      branchName,
      parentBranch: this.currentBranch,
      history: this.getBranchSummary(branchId)
    });
    
    return branchId;
  }
  
  /**
   * Switch to different branch
   * Changes active branch and updates current state
   * 
   * @param {string} branchId - Target branch ID
   * @returns {boolean} True if switch successful
   */
  switchBranch(branchId) {
    if (!this.branches.has(branchId)) {
      return false;
    }
    
    const previousBranch = this.currentBranch;
    this.currentBranch = branchId;
    
    // Update history references
    this.history = this.branchHistory.get(branchId) || [];
    this.currentIndex = this.history.length - 1;
    
    // Update branch activity
    const branch = this.branches.get(branchId);
    branch.lastActivity = Date.now();
    branch.collaborators.add(this.sessionId);
    
    this.emit('branchSwitched', {
      from: previousBranch,
      to: branchId,
      currentState: this.getCurrentState(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
    
    return true;
  }
  
  /**
   * Add operation-based change instead of full state
   * Enables more granular tracking and operational transformation
   * 
   * @param {Object} operation - Operation descriptor
   * @param {any} resultingState - State after operation
   * @returns {string} Operation ID
   */
  addOperation(operation, resultingState) {
    const operationId = this.generateOperationId();
    
    // Enhanced operation tracking
    const operationEntry = {
      id: operationId,
      type: operation.type,
      path: operation.path,
      value: operation.value,
      oldValue: operation.oldValue,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      branchId: this.currentBranch,
      metadata: operation.metadata || {}
    };
    
    this.operations.set(operationId, operationEntry);
    
    // Add to history with operation reference
    const stateId = this.addState(resultingState, {
      type: 'operation',
      description: this.describeOperation(operation),
      operationId,
      operation: operationEntry
    });
    
    return operationId;
  }
  
  /**
   * Merge branch into current branch
   * Applies operational transformation to resolve conflicts
   * 
   * @param {string} sourceBranchId - Branch to merge from
   * @param {Object} mergeOptions - Merge configuration
   * @returns {Object} Merge result with conflicts
   */
  mergeBranch(sourceBranchId, mergeOptions = {}) {
    if (!this.branches.has(sourceBranchId)) {
      throw new Error(`Branch ${sourceBranchId} not found`);
    }
    
    if (sourceBranchId === this.currentBranch) {
      throw new Error('Cannot merge branch into itself');
    }
    
    const sourceBranch = this.branches.get(sourceBranchId);
    const sourceHistory = this.branchHistory.get(sourceBranchId) || [];
    const targetHistory = this.branchHistory.get(this.currentBranch) || [];
    
    // Find common ancestor
    const commonAncestor = this.findCommonAncestor(sourceBranchId, this.currentBranch);
    
    // Get operations since divergence
    const sourceOperations = this.getOperationsSince(sourceHistory, commonAncestor);
    const targetOperations = this.getOperationsSince(targetHistory, commonAncestor);
    
    // Detect and resolve conflicts
    const conflicts = this.detectConflicts(sourceOperations, targetOperations);
    const resolvedOperations = this.resolveConflicts(conflicts, mergeOptions);
    
    // Apply resolved operations
    let mergedState = this.getCurrentState();
    const appliedOperations = [];
    
    resolvedOperations.forEach(operation => {
      try {
        mergedState = this.applyOperation(mergedState, operation);
        appliedOperations.push(operation);
      } catch (error) {
        console.warn('Failed to apply operation during merge:', error);
      }
    });
    
    // Add merged state to history
    const mergeId = this.addState(mergedState, {
      type: 'merge',
      description: `Merged branch ${sourceBranch.name}`,
      sourceBranch: sourceBranchId,
      targetBranch: this.currentBranch,
      conflictCount: conflicts.length,
      appliedOperations: appliedOperations.length
    });
    
    const mergeResult = {
      mergeId,
      conflicts,
      appliedOperations,
      skippedOperations: resolvedOperations.length - appliedOperations.length,
      mergedState
    };
    
    this.emit('branchMerged', {
      sourceBranch: sourceBranchId,
      targetBranch: this.currentBranch,
      result: mergeResult
    });
    
    return mergeResult;
  }
  
  /**
   * Find common ancestor between two branches
   * Determines where branches diverged
   * 
   * @param {string} branchA - First branch ID
   * @param {string} branchB - Second branch ID
   * @returns {string|null} Common ancestor state ID
   */
  findCommonAncestor(branchA, branchB) {
    const historyA = this.branchHistory.get(branchA) || [];
    const historyB = this.branchHistory.get(branchB) || [];
    
    // Find common states by working backwards
    for (let i = Math.min(historyA.length, historyB.length) - 1; i >= 0; i--) {
      if (historyA[i] && historyB[i] && historyA[i].id === historyB[i].id) {
        return historyA[i].id;
      }
    }
    
    return null;
  }
  
  /**
   * Get operations since a specific ancestor
   * Extracts operations for merge analysis
   * 
   * @param {Array} history - Branch history
   * @param {string} ancestorId - Ancestor state ID
   * @returns {Array} Operations since ancestor
   */
  getOperationsSince(history, ancestorId) {
    const operations = [];
    let foundAncestor = false;
    
    for (const entry of history) {
      if (foundAncestor && entry.metadata.operationId) {
        const operation = this.operations.get(entry.metadata.operationId);
        if (operation) {
          operations.push(operation);
        }
      }
      
      if (entry.id === ancestorId) {
        foundAncestor = true;
      }
    }
    
    return operations;
  }
  
  /**
   * Detect conflicts between operation sets
   * Identifies operations that affect the same data
   * 
   * @param {Array} opsA - First set of operations
   * @param {Array} opsB - Second set of operations
   * @returns {Array} Detected conflicts
   */
  detectConflicts(opsA, opsB) {
    const conflicts = [];
    
    for (const opA of opsA) {
      for (const opB of opsB) {
        if (this.operationsConflict(opA, opB)) {
          conflicts.push({
            type: 'conflict',
            operationA: opA,
            operationB: opB,
            path: opA.path,
            severity: this.calculateConflictSeverity(opA, opB)
          });
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Check if two operations conflict
   * Determines if operations affect same data paths
   * 
   * @param {Object} opA - First operation
   * @param {Object} opB - Second operation
   * @returns {boolean} True if operations conflict
   */
  operationsConflict(opA, opB) {
    // Simple path-based conflict detection
    if (opA.path === opB.path) {
      return true;
    }
    
    // Check for nested path conflicts
    if (opA.path && opB.path) {
      const pathA = opA.path.split('.');
      const pathB = opB.path.split('.');
      
      // One path is prefix of another
      const minLength = Math.min(pathA.length, pathB.length);
      for (let i = 0; i < minLength; i++) {
        if (pathA[i] !== pathB[i]) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculate conflict severity
   * Helps prioritize conflict resolution
   * 
   * @param {Object} opA - First operation
   * @param {Object} opB - Second operation
   * @returns {string} Severity level
   */
  calculateConflictSeverity(opA, opB) {
    // Both operations modify same value
    if (opA.type === 'set' && opB.type === 'set') {
      return 'high';
    }
    
    // One deletes, other modifies
    if ((opA.type === 'delete' && opB.type !== 'delete') ||
        (opB.type === 'delete' && opA.type !== 'delete')) {
      return 'high';
    }
    
    // Array operations
    if (opA.type === 'array_insert' || opB.type === 'array_insert') {
      return 'medium';
    }
    
    return 'low';
  }
  
  /**
   * Resolve conflicts using specified strategy
   * Applies conflict resolution rules
   * 
   * @param {Array} conflicts - Detected conflicts
   * @param {Object} options - Resolution options
   * @returns {Array} Resolved operations
   */
  resolveConflicts(conflicts, options) {
    const strategy = options.strategy || this.concurrentOptions.conflictResolution;
    const resolved = [];
    
    switch (strategy) {
      case 'merge':
        return this.mergeConflicts(conflicts);
      
      case 'overwrite':
        return this.overwriteConflicts(conflicts, options);
      
      case 'manual':
        return this.manualResolveConflicts(conflicts, options);
      
      default:
        return this.mergeConflicts(conflicts);
    }
  }
  
  /**
   * Merge conflicts using operational transformation
   * Attempts automatic conflict resolution
   * 
   * @param {Array} conflicts - Conflicts to resolve
   * @returns {Array} Merged operations
   */
  mergeConflicts(conflicts) {
    const resolved = [];
    
    for (const conflict of conflicts) {
      const { operationA, operationB } = conflict;
      
      // Simple merge strategies based on operation types
      if (operationA.type === 'set' && operationB.type === 'set') {
        // Use more recent operation
        const winner = operationA.timestamp > operationB.timestamp ? operationA : operationB;
        resolved.push(winner);
      } else {
        // Default: include both operations
        resolved.push(operationA, operationB);
      }
    }
    
    return resolved;
  }
  
  /**
   * Overwrite conflicts with preferred branch
   * Simple conflict resolution by choosing one side
   * 
   * @param {Array} conflicts - Conflicts to resolve
   * @param {Object} options - Resolution options
   * @returns {Array} Resolved operations
   */
  overwriteConflicts(conflicts, options) {
    const preferSource = options.preferSource ?? true;
    
    return conflicts.map(conflict => 
      preferSource ? conflict.operationA : conflict.operationB
    );
  }
  
  /**
   * Manual conflict resolution
   * Allows custom resolution logic
   * 
   * @param {Array} conflicts - Conflicts to resolve
   * @param {Object} options - Resolution options
   * @returns {Array} Resolved operations
   */
  manualResolveConflicts(conflicts, options) {
    const resolver = options.resolver;
    
    if (typeof resolver !== 'function') {
      throw new Error('Manual resolution requires resolver function');
    }
    
    return conflicts.map(conflict => resolver(conflict));
  }
  
  /**
   * Apply operation to state
   * Transforms state based on operation
   * 
   * @param {any} state - Current state
   * @param {Object} operation - Operation to apply
   * @returns {any} New state
   */
  applyOperation(state, operation) {
    const newState = this.deepClone(state);
    
    switch (operation.type) {
      case 'set':
        return this.setValueAtPath(newState, operation.path, operation.value);
      
      case 'delete':
        return this.deleteValueAtPath(newState, operation.path);
      
      case 'array_insert':
        return this.arrayInsertAtPath(newState, operation.path, operation.value, operation.index);
      
      case 'array_remove':
        return this.arrayRemoveAtPath(newState, operation.path, operation.index);
      
      default:
        console.warn(`Unknown operation type: ${operation.type}`);
        return newState;
    }
  }
  
  /**
   * Set value at object path
   * @param {Object} obj - Target object
   * @param {string} path - Dot-notation path
   * @param {any} value - Value to set
   * @returns {Object} Modified object
   */
  setValueAtPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  }
  
  /**
   * Delete value at object path
   * @param {Object} obj - Target object
   * @param {string} path - Dot-notation path
   * @returns {Object} Modified object
   */
  deleteValueAtPath(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        return obj; // Path doesn't exist
      }
      current = current[key];
    }
    
    delete current[keys[keys.length - 1]];
    return obj;
  }
  
  /**
   * Insert into array at path
   * @param {Object} obj - Target object
   * @param {string} path - Path to array
   * @param {any} value - Value to insert
   * @param {number} index - Insert position
   * @returns {Object} Modified object
   */
  arrayInsertAtPath(obj, path, value, index) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = [];
      }
      current = current[key];
    }
    
    if (Array.isArray(current)) {
      current.splice(index, 0, value);
    }
    
    return obj;
  }
  
  /**
   * Remove from array at path
   * @param {Object} obj - Target object
   * @param {string} path - Path to array
   * @param {number} index - Remove position
   * @returns {Object} Modified object
   */
  arrayRemoveAtPath(obj, path, index) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (!(key in current)) {
        return obj;
      }
      current = current[key];
    }
    
    if (Array.isArray(current) && index >= 0 && index < current.length) {
      current.splice(index, 1);
    }
    
    return obj;
  }
  
  /**
   * Get current state ID
   * @returns {string|null} Current state ID
   */
  getCurrentStateId() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].id;
    }
    return null;
  }
  
  /**
   * Get branch summary
   * @param {string} branchId - Branch ID
   * @returns {Object} Branch summary
   */
  getBranchSummary(branchId) {
    const branch = this.branches.get(branchId);
    const history = this.branchHistory.get(branchId) || [];
    
    if (!branch) return null;
    
    return {
      ...branch,
      historyLength: history.length,
      lastState: history[history.length - 1]?.id || null
    };
  }
  
  /**
   * Generate branch ID
   * @returns {string} Unique branch ID
   */
  generateBranchId() {
    return `branch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
  
  /**
   * Describe operation for history
   * @param {Object} operation - Operation to describe
   * @returns {string} Human-readable description
   */
  describeOperation(operation) {
    switch (operation.type) {
      case 'set':
        return `Set ${operation.path} to ${JSON.stringify(operation.value)}`;
      case 'delete':
        return `Deleted ${operation.path}`;
      case 'array_insert':
        return `Inserted item at ${operation.path}[${operation.index}]`;
      case 'array_remove':
        return `Removed item at ${operation.path}[${operation.index}]`;
      default:
        return `Operation: ${operation.type}`;
    }
  }
  
  /**
   * Get all branches
   * @returns {Array} Array of branch summaries
   */
  getAllBranches() {
    return Array.from(this.branches.keys()).map(id => this.getBranchSummary(id));
  }
  
  /**
   * Delete branch
   * @param {string} branchId - Branch ID to delete
   * @returns {boolean} True if deleted successfully
   */
  deleteBranch(branchId) {
    if (branchId === 'main' || branchId === this.currentBranch) {
      return false; // Cannot delete main branch or current branch
    }
    
    if (!this.branches.has(branchId)) {
      return false;
    }
    
    this.branches.delete(branchId);
    this.branchHistory.delete(branchId);
    
    this.emit('branchDeleted', { branchId });
    
    return true;
  }
  
  /**
   * Get enhanced statistics including branching info
   * @returns {Object} Comprehensive statistics
   */
  getStats() {
    const baseStats = super.getStats();
    
    return {
      ...baseStats,
      branches: {
        total: this.branches.size,
        current: this.currentBranch,
        active: Array.from(this.branches.values()).filter(
          branch => Date.now() - branch.lastActivity < 3600000 // 1 hour
        ).length
      },
      operations: {
        total: this.operations.size,
        conflicts: this.conflicts.length
      }
    };
  }
}

// =======================
// Real-world Usage Examples
// =======================

/**
 * Example 1: Basic undo/redo functionality
 * Demonstrates simple history tracking for form or editor
 */
function demonstrateBasicHistory() {
  console.log('=== Basic History Tracking Demo ===\n');
  
  const history = new BasicHistoryTracker({
    maxHistorySize: 10
  });
  
  // Simulate document editing
  let document = { title: '', content: '', metadata: { version: 1 } };
  
  // Track changes
  console.log('Making document changes...');
  
  document.title = 'My Document';
  history.addState(document, { description: 'Set title' });
  console.log('1. Set title:', history.getCurrentState().title);
  
  document.content = 'Hello world';
  history.addState(document, { description: 'Added content' });
  console.log('2. Added content:', history.getCurrentState().content);
  
  document.content = 'Hello world! This is my first document.';
  history.addState(document, { description: 'Extended content' });
  console.log('3. Extended content');
  
  document.metadata.version = 2;
  history.addState(document, { description: 'Updated version' });
  console.log('4. Updated version:', history.getCurrentState().metadata.version);
  
  // Demonstrate undo/redo
  console.log('\n--- Undo/Redo Operations ---');
  
  console.log('Undo:', history.undo()?.content || 'null');
  console.log('Undo:', history.undo()?.content || 'null');
  console.log('Can undo:', history.canUndo());
  console.log('Can redo:', history.canRedo());
  
  console.log('Redo:', history.redo()?.content || 'null');
  console.log('Current state:', history.getCurrentState().content);
  
  // Show history summary
  console.log('\n--- History Summary ---');
  const summary = history.getHistorySummary();
  summary.forEach((entry, index) => {
    const marker = entry.isCurrent ? '→' : ' ';
    console.log(`${marker} ${index}: ${entry.description} (${new Date(entry.timestamp).toLocaleTimeString()})`);
  });
}

/**
 * Example 2: Collaborative editing with branches
 * Simulates multiple users editing with conflict resolution
 */
function demonstrateConcurrentEditing() {
  console.log('=== Concurrent Editing Demo ===\n');
  
  const history = new ConcurrentHistoryTracker({
    enableBranching: true,
    enableMerging: true,
    conflictResolution: 'merge'
  });
  
  // Initial document state
  let sharedDoc = {
    title: 'Shared Document',
    content: {
      intro: 'This is a collaborative document.',
      sections: ['Section 1', 'Section 2']
    },
    metadata: { authors: [], lastModified: Date.now() }
  };
  
  history.addState(sharedDoc, { description: 'Initial document' });
  
  // User A creates a branch
  console.log('User A creates feature branch...');
  const userABranch = history.createBranch('feature/user-a-edits', {
    metadata: { author: 'User A', purpose: 'Adding new content' }
  });
  
  history.switchBranch(userABranch);
  
  // User A makes changes
  history.addOperation({
    type: 'set',
    path: 'content.intro',
    value: 'This is a collaborative document with enhanced features.',
    oldValue: sharedDoc.content.intro
  }, {
    ...sharedDoc,
    content: {
      ...sharedDoc.content,
      intro: 'This is a collaborative document with enhanced features.'
    }
  });
  
  history.addOperation({
    type: 'array_insert',
    path: 'content.sections',
    value: 'Section 3',
    index: 2
  }, {
    ...sharedDoc,
    content: {
      ...sharedDoc.content,
      intro: 'This is a collaborative document with enhanced features.',
      sections: ['Section 1', 'Section 2', 'Section 3']
    }
  });
  
  console.log('User A added Section 3 and updated intro');
  
  // Switch back to main for User B
  history.switchBranch('main');
  
  // User B creates their own branch
  console.log('\nUser B creates their own branch...');
  const userBBranch = history.createBranch('feature/user-b-edits', {
    metadata: { author: 'User B', purpose: 'Updating existing sections' }
  });
  
  history.switchBranch(userBBranch);
  
  // User B makes conflicting changes
  history.addOperation({
    type: 'set',
    path: 'content.intro',
    value: 'This collaborative document showcases teamwork.',
    oldValue: sharedDoc.content.intro
  }, {
    ...sharedDoc,
    content: {
      ...sharedDoc.content,
      intro: 'This collaborative document showcases teamwork.'
    }
  });
  
  history.addOperation({
    type: 'set',
    path: 'content.sections.0',
    value: 'Introduction Section',
    oldValue: 'Section 1'
  }, {
    ...sharedDoc,
    content: {
      intro: 'This collaborative document showcases teamwork.',
      sections: ['Introduction Section', 'Section 2']
    }
  });
  
  console.log('User B updated intro and renamed Section 1');
  
  // Merge User A's changes into main
  console.log('\n--- Merging User A\'s changes ---');
  history.switchBranch('main');
  const mergeResultA = history.mergeBranch(userABranch);
  console.log(`Merge A completed: ${mergeResultA.appliedOperations} operations applied, ${mergeResultA.conflicts.length} conflicts`);
  
  // Merge User B's changes (this will create conflicts)
  console.log('\n--- Merging User B\'s changes ---');
  const mergeResultB = history.mergeBranch(userBBranch);
  console.log(`Merge B completed: ${mergeResultB.appliedOperations} operations applied, ${mergeResultB.conflicts.length} conflicts`);
  
  if (mergeResultB.conflicts.length > 0) {
    console.log('\nConflicts detected:');
    mergeResultB.conflicts.forEach((conflict, index) => {
      console.log(`  ${index + 1}. Path: ${conflict.path}, Severity: ${conflict.severity}`);
      console.log(`     Operation A: ${conflict.operationA.type} - ${JSON.stringify(conflict.operationA.value)}`);
      console.log(`     Operation B: ${conflict.operationB.type} - ${JSON.stringify(conflict.operationB.value)}`);
    });
  }
  
  console.log('\nFinal merged state:');
  console.log(JSON.stringify(history.getCurrentState(), null, 2));
  
  // Show branch information
  console.log('\n--- Branch Summary ---');
  const branches = history.getAllBranches();
  branches.forEach(branch => {
    console.log(`${branch.name} (${branch.id}): ${branch.historyLength} states, created ${new Date(branch.created).toLocaleTimeString()}`);
  });
}

/**
 * Example 3: Real-time collaborative text editor
 * Demonstrates operational transformation for text editing
 */
function demonstrateTextEditor() {
  console.log('=== Text Editor with History Demo ===\n');
  
  const editor = new ConcurrentHistoryTracker({
    enableOperationalTransform: true,
    maxHistorySize: 50
  });
  
  // Initial text state
  let text = 'The quick brown fox jumps over the lazy dog.';
  editor.addState({ text }, { description: 'Initial text' });
  
  // Simulate text editing operations
  console.log('Initial text:', text);
  
  // Insert text
  text = 'The quick brown fox quickly jumps over the lazy dog.';
  editor.addOperation({
    type: 'text_insert',
    path: 'text',
    value: 'quickly ',
    position: 20,
    oldValue: text
  }, { text });
  console.log('1. Inserted "quickly":', text);
  
  // Replace word
  text = 'The quick brown fox quickly jumps over the sleepy dog.';
  editor.addOperation({
    type: 'text_replace',
    path: 'text',
    value: 'sleepy',
    oldValue: 'lazy',
    position: 43,
    length: 4
  }, { text });
  console.log('2. Replaced "lazy" with "sleepy":', text);
  
  // Delete word
  text = 'The brown fox quickly jumps over the sleepy dog.';
  editor.addOperation({
    type: 'text_delete',
    path: 'text',
    position: 4,
    length: 6, // "quick "
    oldValue: 'quick '
  }, { text });
  console.log('3. Deleted "quick":', text);
  
  // Demonstrate undo/redo
  console.log('\n--- Undo/Redo in Text Editor ---');
  const undoState = editor.undo();
  console.log('Undo:', undoState?.text || 'null');
  
  const redoState = editor.redo();
  console.log('Redo:', redoState?.text || 'null');
  
  // Show editing history
  console.log('\n--- Edit History ---');
  const history = editor.getHistorySummary();
  history.forEach((entry, index) => {
    const marker = entry.isCurrent ? '→' : ' ';
    console.log(`${marker} ${index}: ${entry.description}`);
  });
  
  // Performance statistics
  console.log('\n--- Performance Statistics ---');
  const stats = editor.getStats();
  console.log(`Total operations: ${stats.totalOperations}`);
  console.log(`Undo operations: ${stats.undoCount}`);
  console.log(`Redo operations: ${stats.redoCount}`);
  console.log(`Branches created: ${stats.branches?.total || 1}`);
  console.log(`Memory usage: ~${stats.memoryUsage} bytes`);
}

// Export all implementations and examples
module.exports = {
  BasicHistoryTracker,
  ConcurrentHistoryTracker,
  demonstrateBasicHistory,
  demonstrateConcurrentEditing,
  demonstrateTextEditor
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Concurrent History Tracking Implementation\n');
  console.log('This module demonstrates advanced history tracking systems');
  console.log('for collaborative editing and state management.\n');
  
  demonstrateBasicHistory();
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateConcurrentEditing();
  }, 1000);
  
  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    demonstrateTextEditor();
  }, 3000);
}