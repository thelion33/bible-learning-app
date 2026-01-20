/**
 * API Route: Record user progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, questionId, isCorrect, xpEarned } = await request.json()

    if (!userId || !lessonId || !questionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if attempt already exists
    const { data: existing } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single()

    if (existing) {
      // Update existing record
      await supabaseAdmin
        .from('user_progress')
        .update({
          is_correct: isCorrect,
          attempts: existing.attempts + 1,
          completed_at: isCorrect ? new Date().toISOString() : existing.completed_at,
        })
        .eq('id', existing.id)
    } else {
      // Create new record
      await supabaseAdmin
        .from('user_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          question_id: questionId,
          is_correct: isCorrect,
          attempts: 1,
          completed_at: isCorrect ? new Date().toISOString() : null,
        })
    }

    // Update XP and stats if correct
    if (isCorrect && xpEarned > 0) {
      const { data: stats } = await supabaseAdmin
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (stats) {
        await supabaseAdmin
          .from('user_stats')
          .update({
            total_xp: stats.total_xp + xpEarned,
            questions_answered: stats.questions_answered + 1,
            last_activity_date: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', userId)
      } else {
        // Create stats if they don't exist
        await supabaseAdmin
          .from('user_stats')
          .insert({
            user_id: userId,
            total_xp: xpEarned,
            questions_answered: 1,
            current_streak: 1,
            longest_streak: 1,
            lessons_completed: 0,
            last_activity_date: new Date().toISOString().split('T')[0],
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording progress:', error)
    return NextResponse.json(
      { error: 'Failed to record progress' },
      { status: 500 }
    )
  }
}
