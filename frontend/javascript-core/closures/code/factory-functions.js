/**
 * File: factory-functions.js
 * Description: Factory functions using closures for object creation
 * Demonstrates alternative to constructor functions and classes
 */

// === Basic Factory Function ===
function createPerson(name, age) {
  // Private variables
  let _name = name;
  let _age = age;
  let _id = Math.random().toString(36).substr(2, 9);
  
  // Private methods
  function validateAge(age) {
    return typeof age === 'number' && age >= 0 && age <= 150;
  }
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  // Public interface
  return {
    getName() {
      return _name;
    },
    
    setName(newName) {
      if (typeof newName === 'string' && newName.trim()) {
        _name = capitalize(newName.trim());
        return true;
      }
      return false;
    },
    
    getAge() {
      return _age;
    },
    
    setAge(newAge) {
      if (validateAge(newAge)) {
        _age = newAge;
        return true;
      }
      return false;
    },
    
    getId() {
      return _id;
    },
    
    getInfo() {
      return {
        id: _id,
        name: _name,
        age: _age,
        canVote: _age >= 18,
        category: _age < 18 ? 'minor' : 'adult'
      };
    },
    
    celebrateBirthday() {
      _age++;
      console.log(`Happy birthday ${_name}! Now ${_age} years old.`);
      return _age;
    }
  };
}

console.log('=== Basic Factory Function ===');
const person1 = createPerson('john doe', 25);
console.log('Person info:', person1.getInfo());
person1.setName('Jane Smith');
person1.celebrateBirthday();
console.log('Updated info:', person1.getInfo());

// === Advanced Factory with Inheritance ===
function createAnimal(species, name) {
  // Private state
  let _species = species;
  let _name = name;
  let _energy = 100;
  let _isAlive = true;
  
  const baseAnimal = {
    getName() {
      return _name;
    },
    
    getSpecies() {
      return _species;
    },
    
    getEnergy() {
      return _energy;
    },
    
    isAlive() {
      return _isAlive;
    },
    
    eat(amount = 10) {
      if (!_isAlive) return false;
      
      _energy = Math.min(_energy + amount, 100);
      console.log(`${_name} ate and gained energy. Energy: ${_energy}`);
      return _energy;
    },
    
    sleep(hours = 8) {
      if (!_isAlive) return false;
      
      const energyGain = hours * 5;
      _energy = Math.min(_energy + energyGain, 100);
      console.log(`${_name} slept for ${hours} hours. Energy: ${_energy}`);
      return _energy;
    },
    
    move(distance = 1) {
      if (!_isAlive) return false;
      
      const energyLoss = distance * 2;
      _energy = Math.max(_energy - energyLoss, 0);
      
      if (_energy === 0) {
        _isAlive = false;
        console.log(`${_name} has died from exhaustion!`);
      } else {
        console.log(`${_name} moved ${distance} units. Energy: ${_energy}`);
      }
      
      return _energy;
    },
    
    getStatus() {
      return {
        name: _name,
        species: _species,
        energy: _energy,
        isAlive: _isAlive,
        status: _energy > 75 ? 'energetic' : _energy > 25 ? 'tired' : 'exhausted'
      };
    }
  };
  
  return baseAnimal;
}

// Factory for specific animal types
function createDog(name, breed) {
  const animal = createAnimal('Dog', name);
  
  // Private dog-specific data
  let _breed = breed;
  let _tricks = [];
  let _loyalty = 100;
  
  // Enhance the animal with dog-specific methods
  return Object.assign(animal, {
    getBreed() {
      return _breed;
    },
    
    bark() {
      if (!animal.isAlive()) return false;
      
      console.log(`${animal.getName()}: Woof! Woof!`);
      return animal.move(0.1); // Barking uses a tiny bit of energy
    },
    
    learnTrick(trick) {
      if (!animal.isAlive()) return false;
      
      if (!_tricks.includes(trick)) {
        _tricks.push(trick);
        console.log(`${animal.getName()} learned a new trick: ${trick}`);
      }
      return _tricks.slice();
    },
    
    performTrick(trick) {
      if (!animal.isAlive()) return false;
      
      if (_tricks.includes(trick)) {
        console.log(`${animal.getName()} performs: ${trick}`);
        return animal.move(0.5);
      } else {
        console.log(`${animal.getName()} doesn't know how to ${trick}`);
        return false;
      }
    },
    
    getTricks() {
      return _tricks.slice();
    },
    
    getLoyalty() {
      return _loyalty;
    },
    
    getFullInfo() {
      return {
        ...animal.getStatus(),
        breed: _breed,
        tricks: _tricks,
        loyalty: _loyalty
      };
    }
  });
}

console.log('\n=== Factory with Inheritance ===');
const dog = createDog('Buddy', 'Golden Retriever');
console.log('Dog status:', dog.getFullInfo());

dog.bark();
dog.learnTrick('sit');
dog.learnTrick('fetch');
dog.performTrick('sit');
console.log('Learned tricks:', dog.getTricks());

