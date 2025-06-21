import { useColorScheme } from '@/hooks/useColorScheme';
import { Message, MessageStatus, MessageType } from '@/types/message';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MessageBubbleProps = {
  message: Message;
  isCurrentUser: boolean;
  onImagePress?: (imageUrl: string) => void;
  onFilePress?: (fileUrl: string, fileName: string) => void;
  onAnnotateImagePress?: (imageUrl: string) => void;
};

export default function MessageBubble({
  message,
  isCurrentUser,
  onImagePress,
  onFilePress,
  onAnnotateImagePress,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render message status indicator
  const renderStatusIndicator = () => {
    if (!isCurrentUser) return null;

    switch (message.status) {
      case MessageStatus.SENDING:
        return <FontAwesome5 name="clock" size={10} color={isDark ? '#9ca3af' : '#6b7280'} />;
      case MessageStatus.SENT:
        return <FontAwesome5 name="check" size={10} color={isDark ? '#9ca3af' : '#6b7280'} />;
      case MessageStatus.DELIVERED:
        return <FontAwesome5 name="check-double" size={10} color={isDark ? '#9ca3af' : '#6b7280'} />;
      case MessageStatus.READ:
        return <FontAwesome5 name="check-double" size={10} color={isCurrentUser ? '#60a5fa' : '#6b7280'} />;
      case MessageStatus.FAILED:
        return <FontAwesome5 name="exclamation-circle" size={10} color="#ef4444" />;
      default:
        return null;
    }
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.TEXT:
        return (
          <Text style={[
            styles.messageText,
            { color: isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000') }
          ]}>
            {message.text}
          </Text>
        );

      case MessageType.IMAGE:
        return (
          <View>
            <TouchableOpacity
              onPress={() => message.fileUrl && onImagePress?.(message.fileUrl)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: message.fileUrl }}
                style={styles.imageContent}
                contentFit="cover"
                transition={200}
              />
              {message.fileName && (
                <Text style={[
                  styles.fileName,
                  { color: isCurrentUser ? 'rgba(255,255,255,0.8)' : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)') }
                ]}>
                  {message.fileName}
                </Text>
              )}
            </TouchableOpacity>

            {/* Annotate button */}
            {onAnnotateImagePress && message.fileUrl && (
              <TouchableOpacity
                style={[
                  styles.annotateButton,
                  { backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
                ]}
                onPress={() => onAnnotateImagePress(message.fileUrl!)}
              >
                <FontAwesome5
                  name="pencil-alt"
                  size={12}
                  color={isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000')}
                />
                <Text style={[
                  styles.annotateText,
                  { color: isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000') }
                ]}>
                  Annotate
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case MessageType.FILE:
        return (
          <TouchableOpacity
            onPress={() => message.fileUrl && message.fileName && onFilePress?.(message.fileUrl, message.fileName)}
            style={styles.fileContainer}
          >
            <View style={styles.fileIconContainer}>
              <FontAwesome5
                name={getFileIcon(message.fileType)}
                size={20}
                color={isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000')}
              />
            </View>
            <View style={styles.fileInfo}>
              <Text
                style={[
                  styles.fileName,
                  { color: isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000') }
                ]}
                numberOfLines={1}
              >
                {message.fileName}
              </Text>
              {message.fileSize && (
                <Text
                  style={[
                    styles.fileSize,
                    { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') }
                  ]}
                >
                  {formatFileSize(message.fileSize)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );

      case MessageType.VOICE:
        return (
          <View style={styles.voiceContainer}>
            <View style={styles.voiceIconContainer}>
              <FontAwesome5
                name="microphone"
                size={16}
                color={isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000')}
              />
            </View>
            <View style={styles.voiceInfo}>
              <Text
                style={[
                  styles.voiceDuration,
                  { color: isCurrentUser ? '#ffffff' : (isDark ? '#ffffff' : '#000000') }
                ]}
              >
                {message.duration || '0:00'}
              </Text>
            </View>
          </View>
        );

      default:
        return <Text>Unsupported message type</Text>;
    }
  };

  // Helper function to get file icon based on file type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return 'file';

    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'file-word';
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) return 'file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'file-powerpoint';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'file-archive';
    if (fileType.includes('text')) return 'file-alt';

    return 'file';
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      <View style={[
        styles.bubble,
        isCurrentUser
          ? [styles.currentUserBubble, isDark ? styles.currentUserBubbleDark : null]
          : [styles.otherUserBubble, isDark ? styles.otherUserBubbleDark : null],
        message.type === MessageType.IMAGE && styles.imageBubble
      ]}>
        {renderMessageContent()}
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)') }
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {renderStatusIndicator()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    minWidth: 80,
  },
  currentUserBubble: {
    backgroundColor: '#f97316', // orange-500
    borderBottomRightRadius: 4,
  },
  currentUserBubbleDark: {
    backgroundColor: '#ea580c', // orange-600
  },
  otherUserBubble: {
    backgroundColor: '#e5e7eb', // gray-200
    borderBottomLeftRadius: 4,
  },
  otherUserBubbleDark: {
    backgroundColor: '#374151', // gray-700
  },
  imageBubble: {
    padding: 4,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  imageContent: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  annotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  annotateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  fileName: {
    fontSize: 14,
    marginTop: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  voiceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceDuration: {
    fontSize: 14,
  },
});
