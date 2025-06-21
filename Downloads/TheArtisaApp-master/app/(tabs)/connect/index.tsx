import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConnectIndexScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const handleConnectPress = () => {
    // Navigate to the standalone connect screen
    router.push('/(tabs)/connect/messages');
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }
    ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        <FontAwesome5
          name="comments"
          size={64}
          color={isDark ? '#4b5563' : '#9ca3af'}
          style={styles.icon}
        />

        <Text style={[
          styles.title,
          { color: isDark ? Colors.dark.text : Colors.light.text }
        ]}>
          Connect with Artisans
        </Text>

        <Text style={[
          styles.description,
          { color: isDark ? '#d1d5db' : '#4b5563' }
        ]}>
          Chat directly with artisans to discuss your project needs, share images, and get real-time assistance.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: '#f97316' }
          ]}
          onPress={handleConnectPress}
        >
          <Text style={styles.buttonText}>Open Messages</Text>
          <FontAwesome5 name="arrow-right" size={16} color="#ffffff" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f97316',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});
