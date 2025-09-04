/**
 * File: state-machine-implementation.js
 * 
 * Challenge: Implement comprehensive finite state machines for complex UI flows:
 * - Finite state machine with states, events, and transitions
 * - State guards and transition validation
 * - Action execution on enter/exit/transition
 * - Hierarchical and parallel state machines
 * - Integration with UI frameworks and event systems
 * 
 * Interview Focus:
 * - Understanding finite state machine concepts and theory
 * - Complex UI flow management and validation
 * - State modeling for real-world applications
 * - Performance optimization for state transitions
 * - Integration patterns with React/Vue and other frameworks
 * 
 * Companies: Airbnb, Spotify, Adobe, Figma (complex UI workflows)
 * Difficulty: Hard
 */

/**
 * APPROACH 1: Basic Finite State Machine
 * 
 * Simple FSM implementation with core concepts:
 * - States, events, transitions
 * - Basic validation and error handling
 * - Event-driven state changes
 * 
 * Time: O(1) for state transitions, O(n) for validation
 * Space: O(n) where n is number of states
 */
class BasicStateMachine {
  constructor(config) {
    // Core FSM components
    this.states = config.states || {}; // All possible states
    this.initialState = config.initialState; // Starting state
    this.currentState = this.initialState; // Current active state
    
    // Event handling
    this.listeners = new Map(); // Event listeners for state changes
    
    // Validation
    this.strictMode = config.strictMode !== false; // Strict transition validation
    
    // History tracking for debugging and rollback
    this.history = [this.initialState];
    this.maxHistorySize = config.maxHistorySize || 100;
    
    // Validate initial configuration
    this.validateConfiguration();
  }

  /**
   * Validate state machine configuration
   * Ensures all transitions reference valid states
   */
  validateConfiguration() {
    if (!this.initialState || !this.states[this.initialState]) {
      throw new Error(`Initial state "${this.initialState}" is not defined`);
    }
    
    // Validate all state transitions reference existing states
    for (const [stateName, stateConfig] of Object.entries(this.states)) {
      const transitions = stateConfig.on || {};
      
      for (const [event, targetState] of Object.entries(transitions)) {
        // Handle string target or object with target property
        const target = typeof targetState === 'string' 
          ? targetState 
          : targetState.target;
          
        if (!this.states[target]) {
          throw new Error(
            `Transition from "${stateName}" on "${event}" ` +
            `references invalid state "${target}"`
          );
        }
      }
    }
  }

  /**
   * Send an event to the state machine
   * Core method for driving state transitions
   */
  send(event, payload = {}) {
    const currentStateConfig = this.states[this.currentState];
    const transitions = currentStateConfig.on || {};
    
    // Check if event is valid for current state
    if (!transitions[event]) {
      if (this.strictMode) {
        throw new Error(
          `Event "${event}" is not valid for state "${this.currentState}"`
        );
      }
      // In non-strict mode, ignore invalid events
      return this.currentState;
    }
    
    const transition = transitions[event];
    const targetState = typeof transition === 'string' 
      ? transition 
      : transition.target;
    
    // Execute transition with validation
    return this.transition(targetState, event, payload);
  }

  /**
   * Execute state transition with proper lifecycle
   * Handles exit actions, transition actions, and enter actions
   */
  transition(targetState, event, payload) {
    const previousState = this.currentState;
    const previousStateConfig = this.states[previousState];
    const targetStateConfig = this.states[targetState];
    
    // Create transition context for actions
    const context = {
      from: previousState,
      to: targetState,
      event,
      payload,
      machine: this
    };
    
    try {
      // Execute exit actions for current state
      if (previousStateConfig.exit) {
        this.executeAction(previousStateConfig.exit, context);
      }
      
      // Execute transition action if defined
      const transition = previousStateConfig.on[event];
      if (typeof transition === 'object' && transition.actions) {
        this.executeAction(transition.actions, context);
      }
      
      // Update current state
      this.currentState = targetState;
      
      // Execute enter actions for new state
      if (targetStateConfig.enter) {
        this.executeAction(targetStateConfig.enter, context);
      }
      
      // Track history
      this.addToHistory(targetState);
      
      // Notify listeners
      this.notifyListeners(previousState, targetState, event, payload);
      
      return this.currentState;
      
    } catch (error) {
      // Rollback on action failure
      this.currentState = previousState;
      throw new Error(
        `Transition from "${previousState}" to "${targetState}" failed: ${error.message}`
      );
    }
  }

