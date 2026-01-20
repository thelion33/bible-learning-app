-- Fix RLS policies for videos table to allow API to insert videos

-- Drop existing policies
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;

-- Recreate policies with proper permissions
CREATE POLICY "Videos are viewable by everyone"
  ON videos FOR SELECT
  USING (true);

-- Allow service role to insert videos (for the cron job)
CREATE POLICY "Service role can insert videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update videos"
  ON videos FOR UPDATE
  USING (true);

-- Allow authenticated users to also insert (for testing)
CREATE POLICY "Authenticated users can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (true);
