/**
 * File: chain-calculator.js
 * Description: Calculator class implementation with method chaining support
 * 
 * Learning objectives:
 * - Understand method chaining pattern in JavaScript
 * - Learn how to return 'this' for fluent interfaces
 * - See builder pattern in action with mathematical operations
 * 
 * Time Complexity: O(1) for each operation
 * Space Complexity: O(1)
 */

// =======================
// Approach 1: Basic Chain Calculator
// =======================

/**
 * Basic calculator implementation with method chaining
 * Each method returns 'this' to enable chaining operations
 * 
 * Mental model: Think of a traditional calculator where you can perform
 * multiple operations in sequence and get the final result
 */
class BasicCalculator {
  constructor(initialValue = 0) {
    // Store the current value - this is our accumulator
    this.value = initialValue;
  }

  // Addition operation - adds amount to current value
  add(amount) {
    this.value += amount;
    return this; // Key for chaining - return the instance itself
  }

  // Subtraction operation - subtracts amount from current value
  subtract(amount) {
    this.value -= amount;
    return this; // Enable method chaining
  }

  // Multiplication operation - multiplies current value by factor
  multiply(factor) {
    this.value *= factor;
    return this; // Enable method chaining
  }

  // Division operation - divides current value by divisor
  divide(divisor) {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    this.value /= divisor;
    return this; // Enable method chaining
  }

  // Get the final computed value
  getValue() {
    return this.value;
  }

  // Reset calculator to initial state
  reset(newValue = 0) {
    this.value = newValue;
    return this;
  }
}

// =======================
// Approach 2: Enhanced Calculator with History
// =======================

/**
 * Enhanced calculator that maintains operation history
 * Useful for debugging and understanding calculation steps
 */
class AdvancedCalculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
    this.history = [`Initial: ${initialValue}`];
  }

  add(amount) {
    const oldValue = this.value;
    this.value += amount;
    this.history.push(`${oldValue} + ${amount} = ${this.value}`);
    return this;
  }

  subtract(amount) {
    const oldValue = this.value;
    this.value -= amount;
    this.history.push(`${oldValue} - ${amount} = ${this.value}`);
    return this;
  }

  multiply(factor) {
    const oldValue = this.value;
    this.value *= factor;
    this.history.push(`${oldValue} * ${factor} = ${this.value}`);
    return this;
  }

  divide(divisor) {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    const oldValue = this.value;
    this.value /= divisor;
    this.history.push(`${oldValue} / ${divisor} = ${this.value}`);
    return this;
  }

  // Power operation - raises current value to given exponent
  power(exponent) {
    const oldValue = this.value;
    this.value = Math.pow(this.value, exponent);
    this.history.push(`${oldValue} ^ ${exponent} = ${this.value}`);
    return this;
  }

  // Square root operation
  sqrt() {
    if (this.value < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    const oldValue = this.value;
    this.value = Math.sqrt(this.value);
    this.history.push(`√${oldValue} = ${this.value}`);
    return this;
  }

  getValue() {
    return this.value;
  }

  // Get calculation history
  getHistory() {
    return [...this.history]; // Return copy to prevent mutation
  }

  // Clear history but keep current value
  clearHistory() {
    this.history = [`Current: ${this.value}`];
    return this;
  }

  reset(newValue = 0) {
    this.value = newValue;
    this.history = [`Reset: ${newValue}`];
    return this;
  }
}

// =======================
// Approach 3: Functional Calculator with Immutability
// =======================

/**
 * Functional approach where each operation returns a new calculator instance
 * This ensures immutability - original calculator remains unchanged
 */
class ImmutableCalculator {
  constructor(value = 0, history = []) {
    // Make properties read-only
    Object.defineProperty(this, 'value', { value, writable: false });
    Object.defineProperty(this, 'history', { value: [...history], writable: false });
  }

  add(amount) {
    return new ImmutableCalculator(
      this.value + amount,
      [...this.history, `add(${amount})`]
    );
  }

  subtract(amount) {
    return new ImmutableCalculator(
      this.value - amount,
      [...this.history, `subtract(${amount})`]
    );
  }

  multiply(factor) {
    return new ImmutableCalculator(
      this.value * factor,
      [...this.history, `multiply(${factor})`]
    );
  }

  divide(divisor) {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new ImmutableCalculator(
      this.value / divisor,
      [...this.history, `divide(${divisor})`]
    );
  }

  getValue() {
    return this.value;
  }

  getOperations() {
    return [...this.history];
  }
}

// =======================
// Usage Examples and Test Cases
// =======================

console.log('=== Basic Calculator Examples ===');

