import DOMPurify from 'isomorphic-dompurify';

// Input validation functions
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const cleanPhone = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
  },

  name: (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2 && name.trim().length <= 50;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  timezone: (timezone: string): boolean => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  },

  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.some(type => file.type.startsWith(type));
  },

  fileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
};

// Input sanitization functions
export const sanitizers = {
  html: (input: string): string => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  text: (input: string): string => {
    return input
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove angle brackets
      .substring(0, 1000); // Limit length
  },

  name: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 50);
  },

  email: (input: string): string => {
    return input.toLowerCase().trim();
  },

  phone: (input: string): string => {
    return input.trim().replace(/[^\d\+\-\(\)\s]/g, '');
  },

  url: (input: string): string => {
    return input.trim().toLowerCase();
  },

  fileName: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
      .substring(0, 100);
  },

  bio: (input: string): string => {
    return input
      .trim()
      .replace(/<[^>]*>/g, '')
      .substring(0, 500);
  }
};

// XSS protection utilities
export const xssProtection = {
  escapeHtml: (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  sanitizeForAttribute: (input: string): string => {
    return input.replace(/['"<>&]/g, '');
  },

  sanitizeForUrl: (input: string): string => {
    return encodeURIComponent(input);
  }
};

// CSRF protection utilities
export const csrfProtection = {
  generateToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  validateToken: (token: string, expectedToken: string): boolean => {
    if (!token || !expectedToken) return false;
    return token === expectedToken;
  }
};

// Rate limiting utilities (client-side)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Content Security Policy helpers
export const cspHelpers = {
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  isValidImageUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:', 'data:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
};

// Secure storage utilities
export const secureStorage = {
  setItem: (key: string, value: string, encrypt: boolean = false): void => {
    try {
      const data = encrypt ? btoa(value) : value;
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  getItem: (key: string, decrypt: boolean = false): string | null => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return decrypt ? atob(data) : data;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data securely:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage securely:', error);
    }
  }
};

// Password strength checker
export const passwordStrength = {
  check: (password: string): {
    score: number;
    feedback: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
  } => {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common patterns
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeating characters');

    if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
    else feedback.push('Avoid common patterns');

    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 3) strength = 'weak';
    else if (score < 5) strength = 'fair';
    else if (score < 7) strength = 'good';
    else strength = 'strong';

    return { score, feedback, strength };
  }
};

// Data validation schemas (using Zod-like pattern)
export const schemas = {
  userProfile: {
    name: (value: string) => validators.name(value),
    email: (value: string) => validators.email(value),
    phone: (value: string) => !value || validators.phone(value),
    bio: (value: string) => !value || value.length <= 500,
    timezone: (value: string) => !value || validators.timezone(value)
  },

  userPreferences: {
    theme: (value: string) => ['dark', 'light', 'system'].includes(value),
    language: (value: string) => /^[a-z]{2}(-[A-Z]{2})?$/.test(value),
    fontSize: (value: string) => ['small', 'medium', 'large', 'extra-large'].includes(value)
  }
};

// Error messages
export const errorMessages = {
  INVALID_EMAIL: 'Please enter a valid email address',
  WEAK_PASSWORD: 'Password is too weak. Please follow the requirements.',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_NAME: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'File type is not supported',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};
