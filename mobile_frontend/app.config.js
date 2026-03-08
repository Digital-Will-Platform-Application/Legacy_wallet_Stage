export default {
  expo: {
    name: 'Digital Will',
    slug: 'digital-will-application',
    version: '1.0.0',
    owner: 'sivayya',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'legacywallet',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: { image: './assets/images/splash-icon.png', resizeMode: 'contain', backgroundColor: '#FAF9F7' },
    ios: { supportsTablet: true },
    android: { 
      adaptiveIcon: { foregroundImage: './assets/images/adaptive-icon.png', backgroundColor: '#FAF9F7' }, 
      edgeToEdgeEnabled: true,
      package: 'com.digitalwill.legacywallet',
      versionCode: 1
    },
    web: { bundler: 'metro', output: 'static', favicon: './assets/images/favicon.png' },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#ffffff',
          sounds: [],
        },
      ],
    ],
    experiments: { typedRoutes: true },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      adminEmail: process.env.EXPO_PUBLIC_ADMIN_EMAIL,
    },
  },
};
