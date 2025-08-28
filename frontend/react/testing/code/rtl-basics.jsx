/**
 * File: rtl-basics.jsx
 * Description: React Testing Library fundamentals and basic testing patterns
 * Tests understanding of RTL philosophy and basic testing concepts
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// === Basic Component for Testing ===
function Counter({ initialCount = 0, step = 1, label = 'Count' }) {
  const [count, setCount] = useState(initialCount);
  
  const increment = () => setCount(prev => prev + step);
  const decrement = () => setCount(prev => prev - step);
  const reset = () => setCount(initialCount);
  
  return (
    <div>
      <h2>{label}</h2>
      <p data-testid="count-display">Current count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// === Greeting Component ===
function Greeting({ name, showFormal = false }) {
  if (!name) {
    return <p>Hello, stranger!</p>;
  }
  
  return (
    <div>
      <h1>{showFormal ? `Good day, ${name}` : `Hi ${name}!`}</h1>
      <p>Welcome to our application</p>
    </div>
  );
}

// === Form Component ===
function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        />
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

// === Toggle Component ===
function Toggle({ initialToggled = false, onToggle, children }) {
  const [toggled, setToggled] = useState(initialToggled);
  
  const handleToggle = () => {
    const newToggled = !toggled;
    setToggled(newToggled);
    onToggle?.(newToggled);
  };
  
  return (
    <div>
      <button
        onClick={handleToggle}
        aria-pressed={toggled}
        aria-label="Toggle switch"
      >
        {toggled ? 'ON' : 'OFF'}
      </button>
      {toggled && <div>{children}</div>}
    </div>
  );
}

// === BASIC TESTING EXAMPLES ===

describe('Counter Component', () => {
  // Basic rendering test
  test('renders with initial count', () => {
    render(<Counter initialCount={5} />);
    
    // Using getByText - finds element by text content
    expect(screen.getByText('Current count: 5')).toBeInTheDocument();
    
    // Using getByRole - finds button by role
    expect(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrement' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
  
  // Testing user interactions
  test('increments count when increment button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);
    
    const incrementButton = screen.getByRole('button', { name: 'Increment' });
    
    await user.click(incrementButton);
    expect(screen.getByText('Current count: 1')).toBeInTheDocument();
    
    await user.click(incrementButton);
    expect(screen.getByText('Current count: 2')).toBeInTheDocument();
  });
  
  test('decrements count when decrement button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    
    const decrementButton = screen.getByRole('button', { name: 'Decrement' });
    
    await user.click(decrementButton);
    expect(screen.getByText('Current count: 4')).toBeInTheDocument();
  });
  
  test('resets count to initial value', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={10} />);
    
    const incrementButton = screen.getByRole('button', { name: 'Increment' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    
    // Change the count
    await user.click(incrementButton);
    expect(screen.getByText('Current count: 11')).toBeInTheDocument();
    
    // Reset
    await user.click(resetButton);
    expect(screen.getByText('Current count: 10')).toBeInTheDocument();
  });
  
  test('uses custom step value', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} step={5} />);
    
    const incrementButton = screen.getByRole('button', { name: 'Increment' });
    
    await user.click(incrementButton);
    expect(screen.getByText('Current count: 5')).toBeInTheDocument();
  });
  
  // Testing with testid (use sparingly)
  test('displays count using data-testid', () => {
    render(<Counter initialCount={42} />);
    
    const countDisplay = screen.getByTestId('count-display');
    expect(countDisplay).toHaveTextContent('Current count: 42');
  });
});

describe('Greeting Component', () => {
  test('shows default message for no name', () => {
    render(<Greeting />);
    expect(screen.getByText('Hello, stranger!')).toBeInTheDocument();
  });
  
  test('shows personalized greeting with name', () => {
    render(<Greeting name="John" />);
    expect(screen.getByText('Hi John!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to our application')).toBeInTheDocument();
  });
  
  test('shows formal greeting when showFormal is true', () => {
    render(<Greeting name="Jane" showFormal={true} />);
    expect(screen.getByText('Good day, Jane')).toBeInTheDocument();
  });
  
  // Testing with different matchers
  test('uses various jest-dom matchers', () => {
    render(<Greeting name="Alice" />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Hi Alice!');
    expect(heading).not.toBeEmptyDOMElement();
  });
});

describe('ContactForm Component', () => {
  test('renders all form fields', () => {
    render(<ContactForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Message:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
  
  test('updates input values when typing', async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={jest.fn()} />);
    
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const messageInput = screen.getByLabelText('Message:');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(messageInput, 'Hello world');
    
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(messageInput).toHaveValue('Hello world');
  });
  
  test('calls onSubmit with form data', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue();
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill out form
    await user.type(screen.getByLabelText('Name:'), 'John Doe');
    await user.type(screen.getByLabelText('Email:'), 'john@example.com');
    await user.type(screen.getByLabelText('Message:'), 'Test message');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    });
  });
  
  test('disables submit button during submission', async () => {
    const user = userEvent.setup();
    let resolveSubmit;
    const mockSubmit = jest.fn(() => new Promise(resolve => {
      resolveSubmit = resolve;
    }));
    
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill and submit form
    await user.type(screen.getByLabelText('Name:'), 'John');
    await user.type(screen.getByLabelText('Email:'), 'john@example.com');
    await user.type(screen.getByLabelText('Message:'), 'Test');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    // Button should be disabled and show loading text
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
    
    // Resolve the promise
    resolveSubmit();
    
    // Wait for button to be enabled again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
    });
  });
  
  test('clears form after successful submission', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn().mockResolvedValue();
    render(<ContactForm onSubmit={mockSubmit} />);
    
    const nameInput = screen.getByLabelText('Name:');
    const emailInput = screen.getByLabelText('Email:');
    const messageInput = screen.getByLabelText('Message:');
    
    // Fill and submit form
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(messageInput, 'Test message');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    // Wait for form to be cleared
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(messageInput).toHaveValue('');
    });
  });
});

describe('Toggle Component', () => {
  test('renders with initial state', () => {
    render(<Toggle>Content when toggled</Toggle>);
    
    const toggleButton = screen.getByRole('button', { name: 'Toggle switch' });
    expect(toggleButton).toHaveTextContent('OFF');
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    
    // Content should not be visible initially
    expect(screen.queryByText('Content when toggled')).not.toBeInTheDocument();
  });
  
  test('shows content when toggled on', async () => {
    const user = userEvent.setup();
    render(<Toggle>Content when toggled</Toggle>);
    
    const toggleButton = screen.getByRole('button', { name: 'Toggle switch' });
    
    await user.click(toggleButton);
    
    expect(toggleButton).toHaveTextContent('ON');
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Content when toggled')).toBeInTheDocument();
  });
  
  test('calls onToggle callback with new state', async () => {
    const user = userEvent.setup();
    const mockToggle = jest.fn();
    render(<Toggle onToggle={mockToggle}>Content</Toggle>);
    
    const toggleButton = screen.getByRole('button', { name: 'Toggle switch' });
    
    await user.click(toggleButton);
    expect(mockToggle).toHaveBeenCalledWith(true);
    
    await user.click(toggleButton);
    expect(mockToggle).toHaveBeenCalledWith(false);
  });
  
  test('starts with initial toggled state', () => {
    render(<Toggle initialToggled={true}>Content when toggled</Toggle>);
    
    const toggleButton = screen.getByRole('button', { name: 'Toggle switch' });
    expect(toggleButton).toHaveTextContent('ON');
    expect(screen.getByText('Content when toggled')).toBeInTheDocument();
  });
});

// === RTL Query Examples ===
describe('RTL Query Methods', () => {
  const TestComponent = () => (
    <div>
      <h1>Main Title</h1>
      <h2>Subtitle</h2>
      <button>Click me</button>
      <input aria-label="Search input" placeholder="Enter search term" />
      <label htmlFor="email-input">Email:</label>
      <input id="email-input" type="email" />
      <img src="test.jpg" alt="Test image" />
      <div data-testid="custom-element">Custom element</div>
      <p>Multiple</p>
      <p>Paragraphs</p>
    </div>
  );
  
  test('demonstrates different query methods', () => {
    render(<TestComponent />);
    
    // getByRole - preferred for interactive elements
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
    
    // getByLabelText - for form controls with labels
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Search input')).toBeInTheDocument();
    
    // getByPlaceholderText - for inputs with placeholders
    expect(screen.getByPlaceholderText('Enter search term')).toBeInTheDocument();
    
    // getByAltText - for images
    expect(screen.getByAltText('Test image')).toBeInTheDocument();
    
    // getByText - for text content
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
    
    // getByTestId - use sparingly, when other queries don't work
    expect(screen.getByTestId('custom-element')).toBeInTheDocument();
    
    // getAllBy* for multiple elements
    const paragraphs = screen.getAllByText(/Multiple|Paragraphs/);
    expect(paragraphs).toHaveLength(2);
  });
  
  test('demonstrates query variants', () => {
    render(<TestComponent />);
    
    // getBy* - throws error if not found or multiple found
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // queryBy* - returns null if not found
    expect(screen.queryByText('Nonexistent text')).not.toBeInTheDocument();
    
    // findBy* - returns promise, waits for element (async)
    // (This would be used for elements that appear after some async operation)
  });
});

// === Common Testing Patterns ===
describe('Common Testing Patterns', () => {
  test('testing with cleanup', () => {
    const { unmount } = render(<Counter />);
    
    expect(screen.getByText('Current count: 0')).toBeInTheDocument();
    
    unmount();
    
    // Component is no longer in DOM
    expect(screen.queryByText('Current count: 0')).not.toBeInTheDocument();
  });
  
  test('testing with rerender', () => {
    const { rerender } = render(<Greeting name="John" />);
    
    expect(screen.getByText('Hi John!')).toBeInTheDocument();
    
    rerender(<Greeting name="Jane" />);
    
    expect(screen.getByText('Hi Jane!')).toBeInTheDocument();
    expect(screen.queryByText('Hi John!')).not.toBeInTheDocument();
  });
  
  test('testing with container queries', () => {
    const { container } = render(<div className="test-container">Content</div>);
    
    // Using container for class-based queries (use sparingly)
    expect(container.querySelector('.test-container')).toBeInTheDocument();
  });
});

export {
  Counter,
  Greeting,
  ContactForm,
  Toggle
};