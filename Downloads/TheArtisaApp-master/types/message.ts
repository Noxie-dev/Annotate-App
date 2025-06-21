import { Artisan } from './service';

/**
 * User interface representing an app user
 */
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeen?: Date;
}

/**
 * Message type enum
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
}

/**
 * Message status enum
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Message interface representing a message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  type: MessageType;
  timestamp: Date;
  status: MessageStatus;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  duration?: string; // For voice messages
  isDeleted?: boolean;
}

/**
 * Conversation interface representing a chat between a user and an artisan
 */
export interface Conversation {
  id: string;
  participants: (User | Artisan)[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
