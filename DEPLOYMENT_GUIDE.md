# 🚀 Deployment Guide - MovieMate

Complete guide to deploy MovieMate frontend on **Vercel** and backend on **Railway**.

## 📋 Prerequisites

- ✅ GitHub account (code already pushed)
- ✅ Vercel account (free tier) - https://vercel.com
- ✅ Railway account (free tier) - https://railway.app
- ✅ Your repository: `https://github.com/Vigneswer/MovieMate`

---

## 🎯 Deployment Overview

```
GitHub Repo (MovieMate)
    ├── frontend/ → Deploy to Vercel
    └── backend/  → Deploy to Railway (with PostgreSQL)
```

**Important**: Your monorepo structure is already configured. The deployment configs tell each platform which subfolder to use.

---

## 🔧 Step 1: Deploy Backend to Railway (with PostgreSQL)

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click **Start a New Project**
3. Sign in with GitHub

### 1.2 Deploy Backend + PostgreSQL
1. Click **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your repository: `Vigneswer/MovieMate`
4. Railway will detect it's a monorepo

### 1.3 Configure Backend Service
1. After import, Railway creates a service
2. Click on the service → **Settings**
3. Set **Root Directory**: `backend`
4. **Build Configuration**:
   - Build Method: `Dockerfile` (auto-detected from `backend/Dockerfile`)
   - Start Command: (leave empty, Dockerfile handles it)

### 1.4 Add PostgreSQL Database
1. In your project dashboard, click **New** → **Database** → **Add PostgreSQL**
2. Railway provisions a PostgreSQL instance automatically
3. It creates a `DATABASE_URL` environment variable

### 1.5 Set Environment Variables
1. Click your backend service → **Variables** tab
2. Add these variables:

```bash
# Database (automatically provided by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# CORS - Your Vercel frontend URL (you'll update this after Vercel deployment)
CORS_ORIGINS=https://your-app.vercel.app

# API Keys
OMDB_API_KEY=4e37122b
GEMINI_API_KEY=AIzaSyDCrnMVfHRTMb7nT96nU5VrAF-Wn9yqhEs

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# App Info
PROJECT_NAME=MovieMate API
VERSION=1.0.0
DESCRIPTION=Movie Database API with PostgreSQL
```

**Note**: The `${{Postgres.DATABASE_URL}}` reference automatically links to your PostgreSQL database.

### 1.6 Deploy Backend
1. Click **Deploy** (Railway auto-deploys on push)
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, click **Settings** → **Networking** → **Generate Domain**
4. Copy your backend URL: `https://your-backend.railway.app`
5. **Test it**: Visit `https://your-backend.railway.app/health` - should return `{"status":"healthy"}`

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub

### 2.2 Import Project
1. In Vercel dashboard, click **Add New** → **Project**
2. Find and **Import** your `MovieMate` repository
3. Vercel detects it's a monorepo

### 2.3 Configure Frontend Build
Vercel should auto-detect these settings from `vercel.json`:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If not auto-detected, set them manually in **Build & Development Settings**.

### 2.4 Set Environment Variables
1. In project settings, go to **Environment Variables**
2. Add this variable:

```bash
VITE_API_URL=https://your-backend.railway.app
```

Replace `https://your-backend.railway.app` with your actual Railway backend URL from Step 1.6.

### 2.5 Deploy Frontend
1. Click **Deploy**
2. Wait for build (~1-2 minutes)
3. Once deployed, copy your frontend URL: `https://your-app.vercel.app`

---

## 🔄 Step 3: Update CORS on Railway

Now that you have your Vercel URL, update Railway backend CORS:

1. Go back to **Railway** → Your backend service → **Variables**
2. Update `CORS_ORIGINS` variable:

```bash
CORS_ORIGINS=https://your-app.vercel.app
```

3. Railway will auto-redeploy with new CORS settings (~1 minute)

---

## ✅ Step 4: Test Your Deployed App

