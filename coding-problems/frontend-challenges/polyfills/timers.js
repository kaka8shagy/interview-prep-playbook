/**
 * File: timers.js
 * Description: Custom implementations of setTimeout and setInterval with advanced features
 * 
 * Learning objectives:
 * - Understand JavaScript event loop and timer mechanics
 * - Learn precision timing and drift correction
 * - Implement timer management and cancellation
 * 
 * Time Complexity: O(1) for timer operations, O(n log n) for priority queue
 * Space Complexity: O(n) where n is number of active timers
 */

// =======================
// Approach 1: Basic setTimeout/setInterval Implementation
// =======================

/**
 * Basic timer system using native setTimeout as building block
 * Provides interface similar to native timers but with enhanced features
 * 
 * Mental model: Think of this as a timer registry that tracks active timers
 * and provides additional control methods like pause/resume
 */
class BasicTimerSystem {
  constructor() {
    this.timers = new Map();
    this.timerId = 1;
    this.paused = false;
    this.pausedTimers = new Map();
  }
  
  /**
   * Custom setTimeout implementation
   * Returns timer ID for cancellation
   */
  setTimeout(callback, delay, ...args) {
    const id = this.timerId++;
    
    const timeoutId = setTimeout(() => {
      // Clean up timer record
      this.timers.delete(id);
      
      // Execute callback with provided arguments
      try {
        callback.apply(null, args);
      } catch (error) {
        console.error('Timer callback error:', error);
      }
    }, delay);
    
    // Store timer information for management
    this.timers.set(id, {
      type: 'timeout',
      nativeId: timeoutId,
      callback,
      delay,
      args,
      startTime: Date.now(),
      paused: false
    });
    
    return id;
  }
  
  /**
   * Custom setInterval implementation
   * Uses recursive setTimeout for better control
   */
  setInterval(callback, delay, ...args) {
    const id = this.timerId++;
    let cancelled = false;
    
    const scheduleNext = () => {
      if (cancelled) return;
      
      const timeoutId = setTimeout(() => {
        if (cancelled) return;
        
        try {
          callback.apply(null, args);
        } catch (error) {
          console.error('Interval callback error:', error);
        }
        
        // Schedule next execution
        scheduleNext();
      }, delay);
      
      // Update timer record with new native ID
      if (this.timers.has(id)) {
        this.timers.get(id).nativeId = timeoutId;
      }
    };
    
    // Start the interval
    scheduleNext();
    
    // Store timer information
    this.timers.set(id, {
      type: 'interval',
      nativeId: null, // Will be updated by scheduleNext
      callback,
      delay,
      args,
      startTime: Date.now(),
      cancelled: false,
      cancel: () => { cancelled = true; }
    });
    
    return id;
  }
  
