-- Fix RLS policies for lessons and questions tables

-- LESSONS TABLE
DROP POLICY IF EXISTS "Published lessons are viewable by everyone" ON lessons;

CREATE POLICY "Published lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (is_published = true);

CREATE POLICY "Service role can insert lessons"
  ON lessons FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update lessons"
  ON lessons FOR UPDATE
  USING (true);

-- QUESTIONS TABLE
DROP POLICY IF EXISTS "Questions for published lessons are viewable by everyone" ON questions;

CREATE POLICY "Questions for published lessons are viewable by everyone"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = questions.lesson_id
      AND lessons.is_published = true
    )
  );

CREATE POLICY "Service role can insert questions"
  ON questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update questions"
  ON questions FOR UPDATE
  USING (true);
