import { useState, useCallback } from 'react';
import { sanitizeInput } from '@/lib/sanitize';

/**
 * Custom hook for sanitized input management
 */
export function useSanitizedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [rawValue, setRawValue] = useState(initialValue);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const raw = e.target.value;
    setRawValue(raw);
    setValue(sanitizeInput(raw));
  }, []);

  const reset = useCallback(() => {
    setValue('');
    setRawValue('');
  }, []);

  return {
    value,
    rawValue,
    handleChange,
    reset,
    setValue: (newValue: string) => {
      setRawValue(newValue);
      setValue(sanitizeInput(newValue));
    },
  };
}
