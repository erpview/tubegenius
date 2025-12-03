# How to Use Your TubeGenius App

## 🎉 Your Backend is Live on Railway!

Your backend server is now running on Railway and ready to process YouTube downloads.

---

## 📱 Option 1: Use with Local Frontend (Easiest)

### Step 1: Get Your Railway URL

1. Go to Railway Dashboard: https://railway.app
2. Click on your project
3. Click on your service
4. Go to **Settings** → **Networking**
5. Click **"Generate Domain"** (if not done)
6. Copy your URL (e.g., `https://tubegenius-production.up.railway.app`)

### Step 2: Update Frontend

Edit this file: `services/mockBackendService.ts` (line 35)

**Change from:**
```typescript
const BACKEND_URL = 'http://localhost:4000';
```

**Change to:**
```typescript
const BACKEND_URL = 'https://YOUR-RAILWAY-URL.up.railway.app';
```

**Example:**
```typescript
const BACKEND_URL = 'https://tubegenius-production.up.railway.app';
```

### Step 3: Run Frontend Locally

```bash
# Make sure you're using the frontend package.json
mv package.json package.json.backend
mv package.json.frontend package.json
mv package-lock.json.frontend package-lock.json

# Install dependencies (if needed)
npm install

# Start the frontend
npm run dev
```

### Step 4: Open in Browser

Open: **http://localhost:5173**

Now you can:
1. Paste a YouTube URL
2. Click "Start"
3. Choose download format (MP4 1080p, 720p, or MP3)
4. Watch it download! 🎉

---

## 🌐 Option 2: Deploy Frontend to Netlify (Full Cloud)

### Step 1: Update Backend URL (same as above)

Edit `services/mockBackendService.ts` with your Railway URL

### Step 2: Build Frontend

```bash
# Make sure you're using frontend package.json
mv package.json package.json.backend
mv package.json.frontend package.json
mv package-lock.json.frontend package-lock.json

# Build
npm run build
```

### Step 3: Deploy to Netlify

**Option A: Drag & Drop**
1. Go to https://app.netlify.com
2. Sign in
3. Drag the `dist` folder to Netlify
4. Done! You get a URL like `https://your-app.netlify.app`

**Option B: GitHub**
1. Create a separate branch for frontend
2. Push only frontend files
3. Connect to Netlify
4. Auto-deploy

---

## 🧪 Test Your App

### Test URLs:
- Short video: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Music video: `https://www.youtube.com/watch?v=kJQP7kiw5Fk`

### What to Test:
1. ✅ Paste YouTube URL
2. ✅ Click "Start"
3. ✅ See video info appear
4. ✅ Click download button (MP4 or MP3)
5. ✅ Watch progress bar
6. ✅ File downloads automatically

---

## 🔧 Quick Commands

### Run Frontend Locally:
```bash
# Switch to frontend config
mv package.json package.json.backend
mv package.json.frontend package.json
mv package-lock.json.frontend package-lock.json

# Run
npm run dev

# Open: http://localhost:5173
```

### Run Backend Locally:
```bash
cd server
npm start

# Runs on: http://localhost:4000
```

### Build Frontend for Production:
```bash
npm run build
# Output in: dist/
```

---

## 🐛 Troubleshooting

### "Failed to connect to backend"
- Check Railway URL is correct in `mockBackendService.ts`
- Check Railway service is running (green dot in dashboard)
- Check browser console (F12) for errors

### "Download fails"
- Check Railway logs for errors
- Try a different YouTube video
- Some videos may be restricted

### "CORS error"
- Backend already configured for CORS
- Make sure using `https://` not `http://` for Railway URL

---

## 📊 Monitor Your App

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Usage**: Track your $5 free credit

### Check Logs:
1. Railway → Your Project
2. Click on service
3. Click "Deployments"
4. Click latest deployment
5. View logs in real-time

---

## 💰 Cost

**Current Setup:**
- Railway Backend: **FREE** ($5 credit/month)
- Netlify Frontend: **FREE** (unlimited)
- **Total: $0/month** ✅

**If you exceed free tier:**
- Railway: ~$5-10/month
- Netlify: Still free
- **Total: ~$5-10/month**

---

## 🎯 Your URLs

**Backend (Railway):**
- Get from: Railway Dashboard → Settings → Networking
- Example: `https://tubegenius-production.up.railway.app`

**Frontend (Local):**
- `http://localhost:5173`

**Frontend (Netlify):**
- Get after deployment
- Example: `https://tubegenius.netlify.app`

---

## 📝 Important Notes

### Legal:
- ⚠️ YouTube's Terms of Service prohibit downloading videos
- Use for educational purposes only
- Only download content you have rights to

### Performance:
- Downloads are processed on Railway server
- Speed depends on YouTube and Railway
- Large videos take longer

### Storage:
- Files auto-delete after 1 hour
- Railway has limited storage
- Don't store large files permanently

---

## 🆘 Need Help?

1. Check Railway logs first
2. Check browser console (F12)
3. Review this guide
4. Check Railway documentation: https://docs.railway.app

---

## 🎉 Enjoy Your App!

Your YouTube downloader is now live and ready to use!

**Quick Start:**
1. Get Railway URL from dashboard
2. Update `services/mockBackendService.ts` line 35
3. Run `npm run dev`
4. Open `http://localhost:5173`
5. Download videos! 🚀
