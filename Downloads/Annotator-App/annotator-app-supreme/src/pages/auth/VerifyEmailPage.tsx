import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = location.state?.email || 'your email address';

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification success
      setIsVerified(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login', {
          state: { message: 'Email verified successfully! You can now sign in.' }
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock resend success
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verification in progress
  if (token && isLoading && !isVerified && !error) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Verifying your email</h1>
            <p className="text-gray-400 mt-2">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verification successful
  if (isVerified) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Email verified!</h1>
            <p className="text-gray-400 mt-2">
              Your email address has been successfully verified
            </p>
          </div>

          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-gray-300">
                Great! Your email address has been verified. You can now sign in to your account.
              </p>
              
              <p className="text-sm text-gray-400">
                Redirecting you to sign in page in a few seconds...
              </p>
              
              <Link to="/auth/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Continue to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification failed or manual verification needed
  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-200">Verify your email</h1>
          <p className="text-gray-400 mt-2">
            We've sent a verification link to your email address
          </p>
        </div>

        <Card className="bg-[#1a1f2e] border-gray-700">
          <CardContent className="p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-300">
                  We've sent a verification email to:
                </p>
                <p className="text-blue-400 font-medium break-all">
                  {email}
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-400">
                  Click the link in the email to verify your account. 
                  If you don't see the email, check your spam folder.
                </p>
                
                <Button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
                      Resending...
                    </div>
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-2">
                <p className="text-sm text-gray-400">
                  Already verified your email?
                </p>
                <Link
                  to="/auth/login"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Sign in to your account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
