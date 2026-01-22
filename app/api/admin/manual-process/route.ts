/**
 * Manual trigger for processing videos
 * Use this to manually fetch and process new videos
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

export async function GET() {
  try {
    console.log('🤖 Manual video processing triggered...')
    console.log('📅 Current time:', new Date().toISOString())

    // Get the timestamp of when auto-processing was set up
    const { data: lastVideo } = await supabaseAdmin
      .from('videos')
      .select('published_at')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    const cutoffDate = lastVideo?.published_at || new Date().toISOString()
    console.log('⏰ Only processing videos newer than:', cutoffDate)

    // Fetch latest videos
    console.log('🔍 Fetching latest videos from YouTube...')
    const videos = await fetchLatestStreams(10)

    if (!videos || videos.length === 0) {
      console.log('❌ No videos found')
      return NextResponse.json({
        success: true,
        message: 'No new videos found',
        timestamp: new Date().toISOString(),
      })
    }

    const newVideos = []
    const newLessons = []
    let totalEmailsSent = 0
    let totalEmailsFailed = 0

    for (const video of videos) {
      try {
        // Check if video already exists
        const { data: existingVideo } = await supabaseAdmin
          .from('videos')
          .select('youtube_id')
          .eq('youtube_id', video.id)
          .single()

        if (existingVideo) {
          console.log(`⏭️  Video already in database: ${video.title}`)
          continue
        }

        // Only process videos newer than cutoff
        if (new Date(video.publishedAt) <= new Date(cutoffDate)) {
          console.log(`⏭️  Video too old (before ${cutoffDate}): ${video.title}`)
          continue
        }

        console.log(`📺 Processing new video: ${video.title}`)

        // Insert video into database
        const { data: insertedVideo, error: videoError } = await supabaseAdmin
          .from('videos')
          .insert({
            youtube_id: video.id,
            title: video.title,
            description: video.description,
            published_at: video.publishedAt,
            duration: video.duration,
            thumbnail_url: video.thumbnailUrl,
          })
          .select()
          .single()

        if (videoError) {
          console.error(`❌ Error inserting video ${video.id}:`, videoError)
          continue
        }

        newVideos.push(insertedVideo)

        // Get transcript
        console.log(`📝 Fetching transcript for: ${video.title}`)
        const transcript = await getVideoTranscript(video.id)

        if (!transcript || transcript.length < 100) {
          console.log(`⚠️  No transcript available for ${video.title}`)
          continue
        }

        // Update video with transcript
        await supabaseAdmin
          .from('videos')
          .update({ transcript })
          .eq('id', insertedVideo.id)

        // Generate learning content
        console.log(`🤖 Generating lesson content for: ${video.title}`)
        const content = await generateLearningContent(
          transcript,
          video.title,
          video.description || ''
        )

        // Create lesson
        const { data: lesson, error: lessonError } = await supabaseAdmin
          .from('lessons')
          .insert({
            title: content.lessonTitle || video.title,
            video_id: insertedVideo.id,
            summary: content.summary,
            key_themes: content.keyThemes,
            scripture_references: content.scriptureReferences,
            is_published: true,
          })
          .select()
          .single()

        if (lessonError) {
          console.error(`❌ Error creating lesson:`, lessonError)
          continue
        }

        // Create questions
        const questionsToInsert = content.questions.map((q, index) => ({
          lesson_id: lesson.id,
          type: q.type,
          question_text: q.questionText,
          options: q.options || null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          xp_value: q.xpValue || 10,
          order_index: index,
        }))

        const { error: questionsError } = await supabaseAdmin
          .from('questions')
          .insert(questionsToInsert)

        if (questionsError) {
          console.error(`❌ Error creating questions:`, questionsError)
          continue
        }

        newLessons.push(lesson)
        console.log(`✅ Created lesson: ${lesson.title}`)

        // Send email notifications to all users
        console.log(`📧 Sending email notifications...`)
        try {
          // Fetch all user emails from auth.users
          const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
          
          if (usersError) {
            console.error('❌ Error fetching users for email:', usersError)
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
              
              console.log(`   ✅ Sent ${emailResult.sent} emails, ${emailResult.failed} failed`)
            } else {
              console.log('   ⚠️  No user emails found')
            }
          } else {
            console.log('   ℹ️  No registered users yet')
          }
        } catch (emailError: any) {
          console.error('❌ Error sending emails:', emailError)
        }

        // Mark video as processed
        await supabaseAdmin
          .from('videos')
          .update({ processed: true })
          .eq('id', insertedVideo.id)

      } catch (error: any) {
        console.error(`❌ Error processing video ${video.id}:`, error)
        continue
      }
    }

    console.log('🎉 Manual processing complete!')
    console.log(`   📺 New videos: ${newVideos.length}`)
    console.log(`   📚 Lessons created: ${newLessons.length}`)
    console.log(`   📧 Emails sent: ${totalEmailsSent}, failed: ${totalEmailsFailed}`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      newVideosFound: newVideos.length,
      lessonsCreated: newLessons.length,
      emailsSent: totalEmailsSent,
      emailsFailed: totalEmailsFailed,
      videos: newVideos.map(v => ({ id: v.id, title: v.title })),
      lessons: newLessons.map(l => ({ id: l.id, title: l.title })),
    })

  } catch (error: any) {
    console.error('❌ Error in manual processing:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
