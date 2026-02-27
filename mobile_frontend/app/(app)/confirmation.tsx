import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '@/lib/theme';

export default function ConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: (insets.bottom || 24) }]}>
      <Ionicons name="checkmark-circle" size={64} color={colors.success} style={styles.icon} />
      <Text style={styles.title}>Will submitted</Text>
      <Text style={styles.body}>Your will has been submitted successfully.</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/dashboard')}>
        <Text style={styles.buttonText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center', alignItems: 'center' },
  icon: { marginBottom: 16 },
  title: { ...typography.headingSection, color: colors.foreground, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 16, color: colors.mutedForeground, marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: colors.gold, paddingVertical: 14, paddingHorizontal: 24, borderRadius: radius.button, alignItems: 'center', width: '100%', maxWidth: 280 },
  buttonText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
});
