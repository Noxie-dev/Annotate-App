import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CallScreenModalProps = {
  isVisible: boolean;
  onClose: () => void;
  callType: 'voice' | 'video';
  participant: {
    name: string;
    avatarUrl: string;
  };
};

export default function CallScreenModal({
  isVisible,
  onClose,
  callType,
  participant,
}: CallScreenModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  // Start timer when call begins
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible) {
      setCallDuration(0); // Reset duration on new call
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVisible]);
  
  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Toggle microphone
  const handleToggleMic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMicMuted(!isMicMuted);
    // In a real app, this would trigger actual microphone muting
  };
  
  // Toggle camera
  const handleToggleCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCameraOff(!isCameraOff);
    // In a real app, this would trigger actual camera toggling
  };
  
  // End call
  const handleEndCall = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    onClose();
    // In a real app, this would trigger call termination logic
  };
  
  if (!isVisible) return null;
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Backdrop blur for iOS */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}
        
        {/* User info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: participant.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              transition={300}
            />
          </View>
          
          <Text style={styles.userName}>{participant.name}</Text>
          <Text style={styles.callInfo}>
            {callType === 'video' ? 'Video Call' : 'Voice Call'} • {formatDuration(callDuration)}
          </Text>
        </View>
        
        {/* Video preview (only for video calls) */}
        {callType === 'video' && (
          <View style={[
            styles.videoPreview,
            isCameraOff && styles.videoPreviewDisabled
          ]}>
            {isCameraOff ? (
              <View style={styles.cameraOffIndicator}>
                <FontAwesome5 name="video-slash" size={32} color="#9ca3af" />
                <Text style={styles.cameraOffText}>Camera Off</Text>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.placeholderText}>Your Video Feed</Text>
                <Text style={styles.placeholderSubtext}>(Camera preview would appear here)</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Call controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleToggleMic}
            activeOpacity={0.7}
          >
            <FontAwesome5
              name={isMicMuted ? "microphone-slash" : "microphone"}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
          
          {callType === 'video' && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleToggleCamera}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name={isCameraOff ? "video-slash" : "video"}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="phone-slash" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.disclaimer}>
          Call functionality is a UI demonstration
        </Text>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6', // blue-500
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#60a5fa', // blue-400
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  callInfo: {
    fontSize: 16,
    color: '#d1d5db', // gray-300
  },
  videoPreview: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.6, // 4:3 aspect ratio
    backgroundColor: '#1f2937', // gray-800
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151', // gray-700
  },
  videoPreviewDisabled: {
    opacity: 0.6,
  },
  cameraOffIndicator: {
    alignItems: 'center',
  },
  cameraOffText: {
    color: '#9ca3af', // gray-400
    marginTop: 8,
    fontSize: 16,
  },
  cameraPlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af', // gray-400
    fontSize: 16,
  },
  placeholderSubtext: {
    color: '#6b7280', // gray-500
    fontSize: 12,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4b5563', // gray-600
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  endCallButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ef4444', // red-500
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  disclaimer: {
    color: '#6b7280', // gray-500
    fontSize: 12,
    position: 'absolute',
    bottom: 20,
  },
});
