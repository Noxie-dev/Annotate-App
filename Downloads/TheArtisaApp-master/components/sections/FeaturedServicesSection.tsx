import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ServiceCard } from '@/components/ServiceCard';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { getFeaturedServices } from '@/data/services';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Service } from '@/types/service';

export function FeaturedServicesSection() {
  const colorScheme = useColorScheme() ?? 'light';
  const featuredServices = getFeaturedServices();

  const handleViewAll = () => {
    router.push('/services');
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.cardContainer}>
      <ServiceCard service={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Featured Services</ThemedText>
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

      <FlatList
        data={featuredServices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingRight: 16,
  },
  cardContainer: {
    width: 280,
    marginRight: 16,
  },
});
