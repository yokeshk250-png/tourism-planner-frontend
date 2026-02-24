import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const init = useAuthStore(s => s.init);

  useEffect(() => { init(); }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="plan/index" />
          <Stack.Screen name="plan/results" />
          <Stack.Screen name="plan/schedule" />
          <Stack.Screen name="plan/customize" />
          <Stack.Screen name="trip/[id]" />
          <Stack.Screen name="trip/checkin" />
          <Stack.Screen name="trip/checkout" />
          <Stack.Screen name="trip/replan" />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
