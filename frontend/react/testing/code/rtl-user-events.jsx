/**
 * File: rtl-user-events.jsx
 * Description: React Testing Library user event patterns and interactions
 * Tests understanding of user-event library and interaction testing
 */

import React, { useState, useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// === Components for User Event Testing ===

function InteractiveForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    country: '',
    newsletter: false,
    theme: 'light',
    bio: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();
  
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.age && (formData.age < 13 || formData.age > 120)) {
      newErrors.age = 'Age must be between 13 and 120';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
    }
  };
  
  const clearFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          onChange={handleInputChange}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && <span id="name-error" role="alert">{errors.name}</span>}
      </div>
      
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && <span id="email-error" role="alert">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleInputChange}
          aria-describedby={errors.age ? 'age-error' : undefined}
        />
        {errors.age && <span id="age-error" role="alert">{errors.age}</span>}
      </div>
      
      <div>
        <label htmlFor="country">Country:</label>
        <select id="country" name="country" value={formData.country} onChange={handleInputChange}>
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="au">Australia</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell us about yourself..."
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter}
            onChange={handleInputChange}
          />
          Subscribe to newsletter
        </label>
      </div>
      
      <fieldset>
        <legend>Theme Preference</legend>
        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={formData.theme === 'light'}
            onChange={handleInputChange}
          />
          Light
        </label>
        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={formData.theme === 'dark'}
            onChange={handleInputChange}
          />
          Dark
        </label>
        <label>
          <input
            type="radio"
            name="theme"
            value="auto"
            checked={formData.theme === 'auto'}
            onChange={handleInputChange}
          />
          Auto
        </label>
      </fieldset>
      
      <div>
        <label htmlFor="file">Upload file:</label>
        <input
          id="file"
          name="file"
          type="file"
          onChange={handleInputChange}
          ref={fileInputRef}
          accept=".txt,.pdf,.jpg,.png"
        />
        {formData.file && (
          <div>
            Selected: {formData.file.name}
            <button type="button" onClick={clearFile}>Clear</button>
          </div>
        )}
      </div>
      
      <button type="submit">Submit Form</button>
    </form>
  );
}

