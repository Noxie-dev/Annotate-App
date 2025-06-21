import { create } from 'zustand';
import { WebRTCConfig, PeerConnection, CallState, SignalingMessage, CallParticipant } from '@/types';
import { getWebRTCConfig, validateWebRTCConfig } from '@/config/webrtc-config';
import 'webrtc-adapter';

interface WebRTCState extends CallState {
  // Configuration
  config: WebRTCConfig;
  
  // Peer connections
  peerConnections: Map<string, PeerConnection>;
  
  // Error handling
  lastError: string | null;
  
  // Actions
  initializeWebRTC: () => Promise<void>;
  startCall: (targetUserId: string) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => void;
  endCall: () => void;
  toggleVideo: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  handleSignalingMessage: (message: SignalingMessage) => Promise<void>;
  createPeerConnection: (userId: string) => Promise<RTCPeerConnection>;
  addParticipant: (participant: CallParticipant) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<CallParticipant>) => void;
  setError: (error: string | null) => void;
  cleanup: () => void;
}

// Get WebRTC configuration from config file
const defaultConfig: WebRTCConfig = getWebRTCConfig();

export const useWebRTCStore = create<WebRTCState>((set, get) => ({
  // Initial state
  config: defaultConfig,
  peerConnections: new Map(),
  isInCall: false,
  isInitiating: false,
  isReceivingCall: false,
  callId: null,
  localStream: null,
  remoteStreams: new Map(),
  participants: [],
  isVideoEnabled: true,
  isAudioEnabled: true,
  isSharingScreen: false,
  callStartTime: null,
  callDuration: 0,
  lastError: null,

  // Actions
  initializeWebRTC: async () => {
    try {
      // Check if WebRTC is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC is not supported in this browser');
      }

      // Validate WebRTC configuration
      const config = get().config;
      if (!validateWebRTCConfig(config)) {
        console.warn('WebRTC configuration validation failed, but continuing...');
      }

      console.log('WebRTC initialized successfully with config:', config);
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      set({ lastError: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  startCall: async (targetUserId: string) => {
    const state = get();
    if (state.isInCall) {
      throw new Error('Already in a call');
    }

    try {
      set({ isInitiating: true, lastError: null });
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: state.isVideoEnabled,
        audio: state.isAudioEnabled
      });

      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      set({
        localStream: stream,
        callId,
        isInCall: true,
        isInitiating: false,
        callStartTime: new Date(),
        participants: [
          {
            userId: 'current-user', // This should be the actual current user ID
            isVideoEnabled: state.isVideoEnabled,
            isAudioEnabled: state.isAudioEnabled,
            isSharingScreen: false
          }
        ]
      });

      // Create peer connection for the target user
      await get().createPeerConnection(targetUserId);
      
      console.log(`Call started with ${targetUserId}`);
    } catch (error) {
      console.error('Failed to start call:', error);
      set({ 
        isInitiating: false, 
        lastError: error instanceof Error ? error.message : 'Failed to start call' 
      });
      throw error;
    }
  },

  acceptCall: async (callId: string) => {
    try {
      set({ isReceivingCall: false, lastError: null });
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: get().isVideoEnabled,
        audio: get().isAudioEnabled
      });

      set({
        localStream: stream,
        callId,
        isInCall: true,
        callStartTime: new Date()
      });

      console.log(`Call accepted: ${callId}`);
    } catch (error) {
      console.error('Failed to accept call:', error);
      set({ 
        isReceivingCall: false,
        lastError: error instanceof Error ? error.message : 'Failed to accept call' 
      });
      throw error;
    }
  },

  rejectCall: (callId: string) => {
    set({
      isReceivingCall: false,
      callId: null,
      lastError: null
    });
    console.log(`Call rejected: ${callId}`);
  },

  endCall: () => {
    const state = get();
    
    // Stop local stream
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    state.peerConnections.forEach(peerConn => {
      peerConn.connection.close();
    });

    set({
      isInCall: false,
      isInitiating: false,
      isReceivingCall: false,
      callId: null,
      localStream: null,
      remoteStreams: new Map(),
      participants: [],
      callStartTime: null,
      callDuration: 0,
      peerConnections: new Map(),
      isSharingScreen: false
    });

    console.log('Call ended');
  },

  toggleVideo: async () => {
    const state = get();
    const newVideoState = !state.isVideoEnabled;
    
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }

    set({ isVideoEnabled: newVideoState });
    
    // Update participant info
    get().updateParticipant('current-user', { isVideoEnabled: newVideoState });
  },

  toggleAudio: async () => {
    const state = get();
    const newAudioState = !state.isAudioEnabled;
    
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = newAudioState;
      }
    }

    set({ isAudioEnabled: newAudioState });
    
    // Update participant info
    get().updateParticipant('current-user', { isAudioEnabled: newAudioState });
  },

  toggleScreenShare: async () => {
    const state = get();
    
    try {
      if (!state.isSharingScreen) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track in peer connections
        state.peerConnections.forEach(peerConn => {
          const sender = peerConn.connection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender && screenStream.getVideoTracks()[0]) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });

        set({ isSharingScreen: true });
        
        // Listen for screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          get().toggleScreenShare();
        };
      } else {
        // Stop screen sharing and return to camera
        if (state.localStream) {
          const videoTrack = state.localStream.getVideoTracks()[0];
          
          state.peerConnections.forEach(peerConn => {
            const sender = peerConn.connection.getSenders().find(s => 
              s.track && s.track.kind === 'video'
            );
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          });
        }
        
        set({ isSharingScreen: false });
      }
      
      // Update participant info
      get().updateParticipant('current-user', { isSharingScreen: !state.isSharingScreen });
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      set({ lastError: error instanceof Error ? error.message : 'Screen share failed' });
    }
  },

  handleSignalingMessage: async (message: SignalingMessage) => {
    // This will be implemented when we create the signaling service
    console.log('Received signaling message:', message);
  },

  createPeerConnection: async (userId: string) => {
    const state = get();
    
    try {
      const pc = new RTCPeerConnection(state.config);
      
      // Add local stream tracks
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => {
          pc.addTrack(track, state.localStream!);
        });
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        set(state => ({
          remoteStreams: new Map(state.remoteStreams.set(userId, remoteStream))
        }));
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate via signaling
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state for ${userId}:`, pc.connectionState);
        
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          get().removeParticipant(userId);
        }
      };

      const peerConnection: PeerConnection = {
        id: `peer-${userId}-${Date.now()}`,
        userId,
        connection: pc,
        localStream: state.localStream || undefined,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState
      };

      set(state => ({
        peerConnections: new Map(state.peerConnections.set(userId, peerConnection))
      }));

      return pc;
    } catch (error) {
      console.error(`Failed to create peer connection for ${userId}:`, error);
      throw error;
    }
  },

  addParticipant: (participant: CallParticipant) => {
    set(state => ({
      participants: [...state.participants.filter(p => p.userId !== participant.userId), participant]
    }));
  },

  removeParticipant: (userId: string) => {
    const state = get();
    
    // Close peer connection
    const peerConn = state.peerConnections.get(userId);
    if (peerConn) {
      peerConn.connection.close();
    }

    set(state => ({
      participants: state.participants.filter(p => p.userId !== userId),
      peerConnections: new Map([...state.peerConnections].filter(([key]) => key !== userId)),
      remoteStreams: new Map([...state.remoteStreams].filter(([key]) => key !== userId))
    }));
  },

  updateParticipant: (userId: string, updates: Partial<CallParticipant>) => {
    set(state => ({
      participants: state.participants.map(p => 
        p.userId === userId ? { ...p, ...updates } : p
      )
    }));
  },

  setError: (error: string | null) => {
    set({ lastError: error });
  },

  cleanup: () => {
    const state = get();
    
    // Stop all tracks
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    state.peerConnections.forEach(peerConn => {
      peerConn.connection.close();
    });

    // Reset state
    set({
      isInCall: false,
      isInitiating: false,
      isReceivingCall: false,
      callId: null,
      localStream: null,
      remoteStreams: new Map(),
      participants: [],
      callStartTime: null,
      callDuration: 0,
      peerConnections: new Map(),
      isSharingScreen: false,
      lastError: null
    });
  }
}));
