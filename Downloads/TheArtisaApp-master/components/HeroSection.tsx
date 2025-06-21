import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

// Create animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedImage = Animated.createAnimatedComponent(Image);

// No longer need gesture context type with the new Gesture API

// Floating particle component
function FloatingParticle({
  size,
  initialX,
  initialY,
  delay,
  maxDistance = 15,
  duration = 2000,
  baseOpacity = 0.4,
  color = 'rgba(255, 255, 255, 0.4)'
}: {
  size: number;
  initialX: number;
  initialY: number;
  delay: number;
  maxDistance?: number;
  duration?: number;
  baseOpacity?: number;
  color?: string;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Animate opacity
    opacity.value = withDelay(
      delay,
      withTiming(baseOpacity, { duration: 1000 })
    );

    // Add subtle scale pulsing
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.2, { duration: duration * 1.2, easing: Easing.inOut(Easing.sin) })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    );

    // Animate position with continuous floating effect - vertical
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-maxDistance, {
            duration: duration + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin)
          }),
          withTiming(maxDistance, {
            duration: duration + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin)
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    );

    // Animate position with continuous floating effect - horizontal
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(maxDistance * 0.8, {
            duration: duration * 1.5 + Math.random() * 500,
            easing: Easing.inOut(Easing.sin)
          }),
          withTiming(-maxDistance * 0.8, {
            duration: duration * 1.5 + Math.random() * 500,
            easing: Easing.inOut(Easing.sin)
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    );
  }, [delay, opacity, translateX, translateY, scale, baseOpacity, duration, maxDistance]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      left: initialX,
      top: initialY,
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  return <Animated.View style={animatedStyle} />;
}

type HeroSectionProps = {
  onChatWithAndyPress: () => void;
  onBrowseServicesPress: () => void;
};

