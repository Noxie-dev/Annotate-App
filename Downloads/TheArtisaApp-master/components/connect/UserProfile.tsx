import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import { User } from '@/types/message';
import { Artisan } from '@/types/service';
import StatusIndicator from './StatusIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type UserProfileProps = {
  participant: User | Artisan;
  onCallPress?: () => void;
  onVideoCallPress?: () => void;
  showCallButtons?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export default function UserProfile({
  participant,
  onCallPress,
  onVideoCallPress,
  showCallButtons = true,
  size = 'medium',
}: UserProfileProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  // Determine avatar size based on the size prop
  const avatarSize = {
    small: 40,
    medium: 60,
    large: 80,
  }[size];
  
  // Determine font size based on the size prop
  const nameSize = {
    small: 14,
    medium: 18,
    large: 22,
  }[size];
  
  // Check if participant is an artisan (has rating property)
  const isArtisan = 'rating' in participant;
  
  // Check if participant is online
  const isOnline = 'isOnline' in participant ? participant.isOnline : false;
  
  // Get last seen time if available
  const lastSeen = 'lastSeen' in participant ? participant.lastSeen : undefined;
  
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: participant.avatarUrl }}
          style={[styles.avatar, { width: avatarSize, height: avatarSize }]}
          contentFit="cover"
          transition={300}
        />
        
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.name,
              { fontSize: nameSize, color: isDark ? Colors.dark.text : Colors.light.text }
            ]}
          >
            {participant.name}
            {isArtisan && (participant as Artisan).verified && (
              <Text style={styles.verifiedBadge}> ✓</Text>
            )}
          </Text>
          
          <View style={styles.statusContainer}>
            <StatusIndicator
              isOnline={isOnline}
              lastSeen={lastSeen}
              showText
              size={size === 'small' ? 'small' : 'medium'}
            />
          </View>
          
          {isArtisan && (
            <View style={styles.ratingContainer}>
              <FontAwesome5
                name="star"
                solid
                size={size === 'small' ? 10 : 12}
                color="#f59e0b" // amber-500
                style={styles.ratingIcon}
              />
              <Text
                style={[
                  styles.ratingText,
                  { color: isDark ? Colors.dark.text : Colors.light.text }
                ]}
              >
                {(participant as Artisan).rating.toFixed(1)}
                <Text style={styles.reviewCount}>
                  {` (${(participant as Artisan).reviewCount})`}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {showCallButtons && (
        <View style={styles.callButtonsContainer}>
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
            onPress={onCallPress}
          >
            <FontAwesome5
              name="phone-alt"
              size={size === 'small' ? 14 : 18}
              color={isDark ? '#e5e7eb' : '#374151'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
            onPress={onVideoCallPress}
          >
            <FontAwesome5
              name="video"
              size={size === 'small' ? 14 : 18}
              color={isDark ? '#e5e7eb' : '#374151'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    borderRadius: 100,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  verifiedBadge: {
    color: '#4ade80', // green-400
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCount: {
    fontWeight: 'normal',
    opacity: 0.7,
  },
  callButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
