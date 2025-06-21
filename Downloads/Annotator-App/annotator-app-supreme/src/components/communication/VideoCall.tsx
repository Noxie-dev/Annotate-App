import { useState, useEffect, useCallback } from 'react';
import { useWebRTC } from '@/hooks/use-webrtc';
import { ParticipantVideo } from './ParticipantVideo';
import { VideoControls } from './VideoControls';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDocumentStore } from '@/stores/document-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  className?: string;
}

export function VideoCall({ isOpen, onClose, targetUserId, className = '' }: VideoCallProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{
    callId: string;
    fromUserId: string;
    fromUserName?: string;
  } | null>(null);

  const { users } = useDocumentStore();

  const {
    isInCall,
    isInitiating,
    isReceivingCall,
    callId,
    localStream,
    remoteStreams,
    participants,
    isVideoEnabled,
    isAudioEnabled,
    isSharingScreen,
    callDuration,
    lastError,
    initiateCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    formatCallDuration
  } = useWebRTC({
    onCallReceived: (callId, fromUserId) => {
      const user = users.find(u => u.id === fromUserId);
      setIncomingCallData({
        callId,
        fromUserId,
        fromUserName: user?.name
      });
      setShowIncomingCall(true);
    },
    onCallEnded: () => {
      setShowIncomingCall(false);
      setIncomingCallData(null);
      onClose();
    },
    onError: (error) => {
      console.error('WebRTC Error:', error);
    }
  });

  // Start call when targetUserId is provided
  useEffect(() => {
    if (isOpen && targetUserId && !isInCall && !isInitiating) {
      initiateCall(targetUserId).catch(console.error);
    }
  }, [isOpen, targetUserId, isInCall, isInitiating, initiateCall]);

  // Handle incoming call display
  useEffect(() => {
    if (isReceivingCall && !showIncomingCall) {
      setShowIncomingCall(true);
    }
  }, [isReceivingCall, showIncomingCall]);

  const handleAcceptCall = useCallback(async () => {
    if (incomingCallData) {
      try {
        await acceptIncomingCall(incomingCallData.callId, incomingCallData.fromUserId);
        setShowIncomingCall(false);
        setIncomingCallData(null);
      } catch (error) {
        console.error('Failed to accept call:', error);
      }
    }
  }, [incomingCallData, acceptIncomingCall]);

  const handleRejectCall = useCallback(() => {
    if (incomingCallData) {
      rejectIncomingCall(incomingCallData.callId, incomingCallData.fromUserId);
      setShowIncomingCall(false);
      setIncomingCallData(null);
      onClose();
    }
  }, [incomingCallData, rejectIncomingCall, onClose]);

  const handleEndCall = useCallback(() => {
    endCall();
    onClose();
  }, [endCall, onClose]);

  const handlePinParticipant = useCallback((userId: string) => {
    setPinnedParticipant(userId === pinnedParticipant ? null : userId);
  }, [pinnedParticipant]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Get the main video stream (pinned participant or local)
  const getMainVideoStream = () => {
    if (pinnedParticipant && pinnedParticipant !== 'local') {
      return remoteStreams.get(pinnedParticipant);
    }
    return localStream;
  };

  const getMainParticipant = () => {
    if (pinnedParticipant && pinnedParticipant !== 'local') {
      return participants.find(p => p.userId === pinnedParticipant);
    }
    return participants.find(p => p.userId === 'current-user') || participants[0];
  };

  // Get other participants for the sidebar
  const getOtherParticipants = () => {
    const mainParticipantId = pinnedParticipant || 'local';
    return participants.filter(p => p.userId !== mainParticipantId);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Incoming Call Dialog */}
      <Dialog open={showIncomingCall} onOpenChange={setShowIncomingCall}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Incoming Call
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {incomingCallData?.fromUserName || 'Unknown User'} is calling you
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center space-x-4 py-6">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={users.find(u => u.id === incomingCallData?.fromUserId)?.avatar} 
                alt={incomingCallData?.fromUserName} 
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                {incomingCallData?.fromUserName?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleRejectCall}
              className="rounded-full p-4"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleAcceptCall}
              className="rounded-full p-4 bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Video Call Interface */}
      <div className={`fixed inset-0 bg-black z-50 flex flex-col ${className}`}>
        {/* Video Grid */}
        <div className="flex-1 flex">
          {/* Main Video Area */}
          <div className="flex-1 relative">
            {isInCall ? (
              <ParticipantVideo
                participant={getMainParticipant()!}
                stream={getMainVideoStream()}
                isLocal={pinnedParticipant === 'local' || !pinnedParticipant}
                isPinned={!!pinnedParticipant}
                onPin={() => handlePinParticipant('local')}
                onUnpin={() => setPinnedParticipant(null)}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  {isInitiating ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-white text-lg">Connecting...</p>
                    </>
                  ) : (
                    <>
                      <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">Waiting to connect</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Participants Sidebar */}
          {isInCall && getOtherParticipants().length > 0 && (
            <div className="w-64 bg-gray-800 p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center space-x-2 text-white">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Participants ({participants.length})</span>
              </div>
              
              {getOtherParticipants().map((participant) => (
                <ParticipantVideo
                  key={participant.userId}
                  participant={participant}
                  stream={remoteStreams.get(participant.userId)}
                  isPinned={pinnedParticipant === participant.userId}
                  onPin={() => handlePinParticipant(participant.userId)}
                  onUnpin={() => setPinnedParticipant(null)}
                  className="aspect-video"
                />
              ))}
            </div>
          )}
        </div>

        {/* Video Controls */}
        <VideoControls
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isSharingScreen={isSharingScreen}
          isInCall={isInCall}
          participantCount={participants.length}
          callDuration={callDuration}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onToggleScreenShare={toggleScreenShare}
          onEndCall={handleEndCall}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* Error Display */}
        {lastError && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg">
            {lastError}
          </div>
        )}
      </div>
    </>
  );
}