// Example 1: Basic chaining operations
const calc1 = new BasicCalculator(2);
const result1 = calc1.add(3).multiply(4).subtract(5).getValue();
console.log(`Basic calculation: 2 + 3 * 4 - 5 = ${result1}`); // 15

// Example 2: More complex operations
const calc2 = new BasicCalculator(10);
const result2 = calc2.divide(2).add(8).multiply(3).subtract(7).getValue();
console.log(`Complex calculation: ((10 / 2) + 8) * 3 - 7 = ${result2}`); // 32

console.log('\n=== Advanced Calculator with History ===');

// Example 3: Calculator with history tracking
const advCalc = new AdvancedCalculator(5);
const result3 = advCalc.add(10).multiply(2).sqrt().getValue();
console.log(`Result: ${result3}`);
console.log('History:', advCalc.getHistory());

console.log('\n=== Immutable Calculator ===');

// Example 4: Immutable operations
const immutable = new ImmutableCalculator(8);
const step1 = immutable.add(2);
const step2 = step1.multiply(3);
const final = step2.subtract(4);

console.log(`Original: ${immutable.getValue()}`); // 8
console.log(`After operations: ${final.getValue()}`); // 26
console.log('Operations:', final.getOperations());

// =======================
// Real-world Use Cases
// =======================

/**
 * Use Case 1: Financial Calculator
 * Calculate compound interest with method chaining
 */
function calculateCompoundInterest(principal, rate, years) {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  
  return new BasicCalculator(1)
    .add(monthlyRate)
    .power(numberOfPayments)
    .multiply(principal)
    .getValue();
}

// Example: $1000 at 5% annual rate for 2 years
const compoundInterest = calculateCompoundInterest(1000, 5, 2);
console.log(`\nCompound Interest: $${compoundInterest.toFixed(2)}`);

/**
 * Use Case 2: Unit Conversion Calculator
 * Convert between different units using chaining
 */
class UnitCalculator extends BasicCalculator {
  // Temperature conversions
  celsiusToFahrenheit() {
    return this.multiply(9).divide(5).add(32);
  }

  fahrenheitToCelsius() {
    return this.subtract(32).multiply(5).divide(9);
  }

  // Distance conversions
  metersToFeet() {
    return this.multiply(3.28084);
  }

  feetToMeters() {
    return this.divide(3.28084);
  }
}

// Example: Convert 25°C to Fahrenheit
const tempConverter = new UnitCalculator(25);
const fahrenheit = tempConverter.celsiusToFahrenheit().getValue();
console.log(`25°C = ${fahrenheit}°F`);

/**
 * Use Case 3: Statistics Calculator
 * Calculate statistical measures using chaining
 */
class StatsCalculator {
  constructor(values = []) {
    this.values = [...values];
  }

  add(value) {
    this.values.push(value);
    return this;
  }

  mean() {
    const sum = this.values.reduce((acc, val) => acc + val, 0);
    this.currentValue = sum / this.values.length;
    return this;
  }

  variance() {
    if (!this.currentValue) this.mean();
    const mean = this.currentValue;
    const variance = this.values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.values.length;
    this.currentValue = variance;
    return this;
  }

  standardDeviation() {
    if (!this.variance) this.variance();
    this.currentValue = Math.sqrt(this.currentValue);
    return this;
  }

  getValue() {
    return this.currentValue;
  }
}

// Example: Calculate standard deviation of a dataset
const stats = new StatsCalculator([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const stdDev = stats.mean().variance().standardDeviation().getValue();
console.log(`Standard Deviation: ${stdDev.toFixed(2)}`);

// Export all implementations
module.exports = {
  BasicCalculator,
  AdvancedCalculator,
  ImmutableCalculator,
  UnitCalculator,
  StatsCalculator,
  calculateCompoundInterest
};

/**
 * Key Interview Points:
 * 
 * 1. Method Chaining Pattern:
 *    - Return 'this' from each method to enable chaining
 *    - Fluent interface design for better readability
 *    - Builder pattern implementation
 * 
 * 2. State Management:
 *    - Mutable vs immutable approaches
 *    - When to preserve vs reset state
 *    - History tracking for debugging
 * 
 * 3. Error Handling:
 *    - Division by zero protection
 *    - Invalid operation detection (sqrt of negative)
 *    - Graceful degradation strategies
 * 
 * 4. Design Patterns:
 *    - Builder pattern for complex object construction
 *    - Command pattern for operation history
 *    - Factory pattern for different calculator types
 * 
 * 5. Real-world Applications:
 *    - Financial calculations (compound interest)
 *    - Unit conversions (temperature, distance)
 *    - Statistical computations (mean, variance, std dev)
 */