  /**
   * Clear timeout by ID
   */
  clearTimeout(id) {
    const timer = this.timers.get(id);
    if (timer && timer.type === 'timeout') {
      clearTimeout(timer.nativeId);
      this.timers.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Clear interval by ID
   */
  clearInterval(id) {
    const timer = this.timers.get(id);
    if (timer && timer.type === 'interval') {
      if (timer.nativeId) {
        clearTimeout(timer.nativeId);
      }
      if (timer.cancel) {
        timer.cancel();
      }
      this.timers.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Get information about active timers
   */
  getActiveTimers() {
    const active = [];
    for (const [id, timer] of this.timers) {
      active.push({
        id,
        type: timer.type,
        delay: timer.delay,
        startTime: timer.startTime,
        runTime: Date.now() - timer.startTime
      });
    }
    return active;
  }
  
  /**
   * Clear all active timers
   */
  clearAll() {
    for (const [id, timer] of this.timers) {
      if (timer.type === 'timeout') {
        clearTimeout(timer.nativeId);
      } else if (timer.type === 'interval') {
        if (timer.nativeId) clearTimeout(timer.nativeId);
        if (timer.cancel) timer.cancel();
      }
    }
    this.timers.clear();
  }
}

// =======================
// Approach 2: High-Precision Timer with Drift Correction
// =======================

/**
 * Precision timer that corrects for drift in setInterval
 * Maintains accurate timing even when main thread is busy
 * 
 * This is crucial for animations, data sampling, and real-time applications
 */
class PrecisionTimer {
  constructor() {
    this.intervals = new Map();
    this.intervalId = 1;
  }
  
  /**
   * Precision setTimeout using performance.now() for accuracy
   */
  setTimeout(callback, delay, ...args) {
    const startTime = performance.now();
    const targetTime = startTime + delay;
    
    const checkTime = () => {
      const currentTime = performance.now();
      
      if (currentTime >= targetTime) {
        // Execute callback
        try {
          callback.apply(null, args);
        } catch (error) {
          console.error('Precision timeout error:', error);
        }
      } else {
        // Schedule next check - use smaller interval for precision
        const remaining = targetTime - currentTime;
        const nextCheck = Math.min(remaining, 16); // Max 60fps checks
        setTimeout(checkTime, nextCheck);
      }
    };
    
    // Start timing
    setTimeout(checkTime, Math.min(delay, 16));
  }
  
  /**
   * Drift-corrected interval that maintains precise timing
   * Adjusts delay to compensate for execution time and thread delays
   */
  setInterval(callback, delay, ...args) {
    const id = this.intervalId++;
    const startTime = performance.now();
    let executionCount = 0;
    let cancelled = false;
    
    const execute = () => {
      if (cancelled) return;
      
      const currentTime = performance.now();
      executionCount++;
      
      try {
        callback.apply(null, args);
      } catch (error) {
        console.error('Precision interval error:', error);
      }
      
      if (cancelled) return;
      
      // Calculate when next execution should happen
      const expectedTime = startTime + (executionCount * delay);
      const actualTime = performance.now();
      
      // Adjust next delay to correct for drift
      const drift = actualTime - expectedTime;
      const nextDelay = Math.max(0, delay - drift);
      
      // Store drift information for monitoring
      const interval = this.intervals.get(id);
      if (interval) {
        interval.totalDrift = drift;
        interval.executionCount = executionCount;
        interval.avgDrift = drift / executionCount;
      }
      
      setTimeout(execute, nextDelay);
    };
    
    // Store interval information
    this.intervals.set(id, {
      startTime,
      delay,
      executionCount: 0,
      totalDrift: 0,
      avgDrift: 0,
      cancelled: false,
      cancel: () => { cancelled = true; }
    });
    
    // Start execution
    setTimeout(execute, delay);
    
    return id;
  }
  
  /**
   * Cancel precision interval
   */
  clearInterval(id) {
    const interval = this.intervals.get(id);
    if (interval) {
      interval.cancel();
      this.intervals.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Get drift statistics for an interval
   */
  getDriftStats(id) {
    const interval = this.intervals.get(id);
    if (interval) {
      return {
        executionCount: interval.executionCount,
        totalDrift: interval.totalDrift,
        avgDrift: interval.avgDrift,
        accuracy: Math.max(0, 100 - Math.abs(interval.avgDrift / interval.delay * 100))
      };
    }
    return null;
  }
}

// =======================
// Approach 3: Advanced Timer with Priorities and Scheduling
// =======================

/**
 * Advanced timer system with priority queues and flexible scheduling
 * Supports priority-based execution and complex timing patterns
 */
class AdvancedTimer {
  constructor() {
    this.timers = [];
    this.isRunning = false;
    this.timerId = 1;
    this.frameId = null;
  }
  
  /**
   * Schedule timer with priority and options
   */
  schedule(callback, delay, options = {}) {
    const {
      priority = 0,      // Higher numbers = higher priority
      repeat = false,    // Whether to repeat
      immediate = false, // Execute immediately then schedule
      context = null,    // 'this' context for callback
      args = []         // Arguments for callback
    } = options;
    
    const id = this.timerId++;
    const scheduledTime = performance.now() + (immediate ? 0 : delay);
    
    const timer = {
      id,
      callback,
      delay,
      priority,
      repeat,
      immediate,
      context,
      args,
      scheduledTime,
      created: performance.now(),
      executions: 0,
      cancelled: false
    };
    
    // Insert timer maintaining priority order
    this.insertTimer(timer);
    
    // Start processing if not already running
    this.startProcessing();
    
    return id;
  }
  
  /**
   * Insert timer in priority-ordered position
   */
  insertTimer(timer) {
    let insertIndex = this.timers.length;
    
    // Find insertion point (higher priority first, then by scheduled time)
    for (let i = 0; i < this.timers.length; i++) {
      const existing = this.timers[i];
      
      if (timer.priority > existing.priority || 
          (timer.priority === existing.priority && timer.scheduledTime < existing.scheduledTime)) {
        insertIndex = i;
        break;
      }
    }
    
    this.timers.splice(insertIndex, 0, timer);
  }
  
  /**
   * Process timer queue using requestAnimationFrame for smooth execution
   */
  startProcessing() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    const processQueue = () => {
      const currentTime = performance.now();
      const executed = [];
      const toReschedule = [];
      
      // Process all timers that are ready
      while (this.timers.length > 0) {
        const timer = this.timers[0];
        
        if (timer.cancelled) {
          this.timers.shift();
          continue;
        }
        
        if (timer.scheduledTime <= currentTime) {
          this.timers.shift();
          
          try {
            // Execute callback
            timer.callback.apply(timer.context, timer.args);
            timer.executions++;
            executed.push(timer);
            
            // Reschedule if repeating
            if (timer.repeat && !timer.cancelled) {
              timer.scheduledTime = currentTime + timer.delay;
              toReschedule.push(timer);
            }
          } catch (error) {
            console.error('Advanced timer callback error:', error);
          }
        } else {
          // No more ready timers
          break;
        }
      }
      
      // Reschedule repeating timers
      for (const timer of toReschedule) {
        this.insertTimer(timer);
      }
      
      // Continue processing if timers remain
      if (this.timers.length > 0) {
        this.frameId = requestAnimationFrame(processQueue);
      } else {
        this.isRunning = false;
        this.frameId = null;
      }
    };
    
    this.frameId = requestAnimationFrame(processQueue);
  }
  
  /**
   * Cancel timer by ID
   */
  cancel(id) {
    const timer = this.timers.find(t => t.id === id);
    if (timer) {
      timer.cancelled = true;
      return true;
    }
    return false;
  }
  
  /**
   * Cancel all timers
   */
  cancelAll() {
    this.timers.forEach(timer => timer.cancelled = true);
    this.timers = [];
    
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    
    this.isRunning = false;
  }
  
  /**
   * Get timer statistics
   */
  getStats() {
    const active = this.timers.filter(t => !t.cancelled);
    const priorities = {};
    
    for (const timer of active) {
      priorities[timer.priority] = (priorities[timer.priority] || 0) + 1;
    }
    
    return {
      total: this.timers.length,
      active: active.length,
      cancelled: this.timers.length - active.length,
      priorities,
      isProcessing: this.isRunning
    };
  }
}

// =======================
// Approach 4: Timer with Pause/Resume and State Management
// =======================

/**
 * Timer system with full state management including pause/resume
 * Useful for games, animations, and interactive applications
 */
class StatefulTimer {
  constructor() {
    this.timers = new Map();
    this.timerId = 1;
    this.globalState = 'running'; // running, paused, stopped
    this.globalPauseTime = 0;
  }
  
  /**
   * Create timer with full state management
   */
  createTimer(callback, delay, options = {}) {
    const {
      repeat = false,
      startPaused = false,
      name = null,
      group = 'default'
    } = options;
    
    const id = this.timerId++;
    const now = performance.now();
    
    const timer = {
      id,
      name,
      group,
      callback,
      delay,
      repeat,
      created: now,
      startTime: now,
      pausedTime: 0,
      totalPausedTime: 0,
      executions: 0,
      state: startPaused ? 'paused' : 'running',
      nativeId: null
    };
    
    this.timers.set(id, timer);
    
    if (!startPaused && this.globalState === 'running') {
      this.scheduleTimer(timer);
    }
    
    return id;
  }
  
  /**
   * Schedule native timer for execution
   */
  scheduleTimer(timer) {
    if (timer.state !== 'running' || this.globalState !== 'running') return;
    
    const adjustedDelay = timer.delay - (performance.now() - timer.startTime - timer.totalPausedTime);
    const delay = Math.max(0, adjustedDelay);
    
    timer.nativeId = setTimeout(() => {
      if (timer.state === 'cancelled') return;
      
      try {
        timer.callback();
        timer.executions++;
        
        if (timer.repeat && timer.state === 'running') {
          // Reset timing for next execution
          timer.startTime = performance.now();
          timer.totalPausedTime = 0;
          this.scheduleTimer(timer);
        } else {
          // Single execution timer - clean up
          this.timers.delete(timer.id);
        }
      } catch (error) {
        console.error('Stateful timer callback error:', error);
      }
    }, delay);
  }
  
  /**
   * Pause specific timer
   */
  pauseTimer(id) {
    const timer = this.timers.get(id);
    if (timer && timer.state === 'running') {
      timer.state = 'paused';
      timer.pausedTime = performance.now();
      
      if (timer.nativeId) {
        clearTimeout(timer.nativeId);
        timer.nativeId = null;
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * Resume specific timer
   */
  resumeTimer(id) {
    const timer = this.timers.get(id);
    if (timer && timer.state === 'paused') {
      timer.state = 'running';
      timer.totalPausedTime += performance.now() - timer.pausedTime;
      timer.pausedTime = 0;
      
      if (this.globalState === 'running') {
        this.scheduleTimer(timer);
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * Cancel timer
   */
  cancelTimer(id) {
    const timer = this.timers.get(id);
    if (timer) {
      timer.state = 'cancelled';
      
      if (timer.nativeId) {
        clearTimeout(timer.nativeId);
        timer.nativeId = null;
      }
      
      this.timers.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Pause all timers globally
   */
  pauseAll() {
    if (this.globalState === 'running') {
      this.globalState = 'paused';
      this.globalPauseTime = performance.now();
      
      for (const timer of this.timers.values()) {
        if (timer.state === 'running') {
          this.pauseTimer(timer.id);
        }
      }
    }
  }
  
  /**
   * Resume all timers globally
   */
  resumeAll() {
    if (this.globalState === 'paused') {
      this.globalState = 'running';
      
      for (const timer of this.timers.values()) {
        if (timer.state === 'paused') {
          this.resumeTimer(timer.id);
        }
      }
    }
  }
  
  /**
   * Get timer information
   */
  getTimerInfo(id) {
    const timer = this.timers.get(id);
    if (timer) {
      const now = performance.now();
      return {
        id: timer.id,
        name: timer.name,
        group: timer.group,
        state: timer.state,
        delay: timer.delay,
        repeat: timer.repeat,
        executions: timer.executions,
        created: timer.created,
        runtime: now - timer.created - timer.totalPausedTime,
        totalPausedTime: timer.totalPausedTime
      };
    }
    return null;
  }
  
  /**
   * Get all timers by group
   */
  getTimersByGroup(group) {
    const timers = [];
    for (const timer of this.timers.values()) {
      if (timer.group === group) {
        timers.push(this.getTimerInfo(timer.id));
      }
    }
    return timers;
  }
}

// =======================
// Approach 5: Worker-based Timer for Background Processing
// =======================

/**
 * Timer system using Web Workers for precise timing
 * Unaffected by main thread blocking and provides better accuracy
 */
class WorkerTimer {
  constructor() {
    this.timers = new Map();
    this.timerId = 1;
    this.worker = null;
    this.initWorker();
  }
  
  /**
   * Initialize Web Worker for timer processing
   */
  initWorker() {
    // Create worker from inline script
    const workerScript = `
      const timers = new Map();
      
      self.onmessage = function(e) {
        const { action, id, delay, repeat } = e.data;
        
        switch (action) {
          case 'start':
            if (repeat) {
              const intervalId = setInterval(() => {
                self.postMessage({ type: 'tick', id });
              }, delay);
              timers.set(id, { type: 'interval', nativeId: intervalId });
            } else {
              const timeoutId = setTimeout(() => {
                self.postMessage({ type: 'tick', id });
                timers.delete(id);
              }, delay);
              timers.set(id, { type: 'timeout', nativeId: timeoutId });
            }
            break;
            
          case 'cancel':
            const timer = timers.get(id);
            if (timer) {
              if (timer.type === 'interval') {
                clearInterval(timer.nativeId);
              } else {
                clearTimeout(timer.nativeId);
              }
              timers.delete(id);
            }
            break;
            
          case 'cancelAll':
            for (const [timerId, timer] of timers) {
              if (timer.type === 'interval') {
                clearInterval(timer.nativeId);
              } else {
                clearTimeout(timer.nativeId);
              }
            }
            timers.clear();
            break;
        }
      };
    `;
    
    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      
      // Handle messages from worker
      this.worker.onmessage = (e) => {
        const { type, id } = e.data;
        
        if (type === 'tick') {
          const timer = this.timers.get(id);
          if (timer) {
            try {
              timer.callback.apply(timer.context, timer.args);
              timer.executions++;
            } catch (error) {
              console.error('Worker timer callback error:', error);
            }
            
            // Clean up non-repeating timers
            if (!timer.repeat) {
              this.timers.delete(id);
            }
          }
        }
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker timer error:', error);
      };
      
    } catch (error) {
      console.warn('Worker timers not supported, falling back to regular timers');
      this.worker = null;
    }
  }
  
  /**
   * Set timeout using worker
   */
  setTimeout(callback, delay, ...args) {
    const id = this.timerId++;
    
    this.timers.set(id, {
      callback,
      context: null,
      args,
      delay,
      repeat: false,
      executions: 0,
      startTime: performance.now()
    });
    
    if (this.worker) {
      this.worker.postMessage({
        action: 'start',
        id,
        delay,
        repeat: false
      });
    } else {
      // Fallback to regular setTimeout
      setTimeout(() => {
        const timer = this.timers.get(id);
        if (timer) {
          try {
            timer.callback.apply(timer.context, timer.args);
          } catch (error) {
            console.error('Fallback timer error:', error);
          }
          this.timers.delete(id);
        }
      }, delay);
    }
    
    return id;
  }
  
  /**
   * Set interval using worker
   */
  setInterval(callback, delay, ...args) {
    const id = this.timerId++;
    
    this.timers.set(id, {
      callback,
      context: null,
      args,
      delay,
      repeat: true,
      executions: 0,
      startTime: performance.now()
    });
    
    if (this.worker) {
      this.worker.postMessage({
        action: 'start',
        id,
        delay,
        repeat: true
      });
    } else {
      // Fallback to regular setInterval
      const intervalId = setInterval(() => {
        const timer = this.timers.get(id);
        if (timer) {
          try {
            timer.callback.apply(timer.context, timer.args);
            timer.executions++;
          } catch (error) {
            console.error('Fallback interval error:', error);
          }
        }
      }, delay);
      
      // Store native ID for cleanup
      this.timers.get(id).nativeId = intervalId;
    }
    
    return id;
  }
  
  /**
   * Clear timer
   */
  clearTimer(id) {
    const timer = this.timers.get(id);
    if (timer) {
      if (this.worker) {
        this.worker.postMessage({ action: 'cancel', id });
      } else if (timer.nativeId) {
        if (timer.repeat) {
          clearInterval(timer.nativeId);
        } else {
          clearTimeout(timer.nativeId);
        }
      }
      
      this.timers.delete(id);
      return true;
    }
    return false;
  }
  
  /**
   * Clear all timers
   */
  clearAll() {
    if (this.worker) {
      this.worker.postMessage({ action: 'cancelAll' });
    } else {
      // Clear native timers
      for (const timer of this.timers.values()) {
        if (timer.nativeId) {
          if (timer.repeat) {
            clearInterval(timer.nativeId);
          } else {
            clearTimeout(timer.nativeId);
          }
        }
      }
    }
    
    this.timers.clear();
  }
  
  /**
   * Cleanup worker resources
   */
  destroy() {
    this.clearAll();
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('\n=== Basic Timer System ===');

const basicTimer = new BasicTimerSystem();

// Test basic setTimeout
const timeoutId = basicTimer.setTimeout((msg) => {
  console.log('Basic timeout:', msg);
}, 1000, 'Hello World');

// Test basic setInterval
const intervalId = basicTimer.setInterval((count) => {
  console.log('Basic interval:', count);
}, 500, 1);

// Show active timers
setTimeout(() => {
  console.log('Active timers:', basicTimer.getActiveTimers());
  
  // Clear interval after a few executions
  setTimeout(() => {
    basicTimer.clearInterval(intervalId);
    console.log('Interval cleared');
  }, 2500);
}, 100);

console.log('\n=== Precision Timer ===');

const precisionTimer = new PrecisionTimer();

// Test drift correction
const startTime = performance.now();
let executionCount = 0;

const precisionId = precisionTimer.setInterval(() => {
  executionCount++;
  const elapsed = performance.now() - startTime;
  const expectedTime = executionCount * 100; // Should be exactly 100ms intervals
  const drift = elapsed - expectedTime;
  
  console.log(`Execution ${executionCount}: elapsed=${elapsed.toFixed(2)}ms, expected=${expectedTime}ms, drift=${drift.toFixed(2)}ms`);
  
  if (executionCount >= 5) {
    precisionTimer.clearInterval(precisionId);
    console.log('Final drift stats:', precisionTimer.getDriftStats(precisionId));
  }
}, 100);

console.log('\n=== Advanced Timer with Priorities ===');

const advancedTimer = new AdvancedTimer();

// Schedule timers with different priorities
advancedTimer.schedule(() => console.log('Low priority task'), 100, { priority: 1 });
advancedTimer.schedule(() => console.log('High priority task'), 100, { priority: 10 });
advancedTimer.schedule(() => console.log('Medium priority task'), 100, { priority: 5 });
advancedTimer.schedule(() => console.log('Immediate high priority'), 50, { priority: 10 });

// Show stats after execution
setTimeout(() => {
  console.log('Advanced timer stats:', advancedTimer.getStats());
}, 200);

console.log('\n=== Stateful Timer ===');

const statefulTimer = new StatefulTimer();

// Create timer with state management
const stateId = statefulTimer.createTimer(() => {
  console.log('Stateful timer tick');
}, 500, { repeat: true, name: 'Test Timer', group: 'main' });

// Pause after 1 second
setTimeout(() => {
  statefulTimer.pauseTimer(stateId);
  console.log('Timer paused');
  
  // Resume after another second
  setTimeout(() => {
    statefulTimer.resumeTimer(stateId);
    console.log('Timer resumed');
    
    // Cancel after final second
    setTimeout(() => {
      statefulTimer.cancelTimer(stateId);
      console.log('Timer cancelled');
    }, 1000);
  }, 1000);
}, 1000);

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Animation frame scheduler
 * Precise timing for smooth animations
 */
class AnimationScheduler {
  constructor() {
    this.precisionTimer = new PrecisionTimer();
    this.animations = new Map();
    this.animationId = 1;
  }
  
  createAnimation(updateCallback, duration, options = {}) {
    const {
      fps = 60,
      easing = (t) => t, // Linear easing by default
      onComplete = null
    } = options;
    
    const id = this.animationId++;
    const interval = 1000 / fps;
    const startTime = performance.now();
    
    const animation = {
      id,
      updateCallback,
      duration,
      easing,
      onComplete,
      startTime,
      currentTime: 0,
      progress: 0
    };
    
    this.animations.set(id, animation);
    
    // Start animation loop
    const timerId = this.precisionTimer.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      animation.currentTime = elapsed;
      animation.progress = easedProgress;
      
      try {
        updateCallback(easedProgress, elapsed);
      } catch (error) {
        console.error('Animation callback error:', error);
      }
      
      if (progress >= 1) {
        // Animation complete
        this.precisionTimer.clearInterval(timerId);
        this.animations.delete(id);
        
        if (onComplete) {
          try {
            onComplete();
          } catch (error) {
            console.error('Animation completion error:', error);
          }
        }
      }
    }, interval);
    
    animation.timerId = timerId;
    return id;
  }
  
  cancelAnimation(id) {
    const animation = this.animations.get(id);
    if (animation) {
      this.precisionTimer.clearInterval(animation.timerId);
      this.animations.delete(id);
      return true;
    }
    return false;
  }
}

/**
 * Use Case 2: Task scheduler with retry logic
 * Handle failed tasks with exponential backoff
 */
class TaskScheduler {
  constructor() {
    this.basicTimer = new BasicTimerSystem();
    this.tasks = new Map();
    this.taskId = 1;
  }
  
  scheduleTask(taskFunction, delay, options = {}) {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      retryMultiplier = 2,
      onSuccess = null,
      onFailure = null,
      onRetry = null
    } = options;
    
    const id = this.taskId++;
    const task = {
      id,
      taskFunction,
      delay,
      maxRetries,
      retryDelay,
      retryMultiplier,
      onSuccess,
      onFailure,
      onRetry,
      attempts: 0,
      started: performance.now()
    };
    
    this.tasks.set(id, task);
    this.executeTask(task);
    
    return id;
  }
  
  async executeTask(task) {
    const attempt = async () => {
      task.attempts++;
      
      try {
        const result = await task.taskFunction();
        
        // Task succeeded
        this.tasks.delete(task.id);
        
        if (task.onSuccess) {
          task.onSuccess(result, task.attempts);
        }
        
      } catch (error) {
        if (task.attempts < task.maxRetries) {
          // Retry with exponential backoff
          const retryDelay = task.retryDelay * Math.pow(task.retryMultiplier, task.attempts - 1);
          
          if (task.onRetry) {
            task.onRetry(error, task.attempts, retryDelay);
          }
          
          this.basicTimer.setTimeout(() => attempt(), retryDelay);
          
        } else {
          // Max retries exceeded
          this.tasks.delete(task.id);
          
          if (task.onFailure) {
            task.onFailure(error, task.attempts);
          }
        }
      }
    };
    
    // Initial execution
    this.basicTimer.setTimeout(() => attempt(), task.delay);
  }
  
  cancelTask(id) {
    return this.tasks.delete(id);
  }
  
  getTaskStats() {
    const stats = {
      active: this.tasks.size,
      tasks: []
    };
    
    for (const task of this.tasks.values()) {
      stats.tasks.push({
        id: task.id,
        attempts: task.attempts,
        maxRetries: task.maxRetries,
        elapsed: performance.now() - task.started
      });
    }
    
    return stats;
  }
}

// Test real-world examples
console.log('\n=== Real-world Examples ===');

// Animation example
const scheduler = new AnimationScheduler();
const animId = scheduler.createAnimation(
  (progress, elapsed) => {
    console.log(`Animation progress: ${(progress * 100).toFixed(1)}%`);
  },
  2000,
  {
    fps: 5, // Low FPS for demo
    easing: (t) => t * t, // Quadratic easing
    onComplete: () => console.log('Animation completed!')
  }
);

// Task scheduler example
const taskScheduler = new TaskScheduler();

// Simulate unreliable task
let taskAttempts = 0;
const unreliableTask = () => {
  return new Promise((resolve, reject) => {
    taskAttempts++;
    if (taskAttempts < 3) {
      reject(new Error(`Task failed (attempt ${taskAttempts})`));
    } else {
      resolve(`Task succeeded on attempt ${taskAttempts}`);
    }
  });
};

taskScheduler.scheduleTask(unreliableTask, 1000, {
  maxRetries: 5,
  retryDelay: 500,
  retryMultiplier: 1.5,
  onRetry: (error, attempt, delay) => {
    console.log(`Task retry ${attempt}: ${error.message}, next retry in ${delay}ms`);
  },
  onSuccess: (result, attempts) => {
    console.log(`Task success: ${result} after ${attempts} attempts`);
  },
  onFailure: (error, attempts) => {
    console.log(`Task failed permanently after ${attempts} attempts`);
  }
});

// Export all timer implementations
module.exports = {
  BasicTimerSystem,
  PrecisionTimer,
  AdvancedTimer,
  StatefulTimer,
  WorkerTimer,
  AnimationScheduler,
  TaskScheduler
};

/**
 * Key Interview Points:
 * 
 * 1. Timer Precision and Drift:
 *    - setInterval drifts over time due to execution delays
 *    - Drift correction requires tracking expected vs actual timing
 *    - performance.now() more accurate than Date.now()
 *    - Web Workers provide most accurate timing (unblocked by main thread)
 * 
 * 2. Memory and Resource Management:
 *    - Always clear timers to prevent memory leaks
 *    - Use WeakMap/Map for timer tracking
 *    - Cleanup event listeners and worker resources
 *    - Handle timer cancellation properly
 * 
 * 3. Error Handling:
 *    - Wrap timer callbacks in try-catch
 *    - Provide fallback mechanisms for unsupported features
 *    - Log errors without breaking timer execution
 *    - Handle edge cases like negative delays
 * 
 * 4. Performance Optimizations:
 *    - Use requestAnimationFrame for visual updates
 *    - Batch timer operations when possible
 *    - Implement priority queues for complex scheduling
 *    - Consider using Web Workers for intensive timing
 * 
 * 5. Advanced Features:
 *    - Pause/resume functionality for games
 *    - Priority-based execution
 *    - Drift correction for precision timing
 *    - Retry logic with exponential backoff
 */