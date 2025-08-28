/**
 * File: state-machines.js
 * Description: State machine implementation using generators
 * Demonstrates how generators can manage complex state transitions
 */

console.log('=== Basic State Machine with Generator ===');

// Simple traffic light state machine
function* trafficLightStateMachine() {
  while (true) {
    console.log('🔴 RED - Stop');
    yield 'RED';
    
    console.log('🟢 GREEN - Go');
    yield 'GREEN';
    
    console.log('🟡 YELLOW - Caution');
    yield 'YELLOW';
  }
}

console.log('1. Traffic Light State Machine:');
const trafficLight = trafficLightStateMachine();

// Simulate traffic light cycles
for (let i = 0; i < 8; i++) {
  const state = trafficLight.next().value;
  console.log(`Current state: ${state}`);
}

console.log('\n=== Advanced State Machine ===');

// User authentication state machine
function* authStateMachine(initialState = 'LOGGED_OUT') {
  let currentState = initialState;
  let user = null;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (true) {
    const action = yield { state: currentState, user, attempts };
    
    switch (currentState) {
      case 'LOGGED_OUT':
        if (action.type === 'LOGIN') {
          currentState = 'LOGGING_IN';
          console.log('Attempting to log in...');
        }
        break;
        
      case 'LOGGING_IN':
        if (action.type === 'LOGIN_SUCCESS') {
          currentState = 'LOGGED_IN';
          user = action.user;
          attempts = 0;
          console.log(`Login successful for ${user.name}`);
        } else if (action.type === 'LOGIN_FAILURE') {
          attempts++;
          if (attempts >= maxAttempts) {
            currentState = 'LOCKED_OUT';
            console.log('Account locked due to too many failed attempts');
          } else {
            currentState = 'LOGGED_OUT';
            console.log(`Login failed. ${maxAttempts - attempts} attempts remaining`);
          }
        }
        break;
        
      case 'LOGGED_IN':
        if (action.type === 'LOGOUT') {
          currentState = 'LOGGED_OUT';
          user = null;
          console.log('Logged out successfully');
        } else if (action.type === 'SESSION_EXPIRED') {
          currentState = 'LOGGED_OUT';
          user = null;
          console.log('Session expired, please log in again');
        }
        break;
        
      case 'LOCKED_OUT':
        if (action.type === 'UNLOCK') {
          currentState = 'LOGGED_OUT';
          attempts = 0;
          console.log('Account unlocked');
        }
        break;
    }
  }
}

console.log('2. Authentication State Machine:');
const authSM = authStateMachine();

// Initialize
let authState = authSM.next();
console.log('Initial state:', authState.value);

// Simulate authentication flow
authState = authSM.next({ type: 'LOGIN' });
console.log('After LOGIN:', authState.value);

authState = authSM.next({ type: 'LOGIN_FAILURE' });
console.log('After LOGIN_FAILURE:', authState.value);

authState = authSM.next({ type: 'LOGIN' });
authState = authSM.next({ 
  type: 'LOGIN_SUCCESS', 
  user: { name: 'John Doe', id: 123 } 
});
console.log('After successful login:', authState.value);

console.log('\n=== Order Processing State Machine ===');

