import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  User, 
  UserPreferences, 
  UserProfileUpdate, 
  UserPreferencesUpdate,
  AuthUser,
  UserSession 
} from '@/types';

interface UserState {
  // Current user data
  currentUser: User | null;
  authUser: AuthUser | null;
  users: User[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Session management
  sessions: UserSession[];
  
  // Actions
  setCurrentUser: (user: User) => void;
  setAuthUser: (authUser: AuthUser) => void;
  updateUserProfile: (userId: string, updates: UserProfileUpdate) => Promise<void>;
  updateUserPreferences: (userId: string, preferences: UserPreferencesUpdate) => Promise<void>;
  completeOnboarding: (userId: string) => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enableMFA: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  disableMFA: (code: string) => Promise<void>;
  fetchUserSessions: (userId: string) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      authUser: null,
      users: [],
      isLoading: false,
      error: null,
      sessions: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      setAuthUser: (authUser) => set({ authUser }),

      updateUserProfile: async (userId, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Input validation
          if (updates.email && !isValidEmail(updates.email)) {
            throw new Error('Invalid email format');
          }
          
          if (updates.phone && !isValidPhone(updates.phone)) {
            throw new Error('Invalid phone number format');
          }

          // Sanitize inputs
          const sanitizedUpdates = sanitizeUserInput(updates);
          
          // Simulate API call with validation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { currentUser, users } = get();
          
          if (currentUser?.id === userId) {
            const updatedUser = { 
              ...currentUser, 
              ...sanitizedUpdates,
              updatedAt: new Date().toISOString()
            };
            set({ currentUser: updatedUser });
          }
          
          const updatedUsers = users.map(user => 
            user.id === userId 
              ? { ...user, ...sanitizedUpdates, updatedAt: new Date().toISOString() }
              : user
          );
          
          set({ users: updatedUsers, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateUserPreferences: async (userId, preferences) => {
        set({ isLoading: true, error: null });
        try {
          // Validate preferences
          if (preferences.theme && !['dark', 'light', 'system'].includes(preferences.theme)) {
            throw new Error('Invalid theme preference');
          }

          await new Promise(resolve => setTimeout(resolve, 800));
          
          const { currentUser } = get();
          if (currentUser?.id === userId) {
            const updatedPreferences: UserPreferences = {
              theme: preferences.theme || currentUser.preferences?.theme || 'dark',
              language: preferences.language || currentUser.preferences?.language || 'en',
              timezone: preferences.timezone || currentUser.preferences?.timezone || 'UTC',
              notifications: {
                email: true,
                push: true,
                desktop: true,
                mentions: true,
                documentUpdates: true,
                teamMessages: true,
                voiceCalls: true,
                quietHours: {
                  enabled: false,
                  startTime: '22:00',
                  endTime: '08:00'
                },
                ...currentUser.preferences?.notifications,
                ...preferences.notifications
              },
              annotation: {
                defaultTool: 'highlight',
                defaultColor: '#fbbf24',
                strokeWidth: 2,
                fontSize: 14,
                autoSave: true,
                showOtherAnnotations: true,
                realTimeSync: true,
                highlightOpacity: 0.3,
                ...currentUser.preferences?.annotation,
                ...preferences.annotation
              },
              collaboration: {
                showPresence: true,
                allowVoiceCalls: true,
                allowScreenShare: true,
                autoJoinTeamCalls: false,
                shareStatus: true,
                allowDirectMessages: true,
                showTypingIndicators: true,
                ...currentUser.preferences?.collaboration,
                ...preferences.collaboration
              },
              privacy: {
                profileVisibility: 'team',
                showOnlineStatus: true,
                allowContactByEmail: true,
                dataProcessingConsent: true,
                analyticsOptOut: false,
                shareUsageData: true,
                ...currentUser.preferences?.privacy,
                ...preferences.privacy
              },
              accessibility: {
                highContrast: false,
                reducedMotion: false,
                fontSize: 'medium',
                screenReaderOptimized: false,
                keyboardNavigation: false,
                ...currentUser.preferences?.accessibility,
                ...preferences.accessibility
              }
            };

            set({
              currentUser: {
                ...currentUser,
                preferences: updatedPreferences,
                updatedAt: new Date().toISOString()
              },
              isLoading: false
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      completeOnboarding: async (userId) => {
        await get().updateUserProfile(userId, { isFirstTimeUser: false });
      },

      fetchUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock user data - in real app, this would come from API
          const mockUser: User = {
            id: userId,
            name: 'Current User',
            email: 'user@company.com',
            avatar: '/images/user-avatar-default.jpg',
            role: 'Team Member',
            status: 'online',
            color: '#3b82f6',
            department: 'Engineering',
            joinDate: '2024-01-15',
            timezone: 'UTC-8',
            phone: '+1 (555) 123-4567',
            bio: 'Passionate about document collaboration and productivity tools.',
            isFirstTimeUser: false,
            lastLoginAt: new Date().toISOString(),
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: new Date().toISOString(),
            teamAffiliations: [
              {
                teamId: 'team-1',
                teamName: 'Product Development',
                role: 'Developer',
                joinedAt: '2024-01-15T00:00:00Z',
                permissions: [
                  { 
                    id: 'view', 
                    name: 'View Documents', 
                    description: 'View team documents', 
                    enabled: true,
                    scope: 'document'
                  },
                  { 
                    id: 'edit', 
                    name: 'Edit Documents', 
                    description: 'Edit team documents', 
                    enabled: true,
                    scope: 'document'
                  },
                  { 
                    id: 'comment', 
                    name: 'Add Comments', 
                    description: 'Add comments and annotations', 
                    enabled: true,
                    scope: 'document'
                  }
                ]
              }
            ],
            preferences: {
              theme: 'dark',
              language: 'en',
              timezone: 'UTC-8',
              notifications: {
                email: true,
                push: true,
                desktop: true,
                mentions: true,
                documentUpdates: true,
                teamMessages: true,
                voiceCalls: true,
                quietHours: {
                  enabled: false,
                  startTime: '22:00',
                  endTime: '08:00'
                }
              },
              annotation: {
                defaultTool: 'highlight',
                defaultColor: '#fbbf24',
                strokeWidth: 2,
                fontSize: 14,
                autoSave: true,
                showOtherAnnotations: true,
                realTimeSync: true,
                highlightOpacity: 0.3
              },
              collaboration: {
                showPresence: true,
                allowVoiceCalls: true,
                allowScreenShare: true,
                autoJoinTeamCalls: false,
                shareStatus: true,
                allowDirectMessages: true,
                showTypingIndicators: true
              },
              privacy: {
                profileVisibility: 'team',
                showOnlineStatus: true,
                allowContactByEmail: true,
                dataProcessingConsent: true,
                analyticsOptOut: false,
                shareUsageData: true
              },
              accessibility: {
                highContrast: false,
                reducedMotion: false,
                fontSize: 'medium',
                screenReaderOptimized: false,
                keyboardNavigation: false
              }
            }
          };
          
          set({ currentUser: mockUser, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null });
        try {
          // Validate file
          if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
          }
          
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('File size must be less than 5MB');
          }

          // Simulate file upload
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Generate mock URL
          const mockUrl = `/images/avatars/${Date.now()}-${sanitizeFileName(file.name)}`;
          
          set({ isLoading: false });
          return mockUrl;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          // Validate password strength
          if (!isStrongPassword(newPassword)) {
            throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
          }

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      enableMFA: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockResponse = {
            qrCode: 'data:image/png;base64,mock-qr-code',
            backupCodes: [
              'ABC123DEF456',
              'GHI789JKL012',
              'MNO345PQR678',
              'STU901VWX234',
              'YZA567BCD890'
            ]
          };
          
          set({ isLoading: false });
          return mockResponse;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to enable MFA';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      disableMFA: async (code) => {
        set({ isLoading: true, error: null });
        try {
          if (!code || code.length !== 6) {
            throw new Error('Invalid verification code');
          }

          await new Promise(resolve => setTimeout(resolve, 800));
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchUserSessions: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const mockSessions: UserSession[] = [
            {
              id: 'session-1',
              userId,
              deviceInfo: {
                userAgent: 'Chrome 120.0.0.0 on macOS',
                ip: '192.168.1.100',
                location: 'San Francisco, CA'
              },
              createdAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          set({ sessions: mockSessions, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sessions';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      revokeSession: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { sessions } = get();
          const updatedSessions = sessions.filter(session => session.id !== sessionId);
          
          set({ sessions: updatedSessions, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to revoke session';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      logout: () => {
        set({
          currentUser: null,
          authUser: null,
          sessions: [],
          error: null
        });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        authUser: state.authUser
      })
    }
  )
);

// Utility functions for validation and sanitization
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

function sanitizeUserInput(input: UserProfileUpdate): UserProfileUpdate {
  const sanitized: UserProfileUpdate = {};
  
  if (input.name) {
    sanitized.name = input.name.trim().replace(/<[^>]*>/g, ''); // Remove HTML tags
  }
  
  if (input.bio) {
    sanitized.bio = input.bio.trim().replace(/<[^>]*>/g, '').substring(0, 500); // Limit length
  }
  
  if (input.phone) {
    sanitized.phone = input.phone.trim();
  }
  
  if (input.department) {
    sanitized.department = input.department.trim().replace(/<[^>]*>/g, '');
  }
  
  if (input.timezone) {
    sanitized.timezone = input.timezone.trim();
  }
  
  if (input.avatar) {
    sanitized.avatar = input.avatar.trim();
  }
  
  return sanitized;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
}
