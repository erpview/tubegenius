# Deployment Options for TubeGenius

## ❌ Won't Work
- **Netlify** - No WebSocket support, no long-running processes, no system binaries
- **Vercel** - Same limitations as Netlify
- **GitHub Pages** - Static sites only

## ✅ Recommended Options

### 1. **Railway.app** (Easiest - Recommended)
**Why:** Free tier, supports Docker, WebSockets, persistent processes

**Steps:**
1. Create account at railway.app
2. Connect your GitHub repo
3. Railway auto-detects Node.js and deploys
4. Add environment variables if needed
5. Done! Railway handles everything

**Pros:**
- Free $5/month credit
- Automatic deployments from GitHub
- Built-in domain
- Supports WebSockets
- Can install system packages

**Cons:**
- Limited free tier (500 hours/month)

---

### 2. **Render.com** (Good Alternative)
**Why:** Free tier, Docker support, easy setup

**Steps:**
1. Create account at render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Select "Docker" or "Node"
5. Deploy

**Pros:**
- Free tier available
- Automatic SSL
- GitHub integration
- WebSocket support

**Cons:**
- Free tier spins down after inactivity (cold starts)
- 750 hours/month limit

---

### 3. **Heroku** (Classic Option)
**Why:** Well-established, good documentation

**Steps:**
1. Create Heroku account
2. Install Heroku CLI
3. Create new app
4. Add buildpacks for Node.js and FFmpeg
5. Deploy via Git

**Pros:**
- Mature platform
- Good documentation
- Add-ons available

**Cons:**
- No free tier anymore (starts at $5/month)
- Requires credit card

---

### 4. **DigitalOcean App Platform**
**Why:** Simple deployment, good performance

**Pricing:** Starts at $5/month

**Steps:**
1. Create DigitalOcean account
2. Create new App
3. Connect GitHub repo
4. Configure build settings
5. Deploy

**Pros:**
- Reliable infrastructure
- Good performance
- Easy scaling

**Cons:**
- No free tier
- Minimum $5/month

---

### 5. **Self-Hosted VPS** (Most Control)
**Options:** DigitalOcean Droplet, AWS EC2, Linode, Vultr

**Pricing:** $4-6/month

**Steps:**
1. Create VPS instance
2. SSH into server
3. Install Node.js, yt-dlp, ffmpeg
4. Clone repo and run
5. Use PM2 to keep it running
6. Setup nginx as reverse proxy

**Pros:**
- Full control
- Can install anything
- Best performance
- Cheapest long-term

**Cons:**
- Requires server management
- Need to handle security/updates
- More technical setup

---

## 🚀 Quick Start: Railway Deployment

### Step 1: Prepare Your Code

Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 2: Update server.js for Production

Add this at the top of `server/server.js`:
```javascript
const PORT = process.env.PORT || 4000;
```

Change the Socket.IO CORS to accept all origins in production:
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? '*' : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});
```

### Step 3: Deploy Frontend Separately

**Option A: Netlify (for frontend only)**
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Update frontend Socket.IO URL to your Railway backend URL

**Option B: Railway (frontend + backend together)**
1. Add a start script that serves both
2. Deploy everything to Railway

---

## 📝 Important Notes

### File Storage
- Downloaded videos are temporary
- Consider adding cleanup job to delete old files
- For production, use cloud storage (AWS S3, Cloudflare R2)

### Legal Considerations
- YouTube's Terms of Service prohibit downloading videos
- This is for educational purposes only
- Consider adding rate limiting
- Add disclaimer on the website

### Performance
- Video downloads are resource-intensive
- Consider adding queue system for multiple users
- Monitor bandwidth usage
- Add file size limits

---

## 🎯 Recommended Setup for Production

**Best Setup:**
1. **Frontend:** Netlify (free, fast CDN)
2. **Backend:** Railway (free tier, easy deployment)
3. **Storage:** Cloudflare R2 or AWS S3 (for downloaded files)

**Cost:** Free tier available, ~$5-10/month for production

---

## Need Help?

1. Railway: https://docs.railway.app
2. Render: https://render.com/docs
3. DigitalOcean: https://docs.digitalocean.com
