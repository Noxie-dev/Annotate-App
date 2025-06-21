import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

// Create an animated pressable component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Sample popular services data
const popularServices = [
  {
    id: 'plumbing1',
    title: 'Plumbing Repair',
    category: 'Plumbing',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'electrical1',
    title: 'Electrical Installation',
    category: 'Electrical',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: 'carpentry1',
    title: 'Furniture Assembly',
    category: 'Carpentry',
    imageUrl: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: 'painting1',
    title: 'Interior Painting',
    category: 'Painting',
    imageUrl: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    rating: 4.6,
    reviewCount: 112,
  },
];

interface ServiceItemProps {
  service: typeof popularServices[0];
  onPress: (serviceId: string) => void;
}

function ServiceItem({ service, onPress }: ServiceItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { getFontSize, isSmallScreen, isMediumScreen, widthPercentage } = useResponsiveStyles();
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

  // Handle press
  const handlePress = () => {
    onPress(service.id);
  };

  // Responsive styles
  const dynamicStyles = {
    serviceImage: {
      height: isSmallScreen ? 100 : isMediumScreen ? 120 : 140,
    },
    serviceTitle: {
      fontSize: getFontSize({ small: 14, medium: 16, large: 18 }),
    },
    serviceCategory: {
      fontSize: getFontSize({ small: 12, medium: 12, large: 14 }),
    },
    rating: {
      fontSize: getFontSize({ small: 12, medium: 12, large: 14 }),
    },
  };

  return (
    <AnimatedPressable
      style={[animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <ThemedView
        style={styles.serviceItem}
        lightColor="#1D3D47"
        darkColor="#1D3D47"
      >
        <Image
          source={{ uri: service.imageUrl }}
          style={[styles.serviceImage, dynamicStyles.serviceImage]}
          contentFit="cover"
        />
        <View style={styles.serviceContent}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.serviceTitle, dynamicStyles.serviceTitle]}
          >
            {service.title}
          </ThemedText>
          <ThemedText style={[styles.serviceCategory, dynamicStyles.serviceCategory]}>
            {service.category}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <IconSymbol
              name="star.fill"
              size={getFontSize({ small: 12, medium: 14, large: 16 })}
              color="#FFD700"
            />
            <ThemedText style={[styles.rating, dynamicStyles.rating]}>
              {service.rating} ({service.reviewCount} reviews)
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </AnimatedPressable>
  );
}

interface PopularServicesSectionProps {
  onServicePress: (serviceId: string) => void;
}

export default function PopularServicesSection({ onServicePress }: PopularServicesSectionProps) {
  const { isSmallScreen, isMediumScreen, isLargeScreen, getFontSize, width } = useResponsiveStyles();

  // Calculate number of columns and item width based on screen size
  const getItemWidth = () => {
    if (isSmallScreen) return 220;
    if (isMediumScreen) return 240;
    return 280; // large screen
  };

  const renderItem = ({ item }: { item: typeof popularServices[0] }) => (
    <View style={[styles.itemContainer, { width: getItemWidth() }]}>
      <ServiceItem service={item} onPress={onServicePress} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText
        type="subtitle"
        style={[
          styles.title,
          { fontSize: getFontSize({ small: 20, medium: 22, large: 24 }), color: '#222' }
        ]}
      >
        Popular Services
      </ThemedText>

      <FlatList
        data={popularServices}
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
  title: {
    marginBottom: 16,
  },
  listContent: {
    paddingRight: 16,
  },
  itemContainer: {
    marginRight: 12,
  },
  serviceItem: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceImage: {
    width: '100%',
  },
  serviceContent: {
    padding: 12,
  },
  serviceTitle: {
    marginBottom: 4,
  },
  serviceCategory: {
    opacity: 0.7,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
  },
});
