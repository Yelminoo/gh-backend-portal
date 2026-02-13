'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { sanitizeInput } from '@/lib/sanitize';

interface SanitizedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string, rawValue: string) => void;
}

/**
 * Input component with automatic sanitization
 */
export const SanitizedInput = forwardRef<HTMLInputElement, SanitizedInputProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const sanitizedValue = sanitizeInput(rawValue);
      onChange?.(sanitizedValue, rawValue);
    };

    return (
      <input
        {...props}
        ref={ref}
        onChange={handleChange}
        className={`${props.className || ''}`}
      />
    );
  }
);

SanitizedInput.displayName = 'SanitizedInput';
