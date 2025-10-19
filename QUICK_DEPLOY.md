# ⚡ Quick Deploy Guide - TL;DR

**Time to deploy: 10 minutes** ⏱️

---

## 🚀 3 Simple Steps

### 1️⃣ Push to GitHub (1 min)
```bash
git push origin main
```

### 2️⃣ Create Database (3 min)
1. Go to **https://neon.tech**
2. Sign up, create project "charislooks-beauty"
3. **Copy your DATABASE_URL** (you'll need it!)

### 3️⃣ Deploy on Railway (5 min)
1. Go to **https://railway.app**
2. Login with GitHub
3. New Project → Deploy from GitHub → Select your repo
4. Add Variables:
   - `DATABASE_URL`: [your Neon URL]
   - `SESSION_SECRET`: `any-long-random-string-here`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
5. Wait for deployment (~2 min)

---

## ✅ That's It!

Your app will be live at: `https://your-app.up.railway.app`

**Admin Login:** `/admin`  
**Username:** `admin`  
**Password:** `admin123` (change this immediately!)

---

## 🔧 One More Step: Database Setup

After deployment, set up database tables:

**Option 1 - Railway CLI:**
```bash
railway login
railway link
railway run npm run db:push:prod
```

**Option 2 - Local:**
```bash
# Add DATABASE_URL to local .env temporarily
npm run db:push:prod
# Remove from .env after
```

---

## 📚 Need More Details?

See **DEPLOY_NOW.md** for complete step-by-step instructions.

---

**Everything is ready. Just follow these 3 steps! 🎉**

