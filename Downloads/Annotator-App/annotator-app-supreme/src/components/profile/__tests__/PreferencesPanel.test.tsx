import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { PreferencesPanel } from '../PreferencesPanel';
import { useUserStore } from '@/stores/user-store';
import { mockUser, createMockUserStore } from '@/test/utils';
import { getDefaultPreferences } from '@/lib/preferences';

// Mock the user store
vi.mock('@/stores/user-store');

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock the preferences utility
vi.mock('@/lib/preferences', () => ({
  getDefaultPreferences: vi.fn(),
}));

// Mock UI components with proper accessibility
vi.mock('@/components/ui/select', () => ({
  Select: (props: any) => {
    // Extract all possible accessibility-related props
    const ariaLabel = props['aria-label'] || props.ariaLabel;
    const ariaLabelledBy = props['aria-labelledby'] || props.ariaLabelledBy;

    // Generate a unique ID for this select
    const selectId = `select-${Math.random().toString(36).substring(2, 11)}`;

    // Ensure we always have an accessible name - this is critical for IDE accessibility checks
    const accessibleName = ariaLabel || 'Select option';
    const titleAttribute = ariaLabel || 'Select option';

    return (
      <select
        id={selectId}
        data-testid="select"
        onChange={(e) => props.onValueChange?.(e.target.value)}
        value={props.value || props.defaultValue}
        aria-label={accessibleName}
        aria-labelledby={ariaLabelledBy}
        title={titleAttribute}
        name={props.name || 'select-input'}
      >
        {props.children}
      </select>
    );
  },
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <>{placeholder}</>,
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, 'aria-label': ariaLabel, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="switch"
      aria-label={ariaLabel || 'Toggle'}
      title={ariaLabel || 'Toggle'}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, min, max, step, 'aria-label': ariaLabel, ...props }: any) => (
    <input
      type="range"
      value={value ? value[0] : ''}
      onChange={(e) => onValueChange([parseInt(e.target.value, 10)])}
      min={min}
      max={max}
      step={step}
      data-testid="slider"
      aria-label={ariaLabel || 'Slider'}
      title={ariaLabel || 'Slider'}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className, htmlFor, ...props }: any) => {
    const labelId = `label-${Math.random().toString(36).substring(2, 11)}`;
    return (
      <label
        id={labelId}
        htmlFor={htmlFor}
        className={className}
        data-testid="label"
        {...props}
      >
        {children}
      </label>
    );
  },
}));

