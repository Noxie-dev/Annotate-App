import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ServiceCard } from '@/components/ServiceCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { services } from '@/data/services';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Service } from '@/types/service';

export default function ServicesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [searchQuery, setSearchQuery] = useState('');

  // Filter services based on search query
  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Service }) => (
    <ServiceCard service={item} />
  );

  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText>No services found matching your search.</ThemedText>
    </ThemedView>
  );

  const ListHeaderComponent = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
      <ThemedText type="title">All Services</ThemedText>

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
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>

      <ThemedText style={styles.resultsCount}>
        {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
      </ThemedText>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Services',
          headerBackTitleVisible: false,
        }}
      />
      <FlatList
        data={filteredServices}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  resultsCount: {
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
});
