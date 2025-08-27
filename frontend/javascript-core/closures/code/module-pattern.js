/**
 * File: module-pattern.js
 * Description: Module pattern using closures for encapsulation
 */

// Classic Module Pattern
const Calculator = (function() {
  // Private variables
  let result = 0;
  let history = [];
  
  // Private functions
  function addToHistory(operation, value) {
    history.push({
      operation,
      value,
      result,
      timestamp: new Date()
    });
  }
  
  function validateNumber(n) {
    if (typeof n !== 'number' || isNaN(n)) {
      throw new Error('Invalid number');
    }
    return n;
  }
  
  // Public API
  return {
    add(n) {
      n = validateNumber(n);
      result += n;
      addToHistory('add', n);
      return this;
    },
    
    subtract(n) {
      n = validateNumber(n);
      result -= n;
      addToHistory('subtract', n);
      return this;
    },
    
    multiply(n) {
      n = validateNumber(n);
      result *= n;
      addToHistory('multiply', n);
      return this;
    },
    
    divide(n) {
      n = validateNumber(n);
      if (n === 0) throw new Error('Division by zero');
      result /= n;
      addToHistory('divide', n);
      return this;
    },
    
    getResult() {
      return result;
    },
    
    clear() {
      result = 0;
      addToHistory('clear', 0);
      return this;
    },
    
    getHistory() {
      return history.slice(); // Return copy
    }
  };
})();

// Revealing Module Pattern
const UserManager = (function() {
  // Private
  const users = new Map();
  let nextId = 1;
  
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function createUser(name, email) {
    if (!validateEmail(email)) {
      throw new Error('Invalid email');
    }
    
    const user = {
      id: nextId++,
      name,
      email,
      createdAt: new Date()
    };
    
    users.set(user.id, user);
    return { ...user }; // Return copy
  }
  
  function getUser(id) {
    const user = users.get(id);
    return user ? { ...user } : null;
  }
  
  function deleteUser(id) {
    return users.delete(id);
  }
  
  function listUsers() {
    return Array.from(users.values()).map(user => ({ ...user }));
  }
  
  function getUserCount() {
    return users.size;
  }
  
  // Reveal public methods
  return {
    create: createUser,
    get: getUser,
    delete: deleteUser,
    list: listUsers,
    count: getUserCount
  };
})();

// Module with configuration
const Logger = (function(config = {}) {
  // Private configuration
  const settings = {
    level: config.level || 'info',
    prefix: config.prefix || '[LOG]',
    timestamp: config.timestamp !== false
  };
  
  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  function shouldLog(level) {
    return levels[level] >= levels[settings.level];
  }
  
  function formatMessage(level, message) {
    let formatted = '';
    
    if (settings.timestamp) {
      formatted += new Date().toISOString() + ' ';
    }
    
    formatted += `${settings.prefix} [${level.toUpperCase()}] ${message}`;
    return formatted;
  }
  
  function log(level, message) {
    if (shouldLog(level)) {
      const formatted = formatMessage(level, message);
      
      switch(level) {
        case 'error':
          console.error(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        default:
          console.log(formatted);
      }
    }
  }
  
  return {
    debug: (msg) => log('debug', msg),
    info: (msg) => log('info', msg),
    warn: (msg) => log('warn', msg),
    error: (msg) => log('error', msg),
    
    setLevel(level) {
      if (levels[level] !== undefined) {
        settings.level = level;
      }
    },
    
    getSettings() {
      return { ...settings };
    }
  };
})({ level: 'debug', prefix: '[APP]' });

// Usage examples
console.log('Calculator Module:');
Calculator.add(10).multiply(2).subtract(5);
console.log(Calculator.getResult()); // 15
console.log(Calculator.getHistory());

console.log('\nUserManager Module:');
const user1 = UserManager.create('John Doe', 'john@example.com');
const user2 = UserManager.create('Jane Smith', 'jane@example.com');
console.log('Users:', UserManager.list());
console.log('Count:', UserManager.count());

console.log('\nLogger Module:');
Logger.debug('Debug message');
Logger.info('Info message');
Logger.warn('Warning message');
Logger.error('Error message');

module.exports = { Calculator, UserManager, Logger };