import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '@/lib/theme';

type TabKey = 'today' | 'week' | 'all';

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [search, setSearch] = useState('');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'today', label: 'Logged in today' },
    { key: 'week', label: 'Accounts this week' },
    { key: 'all', label: 'All registered users' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Overview of users, logins, and signups.</Text>
      <Pressable style={styles.refreshBtn}>
        <Ionicons name="refresh" size={18} color={colors.foreground} />
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>

      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total registered users</Text>
          <Text style={styles.statValue}>1</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Logins today</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>New accounts this week</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor={colors.mutedForeground}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>
          {activeTab === 'today' && "Today's logins"}
          {activeTab === 'week' && "Accounts this week"}
          {activeTab === 'all' && 'All registered users'}
        </Text>
        <Text style={styles.panelSubtitle}>
          {activeTab === 'today' && 'List of users who logged in today.'}
          {activeTab === 'week' && 'List of new accounts this week.'}
          {activeTab === 'all' && 'List of all registered users.'}
        </Text>
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
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '600', color: colors.foreground },
  tabRow: { flexDirection: 'row', marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, color: colors.foreground },
  tabTextActive: { color: colors.primaryForeground, fontWeight: '600' },
  searchInput: {
    backgroundColor: colors.secondary,
    borderRadius: radius.input,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panel: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: { ...typography.headingSection, color: colors.foreground, marginBottom: 4 },
  panelSubtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 12 },
  errorText: { color: colors.destructive, fontSize: 14 },
});
