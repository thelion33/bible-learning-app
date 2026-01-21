/**
 * Manual trigger for processing videos
 * Use this to manually fetch and process new videos
 */

import { NextResponse } from 'next/server'
import { fetchLatestStreams } from '@/lib/youtube'
import { generateLearningContent } from '@/lib/openai'
import { getVideoTranscript } from '@/lib/youtube'
import { createClient } from '@supabase/supabase-js'

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

    for (const video of videos) {
      try {
        // Check if video already exists
        const { data: existingVideo } = await supabaseAdmin
          .from('videos')
          .select('youtube_id')
          .eq('youtube_id', video.youtube_id)
          .single()

        if (existingVideo) {
          console.log(`⏭️  Video already in database: ${video.title}`)
          continue
        }

        // Only process videos newer than cutoff
        if (new Date(video.published_at) <= new Date(cutoffDate)) {
          console.log(`⏭️  Video too old (before ${cutoffDate}): ${video.title}`)
          continue
        }

        console.log(`📺 Processing new video: ${video.title}`)

        // Insert video into database
        const { data: insertedVideo, error: videoError } = await supabaseAdmin
          .from('videos')
          .insert({
            youtube_id: video.youtube_id,
            title: video.title,
            description: video.description,
            published_at: video.published_at,
            duration: video.duration,
            thumbnail_url: video.thumbnail_url,
            channel_id: video.channel_id,
            view_count: video.view_count,
          })
          .select()
          .single()

        if (videoError) {
          console.error(`❌ Error inserting video ${video.youtube_id}:`, videoError)
          continue
        }

        newVideos.push(insertedVideo)

        // Get transcript
        console.log(`📝 Fetching transcript for: ${video.title}`)
        const transcript = await getVideoTranscript(video.youtube_id)

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
          question_text: q.question,
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

        // Mark video as processed
        await supabaseAdmin
          .from('videos')
          .update({ processed: true })
          .eq('id', insertedVideo.id)

      } catch (error: any) {
        console.error(`❌ Error processing video ${video.youtube_id}:`, error)
        continue
      }
    }

    console.log('🎉 Manual processing complete!')
    console.log(`   📺 New videos: ${newVideos.length}`)
    console.log(`   📚 Lessons created: ${newLessons.length}`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      newVideosFound: newVideos.length,
      lessonsCreated: newLessons.length,
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
