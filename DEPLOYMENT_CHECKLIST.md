# 🚀 Deployment Checklist

Use this checklist to track your deployment progress.

## ✅ Pre-Deployment (Local Setup)
- [x] Code pushed to GitHub: `https://github.com/Vigneswer/MovieMate`
- [x] Deployment configs created (vercel.json, Dockerfile, railway.json)
- [x] Frontend environment variable support added
- [x] Backend CORS updated for production
- [x] Gunicorn added to requirements.txt
- [x] Local build tested and working

## 📦 Ready to Deploy
- [ ] Push deployment configs to GitHub:
  ```bash
  git add .
  git commit -m "feat: add deployment configurations for Vercel and Railway"
  git push origin main
  ```

---

## 🔧 Railway Deployment (Backend + Database)

### Account Setup
- [ ] Created Railway account at https://railway.app
- [ ] Connected GitHub account to Railway

### Project Setup
- [ ] Created new Railway project
- [ ] Selected "Deploy from GitHub repo"
- [ ] Chose repository: `Vigneswer/MovieMate`

### Backend Service Configuration
- [ ] Set Root Directory to: `backend`
- [ ] Confirmed Dockerfile detected
- [ ] Added PostgreSQL database to project

### Environment Variables
- [ ] Added `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] Added `OMDB_API_KEY=4e37122b`
- [ ] Added `GEMINI_API_KEY=AIzaSyDCrnMVfHRTMb7nT96nU5VrAF-Wn9yqhEs`
- [ ] Added `API_HOST=0.0.0.0`
- [ ] Added `API_PORT=8000`
- [ ] Added `DEBUG=False`
- [ ] Added `CORS_ORIGINS=*` (temporary, will update after Vercel)

### Deployment
- [ ] Triggered deployment
- [ ] Build completed successfully
- [ ] Generated public domain
- [ ] Copied backend URL: `_____________________________`
- [ ] Tested health endpoint: `https://your-backend.railway.app/health`
- [ ] Tested API docs: `https://your-backend.railway.app/docs`

**Backend URL**: `_____________________________`

---

## 🎨 Vercel Deployment (Frontend)

### Account Setup
- [ ] Created Vercel account at https://vercel.com
- [ ] Signed up with GitHub

### Project Setup
- [ ] Clicked "Add New" → "Project"
- [ ] Imported `MovieMate` repository
- [ ] Vercel detected `vercel.json` config

### Build Configuration (Auto-detected)
- [ ] Framework: Vite
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### Environment Variables
- [ ] Added `VITE_API_URL` with Railway backend URL

  **Value**: `_____________________________` (from Railway)

### Deployment
- [ ] Clicked "Deploy"
- [ ] Build completed successfully
- [ ] Copied frontend URL: `_____________________________`
- [ ] Tested app in browser

**Frontend URL**: `_____________________________`

---

## 🔄 Final Configuration

### Update CORS on Railway
- [ ] Went back to Railway → Backend service → Variables
- [ ] Updated `CORS_ORIGINS` with Vercel URL (no trailing slash)
- [ ] Railway auto-redeployed (~1 minute)

### Production Testing
- [ ] Visited frontend URL
- [ ] Tested search functionality
- [ ] Added a movie to collection
- [ ] Checked analytics page
- [ ] Generated AI review
- [ ] Checked browser console for errors
- [ ] Verified API calls go to Railway backend

---

## 🎯 Post-Deployment

### Documentation
- [ ] Updated README.md with production URLs (optional)
- [ ] Noted any deployment issues for future reference

### Monitoring
- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked Railway dashboard
- [ ] Set up email notifications (optional)

### Optional Enhancements
- [ ] Configure custom domain on Vercel
- [ ] Configure custom domain on Railway
- [ ] Set up environment variables for staging
- [ ] Enable Vercel Analytics
- [ ] Review Railway metrics

---

## 📊 Deployment URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (Vercel)** | `___________________________` | ⬜ |
| **Backend (Railway)** | `___________________________` | ⬜ |
| **API Docs** | `___________________________/docs` | ⬜ |
| **Database** | Managed by Railway | ⬜ |

---

## 🆘 Troubleshooting

If you encounter issues, check:

1. **CORS Errors**: 
   - Verify `CORS_ORIGINS` in Railway matches Vercel URL exactly
   - Check Railway logs for rejected requests

2. **Frontend "Network Error"**:
   - Verify `VITE_API_URL` in Vercel environment variables
   - Test Railway backend health endpoint
   - Check browser console for error details

3. **Build Failures**:
   - Check Railway/Vercel deployment logs
   - Verify all dependencies in requirements.txt/package.json
   - Test build locally first

4. **Database Connection**:
   - Verify `DATABASE_URL` variable is set to `${{Postgres.DATABASE_URL}}`
   - Check Railway PostgreSQL service is running

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Can search and add movies
- ✅ Analytics page displays data
- ✅ AI review generation works
- ✅ No CORS errors in browser console
- ✅ API calls reach Railway backend
- ✅ Data persists in PostgreSQL

---

**Need Help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions!
