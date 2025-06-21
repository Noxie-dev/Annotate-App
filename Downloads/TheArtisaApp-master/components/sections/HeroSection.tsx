import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function HeroSection() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Find Skilled Artisans
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Connect with trusted professionals for your home service needs
      </ThemedText>

      <ThemedView
        style={styles.searchContainer}
        lightColor="#F5F5F5"
        darkColor="#2A2A2A"
      >
        <IconSymbol
          name="magnifyingglass"
          size={20}
          color={colorScheme === 'dark' ? Colors.dark.icon : Colors.light.icon}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search for services..."
          placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#687076'}
          style={[
            styles.searchInput,
            { color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text }
          ]}
        />
      </ThemedView>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            500+
          </ThemedText>
          <ThemedText style={styles.statLabel}>Artisans</ThemedText>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            1,200+
          </ThemedText>
          <ThemedText style={styles.statLabel}>Services</ThemedText>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <ThemedText type="defaultSemiBold" style={styles.statNumber}>
            4.8
          </ThemedText>
          <ThemedText style={styles.statLabel}>Avg. Rating</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
});
