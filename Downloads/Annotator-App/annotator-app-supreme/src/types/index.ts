export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  color: string;
  department?: string;
  joinDate?: string;
  timezone?: string;
  phone?: string;
  bio?: string;
  teamAffiliations?: TeamAffiliation[];
  preferences?: UserPreferences;
  isFirstTimeUser?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamAffiliation {
  teamId: string;
  teamName: string;
  role: string;
  permissions: Permission[];
  joinedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: 'document' | 'team' | 'global';
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  annotation: AnnotationPreferences;
  collaboration: CollaborationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  mentions: boolean;
  documentUpdates: boolean;
  teamMessages: boolean;
  voiceCalls: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface AnnotationPreferences {
  defaultTool: 'highlight' | 'comment' | 'shape' | 'freehand';
  defaultColor: string;
  strokeWidth: number;
  fontSize: number;
  autoSave: boolean;
  showOtherAnnotations: boolean;
  realTimeSync: boolean;
  highlightOpacity: number;
}

export interface CollaborationPreferences {
  showPresence: boolean;
  allowVoiceCalls: boolean;
  allowScreenShare: boolean;
  autoJoinTeamCalls: boolean;
  shareStatus: boolean;
  allowDirectMessages: boolean;
  showTypingIndicators: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'team' | 'private';
  showOnlineStatus: boolean;
  allowContactByEmail: boolean;
  dataProcessingConsent: boolean;
  analyticsOptOut: boolean;
  shareUsageData: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
}

// Authentication and Security Types
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: string[];
  sessionId: string;
  lastLoginAt: string;
  mfaEnabled: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

// Profile Update Types
export interface UserProfileUpdate {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  department?: string;
  timezone?: string;
  avatar?: string;
  isFirstTimeUser?: boolean;
}

export interface UserPreferencesUpdate {
  theme?: UserPreferences['theme'];
  language?: string;
  timezone?: string;
  notifications?: Partial<NotificationPreferences>;
  annotation?: Partial<AnnotationPreferences>;
  collaboration?: Partial<CollaborationPreferences>;
  privacy?: Partial<PrivacyPreferences>;
  accessibility?: Partial<AccessibilityPreferences>;
}

export interface Document {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: string;
  totalPages: number;
  status: 'active' | 'archived';
  participants: string[];
  lastModified: string;
  description: string;
  tags: string[];
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'text-comment' | 'drawing' | 'rectangle' | 'circle' | 'arrow';
  pageNumber: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  userId: string;
  timestamp: string;
  content?: string;
  path?: string;
  strokeWidth?: number;
  replies?: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'file';
  duration?: number;
  fileUrl?: string;
}

export interface UserPresence {
  userId: string;
  pageNumber: number;
  x: number;
  y: number;
  isActive: boolean;
  lastSeen: string;
}

export interface AnnotationTool {
  id: string;
  name: string;
  icon: string;
  type: 'select' | 'highlight' | 'text' | 'draw' | 'rectangle' | 'circle' | 'arrow' | 'eraser';
  color?: string;
  size?: number;
}

export interface AIInsight {
  id: string;
  type: 'summary' | 'suggestion' | 'analysis' | 'question';
  content: string;
  confidence: number;
  timestamp: string;
  sourcePages?: number[];
}

export interface CallParticipant {
  userId: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSharingScreen: boolean;
}

export interface ActiveCall {
  id: string;
  participants: CallParticipant[];
  startTime: string;
  isActive: boolean;
}

// WebRTC Types
export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  iceCandidatePoolSize?: number;
}

export interface PeerConnection {
  id: string;
  userId: string;
  connection: RTCPeerConnection;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
}

export interface CallState {
  isInCall: boolean;
  isInitiating: boolean;
  isReceivingCall: boolean;
  callId: string | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: CallParticipant[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSharingScreen: boolean;
  callStartTime: Date | null;
  callDuration: number;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end' | 'participant-update';
  callId: string;
  fromUserId: string;
  toUserId?: string;
  data?: any;
}
