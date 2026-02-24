import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/colors';

export default function Index() {
  const router      = useRouter();
  const user        = useAuthStore(s => s.user);
  const initialized = useAuthStore(s => s.initialized);

  useEffect(() => {
    if (!initialized) return;
    if (user) router.replace('/(tabs)/home');
    else      router.replace('/(auth)/login');
  }, [initialized, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
      <ActivityIndicator size="large" color={Colors.white} />
    </View>
  );
}
