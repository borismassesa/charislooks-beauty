# 🚀 Deployment Guide - CharisLooks Beauty

This guide covers deploying your beauty salon application to production.

## 📋 Pre-Deployment Checklist

- [ ] Production build tested locally
- [ ] Environment variables prepared
- [ ] Database connection configured and tested
- [ ] Admin credentials changed from defaults
- [ ] All features tested in development

## 🔑 Required Environment Variables

Create a `.env` file (or set in your hosting platform) with these variables:

```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# Session Security
SESSION_SECRET=your_secure_random_string_here

# Environment
NODE_ENV=production
PORT=3000

# Domains (update with your actual domain)
DOMAIN=yourdomain.com
WWW_DOMAIN=www.yourdomain.com
```

**Important Security Notes:**
- Generate a strong random string for `SESSION_SECRET`
- Never commit `.env` file to version control
- Change default admin credentials after first deployment

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easiest)

Railway offers the simplest deployment experience with automatic builds and SSL.

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

#### Step 2: Deploy
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway auto-detects Node.js and deploys

#### Step 3: Configure Environment Variables
In Railway dashboard → Variables tab, add:
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `DOMAIN` and `WWW_DOMAIN`

#### Step 4: Configure Custom Domain
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Benefits:**
✅ Simple setup - just connect and deploy
✅ Automatic SSL certificates
✅ Auto-deploy on GitHub push
✅ Free tier available

---

### Option 2: Vercel (Great for Serverless)

Vercel is excellent for static sites and serverless functions.

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login and Deploy
```bash
vercel login
npm run deploy
```

#### Step 3: Set Environment Variables
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add all required environment variables

#### Step 4: Configure Custom Domain
1. Go to Settings → Domains
2. Add your domain
3. Configure DNS with provided instructions

**DNS Configuration for Vercel:**
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Option 3: DigitalOcean App Platform

Full-featured platform with flexible pricing.

#### Step 1: Create App
1. Go to DigitalOcean App Platform
2. Create new app from GitHub
3. Select your repository

#### Step 2: Configure Build
- **Build Command:** `npm run build:prod`
- **Run Command:** `npm run start:prod`
- **Source Directory:** `/`

#### Step 3: Set Environment Variables
Add all environment variables in the dashboard.

---

## 🧪 Local Production Testing

Before deploying, test the production build locally:

```bash
# Build for production
npm run build:prod

# Start production server
npm run start:prod

# Test at http://localhost:3000
```

Verify:
- ✅ All pages load correctly
- ✅ Admin login works
- ✅ Database operations succeed
- ✅ Contact form submits
- ✅ Portfolio displays properly

## 🔒 Security Checklist

- [ ] HTTPS enforced in production
- [ ] Secure session cookies enabled
- [ ] CORS properly configured for your domain
- [ ] Environment variables secured
- [ ] Database connection uses SSL
- [ ] Default admin password changed
- [ ] SESSION_SECRET is strong and unique

## 🚨 Post-Deployment Steps

### 1. Test Your Domain
```bash
# Test both protocols
curl -I https://yourdomain.com
curl -I https://www.yourdomain.com
```

### 2. Verify Functionality
- [ ] Homepage loads
- [ ] Portfolio page works
- [ ] Services page displays
- [ ] Contact form submits successfully
- [ ] Admin panel is accessible
- [ ] Admin login works
- [ ] All CRUD operations function

### 3. Update Admin Account
- Change default admin username/password
- Test login with new credentials
- Verify admin panel access

### 4. Monitor Performance
- Check response times
- Monitor error logs (check platform dashboard)
- Test all features thoroughly

## 🔧 Troubleshooting

### Common Issues

**App Not Loading:**
- Check environment variables are set correctly
- Verify database connection string
- Check platform logs for errors
- Ensure build completed successfully

**Database Connection Errors:**
- Verify DATABASE_URL format
- Check database allows external connections
- Ensure SSL mode is configured
- Test connection string locally first

**CORS Errors:**
- Verify DOMAIN and WWW_DOMAIN variables
- Check CORS configuration in server code
- Ensure HTTPS is working
- Clear browser cache

**SSL Certificate Issues:**
- Wait 24-48 hours for DNS propagation
- Check domain configuration in platform
- Verify DNS records are correct
- Use `nslookup yourdomain.com` to check

**Session/Login Issues:**
- Verify SESSION_SECRET is set
- Check cookie settings (secure flag for HTTPS)
- Clear browser cookies
- Check session configuration in code

## 📊 Database Setup

Your app uses PostgreSQL. If you haven't set up a database:

### Option 1: Neon (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use as DATABASE_URL

### Option 2: Railway Database
Railway can provision a PostgreSQL database automatically.

### Option 3: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from settings

## 🎯 Build Scripts Reference

```json
{
  "dev": "Development server with hot reload",
  "build": "Production build",
  "build:prod": "Production build with optimizations",
  "start": "Start production server",
  "start:prod": "Start production server with NODE_ENV=production",
  "deploy": "Build and deploy to Vercel",
  "deploy:railway": "Build and deploy to Railway"
}
```

## 📞 Getting Help

If you encounter issues:
1. Check platform-specific logs and documentation
2. Verify all environment variables are set
3. Test database connection
4. Check DNS configuration
5. Review troubleshooting section above

---

## 🎉 You're Ready to Deploy!

Choose your preferred platform above and follow the steps. Your CharisLooks Beauty application will be live in minutes!

**Recommended for beginners:** Start with Railway for the simplest deployment experience.

