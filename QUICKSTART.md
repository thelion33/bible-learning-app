# ⚡ Quick Start Guide

Get your Bible Learning App running in 5 minutes!

## Step 1: Create `.env.local`

Create a file named `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://scbasvzgetfhponuplrc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rseDnFrqMaB6P5kZ6uEchQ_35j0cDoI
SUPABASE_SERVICE_ROLE_KEY=sb_secret_3TZPcX4S8JSIKAzJ8Bxrtg_YX6bGHTL

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE

# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSyAf8KFT1LO9YOPleEcV05V0iqj1MQom-b4
YOUTUBE_CHANNEL_ID=UC3NVnOTlGccCLaVjng7_FWA

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Database

1. Go to: https://scbasvzgetfhponuplrc.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Copy **all content** from `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click **Run** button
6. Verify success ✅

## Step 4: Run the App

```bash
npm run dev
```

Visit: **http://localhost:3000**

## Step 5: Test Video Fetching

Open in your browser:
```
http://localhost:3000/api/cron/fetch-videos
```

Check Supabase Table Editor → `videos` table to see imported videos!

## Step 6: Process Your First Video

1. Get a video ID from the `videos` table in Supabase
2. Run this command (replace `VIDEO_ID_HERE`):

```bash
curl -X POST http://localhost:3000/api/process-video \
  -H "Content-Type: application/json" \
  -d '{"videoId":"VIDEO_ID_HERE"}'
```

3. Check `lessons` and `questions` tables in Supabase to see AI-generated content!

---

## 🎉 You're Ready!

The core pipeline is working:
- ✅ YouTube video fetching
- ✅ OpenAI content generation
- ✅ Database storage
- ✅ API endpoints

**Next:** We'll build the user-facing learning interface with authentication!

---

## 🆘 Need Help?

Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting and testing instructions.
