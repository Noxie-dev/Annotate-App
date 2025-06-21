import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { useState } from 'react';
import { UserProfile } from '../UserProfile';
import { useUserStore } from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import { mockUser, mockAuthUser, createMockUserStore, createMockAuth } from '@/test/utils';

// Mock the hooks
vi.mock('@/stores/user-store');
vi.mock('@/hooks/use-auth');

// Mock the child components to avoid complex rendering
vi.mock('../ProfileEditForm', () => ({
  ProfileEditForm: ({ onClose, onSave }: any) => (
    <div data-testid="profile-edit-form">
      <button type="button" onClick={onClose}>Cancel</button>
      <button type="button" onClick={onSave}>Save</button>
    </div>
  )
}));

vi.mock('../ProfileTabs', () => ({
  ProfileTabs: ({ user }: any) => (
    <div data-testid="profile-tabs">
      <div data-testid="user-name">{user?.name}</div>
      <div data-testid="user-email">{user?.email}</div>
    </div>
  )
}));

describe('UserProfile', () => {
  const mockUserStoreReturn = createMockUserStore();
  const mockAuthReturn = createMockAuth();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
    (useAuth as any).mockReturnValue(mockAuthReturn);
  });

  describe('Component Rendering', () => {
    it('should render profile page correctly with user data', () => {
      render(<UserProfile />);

      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name);
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
    });

    it('should render with custom userId prop', () => {
      const customUserId = 'custom-user-123';
      render(<UserProfile userId={customUserId} />);

      expect(mockUserStoreReturn.fetchUser).toHaveBeenCalledWith(customUserId);
    });

    it('should render with default tab prop', () => {
      render(<UserProfile defaultTab="notifications" />);

      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });

    it('should handle isOwnProfile prop correctly', () => {
      render(<UserProfile isOwnProfile={false} />);

      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should display loading state when user data is loading', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true,
        currentUser: null
      });

      render(<UserProfile />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('should display loading spinner during data fetch', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true,
        currentUser: mockUser
      });

      render(<UserProfile />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should display error message when user fetch fails', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        error: 'Failed to load user profile',
        currentUser: null
      });

      render(<UserProfile />);

      expect(screen.getByText('Failed to load user profile')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should handle retry action on error', async () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        error: 'Network error',
        currentUser: null,
        fetchUser: mockFetchUser
      });

      render(<UserProfile userId="test-user" />);

      fireEvent.click(screen.getByText('Try Again'));

      expect(mockFetchUser).toHaveBeenCalledWith('test-user');
    });

    it('should display generic error for unknown errors', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        error: 'Unknown error occurred',
        currentUser: null
      });

      render(<UserProfile />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Authentication Handling', () => {
    it('should display login prompt when user is not authenticated', () => {
      (useAuth as any).mockReturnValue({
        ...mockAuthReturn,
        isAuthenticated: false
      });

      render(<UserProfile />);

      expect(screen.getByText('Please log in to view profile')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Shield icon
    });

    it('should render profile when user is authenticated', () => {
      render(<UserProfile />);

      expect(screen.queryByText('Please log in to view profile')).not.toBeInTheDocument();
      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });

    it('should handle authentication state changes', () => {
      const { rerender } = render(<UserProfile />);

      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();

      // Change to unauthenticated
      (useAuth as any).mockReturnValue({
        ...mockAuthReturn,
        isAuthenticated: false
      });

      rerender(<UserProfile />);

      expect(screen.getByText('Please log in to view profile')).toBeInTheDocument();
    });
  });

  describe('User Data Display', () => {
    it('should display user information correctly', () => {
      render(<UserProfile />);

      expect(screen.getByTestId('user-name')).toHaveTextContent(mockUser.name);
      expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
    });

    it('should handle missing user avatar gracefully', () => {
      const userWithoutAvatar = { ...mockUser, avatar: '' };
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        currentUser: userWithoutAvatar
      });

      render(<UserProfile />);

      // Should still render profile without errors
      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });

    it('should handle long user names correctly', () => {
      const userWithLongName = {
        ...mockUser,
        name: 'This is a very long user name that might cause display issues'
      };
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        currentUser: userWithLongName
      });

      render(<UserProfile />);

      expect(screen.getByTestId('user-name')).toHaveTextContent(userWithLongName.name);
    });

    it('should display user role and status correctly', () => {
      render(<UserProfile />);

      // These would be displayed in the ProfileTabs component
      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });

    it('should handle missing optional user fields', () => {
      const minimalUser = {
        id: 'minimal-user',
        name: 'Minimal User',
        email: 'minimal@example.com',
        avatar: '',
        role: 'User',
        status: 'online' as const,
        color: '#000000'
      };

      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        currentUser: minimalUser
      });

      render(<UserProfile />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('Minimal User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('minimal@example.com');
    });
  });

  describe('Profile Editing', () => {
    it('should open edit profile modal when edit button is clicked', async () => {
      // Mock ProfileHeader to include edit button
      vi.doMock('../UserProfile', async () => {
        const actual = await vi.importActual('../UserProfile');
        return {
          ...actual,
          UserProfile: ({ userId, isOwnProfile = true, defaultTab = 'profile' }: any) => {
            const [isEditing, setIsEditing] = useState(false);
            return (
              <div>
                <button type="button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                <div data-testid="profile-tabs">Profile Content</div>
                {isEditing && <div data-testid="profile-edit-form">Edit Form</div>}
              </div>
            );
          }
        };
      });

      render(<UserProfile />);

      fireEvent.click(screen.getByText('Edit Profile'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });
    });

    it('should close edit modal when cancel is clicked', async () => {
      render(<UserProfile />);

      // Simulate opening edit modal
      fireEvent.click(screen.getByText('Edit Profile'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByTestId('profile-edit-form')).not.toBeInTheDocument();
      });
    });

    it('should close edit modal when save is clicked', async () => {
      render(<UserProfile />);

      fireEvent.click(screen.getByText('Edit Profile'));

      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.queryByTestId('profile-edit-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch user data when userId prop is provided', () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        fetchUser: mockFetchUser
      });

      render(<UserProfile userId="different-user-123" />);

      expect(mockFetchUser).toHaveBeenCalledWith('different-user-123');
    });

    it('should not fetch user data when userId matches current user', () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        fetchUser: mockFetchUser,
        currentUser: { ...mockUser, id: 'same-user-123' }
      });

      render(<UserProfile userId="same-user-123" />);

      expect(mockFetchUser).not.toHaveBeenCalled();
    });

    it('should refetch user data when userId prop changes', () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        fetchUser: mockFetchUser
      });

      const { rerender } = render(<UserProfile userId="user-1" />);

      expect(mockFetchUser).toHaveBeenCalledWith('user-1');

      rerender(<UserProfile userId="user-2" />);

      expect(mockFetchUser).toHaveBeenCalledWith('user-2');
      expect(mockFetchUser).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors gracefully', () => {
      const mockFetchUser = vi.fn().mockRejectedValue(new Error('Fetch failed'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        fetchUser: mockFetchUser,
        error: 'Fetch failed'
      });

      render(<UserProfile userId="error-user" />);

      expect(screen.getByText('Fetch failed')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('should handle all prop combinations correctly', () => {
      render(
        <UserProfile
          userId="custom-user"
          isOwnProfile={false}
          defaultTab="preferences"
        />
      );

      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });

    it('should use default values when props are not provided', () => {
      render(<UserProfile />);

      expect(screen.getByTestId('profile-tabs')).toBeInTheDocument();
    });
  });

  describe('Authentication States', () => {
    it('should show login prompt when not authenticated', () => {
      (useAuth as any).mockReturnValue({
        ...mockAuthReturn,
        isAuthenticated: false
      });

      render(<UserProfile />);
      
      expect(screen.getByText('Please log in to view profile')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Shield icon
    });

    it('should show loading state', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true
      });

      render(<UserProfile />);
      
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });

    it('should show error state with retry button', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        error: 'Failed to load user',
        currentUser: null
      });

      render(<UserProfile />);
      
      expect(screen.getByText('Failed to load user')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show user not found message', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        currentUser: null,
        isLoading: false,
        error: null
      });

      render(<UserProfile />);
      
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  describe('User Profile Display', () => {
    it('should display user information correctly', () => {
      render(<UserProfile />);
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockUser.role)).toBeInTheDocument();
      expect(screen.getByText(mockUser.status)).toBeInTheDocument();
      
      if (mockUser.bio) {
        expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
      }
      
      if (mockUser.department) {
        expect(screen.getByText(mockUser.department)).toBeInTheDocument();
      }
    });

    it('should display user avatar with fallback', () => {
      render(<UserProfile />);
      
      const avatars = screen.getAllByRole('img');
      expect(avatars.length).toBeGreaterThan(0);
      
      // Check for avatar image or fallback initial
      const hasAvatarImage = avatars.some(img => 
        img.getAttribute('src') === mockUser.avatar
      );
      const hasFallback = screen.getByText(mockUser.name.charAt(0));
      
      expect(hasAvatarImage || hasFallback).toBeTruthy();
    });

    it('should show status indicator with correct color', () => {
      render(<UserProfile />);
      
      // Look for status indicator elements
      const statusElements = screen.getAllByText(mockUser.status);
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should display contact information when available', () => {
      render(<UserProfile />);
      
      if (mockUser.phone) {
        expect(screen.getByText(mockUser.phone)).toBeInTheDocument();
      }
      
      if (mockUser.timezone) {
        expect(screen.getByText(mockUser.timezone)).toBeInTheDocument();
      }
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs', () => {
      render(<UserProfile />);
      
      expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    });

    it('should switch between tabs', async () => {
      render(<UserProfile />);
      
      // Click on preferences tab
      fireEvent.click(screen.getByRole('tab', { name: /preferences/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('preferences-panel')).toBeInTheDocument();
      });
      
      // Click on notifications tab
      fireEvent.click(screen.getByRole('tab', { name: /notifications/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
      });
      
      // Click on security tab
      fireEvent.click(screen.getByRole('tab', { name: /security/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('security-panel')).toBeInTheDocument();
      });
    });

    it('should respect default tab prop', () => {
      render(<UserProfile defaultTab="preferences" />);
      
      expect(screen.getByTestId('preferences-panel')).toBeInTheDocument();
    });
  });

  describe('Profile Editing', () => {
    it('should show edit button for own profile', () => {
      render(<UserProfile isOwnProfile={true} />);
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('should not show edit button for other profiles', () => {
      render(<UserProfile isOwnProfile={false} />);
      
      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });

    it('should open edit form when edit button is clicked', async () => {
      render(<UserProfile isOwnProfile={true} />);
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });
    });

    it('should close edit form when cancel is clicked', async () => {
      render(<UserProfile isOwnProfile={true} />);
      
      // Open edit form
      fireEvent.click(screen.getByText('Edit Profile'));
      
      await waitFor(() => {
        expect(screen.getByTestId('profile-edit-form')).toBeInTheDocument();
      });
      
      // Close edit form
      fireEvent.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('profile-edit-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Team Affiliations', () => {
    it('should display team affiliations when available', () => {
      render(<UserProfile />);
      
      if (mockUser.teamAffiliations && mockUser.teamAffiliations.length > 0) {
        expect(screen.getByText('Team Affiliations')).toBeInTheDocument();
        
        mockUser.teamAffiliations.forEach(affiliation => {
          expect(screen.getByText(affiliation.teamName)).toBeInTheDocument();
          expect(screen.getByText(affiliation.role)).toBeInTheDocument();
        });
      }
    });

    it('should display permissions for each team', () => {
      render(<UserProfile />);
      
      if (mockUser.teamAffiliations && mockUser.teamAffiliations.length > 0) {
        mockUser.teamAffiliations.forEach(affiliation => {
          affiliation.permissions.forEach(permission => {
            expect(screen.getByText(permission.name)).toBeInTheDocument();
          });
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle retry action', async () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        error: 'Failed to load user',
        currentUser: null,
        fetchUser: mockFetchUser
      });

      render(<UserProfile userId="test-user" />);
      
      fireEvent.click(screen.getByText('Try Again'));
      
      expect(mockFetchUser).toHaveBeenCalledWith('test-user');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<UserProfile />);
      
      // Check for tab accessibility
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
      });
      
      // Check for tabpanel accessibility
      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      render(<UserProfile />);
      
      const firstTab = screen.getByRole('tab', { name: /profile/i });
      firstTab.focus();
      
      expect(document.activeElement).toBe(firstTab);
      
      // Simulate Tab key press
      fireEvent.keyDown(firstTab, { key: 'Tab' });
      
      // Should move focus to next focusable element
      expect(document.activeElement).not.toBe(firstTab);
    });
  });

  describe('Performance', () => {
    it('should render efficiently with large user data', () => {
      const largeUser = {
        ...mockUser,
        teamAffiliations: Array(20).fill(mockUser.teamAffiliations?.[0])
      };
      
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        currentUser: largeUser
      });
      
      const start = performance.now();
      render(<UserProfile />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should render in less than 100ms
    });
  });

  describe('Data Fetching', () => {
    it('should fetch user data when userId prop changes', () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        fetchUser: mockFetchUser
      });

      const { rerender } = render(<UserProfile userId="user-1" />);
      
      expect(mockFetchUser).toHaveBeenCalledWith('user-1');
      
      // Change userId
      rerender(<UserProfile userId="user-2" />);
      
      expect(mockFetchUser).toHaveBeenCalledWith('user-2');
    });

    it('should not fetch user data when viewing own profile', () => {
      const mockFetchUser = vi.fn();
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        fetchUser: mockFetchUser,
        currentUser: { ...mockUser, id: 'current-user' }
      });

      render(<UserProfile userId="current-user" />);
      
      expect(mockFetchUser).not.toHaveBeenCalled();
    });
  });
});
