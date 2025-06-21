import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import { Conversation, MessageType } from '@/types/message';
import StatusIndicator from './StatusIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type ConversationListProps = {
  conversations: Conversation[];
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
  isLoading?: boolean;
};

export default function ConversationList({
  conversations,
  currentUserId,
  onSelectConversation,
  isLoading = false,
}: ConversationListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  // Format timestamp for last message
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Get the other participant in the conversation
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => 'id' in p && p.id !== currentUserId);
  };
  
  // Get preview text for the last message
  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { type, text } = conversation.lastMessage;
    
    switch (type) {
      case MessageType.TEXT:
        return text || '';
      case MessageType.IMAGE:
        return '📷 Image';
      case MessageType.FILE:
        return '📎 File';
      case MessageType.VOICE:
        return '🎤 Voice message';
      default:
        return '';
    }
  };
  
  // Render a conversation item
  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = getOtherParticipant(item);
    if (!otherParticipant) return null;
    
    const isOnline = 'isOnline' in otherParticipant ? otherParticipant.isOnline : false;
    const lastSeen = 'lastSeen' in otherParticipant ? otherParticipant.lastSeen : undefined;
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
        ]}
        onPress={() => onSelectConversation(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: otherParticipant.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.statusIndicatorContainer}>
            <StatusIndicator isOnline={isOnline} lastSeen={lastSeen} size="small" />
          </View>
        </View>
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.participantName,
                { color: isDark ? Colors.dark.text : Colors.light.text }
              ]}
              numberOfLines={1}
            >
              {otherParticipant.name}
            </Text>
            
            <Text
              style={[
                styles.timestamp,
                { color: isDark ? '#9ca3af' : '#6b7280' }
              ]}
            >
              {item.lastMessage ? formatTimestamp(item.lastMessage.timestamp) : ''}
            </Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            <Text
              style={[
                styles.messagePreview,
                { color: isDark ? '#d1d5db' : '#4b5563' }
              ]}
              numberOfLines={1}
            >
              {getLastMessagePreview(item)}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text
          style={[
            styles.loadingText,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}
        >
          Loading conversations...
        </Text>
      </View>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5
          name="comments"
          size={48}
          color={isDark ? '#4b5563' : '#9ca3af'}
          style={styles.emptyIcon}
        />
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}
        >
          No conversations yet
        </Text>
        <Text
          style={[
            styles.emptySubtext,
            { color: isDark ? '#9ca3af' : '#6b7280' }
          ]}
        >
          Start a conversation with an artisan to get help with your projects
        </Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={conversations}
      renderItem={renderConversationItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusIndicatorContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#f97316', // orange-500
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
