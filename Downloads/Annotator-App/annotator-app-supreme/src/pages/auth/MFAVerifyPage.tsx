import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, AlertCircle, Key } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { mfaService } from '@/services/mfa-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MFAVerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleVerifyCode = async (code: string, isBackupCode = false) => {
    if (!user || !code || (isBackupCode ? code.length < 5 : code.length !== 6)) {
      setError(isBackupCode ? 'Please enter a valid backup code' : 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isBackupCode) {
        await mfaService.verifyBackupCode(user.id, code);
      } else {
        await mfaService.verifyTOTP(user.id, code);
      }

      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode(verificationCode, false);
  };

  const handleBackupCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode(backupCode, true);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-200">Two-factor authentication</h1>
          <p className="text-gray-400 mt-2">
            Enter your verification code to continue
          </p>
        </div>

        <Card className="bg-[#1a1f2e] border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">Verify your identity</CardTitle>
            <CardDescription className="text-gray-400">
              Use your authenticator app or a backup code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="bg-red-900/20 border-red-800 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="authenticator" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0f1419]">
                <TabsTrigger 
                  value="authenticator" 
                  className="data-[state=active]:bg-[#1a1f2e] data-[state=active]:text-gray-200"
                >
                  Authenticator
                </TabsTrigger>
                <TabsTrigger 
                  value="backup" 
                  className="data-[state=active]:bg-[#1a1f2e] data-[state=active]:text-gray-200"
                >
                  Backup Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="authenticator" className="space-y-4 mt-4">
                <form onSubmit={handleAuthenticatorSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode" className="text-gray-300">
                      Authentication code
                    </Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500 text-center text-lg tracking-widest"
                      maxLength={6}
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-gray-400">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      'Verify code'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="backup" className="space-y-4 mt-4">
                <form onSubmit={handleBackupCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupCode" className="text-gray-300 flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Backup recovery code
                    </Label>
                    <Input
                      id="backupCode"
                      type="text"
                      placeholder="12345-67890"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      className="bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500 text-center font-mono"
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-gray-400">
                      Enter one of your backup recovery codes
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || backupCode.length < 5}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      'Use backup code'
                    )}
                  </Button>
                </form>

                <Alert className="bg-yellow-900/20 border-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-yellow-300">
                    <strong>Note:</strong> Each backup code can only be used once.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-2">
                Having trouble accessing your codes?
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-transparent"
                onClick={() => {
                  // In a real app, this would redirect to account recovery
                  console.log('Account recovery flow');
                }}
              >
                Contact support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