// E-commerce order state machine
function* orderStateMachine(orderId) {
  let currentState = 'PENDING';
  let orderData = {
    id: orderId,
    items: [],
    total: 0,
    paymentId: null,
    trackingNumber: null,
    timeline: []
  };
  
  function addToTimeline(state, message) {
    orderData.timeline.push({
      state,
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  addToTimeline(currentState, 'Order created');
  
  while (true) {
    const action = yield { 
      state: currentState, 
      order: { ...orderData },
      availableActions: getAvailableActions(currentState)
    };
    
    const previousState = currentState;
    
    switch (currentState) {
      case 'PENDING':
        if (action.type === 'CONFIRM') {
          currentState = 'CONFIRMED';
          orderData.items = action.items || [];
          orderData.total = action.total || 0;
          addToTimeline(currentState, `Order confirmed with ${orderData.items.length} items`);
        } else if (action.type === 'CANCEL') {
          currentState = 'CANCELLED';
          addToTimeline(currentState, 'Order cancelled by customer');
        }
        break;
        
      case 'CONFIRMED':
        if (action.type === 'PAY') {
          currentState = 'PAID';
          orderData.paymentId = action.paymentId;
          addToTimeline(currentState, `Payment processed: ${orderData.paymentId}`);
        } else if (action.type === 'CANCEL') {
          currentState = 'CANCELLED';
          addToTimeline(currentState, 'Order cancelled after confirmation');
        }
        break;
        
      case 'PAID':
        if (action.type === 'SHIP') {
          currentState = 'SHIPPED';
          orderData.trackingNumber = action.trackingNumber;
          addToTimeline(currentState, `Order shipped: ${orderData.trackingNumber}`);
        } else if (action.type === 'REFUND') {
          currentState = 'REFUNDED';
          addToTimeline(currentState, 'Payment refunded');
        }
        break;
        
      case 'SHIPPED':
        if (action.type === 'DELIVER') {
          currentState = 'DELIVERED';
          addToTimeline(currentState, 'Order delivered successfully');
        } else if (action.type === 'RETURN') {
          currentState = 'RETURNED';
          addToTimeline(currentState, 'Order returned by customer');
        }
        break;
        
      case 'DELIVERED':
        if (action.type === 'RETURN') {
          currentState = 'RETURNED';
          addToTimeline(currentState, 'Order returned after delivery');
        }
        break;
    }
    
    if (previousState !== currentState) {
      console.log(`Order ${orderId}: ${previousState} → ${currentState}`);
    }
  }
}

function getAvailableActions(state) {
  const actions = {
    'PENDING': ['CONFIRM', 'CANCEL'],
    'CONFIRMED': ['PAY', 'CANCEL'],
    'PAID': ['SHIP', 'REFUND'],
    'SHIPPED': ['DELIVER', 'RETURN'],
    'DELIVERED': ['RETURN'],
    'CANCELLED': [],
    'REFUNDED': [],
    'RETURNED': []
  };
  return actions[state] || [];
}

console.log('3. Order Processing State Machine:');
const orderSM = orderStateMachine('ORDER-123');

let orderState = orderSM.next();
console.log('Order created:', orderState.value.state);

orderState = orderSM.next({
  type: 'CONFIRM',
  items: ['laptop', 'mouse'],
  total: 1299.99
});
console.log('Available actions:', orderState.value.availableActions);

orderState = orderSM.next({
  type: 'PAY',
  paymentId: 'PAY-456'
});

orderState = orderSM.next({
  type: 'SHIP',
  trackingNumber: 'TRK-789'
});

orderState = orderSM.next({ type: 'DELIVER' });
console.log('Final order:', orderState.value.order);

console.log('\n=== Game State Machine ===');

// Simple game state machine
function* gameStateMachine() {
  let currentState = 'MENU';
  let gameData = {
    score: 0,
    lives: 3,
    level: 1,
    isPaused: false
  };
  
  while (true) {
    const action = yield { 
      state: currentState, 
      data: { ...gameData },
      canTransition: getValidTransitions(currentState)
    };
    
    switch (currentState) {
      case 'MENU':
        if (action.type === 'START_GAME') {
          currentState = 'PLAYING';
          gameData = { score: 0, lives: 3, level: 1, isPaused: false };
          console.log('Game started!');
        }
        break;
        
      case 'PLAYING':
        if (action.type === 'PAUSE') {
          currentState = 'PAUSED';
          gameData.isPaused = true;
          console.log('Game paused');
        } else if (action.type === 'PLAYER_DIED') {
          gameData.lives--;
          if (gameData.lives <= 0) {
            currentState = 'GAME_OVER';
            console.log('Game Over!');
          } else {
            console.log(`Player died. Lives remaining: ${gameData.lives}`);
          }
        } else if (action.type === 'LEVEL_COMPLETE') {
          gameData.level++;
          gameData.score += action.bonus || 1000;
          console.log(`Level ${gameData.level - 1} complete! Score: ${gameData.score}`);
        } else if (action.type === 'SCORE_UPDATE') {
          gameData.score += action.points || 0;
        }
        break;
        
      case 'PAUSED':
        if (action.type === 'RESUME') {
          currentState = 'PLAYING';
          gameData.isPaused = false;
          console.log('Game resumed');
        } else if (action.type === 'QUIT') {
          currentState = 'MENU';
          console.log('Returned to menu');
        }
        break;
        
      case 'GAME_OVER':
        if (action.type === 'RESTART') {
          currentState = 'PLAYING';
          gameData = { score: 0, lives: 3, level: 1, isPaused: false };
          console.log('Game restarted');
        } else if (action.type === 'MENU') {
          currentState = 'MENU';
          console.log('Returned to menu');
        }
        break;
    }
  }
}

function getValidTransitions(state) {
  const transitions = {
    'MENU': ['START_GAME'],
    'PLAYING': ['PAUSE', 'PLAYER_DIED', 'LEVEL_COMPLETE', 'SCORE_UPDATE'],
    'PAUSED': ['RESUME', 'QUIT'],
    'GAME_OVER': ['RESTART', 'MENU']
  };
  return transitions[state] || [];
}

console.log('4. Game State Machine:');
const gameSM = gameStateMachine();

let gameState = gameSM.next();
console.log('Initial state:', gameState.value);

gameState = gameSM.next({ type: 'START_GAME' });
gameState = gameSM.next({ type: 'SCORE_UPDATE', points: 500 });
gameState = gameSM.next({ type: 'LEVEL_COMPLETE', bonus: 2000 });
gameState = gameSM.next({ type: 'PAUSE' });
console.log('Paused state:', gameState.value);

gameState = gameSM.next({ type: 'RESUME' });
gameState = gameSM.next({ type: 'PLAYER_DIED' });
console.log('After player death:', gameState.value);

console.log('\n=== Async State Machine ===');

// State machine with async operations
function* asyncStateMachine() {
  let currentState = 'IDLE';
  let data = null;
  let error = null;
  
  while (true) {
    const action = yield { state: currentState, data, error };
    
    switch (currentState) {
      case 'IDLE':
        if (action.type === 'FETCH_START') {
          currentState = 'LOADING';
          data = null;
          error = null;
          console.log('Starting async operation...');
        }
        break;
        
      case 'LOADING':
        if (action.type === 'FETCH_SUCCESS') {
          currentState = 'SUCCESS';
          data = action.data;
          error = null;
          console.log('Async operation successful');
        } else if (action.type === 'FETCH_ERROR') {
          currentState = 'ERROR';
          data = null;
          error = action.error;
          console.log('Async operation failed');
        }
        break;
        
      case 'SUCCESS':
      case 'ERROR':
        if (action.type === 'RESET') {
          currentState = 'IDLE';
          data = null;
          error = null;
          console.log('State reset to idle');
        } else if (action.type === 'FETCH_START') {
          currentState = 'LOADING';
          data = null;
          error = null;
          console.log('Starting new async operation...');
        }
        break;
    }
  }
}

console.log('5. Async State Machine:');
const asyncSM = asyncStateMachine();

let asyncState = asyncSM.next();
console.log('Async initial:', asyncState.value);

asyncState = asyncSM.next({ type: 'FETCH_START' });
console.log('Loading state:', asyncState.value);

// Simulate async success
asyncState = asyncSM.next({ 
  type: 'FETCH_SUCCESS', 
  data: { users: ['Alice', 'Bob'], count: 2 } 
});
console.log('Success state:', asyncState.value);

// Reset and try error case
asyncState = asyncSM.next({ type: 'RESET' });
asyncState = asyncSM.next({ type: 'FETCH_START' });
asyncState = asyncSM.next({ 
  type: 'FETCH_ERROR', 
  error: new Error('Network timeout') 
});
console.log('Error state:', asyncState.value);

console.log('\n=== Interview Questions ===');

// Q1: Implement a state machine validator
function validateStateMachine(transitions, states) {
  // Check if all states in transitions are defined
  const definedStates = new Set(states);
  const usedStates = new Set();
  
  for (const [from, toStates] of Object.entries(transitions)) {
    usedStates.add(from);
    if (Array.isArray(toStates)) {
      toStates.forEach(state => usedStates.add(state));
    } else {
      Object.values(toStates).forEach(state => usedStates.add(state));
    }
  }
  
  const undefinedStates = [...usedStates].filter(state => !definedStates.has(state));
  const unusedStates = [...definedStates].filter(state => !usedStates.has(state));
  
  return {
    valid: undefinedStates.length === 0,
    undefinedStates,
    unusedStates
  };
}

const states = ['IDLE', 'LOADING', 'SUCCESS', 'ERROR'];
const transitions = {
  'IDLE': ['LOADING'],
  'LOADING': ['SUCCESS', 'ERROR'],
  'SUCCESS': ['IDLE'],
  'ERROR': ['IDLE'],
  'INVALID': ['IDLE'] // This state is not defined
};

console.log('Q1: State machine validation:');
console.log(validateStateMachine(transitions, states));

// Q2: Create a finite state machine class
class FiniteStateMachine {
  constructor(initialState, states, transitions) {
    this.currentState = initialState;
    this.states = new Set(states);
    this.transitions = transitions;
    this.history = [initialState];
  }
  
  canTransition(toState) {
    const allowedTransitions = this.transitions[this.currentState] || [];
    return allowedTransitions.includes(toState);
  }
  
  transition(toState) {
    if (!this.states.has(toState)) {
      throw new Error(`Invalid state: ${toState}`);
    }
    
    if (!this.canTransition(toState)) {
      throw new Error(`Cannot transition from ${this.currentState} to ${toState}`);
    }
    
    const previousState = this.currentState;
    this.currentState = toState;
    this.history.push(toState);
    
    return { from: previousState, to: toState };
  }
  
  getCurrentState() {
    return this.currentState;
  }
  
  getHistory() {
    return this.history.slice();
  }
  
  reset(state) {
    if (!this.states.has(state)) {
      throw new Error(`Invalid state: ${state}`);
    }
    this.currentState = state;
    this.history = [state];
  }
}

console.log('\nQ2: Finite State Machine Class:');
const fsm = new FiniteStateMachine('RED', 
  ['RED', 'YELLOW', 'GREEN'], 
  {
    'RED': ['GREEN'],
    'GREEN': ['YELLOW'],
    'YELLOW': ['RED']
  }
);

console.log('Initial state:', fsm.getCurrentState());
console.log('Transition:', fsm.transition('GREEN'));
console.log('Current state:', fsm.getCurrentState());

try {
  fsm.transition('RED'); // Invalid transition from GREEN to RED
} catch (error) {
  console.log('Invalid transition error:', error.message);
}

console.log('Valid next transition:', fsm.transition('YELLOW'));
console.log('History:', fsm.getHistory());

module.exports = {
  trafficLightStateMachine,
  authStateMachine,
  orderStateMachine,
  getAvailableActions,
  gameStateMachine,
  getValidTransitions,
  asyncStateMachine,
  validateStateMachine,
  FiniteStateMachine
};