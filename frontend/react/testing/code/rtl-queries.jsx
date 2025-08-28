/**
 * File: rtl-queries.jsx
 * Description: React Testing Library query patterns and best practices
 * Tests understanding of different query methods and when to use each
 */

import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// === Component for Query Testing ===
function QueryTestComponent() {
  const [status, setStatus] = useState('idle');
  const [items, setItems] = useState(['Apple', 'Banana', 'Orange']);
  
  return (
    <div>
      {/* Role-based queries */}
      <h1>Fruit List</h1>
      <h2>Available Fruits</h2>
      <button onClick={() => setStatus('loading')}>Load More</button>
      <a href="/about">About Us</a>
      
      {/* Text-based queries */}
      <p>Current status: {status}</p>
      <span>Total items: {items.length}</span>
      
      {/* Form elements with labels */}
      <form>
        <label htmlFor="search">Search fruits:</label>
        <input id="search" type="text" placeholder="Type to search..." />
        
        <label htmlFor="category">Category:</label>
        <select id="category">
          <option value="">All</option>
          <option value="citrus">Citrus</option>
          <option value="tropical">Tropical</option>
        </select>
        
        <fieldset>
          <legend>Options</legend>
          <label>
            <input type="checkbox" /> Include organic only
          </label>
          <label>
            <input type="radio" name="sort" value="name" /> Sort by name
          </label>
          <label>
            <input type="radio" name="sort" value="price" /> Sort by price
          </label>
        </fieldset>
      </form>
      
      {/* Images with alt text */}
      <img src="/apple.jpg" alt="Fresh red apple" />
      <img src="/banner.jpg" alt="" /> {/* Decorative image */}
      
      {/* Data test ids (use sparingly) */}
      <div data-testid="fruit-list">
        {items.map((item, index) => (
          <div key={index} data-testid={`fruit-item-${index}`}>
            {item}
          </div>
        ))}
      </div>
      
      {/* Multiple elements */}
      <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ul>
      
      {/* Dynamic content */}
      {status === 'loading' && (
        <div role="progressbar" aria-label="Loading fruits">
          Loading...
        </div>
      )}
      
      {/* Hidden content */}
      <div style={{ display: 'none' }}>Hidden content</div>
    </div>
  );
}

// === QUERY METHOD TESTS ===

describe('RTL Query Methods', () => {
  beforeEach(() => {
    render(<QueryTestComponent />);
  });
  
  // === getBy* Queries ===
  describe('getBy* queries (single element, throws if not found)', () => {
    test('getByRole - preferred for interactive elements', () => {
      // Headings
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fruit List');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Available Fruits');
      
      // Interactive elements
      expect(screen.getByRole('button')).toHaveTextContent('Load More');
      expect(screen.getByRole('link')).toHaveTextContent('About Us');
      expect(screen.getByRole('textbox', { name: /search fruits/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
      
      // Form elements
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /sort by name/i })).toBeInTheDocument();
    });
    
    test('getByLabelText - for form controls with labels', () => {
      expect(screen.getByLabelText(/search fruits/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/include organic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by name/i)).toBeInTheDocument();
    });
    
    test('getByText - for text content', () => {
      expect(screen.getByText('Fruit List')).toBeInTheDocument();
      expect(screen.getByText(/current status/i)).toBeInTheDocument();
      expect(screen.getByText(/total items: 3/i)).toBeInTheDocument();
    });
    
    test('getByAltText - for images', () => {
      expect(screen.getByAltText(/fresh red apple/i)).toBeInTheDocument();
      // Note: Images with empty alt text won't be found by getByAltText
    });
    
    test('getByPlaceholderText - for inputs with placeholders', () => {
      expect(screen.getByPlaceholderText(/type to search/i)).toBeInTheDocument();
    });
    
    test('getByDisplayValue - for form elements with values', () => {
      const input = screen.getByPlaceholderText(/type to search/i);
      userEvent.type(input, 'apple');
      expect(screen.getByDisplayValue('apple')).toBeInTheDocument();
    });
    
    test('getByTestId - use as last resort', () => {
      expect(screen.getByTestId('fruit-list')).toBeInTheDocument();
      expect(screen.getByTestId('fruit-item-0')).toHaveTextContent('Apple');
    });
  });
  
  // === queryBy* Queries ===
  describe('queryBy* queries (single element, returns null if not found)', () => {
    test('queryByText - returns null for non-existent text', () => {
      expect(screen.queryByText('Non-existent text')).not.toBeInTheDocument();
      expect(screen.queryByText('Non-existent text')).toBeNull();
    });
    
    test('queryByRole - useful for conditional elements', () => {
      // Initially no progress bar
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      
      // After clicking button, progress bar appears
      userEvent.click(screen.getByRole('button'));
      expect(screen.queryByRole('progressbar')).toBeInTheDocument();
    });
    
    test('queryByTestId - checking for optional elements', () => {
      expect(screen.queryByTestId('optional-element')).not.toBeInTheDocument();
    });
  });
  
  // === getAllBy* Queries ===
  describe('getAllBy* queries (multiple elements, throws if none found)', () => {
    test('getAllByRole - for multiple similar elements', () => {
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent('Fruit List');
      expect(headings[1]).toHaveTextContent('Available Fruits');
      
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(2);
    });
    
    test('getAllByText - for repeated text patterns', () => {
      const itemTexts = screen.getAllByText(/item$/); // Ends with "item"
      expect(itemTexts).toHaveLength(3);
    });
    
    test('getAllByTestId - for data-driven lists', () => {
      const fruitItems = screen.getAllByTestId(/^fruit-item-/);
      expect(fruitItems).toHaveLength(3);
      expect(fruitItems[0]).toHaveTextContent('Apple');
      expect(fruitItems[1]).toHaveTextContent('Banana');
      expect(fruitItems[2]).toHaveTextContent('Orange');
    });
  });
  
  // === queryAllBy* Queries ===
  describe('queryAllBy* queries (multiple elements, returns empty array if none found)', () => {
    test('queryAllByRole - safe way to check for multiple elements', () => {
      const nonExistentButtons = screen.queryAllByRole('menuitem');
      expect(nonExistentButtons).toHaveLength(0);
      expect(nonExistentButtons).toEqual([]);
    });
    
    test('queryAllByText - finding optional repeated elements', () => {
      const errorMessages = screen.queryAllByText(/error/i);
      expect(errorMessages).toHaveLength(0);
    });
  });
});

