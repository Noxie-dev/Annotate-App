import { Stack } from 'expo-router';
import React from 'react';

export default function ConnectLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          headerShown: true,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
