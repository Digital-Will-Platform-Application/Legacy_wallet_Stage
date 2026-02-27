export default {
  expo: {
    name: 'Digital Will',
    slug: 'mobile_frontend',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'legacywallet',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: { image: './assets/images/splash-icon.png', resizeMode: 'contain', backgroundColor: '#FAF9F7' },
    ios: { supportsTablet: true },
    android: { adaptiveIcon: { foregroundImage: './assets/images/adaptive-icon.png', backgroundColor: '#FAF9F7' }, edgeToEdgeEnabled: true },
    web: { bundler: 'metro', output: 'static', favicon: './assets/images/favicon.png' },
    plugins: ['expo-router'],
    experiments: { typedRoutes: true },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      adminEmail: process.env.EXPO_PUBLIC_ADMIN_EMAIL,
    },
  },
};
