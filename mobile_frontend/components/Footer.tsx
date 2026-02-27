import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerGrid}>
        <View style={styles.footerBrand}>
          <Link href="/" asChild>
            <Pressable style={styles.footerLogoRow}>
              <View style={styles.footerLogoBox}>
                <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
              </View>
              <Text style={styles.footerLogoText}>Digital Will</Text>
            </Pressable>
          </Link>
          <Text style={styles.footerDesc}>
            Secure your will with modern digital will management. Peace of mind for you and your loved ones.
          </Text>
        </View>
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>Product</Text>
          <Link href="/how-it-works" asChild><Pressable><Text style={styles.footerLink}>How It Works</Text></Pressable></Link>
          <Link href="/pricing" asChild><Pressable><Text style={styles.footerLink}>Pricing</Text></Pressable></Link>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>Features</Text></Pressable></Link>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>Security</Text></Pressable></Link>
        </View>
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>Company</Text>
          <Link href="/about" asChild><Pressable><Text style={styles.footerLink}>About Us</Text></Pressable></Link>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>Blog</Text></Pressable></Link>
          <Link href="/contact" asChild><Pressable><Text style={styles.footerLink}>Careers</Text></Pressable></Link>
          <Link href="/contact" asChild><Pressable><Text style={styles.footerLink}>Contact</Text></Pressable></Link>
        </View>
        <View style={styles.footerColumn}>
          <Text style={styles.footerHeading}>Legal</Text>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>Privacy Policy</Text></Pressable></Link>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>Terms of Service</Text></Pressable></Link>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>GDPR Compliance</Text></Pressable></Link>
          <Link href="/learn-more" asChild><Pressable><Text style={styles.footerLink}>Accessibility</Text></Pressable></Link>
        </View>
      </View>
      <View style={styles.footerBottom}>
        <Text style={styles.footerCopyright}>
          © {new Date().getFullYear()} Digital Will. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.primary,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  footerGrid: {
    flexDirection: 'column',
    gap: 24,
    marginBottom: 24,
  },
  footerBrand: { width: '100%' },
  footerLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  footerLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoText: { fontSize: 18, fontWeight: '600', color: colors.primaryForeground },
  footerDesc: { fontSize: 13, color: 'rgba(250,249,247,0.7)', lineHeight: 20 },
  footerColumn: { width: '100%' },
  footerHeading: { fontSize: 14, fontWeight: '600', color: colors.primaryForeground, marginBottom: 12 },
  footerLink: { fontSize: 13, color: 'rgba(250,249,247,0.7)', marginBottom: 8 },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(250,249,247,0.2)',
    paddingTop: 16,
  },
  footerCopyright: { fontSize: 12, color: 'rgba(250,249,247,0.6)' },
});
