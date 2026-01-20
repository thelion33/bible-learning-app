/**
 * YouTube API Client
 * Handles video fetching and transcript extraction
 */

import { google, youtube_v3 } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  duration: number // in seconds
}

/**
 * Fetch latest completed live streams from Revival Today Church
 */
export async function fetchLatestStreams(maxResults = 10): Promise<YouTubeVideo[]> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      channelId: CHANNEL_ID,
      eventType: 'completed',
      type: ['video'],
      order: 'date',
      maxResults,
    })

    const videos = response.data.items || []
    const videoIds = videos
      .map((v) => v.id?.videoId)
      .filter((id): id is string => !!id)

    if (videoIds.length === 0) {
      return []
    }

    // Get additional details including duration
    const detailsResponse = await youtube.videos.list({
      part: ['contentDetails', 'snippet'],
      id: videoIds,
    })

    const detailedVideos = detailsResponse.data.items || []

    return detailedVideos.map((video) => ({
      id: video.id!,
      title: video.snippet?.title || 'Untitled',
      description: video.snippet?.description || '',
      publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
      duration: parseDuration(video.contentDetails?.duration || 'PT0S'),
    }))
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    throw error
  }
}

/**
 * Get video details by ID
 */
export async function getVideoById(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId],
    })

    const video = response.data.items?.[0]
    if (!video) return null

    return {
      id: video.id!,
      title: video.snippet?.title || 'Untitled',
      description: video.snippet?.description || '',
      publishedAt: video.snippet?.publishedAt || new Date().toISOString(),
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
      duration: parseDuration(video.contentDetails?.duration || 'PT0S'),
    }
  } catch (error) {
    console.error('Error fetching video details:', error)
    return null
  }
}

/**
 * Get video transcript/captions
 * Note: YouTube API doesn't directly provide transcripts.
 * You'll need to use youtube-transcript library or similar
 */
export async function getVideoTranscript(videoId: string): Promise<string> {
  // TODO: Implement transcript fetching with youtube-transcript library
  // For now, return a sample transcript for demonstration
  console.warn('Using sample transcript for video:', videoId)
  
  return `This is a powerful message about prayer and fasting. 
  
  The speaker discusses the importance of seeking God through prayer and fasting, emphasizing that these spiritual disciplines unlock supernatural breakthroughs in our lives.
  
  Key points covered:
  - Prayer is our direct communication with God
  - Fasting demonstrates our hunger for more of God
  - When we fast and pray, we position ourselves for breakthrough
  - God responds to those who seek Him with their whole heart
  
  The message includes references to:
  - Matthew 17:21 - "This kind does not go out except by prayer and fasting"
  - Acts 13:2 - The church leaders fasted and the Holy Spirit spoke
  - Daniel 10 - Daniel's three-week fast brought angelic breakthrough
  
  The speaker emphasizes that prayer and fasting are not just religious activities, but powerful weapons in spiritual warfare. Through these disciplines, believers can break through demonic strongholds, receive clear direction from God, and experience miraculous provision.
  
  The call to action is to commit to regular times of prayer and fasting, making it a lifestyle rather than just an occasional practice.`
}

/**
 * Parse YouTube duration format (PT1H2M10S) to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Format seconds to readable duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
