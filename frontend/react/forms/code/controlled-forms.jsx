/**
 * File: controlled-forms.jsx
 * Description: Comprehensive examples of controlled form components in React
 * 
 * Learning objectives:
 * - Understand controlled component pattern and single source of truth
 * - See step-by-step form state management implementation
 * - Learn input validation and error handling patterns
 * - Master event handling and state synchronization
 * 
 * Key Concepts:
 * - All form data lives in React state
 * - Every input has value and onChange handler
 * - React controls the input value at all times
 * - Enables real-time validation and dynamic behavior
 */

import React, { useState, useCallback, useMemo } from 'react';

// Basic controlled form demonstrating fundamental concepts
// This pattern ensures React has complete control over form state
function BasicControlledForm() {
  // Central form state - single source of truth for all form data
  // Using object state to group related form fields together
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Error state to track validation messages
  // Separated from form data to distinguish between data and UI state
  const [errors, setErrors] = useState({});

  // Generic handler for all text inputs
  // This pattern reduces boilerplate by handling multiple fields
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    
    // Handle different input types: text inputs vs checkboxes
    // For checkboxes, we need 'checked' property instead of 'value'
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Update form state immutably using functional state update
    // This ensures React recognizes the state change and re-renders
    setFormData(prevState => ({
      ...prevState,
      [name]: inputValue
    }));

    // Clear error for this field when user starts typing
    // Provides immediate feedback that they're addressing the error
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  }, [errors]);

  // Form validation logic
  // Returns object with field names as keys and error messages as values
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation with regex pattern
    // Check both presence and format to provide specific error messages
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password strength validation
    // Multiple criteria to ensure secure passwords
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Password confirmation validation
    // Cross-field validation ensures passwords match
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    // Business logic validation for required agreements
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  }, [formData]);

  // Form submission handler
  // Validates form and either submits or shows errors
  const handleSubmit = useCallback((event) => {
    // Prevent default form submission to handle with React
    event.preventDefault();

    // Run validation and get any errors
    const validationErrors = validateForm();

    // If there are errors, update error state and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear any existing errors on successful validation
    setErrors({});

    // Simulate form submission - in real app would call API
    console.log('Form submitted with data:', formData);
    alert('Form submitted successfully!');
  }, [formData, validateForm]);

  // Computed property to check if form is valid
  // useMemo prevents unnecessary recalculation on every render
  const isFormValid = useMemo(() => {
    const validationErrors = validateForm();
    return Object.keys(validationErrors).length === 0;
  }, [validateForm]);

  return (
    <div className="controlled-form-container">
      <h2>User Registration (Controlled Form)</h2>
      
      {/* Form element with onSubmit handler */}
      <form onSubmit={handleSubmit}>
        
        {/* Email input field */}
        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email} // Controlled: React controls the value
            onChange={handleInputChange} // Handler updates state on changes
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email"
            // ARIA attributes for accessibility
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : null}
          />
          {/* Conditional error message display */}
          {errors.email && (
            <span id="email-error" className="error-message" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password input field */}
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password} // Controlled value
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : null}
          />
          {errors.password && (
            <span id="password-error" className="error-message" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {/* Password confirmation field */}
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword} // Controlled value
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : null}
          />
          {errors.confirmPassword && (
            <span id="confirm-password-error" className="error-message" role="alert">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Checkbox for terms agreement */}
        <div className="form-field checkbox-field">
          <label htmlFor="agreeToTerms">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms} // Controlled: use 'checked' for checkboxes
              onChange={handleInputChange}
              aria-invalid={!!errors.agreeToTerms}
              aria-describedby={errors.agreeToTerms ? 'terms-error' : null}
            />
            I agree to the Terms and Conditions
          </label>
          {errors.agreeToTerms && (
            <span id="terms-error" className="error-message" role="alert">
              {errors.agreeToTerms}
            </span>
          )}
        </div>

        {/* Submit button with dynamic disabled state */}
        <button 
          type="submit"
          className={`submit-button ${isFormValid ? 'valid' : 'invalid'}`}
          // Optionally disable button when form is invalid
          // disabled={!isFormValid}
        >
          Create Account
        </button>
      </form>

      {/* Debug information showing current form state */}
      <div className="debug-info">
        <h3>Debug Information</h3>
        <p><strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}</p>
        <p><strong>Errors:</strong> {JSON.stringify(errors, null, 2)}</p>
        <p><strong>Form Valid:</strong> {isFormValid.toString()}</p>
      </div>
    </div>
  );
}

