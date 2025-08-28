/**
 * File: interview-dynamic-form.jsx
 * Description: Dynamic form builder - common React interview question
 * Tests state management, lists, and component composition
 */

import React, { useState, useCallback } from 'react';

// === Form Field Types ===
const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE: 'date'
};

// === Individual Field Components ===
function TextField({ field, value, onChange, error }) {
  const { id, label, type, placeholder, required, validation } = field;
  
  return (
    <div className="form-field">
      <label htmlFor={id} className={required ? 'required' : ''}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={placeholder}
        required={required}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

function TextAreaField({ field, value, onChange, error }) {
  const { id, label, placeholder, required, rows = 4 } = field;
  
  return (
    <div className="form-field">
      <label htmlFor={id} className={required ? 'required' : ''}>
        {label}
      </label>
      <textarea
        id={id}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

function SelectField({ field, value, onChange, error }) {
  const { id, label, required, options = [] } = field;
  
  return (
    <div className="form-field">
      <label htmlFor={id} className={required ? 'required' : ''}>
        {label}
      </label>
      <select
        id={id}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
        required={required}
        className={error ? 'error' : ''}
      >
        <option value="">Choose an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

function CheckboxField({ field, value, onChange, error }) {
  const { id, label, required } = field;
  
  return (
    <div className="form-field checkbox-field">
      <input
        id={id}
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(id, e.target.checked)}
        required={required}
        className={error ? 'error' : ''}
      />
      <label htmlFor={id} className={required ? 'required' : ''}>
        {label}
      </label>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

function RadioField({ field, value, onChange, error }) {
  const { id, label, required, options = [] } = field;
  
  return (
    <div className="form-field">
      <fieldset>
        <legend className={required ? 'required' : ''}>{label}</legend>
        {options.map((option) => (
          <div key={option.value} className="radio-option">
            <input
              id={`${id}_${option.value}`}
              name={id}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(id, e.target.value)}
              required={required}
            />
            <label htmlFor={`${id}_${option.value}`}>
              {option.label}
            </label>
          </div>
        ))}
      </fieldset>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// === Field Renderer ===
function FormField({ field, value, onChange, error }) {
  switch (field.type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.EMAIL:
    case FIELD_TYPES.PASSWORD:
    case FIELD_TYPES.NUMBER:
    case FIELD_TYPES.DATE:
      return (
        <TextField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    
    case FIELD_TYPES.TEXTAREA:
      return (
        <TextAreaField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    
    case FIELD_TYPES.SELECT:
      return (
        <SelectField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    
    case FIELD_TYPES.CHECKBOX:
      return (
        <CheckboxField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    
    case FIELD_TYPES.RADIO:
      return (
        <RadioField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    
    default:
      return <div>Unknown field type: {field.type}</div>;
  }
}

// === Validation Functions ===
const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return null;
  },
  
  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },
  
  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  }
};

// === Main Dynamic Form Component ===
function DynamicForm({ 
  fields, 
  initialValues = {}, 
  onSubmit, 
  onFieldChange,
  submitText = 'Submit',
  resetText = 'Reset'
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle field value changes
  const handleFieldChange = useCallback((fieldId, value) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
    
    // Callback for external handling
    if (onFieldChange) {
      onFieldChange(fieldId, value);
    }
  }, [errors, onFieldChange]);
  
  // Validate a single field
  const validateField = useCallback((field, value) => {
    const { validation = [] } = field;
    
    // Check required
    if (field.required) {
      const requiredError = validators.required(value);
      if (requiredError) return requiredError;
    }
    
    // Check other validations
    for (const rule of validation) {
      if (typeof rule === 'function') {
        const error = rule(value);
        if (error) return error;
      } else if (typeof rule === 'object') {
        const { type, params, message } = rule;
        if (validators[type]) {
          const validator = params 
            ? validators[type](...params) 
            : validators[type];
          const error = validator(value);
          if (error) return message || error;
        }
      }
    }
    
    return null;
  }, []);
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      const error = validateField(field, values[field.id]);
      if (error) {
        newErrors[field.id] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    return !hasErrors;
  }, [fields, values, validateField]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isValid = validateForm();
      if (isValid && onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form reset
  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
  };
  
  return (
    <form onSubmit={handleSubmit} className="dynamic-form">
      {fields.map(field => (
        <FormField
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={handleFieldChange}
          error={errors[field.id]}
        />
      ))}
      
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
        <button type="button" onClick={handleReset} className="btn-secondary">
          {resetText}
        </button>
      </div>
    </form>
  );
}

// === Form Builder Component ===
function FormBuilder() {
  const [formFields, setFormFields] = useState([]);
  
  const addField = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType} Field`,
      required: false
    };
    
    // Add type-specific properties
    if (fieldType === FIELD_TYPES.SELECT || fieldType === FIELD_TYPES.RADIO) {
      newField.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
    }
    
    setFormFields(prev => [...prev, newField]);
  };
  
  const removeField = (fieldId) => {
    setFormFields(prev => prev.filter(field => field.id !== fieldId));
  };
  
  const updateField = (fieldId, updates) => {
    setFormFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };
  
  return (
    <div className="form-builder">
      <div className="field-types">
        <h3>Add Fields:</h3>
        {Object.values(FIELD_TYPES).map(type => (
          <button
            key={type}
            onClick={() => addField(type)}
            className="add-field-btn"
          >
            Add {type}
          </button>
        ))}
      </div>
      
      <div className="field-list">
        <h3>Form Fields:</h3>
        {formFields.map(field => (
          <div key={field.id} className="field-editor">
            <span>{field.label} ({field.type})</span>
            <button onClick={() => removeField(field.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="form-preview">
        <h3>Form Preview:</h3>
        <DynamicForm
          fields={formFields}
          onSubmit={(values) => {
            console.log('Form submitted:', values);
            alert('Form submitted! Check console.');
          }}
        />
      </div>
    </div>
  );
}

// === Demo Component ===
function DynamicFormDemo() {
  const sampleFields = [
    {
      id: 'firstName',
      type: FIELD_TYPES.TEXT,
      label: 'First Name',
      required: true,
      validation: [
        { type: 'minLength', params: [2], message: 'Name must be at least 2 characters' }
      ]
    },
    {
      id: 'lastName',
      type: FIELD_TYPES.TEXT,
      label: 'Last Name',
      required: true
    },
    {
      id: 'email',
      type: FIELD_TYPES.EMAIL,
      label: 'Email Address',
      required: true,
      validation: [validators.email]
    },
    {
      id: 'age',
      type: FIELD_TYPES.NUMBER,
      label: 'Age',
      required: true
    },
    {
      id: 'bio',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Bio',
      placeholder: 'Tell us about yourself...',
      rows: 3
    },
    {
      id: 'country',
      type: FIELD_TYPES.SELECT,
      label: 'Country',
      required: true,
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'de', label: 'Germany' }
      ]
    },
    {
      id: 'newsletter',
      type: FIELD_TYPES.CHECKBOX,
      label: 'Subscribe to newsletter'
    },
    {
      id: 'experience',
      type: FIELD_TYPES.RADIO,
      label: 'Experience Level',
      required: true,
      options: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
      ]
    }
  ];
  
  return (
    <div className="demo-container">
      <h1>Dynamic Form Demo</h1>
      
      <section>
        <h2>Sample Registration Form</h2>
        <DynamicForm
          fields={sampleFields}
          initialValues={{ newsletter: true }}
          onSubmit={(values) => {
            console.log('Registration data:', values);
            alert('Registration successful!');
          }}
        />
      </section>
      
      <section>
        <h2>Form Builder</h2>
        <FormBuilder />
      </section>
    </div>
  );
}

export default DynamicFormDemo;
export { DynamicForm, FormBuilder, FIELD_TYPES, validators };