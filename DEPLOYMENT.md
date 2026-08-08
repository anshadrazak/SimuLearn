# Vercel Deployment Guide

## Prerequisites
1. Vercel account (https://vercel.com/signup)
2. MongoDB Atlas database (already configured)
3. Vercel CLI: `npm install -g vercel`

## Step 1: Deploy Backend (Server)

```bash
cd server
vercel login
vercel --prod
```

During the setup:
- Project Name: `lms-backend` (or any name you prefer)
- Framework Preset: `Node.js`
- Root Directory: `./` (keep default)

### Environment Variables for Backend:
Set these in Vercel Project Settings > Environment Variables:
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret
- `JWT_REFRESH_SECRET`: Your refresh token secret  
- `JWT_EXPIRE`: `15m`
- `REFRESH_TOKEN_EXPIRE`: `7d`
- `CLIENT_URL`: Frontend URL (will get it after frontend deployment)

## Step 2: Deploy Frontend (Client)

After backend is deployed, you'll get a backend URL like `https://lms-backend.vercel.app`

```bash
cd client
vercel --prod
```

During the setup:
- Project Name: `lms-frontend` (or any name you prefer)
- Framework Preset: `Vite`
- Root Directory: `./` (keep default)

### Update Backend CLIENT_URL:
After frontend is deployed, update the backend's `CLIENT_URL` environment variable in Vercel to your frontend URL.

## Manual Deployment (Alternative)

If CLI authentication doesn't work:

1. Go to https://vercel.com/new
2. Import your GitHub/GitLab repository
3. For frontend:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. For backend:
   - Framework Preset: Node.js
   - Build Command: (leave empty)
   - Output Directory: `.`

## Files Created for Deployment
- `client/vercel.json` - Frontend Vercel configuration
- `server/vercel.json` - Backend Vercel configuration
- `client/dist/` - Production build of frontend
