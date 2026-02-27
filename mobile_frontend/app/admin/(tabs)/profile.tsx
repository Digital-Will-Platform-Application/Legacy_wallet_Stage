import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '@/lib/theme';

function formatMemberSince(isoDate: string | undefined): string {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
}

export default function AdminProfileScreen() {
  const { user, signOut, updateUser, updatePassword } = useAuth();
  const router = useRouter();
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Admin';
  const [name, setName] = useState(displayName);
  const [mobile, setMobile] = useState((user?.user_metadata?.phone as string) ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    signOut();
    router.replace('/go-home');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await updateUser({ full_name: name.trim() });
    setSaving(false);
    if (error) Alert.alert('Error', error.message || 'Failed to update.');
    else Alert.alert('Success', 'Profile updated.');
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(newPassword);
    setSaving(false);
    if (error) Alert.alert('Error', error.message || 'Failed to update password.');
    else {
      setNewPassword('');
      Alert.alert('Success', 'Password updated.');
    }
  };

  const initial = (displayName || 'A').charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.replace('/admin/(tabs)/dashboard')} style={styles.backRow}>
        <Ionicons name="arrow-back" size={22} color={colors.gold} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.pageTitle}>Admin Profile</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <Text style={styles.cardSubtitle}>Photo and display name.</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="admin"
              placeholderTextColor={colors.mutedForeground}
              editable={!saving}
            />
            <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSaveProfile} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.cardSubtitle}>Email and mobile number.</Text>
        <View style={styles.fieldRow}>
          <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Ionicons name="call-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.label}>Add mobile number</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            placeholder="e.g. 9876543210 or +91 9876543210"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            editable={!saving}
          />
          <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSaveProfile} disabled={saving}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
        <View style={styles.fieldRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.label}>Member since</Text>
          <Text style={styles.value}>{formatMemberSince(user?.created_at)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change password</Text>
        <Text style={styles.cardSubtitle}>Set a new password for your admin account.</Text>
        <TextInput
          style={styles.input}
          placeholder="New password (min 8 characters)"
          placeholderTextColor={colors.mutedForeground}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!saving}
        />
        <Pressable style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleUpdatePassword} disabled={saving}>
          <Text style={styles.saveBtnText}>Update password</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.logoutBtn, loggingOut && styles.logoutBtnDisabled]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color={colors.primaryForeground} />
        ) : (
          <Ionicons name="log-out-outline" size={20} color={colors.primaryForeground} />
        )}
        <Text style={styles.logoutBtnText}>{loggingOut ? 'Logging out…' : 'Logout'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { color: colors.gold, fontWeight: '600', marginLeft: 8 },
  pageTitle: { ...typography.headingSection, color: colors.foreground, marginBottom: 24 },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '600', color: colors.primary },
  nameRow: { flex: 1, minWidth: 0 },
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
  value: { fontSize: 16, color: colors.foreground, marginBottom: 12 },
  fieldRow: { marginBottom: 12 },
  saveBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.button,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.destructive,
    paddingVertical: 16,
    borderRadius: radius.button,
    marginTop: 24,
  },
  logoutBtnDisabled: { opacity: 0.8 },
  logoutBtnText: { fontSize: 16, color: colors.primaryForeground, fontWeight: '600' },
});