  /**
   * Execute action(s) with error handling
   * Actions can be functions, arrays of functions, or objects
   */
  executeAction(action, context) {
    if (typeof action === 'function') {
      action(context);
    } else if (Array.isArray(action)) {
      action.forEach(a => this.executeAction(a, context));
    } else if (typeof action === 'object') {
      // Handle action objects with type and parameters
      if (action.type && this.actionHandlers[action.type]) {
        this.actionHandlers[action.type](action, context);
      }
    }
  }

  /**
   * Add state change listener
   * Enables reactive behavior and integration with UI frameworks
   */
  onTransition(listener) {
    const id = Symbol('listener');
    this.listeners.set(id, listener);
    
    // Return unsubscribe function
    return () => this.listeners.delete(id);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(from, to, event, payload) {
    const transitionData = { from, to, event, payload, machine: this };
    
    for (const listener of this.listeners.values()) {
      try {
        listener(transitionData);
      } catch (error) {
        console.error('State machine listener error:', error);
      }
    }
  }

  /**
   * Add state to history with size management
   */
  addToHistory(state) {
    this.history.push(state);
    
    // Maintain history size limit
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Check if state machine can handle an event
   * Useful for UI validation and conditional rendering
   */
  can(event) {
    const currentStateConfig = this.states[this.currentState];
    const transitions = currentStateConfig.on || {};
    return transitions.hasOwnProperty(event);
  }

  /**
   * Get current state information
   */
  getState() {
    return {
      value: this.currentState,
      config: this.states[this.currentState],
      history: [...this.history],
      availableEvents: Object.keys(this.states[this.currentState].on || {})
    };
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.currentState = this.initialState;
    this.history = [this.initialState];
    this.notifyListeners(null, this.initialState, 'RESET', {});
  }
}

/**
 * APPROACH 2: Advanced State Machine with Guards and Context
 * 
 * Production-ready FSM with advanced features:
 * - Guard conditions for conditional transitions
 * - Extended state (context) management
 * - Delayed transitions and timeouts
 * - State machine composition
 * 
 * Time: O(1) for transitions, O(g) for guard evaluation
 * Space: O(n + c) where n = states, c = context size
 */
class AdvancedStateMachine extends BasicStateMachine {
  constructor(config) {
    super(config);
    
    // Extended state (context) - data that lives alongside the finite state
    this.context = config.context || {};
    this.initialContext = { ...this.context };
    
    // Guard functions for conditional transitions
    this.guards = config.guards || {};
    
    // Action handlers for organized action execution
    this.actionHandlers = {
      assign: (action, context) => this.assign(action.assignment),
      log: (action, context) => console.log(action.message || 'State transition', context),
      delay: (action, context) => this.scheduleDelayedEvent(action.event, action.delay),
      ...config.actionHandlers
    };
    
    // Delayed event tracking
    this.delayedEvents = new Map();
    this.timers = new Map();
    
    // State entry/exit tracking for debugging
    this.stateMetrics = new Map();
  }

  /**
   * Enhanced send method with guard validation
   */
  send(event, payload = {}) {
    const currentStateConfig = this.states[this.currentState];
    const transitions = currentStateConfig.on || {};
    
    if (!transitions[event]) {
      if (this.strictMode) {
        throw new Error(
          `Event "${event}" is not valid for state "${this.currentState}"`
        );
      }
      return this.currentState;
    }
    
    const transition = transitions[event];
    const targetState = typeof transition === 'string' 
      ? transition 
      : transition.target;
    
    // Evaluate guards before transition
    if (typeof transition === 'object' && transition.cond) {
      const guardResult = this.evaluateGuard(transition.cond, event, payload);
      if (!guardResult) {
        // Guard failed - transition not allowed
        return this.currentState;
      }
    }
    
    return this.transition(targetState, event, payload);
  }

  /**
   * Evaluate guard conditions
   * Guards can be function references, inline functions, or expressions
   */
  evaluateGuard(guard, event, payload) {
    const guardContext = {
      context: this.context,
      event: { type: event, ...payload },
      state: this.currentState
    };
    
    if (typeof guard === 'string') {
      // Named guard function
      const guardFn = this.guards[guard];
      if (!guardFn) {
        throw new Error(`Guard "${guard}" is not defined`);
      }
      return guardFn(guardContext);
    } else if (typeof guard === 'function') {
      // Inline guard function
      return guard(guardContext);
    } else if (Array.isArray(guard)) {
      // Multiple guards - all must pass (AND logic)
      return guard.every(g => this.evaluateGuard(g, event, payload));
    }
    
    return true; // Default to allowing transition
  }

  /**
   * Assign values to context (extended state)
   * Core pattern for managing data alongside finite state
   */
  assign(assignment) {
    if (typeof assignment === 'function') {
      // Function receives current context and returns updates
      const updates = assignment(this.context);
      this.context = { ...this.context, ...updates };
    } else if (typeof assignment === 'object') {
      // Direct object assignment
      this.context = { ...this.context, ...assignment };
    }
    
    // Notify context changes
    this.notifyContextChange();
  }

  /**
   * Schedule delayed event
   * Useful for timeouts, auto-transitions, and timed workflows
   */
  scheduleDelayedEvent(event, delay) {
    const timeoutId = setTimeout(() => {
      this.send(event);
      this.delayedEvents.delete(event);
      this.timers.delete(event);
    }, delay);
    
    // Track for cleanup
    this.delayedEvents.set(event, Date.now() + delay);
    this.timers.set(event, timeoutId);
    
    return timeoutId;
  }

  /**
   * Cancel delayed event
   */
  cancelDelayedEvent(event) {
    const timeoutId = this.timers.get(event);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.delayedEvents.delete(event);
      this.timers.delete(event);
      return true;
    }
    return false;
  }

  /**
   * Enhanced transition with context and metrics
   */
  transition(targetState, event, payload) {
    const startTime = Date.now();
    
    // Record state exit metrics
    this.recordStateMetrics(this.currentState, 'exit');
    
    // Execute transition with context updates
    const result = super.transition(targetState, event, payload);
    
    // Record state entry metrics
    this.recordStateMetrics(targetState, 'enter');
    
    // Track transition performance
    const transitionTime = Date.now() - startTime;
    this.recordTransitionMetrics(this.currentState, targetState, event, transitionTime);
    
    return result;
  }

  /**
   * Record state metrics for performance monitoring
   */
  recordStateMetrics(state, type) {
    if (!this.stateMetrics.has(state)) {
      this.stateMetrics.set(state, {
        entries: 0,
        exits: 0,
        totalTime: 0,
        lastEnter: null
      });
    }
    
    const metrics = this.stateMetrics.get(state);
    
    if (type === 'enter') {
      metrics.entries++;
      metrics.lastEnter = Date.now();
    } else if (type === 'exit' && metrics.lastEnter) {
      metrics.exits++;
      metrics.totalTime += Date.now() - metrics.lastEnter;
    }
  }

  /**
   * Record transition metrics
   */
  recordTransitionMetrics(from, to, event, duration) {
    // Could integrate with monitoring systems
    if (duration > 100) { // Log slow transitions
      console.warn(
        `Slow state transition: ${from} -> ${to} (${event}) took ${duration}ms`
      );
    }
  }

  /**
   * Notify context change listeners
   */
  notifyContextChange() {
    const contextChangeData = {
      context: this.context,
      state: this.currentState,
      machine: this
    };
    
    // Could emit specific context change events
    this.notifyListeners(null, null, 'CONTEXT_CHANGE', contextChangeData);
  }

  /**
   * Get comprehensive machine state including context
   */
  getState() {
    return {
      ...super.getState(),
      context: { ...this.context },
      delayedEvents: Object.fromEntries(this.delayedEvents),
      metrics: Object.fromEntries(this.stateMetrics)
    };
  }

  /**
   * Reset machine to initial state and context
   */
  reset() {
    // Cancel all delayed events
    for (const timeoutId of this.timers.values()) {
      clearTimeout(timeoutId);
    }
    this.delayedEvents.clear();
    this.timers.clear();
    
    // Reset context
    this.context = { ...this.initialContext };
    
    // Reset state metrics
    this.stateMetrics.clear();
    
    super.reset();
  }

  /**
   * Cleanup method for proper resource management
   */
  destroy() {
    this.reset();
    this.listeners.clear();
  }
}

/**
 * APPROACH 3: Hierarchical State Machine
 * 
 * Enterprise-level FSM supporting:
 * - Nested states and state composition
 * - Parallel state machines
 * - State machine factories and reusability
 * - Complex workflow management
 * 
 * Time: O(d) where d is hierarchy depth
 * Space: O(n * d) for nested states
 */
class HierarchicalStateMachine extends AdvancedStateMachine {
  constructor(config) {
    super(config);
    
    // Support for nested states
    this.stateTypes = new Map(); // Track state types (atomic, compound, parallel)
    this.activeStates = new Set([this.currentState]); // All active states in hierarchy
    this.childMachines = new Map(); // Child state machines
    
    // Initialize state hierarchy
    this.initializeHierarchy();
  }

