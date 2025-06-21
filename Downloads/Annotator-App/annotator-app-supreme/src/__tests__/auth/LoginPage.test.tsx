import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import LoginPage from '@/pages/auth/LoginPage';

// Mock the auth hook
vi.mock('@/hooks/use-auth');
const mockUseAuth = vi.mocked(useAuth);

// Mock the social auth service
vi.mock('@/services/social-auth', () => ({
  socialAuthService: {
    initiateOAuth: vi.fn()
  }
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()]
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      clearError: vi.fn()
    });
  });

  it('renders login form correctly', () => {
    renderLoginPage();
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your Annotator account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders social login buttons', () => {
    renderLoginPage();
    
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid email', async () => {
    renderLoginPage();
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error for empty password', async () => {
    renderLoginPage();
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('calls login function with correct data on form submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      clearError: vi.fn()
    });

    renderLoginPage();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      });
    });
  });

  it('shows loading state during login', () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      isLoading: true,
      error: null,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      clearError: vi.fn()
    });

    renderLoginPage();
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('displays error message when login fails', () => {
    mockUseAuth.mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: 'Invalid credentials',
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      clearError: vi.fn()
    });

    renderLoginPage();
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderLoginPage();
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows MFA input when MFA is required', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('MFA required'));
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      clearError: vi.fn()
    });

    renderLoginPage();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Two-Factor Authentication Code')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      register: vi.fn(),
      refreshToken: vi.fn(),
      resetPassword: vi.fn(),
      verifyEmail: vi.fn(),
      clearError: vi.fn()
    });

    renderLoginPage();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('handles remember me checkbox', () => {
    renderLoginPage();
    
    const rememberMeCheckbox = screen.getByLabelText('Remember me');
    
    expect(rememberMeCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('has accessible form labels and structure', () => {
    renderLoginPage();
    
    // Check for proper form structure
    expect(screen.getByRole('form')).toBeInTheDocument();
    
    // Check for proper labeling
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    
    // Check for proper button roles
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
  });
});
