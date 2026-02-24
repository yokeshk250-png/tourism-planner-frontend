import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:          false,
        tabBarActiveTintColor:Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: {
          backgroundColor:   Colors.white,
          borderTopColor:    Colors.border,
          borderTopWidth:    1,
          paddingBottom:     8,
          paddingTop:        6,
          height:            64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mytrips"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
