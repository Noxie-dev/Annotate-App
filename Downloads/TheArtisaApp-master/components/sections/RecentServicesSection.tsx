import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ServiceCard } from '@/components/ServiceCard';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { services } from '@/data/services';
import { useColorScheme } from '@/hooks/useColorScheme';

export function RecentServicesSection() {
  const colorScheme = useColorScheme() ?? 'light';
  // Get the most recent 3 services (in a real app, you'd sort by date)
  const recentServices = services.slice(0, 3);

  const handleViewAll = () => {
    router.push('/services');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Recent Services</ThemedText>
        <Pressable onPress={handleViewAll} style={styles.viewAllButton}>
          <ThemedText
            style={styles.viewAllText}
            lightColor={Colors.light.tint}
            darkColor={Colors.dark.tint}
          >
            View All
          </ThemedText>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
          />
        </Pressable>
      </View>

      {recentServices.map((service) => (
        <ServiceCard key={service.id} service={service} compact />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    marginRight: 4,
  },
});
