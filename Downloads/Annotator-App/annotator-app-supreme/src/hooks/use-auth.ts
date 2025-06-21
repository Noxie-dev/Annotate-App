import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/stores/user-store';
import { AuthUser, User } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export function useAuth() {
  const { authUser, setAuthUser, setCurrentUser, clearError, logout } = useUserStore();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!authUser,
    isLoading: false,
    user: authUser,
    error: null
  });

  // Update auth state when store changes
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: !!authUser,
      user: authUser
    }));
  }, [authUser]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Validate credentials
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!isValidEmail(credentials.email)) {
        throw new Error('Invalid email format');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock authentication response
      const mockAuthUser: AuthUser = {
        id: 'user-1',
        email: credentials.email,
        emailVerified: true,
        name: 'Current User',
        avatar: '/images/user-avatar-default.jpg',
        role: {
          id: 'team-member',
          name: 'Team Member',
          description: 'Standard team member with document access',
          permissions: ['view_documents', 'edit_documents', 'add_comments'],
          level: 1
        },
        permissions: ['view_documents', 'edit_documents', 'add_comments'],
        sessionId: generateSessionId(),
        lastLoginAt: new Date().toISOString(),
        mfaEnabled: false
      };

      const mockUser: User = {
        id: mockAuthUser.id,
        name: mockAuthUser.name,
        email: mockAuthUser.email,
        avatar: mockAuthUser.avatar || '/images/user-avatar-default.jpg',
        role: mockAuthUser.role.name,
        status: 'online',
        color: '#3b82f6',
        department: 'Engineering',
        joinDate: '2024-01-15',
        timezone: 'UTC-8',
        isFirstTimeUser: false,
        lastLoginAt: mockAuthUser.lastLoginAt,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      };

      setAuthUser(mockAuthUser);
      setCurrentUser(mockUser);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: mockAuthUser,
        error: null
      });

      // Store session info if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem('auth_remember', 'true');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [setAuthUser, setCurrentUser]);

  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Validate registration data
      if (!data.name || !data.email || !data.password || !data.confirmPassword) {
        throw new Error('All fields are required');
      }

      if (!isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!isStrongPassword(data.password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      }

      if (!data.acceptTerms) {
        throw new Error('You must accept the terms and conditions');
      }

      // Sanitize input
      const sanitizedData = {
        name: sanitizeInput(data.name),
        email: data.email.toLowerCase().trim(),
        password: data.password
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock registration success - in real app, user would need to verify email
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const logoutUser = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call to invalidate session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      logout();
      localStorage.removeItem('auth_remember');
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [logout]);

  const refreshToken = useCallback(async () => {
    if (!authUser) return;

    try {
      // Simulate token refresh
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedAuthUser = {
        ...authUser,
        sessionId: generateSessionId(),
        lastLoginAt: new Date().toISOString()
      };
      
      setAuthUser(updatedAuthUser);
    } catch (error) {
      // If refresh fails, logout user
      logoutUser();
    }
  }, [authUser, setAuthUser, logoutUser]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, this would send a reset email
    return { message: 'Password reset email sent' };
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    if (!token) {
      throw new Error('Verification token is required');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { message: 'Email verified successfully' };
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
    clearError();
  }, [clearError]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!authUser) return;

    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [authUser, refreshToken]);

  return {
    ...authState,
    login,
    register,
    logout: logoutUser,
    refreshToken,
    resetPassword,
    verifyEmail,
    clearError: clearAuthError
  };
}

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, ''); // Remove HTML tags
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Hook for checking permissions
export function usePermissions() {
  const { authUser } = useUserStore();

  const hasPermission = useCallback((permission: string): boolean => {
    if (!authUser) return false;
    return authUser.permissions.includes(permission);
  }, [authUser]);

  const hasRole = useCallback((roleName: string): boolean => {
    if (!authUser) return false;
    return authUser.role.name === roleName;
  }, [authUser]);

  const hasMinimumRole = useCallback((minimumLevel: number): boolean => {
    if (!authUser) return false;
    return authUser.role.level >= minimumLevel;
  }, [authUser]);

  return {
    hasPermission,
    hasRole,
    hasMinimumRole,
    permissions: authUser?.permissions || [],
    role: authUser?.role
  };
}

// Hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // In a real app, this would redirect to login
      console.warn('Authentication required');
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}
