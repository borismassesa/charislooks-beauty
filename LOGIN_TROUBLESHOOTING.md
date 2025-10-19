# 🔐 Admin Login Troubleshooting

## ✅ Current Status

- Admin user **exists** in database ✅
- Username: `admin` ✅
- Password: `admin123` ✅
- Password hash is **valid** ✅

## 🚨 Issue: "Authentication details required to login"

This error means the login is failing on Railway. Possible causes:

### 1. **SESSION_SECRET Not Set in Railway**

Railway needs the SESSION_SECRET environment variable for sessions to work.

**Fix:**
1. Go to Railway Dashboard
2. Your project → Variables tab
3. Add new variable:
   - Name: `SESSION_SECRET`
   - Value: `charislooks-prod-secret-2024-change-this-random-string`
4. Save

Railway will auto-redeploy.

---

### 2. **Cookies Not Working (HTTPS/Domain Issue)**

Railway requires secure cookies in production.

**Check Railway Variables has:**
```
NODE_ENV=production
```

---

### 3. **CORS or Cookie Settings**

The app might be blocking cookies.

**Quick Test:**
- Try in **Incognito/Private browsing** mode
- Clear your browser cookies for the Railway domain
- Try a different browser

---

## 🔧 **IMMEDIATE FIX: Add SESSION_SECRET to Railway**

This is the most likely issue!

### Step-by-Step:

1. **Railway Dashboard** → Your Project
2. Click your **service** (charislooks-beauty)
3. **Variables** tab
4. Click **"+ New Variable"**
5. Name: `SESSION_SECRET`
6. Value: `charislooks-beauty-secure-session-key-2024-change-me`
7. Click **"Add"**
8. **Wait 2 minutes** for Railway to redeploy
9. **Try logging in again**

---

## 📋 Required Railway Variables Checklist

Make sure ALL these are set:

- [x] `DATABASE_URL` (you have this)
- [ ] `SESSION_SECRET` ← **ADD THIS!**
- [x] `NODE_ENV=production`
- [ ] `PORT=3000` (optional, Railway sets this)

---

## 🧪 After Adding SESSION_SECRET:

1. Wait for Railway to finish redeploying (~2 min)
2. Go to: https://charislooks-production.up.railway.app/admin
3. **Clear browser cookies** (important!)
4. Try login again:
   - Username: `admin`
   - Password: `admin123`

Should work! ✅

---

## 🔍 How to Check Railway Logs

If still not working:

1. Railway Dashboard → Deployments
2. Click latest deployment
3. Click "View Logs"
4. Look for login-related errors
5. Share the error message

---

## ✅ Expected Behavior After Fix

When login works:
- You'll be redirected to `/admin/overview`
- You'll see the admin dashboard
- Navigation will show services, portfolio, etc.

---

**Most likely fix: Add SESSION_SECRET to Railway Variables!** 🔑

