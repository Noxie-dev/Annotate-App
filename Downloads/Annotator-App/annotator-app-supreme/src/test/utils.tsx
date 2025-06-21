import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { User, UserPreferences, AuthUser } from '@/types';

// Mock user data for testing
export const mockUser: User = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/images/test-avatar.jpg',
  role: 'Team Member',
  status: 'online',
  color: '#3b82f6',
  department: 'Engineering',
  joinDate: '2024-01-15',
  timezone: 'UTC-8',
  phone: '+1 (555) 123-4567',
  bio: 'Test user bio',
  isFirstTimeUser: false,
  lastLoginAt: '2024-01-20T10:00:00Z',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-20T10:00:00Z',
  teamAffiliations: [
    {
      teamId: 'team-1',
      teamName: 'Test Team',
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

export const mockAuthUser: AuthUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  emailVerified: true,
  name: 'Test User',
  avatar: '/images/test-avatar.jpg',
  role: {
    id: 'team-member',
    name: 'Team Member',
    description: 'Standard team member',
    permissions: ['view_documents', 'edit_documents'],
    level: 1
  },
  permissions: ['view_documents', 'edit_documents'],
  sessionId: 'test-session-123',
  lastLoginAt: '2024-01-20T10:00:00Z',
  mfaEnabled: false
};

// Mock Zustand store
export const createMockUserStore = (initialState = {}) => ({
  currentUser: mockUser,
  authUser: mockAuthUser,
  users: [mockUser],
  isLoading: false,
  error: null,
  sessions: [],
  setCurrentUser: vi.fn(),
  setAuthUser: vi.fn(),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  updateUserPreferences: vi.fn().mockResolvedValue(undefined),
  completeOnboarding: vi.fn().mockResolvedValue(undefined),
  fetchUser: vi.fn().mockResolvedValue(undefined),
  uploadAvatar: vi.fn().mockResolvedValue('/images/new-avatar.jpg'),
  changePassword: vi.fn().mockResolvedValue(undefined),
  enableMFA: vi.fn().mockResolvedValue({
    qrCode: 'data:image/png;base64,mock-qr',
    backupCodes: ['ABC123', 'DEF456']
  }),
  disableMFA: vi.fn().mockResolvedValue(undefined),
  fetchUserSessions: vi.fn().mockResolvedValue(undefined),
  revokeSession: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  logout: vi.fn(),
  ...initialState
});

// Mock auth hook
export const createMockAuth = (overrides = {}) => ({
  isAuthenticated: true,
  isLoading: false,
  user: mockAuthUser,
  error: null,
  login: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn().mockResolvedValue(undefined),
  resetPassword: vi.fn().mockResolvedValue({ message: 'Reset email sent' }),
  verifyEmail: vi.fn().mockResolvedValue({ message: 'Email verified' }),
  clearError: vi.fn(),
  ...overrides
});

// Mock permissions hook
export const createMockPermissions = (overrides = {}) => ({
  hasPermission: vi.fn().mockReturnValue(true),
  hasRole: vi.fn().mockReturnValue(true),
  hasMinimumRole: vi.fn().mockReturnValue(true),
  permissions: ['view_documents', 'edit_documents'],
  role: mockAuthUser.role,
  ...overrides
});

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper functions for testing
export const createMockFile = (
  name = 'test.jpg',
  type = 'image/jpeg',
  size = 1024
): File => {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

export const createMockEvent = (type: string, data: any = {}) => ({
  type,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: { value: '', ...data },
  currentTarget: { value: '', ...data },
  ...data
});

export const waitForLoadingToFinish = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

// Mock toast function
export const mockToast = vi.fn();

// Mock form validation
export const mockFormValidation = {
  isValid: true,
  errors: {},
  trigger: vi.fn().mockResolvedValue(true),
  getValues: vi.fn().mockReturnValue({}),
  setValue: vi.fn(),
  watch: vi.fn(),
  reset: vi.fn(),
  handleSubmit: vi.fn((fn) => (e: any) => {
    e?.preventDefault?.();
    return fn({});
  })
};

// Security test helpers
export const securityTestCases = {
  xssPayloads: [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(\'xss\')" />',
    '"><script>alert("xss")</script>',
    '\';alert("xss");//'
  ],
  sqlInjectionPayloads: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "admin'--",
    "' UNION SELECT * FROM users --"
  ],
  invalidEmails: [
    'invalid-email',
    '@domain.com',
    'user@',
    'user..name@domain.com',
    'user@domain',
    ''
  ],
  weakPasswords: [
    '123456',
    'password',
    'qwerty',
    '12345678',
    'abc123',
    'password123'
  ]
};

// Performance test helpers
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    await waitForLoadingToFinish();
    const end = performance.now();
    return end - start;
  },
  
  measureMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
};

// Accessibility test helpers
export const a11yHelpers = {
  checkAriaLabels: (container: HTMLElement) => {
    const elementsNeedingLabels = container.querySelectorAll(
      'input, button, select, textarea'
    );
    const missingLabels: Element[] = [];
    
    elementsNeedingLabels.forEach(element => {
      const hasAriaLabel = element.hasAttribute('aria-label');
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
      const hasAssociatedLabel = element.id && 
        container.querySelector(`label[for="${element.id}"]`);
      
      if (!hasAriaLabel && !hasAriaLabelledBy && !hasAssociatedLabel) {
        missingLabels.push(element);
      }
    });
    
    return missingLabels;
  },
  
  checkKeyboardNavigation: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return Array.from(focusableElements).every(element => {
      const tabIndex = element.getAttribute('tabindex');
      return tabIndex !== '-1';
    });
  }
};
