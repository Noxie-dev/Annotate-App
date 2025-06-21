import { 
  User, 
  UserProfileUpdate, 
  UserPreferencesUpdate, 
  AuthUser, 
  UserSession 
} from '@/types';
import { validators, sanitizers, errorMessages } from '@/lib/security';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000; // 10 seconds

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP client with security headers
class HttpClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add security headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };

    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Add auth token if available
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const httpClient = new HttpClient();

// User service functions
export const userService = {
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      return await httpClient.get<User>('/users/me');
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUser(userId: string): Promise<User> {
    if (!userId) {
      throw new ApiError('User ID is required', 400, 'INVALID_INPUT');
    }

    try {
      return await httpClient.get<User>(`/users/${userId}`);
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: UserProfileUpdate): Promise<User> {
    // Validate input
    if (!userId) {
      throw new ApiError('User ID is required', 400, 'INVALID_INPUT');
    }

    // Validate and sanitize updates
    const validatedUpdates = this.validateProfileUpdate(updates);
    const sanitizedUpdates = this.sanitizeProfileUpdate(validatedUpdates);

    try {
      return await httpClient.patch<User>(`/users/${userId}`, sanitizedUpdates);
    } catch (error) {
      console.error(`Failed to update user profile ${userId}:`, error);
      throw error;
    }
  },

  // Update user preferences
  async updatePreferences(userId: string, preferences: UserPreferencesUpdate): Promise<User> {
    if (!userId) {
      throw new ApiError('User ID is required', 400, 'INVALID_INPUT');
    }

    // Validate preferences
    const validatedPreferences = this.validatePreferencesUpdate(preferences);

    try {
      return await httpClient.patch<User>(`/users/${userId}/preferences`, validatedPreferences);
    } catch (error) {
      console.error(`Failed to update user preferences ${userId}:`, error);
      throw error;
    }
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    // Validate file
    if (!validators.fileType(file, ['image/'])) {
      throw new ApiError(errorMessages.INVALID_FILE_TYPE, 400, 'INVALID_FILE_TYPE');
    }

    if (!validators.fileSize(file, 5)) { // 5MB limit
      throw new ApiError(errorMessages.FILE_TOO_LARGE, 400, 'FILE_TOO_LARGE');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
        }
      });

      if (!response.ok) {
        throw new ApiError('Failed to upload avatar', response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Validate passwords
    if (!currentPassword || !newPassword) {
      throw new ApiError('Current and new passwords are required', 400, 'INVALID_INPUT');
    }

    const passwordValidation = validators.password(newPassword);
    if (!passwordValidation.isValid) {
      throw new ApiError(passwordValidation.errors.join(', '), 400, 'WEAK_PASSWORD');
    }

    try {
      await httpClient.post('/users/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  // Get user sessions
  async getUserSessions(userId: string): Promise<UserSession[]> {
    if (!userId) {
      throw new ApiError('User ID is required', 400, 'INVALID_INPUT');
    }

    try {
      return await httpClient.get<UserSession[]>(`/users/${userId}/sessions`);
    } catch (error) {
      console.error(`Failed to fetch user sessions ${userId}:`, error);
      throw error;
    }
  },

  // Revoke session
  async revokeSession(sessionId: string): Promise<void> {
    if (!sessionId) {
      throw new ApiError('Session ID is required', 400, 'INVALID_INPUT');
    }

    try {
      await httpClient.delete(`/sessions/${sessionId}`);
    } catch (error) {
      console.error(`Failed to revoke session ${sessionId}:`, error);
      throw error;
    }
  },

  // Enable MFA
  async enableMFA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    try {
      return await httpClient.post('/users/mfa/enable', {});
    } catch (error) {
      console.error('Failed to enable MFA:', error);
      throw error;
    }
  },

  // Disable MFA
  async disableMFA(code: string): Promise<void> {
    if (!code || code.length !== 6) {
      throw new ApiError('Valid 6-digit code is required', 400, 'INVALID_CODE');
    }

    try {
      await httpClient.post('/users/mfa/disable', { code });
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      throw error;
    }
  },

  // Validate profile update data
  validateProfileUpdate(updates: UserProfileUpdate): UserProfileUpdate {
    const errors: string[] = [];

    if (updates.name && !validators.name(updates.name)) {
      errors.push(errorMessages.INVALID_NAME);
    }

    if (updates.email && !validators.email(updates.email)) {
      errors.push(errorMessages.INVALID_EMAIL);
    }

    if (updates.phone && !validators.phone(updates.phone)) {
      errors.push(errorMessages.INVALID_PHONE);
    }

    if (updates.timezone && !validators.timezone(updates.timezone)) {
      errors.push('Invalid timezone');
    }

    if (errors.length > 0) {
      throw new ApiError(errors.join(', '), 400, 'VALIDATION_ERROR');
    }

    return updates;
  },

  // Sanitize profile update data
  sanitizeProfileUpdate(updates: UserProfileUpdate): UserProfileUpdate {
    const sanitized: UserProfileUpdate = {};

    if (updates.name) {
      sanitized.name = sanitizers.name(updates.name);
    }

    if (updates.email) {
      sanitized.email = sanitizers.email(updates.email);
    }

    if (updates.phone) {
      sanitized.phone = sanitizers.phone(updates.phone);
    }

    if (updates.bio) {
      sanitized.bio = sanitizers.bio(updates.bio);
    }

    if (updates.department) {
      sanitized.department = sanitizers.text(updates.department);
    }

    if (updates.timezone) {
      sanitized.timezone = updates.timezone;
    }

    if (updates.avatar) {
      sanitized.avatar = sanitizers.url(updates.avatar);
    }

    return sanitized;
  },

  // Validate preferences update
  validatePreferencesUpdate(preferences: UserPreferencesUpdate): UserPreferencesUpdate {
    const errors: string[] = [];

    if (preferences.theme && !['dark', 'light', 'system'].includes(preferences.theme)) {
      errors.push('Invalid theme preference');
    }

    if (preferences.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(preferences.language)) {
      errors.push('Invalid language code');
    }

    if (preferences.timezone && !validators.timezone(preferences.timezone)) {
      errors.push('Invalid timezone');
    }

    if (errors.length > 0) {
      throw new ApiError(errors.join(', '), 400, 'VALIDATION_ERROR');
    }

    return preferences;
  }
};

// ApiError is already exported above
