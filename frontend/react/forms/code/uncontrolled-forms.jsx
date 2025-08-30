/**
 * File: uncontrolled-forms.jsx
 * Description: Comprehensive examples of uncontrolled form components in React
 * 
 * Learning objectives:
 * - Understand uncontrolled component pattern and DOM state management
 * - Master useRef for accessing form values without re-renders
 * - Learn when uncontrolled forms provide performance benefits
 * - See integration patterns with file uploads and third-party libraries
 * 
 * Key Concepts:
 * - DOM maintains form state, not React
 * - Access values via refs when needed (usually on submit)
 * - Fewer re-renders = better performance for large forms
 * - Required for file inputs and some third-party integrations
 */

import React, { useRef, useState, useCallback } from 'react';

// Basic uncontrolled form demonstrating fundamental concepts
// The DOM handles all form state, React accesses it when needed
function BasicUncontrolledForm() {
  // Create refs to access form field values
  // Each ref gives us direct access to the DOM element
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const agreeToTermsRef = useRef(null);
  
  // State for validation errors (UI state, not form data state)
  // We only track errors in React state, not the actual form values
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function that reads values from DOM via refs
  // This approach avoids the need to track form data in React state
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Access current values from DOM elements via refs
    // .current gives us the actual DOM element
    // .value gives us the current input value
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const agreeToTerms = agreeToTermsRef.current.checked;

    // Email validation - same logic as controlled forms
    // But we read from DOM instead of React state
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation with strength requirements
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Password confirmation validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance validation
    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  }, []);

  // Handle form submission by reading all values from DOM
  // This is the primary moment when we access form data
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate form by reading current DOM values
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear errors and extract form data from DOM
    setErrors({});
    
    // Extract all form data at submission time
    // This is when we actually read the form values
    const formData = {
      email: emailRef.current.value.trim(),
      password: passwordRef.current.value,
      confirmPassword: confirmPasswordRef.current.value,
      agreeToTerms: agreeToTermsRef.current.checked
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Uncontrolled form submitted:', formData);
      alert('Form submitted successfully!');
      
      // Reset form using DOM methods
      // uncontrolled forms can be reset via the form element
      event.target.reset();
      
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ general: 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm]);

  // Optional: Handle real-time validation on blur
  // This gives some feedback without tracking state during typing
  const handleFieldBlur = useCallback((fieldName, validationFn) => {
    const fieldError = validationFn();
    
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError
      }));
    } else {
      setErrors(prev => {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  return (
    <div className="uncontrolled-form-container">
      <h2>User Registration (Uncontrolled Form)</h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* General error message */}
        {errors.general && (
          <div className="general-error" role="alert">
            {errors.general}
          </div>
        )}

        {/* Email field - uncontrolled */}
        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            ref={emailRef} // Ref instead of value/onChange
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email"
            // Optional: validate on blur for immediate feedback
            onBlur={() => handleFieldBlur('email', () => {
              const email = emailRef.current.value.trim();
              if (!email) return 'Email is required';
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
              return null;
            })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : null}
          />
          {errors.email && (
            <span id="email-error" className="error-message" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password field */}
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            ref={passwordRef}
            className={errors.password ? 'error' : ''}
            placeholder="Enter your password"
            onBlur={() => handleFieldBlur('password', () => {
              const password = passwordRef.current.value;
              if (!password) return 'Password is required';
              if (password.length < 8) return 'Password too short';
              return null;
            })}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : null}
          />
          {errors.password && (
            <span id="password-error" className="error-message" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {/* Confirm password field */}
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            ref={confirmPasswordRef}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
            onBlur={() => handleFieldBlur('confirmPassword', () => {
              const confirmPassword = confirmPasswordRef.current.value;
              const password = passwordRef.current.value;
              if (!confirmPassword) return 'Please confirm password';
              if (password !== confirmPassword) return 'Passwords do not match';
              return null;
            })}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : null}
          />
          {errors.confirmPassword && (
            <span id="confirm-password-error" className="error-message" role="alert">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="form-field checkbox-field">
          <label htmlFor="agreeToTerms">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              ref={agreeToTermsRef}
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

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

// Advanced uncontrolled form with file uploads and FormData
// Demonstrates real-world scenarios where uncontrolled is preferred
function FileUploadUncontrolledForm() {
  // Refs for form fields
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const avatarRef = useRef(null);
  const resumeRef = useRef(null);
  const bioRef = useRef(null);
  
  // State for UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // File validation helper
  // Validates file type, size, and other constraints
  const validateFile = useCallback((file, fieldName, options = {}) => {
    const { 
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = [],
      required = false 
    } = options;

    if (!file && required) {
      return `${fieldName} is required`;
    }

    if (file) {
      // File size validation
      if (file.size > maxSize) {
        return `${fieldName} must be less than ${maxSize / (1024 * 1024)}MB`;
      }

      // File type validation
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `${fieldName} must be one of: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  }, []);

  // Form validation including file validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Basic field validation
    const name = nameRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const bio = bioRef.current.value.trim();

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!bio || bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    }

    // File validation
    const avatarFile = avatarRef.current.files[0];
    const resumeFile = resumeRef.current.files[0];

    // Avatar validation (optional)
    const avatarError = validateFile(avatarFile, 'Avatar', {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      required: false
    });
    if (avatarError) newErrors.avatar = avatarError;

    // Resume validation (required)
    const resumeError = validateFile(resumeFile, 'Resume', {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      required: true
    });
    if (resumeError) newErrors.resume = resumeError;

    return newErrors;
  }, [validateFile]);

  // Handle form submission with file uploads
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setUploadProgress({});

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    // Create FormData object for multipart form submission
    // FormData automatically handles file uploads and form encoding
    const formData = new FormData();
    
    // Add text fields to FormData
    formData.append('name', nameRef.current.value.trim());
    formData.append('email', emailRef.current.value.trim());
    formData.append('bio', bioRef.current.value.trim());
    
    // Add file fields to FormData
    const avatarFile = avatarRef.current.files[0];
    const resumeFile = resumeRef.current.files[0];
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      // Simulate file upload with progress tracking
      // In real app, use XMLHttpRequest or fetch with progress
      await simulateUploadWithProgress(formData, setUploadProgress);
      
      console.log('File upload form submitted successfully');
      alert('Profile created successfully with file uploads!');
      
      // Reset form
      formRef.current.reset();
      setUploadProgress({});
      
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors({ general: 'Upload failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm]);

  // Handle file input changes for preview/validation
  const handleFileChange = useCallback((event, fieldName) => {
    const file = event.target.files[0];
    
    if (file) {
      // Optional: show file preview or validation feedback
      console.log(`${fieldName} selected:`, file.name, file.size);
      
      // Clear any existing error for this field
      setErrors(prev => {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  return (
    <div className="file-upload-form-container">
      <h2>Profile Creation (File Upload Form)</h2>
      
      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        
        {/* General error */}
        {errors.general && (
          <div className="general-error" role="alert">
            {errors.general}
          </div>
        )}

        {/* Basic text fields */}
        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            ref={nameRef}
            required
            className={errors.name ? 'error' : ''}
            placeholder="Enter your full name"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <span className="error-message" role="alert">{errors.name}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            ref={emailRef}
            required
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className="error-message" role="alert">{errors.email}</span>
          )}
        </div>

        {/* File upload fields */}
        <div className="form-field">
          <label htmlFor="avatar">Profile Picture (Optional)</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            ref={avatarRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange(e, 'avatar')}
            className={errors.avatar ? 'error' : ''}
            aria-invalid={!!errors.avatar}
            aria-describedby="avatar-help"
          />
          <small id="avatar-help" className="field-help">
            JPEG, PNG, or WebP format. Max size: 2MB
          </small>
          {errors.avatar && (
            <span className="error-message" role="alert">{errors.avatar}</span>
          )}
          {uploadProgress.avatar && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress.avatar}%` }}
                />
              </div>
              <span>{uploadProgress.avatar}%</span>
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="resume">Resume (Required)</label>
          <input
            type="file"
            id="resume"
            name="resume"
            ref={resumeRef}
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileChange(e, 'resume')}
            required
            className={errors.resume ? 'error' : ''}
            aria-invalid={!!errors.resume}
            aria-describedby="resume-help"
          />
          <small id="resume-help" className="field-help">
            PDF, DOC, or DOCX format. Max size: 10MB
          </small>
          {errors.resume && (
            <span className="error-message" role="alert">{errors.resume}</span>
          )}
          {uploadProgress.resume && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress.resume}%` }}
                />
              </div>
              <span>{uploadProgress.resume}%</span>
            </div>
          )}
        </div>

        {/* Textarea for bio */}
        <div className="form-field">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            ref={bioRef}
            rows={4}
            required
            className={errors.bio ? 'error' : ''}
            placeholder="Tell us about yourself (minimum 10 characters)"
            aria-invalid={!!errors.bio}
          />
          {errors.bio && (
            <span className="error-message" role="alert">{errors.bio}</span>
          )}
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}

// Utility function to simulate file upload with progress
// In real app, this would be an actual HTTP request with progress tracking
async function simulateUploadWithProgress(formData, setProgress) {
  // Simulate upload progress for each file
  const files = ['avatar', 'resume'];
  
  for (const fileField of files) {
    if (formData.has(fileField)) {
      // Simulate gradual upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setProgress(prev => ({
          ...prev,
          [fileField]: progress
        }));
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }
  
  // Final delay to simulate server processing
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Third-party library integration example
// Shows how uncontrolled forms work well with external components
function ThirdPartyIntegrationForm() {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});

  // Handle submission by reading native form data
  // This pattern works well with third-party form libraries
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    
    // Use FormData to extract all form values
    // This works with any form fields, including third-party components
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form data from third-party integration:', data);
    
    // Validation and submission logic here
    setErrors({});
    alert('Form with third-party components submitted!');
  }, []);

  return (
    <div className="third-party-integration-form">
      <h2>Third-Party Integration Form</h2>
      
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Standard HTML inputs work seamlessly */}
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            placeholder="Enter username"
          />
        </div>

        {/* 
        Example third-party components that work well with uncontrolled forms:
        - Rich text editors (TinyMCE, CKEditor)
        - Date pickers that render to hidden inputs
        - Custom select components
        - Map components with hidden coordinate inputs
        */}
        
        {/* Simulated third-party component */}
        <div className="form-field">
          <label htmlFor="categories">Categories</label>
          <select name="categories" id="categories" multiple>
            <option value="tech">Technology</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
          </select>
        </div>

        {/* Hidden fields (common with third-party integrations) */}
        <input type="hidden" name="tracking_id" value="unique-form-id" />
        <input type="hidden" name="form_version" value="1.2" />

        <button type="submit" className="submit-button">
          Submit Integration Form
        </button>
      </form>
    </div>
  );
}

// Export components for use and testing
export {
  BasicUncontrolledForm,
  FileUploadUncontrolledForm,
  ThirdPartyIntegrationForm
};

// Main demo component showing different uncontrolled form patterns
export default function UncontrolledFormsDemo() {
  const [activeDemo, setActiveDemo] = useState('basic');

  const demos = {
    basic: { component: BasicUncontrolledForm, title: 'Basic Uncontrolled Form' },
    fileUpload: { component: FileUploadUncontrolledForm, title: 'File Upload Form' },
    thirdParty: { component: ThirdPartyIntegrationForm, title: 'Third-Party Integration' }
  };

  const ActiveComponent = demos[activeDemo].component;

  return (
    <div className="uncontrolled-forms-demo">
      <nav className="demo-nav">
        {Object.entries(demos).map(([key, { title }]) => (
          <button
            key={key}
            onClick={() => setActiveDemo(key)}
            className={activeDemo === key ? 'active' : ''}
          >
            {title}
          </button>
        ))}
      </nav>

      <div className="demo-content">
        <ActiveComponent />
      </div>
    </div>
  );
}