import { AuthUser } from '@/types';

export interface MFASetupResult {
  qrCodeUrl: string;
  secretKey: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  success: boolean;
  message: string;
}

export interface TOTPConfig {
  issuer: string;
  accountName: string;
  secretLength: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
}

class MFAService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  private readonly defaultConfig: TOTPConfig = {
    issuer: 'Annotator App',
    accountName: '',
    secretLength: 32,
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  };

  /**
   * Check if MFA is required for a user
   */
  isMFARequired(user: AuthUser): boolean {
    // MFA is required for enterprise users
    if (user.role.name === 'Enterprise User' || user.role.level >= 3) {
      return true;
    }

    // MFA is required if user has high-level permissions
    const highLevelPermissions = [
      'admin_access',
      'user_management',
      'system_settings',
      'billing_access'
    ];

    return user.permissions.some(permission => 
      highLevelPermissions.includes(permission)
    );
  }

  /**
   * Setup MFA for a user
   */
  async setupMFA(userId: string, userEmail: string): Promise<MFASetupResult> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/mfa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to setup MFA');
      }

      const data = await response.json();
      return this.mapMFASetupResponse(data);
    } catch (error) {
      console.error('MFA setup error:', error);
      
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockMFASetup(userEmail);
      }
      
      throw new Error('Failed to setup MFA');
    }
  }

  /**
   * Verify MFA setup with TOTP code
   */
  async verifyMFASetup(userId: string, totpCode: string, secretKey: string): Promise<MFAVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/mfa/verify-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          totp_code: totpCode,
          secret_key: secretKey
        })
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'MFA setup completed successfully'
      };
    } catch (error) {
      console.error('MFA verification error:', error);
      
      // Mock verification for development
      if (process.env.NODE_ENV === 'development') {
        return this.mockVerifyTOTP(totpCode);
      }
      
      throw new Error('Invalid verification code');
    }
  }

  /**
   * Verify TOTP code during login
   */
  async verifyTOTP(userId: string, totpCode: string): Promise<MFAVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          totp_code: totpCode
        })
      });

      if (!response.ok) {
        throw new Error('Invalid authentication code');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Authentication successful'
      };
    } catch (error) {
      console.error('TOTP verification error:', error);
      
      // Mock verification for development
      if (process.env.NODE_ENV === 'development') {
        return this.mockVerifyTOTP(totpCode);
      }
      
      throw new Error('Invalid authentication code');
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<MFAVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/mfa/verify-backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          backup_code: backupCode
        })
      });

      if (!response.ok) {
        throw new Error('Invalid backup code');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Backup code verified successfully'
      };
    } catch (error) {
      console.error('Backup code verification error:', error);
      
      // Mock verification for development
      if (process.env.NODE_ENV === 'development') {
        return this.mockVerifyBackupCode(backupCode);
      }
      
      throw new Error('Invalid backup code');
    }
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(userId: string, totpCode: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/mfa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          totp_code: totpCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to disable MFA');
      }
    } catch (error) {
      console.error('MFA disable error:', error);
      throw new Error('Failed to disable MFA');
    }
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(userId: string, totpCode: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/mfa/backup-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          user_id: userId,
          totp_code: totpCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate backup codes');
      }

      const data = await response.json();
      return data.backup_codes;
    } catch (error) {
      console.error('Backup codes generation error:', error);
      
      // Return mock backup codes for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockBackupCodes();
      }
      
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Generate TOTP URL for QR code
   */
  generateTOTPUrl(secretKey: string, accountName: string, config?: Partial<TOTPConfig>): string {
    const finalConfig = { ...this.defaultConfig, ...config, accountName };
    
    const params = new URLSearchParams({
      secret: secretKey,
      issuer: finalConfig.issuer,
      algorithm: finalConfig.algorithm,
      digits: finalConfig.digits.toString(),
      period: finalConfig.period.toString()
    });

    return `otpauth://totp/${encodeURIComponent(finalConfig.issuer)}:${encodeURIComponent(accountName)}?${params}`;
  }

  /**
   * Generate mock MFA setup for development
   */
  private generateMockMFASetup(userEmail: string): MFASetupResult {
    const secretKey = this.generateSecretKey();
    const totpUrl = this.generateTOTPUrl(secretKey, userEmail);
    
    return {
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUrl)}`,
      secretKey,
      backupCodes: this.generateMockBackupCodes()
    };
  }

  /**
   * Generate mock backup codes
   */
  private generateMockBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 7).toUpperCase() + 
                   '-' + 
                   Math.random().toString(36).substring(2, 7).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate secret key
   */
  private generateSecretKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Mock TOTP verification for development
   */
  private mockVerifyTOTP(totpCode: string): MFAVerificationResult {
    // Accept any 6-digit code for development
    if (/^\d{6}$/.test(totpCode)) {
      return {
        success: true,
        message: 'Authentication successful'
      };
    }
    
    throw new Error('Invalid authentication code');
  }

  /**
   * Mock backup code verification for development
   */
  private mockVerifyBackupCode(backupCode: string): MFAVerificationResult {
    // Accept any code in format XXXXX-XXXXX for development
    if (/^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(backupCode.toUpperCase())) {
      return {
        success: true,
        message: 'Backup code verified successfully'
      };
    }
    
    throw new Error('Invalid backup code');
  }

  /**
   * Map MFA setup API response
   */
  private mapMFASetupResponse(response: any): MFASetupResult {
    return {
      qrCodeUrl: response.qr_code_url,
      secretKey: response.secret_key,
      backupCodes: response.backup_codes
    };
  }

  /**
   * Get current auth token
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const mfaService = new MFAService();
