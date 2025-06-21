import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { mfaService } from '@/services/mfa-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function MFASetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleSetupMFA = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await mfaService.setupMFA(user.id, user.email);

      setQrCodeUrl(result.qrCodeUrl);
      setSecretKey(result.secretKey);
      setBackupCodes(result.backupCodes);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await mfaService.verifyMFASetup(user.id, verificationCode, secretKey);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  // Step 1: Introduction
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Secure your account</h1>
            <p className="text-gray-400 mt-2">
              Set up two-factor authentication for enhanced security
            </p>
          </div>

          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-200">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-gray-400">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user && mfaService.isMFARequired(user) && (
                <Alert className="bg-blue-900/20 border-blue-800">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-blue-300">
                    Two-factor authentication is required for your account type.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-gray-200 font-medium">Install an authenticator app</h3>
                    <p className="text-sm text-gray-400">
                      Download Google Authenticator, Authy, or similar app on your phone
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-gray-200 font-medium">Scan QR code</h3>
                    <p className="text-sm text-gray-400">
                      Use your authenticator app to scan the QR code we'll provide
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-gray-200 font-medium">Enter verification code</h3>
                    <p className="text-sm text-gray-400">
                      Enter the 6-digit code from your app to complete setup
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSetupMFA}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Setting up...
                    </div>
                  ) : (
                    'Set up 2FA'
                  )}
                </Button>
                
                {user && !mfaService.isMFARequired(user) && (
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Skip for now
                  </Button>
                )}
              </div>

              {error && (
                <Alert className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: QR Code and Verification
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Scan QR code</h1>
            <p className="text-gray-400 mt-2">
              Use your authenticator app to scan this QR code
            </p>
          </div>

          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardContent className="p-6 space-y-4">
              {/* QR Code */}
              <div className="text-center">
                <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="bg-[#0f1419] px-3 py-1 rounded text-gray-300 text-sm">
                      {secretKey}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(secretKey)}
                      className="text-gray-400 hover:text-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-gray-300">
                  Enter verification code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500 text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <Alert className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  'Verify and continue'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Backup Codes
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-200">Save backup codes</h1>
            <p className="text-gray-400 mt-2">
              Store these codes safely - you'll need them if you lose your phone
            </p>
          </div>

          <Card className="bg-[#1a1f2e] border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-200 flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Backup Recovery Codes
              </CardTitle>
              <CardDescription className="text-gray-400">
                Each code can only be used once. Keep them in a safe place.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#0f1419] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-gray-300 py-1">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCopyBackupCodes}
                variant="outline"
                className="w-full bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy all codes
              </Button>

              <Alert className="bg-yellow-900/20 border-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-yellow-300">
                  <strong>Important:</strong> Save these codes in a secure location. 
                  You won't be able to see them again.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleComplete}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                I've saved my backup codes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