// === QUERY PRIORITY AND BEST PRACTICES ===

describe('Query Priority and Best Practices', () => {
  beforeEach(() => {
    render(<QueryTestComponent />);
  });
  
  test('Query priority order (most to least preferred)', () => {
    // 1. Accessible to everyone (highest priority)
    const searchInput = screen.getByRole('textbox', { name: /search fruits/i });
    // Alternative: screen.getByLabelText(/search fruits/i)
    
    // 2. Semantic queries
    const heading = screen.getByRole('heading', { name: /fruit list/i });
    // Alternative: screen.getByText('Fruit List')
    
    // 3. Text content
    const statusText = screen.getByText(/current status/i);
    
    // 4. Form-specific queries
    const placeholderInput = screen.getByPlaceholderText(/type to search/i);
    
    // 5. Test IDs (last resort)
    const fruitList = screen.getByTestId('fruit-list');
    
    // All should be in the document
    [searchInput, heading, statusText, placeholderInput, fruitList].forEach(element => {
      expect(element).toBeInTheDocument();
    });
  });
  
  test('Using options to make queries more specific', () => {
    // Using name option with getByRole
    const mainHeading = screen.getByRole('heading', { name: /fruit list/i, level: 1 });
    const subHeading = screen.getByRole('heading', { name: /available fruits/i, level: 2 });
    
    expect(mainHeading).toHaveTextContent('Fruit List');
    expect(subHeading).toHaveTextContent('Available Fruits');
    
    // Using exact option
    const exactText = screen.getByText('Apple', { exact: true });
    expect(exactText).toBeInTheDocument();
    
    // Using selector option (use sparingly)
    const firstListItem = screen.getByText('First item', { selector: 'li' });
    expect(firstListItem).toBeInTheDocument();
  });
  
  test('Regular expressions in queries', () => {
    // Case-insensitive matching
    expect(screen.getByText(/fruit list/i)).toBeInTheDocument();
    
    // Pattern matching
    expect(screen.getByText(/total items: \d+/)).toBeInTheDocument();
    
    // Partial matching
    expect(screen.getByText(/current/)).toHaveTextContent('Current status: idle');
  });
  
  test('Custom queries and matchers', () => {
    // You can create custom queries for repeated patterns
    const getByDataCy = (value) => screen.getByTestId(value);
    
    // Custom matcher example (would need to be set up in test setup)
    // expect(element).toBeVisibleToUser();
  });
});

// === ERROR HANDLING AND DEBUGGING ===

describe('Query Error Handling and Debugging', () => {
  beforeEach(() => {
    render(<QueryTestComponent />);
  });
  
  test('Handling multiple matches with getAllBy*', () => {
    // This would throw an error if using getByRole
    // const headings = screen.getByRole('heading'); // Error: multiple headings
    
    // Correct way
    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(2);
  });
  
  test('Using query* variants to avoid errors', () => {
    // Safe way to check for non-existent elements
    expect(screen.queryByText('Does not exist')).toBeNull();
    
    // This would throw an error:
    // expect(screen.getByText('Does not exist')); // Error: Unable to find element
  });
  
  test('Debugging queries with screen.debug', () => {
    // Uncomment to see the DOM structure in tests
    // screen.debug(); // Prints entire DOM
    // screen.debug(screen.getByRole('button')); // Prints specific element
    
    // You can also use screen.logTestingPlaygroundURL() to get Testing Playground URL
  });
  
  test('Using within() for scoped queries', () => {
    const fruitList = screen.getByTestId('fruit-list');
    
    // Query within a specific container
    const { getByText } = within(fruitList);
    expect(getByText('Apple')).toBeInTheDocument();
    expect(getByText('Banana')).toBeInTheDocument();
  });
});

// === ASYNC QUERIES ===

describe('Async Query Patterns', () => {
  test('findBy* queries for async elements', async () => {
    const { rerender } = render(<QueryTestComponent />);
    
    // Element that appears after some async operation
    const AsyncComponent = () => {
      const [loading, setLoading] = useState(true);
      
      React.useEffect(() => {
        setTimeout(() => setLoading(false), 100);
      }, []);
      
      return loading ? (
        <div>Loading...</div>
      ) : (
        <div>Async content loaded!</div>
      );
    };
    
    rerender(<AsyncComponent />);
    
    // Wait for element to appear
    const asyncContent = await screen.findByText(/async content loaded/i);
    expect(asyncContent).toBeInTheDocument();
  });
  
  test('waitFor with specific queries', async () => {
    render(<QueryTestComponent />);
    
    // Click button to trigger loading state
    userEvent.click(screen.getByRole('button'));
    
    // Wait for progress bar to appear
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});

export { QueryTestComponent };