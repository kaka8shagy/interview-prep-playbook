/**
 * File: interview-form-testing.jsx
 * Description: Interview question - Test complex form component with validation
 * Tests comprehensive form testing including validation, async submission, and error handling
 */

import React, { useState, useRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// === INTERVIEW QUESTION ===
// Test a complex registration form with the following features:
// 1. Real-time validation for all fields
// 2. Password strength indicator
// 3. Async email availability check
// 4. Terms acceptance requirement
// 5. File upload with validation
// 6. Form submission with loading states
// 7. Error handling and display

// === Complex Registration Form Component ===
function RegistrationForm({ onSubmit, checkEmailAvailability }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    avatar: null,
    termsAccepted: false,
    newsletter: false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle'); // idle, checking, available, taken
  const [passwordStrength, setPasswordStrength] = useState(0);
  const fileInputRef = useRef();
  
  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email format is invalid';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain uppercase, lowercase, and number';
        }
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^\+?[\d\s\-\(\)]{10,}$/.test(value)) return 'Invalid phone number format';
        return '';
      
      case 'dateOfBirth':
        if (!value) return 'Date of birth is required';
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 13) return 'Must be at least 13 years old';
        if (age > 120) return 'Invalid date of birth';
        return '';
      
      case 'avatar':
        if (value) {
          if (value.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';
          if (!['image/jpeg', 'image/png', 'image/gif'].includes(value.type)) {
            return 'Only JPG, PNG, and GIF files are allowed';
          }
        }
        return '';
      
      case 'termsAccepted':
        if (!value) return 'You must accept the terms and conditions';
        return '';
      
      default:
        return '';
    }
  };
  
  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z\d]/.test(password)) strength += 1;
    return strength;
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const newValue = type === 'checkbox' ? checked : type === 'file' ? files[0] : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      // Also validate confirm password if it's been touched
      if (touched.confirmPassword) {
        const confirmError = validateField('confirmPassword', formData.confirmPassword);
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      }
    }
    
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };
  
  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Check email availability
    if (name === 'email' && value && !error && checkEmailAvailability) {
      checkEmailAvailabilityAsync(value);
    }
  };
  
  // Check email availability
  const checkEmailAvailabilityAsync = async (email) => {
    setEmailCheckStatus('checking');
    try {
      const isAvailable = await checkEmailAvailability(email);
      setEmailCheckStatus(isAvailable ? 'available' : 'taken');
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, email: 'Email is already taken' }));
      }
    } catch (error) {
      setEmailCheckStatus('idle');
      console.error('Email check failed:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData);
    const newTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(newTouched);
    
    // Validate all fields
    const newErrors = {};
    allFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    if (emailCheckStatus === 'taken') {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: '',
        avatar: null,
        termsAccepted: false,
        newsletter: false
      });
      setErrors({});
      setTouched({});
      setPasswordStrength(0);
      setEmailCheckStatus('idle');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = Object.keys(errors).length === 0 && 
    formData.termsAccepted && 
    emailCheckStatus !== 'taken';
  
  return (
    <div className="registration-form">
      <h1>Create Account</h1>
      
      <form onSubmit={handleSubmit} noValidate>
        {/* Name Fields */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={errors.firstName && touched.firstName ? 'error' : ''}
              aria-describedby={errors.firstName && touched.firstName ? 'firstName-error' : null}
            />
            {errors.firstName && touched.firstName && (
              <span id="firstName-error" className="error-message" role="alert">
                {errors.firstName}
              </span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={errors.lastName && touched.lastName ? 'error' : ''}
              aria-describedby={errors.lastName && touched.lastName ? 'lastName-error' : null}
            />
            {errors.lastName && touched.lastName && (
              <span id="lastName-error" className="error-message" role="alert">
                {errors.lastName}
              </span>
            )}
          </div>
        </div>
        
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.email && touched.email ? 'error' : ''}
            aria-describedby="email-description"
          />
          <div id="email-description" className="field-description">
            {emailCheckStatus === 'checking' && (
              <span className="checking" aria-live="polite">Checking availability...</span>
            )}
            {emailCheckStatus === 'available' && (
              <span className="available" aria-live="polite">✓ Email is available</span>
            )}
            {emailCheckStatus === 'taken' && (
              <span className="taken" role="alert">✗ Email is already taken</span>
            )}
          </div>
          {errors.email && touched.email && (
            <span className="error-message" role="alert">{errors.email}</span>
          )}
        </div>
        
        {/* Password Fields */}
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.password && touched.password ? 'error' : ''}
            aria-describedby="password-strength"
          />
          
          {/* Password Strength Indicator */}
          <div id="password-strength" className="password-strength">
            <div className="strength-meter">
              <div 
                className={`strength-bar strength-${passwordStrength}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                role="progressbar"
                aria-valuenow={passwordStrength}
                aria-valuemin="0"
                aria-valuemax="5"
                aria-label="Password strength"
              />
            </div>
            <span className="strength-text">
              {passwordStrength === 0 && 'Enter password'}
              {passwordStrength === 1 && 'Weak'}
              {passwordStrength === 2 && 'Fair'}
              {passwordStrength === 3 && 'Good'}
              {passwordStrength === 4 && 'Strong'}
              {passwordStrength === 5 && 'Very Strong'}
            </span>
          </div>
          
          {errors.password && touched.password && (
            <span className="error-message" role="alert">{errors.password}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <span className="error-message" role="alert">{errors.confirmPassword}</span>
          )}
        </div>
        
        {/* Phone Field */}
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="+1 (555) 123-4567"
            className={errors.phone && touched.phone ? 'error' : ''}
          />
          {errors.phone && touched.phone && (
            <span className="error-message" role="alert">{errors.phone}</span>
          )}
        </div>
        
        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.dateOfBirth && touched.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && touched.dateOfBirth && (
            <span className="error-message" role="alert">{errors.dateOfBirth}</span>
          )}
        </div>
        
        {/* Avatar Upload */}
        <div className="form-group">
          <label htmlFor="avatar">Profile Picture (optional)</label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleInputChange}
            ref={fileInputRef}
            className={errors.avatar && touched.avatar ? 'error' : ''}
          />
          <div className="field-description">
            JPG, PNG, or GIF. Max size: 5MB
          </div>
          {errors.avatar && touched.avatar && (
            <span className="error-message" role="alert">{errors.avatar}</span>
          )}
        </div>
        
        {/* Checkboxes */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              aria-describedby={errors.termsAccepted ? 'terms-error' : null}
            />
            I accept the <a href="/terms" target="_blank" rel="noopener">Terms and Conditions</a> *
          </label>
          {errors.termsAccepted && (
            <span id="terms-error" className="error-message" role="alert">
              {errors.termsAccepted}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleInputChange}
            />
            Subscribe to our newsletter
          </label>
        </div>
        
        {/* Submit Error */}
        {errors.submit && (
          <div className="submit-error" role="alert">
            {errors.submit}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="submit-button"
          aria-describedby="submit-status"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div id="submit-status" aria-live="polite" aria-atomic="true">
          {isSubmitting && 'Processing your registration...'}
        </div>
      </form>
    </div>
  );
}

// === COMPREHENSIVE TESTS ===

describe('RegistrationForm Component', () => {
  const mockSubmit = jest.fn();
  const mockCheckEmail = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // === Basic Rendering Tests ===
  test('renders all form fields', () => {
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password *')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profile picture/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /terms and conditions/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /newsletter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });
  
  // === Validation Tests ===
  test('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/accept the terms/i)).toBeInTheDocument();
    });
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
  
  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur
    
    await waitFor(() => {
      expect(screen.getByText(/email format is invalid/i)).toBeInTheDocument();
    });
  });
  
  test('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const passwordInput = screen.getByLabelText('Password *');
    
    // Test weak password
    await user.type(passwordInput, 'weak');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // Test password without required characters
    await user.clear(passwordInput);
    await user.type(passwordInput, 'weakpassword');
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain uppercase, lowercase, and number/i)).toBeInTheDocument();
    });
  });
  
  test('validates password confirmation', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const passwordInput = screen.getByLabelText('Password *');
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    await user.type(passwordInput, 'ValidPass123');
    await user.type(confirmPasswordInput, 'DifferentPass123');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
  
  test('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    
    await user.type(phoneInput, '123');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
    });
  });
  
  test('validates age requirement', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const dobInput = screen.getByLabelText(/date of birth/i);
    
    // Set date to make user 12 years old
    const tooYoungDate = new Date();
    tooYoungDate.setFullYear(tooYoungDate.getFullYear() - 12);
    const dateString = tooYoungDate.toISOString().split('T')[0];
    
    await user.type(dobInput, dateString);
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/must be at least 13 years old/i)).toBeInTheDocument();
    });
  });
  
  // === Password Strength Indicator Tests ===
  test('shows password strength indicator', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const passwordInput = screen.getByLabelText('Password *');
    const strengthIndicator = screen.getByRole('progressbar', { name: /password strength/i });
    
    // Initially shows "Enter password"
    expect(screen.getByText('Enter password')).toBeInTheDocument();
    expect(strengthIndicator).toHaveAttribute('aria-valuenow', '0');
    
    // Weak password
    await user.type(passwordInput, 'weak');
    expect(screen.getByText('Weak')).toBeInTheDocument();
    expect(strengthIndicator).toHaveAttribute('aria-valuenow', '1');
    
    // Strong password
    await user.clear(passwordInput);
    await user.type(passwordInput, 'StrongPass123!');
    expect(screen.getByText('Very Strong')).toBeInTheDocument();
    expect(strengthIndicator).toHaveAttribute('aria-valuenow', '5');
  });
  
  // === Email Availability Tests ===
  test('checks email availability', async () => {
    const user = userEvent.setup();
    mockCheckEmail.mockResolvedValue(true);
    
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.tab();
    
    // Should show checking status
    expect(screen.getByText(/checking availability/i)).toBeInTheDocument();
    
    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText(/email is available/i)).toBeInTheDocument();
    });
    
    expect(mockCheckEmail).toHaveBeenCalledWith('test@example.com');
  });
  
  test('handles email unavailability', async () => {
    const user = userEvent.setup();
    mockCheckEmail.mockResolvedValue(false);
    
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    await user.type(emailInput, 'taken@example.com');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/email is already taken/i)).toBeInTheDocument();
    });
  });
  
  // === File Upload Tests ===
  test('validates file upload', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const fileInput = screen.getByLabelText(/profile picture/i);
    
    // Create a large file
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    });
    
    await user.upload(fileInput, largeFile);
    
    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
    });
  });
  
  test('validates file type', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    const fileInput = screen.getByLabelText(/profile picture/i);
    
    const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    await user.upload(fileInput, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/only jpg, png, and gif files are allowed/i)).toBeInTheDocument();
    });
  });
  
  // === Form Submission Tests ===
  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockCheckEmail.mockResolvedValue(true);
    mockSubmit.mockResolvedValue();
    
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    // Fill out form with valid data
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText('Password *'), 'ValidPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass123');
    await user.type(screen.getByLabelText(/phone number/i), '+1 (555) 123-4567');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
    await user.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    
    // Wait for email check
    await waitFor(() => {
      expect(screen.getByText(/email is available/i)).toBeInTheDocument();
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check loading state
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    expect(screen.getByText(/processing your registration/i)).toBeInTheDocument();
    
    // Wait for submission
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
        phone: '+1 (555) 123-4567',
        dateOfBirth: '1990-01-01',
        avatar: null,
        termsAccepted: true,
        newsletter: false
      });
    });
  });
  
  test('handles submission error', async () => {
    const user = userEvent.setup();
    mockCheckEmail.mockResolvedValue(true);
    mockSubmit.mockRejectedValue(new Error('Server error'));
    
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    // Fill out minimum required fields
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText('Password *'), 'ValidPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'ValidPass123');
    await user.type(screen.getByLabelText(/phone number/i), '+1 (555) 123-4567');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
    await user.click(screen.getByRole('checkbox', { name: /terms and conditions/i }));
    
    // Wait for email check and submit
    await waitFor(() => {
      expect(screen.getByText(/email is available/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
    
    // Form should be re-enabled
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled();
  });
  
  // === Accessibility Tests ===
  test('has proper ARIA attributes', () => {
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    // Error messages have role="alert"
    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.blur(firstNameInput);
    
    const errorMessage = screen.getByText(/first name is required/i);
    expect(errorMessage).toHaveAttribute('role', 'alert');
    
    // Password strength has proper progressbar attributes
    const strengthBar = screen.getByRole('progressbar', { name: /password strength/i });
    expect(strengthBar).toHaveAttribute('aria-valuenow', '0');
    expect(strengthBar).toHaveAttribute('aria-valuemin', '0');
    expect(strengthBar).toHaveAttribute('aria-valuemax', '5');
  });
  
  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockSubmit} checkEmailAvailability={mockCheckEmail} />);
    
    // Tab through form fields
    await user.tab();
    expect(screen.getByLabelText(/first name/i)).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText(/last name/i)).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText(/email/i)).toHaveFocus();
  });
});

export { RegistrationForm };