export default function HeroSection({
  onChatWithAndyPress,
  onBrowseServicesPress
}: HeroSectionProps) {
  const { width } = useWindowDimensions();
  const {
    isSmallScreen,
    getFontSize,
    getSpacing,
    widthPercentage
  } = useResponsiveStyles();

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const logoScale = useSharedValue(0.8);
  const titleTranslateX = useSharedValue(-20);
  const titleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-100);

  // 3D tilt effect values
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const contentScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0); // For the glowing edge effect

  // Auto-animation control
  const isUserInteracting = useSharedValue(false);
  const autoAnimationActive = useSharedValue(true);
  const prefersReducedMotion = useSharedValue(false);

  // Check for reduced motion preference
  useEffect(() => {
    // Function to update the reduced motion preference
    const updateReducedMotionPreference = (isReduced: boolean) => {
      prefersReducedMotion.value = isReduced;
    };

    if (Platform.OS === 'web') {
      // Web implementation
      try {
        const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (mediaQuery) {
          // Set initial value
          updateReducedMotionPreference(mediaQuery.matches);

          // Modern browsers
          if (typeof mediaQuery.addEventListener === 'function') {
            const handler = (e: any) => updateReducedMotionPreference(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
          }

          // Older browsers - ignore TypeScript warnings with any type
          const mediaQueryAny = mediaQuery as any;
          if (typeof mediaQueryAny.addListener === 'function') {
            const handler = (e: any) => updateReducedMotionPreference(e.matches);
            mediaQueryAny.addListener(handler);
            return () => mediaQueryAny.removeListener(handler);
          }
        }
      } catch {
        // Fallback if window.matchMedia is not available
        console.log('Media query not supported');
      }
    } else {
      // Native implementation using AccessibilityInfo
      // Get initial value
      AccessibilityInfo.isReduceMotionEnabled().then(updateReducedMotionPreference);

      // Listen for changes
      const listener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        updateReducedMotionPreference
      );

      // Cleanup
      return () => {
        listener.remove();
      };
    }

    return () => {};
  }, [prefersReducedMotion]);

  // Automatic tilt animation
  useEffect(() => {
    if (prefersReducedMotion.value) {
      // Respect reduced motion preference
      return;
    }

    // Create a continuous animation loop for automatic tilting
    const autoAnimateX = () => {
      if (!isUserInteracting.value && autoAnimationActive.value) {
        // Animate to a random tilt value between -12 and 12 degrees (increased from -5 to 5)
        const targetX = (Math.random() * 24 - 12);

        // Use spring animation for more dynamic movement
        rotateX.value = withTiming(targetX, {
          duration: 2000 + Math.random() * 1500, // 2-3.5 seconds (faster than before)
          easing: Easing.bezier(0.25, 1, 0.5, 1) // Custom easing for more dynamic movement
        });

        // Animate glow effect based on tilt angle
        const glowIntensity = Math.abs(targetX) / 12; // Normalize to 0-1 range
        glowOpacity.value = withTiming(0.3 + glowIntensity * 0.7, { // Range from 0.3 to 1.0
          duration: 2000,
          easing: Easing.out(Easing.cubic)
        });

        // Schedule the next animation after a shorter delay
        setTimeout(autoAnimateX, 2500 + Math.random() * 1500); // 2.5-4 second interval (faster than before)
      }
    };

    const autoAnimateY = () => {
      if (!isUserInteracting.value && autoAnimationActive.value) {
        // Animate to a random tilt value between -12 and 12 degrees (increased from -5 to 5)
        const targetY = (Math.random() * 24 - 12);

        // Use spring animation for more dynamic movement
        rotateY.value = withTiming(targetY, {
          duration: 2000 + Math.random() * 1500, // 2-3.5 seconds (faster than before)
          easing: Easing.bezier(0.25, 1, 0.5, 1) // Custom easing for more dynamic movement
        });

        // Schedule the next animation after a shorter delay
        setTimeout(autoAnimateY, 2500 + Math.random() * 1500); // 2.5-4 second interval (faster than before)
      }
    };

    // Occasionally add a subtle "pulse" to make the animation more interesting
    const addPulseEffect = () => {
      if (!isUserInteracting.value && autoAnimationActive.value) {
        // Quick scale pulse
        contentScale.value = withSequence(
          withTiming(1.03, { duration: 700, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) })
        );

        // Schedule the next pulse after a random delay
        setTimeout(addPulseEffect, 7000 + Math.random() * 5000); // 7-12 second interval
      }
    };

    // Start the automatic animations with a slight delay
    const initialDelayX = setTimeout(autoAnimateX, 800);
    const initialDelayY = setTimeout(autoAnimateY, 1500); // Offset to avoid synchronization
    const initialPulseDelay = setTimeout(addPulseEffect, 3000);

    // Cleanup timeouts on unmount
    return () => {
      clearTimeout(initialDelayX);
      clearTimeout(initialDelayY);
      clearTimeout(initialPulseDelay);
      autoAnimationActive.value = false;
    };
  }, [rotateX, rotateY, contentScale, glowOpacity, isUserInteracting, autoAnimationActive, prefersReducedMotion]);

  // Gesture handler for 3D tilt effect using the new Gesture API
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Pause automatic animation when user interacts
      isUserInteracting.value = true;

      // Fade out glow effect when user takes control
      glowOpacity.value = withTiming(0, { duration: 300 });
    })
    .onUpdate((event) => {
      // Calculate rotation based on touch position - increased sensitivity
      rotateY.value = event.translationX / 10; // More sensitive than before (was /15)
      rotateX.value = -event.translationY / 10; // More sensitive than before (was /15)

      // Limit rotation to a reasonable range - increased range
      rotateY.value = Math.min(Math.max(rotateY.value, -15), 15); // Increased from -10,10
      rotateX.value = Math.min(Math.max(rotateX.value, -15), 15); // Increased from -10,10

      // Add subtle scale based on movement intensity
      const movementIntensity = Math.sqrt(
        Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
      ) / 300; // Normalize
      contentScale.value = 1 + Math.min(movementIntensity, 0.05); // Max 5% scale increase
    })
    .onEnd(() => {
      // Animate back to center position with more bouncy spring
      rotateX.value = withSpring(0, { damping: 8, stiffness: 80 }); // More bouncy
      rotateY.value = withSpring(0, { damping: 8, stiffness: 80 }); // More bouncy
      contentScale.value = withSpring(1, { damping: 12, stiffness: 100 });

      // Resume automatic animation after a short delay
      setTimeout(() => {
        isUserInteracting.value = false;
      }, 1000);
    });

  // Entrance animations
  useEffect(() => {
    // Animate content container
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withTiming(0, { duration: 800 });

    // Animate logo with spring effect
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));

    // Animate title with slide-in effect
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    titleTranslateX.value = withDelay(400, withTiming(0, { duration: 600 }));

    // Animate subtitle
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(600, withTiming(0, { duration: 600 }));

    // Animate buttons
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    buttonsTranslateY.value = withDelay(800, withTiming(0, { duration: 600 }));

    // Start shimmer animation
    shimmerPosition.value = withDelay(
      1000,
      withRepeat(
        withTiming(width + 100, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1, // Infinite repeat
        false // Don't reverse
      )
    );
  }, [
    buttonsOpacity,
    buttonsTranslateY,
    contentOpacity,
    contentTranslateY,
    logoScale,
    shimmerPosition,
    subtitleOpacity,
    subtitleTranslateY,
    titleOpacity,
    titleTranslateX,
    width
  ]);

  // Animated styles
  // Add a glow effect style
  const glowEffectStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(249, 115, 22, 0.6)', // Orange glow matching highlight color
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity.value,
      shadowRadius: 15,
      opacity: glowOpacity.value,
      // No need for elevation on Android as we'll use a different approach
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    // Calculate shadow intensity based on rotation
    const rotationIntensity = (Math.abs(rotateX.value) + Math.abs(rotateY.value)) / 24; // Normalize to 0-1

    return {
      opacity: contentOpacity.value,
      transform: [
        { translateY: contentTranslateY.value },
        { perspective: 1200 }, // Increased from 1000 for more dramatic effect
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: contentScale.value }
      ],
      // Dynamic shadow based on tilt angle
      shadowColor: '#000',
      shadowOffset: {
        width: rotateY.value * 0.5,
        height: rotateX.value * 0.5
      },
      shadowOpacity: 0.3 + rotationIntensity * 0.3, // 0.3-0.6 range
      shadowRadius: 15 + rotationIntensity * 10, // 15-25px range
      elevation: 10 + rotationIntensity * 10, // 10-20 range for Android
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateX: titleTranslateX.value }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
      transform: [{ translateY: subtitleTranslateY.value }],
    };
  });

  const buttonsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonsOpacity.value,
      transform: [{ translateY: buttonsTranslateY.value }],
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: shimmerPosition.value,
      top: 0,
      width: 100,
      height: '100%',
      opacity: 0.3,
    };
  });

  // Button press animations
  const primaryButtonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);

  const primaryButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: primaryButtonScale.value }],
    };
  });

  const secondaryButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: secondaryButtonScale.value }],
    };
  });

  // Handle button press animations with haptic feedback
  const handlePrimaryButtonPressIn = () => {
    primaryButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePrimaryButtonPressOut = () => {
    primaryButtonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleSecondaryButtonPressIn = () => {
    secondaryButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSecondaryButtonPressOut = () => {
    secondaryButtonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  // Dynamically calculate styles based on screen size
  const dynamicStyles = {
    container: {
      // Increased overall height of the hero section
      height: getSpacing({ small: 450, medium: 550, large: 650 }),
    },
    backgroundImage: {
      // Match the container height
      height: getSpacing({ small: 450, medium: 550, large: 650 }),
    },
    contentWrapper: {
      // Add padding to position the content in the middle
      paddingTop: getSpacing({ small: 60, medium: 80, large: 100 }),
      paddingBottom: getSpacing({ small: 60, medium: 80, large: 100 }),
    },
    content: {
      // Adjust content dimensions to create floating effect
      width: isSmallScreen ? widthPercentage(90) : widthPercentage(80),
      height: getSpacing({ small: 320, medium: 380, large: 440 }),
      // Internal padding
      paddingVertical: getSpacing({ small: 40, medium: 50, large: 60 }),
      paddingHorizontal: getSpacing({ small: 16, medium: 32, large: 48 }),
    },
    logo: {
      width: getSpacing({ small: 120, medium: 150, large: 180 }),
      height: getSpacing({ small: 80, medium: 100, large: 120 }),
      marginBottom: getSpacing({ small: 16, medium: 20, large: 24 }),
    },
    title: {
      fontSize: getFontSize({ small: 30, medium: 36, large: 42 }),
      marginBottom: getSpacing({ small: 16, medium: 20, large: 24 }),
    },
    subtitle: {
      fontSize: getFontSize({ small: 16, medium: 18, large: 20 }),
      marginBottom: getSpacing({ small: 24, medium: 32, large: 40 }),
      maxWidth: isSmallScreen ? widthPercentage(90) : widthPercentage(80),
    },
    buttonsContainer: {
      flexDirection: isSmallScreen ? 'column' as const : 'row' as const,
      width: '100%' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    primaryButton: {
      marginBottom: isSmallScreen ? 12 : 0,
      marginRight: isSmallScreen ? 0 : 12,
      width: isSmallScreen ? '100%' as const : undefined,
      paddingVertical: getSpacing({ small: 12, medium: 14, large: 16 }),
    },
    secondaryButton: {
      width: isSmallScreen ? '100%' as const : undefined,
      paddingVertical: getSpacing({ small: 12, medium: 14, large: 16 }),
    },
    buttonText: {
      fontSize: getFontSize({ small: 16, medium: 16, large: 18 }),
    },
  };

  // Define styles
  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      overflow: 'hidden',
      // Base height will be overridden by dynamic styles
      height: 450,
    },
    backgroundImage: {
      width: '100%',
      height: '100%', // Take full height of container
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    contentWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      // Position in the center of the wrapper
      alignItems: 'center',
      justifyContent: 'center',
      // Base shadow (will be dynamically enhanced by animated style)
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      // Add backdrop for Android (iOS uses BlurView)
      ...Platform.select({
        android: {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 16,
        },
        ios: {
          borderRadius: 16,
          overflow: 'visible', // Allow shadow to extend beyond borders
        }
      }),
      // Ensure content is above the glow effect
      zIndex: 1,
    },
    logo: {
      width: 120, // Base width, will be overridden by dynamic styles
      height: 80, // Base height, will be overridden by dynamic styles
      marginBottom: 16,
    },
    title: {
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 5,
    },
    highlight: {
      color: '#F97316', // orange-500
      textShadowColor: 'rgba(249, 115, 22, 0.5)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
    subtitle: {
      color: 'white',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    bold: {
      fontWeight: 'bold',
    },
    primaryButton: {
      backgroundColor: '#F97316', // orange-500
      paddingHorizontal: 24,
      borderRadius: 12,
      maxWidth: 320,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      // Add shadow for depth
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    secondaryButton: {
      backgroundColor: '#374151', // gray-700
      paddingHorizontal: 24,
      borderRadius: 12,
      maxWidth: 320,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      // Add shadow for depth
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AnimatedImage
        source={{ uri: "https://placehold.co/414x300/3b82f6/3b82f6" }}
        style={[styles.backgroundImage, dynamicStyles.backgroundImage]}
        contentFit="cover"
      />

      {/* Gradient overlay */}
      <AnimatedLinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
        style={styles.gradient}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, index) => {
        // Create more variety in particle appearance and behavior
        const isSmallParticle = Math.random() > 0.7;
        const size = isSmallParticle
          ? Math.random() * 4 + 2  // Small particles: 2-6px
          : Math.random() * 10 + 6; // Larger particles: 6-16px

        // Vary opacity based on size (smaller particles are more transparent)
        const baseOpacity = isSmallParticle
          ? 0.2 + Math.random() * 0.3 // 0.2-0.5 opacity for small particles
          : 0.3 + Math.random() * 0.4; // 0.3-0.7 opacity for larger particles

        // Vary animation speed and distance
        const duration = 1500 + Math.random() * 2000; // 1.5-3.5s
        const maxDistance = 10 + Math.random() * 20; // 10-30px

        // Distribute particles more evenly across the hero section
        // Use modulo to create a grid-like distribution but with randomness
        const columnCount = 5;
        const rowCount = 4;
        const columnWidth = width / columnCount;
        const rowHeight = (dynamicStyles.backgroundImage.height as number) / rowCount;

        // Calculate base position in the grid
        const column = index % columnCount;
        const row = Math.floor(index / columnCount) % rowCount;

        // Add randomness within the grid cell
        const initialX = (column * columnWidth) + (Math.random() * columnWidth);
        const initialY = (row * rowHeight) + (Math.random() * rowHeight);

        // Vary the color slightly
        const colorVariant = Math.random() > 0.8
          ? 'rgba(249, 115, 22, 0.3)' // Occasional orange particles (matching highlight color)
          : 'rgba(255, 255, 255, 0.4)'; // Default white particles

        return (
          <FloatingParticle
            key={index}
            size={size}
            initialX={initialX}
            initialY={initialY}
            delay={index * 100} // Stagger the animations more quickly
            maxDistance={maxDistance}
            duration={duration}
            baseOpacity={baseOpacity}
            color={colorVariant}
          />
        );
      })}

      {/* Shimmer effect */}
      <AnimatedLinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={shimmerAnimatedStyle}
      />

      {/* Content wrapper to center the 3D content vertically */}
      <View style={[styles.contentWrapper, dynamicStyles.contentWrapper]}>
        {/* Content with 3D tilt effect */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.content, dynamicStyles.content, contentAnimatedStyle]}>
            {/* Glowing edge effect */}
            <Animated.View style={glowEffectStyle} />

            {/* Backdrop blur for content (iOS only) */}
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={20}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                tint="dark"
              />
            )}

          {/* Logo */}
          <AnimatedImage
            source={require('@/assets/images/artisan-logo.png')}
            style={[styles.logo, dynamicStyles.logo, logoAnimatedStyle]}
            contentFit="contain"
          />

          <Animated.Text style={[styles.title, dynamicStyles.title, titleAnimatedStyle]}>
            Reliable Pros, <Text style={styles.highlight}>Instantly.</Text>
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, dynamicStyles.subtitle, subtitleAnimatedStyle]}>
            Need a plumber, electrician, or handyman? Describe your issue to{' '}
            <Text style={styles.bold}>Handy-Andy</Text>, our AI assistant, or browse trusted local artisans.
          </Animated.Text>

          <Animated.View style={[dynamicStyles.buttonsContainer, buttonsAnimatedStyle]}>
            <AnimatedPressable
              onPress={onChatWithAndyPress}
              onPressIn={handlePrimaryButtonPressIn}
              onPressOut={handlePrimaryButtonPressOut}
              style={[styles.primaryButton, dynamicStyles.primaryButton, primaryButtonAnimatedStyle]}
            >
              <FontAwesome5
                name="robot"
                size={getFontSize({ small: 16, medium: 18, large: 20 })}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Chat with Handy-Andy</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={onBrowseServicesPress}
              onPressIn={handleSecondaryButtonPressIn}
              onPressOut={handleSecondaryButtonPressOut}
              style={[styles.secondaryButton, dynamicStyles.secondaryButton, secondaryButtonAnimatedStyle]}
            >
              <FontAwesome5
                name="tools"
                size={getFontSize({ small: 16, medium: 18, large: 20 })}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.buttonText, dynamicStyles.buttonText]}>Browse Services</Text>
            </AnimatedPressable>
          </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}


