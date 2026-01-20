-- Bible Learning App - Initial Database Schema
-- Run this in Supabase SQL Editor: https://scbasvzgetfhponuplrc.supabase.co

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- VIDEOS TABLE
-- Stores YouTube video metadata
-- ============================================================================
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- Duration in seconds
  transcript TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX idx_videos_processed ON videos(processed);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);

-- ============================================================================
-- LESSONS TABLE
-- Processed content from videos (AI-generated)
-- ============================================================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_themes TEXT[] DEFAULT '{}',
  scripture_references TEXT[] DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_video_id ON lessons(video_id);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_lessons_order ON lessons(order_index);

-- ============================================================================
-- QUESTIONS TABLE
-- Quiz questions for each lesson (all 4 types)
-- ============================================================================
CREATE TYPE question_type AS ENUM ('multiple_choice', 'fill_in_blank', 'scripture_match', 'true_false');

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB, -- For multiple choice/scripture match: ["option1", "option2", ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_value INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_order ON questions(order_index);

-- ============================================================================
-- USER_PROGRESS TABLE
-- Tracks individual question attempts
-- ============================================================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  attempts INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);
CREATE UNIQUE INDEX idx_user_progress_unique ON user_progress(user_id, question_id);

-- ============================================================================
-- USER_STATS TABLE
-- Aggregated user statistics (XP, streaks, etc.)
-- ============================================================================
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_total_xp ON user_stats(total_xp DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user_stats record when new user signs up
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Videos: Public read access
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

-- Lessons: Public read for published lessons
CREATE POLICY "Published lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (is_published = true);

-- Questions: Public read for published lessons
CREATE POLICY "Questions for published lessons are viewable by everyone"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = questions.lesson_id
      AND lessons.is_published = true
    )
  );

-- User Progress: Users can only view/modify their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- User Stats: Users can only view/modify their own stats
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- You can add seed data here later if needed

COMMENT ON TABLE videos IS 'YouTube video metadata from Revival Today Church';
COMMENT ON TABLE lessons IS 'AI-processed sermon content and learning materials';
COMMENT ON TABLE questions IS 'Gamified quiz questions (multiple choice, fill-in-blank, etc.)';
COMMENT ON TABLE user_progress IS 'Individual question attempt tracking';
COMMENT ON TABLE user_stats IS 'Aggregated user statistics, XP, and streaks';
