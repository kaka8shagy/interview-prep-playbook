/**
 * File: form-libraries.jsx
 * Description: Integration examples with React Hook Form and Formik libraries
 * 
 * Learning objectives:
 * - Compare vanilla React vs form libraries
 * - Master React Hook Form patterns and performance benefits
 * - Understand Formik approach and when to use it
 * - See schema validation integration (Yup, Zod)
 * - Learn library-specific optimization techniques
 * 
 * Key Concepts:
 * - React Hook Form: uncontrolled approach with minimal re-renders
 * - Formik: controlled approach with comprehensive form state management
 * - Schema validation for complex validation logic
 * - Performance comparisons and trade-offs
 * - Migration strategies between approaches
 */

import React, { useState } from 'react';

// ============================================================================
// REACT HOOK FORM IMPLEMENTATION
// ============================================================================

// Note: In a real project, you would install and import:
// import { useForm, Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';

// Mock React Hook Form implementation for demonstration
// This shows the API patterns without requiring the actual library
const mockUseForm = (options = {}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const register = (name, validation = {}) => ({
    name,
    ref: () => {}, // In real library, this would be a ref callback
    onChange: () => {}, // Mock onChange handler
    onBlur: () => {}, // Mock onBlur handler
  });

  const handleSubmit = (onSubmit) => async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Mock form data extraction
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Mock validation (in real library, this would use the resolver)
    const validationErrors = {};
    
    if (!data.email) validationErrors.email = { message: 'Email is required' };
    if (!data.password) validationErrors.password = { message: 'Password is required' };
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    setErrors({});
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch: () => ({}), // Mock watch function
    setValue: () => {}, // Mock setValue function
    reset: () => {}, // Mock reset function
  };
};

