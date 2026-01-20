/**
 * Cron Job: Fetch new YouTube videos from Revival Today Church
 * 
 * This script should run hourly to check for new sermon videos
 * and add them to the database for processing.
 */

import { google } from 'googleapis'
import { supabase } from '../lib/supabase'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

async function fetchLatestVideos() {
  try {
    console.log('🔍 Checking for new videos...')

    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: process.env.YOUTUBE_CHANNEL_ID,
      eventType: 'completed', // Only get completed live streams
      type: ['video'],
      order: 'date',
      maxResults: 10,
    })

    const videos = response.data.items || []
    console.log(`📹 Found ${videos.length} recent videos`)

    for (const video of videos) {
      const videoId = video.id?.videoId
      if (!videoId) continue

      // Check if video already exists
      const { data: existing } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', videoId)
        .single()

      if (existing) {
        console.log(`⏭️  Skipping existing video: ${video.snippet?.title}`)
        continue
      }

      // Insert new video
      const { error } = await supabase.from('videos').insert({
        youtube_id: videoId,
        title: video.snippet?.title || 'Untitled',
        description: video.snippet?.description || '',
        published_at: video.snippet?.publishedAt,
        thumbnail_url: video.snippet?.thumbnails?.high?.url || '',
        processed: false,
      })

      if (error) {
        console.error(`❌ Error inserting video ${videoId}:`, error)
      } else {
        console.log(`✅ Added new video: ${video.snippet?.title}`)
      }
    }

    console.log('✨ Video fetch complete!')
  } catch (error) {
    console.error('❌ Error fetching videos:', error)
    throw error
  }
}

// Run the script
fetchLatestVideos()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
