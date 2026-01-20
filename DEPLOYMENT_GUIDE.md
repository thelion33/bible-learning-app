# Deployment & Testing Guide

## 📋 Pre-Flight Checklist

Before running the app, ensure you have:

- ✅ `.env.local` file created with all API keys
- ✅ `npm install` completed
- ✅ Supabase database schema created
- ✅ All API keys are valid

---

## 🗄️ Step 1: Set Up Database

### Run the Migration in Supabase

1. Go to your Supabase dashboard: https://scbasvzgetfhponuplrc.supabase.co
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Verify tables were created (you should see: videos, lessons, questions, user_progress, user_stats)

### Verify Tables

In the Supabase dashboard, go to **Table Editor** and confirm you see:
- `videos`
- `lessons`
- `questions`
- `user_progress`
- `user_stats`

---

## 🚀 Step 2: Install Dependencies & Run Dev Server

```bash
# Install all dependencies
npm install

# Run the development server
npm run dev
```

Visit **http://localhost:3000** - you should see the landing page!

---

## 🧪 Step 3: Test the Pipeline

### 3.1 Fetch Videos from YouTube

Test the video fetching API:

```bash
# Method 1: Using curl
curl http://localhost:3000/api/cron/fetch-videos

# Method 2: Open in browser
# Visit: http://localhost:3000/api/cron/fetch-videos
```

**Expected Response:**
```json
{
  "success": true,
  "newVideos": 5,
  "existingVideos": 0,
  "details": {
    "new": ["Video Title 1", "Video Title 2", ...],
    "existing": []
  }
}
```

### 3.2 Verify Videos in Database

Go to Supabase → Table Editor → `videos` table. You should see the fetched videos!

### 3.3 Process a Video with OpenAI

**Important:** This will use OpenAI credits (~$0.02-0.10 per video)

Get a video ID from the `videos` table in Supabase, then:

```bash
curl -X POST http://localhost:3000/api/process-video \
  -H "Content-Type: application/json" \
  -d '{"videoId": "YOUR_VIDEO_ID_HERE"}'
```

**Expected Response:**
```json
{
  "success": true,
  "lesson": {
    "id": "uuid-here",
    "title": "Sermon Title",
    "questionsCount": 9
  }
}
```

### 3.4 Verify Generated Content

In Supabase Table Editor, check:
- `lessons` table → Should have 1 lesson with summary and themes
- `questions` table → Should have ~9 questions (various types)

### 3.5 Fetch Lessons via API

```bash
curl http://localhost:3000/api/lessons
```

You should see the processed lesson!

---

## ⚙️ Step 4: Set Up Automated Cron Job (Railway)

### Option A: Railway Cron (Recommended)

1. Deploy to Railway
2. Add a Cron Job service
3. Set schedule: `0 * * * *` (every hour)
4. Set command: `curl https://your-app.railway.app/api/cron/fetch-videos`

### Option B: Manual Script

Run the fetch script manually:

```bash
npm run cron:youtube
```

---

## 🔒 Step 5: Set Up Authentication (Supabase)

### Enable Email Auth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional)

### Test User Signup

We'll create auth pages in the next step, but you can test via Supabase:

1. Dashboard → Authentication → Users
2. Click "Add User"
3. Create a test user

---

## 🧪 Testing Checklist

- [ ] Dev server runs successfully (`npm run dev`)
- [ ] Landing page loads at localhost:3000
- [ ] Database schema created in Supabase
- [ ] Video fetch API works
- [ ] At least 1 video in database
- [ ] Video processing with OpenAI works
- [ ] Lesson and questions created
- [ ] Lessons API returns data

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### API key errors
- Double-check `.env.local` has all keys
- Restart dev server after changing env vars

### Supabase connection errors
- Verify URL and keys in `.env.local`
- Check Supabase project is active

### YouTube API quota exceeded
- Free tier: 10,000 units/day
- Each search costs ~100 units
- Solution: Reduce fetch frequency or upgrade

### OpenAI errors
- Check you have billing set up
- Verify API key is valid
- Check usage limits at platform.openai.com

---

## 📊 Next Steps

After testing the pipeline, we'll build:
1. **Authentication pages** (sign up, login)
2. **Lessons dashboard** (view all lessons)
3. **Learning interface** (Duolingo-style question UI)
4. **Progress tracking** (XP, streaks, completion)
5. **User dashboard** (stats, achievements)

---

## 🚢 Production Deployment (Railway)

Coming soon - we'll deploy the full app to Railway with:
- Automatic video fetching (hourly cron)
- Production database
- Environment variables
- Custom domain (optional)