// === Configuration-based Factory ===
function createConfigurableComponent(config = {}) {
  // Default configuration
  const defaultConfig = {
    width: 100,
    height: 100,
    color: '#000000',
    visible: true,
    draggable: false,
    resizable: false
  };
  
  // Merge configurations
  const _config = { ...defaultConfig, ...config };
  let _state = {
    x: 0,
    y: 0,
    isDragging: false,
    isSelected: false
  };
  
  // Private methods
  function validatePosition(x, y) {
    return typeof x === 'number' && typeof y === 'number';
  }
  
  function validateSize(width, height) {
    return typeof width === 'number' && width > 0 &&
           typeof height === 'number' && height > 0;
  }
  
  // Event system
  const _listeners = {};
  
  function emit(eventType, data) {
    if (_listeners[eventType]) {
      _listeners[eventType].forEach(callback => callback(data));
    }
  }
  
  return {
    // Configuration methods
    getConfig() {
      return { ..._config };
    },
    
    updateConfig(newConfig) {
      Object.assign(_config, newConfig);
      emit('config-changed', _config);
      return this;
    },
    
    // Position methods
    setPosition(x, y) {
      if (validatePosition(x, y)) {
        const oldPosition = { x: _state.x, y: _state.y };
        _state.x = x;
        _state.y = y;
        emit('position-changed', { from: oldPosition, to: { x, y } });
      }
      return this;
    },
    
    getPosition() {
      return { x: _state.x, y: _state.y };
    },
    
    move(deltaX, deltaY) {
      return this.setPosition(_state.x + deltaX, _state.y + deltaY);
    },
    
    // Size methods
    resize(width, height) {
      if (validateSize(width, height) && _config.resizable) {
        const oldSize = { width: _config.width, height: _config.height };
        _config.width = width;
        _config.height = height;
        emit('resized', { from: oldSize, to: { width, height } });
      }
      return this;
    },
    
    getSize() {
      return { width: _config.width, height: _config.height };
    },
    
    // State methods
    select() {
      _state.isSelected = true;
      emit('selected', this);
      return this;
    },
    
    deselect() {
      _state.isSelected = false;
      emit('deselected', this);
      return this;
    },
    
    show() {
      _config.visible = true;
      emit('shown', this);
      return this;
    },
    
    hide() {
      _config.visible = false;
      emit('hidden', this);
      return this;
    },
    
    // Event methods
    on(eventType, callback) {
      if (!_listeners[eventType]) {
        _listeners[eventType] = [];
      }
      _listeners[eventType].push(callback);
      return this;
    },
    
    off(eventType, callback) {
      if (_listeners[eventType]) {
        _listeners[eventType] = _listeners[eventType].filter(cb => cb !== callback);
      }
      return this;
    },
    
    // Utility methods
    getState() {
      return {
        config: { ..._config },
        state: { ..._state }
      };
    },
    
    clone() {
      return createConfigurableComponent({ ..._config });
    }
  };
}

console.log('\n=== Configurable Component Factory ===');
const component = createConfigurableComponent({
  width: 200,
  height: 150,
  color: '#FF0000',
  draggable: true,
  resizable: true
});

// Add event listeners
component.on('position-changed', (data) => {
  console.log('Position changed:', data);
});

component.on('resized', (data) => {
  console.log('Component resized:', data);
});

component.setPosition(10, 20);
component.resize(300, 200);
component.move(5, 5);

console.log('Final state:', component.getState());

// === Mixin Factory Pattern ===
function createMixin(behavior) {
  return function(target) {
    return Object.assign(target, behavior);
  };
}

// Define behaviors as mixins
const Flyable = createMixin({
  fly(distance = 1) {
    console.log(`Flying ${distance} units through the air!`);
    return this.move ? this.move(distance * 0.5) : true; // Flying is more efficient
  },
  
  land() {
    console.log('Landing on the ground');
    return true;
  }
});

const Swimmable = createMixin({
  swim(distance = 1) {
    console.log(`Swimming ${distance} units through water!`);
    return this.move ? this.move(distance * 0.8) : true; // Swimming is somewhat efficient
  },
  
  dive() {
    console.log('Diving underwater');
    return true;
  }
});

// Factory for flying animals
function createBird(name, species) {
  const animal = createAnimal(species, name);
  
  // Add flight capability
  return Flyable(animal);
}

// Factory for swimming animals  
function createFish(name, species) {
  const animal = createAnimal(species, name);
  
  // Add swimming capability
  return Swimmable(animal);
}

// Factory for versatile animals
function createDuck(name) {
  const animal = createAnimal('Duck', name);
  
  // Ducks can both fly and swim!
  return Swimmable(Flyable(animal));
}

console.log('\n=== Mixin Factory Pattern ===');
const eagle = createBird('Eddie', 'Eagle');
const salmon = createFish('Sam', 'Salmon');
const duck = createDuck('Daffy');

eagle.fly(10);
salmon.swim(5);
duck.fly(3);
duck.swim(2);

console.log('Eagle status:', eagle.getStatus());
console.log('Duck status:', duck.getStatus());

module.exports = {
  createPerson,
  createAnimal,
  createDog,
  createConfigurableComponent,
  createMixin,
  createBird,
  createFish,
  createDuck,
  Flyable,
  Swimmable
};