// React Hook Form example with schema validation
function ReactHookFormExample() {
  // Schema definition (in real app, this would use Yup or Zod)
  // const validationSchema = yup.object({
  //   firstName: yup.string().required('First name is required').min(2, 'Too short'),
  //   lastName: yup.string().required('Last name is required').min(2, 'Too short'),
  //   email: yup.string().email('Invalid email').required('Email is required'),
  //   age: yup.number().positive().integer().min(18, 'Must be 18 or older').required(),
  //   password: yup.string().min(8, 'Password too short').required(),
  //   confirmPassword: yup.string()
  //     .oneOf([yup.ref('password')], 'Passwords must match')
  //     .required('Please confirm password'),
  //   terms: yup.boolean().oneOf([true], 'Must accept terms'),
  // });

  // Initialize React Hook Form with schema resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = mockUseForm({
    // resolver: yupResolver(validationSchema), // Schema validation
    mode: 'onBlur', // Validation timing
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      password: '',
      confirmPassword: '',
      terms: false,
    }
  });

  // Watch specific fields for conditional logic
  // React Hook Form only re-renders when watched fields change
  const watchedPassword = watch('password', '');

  // Form submission handler
  const onSubmit = async (data) => {
    // React Hook Form automatically provides clean, typed data
    console.log('React Hook Form submission:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('React Hook Form submitted successfully!');
    
    // Reset form after successful submission
    reset();
  };

  // Conditional field rendering based on watched values
  const showPasswordStrength = watchedPassword.length > 0;

  return (
    <div className="react-hook-form-example">
      <h2>React Hook Form Implementation</h2>
      
      <div className="form-benefits">
        <h3>Benefits of React Hook Form:</h3>
        <ul>
          <li>✅ Minimal re-renders (uncontrolled approach)</li>
          <li>✅ Built-in validation with schema support</li>
          <li>✅ Excellent TypeScript support</li>
          <li>✅ Small bundle size (~25KB)</li>
          <li>✅ Easy integration with UI libraries</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        
        {/* Name fields in a row */}
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              {...register('firstName')} // Register field with validation
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter first name"
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <span className="error-message" role="alert">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              {...register('lastName')}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter last name"
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <span className="error-message" role="alert">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        {/* Email field */}
        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            {...register('email')} // Automatic validation from schema
            className={errors.email ? 'error' : ''}
            placeholder="Enter email address"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <span className="error-message" role="alert">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Age field with number validation */}
        <div className="form-field">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            {...register('age', { 
              valueAsNumber: true // React Hook Form type conversion
            })}
            className={errors.age ? 'error' : ''}
            placeholder="Enter your age"
            min="18"
            aria-invalid={!!errors.age}
          />
          {errors.age && (
            <span className="error-message" role="alert">
              {errors.age.message}
            </span>
          )}
        </div>

        {/* Password field with conditional strength indicator */}
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={errors.password ? 'error' : ''}
            placeholder="Enter password"
            aria-invalid={!!errors.password}
          />
          
          {/* Conditional rendering based on watched field */}
          {showPasswordStrength && (
            <div className="password-strength">
              <div className="strength-indicator">
                <div className={`strength-bar ${getPasswordStrength(watchedPassword)}`} />
              </div>
              <span className="strength-text">
                Password strength: {getPasswordStrength(watchedPassword)}
              </span>
            </div>
          )}
          
          {errors.password && (
            <span className="error-message" role="alert">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Confirm password field */}
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm password"
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <span className="error-message" role="alert">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="form-field checkbox-field">
          <label htmlFor="terms">
            <input
              type="checkbox"
              id="terms"
              {...register('terms')}
              aria-invalid={!!errors.terms}
            />
            I agree to the Terms and Conditions
          </label>
          {errors.terms && (
            <span className="error-message" role="alert">
              {errors.terms.message}
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

      {/* Performance indicator */}
      <div className="performance-info">
        <p><strong>Performance Note:</strong> This form only re-renders when validation errors change or when watched fields update. Input changes don't trigger re-renders.</p>
      </div>
    </div>
  );
}

// ============================================================================
// FORMIK IMPLEMENTATION
// ============================================================================

// Mock Formik implementation for demonstration
// In real projects: import { Formik, Form, Field, ErrorMessage } from 'formik';
const mockFormik = ({ initialValues, validationSchema, onSubmit, children }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Mock validation
    const validationErrors = {};
    if (!values.email) validationErrors.email = 'Email is required';
    if (!values.password) validationErrors.password = 'Password is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    
    await onSubmit(values);
    setIsSubmitting(false);
  };

  const formikBag = {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue: (name, value) => setValues(prev => ({ ...prev, [name]: value })),
    setFieldError: (name, error) => setErrors(prev => ({ ...prev, [name]: error })),
  };

  return children(formikBag);
};

// Formik example with comprehensive form handling
function FormikExample() {
  // Initial form values
  const initialValues = {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
    },
    preferences: {
      newsletter: false,
      notifications: 'email',
    },
    address: {
      street: '',
      city: '',
      zipCode: '',
      country: 'US',
    }
  };

  // Validation schema (in real app, this would be Yup schema)
  // const validationSchema = yup.object({
  //   personalInfo: yup.object({
  //     firstName: yup.string().required('First name is required'),
  //     lastName: yup.string().required('Last name is required'),
  //     email: yup.string().email('Invalid email').required('Email is required'),
  //   }),
  //   address: yup.object({
  //     street: yup.string().required('Street is required'),
  //     city: yup.string().required('City is required'),
  //     zipCode: yup.string().matches(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  //   })
  // });

  // Form submission handler
  const handleSubmit = async (values) => {
    console.log('Formik submission:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('Formik form submitted successfully!');
  };

  return (
    <div className="formik-example">
      <h2>Formik Implementation</h2>
      
      <div className="form-benefits">
        <h3>Benefits of Formik:</h3>
        <ul>
          <li>✅ Comprehensive form state management</li>
          <li>✅ Flexible validation approaches</li>
          <li>✅ Rich ecosystem and community</li>
          <li>✅ Great for complex nested forms</li>
          <li>✅ Detailed control over form lifecycle</li>
        </ul>
      </div>

      {/* Mock Formik component */}
      {mockFormik({
        initialValues,
        // validationSchema,
        onSubmit: handleSubmit,
        children: (formik) => (
          <form onSubmit={formik.handleSubmit} noValidate>
            
            {/* Personal Information Section */}
            <fieldset>
              <legend>Personal Information</legend>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="personalInfo.firstName">First Name</label>
                  <input
                    type="text"
                    id="personalInfo.firstName"
                    name="personalInfo.firstName"
                    value={formik.values.personalInfo?.firstName || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.errors.personalInfo?.firstName && 
                              formik.touched.personalInfo?.firstName ? 'error' : ''}
                    placeholder="Enter first name"
                  />
                  {formik.errors.personalInfo?.firstName && 
                   formik.touched.personalInfo?.firstName && (
                    <span className="error-message" role="alert">
                      {formik.errors.personalInfo.firstName}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="personalInfo.lastName">Last Name</label>
                  <input
                    type="text"
                    id="personalInfo.lastName"
                    name="personalInfo.lastName"
                    value={formik.values.personalInfo?.lastName || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.errors.personalInfo?.lastName && 
                              formik.touched.personalInfo?.lastName ? 'error' : ''}
                    placeholder="Enter last name"
                  />
                  {formik.errors.personalInfo?.lastName && 
                   formik.touched.personalInfo?.lastName && (
                    <span className="error-message" role="alert">
                      {formik.errors.personalInfo.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="personalInfo.email">Email Address</label>
                <input
                  type="email"
                  id="personalInfo.email"
                  name="personalInfo.email"
                  value={formik.values.personalInfo?.email || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.errors.personalInfo?.email && 
                            formik.touched.personalInfo?.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
                {formik.errors.personalInfo?.email && 
                 formik.touched.personalInfo?.email && (
                  <span className="error-message" role="alert">
                    {formik.errors.personalInfo.email}
                  </span>
                )}
              </div>
            </fieldset>

            {/* Address Section */}
            <fieldset>
              <legend>Address</legend>
              
              <div className="form-field">
                <label htmlFor="address.street">Street Address</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formik.values.address?.street || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter street address"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="address.city">City</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formik.values.address?.city || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter city"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="address.zipCode">ZIP Code</label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formik.values.address?.zipCode || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="12345"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="address.country">Country</label>
                  <select
                    id="address.country"
                    name="address.country"
                    value={formik.values.address?.country || 'US'}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Preferences Section */}
            <fieldset>
              <legend>Preferences</legend>
              
              <div className="form-field checkbox-field">
                <label htmlFor="preferences.newsletter">
                  <input
                    type="checkbox"
                    id="preferences.newsletter"
                    name="preferences.newsletter"
                    checked={formik.values.preferences?.newsletter || false}
                    onChange={formik.handleChange}
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
                        name="preferences.notifications"
                        value={option}
                        checked={formik.values.preferences?.notifications === option}
                        onChange={formik.handleChange}
                      />
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Submit button */}
            <button 
              type="submit" 
              disabled={formik.isSubmitting}
              className="submit-button"
            >
              {formik.isSubmitting ? 'Saving Profile...' : 'Save Profile'}
            </button>

            {/* Debug information */}
            <details className="debug-section">
              <summary>Formik State Debug</summary>
              <div className="debug-info">
                <h4>Values:</h4>
                <pre>{JSON.stringify(formik.values, null, 2)}</pre>
                <h4>Errors:</h4>
                <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
                <h4>Touched:</h4>
                <pre>{JSON.stringify(formik.touched, null, 2)}</pre>
              </div>
            </details>
          </form>
        )
      })}
    </div>
  );
}

// ============================================================================
// COMPARISON AND MIGRATION STRATEGIES
// ============================================================================

function LibraryComparison() {
  return (
    <div className="library-comparison">
      <h2>Form Library Comparison</h2>
      
      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>React Hook Form</th>
              <th>Formik</th>
              <th>Vanilla React</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bundle Size</td>
              <td>~25KB</td>
              <td>~33KB</td>
              <td>0KB (built-in)</td>
            </tr>
            <tr>
              <td>Re-renders</td>
              <td>Minimal (uncontrolled)</td>
              <td>More frequent (controlled)</td>
              <td>Depends on implementation</td>
            </tr>
            <tr>
              <td>Learning Curve</td>
              <td>Medium</td>
              <td>Steep</td>
              <td>Low</td>
            </tr>
            <tr>
              <td>TypeScript Support</td>
              <td>Excellent</td>
              <td>Good</td>
              <td>Depends on implementation</td>
            </tr>
            <tr>
              <td>Validation</td>
              <td>Schema-first (Yup/Zod)</td>
              <td>Flexible (Yup integration)</td>
              <td>Custom implementation</td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>Excellent</td>
              <td>Good</td>
              <td>Depends on implementation</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="decision-guide">
        <h3>When to Choose Each Approach</h3>
        
        <div className="choice-guide">
          <div className="choice-option">
            <h4>Choose React Hook Form when:</h4>
            <ul>
              <li>Performance is critical</li>
              <li>You want minimal re-renders</li>
              <li>Using TypeScript</li>
              <li>Schema validation is preferred</li>
              <li>Team is comfortable with uncontrolled components</li>
            </ul>
          </div>

          <div className="choice-option">
            <h4>Choose Formik when:</h4>
            <ul>
              <li>Complex form state management needed</li>
              <li>Team prefers controlled components</li>
              <li>Need detailed form lifecycle control</li>
              <li>Existing codebase uses Formik patterns</li>
              <li>Custom validation requirements</li>
            </ul>
          </div>

          <div className="choice-option">
            <h4>Choose Vanilla React when:</h4>
            <ul>
              <li>Simple forms with basic validation</li>
              <li>Bundle size is extremely important</li>
              <li>Learning/educational purposes</li>
              <li>Unique requirements not covered by libraries</li>
              <li>Full control over implementation needed</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="migration-strategies">
        <h3>Migration Strategies</h3>
        
        <div className="migration-guide">
          <h4>From Vanilla React to React Hook Form:</h4>
          <ol>
            <li>Install React Hook Form and validation library (Yup/Zod)</li>
            <li>Replace useState with useForm hook</li>
            <li>Update input props to use register()</li>
            <li>Move validation logic to schema</li>
            <li>Update submit handler to use handleSubmit</li>
          </ol>

          <h4>From Formik to React Hook Form:</h4>
          <ol>
            <li>Identify current validation schema (likely Yup)</li>
            <li>Replace Formik with useForm hook</li>
            <li>Update form JSX to use register() instead of Field components</li>
            <li>Migrate validation schema to resolver</li>
            <li>Update submit handling and error display</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Helper function for password strength indicator
function getPasswordStrength(password) {
  if (password.length < 6) return 'weak';
  if (password.length < 10) return 'medium';
  if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    return 'strong';
  }
  return 'medium';
}

// Main demo component
export default function FormLibrariesDemo() {
  const [activeDemo, setActiveDemo] = useState('rhf');

  const demos = {
    rhf: { component: ReactHookFormExample, title: 'React Hook Form' },
    formik: { component: FormikExample, title: 'Formik' },
    comparison: { component: LibraryComparison, title: 'Library Comparison' }
  };

  const ActiveComponent = demos[activeDemo].component;

  return (
    <div className="form-libraries-demo">
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

// Export individual components for testing and reuse
export {
  ReactHookFormExample,
  FormikExample,
  LibraryComparison
};