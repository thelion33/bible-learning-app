-- Remove the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS create_user_stats();

-- Add RLS policy to allow users to create their own stats
CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also allow the service role to insert (for migrations/admin)
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
