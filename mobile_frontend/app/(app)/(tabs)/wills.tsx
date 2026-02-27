import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/lib/theme';

type Will = { id: string; title: string; status: string; type: string; updated_at: string };

export default function WillsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWills = async () => {
    if (!user) return;
    const { data } = await supabase.from('wills').select('id, title, status, type, updated_at').order('updated_at', { ascending: false });
    if (data) setWills(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWills();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWills(); }} tintColor={colors.gold} />}
        ListEmptyComponent={<Text style={styles.empty}>No wills yet. Create one from Dashboard.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/will/${item.id}`)}>
            <Text style={styles.title}>{item.title || 'Untitled'}</Text>
            <Text style={styles.meta}>{item.status} · {item.type}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/create')}>
        <Text style={styles.fabText}>+ Create Will</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 80 },
  empty: { color: colors.mutedForeground, textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: radius.card, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.foreground, fontWeight: '600', fontSize: 16 },
  meta: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: colors.gold, paddingVertical: 14, borderRadius: radius.button, alignItems: 'center' },
  fabText: { color: colors.primary, fontWeight: '600' },
});
