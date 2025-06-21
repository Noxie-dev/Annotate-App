import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { services } from '@/data/services';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  
  // Find the service by ID
  const service = services.find(s => s.id === id);
  
  if (!service) {
    return (
      <>
        <Stack.Screen options={{ title: 'Service Not Found' }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Service not found</ThemedText>
        </ThemedView>
      </>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: service.category,
          headerBackTitleVisible: false,
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Image
            source={{ uri: service.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          
          <ThemedView style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                {service.title}
              </ThemedText>
              <View style={styles.priceContainer}>
                <ThemedText type="defaultSemiBold" style={styles.price}>
                  ${service.price}
                </ThemedText>
                <ThemedText>/hr</ThemedText>
              </View>
            </View>
            
            <View style={styles.ratingContainer}>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
              />
              <ThemedText style={styles.rating}>
                {service.rating} ({service.reviewCount} reviews)
              </ThemedText>
            </View>
            
            <ThemedText style={styles.description}>
              {service.description}
            </ThemedText>
            
            <View style={styles.tagsContainer}>
              {service.tags.map((tag) => (
                <ThemedView
                  key={tag}
                  style={styles.tag}
                  lightColor="#F5F5F5"
                  darkColor="#2A2A2A"
                >
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </ThemedView>
              ))}
            </View>
            
            <View style={styles.divider} />
            
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              About the Artisan
            </ThemedText>
            
            <View style={styles.artisanContainer}>
              <Image
                source={{ uri: service.artisan.avatarUrl }}
                style={styles.artisanAvatar}
                contentFit="cover"
              />
              <View style={styles.artisanInfo}>
                <View style={styles.artisanNameContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.artisanName}>
                    {service.artisan.name}
                  </ThemedText>
                  {service.artisan.verified && (
                    <IconSymbol
                      name="chevron.right"
                      size={16}
                      color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>
                <View style={styles.artisanRatingContainer}>
                  <IconSymbol
                    name="chevron.right"
                    size={14}
                    color={colorScheme === 'dark' ? Colors.dark.icon : Colors.light.icon}
                  />
                  <ThemedText style={styles.artisanRating}>
                    {service.artisan.rating} ({service.artisan.reviewCount} reviews)
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <Pressable
              style={[
                styles.bookButton,
                { backgroundColor: colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint }
              ]}
            >
              <ThemedText
                style={styles.bookButtonText}
                lightColor="#FFFFFF"
                darkColor="#FFFFFF"
              >
                Book Now
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  image: {
    height: 250,
    width: '100%',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    marginLeft: 4,
  },
  description: {
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  artisanContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  artisanAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  artisanInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artisanNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  artisanName: {
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  artisanRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artisanRating: {
    marginLeft: 4,
    fontSize: 14,
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
