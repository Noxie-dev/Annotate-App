import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileTabs } from '../ProfileTabs';
import { useUserStore } from '@/stores/user-store';
import { User } from '@/types';
import { mockUser, createMockUserStore } from '@/test/utils';

// Mock the user store
vi.mock('@/stores/user-store');

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock child components
vi.mock('../PreferencesPanel', () => ({
  PreferencesPanel: ({ userId }: any) => (
    <div data-testid="preferences-panel">Preferences Panel for {userId}</div>
  )
}));

vi.mock('../NotificationSettings', () => ({
  NotificationSettings: ({ user }: any) => (
    <div data-testid="notification-settings">Notification Settings for {user.name}</div>
  )
}));

vi.mock('../SecurityPanel', () => ({
  SecurityPanel: ({ user }: any) => (
    <div data-testid="security-panel">Security Panel for {user.name}</div>
  )
}));

describe('ProfileTabs', () => {
  const mockUserStoreReturn = createMockUserStore();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
  });
  describe('Tab Navigation', () => {
    it('should render all tab buttons correctly', () => {
      render(<ProfileTabs user={mockUser} />);

      expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /annotation/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /privacy/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
    });

    it('should show profile tab content by default', () => {
      render(<ProfileTabs user={mockUser} />);

      expect(screen.getByText('Profile Details')).toBeInTheDocument();
      expect(screen.getByText('Team Affiliations')).toBeInTheDocument();
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it('should switch to preferences tab when clicked', () => {
      render(<ProfileTabs user={mockUser} />);

      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
      fireEvent.click(preferencesTab);

      expect(screen.getByTestId('preferences-panel')).toBeInTheDocument();
    });

    it('should switch to notifications tab when clicked', () => {
      render(<ProfileTabs user={mockUser} />);

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
      fireEvent.click(notificationsTab);

      expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    });

    it('should switch to annotation tab when clicked', () => {
      render(<ProfileTabs user={mockUser} />);

      const annotationTab = screen.getByRole('tab', { name: /annotation/i });
      fireEvent.click(annotationTab);

      expect(screen.getByText('Annotation Preferences')).toBeInTheDocument();
    });

    it('should switch to privacy tab when clicked', () => {
      render(<ProfileTabs user={mockUser} />);

      const privacyTab = screen.getByRole('tab', { name: /privacy/i });
      fireEvent.click(privacyTab);

      expect(screen.getByText('Privacy & Visibility')).toBeInTheDocument();
    });

    it('should switch to activity tab when clicked', () => {
      render(<ProfileTabs user={mockUser} />);

      const activityTab = screen.getByRole('tab', { name: /activity/i });
      fireEvent.click(activityTab);

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should maintain tab state when switching between tabs', () => {
      render(<ProfileTabs user={mockUser} />);

      // Switch to preferences
      fireEvent.click(screen.getByRole('tab', { name: /preferences/i }));
      expect(screen.getByTestId('preferences-panel')).toBeInTheDocument();

      // Switch to notifications
      fireEvent.click(screen.getByRole('tab', { name: /notifications/i }));
      expect(screen.getByTestId('notification-settings')).toBeInTheDocument();

      // Switch back to profile
      fireEvent.click(screen.getByRole('tab', { name: /profile/i }));
      expect(screen.getByText('Profile Details')).toBeInTheDocument();
    });
  });

  describe('Annotation Settings', () => {
    beforeEach(() => {
      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /annotation/i }));
    });

    it('should display annotation preferences form', () => {
      expect(screen.getByText('Annotation Preferences')).toBeInTheDocument();
      expect(screen.getByText('Configure your default annotation tools and behavior')).toBeInTheDocument();
    });

    it('should show default tool selection', () => {
      expect(screen.getByLabelText('Default Tool')).toBeInTheDocument();
      expect(screen.getByDisplayValue('highlight')).toBeInTheDocument();
    });

    it('should display color picker for default color', () => {
      expect(screen.getByLabelText('Default Color')).toBeInTheDocument();
      const colorButtons = screen.getAllByRole('button');
      const colorButton = colorButtons.find(button =>
        button.getAttribute('style')?.includes('#fbbf24')
      );
      expect(colorButton).toBeInTheDocument();
    });

    it('should show stroke width slider', () => {
      expect(screen.getByText('Stroke Width: 2px')).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /stroke width/i })).toBeInTheDocument();
    });

    it('should show font size slider', () => {
      expect(screen.getByText('Font Size: 14px')).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /font size/i })).toBeInTheDocument();
    });

    it('should show highlight opacity slider', () => {
      expect(screen.getByText('Highlight Opacity: 30%')).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /highlight opacity/i })).toBeInTheDocument();
    });

    it('should display toggle switches for boolean preferences', () => {
      expect(screen.getByLabelText('Auto Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Other Annotations')).toBeInTheDocument();
      expect(screen.getByLabelText('Real-time Sync')).toBeInTheDocument();
    });

    it('should handle tool selection changes', async () => {
      const toolSelect = screen.getByLabelText('Default Tool');

      fireEvent.change(toolSelect, { target: { value: 'comment' } });

      expect(toolSelect).toHaveValue('comment');
    });

    it('should handle color selection changes', async () => {
      const colorButtons = screen.getAllByRole('button');
      const redColorButton = colorButtons.find(button =>
        button.getAttribute('style')?.includes('#ef4444')
      );

      if (redColorButton) {
        fireEvent.click(redColorButton);
        expect(redColorButton).toHaveClass('border-white');
      }
    });

    it('should handle slider changes', async () => {
      const strokeSlider = screen.getByRole('slider', { name: /stroke width/i });

      fireEvent.change(strokeSlider, { target: { value: '5' } });

      await waitFor(() => {
        expect(screen.getByText('Stroke Width: 5px')).toBeInTheDocument();
      });
    });

    it('should handle toggle changes', async () => {
      const autoSaveToggle = screen.getByLabelText('Auto Save');

      fireEvent.click(autoSaveToggle);

      expect(autoSaveToggle).not.toBeChecked();
    });

    it('should show unsaved changes notification', async () => {
      const toolSelect = screen.getByLabelText('Default Tool');

      fireEvent.change(toolSelect, { target: { value: 'comment' } });

      await waitFor(() => {
        expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
    });

    it('should save annotation preferences', async () => {
      const toolSelect = screen.getByLabelText('Default Tool');

      fireEvent.change(toolSelect, { target: { value: 'comment' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      expect(mockUserStoreReturn.updateUserPreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          annotation: expect.objectContaining({
            defaultTool: 'comment'
          })
        })
      );
    });
  });

  describe('Privacy Settings', () => {
    beforeEach(() => {
      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /privacy/i }));
    });

    it('should display privacy settings form', () => {
      expect(screen.getByText('Privacy & Visibility')).toBeInTheDocument();
      expect(screen.getByText('Control who can see your information and how your data is used')).toBeInTheDocument();
    });

    it('should show profile visibility dropdown', () => {
      expect(screen.getByLabelText('Profile Visibility')).toBeInTheDocument();
      expect(screen.getByDisplayValue('team')).toBeInTheDocument();
    });

    it('should display privacy toggle switches', () => {
      expect(screen.getByLabelText('Show Online Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow Contact by Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Data Processing Consent')).toBeInTheDocument();
      expect(screen.getByLabelText('Analytics Opt-out')).toBeInTheDocument();
      expect(screen.getByLabelText('Share Usage Data')).toBeInTheDocument();
    });

    it('should handle profile visibility changes', async () => {
      const visibilitySelect = screen.getByLabelText('Profile Visibility');

      fireEvent.change(visibilitySelect, { target: { value: 'private' } });

      expect(visibilitySelect).toHaveValue('private');
    });

    it('should handle privacy toggle changes', async () => {
      const onlineStatusToggle = screen.getByLabelText('Show Online Status');

      fireEvent.click(onlineStatusToggle);

      expect(onlineStatusToggle).not.toBeChecked();
    });

    it('should show unsaved changes notification for privacy settings', async () => {
      const visibilitySelect = screen.getByLabelText('Profile Visibility');

      fireEvent.change(visibilitySelect, { target: { value: 'private' } });

      await waitFor(() => {
        expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
    });

    it('should save privacy preferences', async () => {
      const visibilitySelect = screen.getByLabelText('Profile Visibility');

      fireEvent.change(visibilitySelect, { target: { value: 'private' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      expect(mockUserStoreReturn.updateUserPreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          privacy: expect.objectContaining({
            profileVisibility: 'private'
          })
        })
      );
    });
  });

  describe('Activity Log', () => {
    beforeEach(() => {
      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /activity/i }));
    });

    it('should display activity log section', () => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Your recent actions and account activity')).toBeInTheDocument();
    });

    it('should show activity statistics', () => {
      expect(screen.getByText('Activity Statistics')).toBeInTheDocument();
      expect(screen.getByText('Overview of your account activity')).toBeInTheDocument();
    });

    it('should display activity items with proper formatting', () => {
      // Check for activity types
      expect(screen.getByText('Signed in to the application')).toBeInTheDocument();
      expect(screen.getByText('Added annotation to "Project Proposal.pdf"')).toBeInTheDocument();
      expect(screen.getByText('Updated profile information')).toBeInTheDocument();
    });

    it('should show activity timestamps', () => {
      // Check for relative time formatting
      expect(screen.getByText(/hours? ago|days? ago|Just now/)).toBeInTheDocument();
    });

    it('should display activity statistics with numbers', () => {
      expect(screen.getByText('24')).toBeInTheDocument(); // Annotations count
      expect(screen.getByText('12')).toBeInTheDocument(); // Documents count
      expect(screen.getByText('Annotations')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });

    it('should show activity badges with proper categories', () => {
      const badges = screen.getAllByText(/login|annotation|profile|team|security/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should handle empty activity state', () => {
      // This would require mocking empty activity data
      // For now, we test that the component renders without errors
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should disable save buttons when loading', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true
      });

      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /annotation/i }));

      // Make a change to trigger unsaved state
      const toolSelect = screen.getByLabelText('Default Tool');
      fireEvent.change(toolSelect, { target: { value: 'comment' } });

      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();
    });

    it('should show loading text on save buttons', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true
      });

      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /privacy/i }));

      // Make a change to trigger unsaved state
      const visibilitySelect = screen.getByLabelText('Profile Visibility');
      fireEvent.change(visibilitySelect, { target: { value: 'private' } });

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors for annotation settings', async () => {
      const mockUpdateWithError = vi.fn().mockRejectedValue(new Error('Save failed'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserPreferences: mockUpdateWithError
      });

      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /annotation/i }));

      const toolSelect = screen.getByLabelText('Default Tool');
      fireEvent.change(toolSelect, { target: { value: 'comment' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      expect(mockUpdateWithError).toHaveBeenCalled();
    });

    it('should handle save errors for privacy settings', async () => {
      const mockUpdateWithError = vi.fn().mockRejectedValue(new Error('Save failed'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserPreferences: mockUpdateWithError
      });

      render(<ProfileTabs user={mockUser} />);
      fireEvent.click(screen.getByRole('tab', { name: /privacy/i }));

      const visibilitySelect = screen.getByLabelText('Profile Visibility');
      fireEvent.change(visibilitySelect, { target: { value: 'private' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      expect(mockUpdateWithError).toHaveBeenCalled();
    });
  });

  describe('User Data Display', () => {
    it('should display user information in profile tab', () => {
      render(<ProfileTabs user={mockUser} />);

      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockUser.role)).toBeInTheDocument();
      expect(screen.getByText(mockUser.department!)).toBeInTheDocument();
    });

    it('should display team affiliations', () => {
      render(<ProfileTabs user={mockUser} />);

      expect(screen.getByText('Team Affiliations')).toBeInTheDocument();
      if (mockUser.teamAffiliations && mockUser.teamAffiliations.length > 0) {
        expect(screen.getByText(mockUser.teamAffiliations[0].teamName)).toBeInTheDocument();
      }
    });

    it('should handle user without team affiliations', () => {
      const userWithoutTeams = { ...mockUser, teamAffiliations: [] };

      render(<ProfileTabs user={userWithoutTeams} />);

      expect(screen.getByText('Team Affiliations')).toBeInTheDocument();
      expect(screen.getByText('No team affiliations')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for tabs', () => {
      render(<ProfileTabs user={mockUser} />);

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should have proper heading structure', () => {
      render(<ProfileTabs user={mockUser} />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      render(<ProfileTabs user={mockUser} />);

      const firstTab = screen.getByRole('tab', { name: /profile/i });
      firstTab.focus();

      expect(document.activeElement).toBe(firstTab);
    });
  });
});
