import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/lib/theme';

type Asset = { id: string; name: string; category: string; estimated_value: number | null; currency: string | null };

export default function AssetsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ flow?: string }>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssets = async () => {
    if (!user) return;
    const { data } = await supabase.from('assets').select('id, name, category, estimated_value, currency');
    if (data) setAssets(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  const totalValue = assets.reduce((s, a) => s + (a.estimated_value ?? 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total assets: {assets.length}</Text>
        <Text style={styles.summaryValue}>Value: {totalValue}</Text>
      </View>
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAssets(); }} tintColor={colors.gold} />}
        ListEmptyComponent={<Text style={styles.empty}>No assets. Add from onboarding or dashboard.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.name}</Text>
              <Pressable
                style={styles.assignBtn}
                onPress={() => router.push({ pathname: '/assign-recipients', params: { assetId: item.id } })}
              >
                <Ionicons name="people" size={16} color={colors.gold} />
                <Text style={styles.assignBtnText}>Assign Recipients</Text>
              </Pressable>
            </View>
            <Text style={styles.meta}>{item.category} · {item.estimated_value ?? 0} {item.currency ?? ''}</Text>
          </View>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/asset-add')}>
        <Text style={styles.fabText}>Add Asset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  summary: { padding: 16, backgroundColor: colors.card, marginBottom: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card },
  summaryLabel: { color: colors.mutedForeground },
  summaryValue: { color: colors.foreground, fontWeight: '600', marginTop: 4 },
  list: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: radius.card, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { color: colors.foreground, fontWeight: '600', flex: 1 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  assignBtnText: { fontSize: 13, color: colors.gold, fontWeight: '600' },
  meta: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
  empty: { color: colors.mutedForeground, textAlign: 'center', marginTop: 24 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: radius.button, alignItems: 'center' },
  fabText: { color: colors.primary, fontWeight: '600' },
});
