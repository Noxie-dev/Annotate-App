import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Github, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { socialAuthService } from '@/services/social-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  mfaCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showMFA, setShowMFA] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Ensure all required properties are present
      const loginData = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
        mfaCode: data.mfaCode
      };
      await login(loginData);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      if (err.message.includes('MFA')) {
        setShowMFA(true);
      } else {
        setError('root', { message: err.message });
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      // Store redirect URL for after OAuth completion
      sessionStorage.setItem('oauth_redirect', redirectTo);

      // Initiate OAuth flow
      await socialAuthService.initiateOAuth(provider, `${window.location.origin}/auth/callback`);
    } catch (err: any) {
      setError('root', { message: `Failed to sign in with ${provider}` });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-200">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to your Annotator account</p>
        </div>

        <Card className="bg-[#1a1f2e] border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-gray-200">Sign in</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Mail className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1a1f2e] px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Error Alert */}
            {(error || errors.root) && (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-300">
                  {error || errors.root?.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  className="bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    className="bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* MFA Code Input */}
              {showMFA && (
                <div className="space-y-2">
                  <Label htmlFor="mfaCode" className="text-gray-300">
                    Two-Factor Authentication Code
                  </Label>
                  <Input
                    id="mfaCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    {...register('mfaCode')}
                    className="bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500"
                    maxLength={6}
                  />
                  {errors.mfaCode && (
                    <p className="text-sm text-red-400">{errors.mfaCode.message}</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    {...register('rememberMe')}
                    className="border-gray-600"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-300">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
