import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/stores/user-store';
import { socialAuthService } from '@/services/social-auth';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthUser, setCurrentUser } = useUserStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const provider = searchParams.get('provider') as 'google' | 'github';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      setStatus('error');
      setError('OAuth authentication was cancelled or failed');
      return;
    }

    if (!code || !state || !provider) {
      setStatus('error');
      setError('Invalid OAuth callback parameters');
      return;
    }

    handleOAuthCallback();
  }, [code, state, provider, errorParam]);

  const handleOAuthCallback = async () => {
    try {
      setStatus('loading');
      setError(null);

      let result;
      
      // Check if this is a mock OAuth result (development mode)
      const mockResult = socialAuthService.getMockOAuthResult();
      if (mockResult) {
        result = mockResult;
      } else {
        // Handle real OAuth callback
        result = await socialAuthService.handleOAuthCallback(code!, state!, provider!);
      }

      // Set user data in stores
      setAuthUser(result.user);
      setCurrentUser(result.profile);

      setStatus('success');

      // Redirect after a short delay
      setTimeout(() => {
        const redirectTo = sessionStorage.getItem('oauth_redirect') || '/dashboard';
        sessionStorage.removeItem('oauth_redirect');
        navigate(redirectTo, { replace: true });
      }, 2000);

    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setError(err.message || 'Failed to complete authentication');
    }
  };

  const handleRetry = () => {
    navigate('/auth/login', { replace: true });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Completing sign in</h1>
            <p className="text-gray-400 mt-2">
              Please wait while we complete your {provider} authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Sign in successful!</h1>
            <p className="text-gray-400 mt-2">
              You've been successfully signed in with {provider}
            </p>
          </div>

          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-gray-300">
                Redirecting you to your dashboard...
              </p>
              
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-200">Authentication failed</h1>
          <p className="text-gray-400 mt-2">
            There was a problem completing your {provider} sign in
          </p>
        </div>

        <Card className="bg-[#1a1f2e] border-gray-700">
          <CardContent className="p-6 space-y-4">
            <Alert className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-gray-400 text-center">
                You can try signing in again or use a different method.
              </p>
              
              <Button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Try again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
