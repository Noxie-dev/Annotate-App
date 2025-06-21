import { useEffect, useCallback, useRef } from 'react';
import { useWebRTCStore } from '@/stores/webrtc-store';
import { getSignalingService, initializeSignalingService } from '@/services/signaling-service';
import { webrtcErrorHandler } from '@/services/webrtc-error-handler';
import { CONFIG_HELPERS } from '@/config/webrtc-config';
import { SignalingMessage } from '@/types';

interface UseWebRTCOptions {
  onCallReceived?: (callId: string, fromUserId: string) => void;
  onCallEnded?: () => void;
  onParticipantJoined?: (userId: string) => void;
  onParticipantLeft?: (userId: string) => void;
  onError?: (error: string) => void;
}

export function useWebRTC(options: UseWebRTCOptions = {}) {
  const {
    initializeWebRTC,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    handleSignalingMessage,
    createPeerConnection,
    addParticipant,
    removeParticipant,
    updateParticipant,
    setError,
    cleanup,
    // State
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
    callStartTime,
    callDuration,
    lastError,
    peerConnections
  } = useWebRTCStore();

  const callDurationInterval = useRef<NodeJS.Timeout | null>(null);
  const signalingService = useRef<any>(null);

  // Initialize WebRTC and signaling on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeWebRTC();

        // Initialize signaling service
        if (!signalingService.current) {
          signalingService.current = initializeSignalingService({
            serverUrl: CONFIG_HELPERS.getSignalingServerUrl(),
            userId: 'current-user', // This should be the actual current user ID
            documentId: 'current-document', // This should be the actual document ID
            autoConnect: true
          });

          // Register signaling message handler
          signalingService.current.onSignalingMessage('webrtc-hook', processSignalingMessage);
        }
      } catch (error) {
        console.error('Failed to initialize WebRTC/Signaling:', error);
        const webrtcError = webrtcErrorHandler.handleError(error, 'initialization');
        setError(webrtcError.userMessage);
      }
    };

    initialize();

    return () => {
      cleanup();
      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
      }
      if (signalingService.current) {
        signalingService.current.offSignalingMessage('webrtc-hook');
        signalingService.current.disconnect();
        signalingService.current = null;
      }
    };
  }, [initializeWebRTC, cleanup]);

  // Handle call duration updates
  useEffect(() => {
    if (isInCall && callStartTime) {
      callDurationInterval.current = setInterval(() => {
        const duration = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
        useWebRTCStore.setState({ callDuration: duration });
      }, 1000);
    } else {
      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
        callDurationInterval.current = null;
      }
    }

    return () => {
      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
      }
    };
  }, [isInCall, callStartTime]);

  // Handle errors
  useEffect(() => {
    if (lastError && options.onError) {
      options.onError(lastError);
    }
  }, [lastError, options.onError]);

  // Enhanced start call with offer creation
  const initiateCall = useCallback(async (targetUserId: string) => {
    try {
      await startCall(targetUserId);

      // Send call request via signaling
      if (signalingService.current && callId) {
        signalingService.current.sendCallRequest(targetUserId, callId, 'Current User');
      }

      // Create peer connection and offer
      const peerConnection = await createPeerConnection(targetUserId);
      if (peerConnection) {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });

        await peerConnection.setLocalDescription(offer);

        // Send offer via signaling
        if (signalingService.current) {
          const signalingMessage: SignalingMessage = {
            type: 'offer',
            callId: callId!,
            fromUserId: 'current-user',
            toUserId: targetUserId,
            data: offer
          };

          signalingService.current.sendSignalingMessage(signalingMessage);
          console.log('Sent offer to', targetUserId);
        }
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
      const webrtcError = webrtcErrorHandler.handleError(error, 'call_initiation');
      setError(webrtcError.userMessage);
      throw error;
    }
  }, [startCall, callId, createPeerConnection]);

  // Enhanced accept call with answer creation
  const acceptIncomingCall = useCallback(async (incomingCallId: string, fromUserId: string) => {
    try {
      await acceptCall(incomingCallId);

      // Send call acceptance via signaling
      if (signalingService.current) {
        signalingService.current.respondToCall(incomingCallId, true, fromUserId);
      }

      console.log(`Accepted call from ${fromUserId}`);

      if (options.onCallReceived) {
        options.onCallReceived(incomingCallId, fromUserId);
      }
    } catch (error) {
      console.error('Failed to accept call:', error);
      throw error;
    }
  }, [acceptCall, options]);

  // Reject incoming call
  const rejectIncomingCall = useCallback((incomingCallId: string, fromUserId: string) => {
    rejectCall(incomingCallId);

    // Send call rejection via signaling
    if (signalingService.current) {
      signalingService.current.respondToCall(incomingCallId, false, fromUserId);
    }

    console.log(`Rejected call from ${fromUserId}`);
  }, [rejectCall]);

  // Enhanced end call with signaling
  const endCurrentCall = useCallback(() => {
    // Notify other participants via signaling
    if (signalingService.current && callId) {
      signalingService.current.endCall(callId);
    }

    endCall();

    if (options.onCallEnded) {
      options.onCallEnded();
    }
  }, [endCall, callId, options]);

  // Enhanced toggle functions with signaling
  const toggleVideoWithSignaling = useCallback(async () => {
    await toggleVideo();

    // Notify other participants
    if (signalingService.current && callId) {
      signalingService.current.sendParticipantUpdate(callId, {
        isVideoEnabled: !isVideoEnabled
      });
    }
  }, [toggleVideo, callId, isVideoEnabled]);

  const toggleAudioWithSignaling = useCallback(async () => {
    await toggleAudio();

    // Notify other participants
    if (signalingService.current && callId) {
      signalingService.current.sendParticipantUpdate(callId, {
        isAudioEnabled: !isAudioEnabled
      });
    }
  }, [toggleAudio, callId, isAudioEnabled]);

  const toggleScreenShareWithSignaling = useCallback(async () => {
    await toggleScreenShare();

    // Notify other participants
    if (signalingService.current && callId) {
      signalingService.current.sendParticipantUpdate(callId, {
        isSharingScreen: !isSharingScreen
      });
    }
  }, [toggleScreenShare, callId, isSharingScreen]);

  // Handle incoming signaling messages
  const processSignalingMessage = useCallback(async (message: SignalingMessage) => {
    try {
      switch (message.type) {
        case 'offer':
          // Handle incoming call offer
          const peerConnection = await createPeerConnection(message.fromUserId);
          await peerConnection.setRemoteDescription(message.data);
          
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          // Send answer back
          const answerMessage: SignalingMessage = {
            type: 'answer',
            callId: message.callId,
            fromUserId: 'current-user',
            toUserId: message.fromUserId,
            data: answer
          };
          
          console.log('Sending answer:', answerMessage);
          // TODO: Send via signaling service
          break;

        case 'answer':
          // Handle call answer
          const answerPeerConnection = peerConnections.get(message.fromUserId);
          if (answerPeerConnection) {
            await answerPeerConnection.connection.setRemoteDescription(message.data);
          }
          break;

        case 'ice-candidate':
          // Handle ICE candidate
          const icePeerConnection = peerConnections.get(message.fromUserId);
          if (icePeerConnection) {
            await icePeerConnection.connection.addIceCandidate(message.data);
          }
          break;

        case 'call-request':
          // Handle incoming call request
          if (!isInCall && !isInitiating) {
            useWebRTCStore.setState({
              isReceivingCall: true,
              callId: message.callId
            });

            if (options.onCallReceived) {
              options.onCallReceived(message.callId, message.fromUserId);
            }
          } else {
            // Already in a call, reject automatically
            if (signalingService.current) {
              signalingService.current.respondToCall(message.callId, false, message.fromUserId);
            }
          }
          break;

        case 'call-accept':
          // Handle call acceptance - now we can proceed with WebRTC negotiation
          console.log('Call accepted by', message.fromUserId);
          addParticipant({
            userId: message.fromUserId,
            isVideoEnabled: true,
            isAudioEnabled: true,
            isSharingScreen: false
          });
          break;

        case 'call-reject':
          // Handle call rejection
          console.log('Call rejected by', message.fromUserId);
          setError('Call was rejected');
          endCall();
          break;

        case 'call-end':
          // Handle call end
          console.log('Call ended by', message.fromUserId);
          if (options.onCallEnded) {
            options.onCallEnded();
          }
          endCall();
          break;

        case 'participant-update':
          // Handle participant updates
          updateParticipant(message.fromUserId, message.data);
          break;

        default:
          console.warn('Unknown signaling message type:', message.type);
      }
      
      await handleSignalingMessage(message);
    } catch (error) {
      console.error('Failed to process signaling message:', error);
      setError(error instanceof Error ? error.message : 'Signaling error');
    }
  }, [createPeerConnection, peerConnections, handleSignalingMessage, endCall, updateParticipant, setError, options]);

  // Get media constraints based on current settings
  const getMediaConstraints = useCallback(() => {
    return {
      video: isVideoEnabled ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } : false,
      audio: isAudioEnabled ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } : false
    };
  }, [isVideoEnabled, isAudioEnabled]);

  // Update media stream with new constraints
  const updateMediaStream = useCallback(async () => {
    if (!isInCall) return;

    try {
      const constraints = getMediaConstraints();
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Replace tracks in all peer connections
      peerConnections.forEach(peerConn => {
        const senders = peerConn.connection.getSenders();
        
        newStream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConn.connection.addTrack(track, newStream);
          }
        });
      });

      // Stop old stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      useWebRTCStore.setState({ localStream: newStream });
    } catch (error) {
      console.error('Failed to update media stream:', error);
      setError(error instanceof Error ? error.message : 'Media update failed');
    }
  }, [isInCall, getMediaConstraints, peerConnections, localStream, setError]);

  // Format call duration for display
  const formatCallDuration = useCallback((duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
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
    
    // Actions
    initiateCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall: endCurrentCall,
    toggleVideo: toggleVideoWithSignaling,
    toggleAudio: toggleAudioWithSignaling,
    toggleScreenShare: toggleScreenShareWithSignaling,
    processSignalingMessage,
    updateMediaStream,
    
    // Utilities
    formatCallDuration,
    getMediaConstraints
  };
}