// Advanced controlled form with dynamic fields and complex validation
// Demonstrates handling arrays of data and conditional rendering
function DynamicControlledForm() {
  // Form state with nested objects and arrays
  // This structure handles complex form data relationships
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: ''
    },
    contacts: [
      { type: 'email', value: '' }
    ],
    preferences: {
      newsletter: false,
      notifications: 'email' // 'email', 'sms', 'none'
    }
  });

  const [errors, setErrors] = useState({});

  // Handler for nested object fields (personalInfo)
  // Uses dot notation in name attribute to handle nested updates
  const handleNestedChange = useCallback((event) => {
    const { name, value } = event.target;
    const [section, field] = name.split('.'); // Split 'personalInfo.firstName'
    
    setFormData(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value
      }
    }));
  }, []);

  // Handler for array fields (contacts)
  // Updates specific array item by index
  const handleArrayChange = useCallback((index, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      contacts: prevState.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  }, []);

  // Add new contact field to the array
  // Demonstrates dynamic form field creation
  const addContact = useCallback(() => {
    setFormData(prevState => ({
      ...prevState,
      contacts: [
        ...prevState.contacts,
        { type: 'email', value: '' }
      ]
    }));
  }, []);

  // Remove contact field from array
  // Includes validation to prevent removing the last field
  const removeContact = useCallback((index) => {
    if (formData.contacts.length > 1) { // Keep at least one contact
      setFormData(prevState => ({
        ...prevState,
        contacts: prevState.contacts.filter((_, i) => i !== index)
      }));
    }
  }, [formData.contacts.length]);

  // Complex validation for nested and array data
  const validateDynamicForm = useCallback(() => {
    const newErrors = {};

    // Validate personal information
    if (!formData.personalInfo.firstName.trim()) {
      newErrors['personalInfo.firstName'] = 'First name is required';
    }

    if (!formData.personalInfo.lastName.trim()) {
      newErrors['personalInfo.lastName'] = 'Last name is required';
    }

    // Date of birth validation
    const dob = new Date(formData.personalInfo.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (!formData.personalInfo.dateOfBirth) {
      newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
    } else if (age < 13) {
      newErrors['personalInfo.dateOfBirth'] = 'Must be at least 13 years old';
    }

    // Validate contacts array
    formData.contacts.forEach((contact, index) => {
      if (!contact.value.trim()) {
        newErrors[`contacts.${index}.value`] = 'Contact value is required';
      } else if (contact.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value)) {
        newErrors[`contacts.${index}.value`] = 'Invalid email format';
      } else if (contact.type === 'phone' && !/^\+?[\d\s-()]+$/.test(contact.value)) {
        newErrors[`contacts.${index}.value`] = 'Invalid phone format';
      }
    });

    return newErrors;
  }, [formData]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    
    const validationErrors = validateDynamicForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    console.log('Dynamic form submitted:', formData);
  }, [formData, validateDynamicForm]);

  return (
    <div className="dynamic-controlled-form">
      <h2>Advanced User Profile (Dynamic Controlled Form)</h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* Personal Information Section */}
        <fieldset>
          <legend>Personal Information</legend>
          
          <div className="form-field">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="personalInfo.firstName" // Dot notation for nested fields
              value={formData.personalInfo.firstName}
              onChange={handleNestedChange}
              className={errors['personalInfo.firstName'] ? 'error' : ''}
            />
            {errors['personalInfo.firstName'] && (
              <span className="error-message">{errors['personalInfo.firstName']}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="personalInfo.lastName"
              value={formData.personalInfo.lastName}
              onChange={handleNestedChange}
              className={errors['personalInfo.lastName'] ? 'error' : ''}
            />
            {errors['personalInfo.lastName'] && (
              <span className="error-message">{errors['personalInfo.lastName']}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="personalInfo.dateOfBirth"
              value={formData.personalInfo.dateOfBirth}
              onChange={handleNestedChange}
              className={errors['personalInfo.dateOfBirth'] ? 'error' : ''}
            />
            {errors['personalInfo.dateOfBirth'] && (
              <span className="error-message">{errors['personalInfo.dateOfBirth']}</span>
            )}
          </div>
        </fieldset>

        {/* Dynamic Contacts Section */}
        <fieldset>
          <legend>Contact Information</legend>
          
          {formData.contacts.map((contact, index) => (
            <div key={index} className="dynamic-field-group">
              <div className="form-field">
                <label htmlFor={`contact-type-${index}`}>Contact Type</label>
                <select
                  id={`contact-type-${index}`}
                  value={contact.type}
                  onChange={(e) => handleArrayChange(index, 'type', e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor={`contact-value-${index}`}>Contact Value</label>
                <input
                  type={contact.type === 'email' ? 'email' : 'text'}
                  id={`contact-value-${index}`}
                  value={contact.value}
                  onChange={(e) => handleArrayChange(index, 'value', e.target.value)}
                  placeholder={`Enter your ${contact.type}`}
                  className={errors[`contacts.${index}.value`] ? 'error' : ''}
                />
                {errors[`contacts.${index}.value`] && (
                  <span className="error-message">{errors[`contacts.${index}.value`]}</span>
                )}
              </div>

              {/* Remove button (only if more than one contact) */}
              {formData.contacts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="remove-button"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          {/* Add contact button */}
          <button
            type="button"
            onClick={addContact}
            className="add-button"
          >
            Add Another Contact
          </button>
        </fieldset>

        {/* Preferences Section */}
        <fieldset>
          <legend>Preferences</legend>
          
          <div className="form-field checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={formData.preferences.newsletter}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    newsletter: e.target.checked
                  }
                }))}
              />
              Subscribe to newsletter
            </label>
          </div>

          <div className="form-field">
            <label>Notification Preferences</label>
            <div className="radio-group">
              {['email', 'sms', 'none'].map(option => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name="notifications"
                    value={option}
                    checked={formData.preferences.notifications === option}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        notifications: e.target.value
                      }
                    }))}
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <button type="submit" className="submit-button">
          Save Profile
        </button>
      </form>
    </div>
  );
}

// Export components for use in other parts of the application
// This modular approach allows for easy testing and reuse
export {
  BasicControlledForm,
  DynamicControlledForm
};

// Example usage and demonstration
// Shows how to integrate these forms into a larger application
export default function ControlledFormsDemo() {
  const [activeForm, setActiveForm] = useState('basic');

  return (
    <div className="controlled-forms-demo">
      <nav className="form-nav">
        <button 
          onClick={() => setActiveForm('basic')}
          className={activeForm === 'basic' ? 'active' : ''}
        >
          Basic Form
        </button>
        <button 
          onClick={() => setActiveForm('dynamic')}
          className={activeForm === 'dynamic' ? 'active' : ''}
        >
          Dynamic Form
        </button>
      </nav>

      {activeForm === 'basic' && <BasicControlledForm />}
      {activeForm === 'dynamic' && <DynamicControlledForm />}
    </div>
  );
}