import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radius } from '@/lib/theme';

type MethodId = 'audio' | 'video' | 'chat' | null;

const METHODS: Array<{
  id: MethodId;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  features: string[];
  time: string;
  iconBg: string;
  path: string;
}> = [
  {
    id: 'audio',
    icon: 'mic',
    title: 'Audio Recording',
    description: "Speak your wishes naturally. We'll transcribe and organize everything for you.",
    features: ['Natural conversation', 'AI transcription', 'Edit anytime'],
    time: '~5-10 min',
    iconBg: colors.gold,
    path: '/create/audio',
  },
  {
    id: 'video',
    icon: 'videocam',
    title: 'Video Message',
    description: 'Record personal video messages for your loved ones to treasure.',
    features: ['Personal touch', 'Visual memories', 'Secure storage'],
    time: '~5-15 min',
    iconBg: colors.primary,
    path: '/create/video',
  },
  {
    id: 'chat',
    icon: 'chatbubbles',
    title: 'Guided Chat',
    description: "Answer simple questions and we'll create your will step by step.",
    features: ['Easy questions', 'Save progress', 'Review & edit'],
    time: '~10-15 min',
    iconBg: colors.sage,
    path: '/create/chat',
  },
];

export default function CreateWillScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<MethodId>(null);

  const handleContinue = () => {
    if (selectedMethod) {
      const method = METHODS.find((m) => m.id === selectedMethod);
      if (method) router.push(method.path);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Pressable onPress={() => router.back()} style={styles.backWrap}>
        <Ionicons name="arrow-back" size={20} color={colors.mutedForeground} />
        <Text style={styles.back}>Back to Dashboard</Text>
      </Pressable>

      {/* Step badge */}
      <View style={styles.stepBadge}>
        <Ionicons name="sparkles" size={18} color={colors.gold} />
        <Text style={styles.stepBadgeText}>Step 1 of 4</Text>
      </View>

      <Text style={styles.title}>How Would You Like to Create Your Will?</Text>
      <Text style={styles.subtitle}>
        Choose the method that feels most natural to you. You can always switch or use multiple methods.
      </Text>

      {/* Method cards */}
      {METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <Pressable
            key={method.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => setSelectedMethod(method.id)}
          >
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark" size={16} color={colors.primary} />
              </View>
            )}
            <View style={[styles.iconBox, { backgroundColor: method.iconBg }]}>
              <Ionicons name={method.icon} size={28} color={colors.primaryForeground} />
            </View>
            <Text style={styles.cardTitle}>{method.title}</Text>
            <Text style={styles.cardDesc}>{method.description}</Text>
            <View style={styles.features}>
              {method.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={14} color={colors.sage} style={styles.featureCheck} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
              <Text style={styles.timeText}>{method.time}</Text>
            </View>
          </Pressable>
        );
      })}

      {/* Continue + security */}
      <Pressable
        style={[styles.continueBtn, !selectedMethod && styles.continueBtnDisabled]}
        onPress={handleContinue}
        disabled={!selectedMethod}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.primary} />
      </Pressable>
      <View style={styles.secureRow}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.mutedForeground} />
        <Text style={styles.secureText}>Your data is encrypted and secure</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 48 },
  backWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  back: { color: colors.mutedForeground, fontWeight: '500', fontSize: 15 },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: colors.sage + '40',
    marginBottom: 16,
  },
  stepBadgeText: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  title: {
    ...typography.headingSection,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '12',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 20, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20, marginBottom: 14 },
  features: { marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  featureCheck: { marginRight: 8 },
  featureText: { fontSize: 14, color: colors.mutedForeground },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontSize: 14, color: colors.mutedForeground },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.gold,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.button,
    marginTop: 12,
    marginBottom: 12,
  },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnText: { fontSize: 18, fontWeight: '600', color: colors.primary },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secureText: { fontSize: 14, color: colors.mutedForeground },
});
