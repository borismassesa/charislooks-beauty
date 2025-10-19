# 🗄️ Database Setup Instructions

## ❌ Error You're Seeing:

```
Error: getaddrinfo ENOTFOUND base
```

This means the DATABASE_URL is not properly set in your `.env` file.

---

## ✅ How to Fix It

### Step 1: Get Your Real DATABASE_URL from Railway

1. **Go to Railway dashboard:** https://railway.app
2. **Click your project:** `charislooks-beauty`
3. **Click the "Variables" tab** (left sidebar)
4. **Find DATABASE_URL** - it should look like:
   ```
   postgresql://username:password@host.region.neon.tech/database?sslmode=require
   ```
5. **Click the copy button** or select and copy the entire URL

**Important:** Make sure you copy the FULL URL including:
- `postgresql://` at the start
- Username and password
- Host address
- `/database?sslmode=require` at the end

---

### Step 2: Create .env File with REAL Database URL

#### Option A: Manual (Safest)

1. **Create or edit `.env` file in your project root:**
   ```bash
   nano .env
   # or
   code .env  # if using VS Code
   ```

2. **Add these lines (replace with YOUR actual Railway DATABASE_URL):**
   ```bash
   DATABASE_URL=postgresql://your-actual-username:your-actual-password@your-actual-host.neon.tech/your-database?sslmode=require
   NODE_ENV=production
   ```

3. **Save the file** (Ctrl+X, then Y if using nano)

#### Option B: Command Line

**IMPORTANT:** Replace the entire URL below with your actual Railway DATABASE_URL:

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://PASTE_YOUR_FULL_RAILWAY_URL_HERE
NODE_ENV=production
EOF
```

---

### Step 3: Run Database Push

```bash
npm run db:push:prod
```

**Expected output:**
```
✓ Pulling schema from database...
✓ Changes applied successfully
```

---

### Step 4: Clean Up (IMPORTANT for Security!)

After database push succeeds, remove the DATABASE_URL from your local `.env`:

```bash
# Delete the .env file
rm .env

# OR edit it to remove just the DATABASE_URL line
# Keep the file if you have other local env vars
```

**Why?** You don't want your production database credentials sitting in your local files.

---

## 🔍 Common Mistakes

### ❌ Wrong:
```bash
DATABASE_URL=paste-your-railway-database-url-here
```
This is a placeholder! You need the REAL URL from Railway.

### ❌ Wrong:
```bash
DATABASE_URL=base
```
Incomplete URL.

### ✅ Correct:
```bash
DATABASE_URL=postgresql://neondb_owner:npg_ABC123xyz789@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```
Complete connection string with all parts.

---

## 🧪 Verify Your DATABASE_URL is Correct

Your DATABASE_URL should have these parts:

```
postgresql://USERNAME:PASSWORD@HOSTNAME/DATABASE?sslmode=require
```

**Check:**
- ✅ Starts with `postgresql://`
- ✅ Has a username (before first `:`)
- ✅ Has a password (between `:` and `@`)
- ✅ Has a hostname (between `@` and `/`)
- ✅ Has a database name (after `/` before `?`)
- ✅ Has `?sslmode=require` at the end

---

## 🆘 Still Getting Errors?

### Error: "ENOTFOUND base"
**Solution:** Your DATABASE_URL is not set correctly. Follow Step 1 and 2 again carefully.

### Error: "connection refused"
**Solution:** 
- Check if your database is active in Railway/Neon
- Verify the URL is exactly as shown in Railway
- Make sure there are no extra spaces or quotes

### Error: "password authentication failed"
**Solution:**
- Copy the DATABASE_URL again from Railway
- The password might have changed
- Make sure you copied the entire URL including password

### Error: "database does not exist"
**Solution:**
- Your database hasn't been created in Neon/Railway
- Go to Neon.tech and create a database
- Use that connection string

---

## ✅ Success Looks Like This:

```bash
npm run db:push:prod

> charislooks-beauty@1.0.0 db:push:prod
> NODE_ENV=production drizzle-kit push

No config path provided, using default 'drizzle.config.ts'
Reading config file '/Users/boris/projects/charislooks-beauty/drizzle.config.ts'
Using 'pg' driver for database querying
[✓] Pulling schema from database...
[✓] Applying changes...
[✓] Everything is up to date

✅ Done!
```

After this succeeds:
1. ✅ All database tables are created
2. ✅ Your app on Railway will work
3. ✅ Admin login will work
4. ✅ You can start adding content!

---

## 📸 Visual Guide

**Where to find DATABASE_URL in Railway:**

```
Railway Dashboard
  └─ Your Project (charislooks-beauty)
      └─ Variables tab (left sidebar)
          └─ DATABASE_URL: postgresql://... [Copy button]
```

**What to do:**
1. Click the copy button next to DATABASE_URL
2. Paste it into your `.env` file
3. Run `npm run db:push:prod`
4. Delete `.env` file after success

---

## 🎯 Quick Checklist

- [ ] Got DATABASE_URL from Railway Variables tab
- [ ] Copied the FULL URL (starts with postgresql://)
- [ ] Created `.env` file with real DATABASE_URL
- [ ] Added `NODE_ENV=production` to `.env`
- [ ] Ran `npm run db:push:prod`
- [ ] Saw success message
- [ ] Deleted `.env` file (or removed DATABASE_URL line)
- [ ] Tested admin login at your Railway URL

---

**Need more help?** Double-check you copied the complete DATABASE_URL from Railway's Variables tab!

