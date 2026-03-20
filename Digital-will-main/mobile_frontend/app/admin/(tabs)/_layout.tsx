import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

const ADMIN_TAB_ACTIVE = '#1E3A5F';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: ADMIN_TAB_ACTIVE,
        tabBarInactiveTintColor: colors.mutedForeground,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Admin Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user-management"
        options={{
          title: 'User Management',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Admin Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
