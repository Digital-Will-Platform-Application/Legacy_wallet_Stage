import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/lib/theme';

type Reminder = { id: string; title: string; next_reminder_date: string; is_active: boolean };

export default function RemindersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('reminders').select('id, title, next_reminder_date, is_active').eq('user_id', user.id).then(({ data }) => {
      setReminders(data ?? []);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Pressable style={styles.header} onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No reminders. Add from web.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.meta}>{item.next_reminder_date} · {item.is_active ? 'Active' : 'Inactive'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { padding: 16 },
  back: { color: colors.gold, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '600', color: colors.foreground, paddingHorizontal: 16, marginBottom: 16 },
  list: { padding: 16, paddingBottom: 32 },
  empty: { color: colors.mutedForeground, textAlign: 'center' },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: radius.card, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.foreground, fontWeight: '600' },
  meta: { color: colors.mutedForeground, fontSize: 12, marginTop: 4 },
});
