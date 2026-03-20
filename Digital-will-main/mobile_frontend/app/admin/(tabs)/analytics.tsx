import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '@/lib/theme';

export default function AdminAnalyticsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Logins and signups by period with comparison.</Text>
      <Pressable style={styles.refreshBtn}>
        <Ionicons name="refresh" size={18} color={colors.foreground} />
        <Text style={styles.refreshText}>Refresh</Text>
      </Pressable>

      <View style={styles.cardsRow}>
        <View style={styles.periodCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.periodTitle}>1 Day</Text>
          <Text style={styles.periodSub}>Today (UTC)</Text>
          <Text style={styles.periodStat}>Logins: 0</Text>
          <Text style={styles.periodStat}>New signups: 0</Text>
        </View>
        <View style={styles.periodCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.periodTitle}>1 Week</Text>
          <Text style={styles.periodSub}>This week (UTC)</Text>
          <Text style={styles.periodStat}>Logins: 0</Text>
          <Text style={styles.periodStat}>New signups: 0</Text>
        </View>
        <View style={styles.periodCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
          <Text style={styles.periodTitle}>1 Month</Text>
          <Text style={styles.periodSub}>This month (UTC)</Text>
          <Text style={styles.periodStat}>Logins: 0</Text>
          <Text style={styles.periodStat}>New signups: 1</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Ionicons name="bar-chart-outline" size={20} color={colors.mutedForeground} />
        <Text style={styles.cardTitle}>This week vs last week</Text>
        <Text style={styles.cardStat}>Logins —</Text>
        <Text style={styles.cardStat}>New signups —</Text>
      </View>
      <View style={styles.card}>
        <Ionicons name="bar-chart-outline" size={20} color={colors.mutedForeground} />
        <Text style={styles.cardTitle}>This month vs last month</Text>
        <Text style={[styles.cardStat, styles.positive]}>New signups +100%</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Report summary</Text>
        <View style={styles.tableRow}>
          <Text style={styles.th}>Period</Text>
          <Text style={styles.th}>Logins</Text>
          <Text style={styles.th}>New signups</Text>
          <Text style={styles.th}>Comparison</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.td}>1 Day</Text>
          <Text style={styles.td}>0</Text>
          <Text style={styles.td}>0</Text>
          <Text style={styles.td}>—</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.td}>1 Week</Text>
          <Text style={styles.td}>0</Text>
          <Text style={styles.td}>0</Text>
          <Text style={[styles.td, styles.negative]}>vs last week</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.td}>1 Month</Text>
          <Text style={styles.td}>0</Text>
          <Text style={styles.td}>1</Text>
          <Text style={[styles.td, styles.positive]}>+100% vs last month</Text>
        </View>
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
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  periodCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTitle: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginTop: 4 },
  periodSub: { fontSize: 12, color: colors.mutedForeground, marginBottom: 8 },
  periodStat: { fontSize: 13, color: colors.foreground },
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.foreground },
  cardStat: { fontSize: 13, color: colors.foreground },
  positive: { color: colors.success },
  negative: { color: colors.destructive },
  panel: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: { ...typography.headingSection, color: colors.foreground, marginBottom: 12 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  th: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.mutedForeground },
  td: { flex: 1, fontSize: 13, color: colors.foreground },
});
