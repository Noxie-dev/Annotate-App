import { io, Socket } from 'socket.io-client';
import { SignalingMessage } from '@/types';

export interface SignalingServiceConfig {
  serverUrl: string;
  userId: string;
  documentId?: string;
  autoConnect?: boolean;
}

export class SignalingService {
  private socket: Socket | null = null;
  private config: SignalingServiceConfig;
  private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map();
  private connectionHandlers: Map<string, () => void> = new Map();
  private isConnected = false;

  constructor(config: SignalingServiceConfig) {
    this.config = config;
    
    if (config.autoConnect !== false) {
      this.connect();
    }
  }

  /**
   * Connect to the signaling server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.serverUrl, {
          transports: ['websocket'],
          auth: {
            userId: this.config.userId,
            documentId: this.config.documentId
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        this.socket.on('connect', () => {
          console.log('Connected to signaling server');
          this.isConnected = true;
          
          // Join document room if specified
          if (this.config.documentId) {
            this.socket!.emit('join-document', this.config.documentId);
          }
          
          // Notify connection handlers
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from signaling server:', reason);
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('Signaling connection error:', error);
          reject(error);
        });

        // Handle WebRTC signaling messages
        this.socket.on('webrtc-signal', (message: SignalingMessage) => {
          console.log('Received WebRTC signal:', message);
          this.messageHandlers.forEach(handler => handler(message));
        });

        // Handle call-specific events
        this.socket.on('call-request', (data: { callId: string; fromUserId: string; fromUserName: string }) => {
          const message: SignalingMessage = {
            type: 'call-request',
            callId: data.callId,
            fromUserId: data.fromUserId,
            data: { fromUserName: data.fromUserName }
          };
          this.messageHandlers.forEach(handler => handler(message));
        });

        this.socket.on('call-response', (data: { callId: string; fromUserId: string; accepted: boolean }) => {
          const message: SignalingMessage = {
            type: data.accepted ? 'call-accept' : 'call-reject',
            callId: data.callId,
            fromUserId: data.fromUserId
          };
          this.messageHandlers.forEach(handler => handler(message));
        });

        this.socket.on('call-ended', (data: { callId: string; fromUserId: string }) => {
          const message: SignalingMessage = {
            type: 'call-end',
            callId: data.callId,
            fromUserId: data.fromUserId
          };
          this.messageHandlers.forEach(handler => handler(message));
        });

        this.socket.on('participant-update', (data: { callId: string; fromUserId: string; updates: any }) => {
          const message: SignalingMessage = {
            type: 'participant-update',
            callId: data.callId,
            fromUserId: data.fromUserId,
            data: data.updates
          };
          this.messageHandlers.forEach(handler => handler(message));
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the signaling server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Send a WebRTC signaling message
   */
  sendSignalingMessage(message: SignalingMessage): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot send message: not connected to signaling server');
      return;
    }

    console.log('Sending WebRTC signal:', message);
    this.socket.emit('webrtc-signal', message);
  }

  /**
   * Send a call request to a specific user
   */
  sendCallRequest(targetUserId: string, callId: string, userName: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot send call request: not connected to signaling server');
      return;
    }

    console.log(`Sending call request to ${targetUserId}`);
    this.socket.emit('call-request', {
      targetUserId,
      callId,
      fromUserId: this.config.userId,
      fromUserName: userName
    });
  }

  /**
   * Respond to a call request
   */
  respondToCall(callId: string, accepted: boolean, targetUserId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot respond to call: not connected to signaling server');
      return;
    }

    console.log(`Responding to call ${callId}: ${accepted ? 'accepted' : 'rejected'}`);
    this.socket.emit('call-response', {
      callId,
      accepted,
      targetUserId,
      fromUserId: this.config.userId
    });
  }

  /**
   * End a call
   */
  endCall(callId: string, targetUserId?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot end call: not connected to signaling server');
      return;
    }

    console.log(`Ending call ${callId}`);
    this.socket.emit('call-end', {
      callId,
      targetUserId,
      fromUserId: this.config.userId
    });
  }

  /**
   * Send participant updates (mute/unmute, video on/off, etc.)
   */
  sendParticipantUpdate(callId: string, updates: any, targetUserId?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot send participant update: not connected to signaling server');
      return;
    }

    console.log('Sending participant update:', updates);
    this.socket.emit('participant-update', {
      callId,
      updates,
      targetUserId,
      fromUserId: this.config.userId
    });
  }

  /**
   * Register a handler for signaling messages
   */
  onSignalingMessage(handlerId: string, handler: (message: SignalingMessage) => void): void {
    this.messageHandlers.set(handlerId, handler);
  }

  /**
   * Remove a signaling message handler
   */
  offSignalingMessage(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
  }

  /**
   * Register a handler for connection events
   */
  onConnection(handlerId: string, handler: () => void): void {
    this.connectionHandlers.set(handlerId, handler);
  }

  /**
   * Remove a connection handler
   */
  offConnection(handlerId: string): void {
    this.connectionHandlers.delete(handlerId);
  }

  /**
   * Check if connected to signaling server
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get the current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SignalingServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Join a document room for collaborative features
   */
  joinDocument(documentId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot join document: not connected to signaling server');
      return;
    }

    console.log(`Joining document room: ${documentId}`);
    this.socket.emit('join-document', documentId);
    this.config.documentId = documentId;
  }

  /**
   * Leave a document room
   */
  leaveDocument(documentId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Cannot leave document: not connected to signaling server');
      return;
    }

    console.log(`Leaving document room: ${documentId}`);
    this.socket.emit('leave-document', documentId);
  }
}

// Singleton instance for global use
let signalingServiceInstance: SignalingService | null = null;

/**
 * Get or create the global signaling service instance
 */
export function getSignalingService(config?: SignalingServiceConfig): SignalingService {
  if (!signalingServiceInstance && config) {
    signalingServiceInstance = new SignalingService(config);
  }
  
  if (!signalingServiceInstance) {
    throw new Error('Signaling service not initialized. Please provide configuration.');
  }
  
  return signalingServiceInstance;
}

/**
 * Initialize the global signaling service
 */
export function initializeSignalingService(config: SignalingServiceConfig): SignalingService {
  if (signalingServiceInstance) {
    signalingServiceInstance.disconnect();
  }
  
  signalingServiceInstance = new SignalingService(config);
  return signalingServiceInstance;
}

/**
 * Cleanup the global signaling service
 */
export function cleanupSignalingService(): void {
  if (signalingServiceInstance) {
    signalingServiceInstance.disconnect();
    signalingServiceInstance = null;
  }
}
