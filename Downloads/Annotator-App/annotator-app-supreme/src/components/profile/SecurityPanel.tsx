import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/user-store';
import { useAuth } from '@/hooks/use-auth';
import { UserSession } from '@/types';
import { SessionManager } from '@/components/security/SessionManager';
import { PasswordStrengthIndicator } from '@/components/security/PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Eye,
  EyeOff,
  QrCode,
  Copy,
  Trash2
} from 'lucide-react';

interface SecurityPanelProps {
  userId: string;
}

export function SecurityPanel({ userId }: SecurityPanelProps) {
  const { 
    changePassword, 
    enableMFA, 
    disableMFA, 
    fetchUserSessions, 
    revokeSession, 
    sessions, 
    isLoading 
  } = useUserStore();
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaData, setMfaData] = useState<{ qrCode: string; backupCodes: string[] } | null>(null);

  useEffect(() => {
    fetchUserSessions(userId);
  }, [userId, fetchUserSessions]);

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Password Security
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your account password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Password</Label>
              <p className="text-sm text-gray-400">Last changed 30 days ago</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(true)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-gray-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">2FA Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={user?.mfaEnabled ? "default" : "secondary"}>
                  {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
                {user?.mfaEnabled && (
                  <Shield className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
            <Button
              variant={user?.mfaEnabled ? "destructive" : "default"}
              onClick={() => {
                if (user?.mfaEnabled) {
                  // Handle disable MFA
                } else {
                  setShowMFASetup(true);
                }
              }}
              className={user?.mfaEnabled ? "" : "bg-blue-600 hover:bg-blue-700"}
            >
              {user?.mfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
          
          {!user?.mfaEnabled && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium">Security Recommendation</p>
                  <p className="text-yellow-200 text-sm mt-1">
                    Enable two-factor authentication to significantly improve your account security.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <SessionManager />

      {/* Privacy Settings */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Privacy Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Profile Visibility</Label>
              <p className="text-sm text-gray-400">Who can see your profile information</p>
            </div>
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Team Only
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Show Online Status</Label>
              <p className="text-sm text-gray-400">Let others see when you're online</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Data Processing Consent</Label>
              <p className="text-sm text-gray-400">Allow processing of your data for service improvement</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        onSubmit={changePassword}
        isLoading={isLoading}
      />

      {/* MFA Setup Dialog */}
      <MFASetupDialog
        open={showMFASetup}
        onOpenChange={setShowMFASetup}
        onSetup={enableMFA}
        mfaData={mfaData}
        setMfaData={setMfaData}
        isLoading={isLoading}
      />
    </div>
  );
}

// Session Card Component
function SessionCard({ 
  session, 
  onRevoke, 
  isLoading 
}: { 
  session: UserSession; 
  onRevoke: () => void; 
  isLoading: boolean;
}) {
  const isCurrentSession = session.id === localStorage.getItem('session_id');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Monitor className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-white">{session.deviceInfo.userAgent}</p>
              {isCurrentSession && (
                <Badge variant="default" className="bg-green-600">
                  Current
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{session.deviceInfo.location || 'Unknown location'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last active {formatDate(session.lastActiveAt)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">IP: {session.deviceInfo.ip}</p>
          </div>
        </div>
        
        {!isCurrentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Revoke
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Revoke Session</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This will sign out this device immediately. The user will need to sign in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onRevoke}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Revoking...' : 'Revoke Session'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

// Change Password Dialog Component
function ChangePasswordDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (current: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both password fields match',
        variant: 'destructive'
      });
      return;
    }

    try {
      await onSubmit(currentPassword, newPassword);
      toast({
        title: 'Password changed',
        description: 'Your password has been successfully updated'
      });
      onOpenChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Password change failed',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your current password and choose a new secure password
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// MFA Setup Dialog Component
function MFASetupDialog({ 
  open, 
  onOpenChange, 
  onSetup, 
  mfaData, 
  setMfaData, 
  isLoading 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetup: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  mfaData: { qrCode: string; backupCodes: string[] } | null;
  setMfaData: (data: { qrCode: string; backupCodes: string[] } | null) => void;
  isLoading: boolean;
}) {
  const [step, setStep] = useState(1);

  const handleSetup = async () => {
    try {
      const data = await onSetup();
      setMfaData(data);
      setStep(2);
    } catch (error) {
      toast({
        title: 'MFA setup failed',
        description: error instanceof Error ? error.message : 'Failed to setup MFA',
        variant: 'destructive'
      });
    }
  };

  const copyBackupCodes = () => {
    if (mfaData) {
      navigator.clipboard.writeText(mfaData.backupCodes.join('\n'));
      toast({
        title: 'Backup codes copied',
        description: 'Store these codes in a safe place'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 1 ? 'Secure your account with 2FA' : 'Save your backup codes'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300">
                We'll generate a QR code for you to scan with your authenticator app.
              </p>
            </div>
            <Button
              onClick={handleSetup}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Setting up...' : 'Setup 2FA'}
            </Button>
          </div>
        )}

        {step === 2 && mfaData && (
          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={mfaData.qrCode} 
                alt="QR Code" 
                className="mx-auto mb-4 border border-gray-600 rounded"
              />
              <p className="text-sm text-gray-400">
                Scan this QR code with your authenticator app
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Backup Codes</Label>
              <div className="bg-gray-800 border border-gray-600 rounded p-3">
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {mfaData.backupCodes.map((code, index) => (
                    <div key={index} className="text-gray-300">{code}</div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyBackupCodes}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Backup Codes
              </Button>
            </div>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Complete Setup
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
