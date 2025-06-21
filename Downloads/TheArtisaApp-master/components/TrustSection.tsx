import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

export default function TrustSection() {
  const colorScheme = useColorScheme() ?? 'light';
  const { isSmallScreen, isMediumScreen, getFontSize } = useResponsiveStyles();

  const trustPoints = [
    {
      id: '1',
      title: 'Verified Professionals',
      description: 'All artisans undergo thorough background checks',
      icon: 'checkmark.shield.fill',
    },
    {
      id: '2',
      title: 'Satisfaction Guarantee',
      description: 'Not happy? We\'ll make it right or refund your payment',
      icon: 'hand.thumbsup.fill',
    },
    {
      id: '3',
      title: 'Secure Payments',
      description: 'Your payment is protected until the job is complete',
      icon: 'lock.fill',
    },
  ];

  const testimonials = [
    {
      id: '1',
      text: "The plumber arrived on time and fixed our issue in less than an hour. Excellent service!",
      author: "Sarah J.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      id: '2',
      text: "I've used The Artisan App for multiple services and have always been impressed with the quality.",
      author: "Michael T.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
  ];

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={[styles.title, { color: '#222' }]}>
        Why Choose Us
      </ThemedText>

      <View style={[
        styles.trustPointsContainer,
        !isSmallScreen && { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }
      ]}>
        {trustPoints.map((point) => (
          <ThemedView
            key={point.id}
            style={[
              styles.trustPointItem,
              !isSmallScreen && { width: isMediumScreen ? '48%' : '31%' }
            ]}
            lightColor="#1D3D47"
            darkColor="#1D3D47"
          >
            <IconSymbol
              name={point.icon as any}
              size={getFontSize({ small: 28, medium: 32, large: 36 })}
              color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
              style={styles.trustPointIcon}
            />

            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.trustPointTitle,
                { fontSize: getFontSize({ small: 16, medium: 18, large: 20 }) }
              ]}
            >
              {point.title}
            </ThemedText>

            <ThemedText
              style={[
                styles.trustPointDescription,
                { fontSize: getFontSize({ small: 14, medium: 14, large: 16 }) }
              ]}
            >
              {point.description}
            </ThemedText>
          </ThemedView>
        ))}
      </View>

      <ThemedText type="defaultSemiBold" style={[styles.testimonialsTitle, { color: '#222' }]}>
        What Our Customers Say
      </ThemedText>

      <View style={[
        styles.testimonialsContainer,
        !isSmallScreen && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }
      ]}>
        {testimonials.map((testimonial) => (
          <ThemedView
            key={testimonial.id}
            style={[
              styles.testimonialItem,
              !isSmallScreen && { width: '48%' }
            ]}
            lightColor="#1D3D47"
            darkColor="#1D3D47"
          >
            <View style={styles.testimonialHeader}>
              <Image
                source={{ uri: testimonial.avatar }}
                style={[
                  styles.testimonialAvatar,
                  { width: getFontSize({ small: 40, medium: 48, large: 56 }),
                    height: getFontSize({ small: 40, medium: 48, large: 56 }),
                    borderRadius: getFontSize({ small: 20, medium: 24, large: 28 }) }
                ]}
              />
              <View style={styles.testimonialAuthorContainer}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.testimonialAuthor,
                    { fontSize: getFontSize({ small: 16, medium: 16, large: 18 }) }
                  ]}
                >
                  {testimonial.author}
                </ThemedText>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <IconSymbol
                      key={i}
                      name="star.fill"
                      size={getFontSize({ small: 12, medium: 14, large: 16 })}
                      color={i < testimonial.rating ? "#FFD700" : "#E0E0E0"}
                      style={styles.starIcon}
                    />
                  ))}
                </View>
              </View>
            </View>
            <ThemedText
              style={[
                styles.testimonialText,
                { fontSize: getFontSize({ small: 14, medium: 15, large: 16 }) }
              ]}
            >
              "{testimonial.text}"
            </ThemedText>
          </ThemedView>
        ))}
      </View>
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
  trustPointsContainer: {
    marginBottom: 24,
  },
  trustPointItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  trustPointIcon: {
    marginBottom: 12,
  },
  trustPointTitle: {
    marginBottom: 8,
  },
  trustPointDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  testimonialsTitle: {
    marginBottom: 16,
  },
  testimonialsContainer: {
    gap: 12,
  },
  testimonialItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  testimonialAuthorContainer: {
    flex: 1,
  },
  testimonialAuthor: {
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 2,
  },
  testimonialText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
