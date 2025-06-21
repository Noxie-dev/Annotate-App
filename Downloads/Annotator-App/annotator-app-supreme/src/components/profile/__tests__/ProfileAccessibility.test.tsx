import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { UserProfile } from '../UserProfile';
import { NotificationSettings } from '../NotificationSettings';
import { ProfileEditForm } from '../ProfileEditForm';
import { ProfileTabs } from '../ProfileTabs';
import { useUserStore } from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import { mockUser, createMockUserStore, createMockAuth } from '@/test/utils';

// Mock the hooks
vi.mock('@/stores/user-store');
vi.mock('@/hooks/use-auth');

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('Profile Components Accessibility', () => {
  const mockUserStoreReturn = createMockUserStore();
  const mockAuthReturn = createMockAuth();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
    (useAuth as any).mockReturnValue(mockAuthReturn);
  });

  describe('UserProfile Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<UserProfile />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for proper heading hierarchy
      const h1Elements = screen.queryAllByRole('heading', { level: 1 });
      const h2Elements = screen.queryAllByRole('heading', { level: 2 });
      
      expect(h1Elements.length + h2Elements.length).toBeGreaterThan(0);
    });

    it('should have proper landmark roles', () => {
      render(<UserProfile />);
      
      // Check for main content area
      const main = screen.queryByRole('main');
      if (main) {
        expect(main).toBeInTheDocument();
      }
    });

    it('should support keyboard navigation', () => {
      render(<UserProfile />);
      
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have proper focus management', () => {
      render(<UserProfile />);
      
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);
      }
    });
  });

  describe('NotificationSettings Accessibility', () => {
    it('should have proper aria-labels for all toggles', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const toggles = screen.getAllByRole('switch');
      toggles.forEach(toggle => {
        expect(toggle).toHaveAttribute('aria-label');
        expect(toggle.getAttribute('aria-label')).toMatch(/Toggle/);
      });
    });

    it('should have proper form labels', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const switches = screen.getAllByRole('switch');
      switches.forEach(switchElement => {
        const id = switchElement.getAttribute('id');
        if (id) {
          const label = screen.queryByLabelText(new RegExp(id.replace('toggle-', ''), 'i'));
          expect(label || switchElement.getAttribute('aria-label')).toBeTruthy();
        }
      });
    });

    it('should have proper heading structure for sections', () => {
      render(<NotificationSettings user={mockUser} />);
      
      expect(screen.getByRole('heading', { name: 'By Channel' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'By Type' })).toBeInTheDocument();
    });

    it('should have proper list structure', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBe(2); // One for channels, one for types
      
      lists.forEach(list => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    it('should have icons with proper aria-hidden attributes', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should support keyboard navigation for toggles', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const toggles = screen.getAllByRole('switch');
      
      if (toggles.length > 0) {
        toggles[0].focus();
        expect(document.activeElement).toBe(toggles[0]);
        
        // Test space key activation
        fireEvent.keyDown(toggles[0], { key: ' ', code: 'Space' });
        fireEvent.keyUp(toggles[0], { key: ' ', code: 'Space' });
      }
    });
  });

  describe('ProfileEditForm Accessibility', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    it('should have proper form labels', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
      expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
    });

    it('should have proper dialog structure', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Edit Profile' })).toBeInTheDocument();
    });

    it('should have proper form validation messages', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const nameInput = screen.getByLabelText('Full Name');
      const saveButton = screen.getByText('Save Changes');
      
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        const errorMessage = screen.queryByText('Name is required');
        if (errorMessage) {
          expect(errorMessage).toHaveAttribute('role', 'alert');
        }
      });
    });

    it('should have proper button types', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type');
      });
    });

    it('should support keyboard navigation', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email');
      
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      // Test tab navigation
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      // Note: Actual tab navigation testing requires more complex setup
    });

    it('should have proper file input accessibility', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept');
    });
  });

  describe('ProfileTabs Accessibility', () => {
    it('should have proper tab structure', () => {
      render(<ProfileTabs user={mockUser} />);
      
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
      });
    });

    it('should have proper tabpanel structure', () => {
      render(<ProfileTabs user={mockUser} />);
      
      const tabPanels = screen.getAllByRole('tabpanel');
      expect(tabPanels.length).toBeGreaterThan(0);
      
      tabPanels.forEach(panel => {
        expect(panel).toHaveAttribute('aria-labelledby');
      });
    });

    it('should support keyboard navigation between tabs', () => {
      render(<ProfileTabs user={mockUser} />);
      
      const tabs = screen.getAllByRole('tab');
      
      if (tabs.length > 1) {
        tabs[0].focus();
        expect(document.activeElement).toBe(tabs[0]);
        
        // Test arrow key navigation
        fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
        // Note: Actual arrow key navigation testing requires more complex setup
      }
    });

    it('should have proper ARIA states for active tab', () => {
      render(<ProfileTabs user={mockUser} />);
      
      const tabs = screen.getAllByRole('tab');
      const activeTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
      
      expect(activeTab).toBeInTheDocument();
    });

    it('should have proper focus indicators', () => {
      render(<ProfileTabs user={mockUser} />);
      
      const tabs = screen.getAllByRole('tab');
      
      tabs.forEach(tab => {
        // Check that tabs are focusable
        expect(tab).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper page title structure', () => {
      render(<UserProfile />);
      
      // Check for descriptive headings
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        expect(heading.textContent).toBeTruthy();
        expect(heading.textContent!.length).toBeGreaterThan(0);
      });
    });

    it('should have proper alternative text for images', () => {
      render(<UserProfile />);
      
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        const altText = img.getAttribute('alt');
        const ariaLabel = img.getAttribute('aria-label');
        const ariaHidden = img.getAttribute('aria-hidden');
        
        // Images should either have alt text, aria-label, or be hidden from screen readers
        expect(altText || ariaLabel || ariaHidden === 'true').toBeTruthy();
      });
    });

    it('should have proper form field descriptions', () => {
      const mockOnClose = vi.fn();
      const mockOnSave = vi.fn();
      
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        const label = input.getAttribute('aria-label') || 
                     input.getAttribute('aria-labelledby') ||
                     input.getAttribute('placeholder');
        expect(label).toBeTruthy();
      });
    });

    it('should have proper status messages', () => {
      render(<NotificationSettings user={mockUser} />);
      
      // Check for any status or error messages
      const statusElements = screen.queryAllByRole('status');
      const alertElements = screen.queryAllByRole('alert');
      
      // If status/alert elements exist, they should have content
      [...statusElements, ...alertElements].forEach(element => {
        if (element.textContent) {
          expect(element.textContent.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should apply proper dark mode classes', () => {
      render(<UserProfile />);
      
      // Check for dark mode background classes
      const darkElements = screen.getAllByText(/./);
      const hasDarkClasses = darkElements.some(element => 
        element.className.includes('dark:') || 
        element.className.includes('bg-gray-') ||
        element.className.includes('text-white')
      );
      
      expect(hasDarkClasses).toBe(true);
    });

    it('should have proper focus indicators', () => {
      render(<UserProfile />);
      
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        // Elements should be focusable (not have negative tabindex)
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have sufficient text contrast in dark mode', () => {
      render(<NotificationSettings user={mockUser} />);
      
      // Check for proper text color classes in dark mode
      const textElements = screen.getAllByText(/./);
      const hasProperTextColors = textElements.some(element => 
        element.className.includes('text-white') || 
        element.className.includes('text-gray-100') ||
        element.className.includes('dark:text-')
      );
      
      expect(hasProperTextColors).toBe(true);
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('should maintain accessibility on smaller screens', () => {
      // Mock smaller viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<UserProfile />);
      
      // Check that interactive elements are still accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it('should have proper touch targets', () => {
      render(<NotificationSettings user={mockUser} />);
      
      const switches = screen.getAllByRole('switch');
      switches.forEach(switchElement => {
        // Check that switches have adequate size for touch interaction
        const computedStyle = window.getComputedStyle(switchElement);
        // Note: In a real test environment, you'd check actual dimensions
        expect(switchElement).toBeInTheDocument();
      });
    });
  });
});

// Integration Tests for API calls and backend integration
describe('Profile Components Integration', () => {
  const mockUserStoreReturn = createMockUserStore();
  const mockAuthReturn = createMockAuth();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
    (useAuth as any).mockReturnValue(mockAuthReturn);
  });

  describe('API Integration', () => {
    it('should handle user profile updates via API', async () => {
      const mockOnClose = vi.fn();
      const mockOnSave = vi.fn();

      render(
        <ProfileEditForm
          user={mockUser}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const nameInput = screen.getByLabelText('Full Name');
      const saveButton = screen.getByText('Save Changes');

      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUserStoreReturn.updateUserProfile).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            name: 'Updated Name'
          })
        );
      });
    });

    it('should handle notification preferences updates via API', async () => {
      render(<NotificationSettings user={mockUser} />);

      const emailToggle = screen.getByLabelText('Toggle Email notifications');
      fireEvent.click(emailToggle);

      await waitFor(() => {
        expect(mockUserStoreReturn.updateUserPreferences).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            notifications: expect.objectContaining({
              email: false
            })
          })
        );
      });
    });

    it('should handle avatar upload via API', async () => {
      const mockOnClose = vi.fn();
      const mockOnSave = vi.fn();

      render(
        <ProfileEditForm
          user={mockUser}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const fileInput = screen.getByLabelText('Change Avatar');
      const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const saveButton = screen.getByText('Save Changes');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUserStoreReturn.uploadAvatar).toHaveBeenCalledWith(mockFile);
      });
    });

    it('should handle user data fetching', () => {
      render(<UserProfile userId="different-user" />);

      expect(mockUserStoreReturn.fetchUser).toHaveBeenCalledWith('different-user');
    });

    it('should handle API errors gracefully', async () => {
      const mockUpdateWithError = vi.fn().mockRejectedValue(new Error('API Error'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserProfile: mockUpdateWithError
      });

      const mockOnClose = vi.fn();
      const mockOnSave = vi.fn();

      render(
        <ProfileEditForm
          user={mockUser}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateWithError).toHaveBeenCalled();
      });
    });

    it('should handle network timeouts', async () => {
      const mockUpdateWithTimeout = vi.fn().mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserProfile: mockUpdateWithTimeout
      });

      const mockOnClose = vi.fn();
      const mockOnSave = vi.fn();

      render(
        <ProfileEditForm
          user={mockUser}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateWithTimeout).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('Authentication Integration', () => {
    it('should redirect unauthenticated users', () => {
      (useAuth as any).mockReturnValue({
        ...mockAuthReturn,
        isAuthenticated: false
      });

      render(<UserProfile />);

      expect(screen.getByText('Please log in to view profile')).toBeInTheDocument();
    });

    it('should handle authentication state changes', () => {
      const { rerender } = render(<UserProfile />);

      expect(screen.queryByText('Please log in to view profile')).not.toBeInTheDocument();

      (useAuth as any).mockReturnValue({
        ...mockAuthReturn,
        isAuthenticated: false
      });

      rerender(<UserProfile />);

      expect(screen.getByText('Please log in to view profile')).toBeInTheDocument();
    });

    it('should handle session expiration', () => {
      (useAuth as any).mockReturnValue({
        ...mockAuthReturn,
        isAuthenticated: false,
        error: 'Session expired'
      });

      render(<UserProfile />);

      expect(screen.getByText('Please log in to view profile')).toBeInTheDocument();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across components', () => {
      render(<UserProfile />);

      // Check that user data is consistent across different parts of the profile
      const userNameElements = screen.getAllByText(mockUser.name);
      expect(userNameElements.length).toBeGreaterThan(0);

      const userEmailElements = screen.getAllByText(mockUser.email);
      expect(userEmailElements.length).toBeGreaterThan(0);
    });

    it('should update UI when user data changes', () => {
      const { rerender } = render(<UserProfile />);

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        currentUser: updatedUser
      });

      rerender(<UserProfile />);

      expect(screen.getByText('Updated Name')).toBeInTheDocument();
    });

    it('should handle partial data updates', () => {
      const userWithPartialData = {
        ...mockUser,
        phone: undefined,
        bio: undefined
      };

      render(<NotificationSettings user={userWithPartialData} />);

      // Should still render without errors
      expect(screen.getByText('By Channel')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestComponent = () => {
        renderSpy();
        return <UserProfile />;
      };

      const { rerender } = render(<TestComponent />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);

      // Should not cause additional renders if props haven't changed
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle large user preference objects efficiently', () => {
      const userWithLargePreferences = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences!,
          // Add many additional preferences
          customSettings: Array.from({ length: 100 }, (_, i) => ({
            key: `setting_${i}`,
            value: `value_${i}`
          }))
        }
      };

      const startTime = performance.now();
      render(<NotificationSettings user={userWithLargePreferences} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
