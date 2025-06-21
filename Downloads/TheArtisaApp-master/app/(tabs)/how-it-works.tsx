import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, View } from 'react-native';

import GetHelpStepsCard from '@/components/GetHelpStepsCard';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HowItWorksTabScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <GetHelpStepsCard />
      </ScrollView>
    </View>
  );
}
