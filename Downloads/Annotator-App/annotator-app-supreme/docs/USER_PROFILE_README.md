# User Profile Feature

A comprehensive user profile system for the Annotator-App with advanced security, performance optimizations, and modern React patterns.

## 🚀 Features

### Core Functionality
- **Complete Profile Management**: Full user profile with avatar, contact info, and bio
- **Advanced Preferences**: Theme, language, notifications, annotation settings
- **Security Settings**: Password management, 2FA, session monitoring
- **Team Integration**: Team affiliations and role-based permissions

### Security Features
- **Input Validation**: Comprehensive client-side and server-side validation
- **XSS Protection**: DOMPurify sanitization and CSP headers
- **CSRF Protection**: Token-based protection for state changes
- **Authentication**: JWT tokens with automatic refresh
- **Multi-Factor Auth**: TOTP-based 2FA with backup codes
- **Session Security**: Secure session management with monitoring

### Performance Features
- **Lazy Loading**: Code-split components for optimal bundle size
- **Caching**: Intelligent caching with TTL and invalidation
- **Optimistic Updates**: Immediate UI updates with error rollback
- **Bundle Optimization**: Tree shaking and chunk splitting
- **Memory Management**: Efficient state management and cleanup

## 📁 Project Structure

```
src/components/profile/
├── UserProfile.tsx          # Main profile component
├── ProfileEditForm.tsx      # Profile editing with validation
├── PreferencesPanel.tsx     # User preferences management
├── NotificationSettings.tsx # Notification configuration
├── SecurityPanel.tsx        # Security settings and 2FA
├── ProfileDropdown.tsx      # Header dropdown component
└── index.ts                 # Lazy-loaded exports

src/stores/
└── user-store.ts           # Zustand store with persistence

src/hooks/
└── use-auth.ts             # Authentication hooks

src/services/
└── user-service.ts         # API service layer

src/lib/
├── security.ts             # Security utilities
└── performance.ts          # Performance optimizations

src/types/
└── index.ts               # TypeScript definitions
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- TypeScript 5+

### Install Dependencies
```bash
cd annotator-app-supreme
pnpm install
```

### Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Run Tests
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=https://api.annotator-app.com/v1
REACT_APP_ENABLE_ANALYTICS=true

# Security Configuration
REACT_APP_CSRF_TOKEN_HEADER=X-CSRF-Token
REACT_APP_SESSION_TIMEOUT=86400000

# Feature Flags
REACT_APP_ENABLE_MFA=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'profile-vendor': ['isomorphic-dompurify'],
          'data-vendor': ['zustand']
        }
      }
    }
  }
});
```

## 🎯 Usage Examples

### Basic Profile Display
```tsx
import { UserProfile } from '@/components/profile';

function App() {
  return (
    <UserProfile 
      userId="user-123" 
      isOwnProfile={true}
      defaultTab="profile"
    />
  );
}
```

### Profile Dropdown in Header
```tsx
import { ProfileDropdown } from '@/components/profile';

function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <ProfileDropdown />
      </nav>
    </header>
  );
}
```

### Using the User Store
```tsx
import { useUserStore } from '@/stores/user-store';

function ProfileComponent() {
  const { 
    currentUser, 
    updateUserProfile, 
    isLoading, 
    error 
  } = useUserStore();

  const handleUpdate = async (updates) => {
    try {
      await updateUserProfile(currentUser.id, updates);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {currentUser && (
        <ProfileForm 
          user={currentUser} 
          onSubmit={handleUpdate} 
        />
      )}
    </div>
  );
}
```

### Authentication Hook
```tsx
import { useAuth } from '@/hooks/use-auth';

function LoginForm() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form fields */}
    </form>
  );
}
```

## 🔒 Security Implementation

### Input Validation
```tsx
import { validators } from '@/lib/security';

// Email validation
const isValid = validators.email('user@example.com');

// Password strength check
const { isValid, errors } = validators.password('MyPassword123!');

// File validation
const isValidFile = validators.fileType(file, ['image/']);
const isValidSize = validators.fileSize(file, 5); // 5MB limit
```

