/**
 * Database helper functions for Supabase operations
 */

import { supabase } from './supabase'
import type { Video, Lesson, Question, UserProgress, UserStats } from '@/types'

// ============================================================================
// VIDEOS
// ============================================================================

export async function getVideos(limit = 10) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Video[]
}

export async function getVideoByYouTubeId(youtubeId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('youtube_id', youtubeId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data as Video | null
}

export async function createVideo(video: Partial<Video>) {
  const { data, error } = await supabase
    .from('videos')
    .insert(video)
    .select()
    .single()

  if (error) throw error
  return data as Video
}

export async function markVideoAsProcessed(videoId: string) {
  const { error } = await supabase
    .from('videos')
    .update({ processed: true })
    .eq('id', videoId)

  if (error) throw error
}

// ============================================================================
// LESSONS
// ============================================================================

export async function getPublishedLessons() {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as Lesson[]
}

export async function getLessonById(lessonId: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error) throw error
  return data as Lesson
}

export async function createLesson(lesson: Partial<Lesson>) {
  const { data, error } = await supabase
    .from('lessons')
    .insert(lesson)
    .select()
    .single()

  if (error) throw error
  return data as Lesson
}

// ============================================================================
// QUESTIONS
// ============================================================================

export async function getQuestionsByLessonId(lessonId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as Question[]
}

export async function createQuestion(question: Partial<Question>) {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single()

  if (error) throw error
  return data as Question
}

export async function createMultipleQuestions(questions: Partial<Question>[]) {
  const { data, error } = await supabase
    .from('questions')
    .insert(questions)
    .select()

  if (error) throw error
  return data as Question[]
}

// ============================================================================
// USER PROGRESS
// ============================================================================

export async function getUserProgress(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)

  if (error) throw error
  return data as UserProgress[]
}

export async function recordQuestionAttempt(
  userId: string,
  lessonId: string,
  questionId: string,
  isCorrect: boolean
) {
  // Check if attempt already exists
  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single()

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        is_correct: isCorrect,
        attempts: existing.attempts + 1,
        completed_at: isCorrect ? new Date().toISOString() : existing.completed_at,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data as UserProgress
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        question_id: questionId,
        is_correct: isCorrect,
        attempts: 1,
        completed_at: isCorrect ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error
    return data as UserProgress
  }
}

// ============================================================================
// USER STATS
// ============================================================================

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  
  // If no stats exist, create them
  if (!data) {
    const { data: newStats, error: createError } = await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        lessons_completed: 0,
        questions_answered: 0,
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating user stats:', createError)
      return null
    }
    return newStats as UserStats
  }
  
  return data as UserStats
}

export async function updateUserXP(userId: string, xpToAdd: number) {
  const stats = await getUserStats(userId)
  
  if (!stats) {
    throw new Error('User stats not found')
  }

  const { data, error } = await supabase
    .from('user_stats')
    .update({
      total_xp: stats.total_xp + xpToAdd,
      questions_answered: stats.questions_answered + 1,
      last_activity_date: new Date().toISOString().split('T')[0],
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserStats
}

export async function updateStreak(userId: string) {
  const stats = await getUserStats(userId)
  
  if (!stats) {
    throw new Error('User stats not found')
  }

  const today = new Date().toISOString().split('T')[0]
  const lastActivity = stats.last_activity_date

  let newStreak = stats.current_streak

  if (!lastActivity) {
    newStreak = 1
  } else {
    const daysSinceLastActivity = Math.floor(
      (new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastActivity === 1) {
      newStreak = stats.current_streak + 1
    } else if (daysSinceLastActivity > 1) {
      newStreak = 1
    }
  }

  const { data, error } = await supabase
    .from('user_stats')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, stats.longest_streak),
      last_activity_date: today,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserStats
}
