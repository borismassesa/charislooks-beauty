# 🔍 Debug Admin Login Issue

## Let's test the login step by step:

### **Test 1: Check if API endpoint works**

Open your browser console (F12) and go to:
https://charislooks-production.up.railway.app/admin

Then in the Console tab, paste this:

```javascript
fetch('https://charislooks-production.up.railway.app/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**What should you see:**
- ✅ `{message: "Login successful", admin: {...}}` = Login works!
- ❌ `{error: "Invalid credentials"}` = Password problem
- ❌ `{error: "Login failed"}` = Server error

---

### **Test 2: Check Railway Environment Variables**

Make sure these are ALL set in Railway → Variables:

```
DATABASE_URL = postgresql://neondb_owner:npg_z4AUXragLnJ9@ep-mute-bonus-adpgolyz-pooler.c-2.us-east-1.aws.neon.tech/charislooks?sslmode=require&channel_binding=require

SESSION_SECRET = charislooks-beauty-secure-session-key-2024

NODE_ENV = production
```

**Double-check:**
- No extra spaces
- No quotes around values
- DATABASE_URL doesn't have `psql` or `'` characters

---

### **Test 3: Check Railway Logs**

1. Railway Dashboard → Deployments
2. Click latest deployment
3. Click "View Logs"
4. Look for errors when you try to login

**Common errors to look for:**
- "relation admin_users does not exist" = Database not initialized
- "Invalid credentials" = Password mismatch
- "Session error" = SESSION_SECRET issue
- "Database connection failed" = DATABASE_URL problem

---

### **Test 4: Try Different Browser**

Sometimes cookies get stuck:
1. Try in **Incognito/Private mode**
2. Or try a completely different browser
3. Make sure cookies are enabled

---

## 🔧 **Quick Fixes to Try:**

### Fix 1: Restart Railway Service

1. Railway Dashboard → Your service
2. Settings tab
3. Scroll down → "Restart"
4. Wait 2 minutes
5. Try login again

### Fix 2: Clear ALL Browser Data

1. Open Dev Tools (F12)
2. Application tab → Storage
3. Click "Clear site data"
4. Refresh page
5. Try login again

### Fix 3: Verify Admin User One More Time

Run locally:
```bash
cd /Users/boris/projects/charislooks-beauty
cat > .env << 'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_z4AUXragLnJ9@ep-mute-bonus-adpgolyz-pooler.c-2.us-east-1.aws.neon.tech/charislooks?sslmode=require&channel_binding=require
NODE_ENV=production
EOF

node check-admin.js

rm .env
```

Should show: `Password test: ✅ VALID`

---

## 📊 **What Error Message Are You Seeing Exactly?**

Please tell me:
1. **Exact error message** on the login page
2. **Any errors in browser console** (F12 → Console tab)
3. **Any errors in Railway logs**

This will help me pinpoint the exact issue!

---

## 🆘 **Most Common Causes:**

1. ❌ SESSION_SECRET not set correctly in Railway
2. ❌ Cookies blocked by browser
3. ❌ Railway hasn't redeployed after changes
4. ❌ CORS or domain mismatch
5. ❌ Database connection issue during login

---

**Let's run Test 1 (browser console test) and see what response you get!**

