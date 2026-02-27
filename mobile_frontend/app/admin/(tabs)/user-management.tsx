import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '@/lib/theme';

export default function AdminUserManagementScreen() {
  const [search, setSearch] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Manage and view all registered users</Text>
      <Pressable style={styles.refreshBtn}>
        <Ionicons name="refresh" size={18} color={colors.foreground} />
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name, email, mobile..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Users</Text>
        <Text style={styles.errorText}>Failed to load data.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 24 },
  subtitle: { ...typography.body, color: colors.mutedForeground, marginBottom: 12 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginBottom: 16 },
  refreshText: { fontSize: 14, color: colors.foreground, fontWeight: '500' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.input,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.foreground },
  panel: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: { ...typography.headingSection, color: colors.foreground, marginBottom: 12 },
  errorText: { color: colors.destructive, fontSize: 14 },
});
