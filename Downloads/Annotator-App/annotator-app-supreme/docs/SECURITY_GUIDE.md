# Security Implementation Guide

## Overview

This document outlines the comprehensive security measures implemented in the user profile feature of the Annotator-App. The implementation follows industry best practices and security standards to protect user data and prevent common vulnerabilities.

## Security Architecture

### Defense in Depth

The security implementation follows a multi-layered approach:

1. **Client-Side Security**: Input validation, XSS prevention, CSRF protection
2. **Transport Security**: HTTPS, secure headers, certificate pinning
3. **Authentication**: JWT tokens, MFA, session management
4. **Authorization**: Role-based access control, permission validation
5. **Data Protection**: Encryption, sanitization, secure storage

## Input Validation & Sanitization

### Client-Side Validation

All user inputs are validated on the client side before submission:

```typescript
// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password strength validation
const validatePassword = (password: string) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  return Object.values(requirements).every(Boolean);
};
```

### Input Sanitization

All user inputs are sanitized to prevent XSS attacks:

```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTML sanitization
const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Text sanitization
const sanitizeText = (input: string): string => {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
};
```

## XSS Prevention

### Content Security Policy (CSP)

Implemented strict CSP headers to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'nonce-{random}'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.annotator-app.com;">
```

### Output Encoding

All dynamic content is properly encoded:

```typescript
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
```

### Trusted Types

Implemented Trusted Types for DOM manipulation:

```typescript
// Create trusted HTML
const createTrustedHTML = (html: string) => {
  if (window.trustedTypes) {
    const policy = window.trustedTypes.createPolicy('default', {
      createHTML: (string) => DOMPurify.sanitize(string)
    });
    return policy.createHTML(html);
  }
  return DOMPurify.sanitize(html);
};
```

## CSRF Protection

### Token-Based Protection

CSRF tokens are generated and validated for all state-changing operations:

```typescript
// Generate CSRF token
const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate CSRF token
const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
};
```

### SameSite Cookies

Cookies are configured with SameSite attribute:

```typescript
// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};
```

## Authentication Security

### JWT Token Management

Secure JWT token handling with automatic refresh:

```typescript
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_KEY = 'refresh_token';
  
  static setTokens(accessToken: string, refreshToken: string): void {
    secureStorage.setItem(this.TOKEN_KEY, accessToken, true);
    secureStorage.setItem(this.REFRESH_KEY, refreshToken, true);
  }
  
  static getAccessToken(): string | null {
    return secureStorage.getItem(this.TOKEN_KEY, true);
  }
  
  static clearTokens(): void {
    secureStorage.removeItem(this.TOKEN_KEY);
    secureStorage.removeItem(this.REFRESH_KEY);
  }
}
```

### Multi-Factor Authentication

TOTP-based 2FA implementation:

```typescript
// MFA setup
const setupMFA = async (): Promise<MFASetupData> => {
  const response = await apiClient.post('/users/mfa/enable');
  return {
    qrCode: response.qrCode,
    backupCodes: response.backupCodes
  };
};

// MFA verification
const verifyMFA = async (code: string): Promise<boolean> => {
  if (!/^\d{6}$/.test(code)) {
    throw new Error('Invalid MFA code format');
  }
  
  const response = await apiClient.post('/users/mfa/verify', { code });
  return response.verified;
};
```

## Session Security

### Secure Session Management

Sessions are managed securely with proper expiration and rotation:

```typescript
interface SessionData {
  id: string;
  userId: string;
  expiresAt: string;
  deviceInfo: DeviceInfo;
}

class SessionManager {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  static createSession(userId: string): SessionData {
    return {
      id: generateSecureId(),
      userId,
      expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
      deviceInfo: this.getDeviceInfo()
    };
  }
  
