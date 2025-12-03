# TubeGenius - Deployment Guide

## 🎯 Quick Links

- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Fast 5-minute deployment guide
- **[RAILWAY_VISUAL_GUIDE.md](RAILWAY_VISUAL_GUIDE.md)** - Step-by-step with screenshots guide
- **[DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)** - Compare all hosting options

---

## ⚡ Fastest Way to Deploy (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tubegenius.git
git push -u origin main
```

### 2. Deploy to Railway
1. Go to https://railway.app
2. Login with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repo
5. Wait 2 minutes
6. Generate domain in Settings → Networking

### 3. Update Frontend
Edit `services/mockBackendService.ts` line 34:
```typescript
const BACKEND_URL = 'https://your-railway-url.railway.app';
this.socket = io(BACKEND_URL, {
```

### 4. Deploy Frontend (Optional)
```bash
npm run build
# Drag 'dist' folder to netlify.com
```

✅ **Done!**

---

## 📁 Important Files for Deployment

### Already Created for You:
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - System packages (yt-dlp, ffmpeg)
- ✅ `.gitignore` - Excludes downloads folder
- ✅ `server/downloads/.gitkeep` - Ensures folder exists

### Your Code is Production-Ready:
- ✅ Uses `process.env.PORT` for Railway
- ✅ CORS configured for production
- ✅ Binds to `0.0.0.0` for Railway
- ✅ Health check endpoint at `/health`

---

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────┐
│           USER'S BROWSER                │
│  (Netlify: your-app.netlify.app)       │
└─────────────┬───────────────────────────┘
              │
              │ WebSocket Connection
              │
┌─────────────▼───────────────────────────┐
│       BACKEND SERVER (Railway)          │
│  (your-app.up.railway.app)             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Node.js + Socket.IO            │   │
│  │  yt-dlp (YouTube downloader)    │   │
│  │  ffmpeg (Video processing)      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  /downloads folder              │   │
│  │  (Temporary video storage)      │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │
              │ Downloads videos from
              │
┌─────────────▼───────────────────────────┐
│           YOUTUBE.COM                   │
└─────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Starting):
| Service | Cost | Limits |
|---------|------|--------|
| Railway (Backend) | **FREE** | $5 credit/month (~500 hours) |
| Netlify (Frontend) | **FREE** | 100GB bandwidth, unlimited sites |
| **TOTAL** | **$0/month** | Perfect for personal use |

### If You Exceed Free Tier:
| Service | Cost | What You Get |
|---------|------|--------------|
| Railway | **$5-10/month** | More hours, better performance |
| Netlify | **Still FREE** | Frontend stays free |
| **TOTAL** | **$5-10/month** | Good for public use |

---

## 🔒 Security & Legal

### ⚠️ Important Disclaimers:

1. **YouTube Terms of Service**
   - Downloading videos may violate YouTube's TOS
   - Use only for educational purposes
   - Only download content you have rights to

2. **Rate Limiting** (Recommended)
   - Add rate limiting to prevent abuse
   - See DEPLOYMENT_OPTIONS.md for code

3. **File Cleanup**
   - Files auto-delete after 1 hour (already configured)
   - Prevents storage issues

### Add This Disclaimer to Your Frontend:
```html
⚠️ Educational purposes only. Downloading YouTube videos 
may violate YouTube's Terms of Service. Use responsibly.
```

---

## 📊 Monitoring Your App

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History and status
- **Usage**: Track your $5 credit

### Set Up Alerts:
1. Railway → Project Settings
2. Add notification email
3. Get alerts when approaching limits

---

## 🐛 Common Issues & Solutions

### Issue: "Build Failed on Railway"
**Solution:**
- Check Railway logs
- Ensure `nixpacks.toml` is in root folder
- Verify `server/package.json` exists

### Issue: "Frontend can't connect to backend"
**Solution:**
- Check Railway URL in `mockBackendService.ts`
- Verify Railway service is running (green dot)
- Check browser console (F12) for errors

### Issue: "yt-dlp not found"
**Solution:**
- Ensure `nixpacks.toml` includes python3
- Redeploy from Railway dashboard

### Issue: "Downloads fail with 403"
**Solution:**
- YouTube is blocking the request
- yt-dlp headers are already configured
- Try a different video
- Update yt-dlp (redeploy on Railway)

### Issue: "Out of Railway credits"
**Solution:**
- Upgrade to paid plan ($5-10/month)
- Or optimize: add file size limits, rate limiting

---

## 🚀 Scaling Your App

### When You Need to Scale:

**Signs:**
- Running out of Railway credits
- Slow download speeds
- Multiple users at once

**Solutions:**

1. **Upgrade Railway Plan**
   - More resources
   - Better performance
   - ~$5-10/month

2. **Add Queue System**
   - Process downloads one at a time
   - Prevents overload
   - Use Bull or BullMQ

3. **Add Cloud Storage**
   - Store files in S3/R2
   - Serve from CDN
   - Better for multiple users

4. **Add Caching**
   - Cache popular videos
   - Reduce YouTube requests
   - Faster for repeat downloads

---

## 📚 Additional Resources

### Documentation:
- [Railway Docs](https://docs.railway.app)
- [Netlify Docs](https://docs.netlify.com)
- [yt-dlp Docs](https://github.com/yt-dlp/yt-dlp)
- [Socket.IO Docs](https://socket.io/docs/)

### Community:
- [Railway Discord](https://discord.gg/railway)
- [Netlify Community](https://community.netlify.com)

### Your Guides:
- `QUICK_DEPLOY.md` - Fast deployment
- `RAILWAY_VISUAL_GUIDE.md` - Detailed steps
- `DEPLOYMENT_OPTIONS.md` - All hosting options

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Code works locally
- [ ] `.gitignore` includes `server/downloads/*`
- [ ] `railway.json` exists
- [ ] `nixpacks.toml` exists
- [ ] GitHub repository created

After deploying:
- [ ] Railway service is running
- [ ] Domain generated
- [ ] Frontend updated with Railway URL
- [ ] Test download works
- [ ] Monitor logs for errors
- [ ] Set up usage alerts

---

## 🎉 You're Ready!

Everything is configured and ready to deploy. Choose your guide:

1. **Quick & Simple**: Read `QUICK_DEPLOY.md`
2. **Detailed Steps**: Read `RAILWAY_VISUAL_GUIDE.md`
3. **Compare Options**: Read `DEPLOYMENT_OPTIONS.md`

**Good luck with your deployment!** 🚀

---

## 📞 Need Help?

1. Check the troubleshooting section above
2. Review Railway logs
3. Check browser console (F12)
4. Join Railway Discord for support
5. Review the deployment guides

**Remember:** The app is working locally, so deployment is just about configuration!
