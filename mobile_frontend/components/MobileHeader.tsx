import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

const menuLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/learn-more', label: 'FAQ' },
  { href: '/contact', label: 'Contact Us' },
];

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Pressable style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
            </View>
            <Text style={styles.logoText}>Digital Will</Text>
          </Pressable>
        </Link>
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)} accessibilityLabel="Open menu">
          <Ionicons name="menu" size={28} color={colors.foreground} />
        </Pressable>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerLogoRow}>
                <View style={styles.drawerLogoBox}>
                  <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
                </View>
                <Text style={styles.drawerLogoText}>Digital Will</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu">
                <Ionicons name="close" size={28} color={colors.foreground} />
              </Pressable>
            </View>

            <View style={styles.drawerLinks}>
              {menuLinks.map((link) => (
                <Link key={link.href} href={link.href as any} asChild>
                  <Pressable style={styles.drawerLink} onPress={() => setMenuOpen(false)}>
                    <Text style={[styles.drawerLinkText, pathname === link.href && styles.drawerLinkActive]}>{link.label}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>

            <View style={styles.drawerLanguage}>
              <Ionicons name="language" size={22} color={colors.mutedForeground} />
              <Text style={styles.drawerLanguageText}>English</Text>
            </View>

            <View style={styles.drawerActions}>
              <Link href="/login" asChild>
                <Pressable style={styles.drawerBtn} onPress={() => setMenuOpen(false)}>
                  <Text style={styles.drawerBtnText}>Login</Text>
                </Pressable>
              </Link>
              <Link href="/signup" asChild>
                <Pressable style={styles.drawerBtn} onPress={() => setMenuOpen(false)}>
                  <Text style={styles.drawerBtnText}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '600', color: colors.foreground },
  menuButton: { padding: 8 },

  modalOverlay: { flex: 1, flexDirection: 'row' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  drawerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  drawerLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLogoText: { fontSize: 18, fontWeight: '600', color: colors.foreground },
  closeButton: { padding: 4 },
  drawerLinks: { gap: 4, marginBottom: 24 },
  drawerLink: { paddingVertical: 14, paddingHorizontal: 4 },
  drawerLinkText: { fontSize: 16, fontWeight: '500', color: colors.foreground },
  drawerLinkActive: { color: colors.gold },
  drawerLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  drawerLanguageText: { fontSize: 16, color: colors.mutedForeground },
  drawerActions: { gap: 12 },
  drawerBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawerBtnText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
});
