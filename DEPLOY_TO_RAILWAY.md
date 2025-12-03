# Deploy TubeGenius to Railway (Free)

## ✅ What You Get
- Free hosting with $5/month credit (500 hours)
- Automatic HTTPS
- WebSocket support
- System packages (yt-dlp, ffmpeg)
- GitHub auto-deployment

---

## 🚀 Step-by-Step Deployment

### 1. Push to GitHub

```bash
cd /Users/erpview/Downloads/tubegenius---ai-video-companion
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tubegenius.git
git push -u origin main
```

### 2. Deploy Backend to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `tubegenius` repository
5. Railway will auto-detect Node.js

**Configure:**
- Click on your service
- Go to "Settings"
- Add environment variable:
  - `NODE_ENV` = `production`
- Railway will automatically install yt-dlp and ffmpeg from `nixpacks.toml`

6. Wait for deployment (2-3 minutes)
7. Copy your Railway URL (e.g., `https://tubegenius-production.up.railway.app`)

### 3. Update Frontend for Production

Edit `services/mockBackendService.ts`:

```typescript
// Replace this line:
this.socket = io('http://localhost:4000', {

// With this:
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:4000';
this.socket = io(BACKEND_URL, {
```

### 4. Deploy Frontend to Netlify

**Option A: Via Netlify CLI**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

**Option B: Via Netlify Dashboard**
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables:
     - `VITE_BACKEND_URL` = `https://your-railway-url.railway.app`
5. Deploy!

### 5. Test Your Deployment

1. Visit your Netlify URL
2. Paste a YouTube URL
3. Download should work!

---

## 🔧 Alternative: Deploy Everything to Railway

If you want both frontend and backend on Railway:

### Update `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run build && cd server && npm install && node serve-all.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Create `server/serve-all.js`:
```javascript
const express = require('express');
const path = require('path');

// Import your existing server
require('./server.js');

// Serve frontend static files
const app = express();
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT + 1);
```

---

## 📊 Monitoring

**Railway Dashboard:**
- View logs
- Monitor CPU/Memory
- Check deployment status
- View metrics

**Important:**
- Free tier: 500 hours/month
- After that: ~$5-10/month
- Monitor usage in Railway dashboard

---

## ⚠️ Important Notes

### 1. File Cleanup
Add this to `server.js` to auto-delete old files:

```javascript
// Clean up old downloads every hour
setInterval(() => {
  const files = fs.readdirSync(downloadsDir);
  const now = Date.now();
  files.forEach(file => {
    const filePath = path.join(downloadsDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;
    // Delete files older than 1 hour
    if (age > 3600000) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old file: ${file}`);
    }
  });
}, 3600000);
```

### 2. Rate Limiting
Consider adding rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Legal Disclaimer
Add this to your frontend:

```
⚠️ Disclaimer: This tool is for educational purposes only. 
Downloading YouTube videos may violate YouTube's Terms of Service. 
Use responsibly and only for content you have rights to download.
```

---

## 🐛 Troubleshooting

**Problem:** yt-dlp not found
**Solution:** Make sure `nixpacks.toml` includes python3

**Problem:** CORS errors
**Solution:** Check Railway URL is correct in frontend

**Problem:** Downloads fail
**Solution:** Check Railway logs for errors

**Problem:** Out of memory
**Solution:** Upgrade Railway plan or add file size limits

---

## 💰 Cost Estimate

**Free Tier (Railway):**
- $5 credit/month
- ~500 hours
- Good for personal use

**Paid (if needed):**
- Railway: ~$5-10/month
- Netlify: Free for frontend
- Total: ~$5-10/month

---

## 🎉 You're Done!

Your YouTube downloader is now live and accessible from anywhere!

**Next Steps:**
- Add custom domain
- Implement user authentication
- Add download history
- Implement cloud storage for files
- Add analytics
