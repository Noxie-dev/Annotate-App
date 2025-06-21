import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';

import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type StepProps = {
  number: number;
  title: string;
  description: string;
  iconName: string;
  delay: number;
};

function Step({ number, title, description, iconName, delay }: StepProps) {
  const { getFontSize, isSmallScreen } = useResponsiveStyles();

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(1);
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
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }]
    };
  });

  // Handle hover/press effect
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={containerAnimatedStyle}
      className={`items-center mb-8 ${isSmallScreen ? 'w-full' : 'flex-1 mx-2'}`}
      accessible={true}
      accessibilityRole="button"
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
    </AnimatedPressable>
  );
}

export default function HowItWorksSection() {
  const { isSmallScreen, getFontSize } = useResponsiveStyles();

  // Animation values for title
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-20);

  // Entrance animations
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 800 });
    titleTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [titleOpacity, titleTranslateY]);

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }]
    };
  });

  return (
    <View className="py-12 bg-white px-4 rounded-lg shadow-sm">
      <Animated.Text
        style={titleAnimatedStyle}
        className={`font-bold text-center text-gray-800 mb-8 ${isSmallScreen ? 'text-2xl' : 'text-3xl'}`}
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
  );
}


