import { artisans } from './services';
import { Conversation, Message, MessageStatus, MessageType, User } from '@/types/message';

/**
 * Mock users data
 */
export const users: User[] = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    isOnline: true,
  },
  {
    id: 'user2',
    name: 'Sarah Williams',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
];

// Current user (for demo purposes)
export const currentUser: User = users[0];

/**
 * Mock messages data
 */
export const messages: Message[] = [
  // Conversation with John Doe (Plumber)
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'user1',
    text: 'Hi John, I have a leaking faucet in my kitchen. Are you available tomorrow?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    senderId: 'art1',
    text: 'Hello Alex! Yes, I can come by tomorrow. What time works for you?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    senderId: 'user1',
    text: 'Would 10 AM work?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg4',
    conversationId: 'conv1',
    senderId: 'art1',
    text: 'Perfect! I\'ll be there at 10 AM. Could you send me a picture of the faucet so I can bring the right tools?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 55), // 55 minutes ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg5',
    conversationId: 'conv1',
    senderId: 'user1',
    type: MessageType.IMAGE,
    fileUrl: 'https://placehold.co/400x300/png',
    fileName: 'faucet.png',
    fileType: 'image/png',
    timestamp: new Date(Date.now() - 1000 * 60 * 50), // 50 minutes ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg6',
    conversationId: 'conv1',
    senderId: 'art1',
    text: 'Thanks! I see the issue. I\'ll bring the necessary parts tomorrow.',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg7',
    conversationId: 'conv1',
    senderId: 'user1',
    text: 'Great, thank you!',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
    status: MessageStatus.READ,
  },
  
  // Conversation with Jane Smith (Electrician)
  {
    id: 'msg8',
    conversationId: 'conv2',
    senderId: 'art2',
    text: 'Hi Alex, I\'m following up on the electrical inspection we discussed. Are you still interested?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg9',
    conversationId: 'conv2',
    senderId: 'user1',
    text: 'Yes, definitely! When can you come by?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 115), // 1 hour 55 minutes ago
    status: MessageStatus.READ,
  },
  {
    id: 'msg10',
    conversationId: 'conv2',
    senderId: 'art2',
    text: 'I have availability this Friday afternoon. Would that work for you?',
    type: MessageType.TEXT,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: MessageStatus.DELIVERED,
  },
  {
    id: 'msg11',
    conversationId: 'conv2',
    senderId: 'art2',
    type: MessageType.FILE,
    fileUrl: 'https://example.com/quote.pdf',
    fileName: 'electrical_inspection_quote.pdf',
    fileType: 'application/pdf',
    fileSize: 2500000, // 2.5MB
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    status: MessageStatus.DELIVERED,
  },
];

/**
 * Mock conversations data
 */
export const conversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [users[0], artisans[0]],
    lastMessage: messages.find(m => m.id === 'msg7'),
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 40), // 40 minutes ago
  },
  {
    id: 'conv2',
    participants: [users[0], artisans[1]],
    lastMessage: messages.find(m => m.id === 'msg11'),
    unreadCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
  },
];

/**
 * Helper function to get messages for a specific conversation
 */
export function getConversationMessages(conversationId: string): Message[] {
  return messages.filter(message => message.conversationId === conversationId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Helper function to get a conversation by ID
 */
export function getConversationById(conversationId: string): Conversation | undefined {
  return conversations.find(conversation => conversation.id === conversationId);
}

/**
 * Helper function to get a user or artisan by ID
 */
export function getParticipantById(id: string): User | undefined {
  return [...users, ...artisans].find(participant => participant.id === id) as User;
}