### Input Sanitization
```tsx
import { sanitizers } from '@/lib/security';

// Sanitize user input
const cleanName = sanitizers.name(userInput);
const cleanBio = sanitizers.bio(userInput);
const cleanEmail = sanitizers.email(userInput);
```

### XSS Protection
```tsx
import { xssProtection } from '@/lib/security';

// Escape HTML
const safeHtml = xssProtection.escapeHtml(userInput);

// Sanitize for attributes
const safeAttr = xssProtection.sanitizeForAttribute(userInput);
```

## 📊 Performance Optimization

### Lazy Loading Components
```tsx
import { Suspense } from 'react';
import { UserProfile } from '@/components/profile';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UserProfile />
    </Suspense>
  );
}
```

### Caching with TTL
```tsx
import { userCache } from '@/lib/performance';

// Cache user data
userCache.set('user-123', userData, 300000); // 5 minutes TTL

// Retrieve cached data
const cachedUser = userCache.get('user-123');

// Invalidate cache
userCache.invalidate('user-123');
```

### Performance Monitoring
```tsx
import { usePerformanceMonitor } from '@/lib/performance';

function ProfileComponent() {
  const { startMeasure, endMeasure, getMetrics } = usePerformanceMonitor('profile-render');

  useEffect(() => {
    startMeasure();
    // Component logic
    const duration = endMeasure();
    console.log('Render time:', duration);
  }, []);

  return <div>Profile Content</div>;
}
```

## 🧪 Testing

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@/test/utils';
import { UserProfile } from '@/components/profile/UserProfile';

describe('UserProfile', () => {
  it('should display user information', () => {
    render(<UserProfile />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should handle profile updates', async () => {
    render(<UserProfile />);
    
    fireEvent.click(screen.getByText('Edit Profile'));
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});
```

### Security Tests
```tsx
import { validators, sanitizers } from '@/lib/security';
import { securityTestCases } from '@/test/utils';

describe('Security', () => {
  it('should prevent XSS attacks', () => {
    securityTestCases.xssPayloads.forEach(payload => {
      const sanitized = sanitizers.html(payload);
      expect(sanitized).not.toContain('<script>');
    });
  });

  it('should validate strong passwords', () => {
    const result = validators.password('WeakPassword');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

## 📚 API Reference

### User Store Actions
```typescript
interface UserStore {
  // State
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentUser: (user: User) => void;
  updateUserProfile: (userId: string, updates: UserProfileUpdate) => Promise<void>;
  updateUserPreferences: (userId: string, preferences: UserPreferencesUpdate) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  changePassword: (current: string, newPassword: string) => Promise<void>;
  enableMFA: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  logout: () => void;
}
```

### Authentication Hook
```typescript
interface AuthHook {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
}
```

## 🚀 Deployment

### Build Optimization
```bash
# Analyze bundle size
pnpm build:analyze

# Build with optimizations
pnpm build
```

### Environment Setup
```bash
# Production environment
NODE_ENV=production
REACT_APP_API_URL=https://api.annotator-app.com/v1
REACT_APP_ENABLE_ANALYTICS=true

# Staging environment
NODE_ENV=staging
REACT_APP_API_URL=https://api-staging.annotator-app.com/v1
REACT_APP_ENABLE_ANALYTICS=false
```

## 📖 Documentation

- [Implementation Guide](./USER_PROFILE_IMPLEMENTATION.md)
- [API Documentation](./USER_PROFILE_API.md)
- [Security Guide](./SECURITY_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/user-profile-enhancement`
3. Make your changes with tests
4. Run the test suite: `pnpm test`
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- 95%+ test coverage
- Security-first development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Changelog

### v1.0.0 (2024-01-20)
- Initial user profile implementation
- Complete security framework
- Performance optimizations
- Comprehensive test suite
- Full documentation
