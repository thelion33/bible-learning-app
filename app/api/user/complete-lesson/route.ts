/**
 * API Route: Mark lesson as complete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId, score, totalXpEarned } = await request.json()

    console.log('🏁 Complete Lesson API called:', { userId, lessonId, score, totalXpEarned })

    if (!userId || !lessonId || score === undefined || totalXpEarned === undefined) {
      console.error('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already completed
    console.log('🔍 Checking for existing completion...')
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('lesson_completions')
      .select('id, score')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('❌ Error checking existing:', existingError)
    }

    if (existing) {
      console.log('📝 Lesson already completed, checking if score improved...')
      // Update if new score is better
      if (score > existing.score) {
        console.log(`✅ Better score! Updating ${existing.score} → ${score}`)
        const { error: updateError } = await supabaseAdmin
          .from('lesson_completions')
          .update({ 
            score, 
            total_xp_earned: totalXpEarned,
            completed_at: new Date().toISOString() 
          })
          .eq('id', existing.id)
        
        if (updateError) {
          console.error('❌ Error updating completion:', updateError)
          throw updateError
        }
      } else {
        console.log('ℹ️ Score not better, keeping existing')
      }
    } else {
      // Create new completion record
      console.log('🆕 Creating new completion record...')
      const { error: insertError } = await supabaseAdmin
        .from('lesson_completions')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          score,
          total_xp_earned: totalXpEarned,
        })

      if (insertError) {
        console.error('❌ Error inserting completion:', insertError)
        throw insertError
      }
      console.log('✅ Completion record created!')

      // Increment lessons_completed count
      console.log('📊 Updating user stats...')
      const { data: stats, error: statsError } = await supabaseAdmin
        .from('user_stats')
        .select('lessons_completed')
        .eq('user_id', userId)
        .single()

      if (statsError) {
        console.error('❌ Error fetching stats:', statsError)
      }

      if (stats) {
        const { error: updateStatsError } = await supabaseAdmin
          .from('user_stats')
          .update({ 
            lessons_completed: (stats.lessons_completed || 0) + 1 
          })
          .eq('user_id', userId)
        
        if (updateStatsError) {
          console.error('❌ Error updating stats:', updateStatsError)
        } else {
          console.log('✅ Stats updated! lessons_completed:', (stats.lessons_completed || 0) + 1)
        }
      }
    }

    // Update streak
    console.log('🔥 Updating streak...')
    await updateStreak(userId)
    console.log('✅ Streak updated!')

    console.log('🎉 Lesson completion successful!')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error completing lesson:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete lesson',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function updateStreak(userId: string) {
  const { data: stats } = await supabaseAdmin
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!stats) return

  const today = new Date().toISOString().split('T')[0]
  const lastActivity = stats.last_activity_date

  let newStreak = stats.current_streak || 0

  if (!lastActivity) {
    newStreak = 1
  } else {
    const daysSinceLastActivity = Math.floor(
      (new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastActivity === 0) {
      // Same day, keep streak
      newStreak = stats.current_streak || 1
    } else if (daysSinceLastActivity === 1) {
      // Next day, increment streak
      newStreak = (stats.current_streak || 0) + 1
    } else if (daysSinceLastActivity > 1) {
      // Broke streak, reset to 1
      newStreak = 1
    }
  }

  await supabaseAdmin
    .from('user_stats')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, stats.longest_streak || 0),
      last_activity_date: today,
    })
    .eq('user_id', userId)
}
