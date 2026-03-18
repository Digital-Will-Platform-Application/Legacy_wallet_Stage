# Complete Integration Guide - Digital Will Platform

This guide covers the complete integration of the Digital Will platform with Neon Postgres database, Cloudflare R2 object storage, and both web and mobile frontends.

## 📋 Table of Contents

1. [Backend Setup](#backend-setup)
2. [Web Frontend Setup](#web-frontend-setup)
3. [Mobile Frontend Setup](#mobile-frontend-setup)
4. [Database Configuration (Neon Postgres)](#database-configuration-neon-postgres)
5. [Cloudflare R2 Object Storage Setup](#cloudflare-r2-object-storage-setup)
6. [Environment Variables](#environment-variables)
7. [Testing the Integration](#testing-the-integration)

---

## Backend Setup

### Location
`C:\lagacy\Legacy_wallet-latest\backend`

### Required Environment Variables

Create a `.env` file in the backend directory:

```env
# REQUIRED - Neon Postgres Database
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# REQUIRED - JWT Secret (generate a secure key)
JWT_SECRET=your-secret-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=production
R2_STAGING_BUCKET=staging
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Email Configuration (SMTP)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
EMAIL_FROM=LegacyWallet <noreply@legacywallet.com>

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173
```

### Install Dependencies

```bash
cd backend
npm install
```

### Initialize Database

```bash
npm run init-db
```

### Start Backend Server

```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:3001`

---

## Web Frontend Setup

### Location
`C:\Users\durgasiva\Digital-will\Legacy_wallet_Stage`

### Required Environment Variables

Create a `.env` file in the web frontend directory:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# For production:
# VITE_BACKEND_URL=https://your-backend-api.com
```

### Install Dependencies

```bash
cd Legacy_wallet_Stage
npm install
```

### Start Development Server

```bash
npm run dev
```

The web frontend will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## Mobile Frontend Setup

### Location
`C:\lagacy\Legacy_wallet-latest\mobile_frontend`

### Required Environment Variables

Create a `.env` file in the mobile frontend directory:

```env
# Backend API URL
# For local development:
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001

# For Android emulator:
# EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001

# For iOS simulator:
# EXPO_PUBLIC_BACKEND_URL=http://localhost:3001

# For production:
# EXPO_PUBLIC_BACKEND_URL=https://your-backend-api.com
```

### Install Dependencies

```bash
cd mobile_frontend
npm install
```

### Start Development Server

```bash
npm start
```

---

## Database Configuration (Neon Postgres)

### Getting Your Neon Postgres Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. It should look like:
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Database Schema

The backend automatically creates the following tables:
- `users` - User accounts
- `wills` - Will documents
- `assets` - User assets
- `recipients` - Will recipients
- `email_notifications` - Email notification logs
- `email_verifications` - Email verification tokens

### Testing Database Connection

```bash
# From backend directory
curl http://localhost:3001/api/test-db
```

---

## Cloudflare R2 Object Storage Setup

### Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 > Create bucket
3. Create two buckets:
   - `production` (for production files)
   - `staging` (for staging/test files)

### Step 2: Get R2 API Credentials

1. Go to R2 > Manage R2 API Tokens
2. Create API Token
3. Copy:
   - Account ID
   - Access Key ID
   - Secret Access Key

### Step 3: Configure Public Access (Optional)

1. Go to R2 > Your Bucket > Settings
2. Enable Public Access
3. Note the public URL format: `https://pub-{ACCOUNT_ID}.r2.dev`

### Step 4: Update Environment Variables

Add to backend `.env`:
```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=production
R2_STAGING_BUCKET=staging
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Testing R2 Configuration

```bash
# From backend directory
curl http://localhost:3001/api/upload/status
```

---

## Environment Variables

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `PORT` | ❌ | Server port (default: 3001) |
| `NODE_ENV` | ❌ | Environment (development/production) |
| `R2_ACCOUNT_ID` | ❌ | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | ❌ | R2 access key |
| `R2_SECRET_ACCESS_KEY` | ❌ | R2 secret key |
| `R2_BUCKET_NAME` | ❌ | R2 bucket name (default: production) |
| `R2_STAGING_BUCKET` | ❌ | R2 staging bucket (default: staging) |
| `R2_PUBLIC_URL` | ❌ | R2 public URL |
| `SMTP_USER` | ❌ | SMTP email address |
| `SMTP_PASS` | ❌ | SMTP password/app password |
| `SMTP_HOST` | ❌ | SMTP host (default: smtp.gmail.com) |
| `SMTP_PORT` | ❌ | SMTP port (default: 587) |
| `FRONTEND_URL` | ❌ | Frontend URL for email links |

### Web Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | ❌ | Backend API URL (default: http://localhost:3001) |

### Mobile Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_BACKEND_URL` | ❌ | Backend API URL (default: http://localhost:3001) |

---

## Testing the Integration

### 1. Test Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "message": "Backend server is running"
}
```

### 2. Test Database Connection

```bash
curl http://localhost:3001/api/test-db
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Test R2 Configuration

```bash
curl http://localhost:3001/api/upload/status
```

Expected response:
```json
{
  "success": true,
  "r2Configured": true,
  "message": "R2 storage is configured and ready"
}
```

### 4. Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "confirm_password": "test123"
  }'
```

### 5. Test User Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Wills
- `POST /api/wills/save` - Save/update will
- `GET /api/wills/user/:userId` - Get user's will by ID
- `GET /api/wills/user-email/:userEmail` - Get user's will by email
- `POST /api/wills/finalize` - Finalize will

### Assets
- `POST /api/assets/add` - Add asset
- `GET /api/assets/user/:userId` - Get user's assets by ID
- `GET /api/assets/user-email/:userEmail` - Get user's assets by email

### Recipients
- `POST /api/recipients/add` - Add recipient
- `GET /api/recipients/user/:userId` - Get user's recipients by ID
- `GET /api/recipients/user-email/:userEmail` - Get user's recipients by email
- `PUT /api/recipients/:id` - Update recipient
- `DELETE /api/recipients/:id` - Delete recipient

### Upload (R2)
- `POST /api/upload/audio` - Upload audio recording
- `POST /api/upload/video` - Upload video recording
- `GET /api/upload/status` - Check R2 configuration status

### Email Verification
- `POST /api/email-verification/send-verification` - Send verification email
- `GET /api/email-verification/verify?token=xxx` - Verify email token
- `GET /api/email-verification/status/:userId` - Check verification status

---

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if Neon database is active
3. Ensure SSL mode is set: `?sslmode=require`
4. Test connection: `curl http://localhost:3001/api/test-db`

### R2 Upload Issues

1. Verify R2 credentials are correct
2. Check bucket exists and is accessible
3. Verify public URL format
4. Test status: `curl http://localhost:3001/api/upload/status`

### Frontend Connection Issues

1. Verify backend is running on correct port
2. Check `VITE_BACKEND_URL` or `EXPO_PUBLIC_BACKEND_URL` is correct
3. For mobile, use `10.0.2.2:3001` for Android emulator
4. Check CORS settings in backend (should allow all origins)

### Email Issues

1. For Gmail, use App Password (not regular password)
2. Enable "Less secure app access" or use App Password
3. Check SMTP credentials are correct
4. Test email: `curl -X POST http://localhost:3001/api/test-email/test`

---

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use production database URL
3. Use production R2 bucket
4. Set secure `JWT_SECRET`
5. Configure proper CORS origins
6. Use environment variables from hosting platform

### Web Frontend

1. Set `VITE_BACKEND_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder to hosting (Vercel, Netlify, etc.)

### Mobile Frontend

1. Set `EXPO_PUBLIC_BACKEND_URL` to production backend URL
2. Build APK/IPA using EAS Build
3. Distribute through app stores

---

## Support

For issues or questions:
1. Check backend logs: `npm run dev`
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test each component individually

---

**Last Updated:** 2024-01-01
**Version:** 1.0.0
