/**
 * Test endpoint to verify email notifications are working
 */

import { NextResponse } from 'next/server'
import { sendNewLessonEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get the first registered user
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError || !users || users.users.length === 0) {
      return NextResponse.json({ 
        error: 'No registered users found to send test email to' 
      }, { status: 404 })
    }

    const testEmail = users.users[0].email
    if (!testEmail) {
      return NextResponse.json({ 
        error: 'User has no email address' 
      }, { status: 404 })
    }

    // Get the most recent lesson
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select(`
        *,
        video:videos (
          youtube_id,
          title,
          published_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json({ 
        error: 'No lessons found in database' 
      }, { status: 404 })
    }

    // Send test email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bible-learning-app-production.up.railway.app'
    
    const result = await sendNewLessonEmail(testEmail, {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      summary: lesson.summary,
      videoTitle: lesson.video?.title || 'Test Video',
      publishedAt: lesson.video?.published_at || new Date().toISOString(),
      appUrl,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        sentTo: testEmail,
        lessonTitle: lesson.title,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        sentTo: testEmail,
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
