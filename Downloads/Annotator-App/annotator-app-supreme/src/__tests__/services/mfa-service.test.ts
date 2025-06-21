import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mfaService } from '@/services/mfa-service';
import { AuthUser } from '@/types';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

const mockUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  emailVerified: true,
  name: 'Test User',
  avatar: '/avatar.jpg',
  role: {
    id: 'enterprise-user',
    name: 'Enterprise User',
    description: 'Enterprise user with advanced features',
    permissions: ['view_documents', 'edit_documents', 'admin_access'],
    level: 3
  },
  permissions: ['view_documents', 'edit_documents', 'admin_access'],
  sessionId: 'session-1',
  lastLoginAt: new Date().toISOString(),
  mfaEnabled: false
};

describe('MFAService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-auth-token');
    
    // Set NODE_ENV to test to avoid development mocks
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isMFARequired', () => {
    it('returns true for enterprise users', () => {
      const result = mfaService.isMFARequired(mockUser);
      expect(result).toBe(true);
    });

    it('returns true for users with high-level permissions', () => {
      const userWithAdminAccess: AuthUser = {
        ...mockUser,
        role: { ...mockUser.role, name: 'Team Member', level: 1 },
        permissions: ['view_documents', 'admin_access']
      };
      
      const result = mfaService.isMFARequired(userWithAdminAccess);
      expect(result).toBe(true);
    });

    it('returns false for regular users without high-level permissions', () => {
      const regularUser: AuthUser = {
        ...mockUser,
        role: { ...mockUser.role, name: 'Team Member', level: 1 },
        permissions: ['view_documents', 'edit_documents']
      };
      
      const result = mfaService.isMFARequired(regularUser);
      expect(result).toBe(false);
    });
  });

  describe('setupMFA', () => {
    it('successfully sets up MFA', async () => {
      const mockResponse = {
        qr_code_url: 'https://example.com/qr',
        secret_key: 'JBSWY3DPEHPK3PXP',
        backup_codes: ['12345-67890', '23456-78901']
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await mfaService.setupMFA('user-1', 'test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/mfa/setup',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          }),
          body: JSON.stringify({
            user_id: 'user-1',
            email: 'test@example.com'
          })
        })
      );

      expect(result).toEqual({
        qrCodeUrl: 'https://example.com/qr',
        secretKey: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['12345-67890', '23456-78901']
      });
    });

    it('throws error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response);

      await expect(mfaService.setupMFA('user-1', 'test@example.com'))
        .rejects.toThrow('Failed to setup MFA');
    });

    it('returns mock data in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await mfaService.setupMFA('user-1', 'test@example.com');

      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('secretKey');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(8);
    });
  });

  describe('verifyMFASetup', () => {
    it('successfully verifies MFA setup', async () => {
      const mockResponse = {
        message: 'MFA setup completed successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await mfaService.verifyMFASetup('user-1', '123456', 'JBSWY3DPEHPK3PXP');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/mfa/verify-setup',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          }),
          body: JSON.stringify({
            user_id: 'user-1',
            totp_code: '123456',
            secret_key: 'JBSWY3DPEHPK3PXP'
          })
        })
      );

      expect(result).toEqual({
        success: true,
        message: 'MFA setup completed successfully'
      });
    });

    it('throws error for invalid verification code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response);

      await expect(mfaService.verifyMFASetup('user-1', '123456', 'JBSWY3DPEHPK3PXP'))
        .rejects.toThrow('Invalid verification code');
    });

    it('accepts valid 6-digit codes in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await mfaService.verifyMFASetup('user-1', '123456', 'JBSWY3DPEHPK3PXP');

      expect(result).toEqual({
        success: true,
        message: 'Authentication successful'
      });
    });

    it('rejects invalid codes in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(mfaService.verifyMFASetup('user-1', '12345', 'JBSWY3DPEHPK3PXP'))
        .rejects.toThrow('Invalid authentication code');
    });
  });

  describe('verifyTOTP', () => {
    it('successfully verifies TOTP code', async () => {
      const mockResponse = {
        message: 'Authentication successful'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await mfaService.verifyTOTP('user-1', '123456');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/mfa/verify',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          }),
          body: JSON.stringify({
            user_id: 'user-1',
            totp_code: '123456'
          })
        })
      );

      expect(result).toEqual({
        success: true,
        message: 'Authentication successful'
      });
    });
  });

  describe('verifyBackupCode', () => {
    it('successfully verifies backup code', async () => {
      const mockResponse = {
        message: 'Backup code verified successfully'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await mfaService.verifyBackupCode('user-1', '12345-67890');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/mfa/verify-backup',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-auth-token'
          }),
          body: JSON.stringify({
            user_id: 'user-1',
            backup_code: '12345-67890'
          })
        })
      );

      expect(result).toEqual({
        success: true,
        message: 'Backup code verified successfully'
      });
    });

    it('accepts valid backup code format in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await mfaService.verifyBackupCode('user-1', 'ABC12-DEF34');

      expect(result).toEqual({
        success: true,
        message: 'Backup code verified successfully'
      });
    });

    it('rejects invalid backup code format in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(mfaService.verifyBackupCode('user-1', 'invalid-code'))
        .rejects.toThrow('Invalid backup code');
    });
  });

  describe('generateTOTPUrl', () => {
    it('generates correct TOTP URL', () => {
      const secretKey = 'JBSWY3DPEHPK3PXP';
      const accountName = 'test@example.com';
      
      const url = mfaService.generateTOTPUrl(secretKey, accountName);
      
      expect(url).toContain('otpauth://totp/');
      expect(url).toContain('Annotator%20App');
      expect(url).toContain('test%40example.com');
      expect(url).toContain(`secret=${secretKey}`);
      expect(url).toContain('algorithm=SHA1');
      expect(url).toContain('digits=6');
      expect(url).toContain('period=30');
    });

    it('accepts custom configuration', () => {
      const secretKey = 'JBSWY3DPEHPK3PXP';
      const accountName = 'test@example.com';
      const config = {
        issuer: 'Custom App',
        algorithm: 'SHA256' as const,
        digits: 8,
        period: 60
      };
      
      const url = mfaService.generateTOTPUrl(secretKey, accountName, config);
      
      expect(url).toContain('Custom%20App');
      expect(url).toContain('algorithm=SHA256');
      expect(url).toContain('digits=8');
      expect(url).toContain('period=60');
    });
  });
});
