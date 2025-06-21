import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

// Lazy load components for better performance
import { lazy, Suspense } from 'react';

// Authentication pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const MFASetupPage = lazy(() => import('@/pages/auth/MFASetupPage'));
const MFAVerifyPage = lazy(() => import('@/pages/auth/MFAVerifyPage'));
const OAuthCallbackPage = lazy(() => import('@/pages/auth/OAuthCallbackPage'));

// Dashboard and main app pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const DocLibraryPage = lazy(() => import('@/pages/doc-library/DocLibraryPage'));
const DocumentViewerPage = lazy(() => import('@/pages/document/DocumentViewerPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

// Test components
const PDFTestViewer = lazy(() => import('@/components/pdf/PDFTestViewer').then(module => ({ default: module.PDFTestViewer })));

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireMFA?: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
}

function ProtectedRoute({ 
  children, 
  requireMFA = false, 
  requiredPermissions = [],
  requiredRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check MFA requirement
  if (requireMFA && !user?.mfaEnabled) {
    return <Navigate to="/auth/mfa/setup" replace />;
  }

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every(permission => 
      user?.permissions.includes(permission)
    );
    if (!hasPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check role requirement
  if (requiredRole && user?.role.name !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect to dashboard if authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Suspense wrapper for lazy loaded components
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {children}
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={
        <PublicRoute>
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        </PublicRoute>
      } />
      
      <Route path="/auth/register" element={
        <PublicRoute>
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        </PublicRoute>
      } />
      
      <Route path="/auth/forgot-password" element={
        <PublicRoute>
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        </PublicRoute>
      } />
      
      <Route path="/auth/reset-password" element={
        <PublicRoute>
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        </PublicRoute>
      } />
      
      <Route path="/auth/verify-email" element={
        <PublicRoute>
          <SuspenseWrapper>
            <VerifyEmailPage />
          </SuspenseWrapper>
        </PublicRoute>
      } />

      <Route path="/auth/callback" element={
        <SuspenseWrapper>
          <OAuthCallbackPage />
        </SuspenseWrapper>
      } />

      {/* MFA Routes (require authentication but not MFA completion) */}
      <Route path="/auth/mfa/setup" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <MFASetupPage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/auth/mfa/verify" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <MFAVerifyPage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      <Route path="/doc-library" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <DocLibraryPage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      <Route path="/document/:documentId" element={
        <ProtectedRoute requiredPermissions={['view_documents']}>
          <SuspenseWrapper>
            <DocumentViewerPage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* Test Routes */}
      <Route path="/test/pdf" element={
        <ProtectedRoute>
          <SuspenseWrapper>
            <PDFTestViewer />
          </SuspenseWrapper>
        </ProtectedRoute>
      } />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      
      {/* 404 fallback */}
      <Route path="*" element={
        <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-200 mb-4">404</h1>
            <p className="text-gray-400 mb-8">Page not found</p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      } />
    </Routes>
  );
}
