import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type MessageInputProps = {
  onSendMessage: (text: string) => void;
  onSendImage: () => void;
  onSendFile: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
};

export default function MessageInput({
  onSendMessage,
  onSendImage,
  onSendFile,
  onStartRecording,
  onStopRecording,
}: MessageInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Handle sending a message
  const handleSend = () => {
    if (message.trim() === '') return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendMessage(message.trim());
    setMessage('');
    Keyboard.dismiss();
  };
  
  // Handle voice recording
  const handleRecordPress = () => {
    if (isRecording) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRecording(false);
      onStopRecording();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);
      onStartRecording();
    }
  };
  
  // Handle attachment button press
  const handleAttachmentPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendFile();
  };
  
  // Handle image button press
  const handleImagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendImage();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
        ]}
      >
        <View style={styles.inputContainer}>
          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleAttachmentPress}
            >
              <FontAwesome5
                name="paperclip"
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handleImagePress}
            >
              <FontAwesome5
                name="image"
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
          
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            editable={!isRecording}
          />
          
          {message.trim() === '' ? (
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordingButton
              ]}
              onPress={handleRecordPress}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="microphone"
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="paper-plane"
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316', // orange-500
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316', // orange-500
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recordingButton: {
    backgroundColor: '#ef4444', // red-500
  },
});
