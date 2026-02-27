import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

export default function AppLayout() {
  const { user, loading, isAdmin, adminLoading } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading || adminLoading) return;
    if (!user) {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;
      queueMicrotask(() => router.replace('/'));
    } else if (isAdmin) {
      if (hasRedirectedRef.current) return;
      hasRedirectedRef.current = true;
      queueMicrotask(() => router.replace('/admin'));
    } else {
      hasRedirectedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- omit router to prevent redirect loop
  }, [user, loading, isAdmin, adminLoading]);

  if (loading || adminLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.signingOut}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Signing out...</Text>
      </View>
    );
  }

  if (isAdmin) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="create" />
      <Stack.Screen name="recipients" />
      <Stack.Screen name="review" />
      <Stack.Screen name="will/[id]" />
      <Stack.Screen name="confirmation" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="assign-recipients" />
      <Stack.Screen name="assets-manage" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  signingOut: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { color: colors.mutedForeground, marginTop: 12 },
});
