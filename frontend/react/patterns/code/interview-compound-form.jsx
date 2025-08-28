/**
 * File: interview-compound-form.jsx
 * Description: Interview question - Create compound form component system
 * Tests compound component architecture, form validation, and flexible composition
 */

import React, { useState, useContext, createContext, Children, cloneElement } from 'react';

// === INTERVIEW QUESTION ===
// Build a compound form component system that:
// 1. Manages form state and validation centrally
// 2. Allows flexible composition of form fields
// 3. Supports different field types with validation
// 4. Provides field groups and conditional rendering
// 5. Handles submission and error states

// === Form Context ===
const FormContext = createContext();
const FieldGroupContext = createContext();

function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
}

function useFieldGroup() {
  return useContext(FieldGroupContext);
}

// === Main Form Component ===
function Form({ 
  children, 
  onSubmit, 
  initialValues = {}, 
  validationSchema = {},
  validateOnChange = true,
  validateOnBlur = true 
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // Validation function
  const validateField = React.useCallback((name, value, schema = validationSchema) => {
    const fieldSchema = schema[name];
    if (!fieldSchema) return '';
    
    for (const rule of fieldSchema) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message || `${name} is required`;
      }
      
      if (rule.minLength && value && value.length < rule.minLength) {
        return rule.message || `${name} must be at least ${rule.minLength} characters`;
      }
      
      if (rule.maxLength && value && value.length > rule.maxLength) {
        return rule.message || `${name} must not exceed ${rule.maxLength} characters`;
      }
      
      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.message || `${name} format is invalid`;
      }
      
      if (rule.validate && value !== undefined && !rule.validate(value, values)) {
        return rule.message || `${name} is invalid`;
      }
      
      if (rule.min && value !== undefined && value < rule.min) {
        return rule.message || `${name} must be at least ${rule.min}`;
      }
      
      if (rule.max && value !== undefined && value > rule.max) {
        return rule.message || `${name} must not exceed ${rule.max}`;
      }
    }
    
    return '';
  }, [validationSchema, values]);
  
  // Validate all fields
  const validateForm = React.useCallback(() => {
    const newErrors = {};
    Object.keys(validationSchema).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationSchema, values, validateField]);
  
  // Set field value
  const setValue = React.useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange && touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, validateOnChange, touched]);
  
  // Set field as touched
  const setTouched = React.useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validateOnBlur) {
      const error = validateField(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, validateOnBlur, values]);
  
  // Reset form
  const resetForm = React.useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitCount(0);
  }, [initialValues]);
  
  // Set field error
  const setFieldError = React.useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  // Handle form submission
  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce(
      (acc, name) => ({ ...acc, [name]: true }), 
      {}
    );
    setTouched(allTouched);
    
    // Validate form
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values, { resetForm, setFieldError });
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, validationSchema, validateForm, onSubmit, resetForm, setFieldError]);
  
  // Form context value
  const contextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    setValue,
    setTouched,
    setFieldError,
    resetForm,
    validateField,
    isValid: Object.keys(errors).length === 0
  };
  
  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className="compound-form">
        {children}
      </form>
    </FormContext.Provider>
  );
}

// === Field Components ===