  /**
   * Initialize state hierarchy and child machines
   */
  initializeHierarchy() {
    for (const [stateName, stateConfig] of Object.entries(this.states)) {
      if (stateConfig.states) {
        // Compound state with child states
        this.stateTypes.set(stateName, 'compound');
        
        // Create child machine for nested states
        const childMachine = new HierarchicalStateMachine({
          states: stateConfig.states,
          initialState: stateConfig.initial,
          context: this.context,
          strictMode: this.strictMode
        });
        
        this.childMachines.set(stateName, childMachine);
        
        // Forward child events to parent
        childMachine.onTransition((transition) => {
          this.handleChildTransition(stateName, transition);
        });
        
      } else if (stateConfig.type === 'parallel') {
        // Parallel state - multiple child machines run simultaneously
        this.stateTypes.set(stateName, 'parallel');
        // Implementation would create multiple parallel child machines
        
      } else {
        // Atomic state - no children
        this.stateTypes.set(stateName, 'atomic');
      }
    }
  }

  /**
   * Handle child state machine transitions
   */
  handleChildTransition(parentState, childTransition) {
    if (this.currentState === parentState) {
      // Update active states to include child state
      this.activeStates.add(`${parentState}.${childTransition.to}`);
      this.activeStates.delete(`${parentState}.${childTransition.from}`);
      
      // Propagate child transition to parent listeners
      this.notifyListeners(
        `${parentState}.${childTransition.from}`,
        `${parentState}.${childTransition.to}`,
        childTransition.event,
        childTransition.payload
      );
    }
  }

