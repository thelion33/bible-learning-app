# Automatic Video Processing Setup

Your app now has automatic video processing! New YouTube live streams are fetched and converted into lessons automatically.

---

## 🤖 What It Does

Every hour, the system:
1. ✅ Checks Revival Today Church YouTube channel for new live streams
2. ✅ Downloads video metadata
3. ✅ Generates AI-powered lesson content (summary, themes, scripture references)
4. ✅ Creates 8+ quiz questions (all 4 types)
5. ✅ Publishes the lesson automatically

**Only processes videos created AFTER you set this up** - won't reprocess existing videos.

---

## 🧪 Local Testing (Development)

### Option 1: Manual Test

Run the auto-process once to test:

```bash
curl http://localhost:3000/api/cron/auto-process
```

Or visit in your browser: http://localhost:3000/api/cron/auto-process

### Option 2: Run Local Cron (Every Hour)

Start the local cron runner that checks every hour:

```bash
npm run cron:local
```

This will:
- Run immediately when you start it
- Then run again every hour automatically
- Show logs of what it's doing

**Keep this running in a separate terminal window while developing.**

---

## 🚀 Production Setup (Railway)

### Step 1: Deploy to Railway

1. Push your code to GitHub
2. Connect Railway to your GitHub repo
3. Railway will auto-deploy

### Step 2: Set Up Railway Cron

1. In Railway dashboard, click **"New"** → **"Cron Job"**
2. Configure:
   - **Schedule**: `0 * * * *` (every hour at minute 0)
   - **Command**: `curl -X GET $RAILWAY_PUBLIC_DOMAIN/api/cron/auto-process -H "Authorization: Bearer $CRON_SECRET"`
3. Add environment variable:
   - `CRON_SECRET`: A random secure string (e.g., `openssl rand -hex 32`)

### Step 3: Update Your .env

Add to your Railway environment variables:

```env
CRON_SECRET=your-secure-random-string-here
```

---

## 🔐 Security

The cron endpoint is protected:
- In **development**: Open to all (for easy testing)
- In **production**: Requires `CRON_SECRET` bearer token

Generate a secure secret:
```bash
openssl rand -hex 32
```

Add to Railway environment variables as `CRON_SECRET`.

---

## 📊 Monitoring

### Check Cron Logs

**Railway:**
- Go to Railway dashboard
- Click on your app
- View "Logs" tab
- Look for lines with 🤖, 🔍, ✅ emojis

**Local:**
```bash
# In terminal running cron:
npm run cron:local

# Or check server logs if running manually
```

### Verify It's Working

Check your database after an hour:
```sql
SELECT title, processed, created_at 
FROM videos 
ORDER BY created_at DESC 
LIMIT 5;
```

Or visit: http://localhost:3000/lessons

---

## 🎛️ Configuration

### Change Frequency

Edit Railway Cron schedule:
- `0 * * * *` - Every hour (recommended)
- `*/30 * * * *` - Every 30 minutes
- `0 */2 * * *` - Every 2 hours
- `0 9,21 * * *` - Twice daily (9 AM and 9 PM)

### Limit Videos Processed

Edit `app/api/cron/auto-process/route.ts`:

```typescript
const videos = await fetchLatestStreams(10) // Change 10 to your desired limit
```

---

## 🧪 Testing

### Test the Auto-Process Endpoint

```bash
# Fetch and process new videos once
curl http://localhost:3000/api/cron/auto-process
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2026-01-20T...",
  "newVideosFound": 2,
  "lessonsCreated": 2,
  "videos": [...],
  "lessons": [...]
}
```

### Simulate a New Video

To test without waiting for a real video:
1. Go to Supabase
2. Manually insert a test video in `videos` table with:
   - `processed: false`
   - Recent `published_at` date
3. Run the cron job
4. Check if it gets processed

---

## 💰 Cost Estimates

**OpenAI API costs per video:**
- ~$0.02 - $0.10 per video (depending on length)
- If 1 new video/day = ~$3/month
- If 3 new videos/week = ~$3/month

**YouTube API:**
- Free tier: 10,000 units/day
- Each check costs ~100 units
- 24 checks/day = 2,400 units (well within limits)

---

## 🐛 Troubleshooting

### Cron Not Running

**Check Railway logs:**
- Ensure CRON_SECRET is set
- Verify cron schedule syntax
- Check Railway service is running

**Check endpoint directly:**
```bash
curl http://localhost:3000/api/cron/auto-process
```

### Videos Not Being Processed

**Check logs for errors:**
- OpenAI API key valid?
- YouTube API key valid?
- Supabase permissions correct?

**Verify manually:**
```bash
# Test video fetch
curl http://localhost:3000/api/cron/fetch-videos

# Test video process
curl -X POST http://localhost:3000/api/process-video \
  -H "Content-Type: application/json" \
  -d '{"videoId":"VIDEO_ID_HERE"}'
```

### Too Many Videos Being Processed

The system is smart - it only processes:
- ✅ New videos (not already in database)
- ✅ Videos newer than last check
- ✅ Up to 10 videos per run (configurable)

Won't reprocess old videos!

---

## ✨ Summary

- **Local Development**: Run `npm run cron:local` in a separate terminal
- **Production**: Set up Railway Cron with schedule `0 * * * *`
- **Monitoring**: Check logs for 🤖 and ✅ emojis
- **Cost**: ~$3-10/month depending on video frequency

Your app will now automatically create lessons from new sermons! 🙏📖✨
