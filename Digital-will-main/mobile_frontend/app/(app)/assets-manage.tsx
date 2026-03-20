import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '@/lib/theme';

const USD_TO_INR = 83;
function formatINR(value: number | null): string {
  if (value == null) return '—';
  const inr = value * USD_TO_INR;
  return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  property: 'home',
  vehicle: 'car',
  bank_account: 'card',
  investment: 'trending-up',
  jewelry: 'gift',
  digital_asset: 'phone-portrait',
  insurance: 'shield-checkmark',
  business: 'briefcase',
  other: 'folder-open',
};

type Asset = {
  id: string;
  name: string;
  category: string;
  estimated_value: number | null;
  description: string | null;
  documents_url: string | null;
};

type Allocation = { id: string; asset_id: string; recipient_id: string; recipient?: { full_name: string } };

export default function AssetsManageScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ flow?: string }>();
  const insets = useSafeAreaInsets();
  const isFlowMode = params.flow === 'true';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAssetId, setUploadingAssetId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [assetsRes, allocRes] = await Promise.all([
        supabase.from('assets').select('id, name, category, estimated_value, description, documents_url').order('created_at', { ascending: false }),
        supabase.from('asset_allocations').select('id, asset_id, recipient_id'),
      ]);
      const allocList = allocRes.data || [];
      const recipientIds = [...new Set(allocList.map((a) => a.recipient_id))];
      const recRes = recipientIds.length
        ? await supabase.from('recipients').select('id, full_name').in('id', recipientIds)
        : { data: [] };
      const recMap = Object.fromEntries((recRes.data || []).map((r) => [r.id, r]));
      setAllocations(allocList.map((a) => ({ ...a, recipient: recMap[a.recipient_id] })));
      setAssets(assetsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      if (user && !loading) fetchData();
    }, [user, fetchData])
  );

  const getAssetAllocations = (assetId: string) => allocations.filter((a) => a.asset_id === assetId);
  const getCategoryIcon = (category: string) => CATEGORY_ICONS[category] || 'folder-open';

  const handleDeleteAsset = (asset: Asset) => {
    Alert.alert('Delete Asset', `Delete "${asset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.from('asset_allocations').delete().eq('asset_id', asset.id);
            await supabase.from('assets').delete().eq('id', asset.id);
            setAssets((prev) => prev.filter((a) => a.id !== asset.id));
            setAllocations((prev) => prev.filter((a) => a.asset_id !== asset.id));
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to delete asset');
          }
        },
      },
    ]);
  };

  const handleUploadDocument = async (assetId: string) => {
    if (!user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploadingAssetId(assetId);
      const ext = file.name?.split('.').pop() || 'bin';
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user.id}/${assetId}/${fileName}`;
      const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const { error: uploadError } = await supabase.storage
        .from('asset-documents')
        .upload(filePath, bytes.buffer, { contentType: file.mimeType || 'application/octet-stream', upsert: false });
      if (uploadError) throw uploadError;
      await supabase.from('assets').update({ documents_url: filePath }).eq('id', assetId);
      setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, documents_url: filePath } : a)));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploadingAssetId(null);
    }
  };

  const handleRemoveDocument = async (assetId: string, documentPath: string) => {
    try {
      await supabase.storage.from('asset-documents').remove([documentPath]);
      await supabase.from('assets').update({ documents_url: null }).eq('id', assetId);
      setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, documents_url: null } : a)));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to remove document');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.gold} />}
    >
      <Pressable onPress={() => router.back()} style={styles.backWrap}>
        <Ionicons name="arrow-back" size={20} color={colors.mutedForeground} />
        <Text style={styles.back}>{isFlowMode ? 'Back to Method Selection' : 'Back to Dashboard'}</Text>
      </Pressable>

      {isFlowMode && (
        <View style={styles.progressRow}>
          {[1, 2, 3, 4].map((step) => (
            <View key={step} style={styles.progressStepWrap}>
              <View style={[styles.progressStep, step === 3 ? styles.progressActive : step < 3 ? styles.progressDone : null]}>
                {step < 3 ? <Ionicons name="checkmark" size={16} color={colors.primaryForeground} /> : <Text style={styles.progressNum}>{step}</Text>}
              </View>
              {step < 4 && <View style={styles.progressLine} />}
            </View>
          ))}
        </View>
      )}

      {/* Title and subtitle - full width for mobile */}
      <View style={styles.headerTitleBlock}>
        <Text style={styles.title}>Manage Your Assets</Text>
        <Text style={styles.subtitle}>Add assets and assign them to recipients.</Text>
      </View>

      {/* Manage Recipients + Add Asset - row that fits mobile */}
      <View style={styles.headerButtonsRow}>
        <Pressable style={styles.manageRecipientsBtn} onPress={() => router.push(isFlowMode ? '/recipients?flow=true' : '/recipients')}>
          <Ionicons name="people-outline" size={18} color={colors.foreground} />
          <Text style={styles.manageRecipientsText} numberOfLines={1}>Manage Recipients</Text>
        </Pressable>
        <Pressable style={styles.addAssetBtn} onPress={() => router.push(isFlowMode ? '/asset-add?flow=true&returnTo=assets-manage' : '/asset-add')}>
          <Ionicons name="add" size={18} color={colors.primary} />
          <Text style={styles.addAssetBtnText}>Add Asset</Text>
        </Pressable>
      </View>

      <View style={styles.pillWrap}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>All Assets ({assets.length})</Text>
        </View>
      </View>

      {assets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="folder-open-outline" size={48} color={colors.mutedForeground} />
          <Text style={styles.emptyTitle}>No assets yet</Text>
          <Text style={styles.emptySubtitle}>Start by adding your first asset.</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push(isFlowMode ? '/asset-add?flow=true&returnTo=assets-manage' : '/asset-add')}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.emptyBtnText}>Add Your First Asset</Text>
          </Pressable>
        </View>
      ) : (
        assets.map((asset) => {
          const assetAllocs = getAssetAllocations(asset.id);
          const hasAssigned = assetAllocs.length > 0;
          return (
            <View key={asset.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name={getCategoryIcon(asset.category)} size={24} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
                  <Text style={styles.assetValue} numberOfLines={1}>{formatINR(asset.estimated_value)}</Text>
                </View>
                <Text style={styles.assetCategory}>{asset.category.replace('_', ' ')}</Text>
                {asset.description ? <Text style={styles.assetDesc} numberOfLines={2}>{asset.description}</Text> : null}
                <View style={styles.cardActions}>
                  {asset.documents_url ? (
                    <View style={styles.docRow}>
                      <Ionicons name="document-text" size={16} color={colors.gold} />
                      <Text style={styles.docName} numberOfLines={1}>{asset.documents_url.split('/').pop()}</Text>
                      <Pressable onPress={() => handleRemoveDocument(asset.id, asset.documents_url!)} style={styles.docAction}>
                        <Ionicons name="trash-outline" size={14} color={colors.destructive} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.linkRow}
                      onPress={() => handleUploadDocument(asset.id)}
                      disabled={uploadingAssetId === asset.id}
                    >
                      {uploadingAssetId === asset.id ? (
                        <ActivityIndicator size="small" color={colors.gold} />
                      ) : (
                        <Ionicons name="cloud-upload-outline" size={16} color={colors.gold} />
                      )}
                      <Text style={styles.linkText}>{uploadingAssetId === asset.id ? 'Uploading...' : 'Upload document'}</Text>
                    </Pressable>
                  )}
                  {hasAssigned ? (
                    <View style={styles.assignedRow}>
                      <Ionicons name="people" size={16} color={colors.mutedForeground} />
                      {assetAllocs.map((a) => (
                        <View key={a.id} style={styles.assignedChip}>
                          <Text style={styles.assignedChipText} numberOfLines={1}>{a.recipient?.full_name || '—'}</Text>
                        </View>
                      ))}
                      <Pressable style={styles.linkRow} onPress={() => router.push({ pathname: '/assign-recipients', params: { assetId: asset.id } })}>
                        <Text style={styles.linkTextSmall}>Edit</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable style={styles.linkRow} onPress={() => router.push({ pathname: '/assign-recipients', params: { assetId: asset.id } })}>
                      <Ionicons name="person-add" size={16} color={colors.gold} />
                      <Text style={styles.linkText}>Assign recipients</Text>
                    </Pressable>
                  )}
                </View>
              </View>
              <Pressable style={styles.deleteBtn} onPress={() => handleDeleteAsset(asset)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="trash-outline" size={22} color={colors.destructive} />
              </Pressable>
            </View>
          );
        })
      )}

      {isFlowMode && (
        <View style={styles.flowNav}>
          <Pressable style={styles.flowBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            <Text style={styles.flowBtnText}>Back</Text>
          </Pressable>
          <Pressable style={[styles.flowBtn, styles.flowBtnPrimary]} onPress={() => router.push('/recipients?flow=true')}>
            <Text style={styles.flowBtnTextPrimary}>Continue to Recipients</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  backWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  back: { color: colors.mutedForeground, fontWeight: '500' },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  progressStepWrap: { flexDirection: 'row', alignItems: 'center' },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressActive: { backgroundColor: colors.gold },
  progressDone: { backgroundColor: colors.gold },
  progressNum: { fontSize: 12, fontWeight: '600', color: colors.foreground },
  progressLine: { width: 24, height: 2, backgroundColor: colors.border, marginHorizontal: 2 },
  headerTitleBlock: { marginBottom: 16 },
  title: { ...typography.headingSection, color: colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.mutedForeground },
  headerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  manageRecipientsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 0,
  },
  manageRecipientsText: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  addAssetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    backgroundColor: colors.gold,
    minWidth: 0,
  },
  addAssetBtnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  pillWrap: { marginBottom: 16 },
  pill: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: colors.gold },
  pillText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, gap: 8 },
  assetName: { fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1, minWidth: 0 },
  assetValue: { fontSize: 14, fontWeight: '600', color: colors.gold },
  assetCategory: { fontSize: 13, color: colors.mutedForeground, textTransform: 'capitalize', marginBottom: 4 },
  assetDesc: { fontSize: 13, color: colors.mutedForeground, marginBottom: 10 },
  cardActions: { gap: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontSize: 14, color: colors.gold, fontWeight: '500' },
  linkTextSmall: { fontSize: 13, color: colors.gold, fontWeight: '500' },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  docName: { flex: 1, fontSize: 13, color: colors.mutedForeground, minWidth: 0 },
  docAction: { padding: 4 },
  assignedRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  assignedChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: colors.secondary, maxWidth: 120 },
  assignedChipText: { fontSize: 12, fontWeight: '500', color: colors.foreground },
  deleteBtn: { padding: 8, marginLeft: 4 },
  emptyCard: { alignItems: 'center', paddingVertical: 48, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { ...typography.headingSection, color: colors.foreground, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.gold, paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.button },
  emptyBtnText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  flowNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 10 },
  flowBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.button, borderWidth: 1, borderColor: colors.border, minWidth: 0 },
  flowBtnPrimary: { backgroundColor: colors.gold, borderColor: colors.gold },
  flowBtnText: { color: colors.foreground, fontWeight: '600', fontSize: 13 },
  flowBtnTextPrimary: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
