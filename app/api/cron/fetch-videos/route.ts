/**
 * API Route: Fetch new YouTube videos
 * 
 * This should be called by a cron job (Railway Cron or similar)
 * to automatically check for new sermon videos
 */

import { NextResponse } from 'next/server'
import { fetchLatestStreams } from '@/lib/youtube'
import { createClient } from '@supabase/supabase-js'

// Use service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // For now, we'll allow it, but in production you should verify
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching latest videos from YouTube...')
    
    const videos = await fetchLatestStreams(10)
    const newVideos: string[] = []
    const existingVideos: string[] = []

    for (const video of videos) {
      // Check if video already exists
      const { data: existing } = await supabaseAdmin
        .from('videos')
        .select('id')
        .eq('youtube_id', video.id)
        .single()
      
      if (existing) {
        existingVideos.push(video.title)
        continue
      }

      // Create new video record using admin client
      const { error: insertError } = await supabaseAdmin
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

      if (insertError) {
        console.error(`Error inserting video ${video.id}:`, insertError)
        continue
      }

      newVideos.push(video.title)
      console.log(`✅ Added new video: ${video.title}`)
    }

    return NextResponse.json({
      success: true,
      newVideos: newVideos.length,
      existingVideos: existingVideos.length,
      details: {
        new: newVideos,
        existing: existingVideos,
      },
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error },
      { status: 500 }
    )
  }
}