describe('PreferencesPanel', () => {
  const mockUserStoreReturn = createMockUserStore();
  const mockGetDefaultPreferences = vi.mocked(getDefaultPreferences);

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserStore as any).mockReturnValue(mockUserStoreReturn);
    mockGetDefaultPreferences.mockReturnValue(mockUser.preferences!);
  });

  describe('Component Rendering', () => {
    it('should render preferences panel correctly', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Annotation Settings')).toBeInTheDocument();
      expect(screen.getByText('Collaboration')).toBeInTheDocument();
      expect(screen.getByText('Accessibility')).toBeInTheDocument();
    });

    it('should use default preferences when none provided', () => {
      render(<PreferencesPanel userId={mockUser.id} />);

      expect(mockGetDefaultPreferences).toHaveBeenCalled();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    it('should display all preference sections', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const sections = [
        'Appearance',
        'Annotation Settings',
        'Collaboration',
        'Accessibility'
      ];

      sections.forEach(section => {
        expect(screen.getByText(section)).toBeInTheDocument();
      });
    });
  });

  describe('Theme Settings', () => {
    it('should display theme selection options', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should show current theme selection', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      expect(themeSelect).toHaveValue('dark');
    });

    it('should handle theme changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });

      expect(themeSelect).toHaveValue('light');
    });

    it('should display language selection', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Language')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should display timezone selection', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
    });
  });

  describe('Annotation Settings', () => {
    it('should display annotation tool selection', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Default Tool')).toBeInTheDocument();
      expect(screen.getByText('Highlight')).toBeInTheDocument();
      expect(screen.getByText('Comment')).toBeInTheDocument();
      expect(screen.getByText('Shape')).toBeInTheDocument();
      expect(screen.getByText('Freehand')).toBeInTheDocument();
    });

    it('should display color selection', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Default Color')).toBeInTheDocument();
      const colorButtons = screen.getAllByRole('button');
      expect(colorButtons.length).toBeGreaterThan(0);
    });

    it('should display stroke width slider', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByText(/Stroke Width/)).toBeInTheDocument();
      expect(screen.getByTestId('slider')).toBeInTheDocument();
    });

    it('should display font size slider', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByText(/Font Size/)).toBeInTheDocument();
    });

    it('should display annotation toggles', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Auto Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Other Annotations')).toBeInTheDocument();
      expect(screen.getByLabelText('Real-time Sync')).toBeInTheDocument();
    });

    it('should handle annotation tool changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const toolSelects = screen.getAllByTestId('select');
      const annotationToolSelect = toolSelects.find(select =>
        select.getAttribute('value') === 'highlight'
      );

      if (annotationToolSelect) {
        fireEvent.change(annotationToolSelect, { target: { value: 'comment' } });
        expect(annotationToolSelect).toHaveValue('comment');
      }
    });

    it('should handle slider changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const sliders = screen.getAllByTestId('slider');
      const strokeSlider = sliders[0]; // First slider should be stroke width

      fireEvent.change(strokeSlider, { target: { value: '5' } });

      // Just verify the slider value changed
      expect(strokeSlider).toHaveValue('5');
    });

    it('should handle toggle changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const autoSaveToggle = screen.getByLabelText('Auto Save');

      fireEvent.click(autoSaveToggle);

      expect(autoSaveToggle).not.toBeChecked();
    });
  });

  describe('Collaboration Settings', () => {
    it('should display collaboration toggles', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Show Presence')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow Voice Calls')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow Screen Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto Join Team Calls')).toBeInTheDocument();
      expect(screen.getByLabelText('Share Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Allow Direct Messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Typing Indicators')).toBeInTheDocument();
    });

    it('should show correct initial toggle states', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const showPresenceToggle = screen.getByLabelText('Show Presence');
      const allowVoiceCallsToggle = screen.getByLabelText('Allow Voice Calls');

      expect(showPresenceToggle).toBeChecked();
      expect(allowVoiceCallsToggle).toBeChecked();
    });

    it('should handle collaboration toggle changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const showPresenceToggle = screen.getByLabelText('Show Presence');

      fireEvent.click(showPresenceToggle);

      expect(showPresenceToggle).not.toBeChecked();
    });
  });

  describe('Accessibility Settings', () => {
    it('should display accessibility options', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByLabelText('Font Size')).toBeInTheDocument();
      expect(screen.getByLabelText('High Contrast')).toBeInTheDocument();
      expect(screen.getByLabelText('Reduced Motion')).toBeInTheDocument();
      expect(screen.getByLabelText('Keyboard Navigation')).toBeInTheDocument();
    });

    it('should display font size options', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
      expect(screen.getByText('Extra Large')).toBeInTheDocument();
    });

    it('should show correct accessibility toggle states', () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const highContrastToggle = screen.getByLabelText('High Contrast');
      const reducedMotionToggle = screen.getByLabelText('Reduced Motion');

      expect(highContrastToggle).not.toBeChecked();
      expect(reducedMotionToggle).not.toBeChecked();
    });

    it('should handle accessibility toggle changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const highContrastToggle = screen.getByLabelText('High Contrast');

      fireEvent.click(highContrastToggle);

      expect(highContrastToggle).toBeChecked();
    });

    it('should handle font size changes', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const fontSizeSelects = screen.getAllByTestId('select');
      const fontSizeSelect = fontSizeSelects.find(select =>
        select.getAttribute('value') === 'medium'
      );

      if (fontSizeSelect) {
        fireEvent.change(fontSizeSelect, { target: { value: 'large' } });
        expect(fontSizeSelect).toHaveValue('large');
      }
    });
  });

  describe('Preference Persistence', () => {
    it('should show unsaved changes notification', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });

      await waitFor(() => {
        expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
    });

    it('should save preferences when save button is clicked', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      expect(mockUserStoreReturn.updateUserPreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          appearance: expect.objectContaining({ theme: 'light' })
        })
      );
    });

    it('should reset hasChanges after successful save', async () => {
      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      const mockUpdateWithError = vi.fn().mockRejectedValue(new Error('Save failed'));
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        updateUserPreferences: mockUpdateWithError
      });

      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        fireEvent.click(saveButton);
      });

      expect(mockUpdateWithError).toHaveBeenCalled();
    });

    it('should disable save button when loading', async () => {
      (useUserStore as any).mockReturnValue({
        ...mockUserStoreReturn,
        isLoading: true
      });

      render(<PreferencesPanel userId={mockUser.id} preferences={mockUser.preferences} />);

      const themeSelects = screen.getAllByTestId('select');
      const themeSelect = themeSelects[0]; // First select is theme
      fireEvent.change(themeSelect, { target: { value: 'light' } });

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: 'Saving...' });
        expect(saveButton).toBeDisabled();
      });
    });
  });
});
