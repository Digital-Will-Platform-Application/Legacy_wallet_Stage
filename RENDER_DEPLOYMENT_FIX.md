# Render Deployment Fix

## Problem
Render was looking for `package.json` in `/opt/render/project/src/package.json` but it doesn't exist there.

## Solution

### Root `render.yaml` (for Backend)
Created root-level `render.yaml` that correctly points to the backend directory:
- Build command: `cd backend && npm install`
- Start command: `cd backend && npm start`
- Correctly references `backend/package.json`

### Frontend `render.yaml` (Legacy_wallet-main/render.yaml)
Fixed the frontend configuration:
- Changed from `bun install` to `npm install` (more compatible)
- Build command: `npm install && npm run build`
- Static publish path: `./dist`

## Render Dashboard Configuration

When setting up services in Render:

### Backend Service
1. **Type**: Web Service
2. **Environment**: Node
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. **Root Directory**: Leave empty (or set to repository root)

### Frontend Service  
1. **Type**: Static Site
2. **Build Command**: `cd Legacy_wallet-main && npm install && npm run build`
3. **Publish Directory**: `Legacy_wallet-main/dist`
4. **Root Directory**: Leave empty (or set to repository root)

## Environment Variables

Set these in Render Dashboard for Backend service:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `P`
    q`` - Port number (default: 3001)
- `SMTP_USER` - Gmail SMTP username
- `SMTP_PASS` - Gmail App Password
- `R2_ACCOUNT_ID` - Cloudflare R2 Account ID
- `R2_ACCESS_KEY_ID` - R2 Access Key
- `R2_SECRET_ACCESS_KEY` - R2 Secret Key
- `R2_BUCKET_NAME` - R2 Bucket name
- `R2_PUBLIC_URL` - R2 Public URL
- `EMAIL_FROM` - Email sender address
- `FRONTEND_URL` - Your frontend URL

## Verification

After deployment:
1. Check backend health: `https://your-backend-url.onrender.com/health`
2. Check frontend: `https://your-frontend-url.onrender.com`
3. Test API endpoints from frontend

## Files Changed
- ✅ Created `render.yaml` (root) for backend
- ✅ Fixed `Legacy_wallet-main/render.yaml` for frontend
- ✅ All changes committed and pushed to GitHub
