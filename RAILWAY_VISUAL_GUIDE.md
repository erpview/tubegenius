# 🚂 Railway Deployment - Visual Guide

## 📋 Checklist Before Starting

- [ ] Code is working locally
- [ ] GitHub account created
- [ ] Railway account (will create during process)

---

## 🎯 Step 1: Push to GitHub

### Open Terminal and run:

```bash
cd /Users/erpview/Downloads/tubegenius---ai-video-companion

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Railway"
```

### Create GitHub Repository:

1. Go to: **https://github.com/new**
2. Repository name: `tubegenius`
3. Description: `YouTube video downloader with AI`
4. Keep it **Public** (or Private if you prefer)
5. **Don't** initialize with README (we already have code)
6. Click **"Create repository"**

### Push your code:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/tubegenius.git
git branch -M main
git push -u origin main
```

✅ **Done!** Your code is now on GitHub

---

## 🎯 Step 2: Deploy to Railway

### A. Sign Up for Railway

1. Go to: **https://railway.app**
2. Click **"Login"** (top right)
3. Click **"Login with GitHub"**
4. Click **"Authorize Railway"**

✅ You're now logged into Railway!

### B. Create New Project

```
Railway Dashboard
└── Click "New Project" (big button)
    └── Select "Deploy from GitHub repo"
        └── Click "Configure GitHub App"
            └── Select "All repositories" or just "tubegenius"
            └── Click "Install & Authorize"
        └── Select your "tubegenius" repository
        └── Click "Deploy Now"
```

### C. Railway Auto-Detects Everything

Railway will automatically:
- ✅ Detect Node.js project
- ✅ Read `nixpacks.toml` (installs yt-dlp, ffmpeg)
- ✅ Run `npm install` in server folder
- ✅ Start your server

**Wait 2-3 minutes** ⏳

### D. Add Environment Variable

```
Your Project Dashboard
└── Click on your service (the card)
    └── Click "Variables" tab
        └── Click "New Variable"
            └── Variable: NODE_ENV
            └── Value: production
            └── Click "Add"
```

### E. Generate Public URL

```
Your Service
└── Click "Settings" tab
    └── Scroll to "Networking" section
        └── Click "Generate Domain"
        └── Copy the URL (e.g., tubegenius-production.up.railway.app)
```

✅ **Your backend is LIVE!** 🎉

---

## 🎯 Step 3: Update Frontend

### Edit: `services/mockBackendService.ts`

**Find line 34:**
```typescript
this.socket = io('http://localhost:4000', {
```

**Replace with:**
```typescript
// Use Railway URL in production, localhost in development
const BACKEND_URL = 'https://tubegenius-production.up.railway.app'; // YOUR Railway URL
this.socket = io(BACKEND_URL, {
```

**Save the file!**

### Commit and push:

```bash
git add .
git commit -m "Update backend URL for Railway"
git push
```

Railway will automatically redeploy! ✅

---

## 🎯 Step 4: Test Your Live Backend

### Option A: Test with Local Frontend

```bash
# Run frontend locally
npm run dev

# Open browser: http://localhost:3000
# Try downloading a video
# It now uses Railway backend!
```

### Option B: Deploy Frontend to Netlify

#### Build your frontend:
```bash
npm run build
```

#### Deploy to Netlify:

1. Go to: **https://app.netlify.com**
2. Sign in with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. Select your **tubegenius** repository
6. Configure:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
7. Click **"Deploy site"**

**Wait 2-3 minutes** ⏳

✅ **Your frontend is LIVE!** 🎉

You'll get a URL like: `https://tubegenius-abc123.netlify.app`

---

## 🎉 Success! You're Live!

### Your URLs:
- **Backend:** `https://your-app.up.railway.app`
- **Frontend:** `https://your-app.netlify.app` (or localhost:3000)

### Test it:
1. Open your frontend URL
2. Paste YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Click "Start"
4. Click "Download"
5. Watch the progress!
6. Video downloads! 🎊

---

## 📊 Monitor Your App

### Railway Dashboard:

```
Your Project
├── Deployments (see deployment history)
├── Metrics (CPU, Memory, Network)
├── Logs (real-time logs)
└── Settings (environment variables, domains)
```

### Check Logs:
```
Your Service
└── Click "Deployments" tab
    └── Click latest deployment
        └── See real-time logs
```

---

## 💰 Free Tier Limits

### Railway Free Tier:
- ✅ $5 credit per month
- ✅ ~500 hours of usage
- ✅ 100GB bandwidth
- ✅ 512MB RAM per service

### Netlify Free Tier:
- ✅ Unlimited sites
- ✅ 100GB bandwidth
- ✅ Automatic SSL
- ✅ Continuous deployment

**Total Cost: FREE** ✅

---

## 🔍 Troubleshooting

### ❌ "Build Failed"

**Check:**
1. Railway Logs → See error message
2. Make sure `nixpacks.toml` is in root folder
3. Make sure `server/package.json` exists

**Fix:**
```bash
# Make sure files are committed
git add .
git commit -m "Fix deployment"
git push
```

### ❌ "Cannot connect to backend"

**Check:**
1. Railway service is running (green dot)
2. Frontend has correct Railway URL
3. Browser console (F12) for errors

**Fix:**
- Update `mockBackendService.ts` with correct URL
- Commit and push

### ❌ "yt-dlp not found"

**Check:**
- `nixpacks.toml` exists in root folder
- Contains: `nixPkgs = ["nodejs", "python3", "ffmpeg"]`

**Fix:**
- Redeploy from Railway dashboard

### ❌ "Download fails with 403"

**This is YouTube blocking:**
- yt-dlp is already configured with headers
- Try different video
- Update yt-dlp (Railway auto-updates on redeploy)

---

## 🎓 What You Learned

✅ Deploy Node.js app to Railway
✅ Install system packages (yt-dlp, ffmpeg)
✅ Configure environment variables
✅ Deploy React app to Netlify
✅ Connect frontend to backend
✅ Monitor live applications

---

## 🚀 Next Steps

1. **Custom Domain** (optional)
   - Railway: Settings → Networking → Add custom domain
   - Netlify: Site settings → Domain management

2. **Add Analytics** (optional)
   - Google Analytics
   - Plausible Analytics

3. **Improve Features**
   - Add download history
   - Add user accounts
   - Add playlist support

4. **Scale Up** (when needed)
   - Upgrade Railway plan
   - Add CDN for downloads
   - Add database for tracking

---

## 🎊 Congratulations!

You've successfully deployed a full-stack YouTube downloader app!

**Share your app:**
- Tweet about it
- Share with friends
- Add to portfolio

**Remember:**
- Monitor Railway usage
- Check logs regularly
- Update dependencies
- Add rate limiting for public use

---

## 📞 Support

**Railway:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**Netlify:**
- Support: https://www.netlify.com/support/
- Docs: https://docs.netlify.com

**This Project:**
- Check DEPLOYMENT_OPTIONS.md
- Check QUICK_DEPLOY.md
- Check server logs on Railway
