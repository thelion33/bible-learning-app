# Revival Today Prosperity Academy App

A gamified Bible learning platform that automatically converts church messages from YouTube into engaging, Duolingo-style learning experiences.

## 🎯 Core Features

- **Auto-Sync YouTube Videos**: Hourly scanning of Revival Today Church's live stream repository
- **AI Content Generation**: OpenAI-powered summaries, key themes, and custom quiz questions
- **Gamified Learning**: Multiple question types (multiple choice, fill-in-blank, scripture matching, true/false)
- **Progress Tracking**: User authentication, XP system, streaks, and lesson progression
- **Mobile-First Design**: Responsive UI optimized for all devices

## 🛠 Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **AI Processing**: OpenAI API (GPT-4)
- **Video Source**: YouTube Data API v3
- **Deployment**: Railway
- **Version Control**: Git

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- YouTube Data API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

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

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the database migrations (coming in next step)

### 4. Get API Keys

**YouTube API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API key)

**OpenAI API:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add billing information

**Revival Today Church Channel ID:**
- Channel: https://www.youtube.com/@revivaltodaychurch/streams
- You can extract the channel ID using the YouTube API or browser tools

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/app                    # Next.js App Router
  /api                  # API routes
  /auth                 # Authentication pages
  /learn                # Learning interface
  /dashboard            # User dashboard
  layout.tsx            # Root layout
  page.tsx              # Landing page
  globals.css           # Global styles

/components             # Reusable UI components
  /ui                   # shadcn/ui components
  /questions            # Question type components
  /lesson               # Lesson components

/lib                    # Utility functions
  supabase.ts           # Supabase client
  openai.ts             # OpenAI client
  youtube.ts            # YouTube API client
  utils.ts              # Helper functions

/scripts                # Automation scripts
  fetch-youtube-videos.ts  # Cron job for video scanning

/types                  # TypeScript type definitions
  index.ts              # Shared types
```

## 🗄 Database Schema (Coming Next)

Tables to be created:
- `videos` - YouTube video metadata
- `lessons` - Processed message content
- `questions` - Quiz questions
- `users` - User accounts (Supabase Auth)
- `user_progress` - Individual question attempts
- `user_stats` - Aggregated user statistics

## 🔄 Development Roadmap

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Project scaffolding
- [x] Database schema setup
- [x] Environment configuration
- [x] YouTube API integration
- [x] OpenAI content generation
- [x] API routes (fetch videos, process content)

### 📝 Phase 2: Learning Experience (NEXT)
- [ ] User authentication pages (sign up, login)
- [ ] Lessons dashboard
- [ ] Question components (all 4 types)
- [ ] Progress tracking UI
- [ ] XP & streak system

### 🎮 Phase 3: Gamification
- [ ] Daily goals & challenges
- [ ] Achievement badges
- [ ] Leaderboards
- [ ] Social features

### 🚀 Phase 4: Deployment
- [ ] Railway configuration
- [ ] Production environment setup
- [ ] Automated cron jobs
- [ ] Monitoring & logging

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Build for production
npm run start            # Start production server

# Utilities
npm run lint             # Run ESLint
npm run cron:youtube     # Manually run YouTube video fetch
```

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the development team.

## 📄 License

Private - All Rights Reserved

---

**Target Channel**: [Revival Today Church](https://www.youtube.com/@revivaltodaychurch/streams)
