# ⚡ Quick Start: Deploy to Render in 5 Minutes

## 🎯 Simple 3-Step Process

### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Click **"Get Started"** 
3. Sign up with **GitHub** ✅

---

### **Step 2: Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your **`tubegenius`** repository
3. Fill in these settings:

**Copy & Paste These Values:**

| Setting | Value |
|---------|-------|
| **Name** | `tubegenius-backend` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Build Command** | `./render-build.sh` |
| **Start Command** | `cd server && node server.js` |

**Environment Variables** (click "Add Environment Variable"):
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `PYTHON_VERSION` = `3.11.0`

**Advanced Settings:**
- Health Check Path: `/health`

4. Click **"Create Web Service"** 🚀

---

### **Step 3: Get Your URL**
1. Wait 3-5 minutes for build to complete
2. Copy your URL: `https://tubegenius-backend.onrender.com`
3. Test it in browser - you should see:
   ```json
   {"status": "ok", "message": "TubeGenius Backend API"}
   ```

---

## 🔗 Update Frontend

Update the backend URL in your frontend:

1. Edit `services/mockBackendService.ts`
2. Change line 33-34 to:
   ```typescript
   const BACKEND_URL = 'https://tubegenius-backend.onrender.com';
   ```
3. Commit and push to `netlify-frontend` branch

---

## ⚡ Keep It Awake (Optional)

Free tier sleeps after 15 min. To keep it awake 24/7:

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up free
3. Add monitor:
   - Type: `HTTP(s)`
   - URL: `https://tubegenius-backend.onrender.com/health`
   - Interval: `5 minutes`

Done! Your app stays awake forever! 🎉

---

## ✅ That's It!

Your backend is now on Render! 
- Backend: `https://tubegenius-backend.onrender.com`
- Frontend: Your Netlify URL

**Total Cost: $0** 💰

Need detailed instructions? See `DEPLOY_TO_RENDER.md`
