# Setup Instructions

Follow these steps to get your development environment running.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Environment File

Create a `.env.local` file in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Get Your API Keys

### Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings > API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API keys
3. Create a new secret key → `OPENAI_API_KEY`
4. Make sure you have billing set up

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key → `YOUTUBE_API_KEY`

### Revival Today Church Channel ID
You'll need to get the channel ID for Revival Today Church.

**Method 1: Browser**
1. Go to https://www.youtube.com/@revivaltodaychurch/streams
2. View page source (Ctrl/Cmd + U)
3. Search for "channelId" - you'll find something like `UC...`

**Method 2: Using YouTube API**
```bash
curl "https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=revivaltodaychurch&key=YOUR_API_KEY"
```

## Step 4: Set Up Database Schema

Coming in the next step - we'll create the Supabase tables.

## Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Troubleshooting

- **"Module not found" errors**: Run `npm install` again
- **Supabase connection errors**: Double-check your `.env.local` file
- **API key errors**: Make sure all API keys are valid and have proper permissions

## Next Steps

After setup, we'll:
1. Create the database schema in Supabase
2. Test the YouTube API integration
3. Set up OpenAI content generation
4. Build the learning interface
