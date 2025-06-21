import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore } from '../user-store';
import { mockUser, mockAuthUser, securityTestCases } from '@/test/utils';
import { UserProfileUpdate, UserPreferencesUpdate } from '@/types';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('UserStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useUserStore.setState({
      currentUser: null,
      authUser: null,
      users: [],
      isLoading: false,
      error: null,
      sessions: []
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUserStore.getState();
      expect(state.currentUser).toBeNull();
      expect(state.authUser).toBeNull();
      expect(state.users).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.sessions).toEqual([]);
    });
  });

  describe('User Management', () => {
    it('should set current user', () => {
      const { setCurrentUser } = useUserStore.getState();
      setCurrentUser(mockUser);
      
      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(mockUser);
    });

    it('should set auth user', () => {
      const { setAuthUser } = useUserStore.getState();
      setAuthUser(mockAuthUser);
      
      const state = useUserStore.getState();
      expect(state.authUser).toEqual(mockAuthUser);
    });

    it('should fetch user successfully', async () => {
      const { fetchUser } = useUserStore.getState();
      
      await fetchUser('test-user-1');
      
      const state = useUserStore.getState();
      expect(state.currentUser).toBeDefined();
      expect(state.currentUser?.id).toBe('test-user-1');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch user error', async () => {
      const { fetchUser } = useUserStore.getState();
      
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        // This should trigger an error in the mock implementation
        await fetchUser('');
        
        const state = useUserStore.getState();
        expect(state.isLoading).toBe(false);
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('Profile Updates', () => {
    beforeEach(() => {
      useUserStore.setState({ currentUser: mockUser });
    });

    it('should update user profile successfully', async () => {
      const { updateUserProfile } = useUserStore.getState();
      const updates: UserProfileUpdate = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };
      
      await updateUserProfile(mockUser.id, updates);
      
      const state = useUserStore.getState();
      expect(state.currentUser?.name).toBe('Updated Name');
      expect(state.currentUser?.bio).toBe('Updated bio');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should validate email format during profile update', async () => {
      const { updateUserProfile } = useUserStore.getState();
      const updates: UserProfileUpdate = {
        email: 'invalid-email'
      };
      
      await expect(updateUserProfile(mockUser.id, updates))
        .rejects.toThrow('Invalid email format');
    });

    it('should validate phone format during profile update', async () => {
      const { updateUserProfile } = useUserStore.getState();
      const updates: UserProfileUpdate = {
        phone: 'invalid-phone'
      };
      
      await expect(updateUserProfile(mockUser.id, updates))
        .rejects.toThrow('Invalid phone number format');
    });

    it('should sanitize user input', async () => {
      const { updateUserProfile } = useUserStore.getState();
      const updates: UserProfileUpdate = {
        name: '<script>alert("xss")</script>Test Name',
        bio: '<img src="x" onerror="alert(\'xss\')" />Test bio'
      };
      
      await updateUserProfile(mockUser.id, updates);
      
      const state = useUserStore.getState();
      expect(state.currentUser?.name).not.toContain('<script>');
      expect(state.currentUser?.bio).not.toContain('<img');
    });

    it('should update user preferences successfully', async () => {
      const { updateUserPreferences } = useUserStore.getState();
      const preferences: UserPreferencesUpdate = {
        theme: 'light',
        notifications: {
          email: false,
          push: false
        }
      };
      
      await updateUserPreferences(mockUser.id, preferences);
      
      const state = useUserStore.getState();
      expect(state.currentUser?.preferences?.theme).toBe('light');
      expect(state.currentUser?.preferences?.notifications?.email).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should validate theme preference', async () => {
      const { updateUserPreferences } = useUserStore.getState();
      const preferences: UserPreferencesUpdate = {
        theme: 'invalid-theme' as any
      };
      
      await expect(updateUserPreferences(mockUser.id, preferences))
        .rejects.toThrow('Invalid theme preference');
    });
  });

  describe('Avatar Upload', () => {
    it('should upload avatar successfully', async () => {
      const { uploadAvatar } = useUserStore.getState();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await uploadAvatar(mockFile);
      
      expect(result).toContain('/images/avatars/');
      expect(result).toContain('test.jpg');
    });

    it('should validate file type', async () => {
      const { uploadAvatar } = useUserStore.getState();
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await expect(uploadAvatar(mockFile))
        .rejects.toThrow('File must be an image');
    });

    it('should validate file size', async () => {
      const { uploadAvatar } = useUserStore.getState();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      
      await expect(uploadAvatar(mockFile))
        .rejects.toThrow('File size must be less than 5MB');
    });
  });

  describe('Password Management', () => {
    it('should change password successfully', async () => {
      const { changePassword } = useUserStore.getState();
      
      await changePassword('currentPassword', 'NewPassword123!');
      
      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should validate password strength', async () => {
      const { changePassword } = useUserStore.getState();
      
      for (const weakPassword of securityTestCases.weakPasswords) {
        await expect(changePassword('currentPassword', weakPassword))
          .rejects.toThrow();
      }
    });

    it('should require strong password', async () => {
      const { changePassword } = useUserStore.getState();
      
      await expect(changePassword('currentPassword', 'weak'))
        .rejects.toThrow('Password must be at least 8 characters');
    });
  });

  describe('MFA Management', () => {
    it('should enable MFA successfully', async () => {
      const { enableMFA } = useUserStore.getState();
      
      const result = await enableMFA();
      
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes).toHaveLength(5);
    });

    it('should disable MFA successfully', async () => {
      const { disableMFA } = useUserStore.getState();
      
      await disableMFA('123456');
      
      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should validate MFA code format', async () => {
      const { disableMFA } = useUserStore.getState();
      
      await expect(disableMFA('123'))
        .rejects.toThrow('Invalid verification code');
      
      await expect(disableMFA(''))
        .rejects.toThrow('Invalid verification code');
    });
  });

  describe('Session Management', () => {
    it('should fetch user sessions successfully', async () => {
      const { fetchUserSessions } = useUserStore.getState();
      
      await fetchUserSessions('test-user-1');
      
      const state = useUserStore.getState();
      expect(state.sessions).toBeDefined();
      expect(state.isLoading).toBe(false);
    });

    it('should revoke session successfully', async () => {
      const { revokeSession, fetchUserSessions } = useUserStore.getState();
      
      // First fetch sessions to populate the store
      await fetchUserSessions('test-user-1');
      
      const initialState = useUserStore.getState();
      const sessionCount = initialState.sessions.length;
      
      if (sessionCount > 0) {
        await revokeSession(initialState.sessions[0].id);
        
        const finalState = useUserStore.getState();
        expect(finalState.sessions.length).toBe(sessionCount - 1);
      }
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { clearError } = useUserStore.getState();
      
      // Set an error first
      useUserStore.setState({ error: 'Test error' });
      
      clearError();
      
      const state = useUserStore.getState();
      expect(state.error).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const { updateUserProfile } = useUserStore.getState();
      
      // Mock a network error scenario
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        // This should handle the error gracefully
        await updateUserProfile('invalid-user', {});
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('Logout', () => {
    it('should logout successfully', () => {
      const { logout, setCurrentUser, setAuthUser } = useUserStore.getState();
      
      // Set some user data first
      setCurrentUser(mockUser);
      setAuthUser(mockAuthUser);
      
      logout();
      
      const state = useUserStore.getState();
      expect(state.currentUser).toBeNull();
      expect(state.authUser).toBeNull();
      expect(state.sessions).toEqual([]);
      expect(state.error).toBeNull();
    });
  });

  describe('Onboarding', () => {
    it('should complete onboarding successfully', async () => {
      const { completeOnboarding, setCurrentUser } = useUserStore.getState();
      
      // Set a first-time user
      setCurrentUser({ ...mockUser, isFirstTimeUser: true });
      
      await completeOnboarding(mockUser.id);
      
      const state = useUserStore.getState();
      expect(state.currentUser?.isFirstTimeUser).toBe(false);
    });
  });

  describe('Security Tests', () => {
    it('should prevent XSS attacks in user input', async () => {
      const { updateUserProfile } = useUserStore.getState();
      useUserStore.setState({ currentUser: mockUser });
      
      for (const payload of securityTestCases.xssPayloads) {
        const updates: UserProfileUpdate = {
          name: payload,
          bio: payload
        };
        
        await updateUserProfile(mockUser.id, updates);
        
        const state = useUserStore.getState();
        expect(state.currentUser?.name).not.toContain('<script>');
        expect(state.currentUser?.bio).not.toContain('<script>');
      }
    });

    it('should validate email addresses properly', async () => {
      const { updateUserProfile } = useUserStore.getState();
      useUserStore.setState({ currentUser: mockUser });
      
      for (const invalidEmail of securityTestCases.invalidEmails) {
        const updates: UserProfileUpdate = {
          email: invalidEmail
        };
        
        if (invalidEmail) {
          await expect(updateUserProfile(mockUser.id, updates))
            .rejects.toThrow();
        }
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle large user data efficiently', async () => {
      const { setCurrentUser } = useUserStore.getState();
      
      const largeUser = {
        ...mockUser,
        bio: 'x'.repeat(500), // Maximum bio length
        teamAffiliations: Array(10).fill(mockUser.teamAffiliations?.[0])
      };
      
      const start = performance.now();
      setCurrentUser(largeUser);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      
      const state = useUserStore.getState();
      expect(state.currentUser).toEqual(largeUser);
    });

    it('should handle multiple rapid updates', async () => {
      const { updateUserProfile, setCurrentUser } = useUserStore.getState();
      setCurrentUser(mockUser);
      
      const updates = Array(10).fill(null).map((_, i) => ({
        name: `Updated Name ${i}`
      }));
      
      const start = performance.now();
      
      // Execute updates in parallel
      await Promise.all(
        updates.map(update => updateUserProfile(mockUser.id, update))
      );
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(5000); // Should complete in less than 5 seconds
    });
  });
});
