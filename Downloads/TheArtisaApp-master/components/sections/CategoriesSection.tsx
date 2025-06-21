import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { getServiceCategories } from '@/data/services';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ServiceCategory } from '@/types/service';

// Create an animated pressable component
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Map categories to icon names
const categoryIcons: Record<ServiceCategory, string> = {
  [ServiceCategory.PLUMBING]: 'wrench.fill',
  [ServiceCategory.ELECTRICAL]: 'house.fill',
  [ServiceCategory.CARPENTRY]: 'hammer.fill',
  [ServiceCategory.PAINTING]: 'paintbrush.fill',
  [ServiceCategory.CLEANING]: 'house.fill',
  [ServiceCategory.GARDENING]: 'leaf.fill',
  [ServiceCategory.MOVING]: 'house.fill',
  [ServiceCategory.OTHER]: 'tag.fill',
};

interface CategoryItemProps {
  category: ServiceCategory;
  count: number;
}

function CategoryItem({ category, count }: CategoryItemProps) {
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
    scale.value = withSpring(0.95, { damping: 50, stiffness: 400 });
  };

  // Handle press out animation
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 50, stiffness: 400 });
  };

  // Handle navigation to category
  const handlePress = () => {
    router.push(`/category/${category}`);
  };

  return (
    <AnimatedPressable
      style={[animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <ThemedView
        style={styles.categoryItem}
        lightColor="#F5F5F5"
        darkColor="#2A2A2A"
      >
        <IconSymbol
          name={categoryIcons[category] as any}
          size={24}
          color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
        />
        <ThemedText type="defaultSemiBold" style={styles.categoryName}>
          {category}
        </ThemedText>
        <ThemedText style={styles.categoryCount}>{count} services</ThemedText>
      </ThemedView>
    </AnimatedPressable>
  );
}

export function CategoriesSection() {
  const categories = getServiceCategories();

  const renderItem = ({ item }: { item: { category: ServiceCategory; count: number } }) => (
    <View style={styles.itemContainer}>
      <CategoryItem category={item.category} count={item.count} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Browse by Category
      </ThemedText>

      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.category}
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
    width: 140,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  categoryName: {
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
