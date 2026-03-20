# Render.com Deployment Setup Guide

## Problem Fixed
Render was looking for `package.json` in the wrong directory. Fixed by adding `rootDir` to specify the correct build directory.

## Services Configuration

### Backend Service (Node.js)

**In Render Dashboard:**
1. **Service Type**: Web Service
2. **Environment**: Node
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Port**: 3001 (or set via PORT env var)

**Environment Variables to Set:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=3001
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM=LegacyWallet <your-email@gmail.com>
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=staging
R2_STAGING_BUCKET=staging
R2_PUBLIC_URL=https://pub-xxx.r2.dev
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
```

### Frontend Service (Static Site)

**In Render Dashboard:**
1. **Service Type**: Static Site
2. **Root Directory**: `Legacy_wallet-main`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`

**Environment Variables (if needed):**
```
NODE_ENV=production
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

## Deployment Steps

1. **Connect Repository**
   - Go to Render Dashboard
   - Click "New" → "Web Service" (for backend)
   - Connect your GitHub repository
   - Select branch: `Stage`

2. **Configure Backend Service**
   - Name: `legacy-wallet-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add all environment variables listed above

3. **Configure Frontend Service**
   - Go to Render Dashboard
   - Click "New" → "Static Site"
   - Connect same repository
   - Root Directory: `Legacy_wallet-main`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy
   - Wait for build to complete (5-10 minutes)

## Verification

After deployment:

1. **Backend Health Check:**
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Backend API:**
   ```
   https://your-backend-url.onrender.com/
   ```
   Should show available endpoints

3. **Frontend:**
   ```
   https://your-frontend-url.onrender.com
   ```
   Should show your web app

## Troubleshooting

### "Could not read package.json"
- **Fix**: Make sure `rootDir` is set correctly in Render dashboard
- Backend: `rootDir` = `backend`
- Frontend: `rootDir` = `Legacy_wallet-main`

### "Build failed"
- Check build logs in Render dashboard
- Verify Node.js version (should be 18+)
- Check that all dependencies are in package.json

### "Service not responding"
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check PORT is set (default: 3001)

## Files Updated

- ✅ `render.yaml` - Root configuration with rootDir
- ✅ `Legacy_wallet-main/render.yaml` - Frontend configuration
- ✅ All changes pushed to GitHub

## Important Notes

1. **Environment Variables**: Must be set in Render Dashboard, not in code
2. **Database**: Make sure your NeonDB allows connections from Render's IPs
3. **CORS**: Backend CORS is configured to allow all origins (update for production)
4. **SSL**: Render provides free SSL certificates automatically
