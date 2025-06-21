import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

interface CallToActionSectionProps {
  onChatWithAndyPress: () => void;
}

export default function CallToActionSection({ onChatWithAndyPress }: CallToActionSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { isSmallScreen, getFontSize, getSpacing } = useResponsiveStyles();
  
  // Responsive styles
  const dynamicStyles = {
    content: {
      padding: getSpacing({ small: 24, medium: 32, large: 40 }),
    },
    icon: {
      marginBottom: getSpacing({ small: 16, medium: 20, large: 24 }),
    },
    title: {
      fontSize: getFontSize({ small: 24, medium: 28, large: 32 }),
      marginBottom: getSpacing({ small: 8, medium: 12, large: 16 }),
    },
    description: {
      fontSize: getFontSize({ small: 16, medium: 18, large: 20 }),
      marginBottom: getSpacing({ small: 24, medium: 28, large: 32 }),
      maxWidth: isSmallScreen ? '100%' : '80%',
    },
    button: {
      paddingVertical: getSpacing({ small: 12, medium: 14, large: 16 }),
      paddingHorizontal: getSpacing({ small: 24, medium: 28, large: 32 }),
    },
    buttonText: {
      fontSize: getFontSize({ small: 16, medium: 16, large: 18 }),
    },
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === 'dark' 
            ? ['#1D3D47', '#2A5769'] 
            : ['#A1CEDC', '#7FB3C8']
        }
        style={styles.gradientContainer}
      >
        <View style={[styles.content, dynamicStyles.content]}>
          <IconSymbol
            name="message.fill"
            size={getFontSize({ small: 40, medium: 48, large: 56 })}
            color="#FFFFFF"
            style={[styles.icon, dynamicStyles.icon]}
          />
          
          <ThemedText 
            type="title" 
            style={[styles.title, dynamicStyles.title]}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            Need Help Deciding?
          </ThemedText>
          
          <ThemedText 
            style={[styles.description, dynamicStyles.description]}
            lightColor="#FFFFFF"
            darkColor="#FFFFFF"
          >
            Chat with Andy, our AI assistant, to find the perfect service for your needs
          </ThemedText>
          
          <Pressable
            style={[styles.button, dynamicStyles.button]}
            onPress={onChatWithAndyPress}
          >
            <ThemedText 
              type="defaultSemiBold" 
              style={[styles.buttonText, dynamicStyles.buttonText, { color: '#222' }]}
              lightColor={Colors.light.tint}
              darkColor={Colors.dark.tint}
            >
              Chat with Andy
            </ThemedText>
            <IconSymbol
              name="arrow.right"
              size={getFontSize({ small: 16, medium: 18, large: 20 })}
              color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
            />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginHorizontal: -16, // Extend beyond parent padding
  },
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16, // Add back the margin to maintain alignment
  },
  content: {
    alignItems: 'center',
  },
  icon: {},
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.9,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.accent, // Use orange accent for CTA
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    marginRight: 8,
  },
});
