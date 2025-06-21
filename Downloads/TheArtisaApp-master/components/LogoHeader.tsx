import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type LogoHeaderProps = {
  title?: string;
  showTitle?: boolean;
};

export default function LogoHeader({ title, showTitle = true }: LogoHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/artisan-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        {showTitle && (
          <ThemedText type="title" style={styles.title}>
            {title || 'The Artisan App'}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
