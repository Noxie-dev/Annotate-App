import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Import components
import CallToActionSection from '@/components/CallToActionSection';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PopularServicesSection from '@/components/PopularServicesSection';
import TrustSection from '@/components/TrustSection';

export default function HomeScreen() {
  const router = useRouter();

  const handleChatWithAndyPress = () => {
    // Navigate to the AI chat screen
    router.push('/chat');
  };

  const handleBrowseServicesPress = () => {
    // Navigate to services screen
    router.push('/services');
  };

  const handleServicePress = (serviceId: string) => {
    // Navigate to specific service category
    router.push(`/services/${serviceId}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroSection
          onChatWithAndyPress={handleChatWithAndyPress}
          onBrowseServicesPress={handleBrowseServicesPress}
        />

        <HowItWorksSection />

        <View style={styles.section}>
          <PopularServicesSection onServicePress={handleServicePress} />
        </View>

        <View style={styles.section}>
          <TrustSection />
        </View>

        <View style={styles.section}>
          <CallToActionSection
            onChatWithAndyPress={handleChatWithAndyPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background (gray-50)
  },
  scrollContent: {
    paddingBottom: 80,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },
});