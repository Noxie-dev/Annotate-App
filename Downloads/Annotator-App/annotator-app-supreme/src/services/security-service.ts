import { AuthUser, UserSession } from '@/types';

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    browser: string;
    os: string;
  };
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isCurrentSession: boolean;
}

export interface PasswordResetRequest {
  email: string;
  token?: string;
  newPassword?: string;
}

export interface EmailVerificationRequest {
  email: string;
  token?: string;
}

class SecurityService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  private readonly sessionKey = 'annotator_session';
  private readonly csrfTokenKey = 'csrf_token';

  /**
   * Get security headers for the application
   */
  getSecurityHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.qrserver.com",
        "frame-ancestors 'none'"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  /**
   * Initialize CSRF protection
   */
  async initializeCSRF(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const data = await response.json();
      const token = data.csrf_token;
      
      sessionStorage.setItem(this.csrfTokenKey, token);
      return token;
    } catch (error) {
      console.error('CSRF initialization error:', error);
      
      // Generate mock CSRF token for development
      if (import.meta.env.MODE === 'development') {
        const mockToken = this.generateSecureToken();
        sessionStorage.setItem(this.csrfTokenKey, mockToken);
        return mockToken;
      }
      
      throw new Error('Failed to initialize CSRF protection');
    }
  }

  /**
   * Get current CSRF token
   */
  getCSRFToken(): string | null {
    return sessionStorage.getItem(this.csrfTokenKey);
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeating characters');
      score -= 1;
    }

    if (/123|abc|qwe/i.test(password)) {
      feedback.push('Avoid common sequences');
      score -= 1;
    }

    return {
      isValid: score >= 4 && feedback.length === 0,
      score: Math.max(0, Math.min(5, score)),
      feedback
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken() || ''
        },
        body: JSON.stringify({ email: this.sanitizeInput(email) })
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }

      const data = await response.json();
      return { message: data.message || 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset request error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Password reset email sent successfully' };
      }
      
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const validation = this.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      throw new Error(validation.feedback.join('. '));
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken() || ''
        },
        body: JSON.stringify({ 
          token,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();
      return { message: data.message || 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Password reset successfully' };
      }
      
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken() || ''
        },
        body: JSON.stringify({ email: this.sanitizeInput(email) })
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      const data = await response.json();
      return { message: data.message || 'Verification email sent' };
    } catch (error) {
      console.error('Email verification request error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Verification email sent successfully' };
      }
      
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/email-verification/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken() || ''
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Failed to verify email');
      }

      const data = await response.json();
      return { message: data.message || 'Email verified successfully' };
    } catch (error) {
      console.error('Email verification error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { message: 'Email verified successfully' };
      }
      
      throw new Error('Failed to verify email');
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/sessions/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-CSRF-Token': this.getCSRFToken() || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      return data.sessions.map(this.mapSessionResponse);
    } catch (error) {
      console.error('Get sessions error:', error);
      
      // Return mock sessions for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockSessions();
      }
      
      throw new Error('Failed to fetch sessions');
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'X-CSRF-Token': this.getCSRFToken() || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }
    } catch (error) {
      console.error('Revoke session error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      
      throw new Error('Failed to revoke session');
    }
  }

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get current auth token
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Parse user agent for device info
   */
  private parseUserAgent(userAgent: string): { browser: string; os: string } {
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Unknown';

    const os = userAgent.includes('Windows') ? 'Windows' :
               userAgent.includes('Mac') ? 'macOS' :
               userAgent.includes('Linux') ? 'Linux' :
               userAgent.includes('Android') ? 'Android' :
               userAgent.includes('iOS') ? 'iOS' : 'Unknown';

    return { browser, os };
  }

  /**
   * Map session API response
   */
  private mapSessionResponse = (session: any): SessionInfo => {
    const deviceInfo = this.parseUserAgent(session.user_agent);
    
    return {
      id: session.id,
      userId: session.user_id,
      deviceInfo: {
        userAgent: session.user_agent,
        ip: session.ip_address,
        location: session.location,
        browser: deviceInfo.browser,
        os: deviceInfo.os
      },
      createdAt: session.created_at,
      lastActiveAt: session.last_active_at,
      expiresAt: session.expires_at,
      isCurrentSession: session.is_current
    };
  };

  /**
   * Generate mock sessions for development
   */
  private generateMockSessions(): SessionInfo[] {
    const currentUserAgent = navigator.userAgent;
    const currentDevice = this.parseUserAgent(currentUserAgent);
    
    return [
      {
        id: 'current-session',
        userId: 'user-1',
        deviceInfo: {
          userAgent: currentUserAgent,
          ip: '192.168.1.100',
          location: 'San Francisco, CA',
          browser: currentDevice.browser,
          os: currentDevice.os
        },
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isCurrentSession: true
      },
      {
        id: 'mobile-session',
        userId: 'user-1',
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          ip: '192.168.1.101',
          location: 'San Francisco, CA',
          browser: 'Safari',
          os: 'iOS'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        isCurrentSession: false
      }
    ];
  }
}

export const securityService = new SecurityService();
