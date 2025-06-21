import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ConversationList from '@/components/connect/ConversationList';
import ImageViewer from '@/components/connect/ImageViewer';
import ImageViewerModal from '@/components/connect/ImageViewerModal';
import MessageInput from '@/components/connect/MessageInput';
import MessageList from '@/components/connect/MessageList';
import UserProfile from '@/components/connect/UserProfile';
import CallScreenModal from '@/components/connect/CallScreenModal';

import LogoHeader from '@/components/LogoHeader';
import { conversations, currentUser, getConversationById, getConversationMessages } from '@/data/messages';
import { Message, MessageStatus, MessageType } from '@/types/message';

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  // State for selected conversation
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const selectedConversation = selectedConversationId
    ? getConversationById(selectedConversationId)
    : null;

  // State for messages in the selected conversation
  const [messages, setMessages] = useState<Message[]>([]);

  // State for image viewer
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // State for annotation image viewer
  const [annotationViewerVisible, setAnnotationViewerVisible] = useState(false);
  const [annotations, setAnnotations] = useState([]);

  // State for call screen
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeCallType, setActiveCallType] = useState<'voice' | 'video'>('voice');

  // Load messages when a conversation is selected
  React.useEffect(() => {
    if (selectedConversationId) {
      const conversationMessages = getConversationMessages(selectedConversationId);
      setMessages(conversationMessages);
    }
  }, [selectedConversationId]);

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  // Handle going back to conversation list
  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  // Handle going back to the main connect screen
  const handleBackToConnect = () => {
    router.back();
  };

  // Handle sending a message
  const handleSendMessage = (text: string) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: currentUser.id,
      text,
      type: MessageType.TEXT,
      timestamp: new Date(),
      status: MessageStatus.SENT,
    };

    setMessages([...messages, newMessage]);

    // Simulate message delivery after a short delay
    setTimeout(() => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: MessageStatus.DELIVERED }
            : msg
        )
      );
    }, 1000);
  };

  // Handle sending an image
  const handleSendImage = () => {
    Alert.alert(
      'Feature Not Implemented',
      'Image upload functionality would be implemented with a real backend.',
      [{ text: 'OK' }]
    );
  };

  // Handle sending a file
  const handleSendFile = () => {
    Alert.alert(
      'Feature Not Implemented',
      'File upload functionality would be implemented with a real backend.',
      [{ text: 'OK' }]
    );
  };

  // Handle voice recording
  const handleStartRecording = () => {
    Alert.alert(
      'Feature Not Implemented',
      'Voice recording functionality would be implemented with a real backend.',
      [{ text: 'OK' }]
    );
  };

  const handleStopRecording = () => {
    // This would handle stopping the recording and sending the voice message
  };

  // Handle image press to open viewer
  const handleImagePress = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageViewerVisible(true);
  };

  // Handle image press to open annotation viewer
  const handleAnnotationImagePress = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setAnnotationViewerVisible(true);
  };

  // Handle annotations change
  const handleAnnotationsChange = (newAnnotations: any) => {
    setAnnotations(newAnnotations);
    // In a real app, you would save these annotations to your backend
  };

  // Handle file press
  const handleFilePress = (fileUrl: string, fileName: string) => {
    Alert.alert(
      'Download File',
      `Would download ${fileName} in a real implementation.`,
      [{ text: 'OK' }]
    );
  };

  // Handle voice call
  const handleVoiceCall = () => {
    setActiveCallType('voice');
    setIsCallActive(true);
    // In a real app, this would initiate a WebRTC connection or similar
  };

  // Handle video call
  const handleVideoCall = () => {
    setActiveCallType('video');
    setIsCallActive(true);
    // In a real app, this would initiate a WebRTC connection or similar
  };

  // Handle ending a call
  const handleEndCall = () => {
    setIsCallActive(false);
    // In a real app, this would terminate the WebRTC connection or similar
  };

  // Get the other participant in the conversation
  const getOtherParticipant = () => {
    if (!selectedConversation) return null;

    const otherParticipant = selectedConversation.participants.find(
      p => 'id' in p && p.id !== currentUser.id
    );

    return otherParticipant;
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            selectedConversationId
              ? <Text style={styles.headerTitle}>
                  {getOtherParticipant()?.name || 'Chat'}
                </Text>
              : <LogoHeader title="Messages" />
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            selectedConversationId ? (
              <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
                <FontAwesome5 name="arrow-left" size={18} color={isDark ? Colors.dark.text : Colors.light.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleBackToConnect} style={styles.backButton}>
                <FontAwesome5 name="arrow-left" size={18} color={isDark ? Colors.dark.text : Colors.light.text} />
              </TouchableOpacity>
            )
          ),
        }}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[
        styles.container,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
      ]}>
        {selectedConversationId ? (
          // Chat view
          <View style={styles.chatContainer}>
            {/* User profile */}
            {getOtherParticipant() && (
              <UserProfile
                participant={getOtherParticipant()!}
                onCallPress={handleVoiceCall}
                onVideoCallPress={handleVideoCall}
              />
            )}

            {/* Message list */}
            <MessageList
              messages={messages}
              currentUserId={currentUser.id}
              onImagePress={handleImagePress}
              onFilePress={handleFilePress}
              onAnnotateImagePress={handleAnnotationImagePress}
            />

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onSendImage={handleSendImage}
              onSendFile={handleSendFile}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
          </View>
        ) : (
          // Conversation list view
          <ConversationList
            conversations={conversations}
            currentUserId={currentUser.id}
            onSelectConversation={handleSelectConversation}
          />
        )}

        {/* Image viewer modal */}
        <ImageViewer
          visible={imageViewerVisible}
          imageUrl={selectedImageUrl}
          onClose={() => setImageViewerVisible(false)}
        />

        {/* Annotation image viewer modal */}
        <ImageViewerModal
          isOpen={annotationViewerVisible}
          imageUrl={selectedImageUrl}
          onClose={() => setAnnotationViewerVisible(false)}
          initialAnnotations={annotations}
          onAnnotationsChange={handleAnnotationsChange}
        />

        {/* Call screen modal */}
        {getOtherParticipant() && (
          <CallScreenModal
            isVisible={isCallActive}
            onClose={handleEndCall}
            callType={activeCallType}
            participant={{
              name: getOtherParticipant()!.name,
              avatarUrl: getOtherParticipant()!.avatarUrl,
            }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
});