### 4.1 Test Backend API
```bash
# Health check
curl https://your-backend.railway.app/health

# API docs
https://your-backend.railway.app/docs
```

### 4.2 Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try adding a movie from TMDB
3. Check analytics page
4. Test AI review generation

### 4.3 Check Browser Console
- Open DevTools (F12) → Console
- Should see no CORS errors
- API calls should go to your Railway backend

---

## 🔥 Automatic Deployments

Both platforms auto-deploy on Git push:

### Vercel (Frontend)
- Pushes to `main` branch → auto-deploy
- Pull requests → preview deployments
- Check status: https://vercel.com/dashboard

### Railway (Backend)
- Pushes to `main` branch → auto-deploy
- View logs in Railway dashboard
- Check status: https://railway.app/dashboard

---

## 📁 Files Created for Deployment

These files were added to your repo:

```
MovieMate/
├── vercel.json                      # Vercel monorepo config
├── backend/
│   ├── Dockerfile                   # Railway container config
│   ├── railway.json                 # Railway build settings
│   └── requirements.txt             # Added gunicorn
└── frontend/
    ├── .env.example                 # Environment variable template
    └── src/services/api.js          # Updated to use VITE_API_URL
```

---

## 🛠️ Common Issues & Solutions

### Issue: CORS Error in Production
**Solution**: Make sure `CORS_ORIGINS` in Railway matches your exact Vercel URL (no trailing slash)

### Issue: "Module not found" in Railway
**Solution**: Check `requirements.txt` has all dependencies. Railway uses this file to install packages.

### Issue: Frontend shows "Network Error"
**Solution**: 
1. Check `VITE_API_URL` environment variable in Vercel
2. Verify Railway backend is running: visit `/health` endpoint
3. Check Railway logs for errors

### Issue: Database connection fails on Railway
**Solution**: Railway PostgreSQL auto-provisions. Check that `DATABASE_URL` variable is set to `${{Postgres.DATABASE_URL}}`

### Issue: Build fails on Vercel
**Solution**: 
1. Check `vercel.json` is in root directory
2. Verify `frontend/package.json` has all dependencies
3. Check Vercel build logs for specific errors

---

## 🎯 Next Steps

### Custom Domain (Optional)
- **Vercel**: Project Settings → Domains → Add Domain
- **Railway**: Service Settings → Networking → Custom Domain

### Environment Variables Per Branch
- **Vercel**: Can set different vars for Production/Preview/Development
- **Railway**: Can create multiple environments (Production/Staging)

### Monitoring
- **Vercel**: Analytics tab shows performance metrics
- **Railway**: Metrics tab shows CPU/Memory usage

---

## 📊 Cost Estimate (Free Tiers)

| Service | Free Tier Limits | Upgrade Cost |
|---------|------------------|--------------|
| **Vercel** | 100 GB bandwidth/month, Unlimited deployments | $20/month Pro |
| **Railway** | $5 credit/month (~500 hours), 1GB RAM | $5/month after credit |
| **Total** | Free for ~500 hours/month | ~$25/month unlimited |

**Note**: Your app should fit comfortably in free tiers for personal use.

---

## 🔐 Security Checklist

- ✅ API keys in environment variables (not in code)
- ✅ CORS configured to specific domains (not `*`)
- ✅ `.env` files in `.gitignore`
- ✅ Database credentials managed by Railway
- ✅ HTTPS enabled by default on both platforms

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Your Repo**: https://github.com/Vigneswer/MovieMate

---

## ✨ Summary Commands

```bash
# After making changes locally:
git add .
git commit -m "Update MovieMate"
git push origin main

# Vercel auto-deploys frontend
# Railway auto-deploys backend
# Check deployment status in dashboards
```

**Congratulations!** 🎉 Your MovieMate app is now live on the internet!

Frontend: `https://your-app.vercel.app`
Backend: `https://your-backend.railway.app`
API Docs: `https://your-backend.railway.app/docs`
