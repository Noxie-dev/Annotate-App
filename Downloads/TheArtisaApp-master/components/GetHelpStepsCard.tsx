import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View);

type StepProps = {
  number: number;
  title: string;
  description: string;
  iconName: string;
  delay: number;
};

function Step({ number, title, description, iconName, delay }: StepProps) {
  const { getFontSize, isSmallScreen } = useResponsiveStyles();
  const colorScheme = useColorScheme() ?? 'light';

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const iconScale = useSharedValue(0.8);

  // Entrance animations
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    iconScale.value = withDelay(delay + 200, withSpring(1, { damping: 12, stiffness: 100 }));
  }, [delay, opacity, translateY, iconScale]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value }
      ]
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }]
    };
  });

  return (
    <AnimatedView
      style={containerAnimatedStyle}
      className={`items-center mb-6 ${isSmallScreen ? 'w-full' : 'flex-1 mx-2'}`}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Step ${number}: ${title}`}
      accessibilityHint={description}
    >
      <AnimatedView
        style={iconAnimatedStyle}
        className="bg-orange-100 rounded-full w-16 h-16 items-center justify-center mb-3"
      >
        <FontAwesome5
          name={iconName}
          size={getFontSize({ small: 24, medium: 28, large: 32 })}
          color="#f97316"
        />
      </AnimatedView>
      <Text className={`font-semibold text-gray-700 mb-1 text-center ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
        {number}. {title}
      </Text>
      <Text className={`text-gray-600 text-center max-w-xs ${isSmallScreen ? 'text-sm' : 'text-base'}`}>
        {description}
      </Text>
    </AnimatedView>
  );
}

export default function GetHelpStepsCard() {
  const { isSmallScreen, getFontSize } = useResponsiveStyles();
  const colorScheme = useColorScheme() ?? 'light';

  // Animation values for title
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-20);
  const cardScale = useSharedValue(0.95);

  // Entrance animations
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 800 });
    titleTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
    cardScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [titleOpacity, titleTranslateY, cardScale]);

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }]
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }]
    };
  });

  return (
    <View className="flex-1 items-center justify-center px-4 py-8">
      <AnimatedView
        style={[cardAnimatedStyle, styles.cardShadow]}
        className={`w-full max-w-4xl rounded-xl overflow-hidden ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <View className="py-8 px-6">
          <Animated.Text
            style={titleAnimatedStyle}
            className={`font-bold text-center ${colorScheme === 'dark' ? 'text-white' : 'text-gray-800'} mb-8 ${isSmallScreen ? 'text-2xl' : 'text-3xl'}`}
          >
            Get Help in 3 Simple Steps
          </Animated.Text>

          <View className={isSmallScreen ? "space-y-4" : "flex-row justify-between"}>
            <Step
              number={1}
              title="Describe Your Need"
              description="Tell us what you need help with, either by chatting with our AI assistant or browsing service categories."
              iconName="comments"
              delay={200}
            />

            <Step
              number={2}
              title="Get Matched"
              description="We'll match you with qualified professionals in your area who specialize in your specific needs."
              iconName="users-cog"
              delay={400}
            />

            <Step
              number={3}
              title="Book & Relax"
              description="Schedule your appointment, get confirmation, and relax knowing a professional is on the way."
              iconName="calendar-check"
              delay={600}
            />
          </View>
        </View>
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  }
});