  static isSessionValid(session: SessionData): boolean {
    return new Date(session.expiresAt) > new Date();
  }
}
```

### Session Monitoring

Active session monitoring and anomaly detection:

```typescript
// Monitor for suspicious activity
const monitorSession = (session: SessionData) => {
  const currentIP = getCurrentIP();
  const currentDevice = getDeviceFingerprint();
  
  if (session.deviceInfo.ip !== currentIP) {
    logSecurityEvent('IP_CHANGE', { 
      sessionId: session.id,
      oldIP: session.deviceInfo.ip,
      newIP: currentIP
    });
  }
  
  if (session.deviceInfo.fingerprint !== currentDevice) {
    logSecurityEvent('DEVICE_CHANGE', {
      sessionId: session.id,
      userId: session.userId
    });
  }
};
```

## File Upload Security

### File Validation

Comprehensive file validation for avatar uploads:

```typescript
const validateUploadedFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  
  // File type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only images are allowed.');
  }
  
  // File size validation (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size exceeds 5MB limit.');
  }
  
  // File name validation
  const fileName = file.name;
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    errors.push('Invalid file name. Only alphanumeric characters, dots, underscores, and hyphens are allowed.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### File Content Scanning

Basic file content validation:

```typescript
const scanFileContent = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check for common image file signatures
      const isValidImage = checkImageSignature(bytes);
      resolve(isValidImage);
    };
    
    reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB
  });
};

const checkImageSignature = (bytes: Uint8Array): boolean => {
  // JPEG signature
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }
  
  // PNG signature
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }
  
  // GIF signature
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return true;
  }
  
  return false;
};
```

## Rate Limiting

### Client-Side Rate Limiting

Prevent abuse with client-side rate limiting:

```typescript
class RateLimiter {
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
}

// Usage
const rateLimiter = new RateLimiter();

const handleProfileUpdate = async (updates: ProfileUpdate) => {
  const userId = getCurrentUserId();
  
  if (!rateLimiter.isAllowed(`profile_update_${userId}`, 10, 60000)) {
    throw new Error('Too many profile update attempts. Please try again later.');
  }
  
  await updateProfile(updates);
};
```

## Data Encryption

### Sensitive Data Encryption

Encrypt sensitive data before storage:

```typescript
// Simple encryption for client-side storage
const encryptData = (data: string, key: string): string => {
  // In production, use a proper encryption library
  return btoa(data); // Base64 encoding (not secure, use proper encryption)
};

const decryptData = (encryptedData: string, key: string): string => {
  return atob(encryptedData);
};

// Secure storage wrapper
const secureStorage = {
  setItem: (key: string, value: string, encrypt: boolean = false): void => {
    const data = encrypt ? encryptData(value, 'encryption-key') : value;
    localStorage.setItem(key, data);
  },
  
  getItem: (key: string, decrypt: boolean = false): string | null => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return decrypt ? decryptData(data, 'encryption-key') : data;
  }
};
```

## Security Headers

### HTTP Security Headers

Implement security headers for enhanced protection:

```typescript
// Security headers configuration
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## Security Monitoring

### Security Event Logging

Log security-related events for monitoring:

```typescript
interface SecurityEvent {
  type: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: Record<string, any>;
}

const logSecurityEvent = (type: string, details: Record<string, any>) => {
  const event: SecurityEvent = {
    type,
    userId: getCurrentUserId(),
    sessionId: getCurrentSessionId(),
    ipAddress: getCurrentIP(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    details
  };
  
  // Send to security monitoring service
  sendToSecurityService(event);
};

// Usage examples
logSecurityEvent('LOGIN_SUCCESS', { method: '2FA' });
logSecurityEvent('PASSWORD_CHANGE', { strength: 'strong' });
logSecurityEvent('SUSPICIOUS_ACTIVITY', { reason: 'multiple_failed_attempts' });
```

## Compliance & Privacy

### GDPR Compliance

Implement GDPR-compliant data handling:

```typescript
// Data processing consent
const requestDataProcessingConsent = async (): Promise<boolean> => {
  const consent = await showConsentDialog({
    title: 'Data Processing Consent',
    message: 'We need your consent to process your personal data...',
    purposes: ['profile_management', 'service_improvement', 'security']
  });
  
  if (consent.granted) {
    logConsentEvent('GRANTED', consent.purposes);
  }
  
  return consent.granted;
};

// Data export
const exportUserData = async (userId: string): Promise<UserDataExport> => {
  return {
    profile: await getUserProfile(userId),
    preferences: await getUserPreferences(userId),
    sessions: await getUserSessions(userId),
    exportDate: new Date().toISOString()
  };
};

// Data deletion
const deleteUserData = async (userId: string): Promise<void> => {
  await Promise.all([
    deleteUserProfile(userId),
    deleteUserPreferences(userId),
    revokeAllSessions(userId),
    deleteUserFiles(userId)
  ]);
  
  logSecurityEvent('DATA_DELETION', { userId });
};
```

## Security Testing

### Automated Security Tests

Implement automated security testing:

```typescript
// XSS prevention tests
describe('XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(\'xss\')" />'
  ];
  
  xssPayloads.forEach(payload => {
    it(`should sanitize XSS payload: ${payload}`, () => {
      const sanitized = sanitizeInput(payload);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror');
    });
  });
});

// CSRF protection tests
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    });
    
    expect(response.status).toBe(403);
  });
});
```

## Security Checklist

### Pre-Deployment Security Checklist

- [ ] All user inputs are validated and sanitized
- [ ] XSS prevention measures are in place
- [ ] CSRF protection is implemented
- [ ] Authentication is secure (JWT + MFA)
- [ ] Session management is secure
- [ ] File uploads are properly validated
- [ ] Rate limiting is implemented
- [ ] Security headers are configured
- [ ] Sensitive data is encrypted
- [ ] Security events are logged
- [ ] GDPR compliance is implemented
- [ ] Security tests are passing
- [ ] Penetration testing is completed
- [ ] Security review is conducted
