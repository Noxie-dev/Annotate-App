import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaSettings } from './MediaSettings';
import { WebRTCDebugger } from './WebRTCDebugger';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Maximize,
  Minimize,
  Volume2,
  ChevronUp
} from 'lucide-react';

interface VideoControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSharingScreen: boolean;
  isInCall: boolean;
  participantCount: number;
  callDuration: number;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  isChatOpen?: boolean;
  isParticipantsOpen?: boolean;
  className?: string;
}

export function VideoControls({
  isVideoEnabled,
  isAudioEnabled,
  isSharingScreen,
  isInCall,
  participantCount,
  callDuration,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onEndCall,
  onToggleChat,
  onToggleParticipants,
  onToggleFullscreen,
  isFullscreen = false,
  isChatOpen = false,
  isParticipantsOpen = false,
  className = ''
}: VideoControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInCall) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 ${className}`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Call Info */}
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-600 text-white">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
            <span className="text-gray-300 text-sm font-mono">
              {formatDuration(callDuration)}
            </span>
            <div className="flex items-center space-x-1 text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participantCount}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center space-x-2">
            {/* Audio Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onToggleAudio}
                  className={`rounded-full p-3 ${
                    isAudioEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
              </TooltipContent>
            </Tooltip>

            {/* Video Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onToggleVideo}
                  className={`rounded-full p-3 ${
                    isVideoEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              </TooltipContent>
            </Tooltip>

            {/* Screen Share Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onToggleScreenShare}
                  className={`rounded-full p-3 ${
                    isSharingScreen
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {isSharingScreen ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSharingScreen ? 'Stop sharing screen' : 'Share screen'}
              </TooltipContent>
            </Tooltip>

            {/* End Call */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={onEndCall}
                  className="rounded-full p-3 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                End call
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center space-x-2">
            {/* Chat Toggle */}
            {onToggleChat && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleChat}
                    className={`p-2 ${
                      isChatOpen
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isChatOpen ? 'Hide chat' : 'Show chat'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Participants Toggle */}
            {onToggleParticipants && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleParticipants}
                    className={`p-2 ${
                      isParticipantsOpen
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isParticipantsOpen ? 'Hide participants' : 'Show participants'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleFullscreen}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Media Settings */}
            <MediaSettings isInCall={isInCall} />

            {/* Debug Tools (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <WebRTCDebugger />
            )}
          </div>
        </div>

        {/* Screen Share Indicator */}
        {isSharingScreen && (
          <div className="mt-3 flex items-center justify-center">
            <Badge className="bg-blue-600 text-white flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>You are sharing your screen</span>
            </Badge>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
