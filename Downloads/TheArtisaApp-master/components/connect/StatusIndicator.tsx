import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type StatusIndicatorProps = {
  isOnline: boolean;
  lastSeen?: Date;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export default function StatusIndicator({
  isOnline,
  lastSeen,
  showText = false,
  size = 'medium',
}: StatusIndicatorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Determine the size of the indicator
  const indicatorSize = {
    small: 8,
    medium: 10,
    large: 12,
  }[size];
  
  // Format last seen time
  const getLastSeenText = () => {
    if (!lastSeen) return 'Offline';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };
  
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.indicator,
          { width: indicatorSize, height: indicatorSize },
          isOnline ? styles.online : styles.offline,
        ]}
      />
      {showText && (
        <Text
          style={[
            styles.text,
            { color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text },
          ]}
        >
          {isOnline ? 'Online' : getLastSeenText()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    borderRadius: 50,
    marginRight: 4,
  },
  online: {
    backgroundColor: '#4ade80', // green-400
  },
  offline: {
    backgroundColor: '#9ca3af', // gray-400
  },
  text: {
    fontSize: 12,
    opacity: 0.8,
  },
});
