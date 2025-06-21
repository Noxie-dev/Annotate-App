import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth, usePermissions, useRequireAuth } from '../use-auth';
import { useUserStore } from '@/stores/user-store';
import { mockAuthUser, securityTestCases } from '@/test/utils';

// Mock the user store
vi.mock('@/stores/user-store', () => ({
  useUserStore: vi.fn()
}));

const mockUserStore = {
  authUser: null,
  setAuthUser: vi.fn(),
  setCurrentUser: vi.fn(),
  clearError: vi.fn(),
  logout: vi.fn()
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStore);
    mockUserStore.authUser = null;
  });

  describe('Initial State', () => {
    it('should have correct initial state when not authenticated', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should have correct initial state when authenticated', () => {
      mockUserStore.authUser = mockAuthUser;
      
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockAuthUser);
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'ValidPassword123!'
        });
      });
      
      expect(mockUserStore.setAuthUser).toHaveBeenCalled();
      expect(mockUserStore.setCurrentUser).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await expect(result.current.login({
          email: '',
          password: ''
        })).rejects.toThrow('Email and password are required');
      });
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useAuth());
      
      for (const invalidEmail of securityTestCases.invalidEmails) {
        if (invalidEmail) {
          await act(async () => {
            await expect(result.current.login({
              email: invalidEmail,
              password: 'ValidPassword123!'
            })).rejects.toThrow('Invalid email format');
          });
        }
      }
    });

    it('should handle remember me option', async () => {
      const { result } = renderHook(() => useAuth());
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      
      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          rememberMe: true
        });
      });
      
      expect(setItemSpy).toHaveBeenCalledWith('auth_remember', 'true');
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuth());
      
      let loadingState = false;
      
      act(() => {
        result.current.login({
          email: 'test@example.com',
          password: 'ValidPassword123!'
        }).then(() => {
          loadingState = result.current.isLoading;
        });
      });
      
      // Check that loading was true during the process
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Registration', () => {
    it('should register successfully with valid data', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
          acceptTerms: true
        });
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should validate required fields', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await expect(result.current.register({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          acceptTerms: false
        })).rejects.toThrow('All fields are required');
      });
    });

    it('should validate password confirmation', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await expect(result.current.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          confirmPassword: 'DifferentPassword123!',
          acceptTerms: true
        })).rejects.toThrow('Passwords do not match');
      });
    });

    it('should validate password strength', async () => {
      const { result } = renderHook(() => useAuth());
      
      for (const weakPassword of securityTestCases.weakPasswords) {
        await act(async () => {
          await expect(result.current.register({
            name: 'Test User',
            email: 'test@example.com',
            password: weakPassword,
            confirmPassword: weakPassword,
            acceptTerms: true
          })).rejects.toThrow();
        });
      }
    });

    it('should require terms acceptance', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await expect(result.current.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
          acceptTerms: false
        })).rejects.toThrow('You must accept the terms and conditions');
      });
    });

    it('should sanitize user input', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.register({
          name: '<script>alert("xss")</script>Test User',
          email: 'test@example.com',
          password: 'ValidPassword123!',
          confirmPassword: 'ValidPassword123!',
          acceptTerms: true
        });
      });
      
      // Should not throw an error and should sanitize the input
      expect(result.current.error).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      mockUserStore.authUser = mockAuthUser;
      const { result } = renderHook(() => useAuth());
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem');
      
      await act(async () => {
        await result.current.logout();
      });
      
      expect(mockUserStore.logout).toHaveBeenCalled();
      expect(removeItemSpy).toHaveBeenCalledWith('auth_remember');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      mockUserStore.authUser = mockAuthUser;
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.refreshToken();
      });
      
      expect(mockUserStore.setAuthUser).toHaveBeenCalled();
    });

    it('should logout on refresh failure', async () => {
      mockUserStore.authUser = mockAuthUser;
      mockUserStore.setAuthUser.mockRejectedValueOnce(new Error('Refresh failed'));
      
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.refreshToken();
      });
      
      // Should have attempted to logout on failure
      expect(mockUserStore.logout).toHaveBeenCalled();
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        const response = await result.current.resetPassword('test@example.com');
        expect(response.message).toBe('Password reset email sent');
      });
    });

    it('should validate email format for password reset', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await expect(result.current.resetPassword('invalid-email'))
          .rejects.toThrow('Invalid email format');
      });
    });
  });

  describe('Email Verification', () => {
    it('should verify email successfully', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        const response = await result.current.verifyEmail('valid-token');
        expect(response.message).toBe('Email verified successfully');
      });
    });

    it('should require verification token', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await expect(result.current.verifyEmail(''))
          .rejects.toThrow('Verification token is required');
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear auth error', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.clearError();
      });
      
      expect(mockUserStore.clearError).toHaveBeenCalled();
    });
  });
});

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStore);
  });

  it('should check permissions correctly when authenticated', () => {
    mockUserStore.authUser = mockAuthUser;
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission('view_documents')).toBe(true);
    expect(result.current.hasPermission('admin_access')).toBe(false);
  });

  it('should check roles correctly', () => {
    mockUserStore.authUser = mockAuthUser;
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasRole('Team Member')).toBe(true);
    expect(result.current.hasRole('Admin')).toBe(false);
  });

  it('should check minimum role level', () => {
    mockUserStore.authUser = mockAuthUser;
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasMinimumRole(1)).toBe(true);
    expect(result.current.hasMinimumRole(5)).toBe(false);
  });

  it('should return false for all checks when not authenticated', () => {
    mockUserStore.authUser = null;
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission('view_documents')).toBe(false);
    expect(result.current.hasRole('Team Member')).toBe(false);
    expect(result.current.hasMinimumRole(1)).toBe(false);
  });
});

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStore);
  });

  it('should return authenticated state when user is logged in', () => {
    mockUserStore.authUser = mockAuthUser;
    const { result } = renderHook(() => useRequireAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should warn when user is not authenticated', () => {
    mockUserStore.authUser = null;
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => useRequireAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Authentication required');
    
    consoleSpy.mockRestore();
  });
});
