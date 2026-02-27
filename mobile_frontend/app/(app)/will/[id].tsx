import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors, typography, radius } from '@/lib/theme';

type Will = { id: string; title: string; status: string; type: string; content: string | null; transcript: string | null; notes: string | null };

export default function WillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [will, setWill] = useState<Will | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    supabase.from('wills').select('id, title, status, type, content, transcript, notes').eq('id', id).eq('user_id', user.id).single().then(({ data }) => {
      setWill(data ?? null);
      setLoading(false);
    });
  }, [id, user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!will) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Will not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>{will.title || 'Untitled'}</Text>
      <Text style={styles.meta}>{will.status} · {will.type}</Text>
      {(will.content || will.transcript) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <Text style={styles.body}>{will.content || will.transcript || ''}</Text>
        </View>
      )}
      {will.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.body}>{will.notes}</Text>
        </View>
      )}
      <Pressable style={styles.button} onPress={() => router.push('/review')}>
        <Text style={styles.buttonText}>Review & submit</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F7' },
  content: { padding: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F7' },
  error: { color: '#ef4444', marginBottom: 12 },
  back: { color: '#5C6B7E', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2C3E5C', marginBottom: 4 },
  meta: { color: '#5C6B7E', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  body: { color: colors.mutedForeground, lineHeight: 22 },
  button: { backgroundColor: colors.gold, paddingVertical: 14, borderRadius: radius.button, alignItems: 'center' },
  buttonText: { color: colors.primary, fontWeight: '600' },
  link: { color: colors.gold, marginTop: 12, fontWeight: '600' },
});
