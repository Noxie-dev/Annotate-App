import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import LogoHeader from '@/components/LogoHeader';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat"
          options={{
            headerTitle: () => <LogoHeader title="Chat with Handy-Andy" />,
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen
          name="connect"
          options={{
            headerTitle: () => <LogoHeader title="Connect" />,
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen
          name="service/[id]"
          options={{
            headerTitle: () => <LogoHeader title="Service Details" />,
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen
          name="services"
          options={{
            headerTitle: () => <LogoHeader title="All Services" />,
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen
          name="how-it-works"
          options={{
            headerTitle: () => <LogoHeader title="How It Works" />,
            headerTitleAlign: 'center'
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
