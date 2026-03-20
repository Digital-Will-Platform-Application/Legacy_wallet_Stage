import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Change this URL to your Legacy Wallet:
// - Local dev (same Wi‑Fi): use your PC's IP, e.g. http://192.168.1.5:5173
//   (Start the web app first: cd Legacy_wallet-main && npm run android)
// - Production: your deployed URL, e.g. https://your-legacy-wallet.onrender.com
// Use the same URL as your running web app (e.g. http://localhost:8080 from Legacy_wallet-main)
const LEGACY_WALLET_URL = 'http://10.250.95.170:8080/';

export default function App() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: LEGACY_WALLET_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        scalesPageToFit
        mixedContentMode="compatibility"
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    width: '100%',
  },
});
