import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { ProfileEditForm } from '../ProfileEditForm';
import { useUserStore } from '@/stores/user-store';
import { mockUser, createMockUserStore, createMockFile } from '@/test/utils';

// Mock the user store
vi.mock('@/stores/user-store');

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock the dialog components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

// Mock form components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form data-testid="profile-form">{children}</form>,
  FormField: ({ render }: any) => render({ field: { value: '', onChange: vi.fn() } }),
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormMessage: ({ children }: any) => <div data-testid="form-message">{children}</div>,
}));

describe('ProfileEditForm', () => {
  const mockUserStoreReturn = createMockUserStore();
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
  });

  describe('Component Rendering', () => {
    it('should render edit form dialog correctly', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Edit Profile');
      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    it('should display user information in form fields', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
    });

    it('should show avatar preview', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const avatar = screen.getByRole('img', { name: mockUser.name });
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', mockUser.avatar);
    });

    it('should display all form fields', () => {
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
  });

  describe('Form Interactions', () => {
    it('should handle input changes correctly', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const nameInput = screen.getByLabelText('Full Name');
      
      fireEvent.change(nameInput, { target: { value: 'New Name' } });
      
      expect(nameInput).toHaveValue('New Name');
    });

    it('should handle textarea changes for bio', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const bioTextarea = screen.getByLabelText('Bio');
      
      fireEvent.change(bioTextarea, { target: { value: 'New bio content' } });
      
      expect(bioTextarea).toHaveValue('New bio content');
    });

    it('should handle timezone selection', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const timezoneSelect = screen.getByLabelText('Timezone');
      
      fireEvent.change(timezoneSelect, { target: { value: 'America/New_York' } });
      
      expect(timezoneSelect).toHaveValue('America/New_York');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const nameInput = screen.getByLabelText('Full Name');
      const saveButton = screen.getByText('Save Changes');
      
      // Clear required field
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const emailInput = screen.getByLabelText('Email');
      const saveButton = screen.getByText('Save Changes');
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const phoneInput = screen.getByLabelText('Phone Number');
      const saveButton = screen.getByText('Save Changes');
      
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    it('should validate bio length', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const bioTextarea = screen.getByLabelText('Bio');
      const saveButton = screen.getByText('Save Changes');
      
      // Create a bio that's too long (over 500 characters)
      const longBio = 'a'.repeat(501);
      fireEvent.change(bioTextarea, { target: { value: longBio } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Bio must be less than 500 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Avatar Upload', () => {
    it('should handle avatar file selection', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      const mockFile = createMockFile('avatar.jpg', 'image/jpeg');
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('avatar.jpg')).toBeInTheDocument();
      });
    });

    it('should validate avatar file type', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      const invalidFile = createMockFile('document.pdf', 'application/pdf');
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('Please select a valid image file')).toBeInTheDocument();
      });
    });

    it('should validate avatar file size', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      const largeFile = createMockFile('large-avatar.jpg', 'image/jpeg', 10 * 1024 * 1024); // 10MB
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('File size must be less than 5MB')).toBeInTheDocument();
      });
    });

    it('should show avatar preview when file is selected', async () => {
      // Mock URL.createObjectURL
      const mockUrl = 'blob:mock-url';
      global.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      const mockFile = createMockFile('new-avatar.jpg', 'image/jpeg');
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        const avatar = screen.getByRole('img', { name: mockUser.name });
        expect(avatar).toHaveAttribute('src', mockUrl);
      });
    });
  });

  describe('Save and Cancel Functionality', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call updateUserProfile when form is submitted', async () => {
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

    it('should call onSave callback after successful save', async () => {
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
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should upload avatar before saving profile', async () => {
      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      const mockFile = createMockFile('new-avatar.jpg', 'image/jpeg');
      const saveButton = screen.getByText('Save Changes');
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUserStoreReturn.uploadAvatar).toHaveBeenCalledWith(mockFile);
        expect(mockUserStoreReturn.updateUserProfile).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            avatar: '/images/new-avatar.jpg' // Mock return value
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle profile update errors', async () => {
      const mockUpdateWithError = vi.fn().mockRejectedValue(new Error('Update failed'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserProfile: mockUpdateWithError
      });

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
        expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
      });
    });

    it('should handle avatar upload errors', async () => {
      const mockUploadWithError = vi.fn().mockRejectedValue(new Error('Upload failed'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        uploadAvatar: mockUploadWithError
      });

      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const fileInput = screen.getByLabelText('Change Avatar');
      const mockFile = createMockFile('avatar.jpg', 'image/jpeg');
      const saveButton = screen.getByText('Save Changes');
      
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to upload avatar')).toBeInTheDocument();
      });
    });

    it('should disable save button during loading', () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true
      });

      render(
        <ProfileEditForm 
          user={mockUser} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      );
      
      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();
    });
  });
});
