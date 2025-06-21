import { useEffect } from 'react';
import { toast } from 'sonner';
import { useWebRTC } from '@/hooks/use-webrtc';
import { useDocumentStore } from '@/stores/document-store';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  UserPlus,
  UserMinus,
  Wifi,
  WifiOff
} from 'lucide-react';

/**
 * Component that handles call-related notifications and toasts
 * This should be mounted at the app level to show notifications
 */
export function CallNotifications() {
  const {
    isInCall,
    isInitiating,
    isReceivingCall,
    isVideoEnabled,
    isAudioEnabled,
    isSharingScreen,
    participants,
    lastError
  } = useWebRTC();

  const { users } = useDocumentStore();

  // Track previous states to detect changes
  const prevStates = {
    isVideoEnabled: isVideoEnabled,
    isAudioEnabled: isAudioEnabled,
    isSharingScreen: isSharingScreen,
    participantCount: participants.length
  };

  // Show notifications for media control changes
  useEffect(() => {
    if (!isInCall) return;

    // Video toggle notification
    if (prevStates.isVideoEnabled !== isVideoEnabled) {
      toast(
        isVideoEnabled ? 'Camera turned on' : 'Camera turned off',
        {
          icon: isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />,
          duration: 2000,
        }
      );
    }

    // Audio toggle notification
    if (prevStates.isAudioEnabled !== isAudioEnabled) {
      toast(
        isAudioEnabled ? 'Microphone unmuted' : 'Microphone muted',
        {
          icon: isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />,
          duration: 2000,
        }
      );
    }

    // Screen share toggle notification
    if (prevStates.isSharingScreen !== isSharingScreen) {
      toast(
        isSharingScreen ? 'Screen sharing started' : 'Screen sharing stopped',
        {
          icon: isSharingScreen ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />,
          duration: 3000,
        }
      );
    }

    // Update previous states
    prevStates.isVideoEnabled = isVideoEnabled;
    prevStates.isAudioEnabled = isAudioEnabled;
    prevStates.isSharingScreen = isSharingScreen;
  }, [isInCall, isVideoEnabled, isAudioEnabled, isSharingScreen]);

  // Show notifications for participant changes
  useEffect(() => {
    if (!isInCall) return;

    const currentCount = participants.length;
    const prevCount = prevStates.participantCount;

    if (currentCount > prevCount) {
      // Someone joined
      const newParticipants = participants.slice(prevCount);
      newParticipants.forEach(participant => {
        const user = users.find(u => u.id === participant.userId);
        toast(
          `${user?.name || 'Someone'} joined the call`,
          {
            icon: <UserPlus className="w-4 h-4" />,
            duration: 3000,
          }
        );
      });
    } else if (currentCount < prevCount) {
      // Someone left
      toast(
        'Someone left the call',
        {
          icon: <UserMinus className="w-4 h-4" />,
          duration: 3000,
        }
      );
    }

    prevStates.participantCount = currentCount;
  }, [participants.length, isInCall, users]);

  // Show call state notifications
  useEffect(() => {
    if (isInitiating) {
      toast('Connecting to call...', {
        icon: <Phone className="w-4 h-4" />,
        duration: 5000,
      });
    }
  }, [isInitiating]);

  useEffect(() => {
    if (isInCall) {
      toast('Call connected', {
        icon: <Phone className="w-4 h-4" />,
        duration: 2000,
      });
    }
  }, [isInCall]);

  useEffect(() => {
    if (isReceivingCall) {
      toast('Incoming call...', {
        icon: <Phone className="w-4 h-4" />,
        duration: 10000,
      });
    }
  }, [isReceivingCall]);

  // Show error notifications
  useEffect(() => {
    if (lastError) {
      toast.error(lastError, {
        icon: <WifiOff className="w-4 h-4" />,
        duration: 5000,
      });
    }
  }, [lastError]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook to show custom call notifications
 */
export function useCallNotifications() {
  const showConnectionNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const icon = type === 'success' ? <Wifi className="w-4 h-4" /> : 
                 type === 'error' ? <WifiOff className="w-4 h-4" /> : 
                 <Phone className="w-4 h-4" />;

    if (type === 'error') {
      toast.error(message, { icon, duration: 5000 });
    } else if (type === 'success') {
      toast.success(message, { icon, duration: 3000 });
    } else {
      toast(message, { icon, duration: 3000 });
    }
  };

  const showMediaNotification = (message: string, mediaType: 'video' | 'audio' | 'screen', enabled: boolean) => {
    const icon = mediaType === 'video' ? (enabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />) :
                 mediaType === 'audio' ? (enabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />) :
                 (enabled ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />);

    toast(message, { icon, duration: 2000 });
  };

  const showParticipantNotification = (message: string, joined: boolean) => {
    const icon = joined ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />;
    toast(message, { icon, duration: 3000 });
  };

  return {
    showConnectionNotification,
    showMediaNotification,
    showParticipantNotification
  };
}
