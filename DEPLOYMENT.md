# 🚀 Railway Deployment Guide

Complete guide to deploy your Bible Learning App to Railway with automatic cron job.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:
- ✅ Git repository (we'll initialize this)
- ✅ Railway account (sign up at railway.app)
- ✅ All your API keys ready:
  - Supabase URL & Keys
  - OpenAI API Key
  - YouTube API Key

---

## Step 1: Initialize Git Repository

Run these commands in your project folder:

```bash
cd "/Users/volpe/New Bible Learning App"

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - Bible Learning App"
```

---

## Step 2: Create GitHub Repository

### Option A: Using GitHub Desktop (Easiest)
1. Open GitHub Desktop
2. Add this repository
3. Publish to GitHub

### Option B: Using Command Line
```bash
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/bible-learning-app.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Railway

### 3.1 Connect Railway to GitHub

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `bible-learning-app` repository
6. Railway will automatically detect it's a Next.js app

### 3.2 Configure Environment Variables

In Railway dashboard, go to your project → **Variables** tab.

Add ALL these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# YouTube
YOUTUBE_API_KEY=your-youtube-api-key-here
YOUTUBE_CHANNEL_ID=your-youtube-channel-id-here

# App URL (Railway will auto-set this, but you can override)
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Cron Secret (generate a secure one)
CRON_SECRET=GENERATE_A_SECURE_RANDOM_STRING_HERE

# Node Environment
NODE_ENV=production
```

### 3.3 Generate Secure CRON_SECRET

Run this on your local machine:
```bash
openssl rand -hex 32
```

Copy the output and use it as your `CRON_SECRET` in Railway.

### 3.4 Deploy

Railway will automatically:
- ✅ Build your Next.js app
- ✅ Deploy it
- ✅ Give you a public URL like `your-app.up.railway.app`

Wait 2-3 minutes for the build to complete.

---

## Step 4: Set Up Cron Job

### 4.1 Add Cron Service in Railway

1. In your Railway project, click **"New"** → **"Empty Service"**
2. Name it: `Auto Process Cron`
3. Go to **Settings** tab
4. Under **Cron Schedule**, enter: `0 * * * *`
   - This means: "Run at minute 0 of every hour"

### 4.2 Add Cron Command

In the same service settings, under **Cron Command**, add:

```bash
curl -X GET https://your-app.up.railway.app/api/cron/auto-process -H "Authorization: Bearer $CRON_SECRET"
```

**Replace `your-app.up.railway.app` with your actual Railway URL!**

### 4.3 Add Environment Variables to Cron Service

The cron service needs access to your `CRON_SECRET`:

1. In the cron service, go to **Variables**
2. Click **Reference** → Select your main app
3. Select `CRON_SECRET`

Or manually add:
```env
CRON_SECRET=your-secure-secret-here
```

### 4.4 Enable Cron Service

Make sure the cron service is **started** (not sleeping).

---

## Step 5: Verify Deployment

### 5.1 Test Your App

Visit your Railway URL: `https://your-app.up.railway.app`

You should see:
- ✅ Landing page loads
- ✅ Can sign up/login
- ✅ Lessons page shows your lessons
- ✅ Can complete lessons
- ✅ Dashboard shows stats

### 5.2 Test Cron Job Manually

Visit (in your browser or curl):
```
https://your-app.up.railway.app/api/cron/auto-process
```

You should see JSON response with:
```json
{
  "success": true,
  "newVideosFound": 0,
  "lessonsCreated": 0,
  ...
}
```

### 5.3 Check Cron Logs

In Railway:
1. Click on your Cron service
2. Go to **Logs** tab
3. Wait until the next hour mark (e.g., 2:00 PM, 3:00 PM)
4. You should see the cron execute

Look for lines with:
- 🤖 Auto-process cron job started
- 📺 New videos: X
- 📚 Lessons created: X

---

## Step 6: Update Supabase URLs (Optional)

If you want users to redirect back to your Railway URL after authentication:

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your Railway URL to **Redirect URLs**:
   ```
   https://your-app.up.railway.app/auth/callback
   ```

---

## 🎛️ Cron Schedule Options

Change the cron schedule in Railway as needed:

| Schedule | Meaning |
|----------|---------|
| `0 * * * *` | Every hour at :00 |
| `*/30 * * * *` | Every 30 minutes |
| `0 */2 * * *` | Every 2 hours |
| `0 9,21 * * *` | 9 AM and 9 PM daily |
| `0 0 * * *` | Once a day at midnight |

---

## 🔍 Monitoring

### Check Cron Execution

**Railway Dashboard:**
- Go to Cron service → Logs
- Look for successful runs every hour

**Application Logs:**
- Go to your main app → Logs
- Filter for "Auto-process" to see what's happening

### Verify New Lessons

Check your app:
```
https://your-app.up.railway.app/lessons
```

New lessons should appear automatically!

---

## 🐛 Troubleshooting

### Cron Not Running

**Check:**
- Cron service is **not sleeping** (keep it awake)
- `CRON_SECRET` matches in both services
- URL in cron command is correct
- Schedule syntax is correct

**Test manually:**
```bash
curl https://your-app.up.railway.app/api/cron/auto-process \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Build Failures

**Common issues:**
- Missing environment variables
- Check Railway build logs
- Ensure all dependencies are in `package.json`

### Database Connection Issues

**Check:**
- Supabase keys are correct
- RLS policies are set (we did this!)
- Supabase project is not paused

---

## 💰 Railway Costs

**Starter Plan ($5/month):**
- Includes $5 credit
- Usually sufficient for:
  - Web app (always running)
  - Cron job (runs hourly)
  - Database queries
  - Normal traffic

**Additional costs:**
- OpenAI API: ~$3-10/month (depending on video frequency)
- YouTube API: Free (within limits)

**Total estimated:** ~$8-15/month

---

## 🔄 Updating Your App

When you make changes:

```bash
# Commit changes
git add .
git commit -m "Description of changes"
git push origin main
```

Railway will **automatically redeploy**! 🎉

---

## ✅ Deployment Checklist

- [ ] Git repository initialized
- [ ] Pushed to GitHub
- [ ] Railway project created
- [ ] All environment variables added
- [ ] App deployed successfully
- [ ] Can visit app URL and it works
- [ ] Cron service created
- [ ] Cron schedule configured (0 * * * *)
- [ ] Cron command added with correct URL
- [ ] CRON_SECRET added to cron service
- [ ] Tested cron manually
- [ ] Verified cron runs at next hour mark
- [ ] Supabase redirect URLs updated

---

## 🎉 You're Live!

Your Bible Learning App is now:
- ✅ Deployed to production
- ✅ Accessible to anyone with the URL
- ✅ Automatically creating lessons from new sermons every hour
- ✅ Saving user progress
- ✅ Tracking streaks and XP

**Share your app:** `https://your-app.up.railway.app` 🚀

---

## 📞 Need Help?

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Check your deployment logs in Railway dashboard