function KeyboardInteractionComponent() {
  const [focusedItem, setFocusedItem] = useState(null);
  const [pressedKeys, setPressedKeys] = useState([]);
  
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  
  const handleKeyDown = (e) => {
    setPressedKeys(prev => [...prev, e.key].slice(-5)); // Keep last 5 keys
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedItem(prev => prev === null ? 0 : Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedItem(prev => prev === null ? items.length - 1 : Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedItem !== null) {
      console.log('Selected:', items[focusedItem]);
    } else if (e.key === 'Escape') {
      setFocusedItem(null);
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} role="listbox">
      <h3>Keyboard Navigation Demo</h3>
      <p>Use arrow keys to navigate, Enter to select, Escape to clear</p>
      <p>Pressed keys: {pressedKeys.join(', ')}</p>
      
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            role="option"
            aria-selected={focusedItem === index}
            style={{
              backgroundColor: focusedItem === index ? '#e6f3ff' : 'transparent',
              padding: '8px',
              cursor: 'pointer'
            }}
            onClick={() => setFocusedItem(index)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DragDropComponent() {
  const [items, setItems] = useState(['Apple', 'Banana', 'Cherry', 'Date']);
  const [draggedItem, setDraggedItem] = useState(null);
  
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', items[index]);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    const newItems = [...items];
    const draggedValue = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(dropIndex, 0, draggedValue);
    
    setItems(newItems);
    setDraggedItem(null);
  };
  
  return (
    <div>
      <h3>Drag and Drop List</h3>
      <ul>
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{
              padding: '8px',
              margin: '4px 0',
              backgroundColor: draggedItem === index ? '#f0f0f0' : 'white',
              border: '1px solid #ccc',
              cursor: 'move'
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HoverComponent() {
  const [hoverState, setHoverState] = useState({});
  
  const handleMouseEnter = (id) => {
    setHoverState(prev => ({ ...prev, [id]: true }));
  };
  
  const handleMouseLeave = (id) => {
    setHoverState(prev => ({ ...prev, [id]: false }));
  };
  
  return (
    <div>
      <h3>Hover Interactions</h3>
      {['card1', 'card2', 'card3'].map(cardId => (
        <div
          key={cardId}
          onMouseEnter={() => handleMouseEnter(cardId)}
          onMouseLeave={() => handleMouseLeave(cardId)}
          style={{
            padding: '16px',
            margin: '8px 0',
            backgroundColor: hoverState[cardId] ? '#e6f3ff' : '#f9f9f9',
            border: '1px solid #ddd',
            transition: 'background-color 0.2s'
          }}
        >
          Card {cardId.slice(-1)} - {hoverState[cardId] ? 'Hovered' : 'Not hovered'}
        </div>
      ))}
    </div>
  );
}

// === USER EVENT TESTS ===

describe('User Event Interactions', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });
  
  describe('Text Input Interactions', () => {
    test('typing in text inputs', async () => {
      render(<InteractiveForm />);
      
      const nameInput = screen.getByLabelText(/name/i);
      
      // Type text
      await user.type(nameInput, 'John Doe');
      expect(nameInput).toHaveValue('John Doe');
      
      // Clear and type again
      await user.clear(nameInput);
      expect(nameInput).toHaveValue('');
      
      await user.type(nameInput, 'Jane Smith');
      expect(nameInput).toHaveValue('Jane Smith');
    });
    
    test('typing with special characters and delays', async () => {
      render(<InteractiveForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Type with delay between characters
      await user.type(emailInput, 'test@example.com', { delay: 50 });
      expect(emailInput).toHaveValue('test@example.com');
      
      // Test special characters
      await user.clear(emailInput);
      await user.type(emailInput, 'user+test@domain.co.uk');
      expect(emailInput).toHaveValue('user+test@domain.co.uk');
    });
    
    test('typing in textarea', async () => {
      render(<InteractiveForm />);
      
      const bioTextarea = screen.getByLabelText(/bio/i);
      
      const longText = 'This is a long bio that spans multiple lines.\nIt includes line breaks and various punctuation marks!';
      await user.type(bioTextarea, longText);
      expect(bioTextarea).toHaveValue(longText);
    });
    
    test('typing in number inputs', async () => {
      render(<InteractiveForm />);
      
      const ageInput = screen.getByLabelText(/age/i);
      
      await user.type(ageInput, '25');
      expect(ageInput).toHaveValue(25);
      
      // Test invalid input (letters in number field)
      await user.clear(ageInput);
      await user.type(ageInput, 'abc123');
      // Number input typically filters out non-numeric characters
      expect(ageInput).toHaveValue(123);
    });
  });
  
  describe('Click Interactions', () => {
    test('single click events', async () => {
      render(<InteractiveForm />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Initially unchecked
      expect(checkbox).not.toBeChecked();
      
      // Click to check
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      
      // Click to uncheck
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
    
    test('double click events', async () => {
      const DoubleClickComponent = () => {
        const [doubleClicks, setDoubleClicks] = useState(0);
        return (
          <button onDoubleClick={() => setDoubleClicks(prev => prev + 1)}>
            Double clicks: {doubleClicks}
          </button>
        );
      };
      
      render(<DoubleClickComponent />);
      
      const button = screen.getByRole('button');
      
      await user.dblClick(button);
      expect(button).toHaveTextContent('Double clicks: 1');
      
      await user.dblClick(button);
      expect(button).toHaveTextContent('Double clicks: 2');
    });
    
    test('right click (context menu)', async () => {
      const ContextMenuComponent = () => {
        const [rightClicks, setRightClicks] = useState(0);
        return (
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setRightClicks(prev => prev + 1);
            }}
          >
            Right clicks: {rightClicks}
          </div>
        );
      };
      
      render(<ContextMenuComponent />);
      
      const div = screen.getByText(/right clicks: 0/i);
      
      await user.pointer({ target: div, keys: '[MouseRight]' });
      expect(screen.getByText(/right clicks: 1/i)).toBeInTheDocument();
    });
  });
  
  describe('Selection Interactions', () => {
    test('selecting dropdown options', async () => {
      render(<InteractiveForm />);
      
      const countrySelect = screen.getByLabelText(/country/i);
      
      // Select an option
      await user.selectOptions(countrySelect, 'us');
      expect(countrySelect).toHaveValue('us');
      
      // Select different option
      await user.selectOptions(countrySelect, 'uk');
      expect(countrySelect).toHaveValue('uk');
      
      // Can also select by visible text
      await user.selectOptions(countrySelect, 'Canada');
      expect(countrySelect).toHaveValue('ca');
    });
    
    test('radio button selection', async () => {
      render(<InteractiveForm />);
      
      const lightRadio = screen.getByRole('radio', { name: /light/i });
      const darkRadio = screen.getByRole('radio', { name: /dark/i });
      
      // Initially light is selected
      expect(lightRadio).toBeChecked();
      expect(darkRadio).not.toBeChecked();
      
      // Select dark theme
      await user.click(darkRadio);
      expect(darkRadio).toBeChecked();
      expect(lightRadio).not.toBeChecked();
    });
  });
  
  describe('File Upload Interactions', () => {
    test('uploading files', async () => {
      render(<InteractiveForm />);
      
      const fileInput = screen.getByLabelText(/upload file/i);
      
      // Create a test file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, testFile);
      expect(fileInput.files[0]).toBe(testFile);
      expect(fileInput.files[0].name).toBe('test.txt');
      
      // Check UI update
      expect(screen.getByText(/selected: test\.txt/i)).toBeInTheDocument();
    });
    
    test('uploading multiple files', async () => {
      const MultiFileComponent = () => {
        const [files, setFiles] = useState([]);
        
        const handleFileChange = (e) => {
          setFiles(Array.from(e.target.files));
        };
        
        return (
          <div>
            <input type="file" multiple onChange={handleFileChange} />
            <p>Selected files: {files.length}</p>
            {files.map((file, index) => (
              <div key={index}>{file.name}</div>
            ))}
          </div>
        );
      };
      
      render(<MultiFileComponent />);
      
      const fileInput = screen.getByRole('textbox', { hidden: true }); // File inputs are hidden textboxes
      
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, [file1, file2]);
      
      expect(screen.getByText('Selected files: 2')).toBeInTheDocument();
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });
    
    test('clearing file selection', async () => {
      render(<InteractiveForm />);
      
      const fileInput = screen.getByLabelText(/upload file/i);
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      // Upload file
      await user.upload(fileInput, testFile);
      expect(screen.getByText(/selected: test\.txt/i)).toBeInTheDocument();
      
      // Clear file
      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      
      expect(screen.queryByText(/selected: test\.txt/i)).not.toBeInTheDocument();
    });
  });
  
  describe('Keyboard Interactions', () => {
    test('keyboard navigation', async () => {
      render(<KeyboardInteractionComponent />);
      
      const listbox = screen.getByRole('listbox');
      
      // Focus the component
      listbox.focus();
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('option', { name: /item 1/i })).toHaveAttribute('aria-selected', 'true');
      
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('option', { name: /item 2/i })).toHaveAttribute('aria-selected', 'true');
      
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('option', { name: /item 1/i })).toHaveAttribute('aria-selected', 'true');
      
      // Escape to clear selection
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('option', { selected: true })).not.toBeInTheDocument();
    });
    
    test('keyboard shortcuts and combinations', async () => {
      const ShortcutComponent = () => {
        const [lastShortcut, setLastShortcut] = useState('');
        
        const handleKeyDown = (e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            setLastShortcut('Ctrl+S');
          } else if (e.shiftKey && e.key === 'Enter') {
            setLastShortcut('Shift+Enter');
          } else if (e.altKey && e.key === 'F4') {
            setLastShortcut('Alt+F4');
          }
        };
        
        return (
          <div onKeyDown={handleKeyDown} tabIndex={0}>
            <p>Press keyboard shortcuts</p>
            <p>Last shortcut: {lastShortcut}</p>
          </div>
        );
      };
      
      render(<ShortcutComponent />);
      
      const container = screen.getByText(/press keyboard shortcuts/i).parentElement;
      container.focus();
      
      // Test Ctrl+S
      await user.keyboard('{Control>}s{/Control}');
      expect(screen.getByText('Last shortcut: Ctrl+S')).toBeInTheDocument();
      
      // Test Shift+Enter
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      expect(screen.getByText('Last shortcut: Shift+Enter')).toBeInTheDocument();
    });
    
    test('tab navigation', async () => {
      render(<InteractiveForm />);
      
      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/name/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/age/i)).toHaveFocus();
      
      // Shift+Tab to go backwards
      await user.tab({ shift: true });
      expect(screen.getByLabelText(/email/i)).toHaveFocus();
    });
  });
  
  describe('Mouse Interactions', () => {
    test('hover events', async () => {
      render(<HoverComponent />);
      
      const card1 = screen.getByText(/card 1 - not hovered/i);
      
      // Hover over card
      await user.hover(card1);
      expect(screen.getByText(/card 1 - hovered/i)).toBeInTheDocument();
      
      // Unhover (move to different element)
      const card2 = screen.getByText(/card 2 - not hovered/i);
      await user.hover(card2);
      expect(screen.getByText(/card 1 - not hovered/i)).toBeInTheDocument();
      expect(screen.getByText(/card 2 - hovered/i)).toBeInTheDocument();
      
      // Move away from all cards
      await user.unhover(card2);
      expect(screen.getByText(/card 2 - not hovered/i)).toBeInTheDocument();
    });
  });
  
  describe('Form Submission', () => {
    test('form validation and submission', async () => {
      const mockSubmit = jest.fn();
      
      const FormWithSubmit = () => {
        const [data, setData] = useState({ name: '', email: '' });
        
        const handleSubmit = (e) => {
          e.preventDefault();
          mockSubmit(data);
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Name"
              value={data.name}
              onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              placeholder="Email"
              value={data.email}
              onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      render(<FormWithSubmit />);
      
      // Fill out form
      await user.type(screen.getByPlaceholderText(/name/i), 'John Doe');
      await user.type(screen.getByPlaceholderText(/email/i), 'john@example.com');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });
  
  describe('Complex User Flows', () => {
    test('complete form workflow', async () => {
      render(<InteractiveForm />);
      
      // Fill out entire form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/age/i), '30');
      await user.selectOptions(screen.getByLabelText(/country/i), 'us');
      await user.type(screen.getByLabelText(/bio/i), 'Software developer from California');
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('radio', { name: /dark/i }));
      
      // Upload file
      const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
      await user.upload(screen.getByLabelText(/upload file/i), file);
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /submit form/i }));
      
      // Verify no validation errors appear (form should be valid)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

export {
  InteractiveForm,
  KeyboardInteractionComponent,
  DragDropComponent,
  HoverComponent
};