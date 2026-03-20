import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wills"
        options={{
          title: 'Wills',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipients"
        options={{
          title: 'Recipients',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, size }) => <Ionicons name="folder-open-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
