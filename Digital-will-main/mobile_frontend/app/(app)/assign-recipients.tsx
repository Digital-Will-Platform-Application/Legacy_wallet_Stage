import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '@/lib/theme';

type Asset = { id: string; name: string; category: string; estimated_value: number | null };
type Recipient = { id: string; full_name: string; email: string | null; relationship: string | null };
type Allocation = { id: string; asset_id: string; recipient_id: string; allocation_percentage: number };

export default function AssignRecipientsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { assetId } = useLocalSearchParams<{ assetId: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [existingAllocations, setExistingAllocations] = useState<Allocation[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!assetId || !user) return;
    (async () => {
      try {
        const [assetRes, recRes, allocRes] = await Promise.all([
          supabase.from('assets').select('id, name, category, estimated_value').eq('id', assetId).single(),
          supabase.from('recipients').select('id, full_name, email, relationship').order('full_name'),
          supabase.from('asset_allocations').select('id, asset_id, recipient_id, allocation_percentage').eq('asset_id', assetId),
        ]);
        if (assetRes.data) setAsset(assetRes.data);
        if (recRes.data) setRecipients(recRes.data);
        if (allocRes.data) {
          setExistingAllocations(allocRes.data);
          setSelectedIds(new Set(allocRes.data.map((a) => a.recipient_id)));
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [assetId, user]);

  const toggleRecipient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!assetId || !user || selectedIds.size === 0) {
      Alert.alert('Select at least one recipient');
      return;
    }
    setSaving(true);
    try {
      await supabase.from('asset_allocations').delete().eq('asset_id', assetId);
      const pct = 100 / selectedIds.size;
      await supabase.from('asset_allocations').insert(
        Array.from(selectedIds).map((recipient_id) => ({
          asset_id: assetId,
          recipient_id,
          allocation_percentage: pct,
        }))
      );
      Alert.alert('Saved', 'Recipients assigned with equal shares.');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save allocations');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !asset) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (recipients.length === 0) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.gold} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No recipients yet</Text>
          <Text style={styles.emptyDesc}>Add recipients first, then assign them to this asset.</Text>
          <Pressable style={styles.btnGold} onPress={() => router.push('/recipients')}>
            <Text style={styles.btnGoldText}>Add Recipients</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={colors.gold} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.title}>Assign Recipients</Text>
        <Text style={styles.subtitle}>{asset.name}</Text>
        <Text style={styles.hint}>Select who should receive this asset. They will get equal shares.</Text>
      </View>
      <View style={styles.list}>
        {recipients.map((r) => {
          const isSelected = selectedIds.has(r.id);
          return (
            <Pressable
              key={r.id}
              style={[styles.recipientRow, isSelected && styles.recipientRowSelected]}
              onPress={() => toggleRecipient(r.id)}
            >
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{r.full_name}</Text>
                {r.relationship ? (
                  <Text style={styles.recipientMeta}>{r.relationship}</Text>
                ) : null}
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.saveBtn, (saving || selectedIds.size === 0) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving || selectedIds.size === 0}
      >
        {saving ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color={colors.primary} />
            <Text style={styles.saveBtnText}>Save allocations</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { color: colors.gold, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { ...typography.headingSection, color: colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: 16, color: colors.mutedForeground, marginBottom: 8 },
  hint: { fontSize: 14, color: colors.mutedForeground },
  list: { gap: 12, marginBottom: 24 },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  recipientRowSelected: { borderColor: colors.gold },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  recipientMeta: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, textTransform: 'capitalize' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.gold, borderColor: colors.gold },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: radius.button,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.foreground, marginTop: 16 },
  emptyDesc: { fontSize: 14, color: colors.mutedForeground, marginTop: 8, textAlign: 'center' },
  btnGold: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.button,
    marginTop: 20,
  },
  btnGoldText: { color: colors.primary, fontWeight: '600' },
});
