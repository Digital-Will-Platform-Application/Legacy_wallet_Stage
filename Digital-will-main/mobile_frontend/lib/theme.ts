/**
 * Web app exact colors & typography from Legacy_wallet-main (index.css, button, input-elevated).
 * Use everywhere so mobile matches web inch-by-inch.
 */
export const colors = {
  background: '#FAF9F7',
  foreground: '#2C3E5C',
  primary: '#1E3A5F',
  primaryForeground: '#FAF9F7',
  /** Web app exact: HSL 42 52% 59% – softer, less thick than previous gold */
  gold: '#CDAC60',
  goldLight: '#E2D4A6',
  sage: '#C5D4CC',
  mutedForeground: '#5C6B7E',
  secondary: '#F0EDE8',
  border: '#E5E0D8',
  card: '#F0EDE8',
  destructive: '#ef4444',
  success: '#16a34a',
} as const;

/** Web: --radius 0.75rem, input-elevated rounded-lg */
export const radius = { input: 8, button: 8, card: 12 } as const;

/** Web: heading-section text-2xl font-semibold; body text-base/text-lg */
export const typography = {
  headingSection: { fontSize: 24, fontWeight: '600' as const },
  headingDisplay: { fontSize: 28, fontWeight: '600' as const },
  body: { fontSize: 16 },
  bodySmall: { fontSize: 14 },
  label: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12 },
} as const;
