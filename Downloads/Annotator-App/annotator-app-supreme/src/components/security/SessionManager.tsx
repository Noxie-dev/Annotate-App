import { useState, useEffect } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { securityService, SessionInfo } from '@/services/security-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

export function SessionManager() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToRevoke, setSessionToRevoke] = useState<SessionInfo | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const userSessions = await securityService.getUserSessions(user.id);
      setSessions(userSessions);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;

    setIsRevoking(true);
    try {
      await securityService.revokeSession(sessionToRevoke.id);
      setSessions(prev => prev.filter(s => s.id !== sessionToRevoke.id));
      setSessionToRevoke(null);
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session');
    } finally {
      setIsRevoking(false);
    }
  };

  const getDeviceIcon = (deviceInfo: SessionInfo['deviceInfo']) => {
    if (deviceInfo.os === 'iOS' || deviceInfo.os === 'Android') {
      return <Smartphone className="w-5 h-5" />;
    }
    if (deviceInfo.userAgent.includes('iPad') || deviceInfo.userAgent.includes('Tablet')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const formatLastActive = (lastActiveAt: string) => {
    const date = new Date(lastActiveAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getSessionStatus = (session: SessionInfo) => {
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const lastActiveAt = new Date(session.lastActiveAt);
    const minutesSinceActive = (now.getTime() - lastActiveAt.getTime()) / (1000 * 60);

    if (session.isCurrentSession) {
      return { status: 'current', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }
    if (minutesSinceActive < 30) {
      return { status: 'active', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    if (expiresAt < now) {
      return { status: 'expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    return { status: 'inactive', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1a1f2e] border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-200 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[#1a1f2e] border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-200 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Active Sessions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your active login sessions across devices
              </CardDescription>
            </div>
            <Button
              onClick={loadSessions}
              variant="outline"
              size="sm"
              className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-900/20 border-red-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const sessionStatus = getSessionStatus(session);
                
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-[#0f1419] rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-400">
                        {getDeviceIcon(session.deviceInfo)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-gray-200 font-medium">
                            {session.deviceInfo.browser} on {session.deviceInfo.os}
                          </h4>
                          <Badge className={sessionStatus.color}>
                            {sessionStatus.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {session.deviceInfo.location || session.deviceInfo.ip}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatLastActive(session.lastActiveAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {session.isCurrentSession ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Current Session
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => setSessionToRevoke(session)}
                          variant="outline"
                          size="sm"
                          className="bg-red-900/20 border-red-800 text-red-400 hover:bg-red-900/40"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <Alert className="bg-yellow-900/20 border-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-300">
                <strong>Security tip:</strong> If you see any sessions you don't recognize, 
                revoke them immediately and change your password.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Revoke Session Confirmation Dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent className="bg-[#1a1f2e] border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-200">Revoke Session</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to revoke this session? The user will be signed out 
              from {sessionToRevoke?.deviceInfo.browser} on {sessionToRevoke?.deviceInfo.os}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeSession}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRevoking ? (
                <div className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </div>
              ) : (
                'Revoke Session'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