  /**
   * Enhanced send that handles hierarchical events
   */
  send(event, payload = {}) {
    // First try to handle at current level
    const currentResult = super.send(event, payload);
    
    // If not handled at current level, try child machines
    if (currentResult === this.currentState && this.childMachines.has(this.currentState)) {
      const childMachine = this.childMachines.get(this.currentState);
      childMachine.send(event, payload);
    }
    
    return this.currentState;
  }

  /**
   * Get hierarchical state information
   */
  getState() {
    const baseState = super.getState();
    
    // Add child state information
    const childStates = {};
    for (const [parentState, childMachine] of this.childMachines) {
      if (this.currentState === parentState) {
        childStates[parentState] = childMachine.getState();
      }
    }
    
    return {
      ...baseState,
      activeStates: Array.from(this.activeStates),
      childStates
    };
  }
}

// =============================================================================
// PRACTICAL EXAMPLES AND PATTERNS
// =============================================================================

/**
 * Example 1: User Authentication Flow
 * Common real-world state machine for login/auth processes
 */
function createAuthStateMachine() {
  return new AdvancedStateMachine({
    initialState: 'idle',
    context: {
      user: null,
      loginAttempts: 0,
      errors: []
    },
    states: {
      idle: {
        on: {
          LOGIN_START: 'authenticating'
        }
      },
      authenticating: {
        enter: (ctx) => {
          console.log('Starting authentication...');
          // Clear previous errors
          ctx.machine.assign({ errors: [] });
        },
        on: {
          LOGIN_SUCCESS: {
            target: 'authenticated',
            actions: [
              { type: 'assign', assignment: (ctx) => ({ 
                user: ctx.payload.user,
                loginAttempts: 0 
              })},
              { type: 'log', message: 'Login successful' }
            ]
          },
          LOGIN_FAILURE: {
            target: 'idle',
            cond: 'canRetryLogin',
            actions: [
              { type: 'assign', assignment: (ctx) => ({ 
                loginAttempts: ctx.context.loginAttempts + 1,
                errors: [...ctx.context.errors, ctx.payload.error]
              })}
            ]
          },
          LOGIN_FAILURE: {
            target: 'locked',
            actions: [
              { type: 'assign', assignment: { locked: true }},
              { type: 'delay', event: 'UNLOCK', delay: 300000 } // 5 minute lockout
            ]
          }
        }
      },
      authenticated: {
        on: {
          LOGOUT: 'idle',
          TOKEN_EXPIRED: 'idle'
        },
        exit: (ctx) => {
          ctx.machine.assign({ user: null });
        }
      },
      locked: {
        enter: (ctx) => {
          console.log('Account locked due to too many failed attempts');
        },
        on: {
          UNLOCK: 'idle'
        }
      }
    },
    guards: {
      canRetryLogin: ({ context }) => context.loginAttempts < 3
    }
  });
}

/**
 * Example 2: E-commerce Checkout Flow
 * Complex multi-step process with validation and error handling
 */
function createCheckoutStateMachine() {
  return new AdvancedStateMachine({
    initialState: 'cart',
    context: {
      items: [],
      shippingAddress: null,
      paymentMethod: null,
      total: 0
    },
    states: {
      cart: {
        on: {
          CHECKOUT_START: {
            target: 'shipping',
            cond: 'hasItems'
          }
        }
      },
      shipping: {
        on: {
          SHIPPING_COMPLETE: {
            target: 'payment',
            actions: [
              { type: 'assign', assignment: (ctx) => ({ 
                shippingAddress: ctx.payload.address 
              })}
            ]
          },
          BACK_TO_CART: 'cart'
        }
      },
      payment: {
        on: {
          PAYMENT_SUBMIT: 'processing',
          BACK_TO_SHIPPING: 'shipping'
        }
      },
      processing: {
        enter: (ctx) => {
          // Simulate payment processing
          setTimeout(() => {
            const success = Math.random() > 0.2; // 80% success rate
            ctx.machine.send(success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILURE');
          }, 2000);
        },
        on: {
          PAYMENT_SUCCESS: 'completed',
          PAYMENT_FAILURE: 'payment'
        }
      },
      completed: {
        enter: (ctx) => {
          console.log('Order completed!', ctx.context);
        },
        on: {
          NEW_ORDER: 'cart'
        }
      }
    },
    guards: {
      hasItems: ({ context }) => context.items.length > 0
    }
  });
}

/**
 * Example 3: Media Player State Machine
 * Demonstrates state machine for media playback control
 */
function createMediaPlayerStateMachine() {
  return new AdvancedStateMachine({
    initialState: 'idle',
    context: {
      currentTime: 0,
      duration: 0,
      volume: 1,
      src: null
    },
    states: {
      idle: {
        on: {
          LOAD: {
            target: 'loading',
            actions: [
              { type: 'assign', assignment: (ctx) => ({ src: ctx.payload.src })}
            ]
          }
        }
      },
      loading: {
        on: {
          LOAD_SUCCESS: 'paused',
          LOAD_ERROR: 'error'
        }
      },
      paused: {
        on: {
          PLAY: 'playing',
          SEEK: {
            target: 'paused',
            actions: [
              { type: 'assign', assignment: (ctx) => ({ 
                currentTime: ctx.payload.time 
              })}
            ]
          }
        }
      },
      playing: {
        enter: (ctx) => {
          console.log('Media playing...');
        },
        on: {
          PAUSE: 'paused',
          END: 'ended',
          SEEK: {
            target: 'playing',
            actions: [
              { type: 'assign', assignment: (ctx) => ({ 
                currentTime: ctx.payload.time 
              })}
            ]
          }
        }
      },
      ended: {
        on: {
          REPLAY: 'playing',
          LOAD: 'loading'
        }
      },
      error: {
        on: {
          RETRY: 'loading',
          RESET: 'idle'
        }
      }
    }
  });
}

// =============================================================================
// INTEGRATION PATTERNS
// =============================================================================

/**
 * React integration hook for state machines
 * Shows how to integrate FSM with React component lifecycle
 */
function useStateMachine(machineFactory, options = {}) {
  // In real React: const [machine] = useState(() => machineFactory(options));
  // In real React: const [state, setState] = useState(machine.getState());
  
  const machine = machineFactory(options);
  let state = machine.getState();
  
  // In real React: useEffect(() => {
  const unsubscribe = machine.onTransition((transition) => {
    // setState(machine.getState());
    state = machine.getState();
    
    // Optional callback for side effects
    if (options.onTransition) {
      options.onTransition(transition);
    }
  });
  
  // In real React: return () => unsubscribe();
  // }, [machine]);
  
  return {
    state: state.value,
    context: state.context,
    send: machine.send.bind(machine),
    can: machine.can.bind(machine),
    machine
  };
}

/**
 * Vue integration pattern (conceptual)
 */
function createVueStateMachinePlugin() {
  return {
    install(app) {
      app.config.globalProperties.$stateMachine = {
        create: (config) => new AdvancedStateMachine(config),
        useStateMachine: (machine) => {
          // Vue reactivity integration
          const state = app.reactive(machine.getState());
          
          machine.onTransition(() => {
            Object.assign(state, machine.getState());
          });
          
          return {
            state,
            send: machine.send.bind(machine),
            can: machine.can.bind(machine)
          };
        }
      };
    }
  };
}

// =============================================================================
// INTERVIEW QUESTIONS AND FOLLOW-UPS
// =============================================================================

/**
 * State Machine Interview Questions:
 * 
 * Q1: "What's the difference between finite state and extended state?"
 * A: Finite state is the current mode/status. Extended state (context) is additional data.
 *    FSM defines behavior, context holds data.
 * 
 * Q2: "How do you handle complex UI workflows with state machines?"
 * A: Break into discrete states, define clear transitions, use guards for validation,
 *    implement hierarchical states for complex flows.
 * 
 * Q3: "What are the benefits of state machines over regular state management?"
 * A: Explicit state modeling, impossible states prevention, predictable transitions,
 *    better testing, visual workflow representation.
 * 
 * Q4: "How do you test state machines?"
 * A: Test transitions, guard conditions, actions, edge cases, state reachability.
 * 
 * Q5: "When would you choose state machines over other patterns?"
 * A: Complex workflows, multi-step processes, state-dependent behavior,
 *    need for state visualization, preventing impossible states.
 * 
 * Follow-up Questions:
 * - "How do you handle async operations in state machines?"
 * - "What's the difference between statecharts and finite state machines?"
 * - "How do you integrate state machines with Redux?"
 * - "What are parallel states and when would you use them?"
 * - "How do you debug complex state machine workflows?"
 * 
 * Real-world Applications:
 * - User onboarding flows
 * - Form validation workflows  
 * - Media player controls
 * - E-commerce checkout
 * - Game state management
 * - Authentication flows
 */

// Export implementations
module.exports = {
  BasicStateMachine,
  AdvancedStateMachine,
  HierarchicalStateMachine,
  
  // Example factories
  createAuthStateMachine,
  createCheckoutStateMachine,
  createMediaPlayerStateMachine,
  
  // Integration patterns
  useStateMachine,
  createVueStateMachinePlugin
};