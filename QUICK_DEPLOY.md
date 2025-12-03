# Quick Deploy to Railway - 5 Minutes

## Step 1: Push Your Code to GitHub

```bash
# Navigate to your project
cd /Users/erpview/Downloads/tubegenius---ai-video-companion

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Railway deployment"

# Create a new repository on GitHub (go to github.com and create new repo)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/tubegenius.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### A. Sign Up
1. Go to **https://railway.app**
2. Click **"Login"** → Sign in with GitHub
3. Authorize Railway to access your GitHub

### B. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **tubegenius** repository
4. Railway will automatically detect it's a Node.js project

### C. Configure the Project
1. Click on your deployed service
2. Go to **"Settings"** tab
3. Scroll to **"Environment Variables"**
4. Add variable:
   - Name: `NODE_ENV`
   - Value: `production`
5. Click **"Add"**

### D. Wait for Deployment
- Railway will automatically:
  - Install Node.js
  - Install yt-dlp and ffmpeg (from nixpacks.toml)
  - Run `npm install` in server folder
  - Start your server
- Takes 2-3 minutes

### E. Get Your URL
1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy your URL (e.g., `tubegenius-production.up.railway.app`)

---

## Step 3: Update Frontend to Use Railway Backend

Edit this file: `services/mockBackendService.ts`

Find this line (around line 34):
```typescript
this.socket = io('http://localhost:4000', {
```

Replace with:
```typescript
const BACKEND_URL = 'https://YOUR-RAILWAY-URL.railway.app';
this.socket = io(BACKEND_URL, {
```

**Example:**
```typescript
const BACKEND_URL = 'https://tubegenius-production.up.railway.app';
this.socket = io(BACKEND_URL, {
```

Save the file.

---

## Step 4: Test Locally with Railway Backend

```bash
# Make sure frontend is running
npm run dev

# Open browser at http://localhost:3000
# Try downloading a video
# It should now use Railway backend!
```

---

## Step 5: Deploy Frontend to Netlify (Optional)

### Option A: Drag & Drop (Easiest)

1. Build your frontend:
```bash
npm run build
```

2. Go to **https://app.netlify.com**
3. Sign in with GitHub
4. Drag the `dist` folder to Netlify
5. Done! You get a URL like `https://your-app.netlify.app`

### Option B: GitHub Auto-Deploy

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Select your **tubegenius** repository
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **"Deploy site"**
7. Wait 2-3 minutes
8. Done!

---

## ✅ You're Live!

Your app is now deployed:
- **Backend:** Running on Railway
- **Frontend:** Running on Netlify (or localhost)

**Test it:**
1. Go to your Netlify URL (or localhost:3000)
2. Paste a YouTube URL
3. Click download
4. It works! 🎉

---

## 🔧 Troubleshooting

### Backend not working?

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click latest deployment
5. View logs

**Common issues:**
- yt-dlp not installed → Check `nixpacks.toml` is in root folder
- Port error → Railway automatically sets PORT env variable
- CORS error → Check frontend is using correct Railway URL

### Frontend can't connect?

**Check:**
1. Railway URL is correct in `mockBackendService.ts`
2. Railway service is running (check dashboard)
3. Browser console for errors (F12)

### Downloads fail?

**Check Railway logs for:**
- yt-dlp errors
- YouTube blocking
- Memory issues

**Solutions:**
- Update yt-dlp: Railway will auto-update on redeploy
- Add rate limiting
- Increase Railway plan if needed

---

## 💰 Costs

**Free Tier:**
- Railway: $5 credit/month (500 hours)
- Netlify: Unlimited for personal projects
- **Total: FREE** ✅

**If you exceed free tier:**
- Railway: ~$5-10/month
- Netlify: Still free
- **Total: ~$5-10/month**

---

## 📊 Monitor Usage

**Railway Dashboard:**
- Go to your project
- Click **"Metrics"** tab
- See:
  - CPU usage
  - Memory usage
  - Network traffic
  - Hours used

**Set up alerts:**
1. Go to project settings
2. Add email for notifications
3. Get alerts when approaching limits

---

## 🎯 Next Steps

1. **Add custom domain** (optional)
   - Railway: Settings → Networking → Custom Domain
   - Netlify: Site settings → Domain management

2. **Set up auto-cleanup** (recommended)
   - Files are deleted after 1 hour (already configured)

3. **Add rate limiting** (recommended for public use)
   - Prevents abuse
   - See DEPLOYMENT_OPTIONS.md for code

4. **Monitor logs regularly**
   - Check for errors
   - Monitor download patterns

---

## 🆘 Need Help?

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**Netlify Support:**
- Support: https://www.netlify.com/support/
- Docs: https://docs.netlify.com

**Issues with this app:**
- Check Railway logs first
- Check browser console (F12)
- Verify URLs are correct
