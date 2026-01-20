/**
 * API Route: Process video with OpenAI
 * 
 * Takes a video ID, gets transcript, and generates learning content
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateLearningContent } from '@/lib/openai'
import { getVideoTranscript } from '@/lib/youtube'
import { createClient } from '@supabase/supabase-js'

// Use service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    console.log(`🎬 Processing video: ${videoId}`)

    // Get video from database
    const { data: video, error: videoError} = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    if (video.processed) {
      return NextResponse.json({
        message: 'Video already processed',
        videoId,
      })
    }

    // Get transcript
    console.log('📝 Fetching transcript...')
    let transcript = video.transcript
    
    if (!transcript) {
      transcript = await getVideoTranscript(video.youtube_id)
      
      // Update video with transcript
      await supabaseAdmin
        .from('videos')
        .update({ transcript })
        .eq('id', videoId)
    }

    if (!transcript || transcript.length < 100) {
      return NextResponse.json(
        { error: 'Transcript not available or too short' },
        { status: 400 }
      )
    }

    // Generate content with OpenAI
    console.log('🤖 Generating learning content with AI...')
    const content = await generateLearningContent(
      transcript,
      video.title,
      video.description || ''
    )

    // Create lesson
    console.log('📚 Creating lesson...')
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .insert({
        video_id: videoId,
        title: content.lessonTitle || video.title, // Use AI-generated title, fallback to video title
        summary: content.summary,
        key_themes: content.keyThemes,
        scripture_references: content.scriptureReferences,
        is_published: true,
        order_index: 0,
      })
      .select()
      .single()

    if (lessonError || !lesson) {
      throw new Error(`Failed to create lesson: ${lessonError?.message}`)
    }

    // Create questions
    console.log('❓ Creating questions...')
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

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToCreate)
      .select()

    if (questionsError) {
      throw new Error(`Failed to create questions: ${questionsError.message}`)
    }

    // Mark video as processed
    await supabaseAdmin
      .from('videos')
      .update({ processed: true })
      .eq('id', videoId)

    console.log(`✅ Video processed successfully: ${video.title}`)

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        questionsCount: questions.length,
      },
    })
  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
