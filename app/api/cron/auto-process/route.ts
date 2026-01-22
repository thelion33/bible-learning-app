/**
 * API Route: Auto-fetch and process new videos
 * 
 * This should be called by a cron job every hour to:
 * 1. Fetch new YouTube videos from Revival Today Church
 * 2. Automatically process them into lessons with OpenAI
 */

import { NextResponse } from 'next/server'
import { fetchLatestStreams } from '@/lib/youtube'
import { generateLearningContent } from '@/lib/openai'
import { getVideoTranscript } from '@/lib/youtube'
import { createClient } from '@supabase/supabase-js'
import { sendBulkNewLessonEmails } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production'
    
    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 Auto-process cron job started...')
    console.log('📅 Current time:', new Date().toISOString())
    
    // Get the timestamp of the last check (stored in a simple way)
    const { data: lastCheck } = await supabaseAdmin
      .from('videos')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const cutoffTime = lastCheck?.created_at || new Date().toISOString()
    console.log('⏰ Only processing videos newer than:', cutoffTime)

    // Step 1: Fetch latest videos from YouTube
    console.log('🔍 Fetching latest videos from YouTube...')
    const videos = await fetchLatestStreams(10)
    
    const newVideos: Array<{ id: string; title: string }> = []
    const processedLessons: Array<{ title: string; questionsCount: number }> = []
    let totalEmailsSent = 0
    let totalEmailsFailed = 0

    for (const video of videos) {
      // Check if video already exists
      const { data: existing } = await supabaseAdmin
        .from('videos')
        .select('id, processed, published_at')
        .eq('youtube_id', video.id)
        .single()

      // Skip if video already exists
      if (existing) {
        console.log(`⏭️  Video already in database: ${video.title}`)
        continue
      }

      // Create new video record
      console.log(`✅ New video found: ${video.title}`)
      const { data: newVideo, error: insertError } = await supabaseAdmin
        .from('videos')
        .insert({
          youtube_id: video.id,
          title: video.title,
          description: video.description,
          published_at: video.publishedAt,
          thumbnail_url: video.thumbnailUrl,
          duration: video.duration,
          processed: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error(`❌ Error inserting video ${video.id}:`, insertError)
        continue
      }

      newVideos.push({ id: newVideo.id, title: video.title })

      // Step 2: Auto-process the new video into a lesson
      console.log(`🤖 Auto-processing: ${video.title}`)
      
      try {
        // Get transcript
        const transcript = await getVideoTranscript(video.id)
        
        // Update video with transcript
        await supabaseAdmin
          .from('videos')
          .update({ transcript })
          .eq('id', newVideo.id)

        // Generate content with OpenAI
        console.log('  🧠 Generating lesson content with AI...')
        const content = await generateLearningContent(
          transcript,
          video.title,
          video.description || ''
        )

        // Create lesson
        const { data: lesson, error: lessonError } = await supabaseAdmin
          .from('lessons')
          .insert({
            video_id: newVideo.id,
            title: content.lessonTitle || video.title, // Use AI-generated title, fallback to video title
            summary: content.summary,
            key_themes: content.keyThemes,
            scripture_references: content.scriptureReferences,
            is_published: true,
            order_index: 0,
          })
          .select()
          .single()

        if (lessonError) {
          throw new Error(`Failed to create lesson: ${lessonError.message}`)
        }

        // Create questions
        const questionsToCreate = content.questions.map((q, index) => ({
          lesson_id: lesson.id,
          type: q.type,
          question_text: q.questionText,
          options: q.options || null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          xp_value: q.xpValue,
          order_index: index,
        }))

        const { error: questionsError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToCreate)

        if (questionsError) {
          throw new Error(`Failed to create questions: ${questionsError.message}`)
        }

        // Mark video as processed
        await supabaseAdmin
          .from('videos')
          .update({ processed: true })
          .eq('id', newVideo.id)

        console.log(`  ✅ Lesson created: ${content.lessonTitle || video.title} (${content.questions.length} questions)`)
        processedLessons.push({
          title: content.lessonTitle || video.title,
          questionsCount: content.questions.length,
        })

        // Send email notifications to all users
        console.log(`  📧 Sending email notifications...`)
        try {
          const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
          
          if (usersError) {
            console.error('  ❌ Error fetching users for email:', usersError)
          } else if (users && users.users.length > 0) {
            const userEmails = users.users
              .map(u => u.email)
              .filter((email): email is string => !!email)

            if (userEmails.length > 0) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bible-learning-app-production.up.railway.app'
              
              const emailResult = await sendBulkNewLessonEmails(userEmails, {
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                summary: lesson.summary,
                videoTitle: video.title,
                publishedAt: video.publishedAt,
                appUrl,
              })

              totalEmailsSent += emailResult.sent
              totalEmailsFailed += emailResult.failed
              
              console.log(`  ✅ Sent ${emailResult.sent} emails, ${emailResult.failed} failed`)
            }
          }
        } catch (emailError: any) {
          console.error('  ❌ Error sending emails:', emailError)
        }

      } catch (processError) {
        console.error(`  ❌ Error processing video ${video.title}:`, processError)
        // Continue with next video even if this one fails
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      newVideosFound: newVideos.length,
      lessonsCreated: processedLessons.length,
      emailsSent: totalEmailsSent,
      emailsFailed: totalEmailsFailed,
      videos: newVideos,
      lessons: processedLessons,
    }

    console.log('🎉 Auto-process completed!')
    console.log(`  📺 New videos: ${newVideos.length}`)
    console.log(`  📚 Lessons created: ${processedLessons.length}`)
    console.log(`  📧 Emails sent: ${totalEmailsSent}, failed: ${totalEmailsFailed}`)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Auto-process error:', error)
    return NextResponse.json(
      {
        error: 'Failed to auto-process videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
