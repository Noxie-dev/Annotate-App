import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Import components
import CallToActionSection from '../components/CallToActionSection';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PopularServicesSection from '../components/PopularServicesSection';
import TrustSection from '../components/TrustSection';

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

  const handleHowItWorksPress = () => {
    // Navigate to how it works screen
    router.push('/how-it-works');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <HeroSection
          onChatWithAndyPress={handleChatWithAndyPress}
          onBrowseServicesPress={handleBrowseServicesPress}
        />

        <View className="px-4 mb-4 mt-6">
          <HowItWorksSection />
          <TouchableOpacity
            onPress={handleHowItWorksPress}
            className="mt-2 items-center"
          >
            <Text className="text-blue-600 font-semibold">View Detailed Steps</Text>
          </TouchableOpacity>
        </View>

        <View className="px-4 mb-4">
          <PopularServicesSection onServicePress={handleServicePress} />
        </View>

        <View className="px-4 mb-4">
          <TrustSection />
        </View>

        <View className="px-4 mb-4">
          <CallToActionSection
            onChatWithAndyPress={handleChatWithAndyPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

