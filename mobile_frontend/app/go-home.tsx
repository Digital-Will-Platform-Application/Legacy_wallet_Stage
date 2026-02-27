import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

/**
 * Root-level redirect screen. Navigate here after logout so we land on the real home (app/index).
 * Replaces itself with '/' immediately.
 */
export default function GoHomeScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.gold} />
      <Text style={styles.text}>Taking you home…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: { marginTop: 12, fontSize: 16, color: colors.mutedForeground },
});
