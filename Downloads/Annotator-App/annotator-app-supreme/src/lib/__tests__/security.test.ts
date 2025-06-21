import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validators,
  sanitizers,
  xssProtection,
  csrfProtection,
  RateLimiter,
  cspHelpers,
  secureStorage,
  passwordStrength,
  schemas,
  errorMessages
} from '../security';
import { securityTestCases, createMockFile } from '@/test/utils';

describe('Security Utilities', () => {
  describe('Validators', () => {
    describe('email validation', () => {
      it('should validate correct email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'user123@test-domain.com'
        ];

        validEmails.forEach(email => {
          expect(validators.email(email)).toBe(true);
        });
      });

      it('should reject invalid email addresses', () => {
        securityTestCases.invalidEmails.forEach(email => {
          if (email) {
            expect(validators.email(email)).toBe(false);
          }
        });
      });
    });

    describe('password validation', () => {
      it('should validate strong passwords', () => {
        const strongPasswords = [
          'StrongPassword123!',
          'MySecure@Pass1',
          'Complex#Password9'
        ];

        strongPasswords.forEach(password => {
          const result = validators.password(password);
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        });
      });

      it('should reject weak passwords', () => {
        securityTestCases.weakPasswords.forEach(password => {
          const result = validators.password(password);
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        });
      });

      it('should provide specific error messages', () => {
        const result = validators.password('weak');
        expect(result.errors).toContain('Password must be at least 8 characters long');
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
        expect(result.errors).toContain('Password must contain at least one number');
        expect(result.errors).toContain('Password must contain at least one special character');
      });
    });

    describe('phone validation', () => {
      it('should validate correct phone numbers', () => {
        const validPhones = [
          '+1 (555) 123-4567',
          '+44 20 7946 0958',
          '555-123-4567',
          '(555) 123-4567',
          '+1234567890123'
        ];

        validPhones.forEach(phone => {
          expect(validators.phone(phone)).toBe(true);
        });
      });

      it('should reject invalid phone numbers', () => {
        const invalidPhones = [
          '123',
          'abc-def-ghij',
          '++1234567890',
          '123456789012345678901' // Too long
        ];

        invalidPhones.forEach(phone => {
          expect(validators.phone(phone)).toBe(false);
        });
      });
    });

    describe('name validation', () => {
      it('should validate correct names', () => {
        const validNames = [
          'John Doe',
          'Mary-Jane Smith',
          "O'Connor",
          'Jean-Luc Picard',
          'Dr. Smith'
        ];

        validNames.forEach(name => {
          expect(validators.name(name)).toBe(true);
        });
      });

      it('should reject invalid names', () => {
        const invalidNames = [
          'J',
          'John123',
          'John@Doe',
          '<script>alert("xss")</script>',
          'x'.repeat(51) // Too long
        ];

        invalidNames.forEach(name => {
          expect(validators.name(name)).toBe(false);
        });
      });
    });

    describe('file validation', () => {
      it('should validate file types correctly', () => {
        const imageFile = createMockFile('test.jpg', 'image/jpeg');
        const textFile = createMockFile('test.txt', 'text/plain');

        expect(validators.fileType(imageFile, ['image/'])).toBe(true);
        expect(validators.fileType(textFile, ['image/'])).toBe(false);
        expect(validators.fileType(textFile, ['text/'])).toBe(true);
      });

      it('should validate file sizes correctly', () => {
        const smallFile = createMockFile('small.jpg', 'image/jpeg', 1024); // 1KB
        const largeFile = createMockFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB

        expect(validators.fileSize(smallFile, 5)).toBe(true);
        expect(validators.fileSize(largeFile, 5)).toBe(false);
      });
    });

    describe('timezone validation', () => {
      it('should validate correct timezones', () => {
        const validTimezones = [
          'UTC',
          'America/New_York',
          'Europe/London',
          'Asia/Tokyo'
        ];

        validTimezones.forEach(timezone => {
          expect(validators.timezone(timezone)).toBe(true);
        });
      });

      it('should reject invalid timezones', () => {
        const invalidTimezones = [
          'Invalid/Timezone',
          'UTC+5',
          'GMT-8',
          ''
        ];

        invalidTimezones.forEach(timezone => {
          expect(validators.timezone(timezone)).toBe(false);
        });
      });
    });
  });

  describe('Sanitizers', () => {
    it('should sanitize HTML content', () => {
      const dirtyHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const clean = sanitizers.html(dirtyHtml);
      
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
    });

    it('should sanitize text content', () => {
      const dirtyText = '<script>alert("xss")</script>Clean text';
      const clean = sanitizers.text(dirtyText);
      
      expect(clean).not.toContain('<script>');
      expect(clean).toBe('Clean text');
    });

    it('should sanitize names', () => {
      const dirtyName = '  John<script>  Doe  ';
      const clean = sanitizers.name(dirtyName);
      
      expect(clean).toBe('John Doe');
      expect(clean).not.toContain('<script>');
    });

    it('should sanitize emails', () => {
      const dirtyEmail = '  TEST@EXAMPLE.COM  ';
      const clean = sanitizers.email(dirtyEmail);
      
      expect(clean).toBe('test@example.com');
    });

    it('should sanitize phone numbers', () => {
      const dirtyPhone = '+1 (555) abc-4567!@#';
      const clean = sanitizers.phone(dirtyPhone);
      
      expect(clean).toBe('+1 (555) -4567');
    });

    it('should sanitize file names', () => {
      const dirtyFileName = 'my file!@#$%^&*().jpg';
      const clean = sanitizers.fileName(dirtyFileName);
      
      expect(clean).toBe('my_file________.jpg');
    });

    it('should limit bio length', () => {
      const longBio = 'x'.repeat(600);
      const clean = sanitizers.bio(longBio);
      
      expect(clean.length).toBe(500);
    });
  });

  describe('XSS Protection', () => {
    it('should escape HTML entities', () => {
      const dangerous = '<script>alert("xss")</script>';
      const escaped = xssProtection.escapeHtml(dangerous);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize attributes', () => {
      const dangerous = 'value"onclick="alert(\'xss\')"';
      const clean = xssProtection.sanitizeForAttribute(dangerous);
      
      expect(clean).not.toContain('"');
      expect(clean).not.toContain("'");
    });

    it('should sanitize URLs', () => {
      const dangerous = 'javascript:alert("xss")';
      const clean = xssProtection.sanitizeForUrl(dangerous);
      
      expect(clean).toBe('javascript%3Aalert(%22xss%22)');
    });
  });

  describe('CSRF Protection', () => {
    it('should generate unique tokens', () => {
      const token1 = csrfProtection.generateToken();
      const token2 = csrfProtection.generateToken();
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes * 2 hex chars
    });

    it('should validate tokens correctly', () => {
      const token = 'valid-token';
      
      expect(csrfProtection.validateToken(token, token)).toBe(true);
      expect(csrfProtection.validateToken(token, 'different-token')).toBe(false);
      expect(csrfProtection.validateToken('', token)).toBe(false);
      expect(csrfProtection.validateToken(token, '')).toBe(false);
    });
  });

  describe('Rate Limiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter();
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      }
      
      // 6th request should be blocked
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(false);
    });

    it('should reset rate limit', () => {
      // Exceed limit
      for (let i = 0; i < 6; i++) {
        rateLimiter.isAllowed('user1', 5, 60000);
      }
      
      // Reset and try again
      rateLimiter.reset('user1');
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
    });

    it('should handle different users separately', () => {
      // User1 exceeds limit
      for (let i = 0; i < 6; i++) {
        rateLimiter.isAllowed('user1', 5, 60000);
      }
      
      // User2 should still be allowed
      expect(rateLimiter.isAllowed('user2', 5, 60000)).toBe(true);
    });
  });

  describe('CSP Helpers', () => {
    it('should generate unique nonces', () => {
      const nonce1 = cspHelpers.generateNonce();
      const nonce2 = cspHelpers.generateNonce();
      
      expect(nonce1).not.toBe(nonce2);
      expect(nonce1.length).toBeGreaterThan(0);
    });

    it('should validate image URLs', () => {
      expect(cspHelpers.isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(cspHelpers.isValidImageUrl('http://example.com/image.jpg')).toBe(true);
      expect(cspHelpers.isValidImageUrl('data:image/png;base64,abc123')).toBe(true);
      expect(cspHelpers.isValidImageUrl('javascript:alert("xss")')).toBe(false);
      expect(cspHelpers.isValidImageUrl('invalid-url')).toBe(false);
    });
  });

  describe('Secure Storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store and retrieve data', () => {
      secureStorage.setItem('test-key', 'test-value');
      const retrieved = secureStorage.getItem('test-key');
      
      expect(retrieved).toBe('test-value');
    });

    it('should encrypt and decrypt data', () => {
      secureStorage.setItem('test-key', 'test-value', true);
      const retrieved = secureStorage.getItem('test-key', true);
      
      expect(retrieved).toBe('test-value');
      
      // Check that raw storage is encrypted
      const raw = localStorage.getItem('test-key');
      expect(raw).not.toBe('test-value');
    });

    it('should remove items', () => {
      secureStorage.setItem('test-key', 'test-value');
      secureStorage.removeItem('test-key');
      
      expect(secureStorage.getItem('test-key')).toBeNull();
    });

    it('should clear all items', () => {
      secureStorage.setItem('key1', 'value1');
      secureStorage.setItem('key2', 'value2');
      secureStorage.clear();
      
      expect(secureStorage.getItem('key1')).toBeNull();
      expect(secureStorage.getItem('key2')).toBeNull();
    });
  });

  describe('Password Strength', () => {
    it('should rate strong passwords correctly', () => {
      const result = passwordStrength.check('StrongPassword123!');
      
      expect(result.strength).toBe('strong');
      expect(result.score).toBeGreaterThan(6);
      expect(result.feedback.length).toBe(0);
    });

    it('should rate weak passwords correctly', () => {
      const result = passwordStrength.check('weak');
      
      expect(result.strength).toBe('weak');
      expect(result.score).toBeLessThan(3);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should detect common patterns', () => {
      const result = passwordStrength.check('password123');
      
      expect(result.feedback).toContain('Avoid common patterns');
    });

    it('should detect repeating characters', () => {
      const result = passwordStrength.check('aaabbbccc');
      
      expect(result.feedback).toContain('Avoid repeating characters');
    });
  });

  describe('Validation Schemas', () => {
    it('should validate user profile data', () => {
      expect(schemas.userProfile.name('John Doe')).toBe(true);
      expect(schemas.userProfile.name('J')).toBe(false);
      
      expect(schemas.userProfile.email('test@example.com')).toBe(true);
      expect(schemas.userProfile.email('invalid')).toBe(false);
      
      expect(schemas.userProfile.phone('+1234567890')).toBe(true);
      expect(schemas.userProfile.phone('')).toBe(true); // Optional
      expect(schemas.userProfile.phone('invalid')).toBe(false);
    });

    it('should validate user preferences', () => {
      expect(schemas.userPreferences.theme('dark')).toBe(true);
      expect(schemas.userPreferences.theme('invalid')).toBe(false);
      
      expect(schemas.userPreferences.language('en')).toBe(true);
      expect(schemas.userPreferences.language('en-US')).toBe(true);
      expect(schemas.userPreferences.language('invalid')).toBe(false);
      
      expect(schemas.userPreferences.fontSize('medium')).toBe(true);
      expect(schemas.userPreferences.fontSize('invalid')).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should provide appropriate error messages', () => {
      expect(errorMessages.INVALID_EMAIL).toBe('Please enter a valid email address');
      expect(errorMessages.WEAK_PASSWORD).toBe('Password is too weak. Please follow the requirements.');
      expect(errorMessages.FILE_TOO_LARGE).toBe('File size exceeds the maximum limit');
      expect(errorMessages.RATE_LIMIT_EXCEEDED).toBe('Too many attempts. Please try again later.');
    });
  });
});
