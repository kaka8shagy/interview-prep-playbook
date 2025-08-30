/**
 * File: form-validation.jsx
 * Description: Advanced form validation patterns and strategies in React
 * 
 * Learning objectives:
 * - Master custom validation logic implementation
 * - Understand async validation with debouncing
 * - Learn cross-field validation patterns
 * - See real-time validation UX best practices
 * - Implement accessible error handling
 * 
 * Key Concepts:
 * - Validation timing strategies (onChange, onBlur, onSubmit)
 * - Debouncing expensive validations (server calls)
 * - Field dependency and cross-validation
 * - Performance optimization for large forms
 * - User experience considerations for validation feedback
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Custom hook for debouncing values
// Essential for preventing excessive API calls during validation
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timeout to update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    // This prevents stale updates and reduces API calls
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom hook for managing async validation state
// Handles loading states, errors, and cleanup for async operations
function useAsyncValidation() {
  const [validationState, setValidationState] = useState({});
  const activeRequests = useRef(new Map());

  // Execute async validation with proper cleanup
  const validateAsync = useCallback(async (fieldName, validatorFn, value) => {
    // Generate unique request ID to handle race conditions
    const requestId = Date.now() + Math.random();
    
    // Cancel previous request for this field
    const previousRequest = activeRequests.current.get(fieldName);
    if (previousRequest) {
      previousRequest.cancelled = true;
    }

    // Set loading state
    setValidationState(prev => ({
      ...prev,
      [fieldName]: { isValidating: true, error: null, isValid: false }
    }));

    // Track this request
    const requestInfo = { requestId, cancelled: false };
    activeRequests.current.set(fieldName, requestInfo);

    try {
      // Execute the validation function
      const result = await validatorFn(value);
      
      // Check if this request was cancelled (race condition prevention)
      if (requestInfo.cancelled) {
        return;
      }

      // Update validation state with result
      setValidationState(prev => ({
        ...prev,
        [fieldName]: {
          isValidating: false,
          error: result.error || null,
          isValid: !result.error,
          message: result.message
        }
      }));

    } catch (error) {
      // Handle validation errors (network issues, etc.)
      if (!requestInfo.cancelled) {
        setValidationState(prev => ({
          ...prev,
          [fieldName]: {
            isValidating: false,
            error: 'Validation failed. Please try again.',
            isValid: false
          }
        }));
      }
    } finally {
      // Clean up request tracking
      activeRequests.current.delete(fieldName);
    }
  }, []);

  // Clear validation state for a field
  const clearValidation = useCallback((fieldName) => {
    // Cancel any active request
    const activeRequest = activeRequests.current.get(fieldName);
    if (activeRequest) {
      activeRequest.cancelled = true;
      activeRequests.current.delete(fieldName);
    }

    // Clear validation state
    setValidationState(prev => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return { validationState, validateAsync, clearValidation };
}

// Advanced form with comprehensive validation patterns
function AdvancedValidationForm() {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    website: '',
    bio: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Async validation hook
  const { validationState, validateAsync, clearValidation } = useAsyncValidation();

  // Debounced values for async validation
  const debouncedUsername = useDebounce(formData.username, 500);
  const debouncedEmail = useDebounce(formData.email, 500);

  // Validation rules configuration
  // Centralized validation logic for maintainability
  const validationRules = useMemo(() => ({
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      customMessage: 'Username can only contain letters, numbers, and underscores'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      customMessage: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      customMessage: 'Password must contain uppercase, lowercase, number, and special character'
    },
    confirmPassword: {
      required: true,
      matchField: 'password',
      customMessage: 'Passwords must match'
    },
    dateOfBirth: {
      required: true,
      customValidator: (value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 13) return 'Must be at least 13 years old';
        if (age > 120) return 'Please enter a valid birth date';
        return null;
      }
    },
    website: {
      required: false,
      pattern: /^https?:\/\/.+\..+/,
      customMessage: 'Please enter a valid URL (including http:// or https://)'
    },
    bio: {
      required: true,
      minLength: 10,
      maxLength: 500,
      customMessage: 'Bio must be between 10 and 500 characters'
    }
  }), [formData.password]);

  // Synchronous validation function
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Required field validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return null;

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.customMessage || `Invalid ${fieldName} format`;
    }

    // Field matching validation (like password confirmation)
    if (rules.matchField) {
      const matchValue = formData[rules.matchField];
      if (value !== matchValue) {
        return rules.customMessage || `${fieldName} does not match ${rules.matchField}`;
      }
    }

    // Custom validator function
    if (rules.customValidator) {
      const customError = rules.customValidator(value);
      if (customError) return customError;
    }

    return null;
  }, [validationRules, formData]);

  // Async validation functions
  const validateUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      return { error: null }; // Skip async validation for invalid inputs
    }

    // Simulate API call to check username availability
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate some usernames being taken
    const takenUsernames = ['admin', 'user', 'test', 'demo', 'john', 'jane'];
    const isTaken = takenUsernames.includes(username.toLowerCase());
    
    if (isTaken) {
      return { error: 'Username is already taken' };
    }

    return { error: null, message: 'Username is available' };
  }, []);

  const validateEmailAvailability = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: null };
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate some emails being taken
    const takenEmails = ['admin@example.com', 'user@test.com', 'demo@site.com'];
    const isTaken = takenEmails.includes(email.toLowerCase());
    
    if (isTaken) {
      return { error: 'Email is already registered' };
    }

    return { error: null, message: 'Email is available' };
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear synchronous errors immediately when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear async validation state when user types
    if (validationState[name]) {
      clearValidation(name);
    }
  }, [errors, validationState, clearValidation]);

  // Handle field blur events
  const handleFieldBlur = useCallback((event) => {
    const { name, value } = event.target;
    
    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, name]));

    // Perform synchronous validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [validateField]);

  // Async validation effects
  // Username availability check
  useEffect(() => {
    if (debouncedUsername && !errors.username && touchedFields.has('username')) {
      validateAsync('username', validateUsernameAvailability, debouncedUsername);
    }
  }, [debouncedUsername, errors.username, touchedFields, validateAsync, validateUsernameAvailability]);

  // Email availability check
  useEffect(() => {
    if (debouncedEmail && !errors.email && touchedFields.has('email')) {
      validateAsync('email', validateEmailAvailability, debouncedEmail);
    }
  }, [debouncedEmail, errors.email, touchedFields, validateAsync, validateEmailAvailability]);

  // Form validation summary
  const formValidation = useMemo(() => {
    const syncErrors = {};
    const asyncErrors = {};
    let hasAsyncValidation = false;

    // Check synchronous validation for all fields
    Object.keys(formData).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) syncErrors[fieldName] = error;
    });

    // Check async validation results
    Object.keys(validationState).forEach(fieldName => {
      const state = validationState[fieldName];
      if (state.isValidating) {
        hasAsyncValidation = true;
      } else if (state.error) {
        asyncErrors[fieldName] = state.error;
      }
    });

    const allErrors = { ...syncErrors, ...asyncErrors };
    const isValid = Object.keys(allErrors).length === 0 && !hasAsyncValidation;

    return {
      isValid,
      hasErrors: Object.keys(allErrors).length > 0,
      isValidating: hasAsyncValidation,
      errors: allErrors
    };
  }, [formData, validateField, validationState]);

  // Form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched to show validation errors
    setTouchedFields(new Set(Object.keys(formData)));

    // Wait for any pending async validations
    if (formValidation.isValidating) {
      await new Promise(resolve => {
        const checkValidation = () => {
          if (!Object.values(validationState).some(state => state.isValidating)) {
            resolve();
          } else {
            setTimeout(checkValidation, 100);
          }
        };
        checkValidation();
      });
    }

    // Re-check validation after async operations complete
    const finalValidation = Object.keys(formData).reduce((errors, fieldName) => {
      const syncError = validateField(fieldName, formData[fieldName]);
      const asyncError = validationState[fieldName]?.error;
      
      if (syncError) errors[fieldName] = syncError;
      if (asyncError) errors[fieldName] = asyncError;
      
      return errors;
    }, {});

    if (Object.keys(finalValidation).length > 0) {
      setErrors(finalValidation);
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Advanced form submitted:', formData);
      alert('Form submitted successfully!');
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        website: '',
        bio: ''
      });
      setTouchedFields(new Set());
      setErrors({});
      
    } catch (error) {
      setErrors({ general: 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateField, validationState, formValidation.isValidating]);

  // Helper function to get field status
  const getFieldStatus = useCallback((fieldName) => {
    const hasError = errors[fieldName] || validationState[fieldName]?.error;
    const isValidating = validationState[fieldName]?.isValidating;
    const isValid = !hasError && validationState[fieldName]?.isValid;
    const isTouched = touchedFields.has(fieldName);

    return {
      hasError: !!hasError,
      isValidating,
      isValid,
      isTouched,
      errorMessage: hasError || validationState[fieldName]?.error,
      successMessage: validationState[fieldName]?.message
    };
  }, [errors, validationState, touchedFields]);

  return (
    <div className="advanced-validation-form">
      <h2>Advanced Form Validation</h2>
      
      {/* Form validation summary */}
      <div className="validation-summary">
        <div className={`status ${formValidation.isValid ? 'valid' : 'invalid'}`}>
          Status: {formValidation.isValidating ? 'Validating...' : 
                   formValidation.isValid ? 'Form is valid' : 
                   'Please fix errors below'}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        
        {/* General error message */}
        {errors.general && (
          <div className="general-error" role="alert">
            {errors.general}
          </div>
        )}

        {/* Username field with async validation */}
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <div className="input-container">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={getFieldStatus('username').hasError ? 'error' : 
                        getFieldStatus('username').isValid ? 'valid' : ''}
              placeholder="Choose a unique username"
              aria-invalid={getFieldStatus('username').hasError}
              aria-describedby="username-help username-error"
            />
            {getFieldStatus('username').isValidating && (
              <div className="validation-spinner" aria-label="Checking username availability">
                ⟳
              </div>
            )}
          </div>
          
          <div id="username-help" className="field-help">
            3-20 characters, letters, numbers, and underscores only
          </div>
          
          {getFieldStatus('username').errorMessage && (
            <div id="username-error" className="error-message" role="alert">
              {getFieldStatus('username').errorMessage}
            </div>
          )}
          
          {getFieldStatus('username').successMessage && (
            <div className="success-message" role="status">
              ✓ {getFieldStatus('username').successMessage}
            </div>
          )}
        </div>

        {/* Email field with async validation */}
        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <div className="input-container">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={getFieldStatus('email').hasError ? 'error' : 
                        getFieldStatus('email').isValid ? 'valid' : ''}
              placeholder="Enter your email address"
              aria-invalid={getFieldStatus('email').hasError}
              aria-describedby="email-error"
            />
            {getFieldStatus('email').isValidating && (
              <div className="validation-spinner" aria-label="Checking email availability">
                ⟳
              </div>
            )}
          </div>
          
          {getFieldStatus('email').errorMessage && (
            <div id="email-error" className="error-message" role="alert">
              {getFieldStatus('email').errorMessage}
            </div>
          )}
          
          {getFieldStatus('email').successMessage && (
            <div className="success-message" role="status">
              ✓ {getFieldStatus('email').successMessage}
            </div>
          )}
        </div>

        {/* Password field with strength indicator */}
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            className={getFieldStatus('password').hasError ? 'error' : 
                      getFieldStatus('password').isValid ? 'valid' : ''}
            placeholder="Create a strong password"
            aria-invalid={getFieldStatus('password').hasError}
            aria-describedby="password-help password-error"
          />
          
          <div id="password-help" className="field-help">
            Must contain uppercase, lowercase, number, and special character
          </div>
          
          {getFieldStatus('password').errorMessage && (
            <div id="password-error" className="error-message" role="alert">
              {getFieldStatus('password').errorMessage}
            </div>
          )}
        </div>

        {/* Confirm password field */}
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            className={getFieldStatus('confirmPassword').hasError ? 'error' : 
                      getFieldStatus('confirmPassword').isValid ? 'valid' : ''}
            placeholder="Confirm your password"
            aria-invalid={getFieldStatus('confirmPassword').hasError}
            aria-describedby="confirm-password-error"
          />
          
          {getFieldStatus('confirmPassword').errorMessage && (
            <div id="confirm-password-error" className="error-message" role="alert">
              {getFieldStatus('confirmPassword').errorMessage}
            </div>
          )}
        </div>

        {/* Date of birth field */}
        <div className="form-field">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            className={getFieldStatus('dateOfBirth').hasError ? 'error' : 
                      getFieldStatus('dateOfBirth').isValid ? 'valid' : ''}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
            aria-invalid={getFieldStatus('dateOfBirth').hasError}
            aria-describedby="dob-error"
          />
          
          {getFieldStatus('dateOfBirth').errorMessage && (
            <div id="dob-error" className="error-message" role="alert">
              {getFieldStatus('dateOfBirth').errorMessage}
            </div>
          )}
        </div>

        {/* Optional website field */}
        <div className="form-field">
          <label htmlFor="website">Website (Optional)</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            className={getFieldStatus('website').hasError ? 'error' : 
                      getFieldStatus('website').isValid ? 'valid' : ''}
            placeholder="https://example.com"
            aria-invalid={getFieldStatus('website').hasError}
            aria-describedby="website-error"
          />
          
          {getFieldStatus('website').errorMessage && (
            <div id="website-error" className="error-message" role="alert">
              {getFieldStatus('website').errorMessage}
            </div>
          )}
        </div>

        {/* Bio textarea with character count */}
        <div className="form-field">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            rows={4}
            className={getFieldStatus('bio').hasError ? 'error' : 
                      getFieldStatus('bio').isValid ? 'valid' : ''}
            placeholder="Tell us about yourself..."
            maxLength={500}
            aria-invalid={getFieldStatus('bio').hasError}
            aria-describedby="bio-help bio-error"
          />
          
          <div id="bio-help" className="field-help">
            {formData.bio.length}/500 characters (minimum 10 required)
          </div>
          
          {getFieldStatus('bio').errorMessage && (
            <div id="bio-error" className="error-message" role="alert">
              {getFieldStatus('bio').errorMessage}
            </div>
          )}
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={isSubmitting || formValidation.isValidating}
          className="submit-button"
        >
          {isSubmitting ? 'Creating Account...' : 
           formValidation.isValidating ? 'Validating...' : 
           'Create Account'}
        </button>
      </form>

      {/* Debug information */}
      <div className="debug-section">
        <details>
          <summary>Debug Information</summary>
          <div className="debug-info">
            <h4>Form Data:</h4>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
            
            <h4>Validation State:</h4>
            <pre>{JSON.stringify(validationState, null, 2)}</pre>
            
            <h4>Errors:</h4>
            <pre>{JSON.stringify(errors, null, 2)}</pre>
            
            <h4>Touched Fields:</h4>
            <pre>{JSON.stringify(Array.from(touchedFields), null, 2)}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}

// Export the main component
export default AdvancedValidationForm;