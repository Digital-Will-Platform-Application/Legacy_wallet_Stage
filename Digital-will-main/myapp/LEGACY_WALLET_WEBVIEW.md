# Legacy Wallet – Android WebView App

This Expo app shows your **Legacy Wallet** web app inside a native Android app (WebView).

## 1. One-time setup (already done)

- Expo app created: `myapp`
- `react-native-webview` installed
- `App.js` updated to load the Legacy Wallet URL

## 2. Set the correct URL

Edit **`App.js`** and set `LEGACY_WALLET_URL`:

- **Local testing (phone and PC on same Wi‑Fi):**  
  Use your PC’s IP and port, e.g. `http://192.168.1.5:5173`  
  (Find IP: Windows → `ipconfig` → “IPv4 Address”)
- **Production:**  
  Use your deployed URL, e.g. `https://your-app.onrender.com`

## 3. How to run and check

### Option A – Test with local web app

1. **Start the web app (Legacy Wallet) on your PC:**
   ```bash
   cd "d:\legacy wallet latest\Legacy_wallet-latest\Legacy_wallet-main"
   npm run android
   ```
   Note the URL shown (e.g. `http://192.168.x.x:5173`).

2. **In `myapp/App.js`**, set:
   ```js
   const LEGACY_WALLET_URL = 'http://192.168.x.x:5173';  // same as in terminal
   ```

3. **Run the Expo app on Android:**
   ```bash
   cd "d:\legacy wallet latest\Legacy_wallet-latest\myapp"
   npm run android
   ```
   - If you have an Android emulator, it will open there.
   - If you have a physical device: connect via USB, enable USB debugging, and run `npm run android` again (or scan the QR code with Expo Go for a quick test).

4. **Check:** The phone/emulator should open the app and show the Legacy Wallet inside the WebView (login, dashboard, etc.). If you see a connection error, confirm the URL in `App.js` matches the one from step 1 and that the phone and PC are on the same Wi‑Fi.

### Option B – Test with deployed (production) URL

1. Deploy your Legacy Wallet (e.g. Render, Vercel).
2. In `myapp/App.js`, set:
   ```js
   const LEGACY_WALLET_URL = 'https://your-deployed-url.com';
   ```
3. Run:
   ```bash
   cd myapp
   npm run android
   ```
4. **Check:** The app should load the live site in the WebView.

## 4. If “myapp” was already there

If you had already run `npx create-expo-app myapp` and installed `react-native-webview` before, you can skip the setup and only:

- Set `LEGACY_WALLET_URL` in `App.js`
- Run `npm run android` from the `myapp` folder and verify as above.

### Option C – Run Expo in the browser

1. **Install web dependencies (one-time):** Already done – `react-dom` and `react-native-web` are installed.
2. **Start the Legacy Wallet web app** (so the WebView has something to load):
   ```bash
   cd "d:\legacy wallet latest\Legacy_wallet-latest\Legacy_wallet-main"
   npm run android
   ```
   Note the URL (e.g. `http://localhost:8080` or `http://10.250.95.170:8080`). Set the same URL in `myapp/App.js` as `LEGACY_WALLET_URL`.
3. **Start Expo for web:**
   ```bash
   cd "d:\legacy wallet latest\Legacy_wallet-latest\myapp"
   npm run web
   ```
4. **Open in browser:** Go to **http://localhost:8086**. You should see the Expo app with the Legacy Wallet loaded in the WebView.

## 5. Summary

| Step | Command / action |
|------|-------------------|
| Create Expo app (once) | `npx create-expo-app myapp` (already done) |
| Install WebView (once) | `npm install react-native-webview` (already done) |
| Web support (once) | `npx expo install react-dom react-native-web` (already done) |
| Set URL | Edit `LEGACY_WALLET_URL` in `myapp/App.js` |
| Run web app (for local test) | From `Legacy_wallet-main`: `npm run android` |
| Run Expo in **browser** | From `myapp`: `npm run web` → open **http://localhost:8086** |
| Run Android app | From `myapp`: `npm run android` or `npm run start:mobile` |
| Check | Browser: http://localhost:8086 \| Device: Expo Go → Legacy Wallet in WebView |
