# Deployment Fix Guide for SoSign Frontend

## Issue

The frontend deployed on Vercel at https://sosign.vercel.app/ is getting 500 errors because it's trying to connect to localhost:8000 instead of the production backend at https://api.sosign.in.

## Solution

The API routes have been updated to use environment variables for the backend URL. You need to configure the environment variables on Vercel.

## Steps to Fix

### 1. Update Vercel Environment Variables

Go to your Vercel dashboard for the sosign project and add these environment variables:

**Production Environment Variables:**

```
NEXT_PUBLIC_API_URL=https://api.sosign.in
API_URL=https://api.sosign.in
```

**Firebase Configuration (if needed):**

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAHXxxamRNh1XrTDjvjO1f0fI8X7YjWLZE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sosign-26e97.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sosign-26e97
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sosign-26e97.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=899461778345
NEXT_PUBLIC_FIREBASE_APP_ID=1:899461778345:web:b92b76a66f0e8b41e6db3d
```

### 2. Add Vercel Domain to Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: sosign-26e97
3. Go to Authentication > Settings > Authorized domains
4. Add: `sosign.vercel.app`

### 3. Update Backend CORS (Already Done)

The backend .env file has been updated to include:

```
ALLOWED_ORIGINS=https://sosign.vercel.app,http://localhost:3000
```

You need to update this in your Render backend deployment as well.

### 4. Redeploy

After setting the environment variables:

1. Trigger a new deployment on Vercel (or it will auto-deploy from the latest push)
2. Make sure the backend on Render has the updated CORS settings

## Files Changed

### Frontend (sosign):

- `config/api.js` - New API configuration file
- `.env.example` - Template for environment variables
- `.env.local` - Local environment variables
- All API route files in `app/api/petitions/` - Updated to use environment-based URLs

### Backend (sosign-backend):

- `.env` - Updated ALLOWED_ORIGINS to include Vercel domain

## Verification

After deployment, check:

1. https://sosign.vercel.app/ loads without 500 errors
2. Petitions are loading properly
3. Authentication works
4. API endpoints respond correctly

## Quick Vercel CLI Method

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.sosign.in

vercel env add API_URL production
# Enter: https://api.sosign.in

# Trigger redeploy
vercel --prod
```

## Testing

Test these endpoints after deployment:

- https://sosign.vercel.app/api/petitions
- https://sosign.vercel.app/api/petitions/stats
- https://sosign.vercel.app/ (should load without errors)

The frontend should now properly communicate with the backend deployed on Render.
