import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '@/lib/theme';
import { validateMessage, sanitizeInput } from '@/lib/validation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const CHAT_URL = `${supabaseUrl}/functions/v1/will-chat`;

type Message = { role: 'user' | 'assistant'; content: string };

export default function CreateChatWillScreen() {
  const { user, session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const streamChat = async ({
    messages: msgs,
    onDelta,
    onDone,
  }: {
    messages: Message[];
    onDelta: (deltaText: string) => void;
    onDone: () => void;
  }) => {
    if (!session?.access_token) throw new Error('Not authenticated.');
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages: msgs }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || 'Failed to get response');
    }
    const reader = resp.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;
    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '' || !line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          done = true;
          break;
        }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
    if (buffer.trim()) {
      for (const raw of buffer.split('\n')) {
        if (!raw || !raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          /* ignore */
        }
      }
    }
    onDone();
  };

  const startConversation = async () => {
    setHasStarted(true);
    setIsLoading(true);
    try {
      await streamChat({
        messages: [],
        onDelta: (chunk) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: m.content + chunk } : m
              );
            }
            return [...prev, { role: 'assistant', content: chunk }];
          });
        },
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (isLoading) return;
    const validation = validateMessage(input);
    if (!validation.isValid) return;
    const userMsg: Message = { role: 'user', content: validation.sanitized };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);
    try {
      await streamChat({
        messages: updated,
        onDelta: (chunk) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: m.content + chunk } : m
              );
            }
            return [...prev, { role: 'assistant', content: chunk }];
          });
        },
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!user || messages.length === 0) return;
    setIsSaving(true);
    try {
      const transcript = messages
        .map((m) => {
          const content = m.role === 'user' ? sanitizeInput(m.content) : m.content;
          return `${m.role === 'user' ? 'User' : 'Assistant'}: ${content}`;
        })
        .join('\n\n');
      const { data: existing } = await supabase
        .from('wills')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'chat')
        .maybeSingle();
      if (existing?.id) {
        await supabase
          .from('wills')
          .update({
            transcript,
            content: transcript,
            status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('wills').insert({
          user_id: user.id,
          type: 'chat',
          title: 'My Chat-Based Will',
          transcript,
          content: transcript,
          status: 'in_progress',
        });
      }
      router.replace('/assets-manage?flow=true');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Back to Method Selection</Text>
        </Pressable>
        <View style={styles.progressRow}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View key={step} style={styles.progressStepWrap}>
              <View style={[styles.progressStep, step === 1 ? styles.progressActive : step < 1 ? styles.progressDone : null]}>
                {step < 1 ? <Ionicons name="checkmark" size={16} color={colors.primaryForeground} /> : <Text style={styles.progressNum}>{step}</Text>}
              </View>
              {step < 5 && <View style={styles.progressLine} />}
            </View>
          ))}
        </View>
        <Text style={styles.title}>Chat-Based Will Creation</Text>
        <Text style={styles.subtitle}>Have a guided conversation to create your will step by step.</Text>

        <View style={styles.chatCard}>
          {!hasStarted ? (
            <View style={styles.startWrap}>
              <View style={styles.startIcon}>
                <Ionicons name="chatbubbles" size={40} color={colors.primary} />
              </View>
              <Text style={styles.startTitle}>Ready to Begin?</Text>
              <Text style={styles.startDesc}>Our AI assistant will guide you through creating your will with simple, conversational questions.</Text>
              <Pressable style={styles.startBtn} onPress={startConversation} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={colors.primary} /> : (
                  <>
                    <Ionicons name="chatbubbles" size={20} color={colors.primary} />
                    <Text style={styles.startBtnText}>Start Conversation</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView style={styles.messagesWrap} contentContainerStyle={styles.messagesContent}>
                {messages.map((msg, i) => (
                  <View key={i} style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : null]}>
                    {msg.role === 'assistant' && (
                      <View style={styles.avatarBot}>
                        <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                      </View>
                    )}
                    <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                      <Text style={[styles.bubbleText, msg.role === 'user' ? styles.bubbleTextUser : null]}>{msg.content}</Text>
                    </View>
                    {msg.role === 'user' && (
                      <View style={styles.avatarUser}>
                        <Ionicons name="person" size={16} color={colors.mutedForeground} />
                      </View>
                    )}
                  </View>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <View style={styles.msgRow}>
                    <View style={styles.avatarBot}>
                      <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.bubbleBot}>
                      <View style={styles.dots}>
                        <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your response..."
                  placeholderTextColor={colors.mutedForeground}
                  value={input}
                  onChangeText={setInput}
                  editable={!isLoading}
                  maxLength={5000}
                  multiline
                />
                <Pressable style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || isLoading}>
                  {isLoading ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Ionicons name="send" size={20} color={colors.primaryForeground} />}
                </Pressable>
              </View>
            </>
          )}
        </View>

        <View style={styles.navRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.navBack}>← Back</Text>
          </Pressable>
          <View style={styles.navRight}>
            <View style={styles.encryptedRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.mutedForeground} />
              <Text style={styles.encrypted}>Encrypted</Text>
            </View>
            <Pressable
              style={[styles.continueBtn, (messages.length < 2 || isSaving) && styles.continueBtnDisabled]}
              onPress={handleSaveAndContinue}
              disabled={messages.length < 2 || isSaving}
            >
              {isSaving ? <ActivityIndicator size="small" color={colors.primary} /> : (
                <>
                  <Ionicons name="save-outline" size={18} color={colors.primary} />
                  <Text style={styles.continueBtnText}>Save & Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  back: { color: colors.mutedForeground, marginBottom: 20 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
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
  title: { ...typography.headingSection, color: colors.foreground, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 24 },
  chatCard: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 360,
    marginBottom: 24,
    overflow: 'hidden',
  },
  startWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  startIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  startTitle: { fontSize: 20, fontWeight: '600', color: colors.foreground, marginBottom: 8 },
  startDesc: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 24 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.gold, paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.button },
  startBtnText: { color: colors.primary, fontWeight: '600' },
  messagesWrap: { maxHeight: 320 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowUser: { justifyContent: 'flex-end' },
  avatarBot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarUser: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  bubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  bubbleBot: { backgroundColor: colors.secondary },
  bubbleUser: { backgroundColor: colors.primary },
  bubbleText: { fontSize: 14, color: colors.foreground },
  bubbleTextUser: { color: colors.primaryForeground },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mutedForeground },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: radius.input, padding: 12, fontSize: 16, color: colors.foreground, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  navBack: { color: colors.mutedForeground, marginRight: 12 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  encryptedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  encrypted: { fontSize: 12, color: colors.mutedForeground },
  continueBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.gold, paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.button },
  continueBtnDisabled: { opacity: 0.6 },
  continueBtnText: { color: colors.primary, fontWeight: '600' },
});
