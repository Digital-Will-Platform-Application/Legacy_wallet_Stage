import { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '@/lib/theme';

function formatMemberSince(isoDate: string | undefined): string {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
}

export default function AccountScreen() {
  const { user, signOut, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    signOut();
    router.replace('/go-home');
  };

  useEffect(() => {
    const n = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User';
    setName(n);
  }, [user?.user_metadata?.full_name, user?.email]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter a name.');
      return;
    }
    setSaving(true);
    const { error } = await updateUser({ full_name: trimmed });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to update name');
      return;
    }
    Alert.alert('Success', 'Profile updated.');
  };

  const initial = (displayName || 'U').charAt(0).toUpperCase();
  const email = user?.email ?? '—';
  const phone = (user as { phone?: string })?.phone ?? user?.user_metadata?.phone ?? '—';
  const memberSince = formatMemberSince(user?.created_at);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.replace('/(tabs)/dashboard')} style={styles.backRow}>
        <Ionicons name="arrow-back" size={22} color={colors.gold} />
        <Text style={styles.backText}>Back to Dashboard</Text>
      </Pressable>

      <Text style={styles.pageTitle}>User Profile</Text>

      {/* Card 1: Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile</Text>
        <Text style={styles.cardSubtitle}>Photo and display name.</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={colors.primary} />
            </View>
          </View>
          <View style={styles.nameSaveRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              editable={!saving}
            />
            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Card 2: Account */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.cardSubtitle}>Email and member info.</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} style={styles.infoIcon} />
          <View style={styles.infoBlock}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={colors.mutedForeground} style={styles.infoIcon} />
          <View style={styles.infoBlock}>
            <Text style={styles.fieldLabel}>Mobile number</Text>
            <Text style={styles.infoValue}>{phone}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} style={styles.infoIcon} />
          <View style={styles.infoBlock}>
            <Text style={styles.fieldLabel}>Member since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Card 3: Manage account */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manage account</Text>
        <Text style={styles.cardSubtitle}>Password.</Text>
        <Pressable style={styles.manageBtn} onPress={() => router.push('/reset-password')}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.foreground} />
          <Text style={styles.manageBtnText}>Change password</Text>
        </Pressable>
      </View>

      <Pressable style={styles.remindersBtn} onPress={() => router.push('/reminders')}>
        <Ionicons name="notifications-outline" size={20} color={colors.foreground} />
        <Text style={styles.remindersBtnText}>Reminders</Text>
      </Pressable>

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
  content: { padding: 16 },
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
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '600', color: colors.primary },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSaveRow: { flex: 1, minWidth: 0 },
  fieldLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 6 },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  saveBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.button,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  infoIcon: { marginRight: 12 },
  infoBlock: { flex: 1 },
  infoValue: { fontSize: 16, color: colors.foreground },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  manageBtnText: { fontSize: 16, color: colors.foreground, fontWeight: '500' },
  remindersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  remindersBtnText: { fontSize: 16, color: colors.foreground, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.destructive,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.button,
    marginTop: 24,
  },
  logoutBtnDisabled: { opacity: 0.8 },
  logoutBtnText: { fontSize: 16, color: colors.primaryForeground, fontWeight: '600' },
});
