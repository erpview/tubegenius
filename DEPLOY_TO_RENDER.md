# 🚀 Deploy TubeGenius Backend to Render.com

## Why Render?
- ✅ **Free tier** with 750 hours/month
- ✅ **Auto-deploy** from GitHub
- ✅ **Easy setup** - similar to Railway
- ⚠️ **Note:** Free tier sleeps after 15 min inactivity (30-60 sec cold start)

---

## 📋 Step-by-Step Deployment Guide

### **Step 1: Sign Up for Render**
1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email if needed

---

### **Step 2: Connect Your GitHub Repository**
1. After signing in, click **"New +"** in the top right
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Authorize Render to access your GitHub
5. Find and select your **`tubegenius`** repository

---

### **Step 3: Configure Your Service**

Fill in the following settings:

#### **Basic Settings:**
- **Name:** `tubegenius-backend` (or any name you prefer)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** `Node`

#### **Build & Deploy:**
- **Build Command:**
  ```bash
  apt-get update && apt-get install -y python3 python3-pip ffmpeg && pip3 install --break-system-packages yt-dlp && cd server && npm install
  ```

- **Start Command:**
  ```bash
  cd server && node server.js
  ```

#### **Plan:**
- Select **"Free"** plan

---

### **Step 4: Environment Variables**

Scroll down to **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

---

### **Step 5: Advanced Settings (Optional but Recommended)**

Scroll down to **"Advanced"** and configure:

- **Health Check Path:** `/health`
- **Auto-Deploy:** `Yes` (enabled by default)

---

### **Step 6: Deploy!**

1. Click **"Create Web Service"** at the bottom
2. Render will start building your app
3. Watch the build logs (takes 3-5 minutes)
4. Wait for the status to show **"Live"** 🟢

---

## 🔗 After Deployment

### **Get Your Backend URL:**
1. Once deployed, you'll see your service URL like:
   ```
   https://tubegenius-backend.onrender.com
   ```
2. Copy this URL!

### **Test Your Backend:**
1. Open your URL in a browser
2. You should see:
   ```json
   {
     "status": "ok",
     "message": "TubeGenius Backend API",
     "endpoints": {
       "health": "/health",
       "downloads": "/downloads"
     }
   }
   ```

### **Update Frontend:**
1. Open `services/mockBackendService.ts`
2. Update the backend URL:
   ```typescript
   const BACKEND_URL = 'https://tubegenius-backend.onrender.com';
   ```
3. Commit and push to `netlify-frontend` branch

---

## 🎯 Keep Your App Awake (Prevent Cold Starts)

Since Render free tier sleeps after 15 min, use **UptimeRobot** to keep it awake:

### **Setup UptimeRobot (Free):**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free
3. Click **"Add New Monitor"**
4. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** TubeGenius Backend
   - **URL:** `https://tubegenius-backend.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
5. Click **"Create Monitor"**

Now your app will stay awake 24/7! 🎉

---

## 🔄 Auto-Deploy on Git Push

Render automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will detect the push and redeploy automatically!

---

## 📊 Monitor Your App

### **View Logs:**
1. Go to your Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time logs

### **Check Metrics:**
1. Click **"Metrics"** tab
2. See CPU, Memory, Request stats

---

## 🐛 Troubleshooting

### **Build Fails:**
- Check the build logs for errors
- Make sure `server/package.json` exists
- Verify build command is correct

### **Server Won't Start:**
- Check if `PORT` environment variable is set to `10000`
- Verify start command: `cd server && node server.js`
- Check logs for errors

### **yt-dlp Not Found:**
- Make sure build command includes: `pip3 install --break-system-packages yt-dlp`
- Check logs to see if installation succeeded

### **Downloads Fail:**
- YouTube may block Render's IP addresses
- Try updating yt-dlp: redeploy your service
- Check error messages in logs

---

## 💰 Cost Comparison

| Feature | Render Free | Railway Free |
|---------|-------------|--------------|
| **Hours/Month** | 750 hours | 500 hours |
| **RAM** | 512 MB | 512 MB |
| **Sleep Policy** | After 15 min | No sleep |
| **Cold Start** | 30-60 sec | None |
| **Build Minutes** | 500/month | Unlimited |
| **Bandwidth** | 100 GB | 100 GB |

---

## 🎉 You're Done!

Your TubeGenius backend is now running on Render! 

**Next Steps:**
1. ✅ Backend deployed on Render
2. ✅ Frontend deployed on Netlify
3. ✅ Update frontend to use Render URL
4. ✅ Set up UptimeRobot to prevent cold starts
5. 🎊 Enjoy your free YouTube downloader!

---

## 📚 Useful Links

- [Render Dashboard](https://dashboard.render.com)
- [Render Docs](https://render.com/docs)
- [UptimeRobot](https://uptimerobot.com)
- [Your Netlify Site](https://app.netlify.com)

---

**Need Help?** Check the logs in your Render dashboard or review this guide!