function Field({ name, label, required, children, className }) {
  const { values, errors, touched } = useForm();
  const fieldGroup = useFieldGroup();
  const fieldName = fieldGroup ? `${fieldGroup.name}.${name}` : name;
  
  const hasError = errors[fieldName] && touched[fieldName];
  
  return (
    <div className={`form-field ${hasError ? 'has-error' : ''} ${className || ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {hasError && (
        <span className="form-error">{errors[fieldName]}</span>
      )}
    </div>
  );
}

function Input({ name, type = 'text', placeholder, disabled, ...props }) {
  const { values, setValue, setTouched } = useForm();
  const fieldGroup = useFieldGroup();
  const fieldName = fieldGroup ? `${fieldGroup.name}.${name}` : name;
  
  return (
    <input
      {...props}
      type={type}
      name={fieldName}
      value={values[fieldName] || ''}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => setValue(fieldName, e.target.value)}
      onBlur={() => setTouched(fieldName)}
      className="form-input"
    />
  );
}

function TextArea({ name, placeholder, rows = 4, disabled, ...props }) {
  const { values, setValue, setTouched } = useForm();
  const fieldGroup = useFieldGroup();
  const fieldName = fieldGroup ? `${fieldGroup.name}.${name}` : name;
  
  return (
    <textarea
      {...props}
      name={fieldName}
      value={values[fieldName] || ''}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      onChange={(e) => setValue(fieldName, e.target.value)}
      onBlur={() => setTouched(fieldName)}
      className="form-textarea"
    />
  );
}

function Select({ name, options = [], placeholder, disabled, ...props }) {
  const { values, setValue, setTouched } = useForm();
  const fieldGroup = useFieldGroup();
  const fieldName = fieldGroup ? `${fieldGroup.name}.${name}` : name;
  
  return (
    <select
      {...props}
      name={fieldName}
      value={values[fieldName] || ''}
      disabled={disabled}
      onChange={(e) => setValue(fieldName, e.target.value)}
      onBlur={() => setTouched(fieldName)}
      className="form-select"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Checkbox({ name, label, disabled, ...props }) {
  const { values, setValue } = useForm();
  const fieldGroup = useFieldGroup();
  const fieldName = fieldGroup ? `${fieldGroup.name}.${name}` : name;
  
  return (
    <label className="form-checkbox">
      <input
        {...props}
        type="checkbox"
        name={fieldName}
        checked={values[fieldName] || false}
        disabled={disabled}
        onChange={(e) => setValue(fieldName, e.target.checked)}
      />
      <span className="checkbox-label">{label}</span>
    </label>
  );
}

function Radio({ name, options = [], disabled, ...props }) {
  const { values, setValue } = useForm();
  const fieldGroup = useFieldGroup();
  const fieldName = fieldGroup ? `${fieldGroup.name}.${name}` : name;
  
  return (
    <div className="form-radio-group">
      {options.map(option => (
        <label key={option.value} className="form-radio">
          <input
            {...props}
            type="radio"
            name={fieldName}
            value={option.value}
            checked={values[fieldName] === option.value}
            disabled={disabled}
            onChange={(e) => setValue(fieldName, e.target.value)}
          />
          <span className="radio-label">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

// === Field Group Component ===
function FieldGroup({ name, children, title, description, condition }) {
  const { values } = useForm();
  
  // Conditional rendering
  if (condition && !condition(values)) {
    return null;
  }
  
  const contextValue = { name };
  
  return (
    <FieldGroupContext.Provider value={contextValue}>
      <div className="form-field-group">
        {title && <h3 className="field-group-title">{title}</h3>}
        {description && <p className="field-group-description">{description}</p>}
        <div className="field-group-content">
          {children}
        </div>
      </div>
    </FieldGroupContext.Provider>
  );
}

// === Form Actions ===
function FormActions({ children, align = 'right' }) {
  return (
    <div className={`form-actions form-actions-${align}`}>
      {children}
    </div>
  );
}

function SubmitButton({ children = 'Submit', disabled, loadingText = 'Submitting...', ...props }) {
  const { isSubmitting, isValid } = useForm();
  
  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || isSubmitting || !isValid}
      className="form-submit-button"
    >
      {isSubmitting ? loadingText : children}
    </button>
  );
}

function ResetButton({ children = 'Reset', ...props }) {
  const { resetForm } = useForm();
  
  return (
    <button
      {...props}
      type="button"
      onClick={resetForm}
      className="form-reset-button"
    >
      {children}
    </button>
  );
}

// === Form Summary ===
function FormSummary() {
  const { values, errors, touched, submitCount } = useForm();
  
  const touchedFields = Object.keys(touched).filter(key => touched[key]);
  const errorCount = Object.keys(errors).filter(key => errors[key]).length;
  
  return (
    <div className="form-summary">
      <h4>Form Status</h4>
      <ul>
        <li>Fields touched: {touchedFields.length}</li>
        <li>Errors: {errorCount}</li>
        <li>Submit attempts: {submitCount}</li>
        <li>Values: {Object.keys(values).length} fields</li>
      </ul>
    </div>
  );
}

// === Attach subcomponents ===
Form.Field = Field;
Form.Input = Input;
Form.TextArea = TextArea;
Form.Select = Select;
Form.Checkbox = Checkbox;
Form.Radio = Radio;
Form.FieldGroup = FieldGroup;
Form.Actions = FormActions;
Form.SubmitButton = SubmitButton;
Form.ResetButton = ResetButton;
Form.Summary = FormSummary;

// === Demo Component ===
function CompoundFormDemo() {
  const handleSubmit = async (values, { resetForm }) => {
    console.log('Form submitted with values:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Form submitted successfully!');
    // resetForm();
  };
  
  const validationSchema = {
    'personal.firstName': [
      { required: true, message: 'First name is required' },
      { minLength: 2, message: 'First name must be at least 2 characters' }
    ],
    'personal.lastName': [
      { required: true, message: 'Last name is required' }
    ],
    'personal.email': [
      { required: true, message: 'Email is required' },
      { pattern: /\S+@\S+\.\S+/, message: 'Email format is invalid' }
    ],
    'personal.age': [
      { required: true, message: 'Age is required' },
      { min: 18, message: 'Must be at least 18 years old' },
      { max: 100, message: 'Must be under 100 years old' }
    ],
    'account.username': [
      { required: true, message: 'Username is required' },
      { minLength: 3, message: 'Username must be at least 3 characters' }
    ],
    'account.password': [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      { pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain uppercase, lowercase, and number' }
    ],
    'preferences.newsletter': [],
    'preferences.notifications': [],
    'preferences.theme': [
      { required: true, message: 'Please select a theme' }
    ]
  };
  
  return (
    <div className="compound-form-demo">
      <h1>Compound Form Component Demo</h1>
      
      <Form
        initialValues={{
          'personal.firstName': '',
          'personal.lastName': '',
          'personal.email': '',
          'personal.age': '',
          'account.username': '',
          'account.password': '',
          'preferences.newsletter': false,
          'preferences.notifications': true,
          'preferences.theme': ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        <Form.FieldGroup 
          name="personal" 
          title="Personal Information"
          description="Please provide your basic personal details"
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Field name="firstName" label="First Name" required>
              <Form.Input name="firstName" placeholder="Enter your first name" />
            </Form.Field>
            
            <Form.Field name="lastName" label="Last Name" required>
              <Form.Input name="lastName" placeholder="Enter your last name" />
            </Form.Field>
          </div>
          
          <Form.Field name="email" label="Email Address" required>
            <Form.Input name="email" type="email" placeholder="Enter your email" />
          </Form.Field>
          
          <Form.Field name="age" label="Age" required>
            <Form.Input name="age" type="number" placeholder="Enter your age" />
          </Form.Field>
        </Form.FieldGroup>
        
        <Form.FieldGroup 
          name="account" 
          title="Account Details"
          description="Create your account credentials"
        >
          <Form.Field name="username" label="Username" required>
            <Form.Input name="username" placeholder="Choose a username" />
          </Form.Field>
          
          <Form.Field name="password" label="Password" required>
            <Form.Input name="password" type="password" placeholder="Create a strong password" />
          </Form.Field>
        </Form.FieldGroup>
        
        <Form.FieldGroup 
          name="preferences" 
          title="Preferences"
          description="Customize your experience"
        >
          <Form.Field name="newsletter">
            <Form.Checkbox name="newsletter" label="Subscribe to newsletter" />
          </Form.Field>
          
          <Form.Field name="notifications">
            <Form.Checkbox name="notifications" label="Enable notifications" />
          </Form.Field>
          
          <Form.Field name="theme" label="Theme" required>
            <Form.Radio 
              name="theme" 
              options={[
                { value: 'light', label: 'Light Theme' },
                { value: 'dark', label: 'Dark Theme' },
                { value: 'auto', label: 'Auto (System)' }
              ]} 
            />
          </Form.Field>
        </Form.FieldGroup>
        
        <Form.Actions>
          <Form.ResetButton>Reset Form</Form.ResetButton>
          <Form.SubmitButton loadingText="Creating Account...">
            Create Account
          </Form.SubmitButton>
        </Form.Actions>
        
        <Form.Summary />
      </Form>
    </div>
  );
}

export default CompoundFormDemo;
export {
  Form,
  Field,
  Input,
  TextArea,
  Select,
  Checkbox,
  Radio,
  FieldGroup,
  FormActions,
  SubmitButton,
  ResetButton,
  FormSummary,
  useForm,
  useFieldGroup
};