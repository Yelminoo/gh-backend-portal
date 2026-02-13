'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { sanitizeInput } from '@/lib/sanitize';

interface SanitizedTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  onChange?: (value: string, rawValue: string) => void;
}

/**
 * Textarea component with automatic sanitization
 */
export const SanitizedTextarea = forwardRef<HTMLTextAreaElement, SanitizedTextareaProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const rawValue = e.target.value;
      const sanitizedValue = sanitizeInput(rawValue);
      onChange?.(sanitizedValue, rawValue);
    };

    return (
      <textarea
        {...props}
        ref={ref}
        onChange={handleChange}
        className={`${props.className || ''}`}
      />
    );
  }
);

SanitizedTextarea.displayName = 'SanitizedTextarea';
