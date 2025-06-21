import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Message } from '@/types/message';
import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MessageBubble from './MessageBubble';

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
  onImagePress: (imageUrl: string) => void;
  onFilePress: (fileUrl: string, fileName: string) => void;
  onAnnotateImagePress?: (imageUrl: string) => void;
};

export default function MessageList({
  messages,
  currentUserId,
  onImagePress,
  onFilePress,
  onAnnotateImagePress,
}: MessageListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Convert grouped messages to array for rendering
  const messageGroups = Object.entries(groupedMessages).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));

  // Format date for display
  const formatDate = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Render a date separator
  const renderDateSeparator = (date: string) => (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={[
        styles.dateText,
        { color: isDark ? Colors.dark.text : Colors.light.text }
      ]}>
        {formatDate(date)}
      </Text>
      <View style={styles.dateLine} />
    </View>
  );

  // Render a message group
  const renderMessageGroup = ({ item }: { item: { date: string; messages: Message[] } }) => (
    <View>
      {renderDateSeparator(item.date)}
      {item.messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
          onImagePress={onImagePress}
          onFilePress={onFilePress}
          onAnnotateImagePress={onAnnotateImagePress}
        />
      ))}
    </View>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[
            styles.emptyText,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]}>
            No messages yet. Start the conversation!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messageGroups}
          renderItem={renderMessageGroup}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dateText: {
    fontSize: 12,
    marginHorizontal: 8,
    opacity: 0.7,
  },
});
