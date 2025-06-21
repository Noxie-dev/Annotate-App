import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { NotificationSettings } from '../NotificationSettings';
import { useUserStore } from '@/stores/user-store';
import { mockUser, createMockUserStore } from '@/test/utils';

// Mock the user store
vi.mock('@/stores/user-store');

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('NotificationSettings', () => {
  const mockUserStoreReturn = createMockUserStore();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
  });

  // Add a global handler for unhandled promise rejections during tests
  const originalUnhandledRejection = process.listeners('unhandledRejection');
  beforeEach(() => {
    process.removeAllListeners('unhandledRejection');
    process.on('unhandledRejection', (reason) => {
      // Suppress unhandled rejections during error testing
      if (reason instanceof Error && reason.message === 'API Error') {
        return; // Expected error during testing
      }
      throw reason; // Re-throw unexpected errors
    });
  });

  afterEach(() => {
    process.removeAllListeners('unhandledRejection');
    originalUnhandledRejection.forEach(listener => {
      process.on('unhandledRejection', listener);
    });
  });

  describe('Component Rendering', () => {
    it('should render notification settings with correct structure', () => {
      render(<NotificationSettings user={mockUser} />);
      
      expect(screen.getByText('By Channel')).toBeInTheDocument();
      expect(screen.getByText('By Type')).toBeInTheDocument();
    });

    it('should display all notification channels', () => {
      render(<NotificationSettings user={mockUser} />);
      
      expect(screen.getByText('Email notifications')).toBeInTheDocument();
      expect(screen.getByText('Push notifications')).toBeInTheDocument();
      expect(screen.getByText('Desktop notifications')).toBeInTheDocument();
    });

    it('should display all notification types', () => {
      render(<NotificationSettings user={mockUser} />);
      
      expect(screen.getByText('Mentions')).toBeInTheDocument();
      expect(screen.getByText('Document updates')).toBeInTheDocument();
      expect(screen.getByText('Team messages')).toBeInTheDocument();
      expect(screen.getByText('Voice calls')).toBeInTheDocument();
    });

    it('should show descriptions for each setting', () => {
      render(<NotificationSettings user={mockUser} />);
      
      expect(screen.getByText('Receive notifications via email')).toBeInTheDocument();
      expect(screen.getByText('When someone @mentions you in comments or chats')).toBeInTheDocument();
      expect(screen.getByText('When documents you\'re watching are modified')).toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('should display correct initial toggle states', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      const pushToggle = screen.getByLabelText('Toggle Push notifications');
      
      expect(emailToggle).toBeChecked();
      expect(pushToggle).toBeChecked();
    });

    it('should handle missing notification preferences gracefully', () => {
      const userWithoutPreferences = { ...mockUser, preferences: undefined };
      
      render(<NotificationSettings user={userWithoutPreferences} />);
      
      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      expect(emailToggle).not.toBeChecked(); // Should default to false
    });

    it('should handle partial notification preferences', () => {
      const userWithPartialPreferences = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          notifications: { 
            email: true,
            push: false,
            desktop: false,
            mentions: false,
            documentUpdates: false,
            teamMessages: false,
            voiceCalls: false,
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '08:00'
            }
          }
        }
      };
      
      render(<NotificationSettings user={userWithPartialPreferences} />);
      
      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      const pushToggle = screen.getByLabelText('Toggle Push notifications');
      
      expect(emailToggle).toBeChecked();
      expect(pushToggle).not.toBeChecked(); // Should default to false
    });
  });

  describe('Settings Persistence', () => {
    it('should call updateUserPreferences when toggle is changed', async () => {
      render(<NotificationSettings user={mockUser} />);
      
      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      
      fireEvent.click(emailToggle);
      
      await waitFor(() => {
        expect(mockUserStoreReturn.updateUserPreferences).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            notifications: expect.objectContaining({
              email: false // Should be toggled from true to false
            })
          })
        );
      });
    });

    it('should preserve existing preferences when updating', async () => {
      render(<NotificationSettings user={mockUser} />);
      
      const mentionsToggle = screen.getByLabelText('Toggle Mentions');
      
      fireEvent.click(mentionsToggle);
      
      await waitFor(() => {
        expect(mockUserStoreReturn.updateUserPreferences).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            theme: mockUser.preferences?.theme,
            language: mockUser.preferences?.language,
            notifications: expect.objectContaining({
              email: mockUser.preferences?.notifications?.email,
              push: mockUser.preferences?.notifications?.push,
              mentions: false // Only this should change
            })
          })
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      // Create a mock that properly handles the rejection
      const mockUpdateWithError = vi.fn().mockRejectedValue(new Error('API Error'));

      // Mock console.error to suppress error logs during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserPreferences: mockUpdateWithError
      });

      render(<NotificationSettings user={mockUser} />);

      const emailToggle = screen.getByLabelText('Toggle Email notifications');

      // Click the toggle and catch any unhandled rejections
      fireEvent.click(emailToggle);

      // Wait for the mock to be called
      await waitFor(() => {
        expect(mockUpdateWithError).toHaveBeenCalled();
      });

      // Component should still be functional after error
      expect(screen.getByText('Email notifications')).toBeInTheDocument();

      // Clean up
      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should disable toggles when loading', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true
      });

      render(<NotificationSettings user={mockUser} />);
      
      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      const pushToggle = screen.getByLabelText('Toggle Push notifications');
      
      expect(emailToggle).toBeDisabled();
      expect(pushToggle).toBeDisabled();
    });

    it('should enable toggles when not loading', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      const pushToggle = screen.getByLabelText('Toggle Push notifications');
      
      expect(emailToggle).not.toBeDisabled();
      expect(pushToggle).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for all toggles', () => {
      render(<NotificationSettings user={mockUser} />);
      
      expect(screen.getByLabelText('Toggle Email notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Push notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Desktop notifications')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Mentions')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Document updates')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Team messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle Voice calls')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const channelHeading = screen.getByRole('heading', { name: 'By Channel' });
      const typeHeading = screen.getByRole('heading', { name: 'By Type' });
      
      expect(channelHeading).toBeInTheDocument();
      expect(typeHeading).toBeInTheDocument();
    });

    it('should have icons with proper aria-hidden attributes', () => {
      render(<NotificationSettings user={mockUser} />);

      // SVG icons have aria-hidden="true" attribute
      const container = screen.getByText('By Channel').closest('div');
      const svgElements = container?.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgElements?.length).toBeGreaterThan(0);
    });
  });

  describe('Structured Organization', () => {
    it('should separate notification channels from types', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const channelSection = screen.getByText('By Channel').closest('div');
      const typeSection = screen.getByText('By Type').closest('div');
      
      expect(channelSection).toBeInTheDocument();
      expect(typeSection).toBeInTheDocument();
      expect(channelSection).not.toBe(typeSection);
    });

    it('should display channels and types in separate containers', () => {
      render(<NotificationSettings user={mockUser} />);
      
      // Check that email (channel) and mentions (type) are in different sections
      const emailSetting = screen.getByText('Email notifications').closest('ul');
      const mentionsSetting = screen.getByText('Mentions').closest('ul');
      
      expect(emailSetting).not.toBe(mentionsSetting);
    });
  });

  describe('Dark Mode Theme', () => {
    it('should apply dark mode classes correctly', () => {
      render(<NotificationSettings user={mockUser} />);

      const containers = screen.getAllByRole('list');
      containers.forEach(container => {
        // Check for dark mode conditional classes
        expect(container.className).toMatch(/dark:divide-gray-700/);
      });
    });

    it('should have proper dark mode text colors', () => {
      render(<NotificationSettings user={mockUser} />);

      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        // Check for dark mode conditional text classes
        expect(heading.className).toMatch(/dark:text-white/);
      });
    });
  });
});
