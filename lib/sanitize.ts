import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Strip all HTML tags and keep only text content
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeInput(value: string): string {
  if (!value || typeof value !== 'string') return '';

  let sanitized = sanitizeText(value);

  // Remove SQL injection patterns
  sanitized = sanitized.replace(/(%27)|(')|(--)|(;)|(%23)|(#)/gi, '');

  // Remove NoSQL injection patterns
  sanitized = sanitized.replace(/\$\{|\$where|\$ne|\$gt|\$lt|\$regex/gi, '');

  // Remove script-like patterns
  sanitized = sanitized.replace(/<script|<\/script|javascript:|onerror=|onload=/gi, '');

  return sanitized.trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === 'string' ? sanitizeInput(item) : sanitizeObject(item),
    ) as unknown as T;
  }

  const sanitized = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Sanitize the key itself
      const sanitizedKey = sanitizeInput(key);

      // Skip dangerous keys (prototype pollution prevention)
      if (['__proto__', 'constructor', 'prototype'].includes(sanitizedKey)) {
        continue;
      }

      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[sanitizedKey as keyof T] = sanitizeInput(value) as T[keyof T];
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
      } else {
        sanitized[sanitizedKey as keyof T] = value;
      }
    }
  }
  return sanitized;
}

/**
 * Validate and sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';

  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');

  // Limit length
  sanitized = sanitized.substring(0, 255);

  return sanitized.trim();
}

/**
 * Sanitize URL to prevent open redirect attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  // Only allow http, https, and relative URLs
  const urlPattern = /^(https?:\/\/|\/)/i;
  if (!urlPattern.test(url)) {
    return '';
  }

  // Remove javascript: protocol
  if (/javascript:/i.test(url)) {
    return '';
  }

  return url.trim();
}

/**
 * Escape special characters for safe display in HTML
 */
export function escapeHtml(text: string): string {
  if (!text) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}
