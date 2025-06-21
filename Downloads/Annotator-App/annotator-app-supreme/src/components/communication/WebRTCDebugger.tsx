import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebRTC } from '@/hooks/use-webrtc';
import { testICEServers, validateWebRTCConfig, getWebRTCConfig } from '@/config/webrtc-config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bug,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  Monitor,
  Mic,
  Video,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';

interface DebugInfo {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export function WebRTCDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugInfo[]>([]);
  const [connectionTest, setConnectionTest] = useState<{
    stun: boolean;
    turn: boolean;
    errors: string[];
  } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [browserSupport, setBrowserSupport] = useState<{
    webrtc: boolean;
    getUserMedia: boolean;
    getDisplayMedia: boolean;
    details: string[];
  } | null>(null);

  const {
    isInCall,
    participants,
    localStream,
    remoteStreams,
    lastError,
    isVideoEnabled,
    isAudioEnabled,
    isSharingScreen
  } = useWebRTC();

  // Initialize browser support check
  useEffect(() => {
    checkBrowserSupport();
  }, []);

  // Capture console logs for debugging
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    const addDebugLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
      setDebugLogs(prev => [...prev.slice(-99), {
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      }]);
    };

    // Override console methods to capture WebRTC-related logs
    console.log = (...args) => {
      originalConsole.log(...args);
      const message = args.join(' ');
      if (message.toLowerCase().includes('webrtc') || message.toLowerCase().includes('ice') || 
          message.toLowerCase().includes('peer') || message.toLowerCase().includes('call')) {
        addDebugLog('info', message, args.length > 1 ? args.slice(1) : undefined);
      }
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      const message = args.join(' ');
      if (message.toLowerCase().includes('webrtc') || message.toLowerCase().includes('ice') || 
          message.toLowerCase().includes('peer') || message.toLowerCase().includes('call')) {
        addDebugLog('warn', message, args.length > 1 ? args.slice(1) : undefined);
      }
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      const message = args.join(' ');
      if (message.toLowerCase().includes('webrtc') || message.toLowerCase().includes('ice') || 
          message.toLowerCase().includes('peer') || message.toLowerCase().includes('call')) {
        addDebugLog('error', message, args.length > 1 ? args.slice(1) : undefined);
      }
    };

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    };
  }, []);

  const checkBrowserSupport = () => {
    const support = {
      webrtc: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
      details: [] as string[]
    };

    // Add detailed browser info
    support.details.push(`User Agent: ${navigator.userAgent}`);
    support.details.push(`WebRTC Support: ${support.webrtc ? 'Yes' : 'No'}`);
    support.details.push(`getUserMedia Support: ${support.getUserMedia ? 'Yes' : 'No'}`);
    support.details.push(`getDisplayMedia Support: ${support.getDisplayMedia ? 'Yes' : 'No'}`);

    // Check for specific browser implementations
    if (window.RTCPeerConnection) {
      support.details.push('RTCPeerConnection: Native');
    } else if ((window as any).webkitRTCPeerConnection) {
      support.details.push('RTCPeerConnection: Webkit');
    }

    setBrowserSupport(support);
  };

  const testConnectionServers = async () => {
    setIsTestingConnection(true);
    try {
      const config = getWebRTCConfig();
      const result = await testICEServers(config);
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        stun: false,
        turn: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const exportDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      browserSupport,
      connectionTest,
      webrtcConfig: getWebRTCConfig(),
      callState: {
        isInCall,
        participants: participants.length,
        isVideoEnabled,
        isAudioEnabled,
        isSharingScreen,
        lastError
      },
      debugLogs: debugLogs.slice(-50) // Last 50 logs
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webrtc-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warn': return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default: return <CheckCircle className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200">
          <Bug className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bug className="w-5 h-5" />
            <span>WebRTC Debugger</span>
            <Badge variant={isInCall ? "default" : "secondary"}>
              {isInCall ? 'In Call' : 'Not Connected'}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Debug and test WebRTC functionality
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Monitor className="w-4 h-4" />
                    <span>Browser Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {browserSupport && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">WebRTC</span>
                        {getStatusIcon(browserSupport.webrtc)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">getUserMedia</span>
                        {getStatusIcon(browserSupport.getUserMedia)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Screen Share</span>
                        {getStatusIcon(browserSupport.getDisplayMedia)}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Wifi className="w-4 h-4" />
                    <span>Media State</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Local Stream</span>
                    {getStatusIcon(!!localStream)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Video</span>
                    {getStatusIcon(isVideoEnabled)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Audio</span>
                    {getStatusIcon(isAudioEnabled)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Screen Share</span>
                    {getStatusIcon(isSharingScreen)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Call Participants</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <p className="text-xs text-gray-400">No participants in call</p>
                ) : (
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.userId} className="flex items-center justify-between text-xs">
                        <span>{participant.userId}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {participant.isVideoEnabled ? 'Video On' : 'Video Off'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {participant.isAudioEnabled ? 'Audio On' : 'Audio Off'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connection" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">ICE Server Test</h3>
              <Button
                onClick={testConnectionServers}
                disabled={isTestingConnection}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
            </div>

            {connectionTest && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">STUN Servers</span>
                      {getStatusIcon(connectionTest.stun)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">TURN Servers</span>
                      {getStatusIcon(connectionTest.turn)}
                    </div>
                    {connectionTest.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-400">Errors:</p>
                        {connectionTest.errors.map((error, index) => (
                          <p key={index} className="text-xs text-gray-400">• {error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Debug Logs</h3>
              <Button onClick={exportDebugInfo} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <ScrollArea className="h-64 bg-gray-800 rounded-lg p-2">
              {debugLogs.length === 0 ? (
                <p className="text-xs text-gray-400">No debug logs yet</p>
              ) : (
                <div className="space-y-1">
                  {debugLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      {getLogIcon(log.level)}
                      <div className="flex-1">
                        <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="ml-2">{log.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">WebRTC Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(getWebRTCConfig(), null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
