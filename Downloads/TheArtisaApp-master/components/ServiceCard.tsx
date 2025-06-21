import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Service } from '@/types/service';

// Create an animated pressable component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const scale = useSharedValue(1);
  
  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Handle press in animation
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 50, stiffness: 400 });
  };

  // Handle press out animation
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 50, stiffness: 400 });
  };

  // Handle navigation to service details
  const handlePress = () => {
    router.push(`/service/${service.id}`);
  };

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.container,
        compact ? styles.compactContainer : null,
        { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#1D3D47' } // Navy blue for both modes
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Image
        source={{ uri: service.imageUrl }}
        style={[styles.image, compact ? styles.compactImage : null]}
        contentFit="cover"
        transition={200}
      />
      
      <View style={[styles.content, compact ? styles.compactContent : null]}>
        <View style={styles.categoryContainer}>
          <ThemedText
            style={styles.category}
            lightColor={Colors.light.tint}
            darkColor={Colors.dark.tint}
          >
            {service.category}
          </ThemedText>
        </View>
        
        <ThemedText
          type={compact ? 'defaultSemiBold' : 'subtitle'}
          style={compact ? styles.compactTitle : styles.title}
          numberOfLines={2}
        >
          {service.title}
        </ThemedText>
        
        {!compact && (
          <ThemedText numberOfLines={2} style={styles.description}>
            {service.description}
          </ThemedText>
        )}
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <ThemedText type="defaultSemiBold">
              ${service.price}
              <ThemedText>/hr</ThemedText>
            </ThemedText>
          </View>
          
          <View style={styles.ratingContainer}>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={colorScheme === 'dark' ? Colors.dark.icon : Colors.light.icon}
            />
            <ThemedText style={styles.rating}>
              {service.rating} ({service.reviewCount})
            </ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    height: 100,
  },
  image: {
    height: 180,
    width: '100%',
  },
  compactImage: {
    height: '100%',
    width: 100,
  },
  content: {
    padding: 12,
  },
  compactContent: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
});
