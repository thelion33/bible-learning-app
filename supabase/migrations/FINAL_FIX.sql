-- ============================================================================
-- COMPREHENSIVE FIX: Remove all RLS issues and allow service role full access
-- ============================================================================

-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on user_stats
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'user_stats' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_stats';
    END LOOP;
    
    -- Drop all policies on user_progress
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'user_progress' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_progress';
    END LOOP;
    
    -- Drop all policies on lesson_completions
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'lesson_completions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.lesson_completions';
    END LOOP;
END $$;

-- Create lesson_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER NOT NULL,
  total_xp_earned INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);

-- Enable RLS on all tables
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_STATS Policies
-- ============================================================================

-- Allow service_role to do EVERYTHING (this is the key!)
CREATE POLICY "service_role_all_user_stats" ON user_stats
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own stats
CREATE POLICY "users_select_own_stats" ON user_stats
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to update their own stats
CREATE POLICY "users_update_own_stats" ON user_stats
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert their own stats
CREATE POLICY "users_insert_own_stats" ON user_stats
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER_PROGRESS Policies
-- ============================================================================

-- Allow service_role to do EVERYTHING
CREATE POLICY "service_role_all_user_progress" ON user_progress
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own progress
CREATE POLICY "users_select_own_progress" ON user_progress
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own progress
CREATE POLICY "users_insert_own_progress" ON user_progress
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own progress
CREATE POLICY "users_update_own_progress" ON user_progress
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- LESSON_COMPLETIONS Policies
-- ============================================================================

-- Allow service_role to do EVERYTHING
CREATE POLICY "service_role_all_lesson_completions" ON lesson_completions
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own completions
CREATE POLICY "users_select_own_completions" ON lesson_completions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own completions
CREATE POLICY "users_insert_own_completions" ON lesson_completions
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own completions
CREATE POLICY "users_update_own_completions" ON lesson_completions
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Grant permissions to service_role
-- ============================================================================

GRANT ALL ON user_stats TO service_role;
GRANT ALL ON user_progress TO service_role;
GRANT ALL ON lesson_completions TO service_role;

-- ============================================================================
-- Verify policies were created
-- ============================================================================

SELECT 'user_stats policies:' as info, count(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'user_stats';

SELECT 'user_progress policies:' as info, count(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'user_progress';

SELECT 'lesson_completions policies:' as info, count(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'lesson_completions';
