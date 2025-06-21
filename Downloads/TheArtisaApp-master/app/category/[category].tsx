import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ServiceCard } from '@/components/ServiceCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getServicesByCategory } from '@/data/services';
import { Service, ServiceCategory } from '@/types/service';

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category);
  
  // Get services for this category
  const services = getServicesByCategory(decodedCategory as ServiceCategory);
  
  const renderItem = ({ item }: { item: Service }) => (
    <ServiceCard service={item} />
  );
  
  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText>No services found in this category.</ThemedText>
    </ThemedView>
  );
  
  const ListHeaderComponent = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
      <ThemedText type="title">{decodedCategory}</ThemedText>
      <ThemedText style={styles.resultsCount}>
        {services.length} {services.length === 1 ? 'service' : 'services'} found
      </ThemedText>
    </Animated.View>
  );
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: decodedCategory,
          headerBackTitleVisible: false,
        }} 
      />
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  resultsCount: {
    marginTop: 8,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
});
