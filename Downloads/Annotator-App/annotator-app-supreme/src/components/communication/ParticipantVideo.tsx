import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CallParticipant } from '@/types';
import { useDocumentStore } from '@/stores/document-store';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor,
  Volume2,
  VolumeX,
  Pin,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ParticipantVideoProps {
  participant: CallParticipant;
  stream?: MediaStream;
  isLocal?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
  className?: string;
}

export function ParticipantVideo({
  participant,
  stream,
  isLocal = false,
  isPinned = false,
  onPin,
  onUnpin,
  className = ''
}: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const { users } = useDocumentStore();

  const user = users.find(u => u.id === participant.userId);

  // Set up video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setIsVideoLoaded(true);
      };
    }
  }, [stream]);

  // Handle local video mirroring
  useEffect(() => {
    if (videoRef.current && isLocal) {
      videoRef.current.style.transform = 'scaleX(-1)';
    }
  }, [isLocal]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handlePin = () => {
    if (isPinned && onUnpin) {
      onUnpin();
    } else if (!isPinned && onPin) {
      onPin();
    }
  };

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      {participant.isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        /* Avatar Fallback */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <Avatar className="w-16 h-16 md:w-24 md:h-24">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg md:text-2xl"
              style={{ backgroundColor: user?.color }}
            >
              {user?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium truncate">
              {user?.name || 'Unknown User'}
              {isLocal && ' (You)'}
            </span>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-1">
              {!participant.isAudioEnabled && (
                <div className="p-1 bg-red-500 rounded-full">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
              
              {!participant.isVideoEnabled && (
                <div className="p-1 bg-red-500 rounded-full">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
              
              {participant.isSharingScreen && (
                <div className="p-1 bg-blue-500 rounded-full">
                  <Monitor className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Connection Quality Indicator */}
          <div className="flex items-center space-x-1">
            <div className="w-1 h-3 bg-green-500 rounded-full"></div>
            <div className="w-1 h-2 bg-green-500 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          {!isLocal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="bg-black/50 hover:bg-black/70 text-white p-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handlePin}
            className="bg-black/50 hover:bg-black/70 text-white p-2"
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'text-blue-400' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white p-2"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              {!isLocal && (
                <>
                  <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">
                    Send Message
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="text-gray-200 hover:bg-gray-700">
                {isPinned ? 'Unpin Video' : 'Pin Video'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Loading Indicator */}
      {participant.isVideoEnabled && stream && !isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Pinned Badge */}
      {isPinned && (
        <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
          Pinned
        </Badge>
      )}

      {/* Screen Share Indicator */}
      {participant.isSharingScreen && (
        <Badge className="absolute top-2 left-2 bg-green-600 text-white flex items-center space-x-1">
          <Monitor className="w-3 h-3" />
          <span>Sharing Screen</span>
        </Badge>
      )}
    </div>
  );
}
