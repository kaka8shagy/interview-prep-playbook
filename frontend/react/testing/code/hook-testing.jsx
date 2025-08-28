/**
 * File: hook-testing.jsx
 * Description: Custom React hook testing patterns using renderHook
 * Tests understanding of hook testing strategies and common patterns
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';

// === Custom Hooks to Test ===

// Basic state hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(prev => prev + 1), []);
  const decrement = useCallback(() => setCount(prev => prev - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const setValue = useCallback((value) => setCount(value), []);
  
  return {
    count,
    increment,
    decrement,
    reset,
    setValue,
    isPositive: count > 0,
    isNegative: count < 0,
    isZero: count === 0
  };
}

// Effect-based hook
function useDocumentTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

// Async data fetching hook
function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();
  
  const fetchData = useCallback(async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options]);
  
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);
  
  return { data, loading, error, refetch };
}

// Local storage hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
}

// Toggle hook with multiple states
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse }];
}

// Debounced value hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Previous value hook
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// Interval hook
function useInterval(callback, delay) {
  const savedCallback = useRef();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Form hook with validation
function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';
    
    for (const rule of rules) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        return rule.message || `${name} is required`;
      }
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${name} must be at least ${rule.minLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message || `${name} format is invalid`;
      }
    }
    return '';
  }, [validationRules]);
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);
  
  const setTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);
  
  const validateAll = useCallback(() => {
    const newErrors = {};
    const newTouched = {};
    
    Object.keys(initialValues).forEach(name => {
      newTouched[name] = true;
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [initialValues, values, validateField]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key]);
  }, [errors]);
  
  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    validateAll,
    reset
  };
}

// Reducer-based hook
function useCounterWithHistory(initialValue = 0) {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'increment':
        return {
          ...state,
          count: state.count + 1,
          history: [...state.history, state.count + 1]
        };
      case 'decrement':
        return {
          ...state,
          count: state.count - 1,
          history: [...state.history, state.count - 1]
        };
      case 'reset':
        return {
          count: initialValue,
          history: [initialValue]
        };
      default:
        return state;
    }
  }, { count: initialValue, history: [initialValue] });
  
  const increment = useCallback(() => dispatch({ type: 'increment' }), []);
  const decrement = useCallback(() => dispatch({ type: 'decrement' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  
  return {
    count: state.count,
    history: state.history,
    increment,
    decrement,
    reset
  };
}

// === HOOK TESTS ===

describe('Custom Hook Testing', () => {
  describe('useCounter', () => {
    test('initializes with default value', () => {
      const { result } = renderHook(() => useCounter());
      
      expect(result.current.count).toBe(0);
      expect(result.current.isZero).toBe(true);
      expect(result.current.isPositive).toBe(false);
      expect(result.current.isNegative).toBe(false);
    });
    
    test('initializes with custom value', () => {
      const { result } = renderHook(() => useCounter(10));
      
      expect(result.current.count).toBe(10);
      expect(result.current.isPositive).toBe(true);
    });
    
    test('increments count', () => {
      const { result } = renderHook(() => useCounter(5));
      
      act(() => {
        result.current.increment();
      });
      
      expect(result.current.count).toBe(6);
      expect(result.current.isPositive).toBe(true);
    });
    
    test('decrements count', () => {
      const { result } = renderHook(() => useCounter(5));
      
      act(() => {
        result.current.decrement();
      });
      
      expect(result.current.count).toBe(4);
    });
    
    test('resets to initial value', () => {
      const { result } = renderHook(() => useCounter(5));
      
      act(() => {
        result.current.increment();
        result.current.increment();
      });
      
      expect(result.current.count).toBe(7);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.count).toBe(5);
    });
    
    test('sets specific value', () => {
      const { result } = renderHook(() => useCounter());
      
      act(() => {
        result.current.setValue(100);
      });
      
      expect(result.current.count).toBe(100);
    });
    
    test('computed properties update correctly', () => {
      const { result } = renderHook(() => useCounter());
      
      // Start at 0
      expect(result.current.isZero).toBe(true);
      expect(result.current.isPositive).toBe(false);
      expect(result.current.isNegative).toBe(false);
      
      // Go positive
      act(() => {
        result.current.increment();
      });
      
      expect(result.current.isZero).toBe(false);
      expect(result.current.isPositive).toBe(true);
      expect(result.current.isNegative).toBe(false);
      
      // Go negative
      act(() => {
        result.current.setValue(-5);
      });
      
      expect(result.current.isZero).toBe(false);
      expect(result.current.isPositive).toBe(false);
      expect(result.current.isNegative).toBe(true);
    });
  });
  
  describe('useDocumentTitle', () => {
    test('sets document title', () => {
      const originalTitle = document.title;
      
      renderHook(() => useDocumentTitle('Test Title'));
      
      expect(document.title).toBe('Test Title');
      
      // Cleanup
      document.title = originalTitle;
    });
    
    test('updates document title when prop changes', () => {
      const originalTitle = document.title;
      
      const { rerender } = renderHook(
        ({ title }) => useDocumentTitle(title),
        { initialProps: { title: 'Initial Title' } }
      );
      
      expect(document.title).toBe('Initial Title');
      
      rerender({ title: 'Updated Title' });
      
      expect(document.title).toBe('Updated Title');
      
      // Cleanup
      document.title = originalTitle;
    });
    
    test('restores previous title on unmount', () => {
      const originalTitle = document.title;
      
      const { unmount } = renderHook(() => useDocumentTitle('Test Title'));
      
      expect(document.title).toBe('Test Title');
      
      unmount();
      
      expect(document.title).toBe(originalTitle);
    });
  });
  
  describe('useApi', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    test('initial state', () => {
      const { result } = renderHook(() => useApi('/api/data'));
      
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });
    
    test('successful fetch', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const { result } = renderHook(() => useApi('/api/data'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/data', { signal: expect.any(AbortSignal) });
    });
    
    test('failed fetch', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      });
      
      const { result } = renderHook(() => useApi('/api/data'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('HTTP Error: 404');
    });
    
    test('refetch functionality', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });
      
      const { result } = renderHook(() => useApi('/api/data'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      act(() => {
        result.current.refetch();
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
    
    test('URL change triggers new fetch', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });
      
      const { rerender } = renderHook(
        ({ url }) => useApi(url),
        { initialProps: { url: '/api/data1' } }
      );
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/data1', expect.any(Object));
      });
      
      rerender({ url: '/api/data2' });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/data2', expect.any(Object));
      });
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('useLocalStorage', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      global.localStorage = localStorageMock;
    });
    
    test('initializes with value from localStorage', () => {
      global.localStorage.getItem.mockReturnValue(JSON.stringify('stored value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default value'));
      
      expect(result.current[0]).toBe('stored value');
      expect(global.localStorage.getItem).toHaveBeenCalledWith('test-key');
    });
    
    test('initializes with default value when localStorage is empty', () => {
      global.localStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default value'));
      
      expect(result.current[0]).toBe('default value');
    });
    
    test('sets value in localStorage', () => {
      global.localStorage.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      act(() => {
        result.current[1]('new value');
      });
      
      expect(result.current[0]).toBe('new value');
      expect(global.localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new value'));
    });
    
    test('removes value from localStorage', () => {
      global.localStorage.getItem.mockReturnValue(JSON.stringify('stored value'));
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      act(() => {
        result.current[2](); // removeValue
      });
      
      expect(result.current[0]).toBe('default');
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
    
    test('handles localStorage errors gracefully', () => {
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      
      expect(result.current[0]).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('useToggle', () => {
    test('initializes with false by default', () => {
      const { result } = renderHook(() => useToggle());
      
      expect(result.current[0]).toBe(false);
    });
    
    test('initializes with custom value', () => {
      const { result } = renderHook(() => useToggle(true));
      
      expect(result.current[0]).toBe(true);
    });
    
    test('toggles value', () => {
      const { result } = renderHook(() => useToggle());
      
      act(() => {
        result.current[1].toggle();
      });
      
      expect(result.current[0]).toBe(true);
      
      act(() => {
        result.current[1].toggle();
      });
      
      expect(result.current[0]).toBe(false);
    });
    
    test('sets true explicitly', () => {
      const { result } = renderHook(() => useToggle(false));
      
      act(() => {
        result.current[1].setTrue();
      });
      
      expect(result.current[0]).toBe(true);
    });
    
    test('sets false explicitly', () => {
      const { result } = renderHook(() => useToggle(true));
      
      act(() => {
        result.current[1].setFalse();
      });
      
      expect(result.current[0]).toBe(false);
    });
  });
  
  describe('useDebounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    test('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));
      
      expect(result.current).toBe('initial');
    });
    
    test('debounces value changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );
      
      expect(result.current).toBe('initial');
      
      // Change value
      rerender({ value: 'updated', delay: 500 });
      
      // Value should not change immediately
      expect(result.current).toBe('initial');
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Now the value should be updated
      expect(result.current).toBe('updated');
    });
    
    test('cancels previous timeout on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );
      
      // Rapid changes
      rerender({ value: 'change1' });
      act(() => { jest.advanceTimersByTime(200); });
      
      rerender({ value: 'change2' });
      act(() => { jest.advanceTimersByTime(200); });
      
      rerender({ value: 'final' });
      act(() => { jest.advanceTimersByTime(500); });
      
      expect(result.current).toBe('final');
    });
  });
  
  describe('usePrevious', () => {
    test('returns undefined on first render', () => {
      const { result } = renderHook(() => usePrevious('current'));
      
      expect(result.current).toBeUndefined();
    });
    
    test('returns previous value after update', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'initial' } }
      );
      
      expect(result.current).toBeUndefined();
      
      rerender({ value: 'updated' });
      
      expect(result.current).toBe('initial');
      
      rerender({ value: 'final' });
      
      expect(result.current).toBe('updated');
    });
  });
  
  describe('useForm', () => {
    test('initializes with default values', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useForm(initialValues));
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isValid).toBe(true);
    });
    
    test('sets field values', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useForm(initialValues));
      
      act(() => {
        result.current.setValue('name', 'John Doe');
      });
      
      expect(result.current.values.name).toBe('John Doe');
    });
    
    test('validates fields on touch', () => {
      const initialValues = { email: '' };
      const validationRules = {
        email: [
          { required: true, message: 'Email is required' },
          { pattern: /\S+@\S+\.\S+/, message: 'Email format is invalid' }
        ]
      };
      
      const { result } = renderHook(() => useForm(initialValues, validationRules));
      
      act(() => {
        result.current.setTouched('email');
      });
      
      expect(result.current.errors.email).toBe('Email is required');
      expect(result.current.isValid).toBe(false);
      
      act(() => {
        result.current.setValue('email', 'invalid-email');
      });
      
      expect(result.current.errors.email).toBe('Email format is invalid');
      
      act(() => {
        result.current.setValue('email', 'valid@email.com');
      });
      
      expect(result.current.errors.email).toBe('');
      expect(result.current.isValid).toBe(true);
    });
    
    test('validates all fields', () => {
      const initialValues = { name: '', email: '' };
      const validationRules = {
        name: [{ required: true, message: 'Name is required' }],
        email: [{ required: true, message: 'Email is required' }]
      };
      
      const { result } = renderHook(() => useForm(initialValues, validationRules));
      
      act(() => {
        const isValid = result.current.validateAll();
        expect(isValid).toBe(false);
      });
      
      expect(result.current.errors).toEqual({
        name: 'Name is required',
        email: 'Email is required'
      });
      expect(result.current.touched).toEqual({
        name: true,
        email: true
      });
    });
    
    test('resets form', () => {
      const initialValues = { name: '', email: '' };
      const { result } = renderHook(() => useForm(initialValues));
      
      act(() => {
        result.current.setValue('name', 'John');
        result.current.setTouched('name');
      });
      
      expect(result.current.values.name).toBe('John');
      expect(result.current.touched.name).toBe(true);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.values).toEqual(initialValues);
      expect(result.current.touched).toEqual({});
      expect(result.current.errors).toEqual({});
    });
  });
  
  describe('useCounterWithHistory', () => {
    test('tracks count history', () => {
      const { result } = renderHook(() => useCounterWithHistory(5));
      
      expect(result.current.count).toBe(5);
      expect(result.current.history).toEqual([5]);
      
      act(() => {
        result.current.increment();
      });
      
      expect(result.current.count).toBe(6);
      expect(result.current.history).toEqual([5, 6]);
      
      act(() => {
        result.current.decrement();
      });
      
      expect(result.current.count).toBe(5);
      expect(result.current.history).toEqual([5, 6, 5]);
    });
    
    test('resets count and history', () => {
      const { result } = renderHook(() => useCounterWithHistory(0));
      
      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.decrement();
      });
      
      expect(result.current.history).toEqual([0, 1, 2, 1]);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.count).toBe(0);
      expect(result.current.history).toEqual([0]);
    });
  });
});

export {
  useCounter,
  useDocumentTitle,
  useApi,
  useLocalStorage,
  useToggle,
  useDebounce,
  usePrevious,
  useInterval,
  useForm,
  useCounterWithHistory
};