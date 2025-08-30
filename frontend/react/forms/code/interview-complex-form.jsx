/**
 * File: interview-complex-form.jsx
 * Description: Interview-focused complex multi-step form implementation
 * 
 * Learning objectives:
 * - Build a production-ready multi-step form from scratch
 * - Implement step validation and navigation logic
 * - Handle form state persistence across steps
 * - Create accessible form navigation and error handling
 * - Demonstrate advanced form patterns for interviews
 * 
 * Interview Focus:
 * This implementation demonstrates many concepts interviewers look for:
 * - Complex state management without external libraries
 * - Proper separation of concerns
 * - Accessibility considerations
 * - Performance optimization techniques
 * - Error boundary and edge case handling
 * - Clean, maintainable code structure
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ============================================================================
// FORM STEP DEFINITIONS AND CONFIGURATION
// ============================================================================

// Define the structure of our multi-step form
// This configuration approach makes it easy to add/remove steps
const FORM_STEPS = {
  PERSONAL: {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    fields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth']
  },
  PROFESSIONAL: {
    id: 'professional', 
    title: 'Professional Details',
    description: 'Your work experience and skills',
    fields: ['jobTitle', 'company', 'experience', 'skills', 'linkedinProfile']
  },
  PREFERENCES: {
    id: 'preferences',
    title: 'Job Preferences', 
    description: 'What are you looking for?',
    fields: ['jobType', 'workLocation', 'salaryRange', 'startDate', 'willingToRelocate']
  },
  DOCUMENTS: {
    id: 'documents',
    title: 'Documents & Portfolio',
    description: 'Upload your resume and portfolio',
    fields: ['resume', 'coverLetter', 'portfolio', 'references']
  },
  REVIEW: {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your information before submitting',
    fields: []
  }
};

// Convert steps object to ordered array for navigation
const STEP_ORDER = Object.values(FORM_STEPS);

// ============================================================================
// CUSTOM HOOKS FOR FORM MANAGEMENT
// ============================================================================

// Custom hook for managing multi-step form state
function useMultiStepForm(initialData = {}) {
  // Current step tracking
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Professional Details
    jobTitle: '',
    company: '',
    experience: '0-1',
    skills: [],
    linkedinProfile: '',
    
    // Job Preferences
    jobType: 'full-time',
    workLocation: 'remote',
    salaryRange: '',
    startDate: '',
    willingToRelocate: false,
    
    // Documents
    resume: null,
    coverLetter: null,
    portfolio: null,
    references: null,
    
    ...initialData
  });

  // Validation errors for each step
  const [stepErrors, setStepErrors] = useState({});
  
  // Track which steps have been visited (for validation display)
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));

  // Get current step configuration
  const currentStep = STEP_ORDER[currentStepIndex];

  // Navigation functions
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < STEP_ORDER.length) {
      setCurrentStepIndex(stepIndex);
      setVisitedSteps(prev => new Set([...prev, stepIndex]));
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < STEP_ORDER.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setVisitedSteps(prev => new Set([...prev, nextIndex]));
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  // Form data updates
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFieldValue = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  // Error management
  const setStepError = useCallback((stepId, errors) => {
    setStepErrors(prev => ({ ...prev, [stepId]: errors }));
  }, []);

  const clearStepErrors = useCallback((stepId) => {
    setStepErrors(prev => {
      const { [stepId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    // Current state
    currentStepIndex,
    currentStep,
    formData,
    stepErrors,
    visitedSteps,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    
    // Data management
    updateFormData,
    updateFieldValue,
    
    // Error management
    setStepError,
    clearStepErrors,
    
    // Computed properties
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === STEP_ORDER.length - 1,
    totalSteps: STEP_ORDER.length,
    stepProgress: ((currentStepIndex + 1) / STEP_ORDER.length) * 100
  };
}

// Custom hook for form validation
function useFormValidation() {
  // Validation rules for each field
  const validationRules = useMemo(() => ({
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'First name must be 2-50 characters, letters only'
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Last name must be 2-50 characters, letters only'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      required: true,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    },
    dateOfBirth: {
      required: true,
      customValidator: (value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) return 'Must be at least 16 years old';
        if (age > 100) return 'Please enter a valid birth date';
        return null;
      }
    },
    jobTitle: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Job title is required'
    },
    company: {
      required: false,
      maxLength: 100
    },
    linkedinProfile: {
      required: false,
      pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      message: 'Please enter a valid LinkedIn profile URL'
    },
    salaryRange: {
      required: true,
      message: 'Please select a salary range'
    },
    startDate: {
      required: true,
      customValidator: (value) => {
        const startDate = new Date(value);
        const today = new Date();
        if (startDate < today) return 'Start date must be in the future';
        return null;
      }
    },
    resume: {
      required: true,
      customValidator: (file) => {
        if (!file) return 'Resume is required';
        if (file.size > 5 * 1024 * 1024) return 'Resume must be less than 5MB';
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) return 'Resume must be PDF, DOC, or DOCX';
        return null;
      }
    }
  }), []);

  // Validate a single field
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Required field check
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rules.message || `${fieldName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return null;

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum ${rules.minLength} characters required`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum ${rules.maxLength} characters allowed`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.message || `Invalid ${fieldName} format`;
      }
    }

    // Custom validator
    if (rules.customValidator) {
      const customError = rules.customValidator(value);
      if (customError) return customError;
    }

    return null;
  }, [validationRules]);

  // Validate a step (multiple fields)
  const validateStep = useCallback((step, formData) => {
    const errors = {};
    
    step.fields.forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }, [validateField]);

  return {
    validateField,
    validateStep,
    validationRules
  };
}

// ============================================================================
// INDIVIDUAL STEP COMPONENTS
// ============================================================================

// Personal Information Step
function PersonalInformationStep({ formData, updateFieldValue, errors = {} }) {
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    updateFieldValue(name, value);
  }, [updateFieldValue]);

  return (
    <div className="form-step personal-step">
      <div className="step-content">
        
        {/* Name fields */}
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter your first name"
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <span className="error-message" role="alert">
                {errors.firstName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter your last name"
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <span className="error-message" role="alert">
                {errors.lastName}
              </span>
            )}
          </div>
        </div>

        {/* Contact information */}
        <div className="form-field">
          <label htmlFor="email">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email address"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className="error-message" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="phone">
            Phone Number <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
            placeholder="Enter your phone number"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <span className="error-message" role="alert">
              {errors.phone}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="dateOfBirth">
            Date of Birth <span className="required">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={errors.dateOfBirth ? 'error' : ''}
            max={new Date().toISOString().split('T')[0]}
            autoComplete="bday"
            aria-invalid={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <span className="error-message" role="alert">
              {errors.dateOfBirth}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Professional Details Step  
function ProfessionalDetailsStep({ formData, updateFieldValue, errors = {} }) {
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    updateFieldValue(name, value);
  }, [updateFieldValue]);

  const handleSkillsChange = useCallback((event) => {
    const value = event.target.value;
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean);
    updateFieldValue('skills', skillsArray);
  }, [updateFieldValue]);

  return (
    <div className="form-step professional-step">
      <div className="step-content">
        
        <div className="form-field">
          <label htmlFor="jobTitle">
            Current/Desired Job Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            className={errors.jobTitle ? 'error' : ''}
            placeholder="e.g., Senior Software Engineer"
            autoComplete="organization-title"
            aria-invalid={!!errors.jobTitle}
          />
          {errors.jobTitle && (
            <span className="error-message" role="alert">
              {errors.jobTitle}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="company">Current Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className={errors.company ? 'error' : ''}
            placeholder="e.g., Tech Corp Inc."
            autoComplete="organization"
            aria-invalid={!!errors.company}
          />
          {errors.company && (
            <span className="error-message" role="alert">
              {errors.company}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="experience">Years of Experience</label>
          <select
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className={errors.experience ? 'error' : ''}
            aria-invalid={!!errors.experience}
          >
            <option value="0-1">0-1 years</option>
            <option value="2-3">2-3 years</option>
            <option value="4-6">4-6 years</option>
            <option value="7-10">7-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="skills">Skills (comma-separated)</label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills.join(', ')}
            onChange={handleSkillsChange}
            rows={3}
            className={errors.skills ? 'error' : ''}
            placeholder="e.g., JavaScript, React, Node.js, Python"
            aria-describedby="skills-help"
          />
          <div id="skills-help" className="field-help">
            Enter skills separated by commas
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="linkedinProfile">LinkedIn Profile</label>
          <input
            type="url"
            id="linkedinProfile"
            name="linkedinProfile"
            value={formData.linkedinProfile}
            onChange={handleInputChange}
            className={errors.linkedinProfile ? 'error' : ''}
            placeholder="https://www.linkedin.com/in/your-profile"
            aria-invalid={!!errors.linkedinProfile}
          />
          {errors.linkedinProfile && (
            <span className="error-message" role="alert">
              {errors.linkedinProfile}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Job Preferences Step
function JobPreferencesStep({ formData, updateFieldValue, errors = {} }) {
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    updateFieldValue(name, fieldValue);
  }, [updateFieldValue]);

  return (
    <div className="form-step preferences-step">
      <div className="step-content">
        
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="jobType">Job Type</label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="workLocation">Work Location</label>
            <select
              id="workLocation"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleInputChange}
            >
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="salaryRange">
            Expected Salary Range <span className="required">*</span>
          </label>
          <select
            id="salaryRange"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleInputChange}
            className={errors.salaryRange ? 'error' : ''}
            aria-invalid={!!errors.salaryRange}
          >
            <option value="">Select salary range</option>
            <option value="30k-50k">$30,000 - $50,000</option>
            <option value="50k-75k">$50,000 - $75,000</option>
            <option value="75k-100k">$75,000 - $100,000</option>
            <option value="100k-150k">$100,000 - $150,000</option>
            <option value="150k+">$150,000+</option>
          </select>
          {errors.salaryRange && (
            <span className="error-message" role="alert">
              {errors.salaryRange}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="startDate">
            Available Start Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className={errors.startDate ? 'error' : ''}
            min={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.startDate}
          />
          {errors.startDate && (
            <span className="error-message" role="alert">
              {errors.startDate}
            </span>
          )}
        </div>

        <div className="form-field checkbox-field">
          <label htmlFor="willingToRelocate">
            <input
              type="checkbox"
              id="willingToRelocate"
              name="willingToRelocate"
              checked={formData.willingToRelocate}
              onChange={handleInputChange}
            />
            Willing to relocate for the right opportunity
          </label>
        </div>
      </div>
    </div>
  );
}

// Documents Step
function DocumentsStep({ formData, updateFieldValue, errors = {} }) {
  const handleFileChange = useCallback((event) => {
    const { name } = event.target;
    const file = event.target.files[0] || null;
    updateFieldValue(name, file);
  }, [updateFieldValue]);

  const getFileDisplayName = (file) => {
    if (!file) return null;
    return file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name;
  };

  return (
    <div className="form-step documents-step">
      <div className="step-content">
        
        <div className="form-field">
          <label htmlFor="resume">
            Resume <span className="required">*</span>
          </label>
          <input
            type="file"
            id="resume"
            name="resume"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className={errors.resume ? 'error' : ''}
            aria-invalid={!!errors.resume}
            aria-describedby="resume-help"
          />
          <div id="resume-help" className="field-help">
            PDF, DOC, or DOCX format. Maximum 5MB.
          </div>
          {formData.resume && (
            <div className="file-preview">
              📄 {getFileDisplayName(formData.resume)}
            </div>
          )}
          {errors.resume && (
            <span className="error-message" role="alert">
              {errors.resume}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="coverLetter">Cover Letter</label>
          <input
            type="file"
            id="coverLetter"
            name="coverLetter"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            aria-describedby="cover-letter-help"
          />
          <div id="cover-letter-help" className="field-help">
            Optional. PDF, DOC, or DOCX format.
          </div>
          {formData.coverLetter && (
            <div className="file-preview">
              📄 {getFileDisplayName(formData.coverLetter)}
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="portfolio">Portfolio/Work Samples</label>
          <input
            type="file"
            id="portfolio"
            name="portfolio"
            onChange={handleFileChange}
            accept=".pdf,.zip,.doc,.docx"
            aria-describedby="portfolio-help"
          />
          <div id="portfolio-help" className="field-help">
            Optional. PDF, ZIP, DOC, or DOCX format.
          </div>
          {formData.portfolio && (
            <div className="file-preview">
              📁 {getFileDisplayName(formData.portfolio)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Review Step
function ReviewStep({ formData }) {
  const formatFileInfo = (file) => {
    if (!file) return 'Not provided';
    return `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  };

  return (
    <div className="form-step review-step">
      <div className="step-content">
        <h3>Please review your information</h3>
        
        {/* Personal Information Review */}
        <div className="review-section">
          <h4>Personal Information</h4>
          <div className="review-data">
            <div className="review-item">
              <span className="label">Name:</span>
              <span className="value">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="review-item">
              <span className="label">Email:</span>
              <span className="value">{formData.email}</span>
            </div>
            <div className="review-item">
              <span className="label">Phone:</span>
              <span className="value">{formData.phone}</span>
            </div>
            <div className="review-item">
              <span className="label">Date of Birth:</span>
              <span className="value">{formData.dateOfBirth}</span>
            </div>
          </div>
        </div>

        {/* Professional Information Review */}
        <div className="review-section">
          <h4>Professional Details</h4>
          <div className="review-data">
            <div className="review-item">
              <span className="label">Job Title:</span>
              <span className="value">{formData.jobTitle}</span>
            </div>
            <div className="review-item">
              <span className="label">Company:</span>
              <span className="value">{formData.company || 'Not specified'}</span>
            </div>
            <div className="review-item">
              <span className="label">Experience:</span>
              <span className="value">{formData.experience} years</span>
            </div>
            <div className="review-item">
              <span className="label">Skills:</span>
              <span className="value">{formData.skills.join(', ') || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Job Preferences Review */}
        <div className="review-section">
          <h4>Job Preferences</h4>
          <div className="review-data">
            <div className="review-item">
              <span className="label">Job Type:</span>
              <span className="value">{formData.jobType}</span>
            </div>
            <div className="review-item">
              <span className="label">Work Location:</span>
              <span className="value">{formData.workLocation}</span>
            </div>
            <div className="review-item">
              <span className="label">Salary Range:</span>
              <span className="value">{formData.salaryRange}</span>
            </div>
            <div className="review-item">
              <span className="label">Start Date:</span>
              <span className="value">{formData.startDate}</span>
            </div>
            <div className="review-item">
              <span className="label">Willing to Relocate:</span>
              <span className="value">{formData.willingToRelocate ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Documents Review */}
        <div className="review-section">
          <h4>Documents</h4>
          <div className="review-data">
            <div className="review-item">
              <span className="label">Resume:</span>
              <span className="value">{formatFileInfo(formData.resume)}</span>
            </div>
            <div className="review-item">
              <span className="label">Cover Letter:</span>
              <span className="value">{formatFileInfo(formData.coverLetter)}</span>
            </div>
            <div className="review-item">
              <span className="label">Portfolio:</span>
              <span className="value">{formatFileInfo(formData.portfolio)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN MULTI-STEP FORM COMPONENT
// ============================================================================

function InterviewComplexForm() {
  // Form state management
  const formState = useMultiStepForm();
  const { validateStep } = useFormValidation();
  
  // Additional state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Step components mapping
  const stepComponents = {
    personal: PersonalInformationStep,
    professional: ProfessionalDetailsStep, 
    preferences: JobPreferencesStep,
    documents: DocumentsStep,
    review: ReviewStep
  };

  // Get current step component
  const CurrentStepComponent = stepComponents[formState.currentStep.id];

  // Validate current step before proceeding
  const validateCurrentStep = useCallback(() => {
    const errors = validateStep(formState.currentStep, formState.formData);
    
    if (Object.keys(errors).length > 0) {
      formState.setStepError(formState.currentStep.id, errors);
      return false;
    }
    
    formState.clearStepErrors(formState.currentStep.id);
    return true;
  }, [formState, validateStep]);

  // Handle next step with validation
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      formState.nextStep();
    }
  }, [formState, validateCurrentStep]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate all steps one final time
      let hasErrors = false;
      STEP_ORDER.forEach(step => {
        if (step.id !== 'review') {
          const stepErrors = validateStep(step, formState.formData);
          if (Object.keys(stepErrors).length > 0) {
            formState.setStepError(step.id, stepErrors);
            hasErrors = true;
          }
        }
      });

      if (hasErrors) {
        setSubmitError('Please fix all validation errors before submitting.');
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formState.formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== '') {
          submitData.append(key, value.toString());
        }
      });

      // Simulate API submission
      console.log('Submitting complex form data:');
      for (let [key, value] of submitData.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success
      alert('Application submitted successfully! We will review your application and get back to you soon.');
      
      // Reset form (in real app, might redirect to success page)
      window.location.reload();

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, validateStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Allow Escape to go back (except on first step)
      if (event.key === 'Escape' && !formState.isFirstStep) {
        formState.prevStep();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [formState]);

  return (
    <div className="interview-complex-form">
      <div className="form-header">
        <h1>Job Application</h1>
        <p>Complete all steps to submit your application</p>
        
        {/* Progress indicator */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${formState.stepProgress}%` }}
              role="progressbar"
              aria-valuenow={formState.stepProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="progress-text">
            Step {formState.currentStepIndex + 1} of {formState.totalSteps}
          </span>
        </div>

        {/* Step navigation breadcrumbs */}
        <nav className="step-navigation" aria-label="Form steps">
          <ol className="step-list">
            {STEP_ORDER.map((step, index) => (
              <li 
                key={step.id}
                className={`step-item ${
                  index === formState.currentStepIndex ? 'active' : ''
                } ${
                  formState.visitedSteps.has(index) ? 'visited' : ''
                } ${
                  formState.stepErrors[step.id] ? 'error' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => formState.goToStep(index)}
                  disabled={!formState.visitedSteps.has(index)}
                  aria-current={index === formState.currentStepIndex ? 'step' : undefined}
                >
                  <span className="step-number">{index + 1}</span>
                  <span className="step-title">{step.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Current step content */}
      <main className="form-main">
        <div className="step-header">
          <h2>{formState.currentStep.title}</h2>
          <p>{formState.currentStep.description}</p>
        </div>

        {/* Submit error display */}
        {submitError && (
          <div className="submit-error" role="alert">
            {submitError}
          </div>
        )}

        {/* Step component */}
        <div className="step-container">
          <CurrentStepComponent
            formData={formState.formData}
            updateFieldValue={formState.updateFieldValue}
            errors={formState.stepErrors[formState.currentStep.id] || {}}
          />
        </div>

        {/* Navigation buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={formState.prevStep}
            disabled={formState.isFirstStep}
            className="btn btn-secondary"
          >
            Previous
          </button>

          {formState.isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </main>

      {/* Form persistence indicator */}
      <div className="form-footer">
        <p className="save-indicator">
          ✓ Your progress is automatically saved
        </p>
      </div>
    </div>
  );
}

// Export the main component
export default InterviewComplexForm;

// Export individual components and hooks for testing
export {
  useMultiStepForm,
  useFormValidation,
  PersonalInformationStep,
  ProfessionalDetailsStep,
  JobPreferencesStep,
  DocumentsStep,
  ReviewStep,
  FORM_STEPS
};