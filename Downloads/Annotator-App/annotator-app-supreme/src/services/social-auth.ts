import { AuthUser, User } from '@/types';

export interface SocialAuthProvider {
  id: 'google' | 'github';
  name: string;
  icon: string;
  color: string;
}

export interface SocialAuthResult {
  user: AuthUser;
  profile: User;
  isNewUser: boolean;
}

export const SOCIAL_PROVIDERS: SocialAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'Mail',
    color: '#4285f4'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'Github',
    color: '#333'
  }
];

class SocialAuthService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  /**
   * Initiate OAuth flow for a provider
   */
  async initiateOAuth(provider: 'google' | 'github', redirectUrl?: string): Promise<void> {
    const params = new URLSearchParams({
      provider,
      redirect_url: redirectUrl || window.location.origin + '/auth/callback',
      state: this.generateState()
    });

    // Store state for verification
    sessionStorage.setItem('oauth_state', params.get('state')!);
    
    // In a real app, this would redirect to the OAuth provider
    // For demo purposes, we'll simulate the OAuth flow
    if (import.meta.env.DEV) {
      await this.simulateOAuthFlow(provider);
    } else {
      window.location.href = `${this.baseUrl}/auth/oauth/initiate?${params}`;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string, provider: string): Promise<SocialAuthResult> {
    // Verify state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid OAuth state parameter');
    }

    // Clear stored state
    sessionStorage.removeItem('oauth_state');

    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          provider
        })
      });

      if (!response.ok) {
        throw new Error('OAuth authentication failed');
      }

      const result = await response.json();
      return this.mapOAuthResponse(result);
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Failed to complete OAuth authentication');
    }
  }

  /**
   * Simulate OAuth flow for development
   */
  private async simulateOAuthFlow(provider: 'google' | 'github'): Promise<void> {
    // Simulate OAuth redirect delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock OAuth response
    const mockResult = this.generateMockOAuthResult(provider);
    
    // Store result temporarily
    sessionStorage.setItem('mock_oauth_result', JSON.stringify(mockResult));
    
    // Simulate callback
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('code', 'mock_code_' + Date.now());
    callbackUrl.searchParams.set('state', sessionStorage.getItem('oauth_state')!);
    callbackUrl.searchParams.set('provider', provider);
    
    window.location.href = callbackUrl.toString();
  }

  /**
   * Get mock OAuth result (for development)
   */
  getMockOAuthResult(): SocialAuthResult | null {
    const stored = sessionStorage.getItem('mock_oauth_result');
    if (stored) {
      sessionStorage.removeItem('mock_oauth_result');
      return JSON.parse(stored);
    }
    return null;
  }

  /**
   * Generate mock OAuth result for development
   */
  private generateMockOAuthResult(provider: 'google' | 'github'): SocialAuthResult {
    const baseUser = {
      id: `${provider}_${Date.now()}`,
      email: `user@${provider === 'google' ? 'gmail.com' : 'github.com'}`,
      emailVerified: true,
      name: provider === 'google' ? 'Google User' : 'GitHub User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      role: {
        id: 'team-member',
        name: 'Team Member',
        description: 'Standard team member with document access',
        permissions: ['view_documents', 'edit_documents', 'add_comments'],
        level: 1
      },
      permissions: ['view_documents', 'edit_documents', 'add_comments'],
      sessionId: this.generateSessionId(),
      lastLoginAt: new Date().toISOString(),
      mfaEnabled: false
    };

    const profile = {
      id: baseUser.id,
      name: baseUser.name,
      email: baseUser.email,
      avatar: baseUser.avatar,
      role: baseUser.role.name,
      status: 'online' as const,
      color: provider === 'google' ? '#4285f4' : '#333',
      department: 'Engineering',
      joinDate: new Date().toISOString().split('T')[0],
      timezone: 'UTC',
      isFirstTimeUser: true,
      lastLoginAt: baseUser.lastLoginAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      user: baseUser,
      profile,
      isNewUser: true
    };
  }

  /**
   * Map OAuth API response to our types
   */
  private mapOAuthResponse(response: any): SocialAuthResult {
    return {
      user: {
        id: response.user.id,
        email: response.user.email,
        emailVerified: response.user.email_verified || true,
        name: response.user.name || response.user.display_name,
        avatar: response.user.avatar_url || response.user.picture,
        role: response.user.role || {
          id: 'team-member',
          name: 'Team Member',
          description: 'Standard team member with document access',
          permissions: ['view_documents', 'edit_documents', 'add_comments'],
          level: 1
        },
        permissions: response.user.permissions || ['view_documents', 'edit_documents', 'add_comments'],
        sessionId: response.session_id,
        lastLoginAt: new Date().toISOString(),
        mfaEnabled: response.user.mfa_enabled || false
      },
      profile: {
        id: response.user.id,
        name: response.user.name || response.user.display_name,
        email: response.user.email,
        avatar: response.user.avatar_url || response.user.picture,
        role: response.user.role?.name || 'Team Member',
        status: 'online',
        color: response.user.color || '#3b82f6',
        department: response.user.department || 'Engineering',
        joinDate: response.user.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        timezone: response.user.timezone || 'UTC',
        isFirstTimeUser: response.is_new_user || false,
        lastLoginAt: new Date().toISOString(),
        createdAt: response.user.created_at || new Date().toISOString(),
        updatedAt: response.user.updated_at || new Date().toISOString()
      },
      isNewUser: response.is_new_user || false
    };
  }

  /**
   * Generate secure random state parameter
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Link social account to existing user
   */
  async linkSocialAccount(provider: 'google' | 'github', userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          provider,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to link social account');
      }
    } catch (error) {
      console.error('Link social account error:', error);
      throw new Error('Failed to link social account');
    }
  }

  /**
   * Unlink social account from user
   */
  async unlinkSocialAccount(provider: 'google' | 'github', userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          provider,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to unlink social account');
      }
    } catch (error) {
      console.error('Unlink social account error:', error);
      throw new Error('Failed to unlink social account');
    }
  }

  /**
   * Get current auth token
   */
  private getAuthToken(): string | null {
    // In a real app, this would get the token from secure storage
    return localStorage.getItem('auth_token');
  }
}

export const socialAuthService = new SocialAuthService();
