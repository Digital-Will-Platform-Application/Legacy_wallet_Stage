import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '@/lib/theme';

export default function AdminSettingsScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Create admins here. New admins will sign in and be redirected to the Admin Panel (same layout without Admin Settings).
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-add-outline" size={22} color={colors.foreground} />
          <Text style={styles.cardTitle}>Create admin</Text>
        </View>
        <Text style={styles.cardDesc}>
          Enter name, email, and password. A new account is created and added as Admin. When they log in with these credentials they are redirected to the Admin Panel (same as Super Admin except Admin Settings is hidden).
        </Text>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor={colors.mutedForeground}
          value={fullName}
          onChangeText={setFullName}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@example.com"
          placeholderTextColor={colors.mutedForeground}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Min 8 chars, upper, lower, number, special"
          placeholderTextColor={colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.hint}>Same rules as user signup (strong password, not leaked).</Text>
        <Pressable style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Save — Create admin</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people-outline" size={22} color={colors.foreground} />
          <Text style={styles.cardTitle}>Admins (0)</Text>
        </View>
        <Text style={styles.cardDesc}>Super Admin and created admins. Only Super Admin can add or remove.</Text>
        <Text style={styles.errorText}>Failed to load admins.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24 },
  subtitle: { ...typography.body, color: colors.mutedForeground, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground },
  cardDesc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 16, lineHeight: 20 },
  label: { fontSize: 12, color: colors.mutedForeground, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  hint: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.primaryForeground, fontWeight: '600', fontSize: 16 },
  errorText: { color: colors.destructive, fontSize: 14 },
});
